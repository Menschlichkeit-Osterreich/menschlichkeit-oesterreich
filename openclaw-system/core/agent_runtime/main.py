"""
OpenClaw Agent-Runtime
=======================
Asyncio-basierter Agent-Loop für alle 6 Rollen.
Implementiert: CLAIM_TASK → PLAN → ACT → EVAL → COMMIT → DONE

Port: 9100
"""

import asyncio
import json
import os
import time
import uuid
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional

import asyncpg
import httpx
import nats
import redis.asyncio as aioredis
import structlog
import yaml
from fastapi import FastAPI
from pydantic import BaseModel

# ─── Logging ──────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# ─── Konfiguration ────────────────────────────────────────
from .secrets_provider import get_secret

NATS_URL = os.getenv("OC_NATS_URL", "nats://localhost:4222")
REDIS_URL = get_secret("OC_REDIS_URL", "redis://localhost:6380", bsm_key="openclaw/OC_REDIS_URL")
PG_DSN = get_secret("OC_PG_DSN", "postgresql://oc:oc_dev_only@localhost:55432/oc", bsm_key="openclaw/OC_PG_DSN")
QDRANT_URL = os.getenv("OC_QDRANT_URL", "http://localhost:6333")
TOOL_GW_URL = os.getenv("OC_TOOL_GATEWAY_URL", "http://localhost:9101")
OPENAI_API_KEY = get_secret("OC_OPENAI_API_KEY", bsm_key="openclaw/OC_OPENAI_API_KEY") or get_secret("OPENAI_API_KEY", bsm_key="openclaw/OPENAI_API_KEY")
DEFAULT_MODEL = os.getenv("OC_DEFAULT_MODEL", "gpt-4.1-mini")
FALLBACK_MODEL = os.getenv("OC_FALLBACK_MODEL", "gpt-4.1-nano")
MAX_TOOL_CALLS = int(os.getenv("OC_MAX_TOOL_CALLS", "20"))
MAX_MINUTES = float(os.getenv("OC_MAX_MINUTES", "15"))
MAX_COST_EUR = float(os.getenv("OC_MAX_COST_EUR", "0.20"))

# Rollen-Konfiguration laden
ROLES_PATH = Path("/app/configs/agent_roles.yaml")
if not ROLES_PATH.exists():
    ROLES_PATH = Path(__file__).parent.parent.parent / "configs" / "agent_roles.yaml"

with open(ROLES_PATH) as f:
    ROLES_CONFIG = yaml.safe_load(f)

# ─── Enums & Modelle ──────────────────────────────────────
class AgentStatus(str, Enum):
    IDLE = "IDLE"
    CLAIM_TASK = "CLAIM_TASK"
    PLAN = "PLAN"
    ACT = "ACT"
    EVAL = "EVAL"
    COMMIT = "COMMIT"
    DONE = "DONE"
    RETRY_BACKOFF = "RETRY_BACKOFF"
    ESCALATE = "ESCALATE"
    DEADLETTER = "DEADLETTER"

class AgentRole(str, Enum):
    ORCHESTRATOR = "orchestrator"
    RESEARCH = "research"
    BUILDER = "builder"
    QA = "qa"
    AUTOMATION = "automation"
    MONETIZATION = "monetization"

class Budget:
    def __init__(self):
        self.tool_calls = 0
        self.start_time = time.monotonic()
        self.cost_eur = 0.0

    def check(self) -> tuple[bool, str]:
        if self.tool_calls >= MAX_TOOL_CALLS:
            return False, f"Tool-Budget erschöpft ({MAX_TOOL_CALLS} Calls)"
        elapsed = (time.monotonic() - self.start_time) / 60
        if elapsed >= MAX_MINUTES:
            return False, f"Zeit-Budget erschöpft ({MAX_MINUTES} Minuten)"
        if self.cost_eur >= MAX_COST_EUR:
            return False, f"Kosten-Budget erschöpft ({MAX_COST_EUR} EUR)"
        return True, ""

# ─── LLM-Client ───────────────────────────────────────────
async def llm_call(system_prompt: str, user_message: str,
                   model: str = DEFAULT_MODEL) -> str:
    """Ruft das LLM auf und gibt die Antwort zurück."""
    if not OPENAI_API_KEY:
        # Fallback: Strukturierte Dummy-Antwort für Tests
        return json.dumps({
            "plan": [{"step": 1, "role": "research", "task": user_message[:100]}],
            "success_criteria": ["Task completed"],
        })
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            }
        )
        data = resp.json()
        return data["choices"][0]["message"]["content"]

# ─── Tool-Gateway-Client ──────────────────────────────────
async def call_tool(tool: str, args: dict, agent_id: str, role: str,
                    task_id: str, budget: Budget) -> dict:
    """Ruft ein Tool über das Gateway auf."""
    ok, reason = budget.check()
    if not ok:
        return {"success": False, "error": f"Budget: {reason}"}
    
    budget.tool_calls += 1
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{TOOL_GW_URL}/tool/call",
            json={
                "tool": tool,
                "args": args,
                "agent_id": agent_id,
                "agent_role": role,
                "task_id": task_id,
            }
        )
        return resp.json()

# ─── Agent-Klasse ─────────────────────────────────────────
class Agent:
    def __init__(self, role: AgentRole, db_pool: asyncpg.Pool,
                 redis: aioredis.Redis, nc: nats.aio.client.Client):
        self.role = role
        self.agent_id = f"{role.value}-{uuid.uuid4().hex[:8]}"
        self.db = db_pool
        self.redis = redis
        self.nc = nc
        self.status = AgentStatus.IDLE
        self.role_config = ROLES_CONFIG.get("agents", {}).get(role.value, {})
        self.system_prompt = self.role_config.get("system_prompt", "")
        self.model = self.role_config.get("model", DEFAULT_MODEL)
        self.log = log.bind(agent_id=self.agent_id, role=role.value)

    async def run(self):
        """Haupt-Agent-Loop: Wartet auf Tasks und verarbeitet sie."""
        self.log.info("agent_started")
        subject = f"oc.tasks.{self.role.value}.queue"
        
        # JetStream Consumer
        try:
            js = self.nc.jetstream()
            sub = await js.subscribe(subject, durable=f"oc-{self.role.value}")
            async for msg in sub.messages:
                await self.process_message(msg)
        except Exception as e:
            self.log.error("agent_loop_error", error=str(e))
            # Fallback: Polling
            await self.poll_loop()

    async def poll_loop(self):
        """Fallback-Polling wenn NATS nicht verfügbar."""
        while True:
            try:
                task = await self.claim_task()
                if task:
                    await self.execute_task(task)
                else:
                    await asyncio.sleep(5)
            except Exception as e:
                self.log.error("poll_error", error=str(e))
                await asyncio.sleep(10)

    async def claim_task(self) -> Optional[dict]:
        """Holt einen Task aus der Datenbank."""
        row = await self.db.fetchrow(
            """UPDATE oc_tasks SET status='CLAIM_TASK', agent_id=$1, updated_at=NOW()
               WHERE task_id = (
                   SELECT task_id FROM oc_tasks
                   WHERE status='IDLE' AND role_target=$2
                   ORDER BY priority DESC, created_at ASC
                   LIMIT 1
                   FOR UPDATE SKIP LOCKED
               ) RETURNING *""",
            self.agent_id, self.role.value
        )
        return dict(row) if row else None

    async def process_message(self, msg):
        """Verarbeitet eine NATS-Nachricht."""
        try:
            task = json.loads(msg.data.decode())
            await self.execute_task(task)
            await msg.ack()
        except Exception as e:
            self.log.error("message_processing_error", error=str(e))
            await msg.nak()

    async def execute_task(self, task: dict):
        """Führt einen Task durch den vollständigen Agent-Loop aus."""
        task_id = task.get("task_id", str(uuid.uuid4()))
        budget = Budget()
        
        self.log.info("task_started", task_id=task_id, title=task.get("title"))
        
        try:
            # PLAN
            await self.update_status(task_id, AgentStatus.PLAN)
            plan = await self.plan(task, budget)
            
            # ACT
            await self.update_status(task_id, AgentStatus.ACT)
            results = await self.act(task, plan, budget)
            
            # EVAL
            await self.update_status(task_id, AgentStatus.EVAL)
            eval_result = await self.evaluate(task, results, budget)
            
            # COMMIT
            await self.update_status(task_id, AgentStatus.COMMIT)
            await self.commit_memory(task_id, eval_result)
            
            # DONE
            await self.update_status(task_id, AgentStatus.DONE,
                                     result=eval_result.get("summary", ""))
            
            # Event publizieren
            await self.publish_event("task.completed", task_id, {
                "result": eval_result,
                "tool_calls": budget.tool_calls,
                "cost_eur": budget.cost_eur,
            })
            
            self.log.info("task_completed", task_id=task_id,
                         tool_calls=budget.tool_calls, cost=budget.cost_eur)
        
        except Exception as e:
            self.log.error("task_failed", task_id=task_id, error=str(e))
            await self.handle_failure(task_id, task, str(e))

    async def plan(self, task: dict, budget: Budget) -> dict:
        """Erstellt einen Ausführungsplan via LLM."""
        prompt = f"""Task: {task.get('title')}
Objective: {task.get('objective')}
Inputs: {json.dumps(task.get('inputs', {}))}
Constraints: {json.dumps(task.get('constraints', {}))}

Erstelle einen JSON-Plan mit den Schritten zur Erledigung dieses Tasks.
Antworte NUR mit JSON: {{"steps": [{{"action": "...", "tool": "...", "args": {{}}}}]}}"""
        
        response = await llm_call(self.system_prompt, prompt, self.model)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"steps": [{"action": "direct_response", "tool": None}]}

    async def act(self, task: dict, plan: dict, budget: Budget) -> list:
        """Führt die geplanten Schritte aus."""
        results = []
        for step in plan.get("steps", []):
            ok, reason = budget.check()
            if not ok:
                self.log.warning("budget_stop", reason=reason)
                break
            
            tool = step.get("tool")
            if tool:
                result = await call_tool(
                    tool, step.get("args", {}),
                    self.agent_id, self.role.value,
                    task.get("task_id", ""), budget
                )
                results.append({"step": step, "result": result})
        
        return results

    async def evaluate(self, task: dict, results: list, budget: Budget) -> dict:
        """Bewertet die Ergebnisse und erstellt eine Zusammenfassung."""
        prompt = f"""Task: {task.get('title')}
Ergebnisse: {json.dumps(results[:5])}

Bewerte die Ergebnisse und erstelle eine Zusammenfassung.
Antworte mit JSON: {{"qa_score": 0-100, "summary": "...", "issues": []}}"""
        
        response = await llm_call(self.system_prompt, prompt, FALLBACK_MODEL)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"qa_score": 70, "summary": "Task abgeschlossen", "issues": []}

    async def commit_memory(self, task_id: str, eval_result: dict):
        """Speichert wichtige Erkenntnisse im Langzeitgedächtnis."""
        if eval_result.get("qa_score", 0) >= 60:
            await self.db.execute(
                """INSERT INTO oc_memory_notes (agent_id, task_id, content, tags)
                   VALUES ($1, $2, $3, $4)""",
                self.agent_id, task_id,
                eval_result.get("summary", ""),
                [self.role.value, "task_result"]
            )

    async def handle_failure(self, task_id: str, task: dict, error: str):
        """Behandelt Fehler mit Retry-Backoff oder Deadletter."""
        retry_count = task.get("retry_count", 0)
        if retry_count < 3:
            wait = 2 ** retry_count * 5  # 5, 10, 20 Sekunden
            await self.db.execute(
                """UPDATE oc_tasks SET status='RETRY_BACKOFF', retry_count=retry_count+1,
                   error_message=$1, updated_at=NOW() WHERE task_id=$2""",
                error, task_id
            )
            await asyncio.sleep(wait)
            await self.db.execute(
                "UPDATE oc_tasks SET status='IDLE' WHERE task_id=$1", task_id
            )
        else:
            await self.db.execute(
                """UPDATE oc_tasks SET status='DEADLETTER', error_message=$1,
                   updated_at=NOW() WHERE task_id=$2""",
                error, task_id
            )
            await self.publish_event("task.deadletter", task_id, {"error": error})

    async def update_status(self, task_id: str, status: AgentStatus,
                            result: str = None):
        await self.db.execute(
            """UPDATE oc_tasks SET status=$1, result_summary=$2, updated_at=NOW()
               WHERE task_id=$3""",
            status.value, result, task_id
        )

    async def publish_event(self, event_type: str, task_id: str, payload: dict):
        event = {
            "event_id": str(uuid.uuid4()),
            "schema_version": "oc.event.v1",
            "event_type": event_type,
            "ts": datetime.now(timezone.utc).isoformat(),
            "trace_id": str(uuid.uuid4()),
            "source_agent_id": self.agent_id,
            "source_role": self.role.value,
            "task_id": task_id,
            "payload": payload,
        }
        try:
            await self.nc.publish(
                f"oc.events.agent.{self.agent_id}",
                json.dumps(event).encode()
            )
        except Exception:
            pass  # Event-Fehler nicht kritisch

# ─── FastAPI Health-Endpoint ──────────────────────────────
app = FastAPI(title="OpenClaw Agent-Runtime", version="1.0.0")

agents: list[Agent] = []
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[aioredis.Redis] = None
nc: Optional[nats.aio.client.Client] = None

@app.on_event("startup")
async def startup():
    global db_pool, redis_client, nc, agents
    try:
        db_pool = await asyncpg.create_pool(PG_DSN, min_size=2, max_size=10)
        redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
        nc = await nats.connect(NATS_URL)
        
        # Alle 6 Agenten starten
        for role in AgentRole:
            agent = Agent(role, db_pool, redis_client, nc)
            agents.append(agent)
            asyncio.create_task(agent.run())
        
        log.info("agent_runtime_started", agents=len(agents))
    except Exception as e:
        log.error("startup_failed", error=str(e))

@app.on_event("shutdown")
async def shutdown():
    if nc:
        await nc.close()
    if db_pool:
        await db_pool.close()

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "agent-runtime",
        "version": "1.0.0",
        "agents": [{"id": a.agent_id, "role": a.role.value, "status": a.status.value}
                   for a in agents],
    }

@app.post("/task/submit")
async def submit_task(task: dict):
    """Nimmt einen neuen Task entgegen und speichert ihn in der DB."""
    task_id = str(uuid.uuid4())
    await db_pool.execute(
        """INSERT INTO oc_tasks (task_id, title, objective, role_target, inputs, status)
           VALUES ($1, $2, $3, $4, $5, 'IDLE')""",
        task_id,
        task.get("title", "Unbenannter Task"),
        task.get("objective", ""),
        task.get("role", "orchestrator"),
        json.dumps(task.get("inputs", {})),
    )
    return {"task_id": task_id, "status": "submitted"}

@app.get("/task/{task_id}")
async def get_task(task_id: str):
    row = await db_pool.fetchrow("SELECT * FROM oc_tasks WHERE task_id=$1", task_id)
    if not row:
        from fastapi import HTTPException
        raise HTTPException(404, "Task nicht gefunden")
    return dict(row)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9100, log_level="info")

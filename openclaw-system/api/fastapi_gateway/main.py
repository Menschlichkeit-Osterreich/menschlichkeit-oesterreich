"""
OpenClaw Tool-Gateway – FastAPI
================================
Alle Tool-Aufrufe der Agenten laufen ausschließlich über dieses Gateway.
Kein Agent darf direkt auf das System zugreifen.

Port: 9101
"""

import asyncio
import hashlib
import json
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import httpx
import redis.asyncio as aioredis
import yaml
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import asyncpg
import structlog

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
WORKSPACE_ROOT = Path(os.getenv("OC_WORKSPACE_ROOT", "/workspace"))
OC_OUT_ROOT = WORKSPACE_ROOT / "openclaw-system" / "workspace" / "oc_out"
PG_DSN = os.getenv("OC_PG_DSN", "postgresql://oc:oc_dev_only@localhost:55432/oc")
REDIS_URL = os.getenv("OC_REDIS_URL", "redis://localhost:6380")
GITHUB_TOKEN = os.getenv("OC_GITHUB_TOKEN", "")
N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")

# Capabilities laden
CAPS_PATH = Path("/app/configs/capabilities.yaml")
if not CAPS_PATH.exists():
    CAPS_PATH = Path(__file__).parent.parent.parent / "configs" / "capabilities.yaml"

with open(CAPS_PATH) as f:
    CAPABILITIES = yaml.safe_load(f)

# ─── FastAPI App ──────────────────────────────────────────
app = FastAPI(
    title="OpenClaw Tool-Gateway",
    version="1.0.0",
    description="Sicheres Tool-Gateway für das OpenClaw Multi-Agent-System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9100", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── DB-Pool ──────────────────────────────────────────────
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[aioredis.Redis] = None

@app.on_event("startup")
async def startup():
    global db_pool, redis_client
    try:
        db_pool = await asyncpg.create_pool(PG_DSN, min_size=2, max_size=10)
        redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
        OC_OUT_ROOT.mkdir(parents=True, exist_ok=True)
        log.info("tool_gateway_started", workspace=str(WORKSPACE_ROOT))
    except Exception as e:
        log.error("startup_failed", error=str(e))

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()

# ─── Modelle ──────────────────────────────────────────────
class ToolRequest(BaseModel):
    tool: str
    args: dict[str, Any] = Field(default_factory=dict)
    agent_id: str
    agent_role: str
    task_id: Optional[str] = None
    trace_id: Optional[str] = None

class ToolResponse(BaseModel):
    success: bool
    result: Any = None
    error: Optional[str] = None
    duration_ms: int = 0
    tool: str
    audit_id: Optional[str] = None

# ─── Policy-Engine ────────────────────────────────────────
def check_policy(role: str, tool: str, args: dict) -> tuple[bool, str]:
    """Prüft ob eine Rolle ein Tool verwenden darf."""
    role_caps = CAPABILITIES.get("roles", {}).get(role, {})
    allowed = role_caps.get("allowed_tools", [])
    
    # Globale Verbote
    forbidden = CAPABILITIES.get("global", {}).get("forbidden_tools", [])
    if tool in forbidden:
        return False, f"Tool '{tool}' ist global verboten"
    
    if tool not in allowed:
        return False, f"Rolle '{role}' darf Tool '{tool}' nicht verwenden"
    
    # Pfad-Scope prüfen für fs.write
    if tool == "fs.write":
        path = args.get("path", "")
        allowed_roots = CAPABILITIES.get("global", {}).get("write_allowed_roots", [])
        if not any(path.startswith(root) for root in allowed_roots):
            return False, f"Schreibzugriff auf '{path}' nicht erlaubt"
    
    # Domain-Allowlist für http.fetch
    if tool == "http.fetch":
        url = args.get("url", "")
        domain_allowlist = role_caps.get("domain_allowlist", [])
        if domain_allowlist:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            if not any(domain.endswith(d) for d in domain_allowlist):
                return False, f"Domain '{domain}' nicht in der Allowlist"
    
    return True, ""

async def check_rate_limit(agent_id: str, tool: str) -> bool:
    """Rate-Limiting via Redis."""
    if not redis_client:
        return True
    key = f"oc:rate:{agent_id}:{tool}"
    count = await redis_client.incr(key)
    if count == 1:
        await redis_client.expire(key, 60)
    return count <= 60  # 60 Calls/Minute pro Agent+Tool

async def audit_log(req: ToolRequest, status: str, duration_ms: int,
                    result_size: int = 0, error: str = None, denied: bool = False) -> str:
    """Schreibt jeden Tool-Call in die Audit-Tabelle."""
    if not db_pool:
        return ""
    args_hash = hashlib.sha256(json.dumps(req.args, sort_keys=True).encode()).hexdigest()
    # Args redaktieren (Secrets entfernen)
    redacted = {k: "***" if any(s in k.lower() for s in ["token","key","secret","password"]) else v
                for k, v in req.args.items()}
    try:
        row = await db_pool.fetchrow(
            """INSERT INTO oc_tool_calls
               (task_id, agent_id, agent_role, tool_name, args_hash, args_redacted,
                status, duration_ms, result_size, error_message, policy_denied)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
               RETURNING call_id""",
            req.task_id, req.agent_id, req.agent_role, req.tool,
            args_hash, json.dumps(redacted), status, duration_ms,
            result_size, error, denied
        )
        return str(row["call_id"]) if row else ""
    except Exception as e:
        log.error("audit_log_failed", error=str(e))
        return ""

# ─── Tool-Implementierungen ───────────────────────────────
async def tool_fs_read(args: dict) -> Any:
    path = Path(args["path"])
    if not path.is_absolute():
        path = WORKSPACE_ROOT / path
    if not path.exists():
        raise FileNotFoundError(f"Datei nicht gefunden: {path}")
    return path.read_text(encoding="utf-8", errors="replace")

async def tool_fs_list(args: dict) -> Any:
    path = Path(args.get("path", str(WORKSPACE_ROOT)))
    if not path.is_absolute():
        path = WORKSPACE_ROOT / path
    if not path.exists():
        raise FileNotFoundError(f"Verzeichnis nicht gefunden: {path}")
    entries = []
    for item in sorted(path.iterdir()):
        entries.append({
            "name": item.name,
            "type": "dir" if item.is_dir() else "file",
            "size": item.stat().st_size if item.is_file() else None,
        })
    return entries

async def tool_fs_write(args: dict) -> Any:
    path = Path(args["path"])
    if not path.is_absolute():
        path = OC_OUT_ROOT / path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(args["content"], encoding="utf-8")
    return {"written": str(path), "size": len(args["content"])}

async def tool_git_status(args: dict) -> Any:
    repo = args.get("repo", str(WORKSPACE_ROOT))
    result = subprocess.run(
        ["git", "status", "--short"],
        cwd=repo, capture_output=True, text=True, timeout=10
    )
    return result.stdout or "(clean)"

async def tool_git_diff(args: dict) -> Any:
    repo = args.get("repo", str(WORKSPACE_ROOT))
    cmd = ["git", "diff"]
    if args.get("staged"):
        cmd.append("--staged")
    result = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, timeout=15)
    return result.stdout[:50000]  # Max 50k Zeichen

async def tool_git_show(args: dict) -> Any:
    repo = args.get("repo", str(WORKSPACE_ROOT))
    ref = args.get("ref", "HEAD")
    result = subprocess.run(
        ["git", "show", "--stat", ref],
        cwd=repo, capture_output=True, text=True, timeout=10
    )
    return result.stdout[:20000]

async def tool_git_branch_create(args: dict) -> Any:
    repo = args.get("repo", str(WORKSPACE_ROOT))
    branch = args["branch"]
    result = subprocess.run(
        ["git", "checkout", "-b", branch],
        cwd=repo, capture_output=True, text=True, timeout=10
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
    return {"branch": branch, "created": True}

async def tool_git_commit(args: dict) -> Any:
    repo = args.get("repo", str(WORKSPACE_ROOT))
    message = args["message"]
    # Conventional Commits erzwingen
    prefixes = ("feat:", "fix:", "docs:", "style:", "refactor:", "test:", "chore:", "ci:")
    if not any(message.startswith(p) for p in prefixes):
        raise ValueError(f"Commit-Message muss mit Conventional Commit Prefix beginnen: {prefixes}")
    subprocess.run(["git", "add", "-A"], cwd=repo, timeout=10)
    result = subprocess.run(
        ["git", "commit", "-m", message],
        cwd=repo, capture_output=True, text=True, timeout=15
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
    return {"committed": True, "message": message}

async def tool_git_pr_prepare(args: dict) -> Any:
    """Bereitet PR-Artefakte vor (kein Remote-Push ohne expliziten Token)."""
    title = args["title"]
    body = args.get("body", "")
    branch = args.get("branch", "")
    pr_file = OC_OUT_ROOT / f"pr_{int(time.time())}.md"
    pr_file.write_text(f"# {title}\n\n{body}\n\nBranch: `{branch}`\n")
    return {"pr_draft": str(pr_file), "title": title}

async def tool_http_fetch(args: dict) -> Any:
    url = args["url"]
    method = args.get("method", "GET").upper()
    headers = args.get("headers", {})
    if GITHUB_TOKEN and "github.com" in url:
        headers.setdefault("Authorization", f"token {GITHUB_TOKEN}")
        headers.setdefault("User-Agent", "OpenClaw-MO/1.0")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.request(method, url, headers=headers,
                                    json=args.get("body"))
        return {"status": resp.status_code, "body": resp.text[:20000]}

async def tool_db_query_readonly(args: dict) -> Any:
    if not db_pool:
        raise RuntimeError("Datenbank nicht verfügbar")
    query = args["query"]
    # Nur SELECT erlauben
    q = query.strip().upper()
    if not q.startswith("SELECT") and not q.startswith("WITH"):
        raise ValueError("Nur SELECT-Abfragen erlaubt")
    rows = await db_pool.fetch(query, *args.get("params", []))
    return [dict(r) for r in rows]

async def tool_n8n_get_status(args: dict) -> Any:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{N8N_URL}/healthz")
        return {"status": resp.status_code, "healthy": resp.status_code == 200}

async def tool_n8n_trigger_webhook(args: dict) -> Any:
    webhook_id = args["webhook_id"]
    payload = args.get("payload", {})
    # Nur vordefinierte Webhooks erlauben (entspricht automation/n8n/workflows/)
    allowed_webhooks = [
        # Mitglieder & CRM
        "new-member",
        "crm-member-management",
        "crm-sync-members",
        "onboarding-welcome-series",
        # Finanzen
        "new-donation",
        "finance-donation-processing",
        "finance-dunning",
        "finance-invoicing",
        "finance-membership-invoicing",
        "finance-payment-confirmation",
        "finance-sepa-export",
        "Stripe_Webhook_to_CiviCRM_Contribution",
        # Events & Forum
        "mo-events",
        "events-reminder",
        "forum-moderation",
        "forum-viral",
        # System & Betrieb
        "daily-report",
        "dashboard-etl-stripe-civicrm",
        "build-pipeline-automation",
        "plesk-deployment-notifications",
        "queue-monitor",
        "dlq-admin",
        "WebhookQueue_Processor",
        "mail-archiver-logging",
        # DSGVO
        "right-to-erasure",
        "right-to-erasure-fixed",
        # Social & Kommunikation
        "social-media-crosspost",
        "openclaw-bridge",
    ]
    if webhook_id not in allowed_webhooks:
        raise ValueError(f"Webhook '{webhook_id}' nicht in der Whitelist")
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{N8N_URL}/webhook/{webhook_id}", json=payload)
        return {"status": resp.status_code, "response": resp.text[:1000]}

async def tool_ci_run_local(args: dict) -> Any:
    command = args["command"]
    allowed = ["ruff check .", "pytest", "mypy .", "ruff format --check ."]
    if not any(command.startswith(a) for a in allowed):
        raise ValueError(f"Befehl '{command}' nicht in der CI-Whitelist")
    result = subprocess.run(
        command.split(), cwd=str(WORKSPACE_ROOT),
        capture_output=True, text=True, timeout=120
    )
    return {
        "returncode": result.returncode,
        "stdout": result.stdout[:10000],
        "stderr": result.stderr[:5000],
        "passed": result.returncode == 0,
    }

# Tool-Registry
TOOLS: dict[str, Any] = {
    "fs.read": tool_fs_read,
    "fs.list": tool_fs_list,
    "fs.write": tool_fs_write,
    "git.status": tool_git_status,
    "git.diff": tool_git_diff,
    "git.show": tool_git_show,
    "git.branch_create": tool_git_branch_create,
    "git.commit": tool_git_commit,
    "git.pr_prepare": tool_git_pr_prepare,
    "http.fetch": tool_http_fetch,
    "db.query_readonly": tool_db_query_readonly,
    "n8n.get_status": tool_n8n_get_status,
    "n8n.trigger_webhook": tool_n8n_trigger_webhook,
    "ci.run_local": tool_ci_run_local,
}

# ─── Endpoints ────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "tool-gateway", "version": "1.0.0",
            "tools_available": list(TOOLS.keys())}

@app.get("/tools")
async def list_tools():
    return {"tools": list(TOOLS.keys())}

@app.get("/capabilities/{role}")
async def get_capabilities(role: str):
    caps = CAPABILITIES.get("roles", {}).get(role)
    if not caps:
        raise HTTPException(404, f"Rolle '{role}' nicht gefunden")
    return caps

@app.post("/tool/call", response_model=ToolResponse)
async def call_tool(req: ToolRequest):
    start = time.monotonic()
    
    # Rate-Limit prüfen
    if not await check_rate_limit(req.agent_id, req.tool):
        audit_id = await audit_log(req, "denied", 0, denied=True,
                                    error="Rate-Limit überschritten")
        raise HTTPException(429, "Rate-Limit überschritten")
    
    # Policy prüfen
    allowed, reason = check_policy(req.agent_role, req.tool, req.args)
    if not allowed:
        duration = int((time.monotonic() - start) * 1000)
        audit_id = await audit_log(req, "denied", duration, denied=True, error=reason)
        log.warning("tool_denied", tool=req.tool, role=req.agent_role, reason=reason)
        raise HTTPException(403, f"Policy-Verletzung: {reason}")
    
    # Tool nicht gefunden
    if req.tool not in TOOLS:
        raise HTTPException(404, f"Tool '{req.tool}' nicht implementiert")
    
    # Tool ausführen
    try:
        result = await TOOLS[req.tool](req.args)
        duration = int((time.monotonic() - start) * 1000)
        result_size = len(json.dumps(result)) if result else 0
        audit_id = await audit_log(req, "success", duration, result_size)
        log.info("tool_called", tool=req.tool, agent=req.agent_id,
                 duration_ms=duration, result_size=result_size)
        return ToolResponse(success=True, result=result, duration_ms=duration,
                           tool=req.tool, audit_id=audit_id)
    except Exception as e:
        duration = int((time.monotonic() - start) * 1000)
        audit_id = await audit_log(req, "error", duration, error=str(e))
        log.error("tool_error", tool=req.tool, error=str(e))
        return ToolResponse(success=False, error=str(e), duration_ms=duration,
                           tool=req.tool, audit_id=audit_id)

@app.get("/metrics")
async def metrics():
    """Prometheus-kompatible Metriken (vereinfacht)."""
    if not db_pool:
        return {"error": "DB nicht verfügbar"}
    rows = await db_pool.fetch(
        "SELECT tool_name, status, COUNT(*) as count FROM oc_tool_calls GROUP BY tool_name, status"
    )
    lines = ["# HELP oc_tool_calls_total Total tool calls by tool and status",
             "# TYPE oc_tool_calls_total counter"]
    for r in rows:
        lines.append(f'oc_tool_calls_total{{tool="{r["tool_name"]}",status="{r["status"]}"}} {r["count"]}')
    return "\n".join(lines)

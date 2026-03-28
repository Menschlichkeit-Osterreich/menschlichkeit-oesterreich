"""
OpenClaw Tool-Gateway – FastAPI
================================
Alle Tool-Aufrufe der Agenten laufen ausschließlich über dieses Gateway.
Kein Agent darf direkt auf das System zugreifen.

Port: 9101
"""

import asyncio
import hashlib
import hmac
import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import httpx
import redis.asyncio as aioredis
import sqlparse
import yaml
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import asyncpg
import structlog

# ─── OpenTelemetry (P3-1) ────────────────────────────────
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import Resource

_otel_resource = Resource.create({"service.name": "oc-tool-gateway", "service.version": "1.0.0"})
_tracer_provider = TracerProvider(resource=_otel_resource)

# OTLP-Exporter wenn Endpoint konfiguriert, sonst Console
_otel_endpoint = os.getenv("OTEL_ENDPOINT", "")
if _otel_endpoint:
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    _tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=_otel_endpoint)))
else:
    _tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

trace.set_tracer_provider(_tracer_provider)
tracer = trace.get_tracer("oc.tool_gateway")

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

WORKSPACE_ROOT = Path(os.getenv("OC_WORKSPACE_ROOT", "/workspace"))
OC_OUT_ROOT = WORKSPACE_ROOT / "openclaw-system" / "workspace" / "oc_out"
PG_DSN = get_secret("OC_PG_DSN", "postgresql://oc:oc_dev_only@localhost:55432/oc", bsm_key="openclaw/OC_PG_DSN")
REDIS_URL = get_secret("OC_REDIS_URL", "redis://localhost:6380", bsm_key="openclaw/OC_REDIS_URL")
GITHUB_TOKEN = get_secret("OC_GITHUB_TOKEN", "", bsm_key="openclaw/OC_GITHUB_TOKEN")
N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")
N8N_WEBHOOK_SECRET = get_secret("N8N_WEBHOOK_SECRET", "", bsm_key="openclaw/N8N_WEBHOOK_SECRET")

# Capabilities laden
CAPS_PATH = Path("/app/configs/capabilities.yaml")
if not CAPS_PATH.exists():
    CAPS_PATH = Path(__file__).parent.parent.parent / "configs" / "capabilities.yaml"

with open(CAPS_PATH) as f:
    CAPABILITIES = yaml.safe_load(f)

# O(1)-Whitelist aus capabilities.yaml – Neustart erforderlich bei Änderungen
ALLOWED_WEBHOOKS: frozenset[str] = frozenset(
    CAPABILITIES.get("webhooks", {}).get("allowed", [])
)

# Kompiliertes Regex für Audit-Log-Redaktion sensitiver Args-Keys
_SENSITIVE_KEY_RE = re.compile(r"token|key|secret|password", re.IGNORECASE)

# ─── SQL-Validierung (P0-1) ──────────────────────────────
_SQL_FORBIDDEN_KEYWORDS = frozenset({
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE",
    "GRANT", "REVOKE", "COPY", "EXECUTE", "EXEC", "CALL",
})


def validate_readonly_query(query: str) -> bool:
    """Prüft via sqlparse-AST, dass query NUR aus SELECT/WITH-Statements besteht.

    Blockt:
      - Stacked queries (SELECT 1; DROP TABLE x)
      - DML/DDL getarnt als SELECT-Prefix
      - Semicolons innerhalb des Statements
    """
    try:
        parsed = sqlparse.parse(query)
    except Exception:
        return False

    if not parsed:
        return False

    for stmt in parsed:
        # Leere Statements ignorieren (trailing semicolons)
        if not stmt.tokens or str(stmt).strip() == "":
            continue

        # Statement-Typ bestimmen
        stmt_type = stmt.get_type()
        if stmt_type not in ("SELECT", "UNKNOWN"):
            # UNKNOWN kann bei WITH ... SELECT auftreten
            return False

        # Zusätzlich: alle Tokens auf verbotene Keywords scannen
        flat = [
            t.ttype and t.normalized
            for t in stmt.flatten()
            if t.ttype in (sqlparse.tokens.Keyword, sqlparse.tokens.Keyword.DDL,
                           sqlparse.tokens.Keyword.DML)
        ]
        if any(kw in _SQL_FORBIDDEN_KEYWORDS for kw in flat if kw):
            return False

    return True


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

# P3-1: FastAPI Auto-Instrumentation
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
FastAPIInstrumentor.instrument_app(app)

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
        # P2-1: Audit-Log Partitionen erstellen und alte bereinigen
        await _ensure_audit_partitions()
        log.info("tool_gateway_started", workspace=str(WORKSPACE_ROOT))
    except Exception as e:
        log.error("startup_failed", error=str(e))


async def _ensure_audit_partitions():
    """Erstellt kommende Partitionen und bereinigt abgelaufene (P2-1)."""
    if not db_pool:
        return
    try:
        await db_pool.execute("SELECT oc_ensure_partitions()")
        retention = CAPABILITIES.get("audit", {}).get("retention_days", 90)
        dropped = await db_pool.fetchval("SELECT oc_cleanup_old_partitions($1)", retention)
        if dropped:
            log.info("audit_partitions_cleaned", dropped=dropped)
    except Exception as e:
        log.warning("audit_partition_setup_skipped", error=str(e))

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
    """Rate-Limiting via Redis. Fail-closed: bei Redis-Ausfall werden Calls abgelehnt."""
    if not redis_client:
        log.warning("rate_limit_no_redis", agent_id=agent_id, tool=tool)
        return False  # P0-3: Fail-closed statt fail-open
    try:
        key = f"oc:rate:{agent_id}:{tool}"
        count = await redis_client.incr(key)
        if count == 1:
            await redis_client.expire(key, 60)
        return count <= 60  # 60 Calls/Minute pro Agent+Tool
    except Exception as e:
        log.warning("rate_limit_redis_error", error=str(e), agent_id=agent_id, tool=tool)
        return False  # Fail-closed bei Redis-Fehlern

async def audit_log(req: ToolRequest, status: str, duration_ms: int,
                    result_size: int = 0, error: str = None, denied: bool = False) -> str:
    """Schreibt jeden Tool-Call in die Audit-Tabelle."""
    if not db_pool:
        return ""
    args_hash = hashlib.sha256(json.dumps(req.args, sort_keys=True).encode()).hexdigest()
    # Args redaktieren (Secrets entfernen) – _SENSITIVE_KEY_RE ist module-level kompiliert
    redacted = {k: "***" if _SENSITIVE_KEY_RE.search(k) else v for k, v in req.args.items()}
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
    # P0-2: Path Traversal Protection – resolve() + relative_to() Containment
    resolved = Path(os.path.realpath(path))
    sandbox = Path(os.path.realpath(OC_OUT_ROOT))
    try:
        resolved.relative_to(sandbox)
    except ValueError:
        raise ValueError(f"Pfad '{args['path']}' liegt außerhalb der Sandbox ({OC_OUT_ROOT})")
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
    if not validate_readonly_query(query):
        raise ValueError("Nur einzelne SELECT/WITH-Abfragen erlaubt – DML/DDL und Stacked Queries sind verboten")
    rows = await db_pool.fetch(query, *args.get("params", []))
    return [dict(r) for r in rows]

async def tool_n8n_get_status(args: dict) -> Any:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{N8N_URL}/healthz")
        return {"status": resp.status_code, "healthy": resp.status_code == 200}

async def tool_n8n_trigger_webhook(args: dict) -> Any:
    webhook_id = args["webhook_id"]
    payload = args.get("payload", {})
    # Whitelist aus capabilities.yaml (ALLOWED_WEBHOOKS frozenset, O(1)-Lookup)
    if webhook_id not in ALLOWED_WEBHOOKS:
        raise ValueError(f"Webhook '{webhook_id}' nicht in der Whitelist")
    body_bytes = json.dumps(payload, sort_keys=True).encode()
    headers: dict[str, str] = {"Content-Type": "application/json"}
    # P1-2: HMAC-SHA256 Signatur für kryptographische Integrität
    if N8N_WEBHOOK_SECRET:
        sig = hmac.new(N8N_WEBHOOK_SECRET.encode(), body_bytes, hashlib.sha256).hexdigest()
        headers["X-Webhook-Signature"] = f"sha256={sig}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{N8N_URL}/webhook/{webhook_id}", content=body_bytes, headers=headers
        )
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

async def tool_qdrant_delete_by_agent(args: dict) -> Any:
    """P2-2: Löscht Qdrant-Vektoren nach agent_id (DSGVO Recht auf Löschung)."""
    agent_id = args["agent_id"]
    collection = args.get("collection", "oc_docs")
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{os.getenv('OC_QDRANT_URL', 'http://localhost:6333')}"
            f"/collections/{collection}/points/delete",
            json={
                "filter": {
                    "must": [{"key": "agent_id", "match": {"value": agent_id}}]
                }
            }
        )
        return {"status": resp.status_code, "deleted_for_agent": agent_id}


async def tool_qdrant_cleanup_expired(args: dict) -> Any:
    """P2-2: Löscht Qdrant-Vektoren älter als retention_days."""
    retention_days = args.get("retention_days", 90)
    cutoff = datetime.now(timezone.utc).timestamp() - (retention_days * 86400)
    collections = ["oc_docs", "oc_code", "oc_events_sem"]
    results = {}
    async with httpx.AsyncClient(timeout=30) as client:
        for coll in collections:
            resp = await client.post(
                f"{os.getenv('OC_QDRANT_URL', 'http://localhost:6333')}"
                f"/collections/{coll}/points/delete",
                json={
                    "filter": {
                        "must": [{"key": "created_at", "range": {"lt": cutoff}}]
                    }
                }
            )
            results[coll] = resp.status_code
    return {"cleanup_results": results, "cutoff_timestamp": cutoff}


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
    "qdrant.delete_by_agent": tool_qdrant_delete_by_agent,
    "qdrant.cleanup_expired": tool_qdrant_cleanup_expired,
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
    
    # Tool ausführen (P3-1: OTel Span)
    with tracer.start_as_current_span("tool_call", attributes={
        "oc.tool": req.tool, "oc.agent_id": req.agent_id, "oc.role": req.agent_role,
    }) as span:
        try:
            result = await TOOLS[req.tool](req.args)
            duration = int((time.monotonic() - start) * 1000)
            result_size = len(json.dumps(result)) if result else 0
            audit_id = await audit_log(req, "success", duration, result_size)
            span.set_attribute("oc.duration_ms", duration)
            span.set_attribute("oc.result_size", result_size)
            log.info("tool_called", tool=req.tool, agent=req.agent_id,
                     duration_ms=duration, result_size=result_size)
            return ToolResponse(success=True, result=result, duration_ms=duration,
                               tool=req.tool, audit_id=audit_id)
        except Exception as e:
            duration = int((time.monotonic() - start) * 1000)
            audit_id = await audit_log(req, "error", duration, error=str(e))
            span.set_attribute("oc.error", str(e))
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

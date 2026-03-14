-- ============================================================
-- OpenClaw – PostgreSQL Initialisierung
-- Separate DB-Instanz (Port 55432, User: oc, DB: oc)
-- Idempotent: alle Statements nutzen IF NOT EXISTS.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Task-Queue ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oc_tasks (
    task_id     TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    objective   TEXT NOT NULL,
    role_target TEXT NOT NULL,   -- orchestrator | research | builder | qa | automation | monetization
    inputs      JSONB DEFAULT '{}',
    status      TEXT NOT NULL DEFAULT 'IDLE',
    agent_id    TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    result_summary TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oc_tasks_status ON oc_tasks(status);
CREATE INDEX IF NOT EXISTS idx_oc_tasks_role   ON oc_tasks(role_target);

-- ── Tool-Audit-Log ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oc_tool_calls (
    call_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id       TEXT REFERENCES oc_tasks(task_id) ON DELETE SET NULL,
    agent_id      TEXT,
    agent_role    TEXT,
    tool_name     TEXT NOT NULL,
    args_hash     TEXT,
    args_redacted JSONB DEFAULT '{}',
    status        TEXT NOT NULL DEFAULT 'ok',   -- ok | error | denied
    duration_ms   INTEGER,
    result_size   INTEGER,
    error_message TEXT,
    policy_denied BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_task   ON oc_tool_calls(task_id);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_tool   ON oc_tool_calls(tool_name);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_status ON oc_tool_calls(status);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_ts     ON oc_tool_calls(created_at DESC);

-- ── Agent-Memory (langfristige Notizen) ──────────────────────
CREATE TABLE IF NOT EXISTS oc_memory_notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id   TEXT NOT NULL,
    task_id    TEXT REFERENCES oc_tasks(task_id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    tags       TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oc_memory_agent ON oc_memory_notes(agent_id);
CREATE INDEX IF NOT EXISTS idx_oc_memory_tags  ON oc_memory_notes USING GIN(tags);

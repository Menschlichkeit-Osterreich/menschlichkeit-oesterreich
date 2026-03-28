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

-- ── Tool-Audit-Log (P2-1: Range-Partitioned by created_at) ───
-- HINWEIS: Bei bestehender DB muss die alte Tabelle migriert werden.
-- Bei Neuanlage wird direkt die partitionierte Variante erstellt.
CREATE TABLE IF NOT EXISTS oc_tool_calls (
    call_id       UUID DEFAULT gen_random_uuid(),
    task_id       TEXT,
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
    created_at    TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (call_id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_task   ON oc_tool_calls(task_id);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_tool   ON oc_tool_calls(tool_name);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_status ON oc_tool_calls(status);
CREATE INDEX IF NOT EXISTS idx_oc_tool_calls_ts     ON oc_tool_calls(created_at DESC);

-- Default-Partition für Daten ohne passende Monats-Partition
CREATE TABLE IF NOT EXISTS oc_tool_calls_default PARTITION OF oc_tool_calls DEFAULT;

-- ── P2-1: Audit-Log Retention (automatische Partition-Bereinigung) ───
-- Partitions werden monatlich angelegt. Cleanup löscht Partitionen älter als retention_days.
-- Die Funktion wird vom Gateway beim Startup oder via pg_cron aufgerufen.
CREATE OR REPLACE FUNCTION oc_cleanup_old_partitions(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
    cutoff DATE := CURRENT_DATE - (retention_days || ' days')::INTERVAL;
    partition RECORD;
    dropped INTEGER := 0;
BEGIN
    FOR partition IN
        SELECT inhrelid::regclass::text AS part_name
        FROM pg_inherits
        WHERE inhparent = 'oc_tool_calls'::regclass
    LOOP
        -- Partitionsname-Konvention: oc_tool_calls_YYYY_MM
        -- Partition droppen wenn ihr Monatsende vor dem Cutoff liegt
        BEGIN
            IF to_date(right(partition.part_name, 7), 'YYYY_MM') + INTERVAL '1 month' < cutoff THEN
                EXECUTE format('DROP TABLE IF EXISTS %I', partition.part_name);
                dropped := dropped + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Unerwarteter Partitionsname — überspringen
            NULL;
        END;
    END LOOP;
    RETURN dropped;
END;
$$;

-- Funktion zum automatischen Erstellen der nächsten 3 Monats-Partitionen
CREATE OR REPLACE FUNCTION oc_ensure_partitions()
RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
    m INTEGER;
    start_date DATE;
    end_date DATE;
    part_name TEXT;
BEGIN
    FOR m IN 0..2 LOOP
        start_date := date_trunc('month', CURRENT_DATE + (m || ' months')::INTERVAL);
        end_date := start_date + INTERVAL '1 month';
        part_name := 'oc_tool_calls_' || to_char(start_date, 'YYYY_MM');
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = part_name) THEN
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I PARTITION OF oc_tool_calls FOR VALUES FROM (%L) TO (%L)',
                part_name, start_date, end_date
            );
        END IF;
    END LOOP;
END;
$$;

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

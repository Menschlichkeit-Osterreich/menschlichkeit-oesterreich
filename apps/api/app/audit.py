from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import UUID, uuid4

from .db import execute


async def ensure_audit_table() -> None:
    await execute(
        """
        CREATE TABLE IF NOT EXISTS audit_trail (
            id UUID PRIMARY KEY,
            actor_id TEXT,
            path TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            request_id TEXT NOT NULL,
            consent_flag BOOLEAN NOT NULL DEFAULT false,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ,
            audit_actor TEXT NOT NULL
        );
        """
    )


async def write_audit_event(
    *,
    actor_id: str | None,
    path: str,
    method: str,
    status_code: int,
    request_id: str,
    consent_flag: bool,
    metadata: dict,
) -> None:
    audit_id: UUID = uuid4()
    now = datetime.now(timezone.utc)
    await execute(
        """
        INSERT INTO audit_trail (
            id, actor_id, path, method, status_code, request_id,
            consent_flag, metadata, created_at, updated_at, audit_actor
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11)
        """,
        str(audit_id),
        actor_id,
        path,
        method,
        status_code,
        request_id,
        consent_flag,
        json.dumps(metadata),
        now,
        now,
        actor_id or "system",
    )

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import execute, fetch, fetchrow, fetchval
from ..internal_auth import require_internal_or_admin

router = APIRouter()


@router.get("/queue/stats")
async def queue_stats(_: dict = Depends(require_internal_or_admin)):
    main_size = await fetchval(
        """
        SELECT COUNT(*)
        FROM outbox_events
        WHERE status IN ('pending', 'retrying')
        """
    )
    delayed_size = await fetchval(
        """
        SELECT COUNT(*)
        FROM outbox_events
        WHERE status IN ('pending', 'retrying')
          AND next_retry_at IS NOT NULL
          AND next_retry_at > NOW()
        """
    )
    dlq_size = await fetchval(
        """
        SELECT COUNT(*)
        FROM integration_failures
        WHERE status IN ('open', 'failed')
        """
    )
    oldest_age = await fetchval(
        """
        SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at)))::bigint
        FROM outbox_events
        WHERE status IN ('pending', 'retrying')
        """
    )
    return {
        "success": True,
        "data": {
            "main": {
                "size": int(main_size or 0),
                "oldest_age_seconds": int(oldest_age or 0) if oldest_age is not None else None,
            },
            "delayed": {"size": int(delayed_size or 0)},
            "dlq": {"size": int(dlq_size or 0)},
        },
    }


@router.get("/queue/dlq/list")
async def dlq_list(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: dict = Depends(require_internal_or_admin),
):
    rows = await fetch(
        """
        SELECT id, integration, operation, entity_type, entity_id, status, error_message, payload, created_at
        FROM integration_failures
        WHERE status IN ('open', 'failed')
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        """,
        limit,
        offset,
    )
    total = await fetchval(
        """
        SELECT COUNT(*)
        FROM integration_failures
        WHERE status IN ('open', 'failed')
        """
    )
    return {
        "success": True,
        "data": {
            "total": int(total or 0),
            "items": [
                {
                    "id": str(row["id"]),
                    "integration": row["integration"],
                    "operation": row["operation"],
                    "entity_type": row["entity_type"],
                    "entity_id": row["entity_id"],
                    "status": row["status"],
                    "last_error": row["error_message"],
                    "payload": row["payload"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                }
                for row in rows
            ],
        },
    }


@router.post("/queue/dlq/requeue")
async def dlq_requeue(payload: dict, _: dict = Depends(require_internal_or_admin)):
    failure_id = payload.get("id")
    delay_seconds = int(payload.get("delay_seconds") or 0)
    if not failure_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="id fehlt")

    failure = await fetchrow(
        """
        SELECT id, integration, operation, entity_type, entity_id, payload
        FROM integration_failures
        WHERE id = $1::uuid AND status IN ('open', 'failed')
        """,
        failure_id,
    )
    if not failure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DLQ-Eintrag nicht gefunden")

    await execute(
        """
        INSERT INTO outbox_events (
            event_type, aggregate_type, aggregate_id, payload, status, attempts, next_retry_at
        )
        VALUES (
            $1, $2, $3, $4::jsonb, 'pending', 0,
            CASE WHEN $5 > 0 THEN NOW() + ($5 || ' seconds')::interval ELSE NULL END
        )
        """,
        f"requeue:{failure['integration']}:{failure['operation']}",
        failure["entity_type"] or failure["integration"],
        failure["entity_id"] or str(failure["id"]),
        json.dumps(failure["payload"]),
        delay_seconds,
    )
    await execute(
        """
        UPDATE integration_failures
        SET status = 'requeued', resolved_at = NOW()
        WHERE id = $1::uuid
        """,
        failure_id,
    )
    return {
        "success": True,
        "data": {"id": failure_id, "delay_seconds": delay_seconds},
        "message": "DLQ-Eintrag wurde erneut in die Outbox gestellt.",
    }


@router.post("/queue/dlq/purge")
async def dlq_purge(payload: dict, _: dict = Depends(require_internal_or_admin)):
    failure_id = payload.get("id")
    if failure_id:
        result = await execute(
            """
            UPDATE integration_failures
            SET status = 'purged', resolved_at = NOW()
            WHERE id = $1::uuid AND status IN ('open', 'failed')
            """,
            failure_id,
        )
        purged = 1 if result.endswith("1") else 0
    else:
        result = await execute(
            """
            UPDATE integration_failures
            SET status = 'purged', resolved_at = NOW()
            WHERE status IN ('open', 'failed')
            """
        )
        purged = int(result.split()[-1]) if result.split() else 0
    return {"success": True, "data": {"purged": purged}, "message": "DLQ wurde bereinigt."}

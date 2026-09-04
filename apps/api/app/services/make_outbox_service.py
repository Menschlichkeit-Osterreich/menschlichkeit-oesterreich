"""Lease-based, data-minimised outbox contract for the Make integration layer.

Make receives events only through this service.  It never obtains direct
PostgreSQL credentials and it cannot change donation or payment states.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from ..db import fetch, transaction

MAKE_EVENT_TYPES = ("donation.recorded", "payment.failed", "suppression.committed")

# The API must not pass the raw outbox JSON to Make.  Payment payloads often
# contain provider metadata; this allowlist is intentionally small and has no
# donor email, name, receipt address, or provider error message.
PAYLOAD_FIELDS: dict[str, tuple[str, ...]] = {
    "donation.recorded": (
        "schema_version",
        "correlation_id",
        "idempotency_key",
        "donation_id",
        "amount",
        "currency",
        "donation_type",
        "interval",
        "purpose",
        "source",
        "financial_type",
        "gateway_provider",
        "gateway_payment_id",
        "civicrm_contact_id",
        "erpnext_payment_entry_id",
    ),
    # The one allowlist entry that deliberately carries an identifier.  A
    # suppression that reaches the mailers without saying whom to suppress is
    # not a suppression; data minimisation must not defeat the purpose of the
    # event.  Nothing else from the originating message travels with it.
    "suppression.committed": (
        "schema_version",
        "idempotency_key",
        "suppression_id",
        "realm",
        "normalized_identity",
        "identity_kind",
        "status",
        "source_system",
        "source_event_id",
    ),
    "payment.failed": (
        "schema_version",
        "correlation_id",
        "idempotency_key",
        "status",
        "amount",
        "currency",
        "gateway_provider",
        "gateway_intent_id",
        "failure_code",
    ),
}

RETRYABLE_RESULTS = {"transient_failure", "rate_limited"}
DEAD_LETTER_RESULTS = {
    "permanent_failure",
    "business_failure",
    "auth_failure",
    "schema_failure",
}


class OutboxAckConflict(RuntimeError):
    """The event was not leased by this acknowledgement any more."""


class OutboxNotFound(RuntimeError):
    """The requested outbox event does not exist."""


@dataclass(frozen=True)
class AckResult:
    event_id: str
    status: str
    idempotent: bool
    dead_lettered: bool


def sanitise_payload(event_type: str, payload: Any) -> dict[str, Any]:
    """Return only documented, non-PII fields for a Make delivery."""
    if not isinstance(payload, dict):
        return {}
    fields = PAYLOAD_FIELDS.get(event_type, ())
    return {field: payload[field] for field in fields if field in payload}


def _row_value(row: Any, key: str, default: Any = None) -> Any:
    if isinstance(row, dict):
        return row.get(key, default)
    try:
        return row[key]
    except (KeyError, TypeError):
        return default


class MakeOutboxService:
    """Database boundary for signed Make claims and acknowledgements."""

    async def claim(
        self, *, consumer_id: str, limit: int, lease_seconds: int
    ) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            WITH candidates AS (
                SELECT id
                FROM outbox_events
                WHERE event_type = ANY($1::text[])
                  AND (
                    (status IN ('pending', 'retrying')
                     AND (next_retry_at IS NULL OR next_retry_at <= NOW()))
                    OR (status = 'leased' AND lease_expires_at <= NOW())
                  )
                ORDER BY created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT $2
            )
            UPDATE outbox_events AS event
            SET status = 'leased',
                lease_owner = $3,
                lease_token = gen_random_uuid(),
                lease_expires_at = NOW() + make_interval(secs => $4),
                attempts = event.attempts + 1,
                last_error = NULL
            FROM candidates
            WHERE event.id = candidates.id
            RETURNING event.id, event.event_type, event.aggregate_type,
                      event.aggregate_id, event.payload, event.idempotency_key,
                      event.lease_token, event.lease_expires_at,
                      event.attempts, event.created_at
            """,
            list(MAKE_EVENT_TYPES),
            limit,
            consumer_id,
            lease_seconds,
        )
        return [self._delivery(row) for row in rows]

    async def acknowledge(
        self,
        *,
        event_id: str,
        lease_token: str,
        idempotency_key: str,
        result_class: str,
        result_reference: str | None,
        retry_after_seconds: int | None,
    ) -> AckResult:
        target_status = (
            "processed"
            if result_class == "succeeded"
            else "retrying"
            if result_class in RETRYABLE_RESULTS
            else "dead_letter"
        )
        retry_delay = retry_after_seconds or 300

        async with transaction() as conn:
            existing = await conn.fetchrow(
                """
                SELECT id, event_type, status, ack_idempotency_key
                FROM outbox_events
                WHERE id = $1::uuid
                FOR UPDATE
                """,
                event_id,
            )
            if existing is None:
                raise OutboxNotFound(event_id)
            if _row_value(existing, "ack_idempotency_key") == idempotency_key:
                return AckResult(
                    event_id=event_id,
                    status=str(_row_value(existing, "status")),
                    idempotent=True,
                    dead_lettered=_row_value(existing, "status") == "dead_letter",
                )

            updated = await conn.fetchrow(
                """
                UPDATE outbox_events
                SET status = $3,
                    result_class = $4,
                    result_reference = $5,
                    ack_idempotency_key = $6,
                    acknowledged_at = NOW(),
                    processed_at = CASE WHEN $3 = 'processed' THEN NOW() ELSE processed_at END,
                    next_retry_at = CASE
                        WHEN $3 = 'retrying' THEN NOW() + make_interval(secs => $7)
                        ELSE NULL
                    END,
                    last_error = CASE WHEN $3 = 'processed' THEN NULL ELSE $4 END,
                    lease_owner = NULL,
                    lease_token = NULL,
                    lease_expires_at = NULL
                WHERE id = $1::uuid
                  AND status = 'leased'
                  AND lease_token = $2::uuid
                  AND lease_expires_at > NOW()
                RETURNING id, event_type, status
                """,
                event_id,
                lease_token,
                target_status,
                result_class,
                result_reference,
                idempotency_key,
                retry_delay,
            )
            if updated is None:
                raise OutboxAckConflict(event_id)

            if result_class in DEAD_LETTER_RESULTS:
                await conn.execute(
                    """
                    INSERT INTO integration_failures (
                        integration, operation, entity_type, entity_id,
                        status, error_message, payload
                    )
                    VALUES (
                        'make', 'outbox_ack', 'outbox_event', $1,
                        'open', $2, $3::jsonb
                    )
                    """,
                    event_id,
                    f"Make result class: {result_class}",
                    json.dumps(
                        {
                            "outbox_event_id": event_id,
                            "event_type": _row_value(updated, "event_type"),
                            "result_class": result_class,
                            "result_reference": result_reference,
                        }
                    ),
                )

        return AckResult(
            event_id=event_id,
            status=target_status,
            idempotent=False,
            dead_lettered=target_status == "dead_letter",
        )

    async def reconciliation(self) -> dict[str, Any]:
        async with transaction() as conn:
            status_rows = await conn.fetch(
                """
                SELECT status, COUNT(*)::bigint AS count
                FROM outbox_events
                WHERE event_type = ANY($1::text[])
                GROUP BY status
                ORDER BY status
                """,
                list(MAKE_EVENT_TYPES),
            )
            result_rows = await conn.fetch(
                """
                SELECT COALESCE(result_class, 'unacknowledged') AS result_class,
                       COUNT(*)::bigint AS count
                FROM outbox_events
                WHERE event_type = ANY($1::text[])
                GROUP BY COALESCE(result_class, 'unacknowledged')
                ORDER BY result_class
                """,
                list(MAKE_EVENT_TYPES),
            )
            dlq_count = await conn.fetchval(
                """
                SELECT COUNT(*)::bigint
                FROM integration_failures
                WHERE integration = 'make'
                  AND operation = 'outbox_ack'
                  AND status IN ('open', 'failed')
                """
            )
        return {
            "event_types": list(MAKE_EVENT_TYPES),
            "by_status": {
                str(_row_value(row, "status")): int(_row_value(row, "count", 0))
                for row in status_rows
            },
            "by_result_class": {
                str(_row_value(row, "result_class")): int(_row_value(row, "count", 0))
                for row in result_rows
            },
            "open_dead_letters": int(dlq_count or 0),
        }

    @staticmethod
    def _delivery(row: Any) -> dict[str, Any]:
        payload = _row_value(row, "payload", {})
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except json.JSONDecodeError:
                payload = {}
        event_type = str(_row_value(row, "event_type"))
        return {
            "event_id": str(_row_value(row, "id")),
            "event_type": event_type,
            "aggregate_type": str(_row_value(row, "aggregate_type")),
            "aggregate_id": str(_row_value(row, "aggregate_id")),
            "idempotency_key": _row_value(row, "idempotency_key")
            or sanitise_payload(event_type, payload).get("idempotency_key"),
            "lease_token": str(_row_value(row, "lease_token")),
            "lease_expires_at": _row_value(row, "lease_expires_at").isoformat()
            if _row_value(row, "lease_expires_at")
            else None,
            "attempt": int(_row_value(row, "attempts", 0)),
            "payload": sanitise_payload(event_type, payload),
        }


make_outbox_service = MakeOutboxService()

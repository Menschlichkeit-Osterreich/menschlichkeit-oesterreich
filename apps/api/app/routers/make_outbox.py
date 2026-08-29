"""Signed FastAPI boundary used by the inactive Make integration consumer."""
from __future__ import annotations

import hashlib
import hmac
import time
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status

from ..schemas.internal import MakeOutboxAckRequest, MakeOutboxClaimRequest
from ..secrets_provider import get_secret
from ..services.make_outbox_service import (
    OutboxAckConflict,
    OutboxNotFound,
    make_outbox_service,
)

router = APIRouter()

SIGNATURE_TTL_SECONDS = 300


async def require_make_outbox_signature(request: Request) -> None:
    """Validate a time-bound HMAC without accepting generic bearer tokens.

    The signed value is ``<unix-timestamp>.<raw-request-body>``.  The shared
    key remains in BSM as ``MOE_API_TOKEN``; neither the key nor the raw body
    is written to logs or API responses.
    """
    shared_secret = get_secret("MOE_API_TOKEN", bsm_key="api/MOE_API_TOKEN").strip()
    if not shared_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Interner Outbox-Vertrag nicht konfiguriert",
        )

    timestamp = request.headers.get("x-moe-timestamp", "").strip()
    signature = request.headers.get("x-moe-outbox-signature", "").strip()
    if not timestamp or not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Interne Signatur fehlt",
        )
    try:
        timestamp_value = int(timestamp)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige interne Signatur",
        ) from exc
    if abs(time.time() - timestamp_value) > SIGNATURE_TTL_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Abgelaufene interne Signatur",
        )

    raw_body = await request.body()
    signed_message = timestamp.encode("ascii") + b"." + raw_body
    expected = hmac.new(
        shared_secret.encode("utf-8"), signed_message, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige interne Signatur",
        )


@router.post("/internal/outbox/claim")
async def claim_make_outbox(
    body: MakeOutboxClaimRequest, request: Request
):
    """Lease approved, data-minimised events for one Make consumer."""
    await require_make_outbox_signature(request)
    events = await make_outbox_service.claim(
        consumer_id=body.consumer_id,
        limit=body.limit,
        lease_seconds=body.lease_seconds,
    )
    return {
        "success": True,
        "data": {
            "events": events,
            "lease_seconds": body.lease_seconds,
            "consumer_id": body.consumer_id,
        },
    }


@router.post("/internal/outbox/{event_id}/ack")
async def acknowledge_make_outbox(
    event_id: UUID, body: MakeOutboxAckRequest, request: Request
):
    """Acknowledge one lease with a classified, idempotent result."""
    await require_make_outbox_signature(request)
    try:
        result = await make_outbox_service.acknowledge(
            event_id=str(event_id),
            lease_token=str(body.lease_token),
            idempotency_key=body.idempotency_key,
            result_class=body.result_class,
            result_reference=body.result_reference,
            retry_after_seconds=body.retry_after_seconds,
        )
    except OutboxNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outbox-Ereignis nicht gefunden",
        ) from exc
    except OutboxAckConflict as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Outbox-Lease ist nicht mehr gültig",
        ) from exc
    return {
        "success": True,
        "data": {
            "event_id": result.event_id,
            "status": result.status,
            "idempotent": result.idempotent,
            "dead_lettered": result.dead_lettered,
        },
    }


@router.get("/internal/outbox/reconciliation")
async def make_outbox_reconciliation(request: Request):
    """Return only aggregate reconciliation signals; no donor data."""
    await require_make_outbox_signature(request)
    return {"success": True, "data": await make_outbox_service.reconciliation()}

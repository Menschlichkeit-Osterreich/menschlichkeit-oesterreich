"""Signed boundary the automation layer calls before anything else.

The order the Make scenario must follow is:

    Nachricht empfangen
    -> POST /internal/suppression/commit   (hier)
    -> abhängige Systeme synchronisieren
    -> Nachricht als verarbeitet markieren

If this endpoint does not answer with a commit, the message stays unprocessed
and is picked up again on the next run.  That is the desired behaviour: an
opt-out processed twice is a nuisance, an opt-out lost is a breach.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from ..schemas.suppression import (
    SuppressionCheckResponse,
    SuppressionCommitRequest,
    SuppressionCommitResponse,
)
from ..services.suppression_service import (
    SuppressionRejected,
    normalize_identity,
    suppression_service,
)

# Reused rather than reimplemented: a second copy of the signature check is a
# second place for it to drift or weaken.
from .internal import _require_internal_signature

router = APIRouter()


@router.post(
    "/internal/suppression/commit",
    response_model=SuppressionCommitResponse,
    summary="Sperre verbindlich festschreiben",
)
async def commit_suppression(body: SuppressionCommitRequest, request: Request):
    await _require_internal_signature(request)
    try:
        result = await suppression_service.commit(
            realm=body.realm,
            identity=body.identity,
            source_system=body.source_system,
            source_event_id=body.source_event_id,
            evidence_reference=body.evidence_reference,
            detected_at=body.detected_at,
        )
    except SuppressionRejected as exc:
        # A rejected request is not a processed request.  The caller must see
        # a 4xx so its own retry or review path takes over.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    return SuppressionCommitResponse(
        committed=True,
        suppression_id=result.suppression_id,
        realm=result.realm,
        normalized_identity=result.normalized_identity,
        created=result.created,
        duplicate_delivery=result.duplicate_delivery,
        first_committed_at=result.first_committed_at,
        last_confirmed_at=result.last_confirmed_at,
    )


@router.get(
    "/internal/suppression/check",
    response_model=SuppressionCheckResponse,
    summary="Sperrstatus vor dem Versand prüfen",
)
async def check_suppression(realm: str, identity: str, request: Request):
    await _require_internal_signature(request)
    suppressed = await suppression_service.is_suppressed(realm=realm, identity=identity)
    return SuppressionCheckResponse(
        realm=(realm or "").strip().upper(),
        normalized_identity=normalize_identity(identity),
        suppressed=suppressed,
    )

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from io import BytesIO
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from ..audit import write_audit_event
from ..db import fetchrow
from ..lib.token_blacklist import revoke_token
from ..rbac import require_auth, require_role, Role
from ..schemas.privacy import (
    ConsentCreateRequest,
    CookiePreferencesPayload,
    DataDeletionRequestCreate,
    DataExportRequestCreate,
    PrivacySettingsPayload,
)
from ..services.member_service import member_service
from ..services.privacy_service import privacy_service

router = APIRouter()
logger = logging.getLogger("menschlichkeit.privacy")

DEFAULT_COOKIE_PREFS = {
    "essential": True,
    "analytics": False,
    "marketing": False,
    "functional": False,
    "preferences": False,
}

DEFAULT_PRIVACY_SETTINGS = {
    "dataProcessing": {
        "personalData": True,
        "marketingCommunication": False,
        "analytics": False,
        "profiling": False,
    },
    "communication": {
        "email": True,
        "sms": False,
        "phone": False,
        "newsletter": False,
    },
    "sharing": {
        "partners": False,
        "publicProfile": False,
        "research": False,
    },
}


async def _write_privacy_audit_event(
    request: Request,
    user: dict | None,
    *,
    event_type: str,
    status_code: int,
    metadata: dict | None = None,
    consent_flag: bool = False,
) -> None:
    try:
        await write_audit_event(
            actor_id=user.get("uid") if user else None,
            path=request.url.path,
            method=request.method,
            status_code=status_code,
            request_id=request.headers.get(
                "X-Request-ID",
                f"privacy_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            ),
            consent_flag=consent_flag,
            metadata={
                "domain": "privacy",
                "eventType": event_type,
                **(metadata or {}),
            },
        )
    except Exception as exc:
        logger.warning(
            "privacy_audit_write_failed | event=%s | error=%s", event_type, exc
        )


@router.post("/privacy/data-export")
async def request_data_export(
    body: DataExportRequestCreate | None = None,
    request: Request = None,
    user: dict = Depends(require_auth),
):
    row = await privacy_service.create_data_export_request(
        member_id=user["uid"], reason=(body.reason if body else None)
    )
    if request is not None:
        await _write_privacy_audit_event(
            request,
            user,
            event_type="data_export_request",
            status_code=200,
            metadata={
                "exportRequestId": str(row.get("id")),
                "reasonProvided": bool(body and body.reason),
            },
        )
    return {"success": True, "data": {"request": row}}


@router.get("/privacy/data-export")
async def list_data_exports(user: dict = Depends(require_auth)):
    rows = await privacy_service.list_data_export_requests(member_id=user["uid"])
    return {"success": True, "data": {"requests": rows}}


@router.get("/privacy/data-export/{request_id}/download")
async def download_data_export(
    request_id: str, request: Request, user: dict = Depends(require_auth)
):
    row = await fetchrow(
        """
        SELECT id, member_id, status, requested_at, completed_at
        FROM data_export_requests
        WHERE id = $1::uuid AND member_id = $2::uuid
        """,
        request_id,
        user["uid"],
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exportantrag nicht gefunden"
        )
    export_request = dict(row)

    export_payload = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "request": {
            "id": str(export_request["id"]),
            "status": export_request["status"],
            "requestedAt": (
                export_request["requested_at"].isoformat()
                if export_request.get("requested_at")
                else None
            ),
            "completedAt": (
                export_request["completed_at"].isoformat()
                if export_request.get("completed_at")
                else None
            ),
        },
        "member": {
            "id": user["uid"],
            "email": user.get("sub"),
            "role": user.get("role"),
        },
        "retention": {
            "expiresAt": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "note": "Der Export enthält nur die aktuell in der Plattform gespeicherten Daten und keine Drittquellen.",
        },
    }
    await _write_privacy_audit_event(
        request,
        user,
        event_type="data_export_download",
        status_code=200,
        metadata={
            "exportRequestId": request_id,
            "exportStatus": export_request["status"],
        },
    )
    content = json.dumps(export_payload, ensure_ascii=False, indent=2).encode("utf-8")
    filename = f"data-export-{request_id}.json"
    return StreamingResponse(
        BytesIO(content),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


async def _revoke_active_privacy_session(request: Request, user: dict) -> bool:
    await member_service.revoke_all_sessions(
        member_id=user["uid"], exclude_session_id=None
    )
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False

    token = auth_header.removeprefix("Bearer ").strip()
    exp = user.get("exp")
    expires_at = (
        datetime.fromtimestamp(exp, tz=timezone.utc)
        if exp
        else datetime.now(timezone.utc)
    )
    await revoke_token(token, expires_at)
    return True


@router.post("/privacy/data-deletion")
async def request_data_deletion(
    body: DataDeletionRequestCreate,
    request: Request,
    user: dict = Depends(require_auth),
):
    row = await privacy_service.create_data_deletion_request(
        member_id=user["uid"], reason=body.reason, scope=body.scope
    )
    session_revoked = await _revoke_active_privacy_session(request, user)
    await _write_privacy_audit_event(
        request,
        user,
        event_type="data_deletion_request",
        status_code=200,
        metadata={
            "deletionRequestId": str(row.get("id")),
            "scope": body.scope,
            "sessionRevoked": session_revoked,
        },
    )
    return {
        "success": True,
        "message": "Löschantrag wurde erfasst. Aktive Sitzungen wurden vorsorglich widerrufen.",
        "data": {"request": row, "sessionRevoked": session_revoked},
    }


@router.get("/privacy/data-deletion")
async def list_data_deletions(user: dict = Depends(require_auth)):
    rows = await privacy_service.list_data_deletion_requests(member_id=user["uid"])
    return {"success": True, "data": {"requests": rows}}


@router.post("/privacy/data-deletion/{request_id}/process")
async def process_data_deletion(
    request_id: str,
    payload: dict,
    request: Request,
    user: dict = require_role(Role.ADMIN),
):
    action = payload.get("action")
    if action not in {"approve", "reject"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ungültige Aktion"
        )
    status_value = "approved" if action == "approve" else "rejected"
    from ..db import execute

    deletion_request = await fetchrow(
        """
        SELECT id, member_id
        FROM data_deletion_requests
        WHERE id = $1::uuid
        """,
        request_id,
    )
    if not deletion_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Löschantrag nicht gefunden"
        )

    await execute(
        """
        UPDATE data_deletion_requests
        SET status = $1, processed_at = NOW(), processed_by = $2, comments = $3
        WHERE id = $4::uuid
        """,
        status_value,
        user["uid"],
        payload.get("comments"),
        request_id,
    )

    if status_value == "approved":
        await execute(
            "UPDATE members SET status = 'deleted', updated_at = NOW() WHERE id = $1::uuid",
            deletion_request["member_id"],
        )
        await member_service.revoke_all_sessions(
            member_id=str(deletion_request["member_id"]), exclude_session_id=None
        )

    await _write_privacy_audit_event(
        request,
        user,
        event_type="data_deletion_processed",
        status_code=200,
        metadata={
            "deletionRequestId": request_id,
            "decision": status_value,
            "memberId": str(deletion_request["member_id"]),
        },
    )

    return {"success": True, "message": "Antrag wurde aktualisiert."}


@router.get("/privacy/consents")
async def list_consents(user: dict = Depends(require_auth)):
    consents = await privacy_service.list_consents(
        member_id=user["uid"], email=user.get("sub")
    )
    return {"success": True, "data": {"consents": consents}}


@router.post("/privacy/consents")
async def grant_consent(
    body: ConsentCreateRequest, request: Request, user: dict = Depends(require_auth)
):
    consent = await privacy_service.record_consent(
        member_id=user["uid"],
        email=user.get("sub"),
        consent_type=body.type,
        version=body.version,
        source=body.source,
    )
    await _write_privacy_audit_event(
        request,
        user,
        event_type="consent_granted",
        status_code=200,
        metadata={
            "consentId": str(consent.get("id")),
            "consentType": body.type,
            "version": body.version,
        },
        consent_flag=True,
    )
    return {"success": True, "data": {"consent": consent}}


@router.delete("/privacy/consents/{consent_id}")
async def revoke_consent(
    consent_id: str, request: Request, user: dict = Depends(require_auth)
):
    await privacy_service.revoke_consent(consent_id, member_id=user["uid"])
    await _write_privacy_audit_event(
        request,
        user,
        event_type="consent_revoked",
        status_code=200,
        metadata={"consentId": consent_id},
    )
    return {"success": True, "message": "Einwilligung wurde widerrufen."}


@router.get("/privacy/cookies")
async def get_cookie_preferences(user: dict = Depends(require_auth)):
    return {"success": True, "data": {"preferences": DEFAULT_COOKIE_PREFS}}


@router.put("/privacy/cookies")
async def update_cookie_preferences(
    payload: CookiePreferencesPayload, user: dict = Depends(require_auth)
):
    prefs = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return {"success": True, "data": {"preferences": prefs}}


@router.get("/privacy/settings")
async def get_privacy_settings(user: dict = Depends(require_auth)):
    return {"success": True, "data": {"settings": DEFAULT_PRIVACY_SETTINGS}}


@router.put("/privacy/settings")
async def update_privacy_settings(
    payload: PrivacySettingsPayload, user: dict = Depends(require_auth)
):
    settings = (
        payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    )
    return {"success": True, "data": {"settings": settings}}


@router.get("/privacy/processing-activities")
async def processing_activities(user: dict = Depends(require_auth)):
    return {
        "success": True,
        "data": {
            "activities": [
                {
                    "id": "auth-membership",
                    "category": "Mitgliederverwaltung",
                    "purpose": "Authentifizierung, Mitgliedschaft und Servicekommunikation",
                    "dataTypes": [
                        "Kontaktdaten",
                        "Login-Metadaten",
                        "Consent-Nachweise",
                    ],
                    "retention": "Bis zum Ende der Mitgliedschaft plus gesetzliche Aufbewahrungspflichten",
                    "recipients": ["FastAPI", "CiviCRM", "n8n"],
                    "legalBasis": "Art. 6 Abs. 1 lit. b DSGVO",
                    "lastUpdated": "2026-03-19",
                }
            ]
        },
    }


@router.post("/privacy/impact-assessment")
async def impact_assessment(payload: dict, user: dict = require_role(Role.ADMIN)):
    return {
        "success": True,
        "data": {"assessmentId": secrets.token_hex(12), "received": payload},
    }


@router.post("/privacy/data-breach")
async def data_breach_report(payload: dict, user: dict = require_role(Role.ADMIN)):
    return {
        "success": True,
        "data": {"breachId": secrets.token_hex(12), "received": payload},
    }

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from io import BytesIO
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from ..db import fetchrow
from ..rbac import require_auth, require_role, Role
from ..schemas.privacy import (
    ConsentCreateRequest,
    CookiePreferencesPayload,
    DataDeletionRequestCreate,
    DataExportRequestCreate,
    PrivacySettingsPayload,
)
from ..services.privacy_service import privacy_service

router = APIRouter()

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


@router.post("/privacy/data-export")
async def request_data_export(body: DataExportRequestCreate | None = None, user: dict = Depends(require_auth)):
    row = await privacy_service.create_data_export_request(member_id=user["uid"], reason=(body.reason if body else None))
    return {"success": True, "data": {"request": row}}


@router.get("/privacy/data-export")
async def list_data_exports(user: dict = Depends(require_auth)):
    rows = await privacy_service.list_data_export_requests(member_id=user["uid"])
    return {"success": True, "data": {"requests": rows}}


@router.get("/privacy/data-export/{request_id}/download")
async def download_data_export(request_id: str, user: dict = Depends(require_auth)):
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exportantrag nicht gefunden")
    export_request = dict(row)

    export_payload = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "request": {
            "id": str(export_request["id"]),
            "status": export_request["status"],
            "requestedAt": export_request["requested_at"].isoformat() if export_request.get("requested_at") else None,
            "completedAt": export_request["completed_at"].isoformat() if export_request.get("completed_at") else None,
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
    content = json.dumps(export_payload, ensure_ascii=False, indent=2).encode("utf-8")
    filename = f"data-export-{request_id}.json"
    return StreamingResponse(
        BytesIO(content),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/privacy/data-deletion")
async def request_data_deletion(body: DataDeletionRequestCreate, user: dict = Depends(require_auth)):
    row = await privacy_service.create_data_deletion_request(member_id=user["uid"], reason=body.reason, scope=body.scope)
    return {"success": True, "data": {"request": row}}


@router.get("/privacy/data-deletion")
async def list_data_deletions(user: dict = Depends(require_auth)):
    rows = await privacy_service.list_data_deletion_requests(member_id=user["uid"])
    return {"success": True, "data": {"requests": rows}}


@router.post("/privacy/data-deletion/{request_id}/process")
async def process_data_deletion(request_id: str, payload: dict, user: dict = require_role(Role.ADMIN)):
    action = payload.get("action")
    if action not in {"approve", "reject"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ungültige Aktion")
    status_value = "approved" if action == "approve" else "rejected"
    from ..db import execute

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
    return {"success": True, "message": "Antrag wurde aktualisiert."}


@router.get("/privacy/consents")
async def list_consents(user: dict = Depends(require_auth)):
    consents = await privacy_service.list_consents(member_id=user["uid"], email=user.get("sub"))
    return {"success": True, "data": {"consents": consents}}


@router.post("/privacy/consents")
async def grant_consent(body: ConsentCreateRequest, user: dict = Depends(require_auth)):
    consent = await privacy_service.record_consent(
        member_id=user["uid"],
        email=user.get("sub"),
        consent_type=body.type,
        version=body.version,
        source=body.source,
    )
    return {"success": True, "data": {"consent": consent}}


@router.delete("/privacy/consents/{consent_id}")
async def revoke_consent(consent_id: str, user: dict = Depends(require_auth)):
    await privacy_service.revoke_consent(consent_id, member_id=user["uid"])
    return {"success": True, "message": "Einwilligung wurde widerrufen."}


@router.get("/privacy/cookies")
async def get_cookie_preferences(user: dict = Depends(require_auth)):
    return {"success": True, "data": {"preferences": DEFAULT_COOKIE_PREFS}}


@router.put("/privacy/cookies")
async def update_cookie_preferences(payload: CookiePreferencesPayload, user: dict = Depends(require_auth)):
    prefs = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return {"success": True, "data": {"preferences": prefs}}


@router.get("/privacy/settings")
async def get_privacy_settings(user: dict = Depends(require_auth)):
    return {"success": True, "data": {"settings": DEFAULT_PRIVACY_SETTINGS}}


@router.put("/privacy/settings")
async def update_privacy_settings(payload: PrivacySettingsPayload, user: dict = Depends(require_auth)):
    settings = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
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
                    "dataTypes": ["Kontaktdaten", "Login-Metadaten", "Consent-Nachweise"],
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
    return {"success": True, "data": {"assessmentId": secrets.token_hex(12), "received": payload}}


@router.post("/privacy/data-breach")
async def data_breach_report(payload: dict, user: dict = require_role(Role.ADMIN)):
    return {"success": True, "data": {"breachId": secrets.token_hex(12), "received": payload}}

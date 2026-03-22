from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..internal_auth import require_internal_or_admin
from ..services.mail_service import mail_service

router = APIRouter()


@router.post("/alerts/email")
async def send_alert_email(payload: dict, _: dict = Depends(require_internal_or_admin)):
    recipient = payload.get("to")
    subject = payload.get("subject") or "Interne Benachrichtigung"
    text = payload.get("text") or payload.get("message") or ""
    if not recipient or not text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Empfänger und Text sind erforderlich")

    body_html = "<br/>".join(str(text).splitlines())
    sent = await mail_service.send_template(
        template_id="admin_alert",
        recipient_email=str(recipient),
        subject_override=str(subject),
        context={
            "title": str(subject),
            "body_html": body_html,
            "related_id": payload.get("related_id"),
        },
        entity_type="alert",
    )
    if not sent:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Alert-E-Mail konnte nicht versendet werden")
    return {"success": True, "message": "Alert-E-Mail wurde versendet."}

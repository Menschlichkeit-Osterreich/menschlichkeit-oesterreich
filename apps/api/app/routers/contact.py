from __future__ import annotations

import json
import secrets

from fastapi import APIRouter, HTTPException, Request, status

from ..db import execute, fetchrow
from ..schemas.contact import ContactSubmitRequest
from ..services.crm_service import crm_service
from ..services.mail_service import mail_service
from ..services.privacy_service import privacy_service
from ..services.utils import hash_optional

router = APIRouter()


@router.post("/contact/submit")
async def submit_contact(body: ContactSubmitRequest, request: Request):
    if not body.consent_privacy:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Datenschutz-Einwilligung ist erforderlich")

    crm_contact = await crm_service.upsert_contact(
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        postal_code=body.postal_code,
        city=body.city,
        source=body.source,
    )
    row = await fetchrow(
        """
        INSERT INTO contact_submissions (
            first_name, last_name, email, phone, city, postal_code,
            subject, message, source, civicrm_contact_id, metadata
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
        RETURNING id, created_at
        """,
        body.first_name,
        body.last_name,
        str(body.email),
        body.phone,
        body.city,
        body.postal_code,
        body.subject,
        body.message,
        body.source,
        int(crm_contact["id"]) if crm_contact and crm_contact.get("id") else None,
        json.dumps({
            "ip_hash": hash_optional(request.client.host if request.client else None),
            "user_agent_hash": hash_optional(request.headers.get("User-Agent")),
        }),
    )
    await privacy_service.record_consent(
        member_id=None,
        email=str(body.email),
        consent_type="privacy",
        version="2026-03",
        source=body.source,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    await mail_service.send_template(
        template_id="contact_confirmation",
        recipient_email=str(body.email),
        context={
            "first_name": body.first_name,
            "last_name": body.last_name,
            "subject": body.subject,
            "message": body.message,
        },
        entity_type="contact_submission",
        entity_id=row["id"],
    )
    if body.newsletter_opt_in:
        token = secrets.token_urlsafe(32)
        await execute(
            """
            INSERT INTO newsletter_subscriptions (
                email, first_name, last_name, status, confirmation_token, source, civicrm_contact_id
            ) VALUES ($1,$2,$3,'pending_confirmation',$4,$5,$6)
            ON CONFLICT (email) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                confirmation_token = EXCLUDED.confirmation_token,
                source = EXCLUDED.source,
                status = 'pending_confirmation',
                updated_at = NOW()
            """,
            str(body.email).lower(),
            body.first_name,
            body.last_name,
            token,
            "contact_form_optin",
            int(crm_contact["id"]) if crm_contact and crm_contact.get("id") else None,
        )
        confirm_url = f"{request.base_url}api/newsletter/confirm?token={token}"
        await mail_service.send_template(
            template_id="newsletter_doi",
            recipient_email=str(body.email),
            context={
                "first_name": body.first_name,
                "last_name": body.last_name,
                "confirmation_url": confirm_url,
            },
            entity_type="newsletter_subscription",
        )
    return {"success": True, "data": {"submissionId": row["id"], "submittedAt": row["created_at"].isoformat()}}

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query, Request, status

from ..db import execute, fetchrow
from ..schemas.newsletter import NewsletterSubscribeRequest, NewsletterUnsubscribeRequest
from ..services.crm_service import crm_service
from ..services.mail_service import mail_service
from ..services.privacy_service import privacy_service
from ..services.utils import normalize_email

router = APIRouter()

_doi_schema_ready: bool = False


async def _ensure_doi_expiry_column() -> None:
    """Idempotente Migration: fügt token_created_at zur newsletter_subscriptions-Tabelle hinzu."""
    global _doi_schema_ready
    if _doi_schema_ready:
        return
    await execute(
        "ALTER TABLE newsletter_subscriptions ADD COLUMN IF NOT EXISTS token_created_at TIMESTAMPTZ DEFAULT NOW()"
    )
    _doi_schema_ready = True


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(body: NewsletterSubscribeRequest, request: Request):
    if not body.consent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Newsletter-Einwilligung ist erforderlich")

    await _ensure_doi_expiry_column()
    email = normalize_email(body.email)
    token = secrets.token_urlsafe(32)
    existing = await fetchrow(
        "SELECT id, token_created_at FROM newsletter_subscriptions WHERE LOWER(email) = LOWER($1)", email
    )
    # DoS-Schutz: max. 1 neues Token alle 5 Minuten pro E-Mail-Adresse
    if existing and existing["token_created_at"] is not None:
        age = datetime.now(timezone.utc) - existing["token_created_at"]
        if age < timedelta(minutes=5):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Bitte warten Sie 5 Minuten, bevor Sie sich erneut anmelden.",
            )
    if existing:
        await execute(
            """
            UPDATE newsletter_subscriptions
            SET first_name = $1, last_name = $2, confirmation_token = $3,
                status = 'pending_confirmation', source = $4, token_created_at = NOW(), updated_at = NOW()
            WHERE id = $5
            """,
            body.first_name,
            body.last_name,
            token,
            body.source,
            existing["id"],
        )
    else:
        await execute(
            """
            INSERT INTO newsletter_subscriptions (
                email, first_name, last_name, status, confirmation_token, source, token_created_at
            ) VALUES ($1, $2, $3, 'pending_confirmation', $4, $5, NOW())
            """,
            email,
            body.first_name,
            body.last_name,
            token,
            body.source,
        )

    confirm_url = f"{request.base_url}api/newsletter/confirm?token={token}"
    await mail_service.send_template(
        template_id="newsletter_doi",
        recipient_email=email,
        context={
            "first_name": body.first_name or "",
            "last_name": body.last_name or "",
            "confirmation_url": confirm_url,
        },
        entity_type="newsletter_subscription",
    )
    return {
        "success": True,
        "message": "Bitte bestätigen Sie Ihre Anmeldung über den Link in der E-Mail.",
    }


@router.get("/newsletter/confirm")
async def confirm_newsletter(token: str = Query(..., min_length=10)):
    await _ensure_doi_expiry_column()
    pending = await fetchrow(
        "SELECT id, token_created_at FROM newsletter_subscriptions WHERE confirmation_token = $1 AND status = 'pending_confirmation'",
        token,
    )
    if not pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger Bestätigungslink")
    if pending["token_created_at"] is not None:
        age = datetime.now(timezone.utc) - pending["token_created_at"]
        if age > timedelta(hours=48):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bestätigungslink abgelaufen. Bitte melden Sie sich erneut an.",
            )
    row = await fetchrow(
        """
        UPDATE newsletter_subscriptions
        SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
        WHERE confirmation_token = $1
        RETURNING *
        """,
        token,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger Bestätigungslink")

    subscription = dict(row)
    contact = await crm_service.upsert_contact(
        email=subscription["email"],
        first_name=subscription.get("first_name") or "",
        last_name=subscription.get("last_name") or "",
        source="newsletter_doi_confirmed",
    )
    contact_id = int(contact["id"]) if contact and contact.get("id") else None
    if contact_id:
        await execute(
            "UPDATE newsletter_subscriptions SET civicrm_contact_id = $1 WHERE id = $2",
            contact_id,
            subscription["id"],
        )
        await crm_service.set_newsletter_subscription(contact_id=contact_id, subscribe=True)

    await privacy_service.record_consent(
        member_id=None,
        email=subscription["email"],
        consent_type="marketing",
        version="2026-03",
        source="newsletter_doi_confirmed",
    )
    await mail_service.send_template(
        template_id="newsletter_confirmed",
        recipient_email=subscription["email"],
        context={
            "first_name": subscription.get("first_name") or "",
            "last_name": subscription.get("last_name") or "",
        },
        entity_type="newsletter_subscription",
    )
    return {"success": True, "message": "Newsletter-Anmeldung bestätigt."}


@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(body: NewsletterUnsubscribeRequest):
    if not body.email and not body.token:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="E-Mail oder Token erforderlich")
    if body.token:
        row = await fetchrow(
            """
            UPDATE newsletter_subscriptions
            SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
            WHERE confirmation_token = $1
            RETURNING *
            """,
            body.token,
        )
    else:
        row = await fetchrow(
            """
            UPDATE newsletter_subscriptions
            SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
            WHERE LOWER(email) = LOWER($1)
            RETURNING *
            """,
            normalize_email(body.email),
        )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Abonnement nicht gefunden")
    subscription = dict(row)
    if subscription.get("civicrm_contact_id"):
        await crm_service.set_newsletter_subscription(contact_id=subscription["civicrm_contact_id"], subscribe=False)
    await privacy_service.record_consent(
        member_id=None,
        email=subscription["email"],
        consent_type="marketing",
        version="2026-03",
        status="revoked",
        source="newsletter_unsubscribe",
    )
    await mail_service.send_template(
        template_id="newsletter_unsubscribed",
        recipient_email=subscription["email"],
        context={
            "first_name": subscription.get("first_name") or "",
            "last_name": subscription.get("last_name") or "",
        },
        entity_type="newsletter_subscription",
    )
    return {"success": True, "message": "Newsletter-Abmeldung bestätigt."}

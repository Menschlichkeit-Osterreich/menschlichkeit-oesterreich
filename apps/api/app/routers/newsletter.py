from __future__ import annotations

import secrets
from uuid import uuid4
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from ..db import execute, fetch, fetchrow, fetchval
from ..rbac import require_auth
from ..schemas.newsletter import NewsletterSubscribeRequest, NewsletterUnsubscribeRequest
from ..services.crm_service import crm_service
from ..services.mail_service import mail_service
from ..services.privacy_service import privacy_service
from ..services.utils import normalize_email

router = APIRouter()

ALLOWED_NEWSLETTER_ROLES = {"staff", "finance", "admin", "sysadmin", "moderator"}


async def ensure_newsletter_admin_tables() -> None:
    await execute(
        """
        CREATE TABLE IF NOT EXISTS newsletter_campaigns (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            segment TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            recipients_count INTEGER NOT NULL DEFAULT 0,
            open_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
            click_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
            content TEXT NOT NULL,
            scheduled_at TIMESTAMPTZ NULL,
            sent_at TIMESTAMPTZ NULL,
            created_by TEXT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )


def require_newsletter_staff(user: dict = Depends(require_auth)) -> dict:
    role = str(user.get("role") or "guest").lower()
    if role not in ALLOWED_NEWSLETTER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zugriff nur für Redaktion, Staff oder Admin",
        )
    return user


async def _segment_count(segment: str) -> int:
    normalized = segment.lower()
    if normalized == "active_members":
        return int(
            await fetchval(
                """
                SELECT COUNT(*)
                FROM newsletter_subscriptions ns
                JOIN members m ON LOWER(m.email) = LOWER(ns.email)
                WHERE ns.status = 'confirmed'
                  AND LOWER(COALESCE(m.status, '')) = 'active'
                """
            )
            or 0
        )
    if normalized == "new_members":
        return int(
            await fetchval(
                """
                SELECT COUNT(*)
                FROM newsletter_subscriptions ns
                JOIN members m ON LOWER(m.email) = LOWER(ns.email)
                WHERE ns.status = 'confirmed'
                  AND COALESCE(m.joined_at, m.created_at) >= NOW() - INTERVAL '90 days'
                """
            )
            or 0
        )
    if normalized == "donors":
        return int(
            await fetchval(
                """
                SELECT COUNT(DISTINCT ns.email)
                FROM newsletter_subscriptions ns
                JOIN donations d ON LOWER(d.donor_email) = LOWER(ns.email)
                WHERE ns.status = 'confirmed'
                """
            )
            or 0
        )
    if normalized == "volunteers":
        return int(
            await fetchval(
                """
                SELECT COUNT(*)
                FROM newsletter_subscriptions ns
                JOIN members m ON LOWER(m.email) = LOWER(ns.email)
                WHERE ns.status = 'confirmed'
                  AND LOWER(COALESCE(m.rolle, '')) IN ('moderator', 'staff')
                """
            )
            or 0
        )
    if normalized == "board":
        return int(
            await fetchval(
                """
                SELECT COUNT(*)
                FROM newsletter_subscriptions ns
                JOIN members m ON LOWER(m.email) = LOWER(ns.email)
                WHERE ns.status = 'confirmed'
                  AND LOWER(COALESCE(m.rolle, '')) IN ('finance', 'admin', 'sysadmin')
                """
            )
            or 0
        )
    return int(
        await fetchval(
            """
            SELECT COUNT(*)
            FROM newsletter_subscriptions
            WHERE status = 'confirmed'
            """
        )
        or 0
    )


async def _newsletter_segments() -> list[dict]:
    segments = [
        {"id": "all_members", "label": "Alle Mitglieder"},
        {"id": "active_members", "label": "Aktive Mitglieder"},
        {"id": "new_members", "label": "Neue Mitglieder"},
        {"id": "donors", "label": "Spender"},
        {"id": "volunteers", "label": "Ehrenamtliche"},
        {"id": "board", "label": "Vorstand"},
    ]
    result = []
    for item in segments:
        count = await _segment_count(item["id"])
        result.append({**item, "recipients": count})
    return result


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(body: NewsletterSubscribeRequest, request: Request):
    if not body.consent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Newsletter-Einwilligung ist erforderlich")

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
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="E-Mail oder Token erforderlich")
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


@router.get("/newsletter/admin/overview")
async def newsletter_admin_overview(user: dict = Depends(require_newsletter_staff)):
    await ensure_newsletter_admin_tables()
    subscribers_total = int(
        await fetchval("SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'confirmed'") or 0
    )
    avg_open_rate = float(
        await fetchval("SELECT COALESCE(AVG(open_rate), 0) FROM newsletter_campaigns WHERE status = 'sent'") or 0
    )
    avg_click_rate = float(
        await fetchval("SELECT COALESCE(AVG(click_rate), 0) FROM newsletter_campaigns WHERE status = 'sent'") or 0
    )
    campaigns_ytd = int(
        await fetchval(
            """
            SELECT COUNT(*)
            FROM newsletter_campaigns
            WHERE created_at >= date_trunc('year', NOW())
            """
        )
        or 0
    )
    return {
        "success": True,
        "data": {
            "subscribersTotal": subscribers_total,
            "averageOpenRate": round(avg_open_rate, 1),
            "averageClickRate": round(avg_click_rate, 1),
            "campaignsYtd": campaigns_ytd,
        },
    }


@router.get("/newsletter/admin/segments")
async def newsletter_admin_segments(user: dict = Depends(require_newsletter_staff)):
    return {"success": True, "data": await _newsletter_segments()}


@router.get("/newsletter/admin/campaigns")
async def newsletter_admin_campaigns(user: dict = Depends(require_newsletter_staff)):
    await ensure_newsletter_admin_tables()
    rows = await fetch(
        """
        SELECT id, subject, segment, status, recipients_count, open_rate, click_rate,
               scheduled_at, sent_at, created_at, updated_at
        FROM newsletter_campaigns
        ORDER BY COALESCE(scheduled_at, sent_at, created_at) DESC
        LIMIT 50
        """
    )
    return {"success": True, "data": [dict(row) for row in rows]}


@router.post("/newsletter/admin/campaigns", status_code=status.HTTP_201_CREATED)
async def create_newsletter_campaign(body: dict, user: dict = Depends(require_newsletter_staff)):
    await ensure_newsletter_admin_tables()
    subject = str(body.get("subject") or "").strip()
    content = str(body.get("content") or "").strip()
    segment = str(body.get("segment") or "all_members").strip() or "all_members"
    if not subject or not content:
        raise HTTPException(status_code=422, detail="Betreff und Inhalt sind erforderlich")

    campaign_id = uuid4().hex
    recipients_count = await _segment_count(segment)
    status_value = "scheduled" if body.get("scheduled_at") else "draft"
    await execute(
        """
        INSERT INTO newsletter_campaigns (
            id, subject, segment, status, recipients_count, content, scheduled_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        campaign_id,
        subject,
        segment,
        status_value,
        recipients_count,
        content,
        body.get("scheduled_at"),
        user.get("uid"),
    )
    row = await fetchrow("SELECT * FROM newsletter_campaigns WHERE id = $1", campaign_id)
    return {"success": True, "data": dict(row)}


@router.put("/newsletter/admin/campaigns/{campaign_id}")
async def update_newsletter_campaign(campaign_id: str, body: dict, user: dict = Depends(require_newsletter_staff)):
    await ensure_newsletter_admin_tables()
    row = await fetchrow("SELECT * FROM newsletter_campaigns WHERE id = $1", campaign_id)
    if not row:
        raise HTTPException(status_code=404, detail="Kampagne nicht gefunden")

    updates = {}
    if body.get("subject") is not None:
        updates["subject"] = str(body.get("subject")).strip()
    if body.get("content") is not None:
        updates["content"] = str(body.get("content")).strip()
    if body.get("segment") is not None:
        updates["segment"] = str(body.get("segment")).strip() or "all_members"
        updates["recipients_count"] = await _segment_count(updates["segment"])
    if body.get("scheduled_at") is not None:
        updates["scheduled_at"] = body.get("scheduled_at")
        updates["status"] = "scheduled" if body.get("scheduled_at") else "draft"
    if body.get("status") is not None:
        updates["status"] = str(body.get("status"))
    if body.get("open_rate") is not None:
        updates["open_rate"] = float(body.get("open_rate"))
    if body.get("click_rate") is not None:
        updates["click_rate"] = float(body.get("click_rate"))

    if updates:
        set_clauses = []
        params = []
        for index, (key, value) in enumerate(updates.items(), start=1):
            set_clauses.append(f"{key} = ${index}")
            params.append(value)
        params.extend([datetime.now(timezone.utc), campaign_id])
        await execute(
            f"""
            UPDATE newsletter_campaigns
            SET {', '.join(set_clauses)}, updated_at = ${len(params) - 1}
            WHERE id = ${len(params)}
            """,
            *params,
        )

    updated = await fetchrow("SELECT * FROM newsletter_campaigns WHERE id = $1", campaign_id)
    return {"success": True, "data": dict(updated)}


@router.post("/newsletter/admin/campaigns/{campaign_id}/send")
async def send_newsletter_campaign(campaign_id: str, user: dict = Depends(require_newsletter_staff)):
    await ensure_newsletter_admin_tables()
    row = await fetchrow("SELECT * FROM newsletter_campaigns WHERE id = $1", campaign_id)
    if not row:
        raise HTTPException(status_code=404, detail="Kampagne nicht gefunden")

    recipients_count = await _segment_count(str(row["segment"]))
    await execute(
        """
        UPDATE newsletter_campaigns
        SET status = 'sent',
            recipients_count = $1,
            sent_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
        """,
        recipients_count,
        campaign_id,
    )
    updated = await fetchrow("SELECT * FROM newsletter_campaigns WHERE id = $1", campaign_id)
    return {"success": True, "data": dict(updated)}

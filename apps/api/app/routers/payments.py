from __future__ import annotations

import json
import logging
import os
from html import escape
from datetime import date
from json import JSONDecodeError

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..secrets_provider import get_secret
from ..schemas.payments import StripeIntentRequest
from ..services.mail_service import mail_service
from ..services.member_service import member_service
from ..services.payment_service import payment_service
from ..services.stripe_webhook_service import (
    build_ops_alert_text,
    process_stripe_event,
    stripe_webhook_inbox,
)
from ..rbac import ADMIN_EMAILS, get_current_user

logger = logging.getLogger("menschlichkeit.payments.router")

router = APIRouter()


async def _send_payment_failed_ops_alert(
    *,
    event_type: str,
    amount: float,
    currency: str,
    donor_email: str | None,
    gateway_intent_id: str,
    correlation_id: str,
) -> None:
    """Dual-Channel-Alert: E-Mail (ADMIN_EMAILS, intern) + Slack (datensparsam).

    DSGVO (Audit-Finding P1-002): Slack ist ein externer Dienst — dorthin
    gehen KEINE personenbezogenen Daten und keine Stripe-IDs, nur Betrag,
    Event-Typ und die interne Correlation-ID (webhook_events.id). Die
    Detailzuordnung (Spender, Intent) bleibt im internen E-Mail-Kanal an
    die Administration.
    """
    subject = "Stripe-Zahlung fehlgeschlagen"
    body_lines = [
        f"Event: {escape(event_type)}",
        f"Betrag: {amount:.2f} {escape(currency)}",
        f"Spender-E-Mail: {escape(donor_email or '-')}",
        f"Gateway-Intent: {escape(gateway_intent_id or '-')}",
        f"Correlation-ID: {escape(correlation_id)}",
    ]
    body_html = "<br/>".join(body_lines)

    # Kanal 1: interne E-Mail an die Administration (admin_alert Template)
    if ADMIN_EMAILS:
        for recipient in ADMIN_EMAILS:
            await mail_service.send_template(
                template_id="admin_alert",
                recipient_email=recipient,
                subject_override=subject,
                context={
                    "title": subject,
                    "body_html": body_html,
                    "related_id": gateway_intent_id or None,
                },
                entity_type="alert",
            )

    # Kanal 2: Slack — ausschließlich datensparsame Betriebsinformation
    slack_webhook = get_secret(
        "ALERTS_SLACK_WEBHOOK", bsm_key="api/ALERTS_SLACK_WEBHOOK"
    ).strip()
    if slack_webhook:
        slack_text = build_ops_alert_text(
            event_type=event_type,
            amount=amount,
            currency=currency,
            correlation_id=correlation_id,
        )
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(
                    slack_webhook,
                    json={"text": slack_text},
                    headers={"Content-Type": "application/json"},
                )
        except Exception as e:
            # Log but don't block: Slack delivery is informational, not critical
            print(f"Slack alert delivery failed: {e}")


@router.post("/payments/stripe/intent")
async def create_stripe_intent(
    body: StripeIntentRequest, user: dict | None = Depends(get_current_user)
):
    member = (
        await member_service.get_member_by_id(user["uid"])
        if user and user.get("uid")
        else None
    )
    result = await payment_service.create_stripe_intent(
        amount=body.amount,
        currency=body.currency,
        email=(
            str(body.email) if body.email else (member.get("email") if member else None)
        ),
        purpose=body.purpose,
        method=body.method,
        financial_type=body.financial_type,
        interval=body.interval,
        civicrm_contact_id=member.get("civicrm_contact_id") if member else None,
    )
    return {"success": True, "data": result}


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Stripe-Webhook mit durable Inbox (Audit-Finding P1-001).

    Ablauf:
      1. Signatur prüfen (400 bei Fehler — Stripe wiederholt nicht sinnlos).
      2. Event ATOMAR in webhook_events speichern (status=received), BEVOR
         irgendeine Geschäftslogik läuft. Deduplizierung über die
         Unique-Constraint (provider, provider_event_id), nicht über eine
         racebehaftete SELECT-Vorprüfung.
      3. Event claimen (status=processing) — von parallelen Zustellungen
         gewinnt genau eine.
      4. Geschäftsverarbeitung in EINER lokalen DB-Transaktion
         (Donation, payment_intents, Outbox). Keine externen Aufrufe darin.
      5. status=processed. Bei Fehler: status=failed + last_error — das
         Event bleibt gespeichert und retryfähig; die Antwort ist 500,
         damit Stripe erneut zustellt.
      6. Folgeeffekte (Mails, Ops-Alert) NACH dem Commit, best effort.
    """
    raw_body = await request.body()
    signature = request.headers.get("stripe-signature", "")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Stripe-Signatur fehlt"
        )
    await payment_service.verify_stripe_signature(
        raw_body=raw_body, signature_header=signature
    )
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger Stripe-Payload"
        ) from exc
    event_id = payload.get("id")
    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Stripe-Event-ID fehlt"
        )
    event_type = payload.get("type") or ""
    obj = payload.get("data", {}).get("object", {})

    # Schritt 1: durable Inbox — Event zuerst dauerhaft speichern.
    inbox = await stripe_webhook_inbox.ingest(
        provider="stripe",
        provider_event_id=event_id,
        event_type=event_type,
        payload=payload,
        signature_valid=True,
    )
    if not inbox["created"] and inbox["status"] == "processed":
        return {"success": True, "message": "Webhook bereits verarbeitet."}

    # Schritt 2: exklusiv claimen. Verliert dieser Request das Rennen
    # (paralleles Duplikat oder laufende Verarbeitung), ist 200 korrekt —
    # das Event ist gespeichert und wird vom Gewinner verarbeitet.
    claimed = await stripe_webhook_inbox.claim(inbox["id"])
    if not claimed:
        return {"success": True, "message": "Webhook bereits verarbeitet."}

    # Schritt 3: lokale Geschäftsverarbeitung in einer Transaktion.
    try:
        side_effects = await process_stripe_event(
            event_pk=inbox["id"], event_type=event_type, obj=obj
        )
        await stripe_webhook_inbox.mark_processed(inbox["id"])
    except HTTPException:
        raise
    except Exception as exc:
        # Kein PII/Secret im gespeicherten Fehlertext.
        await stripe_webhook_inbox.mark_failed(
            inbox["id"], error=f"{type(exc).__name__}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook-Verarbeitung fehlgeschlagen; Event gespeichert.",
        ) from exc

    # Schritt 4: Folgeeffekte NACH dem Commit — best effort, kein Rollback
    # der bereits committeten Geschäftsdaten bei Mail-/Alert-Fehlern.
    await _dispatch_post_commit_effects(
        correlation_id=inbox["id"], obj=obj, side_effects=side_effects
    )
    return {"success": True}


async def _dispatch_post_commit_effects(
    *, correlation_id: str, obj: dict, side_effects: dict
) -> None:
    """Mails und Alerts nach erfolgreichem Commit. Fehler nur loggen.

    Übergangsweise versendet FastAPI die Mails selbst; laut Zielarchitektur
    übernimmt Make diese Folgeprozesse aus der Outbox. Das Outbox-Payload
    trägt dafür bereits `receipt_email_sent_by_api`.
    """
    try:
        if side_effects.get("donation_created") and side_effects.get("donor_email"):
            donor_name = side_effects.get("donor_name") or ""
            first_name, _, last_name = donor_name.partition(" ")
            await mail_service.send_template(
                template_id="donation_success",
                recipient_email=side_effects["donor_email"],
                context={
                    "contact": {
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": side_effects["donor_email"],
                    },
                    "donation": {
                        "amount": f"{side_effects['amount']:.2f}",
                        "currency": side_effects["currency"],
                        "purpose": side_effects.get("purpose") or "",
                        "date": side_effects.get("donation_date") or "",
                        "receipt_eligible": True,
                    },
                },
                entity_type="donation",
                entity_id=side_effects.get("donation_id"),
            )

        if side_effects.get("payment_failed"):
            amount = side_effects.get("amount", 0.0)
            currency = side_effects.get("currency", "EUR")
            email = side_effects.get("donor_email") or ""
            await _send_payment_failed_ops_alert(
                event_type=side_effects.get("event_type", ""),
                amount=amount,
                currency=currency,
                donor_email=email or None,
                gateway_intent_id=obj.get("id", ""),
                correlation_id=correlation_id,
            )
            if email:
                public_app_url = os.environ.get(
                    "PUBLIC_APP_URL", "https://menschlichkeit-oesterreich.at"
                ).rstrip("/")
                await mail_service.send_template(
                    template_id="donation_failed",
                    recipient_email=email,
                    context={
                        "contact": {"first_name": ""},
                        "donation": {
                            "amount": f"{amount:.2f}",
                            "date": str(date.today()),
                            "failure_reason": side_effects.get("failure_reason"),
                        },
                        "retry_url": f"{public_app_url}/spenden",
                    },
                    entity_type="payment_intent",
                )
    except Exception as exc:
        logger.warning(
            "post_commit_effect_failed | correlation_id=%s | error=%s",
            correlation_id,
            type(exc).__name__,
        )

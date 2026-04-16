from __future__ import annotations

import json
import os
from datetime import date
from json import JSONDecodeError

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..db import execute, fetchrow as db_fetchrow
from ..schemas.payments import StripeIntentRequest
from ..services.mail_service import mail_service
from ..services.member_service import member_service
from ..services.payment_service import payment_service
from ..rbac import get_current_user

router = APIRouter()


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
    # Idempotenz-Vorprüfung: bereits verarbeitet?
    already = await db_fetchrow(
        "SELECT id FROM webhook_events WHERE provider = $1 AND provider_event_id = $2",
        "stripe",
        event_id,
    )
    if already:
        return {"success": True, "message": "Webhook bereits verarbeitet."}

    event_type = payload.get("type")
    obj = payload.get("data", {}).get("object", {})

    # Schritt 1: Geschäftslogik ausführen (idempotent via gateway_charge_id)
    if event_type == "payment_intent.succeeded":
        amount = float(obj.get("amount_received", obj.get("amount", 0))) / 100
        _meta = obj.get("metadata", {})
        await payment_service.record_successful_donation(
            donor_email=_meta.get("email", ""),
            donor_name=_meta.get("name") or _meta.get("donor_name") or "Spender/in",
            amount=amount,
            currency=obj.get("currency", "eur").upper(),
            donation_type="one_time",
            source=obj.get("metadata", {}).get("purpose") or "Stripe",
            gateway_charge_id=obj.get("id"),
        )
    elif event_type in ("payment_intent.payment_failed", "payment_intent.canceled"):
        gateway_intent_id = obj.get("id", "")
        new_status = (
            "failed" if event_type == "payment_intent.payment_failed" else "canceled"
        )
        if gateway_intent_id:
            await execute(
                "UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE gateway_intent_id = $2",
                new_status,
                gateway_intent_id,
            )
        if event_type == "payment_intent.payment_failed":
            email = (
                obj.get("metadata", {}).get("email") or obj.get("receipt_email") or ""
            )
            if email:
                amount = float(obj.get("amount", 0)) / 100
                failure_reason = (obj.get("last_payment_error") or {}).get("message")
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
                            "failure_reason": failure_reason,
                        },
                        "retry_url": f"{public_app_url}/spenden",
                    },
                    entity_type="payment_intent",
                )
    # Schritt 2: Webhook als verarbeitet markieren (erst nach erfolgreicher Geschäftslogik)
    await payment_service.record_webhook_event(
        provider="stripe",
        event_id=event_id,
        payload=payload,
        signature_valid=True,
    )
    return {"success": True}

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import secrets
from typing import Any

import httpx

from ..db import fetchrow
from ..secrets_provider import get_secret
from ._payment_helpers import _resolve_contact_id, _to_cents

logger = logging.getLogger("menschlichkeit.payments.stripe")


class StripeService:
    def __init__(self) -> None:
        self.stripe_secret = get_secret("STRIPE_SECRET_KEY", bsm_key="api/STRIPE_SECRET_KEY").strip()
        self.stripe_webhook_secret = get_secret("STRIPE_WEBHOOK_SECRET", bsm_key="api/STRIPE_WEBHOOK_SECRET").strip()

    async def create_stripe_intent(
        self,
        *,
        amount: float,
        currency: str,
        email: str | None,
        purpose: str | None,
        method: str | None,
        financial_type: str,
        civicrm_contact_id: int | None = None,
    ) -> dict[str, Any]:
        amount_cents = _to_cents(amount)
        provider_method = method or "card"
        resolved_contact_id = await _resolve_contact_id(
            email=email,
            donor_name=email,
            civicrm_contact_id=civicrm_contact_id,
            source="stripe_intent",
        )
        payload = {
            "amount": str(amount_cents),
            "currency": currency.lower(),
            "metadata[source]": "website",
            "metadata[purpose]": purpose or "",
            "metadata[financial_type]": financial_type,
            "metadata[email]": email or "",
        }
        if provider_method == "sepa":
            payload["payment_method_types[]"] = "sepa_debit"
        elif provider_method in {"eps", "sofort"}:
            payload["payment_method_types[]"] = provider_method
        else:
            payload["automatic_payment_methods[enabled]"] = "true"

        intent_id = f"pi_mock_{secrets.token_hex(8)}"
        client_secret = f"{intent_id}_secret_{secrets.token_hex(16)}"
        gateway_response: dict[str, Any] = {"mock": True, "client_secret": client_secret}

        if self.stripe_secret:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.stripe.com/v1/payment_intents",
                    data=payload,
                    headers={"Authorization": f"Bearer {self.stripe_secret}"},
                )
                response.raise_for_status()
                gateway_response = response.json()
                intent_id = gateway_response["id"]
                client_secret = gateway_response["client_secret"]

        row = await fetchrow(
            """
            INSERT INTO payment_intents (
                civicrm_contact_id, payment_method, gateway_intent_id, gateway_response,
                amount, currency, status
            )
            VALUES ($1, $2, $3, $4::jsonb, $5, $6, 'pending')
            RETURNING id
            """,
            resolved_contact_id,
            f"stripe_{provider_method}",
            intent_id,
            json.dumps(gateway_response),
            amount,
            currency.upper(),
        )
        return {
            "payment_intent_id": row["id"],
            "gateway_intent_id": intent_id,
            "client_secret": client_secret,
            "status": "pending",
        }

    async def verify_stripe_signature(self, *, raw_body: bytes, signature_header: str) -> None:
        if not self.stripe_webhook_secret:
            raise ValueError("STRIPE_WEBHOOK_SECRET nicht konfiguriert")
        parts = dict(part.split("=", 1) for part in signature_header.split(",") if "=" in part)
        timestamp = parts.get("t")
        signature = parts.get("v1")
        if not timestamp or not signature:
            raise ValueError("Ungültiger Stripe-Signatur-Header")
        signed_payload = f"{timestamp}.{raw_body.decode('utf-8')}"
        expected = hmac.new(
            self.stripe_webhook_secret.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise ValueError("Stripe-Signatur ungültig")


stripe_service = StripeService()

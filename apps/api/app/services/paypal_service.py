from __future__ import annotations

import json
import logging
import os
import secrets
from decimal import Decimal
from typing import Any

import httpx

from ..db import execute
from ._payment_helpers import _money, _resolve_contact_id

logger = logging.getLogger("menschlichkeit.payments.paypal")


class PayPalService:
    def __init__(self) -> None:
        self.paypal_client_id = os.getenv("PAYPAL_CLIENT_ID", "").strip()
        self.paypal_client_secret = os.getenv("PAYPAL_CLIENT_SECRET", "").strip()
        self.paypal_base_url = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com").rstrip("/")

    async def _paypal_access_token(self) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.paypal_base_url}/v1/oauth2/token",
                data={"grant_type": "client_credentials"},
                auth=(self.paypal_client_id, self.paypal_client_secret),
                headers={"Accept": "application/json", "Accept-Language": "de_AT"},
            )
            response.raise_for_status()
            return response.json()["access_token"]

    async def create_paypal_order(
        self,
        *,
        amount: float,
        currency: str,
        email: str | None,
        purpose: str | None,
    ) -> dict[str, Any]:
        order_id = f"paypal_mock_{secrets.token_hex(8)}"
        gateway_response: dict[str, Any] = {"id": order_id, "status": "CREATED", "mock": True}
        resolved_contact_id = await _resolve_contact_id(email=email, donor_name=email, source="paypal_order")
        if self.paypal_client_id and self.paypal_client_secret:
            token = await self._paypal_access_token()
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.paypal_base_url}/v2/checkout/orders",
                    json={
                        "intent": "CAPTURE",
                        "purchase_units": [{
                            "amount": {"currency_code": currency.upper(), "value": f"{Decimal(str(amount)):.2f}"},
                            "description": purpose or "Spende Menschlichkeit Österreich",
                        }],
                        "payer": {"email_address": email} if email else {},
                    },
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                )
                response.raise_for_status()
                gateway_response = response.json()
                order_id = gateway_response["id"]
        await execute(
            """
            INSERT INTO payment_intents (
                civicrm_contact_id, payment_method, gateway_intent_id, gateway_response,
                amount, currency, status
            )
            VALUES ($1, 'paypal', $2, $3::jsonb, $4, $5, 'pending')
            """,
            resolved_contact_id,
            order_id,
            json.dumps(gateway_response),
            amount,
            currency.upper(),
        )
        return {"id": order_id, **gateway_response}

    async def capture_paypal_order(
        self,
        *,
        order_id: str,
        email: str | None,
        purpose: str | None,
        civicrm_contact_id: int | None = None,
        record_donation_fn: Any,
    ) -> dict[str, Any]:
        capture_response: dict[str, Any] = {"id": order_id, "status": "COMPLETED", "mock": True}
        if self.paypal_client_id and self.paypal_client_secret:
            token = await self._paypal_access_token()
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.paypal_base_url}/v2/checkout/orders/{order_id}/capture",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                )
                response.raise_for_status()
                capture_response = response.json()

        purchase_units = capture_response.get("purchase_units", [{}])
        amount_info = purchase_units[0].get("payments", {}).get("captures", [{}])[0].get("amount", {})
        amount = float(amount_info.get("value", "0") or 0)
        currency = amount_info.get("currency_code", "EUR")
        await execute(
            """
            UPDATE payment_intents
            SET status = 'succeeded', gateway_response = $1::jsonb, updated_at = NOW()
            WHERE gateway_intent_id = $2
            """,
            json.dumps(capture_response),
            order_id,
        )
        await record_donation_fn(
            donor_email=email or "",
            donor_name=email or "PayPal-Spender/in",
            amount=amount,
            currency=currency,
            donation_type="one_time",
            source=purpose or "PayPal",
            gateway_charge_id=order_id,
            civicrm_contact_id=civicrm_contact_id,
        )
        return capture_response


paypal_service = PayPalService()

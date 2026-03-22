from __future__ import annotations

"""
PaymentService — Facade
=======================
Dünner Einstiegspunkt; delegiert an spezialisierte Services:
  - StripeService      (stripe_service.py)
  - PayPalService      (paypal_service.py)
  - DonationService    (donation_service.py)
  - InvoiceService     (invoice_service.py)
  - SepaService        (sepa_service.py)

Alle bisherigen Aufrufer (Router, Tests) können weiterhin `payment_service.*`
verwenden — die öffentliche API bleibt identisch.
"""

import hashlib
import json
import logging
from typing import Any

from ..db import execute, fetchrow
from ._payment_helpers import _resolve_contact_id
from .stripe_service import stripe_service
from .paypal_service import paypal_service
from .donation_service import donation_service
from .invoice_service import invoice_service
from .sepa_service import sepa_service

logger = logging.getLogger("menschlichkeit.payments")


class PaymentService:

    # ── Stripe ────────────────────────────────────────────────────────────────

    async def create_stripe_intent(self, **kwargs: Any) -> dict[str, Any]:
        return await stripe_service.create_stripe_intent(**kwargs)

    async def verify_stripe_signature(self, *, raw_body: bytes, signature_header: str) -> None:
        return await stripe_service.verify_stripe_signature(
            raw_body=raw_body, signature_header=signature_header
        )

    # ── PayPal ────────────────────────────────────────────────────────────────

    async def create_paypal_order(self, **kwargs: Any) -> dict[str, Any]:
        return await paypal_service.create_paypal_order(**kwargs)

    async def capture_paypal_order(
        self,
        *,
        order_id: str,
        email: str | None,
        purpose: str | None,
        civicrm_contact_id: int | None = None,
    ) -> dict[str, Any]:
        return await paypal_service.capture_paypal_order(
            order_id=order_id,
            email=email,
            purpose=purpose,
            civicrm_contact_id=civicrm_contact_id,
            record_donation_fn=donation_service.record_successful_donation,
        )

    # ── Donations ─────────────────────────────────────────────────────────────

    async def record_successful_donation(self, **kwargs: Any) -> dict[str, Any]:
        return await donation_service.record_successful_donation(**kwargs)

    async def log_external_payment(self, **kwargs: Any) -> dict[str, Any]:
        return await donation_service.log_external_payment(**kwargs)

    # ── Invoices ──────────────────────────────────────────────────────────────

    async def create_invoice_from_contact(self, **kwargs: Any) -> dict[str, Any]:
        return await invoice_service.create_invoice_from_contact(**kwargs)

    # ── SEPA ──────────────────────────────────────────────────────────────────

    async def list_collectible_sepa_transactions(self) -> list[dict[str, Any]]:
        return await sepa_service.list_collectible_sepa_transactions()

    async def export_sepa_batch(self, **kwargs: Any) -> dict[str, Any]:
        return await sepa_service.export_sepa_batch(**kwargs)

    async def process_sepa_membership_payment(self, **kwargs: Any) -> dict[str, Any]:
        return await sepa_service.process_sepa_membership_payment(**kwargs)

    # ── Webhook-Verwaltung ────────────────────────────────────────────────────

    async def record_webhook_event(
        self, *, provider: str, event_id: str, payload: dict[str, Any], signature_valid: bool
    ) -> bool:
        payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
        existing = await fetchrow(
            "SELECT id FROM webhook_events WHERE provider = $1 AND provider_event_id = $2",
            provider,
            event_id,
        )
        if existing:
            return False
        await execute(
            """
            INSERT INTO webhook_events (provider, provider_event_id, payload_hash, signature_valid, payload, processing_status)
            VALUES ($1, $2, $3, $4, $5::jsonb, 'processed')
            """,
            provider,
            event_id,
            payload_hash,
            signature_valid,
            json.dumps(payload),
        )
        return True

    # ── CRM-Kontakt-Auflösung (intern, für direkte Nutzung in Routers) ────────

    async def _resolve_contact_id(self, **kwargs: Any) -> int | None:
        return await _resolve_contact_id(**kwargs)


payment_service = PaymentService()

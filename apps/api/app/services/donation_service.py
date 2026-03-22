from __future__ import annotations

import json
import logging
from decimal import Decimal
from typing import Any

from ..db import execute, fetchrow
from .crm_service import crm_service
from .mail_service import mail_service
from ._payment_helpers import _money, _resolve_contact_id

logger = logging.getLogger("menschlichkeit.payments.donation")


class DonationService:

    async def record_successful_donation(
        self,
        *,
        donor_email: str,
        donor_name: str,
        amount: float,
        currency: str,
        donation_type: str,
        source: str,
        gateway_charge_id: str | None = None,
        civicrm_contact_id: int | None = None,
        civicrm_contribution_id: int | None = None,
        send_receipt_email: bool = True,
    ) -> dict[str, Any]:
        if civicrm_contribution_id:
            existing = await fetchrow(
                """
                SELECT id, donor_name, donor_email, amount, currency, donation_type, status, donation_date
                FROM donations
                WHERE civicrm_contribution_id = $1
                """,
                civicrm_contribution_id,
            )
            if existing:
                return dict(existing)
        if gateway_charge_id:
            existing = await fetchrow(
                """
                SELECT id, donor_name, donor_email, amount, currency, donation_type, status, donation_date
                FROM donations
                WHERE notes = $1
                ORDER BY id DESC
                LIMIT 1
                """,
                gateway_charge_id,
            )
            if existing:
                return dict(existing)

        resolved_contact_id = await _resolve_contact_id(
            email=donor_email,
            donor_name=donor_name,
            civicrm_contact_id=civicrm_contact_id,
            source=source,
        )
        row = await fetchrow(
            """
            INSERT INTO donations (
                civicrm_contact_id, civicrm_contribution_id, donor_name, donor_email, amount, currency,
                donation_type, is_recurring, status, donation_date, receipt_eligible, source, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid', CURRENT_DATE, TRUE, $9, $10)
            RETURNING id, donor_name, donor_email, amount, currency, donation_type, status, donation_date, civicrm_contribution_id
            """,
            resolved_contact_id,
            civicrm_contribution_id,
            donor_name,
            donor_email,
            amount,
            currency.upper(),
            donation_type,
            donation_type != "one_time",
            source,
            gateway_charge_id,
        )
        donation = dict(row)
        if resolved_contact_id and not civicrm_contribution_id:
            contribution = await crm_service.create_contribution(contact_id=resolved_contact_id, amount=amount, source=source)
            if contribution and contribution.get("id"):
                donation["civicrm_contribution_id"] = int(contribution["id"])
                await execute(
                    "UPDATE donations SET civicrm_contribution_id = $1 WHERE id = $2",
                    int(contribution["id"]),
                    donation["id"],
                )
        if donor_email and send_receipt_email:
            await mail_service.send_template(
                template_id="donation_success",
                recipient_email=donor_email,
                context={
                    "first_name": donor_name.split(" ")[0] if donor_name else "",
                    "donor_name": donor_name,
                    "amount": f"{Decimal(str(amount)):.2f}",
                    "currency": currency.upper(),
                    "purpose": source,
                },
                entity_type="donation",
                entity_id=donation["id"],
            )
        return donation

    async def log_external_payment(
        self,
        *,
        provider_event_id: str,
        donor_email: str | None,
        amount: float,
        currency: str,
        status: str,
        civicrm_contribution_id: int | None = None,
        donor_name: str | None = None,
    ) -> dict[str, Any]:
        normalized_status = (status or "completed").lower()
        if civicrm_contribution_id:
            existing = await fetchrow(
                """
                SELECT id, civicrm_contribution_id, donor_email, amount, currency, status, donation_date
                FROM donations
                WHERE civicrm_contribution_id = $1
                """,
                civicrm_contribution_id,
            )
            if existing:
                return dict(existing)
        if provider_event_id:
            existing = await fetchrow(
                """
                SELECT id, civicrm_contribution_id, donor_email, amount, currency, status, donation_date
                FROM donations
                WHERE notes = $1
                ORDER BY id DESC
                LIMIT 1
                """,
                provider_event_id,
            )
            if existing:
                return dict(existing)

        donation = await self.record_successful_donation(
            donor_email=donor_email or "",
            donor_name=donor_name or donor_email or "Unterstützer/in",
            amount=amount,
            currency=currency,
            donation_type="one_time",
            source="stripe_webhook_n8n",
            gateway_charge_id=provider_event_id,
            civicrm_contribution_id=civicrm_contribution_id,
            send_receipt_email=False,
        )
        if normalized_status not in {"completed", "paid", "succeeded"}:
            await execute(
                "UPDATE donations SET status = $1, updated_at = NOW() WHERE id = $2",
                normalized_status,
                donation["id"],
            )
            donation["status"] = normalized_status
        await execute(
            """
            INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload, status)
            VALUES ('payment_logged', 'donation', $1, $2::jsonb, 'pending')
            """,
            str(donation["id"]),
            json.dumps(
                {
                    "provider_event_id": provider_event_id,
                    "status": normalized_status,
                    "civicrm_contribution_id": civicrm_contribution_id,
                }
            ),
        )
        return donation


donation_service = DonationService()

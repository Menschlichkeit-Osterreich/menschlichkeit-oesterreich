from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import secrets
from datetime import date, timedelta
from decimal import Decimal
from typing import Any
from xml.etree import ElementTree as ET

import httpx

from ..db import connection, execute, fetch, fetchrow, fetchval
from .crm_service import crm_service
from .mail_service import mail_service

logger = logging.getLogger("menschlichkeit.payments")


def _to_cents(amount: float | Decimal) -> int:
    return int(Decimal(str(amount)) * 100)


def _money(value: Any) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


class PaymentService:
    def __init__(self) -> None:
        self.stripe_secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
        self.stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
        self.paypal_client_id = os.getenv("PAYPAL_CLIENT_ID", "").strip()
        self.paypal_client_secret = os.getenv("PAYPAL_CLIENT_SECRET", "").strip()
        self.paypal_base_url = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com").rstrip("/")

    async def _resolve_contact_id(
        self,
        *,
        email: str | None,
        donor_name: str | None = None,
        civicrm_contact_id: int | None = None,
        source: str = "website_payment",
    ) -> int | None:
        if civicrm_contact_id:
            return civicrm_contact_id
        if not email:
            return None
        existing = await crm_service.find_contact_by_email(email)
        if existing and existing.get("id"):
            return int(existing["id"])
        name_parts = (donor_name or "").strip().split()
        first_name = name_parts[0] if name_parts else "Unterstützer/in"
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Menschlichkeit"
        created = await crm_service.upsert_contact(
            email=email,
            first_name=first_name,
            last_name=last_name,
            source=source,
        )
        if created and created.get("id"):
            return int(created["id"])
        return None

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
        resolved_contact_id = await self._resolve_contact_id(
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
        resolved_contact_id = await self._resolve_contact_id(email=email, donor_name=email, source="paypal_order")
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
        await self.record_successful_donation(
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

        resolved_contact_id = await self._resolve_contact_id(
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

    async def create_invoice_from_contact(
        self,
        *,
        contact: dict[str, Any],
        invoice_type: str,
        items: list[dict[str, Any]],
        issue_date: str | None = None,
        due_date: str | None = None,
        created_by: str = "n8n_membership_invoicing",
    ) -> dict[str, Any]:
        if not items:
            raise ValueError("Mindestens eine Rechnungsposition ist erforderlich")

        civicrm_contact_id = contact.get("contact_id") or contact.get("id") or contact.get("civicrm_contact_id")
        email = contact.get("email") or contact.get("email_primary.email")
        display_name = contact.get("display_name") or contact.get("recipient_name") or email
        if not civicrm_contact_id and email:
            existing = await crm_service.find_contact_by_email(str(email))
            if existing and existing.get("id"):
                civicrm_contact_id = int(existing["id"])
        if not civicrm_contact_id:
            raise ValueError("CiviCRM-Kontakt-ID fehlt für die Rechnungserstellung")
        if not email:
            raise ValueError("Empfänger-E-Mail fehlt für die Rechnungserstellung")

        recipient_address = "\n".join(
            part
            for part in [
                contact.get("street_address"),
                " ".join(
                    part for part in [contact.get("postal_code"), contact.get("city")] if part
                ).strip(),
                contact.get("country"),
            ]
            if part
        ) or None

        today = date.fromisoformat(issue_date) if issue_date else date.today()
        due = date.fromisoformat(due_date) if due_date else today + timedelta(days=14)
        subtotal = Decimal("0.00")
        normalized_items: list[dict[str, Any]] = []
        for idx, item in enumerate(items, start=1):
            quantity = _money(item.get("quantity", 1))
            unit_price = _money(item.get("unit_price", 0))
            total_price = (quantity * unit_price).quantize(Decimal("0.01"))
            subtotal += total_price
            normalized_items.append(
                {
                    "position": idx,
                    "description": item.get("description") or f"Position {idx}",
                    "quantity": quantity,
                    "unit": item.get("unit"),
                    "unit_price": unit_price,
                    "total_price": total_price,
                    "tax_rate": _money(item.get("tax_rate", 0)),
                }
            )

        invoice_number = f"MOE-{today.strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"
        async with connection() as conn:
            async with conn.transaction():
                invoice_id = await conn.fetchval(
                    """
                    INSERT INTO invoices (
                        invoice_number, civicrm_contact_id, recipient_name, recipient_email,
                        recipient_address, total_amount, tax_amount, currency, issue_date,
                        due_date, status, invoice_type, notes, created_at, updated_at
                    )
                    VALUES ($1,$2,$3,$4,$5,$6,0,'EUR',$7,$8,'draft',$9,$10,NOW(),NOW())
                    RETURNING id
                    """,
                    invoice_number,
                    int(civicrm_contact_id),
                    str(display_name),
                    str(email),
                    recipient_address,
                    subtotal,
                    today,
                    due,
                    invoice_type,
                    f"Automatisch erstellt durch {created_by}",
                )
                for item in normalized_items:
                    await conn.execute(
                        """
                        INSERT INTO invoice_items (
                            invoice_id, position, description, quantity, unit, unit_price, total_price, tax_rate
                        )
                        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                        """,
                        invoice_id,
                        item["position"],
                        item["description"],
                        item["quantity"],
                        item["unit"],
                        item["unit_price"],
                        item["total_price"],
                        item["tax_rate"],
                    )
                await conn.execute(
                    """
                    INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload, status)
                    VALUES ('invoice_created', 'invoice', $1, $2::jsonb, 'pending')
                    """,
                    str(invoice_id),
                    json.dumps(
                        {
                            "invoice_number": invoice_number,
                            "recipient_email": email,
                            "invoice_type": invoice_type,
                            "total_amount": f"{subtotal:.2f}",
                        }
                    ),
                )
        return {
            "id": invoice_id,
            "invoice_number": invoice_number,
            "civicrm_contact_id": int(civicrm_contact_id),
            "recipient_name": str(display_name),
            "recipient_email": str(email),
            "recipient_address": recipient_address,
            "total_amount": float(subtotal),
            "currency": "EUR",
            "issue_date": today.isoformat(),
            "due_date": due.isoformat(),
            "status": "draft",
            "invoice_type": invoice_type,
            "items": [
                {
                    **item,
                    "quantity": float(item["quantity"]),
                    "unit_price": float(item["unit_price"]),
                    "total_price": float(item["total_price"]),
                    "tax_rate": float(item["tax_rate"]),
                }
                for item in normalized_items
            ],
        }

    async def list_collectible_sepa_transactions(self) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT
                i.id AS invoice_id,
                i.invoice_number,
                i.civicrm_contact_id,
                i.recipient_name,
                i.recipient_email,
                i.total_amount,
                i.currency,
                i.due_date::text AS due_date,
                m.id AS mandate_id,
                m.mandate_reference,
                m.mandate_type,
                m.iban,
                m.bic,
                m.account_holder
            FROM invoices i
            JOIN sepa_mandates m ON m.civicrm_contact_id = i.civicrm_contact_id
            WHERE i.invoice_type = 'membership'
              AND i.status IN ('draft', 'sent', 'open', 'overdue', 'pending')
              AND m.is_active = TRUE
            ORDER BY i.due_date ASC, i.id ASC
            """
        )
        return [
            {
                "invoice_id": row["invoice_id"],
                "invoice_number": row["invoice_number"],
                "civicrm_contact_id": row["civicrm_contact_id"],
                "recipient_name": row["recipient_name"],
                "recipient_email": row["recipient_email"],
                "amount": float(_money(row["total_amount"])),
                "currency": row["currency"],
                "due_date": row["due_date"],
                "mandate_id": row["mandate_id"],
                "mandate_reference": row["mandate_reference"],
                "mandate_type": row["mandate_type"],
                "iban": row["iban"],
                "bic": row["bic"],
                "account_holder": row["account_holder"],
                "description": f"Mitgliedsbeitrag {row['invoice_number']}",
            }
            for row in rows
        ]

    async def export_sepa_batch(
        self,
        *,
        transactions: list[dict[str, Any]],
        collection_date: str,
    ) -> dict[str, Any]:
        if not transactions:
            raise ValueError("Keine SEPA-Transaktionen für den Export vorhanden")

        total_amount = sum((_money(tx.get("amount")) for tx in transactions), Decimal("0.00"))
        batch_reference = f"SEPA-{collection_date.replace('-', '')}-{secrets.token_hex(3).upper()}"
        xml_content = self._build_pain008_xml(
            transactions=transactions,
            collection_date=collection_date,
            batch_reference=batch_reference,
            total_amount=total_amount,
        )

        async with connection() as conn:
            async with conn.transaction():
                batch_id = await conn.fetchval(
                    """
                    INSERT INTO sepa_batches (
                        batch_reference, batch_type, collection_date, total_amount, mandate_count, status, pain_xml, created_at
                    )
                    VALUES ($1, 'RCUR', $2, $3, $4, 'pending', $5, NOW())
                    RETURNING id
                    """,
                    batch_reference,
                    collection_date,
                    total_amount,
                    len(transactions),
                    xml_content,
                )
                for tx in transactions:
                    mandate_id = tx.get("mandate_id")
                    if not mandate_id:
                        continue
                    await conn.execute(
                        """
                        INSERT INTO sepa_batch_items (batch_id, mandate_id, amount, description, status)
                        VALUES ($1,$2,$3,$4,'pending')
                        """,
                        batch_id,
                        int(mandate_id),
                        _money(tx.get("amount")),
                        (tx.get("description") or tx.get("invoice_number") or "SEPA-Lastschrift")[:140],
                    )
                await conn.execute(
                    """
                    INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload, status)
                    VALUES ('sepa_batch_created', 'sepa_batch', $1, $2::jsonb, 'pending')
                    """,
                    str(batch_id),
                    json.dumps(
                        {
                            "batch_reference": batch_reference,
                            "collection_date": collection_date,
                            "transaction_count": len(transactions),
                            "total_amount": f"{total_amount:.2f}",
                        }
                    ),
                )

        return {
            "id": batch_id,
            "batch_id": batch_reference,
            "xml_content": xml_content,
            "transaction_count": len(transactions),
            "total_amount": float(total_amount),
            "collection_date": collection_date,
        }

    async def process_sepa_membership_payment(
        self,
        *,
        member_id: str,
        amount: float,
        crm_payment_id: str | None = None,
    ) -> dict[str, Any]:
        member = await fetchrow(
            """
            SELECT id, email, vorname, nachname, civicrm_contact_id
            FROM members
            WHERE id = $1::uuid
            """,
            member_id,
        )
        if not member:
            raise ValueError("Mitglied nicht gefunden")

        contact_id = member["civicrm_contact_id"]
        if not contact_id and member["email"]:
            contact_id = await self._resolve_contact_id(
                email=member["email"],
                donor_name=f"{member['vorname']} {member['nachname']}".strip(),
                source="sepa_membership_payment",
            )

        invoice = None
        if contact_id:
            invoice = await fetchrow(
                """
                SELECT id, invoice_number, total_amount
                FROM invoices
                WHERE civicrm_contact_id = $1
                  AND invoice_type = 'membership'
                  AND status IN ('draft', 'sent', 'open', 'overdue', 'pending')
                ORDER BY due_date ASC NULLS LAST, id ASC
                LIMIT 1
                """,
                int(contact_id),
            )

        async with connection() as conn:
            async with conn.transaction():
                payment_intent_id = await conn.fetchval(
                    """
                    INSERT INTO payment_intents (
                        invoice_id, civicrm_contact_id, payment_method, gateway_charge_id, gateway_response,
                        amount, currency, status, created_at, updated_at, succeeded_at
                    )
                    VALUES ($1,$2,'sepa_debit',$3,$4::jsonb,$5,'EUR','succeeded',NOW(),NOW(),NOW())
                    RETURNING id
                    """,
                    invoice["id"] if invoice else None,
                    int(contact_id) if contact_id else None,
                    crm_payment_id,
                    json.dumps({"crm_payment_id": crm_payment_id, "member_id": member_id}),
                    _money(amount),
                )
                await conn.execute(
                    """
                    INSERT INTO payments (amount_cents, booked_at, description, payer_type, is_recurring, created_at)
                    VALUES ($1, NOW(), $2, 'member', TRUE, NOW())
                    """,
                    _to_cents(amount),
                    f"SEPA-Mitgliedsbeitrag {member['email']}",
                )
                if invoice:
                    await conn.execute(
                        """
                        UPDATE invoices
                        SET status = 'paid', paid_at = NOW(), updated_at = NOW(),
                            notes = COALESCE(notes, '') || $1
                        WHERE id = $2
                        """,
                        f"\nSEPA-Zahlung verbucht: {crm_payment_id or payment_intent_id}",
                        invoice["id"],
                    )
                await conn.execute(
                    """
                    INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload, status)
                    VALUES ('membership_payment_confirmed', 'member', $1, $2::jsonb, 'pending')
                    """,
                    str(member["id"]),
                    json.dumps(
                        {
                            "member_id": str(member["id"]),
                            "payment_intent_id": payment_intent_id,
                            "crm_payment_id": crm_payment_id,
                            "invoice_id": invoice["id"] if invoice else None,
                            "amount": f"{_money(amount):.2f}",
                        }
                    ),
                )

        if contact_id:
            await crm_service.create_contribution(
                contact_id=int(contact_id),
                amount=amount,
                source="SEPA-Mitgliedsbeitrag",
            )

        return {
            "success": True,
            "member_id": str(member["id"]),
            "payment_intent_id": payment_intent_id,
            "invoice_id": invoice["id"] if invoice else None,
            "invoice_number": invoice["invoice_number"] if invoice else None,
            "amount": float(_money(amount)),
            "currency": "EUR",
            "status": "succeeded",
        }

    def _build_pain008_xml(
        self,
        *,
        transactions: list[dict[str, Any]],
        collection_date: str,
        batch_reference: str,
        total_amount: Decimal,
    ) -> str:
        creditor_name = os.getenv("SEPA_CREDITOR_NAME", "Menschlichkeit Österreich").strip()
        creditor_id = os.getenv("SEPA_CREDITOR_ID", "AT00ZZZ00000000000").strip()
        creditor_iban = os.getenv("SEPA_CREDITOR_IBAN", "AT000000000000000000").strip()
        creditor_bic = os.getenv("SEPA_CREDITOR_BIC", "SPUEAT21XXX").strip()

        root = ET.Element(
            "Document",
            {"xmlns": "urn:iso:std:iso:20022:tech:xsd:pain.008.001.02"},
        )
        customer = ET.SubElement(root, "CstmrDrctDbtInitn")
        group_header = ET.SubElement(customer, "GrpHdr")
        ET.SubElement(group_header, "MsgId").text = batch_reference
        ET.SubElement(group_header, "CreDtTm").text = f"{collection_date}T00:00:00"
        ET.SubElement(group_header, "NbOfTxs").text = str(len(transactions))
        ET.SubElement(group_header, "CtrlSum").text = f"{total_amount:.2f}"
        initiator = ET.SubElement(group_header, "InitgPty")
        ET.SubElement(initiator, "Nm").text = creditor_name

        payment_info = ET.SubElement(customer, "PmtInf")
        ET.SubElement(payment_info, "PmtInfId").text = batch_reference
        ET.SubElement(payment_info, "PmtMtd").text = "DD"
        ET.SubElement(payment_info, "BtchBookg").text = "true"
        ET.SubElement(payment_info, "NbOfTxs").text = str(len(transactions))
        ET.SubElement(payment_info, "CtrlSum").text = f"{total_amount:.2f}"

        service_level = ET.SubElement(ET.SubElement(payment_info, "PmtTpInf"), "SvcLvl")
        ET.SubElement(service_level, "Cd").text = "SEPA"
        ET.SubElement(payment_info, "ReqdColltnDt").text = collection_date

        creditor = ET.SubElement(payment_info, "Cdtr")
        ET.SubElement(creditor, "Nm").text = creditor_name
        creditor_account = ET.SubElement(payment_info, "CdtrAcct")
        ET.SubElement(ET.SubElement(creditor_account, "Id"), "IBAN").text = creditor_iban
        creditor_agent = ET.SubElement(payment_info, "CdtrAgt")
        ET.SubElement(ET.SubElement(creditor_agent, "FinInstnId"), "BIC").text = creditor_bic
        ET.SubElement(payment_info, "ChrgBr").text = "SLEV"
        creditor_scheme = ET.SubElement(payment_info, "CdtrSchmeId")
        scheme_party = ET.SubElement(creditor_scheme, "Id")
        private_id = ET.SubElement(scheme_party, "PrvtId")
        other = ET.SubElement(private_id, "Othr")
        ET.SubElement(other, "Id").text = creditor_id
        ET.SubElement(ET.SubElement(other, "SchmeNm"), "Prtry").text = "SEPA"

        for index, tx in enumerate(transactions, start=1):
            amount = _money(tx.get("amount"))
            tx_node = ET.SubElement(payment_info, "DrctDbtTxInf")
            payment_id = ET.SubElement(tx_node, "PmtId")
            ET.SubElement(payment_id, "EndToEndId").text = (
                tx.get("invoice_number")
                or tx.get("mandate_reference")
                or f"{batch_reference}-{index}"
            )
            ET.SubElement(tx_node, "InstdAmt", {"Ccy": tx.get("currency") or "EUR"}).text = f"{amount:.2f}"
            direct_debit = ET.SubElement(tx_node, "DrctDbtTx")
            mandate_info = ET.SubElement(direct_debit, "MndtRltdInf")
            ET.SubElement(mandate_info, "MndtId").text = str(tx.get("mandate_reference") or tx.get("mandate_id") or f"MANDATE-{index}")
            ET.SubElement(mandate_info, "DtOfSgntr").text = tx.get("signed_date") or collection_date
            debtor_agent = ET.SubElement(tx_node, "DbtrAgt")
            ET.SubElement(ET.SubElement(debtor_agent, "FinInstnId"), "BIC").text = tx.get("bic") or "NOTPROVIDED"
            debtor = ET.SubElement(tx_node, "Dbtr")
            ET.SubElement(debtor, "Nm").text = tx.get("account_holder") or tx.get("recipient_name") or "Unbekannt"
            debtor_account = ET.SubElement(tx_node, "DbtrAcct")
            ET.SubElement(ET.SubElement(debtor_account, "Id"), "IBAN").text = tx.get("iban") or ""
            remittance = ET.SubElement(tx_node, "RmtInf")
            ET.SubElement(remittance, "Ustrd").text = (tx.get("description") or tx.get("invoice_number") or "Mitgliedsbeitrag")[:140]

        return ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")

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

    async def record_webhook_event(self, *, provider: str, event_id: str, payload: dict[str, Any], signature_valid: bool) -> bool:
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


payment_service = PaymentService()

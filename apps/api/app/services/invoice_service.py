from __future__ import annotations

import json
import logging
import secrets
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from ..db import connection
from .crm_service import crm_service
from ._payment_helpers import _money

logger = logging.getLogger("menschlichkeit.payments.invoice")


class InvoiceService:

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


invoice_service = InvoiceService()

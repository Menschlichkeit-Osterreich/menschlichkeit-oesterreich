from __future__ import annotations

import json
import logging
import os
import secrets
from decimal import Decimal
from typing import Any
from xml.etree import ElementTree as ET

from ..db import connection, execute, fetch, fetchrow
from ..secrets_provider import get_secret
from .crm_service import crm_service
from .finance_sync_service import finance_sync_service
from ._payment_helpers import _money, _to_cents, _resolve_contact_id

logger = logging.getLogger("menschlichkeit.payments.sepa")


class SepaService:

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
            contact_id = await _resolve_contact_id(
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
        if invoice:
            try:
                await finance_sync_service.enqueue_invoice_payment(
                    {
                        "id": str(invoice["id"]),
                        "invoice_number": invoice["invoice_number"],
                        "recipient_name": f"{member['vorname']} {member['nachname']}".strip() or member["email"],
                        "recipient_email": member["email"],
                        "currency": "EUR",
                        "total_amount": float(_money(invoice["total_amount"])),
                    },
                    {
                        "amount": float(_money(amount)),
                        "channel": "sepa",
                        "reference_no": crm_payment_id or payment_intent_id,
                    },
                )
            except Exception as exc:
                logger.warning(
                    "erpnext_sepa_payment_enqueue_failed | invoice_id=%s | error=%s",
                    invoice["id"],
                    exc,
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
        creditor_name = get_secret("SEPA_CREDITOR_NAME", "Menschlichkeit Österreich", bsm_key="api/SEPA_CREDITOR_NAME").strip()
        creditor_id = get_secret("SEPA_CREDITOR_ID", "AT00ZZZ00000000000", bsm_key="api/SEPA_CREDITOR_ID").strip()
        creditor_iban = get_secret("SEPA_CREDITOR_IBAN", "AT000000000000000000", bsm_key="api/SEPA_CREDITOR_IBAN").strip()
        creditor_bic = get_secret("SEPA_CREDITOR_BIC", "SPUEAT21XXX", bsm_key="api/SEPA_CREDITOR_BIC").strip()

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


sepa_service = SepaService()

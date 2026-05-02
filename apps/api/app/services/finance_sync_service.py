from __future__ import annotations

import json
import logging
from datetime import date
from decimal import Decimal
from hashlib import sha256
from typing import Any

from ..db import connection, execute, fetch, fetchrow, fetchval
from ..schemas.erpnext import (
    ErpNextCustomerPayload,
    ErpNextJournalEntryPayload,
    ErpNextJournalEntryLine,
    ErpNextPaymentEntryPayload,
    ErpNextPaymentReference,
    ErpNextPurchaseInvoicePayload,
    ErpNextSalesInvoicePayload,
    ErpNextSupplierPayload,
    ErpNextSyncResult,
)
from .crm_service import crm_service
from .erpnext_client import ErpNextClientError, erpnext_client
from .finance_mapping import (
    finance_mapping_snapshot,
    get_finance_mapping_config,
    resolve_clearing_account,
    resolve_income_mapping,
)

logger = logging.getLogger("menschlichkeit.finance.sync")


def _stable_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=True, sort_keys=True, separators=(",", ":"))


def _payload_hash(payload: dict[str, Any]) -> str:
    return sha256(_stable_json(payload).encode("utf-8")).hexdigest()


def _idempotency_key(
    *,
    source_system: str,
    source_entity_type: str,
    source_entity_id: str,
    operation: str,
) -> str:
    base = f"{source_system}:{source_entity_type}:{source_entity_id}:{operation}"
    return sha256(base.encode("utf-8")).hexdigest()


def _to_amount(value: Any) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


class FinanceSyncService:
    async def ensure_tables(self) -> None:
        await execute(
            """
            CREATE TABLE IF NOT EXISTS finance_external_sync (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source_system TEXT NOT NULL,
                source_entity_type TEXT NOT NULL,
                source_entity_id TEXT NOT NULL,
                target_system TEXT NOT NULL DEFAULT 'erpnext',
                target_doctype TEXT,
                target_docname TEXT,
                operation TEXT NOT NULL,
                idempotency_key TEXT NOT NULL UNIQUE,
                payload_hash TEXT NOT NULL,
                payload JSONB NOT NULL DEFAULT '{}'::jsonb,
                status TEXT NOT NULL DEFAULT 'pending',
                attempts INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                next_retry_at TIMESTAMPTZ,
                last_success_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        await execute(
            """
            CREATE INDEX IF NOT EXISTS ix_finance_external_sync_status_retry
            ON finance_external_sync(status, next_retry_at, created_at);
            """
        )
        await execute(
            """
            CREATE INDEX IF NOT EXISTS ix_finance_external_sync_source
            ON finance_external_sync(source_entity_type, source_entity_id, operation);
            """
        )

    async def enqueue_sync(
        self,
        *,
        source_system: str,
        source_entity_type: str,
        source_entity_id: str,
        operation: str,
        payload: dict[str, Any],
        target_doctype: str,
    ) -> dict[str, Any]:
        await self.ensure_tables()
        payload_hash = _payload_hash(payload)
        idempotency_key = _idempotency_key(
            source_system=source_system,
            source_entity_type=source_entity_type,
            source_entity_id=source_entity_id,
            operation=operation,
        )
        row = await fetchrow(
            """
            INSERT INTO finance_external_sync (
                source_system, source_entity_type, source_entity_id, target_doctype,
                operation, idempotency_key, payload_hash, payload, status, attempts, updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,'pending',0,NOW())
            ON CONFLICT (idempotency_key)
            DO UPDATE SET payload_hash = EXCLUDED.payload_hash,
                          payload = EXCLUDED.payload,
                          target_doctype = EXCLUDED.target_doctype,
                          updated_at = NOW()
            RETURNING *
            """,
            source_system,
            source_entity_type,
            source_entity_id,
            target_doctype,
            operation,
            idempotency_key,
            payload_hash,
            _stable_json(payload),
        )
        return dict(row) if row else {}

    async def enqueue_donation(self, donation: dict[str, Any]) -> list[dict[str, Any]]:
        cfg = get_finance_mapping_config()
        income = resolve_income_mapping("donation")
        amount = _to_amount(donation.get("amount"))
        source_id = str(donation["id"])
        sales_payload = {
            "customer_name": donation.get("donor_name") or donation.get("donor_email") or "Unterstützer/in",
            "email": donation.get("donor_email"),
            "posting_date": str(donation.get("donation_date") or date.today()),
            "due_date": str(donation.get("donation_date") or date.today()),
            "currency": donation.get("currency") or "EUR",
            "company": cfg.company,
            "remarks": f"Spende {source_id}",
            "custom_external_reference": f"donation:{source_id}",
            "items": [
                {
                    "item_code": income["item_code"],
                    "description": income["label"],
                    "qty": 1,
                    "rate": float(amount),
                    "amount": float(amount),
                    "income_account": income["income_account"],
                    "cost_center": cfg.cost_center_default,
                }
            ],
        }
        payment_payload = {
            "party_name": donation.get("donor_name") or donation.get("donor_email") or "Unterstützer/in",
            "party_email": donation.get("donor_email"),
            "payment_type": "Receive",
            "posting_date": str(donation.get("donation_date") or date.today()),
            "amount": float(amount),
            "currency": donation.get("currency") or "EUR",
            "channel": donation.get("source") or "bank_transfer",
            "reference_no": donation.get("civicrm_contribution_id") or donation.get("id"),
            "civicrm_contribution_id": donation.get("civicrm_contribution_id"),
            "remarks": f"Spendenzahlung {source_id}",
            "invoice_source_entity_type": "donation",
            "invoice_source_entity_id": source_id,
            "custom_external_reference": f"donation:{source_id}:payment",
        }
        invoice_row = await self.enqueue_sync(
            source_system="platform",
            source_entity_type="donation",
            source_entity_id=source_id,
            operation="sales_invoice.create",
            payload=sales_payload,
            target_doctype="Sales Invoice",
        )
        payment_row = await self.enqueue_sync(
            source_system="platform",
            source_entity_type="donation",
            source_entity_id=source_id,
            operation="payment_entry.receive",
            payload=payment_payload,
            target_doctype="Payment Entry",
        )
        return [invoice_row, payment_row]

    async def enqueue_invoice(self, invoice: dict[str, Any]) -> dict[str, Any]:
        cfg = get_finance_mapping_config()
        source_id = str(invoice["id"])
        items = invoice.get("items") or []
        if not items:
            amount = _to_amount(invoice.get("total_amount"))
            income = resolve_income_mapping(invoice.get("invoice_type") or "membership_fee")
            items = [
                {
                    "item_code": income["item_code"],
                    "description": income["label"],
                    "qty": 1,
                    "rate": float(amount),
                    "amount": float(amount),
                    "income_account": income["income_account"],
                    "cost_center": cfg.cost_center_default,
                }
            ]
        payload = {
            "customer_name": invoice.get("recipient_name") or invoice.get("recipient_email") or "Mitglied",
            "email": invoice.get("recipient_email"),
            "posting_date": invoice.get("issue_date"),
            "due_date": invoice.get("due_date"),
            "currency": invoice.get("currency") or "EUR",
            "company": cfg.company,
            "remarks": f"Plattformrechnung {invoice.get('invoice_number')}",
            "custom_external_reference": f"invoice:{source_id}",
            "items": items,
        }
        return await self.enqueue_sync(
            source_system="platform",
            source_entity_type="invoice",
            source_entity_id=source_id,
            operation="sales_invoice.create",
            payload=payload,
            target_doctype="Sales Invoice",
        )

    async def enqueue_invoice_payment(self, invoice: dict[str, Any], payment_data: dict[str, Any]) -> dict[str, Any]:
        payload = {
            "party_name": invoice.get("recipient_name") or invoice.get("recipient_email") or "Mitglied",
            "party_email": invoice.get("recipient_email"),
            "payment_type": "Receive",
            "posting_date": str(payment_data.get("posting_date") or date.today()),
            "amount": float(_to_amount(payment_data.get("amount") or payment_data.get("paid_amount") or invoice.get("total_amount"))),
            "currency": payment_data.get("currency") or invoice.get("currency") or "EUR",
            "channel": payment_data.get("channel") or payment_data.get("payment_method") or "bank_transfer",
            "reference_no": payment_data.get("reference_no") or payment_data.get("transaction_id") or invoice.get("invoice_number"),
            "civicrm_contribution_id": invoice.get("civicrm_contribution_id"),
            "remarks": f"Zahlung zu Rechnung {invoice.get('invoice_number')}",
            "invoice_source_entity_type": "invoice",
            "invoice_source_entity_id": str(invoice["id"]),
            "custom_external_reference": f"invoice:{invoice['id']}:payment",
        }
        return await self.enqueue_sync(
            source_system="platform",
            source_entity_type="invoice_payment",
            source_entity_id=str(invoice["id"]),
            operation="payment_entry.receive",
            payload=payload,
            target_doctype="Payment Entry",
        )

    async def create_payable_now(self, payload: dict[str, Any]) -> dict[str, Any]:
        await self.ensure_tables()
        cfg = get_finance_mapping_config()
        supplier_name = str(payload.get("supplier_name") or "").strip()
        if not supplier_name:
            raise ValueError("supplier_name ist erforderlich")
        amount = _to_amount(payload.get("amount"))
        description = str(payload.get("description") or "Ausgabe").strip()
        source_id = str(payload.get("external_reference") or f"payable:{supplier_name}:{payload.get('due_date') or date.today()}")
        supplier = await erpnext_client.ensure_supplier(
            ErpNextSupplierPayload(
                supplier_name=supplier_name,
                email_id=payload.get("supplier_email"),
                supplier_group=cfg.supplier_group,
                external_reference=source_id,
            )
        )
        result = await erpnext_client.create_purchase_invoice(
            ErpNextPurchaseInvoicePayload(
                supplier=supplier,
                company=cfg.company,
                currency=payload.get("currency") or "EUR",
                bill_date=payload.get("bill_date"),
                due_date=payload.get("due_date"),
                posting_date=payload.get("posting_date"),
                remarks=description,
                custom_external_reference=source_id,
                items=[
                    {
                        "item_code": payload.get("item_code") or "EXPENSE",
                        "description": description,
                        "qty": float(payload.get("qty") or 1),
                        "rate": float(amount),
                        "amount": float(amount),
                        "expense_account": payload.get("expense_account") or cfg.expense_account_default,
                        "cost_center": payload.get("cost_center") or cfg.cost_center_default,
                        "uom": payload.get("uom") or "Nos",
                        "conversion_factor": 1.0,
                    }
                ],
            )
        )
        record = await self.enqueue_sync(
            source_system="portal",
            source_entity_type="payable",
            source_entity_id=source_id,
            operation="purchase_invoice.create",
            payload=payload,
            target_doctype="Purchase Invoice",
        )
        await execute(
            """
            UPDATE finance_external_sync
            SET status = 'success', target_docname = $1, last_success_at = NOW(), updated_at = NOW(), attempts = attempts + 1
            WHERE id = $2::uuid
            """,
            result.name,
            record["id"],
        )
        return {"sync_id": str(record["id"]), "target_name": result.name}

    async def create_manual_journal_now(self, payload: dict[str, Any]) -> dict[str, Any]:
        await self.ensure_tables()
        cfg = get_finance_mapping_config()
        lines = payload.get("lines") or []
        if len(lines) < 2:
            raise ValueError("Mindestens zwei Buchungszeilen sind erforderlich")
        entry = ErpNextJournalEntryPayload(
            company=cfg.company,
            posting_date=payload.get("posting_date"),
            user_remark=payload.get("memo") or payload.get("user_remark"),
            naming_series=payload.get("naming_series") or None,
            custom_external_reference=payload.get("external_reference"),
            accounts=[
                ErpNextJournalEntryLine(
                    account=line["account"],
                    debit_in_account_currency=float(line.get("debit") or 0),
                    credit_in_account_currency=float(line.get("credit") or 0),
                    cost_center=line.get("cost_center") or cfg.cost_center_default,
                    user_remark=line.get("remark"),
                )
                for line in lines
            ],
        )
        result = await erpnext_client.create_journal_entry(entry)
        source_id = str(payload.get("external_reference") or result.name)
        record = await self.enqueue_sync(
            source_system="portal",
            source_entity_type="journal",
            source_entity_id=source_id,
            operation="journal_entry.create",
            payload=payload,
            target_doctype="Journal Entry",
        )
        await execute(
            """
            UPDATE finance_external_sync
            SET status = 'success', target_docname = $1, last_success_at = NOW(), updated_at = NOW(), attempts = attempts + 1
            WHERE id = $2::uuid
            """,
            result.name,
            record["id"],
        )
        return {"sync_id": str(record["id"]), "target_name": result.name}

    async def get_sync_health(self) -> dict[str, Any]:
        await self.ensure_tables()
        rows = await fetch(
            """
            SELECT status, COUNT(*)::int AS count
            FROM finance_external_sync
            GROUP BY status
            """
        )
        counts = {row["status"]: int(row["count"]) for row in rows}
        latest_success = await fetchval("SELECT MAX(last_success_at) FROM finance_external_sync")
        failures = await fetch(
            """
            SELECT id, source_entity_type, source_entity_id, operation, last_error, attempts, updated_at
            FROM finance_external_sync
            WHERE status = 'failed'
            ORDER BY updated_at DESC
            LIMIT 10
            """
        )
        return {
            "pending": counts.get("pending", 0),
            "processing": counts.get("processing", 0),
            "failed": counts.get("failed", 0),
            "success": counts.get("success", 0),
            "latest_success_at": str(latest_success) if latest_success else None,
            "failures": [dict(row) for row in failures],
            "erpnext_enabled": erpnext_client.enabled,
        }

    async def list_sync_records(self, *, status_filter: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        await self.ensure_tables()
        if status_filter:
            rows = await fetch(
                """
                SELECT *
                FROM finance_external_sync
                WHERE status = $1
                ORDER BY created_at DESC
                LIMIT $2
                """,
                status_filter,
                limit,
            )
        else:
            rows = await fetch(
                """
                SELECT *
                FROM finance_external_sync
                ORDER BY created_at DESC
                LIMIT $1
                """,
                limit,
            )
        return [dict(row) for row in rows]

    async def requeue_sync(self, sync_id: str) -> dict[str, Any]:
        await self.ensure_tables()
        row = await fetchrow(
            """
            UPDATE finance_external_sync
            SET status = 'pending', next_retry_at = NOW(), last_error = NULL, updated_at = NOW()
            WHERE id = $1::uuid
            RETURNING *
            """,
            sync_id,
        )
        if not row:
            raise ValueError("Sync-Eintrag nicht gefunden")
        return dict(row)

    async def process_pending(self, *, limit: int = 20) -> dict[str, Any]:
        await self.ensure_tables()
        rows = await fetch(
            """
            SELECT *
            FROM finance_external_sync
            WHERE status IN ('pending', 'failed')
              AND (next_retry_at IS NULL OR next_retry_at <= NOW())
            ORDER BY created_at ASC
            LIMIT $1
            """,
            limit,
        )
        processed: list[dict[str, Any]] = []
        for row in rows:
            processed.append(await self._process_record(dict(row)))
        return {"processed": processed, "count": len(processed)}

    async def build_cockpit_snapshot(self) -> dict[str, Any]:
        sync = await self.get_sync_health()
        snapshot = {
            "source_system": "erpnext" if erpnext_client.enabled else "legacy",
            "erpnext_enabled": erpnext_client.enabled,
            "mapping": finance_mapping_snapshot(),
            "sync": sync,
            "receivables": [],
            "payables": [],
            "bank_accounts": [],
            "payroll_runs": [],
            "assets": [],
            "expense_claims": [],
        }
        if erpnext_client.enabled:
            try:
                snapshot["receivables"] = await erpnext_client.receivables_summary()
                snapshot["payables"] = await erpnext_client.payables_summary()
                snapshot["bank_accounts"] = await erpnext_client.bank_accounts_summary()
                snapshot["payroll_runs"] = await erpnext_client.payroll_entries_summary()
                snapshot["assets"] = await erpnext_client.assets_summary()
                snapshot["expense_claims"] = await erpnext_client.expense_claims_summary()
            except Exception as exc:
                logger.warning("erpnext_cockpit_fetch_failed | error=%s", exc)
                snapshot["sync"]["failures"] = [
                    *snapshot["sync"]["failures"],
                    {
                        "id": "erpnext-cockpit",
                        "source_entity_type": "erpnext",
                        "source_entity_id": "cockpit",
                        "operation": "snapshot.read",
                        "last_error": str(exc),
                        "attempts": 0,
                        "updated_at": None,
                    },
                ]
        return snapshot

    async def _process_record(self, row: dict[str, Any]) -> dict[str, Any]:
        sync_id = str(row["id"])
        payload = row.get("payload") or {}
        if isinstance(payload, str):
            payload = json.loads(payload)
        await execute(
            """
            UPDATE finance_external_sync
            SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
            WHERE id = $1::uuid
            """,
            sync_id,
        )
        try:
            result = await self._dispatch_operation(row, payload)
            await execute(
                """
                UPDATE finance_external_sync
                SET status = 'success',
                    target_docname = $1,
                    last_success_at = NOW(),
                    last_error = NULL,
                    updated_at = NOW()
                WHERE id = $2::uuid
                """,
                result.target_name,
                sync_id,
            )
            return result.model_dump()
        except Exception as exc:
            message = str(exc)[:1000]
            await execute(
                """
                UPDATE finance_external_sync
                SET status = 'failed',
                    last_error = $1,
                    next_retry_at = NOW() + INTERVAL '10 minutes',
                    updated_at = NOW()
                WHERE id = $2::uuid
                """,
                message,
                sync_id,
            )
            await execute(
                """
                INSERT INTO integration_failures (integration, operation, entity_type, entity_id, status, error_message, payload)
                VALUES ('erpnext', $1, $2, $3, 'open', $4, $5::jsonb)
                """,
                row["operation"],
                row["source_entity_type"],
                row["source_entity_id"],
                message,
                _stable_json(payload),
            )
            return {
                "success": False,
                "operation": row["operation"],
                "doctype": row.get("target_doctype") or "",
                "source_entity_type": row["source_entity_type"],
                "source_entity_id": row["source_entity_id"],
                "target_name": None,
                "payload_hash": row["payload_hash"],
                "attempts": int(row.get("attempts") or 0) + 1,
                "message": message,
            }

    async def _dispatch_operation(self, row: dict[str, Any], payload: dict[str, Any]) -> ErpNextSyncResult:
        operation = row["operation"]
        if operation == "sales_invoice.create":
            return await self._create_sales_invoice(row, payload)
        if operation == "payment_entry.receive":
            return await self._create_payment_entry(row, payload)
        if operation == "purchase_invoice.create":
            return await self._create_purchase_invoice(row, payload)
        if operation == "journal_entry.create":
            return await self._create_journal_entry(row, payload)
        raise ValueError(f"Nicht unterstützte ERPNext-Operation: {operation}")

    async def _create_sales_invoice(self, row: dict[str, Any], payload: dict[str, Any]) -> ErpNextSyncResult:
        cfg = get_finance_mapping_config()
        customer_name = str(payload.get("customer_name") or "Kontakt").strip()
        customer = await erpnext_client.ensure_customer(
            ErpNextCustomerPayload(
                customer_name=customer_name,
                customer_group=cfg.customer_group,
                territory=cfg.territory,
                email_id=payload.get("email"),
                external_reference=payload.get("custom_external_reference"),
            )
        )
        sales_invoice = ErpNextSalesInvoicePayload(
            customer=customer,
            company=payload.get("company") or cfg.company,
            currency=payload.get("currency") or "EUR",
            due_date=payload.get("due_date"),
            posting_date=payload.get("posting_date"),
            remarks=payload.get("remarks"),
            naming_series=payload.get("naming_series"),
            custom_external_reference=payload.get("custom_external_reference"),
            cost_center=payload.get("cost_center") or cfg.cost_center_default,
            items=payload.get("items") or [],
        )
        doc = await erpnext_client.create_sales_invoice(sales_invoice)
        return ErpNextSyncResult(
            operation=row["operation"],
            doctype="Sales Invoice",
            source_entity_type=row["source_entity_type"],
            source_entity_id=row["source_entity_id"],
            target_name=doc.name,
            payload_hash=row["payload_hash"],
            attempts=int(row.get("attempts") or 0) + 1,
            message="Sales Invoice erstellt",
        )

    async def _create_payment_entry(self, row: dict[str, Any], payload: dict[str, Any]) -> ErpNextSyncResult:
        cfg = get_finance_mapping_config()
        invoice_source_type = payload.get("invoice_source_entity_type") or row["source_entity_type"]
        invoice_source_id = payload.get("invoice_source_entity_id") or row["source_entity_id"]
        invoice_sync = await fetchrow(
            """
            SELECT target_docname
            FROM finance_external_sync
            WHERE source_entity_type = $1
              AND source_entity_id = $2
              AND operation = 'sales_invoice.create'
              AND status = 'success'
            ORDER BY last_success_at DESC NULLS LAST, created_at DESC
            LIMIT 1
            """,
            invoice_source_type,
            invoice_source_id,
        )
        if not invoice_sync or not invoice_sync["target_docname"]:
            raise ValueError("Zugehörige Sales Invoice noch nicht synchronisiert")

        sales_invoice_name = str(invoice_sync["target_docname"])
        sales_invoice = await erpnext_client.get_doc("Sales Invoice", sales_invoice_name)
        outstanding = float(sales_invoice.get("outstanding_amount") or payload.get("amount") or 0)
        amount = float(payload.get("amount") or outstanding)
        party = str(sales_invoice.get("customer"))
        reference = ErpNextPaymentReference(
            reference_doctype="Sales Invoice",
            reference_name=sales_invoice_name,
            total_amount=float(sales_invoice.get("grand_total") or amount),
            outstanding_amount=outstanding,
            allocated_amount=amount,
        )
        entry = ErpNextPaymentEntryPayload(
            payment_type="Receive",
            party_type="Customer",
            party=party,
            company=sales_invoice.get("company") or cfg.company,
            posting_date=payload.get("posting_date"),
            paid_from=sales_invoice.get("debit_to") or cfg.bank_account,
            paid_to=resolve_clearing_account(payload.get("channel")),
            paid_amount=amount,
            received_amount=amount,
            reference_no=str(payload.get("reference_no") or sales_invoice_name),
            reference_date=payload.get("posting_date"),
            mode_of_payment=str(payload.get("channel") or "Bank Transfer"),
            references=[reference],
            remarks=payload.get("remarks"),
            custom_external_reference=payload.get("custom_external_reference"),
        )
        doc = await erpnext_client.create_payment_entry(entry)
        civicrm_contribution_id = payload.get("civicrm_contribution_id")
        if civicrm_contribution_id:
            await crm_service.update_contribution(
                contribution_id=int(civicrm_contribution_id),
                values={
                    "contribution_status_id:name": "Completed",
                    "source": f"ERPNext Payment Entry {doc.name}",
                    "trxn_id": doc.name,
                },
            )
        return ErpNextSyncResult(
            operation=row["operation"],
            doctype="Payment Entry",
            source_entity_type=row["source_entity_type"],
            source_entity_id=row["source_entity_id"],
            target_name=doc.name,
            payload_hash=row["payload_hash"],
            attempts=int(row.get("attempts") or 0) + 1,
            message="Payment Entry erstellt",
        )

    async def _create_purchase_invoice(self, row: dict[str, Any], payload: dict[str, Any]) -> ErpNextSyncResult:
        cfg = get_finance_mapping_config()
        supplier = await erpnext_client.ensure_supplier(
            ErpNextSupplierPayload(
                supplier_name=str(payload.get("supplier_name") or "Lieferant").strip(),
                email_id=payload.get("supplier_email"),
                supplier_group=cfg.supplier_group,
                external_reference=payload.get("external_reference"),
            )
        )
        amount = _to_amount(payload.get("amount"))
        doc = await erpnext_client.create_purchase_invoice(
            ErpNextPurchaseInvoicePayload(
                supplier=supplier,
                company=cfg.company,
                currency=payload.get("currency") or "EUR",
                bill_date=payload.get("bill_date"),
                due_date=payload.get("due_date"),
                posting_date=payload.get("posting_date"),
                remarks=payload.get("description"),
                custom_external_reference=payload.get("external_reference"),
                items=[
                    {
                        "item_code": payload.get("item_code") or "EXPENSE",
                        "description": payload.get("description") or "Ausgabe",
                        "qty": float(payload.get("qty") or 1),
                        "rate": float(amount),
                        "amount": float(amount),
                        "expense_account": payload.get("expense_account") or cfg.expense_account_default,
                        "cost_center": payload.get("cost_center") or cfg.cost_center_default,
                        "uom": payload.get("uom") or "Nos",
                        "conversion_factor": 1.0,
                    }
                ],
            )
        )
        return ErpNextSyncResult(
            operation=row["operation"],
            doctype="Purchase Invoice",
            source_entity_type=row["source_entity_type"],
            source_entity_id=row["source_entity_id"],
            target_name=doc.name,
            payload_hash=row["payload_hash"],
            attempts=int(row.get("attempts") or 0) + 1,
            message="Purchase Invoice erstellt",
        )

    async def _create_journal_entry(self, row: dict[str, Any], payload: dict[str, Any]) -> ErpNextSyncResult:
        cfg = get_finance_mapping_config()
        entry = ErpNextJournalEntryPayload(
            company=cfg.company,
            posting_date=payload.get("posting_date"),
            user_remark=payload.get("memo") or payload.get("user_remark"),
            naming_series=payload.get("naming_series") or None,
            custom_external_reference=payload.get("external_reference"),
            accounts=[
                ErpNextJournalEntryLine(
                    account=line["account"],
                    debit_in_account_currency=float(line.get("debit") or 0),
                    credit_in_account_currency=float(line.get("credit") or 0),
                    cost_center=line.get("cost_center") or cfg.cost_center_default,
                    user_remark=line.get("remark"),
                )
                for line in (payload.get("lines") or [])
            ],
        )
        doc = await erpnext_client.create_journal_entry(entry)
        return ErpNextSyncResult(
            operation=row["operation"],
            doctype="Journal Entry",
            source_entity_type=row["source_entity_type"],
            source_entity_id=row["source_entity_id"],
            target_name=doc.name,
            payload_hash=row["payload_hash"],
            attempts=int(row.get("attempts") or 0) + 1,
            message="Journal Entry erstellt",
        )


finance_sync_service = FinanceSyncService()

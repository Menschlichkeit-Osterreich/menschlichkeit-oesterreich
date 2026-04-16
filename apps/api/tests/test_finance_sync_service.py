from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, patch

from app.schemas.erpnext import ErpNextDocRef, ErpNextSyncResult
from app.services.finance_sync_service import _idempotency_key, finance_sync_service


def _run(coro):
    return asyncio.run(coro)


def test_idempotency_key_is_stable():
    key_one = _idempotency_key(
        source_system="platform",
        source_entity_type="donation",
        source_entity_id="42",
        operation="sales_invoice.create",
    )
    key_two = _idempotency_key(
        source_system="platform",
        source_entity_type="donation",
        source_entity_id="42",
        operation="sales_invoice.create",
    )
    assert key_one == key_two


def test_process_pending_marks_success():
    row = {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "source_entity_type": "invoice",
        "source_entity_id": "1",
        "operation": "sales_invoice.create",
        "payload": {},
        "payload_hash": "hash",
        "attempts": 0,
        "target_doctype": "Sales Invoice",
    }
    with (
        patch("app.services.finance_sync_service.fetch", new=AsyncMock(return_value=[row])),
        patch("app.services.finance_sync_service.execute", new=AsyncMock()) as mock_execute,
        patch(
            "app.services.finance_sync_service.finance_sync_service._dispatch_operation",
            new=AsyncMock(
                return_value=ErpNextSyncResult(
                    operation="sales_invoice.create",
                    doctype="Sales Invoice",
                    source_entity_type="invoice",
                    source_entity_id="1",
                    target_name="SINV-0001",
                    payload_hash="hash",
                    attempts=1,
                    message="ok",
                )
            ),
        ),
    ):
        result = _run(finance_sync_service.process_pending(limit=1))

    assert result["count"] == 1
    assert result["processed"][0]["success"] is True
    assert mock_execute.await_count >= 2


def test_payment_entry_sync_updates_civicrm():
    row = {
        "operation": "payment_entry.receive",
        "source_entity_type": "donation",
        "source_entity_id": "7",
        "payload_hash": "hash",
        "attempts": 0,
    }
    payload = {
        "amount": 50.0,
        "channel": "stripe",
        "civicrm_contribution_id": 123,
        "invoice_source_entity_type": "donation",
        "invoice_source_entity_id": "7",
    }
    with (
        patch(
            "app.services.finance_sync_service.fetchrow",
            new=AsyncMock(return_value={"target_docname": "SINV-0007"}),
        ),
        patch(
            "app.services.finance_sync_service.erpnext_client.get_doc",
            new=AsyncMock(
                return_value={
                    "customer": "CUST-0001",
                    "company": "MOE",
                    "debit_to": "1200 - Debitoren - MOE",
                    "grand_total": 50.0,
                    "outstanding_amount": 50.0,
                }
            ),
        ),
        patch(
            "app.services.finance_sync_service.erpnext_client.create_payment_entry",
            new=AsyncMock(return_value=ErpNextDocRef(doctype="Payment Entry", name="ACC-PAY-0001")),
        ),
        patch(
            "app.services.finance_sync_service.crm_service.update_contribution",
            new=AsyncMock(return_value=True),
        ) as mock_update,
    ):
        result = _run(finance_sync_service._create_payment_entry(row, payload))

    assert result.target_name == "ACC-PAY-0001"
    mock_update.assert_awaited_once()

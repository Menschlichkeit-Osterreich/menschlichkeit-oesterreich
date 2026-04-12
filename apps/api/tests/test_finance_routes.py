from __future__ import annotations

from unittest.mock import AsyncMock, patch


class TestFinanceRoutes:
    def test_finance_overview_initializes_tables(self, client, auth_headers):
        with (
            patch(
                "app.routers.finance._ensure_finance_tables",
                new=AsyncMock(return_value=None),
            ) as mock_ensure,
            patch("app.routers.finance.fetchval", new=AsyncMock(return_value=0)),
        ):
            resp = client.get("/api/finance/overview", headers=auth_headers)

        assert resp.status_code == 200
        mock_ensure.assert_called_once()

    def test_get_invoice_accepts_uuid_identifier(self, client, auth_headers):
        invoice_id = "550e8400-e29b-41d4-a716-446655440000"
        with (
            patch(
                "app.routers.invoices.fetchrow",
                new=AsyncMock(
                    return_value={
                        "id": invoice_id,
                        "civicrm_contact_id": 42,
                        "invoice_number": "RE-2026-000001",
                        "recipient_email": "rechnung@example.at",
                    }
                ),
            ),
            patch("app.routers.invoices.fetch", new=AsyncMock(return_value=[])),
        ):
            resp = client.get(f"/api/invoices/{invoice_id}", headers=auth_headers)

        assert resp.status_code == 200
        assert resp.json()["id"] == invoice_id

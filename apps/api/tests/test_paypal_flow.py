"""Tests für den PayPal-Flow: Order → Capture → Webhook-Events."""
from __future__ import annotations

import json
from unittest.mock import AsyncMock, patch

import pytest


_MOCK_BASE = "app.routers.payments"


class TestPayPalOrder:
    def test_create_order_happy_path(self, client):
        with patch("app.services.payment_service.payment_service.create_paypal_order", new=AsyncMock(return_value={
            "id": "paypal_mock_order123",
            "status": "CREATED",
        })):
            resp = client.post("/api/payments/paypal/order", json={
                "amount": 25.0,
                "currency": "EUR",
                "purpose": "Spende",
            })
            assert resp.status_code == 200
            assert resp.json()["success"] is True
            assert "id" in resp.json()["data"]

    def test_create_order_missing_amount_returns_422(self, client):
        resp = client.post("/api/payments/paypal/order", json={"currency": "EUR"})
        assert resp.status_code == 422


class TestPayPalCapture:
    def test_capture_order_happy_path(self, client):
        with patch("app.services.payment_service.payment_service.capture_paypal_order", new=AsyncMock(return_value={
            "id": "ORDER123",
            "status": "COMPLETED",
        })):
            resp = client.post("/api/payments/paypal/capture", json={
                "order_id": "ORDER123",
            })
            assert resp.status_code == 200
            assert resp.json()["success"] is True


class TestPayPalWebhook:
    def _post_webhook(self, client, event_type: str, resource: dict):
        payload = {
            "id": f"WH-{event_type.replace('.', '-')}-001",
            "event_type": event_type,
            "resource": resource,
        }
        return client.post(
            "/api/webhooks/paypal",
            content=json.dumps(payload).encode(),
            headers={"paypal-transmission-id": "mock-transmission-id", "Content-Type": "application/json"},
        )

    def test_webhook_missing_event_id_rejected(self, client):
        resp = client.post("/api/webhooks/paypal", json={"event_type": "CHECKOUT.ORDER.COMPLETED"})
        assert resp.status_code == 400

    def test_webhook_order_completed_records_donation(self, client):
        resource = {
            "id": "ORDER_COMPLETED_001",
            "payer": {"email_address": "paypal@example.at"},
            "purchase_units": [{"amount": {"value": "30.00", "currency_code": "EUR"}}],
        }
        with (
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch("app.services.payment_service.payment_service.record_successful_donation", new=AsyncMock(return_value={"id": 5})) as mock_record,
        ):
            resp = self._post_webhook(client, "CHECKOUT.ORDER.COMPLETED", resource)
            assert resp.status_code == 200
            assert resp.json()["success"] is True
            mock_record.assert_called_once()
            call_kwargs = mock_record.call_args.kwargs
            assert call_kwargs["amount"] == 30.0
            assert call_kwargs["currency"] == "EUR"
            assert call_kwargs["donor_email"] == "paypal@example.at"

    def test_webhook_capture_completed_records_donation(self, client):
        resource = {
            "id": "CAPTURE_COMPLETED_001",
            "amount": {"value": "15.00", "currency_code": "EUR"},
        }
        with (
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch("app.services.payment_service.payment_service.record_successful_donation", new=AsyncMock(return_value={"id": 6})) as mock_record,
        ):
            resp = self._post_webhook(client, "PAYMENT.CAPTURE.COMPLETED", resource)
            assert resp.status_code == 200
            mock_record.assert_called_once()
            assert mock_record.call_args.kwargs["amount"] == 15.0

    def test_webhook_capture_denied_updates_status(self, client):
        resource = {"id": "CAPTURE_DENIED_001"}
        with (
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()) as mock_exec,
        ):
            resp = self._post_webhook(client, "PAYMENT.CAPTURE.DENIED", resource)
            assert resp.status_code == 200
            mock_exec.assert_called_once()
            assert "failed" in mock_exec.call_args[0][0]
            assert "CAPTURE_DENIED_001" in mock_exec.call_args[0]

    def test_webhook_duplicate_ignored(self, client):
        resource = {"id": "ORDER_DUP"}
        with (
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=False)),
            patch("app.services.payment_service.payment_service.record_successful_donation", new=AsyncMock()) as mock_record,
        ):
            resp = self._post_webhook(client, "CHECKOUT.ORDER.COMPLETED", resource)
            assert resp.status_code == 200
            assert "bereits" in resp.json()["message"]
            mock_record.assert_not_called()

    def test_webhook_unknown_event_type_ignored_gracefully(self, client):
        resource = {"id": "UNKNOWN_001"}
        with patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)):
            resp = self._post_webhook(client, "PAYMENT.UNKNOWN.EVENT", resource)
            assert resp.status_code == 200
            assert resp.json()["success"] is True

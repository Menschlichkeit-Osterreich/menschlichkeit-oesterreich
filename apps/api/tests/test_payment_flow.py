"""Tests für den Stripe-Payment-Flow: Intent → Webhook (succeeded, failed, duplicate)."""
from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


_MOCK_BASE = "app.routers.payments"


def _stripe_event(event_type: str, obj: dict) -> dict:
    return {"id": f"evt_{event_type.replace('.', '_')}", "type": event_type, "data": {"object": obj}}


class TestStripeIntentCreation:
    def test_create_intent_unauthenticated(self, client):
        with patch("app.services.payment_service.payment_service.create_stripe_intent", new=AsyncMock(return_value={
            "payment_intent_id": 1,
            "gateway_intent_id": "pi_mock_abc",
            "client_secret": "pi_mock_abc_secret_xyz",
            "status": "pending",
        })):
            resp = client.post("/api/payments/stripe/intent", json={
                "amount": 50.0,
                "currency": "EUR",
                "purpose": "Spende",
                "financial_type": "Donation",
            })
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "client_secret" in data["data"]

    def test_create_intent_missing_amount_returns_422(self, client):
        resp = client.post("/api/payments/stripe/intent", json={"currency": "EUR"})
        assert resp.status_code == 422


class TestStripeWebhook:
    def test_webhook_missing_signature_rejected(self, client):
        resp = client.post("/api/webhooks/stripe", content=b"{}", headers={"Content-Type": "application/json"})
        assert resp.status_code == 400

    def test_webhook_payment_succeeded_records_donation(self, client):
        payload = _stripe_event("payment_intent.succeeded", {
            "id": "pi_test123",
            "amount_received": 5000,
            "currency": "eur",
            "metadata": {"email": "spender@example.at", "purpose": "Spende"},
        })
        with (
            patch("app.services.payment_service.payment_service.verify_stripe_signature", new=AsyncMock()),
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch("app.services.payment_service.payment_service.record_successful_donation", new=AsyncMock(return_value={"id": 1})) as mock_record,
        ):
            resp = client.post(
                "/api/webhooks/stripe",
                content=json.dumps(payload).encode(),
                headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200
            assert resp.json()["success"] is True
            mock_record.assert_called_once()
            call_kwargs = mock_record.call_args.kwargs
            assert call_kwargs["amount"] == 50.0
            assert call_kwargs["donor_email"] == "spender@example.at"

    def test_webhook_payment_failed_updates_status_and_sends_mail(self, client):
        payload = _stripe_event("payment_intent.payment_failed", {
            "id": "pi_failed123",
            "amount": 5000,
            "currency": "eur",
            "metadata": {"email": "spender@example.at"},
            "last_payment_error": {"message": "Karte abgelehnt"},
        })
        with (
            patch("app.services.payment_service.payment_service.verify_stripe_signature", new=AsyncMock()),
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()) as mock_exec,
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)) as mock_mail,
        ):
            resp = client.post(
                "/api/webhooks/stripe",
                content=json.dumps(payload).encode(),
                headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200
            # DB-Status muss auf 'failed' gesetzt werden
            mock_exec.assert_called_once()
            assert "failed" in mock_exec.call_args[0]
            # Fehler-Mail muss gesendet werden
            mock_mail.assert_called_once()
            assert mock_mail.call_args.kwargs["template_id"] == "donation_failed"

    def test_webhook_payment_canceled_updates_status_no_mail(self, client):
        payload = _stripe_event("payment_intent.canceled", {"id": "pi_canceled123", "amount": 2000})
        with (
            patch("app.services.payment_service.payment_service.verify_stripe_signature", new=AsyncMock()),
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()) as mock_exec,
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock()) as mock_mail,
        ):
            resp = client.post(
                "/api/webhooks/stripe",
                content=json.dumps(payload).encode(),
                headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200
            mock_exec.assert_called_once()
            assert "canceled" in mock_exec.call_args[0]
            mock_mail.assert_not_called()  # Keine Mail bei canceled

    def test_webhook_duplicate_event_ignored(self, client):
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_dup", "amount_received": 1000})
        with (
            patch("app.services.payment_service.payment_service.verify_stripe_signature", new=AsyncMock()),
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=False)),
            patch("app.services.payment_service.payment_service.record_successful_donation", new=AsyncMock()) as mock_record,
        ):
            resp = client.post(
                "/api/webhooks/stripe",
                content=json.dumps(payload).encode(),
                headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200
            assert "bereits" in resp.json()["message"]
            mock_record.assert_not_called()  # Kein doppeltes Recording

    def test_webhook_failed_no_email_no_mail_sent(self, client):
        """Fehlgeschlagene Zahlung ohne E-Mail in Metadata → keine Benachrichtigungs-Mail."""
        payload = _stripe_event("payment_intent.payment_failed", {
            "id": "pi_nomail",
            "amount": 1000,
            "metadata": {},
        })
        with (
            patch("app.services.payment_service.payment_service.verify_stripe_signature", new=AsyncMock()),
            patch("app.services.payment_service.payment_service.record_webhook_event", new=AsyncMock(return_value=True)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()),
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock()) as mock_mail,
        ):
            resp = client.post(
                "/api/webhooks/stripe",
                content=json.dumps(payload).encode(),
                headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200
            mock_mail.assert_not_called()

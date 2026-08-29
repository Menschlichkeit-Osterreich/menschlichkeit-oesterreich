"""Tests für den Stripe-Payment-Flow: Intent → Webhook (succeeded, failed, duplicate)."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
from unittest.mock import AsyncMock, patch

import pytest

from app.services.stripe_service import stripe_service
from app.services.stripe_service import InvalidStripeSignature


_MOCK_BASE = "app.routers.payments"


def _stripe_event(event_type: str, obj: dict) -> dict:
    return {
        "id": f"evt_{event_type.replace('.', '_')}",
        "type": event_type,
        "data": {"object": obj},
    }


class TestStripeIntentCreation:
    def test_create_intent_unauthenticated(self, client):
        with patch(
            "app.services.payment_service.payment_service.create_stripe_intent",
            new=AsyncMock(
                return_value={
                    "payment_intent_id": 1,
                    "gateway_intent_id": "pi_mock_abc",
                    "client_secret": "pi_mock_abc_secret_xyz",
                    "status": "pending",
                }
            ),
        ):
            resp = client.post(
                "/api/payments/stripe/intent",
                json={
                    "amount": 50.0,
                    "currency": "EUR",
                    "purpose": "Spende",
                    "financial_type": "Donation",
                },
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "client_secret" in data["data"]

    def test_create_intent_missing_amount_returns_422(self, client):
        resp = client.post("/api/payments/stripe/intent", json={"currency": "EUR"})
        assert resp.status_code == 422

    def test_create_intent_rejects_recurring_interval(self, client):
        with patch(
            "app.services.payment_service.payment_service.create_stripe_intent",
            new=AsyncMock(
                return_value={
                    "payment_intent_id": 9,
                    "gateway_intent_id": "pi_monthly_abc",
                    "client_secret": "pi_monthly_abc_secret_xyz",
                    "status": "pending",
                }
            ),
        ) as mock_create:
            resp = client.post(
                "/api/payments/stripe/intent",
                json={
                    "amount": 15.0,
                    "currency": "EUR",
                    "purpose": "Monatliche Unterstützung",
                    "financial_type": "donation",
                    "interval": "monthly",
                },
            )
            assert resp.status_code == 422
            mock_create.assert_not_called()


class TestStripeWebhook:
    """Route-Tests gegen den Inbox-Flow (P1-001).

    Tiefen-Tests der Inbox-Primitive und der Transaktionslogik liegen in
    tests/test_stripe_webhook_inbox.py; hier wird das Verhalten der Route
    (Mails, Alerts, Statuscodes) über die Service-Seams geprüft.
    """

    @staticmethod
    def _sig_ok():
        return patch(
            "app.services.payment_service.payment_service.verify_stripe_signature",
            new=AsyncMock(),
        )

    @staticmethod
    def _inbox(status="received", created=True, claimed=True):
        return (
            patch(
                f"{_MOCK_BASE}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-t", "status": status, "created": created}
                ),
            ),
            patch(
                f"{_MOCK_BASE}.stripe_webhook_inbox.claim",
                new=AsyncMock(return_value="lease-test" if claimed else None),
            ),
        )

    def _post(self, client, payload):
        return client.post(
            "/api/webhooks/stripe",
            content=json.dumps(payload).encode(),
            headers={
                "stripe-signature": "t=1,v1=mocksig",
                "Content-Type": "application/json",
            },
        )

    def test_webhook_missing_signature_rejected(self, client):
        resp = client.post(
            "/api/webhooks/stripe",
            content=b"{}",
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400

    def test_webhook_payment_succeeded_sends_thank_you_mail_after_commit(self, client):
        payload = _stripe_event(
            "payment_intent.succeeded",
            {
                "id": "pi_test123",
                "amount_received": 5000,
                "currency": "eur",
                "metadata": {"email": "spender@example.at", "purpose": "Spende"},
            },
        )
        ingest_p, claim_p = self._inbox()
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(
                f"{_MOCK_BASE}.process_stripe_event",
                new=AsyncMock(
                    return_value={
                        "event_type": "payment_intent.succeeded",
                        "donation_created": True,
                        "donation_id": 7,
                        "amount": 50.0,
                        "currency": "EUR",
                        "donor_email": "spender@example.at",
                        "donor_name": "Maria Muster",
                        "purpose": "Spende",
                        "donation_date": "2026-08-28",
                    }
                ),
            ) as mock_process,
            patch(
                f"{_MOCK_BASE}.mail_service.send_template",
                new=AsyncMock(return_value=True),
            ) as mock_mail,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        mock_process.assert_called_once()
        assert mock_process.call_args.kwargs["obj"]["id"] == "pi_test123"
        mock_mail.assert_called_once()
        kwargs = mock_mail.call_args.kwargs
        assert kwargs["template_id"] == "donation_success"
        assert kwargs["recipient_email"] == "spender@example.at"
        assert kwargs["context"]["donation"]["amount"] == "50.00"

    def test_webhook_payment_failed_sends_admin_and_donor_mail(self, client):
        payload = _stripe_event(
            "payment_intent.payment_failed",
            {
                "id": "pi_failed123",
                "amount": 5000,
                "currency": "eur",
                "metadata": {"email": "spender@example.at"},
                "last_payment_error": {"message": "Karte abgelehnt"},
            },
        )
        mock_slack_client = AsyncMock()
        mock_slack_client.__aenter__ = AsyncMock(return_value=mock_slack_client)
        mock_slack_client.__aexit__ = AsyncMock(return_value=None)
        mock_slack_client.post = AsyncMock(return_value=None)

        ingest_p, claim_p = self._inbox()
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(
                f"{_MOCK_BASE}.process_stripe_event",
                new=AsyncMock(
                    return_value={
                        "event_type": "payment_intent.payment_failed",
                        "payment_failed": True,
                        "amount": 50.0,
                        "currency": "EUR",
                        "donor_email": "spender@example.at",
                        "failure_reason": "Karte abgelehnt",
                    }
                ),
            ),
            patch(f"{_MOCK_BASE}.ADMIN_EMAILS", ["ops@example.at"]),
            patch(
                f"{_MOCK_BASE}.mail_service.send_template",
                new=AsyncMock(return_value=True),
            ) as mock_mail,
            patch(
                f"{_MOCK_BASE}.get_secret",
                return_value="https://hooks.slack.com/services/mock/webhook",
            ),
            patch(
                f"{_MOCK_BASE}.httpx.AsyncClient",
                return_value=mock_slack_client,
            ) as mock_httpx,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        # Interner Admin-Kanal behält Details (E-Mail an ADMIN_EMAILS)
        assert mock_mail.call_count == 2
        call_kwargs = [call.kwargs for call in mock_mail.call_args_list]
        assert call_kwargs[0]["template_id"] == "admin_alert"
        assert call_kwargs[0]["recipient_email"] == "ops@example.at"
        assert (
            "payment_intent.payment_failed" in call_kwargs[0]["context"]["body_html"]
        )
        assert call_kwargs[1]["template_id"] == "donation_failed"
        # Slack: datensparsam — Correlation-ID statt Spender/Stripe-ID (P1-002)
        mock_httpx.assert_called_once_with(timeout=10)
        mock_slack_client.post.assert_called_once()
        slack_text = mock_slack_client.post.call_args.kwargs["json"]["text"]
        assert "Payment Failure Alert" in slack_text
        assert "50.00 EUR" in slack_text
        assert "uuid-t" in slack_text
        assert "spender@example.at" not in slack_text
        assert "pi_failed123" not in slack_text

    def test_webhook_payment_canceled_no_mail(self, client):
        payload = _stripe_event(
            "payment_intent.canceled", {"id": "pi_canceled123", "amount": 2000}
        )
        ingest_p, claim_p = self._inbox()
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(
                f"{_MOCK_BASE}.process_stripe_event",
                new=AsyncMock(
                    return_value={
                        "event_type": "payment_intent.canceled",
                        "payment_failed": False,
                        "amount": 20.0,
                        "currency": "EUR",
                        "donor_email": "",
                    }
                ),
            ),
            patch(
                f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock()
            ) as mock_mail,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        mock_mail.assert_not_called()

    def test_webhook_duplicate_event_ignored(self, client):
        payload = _stripe_event(
            "payment_intent.succeeded", {"id": "pi_dup", "amount_received": 1000}
        )
        ingest_p, claim_p = self._inbox(status="processed", created=False)
        with (
            self._sig_ok(),
            ingest_p,
            claim_p as mock_claim,
            patch(f"{_MOCK_BASE}.process_stripe_event", new=AsyncMock()) as mock_process,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        assert "bereits" in resp.json()["message"]
        mock_claim.assert_not_called()
        mock_process.assert_not_called()

    def test_webhook_duplicate_failed_event_lost_claim_no_side_effects(self, client):
        payload = _stripe_event(
            "payment_intent.payment_failed",
            {
                "id": "pi_dup_failed",
                "amount": 5000,
                "currency": "eur",
                "metadata": {"email": "spender@example.at"},
            },
        )
        ingest_p, claim_p = self._inbox(
            status="processing", created=False, claimed=False
        )
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(f"{_MOCK_BASE}.process_stripe_event", new=AsyncMock()) as mock_process,
            patch(
                f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock()
            ) as mock_mail,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        assert "bereits" in resp.json()["message"]
        mock_process.assert_not_called()
        mock_mail.assert_not_called()

    def test_webhook_failed_no_email_no_donor_mail_sent(self, client):
        payload = _stripe_event(
            "payment_intent.payment_failed",
            {"id": "pi_nomail", "amount": 1000, "metadata": {}},
        )
        ingest_p, claim_p = self._inbox()
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(
                f"{_MOCK_BASE}.process_stripe_event",
                new=AsyncMock(
                    return_value={
                        "event_type": "payment_intent.payment_failed",
                        "payment_failed": True,
                        "amount": 10.0,
                        "currency": "EUR",
                        "donor_email": "",
                        "failure_reason": None,
                    }
                ),
            ),
            patch(f"{_MOCK_BASE}.ADMIN_EMAILS", []),
            patch(f"{_MOCK_BASE}.get_secret", return_value=""),
            patch(
                f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock()
            ) as mock_mail,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        mock_mail.assert_not_called()

    def test_webhook_payment_failed_without_public_app_url_uses_safe_fallback(
        self, client, monkeypatch
    ):
        payload = _stripe_event(
            "payment_intent.payment_failed",
            {
                "id": "pi_missing_public_url",
                "amount": 5000,
                "currency": "eur",
                "metadata": {"email": "spender@example.at"},
            },
        )
        monkeypatch.delenv("PUBLIC_APP_URL", raising=False)
        ingest_p, claim_p = self._inbox()
        with (
            self._sig_ok(),
            ingest_p,
            claim_p,
            patch(
                f"{_MOCK_BASE}.process_stripe_event",
                new=AsyncMock(
                    return_value={
                        "event_type": "payment_intent.payment_failed",
                        "payment_failed": True,
                        "amount": 50.0,
                        "currency": "EUR",
                        "donor_email": "spender@example.at",
                        "failure_reason": None,
                    }
                ),
            ),
            patch(f"{_MOCK_BASE}.ADMIN_EMAILS", []),
            patch(f"{_MOCK_BASE}.get_secret", return_value=""),
            patch(
                f"{_MOCK_BASE}.mail_service.send_template",
                new=AsyncMock(return_value=True),
            ) as mock_mail,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 200
        assert mock_mail.call_args.kwargs["context"]["retry_url"].endswith("/spenden")

    def test_invalid_signature_returns_generic_400_without_inbox_write(self, client):
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_invalid"})
        with (
            patch(
                "app.services.payment_service.payment_service.verify_stripe_signature",
                new=AsyncMock(side_effect=InvalidStripeSignature("internal reason")),
            ),
            patch(f"{_MOCK_BASE}.stripe_webhook_inbox.ingest", new=AsyncMock()) as ingest,
        ):
            resp = self._post(client, payload)
        assert resp.status_code == 400
        assert resp.json()["error"]["message"] == "Ungültiger Stripe-Webhook"
        assert "internal reason" not in resp.text
        ingest.assert_not_called()


class TestStripeSignatureValidation:
    def test_rejects_stale_signature_timestamp(self):
        raw_body = b'{"id": "evt_old"}'
        timestamp = "1"
        secret = "whsec_test"
        expected = hmac.new(
            secret.encode("utf-8"),
            f"{timestamp}.{raw_body.decode('utf-8')}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        original = stripe_service.stripe_webhook_secret
        stripe_service.stripe_webhook_secret = secret

        try:
            with pytest.raises(ValueError):
                asyncio.run(
                    stripe_service.verify_stripe_signature(
                        raw_body=raw_body,
                        signature_header=f"t={timestamp},v1={expected}",
                    )
                )
        finally:
            stripe_service.stripe_webhook_secret = original

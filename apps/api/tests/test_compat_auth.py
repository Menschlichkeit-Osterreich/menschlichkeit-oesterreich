"""Track A / PR #564 — Fail-closed hardening for the public payment flow.

Deckt ab:
  * Legacy-Kompatibilitätsrouten (Kontakte/Mitgliedschaften) sind NICHT mehr
    anonym erreichbar (CRM-Writes und PII-Read fail closed).
  * Gültige Maschinen-Authentifizierung (Shared-Token bzw. HMAC) funktioniert.
  * Ungültige Signatur wird abgewiesen.
  * Stillgelegte Contribution-/Receipt-Ingress-Routen liefern weiterhin 410.
  * receipt_eligible in der Bestätigungsmail folgt dem DB-/Outbox-Vertrag (False).
  * Slack-Zustellfehler protokollieren die Webhook-URL (ein Secret) nicht.
"""
from __future__ import annotations

import asyncio
import hashlib
import hmac

import pytest
from unittest.mock import AsyncMock, patch

_INTERNAL = "app.routers.internal"
_PAYMENTS = "app.routers.payments"


def _fake_secret(mapping: dict[str, str]):
    """Ersetzt get_secret deterministisch — nur die gemappten Keys liefern Werte."""

    def _inner(env_var: str, default: str = "", *, bsm_key: str | None = None) -> str:
        return mapping.get(env_var, default)

    return _inner


class TestCompatEndpointsFailClosed:
    """4.1 — Kontakt-/Mitgliedschafts-Kompatibilitätsrouten ohne Auth müssen scheitern."""

    def test_contacts_create_anonymous_fails_closed(self, client):
        upsert = AsyncMock(return_value={"id": 1})
        with (
            patch(f"{_INTERNAL}.get_secret", side_effect=_fake_secret({})),
            patch(f"{_INTERNAL}.crm_service.upsert_contact", new=upsert),
        ):
            resp = client.post(
                "/api/contacts/create",
                json={"email": "anon@example.at", "first_name": "A", "last_name": "B"},
            )
        assert resp.status_code != 200
        assert resp.status_code in (401, 403, 503)
        upsert.assert_not_called()

    def test_contacts_search_anonymous_fails_closed(self, client):
        finder = AsyncMock(return_value={"id": 1})
        with (
            patch(f"{_INTERNAL}.get_secret", side_effect=_fake_secret({})),
            patch(f"{_INTERNAL}.crm_service.find_contact_by_email", new=finder),
        ):
            resp = client.get("/api/contacts/search", params={"email": "anon@example.at"})
        assert resp.status_code != 200
        assert resp.status_code in (401, 403, 503)
        finder.assert_not_called()

    def test_memberships_create_anonymous_fails_closed(self, client):
        ensure = AsyncMock(return_value={"id": 1})
        with (
            patch(f"{_INTERNAL}.get_secret", side_effect=_fake_secret({})),
            patch(f"{_INTERNAL}.crm_service.ensure_membership", new=ensure),
        ):
            resp = client.post("/api/memberships/create", json={"contact_id": 42})
        assert resp.status_code != 200
        assert resp.status_code in (401, 403, 503)
        ensure.assert_not_called()


class TestCompatEndpointsMachineAuth:
    """4.1 — mit korrekter Maschinen-Auth funktionieren die Routen weiterhin."""

    def test_contacts_create_valid_bearer_token_succeeds(self, client):
        upsert = AsyncMock(return_value={"id": 7, "email": "ok@example.at"})
        with (
            patch(
                f"{_INTERNAL}.get_secret",
                side_effect=_fake_secret({"MOE_API_TOKEN": "tok-123"}),
            ),
            patch(f"{_INTERNAL}.crm_service.upsert_contact", new=upsert),
        ):
            resp = client.post(
                "/api/contacts/create",
                json={"email": "ok@example.at", "first_name": "A", "last_name": "B"},
                headers={"Authorization": "Bearer tok-123"},
            )
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        upsert.assert_awaited_once()

    def test_contacts_create_valid_hmac_signature_succeeds(self, client):
        raw = b'{"email":"sig@example.at","first_name":"A","last_name":"B"}'
        sig = hmac.new(b"sec", raw, hashlib.sha256).hexdigest()
        upsert = AsyncMock(return_value={"id": 8})
        with (
            patch(
                f"{_INTERNAL}.get_secret",
                side_effect=_fake_secret({"N8N_WEBHOOK_SECRET": "sec"}),
            ),
            patch(f"{_INTERNAL}.crm_service.upsert_contact", new=upsert),
        ):
            resp = client.post(
                "/api/contacts/create",
                content=raw,
                headers={
                    "Content-Type": "application/json",
                    "x-webhook-signature": sig,
                },
            )
        assert resp.status_code == 200
        upsert.assert_awaited_once()

    def test_contacts_create_invalid_signature_fails(self, client):
        upsert = AsyncMock(return_value={"id": 9})
        with (
            patch(
                f"{_INTERNAL}.get_secret",
                side_effect=_fake_secret({"N8N_WEBHOOK_SECRET": "sec"}),
            ),
            patch(f"{_INTERNAL}.crm_service.upsert_contact", new=upsert),
        ):
            resp = client.post(
                "/api/contacts/create",
                json={"email": "bad@example.at", "first_name": "A", "last_name": "B"},
                headers={"x-webhook-signature": "deadbeef"},
            )
        assert resp.status_code == 401
        upsert.assert_not_called()


class TestRetiredIngressReturns410:
    """4.3 — stillgelegte Legacy-Zahlungs-/Beleg-Ingress-Routen bleiben 410."""

    @pytest.mark.parametrize(
        "path",
        [
            "/api/contributions/create",
            "/api/contributions/recur",
            "/api/payments/log",
            "/api/finance/donations",
            "/api/finance/receipts/generate-pdf",
            "/api/receipt/trigger",
        ],
    )
    def test_retired_routes_return_410(self, client, path):
        resp = client.post(path, json={})
        assert resp.status_code == 410


class TestReceiptEligibleConsistency:
    """4.6 — Bestätigungsmail darf receipt_eligible nicht abweichend TRUE setzen."""

    def test_post_commit_donation_mail_uses_receipt_eligible_false(self):
        from app.routers import payments as payments_router

        send = AsyncMock(return_value=True)
        side_effects = {
            "donation_created": True,
            "donor_email": "donor@example.at",
            "donor_name": "Max Muster",
            "amount": 50.0,
            "currency": "EUR",
            "purpose": "Spende",
            "donation_date": "2026-08-30",
            "donation_id": "don-1",
        }
        with patch.object(payments_router.mail_service, "send_template", new=send):
            asyncio.run(
                payments_router._dispatch_post_commit_effects(
                    correlation_id="corr-1",
                    obj={"id": "pi_1"},
                    side_effects=side_effects,
                )
            )
        send.assert_awaited()
        context = send.await_args.kwargs["context"]
        assert context["donation"]["receipt_eligible"] is False


class TestSlackLoggingSanitization:
    """4.7 — bei Slack-Zustellfehler darf die Webhook-URL nicht ins Log gelangen."""

    def test_slack_delivery_error_does_not_log_webhook_url(self, caplog):
        from app.routers import payments as payments_router

        webhook = "https://hooks.slack.com/services/T000/B000/XXXXSECRET"

        class _BoomClient:
            def __init__(self, *args, **kwargs):
                pass

            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                return False

            async def post(self, url, **kwargs):
                # httpx-Exceptions tragen die Ziel-URL im Text — hier simuliert.
                raise RuntimeError(f"Connection failed to {url}")

        def _secret(env_var, default="", *, bsm_key=None):
            return webhook if env_var == "ALERTS_SLACK_WEBHOOK" else ""

        with (
            patch.object(payments_router, "get_secret", side_effect=_secret),
            patch.object(payments_router.httpx, "AsyncClient", _BoomClient),
            patch.object(payments_router, "ADMIN_EMAILS", []),
        ):
            with caplog.at_level("WARNING"):
                asyncio.run(
                    payments_router._send_payment_failed_ops_alert(
                        event_type="payment_intent.payment_failed",
                        amount=50.0,
                        currency="EUR",
                        donor_email="donor@example.at",
                        gateway_intent_id="pi_1",
                        correlation_id="corr-1",
                    )
                )

        combined = " ".join(record.getMessage() for record in caplog.records)
        assert webhook not in combined
        assert "hooks.slack.com" not in combined
        assert "slack_alert_delivery_failed" in combined

"""Tests für die durable Stripe-Webhook-Inbox (Audit-Findings P1-001/P1-002).

Abgedeckte Garantien (Masterprompt §53):
  - Durable Inbox: Event wird VOR jeder Geschäftslogik gespeichert.
  - Duplicate Event: zweite Zustellung → keine zweite Geschäftsverarbeitung.
  - Concurrent Duplicate: Claim gewinnt genau einer.
  - Crash During Processing: Event bleibt als failed retryfähig, Antwort 500.
  - Retry: failed → claim → processed.
  - Already Processed: keine zweite Nebenwirkung (keine Mail, kein Outbox).
  - Outbox: genau ein Event je Geschäftsvorfall, mit Correlation-ID und
    Idempotency-Key.
  - DB-Idempotency: ON CONFLICT auf donations verhindert Doppelbuchung.
  - Slack: keine PII, keine Stripe-IDs (build_ops_alert_text).
  - Metadata: purpose/source getrennt, Interval → donation_type.
"""

from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from datetime import date
from unittest.mock import AsyncMock, patch

import pytest

from app.services import stripe_webhook_service as sws
from app.services.stripe_webhook_service import (
    StripeWebhookInbox,
    build_ops_alert_text,
    normalize_stripe_event_for_inbox,
    process_stripe_event,
)

_ROUTER = "app.routers.payments"


# ─────────────────────────────────────────────────────────────────────────────
# Test-Doubles
# ─────────────────────────────────────────────────────────────────────────────


class FakeConn:
    """Zeichnet alle SQL-Aufrufe auf und simuliert ON-CONFLICT-Verhalten."""

    def __init__(self, *, donation_conflict: bool = False):
        self.calls: list[tuple[str, str, tuple]] = []
        self.donation_conflict = donation_conflict
        self._next_donation_id = 41

    async def fetchrow(self, sql: str, *args):
        self.calls.append(("fetchrow", sql, args))
        if "INSERT INTO donations" in sql:
            if self.donation_conflict:
                return None  # Unique-Index hat gegriffen
            self._next_donation_id += 1
            return {
                "id": self._next_donation_id,
                "amount": args[3],
                "currency": args[4],
                "donation_type": args[5],
                "donation_date": date(2026, 8, 28),
            }
        return None

    async def execute(self, sql: str, *args):
        self.calls.append(("execute", sql, args))
        return "OK"

    # Hilfen für Assertions
    def sqls(self, fragment: str) -> list[tuple[str, str, tuple]]:
        return [c for c in self.calls if fragment in c[1]]


def _patch_transaction(conn: FakeConn):
    @asynccontextmanager
    async def fake_transaction():
        yield conn

    return patch.object(sws, "transaction", fake_transaction)


def _stripe_event(event_type: str, obj: dict) -> dict:
    return {"id": f"evt_{abs(hash(event_type)) % 10**8}", "type": event_type, "data": {"object": obj}}


def _run(coro):
    return asyncio.run(coro)


# ─────────────────────────────────────────────────────────────────────────────
# Inbox-Primitive: atomare Deduplizierung, Claim, Statuswechsel
# ─────────────────────────────────────────────────────────────────────────────


class TestInboxPrimitives:
    def test_ingest_uses_atomic_on_conflict_insert(self):
        """Deduplizierung MUSS über INSERT … ON CONFLICT laufen, nicht über
        eine racebehaftete SELECT-Vorprüfung."""
        mock = AsyncMock(return_value={"id": "uuid-1"})
        with patch.object(sws, "fetchrow", mock):
            result = _run(
                StripeWebhookInbox().ingest(
                    provider="stripe",
                    provider_event_id="evt_1",
                    event_type="payment_intent.succeeded",
                    payload={"id": "evt_1"},
                    signature_valid=True,
                )
            )
        assert result == {"id": "uuid-1", "status": "received", "created": True}
        first_sql = mock.call_args_list[0].args[0]
        assert "INSERT INTO webhook_events" in first_sql
        assert "ON CONFLICT (provider, provider_event_id) DO NOTHING" in first_sql
        assert "'received'" in first_sql
        # Kein SELECT vor dem INSERT
        assert mock.call_count == 1

    def test_ingest_existing_event_returns_current_status(self):
        """Konflikt → vorhandener Status wird zurückgemeldet, created=False."""
        mock = AsyncMock(
            side_effect=[None, {"id": "uuid-2", "processing_status": "processed"}]
        )
        with patch.object(sws, "fetchrow", mock):
            result = _run(
                StripeWebhookInbox().ingest(
                    provider="stripe",
                    provider_event_id="evt_dup",
                    event_type="payment_intent.succeeded",
                    payload={},
                    signature_valid=True,
                )
            )
        assert result == {"id": "uuid-2", "status": "processed", "created": False}

    def test_claim_only_wins_for_received_failed_or_stale(self):
        mock = AsyncMock(return_value={"claim_token": "lease-3"})
        with patch.object(sws, "fetchrow", mock):
            assert _run(StripeWebhookInbox().claim("uuid-3")) == "lease-3"
        sql = mock.call_args.args[0]
        assert "processing_status IN ('received', 'failed')" in sql
        assert "attempts = attempts + 1" in sql
        assert "claim_token" in sql
        assert "claim_expires_at" in sql
        # Verwaiste Claims (Prozessabsturz) werden nach Frist übernehmbar
        assert "10 minutes" in sql

    def test_claim_lost_race_returns_false(self):
        with patch.object(sws, "fetchrow", AsyncMock(return_value=None)):
            assert _run(StripeWebhookInbox().claim("uuid-4")) is None

    def test_mark_failed_stores_error_and_retry_hint(self):
        mock = AsyncMock(return_value={"id": "x"})
        with patch.object(sws, "fetchrow", mock):
            _run(
                StripeWebhookInbox().mark_failed(
                    "uuid-5", claim_token="lease-5", error="E" * 900
                )
            )
        sql, args = mock.call_args.args[0], mock.call_args.args[1:]
        assert "'failed'" in sql
        assert "next_retry_at" in sql
        assert len(args[1]) == 500  # Fehlertext begrenzt
        assert args[2] == "lease-5"


# ─────────────────────────────────────────────────────────────────────────────
# Geschäftsverarbeitung in der Transaktion
# ─────────────────────────────────────────────────────────────────────────────


class TestProcessSucceeded:
    OBJ = {
        "id": "pi_abc123",
        "amount_received": 5000,
        "currency": "eur",
        "metadata": {
            "email": "spender@example.at",
            "name": "Maria Muster",
            "purpose": "projekt_x",
            "source": "website",
            "interval": "monthly",
            "financial_type": "donation",
        },
    }

    def test_donation_insert_is_db_idempotent_and_separates_metadata(self):
        conn = FakeConn()
        with _patch_transaction(conn):
            result = _run(
                process_stripe_event(
                    event_pk="corr-1",
                    claim_token="lease-1",
                    event_type="payment_intent.succeeded",
                    obj=self.OBJ,
                )
            )
        assert result["donation_created"] is True
        insert = conn.sqls("INSERT INTO donations")[0]
        sql, args = insert[1], insert[2]
        # Harte Idempotenz auf DB-Ebene
        assert "ON CONFLICT (gateway_provider, gateway_payment_id)" in sql
        assert "DO NOTHING" in sql
        # Metadata-Trennung (P1-003): source=Herkunft, purpose=Zweck
        assert args[7] == "website"      # source
        assert args[8] == "projekt_x"    # purpose
        assert args[9] == "pi_abc123"    # gateway_payment_id
        # A PaymentIntent always remains a one-time payment, even if a legacy
        # metadata field claims a recurring interval.
        assert args[5] == "one_time"
        assert args[6] is False
        assert "FALSE" in sql
        # Kein CRM-HTTP-Aufruf in der Transaktion: contact_id bleibt None
        assert args[0] is None

    def test_outbox_event_emitted_exactly_once_with_contract_fields(self):
        conn = FakeConn()
        with _patch_transaction(conn):
            _run(
                process_stripe_event(
                    event_pk="corr-2",
                    claim_token="lease-2",
                    event_type="payment_intent.succeeded",
                    obj=self.OBJ,
                )
            )
        outbox = conn.sqls("INSERT INTO outbox_events")
        assert len(outbox) == 1
        payload = json.loads(outbox[0][2][1])
        assert payload["schema_version"] == 2
        assert payload["correlation_id"] == "corr-2"
        assert payload["idempotency_key"].startswith("donation.recorded:")
        assert payload["gateway_payment_id"] == "pi_abc123"
        assert payload["donation_type"] == "one_time"
        assert payload["receipt_eligibility"] == "undecided"
        assert payload["donor"]["email"] == "spender@example.at"
        assert "interval" not in payload
        assert "receipt_email_sent_by_api" not in payload
        assert outbox[0][2][2] == payload["idempotency_key"]
        # The final inbox status update shares this transaction with outbox.
        assert conn.sqls("UPDATE webhook_events")

    def test_duplicate_donation_conflict_emits_no_outbox_and_no_mail_data(self):
        """Greift der Unique-Index (paralleles Duplikat), darf es weder ein
        zweites Outbox-Event noch Mail-Daten geben."""
        conn = FakeConn(donation_conflict=True)
        with _patch_transaction(conn):
            result = _run(
                process_stripe_event(
                    event_pk="corr-3",
                    claim_token="lease-3",
                    event_type="payment_intent.succeeded",
                    obj=self.OBJ,
                )
            )
        assert result["donation_created"] is False
        assert conn.sqls("INSERT INTO outbox_events") == []
        assert conn.sqls("UPDATE payment_intents") == []
        assert "donor_email" not in result

    def test_legacy_recurring_metadata_still_maps_to_one_time(self):
        conn = FakeConn()
        obj = dict(self.OBJ, metadata={**self.OBJ["metadata"], "interval": "monthly"})
        with _patch_transaction(conn):
            _run(
                process_stripe_event(
                    event_pk="corr-4",
                    claim_token="lease-4",
                    event_type="payment_intent.succeeded",
                    obj=obj,
                )
            )
        args = conn.sqls("INSERT INTO donations")[0][2]
        assert args[5] == "one_time"
        assert args[6] is False

    def test_no_external_calls_inside_transaction(self):
        """In der Transaktion nur lokale SQL-Statements — kein HTTP-Client."""
        conn = FakeConn()
        with (
            _patch_transaction(conn),
            patch("httpx.AsyncClient") as mock_httpx,
        ):
            _run(
                process_stripe_event(
                    event_pk="corr-5",
                    claim_token="lease-5",
                    event_type="payment_intent.succeeded",
                    obj=self.OBJ,
                )
            )
        mock_httpx.assert_not_called()


class TestProcessFailed:
    OBJ = {
        "id": "pi_failed42",
        "amount": 2500,
        "currency": "eur",
        "metadata": {"email": "spender@example.at"},
        "last_payment_error": {"message": "Karte abgelehnt"},
    }

    def test_failed_updates_intent_and_emits_outbox(self):
        conn = FakeConn()
        with _patch_transaction(conn):
            result = _run(
                process_stripe_event(
                    event_pk="corr-6",
                    claim_token="lease-6",
                    event_type="payment_intent.payment_failed",
                    obj=self.OBJ,
                )
            )
        update = conn.sqls("UPDATE payment_intents")[0]
        assert update[2][0] == "failed"
        outbox = conn.sqls("INSERT INTO outbox_events")
        assert len(outbox) == 1
        payload = json.loads(outbox[0][2][2])
        assert payload["correlation_id"] == "corr-6"
        assert payload["status"] == "failed"
        assert payload["idempotency_key"] == "payment.failed:corr-6"
        assert result["payment_failed"] is True
        assert result["failure_reason"] == "Karte abgelehnt"

    def test_canceled_updates_intent_without_failed_flag(self):
        conn = FakeConn()
        with _patch_transaction(conn):
            result = _run(
                process_stripe_event(
                    event_pk="corr-7",
                    claim_token="lease-7",
                    event_type="payment_intent.canceled",
                    obj={"id": "pi_c", "amount": 1000},
                )
            )
        assert conn.sqls("UPDATE payment_intents")[0][2][0] == "canceled"
        assert result["payment_failed"] is False

    def test_new_inbox_envelope_excludes_provider_metadata_and_error_text(self):
        envelope = normalize_stripe_event_for_inbox(
            event_type="payment_intent.payment_failed",
            obj={
                "id": "pi_private",
                "amount": 2500,
                "currency": "eur",
                "metadata": {"email": "spender@example.at", "name": "Maria Muster"},
                "last_payment_error": {"message": "Karte abgelehnt"},
            },
        )
        assert envelope == {
            "schema_version": 2,
            "event_type": "payment_intent.payment_failed",
            "payment_intent_id": "pi_private",
            "amount_cents": 2500,
            "currency": "EUR",
        }


# ─────────────────────────────────────────────────────────────────────────────
# Slack-Alert: keine PII (P1-002)
# ─────────────────────────────────────────────────────────────────────────────


class TestSlackAlertPrivacy:
    def test_alert_contains_no_pii_and_no_stripe_ids(self):
        text = build_ops_alert_text(
            event_type="payment_intent.payment_failed",
            amount=25.0,
            currency="EUR",
            correlation_id="11111111-2222-3333-4444-555555555555",
        )
        assert "25.00 EUR" in text
        assert "payment_intent.payment_failed" in text
        assert "11111111-2222-3333-4444-555555555555" in text
        # Keine personenbezogenen Daten, keine Gateway-IDs
        assert "@" not in text
        assert "pi_" not in text
        assert "Donor" not in text
        assert "Intent" not in text


# ─────────────────────────────────────────────────────────────────────────────
# Route: Reihenfolge, Duplikate, Fehlerpfad (Ende-zu-Ende über HTTP)
# ─────────────────────────────────────────────────────────────────────────────


def _post_webhook(client, payload: dict):
    return client.post(
        "/api/webhooks/stripe",
        content=json.dumps(payload).encode(),
        headers={"stripe-signature": "t=1,v1=mocksig", "Content-Type": "application/json"},
    )


def _sig_ok():
    return patch(
        "app.services.payment_service.payment_service.verify_stripe_signature",
        new=AsyncMock(),
    )


class TestWebhookRoute:
    def test_missing_signature_rejected_before_ingest(self, client):
        with patch(f"{_ROUTER}.stripe_webhook_inbox.ingest", new=AsyncMock()) as ingest:
            resp = client.post(
                "/api/webhooks/stripe",
                content=b"{}",
                headers={"Content-Type": "application/json"},
            )
        assert resp.status_code == 400
        ingest.assert_not_called()

    def test_event_ingested_before_business_logic(self, client):
        """Durable-first: ingest MUSS vor process_stripe_event laufen."""
        order: list[str] = []

        async def fake_ingest(**kwargs):
            order.append("ingest")
            return {"id": "uuid-x", "status": "received", "created": True}

        async def fake_claim(pk):
            order.append("claim")
            return "lease-x"

        async def fake_process(**kwargs):
            order.append("process")
            return {"event_type": kwargs["event_type"]}

        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_1"})
        with (
            _sig_ok(),
            patch(f"{_ROUTER}.stripe_webhook_inbox.ingest", side_effect=fake_ingest),
            patch(f"{_ROUTER}.stripe_webhook_inbox.claim", side_effect=fake_claim),
            patch(f"{_ROUTER}.process_stripe_event", side_effect=fake_process),
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 200
        assert order == ["ingest", "claim", "process"]

    def test_already_processed_event_short_circuits(self, client):
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_dup"})
        with (
            _sig_ok(),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-d", "status": "processed", "created": False}
                ),
            ),
            patch(f"{_ROUTER}.stripe_webhook_inbox.claim", new=AsyncMock()) as claim,
            patch(f"{_ROUTER}.process_stripe_event", new=AsyncMock()) as process,
            patch(f"{_ROUTER}.mail_service.send_template", new=AsyncMock()) as mail,
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 200
        assert "bereits" in resp.json()["message"]
        claim.assert_not_called()
        process.assert_not_called()
        mail.assert_not_called()

    def test_concurrent_duplicate_loses_claim_no_processing(self, client):
        """Zweiter paralleler Request: Event existiert (created=False,
        status=received), Claim verliert → keine Verarbeitung, 200."""
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_race"})
        with (
            _sig_ok(),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-r", "status": "received", "created": False}
                ),
            ),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.claim",
                new=AsyncMock(return_value=False),
            ),
            patch(f"{_ROUTER}.process_stripe_event", new=AsyncMock()) as process,
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 200
        process.assert_not_called()

    def test_failed_event_is_retryable_via_claim(self, client):
        """Retry-Pfad: status=failed → Claim gewinnt → Verarbeitung läuft."""
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_retry"})
        with (
            _sig_ok(),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-f", "status": "failed", "created": False}
                ),
            ),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.claim",
                new=AsyncMock(return_value="lease-f"),
            ),
            patch(
                f"{_ROUTER}.process_stripe_event",
                new=AsyncMock(return_value={"event_type": "payment_intent.succeeded"}),
            ) as process,
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 200
        process.assert_called_once()

    def test_processing_crash_marks_failed_and_returns_500(self, client):
        """Crash During Processing: Event bleibt gespeichert (mark_failed),
        Antwort 500 → Stripe stellt erneut zu."""
        payload = _stripe_event("payment_intent.succeeded", {"id": "pi_crash"})
        with (
            _sig_ok(),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-c", "status": "received", "created": True}
                ),
            ),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.claim",
                new=AsyncMock(return_value="lease-c"),
            ),
            patch(
                f"{_ROUTER}.process_stripe_event",
                new=AsyncMock(side_effect=RuntimeError("db down")),
            ),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.mark_failed", new=AsyncMock()
            ) as mark_failed,
            patch(f"{_ROUTER}.mail_service.send_template", new=AsyncMock()) as mail,
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 500
        mark_failed.assert_called_once()
        assert mark_failed.call_args.kwargs["error"] == "RuntimeError"
        assert mark_failed.call_args.kwargs["claim_token"] == "lease-c"
        mail.assert_not_called()  # keine Folgeeffekte ohne Commit

    def test_slack_dispatch_receives_sanitized_text_only(self, client):
        """Route-seitig: der an Slack gesendete Text enthält weder
        Spender-E-Mail noch Stripe-Intent-ID (P1-002)."""
        payload = _stripe_event(
            "payment_intent.payment_failed",
            {
                "id": "pi_slack1",
                "amount": 5000,
                "currency": "eur",
                "metadata": {"email": "spender@example.at"},
                "last_payment_error": {"message": "Karte abgelehnt"},
            },
        )
        slack_client = AsyncMock()
        slack_client.__aenter__ = AsyncMock(return_value=slack_client)
        slack_client.__aexit__ = AsyncMock(return_value=None)
        slack_client.post = AsyncMock(return_value=None)

        with (
            _sig_ok(),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.ingest",
                new=AsyncMock(
                    return_value={"id": "uuid-s", "status": "received", "created": True}
                ),
            ),
            patch(
                f"{_ROUTER}.stripe_webhook_inbox.claim",
                new=AsyncMock(return_value="lease-s"),
            ),
            patch(
                f"{_ROUTER}.process_stripe_event",
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
            patch(f"{_ROUTER}.ADMIN_EMAILS", []),
            patch(f"{_ROUTER}.mail_service.send_template", new=AsyncMock()),
            patch(
                f"{_ROUTER}.get_secret",
                return_value="https://hooks.slack.com/services/mock",
            ),
            patch(f"{_ROUTER}.httpx.AsyncClient", return_value=slack_client),
        ):
            resp = _post_webhook(client, payload)
        assert resp.status_code == 200
        slack_client.post.assert_called_once()
        text = slack_client.post.call_args.kwargs["json"]["text"]
        assert "spender@example.at" not in text
        assert "pi_slack1" not in text
        assert "uuid-s" in text  # Correlation-ID statt PII

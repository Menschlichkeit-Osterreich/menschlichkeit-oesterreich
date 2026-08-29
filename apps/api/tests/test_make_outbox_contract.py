"""Contract tests for the signed FastAPI-to-Make outbox boundary."""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.routers import make_outbox
from app.schemas.internal import MakeOutboxAckRequest
from app.services import make_outbox_service as outbox_module
from app.services.make_outbox_service import MakeOutboxService, sanitise_payload


def run(coro):
    return asyncio.run(coro)


class FakeRequest:
    def __init__(self, body: bytes, headers: dict[str, str]) -> None:
        self._body = body
        self.headers = headers

    async def body(self) -> bytes:
        return self._body


class FakeConnection:
    def __init__(self, *, ack_key: str | None = None, update: dict | None = None):
        self.ack_key = ack_key
        self.update = update or {
            "id": "00000000-0000-0000-0000-000000000111",
            "event_type": "donation.recorded",
            "status": "processed",
        }
        self.calls: list[tuple[str, str, tuple]] = []

    async def fetchrow(self, sql: str, *args):
        self.calls.append(("fetchrow", sql, args))
        if "SELECT id, event_type, status, ack_idempotency_key" in sql:
            return {
                "id": args[0],
                "event_type": "donation.recorded",
                "status": "leased",
                "ack_idempotency_key": self.ack_key,
            }
        if "UPDATE outbox_events" in sql:
            return self.update
        return None

    async def execute(self, sql: str, *args):
        self.calls.append(("execute", sql, args))
        return "OK"


def patch_transaction(conn: FakeConnection):
    @asynccontextmanager
    async def fake_transaction():
        yield conn

    return patch.object(outbox_module, "transaction", fake_transaction)


class TestDataMinimisation:
    def test_payload_allowlist_excludes_donor_data_and_provider_error(self):
        payload = {
            "schema_version": 1,
            "correlation_id": "corr-123",
            "amount": "25.00",
            "currency": "EUR",
            "donor_email": "spender@example.at",
            "donor_name": "Maria Muster",
            "receipt_email_sent_by_api": True,
            "failure_reason": "Karte abgelehnt",
            "gateway_payment_id": "pi_123",
        }
        sanitised = sanitise_payload("donation.recorded", payload)
        assert sanitised["gateway_payment_id"] == "pi_123"
        encoded = json.dumps(sanitised)
        assert "spender@example.at" not in encoded
        assert "Maria Muster" not in encoded
        assert "Karte abgelehnt" not in encoded

    def test_unknown_event_type_never_forwards_raw_payload(self):
        assert sanitise_payload("unknown.event", {"email": "a@example.at"}) == {}


class TestClaimLease:
    def test_claim_uses_skip_locked_and_returns_only_sanitised_event(self):
        row = {
            "id": "00000000-0000-0000-0000-000000000001",
            "event_type": "donation.recorded",
            "aggregate_type": "donation",
            "aggregate_id": "42",
            "idempotency_key": "donation.recorded:42",
            "lease_token": "00000000-0000-0000-0000-000000000002",
            "lease_expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
            "attempts": 1,
            "payload": {
                "schema_version": 1,
                "donation_id": 42,
                "amount": "25.00",
                "currency": "EUR",
                "donor_email": "spender@example.at",
            },
        }
        mock = AsyncMock(return_value=[row])
        with patch.object(outbox_module, "fetch", mock):
            events = run(
                MakeOutboxService().claim(
                    consumer_id="make-moe-v1", limit=20, lease_seconds=300
                )
            )
        sql = mock.call_args.args[0]
        assert "FOR UPDATE SKIP LOCKED" in sql
        assert "lease_token = gen_random_uuid()" in sql
        assert "lease_expires_at" in sql
        assert events[0]["payload"]["donation_id"] == 42
        assert "spender@example.at" not in json.dumps(events)


class TestAcknowledgement:
    def test_success_ack_is_lease_bound_and_idempotent(self):
        conn = FakeConnection()
        with patch_transaction(conn):
            result = run(
                MakeOutboxService().acknowledge(
                    event_id="00000000-0000-0000-0000-000000000111",
                    lease_token="00000000-0000-0000-0000-000000000222",
                    idempotency_key="make.ack.0001",
                    result_class="succeeded",
                    result_reference="make-run-1",
                    retry_after_seconds=None,
                )
            )
        assert result.status == "processed"
        update_sql = conn.calls[1][1]
        assert "status = 'leased'" in update_sql
        assert "lease_token = $2::uuid" in update_sql
        assert "ack_idempotency_key" in update_sql
        assert "processed_at" in update_sql

    def test_duplicate_ack_returns_idempotent_result_without_second_write(self):
        conn = FakeConnection(ack_key="make.ack.0001")
        with patch_transaction(conn):
            result = run(
                MakeOutboxService().acknowledge(
                    event_id="00000000-0000-0000-0000-000000000111",
                    lease_token="00000000-0000-0000-0000-000000000222",
                    idempotency_key="make.ack.0001",
                    result_class="succeeded",
                    result_reference=None,
                    retry_after_seconds=None,
                )
            )
        assert result.idempotent is True
        assert len(conn.calls) == 1

    def test_schema_failure_creates_data_minimised_dead_letter(self):
        conn = FakeConnection(
            update={
                "id": "00000000-0000-0000-0000-000000000111",
                "event_type": "donation.recorded",
                "status": "dead_letter",
            }
        )
        with patch_transaction(conn):
            result = run(
                MakeOutboxService().acknowledge(
                    event_id="00000000-0000-0000-0000-000000000111",
                    lease_token="00000000-0000-0000-0000-000000000222",
                    idempotency_key="make.ack.0002",
                    result_class="schema_failure",
                    result_reference="schema-v1",
                    retry_after_seconds=None,
                )
            )
        assert result.dead_lettered is True
        dlq = next(call for call in conn.calls if call[0] == "execute")
        assert "integration_failures" in dlq[1]
        assert "spender@example.at" not in json.dumps(dlq[2])


class TestSignature:
    def test_valid_time_bound_hmac_is_accepted(self):
        secret = "make-test-shared-secret"
        raw_body = b'{"consumer_id":"make-moe-v1"}'
        timestamp = str(int(time.time()))
        signature = hmac.new(
            secret.encode("utf-8"), timestamp.encode("ascii") + b"." + raw_body,
            hashlib.sha256,
        ).hexdigest()
        request = FakeRequest(
            raw_body,
            {"x-moe-timestamp": timestamp, "x-moe-outbox-signature": signature},
        )
        with patch.object(make_outbox, "get_secret", return_value=secret):
            run(make_outbox.require_make_outbox_signature(request))

    def test_signature_cannot_be_replaced_with_bearer_token(self):
        request = FakeRequest(b"{}", {"authorization": "Bearer any-token"})
        with patch.object(make_outbox, "get_secret", return_value="shared-secret"):
            with pytest.raises(HTTPException) as exc:
                run(make_outbox.require_make_outbox_signature(request))
        assert exc.value.status_code == 401


class TestModelsAndMigration:
    def test_ack_model_rejects_result_reference_that_looks_like_email(self):
        with pytest.raises(Exception):
            MakeOutboxAckRequest(
                lease_token="00000000-0000-0000-0000-000000000222",
                idempotency_key="make.ack.0001",
                result_class="succeeded",
                result_reference="spender@example.at",
            )

    def test_followup_migration_is_non_destructive_and_depends_on_payment_head(self):
        migration = (
            Path(__file__).resolve().parents[1]
            / "alembic/versions/009_make_outbox_contract.py"
        ).read_text(encoding="utf-8")
        assert 'down_revision = "008"' in migration
        assert "ack_idempotency_key" in migration
        assert "DROP TABLE" not in migration

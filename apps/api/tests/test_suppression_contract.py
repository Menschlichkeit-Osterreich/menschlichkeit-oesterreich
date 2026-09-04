"""Contract tests for the authoritative suppression boundary.

These cover the properties that make the boundary worth having: normalisation,
idempotency of a replayed delivery, refusal of unusable input, and the rule
that a duplicate must not emit a second outbox event.
"""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from unittest.mock import patch

import pytest

from app.services import suppression_service as suppression_module
from app.services.make_outbox_service import sanitise_payload
from app.services.suppression_service import (
    SuppressionRejected,
    SuppressionService,
    build_idempotency_key,
    normalize_identity,
)


def run(coro):
    return asyncio.run(coro)


class FakeConnection:
    """Minimal stand-in that records the statements the service issues."""

    def __init__(self, *, entry_inserted: bool, audit_row):
        self.entry_inserted = entry_inserted
        self.audit_row = audit_row
        self.fetchrow_calls: list[tuple[str, tuple]] = []
        self.execute_calls: list[tuple[str, tuple]] = []

    async def fetchrow(self, query: str, *args):
        self.fetchrow_calls.append((query, args))
        if "suppression_entries" in query:
            now = datetime(2026, 9, 2, 12, 0, tzinfo=timezone.utc)
            return {
                "id": "11111111-1111-1111-1111-111111111111",
                "first_committed_at": now,
                "last_confirmed_at": now,
                "inserted": self.entry_inserted,
            }
        if "suppression_events" in query:
            return self.audit_row
        raise AssertionError(f"unexpected fetchrow: {query}")

    async def execute(self, query: str, *args):
        self.execute_calls.append((query, args))


@asynccontextmanager
async def fake_transaction(conn):
    yield conn


def commit_with(conn, **overrides):
    payload = {
        "realm": "BOOK",
        "identity": "  Redaktion@Example.AT ",
        "source_system": "make:7187291",
        "source_event_id": "gmail:18f0c9",
        "evidence_reference": "https://mail.google.com/mail/u/0/#all/18f0c9",
    }
    payload.update(overrides)
    service = SuppressionService()
    with patch.object(
        suppression_module, "transaction", lambda: fake_transaction(conn)
    ):
        return run(service.commit(**payload))


def test_identity_is_normalised_case_and_whitespace_only():
    assert normalize_identity("  Redaktion@Example.AT ") == "redaktion@example.at"
    # Plus-addressing is left intact: collapsing it would suppress an address
    # the person never asked to have suppressed.
    assert normalize_identity("a+presse@example.at") == "a+presse@example.at"


def test_first_commit_writes_entry_audit_and_outbox_event():
    conn = FakeConnection(entry_inserted=True, audit_row={"id": "audit-1"})
    result = commit_with(conn)

    assert result.created is True
    assert result.duplicate_delivery is False
    assert result.normalized_identity == "redaktion@example.at"

    audit_query, audit_args = conn.fetchrow_calls[1]
    assert "suppression_events" in audit_query
    assert "suppress" in audit_args

    assert len(conn.execute_calls) == 1
    outbox_query, outbox_args = conn.execute_calls[0]
    assert "outbox_events" in outbox_query
    assert "suppression.committed" in outbox_args
    assert (
        build_idempotency_key("BOOK", "redaktion@example.at", "gmail:18f0c9")
        in outbox_args
    )


def test_replayed_delivery_is_recorded_once_and_emits_no_second_event():
    # ON CONFLICT DO NOTHING on the audit table returns no row.
    conn = FakeConnection(entry_inserted=False, audit_row=None)
    result = commit_with(conn)

    assert result.duplicate_delivery is True
    assert result.created is False
    # The suppression still holds, but nothing is propagated a second time.
    assert conn.execute_calls == []


def test_repeated_optout_from_a_new_message_still_propagates():
    conn = FakeConnection(entry_inserted=False, audit_row={"id": "audit-2"})
    result = commit_with(conn, source_event_id="gmail:99ffee")

    assert result.created is False
    assert result.duplicate_delivery is False
    assert len(conn.execute_calls) == 1


@pytest.mark.parametrize(
    "overrides",
    [
        {"realm": "PRIVATE"},
        {"realm": ""},
        {"identity": "kein-adressat"},
        {"identity": ""},
        {"source_event_id": "  "},
    ],
)
def test_unusable_input_is_refused_rather_than_silently_accepted(overrides):
    conn = FakeConnection(entry_inserted=True, audit_row={"id": "audit-3"})
    with pytest.raises(SuppressionRejected):
        commit_with(conn, **overrides)
    assert conn.fetchrow_calls == []
    assert conn.execute_calls == []


def test_outbox_payload_carries_the_identity_and_nothing_from_the_message():
    sanitised = sanitise_payload(
        "suppression.committed",
        {
            "schema_version": "1.0",
            "idempotency_key": "optout:BOOK:redaktion@example.at:gmail:18f0c9",
            "suppression_id": "11111111-1111-1111-1111-111111111111",
            "realm": "BOOK",
            "normalized_identity": "redaktion@example.at",
            "identity_kind": "email",
            "status": "suppressed",
            "source_system": "make:7187291",
            "source_event_id": "gmail:18f0c9",
            "email_subject": "Bitte keine weiteren Mails",
            "email_body": "…",
            "ai_reason": "…",
        },
    )
    assert sanitised["normalized_identity"] == "redaktion@example.at"
    assert "email_subject" not in sanitised
    assert "email_body" not in sanitised
    assert "ai_reason" not in sanitised

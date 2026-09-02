"""Authoritative opt-out handling.

The rule this service exists to enforce is short: a suppression is committed
to the database before any caller is allowed to treat the incoming message as
processed.  Everything else - the CRM task, the log row, the mailbox label -
is a consequence of that commit, never a substitute for it.

The commit is one transaction covering three writes:

1. the current-state row, protected by a unique constraint on (realm, identity)
2. the append-only audit row, keyed by an idempotency key
3. the outbox event that lets the integration layer propagate the suppression

If any of the three fails, none of them happened, and the caller gets an error
instead of a false confirmation.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

from ..db import fetchrow, transaction

SUPPRESSION_EVENT_TYPE = "suppression.committed"

# Realms are organisational boundaries, not labels.  A suppression in one realm
# says nothing about another: someone who opts out of a private book campaign
# has not opted out of association membership mail.
ALLOWED_REALMS = ("MOE", "BOOK", "POLITICS_LAIMER", "POLITICS_BASIS")

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SuppressionRejected(ValueError):
    """The request cannot be committed and must not be reported as processed."""


@dataclass(frozen=True)
class SuppressionCommit:
    """Outcome of a commit attempt.

    ``created`` distinguishes a first suppression from a repeated confirmation.
    Both are successes - the caller may proceed either way - but only the first
    changes anything for the person concerned.
    """

    suppression_id: str
    realm: str
    normalized_identity: str
    created: bool
    duplicate_delivery: bool
    first_committed_at: Any
    last_confirmed_at: Any


def normalize_identity(raw: str) -> str:
    """Reduce an address to the form the unique constraint compares.

    Case and surrounding whitespace are not part of the identity.  Anything
    beyond that - plus-addressing, dots in local parts - is deliberately left
    alone: guessing that two addresses belong to the same person is how one
    ends up suppressing the wrong one.
    """
    return (raw or "").strip().lower()


def build_idempotency_key(realm: str, normalized: str, source_event_id: str) -> str:
    """Key of a single delivery, not of the suppression itself.

    Two different opt-out mails from the same person are two events and both
    belong in the audit trail.  The same mail delivered twice is one.
    """
    return f"optout:{realm}:{normalized}:{source_event_id}"


class SuppressionService:
    async def commit(
        self,
        *,
        realm: str,
        identity: str,
        source_system: str,
        source_event_id: str,
        evidence_reference: str | None = None,
        detected_at: Any | None = None,
    ) -> SuppressionCommit:
        realm = (realm or "").strip().upper()
        if realm not in ALLOWED_REALMS:
            raise SuppressionRejected(f"Unbekannter Realm: {realm or '(leer)'}")

        normalized = normalize_identity(identity)
        if not _EMAIL_PATTERN.match(normalized):
            raise SuppressionRejected("Keine verwertbare E-Mail-Adresse übermittelt")

        source_event_id = (source_event_id or "").strip()
        if not source_event_id:
            raise SuppressionRejected(
                "source_event_id fehlt - ohne Herkunft keine Idempotenz"
            )

        source_system = (source_system or "").strip() or "unspecified"
        idempotency_key = build_idempotency_key(realm, normalized, source_event_id)

        async with transaction() as conn:
            entry = await conn.fetchrow(
                """
                INSERT INTO suppression_entries (
                    realm, normalized_identity, identity_kind, status,
                    source_system, source_event_id, evidence_reference
                )
                VALUES ($1, $2, 'email', 'suppressed', $3, $4, $5)
                ON CONFLICT (realm, normalized_identity) DO UPDATE
                    SET status = 'suppressed',
                        last_confirmed_at = NOW(),
                        confirmation_count = suppression_entries.confirmation_count + 1
                RETURNING id, first_committed_at, last_confirmed_at,
                          (xmax = 0) AS inserted
                """,
                realm,
                normalized,
                source_system,
                source_event_id,
                evidence_reference,
            )

            created = bool(entry["inserted"])
            suppression_id = str(entry["id"])

            audit = await conn.fetchrow(
                """
                INSERT INTO suppression_events (
                    suppression_entry_id, realm, normalized_identity, action,
                    source_system, source_event_id, idempotency_key,
                    evidence_reference, detected_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (idempotency_key) DO NOTHING
                RETURNING id
                """,
                entry["id"],
                realm,
                normalized,
                "suppress" if created else "confirm",
                source_system,
                source_event_id,
                idempotency_key,
                evidence_reference,
                detected_at,
            )

            duplicate_delivery = audit is None

            # Only a genuinely new delivery is worth propagating.  Replaying the
            # same opt-out must not produce a second round of side effects in
            # CiviCRM or the mailers.
            if not duplicate_delivery:
                await conn.execute(
                    """
                    INSERT INTO outbox_events (
                        event_type, aggregate_type, aggregate_id, payload,
                        status, idempotency_key
                    )
                    VALUES ($1, 'suppression', $2, $3::jsonb, 'pending', $4)
                    ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL
                        DO NOTHING
                    """,
                    SUPPRESSION_EVENT_TYPE,
                    suppression_id,
                    json.dumps(
                        {
                            "schema_version": "1.0",
                            "idempotency_key": idempotency_key,
                            "suppression_id": suppression_id,
                            "realm": realm,
                            "normalized_identity": normalized,
                            "identity_kind": "email",
                            "status": "suppressed",
                            "source_system": source_system,
                            "source_event_id": source_event_id,
                        }
                    ),
                    idempotency_key,
                )

            return SuppressionCommit(
                suppression_id=suppression_id,
                realm=realm,
                normalized_identity=normalized,
                created=created,
                duplicate_delivery=duplicate_delivery,
                first_committed_at=entry["first_committed_at"],
                last_confirmed_at=entry["last_confirmed_at"],
            )

    async def is_suppressed(self, *, realm: str, identity: str) -> bool:
        """Answer the only question a mailer needs to ask before sending."""
        realm = (realm or "").strip().upper()
        normalized = normalize_identity(identity)
        if not realm or not normalized:
            return False
        row = await fetchrow(
            """
            SELECT 1
            FROM suppression_entries
            WHERE realm = $1 AND normalized_identity = $2 AND status = 'suppressed'
            """,
            realm,
            normalized,
        )
        return row is not None


suppression_service = SuppressionService()

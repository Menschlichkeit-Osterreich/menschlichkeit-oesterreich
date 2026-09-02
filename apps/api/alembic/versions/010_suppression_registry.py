"""Authoritative suppression registry for opt-out handling.

Until now no component of this system could answer the question "is this
address suppressed?" with authority.  The Make automation layer created a
HubSpot task and marked the incoming mail as processed; the task is a work
item, not a suppression.  A task can be closed, moved, or overlooked without
anything changing about whether the person may be contacted again.

This revision moves that fact into the database, where it belongs:

* ``suppression_entries`` holds the current state, one row per identity and
  realm, enforced by a unique constraint.  The constraint is the guarantee -
  a second opt-out for the same address cannot create a second truth.
* ``suppression_events`` is append-only.  It records every claim that arrived,
  including duplicates, keyed by an idempotency key so a retried delivery is
  recorded once.  Withdrawal of consent must stay auditable long after the
  operational entry is gone, so nothing here is ever updated in place.

Deliberately not stored: message bodies, subjects, or any free text from the
incoming mail.  The registry needs the identity, the origin, and a reference
that lets a human find the evidence - not the evidence itself.
"""

from alembic import op

revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS suppression_entries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            realm TEXT NOT NULL,
            normalized_identity TEXT NOT NULL,
            identity_kind TEXT NOT NULL DEFAULT 'email',
            status TEXT NOT NULL DEFAULT 'suppressed',
            first_committed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            source_system TEXT NOT NULL,
            source_event_id TEXT NOT NULL,
            evidence_reference TEXT,
            confirmation_count INTEGER NOT NULL DEFAULT 1
        );
        """
    )
    op.execute(
        """
        ALTER TABLE suppression_entries
            DROP CONSTRAINT IF EXISTS ck_suppression_entries_status;
        """
    )
    op.execute(
        """
        ALTER TABLE suppression_entries
            ADD CONSTRAINT ck_suppression_entries_status
            CHECK (status IN ('suppressed', 'released'));
        """
    )
    # The unique constraint is the actual protection.  Application code can be
    # wrong; this cannot be bypassed by a concurrent second writer.
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_suppression_entries_realm_identity
            ON suppression_entries (realm, normalized_identity);
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS suppression_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            suppression_entry_id UUID REFERENCES suppression_entries (id),
            realm TEXT NOT NULL,
            normalized_identity TEXT NOT NULL,
            action TEXT NOT NULL,
            source_system TEXT NOT NULL,
            source_event_id TEXT NOT NULL,
            idempotency_key TEXT NOT NULL,
            evidence_reference TEXT,
            detected_at TIMESTAMPTZ,
            recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        ALTER TABLE suppression_events
            DROP CONSTRAINT IF EXISTS ck_suppression_events_action;
        """
    )
    op.execute(
        """
        ALTER TABLE suppression_events
            ADD CONSTRAINT ck_suppression_events_action
            CHECK (action IN ('suppress', 'confirm', 'release'));
        """
    )
    # A retried delivery of the same opt-out must land once, not twice.
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_suppression_events_idempotency
            ON suppression_events (idempotency_key);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_suppression_events_identity
            ON suppression_events (realm, normalized_identity, recorded_at DESC);
        """
    )


def downgrade() -> None:
    # The audit table is intentionally dropped last and only on an explicit
    # downgrade.  Removing proof of a withdrawal of consent is not a routine
    # operation.
    op.execute("DROP INDEX IF EXISTS ix_suppression_events_identity;")
    op.execute("DROP INDEX IF EXISTS ux_suppression_events_idempotency;")
    op.execute("DROP TABLE IF EXISTS suppression_events;")
    op.execute("DROP INDEX IF EXISTS ux_suppression_entries_realm_identity;")
    op.execute("DROP TABLE IF EXISTS suppression_entries;")

"""Payment durability and one-time-payment guardrails.

Revision: 008
Revises: 007

The migration is deliberately non-destructive:

* Existing provider payloads and historical rows are retained unchanged.
* New outbox writes receive an idempotency key protected by a partial unique
  index.  Existing rows keep a NULL key.
* The payment constraints are ``NOT VALID`` so historical data is not
  rewritten; PostgreSQL still enforces them for new or updated rows.
* Receipt eligibility defaults to false until a separate legal/operational
  receipt track defines numbering, corrections, retention and delivery.
"""

from alembic import op


revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE outbox_events
            ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
            ADD COLUMN IF NOT EXISTS lease_owner TEXT,
            ADD COLUMN IF NOT EXISTS lease_token TEXT,
            ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS result_class TEXT,
            ADD COLUMN IF NOT EXISTS result_reference TEXT;
        """
    )
    op.execute(
        """
        ALTER TABLE webhook_events
            ADD COLUMN IF NOT EXISTS claim_token TEXT,
            ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ;
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_outbox_events_idempotency_key
            ON outbox_events (idempotency_key)
            WHERE idempotency_key IS NOT NULL;
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_outbox_events_status_lease_retry
            ON outbox_events (status, lease_expires_at, next_retry_at, created_at);
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'ck_outbox_events_payment_idempotency'
            ) THEN
                ALTER TABLE outbox_events
                    ADD CONSTRAINT ck_outbox_events_payment_idempotency
                    CHECK (
                        event_type NOT IN (
                            'donation.recorded',
                            'payment.failed',
                            'payment.canceled'
                        )
                        OR idempotency_key IS NOT NULL
                    ) NOT VALID;
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'ck_outbox_events_result_class'
            ) THEN
                ALTER TABLE outbox_events
                    ADD CONSTRAINT ck_outbox_events_result_class
                    CHECK (
                        result_class IS NULL
                        OR result_class IN (
                            'success', 'transient', 'permanent', 'business',
                            'auth', 'rate_limit', 'schema'
                        )
                    ) NOT VALID;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        ALTER TABLE donations
            ALTER COLUMN receipt_eligible SET DEFAULT FALSE;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'ck_donations_one_time_only'
            ) THEN
                ALTER TABLE donations
                    ADD CONSTRAINT ck_donations_one_time_only
                    CHECK (
                        donation_type = 'one_time'
                        AND is_recurring = FALSE
                    ) NOT VALID;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE donations DROP CONSTRAINT IF EXISTS ck_donations_one_time_only;"
    )
    op.execute(
        "ALTER TABLE donations ALTER COLUMN receipt_eligible SET DEFAULT TRUE;"
    )
    op.execute(
        "ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS ck_outbox_events_payment_idempotency;"
    )
    op.execute(
        "ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS ck_outbox_events_result_class;"
    )
    op.execute("DROP INDEX IF EXISTS ix_outbox_events_status_lease_retry;")
    op.execute("DROP INDEX IF EXISTS ux_outbox_events_idempotency_key;")
    op.execute(
        """
        ALTER TABLE outbox_events
            DROP COLUMN IF EXISTS idempotency_key,
            DROP COLUMN IF EXISTS lease_owner,
            DROP COLUMN IF EXISTS lease_token,
            DROP COLUMN IF EXISTS lease_expires_at,
            DROP COLUMN IF EXISTS acknowledged_at,
            DROP COLUMN IF EXISTS result_class,
            DROP COLUMN IF EXISTS result_reference;
        """
    )
    op.execute(
        """
        ALTER TABLE webhook_events
            DROP COLUMN IF EXISTS claim_token,
            DROP COLUMN IF EXISTS claim_expires_at;
        """
    )

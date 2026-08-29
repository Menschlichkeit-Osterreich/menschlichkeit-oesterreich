"""Make outbox acknowledgement contract.

Revision 008 establishes durable, lease-aware outbox delivery.  This follow-up
keeps existing events untouched and adds the acknowledgement idempotency field
needed by the signed Make consumer.  It deliberately stores only a bounded
result class and reference, never a provider response body.
"""

from alembic import op

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE outbox_events
            ADD COLUMN IF NOT EXISTS ack_idempotency_key TEXT;
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_outbox_events_ack_idempotency
            ON outbox_events (ack_idempotency_key)
            WHERE ack_idempotency_key IS NOT NULL;
        """
    )
    op.execute(
        """
        ALTER TABLE outbox_events
            DROP CONSTRAINT IF EXISTS ck_outbox_events_result_class;
        """
    )
    op.execute(
        """
        ALTER TABLE outbox_events
            ADD CONSTRAINT ck_outbox_events_result_class
            CHECK (
                result_class IS NULL OR result_class IN (
                    'succeeded', 'transient_failure', 'permanent_failure',
                    'business_failure', 'auth_failure', 'rate_limited',
                    'schema_failure'
                )
            );
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS ck_outbox_events_result_class;")
    op.execute("DROP INDEX IF EXISTS ux_outbox_events_ack_idempotency;")
    op.execute("ALTER TABLE outbox_events DROP COLUMN IF EXISTS ack_idempotency_key;")

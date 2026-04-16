"""004 – ERPNext Sync-Tracking und Idempotenz.

Revision: 004
Abhängig von: 003
"""

from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS finance_external_sync (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            source_system TEXT NOT NULL,
            source_entity_type TEXT NOT NULL,
            source_entity_id TEXT NOT NULL,
            target_system TEXT NOT NULL DEFAULT 'erpnext',
            target_doctype TEXT,
            target_docname TEXT,
            operation TEXT NOT NULL,
            idempotency_key TEXT NOT NULL UNIQUE,
            payload_hash TEXT NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,
            next_retry_at TIMESTAMPTZ,
            last_success_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_finance_external_sync_status_retry
        ON finance_external_sync(status, next_retry_at, created_at);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_finance_external_sync_source
        ON finance_external_sync(source_entity_type, source_entity_id, operation);
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_finance_external_sync_source;")
    op.execute("DROP INDEX IF EXISTS ix_finance_external_sync_status_retry;")
    op.execute("DROP TABLE IF EXISTS finance_external_sync;")

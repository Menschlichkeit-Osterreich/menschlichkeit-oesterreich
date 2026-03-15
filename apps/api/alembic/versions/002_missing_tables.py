"""002 – Fehlende Tabellen: sepa_batches, dunning_runs, dunning_notices, email_log

Revision: 002
Erstellt: 2026-03-10
Abhängig von: 001

Erstellt:
  - sepa_batches      (SEPA-Sammelüberweisungen / PAIN.008-Batches)
  - dunning_runs      (Mahnläufe)
  - dunning_notices   (Einzelne Mahnungen)
  - email_log         (Gesendete E-Mails)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── sepa_batches ─────────────────────────────────────────────────────────
    op.create_table('sepa_batches',
        sa.Column('id',               sa.Integer(),    primary_key=True),
        sa.Column('batch_reference',  sa.String(35),   nullable=False, unique=True),
        sa.Column('batch_type',       sa.String(4),    nullable=False, server_default='RCUR'),
        sa.Column('collection_date',  sa.Date(),       nullable=False),
        sa.Column('total_amount',     sa.Numeric(12, 2), nullable=False),
        sa.Column('mandate_count',    sa.Integer(),    nullable=False, server_default='0'),
        sa.Column('status',           sa.String(20),   nullable=False, server_default='pending'),
        sa.Column('pain_xml',         sa.Text(),       nullable=True),
        sa.Column('submitted_at',     sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at',       sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
    )
    op.create_index('ix_sepa_batches_status', 'sepa_batches', ['status'])
    op.create_index('ix_sepa_batches_date',   'sepa_batches', ['collection_date'])

    # ── sepa_batch_items (Mandate pro Batch) ─────────────────────────────────
    op.create_table('sepa_batch_items',
        sa.Column('id',          sa.Integer(), primary_key=True),
        sa.Column('batch_id',    sa.Integer(), sa.ForeignKey('sepa_batches.id', ondelete='CASCADE'),
                  nullable=False),
        sa.Column('mandate_id',  sa.Integer(), sa.ForeignKey('sepa_mandates.id'), nullable=False),
        sa.Column('amount',      sa.Numeric(12, 2), nullable=False),
        sa.Column('description', sa.String(140), nullable=True),
        sa.Column('status',      sa.String(20), nullable=False, server_default='pending'),
    )
    op.create_index('ix_sepa_batch_items_batch', 'sepa_batch_items', ['batch_id'])

    # ── dunning_runs ─────────────────────────────────────────────────────────
    op.create_table('dunning_runs',
        sa.Column('id',              sa.Integer(),    primary_key=True),
        sa.Column('run_date',        sa.Date(),       nullable=False),
        sa.Column('total_invoices',  sa.Integer(),    nullable=False, server_default='0'),
        sa.Column('total_amount',    sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column('status',          sa.String(20),   nullable=False, server_default='pending'),
        sa.Column('notes',           sa.Text(),       nullable=True),
        sa.Column('created_at',      sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.Column('completed_at',    sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_dunning_runs_date', 'dunning_runs', ['run_date'])

    # ── dunning_notices ───────────────────────────────────────────────────────
    op.create_table('dunning_notices',
        sa.Column('id',                sa.Integer(),    primary_key=True),
        sa.Column('dunning_run_id',    sa.Integer(),    sa.ForeignKey('dunning_runs.id', ondelete='CASCADE'),
                  nullable=False),
        sa.Column('invoice_id',        sa.Integer(),    sa.ForeignKey('invoices.id'), nullable=False),
        sa.Column('civicrm_contact_id', sa.Integer(),   nullable=False),
        sa.Column('dunning_level',     sa.Integer(),    nullable=False),  # 1=Erste, 2=Zweite, 3=Letzte Mahnung
        sa.Column('amount_due',        sa.Numeric(12, 2), nullable=False),
        sa.Column('due_date',          sa.Date(),       nullable=False),
        sa.Column('sent_at',           sa.DateTime(timezone=True), nullable=True),
        sa.Column('pdf_path',          sa.String(500),  nullable=True),
        sa.Column('status',            sa.String(20),   nullable=False, server_default='pending'),
    )
    op.create_index('ix_dunning_notices_contact', 'dunning_notices', ['civicrm_contact_id'])
    op.create_index('ix_dunning_notices_invoice', 'dunning_notices', ['invoice_id'])

    # ── email_log ─────────────────────────────────────────────────────────────
    op.create_table('email_log',
        sa.Column('id',               sa.Integer(),    primary_key=True),
        sa.Column('recipient_email',  sa.String(254),  nullable=False),
        sa.Column('subject',          sa.String(500),  nullable=False),
        sa.Column('template_name',    sa.String(100),  nullable=True),
        sa.Column('entity_type',      sa.String(50),   nullable=True),   # invoice, donation, dunning…
        sa.Column('entity_id',        sa.Integer(),    nullable=True),
        sa.Column('status',           sa.String(20),   nullable=False, server_default='sent'),
        sa.Column('provider',         sa.String(50),   nullable=True),   # n8n, smtp, sendgrid…
        sa.Column('provider_message_id', sa.String(200), nullable=True),
        sa.Column('error_message',    sa.Text(),       nullable=True),
        sa.Column('sent_at',          sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
    )
    op.create_index('ix_email_log_recipient',  'email_log', ['recipient_email'])
    op.create_index('ix_email_log_entity',     'email_log', ['entity_type', 'entity_id'])
    op.create_index('ix_email_log_sent_at',    'email_log', ['sent_at'])


def downgrade() -> None:
    op.drop_table('email_log')
    op.drop_table('dunning_notices')
    op.drop_table('dunning_runs')
    op.drop_table('sepa_batch_items')
    op.drop_table('sepa_batches')

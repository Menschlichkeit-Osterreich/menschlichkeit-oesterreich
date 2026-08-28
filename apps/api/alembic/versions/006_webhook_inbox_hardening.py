"""Webhook-Inbox-Hardening: Statusmodell, Gateway-Idempotency, Purpose-Feld.

Kontext (Platform-Audit 2026-08-28, Findings P1-001/P1-003):

- ``webhook_events`` besitzt bereits ``UNIQUE(provider, provider_event_id)``,
  aber kein Verarbeitungs-Statusmodell (attempts, Fehler, Claim-Zeitpunkte).
  Diese Migration ergänzt die Spalten, die das Inbox-Muster
  (received → processing → processed/failed) benötigt.

- ``donations`` speicherte die Stripe-Gateway-ID bisher nur im Freitextfeld
  ``notes``. Idempotenz war damit nicht auf Datenbankebene garantiert.
  Neu: ``gateway_provider`` + ``gateway_payment_id`` mit partiellem
  Unique-Index als harte Doppelbuchungs-Sperre, sowie ``purpose`` als
  eigenes fachliches Feld (bisher wurde der Spendenzweck in ``source``
  geschrieben und vermischte damit Herkunft und Zweck).

- ``donations.civicrm_contact_id`` wird nullable: Die CRM-Kontaktauflösung
  ist ein externer HTTP-Aufruf und gehört nicht in die kritische
  Webhook-Transaktion. Ohne erreichbares CRM scheiterte bisher die gesamte
  Spendenverbuchung. Die Verknüpfung erfolgt asynchron über Outbox-Events.

Backfill: Vorhandene ``notes``-Werte, die wie Stripe-IDs aussehen
(pi_/ch_/evt_/py_/sub_), werden nach ``gateway_payment_id`` kopiert —
pro Wert nur die älteste Zeile, damit der Unique-Index anlegbar ist.
Es werden keine Daten gelöscht oder überschrieben; ``notes`` bleibt
unverändert erhalten.
"""

from alembic import op

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None

_STRIPE_ID_PATTERN = r"^(pi|ch|evt|py|sub)_[A-Za-z0-9_]+$"


def upgrade() -> None:
    # ── webhook_events: Verarbeitungs-Statusmodell ──────────────────────────
    op.execute(
        """
        ALTER TABLE webhook_events
            ADD COLUMN IF NOT EXISTS event_type TEXT,
            ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_error TEXT,
            ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_webhook_events_status_retry
            ON webhook_events (processing_status, next_retry_at, created_at);
        """
    )

    # ── donations: Gateway-Referenz, Purpose, nullable CRM-Kontakt ──────────
    op.execute(
        """
        ALTER TABLE donations
            ADD COLUMN IF NOT EXISTS gateway_provider TEXT,
            ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT,
            ADD COLUMN IF NOT EXISTS purpose TEXT;
        """
    )
    op.execute(
        "ALTER TABLE donations ALTER COLUMN civicrm_contact_id DROP NOT NULL;"
    )

    # Backfill: nur die jeweils älteste Zeile pro notes-Wert erhält die
    # Gateway-Referenz, damit der partielle Unique-Index anlegbar ist.
    # Jüngere Duplikate bleiben unangetastet (keine Löschung, kein Overwrite).
    op.execute(
        f"""
        UPDATE donations d
        SET gateway_provider = 'stripe',
            gateway_payment_id = d.notes
        FROM (
            SELECT MIN(id) AS keep_id
            FROM donations
            WHERE notes ~ '{_STRIPE_ID_PATTERN}'
            GROUP BY notes
        ) firsts
        WHERE d.id = firsts.keep_id
          AND d.gateway_payment_id IS NULL;
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_donations_gateway_payment
            ON donations (gateway_provider, gateway_payment_id)
            WHERE gateway_payment_id IS NOT NULL;
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ux_donations_gateway_payment;")
    op.execute(
        """
        ALTER TABLE donations
            DROP COLUMN IF EXISTS gateway_provider,
            DROP COLUMN IF EXISTS gateway_payment_id,
            DROP COLUMN IF EXISTS purpose;
        """
    )
    # civicrm_contact_id bleibt nullable: Ein erneutes SET NOT NULL würde
    # fehlschlagen, sobald NULL-Zeilen existieren, und Daten dürfen hier
    # nicht gelöscht werden.
    op.execute("DROP INDEX IF EXISTS ix_webhook_events_status_retry;")
    op.execute(
        """
        ALTER TABLE webhook_events
            DROP COLUMN IF EXISTS event_type,
            DROP COLUMN IF EXISTS attempts,
            DROP COLUMN IF EXISTS last_error,
            DROP COLUMN IF EXISTS processing_started_at,
            DROP COLUMN IF EXISTS processed_at,
            DROP COLUMN IF EXISTS next_retry_at;
        """
    )

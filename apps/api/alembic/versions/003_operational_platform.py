"""003 – Vereinheitlicht Member-/Consent-/Webhook-/Operational-Schema.

Revision: 003
Abhängig von: 002
"""

from alembic import op

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            vorname TEXT NOT NULL DEFAULT '',
            nachname TEXT NOT NULL DEFAULT '',
            phone TEXT,
            rolle TEXT NOT NULL DEFAULT 'member',
            mitgliedschaft_typ TEXT NOT NULL DEFAULT 'ordentlich',
            status TEXT NOT NULL DEFAULT 'Active',
            civicrm_contact_id INTEGER,
            is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
            email_verification_token TEXT,
            email_verification_sent_at TIMESTAMPTZ,
            two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
            two_factor_secret TEXT,
            two_factor_pending_secret TEXT,
            two_factor_backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
            two_factor_confirmed_at TIMESTAMPTZ,
            newsletter_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
            accept_terms_at TIMESTAMPTZ,
            accept_privacy_at TIMESTAMPTZ,
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            last_login_at TIMESTAMPTZ,
            cancelled_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        INSERT INTO members (
            id, email, password_hash, vorname, nachname, phone, rolle, status,
            civicrm_contact_id, last_login_at, created_at, updated_at
        )
        SELECT
            gen_random_uuid(),
            LOWER(email),
            password_hash,
            COALESCE(first_name, ''),
            COALESCE(last_name, ''),
            phone,
            role,
            CASE WHEN is_active THEN 'Active' ELSE 'inactive' END,
            civicrm_contact_id,
            last_login,
            created_at,
            COALESCE(updated_at, NOW())
        FROM users
        WHERE NOT EXISTS (
            SELECT 1 FROM members m WHERE LOWER(m.email) = LOWER(users.email)
        );
        """
    )
    op.execute("ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS email TEXT;")
    op.execute("ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token TEXT;")
    op.execute("ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_password_reset_tokens_token ON password_reset_tokens(token);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_members_email ON members(email);")
    op.execute("ALTER TABLE donations ALTER COLUMN civicrm_contact_id DROP NOT NULL;")
    op.execute("ALTER TABLE payment_intents ALTER COLUMN civicrm_contact_id DROP NOT NULL;")
    op.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;")
    op.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;")
    op.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS two_factor_pending_secret TEXT;")
    op.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb;")
    op.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS two_factor_confirmed_at TIMESTAMPTZ;")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS member_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
            refresh_token_hash TEXT NOT NULL,
            device_info TEXT,
            ip_hash TEXT,
            user_agent_hash TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            revoked_at TIMESTAMPTZ
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_member_sessions_member_id ON member_sessions(member_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_member_sessions_revoked_at ON member_sessions(revoked_at);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS consent_records (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID REFERENCES members(id) ON DELETE SET NULL,
            email TEXT,
            consent_type TEXT NOT NULL,
            version TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'granted',
            source TEXT NOT NULL,
            legal_basis TEXT NOT NULL DEFAULT 'consent',
            ip_hash TEXT,
            user_agent_hash TEXT,
            evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
            revoked_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_consent_records_member ON consent_records(member_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_consent_records_email ON consent_records(email);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            status TEXT NOT NULL DEFAULT 'pending_confirmation',
            confirmation_token TEXT,
            confirmed_at TIMESTAMPTZ,
            unsubscribed_at TIMESTAMPTZ,
            source TEXT NOT NULL DEFAULT 'website_newsletter',
            civicrm_contact_id INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_newsletter_confirmation_token ON newsletter_subscriptions(confirmation_token);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            city TEXT,
            postal_code TEXT,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'website_contact',
            civicrm_contact_id INTEGER,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS webhook_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider TEXT NOT NULL,
            provider_event_id TEXT NOT NULL,
            payload_hash TEXT NOT NULL,
            signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            processing_status TEXT NOT NULL DEFAULT 'received',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(provider, provider_event_id)
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS outbox_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT NOT NULL,
            aggregate_type TEXT NOT NULL,
            aggregate_id TEXT NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            next_retry_at TIMESTAMPTZ,
            last_error TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            processed_at TIMESTAMPTZ
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS data_export_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'pending',
            reason TEXT,
            requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            completed_at TIMESTAMPTZ,
            download_url TEXT,
            expires_at TIMESTAMPTZ
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS data_deletion_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'pending',
            scope TEXT NOT NULL DEFAULT 'full',
            reason TEXT NOT NULL,
            requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            processed_at TIMESTAMPTZ,
            processed_by TEXT,
            comments TEXT
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS integration_failures (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            integration TEXT NOT NULL,
            operation TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            status TEXT NOT NULL DEFAULT 'open',
            error_message TEXT NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            resolved_at TIMESTAMPTZ
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_trail (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            actor_id TEXT,
            path TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            request_id TEXT NOT NULL,
            consent_flag BOOLEAN NOT NULL DEFAULT false,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ,
            audit_actor TEXT NOT NULL DEFAULT 'system'
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            amount_cents INTEGER NOT NULL,
            booked_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT,
            payer_type TEXT NOT NULL DEFAULT 'member',
            is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS expenses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            amount_cents INTEGER NOT NULL,
            booked_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT,
            project TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            budget_cents INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            titel TEXT NOT NULL,
            beschreibung TEXT NOT NULL,
            ort TEXT,
            start_datum TIMESTAMPTZ NOT NULL,
            end_datum TIMESTAMPTZ,
            max_teilnehmer INTEGER,
            kategorie TEXT DEFAULT 'Allgemein',
            ist_oeffentlich BOOLEAN DEFAULT TRUE,
            ersteller_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS event_rsvps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID REFERENCES events(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            status TEXT DEFAULT 'angemeldet',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(event_id, user_id)
        );
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS event_rsvps;")
    op.execute("DROP TABLE IF EXISTS events;")
    op.execute("DROP TABLE IF EXISTS projects;")
    op.execute("DROP TABLE IF EXISTS expenses;")
    op.execute("DROP TABLE IF EXISTS payments;")
    op.execute("DROP TABLE IF EXISTS audit_trail;")
    op.execute("DROP TABLE IF EXISTS integration_failures;")
    op.execute("DROP TABLE IF EXISTS data_deletion_requests;")
    op.execute("DROP TABLE IF EXISTS data_export_requests;")
    op.execute("DROP TABLE IF EXISTS outbox_events;")
    op.execute("DROP TABLE IF EXISTS webhook_events;")
    op.execute("DROP TABLE IF EXISTS contact_submissions;")
    op.execute("DROP TABLE IF EXISTS newsletter_subscriptions;")
    op.execute("DROP TABLE IF EXISTS consent_records;")
    op.execute("DROP TABLE IF EXISTS member_sessions;")
    op.execute("DROP TABLE IF EXISTS members;")

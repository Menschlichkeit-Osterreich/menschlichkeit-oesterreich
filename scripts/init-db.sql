-- ============================================================
-- Menschlichkeit Österreich – PostgreSQL Initialisierung
-- Wird beim ersten Start des Docker-Containers ausgeführt.
-- Idempotent: alle Statements nutzen IF NOT EXISTS.
-- ============================================================

-- Erweiterungen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Mitglieder ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    vorname TEXT NOT NULL,
    nachname TEXT NOT NULL,
    mitgliedschaft_typ TEXT NOT NULL DEFAULT 'ordentlich',
    status TEXT NOT NULL DEFAULT 'aktiv',
    rolle TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Blog ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titel TEXT NOT NULL,
    inhalt TEXT NOT NULL,
    autor_id UUID REFERENCES members(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'entwurf',
    erstellt_am TIMESTAMPTZ DEFAULT now(),
    aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

-- ── Veranstaltungen ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titel TEXT NOT NULL,
    beschreibung TEXT,
    datum TIMESTAMPTZ NOT NULL,
    ort TEXT,
    max_teilnehmer INTEGER,
    status TEXT NOT NULL DEFAULT 'geplant',
    erstellt_von UUID REFERENCES members(id) ON DELETE SET NULL,
    erstellt_am TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'angemeldet',
    angemeldet_am TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, member_id)
);

-- ── Forum ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    beschreibung TEXT,
    erstellt_am TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titel TEXT NOT NULL,
    kategorie_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'offen',
    erstellt_am TIMESTAMPTZ DEFAULT now(),
    aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    inhalt TEXT NOT NULL,
    autor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    erstellt_am TIMESTAMPTZ DEFAULT now()
);

-- ── Finanzen ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    betrag_cents INTEGER NOT NULL,
    waehrung TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'offen',
    zahlungsart TEXT,
    payer_type TEXT NOT NULL DEFAULT 'member',
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    erstellt_am TIMESTAMPTZ DEFAULT now(),
    bezahlt_am TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    betrag_cents INTEGER NOT NULL,
    beschreibung TEXT NOT NULL,
    kategorie TEXT,
    kostenstelle TEXT,
    erstellt_am TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    betrag_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'offen',
    faellig_am TIMESTAMPTZ,
    erstellt_am TIMESTAMPTZ DEFAULT now(),
    bezahlt_am TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    budget_cents INTEGER NOT NULL DEFAULT 0,
    ausgaben_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'aktiv',
    erstellt_am TIMESTAMPTZ DEFAULT now()
);

-- ── Audit-Log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indizes (Performance) ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_kategorie ON forum_threads(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);

-- ── Standard-Daten ───────────────────────────────────────────
INSERT INTO forum_categories (name, beschreibung) VALUES
    ('Allgemein', 'Allgemeine Diskussionen'),
    ('Ankündigungen', 'Offizielle Vereinsankündigungen'),
    ('Projekte', 'Laufende und geplante Projekte')
ON CONFLICT (name) DO NOTHING;

#!/usr/bin/env python3
"""
Seed-Script: Test-Benutzer für alle Rollen anlegen.

Verwendung:
  # Lokal (Docker Postgres):
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/moe_dev" python scripts/seed-test-users.py

  # Gegen Plesk DB (via SSH-Tunnel):
  ssh -L 5433:localhost:5432 peter_schuller@5.183.217.146
  DATABASE_URL="postgresql://moe_user:PASS@localhost:5433/moe_db" python scripts/seed-test-users.py

  # Dry-run (nur Ausgabe, keine DB-Änderungen):
  python scripts/seed-test-users.py --dry-run

WARNUNG: Nur für Entwicklungs- und Testumgebungen!
         In Produktion Passwörter sofort nach dem Test ändern oder Accounts deaktivieren.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import os
import sys
import uuid
from typing import NamedTuple

# ── Test-Benutzer-Definitionen ────────────────────────────────────────────────
# Rollen: guest(0) < member(1) < moderator(2) < admin(3) < sysadmin(4)

class TestUser(NamedTuple):
    email: str
    password: str
    vorname: str
    nachname: str
    rolle: str          # guest | member | moderator | admin | sysadmin
    mitgliedschaft_typ: str  # Basiswert | Förderer | Aktiv | Ehrenmitglied

TEST_USERS: list[TestUser] = [
    TestUser(
        email="sysadmin@test.menschlichkeit-oesterreich.at",
        password="SysAdmin#Test2024!",
        vorname="System",
        nachname="Administrator",
        rolle="sysadmin",
        mitgliedschaft_typ="Aktiv",
    ),
    TestUser(
        email="admin@test.menschlichkeit-oesterreich.at",
        password="Admin#Test2024!",
        vorname="Maria",
        nachname="Mustermann",
        rolle="admin",
        mitgliedschaft_typ="Aktiv",
    ),
    TestUser(
        email="moderator@test.menschlichkeit-oesterreich.at",
        password="Moderator#Test2024!",
        vorname="Thomas",
        nachname="Muster",
        rolle="moderator",
        mitgliedschaft_typ="Aktiv",
    ),
    TestUser(
        email="member@test.menschlichkeit-oesterreich.at",
        password="Member#Test2024!",
        vorname="Anna",
        nachname="Beispiel",
        rolle="member",
        mitgliedschaft_typ="Basiswert",
    ),
    TestUser(
        email="foerderer@test.menschlichkeit-oesterreich.at",
        password="Foerderer#Test2024!",
        vorname="Karl",
        nachname="Förster",
        rolle="member",
        mitgliedschaft_typ="Förderer",
    ),
    TestUser(
        email="ehrenmitglied@test.menschlichkeit-oesterreich.at",
        password="Ehren#Test2024!",
        vorname="Elisabeth",
        nachname="Ehrlich",
        rolle="member",
        mitgliedschaft_typ="Ehrenmitglied",
    ),
    TestUser(
        email="guest@test.menschlichkeit-oesterreich.at",
        password="Guest#Test2024!",
        vorname="Gast",
        nachname="Besucher",
        rolle="guest",
        mitgliedschaft_typ="Basiswert",
    ),
]


# ── Passwort-Hashing (identisch zu apps/api/app/rbac.py) ─────────────────────

def _hash_password(password: str) -> str:
    """PBKDF2-SHA256, 100.000 Iterationen — identisch zur API-Implementierung."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return f"{salt.hex()}:{key.hex()}"


# ── Datenbank-Operationen ─────────────────────────────────────────────────────

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS members (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email             TEXT        UNIQUE NOT NULL,
    password_hash     TEXT        NOT NULL,
    vorname           TEXT        NOT NULL DEFAULT '',
    nachname          TEXT        NOT NULL DEFAULT '',
    rolle             TEXT        NOT NULL DEFAULT 'member',
    mitgliedschaft_typ TEXT       NOT NULL DEFAULT 'Basiswert',
    status            TEXT        NOT NULL DEFAULT 'Active',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

UPSERT_SQL = """
INSERT INTO members (id, email, password_hash, vorname, nachname, rolle, mitgliedschaft_typ, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
ON CONFLICT (email) DO UPDATE SET
    password_hash     = EXCLUDED.password_hash,
    vorname           = EXCLUDED.vorname,
    nachname          = EXCLUDED.nachname,
    rolle             = EXCLUDED.rolle,
    mitgliedschaft_typ = EXCLUDED.mitgliedschaft_typ,
    status            = 'Active',
    updated_at        = NOW();
"""


async def seed(database_url: str, dry_run: bool = False) -> None:
    try:
        import asyncpg  # type: ignore
    except ImportError:
        print("FEHLER: asyncpg nicht installiert. Bitte: pip install asyncpg", file=sys.stderr)
        sys.exit(1)

    print(f"{'[DRY-RUN] ' if dry_run else ''}Verbinde zu: {database_url[:30]}...\n")

    if not dry_run:
        conn = await asyncpg.connect(database_url)
        await conn.execute(CREATE_TABLE_SQL)

    print(f"{'Email':<55} {'Rolle':<12} {'Mitgliedschaft':<15} {'Passwort'}")
    print("-" * 110)

    for user in TEST_USERS:
        pw_hash = _hash_password(user.password)
        member_id = str(uuid.uuid4())

        print(f"{user.email:<55} {user.rolle:<12} {user.mitgliedschaft_typ:<15} {user.password}")

        if not dry_run:
            await conn.execute(
                UPSERT_SQL,
                member_id, user.email, pw_hash,
                user.vorname, user.nachname,
                user.rolle, user.mitgliedschaft_typ,
            )

    if not dry_run:
        await conn.close()

    print(f"\n{'[DRY-RUN] ' if dry_run else ''}{'Würde' if dry_run else ''} {len(TEST_USERS)} Test-User angelegt/aktualisiert.")

    if dry_run:
        print("\nHinweis: Kein --dry-run → Führe ohne Flag aus um Daten zu schreiben.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Test-Benutzer für alle Rollen")
    parser.add_argument("--dry-run", action="store_true", help="Nur ausgeben, nicht schreiben")
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("FEHLER: DATABASE_URL Umgebungsvariable nicht gesetzt.", file=sys.stderr)
        print("Beispiel: DATABASE_URL=postgresql://user:pass@host:5432/db python scripts/seed-test-users.py")
        sys.exit(1)

    asyncio.run(seed(database_url, dry_run=args.dry_run))


if __name__ == "__main__":
    main()

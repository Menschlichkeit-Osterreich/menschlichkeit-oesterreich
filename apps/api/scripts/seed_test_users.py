#!/usr/bin/env python3
"""
Seed-Script: Testbenutzer für alle Rollen anlegen.

Legt reproduzierbare Testbenutzer für Dashboard- und Login-Tests an.
Bestehende Benutzer werden aktualisiert (upsert), nicht dupliziert.

Verwendung:
    cd apps/api
    DATABASE_URL=postgresql://... JWT_SECRET_KEY=... python scripts/seed_test_users.py

Oder mit .env-Datei:
    python -m dotenv -f ../../.env.test run -- python scripts/seed_test_users.py
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import logging
import os
import sys
from pathlib import Path

# .env.test automatisch laden falls vorhanden
env_test = Path(__file__).parents[3] / ".env.test"
if env_test.exists():
    for line in env_test.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

import asyncpg

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("seed")

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    log.error("DATABASE_URL nicht gesetzt.")
    sys.exit(1)


def hash_password(password: str) -> str:
    """Identisch mit apps/api/app/rbac.py hash_password() — deterministisch via festen Salt."""
    # Fester Salt für Testbenutzer (reproduzierbar, NICHT für Produktion)
    salt = bytes.fromhex("74657374736c74303030303030303030")  # "testslt0000000000" in hex
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"


# ── Testbenutzer ──────────────────────────────────────────────────────────────
# Credentials auch in .env.test und docs/test-credentials.md dokumentiert.
TEST_USERS = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "test-sysadmin@menschlichkeit-oesterreich.at",
        "password": "TestSysAdmin2025!",
        "vorname": "System",
        "nachname": "Admin",
        "rolle": "sysadmin",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "email": "test-admin@menschlichkeit-oesterreich.at",
        "password": "TestAdmin2025!",
        "vorname": "Test",
        "nachname": "Admin",
        "rolle": "admin",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000003",
        "email": "test-vorstand@menschlichkeit-oesterreich.at",
        "password": "TestVorstand2025!",
        "vorname": "Test",
        "nachname": "Vorstand",
        "rolle": "moderator",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000004",
        "email": "test-moderator@menschlichkeit-oesterreich.at",
        "password": "TestModerator2025!",
        "vorname": "Test",
        "nachname": "Moderator",
        "rolle": "moderator",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000005",
        "email": "test-mitglied@menschlichkeit-oesterreich.at",
        "password": "TestMitglied2025!",
        "vorname": "Test",
        "nachname": "Mitglied",
        "rolle": "member",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000006",
        "email": "test-foerdermitglied@menschlichkeit-oesterreich.at",
        "password": "TestFoerder2025!",
        "vorname": "Test",
        "nachname": "Fördermitglied",
        "rolle": "member",
        "mitgliedschaft_typ": "fördernd",
        "status": "Active",
    },
    {
        "id": "00000000-0000-0000-0000-000000000007",
        "email": "test-inaktiv@menschlichkeit-oesterreich.at",
        "password": "TestInaktiv2025!",
        "vorname": "Test",
        "nachname": "Inaktiv",
        "rolle": "member",
        "mitgliedschaft_typ": "ordentlich",
        "status": "Inactive",
    },
]


async def main() -> None:
    log.info("Verbinde mit Datenbank …")
    conn = await asyncpg.connect(DATABASE_URL)

    # Tabelle sicherstellen
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            vorname TEXT NOT NULL DEFAULT '',
            nachname TEXT NOT NULL DEFAULT '',
            rolle TEXT NOT NULL DEFAULT 'member',
            mitgliedschaft_typ TEXT NOT NULL DEFAULT 'ordentlich',
            status TEXT NOT NULL DEFAULT 'Active',
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            cancelled_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)

    for user in TEST_USERS:
        pw_hash = hash_password(user["password"])
        await conn.execute("""
            INSERT INTO members (id, email, password_hash, vorname, nachname, rolle, mitgliedschaft_typ, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                vorname       = EXCLUDED.vorname,
                nachname      = EXCLUDED.nachname,
                rolle         = EXCLUDED.rolle,
                mitgliedschaft_typ = EXCLUDED.mitgliedschaft_typ,
                status        = EXCLUDED.status,
                updated_at    = NOW()
        """,
            user["id"], user["email"], pw_hash,
            user["vorname"], user["nachname"],
            user["rolle"], user["mitgliedschaft_typ"], user["status"],
        )
        log.info(f"  ✓ {user['rolle']:12s}  {user['email']}")

    await conn.close()
    log.info(f"\n{len(TEST_USERS)} Testbenutzer angelegt / aktualisiert.")
    log.info("Credentials: siehe .env.test und docs/test-credentials.md")


if __name__ == "__main__":
    asyncio.run(main())

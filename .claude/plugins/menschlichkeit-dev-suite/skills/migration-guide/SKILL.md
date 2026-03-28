---
name: migration-guide
description: 'Entscheidet den korrekten Datenbank-Migrationspfad: Alembic (Finance-Schema) vs. CREATE TABLE IF NOT EXISTS (einfache Tabellen) und validiert die Migration'
argument-hint: '<tabellen-name-oder-aenderung>'
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Migration Guide — Datenbank-Aenderungen

## Zweck

Das MOe-Projekt nutzt ZWEI Migrationssysteme parallel. Dieses Skill hilft, den richtigen Pfad fuer eine Aenderung zu waehlen.

## Zwei Migrationssysteme

### System A: Alembic (Finance-Schema)

- **Pfad:** `apps/api/alembic/`
- **Fuer:** Finanz-Tabellen (invoices, payments, subscriptions, donations)
- **Versioniert:** Ja (Alembic Revisions)
- **Rollback:** Ja (`alembic downgrade`)
- **Wann verwenden:**
  - Aenderungen an bestehenden Finance-Tabellen
  - Neue Tabellen im Finance-Bereich
  - Schema-Aenderungen die koordiniert deployed werden muessen

### System B: CREATE TABLE IF NOT EXISTS (Router-Startup)

- **Pfad:** Direkt in `apps/api/app/routers/*.py` oder `apps/api/app/db.py`
- **Fuer:** Einfache Tabellen (forum_posts, events, blog_posts, queue_items)
- **Versioniert:** Nein (idempotent)
- **Rollback:** Manuell (DROP TABLE)
- **Wann verwenden:**
  - Neue einfache Tabellen ohne komplexe Relationen
  - Prototyping-Phase
  - Tabellen die keine Migration benoetigen (append-only)

## Entscheidungsbaum

```
Neue Tabelle oder Aenderung?
├── Finance-bezogen? (Zahlungen, Rechnungen, Spenden, SEPA)
│   └── JA → Alembic Migration
│       Befehl: cd apps/api && alembic revision --autogenerate -m "..."
│                alembic upgrade head
│
├── Aenderung an bestehender Tabelle?
│   ├── Finance-Tabelle → Alembic
│   └── Andere Tabelle → Alembic empfohlen, System B akzeptabel
│
└── Neue einfache Tabelle? (keine FK zu Finance)
    └── System B (CREATE TABLE IF NOT EXISTS)
        Ort: apps/api/app/db.py oder relevanter Router
```

## Validierung nach Migration

```bash
# Alembic: Pruefe ob Migration sauber laeuft
cd apps/api && alembic upgrade head && alembic check

# System B: Pruefe ob Tabelle existiert
python3 -c "
import asyncpg, asyncio
async def check():
    conn = await asyncpg.connect('postgresql://...')
    tables = await conn.fetch(\"SELECT tablename FROM pg_tables WHERE schemaname='public'\")
    print([t['tablename'] for t in tables])
asyncio.run(check())
"
```

## Haeufige Fehler

1. **Finance-Tabelle mit System B erstellt** → Migration-Chaos, kein Rollback
2. **Alembic und System B fuer dieselbe Tabelle** → Konflikte bei `upgrade head`
3. **Fehlende `IF NOT EXISTS`** bei System B → Fehler bei Neustart
4. **Alembic Migration nicht committed** → Andere Entwickler sehen sie nicht

## Empfehlung

Langfristig sollte ALLES ueber Alembic laufen. System B ist technische Schuld und sollte in Phase 4 des Roadmap migriert werden.

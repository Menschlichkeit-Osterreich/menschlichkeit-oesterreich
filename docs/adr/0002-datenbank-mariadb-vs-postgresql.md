# ADR 0002 – Datenbankstrategie: MariaDB vs. PostgreSQL

Datum: 2026-03-11
Status: Accepted

## Kontext

Der Infrastruktur-Audit 2026-03 (P1-5) hat einen Widerspruch in der Datenbankarchitektur aufgedeckt:

- Das **Plesk-Hosting** und **Drupal/CiviCRM (CRM)** verwenden **MariaDB** (produktiver Betrieb seit Beginn).
- Die **FastAPI** (`apps/api/`) nutzt **Alembic**-Migrationen und `asyncpg` – beides ausschließlich PostgreSQL-kompatibel.
- Das **Prisma-Schema** (`schema.prisma`, Games-Plattform) wurde gegen PostgreSQL entwickelt.
- `DATABASE_URL` in den Beispiel-Configs zeigt auf PostgreSQL (`postgresql://`).
- Keine laufende PostgreSQL-Instanz ist auf dem Produktivserver dokumentiert.

Es bestand Unklarheit: Welche Datenbank ist die tatsächliche, welche die angestrebte?

## Entscheidung

**Kurzfristig (bis Q2 2026):** MariaDB bleibt die produktive Datenbankinstanz für Drupal/CiviCRM. FastAPI und Games laufen im Entwicklungs- und Staging-Betrieb gegen **PostgreSQL 15+** (Docker), da asyncpg und Alembic keine sinnvolle MariaDB-Unterstützung bieten.

**Mittelfristig (Q3 2026):** Vollständige Migration aller Services auf **PostgreSQL 15+**:
- CiviCRM auf PostgreSQL portieren (offizielle Unterstützung seit 5.x vorhanden).
- MariaDB wird nach erfolgter Migration abgeschaltet.
- Eine gemeinsame `DATABASE_URL` für alle Services.

**Langfristig:** Eine einzige PostgreSQL-Instanz mit service-isolierten Datenbanken (Least Privilege, ADR noch ausstehend).

## Begründung

| Kriterium | MariaDB | PostgreSQL |
|-----------|---------|------------|
| asyncpg-Kompatibilität | ❌ Nein | ✅ Ja |
| Alembic-Support | ⚠️ Limitiert | ✅ Vollständig |
| Prisma-Support | ✅ Ja | ✅ Ja |
| CiviCRM-Support | ✅ Primär | ✅ Seit v5.x |
| JSONB / Arrays | ❌ Nein | ✅ Nativ |
| DSGVO-Archivierung | ⚠️ Partial | ✅ Row-Level Security |
| Hosting (Plesk) | ✅ Inkludiert | ⚠️ Separater Container |

PostgreSQL ist die strategisch richtige Wahl für alle neu entwickelten Komponenten. Die Koexistenz ist ein akzeptabler Übergangszustand.

## Alternativen

- **Nur MariaDB:** Erfordert Neuschreiben von asyncpg-Datenbankschicht mit aiomysql/SQLAlchemy. Zu hoher Aufwand, verliert PostgreSQL-Features (JSONB, Window Functions).
- **SQLite für Tests:** Verworfen – Produktions-Parität zu niedrig.

## Konsequenzen

- Alembic-Migrationen werden **ausschließlich gegen PostgreSQL** entwickelt und getestet.
- CI-Umgebung startet PostgreSQL via `services:` (GitHub Actions).
- MariaDB-Datenbankstruktur für CRM bleibt unberührt und wird durch eigene Drupal-Migrations verwaltet.
- `.env.example` Dateien müssen `DATABASE_URL` klar als PostgreSQL-URL dokumentieren.

## Follow-Ups

- [ ] ADR-003: Service-isolierte Datenbanken + Least-Privilege-User (P2-4)
- [ ] Alembic-Migrationen in CI gegen PostgreSQL-Service testen (`api-tests.yml` erweitern)
- [ ] CiviCRM PostgreSQL-Migrations-Plan erstellen (Q3 2026)
- [ ] MariaDB-Backup-User + Backup-Script deployen (P2-3, unabhängig vom Migrationspfad)

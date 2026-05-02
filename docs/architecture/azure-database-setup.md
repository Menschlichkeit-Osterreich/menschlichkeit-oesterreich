# Azure PostgreSQL Setup für OpenClaw

> Legacy-Hinweis: OpenClaw/OpenWolf ist nicht mehr aktiver Repository-Scope. Diese Seite bleibt nur als historische Dokumentation erhalten und ist nicht mehr operational verbindlich.

**Status:** Vorbereitet (Provisioning ausstehend)
**Erstellt:** 2026-04-03
**Betrifft:** `openclaw-system/` — Audit, State, Agent-Memory

---

## Hintergrund: Warum Azure?

Der Plesk-Produktionsserver (Shared Hosting) unterliegt einem harten Datenbankverbindungslimit.
OpenClaw benötigt als Multi-Agent-System persistente, parallele PostgreSQL-Verbindungen für:

- **Audit-Log:** Jede Agent-Aktion wird mit Timestamp, Tool-Call und Ergebnis persistiert
- **Agent-State:** Laufende Tasks, Checkpoint-Daten, Resume-Informationen
- **Agent-Memory:** Vektorisierte Embeddings (über Qdrant) + relationale Metadaten

Diese Nutzung ist mit dem Plesk-DB-Limit strukturell inkompatibel. Azure PostgreSQL
Flexible Server bietet dedizierten, skalierbaren PostgreSQL-Betrieb ohne Verbindungslimits
des Host-Anbieters.

---

## Azure-Service-Auswahl

| Parameter   | Wert                                            | Begründung                                                                 |
| ----------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| **Service** | Azure Database for PostgreSQL — Flexible Server | Vollständige PostgreSQL 16-Kompatibilität, keine Managed-Overhead-Gebühren |
| **Tier**    | Burstable B1ms (1 vCore, 2 GB RAM)              | Ausreichend für < 4 parallele OpenClaw-Agenten; skalierbar bei Bedarf      |
| **Storage** | 32 GB (minimum, auto-grow aktiv)                | Agent-Memory und Audit-Log wachsen graduell                                |
| **Backup**  | 7 Tage geo-redundant                            | DSGVO-konforme Wiederherstellbarkeit                                       |
| **SSL**     | `require` (erzwungen)                           | Kein Plaintext-Traffic möglich                                             |
| **Region**  | West Europe (Amsterdam)                         | DSGVO-konforme EU-Datenhaltung, geringe Latenz zu Plesk AT                 |

---

## Non-Profit-Konditionen

MÖ ist für das **Azure for Nonprofits**-Programm qualifiziert:

- **Microsoft for Nonprofits:** Bis zu **$3.500/Jahr** Azure-Credits (Eligible Nonprofits)
- Antrag: <https://nonprofit.microsoft.com/en-us/getting-started>
- Voraussetzung: Bestätigte gemeinnützige Registrierung (österreichischer Vereinsstatus)

**Kostenschätzung ohne Credits:**

| Ressource            | Monatlich (ca.) |
| -------------------- | --------------- |
| Flexible Server B1ms | ~€ 14           |
| Storage 32 GB        | ~€ 3            |
| Backup (LRS 7 Tage)  | ~€ 1            |
| **Gesamt**           | **~€ 18/Monat** |

Mit Azure-Credits: **€ 0 für die ersten ~16 Monate** (bei B1ms-Tier).

---

## Datenhaltung

Folgende Daten liegen ausschliesslich in der Azure-DB (`mo_openclaw`):

| Tabelle / Schema      | Inhalt                                      | Sensitivität      |
| --------------------- | ------------------------------------------- | ----------------- |
| `audit.events`        | Agent-Aktionen, Tool-Calls, Ergebnisse      | Intern (kein PII) |
| `state.tasks`         | Laufende und abgeschlossene Agent-Tasks     | Intern            |
| `state.checkpoints`   | Resume-Daten für unterbrochene Tasks        | Intern            |
| `memory.vectors_meta` | Metadaten zu Qdrant-Embeddings              | Intern            |
| `memory.context`      | Abgeleitete Kontext-Snippets (kein Rohtext) | Intern            |

**Kein PII in der Azure-DB.** Personenbezogene Daten (Mitglieder, Spender) verbleiben
ausschliesslich auf dem Plesk-Server (CiviCRM/MariaDB).

---

## Verbindungskonfiguration

### Umgebungsvariablen

```env
# Einzelvariablen (für Anwendungen mit eigenem Connection-Pool)
AZURE_PG_HOST=<name>.postgres.database.azure.com
AZURE_PG_PORT=5432
AZURE_PG_DATABASE=mo_openclaw
AZURE_PG_USER=mo_admin
AZURE_PG_PASSWORD=<via BSM: azure/AZURE_PG_PASSWORD>
AZURE_PG_SSL_MODE=require

# Connection String (für OpenClaw OC_PG_DSN)
OC_PG_DSN=postgresql://mo_admin:<PASSWORD>@<HOST>.postgres.database.azure.com:5432/mo_openclaw?sslmode=require
```

Vollständige Vorlage: [`config-templates/azure-postgres.env.example`](../../config-templates/azure-postgres.env.example)

### Secrets-Management

Passwort und API-Keys werden über Bitwarden Secrets Manager verwaltet:

| BSM-Key                   | Env-Var             | Service  |
| ------------------------- | ------------------- | -------- |
| `azure/AZURE_PG_PASSWORD` | `AZURE_PG_PASSWORD` | openclaw |
| `azure/QDRANT_API_KEY`    | `QDRANT_API_KEY`    | openclaw |

Konfiguriert in: [`secrets.manifest.json`](../../secrets.manifest.json)

### Qdrant Cloud (Vector DB)

Qdrant Cloud ergänzt PostgreSQL für Embedding-Suche:

```env
QDRANT_URL=<cluster-id>.qdrant.io
QDRANT_API_KEY=<via BSM: azure/QDRANT_API_KEY>
QDRANT_COLLECTION=mo_embeddings
```

Qdrant Cloud Free Tier: 1 GB Storage, 1 Collection — ausreichend für den Einstieg.

---

## Migration: Von lokaler Dev-DB zu Azure

### Schritt 1 — Azure Flexible Server anlegen

```bash
# Azure CLI (einmalig)
az postgres flexible-server create \
  --name mo-openclaw \
  --resource-group menschlichkeit-osterreich \
  --location westeurope \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --version 16 \
  --admin-user mo_admin \
  --admin-password "<sicheres-passwort>" \
  --public-access None
```

### Schritt 2 — Firewall-Regel für GitHub Actions / Plesk

```bash
# GitHub Actions IP-Range (variabel — besser VNet-Integration oder Service Endpoint)
az postgres flexible-server firewall-rule create \
  --resource-group menschlichkeit-osterreich \
  --name mo-openclaw \
  --rule-name allow-cicd \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
# Hinweis: 0.0.0.0 erlaubt alle Azure-IPs. Fuer Production VNet-Integration bevorzugen.
```

### Schritt 3 — Datenbank und Schema anlegen

```sql
-- Als mo_admin verbinden
CREATE DATABASE mo_openclaw;
\c mo_openclaw

CREATE SCHEMA audit;
CREATE SCHEMA state;
CREATE SCHEMA memory;

-- Minimale Extension fuer UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Schritt 4 — Secrets in Bitwarden Secrets Manager eintragen

```bash
# BSM CLI (bws)
bws secret create azure/AZURE_PG_PASSWORD "<passwort>" --project-id moe-production
bws secret create azure/QDRANT_API_KEY "<api-key>" --project-id moe-production
```

### Schritt 5 — OpenClaw OC_PG_DSN aktualisieren

In BSM: `openclaw/OC_PG_DSN` auf den Azure Connection String setzen:

```
postgresql://mo_admin:<PASSWORD>@mo-openclaw.postgres.database.azure.com:5432/mo_openclaw?sslmode=require
```

### Schritt 6 — Lokale Dev-Verbindung testen

```bash
psql "postgresql://mo_admin:<PASSWORD>@mo-openclaw.postgres.database.azure.com:5432/mo_openclaw?sslmode=require"
```

---

## Verwandte Dateien

- `config-templates/azure-postgres.env.example` — Konfigurationsvorlage
- `secrets.manifest.json` — BSM-Secret-Definitionen (`azure/AZURE_PG_PASSWORD`, `azure/QDRANT_API_KEY`)
- `openclaw-system/` — Konsument dieser Datenbank
- `docs/architecture/system-overview.md` — Systemübersicht
- `docs/architecture/plattform-audit-2026.md` — Infrastruktur-Audit mit Plesk-Limitierung

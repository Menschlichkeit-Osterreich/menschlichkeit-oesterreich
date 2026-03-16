# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Menschlichkeit Österreich is a multi-service NGO platform for democratic participation and community engagement in Austria. **Security > Datenintegrität > Stabilität > Velocity.** All UI text must be in Österreichisches Deutsch (Austrian German).

## Services & Ports

| Service | Location | Tech | Port |
|---------|----------|------|------|
| Frontend | `apps/website/` | React 18 + TS + Vite | 5173 |
| API | `apps/api/` (neu) · `api.menschlichkeit-oesterreich.at/` (legacy) | FastAPI (Python 3.12+) | 8001 |
| CRM | `apps/crm/` | Drupal 10 + CiviCRM (PHP 8.1) | 8000 |
| Games | `apps/game/` · `web/` | Static + Prisma schema | 3000 |
| n8n Automation | `automation/n8n/` | Docker | 5678 |
| OpenClaw Tool-Gateway | `openclaw-system/api/fastapi_gateway/` | FastAPI | 9101 |
| OpenClaw Agent-Runtime | `openclaw-system/core/agent_runtime/` | Python asyncio | 9100 |
| Windows-Bridge | `openclaw-system/windows-bridge/` | PowerShell/Node | 18790 |
| PostgreSQL (Haupt-DB) | Docker | PostgreSQL ≥15 | 5432 |
| PostgreSQL (OpenClaw) | Docker | PostgreSQL ≥15 | 55432 |
| Redis (OpenClaw) | Docker | Redis | 6380 |
| Qdrant (OpenClaw) | Docker | Qdrant Vektordatenbank | 6333 |
| NATS JetStream | Docker | NATS | 4222 |

## Key Commands

### Setup & Dev

```bash
npm run setup:dev          # Full setup (install + composer + environments)
npm run dev:all            # Start all services concurrently
npm run dev:frontend       # Frontend only (Vite)
npm run dev:api            # API only
npm run dev:crm            # CRM only (php -S localhost:8000)
npm run dev:games          # Games only (python http.server)
npm run docker:up          # Start PostgreSQL + Redis + n8n
```

### Testing

```bash
npm run test:unit                            # Vitest (unit tests)
npm run test:e2e                             # Playwright (e2e tests)
# Python tests (apps/api):
cd apps/api && pytest tests/                 # Alle API-Tests (33 Tests)
pytest tests/test_pii_sanitizer.py          # PII-Sanitizer separat
```

### Linting & Formatting

```bash
npm run lint               # ESLint
npm run lint:all           # JS + PHP + Markdown
npm run format             # Prettier
npm run lint:php           # PHPStan
npm run format:php         # php-cs-fixer
```

### Quality Gates (PR-blocking)

```bash
npm run quality:gates      # All gates: Codacy + Security + Lighthouse + DSGVO + Reports
npm run security:scan      # Trivy + Bandit + Gitleaks
npm run performance:lighthouse
npm run compliance:dsgvo
```

### Database

```bash
npm run docker:up          # Start PostgreSQL/Redis
npx prisma migrate dev     # Prisma migrations (Games)
npx prisma generate        # Regenerate Prisma client
npx prisma studio          # Prisma Studio UI
# Schema-Strategie (zwei Ansätze, je nach Komplexität):
#   Standardfall: CREATE TABLE IF NOT EXISTS direkt in den Router-Startup-Hooks
#   (apps/api/app/routers/) — für einfache, dienst-eigene Tabellen.
#   Finance-Ausnahme: apps/api/alembic/ verwendet Alembic-Migrations für das
#   komplexe Finance-Schema (invoices, invoice_items, payment_intents, donations,
#   sepa_mandates, sepa_batches, dunning_runs) mit FK-Constraints und Indizes.
#   Alembic ausführen: cd apps/api && alembic upgrade head
```

### OpenClaw Multi-Agent System

```bash
bash openclaw-system/scripts/boot.sh    # Start OpenClaw stack
bash openclaw-system/scripts/smoke.sh   # Smoke tests
# Windows Bridge (PowerShell als Admin):
# C:\openclawd-win-bridge\installer\Install-OpenClawBridge.ps1
```

### Build & Deploy

```bash
npm run build:frontend
./build-pipeline.sh staging|production [--skip-tests|--force]
```

## Architecture

### Monorepo Structure

npm workspaces root. Die neue Primärstruktur ist `apps/<name>/`. Das Verzeichnis `api.menschlichkeit-oesterreich.at/` ist die Legacy-Kopie der API (wird synchron gehalten, aber nicht aktiv weiterentwickelt). The `packages/` directory contains shared `design-system` and `ui` packages.

### Shared PostgreSQL Database

Alle Dienste teilen eine PostgreSQL ≥15-Instanz (Port 5432) via `DATABASE_URL`. Das OpenClaw-System nutzt eine separate Instanz (Port 55432, `OC_PG_DSN`). Schema-Änderungen erfolgen standardmäßig via `CREATE TABLE IF NOT EXISTS` direkt in den Router-Startup-Hooks. **Ausnahme:** Das Finance-Schema (`apps/api/alembic/`) nutzt Alembic-Migrations wegen komplexer FK-Constraints — `alembic upgrade head` nach DB-Neuanlage ausführen. Prisma (Games) läuft parallel.

### Design Tokens

Design tokens live in `figma-design-system/00_design-tokens.json`. **Never hardcode colors or spacing** — always use tokens. They are consumed via `apps/website/tailwind.config.cjs` and regenerated with `apps/website/scripts/generate-design-tokens.mjs`. Sync with Figma: `npm run figma:sync`.

### DSGVO/PII Compliance (Kritisch)

- **FastAPI** (`apps/api/` + `api.menschlichkeit-oesterreich.at/`):
  - Middleware: `app/middleware/pii_middleware.py` (PiiSanitizationMiddleware, PiiLoggingMiddleware)
  - Library: `app/lib/pii_sanitizer.py` (PiiSanitizer, scrub, scrub_dict)
  - Beide Kopien müssen synchron gehalten werden bis zur Zusammenführung in `packages/`
- **Drupal**: custom module `apps/crm/web/modules/custom/pii_sanitizer/`
- Regeln: Kein PII in Logs. E-Mail-Maskierung (`t**@example.com`), IBAN-Redaktion (`AT61***`), Luhn-validierte Kreditkartennummern.
- Tests: `cd apps/api && pytest tests/test_pii_sanitizer.py`

### OpenClaw Multi-Agent System (`openclaw-system/`)

Sechs spezialisierte KI-Agenten kommunizieren via NATS JetStream (Port 4222). Alle Tool-Aufrufe laufen ausschließlich über das Tool-Gateway (Policy-Engine + Audit-Log).

**Agenten (korrekte Namen laut `agent_runtime/main.py` und `agent_roles.yaml`):**

| Rolle | Beschreibung | Erlaubte Tools |
|-------|-------------|----------------|
| `orchestrator` | Koordiniert alle Agenten, verwaltet Tasks | nats.publish, redis.*, db.query_readonly |
| `research` | Recherchiert Web und Repository | http.fetch, fs.read, fs.list, qdrant.upsert, db.query_readonly |
| `builder` | Schreibt/modifiziert Code, Git-Commits | fs.*, git.status/diff/show/branch_create/commit/pr_prepare |
| `qa` | Prüft Code-Qualität, führt Tests aus | ci.run_local, fs.read, fs.list, git.diff/status, db.query_readonly |
| `automation` | Triggert n8n-Workflows | n8n.trigger_webhook, n8n.get_status, fs.read/write |
| `monetization` | Analysiert Kosten und Business-KPIs | db.query_readonly, http.fetch (Stripe/PayPal) |

**Implementierte Tools (Tool-Gateway):**
`fs.read`, `fs.list`, `fs.write`, `git.status`, `git.diff`, `git.show`, `git.branch_create`, `git.commit`, `git.pr_prepare`, `http.fetch`, `db.query_readonly`, `db.execute`, `redis.get`, `redis.set`, `nats.publish`, `qdrant.search`, `qdrant.upsert`, `n8n.get_status`, `n8n.trigger_webhook`, `ci.run_local`, `github.create_pr`

**Konfiguration:**
- Rollen-Definitionen: `openclaw-system/configs/agent_roles.yaml`
- Tool-Whitelist pro Rolle: `openclaw-system/configs/capabilities.yaml`
- n8n-Webhook-Whitelist: `openclaw-system/configs/capabilities.yaml` → `webhooks.allowed`
- System-Config: `openclaw-system/configs/system_config.yaml`

**Agent-Budgets und Rate-Limits** (aus `capabilities.yaml`):

| Rolle | Rate-Limit | max_tool_calls | max_minutes | max_cost_EUR |
|-------|-----------|----------------|-------------|-------------|
| orchestrator | 120 rpm | 20 | 15 | 0,20 |
| research | 30 rpm | 20 | 15 | 0,20 |
| builder | 60 rpm | 20 | 15 | 0,20 |
| qa | 30 rpm | 20 | 15 | 0,20 |
| automation | 20 rpm | 20 | 15 | 0,20 |
| monetization | 20 rpm | 20 | 15 | 0,20 |

**Vordefinierte Pipelines** (`openclaw-system/configs/agent_roles.yaml`):
- `content_factory`: Research → Builder → QA → Automation → Monetization
- `devops_assistant`: Research → Builder → QA → Builder (PR-Draft)
- `crm_community_ops`: Research → Automation → Monetization

### Windows-Bridge

Enables communication between Windows apps and OpenClaw running in WSL2/Docker:
`Windows-App → Bridge (port 18790) → WSL2 → Docker → Services`

## Branch & Commit Conventions

**Git Flow**: branch from `develop`, PR back to `develop`, then merge to `main` (protected).

Branch naming: `feature/<issue>-<description>`, `fix/<issue>-<description>`, `docs/<issue>-<description>`

**Conventional Commits** (enforced via commitlint):

```text
feat(scope): description    → minor version bump
fix(scope): description     → patch version bump
docs/test/chore/refactor    → no version bump
```

## OpenAPI & API Contract

Die vollständige OpenAPI-Spezifikation liegt in `apps/api/openapi.yaml` (40+ Endpunkte). Die Legacy-Datei `api.menschlichkeit-oesterreich.at/openapi.yaml` ist veraltet und nicht mehr maßgeblich. Bei neuen Endpunkten immer `apps/api/openapi.yaml` aktualisieren.

## MCP Servers

Project ships its own MCP servers in `mcp-servers/` (file-server). Configuration in `mcp.json`.

## Umgebungsvariablen

Vorlagen für alle Umgebungsvariablen:
- **Root**: `.env.example` (PostgreSQL, Redis, n8n, OpenClaw `OC_*`, JWT, Mail, Stripe)
- **Frontend**: `apps/website/.env.example` (alle `VITE_*` Variablen)
- **Lokal**: `.env` (nie committen – in `.gitignore`)

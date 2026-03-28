# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Menschlichkeit Österreich is a multi-service NGO platform for democratic participation and community engagement in Austria. **Security > Datenintegrität > Stabilität > Velocity.** All UI text must be in Österreichisches Deutsch (Austrian German).

## Services & Ports

| Service                | Location                                                          | Tech                              | Port  |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------- | ----- |
| Frontend               | `apps/website/`                                                   | React 18 + TS + Vite              | 5173  |
| API                    | `apps/api/` (neu) · `api.menschlichkeit-oesterreich.at/` (legacy) | FastAPI (Python 3.12+)            | 8001  |
| CRM                    | `apps/crm/`                                                       | Drupal 10 + CiviCRM (PHP 8.1)     | 8000  |
| Games (Babylon 3D)     | `apps/babylon-game/`                                              | Next.js 16 + Babylon.js 8 + Havok | 3001  |
| n8n Automation         | `automation/n8n/`                                                 | Docker                            | 5678  |
| OpenClaw Tool-Gateway  | `openclaw-system/api/fastapi_gateway/`                            | FastAPI                           | 9101  |
| OpenClaw Agent-Runtime | `openclaw-system/core/agent_runtime/`                             | Python asyncio                    | 9100  |
| Windows-Bridge         | `openclaw-system/windows-bridge/`                                 | PowerShell/Node                   | 18790 |
| PostgreSQL (Haupt-DB)  | Docker                                                            | PostgreSQL ≥15                    | 5432  |
| PostgreSQL (OpenClaw)  | Docker                                                            | PostgreSQL ≥15                    | 55432 |
| Redis (OpenClaw)       | Docker                                                            | Redis                             | 6380  |
| Qdrant (OpenClaw)      | Docker                                                            | Qdrant Vektordatenbank            | 6333  |
| NATS JetStream         | Docker                                                            | NATS                              | 4222  |

## Key Commands

### Setup & Dev

```bash
npm run setup:dev          # Full setup (install + composer + environments)
npm run dev:all            # Start all services concurrently
npm run dev:babylon        # Babylon.js 3D app (Next.js, port 3001)
npm run dev:frontend       # Frontend only (Vite)
npm run dev:api            # API only
npm run dev:crm            # CRM only (php -S localhost:8000)
npm run dev:babylon        # Babylon.js 3D app (Next.js, port 3001)
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

Design tokens live in `figma-design-system/00_design-tokens.json`. **Never hardcode colors or spacing** — always use tokens. They are consumed via `apps/website/tailwind.config.cjs` and regenerated with `apps/website/scripts/generate-design-tokens.mjs`. Do not assume a live Figma integration is available for build, CI or deploy.

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

| Rolle          | Beschreibung                              | Erlaubte Tools                                                     |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `orchestrator` | Koordiniert alle Agenten, verwaltet Tasks | nats.publish, redis.\*, db.query_readonly                          |
| `research`     | Recherchiert Web und Repository           | http.fetch, fs.read, fs.list, qdrant.upsert, db.query_readonly     |
| `builder`      | Schreibt/modifiziert Code, Git-Commits    | fs.\*, git.status/diff/show/branch_create/commit/pr_prepare        |
| `qa`           | Prüft Code-Qualität, führt Tests aus      | ci.run_local, fs.read, fs.list, git.diff/status, db.query_readonly |
| `automation`   | Triggert n8n-Workflows                    | n8n.trigger_webhook, n8n.get_status, fs.read/write                 |
| `monetization` | Analysiert Kosten und Business-KPIs       | db.query_readonly, http.fetch (Stripe/PayPal)                      |

**Implementierte Tools (Tool-Gateway):**
`fs.read`, `fs.list`, `fs.write`, `git.status`, `git.diff`, `git.show`, `git.branch_create`, `git.commit`, `git.pr_prepare`, `http.fetch`, `db.query_readonly`, `db.execute`, `redis.get`, `redis.set`, `nats.publish`, `qdrant.search`, `qdrant.upsert`, `n8n.get_status`, `n8n.trigger_webhook`, `ci.run_local`, `github.create_pr`

**Konfiguration:**

- Rollen-Definitionen: `openclaw-system/configs/agent_roles.yaml`
- Tool-Whitelist pro Rolle: `openclaw-system/configs/capabilities.yaml`
- n8n-Webhook-Whitelist: `openclaw-system/configs/capabilities.yaml` → `webhooks.allowed`
- System-Config: `openclaw-system/configs/system_config.yaml`

**Agent-Budgets und Rate-Limits** (aus `capabilities.yaml`):

| Rolle        | Rate-Limit | max_tool_calls | max_minutes | max_cost_EUR |
| ------------ | ---------- | -------------- | ----------- | ------------ |
| orchestrator | 120 rpm    | 20             | 15          | 0,20         |
| research     | 30 rpm     | 20             | 15          | 0,20         |
| builder      | 60 rpm     | 20             | 15          | 0,20         |
| qa           | 30 rpm     | 20             | 15          | 0,20         |
| automation   | 20 rpm     | 20             | 15          | 0,20         |
| monetization | 20 rpm     | 20             | 15          | 0,20         |

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

Project ships its own MCP servers in `mcp-servers/` (file-server). Configuration in `mcp.json`:

- **file-server** — Multi-Service Dateizugriff (eigener MCP-Server)
- **quality-reporter** — SARIF/JSON Quality Reports lesen und analysieren
- **build-pipeline** — Build-Status und Dry-Run
- **n8n-webhook** — n8n Workflow-Trigger und Status
- **context7** — Live-Dokumentation für Libraries
- **playwright** — Browser-Automation/Testing
- **filesystem**, **memory**, **sequential-thinking** — Standard MCP-Server

## Umgebungsvariablen

Vorlagen für alle Umgebungsvariablen:

- **Root**: `.env.example` (PostgreSQL, Redis, n8n, OpenClaw `OC_*`, JWT, Mail, Stripe)
- **Frontend**: `apps/website/.env.example` (alle `VITE_*` Variablen)
- **Lokal**: `.env` (nie committen – in `.gitignore`)

## Prioritäten

1. **Sicherheit**: OWASP Top 10, keine Secrets in Code/Logs
2. **DSGVO**: PII-Sanitisierung, Datensparsamkeit, Löschrecht
3. **Markenkonformität**: Brand Guidelines v1.0 sind verbindlich (siehe unten)
4. **Stabilität**: Tests, Quality Gates, CI/CD
5. **Velocity**: Schnelle Iteration, aber nie auf Kosten der obigen Punkte

## Skills (`.github/skills/`)

| Skill                     | Beschreibung                             | Aufruf                                  |
| ------------------------- | ---------------------------------------- | --------------------------------------- |
| `deploy-checklist`        | Pre-Deployment Checkliste                | `/deploy-checklist staging\|production` |
| `dsgvo-audit`             | DSGVO/PII-Compliance-Prüfung             | Automatisch (Claude-invocable)          |
| `git-commit`              | Standardisierter Git-Commit-Workflow     | `/git-commit`                           |
| `create-readme`           | README-Generierung                       | `/create-readme`                        |
| `create-specification`    | Technische Spezifikation                 | `/create-specification`                 |
| `refactor`                | Code-Refactoring-Methodik                | `/refactor`                             |
| `*-mcp-server-generator`  | MCP-Server-Generatoren (PHP, Python, TS) | `/typescript-mcp-server-generator` etc. |
| `postgresql-optimization` | PostgreSQL-Performance-Tuning            | `/postgresql-optimization`              |
| `sql-optimization`        | SQL-Query-Optimierung                    | `/sql-optimization`                     |
| `multi-stage-dockerfile`  | Docker Multi-Stage Builds                | `/multi-stage-dockerfile`               |
| `devops-rollout-plan`     | DevOps-Deployment-Orchestrierung         | `/devops-rollout-plan`                  |

## Claude Agents (`.claude/agents/`)

| Agent                      | Beschreibung                                      |
| -------------------------- | ------------------------------------------------- |
| `security-reviewer`        | Sicherheitsprüfung: OWASP, DSGVO, Zahlungsverkehr |
| `ai-integration-architect` | KI-Integrations-Architektur                       |
| `github-auditor`           | GitHub-Repository-Audit                           |
| `infrastructure-hardener`  | Infrastruktur-Härtung                             |

## GitHub Agents (`.github/agents/`)

| Agent            | Beschreibung                          |
| ---------------- | ------------------------------------- |
| `devops-expert`  | DevOps-Infrastruktur                  |
| `postgresql-dba` | PostgreSQL-DBA                        |
| `task-planner`   | Aufgabenplanung                       |
| `mentor`         | Sokratisches Mentoring                |
| `janitor`        | Code-Cleanup                          |
| `*-mcp-expert`   | MCP-Server-Experten (PHP, Python, TS) |

## Brand-Plugin (`.claude/plugins/moe-brand/`)

| Typ     | Name                                                                      | Beschreibung                                          |
| ------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| Skill   | `brand-check`                                                             | Zentrale Markenrichtlinien-Referenz und Validierung   |
| Skill   | `social-media`                                                            | Social-Media-Formate, Farbkategorien, Templates       |
| Skill   | `email-signatur`                                                          | HTML-E-Mail-Signatur nach Brand Guidelines            |
| Skill   | `briefpapier`                                                             | DIN-A4-Briefpapier nach DIN 5008                      |
| Skill   | `praesentation`                                                           | Präsentations-Masterfolien und Layout                 |
| Skill   | `flyer-poster`                                                            | Print-Produkte (Flyer, Poster, Roll-Up, Visitenkarte) |
| Skill   | `infografik`                                                              | Datenvisualisierung und Infografiken                  |
| Skill   | `text-voice`                                                              | Brand Voice und Tonalität                             |
| Skill   | `logo-export`                                                             | Logo-Export in allen Varianten und Größen             |
| Skill   | `farb-kontrast`                                                           | WCAG-Kontrastprüfung für Brand-Farben                 |
| Agent   | `brand-designer`                                                          | Koordiniert Brand-Skills für neue Assets              |
| Agent   | `brand-reviewer`                                                          | Prüft Assets auf Brand-Konformität                    |
| Command | `farben`, `typo`, `css-vars`, `checkliste`, `canva-setup`, `cowork-guide` | Schnellreferenzen                                     |

---

## Markenrichtlinien (STRIKT VERBINDLICH)

Die Brand Guidelines v1.0 (Compass Artifact) sind **verbindlich für ALLE visuellen und textlichen Outputs**.
Verstöße sind gleichwertig mit Sicherheitslücken zu behandeln. Plugin: `.claude/plugins/moe-brand/`

### Farbsystem (Quelle: Compass Artifact v1.0)

| Name                    | HEX       | Rolle                                         | Kontrast auf Weiß |
| ----------------------- | --------- | --------------------------------------------- | ----------------- |
| Logo-Orange             | `#D4611E` | Logo, große Flächen, dekorative Akzente       | 4.6:1 (AA groß)   |
| Text-Orange             | `#B54A0F` | Text auf Weiß, Buttons, CTAs, Links           | 5.9:1 (AA)        |
| Demokratie-Blau         | `#1B4965` | Überschriften, Navigation, Vertrauenselemente | 8.5:1 (AAA)       |
| Solidaritäts-Petrol     | `#00695C` | Infografiken, sekundäre Links                 | 5.9:1 (AA)        |
| Menschlichkeits-Warmton | `#8B6F4E` | Zitate, Footer, unterstützende Elemente       | 4.6:1 (AA)        |

**Neutrale (Warmgrau):** 50:`#FAF7F5` · 100:`#F0EBE6` · 200:`#DDD5CC` · 300:`#B8ADA0` · 500:`#7A6E62` · 700:`#4A4039` · 900:`#2B231D`

**Funktionsfarben:** Erfolg:`#2E7D32` · Warnung:`#E65100` · Fehler:`#C62828` · Info:`#1565C0`

**VERBOTEN:** `#D84A1B`, `#CB4D1A`, `#BF4000` — fehlerhafte Alt-Werte aus einer früheren Plugin-Version.

### Farbverteilung (60-30-10-Regel)

- **60 %** Neutral (Weiß, Warmgrau) — Hintergründe, Fließtext
- **30 %** Demokratie-Blau — Struktur, Navigation, Überschriften
- **10 %** Orange — Akzente, CTAs, Buttons

### Typografie

| Einsatz   | Schrift       | Gewichte                                    |
| --------- | ------------- | ------------------------------------------- |
| Headlines | Nunito Sans   | ExtraBold (800), Bold (700), SemiBold (600) |
| Fließtext | Source Sans 3 | Regular (400), SemiBold (600), Bold (700)   |
| Zitate    | Merriweather  | Italic (400i) — nur Blockzitate             |

- **Immer linksbündig**, niemals Blocksatz
- Mindestgröße: **16 px** Web, **10 pt** Print
- Zeilenhöhe: min. **1.5** × Schriftgröße
- Max. Zeilenlänge: **60–80 Zeichen**
- Fallback: `'Nunito Sans', 'Segoe UI', Roboto, Arial, sans-serif`

### WCAG AA ist Pflicht

- Normaler Text (< 18pt): min. **4.5:1** Kontrast
- Großer Text (≥ 18pt / ≥ 14pt fett): min. **3:1** Kontrast
- UI-Elemente und Grafiken: min. **3:1** Kontrast
- Farbe **nie alleiniger Informationsträger** (WCAG SC 1.4.1)
- Interaktive Zielgrößen: min. **24 × 24 CSS-Pixel**
- Icons: Phosphor Icons (MIT), Duotone für Brand-Farben

### Sprache & Brand Voice

- Alle UI-Texte in **Österreichischem Deutsch**, `lang="de-AT"`
- Brand Voice: **klar, warm, mutig, ermächtigend, verlässlich**
- Gendersensibel mit Genderstern (Bürger·innen)
- Aktive Formulierungen, keine Passivkonstruktionen
- Zahlen immer mit Kontext: „5.000 Euro — genug für 50 Workshops"

### Bildsprache

- Würde vor Wirkung — keine Armuts-Pornografie
- Informierte Einwilligung aller abgebildeten Personen
- Dokumentarisch-authentischer Stil, warme Farbtemperatur
- Overlay erlaubt: Orange/Blau bei 10–15 % Deckkraft

### Logo-Regeln

- 4 Stufen: Vollversion (≥200px), Kompakt (≥120px), Kurz (≥100px), Icon (≥32px)
- 5 Farbvarianten pro Stufe (Farbe/Weiß-auf-Blau/Weiß-auf-Orange/Schwarz/Weiß)
- Schutzraum = Höhe des Logomarks auf allen Seiten
- **Verboten:** Verzerrung, Rotation, Schattierung, Farbänderungen

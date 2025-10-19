## Menschlichkeit Österreich – Copilot Leitfaden (kurz & praxisnah)

Dieser Monorepo bündelt 5 Services mit gemeinsamer PostgreSQL-DB und DSGVO-First-Default. Ziel: Security > Datenintegrität > Stabilität > Velocity.

### Architektur (Big Picture)
- CRM: `crm.menschlichkeit-oesterreich.at/` (Drupal 10 + CiviCRM, PHP 8.1) – Port 8000
- API: `api.menschlichkeit-oesterreich.at/` (FastAPI, Python 3.11+, Alembic) – Port 8001
- Frontend: `frontend/` (React 18 + TS + Vite, Design Tokens) – Port 5173
- Games: `web/` (Prisma-Schema im Repo; lokaler Dev-Server via Python) – Port 3000
- Forum: `web/forum/` (phpBB, SMTP/reCAPTCHA, optional OIDC-SSO) – Subdomain `forum.menschlichkeit-oesterreich.at`
- Automation: `automation/n8n/` (Docker, Webhooks) – Port 5678
Gemeinsame DB (PostgreSQL ≥15) via `DATABASE_URL`. Schema-Änderungen: koordinieren (API Alembic vs. Games Prisma).

### Daily Dev (Node 22+ zwingend)
- Setup: `npm run setup:dev`
- Start alle: `npm run dev:all` (oder einzeln: `dev:crm`, `dev:api`, `dev:frontend`, `dev:games`)
- Wichtige Ports: CRM 8000 · API 8001 · Frontend 5173 · Games 3000 · n8n 5678

### Qualität & Tests (PR-blocking Gates)
- Alles auf einmal: `npm run quality:gates`
	- Code Quality (Codacy), Security (Trivy+Gitleaks), Performance (Lighthouse), DSGVO-Checks, Reports
- Einzeltests: `npm run test:unit` (Vitest), `npm run test:e2e` (Playwright), Python: `pytest tests/test_pii_sanitizer.py`

### DSGVO/PII (Projekt-spezifische Patterns)
- FastAPI: Middleware `api.../app/middleware/pii_middleware.py` + Lib `app/lib/pii_sanitizer.py`
- Drupal: Custom Modul `crm.../web/modules/custom/pii_sanitizer/` (Watchdog/Forms/Mails/CiviCRM)
- Regeln: Keine PII in Logs; E-Mail-Masking (`t**@example.com`), IBAN-Redaction (`AT61***`). Tests: `tests/test_pii_sanitizer.py`.

### Frontend Konventionen
- Design Tokens: `figma-design-system/00_design-tokens.json` – niemals Farben/Spacing hardcoden
	- Nutzung: `frontend/tailwind.config.cjs`, `frontend/scripts/generate-design-tokens.mjs`
- Routing/Fallback: `frontend/src/App.tsx` nutzt `<AITestPage />` als sichere Fallback-Route
- Performance-Audit: `npm run performance:lighthouse` (nutzt Frontend-Workspace)

### API & DB Flows
- OpenAPI: `api.menschlichkeit-oesterreich.at/openapi.yaml` (halten in Sync mit Endpunkten)
- Migrations (API): Alembic – Beispiel: `alembic upgrade head`
- Prisma (Games): Schema im `schema.prisma`; gängig: `npx prisma generate` / `npx prisma migrate dev`

### Build/Deploy (mit n8n Webhooks)
- Pipeline: `./build-pipeline.sh staging|production [--skip-tests|--force]` (sendet Webhooks via `automation/n8n/webhook-client.js`)
- Multi-Service Deploy: `deployment-scripts/multi-service-deploy.sh`
- Rollback & Health: `npm run deploy:rollback` · `npm run deploy:health-check`

### MCP-Integration (für AI-Workflows)
- Setup/Status: `npm run mcp:setup` · `npm run mcp:check` · `npm run mcp:list`
- Typische Nutzung: Figma-Sync (Design Tokens), GitHub (PRs/Security), Filesystem (Repo-Operationen), Context7 (Lib-Doks)

### Do/Don’t (projektspezifisch)
- Do: UI-Texte auf Österreichisches Deutsch, Tokens verwenden, Gates lokal ausführen, OpenAPI/Alembic/Prisma aktuell halten
- Don’t: PII loggen, Farben/Spacing hardcoden, DB ohne Migration ändern, Secrets commiten (Gitleaks blockt)

### Quick Links (Schlüsseldateien)
- Scripts/Orchestrierung: `package.json` (Workflows), `build-pipeline.sh`
- DSGVO/PII: `api.../app/lib/pii_sanitizer.py`, `crm.../modules/custom/pii_sanitizer/`
- Frontend: `frontend/src/App.tsx`, `frontend/tailwind.config.cjs`
- Design System: `figma-design-system/00_design-tokens.json`
- DB: `schema.prisma`, `api.menschlichkeit-oesterreich.at/alembic/`

Unklarheiten oder Lücken? Nenne konkrete Aufgaben/Dateien – ich erweitere die Anleitung gezielt (kurz & operativ).
# Menschlichkeit Österreich – AI Coding Agent Guide# Menschlichkeit Österreich – AI Coding Agent Guide# Menschlichkeit Österreich – Copilot Leitfaden



Austrian NGO multi-service platform with strict GDPR compliance, automated quality gates, and MCP-enhanced development workflow.



## Architecture OverviewAustrian NGO multi-service platform with strict GDPR compliance, automated quality gates, and MCP-enhanced development workflow.## 1. Arbeitsmodus



**Multi-Service Austrian NGO Platform** - 6 independent services sharing PostgreSQL database:- **Rolle:** DevOps & Security-first AI-Assistent mit Fokus auf Qualität, Compliance und Developer Experience.



```## Architecture Overview- **Verhalten:** Deterministisch, keine destruktiven Aktionen ohne Dry-Run. Dokumentiere Annahmen, logge Ergebnisdateien.

├── CRM (crm.menschlichkeit-oesterreich.at)     → Drupal 10 + CiviCRM (PHP 8.1, Port 8000)

├── API (api.menschlichkeit-oesterreich.at)     → FastAPI + Python 3.11+ (Port 8001, /docs for OpenAPI)- **Prioritäten:** Sicherheit > Datenintegrität > Produktionsstabilität > Developer-Velocity.

├── Frontend (frontend/)                         → React 18 + TypeScript + Vite (Port 5173)

├── Gaming Platform (web/)                       → Prisma ORM + PostgreSQL (Port 3000)**Multi-Service Austrian NGO Platform** - 6 independent services sharing PostgreSQL database:

├── Website (website/)                           → WordPress/HTML (Production frontend)

└── Automation (automation/n8n/)                 → n8n Docker workflows (Port 5678)## 2. Repository-Überblick

```

```| Service | Ordner | Stack | Hinweise |

**Critical Integration Points:**

- **Shared Database:** All services use PostgreSQL 15+ via `DATABASE_URL` - schema changes require cross-service coordination├── CRM (crm.menschlichkeit-oesterreich.at)     → Drupal 10 + CiviCRM (PHP 8.1, Port 8000)| --- | --- | --- | --- |

- **PII Sanitization:** Enforced at 2 layers: `api/app/lib/pii_sanitizer.py` (FastAPI) + `crm/web/modules/custom/pii_sanitizer` (Drupal)

- **Design System:** Figma tokens in `figma-design-system/00_design-tokens.json` auto-sync to frontend (Austrian branding: Rot-Weiß-Rot)├── API (api.menschlichkeit-oesterreich.at)     → FastAPI + Python 3.11+ (Port 8001, /docs for OpenAPI)| Website | `website/` | WordPress/HTML | Produktions-Frontend |

- **n8n Webhooks:** Build pipeline (`build-pipeline.sh`) sends notifications via `automation/n8n/webhook-client.js`

├── Frontend (frontend/)                         → React 18 + TypeScript + Vite (Port 5173)| React Frontend | `frontend/` | React + Vite | Design Tokens & UI-Komponenten |

## Mandatory Quality Gates (PR Blocking)

├── Gaming Platform (web/)                       → Prisma ORM + PostgreSQL (Port 3000)| API | `api.menschlichkeit-oesterreich.at/` | FastAPI, PostgreSQL | GDPR relevante Endpunkte |

**ZERO TOLERANCE** - All must pass before merge:

- Security: `npm run security:scan` → 0 HIGH/CRITICAL (Trivy + Gitleaks)├── Website (website/)                           → WordPress/HTML (Production frontend)| CRM | `crm.menschlichkeit-oesterreich.at/` | Drupal + CiviCRM | läuft über Drush/Plesk |

- Code Quality: `npm run quality:codacy` → Maintainability ≥85%, Duplication ≤2%

- Performance: `npm run performance:lighthouse` → All scores ≥90└── Automation (automation/n8n/)                 → n8n Docker workflows (Port 5678)| Games | `web/` | TypeScript/Python | nutzt Prisma + PostgreSQL |

- GDPR: `npm run compliance:dsgvo` → 0 PII in logs, consent documented

- Tests: `npm run test:e2e && npm run test:unit` → 100% passing, coverage ≥80%```| Automation | `automation/n8n/` | Docker (n8n) | Webhook-Benachrichtigungen |



**Enforcement:** `.github/workflows/enterprise-pipeline.yml` blocks merge if any gate fails.| Deployment | `deployment-scripts/`, `scripts/` | Bash/PowerShell | Plesk & Multi-Service Deployments |



## Development Workflow**Critical Integration Points:**



### Setup & Daily Development- **Shared Database:** All services use PostgreSQL 15+ via `DATABASE_URL` - schema changes require cross-service coordination## 3. Qualitäts- & Sicherheits-Gates (Blocking)

```

# First time setup- **PII Sanitization:** Enforced at 2 layers: `api/app/lib/pii_sanitizer.py` (FastAPI) + `crm/web/modules/custom/pii_sanitizer` (Drupal)- **Code:** `npm run lint:all`, `composer exec phpstan analyse`, `pytest`, `vitest`.

npm run setup:dev              # Installs all workspaces, composer deps, environments

- **Design System:** Figma tokens in `figma-design-system/00_design-tokens.json` auto-sync to frontend (Austrian branding: Rot-Weiß-Rot)- **Security:** Trivy (HIGH/CRITICAL = 0), Gitleaks (0 Secrets), npm audit.

# Start all services (parallel)

npm run dev:all                # CRM, API, Frontend, Games all start concurrently- **n8n Webhooks:** Build pipeline (`build-pipeline.sh`) sends notifications via `automation/n8n/webhook-client.js`- **Performance:** Lighthouse ≥ 90 (Performance/Accessibility/Best-Practices/SEO).



# Or individual services- **Compliance:** DSGVO – keine PII in Logs, Consent & Retention dokumentiert.

npm run dev:crm                # PHP built-in server at localhost:8000

npm run dev:api                # FastAPI with hot-reload at localhost:8001## Mandatory Quality Gates (PR Blocking)- **Supply Chain:** SBOM + SPDX gepflegt (`npm run quality:reports`).

npm run dev:frontend           # Vite dev server at localhost:5173

npm run dev:games              # Python HTTP server at localhost:3000

```text

**ZERO TOLERANCE** - All must pass before merge:## 4. Kern-Workflows

### Quality Checks (Run before every commit)

```

npm run quality:gates          # Runs ALL gates sequentially (takes ~5-10 min)

npm run lint:all               # ESLint + PHPStan + markdownlint- Code Quality: `npm run quality:codacy` → Maintainability ≥85%, Duplication ≤2%```bash

npm run test:e2e              # Playwright tests (chromium, firefox, webkit, mobile)

```- Performance: `npm run performance:lighthouse` → All scores ≥90npm run setup:dev          # Workspaces + Composer + Environments



### Build & Deployment Pipeline- GDPR: `npm run compliance:dsgvo` → 0 PII in logs, consent documentednpm run dev:all            # CRM (8000), API (8001), Frontend (5173), Games (3000)

```

# Build pipeline with environment targeting- Tests: `npm run test:e2e && npm run test:unit` → 100% passing, coverage ≥80%npm run n8n:start          # Automation-Stack (Docker)

./build-pipeline.sh staging            # Builds for staging, runs tests

./build-pipeline.sh production         # Full production build + quality gates```



# Deployment (uses Plesk SFTP)**Enforcement:** `.github/workflows/enterprise-pipeline.yml` blocks merge if any gate fails.

npm run deploy:staging                 # Multi-service staging deploy

npm run deploy:production              # Production deploy (requires approval)### Qualität & Tests

npm run deploy:rollback                # Emergency rollback to previous version

```## Development Workflow```bash



**Key Pipeline Behaviors:**npm run quality:gates      # Codacy, Security, Performance, Compliance Berichte

- n8n webhook notifications sent automatically (build started/success/failure)

- `--skip-tests` flag available but NOT recommended### Setup & Daily Developmentnpm run test:unit          # Vitest

- Dry-run mode: `npm run deploy:dashboard` shows what would deploy without executing

```

## Service-Specific Patterns

# First time setupcomposer test              # Drupal/Custom PHP

### CRM Service (Drupal 10 + CiviCRM)

- **Custom modules:** `crm.menschlichkeit-oesterreich.at/web/modules/custom/`npm run setup:dev              # Installs all workspaces, composer deps, environmentsnpm run test:e2e           # Playwright E2E

- **PII Sanitizer:** Auto-redacts emails/IBANs in Watchdog logs + CiviCRM activities

- **Development:** Use `drush` commands: `drush cr` (cache rebuild), `drush updb` (DB updates)```

- **Testing:** `composer test` runs PHPUnit + PHPStan level 6

# Start all services (parallel)

### API Service (FastAPI)

- **PII Middleware:** `api/app/middleware/pii_middleware.py` auto-sanitizes all requests/responsesnpm run dev:all                # CRM, API, Frontend, Games all start concurrently### Build & Deployment

- **OpenAPI Spec:** Auto-generated at `http://localhost:8001/docs` - keep in sync with `api/openapi.yaml`

- **Testing:** `pytest tests/test_privacy_api.py` validates GDPR compliance```bash

- **Database:** Uses Alembic migrations (NOT Prisma) - `alembic upgrade head`

# Or individual servicesnpm run build:all          # Frontend + Games + API Packaging

### Frontend (React + TypeScript)

- **Design Tokens:** Import from `figma-design-system/00_design-tokens.json` - NEVER hardcode colors/spacingnpm run dev:crm                # PHP built-in server at localhost:8000./build-pipeline.sh staging|production

- **Austrian Branding:** Primary color must use token `--color-primary` (Rot-Weiß-Rot palette)

- **Routing:** `frontend/src/App.tsx` - lazy-loaded routes with AI fallback (`<AITestPage />`)npm run dev:api                # FastAPI with hot-reload at localhost:8001./scripts/safe-deploy.sh   # SFTP Deploy (Auto-Bestätigung via SAFE_DEPLOY_AUTO_CONFIRM)

- **Build:** `npm run build:frontend` outputs to `frontend/dist/` with Vite chunking

npm run dev:frontend           # Vite dev server at localhost:5173```

### Gaming Platform (Prisma + PostgreSQL)

- **Schema:** `schema.prisma` defines User/Achievement/GameSession modelsnpm run dev:games              # Python HTTP server at localhost:3000CI/CD Workflow: `.github/workflows/deploy-staging.yml` (trigger: `main` push + manual).

- **XP System:** User.totalXP + User.currentXP (level-up logic in game code)

- **Development:** `npx prisma generate` after schema changes, `npx prisma migrate dev` for new migrations```



## GDPR Compliance Requirements## 5. Testing & Observability



**Austrian Data Protection Law Specifics:**### Quality Checks (Run before every commit)- Unit/E2E Ergebnisse in `playwright-results/`, Coverage unter `coverage/`.

- All UI text must be in **Austrian German** (Österreich variant) - use `ä`, `ö`, `ü`, `ß`

- Email masking: `test@example.com` → `t**@example.com` (PiiSanitizer enforced)```bash- Monitoring-Daten: `quality-reports/deployment-metrics/*.ndjson` + Markdown-Reports.

- IBAN redaction: `AT61 1904 3002 3457 3201` → `AT61***` (Luhn validation prevents false positives)

- Consent documented in CiviCRM: `civicrm_contact` table has consent flagsnpm run quality:gates          # Runs ALL gates sequentially (takes ~5-10 min)- Smoke-Tests: `deployment-scripts/smoke-tests.sh` (nutzt Playwright & API-Checks).



**PII Sanitization Layer:**npm run lint:all               # ESLint + PHPStan + markdownlint- Log-Analyse: `scripts/log-analyzer.py`; Alerting via n8n Webhooks (`automation/n8n`).

```python

# FastAPI (automatic via middleware)npm run test:e2e              # Playwright tests (chromium, firefox, webkit, mobile)

from app.lib.pii_sanitizer import scrub, scrub_dict

clean_text = scrub("Email: test@example.com")  # → "Email: t**@example.com"```## 6. Daten & Sicherheit



# Drupal (automatic via hooks)- Sensible Konfigurationen über `.env.deployment` (Erstellung per `deployment-scripts/setup-environment.sh`).

\Drupal::logger('module')->error('User: @email', ['@email' => 'john@example.com']);

# Logged as: "User: j**@example.com"### Build & Deployment Pipeline- PII-Sanitizing: `api.menschlichkeit-oesterreich.at/app/lib/pii_sanitizer.py` – Tests in `tests/test_pii_sanitizer.py`.

```

```bash- Secrets niemals ins Repo pushen (`secrets/` enthält Vorlagen und Tools).

## Testing Strategy

# Build pipeline with environment targeting- SSH/Plesk Deploys nutzen `SAFE_DEPLOY_*` und GitHub Secrets (`STAGING_REMOTE_*`).

**Test Pyramid:**

- **E2E (Playwright):** `tests/e2e/` - critical user flows, multi-browser (Chrome, Firefox, Safari, Mobile)./build-pipeline.sh staging            # Builds for staging, runs tests

- **Integration:** `tests/test_auth_api.py` - service boundaries, API contracts

- **Unit:** `tests/unit/` - isolated logic, 80%+ coverage required./build-pipeline.sh production         # Full production build + quality gates## 7. Häufige Befehle (Cheat Sheet)



**Running Tests:**```bash

```

npm run test:e2e                      # Full Playwright suite (~5-10 min)# Deployment (uses Plesk SFTP)# Workspace Pflege

npm run test:e2e -- --project=chromium # Single browser

npm run test:unit                     # Vitest unit testsnpm run deploy:staging                 # Multi-service staging deploynpm run clean:dist          # Dist-Verzeichnisse entfernen

pytest tests/test_pii_sanitizer.py    # Python unit tests

```npm run deploy:production              # Production deploy (requires approval)npm run logs:purge          # Logrotation



**Reports:** Results in `playwright-results/html/index.html` and `quality-reports/`npm run deploy:rollback                # Emergency rollback to previous version



## MCP Server Integration (GitHub Copilot Extensions)```# Datenbanken



**Active MCP Servers (6 configured):**./scripts/db-pull.sh        # Prod → lokal (Lesemodus)

- `memory` - Session persistence across conversations

- `sequential-thinking` - Multi-step reasoning for complex tasks**Key Pipeline Behaviors:**./scripts/db-push.sh --apply # Lokal → Prod (nur mit Approval)

- `figma` - Design token sync, component code generation

- `github` - Issue management, PR automation, security alerts- n8n webhook notifications sent automatically (build started/success/failure)

- `filesystem` - Workspace-wide file operations

- `upstash-context7` - Library documentation lookup- `--skip-tests` flag available but NOT recommended# Analyse & Reports



**Usage Examples:**- Dry-run mode: `npm run deploy:dashboard` shows what would deploy without executingpython3 scripts/ai-architecture-analyzer.py --output quality-reports/architecture.json

```

"Sync latest Figma design tokens"          → Uses Figma MCPnpm run quality:reports     # Generiert konsolidierte Markdown/SARIF Reports

"List all HIGH security alerts"            → Uses GitHub MCP

"Compare figma-design-system/*.json"       → Uses Filesystem MCP## Service-Specific Patterns```

"Get FastAPI CORS best practices"          → Uses Context7 MCP

```text



**MCP Debugging:** If servers not responding, check `~/.vscode/extensions/github.copilot-*/` logs### CRM Service (Drupal 10 + CiviCRM)## 8. Vorlage für Copilot Prompts



## Common Workflows- **Custom modules:** `crm.menschlichkeit-oesterreich.at/web/modules/custom/`- **Kontext:** relevanten Pfad, Service und Qualitätsanforderung nennen.



### Adding New Feature- **PII Sanitizer:** Auto-redacts emails/IBANs in Watchdog logs + CiviCRM activities- **Scope:** „Ändere nur X“ – sichere Dir, was nicht verändert werden darf.

1. Create branch: `git checkout -b feature/<issue-number>-<description>`

2. Run quality gates: `npm run quality:gates`- **Development:** Use `drush` commands: `drush cr` (cache rebuild), `drush updb` (DB updates)- **Checks:** Abschluss mit `npm run quality:gates` oder passendem Test-Befehl.

3. Make changes (AI-assisted via MCP servers)

4. Test: `npm run test:e2e && npm run test:unit`- **Testing:** `composer test` runs PHPUnit + PHPStan level 6- **Output:** Erwähne betroffene Dateien + Tests/Reports, keine sensiblen Daten protokollieren.

5. PR: Link issue in description, attach quality reports from `quality-reports/`



### Database Schema Change

1. Update `schema.prisma` for gaming platform OR Alembic migration for API### API Service (FastAPI)## 9. Kommunikation & Reviews

2. Generate: `npx prisma generate` OR `alembic revision --autogenerate`

3. Coordinate: Check if CRM/other services affected (shared PostgreSQL!)- **PII Middleware:** `api/app/middleware/pii_middleware.py` auto-sanitizes all requests/responses- PRs: Referenzen auf TODO-Nummern, Reports aus `quality-reports/` anhängen.

4. Test migration: `npx prisma migrate dev` OR `alembic upgrade head`

5. Document in PR: Breaking changes, rollback steps- **OpenAPI Spec:** Auto-generated at `http://localhost:8001/docs` - keep in sync with `api/openapi.yaml`- Reviewer-Matrix (Beispiel – aktualisieren in CODEOWNERS): Frontend = `@frontend-team`, API = `@backend-team`.



### Deployment Emergency- **Testing:** `pytest tests/test_privacy_api.py` validates GDPR compliance- Incident-Flow: Bei Fehlern → `deployment-scripts/rollback.sh` → Bericht unter `quality-reports/incident-*`.

```

# Immediate rollback- **Database:** Uses Alembic migrations (NOT Prisma) - `alembic upgrade head`

./deployment-scripts/rollback.sh <previous-version>

---

# Create incident report

# Uses template: quality-reports/incident-YYYY-MM-DD.md### Frontend (React + TypeScript)**Kurzform:** „Qualität zuerst, nichts zerstören, alles dokumentieren.“  



# Post-mortem- **Design Tokens:** Import from `figma-design-system/00_design-tokens.json` - NEVER hardcode colors/spacingCopilot muss Prozesse reproduzierbar halten und alle relevanten Test-/Security-Schritte ausführen oder begründet skippen.

npm run logs:purge              # Rotate logs for analysis

python3 scripts/log-analyzer.py # Extract errors- **Austrian Branding:** Primary color must use token `--color-primary` (Rot-Weiß-Rot palette)

```- **Routing:** `frontend/src/App.tsx` - lazy-loaded routes with AI fallback (`<AITestPage />`)

- **Build:** `npm run build:frontend` outputs to `frontend/dist/` with Vite chunking

## Key Files to Reference

### Gaming Platform (Prisma + PostgreSQL)

**Architecture Decisions:**- **Schema:** `schema.prisma` defines User/Achievement/GameSession models

- `.github/instructions/project-development.instructions.md` - Full dev guidelines- **XP System:** User.totalXP + User.currentXP (level-up logic in game code)

- `.github/instructions/mcp-integration.instructions.md` - MCP server workflows- **Development:** `npx prisma generate` after schema changes, `npx prisma migrate dev` for new migrations

- `.github/instructions/quality-gates.instructions.md` - Quality enforcement rules

## GDPR Compliance Requirements

**Configuration:**

- `package.json` - Root workspace scripts (80+ npm commands)**Austrian Data Protection Law Specifics:**

- `build-pipeline.sh` - Main build orchestration (lines 1-100 critical)- All UI text must be in **Austrian German** (Österreich variant) - use `ä`, `ö`, `ü`, `ß`

- `deployment-scripts/multi-service-deploy.sh` - Plesk deployment logic- Email masking: `test@example.com` → `t**@example.com` (PiiSanitizer enforced)

- IBAN redaction: `AT61 1904 3002 3457 3201` → `AT61***` (Luhn validation prevents false positives)

**Database:**- Consent documented in CiviCRM: `civicrm_contact` table has consent flags

- `schema.prisma` - Gaming platform data models (User/Achievement/GameSession)

- `api.menschlichkeit-oesterreich.at/alembic/` - API migrations (separate from Prisma)**PII Sanitization Layer:**

```

## Critical Don'ts# FastAPI (automatic via middleware)

from app.lib.pii_sanitizer import scrub, scrub_dict

❌ **NEVER:**clean_text = scrub("Email: test@example.com")  # → "Email: t**@example.com"

- Push secrets/API keys (gitleaks blocks commits)

- Hardcode colors/spacing in frontend (use design tokens)# Drupal (automatic via hooks)

- Skip quality gates (PR will be blocked anyway)\Drupal::logger('module')->error('User: @email', ['@email' => 'john@example.com']);

- Use `git push --force` on protected branches# Logged as: "User: j**@example.com"

- Modify production DB without migration```

- Log PII (emails, IBANs, phone numbers) - sanitizers auto-redact

## Testing Strategy

## Debugging Tips

**Test Pyramid:**

**Service won't start:**- **E2E (Playwright):** `tests/e2e/` - critical user flows, multi-browser (Chrome, Firefox, Safari, Mobile)

```bash- **Integration:** `tests/test_auth_api.py` - service boundaries, API contracts

npm run clean:dist && npm run setup:dev    # Nuclear option - full rebuild- **Unit:** `tests/unit/` - isolated logic, 80%+ coverage required

```

**Running Tests:**

**Quality gate failure:**```bash

```bashnpm run test:e2e                      # Full Playwright suite (~5-10 min)

npm run quality:codacy     # Individual gate for faster iterationnpm run test:e2e -- --project=chromium # Single browser

npm run security:trivy     # Check specific security issuesnpm run test:unit                     # Vitest unit tests

```

```text

**MCP servers not working:**

```

cat ~/.vscode/extensions/github.copilot-*/language-server.log | grep -i error

# VS Code reload: Cmd/Ctrl + Shift + P → "Developer: Reload Window"## MCP Server Integration (GitHub Copilot Extensions)

```text

**Active MCP Servers (6 configured):**

---- `memory` - Session persistence across conversations

- `sequential-thinking` - Multi-step reasoning for complex tasks

**Philosophy:** Security > Data Integrity > Production Stability > Developer Velocity  - `figma` - Design token sync, component code generation

**Goal:** Zero production incidents, 100% quality gate pass rate, GDPR-compliant by default- `github` - Issue management, PR automation, security alerts

- `filesystem` - Workspace-wide file operations
- `upstash-context7` - Library documentation lookup

**Usage Examples:**
```
"Sync latest Figma design tokens"          → Uses Figma MCP
"List all HIGH security alerts"            → Uses GitHub MCP
"Compare figma-design-system/*.json"       → Uses Filesystem MCP
"Get FastAPI CORS best practices"          → Uses Context7 MCP
```text

**MCP Debugging:** If servers not responding, check `~/.vscode/extensions/github.copilot-*/` logs

## Common Workflows

### Adding New Feature
1. Create branch: `git checkout -b feature/<issue-number>-<description>`
2. Run quality gates: `npm run quality:gates`
3. Make changes (AI-assisted via MCP servers)
4. Test: `npm run test:e2e && npm run test:unit`
5. PR: Link issue in description, attach quality reports from `quality-reports/`

### Database Schema Change
1. Update `schema.prisma` for gaming platform OR Alembic migration for API
2. Generate: `npx prisma generate` OR `alembic revision --autogenerate`
3. Coordinate: Check if CRM/other services affected (shared PostgreSQL!)
4. Test migration: `npx prisma migrate dev` OR `alembic upgrade head`
5. Document in PR: Breaking changes, rollback steps

### Deployment Emergency
```
# Immediate rollback
./deployment-scripts/rollback.sh <previous-version>

# Create incident report
# Uses template: quality-reports/incident-YYYY-MM-DD.md

# Post-mortem
npm run logs:purge              # Rotate logs for analysis
python3 scripts/log-analyzer.py # Extract errors
```text

## Key Files to Reference

**Architecture Decisions:**
- `.github/instructions/project-development.instructions.md` - Full dev guidelines
- `.github/instructions/mcp-integration.instructions.md` - MCP server workflows
- `.github/instructions/quality-gates.instructions.md` - Quality enforcement rules

**Configuration:**
- `package.json` - Root workspace scripts (80+ npm commands)
- `build-pipeline.sh` - Main build orchestration (lines 1-100 critical)
- `deployment-scripts/multi-service-deploy.sh` - Plesk deployment logic

**Database:**
- `schema.prisma` - Gaming platform data models (User/Achievement/GameSession)
- `api.menschlichkeit-oesterreich.at/alembic/` - API migrations (separate from Prisma)

## Critical Don'ts

❌ **NEVER:**
- Push secrets/API keys (gitleaks blocks commits)
- Hardcode colors/spacing in frontend (use design tokens)
- Skip quality gates (PR will be blocked anyway)
- Use `git push --force` on protected branches
- Modify production DB without migration
- Log PII (emails, IBANs, phone numbers) - sanitizers auto-redact

## Debugging Tips

**Service won't start:**
```
npm run clean:dist && npm run setup:dev    # Nuclear option - full rebuild
```bash

**Quality gate failure:**
```
npm run quality:codacy     # Individual gate for faster iteration
npm run security:trivy     # Check specific security issues
```bash

**MCP servers not working:**
```
cat ~/.vscode/extensions/github.copilot-*/language-server.log | grep -i error
# VS Code reload: Cmd/Ctrl + Shift + P → "Developer: Reload Window"
```text

### Forum-Spezifisches (phpBB)
- **Dokumentation:** `docs/forum/` (README, OPERATIONS, SECURITY, DSGVO, KI-MODERATION, SSO-OIDC)
- **Deployment:** `.github/workflows/deploy-forum.yml` (Safety-Gate bis Go-Live: `if: ${{ false }}`)
- **Secrets:** FORUM_SMTP_PASS, FORUM_RECAPTCHA_SECRET, OIDC_CLIENT_SECRET (siehe `secrets/SECRETS-AUDIT.md`)
- **n8n Integration:** `automation/n8n/workflows/forum-viral.json` (Social Crossposting)
- **CODEOWNERS:** `/web/forum/**` und `/docs/forum/**` → @peschull
- **Style-Sync:** Figma Design Tokens → phpBB Theme (via Tailwind CSS)
- **DSGVO:** Cookie-Banner, PII-Retention-Policy, Anonymisierungs-Scripts
- **SSO (optional):** OIDC-Integration nach vollständigem Testing aktivieren

---

**Philosophy:** Security > Data Integrity > Production Stability > Developer Velocity  
**Goal:** Zero production incidents, 100% quality gate pass rate, GDPR-compliant by default


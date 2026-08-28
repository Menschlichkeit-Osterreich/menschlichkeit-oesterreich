# Menschlichkeit Oesterreich - Copilot Leitfaden

GitHub Copilot arbeitet in diesem Repository entlang desselben Repo-Vertrags wie Codex und Claude Code.

## Zuerst lesen

1. `AGENTS.md` — Rollenrouting und aktive Agenten
2. `CLAUDE.md` — Betriebslogik und Services
3. `.github/instructions/core/analysis-planning.instructions.md` — Kanonischer Analyse-Einstieg
4. `.github/ai-registry.json` — Klassifikation aller Artefakte
5. `.github/instructions/core/*.instructions.md` — Bindende Policies
6. GitHub Issue #539 — Kanonische Plattformentscheidung

## Repo-Identitaet

- Repository: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Main-first Workflow
- Aktive Produktpfade unter `apps/`
- Historische Root-Pfade und alte Einzelordner sind keine aktiven Entwicklungsziele.

## Architektur-Ueberblick

| Service | Pfad | Port | Tech Stack | Besonderheiten |
| --- | --- | --- | --- | --- |
| Website | `apps/website/` | 5173 | React 19 + Vite + TailwindCSS | SSR / Prerender möglich |
| API | `apps/api/` | 8001 | FastAPI + PostgreSQL + Alembic | Source of Truth für Backend; OpenAPI: `/api/docs` |
| Babylon Game | `apps/babylon-game/` | 3001 | Next.js 16 + Babylon.js 8 | 3D-Engine Integration |
| CRM | `apps/crm/` | 8000 | Drupal 10 + CiviCRM | Natives Backoffice |
| Forum | `apps/forum/` | 8002 | phpBB | Docker-basiert |
| Automatisierung | `automation/n8n/` | 5678 | n8n → **Make** (Migration läuft) | n8n LEGACY; neue Workflows in Make |

Das Monorepo nutzt npm workspaces für `apps/website/` und `apps/babylon-game/`, Python-Umgebungen für `apps/api/` und Docker Compose für Drupal/phpBB.

## Build, Test und Lint — Schnellreferenz

### Setup
```bash
npm run setup:dev              # Installiert Workspace-Deps, Composer, .env Templates
npm run install:all          # nur npm-Workspaces
npm run setup:composer       # nur PHP-Dependencies
```

### Entwicklung starten
```bash
npm run dev:frontend         # Website auf Port 5173
npm run dev:api             # FastAPI auf Port 8001
npm run dev:games           # Babylon Game auf Port 3001
npm run dev:all             # Alle Services parallel (concurrently)
```

### Testen
```bash
npm run test:unit -- --run  # Vitest (root unit + Games); Website-Tests: npm run test:website
npm run test:api            # pytest; Einzeltest: cd apps/api && python -m pytest tests/test_payments.py::test_create_payment -q
npm run test:website        # Frontend-Tests nur
npm run test:games          # Games-Tests nur
npm run test:integration    # Playwright E2E-Tests
npm run test:coverage       # Coverage-Reports (quality-reports/*.xml)
```

### Linting und Formatting
```bash
npm run lint:js             # ESLint mit --fix
npm run format              # Prettier
npm run lint:php            # PHPStan + php-cs-fixer fix
npm run lint:md             # MarkdownLint
npm run lint:all            # JS + PHP + Markdown
npm run workspace:config:check  # Validiert .vscode, .claude, mcp.json, Workflows
```

### Quality Gates (lokal testen vor Push)
```bash
npm run quality:gates       # Codacy + Trivy + Bandit + Gitleaks + Lighthouse + DSGVO + Reports
npm run security:scan       # Nur Security-Scanner (Trivy, Bandit, Gitleaks)
npm run a11y:test          # Accessibility-Audit (pa11y-ci)
npm run performance:lighthouse  # Lighthouse CI
```

### Build für Produktion
```bash
npm run build:frontend      # Website mit Prerender
npm run build:games         # Babylon Game
npm run build:api          # FastAPI (schreibt build-Artefakte)
npm run build:all          # Alle drei
```

## Key Conventions

### Code Style und Organisation

1. **Imports und Aliase**: Nutze definierte Path-Aliase aus `vitest.config.js`:
   - `@/` — Repository-Root
   - `@/game` — Babylon Game Source (`apps/babylon-game/src/game`)
   - `@web` — Legacy-Pfade (nicht für neue Features)
   - `@games` — Legacy-Alias (`./web/games` existiert nicht mehr; für Babylon.js `@/game` verwenden)

2. **Frontend (React 19 + Vite)**:
   - Komponenten in `src/components/` organisiert
   - Seiten in `src/pages/` (Router-getriebenes Routing)
   - TypeScript strikte Mode
   - Tests: `src/**/*.test.ts(x)` collocated mit Code

3. **Backend (FastAPI)**:
   - Router in `apps/api/app/routes/`
   - Services in `apps/api/app/services/`
   - Modelle in `apps/api/app/models/`
   - Database Migrations: Alembic in `apps/api/alembic/`
   - OpenAPI-Vertrag: `apps/api/openapi.yaml` (MUSS nach API-Änderungen aktualisiert werden)

4. **Babylon Game (Next.js 16)**:
   - `babylonjs-editor-cli pack` vor Commit wenn Assets geändert (erzeugt `src/game/`)
   - Canvas-Komponenten in `src/components/`
   - Turbopack entwicklungsoptimiert

5. **Test-Patterns**:
   - Unit: Vitest (jsdom), Fixtures unter `tests/fixtures/`
   - API: pytest, `apps/api/tests/` ist kanonisch
   - E2E: Playwright, `tests/e2e/`

### Secrets und Umgebung

- Keine `.env` Dateien committen; `.env.example` nutzen
- Environment-Variablen für Bitwarden (`BW_ACCESS_TOKEN`) via Agents Secrets
- `PLESK_*`-Variablen aus Agents Variables (nicht duplizieren)
- Passwords, Keys, Stripe-IDs, DB-URLs nie in Logs oder Chat ausgeben
- `.github/bsm-secret-ids.json` nur Mapping-Metadaten, NIE Secret-Werte

### Git und Commits

- Main-first: alle Branches von `main`, PRs gegen `main`
- Conventional Commits: `feat(scope):`, `fix(scope):`, `docs(scope):`
- Hooks (`.githooks/pre-commit`, `commit-msg`, `pre-push`) sind aktiv
- Commitlint validiert auf `commit-msg`
- Pre-push führt Governance und Tests aus

### API-Entwicklung

- Jeder neue Endpunkt → `apps/api/openapi.yaml` aktualisieren
- Health-Checks: `/healthz`, `/readyz`
- Base URL lokal: `http://localhost:8001/api`
- OpenAPI Docs: `http://localhost:8001/api/docs`
- DB-Migrationen: `cd apps/api && alembic revision -m "beschreibung"`

### Kanonische Plattformarchitektur

Issue #539 hat Vorrang vor aelteren widerspruechlichen Azure- oder n8n-Zielentscheidungen.

- GitHub = Source, PRs, Issues, CI/CD
- GitHub Actions = kontrollierter Audit- und Deployment-Kanal
- Bitwarden Secrets Manager = kanonische Secret Source
- Plesk = Runtime Target, soweit live verifiziert
- FastAPI + PostgreSQL = transaktionskritischer Backend- und Payment-Kern
- CiviCRM = CRM, Kontakte, Mitgliedschaften und Contributions
- ERPNext = Accounting System of Record
- Make = zentrale Automations- und Integrationsplattform
- SharePoint = Governance-Dokumente
- ClickUp = operative Vereinsaufgaben und Projektsteuerung
- Slack = datensparsame Ops-Kommunikation
- n8n = Migrationsquelle, danach RETIRED
- Azure = nicht Teil der Zielarchitektur; vorhandene Artefakte als `LEGACY_CANDIDATE` behandeln und nur nach Abhaengigkeitspruefung entfernen

Keine neue Azure-Infrastruktur und keine neuen strategischen n8n-Workflows einfuehren.

## Agentenauswahl — Schnellreferenz

Nutze das Rollenmodell aus `AGENTS.md`:

| Task | Agent | Wann | Aktion |
| --- | --- | --- | --- |
| Feature / Bugfix / Refactoring | `developer` | Neue Funktionalitaet, API-Endpunkte, UI-Komponenten | Implementierung direkt im Code |
| Architektur / Grenzen / Design | `architect` | Neue Services, System-Schnittellen, Datenmodelle | Analyse → Vorschlag → ADR |
| CI/CD / Deployment / MCP / Betrieb | `devops` | Workflows, Plesk-Konfiguration, Linter, Secrets | Infrastruktur-Aeenderungen |
| DSGVO / Secrets / Security / GitHub-Haertung | `security` | Datenschutz, Authentifizierung, Scanning | Compliance-Audit |
| Code Review / Tests / Accessibility / Performance | `qa` | PR-Review, Test-Coverage, A11y-Audit, Lighthouse | Validierung und Gate-Pruefung |

Faehigkeits-spezifische Agenten fuer aktive Services:
- `website-frontend` — `apps/website/` (React 19)
- `api-fastapi` — `apps/api/` (FastAPI)
- `games-babylon` — `apps/babylon-game/` (Babylon.js)
- `crm-drupal-civicrm` — `apps/crm/` (Drupal 10)
- `forum-phpbb` — `apps/forum/` (phpBB)
- `automation-n8n` — `automation/n8n/` (nur Migrations-/Inventarisierung)

### Kopilot-spezifische Einstiegspunkte

Die folgenden Agenten bleiben aktiv unter `.github/agents/` laut `.github/ai-registry.json`:

**Core-Rollen:**
- `.github/agents/task-planner.agent.md` — Planung und Analyse
- `.github/agents/developer.agent.md` — Implementierung
- `.github/agents/devops-expert.agent.md` — Infrastruktur
- `.github/agents/security-reviewer.agent.md` — Sicherheit
- `.github/agents/qa-reviewer.agent.md` — Qualitaet

**Service-Spezialisten:**
- `.github/agents/website-frontend.agent.md`
- `.github/agents/api-fastapi.agent.md`
- `.github/agents/crm-drupal-civicrm.agent.md`
- `.github/agents/automation-n8n.agent.md` (nur Inventarisierung, Migration, Cutover)
- `.github/agents/games-babylon.agent.md`
- `.github/agents/forum-phpbb.agent.md`
- `.github/agents/speckit-head-master.agent.md`

**SpecKit-Workflow-Agenten** (fuer Spec-Kit-getriebene Entwicklung):
- `.github/agents/speckit.analyze.agent.md`
- `.github/agents/speckit.checklist.agent.md`
- `.github/agents/speckit.clarify.agent.md`
- `.github/agents/speckit.constitution.agent.md`
- `.github/agents/speckit.specify.agent.md`
- `.github/agents/speckit.plan.agent.md`
- `.github/agents/speckit.tasks.agent.md`
- `.github/agents/speckit.implement.agent.md`
- `.github/agents/speckit.taskstoissues.agent.md`
- `.github/agents/speckit.git.feature.agent.md`
- `.github/agents/speckit.git.commit.agent.md`
- `.github/agents/speckit.git.validate.agent.md`
- `.github/agents/speckit.git.initialize.agent.md`
- `.github/agents/speckit.git.remote.agent.md`

Der importierte Skill `.github/skills/senior-fullstack/SKILL.md` ist nur ergaenzende Vendor-Guidance. Repository-Governance, Issue #539 und kanonische Agentenprofile haben Vorrang.

## Arbeitsregeln

- Repository first: vor Aenderungen realen Repo-, PR- und Issue-Stand lesen.
- Keine Parallelstrukturen erfinden, wenn bestehende Workflows, Skripte oder Policies den Vertrag schon definieren.
- Repository-Wahrheit und Live-Wahrheit strikt trennen: `VERIFIED_REPO != VERIFIED_LIVE`.
- Keine Secrets oder PII in Code, Logs, Markdown, Issues, PR-Kommentaren oder Artefakten.
- Keine Secretwerte ausgeben, auch nicht base64-kodiert oder als Debug-Ausgabe.
- Kein `set -x` in Secret- oder Live-Audit-Pfaden.
- Bei `.github/bsm-secret-ids.json` nur Mapping-Metadaten und Secret-IDs committen, niemals Secretwerte.
- Wenn ein Zugriff fehlt, zuerst Agents Variables, Agents Secrets, BSM, GitHub Actions und vorhandene Repo-Skripte pruefen. Erst danach `BLOCKED` dokumentieren.
- Nie im Chat nach Passwort, SSH-Key, DB-URL, Stripe-Key oder anderen produktiven Secrets fragen.

## Copilot Agents Secrets und Variables

Verfuegbare Bootstrap-Secrets koennen sein:

- `BW_ACCESS_TOKEN`
- `PLESK_KNOWN_HOSTS`
- `PLESK_SSH_PRIVATE_KEY`

Verfuegbare Agents Variables:

- `PLESK_HOST`
- `PLESK_DEPLOY_PATH`

`PLESK_HOST` nicht unnoetig im Code duplizieren.
`PLESK_DEPLOY_PATH` nie ungeprueft als Audit-Servicepfad verwenden. Der Plesk-Collector erwartet fuer Service-Pfade relative Pfade ohne fuehrenden Slash.
Der Remote User wird aus Bitwarden `staging/REMOTE_USER` bezogen. Keine zusaetzliche `PLESK_USER`-Variable verlangen, wenn dieses Mapping funktioniert.

## Live-Plesk-Audit

Die Basis aus PR #533 ist bereits gemergt. Der manuelle Live-Audit-Pfad aus PR #544 ist vorhanden. PR #546 dokumentiert, dass `VERIFIED_LIVE` bisher noch nicht vergeben wurde.

Bestehende Dateien wiederverwenden:

- `.github/workflows/plesk-readonly-audit.yml`
- `.github/workflows/plesk-live-audit.yml`
- `scripts/ops/plesk-readonly-audit.sh`
- `scripts/ops/compare-plesk-state.py`
- `config/plesk/expected-state.json`
- `tests/ops/test_plesk_readonly_audit.py`
- `tests/ops/test_plesk_vhost_detection.py`
- `tests/ops/test_plesk_live_audit_workflow.py`

Live-Audit erste Phase ausschliesslich read-only:

PREVALIDATION -> SSH CONNECTIVITY -> READ-ONLY LIVE COLLECT -> SANITIZE -> COMPARE -> STATUS SUMMARY

Verbindliche SSH-Regeln:

- `StrictHostKeyChecking=yes`
- explizites `UserKnownHostsFile`
- kein `StrictHostKeyChecking=no`
- kein automatisches `ssh-keyscan` als Vertrauensersatz
- Private Key nur temporaer, Modus 0600, Cleanup/Trap
- keine Privilege Escalation
- keine beliebigen Remote-Command-Inputs

Ohne separaten expliziten Schreibauftrag keine Deployments, Restarts, DB Writes, Migrationen, DNS-/TLS-/Cron-/User-Aenderungen, Package Upgrades, Restores oder Secret Rotations ausfuehren.

## Payment-Hardening

PR #538 ist bereits gemergt. Offene Punkte sind daher Release-/Deployment-Gates, nicht mehr Merge-Gates:

- Issue #541: Alembic DAG auf genau einen kanonischen Head bringen, historische Migrationen nicht umschreiben
- Recurring nur bei echter Stripe Subscription aktivieren, `setup_future_usage` ist keine Subscription
- `receipt_eligible` nicht pauschal TRUE ohne fachlich belegte Regel
- Outbox-Idempotency DB-seitig erzwingen
- `payment.failed` und Retries ohne Alert-/Mail-/Outbox-Duplikate
- FastAPI -> Make Consumer Contract an echte Make-Konsumentenseite anpassen
- OpenAPI-CI als separaten CI-Fix behandeln
- Security Findings analysieren, Scanner-Gates nicht abschwaechen

Kritische Payment-Integritaet bleibt in FastAPI/PostgreSQL. Make erhaelt keinen freien Schreibzugriff auf PostgreSQL-Kerntabellen.

## Make-first und n8n Retirement

Make ist die Zielplattform fuer CRM Sync, Accounting Sync, Follow-ups, Dankesmail, Error Handling, Reconciliation, Reporting, SharePoint, Slack und administrative Automationen.

Bestehende n8n-Workflows klassifizieren als:

- `MIGRATE_TO_MAKE`
- `MOVE_TO_FASTAPI`
- `RETIRE`
- `TEMPORARY_KEEP`
- `UNKNOWN`

n8n niemals blind abschalten. Vor Cutover mindestens Trigger, Input, Output, Credentials, Webhooks, DB, Redis, Proxy, DNS, Backup, Replacement, Tests, Reconciliation und Rollback pruefen.

## Slack Privacy

Keine Spender-E-Mail, Namen, Adressen, Stripe PaymentIntent IDs, vollstaendigen Stripe Payloads oder Secretwerte in Slack Alerts.
Erlaubt sind Eventtyp, Betrag, technischer Status und interne Correlation ID.

## Configuration Reliability Rule

Aenderungen an `.vscode/**`, `.devcontainer/**`, `.claude/**`, `mcp.json`, `.github/workflows/**` sowie Agent- und Copilot-Governance-Dateien muessen `npm run workspace:config:check` bestehen.

## Build und Validierung

- `npm run dev:frontend`
- `npm run dev:api`
- `npm run test:unit`
- `npm run test:api`
- `npm run quality:gates`
- `npm run governance:check`
- `npm run workspace:config:check`

Ein lokaler oder Staging-n8n-Smoke ist kein dauerhafter Zukunftsvertrag mehr. n8n-Smokes duerfen nur als Migrations-/Bestandsnachweis verwendet werden, bis der jeweilige Prozess nach Make/FastAPI migriert ist.

## Mobile Status

Fuer laengere Agentenarbeit kompakt dokumentieren:

- CURRENT HEAD
- CURRENT PR
- DONE
- IN PROGRESS
- BLOCKED
- REQUIRES OWNER ACTION
- LIVE VERIFIED
- NEXT ACTION

Keine langen Terminal-Dumps in Statusartefakten.

## Dokumentationsregel

Wenn aktive Ablaeufe, Rollen, Pfade oder Tooling geaendert werden, mindestens die betroffenen Governance-Dateien synchronisieren:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/ai-registry.json`
- `.github/instructions/copilot-workflow.md`

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure, shell commands, and other important information, read [specs/005-democracy-game-bruecken-bauen/plan.md](specs/005-democracy-game-bruecken-bauen/plan.md)

<!-- SPECKIT END -->

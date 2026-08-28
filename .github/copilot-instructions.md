# Menschlichkeit Oesterreich - Copilot Leitfaden

GitHub Copilot arbeitet in diesem Repository entlang desselben Repo-Vertrags wie Codex und Claude Code.

## Zuerst lesen

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/instructions/core/analysis-planning.instructions.md`
4. `.github/ai-registry.json`
5. `.github/instructions/core/*.instructions.md`
6. GitHub Issue #539 als kanonische Plattformentscheidung

## Repo-Identitaet

- Repository: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Main-first Workflow
- Aktive Produktpfade unter `apps/`
- Historische Root-Pfade und alte Einzelordner sind keine aktiven Entwicklungsziele.

## Kanonische Plattformarchitektur

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

## Agentenauswahl

Nutze das Rollenmodell aus `AGENTS.md`:

- `architect` fuer Architektur und Systemgrenzen
- `developer` fuer Features, Bugs, Refactorings und Tests
- `devops` fuer Workflows, Deployments, MCP und Betrieb
- `security` fuer DSGVO, Secrets und Haertung
- `qa` fuer Reviews und Quality-Gates

Copilot-spezifische Einstiegspunkte bleiben die aktiven `.github/agents/*.agent.md` laut `.github/ai-registry.json`.
Der bisherige `automation-n8n.agent.md` darf nur noch Inventarisierung, Migration, Cutover, Reconciliation und Retirement bestehender n8n-Artefakte bearbeiten. Zielimplementierungen gehoeren nach Make oder, bei transaktionskritischer Logik, nach FastAPI.

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

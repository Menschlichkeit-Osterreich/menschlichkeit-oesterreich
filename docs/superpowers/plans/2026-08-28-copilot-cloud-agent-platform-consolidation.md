# Copilot Cloud Agent Platform Consolidation Implementation Plan

> Stand: 2026-08-28
> Kanonische Architekturentscheidung: GitHub Issue #539
> Arbeits-PR: #547

## Ziel

Die bestehende Copilot-/Devcontainer-Sandbox und die zentrale Agent-Governance auf die Make-first/Plesk/Bitwarden-Zielarchitektur synchronisieren. Bestehende Plesk-Audit-Infrastruktur aus PR #533 wiederverwenden, Azure aus der Ziel-Sandbox entfernen und n8n nur noch als kontrollierte Migrationsquelle behandeln. Produktive Schreiboperationen sind nicht Teil dieses Plans.

## Verifizierter Repo-Stand

- PR #533 ist bereits gemergt und bildet die bestehende Plesk-Audit-Basis.
- PR #538 ist bereits gemergt. Offene Payment-Punkte werden als Release-/Deployment-Gates behandelt.
- Issue #539 ist die kanonische Architekturentscheidung.
- Issue #541 ist der offene Alembic-DAG-Blocker.
- `.github/workflows/plesk-live-audit.yml` existiert bereits und wird erweitert statt dupliziert.
- `.github/bsm-secret-ids.json` enthält bereits `staging/REMOTE_USER` im Profil `plesk-live-audit`.

## Task 1: Sandbox auf Zielarchitektur ausrichten

**Files:**
- Modify: `.devcontainer/devcontainer.json`
- Modify: `.devcontainer/test-setup.sh`
- Modify: `.devcontainer/setup.sh`
- Modify: `.github/workflows/copilot-setup-steps.yml`

**Änderungen:**
1. Azure CLI und Azure-spezifische Editor-Erweiterungen aus der aktiven Sandbox entfernen.
2. n8n nicht mehr als automatisch weitergeleiteten Standarddienst behandeln.
3. Keine produktive n8n-URL in der Sandbox setzen.
4. BSM/SSH-Tooling als aktive Betriebsfähigkeit beibehalten und `bws` verlässlich prüfen.
5. PostgreSQL, Redis und MariaDB nur als ephemere Testservices verwenden.
6. n8n-Validierung aus dem allgemeinen Copilot-Sandbox-Gate entfernen; Migrationsartefakte separat klassifizieren.
7. Bestehende Node-, Python-, PHP-, Composer-, Docker-, Playwright-, Prisma- und QA-Prüfungen erhalten.

## Task 2: Plesk Live Audit an neuen Secret-/Variable-Vertrag anpassen

**Files:**
- Modify: `.github/workflows/plesk-live-audit.yml`
- Modify: `.github/bsm-secret-ids.json` nur wenn zur Vertragsschärfung nötig
- Modify: `tests/ops/test_plesk_live_audit_workflow.py`
- Modify: `.github/actions/bsm-env-inject/action.yml` für temporäre Secret-Artefakt-Cleanup-Härtung

**Änderungen:**
1. `PLESK_HOST` ausschließlich aus `vars.PLESK_HOST` beziehen.
2. `REMOTE_USER` weiterhin just-in-time aus BSM `staging/REMOTE_USER` laden.
3. SSH Key und Known Hosts über bestehende BSM-Architektur beziehen, nicht loggen und temporär halten.
4. `StrictHostKeyChecking=yes` und explizites `UserKnownHostsFile` erzwingen.
5. Keine `ssh-keyscan`-Vertrauensersetzung und keine beliebigen Remote-Command-Inputs zulassen.
6. Read-only Phasen PREVALIDATION, SSH CONNECTIVITY, LIVE COLLECT, SANITIZE, COMPARE und STATUS SUMMARY beibehalten.
7. `PLESK_DEPLOY_PATH` ausdrücklich nicht als Audit-Servicepfad missbrauchen.
8. BSM-Temporärdateien sicher entfernen.
9. Statische Tests auf Host-Variable, BSM-Remote-User, Strict SSH und Secret-Grenzen erweitern.

## Task 3: Agent-Governance auf Make-first synchronisieren

**Files:**
- Modify: `.github/copilot-instructions.md`
- Modify: `CLAUDE.md`
- Modify: `.github/agents/automation-n8n.agent.md`
- Add: `docs/operations/COPILOT-CLOUD-AGENT-STATUS.md`

**Änderungen:**
1. Issue #539 als Vorrangregel aufnehmen.
2. Azure als `LEGACY_CANDIDATE`, nicht als Zielarchitektur, definieren.
3. Make als zentrale Automationsplattform definieren.
4. n8n-Agent auf Inventarisierung, Migration, Cutover, Reconciliation und Retirement begrenzen.
5. Alten permanenten `Staging n8n = autoritative Zukunft`-Smoke-Vertrag entfernen.
6. FastAPI/PostgreSQL als kritischen Payment-Transaktionskern festschreiben.
7. System-of-Record-Rollen für CiviCRM, ERPNext, Stripe, Make, SharePoint und ClickUp dokumentieren.
8. Secret- und Live-Zugriffsgrenzen des Masterprompts aufnehmen.
9. Mobile Statusdatei mit CURRENT HEAD, CURRENT PR, DONE, IN PROGRESS, BLOCKED, REQUIRES OWNER ACTION, LIVE VERIFIED und NEXT ACTION pflegen.

## Task 4: Verifikation

**Checks:**
1. GitHub Actions auf aktuellem PR-Head ausführen lassen.
2. `Copilot Setup Steps` muss ohne Startup Failure starten und Sandbox-Validierung bestehen.
3. `Workspace Configuration Reliability`, Governance-, Secret-, Security- und bestehende CI-Gates prüfen.
4. Plesk-Live-Audit nur statisch/prevalidieren, nicht automatisch gegen Produktion ausführen.
5. Keine Scanner-Gates, Branch-Protection oder Secret-Policies abschwächen.
6. Abweichungen zwischen `VERIFIED_REPO`, `VERIFIED_CONFIG` und `VERIFIED_LIVE` ausdrücklich getrennt halten.

## Nicht Teil dieses PRs

- Keine produktive Migration oder Deployment-Ausführung.
- Kein n8n-Shutdown.
- Keine Azure-Ressourcenlöschung ohne Abhängigkeitsnachweis.
- Keine produktiven DB Writes.
- Kein Secret-Rotate.
- Kein Blind-Merge von Payment-Nacharbeiten.
- Alembic-DAG-Reparatur aus #541 bleibt eigener DB-Hardening-Track.

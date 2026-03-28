# GitHub Security Audit — März 2026

**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development
**Audit-Datum:** 2026-03-25
**Auditor:** DevOps/Security-Engineer (automatisiert + manuell)
**Nächster Review:** 2026-06-25 (quartalsweise)

---

## 1. Personal Access Token (PAT) Audit

### Aktiver Token

| Eigenschaft              | Wert                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| **Token-Name**           | `claud code full`                                                |
| **Typ**                  | Fine-grained Personal Access Token                               |
| **Erstellt**             | 2026-03-25                                                       |
| **Ablauf**               | 2027-03-26                                                       |
| **Scope**                | 1 Repository + Organisation `peschull`                           |
| **GitHub Secret**        | `GH_TOKEN`                                                       |
| **Erinnerungs-Workflow** | `.github/workflows/pat-expiry-reminder.yml` (30 Tage vor Ablauf) |

### Repository-Berechtigungen (30)

| Berechtigung                           | Zugriff    | Begründung                          |
| -------------------------------------- | ---------- | ----------------------------------- |
| Actions                                | Read/Write | CI/CD Workflow-Management           |
| Administration                         | Read/Write | Repo-Settings, Branch-Protection    |
| Artifact metadata                      | Read/Write | Build-Artefakte verwalten           |
| Attestations                           | Read/Write | SLSA-Provenance, Release-Signierung |
| Code scanning alerts                   | Read/Write | CodeQL-Alert-Management             |
| Codespaces                             | Read/Write | Dev-Container-Management            |
| Codespaces lifecycle admin             | Read/Write | Codespace starten/stoppen           |
| Codespaces metadata                    | Read-only  | Codespace-Info lesen                |
| Codespaces secrets                     | Read/Write | Codespace-Secrets verwalten         |
| Commit statuses                        | Read/Write | CI-Status setzen                    |
| Contents                               | Read/Write | Code lesen/schreiben, Releases      |
| Custom properties                      | Read/Write | Repo-Metadaten                      |
| Dependabot alerts                      | Read/Write | Vulnerability-Alerts                |
| Dependabot secrets                     | Read/Write | Dependabot private Registry-Tokens  |
| Deployments                            | Read/Write | Deployment-Status                   |
| Discussions                            | Read/Write | Community-Diskussionen              |
| Environments                           | Read/Write | Environment-Secrets/-Variables      |
| Issues                                 | Read/Write | Issue-Management (PAT-Expiry etc.)  |
| Merge queues                           | Read/Write | PR-Merge-Queue                      |
| Metadata                               | Read-only  | Basis-Repo-Info (immer nötig)       |
| Pages                                  | Read/Write | GitHub Pages                        |
| Pull requests                          | Read/Write | PR-Management                       |
| Secret scanning alerts                 | Read/Write | Exposed-Secret-Alerts               |
| Secret scanning dismissal requests     | Read/Write | Alert-Dismissal                     |
| Secret scanning push protection bypass | Read/Write | Push-Protection-Override            |
| Repository security advisories         | Read/Write | Security-Advisories                 |
| Secrets                                | Read/Write | Actions-Secrets verwalten           |
| Variables                              | Read/Write | Actions-Variables verwalten         |
| Webhooks                               | Read/Write | Webhook-Konfiguration               |
| Workflows                              | Read/Write | Workflow-Dateien bearbeiten         |

### Organisations-Berechtigungen (36)

| Berechtigung                                                   | Zugriff    |
| -------------------------------------------------------------- | ---------- |
| Administration                                                 | Read/Write |
| API Insights                                                   | Read-only  |
| Blocking users                                                 | Read/Write |
| Campaigns                                                      | Read/Write |
| Copilot (agent settings, Business, metrics, content exclusion) | Read/Write |
| Custom org/repo roles                                          | Read/Write |
| Custom properties (org)                                        | Admin      |
| Codespaces (org, secrets, settings)                            | Read/Write |
| Credentials (org)                                              | Read/Write |
| Dependabot (secrets, dismissals)                               | Read/Write |
| Events                                                         | Read-only  |
| Hosted runner custom images                                    | Read/Write |
| Issue Fields, Issue Types                                      | Read/Write |
| Members                                                        | Read/Write |
| Models                                                         | Read-only  |
| Network configurations                                         | Read/Write |
| Organization announcement banners                              | Read/Write |
| Organization bypass requests (secret scanning)                 | Read/Write |
| Organization code scanning dismissals                          | Read/Write |
| Plan                                                           | Read-only  |
| Private registries                                             | Read/Write |
| Projects                                                       | Admin      |
| Secrets                                                        | Read/Write |
| Self-hosted runners                                            | Read/Write |
| Variables                                                      | Read/Write |
| Webhooks                                                       | Read/Write |

### Least-Privilege-Bewertung

**Status: AKZEPTABEL (mit Einschränkungen)**

Der Token hat breite Berechtigungen, da er für:

1. **Claude Code Automation** — erfordert Contents, Actions, PRs, Issues
2. **Admin-Operationen** — Branch-Protection, Labels, Secrets-Sync
3. **Security-Management** — Secret Scanning, Code Scanning, Dependabot
4. **Release-Signierung** — Attestations, Deployments

**Empfehlung:** Nach BSM-Migration alle CI/CD-Secrets über Bitwarden SM injizieren. PAT nur für Admin-/Cross-Repo-Operationen behalten. Langfristig: GitHub App Migration (siehe §8).

---

## 2. GitHub Secrets Inventar

### Repository Secrets (via `${{ secrets.* }}`)

| Secret                  | Workflows                                  | Quelle                    | BSM-Migration        |
| ----------------------- | ------------------------------------------ | ------------------------- | -------------------- |
| `BW_ACCESS_TOKEN`       | reusable-bsm-secrets                       | Bitwarden SM SA `sa-cicd` | — (ist BSM selbst)   |
| `GH_TOKEN`              | admin-ops, branch-protection, release-sign | GitHub PAT                | Nein (PAT bleibt)    |
| `PLESK_HOST`            | deploy-plesk                               | Manuell                   | ✅ Geplant           |
| `PLESK_PORT`            | deploy-plesk                               | Manuell                   | ✅ Geplant           |
| `PLESK_USER`            | deploy-plesk                               | Manuell                   | ✅ Geplant           |
| `PLESK_SSH_PRIVATE_KEY` | deploy-plesk                               | Manuell                   | ✅ Geplant           |
| `PLESK_KNOWN_HOSTS`     | deploy-plesk                               | Manuell                   | ✅ Geplant           |
| `STAGING_REMOTE_HOST`   | deploy-staging                             | Manuell                   | ✅ Geplant           |
| `STAGING_REMOTE_USER`   | deploy-staging                             | Manuell                   | ✅ Geplant           |
| `STAGING_REMOTE_PORT`   | deploy-staging                             | Manuell                   | ✅ Geplant           |
| `STAGING_DEPLOY_KEY`    | deploy-staging                             | Manuell                   | ✅ Geplant           |
| `STAGING_KNOWN_HOSTS`   | deploy-staging                             | Manuell                   | ✅ Geplant           |
| `CIVICRM_SITE_KEY`      | api-tests                                  | Manuell                   | ✅ Geplant           |
| `CIVICRM_API_KEY`       | api-tests                                  | Manuell                   | ✅ Geplant           |
| `JWT_SECRET`            | api-tests                                  | Manuell                   | ✅ Geplant           |
| `CODACY_API_TOKEN`      | codacy, quality                            | Codacy                    | Nein (Drittanbieter) |
| `SEMGREP_APP_TOKEN`     | semgrep                                    | Semgrep                   | Nein (Drittanbieter) |
| `N8N_ENCRYPTION_KEY`    | validate-secrets                           | n8n                       | ✅ Geplant           |
| `N8N_WEBHOOK_URL`       | validate-secrets, n8n-smoke                | n8n                       | ✅ Geplant           |
| `DB_HOST`               | db-pull, db-restore                        | Manuell                   | ✅ Geplant           |
| `DB_NAME`               | db-pull, db-restore                        | Manuell                   | ✅ Geplant           |
| `DB_USER`               | db-pull, db-restore                        | Manuell                   | ✅ Geplant           |
| `DB_PASS`               | db-pull, db-restore                        | Manuell                   | ✅ Geplant           |

### GitHub Environments

| Environment        | Secrets                                                                                   | Workflows      |
| ------------------ | ----------------------------------------------------------------------------------------- | -------------- |
| `production`       | `PLESK_SSH_PRIVATE_KEY`, `PLESK_KNOWN_HOSTS`, `PLESK_HOST`, `PLESK_USER`                  | deploy-plesk   |
| `staging`          | `STAGING_DEPLOY_KEY`, `STAGING_KNOWN_HOSTS`, `STAGING_REMOTE_HOST`, `STAGING_REMOTE_USER` | deploy-staging |
| `forum-production` | `PLESK_SSH_KEY`, `PLESK_KNOWN_HOSTS`, `PLESK_HOST`, `PLESK_USER`                          | deploy-forum   |

### Repository Variables (via `${{ vars.* }}`)

| Variable              | Wert                            | Verwendung            |
| --------------------- | ------------------------------- | --------------------- |
| `PLESK_BASE_PATH`     | `/var/www/vhosts/...`           | Deploy-Pfade          |
| `PLESK_FRONTEND_PATH` | `httpdocs`                      | Frontend-Deploy       |
| `PLESK_API_PATH`      | `subdomains/api/httpdocs`       | API-Deploy            |
| `PLESK_CRM_PATH`      | `subdomains/crm/httpdocs`       | CRM-Deploy            |
| `PLESK_GAMES_PATH`    | `subdomains/games/httpdocs`     | Games-Deploy          |
| `MAIN_DOMAIN`         | `menschlichkeit-oesterreich.at` | Domain-Config         |
| `BSM_*` (28 Einträge) | Bitwarden UUID                  | BSM Secret-ID-Mapping |

---

## 3. Workflow-Permissions-Audit

### Token-Strategie pro Workflow

| Workflow                | Token-Typ            | `permissions:`                         | Bewertung                 |
| ----------------------- | -------------------- | -------------------------------------- | ------------------------- |
| ci.yml                  | `GITHUB_TOKEN`       | `contents: read`                       | ✅ Minimal                |
| deploy-plesk.yml        | `GITHUB_TOKEN` + BSM | `contents: read`                       | ✅ Minimal                |
| deploy-staging.yml      | `GITHUB_TOKEN` + BSM | `contents: read`                       | ✅ Minimal                |
| api-tests.yml           | `GITHUB_TOKEN` + BSM | `contents: read`                       | ✅ Minimal                |
| pat-expiry-reminder.yml | `GITHUB_TOKEN`       | `issues: write`                        | ✅ Minimal                |
| validate-secrets.yml    | `GITHUB_TOKEN`       | `contents: read`                       | ✅ Minimal                |
| branch-protection.yml   | `GH_TOKEN` (PAT)     | `contents: write`                      | ⚠️ PAT nötig (Admin)      |
| release-sign.yml        | `GH_TOKEN` (PAT)     | `contents: write, attestations: write` | ⚠️ PAT nötig (Signierung) |
| codeql.yml              | `GITHUB_TOKEN`       | `security-events: write`               | ✅ Minimal                |
| gitleaks.yml            | `GITHUB_TOKEN`       | `contents: read`                       | ✅ Minimal                |

**Ergebnis:** 42 von 44 Workflows nutzen `GITHUB_TOKEN` (minimal). Nur 2 Workflows benötigen den PAT.

---

## 4. Bitwarden Secrets Manager (BSM) Integration

### Status

| Komponente                      | Status                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| `secrets.manifest.json`         | ✅ 44 Secrets definiert, 10 Service Accounts                          |
| EU-Vault (`vault.bitwarden.eu`) | ✅ Konfiguriert                                                       |
| Reusable Workflow               | ✅ `.github/workflows/reusable-bsm-secrets.yml`                       |
| UUID-Mapping                    | ⏳ `.github/bsm-secret-ids.json` (Template erstellt, UUIDs eintragen) |
| `BW_ACCESS_TOKEN` Secret        | ⏳ In GitHub Repository Settings anlegen                              |
| deploy-plesk Integration        | ✅ BSM-Job hinzugefuegt                                               |
| deploy-staging Integration      | ✅ BSM-Job hinzugefuegt                                               |
| api-tests Integration           | ✅ BSM-Job hinzugefuegt                                               |
| deploy-forum Integration        | ✅ BSM-Job hinzugefuegt                                               |

### BSM-Profile

| Profil              | Secrets                          | Service Account   |
| ------------------- | -------------------------------- | ----------------- |
| `deploy-production` | 7 (SSH, Host, DB, API-Token)     | `sa-cicd`         |
| `deploy-staging`    | 5 (SSH, Host, Staging)           | `sa-cicd`         |
| `deploy-forum`      | 4 (SSH, Known Hosts, Host, User) | `sa-cicd`         |
| `api-tests`         | 4 (CiviCRM, JWT, Webhook)        | `sa-api-dev`      |
| `n8n-automation`    | 5 (Encryption, DB, Redis, API)   | `sa-n8n-dev`      |
| `openclaw`          | 4 (OpenAI, GitHub, DB, Redis)    | `sa-openclaw-dev` |
| `infra`             | 4 (Postgres, SSH, S3)            | `sa-infra-prod`   |

---

## 5. Security Features Status

| Feature                      | Status   | Konfiguration                        |
| ---------------------------- | -------- | ------------------------------------ |
| **Secret Scanning**          | ✅ Aktiv | Push-Protection aktiviert            |
| **Gitleaks**                 | ✅ Aktiv | Pre-commit + CI-Gate                 |
| **CodeQL**                   | ✅ Aktiv | JavaScript/TypeScript, Python        |
| **Dependabot**               | ✅ Aktiv | 6 Ökosysteme, wöchentlich            |
| **Branch Protection (main)** | ✅ Aktiv | PR-Review, Status-Checks, Signierung |
| **Trivy**                    | ✅ Aktiv | Container/Image-Scanning             |
| **Semgrep**                  | ✅ Aktiv | SAST                                 |
| **OWASP ZAP**                | ✅ Aktiv | Baseline-Scan                        |
| **OSV Scanner**              | ✅ Aktiv | OSS-Vulnerability-Scanning           |
| **OpenSSF Scorecard**        | ✅ Aktiv | Supply-Chain-Security                |
| **SBOM Generation**          | ✅ Aktiv | Software Bill of Materials           |
| **Dependency Review**        | ✅ Aktiv | PR-blockierend                       |

---

## 6. Kritische Findings

### 6.1 KRITISCH: Bitwarden MCP `.env` mit Live-Credentials

**Datei:** `mcp-servers/bitwarden-cli/.env`
**Inhalt:** `BW_CLIENTID`, `BW_CLIENTSECRET`, `BW_PASSWORD` — Live-Vault-Zugangsdaten
**Status:** In `.gitignore` (nicht committed), aber lokal vorhanden
**Empfehlung:** Credentials rotieren, Datei nach Nutzung entfernen, Runtime-Injection verwenden

### 6.2 MITTEL: Test-Credentials in `_live-deploy-head/.env.test`

**Inhalt:** Vorhersagbare Test-Passwörter (`TestSysAdmin2025!` etc.)
**Status:** In `.gitignore` (nicht committed)
**Empfehlung:** Stärkere Test-Passwörter generieren, nicht in gemeinsamen Verzeichnissen speichern

### 6.3 INFO: Historischer Vorfall (März 2026)

**Dokumentiert in:** `docs/security/incidents/2026-03-secret-exposure-response.md`
**Status:** Behoben, alle Credentials rotiert, Gitleaks verschärft

---

## 7. Empfehlungen

### Sofort (P0)

- [ ] `BW_ACCESS_TOKEN` als GitHub Repository Secret anlegen (Service Account `sa-cicd`)
- [ ] BSM-UUIDs in `.github/bsm-secret-ids.json` eintragen
- [ ] BSM-UUIDs als GitHub Repository Variables (`BSM_*`) anlegen
- [ ] `mcp-servers/bitwarden-cli/.env` — Credentials rotieren

### Kurzfristig (P1, 30 Tage)

- [ ] Alle Deployment-Secrets über BSM migrieren (siehe `BSM-MIGRATION-CHECKLIST.md`)
- [ ] GitHub Secrets nach BSM-Verifikation entfernen
- [ ] Test-Credentials in `_live-deploy-head/.env.test` stärken
- [ ] Quartals-Review-Termin im Kalender (2026-06-25)

### Langfristig (P2, 6 Monate)

- [ ] GitHub App statt PAT (siehe §8)
- [ ] OIDC Federation für Cloud-Deployments
- [ ] Automated Secret Rotation via BSM API

---

## 8. GitHub App Migration (Roadmap)

| Kriterium    | PAT (aktuell)        | GitHub App (Ziel)           |
| ------------ | -------------------- | --------------------------- |
| Ablauf       | 1 Jahr               | Kein Ablauf                 |
| Rechte       | User-basiert (breit) | Repo/Org-spezifisch         |
| Audit        | PAT-Name in Logs     | Jede Aktion einzeln geloggt |
| Rate-Limits  | 5.000/h              | 15.000/h                    |
| Installation | Manuell              | Org-weit automatisch        |

**Timeline:** Q3 2026 — GitHub App erstellen, Q4 2026 — Workflows migrieren, Q1 2027 — PAT auslaufen lassen

---

**Nächster Audit:** 2026-06-25
**Verantwortlich:** Peter Schuller (peschull)

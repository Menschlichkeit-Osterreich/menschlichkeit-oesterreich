# Go / No-Go Checkliste – Live-Gang Menschlichkeit Österreich

**Stand:** 2026-04-01
**Basis:** `reports/repository-live-stabilization-assessment-2026-03-31.md`, `CLAUDE.md`, `README.md`, `README_DEPLOY.md`, `.github/workflows/deploy-plesk.yml`, `SECURITY.md`, `secrets.manifest.json`, `PRODUCTION-READINESS-REPORT.json`, `reports/CRITICAL-TODOS.md`
**Erstellt von:** Claude Code (automatisierte Analyse)
**Empfehlung:** ⚠️ **BEDINGT GO** — Blocker aus Abschnitt 2 müssen vor dem ersten Produktionsdeploy verifiziert sein.

---

## Legende

| Symbol | Bedeutung                                                  |
| ------ | ---------------------------------------------------------- |
| ✅     | Erledigt / production-ready                                |
| 🔴     | **BLOCKER** – muss vor Live-Gang gelöst sein               |
| 🟠     | **RISIKO** – sollte adressiert werden, kein harter Blocker |
| 🔵     | **NICE-TO-HAVE** – kann nach Live-Gang                     |

---

## 1. DONE – Production-ready

### 1.1 Deploy-Infrastruktur

- ✅ **Deploy-Workflow** `.github/workflows/deploy-plesk.yml` vollständig vorhanden
  - SSH-Verbindung mit `PLESK_HOST`, `PLESK_USER`, `PLESK_SSH_PRIVATE_KEY`, `PLESK_KNOWN_HOSTS`
  - `StrictHostKeyChecking yes` — keine unsicheren SSH-Verbindungen
  - Build-Artefakt-Upload/-Download über `actions/upload-artifact`
  - Separate Jobs für Frontend (Vite), Games (Babylon.js), API (FastAPI), CRM (Drupal + CiviCRM)
  - Post-Deploy Healthchecks für alle Services
  - Concurrency-Guard gegen parallele Produktionsdeploys
  - `workflow_dispatch` mit Dry-Run-Modus

- ✅ **Zielpfade dokumentiert** in `README_DEPLOY.md`
  - Frontend: `httpdocs`
  - API: `subdomains/api/httpdocs`
  - CRM-Portal: `subdomains/crm/httpdocs`
  - CRM-Native: `subdomains/crm/httpdocs/native`
  - Games: `subdomains/games/httpdocs`

- ✅ **Health-Vertrag standardisiert**
  - Kanonisch: `/healthz` (Liveness) und `/readyz` (Readiness)
  - `/health` nur noch Legacy-Alias
  - `README.md` und `README_DEPLOY.md` konsistent

- ✅ **Secrets-Namespace `PLESK_*`** in `README_DEPLOY.md` als aktiver Vertrag dokumentiert
  - Veraltete Namen `PLSK_*` und `PLESK_REMOTE_PATH` explizit als nicht mehr gültig markiert

- ✅ **`deploy:production`** in `package.json` verweist korrekt auf GitHub Actions

- ✅ **Root-Klassifikation** in `README.md` dokumentiert (aktiv / legacy-mirror / generated / vendor)

### 1.2 Security-Toolchain

- ✅ **CodeQL** (SAST, JavaScript + Python) – bei jedem Push
- ✅ **Semgrep** (Pattern-Analyse) – bei jedem Push
- ✅ **Trivy** (`trivy.yaml` vorhanden) – täglich, Vuln + Secret + Config + License
- ✅ **Gitleaks** (`gitleaks.toml` vorhanden) – bei jedem Push
- ✅ **OSV Scanner** – bei jedem Push
- ✅ **Dependabot** – täglich
- ✅ **OpenSSF Scorecard** – wöchentlich
- ✅ **OWASP ZAP Baseline** – Workflow vorhanden (`owasp-zap-baseline.yml`)
- ✅ **Secret Push Protection** – laut SECURITY.md aktiviert
- ✅ **SECURITY.md** vollständig: Scope, CVSS-Bewertung, Kontakte, Disclosure-Prozess, DSGVO-Referenzen

### 1.3 Secrets-Dokumentation

- ✅ **`secrets.manifest.json`** vorhanden: 40 Secrets dokumentiert, 26 als `required:true` markiert
  - Alle Pflicht-Secrets mit `bsm_key`, `env_var`, `services`, `environments` und `rotate_days`
  - Bitwarden Secrets Manager (BSM) als Provider eingerichtet
  - SEPA-Credentials (`SEPA_CREDITOR_IBAN`, `SEPA_CREDITOR_ID`, `SEPA_CREDITOR_BIC`) nur für `production`
  - Reusable Workflow `reusable-bsm-secrets.yml` für BSM-Injection vorhanden

### 1.4 Services (Struktur)

- ✅ **`apps/website/`** – React 19 + Vite, Build-Script `build:prerender` im Workflow referenziert
- ✅ **`apps/api/`** – FastAPI, `openapi.yaml` vorhanden, Tests-Verzeichnis vorhanden
- ✅ **`apps/crm/`** – Drupal 10 + CiviCRM, `composer.json` vorhanden, Drupal-Bootstrap-Check im Workflow
- ✅ **`apps/babylon-game/`** – Next.js + Babylon.js, eigener Build-Job im Workflow
- ✅ **`CLAUDE.md` und `README.md`** konsistent: Ports, Pfade, Branch-Modell

---

## 2. BLOCKER – Müssen vor Live-Gang gelöst sein

### 2.1 Falsche Repo-Identität in `secrets.manifest.json`

🔴 **`secrets.manifest.json` Zeile 5 referenziert das alte Repository:**

```json
"repository": "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
```

**Muss sein:** `"Menschlichkeit-Osterreich/menschlichkeit-oesterreich"`
**Risiko:** BSM-Integrationen, Secret-Rotationen und CI-Prozesse können auf die falsche Repo-Identität zeigen.

**Fix:** In `secrets.manifest.json` Zeile 5 korrigieren.

---

### 2.2 Falsche Repo-Identität in `gitleaks.toml`

🔴 **`gitleaks.toml` Titel und Pfad-Allowlists referenzieren das alte Repo:**

```toml
title = "Gitleaks Config - menschlichkeit-oesterreich-development"
```

Pfad-Allowlists in `gitleaks.toml` nennen explizit `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/` — diese sind Legacy-Mirror-Pfade, aber der Titel zeigt auf die falsche Repo-Identität.
**Risiko:** Secret-Scans, Audit-Reports und Advisory-Prozesse können mit falscher Quelle getaggt sein.

**Fix:** `title` in `gitleaks.toml` auf `"Gitleaks Config - menschlichkeit-oesterreich"` korrigieren.

---

### 2.3 Deploy-Skripte in `package.json` zeigen auf lokalen Fallback (nicht GitHub Actions)

🔴 **`package.json` Skripte `deploy:all`, `deploy:crm`, `deploy:api`, `deploy:frontend`** rufen `scripts/deploy-to-plesk.ps1` auf — ein lokales PowerShell-Skript, das historisch auf veraltete Pfade (`api.menschlichkeit-oesterreich.at/`, `web/*`, `frontend/`) ausgerichtet war.
**Risiko:** Maintainer können `npm run deploy:all` aufrufen und glauben, einen Produktionsdeploy auszulösen — tatsächlich läuft ein veralteter lokaler Fallback. Nur `deploy:production` verweist korrekt auf GitHub Actions.

**Fix-Optionen:**

- Option A: `deploy:all/crm/api/frontend` auf denselben Hinweis wie `deploy:production` umstellen
- Option B: Skripte in `package.json` auf `-DryRun` beschränken und mit Warnung versehen, dass Produktionsdeploy nur via GitHub Actions läuft

---

### 2.4 API-Healthcheck im Workflow ist nicht blockierend

🔴 **Im Workflow ist der API-Healthcheck als Warnung, nicht als Fehler konfiguriert:**

```bash
[[ "${HTTP}" =~ ^[23] ]] || echo "⚠️ API Healthcheck: ${HTTP} (API benötigt ggf. Neustart via Plesk)"
```

Im Gegensatz zu Frontend, CRM und Games (alle mit `exit 1` bei Fehler) würde ein defektes API-Deployment **nicht das Deployment blockieren**.
**Risiko:** Stilles Durchkommen eines defekten API-Deploys in Produktion.

**Fix:** API-Healthcheck auf `exit 1` bei Fehlschlag umstellen — oder explizit als bekannte Einschränkung (Plesk-Neustart nötig) dokumentieren mit manuellem Post-Deploy-Schritt.

---

### 2.5 PostgreSQL-Verfügbarkeit verifizieren (kritischer CRITICAL-TODO aus Okt 2025)

🔴 **`reports/CRITICAL-TODOS.md` (Stand 2025-10-18) meldet PostgreSQL als nicht erreichbar** (`Connection refused Port 5432`).
Dieser Report ist ~5 Monate alt — es ist unklar, ob der Zustand behoben wurde.
**Risiko:** FastAPI-Backend, Metriken-Router und Dashboard-Features sind ohne DB vollständig nicht funktionsfähig.

**Verifikation vor Go-Live:**

```bash
cd apps/api && python -m pytest tests -q  # API-Tests müssen grün sein
curl https://api.menschlichkeit-oesterreich.at/readyz  # muss 200 zurückgeben
```

---

### 2.6 Alle 4 Pflicht-SSH-Secrets in GitHub hinterlegt?

🔴 **Der Workflow bricht ab, wenn `PLESK_HOST`, `PLESK_USER`, `PLESK_SSH_PRIVATE_KEY` oder `PLESK_KNOWN_HOSTS` fehlen.**
Der Workflow prüft dies nur bei `workflow_dispatch`, nicht bei automatischem Push auf `main`.

**Verifikation:** GitHub → Repository Settings → Secrets → Actions → alle 4 Secrets bestätigen.

---

## 3. RISIKEN – Sollten adressiert werden, kein harter Blocker

### 3.1 SECURITY.md referenziert Legacy-Pfad

🟠 `SECURITY.md` Zeile 163 verweist auf:

```
[Security API Endpoints](api.menschlichkeit-oesterreich.at/app/routers/security.py)
```

Dies ist ein Legacy-Mirror-Pfad, nicht der aktive API-Code unter `apps/api/`.
**Risiko:** Security-Team arbeitet mit falscher Code-Referenz beim Incident Response.

---

### 3.2 `secrets.manifest.json` Organisation falsch

🟠 `"organization": "peschull"` — dies ist vermutlich ein persönliches GitHub-Handle, nicht die Organisation `Menschlichkeit-Osterreich`.
**Risiko:** BSM-Service-Accounts können bei der falschen Organisation hinterlegt sein.

---

### 3.3 Forum und n8n nicht in `deploy-plesk.yml`

🟠 **`apps/forum/` (phpBB)** hat einen eigenen Workflow (`deploy-forum.yml`), ist aber **nicht** im zentralen `deploy-plesk.yml` enthalten.
**`automation/n8n/`** ist ebenfalls nicht im zentralen Deploy-Workflow.
**Risiko:** Inkonsistenter Release-Prozess; Forum und n8n können aus dem Sync fallen.

---

### 3.4 CRM-Native-Deploy setzt `composer` und `drush` auf Plesk voraus

🟠 Der Workflow prüft `command -v composer >/dev/null` und fährt fort — falls `composer` fehlt, bricht der Drupal-Build ab.
`drush` wird mit `[ -x vendor/bin/drush ]` geprüft; wenn Drupal bootstrap nicht erfolgreich ist, werden `updatedb/cim/cr` übersprungen (mit Warnung).
**Risiko:** Stilles Auslassen von Datenbankmigrationen und Config-Importen bei schlechtem Drupal-Zustand.

**Empfehlung:** Vor erstem Live-Gang manuell bestätigen, dass Drupal-Bootstrap auf dem Zielserver funktioniert.

---

### 3.5 `BW_ACCESS_TOKEN` optional — BSM-Injection kann lautlos wegfallen

🟠 Der `bsm-secrets`-Job hat `if: ${{ secrets.BW_ACCESS_TOKEN != '' }}` — wenn das Token fehlt, läuft der Deploy ohne BSM-Injection durch.
**Risiko:** API-Secrets (DB, JWT, Stripe usw.) könnten bei einem Deploy fehlen, wenn BSM nicht konfiguriert ist.

---

### 3.6 Monitoring-Doku stellenweise noch mit alten Health-Endpunkten

🟠 Laut Stabilisierungs-Assessment verweisen Teile von `docs/operations/monitoring.md` und `docs/monitoring.md` noch auf `/health` oder `/api/health`.
**Risiko:** Monitoring-Dashboards oder Alerting können den falschen Endpunkt überwachen.

---

### 3.7 PRODUCTION-READINESS-REPORT.json veraltet

🟠 Der Report ist vom **2025-09-28** und war zum damaligen Zeitpunkt mit 100% für alle Services bewertet.
Er spiegelt nicht den aktuellen Repo-Zustand wider (Monorepo-Umstrukturierung, Health-Vertrag-Änderungen, etc.).
**Risiko:** Falsches Vertrauen in einen Report, der möglicherweise nicht mehr aktuell ist.

---

## 4. NICE-TO-HAVE – Kann nach Live-Gang

- 🔵 **Legacy-Mirror-Trees** (`api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `new/`, `web/`) explizit mit `LEGACY.md` oder `ARCHIVED.md` markieren
- 🔵 **Doppelte Ops-Dokumentation** zusammenführen: `docs/monitoring.md` und `docs/operations/monitoring.md` auf einen kanonischen Einstieg reduzieren
- 🔵 **Security-Hardening-TODOs** (`docs/security/hardening.md`) in echtes Backlog mit Ownern und Fristen überführen
- 🔵 **Dependency-Governance** je Stack (`npm`, `pip`, `composer`) mit Verantwortlichkeit und Review-Pfad dokumentieren
- 🔵 **Forum- und n8n-Deploy** in zentralen Workflow integrieren
- 🔵 **PRODUCTION-READINESS-REPORT.json** aktualisieren oder durch aktuellen Bericht ersetzen
- 🔵 **`logging@`-Mailbox** archivieren (war laut CRITICAL-TODOS.md Okt 2025 bei 79% Kapazität — aktuellen Stand prüfen)
- 🔵 **Staging-Workflow** (`deploy-staging.yml`) auf Parität mit `deploy-plesk.yml` bringen
- 🔵 **OpenClaw** (`openclaw-system/`) in Produktions-Health-Monitoring aufnehmen, wenn produktiv

---

## 5. Security-Kurzanalyse

| Bereich                      | Status                       | Hinweis                                                   |
| ---------------------------- | ---------------------------- | --------------------------------------------------------- |
| SAST (CodeQL, Semgrep)       | ✅ Konfiguriert              | Workflows vorhanden, SARIF-Upload aktiviert               |
| SCA (Trivy, OSV, Dependabot) | ✅ Konfiguriert              | `trivy.yaml` vorhanden, täglicher Scan                    |
| Secret Scanning (Gitleaks)   | ⚠️ Titel falsch              | Funktional, aber Repo-Identität muss korrigiert werden    |
| Push Protection              | ✅ Aktiviert                 | Laut SECURITY.md                                          |
| DSGVO / PII                  | ✅ Dokumentiert              | `docs/privacy/`, PII-Sanitizer-Tests vorhanden            |
| Incident Response            | ✅ Prozess definiert         | SECURITY.md v2.1 (Stand 2026-03-08)                       |
| Vulnerability Reporting      | ✅ GitHub Private Advisories | Korrekte neue Repo-URL in SECURITY.md                     |
| Secrets-Rotation             | ✅ Dokumentiert              | 90-Tage-Zyklus, `secrets.manifest.json` mit `rotate_days` |
| SSH-Verbindung (Workflow)    | ✅ Sicher                    | `StrictHostKeyChecking yes`, `known_hosts` aus Secret     |

---

## 6. Environment-Variablen – Überblick

### Pflicht-Secrets für Produktion (aus `secrets.manifest.json`)

| Variable                    | Service  | Sensitive     |
| --------------------------- | -------- | ------------- |
| `DATABASE_URL`              | api      | ✅            |
| `JWT_SECRET_KEY`            | api      | ✅            |
| `MOE_API_TOKEN`             | api      | ✅            |
| `N8N_WEBHOOK_SECRET`        | api      | ✅            |
| `CIVICRM_SITE_KEY`          | api      | ✅            |
| `CIVICRM_API_KEY`           | api      | ✅            |
| `MAIL_PASSWORD`             | api      | ✅            |
| `STRIPE_SECRET_KEY`         | api      | ✅            |
| `STRIPE_WEBHOOK_SECRET`     | api      | ✅            |
| `SEPA_CREDITOR_IBAN`        | api      | ✅ (nur prod) |
| `SEPA_CREDITOR_ID`          | api      | ✅ (nur prod) |
| `SEPA_CREDITOR_BIC`         | api      | ✅ (nur prod) |
| `N8N_ENCRYPTION_KEY`        | n8n      | ✅            |
| `N8N_USER` / `N8N_PASSWORD` | n8n      | ✅            |
| `OC_OPENAI_API_KEY`         | openclaw | ✅            |
| `OC_GITHUB_TOKEN`           | openclaw | ✅            |

### GitHub Actions Secrets (Pflicht für Deploy-Workflow)

| Secret                  | Zweck                                                |
| ----------------------- | ---------------------------------------------------- |
| `PLESK_HOST`            | SSH-Zielhost                                         |
| `PLESK_USER`            | SSH-Benutzer                                         |
| `PLESK_SSH_PRIVATE_KEY` | SSH-Schlüssel                                        |
| `PLESK_KNOWN_HOSTS`     | Host-Fingerprint-Verifikation                        |
| `BW_ACCESS_TOKEN`       | Bitwarden Secrets Manager (optional, aber empfohlen) |

### Optionale Repository-Variablen (mit Defaults)

| Variable                | Default                                                  |
| ----------------------- | -------------------------------------------------------- |
| `PLESK_PORT`            | `22`                                                     |
| `PLESK_BASE_PATH`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs` |
| `PLESK_FRONTEND_PATH`   | `httpdocs`                                               |
| `PLESK_API_PATH`        | `subdomains/api/httpdocs`                                |
| `PLESK_CRM_PATH`        | `subdomains/crm/httpdocs`                                |
| `PLESK_CRM_NATIVE_PATH` | `subdomains/crm/httpdocs/native`                         |
| `PLESK_GAMES_PATH`      | `subdomains/games/httpdocs`                              |
| `MAIN_DOMAIN`           | `menschlichkeit-oesterreich.at`                          |

---

## 7. Deploy-Workflow-Bewertung (`deploy-plesk.yml`)

| Kriterium                  | Status | Notiz                                                 |
| -------------------------- | ------ | ----------------------------------------------------- |
| Branch-Schutz (nur `main`) | ✅     | Hartcodiert + Prüfschritt                             |
| Concurrency-Guard          | ✅     | `cancel-in-progress: false`                           |
| Dry-Run-Modus              | ✅     | `workflow_dispatch` mit Input                         |
| Artefakt-Versionierung     | ✅     | Nach `github.sha` benannt                             |
| SSH-Sicherheit             | ✅     | `StrictHostKeyChecking yes`, `known_hosts` aus Secret |
| Frontend-Healthcheck       | ✅     | `exit 1` bei Fehler                                   |
| CRM-Healthcheck            | ✅     | `exit 1` bei Fehler                                   |
| Games-Healthcheck          | ✅     | `exit 1` bei Fehler                                   |
| **API-Healthcheck**        | 🟠     | Nur Warnung, kein `exit 1`                            |
| Source-Map-Bereinigung     | ✅     | `find ... -name "*.map" -delete` vor Deploy           |
| Deployment-Summary         | ✅     | GitHub Step Summary mit allen URLs                    |
| BSM-Integration            | ✅     | Optional, Reusable Workflow                           |
| Drupal-Bootstrap-Check     | ✅     | Conditional `drush` Execution                         |
| `composer` auf Plesk       | 🟠     | Vorausgesetzt, nicht garantiert                       |

---

## 8. Zusammenfassung und Empfehlung

**6 BLOCKER** müssen vor dem ersten Produktionsdeploy abgehakt sein:

| #   | Blocker                                                           | Aufwand  |
| --- | ----------------------------------------------------------------- | -------- |
| B1  | `secrets.manifest.json`: Repo-Identität korrigieren               | 5 min    |
| B2  | `gitleaks.toml`: Titel korrigieren                                | 2 min    |
| B3  | `package.json`: `deploy:*`-Skripte auf Fallback-Warnung umstellen | 15 min   |
| B4  | API-Healthcheck im Workflow auf `exit 1` oder explizites Handling | 10 min   |
| B5  | PostgreSQL-Verfügbarkeit auf Produktionsserver verifizieren       | variabel |
| B6  | Alle 4 SSH-Secrets in GitHub Actions bestätigen                   | 10 min   |

**Empfehlung:** Nach Abarbeitung der 6 Blocker ist das Repository strukturell bereit für den Live-Gang. Die Risiken aus Abschnitt 3 sind bekannt und vertretbar für einen kontrollierten Erststart mit anschließender Stabilisierungsphase.

---

_Erstellt: 2026-04-01 | Nächste Überprüfung: vor nächstem Major-Deploy oder auf Anfrage_

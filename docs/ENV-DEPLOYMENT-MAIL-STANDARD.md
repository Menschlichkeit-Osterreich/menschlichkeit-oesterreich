# 🌐 Menschlichkeit Österreich — ENV, Deployment & Mail (Schreibschutz-Standard)

**Version:** 1.1.0  
**Gültig ab:** 2025-10-18  
**Review:** quartalsweise (Board & Tech Lead)  
**Änderungsrechte:** Nur via Pull Request mit Review gemaess operativer Ownership in `.github/CODEOWNERS`.

---

## 0) Zweck & Nicht-verhandelbare Leitlinien

Dieses Dokument **fixiert verbindlich**:

1. Umgang mit **Umgebungsvariablen** (lokal, Beispiel, Vault)
2. **Deployment-Ziele** (Subdomains, Plesk-Pfade, SSH)
3. **Projekt-Mailadressen** (bestehend + im Repo vorgesehen "noch anzulegen")

> **Schreibschutz:** Dieses Dokument darf nicht gelöscht/verschoben/umbenannt werden. Änderungen nur per PR mit Review gemaess `.github/CODEOWNERS`.

---

## 1) ENV-Standardisierung (Quelle der Wahrheit)

- **`.env`** → **lokal**, niemals commiten (in `.gitignore`). Enthält echte Werte.
- **`.env.example`** → **zentrale Masterliste** aller Keys (Platzhalter, kommentiert), **committen**.
- **`.env.vault`** → verschlüsselte Team-/CI-Quelle via `dotenv-vault` (commitbar, aber Secrets verschlüsselt).
- **Prefix-Regel:**
  - Frontend (Vite): **nur** Variablen mit `VITE_` gelangen ins Bundle.
  - Backend/Worker: keine `VITE_`-Variablen, Secrets bleiben serverseitig.
- **Laden der ENV:**
  - Node/TS: `import 'dotenv/config'`
  - Python/FastAPI: `from dotenv import load_dotenv; load_dotenv()`
  - Drupal/CiviCRM: via Server-ENV/Settings.
- **Verbote:** Commits mit Klartext-Secrets; ENV in Issues/PRs; Kopien von `.env`.

**Pflichtaktionen (einmalig / bei Änderungen):**

```bash
# Vault initialisieren (Repo-Root)
npx dotenv-vault new

# Lokale .env pflegen und in Vault pushen
npx dotenv-vault push

# weitere Umgebungen
npx dotenv-vault environments add production
npx dotenv-vault push production
```

---

## 2) Deployment-Standard (Plesk, SSH, Pfade)

**Basis-SSH (.env.example):**

```ini
SSH_HOST=5.183.217.146
SSH_PORT=22
SSH_USER=<<plesk-shell-user>>
SSH_KEY=C:/Users/<<NAME>>/.ssh/id_ed25519
REMOTE_BASE=/var/www/vhosts/menschlichkeit-oesterreich.at
```

**Fixierte Remote-Zielpfade (relativ zu `REMOTE_BASE`):**

| Site       | Subdomain                                | Remote-Pfad                      |
| ---------- | ---------------------------------------- | -------------------------------- |
| Root       | menschlichkeit-oesterreich.at            | `httpdocs`                       |
| Admin Stg  | admin.stg.menschlichkeit-oesterreich.at  | `subdomains/admin.stg/httpdocs`  |
| Analytics  | analytics.menschlichkeit-oesterreich.at  | `subdomains/analytics/httpdocs`  |
| API Stg    | api.stg.menschlichkeit-oesterreich.at    | `subdomains/api.stg/httpdocs`    |
| Consent    | consent.menschlichkeit-oesterreich.at    | `subdomains/consent/httpdocs`    |
| CRM        | crm.menschlichkeit-oesterreich.at        | `subdomains/crm/httpdocs`        |
| Docs       | docs.menschlichkeit-oesterreich.at       | `subdomains/docs/httpdocs`       |
| Forum      | forum.menschlichkeit-oesterreich.at      | `subdomains/forum/httpdocs`      |
| Games      | games.menschlichkeit-oesterreich.at      | `subdomains/games/httpdocs`      |
| Grafana    | grafana.menschlichkeit-oesterreich.at    | `subdomains/grafana/httpdocs`    |
| Hooks      | hooks.menschlichkeit-oesterreich.at      | `subdomains/hooks/httpdocs`      |
| IDP        | idp.menschlichkeit-oesterreich.at        | `subdomains/idp/httpdocs`        |
| Logs       | logs.menschlichkeit-oesterreich.at       | `subdomains/logs/httpdocs`       |
| Media      | media.menschlichkeit-oesterreich.at      | `subdomains/media/httpdocs`      |
| n8n        | n8n.menschlichkeit-oesterreich.at        | `subdomains/n8n/httpdocs`        |
| Newsletter | newsletter.menschlichkeit-oesterreich.at | `subdomains/newsletter/httpdocs` |
| S3         | s3.menschlichkeit-oesterreich.at         | `subdomains/s3/httpdocs`         |
| Status     | status.menschlichkeit-oesterreich.at     | `subdomains/status/httpdocs`     |
| Support    | support.menschlichkeit-oesterreich.at    | `subdomains/support/httpdocs`    |
| Votes      | votes.menschlichkeit-oesterreich.at      | `subdomains/vote/httpdocs`       |

> **Hinweis:** Domain `votes.*`, Plesk-Pfad `vote`.

**Deployment-Tooling (fixiert):**

- `tools/deploy.ps1` (PowerShell) nutzt `.env`, erstellt Remote-Ordner, kopiert **nur Build-Output** (z. B. `frontend/dist`) per `scp`.
- Optional: rsync (WSL) mit `--delete` & Excludes.

---

## 3) Mailboxen — fixiert & im Repo vorgesehen

### 3.1 Bereits angelegt (Plesk bestätigt)

| Adresse                                      | Zweck / Zuordnung                | Limit / Status         |
| -------------------------------------------- | -------------------------------- | ---------------------- |
| peter.schuller@menschlichkeit-oesterreich.at | Persönlich – Projektleitung      | 1.06 MB / 250 MB       |
| office@menschlichkeit-oesterreich.at         | Offizielle Kontaktadresse NGO    | 7.65 KB / 250 MB       |
| logging@menschlichkeit-oesterreich.at        | System-/Audit-Logs (n8n, Server) | **197 MB / 250 MB** ⚠️ |
| info@menschlichkeit-oesterreich.at           | Allgemeine Infos / NGO-Anfragen  | 91.4 KB / 250 MB       |
| civimail@menschlichkeit-oesterreich.at       | Newsletter-Versand via CiviCRM   | 18.1 KB / 250 MB       |
| bounce@menschlichkeit-oesterreich.at         | Bounce-Handling Mailings         | 248 KB / 250 MB        |

> **Pflicht:** `logging@…` archivieren/entlasten, bevor Quota überschritten wird.

### 3.2 Im Repo vorgesehen — **müssen noch angelegt werden**

| Adresse                                   | Zweck / Referenz im Repo/Code             | Status           |
| ----------------------------------------- | ----------------------------------------- | ---------------- |
| newsletter@menschlichkeit-oesterreich.at  | Absender Newsletter (Frontend + n8n)      | **noch anlegen** |
| support@menschlichkeit-oesterreich.at     | Support-Formulare / Helpdesk / Tickets    | **noch anlegen** |
| no-reply@menschlichkeit-oesterreich.at    | Transaktionale Mails (DOI, Bestätigungen) | **noch anlegen** |
| admin@menschlichkeit-oesterreich.at       | Systemmeldungen (n8n, Cron, Monitoring)   | **noch anlegen** |
| devops@menschlichkeit-oesterreich.at      | CI/CD, Actions, Error Reports             | **noch anlegen** |
| board@menschlichkeit-oesterreich.at       | Vorstand / rechtliche Kommunikation       | **noch anlegen** |
| kassier@menschlichkeit-oesterreich.at     | Finanzen, Stripe/SEPA-Rechnungen          | **noch anlegen** |
| fundraising@menschlichkeit-oesterreich.at | Sponsoring & Spendenkampagnen             | **noch anlegen** |

**Mail-Regeln (Schreibschutz):**

- Nur Adressen in dieser Liste sind "offiziell".
- Anlegen/Löschen/Ändern **nur** via PR + Board/Tech-Lead Approval.
- Standard-Quota: 250 MB; Änderungen via Plesk dokumentieren.
- Aliasse/Weiterleitungen/Autoresponder **müssen** dokumentiert werden.

---

## 4) Schutzmechanismen (Pflicht)

### 4.1 `.gitignore` (Ausschnitt)

```gitignore
# ENV
.env
.env.*
!.env.example
!.env.development.example
!.env.production.example
!.env.test.example
```

### 4.2 Pre-Commit-Hook (blockt echte `.env`)

`.githooks/pre-commit`:

```bash
#!/usr/bin/env bash
set -euo pipefail
blocked=$(git diff --cached --name-only | grep -E '(^|/)\.env($|[^a-z])' | grep -v '\.example' || true)
if [ -n "$blocked" ]; then
  echo "❌ Commit abgebrochen: echte .env Dateien gefunden:"
  echo "$blocked"
  exit 1
fi
```

Aktivieren:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### 4.3 CI-Gate: ENV-Vollständigkeit prüfen (GitHub Actions)

`.github/workflows/env-guard.yml`:

```yaml
name: env-guard
on: [push, pull_request]
jobs:
  check-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify .env.example exists and is non-empty
        run: |
          test -s .env.example || (echo ".env.example fehlt/leer" && exit 1)
      - name: Ensure no real .env committed
        run: |
          if git ls-files | grep -E '(^|/)\.env($|[^a-z])' | grep -v '\.example'; then
            echo "Echte .env im Repo gefunden"; exit 1
          fi
```

---

## 5) Migrations-/Betriebscheckliste (DoD)

- [ ] `.env.example` ist vollständig & kommentiert.
- [ ] `.env` lokal vorhanden, **nicht** committed.
- [ ] `dotenv-vault new/push` ausgeführt; Envs (`development`, `production`) vorhanden.
- [ ] `tools/deploy.ps1` vorhanden, funktioniert mit `-DryRun`.
- [ ] Alle erzeugten Build-Verzeichnisse in `.env` als `LOCAL_*` definiert.
- [ ] Mail-Adressen gemäß 3.1 angelegt, 3.2 als TODOs gelistet.
- [ ] `logging@…` Archivierung/Rotation geplant (n8n/IMAP-Job).
- [ ] Hooks & CI aktiv (Pre-Commit, `env-guard`).

---

## 6) CODEOWNERS (operative Quelle)

Operative Ownership und verpflichtende Reviews werden ausschliesslich in `.github/CODEOWNERS` definiert.
Beispiele mit unbestaetigten Handles/Teams sind nicht normativ und duerfen diese Quelle nicht ersetzen.

```
# siehe .github/CODEOWNERS (operativer Stand)
```

---

## 7) Appendices (Vorlagen)

### 7.1 `.env.example` — Pflicht-Schlüssel (Skelett)

```ini
# --- SSH/Deploy ---
SSH_HOST=
SSH_PORT=22
SSH_USER=
SSH_KEY=
REMOTE_BASE=/var/www/vhosts/menschlichkeit-oesterreich.at

# --- Remote Pfade (nicht ändern ohne PR) ---
REMOTE_menschlichkeit=httpdocs
REMOTE_admin_stg=subdomains/admin.stg/httpdocs
REMOTE_analytics=subdomains/analytics/httpdocs
REMOTE_api_stg=subdomains/api.stg/httpdocs
REMOTE_consent=subdomains/consent/httpdocs
REMOTE_crm=subdomains/crm/httpdocs
REMOTE_docs=subdomains/docs/httpdocs
REMOTE_forum=subdomains/forum/httpdocs
REMOTE_games=subdomains/games/httpdocs
REMOTE_grafana=subdomains/grafana/httpdocs
REMOTE_hooks=subdomains/hooks/httpdocs
REMOTE_idp=subdomains/idp/httpdocs
REMOTE_logs=subdomains/logs/httpdocs
REMOTE_media=subdomains/media/httpdocs
REMOTE_n8n=subdomains/n8n/httpdocs
REMOTE_newsletter=subdomains/newsletter/httpdocs
REMOTE_s3=subdomains/s3/httpdocs
REMOTE_status=subdomains/status/httpdocs
REMOTE_support=subdomains/support/httpdocs
REMOTE_votes=subdomains/vote/httpdocs

# --- Local build roots (Beispiele) ---
LOCAL_frontend=./frontend/dist
LOCAL_docs=./web/docs/build
LOCAL_api=./api.menschlichkeit-oesterreich.at/deploy
LOCAL_crm=./crm.menschlichkeit-oesterreich.at/web
LOCAL_static_root=./webroot

# --- Backend ---
APP_ENV=development
DEBUG=true
JWT_SECRET=
CIVI_BASE_URL=
CIVI_API_KEY=
CIVI_SITE_KEY=
DATABASE_URL=
REDIS_URL=

# --- Frontend (nur VITE_*) ---
VITE_APP_ENVIRONMENT=development
VITE_API_BASE_URL=
VITE_API_TIMEOUT_MS=10000
VITE_ADMIN_EMAILS=
VITE_ANALYTICS_PROVIDER=
VITE_SENTRY_DSN=

# --- Mail / SMTP (Beispiele) ---
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=info@menschlichkeit-oesterreich.at

# --- Stripe / Webhooks (Beispiele) ---
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 7.2 `tools/deploy.ps1` — Referenz

- Akzeptiert `-Site <name>` (z. B. `frontend`, `crm`, `menschlichkeit`, `api_stg`)
- Nutzt `REMOTE_<Site>` & `LOCAL_<Site>` aus `.env`
- `-DryRun` zeigt Befehle ohne Übertragung
- Verwendet `ssh/scp` (OpenSSH Client)

---

**Geltung:** Dieses Dokument ist Teil der "Definition of Excellence" des Projekts. Abweichungen benötigen triftige Begründung und Review gemaess `.github/CODEOWNERS`.

---

**Erstellt:** 2025-10-18  
**Status:** ACTIVE  
**Owner:** Board + Tech Lead

# DEPLOYMENT_CONFIG — Menschlichkeit Österreich

Maschinenlesbare Deployment-Konfiguration für Claude Code Agents und MCP-Workflows.
Enthält **keine Secrets** — nur öffentliche Strukturinformationen und Platzhalter-Referenzen.

---

## Server

```yaml
host: plesk7.digimagical.com
ip: 5.183.217.146
os: Ubuntu 22.04 LTS
ssh_port: 22
webserver: nginx 1.28.0
php: 8.4.11
database: MariaDB 10.6.22
panel: Plesk (Obsidian)
```

---

## Services & Deployment Targets

| Service  | Tech                   | Build-Kommando                    | Ziel-Pfad auf Server                                                       | Healthcheck-URL                                    |
| -------- | ---------------------- | --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Frontend | React 18 + Vite        | `npm run build:frontend`          | `/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/`                  | `https://menschlichkeit-oesterreich.at/`           |
| API      | FastAPI (Python 3.12+) | `pip install -r requirements.txt` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api/httpdocs/`   | `https://api.menschlichkeit-oesterreich.at/health` |
| CRM      | Drupal 10 + CiviCRM    | `composer install --no-dev`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs/`   | `https://crm.menschlichkeit-oesterreich.at/`       |
| Games    | Static Files           | _(kein Build)_                    | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/games/httpdocs/` | `https://games.menschlichkeit-oesterreich.at/`     |

### Lokale Service-Verzeichnisse (Repository → Server)

```
apps/website/dist/          → /httpdocs/
apps/api/                   → /subdomains/api/httpdocs/
apps/crm/                   → /subdomains/crm/httpdocs/
apps/game/                  → /subdomains/games/httpdocs/
```

---

## CI/CD Pipeline

**Workflow-Datei:** `.github/workflows/deploy-plesk.yml`
**Trigger:** Push auf `main` | `workflow_dispatch`

```
1. checkout         → git checkout @v4
2. build-frontend   → npm ci + npm run build:frontend (artifact upload)
3. test             → npm run test:unit (blockierend, PR-Gate)
4. deploy           → SSH + rsync (4 Services)
5. remote-commands  → composer install, pip install, drush updb
6. healthcheck      → curl alle 4 Service-URLs
```

**Deployment-Strategie:** `rsync over SSH`

- Stabil, kein Container-Overhead
- Kompatibel mit Plesk-Hosting
- Inkrementell (`--partial`), schnelle Recovery via `--backup`

---

## GitHub Secrets

> Alle Secrets werden unter **Settings → Secrets and variables → Actions** angelegt.
> Niemals Secrets in Dateien committen — ausschließlich über GitHub Secrets oder Server-`.env`.

### Repository Secrets (SSH — alle Services)

```
PLESK_HOST              = plesk7.digimagical.com
PLESK_PORT              = 22
PLESK_USER              = <Plesk-Systembenutzer>
PLESK_SSH_PRIVATE_KEY   = <Inhalt der privaten SSH-Schlüsseldatei (Ed25519)>
PLESK_KNOWN_HOSTS       = plesk7.digimagical.com ssh-ed25519 AAAA...
```

> `PLESK_KNOWN_HOSTS`: Fingerprint einmalig via `ssh-keyscan -t ed25519 plesk7.digimagical.com`
> ermitteln, manuell verifizieren, dann als Secret speichern. **Kein** `ssh-keyscan` in der Pipeline.

### Environment Secrets — `production`

> Unter **Settings → Environments → production → Environment secrets** anlegen.

#### Hauptdatenbank (mo_main)

```
MAIN_DB_HOST      = localhost
MAIN_DB_PORT      = 3306
MAIN_DB_NAME      = mo_main
MAIN_DB_USER      = svc_main
MAIN_DB_PASSWORD  = <Passwort>
```

#### Forum-Datenbank (mo_forum)

```
FORUM_DB_HOST      = localhost
FORUM_DB_PORT      = 3306
FORUM_DB_NAME      = mo_forum
FORUM_DB_USER      = svc_forum
FORUM_DB_PASSWORD  = <Passwort>
```

#### Newsletter-Datenbank (mo_newsletter)

```
NEWSLETTER_DB_HOST      = localhost
NEWSLETTER_DB_PORT      = 3306
NEWSLETTER_DB_NAME      = mo_newsletter
NEWSLETTER_DB_USER      = svc_newsletter
NEWSLETTER_DB_PASSWORD  = <Passwort>
```

#### Support-Datenbank (mo_support)

```
SUPPORT_DB_HOST      = localhost
SUPPORT_DB_PORT      = 3306
SUPPORT_DB_NAME      = mo_support
SUPPORT_DB_USER      = svc_support
SUPPORT_DB_PASSWORD  = <Passwort>
```

#### Abstimmungs-Datenbank (mo_votes)

```
VOTES_DB_HOST      = localhost
VOTES_DB_PORT      = 3306
VOTES_DB_NAME      = mo_votes
VOTES_DB_USER      = svc_votes
VOTES_DB_PASSWORD  = <Passwort>
```

#### SMTP (Microsoft 365 Business / Exchange Online)

```text
SMTP_HOST      = smtp.office365.com
SMTP_PORT      = 587
SMTP_USER      = <E-Mail-Adresse, z. B. office@menschlichkeit-oesterreich.at>
SMTP_PASSWORD  = <App-Passwort oder Service-Credential>
MAIL_ENCRYPTION = tls
```

Aktueller Zielzustand:

- produktive Vereinsmails laufen über den vorhandenen **Microsoft 365 Business Account**
- dieselben Adressen können für API, CRM und n8n verwendet werden
- mittelfristig ist **Microsoft Graph + Entra App Registration** dem reinen SMTP-Login vorzuziehen

Mögliche Mail-Accounts:

- `office@menschlichkeit-oesterreich.at`
- `civimail@menschlichkeit-oesterreich.at`
- `bounce@menschlichkeit-oesterreich.at`

---

## GitHub Variables

> Unter **Settings → Secrets and variables → Actions → Variables** anlegen.
> Diese Werte sind **keine Secrets** und können im Repository-Code referenziert werden.

```
APP_URL                = https://menschlichkeit-oesterreich.at
DEPLOY_STRATEGY        = rsync
MAIN_DOMAIN            = menschlichkeit-oesterreich.at
NODE_ENV               = production
PLESK_BASE_PATH        = /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs
SAFE_DEPLOY_AUTO_CONFIRM = false
```

---

## GitHub Environment: production

```
Name:           production
Protection:     Required reviewers: 1 (empfohlen)
Deployment URL: https://menschlichkeit-oesterreich.at
```

Environment-Secrets haben Vorrang vor Repository-Secrets, wenn `environment: production`
im Workflow-Job gesetzt ist.

---

## Rollback-Prozedur

```bash
# 1. Letztes Backup auf dem Server finden
ssh -p 22 <PLESK_USER>@plesk7.digimagical.com \
  "ls -lt /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs.bak.*"

# 2. Backup wiederherstellen (Beispiel)
ssh -p 22 <PLESK_USER>@plesk7.digimagical.com \
  "rsync -a /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs.bak.TIMESTAMP/ \
             /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/"

# 3. Cache leeren (CRM)
ssh -p 22 <PLESK_USER>@plesk7.digimagical.com \
  "cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs && \
   vendor/bin/drush cr"
```

---

## Rsync Ausschlüsse

Folgende Pfade werden **nicht** auf den Server übertragen:

```
.git/
.github/
node_modules/
vendor/              (wird remote via composer install erstellt)
web/sites/*/files/   (Drupal Upload-Dateien — persistent auf Server)
tmp/
cache/
logs/
.env                 (niemals deployen — nur Server-seitig pflegen)
*.local
```

---

## MCP / Agent Quick Reference

Für Claude Code Agents und MCP-Workflows stehen folgende Tool-IDs in `mcp.json` bereit:

| Tool-ID          | Zweck                                                 |
| ---------------- | ----------------------------------------------------- |
| `plesk-deploy`   | Deployment via SSH + rsync auslösen                   |
| `n8n-webhook`    | Deployment-Benachrichtigung via n8n                   |
| `github-cli`     | GitHub Actions Workflows triggern (`gh workflow run`) |
| `trivy-security` | Security-Scan vor Deployment                          |
| `gitleaks`       | Secret-Scan vor Deployment                            |

**Deployment via GitHub CLI (Agent-Kommando):**

```bash
gh workflow run deploy-plesk.yml \
  --ref main \
  --field service=all
```

**Manueller Trigger für einzelnen Service:**

```bash
gh workflow run deploy-plesk.yml \
  --ref main \
  --field service=frontend
```

---

## Sicherheitsregeln

```
ERLAUBT:
  - GitHub Secrets (Repository + Environment)
  - Server-seitige .env Dateien (niemals committen)
  - SSH Key-basierte Authentifizierung

VERBOTEN:
  - Secrets in .env Dateien committen
  - Hardcoded Credentials im Code
  - Klartext-Passwörter in Logs oder Ausgaben
  - ssh-keyscan in Production-Pipelines (MITM-Risiko)
```

---

## Verwandte Dateien

| Datei                                    | Zweck                                       |
| ---------------------------------------- | ------------------------------------------- |
| `.github/workflows/deploy-plesk.yml`     | CI/CD Pipeline (vollständige Multi-Service) |
| `.env.production.template`               | Produktions-Umgebungsvorlage                |
| `.env.example`                           | Development-Vorlage (lokal)                 |
| `scripts/safe-deploy.sh`                 | Manuelles Deployment-Skript (Fallback)      |
| `deployment-scripts/deploy-api-plesk.sh` | API-spezifisches Plesk-Deployment           |
| `CLAUDE.md`                              | Claude Code Projektanleitung                |

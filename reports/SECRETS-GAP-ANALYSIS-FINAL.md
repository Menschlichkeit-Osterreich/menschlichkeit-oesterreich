# Secrets Gap Analysis – Vollständiger Bericht

**Datum:** 2025-10-18
**Durchgeführt von:** AI Coding Agent (Role: Security Analyst)
**Methode:** Repository-Scan + Funktionalitätstests + Schema-Validierung
**Status:** 🔴 **CRITICAL** – 8/8 Core-Secrets fehlgeschlagen

---

## Executive Summary

**Kritische Findings:**
- ✅ **96 ENV-Variablen** in `.env` vorhanden
- ❌ **0/8 Core-Secrets** funktionsfähig (100% Failure Rate)
- ❌ **8/8 Secrets** sind Platzhalter oder nicht gesetzt
- ❌ **PostgreSQL Server** nicht erreichbar (localhost:5432)
- ⚠️ **97 Secrets benötigt** (laut Super-Masterprompt), **~40 dokumentiert** (Dokumentations-Gap: 57 Secrets)

**Handlungsempfehlung:**
1. **SOFORT:** PostgreSQL-Datenbank starten (`docker-compose up -d postgres` oder lokale Installation)
2. **PRIO 1:** GitHub Token (`GH_TOKEN`) generieren und setzen (MCP-Server blockiert)
3. **PRIO 2:** Figma Token (`FIGMA_ACCESS_TOKEN`) generieren (Design-Sync blockiert)
4. **PRIO 3:** Restliche 6 Core-Secrets setzen (JWT, SMTP, Stripe, GPG)
5. **PRIO 4:** 57 fehlende Secrets dokumentieren (siehe Kategorie-Breakdown unten)

---

## 1. Funktionalitätstest-Ergebnisse

**Test ausgeführt:** `.\scripts\Test-SecretFunctionality.ps1`
**Timestamp:** 2025-10-18 22:47:47 - 22:47:51
**Dauer:** 4 Sekunden
**Report:** `quality-reports/secret-functionality-test-2025-10-18_224751.json`

### Test-Zusammenfassung

| Metrik | Wert | Status |
|--------|------|--------|
| **Total Tests** | 8 | - |
| **Passed** | 0 | 🔴 |
| **Failed** | 8 | 🔴 |
| **Warnings** | 0 | ✅ |
| **Skipped** | 0 | ✅ |
| **Success Rate** | 0% | 🔴 **CRITICAL** |

### Detaillierte Fehler

#### 1.1 GitHub Token (CRITICAL)

```
❌ FAIL: GitHub :: GH_TOKEN - Token ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:47
Impact: MCP-Server nicht funktionsfähig, GitHub Actions blockiert, PR-Automation nicht möglich
```

**Benötigt für:**
- GitHub MCP Server (Issue-Management, PR-Automation)
- GitHub Actions (CI/CD)
- Codacy Integration
- Dependabot
- Git-Operationen über API

**Generierung:**
```bash
# 1. GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
# 2. Generate new token (classic)
# 3. Scopes: repo, workflow, read:packages, write:packages, admin:org
# 4. Kopieren und in .env eintragen:
GH_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Format:** `^ghp_[A-Za-z0-9]{36}$`
**Rotation:** 90 Tage
**Scope:** local, ci

---

#### 1.2 Figma Token (HIGH)

```
❌ FAIL: Figma :: FIGMA_ACCESS_TOKEN - Token ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:47
Impact: Design-Token-Sync blockiert, Figma MCP-Server nicht funktionsfähig
```

**Benötigt für:**
- Figma MCP Server (Design-Token-Sync)
- Frontend-Builds (Tailwind-Config)
- Design-System-Updates

**Generierung:**
```bash
# 1. Figma → Settings → Personal access tokens
# 2. Generate new token
# 3. Kopieren und in .env eintragen:
FIGMA_ACCESS_TOKEN=[FIGMA_ACCESS_TOKEN_PLACEHOLDER]

# 4. Figma File ID & Node ID setzen:
FIGMA_FILE_ID=[FIGMA_FILE_ID_PLACEHOLDER]  # Aus Figma-URL
FIGMA_NODE_ID=123:456  # Aus Figma-URL (Node-Selektion)
```

**Format:** Meist 43-44 Zeichen, alphanumerisch mit Bindestrichen
**Rotation:** 180 Tage
**Scope:** local, ci

---

#### 1.3 PostgreSQL Database (CRITICAL)

```
❌ FAIL: Database :: DATABASE_URL - Server nicht erreichbar
Timestamp: 2025-10-18 22:47:51
Details: Host: localhost:5432 - Es konnte keine Verbindung hergestellt werden, da der Zielcomputer die Verbindung verweigerte. [::ffff:127.0.0.1]:5432
Impact: Alle Services blockiert (API, CRM, Games, Dashboard)
```

**Problem:** PostgreSQL-Server läuft nicht auf localhost:5432

**Lösungen:**

**Option A: Docker Compose (empfohlen)**
```bash
# 1. PostgreSQL-Container starten
docker-compose up -d postgres

# 2. Warten bis ready
docker-compose logs -f postgres

# 3. .env aktualisieren
DATABASE_URL=postgresql://postgres:CHANGE_ME_STRONG_PASSWORD@localhost:5432/menschlichkeit_dev

# 4. Migrations ausführen
npx prisma migrate dev
alembic upgrade head
```

**Option B: Lokale Installation**
```powershell
# 1. PostgreSQL 15+ installieren
winget install PostgreSQL.PostgreSQL.15

# 2. Datenbank erstellen
psql -U postgres
CREATE DATABASE menschlichkeit_dev;
CREATE USER menschlichkeit_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE menschlichkeit_dev TO menschlichkeit_user;
\q

# 3. .env aktualisieren
DATABASE_URL=postgresql://menschlichkeit_user:STRONG_PASSWORD@localhost:5432/menschlichkeit_dev
```

**Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
**Rotation:** Password alle 180 Tage
**Scope:** local, staging, production (separate Credentials!)

---

#### 1.4 SMTP Credentials (HIGH)

```
❌ FAIL: SMTP :: SMTP_HOST - Host ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:51
Impact: E-Mail-Versand blockiert (Newsletter, Notifications, Password-Reset)
```

**Benötigt für:**
- Newsletter-Versand (n8n)
- Transaktional Mails (FastAPI)
- Password-Reset (Drupal/CiviCRM)
- Notifications (Alerts, Reports)

**Plesk Mailserver (Production):**
```bash
# 1. Plesk → Mail → Posteingang → SMTP-Einstellungen
SMTP_HOST=smtp.menschlichkeit-oesterreich.at
SMTP_PORT=587  # STARTTLS
SMTP_USER=admin@menschlichkeit-oesterreich.at
SMTP_PASSWORD=PLESK_MAIL_PASSWORD

# 2. Für Bounce-Handling:
SMTP_BOUNCE_EMAIL=bounce@menschlichkeit-oesterreich.at

# 3. IMAP (optional, für Bounce-Processing):
IMAP_HOST=imap.menschlichkeit-oesterreich.at
IMAP_PORT=993  # SSL
IMAP_USER=bounce@menschlichkeit-oesterreich.at
IMAP_PASSWORD=PLESK_MAIL_PASSWORD
```

**Development (Mailhog/Mailpit):**
```bash
# 1. Docker Mailhog starten
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# 2. .env.development:
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""  # Keine Authentifizierung
SMTP_PASSWORD=""
```

**Rotation:** 180 Tage
**Scope:** production (Plesk), development (Mailhog)

---

#### 1.5 Stripe Keys (MEDIUM)

```
❌ FAIL: Stripe :: STRIPE_PUBLISHABLE_KEY - Key ist Platzhalter oder leer
❌ FAIL: Stripe :: STRIPE_SECRET_KEY - Key ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:51
Impact: Zahlungsabwicklung blockiert (Mitgliedsbeiträge, Spenden)
```

**Benötigt für:**
- Mitgliedsbeitrags-Einzug (SEPA, Kreditkarte)
- Spendenformular (Website)
- Stripe Webhooks (n8n)

**Generierung:**
```bash
# 1. Stripe Dashboard → Developers → API keys
# 2. Test-Keys (development):
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 3. Live-Keys (production) - NIEMALS in .env committen!
STRIPE_PUBLISHABLE_KEY=[STRIPE_PUBLISHABLE_KEY_LIVE_PLACEHOLDER]
STRIPE_SECRET_KEY=[STRIPE_SECRET_KEY_LIVE_PLACEHOLDER]

# 4. Webhook-Secret:
STRIPE_WEBHOOK_SECRET=[STRIPE_WEBHOOK_SECRET_PLACEHOLDER]
```

**Format:**
- Publishable: `^pk_(test|live)_[A-Za-z0-9]{24,}$`
- Secret: `^sk_(test|live)_[A-Za-z0-9]{24,}$`

**Rotation:** 365 Tage
**Scope:** production (nur), development (Test-Keys)

**⚠️ WARNUNG:** Stripe Live-Keys NIEMALS in Git pushen! Nur in GitHub Secrets / dotenv-vault.

---

#### 1.6 JWT Secret (CRITICAL)

```
❌ FAIL: JWT :: JWT_SECRET - Secret ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:51
Impact: API-Authentifizierung blockiert, Login nicht möglich
```

**Benötigt für:**
- FastAPI JWT-Auth
- Frontend-Login
- API-Token-Signierung

**Generierung (sicher):**
```bash
# Option A: OpenSSL
openssl rand -base64 64

# Option B: PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Option C: Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# In .env eintragen:
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Mindestlänge:** 64 Zeichen (512 bits)
**Format:** Base64 oder Hex
**Rotation:** 90 Tage (mit Token-Migration!)
**Scope:** production, staging, development (separate Secrets!)

**⚠️ CRITICAL:** Bei Rotation müssen alle aktiven Tokens invalidiert werden!

---

#### 1.7 GPG Key ID (MEDIUM)

```
❌ FAIL: GPG :: GPG_KEY_ID - Key ID ist Platzhalter oder leer
Timestamp: 2025-10-18 22:47:51
Impact: Git Commit-Signierung nicht möglich, dotenv-vault-Verschlüsselung blockiert
```

**Benötigt für:**
- Git Commit-Signierung (Verified Badges)
- dotenv-vault Verschlüsselung
- GPG-verschlüsselte Secrets

**Generierung:**
```bash
# 1. GPG-Key erstellen (falls nicht vorhanden)
gpg --full-generate-key
# → (1) RSA and RSA (default)
# → 4096 bits
# → 0 = key does not expire
# → Real name: Menschlichkeit Österreich
# → Email: tech@menschlichkeit-oesterreich.at

# 2. Key ID ermitteln
gpg --list-secret-keys --keyid-format=long
# → sec   rsa4096/XXXXXXXXXXXXXXXX 2025-10-18 [SC]
#   Key ID: ^^^^^^^^^^^^^^^^ (16 hex chars)

# 3. In .env eintragen
GPG_KEY_ID=XXXXXXXXXXXXXXXX

# 4. Public Key exportieren (für GitHub)
gpg --armor --export XXXXXXXXXXXXXXXX

# 5. GitHub Settings → SSH and GPG keys → New GPG key → Paste
```

**Format:** 8 oder 16 hex chars (Uppercase)
**Rotation:** Keine (Key bleibt dauerhaft, nur bei Kompromittierung widerrufen)
**Scope:** local, ci (Git Commit-Signierung)

---

## 2. Repository-Analyse: Referenzierte Secrets

### 2.1 Gesamt-Statistik

| Quelle | Referenzierte Secrets | Status |
|--------|----------------------|--------|
| `.env.example` | 96 Variablen | ✅ Template vorhanden |
| `.github/workflows/*.yml` | 47 GitHub Secrets | ⚠️ Nicht alle gesetzt |
| `docker-compose.yml` | 18 ENV-Variablen | ⚠️ Platzhalter |
| `secrets/SECRETS-AUDIT.md` | ~40 dokumentiert | ⚠️ 57 fehlen |
| `secrets/secrets-audit.schema.yaml` | 33 Secrets (10 Kategorien) | ✅ Schema vollständig |
| **GESAMT (geschätzt)** | **~120 Secrets** | ❌ **Gap: ~80 fehlen** |

### 2.2 Kategorie-Breakdown (Super-Masterprompt: 97 Keys)

#### ✅ Dokumentiert (40 Secrets in `secrets/SECRETS-AUDIT.md`)

1. **GitHub & MCP** (1 Secret)
   - GH_TOKEN

2. **Figma** (4 Secrets)
   - FIGMA_ACCESS_TOKEN
   - FIGMA_FILE_ID
   - FIGMA_NODE_ID
   - FIGMA_TEAM_ID

3. **PostgreSQL** (6 Secrets)
   - DATABASE_URL
   - POSTGRES_USER
   - POSTGRES_PASSWORD
   - POSTGRES_DB
   - POSTGRES_HOST
   - POSTGRES_PORT

4. **FastAPI/Auth** (5 Secrets)
   - JWT_SECRET
   - JWT_ALGORITHM
   - JWT_EXPIRATION_MINUTES
   - API_SECRET_KEY
   - CORS_ORIGINS

5. **SMTP/IMAP** (7 Secrets)
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASSWORD
   - IMAP_HOST
   - IMAP_PORT
   - IMAP_PASSWORD

6. **Stripe** (3 Secrets)
   - STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET

7. **Monitoring** (3 Secrets)
   - SENTRY_DSN
   - DATADOG_API_KEY
   - PROMETHEUS_TOKEN

8. **GPG** (1 Secret)
   - GPG_KEY_ID

9. **n8n** (7 Secrets)
   - N8N_ENCRYPTION_KEY
   - N8N_BASIC_AUTH_ACTIVE
   - N8N_BASIC_AUTH_USER
   - N8N_BASIC_AUTH_PASSWORD
   - WEBHOOK_URL
   - N8N_HOST
   - N8N_PORT

10. **Legacy Laravel** (3 Secrets)
    - LARAVEL_APP_KEY
    - LARAVEL_DB_PASSWORD
    - LARAVEL_MAIL_PASSWORD

#### ❌ Fehlend (57 Secrets – basierend auf Super-Masterprompt)

##### Mail & Kommunikation (10 Secrets)

| Key | Mail-Adresse | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|--------------|----------|--------------|
| ADMIN_EMAIL | admin@menschlichkeit-oesterreich.at | Admin-Postfach | Plesk Mailserver | hoch |
| BOUNCE_EMAIL | bounce@menschlichkeit-oesterreich.at | Bounce Handling | Plesk Mailserver | hoch |
| INFO_EMAIL | info@menschlichkeit-oesterreich.at | Allgemeine Anfragen | Plesk Mailserver | mittel |
| VORSTAND_EMAIL | vorstand@menschlichkeit-oesterreich.at | Vorstandskontakt | Plesk Mailserver | hoch |
| FINANZEN_EMAIL | finanzen@menschlichkeit-oesterreich.at | Finanzfragen | Plesk Mailserver | hoch |
| DATENSCHUTZ_EMAIL | datenschutz@menschlichkeit-oesterreich.at | DSGVO-Anfragen | Plesk Mailserver | hoch |
| NOREPLY_EMAIL | noreply@menschlichkeit-oesterreich.at | Automated Mails | Plesk Mailserver | niedrig |
| NEWSLETTER_EMAIL | newsletter@menschlichkeit-oesterreich.at | Newsletter-Versand | Plesk Mailserver | mittel |
| SUPPORT_EMAIL | support@menschlichkeit-oesterreich.at | Support-Anfragen | Plesk Mailserver | mittel |
| SMTP_FROM_NAME | Menschlichkeit Österreich | Absender-Name | Config | niedrig |

##### Drupal 10 & CiviCRM (12 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| DRUPAL_DATABASE_URL | CRM-Datenbank | PostgreSQL | hoch |
| DRUPAL_HASH_SALT | Drupal Hash Salt | Generiert (64 chars) | hoch |
| DRUPAL_ADMIN_USER | Admin-Username | Config | hoch |
| DRUPAL_ADMIN_PASSWORD | Admin-Password | Generiert (20+ chars) | hoch |
| DRUPAL_ADMIN_EMAIL | Admin E-Mail | admin@menschlichkeit-oesterreich.at | mittel |
| CIVICRM_SITE_KEY | CiviCRM Site Key | Generiert (32 chars) | hoch |
| CIVICRM_CRED_KEYS | CiviCRM Credential Keys | Generiert (Base64) | hoch |
| CIVICRM_SIGN_KEYS | CiviCRM Sign Keys | Generiert (Base64) | hoch |
| CIVICRM_DATABASE_URL | CiviCRM-Datenbank | PostgreSQL (shared oder separate) | hoch |
| CIVICRM_BASE_URL | CiviCRM Base URL | https://crm.menschlichkeit-oesterreich.at | niedrig |
| CIVICRM_SMTP_HOST | SMTP für CiviCRM Mails | Plesk Mailserver | mittel |
| CIVICRM_SMTP_PASSWORD | SMTP-Password | Plesk Mailserver | hoch |

##### Redis & Caching (5 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| REDIS_URL | Redis Connection String | Redis Server | hoch |
| REDIS_PASSWORD | Redis Auth Password | Generiert (32 chars) | hoch |
| REDIS_HOST | Redis Host | localhost oder redis.menschlichkeit-oesterreich.at | niedrig |
| REDIS_PORT | Redis Port | 6379 (default) | niedrig |
| REDIS_DB | Redis Database Number | 0-15 | niedrig |

##### ELK Stack (Logging & Monitoring) (8 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| ELASTICSEARCH_URL | Elasticsearch Endpoint | ELK Server | mittel |
| ELASTICSEARCH_USER | Elastic Auth User | elastic (default) | hoch |
| ELASTICSEARCH_PASSWORD | Elastic Auth Password | Generiert | hoch |
| LOGSTASH_HOST | Logstash Host | localhost oder logstash.menschlichkeit-oesterreich.at | niedrig |
| LOGSTASH_PORT | Logstash Port | 5044 (default) | niedrig |
| KIBANA_URL | Kibana Dashboard URL | https://kibana.menschlichkeit-oesterreich.at | niedrig |
| KIBANA_ENCRYPTION_KEY | Kibana Encryption Key | Generiert (32 chars) | hoch |
| FILEBEAT_API_KEY | Filebeat API Key | Generiert | hoch |

##### Analytics & Tracking (6 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| GOOGLE_ANALYTICS_ID | GA4 Measurement ID | Google Analytics | niedrig |
| GOOGLE_TAG_MANAGER_ID | GTM Container ID | Google Tag Manager | niedrig |
| MATOMO_URL | Matomo Tracking URL | Self-hosted oder Cloud | niedrig |
| MATOMO_SITE_ID | Matomo Site ID | Matomo Setup | niedrig |
| MATOMO_AUTH_TOKEN | Matomo API Token | Matomo User Settings | hoch |
| PLAUSIBLE_DOMAIN | Plausible Domain | plausible.io | niedrig |

##### Deploy & Plesk (8 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| PLESK_API_KEY | Plesk REST API Key | Plesk Panel | hoch |
| PLESK_HOST | Plesk Server Host | menschlichkeit-oesterreich.at | niedrig |
| PLESK_SSH_USER | SSH User | Plesk Subscription | mittel |
| PLESK_SSH_KEY | SSH Private Key | Generiert (ED25519) | hoch |
| PLESK_FTP_USER | FTP User (fallback) | Plesk Subscription | mittel |
| PLESK_FTP_PASSWORD | FTP Password | Generiert | hoch |
| DEPLOY_WEBHOOK_SECRET | Deployment Webhook Secret | Generiert (32 chars) | hoch |
| ROLLBACK_TOKEN | Rollback Authorization Token | Generiert (32 chars) | hoch |

##### OAuth & Social Login (8 Secrets)

| Key | Beschreibung | Herkunft | Sensitivität |
|-----|--------------|----------|--------------|
| OAUTH_GITHUB_CLIENT_ID | GitHub OAuth App Client ID | GitHub OAuth Apps | mittel |
| OAUTH_GITHUB_CLIENT_SECRET | GitHub OAuth App Secret | GitHub OAuth Apps | hoch |
| OAUTH_GOOGLE_CLIENT_ID | Google OAuth Client ID | Google Cloud Console | mittel |
| OAUTH_GOOGLE_CLIENT_SECRET | Google OAuth Client Secret | Google Cloud Console | hoch |
| OAUTH_FACEBOOK_APP_ID | Facebook App ID | Facebook Developers | mittel |
| OAUTH_FACEBOOK_APP_SECRET | Facebook App Secret | Facebook Developers | hoch |
| OAUTH_REDIRECT_URI | OAuth Callback URL | Config | niedrig |
| OAUTH_STATE_SECRET | OAuth State Parameter Secret | Generiert (32 chars) | hoch |

---

## 3. GitHub Actions Secrets (47 referenziert)

### 3.1 Benötigte Secrets (aus `.github/workflows/*.yml`)

#### Deployment & Infrastructure (12 Secrets)

| Secret Name | Beschreibung | Workflow | Status |
|-------------|--------------|----------|--------|
| `STAGING_REMOTE_HOST` | Staging Server Host | deploy-staging.yml | ❌ |
| `STAGING_REMOTE_USER` | Staging SSH User | deploy-staging.yml | ❌ |
| `STAGING_REMOTE_KEY` | Staging SSH Private Key | deploy-staging.yml | ❌ |
| `STAGING_REMOTE_PATH` | Staging Deploy Path | deploy-staging.yml | ❌ |
| `PRODUCTION_REMOTE_HOST` | Production Server Host | deploy-production.yml | ❌ |
| `PRODUCTION_REMOTE_USER` | Production SSH User | deploy-production.yml | ❌ |
| `PRODUCTION_REMOTE_KEY` | Production SSH Private Key | deploy-production.yml | ❌ |
| `PRODUCTION_REMOTE_PATH` | Production Deploy Path | deploy-production.yml | ❌ |
| `DOTENV_VAULT_KEY` | dotenv-vault Master Key | validate-secrets.yml | ❌ |
| `DOTENV_VAULT_KEY_STAGING` | dotenv-vault Staging Key | deploy-staging.yml | ❌ |
| `DOTENV_VAULT_KEY_PRODUCTION` | dotenv-vault Production Key | deploy-production.yml | ❌ |
| `SAFE_DEPLOY_AUTO_CONFIRM` | Auto-Confirm für safe-deploy.sh | deploy-*.yml | ✅ (boolean) |

#### Security & Quality (8 Secrets)

| Secret Name | Beschreibung | Workflow | Status |
|-------------|--------------|----------|--------|
| `GH_TOKEN` | GitHub Personal Access Token | alle Workflows | ❌ |
| `CODACY_PROJECT_TOKEN` | Codacy API Token | quality-gates.yml | ❌ |
| `TRIVY_GITHUB_TOKEN` | Trivy GitHub Token (Rate-Limiting) | security-scan.yml | ❌ |
| `GITLEAKS_NOTIFY_WEBHOOK` | Webhook für Secrets-Alerts | validate-secrets.yml | ❌ |
| `SNYK_TOKEN` | Snyk.io API Token | security-scan.yml | ❌ |
| `SONARCLOUD_TOKEN` | SonarCloud Token | code-quality.yml | ❌ |
| `GPG_PRIVATE_KEY` | GPG Private Key (für Commit-Signierung) | release.yml | ❌ |
| `GPG_PASSPHRASE` | GPG Key Passphrase | release.yml | ❌ |

#### Database & Services (6 Secrets)

| Secret Name | Beschreibung | Workflow | Status |
|-------------|--------------|----------|--------|
| `DATABASE_URL` | PostgreSQL Connection String | test-integration.yml | ❌ |
| `REDIS_URL` | Redis Connection String | test-integration.yml | ❌ |
| `SMTP_HOST` | SMTP Server Host | test-integration.yml | ❌ |
| `SMTP_USER` | SMTP Username | test-integration.yml | ❌ |
| `SMTP_PASSWORD` | SMTP Password | test-integration.yml | ❌ |
| `N8N_WEBHOOK_URL` | n8n Webhook URL (für Notifications) | deploy-*.yml | ❌ |

#### Monitoring & Analytics (5 Secrets)

| Secret Name | Beschreibung | Workflow | Status |
|-------------|--------------|----------|--------|
| `SENTRY_DSN` | Sentry Error Tracking DSN | deploy-*.yml | ❌ |
| `SENTRY_AUTH_TOKEN` | Sentry API Token (für Release-Tracking) | release.yml | ❌ |
| `DATADOG_API_KEY` | Datadog Monitoring API Key | deploy-*.yml | ❌ |
| `LIGHTHOUSE_CI_TOKEN` | Lighthouse CI Build Token | performance-audit.yml | ❌ |
| `CODECOV_TOKEN` | Codecov.io Upload Token | test-coverage.yml | ❌ |

#### API & Integration (16 Secrets)

| Secret Name | Beschreibung | Workflow | Status |
|-------------|--------------|----------|--------|
| `FIGMA_ACCESS_TOKEN` | Figma Personal Access Token | figma-sync.yml | ❌ |
| `FIGMA_FILE_ID` | Figma File ID | figma-sync.yml | ❌ |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | test-integration.yml | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | test-integration.yml | ❌ |
| `DRUPAL_ADMIN_USER` | Drupal Admin Username | test-drupal.yml | ❌ |
| `DRUPAL_ADMIN_PASSWORD` | Drupal Admin Password | test-drupal.yml | ❌ |
| `CIVICRM_SITE_KEY` | CiviCRM Site Key | test-drupal.yml | ❌ |
| `JWT_SECRET` | JWT Signing Secret | test-api.yml | ❌ |
| `API_SECRET_KEY` | FastAPI Secret Key | test-api.yml | ❌ |
| `OAUTH_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | test-oauth.yml | ❌ |
| `OAUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | test-oauth.yml | ❌ |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth Client ID | test-oauth.yml | ❌ |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | test-oauth.yml | ❌ |
| `N8N_ENCRYPTION_KEY` | n8n Encryption Key | test-n8n.yml | ❌ |
| `N8N_BASIC_AUTH_USER` | n8n Basic Auth Username | test-n8n.yml | ❌ |
| `N8N_BASIC_AUTH_PASSWORD` | n8n Basic Auth Password | test-n8n.yml | ❌ |

### 3.2 Secrets-Priorisierung (GitHub Actions)

#### P0 - CRITICAL (blockiert CI/CD)
1. `GH_TOKEN` – GitHub API-Zugriff
2. `DOTENV_VAULT_KEY` – Secret-Management
3. `STAGING_REMOTE_*` (4 Secrets) – Staging-Deployments
4. `DATABASE_URL` – Integration-Tests

#### P1 - HIGH (blockiert Features)
1. `CODACY_PROJECT_TOKEN` – Code-Quality
2. `TRIVY_GITHUB_TOKEN` – Security-Scans
3. `FIGMA_ACCESS_TOKEN` + `FIGMA_FILE_ID` – Design-Sync
4. `SENTRY_DSN` – Error-Tracking
5. `N8N_WEBHOOK_URL` – Deployment-Notifications

#### P2 - MEDIUM (nicht blockierend)
1. `LIGHTHOUSE_CI_TOKEN` – Performance-Tracking
2. `CODECOV_TOKEN` – Coverage-Reports
3. `SNYK_TOKEN` – Erweiterte Security-Scans
4. `SONARCLOUD_TOKEN` – Erweiterte Code-Quality

#### P3 - LOW (optional)
1. OAuth-Secrets (nur wenn Feature aktiv)
2. Monitoring-Secrets (Datadog, etc.)
3. Production-Secrets (erst bei Go-Live)

---

## 4. Generierungs-Befehle

### 4.1 Kryptografisch sichere Secrets

```bash
# 256-bit (32 Bytes) - für JWT_SECRET, API_SECRET_KEY, etc.
openssl rand -base64 32

# 512-bit (64 Bytes) - für hochsichere Secrets
openssl rand -base64 64

# Hex-Format (für CIVICRM_SITE_KEY, etc.)
openssl rand -hex 32

# UUID v4 (für IDs)
uuidgen

# PowerShell-Variante
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Python-Variante
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4.2 SSH Keys (für Deployments)

```bash
# ED25519 (empfohlen, kurz & sicher)
ssh-keygen -t ed25519 -C "deploy@menschlichkeit-oesterreich.at" -f ~/.ssh/deploy_ed25519

# RSA 4096 (fallback für alte Systeme)
ssh-keygen -t rsa -b 4096 -C "deploy@menschlichkeit-oesterreich.at" -f ~/.ssh/deploy_rsa

# Public Key auf Server kopieren
ssh-copy-id -i ~/.ssh/deploy_ed25519.pub user@server

# Private Key für GitHub Secrets (inkl. -----BEGIN... Header)
cat ~/.ssh/deploy_ed25519
```

### 4.3 GPG Keys (für Commit-Signierung)

```bash
# Key generieren
gpg --full-generate-key
# → (1) RSA and RSA
# → 4096 bits
# → 0 = key does not expire
# → Real name: Menschlichkeit Österreich
# → Email: tech@menschlichkeit-oesterreich.at
# → Passphrase: STRONG_PASSPHRASE

# Key ID ermitteln
gpg --list-secret-keys --keyid-format=long
# → sec   rsa4096/XXXXXXXXXXXXXXXX

# Public Key exportieren (für GitHub)
gpg --armor --export XXXXXXXXXXXXXXXX

# Private Key exportieren (für GitHub Secrets)
gpg --armor --export-secret-keys XXXXXXXXXXXXXXXX
```

### 4.4 Drupal Hash Salt

```bash
# Drupal-spezifisch (Drush)
drush eval "var_dump(Drupal\Component\Utility\Crypt::randomBytesBase64(55))"

# Alternativ (OpenSSL)
openssl rand -base64 55
```

### 4.5 CiviCRM Keys

```bash
# CIVICRM_SITE_KEY (32 hex chars)
openssl rand -hex 16

# CIVICRM_CRED_KEYS (Base64, 512 bits)
openssl rand -base64 64

# CIVICRM_SIGN_KEYS (Base64, 512 bits)
openssl rand -base64 64
```

---

## 5. Sicherheits-Checkliste

### 5.1 Vor dem Setzen von Secrets

- [ ] **Niemals** Secrets in Git committen (auch nicht in `.env`)
- [ ] `.env` ist in `.gitignore` enthalten
- [ ] Gitleaks-Pre-Commit-Hook aktiv (`git config core.hooksPath .githooks`)
- [ ] dotenv-vault initialisiert (`npx dotenv-vault@latest open`)
- [ ] Separate Secrets für development/staging/production

### 5.2 Beim Setzen von Secrets

- [ ] Secrets mit kryptografisch sicheren Generatoren erstellt
- [ ] Mindestlängen eingehalten (JWT: 64, Passwords: 20, Keys: 32)
- [ ] Format validiert (z.B. `ghp_...` für GitHub Tokens)
- [ ] Keine Platzhalter (CHANGE, XXX, TODO, etc.) verwendet
- [ ] Test durchgeführt (`.\scripts\Test-SecretFunctionality.ps1`)

### 5.3 Nach dem Setzen von Secrets

- [ ] Secrets in dotenv-vault gespeichert (`npx dotenv-vault@latest push`)
- [ ] GitHub Secrets gesetzt (Settings → Secrets and variables → Actions)
- [ ] Lokale `.env` mit korrekten Werten (nicht committen!)
- [ ] Rotation-Reminder gesetzt (Kalender, Ticketsystem)
- [ ] Audit-Log aktualisiert (`secrets/SECRETS-AUDIT.md`)

### 5.4 Periodische Reviews (90 Tage)

- [ ] Secrets-Validierung durchgeführt (`npm run compliance:dsgvo`)
- [ ] Rotation-Status geprüft (LetzteRotation-Spalte in Audit)
- [ ] Ungenutzte Secrets entfernt
- [ ] Access-Logs geprüft (wer hat Zugriff?)
- [ ] GitHub Actions Secrets-Inventory aktualisiert

---

## 6. Nächste Schritte (Priorität)

### 6.1 SOFORT (P0 - <24h)

```bash
# 1. PostgreSQL starten
docker-compose up -d postgres

# 2. GitHub Token generieren
# → GitHub Settings → Developer Settings → Personal Access Tokens → Generate
# → Scopes: repo, workflow, read:packages, write:packages
# → Kopieren: ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 3. .env aktualisieren
GH_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@localhost:5432/menschlichkeit_dev

# 4. In dotenv-vault speichern
npx dotenv-vault@latest push

# 5. GitHub Secret setzen
# → Repo Settings → Secrets and variables → Actions → New repository secret
# → Name: GH_TOKEN
# → Value: ghp_XXX...

# 6. Test
.\scripts\Test-SecretFunctionality.ps1
```

### 6.2 HEUTE (P1 - <24h)

```bash
# 7. Figma Token generieren
# → Figma Settings → Personal access tokens → Generate
FIGMA_ACCESS_TOKEN=[FIGMA_ACCESS_TOKEN_PLACEHOLDER]
FIGMA_FILE_ID=[FIGMA_FILE_ID_PLACEHOLDER]  # Aus Figma-URL

# 8. JWT Secret generieren
JWT_SECRET=$(openssl rand -base64 64)

# 9. SMTP konfigurieren (Mailhog für Development)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
SMTP_HOST=localhost
SMTP_PORT=1025

# 10. Stripe Test-Keys
# → Stripe Dashboard → Developers → API keys → Test keys
STRIPE_PUBLISHABLE_KEY=pk_test_XXX...
STRIPE_SECRET_KEY=sk_test_XXX...

# 11. Test
.\scripts\Test-SecretFunctionality.ps1
# Erwartung: 7/8 PASS (nur GPG noch WARN)
```

### 6.3 DIESE WOCHE (P2 - <7d)

```bash
# 12. GPG Key erstellen
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
GPG_KEY_ID=XXXXXXXXXXXXXXXX

# 13. Staging Deployment-Secrets
# → SSH Keys generieren & auf Server kopieren
ssh-keygen -t ed25519 -f ~/.ssh/deploy_staging
ssh-copy-id -i ~/.ssh/deploy_staging.pub user@staging.menschlichkeit-oesterreich.at

# 14. GitHub Actions Secrets setzen (12 Secrets)
# → STAGING_REMOTE_HOST, USER, KEY, PATH
# → DOTENV_VAULT_KEY
# → CODACY_PROJECT_TOKEN
# → TRIVY_GITHUB_TOKEN
# → FIGMA_ACCESS_TOKEN, FIGMA_FILE_ID
# → SENTRY_DSN
# → N8N_WEBHOOK_URL

# 15. CI/CD-Pipeline testen
git push origin main
# → Alle Workflows sollten grün sein
```

### 6.4 NÄCHSTER SPRINT (P3 - <30d)

```bash
# 16. 57 fehlende Secrets dokumentieren
# → Mail-Adressen (10)
# → Drupal/CiviCRM (12)
# → Redis (5)
# → ELK Stack (8)
# → Analytics (6)
# → Deploy/Plesk (8)
# → OAuth (8)

# 17. Enterprise Secret Audit System v3.0
# → SECRETS-AUDIT-ENTERPRISE.md erstellen
# → PowerShell JSON-Workflow (Add-SecretToAudit.ps1)
# → 90-Tage-Review-Automation (GitHub Actions)

# 18. Production-Secrets vorbereiten
# → Separate dotenv-vault Environments
# → Production SSH Keys
# → Plesk API Keys
# → Stripe Live Keys
# → Production Database Credentials

# 19. Branch Protection aktivieren
# → main: Require pull request reviews
# → main: Require status checks (quality-gates, security-scan)
# → main: Require secret audit file updates
```

---

## 7. Risikoanalyse

### 7.1 Kritische Risiken (aktuell)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **Kein GitHub Token** → MCP-Server nicht funktionsfähig | 100% (aktuell) | 🔴 HIGH | P0: Token sofort generieren |
| **Kein PostgreSQL** → Alle Services blockiert | 100% (aktuell) | 🔴 CRITICAL | P0: Docker-Compose starten |
| **Kein Figma Token** → Design-Sync blockiert | 100% (aktuell) | 🟡 MEDIUM | P1: Token heute generieren |
| **Keine JWT Secret** → API-Auth blockiert | 100% (aktuell) | 🔴 HIGH | P1: Secret heute generieren |
| **57 undokumentierte Secrets** → Audit incomplete | 100% (gap) | 🟡 MEDIUM | P3: Dokumentation nächster Sprint |

### 7.2 Zukünftige Risiken

| Risiko | Wahrscheinlichkeit | Impact | Prevention |
|--------|-------------------|--------|------------|
| **Secret-Rotation verpasst** | Hoch (ohne Automation) | 🟡 MEDIUM | 90-Tage-Review-Automation (GitHub Actions) |
| **Secrets in Git committed** | Mittel (ohne Pre-Commit-Hook) | 🔴 HIGH | Gitleaks Pre-Commit-Hook + CI |
| **Production Secrets in Dev** | Mittel (ohne klare Trennung) | 🔴 CRITICAL | Separate dotenv-vault Environments |
| **Unrotierte Secrets nach Breach** | Niedrig (bei guter Hygiene) | 🔴 CRITICAL | Incident-Response-Plan, Rotation-Runbook |
| **Fehlende Secrets blockieren Go-Live** | Hoch (57 fehlen) | 🟡 MEDIUM | Phased Rollout, prioritisierte Dokumentation |

---

## 8. Compliance & Audit-Trail

### 8.1 DSGVO-Relevanz (Art. 32)

**Technische & organisatorische Maßnahmen:**
- ✅ Verschlüsselung at-rest (dotenv-vault)
- ✅ Zugriffskontrolle (RBAC: Owner/Reader/No Access)
- ⚠️ Audit-Trail (teilweise – Rotation-Dates fehlen in 57 Secrets)
- ⚠️ Rotation (Policies definiert, Automation fehlt)

**Betroffene Secrets (personenbezogene Daten):**
- SMTP_USER, SMTP_PASSWORD (E-Mail-Adressen)
- ADMIN_EMAIL, DATENSCHUTZ_EMAIL, etc. (10 Mail-Adressen)
- DRUPAL_ADMIN_EMAIL, CIVICRM-Kontaktdaten

**Empfehlung:** Audit-Trail-Spalten hinzufügen:
- LetzteRotation (Datum)
- NaechsteRotation (Datum)
- RotiertVon (Person/System)
- Commit-Hash (Git-Tracking)

### 8.2 Audit-Log-Beispiel

```markdown
| Key | LetzteRotation | NaechsteRotation | RotiertVon | Commit-Hash |
|-----|----------------|------------------|------------|-------------|
| GH_TOKEN | 2025-10-18 | 2026-01-16 | Tech Lead | abc1234 |
| JWT_SECRET | 2025-10-18 | 2026-01-16 | DevOps | def5678 |
| DATABASE_URL (Prod) | 2025-09-01 | 2026-03-01 | DBA | ghi9012 |
```

---

## 9. Tooling & Automation

### 9.1 Vorhandene Tools

| Tool | Zweck | Status |
|------|-------|--------|
| `validate-secrets.py` | Regex-basierte Validierung | ✅ Produktiv |
| `validate-secrets.ps1` | PowerShell-Äquivalent | ✅ Produktiv |
| `validate-secrets-schema.py` | Schema-basierte Validierung (YAML) | ✅ Produktiv (PyYAML required) |
| `Test-SecretFunctionality.ps1` | Funktionalitätstests (API-Calls, TCP-Ports) | ✅ Produktiv |
| `secrets-audit.schema.yaml` | Machine-readable Schema (10 Kategorien) | ✅ Vollständig |
| `secrets-audit.schema.json` | JSON-Äquivalent (jq/jsonschema) | ✅ Vollständig |

### 9.2 Fehlende Tools (ToDo)

| Tool | Zweck | Priorität |
|------|-------|-----------|
| `Add-SecretToAudit.ps1` | PowerShell JSON-Workflow für neue Secrets | P3 |
| `Check-SecretRotation.ps1` | 90-Tage-Rotation-Checker | P2 |
| `Rotate-Secret.ps1` | Automatische Secret-Rotation mit Backup | P3 |
| `.github/workflows/secret-rotation-reminder.yml` | GitHub Actions: Rotation-Reminders | P2 |
| `.github/workflows/secret-audit-enforcement.yml` | Branch-Protection: Audit-File-Update-Prüfung | P3 |

### 9.3 CI/CD-Integration

**Aktuell (✅):**
- Gitleaks in `.github/workflows/validate-secrets.yml` (Secrets-Scan)
- Trivy in `.github/workflows/security-scan.yml` (Vulnerability-Scan)
- Codacy in `.github/workflows/quality-gates.yml` (Code-Quality)

**Fehlend (❌):**
- Secret-Funktionalitätstest in CI (Test-SecretFunctionality.ps1)
- Schema-Validierung in CI (validate-secrets-schema.py)
- 90-Tage-Rotation-Check in CI
- Branch-Protection: Audit-File-Update-Prüfung

---

## 10. Anhang

### 10.1 Referenzen

- **Secrets-Dokumentation:** `secrets/SECRETS-AUDIT.md` (v1.0, 40 Secrets)
- **Secrets-Schema:** `secrets/secrets-audit.schema.yaml` (v1.0, 10 Kategorien)
- **Super-Masterprompt:** User-Request (2025-10-18, 97 Keys, Enterprise-Grade)
- **Funktionalitätstest:** `quality-reports/secret-functionality-test-2025-10-18_224751.json`
- **DSGVO-Compliance:** `.github/instructions/dsgvo-compliance.instructions.md`
- **Beitragsordnung:** `.github/instructions/mitgliedsbeitraege.instructions.md`
- **Vereinsstatuten:** `.github/instructions/verein-statuten.instructions.md`

### 10.2 Glossar

- **Platzhalter:** CHANGE, XXX, YOUR_, TODO, GENERATE, EXAMPLE, PLACEHOLDER
- **P0-P3:** Prioritäts-Levels (0=Critical, 1=High, 2=Medium, 3=Low)
- **Rotation:** Regelmäßiger Secret-Wechsel (90/180/365 Tage)
- **Scope:** Umgebung (local, staging, production, ci)
- **dotenv-vault:** Encrypted secret storage (https://www.dotenv.org/docs/security/env-vault)
- **MCP-Server:** Model Context Protocol Server (Figma, GitHub, etc.)
- **DSGVO Art. 32:** Technische & organisatorische Maßnahmen (TOMs)

### 10.3 Kontakt

**Security Analyst:** AI Coding Agent (Security-Rolle)
**Tech Lead:** Peter Schuller (peter@menschlichkeit-oesterreich.at)
**Vorstand:** Michael Schuller (michael@menschlichkeit-oesterreich.at)

**Issue-Tracker:** https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues
**Quarterly Review:** 2026-01-15

---

**ENDE – SECRETS-GAP-ANALYSIS-FINAL.md**

# Secrets Catalog & Management

**Organisation**: Menschlichkeit Österreich  
**Secret Management Owner**: DevOps Team  
**Last Updated**: 2025-10-12  
**Review Cycle**: Quartalsweise + bei jeder Secret-Änderung

---

## 📋 Secret Taxonomie

Secrets sind nach **Scope** kategorisiert:

| Scope | Zugriff | Verwendung | Verwaltung |
|-------|---------|------------|-----------|
| **Organization** | Alle/ausgewählte Repos | Shared Services (Figma, Codacy) | GitHub Settings → Secrets → Organization |
| **Repository** | Einzelnes Repo | Repo-spezifisch (Deploy-Keys) | GitHub Repo → Settings → Secrets |
| **Environment** | Environment (staging/prod) | Deployment-spezifisch | GitHub Repo → Settings → Environments |
| **Codespaces** | Development | Lokale Entwicklung | GitHub Settings → Codespaces → Secrets |

---

## 🔐 Organization Secrets

**Verwaltung**: `gh secret set --org peschull SECRET_NAME --repos repo1,repo2`

### Quality & Security Tools

| Secret Name | Beschreibung | Benötigte Repos | Rotation | Status |
|-------------|--------------|-----------------|----------|--------|
| `CODACY_API_TOKEN` | Codacy Code Quality | Alle | 90 Tage | ✅ Aktiv |
| `SEMGREP_APP_TOKEN` | Semgrep SAST Scanner | Alle | 90 Tage | ⚠️ Optional |
| `SNYK_TOKEN` | Snyk Dependency Scanner | Alle | 90 Tage | ⚠️ Optional |
| `SONAR_TOKEN` | SonarQube Analysis | Alle | 90 Tage | ⚠️ Optional |

### Design & Integration

| Secret Name | Beschreibung | Benötigte Repos | Rotation | Status |
|-------------|--------------|-----------------|----------|--------|
| `FIGMA_ACCESS_TOKEN` | Figma Design System Sync | menschlichkeit-oesterreich-development | 180 Tage | ✅ Aktiv |
| `FIGMA_FILE_ID` | Figma File Identifier | menschlichkeit-oesterreich-development | Nie (ID) | ✅ Aktiv |

### Monitoring (Optional)

| Secret Name | Beschreibung | Benötigte Repos | Rotation | Status |
|-------------|--------------|-----------------|----------|--------|
| `SENTRY_DSN` | Error Tracking | Alle Services | Nie (DSN) | ⚠️ Optional |
| `LHCI_TOKEN` | Lighthouse CI | menschlichkeit-oesterreich-development | 90 Tage | ⚠️ Optional |

---

## 🏗️ Repository Secrets

**Verwaltung**: `gh secret set SECRET_NAME < secret.txt`

### SSH & Deployment (CRITICAL)

| Secret Name | Beschreibung | Format | Rotation | Backup |
|-------------|--------------|--------|----------|--------|
| `SSH_PRIVATE_KEY` | Plesk Deployment SSH Key | Base64-encoded ED25519 | Nie (außer Kompromittierung) | ✅ Offline |
| `SSH_HOST` | Plesk Server Hostname | `user@host` oder IP | Bei Server-Wechsel | ✅ Dokumentiert |
| `SSH_USER` | SSH Username | String | Bei Server-Wechsel | ✅ Dokumentiert |
| `SSH_PORT` | SSH Port | Integer (default: 22) | Bei Config-Änderung | ✅ Dokumentiert |
| `PLESK_API_KEY` | Plesk Panel API Key | UUID | 90 Tage | ✅ Offline |

### Database Credentials (CRITICAL)

**Tier 1: Plesk MariaDB (localhost)**

| Secret Name | Beschreibung | Rotation | Notes |
|-------------|--------------|----------|-------|
| `MO_MAIN_DB_PASS` | Website DB Password | 90 Tage | Used by mo_main |
| `MO_VOTES_DB_PASS` | Voting System DB | 90 Tage | Used by mo_votes |
| `MO_SUPPORT_DB_PASS` | Support Tickets DB | 90 Tage | Used by mo_support |
| `MO_NEWSLETTER_DB_PASS` | Newsletter DB | 90 Tage | Used by mo_newsletter |
| `MO_FORUM_DB_PASS` | Forum DB | 90 Tage | Used by mo_forum |

**Tier 2: External MariaDB**

| Secret Name | Beschreibung | Rotation | Notes |
|-------------|--------------|----------|-------|
| `MYSQL_HOST` | External MySQL Hostname | Bei Migration | Shared Host |
| `MO_CRM_DB_PASS` | CiviCRM + Drupal DB | 90 Tage | PII-Critical |
| `MO_N8N_DB_PASS` | n8n Workflows DB | 90 Tage | Automation |
| `MO_HOOKS_DB_PASS` | Webhook Logs DB | 90 Tage | - |
| `MO_CONSENT_DB_PASS` | DSGVO Consent DB | 90 Tage | DSGVO-Critical |
| `MO_GAMES_DB_PASS` | Gaming Platform DB | 90 Tage | - |
| `MO_ANALYTICS_DB_PASS` | Analytics DB | 90 Tage | - |
| `MO_API_STG_DB_PASS` | API Staging DB | 90 Tage | Staging only |
| `MO_ADMIN_STG_DB_PASS` | Admin Staging DB | 90 Tage | Staging only |
| `MO_NEXTCLOUD_DB_PASS` | Nextcloud DB | 90 Tage | File Storage |

**Tier 3: PostgreSQL**

| Secret Name | Beschreibung | Rotation | Notes |
|-------------|--------------|----------|-------|
| `PG_HOST` | PostgreSQL Hostname | Bei Migration | Shared Host |
| `PG_IDP_DB_PASS` | Keycloak IDP DB | 90 Tage | Auth-Critical |
| `PG_GRAFANA_DB_PASS` | Grafana Metrics DB | 90 Tage | Monitoring |
| `PG_DISCOURSE_DB_PASS` | Discourse Forum DB | 90 Tage | Optional |

**Tier 4: Redis (Optional)**

| Secret Name | Beschreibung | Rotation | Notes |
|-------------|--------------|----------|-------|
| `REDIS_HOST` | Redis Server | Bei Migration | Cache |
| `REDIS_PASSWORD` | Redis Auth | 90 Tage | - |

### Application Secrets (HIGH PRIORITY)

| Secret Name | Beschreibung | Format | Rotation | Validation |
|-------------|--------------|--------|----------|------------|
| `CIVICRM_SITE_KEY` | CiviCRM Security Key | 32-char random | 180 Tage | Required |
| `CIVICRM_API_KEY` | CiviCRM API v4 Key | UUID | 90 Tage | Required |
| `JWT_SECRET` | JWT Signing Secret | 32-char random | 90 Tage | ✅ Min 32 chars |
| `N8N_ENCRYPTION_KEY` | n8n Workflow Encryption | 32-char random | 180 Tage | ✅ Required |
| `N8N_USER` | n8n Admin Username | String | Bei Änderung | - |
| `N8N_PASSWORD` | n8n Admin Password | Strong | 90 Tage | ✅ Min 16 chars |

---

## 🌍 Environment Secrets

**Verwaltung**: `gh secret set --env ENV_NAME SECRET_NAME`

### Staging Environment

| Secret Name | Beschreibung | Value Source |
|-------------|--------------|--------------|
| `DATABASE_URL` | Staging DB Connection | Different from Prod |
| `API_BASE_URL` | Staging API Endpoint | `https://api.stg.menschlichkeit-oesterreich.at` |
| `ENABLE_DEBUG` | Debug Mode | `true` |
| `LOG_LEVEL` | Log Verbosity | `debug` |

### Production Environment

| Secret Name | Beschreibung | Value Source |
|-------------|--------------|--------------|
| `DATABASE_URL` | Production DB Connection | Prod Credentials |
| `API_BASE_URL` | Production API Endpoint | `https://api.menschlichkeit-oesterreich.at` |
| `ENABLE_DEBUG` | Debug Mode | `false` |
| `LOG_LEVEL` | Log Verbosity | `info` |
| `SENTRY_DSN` | Error Tracking | Production DSN |

---

## 💻 Codespaces Secrets

**Verwaltung**: GitHub Settings → Codespaces → Secrets

| Secret Name | Beschreibung | Scope | Notes |
|-------------|--------------|-------|-------|
| `DEV_DATABASE_URL` | Local Development DB | All Repos | Testdaten |
| `FIGMA_ACCESS_TOKEN` | Design System Sync | Selected Repos | Same as Org |
| `GITHUB_TOKEN` | Codespace Git Operations | Auto-injected | GitHub-managed |

---

## 🔄 Secret Rotation Playbook

### Standard Rotation (Geplant, 90 Tage)

```bash
# 1. Neues Secret generieren
NEW_SECRET=$(openssl rand -base64 32)

# 2. In Anwendung deployen (ohne alte zu entfernen)
gh secret set SECRET_NAME --body "$NEW_SECRET"

# 3. Rolling Update (graduelle Aktivierung)
./scripts/rolling-update-secret.sh --secret SECRET_NAME --strategy gradual

# 4. Verifizieren (alle Services nutzen neues Secret)
./scripts/verify-secret-usage.sh --secret SECRET_NAME

# 5. Altes Secret entfernen (nach 24h Übergangszeit)
# Nur wenn Verifizierung erfolgreich

# 6. Dokumentieren
echo "$SECRET_NAME rotated on $(date)" >> .secret-rotation-log
```

### Emergency Rotation (Kompromittierung)

```bash
# 1. SOFORT alle betroffenen Services stoppen
./scripts/emergency-stop.sh --services "api,crm,frontend"

# 2. Neues Secret generieren & setzen
./scripts/rotate-secret.sh --secret SECRET_NAME --emergency

# 3. Alle Sessions invalidieren
./scripts/invalidate-sessions.sh --all

# 4. Services neu starten
./scripts/restart-services.sh --services "api,crm,frontend"

# 5. Incident dokumentieren
./scripts/create-incident.sh --type "secret-compromise" --secret SECRET_NAME

# 6. Post-Mortem
# Siehe docs/privacy/art-33-34-incident-playbook.md
```

### Rotation Schedule

| Secret Type | Frequenz | Nächste Rotation | Owner |
|-------------|----------|------------------|-------|
| **SSH Keys** | Nur bei Kompromittierung | - | DevOps |
| **DB Passwords** | 90 Tage | 2026-01-10 | DBA |
| **API Keys** | 90 Tage | 2026-01-10 | API Team |
| **JWT/Encryption** | 90 Tage | 2026-01-10 | Security |
| **CiviCRM Keys** | 180 Tage | 2026-04-10 | CRM Admin |

---

## 🛡️ Secret Protection

### Push Protection ✅ AKTIVIERT

GitHub scannt **bei jedem Push** nach Secrets und **blockiert** den Push.

**Konfiguration**:
- ✅ Repository Settings → Code security → Secret scanning → Push protection
- ✅ Alert bei Bypass-Versuchen
- ✅ Automatische Issue-Erstellung bei Detection

**Bypass-Policy**:
```yaml
Bypass erlaubt nur wenn:
  - False Positive (dokumentiert)
  - Staging/Test-Secret (kein Production)
  - Legacy-Code-Migration (zeitlich begrenzt)

Bypass-Prozess:
  1. Reason angeben (obligatorisch)
  2. Security-Review (DPO Approval)
  3. Issue erstellen (Tracking)
  4. Nachträgliche Rotation (innerhalb 24h)
```

### Secret Scanning ✅ AKTIVIERT

**Automatische Scans**:
- ✅ Bei jedem Push (Push Protection)
- ✅ Historische Commits (GitHub-Scan)
- ✅ Dependencies (npm, composer, pip)

**Partner-Patterns**:
- GitHub scannt nach 200+ Partner-Secrets (AWS, Azure, Stripe, etc.)
- Bei Fund: Automatische Benachrichtigung an Partner (Secret wird invalidiert)

### OIDC statt Langzeit-Secrets ✅ EMPFOHLEN

**Cloud-Authentifizierung ohne Secrets**:

```yaml
# .github/workflows/deploy-azure.yml
jobs:
  deploy:
    permissions:
      id-token: write  # OIDC Token-Erstellung
      contents: read
    steps:
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}    # Nur ID, kein Secret!
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # KEIN client-secret benötigt!

      - name: Deploy
        run: az webapp deploy ...
```

**Vorteile**:
- ✅ Keine Langzeit-Secrets (Token lebt nur Job-Dauer)
- ✅ Automatische Rotation (jeder Job = neuer Token)
- ✅ Audit-Trail (Cloud IAM Logs)
- ✅ Granulare Berechtigungen (Role-Based)

---

## 🧪 Validation & Testing

### Automatisierte Validierung (CI/CD)

**Workflow**: `.github/workflows/validate-secrets.yml`

```bash
# Manuelle Ausführung
npm run validate:secrets

# Prüft:
# ✅ Alle required Secrets gesetzt
# ✅ Secret-Format korrekt (z.B. JWT min 32 chars)
# ✅ Keine hardcoded Secrets im Code
# ✅ .env.example vollständig
```

### Secret-Qualität

**Anforderungen**:
```yaml
Passwörter:
  - Länge: ≥16 Zeichen (Admin: ≥20)
  - Komplexität: Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen
  - Keine Dictionary-Wörter
  - Kein Passwort-Reuse

API Keys:
  - Generiert: openssl rand -base64 32
  - Kein manuelles "Ausdenken"

SSH Keys:
  - Typ: ED25519 (bevorzugt) oder RSA 4096
  - Passphrase: Obligatorisch für Private Keys
```

### Leak-Detection

**Tools**:
- ✅ Gitleaks (CI/CD): `.github/workflows/gitleaks.yml`
- ✅ GitHub Secret Scanning (automatisch)
- ✅ Pre-Commit Hook: `.pre-commit-config.yaml`

**Bei Secret-Leak**:
1. **Sofort rotieren** (siehe Emergency Rotation)
2. **Incident erstellen**: Art. 33 DSGVO prüfen
3. **Root Cause**: Warum nicht verhindert?
4. **Prevention**: Prozess anpassen

---

## 📦 Bootstrap Scripts

### Bash (Linux/macOS)

**File**: `scripts/secrets-bootstrap.sh`

```bash
#!/bin/bash
# Bootstrap all secrets via GitHub CLI

set -euo pipefail

# Repository Secrets
gh secret set SSH_PRIVATE_KEY < ~/.ssh/id_ed25519
gh secret set SSH_HOST --body "dmpl20230054@5.183.217.146"
gh secret set MYSQL_HOST --body "external-mysql.example.com"
gh secret set PG_HOST --body "external-pg.example.com"

# Generate Random Secrets
JWT_SECRET=$(openssl rand -base64 32)
gh secret set JWT_SECRET --body "$JWT_SECRET"

N8N_KEY=$(openssl rand -base64 32)
gh secret set N8N_ENCRYPTION_KEY --body "$N8N_KEY"

# Organization Secrets (requires --org flag)
gh secret set FIGMA_ACCESS_TOKEN --org peschull \
  --repos menschlichkeit-oesterreich-development \
  --body "$(cat ~/.figma-token)"

echo "✅ Secrets bootstrapped successfully"
```

### PowerShell (Windows)

**File**: `scripts/secrets-bootstrap.ps1`

```powershell
# Bootstrap secrets via GitHub CLI (Windows)

# Repository Secrets
gh secret set SSH_PRIVATE_KEY --body (Get-Content ~/.ssh/id_ed25519 -Raw)
gh secret set SSH_HOST --body "dmpl20230054@5.183.217.146"

# Generate Random Secrets
$JwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
gh secret set JWT_SECRET --body $JwtSecret

$N8nKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
gh secret set N8N_ENCRYPTION_KEY --body $N8nKey

Write-Host "✅ Secrets bootstrapped successfully" -ForegroundColor Green
```

---

## 📝 .env.example Templates

### API Service

**File**: `api.menschlichkeit-oesterreich.at/.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Application
JWT_SECRET=your-32-char-secret-here
API_BASE_URL=http://localhost:8001

# CiviCRM Integration
CIVICRM_API_URL=https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4
CIVICRM_API_KEY=your-civicrm-api-key
CIVICRM_SITE_KEY=your-civicrm-site-key

# Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### CRM Service

**File**: `crm.menschlichkeit-oesterreich.at/.env.example`

```bash
# Database (Drupal + CiviCRM)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mo_crm
DB_USER=svc_crm
DB_PASSWORD=your-db-password

# CiviCRM
CIVICRM_SITE_KEY=your-32-char-site-key
CIVICRM_UF_DSN=mysql://user:pass@localhost/mo_crm

# Drupal
DRUPAL_HASH_SALT=your-hash-salt

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### Frontend

**File**: `frontend/.env.example`

```bash
# API
VITE_API_BASE_URL=http://localhost:8001
VITE_CRM_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_ANALYTICS=false

# Figma (Dev only)
VITE_FIGMA_FILE_ID=your-figma-file-id
```

### n8n Automation

**File**: `automation/n8n/.env.example`

```bash
# Database
DB_TYPE=mariadb
DB_MYSQLDB_HOST=localhost
DB_MYSQLDB_PORT=3306
DB_MYSQLDB_DATABASE=mo_n8n
DB_MYSQLDB_USER=svc_n8n
DB_MYSQLDB_PASSWORD=your-db-password

# Encryption
N8N_ENCRYPTION_KEY=your-32-char-encryption-key

# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# External Access
WEBHOOK_URL=https://n8n.menschlichkeit-oesterreich.at
```

---

## 🔗 Weiterführende Dokumentation

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitHub Push Protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Gitleaks Configuration](https://github.com/gitleaks/gitleaks#configuration)

---

**Verantwortlich**: DevOps Team  
**Review**: Quartalsweise + bei Secret-Änderungen  
**Kontakt**: security@menschlichkeit-oesterreich.at

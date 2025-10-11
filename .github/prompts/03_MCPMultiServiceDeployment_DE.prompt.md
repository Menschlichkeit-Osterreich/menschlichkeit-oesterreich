---
title: "03 Mcpmultiservicedeployment"
description: "MCP Multi-Service Deployment Pipeline"
lastUpdated: 2025-10-10
status: ACTIVE
category: deployment
tags: ['deployment', 'mcp', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'Release Managers']
---

---
description: MCP-Enhanced Multi-Service Deployment für 20+ Subdomains mit Quality Gates
priority: critical
category: deployment-automation
execution_order: 3
requires: ["01_EmailDNSSetup_DE.prompt.md", "02_DatabaseRollout_DE.prompt.md"]
updates_todo: true
---

# MCP Multi-Service Deployment Pipeline

**Ziel:** Vollständiges, automatisiertes Deployment aller Services mit MCP-Tools & Quality Gates

**Ausführen mit:** GitHub MCP + Filesystem MCP + Playwright MCP + PostgreSQL MCP

---

## 🎯 Service-Übersicht

### Plesk Server (dmpl20230054.kasserver.com)

**SSH-Zugang:**
```yaml
ssh:
  host: dmpl20230054.kasserver.com
  port: 22
  user: dmpl20230054
  root_dir: /www/htdocs/w01234567
  method: SSH Private Key (GitHub Secret: SSH_PRIVATE_KEY)
```

**Subdomain-Struktur:**

```yaml
subdomains:
  main:
    domain: menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/menschlichkeit-oesterreich.at
    service: Website (WordPress/HTML)
    
  votes:
    domain: votes.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/votes/httpdocs
    service: Voting System
    db: mo_votes (Plesk MariaDB)
    
  support:
    domain: support.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/support/httpdocs
    service: Support Ticketing
    db: mo_support (Plesk MariaDB)
    
  status:
    domain: status.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/status/httpdocs
    service: Status Dashboard
    
  s3:
    domain: s3.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/s3/httpdocs
    service: MinIO/S3-Compatible Storage
    
  newsletter:
    domain: newsletter.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/newsletter/httpdocs
    service: Newsletter Distribution
    db: mo_newsletter (Plesk MariaDB)
    email: newsletter@newsletter.menschlichkeit-oesterreich.at
    
  n8n:
    domain: n8n.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/n8n/httpdocs
    service: n8n Workflow Automation
    db: mo_n8n (External MariaDB)
    
  media:
    domain: media.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/media/httpdocs
    service: Media CDN/Assets
    
  logs:
    domain: logs.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/logs/httpdocs
    service: Centralized Logging (ELK/Loki)
    email: logging@menschlichkeit-oesterreich.at
    
  idp:
    domain: idp.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/idp/httpdocs
    service: Keycloak Identity Provider
    db: mo_idp (External PostgreSQL)
    
  hooks:
    domain: hooks.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/hooks/httpdocs
    service: Webhook Management
    db: mo_hooks (External MariaDB)
    
  grafana:
    domain: grafana.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/grafana/httpdocs
    service: Grafana Dashboards
    db: mo_grafana (External PostgreSQL)
    
  games:
    domain: games.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/games/httpdocs
    service: Educational Gaming Platform
    db: mo_games (External MariaDB)
    
  forum:
    domain: forum.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/forum/httpdocs
    service: Community Forum
    db: mo_forum (Plesk MariaDB)
    
  docs:
    domain: docs.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/docs/httpdocs
    service: Documentation Portal
    
  crm:
    domain: crm.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/crm/httpdocs
    service: CRM (Drupal 10 + CiviCRM)
    db: mo_crm (External MariaDB)
    email: civimail@menschlichkeit-oesterreich.at
    
  consent:
    domain: consent.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/consent/httpdocs
    service: DSGVO Consent Management
    db: mo_consent (External MariaDB)
    
  api_stg:
    domain: api.stg.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/api.stg/httpdocs
    service: API Staging Environment
    db: mo_api_stg (External MariaDB)
    
  analytics:
    domain: analytics.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/analytics/httpdocs
    service: Analytics/Matomo
    db: mo_analytics (External MariaDB)
    
  admin_stg:
    domain: admin.stg.menschlichkeit-oesterreich.at
    path: /www/htdocs/w01234567/subdomains/admin.stg/httpdocs
    service: Admin Staging Environment
    db: mo_admin_stg (External MariaDB)
```

---

## 🚀 Phase 1: Pre-Deployment Checks (BLOCKING)

**Via Quality Gates (npm run quality:gates):**

```yaml
gates:
  security:
    - Trivy: 0 HIGH/CRITICAL vulnerabilities
    - Gitleaks: 0 exposed secrets
    - Dependabot: 0 open HIGH/CRITICAL alerts
    
  quality:
    - Codacy Maintainability ≥ 85%
    - Code Duplication ≤ 2%
    - ESLint: 0 errors
    - PHPStan (Drupal): Level 6 passed
    
  testing:
    - Unit Tests: 100% passed
    - Integration Tests: 100% passed
    - E2E Tests (Playwright): 100% passed
    - Code Coverage ≥ 80%
    
  performance:
    - Lighthouse Performance ≥ 90
    - Lighthouse Accessibility ≥ 90
    - Lighthouse Best Practices ≥ 95
    - Lighthouse SEO ≥ 90
    
  compliance:
    - DSGVO: 0 PII in logs
    - WCAG AA: 0 violations
    - Consent Management: Active
    - Privacy Policy: Up-to-date
```

**Action Items:**
- [ ] Via Terminal: `npm run quality:gates` → ALL GREEN
- [ ] Via GitHub MCP: Check Dependabot alerts → 0 CRITICAL
- [ ] Via Codacy MCP: Analyse all files → Maintainability ≥85%
- [ ] Via Playwright MCP: Run E2E tests → 0 failures
- [ ] Via Filesystem MCP: Scan for PII in logs → 0 findings

**MCP Commands:**
```bash

# Via GitHub MCP
"List all Dependabot and code scanning alerts"

# Via Codacy MCP
"Run analysis on all modified files"

# Via Playwright MCP
"Run E2E tests for critical user flows"

# Via Filesystem MCP
"Search for potential PII patterns in log files"
```

**BLOCKER:** Wenn ANY Gate FAIL → STOP Deployment, Fix Issues, Re-Run Gates

---

## 🔒 Phase 2: Secrets & Environment (Ausführen: GitHub MCP)

**Required Secrets (Production Environment):**

```yaml
github_secrets_production:
  # SSH Deployment
  SSH_HOST: dmpl20230054.kasserver.com
  SSH_PORT: 22
  SSH_USER: dmpl20230054
  SSH_PRIVATE_KEY: "-----BEGIN OPENSSH PRIVATE KEY-----..."
  
  # DB Hosts
  MYSQL_HOST: external-mariadb.provider.com
  MYSQL_PORT: 3306
  PG_HOST: external-postgres.provider.com
  PG_PORT: 5432
  
  # Email (aus 01_EmailDNSSetup)
  SMTP_HOST: smtp.kasserver.com
  SMTP_PORT: 587
  SMTP_USER: dmpl20230054
  SMTP_PASS: "xxx"
  SUPPORT_EMAIL: support@menschlichkeit-oesterreich.at
  
  # CiviMail (aus 01_EmailDNSSetup)
  CIVIMAIL_FROM: newsletter@newsletter.menschlichkeit-oesterreich.at
  CIVIMAIL_BOUNCE: bounce@menschlichkeit-oesterreich.at
  
  # DB Credentials (aus 02_DatabaseRollout)
  MO_CRM_DB_USER: svc_crm
  MO_CRM_DB_PASS: "xxx"
  MO_N8N_DB_USER: svc_n8n
  MO_N8N_DB_PASS: "xxx"
  MO_GAMES_DB_USER: svc_games
  MO_GAMES_DB_PASS: "xxx"
  # ... alle weiteren DB-Credentials
  
  # Application Secrets
  JWT_SECRET: "xxx"
  SESSION_SECRET: "xxx"
  API_KEY_KEYCLOAK: "xxx"
  OAUTH_CLIENT_SECRET: "xxx"
```

**Action Items:**
- [ ] Via GitHub MCP: Verify all required secrets exist in `production` environment
- [ ] Missing Secrets → Generate via `openssl rand -base64 32`
- [ ] Via GitHub MCP: Create missing secrets
- [ ] Test: GitHub Actions Workflow mit Secret-Access (Dry-Run)

**MCP Commands:**
```bash

# Via GitHub MCP
"List all repository secrets in production environment"
"Create environment secret JWT_SECRET in production with generated value"

# Via Terminal (Secret Generation)
echo "JWT_SECRET: $(openssl rand -base64 64)"
echo "SESSION_SECRET: $(openssl rand -base64 64)"
```

---

## 📦 Phase 3: Build Pipeline (Ausführen: build-pipeline.sh)

**Build Command:**

```bash
./build-pipeline.sh production --skip-tests  # Tests bereits in Phase 1
```

**Build-Prozess:**

```yaml
build_steps:
  1_workspace_setup:
    - npm install (Root + Workspaces)
    - composer install (CRM/Drupal)
    - pip install -r requirements.txt (API)
    
  2_code_generation:
    - npx prisma generate (DB Client)
    - npm run design:tokens (Figma → CSS/Tailwind)
    
  3_compilation:
    - npm run build:frontend (React/Vite)
    - npm run build:games (TypeScript)
    - npm run build:api (FastAPI Package)
    
  4_packaging:
    - Create deployment artifacts
    - Generate manifests
    - SBOM + SLSA Attestation
    
  5_artifact_upload:
    - Via GitHub Actions: Upload artifacts
    - Retention: 30 days
```

**Action Items:**
- [ ] Via Terminal: `./build-pipeline.sh production` → Build SUCCESS
- [ ] Artifacts generiert in `dist/` für alle Services
- [ ] Via Filesystem MCP: Verify SBOM + SLSA files exist
- [ ] Via GitHub MCP (Actions): Upload artifacts

**MCP Commands:**
```bash

# Via Terminal
./build-pipeline.sh production --skip-tests

# Via Filesystem MCP
"List all files in dist/ directory with sizes"
"Verify existence of SBOM.json and SLSA-attestation.json"
```

---

## 🚢 Phase 4: Service Deployments (Ausführen: deployment-scripts/)

### 4.1 Main Website

```bash

# deployment-scripts/deploy-website.sh

rsync -avz --delete \
  --exclude='*.log' \
  --exclude='.git' \
  website/ \
  dmpl20230054@dmpl20230054.kasserver.com:/www/htdocs/w01234567/menschlichkeit-oesterreich.at/
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/deploy-website.sh --dry-run`
- [ ] Verify: No destructive changes, only updates
- [ ] Execute: `./deployment-scripts/deploy-website.sh`
- [ ] Smoke Test: `curl -I https://menschlichkeit-oesterreich.at` → HTTP 200

---

### 4.2 CRM (Drupal 10 + CiviCRM)

```bash

# deployment-scripts/deploy-crm-plesk.sh

#!/bin/bash
set -euo pipefail

TARGET_DIR="/www/htdocs/w01234567/subdomains/crm/httpdocs"

# 1. Upload Code
rsync -avz --delete \
  --exclude='sites/default/files' \
  --exclude='sites/default/civicrm/upload' \
  crm.menschlichkeit-oesterreich.at/ \
  dmpl20230054@dmpl20230054.kasserver.com:$TARGET_DIR/

# 2. Remote: DB Migrations
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/subdomains/crm/httpdocs
drush cache:rebuild
drush updatedb -y
drush civicrm:upgrade:db
ENDSSH

# 3. Remote: Clear Cache
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/subdomains/crm/httpdocs
drush cache:rebuild
ENDSSH
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/deploy-crm-plesk.sh --dry-run`
- [ ] Verify: CiviCRM templates preserved, no data loss
- [ ] Backup: Via PostgreSQL MCP → Snapshot mo_crm DB
- [ ] Execute: `./deployment-scripts/deploy-crm-plesk.sh`
- [ ] Smoke Test: `curl -I https://crm.menschlichkeit-oesterreich.at` → HTTP 200
- [ ] Via PostgreSQL MCP: Verify DB schema version

**MCP Commands:**
```bash

# Via PostgreSQL MCP
"Execute query: SELECT schema_version FROM civicrm_domain; to verify CiviCRM DB version"

# Via GitHub MCP
"Create issue for CRM deployment tracking with deployment timestamp"
```

---

### 4.3 API Backend (FastAPI)

```bash

# deployment-scripts/deploy-api-plesk.sh

#!/bin/bash
set -euo pipefail

TARGET_DIR="/www/htdocs/w01234567/api.menschlichkeit-oesterreich.at"

# 1. Upload Code
rsync -avz --delete \
  api.menschlichkeit-oesterreich.at/ \
  dmpl20230054@dmpl20230054.kasserver.com:$TARGET_DIR/

# 2. Remote: Install Dependencies
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/api.menschlichkeit-oesterreich.at
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
ENDSSH

# 3. Remote: DB Migrations (Alembic)
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/api.menschlichkeit-oesterreich.at
source venv/bin/activate
alembic upgrade head
ENDSSH

# 4. Remote: Restart Service (via Plesk/systemd)
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'

# Plesk Restart Command (falls vorhanden)
/usr/local/psa/admin/bin/pleskctl restart api
ENDSSH
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/deploy-api-plesk.sh --dry-run`
- [ ] Backup: API Database snapshot
- [ ] Execute: `./deployment-scripts/deploy-api-plesk.sh`
- [ ] Smoke Test: `curl https://api.menschlichkeit-oesterreich.at/health` → HTTP 200
- [ ] Via PostgreSQL MCP: Verify Alembic revision matches

**MCP Commands:**
```bash

# Via Terminal
curl -X GET https://api.menschlichkeit-oesterreich.at/openapi.json | jq .info.version

# Via PostgreSQL MCP
"Execute query to check Alembic migration version in alembic_version table"
```

---

### 4.4 Frontend (React/TypeScript)

```bash

# deployment-scripts/deploy-frontend.sh

#!/bin/bash
set -euo pipefail

TARGET_DIR="/www/htdocs/w01234567/frontend"

# Build bereits in Phase 3 erfolgt
cd frontend/dist

# Upload Static Build
rsync -avz --delete \
  ./ \
  dmpl20230054@dmpl20230054.kasserver.com:$TARGET_DIR/
```

**Action Items:**
- [ ] Via Filesystem MCP: Verify `frontend/dist/` exists & complete
- [ ] Via Terminal: `./deployment-scripts/deploy-frontend.sh --dry-run`
- [ ] Execute: `./deployment-scripts/deploy-frontend.sh`
- [ ] Smoke Test: `curl -I https://frontend.menschlichkeit-oesterreich.at` → HTTP 200
- [ ] Via Playwright MCP: Run visual regression tests

**MCP Commands:**
```bash

# Via Playwright MCP
"Run visual regression tests for homepage, login, dashboard pages"

# Via Filesystem MCP
"Verify all static assets (JS, CSS, images) exist in frontend/dist/"
```

---

### 4.5 Gaming Platform

```bash

# deployment-scripts/deploy-games.sh

#!/bin/bash
set -euo pipefail

TARGET_DIR="/www/htdocs/w01234567/subdomains/games/httpdocs"

# Upload Build
rsync -avz --delete \
  web/dist/ \
  dmpl20230054@dmpl20230054.kasserver.com:$TARGET_DIR/

# Remote: Prisma Migrations
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/subdomains/games/httpdocs
npx prisma migrate deploy
ENDSSH
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/deploy-games.sh --dry-run`
- [ ] Backup: mo_games DB snapshot
- [ ] Execute: `./deployment-scripts/deploy-games.sh`
- [ ] Smoke Test: `curl -I https://games.menschlichkeit-oesterreich.at` → HTTP 200
- [ ] Via PostgreSQL MCP: Verify Prisma migrations applied

**MCP Commands:**
```bash

# Via PostgreSQL MCP
"Execute query: SELECT * FROM _prisma_migrations ORDER BY applied_steps_count DESC LIMIT 1;"

# Via Playwright MCP
"Run E2E test for game login, achievement unlock, XP earning flows"
```

---

### 4.6 Automation (n8n)

```bash

# deployment-scripts/deploy-n8n.sh

#!/bin/bash
set -euo pipefail

TARGET_DIR="/www/htdocs/w01234567/subdomains/n8n/httpdocs"

# Upload n8n Workflows & Config
rsync -avz --delete \
  automation/n8n/workflows/ \
  dmpl20230054@dmpl20230054.kasserver.com:$TARGET_DIR/workflows/

# Remote: Restart n8n (Docker/systemd)
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'
cd /www/htdocs/w01234567/subdomains/n8n/httpdocs
docker-compose restart n8n
ENDSSH
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/deploy-n8n.sh --dry-run`
- [ ] Execute: `./deployment-scripts/deploy-n8n.sh`
- [ ] Smoke Test: `curl -I https://n8n.menschlichkeit-oesterreich.at` → HTTP 200
- [ ] Test Workflow: Trigger build-notifications.json via Webhook

---

### 4.7 Remaining Services

**Deployments analog zu oben:**

```yaml
remaining_services:
  - support: Support Ticketing System
  - newsletter: Newsletter Distribution
  - forum: Community Forum
  - consent: DSGVO Consent Management
  - analytics: Matomo Analytics
  - grafana: Grafana Dashboards
  - idp: Keycloak Identity Provider
  - docs: Documentation Portal
  - status: Status Dashboard
  - media: Media CDN
  - logs: Centralized Logging
```

**Action Items:**
- [ ] Für jeden Service: Deployment-Script in `deployment-scripts/`
- [ ] Dry-Run → Verify → Execute → Smoke Test
- [ ] Via GitHub MCP: Track deployment status in issue

---

## ✅ Phase 5: Post-Deployment Validation (Ausführen: Playwright MCP)

### Smoke Tests (deployment-scripts/smoke-tests.sh)

```bash
#!/bin/bash

# deployment-scripts/smoke-tests.sh

set -euo pipefail

SERVICES=(
  "https://menschlichkeit-oesterreich.at"
  "https://crm.menschlichkeit-oesterreich.at"
  "https://api.menschlichkeit-oesterreich.at/health"
  "https://frontend.menschlichkeit-oesterreich.at"
  "https://games.menschlichkeit-oesterreich.at"
  "https://n8n.menschlichkeit-oesterreich.at"
  "https://support.menschlichkeit-oesterreich.at"
  "https://newsletter.menschlichkeit-oesterreich.at"
  "https://forum.menschlichkeit-oesterreich.at"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "Testing: $SERVICE"
  HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" "$SERVICE")
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✅ $SERVICE OK"
  else
    echo "❌ $SERVICE FAILED (HTTP $HTTP_CODE)"
    exit 1
  fi
done

echo "🎉 All Smoke Tests PASSED"
```

**Action Items:**
- [ ] Via Terminal: `./deployment-scripts/smoke-tests.sh` → ALL PASSED
- [ ] Failures → Rollback via `./scripts/rollback-plesk.sh`

---

### E2E Validation (Playwright MCP)

```yaml
critical_user_flows:
  - User Registration & Email Verification
  - Login & Profile Access
  - CiviCRM Donation Flow
  - Game Achievement Unlock
  - Support Ticket Creation
  - Newsletter Subscription
  - DSGVO Consent Management
```

**Action Items:**
- [ ] Via Playwright MCP: `"Run E2E tests for all critical user flows"` → 0 failures
- [ ] Via Filesystem MCP: Verify E2E reports in `playwright-results/`
- [ ] Screenshots & Videos für Failures

**MCP Commands:**
```bash

# Via Playwright MCP
"Run E2E tests for user registration, login, donation, achievement flows"

# Via Filesystem MCP
"List all files in playwright-results/ directory"
```

---

### Performance Validation

```bash

# Via Playwright MCP: Lighthouse Audit

npm run performance:lighthouse
```

**Expected Metrics:**

```yaml
lighthouse_thresholds:
  performance: >= 90
  accessibility: >= 90
  best_practices: >= 95
  seo: >= 90
```

**Action Items:**
- [ ] All services meet Lighthouse thresholds
- [ ] Failures → Create GitHub Issue mit Performance-Report

---

## 📊 Phase 6: Monitoring & Alerting (Ausführen: Grafana + n8n)

### Deployment Metrics

```yaml
metrics_to_track:
  deployment:
    - Deployment duration (Target: < 30min)
    - Services deployed (Target: 20+)
    - Failures (Target: 0)
    - Rollbacks (Target: 0)
    
  service_health:
    - HTTP 200 rate (Target: 100%)
    - Response time (Target: < 500ms P95)
    - Error rate (Target: < 0.1%)
    
  database:
    - Connection pool usage
    - Query performance
    - Migration status
```

**Action Items:**
- [ ] Via Grafana: Dashboard für Deployment-Metriken aktivieren
- [ ] Via n8n: Workflow für Deployment-Notifications konfigurieren
- [ ] Test: Simulate deployment → Alert via Slack/Email

**MCP Commands:**
```bash

# Via GitHub MCP
"Create issue for Grafana deployment dashboard setup"

# Via Filesystem MCP
"Read automation/n8n/workflows/build-notifications.json workflow"
```

---

### Alerting Configuration

```yaml
alerts:
  critical:
    - Service down (HTTP != 200) → Immediate
    - Database connection failure → Immediate
    - Security incident → Immediate
    
  warning:
    - High response time (> 2s) → 15min
    - Error rate > 1% → 30min
    - Disk space < 20% → 1h
```

**Action Items:**
- [ ] Via n8n: Alert-Workflows für alle CRITICAL & WARNING Thresholds
- [ ] Test: Trigger Alert (Service stoppen) → Notification erhalten

---

## 🔄 Phase 7: Rollback Plan (Ausführen: scripts/rollback-plesk.sh)

**Rollback-Trigger:**

```yaml
rollback_conditions:
  - Smoke Tests: ANY failure
  - E2E Tests: > 10% failure rate
  - Critical Bug reported within 1h
  - Security incident
```

**Rollback-Prozess:**

```bash
#!/bin/bash

# scripts/rollback-plesk.sh

set -euo pipefail

ROLLBACK_VERSION="${1:-previous}"  # Default: previous deployment

# 1. Git Checkout Previous Version
git checkout "deploy-$ROLLBACK_VERSION"

# 2. Rebuild (mit altem Code)
./build-pipeline.sh production --skip-tests

# 3. Deploy Rollback
for SCRIPT in deployment-scripts/deploy-*.sh; do
  $SCRIPT --force
done

# 4. DB Rollback (falls nötig)
ssh dmpl20230054@dmpl20230054.kasserver.com << 'ENDSSH'

# Restore DB Snapshots (aus Backup)
mysql mo_crm < /backup/mo_crm_pre_deploy.sql
psql -d mo_idp < /backup/mo_idp_pre_deploy.sql
ENDSSH

# 5. Verify
./deployment-scripts/smoke-tests.sh
```

**Action Items:**
- [ ] Bei Deployment-Failure: SOFORT `./scripts/rollback-plesk.sh` ausführen
- [ ] Via GitHub MCP: Create incident issue mit Rollback-Details
- [ ] Post-Incident Review: Root Cause Analysis

---

## 📝 Deployment Checklist (Zusammenfassung)

**Pre-Deployment:**
- [ ] Quality Gates: ALL GREEN (Phase 1)
- [ ] Secrets: Verified in GitHub (Phase 2)
- [ ] Build: Successful (Phase 3)

**Deployment:**
- [ ] Main Website: Deployed + Smoke Test ✅
- [ ] CRM (Drupal/CiviCRM): Deployed + DB Migration ✅
- [ ] API (FastAPI): Deployed + Alembic Migration ✅
- [ ] Frontend (React): Deployed + Visual Tests ✅
- [ ] Gaming Platform: Deployed + Prisma Migration ✅
- [ ] n8n Automation: Deployed + Workflow Test ✅
- [ ] Alle weiteren Services: Deployed ✅

**Post-Deployment:**
- [ ] Smoke Tests: ALL PASSED (Phase 5)
- [ ] E2E Tests: 0 Failures (Phase 5)
- [ ] Lighthouse: ALL Thresholds met (Phase 5)
- [ ] Monitoring: Dashboard aktiv (Phase 6)
- [ ] Alerting: Konfiguriert & Tested (Phase 6)

**Documentation:**
- [ ] Via Filesystem MCP: Deployment-Report in `quality-reports/deployment-$(date +%F).md`
- [ ] Via GitHub MCP: Update deployment issue mit Completion Status
- [ ] Via Memory MCP: Store deployment metrics für Trend-Analyse

---

## 🔗 Abhängigkeiten

**Benötigt:**
- `01_EmailDNSSetup_DE.prompt.md` (Email-Infrastruktur für Alerts)
- `02_DatabaseRollout_DE.prompt.md` (DB-Credentials & Connections)

**Triggert:**
- TODO.md Update: "Multi-Service Deployment abgeschlossen"
- Quality Reports: Deployment Metrics Report
- Incident Response: Bei Failures

---

## 📅 Zeitplan

```yaml
deployment_window:
  vorbereitung:
    duration: 2h
    tasks:
      - Quality Gates prüfen
      - Secrets verifizieren
      - Build ausführen
      
  execution:
    duration: 3h
    tasks:
      - Service Deployments (20+ Services)
      - DB Migrations
      - Smoke Tests
      
  validation:
    duration: 1h
    tasks:
      - E2E Tests
      - Performance Tests
      - Monitoring Setup
      
  total: 6h (mit Buffer)
```

**Empfohlenes Zeitfenster:** Samstag 08:00-14:00 UTC (minimaler User-Traffic)

---

## 📝 TODO Updates

Bei erfolgreicher Ausführung dieser Prompt:
- [x] Quality Gates: ALL GREEN
- [x] GitHub Secrets: Alle vorhanden & validiert
- [x] Build Pipeline: Erfolgreich (alle Services)
- [x] Main Website: Deployed
- [x] CRM (Drupal/CiviCRM): Deployed + Migrations
- [x] API (FastAPI): Deployed + Alembic
- [x] Frontend (React): Deployed
- [x] Gaming Platform: Deployed + Prisma
- [x] n8n Automation: Deployed
- [x] Alle 20+ Services: Deployed & Online
- [x] Smoke Tests: 100% PASSED
- [x] E2E Tests: 0 Failures
- [x] Performance Tests: Lighthouse ≥90
- [x] Monitoring Dashboard: Aktiv (Grafana)
- [x] Alerting: Konfiguriert (n8n)
- [ ] Quarterly: Deployment-Retrospektive (continuous improvement)

**Next Steps:** Post-Deployment Monitoring & Incident Response Readiness

---

## 🛠️ Troubleshooting

### Deployment-Script fehlschlägt

```bash

# Debug: Dry-Run Mode
./deployment-scripts/deploy-crm-plesk.sh --dry-run --verbose

# Logs prüfen
tail -f /var/log/deployment.log

# SSH Manual Check
ssh dmpl20230054@dmpl20230054.kasserver.com
cd /www/htdocs/w01234567/subdomains/crm/httpdocs
ls -la
```

### DB Migration Error

```bash

# Via PostgreSQL MCP
"Show Alembic migration history and current version"

# Manual Rollback
ssh dmpl20230054@dmpl20230054.kasserver.com
cd /www/htdocs/w01234567/api.menschlichkeit-oesterreich.at
source venv/bin/activate
alembic downgrade -1  # Rollback last migration
```

### Service nicht erreichbar (HTTP 500)

```bash

# Logs prüfen
ssh dmpl20230054@dmpl20230054.kasserver.com
tail -f /www/htdocs/w01234567/logs/error.log

# Permissions Check
find /www/htdocs/w01234567/subdomains/crm/httpdocs -type f -not -perm 644
find /www/htdocs/w01234567/subdomains/crm/httpdocs -type d -not -perm 755

# Fix Permissions
chmod -R 644 /www/htdocs/w01234567/subdomains/crm/httpdocs/**/*.php
chmod -R 755 /www/htdocs/w01234567/subdomains/crm/httpdocs/**/
```

---

**Erfolg:** Deployment abgeschlossen, alle Services online, Monitoring aktiv! 🎉

---
title: 🚀 Deployment Operations Chat Mode
version: 2.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: general
applyTo: **/*
---

# 🚀 Deployment Operations Chat Mode

## Kontext & Spezialisierung

**Primäre Aufgabe:** Koordination von Multi-Service-Deployments auf Plesk-Infrastruktur mit 17-Datenbank-Architektur (5 Plesk MariaDB, 9 External MariaDB, 3 External PostgreSQL).

**Verfügbare MCP Server:**

- ✅ GitHub MCP - CI/CD Status, PRs, Security Alerts
- ✅ PostgreSQL MCP - DB Connections (MariaDB + PostgreSQL)
- ✅ Filesystem MCP - Deployment Scripts, Config Files
- ✅ Playwright MCP - Smoke Tests, E2E Validation
- ✅ Memory MCP - Deployment State, Metrics Tracking
- ✅ Brave Search MCP - Best Practices, CVE Details

---

## Schnellstart (3 Schritte)

1. Via Memory MCP: „Load last deployment state“ und GitHub MCP: „Check readiness“
2. Pre‑Deployment Gates: Backups 24h, CI ✅, Security ✅, SSH OK
3. Start „Workflow 3: Service Deployment“ in definierter Reihenfolge

---

## Automatische Initialisierung

### Bei Aktivierung dieses Chat Modes:

```markdown
1. Via Memory MCP: "Load last deployment state"
   → Retrieve: Last deployment timestamp, version, status

2. Via GitHub MCP: "Check current deployment branch readiness"
   → Validate: CI/CD status, open PRs, security alerts

3. Via Filesystem MCP: "Read deployment configuration"
   → Load: .env.deployment, deployment-scripts/deployment-config.sh

4. Via PostgreSQL MCP: "Test database connections"
   → Verify: All 17 databases reachable from Plesk server

REPORT:
"🚀 Deployment Operations Mode aktiv
✅ Letzte Deployment: {{TIMESTAMP}} (Version {{VERSION}})
✅ Branch: {{BRANCH}} ({{CI_STATUS}})
✅ Databases: {{CONNECTED}}/17
✅ SSH: {{SSH_STATUS}}

Ready for deployment? (yes/no)"
```

---

## Haupt-Workflows

### Workflow 1: Pre-Deployment Validation

**Trigger:** "Validiere Deployment-Bereitschaft" oder "Check deployment readiness"

```markdown
SCHRITT 1: GitHub Validation
Via GitHub MCP:
"List all checks for current branch"

PRÜFUNG:
□ CI/CD: Alle Actions passed?
□ Security: 0 Dependabot HIGH/CRITICAL?
□ Reviews: Min. 1 approval?
□ Branch: Up-to-date mit main?

IF FAILED:
OUTPUT: "❌ BLOCKED: {{REASON}}"
ACTION: "Fix issues first, then revalidate"
STOP

SCHRITT 2: Quality Gates
Via Filesystem MCP:
"Run npm run quality:gates"

EXPECTED OUTPUT:
✅ Security: 0 issues
✅ Maintainability: ≥85%
✅ Performance: Lighthouse ≥90
✅ DSGVO: 0 PII in logs
✅ Dependencies: npm audit 0 HIGH

IF FAILED:
OUTPUT: "❌ Quality Gate Failed: {{GATE_NAME}}"
ACTION: "Run npm run quality:reports for details"
STOP

SCHRITT 3: Database Backup Verification
Via PostgreSQL MCP:
"Check last backup timestamp for all 17 databases"

QUERY:
SELECT
database_name,
backup_timestamp,
backup_size_mb,
retention_days
FROM backup_metadata
WHERE backup_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY database_name;

EXPECTED: 17 backups within last 24h

IF MISSING:
OUTPUT: "❌ Missing backups for: {{DB_LIST}}"
ACTION: "Run ./scripts/db-backup-all.sh"
WAIT for completion
REVALIDATE

SCHRITT 4: SSH Connection Test
Via Filesystem MCP:
"Test SSH connection to Plesk"

COMMAND:
ssh -i $SSH_PRIVATE_KEY -p $SSH_PORT $SSH_USER@$SSH_HOST "echo 'SSH OK'"

EXPECTED: "SSH OK"

IF FAILED:
OUTPUT: "❌ SSH Connection failed"
ACTION: "Check SSH key, host, user credentials"
STOP

FINAL OUTPUT:
"✅ ALL PRE-DEPLOYMENT CHECKS PASSED
Ready to proceed with deployment"
```

### Workflow 2: Database Environment Setup

**Trigger:** "Setup Database Environment" oder "Provision databases"

```markdown
SCHRITT 1: External MariaDB Provisioning (9 DBs)
Via PostgreSQL MCP:
"Connect to external MariaDB and create databases"

FOR EACH DB in [crm, n8n, hooks, consent, games, analytics, api_stg, admin_stg, nextcloud]:
SSH to $MYSQL_HOST

mysql -u root -p << SQL
CREATE DATABASE IF NOT EXISTS mo\_$DB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

    CREATE USER IF NOT EXISTS 'svc_$DB'@'$PLESK_SERVER_IP'
      IDENTIFIED BY '$DB_PASSWORD';

    GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
      ON mo_$DB.*
      TO 'svc_$DB'@'$PLESK_SERVER_IP';

    FLUSH PRIVILEGES;

SQL

OUTPUT: "✅ mo*$DB created with user svc*$DB"

SCHRITT 2: PostgreSQL Provisioning (3 DBs)
Via PostgreSQL MCP:
"Setup PostgreSQL databases"

FOR EACH DB in [idp, grafana, discourse]:
SSH to $PG_HOST

sudo -u postgres psql << SQL
CREATE USER svc*$DB WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE mo*$DB OWNER svc_$DB TEMPLATE template1;
GRANT ALL PRIVILEGES ON DATABASE mo*$DB TO svc*$DB;
SQL

OUTPUT: "✅ mo*$DB created with owner svc*$DB"

SCHRITT 3: Firewall Configuration
Via Filesystem MCP:
"Configure database server firewalls"

# MariaDB Server

ufw allow from $PLESK_SERVER_IP to any port 3306 proto tcp
ufw deny 3306
ufw enable

# PostgreSQL Server

ufw allow from $PLESK_SERVER_IP to any port 5432 proto tcp
ufw deny 5432
ufw enable

OUTPUT: "✅ Firewall rules applied - only Plesk IP allowed"

SCHRITT 4: Connection Validation
Via PostgreSQL MCP:
"Test all 17 connections from Plesk server"

# Test MariaDB (Plesk localhost + External)

FOR EACH DB in [mo_main, mo_votes, mo_support, mo_newsletter, mo_forum,
mo_crm, mo_n8n, mo_hooks, mo_consent, mo_games, mo_analytics,
mo_api_stg, mo_admin_stg, mo_nextcloud]:
mysql -h $HOST -u $USER -p$PASS -e "SELECT 1;"
OUTPUT: "✅ $DB connection OK"

# Test PostgreSQL

FOR EACH DB in [mo_idp, mo_grafana, mo_discourse]:
PGPASSWORD=$PASS psql -h $PG_HOST -U $USER -d $DB -c "SELECT 1;"
OUTPUT: "✅ $DB connection OK"

FINAL OUTPUT:
"✅ ALL 17 DATABASES PROVISIONED & CONNECTED

- Plesk MariaDB: 5/5
- External MariaDB: 9/9
- PostgreSQL: 3/3"
```

### Workflow 3: Service Deployment

**Trigger:** "Deploy all services" oder "Start deployment"

```markdown
DEPLOYMENT ORDER (Dependency-based):

1. Database Migrations
2. API Backend
3. CRM System
4. Frontend
5. Gaming Platform
6. Admin Panel
7. n8n Workflows

─────────────────────────────────────────────

STEP 1: Database Migrations
Via Filesystem MCP:
"Run database migrations for all services"

# Prisma migrations (PostgreSQL)

FOR SERVICE in [games, idp, grafana]:
export DATABASE*URL="postgresql://svc*$SERVICE:$PASS@$PG_HOST:5432/mo_$SERVICE"

# Dry-run

npx prisma migrate diff --script > preview-$SERVICE.sql

# Review

cat preview-$SERVICE.sql

# Apply

npx prisma migrate deploy

# Validate

npx prisma db pull && npx prisma validate

OUTPUT: "✅ $SERVICE migrations applied"

# Drupal/CiviCRM (MariaDB)

SSH to Plesk
cd /var/www/vhosts/.../subdomains/crm/httpdocs
drush updatedb -y
cv upgrade:db
OUTPUT: "✅ CRM migrations applied"

─────────────────────────────────────────────

STEP 2: API Deployment
Via Filesystem MCP:
"Deploy API backend to api.<main-domain>"

EXECUTE: ./deployment-scripts/deploy-api-plesk.sh

INTERNALLY:

1. Build: pip install -r requirements.txt
2. Tests: pytest tests/ --cov=app
3. Security: trivy fs --severity HIGH,CRITICAL .
4. Backup: rsync current → backup/api-{{TIMESTAMP}}
5. Deploy: rsync dist/api → .../subdomains/api/httpdocs
6. Permissions: chown $SSH_USER:psacln
7. Reload: systemctl restart api-fastapi
8. Health Check: curl https://api.../health

Via Playwright MCP:
"Validate API endpoints"

TESTS:
□ GET /health → 200 {status: "healthy"}
□ GET /version → 200 {version: "{{VERSION}}"}
□ POST /auth/login → 200 (test user)
□ Response time < 500ms

OUTPUT: "✅ API deployed successfully (health: OK, latency: {{MS}}ms)"

─────────────────────────────────────────────

STEP 3: CRM Deployment
Via Filesystem MCP:
"Deploy CRM to crm.menschlichkeit-oesterreich.at"

EXECUTE: ./deployment-scripts/deploy-crm-plesk.sh

INTERNALLY:

1. Maintenance ON: drush state:set system.maintenance_mode 1
2. Backup DB: drush sql:dump --gzip > backup-{{TIMESTAMP}}.sql.gz
3. Deploy Code: rsync dist/crm → .../subdomains/crm/httpdocs
4. Drupal Updates: drush updatedb -y && drush cr
5. CiviCRM Updates: cv upgrade:db
6. Maintenance OFF: drush state:set system.maintenance_mode 0

Via Playwright MCP:
"Run CRM smoke tests"

TESTS:
□ GET / → 200
□ GET /civicrm/dashboard → 200 (auth)
□ Create test contact
□ Record test donation
□ Verify API sync

OUTPUT: "✅ CRM deployed (Drupal + CiviCRM OK)"

─────────────────────────────────────────────

STEP 4: Frontend Deployment
Via Filesystem MCP:
"Deploy React frontend to menschlichkeit-oesterreich.at"

BUILD:
cd frontend
npm ci --production
npm run build # Output: dist/
npm run lighthouse:ci # Pre-deploy validation

DEPLOY:
rsync -avz --delete dist/ \
 $SSH_USER@$SSH_HOST:.../httpdocs/

Via Playwright MCP:
"Run frontend E2E tests"

CRITICAL FLOWS:
□ Homepage load (LCP < 2.5s)
□ Donation form submission
□ User registration flow
□ Email verification
□ Login/Logout

Via Playwright MCP:
"Run accessibility audit"

EXPECT:
✅ WCAG AA compliance
✅ No broken links
✅ Images have alt text
✅ Keyboard navigation OK

OUTPUT: "✅ Frontend deployed (Lighthouse: {{SCORE}}, A11y: WCAG AA)"

─────────────────────────────────────────────

STEP 5: Gaming Platform Deployment
EXECUTE: ./deployment-scripts/deploy-games-plesk.sh

TESTS (Playwright):
□ Voting Puzzle loads
□ Constitution Quest playable
□ XP calculation correct
□ Achievement unlocking works

OUTPUT: "✅ Gaming platform deployed"

─────────────────────────────────────────────

STEP 6: Admin Panel Deployment
EXECUTE: ./deployment-scripts/deploy-admin-plesk.sh

TESTS (Playwright):
□ Admin login
□ Dashboard access
□ User management

OUTPUT: "✅ Admin panel deployed"

─────────────────────────────────────────────

STEP 7: n8n Workflows
Via Filesystem MCP:
"Deploy n8n automation workflows"

STEPS:

1. Export local: npm run n8n:export
2. Backup production: ssh plesk "docker exec n8n n8n export:workflow --all"
3. Deploy: scp workflows/\*.json plesk:/var/n8n/workflows/
4. Import: ssh plesk "docker exec n8n n8n import:workflow --input=/workflows/"
5. Activate: ssh plesk "docker exec n8n n8n update:workflow --all --active=true"

VALIDATE:
curl -X POST https://n8n.../webhook/test -d '{"test":true}'

OUTPUT: "✅ n8n workflows deployed & activated"

─────────────────────────────────────────────

FINAL SUMMARY:
"✅ ALL 7 SERVICES DEPLOYED SUCCESSFULLY

Deployment Duration: {{DURATION}}
Downtime: 0s (blue-green for API)

Service Status:
✅ API: https://api.<main-domain> (health: OK)
✅ CRM: https://crm.menschlichkeit-oesterreich.at (Drupal+CiviCRM OK)
✅ Frontend: https://menschlichkeit-oesterreich.at (Lighthouse: {{SCORE}})
✅ Games: https://games.menschlichkeit-oesterreich.at (OK)
✅ Admin: https://admin.menschlichkeit-oesterreich.at (OK)
✅ n8n: https://n8n.menschlichkeit-oesterreich.at (workflows active)
✅ Website: https://menschlichkeit-oesterreich.at (WordPress OK)"
```

### Workflow 4: Post-Deployment Monitoring

**Trigger:** "Start deployment monitoring" (automatically triggered after deployment)

```markdown
Via Filesystem MCP:
"Run post-deployment monitoring script"

EXECUTE: npm run deploy:monitor

DURATION: 30 minutes
CHECK_INTERVAL: 30 seconds

METRICS MONITORED:

1. Service Health
   □ API: /health endpoint
   □ CRM: HTTP 200 + Drupal bootstrap
   □ Frontend: HTTP 200 + DOM load
   □ All others: HTTP 200

2. System Resources (via SSH)
   CPU: <80% (warn), <90% (critical)
   Memory: <85% (warn), <95% (critical)
   Disk: <90% (warn), <95% (critical)

3. Database Health
   Connection count < max \* 0.8
   Slow query log: 0 new entries
   Query time p95 < 100ms

4. Error Rates
   Application errors: <1%
   5xx responses: <0.1%
   Database errors: 0

5. Performance
   API p95: <500ms
   Frontend TTFB: <500ms

ALERTING (via n8n):
□ CRITICAL: Service down >2min, errors >5%, resources >95%
□ WARNING: Performance degradation, errors >1%, resources >80%

AUTO-ROLLBACK TRIGGERS:
□ Service down >2 minutes
□ Error rate >5%
□ Critical resource exhaustion

Via Memory MCP:
"Track deployment metrics for trending"

STORE:

- Deployment timestamp
- Service response times
- Error rates
- Resource utilization
- User-reported issues

OUTPUT (every 5 minutes):
"📊 Monitoring Update:
✅ All services healthy
✅ Error rate: 0.02% (target <1%)
✅ API p95: 178ms (target <500ms)
✅ CPU: 42% (normal)
✅ Memory: 68% (normal)"
```

### Workflow 5: Rollback

**Trigger:** "Rollback deployment" oder automatic bei kritischen Fehlern

```markdown
ROLLBACK PROCEDURE (< 5 Minuten SLA):

Via Filesystem MCP:
"Execute rollback script"

EXECUTE: ./deployment-scripts/rollback.sh

STEPS:

1. Alert Team
   n8n webhook → Slack/Email
   "🚨 ROLLBACK INITIATED: {{REASON}}"

2. Stop Incoming Traffic
   Maintenance mode ON (all services)

3. Rollback Databases
   FOR EACH DB in all 17:
   Restore from backup-pre-deployment-{{TIMESTAMP}}

   MariaDB: mysql < backup.sql
   PostgreSQL: pg_restore backup.dump

4. Rollback API
   rsync backup/api-{{TIMESTAMP}} → .../api/httpdocs
   systemctl restart api-fastapi

5. Rollback CRM
   rsync backup/crm-{{TIMESTAMP}} → .../crm/httpdocs
   drush cr

6. Rollback Frontend
   rsync backup/frontend-{{TIMESTAMP}} → .../httpdocs

7. Rollback Games
   rsync backup/games-{{TIMESTAMP}} → .../games/httpdocs

8. Rollback Admin
   rsync backup/admin-{{TIMESTAMP}} → .../admin/httpdocs

9. Rollback n8n
   docker exec n8n n8n import:workflow --input=/backups/{{TIMESTAMP}}

10. Resume Traffic
    Maintenance mode OFF
    Validate all services

Via Playwright MCP:
"Run smoke tests on rolled-back services"

VALIDATION:
□ All health endpoints return 200
□ Critical user flows work
□ No errors in logs

Via GitHub MCP:
"Create post-mortem issue"

TEMPLATE:

# Deployment Rollback Post-Mortem

## Incident Details

- **Timestamp:** {{TIMESTAMP}}
- **Trigger:** {{REASON}}
- **Duration:** {{DURATION}}
- **Affected Services:** {{SERVICES}}

## Root Cause

{{ANALYSIS}}

## Prevention Measures

- [ ] {{MEASURE_1}}
- [ ] {{MEASURE_2}}

OUTPUT:
"✅ ROLLBACK COMPLETE
All services restored to version {{PREVIOUS_VERSION}}
Post-mortem issue created: #{{ISSUE_NUMBER}}"
```

---

## Kontext-Bewusste Antworten

### Bei Deployment-Fragen:

**Frage:** "Kann ich jetzt deployen?"

**Antwort-Schema:**

```markdown
Via GitHub MCP: "Check deployment readiness"

ANALYSE:
✅/❌ CI/CD Status: {{STATUS}}
✅/❌ Security Alerts: {{COUNT}}
✅/❌ Quality Gates: {{RESULTS}}
✅/❌ Database Backups: {{STATUS}}

IF ALL ✅:
"✅ READY FOR DEPLOYMENT
Run: npm run deploy:multi-service"

IF ANY ❌:
"❌ NOT READY - Blocking Issues:
{{ISSUE_LIST}}

Fix these first, then revalidate."
```

### Bei Database-Fragen:

**Frage:** "Sind alle Datenbanken erreichbar?"

**Antwort-Schema:**

```markdown
Via PostgreSQL MCP: "Test all 17 database connections"

RESULTS:
Plesk MariaDB (localhost):
✅ mo_main
✅ mo_votes
✅ mo_support
✅ mo_newsletter
✅ mo_forum

External MariaDB ($MYSQL_HOST):
✅ mo_crm
✅ mo_n8n
{{...}}

External PostgreSQL ($PG_HOST):
✅ mo_idp
✅ mo_grafana
✅ mo_discourse

SUMMARY: {{CONNECTED}}/17 databases reachable

IF <17:
"❌ Missing connections: {{DB_LIST}}
Check: Firewall, credentials, network"
```

### Bei Performance-Fragen:

**Frage:** "Wie performant ist die letzte Deployment?"

**Antwort-Schema:**

```markdown
Via Memory MCP: "Retrieve latest deployment metrics"

PERFORMANCE REPORT (Last Deployment {{TIMESTAMP}}):

Service Response Times:
API p50: {{MS}}ms (target <200ms)
API p95: {{MS}}ms (target <500ms)
Frontend TTFB: {{MS}}ms (target <500ms)

Lighthouse Scores:
Performance: {{SCORE}} (target ≥90)
Accessibility: {{SCORE}} (target ≥90)
SEO: {{SCORE}} (target ≥90)

Error Rates (24h):
Application: {{PERCENT}}% (target <1%)
5xx: {{PERCENT}}% (target <0.1%)

Database:
Query p95: {{MS}}ms (target <100ms)
Connections: {{COUNT}}/{{MAX}} ({{PERCENT}}%)

TREND: {{BETTER/WORSE/STABLE}} vs. previous deployment
```

---

## Spezielle Kommandos

### Deployment Dashboard (Interaktiv)

**Befehl:** "Zeige Deployment Dashboard" oder "Show deployment status"

```markdown
Via Filesystem MCP:
"Run deployment dashboard"

EXECUTE: npm run deploy:dashboard

INTERACTIVE UI SHOWS:
┌─────────────────────────────────────────────┐
│ 🚀 Deployment Dashboard │
├─────────────────────────────────────────────┤
│ Current Branch: chore/figma-mcp-make │
│ CI/CD Status: ✅ Passed │
│ Quality Gates: ✅ 9/9 │
│ Last Deployment: 2025-10-07 14:32 UTC │
│ Version: v2.4.1 │
├─────────────────────────────────────────────┤
│ Service Status: │
│ ✅ API (178ms p95) │
│ ✅ CRM (healthy) │
│ ✅ Frontend (Lighthouse 94) │
│ ✅ Games (healthy) │
│ ✅ Admin (healthy) │
│ ✅ n8n (workflows active) │
├─────────────────────────────────────────────┤
│ Database Connections: 17/17 │
│ Error Rate (24h): 0.02% │
│ CPU: 42% | Memory: 68% | Disk: 54% │
├─────────────────────────────────────────────┤
│ [D] Deploy All | [R] Rollback | [Q] Quit │
└─────────────────────────────────────────────┘
```

### Quick Health Check

**Befehl:** "Quick health check" oder "Schnelle Statusprüfung"

```markdown
Via Filesystem MCP + PostgreSQL MCP + Playwright MCP:
"Run rapid health check"

EXECUTE (parallel):

1. curl https://api.../health
2. curl https://crm.../
3. curl https://menschlichkeit-oesterreich.at/
4. Test DB connections (all 17)

OUTPUT (<10 seconds):
"✅ QUICK HEALTH CHECK RESULTS:
✅ API: Healthy (92ms)
✅ CRM: Healthy
✅ Frontend: Healthy
✅ Databases: 17/17 connected
✅ No alerts"
```

---

## Best Practices für diesen Chat Mode

1. **Immer zuerst validieren** - Nie blind deployen
2. **Backups zuerst** - Vor jeder kritischen Operation
3. **Schrittweise vorgehen** - Nicht alle Services parallel deployen
4. **Monitoring aktivieren** - Nach jedem Deployment 30 min beobachten
5. **Rollback bereit** - Immer Rollback-Strategie dokumentiert
6. **Kommunizieren** - Team über Deployment-Fenster informieren
7. **Dokumentieren** - Jeden Deployment in GitHub Issue tracken

---

## Automatische Eskalation

```markdown
WENN Error Rate > 5%:
→ AUTOMATIC ROLLBACK
→ n8n Alert → PagerDuty
→ Create CRITICAL GitHub Issue

WENN Service Down > 5 min:
→ AUTOMATIC ROLLBACK
→ Escalate to On-Call Engineer
→ Post-Mortem required

WENN Database Connection Lost:
→ STOP all deployments
→ Check firewall, credentials
→ Restore from backup if corrupted
```

---

**Status:** ✅ Production Ready  
**SLA:** < 30 min deployment, < 5 min rollback  
**Supported:** Production, Staging environments

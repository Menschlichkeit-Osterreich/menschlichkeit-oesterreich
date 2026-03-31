---
title: 'Mcpmultiservicedeployment'
description: 'Multi-Service Deployment'
lastUpdated: 2025-10-10
status: ACTIVE
category: deployment
tags: ['deployment', 'mcp', 'dsgvo']
version: '1.0.0'
language: de-AT
audience: ['DevOps Team', 'Release Managers']
---

```prompt
---
description: Multi-Service Deployment Pipeline mit GitHub, Filesystem & Playwright MCP
priority: high
category: deployment
---

# Multi-Service Deployment

## 🚀 Deployment Pipeline für Austrian NGO Platform

**Kontext:** Koordinierter Deployment-Prozess für alle 6 Services (Website, CRM, API, Frontend, Gaming, n8n) mit automatisierten Quality Gates, Rollback-Strategie und Zero-Downtime-Deployment.

---

## Phase 1: Pre-Deployment Validation (GitHub MCP)

```

Via GitHub MCP:
"Check deployment readiness for current branch"

VALIDATE:
□ All CI/CD checks passed?
□ Security alerts = 0?
□ Code review approved (min. 1 reviewer)?
□ Branch up-to-date with main?
□ No merge conflicts?

Via GitHub MCP:
"List all open Dependabot alerts"

IF ALERTS > 0:
→ STOP deployment
→ Fix vulnerabilities first
→ Re-run security scan

Via GitHub MCP:
"Get latest successful deployment timestamp"

COMPARE:

- Last Production Deploy: {{TIMESTAMP}}
- Current Commit: {{COMMIT_SHA}}
- Changes since last deploy: {{FILE_COUNT}} files

```text

## Phase 2: Environment Preparation (Filesystem MCP)

```

Via Filesystem MCP:
"Validate environment configurations"

CHECK FILES:
□ .env.production (API Backend)
□ crm.menschlichkeit-oesterreich.at/sites/default/settings.php
□ apps/website/.env.production
□ deployment-scripts/nginx/\*.conf

Via Filesystem MCP:
"Read deployment-scripts/deploy-api-plesk.sh"

VALIDATE SCRIPT:
□ Backup creation BEFORE deployment
□ Health check endpoints defined
□ Rollback procedure documented
□ Notification webhooks configured

Via Filesystem MCP:
"Check database migration files"

ls -la apps/api/alembic/versions/

ENSURE:

- All migrations tested locally
- Rollback migrations available
- Data integrity checks included

```text

## Phase 3: Service Dependency Graph

```

Via Memory MCP:
"Build service deployment order based on dependencies"

DEPENDENCY GRAPH:

1. PostgreSQL Database (Foundation)
   └─ Migrations FIRST
2. API Backend (apps/api)
   └─ Depends on: PostgreSQL
3. CRM System (crm.menschlichkeit-oesterreich.at)
   └─ Depends on: PostgreSQL, API (for sync)
4. Frontend (React/TypeScript)
   └─ Depends on: API (for data)
5. Gaming Platform (web/)
   └─ Depends on: PostgreSQL, API
6. Main Website (WordPress)
   └─ Depends on: CRM (for forms), API
7. n8n Automation
   └─ Depends on: ALL services (webhooks)

DEPLOYMENT ORDER:
DB Migrations → API → CRM → Frontend → Gaming → Website → n8n

RATIONALE: Foundation-first, dann Services, zuletzt Automation

```text

## Phase 4: Database Architecture & Migrations

### 4.1 Complete Database Matrix (17 Databases)

#### Plesk MariaDB (localhost:3306) - 5 DBs AKTIV
```

Via PostgreSQL MCP (adapted for MariaDB):
"Verify Plesk database connections"

| Service    | Database        | User             | Secret                  | Status    |
| ---------- | --------------- | ---------------- | ----------------------- | --------- |
| Website    | `mo_main`       | `svc_main`       | `MO_MAIN_DB_PASS`       | ✅ Active |
| Votes      | `mo_votes`      | `svc_votes`      | `MO_VOTES_DB_PASS`      | ✅ Active |
| Support    | `mo_support`    | `svc_support`    | `MO_SUPPORT_DB_PASS`    | ✅ Active |
| Newsletter | `mo_newsletter` | `svc_newsletter` | `MO_NEWSLETTER_DB_PASS` | ✅ Active |
| Forum      | `mo_forum`      | `svc_forum`      | `MO_FORUM_DB_PASS`      | ✅ Active |

CONNECTION STRING:
mysql://svc_main:$MO_MAIN_DB_PASS@localhost:3306/mo_main

PLESK LIMIT: Max 5 Datenbanken → ALLE SLOTS BELEGT

```text

#### External MariaDB ($MYSQL_HOST:3306) - 9 DBs PROVISION
```

Via PostgreSQL MCP:
"Provision external MariaDB databases"

| Service       | Database       | User            | Secret                 | Status   |
| ------------- | -------------- | --------------- | ---------------------- | -------- |
| CRM (Drupal)  | `mo_crm`       | `svc_crm`       | `MO_CRM_DB_PASS`       | 🆕 Setup |
| n8n           | `mo_n8n`       | `svc_n8n`       | `MO_N8N_DB_PASS`       | 🆕 Setup |
| Webhooks      | `mo_hooks`     | `svc_hooks`     | `MO_HOOKS_DB_PASS`     | 🆕 Setup |
| Consent/DSGVO | `mo_consent`   | `svc_consent`   | `MO_CONSENT_DB_PASS`   | 🆕 Setup |
| Games         | `mo_games`     | `svc_games`     | `MO_GAMES_DB_PASS`     | 🆕 Setup |
| Analytics     | `mo_analytics` | `svc_analytics` | `MO_ANALYTICS_DB_PASS` | 🆕 Setup |
| API Staging   | `mo_api_stg`   | `svc_api_stg`   | `MO_API_STG_DB_PASS`   | 🆕 Setup |
| Admin Staging | `mo_admin_stg` | `svc_admin_stg` | `MO_ADMIN_STG_DB_PASS` | 🆕 Setup |
| Nextcloud     | `mo_nextcloud` | `svc_nextcloud` | `MO_NEXTCLOUD_DB_PASS` | 🆕 Setup |

PROVISIONING SCRIPT (One-Time):
ssh root@$MYSQL_HOST << 'EOF'
for DB in crm n8n hooks consent games analytics api_stg admin_stg nextcloud; do
  mysql -u root -p << SQL
    CREATE DATABASE mo_$DB CHARACTER SET utf8mb4 COLLATE utf8mb4*unicode_ci;
CREATE USER 'svc*$DB'@'$PLESK*SERVER_IP' IDENTIFIED BY '\$MO*${DB^^}_DB_PASS';
    GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX 
      ON mo_$DB.\* TO 'svc\_$DB'@'$PLESK_SERVER_IP';
FLUSH PRIVILEGES;
SQL
done
EOF

FIREWALL: Only allow Plesk server IP
ufw allow from $PLESK_SERVER_IP to any port 3306 proto tcp
ufw deny 3306

```text

#### External PostgreSQL ($PG_HOST:5432) - 3 DBs PROVISION
```

Via PostgreSQL MCP:
"Setup PostgreSQL databases for specialized services"

| Service              | Database       | User            | Secret                 | Status   |
| -------------------- | -------------- | --------------- | ---------------------- | -------- |
| Keycloak (IdP)       | `mo_idp`       | `svc_idp`       | `PG_IDP_DB_PASS`       | 🆕 Setup |
| Grafana              | `mo_grafana`   | `svc_grafana`   | `PG_GRAFANA_DB_PASS`   | 🆕 Setup |
| Discourse (optional) | `mo_discourse` | `svc_discourse` | `PG_DISCOURSE_DB_PASS` | 🆕 Setup |

PROVISIONING:
ssh root@$PG_HOST << 'EOF'
sudo -u postgres psql << SQL
  CREATE USER svc_idp WITH ENCRYPTED PASSWORD '$PG_IDP_DB_PASS';
CREATE DATABASE mo_idp OWNER svc_idp TEMPLATE template1;
GRANT ALL PRIVILEGES ON DATABASE mo_idp TO svc_idp;

CREATE USER svc_grafana WITH ENCRYPTED PASSWORD '$PG_GRAFANA_DB_PASS';
CREATE DATABASE mo_grafana OWNER svc_grafana;
GRANT ALL PRIVILEGES ON DATABASE mo_grafana TO svc_grafana;

CREATE USER svc_discourse WITH ENCRYPTED PASSWORD '$PG_DISCOURSE_DB_PASS';
CREATE DATABASE mo_discourse OWNER svc_discourse;
GRANT ALL PRIVILEGES ON DATABASE mo_discourse TO svc_discourse;
SQL
EOF

FIREWALL:
ufw allow from $PLESK_SERVER_IP to any port 5432 proto tcp
ufw deny 5432

TLS/SSL Required: pg_hba.conf
hostssl mo_idp svc_idp $PLESK_SERVER_IP/32 scram-sha-256
hostssl mo_grafana svc_grafana $PLESK_SERVER_IP/32 scram-sha-256

```text

### 4.2 Connection Validation (Pre-Migration)
```

Via PostgreSQL MCP:
"Test all 17 database connections from Plesk server"

# SSH to Plesk

ssh -i $SSH_PRIVATE_KEY -p $SSH_PORT $SSH_USER@$SSH_HOST

# Test Plesk MariaDB (localhost)

for DB in mo*main mo_votes mo_support mo_newsletter mo_forum; do
mysql -u svc*${DB#mo_} -p$DB_PASS -e "SELECT 1 FROM DUAL;" 2>&1 && \
 echo "✅ $DB OK" || echo "❌ $DB FAILED"
done

# Test External MariaDB

for DB in mo*crm mo_n8n mo_hooks mo_consent mo_games mo_analytics mo_api_stg mo_admin_stg mo_nextcloud; do
mysql -h $MYSQL_HOST -u svc*${DB#mo_} -p$DB_PASS -e "SELECT 1;" 2>&1 && \
 echo "✅ $DB OK" || echo "❌ $DB FAILED"
done

# Test PostgreSQL

for DB in mo*idp mo_grafana mo_discourse; do
PGPASSWORD=$DB_PASS psql -h $PG_HOST -U svc*${DB#mo\_} -d $DB -c "SELECT 1;" && \
 echo "✅ $DB OK" || echo "❌ $DB FAILED"
done

# Test Redis (optional)

redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD ping && echo "✅ Redis OK"

EXIT CODE 0 = All connections OK → Proceed with migrations

```text

### 4.3 Database Migrations (per Service)
```

Via Filesystem MCP:
"Backup ALL databases BEFORE migration"

BACKUP SCRIPT:
./scripts/db-backup-all.sh --timestamp $(date +%Y%m%d\_%H%M%S)

# For each database:

# - MariaDB: mysqldump --single-transaction --routines --triggers

# - PostgreSQL: pg_dump -Fc (compressed format)

# - Retention: 30 days local, 90 days S3

VERIFY: ls -lh backups/pre-migration-\*

Via Filesystem MCP:
"Apply Prisma migrations (PostgreSQL services)"

# Services using Prisma: mo_games, mo_idp, mo_grafana

for SERVICE in games idp grafana; do
export DATABASE*URL="postgresql://svc*$SERVICE:$PASS@$PG_HOST:5432/mo_$SERVICE"

# Dry-run

npx prisma migrate diff \
 --from-schema-datamodel schema.prisma \
 --to-schema-datasource $DATABASE_URL \
    --script > migration-preview-$SERVICE.sql

# Review

cat migration-preview-$SERVICE.sql

# Apply

npx prisma migrate deploy

# Validate

npx prisma db pull && npx prisma validate
done

Via PostgreSQL MCP:
"Verify schema integrity post-migration"

SELECT
schemaname,
tablename,
tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

# Compare with expected schema from schema.prisma

```text

### 4.4 Drupal/CiviCRM Migration (mo_crm)
```

Via Filesystem MCP:
"Run Drupal & CiviCRM database updates"

SSH: ssh $SSH_USER@$SSH_HOST
CD: cd /var/www/vhosts/.../subdomains/crm/httpdocs

# Drupal updates

drush updatedb -y
drush config:import -y # If config changes exist
drush entity:updates -y

# CiviCRM schema upgrade

cv upgrade:db

# Clear caches

drush cr
cv flush

# Verify

drush status | grep "Database"
cv api System.check

CONNECTION STRING:
mysql://svc_crm:$MO_CRM_DB_PASS@$MYSQL_HOST:3306/mo_crm

```text

### 4.5 Post-Migration Validation
```

Via PostgreSQL MCP:
"Run post-migration integrity checks"

FOR EACH DATABASE:

1. Row Counts Match
   SELECT COUNT(\*) FROM users; # Compare with pre-migration
2. Constraints Valid
   SELECT constraint_name, table_name
   FROM information_schema.table_constraints
   WHERE constraint_type = 'FOREIGN KEY';
3. Indexes Present
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE schemaname = 'public';
4. No Orphaned Records
   # Service-specific queries
5. Performance Test
   EXPLAIN ANALYZE SELECT ... (critical queries)

Via Filesystem MCP:
"Document migration results"

OUTPUT: quality-reports/db-migration-{{TIMESTAMP}}.md

INCLUDES:

- Migration duration per service
- Row counts before/after
- Schema changes applied
- Issues encountered
- Rollback instructions

```text

## Phase 5: API Backend Deployment

```

Via Filesystem MCP:
"Deploy API backend to Plesk"

SCRIPT: ./deployment-scripts/deploy-api-plesk.sh

STEPS:

1. Build production assets
   cd apps/api
   pip install -r requirements.txt
2. Run tests
   pytest tests/ --cov=app --cov-report=term-missing
3. Security scan
   trivy fs --severity HIGH,CRITICAL .
4. Deploy to Plesk
   rsync -avz --exclude='.env' \
    apps/api/ \
    plesk:${API_DEPLOY_TARGET}/
5. Restart service
   ssh plesk "systemctl restart api-fastapi"

Via Playwright MCP:
"Validate API health endpoint"

ENDPOINT: ${API_HEALTH_URL}

EXPECT:
{
"status": "healthy",
"version": "{{VERSION}}",
"database": "connected",
"timestamp": "{{ISO_TIMESTAMP}}"
}

IF UNHEALTHY:
→ Trigger automatic rollback
→ Restore previous version
→ Alert team via n8n webhook

```text

## Phase 6: CRM Deployment (Drupal + CiviCRM)

```

Via Filesystem MCP:
"Deploy CRM system"

SCRIPT: ./deployment-scripts/deploy-crm-plesk.sh

STEPS:

1. Put site in maintenance mode
   drush state:set system.maintenance_mode 1
2. Backup CiviCRM database
   drush civicrm-sql-dump > backups/civicrm-$(date +%Y%m%d).sql
3. Update Drupal core & modules
   composer install --no-dev --optimize-autoloader
   drush updatedb -y
   drush cache:rebuild
4. Update CiviCRM
   drush civicrm-upgrade-db
5. Clear all caches
   drush cr
   drush civicrm-flush
6. Exit maintenance mode
   drush state:set system.maintenance_mode 0

Via Playwright MCP:
"Run smoke tests on CRM"

TEST SCENARIOS:
□ Login as admin
□ Create test contact
□ Record test donation
□ Generate donation receipt
□ Verify CiviCRM ↔ API sync

IF FAILED:
→ Rollback Drupal: drush config:import --source=backups/config-{{TIMESTAMP}}
→ Restore DB: mysql < backups/civicrm-{{TIMESTAMP}}.sql

```text

## Phase 7: Frontend Deployment (React/TypeScript)

```

Via Filesystem MCP:
"Build and deploy frontend"

STEPS:

1. Install dependencies
   cd frontend
   npm ci --production
2. Build with production config
   npm run build
   # Output: apps/website/dist/
3. Optimize assets
   npm run build:analyze
   # Verify bundle size < 200KB
4. Run Lighthouse audit (pre-deploy)
   npm run lighthouse:ci
5. Deploy to Plesk
   rsync -avz --delete \
    apps/website/dist/ \
    plesk:${WEBSITE_DEPLOY_TARGET}/

Via Playwright MCP:
"Run E2E tests on deployed frontend"

CRITICAL USER FLOWS:
□ Homepage load (LCP < 2.5s)
□ Donation form submission
□ Membership registration
□ Email verification flow
□ Login/Logout

Via Playwright MCP:
"Run accessibility audit"

EXPECT:

- WCAG AA compliance
- No broken links
- All images have alt text
- Form labels correct
- Keyboard navigation works

```text

## Phase 8: Gaming Platform Deployment

```

Via Filesystem MCP:
"Deploy educational games"

STEPS:

1. Build game assets
   cd web
   npm run build:games
2. Optimize images
   npm run optimize:images
3. Generate service worker for offline play
   npm run sw:generate
4. Deploy to Plesk
   rsync -avz web/ plesk:/var/www/vhosts/menschlichkeit-oesterreich.at/web/

Via Playwright MCP:
"Test game functionality"

GAME TESTS:
□ Voting Puzzle loads
□ Constitution Quest playable
□ Democracy Simulator interactive
□ XP calculation correct
□ Achievement unlocking works
□ Leaderboard updates

Via PostgreSQL MCP:
"Verify game session logging"

SELECT
game_type,
COUNT(\*) as sessions,
AVG(xp_earned) as avg_xp
FROM game_sessions
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY game_type;

```text

## Phase 9: Website Deployment (WordPress)

```

Via Filesystem MCP:
"Deploy main WordPress website"

STEPS:

1. Backup WordPress database
   wp db export backups/wordpress-$(date +%Y%m%d).sql
2. Update WordPress core
   wp core update
   wp core update-db
3. Update plugins
   wp plugin update --all
4. Update theme
   rsync -avz website/themes/menschlichkeit/ \
    plesk:/var/www/vhosts/menschlichkeit-oesterreich.at/wp-content/themes/
5. Clear cache
   wp cache flush
6. Regenerate .htaccess
   wp rewrite flush

Via Playwright MCP:
"Validate WordPress site"

TESTS:
□ Homepage accessible
□ Contact form works
□ Donation widget integrated
□ CMS editable (admin check)
□ SEO meta tags present

```text

## Phase 10: n8n Automation Deployment

```

Via Filesystem MCP:
"Deploy n8n workflows"

STEPS:

1. Export workflows from local
   npm run n8n:export
2. Backup production workflows
   ssh plesk "docker exec n8n n8n export:workflow --all --output=/backups/"
3. Deploy new workflows
   scp automation/n8n/workflows/\*.json \
    plesk:/var/n8n/workflows/
4. Import to production n8n
   ssh plesk "docker exec n8n n8n import:workflow --input=/workflows/"
5. Activate workflows
   ssh plesk "docker exec n8n n8n update:workflow --all --active=true"

Via Filesystem MCP:
"Test n8n webhook endpoints"

WEBHOOKS:
□ Build notification → Slack
□ Design token sync → GitHub
□ Quality reports → Email
□ Security alerts → PagerDuty

VALIDATE:
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/test \
 -H "Content-Type: application/json" \
 -d '{"test": true}'

```text

## Phase 11: Smoke Tests (Playwright MCP)

```

Via Playwright MCP:
"Run comprehensive smoke test suite"

CRITICAL PATH TESTS:

1. User Journey: Spende tätigen
   - Navigate to /spenden
   - Fill donation form
   - Submit payment (test mode)
   - Verify donation in CRM
   - Check API recorded donation
2. User Journey: Mitglied werden
   - Navigate to /mitglied-werden
   - Fill registration form
   - Verify email sent
   - Click verification link
   - Confirm membership in CRM
3. User Journey: Spiel spielen
   - Navigate to /games
   - Select "Voting Puzzle"
   - Complete level 1
   - Verify XP awarded
   - Check achievement unlocked

PERFORMANCE BENCHMARKS:
□ Homepage LCP < 2.5s
□ API response time < 100ms
□ Database queries < 50ms
□ All Lighthouse scores ≥ 90

IF ANY TEST FAILS:
→ STOP deployment
→ Investigate failure
→ Fix or rollback

```text

## Phase 12: Traffic Shifting (Blue-Green Deployment)

```

Via Filesystem MCP:
"Configure nginx for blue-green deployment"

FILE: deployment-scripts/nginx/blue-green.conf

upstream api_blue {
server api-v1.internal:8001;
}

upstream api_green {
server api-v2.internal:8001;
}

server {
location /api/ { # Initial: 100% blue (current), 0% green (new)
proxy_pass http://api_blue;

    # Gradual shift:
    # 1. 90% blue, 10% green (canary)
    # 2. 50% blue, 50% green
    # 3. 0% blue, 100% green (full rollout)

}
}

DEPLOYMENT STRATEGY:

1. Deploy new version to "green" (inactive)
2. Run smoke tests on green
3. Shift 10% traffic to green (canary)
4. Monitor for 15 minutes
   - Error rate
   - Response time
   - User complaints
5. If healthy → Shift 100% to green
6. If issues → Rollback to 100% blue

Via Memory MCP:
"Track deployment metrics during traffic shift"

MONITOR:

- Error rate per service
- Response time P95
- User session errors
- Database connection pool

```text

## Phase 13: Post-Deployment Validation

```

Via GitHub MCP:
"Create deployment tracking issue"

TEMPLATE:

# Deployment: {{VERSION}} to Production

## Deployment Details

- **Date:** {{DATE}}
- **Commit:** {{COMMIT_SHA}}
- **Services Updated:** API, CRM, Frontend, Gaming, Website, n8n
- **Downtime:** 0 seconds (blue-green)

## Health Checks

- [x] API: Healthy ✅
- [x] CRM: Healthy ✅
- [x] Frontend: Healthy ✅
- [x] Gaming: Healthy ✅
- [x] Website: Healthy ✅
- [x] n8n: Healthy ✅

## Performance Benchmarks

- Homepage LCP: 1.8s ✅ (target < 2.5s)
- API Response: 65ms ✅ (target < 100ms)
- Lighthouse Performance: 94 ✅ (target ≥ 90)

## Post-Deployment Tasks

- [ ] Monitor error logs for 24h
- [ ] Verify cron jobs running
- [ ] Check backup completion
- [ ] Update changelog
- [ ] Notify stakeholders

Via Playwright MCP:
"Run full regression test suite"

SCHEDULE: Every 4 hours for first 24h post-deployment

Via Filesystem MCP:
"Update CHANGELOG.md"

## [{{VERSION}}] - {{DATE}}

### Added

- New feature X
- Performance optimization Y

### Changed

- Updated dependency Z

### Fixed

- Bug #123: Description

### Security

- Patched vulnerability CVE-2024-XXXXX

```text

## Phase 14: Monitoring & Alerting

```

Via Filesystem MCP:
"Configure post-deployment monitoring"

METRICS TO TRACK:

1. Application Health
   - Uptime
   - Error rate
   - Response time
   - Request volume
2. Infrastructure
   - CPU usage
   - Memory usage
   - Disk space
   - Network traffic
3. Business Metrics
   - Donations per hour
   - New registrations
   - Game sessions
   - Form submissions

ALERTING RULES:
□ Error rate > 1% → PagerDuty alert
□ Response time P95 > 500ms → Slack notification
□ Database connections > 80% → Email to ops
□ Disk space < 20% → Critical alert

Via n8n:
"Send deployment success notification"

WEBHOOK: https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-success

PAYLOAD:
{
"version": "{{VERSION}}",
"timestamp": "{{TIMESTAMP}}",
"services": ["api", "crm", "frontend", "gaming", "website", "n8n"],
"health": "all_healthy",
"metrics": {
"deployment_duration": "18m 32s",
"downtime": "0s",
"tests_passed": 47,
"lighthouse_score": 94
}
}

```text

## Phase 15: Rollback Strategy (if needed)

```

Via Filesystem MCP:
"Prepare rollback procedure"

ROLLBACK TRIGGERS:
□ Error rate > 5%
□ Critical functionality broken
□ Security vulnerability detected
□ Database corruption
□ User reports flooding in

ROLLBACK STEPS:

1. IMMEDIATE: Stop new deployments
   ssh plesk "systemctl stop api-fastapi"
2. Restore previous Docker images
   docker pull registry/api:{{PREVIOUS_VERSION}}
   docker run -d --name api registry/api:{{PREVIOUS_VERSION}}
3. Rollback database (if migrations applied)
   npx prisma migrate resolve --rolled-back {{MIGRATION_NAME}}
   psql < backups/db-before-migration.sql
4. Rollback nginx config
   cp /etc/nginx/sites-available/api.conf.backup \
    /etc/nginx/sites-available/api.conf
   nginx -t && systemctl reload nginx
5. Shift 100% traffic to previous version (blue)
6. Verify rollback success
   curl "${API_HEALTH_URL}"
7. Post-mortem
   Via GitHub MCP:
   "Create post-mortem issue for failed deployment"

PREVENTION:

- More thorough staging tests
- Gradual rollout (10% → 50% → 100%)
- Better monitoring
- Automated rollback on threshold breach

```text

## Phase 16: Deployment Report

```

Via Memory MCP:
"Generate comprehensive deployment report"

# Deployment Report: v{{VERSION}} to Production

## Summary

- **Status:** ✅ SUCCESS
- **Duration:** 18m 32s
- **Downtime:** 0s (blue-green)
- **Services Updated:** 6/6
- **Tests Passed:** 47/47
- **Rollback:** Not required

## Performance Comparison

| Metric                  | Before | After | Change  |
| ----------------------- | ------ | ----- | ------- |
| API Response Time (P95) | 85ms   | 65ms  | -23% ✅ |
| Homepage LCP            | 2.1s   | 1.8s  | -14% ✅ |
| Database Query Time     | 48ms   | 42ms  | -12% ✅ |
| Lighthouse Performance  | 91     | 94    | +3 ✅   |

## Security

- ✅ 0 Dependabot alerts
- ✅ 0 Gitleaks findings
- ✅ Trivy scan passed
- ✅ DSGVO compliance verified

## Quality Gates

- ✅ Maintainability: 87%
- ✅ Code Coverage: 82%
- ✅ Duplication: 1.2%
- ✅ Accessibility: WCAG AA

## Issues Encountered

- None

## Lessons Learned

- Blue-green deployment eliminated downtime
- Gradual traffic shifting caught no issues (good sign)
- Automated smoke tests saved 2h manual testing

## Next Deployment

- Scheduled: {{NEXT_DEPLOYMENT_DATE}}
- Planned Features: [List]

Via GitHub MCP:
"Save report to quality-reports/deployment-{{VERSION}}.md"

Via GitHub MCP:
"Close deployment issue #{{ISSUE_NUMBER}}"

```text

---

**Erwartetes Ergebnis:**
1. Alle 6 Services erfolgreich deployed
2. 0 Downtime (blue-green deployment)
3. Alle Smoke Tests passed
4. Performance Benchmarks erfüllt
5. Rollback-Strategie dokumentiert und getestet
6. Monitoring & Alerting aktiv
7. Deployment Report generiert

**Rollback-SLA:** < 5 Minuten vom Trigger bis wiederhergestellter Service

**Post-Deployment:** 24h intensives Monitoring, dann normale Überwachung
```

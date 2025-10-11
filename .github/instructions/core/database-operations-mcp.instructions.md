---
title: Database Operations with MCP
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: critical
category: core
applyTo: **/*.{sql,prisma,js,ts,py,php}
---
# Database Operations with MCP

## 🗄️ Complete Database Architecture

### Database Matrix (17 Total)

#### Tier 1: Plesk MariaDB (localhost:3306) - LIMIT: 5 Databases
```sql
-- HOST: localhost (Plesk internal)
-- PORT: 3306
-- ENGINE: MariaDB 10.6+
-- LIMIT: Max 5 Datenbanken (ALLE SLOTS BELEGT)

1. mo_main       → svc_main       → Website (WordPress)
2. mo_votes      → svc_votes      → Voting System
3. mo_support    → svc_support    → Support Tickets
4. mo_newsletter → svc_newsletter → Newsletter Management
5. mo_forum      → svc_forum      → Community Forum
```

#### Tier 2: External MariaDB ($MYSQL_HOST:3306) - 9 Databases
```sql
-- HOST: external-mysql.menschlichkeit-oesterreich.at
-- PORT: 3306
-- ENGINE: MariaDB 10.11+
-- TLS: Required
-- FIREWALL: Only Plesk IP allowed

1. mo_crm        → svc_crm        → Drupal 10 + CiviCRM
2. mo_n8n        → svc_n8n        → n8n Automation Workflows
3. mo_hooks      → svc_hooks      → Webhook Logs & Queue
4. mo_consent    → svc_consent    → DSGVO Consent Management
5. mo_games      → svc_games      → Educational Gaming Platform
6. mo_analytics  → svc_analytics  → Analytics & Reporting
7. mo_api_stg    → svc_api_stg    → API Staging Environment
8. mo_admin_stg  → svc_admin_stg  → Admin Staging Environment
9. mo_nextcloud  → svc_nextcloud  → Nextcloud File Storage
```

#### Tier 3: External PostgreSQL ($PG_HOST:5432) - 3 Databases
```sql
-- HOST: external-pg.menschlichkeit-oesterreich.at
-- PORT: 5432
-- ENGINE: PostgreSQL 16+
-- TLS: Required (TLSv1.3)
-- FIREWALL: Only Plesk IP allowed

1. mo_idp       → svc_idp       → Keycloak Identity Provider
2. mo_grafana   → svc_grafana   → Grafana Metrics & Dashboards
3. mo_discourse → svc_discourse → Discourse Forum (optional)
```

#### Optional: Redis ($REDIS_HOST:6379)
```text
-- HOST: external-redis.menschlichkeit-oesterreich.at
-- PORT: 6379
-- ENGINE: Redis 7+
-- TLS: Recommended
-- USE CASES: Session storage, caching, rate limiting
```

---

## MCP-Driven Database Operations

### 1. Connection Testing

#### Via PostgreSQL MCP
```markdown
"Test all 17 database connections from Plesk server"

COMMAND:
ssh -i $SSH_PRIVATE_KEY -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'

# Plesk MariaDB (localhost)
for DB in mo_main mo_votes mo_support mo_newsletter mo_forum; do
  USER="svc_${DB#mo_}"
  PASS="${DB^^}_DB_PASS"
  mysql -u $USER -p${!PASS} -e "SELECT 1 FROM DUAL;" 2>&1 \
    && echo "✅ $DB OK" \
    || echo "❌ $DB FAILED"
done

# External MariaDB
for DB in mo_crm mo_n8n mo_hooks mo_consent mo_games mo_analytics mo_api_stg mo_admin_stg mo_nextcloud; do
  USER="svc_${DB#mo_}"
  PASS="${DB^^}_DB_PASS"
  mysql -h $MYSQL_HOST -u $USER -p${!PASS} --ssl-mode=REQUIRED -e "SELECT 1;" 2>&1 \
    && echo "✅ $DB OK" \
    || echo "❌ $DB FAILED"
done

# PostgreSQL
for DB in mo_idp mo_grafana mo_discourse; do
  USER="svc_${DB#mo_}"
  PASS="PG_${DB^^}_DB_PASS"
  PGPASSWORD=${!PASS} psql \
    "postgresql://$USER@$PG_HOST:5432/$DB?sslmode=require" \
    -c "SELECT 1;" 2>&1 \
    && echo "✅ $DB OK" \
    || echo "❌ $DB FAILED"
done

# Redis (optional)
redis-cli -h $REDIS_HOST -p 6379 --tls -a $REDIS_PASSWORD ping \
  && echo "✅ Redis OK" \
  || echo "⚠️ Redis unavailable (optional)"

EOF

EXPECTED OUTPUT:
✅ mo_main OK
✅ mo_votes OK
... (all 17 databases)

SUMMARY: {{CONNECTED}}/17 databases reachable
```

### 2. Schema Inspection

#### Prisma-based Services (PostgreSQL)
```markdown
Via PostgreSQL MCP:
"Inspect schema for mo_games database"

CONNECTION:
postgresql://svc_games:$MO_GAMES_DB_PASS@$PG_HOST:5432/mo_games?sslmode=require

QUERY:
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('User', 'Achievement', 'GameSession')
ORDER BY table_name, ordinal_position;

COMPARE WITH: schema.prisma

EXPECTED TABLES:
- User (id, email, displayName, xp, level, createdAt)
- Achievement (id, title, description, xpReward, type, unlockedBy[])
- GameSession (id, userId, gameType, score, xpEarned, completedAt)
```

#### Drupal/CiviCRM (MariaDB)
```markdown
Via PostgreSQL MCP (adapted for MariaDB):
"Inspect CRM database schema"

CONNECTION:
mysql://svc_crm:$MO_CRM_DB_PASS@$MYSQL_HOST:3306/mo_crm?ssl-mode=REQUIRED

QUERY (CiviCRM Core Tables):
SHOW TABLES LIKE 'civicrm_%';

EXPECTED (>100 tables):
- civicrm_contact
- civicrm_contribution
- civicrm_event
- civicrm_participant
- civicrm_membership
... etc.

DRUPAL CORE TABLES:
SHOW TABLES LIKE 'drupal_%';

VALIDATE:
- No orphaned tables
- Foreign keys intact
- Indexes present
```

### 3. Data Integrity Checks

#### DSGVO-Critical: PII Encryption Validation
```markdown
Via PostgreSQL MCP:
"Check PII encryption status in all databases"

FOR EACH DATABASE WITH PII:

# mo_crm (CiviCRM)
SELECT 
  COUNT(*) as total_contacts,
  COUNT(CASE WHEN email IS NULL THEN 1 END) as missing_email,
  COUNT(CASE WHEN LENGTH(email_encrypted) > 0 THEN 1 END) as encrypted_emails
FROM civicrm_contact;

EXPECTED: encrypted_emails = total_contacts - missing_email

# mo_consent
SELECT 
  COUNT(*) as total_consents,
  COUNT(CASE WHEN consent_timestamp IS NOT NULL THEN 1 END) as with_timestamp,
  COUNT(CASE WHEN ip_hash IS NOT NULL THEN 1 END) as with_ip_hash
FROM consent_records;

EXPECTED: All records have timestamp & hashed IP (not plain IP)

# mo_newsletter
SELECT 
  COUNT(*) as subscribers,
  COUNT(CASE WHEN email_encrypted IS NOT NULL THEN 1 END) as encrypted
FROM subscribers;

EXPECTED: encrypted = subscribers

IF ANY UNENCRYPTED PII FOUND:
  ❌ CRITICAL SECURITY ISSUE
  ACTION: 
    1. Stop affected services
    2. Encrypt PII immediately
    3. Audit logs for exposure
    4. Notify DPO (DSGVO-Pflicht)
```

#### Referential Integrity
```markdown
Via PostgreSQL MCP:
"Validate foreign key constraints across all databases"

FOR EACH DATABASE:

# PostgreSQL (mo_games, mo_idp, mo_grafana)
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conname;

# MariaDB (all others)
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  REFERENCED_TABLE_NAME,
  UPDATE_RULE,
  DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
ORDER BY CONSTRAINT_NAME;

VALIDATE:
- All foreign keys valid
- No orphaned records
- Cascade rules correct (SET NULL, CASCADE, RESTRICT)

TEST QUERY (mo_games example):
SELECT COUNT(*) FROM "GameSession" 
WHERE "userId" NOT IN (SELECT id FROM "User");

EXPECTED: 0 (no orphaned game sessions)
```

### 4. Performance Monitoring

#### Slow Query Detection
```markdown
Via PostgreSQL MCP:
"Identify slow queries across all databases"

# PostgreSQL (enable pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_exec_time / 1000 AS total_time_seconds,
  mean_exec_time / 1000 AS mean_time_seconds,
  max_exec_time / 1000 AS max_time_seconds
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

# MariaDB (enable slow query log)
SELECT 
  query_time,
  lock_time,
  rows_sent,
  rows_examined,
  sql_text
FROM mysql.slow_log
WHERE query_time > 1  -- queries slower than 1s
ORDER BY query_time DESC
LIMIT 20;

ACTION FOR SLOW QUERIES:
1. Add indexes (if missing)
2. Optimize query (rewrite, use joins instead of subqueries)
3. Add caching layer (Redis)
4. Consider partitioning (large tables)
```

#### Connection Pool Status
```markdown
Via PostgreSQL MCP:
"Monitor database connection pools"

# PostgreSQL
SELECT 
  datname AS database,
  numbackends AS connections,
  xact_commit AS commits,
  xact_rollback AS rollbacks,
  blks_read AS disk_reads,
  blks_hit AS cache_hits,
  ROUND(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2) AS cache_hit_ratio
FROM pg_stat_database
WHERE datname NOT IN ('postgres', 'template0', 'template1')
ORDER BY numbackends DESC;

# MariaDB
SHOW PROCESSLIST;

ALERT IF:
- connections > max_connections * 0.8 (80% pool utilization)
- cache_hit_ratio < 95% (inefficient caching)
- rollbacks > commits * 0.1 (10% transaction failure rate)
```

### 5. Backup & Restore

#### Automated Backups (Pre-Deployment)
```markdown
Via Filesystem MCP:
"Run comprehensive database backup"

SCRIPT: ./scripts/db-backup-all.sh

FOR EACH DATABASE:

# MariaDB (Plesk + External)
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --host=$HOST \
  --user=$USER \
  --password=$PASS \
  --ssl-mode=REQUIRED \
  $DATABASE | gzip > backups/$DATABASE-$(date +%Y%m%d_%H%M%S).sql.gz

# PostgreSQL
pg_dump \
  --format=custom \
  --compress=9 \
  --host=$PG_HOST \
  --username=$USER \
  --dbname=$DATABASE \
  "postgresql://$USER:$PASS@$PG_HOST:5432/$DATABASE?sslmode=require" \
  > backups/$DATABASE-$(date +%Y%m%d_%H%M%S).dump

VERIFY:
ls -lh backups/
# Expect: 17 backup files (one per database)

RETENTION:
- Local: 30 days
- S3 Offsite: 90 days
- Archive: 7 years (DSGVO-Aufbewahrungspflicht für Spenden)

CRON JOB:
0 2 * * * /var/www/vhosts/.../scripts/db-backup-all.sh
```

#### Restore Procedure
```markdown
Via PostgreSQL MCP:
"Restore database from backup"

BEFORE RESTORE:
1. Stop affected services
2. Create safety backup (current state)
3. Verify backup file integrity

# MariaDB Restore
mysql -h $HOST -u $USER -p$PASS --ssl-mode=REQUIRED $DATABASE \
  < backups/$DATABASE-$TIMESTAMP.sql.gz

# PostgreSQL Restore
pg_restore \
  --host=$PG_HOST \
  --username=$USER \
  --dbname=$DATABASE \
  --clean \
  --if-exists \
  --verbose \
  backups/$DATABASE-$TIMESTAMP.dump

AFTER RESTORE:
1. Restart services
2. Run integrity checks (referential integrity, PII encryption)
3. Validate application functionality (smoke tests)
4. Monitor error logs
```

### 6. Migration Management

#### Prisma Migrations (PostgreSQL)
```markdown
Via Filesystem MCP + PostgreSQL MCP:
"Apply Prisma migrations for all PostgreSQL services"

SERVICES: mo_games, mo_idp, mo_grafana

FOR EACH SERVICE:

1. Set DATABASE_URL
   export DATABASE_URL="postgresql://svc_$SERVICE:$PASS@$PG_HOST:5432/mo_$SERVICE?sslmode=require"

2. Dry-Run Migration
   npx prisma migrate diff \
     --from-schema-datamodel schema.prisma \
     --to-schema-datasource $DATABASE_URL \
     --script > migration-preview-$SERVICE.sql

3. Review Migration SQL
   cat migration-preview-$SERVICE.sql
   
   CHECK FOR:
   - Data loss (DROP COLUMN without backup)
   - Breaking changes (NOT NULL on existing columns)
   - Performance impact (adding indexes to large tables)

4. Backup Database (pre-migration)
   pg_dump -Fc $DATABASE_URL > backups/pre-migration-$SERVICE-$(date +%Y%m%d).dump

5. Apply Migration
   npx prisma migrate deploy

6. Validate Schema
   npx prisma db pull
   npx prisma validate

7. Generate Client
   npx prisma generate

8. Test Application
   npm run test:integration -- --filter=$SERVICE

IF MIGRATION FAILS:
  ROLLBACK:
    npx prisma migrate resolve --rolled-back $MIGRATION_NAME
    pg_restore backups/pre-migration-$SERVICE-*.dump
```

#### Drupal/CiviCRM Updates (mo_crm)
```markdown
Via Filesystem MCP:
"Run Drupal & CiviCRM database updates"

SSH: ssh $SSH_USER@$SSH_HOST
CD: cd /var/www/vhosts/.../subdomains/crm/httpdocs

1. Maintenance Mode ON
   drush state:set system.maintenance_mode 1 --yes

2. Backup Database
   drush sql:dump --gzip --result-file=/backups/crm-pre-update-$(date +%Y%m%d).sql

3. Drupal Core Updates
   drush updatedb --yes
   drush config:import --yes  # If config changes exist
   drush entity:updates --yes

4. CiviCRM Schema Updates
   cv upgrade:db

5. Clear Caches
   drush cache:rebuild
   cv flush

6. Verify
   drush status
   cv api System.check

7. Maintenance Mode OFF
   drush state:set system.maintenance_mode 0 --yes

8. Smoke Test
   curl -f https://crm.menschlichkeit-oesterreich.at/civicrm/dashboard
```

### 7. DSGVO Compliance Operations

#### Data Subject Access Request (DSAR)
```markdown
Via PostgreSQL MCP:
"Extract all data for user email={{EMAIL}}"

DATABASES TO CHECK:
- mo_crm (CiviCRM contact data)
- mo_consent (consent records)
- mo_newsletter (subscriptions)
- mo_games (user profile, game sessions)
- mo_support (support tickets)
- mo_hooks (webhook logs with user context)

QUERY (mo_crm example):
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  a.street_address,
  a.city,
  a.postal_code,
  cont.contribution_date,
  cont.total_amount
FROM civicrm_contact c
LEFT JOIN civicrm_address a ON c.id = a.contact_id
LEFT JOIN civicrm_contribution cont ON c.id = cont.contact_id
WHERE c.email = '{{EMAIL}}';

OUTPUT FORMAT:
- JSON (machine-readable)
- PDF (human-readable, signed)
- RETENTION: 30 days, then delete

COMPLIANCE:
✅ Art. 15 DSGVO (Auskunftsrecht)
✅ Within 30 days
✅ Free of charge (first request)
```

#### Right to be Forgotten (RTBF)
```markdown
Via PostgreSQL MCP:
"Delete user data for email={{EMAIL}}"

⚠️ CRITICAL: Require legal review BEFORE execution

1. Verify Legal Basis for Deletion
   □ User request authenticated?
   □ No legal retention obligation? (e.g., tax law: 7 years)
   □ DPO approval obtained?

2. Anonymize/Delete Data (per database)

# mo_crm (CiviCRM)
UPDATE civicrm_contact 
SET 
  first_name = 'DELETED',
  last_name = 'USER',
  email = CONCAT('deleted_', id, '@anonymized.local'),
  phone = NULL,
  deleted_at = NOW()
WHERE email = '{{EMAIL}}';

# mo_games
UPDATE "User"
SET 
  email = CONCAT('deleted_', id, '@anonymized.local'),
  displayName = 'Deleted User',
  deletedAt = NOW()
WHERE email = '{{EMAIL}}';

# mo_consent
UPDATE consent_records
SET 
  email_hash = SHA256(CONCAT('deleted_', id)),
  ip_hash = NULL,
  anonymized_at = NOW()
WHERE email_hash = SHA256('{{EMAIL}}');

3. Verify Deletion
   SELECT COUNT(*) FROM {{TABLE}} WHERE email = '{{EMAIL}}';
   EXPECTED: 0

4. Audit Log
   INSERT INTO deletion_audit_log (email_hash, timestamp, reason, approved_by)
   VALUES (SHA256('{{EMAIL}}'), NOW(), 'RTBF request', '{{DPO_NAME}}');

COMPLIANCE:
✅ Art. 17 DSGVO (Recht auf Löschung)
✅ Within 30 days
✅ Proof of deletion retained (hashed)
```

### 8. Disaster Recovery

#### Complete System Restore
```markdown
Via PostgreSQL MCP + Filesystem MCP:
"Restore all 17 databases from disaster recovery backup"

SCENARIO: Complete database server failure

1. Provision New Database Servers
   - External MariaDB: 16GB RAM, 500GB SSD
   - External PostgreSQL: 8GB RAM, 200GB SSD
   - Redis: 4GB RAM, 50GB SSD

2. Configure Firewall (only Plesk IP)
   ufw allow from $PLESK_SERVER_IP to any port 3306
   ufw allow from $PLESK_SERVER_IP to any port 5432
   ufw enable

3. Restore from S3 Backups
   aws s3 sync s3://mo-db-backups/latest/ ./restore/

4. Import Databases (parallel)
   FOR EACH MARIADB_DB in [mo_crm, mo_n8n, ...]:
     mysql -h $MYSQL_HOST -u root -p \
       < restore/$DB-latest.sql &
   
   FOR EACH PG_DB in [mo_idp, mo_grafana, mo_discourse]:
     pg_restore --dbname=$DB --clean \
       restore/$DB-latest.dump &
   
   wait  # Wait for all imports to complete

5. Update Connection Strings
   Via Filesystem MCP:
   "Update .env.deployment with new DB hosts"

6. Validate Integrity
   FOR EACH DB:
     Run integrity checks (referential integrity, PII encryption)

7. Restart All Services
   ssh $SSH_USER@$SSH_HOST << 'EOF'
     systemctl restart api-fastapi
     systemctl restart php-fpm
     systemctl restart nginx
     docker restart n8n
   EOF

8. Run Full Smoke Tests
   Via Playwright MCP:
   "Run E2E tests for all critical user flows"

EXPECTED RTO: < 4 hours (Recovery Time Objective)
EXPECTED RPO: < 24 hours (Recovery Point Objective - last backup)
```

---

## GitHub Secrets for Database Credentials

### Required Secrets (50+ total)

#### SSH/Deployment
```text
SSH_HOST
SSH_PORT
SSH_USER
SSH_PRIVATE_KEY
PLESK_API_KEY
```

#### Database Hosts
```text
MYSQL_HOST                  # External MariaDB server
PG_HOST                     # External PostgreSQL server
REDIS_HOST                  # Redis cache server
```

#### Plesk MariaDB (localhost)
```text
MO_MAIN_DB_PASS
MO_VOTES_DB_PASS
MO_SUPPORT_DB_PASS
MO_NEWSLETTER_DB_PASS
MO_FORUM_DB_PASS
```

#### External MariaDB
```text
MO_CRM_DB_PASS
MO_N8N_DB_PASS
MO_HOOKS_DB_PASS
MO_CONSENT_DB_PASS
MO_GAMES_DB_PASS
MO_ANALYTICS_DB_PASS
MO_API_STG_DB_PASS
MO_ADMIN_STG_DB_PASS
MO_NEXTCLOUD_DB_PASS
```

#### PostgreSQL
```text
PG_IDP_DB_PASS
PG_GRAFANA_DB_PASS
PG_DISCOURSE_DB_PASS
```

#### Redis (optional)
```text
REDIS_PASSWORD
```

---

## Best Practices

### Security
```markdown
✅ DO:
- Use TLS/SSL for all external DB connections
- Rotate credentials every 90 days
- Use least privilege grants (no root/superuser)
- Hash PII (email, IP) in logs
- Encrypt PII at rest (AES-256)

❌ DON'T:
- Store credentials in code
- Use same password for multiple databases
- Allow public DB access (firewall required)
- Store plain-text PII
- Grant unnecessary privileges
```

### Performance
```markdown
✅ DO:
- Use connection pooling (max 20 per service)
- Add indexes for frequently queried columns
- Use EXPLAIN ANALYZE for slow queries
- Monitor query time (p95 < 100ms)
- Cache frequently accessed data (Redis)

❌ DON'T:
- Open new connection per request
- Use SELECT * (specify columns)
- Run unindexed queries on large tables
- Ignore slow query logs
- Cache PII (DSGVO violation)
```

### DSGVO Compliance
```markdown
✅ DO:
- Document data retention periods
- Implement automated deletion (expired data)
- Encrypt all PII
- Log consent timestamps
- Provide data export (DSAR)

❌ DON'T:
- Retain data indefinitely
- Store PII without legal basis
- Mix production & test data
- Forget to anonymize on deletion
- Ignore data subject rights
```

---

**Status:** ✅ Production Ready  
**Databases:** 17 (5 Plesk MariaDB + 9 External MariaDB + 3 PostgreSQL)  
**DSGVO:** Fully Compliant  
**Backup:** Daily automated + 90-day retention

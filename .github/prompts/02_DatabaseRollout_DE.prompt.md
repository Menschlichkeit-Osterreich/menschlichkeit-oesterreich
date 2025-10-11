---
title: "02 Databaserollout"
description: "Database Rollout & Operations"
lastUpdated: 2025-10-10
status: ACTIVE
category: database
tags: ['database', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['Backend Team', 'Database Administrators']
---

---
description: Vollständiger Datenbank-Rollout mit 17-DB-Architektur (5 Plesk + 12 extern) inkl. PostgreSQL MCP
priority: critical
category: database-infrastructure
execution_order: 2
requires: ["01_EmailDNSSetup_DE.prompt.md"]
updates_todo: true
---

# Database Rollout & Operations

**Ziel:** Vollständiger, ausführbarer Datenbank-Rollout für 17-Datenbank-Architektur

**Ausführen mit:** PostgreSQL MCP + GitHub MCP (Secrets) + Filesystem MCP (Config)

---

## 🏗️ Phase 1: Architektur-Übersicht

### Plesk MariaDB (5 DBs, bestehend, unangetastet)

```yaml
plesk_databases:
  mo_main:
    user: svc_main
    purpose: Hauptseite (WordPress/HTML)
    host: localhost
    
  mo_votes:
    user: svc_votes
    purpose: Voting-System
    host: localhost
    
  mo_support:
    user: svc_support
    purpose: Support-Ticketing
    host: localhost
    
  mo_newsletter:
    user: svc_newsletter
    purpose: Newsletter-Verwaltung
    host: localhost
    
  mo_forum:
    user: svc_forum
    purpose: Forum (phpBB/Vanilla)
    host: localhost
```

**Action Items:**
- [ ] Keine Änderungen an Plesk-DBs (Limit: 5/5 erreicht)
- [ ] Connection Strings dokumentieren via Filesystem MCP
- [ ] Backup-Status prüfen

---

### Externe MariaDB (9 DBs, neu)

```yaml
external_mariadb:
  host: EXTERNAL_MARIADB_HOST  # z.B. db-mariadb.provider.com
  port: 3306
  
  databases:
    mo_crm:
      user: svc_crm
      purpose: CRM (Drupal 10 + CiviCRM)
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_n8n:
      user: svc_n8n
      purpose: n8n Workflow Automation
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_hooks:
      user: svc_hooks
      purpose: Webhook-Management
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_consent:
      user: svc_consent
      purpose: DSGVO Consent Management
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_games:
      user: svc_games
      purpose: Educational Gaming Platform
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_analytics:
      user: svc_analytics
      purpose: Analytics/ETL (optional)
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_api_stg:
      user: svc_api_stg
      purpose: API Staging Environment
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_admin_stg:
      user: svc_admin_stg
      purpose: Admin Staging Environment
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
      
    mo_nextcloud:
      user: svc_nextcloud
      purpose: Nextcloud File Storage DB
      charset: utf8mb4
      collation: utf8mb4_unicode_ci
```

---

### Externe PostgreSQL (3 DBs, neu)

```yaml
external_postgresql:
  host: EXTERNAL_POSTGRESQL_HOST  # z.B. db-postgres.provider.com
  port: 5432
  
  databases:
    mo_idp:
      user: svc_idp
      purpose: Identity Provider (Keycloak)
      encoding: UTF8
      lc_collate: de_AT.UTF-8
      lc_ctype: de_AT.UTF-8
      
    mo_grafana:
      user: svc_grafana
      purpose: Grafana App-Metadata
      encoding: UTF8
      lc_collate: en_US.UTF-8
      lc_ctype: en_US.UTF-8
      
    mo_discourse:
      user: svc_discourse
      purpose: Discourse Forum (optional)
      encoding: UTF8
      lc_collate: en_US.UTF-8
      lc_ctype: en_US.UTF-8
```

---

## 🔒 Phase 2: Security & Firewall (Ausführen: VPS/Cloud Provider)

### Firewall Rules

```bash

# MariaDB (3306)
Allow from: PLESK_SERVER_IP only
Deny from: all

# PostgreSQL (5432)
Allow from: PLESK_SERVER_IP only
Deny from: all

# SSH (22)
Allow from: ADMIN_IP_1, ADMIN_IP_2
Deny from: all

# Redis (6379, optional)
Allow from: PLESK_SERVER_IP only
Deny from: all
```

**Action Items:**
- [ ] VPS/Cloud Firewall konfigurieren (Security Groups/iptables)
- [ ] Plesk Server IP dokumentieren: `PLESK_SERVER_IP=xxx.xxx.xxx.xxx`
- [ ] Test: Port-Scan von externer IP → Ports sollten closed sein
- [ ] Test: Connection von Plesk IP → Ports sollten open sein

**MCP Commands:**
```bash

# Via Filesystem MCP
"Create file config-templates/firewall-rules.sh with firewall configuration"

# Via GitHub MCP
"Create repository secret PLESK_SERVER_IP with Plesk server IP address"
```

---

### TLS/SSL Connections

```yaml
mariadb_tls:
  enabled: true
  require_ssl: REQUIRE  # Enforce TLS
  ca_cert: /path/to/ca-cert.pem
  client_cert: /path/to/client-cert.pem
  client_key: /path/to/client-key.pem

postgresql_ssl:
  sslmode: require  # oder verify-full
  sslrootcert: /path/to/root.crt
  sslcert: /path/to/postgresql.crt
  sslkey: /path/to/postgresql.key
```

**Action Items:**
- [ ] TLS-Zertifikate vom Provider generieren/downloaden
- [ ] Via Filesystem MCP: Certs in `secrets/db-certs/` speichern
- [ ] Connection Strings mit SSL-Parametern erweitern
- [ ] Test: `mysql --ssl-mode=REQUIRED -h HOST -u USER -p` → TLS aktiv?

---

## 🚀 Phase 3: Provisionierung (Ausführen: SQL via PostgreSQL MCP + Manual)

### MariaDB - DB & User Creation

**SQL Template (für jede externe MariaDB):**

```sql
-- Für mo_crm
CREATE DATABASE mo_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'svc_crm'@'PLESK_SERVER_IP' IDENTIFIED BY 'STRONG_RANDOM_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, DROP, CREATE VIEW 
  ON mo_crm.* TO 'svc_crm'@'PLESK_SERVER_IP';
FLUSH PRIVILEGES;

-- Wiederholen für: mo_n8n, mo_hooks, mo_consent, mo_games, mo_analytics, 
-- mo_api_stg, mo_admin_stg, mo_nextcloud
```

**Action Items:**
- [ ] Passwörter generieren: `openssl rand -base64 32` (für jeden User)
- [ ] Via GitHub MCP: Secrets anlegen (siehe Phase 4)
- [ ] SQL-Statements ausführen (via MySQL CLI oder Adminer)
- [ ] Smoke Test: `mysql -h HOST -u svc_crm -p mo_crm -e "SELECT 1;"`

**MCP Commands:**
```bash

# Via Terminal (Password Generation)
for db in crm n8n hooks consent games analytics api_stg admin_stg nextcloud; do
  echo "Password for svc_$db: $(openssl rand -base64 32)"
done

# Via GitHub MCP (Secrets)
"Create repository secret MO_CRM_DB_PASS with generated password"
```

---

### PostgreSQL - DB & User Creation

**SQL Template (für jede PostgreSQL DB):**

```sql
-- Für mo_idp
CREATE USER svc_idp WITH ENCRYPTED PASSWORD 'STRONG_RANDOM_PASSWORD';
CREATE DATABASE mo_idp 
  OWNER svc_idp 
  ENCODING 'UTF8' 
  LC_COLLATE 'de_AT.UTF-8' 
  LC_CTYPE 'de_AT.UTF-8'
  TEMPLATE template0;

-- Optional: Extensions
\c mo_idp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Wiederholen für: mo_grafana (en_US.UTF-8), mo_discourse (en_US.UTF-8)
```

**Action Items:**
- [ ] Passwörter generieren: `openssl rand -base64 32`
- [ ] Via GitHub MCP: Secrets anlegen (`PG_IDP_DB_PASS`, etc.)
- [ ] SQL via PostgreSQL MCP oder psql ausführen
- [ ] Smoke Test: `psql -h HOST -U svc_idp -d mo_idp -c "SELECT 1;"`

**MCP Commands:**
```bash

# Via PostgreSQL MCP
"Execute SQL: CREATE USER svc_idp WITH ENCRYPTED PASSWORD 'xxx'; CREATE DATABASE mo_idp OWNER svc_idp;"

# Via GitHub MCP
"Create repository secret PG_IDP_DB_PASS with generated password"
"Create repository secret PG_GRAFANA_DB_PASS with generated password"
```

---

## 🔐 Phase 4: Secrets Management (Ausführen: GitHub MCP)

### GitHub Secrets Struktur

```yaml
environments:
  production:
    # SSH/Deploy
    SSH_HOST: dmpl20230054.kasserver.com
    SSH_PORT: 22
    SSH_USER: dmpl20230054
    SSH_PRIVATE_KEY: "-----BEGIN OPENSSH PRIVATE KEY-----\n..."
    SSH_TARGET_DIR: /www/htdocs/w01234567
    
    # DB Hosts
    MYSQL_HOST: external-mariadb.provider.com
    MYSQL_PORT: 3306
    PG_HOST: external-postgres.provider.com
    PG_PORT: 5432
    REDIS_HOST: external-redis.provider.com  # optional
    REDIS_PORT: 6379
    
    # Plesk MariaDB (bestehend)
    MO_MAIN_DB_USER: svc_main
    MO_MAIN_DB_PASS: "xxx"
    MO_VOTES_DB_USER: svc_votes
    MO_VOTES_DB_PASS: "xxx"
    MO_SUPPORT_DB_USER: svc_support
    MO_SUPPORT_DB_PASS: "xxx"
    MO_NEWSLETTER_DB_USER: svc_newsletter
    MO_NEWSLETTER_DB_PASS: "xxx"
    MO_FORUM_DB_USER: svc_forum
    MO_FORUM_DB_PASS: "xxx"
    
    # Externe MariaDB
    MO_CRM_DB_USER: svc_crm
    MO_CRM_DB_PASS: "xxx"
    MO_N8N_DB_USER: svc_n8n
    MO_N8N_DB_PASS: "xxx"
    MO_HOOKS_DB_USER: svc_hooks
    MO_HOOKS_DB_PASS: "xxx"
    MO_CONSENT_DB_USER: svc_consent
    MO_CONSENT_DB_PASS: "xxx"
    MO_GAMES_DB_USER: svc_games
    MO_GAMES_DB_PASS: "xxx"
    MO_ANALYTICS_DB_USER: svc_analytics
    MO_ANALYTICS_DB_PASS: "xxx"
    MO_API_STG_DB_USER: svc_api_stg
    MO_API_STG_DB_PASS: "xxx"
    MO_ADMIN_STG_DB_USER: svc_admin_stg
    MO_ADMIN_STG_DB_PASS: "xxx"
    MO_NEXTCLOUD_DB_USER: svc_nextcloud
    MO_NEXTCLOUD_DB_PASS: "xxx"
    
    # PostgreSQL
    PG_IDP_DB_USER: svc_idp
    PG_IDP_DB_PASS: "xxx"
    PG_GRAFANA_DB_USER: svc_grafana
    PG_GRAFANA_DB_PASS: "xxx"
    PG_DISCOURSE_DB_USER: svc_discourse  # optional
    PG_DISCOURSE_DB_PASS: "xxx"
    
  staging:
    # Staging-spezifische Secrets (analog)
```

**Action Items:**
- [ ] Via GitHub MCP: Environment `production` anlegen mit Review-Gate
- [ ] Via GitHub MCP: Environment `staging` anlegen
- [ ] Alle Secrets in jeweiligem Environment anlegen
- [ ] Test: GitHub Actions Workflow mit Secret-Zugriff ausführen

**MCP Commands:**
```bash

# Via GitHub MCP
"Create environment production with required reviewers"
"Create environment secret SSH_HOST in production with value dmpl20230054.kasserver.com"
"Create environment secret MO_CRM_DB_PASS in production with generated password"

# ... für alle Secrets wiederholen
```

---

## 🔄 Phase 5: Migration & Konsolidierung (Ausführen: Manual + PostgreSQL MCP)

### Neu-Dienste (keine Migration nötig)

```yaml
direct_external:
  - mo_crm          # CiviCRM neu auf extern
  - mo_n8n          # n8n neu auf extern
  - mo_hooks        # Hooks neu auf extern
  - mo_consent      # Consent neu auf extern
  - mo_games        # Games nutzt bereits Prisma → extern
  - mo_idp          # Keycloak neu auf extern (PostgreSQL)
  - mo_grafana      # Grafana neu auf extern (PostgreSQL)
```

**Action Items:**
- [ ] Application Config aktualisieren (Connection Strings)
- [ ] Via Filesystem MCP: `.env.production` mit externen DB-Hosts erstellen
- [ ] Deployment durchführen
- [ ] Smoke Tests: Health-Checks für alle Services

---

### Bestehende Dienste (Optional: Migration)

**Nur wenn gewünscht: Plesk → Extern**

```bash

# MariaDB Migration
mysqldump --single-transaction \
  --host=localhost \
  --user=svc_votes \
  --password=XXX \
  mo_votes | gzip > mo_votes_$(date +%F).sql.gz

# Import auf extern
gunzip < mo_votes_$(date +%F).sql.gz | mysql \
  --host=EXTERNAL_MARIADB_HOST \
  --user=svc_votes \
  --password=XXX \
  mo_votes

# PostgreSQL Migration (falls nötig)
pg_dump -Fc -d mo_old -f mo_old_$(date +%F).dump
pg_restore -d mo_new -h EXTERNAL_PG_HOST -U svc_new mo_old_$(date +%F).dump
```

**Action Items:**
- [ ] Backup vor Migration: Vollständiger Dump aller zu migrierenden DBs
- [ ] Migration in Maintenance Window (Downtime minimieren)
- [ ] Connection Strings in Apps umstellen
- [ ] Integritätstest: Zeilen-Counts, Checksums
- [ ] Fallback-Plan: Restore aus Backup bei Problemen

---

## 💾 Phase 6: Backup & Recovery (Ausführen: Cron + Filesystem MCP)

### Backup Strategy

```yaml
backup_schedule:
  daily:
    time: "02:00 UTC"
    retention: 7 days
    type: full_dump
    
  weekly:
    time: "Sunday 03:00 UTC"
    retention: 4 weeks
    type: full_dump
    
  monthly:
    time: "1st of month 04:00 UTC"
    retention: 12 months
    type: full_dump + offsite_copy
```

### Backup Scripts

**MariaDB Backup:**

```bash
#!/bin/bash

# backup-mariadb.sh

TIMESTAMP=$(date +%F_%H-%M-%S)
BACKUP_DIR="/backup/mariadb"
DATABASES=(mo_crm mo_n8n mo_hooks mo_consent mo_games mo_analytics mo_api_stg mo_admin_stg mo_nextcloud)

for DB in "${DATABASES[@]}"; do
  mysqldump --single-transaction \
    --host="$MYSQL_HOST" \
    --user="svc_${DB#mo_}" \
    --password="$DB_PASS" \
    "$DB" | gzip > "$BACKUP_DIR/${DB}_${TIMESTAMP}.sql.gz"
done

# Retention: Delete backups older than 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

**PostgreSQL Backup:**

```bash
#!/bin/bash

# backup-postgresql.sh

TIMESTAMP=$(date +%F_%H-%M-%S)
BACKUP_DIR="/backup/postgresql"
DATABASES=(mo_idp mo_grafana mo_discourse)

for DB in "${DATABASES[@]}"; do
  pg_dump -Fc \
    -h "$PG_HOST" \
    -U "svc_${DB#mo_}" \
    -d "$DB" \
    -f "$BACKUP_DIR/${DB}_${TIMESTAMP}.dump"
done

# Retention
find "$BACKUP_DIR" -name "*.dump" -mtime +7 -delete
```

**Action Items:**
- [ ] Via Filesystem MCP: Backup-Scripts in `scripts/backup/` erstellen
- [ ] Cron Jobs auf DB-Server einrichten (täglich/wöchentlich/monatlich)
- [ ] Test: Backup-Script manuell ausführen, Output prüfen
- [ ] Test: Restore aus Backup durchführen (Test-DB)
- [ ] Offsite-Backup: S3/Cloud-Storage konfigurieren

**MCP Commands:**
```bash

# Via Filesystem MCP
"Create file scripts/backup/backup-mariadb.sh with backup script"
"Create file scripts/backup/backup-postgresql.sh with backup script"

# Via Terminal (Cron Setup)
crontab -e

# Add:
0 2 * * * /path/to/scripts/backup/backup-mariadb.sh
0 2 * * * /path/to/scripts/backup/backup-postgresql.sh
```

---

## 📊 Phase 7: Monitoring & Alerting (Ausführen: Grafana + n8n)

### Monitoring Metrics

```yaml
database_metrics:
  availability:
    - Connection success rate
    - Response time (SELECT 1)
    - Error rate
    
  performance:
    - Query execution time (slow query log)
    - Connection pool usage
    - Disk I/O
    - CPU/Memory usage
    
  capacity:
    - Disk space used/free
    - Table sizes
    - Index sizes
    - Connection count
    
  security:
    - Failed login attempts
    - Unauthorized access attempts
    - SSL/TLS connection ratio
```

### Alert Thresholds

```yaml
alerts:
  critical:
    - Connection failure (immediate)
    - Disk space < 10% (immediate)
    - Response time > 5s (immediate)
    
  warning:
    - Disk space < 20% (1h)
    - Connection pool > 80% (30min)
    - Slow queries > 100/min (15min)
    
  info:
    - Backup completion (daily)
    - Failed login > 10/hour (1h)
```

**Action Items:**
- [ ] Grafana Dashboard für DB-Metriken erstellen
- [ ] n8n Workflow für Alerts (Slack/E-Mail) konfigurieren
- [ ] Via PostgreSQL MCP: Monitoring-Queries für Health-Checks erstellen
- [ ] Test: Alert bei simuliertem Ausfall (DB stoppen)

**MCP Commands:**
```bash

# Via PostgreSQL MCP
"Execute query to check database size and table counts"
"Execute query to check connection pool status"

# Via GitHub MCP
"Create issue for database monitoring dashboard setup"
```

---

## ✅ Phase 8: Smoke Tests & Validation (Ausführen: deployment-scripts/smoke-tests.sh)

### Connection Tests

```bash

# Via deployment-scripts/smoke-tests.sh

# MariaDB
for DB in mo_crm mo_n8n mo_hooks mo_consent mo_games; do
  mysql -h "$MYSQL_HOST" -u "svc_${DB#mo_}" -p"$DB_PASS" "$DB" -e "SELECT 1;" || echo "FAIL: $DB"
done

# PostgreSQL
for DB in mo_idp mo_grafana; do
  psql -h "$PG_HOST" -U "svc_${DB#mo_}" -d "$DB" -c "SELECT 1;" || echo "FAIL: $DB"
done
```

### Latency Tests

```bash

# Response Time
time mysql -h "$MYSQL_HOST" -u svc_crm -p"$PASS" mo_crm -e "SELECT 1;"

# Expected: < 100ms

time psql -h "$PG_HOST" -U svc_idp -d mo_idp -c "SELECT 1;"

# Expected: < 100ms
```

### Grant Tests

```sql
-- Test: User kann nur auf eigene DB zugreifen
USE mo_crm;  -- OK
USE mo_n8n;  -- Sollte FAIL sein (keine Rechte)
```

**Action Items:**
- [ ] Alle Connection Tests bestanden (0 Failures)
- [ ] Latency < 100ms für alle DBs
- [ ] Grant Tests: User isoliert (kein Cross-DB-Access)
- [ ] TLS aktiv: `SHOW STATUS LIKE 'Ssl_cipher';` → non-empty

---

## 📅 Zeitplan & Milestones

```yaml
tag_1_vormittag:
  - Externe DB-Hosts provisionieren (VPS/Managed)
  - Firewall-Regeln konfigurieren
  - Smoke Test: SSH + Port-Access
  
tag_1_nachmittag:
  - Alle 12 externen DBs + Users anlegen
  - GitHub Secrets für alle DB-Credentials
  - Connection Smoke Tests
  
tag_2:
  - Application Configs aktualisieren
  - Deployment mit neuen Connection Strings
  - Integration Tests
  - Backup-Scripts einrichten
  
tag_3:
  - Monitoring Dashboard aktivieren
  - Alerting konfigurieren
  - Dokumentation finalisieren
  - Abnahme & Handover
```

---

## 🔗 Abhängigkeiten

**Benötigt:**
- `01_EmailDNSSetup_DE.prompt.md` (abgeschlossen)

**Triggert:**
- `03_MCPMultiServiceDeployment_DE.prompt.md` (Multi-Service Deployment mit DB-Credentials)
- TODO.md Update: "Database Rollout abgeschlossen"

---

## 📝 TODO Updates

Bei erfolgreicher Ausführung dieser Prompt:
- [x] Externe MariaDB-Host provisioniert (9 DBs)
- [x] Externe PostgreSQL-Host provisioniert (3 DBs)
- [x] Firewall-Regeln konfiguriert (nur Plesk-IP)
- [x] TLS/SSL für DB-Connections aktiviert
- [x] Alle 12 externen DBs + Users angelegt
- [x] GitHub Secrets für alle DB-Credentials
- [x] Connection Smoke Tests bestanden (0 Failures)
- [x] Backup-Scripts eingerichtet (täglich/wöchentlich/monatlich)
- [x] Monitoring Dashboard aktiviert (Grafana)
- [x] Alerting konfiguriert (n8n Webhooks)
- [ ] Migration bestehender DBs (optional, on-demand)
- [ ] Quarterly: Restore-Test durchführen (recurring)

**Next Prompt:** `03_MCPMultiServiceDeployment_DE.prompt.md`

---
title: Plesk Deployment & Database Configuration
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: critical
category: core
applyTo: deployment-scripts/**,scripts/**,**/deploy*.sh
---
# Plesk Deployment & Database Configuration

## 🔐 SSH Credentials

**Systembenutzer:** `dmpl20230054`  
**Host:** Wird aus GitHub Secrets geladen (`SSH_HOST`)  
**Port:** `22` (Standard) oder aus Secrets (`SSH_PORT`)  
**Authentication:** SSH Private Key (`SSH_PRIVATE_KEY`)

### GitHub Secrets Required

```bash
# SSH/Deploy Secrets
SSH_HOST=<plesk-server-hostname>
SSH_PORT=22
SSH_USER=dmpl20230054
SSH_PRIVATE_KEY=<base64-encoded-private-key>
SSH_TARGET_DIR=/var/www/vhosts/menschlichkeit-oesterreich.at
SSH_POST_DEPLOY_CMD="php artisan migrate --force"  # Optional
```

---

## 🌐 Domain & Subdomain Structure

### Hauptdomain
| Domain                        | Website-Verzeichnis     | Deployment Target |
|------------------------------|--------------------------|-------------------|
| menschlichkeit-oesterreich.at | `httpdocs`              | `/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs` |

### Subdomains (unter `subdomains/.../httpdocs`)

| Subdomain                              | Website-Verzeichnis                  | Deployment Path |
|----------------------------------------|--------------------------------------|-----------------|
| **api.menschlichkeit-oesterreich.at** | `subdomains/api/httpdocs` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api/httpdocs` |
| **crm.menschlichkeit-oesterreich.at** | `subdomains/crm/httpdocs` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs` |
| **games.menschlichkeit-oesterreich.at** | `subdomains/games/httpdocs` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/games/httpdocs` |
| **n8n.menschlichkeit-oesterreich.at** | `subdomains/n8n/httpdocs` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/n8n/httpdocs` |
| **admin.menschlichkeit-oesterreich.at** | `subdomains/admin/httpdocs` | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/admin/httpdocs` |
| votes.menschlichkeit-oesterreich.at    | `subdomains/vote/httpdocs`          | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/vote/httpdocs` |
| support.menschlichkeit-oesterreich.at  | `subdomains/support/httpdocs`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/support/httpdocs` |
| status.menschlichkeit-oesterreich.at   | `subdomains/status/httpdocs`        | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/status/httpdocs` |
| s3.menschlichkeit-oesterreich.at       | `subdomains/s3/httpdocs`            | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/s3/httpdocs` |
| newsletter.menschlichkeit-oesterreich.at| `subdomains/newsletter/httpdocs`   | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/newsletter/httpdocs` |
| media.menschlichkeit-oesterreich.at    | `subdomains/media/httpdocs`         | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/media/httpdocs` |
| logs.menschlichkeit-oesterreich.at     | `subdomains/logs/httpdocs`          | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/logs/httpdocs` |
| idp.menschlichkeit-oesterreich.at      | `subdomains/idp/httpdocs`           | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/idp/httpdocs` |
| hooks.menschlichkeit-oesterreich.at    | `subdomains/hooks/httpdocs`         | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/hooks/httpdocs` |
| grafana.menschlichkeit-oesterreich.at  | `subdomains/grafana/httpdocs`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/grafana/httpdocs` |
| forum.menschlichkeit-oesterreich.at    | `subdomains/forum/httpdocs`         | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/forum/httpdocs` |
| docs.menschlichkeit-oesterreich.at     | `subdomains/docs/httpdocs`          | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/docs/httpdocs` |
| consent.menschlichkeit-oesterreich.at  | `subdomains/consent/httpdocs`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/consent/httpdocs` |
| analytics.menschlichkeit-oesterreich.at| `subdomains/analytics/httpdocs`     | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/analytics/httpdocs` |

### Staging Subdomains
| Subdomain                              | Website-Verzeichnis                  | Deployment Path |
|----------------------------------------|--------------------------------------|-----------------|
| api.stg.menschlichkeit-oesterreich.at  | `subdomains/api.stg/httpdocs`       | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api.stg/httpdocs` |
| admin.stg.menschlichkeit-oesterreich.at| `subdomains/admin.stg/httpdocs`     | `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/admin.stg/httpdocs` |

---

## 📬 E-Mail Konfiguration

### Aktive E-Mail-Adressen
- `peter.schuller@menschlichkeit-oesterreich.at` (Hauptkontakt)
- `logging@menschlichkeit-oesterreich.at` (System-Logs)
- `info@menschlichkeit-oesterreich.at` (Öffentliche Anfragen)
- `civimail@menschlichkeit-oesterreich.at` (CiviCRM Mailings)
- `bounce@menschlichkeit-oesterreich.at` (Bounce-Handling)

### Aliases und Weiterleitungen
- **Alias:** `schuller.peter@menschlichkeit-oesterreich.at` → `peter.schuller@menschlichkeit-oesterreich.at`
- **Weiterleitung:** `schuller.peter@outlook.at` (Externe Weiterleitung)

---

## 🗄️ Datenbank-Architektur & Rollout-Plan

### Rahmenbedingungen
- **Plesk Limit:** 5 MariaDB-Datenbanken pro Domain (bereits genutzt)
- **Keine neuen Subdomains:** Anwendungen nutzen bestehende Hosts/Paths
- **Externe DBs:** Zusätzliche MariaDB + alle PostgreSQL extern (VPS/Managed)
- **Firewall:** DB-Ports nur für Plesk-Server-IP freigegeben
- **Transport:** TLS für DB-Verbindungen (bevorzugt) oder SSH-Tunnel

### 1. Bestehende Datenbanken (Plesk MariaDB - UNVERÄNDERT)

| Zweck                 | Database        | User             | GitHub Secret Prefix |
|-----------------------|-----------------|------------------|----------------------|
| Hauptseite            | `mo_main`       | `svc_main`       | `MO_MAIN_DB_*`      |
| Votes                 | `mo_votes`      | `svc_votes`      | `MO_VOTES_DB_*`     |
| Support               | `mo_support`    | `svc_support`    | `MO_SUPPORT_DB_*`   |
| Newsletter            | `mo_newsletter` | `svc_newsletter` | `MO_NEWSLETTER_DB_*`|
| Forum (phpBB/Vanilla) | `mo_forum`      | `svc_forum`      | `MO_FORUM_DB_*`     |

**Connection String (Plesk-intern):**
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mo_<service>
DB_USER=svc_<service>
DB_PASSWORD=$MO_<SERVICE>_DB_PASS
```

### 2. Neue Datenbanken - Externe MariaDB

| Zweck                    | Database        | User            | GitHub Secret Prefix |
|--------------------------|-----------------|-----------------|----------------------|
| CRM (CiviCRM + Drupal)   | `mo_crm`        | `svc_crm`       | `MO_CRM_DB_*`       |
| n8n Automation           | `mo_n8n`        | `svc_n8n`       | `MO_N8N_DB_*`       |
| Webhooks                 | `mo_hooks`      | `svc_hooks`     | `MO_HOOKS_DB_*`     |
| Consent/DSGVO            | `mo_consent`    | `svc_consent`   | `MO_CONSENT_DB_*`   |
| Gaming Platform          | `mo_games`      | `svc_games`     | `MO_GAMES_DB_*`     |
| Analytics/ETL            | `mo_analytics`  | `svc_analytics` | `MO_ANALYTICS_DB_*` |
| API Staging              | `mo_api_stg`    | `svc_api_stg`   | `MO_API_STG_DB_*`   |
| Admin Staging            | `mo_admin_stg`  | `svc_admin_stg` | `MO_ADMIN_STG_DB_*` |
| Nextcloud (File Storage) | `mo_nextcloud`  | `svc_nextcloud` | `MO_NEXTCLOUD_DB_*` |

**Connection String (extern):**
```bash
MYSQL_HOST=$MYSQL_HOST  # External MariaDB Host
MYSQL_PORT=3306
DB_NAME=mo_<service>
DB_USER=svc_<service>
DB_PASSWORD=$MO_<SERVICE>_DB_PASS
DB_SSL_MODE=REQUIRED  # TLS bevorzugt
```

**SQL Template für Anlage (auf externem MariaDB Server):**
```sql
-- Ersetze: <db>, <service>, <PLESK_SERVER_IP>, <STRONG_PASSWORD>
CREATE DATABASE <db> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'svc_<service>'@'<PLESK_SERVER_IP>' IDENTIFIED BY '<STRONG_PASSWORD>';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES,LOCK TABLES 
  ON <db>.* TO 'svc_<service>'@'<PLESK_SERVER_IP>';
FLUSH PRIVILEGES;
```

### 3. Neue Datenbanken - Externe PostgreSQL

| Zweck                        | Database       | User            | GitHub Secret Prefix |
|------------------------------|----------------|-----------------|----------------------|
| Identity Provider (Keycloak) | `mo_idp`       | `svc_idp`       | `PG_IDP_DB_*`       |
| Grafana (Metadaten)          | `mo_grafana`   | `svc_grafana`   | `PG_GRAFANA_DB_*`   |
| Discourse (optional)         | `mo_discourse` | `svc_discourse` | `PG_DISCOURSE_DB_*` |

**Connection String (extern):**
```bash
PG_HOST=$PG_HOST  # External PostgreSQL Host
PG_PORT=5432
PG_DATABASE=mo_<service>
PG_USER=svc_<service>
PG_PASSWORD=$PG_<SERVICE>_DB_PASS
PG_SSL_MODE=require  # TLS bevorzugt
```

**SQL Template für Anlage (auf externem PostgreSQL Server):**
```sql
-- Ersetze: <service>, <STRONG_PASSWORD>
CREATE USER svc_<service> WITH ENCRYPTED PASSWORD '<STRONG_PASSWORD>';
CREATE DATABASE mo_<service> OWNER svc_<service> TEMPLATE template1;
GRANT ALL PRIVILEGES ON DATABASE mo_<service> TO svc_<service>;
```

### 4. Redis (extern, optional)

**Zweck:** File-Locking, Session-Cache, Queue-Backend  
**Port:** `6379`  
**Authentication:** Password-protected  

**Connection String:**
```bash
REDIS_HOST=$REDIS_HOST
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASS
REDIS_DB=0  # Separate DBs per Service (0-15)
```

---

## 🔒 GitHub Secrets Matrix (Production Environment)

### SSH/Deploy
```bash
SSH_HOST=<plesk-hostname>
SSH_PORT=22
SSH_USER=dmpl20230054
SSH_PRIVATE_KEY=<base64-encoded-key>
SSH_TARGET_DIR=/var/www/vhosts/menschlichkeit-oesterreich.at
SSH_POST_DEPLOY_CMD="php artisan migrate --force"
```

### Database Hosts
```bash
# Shared Hosts
MYSQL_HOST=<external-mariadb-host>
MYSQL_PORT=3306
PG_HOST=<external-postgresql-host>
PG_PORT=5432
REDIS_HOST=<external-redis-host>
REDIS_PORT=6379
REDIS_PASS=<redis-password>
```

### Plesk MariaDB (Bestehend - 5 DBs)
```bash
# Hauptseite
MO_MAIN_DB_USER=svc_main
MO_MAIN_DB_PASS=<secure-password>

# Votes
MO_VOTES_DB_USER=svc_votes
MO_VOTES_DB_PASS=<secure-password>

# Support
MO_SUPPORT_DB_USER=svc_support
MO_SUPPORT_DB_PASS=<secure-password>

# Newsletter
MO_NEWSLETTER_DB_USER=svc_newsletter
MO_NEWSLETTER_DB_PASS=<secure-password>

# Forum
MO_FORUM_DB_USER=svc_forum
MO_FORUM_DB_PASS=<secure-password>
```

### Externe MariaDB (Neue DBs)
```bash
# CRM (CiviCRM + Drupal)
MO_CRM_DB_USER=svc_crm
MO_CRM_DB_PASS=<secure-password>

# n8n
MO_N8N_DB_USER=svc_n8n
MO_N8N_DB_PASS=<secure-password>

# Webhooks
MO_HOOKS_DB_USER=svc_hooks
MO_HOOKS_DB_PASS=<secure-password>

# Consent/DSGVO
MO_CONSENT_DB_USER=svc_consent
MO_CONSENT_DB_PASS=<secure-password>

# Games
MO_GAMES_DB_USER=svc_games
MO_GAMES_DB_PASS=<secure-password>

# Analytics
MO_ANALYTICS_DB_USER=svc_analytics
MO_ANALYTICS_DB_PASS=<secure-password>

# API Staging
MO_API_STG_DB_USER=svc_api_stg
MO_API_STG_DB_PASS=<secure-password>

# Admin Staging
MO_ADMIN_STG_DB_USER=svc_admin_stg
MO_ADMIN_STG_DB_PASS=<secure-password>

# Nextcloud
MO_NEXTCLOUD_DB_USER=svc_nextcloud
MO_NEXTCLOUD_DB_PASS=<secure-password>
```

### Externe PostgreSQL
```bash
# Identity Provider (Keycloak)
PG_IDP_DB_USER=svc_idp
PG_IDP_DB_PASS=<secure-password>

# Grafana
PG_GRAFANA_DB_USER=svc_grafana
PG_GRAFANA_DB_PASS=<secure-password>

# Discourse (optional)
PG_DISCOURSE_DB_USER=svc_discourse
PG_DISCOURSE_DB_PASS=<secure-password>
```

---

## 🚀 Deployment-Workflow mit MCP-Integration

### 1. Pre-Deployment Validation (GitHub MCP)
```bash
Via GitHub MCP:
"Check deployment readiness for current branch"

Validate:
□ All CI/CD checks passed?
□ Security alerts = 0?
□ Code review approved (min. 1 reviewer)?
□ Branch up-to-date with main?
□ No merge conflicts?
```

### 2. Database Connection Test (PostgreSQL MCP)
```bash
Via PostgreSQL MCP:
"Test database connections for all services"

Check:
□ Plesk MariaDB (localhost:3306) - 5 DBs
□ External MariaDB ($MYSQL_HOST:3306) - 9 DBs
□ External PostgreSQL ($PG_HOST:5432) - 3 DBs
□ Redis ($REDIS_HOST:6379) - Optional
```

### 3. SSH Deployment (Filesystem MCP + Scripts)
```bash
# deployment-scripts/deploy-to-plesk.sh
#!/bin/bash
set -euo pipefail

# Source centralized config
source "$(dirname "$0")/deployment-config.sh"

# Validate SSH connection
ssh -i "$SSH_PRIVATE_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo 'SSH Connection OK'"

# Deploy each service
for SERVICE in api crm games admin; do
    echo "Deploying $SERVICE..."
    
    # Sync files via rsync
    rsync -avz --delete \
        -e "ssh -i $SSH_PRIVATE_KEY -p $SSH_PORT" \
        "./dist/$SERVICE/" \
        "$SSH_USER@$SSH_HOST:/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/$SERVICE/httpdocs/"
    
    # Run post-deploy commands
    ssh -i "$SSH_PRIVATE_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/$SERVICE/httpdocs && $SSH_POST_DEPLOY_CMD"
done
```

### 4. Smoke Tests (Playwright MCP)
```bash
Via Playwright MCP:
"Run smoke tests for all deployed services"

Test:
□ https://api.menschlichkeit-oesterreich.at/health
□ https://crm.menschlichkeit-oesterreich.at/
□ https://games.menschlichkeit-oesterreich.at/
□ https://admin.menschlichkeit-oesterreich.at/
□ Database connections from server-side
```

### 5. Post-Deployment Monitoring
```bash
./deployment-scripts/deployment-monitoring.sh

Monitor:
□ Service health (HTTP 200)
□ Database connections (all services)
□ Error rates (< 1%)
□ Response times (< 500ms)
□ System resources (CPU < 80%, Memory < 85%)
```

---

## 🛡️ Sicherheit & Best Practices

### Firewall-Regeln (Externe DB-Server)
```bash
# MariaDB
ufw allow from <PLESK_SERVER_IP> to any port 3306 proto tcp

# PostgreSQL
ufw allow from <PLESK_SERVER_IP> to any port 5432 proto tcp

# Redis
ufw allow from <PLESK_SERVER_IP> to any port 6379 proto tcp

# SSH (nur Admin-IPs)
ufw allow from <ADMIN_IP_1> to any port 22 proto tcp
ufw allow from <ADMIN_IP_2> to any port 22 proto tcp

# Default Deny
ufw default deny incoming
ufw default allow outgoing
ufw enable
```

### TLS/SSL für Datenbank-Verbindungen
```bash
# MariaDB
[client]
ssl-ca=/etc/mysql/ca-cert.pem
ssl-mode=REQUIRED

# PostgreSQL
sslmode=require
sslrootcert=/etc/postgresql/root.crt
```

### Least Privilege Grants
```sql
-- Nie GRANT ALL verwenden!
-- Nur notwendige Rechte vergeben:
GRANT SELECT,INSERT,UPDATE,DELETE ON database.* TO 'user'@'host';

-- Für Migrationen zusätzlich:
GRANT CREATE,ALTER,INDEX,REFERENCES,LOCK TABLES ON database.* TO 'user'@'host';

-- Nie globale Grants:
-- FALSCH: GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';
```

### Secret Rotation
```bash
# Quartalsweise Passwort-Rotation
# 1. Neues Passwort generieren
NEW_PASS=$(openssl rand -base64 32)

# 2. In Datenbank ändern
ALTER USER 'svc_crm'@'<PLESK_IP>' IDENTIFIED BY '$NEW_PASS';

# 3. GitHub Secret aktualisieren
gh secret set MO_CRM_DB_PASS --body "$NEW_PASS" --env production

# 4. Deployment neu starten (Rolling Update)
```

---

## 📊 Backup & Disaster Recovery

### Automatisierte Backups
```bash
#!/bin/bash
# /opt/backup/db-backup.sh

BACKUP_DIR="/backup/databases"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# MariaDB Backup
for DB in mo_crm mo_n8n mo_hooks mo_consent mo_games mo_analytics; do
    mysqldump --single-transaction \
        --ssl-mode=REQUIRED \
        -h "$MYSQL_HOST" \
        -u "svc_${DB#mo_}" \
        -p"$DB_PASS" \
        "$DB" | gzip > "$BACKUP_DIR/${DB}_${DATE}.sql.gz"
done

# PostgreSQL Backup
for DB in mo_idp mo_grafana; do
    pg_dump -Fc \
        -h "$PG_HOST" \
        -U "svc_${DB#mo_}" \
        -d "$DB" \
        -f "$BACKUP_DIR/${DB}_${DATE}.dump"
done

# Cleanup alte Backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete

# Offsite-Kopie (S3/Wasabi)
aws s3 sync "$BACKUP_DIR" s3://mo-backups/databases/ --storage-class GLACIER
```

### Cron-Job (täglich 3:00 UTC)
```bash
0 3 * * * /opt/backup/db-backup.sh >> /var/log/db-backup.log 2>&1
```

### Restore-Test (monatlich)
```bash
# Test-Restore auf separate Test-DB
gunzip -c mo_crm_20251007_030000.sql.gz | mysql -h test-db-host mo_crm_test
```

---

## 📋 Deployment-Checkliste

### Pre-Deployment
- [ ] Alle Quality Gates passed (npm run quality:gates)
- [ ] Security Scan erfolgreich (0 HIGH/CRITICAL)
- [ ] Database Backups aktuell (< 24h)
- [ ] SSH-Zugriff getestet
- [ ] Alle Secrets in GitHub gesetzt
- [ ] Staging-Deployment erfolgreich

### Deployment
- [ ] Pre-Deployment Validation (deployment-readiness.sh)
- [ ] Database Migrations getestet (dry-run)
- [ ] Services einzeln deployen (CRM → API → Frontend → Games)
- [ ] Smoke Tests nach jedem Service
- [ ] Health Checks bestanden

### Post-Deployment
- [ ] Monitoring aktiv (30min)
- [ ] Error Rates < 1%
- [ ] Response Times < 500ms
- [ ] All Services erreichbar
- [ ] Database Connections OK
- [ ] Log-Files überprüft
- [ ] Rollback-Plan bereit

### Bei Problemen
- [ ] Automatischer Rollback bei Critical Errors
- [ ] Incident-Report erstellen
- [ ] Team informieren
- [ ] Post-Mortem-Analyse planen

---

## 🔗 Verwandte Dokumentation

- [Deployment Dashboard](../deployment-scripts/README.md)
- [Quality Gates](quality-gates.instructions.md)
- [MCP Integration](mcp-integration.instructions.md)
- [GitHub Secrets Setup](../../GITHUB-SECRETS-COMPLETE-SETUP.md)
- [Database Rollout Plan](#) ← Dieser Dokument

---

**Letzte Aktualisierung:** 2025-10-07  
**Verantwortlich:** DevOps Team  
**Review-Zyklus:** Monatlich

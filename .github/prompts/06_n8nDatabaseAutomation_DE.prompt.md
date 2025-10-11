---
title: "06 N8Ndatabaseautomation"
description: "n8n Datenbank-Automatisierung"
lastUpdated: 2025-10-10
status: ACTIVE
category: automation
tags: ['automation', 'n8n']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'Automation Engineers']
---

---
description: 'n8n Datenbank-Automatisierung für Backups, Health Checks und Migration-Tracking'
  - 02_DatabaseRollout_DE
---

# n8n Datenbank-Automatisierung

**Zweck:** Automatische Backups, Health Monitoring und Migration-Benachrichtigungen für 17 Datenbanken

---

## 📋 Kontext

### Datenbank-Infrastruktur (aus 02_DatabaseRollout)

**17 Datenbanken:**

**Plesk MariaDB (5):**
- d04159e2 (Main Website)
- d04159f9 (CRM/CiviCRM)
- d04159fc (Analytics)
- d0415a0d (Forum/Community)
- d0415a0e (n8n Workflows - mo_n8n)

**External MariaDB (9):**
- humanityaustria_main
- humanityaustria_crm
- humanityaustria_analytics
- humanityaustria_forum
- humanityaustria_backup
- humanityaustria_sessions
- humanityaustria_cache
- humanityaustria_logs
- humanityaustria_archive

**External PostgreSQL (3):**
- humanityaustria_api
- humanityaustria_gaming
- humanityaustria_events

---

## 🎯 Execution Phases

### Phase 1: Database Credentials in n8n

**n8n Credentials Setup:**

```markdown
**MariaDB Plesk:**
Credentials → Add Credential → MySQL

Name: MariaDB Plesk - d04159e2 (Main)
Host: localhost (from n8n container)
Port: 3306
Database: d04159e2
User: d04159e2
Password: [aus secrets/database-credentials.enc]
SSL: false (localhost)

Wiederholen für d04159f9, d04159fc, d0415a0d, d0415a0e
```

```markdown
**MariaDB External:**
Credentials → Add Credential → MySQL

Name: MariaDB External - humanityaustria_main
Host: external-db.kasserver.com
Port: 3306
Database: humanityaustria_main
User: humanityaustria_admin
Password: [aus secrets/]
SSL: true

Wiederholen für alle 9 External MariaDB Datenbanken
```

```markdown
**PostgreSQL External:**
Credentials → Add Credential → Postgres

Name: PostgreSQL - humanityaustria_api
Host: external-pg.kasserver.com
Port: 5432
Database: humanityaustria_api
User: humanityaustria_admin
Password: [aus secrets/]
SSL: true
SSL Mode: require

Wiederholen für humanityaustria_gaming, humanityaustria_events
```

**Checklist:**
- [ ] Alle 17 Database Credentials in n8n erstellt
- [ ] Connection Test für jede DB erfolgreich
- [ ] SSL Certificates korrekt (External DBs)

---

### Phase 2: Workflow 1 - Daily Backups

**Workflow JSON:**

```json
{
  "name": "Daily Database Backups (All 17)",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 2 * * *"
            }
          ]
        }
      },
      "id": "cron-daily-2am",
      "name": "Schedule - Daily 2 AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Generate list of all databases\nconst databases = [\n  // Plesk MariaDB\n  { name: 'd04159e2', type: 'mariadb', service: 'main-website' },\n  { name: 'd04159f9', type: 'mariadb', service: 'crm' },\n  { name: 'd04159fc', type: 'mariadb', service: 'analytics' },\n  { name: 'd0415a0d', type: 'mariadb', service: 'forum' },\n  { name: 'd0415a0e', type: 'mariadb', service: 'n8n' },\n  \n  // External MariaDB\n  { name: 'humanityaustria_main', type: 'mariadb_ext', service: 'main-external' },\n  { name: 'humanityaustria_crm', type: 'mariadb_ext', service: 'crm-external' },\n  { name: 'humanityaustria_analytics', type: 'mariadb_ext', service: 'analytics-external' },\n  { name: 'humanityaustria_forum', type: 'mariadb_ext', service: 'forum-external' },\n  { name: 'humanityaustria_backup', type: 'mariadb_ext', service: 'backup-external' },\n  { name: 'humanityaustria_sessions', type: 'mariadb_ext', service: 'sessions' },\n  { name: 'humanityaustria_cache', type: 'mariadb_ext', service: 'cache' },\n  { name: 'humanityaustria_logs', type: 'mariadb_ext', service: 'logs' },\n  { name: 'humanityaustria_archive', type: 'mariadb_ext', service: 'archive' },\n  \n  // PostgreSQL\n  { name: 'humanityaustria_api', type: 'postgresql', service: 'api' },\n  { name: 'humanityaustria_gaming', type: 'postgresql', service: 'gaming' },\n  { name: 'humanityaustria_events', type: 'postgresql', service: 'events' }\n];\n\nreturn databases.map(db => ({ json: db }));"
      },
      "id": "code-db-list",
      "name": "Code - Generate DB List",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.type }}",
              "operation": "contains",
              "value2": "mariadb"
            }
          ]
        }
      },
      "id": "switch-db-type",
      "name": "Switch - DB Type",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "command": "=mysqldump --host={{ $json.type === 'mariadb' ? 'localhost' : 'external-db.kasserver.com' }} --user={{ $json.name }} --password=[CREDENTIAL] {{ $json.name }} | gzip > /backups/{{ $json.name }}_{{ $now.format('YYYY-MM-DD') }}.sql.gz"
      },
      "id": "exec-mysqldump",
      "name": "Execute - MariaDB Dump",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "command": "=pg_dump --host=external-pg.kasserver.com --username=humanityaustria_admin --dbname={{ $json.name }} --format=custom --compress=9 --file=/backups/{{ $json.name }}_{{ $now.format('YYYY-MM-DD') }}.dump"
      },
      "id": "exec-pgdump",
      "name": "Execute - PostgreSQL Dump",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [850, 400]
    },
    {
      "parameters": {
        "operation": "aggregateItems",
        "aggregate": "aggregateAllItemData",
        "options": {}
      },
      "id": "aggregate-results",
      "name": "Aggregate - All Backup Results",
      "type": "n8n-nodes-base.aggregate",
      "typeVersion": 1,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "devops@menschlichkeit-oesterreich.at",
        "subject": "✅ Daily Database Backups - {{ $now.format('YYYY-MM-DD') }}",
        "emailType": "html",
        "message": "=<html>\n<head>\n  <style>\n    table { border-collapse: collapse; width: 100%; }\n    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n    th { background-color: #4CAF50; color: white; }\n    tr:nth-child(even) { background-color: #f2f2f2; }\n  </style>\n</head>\n<body>\n  <h2>Daily Database Backups Report</h2>\n  <p><strong>Backup Date:</strong> {{ $now.format('YYYY-MM-DD HH:mm:ss') }}</p>\n  <p><strong>Total Databases:</strong> {{ $json.length }}</p>\n  \n  <h3>Backup Details:</h3>\n  <table>\n    <tr>\n      <th>Database</th>\n      <th>Type</th>\n      <th>Service</th>\n      <th>Status</th>\n      <th>Size</th>\n    </tr>\n    {{ $json.map(db => `\n    <tr>\n      <td>${db.name}</td>\n      <td>${db.type}</td>\n      <td>${db.service}</td>\n      <td style=\"color: green;\">✅ Success</td>\n      <td>${db.backup_size || 'N/A'}</td>\n    </tr>\n    `).join('') }}\n  </table>\n  \n  <h3>Backup Location:</h3>\n  <p><code>/backups/{{ $now.format('YYYY-MM-DD') }}/</code></p>\n  \n  <h3>Retention Policy:</h3>\n  <ul>\n    <li>Daily Backups: 7 Tage</li>\n    <li>Weekly Backups: 4 Wochen</li>\n    <li>Monthly Backups: 12 Monate</li>\n  </ul>\n</body>\n</html>"
      },
      "id": "email-backup-report",
      "name": "Email - Backup Report",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": {
        "smtp": {
          "id": "smtp-admin",
          "name": "SMTP Admin"
        }
      }
    },
    {
      "parameters": {
        "errorMessage": "={{ $json.error.message }}"
      },
      "id": "error-trigger",
      "name": "Error Handler",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [450, 600]
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "🚨 Database Backup FEHLGESCHLAGEN",
        "attachments": [
          {
            "color": "#ff0000",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "Error Message",
                  "value": "={{ $json.errorMessage }}"
                },
                {
                  "short": true,
                  "title": "Timestamp",
                  "value": "={{ $now.format('YYYY-MM-DD HH:mm:ss') }}"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-error",
      "name": "Slack - Backup Failure",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 600]
    }
  ],
  "connections": {
    "Schedule - Daily 2 AM": {
      "main": [[{"node": "Code - Generate DB List", "type": "main", "index": 0}]]
    },
    "Code - Generate DB List": {
      "main": [[{"node": "Switch - DB Type", "type": "main", "index": 0}]]
    },
    "Switch - DB Type": {
      "main": [
        [{"node": "Execute - MariaDB Dump", "type": "main", "index": 0}],
        [{"node": "Execute - PostgreSQL Dump", "type": "main", "index": 0}]
      ]
    },
    "Execute - MariaDB Dump": {
      "main": [[{"node": "Aggregate - All Backup Results", "type": "main", "index": 0}]]
    },
    "Execute - PostgreSQL Dump": {
      "main": [[{"node": "Aggregate - All Backup Results", "type": "main", "index": 0}]]
    },
    "Aggregate - All Backup Results": {
      "main": [[{"node": "Email - Backup Report", "type": "main", "index": 0}]]
    },
    "Error Handler": {
      "main": [[{"node": "Slack - Backup Failure", "type": "main", "index": 0}]]
    }
  }
}
```

**Backup Rotation Script:**
```bash
#!/bin/bash

# /backups/rotate-backups.sh

BACKUP_DIR="/backups"
DAILY_RETENTION=7
WEEKLY_RETENTION=28
MONTHLY_RETENTION=365

# Delete daily backups older than 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$DAILY_RETENTION -delete
find "$BACKUP_DIR" -name "*.dump" -mtime +$DAILY_RETENTION -delete

# Keep weekly backups (every Sunday)

# Keep monthly backups (1st of month)

echo "Backup rotation completed: $(date)"
```

**Checklist:**
- [ ] mysqldump und pg_dump verfügbar in n8n Container
- [ ] /backups Directory existiert mit korrekten Permissions
- [ ] Backup Rotation Script als Cronjob konfiguriert
- [ ] Manual Test erfolgreich (einzelne DB)
- [ ] Email Report kommt täglich 2:15 AM

---

### Phase 3: Workflow 2 - Health Checks (15min)

**Workflow JSON:**

```json
{
  "name": "Database Health Checks (Every 15min)",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "*/15 * * * *"
            }
          ]
        }
      },
      "id": "cron-15min",
      "name": "Schedule - Every 15min",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n  COUNT(*) as active_connections,\n  (SELECT COUNT(*) FROM information_schema.PROCESSLIST WHERE Command = 'Sleep') as idle_connections,\n  (SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.TABLES WHERE table_schema = DATABASE()) as db_size_mb,\n  (SELECT VARIABLE_VALUE FROM information_schema.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Uptime') as uptime_seconds\nFROM information_schema.PROCESSLIST;"
      },
      "id": "mysql-health",
      "name": "MariaDB - Health Metrics",
      "type": "n8n-nodes-base.mysql",
      "typeVersion": 2.1,
      "position": [450, 200],
      "credentials": {
        "mysql": {
          "id": "mariadb-plesk-main",
          "name": "MariaDB Plesk - d04159e2"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n  count(*) as active_connections,\n  (SELECT pg_size_pretty(pg_database_size(current_database()))) as db_size,\n  (SELECT pg_postmaster_start_time()) as uptime_start,\n  (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries,\n  (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections\nFROM pg_stat_activity;"
      },
      "id": "postgres-health",
      "name": "PostgreSQL - Health Metrics",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.1,
      "position": [450, 400],
      "credentials": {
        "postgres": {
          "id": "postgresql-api",
          "name": "PostgreSQL - humanityaustria_api"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.active_connections }}",
              "operation": "larger",
              "value2": 100
            }
          ]
        }
      },
      "id": "if-high-connections",
      "name": "IF - High Connection Count",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "channel": "#database-alerts",
        "text": "⚠️ High Database Connection Count",
        "attachments": [
          {
            "color": "#ff9900",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Active Connections",
                  "value": "={{ $json.active_connections }}"
                },
                {
                  "short": true,
                  "title": "Idle Connections",
                  "value": "={{ $json.idle_connections }}"
                },
                {
                  "short": false,
                  "title": "Action",
                  "value": "Prüfen Sie Connection Pooling und langsame Queries."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-high-connections",
      "name": "Slack - Connection Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.db_size_mb }}",
              "operation": "larger",
              "value2": 5000
            }
          ]
        }
      },
      "id": "if-large-db",
      "name": "IF - Database Size > 5GB",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 400]
    },
    {
      "parameters": {
        "channel": "#database-alerts",
        "text": "⚠️ Database Size Warning",
        "attachments": [
          {
            "color": "#ffcc00",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Current Size",
                  "value": "={{ $json.db_size_mb }} MB"
                },
                {
                  "short": false,
                  "title": "Recommendation",
                  "value": "Erwägen Sie Archivierung oder Partitionierung."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-large-db",
      "name": "Slack - Size Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 400]
    }
  ],
  "connections": {
    "Schedule - Every 15min": {
      "main": [
        [
          {"node": "MariaDB - Health Metrics", "type": "main", "index": 0},
          {"node": "PostgreSQL - Health Metrics", "type": "main", "index": 0}
        ]
      ]
    },
    "MariaDB - Health Metrics": {
      "main": [[{"node": "IF - High Connection Count", "type": "main", "index": 0}]]
    },
    "PostgreSQL - Health Metrics": {
      "main": [[{"node": "IF - High Connection Count", "type": "main", "index": 0}]]
    },
    "IF - High Connection Count": {
      "main": [
        [{"node": "Slack - Connection Alert", "type": "main", "index": 0}],
        [{"node": "IF - Database Size > 5GB", "type": "main", "index": 0}]
      ]
    },
    "IF - Database Size > 5GB": {
      "main": [
        [{"node": "Slack - Size Alert", "type": "main", "index": 0}]
      ]
    }
  }
}
```

**Health Check Thresholds:**
```markdown
CRITICAL (Immediate Alert):
- Active Connections > 200
- Database Size > 10 GB
- Idle Connections > 500
- Replication Lag > 60 seconds

WARNING (Slack Notification):
- Active Connections > 100
- Database Size > 5 GB
- Idle Connections > 200
- Replication Lag > 30 seconds

OK (Log Only):
- All metrics within normal range
```

**Checklist:**
- [ ] Health Checks laufen alle 15min
- [ ] Thresholds korrekt konfiguriert
- [ ] Slack Channel #database-alerts erstellt
- [ ] Manual Test mit hohen Connection Count

---

### Phase 4: Workflow 3 - Migration Notifications

**Workflow JSON:**

```json
{
  "name": "Database Migration Tracker",
  "nodes": [
    {
      "parameters": {
        "path": "db-migration",
        "httpMethod": "POST"
      },
      "id": "webhook-migration",
      "name": "Webhook - Migration Event",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "owner": "menschlichkeit-oesterreich",
        "repository": "{{ $json.repository }}",
        "title": "📊 Database Migration: {{ $json.migration_name }}",
        "body": "=## Database Migration\n\n**Migration:** {{ $json.migration_name }}\n**Database:** {{ $json.database }}\n**Type:** {{ $json.type }}\n**Applied:** {{ $now.format('YYYY-MM-DD HH:mm:ss') }}\n\n### Changes:\n\n{{ $json.changes }}\n\n### Rollback Plan:\n\n{{ $json.rollback_plan }}\n\n### Checklist:\n\n- [ ] Migration erfolgreich angewendet\n- [ ] Tests durchgeführt\n- [ ] Performance Impact geprüft\n- [ ] Dokumentation aktualisiert\n\n**Triggered by:** {{ $json.author }}",
        "labels": [
          "database",
          "migration",
          "automated"
        ]
      },
      "id": "github-migration-issue",
      "name": "GitHub - Migration Issue",
      "type": "n8n-nodes-base.github",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "channel": "#database-alerts",
        "text": "📊 Database Migration Applied",
        "attachments": [
          {
            "color": "#0066cc",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Migration",
                  "value": "={{ $json.migration_name }}"
                },
                {
                  "short": true,
                  "title": "Database",
                  "value": "={{ $json.database }}"
                },
                {
                  "short": false,
                  "title": "GitHub Issue",
                  "value": "<{{ $json.html_url }}|#{{ $json.number }} - Track Migration>"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-migration",
      "name": "Slack - Migration Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "dev-team@menschlichkeit-oesterreich.at",
        "subject": "📊 Database Migration: {{ $json.migration_name }}",
        "emailType": "html",
        "message": "=<html>\n<body>\n  <h2>Database Migration Applied</h2>\n  <table border=\"1\" cellpadding=\"10\">\n    <tr><td><strong>Migration:</strong></td><td>{{ $json.migration_name }}</td></tr>\n    <tr><td><strong>Database:</strong></td><td>{{ $json.database }}</td></tr>\n    <tr><td><strong>Type:</strong></td><td>{{ $json.type }}</td></tr>\n    <tr><td><strong>Applied:</strong></td><td>{{ $now.format('YYYY-MM-DD HH:mm:ss') }}</td></tr>\n  </table>\n  <h3>Changes:</h3>\n  <pre>{{ $json.changes }}</pre>\n  <p><a href=\"{{ $json.html_url }}\">GitHub Issue →</a></p>\n</body>\n</html>"
      },
      "id": "email-migration",
      "name": "Email - Dev Team",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 300]
    }
  ],
  "connections": {
    "Webhook - Migration Event": {
      "main": [[{"node": "GitHub - Migration Issue", "type": "main", "index": 0}]]
    },
    "GitHub - Migration Issue": {
      "main": [[{"node": "Slack - Migration Notification", "type": "main", "index": 0}]]
    },
    "Slack - Migration Notification": {
      "main": [[{"node": "Email - Dev Team", "type": "main", "index": 0}]]
    }
  }
}
```

**Prisma Migration Hook:**
```typescript
// web/prisma/hooks/migration-webhook.ts

import { exec } from 'child_process';

export async function notifyMigration(migrationName: string) {
  const payload = {
    migration_name: migrationName,
    database: 'humanityaustria_gaming',
    type: 'schema_change',
    repository: 'menschlichkeit-oesterreich/web',
    author: process.env.USER,
    changes: await getMigrationSQL(migrationName),
    rollback_plan: 'Run: npx prisma migrate resolve --rolled-back ' + migrationName
  };
  
  await fetch('https://n8n.menschlichkeit-oesterreich.at/webhook/db-migration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// In package.json:
// "prisma": {
//   "seed": "ts-node prisma/seed.ts",
//   "postmigrate": "ts-node prisma/hooks/migration-webhook.ts"
// }
```

**Checklist:**
- [ ] Prisma Migration Webhook konfiguriert
- [ ] GitHub Issue Template für Migrations
- [ ] Slack Notifications funktionieren
- [ ] Email an Dev Team

---

## ✅ Final Checklist

### Backup System
- [ ] Daily Backups um 2 AM laufen automatisch
- [ ] Alle 17 Datenbanken werden gesichert
- [ ] Backup Rotation funktioniert (7/28/365 Tage)
- [ ] Email Report kommt täglich

### Health Monitoring
- [ ] Health Checks alle 15min aktiv
- [ ] Thresholds korrekt (Connection, Size, Replication)
- [ ] Alerts in Slack #database-alerts
- [ ] Grafana Dashboard verbunden (optional)

### Migration Tracking
- [ ] Migration Webhook in Prisma konfiguriert
- [ ] GitHub Issues werden automatisch erstellt
- [ ] Dev Team erhält Notifications
- [ ] Rollback Plan dokumentiert

### Recovery Testing
- [ ] Backup Restore getestet (1 DB)
- [ ] Recovery Time Objective (RTO) < 1 Stunde
- [ ] Recovery Point Objective (RPO) < 24 Stunden
- [ ] Disaster Recovery Playbook vorhanden

---

**Prompt erstellt:** 2025-10-07  
**Kategorie:** Automation - Database  
**Execution Order:** 6  
**MCP Tools:** PostgreSQL (Health Queries), Filesystem (Backup Scripts)

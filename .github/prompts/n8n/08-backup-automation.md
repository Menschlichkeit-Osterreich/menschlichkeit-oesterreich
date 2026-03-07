---
reason: Konsolidierung der .github Struktur - siehe VERSIONING-AND-CONSOLIDATION-PLAN.md
---

**⚠️ DEPRECATED - NICHT VERWENDEN**

Diese Datei ist veraltet und wird in einer zukünftigen Version entfernt.

- **Status:** DEPRECATED
- **Datum:** 2025-10-08
- **Migration:** TBD - Siehe Migration Guide
- **Grund:** Konsolidierung der .github Struktur - siehe VERSIONING-AND-CONSOLIDATION-PLAN.md

**Aktuelle Version verwenden:** TBD - Siehe Migration Guide

---

# n8n Backup & Disaster Recovery Automation Prompt

## Ziel
Automatisiere Backups für alle kritischen Daten (Datenbanken, Git, Configs, User-Uploads) mit Verschlüsselung, Rotation, Monitoring und Disaster-Recovery-Testing.

## Kontext
- **Backup-Targets:** PostgreSQL DBs, Git Repos, Plesk Configs, CiviCRM Data, User Uploads
- **Retention:** 7 Tage Daily, 4 Wochen Weekly, 12 Monate Monthly
- **Encryption:** GPG mit Projekt-Key
- **Storage:** Remote SFTP + Optional Cloud (S3/Backblaze)
- **DSGVO:** Verschlüsselung für PII, Audit-Logging

## Workflow-Anforderungen

### 1. Database Backup (Täglich 2:00 UTC)
```yaml
Trigger: 
  - Cron: 0 2 * * *
  - On-Demand via Webhook

Workflow:
  1. PostgreSQL Dump für alle 17 Datenbanken:
     - CRM (CiviCRM Core + Custom Extensions)
     - API (Users, Donations, Content)
     - Gaming (Achievements, XP, GameSessions)
     - Website (WordPress wenn PostgreSQL)
     - Analytics (Tracking Data)
  
  2. SSH zu Plesk Server:
     ```bash
     pg_dump -h localhost -U backup_user \
       --format=custom \
       --compress=9 \
       --file=/tmp/backup-{db_name}-{date}.dump \
       {db_name}
     ```
  
  3. GPG-Verschlüsselung:
     ```bash
     gpg --encrypt \
       --recipient backup@menschlichkeit-oesterreich.at \
       --output backup-{db_name}-{date}.dump.gpg \
       backup-{db_name}-{date}.dump
     
     # Original löschen
     rm backup-{db_name}-{date}.dump
     ```
  
  4. SFTP Upload:
     - Remote: backups.example.com:/backups/databases/{date}/
     - Verify: Checksumme (SHA256)
  
  5. Metadata speichern:
     - quality-reports/backups/db-backup-{date}.json
     - Include: Size, Duration, Checksum, Success
  
  6. Bei Failure:
     - Retry: 2x mit 10min Pause
     - Alert: Slack + Email (CRITICAL)
     - Incident Issue: GitHub
```

### 2. Git Repository Backup (Täglich 3:00 UTC)
```yaml
Trigger: 
  - Cron: 0 3 * * *

Workflow:
  1. Clone/Pull aller Repos:
     - menschlichkeit-oesterreich-development (Main)
     - Custom CiviCRM Extensions Repo
     - Private Config Repo
  
  2. Bundle Creation:
     ```bash
     cd /tmp/git-backups
     git clone --mirror git@github.com:Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
     cd menschlichkeit-oesterreich-development.git
     git bundle create ../repo-{date}.bundle --all
     ```
  
  3. GPG-Verschlüsselung:
     ```bash
     gpg --encrypt \
       --recipient backup@menschlichkeit-oesterreich.at \
       repo-{date}.bundle
     ```
  
  4. SFTP Upload:
     - Remote: backups.example.com:/backups/git/{date}/
  
  5. GitHub Release Backup:
     - Via GitHub API: Download alle Releases
     - Speichere Assets + Metadata
```

### 3. File Backup (Täglich 4:00 UTC)
```yaml
Trigger: 
  - Cron: 0 4 * * *

Workflow:
  1. Backup kritischer Files:
     - CiviCRM Custom Extensions: /var/www/civicrm/ext/
     - User Uploads: /var/www/uploads/
     - Plesk Configs: /usr/local/psa/etc/
     - SSL Certificates: /etc/letsencrypt/
     - n8n Workflows: automation/n8n/workflows/
  
  2. Tar Archive mit Kompression:
     ```bash
     tar -czf /tmp/files-{date}.tar.gz \
       --exclude='*.log' \
       --exclude='cache/' \
       /var/www/uploads \
       /var/www/civicrm/ext \
       /usr/local/psa/etc
     ```
  
  3. GPG-Verschlüsselung:
     ```bash
     gpg --encrypt \
       --recipient backup@menschlichkeit-oesterreich.at \
       files-{date}.tar.gz
     ```
  
  4. SFTP Upload:
     - Remote: backups.example.com:/backups/files/{date}/
  
  5. PII-Audit:
     - Scanne Uploads auf PII (via api/app/lib/pii_sanitizer.py)
     - Warne bei unverschlüsselten PII-Files
```

### 4. Backup Rotation (Täglich 5:00 UTC)
```yaml
Trigger: 
  - Cron: 0 5 * * *

Workflow:
  1. Retention Policy anwenden:
     - Daily Backups: Behalte letzte 7 Tage
     - Weekly Backups: Behalte letzte 4 Wochen (Sonntags)
     - Monthly Backups: Behalte letzte 12 Monate (1. des Monats)
  
  2. SSH zu Backup-Server:
     ```bash
     # Lösche alte Daily Backups (älter als 7 Tage)
     find /backups/databases -name "*.gpg" -mtime +7 -delete
     
     # Wöchentliche Backups: Nur Sonntags behalten
     # Monatliche Backups: Nur 1. des Monats behalten
     ```
  
  3. Speicherplatz-Check:
     - Alert bei Backup-Volume >90% voll
     - Proaktive Warnung 7 Tage vor "voll"
  
  4. Backup-Inventar aktualisieren:
     - quality-reports/backups/inventory.json
     - Include: Alle verfügbaren Backups, Restore-Points
```

### 5. Backup Verification (Wöchentlich Sonntag 6:00 UTC)
```yaml
Trigger: 
  - Cron: 0 6 * * 0

Workflow:
  1. Zufälliges Backup auswählen (aus letzten 7 Tagen)
  
  2. Download & Decrypt:
     ```bash
     gpg --decrypt backup-{db}-{date}.dump.gpg > restored.dump
     ```
  
  3. Test-Restore in isolierter DB:
     ```bash
     createdb test_restore
     pg_restore -d test_restore restored.dump
     ```
  
  4. Integrity Checks:
     - Row Count stimmt überein
     - Schema vollständig
     - Constraints intakt
     - Sample Queries erfolgreich
  
  5. Cleanup:
     ```bash
     dropdb test_restore
     rm restored.dump
     ```
  
  6. Report erstellen:
     - GitHub Issue: "✅ Weekly Backup Verification - {date}"
     - Include: Tested Backup, Success/Failure, Details
  
  7. Bei Failure:
     - CRITICAL Alert (Slack + Email)
     - Incident Issue mit "backup-failure" Label
```

### 6. Disaster Recovery Test (Monatlich 1. Sonntag 8:00 UTC)
```yaml
Trigger: 
  - Cron: 0 8 1-7 * 0 # 1. Sonntag im Monat

Workflow:
  1. Full Stack Restore Test:
     - Setup temporärer Test-Server (Docker)
     - Restore PostgreSQL Backups
     - Restore Git Repository
     - Restore File Uploads
  
  2. Service Health Checks:
     - Start CRM, API, Frontend, Games
     - Automated Smoke Tests
     - Validate Daten-Integrität
  
  3. Recovery Time Objective (RTO) Measurement:
     - Zeit von Backup-Download bis Service-Verfügbarkeit
     - Target: <2 Stunden für Full Restore
  
  4. Recovery Point Objective (RPO) Validation:
     - Vergleiche Daten-Aktualität
     - Target: <24 Stunden Datenverlust
  
  5. Documentation Update:
     - Aktualisiere docs/DISASTER-RECOVERY.md
     - Include: Lessons Learned, RTO/RPO Results
  
  6. Report an Stakeholders:
     - GitHub Issue mit DR-Test-Results
     - Email an Management
     - Slack #infrastructure
```

## n8n Node-Struktur

### Nodes Required
1. **Cron Trigger** - Zeitgesteuerte Backups
2. **SSH** - Server-Zugriff für Dumps/Files
3. **Code (JavaScript)** - GPG-Kommandos, Rotation-Logic
4. **SFTP** - Remote Backup Storage
5. **HTTP Request** - GitHub API, Cloud Storage APIs
6. **If/Switch** - Success/Failure Routing
7. **Wait** - Retry-Delays
8. **Slack/Email** - Failure Alerts
9. **GitHub** - Issue-Erstellung
10. **Read/Write Binary File** - Backup-Handling
11. **Merge** - Multi-Service Backup Coordination

### JavaScript Code Examples

#### Database Backup Script
```javascript
// Generiere pg_dump Kommando für alle DBs
const databases = [
  'civicrm_main',
  'civicrm_extensions',
  'api_users',
  'api_donations',
  'gaming_platform',
  // ... alle 17 DBs
];

const date = new Date().toISOString().split('T')[0];
const commands = [];

for (const db of databases) {
  const filename = `backup-${db}-${date}.dump`;
  const gpgFilename = `${filename}.gpg`;
  
  commands.push({
    db,
    dumpCommand: `pg_dump -h localhost -U backup_user --format=custom --compress=9 --file=/tmp/${filename} ${db}`,
    encryptCommand: `gpg --encrypt --recipient backup@menschlichkeit-oesterreich.at --output /tmp/${gpgFilename} /tmp/${filename}`,
    cleanupCommand: `rm /tmp/${filename}`,
    uploadPath: `/backups/databases/${date}/${gpgFilename}`,
    filename: gpgFilename
  });
}

return commands.map(cmd => ({ json: cmd }));
```

#### Backup Rotation Logic
```javascript
// Retention Policy: 7 Daily, 4 Weekly, 12 Monthly
const backupList = items.map(item => ({
  path: item.json.path,
  date: new Date(item.json.modifiedDate),
  type: item.json.type // 'database', 'git', 'files'
}));

const now = new Date();
const keepBackups = [];
const deleteBackups = [];

for (const backup of backupList) {
  const ageInDays = Math.floor((now - backup.date) / (1000 * 60 * 60 * 24));
  const dayOfWeek = backup.date.getDay();
  const dayOfMonth = backup.date.getDate();
  
  let keep = false;
  
  // Daily: Last 7 days
  if (ageInDays <= 7) {
    keep = true;
  }
  // Weekly: Last 4 weeks (Sundays only)
  else if (ageInDays <= 28 && dayOfWeek === 0) {
    keep = true;
  }
  // Monthly: Last 12 months (1st of month only)
  else if (ageInDays <= 365 && dayOfMonth === 1) {
    keep = true;
  }
  
  if (keep) {
    keepBackups.push(backup);
  } else {
    deleteBackups.push(backup);
  }
}

return [{
  json: {
    keep: keepBackups.length,
    delete: deleteBackups.length,
    toDelete: deleteBackups.map(b => b.path)
  }
}];
```

#### Backup Verification Test
```javascript
// Test-Restore eines zufälligen Backups
const backups = items;
const randomBackup = backups[Math.floor(Math.random() * backups.length)].json;

const testDbName = `test_restore_${Date.now()}`;

const verificationSteps = {
  backup: randomBackup.path,
  testDb: testDbName,
  
  steps: [
    {
      name: 'Download Backup',
      command: `scp backup-server:${randomBackup.path} /tmp/test-backup.dump.gpg`
    },
    {
      name: 'Decrypt Backup',
      command: `gpg --decrypt /tmp/test-backup.dump.gpg > /tmp/test-backup.dump`
    },
    {
      name: 'Create Test Database',
      command: `createdb ${testDbName}`
    },
    {
      name: 'Restore Backup',
      command: `pg_restore -d ${testDbName} /tmp/test-backup.dump`
    },
    {
      name: 'Validate Schema',
      command: `psql ${testDbName} -c "SELECT COUNT(*) FROM information_schema.tables"`
    },
    {
      name: 'Validate Data',
      command: `psql ${testDbName} -c "SELECT COUNT(*) FROM users"`
    },
    {
      name: 'Cleanup',
      command: `dropdb ${testDbName} && rm /tmp/test-backup.*`
    }
  ]
};

return [{ json: verificationSteps }];
```

#### RTO/RPO Calculation
```javascript
// Disaster Recovery Metrics
const drTestStart = new Date($('DR Test Start').first().json.timestamp);
const drTestEnd = new Date();

const recoveryTimeMinutes = Math.floor((drTestEnd - drTestStart) / (1000 * 60));

const lastBackup = new Date(items[0].json.backupTimestamp);
const dataLossHours = Math.floor((drTestStart - lastBackup) / (1000 * 60 * 60));

const result = {
  rto: {
    actual: recoveryTimeMinutes,
    target: 120, // 2 hours
    met: recoveryTimeMinutes <= 120
  },
  rpo: {
    actual: dataLossHours,
    target: 24, // 24 hours
    met: dataLossHours <= 24
  },
  timestamp: new Date().toISOString(),
  success: recoveryTimeMinutes <= 120 && dataLossHours <= 24
};

return [{ json: result }];
```

## Alert Templates

### Backup Failure Alert
```javascript
const failure = items[0].json;

const slackMessage = {
  channel: '#infrastructure-alerts',
  text: `🚨 CRITICAL: Backup Failure - ${failure.type}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚨 CRITICAL: Backup Failure`
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Type:*\n${failure.type}` },
        { type: 'mrkdwn', text: `*Target:*\n${failure.target}` },
        { type: 'mrkdwn', text: `*Error:*\n${failure.error}` },
        { type: 'mrkdwn', text: `*Time:*\n${new Date().toLocaleString('de-AT')}` }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Immediate Actions Required:*\n1. Investigate backup server connectivity\n2. Check disk space on backup target\n3. Verify GPG key availability\n4. Manual backup if automated fails'
      }
    }
  ]
};

return [{ json: slackMessage }];
```

## Environment Variables

```bash
# Backup Configuration
BACKUP_SCHEDULE_DB=0 2 * * * # Daily 2:00 UTC
BACKUP_SCHEDULE_GIT=0 3 * * * # Daily 3:00 UTC
BACKUP_SCHEDULE_FILES=0 4 * * * # Daily 4:00 UTC

# Retention
BACKUP_RETENTION_DAILY=7
BACKUP_RETENTION_WEEKLY=4
BACKUP_RETENTION_MONTHLY=12

# Encryption
GPG_RECIPIENT=backup@menschlichkeit-oesterreich.at
GPG_KEY_PATH=/secrets/backup-gpg-key.asc

# SFTP Storage
SFTP_BACKUP_HOST=backups.example.com
SFTP_BACKUP_USER=backup_uploader
SFTP_BACKUP_KEY_PATH=/secrets/sftp-backup-key
SFTP_BACKUP_PATH=/backups/

# Optional Cloud Storage
S3_BACKUP_BUCKET=menschlichkeit-backups
S3_ACCESS_KEY=xxxxxxxxxxxxx
S3_SECRET_KEY=xxxxxxxxxxxxx

# PostgreSQL
POSTGRES_BACKUP_USER=backup_user
POSTGRES_BACKUP_PASSWORD=xxxxxxxxxxxxx
POSTGRES_HOST=localhost

# Disaster Recovery
DR_TEST_SCHEDULE=0 8 1-7 * 0 # First Sunday of month
DR_RTO_TARGET_MINUTES=120
DR_RPO_TARGET_HOURS=24

# Alerts
SLACK_WEBHOOK_BACKUP_ALERTS=https://hooks.slack.com/services/T00000000/B00000000/xxxxxxxxxxxx
BACKUP_ALERT_EMAIL=infrastructure@menschlichkeit-oesterreich.at
```

## Security Best Practices

### GPG Key Management
```bash
# Generiere Backup GPG Key (einmalig)
gpg --full-generate-key
# Wähle: RSA 4096, Keine Ablaufdatum, Name: backup@menschlichkeit-oesterreich.at

# Exportiere Public Key
gpg --armor --export backup@menschlichkeit-oesterreich.at > backup-public.asc

# Exportiere Private Key (SICHER aufbewahren!)
gpg --armor --export-secret-keys backup@menschlichkeit-oesterreich.at > backup-private.asc

# Speichere in secrets/
cp backup-*.asc /workspaces/menschlichkeit-oesterreich-development/secrets/
```

### DSGVO Compliance
```markdown
Backup-Handling:
□ Verschlüsselung: Alle Backups GPG-verschlüsselt
□ Zugriff: Nur autorisierte Systeme/Personen
□ Retention: Gemäß Datenschutzrichtlinie
□ Audit-Log: Alle Backup/Restore-Operationen geloggt
□ PII-Schutz: PII-Sanitization vor Backup (wo möglich)
```

## Testing

### Manual Backup Test
```bash
# Test Database Backup
curl -X POST http://localhost:5678/webhook/backup-test \
  -H "Content-Type: application/json" \
  -d '{"type": "database", "target": "civicrm_main"}'

# Test Backup Restore
curl -X POST http://localhost:5678/webhook/backup-verify \
  -H "Content-Type: application/json" \
  -d '{"backup": "backup-civicrm_main-2025-10-07.dump.gpg"}'
```

### Validate Backups
```bash
# Liste alle Backups
ssh backup-server "find /backups -name '*.gpg' -mtime -7"

# Prüfe Backup-Größe (sollte nicht 0 sein)
ssh backup-server "du -h /backups/databases/$(date +%Y-%m-%d)/"

# Test-Decrypt (ohne Restore)
scp backup-server:/backups/databases/latest/test.dump.gpg /tmp/
gpg --decrypt /tmp/test.dump.gpg > /dev/null && echo "✅ Decrypt OK"
```

## Success Criteria

✅ Tägliche Backups aller kritischen Daten
✅ Verschlüsselung mit GPG
✅ Retention Policy automatisch enforced
✅ Wöchentliche Backup-Verification
✅ Monatliche DR-Tests
✅ RTO <2h, RPO <24h
✅ Backup-Failures triggern CRITICAL Alerts
✅ DSGVO-konformes Backup-Handling

---

**Workflow-Datei:** automation/n8n/workflows/08-backup-automation.json
**Dokumentation:** docs/DISASTER-RECOVERY.md
**Responsible:** Infrastructure Team

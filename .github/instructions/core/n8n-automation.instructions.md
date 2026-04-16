---
title: n8n Automation Instructions
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: critical
category: core
applyTo: n8n-workflows/**,automation/**,deployment-scripts/**,monitoring/**
---

# n8n Automation Instructions

## Projekt-Integration

**n8n Infrastruktur (bereits deployed):**

- **Subdomain:** n8n.menschlichkeit-oesterreich.at
- **Database:** mo_n8n (MariaDB, Plesk External)
- **Purpose:** Zentrale Automatisierungs-Plattform für alle Services

---

## Automatisierungs-Kategorien

### 1. Email Workflows

**Use Cases:**

- CiviMail Kampagnen-Trigger (Drupal → n8n → Email)
- Auto-Responder (Form Submit → n8n → Welcome Email)
- DKIM Rotation Alerts (Cron → n8n → Admin Notification)
- Newsletter Distribution (CiviCRM → n8n → Mailgun/SMTP)
- Spam Detection Alerts (Email Server → n8n → Slack)

**Nodes:**

- **Email Trigger** (IMAP/POP3)
- **Email Send** (SMTP/Mailgun/SendGrid)
- **Webhook** (Form Submissions)
- **HTTP Request** (CiviCRM API)
- **Switch** (Logic Branching)
- **Set** (Data Transformation)

**Beispiel-Workflow:**

```json
{
  "name": "CiviMail Campaign Trigger",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Form Submit Webhook",
      "parameters": {
        "path": "civimail-campaign"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "CiviCRM API",
      "parameters": {
        "url": "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/Campaign",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "civicrmApi"
      }
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Send Campaign Email",
      "parameters": {
        "fromEmail": "newsletter@menschlichkeit-oesterreich.at",
        "toEmail": "={{ $json.email }}"
      }
    }
  ]
}
```

**DSGVO-Compliance:**

- Consent-Check vor Email-Versand
- Unsubscribe-Link in jeder Email
- Logging mit Retention Policy (90 Tage)

---

### 2. Deployment Notifications

**Use Cases:**

- CI/CD Pipeline Status (GitHub Actions → n8n → Slack/Email)
- Quality Gate Failures (Codacy → n8n → GitHub Issue)
- Build Completion Alerts (Build-Pipeline → n8n → Multi-Channel)
- Rollback Triggers (Monitoring → n8n → Deploy Rollback)
- Deployment Approvals (Slack → n8n → Approval Workflow)

**Nodes:**

- **Webhook** (GitHub Webhooks)
- **HTTP Request** (Codacy API, GitHub API)
- **Slack** (Notifications)
- **Email Send** (Critical Alerts)
- **Code** (Custom Logic)
- **If** (Conditional Branching)

**Beispiel-Workflow:**

```json
{
  "name": "CI/CD Notification",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "GitHub Webhook",
      "parameters": {
        "path": "github-actions",
        "httpMethod": "POST"
      }
    },
    {
      "type": "n8n-nodes-base.if",
      "name": "Check Status",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.action }}",
              "operation": "equals",
              "value2": "completed"
            },
            {
              "value1": "={{ $json.conclusion }}",
              "operation": "equals",
              "value2": "failure"
            }
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Slack Alert",
      "parameters": {
        "channel": "#deployments",
        "text": "🚨 Deployment FAILED: {{ $json.repository.name }}"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Create GitHub Issue",
      "parameters": {
        "method": "POST",
        "url": "https://api.github.com/repos/{{ $json.repository.full_name }}/issues",
        "body": {
          "title": "Deployment Failure: {{ $json.workflow.name }}",
          "body": "Automated issue created by n8n",
          "labels": ["deployment", "ci/cd", "automated"]
        }
      }
    }
  ]
}
```

**Integration mit Quality Gates:**

- Bei Codacy-Findings: n8n → GitHub Issue mit "quality" Label
- Bei Security-Scan-Failure: n8n → Email an Security Team
- Bei Performance-Degradation: n8n → Rollback-Trigger

---

### 3. Database Automation

**Use Cases:**

- Scheduled Backups (Cron → n8n → pg_dump → S3)
- Health Checks (Cron → n8n → PostgreSQL Query → Alert)
- Migration Notifications (Prisma Migrate → n8n → Slack)
- Query Performance Monitoring (PostgreSQL → n8n → Grafana)
- Data Export Requests (DSGVO → n8n → Generate Export → Email)

**Nodes:**

- **Schedule Trigger** (Cron Jobs)
- **PostgreSQL** (DB Operations)
- **MySQL/MariaDB** (CRM Database)
- **HTTP Request** (S3 Upload, APIs)
- **Code** (Data Processing)
- **Merge** (Data Combination)

**Beispiel-Workflow:**

```json
{
  "name": "Daily Database Backup",
  "nodes": [
    {
      "type": "n8n-nodes-base.scheduleTrigger",
      "name": "Daily 3 AM",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 24
            }
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.executeCommand",
      "name": "pg_dump",
      "parameters": {
        "command": "pg_dump -h localhost -U user dbname | gzip > /backups/$(date +%Y%m%d).sql.gz"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Upload to S3",
      "parameters": {
        "method": "PUT",
        "url": "https://s3.amazonaws.com/backups/{{ $now.format('YYYYMMDD') }}.sql.gz",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "aws"
      }
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Backup Confirmation",
      "parameters": {
        "channel": "#ops",
        "text": "✅ Database Backup completed: {{ $now.format('YYYY-MM-DD HH:mm') }}"
      }
    }
  ]
}
```

**Database-Credentials (alle 17 Datenbanken):**

- In n8n Credentials speichern (verschlüsselt)
- Niemals in Workflows hardcoden
- Rotation alle 90 Tage via Secret Management

---

### 4. Monitoring & Alerting

**Use Cases:**

- Service Health Checks (HTTP Monitoring)
- Grafana Alert Routing (Grafana → n8n → Multi-Channel)
- Uptime Monitoring (Cron → n8n → HTTP Request → Alert)
- Log Analysis Alerts (ELK → n8n → PagerDuty)
- Performance Degradation (Lighthouse → n8n → Slack)

**Nodes:**

- **Webhook** (Grafana Alerts)
- **HTTP Request** (Health Endpoints)
- **Switch** (Alert Severity Routing)
- **Slack/Email/PagerDuty** (Multi-Channel)
- **Set** (Alert Enrichment)

**Beispiel-Workflow:**

```json
{
  "name": "Grafana Alert Router",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Grafana Webhook",
      "parameters": {
        "path": "grafana-alerts"
      }
    },
    {
      "type": "n8n-nodes-base.switch",
      "name": "Severity Router",
      "parameters": {
        "dataPropertyName": "severity",
        "rules": {
          "values": [
            { "value": "critical", "output": 0 },
            { "value": "warning", "output": 1 },
            { "value": "info", "output": 2 }
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.pagerDuty",
      "name": "PagerDuty (Critical)",
      "parameters": {
        "operation": "create",
        "title": "{{ $json.title }}",
        "serviceId": "{{ $credentials.pagerDutyServiceId }}"
      }
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Slack (Warning)",
      "parameters": {
        "channel": "#monitoring",
        "text": "⚠️ {{ $json.title }}"
      }
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Email (Info)",
      "parameters": {
        "toEmail": "ops@menschlichkeit-oesterreich.at"
      }
    }
  ]
}
```

**Alert-Kategorien:**

- **Critical:** PagerDuty + SMS + Email + Slack
- **Warning:** Slack + Email
- **Info:** Email only

---

### 5. DSGVO Compliance Automation

**Use Cases:**

- Data Export Requests (User Request → n8n → Generate Export → Email)
- Consent Updates (CiviCRM → n8n → Update All Services)
- Data Deletion Requests (DSGVO Right to be Forgotten)
- Privacy Audit Triggers (Scheduled → n8n → Generate Report)
- Cookie Consent Sync (Website → n8n → CRM Update)

**Nodes:**

- **Webhook** (Data Subject Requests)
- **PostgreSQL** (User Data Queries)
- **HTTP Request** (CiviCRM API)
- **Code** (Data Anonymization)
- **Email Send** (Export Delivery)

**Beispiel-Workflow:**

```json
{
  "name": "DSGVO Data Export",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Export Request",
      "parameters": {
        "path": "dsgvo-export",
        "httpMethod": "POST",
        "authentication": "headerAuth"
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Query User Data",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM users WHERE email = '{{ $json.email }}'"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "CiviCRM Donations",
      "parameters": {
        "url": "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/Contribution",
        "qs": {
          "email": "={{ $json.email }}"
        }
      }
    },
    {
      "type": "n8n-nodes-base.code",
      "name": "Generate PDF",
      "parameters": {
        "jsCode": "// Generate PDF with all user data\nconst PDFDocument = require('pdfkit');\n// ... PDF generation logic"
      }
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Send Export",
      "parameters": {
        "toEmail": "={{ $json.email }}",
        "subject": "Ihre DSGVO Datenauskunft",
        "attachments": "export.pdf"
      }
    }
  ]
}
```

**DSGVO-Critical:**

- **Logging:** Audit-Trail für alle Requests (Who? What? When?)
- **Retention:** Workflow-Logs max. 90 Tage
- **Encryption:** Alle PII in n8n verschlüsselt
- **Access Control:** n8n Login mit 2FA

---

### 6. Quality Gate Triggers

**Use Cases:**

- Codacy → n8n → GitHub Issue (bei Quality-Regression)
- Lighthouse → n8n → Slack (Performance-Alerts)
- Security Scan → n8n → Block Deployment
- Test Coverage → n8n → PR Comment
- Dependency Vulnerabilities → n8n → Auto-Fix PR

**Nodes:**

- **Webhook** (Quality Tools)
- **HTTP Request** (GitHub API)
- **If** (Threshold Checks)
- **Code** (Complex Logic)
- **Merge** (Data Aggregation)

**Beispiel-Workflow:**

```json
{
  "name": "Quality Gate Enforcement",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Codacy Webhook",
      "parameters": {
        "path": "codacy-quality"
      }
    },
    {
      "type": "n8n-nodes-base.if",
      "name": "Check Threshold",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.grade }}",
              "operation": "smaller",
              "value2": "B"
            }
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Block Deployment",
      "parameters": {
        "method": "POST",
        "url": "https://api.github.com/repos/owner/repo/statuses/{{ $json.commitSha }}",
        "body": {
          "state": "failure",
          "description": "Quality Gate Failed: Grade {{ $json.grade }}",
          "context": "quality/codacy"
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Create Issue",
      "parameters": {
        "method": "POST",
        "url": "https://api.github.com/repos/owner/repo/issues",
        "body": {
          "title": "Quality Regression Detected",
          "labels": ["quality", "automated", "blocker"]
        }
      }
    }
  ]
}
```

**Gate-Thresholds (aus quality-gates.instructions.md):**

- Maintainability: <85% → BLOCK
- Security: HIGH/CRITICAL → BLOCK
- Performance: Lighthouse <90 → BLOCK
- Coverage: <80% → WARNING

---

### 7. TODO Automation

**Use Cases:**

- Prompt Completion → n8n → TODO.md Update
- GitHub Issue Closed → n8n → Mark TODO Done
- Sprint Planning → n8n → Generate TODO Items
- Dependency Updates → n8n → Create TODO Tasks

**Nodes:**

- **Webhook** (GitHub Events)
- **HTTP Request** (GitHub API)
- **Code** (TODO.md Parsing)
- **Filesystem** (Write TODO.md)

**Beispiel-Workflow:**

```json
{
  "name": "Auto-Update TODO",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Issue Closed",
      "parameters": {
        "path": "github-issue-closed"
      }
    },
    {
      "type": "n8n-nodes-base.code",
      "name": "Parse TODO",
      "parameters": {
        "jsCode": "const fs = require('fs');\nconst todo = fs.readFileSync('TODO.md', 'utf8');\n// Mark item as done"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Commit TODO.md",
      "parameters": {
        "method": "PUT",
        "url": "https://api.github.com/repos/owner/repo/contents/TODO.md",
        "body": {
          "message": "chore: Auto-update TODO.md",
          "content": "{{ $json.content }}"
        }
      }
    }
  ]
}
```

**Integration mit update-todo-from-prompt.sh:**

- n8n kann Shell-Scripts triggern (Execute Command Node)
- Alternative: n8n implementiert Logik direkt (Code Node)

---

## Workflow Best Practices

### 1. Error Handling

**IMMER implementieren:**

```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.errorTrigger",
      "name": "Error Handler"
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Error Notification",
      "parameters": {
        "channel": "#errors",
        "text": "🔴 Workflow Error: {{ $json.error.message }}"
      }
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Admin Alert"
    }
  ]
}
```

**Error-Kategorien:**

- **Retryable:** HTTP Timeouts, DB Connection Errors
- **Non-Retryable:** Invalid Credentials, Missing Data
- **Critical:** Security-relevante Fehler

### 2. Retry Logic

**Konfiguration:**

```json
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

**Use Cases:**

- API Rate Limits
- Temporary Network Issues
- Database Deadlocks

### 3. Logging

**Strukturiertes Logging:**

```javascript
// Code Node
console.log(
  JSON.stringify({
    timestamp: new Date().toISOString(),
    workflow: 'workflow-name',
    execution_id: $executionId,
    event: 'processing_start',
    data: $json,
  })
);
```

**Log-Retention:**

- Production: 90 Tage (DSGVO)
- Staging: 30 Tage
- Development: 7 Tage

### 4. Credential Management

**Security-Prinzipien:**

- Niemals Credentials in Workflows hardcoden
- n8n Credential Store verwenden (verschlüsselt)
- Rotation alle 90 Tage
- Audit-Trail für Credential-Zugriffe

**Credentials Liste:**

```markdown
- PostgreSQL (3 External Datenbanken)
- MariaDB (5 Plesk + 9 External)
- SMTP (8 Mailboxes)
- GitHub API (PAT)
- Codacy API
- Slack Webhook
- AWS S3 (Backups)
- CiviCRM API
```

### 5. Testing

**Test-Strategie:**

- **Manual Execution:** Vor Aktivierung testen
- **Dry-Run Mode:** Workflow ohne Side-Effects
- **Test Webhooks:** Postman/curl Requests
- **Staging Environment:** Separate n8n Instance

**Test-Checklist:**

- [ ] Workflow erfolgreich ausgeführt
- [ ] Error Handling getestet (forciere Fehler)
- [ ] Credentials validiert
- [ ] Output korrekt
- [ ] Logging funktioniert
- [ ] Performance akzeptabel (<5s)

---

## MCP Tool Integration

### Filesystem MCP

**Verwendung:**

- Workflow Export/Import (JSON Files)
- Configuration Management
- Backup Workflows

**Beispiel:**

```markdown
"Export all n8n workflows to n8n-workflows/ directory"
"Read workflow JSON from n8n-workflows/civimail-campaign.json"
"Backup current workflows before update"
```

### GitHub MCP

**Verwendung:**

- Workflow Versioning (Commit Workflows zu Git)
- Issue Creation (via Workflows)
- PR Status Updates

**Beispiel:**

```markdown
"Commit all n8n workflows to GitHub"
"Create GitHub issue from n8n error notification"
"Update PR status based on n8n quality check"
```

### PostgreSQL MCP

**Verwendung:**

- Schema Queries (für Workflow-Design)
- Database Health Checks
- Migration Notifications

**Beispiel:**

```markdown
"Query PostgreSQL schema for user table structure"
"Check database connection for n8n workflow"
"List all tables in mo_n8n database"
```

### Brave Search MCP

**Verwendung:**

- n8n Best Practices recherchieren
- Node-Dokumentation finden
- Error-Troubleshooting

**Beispiel:**

```markdown
"Search for n8n PostgreSQL node best practices"
"Find n8n error handling examples"
"Search for n8n webhook security recommendations"
```

---

## Automatische Workflow-Triggers

### Nach jedem Deployment

```markdown
IMMER triggern:

1. Deployment Success → n8n → Slack Notification
2. Deployment Failure → n8n → Create GitHub Issue
3. Rollback → n8n → Alert All Channels
```

### Bei Quality Gate Failures

```markdown
IMMER triggern:

1. Codacy Grade < B → n8n → Block Deployment
2. Security Scan HIGH/CRITICAL → n8n → PagerDuty
3. Performance < 90 → n8n → Create Issue
```

### Bei DSGVO-Requests

```markdown
IMMER triggern:

1. Data Export Request → n8n → Generate & Email PDF
2. Deletion Request → n8n → Multi-DB Cascade Delete
3. Consent Update → n8n → Sync All Services
```

---

## Workflow-Kategorisierung

### Production Workflows (24/7)

```markdown
Kategorie: Mission-Critical

- Email Automation
- Monitoring Alerts
- DSGVO Compliance
- Database Backups

Requirements:

- Error Handling: MANDATORY
- Retry Logic: 3 Attempts
- Logging: Detailed
- Alerting: Multi-Channel
```

### Scheduled Workflows

```markdown
Kategorie: Maintenance

- Daily Database Backups (3 AM)
- Weekly Quality Reports (Montag 9 AM)
- Monthly DSGVO Audits (1. des Monats)
- Hourly Health Checks

Requirements:

- Cron Schedule: Documented
- Execution Time: <5 min
- Failure Recovery: Automatic Retry
```

### On-Demand Workflows

```markdown
Kategorie: Manual Triggers

- Deployment Approvals
- Emergency Rollbacks
- Ad-hoc Reports
- Test Data Generation

Requirements:

- Manual Trigger Only
- Confirmation Step
- Audit Logging
```

---

## Performance Optimization

### Workflow-Performance

**Targets:**

- Execution Time: <5s (Standard), <30s (Complex)
- Memory: <256MB per Execution
- CPU: <50% Peak

**Optimization:**

```javascript
// ❌ BAD: Sequential HTTP Requests
await httpRequest1();
await httpRequest2();
await httpRequest3();

// ✅ GOOD: Parallel Requests
await Promise.all([httpRequest1(), httpRequest2(), httpRequest3()]);
```

### Database Queries

**Best Practices:**

```sql
-- ❌ BAD: SELECT *
SELECT * FROM users WHERE email = 'user@example.com';

-- ✅ GOOD: Specific Fields + Index
SELECT id, email, name FROM users WHERE email = 'user@example.com';
CREATE INDEX idx_users_email ON users(email);
```

### Webhook Response Time

**Targets:**

- Webhook Acknowledge: <200ms
- Processing: Asynchronous

**Pattern:**

```javascript
// Webhook Node: Immediate Response
return {
  status: 'accepted',
  message: 'Processing started',
};

// Actual Processing: In Background
// (Next Nodes execute after response)
```

---

## Security Considerations

### Webhook Security

**Mandatory:**

- HTTPS only (TLS 1.3)
- Webhook Secrets (HMAC Validation)
- IP Whitelisting (wenn möglich)
- Rate Limiting (100 req/min)

**Beispiel:**

```javascript
// Code Node: Webhook Signature Validation
const crypto = require('crypto');
const signature = $headers['x-webhook-signature'];
const payload = JSON.stringify($json);
const expected = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expected) {
  throw new Error('Invalid webhook signature');
}
```

### Credential Rotation

**Schedule:**

- API Tokens: 90 Tage
- Database Passwords: 90 Tage
- Webhook Secrets: 180 Tage

**Automation via n8n:**

```json
{
  "name": "Credential Rotation Alert",
  "trigger": "Schedule (every 85 days)",
  "actions": [
    "Check credential age",
    "Send rotation reminder",
    "Create Jira ticket"
  ]
}
```

### PII Handling

**DSGVO-Compliant:**

- Niemals PII in Workflow-Namen
- Niemals PII in Error Messages
- Niemals PII in Logs (außer Audit-Log mit Retention)
- Encryption at Rest (n8n Database)

---

## Workflow-Dokumentation

### Template

```markdown
# Workflow: [Name]

## Purpose

[Was macht dieser Workflow?]

## Trigger

[Wie wird er gestartet?]

## Inputs

- **Field 1:** Description
- **Field 2:** Description

## Outputs

- **Success:** Description
- **Error:** Description

## Nodes

1. **Node 1:** Function
2. **Node 2:** Function

## Error Handling

[Wie werden Fehler behandelt?]

## Dependencies

- Credentials: [Liste]
- External Services: [Liste]

## Testing

\`\`\`bash
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/test \
 -H "Content-Type: application/json" \
 -d '{"test": "data"}'
\`\`\`

## Maintenance

- Owner: [Team/Person]
- Last Updated: [Datum]
- Review Schedule: [Frequency]
```

---

## Quality Checklist

Vor Aktivierung eines Workflows:

- [ ] **Purpose** klar definiert
- [ ] **Error Handling** implementiert
- [ ] **Retry Logic** konfiguriert
- [ ] **Logging** strukturiert
- [ ] **Credentials** sicher gespeichert
- [ ] **Testing** durchgeführt (Manual Execution)
- [ ] **Documentation** vollständig
- [ ] **Performance** validiert (<5s)
- [ ] **Security** geprüft (Webhook Secrets, HTTPS)
- [ ] **DSGVO** compliance (kein PII in Logs)
- [ ] **Monitoring** aktiviert (Execution Logs)

---

## Integration mit Projekt-Workflows

### Deployment Pipeline

```markdown
build-pipeline.sh → GitHub Actions → n8n Webhook → Multi-Channel Notification
```

### Quality Gates

```markdown
Codacy Analysis → n8n Webhook → Check Thresholds → Block/Allow Deployment
```

### DSGVO Requests

```markdown
User Request → CiviCRM Form → n8n Webhook → Process Request → Email Response
```

---

## Maintenance & Updates

### Workflow Updates

**Process:**

1. Export aktuelle Workflows (Backup)
2. Änderungen in Staging testen
3. Git Commit (Workflow JSON)
4. Deploy zu Production
5. Smoke Test (Manual Trigger)

**Via Filesystem MCP:**

```markdown
"Backup all n8n workflows before update"
"Commit updated workflows to git"
```

### n8n Version Updates

**Process:**

1. Check Release Notes (Breaking Changes?)
2. Staging Update & Test
3. Production Update (Maintenance Window)
4. Verify all Workflows functional

**Schedule:** Quarterly (alle 3 Monate)

---

**Instructions erstellt:** 2025-10-07  
**Kategorie:** Automation  
**Priority:** CRITICAL

---

### 8. ERPNext Finance Flows

**Bereitgestellte Workflows (`automation/n8n/workflows/`):**

| Workflow-Datei                               | Trigger          | Ziel-Endpunkt                                             |
| -------------------------------------------- | ---------------- | --------------------------------------------------------- |
| `finance-erpnext-sync-processor.json`        | Cron alle 10 min | `POST /api/internal/finance/erpnext/process?limit=25`     |
| `finance-erpnext-payment-entry.json`         | Webhook          | `POST /api/internal/finance/erpnext/payment`              |
| `finance-erpnext-reconciliation-report.json` | Montag 07:30 UTC | `GET /api/internal/finance/erpnext/health` + Alert-E-Mail |

**Trigger-Endpunkte (intern, Signature-Guard):**

- `POST /internal/finance/erpnext/process` — Verarbeitet bis zu `limit` ausstehende Sync-Eintraege
- `GET  /internal/finance/erpnext/health` — Health-Check; liefert Fehleranzahl je Status

**Sicherheit:**

- Signierung: HMAC-SHA256 mit `N8N_WEBHOOK_SECRET`
- Idempotenz: SHA256(`source_system:entity_type:entity_id:operation`)
- Nur HTTPS (TLS 1.3), Rate Limiting ueber API-Gateway

**Konten-Mapping (AT-Standard):**

- `4000 - Mitgliedsbeitraege - MOE` — Mitgliedsbeitraege
- `4100 - Spenden - MOE` — Spenden
- `4200 - Veranstaltungserloese - MOE` — Veranstaltungen
- `1360 - Stripe Clearing - MOE` / `1370 - SEPA Clearing - MOE` — Zahlungsabwicklung
- `1000 - Kassa - MOE` / `1100 - Bank - MOE` — Liquiditaet

**Fehlerbehandlung:**

- Exponential Backoff: 2^n × 60 s, max 3 Retries
- Dead Letter: `finance_external_sync.status = 'failed'` nach Erschoepfung aller Retries
- Alert-E-Mail an `finanzen@menschlichkeit-oesterreich.at` bei Reconciliation-Failures
  **MCP Tools:** Filesystem, GitHub, PostgreSQL, Brave Search

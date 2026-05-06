# Automation – n8n Workflow Automation

> **Docker-based n8n Workflows für Build-Notifications, Datenintegration & Monitoring**

**URL (Development)**: `http://localhost:5678`

---

## 🎯 Übersicht

Der Automation Service nutzt **n8n** (node-based workflow automation) für:

- 🔔 **Build Notifications** (Webhook → Slack/Email bei Build Success/Failure)
- 🔄 **Data Sync** (CiviCRM ↔ API ↔ Frontend)
- 📊 **Monitoring** (Quality Reports, Security Scans)
- 📧 **Email Automation** (Newsletter, Membership Renewals)
- 🔐 **DSGVO Compliance** (Automated Data Retention Checks)

**Tech Stack**: n8n (Docker), Custom Nodes, PostgreSQL

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** 24+
- **Docker Compose** v2+

### Installation

```bash
# In automation-Verzeichnis wechseln
cd automation/n8n

# Docker Container starten
docker-compose up -d

# ODER von Root:
npm run n8n:start
```

**n8n UI verfügbar unter**: <http://localhost:5678>

**Default Credentials**:

- **Email**: `admin@menschlichkeit-oesterreich.at`
- **Password**: Siehe `.env` (oder erstelle neuen User beim ersten Start)

---

## 📁 Projektstruktur

```
automation/
├── n8n/
│   ├── docker-compose.yml      # Docker Compose Configuration
│   ├── .env                    # Environment Variables (not in git)
│   ├── workflows/              # n8n Workflow JSON Files
│   │   ├── build-notification.json
│   │   ├── crm-sync.json
│   │   ├── email-automation.json
│   │   └── dsgvo-retention-check.json
│   ├── custom-nodes/           # Custom n8n Nodes
│   │   └── pii-sanitizer/      # PII Sanitizer Node
│   │       ├── package.json
│   │       ├── PiiSanitizer.node.ts
│   │       └── README.md
│   ├── credentials/            # n8n Credentials (encrypted)
│   ├── N8N-WORKFLOW-IMPORT-GUIDE.md
│   ├── QUICK-START.md
│   ├── TROUBLESHOOTING.md
│   └── WORKFLOW-IMPORT-STEPS.md
├── elk-stack/                  # ELK Stack (optional, für Monitoring)
│   ├── docker-compose.yml
│   └── elasticsearch/
└── README.md                   # This file
```

---

## 🔄 Workflows

### 1. Build Notification Workflow

**Trigger**: Webhook von `build-pipeline.sh`  
**Aktionen**:

- Parse Build-Ergebnis (Success/Failure)
- Sende Slack-Nachricht an #builds Channel
- Bei Failure: Email an Tech Lead

**Workflow File**: `workflows/build-notification.json`

**Webhook URL**: `http://localhost:5678/webhook/build-notification`

**Integration in build-pipeline.sh**:

```bash
# build-pipeline.sh
curl -X POST http://localhost:5678/webhook/build-notification \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "environment": "staging",
    "commit": "$GIT_COMMIT",
    "duration": "120s"
  }'
```

---

### 2. CRM Sync Workflow

**Trigger**: Cron (täglich 02:00)  
**Aktionen**:

- Fetch neue CiviCRM Contacts
- Sync zu API Database
- Update User Permissions

**Workflow File**: `workflows/crm-sync.json`

---

### 3. Email Automation Workflow

**Trigger**: API Event (Membership Renewal)  
**Aktionen**:

- Lade Email-Template
- Personalisiere Content (Anrede, Membership Details)
- PII Sanitizer (Custom Node) → Logs scrubben
- Sende Email via SMTP

**Workflow File**: `workflows/email-automation.json`

---

### 4. DSGVO Retention Check Workflow

**Trigger**: Cron (wöchentlich)  
**Aktionen**:

- Prüfe Database: User ohne Aktivität >2 Jahre
- Generiere Lösch-Report
- Benachrichtige Data Protection Officer
- Markiere Users für Löschung (manuelles Review erforderlich)

**Workflow File**: `workflows/dsgvo-retention-check.json`

---

## 🔌 Custom Nodes

### PII Sanitizer Node

**Zweck**: DSGVO-konforme Redaktion sensibler Daten in Workflow-Logs

**Installation**:

```bash
cd custom-nodes/pii-sanitizer
npm install
npm run build

# Link zu n8n
docker exec -it n8n npm link /data/custom-nodes/pii-sanitizer
docker restart n8n
```

**Verwendung in Workflows**:

```json
{
  "name": "PII Sanitizer",
  "type": "n8n-nodes-pii-sanitizer",
  "position": [450, 300],
  "parameters": {
    "field": "email",
    "redactionMode": "partial"
  }
}
```

**Dokumentation**: [custom-nodes/pii-sanitizer/README.md](n8n/custom-nodes/pii-sanitizer/README.md)

---

## 📥 Workflow Import

### Workflows importieren

1. **n8n UI öffnen**: <http://localhost:5678>
2. **Workflows** → **Import from File**
3. **File auswählen**: z.B. `workflows/build-notification.json`
4. **Activate Workflow**

**Detaillierte Anleitung**: [n8n/N8N-WORKFLOW-IMPORT-GUIDE.md](n8n/N8N-WORKFLOW-IMPORT-GUIDE.md)

---

## 🔐 Credentials Management

### Credentials speichern

**In n8n UI**:

1. **Credentials** → **Add Credential**
2. **Type auswählen**: z.B. "SMTP"
3. **Details eingeben**:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `noreply@menschlichkeit-oesterreich.at`
   - Password: `***` (aus Secrets Manager)
4. **Save**

**Credentials werden verschlüsselt** in PostgreSQL gespeichert.

**Backup**: Siehe [../scripts/backup-n8n-credentials.sh](../scripts/backup-n8n-credentials.sh)

---

## 🗄️ Database

n8n nutzt **PostgreSQL** für:

- Workflow-Definitionen
- Execution History
- Credentials (encrypted)

**Connection String** (in `docker-compose.yml`):

```yaml
environment:
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PORT=5432
  - DB_POSTGRESDB_DATABASE=n8n
  - DB_POSTGRESDB_USER=n8n
  - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
```

---

## 🧪 Testing

### Workflow Testing

```bash
# 1. Workflow in n8n UI öffnen
# 2. "Execute Workflow" klicken
# 3. Execution Inspector prüfen

# Webhook testen (Build Notification)
curl -X POST http://localhost:5678/webhook/build-notification \
  -H "Content-Type: application/json" \
  -d '{"status": "success", "environment": "test"}'
```

---

## 📊 Monitoring

### ELK Stack Integration (Optional)

```bash
cd automation/elk-stack
docker-compose up -d

# Elasticsearch: http://localhost:9200
# Kibana: http://localhost:5601
```

**n8n Logs → Elasticsearch**:

```yaml
# docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "service=n8n"
```

---

## 🚀 Deployment

### Production Deployment (Plesk/Docker)

```bash
# Von Root-Verzeichnis
./deployment-scripts/deploy-n8n-plesk.sh

# ODER manuell:
cd automation/n8n
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```bash
# .env (auf Server)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<secure-password>
N8N_HOST=automation.menschlichkeit-oesterreich.at
N8N_PROTOCOL=https
N8N_PORT=443
WEBHOOK_URL=https://automation.menschlichkeit-oesterreich.at/
DB_PASSWORD=<secure-db-password>
```

---

## 🔒 Security

### Best Practices

✅ **Basic Auth aktiviert** (Production)  
✅ **HTTPS erzwungen** (via Reverse Proxy)  
✅ **Credentials encrypted** (PostgreSQL)  
✅ **PII Sanitization** (Custom Node für Logs)  
✅ **Webhook Secrets** (HMAC Signature Verification)

### Webhook Security

```javascript
// Webhook mit HMAC Signature
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

// In Webhook-Request Header:
headers: {
  'X-Signature': signature
}
```

---

## 🧹 Maintenance

### Cleanup alte Executions

```sql
-- PostgreSQL: Executions älter als 30 Tage löschen
DELETE FROM execution_entity 
WHERE "stoppedAt" < NOW() - INTERVAL '30 days';
```

**Automatisierter Cleanup**: Workflow `workflows/cleanup-executions.json`

---

## 🆘 Troubleshooting

### Häufige Probleme

**Problem**: Container startet nicht  
**Lösung**:

```bash
docker-compose down
docker-compose up -d --force-recreate
```

**Problem**: Workflows verschwinden nach Restart  
**Lösung**: PostgreSQL-Volume prüfen:

```bash
docker volume ls
docker volume inspect n8n_postgres_data
```

**Vollständige Troubleshooting-Anleitung**: [n8n/TROUBLESHOOTING.md](n8n/TROUBLESHOOTING.md)

---

## 🤝 Contributing

### Neuen Workflow hinzufügen

1. **In n8n UI erstellen** & testen
2. **Export**: Workflow → Export → Download JSON
3. **File speichern**: `workflows/mein-workflow.json`
4. **Dokumentation**: README aktualisieren
5. **Git Commit**: `git add workflows/mein-workflow.json`

Siehe [../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

---

## 📖 Weitere Dokumentation

- **Workflow Import**: [n8n/N8N-WORKFLOW-IMPORT-GUIDE.md](n8n/N8N-WORKFLOW-IMPORT-GUIDE.md)
- **Quick Start**: [n8n/QUICK-START.md](n8n/QUICK-START.md)
- **Troubleshooting**: [n8n/TROUBLESHOOTING.md](n8n/TROUBLESHOOTING.md)
- **PII Sanitizer Node**: [n8n/custom-nodes/pii-sanitizer/README.md](n8n/custom-nodes/pii-sanitizer/README.md)
- **DOCS-INDEX**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## 📜 Lizenz

MIT License – Siehe [../LICENSE](../LICENSE)

---

<div align="center">
  <strong>🔄 Automated Workflows für NGO Excellence 🇦🇹</strong>
  <br>
  <sub>Powered by n8n | Docker | PostgreSQL</sub>
</div>

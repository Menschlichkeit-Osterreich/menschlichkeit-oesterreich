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

# n8n Infrastructure Monitoring Automation Prompt

## Ziel
Automatisiere das Monitoring aller Services (Website, API, CRM, Frontend, Gaming) inkl. Uptime-Checks, Performance-Tracking, Error-Alerting und Log-Analyse.

## Kontext
- **Services:** 5 Hauptservices (Website, API, CRM, Frontend, Gaming)
- **Hosting:** Plesk-basiertes Hosting mit SSH-Zugang
- **Monitoring-Ziele:** Uptime, Response Time, Error Rate, Resource Usage
- **Alerts:** Slack, Email, GitHub Issues bei Incidents

## Workflow-Anforderungen

### 1. Service Health Check (Alle 5 Minuten)
```yaml
Trigger: 
  - Cron: */5 * * * *
  - On-Demand via Webhook

Workflow:
  1. Prüfe jeden Service:
     - menschlichkeit-oesterreich.at (Website)
     - api.menschlichkeit-oesterreich.at (FastAPI)
     - crm.menschlichkeit-oesterreich.at (Drupal/CiviCRM)
     - frontend.menschlichkeit-oesterreich.at (React)
     - games.menschlichkeit-oesterreich.at (Gaming Platform)
  
  2. Health Check Details:
     - HTTP Status Code (erwarte 200)
     - Response Time (Threshold: <2s)
     - Content Validation (prüfe spezifische String)
     - SSL Certificate Status (Ablauf-Warnung)
  
  3. Speichere Metriken:
     - quality-reports/monitoring/uptime-{service}-{date}.ndjson
     - Format: {"timestamp": "...", "service": "...", "status": 200, "responseTime": 1.2}
  
  4. Bei Failure:
     - Retry: 3x mit 30s Pause
     - Bei persistent Failure → Trigger Alert Workflow
```

### 2. Performance Monitoring (Stündlich)
```yaml
Trigger: 
  - Cron: 0 * * * *

Workflow:
  1. Lighthouse Audits für alle Frontend-Services:
     - Website, Frontend, Games
     - Metrics: Performance, Accessibility, Best Practices, SEO
  
  2. API Performance:
     - Test kritische Endpoints:
       - GET /api/v1/health
       - GET /api/v1/users/me
       - POST /api/v1/donations (Test-Transaction)
     - Measure: Response Time, Error Rate
  
  3. Database Performance (via PostgreSQL MCP):
     - Query: SELECT pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10
     - Alert bei Queries >500ms
  
  4. Speichere Performance-Daten:
     - quality-reports/monitoring/performance-{date}.json
  
  5. Trend-Analyse:
     - Vergleiche mit letzter Stunde/Tag/Woche
     - Alert bei Performance-Degradation >20%
```

### 3. Error & Log Monitoring (Alle 10 Minuten)
```yaml
Trigger: 
  - Cron: */10 * * * *

Workflow:
  1. SSH zu Plesk Server:
     - Lese Error Logs:
       - /var/log/nginx/error.log (Website)
       - /var/log/drupal/error.log (CRM)
       - /var/log/fastapi/error.log (API)
  
  2. Parse Logs:
     - Filter: Errors (ERROR, CRITICAL) der letzten 10 Minuten
     - Kategorisiere: 500 Errors, Exceptions, Security Events
  
  3. PII-Sanitization:
     - Nutze api.menschlichkeit-oesterreich.at/app/lib/pii_sanitizer.py
     - Entferne Email, IP, Namen aus Logs
  
  4. Error-Aggregation:
     - Group by Error Type
     - Count Occurrences
     - Identify Spikes (>10x normal rate)
  
  5. Bei Critical Errors:
     - Sofortige Slack Alert
     - GitHub Issue erstellen
     - Optional: SMS an On-Call Engineer
```

### 4. SSL Certificate Monitoring (Täglich)
```yaml
Trigger: 
  - Cron: 0 8 * * *

Workflow:
  1. Prüfe SSL-Zertifikate aller Domains:
     - menschlichkeit-oesterreich.at
     - api.menschlichkeit-oesterreich.at
     - crm.menschlichkeit-oesterreich.at
     - *.menschlichkeit-oesterreich.at (Wildcard)
  
  2. Check Details:
     - Expiry Date
     - Issuer (Let's Encrypt expected)
     - Certificate Chain Validity
  
  3. Alert Thresholds:
     - 30 Tage: WARNING (Slack + GitHub Issue)
     - 14 Tage: CRITICAL (Slack + Email + SMS)
     - 7 Tage: URGENT (All channels + On-Call)
  
  4. Auto-Renewal Check:
     - Prüfe Plesk Auto-Renewal Status
     - Bei deaktiviert: Sofortige Warnung
```

### 5. Resource Usage Monitoring (Alle 30 Minuten)
```yaml
Trigger: 
  - Cron: */30 * * * *

Workflow:
  1. SSH zu Plesk Server:
     - CPU Usage (via top/htop)
     - Memory Usage (free -m)
     - Disk Space (df -h)
     - Database Connections (PostgreSQL: SELECT count(*) FROM pg_stat_activity)
  
  2. Parse Metriken:
     - CPU: Alert bei >80% sustained
     - Memory: Alert bei >90%
     - Disk: Alert bei >85%
     - DB Connections: Alert bei >75% of max_connections
  
  3. Speichere Time-Series Data:
     - quality-reports/monitoring/resources-{date}.ndjson
  
  4. Trend-Analyse:
     - Predict Disk Full Date (linear regression)
     - Identify Resource-hungry Processes
  
  5. Proactive Alerts:
     - Warne 7 Tage bevor Disk voll
     - Warne bei stetigem Memory-Anstieg (Memory Leak?)
```

### 6. Availability Report (Wöchentlich)
```yaml
Trigger: 
  - Cron: 0 9 * * MON

Workflow:
  1. Aggregiere Uptime-Daten der letzten 7 Tage:
     - Pro Service: Uptime %, Downtime Minutes, Incidents
  
  2. Berechne SLA:
     - Target: 99.9% Uptime (Downtime Allowance: 10.08 min/Woche)
     - Actual vs. Target
  
  3. Incident Summary:
     - Anzahl Incidents
     - Average Resolution Time
     - Root Causes
  
  4. Performance Summary:
     - Average Response Time
     - Slowest Endpoints
     - Performance Trends
  
  5. Erstelle GitHub Issue:
     - Title: "📊 Weekly Availability Report - KW {week}"
     - Label: monitoring, weekly-report
     - Include: Charts (Quickchart.io)
  
  6. Sende an Stakeholders:
     - Slack #monitoring-reports
     - Email an Management
```

## n8n Node-Struktur

### Nodes Required
1. **Cron Trigger** - Zeitgesteuerte Checks
2. **HTTP Request** - Health Checks, API Tests
3. **SSH** - Server-Zugriff für Logs/Metriken
4. **Code (JavaScript)** - Log-Parsing, Metriken-Berechnung
5. **If/Switch** - Routing basierend auf Status
6. **Slack** - Alerts
7. **Email** - Critical Notifications
8. **GitHub** - Issue-Erstellung
9. **Write Binary File** - Speichere Metriken
10. **Merge** - Kombiniere Multi-Service-Daten
11. **Wait** - Retry-Logic
12. **Quickchart** - Visualisierung

### JavaScript Code Examples

#### Health Check Logic
```javascript
// Multi-Service Health Check
const services = [
  { name: 'Website', url: 'https://menschlichkeit-oesterreich.at', expectedString: 'Menschlichkeit' },
  { name: 'API', url: 'https://api.menschlichkeit-oesterreich.at/health', expectedString: 'healthy' },
  { name: 'CRM', url: 'https://crm.menschlichkeit-oesterreich.at', expectedString: 'Drupal' },
  { name: 'Frontend', url: 'https://frontend.menschlichkeit-oesterreich.at', expectedString: 'React' },
  { name: 'Games', url: 'https://games.menschlichkeit-oesterreich.at', expectedString: 'Game' }
];

const results = [];

for (const service of services) {
  const startTime = Date.now();
  try {
    const response = await $http.get(service.url, {
      timeout: 5000,
      validateStatus: () => true // Don't throw on non-2xx
    });
    
    const responseTime = Date.now() - startTime;
    const contentValid = response.data.includes(service.expectedString);
    
    results.push({
      timestamp: new Date().toISOString(),
      service: service.name,
      status: response.status,
      responseTime: responseTime / 1000, // seconds
      contentValid,
      healthy: response.status === 200 && contentValid && responseTime < 2000
    });
  } catch (error) {
    results.push({
      timestamp: new Date().toISOString(),
      service: service.name,
      status: 0,
      responseTime: null,
      contentValid: false,
      healthy: false,
      error: error.message
    });
  }
}

return results.map(r => ({ json: r }));
```

#### Log Parsing & PII Sanitization
```javascript
// Parse Error Logs und entferne PII
const logContent = items[0].binary.data.toString('utf-8');
const lines = logContent.split('\n');

// Regex Patterns für PII
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

const errors = lines
  .filter(line => line.includes('ERROR') || line.includes('CRITICAL'))
  .map(line => {
    // PII entfernen
    let sanitized = line
      .replace(emailRegex, '[EMAIL_REDACTED]')
      .replace(ipRegex, '[IP_REDACTED]');
    
    // Parse Struktur (Beispiel für Standard-Log-Format)
    const match = sanitized.match(/\[(.*?)\] (ERROR|CRITICAL): (.*)/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3],
        raw: sanitized
      };
    }
    return { raw: sanitized };
  });

// Gruppiere nach Error-Type
const grouped = errors.reduce((acc, err) => {
  const key = err.message?.split(':')[0] || 'Unknown';
  if (!acc[key]) acc[key] = [];
  acc[key].push(err);
  return acc;
}, {});

// Finde Spikes
const errorCounts = Object.entries(grouped).map(([type, errs]) => ({
  type,
  count: errs.length,
  spike: errs.length > 10 // Threshold
}));

return [{ json: { errors, grouped, errorCounts } }];
```

#### SSL Certificate Check
```javascript
// Prüfe SSL-Zertifikat-Ablauf
const tls = require('tls');
const url = require('url');

const domains = [
  'menschlichkeit-oesterreich.at',
  'api.menschlichkeit-oesterreich.at',
  'crm.menschlichkeit-oesterreich.at'
];

const results = [];

for (const domain of domains) {
  try {
    const socket = tls.connect(443, domain, { servername: domain }, () => {
      const cert = socket.getPeerCertificate();
      const expiryDate = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
      
      let severity = 'OK';
      if (daysUntilExpiry <= 7) severity = 'URGENT';
      else if (daysUntilExpiry <= 14) severity = 'CRITICAL';
      else if (daysUntilExpiry <= 30) severity = 'WARNING';
      
      results.push({
        domain,
        issuer: cert.issuer.O,
        expiryDate: cert.valid_to,
        daysUntilExpiry,
        severity
      });
      
      socket.end();
    });
  } catch (error) {
    results.push({
      domain,
      error: error.message,
      severity: 'ERROR'
    });
  }
}

return results.map(r => ({ json: r }));
```

#### Resource Usage Analysis
```javascript
// Parse Server Resource Metrics
const cpuOutput = $('SSH - CPU').first().json.stdout;
const memOutput = $('SSH - Memory').first().json.stdout;
const diskOutput = $('SSH - Disk').first().json.stdout;

// Parse CPU (top output)
const cpuMatch = cpuOutput.match(/Cpu\(s\):\s+(\d+\.\d+)%us/);
const cpuUsage = parseFloat(cpuMatch?.[1] || 0);

// Parse Memory (free -m)
const memMatch = memOutput.match(/Mem:\s+(\d+)\s+(\d+)/);
const memTotal = parseInt(memMatch?.[1] || 0);
const memUsed = parseInt(memMatch?.[2] || 0);
const memPercent = (memUsed / memTotal) * 100;

// Parse Disk (df -h)
const diskMatch = diskOutput.match(/\/dev\/\w+\s+\S+\s+\S+\s+\S+\s+(\d+)%/);
const diskPercent = parseInt(diskMatch?.[1] || 0);

// Threshold Checks
const alerts = [];
if (cpuUsage > 80) alerts.push({ type: 'CPU', value: cpuUsage, threshold: 80 });
if (memPercent > 90) alerts.push({ type: 'Memory', value: memPercent, threshold: 90 });
if (diskPercent > 85) alerts.push({ type: 'Disk', value: diskPercent, threshold: 85 });

return [{
  json: {
    timestamp: new Date().toISOString(),
    cpu: cpuUsage,
    memory: memPercent,
    disk: diskPercent,
    alerts,
    critical: alerts.length > 0
  }
}];
```

## Alert Templates

### Slack Alert (Service Down)
```javascript
const service = items[0].json;

const slackMessage = {
  channel: '#monitoring-alerts',
  text: `🔴 Service Down: ${service.service}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🔴 Service Down: ${service.service}`
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Service:*\n${service.service}` },
        { type: 'mrkdwn', text: `*Status:*\n${service.status || 'Unreachable'}` },
        { type: 'mrkdwn', text: `*Time:*\n${new Date().toLocaleString('de-AT')}` },
        { type: 'mrkdwn', text: `*Error:*\n${service.error || 'N/A'}` }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Next Steps:*\n1. Check Plesk Server Status\n2. Review Error Logs\n3. Contact Hosting Provider if needed'
      }
    }
  ]
};

return [{ json: slackMessage }];
```

### GitHub Issue (Performance Degradation)
```javascript
const data = items[0].json;

const issueBody = `## Performance Degradation Detected

**Service:** ${data.service}
**Metric:** ${data.metric}
**Current Value:** ${data.currentValue}
**Expected Value:** ${data.expectedValue}
**Degradation:** ${data.degradation}%

### Timeline
${data.timeline.map(t => `- ${t.time}: ${t.value}`).join('\n')}

### Recommended Actions
1. [ ] Review recent deployments
2. [ ] Check database query performance
3. [ ] Analyze server resources
4. [ ] Review error logs

### Logs
\`\`\`
${data.relevantLogs}
\`\`\`

---
*Auto-generated by n8n Monitoring*
`;

return [{
  json: {
    title: `🐌 Performance Degradation: ${data.service} - ${data.metric}`,
    body: issueBody,
    labels: ['monitoring', 'performance', 'auto-generated'],
    assignees: ['devops-team']
  }
}];
```

## Environment Variables

```bash
# Monitoring Configuration
MONITORING_HEALTH_CHECK_INTERVAL=5 # minutes
MONITORING_PERFORMANCE_INTERVAL=60 # minutes
MONITORING_LOG_CHECK_INTERVAL=10 # minutes

# Plesk Server SSH
PLESK_SSH_HOST=your-server.com
PLESK_SSH_USER=monitoring
PLESK_SSH_KEY_PATH=/secrets/plesk-monitoring-key

# Alert Thresholds
ALERT_RESPONSE_TIME_THRESHOLD=2000 # ms
ALERT_CPU_THRESHOLD=80 # percent
ALERT_MEMORY_THRESHOLD=90 # percent
ALERT_DISK_THRESHOLD=85 # percent

# SSL Monitoring
SSL_WARNING_DAYS=30
SSL_CRITICAL_DAYS=14
SSL_URGENT_DAYS=7

# Slack
SLACK_WEBHOOK_MONITORING=https://hooks.slack.com/services/T00000000/B00000000/xxxxxxxxxxxx
SLACK_CHANNEL_MONITORING=#monitoring-alerts

# On-Call (für URGENT Alerts)
ONCALL_EMAIL=oncall@menschlichkeit-oesterreich.at
ONCALL_SMS_API=https://sms-api.example.com
```

## Testing

### Manual Test
```bash
# Test Health Check Workflow
curl -X POST http://localhost:5678/webhook/monitoring-test \
  -H "Content-Type: application/json" \
  -d '{"test": "health_check"}'

# Simulate Service Down
curl -X POST http://localhost:5678/webhook/monitoring-test \
  -H "Content-Type: application/json" \
  -d '{
    "service": "API",
    "status": 0,
    "error": "Connection timeout"
  }'
```

### Validate Metrics
```bash
# Prüfe gespeicherte Metriken
ls -lh quality-reports/monitoring/
tail -f quality-reports/monitoring/uptime-*.ndjson

# Visualisiere mit jq
cat quality-reports/monitoring/uptime-api-$(date +%Y-%m-%d).ndjson | jq -s '
  map({time: .timestamp, responseTime: .responseTime}) | 
  sort_by(.time)
'
```

## Success Criteria

✅ Alle Services werden alle 5 Minuten gecheckt
✅ Performance-Degradation wird innerhalb 1h erkannt
✅ Critical Errors triggern sofortige Alerts
✅ SSL-Ablauf-Warnungen 30 Tage im Voraus
✅ Resource-Bottlenecks werden proaktiv erkannt
✅ Wöchentliche Availability-Reports automatisch

---

**Workflow-Datei:** automation/n8n/workflows/07-monitoring.json
**Dokumentation:** docs/N8N-MONITORING.md

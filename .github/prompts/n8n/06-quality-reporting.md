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

# n8n Quality Reporting Automation Prompt

## Ziel
Automatisiere die Generierung und Verteilung von Quality Reports aus allen Quality Gates für tägliches Monitoring und Trend-Analysen.

## Kontext
- **Projekt:** Menschlichkeit Österreich Multi-Service Platform
- **Quality Gates:** Security, DSGVO, Code Quality, Performance, Accessibility
- **Report-Quellen:** Codacy, Trivy, Lighthouse, Playwright, Custom Scripts
- **Verteilung:** GitHub Issues, Slack, Email, Dashboard

## Workflow-Anforderungen

### 1. Daily Quality Report Generation
```yaml
Trigger: 
  - Täglich 6:00 UTC
  - Nach jedem Production Deployment
  - On-Demand via Webhook

Workflow:
  1. Sammle Reports aus quality-reports/
  2. Aggregiere Metriken:
     - Security Score (0-100)
     - Maintainability Score (0-100)
     - Performance Score (Lighthouse)
     - DSGVO Compliance Status
     - Test Coverage %
  3. Berechne Trends (vs. gestern/Woche/Monat)
  4. Generiere Executive Summary (Markdown)
  5. Erstelle Detail-Reports pro Service
  6. Speichere in quality-reports/daily/YYYY-MM-DD.md
```

### 2. Gate Failure Notifications
```yaml
Trigger: 
  - Webhook von GitHub Actions (quality-gates.yml)
  - Quality Gate Status: FAILED

Workflow:
  1. Parse Failure Details:
     - Welches Gate (Security/Quality/Performance)
     - Severity (CRITICAL/HIGH/MEDIUM)
     - Betroffener Service
     - Verantwortlicher (aus CODEOWNERS)
  2. Erstelle GitHub Issue:
     - Template: .github/ISSUE_TEMPLATE/quality-gate-failure.md
     - Labels: quality-gate, {severity}, {service}
     - Assignee: {responsible_team}
  3. Sende Slack Alert:
     - Channel: #quality-alerts
     - Mention: @channel wenn CRITICAL
     - Include: Failure Details + Fix-Anleitung
  4. Optional Email für CRITICAL Failures
```

### 3. Weekly Quality Trend Report
```yaml
Trigger: 
  - Montag 9:00 UTC
  - Manuell via Webhook

Workflow:
  1. Aggregiere letzte 7 Tage:
     - Security: Neue Vulnerabilities, Fixed Issues
     - Code Quality: Maintainability Trend, Duplication Trend
     - Performance: Lighthouse Score Trend
     - DSGVO: Compliance Status Changes
     - Tests: Coverage Trend, Flaky Tests
  2. Berechne Velocity:
     - Issues Created vs. Resolved
     - Average Fix Time
     - Recurring Problems
  3. Generiere Charts:
     - Quickchart.io für Trend-Visualisierung
     - Security Score Timeline
     - Performance Score Timeline
  4. Erstelle GitHub Issue:
     - Title: "📊 Weekly Quality Report - KW {week_number}"
     - Label: quality-report, weekly
     - Pinned für Sichtbarkeit
  5. Sende an Slack #quality-reports
```

### 4. Quality Dashboard Update
```yaml
Trigger: 
  - Alle 15 Minuten (während Arbeitszeit)
  - Nach jedem Deployment

Workflow:
  1. Lese aktuelle Metriken:
     - quality-reports/deployment-metrics/*.ndjson
     - build-report.json
     - playwright-results/report.json
  2. Update Dashboard JSON:
     - quality-reports/dashboard.json
  3. Optional: Push zu externer Visualisierung
     - Grafana/Tableau/Spreadsheet
```

### 5. DSGVO Compliance Report (Monatlich)
```yaml
Trigger: 
  - Erster Montag im Monat, 10:00 UTC

Workflow:
  1. Sammle DSGVO-relevante Daten:
     - PII Sanitization Logs
     - Consent Management Status (aus CRM)
     - Data Retention Compliance
     - Access Request Handling
  2. PostgreSQL MCP: Validiere Compliance:
     - Encrypted Fields
     - Retention Policies Applied
     - Audit Logs Complete
  3. Generiere Compliance Report:
     - Template: docs/templates/dsgvo-monthly-report.md
     - Include: Incidents, Fixes, Recommendations
  4. Erstelle GitHub Issue:
     - Label: dsgvo, compliance, monthly-report
     - Assignee: Data Protection Officer
  5. Export als PDF + Archive
```

## n8n Node-Struktur

### Nodes Required
1. **Cron Trigger** - Zeitgesteuerte Ausführung
2. **Webhook Trigger** - Empfange GitHub Actions Callbacks
3. **HTTP Request** - Abrufen von Quality Reports (GitHub API)
4. **Code (JavaScript)** - Daten-Aggregation und Berechnungen
5. **Read Binary Files** - Lese JSON/Markdown Reports
6. **GitHub** - Issue-Erstellung, PR-Kommentare
7. **Slack** - Notifications in Channels
8. **Email** - CRITICAL Failure Alerts
9. **Quickchart** - Generiere Trend-Charts
10. **Set** - Variablen für Wiederverwendung
11. **Switch** - Severity-basiertes Routing
12. **Merge** - Kombiniere Reports von verschiedenen Services

### JavaScript Code Examples

#### Aggregate Quality Metrics
```javascript
// Aggregiere alle Reports aus quality-reports/
const reports = items.map(item => JSON.parse(item.json.content));

const aggregated = {
  timestamp: new Date().toISOString(),
  security: {
    score: calculateSecurityScore(reports),
    vulnerabilities: {
      critical: reports.filter(r => r.severity === 'CRITICAL').length,
      high: reports.filter(r => r.severity === 'HIGH').length,
    }
  },
  quality: {
    maintainability: average(reports.map(r => r.maintainability)),
    duplication: average(reports.map(r => r.duplication)),
  },
  performance: {
    lighthouse: average(reports.map(r => r.lighthouse?.performance || 0)),
  },
  dsgvo: {
    compliant: reports.every(r => r.dsgvo_compliant)
  }
};

function calculateSecurityScore(reports) {
  const maxPossible = reports.length * 100;
  const deductions = reports.reduce((sum, r) => {
    return sum + (r.vulnerabilities?.critical || 0) * 20 
               + (r.vulnerabilities?.high || 0) * 10;
  }, 0);
  return Math.max(0, 100 - (deductions / maxPossible * 100));
}

return [{ json: aggregated }];
```

#### Calculate Trends
```javascript
// Vergleiche mit Historical Data
const today = items[0].json;
const yesterday = $('Read Historical').first().json;

const trends = {
  security: {
    score: today.security.score - yesterday.security.score,
    direction: today.security.score > yesterday.security.score ? '📈' : '📉'
  },
  quality: {
    maintainability: today.quality.maintainability - yesterday.quality.maintainability,
    direction: today.quality.maintainability > yesterday.quality.maintainability ? '📈' : '📉'
  }
};

return [{ json: { ...today, trends } }];
```

#### Generate Markdown Report
```javascript
const data = items[0].json;

const markdown = `# 📊 Daily Quality Report - ${data.timestamp.split('T')[0]}

## Executive Summary
- **Security Score:** ${data.security.score}/100 ${data.trends?.security?.direction || ''}
- **Maintainability:** ${data.quality.maintainability}% ${data.trends?.quality?.direction || ''}
- **Performance:** ${data.performance.lighthouse}/100
- **DSGVO:** ${data.dsgvo.compliant ? '✅ Compliant' : '❌ Non-Compliant'}

## Security
- Critical Vulnerabilities: ${data.security.vulnerabilities.critical}
- High Vulnerabilities: ${data.security.vulnerabilities.high}

## Code Quality
- Maintainability: ${data.quality.maintainability}%
- Duplication: ${data.quality.duplication}%

## Performance
- Lighthouse Performance: ${data.performance.lighthouse}/100

## Actions Required
${generateActionItems(data)}

---
*Generated by n8n Quality Automation*
`;

function generateActionItems(data) {
  const actions = [];
  if (data.security.vulnerabilities.critical > 0) {
    actions.push('🚨 **CRITICAL:** Fix critical security vulnerabilities immediately');
  }
  if (data.quality.maintainability < 85) {
    actions.push('⚠️ Improve code maintainability (target: ≥85%)');
  }
  if (!data.dsgvo.compliant) {
    actions.push('🔒 Address DSGVO compliance issues');
  }
  return actions.length > 0 ? actions.map(a => `- ${a}`).join('\n') : '✅ No critical actions required';
}

return [{ json: { markdown } }];
```

## Integration mit Quality Gates

### Webhook Setup (GitHub Actions)
```yaml
# .github/workflows/quality-gates.yml
jobs:
  notify-n8n:
    runs-on: ubuntu-latest
    if: failure()
    steps:
      - name: Notify n8n Quality Failure
        run: |
          curl -X POST ${{ secrets.N8N_WEBHOOK_QUALITY_FAILURE }} \
            -H "Content-Type: application/json" \
            -d '{
              "gate": "${{ github.job }}",
              "status": "FAILED",
              "severity": "HIGH",
              "service": "${{ matrix.service }}",
              "branch": "${{ github.ref }}",
              "commit": "${{ github.sha }}",
              "run_url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }'
```

### Slack Message Format
```javascript
// Formatiere Slack Message für bessere Lesbarkeit
const data = items[0].json;

const slackMessage = {
  channel: '#quality-alerts',
  text: `Quality Gate Failure: ${data.gate}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚨 Quality Gate Failed: ${data.gate}`
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Severity:*\n${getSeverityEmoji(data.severity)} ${data.severity}` },
        { type: 'mrkdwn', text: `*Service:*\n${data.service}` },
        { type: 'mrkdwn', text: `*Branch:*\n${data.branch}` },
        { type: 'mrkdwn', text: `*Commit:*\n\`${data.commit.substring(0, 7)}\`` }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View Run' },
          url: data.run_url,
          style: 'danger'
        }
      ]
    }
  ]
};

function getSeverityEmoji(severity) {
  const emojis = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🟢'
  };
  return emojis[severity] || '⚪';
}

return [{ json: slackMessage }];
```

## Environment Variables (.env)

```bash
# n8n Quality Reporting
N8N_WEBHOOK_QUALITY_FAILURE=https://n8n.example.com/webhook/quality-failure
N8N_WEBHOOK_QUALITY_DAILY=https://n8n.example.com/webhook/quality-daily

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_REPO=Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/xxxxxxxxxxxx
SLACK_CHANNEL_QUALITY=#quality-alerts

# Email (für CRITICAL Failures)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@menschlichkeit-oesterreich.at
SMTP_PASSWORD=xxxxxxxxxxxxx
QUALITY_ALERT_EMAIL=dev-team@menschlichkeit-oesterreich.at

# Dashboard
DASHBOARD_UPDATE_INTERVAL=15 # Minuten
```

## Testing der Workflows

### 1. Manual Test via Webhook
```bash
# Test Daily Report Generation
curl -X POST http://localhost:5678/webhook/quality-daily \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test Failure Notification
curl -X POST http://localhost:5678/webhook/quality-failure \
  -H "Content-Type: application/json" \
  -d '{
    "gate": "Security Scan",
    "status": "FAILED",
    "severity": "CRITICAL",
    "service": "API Backend",
    "branch": "refs/heads/main",
    "commit": "abc123",
    "run_url": "https://github.com/test/run/123"
  }'
```

### 2. Validate Output
```bash
# Prüfe generierte Reports
ls -lh quality-reports/daily/
cat quality-reports/daily/$(date +%Y-%m-%d).md

# Prüfe GitHub Issues
gh issue list --label quality-gate

# Prüfe Slack Messages (via Slack UI)
```

## Best Practices

1. **Fehlerbehandlung:**
   - Try-Catch in allen Code-Nodes
   - Fallback auf Basic Notifications bei Failures
   - Error-Logging in separatem File

2. **Performance:**
   - Batch-Processing von Reports (nicht einzeln)
   - Cache Historical Data lokal
   - Rate-Limiting für externe APIs

3. **Security:**
   - Credentials nur in n8n Credential Store
   - Webhook-Authentifizierung via Secret Token
   - Sensitive Data niemals in Slack/Email

4. **Monitoring:**
   - n8n Workflow Execution Logs aktivieren
   - Alert bei Workflow-Failures
   - Metrics über Workflow-Ausführungszeit

## Success Criteria

✅ Daily Quality Reports werden automatisch generiert
✅ Gate Failures triggern sofortige Notifications
✅ Trend-Analysen zeigen Quality-Entwicklung über Zeit
✅ DSGVO-Reports monatlich verfügbar
✅ Dashboard aktualisiert sich automatisch
✅ Team erhält relevante Alerts ohne Spam

## Nächste Schritte

1. **n8n Workflow importieren:** automation/n8n/workflows/quality-reporting.json
2. **Credentials konfigurieren:** GitHub, Slack, SMTP
3. **Webhooks testen:** Manual Test-Calls
4. **GitHub Actions integrieren:** Webhook-Calls hinzufügen
5. **Dashboard Setup:** quality-reports/dashboard.json erstellen
6. **Team Onboarding:** Slack-Channel einrichten, Email-Verteiler

---

**Workflow-Datei:** automation/n8n/workflows/06-quality-reporting.json
**Dokumentation:** docs/N8N-QUALITY-AUTOMATION.md
**Responsible:** DevOps Team

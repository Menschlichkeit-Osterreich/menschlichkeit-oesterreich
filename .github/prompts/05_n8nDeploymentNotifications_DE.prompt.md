---
title: "05 N8Ndeploymentnotifications"
description: "n8n Deployment-Benachrichtigungen"
lastUpdated: 2025-10-10
status: ACTIVE
category: automation
tags: ['automation', 'n8n']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'Automation Engineers']
---

---
description: 'n8n Deployment-Benachrichtigungen für CI/CD, Quality Gates und Rollback-Alerts'
  - 03_MCPMultiServiceDeployment_DE
---

# n8n Deployment-Benachrichtigungen

**Zweck:** Automatische Notifications für Build-Pipeline, Quality Gates und Deployment-Status

---

## 📋 Kontext

### Deployment-Infrastruktur (aus 03_MCPMultiServiceDeployment)

**Services:**
- 20+ Subdomains (Website, API, CRM, n8n, Grafana, etc.)
- CI/CD via GitHub Actions
- Quality Gates (Codacy, Trivy, Playwright)
- Deployment Targets: Plesk Staging + Production

**Critical Flows:**
1. Code Push → Build → Tests → Quality Gates → Deploy
2. Quality Failure → GitHub Issue → Slack Alert
3. Deployment Failure → Rollback → Admin Notification

---

## 🎯 Execution Phases

### Phase 1: GitHub Actions Integration

**GitHub Webhook Setup:**

```yaml

# .github/workflows/deploy-staging.yml

name: Deploy to Staging

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  notify-start:
    runs-on: ubuntu-latest
    steps:
      - name: Notify n8n - Build Started
        run: |
          curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-started \
            -H "Content-Type: application/json" \
            -d '{
              "service": "${{ github.repository }}",
              "branch": "${{ github.ref_name }}",
              "commit": "${{ github.sha }}",
              "actor": "${{ github.actor }}",
              "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }'

  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build:all
      - run: npm run test:e2e
      
  notify-result:
    needs: [build-and-test]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Notify n8n - Build Result
        run: |
          curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-result \
            -H "Content-Type: application/json" \
            -d '{
              "service": "${{ github.repository }}",
              "status": "${{ job.status }}",
              "branch": "${{ github.ref_name }}",
              "duration": "${{ github.event.workflow_run.updated_at - github.event.workflow_run.created_at }}"
            }'
```

**Checklist:**
- [ ] GitHub Actions Workflows aktualisiert
- [ ] n8n Webhook URLs korrekt
- [ ] Webhook Security Token konfiguriert

---

### Phase 2: Workflow 1 - Build Pipeline Notifications

**Workflow JSON:**

```json
{
  "name": "CI/CD Pipeline Notifications",
  "nodes": [
    {
      "parameters": {
        "path": "deployment-started",
        "httpMethod": "POST",
        "responseMode": "onReceived",
        "options": {}
      },
      "id": "webhook-start",
      "name": "Webhook - Build Started",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 200]
    },
    {
      "parameters": {
        "channel": "#deployments",
        "text": "🚀 Deployment gestartet",
        "attachments": [
          {
            "color": "#0066cc",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": true,
                  "title": "Branch",
                  "value": "={{ $json.branch }}"
                },
                {
                  "short": false,
                  "title": "Commit",
                  "value": "={{ $json.commit.substring(0, 7) }}"
                },
                {
                  "short": true,
                  "title": "Author",
                  "value": "={{ $json.actor }}"
                },
                {
                  "short": false,
                  "title": "Logs",
                  "value": "<{{ $json.url }}|View Workflow Run>"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-start",
      "name": "Slack - Build Started",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [450, 200],
      "credentials": {
        "slackApi": {
          "id": "slack-webhooks",
          "name": "Slack Webhooks"
        }
      }
    },
    {
      "parameters": {
        "path": "deployment-result",
        "httpMethod": "POST"
      },
      "id": "webhook-result",
      "name": "Webhook - Build Result",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 400]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.status }}",
              "operation": "equals",
              "value2": "success"
            }
          ]
        }
      },
      "id": "if-success",
      "name": "IF - Success or Failure",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 400]
    },
    {
      "parameters": {
        "channel": "#deployments",
        "text": "✅ Deployment erfolgreich!",
        "attachments": [
          {
            "color": "#36a64f",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": true,
                  "title": "Branch",
                  "value": "={{ $json.branch }}"
                },
                {
                  "short": true,
                  "title": "Duration",
                  "value": "={{ Math.floor($json.duration / 60) }} min"
                },
                {
                  "short": false,
                  "title": "Next Steps",
                  "value": "Deployment kann zu Production fortgesetzt werden."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-success",
      "name": "Slack - Success Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "🚨 Deployment FEHLGESCHLAGEN!",
        "attachments": [
          {
            "color": "#ff0000",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": true,
                  "title": "Branch",
                  "value": "={{ $json.branch }}"
                },
                {
                  "short": false,
                  "title": "Action Required",
                  "value": "Sofortige Prüfung erforderlich! @devops-team"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-failure",
      "name": "Slack - Failure Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 500]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "devops@menschlichkeit-oesterreich.at",
        "subject": "🚨 CRITICAL: Deployment Failure - {{ $json.service }}",
        "emailType": "html",
        "message": "=<html>\n<body style=\"font-family: Arial, sans-serif;\">\n  <h2 style=\"color: #ff0000;\">⚠️ Deployment Fehlgeschlagen</h2>\n  <table border=\"1\" cellpadding=\"10\" style=\"border-collapse: collapse;\">\n    <tr>\n      <td><strong>Service:</strong></td>\n      <td>{{ $json.service }}</td>\n    </tr>\n    <tr>\n      <td><strong>Branch:</strong></td>\n      <td>{{ $json.branch }}</td>\n    </tr>\n    <tr>\n      <td><strong>Status:</strong></td>\n      <td style=\"color: #ff0000;\">{{ $json.status }}</td>\n    </tr>\n    <tr>\n      <td><strong>Dauer:</strong></td>\n      <td>{{ Math.floor($json.duration / 60) }} Minuten</td>\n    </tr>\n  </table>\n  <h3>Sofortige Maßnahmen:</h3>\n  <ol>\n    <li>GitHub Actions Logs prüfen</li>\n    <li>Rollback initiieren falls Production betroffen</li>\n    <li>Incident in GitHub Issues dokumentieren</li>\n  </ol>\n  <p><a href=\"{{ $json.url }}\">Zu den Workflow Logs →</a></p>\n</body>\n</html>"
      },
      "id": "email-failure",
      "name": "Email - Critical Alert",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 500],
      "credentials": {
        "smtp": {
          "id": "smtp-admin",
          "name": "SMTP Admin"
        }
      }
    }
  ],
  "connections": {
    "Webhook - Build Started": {
      "main": [[{"node": "Slack - Build Started", "type": "main", "index": 0}]]
    },
    "Webhook - Build Result": {
      "main": [[{"node": "IF - Success or Failure", "type": "main", "index": 0}]]
    },
    "IF - Success or Failure": {
      "main": [
        [{"node": "Slack - Success Notification", "type": "main", "index": 0}],
        [
          {"node": "Slack - Failure Alert", "type": "main", "index": 0},
          {"node": "Email - Critical Alert", "type": "main", "index": 0}
        ]
      ]
    }
  }
}
```

**Testing:**
```bash

# Simulate Build Start
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-started \
  -H "Content-Type: application/json" \
  -d '{
    "service": "menschlichkeit-oesterreich/frontend",
    "branch": "main",
    "commit": "a1b2c3d",
    "actor": "max.mustermann",
    "url": "https://github.com/menschlichkeit-oesterreich/frontend/actions/runs/12345"
  }'

# Simulate Build Success
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-result \
  -H "Content-Type: application/json" \
  -d '{
    "service": "menschlichkeit-oesterreich/frontend",
    "status": "success",
    "branch": "main",
    "duration": 180
  }'

# Simulate Build Failure
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/deployment-result \
  -H "Content-Type: application/json" \
  -d '{
    "service": "menschlichkeit-oesterreich/frontend",
    "status": "failure",
    "branch": "main",
    "duration": 90
  }'
```

**Checklist:**
- [ ] Slack Channels #deployments und #emergencies existieren
- [ ] Email devops@menschlichkeit-oesterreich.at konfiguriert
- [ ] Test mit curl erfolgreich
- [ ] Notifications kommen innerhalb 30 Sekunden

---

### Phase 3: Workflow 2 - Quality Gate Failures

**Workflow JSON:**

```json
{
  "name": "Quality Gate Failure → GitHub Issue",
  "nodes": [
    {
      "parameters": {
        "path": "quality-gate-failure",
        "httpMethod": "POST"
      },
      "id": "webhook-quality",
      "name": "Webhook - Codacy/Trivy Alert",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.severity }}",
              "operation": "equals",
              "value2": "critical"
            }
          ]
        }
      },
      "id": "if-critical",
      "name": "IF - Critical Severity",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "owner": "menschlichkeit-oesterreich",
        "repository": "={{ $json.repository }}",
        "title": "🚨 CRITICAL: {{ $json.tool }} Quality Gate Failed",
        "body": "=## Quality Gate Failure\n\n**Tool:** {{ $json.tool }}\n**Severity:** {{ $json.severity }}\n**Branch:** {{ $json.branch }}\n\n### Issues Found:\n\n{{ $json.issues.map(i => `- **${i.type}**: ${i.message} (${i.file}:${i.line})`).join('\\n') }}\n\n### Action Required:\n\n- [ ] Fix all CRITICAL issues\n- [ ] Re-run quality gates\n- [ ] Update this issue with resolution\n\n**Detected:** {{ $now.format('YYYY-MM-DD HH:mm:ss') }}\n**Workflow:** {{ $json.workflow_url }}",
        "labels": [
          "quality-gate",
          "critical",
          "automated"
        ],
        "assignees": "={{ $json.author }}"
      },
      "id": "github-issue",
      "name": "GitHub - Create Issue",
      "type": "n8n-nodes-base.github",
      "typeVersion": 1,
      "position": [650, 200],
      "credentials": {
        "githubApi": {
          "id": "github-token",
          "name": "GitHub API"
        }
      }
    },
    {
      "parameters": {
        "channel": "#quality-alerts",
        "text": "⚠️ Quality Gate CRITICAL Failure",
        "attachments": [
          {
            "color": "#ff6600",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Tool",
                  "value": "={{ $json.tool }}"
                },
                {
                  "short": true,
                  "title": "Repository",
                  "value": "={{ $json.repository }}"
                },
                {
                  "short": false,
                  "title": "GitHub Issue",
                  "value": "<{{ $json.html_url }}|#{{ $json.number }} - View Issue>"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-quality",
      "name": "Slack - Quality Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "channel": "#quality-alerts",
        "text": "ℹ️ Quality Gate Warning (non-critical)",
        "attachments": [
          {
            "color": "#ffcc00",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Tool",
                  "value": "={{ $json.tool }}"
                },
                {
                  "short": true,
                  "title": "Severity",
                  "value": "{{ $json.severity }}"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-warning",
      "name": "Slack - Warning Only",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 400]
    }
  ],
  "connections": {
    "Webhook - Codacy/Trivy Alert": {
      "main": [[{"node": "IF - Critical Severity", "type": "main", "index": 0}]]
    },
    "IF - Critical Severity": {
      "main": [
        [{"node": "GitHub - Create Issue", "type": "main", "index": 0}],
        [{"node": "Slack - Warning Only", "type": "main", "index": 0}]
      ]
    },
    "GitHub - Create Issue": {
      "main": [[{"node": "Slack - Quality Alert", "type": "main", "index": 0}]]
    }
  }
}
```

**Codacy Integration:**
```yaml

# .github/workflows/quality-gates.yml

name: Quality Gates

on: [push, pull_request]

jobs:
  codacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Codacy Analysis
        run: |
          RESULT=$(npx codacy-analysis-cli analyze --project-token ${{ secrets.CODACY_PROJECT_TOKEN }})
          
          if echo "$RESULT" | grep -q "CRITICAL"; then
            curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/quality-gate-failure \
              -H "Content-Type: application/json" \
              -d "{
                \"tool\": \"Codacy\",
                \"severity\": \"critical\",
                \"repository\": \"${{ github.repository }}\",
                \"branch\": \"${{ github.ref_name }}\",
                \"author\": \"${{ github.actor }}\",
                \"workflow_url\": \"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\",
                \"issues\": $(echo "$RESULT" | jq -c '.issues')
              }"
          fi
```

**Checklist:**
- [ ] GitHub API Token mit `repo` und `issues` Permissions
- [ ] Codacy Webhook konfiguriert
- [ ] Slack Channel #quality-alerts erstellt
- [ ] Test mit Mock-Payload erfolgreich

---

### Phase 4: Workflow 3 - Rollback Trigger

**Workflow JSON:**

```json
{
  "name": "Emergency Rollback Trigger",
  "nodes": [
    {
      "parameters": {
        "path": "emergency-rollback",
        "httpMethod": "POST",
        "options": {
          "rawBody": true
        }
      },
      "id": "webhook-emergency",
      "name": "Webhook - Critical Error",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "🚨🚨🚨 PRODUCTION EMERGENCY - ROLLBACK INITIIERT",
        "attachments": [
          {
            "color": "#ff0000",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "⚠️ CRITICAL ALERT",
                  "value": "@channel SOFORTIGE AKTION ERFORDERLICH"
                },
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": true,
                  "title": "Error",
                  "value": "={{ $json.error }}"
                },
                {
                  "short": false,
                  "title": "Rollback Status",
                  "value": "Automatischer Rollback wird ausgeführt..."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-emergency",
      "name": "Slack - EMERGENCY Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [450, 200]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "devops@menschlichkeit-oesterreich.at,cto@menschlichkeit-oesterreich.at",
        "subject": "🚨🚨🚨 PRODUCTION EMERGENCY - {{ $json.service }}",
        "emailType": "html",
        "message": "=<html>\n<body style=\"background: #ff0000; color: white; padding: 20px; font-family: Arial;\">\n  <h1>🚨 PRODUCTION EMERGENCY 🚨</h1>\n  <h2>Service: {{ $json.service }}</h2>\n  <p><strong>Error:</strong> {{ $json.error }}</p>\n  <p><strong>Timestamp:</strong> {{ $now.format('YYYY-MM-DD HH:mm:ss') }}</p>\n  <hr>\n  <h3>IMMEDIATE ACTIONS:</h3>\n  <ol>\n    <li>Automatischer Rollback wird ausgeführt</li>\n    <li>Prüfen Sie Slack #emergencies für Updates</li>\n    <li>Bereiten Sie Post-Mortem vor</li>\n  </ol>\n</body>\n</html>",
        "options": {
          "priority": "high"
        }
      },
      "id": "email-emergency",
      "name": "Email - DevOps + CTO",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [450, 400]
    },
    {
      "parameters": {
        "command": "cd /deployment-scripts && ./rollback-plesk.sh {{ $json.service }} --emergency"
      },
      "id": "exec-rollback",
      "name": "Execute - Rollback Script",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.code }}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      },
      "id": "if-rollback-success",
      "name": "IF - Rollback Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "✅ Rollback erfolgreich abgeschlossen",
        "attachments": [
          {
            "color": "#36a64f",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "Status",
                  "value": "Service {{ $json.service }} wurde erfolgreich auf vorherige Version zurückgesetzt."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-success-rollback",
      "name": "Slack - Rollback Success",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "❌ ROLLBACK FEHLGESCHLAGEN - MANUELLE INTERVENTION ERFORDERLICH",
        "attachments": [
          {
            "color": "#990000",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "⚠️ CRITICAL",
                  "value": "@channel SOFORTIGE MANUELLE AKTION ERFORDERLICH"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-failure-rollback",
      "name": "Slack - Rollback FAILED",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 400]
    }
  ],
  "connections": {
    "Webhook - Critical Error": {
      "main": [
        [
          {"node": "Slack - EMERGENCY Alert", "type": "main", "index": 0},
          {"node": "Email - DevOps + CTO", "type": "main", "index": 0}
        ]
      ]
    },
    "Slack - EMERGENCY Alert": {
      "main": [[{"node": "Execute - Rollback Script", "type": "main", "index": 0}]]
    },
    "Execute - Rollback Script": {
      "main": [[{"node": "IF - Rollback Success", "type": "main", "index": 0}]]
    },
    "IF - Rollback Success": {
      "main": [
        [{"node": "Slack - Rollback Success", "type": "main", "index": 0}],
        [{"node": "Slack - Rollback FAILED", "type": "main", "index": 0}]
      ]
    }
  }
}
```

**Rollback Script Integration:**
```bash

# deployment-scripts/rollback-plesk.sh

#!/bin/bash
set -euo pipefail

SERVICE=$1
MODE=${2:-normal}

if [[ "$MODE" == "--emergency" ]]; then
  echo "🚨 EMERGENCY ROLLBACK für $SERVICE"
  
  # Sofortiger Rollback ohne Bestätigung
  ./scripts/plesk-sync.sh rollback "$SERVICE" --force
  
  # Health Check
  if curl -f "https://$SERVICE.menschlichkeit-oesterreich.at/health"; then
    echo "✅ Rollback erfolgreich"
    exit 0
  else
    echo "❌ Rollback fehlgeschlagen"
    exit 1
  fi
fi
```

**Trigger aus Monitoring (Grafana):**
```javascript
// Grafana Alert Webhook (zu n8n)
{
  "service": "api",
  "error": "5xx Error Rate > 50%",
  "timestamp": "2025-10-07T12:34:56Z"
}
```

**Checklist:**
- [ ] Rollback-Script getestet (dry-run)
- [ ] Emergency-Workflow Manual Test durchgeführt
- [ ] Grafana Webhook konfiguriert
- [ ] Email Priorität "High" funktioniert
- [ ] Slack @channel Mentions aktiviert

---

## ✅ Final Checklist

### Workflow Setup
- [ ] CI/CD Notifications aktiv (Build Start + Result)
- [ ] Quality Gate Failures → GitHub Issues
- [ ] Emergency Rollback getestet (dry-run)

### Integrations
- [ ] GitHub Actions Webhooks konfiguriert
- [ ] Codacy Webhook funktioniert
- [ ] Grafana Alert Webhook verbunden
- [ ] Slack Channels: #deployments, #emergencies, #quality-alerts

### Testing
- [ ] Build Success Notification erhalten
- [ ] Build Failure Alert mit Email
- [ ] Quality Gate Issue automatisch erstellt
- [ ] Rollback Script ausführbar (dry-run)

### Security
- [ ] Webhook Endpoints mit Token geschützt
- [ ] GitHub API Token minimal permissions
- [ ] Emergency Contacts aktuell

---

**Prompt erstellt:** 2025-10-07  
**Kategorie:** Automation - Deployment  
**Execution Order:** 5  
**MCP Tools:** GitHub (Issues), Filesystem (Scripts)

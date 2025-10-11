---
title: "07 N8Nmonitoringalerts"
description: "n8n Monitoring & Alert-Integration"
lastUpdated: 2025-10-10
status: ACTIVE
category: monitoring
tags: ['monitoring', 'n8n']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'SRE']
---

---
description: 'n8n Monitoring-Integration für Grafana, Service Health und SSL-Zertifikate'
  - 03_MCPMultiServiceDeployment_DE
---

# n8n Monitoring & Alert-Integration

**Zweck:** Zentrale Alert-Routing von Grafana, HTTP Health Checks und SSL-Monitoring

---

## 📋 Kontext

### Monitoring-Infrastruktur

**Grafana Instance:**
- URL: grafana.menschlichkeit-oesterreich.at
- Alert Manager integriert
- Multi-Channel Notifications (Email, Slack, n8n Webhooks)

**Services zu überwachen (20+):**
- menschlichkeit-oesterreich.at (Main Website)
- api.menschlichkeit-oesterreich.at (FastAPI Backend)
- crm.menschlichkeit-oesterreich.at (Drupal + CiviCRM)
- n8n.menschlichkeit-oesterreich.at (n8n Workflows)
- grafana.menschlichkeit-oesterreich.at (Monitoring)
- + 15 weitere Subdomains

**SSL Certificates:**
- Wildcard: *.menschlichkeit-oesterreich.at
- Let's Encrypt Auto-Renewal (alle 90 Tage)
- Manual Certificates für spezielle Subdomains

---

## 🎯 Execution Phases

### Phase 1: Grafana Webhook Integration

**Grafana Contact Point Setup:**

```markdown
**In Grafana UI:**

Alerting → Contact points → New contact point

Name: n8n Webhook Router
Type: webhook

URL: https://n8n.menschlichkeit-oesterreich.at/webhook/grafana-alert
Method: POST
Authentication: Basic Auth
  Username: n8n-grafana
  Password: [aus secrets/]

HTTP Headers:
  Content-Type: application/json
  X-Grafana-Token: [aus secrets/grafana-webhook-token.enc]

Message Template (JSON):
{
  "alert_name": "{{ .CommonLabels.alertname }}",
  "severity": "{{ .CommonLabels.severity }}",
  "service": "{{ .CommonLabels.service }}",
  "message": "{{ .CommonAnnotations.summary }}",
  "details": "{{ .CommonAnnotations.description }}",
  "firing_alerts": {{ len .Alerts.Firing }},
  "resolved_alerts": {{ len .Alerts.Resolved }},
  "dashboard_url": "{{ .ExternalURL }}",
  "timestamp": "{{ .CommonLabels.timestamp }}"
}
```

**n8n Credential Setup:**
```markdown
n8n → Credentials → Add Credential → HTTP Header Auth

Name: Grafana Webhook Auth
Header Name: X-Grafana-Token
Header Value: [aus secrets/grafana-webhook-token.enc]
```

**Checklist:**
- [ ] Grafana Contact Point "n8n Webhook Router" erstellt
- [ ] Webhook URL korrekt (https://n8n.menschlichkeit-oesterreich.at/webhook/grafana-alert)
- [ ] Authentication konfiguriert (Basic Auth + Header Token)
- [ ] Test Alert aus Grafana versendet

---

### Phase 2: Workflow 1 - Grafana Alert Router

**Workflow JSON:**

```json
{
  "name": "Grafana Alert Multi-Channel Router",
  "nodes": [
    {
      "parameters": {
        "path": "grafana-alert",
        "httpMethod": "POST",
        "authentication": "headerAuth",
        "options": {}
      },
      "id": "webhook-grafana",
      "name": "Webhook - Grafana Alert",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "grafana-webhook-auth",
          "name": "Grafana Webhook Auth"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.severity }}",
              "value2": "critical"
            }
          ]
        }
      },
      "id": "switch-severity",
      "name": "Switch - Alert Severity",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [450, 300],
      "parameters": {
        "options": {
          "fallbackOutput": 3
        },
        "conditions": {
          "options": {
            "caseSensitive": false,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "critical",
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
            {
              "id": "warning",
              "conditions": {
                "string": [
                  {
                    "value1": "={{ $json.severity }}",
                    "operation": "equals",
                    "value2": "warning"
                  }
                ]
              }
            },
            {
              "id": "info",
              "conditions": {
                "string": [
                  {
                    "value1": "={{ $json.severity }}",
                    "operation": "equals",
                    "value2": "info"
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      "parameters": {
        "channel": "#emergencies",
        "text": "🚨🚨🚨 CRITICAL ALERT",
        "attachments": [
          {
            "color": "#ff0000",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "⚠️ IMMEDIATE ACTION REQUIRED",
                  "value": "@channel {{ $json.alert_name }}"
                },
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": true,
                  "title": "Severity",
                  "value": "🔴 CRITICAL"
                },
                {
                  "short": false,
                  "title": "Message",
                  "value": "={{ $json.message }}"
                },
                {
                  "short": false,
                  "title": "Details",
                  "value": "={{ $json.details }}"
                },
                {
                  "short": false,
                  "title": "Dashboard",
                  "value": "<{{ $json.dashboard_url }}|View in Grafana →>"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-critical",
      "name": "Slack - CRITICAL Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 100]
    },
    {
      "parameters": {
        "fromEmail": "alerts@menschlichkeit-oesterreich.at",
        "toEmail": "on-call@menschlichkeit-oesterreich.at,devops@menschlichkeit-oesterreich.at",
        "subject": "🚨 CRITICAL: {{ $json.alert_name }} - {{ $json.service }}",
        "emailType": "html",
        "message": "=<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; }\n    .critical-header { background: #ff0000; color: white; padding: 20px; text-align: center; }\n    .alert-box { border: 3px solid #ff0000; padding: 15px; margin: 20px 0; }\n    table { border-collapse: collapse; width: 100%; }\n    td { padding: 10px; border: 1px solid #ddd; }\n    .label { font-weight: bold; background: #f4f4f4; }\n  </style>\n</head>\n<body>\n  <div class=\"critical-header\">\n    <h1>🚨 CRITICAL ALERT 🚨</h1>\n    <h2>{{ $json.alert_name }}</h2>\n  </div>\n  \n  <div class=\"alert-box\">\n    <h3>Alert Details:</h3>\n    <table>\n      <tr>\n        <td class=\"label\">Service:</td>\n        <td>{{ $json.service }}</td>\n      </tr>\n      <tr>\n        <td class=\"label\">Severity:</td>\n        <td style=\"color: #ff0000; font-weight: bold;\">CRITICAL</td>\n      </tr>\n      <tr>\n        <td class=\"label\">Message:</td>\n        <td>{{ $json.message }}</td>\n      </tr>\n      <tr>\n        <td class=\"label\">Details:</td>\n        <td>{{ $json.details }}</td>\n      </tr>\n      <tr>\n        <td class=\"label\">Timestamp:</td>\n        <td>{{ $json.timestamp }}</td>\n      </tr>\n      <tr>\n        <td class=\"label\">Firing Alerts:</td>\n        <td>{{ $json.firing_alerts }}</td>\n      </tr>\n    </table>\n  </div>\n  \n  <h3>Immediate Actions:</h3>\n  <ol>\n    <li>Check Grafana Dashboard: <a href=\"{{ $json.dashboard_url }}\">View Alert →</a></li>\n    <li>Review service logs in Kibana</li>\n    <li>Initiate incident response if needed</li>\n    <li>Update Slack #emergencies with status</li>\n  </ol>\n</body>\n</html>",
        "options": {
          "priority": "high"
        }
      },
      "id": "email-critical",
      "name": "Email - On-Call Team",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 100]
    },
    {
      "parameters": {
        "channel": "#monitoring",
        "text": "⚠️ Warning Alert",
        "attachments": [
          {
            "color": "#ff9900",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Alert",
                  "value": "={{ $json.alert_name }}"
                },
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                },
                {
                  "short": false,
                  "title": "Message",
                  "value": "={{ $json.message }}"
                },
                {
                  "short": false,
                  "title": "Dashboard",
                  "value": "<{{ $json.dashboard_url }}|View in Grafana>"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-warning",
      "name": "Slack - WARNING",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "channel": "#monitoring",
        "text": "ℹ️ Info Alert",
        "attachments": [
          {
            "color": "#36a64f",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Alert",
                  "value": "={{ $json.alert_name }}"
                },
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $json.service }}"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-info",
      "name": "Slack - INFO",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 500]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.resolved_alerts }}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      },
      "id": "if-resolved",
      "name": "IF - Alert Resolved",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "channel": "#monitoring",
        "text": "✅ Alert Resolved",
        "attachments": [
          {
            "color": "#00cc00",
            "fields": {
              "item": [
                {
                  "short": false,
                  "title": "Resolution",
                  "value": "{{ $json.alert_name }} wurde behoben."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-resolved",
      "name": "Slack - RESOLVED",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook - Grafana Alert": {
      "main": [[{"node": "Switch - Alert Severity", "type": "main", "index": 0}]]
    },
    "Switch - Alert Severity": {
      "main": [
        [{"node": "Slack - CRITICAL Alert", "type": "main", "index": 0}],
        [{"node": "Slack - WARNING", "type": "main", "index": 0}],
        [{"node": "Slack - INFO", "type": "main", "index": 0}]
      ]
    },
    "Slack - CRITICAL Alert": {
      "main": [[{"node": "Email - On-Call Team", "type": "main", "index": 0}]]
    },
    "Slack - WARNING": {
      "main": [[{"node": "IF - Alert Resolved", "type": "main", "index": 0}]]
    },
    "IF - Alert Resolved": {
      "main": [
        [{"node": "Slack - RESOLVED", "type": "main", "index": 0}]
      ]
    }
  }
}
```

**Testing:**
```bash

# Simulate Grafana CRITICAL Alert
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/grafana-alert \
  -H "Content-Type: application/json" \
  -H "X-Grafana-Token: [TOKEN]" \
  -u "n8n-grafana:[PASSWORD]" \
  -d '{
    "alert_name": "High CPU Usage",
    "severity": "critical",
    "service": "api.menschlichkeit-oesterreich.at",
    "message": "CPU usage > 90% for 5 minutes",
    "details": "Current usage: 95%, Threshold: 90%",
    "firing_alerts": 1,
    "resolved_alerts": 0,
    "dashboard_url": "https://grafana.menschlichkeit-oesterreich.at/d/xyz",
    "timestamp": "2025-10-07T12:34:56Z"
  }'
```

**Checklist:**
- [ ] Workflow importiert und aktiviert
- [ ] Grafana Webhook sendet erfolgreich an n8n
- [ ] CRITICAL Alerts gehen zu #emergencies + Email
- [ ] WARNING Alerts gehen zu #monitoring
- [ ] Resolved Alerts werden gepostet

---

### Phase 3: Workflow 2 - HTTP Service Health Checks

**Workflow JSON:**

```json
{
  "name": "HTTP Service Health Monitor (All 20+ Subdomains)",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "*/5 * * * *"
            }
          ]
        }
      },
      "id": "cron-5min",
      "name": "Schedule - Every 5min",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// List all services to monitor\nconst services = [\n  'menschlichkeit-oesterreich.at',\n  'www.menschlichkeit-oesterreich.at',\n  'api.menschlichkeit-oesterreich.at',\n  'crm.menschlichkeit-oesterreich.at',\n  'n8n.menschlichkeit-oesterreich.at',\n  'grafana.menschlichkeit-oesterreich.at',\n  'forum.menschlichkeit-oesterreich.at',\n  'events.menschlichkeit-oesterreich.at',\n  'spenden.menschlichkeit-oesterreich.at',\n  'volunteer.menschlichkeit-oesterreich.at',\n  // Add all 20+ subdomains\n];\n\nreturn services.map(service => ({\n  json: {\n    url: `https://${service}/health`,\n    service: service\n  }\n}));"
      },
      "id": "code-services",
      "name": "Code - Generate Service List",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "={{ $json.url }}",
        "method": "GET",
        "timeout": 5000,
        "options": {
          "redirect": {
            "redirect": {
              "followRedirects": true,
              "maxRedirects": 3
            }
          }
        }
      },
      "id": "http-health-check",
      "name": "HTTP Request - Health Endpoint",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [650, 300],
      "continueOnFail": true
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.statusCode }}",
              "operation": "notEqual",
              "value2": 200
            }
          ]
        }
      },
      "id": "if-unhealthy",
      "name": "IF - Service Down or Unhealthy",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "channel": "#monitoring",
        "text": "🔴 Service Health Check FAILED",
        "attachments": [
          {
            "color": "#ff0000",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Service",
                  "value": "={{ $input.item.json.service }}"
                },
                {
                  "short": true,
                  "title": "Status Code",
                  "value": "={{ $json.statusCode || 'TIMEOUT' }}"
                },
                {
                  "short": false,
                  "title": "URL",
                  "value": "={{ $input.item.json.url }}"
                },
                {
                  "short": false,
                  "title": "Error",
                  "value": "={{ $json.error || 'Service nicht erreichbar' }}"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-down",
      "name": "Slack - Service Down Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "fromEmail": "alerts@menschlichkeit-oesterreich.at",
        "toEmail": "devops@menschlichkeit-oesterreich.at",
        "subject": "🔴 Service Down: {{ $input.item.json.service }}",
        "emailType": "html",
        "message": "=<html>\n<body>\n  <h2 style=\"color: #ff0000;\">Service Health Check Failed</h2>\n  <table border=\"1\" cellpadding=\"10\">\n    <tr><td><strong>Service:</strong></td><td>{{ $input.item.json.service }}</td></tr>\n    <tr><td><strong>URL:</strong></td><td>{{ $input.item.json.url }}</td></tr>\n    <tr><td><strong>Status:</strong></td><td>{{ $json.statusCode || 'TIMEOUT' }}</td></tr>\n    <tr><td><strong>Timestamp:</strong></td><td>{{ $now.format('YYYY-MM-DD HH:mm:ss') }}</td></tr>\n  </table>\n  <h3>Immediate Actions:</h3>\n  <ol>\n    <li>Check service logs</li>\n    <li>Verify server status</li>\n    <li>Check DNS resolution</li>\n    <li>Review recent deployments</li>\n  </ol>\n</body>\n</html>"
      },
      "id": "email-down",
      "name": "Email - DevOps Alert",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1050, 400]
    }
  ],
  "connections": {
    "Schedule - Every 5min": {
      "main": [[{"node": "Code - Generate Service List", "type": "main", "index": 0}]]
    },
    "Code - Generate Service List": {
      "main": [[{"node": "HTTP Request - Health Endpoint", "type": "main", "index": 0}]]
    },
    "HTTP Request - Health Endpoint": {
      "main": [[{"node": "IF - Service Down or Unhealthy", "type": "main", "index": 0}]]
    },
    "IF - Service Down or Unhealthy": {
      "main": [
        [
          {"node": "Slack - Service Down Alert", "type": "main", "index": 0},
          {"node": "Email - DevOps Alert", "type": "main", "index": 0}
        ]
      ]
    }
  }
}
```

**Health Endpoint Standard:**
```json
// Expected Response from /health endpoints
{
  "status": "healthy",
  "service": "api.menschlichkeit-oesterreich.at",
  "timestamp": "2025-10-07T12:34:56Z",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "external_apis": "ok"
  }
}
```

**Checklist:**
- [ ] Alle Services haben /health Endpoint
- [ ] Health Checks laufen alle 5min
- [ ] Downtime Alerts funktionieren
- [ ] False Positives minimiert (Timeouts korrekt)

---

### Phase 4: Workflow 3 - SSL Certificate Expiry Monitor

**Workflow JSON:**

```json
{
  "name": "SSL Certificate Expiry Monitor",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 0 * * *"
            }
          ]
        }
      },
      "id": "cron-daily",
      "name": "Schedule - Daily 00:00",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "command": "echo | openssl s_client -servername menschlichkeit-oesterreich.at -connect menschlichkeit-oesterreich.at:443 2>/dev/null | openssl x509 -noout -dates"
      },
      "id": "exec-ssl-check",
      "name": "Execute - Check SSL Cert",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse SSL certificate dates\nconst output = $input.item.json.stdout;\nconst notAfterMatch = output.match(/notAfter=(.+)/);\n\nif (!notAfterMatch) {\n  throw new Error('Could not parse SSL certificate expiry date');\n}\n\nconst expiryDate = new Date(notAfterMatch[1]);\nconst today = new Date();\nconst daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));\n\nreturn [{\n  json: {\n    domain: 'menschlichkeit-oesterreich.at',\n    expiry_date: expiryDate.toISOString(),\n    days_until_expiry: daysUntilExpiry,\n    status: daysUntilExpiry > 30 ? 'ok' : (daysUntilExpiry > 7 ? 'warning' : 'critical')\n  }\n}];"
      },
      "id": "code-parse-ssl",
      "name": "Code - Parse SSL Expiry",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.days_until_expiry }}",
              "operation": "smaller",
              "value2": 30
            }
          ]
        }
      },
      "id": "if-expiring-soon",
      "name": "IF - Expires in < 30 Days",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "channel": "#monitoring",
        "text": "⚠️ SSL Certificate Expiring Soon",
        "attachments": [
          {
            "color": "={{ $json.status === 'critical' ? '#ff0000' : '#ff9900' }}",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Domain",
                  "value": "={{ $json.domain }}"
                },
                {
                  "short": true,
                  "title": "Days Until Expiry",
                  "value": "={{ $json.days_until_expiry }}"
                },
                {
                  "short": false,
                  "title": "Expiry Date",
                  "value": "={{ $json.expiry_date }}"
                },
                {
                  "short": false,
                  "title": "Action",
                  "value": "Erneuern Sie das SSL-Zertifikat über Kasserver/Let's Encrypt."
                }
              ]
            }
          }
        ]
      },
      "id": "slack-ssl-expiry",
      "name": "Slack - SSL Expiry Warning",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "admin@menschlichkeit-oesterreich.at",
        "subject": "⚠️ SSL Certificate Expires in {{ $json.days_until_expiry }} days",
        "emailType": "html",
        "message": "=<html>\n<body>\n  <h2>SSL Certificate Expiry Warning</h2>\n  <table border=\"1\" cellpadding=\"10\">\n    <tr><td><strong>Domain:</strong></td><td>{{ $json.domain }}</td></tr>\n    <tr><td><strong>Expiry Date:</strong></td><td>{{ $json.expiry_date }}</td></tr>\n    <tr><td><strong>Days Remaining:</strong></td><td style=\"color: {{ $json.status === 'critical' ? 'red' : 'orange' }};\">{{ $json.days_until_expiry }}</td></tr>\n  </table>\n  <h3>Renewal Steps:</h3>\n  <ol>\n    <li>Login zu Kasserver KAS (https://www.kasserver.com/)</li>\n    <li>SSL/TLS → Zertifikate verwalten</li>\n    <li>Let's Encrypt Auto-Renewal prüfen (sollte automatisch sein)</li>\n    <li>Falls manuell: Neues Zertifikat beantragen</li>\n  </ol>\n</body>\n</html>"
      },
      "id": "email-ssl-expiry",
      "name": "Email - Admin Alert",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1050, 400]
    }
  ],
  "connections": {
    "Schedule - Daily 00:00": {
      "main": [[{"node": "Execute - Check SSL Cert", "type": "main", "index": 0}]]
    },
    "Execute - Check SSL Cert": {
      "main": [[{"node": "Code - Parse SSL Expiry", "type": "main", "index": 0}]]
    },
    "Code - Parse SSL Expiry": {
      "main": [[{"node": "IF - Expires in < 30 Days", "type": "main", "index": 0}]]
    },
    "IF - Expires in < 30 Days": {
      "main": [
        [
          {"node": "Slack - SSL Expiry Warning", "type": "main", "index": 0},
          {"node": "Email - Admin Alert", "type": "main", "index": 0}
        ]
      ]
    }
  }
}
```

**SSL Check Thresholds:**
```markdown
Days Until Expiry | Severity | Action
------------------|----------|--------
> 30 days         | OK       | Log only
14-30 days        | WARNING  | Slack notification
7-14 days         | WARNING  | Slack + Email
< 7 days          | CRITICAL | Slack + Email + @channel mention
```

**Checklist:**
- [ ] openssl verfügbar in n8n Container
- [ ] SSL Check täglich um 00:00
- [ ] Wildcard-Cert und einzelne Certs geprüft
- [ ] Renewal Alerts 30/14/7 Tage vorher

---

## ✅ Final Checklist

### Grafana Integration
- [ ] Webhook Contact Point konfiguriert
- [ ] Alert Router Workflow aktiv
- [ ] CRITICAL → #emergencies + Email
- [ ] WARNING → #monitoring
- [ ] Resolved Alerts gepostet

### Service Health Checks
- [ ] HTTP Health Checks alle 5min
- [ ] Alle 20+ Subdomains überwacht
- [ ] /health Endpoints implementiert
- [ ] Downtime Alerts funktionieren

### SSL Monitoring
- [ ] SSL Expiry Check täglich
- [ ] 30/14/7 Tage Warnings
- [ ] Let's Encrypt Auto-Renewal überwacht
- [ ] Manual Renewal Playbook vorhanden

### Slack Channels
- [ ] #emergencies (CRITICAL Alerts)
- [ ] #monitoring (WARNING/INFO)
- [ ] #database-alerts (DB-spezifisch)
- [ ] @channel Mentions korrekt konfiguriert

---

**Prompt erstellt:** 2025-10-07  
**Kategorie:** Automation - Monitoring  
**Execution Order:** 7  
**MCP Tools:** Brave Search (SSL Best Practices), Filesystem (Health Check Scripts)

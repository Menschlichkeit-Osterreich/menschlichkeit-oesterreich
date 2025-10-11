---
title: "04 N8Nemailautomation"
description: "n8n Email-Automatisierung"
lastUpdated: 2025-10-10
status: ACTIVE
category: automation
tags: ['automation', 'n8n', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'Automation Engineers']
---

---
description: 'n8n Email-Automatisierung für CiviMail, Newsletter und DSGVO-konforme Kommunikation'
priority: critical
category: automation
execution_order: 4
requires:
  - 01_EmailDNSSetup_DE
  - 02_DatabaseRollout_DE
updates_todo: true
---

# n8n Email-Automatisierung

**Zweck:** Zentrale Email-Workflows für NGO-Kommunikation mit CiviCRM-Integration

---

## 📋 Kontext

### Email-Infrastruktur (aus 01_EmailDNSSetup)

**Mailboxes (8):**
- newsletter@menschlichkeit-oesterreich.at (Primär)
- info@menschlichkeit-oesterreich.at
- kontakt@menschlichkeit-oesterreich.at
- support@menschlichkeit-oesterreich.at
- spenden@menschlichkeit-oesterreich.at
- presse@menschlichkeit-oesterreich.at
- admin@menschlichkeit-oesterreich.at
- noreply@menschlichkeit-oesterreich.at

**DNS-Sicherheit:**
- SPF: `v=spf1 include:_spf.kasserver.com ~all`
- DKIM: `s20230710._domainkey.menschlichkeit-oesterreich.at`
- DMARC: `p=quarantine;rua=mailto:admin@menschlichkeit-oesterreich.at`
- TLS-RPT: `v=TLSRPTv1;rua=mailto:admin@menschlichkeit-oesterreich.at`

---

## 🎯 Execution Phases

### Phase 1: n8n Email Credentials Setup

**Via n8n UI (n8n.menschlichkeit-oesterreich.at):**

```markdown
Credentials → Add Credential → SMTP

Für jede Mailbox:

**newsletter@** (Primär):
- Host: dmpl20230054.kasserver.com
- Port: 465 (SSL) oder 587 (STARTTLS)
- User: newsletter@menschlichkeit-oesterreich.at
- Password: [aus secrets/email-credentials.enc]
- Secure: true
- Name: "SMTP Newsletter"

**spenden@** (Donation Confirmations):
- Host: dmpl20230054.kasserver.com
- Port: 465
- User: spenden@menschlichkeit-oesterreich.at
- Password: [aus secrets/]
- Name: "SMTP Spenden"

**noreply@** (Auto-Responder):
- Host: dmpl20230054.kasserver.com
- Port: 465
- User: noreply@menschlichkeit-oesterreich.at
- Password: [aus secrets/]
- Name: "SMTP NoReply"
```

**Checklist:**
- [ ] Alle 8 SMTP-Credentials in n8n erstellt
- [ ] Connection Test erfolgreich (Send Test Email)
- [ ] Credentials verschlüsselt gespeichert

---

### Phase 2: CiviCRM Integration

**CiviCRM API Credentials:**

```markdown
n8n → Credentials → Add Credential → HTTP Header Auth

**CiviCRM API:**
- Name: "CiviCRM API"
- Header Name: X-Civi-Auth
- Header Value: [API Key aus CRM]
- Base URL: https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4
```

**API Endpoints (CiviCRM v4):**
```bash

# Contact erstellen
POST /Contact
{
  "email": "user@example.com",
  "first_name": "Max",
  "last_name": "Mustermann"
}

# Donation erfassen
POST /Contribution
{
  "contact_id": 123,
  "total_amount": 50.00,
  "financial_type_id": 1
}

# Newsletter Subscription
POST /GroupContact
{
  "contact_id": 123,
  "group_id": 5,
  "status": "Added"
}
```

**Checklist:**
- [ ] CiviCRM API Key generiert (CRM Admin Panel)
- [ ] n8n HTTP Credentials konfiguriert
- [ ] Test API Call erfolgreich (GET /Contact)

---

### Phase 3: Workflow 1 - Newsletter Signup

**Workflow JSON:**

```json
{
  "name": "Newsletter Signup (DSGVO)",
  "nodes": [
    {
      "parameters": {
        "path": "newsletter-signup",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-signup",
      "name": "Webhook - Form Submit",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.consent_email }}",
              "operation": "equals",
              "value2": "true"
            },
            {
              "value1": "={{ $json.consent_newsletter }}",
              "operation": "equals",
              "value2": "true"
            }
          ]
        }
      },
      "id": "if-consent",
      "name": "DSGVO Consent Check",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/Contact",
        "method": "POST",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "civicrmApi",
        "jsonParameters": true,
        "bodyParametersJson": "={{ {\n  \"email\": $json.email,\n  \"first_name\": $json.first_name,\n  \"last_name\": $json.last_name,\n  \"source\": \"Newsletter Signup\",\n  \"preferred_language\": \"de_AT\"\n} }}"
      },
      "id": "http-civicrm",
      "name": "CiviCRM - Create Contact",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [650, 200],
      "credentials": {
        "civicrmApi": {
          "id": "civicrm-credentials",
          "name": "CiviCRM API"
        }
      }
    },
    {
      "parameters": {
        "url": "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/GroupContact",
        "method": "POST",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "civicrmApi",
        "jsonParameters": true,
        "bodyParametersJson": "={{ {\n  \"contact_id\": $json.id,\n  \"group_id\": 5,\n  \"status\": \"Added\"\n} }}"
      },
      "id": "http-subscribe",
      "name": "CiviCRM - Add to Newsletter Group",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "fromEmail": "newsletter@menschlichkeit-oesterreich.at",
        "toEmail": "={{ $json.email }}",
        "subject": "Willkommen bei Menschlichkeit Österreich! 🇦🇹",
        "emailType": "html",
        "message": "=<!DOCTYPE html>\n<html lang=\"de\">\n<head>\n  <meta charset=\"UTF-8\">\n  <style>\n    body { font-family: Arial, sans-serif; line-height: 1.6; }\n    .header { background: #E40521; color: white; padding: 20px; text-align: center; }\n    .content { padding: 20px; }\n    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }\n  </style>\n</head>\n<body>\n  <div class=\"header\">\n    <h1>Willkommen!</h1>\n  </div>\n  <div class=\"content\">\n    <p>Liebe/r {{ $json.first_name }},</p>\n    <p>Vielen Dank für Ihre Anmeldung zu unserem Newsletter!</p>\n    <p>Sie erhalten ab sofort regelmäßige Updates über unsere Projekte und Aktionen für mehr Menschlichkeit in Österreich.</p>\n    <p><strong>Ihre Vorteile:</strong></p>\n    <ul>\n      <li>Exklusive Projekteinblicke</li>\n      <li>Event-Einladungen</li>\n      <li>Aktuelle Spendenaktionen</li>\n    </ul>\n  </div>\n  <div class=\"footer\">\n    <p>Sie können sich jederzeit <a href=\"https://menschlichkeit-oesterreich.at/newsletter/unsubscribe?email={{ $json.email }}\">abmelden</a>.</p>\n    <p><strong>Datenschutz:</strong> Ihre Daten werden gemäß DSGVO verarbeitet. <a href=\"https://menschlichkeit-oesterreich.at/datenschutz\">Datenschutzerklärung</a></p>\n  </div>\n</body>\n</html>",
        "options": {}
      },
      "id": "email-welcome",
      "name": "Email - Welcome Message",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1050, 200],
      "credentials": {
        "smtp": {
          "id": "smtp-newsletter",
          "name": "SMTP Newsletter"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  \"status\": \"success\",\n  \"message\": \"Anmeldung erfolgreich! Bitte prüfen Sie Ihre Emails.\",\n  \"email\": $json.email\n} }}"
      },
      "id": "respond-success",
      "name": "Response - Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseCode": 400,
        "responseBody": "={{ {\n  \"status\": \"error\",\n  \"message\": \"Bitte stimmen Sie der Datenschutzerklärung und dem Newsletter-Empfang zu.\"\n} }}"
      },
      "id": "respond-error",
      "name": "Response - No Consent",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 400]
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
        "channel": "#errors",
        "text": "🚨 Newsletter Signup Error",
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
      "name": "Slack - Error Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 600],
      "credentials": {
        "slackApi": {
          "id": "slack-credentials",
          "name": "Slack Webhooks"
        }
      }
    }
  ],
  "connections": {
    "Webhook - Form Submit": {
      "main": [[{"node": "DSGVO Consent Check", "type": "main", "index": 0}]]
    },
    "DSGVO Consent Check": {
      "main": [
        [{"node": "CiviCRM - Create Contact", "type": "main", "index": 0}],
        [{"node": "Response - No Consent", "type": "main", "index": 0}]
      ]
    },
    "CiviCRM - Create Contact": {
      "main": [[{"node": "CiviCRM - Add to Newsletter Group", "type": "main", "index": 0}]]
    },
    "CiviCRM - Add to Newsletter Group": {
      "main": [[{"node": "Email - Welcome Message", "type": "main", "index": 0}]]
    },
    "Email - Welcome Message": {
      "main": [[{"node": "Response - Success", "type": "main", "index": 0}]]
    },
    "Error Handler": {
      "main": [[{"node": "Slack - Error Alert", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

**Testing:**
```bash
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/newsletter-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Max",
    "last_name": "Mustermann",
    "consent_email": "true",
    "consent_newsletter": "true"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Anmeldung erfolgreich! Bitte prüfen Sie Ihre Emails.",
  "email": "test@example.com"
}
```

**Checklist:**
- [ ] Workflow importiert in n8n
- [ ] CiviCRM Group ID korrekt (5 = Newsletter)
- [ ] Welcome Email Template angepasst (Corporate Design)
- [ ] Manual Execution erfolgreich
- [ ] Webhook aktiviert
- [ ] Unsubscribe-Link funktioniert

---

### Phase 4: Workflow 2 - Spenden-Bestätigung

**Workflow JSON:**

```json
{
  "name": "Spenden-Bestätigung (DSGVO + Quittung)",
  "nodes": [
    {
      "parameters": {
        "path": "donation-confirmation",
        "httpMethod": "POST"
      },
      "id": "webhook-donation",
      "name": "Webhook - CiviCRM Donation",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/Contact/{{ $json.contact_id }}",
        "method": "GET",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "civicrmApi"
      },
      "id": "http-contact",
      "name": "CiviCRM - Get Contact",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const PDFDocument = require('pdfkit');\nconst doc = new PDFDocument();\n\n// PDF Quittung generieren\ndoc.fontSize(20).text('Spendenquittung', 100, 100);\ndoc.fontSize(12).text(`Spender: ${$json.first_name} ${$json.last_name}`, 100, 150);\ndoc.text(`Betrag: ${$input.item.json.amount} EUR`, 100, 170);\ndoc.text(`Datum: ${new Date().toLocaleDateString('de-AT')}`, 100, 190);\ndoc.text('Vielen Dank für Ihre Unterstützung!', 100, 230);\n\nconst buffer = [];\ndoc.on('data', buffer.push.bind(buffer));\ndoc.on('end', () => {\n  const pdfData = Buffer.concat(buffer);\n  return [{ json: { pdf: pdfData.toString('base64') } }];\n});\ndoc.end();"
      },
      "id": "code-pdf",
      "name": "Code - Generate PDF Quittung",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "fromEmail": "spenden@menschlichkeit-oesterreich.at",
        "toEmail": "={{ $json.email }}",
        "subject": "Vielen Dank für Ihre Spende! 🙏",
        "emailType": "html",
        "message": "=<!DOCTYPE html>\n<html>\n<body>\n  <h2>Liebe/r {{ $json.first_name }},</h2>\n  <p>Herzlichen Dank für Ihre großzügige Spende von <strong>{{ $input.item.json.amount }} EUR</strong>!</p>\n  <p>Im Anhang finden Sie Ihre steuerlich absetzbare Spendenquittung.</p>\n  <p>Mit Ihrer Hilfe können wir weiterhin wichtige Projekte für mehr Menschlichkeit in Österreich umsetzen.</p>\n  <p>Mit herzlichen Grüßen,<br>Ihr Team von Menschlichkeit Österreich</p>\n</body>\n</html>",
        "attachments": "={{ $json.pdf }}",
        "options": {
          "attachmentsPropertyName": "pdf"
        }
      },
      "id": "email-donation",
      "name": "Email - Donation Thanks + Quittung",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 300],
      "credentials": {
        "smtp": {
          "id": "smtp-spenden",
          "name": "SMTP Spenden"
        }
      }
    },
    {
      "parameters": {
        "channel": "#spenden",
        "text": "💰 Neue Spende erhalten!",
        "attachments": [
          {
            "color": "#36a64f",
            "fields": {
              "item": [
                {
                  "short": true,
                  "title": "Spender",
                  "value": "={{ $json.first_name }} {{ $json.last_name }}"
                },
                {
                  "short": true,
                  "title": "Betrag",
                  "value": "={{ $input.item.json.amount }} EUR"
                }
              ]
            }
          }
        ]
      },
      "id": "slack-donation",
      "name": "Slack - Admin Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook - CiviCRM Donation": {
      "main": [[{"node": "CiviCRM - Get Contact", "type": "main", "index": 0}]]
    },
    "CiviCRM - Get Contact": {
      "main": [[{"node": "Code - Generate PDF Quittung", "type": "main", "index": 0}]]
    },
    "Code - Generate PDF Quittung": {
      "main": [[{"node": "Email - Donation Thanks + Quittung", "type": "main", "index": 0}]]
    },
    "Email - Donation Thanks + Quittung": {
      "main": [[{"node": "Slack - Admin Notification", "type": "main", "index": 0}]]
    }
  }
}
```

**CiviCRM Webhook Setup:**
```php
// In CiviCRM: Administer → System Settings → Scheduled Jobs
// Create new job: "n8n Donation Webhook"

function civicrm_api3_job_n8n_donation_webhook($params) {
  $contributions = civicrm_api3('Contribution', 'get', [
    'created_date' => ['>' => date('Y-m-d H:i:s', strtotime('-5 minutes'))],
  ]);
  
  foreach ($contributions['values'] as $contribution) {
    $ch = curl_init('https://n8n.menschlichkeit-oesterreich.at/webhook/donation-confirmation');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
      'contact_id' => $contribution['contact_id'],
      'amount' => $contribution['total_amount'],
      'date' => $contribution['receive_date'],
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_exec($ch);
  }
}
```

**Checklist:**
- [ ] PDF-Generierung funktioniert (pdfkit installiert in n8n)
- [ ] Quittung entspricht Steuerrecht (Österreich)
- [ ] CiviCRM Webhook konfiguriert (Scheduled Job)
- [ ] Slack Channel #spenden existiert
- [ ] Manual Test mit Test-Spende

---

### Phase 5: Workflow 3 - DKIM Rotation Alert

**Workflow JSON:**

```json
{
  "name": "DKIM Key Rotation Alert",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 0 1 * *"
            }
          ]
        }
      },
      "id": "cron-monthly",
      "name": "Schedule - Monthly (1st of month)",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "command": "openssl genrsa -out /tmp/dkim_private.pem 2048 && openssl rsa -in /tmp/dkim_private.pem -pubout -out /tmp/dkim_public.pem"
      },
      "id": "exec-dkim",
      "name": "Execute - Generate DKIM Keys",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "admin@menschlichkeit-oesterreich.at",
        "toEmail": "admin@menschlichkeit-oesterreich.at",
        "subject": "⚠️ DKIM Key Rotation erforderlich",
        "emailType": "html",
        "message": "=<h2>DKIM Key Rotation</h2>\n<p>Es ist Zeit für die monatliche DKIM Key Rotation.</p>\n<p><strong>Schritte:</strong></p>\n<ol>\n  <li>Neue Keys wurden generiert (siehe Anhang)</li>\n  <li>Public Key in Kasserver DNS eintragen</li>\n  <li>Private Key in Email-Server konfigurieren</li>\n  <li>Nach 24h alte Keys entfernen</li>\n</ol>\n<p><strong>DNS Record:</strong><br>\n<code>s{{ $now.format('YYYYMMDD') }}._domainkey.menschlichkeit-oesterreich.at TXT \"v=DKIM1; k=rsa; p=[PUBLIC_KEY]\"</code></p>",
        "attachments": "/tmp/dkim_public.pem,/tmp/dkim_private.pem"
      },
      "id": "email-dkim",
      "name": "Email - DKIM Rotation Alert",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Schedule - Monthly (1st of month)": {
      "main": [[{"node": "Execute - Generate DKIM Keys", "type": "main", "index": 0}]]
    },
    "Execute - Generate DKIM Keys": {
      "main": [[{"node": "Email - DKIM Rotation Alert", "type": "main", "index": 0}]]
    }
  }
}
```

**Checklist:**
- [ ] Cron-Schedule korrekt (1. des Monats, 00:00)
- [ ] openssl verfügbar in n8n Container
- [ ] Email an Admin geht raus
- [ ] Keys werden generiert

---

## ✅ Final Checklist

### n8n Setup
- [ ] n8n läuft auf n8n.menschlichkeit-oesterreich.at
- [ ] mo_n8n Database verbunden (MariaDB)
- [ ] n8n Login mit 2FA aktiviert
- [ ] Alle Credentials verschlüsselt gespeichert

### Email Workflows
- [ ] Newsletter Signup DSGVO-compliant
- [ ] Spenden-Bestätigung mit PDF-Quittung
- [ ] DKIM Rotation automatisiert
- [ ] Error Handling in allen Workflows

### CiviCRM Integration
- [ ] API Credentials konfiguriert
- [ ] Webhook Scheduled Job aktiv
- [ ] Newsletter Group ID korrekt
- [ ] Donation Tracking funktioniert

### Testing
- [ ] Manual Execution aller Workflows erfolgreich
- [ ] Webhook-Tests mit curl durchgeführt
- [ ] Emails kommen an (Inbox-Test)
- [ ] PDF-Quittungen korrekt generiert

---

**Prompt erstellt:** 2025-10-07  
**Kategorie:** Automation - Email  
**Execution Order:** 4  
**MCP Tools:** Filesystem (Workflow Export), GitHub (Version Control)

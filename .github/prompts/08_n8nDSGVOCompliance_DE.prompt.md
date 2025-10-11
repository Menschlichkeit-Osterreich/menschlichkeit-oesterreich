---
title: "08 N8Ndsgvocompliance"
description: "n8n DSGVO-Compliance Automatisierung"
lastUpdated: 2025-10-10
status: ACTIVE
category: compliance
tags: ['compliance', 'n8n', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['Compliance Officers', 'Legal Team']
---

---
description: 'n8n DSGVO-Compliance Workflows für Auskunft, Löschung, Consent & Audit'
  - 02_DatabaseRollout_DE
---

# n8n DSGVO-Compliance Automatisierung

**Zweck:** Vollautomatisierte Verarbeitung von Betroffenenrechten, Consent-Management und Datenschutz-Audits für Menschlichkeit Österreich.

---

## 📋 Kontext & Rahmenbedingungen

### Datenschutz-Verantwortlichkeiten
- **Datenschutzbeauftragte:** datenschutz@menschlichkeit-oesterreich.at (zuständig für Freigaben & Incident-Response)
- **Rechtsgrundlage:** DSGVO Art. 5, 6, 12-23 (Betroffenenrechte), Art. 30 (Verzeichnis), Art. 32 (Sicherheit)
- **Bearbeitungsfristen:**
  - Auskunftsersuchen (DSAR): **max. 30 Tage** (Art. 12 Abs. 3)
  - Löschersuchen: **unverzüglich**, spätestens 30 Tage
  - Consent-Änderungen: **sofortige Verarbeitung**

### Datenquellen (aus 02_DatabaseRollout)
| System | Datenbank | Zweck | Betroffene Daten |
|--------|-----------|-------|------------------|
| CiviCRM | `mo_civicrm` (PostgreSQL) | Mitglieds- & Spender:innenverwaltung | Name, Adresse, Email, Spendenhistorie |
| WordPress | `mo_wordpress_main` (MariaDB) | Webseiten-Konten & Formulare | Name, Email, Kommentare |
| Newsletter | `mo_mailings` (MariaDB) | Mailinglisten, Campaigns | Email, Subscription-Status |
| Analytics | `mo_analytics` (PostgreSQL) | Tracking (anonymisiert) | Pseudonymisierte IDs |
| Support Tickets | `mo_support` (MariaDB) | Support-Anfragen | Name, Email, Ticket-Inhalt |

### Sicherheitsanforderungen
- **Transport:** TLS 1.2+ (HTTPS, SFTP)
- **Speicherung:** AES-256-Encryption für Export-Pakete
- **Authentifizierung:**
  - Webhooks mit HMAC-Signatur (shared secret `DSGVO_WEBHOOK_SECRET`)
  - n8n Credentials verschlüsselt im Credential Store
- **Logging:** Lückenloses Audit-Log in `mo_n8n` (Tabelle `gdpr_audit_log`)

### Vorbereitungen
1. **PGP/AGE Schlüsselverwaltung:**
   - Service-Account `gdpr-export@menschlichkeit-oesterreich.at`
   - Öffentlicher Schlüssel im Secrets-Tresor (`secrets/gdpr/gdpr-export-pub.key`)
2. **SFTP Secure Storage:**
   - Host: `sftp-gdpr.menschlichkeit-oesterreich.at`
   - Pfad: `/exports/gdpr/<request_id>/`
   - Zugriff nur für DPO & Management
3. **Sonder-Mail-Konto:**
   - `datenschutz@menschlichkeit-oesterreich.at`
   - SMTP Credential in n8n: `SMTP Datenschutz`
4. **Webhook-Endpoint (public):**
   - `POST https://n8n.menschlichkeit-oesterreich.at/webhook/gdpr-request`
   - Erwartet HMAC-Signatur im Header `x-signature`
5. **Audit-Log Tabelle (mo_n8n):**
```sql
CREATE TABLE IF NOT EXISTS gdpr_audit_log (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL,
  workflow VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  actor VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 Execution Phasen

### Phase 1 – Credentials & Infrastruktur prüfen
- [ ] PostgreSQL Credentials: `mo_civicrm`, `mo_analytics`
- [ ] MariaDB Credentials: `mo_mailings`, `mo_support`, `mo_wordpress_main`
- [ ] SFTP Credential: `SFTP GDPR Storage`
- [ ] Email Credential: `SMTP Datenschutz`
- [ ] PGP/AGE Public Key im Dateisystem (`/secure-keys/gdpr-export.pub`)
- [ ] Encryption Function Node: nutzt `libsodium` (bereitgestellt in n8n Container)

### Phase 2 – Audit-Log aktivieren
```markdown
Workflow Template → Node "Log Audit Entry"
- Datenbank: mo_n8n
- Tabelle: gdpr_audit_log
- Pflichtfelder: request_id, workflow, action, actor, status, details
```

### Phase 3 – Workflows importieren & testen
- [ ] JSON-Templates (unten) in n8n importieren
- [ ] Dry-Run mit Testdaten durchführen
- [ ] Audit-Log prüfen
- [ ] DPO-Freigabe dokumentieren

---

## 🧩 Workflow 1 – Data Subject Access Request (DSAR)

**Zweck:** Automatisierte Bereitstellung aller personenbezogenen Daten für betroffene Personen mit Ende-zu-Ende Verschlüsselung.

### Trigger & Ablauf
| Schritt | Beschreibung | System |
|---------|--------------|--------|
| 1 | DSGVO-Webformular löst Webhook aus | Website → n8n |
| 2 | Validierung (HMAC, Pflichtfelder, Identitätsnachweis) | n8n |
| 3 | Aggregation aller relevanten Datensätze | PostgreSQL & MariaDB |
| 4 | Zusammenstellung als JSON + CSV + PDF Cover Letter | n8n (Function + PDF Node) |
| 5 | Verschlüsselung & Upload zu SFTP | n8n |
| 6 | Benachrichtigung & Link an Antragsteller:in | Email (`datenschutz@`) |
| 7 | Audit-Log & Ticket-Erstellung | PostgreSQL & GitHub Issue |

### Eingabefelder (Webhook JSON)
```json
{
  "request_id": "DSAR-2025-10-0012",
  "email": "betroffene.person@example.com",
  "first_name": "Anna",
  "last_name": "Musterfrau",
  "identity_proof_url": "https://secure-upload...",
  "submitted_at": "2025-10-07T09:41:00Z"
}
```

### Workflow-JSON (Template)
```json
{
  "name": "GDPR - Data Subject Access Request",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "gdpr-request",
        "options": {
          "responseCode": 202,
          "rawBody": true
        }
      },
      "name": "Trigger: DSAR Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 300]
    },
    {
      "parameters": {
        "functionCode": "const crypto = require('crypto');\nconst signature = $json[\"headers\"]['x-signature'];\nconst secret = $env.DSGVO_WEBHOOK_SECRET;\nconst payload = JSON.stringify($json.body);\nconst expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');\nif (signature !== expected) {\n  return [{ valid: false, error: 'INVALID_SIGNATURE' }];\n}\nconst body = $json.body;\nconst missing = ['request_id','email','first_name','last_name','identity_proof_url'].filter(key => !body[key]);\nif (missing.length) {\n  return [{ valid: false, error: 'MISSING_FIELDS', missing }];\n}\nreturn [{ valid: true, request: body }];"
      },
      "name": "Validate Request",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "options": {
          "rules": [
            {
              "conditions": { "boolean": [ { "value1": "={{$json.valid}}", "operation": "isFalse" } ] },
              "value": [ { "setValue": { "data": { "error": "={{$json.error}}", "request": "={{$json.request}}" } } } ]
            }
          ],
          "fallbackOutput": "main"
        }
      },
      "name": "IF Valid",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [700, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[$json.request.request_id, 'GDPR - DSAR', 'validation', 'n8n', $json.valid ? 'accepted' : 'rejected', JSON.stringify($json)]]}}"
      },
      "name": "Log Validation",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [900, 500],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "query": "SELECT c.id, c.first_name, c.last_name, c.email, a.city, a.postal_code, a.street_address, c.birth_date\nFROM civicrm_contact c\nLEFT JOIN civicrm_address a ON a.contact_id = c.id AND a.is_primary = 1\nWHERE c.email = {{ $json.request.email }}"
      },
      "name": "Fetch CiviCRM Data",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [900, 200],
      "credentials": {
        "postgres": "mo_civicrm"
      }
    },
    {
      "parameters": {
        "query": "SELECT * FROM wp_users WHERE user_email = {{ $json.request.email }}"
      },
      "name": "Fetch WordPress Data",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [1100, 200],
      "credentials": {
        "mySql": "mo_wordpress_main"
      }
    },
    {
      "parameters": {
        "functionCode": "const civcrm = $items('Fetch CiviCRM Data').map(item => item.json);\nconst wordpress = $items('Fetch WordPress Data').map(item => item.json);\nconst mailings = $items('Fetch Newsletter Data').map(item => item.json);\nconst support = $items('Fetch Support Tickets').map(item => item.json);\nreturn [{ request: $json.request, data: { civcrm, wordpress, mailings, support } }];"
      },
      "name": "Aggregate Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1300, 300]
    },
    {
      "parameters": {
        "functionCode": "const { request, data } = $json;\nconst summary = {\n  request,\n  stats: {\n    civcrmRecords: data.civcrm.length,\n    wordpressAccounts: data.wordpress.length,\n    mailingSubscriptions: data.mailings.length,\n    supportTickets: data.support.length\n  }\n};\nreturn [{ request, data, summary }];"
      },
      "name": "Build Summary",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1500, 300]
    },
    {
      "parameters": {
        "operation": "toFile",
        "options": {
          "fileName": "={{$json.request.request_id}}-data.json",
          "useJson": true
        }
      },
      "name": "Create JSON Export",
      "type": "n8n-nodes-base.binaryData",
      "typeVersion": 1,
      "position": [1700, 200]
    },
    {
      "parameters": {
        "functionCode": "const { spawnSync } = require('child_process');\nconst fs = require('fs');\nconst path = `/tmp/${$json.request.request_id}`;\nfs.mkdirSync(path, { recursive: true });\nfs.writeFileSync(`${path}/data.json`, Buffer.from(items[0].binary.data.data, 'base64'));\nconst result = spawnSync('age', ['-r', '/secure-keys/gdpr-export.pub', `${path}/data.json`], { encoding: 'utf8' });\nif (result.status !== 0) {\n  throw new Error(`Encryption failed: ${result.stderr}`);\n}\nreturn [{ encryptedPath: `${path}/data.json.age` }];"
      },
      "name": "Encrypt Export",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1900, 200]
    },
    {
      "parameters": {
        "protocol": "sftp",
        "path": "/exports/gdpr/{{ $json.request.request_id }}/",
        "options": {
          "fileName": "={{$json.request.request_id}}.age",
          "binaryPropertyName": "data"
        }
      },
      "name": "Upload to SFTP",
      "type": "n8n-nodes-base.ftp",
      "typeVersion": 1,
      "position": [2100, 200],
      "credentials": {
        "ftp": "SFTP GDPR Storage"
      }
    },
    {
      "parameters": {
        "fromEmail": "datenschutz@menschlichkeit-oesterreich.at",
        "toEmail": "={{$json.request.email}}",
        "subject": "Ihr DSGVO Auskunftsersuchen {{ $json.request.request_id }}",
        "text": "Guten Tag {{ $json.request.first_name }} {{ $json.request.last_name }},\n\nIhr Auskunftsersuchen wurde bearbeitet.\nBitte laden Sie die verschlüsselten Daten unter folgendem Link herunter:\nhttps://sftp-gdpr.menschlichkeit-oesterreich.at/download/{{ $json.request.request_id }}\n\nDas Passwort zur Entschlüsselung erhalten Sie separat per SMS.\n\nMit freundlichen Grüßen\nDatenschutz-Team\nMenschlichkeit Österreich"
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [2300, 200],
      "credentials": {
        "smtp": "SMTP Datenschutz"
      }
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[$json.request.request_id, 'GDPR - DSAR', 'delivery', 'n8n', 'completed', JSON.stringify($json.summary)]]}}"
      },
      "name": "Log Completion",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [2300, 400],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "resource": "issue",
        "operation": "create",
        "title": "DSAR abgeschlossen {{ $json.request.request_id }}",
        "body": "## DSGVO Auskunft\n- Request: {{ $json.request.request_id }}\n- Email: {{ $json.request.email }}\n- Status: completed\n- Export Ort: sftp://...\n- Bearbeitet am: {{ $now }}",
        "labels": ["gdpr","dsar"]
      },
      "name": "Create Audit Issue",
      "type": "n8n-nodes-base.github",
      "typeVersion": 1,
      "position": [2500, 200],
      "credentials": {
        "githubApi": "GitHub Automation Token"
      }
    }
  ],
  "connections": {
    "Trigger: DSAR Webhook": {
      "main": [ [ { "node": "Validate Request", "type": "main", "index": 0 } ] ]
    },
    "Validate Request": {
      "main": [ [ { "node": "IF Valid", "type": "main", "index": 0 } ] ]
    },
    "IF Valid": {
      "main": [
        [ { "node": "Log Validation", "type": "main", "index": 0 } ],
        [ { "node": "Fetch CiviCRM Data", "type": "main", "index": 0 } ]
      ]
    },
    "Fetch CiviCRM Data": {
      "main": [ [ { "node": "Fetch WordPress Data", "type": "main", "index": 0 } ] ]
    },
    "Fetch WordPress Data": {
      "main": [ [ { "node": "Aggregate Data", "type": "main", "index": 0 } ] ]
    },
    "Aggregate Data": {
      "main": [ [ { "node": "Build Summary", "type": "main", "index": 0 } ] ]
    },
    "Build Summary": {
      "main": [ [ { "node": "Create JSON Export", "type": "main", "index": 0 } ] ]
    },
    "Create JSON Export": {
      "main": [ [ { "node": "Encrypt Export", "type": "main", "index": 0 } ] ]
    },
    "Encrypt Export": {
      "main": [ [ { "node": "Upload to SFTP", "type": "main", "index": 0 } ] ]
    },
    "Upload to SFTP": {
      "main": [ [ { "node": "Send Email", "type": "main", "index": 0 } ] ]
    },
    "Send Email": {
      "main": [ [ { "node": "Log Completion", "type": "main", "index": 0 }, { "node": "Create Audit Issue", "type": "main", "index": 0 } ] ]
    }
  }
}
```

### Tests & Checks
- [ ] Webhook HMAC mit gültigem & ungültigem Secret testen
- [ ] Fake-DSAR (Testdaten) → Prüfen ob Export erstellt & verschlüsselt
- [ ] Download-Link & Passwort getrennt kommunizieren (SMS manuell)
- [ ] Audit-Log Einträge verifizieren (`SELECT * FROM gdpr_audit_log ORDER BY created_at DESC LIMIT 5`)
- [ ] GitHub-Issue (privates Repo `gdpr-audit`) wird erstellt

---

## 🧩 Workflow 2 – Consent Management Sync

**Zweck:** Synchronisierung von Einwilligungen, Newsletter-Opt-Ins und Opt-Outs über alle Systeme hinweg.

### Trigger & Ablauf
1. **Webhook:** Consent-Formular/CRM-Update sendet Event `consent.update`
2. **Validierung:** Prüft Signatur & Pflichtfelder (contact_id, consent_status)
3. **Update-Kette:**
   - CiviCRM → `GroupContact`, `Consent` Extension
   - Newsletter DB → `mo_mailings.contacts`
   - WordPress → `usermeta` Flag `gdpr_consent`
4. **Benachrichtigung:** Email-Bestätigung an betroffene Person, Slack-Info für Support
5. **Audit:** Eintrag in `gdpr_audit_log`

### Workflow-JSON (Template)
```json
{
  "name": "GDPR - Consent Sync",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "gdpr-consent",
        "options": {
          "responseCode": 202
        }
      },
      "name": "Trigger: Consent Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 600]
    },
    {
      "parameters": {
        "functionCode": "const crypto = require('crypto');\nconst signature = $json['headers']['x-signature'];\nconst payload = JSON.stringify($json.body);\nconst expected = crypto.createHmac('sha256', $env.DSGVO_WEBHOOK_SECRET).update(payload).digest('hex');\nif (signature !== expected) {\n  return [{ valid: false, reason: 'INVALID_SIGNATURE' }];\n}\nconst required = ['contact_id','email','consent_status','source'];\nconst missing = required.filter(k => !$json.body[k]);\nif (missing.length) {\n  return [{ valid: false, reason: 'MISSING_FIELDS', missing }];\n}\nreturn [{ valid: true, payload: $json.body }];"
      },
      "name": "Validate Consent",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 600]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [ { "value1": "={{$json.valid}}", "operation": "isFalse" } ]
        }
      },
      "name": "IF Invalid",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [700, 600]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[`CONSENT-${Date.now()}`, 'GDPR - Consent Sync', 'validation', 'n8n', $json.valid ? 'accepted' : 'rejected', JSON.stringify($json)]]}}"
      },
      "name": "Log Validation",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [900, 750],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "resource": "customObject",
        "operation": "update",
        "customResource": "Consent",
        "id": "={{$json.payload.contact_id}}",
        "additionalFields": {
          "status": "={{$json.payload.consent_status}}",
          "source": "={{$json.payload.source}}",
          "timestamp": "={{$now}}"
        }
      },
      "name": "Update CiviCRM Consent",
      "type": "n8n-nodes-base.civiCrm",
      "typeVersion": 1,
      "position": [900, 500],
      "credentials": {
        "civiCrmApi": "CiviCRM API"
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE contacts SET consent_status = :status, consent_updated_at = NOW() WHERE email = :email;",
        "additionalFields": {
          "queryParams": {
            "status": "={{$json.payload.consent_status}}",
            "email": "={{$json.payload.email}}"
          }
        }
      },
      "name": "Update Newsletter Consent",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [1100, 500],
      "credentials": {
        "mySql": "mo_mailings"
      }
    },
    {
      "parameters": {
        "operation": "update",
        "table": "wp_usermeta",
        "columns": ["meta_value"],
        "updateKey": "user_id",
        "updateKeyValue": "={{$json.payload.wordpress_user_id}}",
        "values": "={{[['{{gdpr_consent}}', $json.payload.consent_status]]}}"
      },
      "name": "Update WordPress Meta",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [1300, 500],
      "credentials": {
        "mySql": "mo_wordpress_main"
      }
    },
    {
      "parameters": {
        "fromEmail": "datenschutz@menschlichkeit-oesterreich.at",
        "toEmail": "={{$json.payload.email}}",
        "subject": "Bestätigung Ihrer Einwilligungsänderung",
        "text": "Guten Tag,\n\nIhre Einwilligung wurde angepasst:\nStatus: {{ $json.payload.consent_status }}\nQuelle: {{ $json.payload.source }}\nZeitpunkt: {{ $now }}\n\nSie können Ihre Entscheidung jederzeit widerrufen.\n\nFreundliche Grüße\nDatenschutz-Team"
      },
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1500, 500],
      "credentials": {
        "smtp": "SMTP Datenschutz"
      }
    },
    {
      "parameters": {
        "resource": "message",
        "channel": "#support",
        "text": "Consent-Update: {{$json.payload.email}} → {{$json.payload.consent_status}} ({{$json.payload.source}})"
      },
      "name": "Notify Support",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [1700, 500],
      "credentials": {
        "slackApi": "Slack Automation"
      }
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[$json.payload.request_id || `CONSENT-${Date.now()}`, 'GDPR - Consent Sync', 'consent_update', 'n8n', 'completed', JSON.stringify($json.payload)]]}}"
      },
      "name": "Log Completion",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [1900, 500],
      "credentials": {
        "postgres": "mo_n8n"
      }
    }
  ],
  "connections": {
    "Trigger: Consent Webhook": {
      "main": [ [ { "node": "Validate Consent", "type": "main", "index": 0 } ] ]
    },
    "Validate Consent": {
      "main": [
        [ { "node": "IF Invalid", "type": "main", "index": 0 } ],
        [ { "node": "Update CiviCRM Consent", "type": "main", "index": 0 } ]
      ]
    },
    "IF Invalid": {
      "main": [ [ { "node": "Log Validation", "type": "main", "index": 0 } ] ]
    },
    "Update CiviCRM Consent": {
      "main": [ [ { "node": "Update Newsletter Consent", "type": "main", "index": 0 } ] ]
    },
    "Update Newsletter Consent": {
      "main": [ [ { "node": "Update WordPress Meta", "type": "main", "index": 0 } ] ]
    },
    "Update WordPress Meta": {
      "main": [ [ { "node": "Send Confirmation", "type": "main", "index": 0 } ] ]
    },
    "Send Confirmation": {
      "main": [ [ { "node": "Notify Support", "type": "main", "index": 0 }, { "node": "Log Completion", "type": "main", "index": 0 } ] ]
    }
  }
}
```

### Tests & Checks
- [ ] Validierung mit gültigem & ungültigem Payload
- [ ] Aktualisierung in allen drei Systemen prüfen (SQL Queries siehe Anhang)
- [ ] Email- & Slack-Notifications kontrollieren
- [ ] Audit-Log-Eintrag vorhanden
- [ ] Timeout/Retry bei Datenbank-Locks (max. 3 Versuche, 2s Pause)

---

## 🧩 Workflow 3 – Monatlicher Datenschutz-Audit (Bericht)

**Zweck:** Automatisierte Erstellung eines Audit-Reports (Art. 30/32 DSGVO) inklusive Zugriffshistorie, Löschvorgänge und Consent-Änderungen.

### Ablauf
1. **Schedule:** Jeden 1. des Monats, 06:00 CET
2. **Datenquellen:**
   - Audit-Log `gdpr_audit_log`
   - CiviCRM `log_civicrm_contact`
   - Support-System (Incidents flagged GDPR)
3. **KPI-Berechnung:**
   - Anzahl DSAR-Anfragen (offen, abgeschlossen)
   - Löschanfragen pro Monat
   - Consent-Änderungen (Opt-In/Opt-Out)
   - Sicherheitsvorfälle (aus Incident-Label)
4. **Bericht:** Markdown → PDF
5. **Verteilung:** Email an `datenschutz@`, `vorstand@` + Archivierung in SharePoint/SFTP

### Workflow-JSON (Template)
```json
{
  "name": "GDPR - Monthly Audit Report",
  "nodes": [
    {
      "parameters": {
        "triggerTimes": [
          {
            "cronExpression": "0 6 1 * *"
          }
        ]
      },
      "name": "Schedule: Monthly",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [200, 900]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT action, status, COUNT(*) AS total FROM gdpr_audit_log WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') GROUP BY action, status;"
      },
      "name": "Fetch Audit Stats",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [400, 900],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "query": "SELECT COUNT(*) AS open_requests FROM gdpr_audit_log WHERE action = 'validation' AND status = 'accepted' AND request_id NOT IN (SELECT request_id FROM gdpr_audit_log WHERE action = 'delivery' AND status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month'));"
      },
      "name": "Fetch Open DSAR",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [400, 1050],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "query": "SELECT COUNT(*) AS deletions FROM gdpr_audit_log WHERE action = 'retention_delete' AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month');"
      },
      "name": "Fetch Deletions",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [400, 1200],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "functionCode": "const stats = $items('Fetch Audit Stats').map(item => item.json);\nconst open = $item(0, 'Fetch Open DSAR').json.open_requests;\nconst deletions = $item(0, 'Fetch Deletions').json.deletions;\nreturn [{ report: { stats, open, deletions, generated_at: new Date().toISOString() } }];"
      },
      "name": "Build Report Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 1000]
    },
    {
      "parameters": {
        "functionCode": "const { report } = $json;\nconst lines = [\n  `# DSGVO Audit Report - ${new Date().toISOString().substring(0,7)}`,\n  '',\n  '## Übersicht',\n  `- Generiert am: ${report.generated_at}`,\n  `- Offene DSAR: ${report.open}`,\n  `- Löschvorgänge: ${report.deletions}`,\n  '',\n  '## Aktionen nach Status',\n  '| Aktion | Status | Anzahl |',\n  '|--------|--------|--------|',\n];\nfor (const entry of report.stats) {\n  lines.push(`| ${entry.action} | ${entry.status} | ${entry.total} |`);\n}\nreturn [{ markdown: lines.join('\n') }];"
      },
      "name": "Render Markdown",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 1000]
    },
    {
      "parameters": {
        "options": {
          "content": "={{$json.markdown}}",
          "fileName": "={{`gdpr-audit-${$now.toFormat('yyyy-MM')}.md`}}"
        }
      },
      "name": "Create Markdown File",
      "type": "n8n-nodes-base.file",
      "typeVersion": 1,
      "position": [1150, 900]
    },
    {
      "parameters": {
        "operation": "htmlToPdf",
        "url": "={{$json.markdown}}",
        "options": {
          "format": "A4"
        }
      },
      "name": "Convert to PDF",
      "type": "n8n-nodes-base.pdf",
      "typeVersion": 1,
      "position": [1150, 1100]
    },
    {
      "parameters": {
        "protocol": "sftp",
        "path": "/audits/gdpr/",
        "options": {
          "fileName": "={{`gdpr-audit-${$now.toFormat('yyyy-MM')}.pdf`}}",
          "binaryPropertyName": "data"
        }
      },
      "name": "Upload Report",
      "type": "n8n-nodes-base.ftp",
      "typeVersion": 1,
      "position": [1350, 1000],
      "credentials": {
        "ftp": "SFTP GDPR Storage"
      }
    },
    {
      "parameters": {
        "fromEmail": "datenschutz@menschlichkeit-oesterreich.at",
        "toEmail": "datenschutz@menschlichkeit-oesterreich.at,vorstand@menschlichkeit-oesterreich.at",
        "subject": "Monatlicher DSGVO Audit Report {{ $now.toFormat('yyyy-MM') }}",
        "text": "Guten Tag,\n\ndie monatliche DSGVO-Auswertung steht bereit.\nDownload: https://sftp-gdpr.menschlichkeit-oesterreich.at/audits/gdpr/gdpr-audit-{{ $now.toFormat('yyyy-MM') }}.pdf\n\nGrüße\nDatenschutz-Team",
        "attachments": [
          {
            "binaryPropertyName": "data"
          }
        ]
      },
      "name": "Send Report",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1550, 1000],
      "credentials": {
        "smtp": "SMTP Datenschutz"
      }
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[`AUDIT-${$now.toFormat('yyyy-MM')}`, 'GDPR - Monthly Audit Report', 'report_generation', 'n8n', 'completed', JSON.stringify($json.report)]]}}"
      },
      "name": "Log Audit",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [1750, 1000],
      "credentials": {
        "postgres": "mo_n8n"
      }
    }
  ],
  "connections": {
    "Schedule: Monthly": {
      "main": [ [ { "node": "Fetch Audit Stats", "type": "main", "index": 0 } ] ]
    },
    "Fetch Audit Stats": {
      "main": [ [ { "node": "Fetch Open DSAR", "type": "main", "index": 0 } ] ]
    },
    "Fetch Open DSAR": {
      "main": [ [ { "node": "Fetch Deletions", "type": "main", "index": 0 } ] ]
    },
    "Fetch Deletions": {
      "main": [ [ { "node": "Build Report Data", "type": "main", "index": 0 } ] ]
    },
    "Build Report Data": {
      "main": [ [ { "node": "Render Markdown", "type": "main", "index": 0 } ] ]
    },
    "Render Markdown": {
      "main": [ [ { "node": "Create Markdown File", "type": "main", "index": 0 }, { "node": "Convert to PDF", "type": "main", "index": 0 } ] ]
    },
    "Convert to PDF": {
      "main": [ [ { "node": "Upload Report", "type": "main", "index": 0 } ] ]
    },
    "Upload Report": {
      "main": [ [ { "node": "Send Report", "type": "main", "index": 0 } ] ]
    },
    "Send Report": {
      "main": [ [ { "node": "Log Audit", "type": "main", "index": 0 } ] ]
    }
  }
}
```

### Validierung
- [ ] Cron-Trigger testweise auf `*/5 * * * *` stellen & Lauf beobachten
- [ ] Datenkonsistenz prüfen (Summen = Einzeldaten)
- [ ] PDF-Inhalt öffnen & Format kontrollieren
- [ ] Email mit Anhang & SFTP-Files vorhanden
- [ ] Audit-Log-Eintrag

---

## 🧩 Workflow 4 – Datenaufbewahrung & Löschung

**Zweck:** Durchsetzung von Lösch- & Anonymisierungsregeln gemäß Art. 17 & 25 DSGVO (Privacy by Design).

### Retention-Policies
| Datenkategorie | Quelle | Aufbewahrungsfrist | Aktion |
|----------------|--------|--------------------|--------|
| Newsletter-Abmeldungen | `mo_mailings.contacts` | 24 Monate nach Abmeldung | Anonymisieren (Email → Hash) |
| Support-Tickets | `mo_support.tickets` | 36 Monate nach Abschluss | Inhalt pseudonymisieren |
| Spenden-Transaktionen | `mo_civicrm.contribution` | 10 Jahre (Abgabenordnung) | Markierung `locked` statt Löschung |
| Website-Logs | `mo_analytics.events` | 6 Monate | Vollständige Löschung |
| DSAR-Exporte | SFTP `/exports/gdpr/` | 60 Tage | Löschung |

### Workflow-JSON (Template)
```json
{
  "name": "GDPR - Data Retention Enforcement",
  "nodes": [
    {
      "parameters": {
        "triggerTimes": [ { "cronExpression": "0 3 * * *" } ]
      },
      "name": "Schedule: Nightly",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [200, 1300]
    },
    {
      "parameters": {
        "query": "SELECT email FROM contacts WHERE consent_status = 'unsubscribed' AND consent_updated_at < NOW() - INTERVAL 24 MONTH;"
      },
      "name": "Find Old Unsubscribed",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [400, 1200],
      "credentials": {
        "mySql": "mo_mailings"
      }
    },
    {
      "parameters": {
        "functionCode": "const crypto = require('crypto');\nreturn items.map(item => ({ json: { email_hash: crypto.createHash('sha256').update(item.json.email).digest('hex') } }));"
      },
      "name": "Hash Emails",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [600, 1200]
    },
    {
      "parameters": {
        "query": "UPDATE contacts SET email = CONCAT('deleted+', SUBSTR(UUID(),1,8), '@example.com'), email_hash = :email_hash, updated_at = NOW() WHERE email_hash IS NULL AND email IN (SELECT email FROM contacts WHERE consent_status = 'unsubscribed' AND consent_updated_at < NOW() - INTERVAL 24 MONTH);",
        "additionalFields": {
          "queryParams": {
            "email_hash": "={{$json.email_hash}}"
          }
        }
      },
      "name": "Anonymize Newsletter",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [800, 1200],
      "credentials": {
        "mySql": "mo_mailings"
      }
    },
    {
      "parameters": {
        "query": "UPDATE tickets SET requester_email = CONCAT('deleted+', SUBSTR(UUID(),1,8), '@example.com'), message = '[redacted]' WHERE status = 'closed' AND closed_at < NOW() - INTERVAL '36 months';"
      },
      "name": "Pseudonymize Support",
      "type": "n8n-nodes-base.mysqldatabase",
      "typeVersion": 1,
      "position": [800, 1400],
      "credentials": {
        "mySql": "mo_support"
      }
    },
    {
      "parameters": {
        "query": "DELETE FROM events WHERE occurred_at < NOW() - INTERVAL '6 months';"
      },
      "name": "Delete Analytics",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [800, 1600],
      "credentials": {
        "postgres": "mo_analytics"
      }
    },
    {
      "parameters": {
        "protocol": "sftp",
        "path": "/exports/gdpr/",
        "options": {
          "operation": "DELETE",
          "recursive": true,
          "filters": {
            "olderThan": "60d"
          }
        }
      },
      "name": "Cleanup SFTP",
      "type": "n8n-nodes-base.ftp",
      "typeVersion": 1,
      "position": [1000, 1300],
      "credentials": {
        "ftp": "SFTP GDPR Storage"
      }
    },
    {
      "parameters": {
        "functionCode": "const summary = {\n  anonymizedNewsletter: $items('Anonymize Newsletter').length,\n  pseudonymizedTickets: $items('Pseudonymize Support').length,\n  deletedAnalytics: $items('Delete Analytics').length\n};\nreturn [{ summary }];"
      },
      "name": "Build Summary",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1200, 1300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "gdpr_audit_log",
        "columns": ["request_id","workflow","action","actor","status","details"],
        "values": "={{[[`RETENTION-${Date.now()}`, 'GDPR - Data Retention Enforcement', 'retention_delete', 'n8n', 'completed', JSON.stringify($json.summary)]]}}"
      },
      "name": "Log Retention",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [1400, 1300],
      "credentials": {
        "postgres": "mo_n8n"
      }
    },
    {
      "parameters": {
        "fromEmail": "datenschutz@menschlichkeit-oesterreich.at",
        "toEmail": "datenschutz@menschlichkeit-oesterreich.at",
        "subject": "Retention-Report {{ $now.toISODate() }}",
        "text": "Guten Morgen,\n\ndie nächtliche Datenaufbewahrungsroutine wurde abgeschlossen.\n- Newsletter anonymisiert: {{ $json.summary.anonymizedNewsletter }}\n- Support anonymisiert: {{ $json.summary.pseudonymizedTickets }}\n- Analytics gelöscht: {{ $json.summary.deletedAnalytics }}\n\nAudit-Log: SELECT * FROM gdpr_audit_log WHERE action = 'retention_delete' ORDER BY created_at DESC LIMIT 5;\n\nGrüße\nDatenschutz-Team"
      },
      "name": "Notify DPO",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1600, 1300],
      "credentials": {
        "smtp": "SMTP Datenschutz"
      }
    }
  ],
  "connections": {
    "Schedule: Nightly": {
      "main": [ [ { "node": "Find Old Unsubscribed", "type": "main", "index": 0 } ] ]
    },
    "Find Old Unsubscribed": {
      "main": [ [ { "node": "Hash Emails", "type": "main", "index": 0 } ] ]
    },
    "Hash Emails": {
      "main": [ [ { "node": "Anonymize Newsletter", "type": "main", "index": 0 } ] ]
    },
    "Anonymize Newsletter": {
      "main": [ [ { "node": "Pseudonymize Support", "type": "main", "index": 0 }, { "node": "Delete Analytics", "type": "main", "index": 0 }, { "node": "Cleanup SFTP", "type": "main", "index": 0 } ] ]
    },
    "Cleanup SFTP": {
      "main": [ [ { "node": "Build Summary", "type": "main", "index": 0 } ] ]
    },
    "Pseudonymize Support": {
      "main": [ [ { "node": "Build Summary", "type": "main", "index": 0 } ] ]
    },
    "Delete Analytics": {
      "main": [ [ { "node": "Build Summary", "type": "main", "index": 0 } ] ]
    },
    "Build Summary": {
      "main": [ [ { "node": "Log Retention", "type": "main", "index": 0 }, { "node": "Notify DPO", "type": "main", "index": 0 } ] ]
    }
  }
}
```

### Validierung
- [ ] Dry-Run mit Testumgebung (Datenbank-Kopien) – niemals direkt auf Produktion testen
- [ ] Sicherstellen, dass steuerrelevante Datensätze **nicht gelöscht** werden (nur Flag)
- [ ] Audit-Logs prüfen & archivieren
- [ ] Email an DPO erhalten
- [ ] SFTP Cleanup löscht alte Export-Ordner

---

## 🔐 Sicherheit & Audit

### Audit Logging Richtlinien
- Alle Workflows loggen in `gdpr_audit_log`
- Pflichtfelder: `request_id`, `workflow`, `action`, `status`, `details`
- Keine PII im `details` speichern → nur hashes/IDs
- Monatliches Backup der Audit-Tabelle (`pg_dump mo_n8n --table=gdpr_audit_log`)

### Incident Handling
- Bei Fehlern (Status ≠ 2xx) → automatischer Slack-Alert #security
- Kritische Fehler (z.B. Encryption Failure) → PagerDuty On-Call
- Incident wird als GitHub Issue mit Label `incident-gdpr` erstellt

### Zugriffskontrolle
- n8n-Workflow-Berechtigungen: nur Rolle "DPO" & "DevOps"
- SFTP-Zugriff via SSH-Key, passwortlos; Keys in Secrets Tresor
- Encryption Keys rotieren alle 12 Monate (`scripts/gdpr/rotate-keys.sh`)

---

## ✅ DSGVO-Checkliste
- [ ] Webhook-Sicherheit implementiert (HMAC + HTTPS)
- [ ] Export-Dateien verschlüsselt (AGE/PGP)
- [ ] Getrennte Kommunikation von Dateilink & Passwort
- [ ] Audit-Logs vollständig (Art. 30 DSGVO)
- [ ] Löschprozesse dokumentiert & revisionssicher
- [ ] Zugriff nur für Rollen mit Need-to-Know
- [ ] Tests dokumentiert (Audit-Trail)
- [ ] DPO informiert & Freigabe im Issue

---

## 🧪 Testplan (Manuell + Automatisiert)

### Manuelle Tests
1. **DSAR-Flow:** Dummy-Person anlegen → DSAR-Formular ausfüllen → Export prüfen
2. **Consent-Flow:** Opt-In & Opt-Out durchspielen → Synchronität (CRM, Newsletter, WP)
3. **Audit-Report:** Cron auf minütlich, PDF inhaltlich prüfen
4. **Retention:** Testdaten > Grenzwerte → Anonymisierung validieren

### Automatisierte Tests (n8n CLI)
```bash
n8n execute --workflow-id="GDPR - Data Subject Access Request" --rawInput='{"body": {"request_id":"TEST","email":"test@example.com","first_name":"Test","last_name":"Person","identity_proof_url":"https://example.com/id.pdf"}}'
```

### QA-Protokoll
- Testdaten dokumentieren (`docs/gdpr/tests/<date>.md`)
- Ergebnis + Screenshots im QA-Ordner
- Abnahme-Protokoll vom DPO unterschreiben lassen

---

## 📎 Anhang – SQL Snippets

### Consent-Validierung
```sql
SELECT email, consent_status, consent_updated_at
FROM contacts
WHERE email = 'betroffene.person@example.com';
```

### Audit-Log Übersicht
```sql
SELECT request_id, workflow, action, status, created_at
FROM gdpr_audit_log
ORDER BY created_at DESC
LIMIT 20;
```

### WordPress Consent Prüfen
```sql
SELECT u.user_email, m.meta_value AS gdpr_consent
FROM wp_users u
JOIN wp_usermeta m ON m.user_id = u.ID AND m.meta_key = 'gdpr_consent'
WHERE u.user_email = 'betroffene.person@example.com';
```

---

## 🔄 Integration in Gesamt-Automation
- Execution Order `8` (nach Email, Deployment, Datenbank, Monitoring)
- Abhängigkeiten: Datenbank-Zugriff (02), Secrets (SFTP/PGP), GitHub Token (Audit Issues)
- Monitoring: Dashboard Widget "GDPR Status" (n8n-Analytics)
- Alerts: Slack `#security`, Email `datenschutz@`

---

**Nächste Schritte nach Import:**
1. Workflows importieren → Credentials zuweisen → Testlauf
2. DPO-Abnahme einholen → Issues dokumentieren (`gdpr-audit` Repo)
3. Cron-Trigger aktivieren → Monitoring prüfen → Alerts testen
4. Audit-Report an Vorstand & DPO kommunizieren

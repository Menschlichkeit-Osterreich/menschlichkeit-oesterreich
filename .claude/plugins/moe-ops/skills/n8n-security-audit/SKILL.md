---
name: n8n-security-audit
description: 'Prueft alle n8n-Workflow-JSON-Dateien auf Sicherheitsluecken: fehlende Webhook-Authentifizierung, deaktivierte kritische Workflows, fehlende Error-Handler'
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# n8n Security Audit

## Zweck

Systematische Sicherheitspruefung aller n8n-Workflow-JSON-Dateien im Verzeichnis `automation/n8n/workflows/`.

## Pruefkategorien

### 1. Webhook-Authentifizierung (KRITISCH)

Jeder Webhook-Trigger MUSS einen der folgenden Auth-Mechanismen haben:

- `headerAuth` mit HMAC-Signatur
- `basicAuth`
- IP-Whitelist in n8n-Einstellungen

**Pruefung:** Suche nach `"type": "n8n-nodes-base.webhook"` und pruefe ob `authentication` gesetzt ist.

```bash
# Finde Webhooks ohne Auth
grep -l '"n8n-nodes-base.webhook"' automation/n8n/workflows/*.json | while read f; do
  if ! grep -q '"authentication"' "$f"; then
    echo "KRITISCH: Webhook ohne Auth in $f"
  fi
done
```

### 2. Deaktivierte kritische Workflows (WARNUNG)

Folgende Workflows MUESSEN `active: true` sein:

- `right-to-erasure-fixed.json` (DSGVO-Pflicht)
- `finance-dunning.json` (Zahlungsverkehr)
- `plesk-deployment-notifications.json` (Monitoring)

**Pruefung:** Parse `"active":` Feld in jeder JSON-Datei.

### 3. Fehlende Error-Handler (WARNUNG)

Jeder Workflow mit externen API-Aufrufen SOLLTE einen Error-Handler-Node haben:

- `n8n-nodes-base.errorTrigger`
- Oder ein `catchAll`-Pattern

### 4. Bekannte Sicherheitsrisiken

- `right-to-erasure-minimal.json`: **KEIN** HMAC/Signatur-Check — MUSS deaktiviert oder geloescht werden
- `forum-viral.json`: Spam-Risiko bei unkontrollierter Weiterleitung

### 5. Secrets in Workflow-Dateien (KRITISCH)

Suche nach hartkodierten Tokens, API-Keys, Passwoertern in JSON:

```bash
grep -rn '"value":\s*"[A-Za-z0-9_-]{20,}"' automation/n8n/workflows/*.json
```

## Output-Format

```
═══════════════════════════════════════
  n8n Security Audit — [Datum]
═══════════════════════════════════════
  Workflows geprueft: 25

  KRITISCH (sofort beheben):
  ❌ right-to-erasure-minimal.json — Webhook ohne Auth
  ❌ [weitere...]

  WARNUNG (zeitnah beheben):
  ⚠️ forum-viral.json — Kein Error-Handler
  ⚠️ [weitere...]

  OK:
  ✅ 20 Workflows bestanden alle Pruefungen
═══════════════════════════════════════
```

## Empfohlene Ausfuehrung

- Vor jedem Deployment (`deploy-verify` vorschalten)
- Nach Aenderungen an Workflow-Dateien
- Woechentlich als Teil des Security-Reviews

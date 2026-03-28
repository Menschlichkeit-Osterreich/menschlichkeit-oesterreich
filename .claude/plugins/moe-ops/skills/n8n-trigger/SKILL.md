---
name: n8n-trigger
description: 'Benannte n8n-Workflows sicher ausloesen mit Parametervalidierung und Bestaetigungsprompt'
argument-hint: '<workflow-name> [--params JSON]'
allowed-tools:
  - Bash
  - Read
  - WebFetch
---

# n8n Trigger — Workflow-Ausloesung

## Zweck

Ermoeglicht das sichere Ausloesen von n8n-Workflows ueber benannte Aliase statt roher Webhook-URLs.

## Verfuegbare Workflows

| Alias                | Workflow-Datei                        | Kritikalitaet | Benoetigt Bestaetigung  |
| -------------------- | ------------------------------------- | ------------- | ----------------------- |
| `deploy-notify`      | `plesk-deployment-notifications.json` | Niedrig       | Nein                    |
| `crm-sync`           | `crm-sync-members.json`               | Mittel        | Ja                      |
| `member-onboard`     | `onboarding-welcome-series.json`      | Mittel        | Ja                      |
| `invoice`            | `finance-invoicing.json`              | Hoch          | Ja                      |
| `membership-invoice` | `finance-membership-invoicing.json`   | Hoch          | Ja                      |
| `dunning`            | `finance-dunning.json`                | Hoch          | Ja                      |
| `sepa-export`        | `finance-sepa-export.json`            | Kritisch      | Ja + Doppelbestaetigung |
| `gdpr-erase`         | `right-to-erasure-fixed.json`         | Kritisch      | Ja + Doppelbestaetigung |
| `donation`           | `finance-donation-processing.json`    | Hoch          | Ja                      |
| `payment-confirm`    | `finance-payment-confirmation.json`   | Mittel        | Ja                      |
| `social-post`        | `social-media-crosspost.json`         | Niedrig       | Ja                      |
| `forum-mod`          | `forum-moderation.json`               | Mittel        | Nein                    |
| `build-pipeline`     | `build-pipeline-automation.json`      | Niedrig       | Nein                    |

## Sicherheitsregeln

1. **Kritische Workflows** (`sepa-export`, `gdpr-erase`): Doppelbestaetigung erforderlich
2. **Alle Workflows mit Bestaetigung**: Parameter anzeigen BEVOR der Trigger gesendet wird
3. **NIEMALS** PII-Daten (E-Mail, Name, IBAN) in Logs oder Chat-Output ausgeben
4. **IMMER** das Ergebnis des Webhook-Aufrufs pruefen (HTTP 200 = Erfolg)

## Ausfuehrung

```bash
# Workflow triggern (ueber n8n-webhook MCP oder direkt)
curl -sf -X POST http://localhost:5678/webhook/<path> \
  -H "Content-Type: application/json" \
  -d '{"trigger": "claude-ops", "params": {...}}'
```

## Ablauf

1. Workflow-Alias aufloesen → Webhook-URL bestimmen
2. Parameter validieren (falls erwartet)
3. Kritikalitaet pruefen → Bestaetigung einholen
4. Webhook triggern
5. Ergebnis auswerten und melden

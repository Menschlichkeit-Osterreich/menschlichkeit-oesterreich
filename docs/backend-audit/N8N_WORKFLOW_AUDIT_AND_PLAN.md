# N8N_WORKFLOW_AUDIT_AND_PLAN

## Vorhandene Workflows
- `build-pipeline-automation.json`
- `crm-member-management.json`
- `crm-sync-members.json`
- `dashboard-etl-stripe-civicrm.json`
- `dlq-admin.json`
- `events-reminder.json`
- `finance-donation-processing.json`
- `finance-dunning.json`
- `finance-invoicing.json`
- `finance-membership-invoicing.json`
- `finance-payment-confirmation.json`
- `finance-sepa-export.json`
- `forum-moderation.json`
- `forum-viral.json`
- `mail-archiver-logging.json`
- `onboarding-welcome-series.json`
- `openclaw-bridge.json`
- `plesk-deployment-notifications.json`
- `queue-monitor.json`
- `right-to-erasure-fixed.json`
- `right-to-erasure-minimal.json`
- `right-to-erasure.json`
- `social-media-crosspost.json`
- `Stripe_Webhook_to_CiviCRM_Contribution.json`
- `WebhookQueue_Processor.json`

## Bereits geschlossene Defekte
- Vorher tote API-Ziele wurden im FastAPI-Layer ergänzt:
  - `/payments/process-sepa`
  - `POST /finance/invoices`
  - `GET /finance/sepa/collectible`
  - `POST /finance/sepa/export-batch`
  - `/payments/log`
- Queue-/DLQ-Endpunkte sind jetzt real vorhanden:
  - `/api/queue/stats`
  - `/api/queue/dlq/list`
  - `/api/queue/dlq/requeue`
  - `/api/queue/dlq/purge`
- Alert-Mail-Endpunkt ist real vorhanden:
  - `POST /api/alerts/email`

## Weiterhin defekte oder fragwürdige Workflows
- Mehrere Workflows enthalten Inline-Mail-HTML oder direkte SMTP-Nodes statt API-Mail-Dispatch:
  - `crm-member-management.json`
  - `finance-membership-invoicing.json`
  - `finance-sepa-export.json`
  - `Stripe_Webhook_to_CiviCRM_Contribution.json`
- Einige Workflows sind Backoffice-/Legacy-orientiert und sollten als solche markiert werden:
  - CiviCRM-Webform-nahe Flows
  - Social/Forum/Bridge-Workflows
- `MOE_API_URL`/`API_BASE_URL` war in der n8n-Beispielumgebung bisher ohne `/api` dokumentiert; das wurde im Template korrigiert.

## Zielarchitektur
- n8n triggert nur definierte API-Verträge.
- Transaktionale Mailinhalte werden nicht mehr inline gepflegt, sondern via `POST /api/internal/mail/send` mit `template_id`.
- n8n nutzt:
  - signierte interne Endpunkte
  - Queue-/DLQ-Endpunkte
  - keine harten Secrets oder Hostwerte in Workflow-JSONs

## Konkrete Maßnahmen
1. Alle produktiven Workflows auf `/api`-Basen vereinheitlichen.
2. Inline-Mail-Nodes schrittweise auf API-Templates migrieren.
3. Workflow-Metadaten standardisieren:
   - Tags
   - Verantwortliche Domäne
   - Input-/Output-Contract
4. Right-to-Erasure-Workflows an `data_deletion_requests` und `integration_failures` koppeln.
5. Queue-Monitoring an reale `outbox_events`/`integration_failures` koppeln, nicht an implizite Annahmen.

## Importfähigkeit
- JSON-Dateien sind vorhanden und versionierbar.
- Für reproduzierbare Importe fehlen noch:
  - zentrale Doku pro Workflow
  - klare Secret-Matrix
  - einheitliche Namenskonvention für Credentials

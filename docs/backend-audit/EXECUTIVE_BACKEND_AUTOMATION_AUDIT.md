# EXECUTIVE_BACKEND_AUTOMATION_AUDIT

## Ist Zustand
- FastAPI ist die reale öffentliche API-Schicht und enthält produktive Router für `auth`, `members`, `contact`, `newsletter`, `privacy`, `payments`, `internal`, `queue`, `alerts`, `finance`, `invoices`, `metrics`, `events`, `blog`, `forum`, `roles`.
- Das Repo hatte vor der aktuellen Härtung zwei konkurrierende Datenwelten:
  - Alembic-Finanzschema in `apps/api/alembic/versions/001_*`, `002_*`, `003_operational_platform.py`
  - Laufzeit-DDL in `apps/api/app/routers/finance.py`
- CiviCRM ist real vorhanden über:
  - `apps/api/src/crm/civi_service.py`
  - `apps/api/app/services/crm_service.py`
  - Drupal/CiviCRM-Webforms in `apps/crm/config/sync/webform.webform.*.yml`
- n8n ist real vorhanden mit produktiven Workflow-Dateien unter `automation/n8n/workflows/`.
- Transaktionale Mail-Templates existieren unter `apps/api/src/notifications/templates/`, waren aber vorher nicht als durchgehendes zentrales Integrationssystem verdrahtet.

## Hauptlücken vor der aktuellen Härtung
- Tote API-Ziele in n8n-Workflows:
  - `/payments/process-sepa`
  - `POST /finance/invoices`
  - `GET /finance/sepa/collectible`
  - `POST /finance/sepa/export-batch`
  - `/payments/log`
- Keine zentrale Session-/Refresh-Token-Persistenz für Auth.
- Keine vollständige DOI-/Consent-/Privacy-End-to-End-Kette.
- Direkte CRM-Zugriffe im Frontend waren zwar weitgehend zurückgedrängt, aber Legacy-/Admin-Komponenten nutzen weiterhin `services/civicrm.ts`.
- CRM-Settings in `apps/crm/sites/default/settings.php` und `apps/crm/sites/default/civicrm.settings.php` enthielten fest codierte oder deterministisch ableitbare Secrets.
- n8n-Umgebungsbeispiele zeigten auf API-Basen ohne `/api` und liefen dadurch gegen falsche Pfade.

## Hauptbrüche
- `apps/api/app/routers/finance.py` erzeugt Tabellen per `CREATE TABLE IF NOT EXISTS`, während Alembic parallel dasselbe Domänengebiet definiert.
- `apps/website` verwendet mehrere API-Zugriffspfade parallel:
  - `src/services/api/client.ts`
  - `src/services/api.ts`
  - Legacy-Fetches mit `VITE_API_BASE_URL`
- CiviCRM-Webforms existieren als Legacy-/Fallback-Pfade, aber die Hauptwebsite bewegt sich gleichzeitig in Richtung FastAPI-first.
- n8n enthält sowohl API-orchestrierte Flows als auch Inline-Mailversand/Inline-HTML.

## Risikoübersicht
- `P0` Secrets/PII: aktuelle Tree-Secrets im CRM-PHP-Zweig waren hochkritisch.
- `P0` Datenintegrität: tote Workflow-Endpunkte führten zu still scheiternden Automationen.
- `P1` Architekturdrift: konkurrierende DB-Schemata und mehrere API-Clients erhöhen Fehlerwahrscheinlichkeit.
- `P1` DSGVO: Consent-/Export-/Löschpfade waren unvollständig und nicht durchgehend auditierbar.
- `P1` Zustelllogik: transaktionale Mail-Templates existierten, aber Governance und Orchestrierung waren fragmentiert.

## Klare Umsetzungsentscheidung
- FastAPI bleibt die einzige öffentliche Integrationsschicht für Website-Flows.
- CiviCRM bleibt System of Record für Kontakte, Gruppen, Mitgliedschaften und Contributions.
- n8n bleibt Worker-/Automation-Schicht, nicht fachliche Primärquelle.
- Alembic bleibt DB-Quelle der Wahrheit; Runtime-DDL ist ein Legacy-Rest und soll als nächster Schritt zurückgebaut werden.
- Transaktionale Mails laufen zentral über FastAPI-Templates und Logging.

## Bereits direkt umgesetzt
- Neue/ergänzte produktive API-Endpunkte:
  - Auth inkl. Refresh, Verify-Email, Reset, 2FA, Session-Verwaltung
  - `POST /api/contact/submit`
  - Newsletter Subscribe/Confirm/Unsubscribe
  - Privacy Export/Delete/Consent
  - Stripe/PayPal Intents und Webhooks
  - interne CRM-/Finance-/Mail-Endpunkte
  - Queue-/DLQ-Endpunkte
  - Alerts-Mail-Endpunkt
  - die fehlenden n8n-Kompatibilitätsendpunkte für SEPA, Rechnungserzeugung und Payment-Logging
- `members`, `member_sessions`, `consent_records`, `newsletter_subscriptions`, `webhook_events`, `outbox_events`, `data_export_requests`, `data_deletion_requests`, `integration_failures` wurden migrationsseitig vereinheitlicht.
- CRM-/Drupal-Settings wurden auf `getenv()` umgestellt; Klartext-Credentials und berechenbare Schlüssel wurden aus dem aktuellen Tree entfernt.
- `.env.example`, `automation/n8n/.env.example` und `apps/website/.env.example` wurden auf den realen Zielvertrag aktualisiert.

## Noch offen
- Vollständiger History-Rewrite für alte Secret-Funde ist weiterhin separat auszuführen.
- `apps/api/app/routers/finance.py` nutzt noch Runtime-DDL und ist nicht vollständig an das Alembic-Finanzschema zurückgeführt.
- Einige Frontend-/Admin-Komponenten nutzen weiterhin Legacy-Pfade über `VITE_API_BASE_URL` oder CRM-nahe Services.
- n8n enthält noch Inline-Mail-Nodes und Backoffice-orientierte Workflows, die auf API-Template-Dispatch migriert werden sollten.

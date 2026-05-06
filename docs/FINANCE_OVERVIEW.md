# Finance Overview

Stand: 12.04.2026

## Zielbild

- Das Portal unter `apps/website` ist das operative Hauptcockpit für Vorstand, Kassier und Finance-Team.
- ERPNext ist das führende Buchhaltungssystem für Debitoren, Kreditoren, Zahlungen, Journalbuchungen, Payroll und Assets.
- CiviCRM bleibt operative Quelle für Kontakte, Mitgliedschaften und Contributions.
- `apps/api/app/**` ist die aktive Integrationsschicht zwischen Portal, CiviCRM, n8n und ERPNext.

## Aktive technische Bausteine

- `apps/api/app/services/erpnext_client.py`
  ERPNext-/Frappe-REST-Client mit Token-Auth, Retry, Timeout und typisierten Payloads.
- `apps/api/app/services/finance_sync_service.py`
  Idempotente Sync-Orchestrierung mit Queue, Status, Requeue und Fehlerpersistenz.
- `apps/api/app/routers/finance.py`
  Admin-/Finance-Cockpit-Endpunkte für Overview, Cockpit, Sync, Payables, Journale und Reports.
- `apps/api/app/routers/internal.py`
  Interne n8n- und Webhook-Einstiege inklusive ERPNext-Sync-Prozessierung.
- `automation/n8n/workflows/`
  Versionierte Workflows für Rechnungen, Zahlungen, SEPA, ERPNext-Sync und Reconciliation.

## Source of Truth

- Buchhaltung: ERPNext
- CRM- und Vereinsstammdaten: CiviCRM
- Portal-UI und operative Steuerung: Website-/CRM-Frontend
- Legacy-Tabellen `payments`, `expenses`, `invoices`, `projects`:
  Übergangsdaten, Historie, KPI-Brücke und Migrationsbasis

## Kernflüsse

1. Donation oder Mitgliedsbeitrag wird in Plattform/CiviCRM erfasst.
2. `finance_sync_service` legt idempotente Sync-Einträge in `finance_external_sync` an.
3. ERPNext erhält `Sales Invoice` und bei Zahlung `Payment Entry`.
4. Erfolgreiche ERPNext-Zahlungen werden nach CiviCRM zurückgespielt.
5. Portal liest Cockpit- und Reportdaten aus ERPNext-Hybriddaten.

## Betriebsregeln

- Keine Secrets im Code oder in Workflow-JSON.
- Keine PII in Logs; nur technische IDs, Status und Fehlertexte.
- Keine Doppelbuchungen: jede Operation hat einen stabilen `idempotency_key`.
- Requeue und Fehlerverfolgung laufen über `finance_external_sync` und `integration_failures`.

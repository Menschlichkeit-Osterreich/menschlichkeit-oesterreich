# Finanzarchitektur

Stand: 12.04.2026

## Architekturprinzip

- CiviCRM verwaltet Kontakte, Mitgliedschaften und Contributions.
- Das Portal ist das operative Cockpit für Finance, Vorstand und Admin.
- ERPNext ist das führende Buchhaltungssystem.
- FastAPI verbindet Portal, CiviCRM, n8n und ERPNext.

## Laufende Komponenten

- `apps/website`
  Portal- und Admin-Oberflächen inklusive Finanzcockpit
- `apps/api/app/routers/finance.py`
  Finance-Endpunkte für Cockpit, Reports, Journale, Payables und Sync
- `apps/api/app/services/finance_sync_service.py`
  Queue, Idempotenz, Retry, Failure-Tracking
- `apps/api/app/services/erpnext_client.py`
  Frappe-REST-Adapter
- `automation/n8n/workflows/`
  asynchrone Orchestrierung

## Datenfluss

1. Plattform oder CiviCRM erzeugen einen operativen Vorgang.
2. FastAPI persistiert lokale Referenzen und einen `finance_external_sync`-Eintrag.
3. n8n oder das Admin-Cockpit stoßen die Verarbeitung an.
4. ERPNext erhält die Standardbelege:
   - `Sales Invoice`
   - `Payment Entry`
   - `Purchase Invoice`
   - `Journal Entry`
   - optional Payroll-/Asset-bezogene Doctypes
5. Erfolgreiche Zahlungssynchronisation aktualisiert CiviCRM.

## Queue und Fehler

- `finance_external_sync`
  idempotente ERPNext-Sync-Queue
- `integration_failures`
  technische Fehler und Nachverfolgung
- `outbox_events`
  bestehende Plattform-Eventbasis für weitere Automationen

## Legacy-Bestand

- Tabellen wie `payments`, `expenses`, `invoices` und `projects` bleiben für Übergangs-KPIs, Historie und Migration relevant.
- Sie sind nicht mehr das Zielbild für die eigentliche Buchhaltungsführung.

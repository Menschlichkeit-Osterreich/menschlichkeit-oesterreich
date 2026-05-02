# Finance Runbook

Stand: 12.04.2026

## 1. Voraussetzungen

- gültige ERPNext-/Frappe-Credentials in `FRAPPE_BASE_URL`, `FRAPPE_API_KEY`, `FRAPPE_API_SECRET`
- aktive CiviCRM-Credentials
- n8n mit Zugriff auf interne API-Routen
- PostgreSQL-Migration inklusive `finance_external_sync`

## 2. Wichtige Endpunkte

- `GET /api/finance/cockpit`
- `GET /api/finance/sync/health`
- `POST /api/finance/sync/process`
- `POST /api/finance/sync/requeue/{sync_id}`
- `POST /api/finance/payables`
- `POST /api/finance/manual-journal`
- `GET /api/finance/reports/catalog`

## 3. Standardbetrieb

1. Portal-Finanzcockpit öffnen.
2. Sync-Status prüfen.
3. Offene Forderungen und Verbindlichkeiten prüfen.
4. Queue bei Bedarf mit `Sync jetzt ausführen` verarbeiten.
5. Fehler mit Requeue oder technischer Korrektur behandeln.
6. Monatsabschluss-Journale im Cockpit erfassen.
7. Reports als JSON/CSV exportieren.

## 4. Requeue / Fehlerbehebung

- Fehler im Cockpit oder via `GET /api/finance/sync/health` identifizieren.
- Einzelnen Fehler mit `POST /api/finance/sync/requeue/{sync_id}` neu einreihen.
- Danach `POST /api/finance/sync/process?limit=20` ausführen.
- Harte ERPNext-Fehler zuerst in ERPNext-Konfiguration oder Stammdaten korrigieren.

## 5. Smoke-Test

- Portal: Finance-Cockpit lädt ohne Demo-Daten.
- `python automation/scripts/finance/erpnext_smoke.py`
- n8n: ERPNext-Sync-Workflow manuell triggern.
- Testspende oder Testrechnung anlegen.
- Prüfen:
  - Sync-Eintrag vorhanden
  - `Sales Invoice` in ERPNext
  - bei Zahlung `Payment Entry`
  - CiviCRM-Contribution auf `Completed`

## 6. Datenschutz und Logging

- Keine Secret-Werte in Logs.
- Keine PII in technischen Fehlermeldungen weiterreichen.
- Reports nur an berechtigte Rollen ausgeben.

## 7. Cutover-Hinweis

- Vor Produktiv-Cutover Backfill und Abstimmbericht durchführen.
- Nach Cutover ist ERPNext die Buchhaltungswahrheit; Legacy-Tabellen bleiben historisch/read-only.

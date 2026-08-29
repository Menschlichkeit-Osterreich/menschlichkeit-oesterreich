---
title: n8n Migrations- und Forensik-Anweisungen
version: 2.0.0
created: 2025-10-08
lastUpdated: 2026-08-29
status: ACTIVE
priority: critical
category: core
applyTo: automation/n8n/**,.github/workflows/**,docs/platform-audit/**
---

# n8n ist Migrationsquelle, nicht Zielplattform

GitHub Issue #539 hat Vorrang: Make ist die strategische
Automationsplattform; FastAPI/PostgreSQL bleiben Owner kritischer Zustände.
n8n-Artefakte sind nur für Inventarisierung, Export, Migrationstest,
Reconciliation und Retirement relevant.

## Verbotene neue Nutzung

- Keine neue Produktfunktion, keinen neuen Webhook und keine neue
  Datenbankintegration in n8n bauen.
- Kein n8n-Workflow darf Stripe-Zustände entscheiden, eine zweite
  Payment-/Ledger-Wahrheit führen oder direkt produktive FastAPI-Tabellen
  schreiben.
- Keine n8n-Qualitäts- oder Deployment-Gates als allgemeine Produktgates
  einsetzen.

## Migrationsvertrag

Jedes Artefakt in `automation/n8n/workflows/` hat einen Eintrag in
`docs/platform-audit/2026-08-28/11-n8n-make-migration-matrix.md` mit
Entscheidung, Business Owner, Datenklasse, Ersatz, Test, Reconciliation,
Cutover, Rollback und Retirement-Status.

Erlaubte Entscheidungen sind `MIGRATE_TO_MAKE`, `MOVE_TO_FASTAPI`, `RETIRE`,
`TEMPORARY_KEEP` und `UNKNOWN`. `UNKNOWN` blockiert Cutover und Löschung.

## Stilllegung

Kein Workflow, Compose-Service, Port, Datenvolume oder Export wird gelöscht,
bevor Inventar, Export/Backup, getesteter Ersatz, Reconciliation und
Rollback-Fenster dokumentiert sind. `npm run n8n:validate` bleibt ein
Artefakt- und JSON-Check, kein Nachweis einer laufenden n8n-Instanz.

## Datenschutz und Kommunikation

Workflow-Namen, Logs, Tickets und Slack-Alerts enthalten keine PII, Secret-
Werte oder vollständigen Payment-Payloads. Externe Writes erfolgen nur über
den bestätigten Zielvertrag und mit fachlicher Freigabe.

---
title: Make-first Automation Instructions
version: 1.0.0
created: 2026-08-29
lastUpdated: 2026-08-29
status: ACTIVE
priority: critical
category: core
applyTo: automation/**,apps/api/**,docs/integration/**,docs/platform-audit/**
---

# Make-first Automations

Make ist die strategische Orchestrierungsplattform gemäß GitHub Issue #539.
Es darf ausschließlich nach erfolgreichem FastAPI-/PostgreSQL-Commit arbeiten.

## Vor einer Szenarioänderung

1. Nur das bestätigte Menschlichkeit-Österreich-Team und die positive
   Connection-Allowlist verwenden.
2. Szenario, Trigger, Business Owner, Datenklasse, Zielsystem,
   Idempotency-Key, Fehlerpfad, Reconciliation, Cutover und Rollback im
   Migrationsledger dokumentieren.
3. Zuerst inaktiv oder im kontrollierten Testmodus erstellen. Aktivierung,
   Webhook-Umstellung und Massendaten-Writes benötigen ein Release-Gate.

## Technische Grenze

- Make konsumiert ausschließlich den FastAPI-Outbox-Claim-/Lease-/Ack-Vertrag.
- Keine direkte PostgreSQL-Verbindung, kein eigener Payment-Status, kein
  eigener Ledger und keine kritische Stripe-Entscheidung.
- Externe Zielsysteme erhalten stabile Referenzen aus dem Event; sie müssen
  ihre Writes mit `idempotency_key` deduplizieren.

## Fehler und Datenschutz

Fehler sind `TRANSIENT`, `PERMANENT`, `BUSINESS_REJECTED`, `AUTH_FAILURE`,
`RATE_LIMIT` oder `SCHEMA_ERROR`. Nach begrenzten Retries wird ein Dead-Letter
gemeldet. Slack erhält nur datensparsame Alarmfelder. Personen- und
Zahlungsdaten gehören weder in Logs noch in Szenarionamen.

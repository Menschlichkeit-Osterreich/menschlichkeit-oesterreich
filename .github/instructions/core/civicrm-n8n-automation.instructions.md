---
title: CiviCRM + Make + Plesk – Integrationsleitfaden
version: 2.0.0
created: 2025-10-08
lastUpdated: 2026-08-29
status: ACTIVE
priority: high
category: core
applyTo: apps/crm/**,automation/**,.github/workflows/**,scripts/**
---

# CiviCRM + Make + Plesk

GitHub Issue #539 ersetzt die frühere n8n-zentrierte Zielarchitektur.
CiviCRM bleibt CRM-System; Make ist nur die nachgelagerte
Integrationsschicht. Finanz- und Payment-Entscheidungen gehören zu
FastAPI/PostgreSQL beziehungsweise ERPNext als Buchhaltungs-System.

## Verbindliche Integrationsregeln

1. Make konsumiert nur bestätigte FastAPI-Outbox-Ereignisse über den
   authentifizierten Lease-/Ack-Vertrag, nie über eine PostgreSQL-Verbindung.
2. Jede CiviCRM-Contribution nutzt die Stripe-/Donation-Referenz als externe
   Duplikatsperre. Jede ERPNext-Buchung nutzt dieselbe fachliche Referenz.
3. Fehler werden klassifiziert, begrenzt wiederholt und danach im Dead Letter
   dokumentiert. Ein Wiederholversuch darf keine zweite Contribution,
   Buchung, Mail oder Slack-Meldung erzeugen.
4. SEPA, Rechnungen, Mahnungen, Belege und Subscription-Lifecycles werden
   erst nach einer fachlichen Regelentscheidung aktiviert. Es gibt keine
   globale Receipt-Eligibility-Annahme.
5. Plesk-Deploys und Scheduler werden nicht durch Make oder n8n freigeschaltet.

## Datenschutz

Nur die für Contact Matching, Contribution und erlaubte Kommunikation nötigen
Daten passieren die Integrationsgrenze. Make-Logs und Slack enthalten keine
Spendendaten, Kontaktdaten, Tokens oder Rohpayloads. Jede neue Connection
braucht eine dokumentierte Zuständigkeit, Datenklasse und Zugriffsfreigabe.

## Betriebsfreigabe

Vor einem Make-Szenario: isoliertes MOE-Team, bestätigte Connection-Allowlist,
inaktiver Test, Idempotenztest, Fehlerpfad, Reconciliation und Rollback. n8n
bleibt bis zum abgeschlossenen Cutover ausschließlich forensische Referenz.

# Contract: Donation Governance Gate

## Contract Purpose

Dieser Contract definiert den verbindlichen Governance- und Betriebsvertrag fuer den End-to-End-Donation-Fluss.

## Scope

### In Scope

- End-to-End-Fluss Frontend -> API -> Stripe -> Webhook -> API -> n8n -> CRM -> Receipt
- Vorab-Gates fuer technische und fachliche Freigabe
- Fehler-, Retry- und Eskalationspfade
- DSGVO- und Logging-Anforderungen fuer donation-relevante Daten
- Smoke-Test-Evidenzen vor produktiver Freigabe

### Out of Scope

- Verlagerung von Business-Logik ausschliesslich in n8n
- Freigabe ohne dokumentierte Webhook- und Receipt-Evidenz
- Direkte Verarbeitung ohne nachvollziehbare Fehlerbehandlung

## Invariants

- API bleibt Source of Truth fuer donation-kritische Fachlogik.
- Keine Secrets oder sensitiven Zahlungsdetails in Logs.
- Kein produktiver Lauf ohne erfolgreichen Donation-Smoke-Test.
- Fehlerpfade muessen dokumentierte Retry- und Abbruchkriterien besitzen.
- Receipt-Eligibility muss nachweisbar bewertet werden.

## Required Evidence

- Erfolgreicher End-to-End-Smoke mit Exit-Code 0
- Mindestens zwei dokumentierte `receipt_eligible`-Faelle
- Archivierte Webhook-Responses fuer den Freigabelauf
- Fehlerpfad- oder Retry-Nachweise fuer negative Testfaelle
- DSGVO-/Log-Schutz-Validierung ohne PII-/Secret-Leaks

## Acceptance Gate

Der Contract gilt als erfuellt, wenn technische, fachliche und Compliance-Gates vollstaendig belegt sind und keine No-Go-Verletzung offen ist.

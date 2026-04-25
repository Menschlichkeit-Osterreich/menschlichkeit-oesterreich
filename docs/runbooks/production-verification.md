# Production Verification Runbook

Stand: 2026-04-25
Scope: Produktionsverifikation fuer Deploy-, Secret- und Integrationspfade ohne Offenlegung von Secrets oder PII.

## Sicherheitsrahmen

- Keine echten Tokens, Passwoerter oder Secret-Werte in Tickets, Logs oder Screenshots.
- Keine PII in Testdaten, Mailinhalten oder Evidence-Artefakten.
- Alle Nachweise werden mit Redaction gespeichert (Secret-Werte maskiert).

## 1. Deploy Dry-Run

Ziel: Sicherstellen, dass der produktive Deploy-Workflow ohne Schreiboperationen lauffaehig ist.

Schritte:

1. GitHub Actions Workflow `deploy-plesk.yml` via `workflow_dispatch` starten.
2. Parameter setzen: `service=api`, `dry_run=true`.
3. Pruefen, dass Build/Preflight erfolgreich sind und kein produktiver Push ausgefuehrt wurde.

Erwartung:

- Workflow endet erfolgreich.
- Keine produktiven Dateischreibschritte auf Plesk.

Evidence:

- Workflow-Run-URL
- Job-Summary mit Dry-Run-Markierung

## 2. BSM Secret Injection

Ziel: Nachweisen, dass BSM-Handoff fuer produktive Runtime-Keys funktioniert.

Schritte:

1. Im gleichen oder separaten Deploy-Run den Preflight-Teil fuer BSM-Injektion ausfuehren.
2. Job `Preflight (BSM Handoff)` pruefen.
3. Nur auf Vorhandensein/Maskierung achten, nie auf Klartext.

Erwartung:

- Alle benoetigten Keys als vorhanden markiert.
- Fehlende Keys stoppen den Lauf vor produktiven Schritten.

Evidence:

- Preflight-Logauszug (maskiert)
- Ergebnisstatus pro erforderlichem Key (pass/fail)

## 3. Graph-Mail Live-Test

Ziel: Verifizieren, dass Graph-Mail Versand in Production-Konfiguration funktioniert.

Schritte:

1. Test-Mail mit nicht-personenbezogenem Inhalt an dedizierte technische Testadresse ausloesen.
2. SMTP/Graph-Provider-Response pruefen.
3. Empfang nur im technischen Testpostfach validieren.

Erwartung:

- Versandstatus erfolgreich.
- Keine Auth-/Tenant-Fehler.

Evidence:

- Korrelation-ID/Message-ID (ohne Inhalt mit PII)
- Erfolgsstatus im Versandlog

## 4. Slack-Alert Live-Test

Ziel: Sicherstellen, dass produktive Betriebsalarme im Zielkanal ankommen.

Schritte:

1. Test-Alert ueber vorhandenen Alerting-Mechanismus ausloesen.
2. Empfang im definierten Ops-Kanal bestaetigen.
3. Payload auf Secret- und PII-Freiheit pruefen.

Erwartung:

- Alert wird zugestellt.
- Kein Secret/PII in Nachricht oder Metadaten.

Evidence:

- Zeitstempel + Alert-ID
- Screenshot/Export mit Redaction

## 5. Stripe-Failure Live-Test

Ziel: Fehlerpfad im Payment-Flow produktionsnah verifizieren.

Schritte:

1. Definierten Failure-Testfall mit Testmodus/abgesichertem Szenario ausloesen.
2. API-Fehlerbehandlung und Alerting pruefen.
3. Sicherstellen, dass kein doppelter Finanzzustand entsteht.

Erwartung:

- Fehler wird kontrolliert behandelt.
- Monitoring/Alerting feuert exakt einmal.

Evidence:

- Request-/Event-ID (maskiert)
- Logauszug mit Failure-Handling

## 6. DOI Live-Test

Ziel: Double-Opt-In End-to-End ohne personenbezogene Echtdaten pruefen.

Schritte:

1. Technische Testadresse fuer DOI registrieren.
2. DOI-Mail empfangen und Bestaetigungslink ausfuehren.
3. Statuswechsel in System/Log verifizieren.

Erwartung:

- DOI-Mail kommt an.
- Bestaetigung fuehrt zu aktivem Opt-In-Status.

Evidence:

- DOI Event-ID
- Statuswechsel-Nachweis (vorher/nachher, ohne PII)

## 7. Base-URL/DB/Plesk Drift Check

Ziel: Drift zwischen erwarteter Produktionskonfiguration und Laufzeit erkennen.

Schritte:

1. Oeffentliche Base-URLs gegen Deploy-Vertrag pruefen.
2. DB-Zielparameter gegen freigegebenen Produktionsscope pruefen (nur Metadaten).
3. Plesk-Zielpfade und aktive Service-Endpunkte mit Deploy-Dokumentation abgleichen.

Erwartung:

- Keine unautorisierte Abweichung.
- Bei Drift: Incident/Change-Prozess starten.

Evidence:

- Vergleichstabelle Soll/Ist (ohne Credentials)
- Freigabevermerk Ops/DevOps

## 8. Go/No-Go Kriterien

Go wenn alle Punkte erfuellt sind:

- Deploy Dry-Run erfolgreich.
- BSM-Handoff erfolgreich.
- Graph-Mail Test erfolgreich.
- Slack-Alert Test erfolgreich.
- Stripe-Failure Test erfolgreich.
- DOI Test erfolgreich.
- Kein Base-URL/DB/Plesk Drift.
- Keine Security-/PII-Verstoesse in Evidence.

No-Go bei einem der folgenden Punkte:

- Fehlende/verdeckte Pflicht-Keys.
- Integrationsfehler in Mail/Alert/Payment/DOI.
- Ungeklaerte Drift im Produktionspfad.
- Secret- oder PII-Leak in Artefakten.

## 9. Evidence-Ablage

Empfohlene Struktur:

- `quality-reports/production-verification/YYYY-MM-DD/`
- `quality-reports/production-verification/YYYY-MM-DD/deploy-dry-run.md`
- `quality-reports/production-verification/YYYY-MM-DD/integration-tests.md`
- `quality-reports/production-verification/YYYY-MM-DD/drift-check.md`

Ablageregeln:

- Nur redigierte Nachweise.
- Keine Secret-Werte.
- Keine PII.
- Jede Evidence-Datei mit Datum, Owner, Freigabestatus.

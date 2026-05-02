# Production Verification Runbook

Stand: 2026-04-25
Scope: Produktionsverifikation fuer Deploy-, Secret- und Integrationspfade ohne Offenlegung von Secrets oder PII.

## Session-Metadaten

Jede Ausfuehrung legt einen dedizierten Evidence-Ordner an:

- `quality-reports/production-verification/YYYY-MM-DD/`
- Pflichtdatei `00-session-context.md` mit: Datum, Service, Workflow-Run-ID, Commit-SHA, Ausfuehrende Rolle, Freigabestatus.

Standard-Artefakte fuer den aktiven API-Produktionspfad:

- `01-deploy-dry-run.md`
- `01b-deploy-live.md`
- `02-bsm-handoff.md`
- `03-graph-mail.md`
- `04-slack-alert.md`
- `05-stripe-failure.md`
- `06-doi.md`
- `07-drift-check.md`
- `08-go-no-go.md`
- `99-blockers.md` nur wenn ein Live-Schritt nicht ausfuehrbar oder fehlgeschlagen ist.

## Sicherheitsrahmen

- Keine echten Tokens, Passwoerter oder Secret-Werte in Tickets, Logs oder Screenshots.
- Keine PII in Testdaten, Mailinhalten oder Evidence-Artefakten.
- Alle Nachweise werden mit Redaction gespeichert (Secret-Werte maskiert).
- Fuer den aktiven API-Produktionspfad ist `MAIL_TRANSPORT=graph` der Default-Nachweis. `MAIL_USERNAME` und `MAIL_PASSWORD` sind nur dann als Pflichtbestandteil zu pruefen, wenn ein expliziter SMTP-Betrieb fuer denselben Pfad freigegeben wurde.

## 1. Deploy Dry-Run

Ziel: Sicherstellen, dass der produktive Deploy-Workflow ohne Schreiboperationen lauffaehig ist.

Schritte:

1. GitHub Actions Workflow `deploy-plesk.yml` via `workflow_dispatch` starten.
1. Parameter setzen: `service=api`, `dry_run=true`.
1. Pruefen, dass Build/Preflight erfolgreich sind und kein produktiver Push ausgefuehrt wurde.

Erwartung:

- Workflow endet erfolgreich.
- Keine produktiven Dateischreibschritte auf Plesk.

Evidence:

- Workflow-Run-URL
- Job-Summary mit Dry-Run-Markierung
- Ablage in `01-deploy-dry-run.md`

## 2. BSM Secret Injection

Ziel: Nachweisen, dass BSM-Handoff fuer produktive Runtime-Keys funktioniert.

Schritte:

1. Im gleichen oder separaten Deploy-Run den Preflight-Teil fuer BSM-Injektion ausfuehren.
1. Job `Preflight (BSM Handoff)` pruefen.
1. Nur auf Vorhandensein/Maskierung achten, nie auf Klartext.

Erwartung:

- Alle benoetigten Keys als vorhanden markiert.
- Fehlende Keys stoppen den Lauf vor produktiven Schritten.

Evidence:

- Preflight-Logauszug (maskiert)
- Ergebnisstatus pro erforderlichem Key (pass/fail)
- Explizite Feststellung, dass `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_GRAPH_SENDER` und `ALERTS_SLACK_WEBHOOK` vorhanden sind.
- Explizite Feststellung, ob `MAIL_USERNAME` und `MAIL_PASSWORD` fuer diesen Lauf nicht erforderlich waren oder bewusst geprueft wurden.
- Ablage in `02-bsm-handoff.md`

## 2b. Deploy Live (Nicht-Dry-Run)

Ziel: Den echten produktiven API-Deploypfad mit Plesk-Write, Runtime-Reload und nachgelagerten Healthchecks nachweisen.

Schritte:

1. GitHub Actions Workflow `deploy-plesk.yml` via `workflow_dispatch` starten.
1. Parameter setzen: `service=api`, `dry_run=false`.
1. Job `Deploy -> Plesk` inklusive API-Teil pruefen.
1. Healthchecks auf `https://api.menschlichkeit-oesterreich.at/healthz` und `https://api.menschlichkeit-oesterreich.at/readyz` verifizieren.

Erwartung:

- API-Deploy und Runtime-Reload erfolgreich.
- Beide API-Healthchecks erfolgreich.

Evidence:

- Run-ID und exakter Zeitstempel.
- Zielsystem und Ziel-Host.
- Ergebnis `Deploy -> Plesk`.
- Ergebnis API-Liveness und API-Readiness.
- Ablage in `01b-deploy-live.md`.

## 3. Graph-Mail Live-Test

Ziel: Verifizieren, dass Graph-Mail Versand in Production-Konfiguration funktioniert.

Schritte:

1. Test-Mail mit nicht-personenbezogenem Inhalt an dedizierte technische Testadresse ausloesen.
1. SMTP/Graph-Provider-Response pruefen.
1. Empfang nur im technischen Testpostfach validieren.

Erwartung:

- Versandstatus erfolgreich.
- Keine Auth-/Tenant-Fehler.

Evidence:

- Korrelation-ID/Message-ID (ohne Inhalt mit PII)
- Erfolgsstatus im Versandlog
- Workflow-Run-ID oder Trigger-Referenz des ausloesenden Testfalls
- Ablage in `03-graph-mail.md`

## 4. Slack-Alert Live-Test

Ziel: Sicherstellen, dass produktive Betriebsalarme im Zielkanal ankommen.

Schritte:

1. Test-Alert ueber vorhandenen Alerting-Mechanismus ausloesen.
1. Empfang im definierten Ops-Kanal bestaetigen.
1. Payload auf Secret- und PII-Freiheit pruefen.

Erwartung:

- Alert wird zugestellt.
- Kein Secret/PII in Nachricht oder Metadaten.

Evidence:

- Zeitstempel + Alert-ID
- Screenshot/Export mit Redaction
- Workflow-Run-ID oder Trigger-Referenz des ausloesenden Testfalls
- Ablage in `04-slack-alert.md`

## 5. Stripe-Failure Live-Test

Ziel: Fehlerpfad im Payment-Flow produktionsnah verifizieren.

Schritte:

1. Definierten Failure-Testfall mit Testmodus/abgesichertem Szenario ausloesen.
1. API-Fehlerbehandlung und Alerting pruefen.
1. Sicherstellen, dass kein doppelter Finanzzustand entsteht.

Erwartung:

- Fehler wird kontrolliert behandelt.
- Monitoring/Alerting feuert exakt einmal.

Evidence:

- Request-/Event-ID (maskiert)
- Logauszug mit Failure-Handling
- Ablage in `05-stripe-failure.md`

## 6. DOI Live-Test

Ziel: Double-Opt-In End-to-End ohne personenbezogene Echtdaten pruefen.

Schritte:

1. Technische Testadresse fuer DOI registrieren.
1. DOI-Mail empfangen und Bestaetigungslink ausfuehren.
1. Statuswechsel in System/Log verifizieren.

Erwartung:

- DOI-Mail kommt an.
- Bestaetigung fuehrt zu aktivem Opt-In-Status.

Evidence:

- DOI Event-ID
- Statuswechsel-Nachweis (vorher/nachher, ohne PII)
- Ablage in `06-doi.md`

## 7. Base-URL/DB/Plesk Drift Check

Ziel: Drift zwischen erwarteter Produktionskonfiguration und Laufzeit erkennen.

Schritte:

1. Oeffentliche Base-URLs gegen Deploy-Vertrag pruefen.
1. DB-Zielparameter gegen freigegebenen Produktionsscope pruefen (nur Metadaten).
1. Plesk-Zielpfade und aktive Service-Endpunkte mit Deploy-Dokumentation abgleichen.

Erwartung:

- Keine unautorisierte Abweichung.
- Bei Drift: Incident/Change-Prozess starten.

Evidence:

- Vergleichstabelle Soll/Ist (ohne Credentials)
- Freigabevermerk Ops/DevOps
- Ablage in `07-drift-check.md`

## 8. Go/No-Go Kriterien

Go wenn alle Punkte erfuellt sind:

- Deploy Dry-Run erfolgreich.
- Deploy Live (Nicht-Dry-Run) erfolgreich.
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
- Fehlgeschlagener oder fehlender Nicht-Dry-Run fuer `service=api`.
- Ungeklaerte Drift im Produktionspfad.
- Secret- oder PII-Leak in Artefakten.

Evidence:

- Kompakte Bewertung in `08-go-no-go.md`
- Falls nicht alle Live-Schritte ausfuehrbar waren: exakte Blockerkette in `99-blockers.md`

## 9. Evidence-Ablage

Empfohlene Struktur:

- `quality-reports/production-verification/YYYY-MM-DD/`
- `quality-reports/production-verification/YYYY-MM-DD/00-session-context.md`
- `quality-reports/production-verification/YYYY-MM-DD/01-deploy-dry-run.md`
- `quality-reports/production-verification/YYYY-MM-DD/01b-deploy-live.md`
- `quality-reports/production-verification/YYYY-MM-DD/02-bsm-handoff.md`
- `quality-reports/production-verification/YYYY-MM-DD/03-graph-mail.md`
- `quality-reports/production-verification/YYYY-MM-DD/04-slack-alert.md`
- `quality-reports/production-verification/YYYY-MM-DD/05-stripe-failure.md`
- `quality-reports/production-verification/YYYY-MM-DD/06-doi.md`
- `quality-reports/production-verification/YYYY-MM-DD/07-drift-check.md`
- `quality-reports/production-verification/YYYY-MM-DD/08-go-no-go.md`
- `quality-reports/production-verification/YYYY-MM-DD/99-blockers.md`

Ablageregeln:

- Nur redigierte Nachweise.
- Keine Secret-Werte.
- Keine PII.
- Jede Evidence-Datei mit Datum, Owner, Freigabestatus.

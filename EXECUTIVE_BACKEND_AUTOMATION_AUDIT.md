# Executive Backend & Automation Audit

**Projekt:** Menschlichkeit Österreich — NGO-Plattform
**Datum:** 2026-03-22
**Scope:** FastAPI-Backend, n8n-Automationen, CiviCRM-Integration, Email-Templates

---

## 1. Management Summary

Das Projekt Menschlichkeit Österreich ist ein Multi-Service-Monorepo für eine österreichische NGO mit Fokus auf Demokratie und Menschenrechte. Die Kernarchitektur — bestehend aus Authentifizierung, Payment-Processing, CRM-Integration, Newsletter-Management und DSGVO-Compliance — ist solide implementiert und deckt über 90 API-Endpunkte ab. Kritische Lücken bestehen jedoch bei den Email-Templates (7 von 15 sind unstyled und ohne Branding), bei der Testabdeckung (nur 31 Tests vorhanden, keine fuer PayPal, Newsletter oder CRM-Sync), sowie bei unvollständigen Webhook-Flows (PayPal-Events werden nur geloggt, Stripe-Fehlschläge haben noch keine CRM-/Ops-Folgeorchestrierung). Diese Lücken stellen sowohl ein DSGVO-Risiko (fehlende Opt-Out-Links in Marketing-Mails) als auch ein Finanzrisiko (verlorene PayPal-Spenden) dar und müssen priorisiert behoben werden.

---

## 2. IST-Zustand — Was funktioniert

| Bereich                   | Beschreibung                                                                      | Status |
| ------------------------- | --------------------------------------------------------------------------------- | ------ |
| **Auth-Flow**             | Register, Login, JWT, Refresh, Logout, Password-Reset, Email-Verify (7 Endpoints) | ✅     |
| **Stripe-Checkout**       | Intent → Webhook → Donation → CiviCRM → Danke-Mail                                | ✅     |
| **PayPal-Checkout**       | Order → Capture → Donation → CiviCRM (Webhook unvollständig)                      | ✅     |
| **Newsletter DOI**        | Subscribe → DOI-Mail → Confirm → CiviCRM-Gruppe → Consent                         | ✅     |
| **CRM-Facade**            | CiviCRM v4 API (find/upsert/membership/contribution/newsletter)                   | ✅     |
| **DSGVO**                 | PII-Sanitizer, Audit-Trail, Consent-Records, Data-Export/Deletion                 | ✅     |
| **RBAC**                  | 5-Stufen (GUEST → MEMBER → MODERATOR → ADMIN → SYSADMIN)                          | ✅     |
| **Finance**               | Invoices, SEPA-Export, Dunning (3 Eskalationsstufen)                              | ✅     |
| **n8n-Workflows**         | 25 Workflows (Member-Mgmt, Finance, GDPR, Social Media, Monitoring)               | ✅     |
| **Forum, Blog, Events**   | CRUD-Operationen, Moderation, RSVP                                                | ✅     |
| **Metrics/KPI-Dashboard** | Aggregierte Kennzahlen (Members, Donations, Burn Rate)                            | ✅     |
| **API-Umfang**            | 90+ Endpunkte über 18 Router                                                      | ✅     |

---

## 3. Kritische Lücken (nach Priorität)

| #   | Lücke                                                                                          | Schwere | Betroffene Komponente                                              |
| --- | ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| 1   | 7 von 15 Email-Templates unstyled (kein Header, Footer, Branding)                              | **P0**  | `src/notifications/templates/`                                     |
| 2   | Branding-Inkonsistenz: welcome=blau (#1a4a6e), donation=lila (#6b21a8), Brand=Orange (#D84A1B) | **P0**  | Email Templates                                                    |
| 3   | Kein zentrales Email-Designsystem — jedes Template eigene Styles                               | **P0**  | Neues Base-Template nötig                                          |
| 4   | Marketing-Mails ohne DSGVO-Pflicht-Opt-Out                                                     | **P0**  | newsletter_doi, newsletter_confirmed                               |
| 5   | PayPal-Webhook verarbeitet Events nicht — nur Logging, kein `record_successful_donation`       | **P1**  | `routers/payments.py`                                              |
| 6   | Newsletter-Unsubscribe zeichnet keinen Consent-Widerruf auf                                    | **P1**  | `routers/newsletter.py`                                            |
| 7   | Kein CRM-/Ops-Folgeflow fuer Stripe-Fehlschlaege                                               | **P1**  | CiviCRM-/Alert-Orchestrierung nach `payment_intent.payment_failed` |
| 8   | DOI-Token hat kein Ablaufdatum                                                                 | **P1**  | `routers/newsletter.py`                                            |
| 9   | Keine Tests für Payment-Flows, Newsletter, CRM-Sync                                            | **P1**  | `tests/`                                                           |
| 10  | Mail-Service ohne Retry/Fallback                                                               | **P2**  | `services/mail_service.py`                                         |
| 11  | n8n right-to-erasure 3 Varianten (Original, -fixed, -minimal)                                  | **P2**  | `automation/n8n/`                                                  |
| 12  | Finance-PDF-Templates (dunning.html, receipt.html, membership_card.html) sind Stubs            | **P2**  | `src/finance/templates/`                                           |

---

## 4. Risikoübersicht

| Risiko                                                        | Eintrittswahrscheinlichkeit | Auswirkung                                          | Mitigation                                                                 |
| ------------------------------------------------------------- | --------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| DSGVO-Verstoß durch fehlende Opt-Out-Links in Marketing-Mails | **Hoch**                    | Abmahnung, Bußgeld gemäß Art. 83 DSGVO              | Sofort Opt-Out-Links in alle Marketing-Templates nachrüsten                |
| PayPal-Spenden gehen verloren (Webhook nicht verarbeitet)     | **Mittel**                  | Finanzverlust, fehlerhafte Buchhaltung              | PayPal-Webhook vollständig implementieren mit `record_successful_donation` |
| Fehlerhafte Spenden ohne nachgelagerte Betriebsreaktion       | **Mittel**                  | Ausfaelle bleiben fuer Team/CRM zu lange unsichtbar | Failure-CRM-Sync und Ops-/Admin-Alert nachziehen                           |
| CRM-Desynchronisation (Plattform vs. CiviCRM)                 | **Niedrig**                 | Datenkonsistenz-Probleme, doppelte Kontakte         | Monitoring-Alerts + bidirektionale Sync-Tests                              |
| Testabdeckung deckt nur ~15% der Business-Flows ab            | **Hoch**                    | Unentdeckte Regressionen bei Deployments            | Testabdeckung systematisch auf kritische Flows erhöhen                     |

---

## 5. Empfohlene Maßnahmen

### Phase 1: Sofort (P0) — DSGVO & Branding

1. **Zentrales Email-Base-Template** erstellen mit Header, Footer, Brand-Farbe (#D84A1B), und DSGVO-konformem Opt-Out-Link
2. **Alle 15 Email-Templates** auf das Base-Template migrieren — einheitliches Branding sicherstellen
3. **Opt-Out-Links** in alle Marketing-relevanten Templates einfügen (newsletter_doi, newsletter_confirmed, onboarding-serie)
4. **Branding-Inkonsistenz** beheben: Alle Templates auf offizielle Brand-Farbe (#D84A1B) vereinheitlichen

### Phase 2: Kurzfristig (P1) — Funktionslücken

5. **PayPal-Webhook** vollständig implementieren (`record_successful_donation`, CRM-Sync, Danke-Mail)
6. **Stripe-Failure-Folgeorchestrierung** ergaenzen (CRM-Sync und Admin-/Ops-Alert auf Basis des bestehenden `donation_failed`-Flows)
7. **Newsletter-Unsubscribe** erweitern um Consent-Widerruf-Aufzeichnung (`consent_records`)
8. **DOI-Token-Ablauf** implementieren (empfohlen: 48h TTL)
9. **Tests schreiben** für Payment-Flows (Stripe + PayPal), Newsletter-DOI, CRM-Sync (Ziel: 60% Flow-Abdeckung)

### Phase 3: Mittelfristig (P2) — Stabilität & Qualität

10. **Mail-Service Retry** implementieren (3 Versuche, exponentielles Backoff)
11. **n8n right-to-erasure** bereinigen: Eine autoritative Version behalten, Duplikate entfernen
12. **Finance-PDF-Templates** fertigstellen (dunning.html, receipt.html, membership_card.html)
13. **CRM-Integration-Tests** mit Mock-CiviCRM-Server
14. **End-to-End-Tests** für kritische User-Journeys (Registrierung → Spende → Danke-Mail)

---

## 6. Technische Kennzahlen

| Metrik            | Wert                                              |
| ----------------- | ------------------------------------------------- |
| Router            | 18                                                |
| Endpunkte         | 90+                                               |
| Services          | 6 Core + Utilities                                |
| Pydantic Schemas  | 15 Dateien                                        |
| Email-Templates   | 15 (4 Production-Ready, 11 Stubs/Unstyled)        |
| n8n Workflows     | 25                                                |
| Tests (Python)    | 31 (4 Dateien)                                    |
| Tests (E2E)       | 12 (2 Dateien)                                    |
| Testabdeckung     | ~15% der Business-Flows                           |
| RBAC-Stufen       | 5 (GUEST → MEMBER → MODERATOR → ADMIN → SYSADMIN) |
| CRM-Integration   | CiviCRM v4 API (5 Operationen)                    |
| Payment-Provider  | 2 (Stripe, PayPal)                                |
| Datenbankschema   | PostgreSQL mit Alembic-Migrationen (Finance)      |
| Automation-Engine | n8n (Docker, 25 Workflows)                        |

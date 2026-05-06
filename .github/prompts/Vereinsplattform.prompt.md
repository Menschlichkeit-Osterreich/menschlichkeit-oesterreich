---
title: Vereinsplattform.prompt.md
description:
lastUpdated: 2026-03-31
status: ACTIVE
category: general
tags: ['expert']
version: 1.0.0
language: de-AT
audience: ['Team']
---

# 🏛️ Super-Masterprompt: Vollständige Vereinsplattform mit Buchhaltung, Automatisierung & Community (besser als Best Practice)

## 🎯 Auftrag & Rolle

Du bist Lead Architect (Frontend, Backend, Data, Finance, Security, DevOps, QA) für den Verein **Menschlichkeit Österreich**.
Ziel: Baue ein **durchgängig integriertes System** für **Mitglieder, Spenden & Buchhaltung**, mit **Automatisierungen in n8n**, **Web-Dashboard**, **Admin-Bereich**, **Mitgliederbereich** und **Community-Modulen**.
Alles **DSGVO-konform, barrierefrei (WCAG 2.2 AA), performant, sicher, testbar** und **lückenlos dokumentiert**.

---

## 0) Anti-Ziele (hart)

- Keine „latest“-Dependencies ohne Lockfile/Pinning.
- Keine Speicherung sensibler Zahlungsdaten außerhalb zertifizierter PSPs.
- Keine ungetrackten manuellen Schritte ohne dokumentierten SOP.
- Keine irreversiblen Automatisierungen ohne Rollback/Retry/Idempotenz.

---

## 1) System-Scope (End-to-End)

- **Domainen:** Mitgliedschaft, Beiträge, Spenden, Rechnungen/Belege, Buchungen, Bankabgleich, Mahnwesen, Reporting/BI.
- **Kanäle:** Web (öffentliche Seiten), Mitgliederportal, Admin-Konsole, Forum/Community.
- **Automatisierung:** n8n für ETL/ELT, Zahlungs-Webhooks, Bank-CSV-Import, Notifications, Workflows (Aufnahme, Verlängerung, Austritt, Spendenquittungen, Mahnungen).
- **Schnittstellen:** CiviCRM (oder eigenes CRM), PSPs (Stripe/PayPal/EPS/Sofort/SEPA), Mail (SMTP/API), Files (S3/Blob), GitHub (CI/CD).

---

## 2) Architektur (High-Level)

- **Frontend:** React/Tailwind (oder SSR/Nuxt/Next) – Mobile-first, i18n, A11y, SEO.
- **Backend:** Node/NestJS (oder Django/Spring), REST+OpenAPI, optional GraphQL, RBAC, Audit-Trail.
- **Datenbank:** PostgreSQL (OLTP), Redis (Queues/Caching), optional ClickHouse/BigQuery (Analytics).
- **Automations:** n8n (Worker + Webhook), getrennte Queues, Dead-Letter-Queue.
- **Storage:** S3-kompatibel (Dokumente, PDFs, Exporte).
- **Observability:** Logs strukturiert, Metriken (Prometheus/OpenTelemetry), Dashboards (Grafana), Alerts.
- **Infra:** Docker Compose (dev), IaC (Terraform) für prod, CI/CD (GitHub Actions).

---

## 3) Datenmodell (Kern-Entitäten, minimal)

- **Contact(Person/Org)**: name, birthdate, email, phone, address\*, gdpr_flags, consents[].
- **Membership**: contact_id, type (ordentlich/außerordentlich/ehren), status, start_date, end_date, fee_category (standard/ermäßigt/härtefall).
- **Contribution**: id, contact_id, amount_gross, amount_net, fee, tax_rate, financial_type (Mitgliedsbeitrag/Spende/Event), payment_instrument, currency, status, trxn_id (PSP), booked_at.
- **ContributionRecur**: schedule (monthly/quarterly/yearly), psp_subscription_id/mandate_id, next_charge_at, status.
- **Invoice**: number, contribution_id, pdf_url, due_date, paid_at, dunning_level.
- **SEPA Mandate**: mandate_id, iban, bic, creditor_id, signature_date, status.
- **Campaign/Fund** (Spendenzwecke): code, title, cost_center.
- **Ledger/Journal** (Buchhaltung): journal_entries[] (double-entry: debit, credit, account, amount, ref_id).
- **Forum**: topics, posts, tags, roles (moderator/member).
- **AuditLog**: actor, action, entity, before/after, ts, ip.

> **Hinweis:** Alle Entitäten mit `created_at`, `updated_at`, `version` (optimistic locking). DSGVO-relevant markieren.

---

## 4) Zahlungsarten (konkret & vollständig)

- **Bank:** Überweisung (IBAN), **EPS** (AT), **Sofort/Klarna**.
- **SEPA**: Lastschrift/Dauerauftrag (Mandat, Gläubiger-ID), wiederkehrend.
- **Debitkarte:** Maestro / Visa Debit / Mastercard Debit.
- **Kreditkarte:** Visa/Mastercard/Amex via PSP (Stripe/Mollie/Adyen).
- **Wallets:** PayPal, Apple Pay, Google Pay.
- **Physisch:** POS (SumUp/Zettle), Bar (nur Ausnahmesituationen, Quittungspflicht).
- **Mapping:** Jede Zahlart = eigenes `payment_instrument_id` + Konto/Kostenstelle in der Buchhaltung.

---

## 5) Buchhaltung (maximal robust)

- **Kontenplan & Financial Types**: Mitgliedsbeiträge, Spenden, Gebühren, Skonti, Rundungsdifferenzen, zweckgebundene Mittel (Fonds).
- **Double-Entry-Posting** (Journal):
  - Bei Zahlung: **Bank/Kasse an Erlöse** (ggf. Gebührenkonto, Tax-Split).
  - Bei Gebühren (Stripe/PayPal): **Gebührenkonto** buchen, Netto vs. Brutto klar trennen.

- **Rechnungswesen**: Rechnung/Belegnummernkreis, Zahlziel, Mahnstufen (M1/M2/M3), Storno/Gutschrift.
- **Steuer**: Standardfall Verein ohne USt – **aber** Tax-Engine konfigurierbar (USt-Satz, innergemeinschaftlich, Reverse Charge).
- **Abgleich**: Bank-CSV Import, automatische Zuordnung via `trxn_id`, Betrag, Verwendungszweck, Fuzzy-Match.
- **Exporte**: CSV/XLSX, DATEV-ähnliches CSV, Standard-Buchungsjournal, Spendenauswertung je Kampagne.
- **Reporting/BI**: Deckungsbeiträge, Spenden pro Kampagne, Mitgliederwachstum, Ausfallquoten, Aging-Liste für offene Posten.

---

## 6) Web-Oberflächen

### Öffentlicher Bereich

- **Mitglied werden** (Beitritt), **Spenden** (einmalig/wiederkehrend), **Statuten**, **Beitragsordnung**, **Transparenz** (Mittelverwendung).
- **A11y/SEO** strikt; Performance-Budgets (mobil): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

### Mitgliederbereich

- Profil/Adresse/Bank aktualisieren, Mitgliedsstatus, Zahlungen/Belege, Abos verwalten (Pause/Kündigen), DSGVO-Self-Service (Export/Löschung), Forum-Zugang.

### Admin-Bereich

- Dashboard (KPIs: aktive Mitglieder, MRR aus Beiträgen, Spenden heute/Monat, offene Posten, Mahnstufen),
- **Buchhaltung**: Journal, Belege, Abgleich, Exporte, Periodenabschluss,
- **CRM**: Mitgliederpflege, Aufnahmeanträge, Rollen/RBAC,
- **Automation Monitor**: n8n-Runs, DLQs, Retrys, manuelle Replays.

---

## 7) n8n-Automatisierungen (Workflows – Blaupause)

**Designprinzipien:** Idempotenz (dedup keys), Retries (exponentiell), DLQ, Alerting, Tracing-IDs.

1. **Mitgliedsaufnahme**

- Trigger: Form Submit (Webhook) → Validate → `contact.get/create` → `membership.create` (pending) → Zahlungsaufforderung (Mail) → Ticket für Vorstand (Review) → nach Freigabe: Status=active → Willkommensmail + Portalzugang.

2. **Beitragslauf (wiederkehrend)**

- Trigger: CRON (monatlich) → hole aktive `ContributionRecur` → PSP-Charge (Stripe/SEPA) → `contribution.create` (pending) → Webhook-Listener (PSP) → Status Completed/Failed → Mail (Erfolg/Fehlschlag) → Journalbuchung.

3. **Spenden-Webhook**

- Trigger: Stripe/PayPal/EPS → Match `contact` → `contribution.create` → Belegmail (PDF) → Journalbuchung → BI-Event.

4. **Bank-CSV-Abgleich**

- Trigger: Upload/IMAP → Parse → Fuzzy-Match auf offene Posten → Auto-Zuordnung → „Unklare Posten“ in Queue → Benachrichtigung.

5. **Mahnwesen**

- Trigger: täglich → Fällige Rechnungen → M1/M2/M3 generieren → E-Mail mit PDF → Eskalation an Admin.

6. **DSGVO-Self-Service**

- Trigger: Portal Anfrage → Export (JSON/CSV, ZIP) → S3 link → E-Mail.
- Löschung: Soft-Delete + Anonymisierung + Protokoll (Freigabe zweistufig).

7. **Dokumente/Belege**

- Trigger: Contribution Completed → PDF-Generator → S3 → `invoice.update(pdf_url)` → Mail.

> **Monitoring:** Jeder Workflow sendet Logs/Metriken (Durchsatz, Fehlerquote, Latenz) + Alerts an Admin-Channel.

---

## 8) Sicherheit & Compliance

- **RBAC**: Rollen (Admin, Buchhaltung, Vorstand, Support, Mitglied). Least-Privilege.
- **AuthN/Z**: OIDC/OAuth2, MFA für Admins, Sitzungshärtung, CSRF-Schutz.
- **DSGVO**: Explizite Einwilligungen (DSGVO, Statuten, Beitragsordnung) versioniert mit Timestamp/IP; Aufbewahrungsfristen; Datenminimierung.
- **Audit-Trail** lückenlos (CRUD, Exporte, Löschungen).
- **Secrets**: nur in Vault/Secrets Manager; niemals im Repo.
- **Backups**: PITR für DB, Versionierung für S3, Disaster-Recovery-Runbook.

---

## 9) Tests & Qualitätssicherung

- **Unit**: Validierung (Zod/Yup), Mapper, Buchungslogik, Webhook-Parser.
- **Integration**: Endpunkte, DB-Transaktionen, Zahlungsflüsse (Sandbox).
- **E2E (Playwright)**: Beitritt, Spende (alle Zahlungsarten), Abo-Charge, Mahnwesen.
- **Visuelle Regression**: xs/md/lg-Screenshots der kritischen Seiten.
- **A11y (axe-core)**: keine „serious/critical“.
- **Lighthouse (mobil)**: Budgets enforced.
- **Security**: SAST/Dependency-Audit, Rate-Limit, Fuzzing der Webhooks.
- **CI/CD-Gates**: Build fail bei A11y-Fehler, Visual-Diff >1 %, Test-Fail, LCP/INP/CLS außerhalb Budget, Audit-High.

---

## 10) Dokumentation (immer, automatisch)

- **README** (Setup, Run, Test, Deploy),
- **ARCHITECTURE.md** (Diagramme, Datenflüsse),
- **API-Spex** (OpenAPI/GraphQL Schema),
- **DATA-MODEL.md** (ER-Diagramm, DSGVO-Felder),
- **RUNBOOKS** (Incidents, DR, On-Call),
- **SOPs** (Bank-CSV, Mahnwesen, Periodenabschluss),
- **SECURITY.md** (RBAC, Secrets, Compliance),
- **CHANGELOG/ADRs** (Entscheidungen),
- **AUTOMATION.md** (n8n-Workflows mit Screens & JSON-Exports).

> n8n-Workflows werden bei jeder Änderung exportiert (JSON) und versioniert; Commits automatisch mit Diff-Kommentar.

---

## 11) Konkrete Deliverables (jede Ausführung liefern)

1. **Architektur-Diagramm** (PNG + PlantUML/Mermaid)
2. **OpenAPI** (YAML/JSON) + Beispiel-Requests
3. **DB-Migrations** (Postgres) + Seed-Daten
4. **Frontend**: Seiten/Komponenten (Mitglied werden, Spenden, Portal, Admin, Dashboard) – HTML/JSX mit i18n/A11y/Selektoren
5. **Backend**: Controller/Services/Mapper/Policies + Tests
6. **Buchhaltung**: Kontenplan, Journal-Posting-Regeln, Exporte
7. **n8n**: Workflow-JSONs (7 Kernflows), Env-Template, Alerts
8. **PDF-Vorlagen**: Rechnung/Beleg/Mahnung (MJML/HTML → PDF)
9. **Scripts**: Bank-CSV Import, Reconciliation, Report-Generator
10. **CI/CD**: Pipelines (Lint, Test, Build, E2E, A11y, Visual, Deploy)
11. **Doku-Bundle** (alle Kapitel oben) + **Checkliste** (✅/⚠️)

---

## 12) Abnahme-Checkliste (hart)

- ✅ **Recht & DSGVO:** Zustimmungen versioniert, Self-Service aktiv, Löschung/Export geprüft
- ✅ **Zahlungen:** alle vereinbarten Methoden lauffähig (Sandbox), PSP-Webhooks synchronisieren Status
- ✅ **Buchhaltung:** double-entry korrekt, Gebühren getrennt, Bankabgleich funktioniert, Exporte plausibel
- ✅ **Performance:** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 mobil
- ✅ **A11y:** axe-core ohne „serious/critical“
- ✅ **Sicherheit:** RBAC, MFA für Admins, Audit-Trail, Secrets sicher
- ✅ **Automationen:** n8n Flows idempotent, Retry/DLQ/Alerting aktiv
- ✅ **Tests:** Unit/Integration/E2E/Visual grün; CI-Gates enforced
- ✅ **Doku:** vollständig, aktuell, versioniert (inkl. n8n-JSON)

---

## 13) Prompt-Satz (zum direkten Einsatz)

> „Erzeuge die **vollständige Vereinsplattform** gemäß obiger Spezifikation für _Menschlichkeit Österreich_:
> – Frontend (öffentliche Seiten, Mitgliederportal, Admin-Konsole, Dashboard)
> – Backend (REST/OpenAPI, RBAC, Audit-Trail)
> – Datenbank (Postgres Schema & Migrations)
> – Buchhaltung (Kontenplan, Journal-Regeln, Exporte, Bankabgleich, Mahnwesen)
> – Zahlungen (Bank/SEPA/Debit/Kredit/EPS/Sofort/PayPal/Apple/Google/Pos/Bar, PSP-Webhooks)
> – n8n Workflows (7 Kernprozesse, Idempotenz/Retry/DLQ/Alerting)
> – Dokumentenvorlagen (Rechnung/Beleg/Mahnung)
> – CI/CD Pipelines mit harten Quality Gates
> – Vollständige Dokumentation inkl. RUNBOOKS, SOPs, SECURITY, DATA-MODEL, AUTOMATION.
> Liefere alle **Artefakte** (Code-Skeletons, YAML/JSON, Diagramme, Tests, n8n-Exports) so, dass `npm i && docker compose up` eine lauffähige Dev-Umgebung startet. Hänge die **Abnahme-Checkliste** an und bestätige die Kriterien automatisiert.“

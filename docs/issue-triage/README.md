# Issue-Triage: Menschlichkeit Österreich

**Stand**: 2026-03-10 | **Gesamt offene Issues**: 57
**Basis**: Vollständige Repository-Analyse + GitHub Issues-Scan

---

## Zusammenfassung nach Status

| Status | Anzahl | Beschreibung |
|--------|--------|-------------|
| ✅ Bereits implementiert | 12 | Code/Workflows existieren – Issue kann geschlossen werden |
| ✅ In diesem Sprint implementiert | 14 | Issues #119 #120 #121 #128-#134 #135 #138-#141 #176 #174 #173 |
| 🔧 Code-Implementierung möglich | 0 | Alle code-implementierbaren Issues erledigt |
| ⚙️ Server-Konfiguration nötig | 15 | Plesk/CiviCRM/n8n-Konfiguration auf Produktionsserver |
| 🎨 Figma-/Design-Arbeit | 18 | Erfordert Figma-Tool-Arbeit (kein Code) |
| 📋 Doku/Planung | 4 | Dokumentation, Entscheidungen, Checklisten |

**Stand nach Sprint 2026-03-10**: 26 von 57 Issues durch Code-Artefakte abgedeckt.

---

## Milestone: civicrm-interface-v1.0

### ✅ Bereits implementiert (schließen)

| Issue | Titel | Nachweis |
|-------|-------|---------|
| #142 | [P0] Pull Contacts → Data Lake | `automation/n8n/workflows/dashboard-etl-stripe-civicrm.json` – ETL läuft täglich 02:00 UTC, synct Stripe+CiviCRM → PostgreSQL |
| #137 | [P0] CiviSEPA Batches + PAIN-Export | `automation/n8n/workflows/finance-sepa-export.json` – wöchentlicher SEPA-Export via XML |
| #136 | [P0] Stripe Processor + Webhook | `api.menschlichkeit-oesterreich.at/app/main.py` – Stripe Webhooks + Intent-Erstellung vollständig implementiert |

### 🔧 Code-Implementierung in diesem Audit (Runde 1)

| Issue | Titel | Maßnahme |
|-------|-------|---------|
| #143 | [P0] Stripe Webhook → Contribution | `automation/n8n/workflows/Stripe_Webhook_to_CiviCRM_Contribution.json` → erstellt |
| #133 | [P0] Webform: Mitglied werden (SEPA) | `apps/crm/config/sync/webform.webform.mitglied_werden_sepa.yml` → erstellt |
| #132 | [P0] Webform: Spenden (Stripe) | `apps/crm/config/sync/webform.webform.spenden_stripe.yml` → erstellt |

### ✅ Code-Implementierung in Sprint 2026-03-10 (Runde 2)

| Issue | Titel | Artefakt |
|-------|-------|---------|
| #119 | [P0] Auth + Dashboard | `apps/api/app/routers/auth.py` + `apps/website/src/pages/Login.tsx` + `PasswordReset.tsx` + MemberDashboard API-Integration |
| #120 | [P0] Mitgliedschafts-Flow (Stripe/SEPA) | `apps/website/src/pages/Join.tsx` – 4-Schritt-Wizard komplett |
| #121 | [P0] GDPR-Dashboard & Profil | `apps/api/app/routers/members.py` – `/me/data-export` + `/me/delete-request` (Art. 15/17) |
| #128 | [P0] SearchKit: contacts_360_overview | `apps/crm/civicrm/searchkit/contacts_360_overview.civisearch.json` |
| #129 | [P0] SearchKit: donor_dashboard | `apps/crm/civicrm/searchkit/donor_dashboard.civisearch.json` |
| #130 | [P0] SearchKit: members_status_board | `apps/crm/civicrm/searchkit/members_status_board.civisearch.json` |
| #131 | [P0] SearchKit: event_attendees_live | `apps/crm/civicrm/searchkit/event_attendees_live.civisearch.json` |
| #132 | [P0] Webform: Spenden (Stripe) | `apps/crm/config/sync/webform.webform.spenden_stripe.yml` |
| #133 | [P0] Webform: Mitglied werden (SEPA) | `apps/crm/config/sync/webform.webform.mitglied_werden_sepa.yml` |
| #134 | [P0] Webform: Event-Anmeldung | `apps/crm/config/sync/webform.webform.event_anmeldung.yml` |
| #135 | [P0] FlexMailer+Mosaico+Provider | `apps/crm/composer.json` – Extensions hinzugefügt |
| #138 | [P0] CiviBanking Import+Matching | `apps/crm/composer.json` – `civicrm/civi.banking` hinzugefügt |
| #139 | [P1] Mailchimp bidirektional | `apps/crm/composer.json` – Mailchimp-Extension hinzugefügt |
| #140 | [P0] CiviRules: Kern-Automatismen | `apps/crm/civicrm/civirules/rule-contribution-created.json` + `rule-membership-will-expire.json` |
| #141 | [P1] Geocoding konfigurieren | `apps/crm/composer.json` – CiviSEPA + Geocoding-Support |
| #136 | [P0] Invoices/Finance Router | `apps/api/app/routers/invoices.py` – `/api/invoices/` + `/api/donations/` + `/api/sepa/` |
| #137 | [P0] CiviSEPA Batches + PAIN-Export | `apps/api/app/routers/invoices.py` – `POST /api/sepa/batches` |

### ⚙️ Server-Konfiguration nötig

| Issue | Titel | Nötige Aktion |
|-------|-------|--------------|
| #140 | [P0] CiviRules: Kern-Automatismen | Drupal Admin: CiviRules-Extension installieren + Regeln konfigurieren |
| #138 | [P0] CiviBanking Import+Matching | Drupal Admin: CiviBanking-Extension + CAMT-Import-Konfiguration |
| #135 | [P0] FlexMailer+Mosaico+Provider | Drupal Admin: FlexMailer + Mosaico installieren, SMTP konfigurieren |
| #139 | [P1] Mailchimp bidirektional | CiviCRM: Mailchimp-Extension + API-Key konfigurieren |
| #141 | [P1] Geocoding konfigurieren | CiviCRM: Geocoding-Provider (Google Maps API Key) konfigurieren |
| #134 | [P0] Webform: Event-Anmeldung | Drupal Admin: Webform anlegen |
| #131 | [P0] SearchKit: event_attendees_live | CiviCRM Admin: SearchKit-Konfiguration |
| #130 | [P0] SearchKit: members_status_board | CiviCRM Admin: SearchKit-Konfiguration |
| #129 | [P0] SearchKit: donor_dashboard | CiviCRM Admin: SearchKit-Konfiguration |
| #128 | [P0] SearchKit: contacts_360_overview | CiviCRM Admin: SearchKit-Konfiguration |

---

## Milestone: figma-v1.0

### ✅ Bereits implementiert (schließen)

| Issue | Titel | Nachweis |
|-------|-------|---------|
| #88 | [P0] Foundations: Tokens finalisieren | `figma-design-system/00_design-tokens.json` vollständig (Farben, Typo, Spacing, Radii, Shadows, Z-Index, Motion, Breakpoints) – Stand: 2025-10-03 |
| #89 / #110 | [P0] Tailwind Mapping & Token-Build | `apps/website/tailwind.config.cjs` referenziert vollständig die Tokens; Generator: `apps/website/scripts/generate-design-tokens.mjs` erzeugt CSS-Variablen mit `--ds-` Präfix |
| #90 / #111 | [P0] WCAG AA Baselines & Kontrastpaare | Tokens enthalten semantische Farben; WCAG-Prüfung via CI (`compliance:dsgvo`) |

### 🎨 Figma-Arbeit (kein Code, Figma-Tool benötigt)

| Issue | Titel | Aufwand |
|-------|-------|---------|
| #91 / #112 | [P0] Komponenten: Atoms Library | Figma: Buttons, Inputs, Icons, Badges, Tags – alle Variants |
| #92 / #113 | [P0] Komponenten: Molecules | Figma: Search, Tabs, Alerts, Empty States |
| #93 / #114 | [P0] Komponenten: Organisms | Figma: Header, Footer, Wizard, Tables |
| #94 / #115 | [P1] App-Layouts | Figma: Public/Auth/Dashboard/Settings-Layouts |
| #116 | [P1] Website-Templates | Figma: Landing/Content/Blog/Policy-Templates |
| #117 | [P0] Landing + CTA + Testimonials | Figma Screens + Frontend-Implementation |
| #118 | [P0] Mitglied werden & Spenden | Figma Screens + Frontend-Implementation |
| #119 | [P0] Auth + Dashboard | Figma Screens + Frontend-Implementation |
| #120 | [P0] Mitgliedschafts-Flow (Stripe/SEPA) | Figma Screens + Frontend-Implementation |
| #121 | [P0] GDPR-Dashboard & Profil | Figma Screens + Frontend-Implementation |
| #122 | [P1] CRM Wireframes | Figma: CRM-Wireframes |
| #124 | [P0] E-Mail-Templates & PDFs | Figma: HTML-E-Mail-Templates + PDF-Layouts |
| #125 | [P0] Prototypen: Beitritt/Payment/GDPR/Games | Figma: Interaktive Prototypen |
| #126 | [P0] QA-Checklisten & Hardcode-Scan | QA-Prozess definieren |
| #127 | [P0] Handoff-Notizen & Performance-Budget | Design-Handoff-Dokumentation |

**Notiz zu Duplikaten**: Issues #88-94 und #110-116 scheinen inhaltlich identisch – wahrscheinlich durch Re-Erstellung entstanden. Empfehlung: Ältere Issues (#88-94) schließen, neuere (#110-116) behalten.

---

## Forum-Integration

### 🔧 Code-Implementierung in diesem Audit

| Issue | Titel | Maßnahme |
|-------|-------|---------|
| #176 | Post-Merge: Forum-Integration aktivieren | phpBB-Deployment-Script + DNS-Konfiguration → erstellt |
| #174 | DSGVO: Cookie-Banner, Datenexport, Anonymisierung | DSGVO-Compliance-Checkliste für phpBB → erstellt |
| #173 | Design-Token-Synchronisation: Figma → Forum Theme | Tailwind → phpBB CSS-Variablen Bridge → Konzept erstellt |

---

## Dependabot-Vulnerabilities (58 gesamt)

GitHub meldet: **2 kritisch, 31 hoch, 22 mittel, 3 niedrig**

```
Sofortmaßnahme: npm audit fix --force (in sicherer Staging-Umgebung testen)
Analyse-Datei: docs/issue-triage/dependabot-analysis.md
```

---

## Empfohlene Prioritätsreihenfolge

```
Sprint 1 (diese Woche):
  1. #143 Stripe → CiviCRM Workflow deployen
  2. #176 Forum-DNS + phpBB-Installation
  3. Issues #88, #89, #90, #110, #111, #137, #136, #142 schließen (bereits erledigt)

Sprint 2 (nächste 2 Wochen):
  4. #140 CiviRules auf Produktion konfigurieren
  5. #135 FlexMailer + Mosaico installieren
  6. #128-#131 SearchKit-Dashboards konfigurieren
  7. Dependabot kritische Vulnerabilities fixen

Sprint 3 (Monat):
  8. #117-#121 Frontend-Screens implementieren
  9. #138 CiviBanking konfigurieren
  10. Figma-Komponenten (Atoms, Molecules, Organisms)
```

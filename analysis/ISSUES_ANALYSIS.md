# Issues-Analyse: Menschlichkeit-Osterreich

**Stand:** 2025-01 | **Gesamt offen:** 140 Issues | **Generiert via:** Speckit Analyse

---

## Übersicht nach Kategorie

| Kategorie | Issues | Nummern |
|---|---|---|
| Design-System & Figma | 3 | #109–#111 |
| Figma Komponenten | 3 | #112–#114 |
| Templates & Screens | 11 | #115–#123, #125 |
| CiviCRM Interface & n8n | 17 | #124, #128–#143 |
| Forum | 4 | #173–#176 |
| CRM/Infra unlabeled | 1 | #321 |
| Backlog Legacy | 8 | #335–#342 |
| Donation Masterplan | 11 | #343–#353 |
| n8n Gate Spec | 26 | #354–#379 |
| Speckit Multi-App | 20 | #380–#399 |
| Speckit Repo-Wide | 30 | #400–#429 |
| Secrets Governance | 6 | #430–#435 |

---

## Kategorie 1: Design-System & Figma (P0 — milestone/figma-v1.0)

> Blockiert Frontend-Implementierung. Muss als erstes abgeschlossen sein.

| # | Titel | Prio |
|---|---|---|
| #109 | Foundations: Tokens (inkl. Motion) finalisieren | P0 |
| #110 | Tailwind Mapping & Token-Build (npm run tokens) | P0 |
| #111 | WCAG AA Baselines & Kontrastpaare | P0 |
| #112 | Komponenten: Atoms Library (alle Variants) | P0 |
| #113 | Komponenten: Molecules (Search, Tabs, Alerts, Empty) | P0 |
| #114 | Komponenten: Organisms (Header, Footer, Wizard, Table) | P0 |
| #115 | App-Layouts (Public/Auth/Dashboard/Settings) | P1 |
| #116 | Website-Templates (Landing/Content/Blog/Policy) | P1 |

---

## Kategorie 2: Screens & Flows (P0/P1 — milestone/figma-v1.0)

| # | Titel | Prio |
|---|---|---|
| #117 | Landing + CTA + Testimonials | P0 |
| #118 | Mitglied werden & Spenden | P0 |
| #119 | Auth + Dashboard | P0 |
| #120 | Mitgliedschafts-Flow (Stripe/SEPA) | P0 |
| #121 | GDPR-Dashboard & Profil | P0 |
| #122 | CRM Wireframes (Mitglieder/Beiträge/Mahnwesen) | P1 |
| #123 | Games-Hub, Achievements, Leaderboard | P2 |
| #124 | E-Mail-Templates (5 Kernfälle) & PDFs | P0 |
| #125 | Prototypen: Beitritt/Payment/GDPR/Games | P0 |
| #126 | QA-Checklisten & Hardcode-Scan | P0 |
| #127 | Handoff-Notizen & Performance-Budget | P0 |

---

## Kategorie 3: CiviCRM Interface (P0 — milestone/civicrm-interface-v1.0)

| # | Titel | Prio |
|---|---|---|
| #128 | SearchKit: contacts_360_overview | P0 |
| #129 | SearchKit: donor_dashboard | P0 |
| #130 | SearchKit: members_status_board | P0 |
| #131 | SearchKit: event_attendees_live | P0 |
| #132 | Webform: Spenden (Stripe) | P0 |
| #133 | Webform: Mitglied werden (SEPA) | P0 |
| #134 | Webform: Event-Anmeldung | P0 |
| #135 | FlexMailer+Mosaico+Provider | P0 |
| #136 | Stripe Processor + Webhook | P0 |
| #137 | CiviSEPA Batches + PAIN-Export | P0 |
| #138 | CiviBanking Import+Matching | P0 |
| #139 | Mailchimp bidirektional | P1 |
| #140 | CiviRules: Kern-Automatismen | P0 |
| #141 | Geocoding konfigurieren | P1 |
| #142 | Pull Contacts → Data Lake | P0 |
| #143 | Stripe Webhook → Contribution | P0 |

---

## Kategorie 4: Forum (Post-Merge / DSGVO)

| # | Titel | Labels |
|---|---|---|
| #173 | Design-Token-Synchronisation: Figma → Forum Theme | enhancement, forum |
| #174 | DSGVO-Compliance: Cookie-Banner, Datenexport, Anonymisierung | compliance, dsgvo |
| #176 | Post-Merge: Forum-Integration aktivieren | deployment, infrastructure |

---

## Kategorie 5: CRM/Infra Unlabeled

| # | Titel | Labels |
|---|---|---|
| #321 | crm: harmonize local Drupal/MySQL TLS handling | (kein Label — assign: area/crm, P1) |

**Empfehlung:** Label `area/crm`, `P1` hinzufügen.

---

## Kategorie 6: Backlog Legacy (T-Serie)

> Altlasten — wichtig, aber nicht kritisch blockierend.

| # | Titel | Effort |
|---|---|---|
| #335 | T-005: Bildoptimierung Website (WebP/AVIF + LazyLoad) | M |
| #336 | T-006: Website Lighthouse CI einführen | S |
| #337 | T-007: API Endpunkte ergänzen (Register/Refresh/GET/PUT) | L |
| #338 | T-010: Python Requirements konsolidieren | S |
| #339 | T-011: Drupal/CiviCRM Security Review & Updates | M |
| #340 | T-012: CI/CD für Frontend & Website ergänzen | M |
| #341 | T-014: React-Migration: Login & Member-Area portieren | M |
| #342 | T-018: CI-Workflows bereinigen (Dead Paths & Flakes) | S |

---

## Kategorie 7: Donation Masterplan (T-Serie)

> Governance, Backup, Service-Map.

| # | Titel |
|---|---|
| #343 | T024: Stripe-Webhook-Validierungsworkflow |
| #344 | T027: Retry- und Fehlervertragsregeln |
| #345 | T036: Compliance-Validierungsjob |
| #346 | T037: Governance-Review-Template |
| #347 | T039: Freigabeprozess-Dokumentation |
| #348 | T040: Backup-Plan VM/DB/Volumes |
| #349 | T041: Backup-Ausführungsskript |
| #350 | T042: Restore-Test-Skript |
| #351 | T043: Restore-Test-CI-Workflow |
| #352 | T052: Service-Map produktive Komponenten |
| #353 | T053: Architekturdiagramm mit Betriebsgrenzen |

---

## Kategorie 8: n8n Gate Spec (#354–#379)

26 Tasks T001–T026 für `scripts/validate-n8n-workflows.mjs` und CI-Gate.
Label: `spec/n8n-gate` | Status: `status/planned`

---

## Kategorie 9: Speckit Multi-App (#380–#399)

20 Tasks A001–X005 für Cross-App-Koordination.
Label: `spec/speckit-multiapp` | Status: `status/planned`

---

## Kategorie 10: Speckit Repo-Wide (#400–#429)

30 Tasks R001–Z304 für Repository-weite Orchestrierung.
Label: `spec/speckit-repowide` | Status: `status/planned`

---

## Kategorie 11: Secrets Governance (#430–#435)

6 Tasks für Secret-Management (Klassifizierung, Rotation, Infra, Zugriff, Workflows, Notfall).
Labels: `spec/secrets-governance`, `area/secrets`

---

## Infrastruktur-Mapping

### Plesk Host (5.183.217.146 / peter_schuller)

Deployed / geplant auf Plesk:

| App | Port | Status |
|---|---|---|
| Website (React/Vite Build) | 5173 (dev) | Plesk vHost |
| CRM (Drupal 10 + CiviCRM) | 8000 (dev) | Plesk → Apache/PHP |
| Forum (phpBB) | 8002 (dev) | Plesk → Apache/PHP |

### Azure devmoe (20.91.246.245 / azureuser / devmoelaptop.pem)

Deployed / geplant auf Azure:

| App | Port | Status |
|---|---|---|
| API (FastAPI) | 8001 | Docker/Container |
| Games (Next.js + Babylon.js) | 3001 | Docker/Container |
| n8n Automation | 5678 | Docker/Container |

---

## Optimierungsempfehlungen

1. **Issue #321** (CRM TLS): Labels `area/crm`, `P1` hinzufügen → verhindert Verlust im Backlog
2. **Kategorie 6 Legacy**: Sprint-Kandidaten für Wave B — #336, #338, #342 (kleine Effort-S Issues)
3. **n8n Gate #354–#379**: Als aktiver Sprint-Block nach Inventar-Setup priorisieren
4. **Speckit Repowide #400–#429**: R001–R004 sind Voraussetzung für alle anderen Speckit-Streams
5. **Secrets Governance #430–#435**: Parallel zu Speckit Repowide umsetzbar (Phase 8 in tasks.md)

---

## Nächste Schritte (Speckit)

- [ ] INFRA-001: Plesk SSH-Connectivity-Check (5.183.217.146, peter_schuller)
- [ ] INFRA-002: Plesk App-Deployment-Verifikation (CRM, Website, Forum)
- [ ] INFRA-003: Plesk Speckit-Workflow-Integration
- [ ] AZURE-001: Azure devmoe Connectivity-Check (20.91.246.245, azureuser)
- [ ] AZURE-002: Docker-Compose auf devmoe deployen (API + Games + n8n)
- [ ] AZURE-003: Azure Container-Health-Monitoring einrichten

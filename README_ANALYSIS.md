# Plattform-Gesamtanalyse: Menschlichkeit Österreich

**Version:** 1.0.0  
**Stand:** 12. März 2026  
**Erstellt durch:** Plattform-Audit (automatisiert + manuell)

---

## Zusammenfassung

Das Monorepo umfasst **5 Dienste** (React-SPA, FastAPI, Drupal+CiviCRM, Demokratie-Spiel, statische Website), **25+ n8n-Workflows**, **100+ Figma-Designkomponenten**, **50+ CI/CD-Workflows** und **366+ Dokumentationsdateien**. Der aktive Entwicklungsfokus liegt auf der React-SPA (`apps/website/`). Backend-API, CRM und Infrastruktur sind teil-implementiert, viele Bereiche nutzen Mock-Daten.

### Status-Übersicht

| Bereich | Status | Details |
|---------|--------|---------|
| React-SPA (Frontend) | **Funktional** | 99 TSX/TS-Dateien, 16 öffentliche + 11 Admin-Routen, Live auf Port 5000 |
| FastAPI (Backend) | **Teil-implementiert** | Health-Endpunkte live, Services als Module vorhanden, kein DB-Betrieb |
| CRM (Drupal+CiviCRM) | **Docker-Config vorhanden** | Docker-Compose definiert, nicht deployed |
| Demokratie-Spiel | **Funktional** | 102 Dateien, HTML/JS PWA, eingebettet via `/spiel` |
| Statische Website | **Veraltet** | 39 Dateien in `website/`, durch React-SPA ersetzt |
| Governance-Normalisierung | **Abgeschlossen** | Alle Texte gegen Statuten/VR/Beitragsordnung abgeglichen |
| Deployment-Infrastruktur | **Konfiguriert** | rsync zu Plesk, GitHub Actions CI/CD |
| Dokumentation | **Umfangreich** | 366 Markdown-Dateien, teilweise veraltet/redundant |

---

## 1. React-Frontend (`apps/website/`)

### 1.1 Architektur
- **Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS + React Router 7
- **Zusätzliche Deps:** Stripe, PayPal, Recharts, Framer Motion, Lucide Icons
- **Port:** 5000 (Vite Dev Server, `allowedHosts: true`)
- **Design-Tokens:** Aus `figma-design-system/00_design-tokens.json`, Primärfarbe: Rot (#dc2626)

### 1.2 Routen (27 total)

**Öffentliche Routen (16)** — PublicLayout (NavBar + Footer):
| Route | Seite | Status |
|-------|-------|--------|
| `/` | Home (Hero + Stats + Themenkarten) | Funktional |
| `/ueber-uns` | Über uns | Funktional |
| `/statuten` | Statuten (normalisiert) | Funktional |
| `/beitragsordnung` | Beitragsordnung (normalisiert) | Funktional |
| `/veranstaltungen` | Veranstaltungen | Funktional |
| `/bildung` | Bildungsmaterialien | Funktional |
| `/materialien` | Materialien | Funktional |
| `/mitglied-werden` | Beitrittsformular (CiviJoinForm) | Funktional (Mock-Backend) |
| `/spenden` | Spendenseite (Stripe/PayPal) | Funktional (Client-only) |
| `/erfolg` | Erfolgsbestätigung | Funktional |
| `/spiel` | Demokratiespiel Landing + Embed | Funktional |
| `/kontakt` | Kontaktformular (mailto-Fallback) | Funktional |
| `/impressum` | Impressum (normalisiert) | Funktional |
| `/datenschutz` | Datenschutzerklärung (normalisiert) | Funktional |
| `/login` | Login (JWT-basiert) | Funktional |

**Mitglieder-Routen (4)** — ProtectedRoute + DashboardLayout:
| Route | Seite | Status |
|-------|-------|--------|
| `/member` | Mitgliederbereich | Mock-Daten |
| `/member/dashboard` | Mitglieder-Dashboard | Mock-Daten |
| `/member/onboarding` | Onboarding-Wizard | Mock-Daten |
| `/member/profil` | Profil | Mock-Daten |

**Admin-Routen (11)** — ProtectedRoute + DashboardLayout:
| Route | Seite | Status |
|-------|-------|--------|
| `/admin` | Admin-Dashboard (KPIs, Aktivitäten) | Mock-Daten |
| `/admin/vorstand` | Vorstand/Kassier-Dashboard | Mock-Daten |
| `/admin/members` | Mitgliederverwaltung (CiviCRM-UI) | Mock-Daten |
| `/admin/finanzen` | Finanzen (Einnahmen, Ausgaben, SEPA) | Mock-Daten |
| `/admin/events` | Veranstaltungsverwaltung | Mock-Daten |
| `/admin/newsletter` | Newsletter-Verwaltung | Mock-Daten |
| `/admin/dsgvo` | DSGVO-Dashboard | Mock-Daten |
| `/admin/reports` | Berichte | Mock-Daten |
| `/admin/settings` | Vereinseinstellungen | Mock-Daten (normalisiert) |
| `/admin/queue` | Admin-Warteschlange | Mock-Daten |
| `/account/privacy` | Datenschutz-Einstellungen | Funktional |

### 1.3 Komponenten (42 TSX-Dateien)

| Verzeichnis | Komponenten | Status |
|-------------|-------------|--------|
| `components/ui/` | Alert, Badge, Breadcrumb, Button, Card, Input, Navigation, PageHeader | Vollständig |
| `components/members/` | CiviJoinForm, CiviMemberManagement, MemberDetail, MemberList | Funktional (normalisiert) |
| `components/ai/` | OpenClawChat | Funktional (Fallback-Responses) |
| `components/auth/` | AuthSystem | Mock-System (3 Testbenutzer) |
| `components/community/` | EventsList, NewsletterSignup | Funktional |
| `components/dashboard/` | KpiCard, TrendChart | Mock-Daten |
| `components/figma/` | Footer, WebsiteLayout.example + Stories | Funktional (normalisiert) |
| `components/privacy/` | PrivacyCenter | Funktional |
| `components/security/` | SecurityDashboard | Mock-Daten |
| `components/seo/` | JsonLdHome | Funktional (normalisiert) |
| `components/sepa/` | SepaManagement + Test | Funktional |
| `layouts/` | PublicLayout, AuthLayout, DashboardLayout, SettingsLayout | Funktional |

### 1.4 Authentifizierung & Autorisierung

| Aspekt | Ist-Zustand | Bewertung |
|--------|-------------|-----------|
| JWT-Speicherung | `sessionStorage` unter `moe_auth_token` | OK |
| Admin-Check | Clientseitig via `VITE_ADMIN_EMAILS` | **P0-Sicherheitsrisiko** |
| GitHub-Token | `VITE_GITHUB_TOKEN` in `AdminOpenClaw.tsx` | **P0-Sicherheitsrisiko** |
| Rollen | guest, member, moderator, admin, sysadmin | Definiert, nicht backend-enforced |
| Auth-Flow | Login → JWT → sessionStorage → ProtectedRoute | Funktional |

---

## 2. FastAPI-Backend (`apps/api/`)

### 2.1 Primäre API (`apps/api/app/`)
| Endpunkt | Funktion | Status |
|----------|----------|--------|
| `GET /healthz` | Liveness-Check | **Live** |
| `GET /readyz` | Readiness-Check | **Live** |
| `GET /api/version` | API-Version | **Live** |
| `GET /metrics` | Prometheus-Metriken | Implementiert |

### 2.2 Sekundäre API (`api.menschlichkeit-oesterreich.at/app/`)
Vollständigere FastAPI-Instanz mit CiviCRM-Integration:
| Endpunkt | Funktion | Status |
|----------|----------|--------|
| `POST /auth/login` | JWT-Login via CiviCRM | Implementiert |
| `POST /auth/register` | Registrierung | Implementiert |
| `POST /auth/refresh` | Token-Refresh | Implementiert |
| `GET /user/profile` | Profil lesen | Implementiert |
| `PUT /user/profile` | Profil aktualisieren | Implementiert |
| `POST /contacts/create` | CiviCRM-Kontakt erstellen | Implementiert |
| `GET /contacts/search` | Kontakte suchen | Implementiert |
| `GET /contacts/{id}` | Kontaktdetails | Implementiert |

### 2.3 Service-Module (`apps/api/src/`)
| Modul | Dateien | Status |
|-------|---------|--------|
| `auth/rbac.py` | Rollenbasierte Zugriffssteuerung | Implementiert |
| `crm/civi_service.py` | CiviCRM-Abstraktionsschicht | Implementiert |
| `finance/invoice_service.py` | Rechnungen, Mahnungen, Quittungen | Implementiert (normalisiert) |
| `finance/accounting_service.py` | Buchhaltung | Implementiert |
| `finance/pdf_generator.py` | PDF-Generierung | Implementiert |
| `finance/models.py` | Finanz-Datenmodelle | Implementiert |
| `monitoring/service.py` | Monitoring-Service | Implementiert |
| `notifications/newsletter_service.py` | Newsletter | Implementiert |
| `services/social_media.py` | Social-Media-Integration | Implementiert |

### 2.4 Bewertung
- **Datenbank:** Kein aktiver DB-Betrieb im Entwicklungsumfeld (Docker-basiert: PostgreSQL 16 + Redis 7)
- **CiviCRM-Abhängigkeit:** API erwartet laufende CiviCRM-Instanz (`CIVICRM_BASE_URL`, `CIVICRM_API_KEY`)
- **Zwei API-Codebasen:** `apps/api/` und `api.menschlichkeit-oesterreich.at/` — sollten konsolidiert werden

---

## 3. CRM (`apps/crm/`)

| Aspekt | Status |
|--------|--------|
| Docker-Compose | Definiert (MariaDB 10.11 + Drupal 10 + Nginx) |
| Drupal 10 | Dockerfile vorhanden, nicht deployed |
| CiviCRM | Konfiguriert als Erweiterung, nicht aktiv |
| Datenbank | `menschlichkeit_crm` Schema definiert |
| Deployment | Lokal via Docker, Produktion via Plesk unklar |

---

## 4. Demokratie-Spiel (`apps/game/`)

| Aspekt | Details |
|--------|---------|
| Typ | HTML/JS Progressive Web App |
| Dateien | 102 Dateien (JS, CSS, HTML, Assets) |
| Kernmodule | `game.js`, `scenarios.js`, `metaverse-core.js`, `analytics.js` |
| Spezialmodule | Multiplayer (WebRTC), Teacher-Dashboard, A/B-Testing, Educational-Analytics |
| PWA | `manifest.json` + `sw.js` (Service Worker) |
| Integration | Eingebettet via `/spiel`-Route (iframe-Modal mit Sandbox/Focus-Trap) |
| 3D-Grafik | `game-graphics.js`, `Enhanced3DGameGraphics.tsx` (Figma-Komponente) |
| Status | **Funktional** als eigenständige Anwendung |

---

## 5. Figma-Design-System (`figma-design-system/`)

| Aspekt | Details |
|--------|---------|
| Design-Tokens | `00_design-tokens.json` (Primärfarbe: #dc2626) |
| Komponenten | **100 TSX-Dateien** in `components/` |
| Nutzung | Nur `Footer.tsx` und Design-Tokens aktiv im Frontend genutzt |
| Übrige Komponenten | 99 Komponenten nicht in `apps/website/` integriert |
| Qualität | Umfangreiche Komponenten (Admin, Auth, Community, Game, Forum, etc.) |
| Empfehlung | Migration der besten Komponenten in `apps/website/src/components/` priorisieren |

### Nicht-integrierte Figma-Komponenten (Auswahl)
- `AdminDashboard.tsx`, `AdminSettings.tsx` — Alternativen zu bestehenden Admin-Seiten
- `AuthSystem.tsx` — Umfangreiches Auth-System
- `CivicrmIntegration.tsx` — CRM-Integrations-UI
- `DemocracyGameHub.tsx`, `BridgeBuilding.tsx` — Spiel-Hubs
- `Forum.tsx` — Community-Forum
- `DonationManagement.tsx` — Spendenverwaltung
- `EventManagement.tsx` — Event-System
- `CookieConsent.tsx` — DSGVO-Cookie-Banner
- `ErrorBoundary.tsx` — Fehlerbehandlung

---

## 6. Statische Website (`website/`)

| Aspekt | Details |
|--------|---------|
| Dateien | 39 Dateien (HTML, CSS, JS) |
| Status | **Veraltet** — durch React-SPA (`apps/website/`) vollständig ersetzt |
| Inhalt | Landing-Page, Auth-Handler, Member-Area (Vanilla JS) |
| Empfehlung | Kann archiviert oder entfernt werden |

---

## 7. Veraltetes Frontend (`frontend/`)

| Aspekt | Details |
|--------|---------|
| Inhalt | `package.json` + `vite.config.ts` vorhanden, `src/` ist **leer** |
| Status | **Aufgegeben** — gesamte Entwicklung in `apps/website/` |
| Empfehlung | Kann entfernt werden |

---

## 8. n8n-Automatisierung (`automation/n8n/workflows/`)

**25 Workflow-Dateien** definiert:

| Kategorie | Workflows | Status |
|-----------|-----------|--------|
| **Finanzen** | `finance-donation-processing`, `finance-dunning`, `finance-invoicing`, `finance-membership-invoicing`, `finance-payment-confirmation`, `finance-sepa-export` | JSON-Definitionen |
| **CRM** | `crm-member-management`, `crm-sync-members` | JSON-Definitionen |
| **Kommunikation** | `onboarding-welcome-series`, `social-media-crosspost`, `events-reminder` | JSON-Definitionen |
| **DSGVO** | `right-to-erasure` (3 Varianten), `mail-archiver-logging` | JSON-Definitionen |
| **Infrastruktur** | `build-pipeline-automation`, `plesk-deployment-notifications`, `queue-monitor`, `dlq-admin`, `dashboard-etl-stripe-civicrm`, `openclaw-bridge` | JSON-Definitionen |
| **Community** | `forum-moderation`, `forum-viral` | JSON-Definitionen |
| **Stripe** | `Stripe_Webhook_to_CiviCRM_Contribution`, `WebhookQueue_Processor` | JSON-Definitionen |

**Bewertung:** Workflows sind als JSON-Definitionen vorhanden, aber nicht in einer laufenden n8n-Instanz deployed.

---

## 9. CI/CD & Deployment

### 9.1 GitHub Actions (50+ Workflows in `.github/workflows/`)
| Kategorie | Workflows |
|-----------|-----------|
| **Security** | CodeQL, Gitleaks, Trivy, Semgrep, OWASP ZAP, OSV-Scanner, Scorecard, SBOM |
| **Qualität** | CI, Quality Gates, Codacy, API-Tests, i18n-Checks, Docs-Lint |
| **Deployment** | deploy-plesk, deploy-staging, deploy-forum, Plesk-Alternatives |
| **Infrastruktur** | DB-Pull/Restore, SSL-Cert-Check, Env-Guard, Secrets-Validate |
| **Andere** | Figma-Token-Sync, AI-Artifacts, Social-Posts, Dependency-Review |

### 9.2 Deployment-Modell
| Aspekt | Details |
|--------|---------|
| Methode | rsync-Artefakt zu Plesk (Single-Server: 5.183.217.146) |
| Build | `cd apps/website && npm run build` → `apps/website/dist` |
| Scripts | `scripts/deploy.sh`, `scripts/bootstrap_ssh.sh` |
| CI/CD | `.github/workflows/deploy-plesk.yml` |
| Dokumentation | `docs/README_DEPLOY.md` |

### 9.3 Docker-Konfiguration
| Datei | Dienste |
|-------|---------|
| `docker-compose.yml` | PostgreSQL 16, Redis 7, n8n |
| `docker-compose.prod.yml` | Produktions-Stack |
| `docker-compose.monitoring.yml` | Uptime Kuma, Prometheus, Grafana |
| `apps/crm/docker-compose.yml` | MariaDB, Drupal, Nginx |

---

## 10. Governance-Normalisierung

### 10.1 Offizielle Daten (Vereinsregisterauszug)
| Feld | Korrekter Wert |
|------|---------------|
| Vereinsname | Menschlichkeit Österreich |
| ZVR-Zahl | 1182213083 |
| Entstehungsdatum | 28. Mai 2025 |
| Sitz | St. Pölten |
| Zustellanschrift | Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn |
| Vereinsbehörde | Landespolizeidirektion Niederösterreich (LPD NÖ) |
| Obperson | Mag. Peter Schuller (21.05.2025 – 20.05.2030) |
| Stellv. Obperson + Kassier | Mag. Michael Schuller |
| Schriftführer | Peter Schuller |

### 10.2 Mitgliedschaftsarten (Statuten §4)
| Typ | Statuten-Bezeichnung |
|-----|---------------------|
| ordentliche Mitglieder | Stimmberechtigt, beitragspflichtig |
| außerordentliche Mitglieder | Unterstützend |
| Ehrenmitglieder | Auf Vorstandsbeschluss |

### 10.3 Beitragsordnung 2025 (gültig ab 1. Juli 2025)
| Kategorie | Jahresbeitrag | Monatsbeitrag |
|-----------|--------------|---------------|
| Standard | € 36,– | € 3,– |
| Ermäßigt (Studierende, Arbeitssuchende, Pensionist*innen) | € 18,– | € 1,50 |
| Härtefall | € 0,– | € 0,– |

### 10.4 Normalisierungs-Status
| Korrektur | Dateien betroffen | Status |
|-----------|-------------------|--------|
| Beiträge (€36/€18 statt €60/€24) | 5 Dateien | **Erledigt** |
| E-Mail (kontakt@ statt outlook.at/office@) | 11 Dateien | **Erledigt** |
| Adresse (Pottenbrunn statt St. Pölten/Wien) | 8 Dateien | **Erledigt** |
| Rollenbezeichnung (Obperson statt Obmann) | 1 Datei | **Erledigt** |
| Mitgliedschaftsarten (ordentlich/außerordentlich/Ehrenmitglieder) | 3 Dateien | **Erledigt** |
| Vereinsorgan (Mitgliederversammlung statt Generalversammlung) | 5 Dateien | **Erledigt** |
| Funktionsperiode (bis 5 Jahre statt 2 Jahre) | 1 Datei | **Erledigt** |
| Vorstandszusammensetzung (Obperson + Stellv. + Kassier*in) | 1 Datei | **Erledigt** |
| ZVR in API/Admin (1182213083 statt 123456789) | 2 Dateien | **Erledigt** |
| Vereinsbehörde (LPD NÖ statt BH St. Pölten) | 1 Datei | **Erledigt** |
| Beitragsordnung Datum (21.05.2025, gültig ab 01.07.2025) | 1 Datei | **Erledigt** |
| API invoice_service.py (Adresse, ZVR, E-Mail) | 1 Datei | **Erledigt** |

---

## 11. Sicherheit

### 11.1 P0-Risiken (Offen)
| Risiko | Datei | Beschreibung |
|--------|-------|-------------|
| **Admin-Check clientseitig** | `AuthContext.tsx` | `VITE_ADMIN_EMAILS` ist im JS-Bundle sichtbar; Admin-Prüfung muss ins Backend (JWT-Claims) |
| **GitHub-Token im Bundle** | `AdminOpenClaw.tsx` | `VITE_GITHUB_TOKEN` ist im JS-Bundle sichtbar; muss über Backend-Proxy geleitet werden |

### 11.2 Bestehende Sicherheitsmaßnahmen
- Security-Headers-Middleware (FastAPI)
- CSP (Content Security Policy) konfiguriert
- CORS-Whitelist
- Rate-Limiting (geplant)
- Gitleaks + Trivy + Semgrep + CodeQL in CI/CD
- DSGVO-Compliance-Blueprint dokumentiert
- PII-Sanitization vorhanden

### 11.3 Governance-Policies
Detaillierte Gap-Analyse: `reports/gov-gap-analysis.md`
- 5 P0-Critical Policies fehlen (Incident Response, Data Retention, Access Control, Crypto, Backup/DR)
- 7 P1-High Policies fehlen (Code Review, Release, Change Management, Third-Party Risk, Logging, API Security, DevSecOps)
- 9 P2-Medium Policies fehlen

---

## 12. Dokumentation

### 12.1 Bestand
| Bereich | Anzahl Dateien |
|---------|---------------|
| Docs-Verzeichnis | 366 Markdown-Dateien |
| Root-Markdown | 60+ Dateien |
| Reports | 30+ Dateien |
| Architecture | 8 Dateien |
| Security | 19 Dateien |
| Operations | 8 Dateien |
| Compliance | 5 Dateien |

### 12.2 Bewertung
- **Stärken:** Umfangreiche Sicherheits- und Compliance-Dokumentation, ADRs vorhanden
- **Schwächen:** Viele veraltete/redundante Root-Dateien (CODESPACE-*, FIGMA-*, SESSION_SUMMARY-*)
- **Empfehlung:** Root-Level-Markdown konsolidieren; veraltete Fix-Berichte archivieren

---

## 13. Skripte & Tooling

### 13.1 Bestand (`scripts/`)
| Kategorie | Anzahl | Beispiele |
|-----------|--------|-----------|
| Deployment/Plesk | 15+ | `deploy.sh`, `plesk-deploy.ps1`, `safe-deploy.sh` |
| Security | 10+ | `secrets-management.ps1`, `validate-secrets.py` |
| Datenbank | 8+ | `db-pull.sh`, `db-push.sh`, `database-setup.ps1` |
| Figma/Design | 5+ | `figma-token-sync.cjs`, `sync-figma-tokens.sh` |
| CI/Qualität | 5+ | `quality-check.sh`, `build-pipeline.sh` |
| Monitoring | 4+ | `simple-monitor.py`, `log-analyzer.py` |

### 13.2 Bewertung
- Mix aus Bash, PowerShell, Python und JavaScript
- PowerShell-Skripte primär für Windows-Entwicklung (nicht relevant auf Replit/Linux)
- Deployment-Skripte redundant (mehrere Varianten für gleiche Aufgabe)

---

## 14. E-Mail-Inventar

### 14.1 Normalisierter Zustand
| Kontext | E-Mail-Adresse | Status |
|---------|---------------|--------|
| Öffentlich (Website, Footer, Impressum, Datenschutz, Kontakt) | kontakt@menschlichkeit-oesterreich.at | **Korrekt** |
| Admin-Einstellungen (SMTP, Antwort-Adresse) | kontakt@menschlichkeit-oesterreich.at | **Korrekt** |
| API Invoice-Service | kontakt@menschlichkeit-oesterreich.at | **Korrekt** |
| Login (Passwort vergessen) | kontakt@menschlichkeit-oesterreich.at | **Korrekt** |
| OpenClaw AI-Chat | kontakt@menschlichkeit-oesterreich.at | **Korrekt** |
| Security-Policy (SECURITY.md) | security@menschlichkeit-oesterreich.at | Korrekt (dediziert) |
| Code of Conduct | vorstand@menschlichkeit-oesterreich.at | Korrekt (dediziert) |

### 14.2 Bereinigte Adressen
- `menschlichkeit-oesterreich@outlook.at` — **Vollständig entfernt** (0 Vorkommen)
- `office@menschlichkeit-oesterreich.at` — **Vollständig entfernt** (0 Vorkommen)

---

## 15. UX/UI-Konsistenz

| Aspekt | Bewertung |
|--------|-----------|
| Navigation | Konsistenter NavBar mit Dropdown, Sticky-Header |
| Farbsystem | Einheitlich Rot (#dc2626), Design-Tokens durchgängig |
| Footer | Konsistentes 3-Spalten-Layout, normalisierte Kontaktdaten |
| Formulare | UI-Komponenten-Bibliothek (Alert, Button, Card, Input) |
| Responsive | Tailwind-basiert, Mobile-First |
| Dark Mode | Teilweise implementiert (Dashboard-Bereiche) |
| Barrierefreiheit | ARIA-Labels, Skip-Link, Keyboard-Navigation teilweise |
| Fehlerbehandlung | NotFound-Seite vorhanden, Error-States in Formularen |
| Leer-Zustände | Nicht durchgängig implementiert |

---

## 16. Rollen & Berechtigungen (RBAC)

### 16.1 Definierte Rollen
| Rolle | Zugriff | Implementierung |
|-------|---------|----------------|
| `guest` | Öffentliche Seiten | Frontend-Routing |
| `member` | Mitgliederbereich | ProtectedRoute |
| `moderator` | Community-Moderation | Definiert, nicht implementiert |
| `admin` | Admin-Dashboard | **Clientseitig (P0-Risiko)** |
| `sysadmin` | Systemeinstellungen | Definiert, nicht implementiert |

### 16.2 Governance-Rollen (Statuten)
| Organ | Funktion | Code-Mapping |
|-------|----------|-------------|
| Vorstand | Obperson, Stellv., Kassier*in, Schriftführer*in | `admin` |
| Rechnungsprüfer*innen | Finanzprüfung | Nicht implementiert |
| Schiedsgericht | Streitschlichtung | Nicht implementiert |
| Arbeitsgruppen | Thematische Gruppen | Nicht implementiert |

---

## 17. Datenbank-Architektur

| Aspekt | Status |
|--------|--------|
| PostgreSQL 16 | Docker-Compose definiert, nicht aktiv |
| Redis 7 | Docker-Compose definiert, nicht aktiv |
| MariaDB (CRM) | Docker-Compose definiert, nicht aktiv |
| Migrations | Nicht vorhanden |
| Seed-Daten | Nicht vorhanden |
| Produktionsdatenbank | Nicht konfiguriert |

---

## 18. Testing

| Aspekt | Status |
|--------|--------|
| Unit-Tests | `SepaManagement.test.tsx` vorhanden (1 Datei) |
| E2E-Tests | Playwright konfiguriert (Figma-Design-System), nicht in Website |
| Coverage | Nicht gemessen |
| Lighthouse CI | Konfiguriert (`lighthouserc.json` in Figma-DS) |
| Accessibility | Pa11y konfiguriert, nicht aktiv |

---

## 19. Performance

| Aspekt | Status |
|--------|--------|
| Bundle-Analyse | Nicht konfiguriert |
| Lazy-Loading | Nicht implementiert (alle Routen eager) |
| Image-Optimierung | Nicht systematisch |
| Caching | Keine Cache-Headers definiert |
| CDN | Nicht konfiguriert |

---

## 20. Internationalisierung (i18n)

| Aspekt | Status |
|--------|--------|
| Sprache | Ausschließlich Deutsch (de-AT) |
| i18n-Framework | Nicht implementiert |
| Hardcoded Strings | Alle UI-Texte direkt in TSX-Dateien |
| Empfehlung | Derzeit nicht priorisiert (Vereinssprache ist Deutsch) |

---

## 21. Monitoring & Observability

| Aspekt | Status |
|--------|--------|
| Uptime Kuma | Docker-Compose definiert, nicht deployed |
| Prometheus | Docker-Compose definiert, Metrics-Endpunkt in API |
| Grafana | Docker-Compose definiert, nicht deployed |
| Logging | FastAPI-Middleware mit Request-Logging |
| Alerting | n8n-Workflows definiert, nicht aktiv |

---

## 22. Veraltete/Überflüssige Dateien

### 22.1 Zur Archivierung empfohlen
| Bereich | Dateien | Begründung |
|---------|---------|-----------|
| Root-Markdown | 20+ `CODESPACE-*.md` | Gelöste Codespace-Probleme |
| Root-Markdown | 5+ `FIGMA-*.md` | Einmalige Setup-Berichte |
| Root-Markdown | `SESSION_SUMMARY-*.md`, `STATUS_UPDATE-*.md` | Historische Sitzungsprotokolle |
| `website/` | 39 Dateien | Durch React-SPA ersetzt |
| `frontend/src/` | Leer | Aufgegebenes Frontend |
| `_clean_deleted-*.csv` | 232 KB | Bereinigungsdaten |

### 22.2 Konsolidierung empfohlen
- **Zwei API-Codebasen:** `apps/api/` und `api.menschlichkeit-oesterreich.at/` → In eine zusammenführen
- **Redundante Deploy-Skripte:** Mehrere Varianten für Plesk-Deployment → Einen kanonischen Pfad definieren

---

## 23. Deployment-Empfehlung

| Aspekt | Empfehlung |
|--------|-----------|
| Methode | rsync-Artefakt zu Plesk (aktuell konfiguriert) |
| Frontend | `npm run build` → `dist/` → rsync zum Plesk-Webroot |
| API | FastAPI via systemd/Supervisor auf Plesk |
| CRM | Drupal+CiviCRM via Plesk (PHP-FPM) |
| SSL | Let's Encrypt Auto-Renewal via Plesk |
| Monitoring | Uptime Kuma (Docker) auf gleicher Maschine |

---

## 24. Priorisierte nächste Schritte

### P0 — Sofort (Sicherheitskritisch)
1. **Admin-Rollenprüfung ins Backend:** `VITE_ADMIN_EMAILS` → JWT-Claims mit `role` Property
2. **GitHub-Token-Proxy:** `VITE_GITHUB_TOKEN` → Backend-Endpunkt für OpenClaw-API-Aufrufe
3. **Incident Response Plan:** DSGVO Art. 33 erfordert 72h-Meldepflicht

### P1 — Kurzfristig (Funktionalität)
4. **Backend-Anbindung:** Mock-Daten in Admin/Member-Dashboards durch API-Calls ersetzen
5. **PostgreSQL aktivieren:** Datenbank-Schema und Migrations erstellen
6. **CiviCRM deployen:** Docker-basiertes CRM zum Laufen bringen
7. **Cookie-Consent-Banner:** `CookieConsent.tsx` aus Figma-DS integrieren
8. **ErrorBoundary:** Aus Figma-DS integrieren

### P2 — Mittelfristig (Qualität)
9. **Route Lazy-Loading:** Code-Splitting für alle Routen
10. **Test-Coverage:** Unit-Tests für kritische Komponenten (Auth, SEPA, JoinForm)
11. **Root-Cleanup:** Veraltete Markdown-Dateien archivieren
12. **API-Konsolidierung:** Zwei API-Codebasen zusammenführen
13. **Figma-Komponenten-Migration:** Beste 20 Komponenten aus `figma-design-system/` übernehmen

### P3 — Langfristig (Optimierung)
14. **Performance-Budget:** Lighthouse CI, Bundle-Analyse
15. **Barrierefreiheit:** WCAG 2.2 AA-Konformität
16. **Monitoring deployen:** Uptime Kuma + Prometheus + Grafana
17. **n8n deployen:** Automatisierungs-Workflows aktivieren

---

## 25. Zusammenfassung der Architektur

```
┌──────────────────────────────────────────────────────────────┐
│                        PLESK SERVER                          │
│                     5.183.217.146                             │
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  React SPA      │  │  FastAPI     │  │  Drupal 10     │  │
│  │  (Vite Build)   │  │  (Python)    │  │  + CiviCRM     │  │
│  │  Port: 443      │  │  Port: 8000  │  │  (PHP-FPM)     │  │
│  │  ✅ Funktional  │  │  ⚠️ Teilw.   │  │  ❌ Nicht aktiv │  │
│  └────────┬────────┘  └──────┬───────┘  └───────┬────────┘  │
│           │                  │                   │            │
│  ┌────────┴──────────────────┴───────────────────┴────────┐  │
│  │                    PostgreSQL 16                        │  │
│  │                    ❌ Nicht aktiv                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Redis   │  │  n8n     │  │  Uptime  │  │ Prometheus │  │
│  │  ❌      │  │  ❌      │  │  Kuma ❌  │  │  ❌        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Legende:** ✅ = Funktional / Deployed | ⚠️ = Teilweise implementiert | ❌ = Nicht aktiv/deployed

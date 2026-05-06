# Plattform-Gesamtanalyse & Priorisierter Maßnahmenbericht

**Menschlichkeit Österreich – Vereinsplattform**
**Dokument-Typ:** Vollständiges Plattform-Audit (Phasen 1+2)
**Erstellt:** 2026-03-12
**Klassifikation:** INTERN

---

## 1. Erkannter Ist Zustand

### Gesamtüberblick

Die Plattform „Menschlichkeit Österreich" ist ein npm-Workspace-Monorepo auf einem Single-Server-Plesk-Hosting (IP: 5.183.217.146). Das System umfasst:

- **Statische HTML-Website** (`website/`) – 12 Seiten, Tailwind + Bootstrap 5, `crm-api.js` als API-Client
- **React SPA** (`apps/website/src/`) – 99 TS/TSX-Dateien, Vite, Tailwind, Design Tokens
- **FastAPI Backend** – existiert in zwei parallelen Verzeichnissen:
  - `apps/api/app/` – Minimalversion (4 Python-Dateien, nur Metrics-Router)
  - `api.menschlichkeit-oesterreich.at/app/` – Vollständige Version (Auth, CRM, Payments, DSGVO)
- **Drupal 10 + CiviCRM** (`apps/crm/`) – Produktions-Skeleton, Datenbank `mo_civicrm_data` auf MariaDB
- **Educational Game** (`apps/game/`) – „Brücken Bauen", 102 Dateien, Three.js 3D-Engine
- **n8n Automation** (`automation/n8n/`) – 25 Workflow-JSONs (Finanzen, CRM, Monitoring, Social)
- **OpenClaw Multi-Agent-System** (`openclaw-system/`) – 6 KI-Agenten, NATS JetStream, Qdrant
- **phpBB Forum** (`web/forum/`) – Custom Theme (`moe-theme`), CSP-Extension
- **Figma Design System** (`figma-design-system/`) – 100 TSX-Komponenten (NICHT mit App verbunden)
- **MCP Server** (`mcp-servers/`) – Figma MCP, File Server

### Repository-Struktur

```
/
├── apps/
│   ├── api/app/              ← FastAPI (Minimalversion, 4 Dateien)
│   ├── crm/                  ← Drupal 10 + CiviCRM
│   ├── game/                 ← Educational Game (102 Dateien)
│   └── website/src/          ← React SPA (99 Dateien) ← AKTIVE APP
├── api.menschlichkeit-oesterreich.at/  ← FastAPI (Vollversion)
├── automation/n8n/           ← 25 Workflow-JSONs
├── figma-design-system/      ← 100 TSX-Komponenten (NICHT verbunden)
├── frontend/                 ← LEER (kein src/, nur Konfiguration)
├── mcp-servers/              ← Figma MCP, File Server
├── openclaw-system/          ← Multi-Agent KI-System
├── packages/                 ← design-system, ui (Shared Packages)
├── Pdf/                      ← 5 Governance-PDFs
├── scripts/                  ← Build, Deploy, CI/CD Utilities
├── web/forum/                ← phpBB Forum
├── website/                  ← Statische HTML-Website (12 Seiten)
├── docker-compose.yml        ← Dev: PostgreSQL, Redis, n8n
├── docker-compose.prod.yml   ← Prod: API, Frontend, Redis, Backup
└── package.json              ← npm Workspaces Root
```

### Infrastruktur

| Komponente | Status | Risiko |
|---|---|---|
| Single Server (Plesk) | ✅ Aktiv | Hoch (SPOF) |
| PostgreSQL ≥15 | ✅ Docker Compose | API + Games teilen sich Instanz |
| MariaDB 10.6.22 | ✅ Plesk | CiviCRM/Drupal |
| Redis 7 | ✅ Docker Compose | Sessions, Cache |
| nginx 1.28.0 | ✅ Reverse Proxy | Niedrig |
| n8n (Docker) | ✅ Docker Compose | Port 5678 |
| 40+ GitHub Actions | ✅ CI/CD | Umfangreiche Pipeline |

### Kritische Strukturprobleme

| Problem | Schweregrad |
|---|---|
| `frontend/src/` existiert NICHT – aktive App ist unter `apps/website/src/` | Hoch |
| Duplizierte API-Verzeichnisse (`apps/api/` vs `api.menschlichkeit-oesterreich.at/`) | Hoch |
| 100 TSX-Komponenten in `figma-design-system/` sind nicht mit der aktiven App verbunden | Hoch |
| 50+ Markdown-Dateien im Root statt in `/docs` | Mittel |
| `.env.vault` im Repository | Hoch |
| Zwei parallele Frontend-Systeme (statische Website + React SPA) | Hoch |

---

Legende: ✅ Vollständig implementiert | ⚠️ Teilweise / Mock | ❌ Fehlend | 🔴 P0 Kritisch | 🟠 P1 Hoch | 🟡 P2 Mittel | ⚪ P3 Niedrig

---

## 2. Erkannte Produktmodule

| Modul | Verzeichnis | Technologie | Status |
|---|---|---|---|
| **Öffentliche Website** | `website/` | HTML + Tailwind + Bootstrap | ✅ 12 Seiten |
| **React SPA** | `apps/website/src/` | React 18 + Vite + TypeScript | ✅ 99 Dateien |
| **Backend API (Voll)** | `api.menschlichkeit-oesterreich.at/` | FastAPI, Python 3.12+ | ✅ Auth, CRM, Payments, DSGVO |
| **Backend API (Minimal)** | `apps/api/app/` | FastAPI | ⚠️ Nur Metrics (Mock) |
| **CRM** | `apps/crm/` | Drupal 10 + CiviCRM | ⚠️ Konfiguriert, Platzhalter-Secrets |
| **Educational Game** | `apps/game/` | Vanilla JS + Three.js | ✅ 102 Dateien, 3D-Engine |
| **Forum** | `web/forum/` | phpBB | ⚠️ Theme vorhanden, nicht produktiv |
| **n8n Automation** | `automation/n8n/` | n8n (Docker) | ✅ 25 Workflows |
| **OpenClaw KI** | `openclaw-system/` | Python, NATS, Qdrant | ⚠️ Prototyp-Integration |
| **Design System** | `figma-design-system/` | React TSX | ⚠️ 100 Komponenten, nicht verbunden |
| **Shared Packages** | `packages/` | design-system, ui | ⚠️ Geplant, unklar genutzt |
| **MCP Server** | `mcp-servers/` | Node.js | ✅ Figma + File Server |
| **Governance PDFs** | `Pdf/` | PDF + Textextrakte | ✅ 5 Dokumente |

---

## 3. Bereits vorhandene Funktionen

### Vollständig implementiert (✅)

| Funktion | Bereich | Implementierung |
|---|---|---|
| JWT-Authentifizierung (Login, Register, Refresh) | API | `api.*/app/main.py` |
| CiviCRM-Integration (Kontakte, Mitgliedschaften) | API | httpx → CiviCRM APIv4 |
| Stripe Payment Intent | API | `/payments/stripe/intent` |
| PayPal Order + Capture | API | `/payments/paypal/order` |
| SEPA-Mandate (IBAN-Validierung) | API + Frontend | `sepa-handler.js`, `SepaManagement.tsx` |
| Spendenquittungen (PDF) | API | `/receipts/generate` |
| DSGVO Löschanträge (Art. 17) | API + n8n | `privacy.py`, 3 n8n-Workflows |
| PII-Sanitisierung in Logs | API Middleware | `pii_middleware.py` |
| Audit Trail (jeder API-Request) | API | `audit.py`, `audit_trail`-Tabelle |
| Security Headers (CSP, HSTS, XFO) | API Middleware | `middleware/security.py` |
| Rate Limiting | API | In-Memory, konfigurierbar |
| CSRF-Schutz | API | X-CSRF-Token für Mutationen |
| RBAC mit ~40 Scopes | API + Frontend | `rbac.py`, `rbac.ts` |
| Design Token Pipeline | Build | Figma → JSON → Tailwind → CSS |
| DSGVO Cookie Consent | Website + SPA | Cookie Manager |
| PWA Service Worker | Website + Game | `sw.js`, `manifest.json` |
| Onboarding-Willkommensserie | n8n | 3-stufig (sofort, +3d, +7d) |
| Finanz-Workflows (Rechnungen, Mahnungen, SEPA) | n8n | 7 Workflows |
| Social Media Crossposting | n8n | Instagram, Facebook, X, LinkedIn |
| CI/CD Pipeline | GitHub Actions | 40+ Workflows |
| NavBar mit Logo + Dropdown | SPA | `NavBar.tsx` |
| Split-Login-Layout | SPA | `AuthLayout.tsx` + `Login.tsx` |
| Dashboard-Sidebar-Navigation | SPA | `DashboardLayout.tsx` |
| Mitgliederprofil (API-Anbindung) | SPA | `MemberArea.tsx` |
| Mitglieder-Onboarding | SPA | `MemberOnboarding.tsx` |
| Datenschutzeinstellungen | SPA | `PrivacySettings.tsx` |
| Mitgliederverwaltung (CiviCRM) | SPA | `MemberManagement.tsx`, `CiviMemberManagement.tsx` |
| 3D Game Engine (Three.js) | Game | `v2/js/engine-3d.js` |
| 100-Level-Kampagne (Metaverse) | Game | `js/metaverse-core.js` |
| Partikeleffekte | Game | `v2/js/engine-particles.js` |

### Teilweise implementiert / Mock-Daten (⚠️)

| Funktion | Problem | Wo |
|---|---|---|
| Admin-Dashboard | Mock-Daten statt echter API-Calls | `AdminDashboard.tsx` |
| Member-Dashboard (XP, Badges) | Mock-Daten | `MemberDashboard.tsx` |
| Finance-Dashboard | Stub-Daten | `FinanceDashboard.tsx` |
| Board/Treasurer-Dashboard | Abhängig von Mock-Metrics-API | `BoardTreasurerDashboard.tsx` |
| Metrics-API | **Nur Platzhalter-Daten**, TODOs für CiviCRM | `routers/metrics.py` |
| Security-Dashboard | Sessions/Logs-Endpunkte leer | `routers/security.py` |
| Admin Events/Newsletter/Reports | Teilweise implementiert | `AdminEvents.tsx`, etc. |
| OpenClaw Chat | Prototyp | `OpenClawChat.tsx` |
| Multiplayer (WebRTC) | Vorhanden aber nicht produktionsgetestet | `multiplayer-webrtc.js` |
| Forum (phpBB) | Theme vorhanden, nicht produktiv konfiguriert | `web/forum/` |
| CRM SMTP | Passwort als Platzhalter | `settings.php` |
| CRM Theme | `'your_theme_name'` | `settings.php` |
| CRM Hash Salt | Generischer Wert | `settings.php` |

---

## 4. Fehlende oder unvollständige Funktionen

| Funktion | Kategorie | Priorität | Details |
|---|---|---|---|
| Echte Metriken-Aggregation | Backend | 🔴 P0 | `routers/metrics.py` muss CiviCRM-Daten abfragen |
| E-Mail-Verifizierung bei Registrierung | Auth | 🟠 P1 | Registrierung ohne Bestätigungsschritt |
| Voting-System für Mitgliederversammlung | Feature | 🟡 P2 | Statuten fordern Abstimmungen (§ 10) |
| Game Progress API | Backend | 🟠 P1 | `POST /api/member/game/progress` fehlt |
| Game SSO | Integration | 🟠 P1 | Kein JWT-Token-Austausch mit Hauptsystem |
| Forum API-Integration | Integration | 🟠 P1 | Keine phpBB-Schnittstelle |
| Forum SSO | Integration | 🟡 P2 | Separates Login-System |
| Newsletter-Segmentierung API | Backend | 🟡 P2 | Nur als Konzept in Docs |
| Event-Management API | Backend | 🟡 P2 | Nur n8n-Webhook-basiert |
| Chat/Messaging-System | Feature | 🟡 P2 | Nicht implementiert |
| Globale Suche | Feature | 🟡 P2 | Keine plattformübergreifende Suchfunktion |
| Medienverwaltung/Upload-System | Feature | 🟡 P2 | Kein zentrales Asset-Management |
| Notification Center | Feature | 🟡 P2 | `NotificationCenter.tsx` nur in figma-design-system |
| Kommentar-System | Feature | 🟡 P2 | Nicht implementiert |
| Blog/News-Redaktionssystem | Feature | 🟡 P2 | Statische Seiten, kein CMS-Workflow |
| Kalenderansicht | Feature | 🟡 P2 | Events ohne Kalender-UI |
| Rechnungsprüfer-Report-Zugang | Governance | 🟡 P2 | Keine separierte Leseansicht |
| Schiedsgericht-Prozess digital | Governance | ⚪ P3 | Nicht implementiert |
| Nextcloud-Integration | Infrastruktur | ⚪ P3 | Geplant, nicht aktiv |

---

## 5. Kritische UX oder UI Probleme

### Zwei parallele Frontend-Systeme

Es existieren **parallel** die statische Website (`website/`) und die React SPA (`apps/website/`). Beide decken teilweise die gleichen Seiten ab (Home, Login, Kontakt, Datenschutz, Impressum). Die Migrationsbeziehung ist unklar.

### 100 nicht verbundene Design-System-Komponenten

`figma-design-system/components/` enthält 54 Feature-Komponenten (AdminDashboard, AuthSystem, Forum, Events, etc.) und 46 UI-Komponenten (accordion, button, card, dialog, table, etc.), die **nicht** in die aktive App (`apps/website/`) importiert sind. Die SPA hat eine eigene, kleinere UI-Bibliothek (11 Komponenten in `components/ui/`). Die Duplizierung erzeugt Inkonsistenz und verschwendet Code.

### Oberflächen-Konsistenz

| Aspekt | Status |
|---|---|
| Navigation | ⚠️ Inkonsistent: Website (Navbar + Footer), SPA (Sidebar), Game (eigenes Menü) |
| Designsystem | ⚠️ Nur SPA nutzt Design Tokens; Website, Game, CRM verwenden eigene Farbwerte |
| Formulare | ⚠️ SPA hat Validierung; Website nur Basis-Validierung |
| Tabellen | ⚠️ Nur in SPA-Komponenten (MemberList) |
| Empty States | ⚠️ Teilweise in SPA, nicht in Website/Game |
| Fehlerbehandlung | ⚠️ ErrorBoundary in SPA; Website Browser-Default |
| Ladezustände | ⚠️ LoadingSpinner in SPA; nicht in Website/Game |
| Mobile Responsiveness | ⚠️ SPA Tailwind-responsive; Website teilweise |
| Barrierefreiheit | ⚠️ SkipLink in SPA; keine WCAG-Prüfung durchgeführt |
| Farbkontraste (Rot auf Weiß) | ⚠️ WCAG AA ≥ 4.5:1 nicht verifiziert |

### Mock-Daten in Dashboards

Admin-Dashboard, Member-Dashboard, Finance-Dashboard und Board/Treasurer-Dashboard zeigen **Stub-/Mock-Daten** statt echter API-Antworten. Das führt bei Nutzern zu falschen Erwartungen und Vertrauensverlust.

---

## 6. Kritische Backend oder Datenmodell Lücken

### Duplizierte API-Codebasis

| Verzeichnis | Inhalt | Problem |
|---|---|---|
| `apps/api/app/` | 4 Dateien: main, db, audit, security + metrics-Router | Minimal, nur Mock-Metrics |
| `api.menschlichkeit-oesterreich.at/app/` | Vollständig: Auth, CRM, Payments, DSGVO, Gateway | Produktionsreif |

Beide existieren parallel. Unklar, welche beim Deployment verwendet wird. Die Minimalversion in `apps/api/` registriert nur den Metrics-Router, der ausschließlich Mock-Daten liefert.

### Fehlende API-Endpunkte

| Endpunkt | Zweck | Status |
|---|---|---|
| `POST /api/member/game/progress` | Spielfortschritt speichern | ❌ Fehlt |
| `GET /api/member/forum/activity` | Forum-Aktivitäten | ❌ Fehlt |
| `GET /api/member/events` | Mitglieder-Events | ❌ Fehlt |
| `GET/POST /api/voting/*` | Abstimmungssystem | ❌ Fehlt |
| `GET/POST /api/newsletter/*` | Newsletter-Segmentierung | ❌ Fehlt |
| `GET/POST /api/events/*` | Event-Management | ❌ Fehlt |
| `GET /api/search` | Globale Suche | ❌ Fehlt |

### Datenbank-Risiken

- **Zwei Migrationssysteme** (Alembic + Prisma) auf derselben PostgreSQL-Instanz erfordern Schema-Koordination
- **Readiness-Check** in `apps/api/app/main.py` prüft DB-Verbindung nicht wirklich (hardcodiert `"database": "ok"`)
- **Rate Limiter** ist In-Memory und nicht persistent (verliert State bei Neustart)

---

## 7. Kritische Rollen oder Rechte Lücken

### Implementierter RBAC-Stack

| Rolle | Level | Scopes | Status |
|---|---|---|---|
| ADMIN | 100 | Alle (~40 Scopes) | ✅ |
| SERVICE | 100 | Alle (interne Accounts) | ✅ |
| BOARD | 40 | Mitglieder, Finanzen, Events, Reports | ✅ |
| TREASURER | 30 | Finanzen, Zahlungen, SEPA-Export | ✅ |
| MODERATOR | 20 | Forum, Content-Review | ✅ |
| EVENT_MANAGER | 20 | Events, Check-ins | ✅ |
| CONTENT_EDITOR | 20 | News, Docs, Social Media | ✅ |
| MEMBER | 10 | Eigenes Profil, Forum, Voting, Events | ✅ |
| ANONYMOUS | 0 | Öffentliche Inhalte | ✅ |

### Kritische Lücken

| Lücke | Schweregrad | Details |
|---|---|---|
| **`VITE_ADMIN_EMAILS` clientseitige Admin-Prüfung** | 🔴 P0 Kritisch | `AuthContext.tsx` vergleicht E-Mail mit Umgebungsvariable – leicht umgehbar |
| Rechnungsprüfer-Rolle fehlt | 🟠 P1 | § 13 Statuten fordert unabhängige Prüfer mit Finanzzugang |
| Außerordentliche Mitglieder nicht differenziert | 🟡 P2 | § 5(1)b: kein Stimmrecht, aber aktuell gleiche Rolle wie ordentliche |
| Ehrenmitglieder nicht abgebildet | 🟡 P2 | § 5(1)c: beitragsfrei, beratendes Stimmrecht |
| Obperson/Schriftführer nicht als eigene Rollen | ⚪ P3 | § 11 Statuten; aktuell unter BOARD/ADMIN |
| Keine Vier-Augen-Logik für kritische Aktionen | 🟡 P2 | DSGVO-Löschung, SEPA-Export empfehlen 4-Augen |
| Forum-Moderation nicht mit phpBB-Rollen synchronisiert | 🟡 P2 | Getrennte Systeme |

---

## 8. Kritische Mitgliederverwaltungs Lücken

### Implementiert

- CiviCRM-Integration für Kontakte, Mitgliedschaften
- `MemberManagement.tsx` + `CiviMemberManagement.tsx` in SPA
- `MemberList.tsx` + `MemberDetail.tsx` für Admin
- Profil-Anzeige und -Bearbeitung
- DSGVO-Löschanträge mit Retention-Checks (BAO § 132, SEPA)
- n8n-Onboarding-Serie (Willkommen, Game-Intro, Event-Reminder)

### Lücken

| Lücke | Governance-Referenz | Priorität |
|---|---|---|
| Beitragsordnung-Staffelung (Standard €36 / Ermäßigt €18 / Härtefall €0) nicht in Join-UI | Beitragsordnung § 2 | 🟠 P1 |
| 3 Mitgliedsarten (ordentlich, außerordentlich, Ehren) nicht in UI differenziert | § 5 Statuten | 🟠 P1 |
| Kein Self-Service für Beitragsklassenwechsel (ermäßigt ↔ standard) | Beitragsordnung | 🟡 P2 |
| Mahnverfahren-Status nicht im Mitgliederprofil sichtbar | § 7 Statuten | 🟡 P2 |
| Vorstandsmitglieder-Beitragsfreiheit nicht automatisch | Beitragsordnung | 🟡 P2 |
| Ehrenmitglieder-Ernennung (durch MV-Beschluss) kein digitaler Workflow | § 5(1)c Statuten | ⚪ P3 |
| Kein Datenexport Self-Service (DSGVO Art. 15) | DSGVO | 🟠 P1 |
| Mitgliederverzeichnis nicht als strukturierter Export für Vorstand | § 12(3) Statuten | 🟡 P2 |

---

## 9. Kritische Buchhaltungs oder Finance Lücken

### Implementiert

| Funktion | Implementierung |
|---|---|
| Stripe Payment Intent | API-Endpunkt ✅ |
| PayPal Order + Capture | API-Endpunkte ✅ |
| SEPA-Mandate + IBAN-Validierung | API + Frontend ✅ |
| Spendenquittungen (PDF) | API ✅ |
| Rechnungserstellung | n8n Workflow ✅ |
| Mahnverfahren | n8n `finance-dunning.json` ✅ |
| SEPA-XML-Export | n8n `finance-sepa-export.json` (wöchentlich) ✅ |
| Stripe → CiviCRM Sync | n8n Workflow ✅ |
| Dashboard ETL (Stripe + CiviCRM → PostgreSQL) | n8n `dashboard-etl-stripe-civicrm.json` ✅ |

### Lücken

| Lücke | Priorität | Details |
|---|---|---|
| Finance-Dashboard zeigt nur Mock-Daten | 🔴 P0 | `FinanceDashboard.tsx`, `BoardTreasurerDashboard.tsx` |
| Metrics-API für Finanzen nur Platzhalter | 🔴 P0 | `routers/metrics.py` |
| Beitragsstaffelung nicht in Zahlungsflows | 🟠 P1 | Standard €36, Ermäßigt €18, Härtefall €0 |
| Anteilige Berechnung bei Jahreseintritt nicht automatisiert | 🟡 P2 | Beitragsordnung § 3(2) |
| Jahresabschluss-Report für Rechnungsprüfer | 🟡 P2 | § 13 Statuten |
| Kassier*in Einzelvertretungsbefugnis nicht in RBAC abgebildet | 🟡 P2 | Vereinsregister |
| Fälligkeitsprüfung (31. März / 5. des Monats) nicht automatisiert | 🟡 P2 | Beitragsordnung § 4 |

---

## 10. Forum Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| Plattform | phpBB (`web/forum/`) |
| Custom Theme | ✅ `moe-theme` mit `colours.css` + `tokens.css` |
| CSP Extension | ✅ `moe/csp` für Content Security Policy |
| Konfiguration | ⚠️ `config.php.example` – noch nicht produktiv |
| API-Integration | ❌ Keine Schnittstelle zur Haupt-API |
| SSO | ❌ Separates Login-System |
| Moderation-RBAC | ❌ Nicht mit Hauptsystem synchronisiert |
| n8n Integration | ✅ `forum-moderation.json` + `forum-viral.json` Workflows vorhanden |
| React-Komponente | ⚠️ `Forum.tsx` existiert nur in `figma-design-system/`, nicht in aktiver App |

### Empfohlene nächste Schritte

1. phpBB produktiv konfigurieren (`config.php`)
2. SSO via JWT-Token-Bridge implementieren
3. Moderations-Rollen mit Hauptsystem synchronisieren
4. Forum-Aktivitäten im Mitgliederbereich anzeigen

---

## 11. Blog News und CMS Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| News-Seite (öffentlich) | ✅ `beitraege.html` (statisch) |
| News-Komponenten | ⚠️ `News.tsx`, `NewsManagement.tsx` nur in `figma-design-system/` |
| Blog-System | ❌ Kein CMS-Workflow, nur statische HTML |
| Redaktionelle Freigabe | ❌ Nicht implementiert |
| Autoren-Profile | ❌ Nicht vorhanden |
| Tags/Kategorien | ❌ Nicht implementiert |
| Kommentar-System | ❌ Nicht vorhanden |
| Content-Editor-Rolle | ✅ In RBAC definiert, aber ohne UI |
| SEO-Komponente | ✅ `JsonLdHome.tsx` + `SEOHead.tsx` (nur in figma-design-system) |

### Bewertung

Kein funktionales Redaktionssystem vorhanden. Inhalte werden als statische HTML-Dateien gepflegt. Die `CONTENT_EDITOR`-Rolle existiert im RBAC, hat aber keine zugehörige Verwaltungsoberfläche.

---

## 12. Social Sharing und öffentliche Sichtbarkeit Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| Social Media Crossposting | ✅ n8n `social-media-crosspost.json` (IG, FB, X, LinkedIn) |
| Open Graph Meta-Tags | ⚠️ Nicht systematisch auf allen öffentlichen Seiten |
| Share-Buttons | ❌ Nicht implementiert |
| Social Preview Bilder | ❌ Keine og:image-Generierung |
| SEO Meta-Tags | ⚠️ `SEOHead.tsx` existiert in figma-design-system, nicht in aktiver App |
| JSON-LD Structured Data | ⚠️ `JsonLdHome.tsx` nur in figma-design-system |
| Sitemap | ❌ Nicht generiert |
| robots.txt | ⚠️ Unklar konfiguriert |
| Favicon | ❌ Nicht aus Logo generiert (Logo ist JPEG, kein ICO/SVG) |

### Bewertung

Die n8n-Automatisierung für Crossposting ist vorhanden, aber die Website selbst hat keine konsistente Social-Preview-Vorbereitung. Open Graph, Structured Data und Share-Funktionen fehlen weitgehend.

---

## 13. Veranstaltungen Kalender und Planungs Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| Events-Seite (SPA) | ✅ `Veranstaltungen.tsx` |
| Events-Komponente | ✅ `EventsList.tsx` in SPA |
| Admin Events | ⚠️ `AdminEvents.tsx` teilweise implementiert |
| Event-Management-Komponente | ⚠️ `EventManagement.tsx` nur in figma-design-system |
| Events-API | ❌ Keine REST-Endpunkte für CRUD |
| Kalenderansicht | ❌ Nicht vorhanden |
| Terminslots/Agenda | ❌ Nicht implementiert |
| Teilnahme-Management | ❌ Nicht implementiert |
| Event-Erinnerungen | ✅ n8n `events-reminder.json` |
| EVENT_MANAGER-Rolle | ✅ In RBAC definiert |

### Bewertung

Events werden auf einer Seite angezeigt, aber es fehlt die vollständige CRUD-Logik im Backend, eine Kalenderansicht und ein Teilnahme-Management. Die EVENT_MANAGER-Rolle ist definiert, hat aber keine zugehörige Admin-UI.

---

## 14. Suche Discovery und Informationsarchitektur Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| Globale Suche | ❌ Nicht implementiert |
| Kontextuelle Suche (z.B. in Mitgliederliste) | ⚠️ Filter in MemberList vorhanden |
| Command Palette | ⚠️ `CommandPalette.tsx` nur in figma-design-system |
| Suchindex | ❌ Kein Suchindex konfiguriert |
| Navigation (SPA) | ✅ Sidebar + Breadcrumbs |
| Navigation (Website) | ✅ Navbar + Footer |
| Informationsarchitektur | ⚠️ Inkonsistent zwischen Website und SPA |
| Filterung und Sortierung | ⚠️ Nur in einzelnen Komponenten |

### Bewertung

Keine plattformübergreifende Such- oder Discovery-Funktion vorhanden. Die Navigation ist zwischen den zwei Frontend-Systemen inkonsistent. Die Informationsarchitektur (öffentlich → Mitgliederbereich → Admin) ist in der SPA logisch aufgebaut, aber nicht mit der statischen Website verknüpft.

---

## 15. 3D Status und empfohlene konkrete 3D Architektur

### Aktueller 3D-Status

Das Educational Game „Brücken Bauen" in `apps/game/` ist **bereits produktionsreif als 3D-Anwendung** mit Vanilla Three.js implementiert:

**3D-Engine (`apps/game/v2/js/engine-3d.js`):**
- WebGL Renderer mit ACESFilmicToneMapping und Schatten
- Perspektiv-Kamera mit Lerp-Animationen
- Scene Management, Beleuchtung (Ambient, Directional, Point), Fog
- Prozedurale 3D-Assets (Gebäude, Bäume)

**Partikeleffekte (`apps/game/v2/js/engine-particles.js`):**
- Konfetti-Effekte (`THREE.Points` + `BufferGeometry`)
- Glow-Sphären und Ambiente-Effekte

**Spielinhalte:**
- 100-Level-Kampagne über 11 Regionen (Nachbarschaft, Digitale Demokratie, Klima, etc.)
- Szenarien-System (`data-scenarios.js`, `data-roles.js`, `data-levels.js`)
- 3D-Menü-Szene (`scene-menu.js`) und Weltkarte (`scene-worldmap.js`)
- Multiplayer-Prototyp (WebRTC P2P)
- Teacher-Dashboard, Performance-Monitoring, Graphics-Showcase

### Empfohlene 3D-Architektur

3D ist als **gesetzte Zielarchitektur** bestätigt. Die bestehende Vanilla-Three.js-Implementierung ist produktionsreif.

| Aspekt | Empfehlung | Begründung |
|---|---|---|
| **Engine** | Vanilla Three.js beibehalten | Bereits vollständig implementiert, performant, kein React-Overhead |
| **R3F-Migration** | Nicht empfohlen (aktuell) | Game hat kein React; Migration wäre disruptiv ohne Mehrwert |
| **SSO-Integration** | JWT-Token aus Hauptsystem im Game-Iframe | 🟠 P1: Kein separater Login nötig |
| **Progress-API** | `POST /api/member/game/progress` | 🟠 P1: XP/Badge-System benötigt Backend-Persistenz |
| **Asset Loading** | Bestehend (JSON-Metadaten + prozedurale 3D) | Funktional, erweiterbar |
| **Performance** | LOD + Object Pooling für Mobile | 🟡 P2: Mobile-Optimierung |
| **Brand-Konsistenz** | Design Tokens ins Game integrieren | 🟠 P1: Gleiche Farbpalette |
| **Entkopplung** | Game als eigenständige App mit JWT-Auth | 🟡 P2: Spielausfälle nicht → Kernplattform |
| **Community** | XP, Badges, Ranglisten im Mitgliederprofil | 🟡 P2: Einwilligungsbasiert |
| **Erweiterung** | Neue Szenen + Regionen über `data-levels.js` | Modularer Aufbau unterstützt dies |

---

## 16. Rollenverwaltung und Rechtearchitektur Status

### Backend-RBAC (Implementiert)

**`apps/api/src/auth/rbac.py`** definiert eine hierarchische Rollenstruktur mit ~40 granularen Scopes:

- **Mitglieder:** `members:read`, `members:write`, `members:delete`, `members:export`, `members:roles`
- **Finanzen:** `payments:read`, `payments:write`, `payments:refund`, `payments:export`
- **Content:** `news:publish`, `docs:approve`, `social:post`
- **System:** `config:read`, `audit:read`, `crm:sync`

**Enforcement-Mechanismen:**
- `require_scope(scope)` – Middleware-Factory für spezifische Scopes
- `require_role(min_role)` – Hierarchische Mindestrolle
- `require_admin` / `require_board` – Convenience-Shortcuts

### Frontend-RBAC (Implementiert)

- **`apps/website/src/lib/rbac.ts`** – Auto-generierter Mirror der Python-RBAC
- **`ProtectedRoute.tsx`** – Route-Guard mit Redirect zu `/Login`
- **`useAuth` Hook** – `isAdmin`, `canAccess(role)`
- **`AuthContext.tsx`** – JWT-Rollen **+ `VITE_ADMIN_EMAILS` Fallback** (🔴 Sicherheitsproblem)

### Governance-Abgleich

| Governance-Rolle | Statuten | RBAC-Mapping | Status |
|---|---|---|---|
| Obperson | § 11 | ADMIN / BOARD | ⚠️ Nicht explizit als eigene Rolle |
| Kassier*in | § 11(3)b | TREASURER | ✅ |
| Schriftführer*in | § 11(1) | BOARD | ⚠️ Keine eigene Rolle |
| Rechnungsprüfer*in | § 13 | — | ❌ Fehlt komplett |
| Ordentliches Mitglied | § 5(1)a | MEMBER | ✅ |
| Außerordentliches Mitglied | § 5(1)b | — | ❌ Kein eingeschränktes MEMBER |
| Ehrenmitglied | § 5(1)c | — | ❌ Nicht abgebildet |

---

## 17. Chat Messaging und Kommunikations Status

### Aktueller Zustand

| Aspekt | Status |
|---|---|
| Direktnachrichten | ❌ Nicht implementiert |
| Gruppenchat | ❌ Nicht implementiert |
| Realtime-Infrastruktur | ⚠️ WebSocket (`ws`-Dependency in package.json) + NATS JetStream (OpenClaw) |
| Chat-Komponente | ⚠️ `OpenClawChat.tsx` als KI-Chat-Prototyp |
| Forum-Diskussionen | ⚠️ phpBB vorhanden, nicht produktiv |
| Support-Threads | ❌ Kein Ticketsystem |
| Benachrichtigungscenter | ⚠️ `NotificationCenter.tsx` nur in figma-design-system |
| E-Mail-Benachrichtigungen | ✅ n8n-Workflows für Willkommen, Rechnungen, Mahnungen |
| Moderation | ⚠️ MODERATOR-Rolle in RBAC, aber keine Moderations-UI |

### Bewertung

Kein produktives Chat- oder Messaging-System vorhanden. Die WebSocket-Dependency und NATS JetStream (OpenClaw) bieten technische Grundlagen, sind aber nicht für User-to-User-Kommunikation konfiguriert. Forum-Diskussionen über phpBB sind vorbereitet, aber nicht produktiv.

---

## 18. E Mail Absender Notification und Domain Konsistenz Status

### Offizielle Domain-Adressen (`@menschlichkeit-oesterreich.at`)

**Öffentlich/Kontakt:** `kontakt@`, `info@`, `office@`, `support@`
**Technik/Sicherheit:** `security@`, `datenschutz@`, `gdpr@`, `gdpr-export@`, `dev@`, `tech@`, `it@`, `devops@`, `admin@`
**Finanzen:** `finanzen@`, `finance@`, `buchhaltung@`, `spenden@`
**System/Automation:** `noreply@`, `crm@`, `bounce@`, `civimail@`, `logging@`, `dmarc@`, `tlsrpt@`
**Vereinsorgane:** `vorstand@`, `conduct@`
**Personenbezogen:** `peter@`, `peter.schuller@`, `michael@`, `deploy@`, `ci@`

### Kritische Inkonsistenzen

| Problem | Schweregrad | Vorkommen |
|---|---|---|
| **`menschlichkeit-oesterreich@outlook.at`** wird in Produktion verwendet | 🔴 P0 | 7 Website-HTML-Dateien + `contact-handler.js` |
| `schuller_peter@icloud.com` / `peter.schuller@icloud.com` in Audit-Reports | 🟠 P1 | Legacy Docs (DSGVO-Bedenken) |

### Betroffene Dateien (`@outlook.at`)

- `website/index.html`
- `website/index-optimized.html`
- `website/kontakt.html`
- `website/mitmachen.html`
- `website/ueber-uns.html`
- `website/verein.html`
- `website/beitraege.html`
- `website/assets/js/contact-handler.js`

**Empfehlung:** Alle `@outlook.at`-Adressen durch `kontakt@menschlichkeit-oesterreich.at` ersetzen. Persönliche E-Mail-Adressen aus Logs/Docs entfernen.

### Notification-Architektur

| Kanal | Status |
|---|---|
| Willkommens-Mails | ✅ n8n 3-stufig |
| Rechnungs-Mails | ✅ n8n + API Templates |
| Mahnungs-Mails | ✅ n8n |
| Zahlungsbestätigungen | ✅ n8n |
| Event-Erinnerungen | ✅ n8n |
| DSGVO-Löschbestätigung | ✅ API |
| In-App-Benachrichtigungen | ❌ Nicht implementiert |
| Push-Notifications | ❌ Nicht implementiert |

---

## 19. Übersehene oder bisher ungenutzte Repo Module

| Modul | Pfad | Status | Details |
|---|---|---|---|
| **100 Figma-Komponenten** | `figma-design-system/components/` | ⚠️ Nicht verbunden | Feature- + UI-Komponenten ohne Import in aktive App |
| **Shared Design System** | `packages/design-system/` | ⚠️ Unklar | Geplant, Nutzung nicht nachweisbar |
| **Shared UI** | `packages/ui/` | ⚠️ Unklar | Geplant, aber SPA hat eigene UI-Lib |
| **ELK Stack** | `automation/elk-stack/` | ⚠️ Docker-Compose vorhanden | Nicht produktiv gestartet |
| **Monitoring Stack** | Docker Compose | ⚠️ Konfiguriert | Uptime Kuma, Prometheus, Grafana nicht aktiv |
| **Ansible Playbook** | `deployment-scripts/ansible/site.yml` | ⚠️ Vorhanden | IaC nicht produktiv genutzt |
| **`frontend/`** | `frontend/` | ⚠️ Leer | Kein `src/`, nur Konfigurationsdateien |
| **Apps/API (Minimal)** | `apps/api/app/` | ⚠️ Redundant | 4-Datei-Version parallel zur Vollversion |
| **OpenClaw Bridge** | `openclaw-bridge.json` | ⚠️ n8n-Workflow | KI-Integration vorbereitet |
| **DLQ Admin** | `dlq-admin.json` | ✅ n8n-Workflow | Dead Letter Queue Management |
| **Drupal Game-Modul** | `apps/crm/httpdocs/web/modules/custom/menschlichkeit_games/` | ⚠️ | Custom-Modul für Game-Integration in Drupal |

---

## 20. Fachdokumente und Governance Status

### Vorhandene Governance-Dokumente

| Dokument | PDF-Pfad | Textextrakt | Status |
|---|---|---|---|
| **Statuten** | `Pdf/Statuten_Verein_Menschlichkeit_Oesterreich_2025_neu.pdf` | ✅ `attached_assets/...Vereinsstatuten...txt` | 587 Zeilen, vollständig |
| **Beitragsordnung** | `Pdf/Beitragsordnung_2025_Neuformulierung_Menschlichkeit_Oesterreich.pdf` | ✅ `attached_assets/...Beitragsordnung...txt` | 83 Zeilen, vollständig |
| **Vereinsregisterauszug** | `Pdf/Vereinsregisterauszug_d68334ce-...pdf` | ✅ `attached_assets/...Vereinsregisterauszug...txt` | 91 Zeilen, vollständig |
| **Gründungsprotokoll** | `Pdf/Protokoll_Gruendungsversammlung_2025_signiert.pdf` | ❌ Kein Textextrakt | Nur PDF |
| **Mitgliederanmeldung** | `Pdf/Mitgliederanmeldung.pdf` | ❌ Kein Textextrakt | Formular |

### Eckdaten aus Governance-Dokumenten

**Offizieller Name:** „Menschlichkeit Österreich"
**ZVR-Zahl:** 1182213083
**Sitz:** 3100 St. Pölten-Pottenbrunn
**Zustellanschrift:** 3140 Pottenbrunn, Pottenbrunner Hauptstraße 108/Top 1
**Entstehungsdatum:** 28.05.2025
**Beschluss Statuten:** 21.05.2025, St. Pölten
**Beschluss Beitragsordnung:** 07.06.2025 (gültig ab 01.07.2025)

**Organschaftliche Vertreter (Funktionsperiode 21.05.2025 – 20.05.2030):**

| Funktion | Person |
|---|---|
| Obperson | Peter Schuller |
| Obperson Stellvertreter | Michael Schuller |
| Kassier | Michael Schuller |
| Schriftführer | Peter Schuller |

---

## 21. Abgeleitete Anforderungen aus Beitragsordnung, Statuten und Vereinsregister

### Aus Statuten (§§ 1–17)

| Anforderung | Referenz | Plattform-Umsetzung | Status |
|---|---|---|---|
| 3 Mitgliedsarten verwalten (ordentlich, außerordentlich, Ehren) | § 5 | CiviCRM-Typen konfiguriert, UI nicht differenziert | ⚠️ |
| Stimmrecht nur für ordentliche Mitglieder | § 5(1)a | Nicht in Voting-System abgebildet (kein Voting) | ❌ |
| Ehrenmitglieder beitragsfrei | § 5(1)c | Nicht automatisiert | ❌ |
| Vorstandsmitglieder beitragsfrei | § 8(1)b | Nicht automatisiert | ❌ |
| Mitgliederversammlung (Abstimmung) | § 10 | Kein Voting-System | ❌ |
| Digitales Mitgliederverzeichnis unter Datenschutz | § 12(3) | CiviCRM + MemberManagement UI | ✅ |
| Mahnverfahren (2x Mahnung → Streichung) | § 7(1)c | n8n `finance-dunning.json` | ✅ |
| Rechnungsprüfer-Zugang zu Finanzdaten | § 13 | Keine separate Rolle/Ansicht | ❌ |
| Schiedsgericht-Verfahren | § 14 | Nicht digitalisiert | ❌ |
| DSGVO-Löschung | § 16 | API + n8n implementiert | ✅ |
| Obperson + Vorstandsmitglied gemeinsam vertreten | § 11(3)a | Nicht in Freigabelogik | ❌ |
| Kassier*in Einzelvertretung für Finanzen | § 11(3)b | TREASURER-Rolle vorhanden | ✅ |
| Sitz-Verlegung durch einstimmigen Vorstandsbeschluss | § 1(3) | Nicht digitalisiert | N/A |

### Aus Beitragsordnung

| Anforderung | Referenz | Plattform-Umsetzung | Status |
|---|---|---|---|
| Standard: €36/Jahr oder €3/Monat | § 2a | In Zahlungsflows nicht gestaffelt | ⚠️ |
| Ermäßigt: €18/Jahr oder €1,50/Monat | § 2b | Nicht in UI | ❌ |
| Härtefall: €0 auf Antrag | § 2c | Nicht in UI | ❌ |
| Anteiliger Beitrag bei Eintritt im laufenden Jahr | § 3(2) | Nicht automatisiert | ❌ |
| Fälligkeit Jahresbeitrag: 31. März | § 4(1) | Nicht automatisch geprüft | ❌ |
| Fälligkeit Monatsbeitrag: 5. des Monats | § 4(2) | Nicht automatisch geprüft | ❌ |
| SEPA-Dauerauftrag oder PayPal | § 5 | SEPA + PayPal implementiert | ✅ |

### Aus Vereinsregister

| Anforderung | Plattform-Relevanz | Status |
|---|---|---|
| Korrekte Verwendung „Menschlichkeit Österreich" (ohne Sonderzeichen) | Impressum, Footer, Branding | ✅ |
| ZVR-Zahl 1182213083 im Impressum | Impressum | Prüfen |
| Zustellanschrift 3140 Pottenbrunn | Kontaktseite, Impressum | Prüfen |

---

## 22. Empfohlenes Deploy Modell

### Bewertung der Optionen

| Modell | Eignung | Begründung |
|---|---|---|
| **git pull auf Server** | ⚠️ Bedingt | Einfach, aber erfordert Build auf Server; Build-Tools-Installation auf Plesk notwendig; Risiko von fehlschlagenden Builds in Produktion |
| **Artefakt-Deploy** | ⚠️ Komplex | CI baut Artefakte, Upload per SSH; sauberer, aber erfordert Artefakt-Versionierung und Storage |
| **rsync oder scp Deploy** | ✅ Empfohlen | CI baut lokal, rsync überträgt nur geänderte Dateien per SSH; schnell, idempotent, minimaler Serverkontakt |

### Empfehlung: rsync-Deploy (bereits implementiert)

**Begründung:**
1. **Bereits implementiert:** `deploy-plesk.yml` nutzt rsync über SSH für Frontend, API, CRM und Games
2. **Plesk-kompatibel:** rsync arbeitet direkt mit dem Dateisystem, kein Docker-Orchestrator auf Server nötig
3. **Inkrementell:** Nur geänderte Dateien werden übertragen → schnelles Deployment
4. **Atomarität:** Symlink-basiertes Blue-Green-Deployment ermöglicht Rollback < 30s
5. **Separation:** Verschiedene Services können unabhängig deployed werden

**Empfohlene Verbesserungen:**

| Aspekt | Aktuell | Empfohlen |
|---|---|---|
| Rollback | Manuell | Git-Tag + Symlink-basiert (< 30s) |
| Post-Deploy | Kein Check | Automatisierte Smoke Tests (`/healthz`, `/readyz`) |
| Secrets | `.env.vault` + GitHub Secrets | Nur GitHub Secrets → Deployment-Zeit injiziert |
| Zero-Downtime | Nicht gewährleistet | Blue-Green via Symlinks |
| Docker-Services | Nicht genutzt | API + Redis als Container, Frontend/Website als statische Dateien |
| Staging | Separater Deploy-Workflow | Automatisch bei develop-Push |

---

## 23. Priorisierte nächsten Schritte

### 🔴 P0 – Kritisch (sofortige Umsetzung)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 1 | `VITE_ADMIN_EMAILS` eliminieren – ausschließlich JWT-Claims für Rollenprüfung | Security | Mittel |
| 2 | `menschlichkeit-oesterreich@outlook.at` in 8 Dateien durch `kontakt@menschlichkeit-oesterreich.at` ersetzen | Branding/Trust | Niedrig |
| 3 | CRM SMTP-Passwort und Hash Salt aus Platzhaltern in echte Werte ändern | Deployment | Niedrig |
| 4 | `routers/metrics.py` Mock-Daten durch echte CiviCRM-Aggregation ersetzen | Backend | Hoch |
| 5 | Plesk Panel Port 8443 auf IP-Whitelist einschränken | Security | Niedrig |
| 6 | SPF/DKIM/DMARC prüfen und produktiv erzwingen | E-Mail-Sicherheit | Niedrig |

### 🟠 P1 – Hoch (zeitnahe Umsetzung)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 7 | Admin-Dashboard und Member-Dashboard mit echten API-Daten verbinden | Frontend | Hoch |
| 8 | API-Verzeichnis-Duplizierung auflösen (`apps/api/` vs `api.*/`) | Architektur | Mittel |
| 9 | E-Mail-Verifizierung bei Registrierung implementieren | Security/UX | Mittel |
| 10 | Game SSO via JWT-Token aus Hauptsystem | Integration | Mittel |
| 11 | Game Progress API (`POST /api/member/game/progress`) implementieren | Backend | Mittel |
| 12 | Beitragsordnung-Staffelung (Standard/Ermäßigt/Härtefall) in Join-UI | Frontend | Mittel |
| 13 | Mitgliedsarten (ordentlich/außerordentlich/Ehren) in UI differenzieren | Frontend | Mittel |
| 14 | Fail2ban für SSH, HTTP, SMTP aktivieren | Security | Mittel |
| 15 | SSH Passwort-Auth deaktivieren | Security | Niedrig |
| 16 | Uptime Kuma starten (Docker Compose vorhanden) | Monitoring | Niedrig |
| 17 | Backup-System verifizieren und Restore-Test dokumentieren | Betrieb | Niedrig |
| 18 | Rechnungsprüfer-Rolle im RBAC ergänzen | Governance | Niedrig |
| 19 | Datenexport Self-Service (DSGVO Art. 15) | Compliance | Mittel |

### 🟡 P2 – Mittel (planmäßige Umsetzung)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 20 | `figma-design-system/components/` in aktive App integrieren oder als Shared Package | Architektur | Hoch |
| 21 | Voting-System für Mitgliederversammlung | Feature | Hoch |
| 22 | Forum SSO + API-Integration | Integration | Hoch |
| 23 | Event-Management CRUD-API + Kalenderansicht | Feature | Hoch |
| 24 | Blog/News CMS-Workflow mit Content-Editor-Rolle | Feature | Hoch |
| 25 | Globale Suche implementieren | Feature | Mittel |
| 26 | Root-Verzeichnis aufräumen (50+ MD-Dateien → `/docs`) | Repo-Hygiene | Mittel |
| 27 | `CODEOWNERS` Datei anlegen | Governance | Niedrig |
| 28 | Rate Limiter auf Redis umstellen | Security | Mittel |
| 29 | `frontend/` Verzeichnis bereinigen oder entfernen | Repo-Hygiene | Niedrig |
| 30 | Favicon aus Logo generieren (SVG + ICO + PNG) | UX | Niedrig |
| 31 | Open Graph + Structured Data auf öffentlichen Seiten | SEO | Mittel |

### ⚪ P3 – Niedrig (bei Gelegenheit)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 32 | Chat/Messaging-System | Feature | Hoch |
| 33 | Notification Center (In-App) | Feature | Hoch |
| 34 | Dark Mode implementieren | UX | Hoch |
| 35 | Prometheus + Grafana vollständig konfigurieren | Monitoring | Hoch |
| 36 | ELK Stack in Betrieb nehmen | Logging | Hoch |
| 37 | CDN (Cloudflare) vorschalten | Performance | Mittel |
| 38 | Nextcloud unter `cloud.*` aktivieren | Infrastruktur | Hoch |
| 39 | SVG-Version des Logos | Branding | Mittel |
| 40 | Schiedsgericht-Prozess digitalisieren | Governance | Mittel |

---

## 24. Welche Teile sofort umgesetzt werden sollen

Die folgenden Maßnahmen haben den höchsten Impact bei geringstem Risiko und sollten **unmittelbar** angegangen werden:

1. **`VITE_ADMIN_EMAILS` eliminieren** – Clientseitige Admin-Prüfung ist ein kritisches Sicherheitsrisiko. Die serverseitige JWT-Claims-basierte RBAC ist bereits implementiert (`shared.py`); der Frontend-Fallback in `AuthContext.tsx` muss entfernt werden.

2. **`@outlook.at`-Adressen ersetzen** – 8 Dateien verwenden `menschlichkeit-oesterreich@outlook.at`. Dies untergräbt Vertrauen und Domain-Konsistenz. Einfacher Textersatz durch `kontakt@menschlichkeit-oesterreich.at`.

3. **Metrics-API mit echten Daten** – Das Mock-Daten-Problem in `routers/metrics.py` blockiert alle Dashboard-Funktionen (Admin, Finance, Board/Treasurer). Ersetzen durch CiviCRM APIv4-Aggregation.

4. **CRM-Platzhalter auflösen** – SMTP-Passwort (`'your-email-password-here'`), Hash Salt und Theme-Name in `settings.php` sind Deployment-Blocker.

5. **Plesk + SSH härten** – Port 8443 IP-Whitelist und SSH-Key-Only-Auth sind schnelle, kritische Sicherheitsverbesserungen.

6. **SPF/DKIM/DMARC** – E-Mail-Authentizität prüfen und erzwingen, um Spoofing und Zustellprobleme zu verhindern.

---

## 25. Was vorerst bewusst unverändert bleiben soll

| Bereich | Begründung |
|---|---|
| **Vanilla Three.js (kein R3F-Migration)** | Die bestehende 3D-Engine ist produktionsreif und funktional. Eine Migration auf React Three Fiber hätte keinen funktionalen Mehrwert, wäre aber hoch disruptiv. |
| **Zwei Frontend-Systeme (Website + SPA)** | Die Konsolidierung erfordert eine strategische Entscheidung (SPA-only vs. Hybrid). Aktuell funktionieren beide Systeme unabhängig. Zusammenführung ist P2/P3. |
| **phpBB als Forum-Plattform** | phpBB ist konfiguriert und hat ein Custom Theme. Ein Wechsel zu Discourse wäre ein Infrastrukturprojekt ohne sofortigen Mehrwert. |
| **OpenClaw Multi-Agent-System** | Eigenständiges Subsystem mit eigener Architektur. Integrationspunkte (n8n-Bridge, Chat-Prototyp) existieren. Tiefere Integration ist P3. |
| **Nextcloud-Aktivierung** | Geplant, aber abhängig von Storage-Strategie und Policies. Kein akuter Bedarf, da keine aktive Nutzung dokumentiert. |
| **ELK Stack** | Docker-Compose-Definition vorhanden, aber aktuelle Logging-Lösung (PII-Sanitizer + n8n Mail-Archiver) ist funktional. |
| **Ansible-Playbook** | `deployment-scripts/ansible/site.yml` existiert, aber rsync-Deploy über GitHub Actions ist etabliert und funktional. |
| **Monorepo-Struktur** | Trotz Komplexität (50+ Root-MD-Dateien, duplizierte Verzeichnisse) ist die npm-Workspace-Struktur funktional. Bereinigung ist P2, nicht dringend. |
| **MariaDB + PostgreSQL Koexistenz** | CiviCRM benötigt MariaDB; API + Games nutzen PostgreSQL. Diese Trennung ist architekturbedingt korrekt. |
| **In-Memory Rate Limiter** | Funktional für Single-Server-Setup. Redis-Migration ist P2-Verbesserung, kein kritisches Problem. |
| **Persönliche E-Mail-Adressen in Docs** | `schuller_peter@icloud.com` etc. sollten perspektivisch entfernt werden (DSGVO), sind aber in historischen Audit-Dokumenten nicht funktionsrelevant. |

---

### Dateistatistiken

| Bereich | Dateien |
|---|---|
| `apps/website/src/` (React SPA) | 99 TS/TSX |
| `figma-design-system/components/` | 100 TSX |
| `apps/game/` | 102 Dateien |
| `automation/n8n/workflows/` | 25 JSON |
| `.github/workflows/` | 40+ YAML |
| `website/` (statisch) | 12 HTML + 6 JS |
| `Pdf/` | 5 PDFs |

### Technologie-Stack

| Schicht | Technologie | Version |
|---|---|---|
| Frontend (SPA) | React + TypeScript + Vite | React 18, Vite 7 |
| Frontend (statisch) | HTML + Tailwind + Bootstrap | 5.x |
| Backend API | FastAPI + Python | 3.12+ |
| CRM | Drupal 10 + CiviCRM | PHP 8.1 |
| Game | Vanilla JS + Three.js | Aktuell |
| Forum | phpBB | Aktuell |
| Automation | n8n | 1.72.1 |
| Datenbank | PostgreSQL + MariaDB | ≥15 / 10.6.22 |
| Cache | Redis | 7 |
| ORM (API) | asyncpg / SQLAlchemy + Alembic | — |
| ORM (Games) | Prisma | 5.22 |
| KI-System | OpenClaw (NATS + Qdrant) | Custom |
| Paketmanager | npm Workspaces | npm 11+ |
| Runtime | Node.js | ≥22.19 |

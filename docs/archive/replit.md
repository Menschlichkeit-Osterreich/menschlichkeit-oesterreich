# Menschlichkeit Österreich – Multi-Service NGO Platform

## Project Overview

An Austrian NGO platform providing democratic participation, social justice advocacy, education, and community engagement tools.

**Domain:** menschlichkeit-oesterreich.at  
**Server:** 5.183.217.146 (Plesk, Single Server)  
**ZVR:** 1182213083 | **Gegründet:** 28. Mai 2025

---

## Architecture

- **Frontend** (`apps/website/`): React + TypeScript + Vite + Tailwind CSS (SPA)
- **API** (`apps/api/`): Python FastAPI backend with JWT auth + server-side RBAC
- **CRM** (`apps/crm/`): Drupal 10 + CiviCRM (Mitgliederverwaltung)
- **Game** (`apps/game/`): "Brücken Bauen" — Interaktives Demokratie-Lernspiel (HTML/JS PWA)
- **Design System** (`figma-design-system/`): Figma Design Tokens (JSON) → Tailwind
- **Automation** (`automation/n8n/`): n8n Workflows (30+, DSGVO, E-Mail, etc.)
- **Monitoring**: Uptime Kuma + Prometheus + Grafana (Docker Compose definiert)

---

## Brand Identity

- **Logo:** `apps/website/public/logo.jpg` — red-orange gradient with white tree (Baum) and "Verein Menschlichkeit Österreich"
- **Primary brand color:** red (#dc2626) to orange (#ea580c) gradient
- **Design tokens:** Updated primary palette to red (was sky-blue)
- **NavBar:** Logo-Bild (40×40 kreisförmig) + "VEREIN / Menschlichkeit Österreich" Text
- **Hero:** Full-width Brand-Gradient + Logo prominent (176×176 px, rounded-3xl)
- **Login:** Split-Layout — Brand-Panel links (rot-orange Gradient + Logo), Formular rechts

---

## Running the App

```bash
cd apps/website && npm run dev
```

- Host: `0.0.0.0`
- Port: `5000`
- Configured in `apps/website/vite.config.ts`

API:
```bash
cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Key Config Files

| Datei | Zweck |
|---|---|
| `apps/website/vite.config.ts` | Port 5000, all hosts, allowedHosts: true |
| `apps/website/tailwind.config.cjs` | Tailwind mit Tokens aus `../../figma-design-system/` |
| `apps/website/src/routes/ProtectedRoute.tsx` | Auth guard (default export) |
| `apps/website/src/styles/tokens.css` | CSS Custom Properties (primary = rot) |
| `apps/website/src/config/email.ts` | Zentrale E-Mail + Governance Konstanten |
| `apps/api/app/email_config.py` | Backend E-Mail + Org Konstanten |
| `figma-design-system/00_design-tokens.json` | Design Tokens Quelle (primary = #dc2626) |
| `.env.example` | Env-Template |
| `docker-compose.monitoring.yml` | Monitoring Stack |

---

## Key Components / Pages

| Datei | Beschreibung |
|---|---|
| `apps/website/src/components/NavBar.tsx` | Sticky NavBar mit Logo, responsive, Dropdown |
| `apps/website/src/layouts/PublicLayout.tsx` | Shell NavBar + dunkler 3-Spalten Footer |
| `apps/website/src/layouts/AuthLayout.tsx` | Split-Panel: Brand links, Formular rechts |
| `apps/website/src/layouts/DashboardLayout.tsx` | Sidebar (Mitglied/Admin rollenabhängig) |
| `apps/website/src/pages/Home.tsx` | Hero rot-orange + Logo + Stats + Themenkarten + CTA |
| `apps/website/src/pages/Login.tsx` | Login mit Passwort-Toggle + ZVR/Gründungsinfos |
| `apps/website/src/pages/Register.tsx` | Registrierung mit Mitgliedschaftswahl |
| `apps/website/src/pages/PasswordReset.tsx` | Passwort-Zurücksetzen Flow |
| `apps/website/src/pages/ForumPage.tsx` | Forum: Threads, Kategorien, Erstellen |
| `apps/website/src/pages/ForumThread.tsx` | Forum: Thread-Detail mit Antworten |
| `apps/website/src/pages/BlogPage.tsx` | Blog/Neuigkeiten: Artikel-Grid |
| `apps/website/src/pages/BlogArticle.tsx` | Blog: Artikel-Detail mit SEO |
| `apps/website/src/pages/Spiel.tsx` | Game-Landingpage mit WebGL 3D-Szene |
| `apps/website/src/components/game/Game3DScene.tsx` | WebGL 3D Brücken-Visualisierung |
| `apps/website/src/auth/AuthContext.tsx` | JWT-Auth (sessionStorage: `moe_auth_token`) |
| `apps/website/src/services/dashboard-api.ts` | Frontend API Service Layer |

---

## API Routers

| Router | Prefix | Endpunkte |
|---|---|---|
| `auth.py` | `/auth` | login, register, password-reset |
| `members.py` | `/members` | CRUD, profile |
| `forum.py` | `/forum` | categories, threads, posts |
| `blog.py` | `/blog` | articles CRUD |
| `events.py` | `/events` | CRUD, RSVP |
| `roles.py` | `/roles` | list, assign |
| `finance.py` | `/finance` | overview, invoices |
| `metrics.py` | (various) | KPIs, timeseries, donations |

---

## Auth & RBAC

- **JWT:** Gespeichert in `sessionStorage` unter `moe_auth_token`, enthält `role`-Claim
- **Server-side RBAC:** `apps/api/app/rbac.py` — `require_role()` FastAPI dependency
- **isAdmin:** Aus JWT-Claims (`role === 'admin' || role === 'sysadmin'`), serverseitig gesetzt via `ADMIN_EMAILS` Env-Variable
- **AdminRoute:** `routes/AdminRoute.tsx` — prüft `isAdmin` aus JWT, leitet Nicht-Admins um
- **Rollen (aufsteigend):** `guest < member < moderator < admin < sysadmin`
- **ErrorBoundary:** Globaler Error-Handler in `main.tsx`
- **Cookie-Consent:** DSGVO-konformes Banner in `main.tsx`
- **RBAC-Dokumentation:** `docs/security/rbac.md`

---

## Documentation

| Dokument | Pfad |
|---|---|
| **Implementierungsprotokoll** | `README_IMPLEMENTATION_LOG.md` |
| **Deployment-Anleitung** | `README_DEPLOY.md` |
| **Governance-Kontext** | `README_GOVERNANCE_CONTEXT.md` |
| **Plattform-Gesamtanalyse** | `README_ANALYSIS.md` |
| Plattform-Audit 2026 | `docs/architecture/plattform-audit-2026.md` |
| RBAC-Matrix | `docs/security/rbac.md` |
| Subdomain-Architektur | `docs/architecture/subdomain-matrix.md` |
| E-Mail-Architektur | `docs/operations/mail-architecture.md` |
| Monitoring-Matrix | `docs/operations/monitoring-matrix.md` |
| Server-Hardening | `docs/security/hardening.md` |
| DSGVO-Compliance | `docs/compliance/DSGVO-COMPLIANCE-BLUEPRINT.md` |

---

## Deployment

Scripts in `scripts/`:
- `deploy.sh` — Full deploy: Build + rsync to Plesk
- `validate_env.sh` — Validate all env vars
- `post_deploy_verify.sh` — Post-deploy health checks

Static Site Build:
- **Build:** `cd apps/website && npm run build`
- **Public dir:** `apps/website/dist`

---

## Governance Normalization (Completed)

All UI texts, fees, roles, addresses, and official data normalized against:
- **Statuten** (Beschluss 21.05.2025)
- **Vereinsregisterauszug** (ZVR: 1182213083)
- **Beitragsordnung 2025** (gültig ab 01.07.2025)

Key corrections applied:
- Beiträge: €36 Standard, €18 Ermäßigt, €0 Härtefall
- Mitgliedschaftsarten: ordentlich, außerordentlich, Ehrenmitglieder
- Rollenbezeichnung: Obperson (not Obmann/Obfrau)
- Vereinsorgan: Mitgliederversammlung (not Generalversammlung)
- E-Mail: kontakt@menschlichkeit-oesterreich.at
- Adresse: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn
- Vereinsbehörde: LPD Niederösterreich

Email config centralized in:
- Backend: `apps/api/app/email_config.py`
- Frontend: `apps/website/src/config/email.ts`

---

## Critical TODOs (P0)

1. ~~Admin-Rollenprüfung ins FastAPI-Backend verlagern~~ **Erledigt** — JWT `role`-Claim + `AdminRoute` + serverseitige `ADMIN_EMAILS`
2. Plesk-Panel (Port 8443) auf IP-Whitelist einschränken
3. SPF/DKIM/DMARC verifizieren und setzen
4. Fail2ban aktivieren (SSH, HTTP, SMTP)
5. Uptime Kuma starten: `docker compose -f docker-compose.monitoring.yml up -d uptime-kuma`

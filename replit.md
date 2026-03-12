# Menschlichkeit Österreich – Multi-Service NGO Platform

## Project Overview

An Austrian NGO platform providing democratic participation, social justice advocacy, education, and community engagement tools.

**Domain:** menschlichkeit-oesterreich.at  
**Server:** 5.183.217.146 (Plesk, Single Server)  
**ZVR:** 1182213083 | **Gegründet:** 28. Mai 2025

---

## Architecture

- **Frontend** (`apps/website/`): React + TypeScript + Vite + Tailwind CSS (SPA)
- **API** (`apps/api/`): Python FastAPI backend
- **CRM** (`apps/crm/`): Drupal 10 + CiviCRM (Mitgliederverwaltung)
- **Game** (`apps/game/`): "Brücken Bauen" — Interaktives Demokratie-Lernspiel (HTML/JS PWA, via Symlink in `public/game/` eingebunden)
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

---

## Key Config Files

| Datei | Zweck |
|---|---|
| `apps/website/vite.config.ts` | Port 5000, all hosts, allowedHosts: true |
| `apps/website/tailwind.config.cjs` | Tailwind mit Tokens aus `../../figma-design-system/` |
| `apps/website/src/routes/ProtectedRoute.tsx` | Auth guard (default export) |
| `apps/website/src/styles/tokens.css` | CSS Custom Properties (primary = rot) |
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
| `apps/website/src/pages/Spiel.tsx` | Game-Landingpage mit Embed-Modal (iframe → `/game/index.html`) |
| `apps/website/src/auth/AuthContext.tsx` | JWT-Auth (sessionStorage: `moe_auth_token`) |

---

## Auth & RBAC

- **JWT:** Gespeichert in `sessionStorage` unter `moe_auth_token`, enthält `role`-Claim
- **isAdmin:** Aus JWT-Claims (`role === 'admin' || role === 'sysadmin'`), serverseitig gesetzt via `ADMIN_EMAILS` Env-Variable
- **AdminRoute:** `routes/AdminRoute.tsx` — prüft `isAdmin` aus JWT, leitet Nicht-Admins um
- **Rollen:** `guest`, `member`, `moderator`, `admin`, `sysadmin`
- **ErrorBoundary:** Globaler Error-Handler in `main.tsx`
- **Cookie-Consent:** DSGVO-konformes Banner in `main.tsx`
- **RBAC-Dokumentation:** `docs/security/rbac.md`

---

## Documentation

| Dokument | Pfad |
|---|---|
| **Plattform-Gesamtanalyse** | `README_ANALYSIS.md` |
| Plattform-Audit 2026 | `docs/architecture/plattform-audit-2026.md` |
| RBAC-Matrix | `docs/security/rbac.md` |
| Subdomain-Architektur | `docs/architecture/subdomain-matrix.md` |
| E-Mail-Architektur | `docs/operations/mail-architecture.md` |
| Monitoring-Matrix | `docs/operations/monitoring-matrix.md` |
| Server-Hardening | `docs/security/hardening.md` |
| DSGVO-Compliance | `docs/compliance/DSGVO-COMPLIANCE-BLUEPRINT.md` |

---

## Fixes Applied

1. `vite.config.ts`: port 5000, host `0.0.0.0`, `allowedHosts: true`
2. `ProtectedRoute.tsx`: named → default export
3. `tailwind.config.cjs`: Pfad korrigiert zu `../../figma-design-system/`

---

## Design Improvements

1. **Brand-Farben:** Primärfarbe → Rot (#dc2626), Design Tokens aktualisiert
2. **NavBar:** Logo-Bild + "VEREIN"-Label, Dropdown, Mitgliederbereich-Link
3. **Home:** Full-width Brand-Hero mit Gradient, Logo, Stats-Bar, 6 Themenkarten, CTA
4. **Footer:** Dunkles 3-Spalten-Layout mit Logo und Kontaktinfo
5. **AuthLayout:** Split-Panel-Layout (Brand links, Formular rechts)
6. **Login:** Passwort anzeigen/verstecken, "Passwort vergessen", "Jetzt Mitglied werden"
7. **DashboardLayout:** Sticky Sidebar mit Rollen-abhängiger Navigation

---

## Deployment

Konfiguriert als Static Site:
- **Build:** `cd apps/website && npm run build`
- **Public dir:** `apps/website/dist`

---

## Governance Normalization (Completed)

All UI texts, fees, roles, addresses, and official data normalized against:
- **Statuten** (Beschluss 21.05.2025)
- **Vereinsregisterauszug** (ZVR: 1182213083)
- **Beitragsordnung 2025** (gültig ab 01.07.2025)

Key corrections applied:
- Beiträge: €36 Standard, €18 Ermäßigt, €0 Härtefall (was: €60/€24)
- Mitgliedschaftsarten: ordentlich, außerordentlich, Ehrenmitglieder (removed: Förderndes Mitglied)
- Rollenbezeichnung: Obperson (was: Obmann/Obfrau)
- Vereinsorgan: Mitgliederversammlung (was: Generalversammlung)
- Vorstand: Obperson + Stellv. + Kassier*in; Funktionsperiode bis 5 Jahre (was: 2 Jahre)
- E-Mail: kontakt@menschlichkeit-oesterreich.at (was: outlook.at / office@)
- Adresse: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn (was: St. Pölten / Wien)
- Vereinsbehörde: LPD Niederösterreich (was: BH St. Pölten)
- ZVR/Registerdaten in API invoice_service.py korrigiert

---

## Critical TODOs (P0)

1. ~~Admin-Rollenprüfung ins FastAPI-Backend verlagern~~ **Erledigt** — JWT `role`-Claim + `AdminRoute` + serverseitige `ADMIN_EMAILS`
2. Plesk-Panel (Port 8443) auf IP-Whitelist einschränken
3. SPF/DKIM/DMARC verifizieren und setzen
4. Fail2ban aktivieren (SSH, HTTP, SMTP)
5. Uptime Kuma starten: `docker compose -f docker-compose.monitoring.yml up -d uptime-kuma`

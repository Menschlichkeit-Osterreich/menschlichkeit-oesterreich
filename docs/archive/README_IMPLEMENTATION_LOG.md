# Implementierungsprotokoll – Menschlichkeit Österreich Plattform

## Phase 3: Core Platform Implementation

### Zusammenfassung

Die Kernplattform wurde vom Fragmentstadium zu einer funktionalen, verbundenen Anwendung weiterentwickelt.

### Erledigte Aufgaben

#### 1. Frontend-Anwendung (apps/website/)
- React SPA mit React Router, Lazy Loading und Code Splitting
- Routing: Öffentliche Seiten, Auth-Flow, Mitgliederbereich, Admin-Bereich
- Layouts: PublicLayout, AuthLayout, DashboardLayout, SettingsLayout
- Neue Seiten: Forum, Blog/News, Registrierung, Passwort-Reset
- Navigation: NavBar mit Forum, Blog, Veranstaltungen in Hauptnavigation
- 3D-Spielintegration: WebGL-basierte Brückenvisualisierung auf der Spiel-Seite

#### 2. Backend API (apps/api/)
- FastAPI mit vollständigem RBAC (Rollen: guest, member, moderator, admin, sysadmin)
- Neue Router: auth, members, forum, blog, events, roles, finance (+ bestehende metrics)
- JWT-basierte Authentifizierung mit serverseitiger Rollenprüfung
- Passwort-Hashing mit PBKDF2-HMAC-SHA256
- Pydantic-Schemas für alle Endpunkte
- Datenbankmigrationen via CREATE TABLE IF NOT EXISTS
- CSRF-Schutz, Rate Limiting, Security Headers

#### 3. Server-Side RBAC
- RBAC-Modul (apps/api/app/rbac.py) mit Rollenhierarchie
- require_role() Dependency für FastAPI-Endpunkte
- ADMIN_EMAILS-Umgebungsvariable für initiale Admin-Zuordnung
- JWT-Claims enthalten Rolle, serverseitig validiert

#### 4. API-Endpunkte
| Modul | Endpunkte | RBAC |
|-------|-----------|------|
| Auth | POST /auth/login, /auth/register, /auth/password-reset | Öffentlich |
| Members | GET/PUT/DELETE /members, /members/{id} | moderator+ / admin+ |
| Forum | GET /forum/categories, /forum/threads, POST /forum/threads, /forum/posts | auth / moderator+ |
| Blog | GET/POST/PUT/DELETE /blog/articles | öffentlich / moderator+ |
| Events | GET/POST/PUT/DELETE /events, POST /events/{id}/rsvp | öffentlich / moderator+ / auth |
| Roles | GET /roles, POST /roles/assign | admin+ |
| Finance | GET /finance/overview, /finance/invoices | admin+ |
| Metrics | GET /kpis/overview, /members/timeseries, etc. | analytics |

#### 5. E-Mail-Normalisierung
- Zentrale E-Mail-Konfiguration: apps/api/app/email_config.py, apps/website/src/config/email.ts
- Alle E-Mail-Adressen auf @menschlichkeit-oesterreich.at normalisiert

#### 6. Governance-Alignment
- Mitgliedschaftsarten: ordentlich, außerordentlich, ermäßigt, Härtefall, Ehrenmitglied
- Beiträge: €36 Standard, €18 Ermäßigt, €0 Härtefall (gemäß Beitragsordnung 2025)
- Organe: Mitgliederversammlung, Vorstand, Rechnungsprüfer*innen, Schiedsgericht
- Rollenbezeichnung: Obperson (nicht Obmann/Obfrau)

#### 7. 3D-Spielmodul
- WebGL-basiertes 3D-Brückenbauspiel (Game3DScene.tsx)
- Fortschrittsanzeige mit Prozentbalken
- Interaktive Canvas-Grafik mit animierter Szene
- In Spiel-Landingpage integriert

#### 8. Deployment-Skripte
- Bestehende Skripte (deploy.sh, validate_env.sh, post_deploy_verify.sh) waren bereits vorhanden und funktional

### Architektur

```
apps/
├── website/          # React + TypeScript + Vite + Tailwind (Port 5000)
│   └── src/
│       ├── pages/    # Alle Seitenkomponenten
│       ├── layouts/  # Layout-Shells
│       ├── auth/     # AuthContext (JWT)
│       ├── services/ # API-Client
│       └── config/   # E-Mail, Governance-Konstanten
├── api/              # FastAPI Backend
│   └── app/
│       ├── routers/  # auth, members, forum, blog, events, roles, finance, metrics
│       ├── schemas/  # Pydantic-Models
│       ├── rbac.py   # Server-side RBAC
│       └── email_config.py
└── game/             # Brücken Bauen PWA (HTML/JS)
```

### Sprache

Alle UI-Texte in österreichischem Deutsch (Österreichisches Deutsch).

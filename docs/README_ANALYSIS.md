# Plattform-Analyse – Menschlichkeit Österreich

**Typ:** Bestandsaufnahme | **Erstellt:** 2026-03 | **Analysiert von:** Replit Agent (Senior DevOps / Security Audit)  
**Klassifikation:** INTERN – Nicht öffentlich

---

## 1. Erkannter Ist-Zustand

### Projektart

**Vollständiges Full-Stack-Monorepo** mit vier deployablen Services:

| Service | Pfad | Technologie | Deploybart |
|---|---|---|---|
| Frontend SPA | `apps/website/` | React 18 + TypeScript + Vite | Build → static dist/ |
| REST-API | `apps/api/` | FastAPI (Python 3) + uvicorn | rsync → pip install |
| CRM/Vereinsverwaltung | `apps/crm/` | Drupal 10 + CiviCRM | rsync → composer install |
| Webgame | `apps/game/` | Static HTML/CSS/JS | rsync (kein Build) |
| Automation | `automation/n8n/` | n8n | Docker Compose |

### Infrastruktur

- **Server:** Single-Server, Plesk-Hosting, IP 5.183.217.146
- **Webserver:** nginx 1.28.0 (Reverse Proxy)
- **Datenbank:** MariaDB 10.6.22
- **PHP:** 8.4.11
- **CI/CD:** GitHub Actions (51 Workflows definiert)
- **Container:** Docker Compose für Monitoring, n8n, ELK-Stack (lokal/optional)

### Paketmanager & Build

| Bereich | Tool | Build-Skript |
|---|---|---|
| Root | npm (Workspaces) | `npm run build:frontend` |
| Frontend | npm + Vite | `cd apps/website && npm run build` → `dist/` |
| API | pip3 | kein Build; rsync → `pip install -r requirements.txt` |
| CRM | Composer | rsync → `composer install --no-dev` |
| Game | — | kein Build; rsync direkt |

### Replit-Konfiguration

- `.replit`: Workflow „Start application" → `cd apps/website && npm run dev`
- Port: 5000 | Host: 0.0.0.0 | allowedHosts: true
- Module: php-8.2, nodejs-20, web

---

## 2. Produktionsrelevante Konfiguration

### Frontend (VITE_*-Variablen)

| Variable | Verwendung | Risiko |
|---|---|---|
| `VITE_ADMIN_EMAILS` | clientseitiger Admin-Check | **P0 – Sicherheitslücke** |
| `VITE_API_BASE_URL` | API-Basis-URL | Korrekt konfigurieren |
| `VITE_API_URL` | API-URL | Korrekt konfigurieren |
| `VITE_CIVICRM_BASE_URL` | CRM-URL | Korrekt konfigurieren |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe-Integration | Nur Public Key – OK |
| `VITE_PAYPAL_CLIENT_ID` | PayPal-Integration | Nur Client ID – OK |
| `VITE_GITHUB_TOKEN` | GitHub-Integration | **P1 – Token nie ins Frontend** |
| `VITE_OPENCLAW_BRIDGE_URL` | OpenClaw-Integration | Prüfen |

### API (FastAPI)

| Aspekt | Konfiguration | Risiko |
|---|---|---|
| CORS | Hartcodiert in `apps/api/app/main.py` | Mittel – keine ENV-Variable |
| CORS Prod | `menschlichkeit-oesterreich.at`, `www.*`, `app.*`, `admin.*` | Fehlend: `localhost:5000` für lokale Replit-Entwicklung |
| Health: Liveness | `GET /healthz` | ✅ Vorhanden |
| Health: Readiness | `GET /readyz` | ✅ Vorhanden |
| JWT-Secret | `JWT_SECRET_KEY` ENV-Var erforderlich (Pflicht beim Start) | ✅ Korrekt implementiert |
| Rate Limiting | In-Memory, konfigurierbar per ENV | OK (kein Redis → Neustart löscht State) |
| RBAC | `apps/api/src/auth/rbac.py` – serverseitige Rollen/Scopes | ✅ Vollständig implementiert |

### Widerspruch: Frontend vs. API-RBAC

```
Frontend:  isAdmin = VITE_ADMIN_EMAILS.includes(email)  ← clientseitig, unsicher (P0)
API:       Role.ADMIN, Role.BOARD, Role.MEMBER per JWT-Claim  ← serverseitig, korrekt
```

**Die API hat bereits ein vollständiges serverseitiges RBAC-System, aber das Frontend nutzt es nicht.**

---

## 3. Stärken des aktuellen Projekts

| Stärke | Details |
|---|---|
| ✅ Vollständige RBAC-Implementierung im Backend | `apps/api/src/auth/rbac.py` mit Roles, Scopes, Subrollen |
| ✅ Health-Endpunkte vorhanden | `/healthz` und `/readyz` in FastAPI |
| ✅ Security-Middleware vorhanden | CSRF, Rate Limiting, JWT-Pflichtprüfung beim Start |
| ✅ Monitoring-Stack definiert | Uptime Kuma + Prometheus + Grafana + Alertmanager |
| ✅ GitHub Actions vorhanden | 51 Workflows, davon 3 Deploy-Workflows |
| ✅ DSGVO-Compliance dokumentiert | n8n-Workflows für Löschanträge |
| ✅ Audit-Logging im Backend | `apps/api/app/audit.py` |
| ✅ Build-Artefakt-basierter Deploy | Vite-Build → `dist/` → rsync (atomares Deployment) |
| ✅ Rate Limiting | Konfigurierbar per ENV-Variablen |
| ✅ Deploy-Skripte (neu) | bootstrap_ssh, validate_env, deploy, post_deploy_verify |

---

## 4. Kritische Risiken

| # | Risiko | Schweregrad | Bestätigt |
|---|---|---|---|
| R1 | `VITE_ADMIN_EMAILS` → clientseitiger Admin-Check | **Kritisch (P0)** | ✅ Codeanalyse |
| R2 | `VITE_GITHUB_TOKEN` im Frontend-Build eingebunden | **Hoch (P0)** | ✅ VITE_-Variablen sichtbar im Bundle |
| R3 | Variable-Namens-Inkonsistenz: `.env.example` vs. neue Skripte vs. GH-Actions | **Hoch (P1)** | ✅ Direkt geprüft |
| R4 | CORS hartcodiert (nicht per ENV steuerbar) | **Mittel (P1)** | ✅ Codeanalyse |
| R5 | In-Memory Rate Limiter verliert State bei Restart | **Mittel (P2)** | ✅ Codeanalyse |
| R6 | Kein Rollback-Skript vorhanden | **Hoch (P1)** | ✅ Geprüft |
| R7 | 51 GitHub Workflows – hohe Komplexität, Duplikate wahrscheinlich | **Mittel (P2)** | ⚠️ Teilgeprüft |
| R8 | Rate Limiter In-Memory (kein Redis) | **Mittel (P2)** | ✅ Codeanalyse |
| R9 | Kein Backup-Verifikationsskript | **Hoch (P1)** | ✅ Geprüft |
| R10 | `plesk-deployment.yml` und `deploy-plesk.yml` → doppelter Deploy-Workflow | **Mittel (P1)** | ✅ Geprüft |

### R3 Detail: Variable-Namens-Inkonsistenz

```
.env.example (alt):          PLESK_HOST, SSH_PORT, SSH_KEY, PLESK_REMOTE_PATH
scripts/ (neu, letzte Session): PLSK_HOST, PLSK_PORT, PLSK_SSH_KEY, PLSK_DEPLOY_PATH
deploy-plesk.yml (neu):      PLSK_HOST, PLSK_USER, PLSK_PORT, PLSK_SSH_PRIVATE_KEY, PLSK_KNOWN_HOSTS
```

→ Drei unterschiedliche Konventionen für dieselben Secrets. Fehlerrisiko bei Setup.

### R2 Detail: VITE_GITHUB_TOKEN

VITE_-Präfix bedeutet: Variable wird in den JS-Bundle eingebaut und ist für jeden Nutzer lesbar (Browser-DevTools). Ein GitHub-Token darf **niemals** als VITE_-Variable gesetzt werden.

---

## 5. Fehlende Bausteine

| Baustein | Priorität | Aufwand |
|---|---|---|
| Rollback-Skript | P1 | Niedrig |
| Kanonische Secrets-Dokumentation (alle Namen vereinheitlicht) | P1 | Niedrig |
| `VITE_GITHUB_TOKEN` aus Frontend entfernen / durch Backend-Proxy ersetzen | P0 | Mittel |
| Admin-Check ins Frontend via JWT-Claim statt VITE_ADMIN_EMAILS | P0 | Mittel |
| CORS per ENV-Variable konfigurierbar machen | P1 | Niedrig |
| Duplikat-Workflow `plesk-deployment.yml` prüfen/entfernen | P1 | Niedrig |
| Backup-Verifikationsskript | P1 | Niedrig |
| Monitoring-Stack starten (Docker Compose vorhanden, nicht aktiv) | P1 | Niedrig |

---

## 6. Empfohlenes Deploy-Modell

**Gewählt: Modell C — rsync-Artefakt-Deploy** (bereits implementiert in `scripts/deploy.sh`)

**Begründung:**
- Frontend: Vite-Build erzeugt `apps/website/dist/` — atomares Artefakt, ideal für rsync
- API: Kein Kompilierungsschritt, rsync + remote pip install ist Standard und auditierbar
- CRM: rsync + remote composer — Drupal-Standard
- Game: Rein statisch, kein Build nötig
- **git pull auf Server würde bedeuten**: Server braucht GitHub-Zugang, Build-Tools, und ist fehleranfälliger bei Merge-Konflikten
- **Artefakt-Deploy via rsync** ist atomar, rollback-fähig (alten Stand einspielen), auditierbar per Release-Marker

---

## 7. Betroffene Dateien / Verzeichnisse

| Datei / Verzeichnis | Status | Handlungsbedarf |
|---|---|---|
| `apps/website/src/auth/AuthContext.tsx` | VITE_ADMIN_EMAILS clientseitig | **P0: JWT-Claim nutzen** |
| `apps/website/src/` | VITE_GITHUB_TOKEN eingebunden | **P0: Entfernen** |
| `apps/api/app/main.py` | CORS hartcodiert | P1: ENV-Variable |
| `.env.example` | Alte Variablennamen | P1: Vereinheitlichen |
| `.github/workflows/deploy-plesk.yml` | Neu, verbessert | ✅ OK |
| `.github/workflows/plesk-deployment.yml` | Duplikat? | P1: Prüfen/entfernen |
| `scripts/bootstrap_ssh.sh` | Neu, PLSK_-Prefix | ✅ OK |
| `scripts/validate_env.sh` | Neu, PLSK_-Prefix | ✅ OK |
| `scripts/deploy.sh` | Neu, PLSK_-Prefix | ✅ OK |
| `scripts/post_deploy_verify.sh` | Neu, PLSK_-Prefix | ✅ OK |
| `scripts/safe-deploy.sh` | Alt, fehlerhafte Abhängigkeit | P2: Entfernen/archivieren |
| `docs/README_DEPLOY.md` | Neu, vollständig | ✅ OK |

---

## 8. Was sofort so bleiben soll

- `apps/api/src/auth/rbac.py` — vollständige RBAC-Implementierung, gut strukturiert
- `apps/api/app/security.py` — Rate Limiter, CSRF, JWT-Pflichtprüfung korrekt
- `apps/api/app/main.py` — FastAPI-Struktur, Lifespan, Security-Middleware
- `.github/workflows/deploy-plesk.yml` — neu verbessert, korrekt
- `scripts/bootstrap_ssh.sh`, `validate_env.sh`, `deploy.sh`, `post_deploy_verify.sh` — neu, qualitativ hochwertig
- `docker-compose.monitoring.yml` — Stack korrekt definiert (nur noch nicht gestartet)
- n8n-Workflows in `automation/n8n/` — DSGVO-Prozesse korrekt implementiert

---

## 9. Was später geändert werden sollte

| Änderung | Warum | Priorität |
|---|---|---|
| `VITE_ADMIN_EMAILS` → JWT-Claim `role` | Sicherheitsarchitektur korrigieren | P0 |
| `VITE_GITHUB_TOKEN` entfernen | Token gehört nicht ins Frontend-Bundle | P0 |
| `.env.example` vereinheitlichen (→ `PLSK_`-Prefix) | Inkonsistenz beseitigen | P1 |
| CORS per ENV konfigurierbar | 12-Factor-App-Prinzip | P1 |
| Duplikat-Workflow prüfen | CI/CD-Komplexität reduzieren | P1 |
| In-Memory Rate Limiter → Redis | Horizontale Skalierbarkeit | P2 |
| 51 Workflows konsolidieren | Wartbarkeit | P2 |
| Safe-deploy.sh archivieren | Tote Abhängigkeit entfernen | P2 |

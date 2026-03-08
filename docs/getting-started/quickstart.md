# Quickstart – Lokale Entwicklungsumgebung

**Ziel:** Alle Services lokal in unter 10 Minuten zum Laufen bringen.

> **Hinweis:** Dies ist die kanonische Quickstart-Anleitung. Ältere Dateien (`QUICK-START.md`, `CODESPACE-QUICK-START.md`, `DEVELOPMENT-QUICKSTART.md`) im Repository-Root sind archiviert.

---

## Voraussetzungen

| Tool | Mindestversion | Prüfen |
|------|---------------|--------|
| Node.js | 22.x (LTS) | `node --version` |
| npm | 10.x | `npm --version` |
| Docker Desktop | 24.x | `docker --version` |
| Python | 3.12+ | `python3 --version` |
| Git | 2.40+ | `git --version` |
| PHP | 8.1+ | `php --version` (für CRM) |
| Composer | 2.x | `composer --version` (für CRM) |

---

## 1. Repository klonen

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development
```

## 2. Vollständiges Setup

```bash
npm run setup:dev
```

Dies führt aus: `npm install --workspaces`, Composer-Install, Environment-Setup.

## 3. Environment konfigurieren

```bash
cp .env.example .env
# .env öffnen und fehlende Werte eintragen
# Variablen mit REPLACE_WITH_... müssen gesetzt werden
```

**Kritische Variablen für lokale Entwicklung:**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/menschlichkeit_dev
JWT_SECRET=beliebiger-lokaler-dev-secret-mindestens-32-zeichen
```

## 4. Docker-Services starten (Datenbank, Redis, n8n)

```bash
npm run docker:up
# Warten bis PostgreSQL healthy ist (~10s):
docker-compose ps
```

## 5. Datenbankmigrationen

```bash
# API (Alembic):
cd api.menschlichkeit-oesterreich.at
python3 -m venv venv && source venv/bin/activate
pip install -r app/requirements.txt
alembic upgrade head
cd ..

# Games (Prisma):
npx prisma migrate dev
npx prisma generate
```

## 6. Alle Services starten

```bash
npm run dev:all
```

Oder einzelne Services:

```bash
npm run dev:frontend   # React/Vite   → http://localhost:5173
npm run dev:api        # FastAPI       → http://localhost:8001
npm run dev:crm        # Drupal/CRM    → http://localhost:8000
npm run dev:games      # Static Games  → http://localhost:3000
```

---

## Service-URLs im Überblick

| Service | URL | Docs |
|---------|-----|------|
| Frontend | http://localhost:5173 | `apps/website/` |
| API | http://localhost:8001 | http://localhost:8001/docs (Swagger) |
| CRM | http://localhost:8000 | Drupal Admin: `/user/login` |
| Games | http://localhost:3000 | Statische Files |
| n8n | http://localhost:5678 | admin/admin123 (nur lokal) |
| Prisma Studio | http://localhost:5555 | `npx prisma studio` |

---

## Troubleshooting

**Services starten nicht:**
```bash
npm run status:check     # Schnelldiagnose
npm run status:verbose   # Detailliert
```

**Datenbankverbindung schlägt fehl:**
```bash
docker-compose ps        # PostgreSQL-Status prüfen
docker-compose logs postgres  # Logs anzeigen
```

**Port bereits belegt:**
```bash
lsof -i :5173  # Welcher Prozess nutzt Port 5173?
```

**npm install schlägt fehl:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Nächste Schritte

- [Services & Ports – Vollständige Referenz](services-and-ports.md)
- [Architektur verstehen](../architecture/system-overview.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

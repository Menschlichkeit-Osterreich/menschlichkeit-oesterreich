# 🚀 Schnellstart: Vollständiger Development Stack

## ✅ Aktuell verfügbar (OHNE PostgreSQL/Redis)

```bash
# Frontend (React + Vite + Tailwind)
npm run dev:frontend
# → http://localhost:5173/

# Gaming Platform (Prisma + Python HTTP Server)
npm run dev:games
# → http://localhost:3000/
```

## 🐳 Option 1: Docker (EMPFOHLEN - 2 Minuten)

### Docker Desktop installieren
1. Download: https://www.docker.com/products/docker-desktop
2. Installieren und starten
3. In Repository-Root ausführen:

```bash
# Starte PostgreSQL + Redis + n8n
docker-compose up -d

# Prüfe Status
docker-compose ps

# Logs anzeigen
docker-compose logs -f
```

### Nach Docker-Start verfügbar:
- **PostgreSQL**: `localhost:5432` (User: postgres, Password: postgres)
- **Redis**: `localhost:6379`
- **n8n**: http://localhost:5678/ (User: admin, Password: admin123)

### Services starten

```bash
# Alle Services gleichzeitig
npm run dev:all

# Einzeln:
npm run dev:crm      # → http://localhost:8000/
npm run dev:api      # → http://localhost:8001/docs (OpenAPI)
npm run dev:frontend # → http://localhost:5173/
npm run dev:games    # → http://localhost:3000/
```

## 🪟 Option 2: Native Windows Installation (Admin erforderlich)

### PowerShell als Administrator öffnen:

```powershell
# PostgreSQL 16 via Chocolatey
choco install postgresql16 -y

# Redis-Alternative: Memurai
choco install memurai-developer -y

# Services starten
net start postgresql-x64-16
net start Memurai
```

### Manuelle PostgreSQL-Installation:
1. Download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Installer ausführen (alle Defaults OK)
3. Passwort: `postgres`
4. Port: `5432`

## 📊 Database Setup

Nach PostgreSQL-Installation:

```bash
# Prisma Migrationen ausführen
npx prisma migrate dev --name init

# Seed-Daten (optional)
npx prisma db seed
```

## 🧪 Quality Gates & Testing

```bash
# Kompletter Check (vor Commit)
npm run quality:gates

# Einzelne Checks
npm run lint:all              # ESLint + PHPStan + Markdown
npm run security:scan         # Trivy + Gitleaks
npm run performance:lighthouse # Frontend Performance
npm run test:e2e              # Playwright Tests
npm run test:unit             # Vitest Unit Tests
```

## 🎨 Figma Integration

```bash
# Frontend mit committed Design Tokens bauen
npm run build:frontend
```

Hinweis: `figma-design-system/00_design-tokens.json` ist committed.
Ein Live-Figma-Sync ist kein Pflichtbestandteil von Build, CI oder Deploy.

## 🔍 Troubleshooting

### Port bereits belegt
```bash
# Finde Prozess auf Port 5173
netstat -ano | findstr :5173

# Beende Prozess (PID aus obigem Befehl)
taskkill /PID <PID> /F
```

### PostgreSQL Verbindungsfehler
```bash
# Prüfe Service-Status
Get-Service postgresql*

# Restart Service
Restart-Service postgresql-x64-16
```

### Redis/Memurai nicht erreichbar
```bash
# Prüfe Service
Get-Service Memurai

# Restart
Restart-Service Memurai
```

## 📦 Build & Deploy

```bash
# Alle Services bauen
npm run build:all

# Einzeln
npm run build:frontend  # → frontend/dist/
npm run build:games     # → Prisma Client
npm run build:api       # → Python Package

# Deployment (staging)
./build-pipeline.sh staging

# Production (nach Tests)
./build-pipeline.sh production
```

## 🔗 Service URLs (nach vollem Setup)

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173/ | React + Vite Dev Server |
| **API** | http://localhost:8001/docs | FastAPI + OpenAPI |
| **CRM** | http://localhost:8000/ | Drupal + CiviCRM |
| **Games** | http://localhost:3000/ | Gaming Platform |
| **n8n** | http://localhost:5678/ | Automation Workflows |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache/Sessions |

## 📝 Nächste Schritte

1. **Mit Docker starten** (einfachste Option):
   ```bash
   docker-compose up -d
   npm run dev:all
   ```

2. **Oder native Installation** (PowerShell als Admin):
   ```powershell
   choco install postgresql16 memurai-developer -y
   npm run dev:all
   ```

3. **Oder nur Frontend/Games** (ohne DB):
   ```bash
   npm run dev:frontend
   npm run dev:games
   ```

---

💡 **Tipp**: Für lokale Entwicklung reichen Frontend + Games. API/CRM benötigen PostgreSQL nur für Datenbank-Features.

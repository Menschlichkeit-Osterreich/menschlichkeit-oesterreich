# 🚀 Development Stack - Service Übersicht

**Status:** 16. Oktober 2025 - 21:45 Uhr

## ✅ Laufende Services

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Frontend** (React + Vite) | 5173 | http://localhost:5173 | ✅ Läuft |
| **Games Platform** (Python) | 3000 | http://localhost:3000 | ✅ Läuft |
| **WebSocket Server** (Figma MCP) | 3055 | http://localhost:3055/health | ✅ Läuft |
| **API** (FastAPI) | 8001 | http://localhost:8001/docs | ⏳ Startet |
| **CRM** (Drupal + CiviCRM) | 8000 | http://localhost:8000 | ⏳ Startet |

## 🛠️ Installierte Tools

- ✅ **Node.js**: v22.20.0 (1,210 packages)
- ✅ **Python**: 3.13.7 (.venv aktiviert)
- ✅ **uvx**: 0.9.3 (für Microsoft Fabric RTI MCP)
- ✅ **PHP**: 8.4.13
- ✅ **Composer**: 2.8.12
- ✅ **Docker Desktop**: 4.47.0 (Engine startet)
- ✅ **WebSocket (ws)**: 8.18.3 (global + Extension)

## 📦 MCP Server

### Figma MCP
- **HTTP Server**: http://127.0.0.1:3845/mcp
- **WebSocket**: ws://localhost:3055
- **File Key**: ***REDACTED***
- **Status**: ✅ Läuft

### Konfiguration
- `.vscode/mcp.json` - Workspace MCP Config
- `User/mcp.json` - VS Code User MCP Config
- `dist/socket.js` - WebSocket Server für Extension

## 🐳 Docker Stack (in Vorbereitung)

```yaml
Services (docker-compose.yml):
- PostgreSQL 16 Alpine (Port 5432)
- Redis 7 Alpine (Port 6379)
- n8n Automation (Port 5678)
```

**Status**: Docker Engine startet (dauert 2-3 Minuten nach Installation)

## 🎯 Quick Commands

```powershell
# Alle Services starten
npm run dev:all

# Einzelne Services
npm run dev:frontend  # Port 5173
npm run dev:games     # Port 3000
npm run dev:api       # Port 8001
npm run dev:crm       # Port 8000

# WebSocket Server
npm run figma:ws:start
npm run figma:ws:dev  # Mit auto-reload

# Docker Stack
docker-compose up -d
docker-compose ps
docker-compose logs -f

# Status Check
curl http://localhost:3055/health        # WebSocket
curl http://localhost:8001/docs          # API OpenAPI
curl http://localhost:5173               # Frontend
```

## 🔧 Troubleshooting

### API startet nicht
```powershell
# Python venv aktivieren
& .venv\Scripts\Activate.ps1

# In API-Verzeichnis wechseln
cd api.menschlichkeit-oesterreich.at

# Manuell starten
uvicorn app.main:app --reload --port 8001
```

### CRM startet nicht
```powershell
# In CRM-Verzeichnis wechseln
cd crm.menschlichkeit-oesterreich.at\httpdocs

# Manuell starten
php -S localhost:8000
```

### Docker Engine nicht bereit
```powershell
# Service Status prüfen
Get-Service "com.docker.service"

# Docker Desktop neu starten
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

## 📝 Nächste Schritte

1. ⏳ Warte auf API-Start (ca. 30 Sekunden)
2. ⏳ Warte auf CRM-Start (ca. 60 Sekunden)
3. ⏳ Warte auf Docker Engine (ca. 2-3 Minuten)
4. 🚀 Starte Docker Stack: `docker-compose up -d`
5. 🗄️ Führe DB-Migrations aus: `npm run db:migrate`
6. ✅ Teste alle Endpoints

## 🎉 Was funktioniert JETZT

- ✅ Frontend Development (React Hot-Reload)
- ✅ Games Platform (Static Server)
- ✅ WebSocket Server (Figma MCP Extension)
- ✅ MCP Server Integration (GitHub Copilot)
- ✅ Design Token Sync (Figma → Tailwind)
- ✅ Quality Gates (Codacy, Security, Performance)
- ✅ Build Pipeline (All Services)

## 📚 Dokumentation

- `QUICK-START.md` - Setup-Optionen
- `FIGMA-MCP-QUICKSTART.md` - MCP Integration
- `docs/FIGMA-MCP-SETUP.md` - Vollständige Anleitung
- `.github/copilot-instructions.md` - Development Guidelines

---

**Erstellt am:** 16. Oktober 2025, 21:45 Uhr  
**Letzter Check:** API + CRM starten im Hintergrund  
**Next Check:** In 30 Sekunden alle Services testen

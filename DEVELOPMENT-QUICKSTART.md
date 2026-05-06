# 🚀 Development Quick Start – Menschlichkeit Österreich

Dieser Guide führt dich durch das vollständige Setup der Entwicklungsumgebung.

## ✅ Voraussetzungen

- **Node.js** v22+ ✅ Installiert
- **Python** 3.11+ ✅ Installiert (.venv aktiv)
- **PHP** 8.1+ ✅ Installiert
- **Docker Desktop** ✅ Installiert
- **Composer** ✅ Installiert
- **Git** ✅ Installiert

## 🏃 Schnellstart (5 Minuten)

### 1. Alle Services starten

```powershell
# Starte kompletten Stack
npm run dev:all

# Services laufen dann auf:
# Frontend:  http://localhost:5173
# Games:     http://localhost:3000
# API:       http://localhost:8001/docs
# CRM:       http://localhost:8000
# WebSocket: http://localhost:3055/health
```

### 2. Docker Stack starten

```powershell
# Starte PostgreSQL, Redis, n8n
docker-compose up -d

# Prüfe Status
docker-compose ps

# Logs ansehen
docker-compose logs -f
```

### 3. Datenbank initialisieren

```powershell
# Generiere Prisma Client
npx prisma generate

# Führe Migrations aus
npx prisma migrate dev --name init

# Optional: Seed-Daten
npx prisma db seed
```

## 📦 NPM Scripts Übersicht

### Development

```powershell
npm run dev:all          # Alle Services (empfohlen)
npm run dev:frontend     # Nur React Frontend
npm run dev:api          # Nur FastAPI Backend
npm run dev:crm          # Nur Drupal CRM
npm run dev:games        # Nur Games Platform
```

### Quality & Testing

```powershell
npm run quality:gates    # Vollständige Quality Gates (PR-blocking)
npm run lint:all         # ESLint + PHPStan + Markdownlint
npm run test:unit        # Unit Tests (Vitest)
npm run test:e2e         # E2E Tests (Playwright)
npm run test:coverage    # Coverage Report
```

### Security & Compliance

```powershell
npm run security:scan    # Vollständiger Security-Scan
npm run security:trivy   # Container/Dependencies
npm run security:gitleaks # Secret Detection
npm run compliance:dsgvo # DSGVO Compliance Check
```

### Build & Deploy

```powershell
npm run build:all        # Produktions-Build aller Services
npm run build:frontend   # Frontend-Build
npm run build:api        # API-Packaging

# Build Pipeline (mit Quality Gates)
./build-pipeline.sh staging
./build-pipeline.sh production

# Deployment (Plesk)
./scripts/safe-deploy.sh --dry-run  # Test-Modus
./scripts/safe-deploy.sh            # Production
```

### Docker Management

```powershell
npm run docker:up        # Docker Compose starten
npm run docker:down      # Docker Compose stoppen
npm run docker:logs      # Logs anzeigen
npm run docker:ps        # Container Status
npm run docker:restart   # Neustart
```

### Database

```powershell
npm run db:migrate       # Prisma Migrations
npm run db:seed          # Seed-Daten
npm run db:studio        # Prisma Studio (GUI)
npm run db:reset         # Datenbank zurücksetzen
```

### n8n Automation

```powershell
npm run n8n:start        # n8n starten
npm run n8n:stop         # n8n stoppen
npm run n8n:logs         # Logs anzeigen
```

### Figma MCP Integration

```powershell
npm run build:frontend   # Frontend mit committed Design Tokens bauen
```

### Reports & Status

```powershell
npm run quality:reports  # Qualitäts-Reports generieren
npm run status:check     # Service-Status
npm run status:verbose   # Detaillierte Infos
npm run status:json      # JSON Export
```

## 🔧 Entwicklungs-Workflow

### Feature-Branch erstellen

```powershell
# Branch erstellen
git checkout -b feature/123-neue-funktion

# Entwickeln...

# Quality Gates vor Commit
npm run quality:gates

# Commit
git add .
git commit -m "feat: neue Funktion

- Implementation Details
- Tests ergänzt
- Docs aktualisiert"

# Push
git push origin feature/123-neue-funktion
```

### Quality Gates (PR-Blocking)

Vor jedem Commit **MÜSSEN** alle Gates bestehen:

```powershell
npm run quality:gates
```

**Gates:**
- ✅ **Security**: 0 HIGH/CRITICAL Vulnerabilities (Trivy + Gitleaks)
- ✅ **Code Quality**: Maintainability ≥85%, Duplication ≤2% (Codacy)
- ✅ **Performance**: Lighthouse ≥90 (Performance/A11y/SEO)
- ✅ **DSGVO**: 0 PII in Logs, Consent dokumentiert
- ✅ **Tests**: Unit/E2E Coverage ≥80%

## 🐛 Troubleshooting

### API startet nicht

```powershell
# Aktiviere Virtual Environment
.\.venv\Scripts\Activate.ps1

# Installiere Dependencies
pip install -r api.menschlichkeit-oesterreich.at/requirements.txt

# Starte manuell
cd api.menschlichkeit-oesterreich.at
uvicorn app.main:app --reload --port 8001
```

### CRM (Drupal) startet nicht

```powershell
# Composer Dependencies
cd crm.menschlichkeit-oesterreich.at
composer install

# Starte PHP Server
php -S localhost:8000 -t web
```

### Docker Engine nicht bereit

```powershell
# Warte 2-3 Minuten nach Installation/Neustart
# Prüfe Status
docker info

# Neustart Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Frontend Build Fehler

```powershell
# Cache löschen
npm run clean:dist

# Node Modules neu installieren
Remove-Item -Recurse -Force node_modules
npm install

# Rebuild
npm run build:frontend
```

### PostgreSQL Connection Fehler

```powershell
# Prüfe ob Container läuft
docker-compose ps

# Container neu starten
docker-compose restart postgres

# Logs prüfen
docker-compose logs postgres
```

## 📚 Weitere Ressourcen

- **[SERVICE-STATUS.md](./SERVICE-STATUS.md)** - Aktueller Service-Status
- **[README.md](./README.md)** - Projekt-Übersicht
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution Guidelines
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - AI Agent Setup
- **[docs/](./docs/)** - Vollständige Dokumentation

## 🎯 Nächste Schritte

1. **Alle Services prüfen**:
   ```powershell
   npm run status:check
   ```

2. **Tests ausführen**:
   ```powershell
   npm run test:unit
   npm run test:e2e
   ```

3. **Quality Gates**:
   ```powershell
   npm run quality:gates
   ```

4. **Design-Tokens-Build testen**:
   ```powershell
   npm run build:frontend
   ```

5. **Erste Änderung committen**:
   ```powershell
   git checkout -b feature/mein-erstes-feature
   # ... Änderungen machen ...
   npm run quality:gates
   git add .
   git commit -m "feat: meine erste Änderung"
   git push
   ```

---

**Happy Coding! 🚀**

Fragen? Siehe [SUPPORT.md](./SUPPORT.md) oder erstelle ein Issue.

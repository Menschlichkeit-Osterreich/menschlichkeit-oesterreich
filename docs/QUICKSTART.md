# 🚀 Quickstart Guide - Menschlichkeit Österreich Development

**Ziel**: Entwicklungsumgebung in ≤10 Minuten betriebsbereit

---

## 📋 Prerequisites (Installation erforderlich)

### Erforderliche Software
- **Node.js**: v18+ (empfohlen: v20 LTS)
- **npm**: v9+ (kommt mit Node.js)
- **Git**: v2.40+
- **Docker Desktop**: v24+ (für CRM/n8n lokale Entwicklung)

### Optional (für Vollausbau)
- **Python**: v3.12+ (für API-Service)
- **PHP**: v8.2+ (für CRM-Entwicklung)
- **PostgreSQL**: v15+ (für Gaming-Platform)

---

## ⚡ Schnellstart (3 Schritte)

### 1. Repository klonen & Dependencies installieren

```bash
# Repository klonen
git clone https://github.com/peschull/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

# Dependencies installieren (npm workspaces)
npm install

# Optional: Python Dependencies für API
cd api.menschlichkeit-oesterreich.at
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

**⏱️ Dauer**: ~2 Minuten (abhängig von Internetverbindung)

---

### 2. Environment konfigurieren

```bash
# .env Datei aus Template erstellen
cp .env.example .env

# WICHTIG: Folgende Werte in .env anpassen:
# - DATABASE_URL (PostgreSQL Connection String)
# - JWT_SECRET (min. 32 Zeichen, zufällig generiert)
# - PLESK_* (optional, nur für Deployment)
```

**⚡ Quick-Hack für lokale Entwicklung** (ohne echte Datenbank):
```bash
# SQLite als Fallback (kein PostgreSQL Setup nötig)
DATABASE_URL="sqlite:///./dev.db"
```

**⏱️ Dauer**: ~1 Minute

---

### 3. Services starten

```bash
# Alle Services parallel starten (empfohlen)
npm run dev:all

# ODER einzelne Services:
npm run dev:frontend   # React Frontend (Port 3000)
npm run dev:api       # FastAPI Backend (Port 8001)
npm run dev:crm       # Drupal CRM (Port 8000)
npm run dev:games     # Educational Games (Port 3000)
```

**Service-Übersicht**:
| Service | URL | Technologie |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React + Vite + Tailwind |
| API | http://localhost:8001/docs | FastAPI + OpenAPI |
| CRM | http://localhost:8000 | Drupal 10 + CiviCRM |
| Games | http://localhost:3000 | Prisma + PostgreSQL |

**⏱️ Dauer**: ~30 Sekunden bis alle Services laufen

---

## 🎨 Figma Design System Integration

### Design Tokens synchronisieren

```bash
# Design Tokens von Figma holen (erfordert FIGMA_TOKEN)
npm run figma:sync

# Alternativ: Bereits vorhandene Tokens validieren
node scripts/validate-design-tokens.js
```

**Output**:
```
✅ All design token checks passed!
  - Design tokens file exists
  - JSON is valid
  - Token structure is correct
  - TypeScript definitions match
  - CSS variables are in sync
```

### Discourse Forum Theme generieren

```bash
# Theme aus Figma Tokens generieren
node scripts/generate-discourse-theme.cjs

# Output: figma-design-system/discourse-theme.css
# Upload in Discourse: Admin → Customize → Themes → Import
```

---

## 🔐 Security Checks (lokal)

```bash
# Gitleaks Secret Scan
gitleaks detect --config gitleaks.toml

# Semgrep Code Analysis
semgrep --config=p/security-audit --config=p/owasp-top-ten

# ESLint + Prettier
npm run lint:all
npm run format:all
```

---

## 🧪 Testing

```bash
# Unit Tests (Jest/Vitest)
npm run test

# E2E Tests (Playwright)
npm run test:e2e

# Performance Audit (Lighthouse)
npm run performance:lighthouse
```

---

## 🚢 Deployment (Plesk)

```bash
# Dry-Run (zeigt was passieren würde, führt nichts aus)
./scripts/safe-deploy.sh --dry-run

# Produktives Deployment (VORSICHT!)
./scripts/safe-deploy.sh

# Service-spezifische Deployments
./deployment-scripts/deploy-api-plesk.sh
./deployment-scripts/deploy-crm-plesk.sh
```

---

## 🆘 Troubleshooting

### Problem: "Port 3000 already in use"
```bash
# Prozess auf Port finden und beenden
lsof -ti:3000 | xargs kill -9

# ODER anderen Port nutzen
PORT=3001 npm run dev:frontend
```

### Problem: "Cannot find module 'vite'"
```bash
# Dependencies erneut installieren
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Database connection failed"
```bash
# PostgreSQL Status prüfen
pg_isready

# Verbindung testen
psql $DATABASE_URL

# Alternativ: SQLite nutzen (siehe Schritt 2)
```

### Problem: "FIGMA_TOKEN not set"
```bash
# Token in .env setzen (Figma → Settings → Personal Access Tokens)
echo "FIGMA_TOKEN=figd_YOUR_TOKEN_HERE" >> .env
```

---

## 📚 Weitere Ressourcen

- **Architektur**: `README.md` (Gesamtübersicht)
- **DSGVO/Forum**: `community_forum_integration_ngo_eu_dsgvo_aktionsplan_copilot_briefing.md`
- **Design System**: `figma-design-system/FIGMA-README.md`
- **Security**: `.github/workflows/security.yml`
- **Focus/Sprint**: `docs/FOCUS.md`

---

## ✅ Checkliste: Bereit für Entwicklung?

- [ ] Node.js v18+ installiert (`node --version`)
- [ ] npm Dependencies installiert (`npm list --depth=0`)
- [ ] `.env` Datei konfiguriert
- [ ] Services starten erfolgreich (`npm run dev:all`)
- [ ] Figma Tokens validiert (`node scripts/validate-design-tokens.js`)
- [ ] Secrets-Free (`gitleaks detect --config gitleaks.toml`)

**Wenn alle Checkboxen ✅**: Los geht's! 🎉

---

**Geschätzte Gesamtzeit**: 8-10 Minuten (bei stabiler Internetverbindung)  
**Support**: Issues auf GitHub oder [peter.schuller@menschlichkeit-oesterreich.at](mailto:peter.schuller@menschlichkeit-oesterreich.at)

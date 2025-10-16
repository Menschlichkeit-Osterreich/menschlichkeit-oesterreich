# 🎨 Figma MCP Integration – Setup Guide

## Übersicht

Diese Anleitung beschreibt die vollständige Integration des Figma MCP-Servers mit GitHub Copilot Agent Mode für das Projekt "Menschlichkeit Österreich".

### Was ist MCP?

Model Context Protocol (MCP) ermöglicht es AI-Assistenten wie GitHub Copilot, mit externen Services wie Figma zu kommunizieren und Design-zu-Code-Generierung durchzuführen.

## 📋 Voraussetzungen

### 1. Figma Personal Access Token

- Erstelle einen Personal Access Token in Figma:
  - Gehe zu [Figma Settings > Personal Access Tokens](https://www.figma.com/settings)
  - Klicke auf "Create new token"
  - Gib einen Namen ein (z.B. "MCP Integration")
  - Kopiere den generierten Token (beginnt mit `figd_`)

### 2. Node.js & npm

- Node.js ≥ 22.0.0 (für MCP Server)
- npm ≥ 10.0.0

### 3. VS Code Insiders (empfohlen)

- GitHub Copilot Extension aktiviert
- MCP Extension aktiviert

## 🚀 Installation & Setup

### Schritt 1: Environment-Variablen konfigurieren

Erstelle/aktualisiere `.env.local`:

```bash
# Figma API Configuration
FIGMA_API_TOKEN=figd_YOUR_FIGMA_PERSONAL_ACCESS_TOKEN_HERE
FIGMA_FILE_KEY=YOUR_FIGMA_FILE_KEY_HERE
FIGMA_MCP_SERVER_URL=http://127.0.0.1:3845/mcp
FIGMA_PROJECT_NAME="Menschlichkeit Österreich - Website Design System"

# MCP Server Configuration
MCP_SERVER_PORT=3845
MCP_SERVER_HOST=127.0.0.1
```

**⚠️ WICHTIG:** `.env.local` ist in `.gitignore` - commite NIEMALS echte Tokens!

### Schritt 2: MCP-Konfiguration validieren

```bash
# Prüfe MCP-Konfiguration
cat .vscode/mcp.json

# Prüfe Root MCP-Konfiguration
cat mcp.json
```

### Schritt 3: Figma MCP-Server starten

#### Option A: Manuell (für Entwicklung)

```bash
# Starte den lokalen MCP-Server
npm run figma:mcp:server

# In separatem Terminal: Check Server-Status
npm run figma:mcp:check
```

#### Option B: Als Background-Prozess

```bash
# Startet automatisch beim VS Code öffnen
# Konfiguration via .vscode/tasks.json
```

### Schritt 4: VS Code neu laden

1. Öffne Command Palette: `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
2. Tippe: `Developer: Reload Window`
3. VS Code wird neu geladen und erkennt den MCP-Server

### Schritt 5: MCP-Server in Copilot aktivieren

1. Öffne GitHub Copilot Chat
2. Klicke auf das Settings-Icon (⚙️)
3. Wähle "MCP Servers"
4. Aktiviere "Figma MCP Server"
5. Bestätige Berechtigungen

## 🎯 Verwendung mit GitHub Copilot

### Basis-Workflow: Design zu Code

1. **Figma-Link kopieren**
   ```
   https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=1-2
   ```

2. **Copilot-Prompt (Beispiele)**

   **Einfach:**
   ```
   Generiere eine React-Komponente aus dem Figma-Design:
   https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=1-2
   ```

   **Erweitert:**
   ```
   Generiere aus Figma Node 1:2 eine TypeScript React-Komponente mit:
   - Tailwind CSS basierend auf Design Tokens
   - WCAG AA konforme Accessibility
   - Österreichisches Deutsch für UI-Texte
   - DSGVO-konforme Implementierung
   ```

   **Mit Komponenten-Name:**
   ```
   Erstelle die Komponente "HeroSection" aus Figma Node 1:2 
   und speichere sie unter frontend/src/components/figma/HeroSection.tsx
   ```

3. **Copilot führt aus:**
   - Kommuniziert mit Figma MCP-Server
   - Extrahiert Design-Daten & Assets
   - Generiert TypeScript/React Code
   - Nutzt Design Tokens aus `figma-design-system/`
   - Erstellt Storybook Stories
   - Führt Quality Gates aus (ESLint, a11y, etc.)

### Erweiterte Workflows

#### Gesamte Page generieren

```bash
# Via npm Script
npm run figma:integrate

# Oder spezifischer Node
node scripts/figma-mcp-integration.mjs 0:1
```

#### Design Tokens synchronisieren

```bash
# Einmaliger Sync
npm run figma:sync

# Watch Mode (bei Figma-Änderungen)
npm run figma:sync:watch

# Full Sync mit Quality Gates
npm run figma:full-sync
```

#### Komponenten mit Quality Gates

```bash
# Generiere Komponenten und führe alle Gates aus
npm run figma:generate

# Oder via Copilot:
"Generiere alle Komponenten aus Figma und führe Quality Gates aus"
```

## 📁 Generierte Dateistruktur

Nach erfolgreicher Generierung:

```
frontend/src/components/figma/
├── HeaderNavigation.tsx         # React-Komponente
├── HeaderNavigation.md          # Usage-Dokumentation
├── HeroSection.tsx
├── HeroSection.md
├── FeaturesGrid.tsx
├── FeaturesGrid.md
├── CtaSection.tsx
├── CtaSection.md
├── Footer.tsx
├── Footer.md
├── index.ts                     # Re-Export aller Komponenten
├── README.md                    # Gesamtdokumentation
└── stories/
    ├── HeaderNavigation.stories.tsx
    ├── HeroSection.stories.tsx
    ├── FeaturesGrid.stories.tsx
    ├── CtaSection.stories.tsx
    └── Footer.stories.tsx

figma-design-system/
├── 00_design-tokens.json        # Design Tokens (aktualisiert)
└── styles/
    └── design-tokens.css        # CSS Custom Properties

docs/
└── FIGMA-COMPONENT-MAPPING.md   # Mapping Figma ↔ Code
```

## 🔍 Quality Gates

Die Integration führt automatisch folgende Checks aus:

1. **ESLint Auto-Fix** – Code-Formatierung & Best Practices
2. **Accessibility Check** – WCAG AA Konformität
3. **Design Token Validation** – Konsistenz mit Figma
4. **DSGVO Compliance** – Keine PII in generierten Komponenten
5. **Codacy Analysis** – Code-Qualität (nach Commit)

### Quality Gates manuell ausführen

```bash
# Einzeln
npm run lint:all
npm run security:scan
npm run compliance:dsgvo

# Alle
npm run quality:gates
```

## 🛠️ Troubleshooting

### MCP-Server nicht erreichbar

**Problem:** `⚠️ MCP Server not available, using fallback mode`

**Lösungen:**
```bash
# 1. Server-Status prüfen
npm run figma:mcp:check

# 2. Server neu starten
pkill -f "figma-mcp-server"
npm run figma:mcp:server

# 3. Port prüfen (muss 3845 sein)
netstat -an | grep 3845  # Unix
netstat -an | findstr 3845  # Windows

# 4. Token validieren
echo $FIGMA_API_TOKEN  # Unix
$env:FIGMA_API_TOKEN  # PowerShell
```

### Figma API 401 Unauthorized

**Problem:** `❌ Figma API error: 401`

**Lösungen:**
```bash
# Token neu generieren in Figma Settings
# .env.local aktualisieren
# VS Code neu laden: Ctrl+Shift+P > "Developer: Reload Window"
```

### Generierte Komponenten haben Fehler

**Problem:** ESLint/TypeScript Errors in generierten Dateien

**Lösungen:**
```bash
# Auto-Fix ausführen
npm run lint:js

# Oder einzelne Datei
npx eslint --fix frontend/src/components/figma/ComponentName.tsx

# TypeScript prüfen
npx tsc --noEmit
```

### Design Tokens nicht synchronisiert

**Problem:** Token Drift > 0

**Lösungen:**
```bash
# Manueller Sync
npm run figma:sync

# Validierung
node scripts/validate-design-tokens.js

# Full Re-Sync mit Quality Gates
npm run figma:full-sync
```

### MCP-Server startet nicht

**Problem:** `Error: EADDRINUSE: address already in use`

**Lösungen:**
```bash
# Unix/Mac
lsof -ti:3845 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3845).OwningProcess | Stop-Process -Force

# Dann neu starten
npm run figma:mcp:server
```

## 🔐 Sicherheit & Best Practices

### Token-Verwaltung

✅ **DO:**
- Tokens nur in `.env.local` oder GitHub Secrets
- Regelmäßig Tokens rotieren (alle 90 Tage)
- Unterschiedliche Tokens für Dev/Staging/Prod
- Token-Berechtigung auf "Read-Only" wenn möglich

❌ **DON'T:**
- Tokens in Code committen
- Tokens in Logs ausgeben
- Tokens mit anderen teilen
- Tokens in Dateinamen verwenden

### DSGVO-Konformität

- Generierter Code **erfasst keine PII**
- E-Mail/IBAN-Masking aktiv (`t**@example.com`, `AT61***`)
- Komponenten haben klare Datenschutz-Hinweise
- Audit-Logs für alle Figma-Zugriffe

### Qualitäts-Standards

- **Code Quality**: Codacy Maintainability ≥ 85%
- **Accessibility**: WCAG AA (100%)
- **Performance**: Lighthouse ≥ 90
- **Security**: Trivy 0 HIGH/CRITICAL

## 📊 Monitoring & Logging

### MCP-Server Logs

```bash
# Live-Logs anzeigen
tail -f logs/figma-mcp-server.log

# Fehler filtern
grep ERROR logs/figma-mcp-server.log

# Letzten 50 Zeilen
tail -n 50 logs/figma-mcp-server.log
```

### Generation Reports

```bash
# Quality Reports anzeigen
cat quality-reports/figma-integration-*.md

# JSON für Automation
cat quality-reports/figma-integration-*.json
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Die Integration läuft automatisch bei:
- Pull Requests (Dry-Run)
- Push zu `main` (Full Sync)
- Manueller Trigger via Workflow Dispatch

```yaml
# .github/workflows/figma-sync.yml
name: Figma Design Sync

on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * *'  # Täglich 2:00 UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Sync Figma
        env:
          FIGMA_API_TOKEN: ${{ secrets.FIGMA_API_TOKEN }}
          FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
        run: |
          npm ci
          npm run figma:full-sync
      - name: Commit Changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add figma-design-system/ frontend/src/components/figma/
          git commit -m "🎨 Auto-sync Figma Design System" || echo "No changes"
          git push
```

### GitHub Secrets konfigurieren

1. Gehe zu Repository Settings > Secrets and variables > Actions
2. Füge hinzu:
   - `FIGMA_API_TOKEN`: Dein Personal Access Token
   - `FIGMA_FILE_KEY`: `mTlUSy9BQk4326cvwNa8zQ`

## 📚 Weitere Ressourcen

### Offizielle Dokumentation

- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [GitHub Copilot MCP Docs](https://docs.github.com/en/copilot/using-github-copilot/using-mcp-with-copilot)
- [Figma API Reference](https://www.figma.com/developers/api)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)

### Projekt-spezifische Docs

- [`.github/instructions/core/figma-mcp.instructions.md`](../.github/instructions/core/figma-mcp.instructions.md)
- [`docs/FIGMA-COMPONENT-MAPPING.md`](../docs/FIGMA-COMPONENT-MAPPING.md)
- [`figma-design-system/README.md`](../figma-design-system/README.md)

### Beispiel-Prompts für Copilot

**Komponente mit Props generieren:**
```
Generiere aus Figma Node 1:2 eine TypeScript-Komponente "Button" mit Props:
- variant: 'primary' | 'secondary' | 'outline'
- size: 'sm' | 'md' | 'lg'
- disabled: boolean
Nutze Design Tokens und WCAG AA Accessibility.
```

**Responsive Layout:**
```
Erstelle aus Figma Node 3:5 ein responsives Grid-Layout
mit Breakpoints: mobile (sm), tablet (md), desktop (lg).
Nutze Tailwind CSS und Design Tokens für Spacing.
```

**Barrierefreie Form:**
```
Generiere aus Figma Node 2:8 ein barrierefreies Formular mit:
- ARIA Labels
- Error States mit visueller & Screen-Reader-Feedback
- Keyboard Navigation
- österreichisches Deutsch für Labels & Errors
```

## 🤝 Support & Hilfe

Bei Problemen oder Fragen:

1. **Interne Docs:** Prüfe `.github/instructions/` Ordner
2. **Issues:** Erstelle ein GitHub Issue mit Label `figma-integration`
3. **Logs:** Attachiere relevante Log-Auszüge
4. **Screenshots:** Zeige Fehlermeldungen in VS Code

---

**Version:** 1.0.0  
**Letztes Update:** 16. Oktober 2025  
**Maintainer:** DevOps Team  
**Status:** ✅ Production Ready

# 🚀 Figma MCP Integration – Quick Start

**Für eilige Entwickler – vollständige Anleitung: [`docs/FIGMA-MCP-SETUP.md`](./FIGMA-MCP-SETUP.md)**

## ⚡ 3-Minuten Setup

### 1. Environment konfigurieren

```bash
# Kopiere und bearbeite .env.local
cp .env.example .env.local

# Füge deinen Figma Token ein
nano .env.local  # oder VS Code
```

In `.env.local` eintragen:
```bash
FIGMA_API_TOKEN=figd_YOUR_FIGMA_TOKEN_HERE
FIGMA_FILE_KEY=YOUR_FIGMA_FILE_KEY_HERE
```

### 2. VS Code neu laden

```
Ctrl+Shift+P > "Developer: Reload Window"
```

### 3. Fertig! Nutze Copilot

```
Prompt: "Generiere React-Komponente aus Figma Node 1:2"
```

---

## 📝 Häufige Befehle

```bash
# Design Tokens synchronisieren
npm run figma:sync

# Komponenten aus Figma generieren
npm run figma:integrate

# Voller Sync mit Quality Gates
npm run figma:full-sync

# MCP-Server Status prüfen
npm run figma:mcp:check
```

---

## 🔗 Dein Figma-Projekt

**File:** [Website Design System](https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=0-1)  
**File Key:** `mTlUSy9BQk4326cvwNa8zQ`  
**Root Node:** `0:1`

---

## 🎯 Beispiel-Prompts für Copilot

**Einfach:**
```
Erstelle eine Button-Komponente aus Figma Node 1:5
```

**Erweitert:**
```
Generiere aus Figma Node 2:3 ein responsives Hero-Section Layout
mit Tailwind CSS, Design Tokens und WCAG AA Accessibility.
Verwende österreichisches Deutsch für UI-Texte.
```

**Mit spezifischen Anforderungen:**
```
Erstelle aus Figma Node 3:7 eine FormInput-Komponente mit:
- TypeScript Props für value, onChange, error
- ARIA Labels für Screen Reader
- Fehlervalidierung mit visueller Anzeige
- Design Tokens für Farben und Spacing
```

---

## 🚨 Troubleshooting

| Problem | Lösung |
|---------|--------|
| MCP-Server nicht erreichbar | `npm run figma:mcp:server` |
| Figma API 401 Error | Token in `.env.local` prüfen |
| Komponenten mit Errors | `npm run lint:all` |
| Design Tokens veraltet | `npm run figma:sync` |

**Detaillierte Hilfe:** [`docs/FIGMA-MCP-SETUP.md#troubleshooting`](./FIGMA-MCP-SETUP.md#troubleshooting)

---

## 📊 Integration Status

✅ **Konfiguriert:**
- MCP Server: `http://127.0.0.1:3845/mcp`
- Figma File: `mTlUSy9BQk4326cvwNa8zQ`
- Design Tokens: `figma-design-system/00_design-tokens.json`
- Output: `frontend/src/components/figma/`

✅ **Features:**
- Design-zu-Code Generation
- Design Token Synchronisation
- Quality Gates (ESLint, a11y, DSGVO)
- Storybook Integration
- TypeScript + React + Tailwind CSS

---

**Nächster Schritt:** Teste die Integration mit einem einfachen Copilot-Prompt! 🎨

**Vollständige Docs:** [`docs/FIGMA-MCP-SETUP.md`](./FIGMA-MCP-SETUP.md)

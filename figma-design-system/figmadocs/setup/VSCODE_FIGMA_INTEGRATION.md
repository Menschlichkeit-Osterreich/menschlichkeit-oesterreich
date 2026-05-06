# 🔗 VS Code + Figma MCP Integration - Setup Guide

**Menschlichkeit Österreich**  
**Version:** 1.0.0  
**Erstellt:** 2025-10-16  
**Status:** 🟢 **PRODUCTION**

---

## 📋 **Übersicht**

Diese Anleitung zeigt, wie du VS Code vollständig mit Figma Code Connect/MCP integrierst für nahtlose Design-to-Code Workflows.

---

## 🎯 **Was wird eingerichtet?**

1. ✅ **VS Code Workspace-Konfiguration** - Optimierte Settings
2. ✅ **Figma MCP Server** - Automatische Code-Generierung
3. ✅ **Cline AI Assistant** - Mit Figma-Zugriff
4. ✅ **Empfohlene Extensions** - Produktivitäts-Boost
5. ✅ **Tasks & Snippets** - Schnelle Workflows
6. ✅ **Debug-Konfiguration** - Für Tests & Development

---

## 🚀 **Quick Setup (5 Minuten)**

### **1. Figma Access Token holen**

```bash
# 1. Gehe zu Figma Settings
https://www.figma.com/settings

# 2. Scrolle zu "Personal Access Tokens"
# 3. Klicke "Generate New Token"
# 4. Name: "Menschlichkeit Österreich MCP"
# 5. Scopes: "File content" (Read)
# 6. Token kopieren (nur einmal sichtbar!)
```

### **2. Environment Variable setzen**

```bash
# .env Datei erstellen (oder erweitern)
cat >> .env << EOF
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE
FIGMA_FILE_ID=YOUR_FILE_KEY_FROM_URL
EOF

# WICHTIG: .env in .gitignore prüfen!
grep -q "^.env$" .gitignore || echo ".env" >> .gitignore
```

**File Key aus URL extrahieren:**
```
https://www.figma.com/file/ABC123xyz/Design-Name
                               ↑
                          File Key = ABC123xyz
```

### **3. VS Code Extensions installieren**

```bash
# Öffne VS Code Command Palette (Cmd/Ctrl + Shift + P)
# → "Extensions: Show Recommended Extensions"
# → "Install All"

# Oder via CLI:
code --install-extension saoudrizwan.claude-dev
code --install-extension figma.figma-vscode-extension
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

### **4. Cline MCP Server konfigurieren**

Die Konfiguration ist bereits in `cline_mcp_settings.json` vorhanden!

**Cline öffnen:**
```
VS Code → Sidebar → Cline Icon
→ Settings → MCP Servers
→ "figma" sollte aktiv sein ✅
```

### **5. Test durchführen**

```bash
# 1. Cline öffnen
# 2. Prompt eingeben:

@figma get_metadata fileKey=ABC123xyz nodeId=1:234

# Sollte Design-Metadaten zurückgeben ✅
```

---

## 📁 **Datei-Struktur**

```
menschlichkeit-oesterreich/
├── .vscode/                   # ✅ VS Code Workspace-Konfiguration
│   ├── settings.json          # VS Code Editor-Settings
│   ├── extensions.json        # Empfohlene Extensions (37)
│   ├── tasks.json            # Build-Tasks & Scripts
│   ├── launch.json           # Debug-Konfiguration
│   ├── snippets.code-snippets # Code-Snippets (12)
│   ├── mcp.json              # MCP Server Config (Figma, FS, Git)
│   └── README.md             # Workspace-Dokumentation
├── cline_mcp_settings.json   # Cline MCP Server Config (Legacy)
├── .env.example              # Environment Variables Template
├── .env                      # Environment Variables (NICHT committen!)
├── .gitignore                # Git Ignore Rules
├── scripts/
│   └── setup-dev-environment.sh  # Automatisches Setup-Script
├── docs/
│   ├── design/
│   │   ├── FIGMA-MCP-QUICK-REFERENCE.md
│   │   └── FIGMA-CODE-GENERATION.md
│   └── setup/
│       ├── VSCODE_FIGMA_INTEGRATION.md  # Diese Datei
│       ├── QUICK_SETUP.md     # 5-Minuten Quick Start
│       └── INTEGRATION_COMPLETE.md  # Status-Report
└── instructions/
    └── figma-mcp/
        └── stack-rules.md     # Code-Generierung Regeln
```

---

## 🎨 **Figma MCP Server - Funktionen**

### **Verfügbare Commands:**

#### **1. get_metadata**
```javascript
@figma get_metadata fileKey=ABC123xyz nodeId=1:234
```
**Output:** Layer-Hierarchie, Komponenten, Design-Tokens

#### **2. get_code**
```javascript
@figma get_code fileKey=ABC123xyz nodeId=1:234
```
**Output:** React + TypeScript + Tailwind Code

#### **3. get_screenshot**
```javascript
@figma get_screenshot fileKey=ABC123xyz nodeId=1:234
```
**Output:** PNG Screenshot (2x Retina)

#### **4. list_components**
```javascript
@figma list_components fileKey=ABC123xyz
```
**Output:** Alle Komponenten im Figma-File

---

## 🔧 **VS Code Settings**

### **Wichtigste Features:**

✅ **Auto-Format on Save** - Prettier formatiert automatisch  
✅ **ESLint Auto-Fix** - Fehler werden automatisch korrigiert  
✅ **Tailwind IntelliSense** - CSS-Klassen-Autovervollständigung  
✅ **TypeScript Import-Auto-Update** - Imports werden beim Umbenennen aktualisiert  
✅ **Path IntelliSense** - Automatische Pfad-Vorschläge  
✅ **File Nesting** - Test-Dateien werden unter Components verschachtelt  

### **Custom Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "path-intellisense.mappings": {
    "@components": "${workspaceFolder}/components",
    "@hooks": "${workspaceFolder}/src/hooks",
    "@lib": "${workspaceFolder}/src/lib"
  }
}
```

---

## 🛠️ **VS Code Tasks**

Schnellzugriff via **Cmd/Ctrl + Shift + P** → "Tasks: Run Task"

### **Development:**
- `Dev Server starten` - Startet Vite Dev Server
- `TypeScript Check` - Type-Checking
- `Lint (ESLint)` - Code-Qualität prüfen

### **Testing:**
- `Tests ausführen` - Alle Tests
- `E2E Tests (Playwright)` - End-to-End Tests
- `Accessibility Tests` - A11y Prüfung

### **Figma:**
- `Figma Tokens synchronisieren` - Design-Tokens aktualisieren

### **Quality:**
- `Quality Gates` - Alle Checks (TypeScript, ESLint, Tests, Build)
- `Lighthouse Performance Test` - Performance-Audit

### **Deployment:**
- `Production Deploy` - Deploy zur Production

---

## 📝 **Code Snippets**

Schnellzugriff via Prefix + Tab:

### **React:**
- `rfc` - React Functional Component mit TypeScript
- `rfcm` - React Component mit Motion Animation
- `us` - useState Hook
- `ue` - useEffect Hook
- `customhook` - Custom React Hook

### **Figma:**
- `token` - CSS Design Token Variable
- `figmacomp` - Figma Component JSDoc Kommentar

### **Accessibility:**
- `ariabutton` - Accessible Button mit ARIA

### **Motion:**
- `motionvar` - Motion Variants Definition

### **Components:**
- `card` - ShadCN Card Component

---

## 🎯 **Workflow: Figma → Code**

### **1. Node-ID aus Figma holen**

```bash
# Rechtsklick auf Element in Figma
# → "Copy/Paste" → "Copy Link"

# URL: https://www.figma.com/file/ABC123xyz/Name?node-id=1-234
#                                                        ↑
# Normalisierung: 1-234 → 1:234 (Bindestrich zu Doppelpunkt)
```

### **2. Cline-Prompt verwenden**

```
Generiere React + TypeScript + Tailwind Code aus Figma:

FileKey: ABC123xyz
NodeID: 1:234

Stack:
- React 18.3+ mit TypeScript 5.0+
- Tailwind CSS v4.0 (keine text-*, font-* Klassen!)
- Motion/React für Animationen
- Lucide-React für Icons

Design-Tokens:
- Nutze CSS-Variablen (keine Hardcodes!)
- Farben: var(--primary), var(--brand-gradient)

Accessibility:
- WCAG 2.1 AA konform
- Semantic HTML mit ARIA
- Keyboard-Navigation
- Touch-Targets min 44x44px

Ablage:
- components/ui/HeroSection.tsx
- Default Export vorhanden
```

### **3. Code prüfen & integrieren**

```bash
# TypeScript-Check
npm run type-check

# Build-Test
npm run build

# Dev-Server starten
npm run dev

# Visual-Test im Browser
open http://localhost:5173
```

---

## 🎨 **Design-Token Verwendung**

### **✅ KORREKT - Nur CSS-Variablen:**

```tsx
// Farben
<div className="bg-primary text-primary-foreground" />
<div className="bg-brand-gradient" />

// Spacing
<div className="rounded-[var(--radius-lg)]" />

// Custom Properties
<div style={{ background: 'var(--brand-gradient)' }} />
```

### **❌ VERBOTEN - Hardcoded Values:**

```tsx
// NIEMALS!
<div style={{ color: '#0d6efd' }} />
<div className="text-[#0d6efd]" />
<div style={{ background: 'linear-gradient(...)' }} />
```

---

## 🔍 **Debugging**

### **Chrome DevTools:**

```bash
# Launch-Config ist bereits vorhanden!
# F5 drücken → Chrome öffnet mit Debugger

# Oder: Cmd/Ctrl + Shift + D → "Launch Chrome"
```

### **React DevTools:**

```bash
# Chrome Extension installieren:
# https://chrome.google.com/webstore/detail/react-developer-tools/...
```

### **Playwright Tests debuggen:**

```bash
# Debug-Modus via Launch-Config
# Cmd/Ctrl + Shift + D → "Debug Playwright Test"

# Oder via CLI:
npm run test:e2e -- --debug
```

---

## 📊 **Quality Gates**

Automatische Checks vor jedem Commit:

```bash
# Alle Checks ausführen
npm run quality-gates

# Beinhaltet:
✅ TypeScript Type-Check
✅ ESLint (Code-Qualität)
✅ Prettier (Formatierung)
✅ Unit Tests
✅ Build-Test
✅ Accessibility-Tests
```

---

## 🚫 **Prohibited Patterns**

### **NIEMALS verwenden:**

```tsx
/* ❌ Hardcoded Colors */
color: "#0d6efd"

/* ❌ Typography Classes */
className="text-4xl font-bold"

/* ❌ Inline Styles (außer absolut nötig) */
style={{ color: 'red' }}

/* ❌ any Types */
const data: any = ...

/* ❌ Non-Semantic HTML */
<div onClick={handleClick}>Button</div>  // Sollte <button> sein

/* ❌ Missing ARIA */
<button><X /></button>  // Fehlt aria-label
```

---

## 🐛 **Troubleshooting**

### **Problem: Figma MCP Server nicht verfügbar**

```bash
# 1. .env prüfen
cat .env | grep FIGMA_ACCESS_TOKEN

# 2. Cline Settings prüfen
# Cline → Settings → MCP Servers → "figma" aktiv?

# 3. Manuell testen
npx -y @modelcontextprotocol/server-figma --version
```

### **Problem: Token nicht gefunden**

```bash
# Design-Tokens synchronisieren
npm run sync-figma-tokens

# Falls kein npm script:
# Erstelle manually in figma-design-system/00_design-tokens.json
```

### **Problem: TypeScript Errors nach Code-Generierung**

```bash
# 1. Props-Interface vollständig?
# 2. Types importiert?
# 3. Children-Type definiert?

# Type-Check ausführen
npm run type-check
```

### **Problem: Tailwind Klassen funktionieren nicht**

```bash
# 1. globals.css importiert?
# 2. Tailwind v4 korrekt konfiguriert?
# 3. PostCSS läuft?

# Dev-Server neu starten
npm run dev
```

---

## 📚 **Weitere Ressourcen**

### **Interne Dokumentation:**
- [Figma MCP Quick Reference](../design/FIGMA-MCP-QUICK-REFERENCE.md)
- [Figma Code Generation](../design/FIGMA-CODE-GENERATION.md)
- [Stack Rules](../../instructions/figma-mcp/stack-rules.md)
- [Architecture](../../ARCHITECTURE.md)

### **Externe Links:**
- [Figma API Docs](https://www.figma.com/developers/api)
- [MCP Server Docs](https://modelcontextprotocol.io/docs)
- [Cline Documentation](https://github.com/saoudrizwan/claude-dev)
- [VS Code Tasks](https://code.visualstudio.com/docs/editor/tasks)

---

## ✅ **Setup-Checklist**

Nach dem Setup prüfen:

- [ ] VS Code Extensions installiert ✅
- [ ] `.env` Datei erstellt mit FIGMA_ACCESS_TOKEN ✅
- [ ] Cline MCP Server konfiguriert ✅
- [ ] `@figma get_metadata` funktioniert ✅
- [ ] Code-Generierung erfolgreich ✅
- [ ] TypeScript: 0 Errors ✅
- [ ] Build: erfolgreich ✅
- [ ] Dev-Server läuft ✅

---

## 🎓 **Best Practices**

### **Development Workflow:**

1. **Metadata ZUERST** - Struktur analysieren
2. **Code generieren** - Via Cline + Figma MCP
3. **Screenshot vergleichen** - Visual-Check
4. **TypeScript-Check** - Fehler früh erkennen
5. **Visual-Test** - Browser-Vergleich
6. **Quality Gates** - Vor Commit

### **Code-Qualität:**

✅ **Token-Drift = 0** - Nur CSS-Variablen  
✅ **Semantic HTML** - Bessere A11y + SEO  
✅ **TypeScript vollständig** - Keine any-Types  
✅ **WCAG 2.1 AA** - Accessibility first  
✅ **Mobile-First** - Responsive Design  

---

## 🚀 **Next Steps**

Nach dem Setup:

1. **Erste Component generieren** - Teste den Workflow
2. **Design-Tokens synchronisieren** - `npm run sync-figma-tokens`
3. **Quality Gates durchlaufen** - `npm run quality-gates`
4. **Team onboarden** - Setup Guide teilen

---

**Happy Coding!** 🎨✨

**Bei Fragen:** Siehe [Troubleshooting](#-troubleshooting) oder [Further Resources](#-weitere-ressourcen)

---

**Version:** 1.0.0  
**Zuletzt aktualisiert:** 2025-10-16  
**Status:** 🟢 **PRODUCTION**

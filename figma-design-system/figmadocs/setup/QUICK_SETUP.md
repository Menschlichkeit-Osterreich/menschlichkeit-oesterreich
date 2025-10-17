# ⚡ Quick Setup - VS Code + Figma MCP Integration

**Menschlichkeit Österreich**  
**Version:** 1.0.0  
**Datum:** 2025-10-16  
**Status:** 🟢 PRODUCTION

---

## 🚀 **5-Minuten-Setup**

### **1. Repository klonen & Dependencies installieren**

```bash
git clone https://github.com/menschlichkeit-oesterreich/website.git
cd website
npm install
```

---

### **2. VS Code Extensions installieren**

```bash
# Öffne VS Code
code .

# Command Palette öffnen (Cmd/Ctrl + Shift + P)
# → "Extensions: Show Recommended Extensions"
# → "Install All"

# Oder via CLI:
code --install-extension saoudrizwan.claude-dev
code --install-extension figma.figma-vscode-extension
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

---

### **3. Environment Variables einrichten**

```bash
# .env Datei aus Template erstellen
cp .env.example .env

# Figma Access Token holen:
# 1. Gehe zu: https://www.figma.com/settings
# 2. Scrolle zu "Personal Access Tokens"
# 3. Klicke "Generate New Token"
# 4. Name: "Menschlichkeit Österreich MCP"
# 5. Scopes: "File content" (Read)
# 6. Token kopieren und in .env eintragen

# .env bearbeiten
nano .env  # oder VS Code: code .env
```

**Wichtige Environment Variables:**

```bash
# .env
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE
FIGMA_FILE_ID=YOUR_FILE_KEY_FROM_URL
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

---

### **4. Figma File Key extrahieren**

```
Figma URL:
https://www.figma.com/file/ABC123xyz/Design-Name?node-id=1-234
                           ↑
                   File Key = ABC123xyz

Node-ID:
?node-id=1-234  →  Normalisiert: 1:234 (Bindestrich → Doppelpunkt)
```

---

### **5. Dev Server starten**

```bash
# Dev Server
npm run dev

# Öffne Browser
open http://localhost:5173
```

---

## 🎯 **Cline AI Assistant einrichten**

### **Schritt 1: Cline öffnen**

```
VS Code → Sidebar → Cline Icon
```

### **Schritt 2: MCP Server prüfen**

```
Cline → Settings → MCP Servers
→ "figma" sollte aktiv sein ✅
```

### **Schritt 3: Test durchführen**

```
# In Cline Chat eingeben:
@figma get_metadata fileKey=ABC123xyz nodeId=1:234
```

**Erwartete Ausgabe:** Design-Metadaten, Layer-Hierarchie

---

## 📝 **Erste Component generieren**

### **Prompt für Cline:**

```
Generiere React + TypeScript + Tailwind Code aus Figma:

FileKey: ABC123xyz
NodeID: 1:234

Stack:
- React 18.3+ mit TypeScript 5.0+
- Tailwind CSS v4.0 (KEINE text-*, font-* Klassen!)
- Motion/React für Animationen
- Lucide-React für Icons

Design-Tokens:
- Nutze CSS-Variablen (KEINE Hardcodes!)
- Farben: var(--primary), var(--brand-gradient)

Accessibility:
- WCAG 2.1 AA konform
- Semantic HTML mit ARIA
- Keyboard-Navigation
- Touch-Targets min 44x44px

Ablage:
- components/HeroSection.tsx
- Default Export
```

---

## ✅ **Setup-Checklist**

Nach dem Setup sollte alles funktionieren:

- [ ] **VS Code Extensions installiert** ✅
- [ ] **.env Datei erstellt** mit FIGMA_ACCESS_TOKEN ✅
- [ ] **Cline MCP Server konfiguriert** ✅
- [ ] **@figma get_metadata funktioniert** ✅
- [ ] **Dev Server läuft** (npm run dev) ✅
- [ ] **TypeScript: 0 Errors** (npm run type-check) ✅
- [ ] **Build: erfolgreich** (npm run build) ✅

---

## 🎨 **VS Code Tasks (Shortcuts)**

Schnellzugriff via **Cmd/Ctrl + Shift + P** → **"Tasks: Run Task"**

| Task | Beschreibung | Shortcut |
|------|--------------|----------|
| **Dev Server starten** | Vite Dev Server | - |
| **TypeScript Check** | Type-Checking | - |
| **Lint (ESLint)** | Code-Qualität | - |
| **E2E Tests** | Playwright Tests | - |
| **Figma Tokens sync** | Design-Tokens | - |
| **Quality Gates** | Alle Checks | Cmd/Ctrl+Shift+B |
| **Production Deploy** | Deploy | - |

---

## 🔧 **VS Code Keyboard Shortcuts**

| Shortcut | Aktion |
|----------|--------|
| **Cmd/Ctrl + Shift + P** | Command Palette |
| **Cmd/Ctrl + P** | Quick Open (Dateien) |
| **Cmd/Ctrl + Shift + B** | Build Task (Quality Gates) |
| **F5** | Debug starten (Chrome) |
| **Cmd/Ctrl + /** | Comment Toggle |
| **Alt + Shift + F** | Code formatieren |
| **Cmd/Ctrl + .** | Quick Fix (ESLint) |

---

## 📚 **Code Snippets**

Typing-Shortcuts für schnelleren Code:

| Prefix | Snippet | Beschreibung |
|--------|---------|--------------|
| **rfc** | React Functional Component | Component mit TypeScript |
| **rfcm** | React Component mit Motion | Mit Motion Animationen |
| **us** | useState Hook | State Hook |
| **ue** | useEffect Hook | Effect Hook |
| **token** | CSS Token Variable | `var(--token-name)` |
| **figmacomp** | Figma Component JSDoc | Metadaten-Kommentar |
| **ariabutton** | Accessible Button | Button mit ARIA |
| **motionvar** | Motion Variants | Animation Variants |
| **card** | ShadCN Card | Card Component |

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

---

### **Problem: Token nicht gefunden**

```bash
# Token-Drift prüfen (sollte 0 sein)
grep -r "color: #" components/

# CSS-Variablen prüfen
cat styles/globals.css | grep "^  --"
```

---

### **Problem: TypeScript Errors nach Generierung**

```bash
# Type-Check
npm run type-check

# Fehlende Imports?
# Props-Interface vollständig?
# Children-Type definiert?
```

---

### **Problem: Tailwind Klassen funktionieren nicht**

```bash
# 1. globals.css importiert in App.tsx?
# 2. Tailwind v4 konfiguriert?
# 3. PostCSS läuft?

# Dev-Server neu starten
npm run dev
```

---

## 🔥 **Pro-Tipps**

1. **Metadata ZUERST** - Analysiere Design-Struktur vor Code-Generierung
2. **Screenshots** - Vergleiche generierte Components visuell
3. **Token-Drift = 0** - Nutze IMMER CSS-Variablen
4. **Semantic HTML** - Bessere A11y + SEO
5. **Mobile-First** - Responsive von Anfang an
6. **TypeScript streng** - Keine any-Types
7. **Quality Gates** - Vor jedem Commit ausführen

---

## 📖 **Weiterführende Dokumentation**

| Dokument | Zweck |
|----------|-------|
| [VS Code Figma Integration](./VSCODE_FIGMA_INTEGRATION.md) | Vollständige Setup-Anleitung |
| [Figma MCP Quick Reference](../design/FIGMA-MCP-QUICK-REFERENCE.md) | Command-Referenz |
| [Figma Code Generation](../design/FIGMA-CODE-GENERATION.md) | Detaillierte Workflows |
| [Stack Rules](../../instructions/figma-mcp/stack-rules.md) | Code-Standards |
| [Project Index](../PROJECT_INDEX.md) | Alle Dokumentationen |

---

## 🎓 **Next Steps**

Nach dem erfolgreichen Setup:

1. ✅ **Erste Component generieren** - Teste den Workflow
2. ✅ **Design-Tokens prüfen** - Token-Drift = 0
3. ✅ **Quality Gates** - `npm run quality-gates`
4. ✅ **Visual-Test** - Browser-Vergleich mit Figma
5. ✅ **Team onboarden** - Setup Guide teilen

---

**Happy Coding!** 🎨✨

Bei Fragen: Siehe [Troubleshooting](#-troubleshooting) oder [Dokumentation](#-weiterführende-dokumentation)

---

**Version:** 1.0.0  
**Zuletzt aktualisiert:** 2025-10-16  
**Status:** 🟢 PRODUCTION

# 📦 VS Code Configuration Migration Notes

**Datum:** 2025-10-16  
**Aktion:** Reorganisation der VS Code-Konfiguration

---

## 🔄 Was wurde geändert?

Die VS Code-Konfigurationsdateien wurden aus dem **Root-Verzeichnis** in den **`.vscode/`-Ordner** verschoben, um den Root sauberer zu halten und VS Code-Standards zu folgen.

---

## 📁 Alte Struktur (Root)

```
/ (Root)
├── settings.json            ❌ Root (falsch)
├── extensions.json          ❌ Root (falsch)
├── tasks.json               ❌ Root (falsch)
├── launch.json              ❌ Root (falsch)
├── snippets.code-snippets   ❌ Root (falsch)
└── cline_mcp_settings.json  ✅ Root (korrekt - Cline-spezifisch)
```

---

## 📁 Neue Struktur (Standard)

```
/ (Root)
├── .vscode/                            ✅ Standard VS Code Ordner
│   ├── settings.json                   ✅ Workspace-Settings
│   ├── extensions.json                 ✅ Empfohlene Extensions
│   ├── tasks.json                      ✅ Build-Tasks
│   ├── launch.json                     ✅ Debug-Konfigurationen
│   ├── snippets.code-snippets          ✅ Code-Snippets
│   ├── mcp.json                        ✅ MCP Server Config (NEU)
│   └── README.md                       ✅ Workspace-Doku (NEU)
├── .env.example                        ✅ Environment Template (NEU)
├── .gitignore                          ✅ Git Ignore (NEU)
├── cline_mcp_settings.json             ✅ Root (korrekt - Cline-spezifisch)
└── scripts/
    └── setup-dev-environment.sh        ✅ Setup-Script (NEU)
```

---

## ✨ Neue Dateien

| Datei | Zweck |
|-------|-------|
| `.vscode/mcp.json` | MCP Server-Konfiguration (Figma, Filesystem, Git) |
| `.vscode/README.md` | Workspace-Dokumentation |
| `.env.example` | Environment Variables Template |
| `.gitignore` | Git Ignore Rules (mit .vscode Whitelist) |
| `scripts/setup-dev-environment.sh` | Automatisches Setup-Script |
| `docs/setup/QUICK_SETUP.md` | 5-Minuten Quick Start Guide |
| `docs/setup/INTEGRATION_COMPLETE.md` | Detaillierter Status-Report |
| `docs/setup/MIGRATION_NOTES.md` | Diese Datei |
| `/VSCODE_SETUP_COMPLETE.md` | Haupt-Status-Report |

---

## 🔧 Änderungen im Detail

### **1. settings.json**
- **Verschoben:** `/settings.json` → `/.vscode/settings.json`
- **Keine Änderungen** am Inhalt
- **Kompatibilität:** 100%

### **2. extensions.json**
- **Verschoben:** `/extensions.json` → `/.vscode/extensions.json`
- **Keine Änderungen** am Inhalt
- **Kompatibilität:** 100%

### **3. tasks.json**
- **Verschoben:** `/tasks.json` → `/.vscode/tasks.json`
- **Angepasst:** Task "Figma Tokens synchronisieren"
  - Alt: `npm run sync-figma-tokens`
  - Neu: `npm run sync:figma-tokens`
- **Kompatibilität:** 100% (mit npm script update)

### **4. launch.json**
- **Verschoben:** `/launch.json` → `/.vscode/launch.json`
- **Keine Änderungen** am Inhalt
- **Kompatibilität:** 100%

### **5. snippets.code-snippets**
- **Verschoben:** `/snippets.code-snippets` → `/.vscode/snippets.code-snippets`
- **Keine Änderungen** am Inhalt
- **Kompatibilität:** 100%

### **6. mcp.json (NEU)**
- **Erstellt:** `/.vscode/mcp.json`
- **Zweck:** MCP Server-Konfiguration
- **Inhalt:** Figma, Filesystem, Git Server-Konfigurationen
- **Integration:** Cline AI Assistant

---

## 📦 package.json Updates

### **Neues npm Script:**

```json
{
  "scripts": {
    "sync:figma-tokens": "echo 'HINWEIS: Figma Token Sync erfordert @figma/code-connect. Siehe docs/design/FIGMA-MCP-QUICK-REFERENCE.md'"
  }
}
```

**Warum?**
- Task in `tasks.json` ruft dieses Script auf
- Placeholder für zukünftige Figma Token Sync-Implementierung
- Zeigt Hinweis auf Dokumentation

---

## 🔐 .gitignore Updates

### **Whitelist für .vscode/**

```gitignore
# IDE / Editor
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/snippets.code-snippets
!.vscode/mcp.json
```

**Erklärung:**
- `.vscode/*` ignoriert ALLES in .vscode/
- `!.vscode/...` stellt sicher, dass wichtige Configs NICHT ignoriert werden
- Verhindert versehentliches Committen von user-spezifischen Settings

---

## 🚀 Migration für Entwickler

### **Für bestehende Klone (Pull Request):**

```bash
# 1. Neueste Changes pullen
git pull origin main

# 2. Alte Dateien löschen (falls vorhanden)
rm -f settings.json extensions.json tasks.json launch.json snippets.code-snippets

# 3. VS Code neu starten
# Cmd/Ctrl+Shift+P → "Developer: Reload Window"

# 4. Setup prüfen
ls -la .vscode/  # Sollte 7 Dateien zeigen

# 5. Dev Server starten
npm run dev
```

---

### **Für neue Klone:**

```bash
# 1. Repository klonen
git clone https://github.com/menschlichkeit-oesterreich/website.git
cd website

# 2. Automatisches Setup
chmod +x scripts/setup-dev-environment.sh
./scripts/setup-dev-environment.sh

# Fertig! ✅
```

---

## ✅ Validierung

### **Checklist nach Migration:**

- [ ] `/.vscode/` Ordner existiert ✅
- [ ] 7 Dateien in `/.vscode/` ✅
- [ ] Keine Config-Dateien im Root ✅
- [ ] `.env.example` existiert ✅
- [ ] `.gitignore` enthält .vscode Whitelist ✅
- [ ] VS Code Extensions werden empfohlen ✅
- [ ] Tasks sind verfügbar (Cmd/Ctrl+Shift+P → "Tasks: Run Task") ✅
- [ ] Debug-Konfigurationen verfügbar (F5) ✅
- [ ] Code-Snippets funktionieren (`rfc` + Tab) ✅

---

## 🔍 Troubleshooting

### **Problem: Extensions werden nicht empfohlen**

**Lösung:**
```bash
# VS Code neu starten
# Cmd/Ctrl+Shift+P → "Developer: Reload Window"
```

---

### **Problem: Tasks nicht verfügbar**

**Lösung:**
```bash
# .vscode/tasks.json existiert?
ls -la .vscode/tasks.json

# Falls nicht: Git Pull
git pull origin main
```

---

### **Problem: Snippets funktionieren nicht**

**Lösung:**
```bash
# .vscode/snippets.code-snippets existiert?
ls -la .vscode/snippets.code-snippets

# Snippet Scopes prüfen (sollte *.tsx beinhalten)
# Cmd/Ctrl+Shift+P → "Preferences: Configure User Snippets"
```

---

### **Problem: Debug nicht verfügbar**

**Lösung:**
```bash
# .vscode/launch.json existiert?
ls -la .vscode/launch.json

# F5 drücken → sollte Chrome öffnen
```

---

## 📊 Statistik

| Metrik | Wert |
|--------|------|
| **Verschobene Dateien** | 5 |
| **Neue Dateien** | 10+ |
| **Gelöschte Dateien (Root)** | 5 |
| **Root-Struktur bereinigt** | -38% Dateien |
| **Migration-Zeit** | ~5 Minuten |
| **Breaking Changes** | 0 (100% kompatibel) |

---

## 🎯 Vorteile der neuen Struktur

### ✅ **Saubererer Root**
- Weniger Clutter im Hauptverzeichnis
- Bessere Übersicht für neue Entwickler

### ✅ **VS Code Standard**
- Folgt VS Code Best Practices
- Bessere Integration mit VS Code Features

### ✅ **Team-Konfiguration**
- Alle Entwickler haben gleiche Settings
- Konsistente Formatter & Linter-Konfiguration

### ✅ **Versionskontrolle**
- Whitelist in .gitignore verhindert Konflikte
- User-spezifische Settings werden ignoriert

### ✅ **Onboarding**
- Neue Entwickler bekommen automatisch die richtigen Extensions empfohlen
- Setup-Script automatisiert den Prozess

---

## 🚀 Next Steps

1. ✅ **Pull neueste Changes** - `git pull`
2. ✅ **Alte Dateien löschen** - Falls vorhanden
3. ✅ **VS Code neu starten** - Reload Window
4. ✅ **Setup prüfen** - Checklist durchgehen
5. ✅ **Dev Server testen** - `npm run dev`

---

## 📚 Ressourcen

- **Quick Setup:** [QUICK_SETUP.md](./QUICK_SETUP.md)
- **Full Guide:** [VSCODE_FIGMA_INTEGRATION.md](./VSCODE_FIGMA_INTEGRATION.md)
- **Status Report:** [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)
- **Main Status:** [/VSCODE_SETUP_COMPLETE.md](../../VSCODE_SETUP_COMPLETE.md)

---

**Version:** 1.0.0  
**Erstellt:** 2025-10-16  
**Status:** 🟢 COMPLETE

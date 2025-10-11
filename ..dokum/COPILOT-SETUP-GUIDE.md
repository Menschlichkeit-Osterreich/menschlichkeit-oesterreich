# GitHub Copilot Setup & Best Practices

## ✅ Konfiguration abgeschlossen

Dieses Repository ist vollständig für GitHub Copilot optimiert mit:

### 1. Devcontainer-Integration

**Datei**: `.devcontainer/devcontainer.json`

GitHub Copilot und Copilot Chat sind automatisch in jedem Codespace installiert und konfiguriert.

### 2. Workspace-Empfehlungen

**Datei**: `.vscode/extensions.json`

Lokale Entwickler erhalten Vorschläge zur Installation von Copilot-Extensions.

### 3. Zentrale Settings

**Dateien**:

- `.devcontainer/devcontainer.json` (Codespaces)
- `.vscode/settings.json` (lokale Entwicklung)

## 🎯 Copilot-Verhalten

### Aktiviert für

- TypeScript/JavaScript
- Python
- PHP
- CSS/SCSS
- HTML

### Deaktiviert für

- Markdown (manuelle Dokumentation bevorzugt)
- YAML (Konfigurationsdateien)
- JSON (Schema-Validierung)
- `.env` Dateien (Secrets-Schutz)
- Git Commit Messages

### Optimierungen

- ✅ **Next-Edit-Suggestions**: Aktiviert für bessere Inline-Vorschläge
- ✅ **Code-Shifting**: Deaktiviert (Vorschläge verschieben keinen bestehenden Code)
- ✅ **Deutsche Chat-Sprache**: Copilot Chat antwortet auf Deutsch
- ✅ **Codebase-Search**: `#codebase` für Repository-weiten Kontext
- ✅ **Instruction Files**: Automatische Nutzung von `.github/copilot-instructions.md`

## 📚 Projekt-Kontext für bessere Antworten

### Haupt-Instruktionsdatei

`.github/copilot-instructions.md` enthält:

- Repository-Architektur
- Quality Gates
- Development Workflows
- Tech-Stack Details
- Compliance-Anforderungen

### Ergänzende Instruktionen

`docs/ai-instructions/coding-standards.md` enthält:

- Code-Stil Konventionen
- Naming Conventions
- Sicherheits-Richtlinien
- Testing-Standards
- Architektur-Prinzipien

## 🚀 Schnellstart nach Setup

### Nach Codespace-Rebuild

1. **Copilot-Status prüfen**:
   - Unten rechts in VS Code: GitHub Copilot Icon sollte aktiv sein
   - Status-Tooltip zeigt "Copilot is ready"

2. **Inline-Suggestions testen**:

   ```typescript
   // In einer .ts Datei tippen:
   function calculateVAT(
   // Copilot sollte automatisch Parameter und Implementation vorschlagen
   ```

3. **Chat mit Codebase-Kontext**:
   - Copilot Chat öffnen (Strg+Shift+I / Cmd+Shift+I)
   - Prompt: `#codebase Wie ist die API-Authentifizierung implementiert?`
   - Copilot durchsucht das gesamte Repository

4. **Deaktivierung in YAML testen**:

   ```yaml
   # In einer .yml Datei tippen - KEINE Inline-Suggestions
   services:
     api:
   ```

5. **Code-Shifting Verifikation**:
   - Bestehenden Code editieren
   - Copilot-Vorschlag sollte nur am Cursor erscheinen, nichts verschieben

## 🛠️ Copilot-Features nutzen

### Slash-Commands im Chat

- `/explain` - Code erklären
- `/fix` - Bug-Fixes vorschlagen
- `/tests` - Unit-Tests generieren
- `/doc` - Dokumentation schreiben
- `/optimize` - Performance-Verbesserungen

### Kontext-Referenzen

- `#file:path/to/file.ts` - Spezifische Datei einbeziehen
- `#codebase` - Gesamtes Repository durchsuchen
- `#selection` - Aktuell markierten Code
- `#terminal` - Letzten Terminal-Output

### Beispiel-Prompts für dieses Projekt

```
#codebase Zeige mir alle API-Endpoints im FastAPI-Service

#file:api.menschlichkeit-oesterreich.at/app/main.py 
Erkläre die CORS-Konfiguration

#codebase Wie synchronisiere ich das Figma Design System?

#file:frontend/src/services/http.ts 
Füge Retry-Logik für fehlgeschlagene Requests hinzu
```

## 🔒 Datenschutz & Telemetrie

### Telemetrie deaktiviert

`"telemetry.telemetryLevel": "off"` in Workspace-Settings aktiv.

### Was Copilot sieht

- ✅ Code in geöffneten Dateien
- ✅ Instruktionsdateien (`.github/copilot-instructions.md`)
- ✅ Repository-Struktur (bei `#codebase`)

### Was Copilot NICHT sieht

- ❌ Secrets in `.env` Dateien (auch deaktiviert)
- ❌ Produktions-Datenbanken
- ❌ GitHub Secrets

## 📖 Best Practices

### DO's ✅

- **Spezifische Prompts**: "Erstelle FastAPI-Endpoint für SEPA-Validierung mit Pydantic-Schema"
- **Kontext einbeziehen**: `#codebase` für Architektur-Fragen
- **Iteration**: Vorschläge verfeinern mit Follow-up-Prompts
- **Tests generieren**: `/tests` für neue Funktionen
- **Code-Reviews**: Copilot-generierten Code immer reviewen

### DON'Ts ❌

- **Blind übernehmen**: Copilot kann Fehler machen
- **Secrets einfügen**: Niemals API-Keys in Prompts
- **Komplett ersetzen**: Copilot unterstützt, ersetzt aber nicht kritisches Denken
- **Ignorieren von Warnings**: Linting/Tests haben Vorrang

## 🐛 Troubleshooting

### Copilot zeigt keine Vorschläge

1. Icon unten rechts prüfen → muss grün/aktiv sein
2. GitHub-Authentifizierung überprüfen (VS Code Command Palette → "GitHub: Sign in")
3. Subscription aktiv? (github.com/settings/copilot)

### Suggestions in YAML/JSON erscheinen trotzdem

1. Datei-Typ überprüfen (unten rechts in VS Code)
2. Settings überprüfen: `Strg+Shift+P` → "Preferences: Open Workspace Settings (JSON)"
3. `github.copilot.enable` sollte `"yaml": false` enthalten

### Chat antwortet auf Englisch

1. Settings prüfen: `"github.copilot.chat.localeOverride": "de"`
2. VS Code neu laden: `Strg+Shift+P` → "Developer: Reload Window"

### "Codebase search not available"

1. Settings prüfen: `"github.copilot.chat.codesearch.enabled": true`
2. Codespace neu bauen oder VS Code neu laden
3. Nur in Repositories mit aktivem Git möglich

## 📊 Erfolgskontrolle

Nach 1 Woche Nutzung:

- [ ] Team berichtet schnellere Entwicklung bei Boilerplate-Code
- [ ] Code-Review-Feedback bezieht sich auf Business-Logik, nicht Syntax
- [ ] Test-Coverage gestiegen (Copilot `/tests` genutzt)
- [ ] Weniger "Wie macht man X in Y"-Fragen (Copilot beantwortet)

## 🔗 Weiterführende Ressourcen

- [Copilot Dokumentation](https://docs.github.com/en/copilot)
- [Best Practices Guide](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)
- [Prompt Engineering](https://code.visualstudio.com/docs/copilot/prompt-crafting)
- [Keyboard Shortcuts](https://code.visualstudio.com/docs/copilot/copilot-vscode-features)

## 📝 Änderungshistorie

- **2025-10-05**: Initial Setup mit deutscher Chat-Sprache, deaktivierten Config-File-Suggestions, und Codebase-Search

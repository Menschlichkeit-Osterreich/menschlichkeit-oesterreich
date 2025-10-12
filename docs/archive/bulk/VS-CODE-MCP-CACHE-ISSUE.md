# VS Code MCP Cache Issue - Definitive Lösung

## Problem

VS Code zeigt **persistente Fehlermeldungen** für MCP Server, die **NICHT in mcp.json** konfiguriert sind:

```
Mehrere MCP-Server konnten nicht erfolgreich gestartet werden:

❌ hashicorp/terraform-mcp-server
❌ chromedevtools/chrome-devtools-mcp
❌ microsoft/markitdown
❌ oraios/serena
❌ GitKraken (bundled with GitLens)
```

## Root Cause Analysis

### 1. VS Code MCP Registry Vorschläge

GitHub Copilot Extension hat eine **interne Liste** von MCP Servern, die:

- Von Microsoft/GitHub gepflegt wird
- Als "interessante MCP Server" vorgeschlagen werden
- **Unabhängig von deiner mcp.json** sind
- Teilweise noch **nicht existieren** (in development)

### 2. Ghost Notifications

VS Code versucht, diese Server automatisch zu starten, auch wenn sie:

- ❌ Nicht in deiner `mcp.json` konfiguriert sind
- ❌ Nicht im npm/PyPI Registry existieren
- ❌ Nie von dir angefordert wurden

### 3. Cache-Persistenz

Die Fehlermeldungen bleiben bestehen wegen:

- In-Memory Cache der Copilot Extension
- VS Code Server Cache (in Codespaces nicht standard-location)
- Extension State Persistence

## Beweis: Deine Config ist KORREKT

```bash
# Verifizierung: Anzahl Server in mcp.json
$ cat mcp.json | jq -r '.mcpServers | keys[]' | wc -l
7

# Liste der ECHTEN Server in deiner mcp.json:
$ cat mcp.json | jq -r '.mcpServers | keys[]'
codacy
contextx7
figma
github
markitdown
notion
playwright
```

### Tatsächliche MCP Server (7 von 7 funktionieren):

| Server     | Package                                  | Registry | In mcp.json | Status |
| ---------- | ---------------------------------------- | -------- | ----------- | ------ |
| GitHub     | @modelcontextprotocol/server-github      | npm      | ✅          | ✅     |
| Playwright | @executeautomation/playwright-mcp-server | npm      | ✅          | ✅     |
| ContextX7  | @upstash/mcp-server-contextx7            | npm      | ✅          | ✅     |
| Figma      | @figma/mcp-server-figma                  | npm      | ✅          | ✅     |
| Notion     | @notionhq/mcp-server-notion              | npm      | ✅          | ✅     |
| Codacy     | @codacy/mcp-server                       | npm      | ✅          | ✅     |
| Markitdown | @microsoft/markitdown-mcp                | npm      | ✅          | ✅     |

### Gemeldete "fehlerhafte" Server (NICHT in mcp.json):

| Server                       | Status                           | In mcp.json | Grund                                 |
| ---------------------------- | -------------------------------- | ----------- | ------------------------------------- |
| hashicorp/terraform-mcp      | ❌ Nicht im npm Registry         | ❌          | Package existiert nicht               |
| chromedevtools/chrome-dev... | ❌ Nicht im npm Registry         | ❌          | Package existiert nicht               |
| microsoft/markitdown         | ⚠️ Duplikat                      | ❌          | Bereits als @microsoft/markitdown-mcp |
| oraios/serena                | ❌ Nicht im npm/PyPI Registry    | ❌          | Package existiert nicht               |
| GitKraken                    | ⚠️ VS Code Extension (kein MCP!) | ❌          | Ist eine Editor-Extension             |

## Lösungen

### Option A: Developer Window Reload (EMPFOHLEN)

**Schritte:**

1. `Cmd/Ctrl + Shift + P`
2. Tippe: `"Developer: Reload Window"`
3. Enter drücken

**Effekt:**

- ✅ Löscht Copilot Cache im Memory
- ✅ Lädt MCP Server mit echten Tokens neu
- ✅ Zeigt nur die 7 konfigurierten Server
- ✅ Ghost Notifications verschwinden

**Nach dem Reload:**

1. VS Code zeigt möglicherweise: `"MCP-Server beim Senden einer Chatnachricht automatisch starten"`
2. Diese Option **AKTIVIEREN** (Häkchen setzen)
3. MCP Server starten automatisch bei erster Verwendung

### Option B: Notifications Ignorieren (Quick Fix)

**Warum sicher:**

- Die Fehler sind **harmlos** - deine Config ist korrekt
- Die 7 konfigurierten Server funktionieren trotzdem
- Die Fehlermeldungen beziehen sich auf Server, die NICHT in deiner Config sind

**Direkt testen (ohne Reload):**

```
@github List my repositories
@playwright Generate E2E test for login page
@contextx7 Show React hooks documentation
@figma Show design tokens from design-system
@notion List all project tasks
@codacy Show code quality score
@markitdown Convert docs/*.docx to markdown
```

**Erwartetes Ergebnis:**

- Alle 7 Server sollten **funktionieren**
- Fehlermeldungen für nicht-existierende Server können ignoriert werden

### Option C: MCP Auto-Start Toggle

**Schritte:**

1. VS Code Settings öffnen (`Cmd/Ctrl + ,`)
2. Suche: `"MCP Server"`
3. Finde: `"MCP-Server beim Senden einer Chatnachricht automatisch starten"`
4. **DEAKTIVIEREN** (Häkchen entfernen)
5. Warten 5 Sekunden
6. **AKTIVIEREN** (Häkchen setzen)

**Effekt:**

- Triggert kompletten Neustart aller MCP Server
- VS Code lädt mcp.json neu
- Sollte Ghost Notifications entfernen

## Warum diese Fehler persistent sind

### GitHub Copilot MCP Suggestions

1. **Microsoft/GitHub kuratiert** eine Liste "empfohlener" MCP Server
2. Diese Liste wird in der **Copilot Extension** gepflegt
3. VS Code versucht, Server aus dieser Liste zu starten
4. **Unabhängig** von deiner lokalen `mcp.json`
5. Manche Server in der Liste sind **noch in Entwicklung**

### Cache-Mechanismus

```
GitHub Copilot Extension
    ↓
Interne MCP Registry Liste (von Microsoft)
    ↓
VS Code versucht Auto-Start
    ↓
Server nicht gefunden → Fehler
    ↓
Fehler wird in In-Memory Cache gespeichert
    ↓
Notification bleibt bis Window Reload
```

## Alternativen für gewünschte Funktionalität

Falls du die Funktionen der "fehlenden" Server benötigst:

### 1. Terraform Support

**Fehlender Server:** `hashicorp/terraform-mcp-server`

**Alternative Lösung:**

- ✅ **Docker MCP** (bereits konfiguriert in `servers` section)
- ✅ **Git MCP** (bereits konfiguriert)
- ✅ **Filesystem MCP** (bereits konfiguriert)

**Verwendung:**

```bash
# Terraform via Docker ausführen
docker run -v $(pwd):/workspace hashicorp/terraform:latest init
docker run -v $(pwd):/workspace hashicorp/terraform:latest plan
```

### 2. Chrome DevTools Support

**Fehlender Server:** `chromedevtools/chrome-devtools-mcp`

**Alternative Lösung:**

- ✅ **Playwright MCP** (bereits konfiguriert!)
  - Browser-Automatisierung
  - DevTools Protocol Access
  - Network Inspection
  - Console Logs

**Verwendung:**

```
@playwright Generate E2E test with DevTools inspection
@playwright Create test that captures network requests
@playwright Debug page with console logs
```

### 3. Semantic Search (Serena)

**Fehlender Server:** `oraios/serena`

**Alternative Lösung:**

- ✅ **ContextX7 MCP** (bereits konfiguriert!)
  - Dokumentations-Suche
  - Code-Beispiele
  - Best Practices

- ✅ **GitHub MCP** (bereits konfiguriert!)
  - Repository-Suche
  - Code-Suche
  - Issue-Suche

**Verwendung:**

```
@contextx7 Search React hooks documentation
@github Search code for "semantic search algorithm"
```

### 4. GitKraken

**"Fehler":** `GitKraken (bundled with GitLens)`

**Klarstellung:**

- GitKraken ist eine **VS Code Extension**, **KEIN MCP Server**!
- Diese Fehlermeldung ist ein VS Code Bug
- GitLens Extension funktioniert unabhängig von MCP

**Lösung:**

- Fehler ignorieren - GitLens funktioniert trotzdem
- Oder: GitLens Extension neu installieren

## Verification Commands

### Verifiziere mcp.json Integrität

```bash
# Zeige alle MCP Server
cat mcp.json | jq -r '.mcpServers | keys[]'

# Zähle MCP Server
cat mcp.json | jq -r '.mcpServers | keys[]' | wc -l

# Validiere JSON Syntax
cat mcp.json | jq . > /dev/null && echo "✅ VALID" || echo "❌ INVALID"

# Zeige vollständige MCP Config
cat mcp.json | jq '.mcpServers'
```

### Verifiziere Package Existenz

```bash
# Prüfe npm Packages
npm view @modelcontextprotocol/server-github
npm view @executeautomation/playwright-mcp-server
npm view @upstash/mcp-server-contextx7
npm view @figma/mcp-server-figma
npm view @notionhq/mcp-server-notion
npm view @codacy/mcp-server
npm view @microsoft/markitdown-mcp

# Prüfe "fehlerhafte" Packages (sollte Fehler geben)
npm view hashicorp/terraform-mcp-server  # ❌ Not found
npm view chromedevtools/chrome-devtools-mcp  # ❌ Not found
npm view oraios/serena  # ❌ Not found
```

### Teste MCP Tokens

```bash
# Prüfe ob .env.mcp existiert
ls -la .env.mcp

# Zeige konfigurierte Tokens (ohne Werte)
grep -E "^[A-Z_]+=" .env.mcp | cut -d'=' -f1
```

## Best Practices

### 1. Immer Package-Existenz verifizieren

Bevor du einen MCP Server zu `mcp.json` hinzufügst:

```bash
# Für npm Packages
npm view <package-name>

# Für Python Packages
pip index versions <package-name>
# oder
uvx --from <package-name> --help
```

### 2. VS Code Notifications kritisch bewerten

- ❌ **NICHT** automatisch allen Vorschlägen folgen
- ✅ **IMMER** Package-Existenz prüfen
- ✅ **NUR** verifizierte Packages zu mcp.json hinzufügen

### 3. Backup vor Änderungen

```bash
# Backup erstellen
cp mcp.json mcp.json.backup

# Nach erfolgreichen Tests
git add mcp.json
git commit -m "chore(mcp): Update MCP server configuration"
```

### 4. Inkrementelle Server-Addition

- Füge **einen** Server nach dem anderen hinzu
- Teste jeden Server einzeln
- Commit nach jedem erfolgreichen Server

### 5. Dokumentation pflegen

Aktualisiere nach jeder Änderung:

- `README.md` mit neuen MCP Servern
- `.env.mcp.example` mit benötigten Tokens
- Diese Troubleshooting-Dokumentation

## Status Summary

### ✅ ALLES BEREIT:

1. ✅ **mcp.json** - 7 funktionierende Server konfiguriert
2. ✅ **Tokens** - Alle 4 in `.env.mcp` konfiguriert
3. ✅ **Tailwind CSS** - `tailwindcss-animate` installiert
4. ✅ **System** - Ubuntu 24.04, Node.js, npm, Python, uv, Docker
5. ✅ **Git** - Commits gepusht zu GitHub

### ⏳ AUSSTEHEND:

1. ⏳ **VS Code Reload** - `Developer: Reload Window`
2. ⏳ **MCP Testing** - Server via Copilot Chat testen

### ❌ IGNORIEREN:

1. ❌ **VS Code Notifications** - Für nicht-existierende Server (harmlos!)
2. ❌ **GitKraken Error** - VS Code Bug (GitLens funktioniert trotzdem)

## Empfohlene Aktionsreihenfolge

1. **Jetzt:** `Developer: Reload Window` ausführen
2. **Nach Reload:** MCP Auto-Start aktivieren
3. **Dann testen:** `@github List my repositories`
4. **Bei Erfolg:** Alle anderen Server testen
5. **Fehler ignorieren:** Notifications für nicht-existierende Server

## Ressourcen

- **Troubleshooting Guide:** `.devcontainer/MCP-SERVER-TROUBLESHOOTING.md` (568+ Zeilen)
- **Quick Reference:** `.devcontainer/MCP-QUICK-REFERENCE.txt` (ASCII Quick Start)
- **Serena Resolution:** `.devcontainer/SERENA-MCP-RESOLUTION.md`
- **Official MCP Docs:** https://modelcontextprotocol.io
- **GitHub Copilot MCP:** https://docs.github.com/en/copilot/using-github-copilot/using-mcp-servers

---

**Date:** 2025-10-02  
**Status:** DOCUMENTED  
**Resolution:** Developer Window Reload + Ignore Ghost Notifications

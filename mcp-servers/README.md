# MCP Debugging (VS Code Copilot)

Kurzleitfaden zum Debuggen der MCP-Server in diesem Workspace.

## 1) Konfiguration prüfen

- Projektweit: `mcp.json` (kanonische Repo-Konfiguration fuer lokale MCP-Server)
- VS Code: `.vscode/mcp.json` (Copilot-Overlay fuer editor-spezifische HTTP-/Gallery-Eintraege)

## 2) Health-Checks

- Gesamtreport: `npm run mcp:check` → schreibt `quality-reports/mcp-access.json`
- Schnellreport: `npm run mcp:health` → schreibt `quality-reports/mcp-health.json`

## 3) Häufige Probleme & Lösungen

- uvx nicht installiert (Python-Tool „uv“):
  - Lösung: `scripts/mcp/uvx-stdio.mjs` Wrapper verwendet; meldet klaren Fehler → installiere uv nach Doku.
- Lokaler Node-MCP fehlt oder startet nicht:
  - Entry-Datei unter `mcp-servers/<server>/index.js` pruefen
  - `mcp.json` auf korrekten `command`- und `args`-Pfad kontrollieren
- Externer HTTP-MCP im Schnellcheck als `skipped` markiert:
  - Das ist beabsichtigt, um unkontrollierte Netzaufrufe zu vermeiden
  - Fuer echte Laufzeitprobleme die VS Code MCP Logs und den jeweiligen Provider pruefen
- GitHub Copilot lädt MCP nicht:
  - VS Code Neustart: „Developer: Reload Window“
  - Copilot Features: <https://github.com/settings/copilot/features>
  - Workspace Settings: `.vscode/settings.json` checken

## 4) Logs

- Copilot Language Server Logs (lokal):
  - macOS/Linux: `~/.vscode/extensions/github.copilot-*/language-server.log`
  - Windows: `%USERPROFILE%\.vscode\extensions\github.copilot-*\language-server.log`

## 5) Support/Upgrade

- MCP Overlay-Versionen sind in `.vscode/mcp.json` fixiert; repo-lokale Serverdefinitionen liegen in `mcp.json`.
- Bei Problemen zuerst `npm run mcp:check` und `npm run mcp:health` ausfuehren, dann Doku oder Versionen anpassen.

## MCP-Servers – Model Context Protocol

Dieser Ordner enthaelt repo-lokale MCP-Server fuer Entwicklungs-, Governance- und QA-Workflows.

## Inhalte

- mcp.json: Zentrale Konfiguration der Server und Clients
- scripts/start-mcp-servers.ps1: Start-/Stop-Automation unter Windows/PowerShell
- .vscode/: VS Code Profile und Tasks für MCP-Integration

## Nutzung

1. Voraussetzungen

- Node.js 18+/20 LTS, Git, Docker (falls docker-basierte Server genutzt werden)

1. Health Check

```bash
npm run mcp:check
```

1. Setup (Profile, Konfiguration, Server)

```bash
npm run mcp:setup
```

1. Design Sync (Figma → Tokens)

```bash
npm run figma:sync
```

Hinweis: Figma Design Sync ist ein separates Tooling-Thema und derzeit kein aktiv verdrahteter MCP-Server in `mcp.json` oder `.vscode/mcp.json`.

## Richtlinien

- Sicherheit: Keine Secrets in mcp.json; nutzen Sie das secrets/-Verzeichnis und Vorlagen unter config-templates/
- Reproduzierbarkeit: Pin-Versionen der Server, prüfen Sie Änderungen per PR
- Barrierefreiheit: Tools sollen WCAG-Checks nicht beeinträchtigen und SARIF-Berichte unter quality-reports/ ablegen

## Fehlerbehebung

- Prüfen Sie die VS Code-Einstellungen: .vscode/ und mcp.json
- Siehe CODESPACE-TROUBLESHOOTING.md für Codespaces-spezifische Hinweise
- Falls ein Server fehlt, führen Sie „npm run mcp:setup“ erneut aus

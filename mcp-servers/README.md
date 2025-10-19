# MCP Debugging (VS Code Copilot)

Kurzleitfaden zum Debuggen der MCP-Server in diesem Workspace.

## 1) Konfiguration prüfen
- VS Code: `.vscode/mcp.json` (diese Datei wird von Copilot gelesen)
- Repository-Metakonfig: `mcp.json` (nur Referenz; nicht von Copilot geladen)

## 2) Health-Checks
- Gesamtreport: `npm run mcp:check` → schreibt `quality-reports/mcp-access.json`
- Figma-Server: `npm run figma:mcp:check`
- Figma-MCP-Server starten: `npm run figma:mcp:server`

## 3) Häufige Probleme & Lösungen
- uvx nicht installiert (Python-Tool „uv“):
  - Lösung: `scripts/mcp/uvx-stdio.mjs` Wrapper verwendet; meldet klaren Fehler → installiere uv nach Doku.
- HTTP MCP (Figma) nicht erreichbar:
  - Server starten (`npm run figma:mcp:server`) und Port 3845 freigeben
  - Token/Keys in `.env` setzen: `FIGMA_API_TOKEN`, `FIGMA_FILE_KEY`
- GitHub Copilot lädt MCP nicht:
  - VS Code Neustart: „Developer: Reload Window“
  - Copilot Features: https://github.com/settings/copilot/features
  - Workspace Settings: `.vscode/settings.json` checken

## 4) Logs
- Copilot Language Server Logs (lokal):
  - macOS/Linux: `~/.vscode/extensions/github.copilot-*/language-server.log`
  - Windows: `%USERPROFILE%\.vscode\extensions\github.copilot-*\language-server.log`

## 5) Support/Upgrade
- MCP Server-Versionen sind in `.vscode/mcp.json` fixiert.
- Bei Problemen bitte Versionen kurz anheben oder fixieren und erneut `npm run mcp:check` ausführen.# MCP-Servers – Model Context Protocol

Dieser Ordner enthält interne MCP-Server, die Entwicklungs- und QA-Workflows unterstützen (z. B. Codacy, Figma, Filesystem, Docker).

## Inhalte

- mcp.json: Zentrale Konfiguration der Server und Clients
- scripts/start-mcp-servers.ps1: Start-/Stop-Automation unter Windows/PowerShell
- .vscode/: VS Code Profile und Tasks für MCP-Integration

## Nutzung

1. Voraussetzungen

- Node.js 18+/20 LTS, Git, Docker (falls docker-basierte Server genutzt werden)

2. Health Check

```bash
npm run mcp:check
```

3. Setup (Profile, Konfiguration, Server)

```bash
npm run mcp:setup
```

4. Design Sync (Figma → Tokens)

```bash
npm run figma:sync
```

## Richtlinien

- Sicherheit: Keine Secrets in mcp.json; nutzen Sie das secrets/-Verzeichnis und Vorlagen unter config-templates/
- Reproduzierbarkeit: Pin-Versionen der Server, prüfen Sie Änderungen per PR
- Barrierefreiheit: Tools sollen WCAG-Checks nicht beeinträchtigen und SARIF-Berichte unter quality-reports/ ablegen

## Fehlerbehebung

- Prüfen Sie die VS Code-Einstellungen: .vscode/ und mcp.json
- Siehe CODESPACE-TROUBLESHOOTING.md für Codespaces-spezifische Hinweise
- Falls ein Server fehlt, führen Sie „npm run mcp:setup“ erneut aus

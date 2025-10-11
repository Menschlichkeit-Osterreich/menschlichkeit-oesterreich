# MCP-Servers – Model Context Protocol

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

# MCP Sync-Workflow

Dieser Leitfaden beschreibt den täglichen Umgang mit MCP-Servern.

## Tägliche Nutzung
- Serverstatus prüfen:
  ```powershell
  npm run mcp:check
  ```
- Figma-MCP-Health:
  ```powershell
  npm run mcp:figma:health
  ```
- Tools-Liste in VS Code aktualisieren: Befehl „MCP: Reset Cached Tools“ verwenden.

## Fehlerdiagnose
- Siehe `quality-reports/mcp-access.json`.
- Logs: VS Code Output (Copilot Chat), Terminalausgaben.

## Wiederherstellung
- Tokens erneuern (FIGMA_API_TOKEN, GITHUB_TOKEN, CLARITY_API_TOKEN)
- VS Code: „MCP: Reset Cached Tools“ ausführen und erneut versuchen.

## Beispiele
- Figma: Designs abfragen (TalkToFigma / Figma HTTP)
- GitHub: Issues/PRs verwalten (GitHub MCP)
- Azure DevOps: Projekte/Repos/Work Items (Azure DevOps MCP)
- Microsoft Docs: Suche/Fetch für Tech-Dokumentation

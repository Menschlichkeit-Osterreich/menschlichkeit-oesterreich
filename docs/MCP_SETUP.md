# MCP-Einrichtung (Copilot + MCP)

Dieser Leitfaden beschreibt die Einrichtung der MCP-Server in diesem Repository.

## Voraussetzungen
- Node.js 18+ und npm
- Python (für MarkItDown/Fabric-RTI via `uvx`)
- VS Code (Insiders empfohlen) mit Copilot Chat und MCP-Unterstützung
- Tokens (falls verwendet): `FIGMA_API_TOKEN`, `GITHUB_TOKEN`, `CLARITY_API_TOKEN`

## Konfiguration
- Die MCP-Server sind in `.vscode/mcp.json` definiert. Enthält u. a. Figma, GitHub, Filesystem, Memory, TalkToFigma, MarkItDown, Playwright, MicrosoftDocs, Azure DevOps, Fabric RTI, Clarity.
- Gesicherte Eingaben (`inputs`) fragen z. B. Figma-Token und Azure DevOps-Parameter interaktiv ab.

## Start & Validierung
1. Öffne das Repo in VS Code. Speichere `.vscode/mcp.json`.
2. Optional: Liste der Server in Copilot prüfen (MCP: List Servers).
3. Lokale HTTP-Erreichbarkeit prüfen:
   ```powershell
   npm run mcp:check
   npm run mcp:figma:health
   ```

## Healthchecks & Fehlertoleranz
- Figma MCP Health: `npm run mcp:figma:health` (2xx–4xx belegt Erreichbarkeit)
- Allgemeiner Report: `quality-reports/mcp-access.json`
- Verhalten:
  - Server nicht erreichbar → Hinweis im Chat und erneuter Versuch möglich
  - Timeout → Abbruch + sachliche Meldung
  - Ungültige Antwort → Hinweis + Schema-Abgleich in Logs
  - Token fehlt/abgelaufen → Nutzerhinweis (Kontakt zuständige Person)

## Hinweise
- Externe HTTP-Server werden im Zugangstest nicht aktiv angefragt (Compliance). Sie stehen im Chat normal zur Verfügung.
- STDIO-Server werden nicht automatisch gestartet, sondern bei Bedarf durch Copilot.

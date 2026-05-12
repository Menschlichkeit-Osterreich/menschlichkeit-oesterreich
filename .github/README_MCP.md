# MCP Server – Überblick & Hardening

Diese Repo nutzt nur stabile, lokal gebundene MCP-Server. Community-Server werden strikt versioniert und isoliert.

## Aktive Server im Default-Setup (Stand: 2026-05-11)

- file-server (Repo-Dateioperationen)
- quality-reporter (Qualitätsberichte und Aggregation)
- build-pipeline (Build- und Pipeline-Kontext)
- n8n-webhook (n8n-Webhook-Integration)
- bitwarden-cli (lokale Secret-Helfer)
- postgres (PostgreSQL-Kontext für DB-Operationen)

## Overlay

- github (Copilot MCP, HTTP) in `.vscode/mcp.json`

## Nicht mehr standardmäßig aktiv

- context7
- filesystem
- memory
- sequential-thinking
- playwright
- n8n-mcp

> Design-Tokens bleiben im Repo committed. Ein Live-Figma-MCP-Server ist fuer Build, CI und Deploy nicht mehr Teil der aktiven Basis.

Alle URLs sind auf 127.0.0.1 beschränkt. Keine externen Ports.

## Sicherheitsprinzipien

- Keine `latest`-Tags bei Containern (z. B. n8n = 1.72.1)
- Secrets ausschließlich per GitHub Actions Secrets oder lokale `.env` (nicht committed)
- DSGVO: Keine PII in Logs; PII-Sanitizer-Tests verpflichtend
- Netzwerk: Kein externer Zugriff auf MCP-Server; nur lokale Loopback-Interfaces

## Version-Locking

- Docker Images gepinnt
- Node- und Python-Dependencies mit Major-Versionen gepflegt
- MCP-Community-Server werden nur mit festen Versionen und Sandbox-Wrappern zugelassen

## Fallbacks

- repo-committed Design-Tokens unter `figma-design-system/00_design-tokens.json` statt Live-Designzugriff
- quality-reporter erzeugt Berichte offline unter `quality-reports/`

## Maintenance

- Regelmäßiger Security-Scan: `npm run security:scan`
- Qualitätstore: `npm run quality:gates`

Siehe auch: `.github/instructions/quality-gates.instructions.md` und Projektleitfaden in `.github/copilot-instructions.md`.

## Voraussetzungen & Umgebungsvariablen (lokal)

- Microsoft / Azure AI (optional fuer Repo- und Org-Optimierung):
  - APPLICATIONINSIGHTS_CONNECTION_STRING
  - AZURE_AI_FOUNDRY_PROJECT_ENDPOINT
  - AZURE_AI_FOUNDRY_MODEL_DEPLOYMENT
  - MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
- Microsoft Clarity (optional):
  - CLARITY_API_KEY, CLARITY_PROJECT_ID (nur wenn Clarity-MCP/Integrationen verwendet werden)
- MarkItDown/ffmpeg (optional, für Medienkonvertierung):
  - Windows: ffmpeg installieren und Pfad setzen, z. B. `MARKITDOWN_FFMPEG_PATH=C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe`
  - macOS/Linux: ffmpeg via Paketmanager installieren (z. B. `brew install ffmpeg`, `apt-get install ffmpeg`) und PATH verfügbar machen

Sicherheits-Hinweis: Keine Secrets ins Repo committen. Für CI/CD ausschließlich GitHub Secrets nutzen.

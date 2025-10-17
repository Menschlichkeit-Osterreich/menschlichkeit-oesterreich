# MCP Server – Überblick & Hardening

Diese Repo nutzt nur stabile, lokal gebundene MCP-Server. Community-Server werden strikt versioniert und isoliert.

## Aktive Server (Stand: 2025-10-16)
- filesystem (Wrapper-Script)
- git (CLI)
- docker (CLI)
- prisma (CLI, Schema `schema.prisma`)
- lighthouse (LHCI)
- trivy-security (FS-Scan)
- n8n-webhook (Node Client)
- build-pipeline (bash, Dry-Run)
- plesk-deploy (bash, Dry-Run)
- quality-reporter (Node)
- figma (Token-Sync Script)
- figma-mcp-server (HTTP → 127.0.0.1:3845/mcp, env: FIGMA_API_TOKEN, FIGMA_FILE_KEY)
- github-cli (Validator)
- memory, sequential-thinking, context7 (Wrapper)
- gitleaks (secrets scan)
- pii-sanitizer-test (pytest)
- design-tokens-validate (Node)

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
- figma-mcp-server via WebSocket-Bridge (`dist/socket.js`); bei Ausfall → Token-Sync per Script (`scripts/figma-token-sync.cjs`)
- quality-reporter erzeugt Berichte offline unter `quality-reports/`

## Maintenance
- Regelmäßiger Security-Scan: `npm run security:scan`
- Qualitätstore: `npm run quality:gates`

Siehe auch: `.github/instructions/quality-gates.instructions.md` und Projektleitfaden in `.github/copilot-instructions.md`.

## Voraussetzungen & Umgebungsvariablen (lokal)

- Figma: FIGMA_API_TOKEN, FIGMA_FILE_KEY (lokal in `.env`, in CI als Secret)
- Microsoft Clarity (optional):
	- CLARITY_API_KEY, CLARITY_PROJECT_ID (nur wenn Clarity-MCP/Integrationen verwendet werden)
- MarkItDown/ffmpeg (optional, für Medienkonvertierung):
	- Windows: ffmpeg installieren und Pfad setzen, z. B. `MARKITDOWN_FFMPEG_PATH=C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe`
	- macOS/Linux: ffmpeg via Paketmanager installieren (z. B. `brew install ffmpeg`, `apt-get install ffmpeg`) und PATH verfügbar machen

Sicherheits-Hinweis: Keine Secrets ins Repo committen. Für CI/CD ausschließlich GitHub Secrets nutzen.

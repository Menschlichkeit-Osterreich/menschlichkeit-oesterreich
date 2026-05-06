# MCP Servers Übersicht

Stand: 2026-03-31

Diese Datei dokumentiert den aktiven Inhalt aus `mcp.json`. Sie ist keine Wunschliste und keine historische Sammlung alter Wrapper mehr.

## Aktive Server aus `mcp.json`

| Server                | Start                                                     | Typ    | Zweck                                              |
| --------------------- | --------------------------------------------------------- | ------ | -------------------------------------------------- |
| `file-server`         | `node mcp-servers/file-server/index.js`                   | lokal  | Repo-Dateioperationen                              |
| `quality-reporter`    | `node mcp-servers/quality-reporter/index.js`              | lokal  | Qualitätsberichte und Aggregation                  |
| `build-pipeline`      | `node mcp-servers/build-pipeline/index.js`                | lokal  | Build- und Pipeline-Kontext                        |
| `n8n-webhook`         | `node mcp-servers/n8n-webhook/index.js`                   | lokal  | n8n-Webhook-Integration                            |
| `bitwarden-cli`       | `node mcp-servers/bitwarden-cli/index.js`                 | lokal  | Secrets- und Vault-Workflows                       |
| `context7`            | `npx -y @upstash/context7-mcp@latest`                     | extern | Dokumentations- und Kontextsuche                   |
| `filesystem`          | `npx -y @modelcontextprotocol/server-filesystem .`        | extern | Dateisystem-Zugriff                                |
| `memory`              | `npx -y @modelcontextprotocol/server-memory`              | extern | Sessionspeicher                                    |
| `sequential-thinking` | `npx -y @modelcontextprotocol/server-sequential-thinking` | extern | Kanonische Analyse-Engine fuer mehrstufige Planung |
| `playwright`          | `npx -y @playwright/mcp@latest`                           | extern | Browser-Automatisierung                            |

## Analyse- und Planungsregel

- `sequential-thinking` ist der bevorzugte MCP-Server fuer Analyse und Priorisierung.
- Die kanonische Governance dazu steht in `.github/instructions/core/analysis-planning.instructions.md`.
- `scripts/mcp/wrapper-sequential-thinking.sh` bleibt nur Fallback fuer Umgebungen ohne MCP und ist nicht der primaere Produktionspfad.

## Minimale Validierung

```bash
npm run mcp:check
npm run mcp:health
```

## Drift-Regel

Wenn `mcp.json` geaendert wird, muessen mindestens diese Artefakte mitgeprueft werden:

- `docs/MCP-SERVERS-OVERVIEW.md`
- `.github/instructions/core/analysis-planning.instructions.md`
- `.github/ai-registry.json`

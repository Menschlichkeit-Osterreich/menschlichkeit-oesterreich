# MCP Servers Übersicht

Stand: 2026-03-31

Diese Datei dokumentiert den aktiven Inhalt aus `mcp.json`. Sie ist keine Wunschliste und keine historische Sammlung alter Wrapper mehr.

## Aktive Server aus `mcp.json`

| Server                | Start                                                                                         | Typ   | Zweck                                             |
| --------------------- | --------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------- |
| `file-server`         | `node mcp-servers/file-server/index.js`                                                       | lokal | Repo-Dateioperationen                             |
| `quality-reporter`    | `node mcp-servers/quality-reporter/index.js`                                                  | lokal | Qualitätsberichte und Aggregation                 |
| `build-pipeline`      | `node mcp-servers/build-pipeline/index.js`                                                    | lokal | Build- und Pipeline-Kontext                       |
| `n8n-webhook`         | `node mcp-servers/n8n-webhook/index.js`                                                       | lokal | n8n-Webhook-Integration                           |
| `bitwarden-cli`       | `node mcp-servers/bitwarden-cli/index.js`                                                     | lokal | Secrets- und Vault-Workflows                      |
| `postgres`            | `node scripts/mcp/wrapper-postgres.mjs`                                                       | lokal | PostgreSQL-Kontext fuer Datenbankoperationen      |
| `sequential-thinking` | `node scripts/mcp/uvx-stdio.mjs @modelcontextprotocol/server-sequential-thinking==2025.12.18` | lokal | Sequenzielle Analyse, Zerlegung und Priorisierung |

## Overlay aus `.vscode/mcp.json`

| Server   | Start                                | Typ  | Zweck                     |
| -------- | ------------------------------------ | ---- | ------------------------- |
| `github` | `https://api.githubcopilot.com/mcp/` | HTTP | Issues, PRs und Metadaten |

## Analyse- und Planungsregel

- `sequential-thinking` ist der bevorzugte MCP-Server fuer Analyse und Priorisierung und wird ueber `node scripts/mcp/uvx-stdio.mjs @modelcontextprotocol/server-sequential-thinking==2025.12.18` gestartet.
- Die kanonische Governance dazu steht in `.github/instructions/core/analysis-planning.instructions.md`.
- `scripts/mcp/wrapper-sequential-thinking.sh` bleibt nur Fallback fuer Umgebungen ohne MCP und ist nicht der primaere Produktionspfad.

Hinweis: `memory`, `filesystem`, `context7` und `playwright` sind im aktuellen Default-Setup nicht mehr aktiv geladen; nutze sie nur in spezialisierten, zeitweise aktivierten Workflows, wenn sie wirklich gebraucht werden.

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

## Troubleshooting: ECONNREFUSED 127.0.0.1:1455

- In den aktiven Repo-Konfigurationen (`mcp.json`, `.vscode/mcp.json`, `.devcontainer/*`, `.vscode/*`) ist kein MCP- oder Service-Eintrag mit Port `1455` definiert.
- Ein Fehler auf `127.0.0.1:1455` stammt daher sehr wahrscheinlich von einem lokalen Bridge-/Proxy-Prozess in der Editor- oder Extension-Laufzeit und nicht aus der hier versionierten MCP-Konfiguration.
- Diagnose-Schritte im Codespace:
  - VS Code Output oeffnen und die Kanaele fuer GitHub Copilot bzw. MCP pruefen.
  - `npm run mcp:check` und `npm run mcp:health` ausfuehren.
  - Falls der Fehler bleibt: VS Code Fenster neu laden und betroffene Erweiterung neu starten.

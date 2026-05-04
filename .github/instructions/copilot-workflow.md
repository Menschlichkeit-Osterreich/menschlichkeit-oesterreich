# GitHub Copilot Workflow

Version: 3.0
Status: Active

## Ziel

Copilot soll im Repo aktiv dieselbe Governance nutzen wie Codex und Claude Code, statt eigene Parallelregeln aufzubauen.

## Verbindliche Reihenfolge

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.github/instructions/core/analysis-planning.instructions.md`
5. `.github/ai-registry.json`
6. `.github/instructions/core/*.instructions.md`

## Arbeitsmodell

- Copilot arbeitet repo-first und liest zuerst die aktive Monorepo-Struktur.
- Rollen werden ueber `AGENTS.md` gewaehlt.
- Analyse und Planung laufen immer ueber `.github/instructions/core/analysis-planning.instructions.md`.
- Sichtbare Copilot-Agents sind exakt:
  - `.github/agents/task-planner.agent.md`
  - `.github/agents/developer.agent.md`
  - `.github/agents/devops-expert.agent.md`
  - `.github/agents/security-reviewer.agent.md`
  - `.github/agents/qa-reviewer.agent.md`
- Archivierte Copilot-Agents liegen unter `.github/archive/agents/` und muessen ein Replacement in `.github/ai-registry.json` haben.
- Aktive Arbeitsmodi kommen aus `.github/chatmodes/**/*.chatmode.md`.
- Chatmodes sind ergaenzende Arbeitsmodi, aber keine zusaetzliche sichtbare Copilot-Agentenquelle.
- Der bevorzugte Analyse-Chatmode ist `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`.
- `.github/prompts/*.prompt.md` sind Zusatzwerkzeuge fuer konkrete Aufgaben.

## Operative Regeln

- Keine alten Repo-Namen oder alten Pfade in neue Vorschlaege uebernehmen.
- Kein `develop`-basierter Workflow in neuen Vorschlaegen.
- Keine Guidance erstellen, die historische Root-Pfade oder alte Einzelordner als aktive Ziele behandelt.
- Bei VS Code-, MCP- oder CI-Themen immer die aktuellen Repo-Dateien als Wahrheit nehmen.
- Bei Dateitools absolute Workspace-Pfade bevorzugen, wenn die jeweilige Toolchain relative Pfade nicht akzeptiert.

## Bei Aenderungen an Governance

Wenn Copilot Vorschlaege fuer Rollen, Prompts, Chatmodes, VS Code oder Repo-Workflows macht, muessen diese Dateien zusammen gedacht werden:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/ai-registry.json`
- `.github/agents/*.agent.md`
- `.github/chatmodes/**/*.chatmode.md`
- `.github/prompts/README.md`

## Definition of Done fuer Copilot-nahe Aenderungen

- aktive Referenzen zeigen nur auf existierende Dateien
- alte Repo-Namen und tote Pfade sind entfernt
- der Analyse-Einstieg ist eindeutig und verweist auf `analysis-planning.instructions.md`
- `.github/agents/` enthaelt genau fuenf sichtbare Copilot-Agents
- `mentor.agent.md`, `mcp-operations.agent.md` und alte Spezialagenten liegen nicht sichtbar aktiv unter `.github/agents/`
- keine aktive Copilot-Anweisung erzwingt `.copilot-tracking`-Pflichtpfade
- Chatmodes sind die ergaenzende Mode-Ebene
- Prompt-Artefakte sind als supplementaer eingeordnet
- `mcp.json` enthaelt keine `@latest`-Pakete und keine unversionierten externen `npx`-MCP-Pakete
- `.vscode/mcp.json` bleibt ein GitHub-only Overlay
- `npm run workspace:config:check` bleibt gruen
- `npm run governance:check` bleibt gruen

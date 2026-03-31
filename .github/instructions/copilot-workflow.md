# GitHub Copilot Workflow

Version: 2.0  
Status: Active

## Ziel

Copilot soll im Repo aktiv dieselbe Governance nutzen wie Codex und Claude Code, statt eigene Parallelregeln aufzubauen.

## Verbindliche Reihenfolge

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.github/instructions/core/*.instructions.md`

## Arbeitsmodell

- Copilot arbeitet repo-first und liest zuerst die aktive Monorepo-Struktur.
- Rollen werden ueber `AGENTS.md` gewaehlt.
- Aktive Arbeitsmodi kommen aus `.github/chatmodes/**/*.chatmode.md`.
- `.github/prompts/*.prompt.md` sind Zusatzwerkzeuge fuer konkrete Aufgaben.
- `.github/prompts/chatmodes/*.yaml` sind Legacy und nicht mehr fuehrend.

## Operative Regeln

- Keine alten Repo-Namen oder alten Pfade in neue Vorschlaege uebernehmen.
- Kein `develop`-basierter Workflow in neuen Vorschlaegen.
- Keine Guidance erstellen, die historische Root-Pfade oder alte Einzelordner als aktive Ziele behandelt.
- Bei VS Code-, MCP- oder CI-Themen immer die aktuellen Repo-Dateien als Wahrheit nehmen.

## Bei Aenderungen an Governance

Wenn Copilot Vorschlaege fuer Rollen, Prompts, Chatmodes, VS Code oder Repo-Workflows macht, muessen diese Dateien zusammen gedacht werden:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/agents/*.agent.md`
- `.github/chatmodes/**/*.chatmode.md`
- `.github/prompts/README.md`

## Definition of Done fuer Copilot-nahe Aenderungen

- aktive Referenzen zeigen nur auf existierende Dateien
- alte Repo-Namen und tote Pfade sind entfernt
- Chatmodes sind die aktive Mode-Ebene
- Prompt-Artefakte sind als supplementaer eingeordnet
- `npm run governance:check` bleibt gruen

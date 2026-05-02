# CLAUDE.md

Dieses Repository wird von Codex und Claude Code gemeinsam mit derselben Betriebslogik genutzt. Fuer Rollenrouting und aktive Agenten gilt [AGENTS.md](AGENTS.md).

## Repo Identity

- Workspace-Root: Repository-Checkout von `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Beispiel Windows-Checkout: `E:\Dev\menschlichkeit-oesterreich\menschlichkeit-oesterreich`
- Git-Remote: `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Aktive Entwicklungsstruktur: `apps/<service>/`

Historische Root-Snapshots duerfen im Repository noch vorkommen, sind aber keine aktiven Arbeitsziele.

## Prioritaeten

1. Sicherheit
1. Datenintegritaet
1. Stabilitaet
1. Velocity

Alle UI-Texte bleiben in oesterreichischem Deutsch.

## Aktive Services

| Service | Pfad                 | Port | Hinweis                 |
| ------- | -------------------- | ---: | ----------------------- |
| Website | `apps/website/`      | 5173 | React 19 + Vite         |
| API     | `apps/api/`          | 8001 | FastAPI, `app.main:app` |
| CRM     | `apps/crm/`          | 8000 | Drupal 10 + CiviCRM     |
| Games   | `apps/babylon-game/` | 3001 | Next.js + Babylon.js    |
| Forum   | `apps/forum/`        | 8002 | phpBB                   |
| n8n     | `automation/n8n/`    | 5678 | Automatisierung         |

## Standardbefehle

```bash
npm run setup:dev
npm run dev:frontend
npm run dev:api
npm run dev:crm
npm run dev:games
npm run dev:forum
npm run dev:all
npm run test:unit
npm run test:api
npm run quality:gates
npm run governance:check
```

## Agentenauswahl im Repo

1. Lies zuerst `AGENTS.md`.
1. Lies fuer Analyse und Planung danach `.github/instructions/core/analysis-planning.instructions.md`.
1. Nutze `.github/ai-registry.json`, wenn du den Status von Agents, Skills, Prompts, Plugins oder Legacy-Artefakten klaeren musst.
1. Pruefe bei groesseren Plaenen den offenen Backlog mit `state:open repo:${owner}/${repository} sort:updated-desc`.
1. Waehle dann die passende Rolle: `architect`, `developer`, `devops`, `security` oder `qa`.
1. Ziehe nur die zugehoerigen Chatmodes, Prompt-Dateien und Agenten hinzu.
1. Vermische Repo-Contributor-Agents nie mit produktiven Laufzeitrollen ausserhalb der Repo-Governance.

Kurzregel:

- Architektur oder Systemgrenzen -> `architect`
- Feature, Bugfix, Refactoring -> `developer`
- CI/CD, Deploy, VS Code, MCP, Betrieb -> `devops`
- DSGVO, Secrets, Security, GitHub-Haertung -> `security`
- Reviews, Tests, Accessibility, Performance -> `qa`

## Arbeitsregeln

- Vor Aenderungen immer den realen Code lesen.
- Aktive Codepfade leben unter `apps/`, nicht unter historischen Root-Ordnern.
- Neue API-Endpunkte muessen in `apps/api/openapi.yaml` reflektiert werden.
- Design-Tokens stammen aus `figma-design-system/00_design-tokens.json` sowie den abgeleiteten CSS-Tokens.
- Brand-Arbeit nutzt die Quellen aus `.claude/plugins/moe-brand/`.
- Bei dateibasierten Copilot- oder MCP-Toolaufrufen absolute Workspace-Pfade verwenden, wenn das Tool keine relativen Pfade akzeptiert.
- Geteilte Repo-Konfigurationen bleiben portabel und nutzen `${workspaceFolder}`, repo-relative Pfade oder npm Scripts.
- Aenderungen an Dot-Folder-, MCP-, Agenten- oder Workflow-Konfigurationen muessen `npm run workspace:config:check` bestehen.
- Keine Secrets in Code, Logs oder Beispielen.
- Keine PII in Logs; DSGVO-Regeln aus den Core-Instructions sind bindend.

## Prompt- und Policy-Stack

- Kanonische Agenten-Governance: `AGENTS.md`
- Kanonischer Analyse-Einstieg: `.github/instructions/core/analysis-planning.instructions.md`
- Machine-readable Registry: `.github/ai-registry.json`
- Copilot-Adapter: `.github/copilot-instructions.md`
- Gemeinsame Policies: `.github/instructions/core/*.instructions.md`
- Aktive Chatmodes: `.github/chatmodes/**/*.chatmode.md`
- Aktiver Analyse-Chatmode: `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`
- Kanonische Skill-Schicht: `.github/skills/*/SKILL.md`
- Ergaenzende Prompts: `.github/prompts/*.prompt.md`
- Legacy-YAML-Chatmodes: `.github/prompts/chatmodes/*.yaml` nur als Archiv

## Branch- und Review-Modell

- Main-first Workflow
- Branches von `main`
- PRs zurueck auf `main`
- Keine aktive `develop`-Integrationslinie

## Repo-Agenten

Repo-Arbeitsagenten sind in `AGENTS.md` dokumentiert und werden ueber Codex, Claude Code und Copilot ausgefuehrt.

Sichtbare Copilot-Repo-Agenten:

- `.github/agents/task-planner.agent.md`
- `.github/agents/developer.agent.md`
- `.github/agents/devops-expert.agent.md`
- `.github/agents/security-reviewer.agent.md`
- `.github/agents/qa-reviewer.agent.md`

Archivierte oder deprecated Copilot-Agents liegen unter `.github/archive/agents/` und werden ueber `.github/ai-registry.json` einem sichtbaren Replacement zugeordnet.

## MCP

- Projektweite MCP-Server liegen in `mcp.json`
- Editor-spezifische MCP-Ergaenzungen liegen in `.vscode/mcp.json`
- Spezialisierte MCP-Reparaturen sind Teil von `.github/agents/devops-expert.agent.md`
- Lokale Checks: `npm run mcp:check` und `npm run mcp:health`

## Brand-Kurzvertrag

- Primarfarben: `#D4611E`, `#B54A0F`, `#1B4965`
- Headline-Font: `Nunito Sans`
- Body-Font: `Source Sans 3`
- Keine harten Alt-Farben oder alte Rotwerte wieder einfuehren

## Wenn du Drift findest

- korrigiere aktive Dateien zuerst
- markiere historische Artefakte explizit als Legacy
- synchronisiere Klassifikationen in `.github/ai-registry.json`
- fuehre keine neue Parallel-Governance ein

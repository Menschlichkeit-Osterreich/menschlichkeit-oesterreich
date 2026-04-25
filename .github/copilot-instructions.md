# Menschlichkeit Oesterreich - Copilot Leitfaden

GitHub Copilot arbeitet in diesem Repository nicht frei schwebend, sondern entlang desselben Repo-Vertrags wie Codex und Claude Code.

## Zuerst lesen

1. `AGENTS.md` fuer Rollen, Routing und aktive Artefakte
2. `CLAUDE.md` fuer Repo-Betrieb, Services und Guardrails
3. `.github/instructions/core/analysis-planning.instructions.md` fuer Analyse und Planung
4. `.github/ai-registry.json` fuer die Artefakt-Klassifikation
5. `.github/instructions/core/*.instructions.md` fuer gemeinsame Policies

## Repo-Identitaet

- Repository: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Workspace-Root: Repository-Checkout von `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Beispiel Windows-Checkout: `E:\Dev\menschlichkeit-oesterreich\menschlichkeit-oesterreich`
- Main-first Workflow
- Aktive Services unter `apps/website`, `apps/api`, `apps/crm`, `apps/babylon-game`, `apps/forum`

Historische Root-Pfade und alte Einzelordner sind keine aktiven Entwicklungsziele.

## Agentenauswahl

Nutze das Rollenmodell aus `AGENTS.md`:

- `architect` fuer Architektur, Service-Schnittstellen, ADR-nahe Arbeit
- `developer` fuer Features, Bugs, Refactorings und Tests
- `devops` fuer Workflows, Deployments, MCP, VS Code und Betriebsfragen
- `security` fuer DSGVO, Secrets, GitHub-Sicherheit und Haertung
- `qa` fuer Reviews, Accessibility, Performance und Quality-Gates

Copilot-spezifische Einstiegspunkte:

- `.github/agents/task-planner.agent.md`
- `.github/agents/devops-expert.agent.md`
- `.github/agents/mentor.agent.md`

Kanonischer Analyse-Einstieg:

- `.github/instructions/core/analysis-planning.instructions.md`
- `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`
- `.github/ai-registry.json`
- GitHub-Backlog-Abfrage: `state:open repo:${owner}/${repository} sort:updated-desc`

Aktive Chatmodes:

- `.github/chatmodes/**/*.chatmode.md`

Ergaenzende Prompt-Artefakte:

- `.github/prompts/*.prompt.md`

Kanonische Skill-Schicht:

- `.github/skills/*/SKILL.md`

Nicht aktiv:

- `.github/prompts/chatmodes/*.yaml` sind Legacy und nicht die fuehrende Wahrheit.

## Arbeitsregeln

- Repository first: vor Vorschlaegen immer den realen Repo-Stand lesen.
- Keine neuen Parallelstrukturen erfinden, wenn `AGENTS.md`, `CLAUDE.md` oder Core-Instructions schon den Vertrag definieren.
- Bei Tool-Aufrufen mit Dateipfaden absolute Workspace-Pfade verwenden, sobald das Tool keine relativen Pfade akzeptiert.
- Geteilte Konfigurationen muessen portabel bleiben und `${workspaceFolder}`, repo-relative Pfade oder npm Scripts verwenden.
- Nutzertexte bleiben in oesterreichischem Deutsch.
- Keine Secrets oder PII in Code, Logs, Beispielen oder Prompts.
- Brand-Arbeit folgt den Token- und Plugin-Quellen im Repo.

## Configuration Reliability Rule

Alle Aenderungen an `.vscode/**`, `.devcontainer/**`, `.claude/**`, `mcp.json`, `.github/workflows/**` sowie Agent- und Copilot-Governance-Dateien muessen `npm run workspace:config:check` bestehen.
Lokale absolute Pfade sind in geteilten Konfigurationen nicht erlaubt.

## Implementierungsstandards

- Frontend: React 19 + TypeScript + Vite
- API: FastAPI + Python 3.12+
- CRM: Drupal 10 + CiviCRM
- Games: Next.js 16 + Babylon.js 8 auf Port 3001
- Forum: phpBB auf Port 8002

## Build und Validierung

- `npm run dev:frontend`
- `npm run dev:api`
- `npm run test:unit`
- `npm run test:api`
- `npm run quality:gates`
- `npm run governance:check`
- `npm run workspace:config:check`

## Dokumentationsregel

Wenn eine Aenderung aktive Ablaeufe, Rollen, Pfade oder Tooling betrifft, muessen mindestens die betroffenen Governance-Dateien mitgezogen werden:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/ai-registry.json`
- `.github/instructions/copilot-workflow.md`
- `.github/chatmodes/README.md`
- `.github/prompts/README.md`

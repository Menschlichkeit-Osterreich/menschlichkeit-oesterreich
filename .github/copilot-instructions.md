# Menschlichkeit Oesterreich - Copilot Leitfaden

GitHub Copilot arbeitet in diesem Repository nicht frei schwebend, sondern entlang desselben Repo-Vertrags wie Codex und Claude Code.

## Zuerst lesen

1. `AGENTS.md` fuer Rollen, Routing und aktive Artefakte
2. `CLAUDE.md` fuer Repo-Betrieb, Services und Guardrails
3. `.github/instructions/core/*.instructions.md` fuer gemeinsame Policies

## Repo-Identitaet

- Repository: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Aktiver Root: `E:\Menschlichkeit-Osterreich\menschlichkeit-oesterreich`
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

Aktive Chatmodes:

- `.github/chatmodes/**/*.chatmode.md`

Ergaenzende Prompt-Artefakte:

- `.github/prompts/*.prompt.md`

Nicht aktiv:

- `.github/prompts/chatmodes/*.yaml` sind Legacy und nicht die fuehrende Wahrheit.

## Arbeitsregeln

- Repository first: vor Vorschlaegen immer den realen Repo-Stand lesen.
- Keine neuen Parallelstrukturen erfinden, wenn `AGENTS.md`, `CLAUDE.md` oder Core-Instructions schon den Vertrag definieren.
- Nutzertexte bleiben in oesterreichischem Deutsch.
- Keine Secrets oder PII in Code, Logs, Beispielen oder Prompts.
- Brand-Arbeit folgt den Token- und Plugin-Quellen im Repo.

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

## Dokumentationsregel

Wenn eine Aenderung aktive Ablaeufe, Rollen, Pfade oder Tooling betrifft, muessen mindestens die betroffenen Governance-Dateien mitgezogen werden:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/instructions/copilot-workflow.md`
- `.github/chatmodes/README.md`
- `.github/prompts/README.md`

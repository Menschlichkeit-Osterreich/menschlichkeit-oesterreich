# AGENTS.md

Dieser Vertrag ist die kanonische Agenten-Governance fuer `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

Unterstuetzte Clients:

- Codex
- Claude Code
- GitHub Copilot

## Repo-Identitaet

- Workspace-Root: Repository-Checkout von `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Beispiel Windows-Checkout: `E:\Dev\menschlichkeit-oesterreich\menschlichkeit-oesterreich`
- Git-Remote: `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Aktive Produktstruktur: `apps/<service>/`, `automation/`, `figma-design-system/`
- Main-first Workflow mit Branches von `main` und PRs zurueck auf `main`

Hinweis zur Dateibenennung:

- `AGENTS.md` ist die kanonische Datei.
- Historische Verweise auf `agents.md` sollen auf `AGENTS.md` umgebogen werden.
- Auf Windows-Checkouts kann kein zweites physisches Redirect-File mit reinem Case-Unterschied neben `AGENTS.md` existieren; deshalb gilt `AGENTS.md` zugleich als Kompatibilitaetsanker fuer alte `agents.md`-Aufrufe.

## Was diese Datei steuert

Diese Datei beschreibt Repo-Contributor-Agents fuer Entwicklung, Review, Betrieb und Governance.

## Zuerst lesen

1. `AGENTS.md`
1. `CLAUDE.md`
1. `.github/copilot-instructions.md`
1. `.github/instructions/core/analysis-planning.instructions.md`
1. `.github/ai-registry.json`
1. passende Policies unter `.github/instructions/core/*.instructions.md`

## Kanonischer Analyse-Einstieg

Analyse und Planung laufen in diesem Repository immer ueber genau eine fuehrende Quelle:

- Core-Instruction: `.github/instructions/core/analysis-planning.instructions.md`
- aktiver Chatmode: `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`
- Copilot-Adapter: `.github/agents/task-planner.agent.md`
- Claude-Adapter: `.claude/prompts/PROMPT_ANALYSE.md`
- machine-readable Registry: `.github/ai-registry.json`
- Issue-Kontext: GitHub-Abfrage `state:open repo:${owner}/${repository} sort:updated-desc`

Wenn mehrere Clients beteiligt sind, bleibt diese Kette die einzige fuehrende Wahrheit.

## Aktive Artefakte

- Machine-readable Registry: `.github/ai-registry.json`
- Copilot-Agents: elf kuratierte Core-/Service-Agents plus Speckit Head Master und aktive Spec-Kit-Workflow-Agents unter `.github/agents/`
  - `.github/agents/task-planner.agent.md`
  - `.github/agents/developer.agent.md`
  - `.github/agents/devops-expert.agent.md`
  - `.github/agents/security-reviewer.agent.md`
  - `.github/agents/qa-reviewer.agent.md`
  - `.github/agents/website-frontend.agent.md`
  - `.github/agents/api-fastapi.agent.md`
  - `.github/agents/crm-drupal-civicrm.agent.md`
  - `.github/agents/automation-n8n.agent.md`
  - `.github/agents/games-babylon.agent.md`
  - `.github/agents/forum-phpbb.agent.md`
  - `.github/agents/speckit-head-master.agent.md`
  - `.github/agents/speckit.analyze.agent.md`
  - `.github/agents/speckit.checklist.agent.md`
  - `.github/agents/speckit.clarify.agent.md`
  - `.github/agents/speckit.constitution.agent.md`
  - `.github/agents/speckit.git.commit.agent.md`
  - `.github/agents/speckit.git.feature.agent.md`
  - `.github/agents/speckit.git.initialize.agent.md`
  - `.github/agents/speckit.git.remote.agent.md`
  - `.github/agents/speckit.git.validate.agent.md`
  - `.github/agents/speckit.implement.agent.md`
  - `.github/agents/speckit.plan.agent.md`
  - `.github/agents/speckit.specify.agent.md`
  - `.github/agents/speckit.tasks.agent.md`
  - `.github/agents/speckit.taskstoissues.agent.md`
- Archivierte Copilot-Agents: `.github/archive/agents/*.agent.md`
- Claude-Agents (RuFlo V3): 102 Agenten in `.claude/agents/` ueber 27 Kategorien:
  - Core: `.claude/agents/core/` (Coder, Planner, Researcher, Reviewer, Tester)
  - SPARC: `.claude/agents/sparc/` (Specification, Pseudocode, Architecture, Refinement)
  - Swarm: `.claude/agents/swarm/` (Adaptive, Hierarchical, Mesh Coordinators)
  - GitHub: `.claude/agents/github/` (PR-Manager, Issue-Tracker, Release-Manager)
  - V3-Security: `.claude/agents/v3/` (Security-Architect, PII-Detector, ADR-Architect)
  - Testing: `.claude/agents/testing/` (TDD-London-Swarm, Production-Validator)
  - Optimization: `.claude/agents/optimization/` (Performance, Load-Balancer, Topology)
  - Development: `.claude/agents/development/` (Full-Stack, Backend, Frontend, API)
  - DevOps: `.claude/agents/devops/` (CI/CD, Docker, Kubernetes, Monitoring)
  - Documentation: `.claude/agents/documentation/` (API-Docs, Architecture-Docs)
  - Weitere: `analysis/`, `architecture/`, `browser/`, `consensus/`, `custom/`, `data/`, `flow-nexus/`, `goal/`, `payments/`, `sona/`, `specialized/`, `sublinear/`, `templates/`
- Claude-Plugin-Agents: `.claude/plugins/*/agents/*.md`
- RuFlo-Befehle: `.claude/commands/` (sparc, github, automation, monitoring, optimization)
- RuFlo-Runtime: `.claude-flow/config.yaml`, `.mcp.json` (ruflo@3.7.0-alpha.38)
- Aktive Chatmodes: `.github/chatmodes/**/*.chatmode.md`
- Kanonische Skill-Schicht: `.github/skills/*/SKILL.md`
- Ergaenzende Task-Prompts: `.github/prompts/*.prompt.md`

Die aktive Mode-Ebene ist `.github/chatmodes`. Es gibt kein aktives YAML-Chatmode-Archiv mehr unter `.github/prompts/chatmodes`.

## Core-Rollen

### `architect`

Trigger:

- Architekturentscheidungen
- Schnittstellen, Grenzen, ADR-nahe Arbeit
- Monorepo- oder Integrationsdesign

Primaere Quellen:

- `.github/instructions/core/analysis-planning.instructions.md`
- `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`
- `CLAUDE.md`
- `.github/chatmodes/general/Architekturplan_DE.chatmode.md`
- relevante Core-Instructions

Erwarteter Output:

- Scope
- betroffene Systeme und Dateien
- technische Entscheidungen
- Risiken, Annahmen, Validierung

### `developer`

Trigger:

- Features
- Bugfixes
- Refactorings
- API- oder UI-Implementierung

Primaere Quellen:

- `.github/skills/*/SKILL.md`
- `.github/agents/developer.agent.md`
- `.github/chatmodes/development/*.chatmode.md`
- aktive `.github/prompts/*.prompt.md` laut `.github/ai-registry.json`
- betroffene App unter `apps/`

Service-Agent-Delegation:

- `website-frontend` fuer `apps/website/`
- `api-fastapi` fuer `apps/api/`
- `crm-drupal-civicrm` fuer `apps/crm/`
- `games-babylon` fuer `apps/babylon-game/`
- `forum-phpbb` fuer `apps/forum/`
- `automation-n8n` fuer `automation/n8n/`

Speckit-Delegation bei spezifikationsgetriebener Arbeit:

- `speckit-head-master` als Einstieg in den Spec-Kit-Workflow
- `speckit.analyze`, `speckit.specify`, `speckit.plan`, `speckit.tasks`, `speckit.implement`
- `speckit.taskstoissues` fuer GitHub-Issue-Erstellung aus Tasks
- `speckit.git.feature`, `speckit.git.commit` fuer Branch- und Commit-Verwaltung

RuFlo-Delegation in Claude-Code-Sessions:

- `.claude/agents/core/coder.md` fuer parallele Implementierung
- `.claude/agents/core/reviewer.md` fuer Code-Review
- `.claude/agents/core/tester.md` fuer Testgenerierung
- `.claude/agents/sparc/` fuer SPARC-Workflow-Ausfuehrung
- `.claude/agents/github/pr-manager.md` fuer PR-Erstellung

Erwarteter Output:

- umgesetzte Aenderung
- betroffene Dateien
- Tests oder begruendete Testluecken

### `devops`

Trigger:

- CI/CD
- Deployments
- VS Code
- MCP
- Infrastruktur, Skripte, Release-Haertung

Primaere Quellen:

- `.github/instructions/core/analysis-planning.instructions.md`
- `.github/agents/task-planner.agent.md`
- `.github/agents/devops-expert.agent.md`
- `.claude/plugins/moe-ops/agents/ops-engineer.md`
- `.github/chatmodes/general/MCPDeploymentOps_DE.chatmode.md`

RuFlo-Quellen in Claude-Code-Sessions:

- `.claude/agents/devops/` (CI/CD, Docker, Kubernetes, Monitoring)
- `.claude/agents/v3/v3-integration-architect.md`
- `.claude/commands/sparc/devops.md`

Erwarteter Output:

- konkrete Aenderung an Workflow oder Tooling
- Healthchecks und Verifikation
- benoetigte Nacharbeiten

### `security`

Trigger:

- DSGVO
- Secrets
- Auth
- Logging
- GitHub-Sicherheit
- Incident oder Hardening

Primaere Quellen:

- `.github/agents/security-reviewer.agent.md`
- `.github/chatmodes/general/SicherheitsAudit_DE.chatmode.md`
- `.github/instructions/core/dsgvo-compliance.instructions.md`
- `.claude/agents/security-reviewer.md`

RuFlo-Quellen in Claude-Code-Sessions:

- `.claude/agents/v3/security-architect.md`
- `.claude/agents/v3/pii-detector.md`
- `.claude/agents/v3/injection-analyst.md`
- `.claude/agents/v3/aidefence-guardian.md`
- `.claude/commands/sparc/security-review.md`

Erwarteter Output:

- Findings nach Risiko
- konkrete Gegenmassnahmen
- Tests oder Kontrollen

### `qa`

Trigger:

- Code Review
- Accessibility
- Performance
- Release-Freigabe

Primaere Quellen:

- `.github/agents/qa-reviewer.agent.md`
- `.github/chatmodes/general/CodeReview_DE.chatmode.md`
- `.github/chatmodes/general/BarrierefreiheitAudit_DE.chatmode.md`
- `.github/chatmodes/general/PerformanceOptimierung_DE.chatmode.md`
- aktive QA-Templates unter `.github/prompts/*.prompt.md` laut `.github/ai-registry.json`

Erwarteter Output:

- Findings oder Validierungsergebnis
- reproduzierbare Testschritte
- Rest-Risiken

## Spezialisierungen

Diese Rollen bauen auf den Core-Rollen auf und erweitern sie nur fuer klar abgegrenzte Themen:

- `brand` ueber `.claude/plugins/moe-brand/`
- `github-audit` ueber `.claude/agents/github-auditor.md`
- `civicrm` ueber `apps/crm/` und CRM-spezifische Betriebsdoku
- `mcp-operations` als DevOps-Faehigkeit im sichtbaren Copilot-Agent `.github/agents/devops-expert.agent.md`

Spezialrollen duerfen keine parallele Repo-Governance einfuehren.

## Routing-Regeln

1. Zuerst echte Pfade im Repository lesen.
1. Dann genau eine primaere Rolle waehlen.
1. Nur zusaetzliche Spezialisierungen hinzuziehen, wenn der Scope sie wirklich braucht.
1. Repo-Contributor-Agents nicht mit externen Produkt- oder Laufzeitrollen vermischen.
1. Neue Guidance muss sich an reale `apps/`-Pfade, aktuelle Services und das Main-first-Modell halten.
1. Skill-, Prompt- und Plugin-Klassifikation folgt immer `.github/ai-registry.json`.

## Output-Regeln

- Vorschlaege muessen existierende Dateien, Skripte und Workflows referenzieren.
- Wenn Rollen, Prompt-Artefakte oder Editor-Workflows geaendert werden, muessen die Governance-Dateien mitgezogen werden.
- Nutzertexte bleiben in oesterreichischem Deutsch.
- Keine Secrets, Tokens oder PII in Beispielen oder Prompts.
- Brand-Aenderungen muessen die aktiven Design-Tokens respektieren.

## Runtime-Checks fuer Secret-Mapping

- Bei allen Aenderungen oder Audits rund um `.github/bsm-secret-ids.json` muss zuerst ein read-only BSM-Metadatencheck gegen die betroffenen UUIDs erfolgen.
- Erlaubte Ausgabe im Audit-Kontext: nur `id`, `key`, `projectId`, `revisionDate`.
- Bei Widerspruch zwischen Mapping-UUID und BSM-Objekt gilt die technische Mapping-Datei als operative Quelle fuer Workflow-Injektion und muss als Drift-Risiko markiert werden.

## Configuration Reliability

Repo-weite Konfigurationen sind nur akzeptiert, wenn sie portabel, validierbar und ohne persoenliche Pfade sind.
Aenderungen an `.vscode/**`, `.devcontainer/**`, `.claude/**`, `mcp.json`, `.github/workflows/**` oder Agent/Copilot-Dateien muessen durch `npm run workspace:config:check` validiert werden.
Geteilte Konfigurationen duerfen keine absoluten lokalen Pfade enthalten. Erlaubt sind `${workspaceFolder}`, repo-relative Pfade und npm Scripts.

## Definition of Done fuer Governance-nahe Aenderungen

- `AGENTS.md`, `CLAUDE.md` und `.github/copilot-instructions.md` bleiben konsistent.
- der einzige aktive Analyse-Einstieg bleibt `.github/instructions/core/analysis-planning.instructions.md`.
- `.github/ai-registry.json` klassifiziert aktive, Adapter-, Vendor- und Legacy-Artefakte vollstaendig.
- `.github/agents/*.agent.md` enthaelt die elf kuratierten sichtbaren Core-/Service-Agents plus `speckit-head-master.agent.md` und die aktiven `speckit.*`-Workflow-Agents; archivierte Copilot-Agents liegen unter `.github/archive/agents/`.
- `.github/chatmodes/**/*.chatmode.md` und relevante `.claude`-Agents zeigen auf reale Pfade.
- es gibt keine aktiven YAML-Chatmode-Artefakte unter `.github/prompts/chatmodes/`.
- `.vscode/*`, `.claude/launch.json`, `mcp.json` und die Workspace-Datei passen zum aktiven Repo-Root.
- `npm run governance:check` bleibt gruen.

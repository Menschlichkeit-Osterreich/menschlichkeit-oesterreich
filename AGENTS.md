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
- Copilot-Agents: exakt fuenf sichtbare Dateien unter `.github/agents/`
  - `.github/agents/task-planner.agent.md`
  - `.github/agents/developer.agent.md`
  - `.github/agents/devops-expert.agent.md`
  - `.github/agents/security-reviewer.agent.md`
  - `.github/agents/qa-reviewer.agent.md`
- Archivierte Copilot-Agents: `.github/archive/agents/*.agent.md`
- Claude-Agents: `.claude/agents/*.md` und `.claude/plugins/*/agents/*.md`
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

## Configuration Reliability

Repo-weite Konfigurationen sind nur akzeptiert, wenn sie portabel, validierbar und ohne persoenliche Pfade sind.
Aenderungen an `.vscode/**`, `.devcontainer/**`, `.claude/**`, `mcp.json`, `.github/workflows/**` oder Agent/Copilot-Dateien muessen durch `npm run workspace:config:check` validiert werden.
Geteilte Konfigurationen duerfen keine absoluten lokalen Pfade enthalten. Erlaubt sind `${workspaceFolder}`, repo-relative Pfade und npm Scripts.

## Definition of Done fuer Governance-nahe Aenderungen

- `AGENTS.md`, `CLAUDE.md` und `.github/copilot-instructions.md` bleiben konsistent.
- der einzige aktive Analyse-Einstieg bleibt `.github/instructions/core/analysis-planning.instructions.md`.
- `.github/ai-registry.json` klassifiziert aktive, Adapter-, Vendor- und Legacy-Artefakte vollstaendig.
- `.github/agents/*.agent.md` enthaelt exakt die fuenf sichtbaren Copilot-Agents; archivierte Copilot-Agents liegen unter `.github/archive/agents/`.
- `.github/chatmodes/**/*.chatmode.md` und relevante `.claude`-Agents zeigen auf reale Pfade.
- es gibt keine aktiven YAML-Chatmode-Artefakte unter `.github/prompts/chatmodes/`.
- `.vscode/*`, `.claude/launch.json`, `mcp.json` und die Workspace-Datei passen zum aktiven Repo-Root.
- `npm run governance:check` bleibt gruen.

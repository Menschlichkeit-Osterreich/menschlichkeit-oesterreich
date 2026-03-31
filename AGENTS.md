# AGENTS.md

Dieser Vertrag ist die kanonische Agenten-Governance fuer `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

Unterstuetzte Clients:

- Codex
- Claude Code
- GitHub Copilot

## Repo-Identitaet

- Lokaler Root: `E:\Menschlichkeit-Osterreich\menschlichkeit-oesterreich`
- Git-Remote: `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Aktive Produktstruktur: `apps/<service>/`, `openclaw-system/`, `automation/`, `figma-design-system/`
- Main-first Workflow mit Branches von `main` und PRs zurueck auf `main`

Hinweis zur Dateibenennung:

- `AGENTS.md` ist die kanonische Datei.
- Historische Verweise auf `agents.md` sollen auf `AGENTS.md` umgebogen werden.
- Auf Windows-Checkouts kann kein zweites physisches Redirect-File mit reinem Case-Unterschied neben `AGENTS.md` existieren; deshalb gilt `AGENTS.md` zugleich als Kompatibilitaetsanker fuer alte `agents.md`-Aufrufe.

## Was diese Datei steuert

Diese Datei beschreibt Repo-Contributor-Agents fuer Entwicklung, Review, Betrieb und Governance.

Sie steuert nicht die Produkt-Runtime-Agenten von OpenClaw. Diese leben separat in `openclaw-system/configs/agent_roles.yaml` und den dazugehoerigen OpenClaw-Konfigurationen.

## Zuerst lesen

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. passende Policies unter `.github/instructions/core/*.instructions.md`

## Aktive Artefakte

- Copilot-Agents: `.github/agents/*.agent.md`
- Claude-Agents: `.claude/agents/*.md` und `.claude/plugins/*/agents/*.md`
- Aktive Chatmodes: `.github/chatmodes/**/*.chatmode.md`
- Ergaenzende Task-Prompts: `.github/prompts/*.prompt.md`
- Legacy-Archiv fuer alte YAML-Chatmodes: `.github/prompts/chatmodes/*.yaml`

Die aktive Mode-Ebene ist `.github/chatmodes`. `.github/prompts/chatmodes` bleibt nur als klar markiertes Legacy-Archiv und ist nicht die fuehrende Wahrheit.

## Core-Rollen

### `architect`

Trigger:

- Architekturentscheidungen
- Schnittstellen, Grenzen, ADR-nahe Arbeit
- Monorepo- oder Integrationsdesign

Primaere Quellen:

- `CLAUDE.md`
- `.github/chatmodes/general/Architekturplan_DE.chatmode.md`
- `.github/prompts/Architekturplan_DE.prompt.md`
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

- `.github/chatmodes/development/*.chatmode.md`
- `.github/prompts/MCPFeatureImplementation_DE.prompt.md`
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

- `.github/chatmodes/general/SicherheitsAudit_DE.chatmode.md`
- `.github/prompts/SicherheitsAudit_DE.prompt.md`
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

- `.github/chatmodes/general/CodeReview_DE.chatmode.md`
- `.github/chatmodes/general/BarrierefreiheitAudit_DE.chatmode.md`
- `.github/chatmodes/general/PerformanceOptimierung_DE.chatmode.md`
- `.github/prompts/TestGeneration_DE.prompt.md`

Erwarteter Output:

- Findings oder Validierungsergebnis
- reproduzierbare Testschritte
- Rest-Risiken

## Spezialisierungen

Diese Rollen bauen auf den Core-Rollen auf und erweitern sie nur fuer klar abgegrenzte Themen:

- `brand` ueber `.claude/plugins/moe-brand/`
- `github-audit` ueber `.claude/agents/github-auditor.md`
- `civicrm` ueber `apps/crm/` und CRM-spezifische Betriebsdoku

Spezialrollen duerfen keine parallele Repo-Governance einfuehren.

## Routing-Regeln

1. Zuerst echte Pfade im Repository lesen.
2. Dann genau eine primaere Rolle waehlen.
3. Nur zusaetzliche Spezialisierungen hinzuziehen, wenn der Scope sie wirklich braucht.
4. Repo-Contributor-Agents niemals mit OpenClaw-Runtime-Agenten vermischen.
5. Neue Guidance muss sich an reale `apps/`-Pfade, aktuelle Services und das Main-first-Modell halten.

## Output-Regeln

- Vorschlaege muessen existierende Dateien, Skripte und Workflows referenzieren.
- Wenn Rollen, Prompt-Artefakte oder Editor-Workflows geaendert werden, muessen die Governance-Dateien mitgezogen werden.
- Nutzertexte bleiben in oesterreichischem Deutsch.
- Keine Secrets, Tokens oder PII in Beispielen oder Prompts.
- Brand-Aenderungen muessen die aktiven Design-Tokens respektieren.

## Definition of Done fuer Governance-nahe Aenderungen

- `AGENTS.md`, `CLAUDE.md` und `.github/copilot-instructions.md` bleiben konsistent.
- `.github/agents/*.agent.md`, `.github/chatmodes/**/*.chatmode.md` und relevante `.claude`-Agents zeigen auf reale Pfade.
- `.github/prompts/chatmodes/*.yaml` bleiben explizit als Legacy markiert.
- `.vscode/*`, `.claude/launch.json`, `mcp.json` und die Workspace-Datei passen zum aktiven Repo-Root.
- `npm run governance:check` bleibt gruen.

---
description: 'Claude-Adapter fuer den kanonischen Analyse- und Planungsworkflow des Repositories'
---

# Analyse-Adapter fuer Claude Code

Diese Datei ist kein eigenstaendiger Governance-Vertrag mehr. Sie adaptiert den gemeinsamen Analyse-Einstieg fuer Claude Code.

## Fuehrende Quellen

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/instructions/core/analysis-planning.instructions.md`
4. `.github/chatmodes/general/AnalysePlanung_DE.chatmode.md`
5. `.github/ai-registry.json`

## Claude-spezifische Anwendung

- Nutze die Core-Instruction als primaere Logik.
- Nutze die Registry zur Klassifikation von Agents, Skills, Plugins, Prompts und Legacy-Artefakten.
- Nutze bei MCP-faehigen Umgebungen `sequential-thinking`.
- Pruefe bei groesseren Plaenen oder Audits den aktuellen GitHub-Backlog mit `state:open repo:${owner}/${repository} sort:updated-desc`.
- Behandle diese Datei selbst nur als Adapter, nicht als primaere Wahrheit.

## Ausgabe

- Zielbild
- Cluster und Priorisierung
- Validierung und Drift-Checks
- Annahmen und Rest-Risiken

## Verboten

- neue Parallel-Governance
- Analyse ohne Bezug auf `analysis-planning.instructions.md`
- Nutzung dieser Datei als primaere Wahrheit statt als Claude-Adapter

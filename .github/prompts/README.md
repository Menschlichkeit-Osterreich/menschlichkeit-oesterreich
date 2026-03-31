# Prompt-Artefakte im Repository

`.github/prompts/` enthaelt ergaenzende Prompt-Artefakte fuer Copilot, Claude-nahe Workflows und dokumentierte Arbeitsmuster.

## Aktiv vs. Legacy

- **Aktive Arbeitsmodi:** `.github/chatmodes/**/*.chatmode.md`
- **Ergaenzende Task-Prompts:** `.github/prompts/*.prompt.md`
- **Legacy:** `.github/prompts/chatmodes/*.yaml`

Die YAML-Chatmodes bleiben nur als historische oder migrationsbezogene Artefakte bestehen. Sie sind nicht die fuehrende Governance-Ebene.

## Reihenfolge

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.github/chatmodes/**/*.chatmode.md`
5. `.github/prompts/*.prompt.md`

## Regeln

- Neue aktive Arbeitsmodi entstehen unter `.github/chatmodes/`
- Neue Prompt-Vorlagen unter `.github/prompts/`
- Legacy-YAMLs nicht reaktivieren
- Keine neuen Repo- oder Rollenwahrheiten hier duplizieren; immer auf `AGENTS.md` und die Core-Instructions referenzieren

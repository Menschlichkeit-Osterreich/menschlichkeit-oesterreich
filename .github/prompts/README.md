# Prompt-Artefakte im Repository

> **Stand:** 2026-03-31 — Migration abgeschlossen. Alle Prompts wurden nach `.github/chatmodes/` bzw. `.github/instructions/` migriert.

`.github/prompts/` enthält ergänzende Prompt-Artefakte für Copilot, Claude-nahe Workflows und dokumentierte Arbeitsmuster.

## Status

- **Migration:** COMPLETE (seit 2025-10-08)
- **Migrierte Dateien:** Alle numerierten und benannten Prompts → chatmodes/instructions
- **Aktive supplementäre Prompts:** Babylon.js, Vereinsplattform, CiviCRM, Rollback, Review

## Aktiv vs. Legacy

- **Führende Arbeitsmodi:** `.github/chatmodes/**/*.chatmode.md`
- **Führende Anweisungen:** `.github/instructions/**/*.instructions.md`
- **Supplementäre Task-Prompts (aktiv):** `.github/prompts/*.prompt.md` (nur nicht-migrierte)
- **Legacy (deprecated, read-only):** Migrierte `.prompt.md`-Dateien + `.github/prompts/chatmodes/*.yaml`

Die YAML-Chatmodes und migrierte Prompt-Dateien bleiben nur als historische Referenz bestehen. Sie sind **nicht** die führende Governance-Ebene.

## Governance-Hierarchie

| Rang | Quelle                                      | Zweck                                      |
| ---- | ------------------------------------------- | ------------------------------------------ |
| 1    | `AGENTS.md`                                 | Repo-Contributor-Agent-Governance          |
| 2    | `CLAUDE.md`                                 | Projektidentität und Konventionen          |
| 3    | `.github/copilot-instructions.md`           | GitHub Copilot Adapter                     |
| 4    | `.github/instructions/**/*.instructions.md` | Domänenspezifische Anweisungen             |
| 5    | `.github/chatmodes/**/*.chatmode.md`        | Interaktive Arbeitsmodi                    |
| 6    | `.github/prompts/*.prompt.md`               | Ergänzende Task-Prompts (niedrigste Ebene) |

## Regeln

- Neue aktive Arbeitsmodi entstehen unter `.github/chatmodes/`
- Neue Anweisungen unter `.github/instructions/`
- Supplementäre Prompt-Vorlagen unter `.github/prompts/` (nur für Artefakte ohne chatmode-Äquivalent)
- Legacy-YAMLs nicht reaktivieren
- Migrierte `.prompt.md`-Dateien nicht als führend verwenden — immer den chatmode/instruction-Nachfolger nutzen
- Keine neuen Repo- oder Rollenwahrheiten hier duplizieren; immer auf `AGENTS.md` und die Core-Instructions referenzieren

## Siehe auch

- [MIGRATION.md](MIGRATION.md) — Vollständige Migrations-Tabelle
- [MIGRATION_MAP.json](MIGRATION_MAP.json) — Maschinenlesbare Zuordnung

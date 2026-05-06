# Prompt-Artefakte im Repository

> **Stand:** 2026-03-31 — Migration der fuehrenden Arbeitsmodi abgeschlossen; supplementaere Prompt-Templates bleiben bewusst erhalten.

`.github/prompts/` enthält ergänzende Prompt-Artefakte für Copilot, Claude-nahe Workflows und dokumentierte Arbeitsmuster.

## Status

- **Fuehrende Arbeitsmodi:** ausgelagert nach `.github/chatmodes/` und `.github/instructions/`
- **Aktive supplementaere Prompts:** nur explizit als `active` in `.github/ai-registry.json` klassifizierte Templates
- **Deprecated Prompt-Dateien:** bleiben als Referenz, sind aber nicht fuehrend

## Aktiv vs. Legacy

- **Führende Arbeitsmodi:** `.github/chatmodes/**/*.chatmode.md`
- **Führende Anweisungen:** `.github/instructions/**/*.instructions.md`
- **Supplementäre Task-Prompts (aktiv):** `.github/prompts/*.prompt.md` mit Registry-Status `active`
- **Legacy (deprecated, read-only):** migrierte `.prompt.md`-Dateien

Migrierte Prompt-Dateien bleiben nur als historische Referenz bestehen. Sie sind **nicht** die führende Governance-Ebene.

## Governance-Hierarchie

| Rang | Quelle                                                        | Zweck                             |
| ---- | ------------------------------------------------------------- | --------------------------------- |
| 1    | `AGENTS.md`                                                   | Repo-Contributor-Agent-Governance |
| 2    | `.github/instructions/core/analysis-planning.instructions.md` | Kanonischer Analyse-Einstieg      |
| 3    | `.github/ai-registry.json`                                    | Machine-readable Statusmodell     |
| 4    | `CLAUDE.md`                                                   | Projektidentität und Konventionen |
| 5    | `.github/copilot-instructions.md`                             | GitHub Copilot Adapter            |
| 6    | `.github/instructions/**/*.instructions.md`                   | Domänenspezifische Anweisungen    |
| 7    | `.github/chatmodes/**/*.chatmode.md`                          | Interaktive Arbeitsmodi           |
| 8    | `.github/prompts/*.prompt.md`                                 | Ergänzende Task-Prompts           |

## Regeln

- Neue aktive Arbeitsmodi entstehen unter `.github/chatmodes/`
- Neue Anweisungen unter `.github/instructions/`
- Supplementäre Prompt-Vorlagen unter `.github/prompts/` (nur für Artefakte ohne chatmode-Äquivalent)
- Der Status jeder Prompt-Datei wird in `.github/ai-registry.json` gefuehrt
- Migrierte `.prompt.md`-Dateien nicht als führend verwenden — immer den chatmode/instruction-Nachfolger nutzen
- Keine neuen Repo- oder Rollenwahrheiten hier duplizieren; immer auf `AGENTS.md` und die Core-Instructions referenzieren

## Siehe auch

- [MIGRATION.md](MIGRATION.md) — Vollständige Migrations-Tabelle
- [MIGRATION_MAP.json](MIGRATION_MAP.json) — Maschinenlesbare Zuordnung
- [.github/ai-registry.json](../ai-registry.json) — Verbindliche Klassifikation aller Prompt-, Agenten- und Skill-Artefakte

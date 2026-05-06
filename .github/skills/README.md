# Skills im Repository

`.github/skills/` ist die kanonische aktive Skill-Schicht fuer dieses Repository.

## Statusmodell

- `active`: fuehrende Skills fuer den Repo-Workflow
- `adapter`: Wrapper oder Zuordnung auf eine kanonische Quelle
- `vendor`: importierte Skills ohne kanonische Repo-Wahrheit
- `legacy` / `deprecated`: historische Skills oder ersetzte Artefakte

## Quellen

- Machine-readable Klassifikation: `.github/ai-registry.json`
- Rollenrouting: `AGENTS.md`
- Analyse-Einstieg: `.github/instructions/core/analysis-planning.instructions.md`

## Wichtige Regel

Claude-Plugin-Skills und Vendor-Skills duerfen nur aktiv verwendet werden, wenn sie in der Registry klassifiziert und einer kanonischen Skill- oder Rollenquelle zugeordnet sind.

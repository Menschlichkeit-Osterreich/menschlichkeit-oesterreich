---
title: Analysis & Planning Core
description: Kanonischer Analyse- und Planungsworkflow fuer Codex, Claude Code und GitHub Copilot
status: ACTIVE
version: 1.0.0
created: 2026-03-31
lastUpdated: 2026-03-31
owners:
  - Platform Team
  - AI Governance
tags:
  - analysis
  - planning
  - governance
category: governance
priority: critical
---

# Analysis & Planning Core

Diese Datei ist der einzige kanonische Einstieg fuer Analyse und Planung im Repository `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

## Verbindliche Quellen

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.github/ai-registry.json`
5. relevante `.github/instructions/core/*.instructions.md`

## Issue- und Backlog-Kontext

Vor groesseren Plaenen, Audits oder Repo-weiten Refactorings muss der aktuelle GitHub-Backlog mitgeprueft werden.

Standardabfrage:

```json
{
  "label": "Aktuelle Probleme",
  "query": "state:open repo:${owner}/${repository} sort:updated-desc"
}
```

Nutze diesen Schritt, um:

- aktuelle P0-, P1- und Compliance-Themen in die Priorisierung aufzunehmen
- laufende oder bereits dokumentierte Arbeit nicht doppelt zu planen
- offene Issues, Abhaengigkeiten und Regressionen gegen die reale Repo-Analyse abzugleichen

## Pflichtablauf

1. **Repo-Wahrheit sammeln**
   - echte Dateien, Skripte, Workflows und Konfigurationen lesen
   - historische oder archivierte Artefakte klar von aktiven trennen
   - offene GitHub-Issues und relevante PR-Kontexte mit der Standardabfrage gegenpruefen
2. **Analyse clustern**
   - Probleme in logisch getrennte Cluster aufteilen
   - Abhaengigkeiten und Reihenfolge sichtbar machen
3. **Entscheidungen fixieren**
   - offene Produkt- oder Implementierungsentscheidungen explizit benennen
   - keine impliziten Annahmen bei hohem Risiko verstecken
4. **Plan ausgeben**
   - umsetzungsbereit, repo-nah und entscheidungsvoll
   - mit Tests, Drift-Checks und klaren Annahmen

## Sequential Thinking

- Wenn der aktive Client MCP nutzen kann, ist `sequential-thinking` verpflichtend fuer mehrstufige Analyse und Priorisierung.
- Der MCP-Server in `mcp.json` ist die fuehrende Quelle.
- `scripts/mcp/wrapper-sequential-thinking.sh` ist nur Fallback fuer Umgebungen ohne MCP und darf nicht als primaere Analyse-Engine dokumentiert werden.

## Cluster-Schema

Jeder groessere Analyseblock soll mindestens diese Felder abdecken:

| Feld                 | Inhalt                               |
| -------------------- | ------------------------------------ |
| Name                 | kurze Cluster-Bezeichnung            |
| Ziel                 | was verbessert oder abgesichert wird |
| Betroffene Artefakte | Apps, Skripte, Doku, Workflows       |
| Risiko heute         | Impact bei Nichtbearbeitung          |
| Aenderungsrisiko     | Regressions- oder Migrationsrisiko   |
| Abhaengigkeiten      | Vorbedingungen, Blocker, Reihenfolge |
| Validierung          | Tests, Smokes, Drift-Checks          |

## Entscheidungsfragen

Vor einem Implementierungsplan muessen diese Punkte beantwortet oder explizit als Annahmen gesetzt sein:

- Was ist die kanonische Quelle?
- Welche Artefakte bleiben aktiv, welche werden Adapter, welche werden Legacy?
- Welche Rollen sind primaer betroffen?
- Welche Automatisierung prueft den Zielzustand?
- Welche bestehenden Nutzerpfade oder Workflows duerfen nicht regressieren?

## Standardausgabe fuer Plaene

- Kurzfassung des Ziels
- wichtige Architektur- und Governance-Aenderungen
- Schnittstellen oder Dateivertraege
- Test- und Validierungspfad
- Annahmen und Defaults

## Guardrails

- Keine neue Parallel-Governance einfuehren
- Keine alten Repo-Namen oder tote Pfade als aktiv behandeln
- Keine Analyse ohne klare Trennung von aktiv, Adapter, Vendor und Legacy
- Keine PII, Secrets oder produktive Zugangsdaten in Beispielen

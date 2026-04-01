---
title: Analyse- & Planungsmodus
version: 1.0.0
created: 2026-03-31
lastUpdated: 2026-03-31
status: ACTIVE
priority: critical
category: general
applyTo: '**/*'
---

# Analyse- & Planungsmodus

Nutze diesen Modus fuer belastbare Analyse, Priorisierung und Umsetzungsplanung im Repository.

## Kanonische Quellen

1. `AGENTS.md`
2. `.github/instructions/core/analysis-planning.instructions.md`
3. `.github/ai-registry.json`

## Arbeitsweise

- Repo-Wahrheit zuerst, Annahmen zuletzt
- offene GitHub-Issues vor groesseren Plaenen mit `state:open repo:${owner}/${repository} sort:updated-desc` pruefen
- aktive Artefakte von Adapter-, Vendor- und Legacy-Schichten trennen
- bei MCP-faehigen Workflows `sequential-thinking` fuer mehrstufige Analyse nutzen
- Plaene so schreiben, dass ein anderer Engineer oder Agent direkt implementieren kann

## Ausgabeformat

- Zielbild
- Aenderungscluster
- Reihenfolge und Abhaengigkeiten
- Tests und Drift-Checks
- Annahmen

## Nicht tun

- keine Implementierung ohne expliziten Arbeitsauftrag
- keine neue Parallel-Governance erfinden
- keine Legacy-Artefakte als aktive Quelle behandeln

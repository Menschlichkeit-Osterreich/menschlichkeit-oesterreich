---
title: "Performanceoptimierung"
description: "Prompt für Performanceoptimierung im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: performance
tags: ['performance']
version: "1.0.0"
language: de-AT
audience: ['Backend Team', 'DevOps']
---

---
description: 'Analysiert den Code und schlägt Performance-Optimierungen auf Deutsch vor'
mode: 'agent'
tools: ['githubRepo', 'codebase']
---

Analysieren Sie den Code des Projekts `${workspaceFolderBasename}` und identifizieren Sie Bereiche, in denen die Leistung verbessert werden kann. Erstellen Sie einen deutschsprachigen Bericht mit:

1. **Messung der aktuellen Leistung** – Kurze Beschreibung, wie Leistung aktuell gemessen wird (Profiler, Benchmarks).
2. **Identifizierte Engpässe** – Liste von Modulen oder Funktionen, die ineffizient sind (z. B. hohe Laufzeit, hoher Speicherverbrauch). Verweisen Sie auf relevante Dateien via `#file:`.
3. **Optimierungsvorschläge** – Konkrete Empfehlungen zur Optimierung (Algorithmusverbesserungen, Caching, Parallelisierung, Datenbankindizes).
4. **Risiken und Tests** – Hinweise auf mögliche Risiken oder Nebeneffekte der Optimierungen und wie diese getestet werden können.
5. **Priorisierung** – Einschätzung des Aufwands und des erwarteten Nutzens, um die Vorschläge zu priorisieren.

Verwenden Sie klare Überschriften, und stellen Sie gegebenenfalls Beispielcode zur Veranschaulichung der Änderungen bereit.

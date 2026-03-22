# File By File Plan

## Bereits neu ausgerichtete Kernfiles
- [apps/game/js/content/world-state.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/content/world-state.js)
  - Verantwortet Weltzustand, Track-Logik und systemische Delta-Berechnung.
- [apps/game/js/content/campaign.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/content/campaign.js)
  - Verantwortet Rollen, Welten, Szenarien, Teacher-Summary und Outcome-Aufloesung.
- [apps/game/js/ui/app-shell.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/ui/app-shell.js)
  - Verantwortet State-Flow, DOM-Bindings, Teacher-Screen und Persistenz-Orchestrierung.
- [apps/game/js/ui/templates.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/ui/templates.js)
  - Verantwortet reine Markup-Templates fuer Rollen, Weltzustand, Debrief und Teacher-Review.
- [apps/game/js/babylon-engine.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/babylon-engine.js)
  - Verantwortet die Babylon-Buehne inklusive Track-Pillars und szenischem Moduswechsel.
- [apps/game/js/services/analytics.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/js/services/analytics.js)
  - Verantwortet lokale, consent-gated Event-Speicherung und Zusammenfassungen.
- [apps/game/index.html](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/index.html)
  - Verantwortet die kanonische Shell, Screen-Container und Teacher-/Debrief-IDs.
- [apps/game/css/babylon-game.css](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/css/babylon-game.css)
  - Verantwortet Layout und Systemkarten fuer Weltzustand, Konsequenzen und Teacher-Log.

## Naechste sinnvolle neue Dateien
- `apps/game/js/content/world-school.js`
- `apps/game/js/content/world-work.js`
- `apps/game/js/content/world-media.js`
- `apps/game/js/content/achievement-rules.js`

## Dateien, die bewusst nicht Ziel dieses Umsetzungsblocks sind
- [apps/game/v2/index.html](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/v2/index.html)
- [apps/game/v2/js/main.js](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/v2/js/main.js)
- alle Demo-HTML-Seiten ausserhalb des kanonischen Root-Flows

## Loesch- oder Archivkandidaten spaeter
- alte Demo- oder Showcase-Seiten in `apps/game/`, sobald Referenzbedarf geklaert ist
- redundante Legacy-JS-Module, die nicht mehr von `index.html` genutzt werden

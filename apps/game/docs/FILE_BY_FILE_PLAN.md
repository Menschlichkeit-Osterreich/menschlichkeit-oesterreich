# File-by-File Plan — Brücken Bauen 3D (v2)
Stand: 2026-03-22 | Basis: 19 JS-Dateien in apps/game/v2/js/

---

## Vorhandene Dateien (v2-Codebase)

| Dateiname | Aktueller Status | Geplante Aktion | Begründung |
|---|---|---|---|
| `v2/index.html` | broken (404-Referenz, falsche Script-Reihenfolge) | fix | Zentraler Einstiegspunkt. analytics.js-Referenz entfernen oder Stub-Pfad korrigieren. Script-Tag-Reihenfolge für data-scenarios.js vor scene-game.js sicherstellen. SRI-Hashes ergänzen. |
| `v2/js/main.js` | working (Initialisierung, Eventbus-Setup) | keep + extend | Einstiegspunkt funktioniert. TeacherDashboard.init() hier aufrufen sobald Dashboard bereit ist. |
| `v2/js/ui-screens.js` | broken (DOM-ID Mismatch Z.60) | fix | `role-selection` → `role-select-screen`. Alle weiteren getElementById-Aufrufe auf Korrektheit prüfen. |
| `v2/js/scene-menu.js` | broken (kein Return-Objekt aus init()) | fix | Return-Objekt oder resolving Promise ergänzen. Aufrufstellen in main.js auf Rückgabewert prüfen. |
| `v2/js/scene-game.js` | partial (Extended Scenarios nicht eingebunden) | fix + extend | `EXTENDED_SCENARIOS`-Lookup für Level 11–100 ergänzen. Szenario-Lade-Pfad für beide Datensätze vereinheitlichen. |
| `v2/js/data-scenarios.js` | partial (Welt 1 Level 1–10 vorhanden, EXTENDED_SCENARIOS für Level 11–100 nicht eingebunden) | keep + extend | Szenario-Daten für Welt 1 sind vorhanden. EXTENDED_SCENARIOS muss in scene-game.js referenziert werden. Qualität der bestehenden Szenarien prüfen — sind die Texte konkret genug für österreichische Schulklassen? |
| `v2/js/event-bus.js` | ok | keep | Pub/sub-Muster ist sauber. Wird als Kommunikationsschicht auch für Babylon.js-Integration tauglich sein. Keine Änderungen nötig. |
| `v2/js/save-system.js` | ok | keep + extend | Autosave funktioniert, Versionsfeld und Migrations-Stub vorhanden. Für Teacher-Mode-Export um anonymisierten JSON-Export-Endpunkt ergänzen. |
| `v2/js/achievement-system.js` | ok | keep + extend | Achievement-Typen definiert und werden geladen. Sobald Level 11–100 Inhalte haben, Achievement-Trigger dort ergänzen. |
| `v2/js/progression-system.js` | ok | keep + extend | XP-Logik und Weltfreischaltung grundsätzlich vorhanden. Testen ob Weltfreischaltung korrekt greift wenn Level 1–3 abgeschlossen. |
| `v2/js/audio-manager.js` | ok | keep | Howler.js-Wrapper mit Fade-in/out und Kategoriesteuerung. Keine bekannten Bugs. Abhängigkeit: Howler.js CDN muss erreichbar sein. |
| `v2/js/ui-manager.js` | partial (Screen-Switching funktioniert, aber abhängig von korrekten DOM-IDs) | fix | Screen-Switching-Logik ist ok, aber alle DOM-ID-Referenzen müssen nach ui-screens.js-Fix geprüft werden um Inkonsistenzen zu finden. |
| `v2/js/scene-worldmap.js` | ok (Three.js Worldmap) | keep → later replace | Worldmap funktioniert mit Three.js r128. Mittelfristig durch Babylon.js-Implementierung ersetzen. Vorher nicht anfassen. |
| `v2/js/teacher-dashboard.js` | stub (Klasse definiert, nicht initialisiert) | fix (init-Aufruf) oder delete | Entweder: minimaler init()-Aufruf in main.js ergänzen und Teacher-Screen mit Sitzungslog verbinden. Oder: Script-Tag in index.html entfernen und als "nicht bereit" kennzeichnen. Stub ohne Init-Aufruf erzeugt falsche Erwartungen. |
| `v2/js/analytics.js` | fehlt (404) | neu anlegen als Stub | Stub mit No-Op-Interface anlegen: `track(event, data)`, `flush()`, `getSession()`. Alle Aufrufstellen mit Guard absichern (`if (window.AnalyticsManager)`). |
| `v2/js/role-system.js` | ok | keep + extend | Rollen-Definitionen mit Startwerten vorhanden. Rollenspezifische Optionen in Szenarien sind noch nicht implementiert — das ist Phase-2-Aufgabe, nicht hier. |
| `v2/js/world-config.js` | ok | keep | Welt-Metadaten (Namen, Icons, Themen) korrekt. Keine Bugs bekannt. |
| `v2/js/choice-processor.js` | partial (Choice-Typen definiert, Konsequenz-Logik unvollständig) | extend | 14 Choice-Typen vorhanden. Konsequenz-Berechnung für jeden Typ muss geprüft werden — `ignore` und `reject` haben möglicherweise keine implementierten Folgeeffekte. |
| `v2/js/level-manager.js` | partial (Level 1–10 ok, Level 11–100 nicht korrekt geladen) | fix | Hängt direkt mit Bug 3 zusammen (EXTENDED_SCENARIOS). Nach scene-game.js-Fix auch hier prüfen ob Level-Lookup-Index korrekt ist. |

---

## Neue Dateien, die entstehen sollen

| Dateiname | Zweck | Phase |
|---|---|---|
| `v2/js/analytics.js` | Stub-AnalyticsManager mit No-Op-Interface. Verhindert 404 und undefined-Fehler. Spätere echte Implementierung kann diesen Stub ersetzen. | Phase 1 |
| `v2/js/scene-worldmap-babylon.js` | Babylon.js-Implementierung der Worldmap als Drop-in-Ersatz für scene-worldmap.js (Three.js). Zuerst Prototyp, dann vollständiger Ersatz. | Phase 2–3 |
| `v2/js/fsm-game-states.js` | Minimales State-Machine-Modul für Spielzustände (idle, role-selection, world-map, in-game, level-complete, settings, teacher). Ersetzt implizite Event-Flag-Logik schrittweise. | Phase 3 |
| `v2/js/teacher-session.js` | Teacher-Session-Manager: anonymisierte Klassen-ID, Sitzungslog, Export-Funktion (JSON). Aus teacher-dashboard.js herausgelöst um klare Verantwortlichkeiten zu schaffen. | Phase 3 |
| `v2/js/scenario-validator.js` | Entwicklungszeit-Werkzeug: prüft ob alle Level-Szenario-Einträge das korrekte Schema haben (Pflichtfelder, Choice-Typen, Rollenvarianten). Verhindert Silent Failures bei neuem Content. | Phase 2 |

---

## Lösch- oder Archivkandidaten

| Datei / Bereich | Empfehlung | Begründung |
|---|---|---|
| `v2/` Verzeichnis insgesamt | Langfristig archivieren, nicht reparieren als Primärpfad | Die Root-App (`apps/game/index.html`) ist der kanonische Produktionspfad. v2 ist Content- und Ideenarchiv. Beide Pfade gleichzeitig aktiv zu entwickeln verteilt Aufmerksamkeit ohne Mehrwert. |
| `apps/game/enhanced-design-system-demo.html` | Archivieren | Demo-Datei, kein Produktionspfad. |
| `apps/game/graphics-showcase.html` | Archivieren | Demo-Datei, kein Produktionspfad. |
| `apps/game/performance-monitoring.html` | Keep temporarily | Kann für Performance-Testing der Babylon.js-Migration nützlich sein. Danach archivieren. |
| `apps/game/multiplayer-democracy.html` | Archivieren bis Phase 4 | Multiplayer ist Post-MVP-Feature. Diese Demo erzeugt falsche Erwartungen über den aktuellen Stand. |
| `apps/game/user-testing-ready.html` | Archivieren | Wenn der Vertical Slice (Phase 2) fertig ist, ist diese Demo überholt. |

---

## Prioritätsreihenfolge für Phase 1

1. `v2/js/analytics.js` neu anlegen (Stub) — unblocks alle anderen
2. `v2/js/ui-screens.js` DOM-ID-Fix — unblocks gesamtes Spielerlebnis
3. `v2/js/scene-game.js` + `v2/js/level-manager.js` EXTENDED_SCENARIOS — unblocks Level 11–100
4. `v2/js/scene-menu.js` Return-Objekt — unblocks fehlerfreien Menü-Flow
5. `v2/index.html` SRI-Hashes + Script-Reihenfolge — security + stability
6. `v2/js/teacher-dashboard.js` init-Aufruf oder Entfernung — räumt falsche Erwartungen auf

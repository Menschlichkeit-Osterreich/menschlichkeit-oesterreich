# Executive Audit — Brücken Bauen 3D (v2)
Stand: 2026-03-22 | Basis: tatsächliche Codeanalyse, 19 JS-Dateien, apps/game/v2/

---

## 1. IST-Zustand

### Technologie-Stack

| Schicht | Technologie | Version | Einbindung |
|---|---|---|---|
| 3D-Rendering | Three.js | r128 | CDN |
| Animation | GSAP | 3.12.2 | CDN |
| Audio | Howler.js | 2.2.4 | CDN |
| Persistenz | localStorage | Browser-nativ | direkt |
| Deployment | Statisches HTML | — | kein Build-Schritt |

Ausschließlich CDN-Abhängigkeiten, kein Bundler, kein Modul-System. Alle Skripte werden sequenziell über `<script>`-Tags in index.html geladen. Das ist für Prototypen vertretbar, aber ein strukturelles Risiko für den Produktionsbetrieb: Ladereihenfolge-Abhängigkeiten sind implizit, kein Tree-Shaking möglich, CDN-Ausfall macht das Spiel unspielbar.

### Was vorhanden und grundsätzlich funktionstüchtig ist

- **SaveSystem** (localStorage, Autosave alle 30 Sekunden): Implementiert, mit Versionsfeld und Migrations-Stub.
- **AchievementSystem**: Mehrere Achievement-Typen definiert, wird beim Laden registriert.
- **ProgressionSystem**: XP-Logik, Level-Up-Berechnung, Weltfreischaltungs-Prüfung vorhanden.
- **EventBus** (pub/sub): Einfaches, funktionierendes Muster. Entkopplung zwischen Systemen grundsätzlich gegeben — kein formales FSM, aber handhabbar auf aktuellem Komplexitätsniveau.
- **AudioManager**: Howler.js-Wrapper mit Fade-in/out und Kategoriesteuerung.
- **UIManager**: Screen-Switching-Logik vorhanden.
- **Rollen-System**: 6 Rollen definiert — Bürger:in, Politiker, Journalist:in, Aktivist:in, Beamter:in, Richterin — mit je eigenen Startwerten.
- **Welten-Struktur**: 10 Welten × 10 Level = 100-Level-Framework konzeptuell fertig.
- **Szenario-Daten Level 1–10**: data-scenarios.js enthält Basisszenarien für Welt 1 (Gemeinde).
- **Choice-Typen**: 14 Typen definiert (consensus, majority, environment, community, official, research, expose, mobilize, rights, compliance, independent, protest, reject, ignore).
- **Screens**: loading, main-menu, role-select, world-map, game, level-complete, settings, teacher — alle IDs im HTML angelegt.
- **TeacherDashboard**: Datei vorhanden, Klasse definiert — aber nicht initialisiert (Stub-Status).

---

## 2. Kritische Bugs

Diese vier Bugs blockieren das Spiel vollständig oder erzeugen Silent Failures beim Spielstart.

### Bug 1 — analytics.js fehlt (404)

**Fundstelle:** `apps/game/v2/index.html`, Zeile 308
**Problem:** Das Skript `analytics.js` wird per `<script>`-Tag referenziert, existiert aber nicht im Repository. Der Browser wirft beim Laden einen 404. Je nach Ladereihenfolge blockiert das nachfolgende Skripte oder hinterlässt `window.AnalyticsManager` als `undefined` — was jeden darauf zugreifenden Code mit einem ReferenceError abbricht, ohne sichtbare Fehlermeldung im Spiel.
**Aufwand Behebung:** analytics.js als Stub anlegen (leeres Objekt mit No-Op-Methoden), alle Aufrufstellen mit `if (window.AnalyticsManager)` absichern. Ca. 15 Minuten.

### Bug 2 — DOM-ID Mismatch: Rollenauswahl-Screen nicht erreichbar

**Fundstelle:** `apps/game/v2/js/ui-screens.js`, Zeile 60
**Problem:** ui-screens.js sucht `document.getElementById('role-selection')`. Das HTML-Element hat die ID `role-select-screen`. Ergebnis: `null`-Referenz bei jeder Navigationsgeste zur Rollenauswahl. Die gesamte Rollenauswahl-Transition ist damit broken — niemand kann eine Rolle wählen, das Spiel startet nie.
**Aufwand Behebung:** Alle Vorkommen von `'role-selection'` in ui-screens.js auf `'role-select-screen'` ändern. Ca. 5 Minuten — ist aber der wirkungsvollste Einzelfix im Repository.

### Bug 3 — data-scenarios.js (Extended Scenarios Level 11–100) nicht eingebunden

**Fundstelle:** `apps/game/v2/js/scene-game.js` (kein Bezug auf `EXTENDED_SCENARIOS`)
**Problem:** `EXTENDED_SCENARIOS` für Level 11–100 ist in data-scenarios.js definiert, wird in scene-game.js aber nie referenziert. Level 11–100 liefern daher leere oder `undefined`-Szenarien. Das ist kein Absturz — es ist ein inhaltlicher Silent Failure. Das Spiel lädt scheinbar normal, zeigt aber keine Szenarien für 90 % der angekündigten Inhalte.
**Aufwand Behebung:** In scene-game.js beim Szenario-Lookup auf `EXTENDED_SCENARIOS` erweitern; sicherstellen, dass das `<script>`-Tag für data-scenarios.js in index.html vor scene-game.js steht. Ca. 30 Minuten.

### Bug 4 — scene-menu.js fehlt Return-Objekt

**Fundstelle:** `apps/game/v2/js/scene-menu.js`
**Problem:** `SceneMenu.init()` hat kein explizites Return-Statement. Code, der auf den Rückgabewert angewiesen ist oder Promise-Chaining betreibt, schlägt stumm fehl. Unklar ist aus dem vorliegenden Code, ob init() synchron oder asynchron aufgerufen wird — das fehlende Return macht beides fragil.
**Aufwand Behebung:** Return-Objekt oder resolving Promise ergänzen; alle Aufrufstellen in main.js/scene-manager.js prüfen. Ca. 20 Minuten.

---

## 3. Architektur-Schwächen

### Schein-Komplexität: TeacherDashboard (Stub ohne Init-Aufruf)
TeacherDashboard ist als Klasse definiert und die Datei wird geladen, aber es gibt keinen Aufruf von `TeacherDashboard.init()` in main.js oder anderem Einstiegspunkt. Der teacher-Screen ist im HTML vorhanden, aber funktional leer. Das vermittelt von außen den Eindruck eines fertigen Features — es ist keines.

### Kein formales FSM für Spielzustände
Der EventBus entkoppelt die Systeme grundlegend, aber Screen-Übergänge und Spielzustände werden ad-hoc über Events und UI-Flags verwaltet. Bei 8 Screens, 6 Rollen und 100 Leveln entsteht dabei ein implizites Zustandsnetz, das schwer zu debuggen ist. Ein minimales FSM mit 6–8 definierten Zuständen (idle, role-selection, world-map, in-game, level-complete, settings, teacher) würde die Ladereihenfolge-Bugs reduzieren und den Code wartbarer machen.

### Globaler Namespace ohne Modulgrenzen
Alle Systeme leben im globalen `window`-Objekt. Bei 19 Dateien ist das noch überschaubar. Bei Erweiterung auf 30+ Dateien entstehen Namenskollisionen und Ladereihenfolge-Abhängigkeiten, die schwer auffindbar sind. Ein IIFE-Modul-Muster wäre ein risikoarmer Schritt; ES-Module würden einen Build-Schritt erfordern.

### CDN-Abhängigkeit ohne SRI und ohne Fallback
Three.js r128, GSAP 3.12.2, Howler.js 2.2.4 — alle von externen CDNs geladen, ohne Subresource-Integrity-Hashes (SRI). Bei CDN-Ausfall oder -Drosselung ist das Spiel nicht spielbar. In Schulumgebungen mit Content-Filtern besonders problematisch. Mindestmaßnahme: SRI-Hashes in alle `<script>`-Tags eintragen.

### 100-Level-Framework ohne Content-Unterbau
Das Framework für 100 Level existiert, aber 90 % der Inhalte fehlen (Level 11–100 komplett leer, Extended Scenarios nicht eingebunden). Das erzeugt eine falsche Selbstwahrnehmung: Das Projekt sieht vollständiger aus als es ist, was interne Prioritätsentscheidungen verzerrt.

---

## 4. Größte Chancen

### EventBus als solide Kommunikationsschicht
Der vorhandene pub/sub EventBus ist gut strukturiert. Er kann direkt als Kommunikationsschicht zwischen einer künftigen Babylon.js-Worldmap und dem bestehenden Spielsystem genutzt werden — ohne alles neu zu schreiben.

### Rollen-System mit echtem didaktischem Potential
6 Rollen × 14 Choice-Typen ermöglichen unterschiedliche Spielverläufe für dieselben Szenarien. Das ist das Herzstück des demokratischen Lerneffekts. Mit besseren Szenario-Texten und sichtbaren Rollenunterschieden — andere verfügbare Optionen, andere Konsequenzen — wird das zum Alleinstellungsmerkmal gegenüber generischen Lernspielen.

### SaveSystem als Datenbasis für Teacher Mode
localStorage-Persistenz ist bereits vorhanden. Mit minimaler Erweiterung — exportierbares JSON, anonymisierte Klassen-ID — kann der Teacher Mode echte Lernfortschritte einer Gruppe zeigen, ohne Backend-Infrastruktur zu benötigen.

### 10-Welten-Themenstruktur ist curricular anschlussfähig
Die Welten (Gemeinde, Schule, Arbeit, Medien, Umwelt, Digital, Gesundheit, Europa, Gerechtigkeit, Zukunft) decken Inhalte des österreichischen Lehrplans für Politische Bildung ab. Das macht das Spiel für Schulen vermarktbar, ohne Nachbesserungen an der Grundstruktur.

### Three.js → Babylon.js Migration mit schrittweisem Ersatz möglich
Da Three.js hauptsächlich für die Worldmap genutzt wird, kann Babylon.js zunächst nur für diesen einen Screen eingeführt werden. Der Rest des Spiels (DOM-basierte Screens) ist nicht von Three.js abhängig.

---

## 5. Klare Empfehlung

### Sofort reparieren (heute, nicht morgen)

Diese vier Fixes kosten zusammen unter einer Stunde und machen das Spiel grundlegend spielbar:

1. `analytics.js` als Stub anlegen — 15 Minuten
2. `'role-selection'` → `'role-select-screen'` in ui-screens.js — 5 Minuten
3. `data-scenarios.js`-Script-Tag in index.html vor scene-game.js sicherstellen, `EXTENDED_SCENARIOS`-Lookup in scene-game.js ergänzen — 30 Minuten
4. `scene-menu.js` Return-Objekt ergänzen, Aufrufstellen prüfen — 20 Minuten

### Als nächstes (diese Woche)

- Einen vollständigen Vertical Slice bauen: Welt 1 (Gemeinde), Level 1–3, eine Rolle (Bürger:in), von Menü bis Level-Complete-Screen durchspielbar. Kein Babylon.js in dieser Phase — erst wenn der Three.js-Basisflow stabil läuft.
- TeacherDashboard entweder mit einem minimalen `init()`-Aufruf verbinden oder den `<script>`-Tag entfernen. Stubs ohne Initialisierung erzeugen falsche Erwartungen.
- SRI-Hashes für alle CDN-Skripte eintragen.

### Mittelfristig (nächster Monat)

- Babylon.js für Worldmap-Screen einführen (als Ersatz für Three.js-Worldmap, nicht für das gesamte Spiel).
- Minimales FSM für Screen-Zustände einführen.
- Szenario-Texte für Level 1–10 qualitativ anheben — konkrete österreichische Kontexte, keine generischen Demotexte.

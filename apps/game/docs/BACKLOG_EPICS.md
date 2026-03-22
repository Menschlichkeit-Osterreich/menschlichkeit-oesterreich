# Backlog Epics — Brücken Bauen 3D
Stand: 2026-03-22 | v2-Codebase (apps/game/v2/)

---

## Epic 1: Kritische Fixes — Spiel grundlegend spielbar machen

**Kontext:** Vier konkrete Bugs blockieren das Spiel vollständig. Dieser Epic hat absolute Priorität. Nichts aus Epic 2–6 beginnt, bevor Epic 1 abgeschlossen ist.

### Story 1.1 — analytics.js Stub anlegen

**Als** Entwickler:in **will ich**, dass das Spiel lädt ohne 404-Fehler auf analytics.js, **damit** nachfolgende Skripte nicht blockiert werden und AnalyticsManager-Referenzen nicht abstürzen.

**Akzeptanzkriterien:**
- `apps/game/v2/js/analytics.js` existiert im Repository
- Die Datei exportiert ein `window.AnalyticsManager`-Objekt mit Methoden: `track(event, data)`, `flush()`, `getSession()`
- Alle drei Methoden sind No-Ops (kein Absturz, keine Nebenwirkungen)
- Browserkonsole zeigt beim Laden von index.html keinen 404 auf analytics.js
- Alle Aufrufstellen von `AnalyticsManager` im Code sind mit `if (window.AnalyticsManager)` abgesichert

**Technische Tasks:**
- analytics.js erstellen mit No-Op-Interface
- index.html prüfen: Script-Tag-Pfad korrekt?
- Alle JS-Dateien nach `AnalyticsManager`-Verwendung durchsuchen und Guards ergänzen

**Definition of Done:** Kein 404-Fehler in der Konsole. Kein ReferenceError auf AnalyticsManager in normalem Spielflow.

---

### Story 1.2 — DOM-ID Mismatch in ui-screens.js beheben

**Als** Spieler:in **will ich**, dass der Klick auf "Rolle wählen" den Rollenauswahl-Screen öffnet, **damit** ich das Spiel überhaupt starten kann.

**Akzeptanzkriterien:**
- `ui-screens.js` Zeile 60 referenziert `'role-select-screen'` (nicht `'role-selection'`)
- Alle weiteren DOM-ID-Referenzen in ui-screens.js und ui-manager.js sind auf Übereinstimmung mit index.html geprüft
- Klick auf Rollenauswahl-Button navigiert korrekt zum Rollenauswahl-Screen
- Browser-Konsole zeigt keinen null-Referenz-Fehler beim Navigieren zwischen Screens
- Alle 8 Screen-Übergänge sind manuell getestet und funktionieren

**Technische Tasks:**
- `'role-selection'` → `'role-select-screen'` in ui-screens.js (auch alle weiteren Vorkommen)
- Vollständige DOM-ID-Inventur: alle getElementById()-Aufrufe gegen index.html-IDs abgleichen
- Manueller Durchklick aller Screen-Transitions dokumentieren

**Definition of Done:** Vollständiger Screen-Flow von main-menu bis level-complete ohne null-Referenz-Fehler.

---

### Story 1.3 — Extended Scenarios (Level 11–100) einbinden

**Als** Spieler:in **will ich**, dass Level 11 und höher Szenario-Texte zeigen, **damit** das Spiel nicht bei Level 10 endet.

**Akzeptanzkriterien:**
- `EXTENDED_SCENARIOS` aus data-scenarios.js wird in scene-game.js beim Szenario-Lookup verwendet
- `<script>`-Tag für data-scenarios.js steht in index.html vor scene-game.js
- Level 11–15 zeigen sichtbaren Szenario-Text (kein leerer Screen, keine undefined-Ausgabe)
- level-manager.js Level-Index ist korrekt (kein Off-by-One bei Weltgrenzen)
- Kein JavaScript-Fehler beim Laden von Level 11, 20, 50, 100

**Technische Tasks:**
- index.html Script-Reihenfolge prüfen und korrigieren
- scene-game.js: Szenario-Lookup um `EXTENDED_SCENARIOS`-Zweig erweitern
- level-manager.js: Level-Indexierung für Level 11–100 prüfen
- Stichprobentest: Level 11, 21, 50, 91 je einmal laden

**Definition of Done:** Mindestens Level 11–20 zeigen Szenario-Content ohne Konsolenfehler.

---

### Story 1.4 — scene-menu.js Return-Objekt ergänzen

**Als** Entwickler:in **will ich**, dass `SceneMenu.init()` einen definierten Rückgabewert hat, **damit** Promise-Chaining und Aufrufcode korrekt funktionieren.

**Akzeptanzkriterien:**
- `SceneMenu.init()` gibt ein Objekt oder Promise zurück (kein implizites undefined)
- Alle Aufrufstellen von `SceneMenu.init()` verwenden den Rückgabewert korrekt
- Menü lädt ohne Race-Condition-Fehler nach Kaltstart
- Kein unhandled Promise rejection in der Konsole beim Menü-Load

**Technische Tasks:**
- scene-menu.js: Return-Statement ergänzen (synchron: Objekt; asynchron: Promise.resolve())
- main.js: Aufruf von SceneMenu.init() auf korrekte Awaitable-Nutzung prüfen
- scene-manager.js (falls vorhanden): selbe Prüfung

**Definition of Done:** Menü lädt in 3 aufeinanderfolgenden Kaltstart-Tests ohne Konsolenfehler.

---

## Epic 2: Spielerlebnis verbessern

**Kontext:** Das Framework ist vorhanden, aber die Qualität des Erlebnisses ist generisch. Szenarien müssen österreichische Realität widerspiegeln, Rollenunterschiede müssen strategisch spürbar sein.

### Story 2.1 — Szenario-Texte für Level 1–3 auf österreichischen Kontext anpassen

**Als** Schüler:in in Österreich **will ich**, dass die Szenarien Situationen beschreiben, die ich kenne oder die realistisch für Österreich sind, **damit** ich das Spiel als relevant empfinde.

**Akzeptanzkriterien:**
- Level 1–3 (Welt 1, Gemeinde) verwenden österreichische Orte, Institutionen und Bezeichnungen (Gemeinderat, Bezirk, Magistrat, statt generischer Begriffe)
- Kein Szenario-Text enthält generische Platzhalter (z.B. "City X", "Company A")
- Mindestens eine Lehrkraft hat die Texte auf didaktische Eignung geprüft
- Szenario-Texte sind für Schüler:innen ab 14 Jahren verständlich (keine Fachtermini ohne Kontext)
- Choice-Optionen haben unterschiedlich formulierte Konsequenzen — keine zwei Optionen klingen gleich

**Technische Tasks:**
- data-scenarios.js Level 1–3: Texte überarbeiten
- Review durch Fachexpert:in (Politikbildung)
- Testlesung mit einer Schulklasse oder Testgruppe

**Definition of Done:** Externer Review abgeschlossen, Texte im Repository, keine Platzhalter im spielbaren Bereich.

---

### Story 2.2 — Rollenunterschiede strategisch sichtbar machen

**Als** Spieler:in der Rolle "Journalist:in" **will ich**, dass ich andere Optionen sehe als ein Spieler in der Rolle "Beamter:in", **damit** die Rollenwahl strategisch relevant ist und nicht nur kosmetisch.

**Akzeptanzkriterien:**
- In jedem Level 1–3-Szenario hat mindestens eine Rolle eine exklusive Option, die anderen nicht zur Verfügung steht
- Die Rollenbeschreibung auf dem Rollenauswahl-Screen erklärt in einem Satz, was die Stärke dieser Rolle ist
- Level-Complete-Screen zeigt rollenspezifisches Feedback ("Als Journalist:in hättest du noch die Option X gehabt...")
- Alle 6 Rollen wurden mindestens einmal von einer Testperson komplett durchgespielt

**Technische Tasks:**
- role-system.js: Rollenspezifische Option-Filter-Logik implementieren
- data-scenarios.js: Szenario-Schema um `roleOptions`-Feld erweitern
- choice-processor.js: Rollenfilter beim Rendern der Optionen anwenden

**Definition of Done:** 6 Rollen × 3 Level = 18 Durchläufe zeigen je mindestens eine rollenspezifische Option.

---

### Story 2.3 — Konsequenzen sichtbarer machen (nicht nur Score-Änderung)

**Als** Spieler:in **will ich** nach meiner Entscheidung eine konkrete Erzählung sehen (was ist passiert?), nicht nur eine Zahl, **damit** ich das demokratische Lernerlebnis nachvollziehen kann.

**Akzeptanzkriterien:**
- Jede Entscheidung zeigt einen kurzen Konsequenz-Text (2–4 Sätze), was in der Spielwelt passiert ist
- Der Level-Complete-Screen zeigt eine Zusammenfassung aller Entscheidungen und ihrer Folgen
- XP-Änderung ist mit konkretem Grund beschriftet (nicht: "+50 XP", sondern: "+50 XP — du hast einen Kompromiss ermöglicht")
- Konsequenz-Texte sind rollensensitiv: dieselbe Entscheidung beschreibt die Folge aus Rollenperspektive

**Technische Tasks:**
- choice-processor.js: `consequence`-Feld aus Szenario-Daten auslesen und rendern
- data-scenarios.js: Consequence-Texte für alle Level 1–3-Szenarien ergänzen
- level-complete-screen Template: Entscheidungs-Zusammenfassung einbauen

**Definition of Done:** Kein Szenario in Level 1–3 zeigt nach Entscheidung nur eine Zahl ohne Text.

---

## Epic 3: Babylon.js Worldmap Migration

**Kontext:** Three.js r128 ist veraltet. Die Worldmap ist der einzige 3D-Screen, der von Three.js abhängt. Babylon.js schrittweise einführen — zuerst als Prototyp, dann als Ersatz.

### Story 3.1 — Babylon.js Worldmap Prototyp (read-only, keine Interaktion)

**Als** Entwickler:in **will ich** einen funktionierenden Babylon.js-Prototyp der Worldmap haben, **damit** ich die API und Performance für den Produktionseinsatz einschätzen kann.

**Akzeptanzkriterien:**
- `v2/js/scene-worldmap-babylon.js` existiert und rendert die 10 Welten als 3D-Objekte
- Der Prototyp läuft parallel zur bestehenden Three.js-Worldmap (kein Ersatz noch)
- FPS ≥ 30 auf einem Mittelklasse-Laptop (nicht Gaming-Hardware)
- Der Code nutzt Babylon.js AssetContainer für Wiederverwendbarkeit
- Keine Memory Leaks beim Wechsel zwischen Worldmap und Game-Screen

**Technische Tasks:**
- Babylon.js CDN-Tag in index.html ergänzen (mit SRI-Hash)
- scene-worldmap-babylon.js: 10 Welten als Mesh-Objekte, Kamera-Setup, einfaches Licht
- Performance-Messsung mit performance-monitoring.html

**Definition of Done:** Prototyp läuft 5 Minuten ohne Absturz oder Memory-Wachstum auf Testgerät.

---

### Story 3.2 — Worldmap-Interaktion in Babylon.js (Welt auswählen)

**Als** Spieler:in **will ich** auf ein Weltobjekt in der 3D-Worldmap klicken und damit die Welt auswählen, **damit** die Navigation intuitiv und visuell befriedigend ist.

**Akzeptanzkriterien:**
- Klick auf Welt-1-Objekt navigiert korrekt zum Level-1-Screen
- Hover-Effekt zeigt Weltname und freigeschalteten Level-Stand
- Gesperrte Welten sind visuell unterscheidbar (grau/reduzierte Emissivität)
- Interaktion funktioniert auf Touch-Geräten (Tablet-Support)
- EventBus-Integration: Weltauswahl wird als Event veröffentlicht, nicht direkt im Babylon-Code behandelt

**Technische Tasks:**
- Babylon.js PointerObservable für Klick-Erkennung
- EventBus.emit('world-selected', { worldId }) implementieren
- UIManager: Listener auf 'world-selected' für Screen-Transition

**Definition of Done:** Vollständiger Flow Worldmap → Welt auswählen → Level-Screen funktioniert mit Babylon.js Worldmap.

---

### Story 3.3 — Three.js entfernen und Babylon.js als einzige 3D-Library

**Als** Entwickler:in **will ich** Three.js aus dem Projekt entfernen, **damit** wir keine zwei 3D-Libraries parallel warten müssen.

**Akzeptanzkriterien:**
- `scene-worldmap.js` (Three.js) ist aus index.html entfernt
- Three.js CDN-Tag ist aus index.html entfernt
- Alle Three.js-Referenzen im Code sind ersetzt oder entfernt
- Worldmap-Funktionalität ist vollständig in scene-worldmap-babylon.js reimplementiert
- Kein `THREE` im globalen Namespace nach Page-Load

**Technische Tasks:**
- Three.js-Abhängigkeiten vollständig inventarisieren (grep über alle v2/js/-Dateien)
- scene-worldmap.js Archivieren (nicht löschen — als Referenz behalten)
- index.html bereinigen

**Definition of Done:** Keine Three.js-Referenzen im aktiven Code. Worldmap funktioniert ausschließlich mit Babylon.js.

---

## Epic 4: Teacher Mode ausbauen

**Kontext:** Das TeacherDashboard ist ein Stub. Teacher Mode ist ein Hauptargument für Schulen. Ohne echten Teacher Mode ist das Spiel für den Bildungsmarkt nur halb vermarktbar.

### Story 4.1 — Teacher-Session initialisieren (anonymous, local-first)

**Als** Lehrkraft **will ich** eine Unterrichtssitzung starten können, die lokal alle Entscheidungen der Klasse speichert, **damit** ich nach dem Spiel eine Diskussionsgrundlage habe.

**Akzeptanzkriterien:**
- Teacher-Screen ist über das Hauptmenü zugänglich (kein easter egg, kein versteckter Pfad)
- Sitzungsstart generiert eine anonyme Klassen-ID (kein Personenbezug)
- Alle Entscheidungen (Rolle, Level, gewählte Option, Timestamp) werden in localStorage gespeichert
- Sitzungslog ist nach Browser-Reload noch vorhanden (solange localStorage nicht geleert wird)
- DSGVO-Hinweis ist beim Sitzungsstart sichtbar: was wird gespeichert, wo, wie lange

**Technische Tasks:**
- teacher-session.js neu anlegen (aus teacher-dashboard.js herauslösen)
- main.js: TeacherSession.init() korrekt aufrufen
- SaveSystem: Teacher-Session-Log als separater Eintrag neben Spielstand

**Definition of Done:** Lehrkraft kann Sitzung starten, drei Level spielen, und danach den Log einsehen — alles ohne Backend.

---

### Story 4.2 — Diskussionsimpulse pro Level im Teacher-Screen

**Als** Lehrkraft **will ich** nach jedem Level Diskussionsfragen sehen, die ich direkt in der Klasse nutzen kann, **damit** das Spiel Anlass für echte demokratische Gespräche wird.

**Akzeptanzkriterien:**
- Jedes Level hat mindestens 2 Diskussionsfragen im Szenario-Schema
- Teacher-Screen zeigt diese Fragen nach Level-Abschluss
- Die Fragen sind offen formuliert (kein "Welche Antwort ist richtig?" — sondern "Was hätte die andere Entscheidung bedeutet?")
- Diskussionsfragen sind auf Lehrkraft-Niveau formuliert (nicht für Schüler:innen direkt)

**Technische Tasks:**
- data-scenarios.js: `teacherHooks`-Feld zu Level-Schema ergänzen
- templates.js (oder neues teacher-template.js): Teacher-Screen-Markup mit Diskussionsfragen
- teacher-session.js: Diskussionsfragen aus aktuellem Level auslesen

**Definition of Done:** Level 1–3 Szenarios haben je 2 Diskussionsfragen, die im Teacher-Screen korrekt angezeigt werden.

---

### Story 4.3 — Sitzungslog exportieren (JSON, ohne Personenbezug)

**Als** Lehrkraft **will ich** nach einer Unterrichtseinheit den Sitzungslog exportieren können, **damit** ich ihn für Nachbesprechungen oder Dokumentation nutzen kann.

**Akzeptanzkriterien:**
- "Export" erzeugt eine JSON-Datei als Download
- Die Datei enthält: Klassen-ID (anonym), Welten gespielt, Level gespielt, Rollen-Verteilung, häufigste Entscheidungen je Level
- Keine personenbezogenen Daten (kein Name, keine IP, keine individuellen Spieler-IDs)
- Vor dem Export wird ein DSGVO-Hinweis angezeigt und muss bestätigt werden
- Die Datei ist direkt in einem Texteditor lesbar (strukturiertes JSON, nicht base64)

**Technische Tasks:**
- teacher-session.js: exportAsJSON() Methode
- DSGVO-Consent-Dialog vor Export
- DOM: Download-Button im Teacher-Screen

**Definition of Done:** Export-Funktion erzeugt valide JSON-Datei ohne PII. DSGVO-Hinweis erscheint vor dem Download.

---

## Epic 5: Analytics und Persistenz

**Kontext:** Aktuell kein echtes Analytics. SaveSystem ist vorhanden aber nicht für Auswertungen genutzt. Alle Analytics müssen local-first und consent-gated sein (DSGVO).

### Story 5.1 — Analytics-Stub zu echtem local-first Analytics ausbauen

**Als** Entwickler:in **will ich** Spielereignisse lokal und consent-gated aufzeichnen können, **damit** spätere Auswertungen (ohne personenbezogene Daten) möglich sind.

**Akzeptanzkriterien:**
- analytics.js ist kein No-Op mehr, sondern speichert Events in localStorage unter einem separaten Key
- Event-Schema: `{ event: string, worldId: number, levelId: number, roleId: string, timestamp: number }`
- Kein Event wird gespeichert bevor der Spieler:in explizit zugestimmt hat (Opt-in, nicht Opt-out)
- Consent-State wird persistent gespeichert
- `AnalyticsManager.flush()` löscht alle gespeicherten Events aus localStorage

**Technische Tasks:**
- analytics.js: Event-Speicherung mit Consent-Guard
- Consent-Dialog (nicht modal-blocking, aber deutlich sichtbar)
- settings-screen.js: Opt-out-Möglichkeit jederzeit

**Definition of Done:** Analytics speichert Events nur nach Opt-in. Kein Event im localStorage ohne Consent.

---

### Story 5.2 — Save-State-Migration für künftige Schema-Änderungen absichern

**Als** Spieler:in **will ich**, dass mein Spielstand nach einem Update nicht verloren geht, **damit** ich nicht von vorne beginnen muss.

**Akzeptanzkriterien:**
- SaveSystem hat eine Versions-Property im Speicher-Schema
- Bei Version-Mismatch wird eine Migration ausgeführt (nicht silent-überschrieben)
- Wenn Migration nicht möglich: Spieler:in sieht eine Meldung und kann den Spielstand manuell löschen
- Schema-Version wird bei jeder Änderung am Szenario-Schema oder SaveSystem inkrementiert
- Unittest (oder manueller Test): Alter Spielstand wird nach Update korrekt migriert

**Technische Tasks:**
- save-system.js: Migrations-Stub zu echter Migrations-Logik ausbauen (Version 1 → 2 definieren)
- Migrations-Dokumentation in einem Kommentar im Code

**Definition of Done:** Spielstand von Version 1 wird nach Update auf Version 2 korrekt geladen ohne Datenverlust.

---

### Story 5.3 — Aggregierte Sitzungsauswertung (ohne Backend)

**Als** Lehrkraft **will ich** sehen, welche Entscheidungen in einer Klasse am häufigsten getroffen wurden, **damit** ich Diskussionen auf konkrete Spielverläufe stützen kann.

**Akzeptanzkriterien:**
- Teacher-Screen zeigt nach Sitzungsende: häufigste gewählte Option je Level, Rollen-Verteilung, durchschnittliche Entscheidungsdauer
- Alle Daten kommen aus lokalem localStorage — kein Netzwerk-Request
- Darstellung ist für Lehrkräfte lesbar (Klartext, kein Code)
- Auswertung funktioniert auch wenn weniger als 5 Entscheidungen gespeichert sind (kein division-by-zero)

**Technische Tasks:**
- teacher-session.js: aggregateSession() Methode
- templates.js: Auswertungs-Template für Teacher-Screen

**Definition of Done:** Nach 3 gespielten Leveln zeigt Teacher-Screen eine verständliche Auswertung.

---

## Epic 6: Accessibility und Performance

**Kontext:** Schulen haben heterogene Geräte (ältere Laptops, Tablets). Accessibility ist kein Nice-to-have sondern eine rechtliche und ethische Anforderung für NGO-Produkte.

### Story 6.1 — Keyboard-Navigation für alle Screen-Übergänge

**Als** Schüler:in mit motorischer Einschränkung **will ich** das Spiel komplett mit der Tastatur bedienen können, **damit** ich nicht benachteiligt werde.

**Akzeptanzkriterien:**
- Alle interaktiven Elemente (Buttons, Choice-Optionen, Rollenauswahl) sind per Tab erreichbar
- Enter/Space aktiviert fokussierte Buttons
- Fokus-Reihenfolge ist logisch (nicht zufällig durch DOM-Reihenfolge bestimmt)
- Visible Focus-Indicator ist sichtbar (kein outline: none ohne Ersatz)
- Vollständiger Spieldurchlauf Level 1 ist ohne Maus möglich

**Technische Tasks:**
- HTML-Semantik prüfen (Button vs. div mit click-listener)
- tabindex-Attribute wo nötig
- Focus-Management bei Screen-Übergängen (nach Transition: erster focusbarer Element fokussieren)

**Definition of Done:** Level 1 vollständig ohne Maus spielbar, kein Fokus-Trap.

---

### Story 6.2 — Reduced Motion und Low-Graphics-Modus

**Als** Schüler:in mit Epilepsie oder auf einem Low-End-Gerät **will ich**, dass das Spiel keine aggressiven Animationen zeigt und auf schwacher Hardware läuft, **damit** ich partizipieren kann.

**Akzeptanzkriterien:**
- `prefers-reduced-motion` Media Query wird respektiert: Übergänge sind sofort statt animiert
- Low-Graphics-Toggle im Settings-Screen: Babylon.js-Scene wird in 2D-Fallback gewechselt
- Low-Graphics-Modus speichert sich persistent (bleibt nach Reload aktiv)
- FPS ≥ 20 im Low-Graphics-Modus auf Geräten von 2018 oder neuer

**Technische Tasks:**
- CSS: `@media (prefers-reduced-motion: reduce)` Regel für alle GSAP-Animationen
- settings-screen.js: Low-Graphics-Toggle
- babylon-engine.js (oder scene-worldmap-babylon.js): Modus-Switch auf 2D-Fallback

**Definition of Done:** Reduced Motion-Systemeinstellung deaktiviert alle nicht-notwendigen Animationen. Low-Graphics-Toggle funktioniert und wird gespeichert.

---

### Story 6.3 — ARIA-Labels und Screen-Reader-Kompatibilität

**Als** Schüler:in die einen Screen-Reader nutzt **will ich**, dass Spielzustand und Entscheidungsoptionen vorgelesen werden, **damit** ich vollständig am Spiel teilnehmen kann.

**Akzeptanzkriterien:**
- Alle Choice-Buttons haben beschreibende aria-label-Attribute
- Screen-Titel werden bei Transition per aria-live="polite" angekündigt
- Szenario-Text ist ohne Maus-Hover zugänglich
- Rollen-Auswahl-Screen: Rollenname und Rollenbeschreibung sind als semantischer Text (nicht als div-Text ohne Semantik) vorhanden
- Test mit NVDA oder VoiceOver: Level 1 kann vollständig gespielt werden

**Technische Tasks:**
- HTML-Audit aller Screen-Templates auf ARIA-Attribute
- aria-live-Region für Screen-Transitions anlegen
- Manuellem Screen-Reader-Test mit NVDA (Windows) nach Implementation

**Definition of Done:** NVDA-Test Level 1 bestanden. Kein kritischer Barrierefreiheits-Fehler in axe-Browsertest.

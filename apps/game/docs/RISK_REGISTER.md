# Risk Register — Brücken Bauen 3D
Stand: 2026-03-22 | v2-Codebase (apps/game/v2/)

Wahrscheinlichkeit: Hoch / Mittel / Niedrig
Impact: Kritisch / Hoch / Mittel / Niedrig

---

## Technische Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| Three.js → Babylon.js Migration erzeugt Regressionen im Screen-Flow | Mittel | Hoch | Migration strikt auf Worldmap-Screen beschränken. Kein Eingriff in DOM-basierte Screens (game, level-complete, teacher). EventBus-Grenze klar definieren. Regressions-Test nach jeder Migrations-Phase. |
| CDN-Ausfall (Three.js, GSAP, Howler.js, Babylon.js) macht Spiel unspielbar | Hoch | Kritisch | SRI-Hashes sofort eintragen. Mittelfristig: Bibliotheken lokal hosten oder npm-Bundle einführen. Besonders kritisch in Schulnetzwerken mit Content-Filtern. |
| Ladereihenfolge-Bug durch globalen Namespace bei wachsender Dateianzahl | Hoch | Hoch | Minimales FSM-Modul einführen das explizite Initialisierungs-Reihenfolge erzwingt. Langfristig: ES-Module oder IIFE-Wrapper. |
| Babylon.js Memory Leak beim wiederholten Wechsel Worldmap ↔ Game-Screen | Mittel | Hoch | Observer-Listener beim Scene-Dispose abbauen. AssetContainer.dispose() korrekt aufrufen. Performance-Test: 20 Wechsel in Folge messen (Heap-Wachstum darf nicht linear sein). |
| analytics.js Stub bricht zukünftige echte Analytics-Integration | Mittel | Mittel | Stub-Interface jetzt dokumentieren (track, flush, getSession). Keine Aufrufstellen direkt auf Implementierungs-Details zugreifen lassen. |
| Save-State-Inkompabilität nach Schema-Änderung | Hoch | Hoch | Versions-Migration in save-system.js sofort implementieren. Schema-Version bei jeder Änderung inkrementieren. Migrations-Pfad in Code dokumentieren. |

---

## Gameplay-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| 100-Level-Versprechen ohne Content enttäuscht Nutzer:innen | Hoch | Kritisch | Level-Anzeige in UI auf tatsächlich verfügbare Level beschränken. Nicht alle 100 Level ankündigen bevor sie existieren. Vertikalen Slice (10 Level) vorrang vor Breite (100 leere Level). |
| Rollenunterschiede zu kosmetisch — kein strategischer Mehrwert | Hoch | Hoch | Rollenspezifische Optionen in Szenarien sind Pflicht ab Phase 2. Playtest mit je zwei Spieler:innen in verschiedenen Rollen: Unterschied muss ohne Erklärung spürbar sein. |
| Wiederholungsproblem: nach 3 Level fühlt sich jedes Szenario gleich an | Mittel | Hoch | Choice-Typ-Verteilung pro Welt strikt diversifizieren (Content Matrix). Konsequenz-Texte rollensensitiv formulieren. Level-Dramaturgie explizit planen (Einstieg → Aufbau → Konflikt → Meister). |
| Level-Complete-Screen zu transaktional (nur Score-Anzeige) | Hoch | Mittel | Konsequenz-Text und Debrief-Reflexion in Level-Complete einbauen (Epic 2, Story 2.3). XP-Änderung mit konkretem Grund beschriften. |
| Ignore-Choice-Typ hat keine spürbaren Folgen | Mittel | Hoch | choice-processor.js: ignore muss immer eine konsequenz-behaftete Weiterentwicklung auslösen. "Nichts tun" ist eine Entscheidung mit Folgen — das ist der pädagogische Kern. |

---

## Didaktik-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| Szenario-Texte zu schulbuchartig — Schüler:innen schalten ab | Hoch | Kritisch | Texte müssen konkret, österreichisch und im jeweiligen Lebenskontext verankert sein (Schule, Gemeinde, Arbeit). Externe Überprüfung durch Politikbildungsexpert:in und Testgruppe vor Phase 3. |
| Moralische Vereinfachung: es gibt immer eine "richtige" Antwort | Hoch | Hoch | Szenario-Review-Prozess: jedes Szenario muss mindestens zwei vertretbare Optionen haben. Debrief darf keine Option als "falsch" kennzeichnen — nur Konsequenzen aufzeigen. Teacher-Hooks mit offenen Reflexionsfragen. |
| Sensible Themen (Gesundheit, Gerechtigkeit, Europa) zu flach behandelt | Mittel | Hoch | Pro Welt: Content-Review durch Fachexpert:in (Gesundheitsethik, Rechtswissenschaft, Europapolitik). Teacher-Hooks und Schutzsprache für triggernde Themen verpflichtend in Szenario-Schema. |
| Demokratische Frustration führt zu Frustrations-Abbruch statt Reflexion | Mittel | Mittel | Deliberate Difficulty Design: Level 7–9 sollen Ohnmachtsgefühl erzeugen — aber Level-Complete muss danach Handlungsoptionen aufzeigen. Kein Level darf mit "du hast verloren, demokratisch geht das nicht" enden. |
| Teacher Mode wird zum Überwachungstool statt Reflexionshilfe | Niedrig | Hoch | Teacher-Session-Daten zeigen immer nur aggregierte Klassenansicht, nie individuelle Spielerprofile. Keine Einzelzuordnung technisch möglich (keine individuelle Spieler-ID in der Session). |

---

## Performance-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| WebGL nicht verfügbar auf Low-End-Schul-Tablets | Hoch | Kritisch | 2D-Fallback-Modus als echte Alternative (nicht degradierter Modus) implementieren. Worldmap ohne Babylon.js muss für Tablets funktionieren. Feature-Detection beim Start: `if (!BABYLON.Engine.isSupported())` → 2D-Fallback. |
| Babylon.js Bundle zu groß — initiale Ladezeit > 5 Sekunden auf langsamem Schulnetz | Hoch | Hoch | Babylon.js Core verwenden, nicht Full-Bundle. Lazy-Loading: Babylon.js erst laden wenn Worldmap-Screen tatsächlich aufgerufen wird (nicht beim initial page load). |
| localStorage voll (Szenario-Daten + SaveGame + Analytics + Teacher-Log) | Niedrig | Mittel | localStorage-Quota: realistisch 5–10 MB. Szenario-Daten gehören nicht in localStorage. Speicherverbrauch beim Teacher-Log limitieren (max. X Sessions, dann rolling delete). |
| GSAP-Animationen erzeugen Jank auf Low-End-Geräten | Mittel | Mittel | `prefers-reduced-motion` respektieren. Alle GSAP-Animationen auf `will-change: transform` und Compositor-Layer-Eigenschaften beschränken. |

---

## DSGVO-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| localStorage-Spielstand enthält unbeabsichtigt personenbezogene Daten | Niedrig | Kritisch | Save-State-Schema-Audit: kein Name, keine E-Mail, keine IP, keine deviceID. Technisch: kein Pflicht-Input bei Spielstart. SaveSystem darf nur Spielzustand (Welt, Level, Rolle, XP) speichern. |
| Analytics-Tracking ohne Opt-in (DSGVO Art. 6) | Hoch | Kritisch | Analytics.js muss harten Consent-Guard haben. Kein Event wird gespeichert vor expliziter Einwilligung. Consent-State in localStorage — nicht im Spielstand vermischen. |
| Teacher-Export enthält mehr Daten als angegeben | Mittel | Hoch | Vor Export-Feature: DSGVO-Datenschutz-Impact-Assessment für Teacher-Session-Daten. Export-Funktion von Datenschutzexpert:in prüfen lassen. Datenschutzerklärung auf der Seite aktualisieren. |
| Teacher-Mode driftet in Schüler:innen-Überwachung | Niedrig | Kritisch | Technische Maßnahme: keine individuelle Spieler-ID in Session-Log — nur anonyme Rollen-Aggregation. Keine Speicherung von Entscheidungszeitpunkten pro Person. Nur Klassenebene-Aggregation. |
| CDN-Bibliotheken laden Tracking-Skripte (jsDelivr, cdnjs, unpkg) | Mittel | Hoch | SRI-Hashes sichern Integrität, verhindern aber kein CDN-seitiges Tracking. Lösung: Bibliotheken selbst hosten (Phase 3). Datenschutzerklärung muss CDN-Nutzung und mögliche Datenübertragung in Drittstaaten erwähnen. |

---

## Scope-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| Feature-Bloat: Echtzeit-Multiplayer vor stabiler Singleplayer-Basis | Hoch | Hoch | Phasen-Gate: Phase 4 beginnt erst wenn Phase 3 deployed und stabil ist. Multiplayer ist explizit Post-MVP. Kein Code für Multiplayer-Infrastruktur vor Phase 3-Abschluss. |
| Zu viele Welten gleichzeitig geöffnet — Content-Qualität sinkt | Hoch | Hoch | Nicht mehr als zwei neue Welten gleichzeitig in Entwicklung. Welt 1 (Gemeinde) muss Referenzqualität erreichen bevor Welt 2–3 beginnen. |
| "AAA-Visuals"-Anforderungen an Babylon.js (Shader, Partikel, Motion Blur) | Mittel | Hoch | Babylon.js-Einsatz ist auf Worldmap und Weltzustandsvisualisierung begrenzt. Keine AAA-Effekte im Kernspiel-Flow — die Entscheidungen sind das Produkt, nicht die Grafik. Budget für visuelle Komplexität bewusst limitieren. |
| Technische Schulden in v2 werden nicht abgebaut | Hoch | Mittel | v2 explizit als "nicht reparieren"-Pfad kennzeichnen. Root-App ist der Produktionspfad. v2 als Ideenarchiv behalten, aber keine neuen Features dort implementieren. |
| Abhängigkeit von einer einzelnen Entwicklungsperson ohne Dokumentation | Hoch | Kritisch | Code-Kommentare und dieses Docs-Verzeichnis als Pflicht-Dokumentation. Jede neue Datei muss Zweck im Datei-Header dokumentiert haben. Phase 1-Fixes müssen nachvollziehbar kommentiert sein. |

# Implementation Roadmap — Brücken Bauen 3D
Stand: 2026-03-22 | v2-Codebase (apps/game/v2/)

---

## Phase 1: Critical Fixes
**Zeitrahmen: 1–2 Tage | Ziel: Spiel lädt und ist grundlegend spielbar**

### Was zu reparieren ist

| Fix | Datei | Aufwand |
|---|---|---|
| analytics.js Stub anlegen | apps/game/v2/js/ neu anlegen | 15 Min. |
| DOM-ID `role-selection` → `role-select-screen` | ui-screens.js Z.60 + alle weiteren Vorkommen | 5 Min. |
| `EXTENDED_SCENARIOS` in scene-game.js einbinden | scene-game.js + Reihenfolge in index.html | 30 Min. |
| `SceneMenu.init()` Return-Objekt ergänzen | scene-menu.js | 20 Min. |
| SRI-Hashes für CDN-Skripte eintragen | index.html (Three.js, GSAP, Howler.js) | 30 Min. |
| TeacherDashboard entweder initialisieren oder Script-Tag entfernen | main.js + index.html | 20 Min. |

**Gesamtaufwand Phase 1: 2–3 Stunden effektiv**

### Abhängigkeiten
- Keine — diese Fixes sind unabhängig voneinander ausführbar.

### Risiken
- analytics.js Stub muss dieselbe Interface-Signatur haben wie zukünftiger echter AnalyticsManager, sonst spätere Integration aufwändig. Minimalinterface dokumentieren: `track(event, data)`, `flush()`, `getSession()`.
- Extended Scenarios müssen auf korrekte Welt/Level-Kombination geprüft werden — potenziell Off-by-One-Fehler in der Indexierung.

### Akzeptanzkriterien Phase 1
- Browserkonsole zeigt keine 404-Fehler beim Laden von index.html
- Klick auf "Rolle wählen" öffnet den Rollenauswahl-Screen (vorher: null-Referenz-Fehler)
- Level 11–15 zeigen Szenario-Text (vorher: leer)
- `SceneMenu.init()` gibt ein auswertbares Objekt oder Promise zurück
- Alle `<script>`-Tags für CDN-Bibliotheken haben SRI-Attribute

---

## Phase 2: Vertical Slice
**Zeitrahmen: 1–2 Wochen | Ziel: Welt 1 (Gemeinde), Level 1–3, vollständig spielbar**

### Umfang

Ein vollständiger Durchlauf ist möglich:
- Hauptmenü → Rollenauswahl (alle 6 Rollen wählbar, Unterschiede sichtbar) → Weltkarte (Welt 1 auswählbar) → Level 1 spielen → Entscheidung treffen → Konsequenz sehen → Level-Complete-Screen → Zurück zur Weltkarte → Level 2 → Level 3.
- SaveSystem speichert Fortschritt, Resume nach Browser-Reload funktioniert.
- Teacher-Screen zeigt für Level 1–3 mindestens: welche Entscheidungen getroffen wurden, welche Rolle gespielt wurde.

**Babylon.js Prototyp für Worldmap (in dieser Phase als optionale Parallelspur):** Wenn Kapazität vorhanden, kann eine statische Babylon.js-Szene für die Weltkarte gebaut werden, die parallel zur bestehenden Three.js-Worldmap läuft — noch kein Ersatz, nur Prototyp zum Erproben der API.

### Aufwand
- Level 1–3 Szenario-Texte auf österreichischen Kontext anpassen: 1–2 Tage
- Rollenunterschiede in Szenarien sichtbar machen (andere verfügbare Optionen je Rolle): 2–3 Tage
- Babylon.js Worldmap Prototyp (nur Welt 1): 1–2 Tage (optionale Parallelspur)
- Teacher-Screen minimaler Datenabruf: 1 Tag
- Durchgängiger Flow-Test (alle 6 Rollen × Level 1–3): 1 Tag

**Gesamtaufwand Phase 2: 6–9 Tage**

### Abhängigkeiten
- Phase 1 muss abgeschlossen sein (DOM-ID-Fix, analytics.js Stub, scene-menu.js Return)
- Szenario-Daten für Level 1–3 müssen qualitativ fertig sein

### Risiken
- Rollenunterschiede sind schwer zu balancieren — ein Playtest-Durchlauf mit echten Nutzer:innen (z.B. eine Schulklasse) schärft das besser als internes Testing.
- Babylon.js Prototyp kann Scope creep erzeugen. Strikt zeitboxen: maximal 2 Tage für den Prototyp, kein Feature-Ausbau.

### Akzeptanzkriterien Phase 2
- Eine Person ohne Vorkenntnisse kann Welt 1 Level 1–3 vollständig durchspielen
- Alle 6 Rollen sind wählbar und zeigen im Level mindestens eine rollenspezifische Option
- Save/Resume funktioniert zuverlässig über Browser-Reload
- Teacher-Screen zeigt auswertbaren Sitzungslog für Level 1–3
- Keine JavaScript-Fehler in der Konsole während eines normalen Durchlaufs

---

## Phase 3: MVP
**Zeitrahmen: 4–6 Wochen nach Phase 2 | Ziel: Alle 10 Welten Level 1–3, Teacher Mode basic**

### Umfang

- Alle 10 Welten freigeschaltet (oder progressiv: ab Welt 2 nach Abschluss von Welt 1 Level 1–3)
- Je Welt: Level 1–3 vollständig mit Szenario-Text, mindestens 2–3 rollenspezifische Optionen
- Teacher Mode: Klassen-Session starten, anonymisierten Export (JSON) nach Sitzungsende
- Worldmap: Babylon.js vollständig eingeführt als Ersatz für Three.js-Worldmap
- AchievementSystem: Mindestens 5 Achievements über alle 10 Welten
- ProgressionSystem: XP korrekt berechnet, Weltfreischaltung getestet

### Aufwand
- Szenario-Texte für Welten 2–10, Level 1–3 (27 neue Level × ~3 Szenarien): 15–20 Tage (Content-Hauptaufwand)
- Teacher Mode Basis: Klassen-ID (anonym), Sitzungslog, Export-Button: 3–4 Tage
- Babylon.js Worldmap vollständig ersetzen: 3–5 Tage
- Achievement + Progression vollständig testen: 2–3 Tage

**Gesamtaufwand Phase 3: 25–35 Tage**

### Abhängigkeiten
- Szenario-Schema muss aus Phase 2 stabil und nicht mehr geändert werden
- Babylon.js Prototyp aus Phase 2 als Grundlage für vollständige Migration
- Teacher-Anforderungen mit mindestens einer Lehrkraft co-designed (kein rein technisches Durchraten)

### Risiken
- Content-Aufwand ist massiv unterschätzt: 27 Level × authentische österreichische Szenarien ist kein Nebenprodukt. Entweder Kooperationspartner (Vereine, Schulen, Politikbildungsexpert:innen) einbeziehen oder Scope reduzieren (nicht alle 10 Welten gleichzeitig).
- Teacher Mode ohne DSGVO-Prüfung nicht deployen — auch bei local-first localStorage gilt die Informationspflicht gegenüber Schüler:innen.

### Akzeptanzkriterien Phase 3
- 30 Level (alle 10 Welten × Level 1–3) sind vollständig spielbar
- Teacher Mode erlaubt anonymisierten Export ohne personenbezogene Pflichtdaten
- Babylon.js Worldmap läuft auf Chrome, Firefox, Safari (aktueller Stand) ohne Abstürze
- ProgressionSystem korrekt: XP-Anzeige, Level-Up-Animation, Weltfreischaltung
- Keine funktionalen Regression-Fehler gegenüber Phase 2 Vertical Slice

---

## Phase 4: Post-MVP
**Zeitrahmen: laufend nach MVP-Stabilisierung | Ziel: vollständige 100-Level-Erfahrung, Analytics, Multiplayer-Reflexion**

### Umfang

- Level 4–10 für alle Welten (70 Level zusätzlich — erheblicher Content-Aufwand)
- Volle Babylon.js-Integration: Weltzustand sichtbar in 3D-Darstellung (Track-Pillars, dynamische Szene)
- Analytics (consent-gated, local-first): Aggregierte Lernfortschritte, Klassen-Vergleiche ohne Personenbezug
- Multiplayer-Reflexion (asynchron): Klassenergebnisse vergleichen, Diskussionsimpulse für Gruppen
- Teacher Mode erweitert: Differenziertes Feedback, Lernziel-Tracking, CSV/PDF-Export
- Rollen-Mastery: Freigeschaltete Bonusmechaniken nach mehrfachem Spielen einer Rolle

### Aufwand
- 70 weitere Level: Größte Einzelinvestition, realistisch 60–80 Tage Content
- Babylon.js Track-Pillars und Zustandsvisualisierung: 5–8 Tage
- Asynchrone Multiplayer-Reflexion (kein Echtzeit-Multiplayer): 5–7 Tage
- Analytics mit Consent-Flow: 3–4 Tage
- Teacher Mode erweitert: 5–7 Tage

**Gesamtaufwand Phase 4: 80–110 Tage (ohne Content-Produktion)**

### Risiken
- Content-Produktion für 70 Level ohne externes Team ist nicht realistisch als Einzelprojekt
- Multiplayer-Reflexion braucht minimal eine Backend-Komponente (auch bei asynchronem Modell) — das erfordert DSGVO-Abklärung und Infrastruktur (FastAPI-Erweiterung des bestehenden Backends möglich)
- Scope creep ist hier das größte Risiko: Phase 4 darf nicht beginnen, bevor Phase 3 stabil und deployed ist

### Akzeptanzkriterien Phase 4
- Alle 100 Level spielbar (Qualitätsprüfung durch mindestens eine Lehrkraft pro Welt)
- Analytics DSGVO-Audit abgeschlossen, Datenschutzerklärung aktuell
- Babylon.js-Weltzustandsdarstellung reagiert sichtbar auf Spielentscheidungen
- Multiplayer-Reflexion: Klasse kann anonymisiert verglichen werden ohne Echtzeit-Infrastruktur

---

## Kritischer Pfad

```
Phase 1 (Fixes, 2 Tage)
  ↓
Phase 2 (Vertical Slice, 2 Wochen)
  ↓
[Playtest mit echter Schulklasse — Go/No-Go für Phase 3]
  ↓
Phase 3 (MVP, 5–7 Wochen)
  ↓
[Deploy + DSGVO-Prüfung Teacher Mode]
  ↓
Phase 4 (laufend, nach Kapazität)
```

Kein Schritt in Phase 3 beginnt, bevor Phase 2 den Playtest bestanden hat. Kein Schritt in Phase 4 beginnt, bevor Phase 3 deployed ist.

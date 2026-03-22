# BABYLON ARCHITECTURE PLAN
## Brücken Bauen 3D — Three.js r128 → Babylon.js Migration
**Version 2.0 | Stand: März 2026 | Dokument: Autoritativ**

---

## 1. Entscheidung

**Full Migration. Kein Hybrid.**

Three.js r128 wird vollständig durch Babylon.js 7.x ersetzt. Kein paralleler Betrieb beider Renderer.

---

## 2. Begründung der Full Migration (nicht Hybrid)

Ein Hybrid-Ansatz — Two-js für bestehende Szenen, Babylon.js für neue — erscheint pragmatisch, erzeugt aber drei unlösbare Probleme:

**Problem 1: Doppelter Speicherbedarf.** Two WebGL-Kontexte auf demselben Canvas ist nicht möglich. Zwei separate Canvas-Elemente bedeuten doppelten VRAM-Verbrauch. Auf Schulchromebooks mit 4 GB RAM ist das inakzeptabel.

**Problem 2: Zustandsinkonsistenz.** `GAME_STATE` und `EventBus` müssen von beiden Renderern konsumiert werden. Das erzeugt Synchronisationsprobleme die schwerer zu debuggen sind als eine komplette Migration.

**Problem 3: Kein Team.** Bei einem 1-2 Personen-Entwicklungsteam ist Hybrid-Architektur Wartungshölle. Full Migration ist einmalige Arbeit, Hybrid ist dauerhafte Komplexität.

**Warum Babylon.js und nicht Three.js weiter?**

Three.js r128 ist ohne npm nicht upgradefähig (CDN-Only im aktuellen Setup). Babylon.js bietet in derselben CDN-freundlichen Deployment-Form folgende relevante Features die Three.js nicht nativ anbietet:

| Feature | Three.js r128 (CDN) | Babylon.js 7.x (CDN) | Relevanz |
|---|---|---|---|
| GUI-System | Extern (dat.gui, etc.) | AdvancedDynamicTexture nativ | Hoch |
| Scene-Disposal | Manuell per Objekt | `scene.dispose()` komplett | Hoch |
| AssetContainer | Nicht vorhanden | Vollständig | Hoch |
| GlowLayer | Shader manuell | Nativ, 2 Zeilen | Mittel |
| ActionManager | Nicht vorhanden | Per-Mesh nativ | Mittel |
| Thin Instances | Nicht vorhanden | Nativ für 100+ Nodes | Mittel |
| Inspector | Extern, komplex | Nativ, Dev-Toggle | Niedrig |

---

## 3. Welche Babylon.js-Features bringen echten Mehrwert (kein Showcase)

### 3.1 World Map: Thin Instances für 100 Knoten

**Entscheidung: Ja, Thin Instances für die Welt-Knoten auf der Worldmap.**

Die Worldmap rendert 100 Level-Knoten (10 Welten × 10 Level). Bei normaler Instanzierung sind das 100 Draw Calls. Mit Thin Instances ist es ein Draw Call mit 100 Instanzdaten-Varianten.

Konkreter Einsatz:
- Sphere-Mesh als Basis, 100 Thin Instances
- Pro Instanz: Position (fest), Farbe via Instanz-Buffer (Welt-Farbe aus `CONFIG.WORLD_COLORS`), Skalierung (completed = 1.2x, locked = 0.8x)
- Hover-State: Kein Thin Instance wechsel — stattdessen HighlightLayer auf dem ausgewählten Mesh

```
// Pseudocode-Struktur (nicht implementierungsbereit)
const sphereMesh = MeshBuilder.CreateSphere("levelNode", { diameter: 0.8 }, scene);
sphereMesh.thinInstanceSetBuffer("matrix", matrixBuffer, 16);
sphereMesh.thinInstanceSetBuffer("color", colorBuffer, 4);
```

ActionManager pro Thin Instance ist **nicht** möglich (ActionManager funktioniert nicht auf Thin Instances). Stattdessen: Pointer-Events über `scene.onPointerObservable` mit Hit-Test gegen die Thin-Instance-Matrices.

**3D-Kugel für die Worldmap:** Nein. Eine 3D-Weltkugel ist Showcase, kein Mehrwert. Die Worldmap ist eine funktionale Regionskarte — 2.5D-Grid (leicht isometrisch) mit ArcRotateCamera in Top-Down-Modus. Spieler:innen sollen Regionen verstehen, keine 3D-Kugel rotieren.

### 3.2 Scene-Transitions: AdvancedDynamicTexture vs. HTML-Overlay

**Entscheidung: HTML-Overlay gewinnt für alle Textelemente und Formulare.**

Regel ohne Ausnahme: **Alles mit Text, Buttons, Formularen, Accessibility-Anforderung bleibt HTML/CSS DOM.**

Babylon AdvancedDynamicTexture wird ausschließlich für 3D-Welt-gebundene UI eingesetzt:
- Schwebende Label über Welt-Knoten auf der Worldmap (Welt-Name, Fortschritt)
- Kurzfristige Status-Anzeige im 3D-Raum ("+250 XP", Stern-Einblendung)
- Demokratie-Indikator-Balken der visuell im 3D-Raum schwebt

HTML-DOM für:
- Szenario-Text, Kontextbeschreibung
- Choice-Buttons (alle 4 Optionen)
- Debrief-Text, Reflexionsfragen
- Teacher-Mode (gesamter Screen)
- Settings, Navigation, alle Menüs
- Achievement-Meldungen
- Loading-Screens

**Begründung:** Screenreader, Keyboard-Navigation, Tab-Order, WCAG 2.1 AA — das alles funktioniert zuverlässig nur in HTML. AdvancedDynamicTexture ist kein Accessibility-Tool.

### 3.3 Szenario-Feedback: GlowLayer, HighlightLayer, ParticleSystem

**GlowLayer:** Aktiv für die Demokratie-Indikatoren auf der Worldmap. Die leuchtenden Säulen die den Weltzustand visualisieren sollen glühen. GlowLayer mit `intensity: 0.8`, `blurKernelSize: 64`. Einmalig erstellt, nicht pro Frame.

**HighlightLayer:** Eingesetzt beim Hover über Welt-Knoten auf der Worldmap und bei der aktiven Rollenauswahl in der Rollenwahl-Szene. Kein Einsatz im Szenario selbst (dort regiert HTML).

**ParticleSystem:** Nur bei zwei Ereignissen: Level-Abschluss mit 3 Sternen (kurze Partikel-Eruption, max. 200 Partikel, 2 Sekunden, dann dispose) und Welt-Freischaltung (länger, max. 500 Partikel, ebenfalls mit dispose nach Ende). **Kein permanentes Partikel-Ambient** — das kostet Performance für null pädagogischen Mehrwert.

### 3.4 AssetContainer und SceneLoader

**AssetContainer** wird für alle Scene-Preloads verwendet. Jede Szene hat einen eigenen AssetContainer der beim Übergang zur nächsten Szene disposed wird.

```
// Ladereihenfolge beim App-Start
1. MenuScene: AssetContainer lädt sofort (kein 3D-Content, nur Atmosphäre-Skybox)
2. WorldmapScene: AssetContainer lädt beim Übergang von Menu → Worldmap
3. GameScene: AssetContainer lädt beim Übergang von Worldmap → Level-Auswahl
```

Kein Preload aller Szenen beim Start. Das würde auf Schulchromebooks 8-12 Sekunden Ladezeit erzeugen.

---

## 4. Scene-Struktur

### Kanonischer Scene-Graph

```
BabylonApp (root, existiert für die gesamte App-Laufzeit)
│
├── MenuScene
│   ├── Atmosphäre-Mesh (rotierendes abstraktes Österreich-Motiv)
│   ├── AmbientLight
│   └── DOM-Shell: Titel, Start-Button, Credits
│
├── RoleSelectScene
│   ├── 6 Charakter-Meshes (Niedrigpoly, je ~500 Polygone)
│   ├── HighlightLayer für Auswahl
│   ├── GlowLayer für aktive Rolle
│   └── DOM-Shell: Rollenbeschreibung, Statistiken, Bestätigung
│
├── WorldmapScene
│   ├── Terrain-Mesh (stilisierte Österreich-Silhouette, low-poly)
│   ├── 100 Level-Knoten (Thin Instances, 1 Draw Call)
│   ├── 10 Welt-Label (AdvancedDynamicTexture)
│   ├── 5 Demokratie-Indikatoren (GlowLayer)
│   ├── ArcRotateCamera (Top-Down, leicht geneigt, Alpha/Beta gesperrt)
│   └── DOM-Shell: Filter, Suche, Fortschritt-Übersicht
│
├── GameScene (Szenario)
│   ├── Kontext-Kulisse (Mesh je nach Welt-Typ: Gemeindesaal, Schule, etc.)
│   ├── Stakeholder-Icons als Billboard-Meshes
│   ├── Atmosphärisches Licht (Hemi + Direction)
│   └── DOM-Shell: Szenario-Text, 4 Choice-Buttons, Timer, HUD
│
└── ResultScene / Debrief
    ├── Partikel-System (nur bei 3 Sternen)
    ├── Stern-Meshes (1-3, animiert herein)
    ├── Demokratie-Indikator-Delta (vorher/nachher Visualisierung)
    └── DOM-Shell: Score, XP, Debrief-Text, Reflexionsfrage, Faktenbox
```

### Scene-Lifecycle (explizit, kein Leak-Risiko)

```javascript
// Pseudo-API — jede Scene implementiert dieses Interface
interface BabylonScene {
  init(engine: Engine): Promise<void>;   // AssetContainer laden, Meshes erstellen
  show(): void;                           // Camera aktivieren, DOM-Shell einblenden
  hide(): void;                           // DOM-Shell ausblenden, Animationen pausieren
  dispose(): void;                        // AssetContainer.dispose(), EventListener entfernen
}
```

**Kritisch:** `dispose()` muss alle EventBus-Listener entfernen die im `init()` registriert wurden. Der aktuelle EventBus in `config.js` hat kein automatisches Cleanup — das muss in der Migration explizit gelöst werden via `off()` Aufrufen in jedem `dispose()`.

---

## 5. State-Management: Zustandsfluss zwischen Szenen

Der bestehende `GAME_STATE` in `config.js` bleibt als zentraler Zustandsträger. Er wird nicht aufgeteilt.

### Übergabe-Protokoll

```
MenuScene.show()
  ├── liest: GAME_STATE.phase (für Continue-Button)
  └── schreibt: nichts

RoleSelectScene.show()
  ├── liest: GAME_STATE.selectedRole (für Vorauswahl)
  └── schreibt: GAME_STATE.selectedRole, GAME_STATE.phase = 'world-map'

WorldmapScene.show()
  ├── liest: GAME_STATE.completedLevels, GAME_STATE.selectedRole
  ├── liest: WorldState (eigener Zustandsträger, siehe unten)
  └── schreibt: GAME_STATE.currentWorld, GAME_STATE.currentLevel, GAME_STATE.phase = 'playing'

GameScene.show()
  ├── liest: GAME_STATE.currentLevel, GAME_STATE.selectedRole
  └── schreibt: GAME_STATE.score, GAME_STATE.decisions, GAME_STATE.phase = 'result'

ResultScene.show()
  ├── liest: GAME_STATE.score, GAME_STATE.decisions
  └── schreibt: WorldState (Demokratie-Indikator-Updates), GAME_STATE.phase
```

### WorldState: Eigener Zustandsträger für persistente Weltspuren

`GAME_STATE` bekommt eine neue Property `worldState` die den persistenten Demokratie-Zustand speichert:

```javascript
// Ergänzung in config.js (nicht der bestehende Code, sondern Migration-Ziel)
GAME_STATE.worldState = {
  vertrauen:    60,  // 0-100, startet bei 60
  teilhabe:     55,
  rechtsstaat:  70,
  spannung:     30,
  zukunftslast: 45,
};
```

Diese Werte fließen in die Babylon.js-Visualisierung der Worldmap (Indikatorhöhe der Säulen) und in die Szenario-Schwierigkeit (hohe Spannung = schwerere Szenarien).

---

## 6. Rendering-Layer-Entscheidung

### Was bleibt HTML/CSS DOM (endgültig, nicht diskutierbar)

- Alle Texte die gelesen werden müssen (Szenario, Debrief, Faktenbox)
- Alle interaktiven Elemente (Buttons, Checkboxen, Inputs)
- Teacher-Mode vollständig
- Navigation, Settings, Datenschutz, Impressum
- Achievement-Benachrichtigungen
- Loading-Indikatoren
- Error-States

**Begründung:** WCAG 2.1 AA ist eine Anforderung, keine Option. Bildungssoftware in Österreich muss barrierefrei sein. HTML/CSS ist der einzige zuverlässige Weg.

### Was geht nach Babylon.js 3D-Canvas

- Atmosphären-Meshes (Menu, Welt-Kulissen)
- Worldmap-Terrain und Level-Knoten
- Demokratie-Indikatoren (Glowing Pillars)
- Stakeholder-Charakter-Meshes im Szenario (nur dekorativ)
- Partikel-Effekte (Level-Complete)
- Kamera-Animation bei Scene-Transitions

### Grenzfall: 3D-Labels auf der Worldmap

AdvancedDynamicTexture als Linked-Mesh (an Welt-Knoten geheftet): Welt-Name und Fortschrittszahl (z.B. "7/10"). Diese Labels sind dekorativ und doppeln die Information die im DOM-Panel steht. Kein Accessibility-Problem weil die Information auch im DOM verfügbar ist.

---

## 7. Kamera-System

### WorldmapScene: ArcRotateCamera (eingeschränkt)

```javascript
camera.alpha = Math.PI / 2;         // Südansicht
camera.beta  = Math.PI / 4;         // 45-Grad-Neigung
camera.radius = 18;                  // Distanz — zeigt alle 10 Welten
camera.lowerBetaLimit  = Math.PI / 4;  // Keine Vogelperspektive
camera.upperBetaLimit  = Math.PI / 4;  // Keine Erdperspektive — Winkel fest
camera.lowerRadiusLimit = 12;
camera.upperRadiusLimit = 25;
camera.panningAxis = new Vector3(1, 0, 1);  // Nur X/Z Panning, kein Y
```

Alpha (Rotation um Y-Achse) ist frei — Spieler:innen können die Karte rotieren. Beta und Radius sind eingeschränkt — Kameras die ins Terrain fallen oder alles verlieren sind Frustrationsfallen.

### GameScene: Feste Kamera (ArcRotateCamera gesperrt)

In der Szenario-Szene ist kein Kamera-Eingriff der Spieler:innen sinnvoll oder pädagogisch. ArcRotateCamera mit `inputs.clear()` — alle User-Inputs deaktiviert. Kamera-Animation zwischen Szenarien via Babylon.js `Animation`-Klasse (nicht GSAP — GSAP-Dependency entfernen nach Migration ist ein Ziel).

### MenuScene: ArcRotateCamera mit Auto-Rotate

Atmosphärische Rotation des Menü-Meshes. `camera.useAutoRotationBehavior = true`, `camera.autoRotationBehavior.idleRotationSpeed = 0.2`. Stoppt sobald Spieler:in interagiert.

---

## 8. Performance-Budget

### Ziele

| Gerät | Ziel-FPS | Maximale Draw Calls | Maximale Polygon-Zahl |
|---|---|---|---|
| Schulchromebook (Intel UHD 600) | 30 fps stabil | 50 | 50.000 |
| iPad 9. Gen | 30 fps stabil | 80 | 80.000 |
| Desktop (dedizierte GPU) | 60 fps | 200 | 500.000 |

### Maßnahmen

**Worldmap-Szene (kritischste Szene für Performance):**
- 100 Level-Knoten: Thin Instances = 1 Draw Call
- Terrain: Max. 2.000 Polygone (stilisierte Silhouette, kein Heightmap-Terrain)
- GlowLayer: `blurKernelSize: 32` auf Mobile, `blurKernelSize: 64` auf Desktop (DeviceDetect)
- Kein Schatten auf der Worldmap — Schatten kosten 1 Draw Call pro schattenwerfen-des Objekt

**GameScene:**
- Kontext-Kulissen-Meshes: Max. 3.000 Polygone pro Szene
- Stakeholder-Billboard-Meshes: Kein 3D-Charakter — Billboard-Plane mit Textur ist schneller
- GlowLayer deaktiviert in der GameScene — kein visueller Mehrwert, kostet Performance

**Generell:**
- `engine.setHardwareScalingLevel(1.5)` auf Mobile-Geräten (75% native Auflösung)
- `scene.autoClearDepthAndStencil = false` wo möglich
- Partikel-Systeme werden nach Ende sofort `dispose()`d
- Kein `scene.render()` manuell aufrufen — Babylon-Render-Loop läuft, aber `scene.freezeActiveMeshes()` in statischen Zuständen (Menü, Result)

### Reduced Motion

`window.matchMedia('(prefers-reduced-motion: reduce)')` wird bei App-Start abgefragt. Bei `true`:
- Alle Kamera-Animationen sofort (kein Tween)
- Partikel-Systeme deaktiviert
- GlowLayer deaktiviert
- Worldmap-Auto-Rotate deaktiviert

Dieser Check ersetzt auch die GSAP-Reduced-Motion-Logik aus dem aktuellen Code.

---

## 9. Migration-Reihenfolge

**Phase 1 (Fundament): Woche 1-2**
1. `engine-3d.js` ersetzen durch `babylon-engine.js` — Babylon.js Engine-Init, Render-Loop, Resize-Handler
2. `config.js` anpassen: `CONFIG.RENDERER` für Babylon konfigurieren, `GAME_STATE.worldState` ergänzen
3. HTML-Shell bereinigen: Canvas bleibt, alle DOM-Overlays bleiben, Three.js-CDN entfernen

**Phase 2 (Worldmap): Woche 3-4**
1. `scene-worldmap.js` → `babylon-worldmap.js`
2. Thin Instances für Level-Knoten
3. ArcRotateCamera mit eingeschränktem Beta/Radius
4. AdvancedDynamicTexture-Labels
5. GlowLayer für Demokratie-Indikatoren
6. HighlightLayer für Hover

**Phase 3 (GameScene-Hintergrund): Woche 5-6**
1. `scene-game.js` → `babylon-game.js`
2. Kulissen-Mesh je Welt-Typ (10 Varianten, je max. 3.000 Polygone)
3. Stakeholder-Billboard-Planes
4. Partikel-System für Level-Complete
5. DOM-Shell für Szenario-Text und Choice-Buttons bleibt unverändert

**Phase 4 (Menu + RoleSelect): Woche 7**
1. `scene-menu.js` → `babylon-menu.js`
2. Atmosphären-Mesh mit Auto-Rotate-Kamera
3. RoleSelect: 6 Charakter-Meshes + HighlightLayer

**Phase 5 (Cleanup): Woche 8**
1. GSAP entfernen (Babylon-Animationen verwenden)
2. Three.js-CDN entfernen
3. Performance-Audit auf Schulchromebook

---

## 10. Risiken

### Risiko 1: Thin Instances + ActionManager Inkompatibilität (Wahrscheinlichkeit: Hoch)
**Problem:** ActionManager funktioniert nicht auf einzelnen Thin Instances.
**Lösung:** `scene.onPointerObservable` mit Hit-Test gegen Instanz-Matrices. Implementierungsaufwand: 1-2 Tage.

### Risiko 2: GlowLayer Performance auf Schulchromebooks (Wahrscheinlichkeit: Mittel)
**Problem:** GlowLayer mit `blurKernelSize: 64` kann auf Intel UHD 600 FPS unter 30 drücken.
**Lösung:** Dynamisches `blurKernelSize` basierend auf `engine.getFps()` — wenn < 35 FPS, `blurKernelSize: 16` oder GlowLayer deaktivieren.

### Risiko 3: AdvancedDynamicTexture Font-Rendering (Wahrscheinlichkeit: Niedrig)
**Problem:** AdvancedDynamicTexture nutzt Canvas2D-Rendering für Text — kann auf High-DPI-Displays unscharf werden.
**Lösung:** `AdvancedDynamicTexture.CreateFullscreenUI` mit `renderAtIdealSize: true`. Oder: Label im DOM statt in 3D (Fallback).

### Risiko 4: Scene-Disposal Memory Leaks (Wahrscheinlichkeit: Mittel)
**Problem:** EventBus-Listener die in `init()` registriert werden aber nicht in `dispose()` entfernt werden, akkumulieren über Szenen-Wechsel.
**Lösung:** Jede Scene hält ein `_listeners: Array<{event, fn}>` Array das in `dispose()` vollständig mit `EventBus.off()` aufgeräumt wird. Code-Review-Pflicht: kein `EventBus.on()` ohne zugehöriges `off()`.

### Risiko 5: CDN-Abhängigkeit (Babylon.js) (Wahrscheinlichkeit: Niedrig)
**Problem:** Schulnetzwerke blockieren manchmal CDN-Domains.
**Lösung:** Babylon.js Core als lokale Datei in `apps/game/js/vendor/` — kein CDN im Production-Build. CDN nur für Development.

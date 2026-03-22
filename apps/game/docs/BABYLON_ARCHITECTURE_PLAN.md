# Babylon Architecture Plan

## Zielarchitektur
- Eine kanonische Babylon-Root-App in [apps/game](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game)
- Gemeinsamer Store fuer Profil, Kampagne, Weltzustand, Teacher-Daten, Settings und Consent
- Expliziter Screen-Graph: `boot -> menu -> role -> world -> scenario -> result -> teacher`

## Babylon-Einsatzpunkte
- 3D-first fuer Menu-Atmosphaere, Weltkarte, Szenario-Buehne, Debrief-Feier und Teacher-Review-Raum
- Persistente Track-Pillars visualisieren Weltzustand in Babylon
- Portal-, Bruecken- und Totem-Logik bleiben bewusst leichtgewichtig und Web-tauglich

## DOM- und Governance-Zonen
- Textschwere Inhalte, Buttons, Formelemente, Export und Accessibility-relevante Interaktion bleiben in der DOM-Shell
- Consent, Datenschutz, Kontakt-Links und Teacher-Export bleiben browser-nativ nachvollziehbar
- Babylon GUI bleibt vorerst bewusst nachrangig

## Rendering- und Laufzeitmodell
- WebGL2 ist der stabile Default
- WebGPU bleibt als spaetere Option vorgesehen, nicht als Blocker fuer den Slice
- `createBabylonStage()` ist der einzige kanonische Einstieg fuer die 3D-Laufzeit
- Resize-Handling wird beim Rebuild sauber deregistriert, damit Settings-Wechsel keine Listener-Leaks erzeugen

## Daten- und Ladepipeline
- Content liegt datengetrieben in `js/content/`
- Weltzustandslogik liegt isoliert in `js/content/world-state.js`
- UI rendert ueber `js/ui/templates.js`
- Spielshell und Screen-Logik liegen in `js/ui/app-shell.js`

## Performance- und Fallback-Strategie
- Reduced Motion und Low-Graphics bleiben Teil des Kernprodukts
- Keine externen 3D-Assets im Vertical Slice, nur prozedurale Babylon-Meshes
- Zustand und Telemetrie bleiben lokal und offline-tauglich

## Risiken
- 3D-first kann ohne harte Scope-Grenzen schnell ueberbauen
- Teacher-Mode darf nicht in Fake-Metriken kippen
- Die naechsten Welten muessen dasselbe Konsequenzmodell nutzen, sonst verwässert der Kern

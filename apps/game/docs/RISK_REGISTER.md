# Risk Register

## Technische Risiken
- Risiko: Root-App und Legacy-Pfade laufen wieder auseinander.
  - Gegenmassnahme: nur Root-App weiterentwickeln, Legacy klar kennzeichnen.
- Risiko: Settings-Rebuilds erzeugen Babylon-Leaks.
  - Gegenmassnahme: Listener beim Dispose abbauen, Stage neu syncen.

## Gameplay-Risiken
- Risiko: Weltzustand fuehlt sich willkuerlich statt lesbar an.
  - Gegenmassnahme: Delta-Regeln offen dokumentieren und playtesten.
- Risiko: Rollen bleiben trotz neuer Felder zu aehnlich.
  - Gegenmassnahme: pro Welt mindestens eine exklusive Lesart und Druckspur pro Rolle scharfziehen.

## Didaktik-Risiken
- Risiko: Debrief wird moralischer Holzhammer.
  - Gegenmassnahme: Reflexionsfragen statt einzig richtiger Antwort priorisieren.
- Risiko: sensible Themen werden zu flach behandelt.
  - Gegenmassnahme: Teacher-Hooks und Schutzsprache pro Level verpflichtend halten.

## Performance-Risiken
- Risiko: 3D-first kippt auf Low-End-Geraeten.
  - Gegenmassnahme: prozedurale Meshes klein halten, Reduced Motion und Low-Graphics aktiv pflegen.

## DSGVO-Risiken
- Risiko: Teacher-Mode driftet in personenbezogene Sync-Pflichten.
  - Gegenmassnahme: local-first, consent-gated Analytics, kein Pflicht-Account im Slice.

## Scope-Risiken
- Risiko: zu fruehe Ausweitung auf viele Welten ohne Systemtiefe.
  - Gegenmassnahme: `Gemeinde` als Referenzmodell zuerst abschliessen, dann MVP-Welten staffeln.

# Executive Audit

## Aktueller Ist-Zustand
- Die kanonische Produktlaufzeit ist [apps/game/index.html](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/index.html) mit Babylon-Stage, lokalem Save-State und DOM-basierter Shell.
- [apps/game/v2](/E:/openclawd-win-bridge/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/apps/game/v2) bleibt Legacy- und Referenzmaterial. Es ist inhaltlich reichhaltiger, aber nicht der belastbare Produktpfad.
- Die Root-App bildet aktuell den Vertical Slice `Gemeinde` mit 10 Levels, 6 Rollen, lokaler Analytics-Opt-in-Logik und Teacher-Export ab.

## Groesste Architekturbrueche
- `v2` behauptet mehr Systeme, hat aber kaputte DOM-IDs, fehlende Dateien und gebrochene Screen-Flows.
- In der Root-App war Babylon bisher vor allem szenische Huelle; Spielfolgen lebten kaum im 3D-Raum.
- Rollen hatten starke Tonalitaet, aber zu wenig echte Systemwirkung ueber Score und Profilwerte hinaus.
- Teacher-Mode war vorbereitet, aber noch kein echter Reflexions- und Session-Review-Flow.

## Groesste Spielkonzept-Schwächen vor dieser Welle
- Konsequenzen waren fast nur Sofort-Score plus Debrief-Text.
- Die Weltkarte zeigte Roadmap und Level, aber kaum persistente Auswirkungen.
- Die 6 Rollen unterschieden sich mehr in Bonus-Logik als in strategischer Lesart und Druckspur.
- 100 Level waren als Vision sichtbar, aber ohne harte Dramaturgie und Weltlogik pro Themenfeld.

## Jetzt umgesetzt
- Persistentes Weltzustandsmodell fuer `Vertrauen`, `Teilhabe`, `Rechtsstaat`, `Soziale Spannung` und `Zukunftslast`.
- Ausgebautes Rollenmodell mit `intelActions`, `pressureTrack`, `failureMode`, `roleObjective` und Weltfokus.
- Neues Szenario-Schema mit `hiddenVariables`, `reflectionPrompts`, `teacherHooks` und sichtbarer Wirkungs-Vorschau pro Entscheidung.
- Teacher-Review-Screen mit Diskussionsimpulsen, Session-Log und consent-gated lokalen Analytics.
- Babylon-Stage zeigt den Weltzustand jetzt systemisch ueber Track-Pillars statt nur dekorativer Kulisse.

## Klare Empfehlung
- Root-App weiter konsolidieren und nur dort entwickeln.
- `Gemeinde` als tiefer Referenz-Slice fuer alle spaeteren Welten nutzen.
- `v2` nicht reparieren, sondern als Content- und Ideenarchiv sauber kennzeichnen.
- Weitere Welten erst freischalten, wenn Rollen-Asymmetrie, Weltzustand und Teacher-Review fuer `Gemeinde` stabil sind.

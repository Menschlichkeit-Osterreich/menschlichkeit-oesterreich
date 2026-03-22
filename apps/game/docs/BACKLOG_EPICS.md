# Backlog Epics

## Epic 1: Gemeinde Vertical Slice absichern
- User Story: Als Spielende:r will ich sichtbare Konsequenzen ueber mehrere Entscheidungen erleben.
- Akzeptanzkriterien:
  - Weltzustand veraendert sich persistent
  - Debrief zeigt mehr als Score
  - Teacher-Review ist nach jedem Level verfuegbar
- Technische Tasks:
  - Consequence-Tuning
  - Smoke-Tests fuer Weltzustand und Resume
  - Save-State-Migration stabilisieren

## Epic 2: Rollen-Asymmetrie vertiefen
- User Story: Als Spielende:r will ich Rollen nicht nur optisch, sondern strategisch unterschiedlich erleben.
- Akzeptanzkriterien:
  - jede Rolle hat eigene Druckspur und Fehlermodus
  - Rollenaktion beeinflusst Weltzustand nachvollziehbar
  - Debrief spricht die Rollenlinse explizit an

## Epic 3: Teacher- und Workshop-Nutzen ausbauen
- User Story: Als Lehrkraft will ich Sitzungen lokal reflektieren und exportieren koennen.
- Akzeptanzkriterien:
  - Session-Log bleibt lokal
  - Diskussionsimpulse sind pro Level sinnvoll
  - Export ist ohne personenbezogene Pflichtdaten moeglich

## Epic 4: MVP-Welten aufbauen
- User Story: Als wiederkehrende:r Spielende:r will ich nach `Gemeinde` weitere Themenwelten mit derselben Tiefe erleben.
- Akzeptanzkriterien:
  - `Schule`, `Arbeit`, `Medien` nutzen dasselbe Systemmodell
  - Difficulty- und Lernzielpfad ist nachvollziehbar
  - Roadmap-Welten werden schrittweise spielbar

## Epic 5: Asynchrone soziale Nutzung vorbereiten
- User Story: Als Klasse oder Community will ich Ergebnisse vergleichen, ohne Live-Multiplayer zu brauchen.
- Akzeptanzkriterien:
  - Exporte sind gruppentauglich
  - Leaderboards bleiben nicht-toxisch
  - DSGVO bleibt local-first und consent-gated

## Definition of Done
- Root-App laeuft ohne Konsolenfehler im Kernflow
- Save, Resume, Debrief und Teacher-Review funktionieren
- neue Inhalte nutzen das gemeinsame Szenario- und Weltzustandsmodell
- Dokumentation unter `apps/game/docs/` spiegelt die echte Laufzeit

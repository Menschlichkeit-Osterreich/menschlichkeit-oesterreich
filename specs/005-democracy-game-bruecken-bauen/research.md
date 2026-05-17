# Research: Democracy Game Bruecken bauen

## Decision 1: Inhaltspflege ueber versionierte CMS-Snapshots

- Decision: Produktion nutzt ausschliesslich freigegebene, versionierte
  CMS-Snapshots statt Live-Content-Abfragen.
- Rationale: Reproduzierbare Szenariostaende, kontrollierte Freigaben,
  rollback-faehiger Betrieb und stabile Testbarkeit.
- Alternatives considered:
  - Live-Laden aus CMS bei jedem Start
  - Reine Repo-JSON-Pflege ohne CMS

## Decision 2: Workshop-Abstimmung mit Deadline und letzter Stimme

- Decision: Abstimmungen enden nach fester Frist; pro Person zaehlt die letzte
  gueltige Stimme.
- Rationale: Deterministische Ergebnisse bei gleichzeitig robuster Handhabung
  instabiler Verbindungen.
- Alternatives considered:
  - Vollstaendigkeitszwang aller Stimmen
  - Sofortige Mehrheitsentscheidung
  - Manuelle Moderationsentscheidung als Primärpfad

## Decision 3: Gastzugang als zeitlich begrenzter Session-Zugang

- Decision: Workshop-Gastzugang gueltig fuer 2 Stunden, danach Re-Join.
- Rationale: Ausreichend fuer typische Workshop-Dauer bei geringerer
  Angriffs- und Missbrauchsoberflaeche.
- Alternatives considered:
  - 30 Minuten
  - 8 Stunden
  - 24 Stunden

## Decision 4: Telemetrie-Retention

- Decision: Rohtelemetrie max. 90 Tage, danach Loeschung oder irreversible
  Anonymisierung; langfristig nur aggregierte Daten.
- Rationale: Ausreichende Analysezeit bei klarer DSGVO-Risikobegrenzung.
- Alternatives considered:
  - 30 Tage
  - 180 Tage
  - nur Sofortaggregation ohne Rohdaten

## Decision 5: Messbare technische Qualitaetsziele

- Decision: Konkrete NFR-Schwellen fuer Performance, Reliability und
  Observability sind Gate-relevant.
- Rationale: Verhindert unklare Abnahme und reduziert Betriebsrisiken im
  Workshop- und Bildungsbetrieb.
- Alternatives considered:
  - rein qualitative Zielbeschreibungen ohne Grenzwerte
  - nur Lasttest ohne laufende Observability-Ziele

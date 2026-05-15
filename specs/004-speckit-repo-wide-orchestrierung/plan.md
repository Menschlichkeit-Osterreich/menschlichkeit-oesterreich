# Plan: Repo-weite Speckit-Orchestrierung

## Leitprinzipien

- Ein Board, ein Priorisierungsmodell, klare Verantwortlichkeiten.
- App-spezifische Tracks plus Cross-App Kontrollspur.
- Entscheidungen und Progress sind issue-zentriert und evidenzbasiert.

## Priorisierungsmodell (Wave A-E)

- Wave A: P0 Produktions-/Betriebskritisch (API, Donation, Security, Integrationen)
- Wave B: P0/P1 Kernprodukt und CRM-Prozesse
- Wave C: P1 UX, Forum, Babylon-Game Integrationen
- Wave D: P1/P2 Hardening, Governance, Dokumentation
- Wave E: P2 Optimierungen und technische Restanten

## App-Streams

- API: Vertragsstabilitaet, Endpoint-Integritaet, Tests, Security-Gates
- Website: Flows, Performance, Accessibility, CI-Qualitaet
- CRM: CiviCRM-Prozesse, Zahlungsfluesse, Rules, Datenqualitaet
- Forum: Basissicherheit, Moderation, Governance-Anbindung
- Babylon-Game: Integrationspunkte, Event-/Gamification-Flows

## Cross-App Streams

- Issue Hygiene (Labels, Milestones, Assignee)
- Project Steuerung (Workflow Status, Wave-Zuordnung)
- Evidence und Readiness je Welle
- Secret Governance (BWS-Provisioning, Repo-Sync, Secret-Validation)

## Gate-Definition pro Welle

- Eingang: priorisierte Issues mit klaren Akzeptanzkriterien
- Ausgang: abgeschlossene Issues, aktualisierte Runbooks/Reports, keine offenen Blocker fuer die Folge-Welle

## Kontrollpunkte

- Triage-Review woechentlich
- Duplikat-/Legacy-Pruefung zweiwoechentlich
- Abschlussreview je Welle mit Gap-Pruefung

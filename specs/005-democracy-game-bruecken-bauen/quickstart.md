# Quickstart: Democracy Game Vertical Slice

## Ziel

Vertical Slice lokal und in Staging pruefen, inklusive technischer
Qualitaetsziele fuer Performance, Reliability und Observability.

## Voraussetzungen

- Node- und Python-Toolchain gemaess Repo-Standard
- Laufende Dienste fuer `apps/babylon-game` und `apps/api`
- Zugriff auf freigegebenen CMS-Snapshot

## Ablauf

1. Aktiven Snapshot importieren.
2. API und Game lokal starten.
3. Rolle waehlen und Szenario starten.
4. Mindestens zwei unterschiedliche Entscheidungswege durchspielen.
5. Workshop-Session mit mehreren Clients testen.
6. Telemetrie mit und ohne Consent pruefen.

## Verifikation

### Performance

- Dialogreaktion p95 <= 150 ms
- API-Endpunkte p95 <= 300 ms
- Workshop-Aggregation p95 <= 2 s

### Reliability

- Szenariofortsetzung nach Refresh in >= 99% der Testlaeufe
- Kein Sessionverlust nach kurzfristigem Reconnect
- API-Fehlerquote < 1% im Staging-Smoke

### Observability

- Fehlerlogs enthalten correlationId in 100% der Faelle
- Workshop-Events enthalten sessionId und participantId
- Dashboard zeigt p50/p95, Fehlerquote, Session-Abbruchrate

## Akzeptanzkriterien

- Vertical Slice ist vollstaendig spielbar.
- CMS-Snapshot-Stand ist reproduzierbar dokumentiert.
- Alle drei NFR-Kategorien erreichen definierte Grenzwerte.

# W002 API-Website Dependency-Matrix (2026-05-16)

## Ziel

Explizite Abhaengigkeiten zwischen Wave-A-Website-Issues und API-Issues
sichtbar machen, inklusive harter Blocker und Soft-Dependencies.

## Scope

- Website: #383, #384, #385
- API: #380, #381, #382
- Bezug: Wave A (`wave/A-foundation`)

## Dependency-Matrix

| Website-Issue | API-Issue | Typ  | Grund                                                                 |
| ------------- | --------- | ---- | --------------------------------------------------------------------- |
| #383 W001     | #380 A001 | hard | User-Flow-Struktur braucht klares Endpunkt-/Owner-Inventar            |
| #383 W001     | #382 A003 | soft | Priorisierung hilft bei Reihenfolge, blockiert aber nicht initial     |
| #384 W002     | #380 A001 | hard | Explizite Kanten sind ohne API-Inventar nicht belastbar               |
| #384 W002     | #381 A002 | hard | Mapping auf Quality-Gates benoetigt API-Gate-Zuordnung                |
| #384 W002     | #382 A003 | soft | Risikogewichtung verbessert Reihenfolgeentscheidungen                 |
| #385 W003     | #381 A002 | soft | Reihenfolge profitiert von Gate-Status, kann initial parallel starten |
| #385 W003     | #382 A003 | hard | Endgueltige Reihenfolge braucht API-Risikoeinschaetzung               |

## Blocker-Kanten (hart)

1. #383 -> #380
2. #384 -> #380
3. #384 -> #381
4. #385 -> #382

## Soft-Dependencies

1. #383 -> #382
2. #384 -> #382
3. #385 -> #381

## Empfohlene Ausfuehrungsreihenfolge

1. #380 A001 abschliessen
2. #381 A002 in Review bringen
3. #383 W001 und #384 W002 parallel im WIP-Limit 2 starten
4. #382 A003 finalisieren
5. #385 W003 mit finaler Reihenfolgeentscheidung abschliessen

## Board-Regel fuer Wave A

Ein Website-Issue darf nur auf `In Progress`, wenn alle zugeordneten harten
API-Abhaengigkeiten mindestens auf `In Progress` oder `Review` stehen.

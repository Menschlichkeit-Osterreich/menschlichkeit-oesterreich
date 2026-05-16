# Wave A Board Execution Runbook (2026-05-16)

## Ziel

Operative Regeln fuer Project #2 in Wave A mit klaren Status-Uebergaengen,
WIP-Limits und einem Blocker-Playbook.

## Scope

- Wave A Issues: #380, #381, #382, #383, #384, #385
- Abhaengigkeitsbasis: W002-Matrix und A002-Gate-Mapping
- Board-Spalten: Backlog, Ready, In Progress, Blocked, Review, Done

## Status-Uebergaenge

### Backlog -> Ready

1. `service/*`, `wave/*`, `status/*`, `priority/*`, `effort/*` sind gesetzt.
2. Scope und Akzeptanzkriterium im Issue vorhanden.
3. Hard Dependencies sind verlinkt.

### Ready -> In Progress

1. Es besteht kein offener harter Blocker.
2. WIP-Limit wird eingehalten.
3. Geplanter Gate-Lauf (welche Befehle, wer fuehrt aus) ist im Kommentar hinterlegt.

### In Progress -> Review

1. Pflichtgates laut A002 sind ausgefuehrt.
2. Gate-Ergebnis ist im standardisierten Protokoll dokumentiert.
3. Folgearbeiten/Restpunkte sind als eigene Action-Items markiert.

### Review -> Done

1. Akzeptanzkriterien sind nachweisbar erfuellt.
2. Keine offenen harten Blocker mehr.
3. Abschlusskommentar mit Artefakt-Links ist gesetzt.

### Jede Spalte -> Blocked

Ein Issue wird auf `Blocked` gesetzt, wenn eine Bedingung zutrifft:

1. Harte Dependency nicht in `In Progress` oder `Review`.
2. Pflichtgate reproduzierbar rot.
3. Externer Owner fehlt fuer kritische Entscheidung.

## WIP-Regeln

1. Maximal 2 Issues gleichzeitig in `In Progress` innerhalb Wave A.
2. Davon maximal 1 API-Issue (#380-#382) und maximal 1 Website-Issue (#383-#385).
3. Keine neuen Starts, solange ein Issue > 2 Arbeitstage auf `Blocked` steht.

## Blocker-Playbook

### Triage innerhalb 24h

1. Blocker-Typ markieren: Dependency, Gate, Ownership, Scope.
2. Betroffenes Ziel-Issue verlinken.
3. Erwartete Aufloesung und Owner benennen.

### Eskalation nach 48h

1. Prioritaet neu bewerten (P0/P1/P2).
2. Reihenfolge in Wave A neu justieren.
3. Falls noetig Startstop fuer nachgelagerte Issues (#384/#385).

### Aufloesung

1. Kurzprotokoll im Issue-Kommentar.
2. Rueckstellung auf `Ready` oder direkt auf `In Progress` mit Begruendung.
3. Abhaengige Issues entsperren und Status synchronisieren.

## Operative Sequenz fuer Wave A

1. #380 A001 auf `In Progress`.
2. #381 A002 auf `Ready` und nach #380 auf `In Progress`.
3. #383 W001 auf `In Progress`, sobald #380 stabil laeuft.
4. #384 W002 auf `Ready` und nach #381 auf `In Progress`.
5. #382 A003 finalisieren, danach #385 W003 in `In Progress`.

## Pflicht-Check je Daily Update

1. WIP-Limit eingehalten.
2. Keine stillen Blocker ohne Kommentar.
3. Gate-Protokolle fuer aktive Issues aktuell.
4. Reihenfolge bleibt kompatibel mit W002-Hard-Dependencies.

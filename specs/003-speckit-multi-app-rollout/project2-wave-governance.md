# Project #2 Wave Governance

## Ziel

Diese Datei definiert die operative Einsortierung fuer Speckit Multi-App in Project #2.

## Wave Definition

| Wave | Name          | Fokus                                             | Entry Criteria                                 | Exit Criteria                                                                  |
| ---- | ------------- | ------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| A    | Foundation    | API/Website Kernfluesse und Ownership-Transparenz | Labelset vollstaendig, Risiko initial bewertet | Alle P0-Blocker fuer Kernfluss geschlossen oder explizit in Wave B ueberfuehrt |
| B    | Feature Core  | CRM Integrationen und Forum Basis                 | Abhaengigkeiten aus Wave A dokumentiert        | Integrationspfade testbar und Governance-Links vorhanden                       |
| C    | Stabilization | Game-Integration, QA, Cross-App-Haertung          | Offene Risiken aus A/B priorisiert             | Keine offenen unklassifizierten Cross-Issues                                   |
| D    | Ops Hardening | Betrieb, Monitoring, Uebergabe, Runbooks          | Scope fuer Ops klar abgegrenzt                 | Baseline aktualisiert und Freigabeentscheidung dokumentiert                    |

## Board Spalten

1. Backlog
2. Ready
3. In Progress
4. Blocked
5. Review
6. Done

## Board Regeln

1. Ein Speckit-Issue darf nur in `In Progress` wenn `service/*`, `wave/*`, `status/*`, `priority/*`, `effort/*` gesetzt sind.
2. Blocker werden nur ueber `status/blocked` + Link auf blockierendes Issue gefuehrt.
3. Wechsel der Wave ist nur mit Begruendung im Issue-Kommentar erlaubt.
4. `Done` ist nur gueltig mit Akzeptanznachweis im Issue-Kommentar.

## Startreihenfolge fuer den Block X001-X005

1. X001 Labelset final auf bestehende Speckit-Issues anwenden.
2. X002 Alle Speckit-Issues in Project #2 einsortieren.
3. X003 Lifecycle-Regeln (`duplicate`, `deprecated`, `superseded`) anwenden.
4. X004 Wave-Zuordnung auf A-D fixieren.
5. X005 Baseline erfassen und im Repo ablegen.

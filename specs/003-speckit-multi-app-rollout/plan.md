# Plan: Speckit Multi-App Rollout

## Scope

Der Plan umfasst die operative Planungsschicht fuer:

- apps/api
- apps/website
- apps/crm
- apps/forum
- apps/babylon-game

## Prinzipien

- Main-first Workflow und bestehende Governance beibehalten.
- Einheitliche Task-Granularitaet je App.
- Priorisierung nach Risiko, Betriebsrelevanz und Abhaengigkeiten.
- Jede Aufgabe ist unabhaengig pruefbar.

## Wellenmodell

1. Welle A (P0): API + Website Kernfluss
2. Welle B (P0/P1): CRM Integrationen + Forum Basis
3. Welle C (P1): Babylon-Game Integrationen + UX/QA Queraufgaben
4. Welle D (P1/P2): Hardening, Dokumentation, Uebergabe

## Governance-Gates je Welle

- Nachweis in GitHub Project #2 (Workflow Status gepflegt)
- Keine offenen Duplikate in aktiven Wellen
- Jede abgeschlossene Welle mit aktualisiertem Akzeptanznachweis

## Risiken

- Cross-App Abhaengigkeiten koennen Durchlaufzeiten erhoehen.
- Historische Issue-Strukturen koennen Priorisierung verzerren.
- Fehlende Label-Normalisierung behindert Reporting.

## Gegenmassnahmen

- Einheitliche Speckit-Tags und Labeling.
- Duplikatbereinigung vor aktiver Sprintplanung.
- Regelbasierte Board-Einsortierung (Backlog/In Progress/Blocked).

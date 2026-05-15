# Spec: Repo-weite Speckit-Orchestrierung

## Scope

Diese Spezifikation wendet Speckit auf das gesamte Repository an, mit Fokus auf:

- apps/api
- apps/website
- apps/crm
- apps/forum
- apps/babylon-game
- cross-app Governance, Quality und Delivery

## Problemstellung

Die Aufgabenlage ist ueber mehrere App-Streams verteilt. Historische, doppelte und unterschiedlich gelabelte Issues erschweren eine nachvollziehbare Abarbeitung.

## Ziele

- Einheitliche Planungsschicht fuer alle App-Bereiche.
- Vollstaendige Einplanung aller offenen Issues im GitHub Project.
- Standardisierte Priorisierungswellen (Wave A-E) fuer operative Umsetzung.
- Transparente Regeln fuer Legacy, Duplikate und veraltete Issues.

## Nicht-Ziele

- Kein unmittelbares Feature-Coding in dieser Spezifikation.
- Kein Austausch bestehender Architekturentscheidungen ohne ADR/Governance-Prozess.

## Erfolgsmetriken

- 100% der offenen Issues im Projektboard enthalten.
- 100% der offenen Issues haben mindestens Label, Assignee oder Milestone nach Planung.
- Speckit-Aufgaben je App und Cross-App sind als umsetzbare Tickets angelegt.
- Duplikate sind geschlossen oder klar markiert.

## Abhaengigkeiten

- Bestehende Masterplan- und n8n-Gate-Spezifikationen bleiben referenziert.
- Main-first Workflow und Governance-Checks bleiben unveraendert verpflichtend.

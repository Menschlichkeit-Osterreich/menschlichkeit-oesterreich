# Issue Lifecycle Policy fuer Speckit Multi-App

## Zweck

Diese Policy verhindert aktive Duplikate und priorisierungsfremde Tickets in Speckit-Waves.

## Statusmodell

1. Aktiv: Issue ist umsetzbar und in einer Wave geplant.
2. Geblockt: Issue ist fachlich valide, aber extern blockiert.
3. Erledigt: Akzeptanz nachgewiesen.
4. Archiviert: Issue ist deprecated, duplicate oder superseded.

## Lifecycle Labels

| Label                | Wann verwenden                                                   | Pflichtaktion                                               |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| lifecycle/duplicate  | Inhaltlich identisches oder stark ueberlappendes Issue existiert | Auf Master-Issue verlinken und aktuelles Issue schliessen   |
| lifecycle/deprecated | Anforderung ist technisch/fachlich nicht mehr gueltig            | Grund dokumentieren und Nachfolgepfad nennen                |
| lifecycle/superseded | Issue wurde durch neues Issue mit erweitertem Scope ersetzt      | Nachfolge-Issue verlinken, Scope-Differenz kurz beschreiben |

## Verbindliche Regeln

1. Kein `lifecycle/*` Issue darf in `In Progress` liegen.
2. Jedes geschlossene `lifecycle/*` Issue muss einen Verweis auf das fuehrende Issue enthalten.
3. Ein `duplicate` Label darf nicht ohne Link auf das Master-Issue gesetzt werden.
4. Ein `superseded` Label erfordert eine Scope-Differenz in einem Satz.

## Review Cadence

1. Vor jeder Sprintplanung: Lifecycle-Review fuer alle `spec/speckit-multiapp` Issues.
2. Waehrend Sprint: Nur neue Duplikate/Deprecated markieren, keine stillen Schliessungen.
3. Sprintabschluss: Kurzprotokoll mit Anzahl `duplicate`, `deprecated`, `superseded`.

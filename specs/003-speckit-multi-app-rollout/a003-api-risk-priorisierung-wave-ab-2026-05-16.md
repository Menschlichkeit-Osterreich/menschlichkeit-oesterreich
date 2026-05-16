# A003 API Risiko-Priorisierung Wave A/B (2026-05-16)

## Ziel

Offene API-Themen fuer Wave A/B risikobasiert priorisieren, damit Reihenfolge,
Board-Status und Umsetzungsfokus konsistent bleiben.

## Bewertungsmodell

- Impact: Einfluss auf Kernfluesse (Auth, Donation, Membership)
- Wahrscheinlichkeit: Eintrittswahrscheinlichkeit eines Fehlers
- Entdeckbarkeit: Wie schnell ein Fehler durch Gates entdeckt wird

Risikostufe:

- P0: hoher Impact, hohe Wahrscheinlichkeit oder schwer entdeckbar
- P1: mittlerer Impact, entdeckbar, aber betriebsrelevant
- P2: niedriger Impact oder klar isolierbar

## Priorisierte Themen fuer Wave A

| Prioritaet | Thema                                | Begruendung                                            | Zugeordnete Speckit-Issues |
| ---------- | ------------------------------------ | ------------------------------------------------------ | -------------------------- |
| P0         | Auth Eintrittspfade (Login/Register) | Blockiert Website/Auth-Flow direkt                     | #380, #381                 |
| P0         | Payment/Finance Prozessendpunkte     | Kritisch fuer Donation und Buchungsfluss               | #381, #382                 |
| P1         | Member- und Rollenverwaltung         | Wichtig fuer Moderation und Mitgliedsbereich           | #380, #382                 |
| P1         | Forum-Write-Endpunkte                | Relevanz fuer Community-Flows, aber nicht Startblocker | #382                       |
| P2         | KPI und Reporting-Endpunkte          | Wichtig fuer Steuerung, nicht fuer Erstfluss           | #382                       |

## Priorisierte Themen fuer Wave B

| Prioritaet | Thema                            | Begruendung                           |
| ---------- | -------------------------------- | ------------------------------------- |
| P0         | CRM-nahe Integrationskanten      | Hoher Impact auf Vereinsprozesse      |
| P1         | Cross-System Reporting/Exports   | Betriebsrelevant, aber nach Kernfluss |
| P1         | Game-Integration-Abhaengigkeiten | Relevant nach stabiler API-Basis      |

## Reihenfolgeempfehlung fuer API-Issues #380 bis #382

1. #380 A001 finalisieren (Owner und Endpunkttransparenz)
2. #381 A002 mit Gate-Mapping auf Review bringen
3. #382 A003 als Risikoabschluss und Wave-A/B-Uebergabe abschliessen

## Blocker-Definition

Ein API-Issue gilt als Blocker fuer Wave A, wenn mindestens eine Bedingung
zutrifft:

1. P0-Endpunkt ohne benannten Owner.
2. P0/P1-Endpunkt mit reproduzierbarem Test-Fail in `npm run test:api`.
3. Security-bezogener Befund ohne akzeptierte Mitigation.

## Naechster Schritt

1. Risiken je P0/P1-Endpunkt mit Link auf konkrete Tests in `apps/api/tests/`
   annotieren.
2. Board-Update in Project #2: Sichtbarkeit der Risikoebene im Issue-Kommentar
   standardisieren.

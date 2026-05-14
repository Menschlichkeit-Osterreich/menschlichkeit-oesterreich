# Plattform-Rollback-Runbook (Masterplan)

## Ziel
Sichere und nachvollziehbare Ruecksetzung der Plattform auf den letzten stabilen Stand bei kritischem Gate-Fail oder Incident.

## Voraussetzungen
- Letzter freigegebener Release-Tag vorhanden
- Zugriff auf Infrastruktur- und Deployment-Pipeline
- Evidence-Log wird parallel gepflegt

## Schritte
1. Incident und Rollback-Entscheidung dokumentieren.
2. Letzten stabilen Release-Tag auswaehlen.
3. Infrastruktur-Drift pruefen und notwendige Rollback-Aktionen anwenden.
4. Services kontrolliert auf vorherigen Stand zuruecksetzen.
5. Smoke-Checks fuer API, Website, CRM und Donation ausfuehren.
6. Ergebnis im Evidence-Log erfassen.

## Verifikation
- Plattform wieder erreichbar
- Kritische Flows erfolgreich
- Keine neuen Security- oder Compliance-Verstoesse

## Nachweise
- Evidence-Log-Eintrag
- Link auf CI-Run oder Incident-Report

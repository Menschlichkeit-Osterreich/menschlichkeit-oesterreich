# Restore-Runbook (Masterplan)

## Ziel
Wiederherstellung von Daten und Konfiguration nach Datenverlust oder Test des Wiederanlaufplans.

## Restore-Ablauf
1. Wiederherstellungspunkt bestimmen.
2. Backup-Integritaet vor Restore pruefen.
3. Restore in kontrollierter Reihenfolge ausfuehren.
4. Datenkonsistenz validieren.
5. Kritische Geschaeftsprozesse (Donation, Mitgliederfluss) verifizieren.

## Restore-Test (Pflicht)
- Mindestens ein dokumentierter Restore-Test pro Rollout-Phase.
- Test muss Zeitstempel, Dauer und Ergebnis enthalten.

## Erfolgskriterien
- Restore-Test: PASS
- Keine Datenkorruption
- Keine offenen Blocker im Go-/No-Go-Check
- RTO <= 2 Stunden

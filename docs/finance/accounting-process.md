# Buchhaltungsprozess

Stand: 12.04.2026

## 1. Einnahmen

- Spenden und Mitgliedsbeiträge entstehen in Plattform und/oder CiviCRM.
- FastAPI legt idempotente ERPNext-Sync-Einträge an.
- ERPNext erhält die Debitorenbelege.
- Zahlungseingänge erzeugen `Payment Entry` und aktualisieren CiviCRM.

## 2. Ausgaben und Kreditoren

- Das Finance-Cockpit erfasst Ausgaben und Eingangsrechnungen.
- ERPNext erhält `Supplier` und `Purchase Invoice`.
- Zahlungen werden in ERPNext als `Payment Entry` oder per Bankabgleich verbucht.

## 3. Monatlicher Abschluss

1. Sync-Queue leerfahren
2. offene Forderungen prüfen
3. offene Verbindlichkeiten prüfen
4. Expense Claims und Bankabgleich kontrollieren
5. Journalbuchungen für Abschluss/Korrekturen erfassen
6. Reports exportieren

## 4. Payroll und Assets

- Payroll-Läufe werden in ERPNext HR/Payroll geführt und im Cockpit überwacht.
- Assets werden in ERPNext geführt; Anschaffung und Status sind im Portal sichtbar.

## 5. Betriebsdisziplin

- Keine manuelle Doppelverbuchung außerhalb des definierten Flusses
- Requeue nur nach inhaltlicher oder technischer Korrektur
- Fachliche Freigaben für Steuern, Payroll und Jahresabschluss bleiben obligatorisch

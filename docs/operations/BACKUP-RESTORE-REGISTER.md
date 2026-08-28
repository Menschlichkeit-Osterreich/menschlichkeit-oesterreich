# Backup and Restore Register - Public Contract

Stand: 2026-08-28T06:26:31Z

## Public boundary

Backupstandorte, Zeitplaene, Retentionwerte, Schluesselreferenzen, interne Infrastruktur, letzte Sicherungszeitpunkte und konkrete Recovery-Ablaeufe werden nicht im oeffentlichen Repository inventarisiert. Diese Angaben koennen Angriffs- und Ausfallrisiken erhoehen.

GitHub enthaelt nur den pruefbaren Gate-Vertrag. Das detaillierte Register und Restore-Evidenz gehoeren in einen zugriffsbeschraenkten Betriebsbereich.

## Pflichtschema fuer das eingeschraenkte Register

| Feld | Pflicht | Oeffentlicher Statuswert |
| --- | --- | --- |
| Asset-Referenz und Owner | ja | `RESTRICTED` oder nicht sensitive Rollenklasse |
| Methode, Frequenz und Retention | ja | `PASS`, `PARTIAL`, `FAIL`, `UNKNOWN` |
| Verschluesselung und Offsite-Schutz | ja | `PASS`, `PARTIAL`, `FAIL`, `UNKNOWN` |
| letzte erfolgreiche Sicherung | ja | Evidenzstatus, kein Zeitpunkt im Public Contract |
| letzter isolierter Restore | ja | `VERIFIED_TEST`, `PRE_VALIDATION`, `UNKNOWN`, `BLOCKED` |
| gemessenes RPO und RTO | ja | `PASS`, `FAIL`, `UNKNOWN`; Detail `RESTRICTED` |
| Quelle und Evidenzzeitpunkt | ja | ohne sensitive Live-Werte |
| Owner, Recovery- und Rollback-Pfad | ja | Detail `RESTRICTED` |

## Isolierter Restore Gate

Ein Asset darf erst als `PASS` gelten, wenn eine nicht produktive, isolierte Pruefung mindestens Folgendes belegt:

1. Sicherung lesbar und erforderlichenfalls entschluesselbar
2. Daten und Dateien erfolgreich wiederhergestellt
3. Schema konsistent und Anwendung startbar
4. kritische Testdatensaetze vorhanden, ohne Produktionsdaten zu publizieren
5. Versionen kompatibel
6. Dauer, RPO und RTO gemessen und eingeschraenkt dokumentiert
7. temporaere Testumgebung kontrolliert bereinigt

Ein Backup ohne aktuellen Restore-Nachweis bleibt `UNVERIFIED_BACKUP`. Ein Skript ohne freigegebene reale Backupquelle bleibt `PRE_VALIDATION`. Restore-Tests gegen Produktion sind verboten.

## Aktueller oeffentlicher Status

| Pruefung | Status | Evidenzklasse |
| --- | --- | --- |
| Public-Contract definiert | PASS | VERIFIED_REPO |
| Detailliertes Backupinventar | BLOCKED | Kein freigegebener eingeschraenkter Readback in diesem Lauf |
| Aktuelle Backup-Evidenz | UNKNOWN | Kein Live-Nachweis publiziert |
| Isolierte Restore-Evidenz | UNKNOWN | Kein reproduzierbarer Restore-Test in diesem Lauf |

TARGET: Das Detailregister wird unter `07 Technik und Datenschutz` in der bestehenden SharePoint-Struktur gefuehrt. Es enthaelt keine Secrets, keine Backupinhalte und keine unnoetigen personenbezogenen Daten.

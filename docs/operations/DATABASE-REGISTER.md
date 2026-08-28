# Database Register - Public Contract

Stand: 2026-08-28T06:26:31Z

## Public boundary

Dieses oeffentliche Repository enthaelt bewusst kein produktives Datenbankinventar. Nicht publiziert werden Datenbanknamen, Hosts, Ports, Versionen, Groessen, Wachstumswerte, Zugriffspfade, Berechtigungsdetails, Backupziele oder Zuordnungen sensibler Datenklassen.

Der detaillierte Betriebsnachweis gehoert in den zugriffsbeschraenkten Governance-Bereich. GitHub bleibt ausschliesslich fuer Schema, Pruefcode und technische Konfiguration ohne Live-Werte fuehrend.

## Registerschema

| Feld | Pflicht | Oeffentliche Darstellung |
| --- | --- | --- |
| stabile Asset-Referenz | ja | nur wenn nicht sensitiv |
| fachlicher Owner | ja | Rollenklasse oder `RESTRICTED` |
| Anwendung und Engine | ja | nur Repo-Soll oder `RESTRICTED` |
| Authority-Status | ja | `AUTHORITATIVE`, `PROJECTION`, `CACHE`, `INTEGRATION_STATE`, `TRANSITIONAL`, `DUPLICATE`, `RETIRE_CANDIDATE`, `UNKNOWN` |
| Datenklassifikation | ja | nur aggregierter Status; Detail `RESTRICTED` |
| Zugriff und Verschluesselung | ja | `PASS`, `PARTIAL`, `FAIL`, `UNKNOWN` |
| Backup und Restore | ja | `VERIFIED_TEST`, `UNVERIFIED_BACKUP`, `UNKNOWN`, `BLOCKED` |
| Groesse, Wachstum, RPO und RTO | ja | Detail `RESTRICTED`; oeffentlich nur Evidenzstatus |
| Evidenz | ja | Zeitstempel, Quelle, Scope und Evidenzklasse ohne Live-Werte |

## Authority-Regeln

- Jede fachliche Datenklasse hat genau einen Owner.
- Integrationsdatenbanken duerfen keine unkontrollierte zweite Fachwahrheit bilden.
- Repo-Konfiguration ist `VERIFIED_REPO`, niemals automatisch `VERIFIED_LIVE`.
- Ein Konflikt zwischen Live Runtime und Code wird `CONFLICTING`, nicht stillschweigend bereinigt.
- Detailwerte werden nur im eingeschraenkten Register und in kurzlebiger Testverarbeitung verwendet.

## Aktueller oeffentlicher Status

| Pruefung | Status | Evidenzklasse |
| --- | --- | --- |
| Public-Contract definiert | PASS | VERIFIED_REPO |
| Detailliertes Live-Inventar | BLOCKED | Keine freigegebene nicht-oeffentliche Live-Evidenz in diesem Lauf |
| Vollstaendige Authority-Zuordnung | UNKNOWN | Restricted Register noch nicht verifiziert |
| Backup- und Restore-Nachweis | UNKNOWN | Separater Restore Gate erforderlich |

TARGET: Das Detailregister wird unter `07 Technik und Datenschutz` in der bestehenden SharePoint-Struktur gefuehrt. Es enthaelt keine Secrets und keine unnoetigen personenbezogenen Rohdaten.

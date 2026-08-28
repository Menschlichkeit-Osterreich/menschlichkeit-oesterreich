# Plesk Runtime Contract

Stand: 2026-08-28

## Zweck und Evidenzgrenze

Dieses Dokument definiert den oeffentlichen Sollvertrag fuer den Plesk-Betrieb von Menschlichkeit Oesterreich. Es ist kein Nachweis des Live-Zustands.

| Aussage | Evidenzklasse | Quelle | Stand |
| --- | --- | --- | --- |
| Plesk bleibt Produktionsanker fuer CiviCRM und die vorhandenen Web-Runtimes. | TARGET | Betriebsentscheidung Masterprompt V6 | 2026-08-28 |
| Der Deployment-Workflow verwendet den bestehenden kanonischen Plesk-Verbindungsvertrag. | VERIFIED_REPO | `.github/workflows/deploy-plesk.yml` | 2026-08-28T06:26:31Z |
| Der Audit-Collector fuehrt nur lesende Abfragen aus. | VERIFIED_REPO | `scripts/ops/plesk-readonly-audit.sh` | 2026-08-28T06:26:31Z |
| Der Audit-Workflow validiert Collector, Comparator und Policy ohne Secrets oder Live-Verbindung. | VERIFIED_REPO | `.github/workflows/plesk-readonly-audit.yml` | 2026-08-28T06:26:31Z |
| Versionen, Kapazitaet, Servicezustand, Zertifikate und VHosts in Produktion | UNKNOWN | Live-Audit noch nicht ausgefuehrt | 2026-08-28T06:26:31Z |

## Sicherheitsvertrag

Der Audit darf auf dem Zielsystem keine Dateien anlegen oder veraendern, keine Services steuern, keine Pakete installieren, keine Datenbank schreiben oder dumpen und kein Deployment ausloesen. Er liest ausschliesslich begrenzte Systemmerkmale, Statuswerte, oeffentliche Host-Erreichbarkeit, extern konfigurierte Verzeichnisreferenzen und den SHA-256-Hash vorhandener `.deploy_release`-Marker.

Nicht erhoben oder veroeffentlicht werden:

- Environment-Dumps, Prozesskommandozeilen und Secret-Werte
- Datenbank-Zugangsdaten, Connection Strings und personenbezogene Daten
- private IP-Adressen oder vollstaendige interne Prozess- und Netzwerkinventare
- Inhalte von Release-Markern oder Anwendungsdateien

Detailwerte existieren nur kurzlebig im Runner. GitHub-Logs und Step Summary erhalten ausschliesslich `PASS`, `WARN`, `FAIL` oder `UNKNOWN` je oeffentlich benanntem Pruefobjekt. Interne Pfadwerte stammen aus GitHub-Variablen, stehen nicht im oeffentlichen Sollvertrag und werden nicht in die Statusausgabe uebernommen.

Netzwerkpruefungen sind hart auf `menschlichkeit-oesterreich.at` und deren Subdomains begrenzt. IP-Adressen, fremde Domains und andere Ziele werden bereits bei der Eingabevalidierung verworfen, bevor DNS-, TLS- oder HTTP-Pruefungen moeglich sind.

Plesk-VHost-Pruefungen verwenden fuer die Root Domain die lesende Domain-Abfrage und fuer Subdomains die von Plesk vorgesehene lesende Subdomain-Abfrage. Dadurch bleibt die Erkennung fachlich korrekt, ohne Konfiguration zu veraendern.

## Implementierter Prevalidation-Pfad

Der GitHub-Workflow laeuft bei relevanten Pull Requests oder manuell. Er besitzt nur `contents: read`, persistiert keine Checkout-Credentials und verwendet weder Vault-Secrets noch eine Live-Verbindung. Er prueft Shell-Syntax, Python-Kompilierung, Sollvertrag und die reproduzierbaren Read-only-, Zielbegrenzungs-, VHost- und Redaktions-Tests.

## Zielpfad nach Human-Approval

1. Ein freigegebener Runner laedt den bestehenden kanonischen Verbindungsvertrag aus dem vorhandenen Vault.
1. Verbindungswerte werden nur auf Vorhandensein und Format geprueft, maskiert und nicht protokolliert.
1. Der Runner erstellt Key und Known-Hosts-Datei mit restriktiver Umask in einem kurzlebigen Verzeichnis.
1. Der Collector wird ueber Standard Input an eine strikt host-key-gepruefte SSH-Sitzung uebergeben. Auf dem Ziel wird kein Audit-Skript gespeichert.
1. Die Live-Ausgabe wird lokal als kurzlebiges JSON validiert und gegen `config/plesk/expected-state.json` verglichen.
1. Nur die redigierte Statusmatrix wird protokolliert. Es gibt kein Audit-Artefakt und keinen Upload der Rohdaten.

Bei Timeout oder unbekanntem SSH-Status erfolgt kein automatischer Write und kein Deployment. Der Zustand ist `UNKNOWN`; ein erneuter Lauf beginnt wieder mit einer lesenden Verbindung.

Status: `AUTHORIZATION_REQUIRED`. Erforderlich ist die explizite Freigabe eines nicht zeitgesteuerten, read-only Zugriffs ueber den geschuetzten GitHub-Environment-Weg. Minimalrechte sind Login, lesende Systemabfragen und Statusabfragen fuer ausschliesslich die erwarteten MOE-Hosts. Schreib-, Restart-, Deploy-, Datenbank- und Paketmanagementrechte sind nicht erforderlich.

## Sollpruefungen

| Bereich | Soll | Fehlerwirkung |
| --- | --- | --- |
| Collector Policy | ausschliesslich lesend, keine Secrets oder PII | `FAIL` |
| Plesk, OS, Kernel, Host, CPU, RAM, Dateisystem, Inodes | sichtbar | `UNKNOWN` oder `FAIL` |
| Freier RAM, Speicher und Inodes | jeweils mindestens 15 Prozent | `FAIL` unter Schwellwert |
| Python, PHP, Nginx, PHP-FPM und Cron | erforderliche Runtime beziehungsweise aktiver Service | `UNKNOWN` oder `FAIL` |
| DNS, TLS und HTTP | nur fuer `menschlichkeit-oesterreich.at` und Subdomains; erforderliche Hosts erfolgreich | `FAIL` |
| Plesk-VHost | Root Domain ueber Domain-Info, Subdomains ueber Subdomain-Info vorhanden | `UNKNOWN` oder `FAIL` |
| Zertifikatsrestlaufzeit | mindestens 7 Tage | `FAIL` |
| Deploymentpfade und Release-Marker | fuer erforderliche Services vorhanden | `FAIL` |
| Letztes Backup | hoechstens 48 Stunden alt | `UNKNOWN` bis kanonische Evidenz lesbar ist |
| Isolierter Restore | reproduzierbar belegt | `UNKNOWN` bis Testevidenz vorliegt |

## Betrieb und Rollback

Der implementierte Workflow fuehrt nur Prevalidation aus. Ein Rollback entfernt ausschliesslich Workflow, Comparator, Collector und Sollvertrag aus einem Pull Request oder einem spaeteren Revert. Da kein Live-Ziel veraendert wird, existiert kein produktiver Runtime-Rollback.

Ein gruenes Audit ersetzt keinen Restore-Test. Solange Backup- oder Restore-Evidenz fehlt, bleibt der Gesamtstatus ehrlich `UNKNOWN`.

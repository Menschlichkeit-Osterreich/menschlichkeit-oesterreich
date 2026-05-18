# Runtime Contract: Azure n8n Erstbetrieb

## Zweck

Dieser Vertrag definiert den verbindlichen Runtime-Sollzustand fuer den ersten belastbaren n8n-Betrieb auf Azure als Abnahmevorbereitung. Er enthaelt keine produktive Go-Freigabe.

## Betriebsmodus

- Erlaubter Erstmodus: Single-Main
- Queue-Mode: nur mit explizitem Zusatzvertrag und separatem Nachweis
- Keine implizite Mischlage aus Single-Main und Queue

## Container-Sollbild

- Reverse Proxy (TLS-Termination, Weiterleitung auf n8n intern)
- n8n Service (Editor/Webhook)
- PostgreSQL Service (intern erreichbar)
- Persistente Volumes fuer n8n-Daten und Datenbankdaten

## Expositionsregeln

- Oeffentlich erlaubt: `22`, `80`, `443`
- Nicht oeffentlich exponiert: `5678`, `5432`, `6379`
- Interne Service-Kommunikation nur im privaten Netzwerksegment

## Pflichtkonfiguration vor spaeterem Go

- `N8N_HOST`
- `N8N_PROTOCOL`
- `N8N_EDITOR_BASE_URL`
- `WEBHOOK_URL`
- `N8N_ENCRYPTION_KEY`
- `TZ`
- DB Host/Port/Name/User/Password (nicht im Klartext in oeffentlichen Artefakten)
- Definierter Backup-Zielpfad

## Security-Haertung

- SSH-only Zugriff, kein Passwort-Login
- Root-Login deaktiviert
- NSG-Regeln auf Minimalprinzip
- Lokale Firewall konsistent mit NSG

## Backup-/Restore-Pflicht

Mindestens folgende Bausteine muessen als Nachweisobjekte definiert sein:

- VM-/Disk-Snapshot-Strategie
- PostgreSQL Dump-Strategie
- Sicherung kritischer Runtime-Konfiguration (`.env` bzw. Secret-Quelle)
- Volume-Backup-Strategie
- Restore-Test als dokumentierter Gate-Punkt

## Blockerregeln

- Fehlender `N8N_ENCRYPTION_KEY`: Go-Blocker
- Oeffentliche Exposition von `5678`/`5432`/`6379`: Go-Blocker
- Kein dokumentierter Backup-/Restore-Pfad: Go-Blocker
- Ungeklaerte Betriebsverantwortung/Owner fuer Renewal: Go-Blocker

## Evidenztyp je Vertragsbereich

- Primaerquelle: Azure-Portal/CLI Nachweise fuer Ressourcen und Sicherheitsregeln
- Live-Nachweis: DNS/HTTP/HTTPS/Port-Checks in Zielumgebung
- Offener Pruefpunkt: klar markierter Restpunkt ohne produktiven Claim

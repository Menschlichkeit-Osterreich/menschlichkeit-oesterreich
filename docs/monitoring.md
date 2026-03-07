# Monitoring & Betrieb – Menschlichkeit Österreich

Dieses Dokument beschreibt die Monitoring-Strategie, Alerting-Konfiguration und operativen Prozesse für die Plattform.

---

## 1. Health-Check-Endpunkte

| Endpunkt | Beschreibung | Erwartete Antwort |
| :--- | :--- | :--- |
| `GET /api/health` | Vollständiger Systemstatus | `{"status": "healthy", ...}` |
| `GET /api/health/db` | Datenbankverbindung | `{"status": "healthy", "latency_ms": <n>}` |
| `GET /api/health/redis` | Redis-Verbindung | `{"status": "healthy", "latency_ms": <n>}` |
| `GET /api/health/civicrm` | CiviCRM-API-Status | `{"status": "healthy" \| "degraded", ...}` |

## 2. Uptime-Monitoring (UptimeRobot)

Folgende Monitore sind einzurichten:

- **Website:** `https://menschlichkeit-oesterreich.at/` – Intervall: 5 Minuten
- **API Health:** `https://menschlichkeit-oesterreich.at/api/health` – Intervall: 5 Minuten
- **n8n:** `https://menschlichkeit-oesterreich.at/n8n/` – Intervall: 15 Minuten

**Alerting:** Bei Ausfall sofortige E-Mail-Benachrichtigung an `admin@menschlichkeit-oesterreich.at` und optional SMS.

## 3. Logging-Strategie

Alle Anwendungskomponenten verwenden **strukturiertes JSON-Logging**. Logs werden auf dem Plesk-Server unter `/var/log/menschlichkeit/` gespeichert und täglich rotiert (max. 30 Tage Aufbewahrung).

```
/var/log/menschlichkeit/
├── api.log          # FastAPI-Anwendungslogs
├── n8n.log          # n8n-Workflow-Logs
├── db-backup.log    # Datenbank-Backup-Protokoll
└── deploy.log       # Deployment-Protokoll
```

## 4. Backup-Strategie

| Komponente | Frequenz | Aufbewahrung | Speicherort |
| :--- | :--- | :--- | :--- |
| PostgreSQL | Täglich 02:00 Uhr | 30 Tage | `/var/backups/postgresql/` |
| Dateien (Uploads) | Täglich 03:00 Uhr | 14 Tage | Plesk Backup-Manager |
| n8n-Workflows | Wöchentlich | 90 Tage | Git-Repository |
| Konfigurationsdateien | Bei jeder Änderung | Unbegrenzt | Git-Repository |

## 5. Incident-Response-Prozess

1. **Erkennung:** UptimeRobot meldet Ausfall → E-Mail/SMS an Admin
2. **Diagnose:** `GET /api/health` prüfen → Logs analysieren
3. **Behebung:** Dienst neu starten (`systemctl restart menschlichkeit-api`)
4. **Eskalation:** Bei DB-Ausfall → Backup einspielen (max. 24h Datenverlust)
5. **Nachbereitung:** Incident-Bericht erstellen und in `docs/incidents/` ablegen

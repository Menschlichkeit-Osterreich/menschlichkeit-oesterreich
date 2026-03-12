# Monitoring-Architektur – Menschlichkeit Österreich

**Version:** 1.0 | **Stack:** Uptime Kuma + Prometheus + Grafana + Alertmanager

---

## Monitoring-Stack-Übersicht

| Werkzeug | Zweck | URL | Zugang |
|---|---|---|---|
| Uptime Kuma | Externes HTTP/TCP-Monitoring + Status-Page | status.menschlichkeit-oesterreich.at | Öffentlich (Status-Page); Admin: intern |
| Prometheus | Metrik-Scraping (Node, App) | monitor.menschlichkeit-oesterreich.at | IP-Whitelist |
| Grafana | Dashboards & Visualisierung | monitor.menschlichkeit-oesterreich.at/grafana | Login + IP-Whitelist |
| Alertmanager | Alarm-Routing | intern | IP-Whitelist |
| node_exporter | Linux-Systemmetriken | intern:9100 | Nur Prometheus-Zugriff |
| Plesk-Monitoring | Ressourcen-Übersicht | Plesk-Panel | Plesk-Login |

---

## Monitoring-Matrix

### Systemmetriken (intern / Prometheus + Grafana)

| Metrik | Schwellenwert Warning | Schwellenwert Critical | Alarmweg | Owner |
|---|---|---|---|---|
| CPU-Auslastung | > 70% (5 Min.) | > 90% (2 Min.) | E-Mail → security@ | Sysadmin |
| RAM-Auslastung | > 80% | > 95% | E-Mail → security@ | Sysadmin |
| Disk / (Root) | > 75% | > 90% | E-Mail → security@ | Sysadmin |
| Disk /var | > 80% | > 95% | E-Mail → security@ | Sysadmin |
| Load Average | > 4.0 | > 8.0 | E-Mail → security@ | Sysadmin |
| Offene File Descriptors | > 80% Limit | > 95% Limit | E-Mail | Sysadmin |
| Swap-Nutzung | > 50% | > 80% | E-Mail | Sysadmin |
| Netzwerk-Traffic (Anomalie) | +200% Baseline | +500% Baseline | E-Mail + Alarm | Sysadmin |

### Dienst-Verfügbarkeit (extern / Uptime Kuma)

| Dienst | Check-URL | Intervall | Timeout | Alarmweg | Owner |
|---|---|---|---|---|---|
| Website (HTTPS) | https://menschlichkeit-oesterreich.at | 60s | 10s | E-Mail + office@ | Admin |
| API Health | https://api.menschlichkeit-oesterreich.at/healthz | 60s | 10s | E-Mail + office@ | Sysadmin |
| API Readiness | https://api.menschlichkeit-oesterreich.at/readyz | 120s | 15s | E-Mail | Sysadmin |
| Nextcloud | https://cloud.menschlichkeit-oesterreich.at/status.php | 120s | 15s | E-Mail | Sysadmin |
| CRM | https://crm.menschlichkeit-oesterreich.at | 120s | 15s | E-Mail | Admin |
| Webmail | https://webmail.menschlichkeit-oesterreich.at | 300s | 15s | E-Mail | Sysadmin |
| Forum | https://forum.menschlichkeit-oesterreich.at | 120s | 15s | E-Mail | Admin |
| Status-Page | https://status.menschlichkeit-oesterreich.at | 120s | 10s | — (Selbstüberwachung) | Sysadmin |

### TLS-Zertifikatsüberwachung

| Domain | Alarm bei Ablauf in | Alarmweg |
|---|---|---|
| menschlichkeit-oesterreich.at | < 30 Tage, < 7 Tage | E-Mail → security@ |
| api.menschlichkeit-oesterreich.at | < 30 Tage | E-Mail → security@ |
| cloud.menschlichkeit-oesterreich.at | < 30 Tage | E-Mail → security@ |
| crm.menschlichkeit-oesterreich.at | < 30 Tage | E-Mail → security@ |
| Alle weiteren Subdomains | < 30 Tage | E-Mail → security@ |

### Datenbanküberwachung (MariaDB)

| Metrik | Schwellenwert | Alarmweg |
|---|---|---|
| Verbindungsanzahl | > 80% `max_connections` | E-Mail → security@ |
| Replikations-Lag | > 60s | E-Mail (kritisch) |
| Slow Queries | > 10/Min. | Log + E-Mail |
| Disk-Nutzung /data | > 80% | E-Mail |
| InnoDB Buffer Pool Hit Rate | < 90% | Log |
| Backup-Status | Kein Backup > 24h | E-Mail (kritisch) |

### Mail-Queue-Überwachung

| Metrik | Schwellenwert | Alarmweg |
|---|---|---|
| Queue-Größe | > 100 | E-Mail → security@ |
| Deferred-Mails | > 50 | E-Mail |
| Bounce-Rate | > 5% | E-Mail → office@ |
| Mailserver-Verfügbarkeit | SMTP Port 25 down | Sofortalarm |

---

## Alarmweg-Eskalationslogik

```
Stufe 1 (Warning):
  → E-Mail an Verantwortlichen
  → Log-Eintrag

Stufe 2 (Critical, > 5 Min.):
  → E-Mail an security@
  → E-Mail an office@

Stufe 3 (Dauerhaft > 30 Min.):
  → Alle Admins benachrichtigen
  → Status-Page aktualisieren

Stufe 4 (Totaler Ausfall):
  → Status-Page: "Maintenance"
  → Sofortbenachrichtigung alle Admins
```

---

## Grafana-Dashboard-Struktur (Empfehlung)

| Dashboard | Inhalt |
|---|---|
| Systemübersicht | CPU, RAM, Disk, Load für alle Dienste |
| Web-Traffic | nginx-Requests, Response-Times, Fehler-Raten |
| API-Performance | FastAPI-Endpunkte, Latenz, Fehler |
| Datenbankstatus | MariaDB-Verbindungen, Queries, Performance |
| Mail-Monitoring | Queue-Größe, Bounce-Rate, SPAM-Score |
| Sicherheit | Failed-Logins, Fail2ban-Bans, 4xx/5xx-Raten |
| Zertifikate | Ablaufdaten aller TLS-Zertifikate |
| Uptime-Übersicht | SLA-Berechnung pro Dienst |

---

## Docker Compose aktivieren

```bash
# Nur Uptime Kuma (Sofortstart)
docker compose -f docker-compose.monitoring.yml up -d uptime-kuma

# Vollständiger Stack
docker compose -f docker-compose.monitoring.yml up -d

# Status prüfen
docker compose -f docker-compose.monitoring.yml ps
```

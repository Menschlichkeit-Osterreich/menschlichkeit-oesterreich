# 08 – Monitoring-Architektur

**Stand**: 2026-03-09
**Status**: Vollständig neu geplant (kein Monitoring aktuell deployed)

---

## Stack-Übersicht

```
Extern (öffentlich):
  Uptime Kuma → status.menschlichkeit-oesterreich.at
    HTTP-Checks, TLS-Checks, Status-Page

Intern (nur Server-Zugang):
  Prometheus :9090
  Grafana    :3000
  Alertmanager :9093
  node_exporter :9100
  mysqld_exporter :9104
  blackbox_exporter :9115
```

---

## Monitor-Inventar

### Externe Checks (Uptime Kuma)

| ID | Service | Typ | URL / Endpoint | Intervall | Alert-Schwelle |
|----|---------|-----|---------------|-----------|----------------|
| 1 | Website (Apex) | HTTP | https://menschlichkeit-oesterreich.at | 1 min | HTTP ≠ 200 |
| 2 | API Healthcheck | HTTP | https://api.menschlichkeit-oesterreich.at/health | 1 min | HTTP ≠ 200 |
| 3 | API Docs | HTTP | https://api.menschlichkeit-oesterreich.at/docs | 5 min | HTTP ≠ 200 |
| 4 | CRM | HTTP | https://crm.menschlichkeit-oesterreich.at | 5 min | HTTP ≠ 200 |
| 5 | Forum | HTTP | https://forum.menschlichkeit-oesterreich.at | 5 min | HTTP ≠ 200 |
| 6 | n8n | HTTP | https://n8n.menschlichkeit-oesterreich.at/healthz | 5 min | HTTP ≠ 200 |
| 7 | Nextcloud | HTTP | https://cloud.menschlichkeit-oesterreich.at/status.php | 5 min | HTTP ≠ 200 |
| 8 | Games | HTTP | https://games.menschlichkeit-oesterreich.at | 5 min | HTTP ≠ 200 |
| 9 | TLS apex | SSL | menschlichkeit-oesterreich.at:443 | tägl. | Ablauf < 14 Tage |
| 10 | TLS api | SSL | api.menschlichkeit-oesterreich.at:443 | tägl. | Ablauf < 14 Tage |
| 11 | TLS crm | SSL | crm.menschlichkeit-oesterreich.at:443 | tägl. | Ablauf < 14 Tage |
| 12 | TLS cloud | SSL | cloud.menschlichkeit-oesterreich.at:443 | tägl. | Ablauf < 14 Tage |
| 13 | TLS n8n | SSL | n8n.menschlichkeit-oesterreich.at:443 | tägl. | Ablauf < 14 Tage |

### Interne Checks (Prometheus)

| Metric | Quelle | Alert-Schwelle |
|--------|--------|----------------|
| CPU-Auslastung | node_exporter | > 80% für 5 min |
| RAM-Nutzung | node_exporter | > 90% |
| Disk-Nutzung | node_exporter | > 85% |
| Disk I/O Wait | node_exporter | > 20% für 5 min |
| MariaDB Connections | mysqld_exporter | > 80% von max_connections |
| MariaDB Slow Queries | mysqld_exporter | > 10/min |
| Redis Memory | redis_exporter | > 90% maxmemory |
| FastAPI Request Rate | prometheus-fastapi-instrumentator | – |
| FastAPI Error Rate | prometheus-fastapi-instrumentator | > 5% HTTP 5xx |
| FastAPI Latenz P95 | prometheus-fastapi-instrumentator | > 2000ms |

---

## docker-compose.monitoring.yml

Die vollständige Monitoring-Stack-Konfiguration befindet sich in `docker-compose.monitoring.yml` im Repository-Root.

---

## Prometheus-Konfiguration

Siehe: `monitoring/prometheus.yml`

---

## Alerting-Eskalationslogik

```
Minute 0:      Service down erkannt (Uptime Kuma / Prometheus)
Minute 1:      Alert-Kanal 1: E-Mail → admin@menschlichkeit-oesterreich.at
Minute 5:      Alert-Kanal 2: Signal/Telegram (empfohlen) → Maintainer
Minute 15:     Zweite E-Mail-Welle + Incident erstellen in Support-System
Minute 30:     P1 deklarieren → Incident Response starten
               → docs/operations/incident-response.md
```

### Alertmanager-Routing

```yaml
# monitoring/alertmanager.yml (gekürzt)
route:
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'email-admin'

  routes:
    - match:
        severity: critical
      receiver: 'email-admin'
      repeat_interval: 15m

receivers:
  - name: 'email-admin'
    email_configs:
      - to: 'admin@menschlichkeit-oesterreich.at'
        from: 'monitoring@menschlichkeit-oesterreich.at'
        smarthost: 'mail.menschlichkeit-oesterreich.at:587'
        auth_username: '${SMTP_USER}'
        auth_password: '${SMTP_PASS}'
        require_tls: true
```

---

## SLO-Definitionen

| Service | SLO | Messfenster | SLI |
|---------|-----|-------------|-----|
| Website | 99.5% | 30 Tage rolling | HTTP 200-Rate aus Uptime Kuma |
| API | 99.0% | 30 Tage rolling | HTTP 200-Rate /health |
| CRM | 99.0% | Geschäftszeiten | HTTP 200-Rate |
| Forum | 98.0% | 30 Tage rolling | HTTP 200-Rate |
| n8n | 95.0% | 30 Tage rolling | /healthz 200-Rate |

**SLO-Berechnung**:
```
Verfügbarkeit = (Total_Minuten - Downtime_Minuten) / Total_Minuten × 100
99.5% bei 30 Tagen = max. 216 Minuten Downtime/Monat
99.0% bei 30 Tagen = max. 432 Minuten Downtime/Monat
```

---

## Grafana-Dashboards

### Empfohlene Dashboards (Grafana.com IDs)

| Dashboard | Grafana ID | Beschreibung |
|-----------|-----------|-------------|
| Node Exporter Full | 1860 | System-Metriken (CPU, RAM, Disk, Network) |
| MariaDB Overview | 7362 | DB-Metriken |
| FastAPI | 15520 | API-Metriken (Requests, Latenz, Errors) |
| Blackbox Exporter | 7587 | HTTP/TLS-Probe-Metriken |
| Redis Exporter | 763 | Redis-Metriken |

### Eigene Dashboards (zu erstellen)

1. **Platform Overview**: Website UP, API UP, CRM UP, n8n UP, SLO-Compliance
2. **Mail Queue**: Postfix Queue Length, Bounce Rate, DMARC-Reports
3. **Security**: Fail2ban Bans/h, ModSecurity Blocks/h, 401/403-Rate pro Subdomain

---

## Deployment-Anleitung (Uptime Kuma – Priorität)

```bash
# 1. Monitoring-Stack starten
docker compose -f docker-compose.monitoring.yml up -d

# 2. Uptime Kuma aufrufen (intern):
#    http://localhost:3001
#    Erster Login: Admin-Account anlegen

# 3. Alle Monitors aus Monitor-Inventar manuell eintragen
#    (oder via API importieren – JSON-Export in monitoring/uptime-kuma-config.json)

# 4. Status-Page anlegen:
#    Status Pages → Create → "Menschlichkeit Österreich Status"
#    URL: status.menschlichkeit-oesterreich.at
#    Alle öffentlichen Monitore hinzufügen

# 5. E-Mail-Alerting konfigurieren:
#    Settings → Notifications → Add Email
#    SMTP: mail.menschlichkeit-oesterreich.at:587
#    Empfänger: admin@menschlichkeit-oesterreich.at

# 6. TLS-Subdomain für status.menschlichkeit-oesterreich.at einrichten
```

---

## Checkliste

```
Sofort (diese Woche):
[ ] docker-compose.monitoring.yml deployen
[ ] Uptime Kuma: alle 13 Monitore anlegen
[ ] Uptime Kuma: E-Mail-Alerting konfigurieren
[ ] Uptime Kuma: Status-Page anlegen
[ ] TLS: status.menschlichkeit-oesterreich.at einrichten

Diesen Monat:
[ ] Prometheus + Grafana: Node Exporter starten
[ ] Grafana: Dashboard-IDs 1860 (Node), 7362 (MariaDB) importieren
[ ] FastAPI: prometheus-fastapi-instrumentator hinzufügen
[ ] Alertmanager: E-Mail-Routing konfigurieren
[ ] mysqld_exporter deployen

Nächstes Quartal:
[ ] SLO-Berichte automatisch exportieren (GitHub Issues)
[ ] Monatlicher Monitoring-Review-Termin
[ ] Security-Dashboard (Fail2ban, ModSecurity) einrichten
[ ] Mail-Queue-Monitoring
```

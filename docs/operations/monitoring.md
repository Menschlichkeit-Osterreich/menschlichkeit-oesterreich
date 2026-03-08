# Monitoring & Observability – Menschlichkeit Österreich

**Stand**: 2026-03-08 | **Review**: Quartalsweise

---

## Monitor-Liste (tabellarisch)

| # | Service / Endpunkt | Typ | URL / Host | Intervall | Timeout | Alert-Schwelle | Alert-Kanal | Owner |
|---|-------------------|-----|-----------|-----------|---------|---------------|-------------|-------|
| 1 | Website (Apex) | HTTP | https://menschlichkeit-oesterreich.at | 1 min | 10s | HTTP ≠ 200 | E-Mail | Maintainer |
| 2 | API Healthcheck | HTTP | https://api.menschlichkeit-oesterreich.at/health | 1 min | 10s | HTTP ≠ 200 | E-Mail | Backend |
| 3 | API Docs | HTTP | https://api.menschlichkeit-oesterreich.at/docs | 5 min | 15s | HTTP ≠ 200 | E-Mail | Backend |
| 4 | CRM | HTTP | https://crm.menschlichkeit-oesterreich.at | 5 min | 15s | HTTP ≠ 200 | E-Mail | DevOps |
| 5 | Forum | HTTP | https://forum.menschlichkeit-oesterreich.at | 5 min | 15s | HTTP ≠ 200 | E-Mail | DevOps |
| 6 | n8n | HTTP | https://n8n.menschlichkeit-oesterreich.at/healthz | 5 min | 15s | HTTP ≠ 200 | E-Mail | DevOps |
| 7 | TLS Zertifikat Website | SSL | menschlichkeit-oesterreich.at:443 | Täglich | — | Ablauf < 14 Tage | E-Mail | DevOps |
| 8 | TLS Zertifikat API | SSL | api.menschlichkeit-oesterreich.at:443 | Täglich | — | Ablauf < 14 Tage | E-Mail | DevOps |
| 9 | TLS Zertifikat CRM | SSL | crm.menschlichkeit-oesterreich.at:443 | Täglich | — | Ablauf < 14 Tage | E-Mail | DevOps |
| 10 | PostgreSQL (lokal) | TCP | localhost:5432 | 1 min | 5s | Keine Verbindung | E-Mail | DevOps |
| 11 | Redis (lokal) | TCP | localhost:6379 | 1 min | 5s | Keine Verbindung | E-Mail | DevOps |
| 12 | OpenClaw Agent-Runtime | HTTP | http://localhost:9100/health | 2 min | 10s | HTTP ≠ 200 | E-Mail | DevOps |
| 13 | OpenClaw Tool-Gateway | HTTP | http://localhost:9101/health | 2 min | 10s | HTTP ≠ 200 | E-Mail | DevOps |

---

## SLO-Grundgerüst

| Service | SLO (Verfügbarkeit) | Messfenster |
|---------|--------------------|-----------|
| Website | 99.5% | 30 Tage (rolling) |
| API | 99.0% | 30 Tage (rolling) |
| CRM | 99.0% (Geschäftszeiten) | 30 Tage (rolling) |
| Forum | 98.0% | 30 Tage (rolling) |

**SLI (Service Level Indicator):** HTTP 200-Rate aus Uptime-Monitor-Daten.

**Aktuelle Erfüllung:** manuell prüfen bis automatisches Dashboard eingerichtet.

---

## Tools & Empfehlungen

### Empfohlen: Uptime Kuma (selbstgehostet)

Uptime Kuma ist eine selbstgehostete, datenschutzkonforme Monitoring-Lösung:

```yaml
# docker-compose.monitoring.yml (Beispiel – Annahme: separater VPS oder Plesk-Server)
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - uptime-kuma:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped
```

Nach dem Start alle Monitor-Einträge aus der obigen Tabelle manuell eintragen.

### Bestehende Monitoring-Skripte

```bash
# Service-Status-Check (Codespace-Diagnose):
npm run status:check       # Schnell
npm run status:verbose     # Detailliert
npm run status:json        # JSON-Export für Weiterverarbeitung
```

---

## Healthcheck-Endpunkte

Alle Services sollen einen `/health`-Endpunkt anbieten:

### FastAPI (bereits vorhanden oder ergänzen)

```python
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
```

### Drupal

Standard-Healthcheck via HTTP 200 auf der Homepage oder `/<path>/health`.

---

## Alerting

**Minimal-Setup (E-Mail):**
- Alert: Wenn Service > 1 Minute nicht erreichbar
- Recovery: Wenn Service wieder erreichbar
- TLS-Ablauf: 14 Tage Vorwarnung, dann täglich

**Eskalationslogik:**

```
Minute 0:     Service down erkannt
Minute 1:     Erster Alert → E-Mail (Maintainer)
Minute 15:    Zweiter Alert → E-Mail + persönliche Benachrichtigung
Minute 30:    P1 deklarieren → Incident Response starten
              docs/operations/incident-response.md
```

---

## Logs

### Lokale Entwicklung

```bash
npm run docker:logs          # Alle Container
docker-compose logs -f api   # Nur API
docker-compose logs -f postgres
```

### Produktion

Logs auf Plesk: `httpdocs/logs/` oder via Plesk → Domains → Logs.

**Log-Rotation:** Täglich, max. 90 Tage Retention.

```bash
# Logs bereinigen (lokal):
npm run logs:purge --dry-run
npm run logs:purge
```

---

## Metriken

**Aktuell:** Keine automatisierten Metriken-Dashboards vorhanden.

**Empfehlung für nächsten Sprint:**
1. FastAPI: `prometheus-fastapi-instrumentator` → Metriken unter `/metrics`
2. Grafana + Prometheus (Docker Compose ergänzen)
3. Standard-Metriken: Request-Rate, Error-Rate, Latenz (P50/P95/P99)

---

## Wartungsfenster

| Typ | Zeitfenster | Ankündigung |
|-----|------------|-------------|
| Geplante Maintenance | Sonntag 02:00–04:00 Uhr | 48h vorher via Status-Banner |
| Security Patches (CRITICAL) | Sofort | Kein Fenster nötig |
| Dependency Updates | Dienstag 22:00 Uhr (nach CI) | 24h vorher |

---

## Checkliste: Monitoring-Einrichtung (TODO)

```
[ ] Uptime Kuma installieren (oder SaaS-Alternative wählen)
[ ] Alle Monitor-Einträge aus obiger Tabelle eintragen
[ ] Alert-E-Mail konfigurieren: ops@menschlichkeit-oesterreich.at
[ ] TLS-Ablauf-Alerts aktivieren (Schwelle: 14 Tage)
[ ] Monatlicher Monitoring-Review (jedes 1. Wochenende)
[ ] FastAPI /health Endpunkt verifizieren
[ ] SLO-Daten-Export in GitHub Issues (monatlich)
```

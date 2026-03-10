# Infrastruktur-Audit: Menschlichkeit Österreich

**Audit-Datum**: 2026-03-09
**Durchgeführt von**: Senior Infrastructure Architect / Platform Security Auditor
**Scope**: Vollständige technische Analyse der NGO-Plattform als zusammenhängendes Gesamtsystem
**Branch**: `claude/ngo-platform-infrastructure-audit-oPjYt`

---

## Audit-Dokumente

| Nr. | Datei | Inhalt | Status |
|-----|-------|--------|--------|
| 00 | [Executive Summary](./00-executive-summary.md) | Risiko-Dashboard, Top-Maßnahmen | ✅ |
| 01 | [Ist-Analyse](./01-ist-analyse.md) | Verifizierbarer Ist-Zustand | ✅ |
| 02 | [Kritische Risiken](./02-kritische-risiken.md) | Risikomatrix P0–P3 | ✅ |
| 03 | [Plesk-Optimierung](./03-plesk-optimierung.md) | TLS, Firewall, PHP, Hardening | ✅ |
| 04 | [E-Mail-Architektur](./04-email-architektur.md) | SPF/DKIM/DMARC, Rollenstruktur | ✅ |
| 05 | [Subdomain-Architektur](./05-subdomain-architektur.md) | Service-Trennung, Routing, TLS | ✅ |
| 06 | [Nextcloud-Architektur](./06-nextcloud-architektur.md) | Storage, Backup, DSGVO | ✅ |
| 07 | [MariaDB-Architektur](./07-mariadb-architektur.md) | DB-Trennung, Least Privilege | ✅ |
| 08 | [Monitoring-Architektur](./08-monitoring-architektur.md) | Uptime Kuma, Grafana, SLO | ✅ |
| 09 | [Security Hardening](./09-security-hardening.md) | WAF, SSH, Headers, Secrets | ✅ |
| 10 | [Repo & CI/CD](./10-repo-cicd-verbesserungen.md) | GitHub Actions, SBOM, Fixes | ✅ |
| 11 | [Dokumentationsstruktur](./11-dokumentations-zielstruktur.md) | docs/-Hierarchie, ADR, Runbooks | ✅ |
| 12 | [Zielarchitektur](./12-zielarchitektur.md) | Ist→Soll, Roadmap, Meilensteine | ✅ |
| 13 | [Sofortmaßnahmen](./13-sofortmassnahmen.md) | Priorisierte Aktionsliste P0→P3 | ✅ |

---

## Konfigurationsartefakte (durch Audit erstellt)

| Datei | Zweck |
|-------|-------|
| `docker-compose.monitoring.yml` | Uptime Kuma + Grafana + Prometheus |
| `monitoring/prometheus.yml` | Scrape-Konfiguration |
| `monitoring/alertmanager.yml` | Alert-Routing |
| `monitoring/grafana/provisioning/` | Grafana-Datasources |
| `.github/workflows/ssl-cert-check.yml` | Tägl. TLS-Ablauf-Überwachung |
| `scripts/db-user-setup.sql` | MariaDB Least-Privilege-Setup |
| `scripts/ssl-cert-check.sh` | Shell-Skript für TLS-Check |

---

## Bug-Fixes (durch Audit identifiziert und behoben)

| Datei | Problem | Fix |
|-------|---------|-----|
| `automation/n8n/.env.example` | **P0**: Klartext-Credentials im Repo | Sanitisiert, CHANGE_ME-Platzhalter |
| `docker-compose.prod.yml` | **P0**: Redis ohne `--requirepass` | `--requirepass ${REDIS_PASSWORD}` |
| `docker-compose.prod.yml` | **P0**: Doppelter `environment:`-Key in `redis_backup` | Zu einem Block zusammengefasst |
| `.github/workflows/deploy-plesk.yml` | **P1**: Node.js 20 statt 22 | `node-version: "22"` |

---

## Hinweiskonventionen

> **verifiziert** — aus Repo/Konfigurationsdateien direkt abgeleitet
> **wahrscheinlich** — aus Systemkonfiguration oder Dokumentation erschlossen
> **empfohlen** — Best-Practice-Empfehlung ohne direkten Nachweis

---

## Nächste Schritte

1. Alle P0-Maßnahmen aus [13-sofortmassnahmen.md](./13-sofortmassnahmen.md) innerhalb 48h umsetzen
2. Rotierte Credentials in GitHub Secrets und SOPS hinterlegen
3. Monitoring-Stack deployen (siehe [08-monitoring-architektur.md](./08-monitoring-architektur.md))
4. Quarterly Review: nächster Audit-Termin 2026-06-09

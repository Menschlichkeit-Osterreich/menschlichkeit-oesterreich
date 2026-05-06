# 12 – Zielarchitektur

**Stand**: 2026-03-09
**Horizont**: 12 Monate (3 Phasen)

---

## Ist-Zustand (Current State)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER: 5.183.217.146                 │
│                    Plesk + nginx/1.28.0 + PHP 8.4.11           │
│                    MariaDB 10.6.22                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Frontend │  │  FastAPI │  │  Drupal  │  │   n8n    │       │
│  │ React+   │  │  :8001   │  │ +CiviCRM │  │  :5678   │       │
│  │  Vite    │  │          │  │  :8000   │  │  Docker  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               MariaDB 10.6.22                        │      │
│  │  (Alle Services, 1-2 DBs, kein Least Privilege)      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  Monitoring: ❌ KEINES                                           │
│  Backup: wahrscheinlich Plesk-intern                            │
│  Deployment: rsync (kein Zero-Downtime)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Ziel-Zustand (Target State)

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE / CDN                              │
│           WAF, DDoS-Schutz, Rate Limiting, Edge-Caching               │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    REVERSE PROXY (nginx)                               │
│              TLS-Termination, Security-Headers, Routing                │
│                                                                        │
│  apex/www ──→ Frontend (Next.js/React)                                │
│  api ──────→ FastAPI (Docker :8001)                                   │
│  crm ──────→ Drupal + CiviCRM (Docker :8000)                         │
│  cloud ────→ Nextcloud (Docker :8080)                                 │
│  forum ────→ Forum-System (Docker :8082)                              │
│  support ──→ Ticketing (Docker :8083)                                 │
│  vote ─────→ Voting (Docker :8084)                                    │
│  n8n ──────→ n8n (Docker :5678, intern only)                         │
│  status ───→ Uptime Kuma (Docker :3001)                               │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    DATENBANK-SCHICHT                                   │
│                                                                        │
│  MariaDB 10.6 (Plesk) oder PostgreSQL 16 (konsolidiert)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ moe_main │ │ moe_crm  │ │moe_forum │ │moe_vote  │ │ moe_n8n  │   │
│  │ api_user │ │ crm_user │ │forum_user│ │vote_user │ │ n8n_user │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    MONITORING-STACK                                    │
│                                                                        │
│  Extern: Uptime Kuma → status.menschlichkeit-oesterreich.at           │
│  Intern: Prometheus + Grafana + Alertmanager + node_exporter          │
│  Alerts: E-Mail → admin@ / Signal/Telegram                            │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Security & Stabilität (0–3 Monate)

**Ziel**: Kritische Risiken beseitigen, Monitoring deployen, Mailboxen anlegen.

| Maßnahme | Status | Aufwand |
|----------|--------|---------|
| P0: Credentials rotieren (n8n, Redis, Plesk) | ⚡ Sofort | 2h |
| P0: n8n .env.example sanitisiert | ✅ Done | – |
| P0: Redis --requirepass | ✅ Done | – |
| P0: docker-compose.prod.yml YAML-Bug | ✅ Done | – |
| P1: deploy-plesk.yml Node.js 22 | ✅ Done | – |
| P1: Mailboxen anlegen (8 fehlende) | ⚡ Sofort | 1h |
| P1: Uptime Kuma deployen | Diese Woche | 2h |
| P1: TLS-Check GitHub Action deployen | ✅ Done | – |
| P2: Plesk Security-Header konfigurieren | Diesen Monat | 2h |
| P2: Fail2ban für Plesk + Mail aktivieren | Diesen Monat | 1h |
| P2: DMARC Phase 1 (p=none) setzen | Diesen Monat | 30min |
| P2: MariaDB Backup-User + Backup-Script | Diesen Monat | 2h |
| P2: .nvmrc anlegen | Diese Woche | 5min |

---

## Phase 2: Infrastruktur-Modernisierung (3–6 Monate)

**Ziel**: Datenbankisolation, Nextcloud, Zero-Downtime-Deployment, Prometheus/Grafana.

| Maßnahme | Aufwand |
|----------|---------|
| MariaDB: Service-isolierte Datenbanken anlegen | 4h |
| MariaDB: Least-Privilege-User für alle Services | 2h |
| MariaDB: Binlog für PITR aktivieren | 1h |
| Nextcloud: Deployment unter cloud.menschlichkeit-oesterreich.at | 1 Tag |
| Deployment: Symlink-Swap (Zero-Downtime) einrichten | 2h |
| Deployment: Rollback-Mechanismus implementieren | 2h |
| Prometheus + node_exporter + Grafana deployen | 4h |
| FastAPI: prometheus-fastapi-instrumentator einbauen | 1h |
| DMARC: Phase 2 (p=quarantine) nach 30 Tagen Reports | 30min |
| Forum-System: Evaluierung und Deployment | 1-2 Tage |
| OpenAPI-Drift-Test in CI | 1h |

---

## Phase 3: Containerisierung & Skalierung (6–12 Monate)

**Ziel**: Vollständige Docker-basierte Plattform, Cloudflare-Integration, optionale Kubernetes-Migration.

| Maßnahme | Aufwand |
|----------|---------|
| Alle Services in Docker Container | 1 Woche |
| Nginx Reverse Proxy mit einheitlichem Routing | 2 Tage |
| Cloudflare als CDN und WAF (optional) | 1 Tag |
| Support-System deployen | 2 Tage |
| Voting-System deployen | 2 Tage |
| DMARC: Phase 3 (p=reject) nach 90 Tagen Reports | 30min |
| OpenClaw: Produktions-Deployment planen | 2 Wochen |
| PostgreSQL-Migration evaluieren (unified DB) | Analyse 1 Woche |
| ADRs für alle offenen Entscheidungen schreiben | 4h |
| SBOM-Gate im Releaseprozess | 2h |

---

## Technik-Stack Soll-Zustand

| Schicht | Technologie | Status |
|---------|------------|--------|
| CDN/WAF | Cloudflare Free/Pro | Empfohlen |
| Reverse Proxy | nginx (bereits vorhanden) | Optimieren |
| Frontend | React 18 + Vite (→ Next.js optional) | Aktuell |
| API | FastAPI Python 3.12+ | Aktuell |
| CRM | Drupal 10 + CiviCRM | Aktuell |
| Cloud Storage | Nextcloud 28 | Deployment nötig |
| Automation | n8n | Aktuell |
| Datenbank | MariaDB 10.6 (→ PostgreSQL unified) | Entscheidung offen |
| Cache | Redis 7 | Aktuell |
| Monitoring Extern | Uptime Kuma | Deployment nötig |
| Monitoring Intern | Prometheus + Grafana | Deployment nötig |
| Alerting | Alertmanager + E-Mail | Deployment nötig |
| Secrets | SOPS + GitHub Secrets | Teilweise aktiv |
| Deployment | Symlink-Swap (→ Docker Compose) | Verbesserung nötig |

---

## Entscheidungsmatrix: MariaDB vs. PostgreSQL

| Kriterium | MariaDB (Ist) | PostgreSQL (Soll-Option) |
|-----------|--------------|--------------------------|
| Drupal/CiviCRM | ✅ Native Unterstützung | ⚠ Experimentell |
| FastAPI/Alembic | ⚠ Dialekt-Unterschiede | ✅ Native |
| Prisma/Games | ⚠ Eingeschränkte Features | ✅ Full Feature Support |
| Plesk-Integration | ✅ Nativ | ⚠ Aufwendiger |
| Migrationsaufwand | – | Hoch (mehrere Wochen) |
| **Empfehlung** | Kurzfristig: MariaDB behalten | Mittelfristig: PostgreSQL evaluieren |

# Subdomänen-Verzeichnis: menschlichkeit-oesterreich.at

**Hauptdomain:** menschlichkeit-oesterreich.at  
**Hosting:** Plesk  
**Letzte Aktualisierung:** 2025-10-04  
**Status:** 19 aktive Subdomänen

---

## 📋 Vollständige Subdomänenübersicht

| Subdomain                                    | Zweck                              | Status   | Speicher | Verkehr | Service          | Port |
| -------------------------------------------- | ---------------------------------- | -------- | -------- | ------- | ---------------- | ---- |
| **api.stg.menschlichkeit-oesterreich.at**    | Staging FastAPI Backend            | ✅ Aktiv | 1.1 MB   | 0 MB    | FastAPI          | 8001 |
| **admin.stg.menschlichkeit-oesterreich.at**  | Staging Admin Panel                | ✅ Aktiv | 0.1 MB   | 0 MB    | React Admin      | 3001 |
| **analytics.menschlichkeit-oesterreich.at**  | Web Analytics (Matomo/Plausible)   | ✅ Aktiv | 0.1 MB   | 0 MB    | Analytics        | -    |
| **consent.menschlichkeit-oesterreich.at**    | DSGVO Consent Management           | ✅ Aktiv | 0.1 MB   | 0 MB    | Consent Platform | -    |
| **crm.menschlichkeit-oesterreich.at**        | CiviCRM + Drupal 10                | ✅ Aktiv | 0.9 MB   | 0 MB    | Drupal/CiviCRM   | 8000 |
| **docs.menschlichkeit-oesterreich.at**       | Dokumentation (GitBook/Docusaurus) | ✅ Aktiv | 0.1 MB   | 0 MB    | Static Docs      | -    |
| **forum.menschlichkeit-oesterreich.at**      | Community Forum (Discourse)        | ✅ Aktiv | 0.1 MB   | 0 MB    | Discourse        | -    |
| **games.menschlichkeit-oesterreich.at**      | Educational Web Games              | ✅ Aktiv | 0.1 MB   | 0 MB    | Static HTML/JS   | 3000 |
| **grafana.menschlichkeit-oesterreich.at**    | Monitoring Dashboards              | ✅ Aktiv | 0.1 MB   | 0 MB    | Grafana          | -    |
| **hooks.menschlichkeit-oesterreich.at**      | Webhook Receiver (n8n)             | ✅ Aktiv | 0.1 MB   | 0 MB    | n8n Webhooks     | -    |
| **idp.menschlichkeit-oesterreich.at**        | Identity Provider (Keycloak)       | ✅ Aktiv | 0.1 MB   | 0 MB    | Keycloak         | -    |
| **logs.menschlichkeit-oesterreich.at**       | **ELK Stack (Kibana)**             | ✅ Aktiv | 0.1 MB   | 0 MB    | Kibana           | 5601 |
| **media.menschlichkeit-oesterreich.at**      | Media Asset Storage (S3/CDN)       | ✅ Aktiv | 0.1 MB   | 0 MB    | MinIO/S3         | -    |
| **n8n.menschlichkeit-oesterreich.at**        | Workflow Automation                | ✅ Aktiv | 0.1 MB   | 0 MB    | n8n              | 5678 |
| **newsletter.menschlichkeit-oesterreich.at** | Newsletter Management (Listmonk)   | ✅ Aktiv | 0.1 MB   | 0 MB    | Listmonk         | -    |
| **s3.menschlichkeit-oesterreich.at**         | Object Storage (MinIO)             | ✅ Aktiv | 0.1 MB   | 0 MB    | MinIO            | -    |
| **status.menschlichkeit-oesterreich.at**     | Uptime Status Page (Uptime Kuma)   | ✅ Aktiv | 0.1 MB   | 0 MB    | Uptime Kuma      | -    |
| **support.menschlichkeit-oesterreich.at**    | Support Ticket System (osTicket)   | ✅ Aktiv | 0.1 MB   | 0 MB    | osTicket         | -    |
| **votes.menschlichkeit-oesterreich.at**      | Voting Platform (Decidim)          | ✅ Aktiv | 0.1 MB   | 0 MB    | Decidim          | -    |

---

## 🔍 Kategorisierung nach Funktion

### 🛠️ Core Application Services

- **crm.menschlichkeit-oesterreich.at**: Drupal 10 + CiviCRM (Mitgliederverwaltung, Newsletter, Spenden)
- **api.stg.menschlichkeit-oesterreich.at**: FastAPI Staging Backend (REST API für Frontend)
- **admin.stg.menschlichkeit-oesterreich.at**: React Admin Staging (Verwaltungsoberfläche)
- **games.menschlichkeit-oesterreich.at**: Educational Web Games (Demokratie-Spiele)

### 📊 Monitoring & Logging

- **logs.menschlichkeit-oesterreich.at**: **Kibana Dashboard (ELK Stack)** 🎯
- **grafana.menschlichkeit-oesterreich.at**: Performance Monitoring & Metriken
- **status.menschlichkeit-oesterreich.at**: Uptime Monitoring & Status Page
- **analytics.menschlichkeit-oesterreich.at**: Web Analytics (Matomo/Plausible)

### 🤖 Automation & Integration

- **n8n.menschlichkeit-oesterreich.at**: Workflow Automation Engine
- **hooks.menschlichkeit-oesterreich.at**: Webhook Receiver (GitHub, GitLab, Stripe)

### 💾 Storage & Media

- **media.menschlichkeit-oesterreich.at**: CDN für Bilder, Videos, Dokumente
- **s3.menschlichkeit-oesterreich.at**: MinIO Object Storage (S3-kompatibel)

### 🔐 Identity & Access Management

- **idp.menschlichkeit-oesterreich.at**: Keycloak Identity Provider (SSO)
- **consent.menschlichkeit-oesterreich.at**: DSGVO Consent Management Platform

### 📢 Communication & Engagement

- **newsletter.menschlichkeit-oesterreich.at**: Newsletter-Versand (Listmonk)
- **forum.menschlichkeit-oesterreich.at**: Community-Diskussionen (Discourse)
- **votes.menschlichkeit-oesterreich.at**: Demokratische Abstimmungen (Decidim)
- **support.menschlichkeit-oesterreich.at**: Support-Tickets (osTicket)

### 📚 Documentation

- **docs.menschlichkeit-oesterreich.at**: Technische Dokumentation & Guides

---

## 🚀 Production vs. Staging

### Production Subdomains

Alle Subdomänen **ohne** `.stg` Suffix sind Production-Instanzen:

- `crm.menschlichkeit-oesterreich.at`
- `n8n.menschlichkeit-oesterreich.at`
- `logs.menschlichkeit-oesterreich.at`
- etc.

### Staging Subdomains

Subdomänen mit `.stg` Suffix für Testing:

- `api.stg.menschlichkeit-oesterreich.at` → Staging FastAPI
- `admin.stg.menschlichkeit-oesterreich.at` → Staging Admin

**Missing Staging Instances:**

- ⚠️ `crm.stg.menschlichkeit-oesterreich.at` (empfohlen)
- ⚠️ `n8n.stg.menschlichkeit-oesterreich.at` (empfohlen)
- ⚠️ `games.stg.menschlichkeit-oesterreich.at` (optional)

---

## 🔌 Log-Aggregation-Strategie (ELK Stack)

### Phase 4: Centralized Logging

**Ziel:** Alle Services senden Logs an **logs.menschlichkeit-oesterreich.at** (Kibana)

#### Service-Log-Routing

| Service              | Subdomain                                | Log-Destination | Method              |
| -------------------- | ---------------------------------------- | --------------- | ------------------- |
| **FastAPI Staging**  | api.stg.menschlichkeit-oesterreich.at    | Elasticsearch   | Filebeat → Logstash |
| **CiviCRM/Drupal**   | crm.menschlichkeit-oesterreich.at        | Elasticsearch   | Syslog → Logstash   |
| **n8n Workflows**    | n8n.menschlichkeit-oesterreich.at        | Elasticsearch   | Filebeat → Logstash |
| **Games (Frontend)** | games.menschlichkeit-oesterreich.at      | Elasticsearch   | HTTP → Logstash     |
| **Grafana**          | grafana.menschlichkeit-oesterreich.at    | Elasticsearch   | Loki → Logstash     |
| **Keycloak**         | idp.menschlichkeit-oesterreich.at        | Elasticsearch   | Filebeat → Logstash |
| **Listmonk**         | newsletter.menschlichkeit-oesterreich.at | Elasticsearch   | Filebeat → Logstash |

#### Logstash Input Ports

```yaml
# Logstash Inputs
input {
  beats {
    port => 5044  # Filebeat (FastAPI, n8n, Keycloak, Listmonk)
  }

  syslog {
    port => 5140  # Syslog (Drupal/CiviCRM)
    type => "syslog"
  }

  http {
    port => 8080  # HTTP API (Frontend Logs)
    codec => json
  }
}
```

---

## 🌐 DNS & Reverse Proxy Configuration

### Nginx Reverse Proxy

**Alle Subdomänen** laufen hinter **Nginx** mit:

- ✅ TLS/SSL (Let's Encrypt)
- ✅ HTTP/2
- ✅ Rate Limiting
- ✅ IP Whitelisting (admin/staging Subdomänen)

**Beispiel:** `logs.menschlichkeit-oesterreich.at`

```nginx
# /etc/nginx/sites-available/logs.menschlichkeit-oesterreich.at
server {
    listen 443 ssl http2;
    server_name logs.menschlichkeit-oesterreich.at;

    ssl_certificate /etc/letsencrypt/live/logs.menschlichkeit-oesterreich.at/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/logs.menschlichkeit-oesterreich.at/privkey.pem;

    # IP Whitelisting (nur DevOps-Team)
    allow 94.45.XXX.XXX;  # Office IP
    allow 10.0.0.0/8;     # Internal network
    deny all;

    location / {
        proxy_pass http://localhost:5601;  # Kibana
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket Support (für Kibana Live Updates)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📊 Storage & Traffic Analysis

### Current Usage (as of 2025-10-04)

**Total Storage:** ~4 MB (minimal, mostly placeholders)  
**Total Traffic:** 0 MB/month (services not yet in production)

**Projected Growth (Q1 2026):**

- **crm.menschlichkeit-oesterreich.at**: ~2 GB (CiviCRM database, file uploads)
- **logs.menschlichkeit-oesterreich.at**: ~50 GB (Elasticsearch indices, 30-day retention)
- **media.menschlichkeit-oesterreich.at**: ~10 GB (Images, Videos, PDFs)
- **s3.menschlichkeit-oesterreich.at**: ~20 GB (Object storage)
- **analytics.menschlichkeit-oesterreich.at**: ~1 GB (Matomo database)

**Total Projected:** ~83 GB

---

## 🔒 Security & Access Control

### Public Subdomains (No IP Restriction)

- `crm.menschlichkeit-oesterreich.at` (Membership portal)
- `games.menschlichkeit-oesterreich.at` (Educational games)
- `votes.menschlichkeit-oesterreich.at` (Public voting)
- `forum.menschlichkeit-oesterreich.at` (Community forum)
- `docs.menschlichkeit-oesterreich.at` (Public documentation)
- `status.menschlichkeit-oesterreich.at` (Uptime status)

### Restricted Subdomains (IP Whitelisting + Authentication)

- `logs.menschlichkeit-oesterreich.at` → **Kibana (ELK Stack)** 🔐
- `grafana.menschlichkeit-oesterreich.at` → Monitoring Dashboards 🔐
- `n8n.menschlichkeit-oesterreich.at` → Workflow Admin 🔐
- `admin.stg.menschlichkeit-oesterreich.at` → Staging Admin 🔐
- `api.stg.menschlichkeit-oesterreich.at` → Staging API (Basic Auth) 🔐

### Internal Subdomains (VPN/Tailscale Only)

- `s3.menschlichkeit-oesterreich.at` → Object Storage (Internal API)
- `hooks.menschlichkeit-oesterreich.at` → Webhooks (HMAC-signed)

---

## 🛠️ Deployment & CI/CD

### Automated Deployment Triggers

| Subdomain                               | Git Webhook                        | Deploy Script                              |
| --------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `api.stg.menschlichkeit-oesterreich.at` | ✅ GitHub Push (branch: `staging`) | `./deployment-scripts/deploy-api-plesk.sh` |
| `crm.menschlichkeit-oesterreich.at`     | ✅ GitHub Push (branch: `main`)    | `./deployment-scripts/deploy-crm-plesk.sh` |
| `games.menschlichkeit-oesterreich.at`   | ✅ GitHub Push (branch: `main`)    | `./scripts/deploy-games.sh`                |

### Manual Deployment

```bash
# Deploy to specific subdomain
./scripts/safe-deploy.sh --subdomain logs.menschlichkeit-oesterreich.at --dry-run

# Apply deployment
./scripts/safe-deploy.sh --subdomain logs.menschlichkeit-oesterreich.at --apply
```

---

## 📋 Maintenance Schedule

### SSL Certificate Renewal

- **Provider:** Let's Encrypt
- **Renewal:** Automatic (Certbot cron job)
- **Next Check:** Every 60 days

### Backup Schedule

- **crm.menschlichkeit-oesterreich.at**: Daily (3:00 AM UTC)
- **logs.menschlichkeit-oesterreich.at**: Weekly (Elasticsearch snapshots)
- **media.menschlichkeit-oesterreich.at**: Daily (Incremental)

### Uptime Monitoring

- **Tool:** Uptime Kuma (status.menschlichkeit-oesterreich.at)
- **Check Interval:** 60 seconds
- **Alerts:** Email + Slack

---

## 🎯 Roadmap: Geplante Subdomänen

### Q1 2026

- [ ] `api.menschlichkeit-oesterreich.at` (Production FastAPI)
- [ ] `admin.menschlichkeit-oesterreich.at` (Production Admin)
- [ ] `app.menschlichkeit-oesterreich.at` (Progressive Web App)
- [ ] `mail.menschlichkeit-oesterreich.at` (Mailserver/Webmail)

### Q2 2026

- [ ] `dev.menschlichkeit-oesterreich.at` (Development Environment)
- [ ] `test.menschlichkeit-oesterreich.at` (QA/Testing)
- [ ] `cdn.menschlichkeit-oesterreich.at` (Cloudflare CDN)

### Q3 2026

- [ ] `shop.menschlichkeit-oesterreich.at` (Merchandise Shop)
- [ ] `events.menschlichkeit-oesterreich.at` (Event Management)

---

## 📞 Kontakt & Support

**DevOps-Team:** devops@menschlichkeit-oesterreich.at  
**Plesk-Admin:** admin@menschlichkeit-oesterreich.at  
**Emergency Contact:** +43 XXX XXXXXXX

---

**Autor:** AI DevOps Agent  
**Letzte Aktualisierung:** 2025-10-04  
**Nächste Review:** 2026-01-04

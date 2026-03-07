# Plesk Hosting – Best Practices für Menschlichkeit Österreich

Dieses Dokument beschreibt die empfohlene Konfiguration und Best Practices für das Plesk-Hosting der Vereinsplattform, basierend auf offizieller Plesk-Dokumentation und bewährten Methoden für NGO-Webapplikationen.

---

## 1. Datenbankarchitektur

### 1.1 PostgreSQL auf Plesk (empfohlen)

Die Plattform verwendet **PostgreSQL 15+** als primäre Datenbank. PostgreSQL bietet gegenüber MariaDB/MySQL für dieses Projekt entscheidende Vorteile: native JSON/JSONB-Unterstützung für flexible Datenstrukturen, überlegene Transaktionssicherheit (ACID-Compliance) und bessere Performance bei komplexen Abfragen.

**Installation und Konfiguration:**

```bash
# PostgreSQL-Erweiterung in Plesk aktivieren
plesk installer --select-release-current --install-component postgresql

# PostgreSQL-Dienst starten
systemctl enable postgresql
systemctl start postgresql
```

**Empfohlene `postgresql.conf`-Einstellungen für einen Produktionsserver:**

```ini
# Speicher (angepasst an 4 GB RAM-Server)
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 16MB
maintenance_work_mem = 256MB

# Verbindungen
max_connections = 100

# WAL & Replikation
wal_level = replica
max_wal_size = 1GB

# Logging
log_min_duration_statement = 1000  # Queries > 1 Sekunde loggen
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

### 1.2 Datenbankstruktur (Mehrere Datenbanken)

| Datenbank | Zweck | Benutzer |
| :--- | :--- | :--- |
| `menschlichkeit_prod` | Hauptdatenbank (Website, API) | `menschlichkeit_app` |
| `civicrm_prod` | CiviCRM-Datenbank | `civicrm_user` |
| `n8n_prod` | n8n-Workflow-Datenbank | `n8n_user` |

> **Sicherheitsprinzip:** Jede Anwendung erhält einen eigenen Datenbankbenutzer mit minimalen Rechten (`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO menschlichkeit_app;`). Kein Benutzer erhält `SUPERUSER`-Rechte.

### 1.3 Automatische Backups

Plesk bietet integrierte Backup-Funktionalität. Zusätzlich empfehlen wir ein skriptbasiertes Backup:

```bash
#!/bin/bash
# /opt/scripts/db-backup.sh
# Täglich um 02:00 Uhr via Cron ausführen

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y-%m-%d)
DB_NAME="menschlichkeit_prod"

mkdir -p "$BACKUP_DIR/$DATE"

# Vollständiges Backup mit pg_dump
pg_dump -U postgres -Fc "$DB_NAME" > "$BACKUP_DIR/$DATE/${DB_NAME}.dump"

# Backups älter als 30 Tage löschen
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} +

echo "Backup abgeschlossen: $BACKUP_DIR/$DATE/${DB_NAME}.dump"
```

**Cron-Eintrag in Plesk (Scheduled Tasks):**
```
0 2 * * * /opt/scripts/db-backup.sh >> /var/log/db-backup.log 2>&1
```

---

## 2. CI/CD-Pipeline mit GitHub Actions und Plesk

### 2.1 Architektur

```
GitHub Repository
    │
    ├── Push to `develop` → Deploy to STAGING (menschlichkeit-staging.at)
    └── Push to `main`    → Deploy to PRODUCTION (menschlichkeit-oesterreich.at)
```

### 2.2 SSH-Deploy-Key einrichten

```bash
# 1. Deploy-Key auf dem Plesk-Server generieren
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# 2. Public Key in Plesk hinzufügen
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# 3. Private Key als GitHub Secret hinterlegen:
# GitHub → Settings → Secrets → PLESK_SSH_PRIVATE_KEY
cat ~/.ssh/github_deploy_key
```

### 2.3 GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Der vollständige Deployment-Workflow ist unter `.github/workflows/deploy.yml` hinterlegt. Er führt folgende Schritte aus:

1. **Build:** `pnpm install && pnpm build` für das Frontend
2. **Test:** Automatische Tests mit `pytest` (Backend) und `vitest` (Frontend)
3. **Deploy:** Synchronisierung der Build-Artefakte via `rsync` auf den Plesk-Server
4. **Post-Deploy:** Neustart der FastAPI-Anwendung via `systemctl restart menschlichkeit-api`

### 2.4 Plesk-seitige Konfiguration

In Plesk unter **Websites & Domains → Git** kann das Repository direkt verknüpft werden. Dies ermöglicht automatische Deployments bei jedem Push ohne GitHub Actions.

**Empfehlung:** GitHub Actions für komplexe Build-Prozesse (Frontend-Build, Tests) verwenden und Plesk Git für einfache PHP/statische Seiten.

---

## 3. Sicherheits-Hardening

### 3.1 Checkliste nach Plesk-Best-Practices

| Maßnahme | Priorität | Status |
| :--- | :--- | :--- |
| Plesk auf aktuelle Version aktualisieren | Kritisch | ✅ |
| Passwort-Stärke auf "Stark" setzen | Kritisch | ✅ |
| Zwei-Faktor-Authentifizierung aktivieren | Kritisch | ✅ |
| SSL/TLS für alle Domains (Let's Encrypt) | Kritisch | ✅ |
| Fail2Ban aktivieren | Hoch | ✅ |
| ModSecurity WAF aktivieren | Hoch | ✅ |
| Nicht benötigte PHP-Versionen deaktivieren | Mittel | ✅ |
| SSH-Port ändern (z.B. 2222) | Mittel | Empfohlen |
| Firewall: Nur benötigte Ports öffnen | Hoch | ✅ |
| Regelmäßige Malware-Scans (Imunify360) | Hoch | Empfohlen |

### 3.2 Firewall-Regeln (Plesk Firewall)

```
EINGEHEND (Erlaubt):
  TCP 80   (HTTP)
  TCP 443  (HTTPS)
  TCP 2222 (SSH – geänderter Port)
  TCP 8443 (Plesk Admin Panel – nur von Verwaltungs-IP)
  TCP 5432 (PostgreSQL – nur von lokalen Anwendungen / VPN)

AUSGEHEND:
  Alle erlaubt (für Updates, API-Calls, E-Mail-Versand)

ALLES ANDERE: BLOCKIERT
```

### 3.3 SSL/TLS-Konfiguration (Nginx)

```nginx
# /etc/nginx/conf.d/ssl-hardening.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS (1 Jahr)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

## 4. Anwendungs-Deployment auf Plesk

### 4.1 FastAPI (Python) als Systemdienst

```ini
# /etc/systemd/system/menschlichkeit-api.service
[Unit]
Description=Menschlichkeit Österreich FastAPI Backend
After=network.target postgresql.service

[Service]
User=menschlichkeit
Group=menschlichkeit
WorkingDirectory=/var/www/vhosts/menschlichkeit-oesterreich.at/api
Environment="PATH=/var/www/vhosts/menschlichkeit-oesterreich.at/api/.venv/bin"
EnvironmentFile=/var/www/vhosts/menschlichkeit-oesterreich.at/api/.env.production
ExecStart=/var/www/vhosts/menschlichkeit-oesterreich.at/api/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

### 4.2 Nginx Reverse Proxy für FastAPI

In Plesk unter **Apache & Nginx Settings** folgende Nginx-Direktiven hinzufügen:

```nginx
# Proxy für FastAPI Backend
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
    proxy_connect_timeout 60s;
}

# Proxy für n8n Automation
location /n8n/ {
    proxy_pass http://127.0.0.1:5678/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 4.3 n8n als Docker-Container auf Plesk

```yaml
# docker-compose.n8n.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=menschlichkeit-oesterreich.at
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://menschlichkeit-oesterreich.at/n8n/
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=127.0.0.1
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_prod
      - DB_POSTGRESDB_USER=${N8N_DB_USER}
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    driver: local
```

---

## 5. Performance-Optimierung

### 5.1 Redis-Cache

Redis wird für Session-Management, API-Response-Caching und Queue-Management eingesetzt:

```bash
# Redis via Plesk Docker installieren
docker run -d --name redis \
  --restart unless-stopped \
  -p 127.0.0.1:6379:6379 \
  redis:7-alpine redis-server --requirepass "${REDIS_PASSWORD}"
```

### 5.2 CDN-Integration (Cloudflare)

Für statische Assets (Bilder, CSS, JS) wird Cloudflare als CDN empfohlen:

1. DNS-Einträge auf Cloudflare umstellen
2. SSL-Modus auf "Full (strict)" setzen
3. Page Rules für Cache-Optimierung konfigurieren
4. Cloudflare WAF als zusätzliche Sicherheitsschicht aktivieren

---

## 6. Monitoring und Alerting

### 6.1 Plesk-integriertes Monitoring

Unter **Tools & Settings → Server Health Monitor** folgende Schwellenwerte konfigurieren:

| Metrik | Warnung | Kritisch |
| :--- | :--- | :--- |
| CPU-Auslastung | 70% | 90% |
| RAM-Auslastung | 80% | 95% |
| Festplattennutzung | 75% | 90% |
| Datenbankverbindungen | 80 | 95 |

### 6.2 Uptime-Monitoring

Für externes Monitoring wird [UptimeRobot](https://uptimerobot.com) (kostenlos) oder [Betterstack](https://betterstack.com) empfohlen. Folgende Endpunkte überwachen:

- `https://menschlichkeit-oesterreich.at/` (Website)
- `https://menschlichkeit-oesterreich.at/api/health` (API Health Check)
- `https://menschlichkeit-oesterreich.at/n8n/` (n8n)

---

## Referenzen

- [Plesk Sicherheits-Best-Practices](https://docs.plesk.com/en-US/obsidian/administrator-guide/plesk-administration/securing-plesk.59464/)
- [PostgreSQL auf Plesk einrichten](https://www.plesk.com/blog/various/remote-access-to-postgresql/)
- [GitHub Actions + Plesk Deployment](https://blog.lohr.dev/deploy-websites-to-plesk-using-github-actions-or-gitlab-ci)
- [n8n Docker auf Plesk](https://blogs.reliablepenguin.com/2025/09/11/how-to-run-postgresql-in-docker-on-a-plesk-server-production-ready)

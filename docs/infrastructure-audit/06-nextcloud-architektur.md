# 06 – Nextcloud-Architektur

**Stand**: 2026-03-09
**Ziel-URL**: https://cloud.menschlichkeit-oesterreich.at
**Status**: Nicht deployed – Planungsphase

---

## Deployment-Strategie

### Option A: Plesk-gehostet (empfohlen für Ist-Infrastruktur)

```
cloud.menschlichkeit-oesterreich.at
  → Plesk-Subdomain
  → PHP 8.1+ FPM
  → MariaDB: moe_nextcloud (eigene DB)
  → Lokaler Datenspeicher: /var/www/vhosts/menschlichkeit-oesterreich.at/nextcloud-data/
  → S3-Mirror für Backup (Hetzner Object Storage / Backblaze B2)
```

### Option B: Docker-Container (empfohlen für Skalierung)

```yaml
# docker-compose.nextcloud.yml (Basis)
services:
  nextcloud:
    image: nextcloud:28-apache
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=moe_nextcloud
      - MYSQL_USER=${NC_DB_USER}
      - MYSQL_PASSWORD=${NC_DB_PASSWORD}
      - NEXTCLOUD_ADMIN_USER=${NC_ADMIN_USER}
      - NEXTCLOUD_ADMIN_PASSWORD=${NC_ADMIN_PASSWORD}
      - NEXTCLOUD_TRUSTED_DOMAINS=cloud.menschlichkeit-oesterreich.at
      - REDIS_HOST=redis
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=587
      - SMTP_AUTHTYPE=LOGIN
      - SMTP_NAME=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASS}
      - MAIL_FROM_ADDRESS=noreply
      - MAIL_DOMAIN=menschlichkeit-oesterreich.at
    volumes:
      - nextcloud_data:/var/www/html
      - nextcloud_config:/var/www/html/config
      - nextcloud_apps:/var/www/html/custom_apps
      - nextcloud_storage:/var/www/html/data
    depends_on:
      - db
      - redis

  db:
    image: mariadb:10.6
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${NC_DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=moe_nextcloud
      - MYSQL_USER=${NC_DB_USER}
      - MYSQL_PASSWORD=${NC_DB_PASSWORD}
    volumes:
      - nextcloud_db:/var/lib/mysql

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${NC_REDIS_PASSWORD}

volumes:
  nextcloud_data:
  nextcloud_config:
  nextcloud_apps:
  nextcloud_storage:
  nextcloud_db:
```

---

## Rollenmodell

| Rolle | Berechtigungen | Zugeordnete Nutzer |
|-------|---------------|-------------------|
| Admin | Vollzugriff, Nutzerverwaltung, Apps | peter.schuller@ |
| Mitglied | Eigene Dateien, geteilte Ordner (lesen/schreiben) | Alle aktiven Mitglieder |
| Gast | Nur geteilte Links (kein Account-Login) | Externe Personen |
| Service-Account | API-Zugang für n8n / CiviCRM | automation@ |

### Ordnerstruktur

```
/
├── Vorstand/            (Gruppe: Vorstand)
├── Mitglieder/          (Gruppe: Mitglieder, Lesen)
├── Öffentlich/          (Alle, Lesen)
├── Buchhaltung/         (Gruppe: Kassier, Verschlüsselt)
├── Newsletter/          (Gruppe: Newsletter-Team)
├── Presse/              (Gruppe: PR-Team)
└── Intern/
    ├── Protokolle/      (Gruppe: Vorstand)
    └── Dokumente/       (Gruppe: Admin)
```

---

## TLS & Security Hardening

### nginx Reverse Proxy für Nextcloud

```nginx
server {
    listen 443 ssl http2;
    server_name cloud.menschlichkeit-oesterreich.at;

    ssl_certificate     /etc/letsencrypt/live/cloud.menschlichkeit-oesterreich.at/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cloud.menschlichkeit-oesterreich.at/privkey.pem;

    # Nextcloud-empfohlene Header
    add_header Strict-Transport-Security "max-age=15768000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Permitted-Cross-Domain-Policies none always;
    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 10G;
    proxy_buffering off;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 86400;
    }

    # WebDAV-Endpunkte
    location /.well-known/carddav {
        return 301 $scheme://$host/remote.php/dav;
    }
    location /.well-known/caldav {
        return 301 $scheme://$host/remote.php/dav;
    }
}
```

### Nextcloud config.php Security-Einstellungen

```php
// config/config.php (relevante Security-Parameter)
$CONFIG = [
    'trusted_domains' => ['cloud.menschlichkeit-oesterreich.at'],
    'overwrite.cli.url' => 'https://cloud.menschlichkeit-oesterreich.at',
    'overwriteprotocol' => 'https',
    'htaccess.RewriteBase' => '/',

    // Brute-Force-Schutz
    'auth.bruteforce.protection.enabled' => true,

    // 2FA empfohlen
    'two_factor_auth_enforced' => true,     // Nach App-Installation

    // Datei-Scanning deaktivieren für sensible Verzeichnisse
    'filelocking.enabled' => true,

    // Log-Level (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR)
    'loglevel' => 2,
    'logfile' => '/var/www/html/data/nextcloud.log',

    // Passwort-Policy
    'minimum_password_length' => 12,

    // Datenverarbeitungsort (DSGVO)
    'default_locale' => 'de_AT',
    'default_phone_region' => 'AT',
];
```

---

## Backup-Strategie

### Backup-Plan

| Typ | Frequenz | Retention | Ziel |
|-----|----------|-----------|------|
| Nextcloud-Daten (rsync) | Täglich 01:00 | 30 Tage | Lokales Backup-Verzeichnis |
| MariaDB-Dump (mysqldump) | Täglich 00:30 | 30 Tage + 12 Monate (monatlich) | Lokal + S3 |
| S3-Mirror (rclone) | Täglich 02:00 | Kontinuierlich | Hetzner Object Storage |
| Config-Backup | Bei Änderungen | 90 Tage | Git (verschlüsselt via SOPS) |

```bash
# Backup-Skript (täglich via Cron):
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NC_DATA=/var/www/html/data
BACKUP_DIR=/backup/nextcloud

# 1. Nextcloud in Wartungsmodus
docker exec nextcloud php occ maintenance:mode --on

# 2. Daten-Backup
rsync -az --delete "$NC_DATA/" "$BACKUP_DIR/data_$TIMESTAMP/"

# 3. DB-Backup
docker exec nextcloud-db mysqldump -u root -p"$NC_DB_ROOT_PASSWORD" moe_nextcloud \
  | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# 4. Wartungsmodus aus
docker exec nextcloud php occ maintenance:mode --off

# 5. S3-Sync
rclone sync "$BACKUP_DIR" s3:moe-nextcloud-backup/

# 6. Alte Backups entfernen
find "$BACKUP_DIR" -mtime +30 -delete

echo "Backup abgeschlossen: $TIMESTAMP"
```

---

## DSGVO-Schutzmaßnahmen

| Maßnahme | Umsetzung |
|----------|-----------|
| Datenverarbeitung in AT/EU | Hetzner (AT/DE) als Hosting + S3-Anbieter |
| Verschlüsselung at rest | Nextcloud Server-Side Encryption aktivieren |
| Verschlüsselung in transit | TLS 1.3, HSTS |
| Zugriffsprotokoll | Nextcloud Audit-Log-App aktivieren |
| Datenlöschung | Papierkorb: 30 Tage, dann unwiederbringlich |
| Auftragsverarbeitungsvertrag | Mit Hetzner (bereits vorhanden für EU-Hosting) |
| Datenschutz-Folgenabschätzung | Erforderlich vor Deployment (Art. 35 DSGVO) |

---

## Deployment-Checkliste

```
Phase 1 – Vorbereitung:
[ ] MariaDB-Datenbank moe_nextcloud anlegen
[ ] Nextcloud-DB-User mit GRANT-Rechten nur auf moe_nextcloud
[ ] S3-Bucket anlegen und Credentials in SOPS hinterlegen
[ ] DNS: cloud.menschlichkeit-oesterreich.at → 5.183.217.146
[ ] TLS-Zertifikat via Let's Encrypt

Phase 2 – Installation:
[ ] Docker Compose starten
[ ] Nextcloud-Admin-Account anlegen (admin@ = Wegwerf-Account, echte Admins separat)
[ ] Gruppen anlegen (Vorstand, Mitglieder, Kassier, Newsletter-Team)
[ ] Ordnerstruktur anlegen
[ ] Backup-Skript deployen + testen

Phase 3 – Härtung:
[ ] Audit-Log-App installieren
[ ] 2FA-Pflicht aktivieren
[ ] Passwort-Policy aktivieren
[ ] Server-Side Encryption aktivieren
[ ] Externe Freigaben auf erlaubte Domains beschränken

Phase 4 – Integration:
[ ] n8n Service-Account anlegen (automation@)
[ ] CiviCRM WebDAV-Integration testen
[ ] Monitoring: HTTP 200 auf /status.php
```

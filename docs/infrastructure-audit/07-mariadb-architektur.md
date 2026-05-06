# 07 – MariaDB-Architektur

**Stand**: 2026-03-09
**Datenbankserver**: MariaDB 10.6.22 (verifiziert)

---

## Ist-Zustand

| Attribut | Wert |
|----------|------|
| Version | MariaDB 10.6.22 (LTS) |
| Host | localhost (Plesk-managed) |
| Datenbank-Anzahl | wahrscheinlich 1–2 (nicht isoliert) |
| User-Konzept | wahrscheinlich Plesk-generierte User |
| Backup | wahrscheinlich via Plesk-Backup |
| PITR | unklar (binlog?) |

---

## Ziel-Datenbankstruktur

### Datenbank-Aufteilung

| Datenbank | Service | Beschreibung |
|-----------|---------|-------------|
| `moe_main` | FastAPI / Hauptplattform | User-Management, Auth, Profile |
| `moe_crm` | Drupal + CiviCRM | CRM-Daten, Kontakte, Spenden |
| `moe_forum` | Forum-System | Posts, User, Kategorien |
| `moe_newsletter` | Newsletter + n8n | Kampagnen, Subscriber, Stats |
| `moe_support` | Support-Ticketing | Tickets, Kommentare, Anhänge |
| `moe_voting` | Voting-Plattform | Abstimmungen, Ergebnisse (anonymisiert) |
| `moe_nextcloud` | Nextcloud | Dateimetadaten, User, Shares |
| `moe_n8n` | n8n Automation | Workflows, Execution-Logs |

---

## Least-Privilege User-Matrix

| DB-User | Datenbank | Berechtigungen | Host |
|---------|-----------|----------------|------|
| `api_user` | `moe_main` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `crm_user` | `moe_crm` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `forum_user` | `moe_forum` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `newsletter_user` | `moe_newsletter` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `support_user` | `moe_support` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `voting_user` | `moe_voting` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `nextcloud_user` | `moe_nextcloud` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `n8n_user` | `moe_n8n` | SELECT, INSERT, UPDATE, DELETE | localhost |
| `backup_user` | alle | SELECT, LOCK TABLES, SHOW VIEW | localhost |
| `root` | alle | ALL PRIVILEGES | localhost only |

**Regel**: Kein User mit `GRANT ALL` außer `root@localhost`. Kein `root` mit Remote-Zugriff.

---

## Setup-Script

Das vollständige SQL-Setup-Script befindet sich unter: `scripts/db-user-setup.sql`

```sql
-- Beispiel für einen Service-User (vollständige Version in scripts/):
CREATE DATABASE IF NOT EXISTS moe_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'api_user'@'localhost' IDENTIFIED BY '${API_DB_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE ON moe_main.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Performance-Optimierungen

### my.cnf Empfehlungen

```ini
[mysqld]
# InnoDB Buffer Pool (50-70% des verfügbaren RAMs)
innodb_buffer_pool_size = 1G      # Anpassen an Server-RAM
innodb_buffer_pool_instances = 2

# Logging
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 1  # ACID-Compliance (Sicherheit > Performance)

# Query Cache (deaktiviert in MariaDB 10.3+ empfohlen)
query_cache_type = 0
query_cache_size = 0

# Binlog für PITR
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
binlog_format = ROW

# Verbindungen
max_connections = 150
max_allowed_packet = 64M
wait_timeout = 600
interactive_timeout = 600

# Zeichensatz
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# Sicherheit
local_infile = 0
skip_symbolic_links = 1
```

---

## Backup-Strategie

### Tägliches Backup (mysqldump)

```bash
#!/bin/bash
# /usr/local/bin/db-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backup/mariadb
MYSQL_DEFAULTS=/etc/mysql/backup.cnf  # Credentials sicher hinterlegen

DATABASES=(moe_main moe_crm moe_forum moe_newsletter moe_support moe_voting moe_nextcloud moe_n8n)

for DB in "${DATABASES[@]}"; do
    mysqldump \
        --defaults-extra-file="$MYSQL_DEFAULTS" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        "$DB" \
        | gzip > "$BACKUP_DIR/${DB}_${TIMESTAMP}.sql.gz"
    echo "Backup: $DB → ${DB}_${TIMESTAMP}.sql.gz"
done

# S3-Upload
rclone sync "$BACKUP_DIR" s3:moe-db-backup/ --min-age 1m

# Alte Backups bereinigen (>30 Tage lokal)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "DB-Backup abgeschlossen: $TIMESTAMP"
```

### /etc/mysql/backup.cnf (600-Berechtigungen)

```ini
[client]
user     = backup_user
password = [Passwort via SOPS verwaltet, niemals im Klartext]
host     = localhost
```

### Monatliche Archivierung

```bash
# Monatliches Full-Backup in dauerhaftes S3-Archiv (12 Monate Retention):
0 3 1 * * /usr/local/bin/db-backup-monthly.sh >> /var/log/db-backup-monthly.log 2>&1
```

---

## PITR (Point-in-Time Recovery)

```bash
# Binary Log für PITR aktivieren (my.cnf: log_bin = ...)
# Recovery auf Zeitpunkt T:
mysqlbinlog \
    --start-datetime="2026-03-09 00:00:00" \
    --stop-datetime="2026-03-09 14:30:00" \
    /var/log/mysql/mysql-bin.* \
    | mysql -u root -p
```

---

## DSGVO-Aspekte

| Maßnahme | Umsetzung |
|----------|-----------|
| Datenisolation | Separate DBs je Service |
| Datenlöschung | DELETE + PURGE auf Anfrage (Art. 17 DSGVO) |
| Anonymisierung | Voting-DB: kein User-to-Vote-Mapping |
| Verschlüsselung at rest | InnoDB-Encryption aktivieren (MariaDB 10.6) |
| Audit-Log | `moe_crm` und `moe_main`: MariaDB Audit Plugin |
| Backup-Verschlüsselung | Backups via GPG oder rclone-Crypt verschlüsseln |

```sql
-- InnoDB-Verschlüsselung aktivieren (MariaDB 10.6):
INSTALL SONAME 'file_key_management';
-- Konfiguration in my.cnf:
-- plugin_load_add = file_key_management
-- file_key_management_filekey = FILE:/etc/mysql/keyfile
-- innodb_encrypt_tables = ON
```

---

## Migrationsplan (Ist → Soll)

```
Phase 1 (sofort):
  - Backup-User anlegen, Credentials in SOPS hinterlegen
  - Backup-Script deployen und testen

Phase 2 (diese Woche):
  - moe_n8n anlegen und n8n-User migrieren (von shared DB)
  - Neue Credentials für n8n in SOPS hinterlegen

Phase 3 (diesen Monat):
  - Drupal/CiviCRM zu moe_crm isolieren
  - FastAPI-Migration auf moe_main
  - Service-User für alle bestehenden Services anlegen

Phase 4 (nächste 3 Monate):
  - Forum, Support, Voting-DBs anlegen (bei Deployment dieser Services)
  - Nextcloud-DB bei Nextcloud-Deployment
  - PITR via Binlog aktivieren und testen
  - InnoDB-Encryption aktivieren
```

---

## Checkliste

```
[ ] Alle Datenbanken angelegt (utf8mb4)
[ ] Alle Service-User angelegt (Least Privilege)
[ ] root@localhost: starkes Passwort, kein Remote-Zugriff
[ ] backup_user: READ ONLY + LOCK TABLES
[ ] my.cnf: innodb_buffer_pool_size konfiguriert
[ ] my.cnf: log_bin aktiviert für PITR
[ ] Backup-Script täglich via Cron
[ ] S3-Backup-Ziel konfiguriert
[ ] Monatliches Archiv-Backup eingerichtet
[ ] Restore-Test monatlich dokumentiert
[ ] InnoDB-Encryption: aktiviert
[ ] MariaDB Audit Plugin: für kritische DBs aktiv
```

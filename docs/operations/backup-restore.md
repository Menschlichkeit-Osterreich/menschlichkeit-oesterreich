# Backup & Restore – Menschlichkeit Österreich

**Stand**: 2026-03-08

---

## Backup-Strategie (Überblick)

| Datenkategorie | Backup-Methode | Intervall | Retention | Owner |
|----------------|---------------|-----------|-----------|-------|
| PostgreSQL (Gesamt-DB) | `pg_dump` + Plesk Scheduler | Täglich 02:00 | 30 Tage | DevOps |
| Drupal Files (Uploads) | rsync → off-site | Täglich | 14 Tage | DevOps |
| n8n Workflows | Docker Volume + Export | Bei Änderung | Unbegrenzt (Git) |
| Redis | AOF (appendonly) | Kontinuierlich | 7 Tage | Docker |
| CiviCRM DB | Separate MariaDB-Sicherung | Täglich | 30 Tage | DevOps |
| Qdrant Vektoren | Volume-Backup | Täglich | 7 Tage | DevOps |

**Annahme:** Plesk Backup Manager ist aktiviert und konfiguriert (muss manuell bestätigt werden).

---

## 1. PostgreSQL-Backup

### Manuelles Backup (lokal)

```bash
# Vollständiges Backup:
docker exec menschlichkeit-postgres pg_dump \
  -U postgres menschlichkeit_dev \
  > backups/db-$(date +%Y%m%d-%H%M%S).sql

# Komprimiert:
docker exec menschlichkeit-postgres pg_dump \
  -U postgres menschlichkeit_dev \
  | gzip > backups/db-$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Stop services die DB verwenden:
docker-compose stop api

# Restore:
docker exec -i menschlichkeit-postgres psql \
  -U postgres menschlichkeit_dev \
  < backups/db-DATUM.sql

# Services wieder starten:
docker-compose start api
```

---

## 2. Drupal/CiviCRM-Backup

### Files-Backup

```bash
# Uploads sichern:
rsync -avz \
  user@server:/var/www/vhosts/crm.menschlichkeit-oesterreich.at/httpdocs/sites/default/files/ \
  backups/drupal-files-$(date +%Y%m%d)/
```

### Drupal-DB (MariaDB via Plesk)

```bash
# Via Drush (auf Server):
drush sql-dump --gzip > backups/drupal-db-$(date +%Y%m%d).sql.gz

# Restore:
drush sql-drop && drush sql-cli < backups/drupal-db-DATUM.sql
```

---

## 3. n8n Workflows

### Backup (Export)

n8n-Workflows sind in `automation/n8n/workflows/` versioniert. Bei Produktionsänderungen:

```bash
# n8n UI: Settings → Export all workflows → JSON
# Dann in workflows/ ablegen und committen
```

### Docker Volume Backup

```bash
docker run --rm \
  -v menschlichkeit_n8n_data:/data \
  -v $(pwd)/backups:/backups \
  alpine tar czf /backups/n8n-$(date +%Y%m%d).tar.gz /data
```

---

## 4. Plesk Backup Manager

**Zugriff:** `https://5.183.217.146:8443` → Tools & Settings → Backup Manager

**Empfohlene Konfiguration:**
- Backup-Ziel: Off-site Storage (FTP/SFTP/S3)
- Zeitplan: Täglich 02:00 Uhr (Nebenzeit)
- Retention: 30 Tage
- Vollbackup: Wöchentlich (Sonntag)
- Inkrementell: Täglich

**Manuelle Sofortsicherung vor jedem Deploy:**
Plesk → Backup Manager → Create Backup

---

## 5. Backup-Verifikation

Backups sind wertlos ohne Verifikation. Monatlicher Test:

```bash
# PostgreSQL-Restore in Testcontainer:
docker run --rm -e POSTGRES_PASSWORD=test postgres:16-alpine &
sleep 5
docker exec -i [container_id] psql -U postgres \
  < backups/db-letztes-backup.sql
echo "EXIT CODE: $?"

# Erwartung: EXIT CODE: 0
```

```
[ ] Monatlicher Restore-Test: erstes Wochenende des Monats
[ ] Ergebnis dokumentieren in: backups/RESTORE-TEST-LOG.md
```

---

## 6. Notfall-Restore (Produktionsausfall)

```
[ ] 1. Letztes valides Backup identifizieren (Plesk oder backups/)
[ ] 2. Services stoppen: npm run docker:down
[ ] 3. DB restore (siehe Abschnitt 1)
[ ] 4. Files restore (falls betroffen)
[ ] 5. Services starten: npm run docker:up
[ ] 6. Health-Check: npm run status:check
[ ] 7. Incident dokumentieren: docs/incidents/
```

---

## 7. Backup-Speicherorte

| Ort | Typ | Zugriff |
|-----|-----|---------|
| `backups/` (lokal, in .gitignore) | Entwickler-Snapshots | Lokal |
| Plesk Backup Manager | Produktions-Backups | Plesk-Admin |
| `automation/n8n/workflows/` | n8n Workflow-Definitionen (Git) | Alle |

**Sicherheitshinweis:** Backups enthalten PII. Niemals in Git committen. Nur auf verschlüsselten Medien transportieren.

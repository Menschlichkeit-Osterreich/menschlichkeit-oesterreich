#!/usr/bin/env bash
# ============================================================
# MariaDB Backup Script – Menschlichkeit Österreich
# Version: 1.0
# Ausführung: täglich via Plesk-Cronjob (02:00 Uhr)
# Benötigt: BACKUP_PASS als Umgebungsvariable oder in ~/.my.cnf
# ============================================================
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/backup/mariadb}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
NOTIFY_EMAIL="${NOTIFY_EMAIL:-security@menschlichkeit-oesterreich.at}"
LOG_FILE="${BACKUP_DIR}/backup_${DATE}.log"

DATABASES=(
  "main_platform_database"
  "civicrm_database"
  "drupal_database"
  "newsletter_database"
  "forum_database"
  "support_database"
  "voting_database"
)

mkdir -p "${BACKUP_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== MariaDB Backup gestartet: $(date) ==="

SUCCESS=0
FAILED=0

for DB in "${DATABASES[@]}"; do
  echo "→ Backup: ${DB}"
  OUTFILE="${BACKUP_DIR}/${DB}_${DATE}.sql.gz"

  if mysqldump \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --skip-comments \
    -u backup_user \
    "${DB}" 2>>"${LOG_FILE}" | gzip > "${OUTFILE}"; then
    SIZE=$(du -sh "${OUTFILE}" | cut -f1)
    echo "  ✅ Erfolg: ${OUTFILE} (${SIZE})"
    ((SUCCESS++))
  else
    echo "  ❌ FEHLER bei: ${DB}"
    ((FAILED++))
  fi
done

echo ""
echo "=== Alte Backups bereinigen (>${RETENTION_DAYS} Tage) ==="
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +"${RETENTION_DAYS}" -print -delete

echo ""
echo "=== Zusammenfassung ==="
echo "  Erfolgreich: ${SUCCESS}"
echo "  Fehlgeschlagen: ${FAILED}"
echo "  Abgeschlossen: $(date)"

if [ "${FAILED}" -gt 0 ]; then
  echo "BACKUP FEHLER: ${FAILED} Datenbank(en) fehlgeschlagen!" | \
    mail -s "[KRITISCH] MariaDB Backup Fehler - $(date +%Y-%m-%d)" "${NOTIFY_EMAIL}" || true
  exit 1
fi

echo "=== Backup erfolgreich abgeschlossen ==="

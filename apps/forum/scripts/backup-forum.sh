#!/bin/sh
# =============================================================
# phpBB Backup-Script — Datenbank + Dateien
# Menschlichkeit Österreich Forum
#
# Verwendung:
#   ./backup-forum.sh                    # Vollständiges Backup
#   ./backup-forum.sh --db-only          # Nur Datenbank
#   ./backup-forum.sh --files-only       # Nur Dateien
#   ./backup-forum.sh --retention 14     # 14 Tage aufbewahren (Standard: 30)
#
# Empfohlener Cron (täglich um 03:00):
#   0 3 * * * /var/www/phpbb/scripts/backup-forum.sh >> /var/log/phpbb-backup.log 2>&1
# =============================================================

set -euo pipefail

# ── Konfiguration ────────────────────────────────────────────
BACKUP_DIR="/var/www/phpbb/store/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
DB_HOST="${PHPBB_DB_HOST:-postgres}"
DB_PORT="${PHPBB_DB_PORT:-5432}"
DB_NAME="${PHPBB_DB_NAME:-phpbb}"
DB_USER="${PHPBB_DB_USER:-phpbb}"
PGPASSWORD="${PHPBB_DB_PASSWORD:-phpbb_dev}"
export PGPASSWORD

DO_DB=true
DO_FILES=true

# ── Argumente parsen ─────────────────────────────────────────
while [ $# -gt 0 ]; do
    case "$1" in
        --db-only)     DO_FILES=false; shift ;;
        --files-only)  DO_DB=false; shift ;;
        --retention)   RETENTION_DAYS="$2"; shift 2 ;;
        *)             echo "Unbekanntes Argument: $1"; exit 1 ;;
    esac
done

# ── Backup-Verzeichnis erstellen ─────────────────────────────
mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "  phpBB Backup — ${TIMESTAMP}"
echo "=========================================="

# ── Datenbank-Backup ─────────────────────────────────────────
if [ "$DO_DB" = true ]; then
    DB_BACKUP="${BACKUP_DIR}/phpbb_db_${TIMESTAMP}.sql.gz"
    echo "[DB] Starte PostgreSQL-Dump..."

    pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
        --format=custom --compress=9 --no-owner --no-privileges \
        "${DB_NAME}" > "${BACKUP_DIR}/phpbb_db_${TIMESTAMP}.dump" 2>/dev/null

    if [ $? -eq 0 ]; then
        DB_SIZE=$(du -sh "${BACKUP_DIR}/phpbb_db_${TIMESTAMP}.dump" | cut -f1)
        echo "[DB] ✓ Backup erstellt: ${DB_SIZE}"
    else
        echo "[DB] ✗ FEHLER beim Datenbank-Backup!"
        exit 1
    fi
fi

# ── Datei-Backup (Uploads, Avatare, Konfiguration) ──────────
if [ "$DO_FILES" = true ]; then
    FILES_BACKUP="${BACKUP_DIR}/phpbb_files_${TIMESTAMP}.tar.gz"
    echo "[FILES] Starte Datei-Backup..."

    tar -czf "${FILES_BACKUP}" \
        -C /var/www/phpbb \
        files/ \
        images/avatars/upload/ \
        store/ \
        config.php \
        2>/dev/null

    if [ $? -eq 0 ]; then
        FILES_SIZE=$(du -sh "${FILES_BACKUP}" | cut -f1)
        echo "[FILES] ✓ Backup erstellt: ${FILES_SIZE}"
    else
        echo "[FILES] ✗ FEHLER beim Datei-Backup!"
        exit 1
    fi
fi

# ── Alte Backups aufräumen ───────────────────────────────────
echo "[CLEANUP] Lösche Backups älter als ${RETENTION_DAYS} Tage..."
DELETED=$(find "${BACKUP_DIR}" -name "phpbb_*" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[CLEANUP] ${DELETED} alte Backup-Dateien gelöscht."

# ── Zusammenfassung ──────────────────────────────────────────
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "phpbb_*" | wc -l)

echo ""
echo "=========================================="
echo "  Backup abgeschlossen!"
echo "  Verzeichnis: ${BACKUP_DIR}"
echo "  Gesamtgröße: ${TOTAL_SIZE}"
echo "  Anzahl Backups: ${BACKUP_COUNT}"
echo "=========================================="
echo ""
echo "WICHTIG: Backups liegen lokal im Container."
echo "Für Disaster Recovery sollten Backups extern"
echo "gesichert werden (S3, NFS, rsync)."

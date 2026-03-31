#!/bin/sh
# =============================================================
# phpBB Cron-Runner — Periodische Wartungsaufgaben
# Wird alle 5 Minuten via Docker-Cron aufgerufen
#
# Aufgaben die phpBB automatisch ausführt:
#   - Session-Bereinigung (abgelaufene Sessions löschen)
#   - Prune-Tasks (alte Logs, abgelaufene Bans)
#   - Such-Index-Update
#   - Benachrichtigungs-Queue verarbeiten
#   - Statistiken aktualisieren
# =============================================================

set -e

PHPBB_DIR="/var/www/phpbb"
LOG_PREFIX="[phpbb-cron]"

# Nur ausführen wenn phpBB installiert ist
if [ ! -f "${PHPBB_DIR}/config.php" ]; then
    echo "${LOG_PREFIX} phpBB nicht installiert — übersprungen"
    exit 0
fi

# phpBB CLI Cron ausführen
echo "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') Starte Cron-Tasks..."
php "${PHPBB_DIR}/bin/phpbbcli.php" cron:run --quiet 2>&1 || {
    echo "${LOG_PREFIX} FEHLER bei Cron-Ausführung"
    exit 1
}

echo "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') Cron-Tasks abgeschlossen."

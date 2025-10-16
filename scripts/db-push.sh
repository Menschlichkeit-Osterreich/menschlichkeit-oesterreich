#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--apply" ]]; then
  echo "Sicherheitsbremse aktiv: Kein Push ohne --apply." >&2
  echo "Nutzung: scripts/db-push.sh --apply" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1090
  source "$ROOT_DIR/.env"
else
  echo "Bitte .env anlegen (siehe .env.sample)" >&2
  exit 1
fi

DATESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT_DIR/backups"
mkdir -p "$BACKUP_DIR"
DUMP_FILE="$BACKUP_DIR/db-local-$DATESTAMP.sql.gz"

export MYSQL_PWD="${LOCAL_DB_PASS}"
mysqldump -h "${LOCAL_DB_HOST}" -u "${LOCAL_DB_USER}" "${LOCAL_DB_NAME}" --single-transaction --quick --routines --triggers | gzip -c > "$DUMP_FILE"

gunzip -c "$DUMP_FILE" | ssh "${PLESK_HOST:-plesk}" "mysql -h ${REMOTE_DB_HOST} -u ${REMOTE_DB_USER} -p'${REMOTE_DB_PASS}' ${REMOTE_DB_NAME}"

echo "Remote-Datenbank überschrieben (Vorsicht!)."

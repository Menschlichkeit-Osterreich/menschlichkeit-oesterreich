#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Fehler: DB-Pull abgebrochen." >&2' ERR

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
DUMP_FILE="$BACKUP_DIR/db-remote-$DATESTAMP.sql.gz"

REMOTE_HOST="${PLESK_HOST:-plesk}"

echo ">> Remote Dump via SSH ($REMOTE_HOST)"
ssh "$REMOTE_HOST" "mysqldump -h ${REMOTE_DB_HOST} -u ${REMOTE_DB_USER} -p'${REMOTE_DB_PASS}' ${REMOTE_DB_NAME} --single-transaction --quick --routines --triggers | gzip -c" > "$DUMP_FILE"

echo ">> Import in lokale DB ${LOCAL_DB_NAME}@${LOCAL_DB_HOST}"
export MYSQL_PWD="${LOCAL_DB_PASS}"
gunzip -c "$DUMP_FILE" | mysql -h "${LOCAL_DB_HOST}" -u "${LOCAL_DB_USER}" "${LOCAL_DB_NAME}"

if [[ -x "$ROOT_DIR/vendor/bin/drush" ]]; then
  echo ">> Drupal Cache Rebuild"
  (cd "$ROOT_DIR" && vendor/bin/drush cr) || true
fi

echo "Fertig: $DUMP_FILE importiert."

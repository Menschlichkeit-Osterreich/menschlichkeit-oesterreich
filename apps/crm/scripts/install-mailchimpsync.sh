#!/usr/bin/env bash
# Installiert die CiviCRM-Extension "Mailchimp Sync" (org.civicrm.mailchimpsync)
# in die aktive CiviCRM-Installation unter web/sites/default/files/civicrm/ext/.
#
# Voraussetzungen:
#   - composer install muss durch sein (CiviCRM 6.12+ vorhanden).
#   - DB-Backup wurde vor Upgrade ausgefuehrt.
#   - Drush ist verfuegbar.
#
# Quelle: https://civicrm.org/extensions/mailchimp-sync
# Version-Pin: MAILCHIMPSYNC_VERSION (Default: 1.3.1).
#
# Verwendung:
#   bash apps/crm/scripts/install-mailchimpsync.sh
#   MAILCHIMPSYNC_VERSION=1.3.1 bash apps/crm/scripts/install-mailchimpsync.sh

set -euo pipefail

MAILCHIMPSYNC_VERSION="${MAILCHIMPSYNC_VERSION:-1.3.1}"
EXTENSION_KEY="org.civicrm.mailchimpsync"
DOWNLOAD_URL="https://lab.civicrm.org/extensions/mailchimpsync/-/archive/${MAILCHIMPSYNC_VERSION}/mailchimpsync-${MAILCHIMPSYNC_VERSION}.tar.gz"

CRM_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="${CRM_ROOT}/web/sites/default/files/civicrm/ext"

if [[ ! -d "${CRM_ROOT}/vendor/civicrm/civicrm-core" ]]; then
    echo "[ERROR] CiviCRM-Core nicht gefunden unter ${CRM_ROOT}/vendor/civicrm/civicrm-core" >&2
    echo "        Bitte zuerst 'composer install' im apps/crm/-Verzeichnis ausfuehren." >&2
    exit 1
fi

if ! command -v drush >/dev/null 2>&1; then
    if [[ -x "${CRM_ROOT}/vendor/bin/drush" ]]; then
        DRUSH="${CRM_ROOT}/vendor/bin/drush"
    else
        echo "[ERROR] drush nicht im PATH und nicht in vendor/bin/." >&2
        exit 1
    fi
else
    DRUSH="$(command -v drush)"
fi

mkdir -p "${EXT_DIR}"
TARGET_DIR="${EXT_DIR}/mailchimpsync"

if [[ -d "${TARGET_DIR}" ]]; then
    echo "[INFO] Extension-Verzeichnis existiert bereits: ${TARGET_DIR}"
    echo "[INFO] Loesche fuer sauberen Reinstall..."
    rm -rf "${TARGET_DIR}"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "[INFO] Lade mailchimpsync ${MAILCHIMPSYNC_VERSION}..."
if ! curl -fsSL "${DOWNLOAD_URL}" -o "${TMP_DIR}/mailchimpsync.tar.gz"; then
    echo "[ERROR] Download fehlgeschlagen: ${DOWNLOAD_URL}" >&2
    exit 1
fi

echo "[INFO] Entpacke nach ${TARGET_DIR}..."
tar -xzf "${TMP_DIR}/mailchimpsync.tar.gz" -C "${TMP_DIR}"
EXTRACTED_DIR="$(find "${TMP_DIR}" -maxdepth 1 -type d -name 'mailchimpsync-*' | head -n1)"
if [[ -z "${EXTRACTED_DIR}" ]]; then
    echo "[ERROR] Entpacktes Verzeichnis nicht gefunden." >&2
    exit 1
fi
mv "${EXTRACTED_DIR}" "${TARGET_DIR}"

echo "[INFO] Aktiviere Extension ${EXTENSION_KEY} ueber drush..."
( cd "${CRM_ROOT}" && "${DRUSH}" cv en "${EXTENSION_KEY}" )

echo "[INFO] Cache flush..."
( cd "${CRM_ROOT}" && "${DRUSH}" cr )

echo "[OK] mailchimpsync ${MAILCHIMPSYNC_VERSION} installiert und aktiviert."
echo "     Naechster Schritt: Mailchimp API-Key in CiviCRM-Einstellungen hinterlegen."

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1090
  source "$ROOT_DIR/.env"
fi

ACTION="${1:-help}"
APPLY="${2:-}"

REMOTE="${PLESK_HOST:-plesk}:${PLESK_REMOTE_PATH:-/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs}"
LOCAL="${LOCAL_WEBROOT:-$ROOT_DIR}"

SSH_OPTS=()
[[ -n "${SSH_PORT:-}" ]] && SSH_OPTS+=( -p "$SSH_PORT" )
[[ -n "${SSH_KEY:-}" ]] && SSH_OPTS+=( -i "$SSH_KEY" )

EXCLUDES=(
  "--exclude=.git"
  "--exclude=.github"
  "--exclude=.DS_Store"
  "--exclude=node_modules"
  "--exclude=vendor"
  "--exclude=web/sites/*/files"
  "--exclude=tmp"
  "--exclude=cache"
  "--exclude=logs"
)

RSYNC_BASE=(rsync -az --delete --partial --info=progress2 -e "ssh ${SSH_OPTS[*]}" "${EXCLUDES[@]}")

case "$ACTION" in
  pull)
    echo ">> Dry-Run Pull von $REMOTE nach $LOCAL"
    "${RSYNC_BASE[@]}" --dry-run "$REMOTE/" "$LOCAL/"
    if [[ "$APPLY" == "--apply" ]]; then
      echo ">> AUSFÜHRUNG: Pull"
      "${RSYNC_BASE[@]}" "$REMOTE/" "$LOCAL/"
    fi
    ;;
  push)
    echo ">> Dry-Run Push von $LOCAL nach $REMOTE"
    "${RSYNC_BASE[@]}" --dry-run "$LOCAL/" "$REMOTE/"
    if [[ "$APPLY" == "--apply" ]]; then
      echo ">> AUSFÜHRUNG: Push"
      "${RSYNC_BASE[@]}" "$LOCAL/" "$REMOTE/"
    fi
    ;;
  *)
    echo "Nutzung: scripts/plesk-sync.sh [pull|push] [--apply]"
    exit 1
    ;;
esac

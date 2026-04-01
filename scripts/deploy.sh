#!/usr/bin/env bash
# =============================================================================
# deploy.sh – Sicherer Deploy: Replit → Plesk via rsync/SSH
# =============================================================================
# Modell: Artefakt-basierter Deploy (Build in Replit → rsync zu Plesk)
#
# Services: frontend | api | crm | games | all
# Dry-Run:  DRY_RUN=true ./scripts/deploy.sh
# Branch:   Prüft, dass nur von 'main' deployt wird (Override: ALLOW_BRANCH=any)
# Lock:     Verhindert parallele Deploys via /tmp/moe_deploy.lock
#
# Pflicht-Variablen:
#   PLESK_HOST         – Plesk-Server-IP oder Hostname
#   PLESK_USER         – SSH-Benutzername
#   PLESK_PORT         – SSH-Port (default: 22)
#   PLESK_SSH_KEY      – Private Key (Inhalt)
#   PLESK_KNOWN_HOSTS  – known_hosts-Eintrag fuer den Server
#   PLESK_BASE_PATH    – Zielpfad Frontend (z.B. /var/www/vhosts/.../httpdocs)
#
# Optionale Variablen:
#   PLESK_API_PATH     – Zielpfad API
#   PLESK_CRM_PATH     – Zielpfad CRM
#   PLESK_GAMES_PATH   – Zielpfad Games
#   DRY_RUN            – "true" = kein Schreiben auf Server
#   ALLOW_BRANCH       – "any" = kein Branch-Check
#   SERVICE            – "frontend|api|crm|games|all" (default: all)
# =============================================================================
set -euo pipefail

# ── Konfiguration ─────────────────────────────────────────────────────────────
SERVICE="${SERVICE:-all}"
DRY_RUN="${DRY_RUN:-false}"
ALLOW_BRANCH="${ALLOW_BRANCH:-}"
LOCK_FILE="/tmp/moe_deploy.lock"
LOG_DIR="${HOME}/.moe_deploy_logs"
TIMESTAMP="$(date -u '+%Y%m%dT%H%M%SZ')"
COMMIT_SHA="${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"
PLESK_HOST="${PLESK_HOST:-${PLSK_HOST:-}}"
PLESK_USER="${PLESK_USER:-${PLSK_USER:-}}"
PLESK_PORT="${PLESK_PORT:-${PLSK_PORT:-22}}"
PLESK_SSH_KEY="${PLESK_SSH_KEY:-${PLSK_SSH_KEY:-}}"
PLESK_KNOWN_HOSTS="${PLESK_KNOWN_HOSTS:-${PLSK_KNOWN_HOSTS:-}}"
PLESK_BASE_PATH="${PLESK_BASE_PATH:-${PLSK_DEPLOY_PATH:-}}"
PLESK_API_PATH="${PLESK_API_PATH:-${PLSK_API_PATH:-}}"
PLESK_CRM_PATH="${PLESK_CRM_PATH:-${PLSK_CRM_PATH:-}}"
PLESK_GAMES_PATH="${PLESK_GAMES_PATH:-${PLSK_GAMES_PATH:-}}"

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────
log()    { echo "[deploy ${TIMESTAMP}] $*"; }
ok()     { echo "[deploy ${TIMESTAMP}] ✓ $*"; }
warn()   { echo "[deploy ${TIMESTAMP}] ⚠ $*" >&2; }
fail()   { echo "[deploy ${TIMESTAMP}] ✗ $*" >&2; exit 1; }
dry()    { echo "[deploy ${TIMESTAMP}] [DRY-RUN] $*"; }

cleanup() {
  local exit_code=$?
  rm -f "${LOCK_FILE}"
  if (( exit_code != 0 )); then
    warn "Deploy mit Exit-Code ${exit_code} beendet."
  else
    ok "Deploy abgeschlossen. Lock entfernt."
  fi
}
trap cleanup EXIT

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║       Menschlichkeit Österreich – Deploy Script                  ║"
echo "║       Commit: ${COMMIT_SHA}  |  Service: ${SERVICE}            "
if [[ "${DRY_RUN}" == "true" ]]; then
echo "║  *** DRY-RUN MODUS – kein Schreiben auf Produktion ***           ║"
fi
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ── Lock-Datei (kein paralleler Deploy) ──────────────────────────────────────
if [[ -f "${LOCK_FILE}" ]]; then
  LOCK_PID="$(cat "${LOCK_FILE}" 2>/dev/null || echo '?')"
  fail "Deploy läuft bereits (PID: ${LOCK_PID}, Lock: ${LOCK_FILE}). Abbruch."
fi
echo $$ > "${LOCK_FILE}"
ok "Deploy-Lock gesetzt (PID: $$)."

# ── Env-Validierung ───────────────────────────────────────────────────────────
log "Validiere Umgebungsvariablen..."
bash "$(dirname "${BASH_SOURCE[0]}")/validate_env.sh" || fail "Env-Validierung fehlgeschlagen."

# ── SSH Bootstrap ─────────────────────────────────────────────────────────────
log "SSH Bootstrap..."
bash "$(dirname "${BASH_SOURCE[0]}")/bootstrap_ssh.sh" || fail "SSH Bootstrap fehlgeschlagen."

# ── Branch-Schutz ────────────────────────────────────────────────────────────
if [[ "${ALLOW_BRANCH}" != "any" ]]; then
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
  if [[ "${CURRENT_BRANCH}" != "main" ]]; then
    fail "Branch-Schutz: Aktueller Branch ist '${CURRENT_BRANCH}', erwartet: 'main'. Deploy abgebrochen."
  fi
  ok "Branch-Check OK: main"
else
  warn "Branch-Check deaktiviert (ALLOW_BRANCH=any)."
fi

# ── SSH-Basiskommando ──────────────────────────────────────────────────────────
SSH_CMD="ssh -F ${HOME}/.ssh/config plesk-deploy"
RSYNC_SSH="ssh -F ${HOME}/.ssh/config -p ${PLESK_PORT}"

# ── Hilfsfunktion: rsync (mit Dry-Run-Support) ───────────────────────────────
run_rsync() {
  local src="$1"
  local dst="$2"
  shift 2
  local extra_args=("$@")

  local rsync_args=(
    -az
    --partial
    --delete
    --stats
    "${extra_args[@]}"
    -e "${RSYNC_SSH}"
    "${src}"
    "${PLESK_USER}@${PLESK_HOST}:${dst}"
  )

  if [[ "${DRY_RUN}" == "true" ]]; then
    dry "rsync --dry-run ${src} → ${dst}"
    rsync --dry-run "${rsync_args[@]}"
  else
    rsync "${rsync_args[@]}"
  fi
}

# ── Hilfsfunktion: Remote-Kommando ───────────────────────────────────────────
run_remote() {
  local description="$1"
  shift
  if [[ "${DRY_RUN}" == "true" ]]; then
    dry "Remote: ${description} → [übersprungen]"
  else
    log "Remote: ${description}"
    ${SSH_CMD} "$@"
  fi
}

# ── Release-Marker ────────────────────────────────────────────────────────────
mkdir -p "${LOG_DIR}"
RELEASE_MARKER_CONTENT="service=${SERVICE} commit=${COMMIT_SHA} timestamp=${TIMESTAMP} user=${USER:-replit}"

# =============================================================================
# FRONTEND DEPLOY
# =============================================================================
deploy_frontend() {
  log "=== Frontend Deploy ==="

  # Build prüfen
  if [[ ! -d "apps/website" ]]; then
    fail "apps/website/ nicht gefunden. Repo-Root prüfen."
  fi

  log "Frontend bauen..."
  if [[ "${DRY_RUN}" != "true" ]]; then
    (
      cd apps/website
      npm ci --prefer-offline --silent 2>&1 | tail -5
      npm run build 2>&1 | tail -10
    )
    ok "Frontend-Build abgeschlossen."
  else
    dry "npm ci + npm run build (übersprungen)"
  fi

  if [[ ! -d "apps/website/dist" ]] && [[ "${DRY_RUN}" != "true" ]]; then
    fail "apps/website/dist/ nicht gefunden nach Build."
  fi

  # Zielpfad validieren
  [[ -n "${PLESK_BASE_PATH:-}" ]] || fail "\$PLESK_BASE_PATH nicht gesetzt."

  log "Frontend rsync → ${PLESK_HOST}:${PLESK_BASE_PATH}"
  run_rsync "apps/website/dist/" "${PLESK_BASE_PATH}/" \
    --exclude=".git" \
    --exclude="*.map"

  # Release-Marker auf Server schreiben
  run_remote "Release-Marker setzen" \
    bash -c "echo '${RELEASE_MARKER_CONTENT}' > '${PLESK_BASE_PATH}/.deploy_release' && chmod 644 '${PLESK_BASE_PATH}/.deploy_release'"

  ok "Frontend Deploy abgeschlossen."
}

# =============================================================================
# API DEPLOY
# =============================================================================
deploy_api() {
  log "=== API Deploy ==="

  if [[ ! -d "apps/api" ]]; then
    fail "apps/api/ nicht gefunden."
  fi

  # Zielpfad bestimmen
  local api_path="${PLESK_API_PATH:-}"
  if [[ -z "${api_path}" ]]; then
    api_path="$(dirname "${PLESK_BASE_PATH}")/subdomains/api/httpdocs"
    warn "PLESK_API_PATH nicht gesetzt, leite ab: ${api_path}"
  fi

  log "API rsync → ${PLESK_HOST}:${api_path}"
  run_rsync "apps/api/" "${api_path}/" \
    --exclude=".git" \
    --exclude="__pycache__" \
    --exclude="*.pyc" \
    --exclude=".venv" \
    --exclude="venv" \
    --exclude=".env" \
    --exclude="*.log"

  # Remote pip install
  run_remote "pip install -r requirements.txt" \
    bash -c "cd '${api_path}' && pip3 install -r requirements.txt --quiet --no-warn-script-location 2>&1 | tail -5"

  run_remote "API Release-Marker setzen" \
    bash -c "echo '${RELEASE_MARKER_CONTENT}' > '${api_path}/.deploy_release'"

  ok "API Deploy abgeschlossen."
}

# =============================================================================
# CRM DEPLOY
# =============================================================================
deploy_crm() {
  log "=== CRM Deploy (Drupal + CiviCRM) ==="

  if [[ ! -d "apps/crm" ]]; then
    warn "apps/crm/ nicht gefunden – CRM-Deploy übersprungen."
    return
  fi

  local crm_path="${PLESK_CRM_PATH:-}"
  if [[ -z "${crm_path}" ]]; then
    crm_path="$(dirname "${PLESK_BASE_PATH}")/subdomains/crm/httpdocs"
    warn "PLESK_CRM_PATH nicht gesetzt, leite ab: ${crm_path}"
  fi

  log "CRM rsync → ${PLESK_HOST}:${crm_path}"
  run_rsync "apps/crm/" "${crm_path}/" \
    --exclude=".git" \
    --exclude="node_modules" \
    --exclude="vendor" \
    --exclude="web/sites/*/files" \
    --exclude=".env" \
    --exclude="*.log"

  run_remote "composer install" \
    bash -c "cd '${crm_path}' && composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction 2>&1 | tail -10"

  run_remote "drush updb + cache rebuild" \
    bash -c "cd '${crm_path}' && vendor/bin/drush updb -y && vendor/bin/drush cr"

  run_remote "CRM Release-Marker setzen" \
    bash -c "echo '${RELEASE_MARKER_CONTENT}' > '${crm_path}/.deploy_release'"

  ok "CRM Deploy abgeschlossen."
}

# =============================================================================
# GAMES DEPLOY
# =============================================================================
deploy_games() {
  log "=== Games Deploy ==="

  if [[ ! -d "apps/babylon-game" ]]; then
    warn "apps/babylon-game/ nicht gefunden – Games-Deploy uebersprungen."
    return
  fi

  local games_path="${PLESK_GAMES_PATH:-$(dirname "${PLESK_BASE_PATH}")/subdomains/games/httpdocs}"

  log "Games rsync → ${PLESK_HOST}:${games_path}"
  run_rsync "apps/babylon-game/" "${games_path}/" \
    --exclude=".git" \
    --exclude="node_modules" \
    --exclude=".env"

  run_remote "Games Release-Marker setzen" \
    bash -c "echo '${RELEASE_MARKER_CONTENT}' > '${games_path}/.deploy_release'"

  ok "Games Deploy abgeschlossen."
}

# =============================================================================
# SERVICE-AUSWAHL
# =============================================================================
case "${SERVICE}" in
  frontend) deploy_frontend ;;
  api)      deploy_api ;;
  crm)      deploy_crm ;;
  games)    deploy_games ;;
  all)
    deploy_frontend
    deploy_api
    deploy_crm
    deploy_games
    ;;
  *)
    fail "Unbekannter Service: '${SERVICE}'. Erlaubt: frontend|api|crm|games|all"
    ;;
esac

# ── Zusammenfassung ───────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Deploy-Zusammenfassung"
echo "  Service:   ${SERVICE}"
echo "  Commit:    ${COMMIT_SHA}"
echo "  Zeitstempel: ${TIMESTAMP}"
if [[ "${DRY_RUN}" == "true" ]]; then
echo "  Modus:     DRY-RUN (kein Schreiben auf Server)"
else
echo "  Modus:     PRODUKTION"
fi
echo "════════════════════════════════════════════════════════"
echo ""

ok "Alle gewählten Services deployt."

#!/usr/bin/env bash
# =============================================================================
# post_deploy_verify.sh – Verifiziert ein abgeschlossenes Deployment
# =============================================================================
# Prüft:
#   1. SSH-Erreichbarkeit des Servers
#   2. Release-Marker im Zielpfad (Deploy hat stattgefunden)
#   3. Kritische Dateien vorhanden (index.html, API, CRM)
#   4. Health-Endpunkte via HTTP (optional, wenn MAIN_DOMAIN gesetzt)
# Output:
#   - Menschenlesbar (stdout)
#   - Maschinenlesbar (JSON via VERIFY_JSON=true)
# =============================================================================
set -euo pipefail

SERVICE="${SERVICE:-all}"
MAIN_DOMAIN="${MAIN_DOMAIN:-menschlichkeit-oesterreich.at}"
VERIFY_JSON="${VERIFY_JSON:-false}"
PLESK_HOST="${PLESK_HOST:-${PLSK_HOST:-}}"
PLESK_USER="${PLESK_USER:-${PLSK_USER:-}}"
PLESK_PORT="${PLESK_PORT:-${PLSK_PORT:-22}}"
TIMEOUT="${VERIFY_TIMEOUT:-15}"
PLESK_BASE_PATH="${PLESK_BASE_PATH:-${PLSK_DEPLOY_PATH:-httpdocs}}"
SSH_CONFIG_FILE="${SSH_CONFIG_FILE:-${HOME}/.ssh/config}"
PLESK_SSH_ALIAS="${PLESK_SSH_ALIAS:-${PLSK_SSH_ALIAS:-}}"

PASS=0
FAIL=0
WARN=0

declare -a RESULTS=()

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────
ts() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
log()  { echo "[verify $(ts)] $*"; }
ok()   { echo "  ✓ $*"; RESULTS+=("{\"check\":\"$1\",\"status\":\"pass\"}"); ((PASS++)) || true; }
fail() { echo "  ✗ $*"; RESULTS+=("{\"check\":\"$1\",\"status\":\"fail\",\"detail\":\"$2\"}"); ((FAIL++)) || true; }
warn() { echo "  ⚠ $*"; RESULTS+=("{\"check\":\"$1\",\"status\":\"warn\",\"detail\":\"$2\"}"); ((WARN++)) || true; }

remote_ssh() {
  if [[ -n "${PLESK_SSH_ALIAS}" && -f "${SSH_CONFIG_FILE}" ]]; then
    ssh -F "${SSH_CONFIG_FILE}" "${PLESK_SSH_ALIAS}" "$@"
  else
    ssh -p "${PLESK_PORT}" "${PLESK_USER}@${PLESK_HOST}" "$@"
  fi
}

# ── SSH-Erreichbarkeit ────────────────────────────────────────────────────────
check_ssh_reachable() {
  log "Pruefe SSH-Verbindung zu ${PLESK_HOST}:${PLESK_PORT}..."
  if timeout "${TIMEOUT}" bash -c "cat /dev/null > /dev/tcp/${PLESK_HOST}/${PLESK_PORT}" 2>/dev/null; then
    ok "SSH-Port erreichbar" "SSH-Port ${PLESK_PORT} auf ${PLESK_HOST} antwortet."
  else
    fail "SSH-Port erreichbar" "Port ${PLESK_PORT} auf ${PLESK_HOST} nicht erreichbar."
  fi
}

# ── Release-Marker prüfen ─────────────────────────────────────────────────────
check_release_marker() {
  local path="$1"
  local service_name="$2"
  log "Prüfe Release-Marker: ${path}/.deploy_release"
  local result
  result=$(remote_ssh \
    "cat '${path}/.deploy_release' 2>/dev/null || echo 'NOT_FOUND'" 2>/dev/null)
  if [[ "${result}" == "NOT_FOUND" ]]; then
    fail "${service_name} Release-Marker" "Datei .deploy_release nicht gefunden in ${path}."
  else
    ok "${service_name} Release-Marker" "Marker vorhanden: ${result}"
    echo "    Marker: ${result}"
  fi
}

# ── Dateiexistenz auf Server prüfen ──────────────────────────────────────────
check_remote_file() {
  local path="$1"
  local file="$2"
  local service_name="$3"
  log "Prüfe ${service_name}: ${path}/${file}"
  local result
  result=$(remote_ssh \
    "test -e '${path}/${file}' && echo 'OK' || echo 'MISSING'" 2>/dev/null)
  if [[ "${result}" == "OK" ]]; then
    ok "${service_name} Datei vorhanden" "${file}"
  else
    fail "${service_name} Datei vorhanden" "${path}/${file} nicht gefunden."
  fi
}

# ── HTTP Health-Check ─────────────────────────────────────────────────────────
check_http() {
  local url="$1"
  local service_name="$2"
  local expected_code="${3:-200}"
  log "HTTP-Check: ${url}"
  local http_code
  http_code=$(curl --silent --max-time "${TIMEOUT}" --output /dev/null \
    --write-out "%{http_code}" "${url}" 2>/dev/null || echo "000")
  if [[ "${http_code}" == "${expected_code}" ]]; then
    ok "${service_name} HTTP ${expected_code}" "URL: ${url} → HTTP ${http_code}"
  elif [[ "${http_code}" == "301" || "${http_code}" == "302" ]]; then
    warn "${service_name} HTTP Redirect" "URL: ${url} → HTTP ${http_code} (Redirect)"
  else
    fail "${service_name} HTTP ${expected_code}" "URL: ${url} → HTTP ${http_code}"
  fi
}

# =============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     Menschlichkeit Österreich – Post-Deploy Verifikation         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Pflicht-Variablen
for var in PLESK_HOST PLESK_USER PLESK_BASE_PATH; do
  [[ -n "${!var:-}" ]] || { echo "✗ \$${var} fehlt – Abbruch."; exit 1; }
done

# 1. SSH-Erreichbarkeit
check_ssh_reachable

# 2. Frontend
if [[ "${SERVICE}" == "all" || "${SERVICE}" == "frontend" ]]; then
  echo ""
  echo "── Frontend ──────────────────────────────────────────────"
  check_release_marker "${PLESK_BASE_PATH}" "Frontend"
  check_remote_file    "${PLESK_BASE_PATH}" "index.html" "Frontend"
  check_remote_file    "${PLESK_BASE_PATH}" "assets" "Frontend assets/"
  check_http           "https://${MAIN_DOMAIN}/" "Frontend"
fi

# 3. API
if [[ "${SERVICE}" == "all" || "${SERVICE}" == "api" ]]; then
  echo ""
  echo "── API ───────────────────────────────────────────────────"
  API_PATH="${PLESK_API_PATH:-${PLSK_API_PATH:-subdomains/api/httpdocs}}"
  check_release_marker "${API_PATH}" "API"
  check_remote_file    "${API_PATH}" "requirements.txt" "API"
  check_http           "https://api.${MAIN_DOMAIN}/healthz" "API"
fi

# 4. CRM
if [[ "${SERVICE}" == "all" || "${SERVICE}" == "crm" ]]; then
  echo ""
  echo "── CRM ───────────────────────────────────────────────────"
  CRM_PATH="${PLESK_CRM_PATH:-${PLSK_CRM_PATH:-subdomains/crm/httpdocs}}"
  check_release_marker "${CRM_PATH}" "CRM"
  check_remote_file    "${CRM_PATH}" "vendor/autoload.php" "CRM (composer)"
  check_http           "https://crm.${MAIN_DOMAIN}/" "CRM"
fi

# 5. Games
if [[ "${SERVICE}" == "all" || "${SERVICE}" == "games" ]]; then
  echo ""
  echo "── Games ─────────────────────────────────────────────────"
  GAMES_PATH="${PLESK_GAMES_PATH:-${PLSK_GAMES_PATH:-subdomains/games/httpdocs}}"
  check_release_marker "${GAMES_PATH}" "Games"
  check_http           "https://games.${MAIN_DOMAIN}/" "Games"
fi

# ── Ergebnis ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Ergebnis: ${PASS} OK | ${WARN} Warnung(en) | ${FAIL} Fehler"
echo "════════════════════════════════════════════════════════"
echo ""

# JSON-Output (maschinenlesbar)
if [[ "${VERIFY_JSON}" == "true" ]]; then
  RESULT_JSON=$(IFS=','; echo "${RESULTS[*]:-}")
  echo "{\"timestamp\":\"$(ts)\",\"service\":\"${SERVICE}\",\"pass\":${PASS},\"warn\":${WARN},\"fail\":${FAIL},\"checks\":[${RESULT_JSON}]}"
fi

if (( FAIL > 0 )); then
  echo "✗ Verifikation FEHLGESCHLAGEN."
  exit 1
else
  echo "✓ Verifikation erfolgreich."
  exit 0
fi

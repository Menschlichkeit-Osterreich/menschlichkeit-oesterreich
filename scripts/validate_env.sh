#!/usr/bin/env bash
# =============================================================================
# validate_env.sh – Prüft Existenz und Plausibilität aller Deploy-Variablen
# =============================================================================
# Gibt NIE Secret-Inhalte aus.
# Exit 0 = alle Checks OK
# Exit 1 = mindestens ein kritischer Fehler
# Exit 2 = Warnungen (nur mit --strict als Fehler gewertet)
# =============================================================================
set -euo pipefail

STRICT="${1:-}"
ERRORS=0
WARNINGS=0

ok()   { echo "  ✓ $*"; }
warn() { echo "  ⚠ $*"; ((WARNINGS++)) || true; }
fail() { echo "  ✗ $*"; ((ERRORS++)) || true; }

# ── Hilfsfunktion: Variable vorhanden und nicht-leer ─────────────────────────
check_required() {
  local var="$1"
  local hint="${2:-}"
  if [[ -z "${!var:-}" ]]; then
    fail "\$${var} ist nicht gesetzt oder leer.${hint:+ Hinweis: ${hint}}"
  else
    ok "\$${var} gesetzt (${#!var} Zeichen)."
  fi
}

# ── Hilfsfunktion: Hostname/IP-Plausibilität ──────────────────────────────────
check_host() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "${value}" ]]; then
    fail "\$${var} ist nicht gesetzt."
    return
  fi
  # IP-Format oder Hostname: erlaubt Buchstaben, Ziffern, ., -
  if [[ ! "${value}" =~ ^[a-zA-Z0-9._-]+$ ]]; then
    fail "\$${var} hat unplausibles Format: enthält unerwartete Zeichen."
  else
    ok "\$${var} Plausibilitätsprüfung OK."
  fi
}

# ── Hilfsfunktion: Port-Plausibilität ────────────────────────────────────────
check_port() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "${value}" ]]; then
    warn "\$${var} nicht gesetzt – Default 22 wird angenommen."
    return
  fi
  if [[ ! "${value}" =~ ^[0-9]+$ ]] || (( value < 1 || value > 65535 )); then
    fail "\$${var}=${value} ist kein gültiger Port (1-65535)."
  else
    ok "\$${var}=${value} gültiger Port."
  fi
}

# ── Hilfsfunktion: Pfad-Plausibilität ────────────────────────────────────────
check_path() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "${value}" ]]; then
    fail "\$${var} ist nicht gesetzt."
    return
  fi
  if [[ "${value}" == "/" ]] || [[ "${value}" == "/root" ]] || [[ "${value}" == "/home" ]]; then
    fail "\$${var}=${value} ist ein gefährlicher Zielpfad (Root/Home-Verzeichnis)."
  elif [[ ! "${value}" =~ ^/ ]]; then
    warn "\$${var}=${value} ist kein absoluter Pfad – Deploy könnte fehlschlagen."
  else
    ok "\$${var} Pfad plausibel (absolut, nicht gefährlich)."
  fi
}

# ── Hilfsfunktion: SSH-Key-Format-Plausibilität ──────────────────────────────
check_ssh_key() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "${value}" ]]; then
    fail "\$${var} ist nicht gesetzt."
    return
  fi
  # SSH Private Key Header prüfen (kein Inhalt loggen)
  if echo "${value}" | grep -q "PRIVATE KEY"; then
    ok "\$${var} enthält Private-Key-Header."
  else
    fail "\$${var} enthält keinen erkennbaren Private-Key-Header (kein 'PRIVATE KEY' gefunden)."
  fi
}

# ── Hilfsfunktion: known_hosts-Plausibilität ─────────────────────────────────
check_known_hosts() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "${value}" ]]; then
    fail "\$${var} ist nicht gesetzt."
    return
  fi
  if echo "${value}" | grep -q "ecdsa-sha2\|ssh-ed25519\|ssh-rsa"; then
    ok "\$${var} enthält erkennbaren Host-Key-Eintrag."
  else
    warn "\$${var} enthält keinen klar erkennbaren Host-Key-Typ – Inhalt prüfen."
  fi
}

# =============================================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  validate_env.sh – Menschlichkeit Österreich Deploy"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Pflicht-Variablen ─────────────────────────────────────────────────────────
echo "▶ SSH / Plesk Zugangsdaten"
PLESK_HOST="${PLESK_HOST:-${PLSK_HOST:-}}"
PLESK_USER="${PLESK_USER:-${PLSK_USER:-}}"
PLESK_PORT="${PLESK_PORT:-${PLSK_PORT:-}}"
PLESK_SSH_KEY="${PLESK_SSH_KEY:-${PLSK_SSH_KEY:-}}"
PLESK_KNOWN_HOSTS="${PLESK_KNOWN_HOSTS:-${PLSK_KNOWN_HOSTS:-}}"
PLESK_BASE_PATH="${PLESK_BASE_PATH:-${PLSK_DEPLOY_PATH:-}}"
PLESK_API_PATH="${PLESK_API_PATH:-${PLSK_API_PATH:-}}"
PLESK_CRM_PATH="${PLESK_CRM_PATH:-${PLSK_CRM_PATH:-}}"

check_required PLESK_HOST   "Plesk-Server Hostname oder IP"
check_host     PLESK_HOST
check_required PLESK_USER   "SSH-Benutzername auf Plesk"
check_port     PLESK_PORT

echo ""
echo "▶ SSH-Schlüssel"
check_ssh_key  PLESK_SSH_KEY
check_known_hosts PLESK_KNOWN_HOSTS

echo ""
echo "▶ Deploy-Pfade"
check_path     PLESK_BASE_PATH

echo ""
echo "▶ Optionale Variablen"
if [[ -n "${GITHUB_SSH_KEY:-}" ]]; then
  check_ssh_key GITHUB_SSH_KEY
  ok "GITHUB_SSH_KEY gesetzt."
else
  warn "GITHUB_SSH_KEY nicht gesetzt (optional für Git-Operationen auf Plesk)."
fi

if [[ -n "${PLESK_API_PATH:-}" ]]; then
  check_path PLESK_API_PATH
  ok "PLESK_API_PATH gesetzt."
else
  warn "PLESK_API_PATH nicht gesetzt – API-Deploy wird uebersprungen."
fi

if [[ -n "${PLESK_CRM_PATH:-}" ]]; then
  check_path PLESK_CRM_PATH
  ok "PLESK_CRM_PATH gesetzt."
else
  warn "PLESK_CRM_PATH nicht gesetzt – CRM-Deploy wird uebersprungen."
fi

# ── Ergebnis ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Ergebnis: ${ERRORS} Fehler | ${WARNINGS} Warnungen"
echo "═══════════════════════════════════════════════════════"
echo ""

if (( ERRORS > 0 )); then
  echo "✗ Validierung FEHLGESCHLAGEN – Deploy abbrechen."
  exit 1
fi

if (( WARNINGS > 0 )) && [[ "${STRICT}" == "--strict" ]]; then
  echo "✗ Validierung FEHLGESCHLAGEN (--strict, Warnungen = Fehler)."
  exit 2
fi

echo "✓ Validierung OK."
exit 0

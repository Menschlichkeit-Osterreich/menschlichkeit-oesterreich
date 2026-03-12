#!/usr/bin/env bash
# =============================================================================
# bootstrap_ssh.sh – SSH-Laufzeit-Bootstrap für Replit → Plesk Deploy
# =============================================================================
# Anforderungen:
#   - Idempotent ausführbar
#   - Kein Loggen von Secret-Werten
#   - StrictHostKeyChecking + IdentitiesOnly
#   - Host-Key-Verifikation über PLESK_KNOWN_HOSTS Secret
#   - Optional: GitHub SSH Key (GITHUB_SSH_KEY)
# =============================================================================
set -euo pipefail

# ── Hilfsfunktionen ──────────────────────────────────────────────────────────
log()    { echo "[bootstrap_ssh] $*" >&2; }
ok()     { echo "[bootstrap_ssh] ✓ $*" >&2; }
warn()   { echo "[bootstrap_ssh] ⚠ $*" >&2; }
fail()   { echo "[bootstrap_ssh] ✗ $*" >&2; exit 1; }

# ── Pflicht-Variablen prüfen (Existenz, kein Inhalt ausgeben) ────────────────
for var in PLSK_HOST PLSK_USER PLSK_PORT PLSK_SSH_KEY PLSK_KNOWN_HOSTS; do
  [[ -n "${!var:-}" ]] || fail "Pflicht-Variable \$${var} ist nicht gesetzt."
done
ok "Alle Pflicht-Variablen vorhanden."

# ── ~/.ssh Verzeichnis anlegen / Berechtigungen sichern ──────────────────────
SSH_DIR="${HOME}/.ssh"
mkdir -p "${SSH_DIR}"
chmod 700 "${SSH_DIR}"
ok "SSH-Verzeichnis: ${SSH_DIR}"

# ── Deploy-Key schreiben (aus Secret – Inhalt niemals loggen) ────────────────
DEPLOY_KEY_FILE="${SSH_DIR}/plesk_deploy_key"
if [[ -f "${DEPLOY_KEY_FILE}" ]]; then
  warn "Deploy-Key existiert bereits – wird überschrieben."
fi
# Schreiben über printf (kein echo, kein set -x)
printf '%s\n' "${PLSK_SSH_KEY}" > "${DEPLOY_KEY_FILE}"
chmod 600 "${DEPLOY_KEY_FILE}"
ok "Deploy-Key gesetzt: ${DEPLOY_KEY_FILE} (Inhalt maskiert)"

# ── GitHub SSH Key (optional) ────────────────────────────────────────────────
if [[ -n "${GITHUB_SSH_KEY:-}" ]]; then
  GITHUB_KEY_FILE="${SSH_DIR}/github_deploy_key"
  printf '%s\n' "${GITHUB_SSH_KEY}" > "${GITHUB_KEY_FILE}"
  chmod 600 "${GITHUB_KEY_FILE}"
  ok "GitHub Deploy-Key gesetzt: ${GITHUB_KEY_FILE}"
else
  warn "GITHUB_SSH_KEY nicht gesetzt – GitHub SSH wird nicht konfiguriert."
fi

# ── known_hosts aufbauen (aus Secret – kein ssh-keyscan in Produktion) ───────
KNOWN_HOSTS_FILE="${SSH_DIR}/known_hosts"
# Bestehenden Eintrag für diesen Host entfernen (idempotent)
if command -v ssh-keygen &>/dev/null; then
  ssh-keygen -R "[${PLSK_HOST}]:${PLSK_PORT}" -f "${KNOWN_HOSTS_FILE}" 2>/dev/null || true
  ssh-keygen -R "${PLSK_HOST}" -f "${KNOWN_HOSTS_FILE}" 2>/dev/null || true
fi
# Host-Key aus Secret eintragen
printf '%s\n' "${PLSK_KNOWN_HOSTS}" >> "${KNOWN_HOSTS_FILE}"
chmod 600 "${KNOWN_HOSTS_FILE}"
ok "known_hosts aktualisiert: ${KNOWN_HOSTS_FILE}"

# ── SSH-Konfigurationsdatei schreiben ────────────────────────────────────────
SSH_CONFIG_FILE="${SSH_DIR}/config"
# Bisherigen Block für diesen Host entfernen (idempotent)
if [[ -f "${SSH_CONFIG_FILE}" ]]; then
  # Entfernt den Block "Host plesk-deploy" aus der config (awk-basiert)
  awk '
    /^Host plesk-deploy/ { skip=1; next }
    skip && /^Host / { skip=0 }
    !skip
  ' "${SSH_CONFIG_FILE}" > "${SSH_CONFIG_FILE}.tmp" && mv "${SSH_CONFIG_FILE}.tmp" "${SSH_CONFIG_FILE}"
fi

cat >> "${SSH_CONFIG_FILE}" <<EOF

# ---- Menschlichkeit Österreich: Plesk Deploy ----
# Generiert von scripts/bootstrap_ssh.sh am $(date -u '+%Y-%m-%dT%H:%M:%SZ')
Host plesk-deploy
  HostName ${PLSK_HOST}
  Port ${PLSK_PORT}
  User ${PLSK_USER}
  IdentityFile ${DEPLOY_KEY_FILE}
  IdentitiesOnly yes
  StrictHostKeyChecking yes
  ServerAliveInterval 30
  ServerAliveCountMax 3
  ConnectTimeout 15
  BatchMode yes
EOF
chmod 600 "${SSH_CONFIG_FILE}"
ok "SSH-Config geschrieben: ${SSH_CONFIG_FILE}"

# ── Optional: GitHub in SSH-Config eintragen ─────────────────────────────────
if [[ -n "${GITHUB_SSH_KEY:-}" ]]; then
  cat >> "${SSH_CONFIG_FILE}" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile ${GITHUB_KEY_FILE}
  IdentitiesOnly yes
  StrictHostKeyChecking yes
EOF
  ok "GitHub SSH-Eintrag hinzugefügt."
fi

# ── Verbindungstest (ohne Authentifizierung) ──────────────────────────────────
log "Teste SSH-Erreichbarkeit (nur TCP, kein Login)..."
if timeout 10 bash -c "cat /dev/null > /dev/tcp/${PLSK_HOST}/${PLSK_PORT}" 2>/dev/null; then
  ok "SSH-Port ${PLSK_PORT} auf ${PLSK_HOST} erreichbar."
else
  warn "SSH-Port ${PLSK_PORT} auf ${PLSK_HOST} nicht per TCP erreichbar – evtl. Firewall."
fi

ok "SSH Bootstrap abgeschlossen. Verwende 'ssh plesk-deploy' für Verbindung."

#!/usr/bin/env bash
set -euo pipefail

# Codespace SSH Setup (GitHub + Plesk) – idempotent
# Repo: Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development
# Codespace Host: $(hostname)

# --- feste Zielwerte ---
PL_HOST="5.183.217.146"
PL_PORT="22"
PL_USER="dmpl20230054"

SSH_DIR="$HOME/.ssh"
mkdir -p "$SSH_DIR"; chmod 700 "$SSH_DIR"

echo "[INFO] Prüfe/Erzeuge SSH Keys (GitHub & Plesk)"

# 1) GitHub/Codespace Key (nur erzeugen, wenn fehlt)
if [[ ! -f "$SSH_DIR/id_ed25519_codespace" ]]; then
  ssh-keygen -t ed25519 -a 100 \
    -f "$SSH_DIR/id_ed25519_codespace" \
    -C "github-codespace-$(hostname)-$(date +%F)" -N "" >/dev/null
  echo "[OK] Neuer Codespace GitHub Key erzeugt"
else
  echo "[SKIP] Codespace GitHub Key existiert bereits"
fi

# 2) Plesk Key (separat; nur erzeugen, wenn fehlt)
if [[ ! -f "$SSH_DIR/id_ed25519_codespace_plesk" ]]; then
  ssh-keygen -t ed25519 -a 100 \
    -f "$SSH_DIR/id_ed25519_codespace_plesk" \
    -C "plesk-codespace-$(hostname)-$(date +%F)" -N "" >/dev/null
  echo "[OK] Neuer Codespace Plesk Key erzeugt"
else
  echo "[SKIP] Codespace Plesk Key existiert bereits"
fi

# 3) Agent starten & Keys laden
eval "$(ssh-agent -s)" >/dev/null
ssh-add "$SSH_DIR/id_ed25519_codespace" >/dev/null 2>&1 || true
ssh-add "$SSH_DIR/id_ed25519_codespace_plesk" >/dev/null 2>&1 || true
echo "[INFO] SSH-Agent läuft & Keys geladen"

# 4) Host-Fingerprint pinnen
if ! grep -q "$PL_HOST" "$SSH_DIR/known_hosts" 2>/dev/null; then
  ssh-keyscan -p "$PL_PORT" "$PL_HOST" >> "$SSH_DIR/known_hosts" 2>/dev/null || true
  echo "[OK] Plesk Host-Fingerprint hinzugefügt"
else
  echo "[SKIP] Plesk Host-Fingerprint bereits vorhanden"
fi
chmod 644 "$SSH_DIR/known_hosts"

# 5) SSH-Config Aliase (idempotent)
CONF="$SSH_DIR/config"; touch "$CONF"

BLOCK_GH=$'Host github.com\n    HostName github.com\n    User git\n    IdentitiesOnly yes\n    IdentityFile ~/.ssh/id_ed25519_codespace\n    PubkeyAuthentication yes\n    ForwardAgent no\n'
if ! grep -q "^Host github\.com$" "$CONF"; then
  printf "\n%s\n" "$BLOCK_GH" >> "$CONF"
  echo "[OK] SSH Config für github.com ergänzt"
else
  echo "[SKIP] SSH Config github.com bereits vorhanden"
fi

BLOCK_PL=$'Host plesk-prod-cs\n    HostName '"$PL_HOST"$'\n    Port '"$PL_PORT"$'\n    User '"$PL_USER"$'\n    IdentitiesOnly yes\n    IdentityFile ~/.ssh/id_ed25519_codespace_plesk\n    PubkeyAuthentication yes\n    ForwardAgent no\n'
if ! grep -q "^Host plesk-prod-cs$" "$CONF"; then
  printf "\n%s\n" "$BLOCK_PL" >> "$CONF"
  echo "[OK] SSH Config für plesk-prod-cs ergänzt"
else
  echo "[SKIP] SSH Config plesk-prod-cs bereits vorhanden"
fi

chmod 600 "$CONF"
chmod 600 "$SSH_DIR"/id_ed25519_codespace* 2>/dev/null || true
chmod 644 "$SSH_DIR"/id_ed25519_codespace*.pub 2>/dev/null || true

# 6) Hinweise zum Public Key (manuell einmal in GitHub/Plesk eintragen)
echo "=== GitHub Public Key (Codespace) ==="
cat "$SSH_DIR/id_ed25519_codespace.pub" || true
echo
echo "=== Plesk Public Key (Codespace) ==="
cat "$SSH_DIR/id_ed25519_codespace_plesk.pub" || true
echo
echo "Fertig. Schlüssel in GitHub (Settings > SSH keys) und Plesk (Extensions > SSH Keys) hinzufügen."

exit 0
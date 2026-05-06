#!/usr/bin/env bash
set -euo pipefail

# Install Chromium/Chrome (headless) for Lighthouse CI in Codespace
# Idempotent: prüft vorhandene Binärdateien bevor Installation

if command -v chromium-browser >/dev/null 2>&1; then
  echo "[chrome-install] Chromium bereits installiert: $(chromium-browser --version)"; exit 0
fi
if command -v google-chrome >/dev/null 2>&1; then
  echo "[chrome-install] Google Chrome bereits installiert: $(google-chrome --version)"; exit 0
fi

echo "[chrome-install] Installiere Dependencies (apt update)" >&2
APT_CMD="apt-get"
if [[ $(id -u) -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    APT_CMD="sudo apt-get"
  else
    echo "[chrome-install] Kein Root & kein sudo verfügbar – Installation abgebrochen." >&2
    exit 1
  fi
fi

$APT_CMD update -y >/dev/null || { echo "[chrome-install] apt update fehlgeschlagen" >&2; exit 1; }
$APT_CMD install -y --no-install-recommends chromium-browser >/dev/null || {
  echo "[chrome-install] Fallback: Installation über Paketquelle fehlgeschlagen" >&2
  echo "[chrome-install] Bitte manuell prüfen / alternative Quelle hinzufügen" >&2
  exit 1
}

echo "[chrome-install] Fertig: $(chromium-browser --version)" >&2

exit 0
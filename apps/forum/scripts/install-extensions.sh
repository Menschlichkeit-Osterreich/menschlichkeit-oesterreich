#!/bin/bash
# =============================================================
# phpBB Extension-Installer
# Menschlichkeit Österreich Forum
#
# Verwendung:
#   docker exec -it menschlichkeit-phpbb-fpm bash /var/www/phpbb/scripts/install-extensions.sh
#
# Voraussetzung: phpBB Web-Installer muss bereits abgeschlossen sein.
# =============================================================

set -euo pipefail

PHPBB_DIR="/var/www/phpbb"
EXT_DIR="${PHPBB_DIR}/ext"
CLI="${PHPBB_DIR}/bin/phpbbcli.php"

echo "================================================="
echo "  phpBB Extension-Installer — MÖ Forum"
echo "================================================="

# Prüfe ob phpBB installiert ist
if [ ! -f "${PHPBB_DIR}/config.php" ]; then
    echo "FEHLER: phpBB ist noch nicht installiert."
    echo "Bitte zuerst den Web-Installer unter http://localhost:8002/install/app.php ausführen."
    exit 1
fi

# ── 1. hCaptcha (DSGVO-konformes CAPTCHA) ────────────────────
echo ""
echo "[1/4] hCaptcha Extension installieren..."
if [ -d "${EXT_DIR}/alfredoramos/hcaptcha" ]; then
    echo "  → Bereits vorhanden, übersprungen."
else
    mkdir -p "${EXT_DIR}/alfredoramos"
    curl -fSL "https://github.com/AlfredoRamos/phpbb-ext-hcaptcha/archive/refs/heads/master.zip" \
        -o /tmp/hcaptcha.zip
    unzip -q /tmp/hcaptcha.zip -d /tmp/hcaptcha
    mv /tmp/hcaptcha/phpbb-ext-hcaptcha-master "${EXT_DIR}/alfredoramos/hcaptcha"
    rm -rf /tmp/hcaptcha.zip /tmp/hcaptcha
    echo "  → Heruntergeladen."
fi

# ── 2. SEO Metadata (Open Graph, Twitter Cards, JSON-LD) ─────
echo ""
echo "[2/4] SEO Metadata Extension installieren..."
if [ -d "${EXT_DIR}/alfredoramos/seometadata" ]; then
    echo "  → Bereits vorhanden, übersprungen."
else
    mkdir -p "${EXT_DIR}/alfredoramos"
    curl -fSL "https://github.com/AlfredoRamos/phpbb-ext-seometadata/archive/refs/heads/master.zip" \
        -o /tmp/seometadata.zip
    unzip -q /tmp/seometadata.zip -d /tmp/seometadata
    mv /tmp/seometadata/phpbb-ext-seometadata-master "${EXT_DIR}/alfredoramos/seometadata"
    rm -rf /tmp/seometadata.zip /tmp/seometadata
    echo "  → Heruntergeladen."
fi

# ── 3. Media Embed (YouTube, Vimeo etc.) ──────────────────────
echo ""
echo "[3/4] Media Embed Extension prüfen..."
if [ -d "${EXT_DIR}/phpbb/mediaembed" ]; then
    echo "  → Bereits im Docker-Image vorhanden."
else
    echo "  WARNUNG: Media Embed nicht gefunden."
    echo "  Bitte manuell von https://www.phpbb.com/customise/db/extension/mediaembed/ installieren."
fi

# ── 4. Extensions über phpBB CLI aktivieren ───────────────────
echo ""
echo "[4/4] Extensions über CLI aktivieren..."

# Berechtigungen sicherstellen
chown -R www-data:www-data "${EXT_DIR}" 2>/dev/null || true

EXTENSIONS=(
    "alfredoramos/hcaptcha"
    "alfredoramos/seometadata"
    "phpbb/mediaembed"
)

for ext in "${EXTENSIONS[@]}"; do
    if [ -d "${EXT_DIR}/${ext}" ]; then
        echo "  → Aktiviere ${ext}..."
        php "${CLI}" extension:enable "${ext}" 2>/dev/null && \
            echo "    ✓ ${ext} aktiviert." || \
            echo "    ✗ ${ext} konnte nicht aktiviert werden (möglicherweise inkompatibel)."
    else
        echo "  → ${ext} nicht vorhanden, übersprungen."
    fi
done

# ── Post-Install-Hinweise ─────────────────────────────────────
echo ""
echo "================================================="
echo "  Installation abgeschlossen!"
echo "================================================="
echo ""
echo "Nächste Schritte im ACP (Admin Control Panel):"
echo ""
echo "1. CAPTCHA konfigurieren:"
echo "   ACP > Board Settings > Anti-Spam > hCaptcha"
echo "   → Site Key und Secret Key von https://dashboard.hcaptcha.com eintragen"
echo ""
echo "2. Q&A CAPTCHA einrichten (zusätzliche Schutzschicht):"
echo "   ACP > Board Settings > Anti-Spam > Q&A CAPTCHA"
echo "   → Deutsche Fragen hinzufügen, z.B.:"
echo "     'In welchem Land liegt Wien?' → 'Österreich'"
echo "     'Wie heißt unser Verein? (Vorname)' → 'Menschlichkeit'"
echo ""
echo "3. SEO Metadata konfigurieren:"
echo "   ACP > Extensions > SEO Metadata"
echo "   → Open Graph aktivieren, Standardbild setzen"
echo ""
echo "4. Media Embed konfigurieren:"
echo "   ACP > Extensions > Media Embed"
echo "   → YouTube, Vimeo und andere Dienste aktivieren"
echo ""
echo "5. DSGVO-Einstellungen prüfen:"
echo "   ACP > General > Privacy Policy"
echo "   ACP > General > Cookie Settings"
echo "   ACP > General > Board Settings > IP-Logging auf 7 Tage setzen"
echo "   ACP > Users > User Registration > Geburtstagspflichtfeld deaktivieren"
echo ""
echo "6. Sprache setzen:"
echo "   ACP > Customise > Language Packs > Deutsch (Sie) als Standard"
echo ""
echo "7. Theme aktivieren:"
echo "   ACP > Customise > Install Styles > moe_prosilver"
echo "   ACP > Customise > Styles > moe_prosilver als Standard setzen"
echo ""

#!/bin/bash
# SSH-Schlüssel Setup für GitHub Secrets und Plesk
# Automatisierte Konfiguration

set -uo pipefail

echo "=========================================="
echo "SSH-Schlüssel Setup"
echo "GitHub Secrets + Plesk Server"
echo "=========================================="
echo ""

# Variablen
SSH_PRIVATE_KEY="$HOME/.ssh/id_ed25519"
SSH_PUBLIC_KEY="$HOME/.ssh/id_ed25519.pub"
GITHUB_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
GITHUB_REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
PLESK_HOST="dmpl20230054@5.183.217.146"

if [[ -z "$GITHUB_TOKEN" ]]; then
    echo "❌ Kein GitHub-Token gesetzt."
    echo "   Setze GH_TOKEN oder GITHUB_TOKEN mit Repository-Secrets-Berechtigung"
    echo "   und starte das Skript danach erneut."
    echo "   Ohne explizites Token wird absichtlich kein Fallback verwendet."
    exit 1
fi

# Prüfe SSH-Schlüssel
if [[ ! -f "$SSH_PRIVATE_KEY" ]]; then
    echo "❌ SSH Private Key nicht gefunden: $SSH_PRIVATE_KEY"
    echo "Bitte zuerst generieren: ssh-keygen -t ed25519"
    exit 1
fi

if [[ ! -f "$SSH_PUBLIC_KEY" ]]; then
    echo "❌ SSH Public Key nicht gefunden: $SSH_PUBLIC_KEY"
    exit 1
fi

echo "✅ SSH-Schlüssel gefunden:"
echo "   Private: $SSH_PRIVATE_KEY"
echo "   Public:  $SSH_PUBLIC_KEY"
echo ""

# ============================================
# SCHRITT 1: GitHub Repository Secret setzen
# ============================================

echo "=========================================="
echo "SCHRITT 1: GitHub Repository Secret"
echo "=========================================="
echo ""

# Private Key base64-kodieren für sichere Übertragung
PRIVATE_KEY_CONTENT=$(cat "$SSH_PRIVATE_KEY")

# GitHub Secrets API verwenden (nur für Repository Secrets, nicht Codespaces)
echo "📤 Uploading SSH_PRIVATE_KEY to GitHub Repository Secrets..."

# Erst Public Key des Repositories holen für Verschlüsselung
REPO_PUBLIC_KEY=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_REPO/actions/secrets/public-key")

REPO_KEY_ID=$(echo "$REPO_PUBLIC_KEY" | jq -r '.key_id')
REPO_KEY=$(echo "$REPO_PUBLIC_KEY" | jq -r '.key')

if [[ -z "$REPO_KEY_ID" ]] || [[ "$REPO_KEY_ID" == "null" ]]; then
    echo "❌ Fehler: Konnte Repository Public Key nicht abrufen"
    echo "   Bitte prüfe GitHub Token Permissions (muss 'repo' scope haben)"
    echo ""
    echo "⚠️  ALTERNATIVE: Manuell über GitHub Web-UI:"
    echo "   1. Gehe zu: https://github.com/$GITHUB_REPO/settings/secrets/actions"
    echo "   2. Klicke: 'New repository secret'"
    echo "   3. Name: SSH_PRIVATE_KEY"
    echo "   4. Value: (siehe unten)"
    echo ""
    echo "=========================================="
    echo "PRIVATE KEY für GitHub Secret:"
    echo "=========================================="
    cat "$SSH_PRIVATE_KEY"
    echo "=========================================="
    echo ""
else
    echo "✅ Repository Public Key abgerufen (Key ID: $REPO_KEY_ID)"
    
    # Python für libsodium-Verschlüsselung (GitHub erfordert das)
    # Alternative: Manuell, da libsodium nicht installiert ist
    echo ""
    echo "⚠️  GitHub Secrets API erfordert libsodium-Verschlüsselung"
    echo "   In Codespaces nicht verfügbar → Manuelle Eingabe erforderlich"
    echo ""
    echo "📋 BITTE MANUELL EINGEBEN:"
    echo "   1. URL: https://github.com/$GITHUB_REPO/settings/secrets/actions"
    echo "   2. 'New repository secret'"
    echo "   3. Name: SSH_PRIVATE_KEY"
    echo "   4. Value: (kopiere den folgenden Private Key)"
    echo ""
    echo "=========================================="
    echo "PRIVATE KEY (für GitHub Secret kopieren):"
    echo "=========================================="
    cat "$SSH_PRIVATE_KEY"
    echo "=========================================="
    echo ""
fi

read -p "Hast du SSH_PRIVATE_KEY in GitHub Secrets eingefügt? (j/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo "⚠️  Bitte GitHub Secret manuell setzen und Skript erneut ausführen"
    exit 1
fi

echo "✅ GitHub Secret SSH_PRIVATE_KEY konfiguriert"
echo ""

# ============================================
# SCHRITT 2: Public Key auf Plesk-Server
# ============================================

echo "=========================================="
echo "SCHRITT 2: Public Key auf Plesk-Server"
echo "=========================================="
echo ""

echo "📋 Public Key für Plesk:"
echo "=========================================="
cat "$SSH_PUBLIC_KEY"
echo "=========================================="
echo ""

echo "🔧 Methoden zum Hinzufügen auf Plesk-Server:"
echo ""
echo "METHODE 1: ssh-copy-id (empfohlen)"
echo "-------------------------------------------"
echo "ssh-copy-id -i $SSH_PUBLIC_KEY $PLESK_HOST"
echo ""
echo "METHODE 2: Manuell per SSH"
echo "-------------------------------------------"
echo "ssh $PLESK_HOST 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo \"$(cat $SSH_PUBLIC_KEY)\" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'"
echo ""
echo "METHODE 3: Plesk Panel (Web-UI)"
echo "-------------------------------------------"
echo "1. Login: https://5.183.217.146:8443"
echo "2. Tools & Settings → SSH Keys"
echo "3. 'Add Key' → Public Key einfügen"
echo ""

read -p "Public Key jetzt auf Plesk-Server hinzufügen? (j/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Jj]$ ]]; then
    echo ""
    echo "🔑 Versuche ssh-copy-id..."
    if command -v ssh-copy-id &>/dev/null; then
        ssh-copy-id -i "$SSH_PUBLIC_KEY" "$PLESK_HOST"
        SSH_COPY_EXIT=$?
        
        if [[ $SSH_COPY_EXIT -eq 0 ]]; then
            echo "✅ Public Key erfolgreich auf Plesk-Server hinzugefügt"
        else
            echo "❌ ssh-copy-id fehlgeschlagen (Exit Code: $SSH_COPY_EXIT)"
            echo "Bitte manuell über Methode 2 oder 3 hinzufügen"
        fi
    else
        echo "⚠️  ssh-copy-id nicht verfügbar"
        echo "Verwende manuelle Methode..."
        
        ssh -o StrictHostKeyChecking=no "$PLESK_HOST" \
            "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$(cat $SSH_PUBLIC_KEY)' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" \
            && echo "✅ Public Key manuell hinzugefügt" \
            || echo "❌ Manuelle Hinzufügung fehlgeschlagen"
    fi
else
    echo "⚠️  Bitte Public Key manuell auf Plesk-Server hinzufügen"
fi

echo ""

# ============================================
# SCHRITT 3: SSH-Verbindung testen
# ============================================

echo "=========================================="
echo "SCHRITT 3: SSH-Verbindung testen"
echo "=========================================="
echo ""

read -p "SSH-Verbindung zu Plesk jetzt testen? (j/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Jj]$ ]]; then
    echo ""
    echo "🔗 Teste SSH-Verbindung mit neuem Schlüssel..."
    
    if ssh -i "$SSH_PRIVATE_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$PLESK_HOST" \
        "echo '✅ SSH-Verbindung erfolgreich!' && hostname && whoami && pwd"; then
        echo ""
        echo "✅ SSH-SETUP ERFOLGREICH ABGESCHLOSSEN!"
        echo ""
        echo "📋 Nächste Schritte:"
        echo "   1. SSH-Schlüssel in .env hinzufügen:"
        echo "      SSH_KEY=$SSH_PRIVATE_KEY"
        echo ""
        echo "   2. Subdomain-Setup durchführen:"
        echo "      bash scripts/check-subdomain-dns.sh"
        echo ""
        echo "   3. Deployment testen:"
        echo "      bash scripts/safe-deploy.sh --dry-run"
        echo ""
    else
        echo ""
        echo "❌ SSH-Verbindung fehlgeschlagen"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Public Key korrekt auf Server? (siehe Methoden oben)"
        echo "  2. Private Key Permissions: chmod 600 $SSH_PRIVATE_KEY"
        echo "  3. SSH-Agent läuft? eval \$(ssh-agent) && ssh-add $SSH_PRIVATE_KEY"
        echo "  4. Firewall blockiert Port 22?"
        echo ""
    fi
else
    echo "⚠️  SSH-Test übersprungen"
fi

echo ""
echo "=========================================="
echo "📄 ZUSAMMENFASSUNG"
echo "=========================================="
echo ""
echo "SSH-Schlüssel:"
echo "  Private: $SSH_PRIVATE_KEY"
echo "  Public:  $SSH_PUBLIC_KEY"
echo ""
echo "GitHub Secret:"
echo "  Name: SSH_PRIVATE_KEY"
echo "  Repo: $GITHUB_REPO"
echo "  URL:  https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo ""
echo "Plesk Server:"
echo "  Host: $PLESK_HOST"
echo "  Key Location: ~/.ssh/authorized_keys"
echo ""
echo "Verwendung:"
echo "  ssh -i $SSH_PRIVATE_KEY $PLESK_HOST"
echo ""
echo "=========================================="

# GPG Onboarding – 10-Min Quickstart

## 1️⃣ Key anlegen (Windows Git Bash / WSL)

```bash
# Ersetze NAME und MAIL mit deinen Daten:
gpg --quick-generate-key "VORNAME NACHNAME <MAIL@menschlichkeit-oesterreich.at>" ed25519 sign 2y

# Fingerprint ermitteln:
FP=$(gpg --list-keys --with-colons "MAIL@menschlichkeit-oesterreich.at" | awk -F: '/^fpr:/ {print $10; exit}')

# Subkeys hinzufügen:
gpg --quick-add-key "$FP" cv25519 encrypt 2y  # Verschlüsselung
gpg --quick-add-key "$FP" ed25519 sign 2y     # Signatur (zusätzlich)

# Prüfen:
gpg --list-secret-keys --keyid-format=long --with-subkey-fingerprint "MAIL@menschlichkeit-oesterreich.at"
```

## 2️⃣ Git-Konfiguration

```bash
git config --global gpg.program gpg
git config --global user.email "MAIL@menschlichkeit-oesterreich.at"
git config --global user.name  "VORNAME NACHNAME"
git config --global user.signingkey "$FP"
git config --global commit.gpgsign true
git config --global tag.gpgsign true
git config --global gpg.format openpgp
```

## 3️⃣ Public Key zu GitHub

```bash
# Windows (Git Bash):
gpg --export -a "MAIL@menschlichkeit-oesterreich.at" | clip

# WSL/Linux:
gpg --export -a "MAIL@menschlichkeit-oesterreich.at" | xclip -selection clipboard

# macOS:
gpg --export -a "MAIL@menschlichkeit-oesterreich.at" | pbcopy
```

Dann:
1. GitHub → Settings → SSH and GPG keys → New GPG key
2. Paste (Strg+V)
3. Add GPG key

## 4️⃣ Test

```bash
# Leeren Commit signieren:
git commit -S --allow-empty -m "chore: GPG test"

# Signatur prüfen:
git log --show-signature -1

# Erwartete Ausgabe:
# gpg: Good signature from "VORNAME NACHNAME <MAIL@...>"
```

## 5️⃣ Backup erstellen

```bash
# Bash:
./scripts/gpg/export-keys.sh "MAIL@menschlichkeit-oesterreich.at"

# PowerShell:
.\scripts\gpg\export-keys.ps1 -Email "MAIL@menschlichkeit-oesterreich.at"
```

Backup-Verzeichnis: `~/GPG-Backups/YYYY-MM/`

**⚠️ WICHTIG:**
- `secret-full.asc` **OFFLINE** (USB-Stick, verschlüsseltes Volume) aufbewahren!
- `revoke.asc` sicher verwahren (bei Kompromittierung nötig)
- Nie private Keys ins Repo commiten!

## 6️⃣ VS Code Integration

Stelle sicher, dass `.vscode/settings.json` enthält:
```json
{
  "git.enableCommitSigning": true
}
```

## 🆘 Troubleshooting

### „error: cannot spawn gpg.exe"
```bash
git config --global gpg.program gpg
```

### Kein Passphrase-Prompt
```bash
# gpg-agent neu starten:
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

### „is not a fingerprint" bei --quick-add-key
Verwende statt der E-Mail-Adresse den **Fingerprint** (`$FP`):
```bash
gpg --quick-add-key <FINGERPRINT> cv25519 encrypt 2y
```

## 📚 Weitere Infos

- Standards: `docs/security/GPG-KEYS.md`
- Masterprompt: `.github/instructions/GPG-MASTERPROMPT.md`
- Release-Workflow: `.github/workflows/release-sign.yml`

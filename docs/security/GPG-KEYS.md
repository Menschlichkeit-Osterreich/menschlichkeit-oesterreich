# GPG / OpenPGP – Standards & Betrieb

## Schlüsselarchitektur (empfohlen)

- **Primärschlüssel:** ed25519 [SC] (Sign + Cert) → **offline** aufbewahren
- **Subkeys:**
  - ed25519 [S] – Signatur (Commits/Tags, E-Mails)
  - cv25519 [E] – Verschlüsselung (Dateien/Kommunikation)
  - optional ed25519 [A] – Auth/SSH

## Lokales Setup (Windows Git Bash / WSL)

```bash
# Key erzeugen (Schnellweg):
gpg --quick-generate-key "Peter Schuller <peter.schuller@menschlichkeit-oesterreich.at>" ed25519 sign 2y
FP=$(gpg --list-keys --with-colons "peter.schuller@menschlichkeit-oesterreich.at" | awk -F: '/^fpr:/ {print $10; exit}')
gpg --quick-add-key "$FP" cv25519 encrypt 2y     # Encrypt Subkey
gpg --quick-add-key "$FP" ed25519 sign 2y        # Sign Subkey

# Prüfen:
gpg --list-secret-keys --keyid-format=long --with-subkey-fingerprint "peter.schuller@menschlichkeit-oesterreich.at"
```

## Exporte & Backups (niemals ins Repo commiten)

```bash
mkdir -p "$HOME/GPG-Backups/$(date +%Y-%m)"

# Public für GitHub:
gpg --export -a "peter.schuller@menschlichkeit-oesterreich.at" > "$HOME/GPG-Backups/$(date +%Y-%m)/public.asc"

# Nur Subkeys (für Alltagsgeräte):
gpg --export-secret-subkeys -a "peter.schuller@menschlichkeit-oesterreich.at" > "$HOME/GPG-Backups/$(date +%Y-%m)/secret-subkeys.asc"

# Full Backup (Primär + Subkeys) – NUR OFFLINE:
gpg --export-secret-keys -a "peter.schuller@menschlichkeit-oesterreich.at" > "$HOME/GPG-Backups/$(date +%Y-%m)/secret-full.asc"

# Revocation:
gpg --output "$HOME/GPG-Backups/$(date +%Y-%m)/revoke.asc" --gen-revoke "$FP"

# Ownertrust:
gpg --export-ownertrust > "$HOME/GPG-Backups/$(date +%Y-%m)/ownertrust.txt"
```

## VS Code / Git

**VS Code:** `"git.enableCommitSigning": true`

**Git:**
```bash
git config --global gpg.program gpg
git config --global user.name  "Peter Schuller"
git config --global user.email "peter.schuller@menschlichkeit-oesterreich.at"
git config --global user.signingkey "$FP"
git config --global commit.gpgsign true
git config --global tag.gpgsign true
git config --global gpg.format openpgp
```

## Sicherheit

- **Keine** Passphrase in `.env`/Repo. Lokal nutzt `gpg-agent` (Cache).
- CI: Private Key + Passphrase ausschließlich in **GitHub Secrets**.

## Troubleshooting (kurz)

- `error: cannot spawn ... gpg.exe`: `git config --global gpg.program gpg`
- Kein Prompt: `gpgconf --kill gpg-agent && gpgconf --launch gpg-agent`
- „is not a fingerprint" bei `--quick-add-key`: statt E-Mail die **Key-ID/Fingerprint** verwenden.

## Referenzen

- Scripts: `scripts/gpg/export-keys.sh`, `scripts/gpg/verify-signature.sh`
- Onboarding: `docs/security/GPG-ONBOARDING.md`
- Release-Workflow: `.github/workflows/release-sign.yml`

# GPG Commit Signing - Setup-Anleitung

**Version:** 1.0.0  
**Datum:** 2025-10-03  
**Status:** 🔴 KRITISCH (Finding F-01)  
**Ziel:** Alle Commits GPG-signiert, Branch-Protection enforced

---

## Warum GPG-Signing?

**Sicherheit:** Verhindert Commit-Spoofing (Angreifer kann nicht im Namen anderer committen)  
**Compliance:** Git-Governance-Policy, Supply-Chain-Security (SLSA Level 2+)  
**Audit:** Nachweisbare Authentizität aller Code-Änderungen

---

## 1. GPG-Key generieren

### 1.1 Installation

```bash
# Debian/Ubuntu (bereits in Dev-Container)
sudo apt-get update && sudo apt-get install -y gnupg

# Verify
gpg --version  # Sollte ≥ 2.2.x sein
```

### 1.2 Key erstellen

```bash
# Interaktiven Wizard starten
gpg --full-generate-key

# Auswahl:
# (1) RSA and RSA (default)
# Keysize: 4096
# Valid for: 0 (does not expire) ODER 2y (2 Jahre)
# Real name: Ihr Name (z.B. "Paul Eschinger")
# Email: Ihre Git-Email (z.B. "paul@menschlichkeit-oesterreich.at")
# Comment: "Code Signing Key" (optional)
# Passphrase: SICHER! (mindestens 20 Zeichen, Passwort-Manager)
```

**Beispiel-Ausgabe:**

```
gpg: key ABCDEF1234567890 marked as ultimately trusted
public and secret key created and signed.

pub   rsa4096 2025-10-03 [SC]
      ABCDEF1234567890ABCDEF1234567890ABCDEF12
uid                      Paul Eschinger <paul@menschlichkeit-oesterreich.at>
sub   rsa4096 2025-10-03 [E]
```

**WICHTIG:** Notieren Sie die Key-ID: `ABCDEF1234567890`

---

## 2. Key zu GitHub hinzufügen

### 2.1 Public Key exportieren

```bash
# Key-ID aus Schritt 1.2 verwenden
gpg --armor --export ABCDEF1234567890

# Ausgabe kopieren (inkl. -----BEGIN PGP PUBLIC KEY BLOCK-----)
```

### 2.2 Zu GitHub hochladen

**Via Web-UI:**

1. Gehe zu https://github.com/settings/keys
2. Klicke "New GPG key"
3. Paste den Public Key
4. Klicke "Add GPG key"

**Via CLI (gh):**

```bash
# GitHub CLI installieren (falls nicht vorhanden)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Authentifizieren
gh auth login

# GPG-Key hinzufügen
gpg --armor --export ABCDEF1234567890 | gh gpg-key add -
```

### 2.3 Verifikation

```bash
# Prüfen, ob Key auf GitHub ist
gh gpg-key list
```

---

## 3. Git konfigurieren

### 3.1 Globale Git-Konfiguration

```bash
# Email muss mit GPG-Key übereinstimmen!
git config --global user.email "paul@menschlichkeit-oesterreich.at"
git config --global user.name "Paul Eschinger"

# GPG-Key-ID setzen
git config --global user.signingkey ABCDEF1234567890

# Automatisches Signieren aktivieren
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# GPG-Programm spezifizieren (falls nötig)
git config --global gpg.program gpg
```

### 3.2 GPG-Agent konfigurieren (für VS Code)

```bash
# ~/.bashrc ergänzen
cat >> ~/.bashrc << 'EOF'

# GPG-Agent für Git-Signing
export GPG_TTY=$(tty)
if [ -f "${HOME}/.gpg-agent-info" ]; then
  . "${HOME}/.gpg-agent-info"
  export GPG_AGENT_INFO
fi
EOF

# Sofort aktivieren
source ~/.bashrc
```

### 3.3 GPG-Agent testen

```bash
# Passphrase-Cache-Zeit setzen (8h = 28800s)
echo "default-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf
echo "max-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf

# Agent neu starten
gpgconf --kill gpg-agent
gpg-agent --daemon
```

---

## 4. Ersten signierten Commit erstellen

### 4.1 Test-Commit

```bash
# Test-Datei erstellen
echo "GPG-Signing aktiviert $(date)" > .gpg-signing-test.txt

# Committen (wird automatisch signiert)
git add .gpg-signing-test.txt
git commit -m "test: verify GPG commit signing"

# Signatur prüfen
git log --show-signature -1
```

**Erwartete Ausgabe:**

```
gpg: Signature made Thu 03 Oct 2025 10:30:00 PM UTC
gpg:                using RSA key ABCDEF1234567890
gpg: Good signature from "Paul Eschinger <paul@...>" [ultimate]

commit abc123def456...
Author: Paul Eschinger <paul@...>
Date:   Thu Oct 3 22:30:00 2025 +0000

    test: verify GPG commit signing
```

### 4.2 Auf GitHub prüfen

```bash
# Pushen
git push origin chore/figma-mcp-make

# Dann auf GitHub prüfen:
# https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/commits/chore/figma-mcp-make
# → "Verified" Badge sollte sichtbar sein
```

---

## 5. Branch Protection aktivieren

### 5.1 Via GitHub API

```bash
# GitHub Token aus Umgebungsvariable oder Secret Manager
export GITHUB_TOKEN="YOUR_GITHUB_PAT_TOKEN_HERE"

# Branch Protection mit required_signatures
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/OWNER/REPOSITORY/branches/BRANCH_NAME/protection" \
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false
    },
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/lint", "ci/test"]
    },
    "enforce_admins": true,
    "required_signatures": true,
    "allow_force_pushes": false,
    "allow_deletions": false,
    "required_linear_history": true,
    "required_conversation_resolution": true
  }'
```

### 5.2 Verifikation

```bash
# Branch-Protection-Status abrufen
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/branches/chore%2Ffigma-mcp-make/protection" \
  | jq '.required_signatures.enabled'

# Sollte "true" zurückgeben
```

---

## 6. Troubleshooting

### Problem: "gpg: signing failed: Inappropriate ioctl for device"

**Lösung:**

```bash
export GPG_TTY=$(tty)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
```

### Problem: "error: gpg failed to sign the data"

**Lösung:**

```bash
# GPG-Test
echo "test" | gpg --clearsign

# Falls Fehler:
gpgconf --kill gpg-agent
gpg-agent --daemon --use-standard-socket
```

### Problem: "fatal: cannot run gpg: No such file or directory"

**Lösung:**

```bash
# GPG installieren
sudo apt-get install -y gnupg

# Git-Config aktualisieren
git config --global gpg.program $(which gpg)
```

### Problem: Passphrase-Eingabe bei jedem Commit

**Lösung:**

```bash
# Cache-Zeit erhöhen (siehe 3.3)
echo "default-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

### Problem: "key not certified with a trusted signature"

**Lösung:**

```bash
# Eigenem Key vertrauen
gpg --edit-key ABCDEF1234567890
> trust
> 5 (I trust ultimately)
> quit
```

---

## 7. Für bestehende Commits (Optional)

### 7.1 Bestehende Commits nachsignieren

**WARNUNG:** Ändert Git-History! Nur für Feature-Branches, NICHT für Main/Shared-Branches!

```bash
# Letzten 10 Commits nachsignieren
git rebase --exec 'git commit --amend --no-edit -n -S' HEAD~10

# Force-Push (nur für Feature-Branches!)
git push --force-with-lease origin feature/my-branch
```

### 7.2 Alternative: Neue Signatur-Tags

```bash
# Für wichtige Commits ohne History-Rewrite
git tag -s v1.0.0-signed HEAD -m "Signed version of v1.0.0"
git push origin v1.0.0-signed
```

---

## 8. Team-Rollout

### 8.1 Team-Mitglieder onboarden

**Checklist für jeden Entwickler:**

- [ ] GPG-Key generiert (4096 RSA)
- [ ] Public Key zu GitHub hinzugefügt
- [ ] Git-Config gesetzt (`commit.gpgsign true`)
- [ ] Test-Commit erstellt und verifiziert
- [ ] GPG-Agent konfiguriert

### 8.2 CI/CD-Integration

**GitHub Actions:**

```yaml
# .github/workflows/verify-signatures.yml
name: Verify Commit Signatures

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Alle Commits

      - name: Verify Signatures
        run: |
          # Alle Commits im PR prüfen
          git log --pretty="%H %G?" origin/main..HEAD | while read commit status; do
            if [ "$status" != "G" ] && [ "$status" != "U" ]; then
              echo "❌ Commit $commit is not signed!"
              exit 1
            fi
          done
          echo "✅ All commits are signed"
```

---

## 9. Backup & Recovery

### 9.1 Key-Backup

```bash
# Private Key exportieren (SICHER AUFBEWAHREN!)
gpg --export-secret-keys --armor ABCDEF1234567890 > gpg-private-key-backup.asc

# Verschlüsselt speichern
gpg --symmetric --cipher-algo AES256 gpg-private-key-backup.asc

# Original löschen
shred -u gpg-private-key-backup.asc

# Backup an sicherem Ort (Passwort-Manager, Encrypted USB)
```

### 9.2 Key-Recovery

```bash
# Entschlüsseln
gpg --decrypt gpg-private-key-backup.asc.gpg > gpg-private-key-backup.asc

# Importieren
gpg --import gpg-private-key-backup.asc

# Vertrauen setzen
gpg --edit-key ABCDEF1234567890
> trust
> 5
> quit

# Cleanup
shred -u gpg-private-key-backup.asc
```

### 9.3 Revocation Certificate

```bash
# Widerrufszertifikat erstellen (falls Key kompromittiert)
gpg --gen-revoke ABCDEF1234567890 > revoke-ABCDEF1234567890.asc

# Sicher aufbewahren!
gpg --symmetric --cipher-algo AES256 revoke-ABCDEF1234567890.asc
shred -u revoke-ABCDEF1234567890.asc
```

**Im Ernstfall (Key kompromittiert):**

```bash
# Entschlüsseln
gpg --decrypt revoke-ABCDEF1234567890.asc.gpg > revoke.asc

# Importieren (widerruft Key)
gpg --import revoke.asc

# Zu GitHub hochladen (Public Key wird als revoked markiert)
gpg --armor --export ABCDEF1234567890 | gh gpg-key add -
```

---

## 10. Compliance-Status

**Nach Setup:**

- [x] GPG-Key generiert und zu GitHub hinzugefügt
- [x] Git-Config für automatisches Signing
- [x] Branch-Protection mit `required_signatures: true`
- [x] Test-Commit signiert und verifiziert
- [x] Team-Rollout-Plan vorhanden

**Gesamt-Status:** ✅ F-01 BEHOBEN (GPG-Commit-Signing aktiviert)

---

## Referenzen

- **GitHub Docs:** https://docs.github.com/en/authentication/managing-commit-signature-verification
- **Git-SCM:** https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work
- **GPG-Handbuch:** https://gnupg.org/documentation/manuals/gnupg/

---

**Review-Zyklus:** Jährlich (Key-Rotation)  
**Nächste Key-Rotation:** 2026-10-03  
**Verantwortlich:** DevOps + Security Team

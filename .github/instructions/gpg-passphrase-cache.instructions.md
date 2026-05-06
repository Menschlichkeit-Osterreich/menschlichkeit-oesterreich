---
description: Repo-weite 12h Cache-Policy für GPG-Passphrasen zur Developer Experience Optimierung
applyTo: '**'
---

# 🔐 GPG Passphrase Cache (12 Stunden)

**Rolle (an Copilot):**
Du bist Security-Engineer. Setze repo-weit eine **12h Cache-Policy für GPG-Passphrasen** durch.
Erzeuge die unten spezifizierten Dateien und halte dich strikt an die Vorgaben.

---

## 1. Ziel

* Entwickler sollen ihre GPG-Passphrase **nur einmal pro Arbeitstag** eingeben.
* Der **gpg-agent** merkt sie sich für **12 Stunden (43 200 Sekunden)**.
* Keine Speicherung im Repo (`.env`, Klartext-Dateien).
* CI/CD nutzt Secrets, niemals `.env`.

---

## 2. Developer Setup (Linux/macOS)

### 2.1 Datei `~/.gnupg/gpg-agent.conf`

Erstellen oder aktualisieren mit folgendem Inhalt:

```conf
# GPG-Agent Konfiguration – Passphrase Cache auf 12h

# Sekunden: 12h = 43 200
default-cache-ttl 43200
max-cache-ttl 43200

# Nur wenn Loopback für Skripte/CI gebraucht wird:
allow-loopback-pinentry
```

### 2.2 Agent neu starten

```bash
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

### 2.3 Test

```bash
git commit -S --allow-empty -m "chore: signed test"
# Passphrase wird 1× abgefragt → dann 12h im Cache
```

---

## 3. Developer Setup (Windows)

### 3.1 Automatisches Setup-Skript

```powershell
# Ausführen:
.\scripts\Setup-GPGCache.ps1
```

Das Skript:
- Erstellt `~/.gnupg/gpg-agent.conf` mit 12h Cache
- Startet gpg-agent neu
- Testet die Konfiguration

### 3.2 Manuelle Konfiguration

```powershell
# 1. Config-Verzeichnis erstellen
$gnupgDir = "$env:USERPROFILE\.gnupg"
if (!(Test-Path $gnupgDir)) { New-Item -ItemType Directory -Path $gnupgDir }

# 2. gpg-agent.conf erstellen
$configContent = @"
# GPG-Agent Konfiguration – Passphrase Cache auf 12h
default-cache-ttl 43200
max-cache-ttl 43200
allow-loopback-pinentry
"@
Set-Content -Path "$gnupgDir\gpg-agent.conf" -Value $configContent

# 3. Agent neu starten (Git GPG verwenden)
& "C:\Program Files\Git\usr\bin\gpgconf.exe" --kill gpg-agent
& "C:\Program Files\Git\usr\bin\gpgconf.exe" --launch gpg-agent

# 4. Test
git commit -S --allow-empty -m "chore: test GPG signing with 12h cache"
```

---

## 4. CI/CD Nutzung (GitHub Actions)

* Passphrase kommt ausschließlich aus **Secrets**.
* Typische Secrets:
  * `GPG_PRIVATE_KEY`
  * `GPG_KEY_ID`
  * `GPG_PASSPHRASE`

### Workflow-Snippet

```yaml
- name: Import GPG key
  run: |
    mkdir -p ~/.gnupg
    echo "pinentry-mode loopback" >> ~/.gnupg/gpg.conf
    echo "$GPG_PRIVATE_KEY" | gpg --batch --import
  env:
    GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}

- name: Sign artifact
  run: |
    echo "${{ secrets.GPG_PASSPHRASE }}" | \
    gpg --batch --yes --pinentry-mode loopback \
        --passphrase-fd 0 -u "${{ secrets.GPG_KEY_ID }}" \
        --armor --detach-sign artifact.tar.gz
```

> **Empfehlung:** Für CI einen eigenen Subkey ohne Passphrase nutzen.

---

## 5. Tabelle für schnelle Umrechnung

| Stunden | Sekunden | Empfehlung |
| ------- | -------- | ---------- |
| 1h      | 3600     | Zu kurz für Entwicklung |
| 2h      | 7200     | Minimum für Pair-Programming |
| 6h      | 21600    | Halber Arbeitstag |
| **12h** | **43200** | ✅ **Empfohlen (Standard)** |
| 24h     | 86400    | Nur für lokale Dev-Maschinen |

---

## 6. Sicherheitsrichtlinien

### ✅ DO (Erlaubt)
- 12h Cache auf persönlichen Entwicklungs-Maschinen
- Passphrase im gpg-agent zwischenspeichern
- GitHub Secrets für CI/CD verwenden
- Separate Keys für Development/Production

### ❌ DON'T (Verboten)
- Passphrase in `.env` speichern
- Passphrase in Klartext-Dateien committen
- `--passphrase` Parameter in Skripten ohne Secrets
- Produktions-Keys ohne Passphrase

---

## 7. Troubleshooting

### Problem: "gpg: signing failed: No secret key"

**Lösung:**
```bash
# Key ID prüfen
gpg --list-secret-keys --keyid-format=long

# Git-Config prüfen
git config --global user.signingkey

# Falls falsch:
git config --global user.signingkey 78CCAE5641193DA3
```

### Problem: Passphrase wird sofort wieder abgefragt

**Lösung:**
```bash
# 1. gpg-agent.conf prüfen
cat ~/.gnupg/gpg-agent.conf

# 2. Agent neu starten
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent

# 3. Test
echo "test" | gpg --clearsign
```

### Problem: Windows – "gpgconf: command not found"

**Lösung:**
```powershell
# Git GPG verwenden
$env:PATH += ";C:\Program Files\Git\usr\bin"

# Oder: Vollständigen Pfad angeben
& "C:\Program Files\Git\usr\bin\gpgconf.exe" --kill gpg-agent
```

---

## 8. Definition of Done

- [ ] `~/.gnupg/gpg-agent.conf` existiert mit `default-cache-ttl = 43200`
- [ ] `gpgconf --kill gpg-agent && gpgconf --launch gpg-agent` ausgeführt
- [ ] Commit nach Passphrase-Eingabe wird für 12h signiert, ohne erneute Abfrage
- [ ] CI-Workflows nutzen GitHub Secrets, keine `.env`
- [ ] Setup-Skript (`Setup-GPGCache.ps1`) vorhanden und dokumentiert

---

## 9. Referenzen

**Interne Dokumentation:**
- `.github/instructions/dsgvo-compliance.instructions.md` (Datenschutz)
- `.github/instructions/core/security-best-practices.instructions.md`
- `scripts/Setup-GPGCache.ps1` (Windows Setup)
- `SECRETS-QUICK-START.md` (GPG-Key-Erstellung)

**Externe Quellen:**
- [GnuPG Agent Options](https://www.gnupg.org/documentation/manuals/gnupg/Agent-Options.html)
- [GitHub GPG Signing](https://docs.github.com/en/authentication/managing-commit-signature-verification)

---

**Verantwortlich:** Security Analyst, DevOps Engineer
**Kontakt:** peter@menschlichkeit-oesterreich.at
**Letzte Aktualisierung:** 2025-10-18
**Version:** 1.0.0

# 🔐 GPG Masterprompt – Menschlichkeit Österreich (Repo-weit)

**Rolle (an Copilot):**
Du agierst als DevOps/Security-Engineer. Erzeuge/aktualisiere die unten gelisteten Dateien **genau** mit den angegebenen Pfaden und Inhalten. Halte dich strikt an Sicherheitsrichtlinien (keine Klartext-Passphrasen im Repo). Alle Shell-Snippets Windows-kompatibel (Git Bash) und WSL/Linux-kompatibel angeben, wo sinnvoll.

## 0) Ziele & Nicht-Ziele

**Ziele:**
1. Git-Commit/Tag-Signaturen repo-weit **standardisieren** (OpenPGP/GPG).
2. **Dokumentation + Skripte**: Key-Export, Subkey-Backup, Revocation, Prüfungen.
3. **VS Code Integration** (Settings, Tasks) + **GitHub Actions** für Release-Signaturen.
4. Sichere **Secrets-Nutzung** in CI (keine Passphrase im Repo; nur GitHub Secrets).

**Nicht-Ziele:**
- Kein Ablegen von privaten Keys/Passphrasen im Repo.
- Kein Erzwingen auf Server-Seite (GitHub erzwingt Sign-Policy nicht hart in allen Szenarien).

---

## 1) Repo-Dateien erzeugen/aktualisieren

### 1.1 `docs/security/GPG-KEYS.md`
### 1.2 `scripts/gpg/export-keys.sh` + `.ps1`
### 1.3 `scripts/gpg/verify-signature.sh` + `.ps1`
### 1.4 `.vscode/settings.json`
### 1.5 `.vscode/tasks.json`
### 1.6 `.githooks/commit-msg`

## 2) GitHub Actions – Release-Signaturen

### 2.1 `.github/workflows/release-sign.yml`

## 3) User-Onboarding

### 3.1 `docs/security/GPG-ONBOARDING.md`

## 4) Qualitätssicherung (Checkliste)

- [ ] Public Key in GitHub hinterlegt
- [ ] `git log --show-signature -1` zeigt „Good signature"
- [ ] Backups vorhanden (`scripts/gpg/export-keys.sh`)
- [ ] Keine Klartext-Passphrasen im Repo
- [ ] CI-Secrets gesetzt
- [ ] Release-Workflow signiert Artefakte

## 5) Copilot – Arbeitsanweisung

- Lege/aktualisiere **alle** oben spezifizierten Dateien exakt an.
- Verwende konsistente Pfade, saubere JSON/YAML/Shebangs.
- Führe **keine** privaten Schlüssel oder Passphrasen in Beispielen ein.
- Wenn bereits Dateien existieren, **mergen**, nichts blind überschreiben.

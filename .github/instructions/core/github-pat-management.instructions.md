---
title: GitHub PAT (Personal Access Token) Management – Sichere Verwendung im Workspace
description: Regeln für sicheren Umgang mit GitHub PATs in Entwicklung & CI/CD
applyTo: '**'
priority: critical
category: security
status: ACTIVE
version: 1.0.0
created: 2025-10-18
lastUpdated: 2025-10-18
---

# GitHub PAT Management – Sichere Verwendung im Workspace

Dieser Leitfaden definiert **verbindliche Regeln** für den Umgang mit GitHub Personal Access Tokens (PATs) im Projekt. Ziel: Sicherheit > Convenience.

**Rechtlicher Rahmen:**
- DSGVO Art. 32 (Technische und organisatorische Maßnahmen)
- BSI IT-Grundschutz (Authentifizierung, Zugriffsschutz)
- GitHub Terms of Service (Token-Schutz)

**Geltungsbereich:**
- Lokale Entwicklungsumgebungen (VS Code, CLI)
- CI/CD (GitHub Actions, DevContainers)
- MCP-Server (Filesystem, GitHub)
- Deployment-Scripts (Plesk, SSH, rsync)

---

## 1. Token-Typen & Anwendungsgebiete

### 1.1 Personal Access Tokens (Classic)

**Verwendung:** Legacy-Integration, Breitzugriff

**Scopes (minimal):**
```text
✓ repo (Full control of private repos)
✓ read:org (Read org and team membership)
✓ workflow (Update GitHub Action workflows)
✓ write:packages (Upload packages to GitHub Package Registry)
```

**⚠️ NICHT empfohlen:** Zu breit, keine Granularität, keine Ablaufzeit-Erzwingung.

---

### 1.2 Fine-Grained Personal Access Tokens (EMPFOHLEN)

**Verwendung:** Neue Projekte, Least-Privilege-Prinzip

**Minimalkonfiguration (für dieses Projekt):**

```yaml
Resource owner: peschull (persönlich) oder "Menschlichkeit Österreich" (Organisation)
Repository access: Only select repositories
  - Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development

Permissions:
  Repository permissions:
    - Contents: Read and write (für Git-Push)
    - Issues: Read and write (für Issue-Management)
    - Pull requests: Read and write (für PR-Automatisierung)
    - Workflows: Read and write (für CI/CD-Trigger)
    - Metadata: Read-only (automatisch)

  Account permissions:
    - (keine) – außer für Orga-weite Operationen
```

**Ablaufzeit:** Max. 90 Tage (automatische Rotation via GitHub)

**Erstellung:**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. "Generate new token"
3. Name: `MOE-Dev-2025-10-18` (Projekt-Dev-Datum)
4. Expiration: 90 days
5. Scopes: Wie oben
6. "Generate token"
7. **Sofort kopieren** (wird nur 1× angezeigt!)

---

## 2. Speicherorte (Sicherheits-Hierarchie)

### 2.1 ❌ VERBOTEN (Niemals!)

```text
NIEMALS:
- .env (unverschlüsselt, wird gecached)
- Hardcoded in Skripten (.sh, .ps1, .py)
- Git-Commit (auch in privaten Repos!)
- Clipboard-Manager mit Cloud-Sync
- Unverschlüsselte Notiz-Apps (OneNote, Evernote)
- Messenger (Slack, Teams, E-Mail)
```

**Enforcement:**
- Gitleaks blockt Commits mit PATs
- Pre-commit-Hooks scannen auf `ghp_` und `github_pat_*`

---

### 2.2 ✅ EMPFOHLEN (Sichere Alternativen)

#### 2.2.1 dotenv-vault (Produktiv)

```bash
# Einmalig: Login + Push
npx dotenv-vault login
echo "GH_TOKEN=ghp_XYZ..." > .env
npx dotenv-vault push

# Täglich: Pull (holt verschlüsselte Version)
npx dotenv-vault pull
```

**Vorteile:**
- End-to-End-Verschlüsselung
- Versionskontrolle (Audit-Trail)
- Team-Sharing (nur für berechtigte Personen)
- `.env.vault` ist Git-safe (öffentlich commitbar)

**Nachteil:**
- Externe Abhängigkeit (dotenv.org)
- Kostet $7/Monat für Teams (aktuell: 1 User = Free Tier OK)

---

#### 2.2.2 GitHub CLI Credential Store (Lokal)

```bash
# Installation (falls noch nicht vorhanden)
winget install GitHub.cli

# Login (speichert Token im OS Credential Store)
gh auth login
# → Wähle: "GitHub.com" → "HTTPS" → "Paste an authentication token"
# → Token einfügen (ghp_...)

# Verifizierung
gh auth status
# → Sollte zeigen: "Logged in to github.com as <username>"

# Token verwenden (automatisch aus Credential Store)
gh repo clone Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development
gh issue list
gh pr create
```

**Vorteile:**
- OS-sicherer Speicher (Windows Credential Manager)
- Keine `.env`-Datei nötig
- Automatische Rotation via `gh auth refresh`

**Nachteil:**
- Nur für `gh`-CLI (nicht für Git-Push via HTTPS)

---

#### 2.2.3 Git Credential Manager (für Git HTTPS)

**Windows:**

```powershell
# Installation (meistens schon mit Git installiert)
git credential-manager version

# Konfiguration (einmalig)
git config --global credential.helper manager-core

# Bei nächstem Git-Push: Popup-Fenster öffnet sich
git push origin main
# → "GitHub Personal Access Token" auswählen
# → Token einfügen
# → "Remember me" aktivieren

# Token wird in Windows Credential Manager gespeichert:
# → Systemsteuerung → Credential Manager → Windows Credentials → "git:https://github.com"
```

**Vorteile:**
- Nahtlose Integration mit Git
- Token-Rotation via GitHub
- OS-sichere Speicherung

**Nachteil:**
- Nur für Git-Operationen (nicht für API-Calls, Scripts)

---

#### 2.2.4 Environment Variables (Session-spezifisch)

**PowerShell (nur für aktuelle Session):**

```powershell
# Einmalig pro Session setzen
$env:GH_TOKEN = "ghp_..."

# Verifizierung
echo $env:GH_TOKEN

# WICHTIG: Token wird NICHT persistent gespeichert
# Nach Terminal-Neustart: Erneut setzen erforderlich
```

**Bash (Linux/macOS/WSL):**

```bash
export GH_TOKEN="ghp_..."
echo $GH_TOKEN
```

**Vorteile:**
- Kein Festplatten-Speicher
- Session-isoliert (andere Terminals sehen Token nicht)
- Prozess-Ende → Token weg

**Nachteil:**
- Mühsam bei jedem Terminal-Neustart

---

#### 2.2.5 VS Code Settings (verschlüsselt)

**NUR für dotenv-vault-Tokens (nicht für echte PATs!):**

```json
// .vscode/settings.json
{
  "terminal.integrated.env.windows": {
    "DOTENV_VAULT": "dotenv://:key_abc123@dotenv.local/vault/.env.vault"
  }
}
```

**Achtung:** `.vscode/settings.json` ist Git-getrackt → NIEMALS echte PATs hier!

---

## 3. Verwendung in Scripts & Workflows

### 3.1 PowerShell (deployment-scripts/)

**❌ FALSCH:**

```powershell
# NIEMALS:
$ghToken = "ghp_ABC123..."
```

**✅ RICHTIG:**

```powershell
# Variante A: dotenv-vault
npx --yes dotenv-vault@1.24.0 pull --yes
. .\.env # Source .env

# Variante B: Umgebungsvariable (manuell gesetzt)
if (-not $env:GH_TOKEN) {
    throw "ERROR: GH_TOKEN nicht gesetzt. Bitte via `$env:GH_TOKEN = '...'` setzen oder dotenv-vault nutzen."
}

# Verwendung
$headers = @{ Authorization = "Bearer $env:GH_TOKEN" }
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

---

### 3.2 Bash (build-pipeline.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

# dotenv-vault laden
npx --yes dotenv-vault@1.24.0 pull --yes
source .env

# Validierung
if [[ -z "${GH_TOKEN:-}" ]]; then
    echo "ERROR: GH_TOKEN nicht gesetzt. Bitte via export GH_TOKEN='...' setzen oder dotenv-vault nutzen."
    exit 1
fi

# Verwendung
curl -H "Authorization: Bearer $GH_TOKEN" \
     https://api.github.com/user
```

---

### 3.3 Python (scripts/ai-architecture-analyzer.py)

```python
import os
from dotenv import load_dotenv

# dotenv-vault laden
load_dotenv()

# Token holen
gh_token = os.getenv("GH_TOKEN")
if not gh_token:
    raise ValueError(
        "GH_TOKEN nicht gesetzt. Bitte via export GH_TOKEN='...' setzen "
        "oder dotenv-vault nutzen."
    )

# Verwendung
import requests
headers = {"Authorization": f"Bearer {gh_token}"}
response = requests.get("https://api.github.com/user", headers=headers)
print(response.json())
```

---

### 3.4 GitHub Actions (CI/CD)

**❌ FALSCH:**

```yaml
# .github/workflows/deploy.yml
env:
  GH_TOKEN: ghp_ABC123...  # NIEMALS hardcoded!
```

**✅ RICHTIG:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Variante A: GitHub Actions Default Token (empfohlen für GitHub-Ops)
      - name: Create Pull Request
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create --title "Auto-PR" --body "Automated"

      # Variante B: Custom PAT (nur bei erweiterten Permissions)
      - name: Trigger External Workflow
        env:
          GH_TOKEN: ${{ secrets.GH_PAT_FINE_GRAINED }}
        run: |
          curl -H "Authorization: Bearer $GH_TOKEN" \
               -X POST https://api.github.com/repos/peschull/other-repo/dispatches
```

**Secrets anlegen:**

1. GitHub Repo → Settings → Secrets and variables → Actions
2. "New repository secret"
3. Name: `GH_PAT_FINE_GRAINED`
4. Value: `ghp_...` (Token einfügen)
5. "Add secret"

---

## 4. Token-Rotation & Ablauf

### 4.1 Ablaufzeit-Strategie

**Regel:** Alle PATs **müssen** ein Ablaufdatum haben.

| Umgebung | Max. Lebensdauer | Rotation |
|----------|------------------|----------|
| **Lokal (Dev)** | 90 Tage | Manuell (Kalender-Reminder) |
| **CI/CD** | 90 Tage | Automatisch (GitHub Secrets Rotation) |
| **Production** | 30 Tage | Automatisch (via GitHub Apps empfohlen) |

---

### 4.2 Automatische Rotation (GitHub Actions)

**Workflow:** `.github/workflows/rotate-pat.yml`

```yaml
name: Rotate GitHub PAT

on:
  schedule:
    - cron: '0 3 1 * *'  # 1. des Monats, 03:00 UTC
  workflow_dispatch:     # Manueller Trigger

jobs:
  rotate-pat:
    runs-on: ubuntu-latest
    steps:
      - name: Check Token Expiration
        id: check
        env:
          GH_TOKEN: ${{ secrets.GH_PAT_FINE_GRAINED }}
        run: |
          EXPIRY=$(gh api user -q .expires_at 2>/dev/null || echo "null")
          echo "Token expires: $EXPIRY"

          # Warnung bei < 14 Tage
          if [[ "$EXPIRY" != "null" ]]; then
            DAYS_LEFT=$(( ( $(date -d "$EXPIRY" +%s) - $(date +%s) ) / 86400 ))
            if [[ $DAYS_LEFT -lt 14 ]]; then
              echo "::warning::Token läuft in $DAYS_LEFT Tagen ab!"
            fi
          fi

      - name: Notify via Issue
        if: steps.check.outputs.days_left < 7
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "🚨 GitHub PAT läuft in 7 Tagen ab" \
            --body "Bitte neuen Token generieren und in Secrets aktualisieren." \
            --label "security,P1-High"
```

---

### 4.3 Manuelle Rotation (Checkliste)

**Alle 90 Tage (Kalender-Termin setzen!):**

- [ ] Neuen Token generieren (siehe 1.2)
- [ ] Token in dotenv-vault updaten: `npx dotenv-vault push`
- [ ] GitHub Secrets aktualisieren (Repo Settings → Secrets)
- [ ] Lokale Entwickler informieren (Slack/E-Mail)
- [ ] Alten Token widerrufen (GitHub Settings → PATs → Revoke)
- [ ] Testen: CI/CD-Pipeline manuell triggern
- [ ] Dokumentation aktualisieren (Token-ID in SECURITY.md)

---

## 5. Incident Response (Token kompromittiert)

**Szenario:** Token wurde versehentlich committed, geleakt oder gestohlen.

**Sofortmaßnahmen (< 10 Minuten):**

1. **Token widerrufen:**
   ```bash
   # Web: GitHub → Settings → Developer settings → PATs → Token auswählen → Revoke
   # CLI:
   gh auth token | gh api --method DELETE "/applications/$(gh api user/installations -q '.[0].app_id')/token"
   ```

2. **Gitleaks-Scan ausführen:**
   ```powershell
   gitleaks detect --report-path quality-reports/incident-token-leak.json
   ```

3. **Git-History säubern (falls committed):**
   ```bash
   # BFG Repo-Cleaner (empfohlen)
   bfg --replace-text secrets.txt  # secrets.txt: ghp_ABC123=***REMOVED***
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive

   # Force-Push (ACHTUNG: Team informieren!)
   git push origin --force --all
   ```

4. **Neuen Token generieren** (siehe 1.2)

5. **Incident dokumentieren:**
   ```markdown
   # quality-reports/incident-2025-10-18-token-leak.md

   ## Incident: GitHub PAT Leak
   **Datum:** 2025-10-18 14:23 UTC
   **Schwere:** P1-High (keine unbefugten Zugriffe festgestellt)
   **Ursache:** Versehentlich in .env committed
   **Betroffene Tokens:** ghp_ABC123... (widerrufen)

   ### Timeline:
   - 14:23: Token in Commit abc1234 entdeckt
   - 14:25: Token widerrufen
   - 14:30: Git-History gesäubert (BFG)
   - 14:35: Neuer Token generiert + Secrets aktualisiert
   - 14:40: CI/CD-Pipeline getestet (erfolgreich)

   ### Lessons Learned:
   - Pre-commit-Hook für Gitleaks aktivieren
   - dotenv-vault-Workflow im Onboarding betonen
   ```

6. **Post-Mortem (innerhalb 48h):**
   - Ursachenanalyse (Root Cause Analysis)
   - Prozess-Anpassungen (z.B. Pre-commit-Hooks mandatory)
   - Team-Schulung (Security Awareness)

---

## 6. Best Practices (Checkliste)

### 6.1 Token-Generierung

- [ ] Fine-Grained PAT statt Classic (Least Privilege)
- [ ] Minimal-Scopes (nur notwendige Permissions)
- [ ] Ablaufdatum ≤ 90 Tage
- [ ] Beschreibender Name (Projekt + Zweck + Datum)
- [ ] Sofort in dotenv-vault speichern (nicht lokal speichern)

### 6.2 Token-Verwendung

- [ ] Niemals hardcoded in Scripts/Configs
- [ ] Immer aus Umgebungsvariablen laden
- [ ] Validierung vor Verwendung (Fehler bei fehlendem Token)
- [ ] HTTPS statt HTTP (keine Klartext-Übertragung)
- [ ] Token in Logs maskieren (via PII-Sanitizer)

### 6.3 Token-Speicherung

- [ ] dotenv-vault (Team-Sharing)
- [ ] GitHub CLI Credential Store (lokal)
- [ ] Git Credential Manager (Git HTTPS)
- [ ] **NIEMALS:** .env, Git, Clipboard-Manager, Messenger

### 6.4 Token-Rotation

- [ ] Kalender-Reminder (alle 90 Tage)
- [ ] Automatische Ablauf-Checks (GitHub Actions)
- [ ] Dokumentation (SECURITY.md: Token-IDs + Ablaufdatum)
- [ ] Team-Kommunikation (vor Rotation)

### 6.5 Monitoring & Auditing

- [ ] GitHub Audit Log (Settings → Security → Audit log)
- [ ] Ungewöhnliche API-Calls prüfen (Rate-Limit-Anstieg)
- [ ] Token-Permissions regelmäßig reviewen (Quartalsweise)

---

## 7. VS Code Tasks (Automatisierung)

Siehe `.vscode/tasks.json`:

```json
{
  "label": "🔐 Security: Pull GitHub PAT (dotenv-vault)",
  "type": "shell",
  "command": "npx",
  "args": ["--yes", "dotenv-vault@1.24.0", "pull", "--yes"],
  "group": "build",
  "presentation": { "reveal": "always", "panel": "shared" }
}
```

**Verwendung (VS Code):**
1. Cmd/Ctrl + Shift + P → "Tasks: Run Task"
2. "🔐 Security: Pull GitHub PAT (dotenv-vault)"
3. Token wird in `.env` geladen

---

## 8. Troubleshooting

### Problem: "Bad credentials" bei GitHub API

**Symptom:**
```text
curl: (22) The requested URL returned error: 401 Unauthorized
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

**Lösung:**
```powershell
# 1. Token-Format prüfen (muss mit "ghp_" oder "github_pat_" beginnen)
echo $env:GH_TOKEN

# 2. Token-Gültigkeit testen
gh auth status

# 3. Token neu laden (dotenv-vault)
npx --yes dotenv-vault@1.24.0 pull --yes
. .\.env

# 4. Falls weiterhin fehlerhaft: Neuen Token generieren (siehe 1.2)
```

---

### Problem: "Token expired"

**Symptom:**
```text
{
  "message": "This token has expired on 2025-10-18T14:23:00Z",
  "documentation_url": "https://docs.github.com/rest"
}
```

**Lösung:**
1. Neuen Token generieren (siehe 1.2)
2. dotenv-vault updaten: `npx dotenv-vault push`
3. GitHub Secrets aktualisieren (Repo Settings)
4. Alten Token widerrufen

---

### Problem: "Resource not accessible by integration"

**Symptom:**
```text
{
  "message": "Resource not accessible by integration",
  "documentation_url": "https://docs.github.com/rest/reference/repos"
}
```

**Lösung:**
- Token hat nicht die erforderlichen Permissions
- Neuen Token mit korrekten Scopes generieren (siehe 1.2)
- Für GitHub Actions: `GITHUB_TOKEN` statt `GH_TOKEN` verwenden (automatische Permissions)

---

## 9. Referenzen

### 9.1 Externe Dokumentation

- [GitHub: Creating a fine-grained PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI: gh auth](https://cli.github.com/manual/gh_auth)
- [dotenv-vault: Getting Started](https://www.dotenv.org/docs/quickstart)
- [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)

### 9.2 Interne Referenzen

- `.github/instructions/dsgvo-compliance.instructions.md` (PII-Sanitization)
- `.github/instructions/core/security-best-practices.instructions.md`
- `SECURITY.md` (Security Policy, Token-Inventory)
- `scripts/Setup-GPGCache.ps1` (GPG-Token-Caching analog)

---

## 10. Definition of Done (Checklist)

Beim Einrichten eines neuen Entwicklers/CI-Systems:

- [ ] Fine-Grained PAT generiert (90 Tage Ablauf)
- [ ] Token in dotenv-vault gespeichert
- [ ] `.env` lokal vorhanden (via `npx dotenv-vault pull`)
- [ ] GitHub CLI konfiguriert (`gh auth status` zeigt Login)
- [ ] Git Credential Manager konfiguriert (`git push` funktioniert ohne Passwort)
- [ ] VS Code Task "Pull GitHub PAT" getestet
- [ ] Gitleaks Pre-commit-Hook aktiv (`pre-commit install`)
- [ ] Kalender-Reminder für Token-Rotation gesetzt (90 Tage)
- [ ] SECURITY.md aktualisiert (Token-ID + Ablaufdatum)

---

**Verantwortlich:** Security Analyst (Peter Schuller)
**Kontakt:** peter@menschlichkeit-oesterreich.at
**Nächste Review:** 2026-01-18
**Version:** 1.0.0

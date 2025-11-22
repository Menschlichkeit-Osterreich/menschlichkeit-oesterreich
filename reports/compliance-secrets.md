# Compliance-Secrets-Audit – Menschlichkeit Österreich

**Generated:** 2025-10-17  
**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development  
**Branch:** chore/repo-docs-issues-reorg  
**Scope:** Gitleaks-Audit, secrets/-Struktur, Rotation-Policies, GitHub-Secrets-Status

---

## 📊 Executive Summary

### Audit-Status

| Kategorie | Status | Findings | Kritikalität |
|-----------|--------|----------|--------------|
| **Gitleaks Installation** | ❌ **FEHLT** | Tool nicht verfügbar | **P0-Critical** |
| **secrets/-Struktur** | ✅ **VORHANDEN** | 4 Subdirectories + 2 Checklisten | **OK** |
| **.gitleaksignore** | ✅ **KONFIGURIERT** | 40+ Allowlist-Regeln | **OK** |
| **gitleaks.toml** | ✅ **KONFIGURIERT** | 5 Custom Rules + 50+ Allowlist-Paths | **OK** |
| **GitHub Secrets** | 🟡 **UNBEKANNT** | Keine Validierung möglich (kein gh CLI) | **P1-High** |
| **Rotation-Policy** | ❌ **FEHLT** | Keine automatisierte Rotation | **P1-High** |

### Risiko-Bewertung

| Risiko | Beschreibung | Impact | Mitigations |
|--------|--------------|--------|-------------|
| **Keine Secrets-Scans** | Gitleaks nicht installiert → Secrets könnten committed werden | **HIGH** | ⚠️ **P0:** Gitleaks installieren + Pre-Commit-Hook |
| **Keine Secret-Rotation** | Produktionsgeheimnisse möglicherweise veraltet | **MEDIUM** | 📅 **P1:** 90-Tage-Rotation einführen (siehe todo-cleanup.md SEC-02) |
| **GitHub Secrets unvalidiert** | Unklar, ob alle 26 Secrets korrekt gesetzt sind | **MEDIUM** | 🔍 **P1:** `gh secret list` ausführen + Validation-Script |
| **secrets/ teilweise committed** | Checklisten/Templates in Git (OK), aber Prüfung empfohlen | **LOW** | ✅ .gitignore deckt production/** ab |

---

## 🔒 Gitleaks-Audit (TOOL FEHLT)

### Installation-Status

```powershell
# Aktueller Zustand (npm run security:scan Output)
> Der Befehl "gitleaks" ist entweder falsch geschrieben oder
> konnte nicht gefunden werden.
> Gitleaks nicht verf├╝gbar, schreibe leeren Report: gitleaks exited 1
```

**❌ CRITICAL:** Gitleaks ist nicht installiert → **Keine Secrets-Scans aktiv**

### Empfohlene Installation (Windows)

**Option 1: Scoop (empfohlen)**
```powershell
scoop bucket add gitleaks https://github.com/gitleaks/gitleaks.git
scoop install gitleaks
```

**Option 2: Chocolatey**
```powershell
choco install gitleaks
```

**Option 3: Manual Download**
```powershell
# Download von https://github.com/gitleaks/gitleaks/releases/latest
# Extrahieren nach C:\Program Files\gitleaks\
# PATH erweitern: $env:PATH += ";C:\Program Files\gitleaks"
```

**Validierung:**
```powershell
gitleaks version
# Erwartete Ausgabe: 8.18.x oder höher
```

### Pre-Commit-Hook Setup (nach Installation)

**1. Git Hook erstellen (.git/hooks/pre-commit):**
```bash
#!/bin/sh
# Gitleaks Pre-Commit Hook

echo "Running Gitleaks scan..."
gitleaks protect --staged --config gitleaks.toml

if [ $? -ne 0 ]; then
    echo "⚠️ SECRETS DETECTED! Commit aborted."
    echo "Review findings above, remove secrets, and try again."
    echo "False positive? Add to .gitleaksignore"
    exit 1
fi

echo "✅ No secrets detected - commit allowed"
exit 0
```

**2. Hook ausführbar machen:**
```powershell
# PowerShell (Windows Git Bash nutzt Unix-Permissions)
git config core.hooksPath .git/hooks
chmod +x .git/hooks/pre-commit  # In Git Bash ausführen
```

**3. GitHub Action ergänzen (.github/workflows/secrets-audit.yml):**
```yaml
name: Secrets Audit

on:
  push:
    branches: [main, staging, production]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history für Historie-Scan
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_CONFIG: gitleaks.toml
```

---

## 📁 secrets/-Verzeichnis-Struktur

### Übersicht (list_dir Output)

```
secrets/
├── ai/                               # AI/MCP-Server Konfigurationen
├── development/                      # Dev-Secrets (placeholders, in .gitleaksignore)
├── production/                       # Production-Secrets (NOT IN GIT, siehe .gitignore)
├── project-docs/                     # Projekt-Dokumentation
├── ZUGANGSDATEN-CHECKLISTE.md        # ✅ Checkliste für Secrets-Setup
└── ZUGANGSDATEN-WOHER-BEKOMMEN.txt   # ✅ Anleitung zur Secrets-Beschaffung
```

### Detaillierte Analyse

#### 1. ZUGANGSDATEN-CHECKLISTE.md (grep_search Findings)

**Zweck:** Checkliste für erforderliche Secrets (26 Stück)

**Kategorien:**
- **Database Credentials (2):**
  - ❌ Laravel Database Password
  - ❌ CiviCRM Database Password
- **API Security (1):**
  - ❌ JWT Secret (32+ chars)
- **Automation (1):**
  - ❌ n8n Admin Password
- **Code Quality/Security Tools (3):**
  - ❌ Codacy API Token
  - ❌ Snyk Token
  - 🟡 SonarQube Token (OPTIONAL)
- **Payment Integration (1):**
  - 🟡 Stripe Secret Key (sk_live_xxx)

**Status-Legende:**
- ❌ = Fehlt, muss generiert/beschafft werden
- 🟡 = Optional/Low-Priority
- ✅ = Vorhanden (nicht im Grep sichtbar, da keine Matches)

**Action Items:**
- [ ] JWT Secret generieren: `openssl rand -base64 32`
- [ ] Codacy Account erstellen → API Token holen
- [ ] Snyk Account erstellen → API Token holen
- [ ] Alle 26 Secrets zu GitHub Secrets migrieren

#### 2. ZUGANGSDATEN-WOHER-BEKOMMEN.txt (grep_search Findings)

**Zweck:** Schritt-für-Schritt-Anleitung zur Secrets-Beschaffung

**Key Findings:**
- **Codacy API Token:**
  - Setup: https://app.codacy.com → Account → API Tokens → Create Token
- **Snyk Token:**
  - Setup: https://app.snyk.io → Account Settings → API Token → Generate Token
- **GitHub Secrets Link:**
  - https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions

**Zeitaufwand (laut Dokument):**
- Codacy Account + Token: 10 Min
- Snyk Account + Token: 10 Min
- Alle Secrets in GitHub eintragen: 15 Min
- **Gesamt:** ~35 Min

**Empfohlener Workflow:**
1. JWT Secret generieren: `openssl rand -base64 32`
2. Codacy/Snyk Accounts erstellen + Tokens holen
3. `.\scripts\extract-secrets-for-github.ps1` ausführen (falls vorhanden)
4. Alle Secrets in GitHub Secrets eintragen

#### 3. secrets/development/ (Allowlisted in .gitleaksignore)

**Status:** ✅ **SAFE** – In `.gitleaksignore` allowlisted
```
# Development templates (contain placeholders, not real secrets)
secrets/development/**
```

**Zweck:** Dev-Secrets mit Placeholders (z.B. `REPLACE_WITH_YOUR_KEY`)

**Validierung:** Diese Dateien dürfen committed werden (nur Templates)

#### 4. secrets/production/ (NICHT IN GIT)

**Status:** ✅ **PROTECTED** – Via `.gitignore` ausgeschlossen

**Erwartete Struktur (sollte lokal existieren, aber nicht in Git):**
```
secrets/production/
├── api-keys.yaml           # API-Keys für Services (Codacy, Snyk, Stripe)
├── database.yaml           # DB-Credentials (Laravel, CiviCRM)
├── jwt.yaml                # JWT Secret
├── n8n.yaml                # n8n Admin-Credentials
└── *.example.yaml          # Templates (dürfen in Git, siehe gitleaks.toml)
```

**Validierung:**
```powershell
# Check ob production-Secrets in Git sind (sollte LEER sein)
git ls-files secrets/production/*.yaml

# Erwartete Ausgabe: NICHTS (außer *.example.yaml)
```

#### 5. secrets/ai/ & secrets/project-docs/

**Status:** ℹ️ **INFO** – Keine Secrets-Findings im grep_search

**Vermutung:** Projekt-Dokumentation (z.B. MCP-Konfigurationen, AI-Prompts)

**Empfehlung:** Manuelle Prüfung auf unbeabsichtigte Secrets

---

## 🔐 Gitleaks-Konfiguration (gitleaks.toml)

### Custom Rules (5 Regeln)

| Rule ID | Beschreibung | Regex | Allowlist |
|---------|--------------|-------|-----------|
| **generic-api-key** | API-Keys/Tokens detektieren | `api[_-]?key\|token\|secret` + 16+ chars | ✅ 30+ Pfade (vendor, tests, docs) |
| **private-key** | Private-Keys (PEM-Format) | `-----BEGIN.*PRIVATE KEY-----` | ✅ venv, tests, docs |
| **aws-access-token** | AWS Access Keys | `AKIA[0-9A-Z]{16}` | ✅ docs (nur `AKIAIOSFODNN7EXAMPLE`) |
| **hashicorp-tf-password** | Terraform Passwords | `Password\s*=\s*"[^"]*"` | ✅ PowerShell-Scripts (`SECURE_LARAVEL_2025`) |

### Global Allowlist (50+ Paths)

**Vendor-Code (automatisch allowlisted):**
- `api.*/venv/**`, `api.*/.venv/**` (Python Virtual Envs)
- `crm.*/web/core/**`, `crm.*/web/modules/contrib/**` (Drupal Core)
- `**/node_modules/**`, `**/bower_components/**` (Node Dependencies)

**Test-Code (automatisch allowlisted):**
- `**/tests/**`, `**/test_*.py`, `**/*Test.php`
- `tests/test_pii_sanitizer.py` (enthält absichtlich Dummy-Credentials für Tests)

**Dokumentation (allowlisted):**
- `**/*.md` (Markdown-Dateien mit Beispiel-Secrets)
- `.github/copilot-instructions.md`, `quality-reports/**/*.md`
- `.github/prompts/**/*.md` (AI-Prompts mit API-Beispielen)

**Templates/Examples (allowlisted):**
- `secrets/development/**` (Dev-Templates)
- `secrets/production/*.example.yaml` (Production-Templates)
- `.env.example`, `.env.sample` (Environment-Templates)

### Allowlist-Regexes (False-Positive-Filterung)

```regex
REPLACE_WITH_.*     # Template-Placeholders
YOUR_.*_HERE        # Generic Placeholders
EXAMPLE_.*          # Example-Values
sk_test_.*          # Stripe Test-Keys (nicht Production)
REDACTED            # Redacted Examples in Docs
Bearer YOUR_.*      # Bearer-Token-Examples
ghp_1234567890.*    # Fake GitHub PATs
test_key_.*         # Test-Keys
```

---

## 🚨 .gitleaksignore (False-Positives)

### Aktuelle Allowlist (40+ Zeilen)

**Python Virtual Environments:**
```
api.menschlichkeit-oesterreich.at/venv/**
api.menschlichkeit-oesterreich.at/.venv/**
```

**CRM Vendor-Code:**
```
crm.menschlichkeit-oesterreich.at/web/core/**
crm.menschlichkeit-oesterreich.at/web/modules/contrib/**
crm.menschlichkeit-oesterreich.at/vendor/**
```

**Development Templates:**
```
secrets/development/**
config-templates/**
```

**Test-Fixtures:**
```
**/tests/**
**/test_*.py
**/*Test.php
```

**Build Artifacts:**
```
**/node_modules/**
**/bower_components/**
**/.cache/**
**/__pycache__/**
**/*.pyc
```

**Bewertung:** ✅ **COMPREHENSIVE** – Deckt alle relevanten Vendor/Test/Docs-Pfade ab

---

## 📋 GitHub Secrets – Erwartete Konfiguration

### 26 Erforderliche Secrets (laut ZUGANGSDATEN-CHECKLISTE.md)

| Kategorie | Secret Name | Beschreibung | Status |
|-----------|-------------|--------------|--------|
| **Database** | `LARAVEL_DB_PASSWORD` | Laravel Database Password | 🟡 Unvalidiert |
| **Database** | `CIVICRM_DB_PASSWORD` | CiviCRM Database Password | 🟡 Unvalidiert |
| **API Security** | `JWT_SECRET` | JWT Secret (32+ chars) | 🟡 Unvalidiert |
| **Automation** | `N8N_ADMIN_PASSWORD` | n8n Admin Password | 🟡 Unvalidiert |
| **Code Quality** | `CODACY_API_TOKEN` | Codacy API Token | 🟡 Unvalidiert |
| **Security Scanning** | `SNYK_TOKEN` | Snyk Token | 🟡 Unvalidiert |
| **Optional** | `SONARQUBE_TOKEN` | SonarQube Token (optional) | 🟡 Unvalidiert |
| **Payments** | `STRIPE_SECRET_KEY` | Stripe Secret Key (sk_live_xxx) | 🟡 Unvalidiert |
| **Deployment** | `STAGING_REMOTE_*` | 18 Plesk-Deploy-Secrets (SSH, SFTP) | 🟡 Unvalidiert |

**Status-Legende:**
- 🟡 **Unvalidiert** = Keine Validierung möglich (gh CLI nicht verfügbar)
- ✅ **Vorhanden** = Via `gh secret list` validiert
- ❌ **Fehlt** = Nicht in GitHub Secrets

### Validierungs-Script (gh CLI erforderlich)

**1. gh CLI installieren (falls fehlt):**
```powershell
scoop install gh
# ODER
choco install gh
```

**2. Authentifizieren:**
```powershell
gh auth login
```

**3. Secrets auflisten:**
```powershell
gh secret list --repo Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development

# Erwartete Ausgabe (26 Secrets):
# CODACY_API_TOKEN     Updated 2025-XX-XX
# CIVICRM_DB_PASSWORD  Updated 2025-XX-XX
# JWT_SECRET           Updated 2025-XX-XX
# ...
```

**4. Validation-Script erstellen (scripts/validate-github-secrets.ps1):**
```powershell
# GitHub Secrets Validation Script
# Prüft ob alle 26 erforderlichen Secrets vorhanden sind

$REQUIRED_SECRETS = @(
    "LARAVEL_DB_PASSWORD",
    "CIVICRM_DB_PASSWORD",
    "JWT_SECRET",
    "N8N_ADMIN_PASSWORD",
    "CODACY_API_TOKEN",
    "SNYK_TOKEN",
    "STRIPE_SECRET_KEY",
    # ... 18 weitere STAGING_REMOTE_* Secrets
)

$EXISTING_SECRETS = gh secret list --repo Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development --json name | ConvertFrom-Json | Select-Object -ExpandProperty name

$MISSING = $REQUIRED_SECRETS | Where-Object { $_ -notin $EXISTING_SECRETS }

if ($MISSING.Count -eq 0) {
    Write-Host "✅ Alle 26 Secrets vorhanden!" -ForegroundColor Green
} else {
    Write-Host "❌ Fehlende Secrets ($($MISSING.Count)):" -ForegroundColor Red
    $MISSING | ForEach-Object { Write-Host "  - $_" }
}
```

---

## 🔄 Secret-Rotation-Policy (FEHLT – P1-High TODO)

### Aktueller Zustand

❌ **KEINE AUTOMATISIERTE ROTATION** – Secrets möglicherweise veraltet

### Empfohlene Rotation-Policy

**Kritikalitäts-Matrix:**

| Secret-Typ | Rotation-Intervall | Automation | Begründung |
|------------|-------------------|------------|------------|
| **Database Passwords** | **90 Tage** | ⚠️ Manuell | DSGVO Art. 32 (TOMs) – Regelmäßige Erneuerung |
| **JWT Secret** | **90 Tage** | ⚠️ Manuell | Security-Best-Practice (OWASP) |
| **API-Tokens (Codacy/Snyk)** | **180 Tage** | ✅ Via API (falls verfügbar) | Service-Provider-Policy |
| **Stripe Keys** | **365 Tage** | ⚠️ Manuell | Payment-Provider-Requirement |
| **n8n Admin Password** | **90 Tage** | ⚠️ Manuell | Privileged-Account-Policy |
| **GitHub PATs** | **90 Tage** | ✅ Via API | GitHub-Best-Practice |
| **SSH Keys (Plesk)** | **180 Tage** | ⚠️ Manuell | Infrastructure-Security |

### Rotation-Script (scripts/rotate-secrets.sh)

**Siehe todo-cleanup-COMPLETE.md SEC-02 (P1-High, 1d Aufwand)**

**Beispiel-Implementierung:**
```bash
#!/bin/bash
# Secret Rotation Script – Automated Rotation for API-Tokens

set -e

echo "🔄 Starting Secret Rotation..."

# 1. Codacy API Token Rotation (via API)
if [ -n "$CODACY_API_TOKEN" ]; then
    echo "Rotating Codacy API Token..."
    NEW_CODACY_TOKEN=$(curl -X POST https://app.codacy.com/api/v3/tokens \
        -H "api-token: $CODACY_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Auto-Rotated-Token"}' | jq -r '.token')
    
    gh secret set CODACY_API_TOKEN --body "$NEW_CODACY_TOKEN"
    echo "✅ Codacy Token rotated"
fi

# 2. JWT Secret Rotation (generieren + deployen)
echo "Rotating JWT Secret..."
NEW_JWT=$(openssl rand -base64 32)
gh secret set JWT_SECRET --body "$NEW_JWT"
echo "✅ JWT Secret rotated"

# 3. Audit-Log erstellen
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) - Secrets rotated: CODACY_API_TOKEN, JWT_SECRET" >> secrets/rotation-audit.log

echo "✅ Secret Rotation complete!"
```

**Cron-Job Setup (quartalsweise Rotation):**
```bash
# Crontab-Eintrag (alle 90 Tage am 1. des Monats, 02:00 UTC)
0 2 1 */3 * /path/to/scripts/rotate-secrets.sh >> /var/log/secret-rotation.log 2>&1
```

---

## ✅ Empfohlene Sofortmaßnahmen (Prioritized Action Plan)

### P0-Critical (BLOCKING – diese Woche erledigen)

| # | Action | Aufwand | Verantwortlich | Deliverable |
|---|--------|---------|----------------|-------------|
| **1** | **Gitleaks installieren** | 0.5h | DevOps | `gitleaks version` erfolgreich |
| **2** | **Pre-Commit-Hook einrichten** | 0.5h | DevOps | `.git/hooks/pre-commit` funktional |
| **3** | **GitHub Action ergänzen** | 0.5h | DevOps | `.github/workflows/secrets-audit.yml` |

**Gesamt P0:** **1.5h** (gleicher Tag)

---

### P1-High (Sprint 1-2 – nächste 2 Wochen)

| # | Action | Aufwand | Verantwortlich | Deliverable |
|---|--------|---------|----------------|-------------|
| **4** | **gh CLI installieren** | 0.5h | DevOps | `gh --version` erfolgreich |
| **5** | **GitHub Secrets validieren** | 1h | Security-Analyst | `scripts/validate-github-secrets.ps1` Output |
| **6** | **Fehlende Secrets beschaffen** | 2h | Vorstand + DevOps | Codacy/Snyk-Accounts + Tokens |
| **7** | **Secret-Rotation-Policy implementieren** | 1d | DevOps | `scripts/rotate-secrets.sh` + Cron |
| **8** | **secrets/production/ validieren** | 1h | Security-Analyst | Keine Production-Secrets in Git |

**Gesamt P1:** **1.5d** (2 Arbeitswochen)

---

### P2-Medium (Sprint 3-4 – nächste 4 Wochen)

| # | Action | Aufwand | Verantwortlich | Deliverable |
|---|--------|---------|----------------|-------------|
| **9** | **BFG Repo-Cleaner Historie-Scan** | 2h | Security-Analyst | Historie-Clean (falls Secrets in Git-History) |
| **10** | **Vault Integration** | 5d | DevOps | HashiCorp Vault für API-Keys/DB-Credentials (siehe todo-cleanup-COMPLETE.md SEC-01) |

---

## 📊 Compliance-Matrix (DSGVO/ISO 27001)

### DSGVO-Bezug

| Artikel | Anforderung | Status | Maßnahme |
|---------|-------------|--------|----------|
| **Art. 32 Abs. 1** | Sicherheit der Verarbeitung (TOMs) | 🟡 **TEILWEISE** | ⚠️ P0: Gitleaks + Pre-Commit-Hook |
| **Art. 32 Abs. 1 lit. d** | Verfahren zur regelmäßigen Überprüfung (Audits) | 🟡 **TEILWEISE** | 📅 P1: Secret-Rotation-Policy |
| **Art. 33 Abs. 1** | Meldung von Datenpannen (binnen 72h) | ✅ **ERFÜLLT** | Incident-Response-Plan existiert (siehe docs/compliance/) |

### ISO 27001-Bezug

| Control | Anforderung | Status | Maßnahme |
|---------|-------------|--------|----------|
| **A.9.4.3** | Password management system | 🟡 **TEILWEISE** | 📅 P2: Vault Integration (SEC-01) |
| **A.10.1.1** | Policy on the use of cryptographic controls | ✅ **ERFÜLLT** | Encryption-Policy in TOMs (NC-02) |
| **A.10.1.2** | Key management | 🟡 **TEILWEISE** | 📅 P1: Secret-Rotation-Policy (SEC-02) |

---

## 📈 Metrics & KPIs

### Success Criteria

- ✅ **Gitleaks installiert** → `gitleaks version` erfolgreich
- ✅ **Pre-Commit-Hook aktiv** → Testcommit mit Dummy-Secret blockiert
- ✅ **GitHub Secrets validiert** → Alle 26 Secrets vorhanden (via `gh secret list`)
- ✅ **Secret-Rotation-Policy aktiv** → Cron-Job läuft quartalsweise
- ✅ **Keine Production-Secrets in Git** → `git ls-files secrets/production/*.yaml` leer

### Audit-Frequenz

- **Gitleaks-Scans:** Bei jedem Commit (Pre-Commit-Hook) + bei jedem PR (GitHub Action)
- **GitHub Secrets Validation:** Monatlich (via `scripts/validate-github-secrets.ps1`)
- **Secret-Rotation:** Quartalsweise (Cron-Job)
- **Full Compliance-Audit:** Jährlich (DSB-Review)

---

## 🔗 Referenzen & Quellen

### Interne Dokumentation

- **todo-cleanup-COMPLETE.md** – P0-3: git-secrets (15 Min Setup)
- **todo-cleanup-COMPLETE.md** – P1-High: SEC-02 (Secret-Rotation-Policy, 1d)
- **todo-cleanup-COMPLETE.md** – P2-Medium: SEC-01 (Vault Integration, 5d)
- **secrets/ZUGANGSDATEN-CHECKLISTE.md** – 26 erforderliche Secrets
- **secrets/ZUGANGSDATEN-WOHER-BEKOMMEN.txt** – Setup-Anleitung

### Externe Tools

- **Gitleaks:** https://github.com/gitleaks/gitleaks
- **Gitleaks Action:** https://github.com/gitleaks/gitleaks-action
- **GitHub CLI:** https://cli.github.com/
- **HashiCorp Vault:** https://www.vaultproject.io/

### Compliance-Frameworks

- **DSGVO:** https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **ISO 27001:** https://www.iso.org/standard/27001
- **OWASP Key Management Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html

---

**Status:** Compliance-Secrets-Audit abgeschlossen  
**Nächster Schritt:** P0-Sofortmaßnahmen (Gitleaks installieren + Pre-Commit-Hook)  
**Verantwortlich:** Security-Analyst + DevOps  
**Kontakt:** security@menschlichkeit-oesterreich.at  
**Review-Datum:** 2026-01-17 (Quartalsweise Review)

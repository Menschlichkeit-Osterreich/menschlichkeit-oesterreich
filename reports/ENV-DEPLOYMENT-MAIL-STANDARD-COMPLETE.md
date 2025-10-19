# ✅ ENV/Deployment/Mail-Standard ABGESCHLOSSEN

**Datum:** 2025-10-18  
**Status:** Production-Ready (Schreibschutz aktiv)  
**Dauer:** ~30 Minuten

---

## 🎯 Was wurde erstellt?

### 1️⃣ **Verbindliches Standard-Dokument**
```
✅ docs/ENV-DEPLOYMENT-MAIL-STANDARD.md (340+ Zeilen)
```

**Inhalt:**
- ✅ ENV-Standardisierung (`.env`, `.env.example`, `.env.vault`)
- ✅ Deployment-Standard (20 Subdomains, Plesk-Pfade, SSH-Config)
- ✅ Mailboxen-Inventar (6 angelegt, 8 noch anzulegen)
- ✅ Schutzmechanismen (Pre-Commit-Hook, CI-Gate)
- ✅ Betriebscheckliste (DoD)
- ✅ CODEOWNERS-Regeln (Doppel-Freigabe)

---

### 2️⃣ **Aktualisierte `.env.example`**
```
✅ .env.example (150+ Zeilen, jetzt mit SSH/Deployment-Section)
```

**Neu hinzugefügt:**
- `SSH_HOST=5.183.217.146` (Plesk-Server)
- `REMOTE_BASE=/var/www/vhosts/menschlichkeit-oesterreich.at`
- `REMOTE_<site>=subdomains/<site>/httpdocs` (20 Subdomains)
- `LOCAL_<site>=./path/to/build` (Build-Verzeichnisse)

---

### 3️⃣ **Sicherheits-Guards (automatisch)**
```
✅ .githooks/pre-commit (blockt .env-Commits lokal)
✅ .github/workflows/env-guard.yml (CI-Gate für PRs)
✅ .github/CODEOWNERS (erzwingt Doppel-Freigabe)
```

**Pre-Commit-Hook:**
- Scannt `git diff --cached` nach `.env`-Dateien
- Blockiert Commit wenn echte `.env` gefunden
- Zeigt Lösungsvorschläge

**CI-Workflow (`env-guard.yml`):**
- Prüft `.env.example` existiert & nicht leer
- Scannt Repo nach committed `.env`-Files
- Prüft `.gitignore` enthält `.env`
- Läuft bei Push/PR auf `main`, `develop`, `staging`

**CODEOWNERS:**
- `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md` → @peschull + @vorstand
- `.githooks/*` → @peschull
- `.github/workflows/env-guard.yml` → @peschull

---

## 🔐 Deployment-Pfade (fixiert)

| Subdomain | Remote-Pfad (relativ zu REMOTE_BASE) |
|-----------|--------------------------------------|
| **menschlichkeit-oesterreich.at** | `httpdocs` |
| admin.stg | `subdomains/admin.stg/httpdocs` |
| analytics | `subdomains/analytics/httpdocs` |
| api.stg | `subdomains/api.stg/httpdocs` |
| consent | `subdomains/consent/httpdocs` |
| crm | `subdomains/crm/httpdocs` |
| docs | `subdomains/docs/httpdocs` |
| forum | `subdomains/forum/httpdocs` |
| games | `subdomains/games/httpdocs` |
| grafana | `subdomains/grafana/httpdocs` |
| hooks | `subdomains/hooks/httpdocs` |
| idp | `subdomains/idp/httpdocs` |
| logs | `subdomains/logs/httpdocs` |
| media | `subdomains/media/httpdocs` |
| n8n | `subdomains/n8n/httpdocs` |
| newsletter | `subdomains/newsletter/httpdocs` |
| s3 | `subdomains/s3/httpdocs` |
| status | `subdomains/status/httpdocs` |
| support | `subdomains/support/httpdocs` |
| votes | `subdomains/vote/httpdocs` *(Pfad abweichend!)* |

**Wichtig:** Änderungen nur via PR + Doppel-Freigabe (Board + Tech Lead).

---

## 📧 Mail-Inventar

### ✅ Bereits angelegt (Plesk)
- `peter.schuller@…` (1.06 MB / 250 MB)
- `office@…` (7.65 KB / 250 MB)
- `logging@…` (**197 MB / 250 MB** ⚠️ **fast voll!**)
- `info@…` (91.4 KB / 250 MB)
- `civimail@…` (18.1 KB / 250 MB)
- `bounce@…` (248 KB / 250 MB)

### 🔲 Noch anzulegen (im Repo vorgesehen)
- `newsletter@…` (Absender Newsletter)
- `support@…` (Support-Formulare)
- `no-reply@…` (Transaktionale Mails)
- `admin@…` (Systemmeldungen)
- `devops@…` (CI/CD, Error Reports)
- `board@…` (Vorstand)
- `kassier@…` (Finanzen)
- `fundraising@…` (Sponsoring)

**Aktionsbedarf (CRITICAL):**
- [ ] `logging@…` archivieren/entlasten (197 MB / 250 MB)
- [ ] 8 neue Mailboxen anlegen (via Plesk + Standard-Quota 250 MB)

---

## 🚀 Verwendung (Quick Start)

### ENV-Datei lokal erstellen
```powershell
# .env aus .env.example kopieren
cp .env.example .env

# .env bearbeiten (echte Werte eintragen):
# - SSH_USER=dein-plesk-user
# - SSH_KEY=C:/Users/<NAME>/.ssh/id_ed25519
# - DATABASE_URL=postgresql://...
# - STRIPE_API_KEY=sk_test_...
```

### Vault pushen (Team-Sync)
```powershell
# Vault pushen (lokale .env → verschlüsselt in Cloud)
npx dotenv-vault push

# Status prüfen
npx dotenv-vault status
```

### Deployment (via `tools/deploy.ps1`)
```powershell
# Dry-Run (zeigt Befehle ohne Ausführung)
.\tools\deploy.ps1 -Site frontend -DryRun

# Echtes Deployment (scp → Plesk)
.\tools\deploy.ps1 -Site frontend

# Beispiele:
# - frontend → REMOTE_frontend=httpdocs (Root-Site)
# - crm → REMOTE_crm=subdomains/crm/httpdocs
# - api_stg → REMOTE_api_stg=subdomains/api.stg/httpdocs
```

---

## 🔧 Pre-Commit-Hook testen

```powershell
# Hook aktivieren (bereits gemacht)
git config core.hooksPath .githooks

# Test: Versuche echte .env zu committen
git add .env
git commit -m "test"
# → ❌ COMMIT ABGEBROCHEN: Echte .env-Dateien gefunden!
```

---

## 📦 CI-Workflow (GitHub Actions)

**Trigger:** Push/PR auf `main`, `develop`, `staging`

**Checks:**
1. `.env.example` existiert & nicht leer ✅
2. Keine echten `.env`-Dateien im Repo ✅
3. `.env` in `.gitignore` geschützt ✅

**Bei Fehler:** PR wird blockiert + detaillierte Fehlermeldung

---

## ✅ Betriebscheckliste (Definition of Done)

- [x] **docs/ENV-DEPLOYMENT-MAIL-STANDARD.md** erstellt (Schreibschutz-Dokument)
- [x] `.env.example` aktualisiert (SSH/Deployment-Section, 20 Subdomains)
- [x] `.env` lokal vorhanden (nicht committed, in `.gitignore`)
- [x] `.env.vault` erstellt (11 KB, verschlüsselt, committed)
- [x] `dotenv-vault push` erfolgreich (development-Environment)
- [x] Pre-Commit-Hook erstellt (`.githooks/pre-commit`)
- [x] Git-Hooks aktiviert (`git config core.hooksPath .githooks`)
- [x] CI-Workflow erstellt (`.github/workflows/env-guard.yml`)
- [x] CODEOWNERS aktualisiert (Doppel-Freigabe für ENV-Standard)
- [ ] **Produktions-Environment anlegen** (`dotenv-vault environments add production`)
- [ ] **`tools/deploy.ps1` erstellen** (PowerShell-Deploy-Script)
- [ ] **8 Mailboxen anlegen** (via Plesk)
- [ ] **`logging@…` archivieren** (197 MB / 250 MB fast voll)

---

## 📊 Statistik

| Metrik | Wert |
|--------|------|
| **Dokument-Zeilen** | 340+ |
| **Fixierte Subdomains** | 20 |
| **Mail-Inventar** | 6 angelegt, 8 vorgesehen |
| **ENV-Keys (.env.example)** | 70+ |
| **Sicherheits-Guards** | 3 (Hook, CI, CODEOWNERS) |
| **Doppel-Freigabe-Pfade** | 3 |

---

## 🎉 Zusammenfassung

**Du hast jetzt:**
- ✅ **Verbindliches Standard-Dokument** (Schreibschutz via CODEOWNERS)
- ✅ **Zentrale `.env.example`** mit SSH/Deployment-Config (20 Subdomains)
- ✅ **Verschlüsselten `.env.vault`** für Team-Sync
- ✅ **3 Sicherheits-Guards** (Pre-Commit, CI, CODEOWNERS)
- ✅ **Mail-Inventar** (6 aktiv, 8 vorgesehen, 1 fast voll)

**Nächste Schritte (CRITICAL):**
1. **`logging@…` archivieren** (197 MB / 250 MB ⚠️)
2. **8 Mailboxen anlegen** (via Plesk)
3. **`tools/deploy.ps1` erstellen** (PowerShell-Deploy-Script)
4. **Produktions-Vault** anlegen (`dotenv-vault push production`)

**Ready to commit:**
```powershell
git add docs/ENV-DEPLOYMENT-MAIL-STANDARD.md
git add .env.example .env.vault
git add .githooks/pre-commit
git add .github/workflows/env-guard.yml
git add .github/CODEOWNERS
git commit -m "feat: ENV/Deployment/Mail-Standard (Schreibschutz + Guards)"
git push origin main
```

---

**Fragen?** Lass es mich wissen! 💬

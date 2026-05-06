# 🔐 Secret Management & Audit

Dieses Verzeichnis enthält die Dokumentation und Workflows für das Secret-Management des Projekts.

---

## 📋 Übersicht

### Dateien
- **`SECRETS-AUDIT.md`** - Vollständige Dokumentation aller Secrets (10 Kategorien)
- **`secrets.manifest.json`** - Manifest für dotenv-vault (encrypted)

### Tools (im `/scripts` Verzeichnis)
- **`validate-secrets.py`** - Python-Validierungs-Script
- **`validate-secrets.ps1`** - PowerShell-Validierungs-Script

---

## 🚀 Quick Start

### 1. Secrets validieren (lokal)

**Python:**
```bash
# Vollständige Validierung:
python scripts/validate-secrets.py

# Strict-Mode (Exit-Code bei Warnungen):
python scripts/validate-secrets.py --strict

# Andere Umgebung:
python scripts/validate-secrets.py --env staging --file .env.staging
```

**PowerShell:**
```powershell
# Standard:
.\scripts\validate-secrets.ps1

# Strict-Mode:
.\scripts\validate-secrets.ps1 -Strict

# Staging:
.\scripts\validate-secrets.ps1 -EnvFile .env.staging -Environment staging
```

### 2. Was wird geprüft?

✅ **Pflicht-Variablen:**
- `DATABASE_URL` - PostgreSQL-Verbindung
- `JWT_SECRET` - Token-Signierung

⚠️ **Optional (aber empfohlen):**
- `GH_TOKEN` - GitHub API
- `FIGMA_API_TOKEN` - Design-System-Sync
- `SENTRY_DSN` - Error-Tracking

❌ **Platzhalter-Detection:**
- Keine `YOUR_*`, `CHANGE_*`, `XXX`, `TODO`, `PLACEHOLDER`
- Format-Validierung (z.B. `ghp_` für GitHub, `sk_test_` für Stripe)
- Security-Rules (z.B. keine Live-Keys in Development)

### 3. CI-Integration

Automatische Validierung läuft bei:
- Push zu `main`/`master`/`chore/**`/`feature/**`
- Pull Requests
- Täglich um 07:00 UTC
- Manuell via `workflow_dispatch`

**Workflow:** `.github/workflows/validate-secrets.yml`

---

## 📚 Dokumentation

### SECRETS-AUDIT.md

10 dokumentierte Kategorien:

1. **GitHub Integration** (GH_TOKEN)
2. **Figma Design System** (FIGMA_API_TOKEN, FIGMA_FILE_KEY)
3. **PostgreSQL** (DATABASE_URL)
4. **JWT & FastAPI** (JWT_SECRET)
5. **SMTP/IMAP** (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)
6. **Stripe Payment** (STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET)
7. **Monitoring** (SENTRY_DSN)
8. **GPG Signing** (GPG_PRIVATE_KEY, GPG_KEY_ID)
9. **OAuth** (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
10. **Legacy** (LARAVEL_DB_PASS)

Jede Kategorie enthält:
- **KEY** - Variable-Name
- **VALUE** - Beispiel/Platzhalter
- **SOURCE** - Herkunft (Tool, Generator, UI)
- **PURPOSE** - Technischer Zweck
- **SCOPE** - Umgebung (lokal, staging, production)
- **NOTES** - Sicherheitshinweise
- **ROTATION** - Empfohlener Wechselzyklus
- **VALIDATION** - Regex-Pattern

---

## 🔒 Security Best Practices

### ❌ Niemals committen:
- `.env` (gitignored!)
- Private Keys (GPG, SSH, TLS)
- API-Keys (außer Test-Keys mit Scope-Limits)
- Passwörter (SMTP, DB, Admin)

### ✅ Immer committen:
- `.env.example` (Platzhalter, keine echten Werte)
- `.env.vault` (verschlüsselt via dotenv-vault)
- `SECRETS-AUDIT.md` (Dokumentation)

### 🔄 Rotation-Schedule:

| Secret-Typ | Rotation |
|------------|----------|
| Datenbank-Passwörter | 90 Tage |
| API-Keys (kritisch) | 90 Tage |
| JWT-Secrets | 180 Tage |
| GPG-Keys | 2 Jahre (mit Expiry) |
| OAuth-Credentials | Jährlich |

---

## 🛠️ Troubleshooting

### Python-Script: "Command not found"
```bash
# Ausführbar machen:
chmod +x scripts/validate-secrets.py

# Mit Python-Interpreter:
python scripts/validate-secrets.py
```

### PowerShell: "Execution Policy"
```powershell
# Einmalig erlauben (als Admin):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Oder direkt ausführen:
powershell -ExecutionPolicy Bypass -File scripts/validate-secrets.ps1
```

### Validation-Fehler: "Platzhalter-Pattern gefunden"
```
✗ GH_TOKEN: Platzhalter-Pattern gefunden: YOUR_
```
**Lösung:** `.env`-Datei ist nur Template - ersetze Platzhalter durch echte Werte.

### CI-Workflow schlägt fehl
**Checks:**
1. `.env.example` hat keine echten Secrets (nur Platzhalter)
2. `secrets/SECRETS-AUDIT.md` existiert
3. Python 3.11+ installiert (in Workflow automatisch)

---

## 📞 Support

**Dokumentation:**
- Audit-Template: `secrets/SECRETS-AUDIT.md`
- ENV-Standard: `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md`
- DSGVO: `.github/instructions/dsgvo-compliance.instructions.md`

**Tools:**
- `python scripts/validate-secrets.py --help`
- `Get-Help .\scripts\validate-secrets.ps1`

**Issues:**
- GitHub: [Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)
- Label: `area/security` + `P1-High`

---

**Letzte Aktualisierung:** 18. Oktober 2025  
**Version:** 1.0.0  
**Verantwortlich:** Tech Lead (Peter Schuller)

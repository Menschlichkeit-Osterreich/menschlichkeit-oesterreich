# 🚀 Secrets Quick-Start Guide

**Stand:** 2025-10-18
**Ziel:** 8/8 Core-Secrets funktionsfähig in <2 Stunden
**Vollständiger Report:** `reports/SECRETS-GAP-ANALYSIS-FINAL.md`

---

## ⚡ Die wichtigsten 3 Schritte (SOFORT)

### 1️⃣ PostgreSQL starten (5 Minuten)

```powershell
# Docker Compose starten
docker-compose up -d postgres

# Status prüfen
docker-compose logs -f postgres
# Warten auf: "database system is ready to accept connections"

# .env aktualisieren (starkes Passwort verwenden!)
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD_HERE@localhost:5432/menschlichkeit_dev

# Migrations ausführen
npx prisma generate
npx prisma migrate dev
cd api.menschlichkeit-oesterreich.at
alembic upgrade head
```

**Alternativ (lokale Installation):**
```powershell
# PostgreSQL 15 installieren
winget install PostgreSQL.PostgreSQL.15

# Datenbank erstellen
psql -U postgres
CREATE DATABASE menschlichkeit_dev;
CREATE USER menschlichkeit_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE menschlichkeit_dev TO menschlichkeit_user;
\q

# .env aktualisieren
DATABASE_URL=postgresql://menschlichkeit_user:STRONG_PASSWORD@localhost:5432/menschlichkeit_dev
```

---

### 2️⃣ GitHub Token generieren (3 Minuten)

```powershell
# 1. Browser öffnen:
start https://github.com/settings/tokens/new

# 2. Token-Konfiguration:
#    - Note: "Menschlichkeit Österreich Development"
#    - Expiration: 90 days
#    - Scopes: ☑️ repo, ☑️ workflow, ☑️ read:packages, ☑️ write:packages

# 3. "Generate token" klicken → Token kopieren (ghp_...)

# 4. .env aktualisieren
GH_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 5. GitHub Secret setzen:
start https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions/new
# Name: GH_TOKEN
# Secret: ghp_XXX... (aus Schritt 3)
```

---

### 3️⃣ Test durchführen (1 Minute)

```powershell
# Secret-Funktionalitätstest ausführen
.\scripts\Test-SecretFunctionality.ps1

# Erwartung nach Schritt 1+2:
# [PASS] Database :: DATABASE_URL
# [PASS] GitHub :: GH_TOKEN
# [FAIL] Figma :: FIGMA_ACCESS_TOKEN (noch nicht gesetzt)
# [FAIL] SMTP :: SMTP_HOST (noch nicht gesetzt)
# [FAIL] Stripe :: STRIPE_PUBLISHABLE_KEY (noch nicht gesetzt)
# [FAIL] JWT :: JWT_SECRET (noch nicht gesetzt)
# [FAIL] GPG :: GPG_KEY_ID (noch nicht gesetzt)

# → 2/8 PASS (25%) → PostgreSQL & GitHub funktionsfähig!
```

---

## 🎯 Nächste Schritte (HEUTE)

### 4️⃣ JWT Secret (1 Minute)

```powershell
# Generieren (64 chars)
$jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "JWT_SECRET=$jwtSecret"

# In .env kopieren
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5️⃣ Figma Token (3 Minuten)

```powershell
# 1. Browser öffnen:
start https://www.figma.com/settings

# 2. Abschnitt: "Personal access tokens" → "Generate new token"
# 3. Name: "Menschlichkeit Österreich Development"
# 4. Token kopieren (figd_...)

# 5. .env aktualisieren
FIGMA_ACCESS_TOKEN=[FIGMA_ACCESS_TOKEN_PLACEHOLDER]

# 6. File ID ermitteln (aus Figma-URL):
# https://www.figma.com/file/XXXXXXXXXXXXXXXXXXXXXXX/Design-Name
#                            ^^^^^^^^^^^^^^^^^^^^^^^^^
FIGMA_FILE_ID=XXXXXXXXXXXXXXXXXXXXXXX
```

### 6️⃣ Mailhog (Development) (2 Minuten)

```powershell
# Mailhog-Container starten
docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog

# .env aktualisieren
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""

# Mailbox öffnen (alle Mails werden hier gesammelt):
start http://localhost:8025
```

### 7️⃣ Stripe Test-Keys (3 Minuten)

```powershell
# 1. Browser öffnen:
start https://dashboard.stripe.com/test/apikeys

# 2. "Publishable key" & "Secret key" kopieren

# 3. .env aktualisieren
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ⚠️ NIEMALS Live-Keys in .env committen!
```

### 8️⃣ GPG Key (5 Minuten)

```powershell
# Key erstellen
gpg --full-generate-key
# → (1) RSA and RSA
# → 4096 bits
# → 0 = key does not expire
# → Real name: Menschlichkeit Österreich
# → Email: tech@menschlichkeit-oesterreich.at
# → Passphrase: STRONG_PASSPHRASE

# Key ID ermitteln
gpg --list-secret-keys --keyid-format=long
# → sec   rsa4096/XXXXXXXXXXXXXXXX
#                 ^^^^^^^^^^^^^^^^ (16 hex chars)

# .env aktualisieren
GPG_KEY_ID=XXXXXXXXXXXXXXXX

# Public Key exportieren (für GitHub)
gpg --armor --export XXXXXXXXXXXXXXXX | Set-Clipboard
start https://github.com/settings/gpg/new
# → Paste & Add GPG key
```

### 9️⃣ Final Test (1 Minute)

```powershell
# Alle Secrets testen
.\scripts\Test-SecretFunctionality.ps1

# Erwartung:
# [PASS] Database :: DATABASE_URL
# [PASS] GitHub :: GH_TOKEN
# [PASS] Figma :: FIGMA_ACCESS_TOKEN
# [PASS] SMTP :: SMTP_HOST
# [PASS] Stripe :: STRIPE_PUBLISHABLE_KEY
# [PASS] Stripe :: STRIPE_SECRET_KEY
# [PASS] JWT :: JWT_SECRET
# [PASS] GPG :: GPG_KEY_ID

# → 8/8 PASS (100%) ✅ ERFOLG!
```

---

## ✅ Checkliste

- [ ] PostgreSQL läuft (Docker oder lokal)
- [ ] `DATABASE_URL` gesetzt & getestet
- [ ] `GH_TOKEN` generiert (GitHub Settings)
- [ ] `GH_TOKEN` in GitHub Actions Secrets gesetzt
- [ ] `JWT_SECRET` generiert (64 chars)
- [ ] `FIGMA_ACCESS_TOKEN` + `FIGMA_FILE_ID` gesetzt
- [ ] Mailhog läuft (Development SMTP)
- [ ] `STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY` gesetzt (Test-Keys)
- [ ] `GPG_KEY_ID` generiert & public key zu GitHub hochgeladen
- [ ] ✅ **8/8 Tests PASS** (`.\scripts\Test-SecretFunctionality.ps1`)

---

## 🚨 Troubleshooting

### PostgreSQL startet nicht
```powershell
# Logs prüfen
docker-compose logs postgres

# Port bereits belegt?
netstat -ano | findstr :5432

# Container neu starten
docker-compose down
docker-compose up -d postgres
```

### GitHub Token funktioniert nicht
```bash
# Test via API
curl -H "Authorization: token ghp_XXXX..." https://api.github.com/user

# Scopes prüfen (muss repo, workflow enthalten)
# → Token neu generieren mit korrekten Scopes
```

### Mailhog empfängt keine Mails
```powershell
# Test-Mail senden
python -c "import smtplib; smtplib.SMTP('localhost', 1025).sendmail('test@local', ['test@local'], 'Subject: Test\n\nBody')"

# Mailbox öffnen
start http://localhost:8025
```

---

## 📚 Weitere Ressourcen

- **Vollständiger Report:** `reports/SECRETS-GAP-ANALYSIS-FINAL.md` (46 Seiten, 57 fehlende Secrets, GitHub Actions, Compliance)
- **Schema-Validierung:** `python scripts/validate-secrets-schema.py` (YAML-basiert)
- **Enterprise Audit:** `secrets/SECRETS-AUDIT.md` (40 dokumentierte Secrets)
- **DSGVO-Compliance:** `.github/instructions/dsgvo-compliance.instructions.md`

---

## 🎯 Nächster Sprint (P3)

Nach erfolgreichen Core-Secrets (8/8 PASS):

1. **57 fehlende Secrets dokumentieren** (Mail, Drupal, Redis, ELK, Analytics, Deploy, OAuth)
2. **47 GitHub Actions Secrets setzen** (Staging, CI/CD, Monitoring)
3. **Staging Deployment** (SSH Keys, SFTP, Smoke-Tests)
4. **Secret-Rotation-Automation** (90-Tage-Reminders, GitHub Actions)
5. **Production-Vorbereitung** (Separate dotenv-vault Environments, Live-Keys)

---

**Geschätzte Zeit:** 2 Stunden (Schritte 1-9)
**Erfolg:** 8/8 PASS → Development-Environment produktionsreif!

**Support:** Peter Schuller (peter@menschlichkeit-oesterreich.at)

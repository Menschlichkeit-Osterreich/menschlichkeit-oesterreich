# 🔐 Secret-Dokumentation & Audit-Template

**Projekt:** Menschlichkeit Österreich  
**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development  
**Umgebung:** Development (lokal)  
**Stand:** 18. Oktober 2025  
**Verantwortlich:** Peter Schuller (peschull)  
**Review-Zyklus:** Quartalsweise (nächster Review: 15.01.2026)

---

## 📋 Struktur der Secret-Dokumentation

Jede Variable wird dokumentiert mit:
- **KEY**: Name der Umgebungsvariable
- **VALUE**: Beispielwert oder Platzhalter (niemals echte Secrets!)
- **SOURCE**: Herkunft (Tool, Generator, manuell)
- **PURPOSE**: Technische Funktion im Projekt
- **SCOPE**: Gültigkeitsbereich (lokal, CI, staging, production)
- **NOTES**: Sicherheitshinweise, Rotation, Besonderheiten
- **ROTATION**: Empfohlener Wechselzyklus
- **VALIDATION**: Prüfmuster oder Constraints

---

## 🔐 Secrets-Kategorien

### 1. GitHub Integration

#### GH_TOKEN
```yaml
KEY: GH_TOKEN
VALUE: ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
SOURCE: GitHub → Settings → Developer Settings → Personal Access Tokens (Classic)
PURPOSE: Zugriff auf private Repos, CI-Workflows, Package Registry
SCOPE: lokal, CI
NOTES: Token-Scopes erforderlich: repo, workflow, read:packages, write:packages
ROTATION: Alle 90 Tage oder bei Verdacht auf Kompromittierung
VALIDATION: ^ghp_[A-Za-z0-9]{36}$
SECURITY: Niemals in Logs/Commits, nur in GitHub Secrets/dotenv-vault
```

**Generierung:**
```bash
# GitHub UI:
Settings → Developer Settings → Personal Access Tokens → Generate new token (classic)
# Scopes auswählen: repo, workflow, read:packages
```

---

### 2. Figma Design System

#### FIGMA_API_TOKEN
```yaml
KEY: FIGMA_API_TOKEN
VALUE: figd_XXXXXXXXXXXXXXXXXXXX
SOURCE: Figma → Account Settings → Personal Access Token
PURPOSE: Zugriff auf Design-System-Dateien via MCP-Server
SCOPE: lokal
NOTES: Nur Lesezugriff nötig, kein Schreibzugriff erforderlich
ROTATION: Jährlich oder bei Team-Wechsel
VALIDATION: ^figd_[A-Za-z0-9_-]{24,}$
SECURITY: Nicht in Production verwenden (nur Dev/Build-Prozess)
```

#### FIGMA_FILE_KEY
```yaml
KEY: FIGMA_FILE_KEY
VALUE: mTlUSy9BQk4326cvwNa8zQ
SOURCE: URL der Figma-Datei (aus Browser-URL extrahiert)
PURPOSE: Identifikation des Design-System-Files
SCOPE: lokal, CI (für Design-Token-Sync)
NOTES: Öffentlich sichtbar in Figma-URLs, kein Secret
ROTATION: Nur bei File-Wechsel
VALIDATION: ^[A-Za-z0-9]{22}$
SECURITY: Kein Sicherheitsrisiko, kann committed werden (Dokumentation)
```

**Generierung:**
```bash
# Figma UI:
Account → Settings → Personal Access Tokens → Create new token
# Aus URL: https://www.figma.com/design/mTlUSy9BQk4326cvwNa8zQ/...
```

---

### 3. PostgreSQL Datenbank

#### DATABASE_URL
```yaml
KEY: DATABASE_URL
VALUE: postgresql://postgres:CHANGE_ME_IN_PRODUCTION@localhost:5432/menschlichkeit_db
SOURCE: Manuell konfiguriert (lokal) oder Provider (Production)
PURPOSE: Verbindung zur Haupt-Datenbank (FastAPI, n8n, Games)
SCOPE: lokal, staging, production
NOTES: Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
ROTATION: Passwort alle 90 Tage in Production, lokal nach Bedarf
VALIDATION: ^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+$
SECURITY: NIEMALS Prod-Credentials lokal nutzen, separate Datenbanken!
```

**Generierung (lokal):**
```bash
# Windows Services → postgresql-x64-15 → Start
# Oder Docker:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=localdev123 postgres:15
DATABASE_URL="postgresql://postgres:localdev123@localhost:5432/menschlichkeit_db"
```

---

### 4. JWT & FastAPI Authentifizierung

#### JWT_SECRET
```yaml
KEY: JWT_SECRET
VALUE: dev_jwt_secret_CHANGE_IN_PROD_min_32_chars_random
SOURCE: Generiert via openssl rand -hex 32
PURPOSE: Token-Signierung für FastAPI Auth
SCOPE: lokal, staging, production (jeweils unterschiedliche Werte!)
NOTES: Mindestens 32 Zeichen, kryptographisch zufällig
ROTATION: Alle 180 Tage (invalidiert alle aktiven Tokens!)
VALIDATION: ^.{32,}$
SECURITY: Bei Leak sofort rotieren + alle Sessions invalidieren
```

**Generierung:**
```bash
# Windows Git Bash oder WSL:
openssl rand -hex 32
# Output: 4f8a3c2b1e9d7f6a5c4b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a

# PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

### 5. SMTP/IMAP Mail-System

#### SMTP_HOST
```yaml
KEY: SMTP_HOST
VALUE: mail.menschlichkeit-oesterreich.at
SOURCE: Plesk Mail-Konfiguration
PURPOSE: Mail-Versand via SMTP
SCOPE: lokal, staging, production
NOTES: Plesk verwendet mail.domain.at als MX/SMTP-Host
ROTATION: Nur bei Provider-Wechsel
VALIDATION: ^[a-z0-9.-]+\.[a-z]{2,}$
SECURITY: Kein Secret, kann öffentlich dokumentiert werden
```

#### SMTP_USER
```yaml
KEY: SMTP_USER
VALUE: newsletter@menschlichkeit-oesterreich.at
SOURCE: Plesk Mail → Email Addresses
PURPOSE: Authentifizierung für Mail-Versand
SCOPE: lokal, staging, production
NOTES: Separate Adressen für newsletter@, no-reply@, bounce@
ROTATION: Nur bei Adress-Änderung
VALIDATION: ^[a-z0-9._-]+@menschlichkeit-oesterreich\.at$
SECURITY: Username ist nicht sensitiv, Passwort jedoch kritisch
```

#### SMTP_PASSWORD
```yaml
KEY: SMTP_PASSWORD
VALUE: GENERATE_IN_PLESK_DO_NOT_REUSE
SOURCE: Plesk Mail → Mailbox-Einstellungen → Passwort generieren
PURPOSE: Authentifizierung für SMTP
SCOPE: lokal, staging, production (jeweils separate Credentials!)
NOTES: Plesk kann sichere Passwörter generieren (20+ Zeichen)
ROTATION: Alle 90 Tage oder bei Verdacht
VALIDATION: ^.{16,}$
SECURITY: Bei Leak sofort Mailbox-Passwort in Plesk ändern
```

**Generierung (Plesk):**
```
Plesk → Mail → Email Addresses → newsletter@ → Change Password
→ Generate → Copy → In .env eintragen
```

---

### 6. Payment Integration (Stripe)

#### STRIPE_API_KEY (Test)
```yaml
KEY: STRIPE_API_KEY
VALUE: [STRIPE_TEST_KEY_PLACEHOLDER]
SOURCE: Stripe Dashboard → Developers → API Keys → Test Mode
PURPOSE: Zahlungsabwicklung für Mitgliedsbeiträge
SCOPE: lokal, staging
NOTES: NIEMALS Live-Keys (sk_live_*) in .env committen!
ROTATION: Bei Team-Wechsel oder jährlich
VALIDATION: ^sk_test_[A-Za-z0-9]{24,}$
SECURITY: Test-Keys haben beschränkten Zugriff, trotzdem schützen
```

#### STRIPE_WEBHOOK_SECRET
```yaml
KEY: STRIPE_WEBHOOK_SECRET
VALUE: whsec_XXXXXXXXXXXXXXXXXXXXXXXX
SOURCE: Stripe → Webhooks → Add Endpoint → Signing Secret
PURPOSE: Validierung eingehender Webhook-Events
SCOPE: lokal, staging, production (separate Endpoints!)
NOTES: Endpoint-URL muss öffentlich erreichbar sein
ROTATION: Bei Endpoint-Neuanlage oder Kompromittierung
VALIDATION: ^whsec_[A-Za-z0-9]{32,}$
SECURITY: Webhook ohne Secret-Validierung ist Sicherheitsrisiko!
```

**Generierung:**
```bash
# Stripe CLI (lokal):
stripe listen --forward-to localhost:8001/webhooks/stripe
# Kopiere Webhook-Secret aus Output
```

---

### 7. Monitoring & Error Tracking

#### SENTRY_DSN
```yaml
KEY: SENTRY_DSN
VALUE: https://abc123@o123456.ingest.sentry.io/7654321
SOURCE: Sentry Projekt-Einstellungen → Client Keys (DSN)
PURPOSE: Fehler-Tracking für FastAPI + Frontend
SCOPE: lokal (optional), staging, production
NOTES: Lokal leer lassen um Noise zu vermeiden
ROTATION: Nur bei Projekt-Neuanlage oder Security-Incident
VALIDATION: ^https:\/\/[a-f0-9]+@[^\/]+\.ingest\.sentry\.io\/\d+$
SECURITY: DSN ist öffentlich sichtbar im Frontend-Bundle
```

**Generierung:**
```
Sentry.io → Create Project → Platform: Python (FastAPI) / JavaScript (React)
→ Settings → Client Keys → DSN kopieren
```

---

### 8. GPG Signing (CI/CD)

#### GPG_PRIVATE_KEY (CI)
```yaml
KEY: GPG_PRIVATE_KEY
VALUE: <ARMORED_PRIVATE_KEY_REDACTED>
SOURCE: Generiert via gpg --full-generate-key (CI-spezifischer Key!)
PURPOSE: Signierung von Git Commits/Tags in CI/CD
SCOPE: CI (GitHub Actions)
NOTES: NIEMALS persönlichen GPG-Key für CI verwenden!
ROTATION: Alle 2 Jahre (Key-Expiry setzen)
VALIDATION: ^<ARMORED_PRIVATE_KEY_REDACTED>$
SECURITY: Nur in GitHub Secrets speichern, niemals in .env/.env.vault
```

#### GPG_KEY_ID
```yaml
KEY: GPG_KEY_ID
VALUE: 4AEE18F83AFDEB23
SOURCE: gpg --list-keys --keyid-format=long (Fingerprint kürzen)
PURPOSE: Identifikation des Signing-Keys in CI
SCOPE: CI
NOTES: Letzten 16 Zeichen des Fingerprints
ROTATION: Synchron mit GPG_PRIVATE_KEY
VALIDATION: ^[A-F0-9]{16}$
SECURITY: Key-ID ist öffentlich, kein Secret
```

**Generierung (CI-Key):**
```bash
# Git Bash/WSL:
gpg --quick-generate-key "CI Release Bot <ci@menschlichkeit-oesterreich.at>" ed25519 sign 2y
FP=$(gpg --list-keys --with-colons "ci@" | awk -F: '/^fpr:/ {print $10; exit}')
gpg --export-secret-keys -a "$FP" | clip  # Windows
# GitHub → Settings → Secrets → GPG_PRIVATE_KEY = Clipboard
echo ${FP: -16}  # Letzten 16 Zeichen = GPG_KEY_ID
```

---

### 9. OAuth & External APIs

#### GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
```yaml
KEY: GOOGLE_CLIENT_ID
VALUE: 123456789-abcdef.apps.googleusercontent.com
SOURCE: Google Cloud Console → APIs → Credentials → OAuth 2.0 Client
PURPOSE: Google Login (optional)
SCOPE: lokal, staging, production
NOTES: Redirect-URI muss in Google Console whitelisted sein
ROTATION: Bei App-Neuanlage oder Security-Incident
VALIDATION: ^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$
SECURITY: Client-ID ist öffentlich, Client-Secret kritisch schützen
```

---

### 10. Legacy-Kompatibilität

#### LARAVEL_DB_PASS
```yaml
KEY: LARAVEL_DB_PASS
VALUE: laravel_local_password
SOURCE: Manuell gesetzt (nur wenn Laravel-Komponenten aktiv)
PURPOSE: Verbindung zur separaten Laravel-Datenbank
SCOPE: lokal
NOTES: Nur aktiv wenn Legacy-Laravel-Code existiert, sonst entfernen
ROTATION: Bei Bedarf
VALIDATION: ^.{8,}$
SECURITY: Separate DB für Legacy-Code, niemals Haupt-DB-Credentials
```

---

## 🔒 Security Best Practices

### Niemals committen:
- ❌ `.env` (gitignored)
- ❌ Private Keys (GPG, SSH, TLS)
- ❌ API-Keys (außer Test-Keys mit Scope-Beschränkung)
- ❌ Passwörter (SMTP, DB, Admin-Panels)

### Immer committen:
- ✅ `.env.example` (Platzhalter, keine echten Werte)
- ✅ `.env.vault` (verschlüsselt via dotenv-vault)
- ✅ Dokumentation (dieses File)

### Trennung nach Umgebung:
```
.env                    # Lokal (gitignored)
.env.staging            # Staging (nur in dotenv-vault)
.env.production         # Production (nur in dotenv-vault)
```

### Rotation-Schedule:
| Secret-Typ | Rotation |
|------------|----------|
| Datenbank-Passwörter | 90 Tage |
| API-Keys (kritisch) | 90 Tage |
| JWT-Secrets | 180 Tage |
| GPG-Keys | 2 Jahre (mit Expiry) |
| OAuth-Credentials | Jährlich |
| SMTP-Passwörter | 90 Tage |

---

## ✅ Validierungs-Workflow

### 1. Manuelle Prüfung
```bash
# Alle Platzhalter-Werte finden:
grep -E "CHANGE|PLACEHOLDER|XXX|TODO" .env

# Fehlende Variablen (vs. .env.example):
comm -23 <(grep -o '^[^#]*=' .env.example | sort) <(grep -o '^[^#]*=' .env | sort)
```

### 2. Automatisiert (siehe Script unten)
```bash
python scripts/validate-secrets.py
# oder
.\scripts\validate-secrets.ps1
```

### 3. CI-Integration
```yaml
# .github/workflows/validate-secrets.yml
- run: python scripts/validate-secrets.py --strict
```

---

### 11. Forum (phpBB)

#### FORUM_SMTP_PASS
```yaml
KEY: FORUM_SMTP_PASS
VALUE: [SMTP_PASSWORD_PLACEHOLDER]
SOURCE: Mail-Provider (Plesk/Mailbox-Konfiguration)
PURPOSE: SMTP-Authentifizierung für Forum-Benachrichtigungen
SCOPE: production, staging
NOTES: Teilt Mailbox mit Newsletter (noreply@menschlichkeit-oesterreich.at)
ROTATION: Quartalsweise (gemeinsam mit Newsletter-Credentials)
VALIDATION: Alphanumerisch, min. 16 Zeichen
```

#### FORUM_RECAPTCHA_SECRET
```yaml
KEY: FORUM_RECAPTCHA_SECRET
VALUE: [RECAPTCHA_V3_SECRET_PLACEHOLDER]
SOURCE: Google reCAPTCHA v3 Console
PURPOSE: Bot-Schutz für Forum-Registrierung und Login
SCOPE: production
NOTES: Site Key ist öffentlich (FORUM_RECAPTCHA_SITE_KEY)
ROTATION: Jährlich oder bei Verdacht auf Kompromittierung
VALIDATION: ^6L[A-Za-z0-9_-]{38}$
```

#### OIDC_CLIENT_SECRET
```yaml
KEY: OIDC_CLIENT_SECRET
VALUE: [OIDC_CLIENT_SECRET_PLACEHOLDER]
SOURCE: Identity Provider (Keycloak/Auth0)
PURPOSE: SSO-Integration für Forum (optional)
SCOPE: production (nach SSO-Rollout)
NOTES: Nur aktivieren nach vollständigem SSO-Testing
ROTATION: Bei jeder IdP-Konfigurationsänderung
VALIDATION: UUID v4 oder Provider-spezifisch
```

---

## 📚 Weiterführende Dokumentation

- **Setup:** `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md`
- **DSGVO:** `.github/instructions/dsgvo-compliance.instructions.md`
- **GPG:** `docs/security/GPG-KEYS.md`
- **Mail:** `docs/dns/DNS-INFRASTRUCTURE.md`

---

## 📝 Change Log

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2025-10-18 | Initial-Erstellung mit 10 Kategorien | Peter Schuller |

---

**Nächster Review:** 15. Januar 2026  
**Verantwortlich:** Tech Lead (Peter Schuller)

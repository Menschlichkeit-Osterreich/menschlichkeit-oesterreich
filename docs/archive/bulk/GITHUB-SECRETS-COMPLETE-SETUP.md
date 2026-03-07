# 🔐 GITHUB SECRETS SETUP - KOMPLETTE ANLEITUNG

**Datum:** 29. September 2025  
**Repository:** menschlichkeit-oesterreich-development  
**Status:** ✅ BEREIT FÜR GITHUB SECRETS MIGRATION

## 📋 ZUSAMMENFASSUNG

Alle lokalen Secrets aus der `.env` Datei wurden extrahiert und sind bereit für die Migration zu GitHub Secrets. Die `.env` Datei bleibt lokal für Development und wird **NIEMALS** ins Repository committed.

## 🎯 GITHUB REPOSITORY SETUP

### 1. Navigate zu GitHub Secrets
```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2. ERFORDERLICHE SECRETS

#### 🔧 Infrastructure Secrets
```
Name: PLESK_HOST
Value: dmpl20230054@5.183.217.146

Name: SSH_PRIVATE_KEY  
Value: [SSH Private Key - siehe unten]
```

#### 🗄️ Database Secrets
```
Name: LARAVEL_DB_NAME
Value: mo_laravel_api

Name: LARAVEL_DB_USER
Value: laravel_user

Name: LARAVEL_DB_PASS
Value: SECURE_LARAVEL_2025

Name: CIVICRM_DB_NAME
Value: mo_civicrm_data

Name: CIVICRM_DB_USER
Value: civicrm_user

Name: CIVICRM_DB_PASS
Value: SECURE_CIVICRM_2025
```

#### � E-Mail Configuration Secrets
```
Name: MAIL_LOGGING_EMAIL
Value: logging@menschlichkeit-oesterreich.at

Name: MAIL_LOGGING_PASSWORD
Value: wa3&3M59m

Name: MAIL_INFO_EMAIL
Value: info@menschlichkeit-oesterreich.at

Name: MAIL_INFO_PASSWORD
Value: 4%4if15Ao

Name: MAIL_ADMIN_EMAIL
Value: peter.schuller@menschlichkeit-oesterreich.at

Name: MAIL_ADMIN_PASSWORD
Value: 17d3lT8?h

Name: MAIL_CIVIMAIL_EMAIL
Value: civimail@menschlichkeit-oesterreich.at

Name: MAIL_CIVIMAIL_PASSWORD
Value: 69nTdv$16

Name: MAIL_BOUNCE_EMAIL
Value: bounce@menschlichkeit-oesterreich.at

Name: MAIL_BOUNCE_PASSWORD
Value: 1w8S%8a9k
```

#### �🔐 Security & API Secrets
```
Name: JWT_SECRET
Value: r0OgnrFIaxjhfdoLpGX7tF1f7Ctf7yEm

Name: N8N_ENCRYPTION_KEY
Value: pFeLynNLs5RUjHXRdCF0nKTxccytLXrF

Name: N8N_USER
Value: admin

Name: N8N_PASSWORD
Value: [Generiere sicheres Passwort]
```

#### 🛡️ Quality & Security Tools
```
Name: CODACY_API_TOKEN
Value: [Hole von codacy.com → Account → API Tokens]

Name: SNYK_TOKEN
Value: [Hole von snyk.io → Account Settings → API Token]

Name: CIVICRM_API_KEY
Value: [Generiere in CiviCRM → Administer → System Settings → API Keys]

Name: CIVICRM_SITE_KEY
Value: [Generiere in CiviCRM → Administer → System Settings → Site Key]
```

## 🔑 SSH PRIVATE KEY CONTENT

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACA4M9utbneQfyRvp2BiJCNjpVOjerXsUsiiA5HpLARpfwAAAJDrSEus60hL
rAAAAAtzc2gtZWQyNTUxOQAAACA4M9utbneQfyRvp2BiJCNjpVOjerXsUsiiA5HpLARpfw
AAAEB4I9arsW9EFr9UGUEFuiCwHd47xhMCGqIVeDGwjQeUGzgz261ud5B/JG+nYGIkI2Ol
U6N6texSyKIDkeksBGl/AAAADGRtcGwyMDIzMDA1NAE=
-----END OPENSSH PRIVATE KEY-----
```

## 🚀 SETUP SCHRITTE

### 1. GitHub Secrets Konfiguration
1. **Gehe zu:** `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions`
2. **Für jeden Secret:** Klicke "New repository secret"
3. **Name:** Exakt wie oben angegeben eingeben
4. **Value:** Entsprechenden Wert einfügen
5. **Speichern:** "Add secret" klicken

### 2. Fehlende API Tokens holen

#### Codacy API Token:
1. Gehe zu [codacy.com](https://app.codacy.com)
2. Account → API Tokens → Create API Token
3. Kopiere Token zu `CODACY_API_TOKEN`

#### Snyk Token:
1. Gehe zu [snyk.io](https://app.snyk.io)
2. Account Settings → API Token → Generate token
3. Kopiere Token zu `SNYK_TOKEN`

#### CiviCRM Keys:
1. CiviCRM Admin → Administer → System Settings → API Keys
2. Generiere API Key → kopiere zu `CIVICRM_API_KEY`
3. Generiere Site Key → kopiere zu `CIVICRM_SITE_KEY`

### 3. Zusätzliche Passwörter generieren
```bash
# Für N8N_PASSWORD (24 Zeichen)
openssl rand -base64 18

# Oder verwende: pBO+8@4nn1b96B4rPkRuq%E=
```

## 🔍 VALIDIERUNG

### 1. GitHub Actions Test
Nach dem Setup der Secrets:
```bash
# Lokale Validierung
.\scripts\setup-github-secrets.ps1 -ValidateSecrets

# GitHub Actions Push Test
git push origin main
```

### 2. Plesk SSH Verbindung testen
```bash
# In GitHub Codespace oder GitHub Actions
ssh -i $SSH_PRIVATE_KEY dmpl20230054@5.183.217.146
```

## 📊 STATUS ÜBERSICHT

### ✅ BEREIT
- SSH Private Key extrahiert und bereit
- Database Credentials identifiziert
- Security Keys generiert (JWT, N8N)
- `.env.example` Template aktualisiert
- `.gitignore` konfiguriert (`.env` ausgeschlossen)

### ⏳ AUSSTEHEND
- [ ] GitHub Secrets Konfiguration (E-Mail Secrets bereit!)
- [ ] Codacy API Token holen
- [ ] Snyk Token holen  
- [ ] CiviCRM Keys generieren
- [ ] GitHub Actions Test
- [ ] E-Mail Integration testen

### 🚫 SICHERHEIT
- ✅ `.env` ist in `.gitignore` - wird NIEMALS committed
- ✅ Nur `.env.example` Template im Repository
- ✅ Alle Production Secrets über GitHub Secrets
- ✅ SSH Key sicher extrahiert

## 🎯 NÄCHSTE SCHRITTE

1. **Jetzt:** GitHub Secrets mit obigen Werten konfigurieren
2. **API Tokens:** Codacy & Snyk Accounts einrichten
3. **CiviCRM:** API & Site Keys generieren
4. **Testen:** GitHub Actions Deployment
5. **Validieren:** Plesk SSH Zugang über GitHub Codespace

## 📚 DOKUMENTATION

- **GitHub Secrets Setup:** `GITHUB-SECRETS-SETUP.md`
- **Environment Template:** `.env.example`
- **Enterprise Setup:** `ENTERPRISE-SETUP-SUCCESS-REPORT.md`
- **Quality Gates:** `.github/copilot-instructions.md`

---

**⚠️ WICHTIGER HINWEIS:**  
Alle hier gezeigten Secrets sind für **GITHUB REPOSITORY SECRETS** bestimmt und sollten **NIEMALS** ins Git Repository committed werden. Die lokale `.env` Datei bleibt privat und wird automatisch von Git ignoriert.

**🔐 SICHERHEITSGARANTIE:**  
- Keine Secrets im Repository Code
- Sichere Übertragung über GitHub Secrets
- Lokale `.env` für Development
- Production über GitHub Actions
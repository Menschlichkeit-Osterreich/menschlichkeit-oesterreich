# 📋 ZUGANGSDATEN CHECKLISTE - Menschlichkeit Österreich
**Stand:** 29. September 2025  
**System:** Multi-Service Austrian NGO Platform

## ✅ VERFÜGBARE ZUGANGSDATEN

### 📧 E-Mail Accounts (KOMPLETT)
- ✅ **logging@menschlichkeit-oesterreich.at** | `wa3&3M59m`
- ✅ **info@menschlichkeit-oesterreich.at** | `4%4if15Ao`  
- ✅ **peter.schuller@menschlichkeit-oesterreich.at** | `17d3lT8?h`
- ✅ **civimail@menschlichkeit-oesterreich.at** | `69nTdv$16`
- ✅ **bounce@menschlichkeit-oesterreich.at** | `1w8S%8a9k`

### 🌐 Server Zugang (KOMPLETT)
- ✅ **Plesk Host:** `dmpl20230054@5.183.217.146`
- ✅ **SSH Port:** 22
- ✅ **SSH Key:** `~/.ssh/id_ed25519` (verfügbar)
- ✅ **Web Path:** `/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs`

---

## ❌ FEHLENDE ZUGANGSDATEN (KRITISCH)

### 🗄️ Database Credentials
- ❌ **Laravel Database Password**
  - Current: `SECURE_LARAVEL_2025` (DUMMY)
  - Database: `mo_laravel_api`
  - User: `laravel_user`
  - **Aktion:** Echtes Passwort von Plesk holen

- ❌ **CiviCRM Database Password**  
  - Current: `SECURE_CIVICRM_2025` (DUMMY)
  - Database: `mo_civicrm_data`
  - User: `civicrm_user`
  - **Aktion:** Echtes Passwort von Plesk holen

### 🔐 Security Keys
- ❌ **JWT Secret (32+ chars)**
  - **Generierung:** `openssl rand -base64 32`
  - **Verwendung:** API Authentication

- ❌ **n8n Encryption Key (32 chars)**
  - **Generierung:** `openssl rand -base64 32`
  - **Verwendung:** Workflow Automation

### 👥 CiviCRM Integration
- ❌ **CiviCRM API Key**
  - **Quelle:** CiviCRM Admin → System Settings → API Keys
  - **Verwendung:** API v4 Integration

- ❌ **CiviCRM Site Key**
  - **Quelle:** CiviCRM Admin → System Settings → Site Key  
  - **Verwendung:** API Security

### 🤖 n8n Automation
- ❌ **n8n Admin Username**
  - **Empfehlung:** `moe_admin` oder `admin`
  
- ❌ **n8n Admin Password**
  - **Generierung:** Starkes Passwort 16+ Zeichen
  - **Pattern:** Mix aus Buchstaben, Zahlen, Sonderzeichen

---

## 🔍 EXTERNAL SERVICES (WICHTIG)

### Code Quality & Security
- ❌ **Codacy API Token**
  - **Setup:** https://app.codacy.com → Account → API Tokens
  - **Verwendung:** Code Quality Analysis
  - **Kosten:** Free Tier verfügbar

- ❌ **Snyk Token**
  - **Setup:** https://app.snyk.io → Account Settings → API Token
  - **Verwendung:** Security Vulnerability Scanning
  - **Kosten:** Free Tier verfügbar

- 🟡 **SonarQube Token** (OPTIONAL)
  - **Setup:** SonarCloud oder Self-hosted
  - **Verwendung:** Advanced Code Quality

---

## 💰 PAYMENT INTEGRATION (OPTIONAL)

### SEPA für Österreich (NGO Spenden)
- 🟡 **SEPA Creditor ID**
  - **Quelle:** Österreichische Nationalbank
  - **Format:** AT-XX-ZZZ-YYYYYYYYYYY

- 🟡 **Vereins-IBAN**
  - **Verwendung:** Spenden & Mitgliedsbeiträge
  - **Bank:** Österreichische Bank

- 🟡 **Bank BIC Code**
  - **Format:** 8-11 Zeichen
  - **Verwendung:** SEPA Transfers

### Alternative Payment (OPTIONAL)
- 🟡 **Stripe Public Key** (pk_live_xxx)
- 🟡 **Stripe Secret Key** (sk_live_xxx)

---

## 📊 PRIORITÄTEN-MATRIX

### 🔥 SOFORT (Blockiert Entwicklung)
1. **Database Passwörter** - Plesk Database Access
2. **JWT Secret** - API Security  
3. **CiviCRM Keys** - Member Management

### ⚠️ HOCH (Quality Gates)
4. **Codacy Token** - Code Quality CI/CD
5. **Snyk Token** - Security Scanning  
6. **n8n Credentials** - Automation Workflows

### 🟡 MITTEL (Features)
7. **SEPA Credentials** - Donation System
8. **SonarQube** - Extended Quality

### 🔵 NIEDRIG (Nice-to-have)
9. **Stripe** - Alternative Payments
10. **Social Media APIs** - Marketing Integration

---

## 🎯 AKTIONSPLAN

### Phase 1: Database & Security (Tag 1)
- [ ] Plesk Login → Database Passwörter abrufen
- [ ] JWT Secret generieren: `openssl rand -base64 32`
- [ ] n8n Admin Credentials definieren
- [ ] Alle Secrets in `.env` eintragen

### Phase 2: External Services (Tag 2-3)  
- [ ] Codacy Account erstellen → API Token holen
- [ ] Snyk Account erstellen → API Token holen
- [ ] CiviCRM installieren → API & Site Keys generieren

### Phase 3: GitHub Integration (Tag 4)
- [ ] Alle 26 Secrets zu GitHub Secrets migrieren
- [ ] GitHub Actions testen
- [ ] CI/CD Pipeline validieren

### Phase 4: Payment Integration (Später)
- [ ] SEPA Creditor ID beantragen
- [ ] Bank Integration setup
- [ ] Donation System konfigurieren

---

## 🔐 SICHERHEITSHINWEISE

### ✅ SICHERE PRAKTIKEN
- Alle Production Secrets nur in GitHub Secrets
- Lokale `.env` nie in Git committen
- Starke Passwörter (16+ Zeichen)  
- Regelmäßige Key Rotation
- 2FA für alle External Services

### ❌ VERMEIDEN
- Secrets in Code oder Kommentaren
- Wiederverwendung von Passwörtern
- Unverschlüsselte Übertragung
- Shared Accounts ohne Audit Trail

---

## 📞 SUPPORT KONTAKTE

### Database/Server Issues
- **Plesk Provider:** digimagical.com
- **Server IP:** 5.183.217.146
- **SSH User:** dmpl20230054

### External Services
- **Codacy Support:** support@codacy.com  
- **Snyk Support:** support@snyk.io
- **CiviCRM Community:** https://civicrm.org/support

---

**Letzte Aktualisierung:** 29. September 2025  
**Nächste Review:** Bei System Changes  
**Verantwortlich:** Peter Schuller (peter.schuller@menschlichkeit-oesterreich.at)
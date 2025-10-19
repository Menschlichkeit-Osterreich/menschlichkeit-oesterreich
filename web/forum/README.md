# Forum of the Future – phpBB Community Platform

**Status:** 🚧 Vorbereitung · **Subdomain:** `forum.menschlichkeit-oesterreich.at`  
**Version:** phpBB 3.3.x · **Go-Live:** Q1 2026 (geplant)

---

## 🎯 Überblick

Community-Forum basierend auf phpBB mit modernen Features:
- ✅ **Design-System-Integration** – Figma Tokens → Tailwind CSS Theme
- ✅ **DSGVO-Compliance** – Cookie-Banner, Retention-Policy, Anonymisierung
- ✅ **KI-Moderation** – Automatische Spam-Erkennung via n8n
- ✅ **SSO (optional)** – OIDC-Integration mit Identity Provider
- ✅ **Gamification** – Badges, Achievements, Community-Quests
- ✅ **Social Integration** – Automatisches Crossposting auf Bluesky/Mastodon

---

## 📂 Projektstruktur

```
web/forum/
├── .keep                # Platzhalter (phpBB per FTP/rsync deployed)
└── README.md            # Diese Datei

docs/forum/
├── README.md            # Übersicht & Navigation
├── OPERATIONS.md        # Betrieb, Backup, Updates
├── SECURITY.md          # Hardening, 2FA, Rate-Limiting
├── DSGVO.md             # Datenschutz-Implementierung
├── SSO-OIDC.md          # Single Sign-On Setup
├── MODERATION.md        # Moderations-Workflows
├── KI-MODERATION.md     # AI-gestützte Content-Prüfung
├── COMMUNITY-GROWTH.md  # KPIs, Engagement-Strategien
├── GAMIFICATION.md      # Badge-System, Quests
├── STYLE-GUIDE.md       # Theme-Anpassung, Design Tokens
├── VISION.md            # Langfristige Roadmap
└── ADR/
    └── ADR-0001-forum-subdomain.md

.github/workflows/
├── ci-forum.yml         # Struktur-/Doku-Checks
├── deploy-forum.yml     # Plesk-Deploy (Safety-Gate aktiv)
└── moderation-ai.yml    # KI-Moderationsreport

automation/n8n/workflows/
├── forum-viral.json     # Social Crossposting
└── forum-moderation.json # (Optional) KI-Moderation
```

---

## 🚀 Quick Start (nach phpBB-Installation)

### 1. Voraussetzungen

```bash
# PHP 8.1+, MySQL/MariaDB, Apache/nginx
sudo apt-get install php8.1 php8.1-{fpm,mysql,gd,xml,mbstring,zip,curl}
```

### 2. ENV-Konfiguration

```bash
# .env im Repo-Root erweitern (siehe .env.example)
FORUM_BASE_URL=https://forum.menschlichkeit-oesterreich.at
FORUM_SMTP_HOST=smtp.menschlichkeit-oesterreich.at
FORUM_SMTP_USER=noreply@menschlichkeit-oesterreich.at
FORUM_SMTP_PASS=<aus Plesk/dotenv-vault>
FORUM_RECAPTCHA_SITE_KEY=<Google reCAPTCHA v3>
FORUM_RECAPTCHA_SECRET=<Google reCAPTCHA v3>
```

### 3. Installation (auf Plesk-Server)

```bash
# 1. phpBB Download
wget https://download.phpbb.com/pub/release/3.3/3.3.11/phpBB-3.3.11.zip
unzip phpBB-3.3.11.zip -d /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/forum/httpdocs

# 2. Permissions
cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/forum/httpdocs
chown -R www-data:psacln ./cache ./files ./store ./images/avatars/upload
chmod -R 775 ./cache ./files ./store ./images/avatars/upload

# 3. Web-Installer aufrufen
# https://forum.menschlichkeit-oesterreich.at/install
# → Admin-User, DB-Credentials, SMTP, reCAPTCHA eingeben
```

### 4. Theme-Anpassung (Design Tokens)

```bash
# Im Repo lokal
npm run figma:sync              # Tokens aus Figma holen
npm run forum:build-theme       # Tailwind CSS → phpBB Stylesheet

# Deployment
npm run deploy:forum            # Rsync zu Plesk (Safety-Gate muss entfernt sein)
```

---

## 🛠️ Entwicklung & Deployment

### Lokales Testen

```bash
# Theme-Änderungen
cd web/forum
npm install
npm run dev                     # Watch-Mode für Tailwind

# Doku-Linting
npm run lint:markdown           # Prüft docs/forum/*.md
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci-forum.yml (immer aktiv)
- Doku-Struktur-Checks
- Markdown-Linting
- Dead-Link-Detection

# .github/workflows/deploy-forum.yml (Safety-Gate aktiv)
if: ${{ false }}  # Bis Go-Live deaktiviert
- Rsync zu Plesk
- Cache leeren
- Permissions setzen
```

**Safety-Gate entfernen:** Nach erfolgreichem Testing `if: ${{ false }}` löschen.

---

## 📋 Wichtige Dokumente

| Dokument | Zweck | Zielgruppe |
|----------|-------|------------|
| [OPERATIONS.md](../../docs/forum/OPERATIONS.md) | Betrieb, Backup, Updates | DevOps |
| [SECURITY.md](../../docs/forum/SECURITY.md) | Hardening, 2FA, WAF | Security Team |
| [DSGVO.md](../../docs/forum/DSGVO.md) | Datenschutz-Compliance | Legal/Vorstand |
| [KI-MODERATION.md](../../docs/forum/KI-MODERATION.md) | AI-Moderation Setup | Community Manager |
| [STYLE-GUIDE.md](../../docs/forum/STYLE-GUIDE.md) | Theme-Entwicklung | Designer/Frontend |

---

## 🔐 Secrets Management

**GitHub Secrets (für deploy-forum.yml):**
- `PLESK_HOST` – SSH-Host (5.183.217.146)
- `PLESK_USER` – SSH-User
- `PLESK_SSH_KEY` – Private Key (ED25519)

**Dotenv-Vault:**
```bash
npx dotenv-vault@latest pull    # .env.vault → .env (lokal)
npx dotenv-vault@latest push    # .env → .env.vault (encrypted)
```

**Details:** Siehe `secrets/SECRETS-AUDIT.md` (Kategorie 11: Forum)

---

## 🎮 n8n Automation

### Social Crossposting (`forum-viral.json`)

**Workflow:**
1. phpBB Webhook → n8n (neue Top-Posts)
2. LLM-Summary generieren (OpenAI/Ollama)
3. Crosspost zu Bluesky/Mastodon
4. Analytics-Tracking

**Setup:**
```bash
# n8n importieren
docker exec -it n8n n8n import:workflow --input=automation/n8n/workflows/forum-viral.json
```

### KI-Moderation (`forum-moderation.json`)

**Workflow:**
1. Neue Beiträge → Sentiment-Analyse
2. Flag: Spam/Hate-Speech/Off-Topic
3. Moderator-Benachrichtigung (E-Mail/Slack)

---

## 🐛 Troubleshooting

### Problem: SMTP-Mails kommen nicht an

```bash
# Plesk-Mailbox prüfen
ssh plesk-prod-cs "postqueue -p"

# Test-Mail senden
php -r "mail('test@example.com', 'Test', 'Body');"
```

### Problem: Theme-Änderungen nicht sichtbar

```bash
# phpBB Cache leeren (Admin-Panel)
ACP → Allgemein → Purge Cache

# Oder per SSH
ssh plesk-prod-cs
cd /var/www/vhosts/.../forum/httpdocs
find ./cache -type f -not -name 'index.htm*' -delete
```

### Problem: Deploy-Workflow schlägt fehl

```bash
# Safety-Gate aktiv?
cat .github/workflows/deploy-forum.yml | grep "if: false"

# SSH-Key korrekt?
ssh -i ~/.ssh/plesk_ed25519 plesk-user@5.183.217.146
```

---

## 🚦 Roadmap

- [ ] **Phase 1 (Q1 2026):** phpBB-Installation, SMTP, reCAPTCHA
- [ ] **Phase 2 (Q2 2026):** Theme-Integration (Figma → Tailwind)
- [ ] **Phase 3 (Q2 2026):** DSGVO-Compliance (Cookie-Banner, Anonymisierung)
- [ ] **Phase 4 (Q3 2026):** SSO-Integration (OIDC)
- [ ] **Phase 5 (Q4 2026):** KI-Moderation, Gamification

---

**Maintainer:** Peter Schuller (@peschull)  
**Lizenz:** Siehe [LICENSE](../../LICENSE)  
**Dokumentation:** [docs/forum/](../../docs/forum/)

# Forum-Deployment: phpBB auf forum.menschlichkeit-oesterreich.at

**Bezug**: Issue #176 – Post-Merge: Forum-Integration aktivieren
**Stand**: 2026-03-10

---

## Phase 1: GitHub Secrets konfigurieren (BLOCKING)

Vor dem Deployment müssen folgende GitHub Secrets gesetzt werden:

```
Settings → Secrets and Variables → Actions → New repository secret

PLESK_HOST          = 5.183.217.146
PLESK_USER          = [Plesk-Benutzername]
PLESK_SSH_KEY       = [SSH-Private-Key für Deployment]
PLESK_KNOWN_HOSTS   = [SSH known_hosts Eintrag]
FORUM_DB_NAME       = moe_forum
FORUM_DB_USER       = forum_user
FORUM_DB_PASSWORD   = [starkes Passwort – min. 24 Zeichen]
FORUM_SMTP_USER     = noreply@menschlichkeit-oesterreich.at
FORUM_SMTP_PASSWORD = [SMTP-Passwort aus Plesk]
FORUM_RECAPTCHA_KEY = [reCAPTCHA v3 Site Key]
FORUM_RECAPTCHA_SECRET = [reCAPTCHA v3 Secret Key]
```

---

## Phase 2: DNS-Konfiguration

In Plesk → Domains → menschlichkeit-oesterreich.at → DNS:

```dns
forum    IN A    5.183.217.146    TTL: 300
```

TLS-Zertifikat: Let's Encrypt via Plesk (Automatisch bei Subdomain-Anlage).

**Subdomain in Plesk anlegen**:
```
Plesk → Websites & Domains → Subdomain hinzufügen
Subdomain: forum
Dokument-Stammverzeichnis: /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/forum/httpdocs
PHP-Version: 8.1 oder 8.2
```

---

## Phase 3: MariaDB-Datenbank anlegen

```sql
-- Via Plesk → Datenbanken → Datenbank hinzufügen
-- Oder via SSH:
CREATE DATABASE moe_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'forum_user'@'localhost' IDENTIFIED BY '[STARKES_PASSWORT]';
GRANT SELECT, INSERT, UPDATE, DELETE ON moe_forum.* TO 'forum_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Phase 4: phpBB-Installation (via SSH auf Plesk-Server)

```bash
#!/bin/bash
# phpBB 3.3.11 auf Plesk installieren
FORUM_ROOT=/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/forum/httpdocs

# 1. phpBB herunterladen und entpacken
cd /tmp
wget https://download.phpbb.com/pub/release/3.3/3.3.11/phpBB-3.3.11.zip
unzip phpBB-3.3.11.zip
rm -rf "$FORUM_ROOT"/*
cp -r phpBB3/* "$FORUM_ROOT/"

# 2. Berechtigungen setzen
chown -R [plesk-user]:psacln "$FORUM_ROOT"
chmod -R 755 "$FORUM_ROOT"
chmod -R 777 "$FORUM_ROOT/cache/"
chmod -R 777 "$FORUM_ROOT/store/"
chmod -R 777 "$FORUM_ROOT/files/"
chmod -R 777 "$FORUM_ROOT/images/avatars/upload/"
chmod 777 "$FORUM_ROOT/config.php"

# 3. Web-Installer aufrufen:
# https://forum.menschlichkeit-oesterreich.at/install/
```

---

## Phase 5: phpBB Web-Installer Konfiguration

Beim Web-Installer folgende Werte verwenden:

| Feld | Wert |
|------|------|
| Sprache | Deutsch (Österreich) |
| Datenbanktyp | MySQL with MySQLi Extension |
| Datenbankserver | localhost |
| Datenbankname | moe_forum |
| Datenbankbenutzer | forum_user |
| Datenbankpasswort | [FORUM_DB_PASSWORD aus Secrets] |
| Forum-Name | Menschlichkeit Österreich – Forum |
| Forum-Beschreibung | Diskussion und demokratische Beteiligung |
| Admin-E-Mail | admin@menschlichkeit-oesterreich.at |
| Admin-Benutzername | moe_admin |
| Admin-Passwort | [min. 20 Zeichen, in SOPS hinterlegen] |

### SMTP-Konfiguration im Installer:

| Feld | Wert |
|------|------|
| E-Mail-Versand via | SMTP |
| SMTP-Server | mail.menschlichkeit-oesterreich.at |
| SMTP-Port | 587 |
| SMTP-Auth | STARTTLS |
| SMTP-Benutzer | noreply@menschlichkeit-oesterreich.at |
| SMTP-Passwort | [FORUM_SMTP_PASSWORD] |

---

## Phase 6: Post-Installation-Härtung

```bash
# NACH erfolgreichem Installer:
# Installationsverzeichnis LÖSCHEN (Sicherheitspflicht!)
rm -rf "$FORUM_ROOT/install/"

# config.php schreibschützen
chmod 640 "$FORUM_ROOT/config.php"
```

### phpBB-Sicherheitskonfiguration (Admin Panel):

```
ACP → Allgemein → Servereinstellungen:
  - Server-URL: https://forum.menschlichkeit-oesterreich.at
  - Scriptpfad: /

ACP → Allgemein → Sicherheitseinstellungen:
  - Session IP-Validierung: Alle IPv4 Oktette
  - Loginversuche: 5
  - Entsperrzeit: 30 Minuten
  - reCAPTCHA v3: aktivieren

ACP → Allgemein → Anti-SPAM:
  - Q&A-CAPTCHA: aktivieren (zusätzlich zu reCAPTCHA)
  - Honeypot-Registrierung: aktivieren
```

---

## Phase 7: n8n-Integration aktivieren (Issue #176 Phase 5-7)

```
n8n → Workflows:
1. forum-moderation.json aktivieren (bereits vorhanden)
2. forum-viral.json aktivieren (bereits vorhanden)
3. social-media-crosspost.json für Forum-Posts konfigurieren

Webhook in phpBB konfigurieren:
ACP → Erweiterungen → n8n-Webhook-Erweiterung installieren
ODER: Cron-basiertes Polling via n8n (alle 5 Minuten)
```

---

## Phase 8: Design-Token-Integration (Issue #173)

```bash
# Tailwind → phpBB CSS-Bridge
# Tokens aus figma-design-system/00_design-tokens.json extrahieren
# und als phpBB Custom Theme CSS hinterlegen:

# Farben (Primary, Secondary, Accent):
# --ds-colors-primary-500: #0ea5e9
# --ds-colors-secondary-500: #64748b
# --ds-colors-accent-500: #f472b6

# In phpBB-Theme: styles/prosilver/theme/colours.css
# Entsprechende CSS-Variablen setzen
```

---

## Phase 9: Monitoring

```
Uptime Kuma: Monitor hinzufügen
  Typ: HTTP
  URL: https://forum.menschlichkeit-oesterreich.at
  Intervall: 5 Minuten
  Schwelle: HTTP ≠ 200

TLS-Check: Bereits via ssl-cert-check.yml abgedeckt
```

---

## Checkliste

```
[ ] GitHub Secrets gesetzt (PLESK_HOST, FORUM_DB_*, FORUM_SMTP_*, reCAPTCHA)
[ ] DNS: forum.menschlichkeit-oesterreich.at → 5.183.217.146
[ ] Plesk-Subdomain angelegt, Let's Encrypt aktiv
[ ] MariaDB: moe_forum + forum_user angelegt
[ ] phpBB 3.3.11 heruntergeladen und entpackt
[ ] Web-Installer ausgeführt (Deutsch, SMTP, reCAPTCHA)
[ ] /install/-Verzeichnis gelöscht
[ ] config.php schreibgeschützt (chmod 640)
[ ] reCAPTCHA v3 in ACP aktiviert
[ ] Anti-Spam-Einstellungen konfiguriert
[ ] n8n-Workflows: forum-moderation + forum-viral aktiviert
[ ] Uptime Kuma: Monitor angelegt
[ ] Testregistrierung durchgeführt
[ ] Testpost erstellt und Moderation geprüft
```

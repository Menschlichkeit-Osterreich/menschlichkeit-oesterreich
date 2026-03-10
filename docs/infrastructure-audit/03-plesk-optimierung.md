# 03 – Plesk-Optimierungsplan

**Stand**: 2026-03-09
**Hinweis**: Alle Empfehlungen basieren auf Best Practices und Repo-Analyse. Live-Verifizierung via Plesk-Panel erforderlich.

---

## TLS / HTTPS

### Ist-Zustand (wahrscheinlich)
- Let's Encrypt via Plesk-Extension
- nginx/1.28.0 als Webserver
- TLS-Version: unklar (TLS 1.0/1.1 möglicherweise noch aktiv)

### Empfehlungen

**1. TLS-Versionen einschränken** (Plesk → Domains → SSL/TLS-Einstellungen):
```nginx
# In nginx-Konfiguration (via Plesk Additional nginx Directives):
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
```

**2. HSTS aktivieren**:
```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

**3. OCSP-Stapling aktivieren**:
```nginx
ssl_stapling on;
ssl_stapling_verify on;
resolver 9.9.9.9 149.112.112.112 valid=300s;
```

**4. Security-Header für alle Domains** (Plesk → Domains → Additional nginx Directives):
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.menschlichkeit-oesterreich.at;" always;
```

**5. Zertifikat-Erneuerung testen**:
```bash
# Via Plesk SSH:
plesk bin extension --exec letsencrypt cli.php -d menschlichkeit-oesterreich.at --check-renewal
```

---

## Firewall

### Empfohlene Firewall-Regeln (Plesk → Tools & Settings → Firewall)

| Port | Protokoll | Quelle | Aktion | Begründung |
|------|-----------|--------|--------|------------|
| 22 | TCP | Admin-IPs only | ALLOW | SSH nur von bekannten IPs |
| 80 | TCP | ANY | ALLOW | HTTP (HTTPS-Redirect) |
| 443 | TCP | ANY | ALLOW | HTTPS |
| 587 | TCP | ANY | ALLOW | SMTP Submission |
| 465 | TCP | ANY | ALLOW | SMTPS |
| 993 | TCP | ANY | ALLOW | IMAPS |
| 8443 | TCP | Admin-IPs only | ALLOW | Plesk-Panel nur intern |
| 3306 | TCP | localhost | ALLOW | MariaDB nur lokal |
| 5678 | TCP | intern | ALLOW | n8n nur intern |
| 9100–9101 | TCP | intern | ALLOW | OpenClaw nur intern |
| * | * | ANY | DROP | Default-Deny |

---

## Fail2ban

### Empfohlene Konfiguration

```ini
# /etc/fail2ban/jail.local (via SSH)
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
banaction = iptables-multiport

[sshd]
enabled  = true
port     = ssh
maxretry = 3

[plesk-panel]
enabled  = true
port     = 8443
filter   = plesk-panel
maxretry = 5

[postfix]
enabled  = true
port     = smtp,465,submission

[dovecot]
enabled  = true
port     = pop3,pop3s,imap,imaps,submission,465,sieve
```

---

## ModSecurity / WAF

### Empfohlene Konfiguration (Plesk → Domains → Web Application Firewall)

1. **OWASP Core Rule Set (CRS) 4.x** aktivieren
2. **Modus**: Detection → Prüfen → Schrittweise auf Prevention wechseln
3. **Ausnahmen dokumentieren** (CiviCRM und Drupal benötigen Ausnahmen für Admin-UI)

```apache
# Spezifische Ausnahmen für CiviCRM (ModSecurity):
SecRuleRemoveById 920300  # Accept header
SecRuleRemoveById 942100  # SQLi detection (CiviCRM-Queries)
# Nur für /crm/*-Pfad!
```

---

## PHP-Konfiguration

### Empfohlene php.ini-Einstellungen (Plesk → PHP-Settings)

```ini
; Sicherheit
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log

; open_basedir (pro Domain)
; open_basedir = /var/www/vhosts/menschlichkeit-oesterreich.at/:/tmp/

; Deaktivierte Funktionen
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,pcntl_exec

; Upload-Limits
upload_max_filesize = 32M
post_max_size = 64M

; Session-Sicherheit
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = Strict
session.use_strict_mode = 1

; Zeitlimits
max_execution_time = 60
max_input_time = 60
memory_limit = 256M
```

---

## Panel-Härtung (Port 8443)

### Sofortmaßnahmen

1. **Zugang auf Admin-IP-Adressen beschränken** (Plesk → Tools & Settings → Restrict Administrative Access):
   ```
   Erlaubte IPs: [Büro-IP], [VPN-IP], [Developer-IPs]
   ```

2. **Zwei-Faktor-Authentifizierung aktivieren** für alle Plesk-Admin-Accounts:
   Plesk → My Profile → Two-Factor Authentication → aktivieren

3. **Fail2ban für Port 8443** (siehe oben)

4. **SSH-Tunnel als Alternative**:
   ```bash
   # Lokaler Zugriff via SSH-Tunnel (kein direkter Port-8443-Zugang nötig):
   ssh -L 8443:localhost:8443 user@5.183.217.146 -N
   # Dann: https://localhost:8443
   ```

5. **Admin-Passwort-Policy**: min. 20 Zeichen, keine Wiederverwendung

---

## Backup-Strategie

### Empfohlene Plesk-Backup-Konfiguration

| Parameter | Empfehlung |
|-----------|------------|
| Frequenz | Täglich (02:00 Uhr) |
| Retention | 30 Tage lokal + 90 Tage Off-Server |
| Inhalt | Vollständig (Dateien + DBs + Konfiguration) |
| Off-Server-Ziel | S3-kompatibler Storage (z.B. Hetzner Object Storage) |
| Verschlüsselung | AES-256 mit separatem Key |
| Test | Monatlicher Restore-Test dokumentiert |

```bash
# Backup-Test (monatlich via SSH):
plesk bin backup_manager --list-backup-files
# Restore-Test auf Staging-Umgebung (nicht Produktion):
plesk bin backup_manager --restore [backup-file] --overwrite-dumps
```

---

## Cron Jobs

### Empfohlene Cron-Jobs (Plesk → Scheduled Tasks)

```cron
# Drupal Cache leeren (täglich 03:00)
0 3 * * * cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs && vendor/bin/drush cr >> /var/log/drupal-cron.log 2>&1

# Drupal Cron (stündlich)
0 * * * * cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs && vendor/bin/drush cron >> /var/log/drupal-cron.log 2>&1

# TLS-Zertifikat-Erneuerung prüfen (täglich)
0 4 * * * plesk bin extension --exec letsencrypt cli.php --check-renewal >> /var/log/letsencrypt-renewal.log 2>&1

# MariaDB-Backup (täglich 01:00)
0 1 * * * /usr/local/bin/db-backup.sh >> /var/log/db-backup.log 2>&1

# Log-Rotation (wöchentlich)
0 5 * * 0 find /var/www/vhosts/*/logs/ -name "*.log" -mtime +90 -delete
```

---

## Checkliste Plesk-Audit

```
[ ] TLS 1.0/1.1 deaktiviert
[ ] HSTS aktiv (min. 1 Jahr)
[ ] OCSP-Stapling aktiv
[ ] Security-Header auf allen Domains
[ ] Firewall: Port 8443 auf Admin-IPs beschränkt
[ ] Fail2ban: SSH + Plesk + Mail aktiv
[ ] ModSecurity: CRS aktiv, Modus = Detection
[ ] PHP: expose_php=Off, display_errors=Off
[ ] 2FA für alle Plesk-Admin-Accounts
[ ] Backup: täglich + Off-Server konfiguriert
[ ] Backup-Restore-Test: monatlich dokumentiert
[ ] Cron-Jobs: alle Services mit Logs
[ ] Zertifikat-Ablauf: < 14 Tage = Alert
```

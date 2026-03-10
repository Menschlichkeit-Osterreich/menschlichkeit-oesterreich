# 05 – Subdomain-Architektur

**Stand**: 2026-03-09

---

## Übersicht

| Subdomain | Service | TLS | Öffentlich | Sicherheitsstufe | Status |
|-----------|---------|-----|-----------|-----------------|--------|
| menschlichkeit-oesterreich.at (apex) | Frontend React | LE | ✅ | Standard | wahrscheinlich aktiv |
| www | Redirect → apex | LE | ✅ | Standard | empfohlen |
| api | FastAPI | LE | ✅ | Hoch | wahrscheinlich aktiv |
| crm | Drupal + CiviCRM | LE | ⚠ | Sehr hoch | wahrscheinlich aktiv |
| cloud | Nextcloud | LE | ✅ | Sehr hoch | ❌ nicht deployed |
| forum | phpBB/Forum | LE | ✅ | Mittel | unklar |
| support | Ticketing | LE | ✅ | Hoch | unklar |
| vote | Voting-Plattform | LE | ✅ | Sehr hoch | unklar |
| n8n | n8n Automation | LE | ❌ intern | Kritisch | wahrscheinlich aktiv |
| mail | Postfix/Dovecot | LE | ✅ | Hoch | wahrscheinlich aktiv |
| webmail | Plesk Webmail | LE | ✅ | Hoch | wahrscheinlich aktiv |
| panel | Plesk 8443 | LE | ❌ intern | Kritisch | vorhanden – härtung nötig |
| status | Uptime Kuma | LE | ✅ | Niedrig | ❌ nicht deployed |
| games | Games/Webgame | LE | ✅ | Niedrig | wahrscheinlich aktiv |

---

## Detailanalyse pro Subdomain

### apex / www.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Hauptwebsite (React SPA) |
| Backend | nginx → static files / Vite-Build |
| TLS | Let's Encrypt, auto-erneuert |
| Security-Header | HSTS, X-Frame-Options, CSP |
| Caching | nginx Cache-Control, CDN (empfohlen) |
| Monitoring | HTTP 200, alle 1 min |

```nginx
# www → apex Redirect
server {
    listen 443 ssl;
    server_name www.menschlichkeit-oesterreich.at;
    return 301 https://menschlichkeit-oesterreich.at$request_uri;
}
```

---

### api.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | FastAPI REST-API |
| Port | 8001 |
| Routing | nginx → proxy_pass :8001 |
| TLS | Let's Encrypt |
| CORS | Nur von apex + crm erlaubt |
| Rate Limiting | 60 req/min je IP (empfohlen) |
| Auth | JWT Bearer Token |
| Monitoring | /health alle 1 min |

```nginx
# nginx-Config (wahrscheinliche Konfiguration):
location / {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Rate Limiting
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

### crm.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Drupal 10 + CiviCRM |
| Port | 8000 (dev) / PHP-FPM (prod) |
| TLS | Let's Encrypt |
| Zugriff | Nur für Mitglieder und Admins |
| ModSecurity | Aktiviert (CRS + Drupal-Ausnahmen) |
| PHP | 8.1+ (Drupal-Anforderung) |
| Monitoring | HTTP 200 alle 5 min |

**Sicherheitsempfehlung**: `/admin` und `/civicrm` auf bekannte IP-Adressen beschränken:
```nginx
location ~ ^/(admin|civicrm) {
    allow [Büro-IP];
    allow [VPN-IP];
    deny all;
}
```

---

### cloud.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Nextcloud (Dokumente, Fotos, Kalender) |
| Status | ❌ Noch nicht deployed |
| TLS | Let's Encrypt |
| Auth | LDAP/SAML (empfohlen) oder eigene Nextcloud-Auth |
| Sicherheitsstufe | Sehr hoch (DSGVO-sensible Daten) |
| Storage | Lokal + S3-Mirror |
| Monitoring | HTTP 200 alle 5 min |

Details: [06-nextcloud-architektur.md](./06-nextcloud-architektur.md)

---

### forum.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Community-Forum (phpBB oder ähnlich) |
| Status | unklar – kein Code im Repo |
| TLS | Let's Encrypt |
| DB | Separate MariaDB: `moe_forum` |
| Monitoring | HTTP 200 alle 5 min |
| Spam-Schutz | CAPTCHA + Honeypot empfohlen |

---

### support.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Support-Ticketing (Helpdeskfly, Zammad o.ä.) |
| Status | unklar – kein Code im Repo |
| TLS | Let's Encrypt |
| Auth | SSO via CiviCRM empfohlen |
| E-Mail | support@ → IMAP-Polling → Tickets |
| Monitoring | HTTP 200 alle 5 min |

---

### vote.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Demokratische Abstimmungen, Mitgliederabstimmungen |
| Status | unklar – kein Code im Repo |
| TLS | Let's Encrypt |
| Auth | Mitglieder-Auth via CiviCRM/JWT |
| Datenschutz | Anonymisierte Abstimmungsdaten (DSGVO Art. 5) |
| DB | Separate MariaDB: `moe_voting` |
| Monitoring | HTTP 200 alle 5 min |

**Besondere Anforderungen**:
- Audit-Log aller Abstimmungen (unveränderbar)
- Keine Rückführbarkeit von Stimmen zu Personen
- Backup vor jeder Abstimmung

---

### n8n.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Automation-Plattform (intern) |
| Status | wahrscheinlich aktiv |
| TLS | Let's Encrypt (ACME via n8n) |
| Zugriff | **Nicht öffentlich** – IP-Allowlist |
| Auth | Basic Auth + starkes Passwort |
| Monitoring | /healthz alle 5 min |

```nginx
# n8n: Nur von Admin-IPs erreichbar
server {
    server_name n8n.menschlichkeit-oesterreich.at;

    location / {
        allow [Admin-IP-1];
        allow [Admin-IP-2];
        deny all;

        proxy_pass http://127.0.0.1:5678;
    }
}
```

---

### mail.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Postfix MX-Eintrag, SMTP/IMAP-Hostname |
| TLS | Let's Encrypt |
| Ports | 587 (SUBMISSION), 465 (SMTPS), 993 (IMAPS) |
| MX-Eintrag | `@ IN MX 10 mail.menschlichkeit-oesterreich.at.` |

---

### webmail.menschlichkeit-oesterreich.at

| Attribut | Wert |
|----------|------|
| Zweck | Webmail-Interface (Plesk Horde/Roundcube) |
| TLS | Let's Encrypt |
| Auth | Plesk-E-Mail-Login |
| Security-Header | CSP, HSTS |
| Rate Limiting | 10 Login-Versuche / 5 min |

---

### panel.menschlichkeit-oesterreich.at / IP:8443

| Attribut | Wert |
|----------|------|
| Zweck | Plesk-Admin-Panel |
| TLS | Plesk-eigenes Zertifikat |
| Zugriff | **Nur via SSH-Tunnel oder IP-Allowlist** |
| 2FA | Erforderlich für alle Admin-Accounts |
| Empfehlung | Subdomain deaktivieren, nur über IP + SSH-Tunnel |

---

### status.menschlichkeit-oesterreich.at (neu)

| Attribut | Wert |
|----------|------|
| Zweck | Öffentliche Status-Page (Uptime Kuma) |
| Status | ❌ Noch nicht deployed |
| TLS | Let's Encrypt |
| Öffentlich | ✅ (kein Login nötig) |
| Inhalt | Website, API, CRM, Forum, n8n-Status |

---

## DNS-Gesamtübersicht

```dns
; Empfohlene DNS-Konfiguration (zone: menschlichkeit-oesterreich.at)

; Apex
@               IN A       5.183.217.146
@               IN AAAA    [IPv6 wenn vorhanden]

; www → apex
www             IN A       5.183.217.146

; Services
api             IN A       5.183.217.146
crm             IN A       5.183.217.146
cloud           IN A       5.183.217.146
forum           IN A       5.183.217.146
support         IN A       5.183.217.146
vote            IN A       5.183.217.146
n8n             IN A       5.183.217.146
games           IN A       5.183.217.146
status          IN A       5.183.217.146

; Mail
mail            IN A       5.183.217.146
webmail         IN A       5.183.217.146
@               IN MX  10  mail.menschlichkeit-oesterreich.at.

; TXT-Records
@               IN TXT     "v=spf1 mx ip4:5.183.217.146 ~all"
_dmarc          IN TXT     "v=DMARC1; p=none; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at"
default._domainkey IN TXT  "v=DKIM1; k=rsa; p=[PUBLIC_KEY]"
```

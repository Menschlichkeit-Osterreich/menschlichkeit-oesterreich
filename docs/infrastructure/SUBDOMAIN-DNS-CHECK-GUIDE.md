# Subdomain DNS Check Guide - Plesk Server

**Datum:** 2025-10-04  
**Server:** `dmpl20230054@5.183.217.146`  
**Projekt:** Menschlichkeit Österreich

---

## 🎯 Übersicht

Dieser Guide dokumentiert die **16 konfigurierten Subdomains** für die Menschlichkeit Österreich Plattform und deren DNS-Status-Überprüfung.

---

## 📋 Subdomain-Liste

| #   | Subdomain                                  | Zweck                     | Service             | Port |
| --- | ------------------------------------------ | ------------------------- | ------------------- | ---- |
| 1   | `admin.stg.menschlichkeit-oesterreich.at`  | Staging Admin Panel       | Drupal/CiviCRM      | 443  |
| 2   | `s3.menschlichkeit-oesterreich.at`         | Object Storage (MinIO)    | MinIO S3-kompatibel | 9000 |
| 3   | `consent.menschlichkeit-oesterreich.at`    | Cookie Consent Management | Cookie Consent API  | 443  |
| 4   | `support.menschlichkeit-oesterreich.at`    | Support-Ticketsystem      | Zammad/osTicket     | 443  |
| 5   | `votes.menschlichkeit-oesterreich.at`      | Voting-Plattform          | Educational Games   | 443  |
| 6   | `media.menschlichkeit-oesterreich.at`      | Media CDN                 | Nginx Static        | 443  |
| 7   | `hooks.menschlichkeit-oesterreich.at`      | Webhook Gateway           | n8n Webhooks        | 443  |
| 8   | `logs.menschlichkeit-oesterreich.at`       | Log Aggregation           | Grafana Loki        | 443  |
| 9   | `grafana.menschlichkeit-oesterreich.at`    | Monitoring Dashboard      | Grafana             | 443  |
| 10  | `status.menschlichkeit-oesterreich.at`     | Status Page               | Uptime Kuma         | 443  |
| 11  | `analytics.menschlichkeit-oesterreich.at`  | Privacy Analytics         | Matomo/Plausible    | 443  |
| 12  | `newsletter.menschlichkeit-oesterreich.at` | Newsletter Management     | Listmonk            | 443  |
| 13  | `n8n.menschlichkeit-oesterreich.at`        | Workflow Automation       | n8n                 | 5678 |
| 14  | `docs.menschlichkeit-oesterreich.at`       | Dokumentation             | Docusaurus/MkDocs   | 443  |
| 15  | `forum.menschlichkeit-oesterreich.at`      | Community Forum           | Discourse           | 443  |
| 16  | `idp.menschlichkeit-oesterreich.at`        | Identity Provider         | Keycloak/Authentik  | 443  |

---

## 🔍 Manuelle DNS-Prüfung (Lokal)

### Methode 1: Mit `host` Kommando

```bash
#!/bin/bash

subdomains=(
    "admin.stg.menschlichkeit-oesterreich.at"
    "s3.menschlichkeit-oesterreich.at"
    "consent.menschlichkeit-oesterreich.at"
    "support.menschlichkeit-oesterreich.at"
    "votes.menschlichkeit-oesterreich.at"
    "media.menschlichkeit-oesterreich.at"
    "hooks.menschlichkeit-oesterreich.at"
    "logs.menschlichkeit-oesterreich.at"
    "grafana.menschlichkeit-oesterreich.at"
    "status.menschlichkeit-oesterreich.at"
    "analytics.menschlichkeit-oesterreich.at"
    "newsletter.menschlichkeit-oesterreich.at"
    "n8n.menschlichkeit-oesterreich.at"
    "docs.menschlichkeit-oesterreich.at"
    "forum.menschlichkeit-oesterreich.at"
    "idp.menschlichkeit-oesterreich.at"
)

echo "DNS-Auflösung Lokal:"
for domain in "${subdomains[@]}"; do
    ip=$(host "$domain" 2>/dev/null | grep "has address" | awk '{print $NF}')
    if [[ -n "$ip" ]]; then
        echo "✅ $domain → $ip"
    else
        echo "❌ $domain → Keine Auflösung"
    fi
done
```

### Methode 2: Mit `nslookup`

```bash
for domain in admin.stg s3 consent support votes media hooks logs grafana status analytics newsletter n8n docs forum idp; do
    echo "Checking: ${domain}.menschlichkeit-oesterreich.at"
    nslookup "${domain}.menschlichkeit-oesterreich.at" 2>/dev/null | grep "Address:" | tail -1
done
```

### Methode 3: Mit `dig`

```bash
dig +short admin.stg.menschlichkeit-oesterreich.at A
dig +short s3.menschlichkeit-oesterreich.at A
# ... für alle Subdomains
```

---

## 🖥️ Plesk Server - Manuelle Prüfung

### SSH-Verbindung aufbauen

```bash
# Mit Passwort
ssh dmpl20230054@5.183.217.146

# Mit SSH-Key (wenn konfiguriert)
ssh -i ~/.ssh/plesk_id_ed25519 dmpl20230054@5.183.217.146
```

### Plesk CLI - Subdomain-Liste

```bash
# Alle Subdomains auflisten
plesk bin subdomain --list

# Detaillierte Info zu spezifischer Subdomain
plesk bin subdomain --info "admin.stg.menschlichkeit-oesterreich.at"

# Alle Domains auflisten
plesk bin domain --list
```

### DNS-Zonen prüfen

```bash
# DNS-Zonen für Hauptdomain
plesk bin dns --list menschlichkeit-oesterreich.at

# DNS-Einträge für Subdomain
plesk bin dns --info admin.stg.menschlichkeit-oesterreich.at
```

### Nginx-Konfiguration prüfen

```bash
# Alle vHost-Konfigurationen
ls -la /var/www/vhosts/menschlichkeit-oesterreich.at/

# Subdomain-Verzeichnisse
ls -la /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/

# Nginx-Konfiguration für Subdomain
cat /var/www/vhosts/system/menschlichkeit-oesterreich.at/conf/admin.stg.menschlichkeit-oesterreich.at.conf
```

---

## 📊 Erwartetes Ergebnis

### Alle Subdomains konfiguriert (Idealfall)

```
✅ admin.stg.menschlichkeit-oesterreich.at → 5.183.217.146
✅ s3.menschlichkeit-oesterreich.at → 5.183.217.146
✅ consent.menschlichkeit-oesterreich.at → 5.183.217.146
✅ support.menschlichkeit-oesterreich.at → 5.183.217.146
✅ votes.menschlichkeit-oesterreich.at → 5.183.217.146
✅ media.menschlichkeit-oesterreich.at → 5.183.217.146
✅ hooks.menschlichkeit-oesterreich.at → 5.183.217.146
✅ logs.menschlichkeit-oesterreich.at → 5.183.217.146
✅ grafana.menschlichkeit-oesterreich.at → 5.183.217.146
✅ status.menschlichkeit-oesterreich.at → 5.183.217.146
✅ analytics.menschlichkeit-oesterreich.at → 5.183.217.146
✅ newsletter.menschlichkeit-oesterreich.at → 5.183.217.146
✅ n8n.menschlichkeit-oesterreich.at → 5.183.217.146
✅ docs.menschlichkeit-oesterreich.at → 5.183.217.146
✅ forum.menschlichkeit-oesterreich.at → 5.183.217.146
✅ idp.menschlichkeit-oesterreich.at → 5.183.217.146
```

### Wenn DNS nicht konfiguriert

```
❌ admin.stg.menschlichkeit-oesterreich.at → NXDOMAIN (nicht existent)
```

**Ursachen:**

1. A-Record fehlt in DNS-Zone
2. Subdomain nicht in Plesk angelegt
3. DNS-Propagation noch nicht abgeschlossen (24-48h)
4. Nameserver-Konfiguration fehlerhaft

---

## 🛠️ Subdomain in Plesk anlegen

### Via Plesk GUI

1. Login: https://5.183.217.146:8443
2. **Websites & Domains** → `menschlichkeit-oesterreich.at`
3. **Add Subdomain**
4. Subdomain-Name eingeben (z.B. `n8n`)
5. Document Root: `/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/n8n/httpdocs`
6. **OK** → Subdomain wird angelegt

### Via Plesk CLI (SSH)

```bash
# Subdomain anlegen
plesk bin subdomain --create n8n \
    -domain menschlichkeit-oesterreich.at \
    -www-root /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/n8n/httpdocs

# SSL-Zertifikat (Let's Encrypt) aktivieren
plesk bin extension --exec letsencrypt cli.php \
    -d n8n.menschlichkeit-oesterreich.at \
    -m schuller_peter@icloud.com

# Nginx-Reverse-Proxy konfigurieren
cat > /var/www/vhosts/system/menschlichkeit-oesterreich.at/conf/n8n.menschlichkeit-oesterreich.at_nginx.conf << 'EOF'
location / {
    proxy_pass http://localhost:5678;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket Support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
EOF

# Nginx neu laden
plesk bin service_node --restart nginx
```

---

## 🔐 DNS-Konfiguration

### A-Records manuell hinzufügen

```bash
# Via Plesk CLI
plesk bin dns --add menschlichkeit-oesterreich.at \
    -type A \
    -host n8n \
    -value 5.183.217.146

# Alle 16 Subdomains auf einmal
for subdomain in admin.stg s3 consent support votes media hooks logs grafana status analytics newsletter n8n docs forum idp; do
    plesk bin dns --add menschlichkeit-oesterreich.at \
        -type A \
        -host "$subdomain" \
        -value 5.183.217.146
done
```

### Wildcard-DNS (Alternative)

```bash
# Wildcard A-Record für *.menschlichkeit-oesterreich.at
plesk bin dns --add menschlichkeit-oesterreich.at \
    -type A \
    -host "*" \
    -value 5.183.217.146
```

⚠️ **ACHTUNG:** Wildcard-DNS fängt ALLE Subdomains ab (auch nicht existierende)!

---

## 📝 Troubleshooting

### Problem 1: DNS-Auflösung schlägt fehl

**Symptom:**

```
❌ n8n.menschlichkeit-oesterreich.at → NXDOMAIN
```

**Lösungen:**

1. Prüfe DNS-Zone in Plesk:

   ```bash
   plesk bin dns --list menschlichkeit-oesterreich.at | grep n8n
   ```

2. Füge A-Record hinzu:

   ```bash
   plesk bin dns --add menschlichkeit-oesterreich.at -type A -host n8n -value 5.183.217.146
   ```

3. DNS-Propagation abwarten (max 48h):
   ```bash
   watch -n 30 'host n8n.menschlichkeit-oesterreich.at'
   ```

### Problem 2: Subdomain zeigt 404

**Symptom:**

- DNS-Auflösung funktioniert ✅
- HTTP-Aufruf → 404 Not Found

**Lösungen:**

1. Prüfe Nginx-vHost:

   ```bash
   nginx -t  # Syntax-Check
   cat /var/www/vhosts/system/menschlichkeit-oesterreich.at/conf/n8n.*.conf
   ```

2. Prüfe Document Root:

   ```bash
   ls -la /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/n8n/httpdocs/
   ```

3. Erstelle Test-Index:
   ```bash
   echo "n8n Subdomain Active" > /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/n8n/httpdocs/index.html
   ```

### Problem 3: SSL-Zertifikat fehlt

**Symptom:**

- HTTPS → ERR_CERT_COMMON_NAME_INVALID
- HTTP funktioniert ✅

**Lösung:**

```bash
# Let's Encrypt Zertifikat für Subdomain
plesk bin extension --exec letsencrypt cli.php \
    -d n8n.menschlichkeit-oesterreich.at \
    -m schuller_peter@icloud.com
```

---

## 🚀 Automatisiertes Setup-Skript

Für **batch-Setup aller 16 Subdomains**:

```bash
#!/bin/bash
# setup-all-subdomains.sh

DOMAIN="menschlichkeit-oesterreich.at"
SERVER_IP="5.183.217.146"
EMAIL="schuller_peter@icloud.com"

subdomains=(
    "admin.stg" "s3" "consent" "support" "votes" "media"
    "hooks" "logs" "grafana" "status" "analytics" "newsletter"
    "n8n" "docs" "forum" "idp"
)

for subdomain in "${subdomains[@]}"; do
    echo "🔧 Setup: ${subdomain}.${DOMAIN}"

    # 1. Subdomain in Plesk anlegen
    plesk bin subdomain --create "$subdomain" \
        -domain "$DOMAIN" \
        -www-root "/var/www/vhosts/${DOMAIN}/subdomains/${subdomain}/httpdocs" \
        2>/dev/null || echo "  ⚠️  Subdomain existiert bereits"

    # 2. A-Record hinzufügen
    plesk bin dns --add "$DOMAIN" \
        -type A \
        -host "$subdomain" \
        -value "$SERVER_IP" \
        2>/dev/null || echo "  ⚠️  DNS-Eintrag existiert bereits"

    # 3. Let's Encrypt SSL
    plesk bin extension --exec letsencrypt cli.php \
        -d "${subdomain}.${DOMAIN}" \
        -m "$EMAIL" \
        2>/dev/null && echo "  ✅ SSL aktiviert" || echo "  ⚠️  SSL-Setup fehlgeschlagen"

    echo ""
done

echo "✅ Setup abgeschlossen!"
echo "⏳ DNS-Propagation: 24-48 Stunden"
```

**Ausführung auf Plesk-Server:**

```bash
ssh dmpl20230054@5.183.217.146 'bash -s' < setup-all-subdomains.sh
```

---

## 📚 Referenzen

- **Plesk CLI Dokumentation:** https://docs.plesk.com/en-US/obsidian/cli-linux/
- **DNS Best Practices:** RFC 1034/1035
- **Let's Encrypt Rate Limits:** 50 Zertifikate/Woche pro Domain
- **Nginx Reverse Proxy:** https://nginx.org/en/docs/http/ngx_http_proxy_module.html

---

## ✅ Checkliste

Nach manuellem Setup überprüfen:

- [ ] Alle 16 Subdomains in Plesk angelegt
- [ ] DNS A-Records für alle Subdomains konfiguriert
- [ ] DNS-Auflösung funktioniert (lokaler `host` Check)
- [ ] Nginx-vHosts konfiguriert
- [ ] Let's Encrypt SSL-Zertifikate aktiv
- [ ] HTTPS-Redirect aktiviert
- [ ] Reverse Proxies für Backend-Services (n8n, Grafana, etc.)
- [ ] Firewall-Regeln (Port 443 offen)
- [ ] Security Headers konfiguriert (HSTS, CSP)
- [ ] Monitoring für alle Subdomains (Uptime Kuma)

---

**Dokumentiert:** 2025-10-04  
**Autor:** DevOps Team  
**Projekt:** Menschlichkeit Österreich  
**Status:** Ready for Implementation

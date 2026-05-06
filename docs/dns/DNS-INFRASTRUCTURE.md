# 🌐 DNS & Mail-Infrastruktur – Menschlichkeit Österreich

**Status:** 2025-10-18  
**Hauptdomain:** menschlichkeit-oesterreich.at  
**Primäre IP:** 5.183.217.146 (Plesk)

---

## 📍 Domains & Subdomains (Inventar)

### Web-/App-Subdomains (21)

| Subdomain | Zweck | Plesk-Pfad | DNS-Empfehlung |
|-----------|-------|------------|----------------|
| @ (Apex) | Root Site | `httpdocs` | A → 5.183.217.146 |
| www | Alias | — | CNAME → apex |
| admin.stg | Admin Staging | `subdomains/admin.stg/httpdocs` | CNAME → apex |
| analytics | Analytics UI | `subdomains/analytics/httpdocs` | CNAME → apex |
| api.stg | API Staging | `subdomains/api.stg/httpdocs` | CNAME → apex |
| consent | Consent/Privacy | `subdomains/consent/httpdocs` | CNAME → apex |
| crm | Drupal/CiviCRM | `subdomains/crm/httpdocs` | CNAME → apex |
| docs | Dokumentation | `subdomains/docs/httpdocs` | CNAME → apex |
| forum | Forum | `subdomains/forum/httpdocs` | CNAME → apex |
| games | Games | `subdomains/games/httpdocs` | CNAME → apex |
| grafana | Grafana | `subdomains/grafana/httpdocs` | CNAME → apex |
| hooks | Webhooks | `subdomains/hooks/httpdocs` | CNAME → apex |
| idp | Identity Provider | `subdomains/idp/httpdocs` | CNAME → apex |
| logs | Log-Viewer | `subdomains/logs/httpdocs` | CNAME → apex |
| media | Medien | `subdomains/media/httpdocs` | CNAME → apex |
| n8n | Automation | `subdomains/n8n/httpdocs` | CNAME → apex |
| newsletter | Newsletter | `subdomains/newsletter/httpdocs` | CNAME → apex |
| s3 | S3-Gateway | `subdomains/s3/httpdocs` | CNAME → apex |
| status | Statuspage | `subdomains/status/httpdocs` | CNAME → apex |
| support | Support/Helpdesk | `subdomains/support/httpdocs` | CNAME → apex |
| votes | Votes | `subdomains/vote/httpdocs` | CNAME → apex |

**⚠️ Hinweis:** `votes` → Plesk-Pfad ist `vote` (ohne "s")

### Mail-Infrastruktur-Subdomains (4)

| Subdomain | Typ | Zweck |
|-----------|-----|-------|
| mail | A → 5.183.217.146 | MX-Zielhost, PTR erforderlich |
| mta-sts | A → 5.183.217.146 | MTA-STS Policy Host (HTTPS) |
| autoconfig | CNAME → apex | Mail-Client Auto-Konfig (optional) |
| autodiscover | CNAME → apex | Exchange/Outlook Auto-Discovery (optional) |

---

## 📧 Mailboxen-Inventar

### ✅ Bestand (6 Mailboxen)

| Adresse | Zweck | Quota | Status |
|---------|-------|-------|--------|
| peter.schuller@ | Projektleitung | 1.06 MB / 250 MB | ✅ OK |
| office@ | Offizielle Kontakt | 7.65 KB / 250 MB | ✅ OK |
| **logging@** | System/Audit-Logs | **197 MB / 250 MB** | ⚠️ **KRITISCH (79% voll)** |
| info@ | Allgemeine Anfragen | 91.4 KB / 250 MB | ✅ OK |
| civimail@ | Newsletter CiviCRM | 18.1 KB / 250 MB | ✅ OK |
| bounce@ | Bounce-Handling | 248 KB / 250 MB | ✅ OK |

### 🔲 Geplant (11 Mailboxen)

| Adresse | Zweck | Priorität |
|---------|-------|-----------|
| newsletter@ | Newsletter-Absender | P1-HIGH |
| support@ | Support/Tickets | P1-HIGH |
| no-reply@ | Transaktionale Mails | P1-HIGH |
| admin@ | Systemmeldungen | P1-HIGH |
| dmarc@ | DMARC Reports | **P1-HIGH** |
| tlsrpt@ | TLS Reports | **P1-HIGH** |
| devops@ | CI/CD Reports | P2-MEDIUM |
| board@ | Vorstand | P2-MEDIUM |
| kassier@ | Finanzen/SEPA | P2-MEDIUM |
| security@ | CAA iodef | P2-MEDIUM |
| fundraising@ | Sponsoring | P3-LOW |

---

## 📜 DNS-Records (SOLL-Konfiguration)

### A/AAAA Records
```dns
menschlichkeit-oesterreich.at.          3600 IN A     5.183.217.146
mail.menschlichkeit-oesterreich.at.     3600 IN A     5.183.217.146
mta-sts.menschlichkeit-oesterreich.at.  3600 IN A     5.183.217.146
```

### CNAME Records (alle Web-Subdomains)
```dns
www.menschlichkeit-oesterreich.at.          3600 IN CNAME menschlichkeit-oesterreich.at.
crm.menschlichkeit-oesterreich.at.          3600 IN CNAME menschlichkeit-oesterreich.at.
analytics.menschlichkeit-oesterreich.at.    3600 IN CNAME menschlichkeit-oesterreich.at.
; ... (für alle 20 Subdomains)
```

### MX Record
```dns
menschlichkeit-oesterreich.at. 3600 IN MX 10 mail.menschlichkeit-oesterreich.at.
```

### SPF (TXT)
```dns
menschlichkeit-oesterreich.at. 3600 IN TXT "v=spf1 a mx ip4:5.183.217.146 include:spf.mtasv.net include:spf.brevo.com include:servers.mcsv.net ~all"
```
*Anpassen an tatsächlich genutzte Provider (Postmark/Brevo/Mailchimp)*

### DKIM (TXT)
```dns
default._domainkey.menschlichkeit-oesterreich.at. 3600 IN TXT "v=DKIM1; k=rsa; p=<PUBLIC_KEY_FROM_PLESK>"
```
*Public Key aus Plesk Mail Settings kopieren*

### DMARC (TXT)
```dns
_dmarc.menschlichkeit-oesterreich.at. 3600 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@menschlichkeit-oesterreich.at; ruf=mailto:dmarc@menschlichkeit-oesterreich.at; fo=1; adkim=s; aspf=s; sp=quarantine; pct=100"
```
*Stufenweise: p=none (2 Wochen) → p=quarantine → p=reject*

### MTA-STS (TXT + HTTPS)
```dns
_mta-sts.menschlichkeit-oesterreich.at. 3600 IN TXT "v=STSv1; id=20251018"
```

**Policy-Datei:** `https://mta-sts.menschlichkeit-oesterreich.at/.well-known/mta-sts.txt`
```
version: STSv1
mode: enforce
mx: mail.menschlichkeit-oesterreich.at
max_age: 86400
```

### TLS-RPT (TXT)
```dns
_smtp._tls.menschlichkeit-oesterreich.at. 3600 IN TXT "v=TLSRPTv1; rua=mailto:tlsrpt@menschlichkeit-oesterreich.at"
```

### CAA
```dns
menschlichkeit-oesterreich.at. 3600 IN CAA 0 issue "letsencrypt.org"
menschlichkeit-oesterreich.at. 3600 IN CAA 0 iodef "mailto:security@menschlichkeit-oesterreich.at"
```

### PTR (Reverse DNS)
```
5.183.217.146 → mail.menschlichkeit-oesterreich.at
```
*Beim Hoster/Plesk-Provider setzen lassen*

---

## 🛠️ DNS-Prüfungen

### PowerShell-Tools (siehe `tools/`)

1. **`tools/dns-check-all.ps1`** – Komplett-Check (MX, SPF, DKIM, DMARC, MTA-STS, TLS-RPT, CAA)
2. **`tools/dns-check-subdomains.ps1`** – Alle 21 Web-Subdomains prüfen
3. **`tools/dns-export-csv.ps1`** – IST-Zustand nach CSV exportieren

### Manuelle Checks (PowerShell)
```powershell
# A Record
Resolve-DnsName menschlichkeit-oesterreich.at -Type A

# MX
Resolve-DnsName menschlichkeit-oesterreich.at -Type MX

# SPF
Resolve-DnsName menschlichkeit-oesterreich.at -Type TXT | Where-Object {$_.Strings -match '^v=spf1'}

# DKIM
Resolve-DnsName default._domainkey.menschlichkeit-oesterreich.at -Type TXT

# DMARC
Resolve-DnsName _dmarc.menschlichkeit-oesterreich.at -Type TXT

# MTA-STS
Resolve-DnsName _mta-sts.menschlichkeit-oesterreich.at -Type TXT
Invoke-WebRequest -Uri "https://mta-sts.menschlichkeit-oesterreich.at/.well-known/mta-sts.txt"

# TLS-RPT
Resolve-DnsName _smtp._tls.menschlichkeit-oesterreich.at -Type TXT

# CAA
Resolve-DnsName menschlichkeit-oesterreich.at -Type CAA
```

---

## 🔒 Blacklist-Checks

IP **5.183.217.146** bei diesen Diensten prüfen:
- https://check.spamhaus.org
- https://mxtoolbox.com/blacklists.aspx
- https://www.barracudacentral.org/lookups

**Bei Listung:**
1. PTR, SPF, DKIM, DMARC prüfen
2. Offene Relays/Forwards ausschließen
3. Delisting-Prozess je Anbieter

---

## 📋 Plesk-spezifische Hinweise

- **DKIM:** Domain → Mail Settings → DKIM aktivieren (Plesk veröffentlicht TXT automatisch, bei externem DNS manuell kopieren)
- **SPF/DMARC/CAA:** In Plesk DNS-Zone pflegen (oder externem DNS)
- **PTR:** Nur via Provider/Hoster
- **TLS:** Let's Encrypt pro (Sub-)Domain; Auto-Renew aktiv

---

## ✅ Checkliste (Quick Wins)

- [ ] DNS-Checks ausführen (`dns-check-all.ps1`)
- [ ] IST-Zustand exportieren (`dns-export-csv.ps1`)
- [ ] SPF-Record setzen/anpassen
- [ ] DKIM in Plesk aktivieren
- [ ] DMARC auf `p=none` setzen (Monitoring-Phase)
- [ ] PTR-Record prüfen (5.183.217.146 → mail.menschlichkeit-oesterreich.at)
- [ ] 6 P1-Mailboxen anlegen (dmarc@, tlsrpt@, newsletter@, support@, no-reply@, admin@)
- [ ] `logging@` archivieren (197 MB / 250 MB kritisch!)
- [ ] MTA-STS einrichten (Subdomain + Policy-Datei)
- [ ] Alle 21 Subdomains via CNAME konfigurieren
- [ ] Blacklist-Check durchführen

---

**Erstellt:** 2025-10-18  
**Tools:** `tools/dns-*.ps1`  
**Dokumentation:** `docs/operations/MAILBOXEN-ERSTELLUNG-PLESK.md`, `docs/operations/MAIL-ARCHIVIERUNG-LOGGING.md`

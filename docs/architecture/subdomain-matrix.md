# Subdomain-Architektur – Menschlichkeit Österreich

**Version:** 1.0 | **Bewertung:** EMPFOHLEN (Zielarchitektur)

---

## Subdomain-Matrix

| Subdomain | Dienst | Zweck | Auth | TLS | Reverse Proxy | Monitoring | Risiko |
|---|---|---|---|---|---|---|---|
| `menschlichkeit-oesterreich.at` | React SPA + nginx | Öffentliche Website + Mitgliederbereich | JWT (Mitglieder) | Let's Encrypt | Plesk/nginx | HTTP + TLS-Ablauf | Mittel |
| `www.menschlichkeit-oesterreich.at` | Redirect → Apex | SEO-Redirect | Nein | Let's Encrypt | nginx 301 | HTTP | Niedrig |
| `api.menschlichkeit-oesterreich.at` | FastAPI (Python) | REST-API für Frontend + CRM | JWT Bearer | Let's Encrypt | nginx → uvicorn | HTTP + Latenz | Hoch |
| `crm.menschlichkeit-oesterreich.at` | Drupal 10 + CiviCRM | Mitgliederverwaltung | Session + CiviCRM-Key | Let's Encrypt | nginx → PHP-FPM | HTTP + DB | Hoch |
| `cloud.menschlichkeit-oesterreich.at` | Nextcloud | Dateiablage, Kollaboration | Nextcloud-Login + 2FA | Let's Encrypt | nginx | HTTP + Storage | Hoch |
| `forum.menschlichkeit-oesterreich.at` | Discourse (geplant) | Community-Forum | SSO über Mitglieder-JWT | Let's Encrypt | nginx | HTTP | Mittel |
| `support.menschlichkeit-oesterreich.at` | Helpdesk (geplant) | Ticket-Support | Intern: Admin; Extern: E-Mail | Let's Encrypt | nginx | HTTP | Niedrig |
| `vote.menschlichkeit-oesterreich.at` | Voting-Plattform (geplant) | Mitglieder-Abstimmungen | JWT (Mitglieder) | Let's Encrypt | nginx | HTTP | Hoch |
| `mail.menschlichkeit-oesterreich.at` | Plesk Mailserver | SMTP/IMAP/POP3 | SMTP-Auth | TLS/STARTTLS | Direkt | Mail-Queue | Kritisch |
| `webmail.menschlichkeit-oesterreich.at` | Roundcube (Plesk) | Web-Mailclient | Mailserver-Login | Let's Encrypt | Plesk | HTTP | Mittel |
| `panel.menschlichkeit-oesterreich.at` | Plesk-Panel (Alias) | Serververwaltung | Plesk-Login + IP-Whitelist | Plesk-Zertifikat | Direkt | Login-Versuche | Kritisch |
| `status.menschlichkeit-oesterreich.at` | Uptime Kuma | Status-Page (öffentlich) | Keine (read-only) | Let's Encrypt | nginx | Selbstüberwachend | Niedrig |
| `monitor.menschlichkeit-oesterreich.at` | Grafana | Internes Monitoring-Dashboard | Grafana-Login (intern) | Let's Encrypt | nginx + IP-Whitelist | Prometheus | Hoch |
| `n8n.menschlichkeit-oesterreich.at` | n8n | Automation-Interface | n8n-Login + IP-Whitelist | Let's Encrypt | nginx | HTTP | Hoch |

---

## DNS-Konfiguration (Zielzustand)

```dns
; Apex + www
menschlichkeit-oesterreich.at.   IN A     5.183.217.146
www.menschlichkeit-oesterreich.at. IN CNAME menschlichkeit-oesterreich.at.

; Dienst-Subdomains
api.menschlichkeit-oesterreich.at.   IN A  5.183.217.146
crm.menschlichkeit-oesterreich.at.   IN A  5.183.217.146
cloud.menschlichkeit-oesterreich.at. IN A  5.183.217.146
forum.menschlichkeit-oesterreich.at. IN A  5.183.217.146
support.menschlichkeit-oesterreich.at. IN A 5.183.217.146
vote.menschlichkeit-oesterreich.at.  IN A  5.183.217.146
status.menschlichkeit-oesterreich.at. IN A 5.183.217.146
monitor.menschlichkeit-oesterreich.at. IN A 5.183.217.146
n8n.menschlichkeit-oesterreich.at.  IN A  5.183.217.146

; Mail
mail.menschlichkeit-oesterreich.at.    IN A   5.183.217.146
menschlichkeit-oesterreich.at.         IN MX  10 mail.menschlichkeit-oesterreich.at.
webmail.menschlichkeit-oesterreich.at. IN CNAME mail.menschlichkeit-oesterreich.at.

; SPF
menschlichkeit-oesterreich.at. IN TXT "v=spf1 ip4:5.183.217.146 include:_spf.plesk.com -all"

; DMARC
_dmarc.menschlichkeit-oesterreich.at. IN TXT "v=DMARC1; p=quarantine; rua=mailto:security@menschlichkeit-oesterreich.at; ruf=mailto:security@menschlichkeit-oesterreich.at; fo=1; adkim=s; aspf=s; pct=100"

; DKIM (nach Plesk-Konfiguration)
default._domainkey.menschlichkeit-oesterreich.at. IN TXT "v=DKIM1; k=rsa; p=MIIBIjAN..."
```

---

## Sicherheitsbewertung Single-Server-Risiken

| Risiko | Schweregrad | Maßnahme |
|---|---|---|
| Alle Dienste auf einer IP → ein Angriff trifft alles | Kritisch | IP-Whitelist für Panel + Monitoring + n8n |
| Plesk-Panel auf Port 8443 öffentlich erreichbar | Hoch | IP-Whitelist oder VPN |
| Zertifikatsablauf eines Dienstes betrifft alle | Mittel | Automatische Let's Encrypt-Erneuerung prüfen |
| Ressourcen-Streit zwischen Diensten | Mittel | Container-Limits / Plesk-Ressourcenlimits |
| Keine Service-Isolierung bei Kompromittierung | Hoch | Mittelfristig: Container-Isolierung (Docker) |

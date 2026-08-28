# Domain- & Subdomain-Register — Stand 2026-08-28

Erhebungsmethode: DNS-Auflösung + HTTPS-Response-Inspektion von außen.
Kein Plesk- oder SSH-Zugang — Webroots, interne Ports und Reverse-Proxy-Regeln
sind daher `UNKNOWN` und werden hier **nicht** aus dem Repository geraten.

Alle auflösenden Namen zeigen auf **`5.183.217.146`** (nginx, Plesk).

## Register

| FQDN | DNS | HTTP | Was tatsächlich ausgeliefert wird | `last-modified` | Status |
| ---- | --- | ---- | --------------------------------- | --------------- | ------ |
| `menschlichkeit-oesterreich.at` | `5.183.217.146` | 301 | Redirect → `www` | — | `VERIFIED_LIVE` |
| `www.menschlichkeit-oesterreich.at` | `5.183.217.146` | 200 | **React/Vite-Produktionsbuild** (echte Anwendung) | 2026-04-25 | `VERIFIED_LIVE` |
| `crm.menschlichkeit-oesterreich.at` | `5.183.217.146` | 200 | Statische Platzhalterseite („reserviert") | 2026-03-14 | `CONFLICT` |
| `crm.…/native/` | — | **404** | nichts | 2025-06-24 | `CONFLICT` |
| `games.menschlichkeit-oesterreich.at` | `5.183.217.146` | 200 | Statisches HTML (18 KB) | 2026-03-14 | `VERIFIED_LIVE` |
| `forum.menschlichkeit-oesterreich.at` | `5.183.217.146` | 200 | **Plesk-Standardseite** | 2025-10-05 | `CONFLICT` |
| `n8n.menschlichkeit-oesterreich.at` | `5.183.217.146` | 200 | **Plesk-Standardseite** | 2025-10-05 | `CONFLICT` |
| `webmail.menschlichkeit-oesterreich.at` | `5.183.217.146` | — | Plesk-Webmail (nicht weiter geprüft) | — | `VERIFIED_LIVE` |
| `api.menschlichkeit-oesterreich.at` | **NXDOMAIN** | — | **existiert nicht** | — | `CONFLICT` |
| `erp.menschlichkeit-oesterreich.at` | **NXDOMAIN** | — | **existiert nicht** | — | `CONFLICT` |

## Geprüft und nicht vorhanden (NXDOMAIN)

`staging`, `dev`, `test`, `admin`, `api-staging`, `erp-staging`, `crm-staging`,
`shop`, `app`, `portal`, `cloud`, `mail`, `smtp`

→ Es existiert **keine öffentliche Staging-Umgebung**. Die im Repository
angenommene kanonische Staging-URL bleibt `UNKNOWN`.

## Soll-Ist-Abgleich gegen die Deployment-Konfiguration

`deploy-plesk.yml` definiert Zielpfade für fünf Services. Live erreichbar mit
echtem Inhalt ist einer.

| Service | Erwarteter Plesk-Pfad (Workflow) | Erwartete URL | Live-Realität |
| ------- | -------------------------------- | ------------- | ------------- |
| Website | `httpdocs` | `www.…` | ✅ ausgeliefert (Stand 2026-04-25) |
| API | `subdomains/api/httpdocs` | `api.…` | ❌ **DNS-Name existiert nicht** |
| CRM-Portal | `subdomains/crm/httpdocs` | `crm.…` | ❌ Platzhalterseite |
| CRM-Native | `subdomains/crm/httpdocs/native` | `crm.…/native/` | ❌ HTTP 404 |
| Games | `subdomains/games/httpdocs` | `games.…` | ⚠️ statisch, älter als der Website-Build |

## Konsequenzen

1. **Der ins Frontend gebaute API-Endpunkt zeigt ins Leere.**
   `deploy-plesk.yml:140` setzt beim Build
   `VITE_API_URL: 'https://api.${MAIN_DOMAIN}'`. Dieser Name löst nicht auf.
   Jeder API-Aufruf des ausgelieferten Frontends muss fehlschlagen.
   → Ob die Website funktional davon abhängt, ist noch zu prüfen (die
   Startseite rendert; API-gestützte Funktionen wie Spenden wurden nicht
   funktional getestet).

1. **Die Healthchecks der Pipeline hätten das gemeldet.**
   `deploy-plesk.yml:1125` prüft `https://api.${MAIN_DOMAIN}/healthz`. Weil der
   Deploy-Job nie lief (siehe [01-evidence-ledger.md](01-evidence-ledger.md),
   EV-0021/EV-0022), wurde der Healthcheck nie erreicht — der Defekt blieb
   unbemerkt.

1. **`forum.` und `n8n.` sind in Plesk angelegt, aber nie befüllt worden.**
   Beide liefern seit dem 2025-10-05 unverändert die Plesk-Standardseite. Das
   sind reservierte, nicht betriebene Subdomains.

## Offene Punkte

Ohne Plesk-/SSH-Zugang nicht feststellbar und daher **nicht** ausgefüllt:
DNS-Provider und Registrar, Record-Typen (A/AAAA/CNAME), TLS-Zertifikatsaussteller
und Ablaufdaten, HSTS-Konfiguration, tatsächliche Webroots, interne Ports,
Reverse-Proxy-Regeln, Plesk-Subscriptions und Hosting-Settings.

Cloudflare wurde **nicht** nachgewiesen — die Antwortheader zeigen direkt
nginx/Plesk ohne CDN-Marker. Es gibt daher keinen Beleg für ein
vorgeschaltetes CDN.

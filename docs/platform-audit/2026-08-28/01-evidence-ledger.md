# Evidence Ledger — Platform-Audit 2026-08-28

Alle Einträge wurden am 2026-08-28 erhoben. Repository-Basis:
`d1d4454b57cbd3cd23f0c3b6b7a4576e1eb33ed2`.

**Statuswerte:** `VERIFIED_REPO`, `VERIFIED_LIVE`, `VERIFIED_DEPLOYED`,
`VERIFIED_CONFIG`, `INFERRED`, `UNKNOWN`, `CONFLICT`, `LEGACY_CANDIDATE`,
`DEPRECATED_CONFIRMED`.

Ausgehende Verbindungen liefen über den Agent-Proxy dieser Session. Die
Antworten sind echte Upstream-Antworten (nginx-Header, `x-powered-by: PleskLin`,
`etag`, `last-modified`), keine Proxy-Artefakte — der Proxy terminiert TLS,
fälscht aber keine Inhalte.

---

## Live-Evidenz — Erreichbarkeit und Runtime

### EV-0001 · `VERIFIED_LIVE`

**Claim:** Der Produktionshost ist ein Plesk-Server unter `5.183.217.146`.
**Prüfung:** DNS-Auflösung + HTTPS-Response-Header aller erreichbaren Subdomains.
**Ergebnis:** `server: nginx`, `x-powered-by: PleskLin`, `alt-svc: h3=":443"`.
Alle auflösbaren Namen zeigen auf dieselbe IP.

### EV-0002 · `VERIFIED_LIVE`

**Claim:** `www.menschlichkeit-oesterreich.at` liefert einen echten
React/Vite-Produktionsbuild aus.
**Prüfung:** `GET https://www.menschlichkeit-oesterreich.at/`
**Ergebnis:** HTTP 200, `content-length: 1623`,
`last-modified: Sat, 25 Apr 2026 16:06:58 GMT`, `etag: "69ece6a2-657"`.
Body enthält gehashte Vite-Assets (`/assets/index-CfdcUl67.js`,
`vendor-react-DoyxvGH4.js`), `lang="de-AT"`, `theme-color: #D4611E`
(Markenprimärfarbe laut `CLAUDE.md`) und einen SSR-Prerender-Marker
(`<!--app-head:start-->`).
**Bewertung:** Die einzige nachweislich produktiv ausgelieferte Anwendung.

### EV-0003 · `VERIFIED_LIVE` · `CONFLICT`

**Claim:** `api.menschlichkeit-oesterreich.at` existiert **nicht**.
**Prüfung:** `socket.gethostbyname()` + HTTPS-Verbindungsversuch.
**Ergebnis:** `[Errno -2] Name or service not known` (NXDOMAIN). Der Proxy
meldet `connect_rejected` für `api.menschlichkeit-oesterreich.at:443`.
**Konflikt mit:** `deploy-plesk.yml:140` (`VITE_API_URL: https://api.…`),
`deploy-plesk.yml:1125` (Healthcheck gegen `https://api.…/healthz`),
`API_REMOTE_PATH: subdomains/api/httpdocs`.
**Bewertung:** Das FastAPI-Backend ist öffentlich nicht erreichbar. Der ins
Frontend gebaute `VITE_API_URL` zeigt auf einen nicht existierenden Namen.

### EV-0004 · `VERIFIED_LIVE` · `CONFLICT`

**Claim:** `erp.menschlichkeit-oesterreich.at` existiert **nicht**.
**Prüfung:** DNS-Auflösung.
**Ergebnis:** NXDOMAIN.
**Bewertung:** `ACCOUNTING_LIVE_STATUS = DEPRECATED_CONFIRMED` für die
öffentliche URL. ERPNext ist über den dokumentierten Namen nicht in Betrieb.
Ob eine interne Instanz existiert, ist `UNKNOWN` (kein SSH-Zugang).

### EV-0005 · `VERIFIED_LIVE` · `CONFLICT`

**Claim:** `crm.menschlichkeit-oesterreich.at` liefert eine statische
Platzhalterseite, kein Drupal/CiviCRM.
**Prüfung:** `GET /` und `GET /native/`.
**Ergebnis:** `/` → HTTP 200, `content-length: 2131`,
`last-modified: Sat, 14 Mar 2026 21:14:30 GMT`. Body: statisches HTML mit
Inline-CSS, Titel „CRM - Menschlichkeit Österreich", Text „Diese CRM-Subdomain
ist für das Customer Relationship Management System **reserviert**" und einer
Liste „Geplante Funktionen".
`/native/` → **HTTP 404**, `last-modified: Tue, 24 Jun 2025 08:11:49 GMT`.
**Bewertung:** Weder Drupal noch CiviCRM sind unter diesem Namen deployt.

### EV-0006 · `VERIFIED_LIVE` · `CONFLICT`

**Claim:** `forum.menschlichkeit-oesterreich.at` liefert die
**Plesk-Standardseite**.
**Prüfung:** `GET /`.
**Ergebnis:** HTTP 200, `content-length: 464`,
`last-modified: Sun, 05 Oct 2025 11:34:33 GMT`, Body-`<title>`:
`Domain Default page`, `meta copyright: Plesk International GmbH`.
**Bewertung:** phpBB ist nicht deployt. Die Subdomain ist in Plesk angelegt,
aber nie befüllt worden.

### EV-0007 · `VERIFIED_LIVE` · `CONFLICT`

**Claim:** `n8n.menschlichkeit-oesterreich.at` liefert die
**Plesk-Standardseite**.
**Prüfung:** `GET /`.
**Ergebnis:** HTTP 200, `content-length: 464`,
`last-modified: Sun, 05 Oct 2025 11:25:59 GMT`, `<title>Domain Default page</title>`.
**Bewertung:** Unter diesem Namen läuft kein n8n. Die Frage „welche n8n-Instanz
ist kanonisch?" hat damit live die Antwort: **keine der beiden**.

### EV-0008 · `VERIFIED_LIVE`

**Claim:** `games.menschlichkeit-oesterreich.at` liefert statisches HTML.
**Prüfung:** `GET /`.
**Ergebnis:** HTTP 200, `content-length: 18398`,
`last-modified: Sat, 14 Mar 2026 21:14:31 GMT`. Kein Next.js-Runtime-Marker.
**Bewertung:** Statische Seite, älter als der Website-Build. Nicht mit dem
aktuellen `apps/babylon-game`-Build abgeglichen.

### EV-0009 · `VERIFIED_LIVE`

**Claim:** Der Apex leitet auf `www` um.
**Ergebnis:** `GET https://menschlichkeit-oesterreich.at/` → HTTP 301,
`location: https://www.menschlichkeit-oesterreich.at/`.

### EV-0010 · `VERIFIED_LIVE`

**Claim:** Es existiert keine öffentliche Staging-Umgebung unter den
naheliegenden Namen.
**Prüfung:** DNS für `staging`, `dev`, `test`, `admin`, `api-staging`,
`erp-staging`, `crm-staging`, `shop`, `app`, `portal`, `cloud`, `mail`, `smtp`.
**Ergebnis:** Alle NXDOMAIN. Einzig `webmail.menschlichkeit-oesterreich.at`
löst auf `5.183.217.146` auf (Plesk-Webmail).
**Bewertung:** Die kanonische Staging-URL bleibt `UNKNOWN`; öffentlich
existiert keine.

---

## Deployment-Evidenz

### EV-0020 · `VERIFIED_DEPLOYED` (negativ)

**Claim:** Die letzten 30 Produktionsdeployments sind fehlgeschlagen.
**Prüfung:** GitHub Actions API, `deploy-plesk.yml`, Runs 217–246
(2026-05-14 08:30Z bis 2026-05-19 20:58Z).
**Ergebnis:** `conclusion: failure` in allen 30 Läufen. Gesamtzahl Läufe: 246.
**Bewertung:** Kein Push auf `main` seit 2026-05-14 hat Produktionscode
ausgeliefert. Der letzte erfolgreiche Lauf liegt vor diesem Fenster; das passt
zum Live-Stand der Website (`last-modified 2026-04-25`, EV-0002).

### EV-0021 · `VERIFIED_DEPLOYED` (negativ) · P0-001

**Claim:** Der Job `Deploy → Plesk` wartet auf eine Environment-Freigabe und
verfällt nach 30 Tagen.
**Prüfung:** Run 26116930229 (Run 244, `52f8396`), Job-Liste.
**Ergebnis:**

| Job | Conclusion |
| --- | ---------- |
| Validierung & Branch-Schutz | success |
| BSM: Production Secrets laden | success |
| Games bauen (Babylon.js) | success |
| Unit Tests | success |
| Frontend bauen (Vite) | success |
| Preflight (BSM Handoff) | success |
| **Deploy → Plesk** | **failure** |

Der Deploy-Job: `created_at: 2026-05-19T18:27:20Z`,
`completed_at: 2026-06-18T18:27:21Z` — **exakt 30 Tage**, `steps` leer.
Dasselbe Muster in den Runs 236–243 (`updated_at` jeweils 30 Tage nach
`created_at`).
**Zusatzfakt:** `deploy-plesk.yml:376` trägt `environment: production`.
**Bewertung:** `INFERRED` (starke Evidenz) — eine
Environment-Protection-Rule (erforderliche Prüfer bzw. Wait-Timer) hält den
Job, bis GitHub ihn nach 30 Tagen verwirft. Null ausgeführte Steps schließen
einen Laufzeitfehler im Job aus. Endgültige Bestätigung erfordert Lesezugriff
auf *Settings → Environments → production*.

### EV-0022 · `VERIFIED_REPO` · P0-002

**Claim:** `setup-node` bricht ab, weil `apps/website/package-lock.json` fehlt.
**Prüfung:** Run 26124912158 (Run 246, HEAD `d1d4454`), Job-Steps + Dateisystem.
**Ergebnis:**

- Job *Unit Tests* → Step „Node.js einrichten": **failure**; alle Folgesteps `skipped`.
- Job *Frontend bauen (Vite)* → Step „Node.js 22 einrichten": **failure**; Folgesteps `skipped`.
- Job *Games bauen* → identischer Step: **success**.
- Job **`Deploy → Plesk`: `skipped`** — kein Deployversuch.

Unterschied: die beiden fehlschlagenden Jobs setzen
`cache-dependency-path: apps/website/package-lock.json`
(`deploy-plesk.yml:124`, `:220`); der Games-Job setzt keinen Cache
(`deploy-plesk.yml:180-183`).
`ls apps/website/package-lock.json` → **nicht vorhanden**.
`git ls-files | grep package-lock.json` → nur `package-lock.json` (Root),
`figma-design-system/`, `services/plesk-mail-api/`.
**Bewertung:** Eindeutige Ursache-Wirkung-Kette. Kein anderer
`cache-dependency-path` im Repository ist unauflösbar
(`apps/api/requirements.txt` existiert).

### EV-0023 · `VERIFIED_REPO`

**Claim:** Der Lockfile wurde eingeführt und wieder entfernt.
**Prüfung:** `git log --all -- apps/website/package-lock.json`.
**Ergebnis:**

- `23bb0d1` (2026-05-14 08:18 UTC): `+12349` Zeilen — Datei **hinzugefügt**,
  im selben Commit wurde `cache-dependency-path` eingeführt.
- `46dd460` (2026-05-19 19:30 UTC): `-12349` Zeilen — Datei **gelöscht**,
  der Verweis im Workflow blieb stehen.

**Bewertung:** Erklärt, warum P0-002 erst ab Run 245 greift. Die Runs 217–244
scheiterten an P0-001 (EV-0021). **Es sind zwei unabhängige Blocker.**

### EV-0024 · `VERIFIED_REPO`

**Claim:** `apps/website` ist ein npm-Workspace; `npm ci` funktioniert dort
ohne eigenen Lockfile.
**Prüfung:** `jq '.workspaces' package.json` →
`["apps/website", "apps/babylon-game", "mcp-servers/*"]`.
Ausführung: `cd apps/website && npm ci --prefer-offline --ignore-scripts`
→ **exit 0**, „added 857 packages".
**Bewertung:** Nur der Cache-Pfad war falsch, nicht der Install-Schritt. Die
minimale Korrektur ist der Verweis auf den Root-Lockfile.

---

## Security- und Konfigurationsevidenz

### EV-0030 · `VERIFIED_REPO` · P0-003

**Claim:** Drupal fiel auf einen im Repository sichtbaren `hash_salt` zurück.
**Quelle:** `apps/crm/web/sites/default/settings.php:30` (vor der Korrektur):

```php
$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: 'MenschlichkeitOesterreich2024PleaseChangeInProd';
```

**Bewertung:** Der `hash_salt` schützt Session-, CSRF- und
One-Time-Login-Token. Ein öffentlich im Repository lesbarer Wert ist wertlos.
Zusätzlich fiel `DRUPAL_DB_PASS` auf `''` zurück (`:20`).
**Status:** `FIXED_REPO` — siehe [18-implementation-log.md](18-implementation-log.md).

### EV-0031 · `VERIFIED_REPO` · P1-001

**Claim:** Der Stripe-Webhook schreibt Geschäftsdaten **vor** der
Event-Persistenz.
**Quelle:** `apps/api/app/routers/payments.py:104-201`.
**Ablauf laut Code:**

1. `:112` Signaturprüfung
1. `:127` Idempotenz-Vorprüfung gegen `webhook_events`
1. `:139-150` **Geschäftslogik** (`record_successful_donation`)
1. `:195` **erst danach** `record_webhook_event`

Der Code kommentiert das selbst: *„Schritt 2: Webhook als verarbeitet
markieren (erst nach erfolgreicher Geschäftslogik)"* (`:194`).
**Fehlermodus:** Schlägt Schritt 4 fehl (DB-Fehler, Timeout, Prozessabbruch),
während Schritt 3 bereits committet ist, findet die Vorprüfung beim
Stripe-Retry nichts — **die Spende wird ein zweites Mal gebucht**.
**Bewertung:** Das ist kein Inbox-Muster. Die Bestätigung der
Masterprompt-Hypothese ist damit `VERIFIED_REPO`.

### EV-0032 · `VERIFIED_REPO` · P1-002

**Claim:** Spender-E-Mail und Payment-Intent-ID gehen an Slack.
**Quelle:** `apps/api/app/routers/payments.py:61-74`:

```python
slack_text = (
    f"🚨 *Payment Failure Alert*\n"
    f"• Event: `{event_type}`\n"
    f"• Amount: `{amount:.2f} {currency}`\n"
    f"• Donor: `{donor_email or '-'}`\n"
    f"• Intent: `{gateway_intent_id or '-'}`"
)
```

Aufgerufen bei jedem `payment_intent.payment_failed` (`:168-174`).
**Bewertung:** Personenbezogene Daten verlassen bei jedem fehlgeschlagenen
Zahlungsversuch die Plattform Richtung Slack. Kollidiert mit der
DSGVO-Regel aus `CLAUDE.md` („Keine PII in Logs").

### EV-0033 · `VERIFIED_REPO` · P1-003

**Claim:** `donation_type` ist hartkodiert; `purpose` wird als `source` benutzt.
**Quelle:** `apps/api/app/routers/payments.py:147-148`:

```python
donation_type="one_time",
source=obj.get("metadata", {}).get("purpose") or "Stripe",
```

**Bewertung:** Jede erfolgreiche Zahlung wird als Einmalspende verbucht,
unabhängig vom tatsächlichen Sachverhalt. Zweck (`purpose`, wofür gespendet
wurde) und Quelle (`source`, woher die Spende kam) sind fachlich verschiedene
Konzepte und werden in dasselbe Feld geschrieben.

### EV-0034 · `VERIFIED_REPO` · P2-001

**Claim:** Es existieren zwei parallele n8n-Betriebsverträge.
**Quelle:**

| Aspekt | `docker-compose.yml` (Root) | `automation/n8n/docker-compose.yml` |
| ------ | --------------------------- | ----------------------------------- |
| n8n | `n8nio/n8n:1.72.1` | `n8nio/n8n:1.72.1` (`moe-n8n`) |
| PostgreSQL | `postgres:16-alpine`, geteilt mit phpBB | `postgres:15-alpine`, dediziert (`moe-n8n-postgres`, DB `n8n`) |
| Redis | `redis:7-alpine`, geteilt | `redis:7-alpine`, dediziert (`moe-n8n-redis`) |
| Passwort-Handling | `POSTGRES_PASSWORD: postgres` (hartkodiert) | `${N8N_DB_PASSWORD:?…}` (fail-closed) |

**Bewertung:** Architekturdrift bestätigt. **Aber:** live läuft laut EV-0007
unter `n8n.…` überhaupt kein n8n. Die Konsolidierungsfrage ist damit derzeit
theoretisch — sie ist zu beantworten, *bevor* eine Instanz in Betrieb geht.

### EV-0035 · `VERIFIED_REPO` · P2-002

**Claim:** Unsichere Default-Credentials in Compose-Dateien.
**Quelle:**

- `docker-compose.yml:11` — `POSTGRES_PASSWORD: postgres` (hartkodiert, keine
  Env-Indirektion)
- `docker-compose.yml:53,132,135` — `${PHPBB_DB_PASSWORD:-phpbb_dev}`
- `automation/elk-stack/docker-compose.yml:25,59,90,194` —
  `${ELASTIC_PASSWORD:-changeme}`

**Bewertung:** Für lokale Entwicklung vertretbar; als Fallback jedoch
fail-open — bei fehlender Env-Variable startet der Stack mit bekanntem Passwort
statt abzubrechen.

### EV-0036 · `VERIFIED_REPO` — Korrektur der Ausgangshypothese

**Claim des Masterprompts:** `automation/n8n` enthalte
`N8N_BASIC_AUTH_PASSWORD=admin123`.
**Prüfung:** `grep` über alle getrackten Dateien.
**Ergebnis:** **Nicht (mehr) vorhanden.** Der aktuelle Stand nutzt
`automation/n8n/docker-compose.yml:15`:
`N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:?N8N_PASSWORD muss in .env gesetzt sein}`
— ein fail-closed-Muster. `automation/n8n/.env.example` verwendet durchgehend
`CHANGE_ME_`-Platzhalter.
**Bewertung:** Die Hypothese ist an dieser Stelle **veraltet**; das Repository
ist hier besser als angenommen. Festgehalten, damit der Befund nicht
fälschlich weitergetragen wird.

---

## Capability-Evidenz (Grenzen dieses Audits)

### EV-0040 · `VERIFIED_LIVE`

**Claim:** Für Runtime-, Datenbank- und Plesk-Verifikation fehlen die Werkzeuge.
**Prüfung:** Preflight in der Auditumgebung.
**Vorhanden:** `git`, `docker`, `psql`, `redis-cli`, `node`, `npm`, `python3`,
`php`, `composer`, `jq`, `yq`, `curl`.
**Fehlend:** `ssh`, `plesk`, `bw` (Bitwarden CLI), `mysql`/`mariadb`, `drush`,
`gh`, `rsync`.
**Bewertung:** `PLESK_LIVE_STATUS` bleibt `UNKNOWN`. Alle Aussagen über
Runtime-Prozesse, Datenbankschemata, Backups und Secret-Inhalte wären ohne
diese Zugänge Spekulation und werden deshalb **nicht** getroffen. Siehe
[99-open-verification-gaps.md](99-open-verification-gaps.md).

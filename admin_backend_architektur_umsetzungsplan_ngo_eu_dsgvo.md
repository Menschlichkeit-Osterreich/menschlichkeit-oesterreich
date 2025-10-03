# Admin-Backend – Architektur & Umsetzungsplan (NGO, EU/DSGVO)

**Ziel:** Zentrales, DSGVO-konformes Admin-Backend für alle Domains/Services des Repos *menschlichkeit-oesterreich-dev*: Nutzer- & Mitgliederverwaltung, Forum-Moderation, CI-Monitoring, Content, Logs & Analytics, Rollenrechte, Buchhaltung, Newsletter, Social Sharing, Community-Management, Beitragsverwaltung, n8n-Automatisierung, Mitgliederabstimmungen.

**Leitprinzipien:** EU-Hosting, Single Sign-On (OIDC), API-first, Modularität, „Ops-light“ Start (Docker Compose) → „Ops-pro“ (Kubernetes), vollständige Auditierbarkeit.

---

## 1) Executive Summary (Empfohlene Ziel-Architektur)

- **Identity & RBAC:** *Keycloak* (OIDC) als Single Sign-On für alle Module (Scopes/Rollen je Domäne).
- **Admin-Datenebene & Headless CMS:** *Directus* (auf Postgres) als **Control Plane** (Mitglieder, Beiträge, Content, Rollen-Mapping, Webhooks zu n8n).
- **Forum:** *Discourse* (EU self-host) mit OIDC; Moderations-Panel im Admin-Portal verlinkt + API-Widgets (unbeantwortete Threads, Flag-Queue).
- **Automatisierung:** *n8n* (EU self-host) als Orchestrator (Mitgliedsanträge, Beitragsläufe, Newsletter-Sync, Social Posts, CI-Events → Alerts).
- **Analytics (datenschutzfreundlich):** *Matomo* (cookielos möglich) + Server-Logs (Loki/Grafana) + Audit-Trail (Directus Activity + DB-Append-Log).
- **Newsletter:** *Listmonk* (EU self-host) – OIDC & Double-Opt-in; Sync via n8n.
- **Buchhaltung & Beiträge:** Phase 1: **CSV/DATEV/SEPA-XML Export** aus Directus; Phase 2: Integration **ERPNext** (EU-VM) **oder** GoCardless/Stripe SEPA (mit AVV) via n8n.
- **Abstimmungen:** Zwei Pfade – **leicht:** Directus „Polls“-Modul (nicht geheim), **sicher/verifizierbar:** *Decidim* oder *Helios* (OIDC), eingebettet ins Admin-Portal.
- **Admin-Portal-UI:** *Next.js/React* als einheitliche Oberfläche („Launcher“) mit SSO-geschützten Kacheln, eingebetteten Widgets (CI-Status, offene Flags, Metriken) und Deep-Links zu Spezial-UIs.

---

## 2) Funktions-Mapping (Modul → System)

| Funktion                     | Primärsystem                           | Ergänzung/Integration                                                 |
| ---------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Nutzer- & Rollenverwaltung   | Keycloak                               | Rollen-Spiegelung in Directus (Policy-Tabellen), OIDC in alle Dienste |
| Mitgliederverwaltung         | Directus (Collections)                 | n8n-Flows (Onboarding, KYC light), SEPA/CSV-Export                    |
| Beitragsverwaltung           | Directus                               | n8n SEPA-XML, ERPNext/Stripe/GoCardless Connector                     |
| Forum-Moderation             | Discourse                              | Admin-Portal Widgets (Flags, unbeantwortet), Webhooks → n8n Alerts    |
| CI-Monitoring                | GitHub API                             | Dashboard-Widget (Builds, Failed Jobs), Webhooks → n8n                |
| Inhaltsverwaltung (Web/Docs) | Directus Headless                      | Static Site (Docusaurus/Next) zieht Content via API                   |
| Logs & Analytics             | Loki + Grafana, Matomo                 | Alerting (Grafana), cookielos/Consent                                 |
| Newsletter                   | Listmonk                               | n8n Sync mit Mitgliedern/Segmenten, Double-Opt-in                     |
| Social Media Mgmt            | n8n + Connectors                       | Mastodon, Facebook/Instagram (Graph API), LinkedIn (AVV prüfen)       |
| Community-Management         | Directus + Discourse                   | Good-first-Issues (GitHub) als Tasks, Mentor-Zuordnung                |
| API-Automatisierung          | n8n                                    | Webhooks aus Directus/Discourse/GitHub                                |
| Mitglieder-Abstimmungen      | Decidim/Helios **oder** Directus Polls | OIDC, Ergebnis-Export, Protokoll                                      |

---

## 3) Tool-Vergleich (Kurz)

| Kriterium                                                                                                                                                           | Directus              | Strapi            | Appwrite         | Budibase         | React Admin (+Hasura) | Django Admin   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------- | ---------------- | ---------------- | --------------------- | -------------- |
| Lizenz/OSS                                                                                                                                                          | OSS                   | OSS (Community)   | OSS              | OSS              | OSS                   | OSS            |
| Datenmodell                                                                                                                                                         | DB=Source (SQL-first) | Code-first/Schema | BaaS (NoSQL/SQL) | Low-code         | GraphQL/SQL           | Python ORM     |
| Admin-UI                                                                                                                                                            | Out-of-the-box        | Out-of-the-box    | Konsole          | Low-code Builder | Build-it-yourself     | Out-of-the-box |
| API-first                                                                                                                                                           | ✓ (REST/GraphQL)      | ✓                 | ✓                | teils            | ✓                     | teils          |
| Erweiterbarkeit                                                                                                                                                     | Hooks/Flows/Ext       | Plugins           | Functions        | Plugins          | Voll flexibel         | Django Apps    |
| Lernkurve Ops                                                                                                                                                       | niedrig               | mittel            | mittel           | niedrig          | hoch                  | mittel         |
| Fit für Control-Plane                                                                                                                                               | **stark**             | stark             | mittel           | mittel           | **stark (custom)**    | mittel         |
| **Empfehlung:** Start **Directus** für Tempo & Governance; „Custom“ Flächen (z. B. Voting-Logic) ggf. als Microservice (Node/NestJS) + React Admin später ergänzen. |                       |                   |                  |                  |                       |                |

---

## 4) Domänenmodell (Kern)

**Mitglieder** `(member)` → Felder: id, status, vorname, nachname, email, anschrift, land, rolle, eintrittsdatum, gruppe\_id, einwilligungen{newsletter, satzung}, notizen.\
**Gruppen/Orte** `(group)` → id, name, typ{AG, Region}, verantwortliche[].\
**Beitragssätze** `(dues_plan)` → id, name, betrag, periodizität{monat, jahr}, ermäßigt?.\
**Beiträge** `(dues_payment)` → id, member\_id, plan\_id, periode, betrag, zahlart{sepa, bar, überweisung}, status{offen, gebucht, fehlgeschlagen}, beleg\_url.\
**Abstimmung** `(vote)` → id, titel, beschreibung, modus{offen, geheim}, start, ende, wahlrecht\_query, ergebnis\_json, audit\_hash.\
**Newsletter** `(newsletter_sub)` → member\_id, list\_id, status, consent\_ts, source.\
**Community** `(forum_link)` → member\_id, discourse\_username, trust\_level, letzte\_aktivität.\
**CI** `(ci_run)` → id, repo, workflow, status, dauer, sha, url.\
**Audit** `(audit_log)` → id, actor, entity, action, diff, ts, ip\_hash.

> Alle Collections mit **Row-Level Security** (RLS) und **Soft-Delete + Audit**. Export/Report-Views (SQL) für Steuerberater.

---

## 5) Sicherheits- & Datenschutzkonzept

- **SSO & MFA:** Keycloak (OIDC, Gruppen=Rollen). Admin-Portal nutzt Access Token, Services prüfen „realm roles“/„client roles“.
- **Rollenmatrix:** `admin`, `moderator`, `community_manager`, `finance`, `content_editor`, `ops`, `viewer`.
- **RLS & Scoping:** Directus Policies (z. B. `finance` nur Finanz-Collections; `moderator` nur Forum/Community Tabs).
- **Audit-Trail:** Alle Mutationen protokollieren (user, timestamp, diff, ip\_hash). WORM-Export monatlich in EU-Object-Storage.
- **Datenminimierung:** Pflichtfelder eng; Lösch-/Sperrkonzept (Inaktivität 24 Monate).
- **Verschlüsselung:** TLS 1.3; At-Rest: DB-Volume Encryption; Secrets via **SOPS** (Age) oder **Vault**.
- **DPIA/Verzeichnis:** Vorlagen + Prozesse (siehe Hauptdokument) anwenden.

---

## 6) Admin-Portal (Next.js) – UI & Navigation

- **Layout:** Seitenleiste (Module), Topbar (Suche, Nutzer, Umgebungswahlschalter).
- **Kacheln:** Mitglieder, Beiträge, Forum, Newsletter, CI, Content, Logs, Analytics, Automationen, Abstimmungen, Einstellungen.
- **Widgets (Startseite):**
  - „Offene Flags“ (Discourse), „Unbeantwortete Threads <48h“,
  - „Fehlgeschlagene CI-Jobs (24h)“,
  - „Neue Mitgliedsanträge (7d)“,
  - „Fällige Beiträge (Monat)“,
  - „Newsletter-Kampagnen heute“.
- **Einbettung:**
  - Direkte Komponenten (Mitglieder-Grid) via Directus SDK,
  - Discourse-Moderationslinks (deep-link),
  - Matomo Charts (Reporting API),
  - GitHub CI Status (REST/GraphQL),
  - n8n Flow-Trigger.

---

## 7) Integrationen (technische Skizzen)

**Directus ⇄ n8n**: Webhook bei `member.status=approved` → Flow:

1. Listmonk subscribe, 2) Discourse-Invite, 3) Willkommensmail, 4) Issue in „Mentoring“ Board.\
   **Beiträge/SEPA:** Cron (n8n) generiert `pain.008` (SEPA Lastschrift) aus offenen Forderungen → Banking/Payment-Provider.\
   **CI-Monitoring:** GitHub Webhook → n8n → schreibe `ci_run` + sende Alert in Admin-Portal/Matrix.\
   **Abstimmung:** Admin-Portal erstellt Vote in Decidim/Helios; Webhook speichert Ergebnis-Snapshot (Signatur/Hash) in `vote.ergebnis_json`.

---

## 8) Deployment & Ops

**Phase 1 – Docker Compose (Schnellstart EU-VM):**

- Dienste: Keycloak, Directus, Postgres, Discourse (+Redis, Postgres), n8n, Matomo, Listmonk, Loki+Promtail+Grafana, Traefik/Nginx.
- Backups: tägliche Dumps (DBs) + Offsite EU Object-Storage (verschlüsselt).
- Metriken/Logs: Prometheus/Grafana; Alerting per E-Mail/Matrix.

**Phase 2 – Kubernetes (K3s/RKE2):**

- Namespaces je Domäne (idp, control, forum, ops, analytics).
- Ingress (Traefik/NGINX), Cert-Manager, ExternalDNS.
- GitOps (ArgoCD/Flux).
- Secrets: External Secrets Operator + SOPS/Vault.

---

## 9) CI/CD & Monitoring

- **GitHub Actions:** Lint/Test; Security (Semgrep/Gitleaks/CodeQL); Build/Push Images; Healthchecks (Cron ping).
- **Release-Bots:** Foren-Announcements, Newsletter-Entwurf erzeugen, Changelog in Portal verlinken.
- **Dashboards:** Grafana Board „NGO Ops“ (CI-Fails, Forum-OpenFlags, Matomo Visits, Beiträge offen, Mitglieder-Trichter).

---

## 10) Mitgliederabstimmungen – Varianten

- **Variante A (einfach, offen):** Directus-Polls (nicht anonym). Protokoll + Export CSV.
- **Variante B (geheim, verifizierbar):** Helios/Decidim. OIDC Login; Wahlrecht via Mitgliedsstatus. Public Audit (Hash/Belege).
- **Governance:** Wahlordnung (Quorum, Fristen, Einsprüche), Archivierung.

---

## 11) Roadmap (12–16 Wochen)

**W1–2:** Infra-Basis (Keycloak, Directus, Postgres, n8n), SSO, RBAC, Backups.\
**W3–4:** Discourse EU, Matomo, Listmonk; Directus Collections (Mitglieder/Beiträge); Admin-Portal Skeleton.\
**W5–6:** n8n-Flows (Onboarding, SEPA-Export, Newsletter-Sync), CI-Widgets, Logs (Loki/Grafana).\
**W7–8:** Content via Directus, Forum-Widgets, Community-Boards, DSGVO-Policies live.\
**W9–10:** Abstimmungsmodul (A), Pilot (50–150 Nutzer), Lasttests.\
**W11–12:** Zahlungs-/ERP-Integration (optional), Rollout, KPI-Review.\
**W13–16:** Variante B (Helios/Decidim), K8s-Migration, Feinheiten.

---

## 12) Copilot-Briefing (Dateien & Prompts)

**/docs/GOAL\_ADMIN.md** – *„Erzeuge Next.js Admin-Portal mit OIDC-Guard, Module/Sidebar, Widgets (CI, Forum, Members). Direkte Directus SDK Nutzung; GitHub GraphQL für CI; Matomo Reporting API Charts; n8n Webhook-Trigger.“*

**Kommentar-Prompts (Beispiele):**

```ts
// Aufgabe: OIDC Guard (Next.js middleware) gegen Keycloak
// - Tokenprüfung (RS256 JWKS), Rollen-Mapping, Route-Guards
// - Unit-Tests (Jest), E2E Smoke (Playwright)
```

```ts
// Aufgabe: MembersGrid Komponente
// - Paginierte Tabelle (Directus SDK)
// - Filter: status, gruppe, beitragsstatus
// - Aktionen: Approve, Beitrag anlegen, Newsletter-Sync (n8n call)
```

```ts
// Aufgabe: CI Widget (GitHub GraphQL)
// - Zeige letzte 10 fehlgeschlagene Runs + Links
// - Badge-Status-Rechner, Warnungen wenn >3 Fails/24h
```

```ts
// Aufgabe: Forum Flags Widget (Discourse API)
// - Liste offene Flags, Aktion: assign/moderate (deeplink)
```

---

## 13) Beispiel-Stacks & Snippets

**Docker Compose (Ausschnitt):**

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:24
    command: start --http-enabled=true --hostname-strict=false
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASS}
    ports: ["8080:8080"]
  directus:
    image: directus/directus:latest
    environment:
      KEY: ${DIRECTUS_KEY}
      SECRET: ${DIRECTUS_SECRET}
      DB_CLIENT: pg
      DB_HOST: db
      DB_DATABASE: moe
      DB_USER: moe
      DB_PASSWORD: ${DB_PASS}
      AUTH_PUBLIC_KEY: ${OIDC_PUB}
    depends_on: [db]
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_HOST=n8n.example.org
      - N8N_PROTOCOL=https
    ports: ["5678:5678"]
  matomo:
    image: matomo:latest
  listmonk:
    image: listmonk/listmonk:latest
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=moe
      - POSTGRES_PASSWORD=${DB_PASS}
```

**Directus Policy (Pseudo-SQL):**

```sql
-- Beispiel: finance darf nur dues_* sehen
CREATE POLICY p_finance ON dues_payment
  FOR SELECT TO role_finance USING (true);
```

---

## 14) Risiken & Gegenmaßnahmen

- **Komplexität/Tool-Sprawl:** Start mit „Core 6“ (Keycloak, Directus, Postgres, n8n, Discourse, Matomo); Newsletter & ERP nachziehen.
- **DSGVO/AVV:** Nur EU-Hoster; AV-Verträge prüfen; Consent-Management früh.
- **Rollenflut:** Klare RBAC-Matrix, regelmäßige Review (vierteljährlich).
- **Betriebslast:** Monitoring/Backups automatisieren; Managed-Optionen evaluieren (nur EU).

---

## 15) Definition of Done (Admin-Backend)

- SSO aktiv (Keycloak), RBAC wirksam (least privilege).
- Directus Collections & Policies produktiv, Audit-Trail aktiv.
- Admin-Portal erreichbar, Widgets CI/Forum/Mitglieder sichtbar.
- n8n Flows laufen (Onboarding, SEPA-Export, Newsletter-Sync).
- Matomo & Logs (Loki/Grafana) sichtbar, Alarme definiert.
- DSGVO: Privacy-Policy, DPIA, Verzeichnis, Backups & Löschprozesse.

---

**Nächste Schritte (konkret):**

1. Core 6 via Compose hochziehen (EU-VM), Domains + TLS.
2. Keycloak Realm + Clients (directus, admin-portal, discourse, n8n, listmonk) anlegen.
3. Directus Schema importieren (Members/Dues/Newsletter/Votes) + Policies.
4. Admin-Portal (Next.js) Scaffold + OIDC-Guard + 3 Widgets (CI, Flags, Members).
5. n8n Flows: Onboarding → Newsletter/Forum; SEPA-Export; CI Alerts.
6. Matomo einrichten (cookielos), Loki/Grafana für Logs, Alerts.
7. Pilot (50–150 Nutzer), Retrospektive, härten & iterieren.



---

## 16) Multi‑Domain & Mandantenfähigkeit

**Ziel:** Alle Domains/Projekte zentral verwalten (z. B. `menschlichkeit-oesterreich.at`, `forum.menschlichkeit-oesterreich.at`, `docs.menschlichkeit-oesterreich.at`, `admin.menschlichkeit-oesterreich.at`, regionale/AG‑Subdomains). **Ansatz:** *Organisation → Projekte → Sites* als Hierarchie; jede Entität trägt `org_id`.

**Schema‑Erweiterungen:**

- `org`(id, name, rechtsform, land, dpo\_contact, billing\_info)
- `project`(id, org\_id, name, repo, env{prod,stage,dev})
- `site`(id, project\_id, domain, type{web,forum,docs,admin}, status, matomo\_site\_id, **primary**{true,false})
- **Hauptdomain:** `menschlichkeit-oesterreich.at` (Flag `primary=true`)
- Alle Kern‑Collections erhalten `org_id` + **RLS**: *Nutzer darf nur Datensätze seiner **`org_id`** sehen/bearbeiten*.

**DNS & TLS:** *ExternalDNS* (K8s) oder Traefik mit ACME; Domains/Certs in `site` dokumentiert.\
**Branding pro Mandant:** Directus „Theme“-Tabelle (`theme` → Farben, Logo, DSGVO‑Texte) + Portal zeigt je `org_id` passendes Branding.

---

## 17) RBAC‑Matrix (feingranular)

| Rolle                  | Mitglieder | Beiträge | Forum    | CI | Content | Newsletter | Finance | Automationen | Abstimmungen | Ops |
| ---------------------- | ---------- | -------- | -------- | -- | ------- | ---------- | ------- | ------------ | ------------ | --- |
| **admin**              | RW         | RW       | RW       | R  | RW      | RW         | RW      | RW           | RW           | RW  |
| **moderator**          | R          | –        | RW (Mod) | –  | R       | –          | –       | –            | R            | –   |
| **community\_manager** | RW         | –        | R        | –  | R       | RW         | –       | R            | R            | –   |
| **finance**            | R          | RW       | –        | –  | –       | –          | RW      | –            | –            | –   |
| **content\_editor**    | R          | –        | –        | –  | RW      | –          | –       | –            | –            | –   |
| **ops**                | R          | R        | R        | RW | R       | –          | –       | RW           | –            | RW  |
| **viewer**             | R          | –        | R        | R  | R       | –          | –       | –            | –            | –   |

> Durchsetzen via Keycloak (realm/client roles) + Directus Policies (RLS); Portal blendet Funktionen je Rolle aus.

---

## 18) Datenschutz by Design (konkret)

- **Minimierung:** Pflichtfelder nur E‑Mail & für Beiträge nötige Felder; optionale Profildaten getrennt und separat consent‑basiert.
- **Pseudonymisierung:** IPs nur als Hash (salted) speichern; Matomo mit `anonymizeIp=2` und **cookielos**.
- **Speicherfristen:** Log‑Rotation 90 Tage; Inaktive Mitglieder nach 24 Monaten Erinnerung → Archiv/Löschung.
- **Datenexport:** Directus Flow „DSAR Export“ (JSON/CSV + PDF Deckblatt).
- **Auftragsverarbeitung:** AVV + TOMs dokumentiert je Dienst; Subprozessorenliste gepflegt.

---

## 19) SLO/SLI, DR & Runbooks

- **SLIs:** Forum Median‑Antwortzeit < 24 h; Admin‑Portal P95‑Latenz < 400 ms; CI‑Events → Alert < 2 min; Newsletter Bounce‑Rate < 2 %.
- **SLOs:** Uptime (Portal/Forum) ≥ 99.5 %; Fehlerbudget monatlich 0.5 %.
- **Backups:** Täglich (DB/Configs), 30–90 Tage Aufbewahrung, **monatlicher Restore‑Test**.
- **DR‑Ziele:** RPO ≤ 24 h, RTO ≤ 4 h (Single‑Region EU).
- **Runbooks:** Incident‑Severities (SEV1–SEV3), Eskalationsmatrix, Kommunikationsvorlagen (intern/extern), Statuspage‑Update.

---

## 20) Eventing, API‑Gateway & Datenfluss

- **Gateway:** Traefik/NGINX Ingress mit OIDC Plugin; Rate‑Limits & WAF‑Regeln.
- **Event‑Bus:** *NATS* (leichtgewichtig) oder *Redpanda/Kafka* (bei höherem Durchsatz).
- **Beispiele:** `member.created` → n8n → listmonk.subscribe + discourse.invite; `dues.charge_requested` → SEPA Flow; `ci.run_failed` → Alert + Issue.

```yaml
# Beispiel NATS Subject Namenskonvention
member.*
member.created
member.updated
finance.dues.charge_requested
ci.run.failed
```

---

## 21) Finanzen: SEPA/DATEV & Österreich‑Praxis

- **Validierung:** IBAN‑Check (Mod97), BIC Optional; Einzugsermächtigung (Mandatsreferenz) speichern.
- **Exports:** `pain.008` (SEPA Lastschrift) & `pain.001` (Überweisungen); **DATEV‑CSV** für Steuerberater (alternativ BMD‑CSV).
- **Belege:** PDF‑Beitragsquittung pro Zahlung; jährliche Sammelbestätigung.
- **Zahlungsdienst:** GoCardless/Stripe SEPA möglich (mit AVV, EU‑Rechenzentrum).
- **Kontenplan:** einfache FiBu‑Kontierung (SKR03/AT äquivalent) in Export‑Mappingtabelle.

---

## 22) Logs & Analytics (Privacy‑Default)

- **Loki/Promtail:** strukturierte JSON‑Logs (request\_id, actor\_id, org\_id);
- **PII‑Hygiene:** keine Roh‑IPs, keine vollen Tokens im Log; Masking‑Middleware.
- **Matomo:** cookielos, DNT respektieren, IP 2‑Byte anonymisieren, Consent‑Modus optional; `site` → `matomo_site_id`.
- **KPIs Dashboard (Grafana):** MAU, aktive Mitglieder, beantwortete Forum‑Threads, CI‑Fehler/Tag, offene Beitragsforderungen, Newsletter CTR.

---

## 23) Admin‑Portal: Code‑Snippets

**Next.js Middleware (OIDC Guard, stark vereinfacht):**

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { importJWK, jwtVerify } from 'jose';
const JWKS = JSON.parse(process.env.OIDC_JWKS!);
const PUBLIC_PATHS = [/^\/login/, /^\/public/];
export async function middleware(req: NextRequest) {
  if (PUBLIC_PATHS.some((r) => r.test(req.nextUrl.pathname))) return NextResponse.next();
  const token = req.cookies.get('id_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  const key = await importJWK(JWKS.keys[0], 'RS256');
  const { payload } = await jwtVerify(token, key, { issuer: process.env.OIDC_ISSUER, audience: process.env.OIDC_CLIENT_ID });
  // RBAC Beispiel: nur finance darf /finance/*
  if (req.nextUrl.pathname.startsWith('/finance') && !payload.realm_access?.roles?.includes('finance')) {
    return new NextResponse('forbidden', { status: 403 });
  }
  return NextResponse.next();
}
```

**GitHub GraphQL – fehlgeschlagene Runs:**

```graphql
query LastFailedRuns($owner:String!, $name:String!) {
  repository(owner:$owner, name:$name) {
    actions { workflows(first: 10) { nodes { name } } }
    defaultBranchRef { name }
  }
}
```

**Postgres RLS einschalten (Beispiel):**

```sql
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_scope ON member
  USING (org_id = current_setting('app.current_org')::uuid);
```

---

## 24) IaC & Secrets

- **Terraform**: DNS, VMs, Buckets, LB; **Helm** Charts für Keycloak/Directus/Discourse/n8n/Matomo.
- **Secrets‑Pfad:** SOPS (age) oder Vault; GitHub OIDC → Cloud‑IAM (kurzlebige Credentials).
- **Environments:** `dev/stage/prod` mit getrennten Projekten & Keys; Promotion via GitOps.

---

## 25) n8n – Governance & Qualität

- **Versionierung:** Flows als JSON im Repo; Release über PR; prod‑Promotion via GitOps.
- **Secrets:** in n8n‑Credentials, nicht in Flows; Zugriff nur `ops`.
- **Resilienz:** Retry/Dead‑Letter; Rate‑Limits bei Social/Newsletter APIs; Alarme bei Fehlern.
- **Beispiel‑Flow (Pseudo):** `member.approved` → listmonk.upsert → discourse.invite → sendgrid.welcome → grafana.annotate.

---

## 26) Accessibility, i18n & Content‑Modelle

- **WCAG 2.2 AA** in Portal‑UI; Tastatur‑Bedienbarkeit, Kontrasttests, ARIA.
- **Mehrsprachigkeit:** Entities `content_page` mit `translations[]` (slug, lang, body).
- **Asset‑Policy:** Bilder als WebP/AVIF; Alt‑Texte Pflicht; Lizenzfeld.

---

## 27) Kostenrahmen (Hausnummern, self‑host EU‑VM)

- 1× VM 8 GB/4vCPU + 200 GB SSD (\~€25–40/Monat) für Core 6 (klein)
-
  - VM für Discourse (4 GB/2vCPU, €10–20)
- Backups/Object‑Storage (€5–10)
- Domains/TLS: €10–30/Jahr pro Domain

> Managed Optionen variieren – bei Bedarf Anbieter mit AVV/EU‑Region wählen.

---

## 28) Prüf‑ & Abnahmecheckliste (Go‑Live)

-

---

## 29) Migrations‑ & Exit‑Strategie

- **Forum:** Discourse Export (JSON) → Import in andere Systeme möglich.
- **Datenebene:** SQL‑First (Directus) → jederzeit ohne Vendor‑Lock extrahierbar.
- **Payments:** SEPA/CSV unabhängig von Provider; Mappingtabellen dokumentieren.
- **Blue/Green Cutover:** Für Portal und API über Versionierte Routen.

---

## 30) Copilot – zusätzliche Prompts

```md
// Aufgabe: Directus SDK Hook für DSAR Export (ZIP mit JSON+PDF)
// Aufgabe: n8n Connector Wrapper (TypeScript) mit Retries & Exponential Backoff
// Aufgabe: SEPA pain.008 Generator (TypeScript) + XSD Validierung
// Aufgabe: Matomo Reporting Client (cookielos) + Chart Komponente
// Aufgabe: RLS‑Test‑Suite: Versuche auf fremde org_id müssen 403 liefern
```

**Damit ist das Admin‑Backend maximal konkretisiert: multi‑tenant, DSGVO‑hart, betriebssicher – mit klaren Code‑Einstiegspunkten und Abnahme‑kriterien.**


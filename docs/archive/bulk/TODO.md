# TODO – 60‑Tage‑Programm (Copilot‑optimiert)

> **Zweck:** Diese Datei dient als zentrale, _Copilot‑freundliche_ Aufgabenliste.  
> **Arbeitsweise:** Jede Aufgabe enthält klare **Akzeptanzkriterien**, **Pfade/Kommandos**, **Labels**, **Schätzung** und **Fälligkeitsdatum**.  
> **Nutzung mit Copilot:** Kopiere einzelne Aufgaben in **Issues** oder benutze sie direkt in **Pull‑Requests** (Kommentar: `@copilot help`), inkl. Datei‑ und Funktionsverweisen.

---

## 🔒 Definitionen & Qualitätsziele (DoR/DoD)

**Definition of Ready (DoR)**  
- Ziel & Scope klar, betroffene Dateien/Pfade benannt  
- Akzeptanzkriterien messbar  
- Abhängigkeiten & Risiken benannt  
- Teststrategie vorhanden (Unit/E2E/Contract)

**Definition of Done (DoD)**  
- `npm run typecheck && npm run lint && npm test` grün  
- E2E/Contract‑Tests für neue/angepasste Flows grün (falls relevant)  
- Security/Quality Gates grün: **CSP**, **Rate‑Limit**, **Codacy/CodeQL/ESLint**, **Secrets‑Scan**  
- Dokumentation/Changelog aktualisiert, **PR mit Review** gemerged

**Quality Gates (Mindestwerte)**  
- Lighthouse Performance ≥ **90**, FCP (mobil) **< 3s**  
- Test Coverage Backend ≥ **80%**, Frontend ≥ **70%**  
- Lint‑Fehler **0**, TypeScript **0** Fehler

---

## ⚙️ Projekt‑Grundlagen (einmalig, „Meta“)

- [ ] **Branch‑Schutz & Required Checks aktivieren**  
  _Akzeptanzkriterien:_ `main` geschützt; Required Checks: lint, test, build, CodeQL.  
  _Labels:_ `meta`, `ci-cd` · _Schätzung:_ 0.5h · _Fällig:_ 2025-10-12

- [ ] **CODEOWNERS & Review‑Policy**  
  _Akzeptanzkriterien:_ `/Website/** @frontend-team`, `/api/** @backend-team`; min. 1 Review Pflicht.  
  _Labels:_ `meta`, `quality` · _Schätzung:_ 0.5h · _Fällig:_ 2025-10-12

- [ ] **Automatische Security & Dependency Hygiene**  
  _Akzeptanzkriterien:_ **CodeQL** Workflow aktiv, **Dependabot** (npm/Docker/GitHub Actions) konfiguriert, **gitleaks** in CI.  
  _Labels:_ `security`, `ci-cd` · _Schätzung:_ 1h · _Fällig:_ 2025-10-12

- [ ] **Pre‑Commit Hooks (husky + lint‑staged + commitlint)**  
  _Akzeptanzkriterien:_ Lint/Typecheck auf staged files; Conventional Commits enforced.  
  _Labels:_ `devx`, `quality` · _Schätzung:_ 1h · _Fällig:_ 2025-10-12

- [ ] **.github/ISSUE_TEMPLATE & Copilot‑Guidelines**  
  _Akzeptanzkriterien:_ Vorlagen für Bug/Feature/Task; Datei `.github/copilot-instructions.md` existiert.  
  _Labels:_ `docs`, `meta` · _Schätzung:_ 1h · _Fällig:_ 2025-10-12

---

## 📌 SOFORT (Heute – ~2h) · Fällig: 2025-10-05

<details>
<summary><strong>[x] 1. Codacy‑Analyse für <code>Website/src/components/Contact.tsx</code></strong></summary>

**Zweck**: Pflichtlauf nach jeder Änderung.  
**Akzeptanzkriterien**:  
- `npm run quality:codacy -- --file Website/src/components/Contact.tsx` erfolgreich  
- Keine neuen **kritischen** Findings in Codacy

**Pfade/Kommandos**: `Website/src/components/Contact.tsx`  
```bash
npm run quality:codacy -- --file Website/src/components/Contact.tsx
```
**Labels**: `quality`, `frontend` · **Schätzung**: 0.5h · **Fällig**: 2025-10-05
</details>

<details>
<summary><strong>[x] 2. ESLint‑Probleme beheben (≈254)</strong></summary>

**Akzeptanzkriterien**: `npm run lint` → **0 Fehler**; manuelle Restfixes nach `npm run lint:fix`.  
**Pfade/Kommandos**: `**/*.ts?(x)`  
```bash
npm run lint:fix && npm run lint
```
**Labels**: `refactor`, `lint` · **Schätzung**: 1h · **Fällig**: 2025-10-05  
**Hinweise**: In separatem Branch; prüfen, ob Tests betroffen sind.
</details>

<details>
<summary><strong>[x] 3. Staging‑Deployment vorbereiten & ausführen</strong></summary>

**Akzeptanzkriterien**: Commit mit sauberer Message; `./build-pipeline.sh staging` fehlerfrei; Staging erreichbar.  
```bash
git add .
git commit -m "fix: ESLint cleanup & Contact improvements"
git push
./build-pipeline.sh staging
```
**Labels**: `devops`, `deployment` · **Schätzung**: 0.5h · **Fällig**: 2025-10-05
</details>

---

## 🔴 HOHE PRIORITÄT (Diese Woche – ~16h) · Fällig: 2025-10-12

<details>
<summary><strong>[ ] 4. CiviCRM‑Datenbank initialisieren</strong></summary>

**Akzeptanzkriterien**: Drupal erreichbar; CiviCRM installiert; Admin‑Login funktioniert.  
```bash
cd crm.menschlichkeit-oesterreich.at
./vendor/bin/drush site:install standard --db-url=mysql://svc_crm:$PASSWORD@localhost/mo_crm   --account-name=admin --account-pass=$ADMIN_PASS
./vendor/bin/drush civicrm:install
```
**Labels**: `backend`, `setup` · **Schätzung**: 3h
</details>

<details>
<summary><strong>[ ] 5. API‑Authentication (JWT + Refresh + Rate‑Limit + API‑Keys)</strong></summary>

**Akzeptanzkriterien**: `/api/auth/login` & `/api/auth/refresh`; Tokens signiert/ablaufend; Rate‑Limit **100/min**; API‑Key‑Lifecycle.  
**Pfade**: `src/server/auth/**` · **Labels**: `feature`, `security`, `backend` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 6. Frontend‑Router erweitern (Protected Routes, 404, Loading, Breadcrumbs)</strong></summary>

**Akzeptanzkriterien**: Unauth → Redirect; 404 bei Unbekannt; Ladeindikatoren; korrekte Breadcrumb‑Hierarchie.  
**Pfade**: `Website/src/router.tsx`, `Website/src/components/**` · **Labels**: `frontend`, `routing` · **Schätzung**: 3h
</details>

<details>
<summary><strong>[ ] 7. n8n‑Workflows konfigurieren</strong></summary>

**Workflows**: CRM→Newsletter, Event→Calendar, Donation→Payment, Member→Welcome‑Mail.  
**Akzeptanzkriterien**: Datenfluss korrekt; Fehlversuche geloggt; Notifizierungen aktiv.  
**Labels**: `automation`, `integration` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 8. GitHub Actions CI/CD (deploy-staging)</strong></summary>

**Akzeptanzkriterien**: Workflow triggert auf `push` zu `main`; Steps: checkout, `npm ci`, `npm run quality:gates`, build, `./scripts/safe-deploy.sh`.  
**Pfad**: `.github/workflows/deploy-staging.yml` · **Labels**: `ci-cd`, `devops` · **Schätzung**: 2h
</details>

---

## 🔒 SICHERHEIT & COMPLIANCE (Nächste 2 Wochen – ~24h) · Fällig: 2025-10-19

<details>
<summary><strong>[ ] 9. Keycloak SSO Setup (Realm: <code>menschlichkeit-osterreich</code>)</strong></summary>

**Akzeptanzkriterien**: Login via Keycloak; Rollen korrekt; OIDC/OAuth2 für Clients `frontend`, `api`, `crm`, `n8n`.  
**Labels**: `security`, `authentication` · **Schätzung**: 8h
</details>

<details>
<summary><strong>[ ] 10. DSGVO‑Compliance (Cookie‑Banner, Export, Löschung)</strong></summary>

**Akzeptanzkriterien**: Consent gespeichert; Datenschutzerklärung aktuell; **Export (Art. 20)** vollst.; **Löschung (Art. 17)** end‑to‑end.  
**Labels**: `compliance`, `legal` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 11. Security Hardening (CSP + Rate‑Limiting)</strong></summary>

**Akzeptanzkriterien**: CSP blockiert unerlaubte Quellen; `express-rate-limit` → 429 > 100/min; App bleibt funktionsfähig.  
**Pfade**: `src/server/app.ts` · **Labels**: `security`, `backend` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 12. Backup & Recovery (Automatisierung + Restore‑Test)</strong></summary>

**Akzeptanzkriterien**: Nightly Backups (02:00) mit Logs; `./scripts/restore-test.sh` erfolgreich in Testumgebung.  
**Labels**: `backup`, `devops` · **Schätzung**: 4h
</details>

---

## 📊 MONITORING & OBSERVABILITY (Woche 3–4 – ~20h) · Fällig: 2025-11-02

<details>
<summary><strong>[ ] 13. Grafana Dashboards</strong></summary>

**Akzeptanzkriterien**: System‑ (CPU/RAM/Disk), App‑ (Latency/Error), Business‑Metriken (Signups/Donations) sichtbar.  
**Labels**: `monitoring` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 14. Logging‑Pipeline (Loki/Promtail oder Elastic)</strong></summary>

**Akzeptanzkriterien**: Zentrales Log‑Search; Filter nach Zeit/Service/Level; Alerts `error` → Slack/Mail.  
**Labels**: `logging`, `monitoring` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 15. Uptime‑Monitoring + /health</strong></summary>

**Akzeptanzkriterien**: Jeder Service liefert `200 OK` auf `/health`; externe Alarme eingerichtet; Incident‑Playbook vorhanden.  
**Labels**: `monitoring`, `reliability` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 16. Performance‑Optimierung</strong></summary>

**Akzeptanzkriterien**: FCP (mobil) **< 3s**; Lighthouse ≥ **90**; Bundle‑Size reduziert; Bilder optimiert (WebP, Lazy).  
**Labels**: `performance`, `frontend` · **Schätzung**: 4h
</details>

---

## 🎨 UX/UI ENHANCEMENTS (Woche 5–6 – ~24h) · Fällig: 2025-11-16

<details>
<summary><strong>[ ] 17. Design System Ausbau (+ Storybook, Dark Mode, Motion)</strong></summary>

**Akzeptanzkriterien**: 15 fehlende Komponenten umgesetzt & dokumentiert; Dark Mode umschaltbar; optimierte Framer Motion Animationen.  
**Labels**: `frontend`, `design` · **Schätzung**: 8h
</details>

<details>
<summary><strong>[ ] 18. Accessibility Audit (WCAG 2.1 AA)</strong></summary>

**Akzeptanzkriterien**: Keine kritischen Findings; `npm run a11y:scan` & `npm run wcag:check` grün; manuelle Checks dokumentiert.  
**Labels**: `accessibility`, `quality` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 19. Mobile Optimierung (PWA, Gesten, Navigation)</strong></summary>

**Akzeptanzkriterien**: PWA offline startfähig; Touch‑Gesten & mobile Navigation nutzerfreundlich; Performance‑Budget eingehalten.  
**Labels**: `mobile`, `performance` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 20. Mehrsprachigkeit (DE/EN/TR) mit next‑i18next</strong></summary>

**Akzeptanzkriterien**: Sprachumschaltung; Fallbacks; Übersetzungen geprüft.  
**Labels**: `i18n`, `frontend` · **Schätzung**: 4h
</details>

---

## 🧪 TESTING & QUALITY (Woche 7–8 – ~20h) · Fällig: 2025-11-30

<details>
<summary><strong>[ ] 21. E2E Tests (Playwright)</strong></summary>

**Akzeptanzkriterien**: Kern‑Journeys (Kontakt, Login, Registrierung) stabil in CI; Beispieltest für Contact vorhanden.  
**Labels**: `testing`, `e2e` · **Schätzung**: 8h
</details>

<details>
<summary><strong>[ ] 22. API‑Integration & Contract‑Tests</strong></summary>

**Akzeptanzkriterien**: Postman‑Collections laufen; Pact‑Verträge enforced.  
**Labels**: `testing`, `backend` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 23. Last‑Tests (k6/Artillery)</strong></summary>

**Akzeptanzkriterien**: 100 VUs / 5 Min; Engpässe dokumentiert; Maßnahmen geplant.  
**Labels**: `performance`, `testing` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 24. Chaos Engineering (isolierte Umgebung)</strong></summary>

**Akzeptanzkriterien**: Random‑Pod‑Kill überstanden oder schneller Recover; Runbooks aktualisiert.  
**Labels**: `resilience`, `testing` · **Schätzung**: 2h
</details>

---

## 🚀 ADVANCED FEATURES (Woche 9–10 – ~24h) · Fällig: 2025-12-14

<details>
<summary><strong>[ ] 25. Educational Games Platform (Prisma, Redux, WebSockets, Analytics)</strong></summary>

**Akzeptanzkriterien**: Achievements/Leaderboards; Echtzeit‑Multiplayer; Dashboard mit Nutzungsdaten.  
**Labels**: `feature`, `gamification` · **Schätzung**: 12h
</details>

<details>
<summary><strong>[ ] 26. Forum (Discourse + Keycloak SSO)</strong></summary>

**Akzeptanzkriterien**: SSO integriert; Moderation & Badges aktiv.  
**Labels**: `integration`, `community` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 27. Newsletter System (Mailchimp/Sendinblue)</strong></summary>

**Akzeptanzkriterien**: Versand via CRM; Templates versioniert; A/B Tests & Analytics.  
**Labels**: `marketing`, `integration` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 28. Payment Gateway (Stripe + SEPA)</strong></summary>

**Akzeptanzkriterien**: Zahlungen & Mandate funktionsfähig; Webhooks aktualisieren CRM.  
**Labels**: `payment`, `integration` · **Schätzung**: 2h
</details>

---

## 📦 DEPLOYMENT & DEVOPS (Woche 11–12 – ~16h) · Fällig: 2025-12-28

<details>
<summary><strong>[ ] 29. Docker Optimierung (Multi‑Stage)</strong></summary>

**Akzeptanzkriterien**: Runtime‑Image deutlich kleiner; nur Prod‑Deps enthalten.  
**Labels**: `docker`, `optimization` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 30. Kubernetes Migration (Helm + ArgoCD)</strong></summary>

**Akzeptanzkriterien**: Services laufen im Cluster; Charts versioniert; ArgoCD Sync grün.  
**Labels**: `k8s`, `devops` · **Schätzung**: 8h
</details>

<details>
<summary><strong>[ ] 31. CDN & Edge Caching (Cloudflare)</strong></summary>

**Akzeptanzkriterien**: Statische Assets via CDN; ggf. Edge‑Functions aktiv.  
**Labels**: `cdn`, `performance` · **Schätzung**: 2h
</details>

<details>
<summary><strong>[ ] 32. Blue‑Green Deployment</strong></summary>

**Akzeptanzkriterien**: Umschalten zwischen Blue/Green ohne Downtime; Rollback‑Strategie dokumentiert.  
**Labels**: `deployment`, `zero-downtime` · **Schätzung**: 2h
</details>

---

## 📈 BUSINESS INTELLIGENCE (Woche 13–14 – ~12h) · Fällig: 2026-01-11

<details>
<summary><strong>[ ] 33. Analytics Dashboard (GA4/Matomo + Events/Funnels)</strong></summary>

**Akzeptanzkriterien**: Nutzungs‑ & Konversionsdaten sichtbar; IP‑Anonymisierung aktiv.  
**Labels**: `analytics`, `business` · **Schätzung**: 6h
</details>

<details>
<summary><strong>[ ] 34. CRM Reports</strong></summary>

**Akzeptanzkriterien**: Member Growth, Donation Trends, Event Attendance, Engagement exportierbar.  
**Labels**: `reporting`, `crm` · **Schätzung**: 4h
</details>

<details>
<summary><strong>[ ] 35. A/B Testing Framework (GrowthBook)</strong></summary>

**Akzeptanzkriterien**: Bibliothek eingebunden; Experimente definier‑ & auswertbar.  
**Labels**: `testing`, `marketing` · **Schätzung**: 2h
</details>

---

## 🧭 Kontroll‑Checkliste pro PR (Kurz)

- [ ] Ticket referenziert & Scope klein gehalten  
- [ ] Pfade/Kommandos im PR‑Text verlinkt  
- [ ] Tests & Metriken aktualisiert (Lighthouse/Latency)  
- [ ] Security/Compliance berücksichtigt (CSP/DSGVO/Secrets)  
- [ ] Reviewer & Deploy‑Plan genannt

---

## 🔁 Nützliche Kommandos (Sammelbox)

```bash
# Qualität
npm run quality:codacy -- --file Website/src/components/Contact.tsx
npm run lint:fix && npm run lint
npm run typecheck && npm test

# Deploy
./build-pipeline.sh staging

# Monitoring/Perf
npm run perf:audit
npm run analyze
npm run images:optimize
```

> **Hinweis:** Secrets niemals committen. Für lokale Entwicklung `.env.local` nutzen, für CI `GitHub Secrets`.


---

# 📧 Mail‑Infrastruktur – Entscheidung & Umsetzung

## 1) Entscheidung: Postfächer vs. Aliasse

**Echte Postfächer (neu/weiterführen)**  
- **peter.schuller@** (bestehend)  
- **info@** (bestehend; bleibt allgemeiner Eingang)  
- **support@** (neu; *Reply‑To*/Zentrale für Kommunikation & Tickets)  
- **civimail@** (bestehend; Systemadresse CiviMail)  
- **bounce@** (bestehend; VERP/Bounces)  
- **logging@** (bestehend; Alarme/Logs)  
- **dmarc@** (neu; DMARC Aggregate/Failure Reports, großer Speicher)  
- **tlsrpt@** (neu; TLS‑Berichte)  

**Aliasse (rollenbasiert) → Ziele**  
- **Pflicht/Tech:** `abuse@`, `postmaster@`, `hostmaster@`, `webmaster@`, `admin@`, `administrator@` → `logging@` + `peter.schuller@`  
- **Security:** `security@` → `peter.schuller@` + `logging@` (Autoreply VDP)  
- **Datenschutz/Recht:** `privacy@`/`datenschutz@` → `peter.schuller@` (bis DSB benannt) · `legal@` → `peter.schuller@`  
- **Operativ:** `support@` (Postfach), `newsletter@` → `support@` (Replies), `spenden@`/`mitgliedschaft@`/`events@`/`presse@`/`partners@`/`volunteers@` → `support@`  
- **Finance/Backoffice (optional):** `finance@`/`buchhaltung@`, `receipts@`/`quittungen@` → `support@`  
- **Governance/Intern (optional):** `board@`/`vorstand@`, `team@`/`all@` → später als Verteilerlisten  

> **Hintergrund:** Für DSGVO/VDP/Provider‑Pflichtadressen reicht **Forwarding**, solange Zustellung, SLA und Archivierung gewährleistet sind. **support@** als einziges arbeitsfähiges Postfach vereinfacht Betrieb & Compliance (Ticket/CRM‑Ablage via IMAP‑Fetch oder Mail‑to‑Case).

---

## 2) Alias‑Matrix (YAML, sofort verwendbar)

```yaml
domain: menschlichkeit-oesterreich.at
mailboxes:
  - peter.schuller@
  - info@
  - support@        # neu: primärer Reply-To / Tickets
  - civimail@
  - bounce@
  - logging@
  - dmarc@          # neu: DMARC Reports (RUA/RUF)
  - tlsrpt@         # neu: TLS Reporting

aliases:
  abuse@:           [logging@, peter.schuller@]
  postmaster@:      [logging@, peter.schuller@]
  hostmaster@:      [logging@, peter.schuller@]
  webmaster@:       [logging@, peter.schuller@]
  admin@:           [logging@, peter.schuller@]
  administrator@:   [logging@, peter.schuller@]
  security@:        [peter.schuller@, logging@]
  privacy@:         [peter.schuller@]
  datenschutz@:     [peter.schuller@]
  legal@:           [peter.schuller@]

  support@:         :mailbox                       # echtes Postfach
  newsletter@:      [support@]                     # Replies gehen ins Ticket/CRM
  spenden@:         [support@]
  mitgliedschaft@:  [support@]
  events@:          [support@]
  presse@:          [support@]
  partners@:        [support@]
  volunteers@:      [support@]

  finance@:         [support@]
  buchhaltung@:     [support@]
  receipts@:        [support@]
  quittungen@:      [support@]

  dmarc@:           :mailbox
  tlsrpt@:          :mailbox
```

> **Hinweis:** Falls Du CSV bevorzugst, kurz sagen – ich exportiere es.

---

## 3) DNS‑Vorlagen (SPF/DKIM/DMARC/TLS‑RPT/BIMI)

**Annahmen**  
– Bulk über `newsletter.menschlichkeit-oesterreich.at` (From: `newsletter@newsletter.menschlichkeit-oesterreich.at`)  
– Transaktional über Hauptdomain (`noreply@menschlichkeit-oesterreich.at` als Envelope‑From, `Reply‑To = support@`)  
– Eigener MTA/Server → **IP_TX** / **IP_NEWS** durch reale IP(s) ersetzen.  
– DKIM: 2048 bit; halbjährliche Rotation (Selector mit Quartal/Jahr).

**Hauptdomain `menschlichkeit-oesterreich.at`**

```zone
; SPF (nur notwendige Mechanismen; <10 Lookups)
@     IN TXT "v=spf1 a mx ip4:IP_TX -all"

; DKIM (Transaktional)
tx2025q4._domainkey   IN TXT "v=DKIM1; k=rsa; p=PASTE_2048BIT_PUBKEY"

; DMARC (Phase 1: quarantine; nach 30 Tagen → reject)
_dmarc IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@menschlichkeit-oesterreich.at; ruf=mailto:dmarc@menschlichkeit-oesterreich.at; fo=1; pct=100; adkim=s; aspf=s"

; TLS Reporting (SMTP TLSRPT)
_smtp._tls IN TXT "v=TLSRPTv1; rua=mailto:tlsrpt@menschlichkeit-oesterreich.at"

; (Optional) BIMI nach DMARC=p=reject und VMC
default._bimi IN TXT "v=BIMI1; l=https://media.menschlichkeit-oesterreich.at/brand/bimi.svg; a=https://media.menschlichkeit-oesterreich.at/brand/vmc.pem"
```

**Subdomain `newsletter.menschlichkeit-oesterreich.at`**

```zone
; SPF (nur die Systeme, die Massenmails versenden)
newsletter IN TXT "v=spf1 a:newsletter.menschlichkeit-oesterreich.at ip4:IP_NEWS -all"

; DKIM (Bulk/CiviMail)
news2025q4._domainkey.newsletter IN TXT "v=DKIM1; k=rsa; p=PASTE_2048BIT_PUBKEY"

; DMARC Subdomain-Policy (gleiches Vorgehen)
_dmarc.newsletter IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@menschlichkeit-oesterreich.at; fo=1; pct=100; adkim=s; aspf=s"
```

**Hinweise**  
- **SPF:** keine Sammel‑`include:` – nur reale Versandpfade autorisieren.  
- **DKIM:** je Sende‑Pfad eigener Selector (`tx2025q4`, `news2025q4`).  
- **DMARC:** nach 30 Tagen sauberer Reports → **p=reject**.  
- **TLSRPT:** MTA‑STS optional; TLS‑Berichte funktionieren ohne zusätzliche Subdomain.  
- **BIMI:** erst nach stabilen DMARC‑Reject‑Policies; SVG Tiny PS + VMC erforderlich.

---

## 4) CiviCRM/CiviMail – Kopfzeilen & Bounces

**Bulk (CiviMail)**  
- **From:** `"Menschlichkeit Österreich" <newsletter@newsletter.menschlichkeit-oesterreich.at>`  
- **Envelope‑From / Return‑Path:** `bounce@menschlichkeit-oesterreich.at` (VERP aktiv)

**Transaktional**  
- **From:** `noreply@menschlichkeit-oesterreich.at`  
- **Reply‑To:** `support@menschlichkeit-oesterreich.at`  
- **Return‑Path:** `bounce@menschlichkeit-oesterreich.at`

**List‑Unsubscribe (beide)**  
```
List-Unsubscribe: <mailto:unsubscribe@menschlichkeit-oesterreich.at>, <https://newsletter.menschlichkeit-oesterreich.at/unsubscribe?m={message_id}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

**Bounce‑Handling**  
- **Hard Bounces:** sofort sperren  
- **Soft Bounces:** 3–5 Versuche, dann Pause/Prüfung  
- **VERP‑Pattern:** von CiviMail generiert; sicherstellen, dass `bounce@` alle VERP‑Varianten annimmt (Catch‑all auf `bounce@` oder Regex‑Alias).

---

## 5) Autoreplies & SLAs (Kurztexte)

**abuse@ / postmaster@** *(sofort aktivierbar)*  
Autoreply: „Danke für Ihre Meldung. Wir prüfen innerhalb von 24 Stunden und melden uns.“  
Interne SLA: **Triage < 8h**, **Abschluss < 72h**.

**security@** *(VDP)*  
Autoreply: „Danke für die verantwortungsvolle Meldung. Unser Security‑Team bestätigt innerhalb von 24 Std. Eine CVE-/Public Disclosure bitte erst nach unserer Freigabe.“

**noreply@**  
Autoreply: „Diese Mailbox wird nicht gelesen. Bitte schreiben Sie an support@ …“

---

## 6) Nächste Schritte (konkret, Reihenfolge)

- [ ] **Postfächer anlegen:** `support@`, `dmarc@`, `tlsrpt@`  
  _Akzeptanzkriterien:_ Posteingang erreichbar; IMAP/SMTP getestet. · _Fällig:_ 2025-10-05
- [ ] **Aliasse gemäß YAML einrichten**  
  _Akzeptanzkriterien:_ Testmails an Pflichtadressen zugestellt & archiviert. · _Fällig:_ 2025-10-05
- [ ] **DKIM Keypairs erzeugen** (`tx2025q4`, `news2025q4`) & **DNS setzen**  
  _Akzeptanzkriterien:_ `Authentication-Results` zeigt `dkim=pass`. · _Fällig:_ 2025-10-06
- [ ] **SPF/DMARC/TLSRPT Records veröffentlichen**  
  _Akzeptanzkriterien:_ `spf=pass`, `dmarc=pass`; TLS‑Reports eintreffen bei `tlsrpt@`. · _Fällig:_ 2025-10-06
- [ ] **CiviMail konfigurieren:** VERP/Return‑Path=`bounce@`; From/Reply‑To gemäß oben; List‑Unsubscribe aktivieren  
  _Akzeptanzkriterien:_ Test‑Kampagne zugestellt; Bounces korrekt verarbeitet. · _Fällig:_ 2025-10-07
- [ ] **Autoreplies aktivieren** für `abuse@`, `postmaster@`, `security@`, `noreply@`  
  _Akzeptanzkriterien:_ Autoreplies treffen in Tests ein; SLA‑Playbook verlinkt. · _Fällig:_ 2025-10-07
- [ ] **Smoke‑Tests** (Zustellung/Spam/Authentifizierung)  
  _Akzeptanzkriterien:_ Mail‑Tester/Gmail/Outlook/GMX: keine Spam‑Flags; `Authentication-Results` ok. · _Fällig:_ 2025-10-07
- [ ] **In 30 Tagen:** DMARC → `p=reject` (nach Auswertung der RUA‑Reports)  
  _Akzeptanzkriterien:_ Raten **pass** > 98%; keine legitimen Quellen blockiert. · _Fällig:_ 2025-11-04

**Optional: Nützliche Kommandos**  
```bash
# DKIM Key (2048 bit), Beispiel OpenSSL
openssl genrsa -out tx2025q4.private 2048
openssl rsa -in tx2025q4.private -pubout -out tx2025q4.pub

# DNS-Check (dig)
dig +short TXT _dmarc.menschlichkeit-oesterreich.at
dig +short TXT tx2025q4._domainkey.menschlichkeit-oesterreich.at
```

---

# 🌐 Infrastruktur — Subdomains & aktive Mailadressen (Fix)

### 🧩 Subdomains mit Website unter `subdomains/.../httpdocs`  
| Subdomain                               | Website-Verzeichnis                 |
|-----------------------------------------|-------------------------------------|
| votes.menschlichkeit-oesterreich.at     | `subdomains/vote/httpdocs`          |
| support.menschlichkeit-oesterreich.at   | `subdomains/support/httpdocs`       |
| status.menschlichkeit-oesterreich.at    | `subdomains/status/httpdocs`        |
| s3.menschlichkeit-oesterreich.at        | `subdomains/s3/httpdocs`            |
| newsletter.menschlichkeit-oesterreich.at| `subdomains/newsletter/httpdocs`    |
| n8n.menschlichkeit-oesterreich.at       | `subdomains/n8n/httpdocs`           |
| media.menschlichkeit-oesterreich.at     | `subdomains/media/httpdocs`         |
| logs.menschlichkeit-oesterreich.at      | `subdomains/logs/httpdocs`          |
| idp.menschlichkeit-oesterreich.at       | `subdomains/idp/httpdocs`           |
| hooks.menschlichkeit-oesterreich.at     | `subdomains/hooks/httpdocs`         |
| grafana.menschlichkeit-oesterreich.at   | `subdomains/grafana/httpdocs`       |
| games.menschlichkeit-oesterreich.at     | `subdomains/games/httpdocs`         |
| forum.menschlichkeit-oesterreich.at     | `subdomains/forum/httpdocs`         |
| docs.menschlichkeit-oesterreich.at      | `subdomains/docs/httpdocs`          |
| crm.menschlichkeit-oesterreich.at       | `subdomains/crm/httpdocs`           |
| consent.menschlichkeit-oesterreich.at   | `subdomains/consent/httpdocs`       |
| api.stg.menschlichkeit-oesterreich.at   | `subdomains/api.stg/httpdocs`       |
| analytics.menschlichkeit-oesterreich.at | `subdomains/analytics/httpdocs`     |
| admin.stg.menschlichkeit-oesterreich.at | `subdomains/admin.stg/httpdocs`     |

### 📬 Aktive E-Mail-Adressen
- **peter.schuller@menschlichkeit-oesterreich.at**
- **logging@menschlichkeit-oesterreich.at**
- **info@menschlichkeit-oesterreich.at**
- **civimail@menschlichkeit-oesterreich.at**
- **bounce@menschlichkeit-oesterreich.at**

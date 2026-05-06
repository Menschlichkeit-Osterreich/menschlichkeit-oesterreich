# Commun## 1) Ziele & Metriken

**Oberziele:** Codequalität ↑, Sicherheit ↑, DX ↑, Performance ↑, Community-Engagement ↑, **Design System Consistency ↑**.

**Kernmetriken** (Startbaseline → Ziel):

- Test Coverage (Ziel: >90%)
- Lint-Fehler = 0 (CI Blocker)
- Mean Time to Merge (MTTM)
- First-Issue-Response-Time
- Release-Frequenz (z. B. mind. 1/Monat)
- Security Findings (High/Critical) = 0 offen > 7 Tage
- Time-to-**Moderation & Governance:** Trust‑Levels aktiv; Melde‑Workflow; Monatlicher Transparenz‑Report (Anzahl Meldungen/Maßnahmen).\
  **EU/DSGVO:** EU‑Serverstandort, AV‑Vertrag/ADV, Rechte auf Auskunft/Löschung, Log‑Retention (z. B. 90 Tage), Cookie‑Banner, Privacy‑Policy.

**🎨 Discourse Theming mit Figma Design Tokens:**

```bash
# 1. Design Tokens in Discourse CSS konvertieren
cd figma-design-system
npm run figma:sync
node scripts/generate-discourse-theme.js  # Neu erstellen

# 2. Theme in Discourse hochladen
# Admin → Customize → Themes → Import → From File
# Upload: discourse-theme.css + assets/
```

**Discourse Custom CSS (aus Figma generiert):**

```css
/* /admin/customize/themes/{theme-id}/common/common.scss */
/* Auto-generated from figma-design-system/00_design-tokens.json */

:root {
  /* Österreichische Farbpalette */
  --primary-low: #fef2f2;
  --primary-medium: #dc2626;
  --primary-high: #991b1b;

  /* Accessibility-optimierte Kontraste */
  --primary-very-high: #7f1d1d;
  --secondary-low: #f8fafc;
  --secondary-medium: #64748b;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --base-font-size: 16px;
  --line-height-medium: 1.6;
}

/* WCAG AA konformer Cookie-Banner */
.cookie-consent {
  background: var(--primary-low);
  border: 2px solid var(--primary-medium);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cookie-consent button {
  background: var(--primary-medium);
  color: white;
  min-width: 44px; /* Touch-target WCAG 2.2 */
  min-height: 44px;
}

/* Barrierefreie Focus States */
a:focus,
button:focus,
input:focus {
  outline: 3px solid var(--primary-medium);
  outline-offset: 2px;
}
```

**Figma Assets für Discourse:**

```bash
# Logo & Branding aus Figma exportieren
# mcp_figma_get_screenshot für Logo, Favicon, Social Share Images
```

t-Contribution (Onboarding)

- Forum: MAU, 7‑Tage‑Antwortquote, Anteil beantworteter Threads >85%
- **Design Token Drift: 0% (Figma ↔ Code Sync)**
- **WCAG AA Compliance: 100% aller Forum-Komponenten**gration – NGO (EU/DSGVO) – Aktionsplan & Copilot-Briefing

**Scope:** Repository _menschlichkeit-oesterreich-dev_ – Forum-Integration, DSGVO/EU-Hosting, Developer-Experience, Security, Governance.\
**Zielbild:** Eigenständiges, DSGVO-konformes Forum (präferiert: Discourse, EU-Hosting) + nahtlose Einbettung in Repo/Docs.\
**Arbeitsmodus:** Fokus-orientiert (FOCUS.md), Issues-first, kleine PRs, CI als Gate.

---

## 1) Ziele & Metriken

**Oberziele:** Codequalität ↑, Sicherheit ↑, DX ↑, Performance ↑, Community-Engagement ↑.

**Kernmetriken** (Startbaseline → Ziel):

- Test Coverage (Ziel: >90%)
- Lint-Fehler = 0 (CI Blocker)
- Mean Time to Merge (MTTM)
- First-Issue-Response-Time
- Release-Frequenz (z. B. mind. 1/Monat)
- Security Findings (High/Critical) = 0 offen > 7 Tage
- Time-to-First-Contribution (Onboarding)
- Forum: MAU, 7‑Tage‑Antwortquote, Anteil beantworteter Threads >85%

---

## 2) Phase A – Vorbereitung (Scope & Baseline)

**Checkliste:**

- **Baseline sichern:**

```bash
# Snapshot der aktuellen Hauptversion
git checkout main && git pull
VERSION_TAG="pre-forum-$(date +%Y%m%d)"
git tag -a "$VERSION_TAG" -m "Baseline vor Forum-Integration"
git push origin "$VERSION_TAG"
```

**SBOM (Beispiel NPM & Python):**

```bash
# NPM
npx @cyclonedx/cyclonedx-npm --output-file sbom-npm.json
# Python (pip):
pip install cyclonedx-bom && cyclonedx-py --format json -o sbom-py.json
```

---

## 3) Phase B – Deep-Research Audits

### 3.1 Code & Architektur

- **Hotspot-Analyse – Beispiele:**

```bash
# git-inspector (einfacher Überblick)
pipx install git-inspector || pip install git-inspector
git-inspector -f html -w --since="12 months" > audit/git-inspector.html

# Code Maat (via Docker)
docker run --rm -v "$PWD":/repo -w /repo adamtornhill/code-maat \
  -l <(git log --all --numstat --date=short --pretty=format:"---%n%ad %aN" | tr -d "\r") \
  -c git -a revisions > audit/code-maat-revisions.csv
```

### 3.2 Qualität & Tests

- **Coverage (Beispiel):**

```bash
# Jest
npm run test -- --coverage
# Pytest
pytest --maxfail=1 --disable-warnings -q --cov=. --cov-report=xml
```

### 3.3 Sicherheit (SAST/SCA/Secrets)

- **GitHub Actions – Gitleaks & Semgrep (/.github/workflows/security.yml):**

```yaml
name: security
on: [push, pull_request]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gitleaks/gitleaks-action@v2
        with:
          args: 'detect --source . --no-banner'
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: 'p/ci'
```

**Dependabot (/.github/dependabot.yml):**

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule: { interval: 'weekly' }
  - package-ecosystem: 'pip'
    directory: '/'
    schedule: { interval: 'weekly' }
```

### 3.4 Performance

- **k6 Smoke/Last (examples/k6.js):**

```js
import http from 'k6/http';
import { sleep, check } from 'k6';
export default function () {
  const res = http.get('https://example.org/health');
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
```

### 3.5 DX & Doku

-

### 3.6 Community-Gesundheit

- ***

## 4) Bewertungs‑Scorecard (Template)

| Kategorie                      | Gewicht | Score (0–5) | Begründung |
| ------------------------------ | ------- | ----------- | ---------- |
| Sicherheit                     | 25%     |             |            |
| Qualität & Tests               | 20%     |             |            |
| Architektur                    | 15%     |             |            |
| DX & Docs                      | 15%     |             |            |
| Performance                    | 10%     |             |            |
| Community & Prozesse           | 15%     |             |            |
| **Gesamtscore (gewichtet):** … |         |             |            |
| **Top‑3 Risiken:** …           |         |             |            |
| **Top‑3 Chancen:** …           |         |             |            |

---

## 5) Phase C – Verbesserungen (Backlog nach Impact)

**Quick Wins:**

- CI: Lint/Test parallel + Cache, Required Checks aktivieren
- Pre-commit: Format/Lint vor jedem Commit
- Dependencies: Aufräumen/Upgraden, Dependabot an
- SECURITY.md + Disclosure‑Pfad
- README: Quickstart + Call‑to‑Action, Issue/PR‑Templates

**Strukturell:**

- Hotspots schrittweise entkoppeln/vereinfachen
- Test‑Suite ausbauen, Flaky‑Tests fixen
- Performance‑Tuning nach Profiling
- API‑Versionierung & CHANGELOG (SemVer)

**Branch Protection (Vorschlag):**

- Required Status Checks: `test`, `lint`, `security`
- Require PR Reviews: 1–2
- Dismiss stale reviews on new commits

---

## 6) Phase D – Forum integrieren (EU/DSGVO)

### 🎨 Design System Integration (Figma MCP)

**Figma → Code Workflow:**

1. **Design Tokens synchronisieren**:

   ```bash
   npm run figma:sync              # Sync tokens from Figma
   node scripts/validate-design-tokens.js  # Validate drift = 0%
   ```

2. **Figma MCP Tools nutzen** (GitHub Copilot Integration):
   - `mcp_figma_get_code(nodeId, fileKey)` - Generiert UI-Code aus Figma
   - `mcp_figma_get_metadata(nodeId, fileKey)` - Struktur-Übersicht
   - `mcp_figma_get_screenshot(nodeId, fileKey)` - Visual Reference

3. **Forum-spezifische Komponenten**:
   - Cookie-Banner (DSGVO-konform, österreichische Farben)
   - Privacy-Settings-Panel
   - Trust-Level-Badges
   - Moderation-UI
   - Accessibility-Controls

**Design Token Mapping für Discourse:**

```scss
// figma-design-system/styles/discourse-theme.scss
@import 'design-tokens.css';

// Discourse Theme Variablen mapped zu Figma Tokens
$primary: var(--color-primary-600); // Österreichisches Rot
$secondary: var(--color-secondary-700);
$tertiary: var(--color-accent-500);
$quaternary: var(--color-primary-50);
$header_background: var(--color-primary-700);
$header_primary: #ffffff;
$highlight: var(--color-warning-200);
$danger: var(--color-error-600);
$success: var(--color-success-600);
$love: var(--color-accent-600);

// Typography aus Figma
$base-font-family: var(--font-family-body);
$heading-font-family: var(--font-family-heading);
$base-font-size: var(--font-size-base);
$base-line-height: var(--line-height-normal);

// Spacing
$padding-base: var(--spacing-4);
$margin-base: var(--spacing-4);
```

**Accessibility aus Design Tokens:**

```json
// figma-design-system/a11y-compliance.json
{
  "wcag_aa_compliant": true,
  "color_contrast_ratio": {
    "primary_text": 4.8,
    "heading_text": 7.2,
    "link_text": 4.6
  },
  "keyboard_navigation": "full",
  "screen_reader_tested": true,
  "focus_indicators": "visible_high_contrast"
}
```

**Figma-basierte Komponenten für Forum:**

```typescript
// forum/components/privacy-banner.tsx
// Generated from Figma via mcp_figma_get_code
import { designTokens } from '@/figma-design-system';

export const PrivacyBanner = () => {
  return (
    <div
      style={{
        backgroundColor: designTokens.colors.primary[50],
        borderColor: designTokens.colors.primary[600],
        padding: designTokens.spacing[4],
        borderRadius: designTokens.borderRadius.md
      }}
      role="alert"
      aria-label="Datenschutz-Hinweis"
    >
      <p style={{ color: designTokens.colors.secondary[900] }}>
        Diese Seite verwendet Cookies gemäß DSGVO.
        <a href="/privacy" style={{ color: designTokens.colors.primary[600] }}>
          Mehr erfahren
        </a>
      </p>
    </div>
  );
};
```

### Option A: GitHub Discussions (+ giscus)

**Wann sinnvoll:** Dev‑nahe Community, schneller Start, keine Extra‑Infra.\
**Steps:**

1. Discussions im Repo aktivieren (Settings → General → Features → Discussions).
2. `docs/`‑Website (Docusaurus/MkDocs) mit **giscus** kommentierbar machen.
3. Issue Forms: „question“ verweist auf Discussions.

**giscus (Docusaurus plugin, docusaurus.config.js – Auszug):**

```js
module.exports = {
  themes: ['@docusaurus/theme-classic'],
  themeConfig: {
    navbar: { title: 'Projekt' },
    giscus: {
      repo: 'ORG/REPO',
      repoId: '...',
      category: 'General',
      categoryId: '...',
      mapping: 'title',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      lang: 'de',
      loading: 'lazy',
    },
  },
};
```

### Option B (präferiert NGO/EU): Discourse selbst hosten (EU)

**Warum:** Volle Datenhoheit, starke Moderation, SSO, Plugins, Branding.

**Infra (Docker Compose – Minimalgerüst):**

```yaml
version: '3.8'
services:
  app:
    image: discourse/base:2.0.20240531
    ports: ['80:80']
    environment:
      DISCOURSE_HOSTNAME: forum.example.org
      DISCOURSE_DEVELOPER_EMAILS: admin@example.org
      DISCOURSE_SMTP_ADDRESS: smtp.example.eu
      DISCOURSE_SMTP_PORT: 587
      DISCOURSE_SMTP_USER_NAME: smtp-user
      DISCOURSE_SMTP_PASSWORD: ${SMTP_PASSWORD}
    volumes:
      - ./shared:/shared
    depends_on: [postgres, redis]
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${PG_PASS}
    volumes: ['./pgdata:/var/lib/postgresql/data']
  redis:
    image: redis:7
```

**SSO (OIDC) – Keycloak/GitHub:**

- Discourse Admin → Login → Enable OIDC
- OIDC Discovery URL: `https://auth.example.org/realms/ngo/.well-known/openid-configuration`
- Client ID/Secret aus IdP eintragen
- Claims mappen (email, name)

**Einbettung in Website:**

- Verlinkung in README/Docs
- **Discourse Embed** (Kommentare unter Artikeln, `discourseEmbedUrl`):

```html
<div id="discourse-comments"></div>
<script type="text/javascript">
  var discourseUrl = 'https://forum.example.org/';
  var discourseEmbedUrl = window.location.href;
  (function () {
    var d = document.createElement('script');
    d.type = 'text/javascript';
    d.async = true;
    d.src = discourseUrl + 'javascripts/embed.js';
    (document.head || document.body).appendChild(d);
  })();
</script>
```

**Automationen (GitHub Actions)**

- Release → Foren‑Ankündigung:

```yaml
name: announce-release
on: # typo guard: replace with 'on'
  release:
    types: [published]
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - name: Post to Discourse
        env:
          DISCOURSE_API_KEY: ${{ secrets.DISCOURSE_API_KEY }}
        run: |
          curl -X POST "https://forum.example.org/posts.json" \
            -H "Api-Key: $DISCOURSE_API_KEY" \
            -H "Api-Username: bot" \
            -F "title=Release ${{ github.event.release.tag_name }}" \
            -F "raw=Changelog: ${{ github.event.release.html_url }}"
```

> **Hinweis:** `on:` korrekt schreiben; Secret & bot‑User im Forum anlegen.

**Kategorien (Startstruktur):**

- Ankündigungen
- Hilfe & Support
- Feature‑Ideen (Voting)
- Arbeitsgruppen (nach Themen/Region)
- Lounge

**Moderation & Governance:** Trust‑Levels aktiv; Melde‑Workflow; Monatlicher Transparenz‑Report (Anzahl Meldungen/Maßnahmen).\
**EU/DSGVO:** EU‑Serverstandort, AV‑Vertrag/ADV, Rechte auf Auskunft/Löschung, Log‑Retention (z. B. 90 Tage), Cookie‑Banner, Privacy‑Policy.

---

## 7) Phase E – Messen & Lernen

- Dashboard (CI/Insights/Forum‑Metriken)
- 2‑wöchige Audit‑Reviews
- Monatliches Community‑Retro
- Quartalsweiser Roadmap‑Refresh

---

## 8) Operative Checkliste (Issue‑friendly)

- ***

## 9) Fokus behalten – VS Code & Repo‑Struktur

**Repo‑Ordner:**

```
.github/
  ├─ workflows/
  │   ├─ ci.yml
  │   ├─ security.yml
  │   └─ announce-release.yml
docs/
  ├─ FOCUS.md
  ├─ PROJECT_PLAN.md
  ├─ GOVERNANCE.md
  └─ ADR/
examples/
  └─ k6.js
scripts/
  └─ audit.sh
```

**FOCUS.md (Template):**

```md
# Aktueller Fokus (2 Wochen)

1. CI: security.yml grün bekommen
2. Forum: Discourse EU-Host + SSO
3. Docs: Quickstart ≤10 Min
   **Nicht‑Ziele (Parkplatz):** …
```

**VS Code Tasks (.vscode/tasks.json):**

```json
{
  "version": "2.0.0",
  "tasks": [
    { "label": "lint", "type": "shell", "command": "npm run lint" },
    { "label": "test", "type": "shell", "command": "npm test" },
    { "label": "security", "type": "shell", "command": "semgrep --config p/ci" }
  ]
}
```

---

## 10) GitHub Copilot – Briefing & Prompts

**/docs/GOAL.md**

```md
Ziel: DSGVO-konformes Community-Forum integrieren (präferiert Discourse, EU-Hosting) und Dev‑Qualität steigern.
Liefere: CI‑Workflows (lint, test, security), Discourse‑SSO‑Konfiguration, Embeds, Release‑Bot, Quickstart‑Doku.
Standards: SemVer, CHANGELOG, Conventional Commits, strenges Linting, Tests >90%.
```

**Kommentar‑Prompts im Code (Beispiele):**

```ts
// Aufgabe: Erzeuge REST‑Client für Discourse API (posts.json)
// Anforderungen:
// - Funktion postAnnouncement(title: string, body: string)
// - Auth via Api-Key + Api-Username (aus ENV)
// - Fehlerbehandlung (Rate‑Limit, 4xx/5xx)
// - Unit‑Tests mit Mocks
```

```yaml
# Aufgabe: CI‑Job für SBOM bauen und als Artefakt anhängen
# Ecosystems: npm + pip
# Trigger: push auf main, release
```

**PR‑Template (.github/pull_request_template.md):**

```md
## Zweck

Fixes #

## Änderungen

- …

## Tests

- [ ] Unit
- [ ] Integration

## Sicherheit & DSGVO

- [ ] Secrets ok
- [ ] Logging/PII geprüft
```

**CODEOWNERS:**

```
* @repo-owner
.github/ @security-lead
scripts/ @devops
```

---

## 11) Beispiel‑Issues (Copy‑&‑Paste)

1. **Setup Security CI** – Semgrep + Gitleaks + Dependabot
2. **SBOM Pipeline** – CycloneDX für npm/pip, Artefakte anhängen
3. **Discourse EU‑Host** – VM/Container + SMTP + Backup
4. **SSO OIDC** – IdP einrichten, Login testen
5. **Docs Embedding** – Discourse‑Kommentare in Docs
6. **Release Bot** – GitHub Action → Discourse
7. **FOCUS.md** – initiale 3‑Punkte definieren
8. **Quickstart** – ≤10 Min verifizieren

---

## 12) Rollout‑Plan (12 Wochen)

**W1–2:** Audits, Baseline, Security‑CI, FOCUS.md\
**W3–4:** Discourse auf EU‑Infra, Kategorien/CoC, SMTP/Backups\
**W5–6:** SSO, Embeds, Release‑Bot, README‑CTA\
**W7–8:** Tests/Refactor Hotspots, Quickstart, Docs\
**W9–10:** Pilot (100–300 Nutzer), Feedback, Tuning\
**W11–12:** Public Launch, KPI‑Review, Iterationen

---

## 13) GDPR‑Checkliste (Operator)

- ***

## 14) Anhang – zusätzliche Snippets

**Conventional Commits (commitlint.config.js):**

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

**Release‑Please (/.github/workflows/release-please.yml):**

```yaml
name: release-please
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v4
        with:
          release-type: node
```

**Pre‑commit (.pre-commit-config.yaml – Beispiel Python/JS gemischt):**

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks: [{ id: black }]
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks: [{ id: flake8 }]
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.2.5
    hooks: [{ id: prettier }]
```

---

**Ready to use.** Beginne mit **FOCUS.md**, erstelle die **Security‑CI**, setze **Discourse (EU)** auf, aktiviere **SSO** und verlinke das Forum in README/Docs. Danach: Pilot starten & messen.

---

## 15) Security & Compliance – zusätzliche Maßnahmen (empfohlen)

- **GitHub CodeQL (SAST):** tiefe Codeanalyse ergänzend zu Semgrep.
- **Org‑Sicherheit:** 2FA für alle Maintainer, Sign‑off Policy (DCO) oder CLA.
- **Secret Hygiene:** `detect-secrets`/`trufflehog` optional vor Merge.
- **Package Integrity:** Lockfiles verpflichtend, `npm audit`/`pip-audit` in CI.
- **Release Signaturen:** Container/Artefakte mit **Sigstore cosign** signieren.
- **Least Privilege:** Separate GitHub‑Environments für `prod`/`staging` mit Required Approvals.

**CodeQL (/.github/workflows/codeql.yml):**

```yaml
name: codeql
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'python' ]
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: ${{ matrix.language }} }
      - uses: github/codeql-action/analyze@v3
```

---

## 16) Discourse – EU‑Betrieb: Best Practices (Ops)

- **Mail‑Zustellbarkeit:** SPF, DKIM, DMARC für Absenderdomain setzen.
- **Backups:** tägliche automatisierte Backups in EU‑Object‑Storage (S3‑kompatibel) + 30–90 Tage Aufbewahrung.
- **Restore‑Test:** quartalsweise Wiederherstellung testen.
- **Security Header & CSP:** HSTS, X‑Frame‑Options, Referrer‑Policy, strikte CSP.
- **Rate‑Limiting & Anti‑Spam:** reCAPTCHA/hCaptcha, Akismet‑Plugin, Trust‑Levels.
- **Plugins (Start):** `discourse-akismet`, `discourse-solved`, `discourse-checklist`, `discourse-calendar`, `discourse-voting`, `discourse-data-explorer`.
- **Analytics (Privacy):** **Matomo** self‑hosted (cookielos möglich) oder vollständige Consent‑Lösung.
- **Datenlebenszyklus:** automatische IP‑Anonymisierung/Rotation (z. B. 90 Tage), Export/Löschung per Self‑Service freischalten.

**Backup‑Jobs (cron, Beispiel docker host):**

```bash
# Täglich 02:30 Uhr Backup via Discourse API auslösen
0 2 * * * curl -s -X POST \
  -H "Api-Key: $DISCOURSE_API_KEY" -H "Api-Username: admin" \
  https://forum.example.org/admin/backups/create.json
```

**Nginx Security Header (Auszug):**

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' https: data:; frame-ancestors 'self'" always;
```

---

## 17) Monitoring & Observability

- **Uptime:** externes Monitoring (Statuspage/UptimeRobot/Healthchecks).
- **Logs & Metrics:** Versand von Logs in EU‑Stack (ELK/OpenSearch). System‑Metriken via Prometheus/Grafana; Alerts (E‑Mail/Matrix/Slack).
- **Service KPIs:** Median‑Antwortzeit im Forum, offene Threads >7 Tage, Moderations‑Queue‑Alter.

**Healthcheck Beispiel (GitHub Action, täglich):**

```yaml
name: forum-health
on:
  schedule: [{ cron: '*/30 * * * *' }]
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: GET /site/basic-info.json
        run: |
          code=$(curl -s -o /dev/null -w "%{http_code}" https://forum.example.org/site/basic-info.json)
          if [ "$code" != "200" ]; then echo "Healthcheck failed ($code)" && exit 1; fi
```

---

## 18) Issue/PR‑Vorlagen (GitHub Forms)

**.github/ISSUE_TEMPLATE/bug_report.yml**

```yaml
name: Bug Report
labels: [bug]
body:
  - type: input
    id: version
    attributes: { label: Version/Commit }
  - type: textarea
    id: steps
    attributes: { label: Schritte zum Reproduzieren }
  - type: textarea
    id: expected
    attributes: { label: Erwartetes Verhalten }
  - type: textarea
    id: actual
    attributes: { label: Tatsächliches Verhalten }
  - type: dropdown
    id: area
    attributes: { label: Bereich, options: [backend, frontend, docs, infra] }
```

**.github/ISSUE_TEMPLATE/feature_request.yml**

```yaml
name: Feature Request
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes: { label: Problem/Nutzen, description: 'Wert für Nutzer/NGO' }
  - type: textarea
    id: proposal
    attributes: { label: Lösungsvorschlag }
  - type: checkboxes
    id: impact
    attributes:
      label: Impact
      options:
        - label: Bringt messbaren KPI‑Vorteil
        - label: Niedriger Aufwand
```

**.github/ISSUE_TEMPLATE/config.yml**

```yaml
blank_issues_enabled: false
contact_links:
  - name: Fragen & Hilfe (Forum)
    url: https://forum.example.org/c/hilfe
    about: Bitte Support‑Fragen im Forum stellen.
```

---

## 19) Einheitliche Dev‑Umgebung

**.devcontainer/devcontainer.json**

```json
{
  "name": "moe-dev",
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": { "ghcr.io/devcontainers/features/docker-in-docker:2": {} },
  "postCreateCommand": "npm ci || true && pip install -r requirements.txt || true",
  "customizations": {
    "vscode": {
      "extensions": [
        "GitHub.vscode-pull-request-github",
        "ms-python.python",
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

**Makefile (vereinheitlichte Kommandos):**

```makefile
.PHONY: setup lint test security sbom audit
setup: ; npm ci || true; pip install -r requirements.txt || true
lint: ; npm run lint || true
test: ; npm test || true
security: ; semgrep --config p/ci; gitleaks detect --no-banner
sbom: ; cyclonedx-npm --output-file sbom-npm.json || true; cyclonedx-py -o sbom-py.json || true
audit: ; git-inspector -w --since="12 months"
```

---

## 20) Accessibility & i18n

- **WCAG 2.2 AA:** Tastatur‑Bedienbarkeit, Kontraste, ARIA‑Labels.
- **Mehrsprachigkeit:** de → en (mindestens). Discourse i18n aktivieren, Sprach‑Kategorie‑Tags.
- **Barrierefrei‑Inhalte:** Alternativtexte, Transkripte/Untertitel.

---

## 21) GDPR vertieft: DPIA & Verzeichnis von Verarbeitungstätigkeiten

- **DPIA (Datenschutz‑Folgenabschätzung):** durchführen bei hoher Betroffenheit (z. B. sensible Themen/Personengruppen).
- **RoPA:** Verzeichnis aller Verarbeitungstätigkeiten führen (Zwecke, Rechtsgrundlagen, Empfänger, Speicherdauer, TOMs).
- **Betroffenenrechte:** standardisierte Antworten/Prozesse; SLAs (z. B. 30 Tage Antwortfrist) tracken.

---

## 22) Definition of Done (DoD) je Phase

- **A (Vorbereitung):** Baseline‑Tag gesetzt, SBOM erzeugt, Rollen dokumentiert.
- **B (Audits):** Reports abgelegt (`/audit`), Scorecard ausgefüllt, Top‑3 Risiken/Chancen benannt.
- **C (Verbesserungen):** Security‑CI grün, Coverage ≥ 80% (Zwischenziel), Hotspot‑Issue‑Plan steht.
- **D (Forum):** Discourse live (EU), SSO ok, Embeds aktiv, Release‑Bot funktioniert, Privacy‑Policy veröffentlicht.
- **E (Messen):** Dashboard live, erste KPI‑Review durchgeführt, Maßnahmenliste aktualisiert.

---

## 23) Risiko‑Register & Fallbacks

- **R1 Datenschutzrisiko (Drittland‑Transfer):** Maßnahme: Self‑hosted Discourse in EU, keine US‑Subprozessoren.
- **R2 Ressourcenknappheit (Ops):** Maßnahme: Managed Hosting/Support einkalkulieren, klare On‑Call‑Zeiten.
- **R3 Community‑Missbrauch/Spam:** Maßnahme: Trust‑Levels, Moderation, Akismet, Rate‑Limits, klare CoC.
- **Fallback kurzfristig:** Start mit GitHub Discussions + giscus, später Migration → Discourse (Exportpfad vorsehen).

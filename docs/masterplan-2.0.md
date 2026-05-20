# Masterplan 2.0 — Externes Strategie-Dokument

> **Status:** Externes Strategie-Artefakt (Eingangsquelle: ChatGPT-Analyse, 2026-05-20).
> **Geltung:** Dieses Dokument **ergänzt** die kanonische Governance ([AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), [.github/copilot-instructions.md](../.github/copilot-instructions.md), [.github/ai-registry.json](../.github/ai-registry.json)), **ersetzt sie nicht**.
> **Konflikte zwischen diesem Dokument und der Repo-Governance werden zugunsten der Repo-Governance aufgelöst.**

## 1 Zweck

Konsolidierte Aufnahme einer extern erstellten Phasenroadmap (Phase 0–9) inkl. Integrationsmatrix, Risikoregister, Issue-Backlog-Vorlagen und Agenten-Prompts. Dient als Diskussionsgrundlage für Vorstand, Tech-Lead und Datenschutzbeauftragten.

## 2 Repo-Realitätsabgleich (Korrekturen zur Eingangsquelle)

| Eingangsquelle behauptet                                                   | Repo-Realität (verifiziert)                                                                                                                                                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/babylon-game` ist Legacy                                             | **Aktive App** (Next.js 16 + Babylon.js 8, Port 3001), siehe [apps/babylon-game/README.md](../apps/babylon-game/README.md)                                                                               |
| Specs `006`, `007` müssen neu angelegt werden                              | **Existieren bereits** als [specs/006-forum-eigenbau-moderation/](../specs/006-forum-eigenbau-moderation/) und [specs/007-crm-drupal-civicrm-auslagerung/](../specs/007-crm-drupal-civicrm-auslagerung/) |
| Branching: `dev` als Integrationslinie                                     | **Main-first Workflow** — kein aktiver `dev`-Branch, PRs gehen direkt gegen `main`                                                                                                                       |
| `AGENTS.md` neu einführen mit Rollen Architect/Code Writer/Test Engineer/… | **Existiert kanonisch** mit Rollen `architect`, `developer`, `devops`, `security`, `qa` (plus Service-Agents)                                                                                            |
| Slack als zentrale Plattform                                               | Nicht im [.github/ai-registry.json](../.github/ai-registry.json) etabliert; n8n + CiviCRM sind autoritativ                                                                                               |
| Postiz als Modul-Kandidat                                                  | AGPL-Lizenz nicht repo-kompatibel — Empfehlung „nur referenzieren"                                                                                                                                       |

## 3 Executive Summary

Wichtigste Erkenntnisse aus der externen Analyse:

1. **Monorepo mit klarer Trennung** zwischen aktiven `apps/` und Legacy-Mirror — bestätigt; Dokumentationsdichte ist ausbaufähig.
1. **Forum-Eigenbau** mit Markdown, Thread/Post-Struktur, Volltextsuche, RBAC, Moderations-Queue, Audit-Logs, DSGVO-Export — Spec liegt vor.
1. **Single-Server-Risiko**: aktuelles Plesk-Hosting ist Single-Point-of-Failure. Zielarchitektur empfiehlt Subdomain-Isolation und Reverse-Proxy mit TLS-Hardening.
1. **Website-Optimierungspotenzial**: SEO (Titles, Meta-Descriptions, strukturierte Daten), Heading-Hierarchie, Accessibility nach WCAG 2.2 AA.
1. **n8n als Orchestrierungsschicht** — bereits Bestandteil des Stacks; Self-hosting auf Azure konzipiert.
1. **Stripe für Non-Profits** — Governance- und DSGVO-Rahmen müssen formalisiert werden (DPIA).
1. **Microsoft Graph & Entra ID** — Stufenmodell bereits in [runbooks/copilot-microsoft-operator.md](../runbooks/copilot-microsoft-operator.md).
1. **Postiz** — nur als Inspiration, keine Integration wegen AGPL.
1. **Compliance-Handlungsbedarf** — WCAG 2.2 AA und DSGVO als verbindliche Quality Gates.
1. **Admin-Steuerzentrale** fehlt — siehe [specs/008-admin-control-center/](../specs/008-admin-control-center/).

## 4 Repo-Landkarte (Soll-Bezug)

Aktive Services unter `apps/`:

- `apps/api` — FastAPI, Port 8001
- `apps/website` — React 19 + Vite, Port 5173
- `apps/crm` — Drupal 10 + CiviCRM, Port 8000
- `apps/babylon-game` — Next.js 16 + Babylon.js 8, Port 3001
- `apps/forum` — phpBB, Port 8002

Automation: `automation/n8n/` (Port 5678), `automation/elk-stack/`.

Verbindliche Quellen: [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), [README.md](../README.md), [.github/copilot-instructions.md](../.github/copilot-instructions.md).

## 5 Website-Audit (Handlungsfelder)

### SEO

- Eindeutige `<title>`-Tags und Meta-Descriptions pro Seite.
- Logische Heading-Hierarchie (ein `<h1>`, dann `<h2>`/`<h3>`).
- JSON-LD-Schemas (Organization, Article, Event, FAQ).
- `robots.txt`, `sitemap.xml`, Canonical-URLs prüfen.
- Open-Graph-Tags pro Seite.

### Performance

- Core Web Vitals: SSR/SSG, moderne Bildformate (WebP/AVIF), Lazy-Loading, CDN.
- Konsistente Cache-Control-Header.
- Minifizierung, Tree-Shaking, Code-Splitting.

### Barrierefreiheit (WCAG 2.2 AA)

- Mindestkontraste.
- Tastatur-Bedienbarkeit, sichtbare Fokusringe.
- `alt`-Attribute, `label`/`for`-Verknüpfungen, ARIA-Landmarken.
- Verständliche Formularfehler, Live-Regions für dynamische Inhalte.

### UX

- Navigation entlasten, Breadcrumbs, sticky Header.
- Konsistente CTA-Styles, progressive Spendenformulare.
- Mehrsprachigkeit (`hreflang`).

### Technische Risiken

- Drittanbieter-Skripte über CMP steuern.
- HTTP-Security-Header (CSP, HSTS, Referrer-Policy).
- Custom-Error-Pages, zentrales Logging.

Umsetzung siehe [specs/009-seo-accessibility-hardening/](../specs/009-seo-accessibility-hardening/).

## 6 Integrationsmatrix

| Integration        | Use Case                                 | Auth/Scopes                | DSGVO-Klasse |
| ------------------ | ---------------------------------------- | -------------------------- | ------------ |
| n8n                | Workflow-Orchestrierung                  | API-Token pro Dienst, TLS  | mittel       |
| Stripe             | Spenden, Mitgliedsbeiträge               | OAuth2-Connect, PCI-Tokens | hoch         |
| Slack (optional)   | Moderations-Alerts, Deploy-Notifications | OAuth2 Bot Token           | gering       |
| OpenAI / Anthropic | KI-gestützte Redaktion, QA               | API-Key, keine PII         | mittel       |
| Microsoft Graph    | Mail, Kalender, OneDrive, Teams          | OAuth2 mit Entra ID        | hoch         |
| Entra ID           | Identity, SSO, RBAC                      | OAuth2 / OIDC              | mittel       |
| GitHub             | Code, Issues, Projects                   | PAT mit minimalen Scopes   | gering       |

Ausführlich: jede Integration benötigt vor produktivem Einsatz DPIA, dokumentierten Datenfluss und Logging-Regel.

## 7 Postiz-Evaluation

- **Referenz**: ausgereiftes Social-Media-Scheduling-Tool mit CLI über 28 Plattformen.
- **Lizenz**: AGPL-3.0 — bei Integration Pflicht zur Offenlegung des Gesamtquellcodes.
- **Empfehlung**: **nur referenzieren**, kein Fork, keine direkte Modul-Integration. Falls Social-Media-Scheduling benötigt: eigene leichte Lösung via n8n.

## 8 Zielbild Admin-Steuerzentrale

Module: Dashboard, Content-Management, Forum-Moderation, CRM/Kontakte, Spenden & Stripe, n8n-Workflow-Monitoring, Notifications, MS Graph, Rollen-/Rechte-Management, Audit & Compliance.

Datenfluss: Backend kommuniziert mit Services (API, n8n, CRM, Stripe) über gesicherte REST/Webhooks. Frontend erhält nach Entra-ID-Auth signierte JWTs mit minimalen Scopes. Externe Daten werden pseudonymisiert/anonymisiert.

Detail: [specs/008-admin-control-center/spec.md](../specs/008-admin-control-center/spec.md).

## 9 Masterplan-Phasen

| Phase                               | Ziel                                                                | Status im Repo                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0 — Audit                           | Bestandsaufnahme Code, Infra, Website, Compliance                   | laufend, siehe [specs/001-workspace-governance-audit/](../specs/001-workspace-governance-audit/)    |
| 1 — Stabilisierung & Governance     | TLS, Reverse-Proxy, Secrets-Vault, RBAC-Policy, Labels/Milestones   | teilweise (BWS, MCP-Cleanup im aktuellen PR #494)                                                   |
| 2 — SEO/Accessibility-Hardening     | Meta, Heading, Schema, CMP, Security-Header                         | neu — [specs/009](../specs/009-seo-accessibility-hardening/)                                        |
| 3 — Forum-MVP                       | Datenmodell, RBAC, Markdown+Sanitization, Search, Moderation, DSGVO | spezifiziert in [specs/006](../specs/006-forum-eigenbau-moderation/)                                |
| 4 — Admin-Steuerzentrale MVP        | Backend, SSO, Dashboard, Notifications                              | neu — [specs/008](../specs/008-admin-control-center/)                                               |
| 5 — n8n/Slack/GitHub-Orchestrierung | Workflows, Bots, Issue-Automation                                   | n8n produktiv, Slack offen                                                                          |
| 6 — Microsoft Graph / Entra ID      | SSO, Mail, Kalender, OneDrive                                       | Stufenmodell in [runbooks/copilot-microsoft-operator.md](../runbooks/copilot-microsoft-operator.md) |
| 7 — Stripe/Spenden-Governance       | DPIA, Dashboard, Quittungen                                         | Donation-Pilot eingefroren bis Staging-Smoke grün                                                   |
| 8 — KI-gestützte Redaktion          | ChatGPT/Claude für Redaktion, QA-Bots                               | RuFlo V3 vorhanden in `.claude/`                                                                    |
| 9 — Produktionsreife                | Monitoring, Runbooks, Backups, Redundanz                            | ELK-Stack vorhanden, Disaster-Recovery offen                                                        |

Jede Phase benötigt Go/No-Go-Gates und Definition of Done. Detaillierte Deliverables siehe Eingangsquelle (extern).

## 10 GitHub-Projektstruktur

Im Repo bereits vorhanden:

- Issue-Templates unter [.github/ISSUE_TEMPLATE/](../.github/ISSUE_TEMPLATE/) (umfangreich)
- Pull-Request-Template unter [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)
- Labels und Milestones — bereits etabliert (siehe `create_milestones.sh`, `create_issues.sh`)
- Workflows unter [.github/workflows/](../.github/workflows/) (45+)

**Keine zusätzlichen Vorlagen nötig**; bei Lücken pro Spec-Feature eigene `tasks.md` ergänzen (siehe Spec-Kit-Workflow in [AGENTS.md](../AGENTS.md)).

## 11 Spec-Kit-Schnitt (Status)

| Spec                                    | Status                 | Quelle                                                       |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `001-workspace-governance-audit`        | bestehend              | [specs/001](../specs/001-workspace-governance-audit/)        |
| `002-infrastruktur-donation-masterplan` | bestehend              | [specs/002](../specs/002-infrastruktur-donation-masterplan/) |
| `003-speckit-multi-app-rollout`         | bestehend              | [specs/003](../specs/003-speckit-multi-app-rollout/)         |
| `004-speckit-repo-wide-orchestrierung`  | bestehend              | [specs/004](../specs/004-speckit-repo-wide-orchestrierung/)  |
| `005-democracy-game-bruecken-bauen`     | bestehend              | [specs/005](../specs/005-democracy-game-bruecken-bauen/)     |
| `006-forum-eigenbau-moderation`         | bestehend              | [specs/006](../specs/006-forum-eigenbau-moderation/)         |
| `007-crm-drupal-civicrm-auslagerung`    | bestehend              | [specs/007](../specs/007-crm-drupal-civicrm-auslagerung/)    |
| `008-admin-control-center`              | **neu (dieses Paket)** | [specs/008](../specs/008-admin-control-center/)              |
| `009-seo-accessibility-hardening`       | **neu (dieses Paket)** | [specs/009](../specs/009-seo-accessibility-hardening/)       |

## 12 Issue-Backlog (Vorlage, 30 Tasks)

Die 30 Issue-Skizzen aus der Eingangsquelle (Phase 0 bis Phase 7) werden nicht hier dupliziert, sondern beim Anlegen über den Speckit-Workflow generiert:

```text
speckit.taskstoissues  →  spec → tasks.md → GitHub Issues
```

Beispiel-Naming: `Phase{N}-{FeatureID}: Kurztitel`, Labels nach Phase, Feature, Priorität (`P0`/`P1`/`P2`), Typ und Risiko.

## 13 Agenten-Prompts (Mapping auf bestehende Agents)

Die in der Eingangsquelle vorgeschlagenen Spezial-Agents werden auf die bestehenden, kanonischen Agents abgebildet:

| Externer Vorschlag         | Bestehender Agent im Repo                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo-Audit-Agent           | [.github/agents/qa-reviewer.agent.md](../.github/agents/qa-reviewer.agent.md) + [.github/agents/devops-expert.agent.md](../.github/agents/devops-expert.agent.md)               |
| Website-SEO-Agent          | [.github/agents/website-frontend.agent.md](../.github/agents/website-frontend.agent.md)                                                                                         |
| Accessibility-Agent        | [.github/agents/qa-reviewer.agent.md](../.github/agents/qa-reviewer.agent.md) (Fokus a11y)                                                                                      |
| Security/DSGVO-Agent       | [.github/agents/security-reviewer.agent.md](../.github/agents/security-reviewer.agent.md)                                                                                       |
| GitHub-Project-Agent       | [.github/agents/task-planner.agent.md](../.github/agents/task-planner.agent.md) + [.github/agents/speckit-head-master.agent.md](../.github/agents/speckit-head-master.agent.md) |
| Forum-SpecKit-Agent        | [.github/agents/forum-phpbb.agent.md](../.github/agents/forum-phpbb.agent.md) + Speckit-Workflow-Agents                                                                         |
| CRM-Migration-Agent        | [.github/agents/crm-drupal-civicrm.agent.md](../.github/agents/crm-drupal-civicrm.agent.md)                                                                                     |
| n8n-Integration-Agent      | [.github/agents/automation-n8n.agent.md](../.github/agents/automation-n8n.agent.md)                                                                                             |
| Microsoft-Graph-Agent      | [.github/agents/devops-expert.agent.md](../.github/agents/devops-expert.agent.md) (Spezialisierung „entra-operator")                                                            |
| Stripe-Agent               | [.github/agents/api-fastapi.agent.md](../.github/agents/api-fastapi.agent.md) (Donation-Endpunkte)                                                                              |
| Slack-Agent                | derzeit nicht etabliert — vor Einführung Governance-Eintrag in `.github/ai-registry.json` nötig                                                                                 |
| Admin-Control-Center-Agent | neu zu definieren wenn [specs/008](../specs/008-admin-control-center/) priorisiert wird                                                                                         |
| Postiz-Evaluation-Agent    | einmaliger Auftrag, kein dauerhafter Agent                                                                                                                                      |

**Es wird keine parallele Agenten-Governance eingeführt** (siehe [AGENTS.md](../AGENTS.md) „Routing-Regeln").

## 14 Risiken (Auszug, ergänzend zum Risikoregister)

| Risiko                        | Wahrscheinlichkeit | Empfehlung                                                                                                |
| ----------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| Single-Server-Hosting         | hoch               | Phase 1 Migration, Multi-Server-Architektur                                                               |
| Fehlende Governance/Policy    | hoch               | wird durch [AGENTS.md](../AGENTS.md) + Core-Instructions abgedeckt                                        |
| Barrierefreiheit (EN 301 549) | mittel             | [specs/009](../specs/009-seo-accessibility-hardening/)                                                    |
| Stripe/Daten-Compliance       | mittel             | DPIA, Verfahrensverzeichnis vor Donation-Cutover                                                          |
| Komplexität Admin-Zentrale    | mittel             | MVP-Scope strikt halten, modularer Aufbau                                                                 |
| Postiz-Lizenz (AGPL)          | mittel             | nur referenzieren                                                                                         |
| Prompt-Injection/KI-Risiken   | mittel             | siehe `.github/instructions/security-and-owasp.instructions.md`                                           |
| Donation-Staging-Block        | hoch (offen)       | siehe [runbooks/n8n-staging-routing-implementation.md](../runbooks/n8n-staging-routing-implementation.md) |

Vollständige Liste: [docs/notebooklm-export/09-risk-register.md](notebooklm-export/09-risk-register.md).

## 15 Sofortmaßnahmen

1. P0-Audit beenden (laufend in [specs/001](../specs/001-workspace-governance-audit/)).
1. Zielarchitektur-Stakeholder-Meeting (siehe [docs/architecture/plattform-gesamtaudit-und-zielarchitektur.md](architecture/plattform-gesamtaudit-und-zielarchitektur.md)).
1. SEO/Accessibility-Quickwins (siehe [specs/009](../specs/009-seo-accessibility-hardening/)).
1. Admin-Zentrale-Scope schärfen (siehe [specs/008](../specs/008-admin-control-center/)).
1. Donation-Staging-Smoke grün bringen.
1. Stripe-DPIA und Verfahrensverzeichnis vorbereiten.
1. Entra-ID-Stufenmodell weiterführen (siehe [runbooks/copilot-microsoft-operator.md](../runbooks/copilot-microsoft-operator.md)).

## 16 Annahmen und Geltung

- Aufwandsschätzungen, finale Sprint-Planung und Verantwortlichkeiten obliegen dem Repo-Team.
- Bei Strukturänderungen am Repo greift die Dokumentationsregel aus [.github/copilot-instructions.md](../.github/copilot-instructions.md): `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/ai-registry.json`, `.github/instructions/copilot-workflow.md`, `.github/chatmodes/README.md`, `.github/prompts/README.md` werden mitgezogen.
- Branching-Modell: **Main-first**. PRs gegen `main`, keine separate `dev`-Linie.
- Sprache: Deutsch (österreichisch).

# Feature Specification: Admin-Steuerzentrale (Control Center)

**Feature Branch**: `008-admin-control-center`

**Created**: 2026-05-20

**Status**: Draft

**Input**: Externe Quelle — Masterplan 2.0 (siehe [docs/masterplan-2.0.md](../../docs/masterplan-2.0.md), Abschnitt 8 und Phase 4).

> Diese Spezifikation ergänzt die kanonische Governance ([AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md)).
> **Konflikte mit der Repo-Governance werden zugunsten der Repo-Governance aufgelöst.**

## 1 Strategische Entscheidung

Eine zentrale Admin-Oberfläche bündelt Steuerungs-, Monitoring- und Compliance-Funktionen der Plattform. Sie ersetzt **nicht** die fachspezifischen UIs (CiviCRM, n8n-Editor, Stripe-Dashboard, Forum-Adminpanel), sondern bietet eine konsolidierte Sicht und gemeinsamen SSO-Einstieg.

## 2 User Story (Primär)

**Als** Vorstand, Geschäftsführung oder Tech-Lead
**möchte ich** in einer einzigen geschützten Oberfläche den Zustand aller Plattform-Module sehen, häufige Aufgaben (z. B. Forum-Moderation, Spenden-Quittung, Workflow-Restart) ausführen und Audit-Logs einsehen können,
**damit** ich Plattform-Risiken früh erkenne und Compliance-Pflichten effizient erfülle.

## 3 Funktionale Anforderungen (MVP)

| ID    | Anforderung                            | Akzeptanzkriterium                                                                                                    |
| ----- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Authentifizierung über Entra ID (OIDC) | Nur Nutzer mit Rolle `admin` oder `auditor` erhalten Zugang; JWT-Lifetime ≤ 1 h.                                      |
| FR-02 | Dashboard mit Live-Status der Services | Karten für API, CRM, Forum, Website, Babylon-Game, n8n; Up/Down + letzte Healthcheck-Zeit.                            |
| FR-03 | Forum-Moderations-Queue                | Liste offener Meldungen, Quick-Actions „Approve/Reject/Hide", direkter Link in Forum.                                 |
| FR-04 | CRM-Kontakt-Suche (read-only)          | Suche nach Name/E-Mail/Mitgliedsnummer, max. 50 Treffer, PII-Reduktion (keine vollständige Adresse in Listenansicht). |
| FR-05 | Spenden-Übersicht (Aggregate)          | Tages-/Monatssumme, Top-Kampagnen; keine personenbezogenen Einzeltransaktionen.                                       |
| FR-06 | n8n-Workflow-Monitor                   | Liste aktiver Workflows, letzter Lauf, Fehlerquote; „Re-Run" nur für ausgewählte Workflows.                           |
| FR-07 | Benachrichtigungs-Center               | E-Mail- und (optional) Slack-Alerts bei kritischen Events; Konfiguration durch Admin.                                 |
| FR-08 | Rollen-/Rechte-Management              | `admin`, `auditor`, `moderator`, `finance`; UI-Sichtbarkeit per Rolle.                                                |
| FR-09 | Audit & Compliance                     | Unveränderbares Audit-Log aller Admin-Aktionen (Append-only); DSGVO-Export-Knopf pro Kontakt.                         |
| FR-10 | Mehrsprachigkeit                       | UI Deutsch (österreichisch) verpflichtend, Englisch optional.                                                         |

## 4 Nicht-funktionale Anforderungen

- **DSGVO**: PII nur server-seitig dekodieren, nie in Browser-Logs; Cookie-Policy ohne externes Tracking.
- **Sicherheit**: CSP, HSTS, Referrer-Policy, CSRF-Token, Rate-Limiting pro Account und IP.
- **Performance**: First Contentful Paint < 2,5 s im internen Netz.
- **Accessibility**: WCAG 2.2 AA.
- **Logging**: strukturierte JSON-Logs in ELK-Stack; keine PII in Logmeldungen.

## 5 Out of Scope (MVP)

- Direkte Bearbeitung von CRM-Stammdaten (bleibt CiviCRM-UI).
- Direkte Bearbeitung von n8n-Workflows (bleibt n8n-Editor).
- Mobile-App (nur responsive Web).
- KI-gestützte Antwort-Generierung (separates Spec-Paket).

## 6 Datenflüsse (Skizze)

```text
Browser (Entra-ID Login)
   │  signed JWT, role-claim
   ▼
Admin-Backend (FastAPI, neu unter apps/api/control-center/ oder eigene App)
   │  read-only / write-restricted
   ├─► apps/api          (Donation-Aggregate, KPI)
   ├─► apps/crm/CiviCRM  (CiviCRM REST APIv4, OAuth-Token)
   ├─► apps/forum        (Moderation-API, Token)
   ├─► automation/n8n    (n8n REST, Token)
   └─► Stripe API        (read-only Aggregates, Webhook-Signaturen)
   │
   ▼
ELK-Stack (Audit-Log Index `admin-audit-*`)
```

## 7 Risiken

| Risiko                                     | Mitigation                                                           |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Erhöhte Angriffsfläche (zentrales Backend) | Strenge Rollen, MFA via Entra, IP-Allowlist optional                 |
| Synchron-Aufrufe verlangsamen UI           | Hintergrund-Jobs + Polling, Caching mit TTL ≤ 60 s                   |
| Falsche Aggregation Spenden (Compliance)   | Read-only auf View-Layer der Datenbank, dokumentierte Query          |
| Scope-Creep                                | strikte MVP-Liste, jede Erweiterung als eigenes Issue mit Spec-Bezug |

## 8 Abhängigkeiten

- Entra-ID-Stufenmodell siehe [runbooks/copilot-microsoft-operator.md](../../runbooks/copilot-microsoft-operator.md).
- Donation-Aggregate-Endpunkt aus [specs/002-infrastruktur-donation-masterplan/](../002-infrastruktur-donation-masterplan/).
- Forum-Moderations-Schnittstelle aus [specs/006-forum-eigenbau-moderation/](../006-forum-eigenbau-moderation/).
- CRM-Auslagerungs-Status aus [specs/007-crm-drupal-civicrm-auslagerung/](../007-crm-drupal-civicrm-auslagerung/).

## 9 Definition of Done (Spec-Reife)

- [ ] Stakeholder-Review (Vorstand, Tech-Lead, DSB).
- [ ] DPIA für Admin-Center skizziert.
- [ ] Architektur-Entscheidung (eigene App vs. Modul in `apps/api`) dokumentiert.
- [ ] `plan.md` mit Technologie-Wahl (React 19 + shadcn/ui empfohlen) erstellt.
- [ ] `tasks.md` mit numerierten Tasks erstellt.
- [ ] Issues via `speckit.taskstoissues` generiert.

## 10 Offene Fragen

1. Eigenständige App (`apps/admin-control/`) oder Modul in `apps/website` mit geschützter Route?
1. Wird Slack als Alert-Kanal aufgenommen (würde neuen Eintrag in `.github/ai-registry.json` erfordern)?
1. Soll der DSGVO-Export-Knopf direkt PDF erzeugen oder eine asynchrone Job-Queue auslösen?

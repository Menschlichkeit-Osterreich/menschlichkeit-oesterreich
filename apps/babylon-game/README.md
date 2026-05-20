# Babylon Game – Demokratie-Game „Brücken bauen"

Spielerische Lern- und Beteiligungsplattform auf Basis von Next.js 16 und Babylon.js 8. Teil des Monorepos `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

## Zweck

Interaktives 3D-Spiel zur Vermittlung demokratischer Prozesse, Vereinsarbeit und gesellschaftlicher Teilhabe. Das Modul ist eines der aktiven Services neben Website, API, CRM und Forum.

- Spec: [specs/005-democracy-game-bruecken-bauen](../../specs/005-democracy-game-bruecken-bauen/)
- Service-Agent (Copilot): [.github/agents/games-babylon.agent.md](../../.github/agents/games-babylon.agent.md)

## Tech-Stack

| Bereich      | Version                                                           |
| ------------ | ----------------------------------------------------------------- |
| Runtime      | Node.js >= 22.19                                                  |
| Framework    | Next.js 16.2 (Turbopack)                                          |
| UI           | React 19                                                          |
| 3D           | Babylon.js 8.41 (`@babylonjs/core`, `gui`, `addons`, `materials`) |
| Physik       | `@babylonjs/havok` 1.3                                            |
| Editor-Tools | `babylonjs-editor-cli`, `babylonjs-editor-tools`                  |
| Styling      | Tailwind CSS 3.4, PostCSS                                         |
| Tests        | Vitest 3.2                                                        |
| Sprache      | TypeScript 5.9                                                    |

## Verzeichnisstruktur

```
apps/babylon-game/
├── src/                # Next.js App-Router-Quellcode, Babylon-Szenen
├── public/             # Statische Assets, ausgelieferte Babylon-Bundles
├── assets/             # Roh-Assets vor Build (Modelle, Texturen)
├── tests/              # Integrations- und E2E-Tests
├── unit/               # Unit-Tests (Vitest)
├── project.bjseditor   # Babylon.js Editor Projekt
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── package.json
```

## Standardbefehle

| Aktion                  | Befehl                       |
| ----------------------- | ---------------------------- |
| Dev-Server (Port 3001)  | `npm run dev`                |
| Production-Build        | `npm run build`              |
| Production-Start        | `npm run start`              |
| Build + Start           | `npm run preview`            |
| Unit-Tests              | `npm run test:unit`          |
| Unit-Tests mit Coverage | `npm run test:unit:coverage` |
| Babylon-Assets packen   | `npm run generate`           |
| Lint                    | `npm run lint`               |
| Lint Auto-Fix           | `npm run lint:fix`           |
| Type-Check              | `npm run type-check`         |
| Build-Output löschen    | `npm run clean`              |

Aus dem Repo-Root analog:

| Aktion             | Befehl                        |
| ------------------ | ----------------------------- |
| Dev-Server starten | `npm run dev:games`           |
| Unit-Tests         | `npm run test:games:unit`     |
| Coverage           | `npm run test:games:coverage` |

## Ports

- Development: `3001`
- Konflikt-Hinweis: Port wird in [docker-compose.yml](../../docker-compose.yml) reserviert, parallel zu Website (5173), API (8001), CRM (8000) und Forum (8002).

## Build-Pipeline für Babylon-Assets

1. Assets im Editor (`project.bjseditor`) bearbeiten oder unter `assets/` ablegen.
2. `npm run generate` ruft `babylonjs-editor-cli pack` auf und erzeugt Bundles unter `public/`.
3. Bundles werden in der Next.js-Anwendung via dynamischem Import geladen.

Hinweis: Generierte Artefakte unter `.next/` und `public/<generated>/` sind nicht versioniert.

## Tests

- **Unit:** Vitest unter `unit/`, schnelle, isolierte Komponenten- und Logik-Tests.
- **Integration / E2E:** unter `tests/` (Playwright-kompatibel, falls erweitert).
- **Audit-Artefakt:** [audit-babylon.json](audit-babylon.json) als Baseline für Performance- und Security-Audits.

CI-Einbindung über die Quality-Gates des Repos (`npm run quality:gates`).

## Schnittstellen zu anderen Services

- **API** ([apps/api](../api/)): Spielstände, Mitglieds- und Vereinsdaten via FastAPI-Endpunkte (siehe [apps/api/openapi.yaml](../api/openapi.yaml)).
- **CRM** ([apps/crm](../crm/)): Verknüpfung zu CiviCRM-Kontakten über die API, nicht direkt.
- **Website** ([apps/website](../website/)): Einstieg und Einbettung über Links / iFrames.
- **n8n** ([automation/n8n](../../automation/n8n/)): Ereignis-Hooks (z. B. Spielabschluss → Mailversand) ausschließlich über die API, nicht direkt aus dem Client.

Direkter Zugriff auf CRM, Mail oder Zahlungsdienste aus dem Game-Client ist nicht zulässig (Security- und DSGVO-Grenze).

## Konfiguration und Secrets

- Es werden keine clientseitigen Secrets erwartet.
- Optional benötigte Build-Variablen (z. B. API-Base-URL für Production) werden über Next.js-Env-Mechanik gesetzt; produktive Werte stammen aus Bitwarden Secrets Manager (siehe [SECRETS-QUICK-START.md](../../SECRETS-QUICK-START.md)).
- `.env*`-Dateien gehören nie ins Repo. `.local-secrets/` ist gitignored.

## DSGVO und Datenminimierung

- Keine PII im Game-Client.
- Telemetrie und Spielstand-Daten gehen ausschließlich über die API mit dort definierter Datenklassifikation.
- Tracking ohne expliziten Consent ist nicht erlaubt (siehe [.github/instructions/core/dsgvo-compliance.instructions.md](../../.github/instructions/core/dsgvo-compliance.instructions.md)).

## Verantwortlichkeiten

- Repo-Rolle: `developer` mit Service-Spezialisierung `games-babylon` (siehe [AGENTS.md](../../AGENTS.md))
- QA: `qa-reviewer` mit Fokus Performance/Accessibility ([.github/agents/qa-reviewer.agent.md](../../.github/agents/qa-reviewer.agent.md))
- DevOps: `devops-expert` für CI/CD-Anbindung

## Verwandte Dokumente

- [README.md](../../README.md) – Repo-Überblick
- [AGENTS.md](../../AGENTS.md) – Rollen und Routing
- [CLAUDE.md](../../CLAUDE.md) – Repo-Betrieb
- [TEST_MATRIX.md](../../TEST_MATRIX.md) – Test-Strategie
- [specs/005-democracy-game-bruecken-bauen/spec.md](../../specs/005-democracy-game-bruecken-bauen/spec.md)
- [specs/005-democracy-game-bruecken-bauen/plan.md](../../specs/005-democracy-game-bruecken-bauen/plan.md)

# Menschlichkeit Oesterreich

Monorepo fuer Website, FastAPI-Backend, Drupal/CiviCRM, Babylon-Game, MCP-Server und OpenClaw-Tooling.

## Betriebsmodell

- `main` ist der einzige Integrations- und Release-Branch.
- `apps/api/` ist die autoritative Backend-Quelle fuer Router, Services, Migrationen und `openapi.yaml`.
- `api.menschlichkeit-oesterreich.at/` bleibt nur Legacy-/Mirror-Bestand ohne neue Feature-Entwicklung.
- `apps/game/` ist ein Artefakt-/Legacy-Pfad. Die aktive Spiel-App liegt in `apps/babylon-game/`.
- `apps/website/` liefert hostabhaengig sowohl die oeffentliche Website (`www`) als auch das CRM-Portal (`crm`).
- `apps/crm/` ist die Quelle fuer das native Drupal/CiviCRM-Backoffice unter `crm.menschlichkeit-oesterreich.at/native/`.

## Wichtige Bereiche

| Bereich                     | Pfad                                   | Status                                        |
| --------------------------- | -------------------------------------- | --------------------------------------------- |
| Website                     | `apps/website/`                        | aktiv                                         |
| API                         | `apps/api/`                            | aktiv, Source of Truth                        |
| CRM                         | `apps/crm/`                            | aktiv                                         |
| Babylon Game                | `apps/babylon-game/`                   | aktiv                                         |
| Legacy API Mirror           | `api.menschlichkeit-oesterreich.at/`   | nur Referenz                                  |
| OpenClaw                    | `openclaw-system/`                     | aktiv                                         |
| MCP-Server                  | `mcp-servers/`                         | aktiv                                         |
| Hidden Toolkits             | `.browser-pilot/`, `.blender-toolkit/` | separat klassifiziert, kein Root-Lint-Blocker |
| Incident-/Qualitaetsreports | `quality-reports/`, `reports/`         | erzeugte Evidenz                              |

## Schnellstart

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

npm ci
python -m pip install -r apps/api/requirements-dev.txt

cp apps/api/.env.example apps/api/.env
cp apps/website/.env.example apps/website/.env.local

npm run dev:frontend
npm run dev:api
```

## Wichtige Befehle

```bash
npm run lint
npm run lint -- --max-warnings=0
npm run test:unit -- --run
npm run test:api
npm run build:workspaces
npm run build:frontend
npm run build:babylon
npm run a11y:test
npm run performance:lighthouse
```

## Qualitaetsvertrag

- Root-Lint deckt First-Party-Root-Code und `mcp-servers/**` ab.
- `.browser-pilot/**` und `.blender-toolkit/**` sind bewusst aus dem Root-Lint ausgeschlossen, bis sie eigene Paket-/Gate-Vertraege haben.
- Die kanonische Python-Test-Suite ist `apps/api/tests/`.
- `quality.yml` und `ci.yml` nutzen denselben ESLint-Scope; Fehler blockieren, Warnungen werden berichtet.
- `apps/api/openapi.yaml` ist die einzige aktiv gepflegte API-Referenz.

## API-Vertrag

- Base URL lokal: `http://localhost:8001`
- API Prefix: `/api`
- Health: `/healthz`, `/readyz`
- Doku lokal: `/api/docs`
- OpenAPI-Datei: `apps/api/openapi.yaml`

Fuer neue Backend-Arbeit gilt immer:

```bash
cd apps/api
python -m pytest tests -q
```

## OpenClaw Windows Bridge

Die Windows-Bridge liegt in `openclaw-system/windows-bridge/` und ist ein eigenes Node-Paket. Sie stellt lokal standardmaessig diese Endpunkte bereit:

- `GET /health`
- `ANY /agent/*`
- `ANY /tools/*`
- `GET /wsl/status`
- `POST /wsl/start-stack`

Website-Integrationen verwenden `VITE_OPENCLAW_BRIDGE_URL`, standardmaessig `http://127.0.0.1:18790`.

## Incident- und Report-Artefakte

- Generatoren schreiben nach `quality-reports/`.
- Publizierbare oder handkuratierte Spiegel liegen unter `reports/`.
- Incident-Aenderungen werden als eigener Change-Cluster behandelt und nicht mit Governance-, API- oder Plattformarbeit vermischt.

## Vendor- und Mirror-Policy

- Vendor-/Mirror-Flaechen bleiben im Analyse-Scope.
- Lokale Patches in `apps/crm/web/core/**`, `codacy-analysis-cli-master/**` oder aehnlichen Spiegeln duerfen nur als explizite, begruendete Abweichung erfolgen.
- Neue Produktlogik gehoert nicht in Mirror-Baeume.

## Weiterfuehrende Dokumente

- `CONTRIBUTING.md`
- `CLAUDE.md`
- `apps/api/README.md`
- `api.menschlichkeit-oesterreich.at/README.md`
- `openclaw-system/ARCHITECTURE.md`
- `analysis/REPOSITORY_TOTALPRUEFUNG_v3.0.0.md`

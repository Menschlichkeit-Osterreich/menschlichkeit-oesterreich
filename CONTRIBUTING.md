# Contributing

## Branch- und PR-Modell

- Arbeite immer von `main` aus.
- Erstelle thematisch kleine Branches wie `feature/...`, `fix/...`, `docs/...`, `chore/...`.
- Pull Requests gehen gegen `main`.
- Es gibt aktuell keinen gepflegten `develop`-Flow.

## Vor jedem PR

```bash
npm run lint
npm run test:unit -- --run
npm run test:api
npm run build:workspaces
```

Bei Frontend- oder OpenClaw-Aenderungen kommen zusaetzlich dazu:

```bash
npm run build:frontend
npm run a11y:test
npm run performance:lighthouse
```

## Repo-Vertraege

- `apps/api/` ist die einzige aktive Backend-Quelle.
- `api.menschlichkeit-oesterreich.at/` ist Legacy-/Mirror-Bestand.
- `apps/game/` ist kein aktiver Produkt-Workspace.
- Hidden Toolkits unter `.browser-pilot/` und `.blender-toolkit/` werden nicht automatisch ueber Root-ESLint erzwungen.

## Incident- und Report-Arbeit

- Incident-Aenderungen bleiben in einem eigenen Cluster.
- Generator-Ausgaben gehoeren nach `quality-reports/`.
- Lesbare oder externe Artefakte werden nach `reports/` gespiegelt.
- Mische Incident-Reports nicht mit Plattform-, API- oder Doku-Aenderungen im selben PR.

## Vendor- und Mirror-Code

- Vendor-/Mirror-Baeume nicht stillschweigend veraendern.
- Jeder Patch in Fremdcode braucht einen klaren Grund und eine sichtbare Dokumentation im PR.
- Neue Features gehoeren in First-Party-Code, nicht in Spiegelverzeichnisse.

## Commit-Konvention

Wir verwenden Conventional Commits:

```text
feat(scope): beschreibung
fix(scope): beschreibung
docs(scope): beschreibung
chore(scope): beschreibung
```

## Regelmaessiger Git-Sync

Hooks einmalig aktivieren:

```bash
npm run git:hooks:enable
npm run git:hooks:status
```

Der kanonische Hook-Pfad ist `.githooks/`.
Aktiv sind dabei insbesondere:

- `pre-commit`: blockiert echte `.env`-Dateien und startet `lint-staged`
- `commit-msg`: prüft Conventional Commits via `commitlint`
- `pre-push`: führt `npm run governance:check`, `npm run mcp:check` und `npm run test:api` aus; Codacy läuft zusätzlich, wenn Docker lokal verfügbar ist

GitHub-Login fuer HTTPS-Remote und Credential Manager:

```bash
npm run git:auth:github
```

Status und sicherer Sync:

```bash
npm run git:sync:status
npm run git:sync -- -Message "chore(repo): sync workspace"
```

Wichtige Regeln:

- Standardmaessig werden nur bereits verfolgte Dateien automatisch gestaged.
- Untracked Dateien werden nur mit `-IncludeUntracked` aufgenommen.
- Governance-Dateien loesen vor dem Commit automatisch `npm run governance:check` aus.
- Der Sync macht kein Force-Push und kein `--no-verify`.

## API-Arbeit

```bash
python -m pip install -r apps/api/requirements-dev.txt
cd apps/api
python -m pytest tests -q
```

- Aktualisiere bei API-Aenderungen immer `apps/api/openapi.yaml`.
- Brechende Aenderungen an bestehenden `/api/*`-Routen sind nur mit expliziter Abstimmung erlaubt.

## Kontakt

- Issues: GitHub Issues
- Security: `security@menschlichkeit-oesterreich.at`
- Entwicklung: `dev@menschlichkeit-oesterreich.at`

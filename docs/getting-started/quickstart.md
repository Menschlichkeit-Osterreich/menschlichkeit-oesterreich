# Quickstart – Repo-Root und aktive Services

Dies ist der schlanke Einstieg aus der Doku-Navigation. Für den Gesamtüberblick siehe [Dokumentationsindex](../README.md) und für den operativen Deployvertrag [../../README_DEPLOY.md](../../README_DEPLOY.md).

## Kanonischer Repo-Root

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich.git
cd menschlichkeit-oesterreich
```

## Aktive Produktpfade

- `apps/website/` fuer Website und CRM-Portal
- `apps/api/` fuer FastAPI und OpenAPI
- `apps/crm/` fuer Drupal/CiviCRM unter `crm/.../native`
- `apps/babylon-game/` fuer Games
- `mcp-servers/` und `openclaw-system/` fuer Tooling und Agent-Runtime

## Schnellstart lokal

```bash
npm ci
python -m pip install -r apps/api/requirements-dev.txt
npm run dev:frontend
npm run dev:api
```

## Standard-Ports

- Frontend: `http://localhost:5173`
- API: `http://localhost:8001`
- CRM: `http://localhost:8000`
- Games: `http://localhost:3001`
- Forum: `http://localhost:8002`

## Betriebsvertrag

- Produktionsdeploy: `.github/workflows/deploy-plesk.yml`
- Deploy-Doku: `../../README_DEPLOY.md`
- Health API: `/healthz` und `/readyz`
- Legacy-Alias: `/health`

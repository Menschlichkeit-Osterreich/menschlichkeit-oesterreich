# Menschlichkeit Oesterreich – Platform Wiki

Diese Seite ist die kanonische Wiki-Startseite fuer das aktive Repository `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

## Schnellstart

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich.git
cd menschlichkeit-oesterreich
npm run setup:dev
```

Wichtige lokale Services:

- Website / Portal: `http://localhost:5173`
- API: `http://localhost:8001`
- CRM: `http://localhost:8000`
- Games: `http://localhost:3001`

## Aktive Plattformpfade

- `apps/website/`
- `apps/api/`
- `apps/crm/`
- `apps/babylon-game/`
- `apps/forum/`
- `openclaw-system/`
- `mcp-servers/`

Legacy- und Mirror-Pfade wie `api.menschlichkeit-oesterreich.at/` oder `crm.menschlichkeit-oesterreich.at/` bleiben nur Referenz und sind keine aktiven Zielpfade fuer neue Produktarbeit.

## Betrieb und Deployment

- Produktionsdeploy: `.github/workflows/deploy-plesk.yml`
- Aktiver Branch: `main`
- API-Health: `/healthz`, `/readyz`
- API `/health` bleibt nur Legacy-Alias

## Wichtige Dokumente

- `README.md`
- `README_DEPLOY.md`
- `docs/README.md`
- `SECURITY.md`
- `apps/crm/README.md`
- `reports/repository-live-stabilization-assessment-2026-03-31.md`

## Externe Links

- Issues: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/issues
- Pull Requests: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/pulls
- Discussions: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/discussions
- Security Advisories: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/security

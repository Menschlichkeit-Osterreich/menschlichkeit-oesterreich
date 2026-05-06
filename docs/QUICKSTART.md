# Quick Start

Kurzanleitung fuer das aktive Monorepo `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

## Voraussetzungen

- Node.js 22+
- npm 11+
- Python 3.12+
- PHP 8.3+ fuer CRM/Drupal
- Docker fuer Forum und optionale Infrastruktur

## Repository holen

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich.git
cd menschlichkeit-oesterreich
```

## Lokales Setup

```bash
npm run setup:dev
python -m pip install -r apps/api/requirements-dev.txt
```

## Wichtige Services starten

```bash
npm run dev:frontend
npm run dev:api
```

Optional:

```bash
npm run dev:crm
npm run dev:games
npm run dev:forum
npm run dev:all
```

## Lokale Endpunkte

- Website / Portal: `http://localhost:5173`
- API: `http://localhost:8001`
- CRM: `http://localhost:8000`
- Games: `http://localhost:3001`
- Forum: `http://localhost:8002`

## Produktive Wahrheiten

- Aktive App-Pfade liegen unter `apps/`
- Produktiver Deploy-Vertrag liegt in `.github/workflows/deploy-plesk.yml`
- API-Health ist kanonisch unter `/healthz` und `/readyz`
- Legacy-Pfade wie `api.menschlichkeit-oesterreich.at/` bleiben nur Referenz

## Nützliche Checks

```bash
npm run governance:check
npm run test:api
npm run test:unit -- --run
npm run build:frontend
npm run build:babylon
```

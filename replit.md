# Menschlichkeit Österreich – Multi-Service NGO Platform

## Project Overview

An Austrian NGO platform providing democratic participation, education, and community engagement tools.

## Architecture

- **Frontend** (`apps/website/`): React + TypeScript + Vite + Tailwind CSS (SPA)
- **API** (`apps/api/`): Python FastAPI backend
- **CRM** (`apps/crm/`): Drupal 10 + CiviCRM
- **Website** (`website/`): Static HTML public website
- **Design System** (`figma-design-system/`): Design tokens (JSON) used by Tailwind

## Running the App

The main workflow runs the React frontend:

```
cd apps/website && npm run dev
```

- Host: `0.0.0.0`
- Port: `5000`
- Configured in `apps/website/vite.config.ts`

## Key Config Files

- `apps/website/vite.config.ts` — Vite server config (port 5000, all hosts allowed)
- `apps/website/tailwind.config.cjs` — Tailwind with Figma design tokens from `../../figma-design-system/00_design-tokens.json`
- `apps/website/src/routes/ProtectedRoute.tsx` — Auth guard (default export)

## Fixes Applied During Setup

1. Added `server` config to `vite.config.ts` for port 5000, host `0.0.0.0`, and `allowedHosts: true`
2. Fixed `ProtectedRoute.tsx` — changed named export to default export to match `App.tsx` import
3. Fixed `tailwind.config.cjs` path from `../figma-design-system/` to `../../figma-design-system/` (correct path from `apps/website/`)

## Deployment

Configured as a static site:
- Build: `cd apps/website && npm run build`
- Public dir: `apps/website/dist`

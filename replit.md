# Menschlichkeit Österreich – Multi-Service NGO Platform

## Project Overview

An Austrian NGO platform providing democratic participation, education, and community engagement tools.

## Architecture

- **Frontend** (`apps/website/`): React + TypeScript + Vite + Tailwind CSS (SPA)
- **API** (`apps/api/`): Python FastAPI backend
- **CRM** (`apps/crm/`): Drupal 10 + CiviCRM
- **Website** (`website/`): Static HTML public website
- **Design System** (`figma-design-system/`): Design tokens (JSON) used by Tailwind

## Brand Identity

- Logo: `apps/website/public/logo.jpg` — red-orange gradient with white tree (Baum) and "Verein Menschlichkeit Österreich"
- Primary brand color: red (#dc2626) to orange (#ea580c) gradient
- Design tokens updated to use red primary palette (was sky-blue)
- Austrian red-white brand colors

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
- `apps/website/src/styles/tokens.css` — CSS custom properties auto-generated from design tokens
- `figma-design-system/00_design-tokens.json` — Source design tokens (primary color = red)

## Key Components

- `apps/website/src/components/NavBar.tsx` — Sticky header with logo image, responsive nav, user dropdown
- `apps/website/src/layouts/PublicLayout.tsx` — Shell with NavBar + dark 3-column footer with logo
- `apps/website/src/pages/Home.tsx` — Hero with red-orange gradient + logo, stats bar, topic cards, CTA, footer

## Fixes Applied During Setup

1. Added `server` config to `vite.config.ts` for port 5000, host `0.0.0.0`, and `allowedHosts: true`
2. Fixed `ProtectedRoute.tsx` — changed named export to default export to match `App.tsx` import
3. Fixed `tailwind.config.cjs` path from `../figma-design-system/` to `../../figma-design-system/`

## Design Improvements

1. Logo image added to NavBar and Hero section
2. Brand primary colors changed from sky-blue to red (#dc2626) to match official logo
3. Redesigned Home page: full-width red-orange hero with logo, stats bar, 6-topic cards, CTA banner, info cards
4. Redesigned NavBar: logo + text branding, cleaner dropdown, better spacing
5. Redesigned Footer: dark 3-column layout with logo, navigation, contact info

## Deployment

Configured as a static site:
- Build: `cd apps/website && npm run build`
- Public dir: `apps/website/dist`

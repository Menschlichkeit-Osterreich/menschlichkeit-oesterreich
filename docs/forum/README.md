# Forum of the Future – Overview

**Status:** Draft · **Stand:** 2025-10-19
Dies ist die vereinheitlichte Blaupause (v1–v4) für ein phpBB-Forum auf Subdomain-Basis mit CI/CD, Security, Styling-Sync (Figma/Tailwind), KI‑Moderation, Community-Wachstum, Gamification und DSGVO/Ethik.

## Bereiche
- Betrieb/Runbooks → `docs/forum/OPERATIONS.md`
- Sicherheit/Hardening → `docs/forum/SECURITY.md`
- Styling/Designsystem → `docs/forum/STYLE-GUIDE.md`
- SSO/OIDC → `docs/forum/SSO-OIDC.md`
- Moderation & KI → `docs/forum/MODERATION.md`, `docs/forum/KI-MODERATION.md`
- Community‑Growth & KPIs → `docs/forum/COMMUNITY-GROWTH.md`
- Gamification → `docs/forum/GAMIFICATION.md`
- DSGVO → `docs/forum/DSGVO.md`
- Vision → `docs/forum/VISION.md`
- ADR → `docs/forum/ADR/ADR-0001-forum-subdomain.md`

## GitHub Workflows
- CI (Struktur/Docs): `.github/workflows/ci-forum.yml`
- Deploy (Plesk, deaktiviert bis Go‑Live): `.github/workflows/deploy-forum.yml`
- Tokens‑Sync (Figma → Theme): `.github/workflows/figma-tokens-sync.yml`
- KI‑Moderationsreport: `.github/workflows/moderation-ai.yml`

## n8n
- Social Crossposting: `automation/n8n/workflows/forum-viral.json`
- (Optional) KI-Moderation: `automation/n8n/workflows/forum-moderation.json`

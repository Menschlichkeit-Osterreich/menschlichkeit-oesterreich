# KI‑MODERATION – Automatisierung & Ethik

**Stand:** 2025-10-19

## Einsatzfelder
- Spamfilter, Toxicity, Summaries, Nudging, Auto‑Translate

## Architektur
- phpBB → Webhook → n8n → AI (Moderation/Summaries) → Aktionen (Post OK / Warnung / Quarantäne)

## DSGVO
- Pseudonymisierte IDs, Opt‑In für KI‑Checks, Logs ohne Klarnamen, Transparenzseite

## Reports
- Weekly Moderationsreport via `.github/workflows/moderation-ai.yml`

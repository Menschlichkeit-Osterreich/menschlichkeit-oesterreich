# Prompts Migration Guide

Updated: 2026-05-04
Status: ACTIVE

## Zielzustand

Die Legacy-Chatmode-Ablage unter `.github/prompts/chatmodes/` wurde entfernt.

Aktive Artefakte:

- Chatmodes: `.github/chatmodes/**/*.chatmode.md`
- Prompts: `.github/prompts/*.prompt.md`
- Klassifikation und Zuordnung: `.github/ai-registry.json`

## Pflege-Regeln

1. Neue Zuordnungen immer direkt in `.github/ai-registry.json` erfassen.
1. Bei Governance-Aenderungen `AGENTS.md`, `CLAUDE.md` und `.github/copilot-instructions.md` synchron halten.
1. Validierung ausfuehren: `npm run workspace:config:check` und `npm run governance:check`.

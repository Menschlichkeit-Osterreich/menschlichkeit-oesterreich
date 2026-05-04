---
status: ACTIVE
lastUpdated: 2026-05-04
scope: post-legacy-cleanup
---

# Prompt/Chatmode Migration Map

Die historische Legacy-Chatmode-Struktur unter `.github/prompts/chatmodes/` wurde entfernt.

## Aktueller Zustand

- Fuehrende Chatmodes liegen unter `.github/chatmodes/**/*.chatmode.md`.
- Prompt-Artefakte liegen unter `.github/prompts/*.prompt.md`.
- Die machine-readable Klassifikation liegt in `.github/ai-registry.json`.

## Migrationsregel

- Neue oder geaenderte Zuordnungen werden direkt in `.github/ai-registry.json` gepflegt.
- Diese Datei dient nur als kurze Referenz auf den Zielzustand nach der Bereinigung.

# Aktive Chatmodes

`.github/chatmodes/` ist die aktive, menschenlesbare Mode-Ebene fuer dieses Repository.

## Verwendung

- `AGENTS.md` entscheidet, welcher Chatmode zu welcher Rolle passt.
- `CLAUDE.md` und `.github/copilot-instructions.md` verweisen auf diese Struktur.
- Chatmodes sind aktiv; YAML-Varianten unter `.github/prompts/chatmodes/` sind Legacy.

## Struktur

- `general/` - allgemeine Arbeitsmodi wie Architektur, Review, Sicherheit, Onboarding
- `development/` - entwicklungsnahe Modi wie API-Design oder MCP-Code-Review
- `compliance/` - DSGVO- und Security-nahe Modi
- `operations/` - betriebsnahe Modi

## Pflege

- neue aktive Modi nur hier anlegen
- `INDEX.md` aktuell halten
- Pfade und Repo-Identitaet immer mit `AGENTS.md` und `CLAUDE.md` abgleichen

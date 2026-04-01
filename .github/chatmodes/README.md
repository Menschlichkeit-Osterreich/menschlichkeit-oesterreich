# Aktive Chatmodes

`.github/chatmodes/` ist die aktive, menschenlesbare Mode-Ebene fuer dieses Repository.

## Verwendung

- `AGENTS.md` entscheidet, welcher Chatmode zu welcher Rolle passt.
- `.github/instructions/core/analysis-planning.instructions.md` ist der kanonische Analyse-Einstieg.
- `CLAUDE.md` und `.github/copilot-instructions.md` verweisen auf diese Struktur.
- `.github/ai-registry.json` klassifiziert den Status der Artefakte.
- Chatmodes sind aktiv; YAML-Varianten unter `.github/prompts/chatmodes/` sind Legacy.

## Struktur

- `general/` - allgemeine Arbeitsmodi wie Architektur, Review, Sicherheit, Onboarding
- `general/AnalysePlanung_DE.chatmode.md` - bevorzugter Analyse- und Planungsmodus
- `development/` - entwicklungsnahe Modi wie API-Design oder MCP-Code-Review
- `compliance/` - DSGVO- und Security-nahe Modi
- `operations/` - betriebsnahe Modi

## Pflege

- neue aktive Modi nur hier anlegen
- `INDEX.md` aktuell halten
- Pfade und Repo-Identitaet immer mit `AGENTS.md` und `CLAUDE.md` abgleichen
- Legacy-Modi aus `.github/modes/` duerfen hier nicht wieder als aktiv reaktiviert werden

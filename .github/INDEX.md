# .github – Konsolidierter Index

Zweck: Zentrales Verzeichnis der konsolidierten Chatmodes, Instructions und Prompts nach der Reorganisation (Phasen 1–4 abgeschlossen, Phase 5 in Arbeit).

Hinweis (Legacy → Neu): Die frühere, tabellarische Auflistung und das Verzeichnis `modes/` wurden migriert. Nutze die untenstehenden Indizes und den Migrationsleitfaden.

---

## Schnellzugriff

- Indizes (auto-generiert, Quelle der Wahrheit)
  - .github/instructions/INDEX.md → Übersicht aller Instructions nach Kategorien
  - .github/chatmodes/INDEX.md → Übersicht aller Chatmodes nach Kategorien
- Migration & Änderungen
  - .github/prompts/MIGRATION.md → Migrationsleitfaden (Legacy → Ziel-Dateien)
  - .github/CHANGELOG-GITHUB-FILES.md → Changelog der Konsolidierung
  - .github/VERSIONING-AND-CONSOLIDATION-PLAN.md → 5‑Phasen‑Plan (Status & KPIs)
  - .github/PHASE-4-REPORT.md → Abschlussbericht Validierung/CI

---

## Aktuelle Struktur (Top-Level)

- chatmodes/ … neue Chatmode-Dateien nach Kategorien (development, operations, compliance, content, general)
- instructions/ … konsolidierte Instructions (core, …) mit standardisiertem Frontmatter
- prompts/ … verbleibende thematische Prompts und Migrationsartefakte (MIGRATION.md / MIGRATION_MAP.json)
- workflows/ … CI-Workflows (inkl. Validierung der .github-Dateien)

Details und vollständige Listen siehe die jeweiligen Indizes:

- [.github/instructions/INDEX.md](instructions/INDEX.md)
- [.github/chatmodes/INDEX.md](chatmodes/INDEX.md)

---

## Legacy-Hinweise

- Das frühere Verzeichnis `modes/` bleibt vorerst zur Referenz bestehen, ist jedoch als Legacy zu betrachten. Für neue Arbeiten bitte ausschließlich `chatmodes/` verwenden.
- Historische Tabellen (Ausführungsreihenfolgen, n8n-Library-Listen etc.) wurden in strukturierte Dateien überführt. Die Migration ist im Migrationsleitfaden dokumentiert.

Siehe: [.github/prompts/MIGRATION.md](prompts/MIGRATION.md)

---

## Qualitäts- und Compliance‑Automatisierung

- Frontmatter‑Normalisierung und Validierung: lokal per
  - npm run github:normalize
  - npm run github:validate
- CI‑Durchsetzung: [.github/workflows/validate-github-files.yml](workflows/validate-github-files.yml)

Erwartung: 0 Fehler im Validator; neue Dateien in `instructions/` und `chatmodes/` müssen das standardisierte Frontmatter enthalten.

---

## Nützliche Links

- Projektweite Entwicklungsregeln: [.github/instructions/core/project-development.instructions.md](instructions/core/project-development.instructions.md)
- Quality Gates: [.github/instructions/core/quality-gates.instructions.md](instructions/core/quality-gates.instructions.md)
- MCP‑Integration: [.github/instructions/core/mcp-integration.instructions.md](instructions/core/mcp-integration.instructions.md)
- Plesk Deployment: [.github/instructions/core/plesk-deployment.instructions.md](instructions/core/plesk-deployment.instructions.md)
- Figma/Design‑System: [.github/instructions/core/figma-mcp.instructions.md](instructions/core/figma-mcp.instructions.md)

---

Letzte Aktualisierung: 2025-10-08 (Index an neue Struktur angepasst)
Maintainer: Development Team via GitHub Issues

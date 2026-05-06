---
title: Changelog – .github Konsolidierung
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: quality
applyTo: ".github/**"
---

# Changelog – .github Konsolidierung

## [1.0.0] – 2025-10-08

### Added
- Einheitliche YAML-Frontmatter für Instructions & Chatmodes
- Automatische Validierung via CI (`validate-github-files.yml`)
- Migration Guide Generator (`scripts/generate-migration-guide.py`)

### Changed
- Reorganisation in kategorisierte Unterordner
- Index-Dateien für `instructions/` und `chatmodes/`

### Deprecated
- Legacy Prompts unter `.github/prompts/` (siehe MIGRATION.md / MIGRATION_MAP.json)

### Fixed
- Frontmatter-Normalisierung und Metadaten-Vervollständigung (42 Dateien)

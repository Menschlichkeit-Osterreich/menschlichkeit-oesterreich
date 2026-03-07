---
title: Markdown & Documentation Best Practices
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: core
applyTo: **/*.md
---
# Markdown & Documentation Best Practices

## Dokumentations-Hierarchie

### Projekt-Level Dokumentation
```text
/README.md                    → Projekt-Übersicht, Quick Start
/TODO.md                      → Aktuelle Aufgaben, Roadmap
/LICENSE                      → Lizenz-Information
/CHANGELOG.md                 → Version History
```

### Service-Level Dokumentation
```text
/<service>/README.md          → Service-spezifische Docs
/<service>/API.md             → API Dokumentation
/<service>/DEPLOYMENT.md      → Deployment-Anleitung
/<service>/TROUBLESHOOTING.md → Fehlerbehandlung
```

### Developer Dokumentation
```text
/docs/                        → Entwickler-Dokumentation
/docs/ARCHITECTURE.md         → System-Architektur
/docs/DEVELOPMENT.md          → Development Setup
/docs/TESTING.md              → Test-Strategien
/docs/SECURITY.md             → Security Guidelines
```

## Markdown Standards (GitHub Flavored)

### Struktur-Template für READMEs
```markdown
# Projekt/Service Name

> Kurze Beschreibung (1-2 Sätze)

## 📋 Inhaltsverzeichnis
- [Features](#features)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Konfiguration](#konfiguration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Mitwirken](#mitwirken)
- [Lizenz](#lizenz)

## ✨ Features

- **Feature 1**: Beschreibung
- **Feature 2**: Beschreibung
- **Feature 3**: Beschreibung

## 🚀 Installation

### Voraussetzungen
- Node.js ≥ 18.x
- PostgreSQL ≥ 15
- Docker (optional)

### Setup
```
# 1. Repository klonen
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git

# 2. Dependencies installieren
npm install

# 3. Environment konfigurieren
cp .env.example .env
npm run setup:dev
```bash

## 📖 Verwendung

### Development Server starten
```
npm run dev:<service>
```bash

### Production Build
```
npm run build
npm run start
```text

## ⚙️ Konfiguration

### Environment Variables
| Variable | Beschreibung | Default | Erforderlich |
|----------|--------------|---------|--------------|
| `DATABASE_URL` | PostgreSQL Connection String | - | ✅ |
| `API_KEY` | API Schlüssel | - | ✅ |
| `LOG_LEVEL` | Logging Level | `info` | ❌ |

### Konfigurationsdateien
- `.env` - Lokale Umgebungsvariablen
- `config/<service>.yml` - Service-Konfiguration
- `docker-compose.yml` - Container-Setup

## 🧪 Testing

```
# Unit Tests
npm run test:unit

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```text

## 🚢 Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anweisungen.

### Quick Deploy
```
./deployment-scripts/deploy-<service>-plesk.sh
```text

## 🔧 Troubleshooting

### Problem 1: XYZ funktioniert nicht
**Symptom**: Fehlermeldung XYZ

**Lösung**:
```
# Schritt 1
npm run clean

# Schritt 2
npm run setup:dev
```text

### Weitere Probleme
Siehe [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🤝 Mitwirken

Wir freuen uns über Contributions! Bitte beachten Sie:
1. Fork erstellen
2. Feature Branch anlegen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md) für Details.

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der [MIT License](./LICENSE).

## 📞 Kontakt

- **Website**: https://menschlichkeit-oesterreich.at
- **Issues**: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues
- **Discussions**: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions
```

## Formatting Best Practices

### Überschriften
```markdown
# H1 - Nur für Dokumenten-Titel (1x pro Datei)
## H2 - Hauptabschnitte
### H3 - Unterabschnitte
#### H4 - Details (sparsam verwenden)

❌ FALSCH:
# Titel
# Weitere Überschrift gleichen Levels

✅ RICHTIG:
# Titel
## Abschnitt 1
### Unterabschnitt 1.1
## Abschnitt 2
```

### Code-Blöcke
```markdown
✅ IMMER Syntax-Highlighting verwenden:
```
npm install
```text

```
const example: string = "typed code";
```text

```
SELECT * FROM users WHERE active = true;
```text

❌ NICHT Generic:
```
npm install
```text
```

### Listen
```markdown
✅ Ungeordnete Listen:
- Erster Punkt
- Zweiter Punkt
  - Unterpunkt mit 2 Spaces Einzug
  - Weiterer Unterpunkt
- Dritter Punkt

✅ Geordnete Listen:
1. Erster Schritt
2. Zweiter Schritt
   1. Unterschritt
   2. Weiterer Unterschritt
3. Dritter Schritt

✅ Task Listen:
- [x] Abgeschlossene Aufgabe
- [ ] Offene Aufgabe
- [ ] Weitere Aufgabe
```

### Tabellen
```markdown
✅ Rechtsbündig für Zahlen, Linksbündig für Text:
| Feature | Status | Priority | Effort |
|---------|:------:|---------:|-------:|
| Auth    | ✅     | High     | 8h     |
| API     | 🚧     | Medium   | 16h    |
| UI      | ❌     | Low      | 4h     |

Alignment:
| Left | Center | Right |
|:-----|:------:|------:|
```

### Links & Referenzen
```markdown
✅ Inline Links:
[Link-Text](https://example.com)
[Relative Link](./docs/EXAMPLE.md)
[Anchor Link](#abschnitt-name)

✅ Reference Links (für Wiederverwendung):
Siehe [Google][1] und [GitHub][2] für Details.

[1]: https://google.com
[2]: https://github.com

✅ Auto-Links:
<https://menschlichkeit-oesterreich.at>
<info@menschlichkeit-oesterreich.at>
```

### Bilder
```markdown
✅ Mit Alt-Text (Accessibility):
![Austrian Flag](./assets/flag.png)
![Architecture Diagram](./docs/images/architecture.svg)

✅ Mit Größe (HTML wenn nötig):
<img src="./logo.png" alt="Logo" width="200">
```

### Hervorhebungen
```markdown
✅ Emphasis:
*kursiv* oder _kursiv_
**fett** oder __fett__
***fett und kursiv***

✅ Inline Code:
Verwende `npm install` für Dependencies.
Die Variable `DATABASE_URL` ist erforderlich.

✅ Blockquotes:
> **Wichtig**: Diese Änderung ist breaking!

> **Tipp**: Verwende `--dry-run` zum Testen.
```

### Emojis (GitHub Support)
```markdown
✅ Für visuelle Ankerpunkte:
## 🚀 Quick Start
## 📖 Dokumentation
## ⚙️ Konfiguration
## 🧪 Testing
## 🔒 Security
## 🐛 Bugfixes
## ✨ Features
## 📊 Performance
## ♿ Accessibility
## 🌍 Internationalisierung

❌ NICHT übertreiben:
## 🎉🎊✨🚀 Super Mega Feature 🔥💯👍
```

## Dokumentations-Standards

### README.md Checkliste
```markdown
□ Klare Projekt-Beschreibung (1-2 Sätze)
□ Badges (Build Status, Coverage, License)
□ Inhaltsverzeichnis (bei >150 Zeilen)
□ Installation-Anleitung (Step-by-Step)
□ Usage-Beispiele mit Code
□ Konfiguration dokumentiert
□ Testing-Anleitung
□ Deployment-Hinweise
□ Troubleshooting-Sektion
□ Contribution-Guidelines
□ Lizenz-Information
□ Kontakt/Support-Links
□ Screenshots/Demos (bei UI)
```

### API.md Struktur
```markdown
# API Dokumentation

## Übersicht
- Base URL
- Authentication
- Rate Limits
- Versioning

## Endpoints

### GET /api/users
**Beschreibung**: Holt alle Benutzer

**Query Parameter**:
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `limit` | integer | ❌ | Max. Anzahl (default: 10) |
| `offset` | integer | ❌ | Pagination offset |
| `filter` | string | ❌ | Filter-Ausdruck |

**Response**:
```
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "displayName": "Max Mustermann"
    }
  ],
  "total": 42,
  "hasMore": true
}
```text

**Error Codes**:
- `400` - Bad Request: Ungültige Parameter
- `401` - Unauthorized: Fehlende/ungültige Auth
- `500` - Server Error: Interner Fehler
```

### CHANGELOG.md Format
```markdown
# Changelog

Alle wichtigen Änderungen werden hier dokumentiert.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]
### Added
- Neue Feature XYZ

### Changed
- Verbessertes Performance für ABC

### Deprecated
- API v1 wird in v3.0.0 entfernt

### Removed
- Legacy Support für IE11

### Fixed
- Bug #123: Falsche Berechnung bei XYZ

### Security
- CVE-2024-XXXX: XSS Vulnerability gefixt

## [2.1.0] - 2025-10-01
### Added
- Design Token Sync mit Figma
- n8n Automation Workflows

...

## [2.0.0] - 2025-09-15
### Breaking Changes
- API v1 entfernt, Migration zu v2 erforderlich
- PostgreSQL 15+ jetzt Mindestvoraussetzung

...

[Unreleased]: https://github.com/.../compare/v2.1.0...HEAD
[2.1.0]: https://github.com/.../compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/.../releases/tag/v2.0.0
```

## Projekt-Spezifische Standards

### Sprache (Austrian German + English)
```markdown
✅ UI-Dokumentation: Deutsch (AT)
- Hauptseiten-README.md
- Benutzer-Handbücher
- DSGVO-Dokumente

✅ Technische Docs: Englisch
- API.md
- ARCHITECTURE.md
- Code-Kommentare in Funktionen

✅ Mixed: Pragmatisch
- README.md: Deutsch, Code-Beispiele englisch
- DEPLOYMENT.md: Deutsch, Commands englisch
```

### DSGVO-Compliance in Docs
```markdown
⚠️ IMMER beachten:

❌ NIEMALS in Docs committen:
- Echte Email-Adressen
- Telefonnummern
- Namen von realen Personen (außer Public Figures)
- API-Keys, Tokens, Secrets
- IP-Adressen

✅ Verwende Beispiel-Daten:
- user@example.com
- Max Mustermann
- +43 XXX XXXXXXX
- <YOUR_API_KEY>
- 192.0.2.1 (TEST-NET-1)
```

### Links zu externen Quellen
```markdown
✅ Verwende offizielle Dokumentation:
- [React Docs](https://react.dev)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [DSGVO Volltext](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679)

✅ Vermeide:
- Broken Links (regelmäßig prüfen)
- Paywalled Content
- Nicht-HTTPS Seiten
- Tracking-URLs (utm_* Parameter)
```

## Automatisierung & Tooling

### Markdown Linting
```bash
# Via Copilot Instructions (automatisch):
- Prüfe Markdown-Syntax
- Validiere Links
- Checke Konsistenz

# Manual Check:
npm run lint:markdown
```

### Link Checker
```bash
# Broken Links finden:
npm run docs:check-links

# Fix automatisch wo möglich:
npm run docs:fix-links
```

### TOC Generierung
```bash
# Table of Contents auto-generieren:
npm run docs:generate-toc

# Für einzelne Datei:
npx markdown-toc README.md -i
```

### Preview
```bash
# Live Preview im Browser:
npm run docs:preview

# Oder via VS Code Extension:
# "Markdown Preview Enhanced"
```

## MCP-Integration für Docs

### Filesystem MCP für Doc-Management
```markdown
"Find all README files and check for completeness"
"List all markdown files without proper headings"
"Search for outdated links in documentation"
```

### GitHub MCP für Doc-Tracking
```markdown
"Create issue for missing API documentation"
"List all docs-related issues"
"Update README with latest release info"
```

### Brave Search MCP für Best Practices
```markdown
"Search for Markdown best practices 2025"
"Find Austrian DSGVO documentation standards"
"Get accessibility guidelines for documentation"
```

## Quality Gates für Dokumentation

### Pre-Commit
```markdown
□ Markdown-Syntax korrekt (markdownlint)
□ Links funktionieren (markdown-link-check)
□ Keine sensiblen Daten (DSGVO)
□ Rechtschreibung geprüft (DE + EN)
□ Code-Beispiele syntaktisch korrekt
```

### Pre-PR
```markdown
□ README.md aktualisiert (bei Feature-Änderungen)
□ CHANGELOG.md entry erstellt
□ API.md aktualisiert (bei Endpoint-Änderungen)
□ Screenshots aktualisiert (bei UI-Änderungen)
□ TOC generiert (bei langen Docs)
```

## Best Practices Zusammenfassung

### DO's
```markdown
✅ Klare, strukturierte Hierarchie (H1 → H2 → H3)
✅ Syntax-Highlighting für alle Code-Blöcke
✅ Alt-Text für alle Bilder (Accessibility)
✅ Relative Links für interne Docs
✅ Beispiele mit echtem, funktionierendem Code
✅ Versioning in Dateinamen (README-v2.md für Major Changes)
✅ Frontmatter für Metadaten (YAML Header)
✅ Konsistente Emoji-Verwendung
✅ Aktiv statt Passiv ("Run npm install" statt "npm install should be run")
✅ Screenshots in separatem /docs/images/ Ordner
```

### DON'Ts
```markdown
❌ Multiple H1 in einem Dokument
❌ Generic Code-Blöcke ohne Syntax
❌ Broken Links (regelmäßig prüfen!)
❌ Absolute URLs für interne Links
❌ Veraltete Screenshots
❌ Fehlende Inhaltsverzeichnisse bei langen Docs
❌ Inline-Bilder ohne Alt-Text
❌ Sensible Daten (PII, Secrets)
❌ Widersprüchliche Informationen in verschiedenen Docs
❌ Emoji-Overload
```

---

**Enforcement**: Automatisch via Copilot Instructions + Pre-Commit Hooks
**Tools**: markdownlint, markdown-link-check, markdown-toc
**Reviews**: README-Änderungen benötigen Tech-Lead Approval

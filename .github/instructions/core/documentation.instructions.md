---
title: Documentation Best Practices Instructions
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: core
applyTo: **/*.md
---
# Documentation Best Practices Instructions

## Dokumentations-Standards

### Zielgruppe & Sprache
```markdown
IMMER beachten:
- Technische Docs: **Englisch** (internationale Zusammenarbeit)
- User-Facing Docs: **Deutsch (Österreich)** 🇦🇹
- Legal/DSGVO Docs: **Deutsch** (rechtssicher)
- Code-Kommentare: Englisch (Technical) + Deutsch (Business-Logic)
```

### Dokumentations-Hierarchie
```text
README.md (Root)           → Projekt-Übersicht für Newcomer
├── docs/                  → Technische Deep-Dive Dokumentation
│   ├── ARCHITECTURE.md    → System-Design & Service-Übersicht
│   ├── API.md             → API-Dokumentation (OpenAPI)
│   ├── DEPLOYMENT.md      → Deployment-Prozesse
│   ├── SECURITY.md        → Security-Guidelines
│   └── CONTRIBUTING.md    → Contribution-Prozess
├── .github/
│   ├── copilot-instructions.md → Copilot-Leitfaden
│   ├── instructions/      → Kontext-spezifische Instructions
│   ├── modes/             → Chat-Modes für verschiedene Workflows
│   └── prompts/           → Wiederverwendbare Prompt-Templates
└── <service>/README.md    → Service-spezifische Dokumentation
```

## README.md Best Practices

### 1. Root README.md Template
```markdown
# Projekt-Name

> **Kurzbeschreibung (1-2 Sätze)** – Was macht dieses Projekt?

[![Quality Gate](badge-url)](link)
[![Security](badge-url)](link)
[![DSGVO-Compliant](badge-url)](link)

## 🎯 Übersicht

**Kontext:** Wer, Was, Warum?
**Zielgruppe:** Wer nutzt/entwickelt dieses Projekt?
**Technologie-Stack:** Haupt-Technologien (mit Versionen)

## 🚀 Quick Start

\`\`\`bash
# 1. Prerequisites
node -v  # >= 18.0.0
docker --version  # >= 24.0.0

# 2. Installation
npm run setup:dev

# 3. Development Server starten
npm run dev:all

# 4. Zugriff
# - CRM: http://localhost:8000
# - API: http://localhost:8001
# - Frontend: http://localhost:3000
\`\`\`

## 📁 Projekt-Struktur

\`\`\`
project-root/
├── frontend/          # React + TypeScript
├── api/               # FastAPI Backend
├── crm/               # Drupal + CiviCRM
└── docs/              # Dokumentation
\`\`\`

## 🛠️ Development

### Häufige Befehle
\`\`\`bash
npm run dev:all           # Alle Services starten
npm run test:unit         # Unit Tests
npm run quality:gates     # Quality Gates prüfen
npm run build:all         # Production Build
\`\`\`

### Workflow
1. Issue erstellen oder zuweisen
2. Branch: \`feature/<issue-number>-<description>\`
3. Development + Tests
4. PR erstellen → Quality Gates müssen grün sein
5. Review → Merge

## 🧪 Testing

- **Unit Tests:** \`npm run test:unit\`
- **E2E Tests:** \`npm run test:e2e\`
- **Performance:** \`npm run performance:lighthouse\`

**Coverage:** Min. 80% für neue Features

## 🔒 Security

- **Secrets:** NIEMALS committen (siehe \`.gitignore\`)
- **DSGVO:** Compliance zwingend erforderlich
- **Security Scan:** \`npm run security:scan\`

## 📚 Dokumentation

- **API Docs:** [api.menschlichkeit-oesterreich.at/docs](url)
- **Architecture:** [docs/ARCHITECTURE.md](link)
- **Deployment:** [docs/DEPLOYMENT.md](link)

## 🤝 Contributing

Siehe [CONTRIBUTING.md](link) für Details.

## 📝 License

[LICENSE](LICENSE) – MIT/GPL/etc.

## 🆘 Support

- **Issues:** [GitHub Issues](link)
- **Email:** support@example.com
- **Slack:** #projekt-channel
```

### 2. Service-spezifische README.md
```markdown
# Service Name (z.B. CRM)

> **Ein-Zeilen-Beschreibung**

## Stack

- **Framework:** Drupal 10 + CiviCRM 5.x
- **Datenbank:** PostgreSQL 16
- **Sprache:** PHP 8.1+
- **Deployment:** Plesk (SSH + Drush)

## Local Development

\`\`\`bash
# Setup
cd crm.menschlichkeit-oesterreich.at
composer install
npm run dev:crm

# Zugriff
http://localhost:8000
\`\`\`

## Configuration

- **Settings:** \`sites/default/settings.php\`
- **Environment:** \`.env.crm\`
- **Database:** \`schema.prisma\` (shared)

## Testing

\`\`\`bash
composer test           # PHPUnit
phpstan analyse         # Static Analysis
\`\`\`

## Deployment

\`\`\`bash
./deployment-scripts/deploy-crm-plesk.sh
\`\`\`

## DSGVO-Spezifika

- **PII-Felder:** \`contacts\`, \`addresses\`, \`emails\`
- **Consent:** Via CiviCRM Consent-Extension
- **Retention:** 3 Jahre nach letztem Kontakt
- **Löschung:** \`drush civicrm:gdpr-delete\`

## Troubleshooting

**Problem:** CRM startet nicht
\`\`\`bash
# Lösung:
docker-compose restart drupal
drush cache:rebuild
\`\`\`
```

## Markdown Best Practices

### 1. Struktur & Hierarchie
```markdown
# H1 - Nur EINMAL pro Dokument (Titel)

## H2 - Haupt-Sektionen

### H3 - Unter-Sektionen

#### H4 - Details (sparsam verwenden)

NIEMALS:
- H1 mehrfach verwenden
- Hierarchie-Stufen überspringen (H2 → H4)
- Mehr als 4 Ebenen verschachteln
```

### 2. Code-Blöcke
```markdown
✅ GOOD - Mit Syntax-Highlighting:
\`\`\`bash
npm run dev
\`\`\`

\`\`\`typescript
const user: User = { name: "Test" };
\`\`\`

❌ BAD - Ohne Sprache:
\`\`\`
npm run dev
\`\`\`
```

### 3. Listen
```markdown
✅ GOOD - Konsistente Aufzählungszeichen:
- Item 1
- Item 2
  - Sub-Item 2.1
  - Sub-Item 2.2

✅ GOOD - Nummerierte Listen:
1. Erster Schritt
2. Zweiter Schritt
3. Dritter Schritt

❌ BAD - Gemischt:
- Item 1
* Item 2
+ Item 3
```

### 4. Links & Referenzen
```markdown
✅ GOOD - Beschreibender Text:
Siehe [Deployment-Anleitung](docs/DEPLOYMENT.md) für Details.

✅ GOOD - Inline-Code für Befehle:
Nutze \`npm run dev\` zum Starten.

❌ BAD - Nackte URLs:
Siehe https://example.com/very/long/url/that/breaks/formatting
```

### 5. Tabellen
```markdown
✅ GOOD - Formatiert & aligned:
| Service | Port | Stack       |
|---------|------|-------------|
| CRM     | 8000 | Drupal 10   |
| API     | 8001 | FastAPI     |
| Frontend| 3000 | React 18    |

❌ BAD - Unformatiert:
|Service|Port|Stack|
|---|---|---|
|CRM|8000|Drupal|
```

### 6. Badges & Icons
```markdown
✅ GOOD - Shields.io Badges:
![Build](https://img.shields.io/github/workflow/status/...)
![Coverage](https://img.shields.io/codecov/c/github/...)

✅ GOOD - Emojis für Quick-Scan:
🎯 Übersicht
🚀 Quick Start
🛠️ Development
🔒 Security
📚 Dokumentation
```

### 7. Warnungen & Hinweise
```markdown
✅ GOOD - Visuelle Hervorhebung:

> ⚠️ **WARNUNG:** Niemals Production-Credentials committen!

> 💡 **TIPP:** Nutze \`npm run dev:all\` für alle Services.

> 🔴 **CRITICAL:** DSGVO-Compliance obligatorisch!

> ✅ **SUCCESS:** Alle Quality Gates bestanden.
```

### 8. Bilder & Diagramme
```markdown
✅ GOOD - Beschreibender Alt-Text:
![System Architecture Diagram](docs/images/architecture.png)

✅ GOOD - Mermaid für Diagramme:
\`\`\`mermaid
graph LR
  A[User] --> B[Frontend]
  B --> C[API]
  C --> D[Database]
\`\`\`

❌ BAD - Fehlender Alt-Text:
![](image.png)
```

## Automatische Validierung

### Markdown Linting
```bash
# Via markdownlint:
npm install -g markdownlint-cli
markdownlint '**/*.md' --ignore node_modules

# Automatisch via Pre-Commit Hook:
# .github/hooks/pre-commit
markdownlint-cli2 $(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')
```

### Link-Validierung
```bash
# Via markdown-link-check:
npm install -g markdown-link-check
markdown-link-check README.md

# Alle Markdown-Dateien:
find . -name '*.md' -not -path './node_modules/*' -exec markdown-link-check {} \;
```

### Spelling & Grammar
```bash
# Via cspell (Code Spell Checker):
npm install -g cspell
cspell '**/*.md'

# Via Vale (Prose Linter):
vale --config=.vale.ini docs/
```

## Dokumentations-Workflows

### 1. Neue Feature-Dokumentation
```markdown
Bei jedem neuen Feature:

1. **README.md aktualisieren:**
   - Quick Start erweitern
   - Neue Befehle hinzufügen

2. **Service README.md:**
   - API-Endpoints dokumentieren
   - Configuration-Optionen

3. **CHANGELOG.md:**
   - Version + Datum
   - Feature-Beschreibung

4. **API-Docs (falls Backend):**
   - OpenAPI Spec aktualisieren
   - Code-Beispiele hinzufügen

5. **Quality Check:**
   \`\`\`bash
   npm run docs:validate
   markdownlint '**/*.md'
   \`\`\`
```

### 2. DSGVO-Dokumentation
```markdown
Bei Datenverarbeitung IMMER dokumentieren:

\`\`\`markdown
## DSGVO-Compliance

### Betroffene Daten
- **Typ:** Kontaktdaten (Name, Email, Telefon)
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- **Zweck:** Newsletter-Versand
- **Speicherdauer:** Bis Widerruf der Einwilligung
- **Löschroutine:** \`npm run gdpr:cleanup\`

### Betroffenenrechte
- **Auskunft:** Via CRM-Interface
- **Löschung:** Via \`drush civicrm:gdpr-delete <contact_id>\`
- **Widerruf:** Via Abmelde-Link in jeder Email
\`\`\`
```

### 3. Architecture Decision Records (ADR)
```markdown
Für wichtige Architektur-Entscheidungen:

\`\`\`markdown
# ADR-001: Multi-Service Architecture

**Status:** Accepted
**Datum:** 2025-01-15
**Kontext:** Monolithic vs. Multi-Service
**Entscheidung:** Multi-Service mit separaten Deployments
**Konsequenzen:**
- ✅ Bessere Skalierbarkeit
- ✅ Unabhängige Deployments
- ❌ Komplexere Orchestrierung
\`\`\`

Speicherort: \`docs/adr/001-multi-service.md\`
```

## MCP-Tools für Dokumentation

### 1. Filesystem MCP
```markdown
"List all README.md files in the workspace"
"Find documentation gaps - which services have no README?"
"Compare README.md structure across services"
```

### 2. GitHub MCP
```markdown
"Create issue for missing API documentation"
"Link documentation PRs to related issues"
```

### 3. Brave Search MCP
```markdown
"Search for Markdown best practices 2025"
"Find Austrian GDPR documentation templates"
"Search for mermaid diagram examples"
```

### 4. Memory MCP
```markdown
"Store documentation standards for this project"
"Remember preferred Markdown linting rules"
```

## Template-Sammlung

### Issue Template
```markdown
---
name: Feature Request
about: Suggest a new feature
labels: enhancement
---

## Feature-Beschreibung
Kurze Beschreibung (2-3 Sätze)

## Use Case
Wer braucht das? Warum?

## Technische Details
- **Betroffene Services:** CRM, API, Frontend
- **Datenbank-Änderungen:** Ja/Nein
- **DSGVO-Impact:** Ja/Nein

## Acceptance Criteria
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Tests geschrieben
- [ ] Dokumentation aktualisiert
```

### PR Template
```markdown
---
name: Pull Request
about: Submit code changes
---

## Änderungen
- Ändere X
- Füge Y hinzu
- Entferne Z

## Related Issues
Closes #123

## Quality Gates
- [x] All tests passing
- [x] Security scan clean
- [x] DSGVO-compliant
- [x] Documentation updated

## Screenshots (falls UI-Änderung)
![Before](url)
![After](url)
```

## Quality Checklist

### Vor PR-Submission
```markdown
□ Alle README.md aktualisiert
□ CHANGELOG.md Entry erstellt
□ API-Dokumentation (OpenAPI) aktualisiert
□ Code-Kommentare aussagekräftig
□ DSGVO-Impact dokumentiert (falls relevant)
□ Markdown-Linting bestanden
□ Links validiert (keine 404)
□ Bilder haben Alt-Text
□ Diagramme aktuell
```

### Jährliche Dokumentations-Review
```markdown
Q1 Review (März):
□ Veraltete Docs identifizieren
□ Broken Links fixen
□ Screenshots aktualisieren
□ Architecture-Diagramme prüfen
□ Dependencies-Versionen updaten
```

---

## Quick Commands

```bash
# Markdown Linting
markdownlint '**/*.md' --fix

# Link-Check
markdown-link-check README.md

# Spell-Check
cspell '**/*.md'

# Dokumentations-Validierung
npm run docs:validate

# Diagramme generieren (Mermaid)
mmdc -i docs/architecture.mmd -o docs/architecture.png
```

---

**Aktivierung:** Diese Instructions gelten für alle \`*.md\` Dateien
**Updates:** Bei Standards-Änderungen diese Datei ZUERST aktualisieren
**Referenz:** Siehe \`.github/copilot-instructions.md\` für Details

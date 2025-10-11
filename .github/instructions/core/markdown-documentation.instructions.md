---
title: Markdown Documentation Best Practices
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: core
applyTo: **/*.md
---
# Markdown Documentation Best Practices

## Zweck
Einheitliche, professionelle Markdown-Dokumentation für alle README.md, Docs und Prompts nach Industry Best Practices.

---

## Automatische Enforcement

### Nach JEDEM Markdown-Edit

```markdown
SOFORT nach File-Edit:
1. Filesystem MCP: Prüfe Markdown Syntax
2. Brave Search MCP: "Search for Markdown best practices 2025"
3. GitHub MCP: Check ob README.md-Vorlage existiert
4. Memory MCP: Speichere häufige Dokumentations-Patterns
```

### Mandatory Quality Checks

```bash
# Vor jedem Commit:
npm run lint:markdown  # markdownlint-cli2
npm run docs:validate  # Custom validator
npm run docs:links     # Check broken links
```

---

## README.md Structure (Mandatory)

### Top-Level README.md Template

```markdown
# [Projekt-Name]

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://github.com/[org]/[repo]/workflows/CI/badge.svg)](https://github.com/[org]/[repo]/actions)
[![Code Quality](https://app.codacy.com/project/badge/Grade/[hash])](https://www.codacy.com/gh/[org]/[repo])
[![DSGVO Compliant](https://img.shields.io/badge/DSGVO-compliant-green.svg)](docs/DSGVO.md)

**[Kurze Beschreibung in 1-2 Sätzen]**

[Optional: Hero Image oder Demo GIF]

---

## 📋 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Konfiguration](#konfiguration)
- [Architektur](#architektur)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Lizenz](#lizenz)
- [Kontakt](#kontakt)

---

## 🎯 Überblick

### Was ist [Projekt-Name]?

[Detaillierte Beschreibung des Projekts]

### Warum [Projekt-Name]?

**Problem:**
[Welches Problem wird gelöst?]

**Lösung:**
[Wie löst dieses Projekt das Problem?]

**Vorteile:**
- ✅ Vorteil 1
- ✅ Vorteil 2
- ✅ Vorteil 3

---

## ✨ Features

### Core Features

- **Feature 1** - Beschreibung
- **Feature 2** - Beschreibung
- **Feature 3** - Beschreibung

### Geplante Features

- [ ] Feature A (Q1 2026)
- [ ] Feature B (Q2 2026)
- [ ] Feature C (Q3 2026)

[Siehe vollständige Roadmap](docs/ROADMAP.md)

---

## 🚀 Quick Start

```
# 1. Repository klonen
git clone https://github.com/[org]/[repo].git
cd [repo]

# 2. Dependencies installieren
npm install

# 3. Environment konfigurieren
cp .env.example .env
# Editiere .env mit deinen Credentials

# 4. Development starten
npm run dev

# 5. Browser öffnen
open http://localhost:3000
```text

**Das war's!** 🎉 Weitere Details unter [Installation](#installation).

---

## 📦 Installation

### Voraussetzungen

| Requirement | Version | Installation |
|-------------|---------|--------------|
| Node.js     | ≥18.x   | [nodejs.org](https://nodejs.org) |
| npm         | ≥9.x    | (mit Node.js) |
| PostgreSQL  | ≥14.x   | [postgresql.org](https://postgresql.org) |
| Docker      | ≥24.x   | [docker.com](https://docker.com) |

### Schritt-für-Schritt

#### 1. Repository Setup

\`\`\`bash
git clone https://github.com/[org]/[repo].git
cd [repo]
npm install
\`\`\`

#### 2. Datenbank Setup

\`\`\`bash
# PostgreSQL starten (Docker)
docker-compose up -d postgres

# Datenbank erstellen
npm run db:create

# Migrations ausführen
npm run db:migrate

# Seed Data (optional)
npm run db:seed
\`\`\`

#### 3. Environment Konfiguration

\`\`\`bash
cp .env.example .env
\`\`\`

Editiere `.env`:
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
\`\`\`

**Wichtig:** Niemals `.env` committen! (bereits in `.gitignore`)

#### 4. Verification

\`\`\`bash
npm run test:setup  # Prüft Installations-Status
npm run dev         # Startet Development Server
\`\`\`

---

## 💻 Verwendung

### Basic Usage

[Code-Beispiele mit Syntax Highlighting]

\`\`\`javascript
// Beispiel
import { Feature } from '@project/core';

const instance = new Feature({
  option1: 'value1',
  option2: 'value2'
});

await instance.execute();
\`\`\`

### Advanced Usage

[Siehe ausführliche Dokumentation](docs/USAGE.md)

---

## ⚙️ Konfiguration

### Environment Variables

| Variable | Required | Default | Beschreibung |
|----------|----------|---------|--------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL Connection String |
| `API_KEY` | ✅ | - | API Authentication Key |
| `LOG_LEVEL` | ❌ | `info` | Logging Level (debug/info/warn/error) |
| `PORT` | ❌ | `3000` | Server Port |

[Vollständige Konfiguration](docs/CONFIGURATION.md)

---

## 🏗️ Architektur

### System Overview

\`\`\`
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│     API     │─────▶│  Database   │
│   (React)   │      │  (FastAPI)  │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                     Services Layer
\`\`\`

### Tech Stack

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS

**Backend:**
- FastAPI (Python)
- Pydantic
- SQLAlchemy

**Database:**
- PostgreSQL 14+
- Prisma ORM

[Detaillierte Architektur](docs/ARCHITECTURE.md)

---

## 🛠️ Development

### Development Workflow

\`\`\`bash
# Branch erstellen
git checkout -b feature/neue-funktion

# Entwicklung
npm run dev

# Tests ausführen
npm run test

# Code Quality Check
npm run lint
npm run format

# Pre-Commit Hooks (automatisch)
# → lint, format, test
\`\`\`

### Available Scripts

| Command | Beschreibung |
|---------|--------------|
| `npm run dev` | Development Server starten |
| `npm run build` | Production Build erstellen |
| `npm run test` | Unit & Integration Tests |
| `npm run test:e2e` | E2E Tests (Playwright) |
| `npm run lint` | Code Linting (ESLint) |
| `npm run format` | Code Formatting (Prettier) |
| `npm run docs` | Dokumentation generieren |

[Development Guide](docs/DEVELOPMENT.md)

---

## 🧪 Testing

### Test Structure

\`\`\`
tests/
├── unit/          # Unit Tests (Vitest)
├── integration/   # Integration Tests
├── e2e/           # E2E Tests (Playwright)
└── fixtures/      # Test Data
\`\`\`

### Running Tests

\`\`\`bash
# All Tests
npm run test

# Watch Mode
npm run test:watch

# Coverage Report
npm run test:coverage

# E2E Tests
npm run test:e2e
\`\`\`

### Test Coverage

Target: **≥80%** Coverage für Production Code

[Testing Strategy](docs/TESTING.md)

---

## 🚢 Deployment

### Production Deployment

\`\`\`bash
# 1. Build erstellen
npm run build

# 2. Docker Image
docker build -t [project]:latest .

# 3. Deploy (Plesk/Kubernetes/etc.)
./scripts/deploy.sh production
\`\`\`

### Environment-spezifisch

- **Development:** `localhost:3000`
- **Staging:** `staging.example.com`
- **Production:** `example.com`

[Deployment Guide](docs/DEPLOYMENT.md)

---

## 🤝 Contributing

Wir freuen uns über Contributions! 🎉

### Quick Contribution Guide

1. **Fork** das Repository
2. **Branch** erstellen (`git checkout -b feature/amazing-feature`)
3. **Commit** Änderungen (`git commit -m 'feat: Add amazing feature'`)
4. **Push** zu Branch (`git push origin feature/amazing-feature`)
5. **Pull Request** erstellen

### Contribution Guidelines

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Style Guide](docs/STYLE_GUIDE.md)

### Commit Convention

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: Neue Feature
fix: Bugfix
docs: Dokumentation
style: Formatierung
refactor: Code-Refactoring
test: Tests
chore: Maintenance
\`\`\`

---

## 📄 Lizenz

Dieses Projekt ist unter der **MIT License** lizenziert.

Siehe [LICENSE](LICENSE) für Details.

---

## 📞 Kontakt

**Projekt:** [Projekt-Name]
**Organisation:** [Organisation]
**Website:** [https://example.com](https://example.com)

**Support:**
- 📧 Email: support@example.com
- 💬 Discord: [Discord-Link]
- 🐛 Issues: [GitHub Issues](https://github.com/[org]/[repo]/issues)

**Social Media:**
- Twitter: [@handle](https://twitter.com/handle)
- LinkedIn: [Company Page](https://linkedin.com/company/handle)

---

## 🙏 Danksagungen

Besonderer Dank an:
- [Contributor 1](https://github.com/user1)
- [Contributor 2](https://github.com/user2)
- [Open Source Project](https://github.com/project)

---

**Made with ❤️ by [Organisation]**
```

---

## Service-Specific README Templates

### API Service README

```markdown
# API Service

**FastAPI Backend für [Projekt]**

## Endpoints

### Authentication
\`\`\`http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
\`\`\`

### Resources
\`\`\`http
GET    /api/v1/resource
POST   /api/v1/resource
GET    /api/v1/resource/{id}
PUT    /api/v1/resource/{id}
DELETE /api/v1/resource/{id}
\`\`\`

## API Documentation

- **OpenAPI Spec:** `/openapi.yaml`
- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`

## Authentication

Bearer Token Required:
\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.example.com/v1/resource
\`\`\`

## Rate Limiting

- **Limit:** 100 requests/minute
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Error Handling

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ]
  }
}
\`\`\`
```

### Frontend README

```markdown
# Frontend Service

**React + TypeScript Frontend**

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Vite** - Build Tool
- **React Router** - Routing
- **Zustand** - State Management

## Development

\`\`\`bash
npm run dev          # Dev Server (localhost:3000)
npm run build        # Production Build
npm run preview      # Preview Production Build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest
npm run test:e2e     # Playwright
\`\`\`

## Project Structure

\`\`\`
src/
├── components/      # React Components
│   ├── ui/         # UI Components (Buttons, Inputs)
│   └── features/   # Feature Components
├── pages/          # Page Components
├── hooks/          # Custom Hooks
├── services/       # API Services
├── store/          # State Management
├── styles/         # Global Styles
├── utils/          # Utilities
└── App.tsx         # Root Component
\`\`\`

## Component Guidelines

\`\`\`typescript
// Functional Component with TypeScript
import { FC } from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export const Component: FC<Props> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};
\`\`\`

## Design System

Design Tokens aus Figma:
- Colors: `figma-design-system/00_design-tokens.json`
- Typography: Barrierefreie Schriftarten
- Spacing: 4px Grid System

[Siehe Design System Docs](docs/DESIGN_SYSTEM.md)
```

---

## Markdown Best Practices

### 1. Headers

```markdown
✅ GOOD:
# H1 - Nur EIN H1 pro Dokument (Titel)
## H2 - Main Sections
### H3 - Subsections
#### H4 - Details

❌ BAD:
# Multiple H1s
##### Skipping Levels (H2 → H5)
```

### 2. Lists

```markdown
✅ GOOD:
- Unordered List Item 1
- Unordered List Item 2
  - Nested Item (2 spaces)

1. Ordered List Item 1
2. Ordered List Item 2

❌ BAD:
* Mixed bullet styles
- Not consistent indentation
  -Nested without spaces
```

### 3. Code Blocks

```markdown
✅ GOOD:
\`\`\`javascript
// Code with language identifier
const foo = 'bar';
\`\`\`

\`\`\`bash
# Shell commands
npm install
\`\`\`

❌ BAD:
\`\`\`
Code without language identifier
\`\`\`
```

### 4. Links

```markdown
✅ GOOD:
[Link Text](https://example.com)
[Relative Link](./docs/GUIDE.md)
[Reference Link][ref]

[ref]: https://example.com

❌ BAD:
https://example.com (naked URL)
[Click Here](url) (generic text)
[Broken](./non-existent.md) (broken link)
```

### 5. Images

```markdown
✅ GOOD:
![Alt Text](./assets/image.png)
![Logo](https://example.com/logo.png "Optional Title")

With Caption:
![Architecture Diagram](./docs/architecture.png)
*Figure 1: System Architecture Overview*

❌ BAD:
![](image.png) (no alt text)
![image](./image.bmp) (use PNG/JPG/SVG)
```

### 6. Tables

```markdown
✅ GOOD:
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

With Alignment:
| Left | Center | Right |
|:-----|:------:|------:|
| L1   |   C1   |    R1 |

❌ BAD:
| Unaligned | Headers |
| Cell 1 | Cell 2 | Cell 3 | (mismatched columns)
```

### 7. Emphasis

```markdown
✅ GOOD:
**Bold** for emphasis
*Italic* for subtle emphasis
`code` for inline code
~~Strikethrough~~ for deprecated

❌ BAD:
__Bold__ (use ** instead)
_Italic_ (use * instead)
```

### 8. Horizontal Rules

```markdown
✅ GOOD:
---

Three dashes, blank line before and after

❌ BAD:
---
No spacing
```

### 9. Blockquotes

```markdown
✅ GOOD:
> This is a quote
> spanning multiple lines

> **Note:** Important information

❌ BAD:
>No space after >
```

### 10. Task Lists

```markdown
✅ GOOD:
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

❌ BAD:
- [X] Uppercase X
- []No space
```

---

## Accessibility Best Practices

### Alt Text für Images

```markdown
✅ GOOD:
![Screenshot showing login form with email and password fields](./screenshots/login.png)

❌ BAD:
![screenshot](./screenshots/login.png)
![](./screenshots/login.png)
```

### Descriptive Link Text

```markdown
✅ GOOD:
[View our API Documentation](./docs/API.md)
[Download the installation guide (PDF, 2MB)](./guides/install.pdf)

❌ BAD:
[Click here](./docs/API.md)
[Read more](./guides/install.pdf)
```

### Semantic Headers

```markdown
✅ GOOD:
## Installation Steps
### Prerequisites
### Step 1: Clone Repository

❌ BAD:
## Step 1
## Step 2
(Use numbered lists instead)
```

---

## DSGVO-Specific Documentation

### Privacy Information in README

```markdown
## 🔒 Datenschutz

Dieses Projekt ist **DSGVO-compliant**.

**Datenverarbeitung:**
- Welche Daten werden gesammelt?
- Rechtsgrundlage (Art. 6 DSGVO)
- Speicherdauer
- Betroffenenrechte

[Vollständige Datenschutzerklärung](docs/PRIVACY.md)

**Consent Management:**
- Cookie-Consent via [Tool]
- Opt-in für Newsletter
- Datenexport auf Anfrage

**Security:**
- Ende-zu-Ende-Verschlüsselung
- Regelmäßige Security Audits
- [Security Policy](SECURITY.md)
```

---

## Badges & Shields

### Empfohlene Badges

```markdown
<!-- Build Status -->
[![CI](https://github.com/org/repo/workflows/CI/badge.svg)](https://github.com/org/repo/actions)

<!-- Code Quality -->
[![Codacy](https://app.codacy.com/project/badge/Grade/hash)](https://www.codacy.com/gh/org/repo)
[![Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)

<!-- Versioning -->
[![Version](https://img.shields.io/github/v/release/org/repo)](https://github.com/org/repo/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<!-- Activity -->
[![Last Commit](https://img.shields.io/github/last-commit/org/repo)](https://github.com/org/repo/commits)
[![Contributors](https://img.shields.io/github/contributors/org/repo)](https://github.com/org/repo/graphs/contributors)

<!-- DSGVO -->
[![DSGVO](https://img.shields.io/badge/DSGVO-compliant-green.svg)](docs/PRIVACY.md)

<!-- Austrian NGO Specific -->
[![Austrian](https://img.shields.io/badge/🇦🇹-Austrian_NGO-red.svg)](https://example.at)
```

---

## Automation mit MCP Tools

### Automatische README Updates

```markdown
Via Filesystem MCP:
"Update README.md with latest version number from package.json"

Via GitHub MCP:
"Add latest contributors to README.md from GitHub API"

Via Brave Search MCP:
"Search for latest Markdown best practices and update docs"
```

### Link Validation

```bash
# Via Filesystem MCP + Brave Search MCP:
"Check all markdown links in docs/ folder and report broken ones"
```

### Documentation Generation

```bash
# Via Filesystem MCP:
"Generate API documentation from OpenAPI spec into README.md"
```

---

## Quality Checklist

Vor jedem Commit:

- [ ] **Headers:** Logische Hierarchie (H1 → H2 → H3)
- [ ] **Links:** Alle funktionieren (relative + absolute)
- [ ] **Images:** Alt-Text vorhanden, Bilder existieren
- [ ] **Code Blocks:** Language Identifier gesetzt
- [ ] **Lists:** Konsistente Formatierung
- [ ] **Tables:** Aligned, vollständig
- [ ] **TOC:** Inhaltsverzeichnis aktuell
- [ ] **Badges:** Funktionieren, zeigen aktuellen Status
- [ ] **Spelling:** Rechtschreibung geprüft (DE/EN)
- [ ] **DSGVO:** Datenschutz-Hinweise vorhanden
- [ ] **Accessibility:** Alt-Texte, descriptive links
- [ ] **Consistency:** Einheitlicher Stil im ganzen Projekt

---

## Tools Integration

### markdownlint

```json
// .markdownlint.json
{
  "default": true,
  "MD013": false,  // Line length (oft zu restriktiv)
  "MD033": false,  // Inline HTML (manchmal nötig)
  "MD041": true    // First line muss H1 sein
}
```

### prettier

```json
// .prettierrc
{
  "proseWrap": "always",
  "printWidth": 80
}
```

### VSCode Extensions

- `yzhang.markdown-all-in-one` - Markdown Support
- `DavidAnson.vscode-markdownlint` - Linting
- `bierner.markdown-preview-github-styles` - GitHub-Style Preview

---

## Referenzen

- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

---

**Diese Instructions sind bindend für alle Markdown-Dateien im Projekt.**
**Bei Unklarheiten: Siehe Referenzen oder Team konsultieren.**

---
title: '24 Readmemodernization'
description: 'README Modernisierung & Best Practices'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
category: documentation
tags: ['documentation', 'dsgvo']
version: '1.0.0'
language: de-AT
audience: ['Technical Writers', 'All Teams']
---

> **DEPRECATED** — Migriert nach `.github/chatmodes/24_READMEModernization_DE.chatmode.md`. Diese Datei wird als Referenz beibehalten.

# README Modernisierung & Best Practices

**Zweck:** Professionelle, vollständige README.md Erstellung/Update nach 2025 Standards

---

## 📋 Kontext

### Was macht einen guten README?

Ein professioneller README sollte:

- ✅ **In 30 Sekunden** vermitteln, was das Projekt macht
- ✅ **In 5 Minuten** zeigen, wie man es verwendet
- ✅ **Vollständige Dokumentation** verlinken
- ✅ **Visuell ansprechend** sein (Badges, Diagramme, Screenshots)
- ✅ **Für Anfänger UND Experten** nützlich sein

---

## 🎯 Execution Phases

### Phase 1: Analyse & Planning

**Filesystem MCP:**

```markdown
"Analyze current README.md structure and identify missing sections"
```

**Checklist:**

- [ ] Aktuellen README.md lesen
- [ ] Fehlende Sections identifizieren
- [ ] Target-Audience definieren (Developers/Users/Contributors)
- [ ] Tone of Voice festlegen (Professional/Friendly/Technical)

**Output:** Analysis Report mit Gaps

---

### Phase 2: Header & Hero Section

**Must-Have Elements:**

```markdown
# [Projekt-Name]

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build](https://github.com/[org]/[repo]/workflows/CI/badge.svg)](https://github.com/[org]/[repo]/actions)
[![Quality](https://app.codacy.com/project/badge/Grade/[hash])](https://www.codacy.com/gh/[org]/[repo])
[![DSGVO](https://img.shields.io/badge/DSGVO-compliant-green.svg)](docs/PRIVACY.md)

**[Elevator Pitch in 1-2 Sätzen]**

[Optional: Hero Image/GIF/Screenshot]
```

**Via GitHub MCP:**

```markdown
"Get repository metadata for badges (license, build status, latest release)"
```

**Checklist:**

- [ ] Badges hinzugefügt (Build, Quality, License, DSGVO)
- [ ] Elevator Pitch formuliert (<50 Wörter)
- [ ] Hero Image erstellt (falls sinnvoll)
- [ ] Projekt-Logo eingebunden (falls vorhanden)

---

### Phase 3: Table of Contents

**Auto-Generated TOC:**

```markdown
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
```

**Via Filesystem MCP:**

```markdown
"Generate table of contents from existing headers in README.md"
```

**Checklist:**

- [ ] TOC generiert (automatisch oder manuell)
- [ ] Links validiert (alle Anchors existieren)
- [ ] Logische Reihenfolge (User Journey: Discover → Install → Use → Contribute)

---

### Phase 4: Überblick & Features

**Überblick Template:**

```markdown
## 🎯 Überblick

### Was ist [Projekt-Name]?

[Detaillierte Beschreibung: Was macht es? Für wen ist es?]

### Warum [Projekt-Name]?

**Problem:**
[Welches Problem wird gelöst?]

**Lösung:**
[Wie löst dieses Projekt das Problem?]

**Vorteile:**

- ✅ Vorteil 1 (z.B. "50% schneller als Alternative X")
- ✅ Vorteil 2 (z.B. "DSGVO-compliant out-of-the-box")
- ✅ Vorteil 3 (z.B. "Open Source & Community-driven")
```

**Features Section:**

```markdown
## ✨ Features

### Core Features

- **🚀 Feature 1** - Performance-optimiert für große Datasets
- **🔒 Feature 2** - Ende-zu-Ende-Verschlüsselung
- **🌍 Feature 3** - Multi-Language Support (DE/EN)

### Geplante Features

- [ ] Feature A (Q1 2026)
- [ ] Feature B (Q2 2026)

[Siehe vollständige Roadmap](docs/ROADMAP.md)
```

**Via Brave Search MCP:**

```markdown
"Search for competitor projects and identify unique selling points"
```

**Checklist:**

- [ ] Problem-Lösung klar dargestellt
- [ ] 3-5 Core Features mit Emojis & Beschreibungen
- [ ] Unique Selling Points hervorgehoben
- [ ] Geplante Features verlinkt (ROADMAP.md)

---

### Phase 5: Quick Start

**Minimal Viable Example:**

```markdown
## 🚀 Quick Start

\`\`\`bash

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
\`\`\`

**Das war's!** 🎉

Weitere Details unter [Installation](#installation).
```

**Via Filesystem MCP:**

```markdown
"Extract Quick Start commands from package.json scripts"
```

**Checklist:**

- [ ] 5 Steps oder weniger
- [ ] Copy-paste-fähige Commands
- [ ] Erfolgsbestätigung ("Das war's! 🎉")
- [ ] Link zu detaillierter Installation

---

### Phase 6: Installation (Detailliert)

**Vollständiger Installation Guide:**

```markdown
## 📦 Installation

### Voraussetzungen

| Requirement | Version | Installation                                  |
| ----------- | ------- | --------------------------------------------- |
| Node.js     | ≥18.x   | [nodejs.org](https://nodejs.org)              |
| npm         | ≥9.x    | (mit Node.js)                                 |
| PostgreSQL  | ≥14.x   | [postgresql.org](https://postgresql.org)      |
| Docker      | ≥24.x   | [docker.com](https://docker.com) _(optional)_ |

### Schritt-für-Schritt

#### 1. Repository Setup

\`\`\`bash
git clone https://github.com/[org]/[repo].git
cd [repo]
npm install
\`\`\`

#### 2. Datenbank Setup

\`\`\`bash

# Option A: Docker (empfohlen)

docker-compose up -d postgres

# Option B: Lokale PostgreSQL Installation

createdb [dbname]
\`\`\`

#### 3. Migrations

\`\`\`bash
npm run db:migrate
npm run db:seed # Optional: Test-Daten
\`\`\`

#### 4. Environment Konfiguration

\`\`\`bash
cp .env.example .env
\`\`\`

Editiere `.env`:
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your_api_key_here
SECRET_KEY=$(openssl rand -hex 32)
\`\`\`

**⚠️ Wichtig:** Niemals `.env` committen!

#### 5. Verification

\`\`\`bash
npm run test:setup # Prüft Installation
npm run dev # Startet Server
\`\`\`

✅ **Success:** Server läuft auf `http://localhost:3000`
```

**Via Filesystem MCP:**

```markdown
"Read package.json and list all available scripts with descriptions"
```

**Checklist:**

- [ ] Voraussetzungen mit Versionen (Table)
- [ ] Step-by-Step Anleitung (numbered)
- [ ] Alternatives (Docker vs. Native)
- [ ] Environment Variables dokumentiert
- [ ] Verification Step am Ende

---

### Phase 7: Verwendung & Konfiguration

**Usage Examples:**

```markdown
## 💻 Verwendung

### Basic Usage

\`\`\`javascript
import { Feature } from '@project/core';

// Einfaches Beispiel
const instance = new Feature({
option1: 'value1',
option2: 'value2'
});

const result = await instance.execute();
console.log(result);
\`\`\`

### Advanced Usage

[Siehe ausführliche API-Dokumentation](docs/API.md)

---

## ⚙️ Konfiguration

### Environment Variables

| Variable       | Required | Default | Beschreibung                             |
| -------------- | -------- | ------- | ---------------------------------------- |
| `DATABASE_URL` | ✅       | -       | PostgreSQL Connection String             |
| `API_KEY`      | ✅       | -       | API Authentication Key                   |
| `LOG_LEVEL`    | ❌       | `info`  | Logging Level (debug\|info\|warn\|error) |
| `PORT`         | ❌       | `3000`  | Server Port                              |

### Konfigurationsdatei

\`\`\`yaml

# config.yml

server:
port: 3000
host: 0.0.0.0

database:
pool_size: 10
timeout: 30s

logging:
level: info
format: json
\`\`\`

[Vollständige Konfiguration](docs/CONFIGURATION.md)
```

**Via Filesystem MCP:**

```markdown
"Extract environment variables from .env.example and generate documentation table"
```

**Checklist:**

- [ ] Basic Usage Code-Beispiel (copy-paste-fähig)
- [ ] Advanced Usage verlinkt
- [ ] Alle Environment Variables dokumentiert (Table)
- [ ] Config-File Beispiel (falls vorhanden)

---

### Phase 8: Architektur & Tech Stack

**Visual Architecture:**

```markdown
## 🏗️ Architektur

### System Overview

\`\`\`
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │─────▶│ API │─────▶│ Database │
│ (React + TS) │ │ (FastAPI) │ │ (PostgreSQL) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
└────────────────────────┴─────────────────────────┘
Services Layer
(n8n, Grafana, Keycloak, etc.)
\`\`\`

### Tech Stack

**Frontend:**

- React 18 + TypeScript
- Tailwind CSS (Design System)
- Vite (Build Tool)
- Zustand (State Management)

**Backend:**

- FastAPI (Python 3.11+)
- Pydantic (Validation)
- SQLAlchemy (ORM)

**Database:**

- PostgreSQL 14+
- Prisma (Schema Management)

**Infrastructure:**

- Docker + Docker Compose
- n8n (Automation)
- Grafana (Monitoring)

[Detaillierte Architektur](docs/ARCHITECTURE.md)
```

**Via Filesystem MCP:**

```markdown
"Analyze package.json and requirements.txt to list all major dependencies"
```

**Checklist:**

- [ ] ASCII/Unicode Architektur-Diagramm
- [ ] Tech Stack aufgelistet (Frontend/Backend/Database/Infrastructure)
- [ ] Versionsnummern bei kritischen Dependencies
- [ ] Link zu detaillierter Architektur-Dokumentation

---

### Phase 9: Development & Testing

**Development Guide:**

```markdown
## 🛠️ Development

### Development Workflow

\`\`\`bash

# 1. Branch erstellen

git checkout -b feature/neue-funktion

# 2. Development

npm run dev

# 3. Tests schreiben

npm run test:watch

# 4. Pre-Commit Checks

npm run lint
npm run format
npm run test

# 5. Commit (Conventional Commits)

git commit -m "feat: Add neue-funktion"
\`\`\`

### Available Scripts

| Command                 | Beschreibung                     |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Development Server (hot reload)  |
| `npm run build`         | Production Build                 |
| `npm run test`          | Unit & Integration Tests         |
| `npm run test:e2e`      | E2E Tests (Playwright)           |
| `npm run lint`          | ESLint (fix: `npm run lint:fix`) |
| `npm run format`        | Prettier Formatting              |
| `npm run docs:generate` | API Docs generieren              |

[Development Guide](docs/DEVELOPMENT.md)

---

## 🧪 Testing

### Test Structure

\`\`\`
tests/
├── unit/ # Unit Tests (Vitest)
├── integration/ # Integration Tests
├── e2e/ # E2E Tests (Playwright)
└── fixtures/ # Test Data & Mocks
\`\`\`

### Running Tests

\`\`\`bash

# All Tests

npm run test

# Watch Mode

npm run test:watch

# Coverage Report

npm run test:coverage
open coverage/index.html

# E2E Tests

npm run test:e2e
\`\`\`

### Test Coverage

**Target:** ≥80% für Production Code

**Current Coverage:**

- Statements: 85%
- Branches: 78%
- Functions: 82%
- Lines: 86%

[Testing Strategy](docs/TESTING.md)
```

**Via Filesystem MCP:**

```markdown
"Parse package.json scripts and generate Available Scripts table"
```

**Via GitHub MCP:**

```markdown
"Get latest test coverage from GitHub Actions artifacts"
```

**Checklist:**

- [ ] Development Workflow beschrieben
- [ ] Available Scripts dokumentiert (Table)
- [ ] Test Structure visualisiert
- [ ] Coverage-Metrics angegeben
- [ ] Links zu ausführlichen Guides

---

### Phase 10: Deployment & Operations

**Deployment Guide:**

```markdown
## 🚢 Deployment

### Production Deployment

\`\`\`bash

# 1. Build erstellen

npm run build

# 2. Docker Image

docker build -t [project]:latest .

# 3. Deploy (z.B. Plesk)

./scripts/deploy.sh production
\`\`\`

### Environments

| Environment     | URL                 | Branch      | CI/CD           |
| --------------- | ------------------- | ----------- | --------------- |
| **Development** | localhost:3000      | `*`         | Manual          |
| **Staging**     | staging.example.com | `main`      | Auto-Deploy     |
| **Production**  | example.com         | `release/*` | Manual Approval |

### Health Checks

\`\`\`bash

# API Health

curl https://api.example.com/health

# Expected Response:

{
"status": "healthy",
"version": "1.2.3",
"timestamp": "2025-10-07T12:00:00Z"
}
\`\`\`

[Deployment Guide](docs/DEPLOYMENT.md)
```

**Checklist:**

- [ ] Deployment-Commands dokumentiert
- [ ] Environments aufgelistet (Table)
- [ ] Health-Check Endpoints dokumentiert
- [ ] Rollback-Prozedur verlinkt

---

### Phase 11: Contributing & Community

**Contribution Guidelines:**

```markdown
## 🤝 Contributing

Wir freuen uns über Contributions! 🎉

### Quick Contribution Guide

1. **Fork** das Repository
2. **Branch** erstellen (\`git checkout -b feature/amazing-feature\`)
3. **Änderungen** committen (\`git commit -m 'feat: Add amazing feature'\`)
4. **Push** zu Branch (\`git push origin feature/amazing-feature\`)
5. **Pull Request** erstellen

### Guidelines

- ✅ [Code of Conduct](CODE_OF_CONDUCT.md) - Respektvoller Umgang
- ✅ [Contributing Guide](CONTRIBUTING.md) - Detaillierte Anleitung
- ✅ [Style Guide](docs/STYLE_GUIDE.md) - Code-Konventionen

### Commit Convention

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: Neue Feature
fix: Bugfix
docs: Dokumentation
style: Formatierung
refactor: Code-Refactoring
test: Tests hinzufügen
chore: Maintenance
\`\`\`

**Beispiele:**
\`\`\`
feat(api): Add user authentication endpoint
fix(frontend): Resolve login form validation bug
docs(readme): Update installation instructions
\`\`\`

### Development Setup für Contributors

\`\`\`bash

# 1. Fork & Clone

gh repo fork [org]/[repo] --clone

# 2. Setup

npm run setup:dev

# 3. Pre-Commit Hooks installieren

npm run prepare
\`\`\`

### First-Time Contributors

Suche nach Issues mit Label `good first issue`:
[Good First Issues](https://github.com/[org]/[repo]/labels/good%20first%20issue)
```

**Via GitHub MCP:**

```markdown
"List all open 'good first issue' labeled issues for contributors"
```

**Checklist:**

- [ ] Quick Contribution Guide (5 Steps)
- [ ] Guidelines verlinkt (CoC, Contributing, Style Guide)
- [ ] Commit Convention erklärt (mit Beispielen)
- [ ] First-Time Contributor Guide
- [ ] Link zu "good first issue" Issues

---

### Phase 12: Lizenz & Kontakt

**Footer Section:**

```markdown
## 📄 Lizenz

Dieses Projekt ist unter der **MIT License** lizenziert.

Siehe [LICENSE](LICENSE) für vollständige Details.

**Wichtig:** Dieses Projekt ist DSGVO-compliant. Siehe [Datenschutzerklärung](docs/PRIVACY.md).

---

## 📞 Kontakt

**Projekt:** [Projekt-Name]  
**Organisation:** [Organisation/NGO]  
**Website:** [https://example.com](https://example.com)

### Support

- 📧 **Email:** support@example.com
- 💬 **Discord:** [Discord-Link](https://discord.gg/xyz)
- 🐛 **Issues:** [GitHub Issues](https://github.com/[org]/[repo]/issues)
- 📖 **Docs:** [Documentation](https://docs.example.com)

### Social Media

- **Twitter:** [@handle](https://twitter.com/handle)
- **LinkedIn:** [Company Page](https://linkedin.com/company/handle)
- **Mastodon:** [@handle@instance.social](https://instance.social/@handle)

### Security

Sicherheitslücken bitte an **security@example.com** melden.

Siehe [Security Policy](SECURITY.md) für Details.

---

## 🙏 Danksagungen

Besonderer Dank an:

- [Contributor 1](https://github.com/user1) - Feature XYZ
- [Contributor 2](https://github.com/user2) - Documentation
- [Open Source Project](https://github.com/project) - Inspiration & Libraries

**All Contributors:**

<a href="https://github.com/[org]/[repo]/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=[org]/[repo]" />
</a>

---

## 📊 Stats & Badges

![GitHub stars](https://img.shields.io/github/stars/[org]/[repo]?style=social)
![GitHub forks](https://img.shields.io/github/forks/[org]/[repo]?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/[org]/[repo]?style=social)

![GitHub issues](https://img.shields.io/github/issues/[org]/[repo])
![GitHub pull requests](https://img.shields.io/github/issues-pr/[org]/[repo])
![GitHub last commit](https://img.shields.io/github/last-commit/[org]/[repo])

---

**Made with ❤️ by [Organisation]**  
**Powered by Open Source**
```

**Via GitHub MCP:**

```markdown
"Get repository stats (stars, forks, watchers, contributors) for badges"
```

**Checklist:**

- [ ] Lizenz klar angegeben (mit Link)
- [ ] DSGVO-Compliance erwähnt
- [ ] Kontaktmöglichkeiten vollständig (Email, Discord, Issues)
- [ ] Social Media Links (falls vorhanden)
- [ ] Security Contact (security@)
- [ ] Contributors visualisiert (contrib.rocks)
- [ ] Stats Badges hinzugefügt

---

## 🎨 Visual Enhancements

### Screenshots & GIFs

**Empfohlene Platzierung:**

1. **Hero Image** (nach Header)
   - Product Screenshot oder Demo GIF
   - Zeigt Hauptfeature in Aktion

2. **Feature Showcase** (in Features Section)
   - Screenshot pro Hauptfeature
   - Annotiert mit Erklärungen

3. **Installation Success** (am Ende von Installation)
   - Terminal Screenshot mit Success Message

**Via Filesystem MCP:**

```markdown
"Create screenshots directory and generate placeholder images for README"
```

**Best Practices:**

- **Format:** PNG für Screenshots, GIF für Animationen
- **Size:** Max 800px Breite (Responsive)
- **Alt Text:** Descriptive (Accessibility)
- **Compression:** Optimiert (TinyPNG)

### Diagrams

**Tools:**

- **Mermaid:** Flowcharts, Sequence Diagrams (in Markdown)
- **Excalidraw:** Hand-drawn Style (export PNG)
- **Draw.io:** Professional Diagrams (export SVG)

**Beispiel Mermaid:**

```mermaid
graph TD
    A[User] -->|HTTP Request| B[API]
    B -->|Query| C[Database]
    C -->|Response| B
    B -->|JSON| A
```

---

## 🔄 Maintenance & Updates

### Automatische Updates via n8n

**Workflow: README Auto-Update**

```json
{
  "name": "README Auto-Update",
  "trigger": "Scheduled (Weekly)",
  "actions": [
    "Get latest version from package.json",
    "Update badges (build status, coverage)",
    "Refresh contributor list",
    "Validate all links",
    "Create PR if changes detected"
  ]
}
```

**Via GitHub MCP:**

```markdown
"Schedule weekly README update check via GitHub Actions"
```

### Quality Checks

**Pre-Commit:**

```bash

# .husky/pre-commit
npm run lint:markdown
npm run docs:validate
```

**GitHub Action:**

```yaml
# .github/workflows/readme-validation.yml
name: README Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint Markdown
        run: npx markdownlint-cli2 "**/*.md"
      - name: Check Links
        run: npx markdown-link-check README.md
```

---

## ✅ Final Checklist

### Must-Have Sections

- [ ] **Header** mit Badges & Elevator Pitch
- [ ] **Table of Contents** (auto-generated)
- [ ] **Überblick** (Was? Warum? Für wen?)
- [ ] **Features** (Core + Geplant)
- [ ] **Quick Start** (≤5 Steps)
- [ ] **Installation** (Detailliert mit Prerequisites)
- [ ] **Verwendung** (Code-Beispiele)
- [ ] **Konfiguration** (Environment Variables)
- [ ] **Architektur** (Diagramm + Tech Stack)
- [ ] **Development** (Workflow + Scripts)
- [ ] **Testing** (Structure + Coverage)
- [ ] **Deployment** (Environments + Commands)
- [ ] **Contributing** (Guidelines + Commit Convention)
- [ ] **Lizenz** (Clear Statement + DSGVO)
- [ ] **Kontakt** (Support + Social + Security)

### Quality Criteria

- [ ] **Länge:** 500-2000 Zeilen (ausführlich aber nicht overwhelming)
- [ ] **Lesbarkeit:** Klare Struktur, viele Emojis, visuelle Elemente
- [ ] **Accessibility:** Alt-Texte, descriptive Links
- [ ] **SEO:** Keywords in Headers, Meta-Description
- [ ] **Mobile-Friendly:** Responsive Bilder, keine zu breiten Tables
- [ ] **Up-to-Date:** Versionsnummern aktuell, Links funktionieren
- [ ] **Consistent:** Einheitlicher Stil, keine Typos
- [ ] **Complete:** Keine "[TODO]" oder "[WIP]" Sections

### Austrian NGO Specifics

- [ ] **DSGVO-Badge** vorhanden
- [ ] **Datenschutzerklärung** verlinkt
- [ ] **Austrian Flag** Badge (🇦🇹)
- [ ] **Kontakt** in Deutsch & Englisch
- [ ] **Barrierefreiheit** erwähnt (WCAG AA)

---

## 📝 Output

Nach Abschluss generieren:

1. **README.md** (komplett aktualisiert)
2. **CHANGELOG.md** Entry (README Update dokumentieren)
3. **Quality Report** (Markdown Linting Results)
4. **Git Commit:**

   ```bash
   git add README.md CHANGELOG.md
   git commit -m "docs(readme): Modernize README with 2025 best practices

   - Added comprehensive installation guide
   - Included architecture diagrams
   - Updated tech stack documentation
   - Added contribution guidelines
   - Integrated DSGVO compliance info
   - Added badges & visual elements"
   ```

---

**Prompt erstellt:** 2025-10-07  
**Kategorie:** Documentation  
**Execution Order:** 24  
**MCP Tools:** Filesystem, GitHub, Brave Search

# 🤝 Beitrag zu Menschlichkeit Österreich

Vielen Dank für Ihr Interesse, zu unserem Projekt beizutragen! Diese Anleitung hilft Ihnen dabei, effektiv zu unserem Austrian NGO Multi-Service Platform beizutragen.

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Erste Schritte](#erste-schritte)
- [Entwicklungsworkflow](#entwicklungsworkflow)
- [Quality Gates](#quality-gates)
- [Commit Konventionen](#commit-konventionen)
- [Pull Request Prozess](#pull-request-prozess)
- [Testing](#testing)
- [Sicherheit](#sicherheit)
- [Beitragen](#beitragen)

## 📜 Code of Conduct

Dieses Projekt folgt unserem [Code of Conduct](CODE_OF_CONDUCT.md). Durch die Teilnahme verpflichten Sie sich, diesen zu respektieren.

## 🚀 Erste Schritte

### Prerequisites

- **Node.js** 18+ mit npm/yarn
- **PHP** 8.4+ mit Composer
- **Python** 3.9+ mit pip
- **Docker** & Docker Compose
- **Git** mit SSH Key Setup

### Development Setup

```bash
# Repository klonen
git clone git@github.com:Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

# Abhängigkeiten installieren
npm install
composer install

# Environment Setup
cp .env.example .env
# Konfiguriere .env mit lokalen Werten

# MCP Servers starten
npm run dev:essential

# Multi-Service Development starten
npm run dev:all
```

### Architektur Überblick

```text
menschlichkeit-oesterreich-development/
├── api.menschlichkeit-oesterreich.at/    # FastAPI Backend
├── crm.menschlichkeit-oesterreich.at/    # Drupal + CiviCRM
├── frontend/                             # React/TypeScript
├── website/                              # Main Website
├── web/                                  # Educational Games
├── automation/n8n/                      # Workflow Automation
└── deployment-scripts/                  # Plesk Deployment
```

## 🔄 Entwicklungsworkflow

### Branch Strategie

- **main** - Production-ready Code
- **develop** - Integration Branch
- **feature/\*** - Feature Branches
- **fix/\*** - Bug Fixes
- **hotfix/\*** - Critical Production Fixes

### Workflow

1. **Fork** das Repository
2. **Clone** deinen Fork
3. **Branch** erstellen: `git checkout -b feature/amazing-feature`
4. **Develop** mit Quality Gates
5. **Test** lokal mit `npm run test:all`
6. **Commit** mit Conventional Commits
7. **Push** zu deinem Fork
8. **Pull Request** erstellen

## 🛡️ Quality Gates

Alle Änderungen müssen folgende Quality Gates bestehen:

### Automatische Checks

- ✅ **ESLint** - Code Qualität
- ✅ **Prettier** - Code Formatierung
- ✅ **PHPStan** - PHP Static Analysis
- ✅ **Codacy** - Maintainability ≥85%
- ✅ **Trivy** - Security Vulnerabilities = 0
- ✅ **Lighthouse** - Performance ≥90, A11y ≥90

### Required Commands

```bash
# Quality Check vor Commit
npm run quality:gates

# Security Scan
npm run security:scan

# Performance Audit
npm run performance:lighthouse

# Full Test Suite
npm run test:all
```

## 📝 Commit Konventionen

Wir verwenden [Conventional Commits](https://conventionalcommits.org/):

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat:` - Neue Features
- `fix:` - Bug Fixes
- `docs:` - Dokumentation
- `style:` - Code Formatierung
- `refactor:` - Code Refactoring
- `test:` - Tests
- `chore:` - Build/Tool Updates
- `perf:` - Performance Verbesserungen
- `ci:` - CI/CD Änderungen

### Beispiele

```bash
feat(frontend): add member authentication system
fix(api): resolve CORS issues for CiviCRM integration
docs: update GitHub Secrets setup guide
test(games): add unit tests for democracy simulator
```

## 🔍 Pull Request Prozess

### PR Template

Jeder PR muss folgende Informationen enthalten:

```markdown
## 📋 Änderungen

- [ ] Feature/Fix Beschreibung
- [ ] Breaking Changes (wenn zutreffend)
- [ ] Dokumentation Updates

## 🧪 Testing

- [ ] Unit Tests hinzugefügt/aktualisiert
- [ ] E2E Tests durchgeführt
- [ ] Manual Testing abgeschlossen

## 📊 Quality Gates

- [ ] ESLint/PHPStan passed
- [ ] Codacy Analysis passed
- [ ] Security Scan passed
- [ ] Performance Audit passed

## 🔐 Security

- [ ] Keine Secrets im Code
- [ ] DSGVO Compliance geprüft
- [ ] Security Review durchgeführt
```

### Review Kriterien

- **Code Quality** - Maintainability ≥85%
- **Security** - Keine CVE Vulnerabilities
- **Performance** - Keine Regression
- **Documentation** - Adequate Comments
- **Testing** - Adequate Coverage

## 🧪 Testing

### Test Typen

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests (Playwright)
npm run test:e2e

# Performance Tests
npm run test:performance

# Security Tests
npm run test:security
```

### Coverage Requirements

- **Minimum Coverage**: 80%
- **Critical Paths**: 95%
- **New Code**: 90%

## 🔐 Sicherheit

### Security Best Practices

- **Secrets Management** - Nur über GitHub Secrets
- **Input Validation** - Alle User Inputs validieren
- **DSGVO Compliance** - Privacy by Design
- **SQL Injection** - Prepared Statements verwenden
- **XSS Prevention** - Output Escaping
- **CSRF Protection** - Token Validation

### Vulnerability Reporting

Sicherheitslücken bitte per E-Mail an: `security@menschlichkeit-oesterreich.at`

**Nicht** über GitHub Issues melden!

## 🌍 Multi-Service Development

### Service Ports

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8001
- **CRM**: http://localhost:8000
- **Games**: http://localhost:3000
- **n8n**: http://localhost:5678

### Database Setup

```bash
# Lokale DB Setup
./scripts/database-setup.ps1

# Plesk DB Pull (nur für berechtigte Entwickler)
./scripts/db-pull.sh
```

## 📊 Monitoring & Analytics

### Development Tools

- **Codacy** - Code Quality Dashboard
- **Lighthouse CI** - Performance Monitoring
- **Snyk** - Security Vulnerability Tracking
- **n8n** - Workflow Automation

### Metrics

- **Performance**: Lighthouse Scores ≥90
- **Quality**: Codacy Grade A
- **Security**: Snyk Issues = 0
- **Accessibility**: WCAG AA Compliance

## 🎯 Contribution Guidelines

### Austrian NGO Focus

- **Mission Alignment** - Beiträge sollten unsere Mission unterstützen
- **Educational Value** - Besonders Bildungskomponenten willkommen
- **Accessibility** - WCAG AA Compliance erforderlich
- **German Language** - UI Texte auf Deutsch
- **DSGVO Compliance** - Privacy by Design

### Code Style

- **TypeScript** - Strict Mode aktiviert
- **PHP 8.4** - Modern PHP Features verwenden
- **CSS** - Tailwind CSS mit Design Tokens
- **Documentation** - JSDoc/PHPDoc für alle Public APIs

## 💬 Community

### Communication Channels

- **GitHub Discussions** - Allgemeine Diskussionen
- **GitHub Issues** - Bug Reports & Feature Requests
- **Pull Requests** - Code Reviews
- **E-Mail** - Sensitive/Security Topics

### Meetings

- **Weekly Sync** - Donnerstags 14:00 CET
- **Monthly Review** - Erstes Wochenende im Monat
- **Quarterly Planning** - Strategische Roadmap

## 🏆 Recognition

Bedeutende Beiträge werden anerkannt durch:

- **Contributors List** - README.md
- **Release Notes** - Feature Attribution
- **Annual Report** - Community Highlights
- **GitHub Achievements** - Badges & Recognition

## ❓ Hilfe & Support

### Dokumentation

- **Technical Docs** - `/docs` Verzeichnis
- **API Docs** - OpenAPI Specifications
- **User Guides** - Website Documentation
- **Architecture** - `docs/architecture.md`

### Support Channels

1. **GitHub Discussions** - Community Support
2. **GitHub Issues** - Bug Reports
3. **Email Support** - `support@menschlichkeit-oesterreich.at`
4. **Emergency** - `security@menschlichkeit-oesterreich.at`

## Beitragen

Vielen Dank, dass Sie zu unserem Projekt beitragen möchten! Bitte folgen Sie dieser Anleitung, um sicherzustellen, dass Ihr Beitrag effektiv und wertvoll ist.

### Prompts & Chatmodes
- Lege neue Chatmodes als YAML in `.github/prompts/chatmodes/` an (kebab_case id, SemVer).
- Erzeuge/aktualisiere passende `_examples.md`.
- Halte dich an `global/01_style_guide.md` und `global/02_guardrails.md`.
- Füge Assertions unter `tests:` hinzu (Form: `assertion`, `expected`).
- Lokale Validierung optional:
```bash
for f in .github/prompts/chatmodes/*.yaml; do yq -o=json "$f" > "$f.json"; done
ajv validate -s .github/prompts/chatmodes/_schema.json -d ".github/prompts/chatmodes/*.yaml.json"
```

#### Workflow für Prompt-Änderungen
1. Mapping prüfen/anpassen in `.github/prompts/MIGRATION_MAP.md` (Alt → Neu).
2. YAML aktualisieren (Version nach SemVer anheben) und `_examples.md` pflegen.
3. `tests:` Assertions ergänzen/prüfen (id/semver, ggf. domänenspezifisch).
4. CI laufen lassen (Prompt CI muss grün sein).
5. PR mit Checkliste in `PULL_REQUEST_TEMPLATE.md` erstellen und `CHANGELOG.md` ergänzen (`docs(prompts): ...`).

---

**Danke, dass Sie zu Menschlichkeit Österreich beitragen! 🇦🇹 Gemeinsam bauen wir eine bessere, inklusivere Gesellschaft auf.**

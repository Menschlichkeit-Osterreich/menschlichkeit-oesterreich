# Contributing to Menschlichkeit Österreich

> **Vielen Dank für Ihr Interesse, zu diesem Projekt beizutragen!**

Dieses Dokument enthält Richtlinien und Best Practices für Contributions zu diesem Repository.

---

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Prozess](#pull-request-prozess)
- [Code Review Guidelines](#code-review-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Quality Gates](#quality-gates)
- [CODEOWNERS](#codeowners)
- [Support](#support)

---

## Code of Conduct

Dieses Projekt folgt dem [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Durch Ihre Teilnahme verpflichten Sie sich, diesen Code einzuhalten.

---

## Wie kann ich beitragen?

### 🐛 Bug Reports

- Verwenden Sie das [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
- Beschreiben Sie das Problem detailliert
- Fügen Sie Schritte zur Reproduktion hinzu
- Geben Sie Ihre Umgebung an (OS, Browser, Versionen)

### ✨ Feature Requests

- Verwenden Sie das [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
- Erklären Sie den Use Case
- Beschreiben Sie die gewünschte Lösung
- Nennen Sie mögliche Alternativen

### 📝 Documentation Improvements

- Korrekturen von Tippfehlern
- Verbesserung der Klarheit
- Hinzufügen von Beispielen
- Übersetzungen (Deutsch ↔ Englisch)

### 🔧 Code Contributions

- Bug Fixes
- Feature Implementations
- Performance Improvements
- Refactoring

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 22.0.0 (LTS)
- **npm** ≥ 10.0.0
- **PowerShell** ≥ 7.0 (für Scripts)
- **Docker** ≥ 24.0 (für lokale Services)
- **Git** ≥ 2.40

### Installation

```bash
# 1. Repository klonen
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

# 2. Dependencies installieren
npm install

# 3. Environment Setup
cp .env.example .env
# Editieren Sie .env mit Ihren lokalen Einstellungen

# 4. Development Server starten
npm run dev:all
```

### Verify Setup

```bash
# Alle Quality Checks ausführen
npm run quality:gates

# Erwartetes Ergebnis: Alle Checks grün ✅
```

---

## Branch Strategy

Wir verwenden **Git Flow** mit angepassten Branch-Namen:

### Branch Types

```
main                    → Production (geschützt)
develop                 → Integration Branch (geschützt)
feature/*               → Neue Features
fix/*                   → Bug Fixes
hotfix/*                → Dringende Production Fixes
docs/*                  → Documentation Updates
refactor/*              → Code Refactoring
test/*                  → Test Improvements
chore/*                 → Maintenance Tasks
```

### Branch Naming Convention

```bash
# Feature Branch
feature/<issue-number>-<short-description>
# Beispiel: feature/123-user-authentication

# Bug Fix Branch
fix/<issue-number>-<short-description>
# Beispiel: fix/456-login-error

# Documentation Branch
docs/<issue-number>-<short-description>
# Beispiel: docs/789-api-guide
```

### Workflow

```bash
# 1. Branch erstellen von develop
git checkout develop
git pull origin develop
git checkout -b feature/123-my-feature

# 2. Änderungen vornehmen und committen
git add .
git commit -m "feat: add user authentication"

# 3. Regelmäßig mit develop synchronisieren
git fetch origin
git rebase origin/develop

# 4. Branch pushen
git push origin feature/123-my-feature

# 5. Pull Request erstellen
gh pr create --base develop --head feature/123-my-feature
```

---

## Commit Convention

Wir verwenden **Conventional Commits** für automatische Changelog-Generierung und Semantic Versioning.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Beschreibung | Changelog |
|------|--------------|-----------|
| `feat` | Neue Feature | Minor |
| `fix` | Bug Fix | Patch |
| `docs` | Documentation | - |
| `style` | Formatting, keine Code-Änderung | - |
| `refactor` | Code-Refactoring | - |
| `test` | Tests hinzufügen/ändern | - |
| `chore` | Build, CI/CD, Dependencies | - |
| `perf` | Performance Improvement | Patch |
| `ci` | CI/CD Configuration | - |
| `build` | Build System | - |
| `revert` | Revert eines Commits | - |

### Breaking Changes

Breaking Changes **MÜSSEN** mit `!` markiert werden:

```bash
feat!: change API response format

BREAKING CHANGE: The API now returns data in a different format.
Migration guide: ...
```

### Examples

```bash
# Feature
feat(auth): add OAuth2 authentication

# Bug Fix
fix(api): resolve null pointer exception in user service

# Documentation
docs(readme): update installation instructions

# Breaking Change
feat(api)!: change authentication endpoint

BREAKING CHANGE: The /auth endpoint is now /api/v2/auth
```

### Enforcing Convention

Wir verwenden **commitlint** in Pre-Commit Hooks:

```bash
# Test Commit Message
echo "feat: test message" | npx commitlint

# Pre-Commit Hook wird automatisch ausgeführt
git commit -m "invalid message"  # ❌ Wird abgelehnt
git commit -m "feat: valid message"  # ✅ Wird akzeptiert
```

---

## Pull Request Prozess

### Before Creating a PR

```bash
# 1. Alle Tests müssen grün sein
npm run test

# 2. Linting muss sauber sein
npm run lint

# 3. Build muss erfolgreich sein
npm run build

# 4. Quality Gates müssen passieren
npm run quality:gates
```

### Creating a PR

1. **Title:** Verwenden Sie Conventional Commits Format
   ```
   feat(auth): add two-factor authentication
   ```

2. **Description:** Verwenden Sie das PR-Template
   - Was wurde geändert?
   - Warum wurde es geändert?
   - Wie wurde es getestet?
   - Screenshots (bei UI-Änderungen)

3. **Link Issues:** Verwenden Sie Keywords
   ```markdown
   Closes #123
   Fixes #456
   Relates to #789
   ```

4. **Labels:** Fügen Sie relevante Labels hinzu
   - `bug`, `feature`, `documentation`, `security`, etc.

5. **Reviewers:** Weisen Sie automatisch per CODEOWNERS zu

### PR Checklist

- [ ] Code folgt dem Style Guide
- [ ] Alle Tests sind grün
- [ ] Neue Tests wurden hinzugefügt
- [ ] Documentation wurde aktualisiert
- [ ] Keine Secrets im Code
- [ ] DSGVO-Compliance geprüft (falls relevant)
- [ ] Breaking Changes dokumentiert
- [ ] Changelog Entry erstellt
- [ ] Screenshots hinzugefügt (bei UI)

### Required Checks

Alle PRs müssen folgende Checks bestehen:

- ✅ **CI/CD Pipeline:** Build + Tests
- ✅ **Linting:** ESLint + Prettier
- ✅ **Security:** CodeQL + Dependency Check
- ✅ **Quality:** Codacy Grade ≥ B
- ✅ **Coverage:** ≥ 80% für neue Code
- ✅ **Code Review:** Min. 1 Approval

---

## Code Review Guidelines

### For Reviewers

#### What to Review

- **Functionality:** Does it work as intended?
- **Code Quality:** Is it readable and maintainable?
- **Tests:** Are there adequate tests?
- **Documentation:** Is it documented?
- **Security:** Are there security issues?
- **Performance:** Is it performant?
- **DSGVO:** Compliance with data protection?

#### Review Checklist

- [ ] Code ist verständlich und gut strukturiert
- [ ] Tests decken neuen/geänderten Code ab
- [ ] Keine offensichtlichen Bugs oder Performance-Probleme
- [ ] Dokumentation ist aktuell
- [ ] Keine Secrets oder sensible Daten im Code
- [ ] DSGVO-Anforderungen beachtet (bei Datenverarbeitung)
- [ ] Breaking Changes klar dokumentiert

#### Review Comments

```markdown
# ✅ Approve - Code ist gut
# 💡 Comment - Vorschlag zur Verbesserung
# ⚠️ Request Changes - Änderungen erforderlich
# ❓ Question - Frage zum Code
```

### For Authors

#### Responding to Reviews

- Seien Sie offen für Feedback
- Erklären Sie Ihre Entscheidungen
- Diskutieren Sie Alternativen
- Aktualisieren Sie den Code basierend auf Feedback
- Markieren Sie Conversations als resolved

#### After Approval

```bash
# 1. Rebase auf aktuellen develop Branch
git fetch origin
git rebase origin/develop

# 2. Squash Commits (optional, für saubere History)
git rebase -i HEAD~3

# 3. Force Push (nach Rebase)
git push --force-with-lease

# 4. Merge (automatisch nach Approval)
# Wird von Maintainer durchgeführt
```

---

## Testing Requirements

### Unit Tests

- **Framework:** Vitest
- **Coverage:** ≥ 80% für neuen Code
- **Location:** `tests/unit/`

```bash
# Unit Tests ausführen
npm run test:unit

# Mit Coverage
npm run test:unit -- --coverage
```

### Integration Tests

- **Framework:** Jest
- **Coverage:** Alle API-Endpoints
- **Location:** `tests/integration/`

```bash
# Integration Tests ausführen
npm run test:integration
```

### E2E Tests

- **Framework:** Playwright
- **Coverage:** Kritische User Flows
- **Location:** `tests/e2e/`

```bash
# E2E Tests ausführen
npm run test:e2e

# Mit UI
npm run test:e2e -- --ui
```

### Test Best Practices

```typescript
// ✅ GOOD: Descriptive test name
test('should return user data when authenticated', async () => {
  // Arrange
  const user = createTestUser();
  
  // Act
  const result = await getUserData(user.id);
  
  // Assert
  expect(result).toEqual(expect.objectContaining({
    id: user.id,
    name: user.name
  }));
});

// ❌ BAD: Vague test name
test('test1', () => {
  // ...
});
```

---

## Documentation Standards

### Markdown Files

- **Front-Matter:** Alle `.md` Dateien brauchen YAML Front-Matter
- **Language:** Deutsch (de-AT) für User-Docs, Englisch für Technical Docs
- **Format:** Siehe [NORMALIZATION_RULES.yml](NORMALIZATION_RULES.yml)

### Code Comments

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate user age based on birthdate to determine membership eligibility
const age = calculateAge(user.birthdate);

// ❌ BAD: States the obvious
// Get the user
const user = getUser();
```

### API Documentation

- **Format:** OpenAPI 3.0
- **Location:** `api.menschlichkeit-oesterreich.at/openapi.yaml`
- **Auto-Generate:** `npm run api:docs`

### Inline Documentation

```typescript
/**
 * Authenticates a user with email and password.
 * 
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @returns Authentication token and user data
 * @throws {AuthenticationError} If credentials are invalid
 * 
 * @example
 * ```typescript
 * const result = await authenticateUser('user@example.com', 'password123');
 * console.log(result.token);
 * ```
 */
export async function authenticateUser(
  email: string, 
  password: string
): Promise<AuthResult> {
  // Implementation
}
```

---

## Quality Gates

Alle Contributions müssen folgende Quality Gates passieren:

### Code Quality

```bash
# ESLint (0 Errors)
npm run lint

# TypeScript Check (0 Errors)
npm run typecheck

# Prettier Format
npm run format
```

### Security

```bash
# Dependency Audit
npm audit

# Code Scanning
npm run security:scan

# Secret Detection
npm run security:secrets
```

### Performance

```bash
# Lighthouse Audit
npm run performance:lighthouse

# Bundle Size Check
npm run build:analyze
```

### DSGVO Compliance

```bash
# PII Detection
npm run compliance:dsgvo

# Consent Management Check
npm run compliance:consent
```

### Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Test Coverage | 80% | 90% |
| Code Quality (Codacy) | Grade B | Grade A |
| Lighthouse Performance | 90 | 95 |
| Lighthouse Accessibility | 90 | 100 |
| Bundle Size (gzip) | < 200 KB | < 150 KB |

---

## CODEOWNERS

Bestimmte Dateien/Directories benötigen Review von spezifischen Teams:

```
# Root Configuration
/.github/          @peschull
/package.json      @peschull

# Services
/api.*/            @backend-team
/frontend/         @frontend-team
/crm.*/            @crm-team
/automation/       @devops-team

# Documentation
/docs/             @documentation-team
/*.md              @documentation-team

# Security & Compliance
/security/         @security-team
/docs/compliance/  @legal-team

# CI/CD
/.github/workflows/ @devops-team
/deployment-scripts/ @devops-team
```

---

## Support

### Fragen?

- 📧 **Email:** dev@menschlichkeit-oesterreich.at
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)

### Resources

- 📚 [Documentation](docs/)
- 🏗️ [Architecture Guide](docs/architecture/)
- 🔒 [Security Policy](SECURITY.md)
- 📊 [Project Board](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/projects)

---

## Anerkennungen

Vielen Dank an alle Contributors, die zu diesem Projekt beigetragen haben! 🎉

[Contributors](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/graphs/contributors)

---

**Letzte Aktualisierung:** 2025-10-13  
**Version:** 1.0.0  
**Maintainer:** Development Team

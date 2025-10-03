## 🎯 Änderungen

Beschreibe kurz was geändert wurde:

- [ ] ✨ Neue Features hinzugefügt
- [ ] 🐛 Bugs behoben
- [ ] 🔧 Refactoring/Code Verbesserungen
- [ ] 📚 Dokumentation Updates
- [ ] 🎨 UI/UX Verbesserungen
- [ ] ⚡ Performance Optimierungen
- [ ] 🔐 Security Updates
- [ ] 🧪 Tests hinzugefügt/verbessert

### 📋 Details

<!-- Detaillierte Beschreibung der Änderungen -->

### 💥 Breaking Changes

<!-- Falls zutreffend, beschreibe Breaking Changes -->

- [ ] Keine Breaking Changes
- [ ] Breaking Changes (Details unten)

## 🏗️ Betroffene Services

Welche Teile der Anwendung sind betroffen?

- [ ] 🌐 Website (menschlichkeit-oesterreich.at)
- [ ] ⚡ Frontend (React App)
- [ ] 🔧 API (FastAPI Backend)
- [ ] 👥 CRM (CiviCRM/Drupal)
- [ ] 🎮 Games (Educational Platform)
- [ ] 🤖 Automation (n8n Workflows)
- [ ] 📱 Mobile Experience
- [ ] 🔐 Authentication/Security
- [ ] 💳 Payment System
- [ ] 🗄️ Database Schema
- [ ] 🚀 Deployment/Infrastructure

## 🧪 Testing

Wie wurde getestet?

### ✅ Completed Tests

- [ ] Unit Tests geschrieben/aktualisiert
- [ ] Integration Tests durchgeführt
- [ ] E2E Tests (Playwright) durchgeführt
- [ ] Manual Testing abgeschlossen
- [ ] Cross-Browser Testing (Chrome, Firefox, Safari)
- [ ] Mobile Testing (iOS, Android)
- [ ] Performance Testing
- [ ] Security Testing
- [ ] Accessibility Testing (WCAG AA)

### 🧪 Test Details

```
Beschreibe spezifische Tests oder edge cases die geprüft wurden:
- Test 1: ...
- Test 2: ...
```

### 📊 Coverage

- [ ] Coverage ist gleich geblieben oder gestiegen
- [ ] Neue Code Coverage: \_\_\_%

## 📊 Quality Gates

Bestätige dass alle Quality Gates erfüllt sind:

### 🔍 Code Quality

- [ ] ESLint: Keine Errors ✅
- [ ] PHPStan: Level 8 passed ✅
- [ ] Prettier: Code formatted ✅
- [ ] Codacy: Maintainability ≥85% ✅

### 🔐 Security

- [ ] Trivy: Keine CVE Vulnerabilities ✅
- [ ] Snyk: Security scan passed ✅
- [ ] Secret Scan: Keine Secrets im Code ✅
- [ ] DSGVO: Privacy compliance geprüft ✅

### ⚡ Performance

- [ ] Lighthouse: Performance ≥90 ✅
- [ ] Lighthouse: Accessibility ≥90 ✅
- [ ] Lighthouse: Best Practices ≥95 ✅
- [ ] Lighthouse: SEO ≥90 ✅
- [ ] Bundle Size: Keine signifikante Erhöhung

### 🌍 Internationalization & Accessibility

- [ ] German text korrekt implementiert
- [ ] WCAG AA compliance getestet
- [ ] Screen Reader kompatibel
- [ ] Keyboard Navigation funktional
- [ ] Color Contrast ≥4.5:1

## 🔐 Security Checklist

Bei sicherheitsrelevanten Änderungen:

- [ ] Input Validation implementiert
- [ ] Output Sanitization/Escaping
- [ ] SQL Injection Prevention (Prepared Statements)
- [ ] XSS Prevention
- [ ] CSRF Protection
- [ ] Rate Limiting (falls relevant)
- [ ] Authentication/Authorization geprüft
- [ ] Secrets Management korrekt
- [ ] Error Handling (keine Infos leakage)

## 🇦🇹 Austrian NGO Specific

Relevanz für Menschlichkeit Österreich:

### 🎓 Educational Impact

- [ ] Verbessert Bildungsangebote
- [ ] Fördert demokratisches Verständnis
- [ ] Stärkt Menschenrechts-Bewusstsein
- [ ] Unterstützt kritisches Denken

### 🏛️ Compliance & Legal

- [ ] DSGVO konform
- [ ] Österreichisches Vereinsrecht berücksichtigt
- [ ] Barrierefreiheitsgesetz (BFSG) konform
- [ ] EU Web Accessibility Directive konform

### 🤝 Community & Engagement

- [ ] Verbessert User Experience für Mitglieder
- [ ] Fördert Community Engagement
- [ ] Unterstützt Volunteer Management
- [ ] Erleichtert Spenden/Beiträge

## 📱 Multi-Device Testing

- [ ] Desktop (1920x1080+) ✅
- [ ] Tablet (768px-1024px) ✅
- [ ] Mobile Large (375px+) ✅
- [ ] Mobile Small (320px+) ✅

### Browser Compatibility

- [ ] Chrome (latest) ✅
- [ ] Firefox (latest) ✅
- [ ] Safari (latest) ✅
- [ ] Edge (latest) ✅

## 🗄️ Database Changes

Falls Database Schema geändert wurde:

- [ ] Migrations erstellt
- [ ] Rollback Strategy definiert
- [ ] Data Migration getestet
- [ ] Performance Impact geprüft
- [ ] Backup Strategy bestätigt

### Migration Details

```sql
-- Füge SQL hier ein falls relevant
```

## 📚 Documentation Updates

- [ ] README.md aktualisiert
- [ ] API Documentation aktualisiert
- [ ] Code Comments hinzugefügt/aktualisiert
- [ ] Architecture Docs aktualisiert
- [ ] User Guide aktualisiert
- [ ] Deployment Docs aktualisiert

## 🚀 Deployment Notes

Besondere Deployment Überlegungen:

- [ ] Standard Deployment
- [ ] Spezielle Deployment Schritte erforderlich
- [ ] Environment Variables Updates
- [ ] Service Restarts erforderlich
- [ ] Database Migrations erforderlich

### Deployment Checklist

```bash
# Spezielle Commands oder Steps
1. ...
2. ...
```

## 🔄 Rollback Plan

Falls dieser PR Probleme verursacht:

- [ ] Einfacher Git Revert möglich
- [ ] Database Rollback erforderlich
- [ ] Manual Cleanup Steps erforderlich

### Rollback Steps

```bash
# Commands für Rollback
1. git revert <commit>
2. ...
```

## 📞 Review Notes

Für Reviewer:

### 🎯 Focus Areas

Bitte besonders auf folgende Bereiche achten:

- Performance implications
- Security considerations
- DSGVO compliance
- User experience changes

### 🧪 Testing Instructions

```bash
# Specific test commands for reviewers
npm run test:specific
./scripts/test-feature.sh
```

## ✅ Final Checklist

Vor dem Merge:

- [ ] Alle GitHub Actions/Workflows passed ✅
- [ ] Code Review completed ✅
- [ ] QA Testing completed ✅
- [ ] Documentation updated ✅
- [ ] Deployment plan confirmed ✅
- [ ] Rollback plan confirmed ✅

---

## 📝 Additional Notes

<!-- Weitere wichtige Informationen -->

/cc @team-leads @security-team @quality-assurance

---
title: Quality Gates Instructions
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: critical
category: core
applyTo: **/*
---
# Quality Gates Instructions

## MANDATORY Quality Gates (PR-Blocking)

**KEINE AUSNAHMEN - Alle Gates müssen GRÜN sein vor Merge/Deployment**

### Gate 1: Security (CRITICAL)
```markdown
Via GitHub MCP:
□ Dependabot Alerts: 0 HIGH/CRITICAL
□ Secret Scanning: 0 exposed secrets
□ Code Scanning: 0 security findings

Via Filesystem MCP:
□ No .env files in git
□ No hardcoded credentials
□ No API keys in code

Via Brave Search MCP (bei Findings):
"Search CVE-{NUMBER} exploit details"
"Find security patch for {PACKAGE}"

BLOCKER wenn:
- CVE CVSS ≥ 7.0
- PII/Credentials exposed
- Exploit in the wild
```

### Gate 2: DSGVO/Privacy (CRITICAL für NGO)
```markdown
Via PostgreSQL MCP:
□ PII fields encrypted
□ Consent flags exist
□ Data retention implemented

Via Filesystem MCP:
□ No PII in logs
□ Privacy Policy updated
□ Cookie Consent implemented

Via Brave Search MCP:
"Search GDPR Art. {NUMBER} requirements"
"Find Austrian data protection law updates"

BLOCKER wenn:
- PII unverschlüsselt
- No consent mechanism
- Missing legal basis (Art. 6 DSGVO)
```

### Gate 3: Code Quality
```markdown
Via Codacy MCP (automatisch):
□ Maintainability ≥ 85%
□ Duplication ≤ 2%
□ Complexity innerhalb Limits
□ 0 CRITICAL issues

Via Filesystem MCP:
□ TypeScript strict mode
□ ESLint 0 errors
□ PHPStan level 6 passed

BLOCKER wenn:
- Maintainability < 85%
- Duplication > 2%
- CRITICAL issues exist
```

### Gate 4: Testing
```markdown
Via Playwright MCP:
□ E2E Tests: 100% passing
□ Critical User Flows covered
□ No flaky tests

Via Filesystem MCP:
□ Unit Test Coverage ≥ 80%
□ Integration Tests exist
□ Tests für neue Features

BLOCKER wenn:
- E2E Tests failing
- Coverage < 80%
- No tests für neue Features
```

### Gate 5: Performance
```markdown
Via Playwright MCP:
□ Lighthouse Performance ≥ 90
□ Lighthouse Accessibility ≥ 90
□ Lighthouse Best Practices ≥ 95
□ Lighthouse SEO ≥ 90

Via PostgreSQL MCP:
□ Query Performance < 100ms
□ No N+1 queries
□ Indexes vorhanden

Via Filesystem MCP:
□ Bundle Size within limits
□ Images optimized (WebP)
□ Code-Splitting implemented

BLOCKER wenn:
- Lighthouse Score < 90
- Query Time > 500ms
- Bundle Size > 300KB
```

### Gate 6: Accessibility (WCAG AA)
```markdown
Via Figma MCP:
□ Design Token Kontrast ≥ 4.5:1
□ Touch Targets ≥ 44x44px

Via Playwright MCP:
□ Axe Accessibility Scan passed
□ Keyboard Navigation funktioniert
□ Screen Reader Support

Via Filesystem MCP:
□ Semantic HTML verwendet
□ aria-labels vorhanden
□ Alt-Tags für Images

BLOCKER wenn:
- WCAG AA violations
- Keyboard nav broken
- Missing aria-labels
```

### Gate 7: Design System Compliance
```markdown
Via Figma MCP:
□ Design Token Drift = 0
□ Components match Figma

Via Filesystem MCP:
□ No hardcoded colors
□ No hardcoded spacing
□ Tailwind classes verwendet

Via Memory MCP:
"Check design system version consistency"

BLOCKER wenn:
- Token Drift > 0
- Hardcoded styles exist
- Component mismatch with Figma
```

### Gate 8: Documentation
```markdown
Via Filesystem MCP:
□ README updated
□ API Docs aktualisiert (OpenAPI)
□ CHANGELOG entry erstellt
□ Code-Kommentare vollständig

Via GitHub MCP:
□ PR Description complete
□ Related Issues linked
□ Breaking Changes dokumentiert

BLOCKER wenn:
- API Changes undocumented
- Breaking Changes without notice
- Missing CHANGELOG entry
```

## Automatische Enforcement

### Pre-Commit Hook
```bash
# Nach jedem File-Edit (via Copilot Instructions):
1. Codacy MCP analysiert automatisch
2. Filesystem MCP prüft auf Secrets
3. Bei Findings: STOP → FIX → REANALYSE

# Nie committen wenn:
- Security findings exist
- PII exposed
- Quality below threshold
```

### Pre-Push Validation
```bash
# Vor jedem Push:
npm run quality:gates

# Prüft:
✅ All 8 Quality Gates
✅ Tests passing
✅ Build successful
✅ No regressions

# Bei Failure:
- STOP Push
- Show detailed report
- Fix before retry
```

### Pre-PR Checks
```bash
# Automatisch via GitHub Actions:
- Security Scan (Trivy, Gitleaks)
- Quality Analysis (Codacy)
- Performance Test (Lighthouse)
- Accessibility Audit (Axe)
- DSGVO Compliance Check

# PR kann nur gemerged werden wenn:
ALL_GATES_GREEN = true
```

## Service-Spezifische Gates

### CRM Service (Drupal + CiviCRM)
```markdown
ZUSÄTZLICH:
Via PostgreSQL MCP:
□ CiviCRM Schema integrity
□ Contact data encrypted
□ Donation records compliant

Via Filesystem MCP:
□ Drupal Coding Standards
□ Security updates applied
□ Custom modules tested
```

### API Backend (FastAPI)
```markdown
ZUSÄTZLICH:
Via Filesystem MCP:
□ OpenAPI Spec complete
□ Pydantic Models validated
□ Error Handling implemented

Via PostgreSQL MCP:
□ Connection Pooling configured
□ Query optimization verified
□ Migration rollback tested
```

### Frontend (React/TypeScript)
```markdown
ZUSÄTZLICH:
Via Figma MCP:
□ Design System Sync 100%
□ Austrian Branding korrekt

Via Playwright MCP:
□ Cross-Browser Tests passed
□ Mobile Responsive
□ PWA Audit passed
```

### Gaming Platform
```markdown
ZUSÄTZLICH:
Via PostgreSQL MCP:
□ XP/Achievement System konsistent
□ Game Session tracking korrekt
□ Leaderboard performant

Via Playwright MCP:
□ Game Flow E2E Tests
□ Multi-Player synchronisation
```

## Gate Failure Response

### CRITICAL Failure (Security/DSGVO)
```markdown
1. IMMEDIATE STOP all deployments
2. Via GitHub MCP: Create CRITICAL issue
3. Via Memory MCP: Store incident details
4. Notify: Security Team + DPO
5. Fix → Revalidate → Document
```

### HIGH Failure (Quality/Performance)
```markdown
1. Block PR merge
2. Via GitHub MCP: Add review comments
3. Via Memory MCP: Track patterns
4. Fix within 24h
5. Re-run gates
```

### MEDIUM Failure (Documentation/Tests)
```markdown
1. Warning in PR
2. Via GitHub MCP: Request changes
3. Fix within sprint
4. Update before next release
```

## Monitoring & Reporting

### Daily Quality Report
```markdown
Via Memory MCP:
"Generate quality trend report"

Metrics:
- Gate Pass Rate (Target: 100%)
- Average Fix Time
- Recurring Issues
- Team Performance

Via GitHub MCP:
"Post report as issue with label 'quality-report'"
```

### Sprint Quality Review
```markdown
Via Memory MCP:
"Analyze sprint quality metrics"

Review:
- Gates blocked how many PRs?
- Most common failures?
- Improvement areas?

Via Brave Search MCP:
"Search for quality improvement strategies"
```

## Quality Culture

### Team Guidelines
```markdown
✅ DO:
- Run quality:gates before PR
- Fix findings immediately
- Ask for help wenn unclear
- Document learnings

❌ DON'T:
- Skip quality checks
- Force push without validation
- Ignore warnings
- Blame tools/process
```

### Continuous Improvement
```markdown
Via Memory MCP:
"Track quality improvements over time"

Monthly Review:
- Gate effectiveness
- False positives
- Process optimizations
- Tool updates

Via Brave Search MCP:
"Search for latest quality practices"
```

---

**Enforcement:** AUTOMATISCH via Copilot Instructions + GitHub Actions
**Override:** NUR mit CTO Approval + dokumentierter Begründung
**Goal:** 100% Gate Pass Rate, Zero Production Incidents

---
title: 'Mcpfeatureimplementation'
description: 'MCP-gestützte Feature Implementation'
lastUpdated: 2025-10-10
status: ACTIVE
category: development
tags: ['development', 'mcp', 'dsgvo']
version: '1.0.0'
language: de-AT
audience: ['Backend Team', 'Frontend Team']
---

```prompt
---
title: MCP Feature Implementation
description: Vollständige Feature-Implementierung mit MCP-Tools von Design bis Deployment
service: all
mcpTools: required
---

# MCP-gestützte Feature Implementation

**Szenario:** Neues Feature "{FEATURE_NAME}" implementieren

## 📋 Phase 1: Requirements & Design (Figma MCP + GitHub MCP)

```

1. Via GitHub MCP:
   "Show issue #{ISSUE_NUMBER} with all comments and requirements"
2. Via Figma MCP:
   "Get design system rules for {FEATURE_NAME}"
   "Extract component code from node {NODE_ID}"
   "Get screenshot of design mockup"

3. Via Memory MCP:
   "Load similar feature implementations from past"

OUTPUT: Vollständiges Requirements-Dokument mit Design-Specs

```text

## 🏗️ Phase 2: Architecture Planning (Multi-Service)

```

Feature: "Newsletter-Anmeldung mit DSGVO-Consent"

### CRM Service (Drupal + CiviCRM)

Via PostgreSQL MCP:
"Check if table civicrm_contact has consent_newsletter column"
"Show contact schema for required fields"

Falls Migration nötig:
Via Filesystem MCP:
"Create migration or CRM patch under: apps/crm/web/modules/custom/"

### API Backend (FastAPI)

Via Filesystem MCP:
"Create endpoint: apps/api/app/routers/newsletter.py"

Code Template:
from fastapi import APIRouter, Depends
from app.models.contact import NewsletterSubscription
from app.services.privacy import sanitize_pii

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

@router.post("/subscribe")
async def subscribe(
email: str,
consent_given: bool,
db: Session = Depends(get_db)
): # PII Sanitization
sanitized = sanitize_pii({"email": email})

    # DSGVO: Explicit Consent Check
    if not consent_given:
        raise HTTPException(400, "Consent required")

    # Via PostgreSQL MCP: Store in CRM
    # ...

### Frontend (React/TypeScript)

Via Figma MCP:
"Get code for newsletter form component"

Via Filesystem MCP:
"Create component: apps/website/src/components/Newsletter/SubscribeForm.tsx"

Code:
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export const NewsletterForm = () => {
const [email, setEmail] = useState('');
const [consent, setConsent] = useState(false);

const handleSubmit = async () => {
// Via API: POST /newsletter/subscribe
const response = await fetch('/api/newsletter/subscribe', {
method: 'POST',
body: JSON.stringify({ email, consent_given: consent })
});

    if (response.ok) {
      // Success handling
    }

};

return (
<form onSubmit={handleSubmit}>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="border-brand-red p-md"
/>

      <label>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Ich stimme der Datenverarbeitung gemäß DSGVO zu
        <a href="/datenschutz">Datenschutzerklärung</a>
      </label>

      <Button variant="primary" type="submit">
        Anmelden
      </Button>
    </form>

);
};

### n8n Automation

Via Filesystem MCP:
"Create workflow: automation/n8n/workflows/newsletter-welcome-email.json"

Workflow:

1. Webhook Trigger (from API)
2. CRM Lookup (via PostgreSQL)
3. Email Send (via SMTP)
4. Analytics Event

```text

## 🧪 Phase 3: Test Implementation (Playwright MCP)

```

Via Playwright MCP:
"Create E2E test for newsletter subscription flow"

Via Filesystem MCP:
"Create test: tests/e2e/newsletter-subscription.spec.ts"

import { test, expect } from '@playwright/test';

test.describe('Newsletter Subscription', () => {
test('should successfully subscribe with valid email and consent', async ({ page }) => {
await page.goto('http://localhost:5173/newsletter');

    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.check('[data-testid="consent-checkbox"]');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

});

test('should reject subscription without consent (DSGVO)', async ({ page }) => {
await page.goto('http://localhost:5173/newsletter');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    // NO consent checked

    await page.click('[data-testid="submit-button"]');

    // Verify error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Zustimmung erforderlich');

});
});

Via Playwright MCP:
"Run test and capture results"

```text

## 🔒 Phase 4: Security & DSGVO Audit

```

Via GitHub MCP:
"Check for Dependabot alerts in added dependencies"

Via PostgreSQL MCP:
"Verify PII encryption for email column"
"Check if consent_timestamp is stored"

Via Filesystem MCP:
"Search for PII in application logs":
→ "grep -r 'log.\*email' apps/api/app/"

Via Brave Search MCP:
"Search GDPR requirements for newsletter subscriptions"

CHECKLIST:
□ Explicit Consent UI implementiert?
□ Opt-Out Mechanismus vorhanden?
□ Data Retention Policy (z.B. 2 Jahre)?
□ Encryption at Rest (PostgreSQL)?
□ PII nicht in Logs?
□ Privacy Notice verlinkt?

```text

## ✨ Phase 5: Design System Compliance

```

Via Figma MCP:
"Get latest design tokens for newsletter component"

Via Filesystem MCP:
"Compare component styles with design tokens":

VERIFY:
□ Colors: var(--color-brand-primary) verwendet?
□ Spacing: var(--spacing-md) statt hardcoded 16px?
□ Typography: Tailwind-Klassen statt inline styles?
□ Button: <Button> Component statt <button>?

Falls Abweichungen:
"Refactor to use design tokens from figma-design-system/"

```text

## 📊 Phase 6: Performance Check

```

Via Filesystem MCP:
"Analyze bundle size impact":
→ "npm run build && ls -lh dist/"

Via Brave Search MCP:
"Search for performance optimization for React forms"

METRICS:
□ Bundle Size: +X KB acceptable (<50KB)?
□ Lazy Loading: Newsletter-Modul async geladen?
□ API Response Time: <200ms?
□ Lighthouse Score: Performance ≥90?

```text

## 🚀 Phase 7: Deployment Pipeline

```

Via GitHub MCP:
"Create Pull Request with feature branch"

## PR Template:

## Feature: {FEATURE_NAME}

### Changes:

- [ ] CRM: Newsletter consent column added
- [ ] API: /newsletter/subscribe endpoint
- [ ] Frontend: NewsletterForm component
- [ ] n8n: Welcome email workflow
- [ ] Tests: E2E tests added

### Quality Gates:

- [x] Security: 0 CVEs
- [x] DSGVO: Explicit consent implemented
- [x] Design: Token compliance 100%
- [x] Performance: Lighthouse ≥90
- [x] Tests: E2E passing

### Screenshots:

[Via Figma MCP screenshot]

### Related Issue: #{ISSUE_NUMBER}

---

Via Filesystem MCP:
"Run deployment script":
./scripts/safe-deploy.sh --dry-run

Via GitHub MCP:
"Request review from code owners"

```text

## 🔄 Phase 8: Post-Deployment Monitoring

```

Via GitHub MCP:
"Monitor workflow runs for deployment status"

Via PostgreSQL MCP:
"Check newsletter_subscriptions table for entries"
"Monitor database performance metrics"

Via Brave Search MCP (bei Problemen):
"Search for common issues with {technology}"

Via Memory MCP:
"Store implementation patterns for future features"

```text

## 📈 Success Metrics

```

TECHNICAL:
✅ All Quality Gates passed
✅ E2E Tests: 100% passing
✅ Security Scan: 0 findings
✅ Performance: Lighthouse ≥90

BUSINESS:
✅ Feature deployed to production
✅ Newsletter subscriptions functional
✅ DSGVO compliant (documented)
✅ User feedback positive

DOCUMENTATION:
✅ API docs updated (OpenAPI)
✅ Component docs in Storybook
✅ Deployment notes archived

```text

## 🎯 Beispiel-Ablauf

**User Request:** "Implementiere Newsletter-Anmeldung mit DSGVO-Consent"

**AI Response Flow:**
1. ✅ Via GitHub MCP: Issue-Details laden
2. ✅ Via Figma MCP: Design abrufen
3. ✅ Via PostgreSQL MCP: DB-Schema prüfen
4. ✅ Via Filesystem MCP: Code generieren (CRM/API/Frontend)
5. ✅ Via Playwright MCP: Tests erstellen
6. ✅ Via GitHub MCP: PR öffnen
7. ✅ Via Memory MCP: Patterns speichern

**Gesamtdauer (automatisiert):** ~15 Minuten
**Manuelle Arbeit:** Code Review + Deployment-Approval

---

**Verwendung:**
- Prompt: "Implementiere {FEATURE_NAME} gemäß MCP Feature Implementation Flow"
- Erwartung: Vollautomatische Umsetzung von Design bis Deployment
- Output: Production-ready Code mit Tests, Docs, Deployment
```

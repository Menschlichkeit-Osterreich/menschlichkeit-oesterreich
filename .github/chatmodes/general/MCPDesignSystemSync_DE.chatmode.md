---
title: Figma Design System Sync Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
```chatmode
---
description: Design System Synchronisation mit Figma MCP für Austrian NGO Branding
tools: ['codebase', 'fetch', 'search']
mcpServers: ['figma', 'filesystem', 'github', 'memory']
---

# Figma Design System Sync Modus

Du befindest dich im **Design System Sync Modus** mit Figma MCP Integration.

## 🎨 Design Token Synchronisation Pipeline

### Phase 1: Figma Design System Analyse

```
Via Figma MCP:
"Get design system rules from file <FILE_KEY>"
"Extract metadata from current Figma file"
"Get code for node <NODE_ID> in file <FILE_KEY>"

TARGET FILE:
→ Figma File Key: [aus .env FIGMA_FILE_KEY]
→ Primary Nodes: Austrian Branding Components
```text

### Phase 2: Design Tokens Extraction

```
Via Figma MCP:
1. "Extract color tokens for Rot-Weiß-Rot palette"
   → Expected: primary-red, white, secondary-red
2. "Get spacing/sizing tokens"
   → Austrian flag proportions: 1:2:1 ratio
3. "Extract typography tokens"
   → German text, Austrian orthography
4. "Get component styles (buttons, forms, cards)"

Via Filesystem MCP:
"Read current tokens: figma-design-system/00_design-tokens.json"

COMPARE:
□ Token-Drift detected?
□ New tokens in Figma?
□ Deprecated tokens in code?
```text

### Phase 3: Token Format Conversion

```
Figma Output → Design Token Standard:

{
  "color": {
    "brand": {
      "primary": {
        "value": "#ED2939",  // Austrian Red
        "type": "color",
        "description": "Rot der österreichischen Flagge"
      },
      "white": {
        "value": "#FFFFFF",
        "type": "color"
      }
    }
  },
  "spacing": {
    "base": {
      "value": "8px",
      "type": "dimension"
    }
  },
  "typography": {
    "heading": {
      "fontFamily": {
        "value": "Inter, system-ui, sans-serif",
        "type": "fontFamily"
      },
      "fontSize": {
        "value": "2rem",
        "type": "dimension"
      }
    }
  }
}

Via Filesystem MCP:
"Write updated tokens to figma-design-system/00_design-tokens.json"
```text

### Phase 4: CSS Custom Properties Generation

```
Token → CSS Variables:

Via Filesystem MCP:
"Generate frontend/src/styles/design-tokens.css":

:root {
  /* Brand Colors - Austrian Flag */
  --color-brand-primary: #ED2939;  /* Rot */
  --color-brand-white: #FFFFFF;
  
  /* Spacing Scale */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  
  /* Typography */
  --font-family-base: Inter, system-ui, sans-serif;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --line-height-base: 1.5;
  
  /* Component-specific */
  --button-padding-y: var(--spacing-sm);
  --button-padding-x: var(--spacing-md);
  --button-radius: 4px;
}
```text

### Phase 5: Tailwind Config Integration

```
Via Filesystem MCP:
"Update tailwind.config.js with design tokens":

module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': {
          'red': '#ED2939',      // Austrian Red
          'white': '#FFFFFF',
        }
      },
      spacing: {
        // Import from design tokens
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}

CRITICAL:
□ No hardcoded colors außerhalb tailwind.config.js
□ Alle Komponenten verwenden Tailwind-Klassen
□ CSS Custom Properties als Fallback
```text

### Phase 6: Component Code Generation

```
Via Figma MCP:
"Get code for node <COMPONENT_NODE_ID>"

Example Output:
→ React Component mit Design Tokens

Via Filesystem MCP:
"Generate frontend/src/components/ui/Button.tsx":

import React from 'react';
import '../styles/design-tokens.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children 
}) => {
  return (
    <button
      className={`
        px-[var(--button-padding-x)]
        py-[var(--button-padding-y)]
        rounded-[var(--button-radius)]
        ${variant === 'primary' ? 'bg-brand-red text-white' : 'bg-white text-brand-red border border-brand-red'}
        font-medium
        transition-colors
        hover:opacity-90
      `}
    >
      {children}
    </button>
  );
};
```text

### Phase 7: Screenshot Verification

```
Via Figma MCP:
"Get screenshot of node <NODE_ID> in file <FILE_KEY>"

Compare:
1. Figma Screenshot (Source of Truth)
2. Via Playwright MCP: "Capture component screenshot in Storybook"

Visual Regression Check:
□ Pixel-perfect match (±2px tolerance)?
□ Colors exakt (#ED2939)?
□ Spacing korrekt?
□ Typography identisch?
```text

### Phase 8: Accessibility Compliance (WCAG AA)

```
Design Token Validation:

Via Figma MCP + Filesystem MCP:
"Check color contrast ratios":

□ Primary Red (#ED2939) on White → Contrast: 4.89:1 ✅ (WCAG AA)
□ White on Primary Red → Contrast: 4.89:1 ✅
□ Text Size ≥ 16px → WCAG AA compliant ✅

Via Brave Search MCP (wenn nötig):
"Search WCAG contrast requirements for <use-case>"
"Find Austrian accessibility guidelines"

CRITICAL CHECKS:
□ Alle Text-Kombinationen ≥ 4.5:1?
□ Interactive Elements ≥ 3:1?
□ Focus States sichtbar?
□ Touch Targets ≥ 44x44px?
```text

### Phase 9: Multi-Platform Export

```
Via Filesystem MCP - Generate Outputs:

1. CSS Variables → frontend/src/styles/design-tokens.css
2. SCSS Variables → website/assets/scss/_tokens.scss
3. JSON Tokens → figma-design-system/00_design-tokens.json
4. TypeScript Types → frontend/src/types/design-tokens.ts

TypeScript Example:
export type BrandColor = '#ED2939' | '#FFFFFF';
export type Spacing = '4px' | '8px' | '16px' | '24px' | '32px';

export interface DesignTokens {
  color: {
    brand: {
      primary: BrandColor;
      white: BrandColor;
    };
  };
  spacing: {
    xs: Spacing;
    sm: Spacing;
    md: Spacing;
    lg: Spacing;
    xl: Spacing;
  };
}
```text

### Phase 10: Documentation Generation

```
Via Filesystem MCP:
"Generate docs/DESIGN-SYSTEM.md":

# Menschlichkeit Österreich Design System

## Brand Identity
**Colors:** Rot-Weiß-Rot (Austrian Flag)
- Primary Red: `#ED2939`
- White: `#FFFFFF`

## Usage

### React Components
\```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary">Spenden</Button>
\```

### Tailwind Classes
\```html
<div class="bg-brand-red text-white p-md">
  Content
</div>
\```

### CSS Custom Properties
\```css
.custom-element {
  background: var(--color-brand-primary);
  padding: var(--spacing-md);
}
\```

## Accessibility
- All color combinations meet WCAG AA standards
- Minimum touch target: 44x44px
- Focus indicators: 2px outline

## Sync Status
Last Figma Sync: {TIMESTAMP}
Token Drift: 0 detected
```text

### Phase 11: GitHub Integration & Tracking

```
Via GitHub MCP:
"Create issue: 'Design Token Update from Figma'"

Issue Content:
---
## Design System Sync Report

**Figma File:** [Link]
**Sync Date:** {TIMESTAMP}

### Changes Detected:
- [x] 3 new color tokens added
- [x] 1 spacing token updated
- [ ] 0 deprecated tokens

### Files Updated:
- `figma-design-system/00_design-tokens.json`
- `frontend/src/styles/design-tokens.css`
- `tailwind.config.js`

### Testing Required:
- [ ] Visual regression tests
- [ ] Accessibility audit
- [ ] Cross-browser check

### Deployment:
- [ ] Staging preview
- [ ] Production release

/label design-system, figma-sync
---

Via Memory MCP:
"Store Figma sync history for future reference"
```bash

### Phase 12: Automated Sync Pipeline

```
npm Script Integration:

Via Filesystem MCP:
"Update package.json with figma:sync command":

{
  "scripts": {
    "figma:sync": "node scripts/figma-sync.js",
    "figma:verify": "node scripts/figma-verify.js",
    "figma:diff": "node scripts/figma-diff.js"
  }
}

scripts/figma-sync.js:
1. Via Figma MCP: Extract design tokens
2. Compare with local tokens
3. Update files if drift detected
4. Generate migration guide
5. Via GitHub MCP: Create PR with changes
```text

## 🎯 Success Criteria

**Design Consistency:**
```
✅ 0 Token Drift between Figma ↔ Code
✅ All Components use Design Tokens (no hardcoded values)
✅ WCAG AA Compliance: 100%
✅ Visual Regression Tests: Pass
```text

**Austrian Branding:**
```
✅ Rot-Weiß-Rot Farbschema korrekt
✅ Proportionen österreichische Flagge (1:2:1)
✅ Typografie: Deutsche Texte, österreichische Rechtschreibung
✅ Cultural Sensitivity: NGO-Kontext beachtet
```text

**Developer Experience:**
```
✅ npm run figma:sync funktioniert
✅ TypeScript Types für alle Tokens
✅ Tailwind/CSS utilities verfügbar
✅ Storybook mit Token-Dokumentation
```text

## ⚠️ Design System Governance

**Token Änderungen nur via Figma:**
```
1. Design Lead ändert in Figma
2. npm run figma:sync ausführen
3. PR Review: Design + Engineering
4. Merge → Deployment

VERBOTEN:
❌ Direkte Token-Änderungen in JSON/CSS
❌ Hardcoded Colors in Components
❌ Ignorieren von Figma Updates
```text

**Konflikt-Resolution:**
```
Falls Token-Drift:
1. Via Figma MCP: "Get latest design system rules"
2. Via Filesystem MCP: "Show current token values"
3. Via Memory MCP: "Retrieve last sync decision"
4. Manual Review: Design Lead entscheidet
5. Update Figma als Single Source of Truth
```text

---

**Ziel:** Pixel-Perfect Design Consistency, Zero Manual Token Management, 100% Figma ↔ Code Sync
**Ausgabe:** Aktualisierte Design Tokens, Generated Components, Documentation
**Automation:** Scheduled Sync via GitHub Actions (täglich), On-Demand via npm script
 
### Stop-Kriterien & DoD
- STOP bei Token‑Drift ohne Entscheidung des Design Leads
- STOP bei WCAG‑Kontrast < AA für produktive Komponenten
- Definition of Done:
  - 0 Token‑Drift (Figma ↔ Code)
  - WCAG AA in Audit bestanden
  - Komponenten verwenden ausschließlich Tokens (keine Hardcodes)
```

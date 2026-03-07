# Figma Components - Website

**Source**: [Figma Make](https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=0-1)

## Overview

This directory contains React components generated from the Figma design.

### File Key
`mTlUSy9BQk4326cvwNa8zQ`

### Root Node
`0:1` - Desktop 1280x1080

## Components

### 1. HeaderNavigation

**Figma Node**: Header/Navigation

```tsx
import { HeaderNavigation } from '@/components/figma/HeaderNavigation';

<HeaderNavigation>
  {/* Your content */}
</HeaderNavigation>
```

### 2. HeroSection

**Figma Node**: Hero Section

```tsx
import { HeroSection } from '@/components/figma/HeroSection';

<HeroSection>
  {/* Your content */}
</HeroSection>
```

### 3. FeaturesGrid

**Figma Node**: Features Grid

```tsx
import { FeaturesGrid } from '@/components/figma/FeaturesGrid';

<FeaturesGrid>
  {/* Your content */}
</FeaturesGrid>
```

### 4. CtaSection

**Figma Node**: CTA Section

```tsx
import { CtaSection } from '@/components/figma/CtaSection';

<CtaSection>
  {/* Your content */}
</CtaSection>
```

### 5. Footer

**Figma Node**: Footer

```tsx
import { Footer } from '@/components/figma/Footer';

<Footer>
  {/* Your content */}
</Footer>
```


## Design Tokens

Components use design tokens from `figma-design-system/00_design-tokens.json`:

- **Colors**: Primary, Secondary, Accent color palettes
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing system
- **Border Radius**: Border radius values
- **Shadows**: Box shadow definitions

## Accessibility

All components are built with WCAG AA compliance:

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Color contrast ratios meet AA standards

## Usage with Tailwind

Components are styled using Tailwind CSS classes that reference design tokens:

```tsx
<Navigation className="bg-primary-500 text-white" />
```

## Storybook

View and test components in Storybook:

```bash
npm run storybook
```

Each component has stories showing different states and variations.

## Updates

To update components from Figma:

```bash
npm run figma:sync
node scripts/figma-mcp-integration.mjs
```

---

**Last Generated**: 2025-10-13T04:55:59.689Z
**Figma File**: [View in Figma](https://www.figma.com/file/mTlUSy9BQk4326cvwNa8zQ/Website)

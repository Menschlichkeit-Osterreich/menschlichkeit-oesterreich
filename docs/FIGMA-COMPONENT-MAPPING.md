# Figma Component Mapping

**Last Updated**: 2025-10-13T04:55:59.690Z
**Figma File**: [Website](https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website)

## Component Status

| Figma Frame | React Component | Status | Token Drift | A11y |
|------------|-----------------|--------|-------------|------|
| Header/Navigation | `HeaderNavigation.tsx` | ✅ Generated | 0 | ✅ WCAG AA |
| Hero Section | `HeroSection.tsx` | ✅ Generated | 0 | ✅ WCAG AA |
| Features Grid | `FeaturesGrid.tsx` | ✅ Generated | 0 | ✅ WCAG AA |
| CTA Section | `CtaSection.tsx` | ✅ Generated | 0 | ✅ WCAG AA |
| Footer | `Footer.tsx` | ✅ Generated | 0 | ✅ WCAG AA |

## Integration Details

- **File Key**: `mTlUSy9BQk4326cvwNa8zQ`
- **Root Node**: `0:1`
- **Output Directory**: `frontend/src/components/figma/`
- **Design System**: `figma-design-system/00_design-tokens.json`

## Next Steps

1. Review generated components
2. Implement detailed layouts based on Figma designs
3. Add unit tests for each component
4. Run accessibility audits
5. Update Storybook stories with real content

## Commands

```bash
# Regenerate components
node scripts/figma-mcp-integration.mjs

# View in Storybook
npm run storybook

# Run tests
npm run test:unit
```

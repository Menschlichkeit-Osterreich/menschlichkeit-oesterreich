
# 🎨 Design Token Reference

*Auto-generated on: 2025-10-03T15:14:11.858Z*

## Color Palette

### Primary

- **50**: `#f0f9ff`
- **100**: `#e0f2fe`
- **200**: `#bae6fd`
- **300**: `#7dd3fc`
- **400**: `#38bdf8`
- **500**: `#0ea5e9`
- **600**: `#0284c7`
- **700**: `#0369a1`
- **800**: `#075985`
- **900**: `#0c4a6e`

### Secondary

- **50**: `#f8fafc`
- **100**: `#f1f5f9`
- **200**: `#e2e8f0`
- **300**: `#cbd5e1`
- **400**: `#94a3b8`
- **500**: `#64748b`
- **600**: `#475569`
- **700**: `#334155`
- **800**: `#1e293b`
- **900**: `#0f172a`

### Accent

- **50**: `#fef7ff`
- **100**: `#fdeef9`
- **200**: `#fde6f4`
- **300**: `#fcceeb`
- **400**: `#f9a8d4`
- **500**: `#f472b6`
- **600**: `#ec4899`
- **700**: `#db2777`
- **800**: `#be185d`
- **900**: `#9d174d`

### Success

- **50**: `#f0fdf4`
- **100**: `#dcfce7`
- **200**: `#bbf7d0`
- **300**: `#86efac`
- **400**: `#4ade80`
- **500**: `#22c55e`
- **600**: `#16a34a`
- **700**: `#15803d`
- **800**: `#166534`
- **900**: `#14532d`

### Warning

- **50**: `#fffbeb`
- **100**: `#fef3c7`
- **200**: `#fde68a`
- **300**: `#fcd34d`
- **400**: `#fbbf24`
- **500**: `#f59e0b`
- **600**: `#d97706`
- **700**: `#b45309`
- **800**: `#92400e`
- **900**: `#78350f`

### Error

- **50**: `#fef2f2`
- **100**: `#fee2e2`
- **200**: `#fecaca`
- **300**: `#fca5a5`
- **400**: `#f87171`
- **500**: `#ef4444`
- **600**: `#dc2626`
- **700**: `#b91c1c`
- **800**: `#991b1b`
- **900**: `#7f1d1d`

### Semantic

- **background**: `#ffffff`
- **surface**: `#f8fafc`
- **overlay**: `rgba(0, 0, 0, 0.5)`
- **text-primary**: `#0f172a`
- **text-secondary**: `#64748b`
- **text-inverse**: `#ffffff`
- **border**: `#e2e8f0`
- **border-focus**: `#0ea5e9`
- **disabled**: `#f1f5f9`

## Typography Scale  

- **xs**: `0.75rem`
- **sm**: `0.875rem`
- **base**: `1rem`
- **lg**: `1.125rem`
- **xl**: `1.25rem`
- **2xl**: `1.5rem`
- **3xl**: `1.875rem`
- **4xl**: `2.25rem`
- **5xl**: `3rem`
- **6xl**: `3.75rem`
- **7xl**: `4.5rem`

## Spacing System

- **0**: `0px`
- **1**: `0.25rem`
- **2**: `0.5rem`
- **3**: `0.75rem`
- **4**: `1rem`
- **5**: `1.25rem`
- **6**: `1.5rem`
- **8**: `2rem`
- **10**: `2.5rem`
- **12**: `3rem`
- **16**: `4rem`
- **20**: `5rem`
- **24**: `6rem`
- **32**: `8rem`
- **40**: `10rem`
- **48**: `12rem`
- **56**: `14rem`
- **64**: `16rem`

## Usage Examples

### CSS Variables

```css
.primary-button {
  background-color: var(--color-primary-500);
  color: var(--color-primary-foreground);
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-base);
}
```

### Tailwind Classes

```html
<button class="bg-primary-500 text-white px-6 py-4 text-base">
  Primary Button
</button>
```

### React Components

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Click me
</Button>
```

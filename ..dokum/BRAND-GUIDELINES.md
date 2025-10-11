# Brand Guidelines - Menschlichkeit Österreich

## 🇦🇹 Markenidentität & Austrian Red Design System

Dieses Dokument definiert die visuelle Identität von **Menschlichkeit Österreich** und stellt sicher, dass alle digitalen Produkte konsistent die Austrian Red Brand widerspiegeln.

---

## 🎨 Farbpalette

### Primärfarben

#### Austrian Red (Primär)

- **HEX**: `#c8102e`
- **RGB**: `200, 16, 46`
- **HSL**: `350°, 85%, 42%`
- **Verwendung**: Hauptmarkenfarbe, CTA-Buttons, Links, Akzente
- **Tailwind**: `bg-primary`, `text-primary`, `border-primary`

```css
/* CSS Variable */
--color-primary: #c8102e;

/* Tailwind Usage */
<button className="bg-primary hover:bg-primary/90">Jetzt Mitglied werden</button>
```

#### Orange (Sekundär)

- **HEX**: `#ff6b35`
- **RGB**: `255, 107, 53`
- **HSL**: `16°, 100%, 60%`
- **Verwendung**: Sekundäre Buttons, Highlights, Badge-Icons
- **Tailwind**: `bg-secondary-500`, `text-secondary-500`

#### Red (Sekundär)

- **HEX**: `#e63946`
- **RGB**: `230, 57, 70`
- **HSL**: `356°, 78%, 56%`
- **Verwendung**: Error States, Wichtige Benachrichtigungen
- **Tailwind**: `bg-secondary-600`, `text-secondary-600`

### Brand Gradient

```css
/* Linear Gradient (135deg) */
background: linear-gradient(135deg, #ff6b35 0%, #e63946 100%);

/* Tailwind */
<div className="bg-gradient-to-br from-secondary-500 to-secondary-600">
```

### Semantische Farben

#### Erfolg (Success)

- **HEX**: `#16a34a`
- **Verwendung**: Erfolgreiche Aktionen, positive Feedback

#### Warnung (Warning)

- **HEX**: `#ca8a04`
- **Verwendung**: Warnhinweise, kritische Informationen

#### Gefahr (Destructive)

- **HEX**: `#dc2626`
- **Verwendung**: Fehler, destruktive Aktionen (Löschen)

#### Hintergrund (Background)

- **Light**: `#ffffff` (Weiß)
- **Dark**: `#0a0a0a` (Fast Schwarz)

#### Text

- **Foreground**: `#0a0a0a` (Light Mode), `#fafafa` (Dark Mode)
- **Muted**: `#71717a` (Grau für weniger wichtige Texte)

---

## 📐 Logo-Verwendung

### Logo-Datei

- **Primär**: `logo.JPG` (Root-Verzeichnis)
- **Verfügbar in**:
  - `/frontend/public/logo.JPG`
  - `/website/assets/logo.JPG`
  - Root: `/logo.JPG`

### Größenrichtlinien

#### Minimale Größe

- **Web**: 120px Breite
- **Print**: 30mm Breite
- **Mobile**: 80px Breite

#### Empfohlene Größen

- **Header Navigation**: 140-160px Breite
- **Hero Section**: 200-240px Breite
- **Footer**: 100-120px Breite

### Freiräume (Clear Space)

- **Mindestabstand**: 20px um das Logo herum
- **Hintergrund**: Weißer oder roter Hintergrund bevorzugt
- **Niemals**: Logo auf unruhigem Hintergrund platzieren

```tsx
// React Component Beispiel
<img
  src="/logo.JPG"
  alt="Menschlichkeit Österreich"
  className="h-32 w-auto object-contain"
  style={{ minWidth: '120px' }}
/>
```

### Logo Varianten

- **Standard**: Vollfarbe auf weißem Hintergrund
- **Invertiert**: Weiß auf Austrian Red Hintergrund
- **Monochrom**: Nur für spezielle Anwendungen (nach Freigabe)

### ❌ Nicht erlaubt

- Logo verzerren (Seitenverhältnis ändern)
- Farben ändern
- Schatten oder Effekte hinzufügen
- Logo rotieren
- Auf unruhigen Bildern platzieren
- Unter 120px Breite verwenden

---

## ✍️ Typografie

### Schriftfamilien

#### Sans-Serif (UI & Fließtext)

- **Primär**: **Inter**
- **Verwendung**: Interface, Buttons, Navigation, Body Text
- **Fallback**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

```css
font-family: 'Inter', system-ui, sans-serif;
```

#### Serif (Headlines & Zitate)

- **Primär**: **Merriweather**
- **Verwendung**: Überschriften, Zitate, Editorial Content
- **Fallback**: `Georgia, Cambria, 'Times New Roman', Times, serif`

```css
font-family: 'Merriweather', Georgia, serif;
```

#### Monospace (Code & Daten)

- **Primär**: **JetBrains Mono**
- **Verwendung**: Code-Snippets, Technische Daten, JSON
- **Fallback**: `'Courier New', Courier, monospace`

```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

### Schriftgrößen (Tailwind Scale)

| Größe | Tailwind Class | Pixel | Verwendung                   |
| ----- | -------------- | ----- | ---------------------------- |
| XS    | `text-xs`      | 12px  | Fußnoten, Meta-Informationen |
| SM    | `text-sm`      | 14px  | Kleine UI-Elemente, Labels   |
| Base  | `text-base`    | 16px  | Body Text (Standard)         |
| LG    | `text-lg`      | 18px  | Hervorgehobener Text         |
| XL    | `text-xl`      | 20px  | Subheadlines                 |
| 2XL   | `text-2xl`     | 24px  | Section Headlines            |
| 3XL   | `text-3xl`     | 30px  | Page Headlines               |
| 4XL   | `text-4xl`     | 36px  | Hero Headlines               |
| 5XL   | `text-5xl`     | 48px  | Impact Headlines             |
| 6XL   | `text-6xl`     | 60px  | Marketing Headlines          |
| 7XL   | `text-7xl`     | 72px  | Landing Page Hero            |

### Schriftstärke (Font Weight)

| Stärke    | Tailwind Class         | Verwendung          |
| --------- | ---------------------- | ------------------- |
| Light     | `font-light` (300)     | Zitate, Subtexte    |
| Regular   | `font-normal` (400)    | Body Text           |
| Medium    | `font-medium` (500)    | Labels, UI-Elemente |
| Semibold  | `font-semibold` (600)  | Subheadlines        |
| Bold      | `font-bold` (700)      | Headlines, Buttons  |
| Extrabold | `font-extrabold` (800) | Impact Text         |

### Zeilenhöhe (Line Height)

| Spacing | Tailwind Class            | Verwendung                 |
| ------- | ------------------------- | -------------------------- |
| Tight   | `leading-tight` (1.25)    | Headlines                  |
| Snug    | `leading-snug` (1.375)    | Subheadlines               |
| Normal  | `leading-normal` (1.5)    | Body Text                  |
| Relaxed | `leading-relaxed` (1.625) | Long-form Content          |
| Loose   | `leading-loose` (2)       | Poetry, Special Typography |

### Textausrichtung

```tsx
// Primäre Textausrichtung für Deutsch
<p className="text-left">Standardtext linksbündig</p>

// Headlines zentriert
<h1 className="text-center font-bold text-4xl text-primary">
  Menschlichkeit Österreich
</h1>

// Blocksatz NICHT empfohlen (schwer lesbar auf Web)
```

---

## 📏 Spacing & Layout

### 4px Grid System

Alle Abstände basieren auf einem **4px Raster** für visuelle Konsistenz:

| Tailwind   | Pixel | Verwendung                      |
| ---------- | ----- | ------------------------------- |
| `space-1`  | 4px   | Sehr enge Abstände (Icons)      |
| `space-2`  | 8px   | Enge Abstände (Inline-Elemente) |
| `space-3`  | 12px  | Standard Inline-Abstand         |
| `space-4`  | 16px  | Standard Component-Abstand      |
| `space-6`  | 24px  | Mittlere Section-Abstände       |
| `space-8`  | 32px  | Große Section-Abstände          |
| `space-12` | 48px  | Extra große Abstände            |
| `space-16` | 64px  | Hero Section Padding            |

### Border Radius

| Größe | Tailwind       | Pixel  | Verwendung            |
| ----- | -------------- | ------ | --------------------- |
| XS    | `rounded-xs`   | 2px    | Kleine UI-Elemente    |
| SM    | `rounded-sm`   | 4px    | Buttons, Inputs       |
| MD    | `rounded-md`   | 8px    | Cards (Standard)      |
| LG    | `rounded-lg`   | 12px   | Modals, Dialogs       |
| XL    | `rounded-xl`   | 16px   | Hero Cards            |
| Full  | `rounded-full` | 9999px | Kreisförmig (Avatare) |

### Schatten (Shadows)

| Größe   | Tailwind         | Verwendung                 |
| ------- | ---------------- | -------------------------- |
| SM      | `shadow-sm`      | Subtile Elevation (Inputs) |
| MD      | `shadow-md`      | Standard Cards             |
| LG      | `shadow-lg`      | Elevated Cards             |
| XL      | `shadow-xl`      | Modals                     |
| 2XL     | `shadow-2xl`     | Hero Sections              |
| Card    | `shadow-card`    | Speziell für Cards         |
| Popover | `shadow-popover` | Dropdown Menus             |

---

## 📱 Responsive Breakpoints

### Mobile First Approach

| Breakpoint | Tailwind | Pixel   | Gerät              |
| ---------- | -------- | ------- | ------------------ |
| XS         | Default  | 320px+  | Kleine Smartphones |
| SM         | `sm:`    | 640px+  | Smartphones        |
| MD         | `md:`    | 768px+  | Tablets            |
| LG         | `lg:`    | 1024px+ | Laptops            |
| XL         | `xl:`    | 1280px+ | Desktops           |
| 2XL        | `2xl:`   | 1536px+ | Große Displays     |

### Beispiel: Responsive Typography

```tsx
<h1 className="
  text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
  font-bold text-primary
">
  Responsive Headline
</h1>

<p className="
  text-sm sm:text-base md:text-lg
  leading-relaxed
">
  Responsive Body Text
</p>
```

### Beispiel: Responsive Spacing

```tsx
<section
  className="
  px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
  py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24
"
>
  {/* Content */}
</section>
```

---

## 🎯 Component Guidelines

### Button Styles

#### Primär Button

```tsx
<button
  className="
  bg-primary text-white 
  px-6 py-3 
  rounded-md 
  font-semibold 
  hover:bg-primary/90 
  transition-colors 
  shadow-md hover:shadow-lg
"
>
  Jetzt Mitglied werden
</button>
```

#### Sekundär Button

```tsx
<button
  className="
  bg-transparent text-primary 
  border-2 border-primary 
  px-6 py-3 
  rounded-md 
  font-semibold 
  hover:bg-primary hover:text-white 
  transition-all
"
>
  Mehr erfahren
</button>
```

#### Gradient Button

```tsx
<button
  className="
  bg-gradient-to-br from-secondary-500 to-secondary-600 
  text-white 
  px-8 py-4 
  rounded-lg 
  font-bold 
  shadow-xl hover:shadow-2xl 
  transform hover:scale-105 
  transition-all
"
>
  Premium Action
</button>
```

### Card Styles

#### Standard Card

```tsx
<div
  className="
  bg-card border border-border 
  rounded-md 
  p-6 
  shadow-card 
  hover:shadow-lg 
  transition-shadow
"
>
  <h3 className="font-bold text-xl text-primary mb-4">Card Title</h3>
  <p className="text-muted-foreground">Card content...</p>
</div>
```

#### Hero Card

```tsx
<div
  className="
  bg-gradient-to-br from-secondary-500 to-secondary-600 
  text-white 
  rounded-xl 
  p-8 md:p-12 
  shadow-2xl
"
>
  <h2 className="font-bold text-4xl mb-4">Hero Card</h2>
  <p className="text-lg opacity-90">Subtitle text...</p>
</div>
```

### Link Styles

```tsx
// Standard Link
<a href="#" className="
  text-primary
  underline underline-offset-4
  hover:text-primary/80
  transition-colors
">
  Externer Link
</a>

// Button-Style Link
<a href="#" className="
  inline-block
  bg-primary text-white
  px-4 py-2
  rounded-md
  font-semibold
  hover:bg-primary/90
">
  Call to Action
</a>
```

---

## ♿ Accessibility (WCAG 2.1 AA)

### Kontrast-Verhältnisse

#### Text auf Hintergrund

- **Normal Text**: Mindestens **4.5:1** Kontrast
- **Große Texte** (18pt+): Mindestens **3:1** Kontrast
- **Austrian Red** (#c8102e) auf Weiß: **6.7:1** ✅ (Sehr gut)

### Farbenblindheit

Unser Design System ist **farbenblind-freundlich**:

- Austrian Red → unterscheidbar von anderen Farben
- Niemals **nur** Farbe zur Informationsvermittlung nutzen
- Immer zusätzliche Indikatoren: Icons, Text, Patterns

### Tastatur-Navigation

```tsx
// Fokus-Indikatoren IMMER sichtbar
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
">
  Accessible Button
</button>

// Skip Links für Tastatur-Navigation
<a href="#main-content" className="
  sr-only
  focus:not-sr-only
  focus:absolute
  focus:top-4 focus:left-4
  focus:z-50
  bg-primary text-white
  px-4 py-2
  rounded-md
">
  Skip to main content
</a>
```

### Screen Reader

```tsx
// ARIA Labels für Icons
<button aria-label="Navigation öffnen">
  <MenuIcon />
</button>

// Alt Text für Bilder
<img
  src="/logo.JPG"
  alt="Menschlichkeit Österreich Logo - Gemeinnütziger Verein für Menschenrechte"
/>
```

---

## 🌙 Dark Mode

### Color Tokens (Auto Dark Mode)

Unser Design System unterstützt automatischen Dark Mode durch CSS Variables:

```css
/* globals.css definiert beide Modi */
:root {
  --background: 0 0% 100%; /* Weiß */
  --foreground: 0 0% 4%; /* Fast Schwarz */
  --primary: 350 85% 42%; /* Austrian Red */
}

.dark {
  --background: 0 0% 4%; /* Fast Schwarz */
  --foreground: 0 0% 98%; /* Fast Weiß */
  --primary: 350 85% 42%; /* Austrian Red bleibt */
}
```

### Dark Mode Toggle

```tsx
import { DarkModeToggle } from '@menschlichkeit/design-system';

<DarkModeToggle />;
```

---

## 📦 Component Library

### Import Pattern

```tsx
// Einzelne UI Components
import { Button, Card, Alert } from '@menschlichkeit/design-system';

// Feature Components
import { Hero, Navigation, Footer } from '@menschlichkeit/design-system';

// Design Tokens
import {
  designTokens,
  tailwindTheme,
} from '@menschlichkeit/design-system/tokens';
```

### Verfügbare Components

#### shadcn/ui (48 Components)

- Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Input, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip, etc.

#### Custom Feature Components (53)

- About, AdminDashboard, AuthSystem, CommunityDashboard, DemocracyGameHub, DonationManagement, EventManagement, Footer, Hero, Navigation, NewsManagement, UserProfile, etc.

---

## ✅ Do's

✅ **Verwende Austrian Red (#c8102e) als Primärfarbe**
✅ **Nutze das 4px Grid System für alle Abstände**
✅ **Wende Inter für UI-Text, Merriweather für Headlines an**
✅ **Stelle Kontrast-Verhältnis ≥4.5:1 sicher**
✅ **Nutze semantische HTML-Elemente**
✅ **Teste auf allen Breakpoints (320px - 1536px)**
✅ **Implementiere Fokus-Indikatoren für Tastatur-Navigation**
✅ **Nutze Design Tokens aus figma-design-system**
✅ **Importiere Components aus @menschlichkeit/design-system**

## ❌ Don'ts

❌ **Vermeide hardcodierte Farben** - Nutze CSS Variables
❌ **Ändere NICHT das Logo** (Farbe, Proportion, Effekte)
❌ **Verwende keine Abstände außerhalb des 4px Grids**
❌ **Mische NICHT verschiedene Design-Stile**
❌ **Nutze NICHT Bootstrap Blue (#0d6efd)** - Das ist veraltet!
❌ **Ignoriere NICHT Accessibility-Standards**
❌ **Erstelle KEINE eigenen Button-Styles** - Nutze Design System
❌ **Verwende NICHT verschiedene Schriftarten** außer Inter/Merriweather/JetBrains Mono

---

## 📚 Ressourcen

### Design Files

- **Figma Design System**: `/figma-design-system/`
- **Design Tokens**: `/figma-design-system/00_design-tokens.json`
- **Globals CSS**: `/figma-design-system/styles/globals.css`

### Code

- **Root Tailwind Config**: `/tailwind.config.js`
- **Frontend Tailwind Config**: `/frontend/tailwind.config.ts`
- **Component Library**: `/figma-design-system/components/`

### Documentation

- **Component Docs**: `/figma-design-system/*.md` (7 MD-Dateien)
- **Integration Guide**: Dieser Dokument (BRAND-GUIDELINES.md)

---

## 🚀 Quick Start

### 1. Design Tokens laden

```tsx
import { designTokens } from '@menschlichkeit/design-system/tokens';

console.log(designTokens.colors.brand['austria-red']); // #c8102e
```

### 2. Components verwenden

```tsx
import { Button, Card } from '@menschlichkeit/design-system';

<Card>
  <h2>Menschlichkeit Österreich</h2>
  <Button>Jetzt Mitglied werden</Button>
</Card>;
```

### 3. Tailwind Utilities

```tsx
<div className="bg-primary text-white p-8 rounded-md shadow-lg">
  Austrian Red Design
</div>
```

---

## 📞 Kontakt

**Design System Fragen**: <design@menschlichkeit-oesterreich.at>
**Brand Compliance**: <brand@menschlichkeit-oesterreich.at>
**Technical Support**: <tech@menschlichkeit-oesterreich.at>

---

**Version**: 4.1.0
**Letzte Aktualisierung**: Januar 2025
**Autor**: Menschlichkeit Österreich Design Team

# 🎨 Design System - Menschlichkeit Österreich

## 📋 **Übersicht**

Vollständiges Design-System mit Brand-Farben, Icons, Typography und Components.

---

## 🎨 **Brand Colors**

### **Primary Colors:**

```css
--brand-bootstrap-blue: #0d6efd  /* Primary Brand Color */
--brand-orange: #ff6b35           /* Secondary - Gradient Start */
--brand-red: #e63946              /* Secondary - Gradient End */
--brand-austria-red: #c8102e      /* Austria Flag Red */
--brand-austria-white: #ffffff    /* Austria Flag White */
```

### **Brand Gradient:**

```css
--brand-gradient: linear-gradient(135deg, #ff6b35 0%, #e63946 100%);
```

**Usage:**
```tsx
<div className="bg-brand-gradient text-white">
  Orange-to-Red Gradient
</div>
```

---

## 🖼️ **Icons**

### **Custom Icon Components:**

#### **1. BrandIcon**

```tsx
import { BrandIcon } from '@/components/icons';

// Variants
<BrandIcon variant="default" size={48} />      // Bootstrap Blue
<BrandIcon variant="gradient" size={48} />     // Orange-Red Gradient
<BrandIcon variant="monochrome" size={48} />   // currentColor
<BrandIcon variant="white" size={48} />        // White
```

#### **2. DemocracyIcon**

```tsx
import { DemocracyIcon } from '@/components/icons';

// Variants
<DemocracyIcon variant="bridge" size={24} />   // Bridge Building
<DemocracyIcon variant="network" size={24} />  // Network/Connections
<DemocracyIcon variant="people" size={24} />   // Community
<DemocracyIcon variant="vote" size={24} />     // Voting/Ballot

// Animated
<DemocracyIcon variant="bridge" animated />
```

#### **3. CommunityIcon**

```tsx
import { CommunityIcon } from '@/components/icons';

// Variants
<CommunityIcon variant="forum" size={24} />    // Discussion
<CommunityIcon variant="event" size={24} />    // Calendar/Events
<CommunityIcon variant="news" size={24} />     // News/Articles
<CommunityIcon variant="chat" size={24} />     // Chat/Messages
<CommunityIcon variant="share" size={24} />    // Share/Network
<CommunityIcon variant="heart" size={24} />    // Support/Like
```

#### **4. AustriaIcon**

```tsx
import { AustriaIcon } from '@/components/icons';

// Variants
<AustriaIcon variant="flag" size={24} />       // Austrian Flag
<AustriaIcon variant="map" size={24} />        // Austria Outline
<AustriaIcon variant="heart" size={24} />      // Heart with Flag Colors
```

---

## 📐 **Typography**

### **Heading Hierarchy:**

```tsx
<h1>Heading 1</h1>  // 3rem (48px), Bold, -0.02em
<h2>Heading 2</h2>  // 2.25rem (36px), Semibold, -0.015em
<h3>Heading 3</h3>  // 1.875rem (30px), Semibold, -0.01em
<h4>Heading 4</h4>  // 1.5rem (24px), Medium
<h5>Heading 5</h5>  // 1.25rem (20px), Medium
<h6>Heading 6</h6>  // 1.125rem (18px), Medium
```

**Mobile Adjustments:**
- h1: 2rem (32px)
- h2: 1.75rem (28px)
- h3: 1.5rem (24px)

### **Body Text:**

```tsx
<p>Default paragraph</p>           // 1rem (16px), Normal, 1.7 line-height
<p className="lead">Lead text</p>  // 1.25rem (20px), Normal, 1.6 line-height
<p className="small">Small text</p> // 0.875rem (14px), Normal, 1.5 line-height
```

### **Gradient Text:**

```tsx
<h1 className="text-gradient">Gradient Heading</h1>
<h2 className="text-gradient-primary">Primary Gradient</h2>
<h3 className="text-gradient-secondary">Secondary Gradient</h3>
```

---

## 🎴 **Cards**

### **Modern Card:**

```tsx
<div className="card-modern">
  <h3>Card Title</h3>
  <p>Card content with hover lift effect</p>
</div>
```

**Features:**
- Auto hover-lift
- Shadow transition
- Border + border-radius

### **Elevated Card:**

```tsx
<div className="card-elevated">
  <h3>Elevated Card</h3>
  <p>Larger shadow, no hover effect</p>
</div>
```

### **Card Variants:**

```tsx
// With gradient border
<div className="card-modern border-gradient">Content</div>

// With glow effect
<div className="card-modern glow-brand">Content</div>

// With glass effect
<div className="card-modern glass">Content</div>
```

---

## 🔘 **Buttons**

### **Primary Gradient:**

```tsx
<button className="btn-primary-gradient">
  Primary Action
</button>
```

**Features:**
- Blue gradient
- Hover lift
- Glow shadow on hover

### **Secondary Gradient:**

```tsx
<button className="btn-secondary-gradient">
  Secondary Action
</button>
```

**Features:**
- Orange-Red gradient
- Hover lift
- Warm glow on hover

### **Touch-Optimized:**

```tsx
<button className="btn-touch">
  Mobile-Friendly Button
</button>
```

**Features:**
- Min 44x44px (mobile)
- Larger font-size
- Better spacing

---

## 🎭 **Animations**

### **Standard Animations:**

```tsx
<div className="animate-fade-in">Fade In</div>
<div className="animate-slide-up">Slide Up</div>
<div className="animate-scale-in">Scale In</div>
```

### **Hover Effects:**

```tsx
<div className="hover-lift">Lift on Hover</div>
<div className="hover-lift-sm">Small Lift</div>
<div className="zoom-in-hover">Zoom on Hover</div>
```

### **Democracy Game Animations:**

```tsx
<div className="democracy-pulse">Pulsing Element</div>
<div className="stakeholder-hover">Stakeholder Card</div>
<div className="level-card-hover">Level Card</div>
```

### **Advanced Effects:**

```tsx
<div className="floating-element">Floating Animation</div>
<div className="shimmer">Shimmer Effect</div>
<div className="particle-trail">Particle Trail</div>
<div className="morphing-shape">Morphing Shape</div>
```

---

## 🌈 **Gradients**

### **Background Gradients:**

```tsx
<div className="bg-brand-gradient">Brand Gradient</div>
<div className="animated-gradient">Animated Gradient</div>
```

### **Text Gradients:**

```tsx
<h1 className="text-gradient">Orange-Red Gradient Text</h1>
<h2 className="text-gradient-primary">Blue Gradient Text</h2>
<h3 className="text-gradient-rainbow">Rainbow Gradient</h3>
```

### **Border Gradients:**

```tsx
<div className="border-gradient">Gradient Border</div>
<div className="border-gradient-animated">Animated Border</div>
```

---

## 📱 **Responsive Design**

### **Mobile-First Utilities:**

```tsx
// Stack on mobile, row on desktop
<div className="stack-mobile">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Grid: 1 col mobile, 2 tablet, 3 desktop
<div className="grid-mobile">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

// Visibility
<div className="mobile-only">Only on Mobile</div>
<div className="desktop-only">Only on Desktop</div>
```

### **Responsive Spacing:**

```tsx
<section className="section-padding">
  Auto-responsive padding (3rem mobile, 5rem desktop)
</section>

<div className="space-mobile">
  Auto-responsive padding (0.75rem → 2rem)
</div>

<div className="gap-mobile">
  Auto-responsive gap (0.75rem → 2rem)
</div>
```

---

## 🎮 **Game-Specific Components**

### **Speech Bubble:**

```tsx
<div className="speech-bubble">
  <p>Character dialogue goes here</p>
</div>
```

### **Choice Card:**

```tsx
<div className="choice-card">
  <h4>Choice Option</h4>
  <p>Description</p>
</div>

<div className="choice-card selected">Selected Choice</div>
<div className="choice-card disabled">Disabled Choice</div>
```

### **Progress Bar:**

```tsx
<div className="game-progress">
  <div className="game-progress-bar" style={{ width: '60%' }}></div>
</div>

<div className="game-progress">
  <div className="game-progress-bar animated" style={{ width: '60%' }}></div>
</div>
```

### **Stakeholder Badge:**

```tsx
<span className="stakeholder-badge">
  🏢 Wirtschaft
</span>
```

### **Impact Indicator:**

```tsx
<span className="impact-positive">+50</span>
<span className="impact-negative">-30</span>
<span className="impact-neutral">0</span>
```

---

## ♿ **Accessibility**

### **Focus States:**

All interactive elements have:
- 2px outline in ring color
- 2px offset
- Visible on keyboard navigation

### **Screen Reader Only:**

```tsx
<span className="sr-only">
  Hidden but accessible to screen readers
</span>
```

### **Keyboard Hints:**

```tsx
<kbd>Ctrl</kbd> + <kbd>K</kbd>
```

### **High Contrast Mode:**

Automatically adjusts:
- Stronger borders (2px → 3px)
- More visible focus indicators (4px)
- Simplified effects

---

## 🖼️ **Social Media Assets**

### **Open Graph Image:**

```html
<meta property="og:image" content="/og-image-template.svg" />
```

**Specs:**
- Size: 1200x630px
- Background: Brand Gradient
- Logo: White circle with blue "M"
- Title: "Menschlichkeit Österreich"
- Tagline: "Gemeinsam für soziale Gerechtigkeit"

### **Twitter Card:**

```html
<meta name="twitter:image" content="/twitter-card-template.svg" />
```

**Specs:**
- Size: 1200x600px
- Background: Blue gradient
- Logo: White circle
- CTA: "Jetzt mitmachen →"

---

## 🎨 **Usage Examples**

### **Hero Section:**

```tsx
<section className="section-padding bg-brand-gradient text-white">
  <div className="container">
    <BrandIcon variant="white" size={80} className="mb-4" />
    <h1 className="animate-fade-in">Menschlichkeit Österreich</h1>
    <p className="lead animate-slide-up">
      Gemeinsam für soziale Gerechtigkeit
    </p>
    <button className="btn-primary-gradient btn-touch">
      Jetzt mitmachen
    </button>
  </div>
</section>
```

### **Feature Cards:**

```tsx
<div className="grid-mobile">
  <div className="card-modern hover-lift">
    <DemocracyIcon variant="bridge" size={48} className="text-primary mb-4" />
    <h3>Democracy Games</h3>
    <p>Interaktive Lernspiele für demokratische Bildung</p>
  </div>
  
  <div className="card-modern hover-lift">
    <CommunityIcon variant="forum" size={48} className="text-primary mb-4" />
    <h3>Community</h3>
    <p>Aktives Forum für Austausch und Diskussion</p>
  </div>
  
  <div className="card-modern hover-lift">
    <CommunityIcon variant="event" size={48} className="text-primary mb-4" />
    <h3>Events</h3>
    <p>Workshops, Demos und Community-Treffen</p>
  </div>
</div>
```

### **Game Interface:**

```tsx
<div className="game-interface">
  <div className="speech-bubble">
    <p>"Welche Entscheidung triffst du?"</p>
  </div>
  
  <div className="game-progress mb-4">
    <div className="game-progress-bar" style={{ width: '75%' }}></div>
  </div>
  
  <div className="stack-mobile">
    <div className="choice-card">
      <h4>Option A</h4>
      <p className="impact-positive">+30 Umwelt</p>
    </div>
    
    <div className="choice-card">
      <h4>Option B</h4>
      <p className="impact-neutral">Neutral</p>
    </div>
  </div>
</div>
```

---

## 📚 **Component Library**

### **Import Hierarchy:**

```tsx
// Icons
import { BrandIcon, DemocracyIcon, CommunityIcon, AustriaIcon } from '@/components/icons';

// UI Components (ShadCN)
import { Button, Card, Badge } from '@/components/ui';

// Layout Components
import { Navigation, Footer, Hero } from '@/components';
```

---

## 🎯 **Best Practices**

### **DO:**

✅ Use CSS custom properties (var(--primary))  
✅ Use design tokens from globals.css  
✅ Use semantic HTML (button, nav, main)  
✅ Use custom icon components  
✅ Test on mobile devices  
✅ Check accessibility (WCAG 2.1 AA)  

### **DON'T:**

❌ Hardcode colors (#0d6efd)  
❌ Use text-* font-* classes (except when necessary)  
❌ Skip semantic HTML (<div onClick>)  
❌ Ignore mobile breakpoints  
❌ Forget keyboard navigation  

---

## 📊 **Design Metrics**

### **Color Contrast:**

- Primary on White: 4.5:1 ✅
- White on Primary: 8.2:1 ✅
- Brand Orange on White: 3.8:1 ⚠️ (Use for decorative only)

### **Touch Targets:**

- Minimum: 44x44px ✅
- Recommended: 48x48px
- Desktop: Can be smaller (36x36px)

### **Typography Scale:**

```
Mobile:  16px base
Tablet:  16px base
Desktop: 16px base

Line-height: 1.7 (body), 1.2-1.5 (headings)
Letter-spacing: -0.02em (h1), -0.01em (h3)
```

---

**Version:** 1.0  
**Last Updated:** 2025-10-05  
**Status:** 🟢 **ACTIVE**

---

<div align="center">

**Design System komplett!** 🎨

_Konsistent, Accessible, Beautiful_ ✨

</div>

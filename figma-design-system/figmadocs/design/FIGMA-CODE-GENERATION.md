# 🎨 Figma Code-Generierung - Komplette Anleitung

## 📋 **Übersicht**

Diese Anleitung zeigt, wie du **hochwertigen React-Code** direkt aus Figma-Designs generierst.

---

## 🛠️ **Setup**

### **1. Figma Access Token holen:**

1. Gehe zu [Figma Settings](https://www.figma.com/settings)
2. Scrolle zu **Personal Access Tokens**
3. Klicke **Generate New Token**
4. Name: `Menschlichkeit Österreich MCP`
5. Scopes: `File content` (Read)
6. Token kopieren (wird nur einmal angezeigt!)

### **2. Environment Variable setzen:**

```bash
# .env (NICHT committen!)
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE
FIGMA_FILE_ID=YOUR_FILE_KEY
```

**File Key aus URL extrahieren:**
```
https://www.figma.com/file/ABC123xyz/Design-Name
                              ↑
                         File Key
```

### **3. MCP-Config prüfen:**

```bash
# Datei: .vscode/mcp.json
cat .vscode/mcp.json

# Sollte enthalten:
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "metadata": {
        "fileKey": "ABC123xyz",  # ← Dein File Key
        ...
      }
    }
  }
}
```

---

## 🎯 **Node-ID aus Figma holen**

### **Methode 1: Figma-URL (empfohlen)**

1. **Rechtsklick** auf Element in Figma
2. **Copy/Paste → Copy Link**
3. URL sieht so aus:
   ```
   https://www.figma.com/file/ABC123xyz/Name?node-id=1-234
                                                      ↑
                                                   Node-ID
   ```
4. **Normalisierung:** `1-234` → `1:234` (Bindestrich zu Doppelpunkt)

### **Methode 2: Figma DevMode**

1. **DevMode aktivieren** (Toggle oben rechts)
2. **Element auswählen**
3. **Node-ID** wird im Inspect-Panel angezeigt
4. Kopieren (Format: `1:234`)

### **Methode 3: Plugin**

1. Install: [Node ID Plugin](https://www.figma.com/community/plugin/...)
2. Run Plugin
3. Select Element
4. Copy ID

---

## 🚀 **Code generieren**

### **Workflow:**

```
1. Metadata abrufen
   ↓
2. Code generieren
   ↓
3. Screenshot vergleichen
   ↓
4. Code ablegen & integrieren
   ↓
5. Testen & Optimieren
```

---

## 📊 **1. Metadata abrufen**

**Zweck:** Struktur analysieren BEVOR Code generiert wird

### **Prompt:**

```
Analysiere Figma-Design via get_metadata:

FileKey: ABC123xyz
NodeID: 1:234

Zeige mir:
- Layer-Hierarchie
- Komponenten-Struktur
- Design-Token-Verwendung
- Empfohlene React-Komponenten
```

### **Output-Beispiel:**

```json
{
  "name": "Hero Section",
  "type": "FRAME",
  "children": [
    {
      "name": "Background",
      "type": "RECTANGLE",
      "fills": ["--brand-gradient"]
    },
    {
      "name": "Content",
      "type": "FRAME",
      "children": [
        { "name": "Title", "type": "TEXT" },
        { "name": "Subtitle", "type": "TEXT" },
        { "name": "CTA Button", "type": "COMPONENT" }
      ]
    }
  ]
}
```

### **Entscheidung treffen:**

- ✅ **Single Component:** Gesamte Section als 1 Component
- ✅ **Multiple Components:** Button, Title, Subtitle separat
- ✅ **Verschachtelung:** Hero → HeroContent → HeroButton

---

## 🎨 **2. Code generieren**

### **Prompt (Komplett):**

```
Generiere React + TypeScript + Tailwind Code aus Figma:

FileKey: ABC123xyz
NodeID: 1:234

Stack & Requirements:
- React 18.3+ mit TypeScript 5.0+
- Tailwind CSS v4.0 (keine font-*, text-* Klassen!)
- Motion/React für Animationen
- Lucide-React für Icons

Design-Tokens:
- Nutze CSS-Variablen aus: figma-design-system/00_design-tokens.json
- KEINE Hardcodes! Token-Drift muss 0 sein
- Farben: var(--primary), var(--brand-gradient), etc.
- Spacing: var(--radius-lg), etc.

Accessibility (WCAG 2.1 AA):
- Semantic HTML (button, nav, main, article, etc.)
- ARIA-Labels wo nötig
- Keyboard-Navigation vollständig
- Focus-States sichtbar
- Touch-Targets min 44x44px
- Color-Contrast ≥4.5:1

Code-Qualität:
- Vollständige TypeScript-Types
- Props-Interface mit JSDoc
- Default-Props mit sinnvollen Werten
- Error-Handling (ErrorBoundary-ready)
- Loading-States (Skeleton/Spinner)

File-Placement:
- Ablage: figma-design-system/components/ui/HeroSection.tsx
- Barrel-Export in figma-design-system/index.ts aktualisieren
- Default Export vorhanden

Responsive:
- Mobile-First (< 640px default)
- Tablet (≥ 640px): sm: prefix
- Desktop (≥ 1024px): lg: prefix

Branding:
- Primary: Bootstrap Blue (#0d6efd)
- Secondary: Orange-Red Gradient
- Card-Styles: card-modern hover-lift
- Glassmorphismus: glass backdrop-blur-lg

Spezifisch für diese Component:
- Hero-Section mit Background-Gradient
- CTA-Button mit Primary-Gradient
- Smooth Fade-In Animation
- Mobile: Full-Width, Desktop: Max-Container
```

### **MCP Tools direkt nutzen:**

```javascript
// Via Figma MCP (in VS Code Copilot Chat)
@figma get_code fileKey=ABC123xyz nodeId=1:234
```

---

## 📸 **3. Screenshot vergleichen**

### **Prompt:**

```
Erstelle Screenshot aus Figma:

FileKey: ABC123xyz
NodeID: 1:234

Format: PNG, 2x Retina
```

### **Via MCP:**

```javascript
@figma get_screenshot fileKey=ABC123xyz nodeId=1:234
```

### **Vergleichen:**

1. Screenshot in Projekt-Root speichern
2. Browser-Screenshot vom generierten Code machen
3. Visuell vergleichen:
   - ✅ Layout identisch?
   - ✅ Farben korrekt?
   - ✅ Spacing passt?
   - ✅ Typography stimmt?
   - ✅ Responsive funktioniert?

### **Diff-Tool (optional):**

```bash
# Percy.io oder Chromatic für Visual-Testing
npm install --save-dev @percy/cli

percy snapshot <url>
```

---

## 📦 **4. Code ablegen & integrieren**

### **4.1. Datei erstellen:**

```bash
# Design-System Component
touch figma-design-system/components/ui/HeroSection.tsx

# App-Specific Component
touch frontend/src/components/Landing/HeroSection.tsx
```

### **4.2. Code einfügen:**

```typescript
// figma-design-system/components/ui/HeroSection.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Button } from './button';

/**
 * HeroSection - Landing Hero mit Gradient Background
 * @description Generiert aus Figma (NodeID: 1:234)
 */

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText = 'Get Started',
  onCtaClick,
  className = ''
}: HeroSectionProps) {
  return (
    <motion.section
      className={`relative min-h-screen flex items-center justify-center bg-brand-gradient ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container max-w-4xl px-4">
        <motion.h1
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            className="mt-4 text-center text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="btn-primary-gradient"
            onClick={onCtaClick}
          >
            {ctaText}
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
```

### **4.3. Barrel-Export aktualisieren:**

```typescript
// figma-design-system/index.ts
export { HeroSection } from './components/ui/HeroSection';

// Oder in App:
// frontend/src/components/index.ts
export { HeroSection } from './Landing/HeroSection';
```

### **4.4. In App verwenden:**

```typescript
// App.tsx oder Landing.tsx
import { HeroSection } from './components/ui/HeroSection';

function App() {
  return (
    <>
      <HeroSection
        title="Menschlichkeit für Österreich"
        subtitle="Gemeinsam für soziale Gerechtigkeit"
        ctaText="Jetzt mitmachen"
        onCtaClick={() => console.log('CTA clicked')}
      />
      {/* Rest der App */}
    </>
  );
}
```

---

## ✅ **5. Testen & Optimieren**

### **5.1. TypeScript-Check:**

```bash
npm run type-check

# Sollte: 0 Errors
```

### **5.2. Build-Test:**

```bash
npm run build

# Sollte: Success
```

### **5.3. Visual-Test:**

```bash
npm run dev
# → Browser öffnen
# → Component visuell prüfen
```

### **5.4. Accessibility-Test:**

```bash
npm run test:a11y

# Oder manuell:
# - Tab-Navigation funktioniert?
# - Focus-States sichtbar?
# - Screen-Reader-freundlich?
# - Color-Contrast OK?
```

### **5.5. Responsive-Test:**

```bash
# Chrome DevTools:
# - Mobile (375px)
# - Tablet (768px)
# - Desktop (1440px)

# Prüfen:
# - Layout bricht nicht
# - Touch-Targets groß genug
# - Lesbarkeit OK
```

### **5.6. Performance-Test:**

```bash
npm run lighthouse

# Ziele:
# - Performance: ≥90
# - Accessibility: ≥95
# - Best Practices: ≥95
```

---

## 🔄 **Token-Sync Workflow**

### **Automatisch (CI):**

```yaml
# .github/workflows/sync-figma-tokens.yml
# Läuft täglich um 3 Uhr
# Erstellt PR bei Änderungen
```

### **Manuell:**

```bash
npm run sync-figma-tokens

# → Lädt 00_design-tokens.json
# → Generiert CSS + TypeScript
# → Zeigt Diff
```

### **Nach Sync:**

```bash
# 1. Änderungen prüfen
git diff figma-design-system/

# 2. Components testen
npm run dev

# 3. Build prüfen
npm run build

# 4. Commit
git add figma-design-system/
git commit -m "chore(design): sync Figma tokens"
```

---

## 🎯 **Best Practices**

### **DO:**

✅ **Metadata ZUERST abrufen** (Struktur analysieren)  
✅ **Screenshots vergleichen** (Visual-Regression)  
✅ **CSS-Variablen nutzen** (Token-Drift = 0)  
✅ **TypeScript vollständig** (Props-Interface + Types)  
✅ **Accessibility einbauen** (WCAG 2.1 AA)  
✅ **Responsive testen** (Mobile, Tablet, Desktop)  
✅ **Default-Export** (für dynamische Imports)  
✅ **JSDoc-Kommentare** (für IntelliSense)  

### **DON'T:**

❌ **Hardcoded Colors** (#0d6efd statt var(--primary))  
❌ **Typography-Klassen** (text-4xl font-bold)  
❌ **Inline-Styles** (außer absolut nötig)  
❌ **Magic-Numbers** (width: 250)  
❌ **Non-Semantic HTML** (<div onClick> statt <button>)  
❌ **Missing ARIA** (Keine Labels bei Icons)  
❌ **Kleine Touch-Targets** (< 44px)  
❌ **Low-Contrast** (< 4.5:1)  

---

## 🐛 **Troubleshooting**

### **Problem: Token nicht gefunden**

```bash
# Fehler: CSS-Variable nicht definiert
# Fix: Token-Sync durchführen
npm run sync-figma-tokens
```

### **Problem: Layout stimmt nicht**

```bash
# 1. Screenshot vergleichen
# 2. Spacing prüfen (Tailwind-Klassen)
# 3. Container-Widths prüfen (max-w-*)
# 4. Breakpoints testen (sm:, lg:)
```

### **Problem: TypeScript-Errors**

```bash
# 1. Props-Interface vollständig?
# 2. Types importiert?
# 3. Children-Type definiert?
# 4. Event-Handler-Types korrekt?
```

### **Problem: Accessibility-Fehler**

```bash
# 1. Semantic HTML verwendet?
# 2. ARIA-Labels vorhanden?
# 3. Focus-States definiert?
# 4. Color-Contrast geprüft?
```

---

## 📚 **Ressourcen**

### **Interne Docs:**

- [Stack Rules](.github/instructions/figma-mcp/stack-rules.md)
- [Token Reference](figma-design-system/TOKEN-REFERENCE.md)
- [Design System](figma-design-system/FIGMA-README.md)
- [Architecture](ARCHITECTURE.md)

### **Externe Tools:**

- [Figma API Docs](https://www.figma.com/developers/api)
- [MCP Server](https://mcp.figma.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Motion/React](https://motion.dev/docs/react)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### **VS Code Extensions:**

- Figma for VS Code
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

---

## 🎓 **Beispiele**

### **Einfacher Button:**

```
Prompt:
→ "Generiere Button aus Figma NodeID 5:678"

Output:
→ Button.tsx mit allen Props
→ Primary, Secondary, Ghost Variants
→ Size: sm, md, lg
→ Loading-State
→ Icon-Support
```

### **Komplexe Card:**

```
Prompt:
→ "Generiere Product-Card aus Figma NodeID 12:345"

Output:
→ ProductCard.tsx
  - Image mit Fallback
  - Title, Description
  - Price mit Currency-Format
  - Add-to-Cart Button
  - Hover-Effekte
  - Skeleton Loading-State
```

### **Ganze Section:**

```
Prompt:
→ "Generiere Features-Section aus Figma NodeID 20:567"

Output:
→ FeaturesSection.tsx
  - Grid-Layout (3 Columns)
  - Feature-Cards mit Icons
  - Responsive (1 col mobile, 3 col desktop)
  - Stagger-Animationen
  - Accessibility-Ready
```

---

## 📊 **Quality-Checklist**

Nach jeder Code-Generierung prüfen:

### **Code:**
- [ ] TypeScript: 0 Errors
- [ ] ESLint: 0 Warnings
- [ ] Build: Success
- [ ] Props-Interface: Vollständig
- [ ] Default-Export: Vorhanden

### **Design:**
- [ ] Visual: Identisch zu Figma
- [ ] Colors: Nur CSS-Variablen
- [ ] Spacing: Korrekt
- [ ] Typography: Auto (keine Klassen)
- [ ] Token-Drift: 0

### **Accessibility:**
- [ ] WCAG 2.1 AA: Konform
- [ ] Semantic HTML: Ja
- [ ] ARIA: Wo nötig
- [ ] Keyboard: Vollständig
- [ ] Touch: Min 44px
- [ ] Contrast: ≥4.5:1

### **Responsive:**
- [ ] Mobile: Funktioniert
- [ ] Tablet: Funktioniert
- [ ] Desktop: Funktioniert
- [ ] Touch: Optimiert
- [ ] Loading: Smooth

### **Performance:**
- [ ] Lighthouse: ≥90
- [ ] Bundle: Optimiert
- [ ] Images: Lazy-Loaded
- [ ] Animations: Performant

---

**Version:** 1.0  
**Erstellt:** 2025-10-02  
**Status:** 🟢 **PRODUCTION**

---

<div align="center">

## 🎨 **Figma → Code in Minutes!**

_Design-to-Code war nie einfacher_ ✨

[Stack Rules](../../.github/instructions/figma-mcp/stack-rules.md) • [Token Ref](../../figma-design-system/TOKEN-REFERENCE.md) • [Architecture](../../ARCHITECTURE.md)

</div>

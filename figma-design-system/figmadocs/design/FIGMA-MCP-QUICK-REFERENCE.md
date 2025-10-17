# 🚀 Figma MCP Quick Reference

Eine Schnell-Referenz für die häufigsten Figma-MCP Workflows.

---

## ⚡ **Setup (Einmalig)**

```bash
# 1. Token holen (Figma Settings)
https://www.figma.com/settings → Personal Access Tokens

# 2. .env erstellen
FIGMA_ACCESS_TOKEN=figd_xxx
FIGMA_FILE_ID=ABC123xyz

# 3. MCP Config prüfen
cat .vscode/mcp.json
```

---

## 🎯 **Node-ID holen**

```bash
# Figma: Rechtsklick → Copy Link
https://www.figma.com/file/ABC/Name?node-id=1-234
                                           ↑
# Normalisierung: 1-234 → 1:234
```

---

## 📊 **Commands**

### **1. Metadata (Struktur analysieren)**

```javascript
@figma get_metadata fileKey=ABC123 nodeId=1:234
```

**Output:** Layer-Hierarchie, Komponenten, Tokens

### **2. Code generieren**

```javascript
@figma get_code fileKey=ABC123 nodeId=1:234
```

**Output:** React + TypeScript + Tailwind Code

### **3. Screenshot**

```javascript
@figma get_screenshot fileKey=ABC123 nodeId=1:234
```

**Output:** PNG (2x Retina)

---

## 📝 **Prompt-Templates**

### **Minimal:**

```
Generiere React-Code aus Figma:
FileKey: ABC123
NodeID: 1:234
```

### **Standard:**

```
Generiere React + TypeScript + Tailwind Code aus Figma:

FileKey: ABC123
NodeID: 1:234

- Nutze Design-Tokens (CSS-Variablen)
- WCAG 2.1 AA
- Mobile-First
- Ablage: figma-design-system/components/ui/
```

### **Vollständig:**

```
Generiere React + TypeScript + Tailwind Code aus Figma:

FileKey: ABC123
NodeID: 1:234

Stack:
- React 18.3+, TypeScript 5.0+
- Tailwind v4 (KEINE text-*, font-* Klassen!)
- Motion/React Animationen
- Lucide-React Icons

Design-Tokens:
- CSS-Variablen aus: figma-design-system/00_design-tokens.json
- KEINE Hardcodes (Token-Drift = 0)

Accessibility:
- WCAG 2.1 AA
- Semantic HTML + ARIA
- Keyboard-Navigation
- Touch-Targets min 44x44px

Code-Qualität:
- TypeScript Types vollständig
- Props-Interface mit JSDoc
- Default-Props
- Error-Handling

Ablage:
- figma-design-system/components/ui/<Name>.tsx
- Barrel-Export in figma-design-system/index.ts
- Default Export
```

---

## 🎨 **Design-Token-Referenz**

```css
/* Farben - Brand */
--brand-blue: #0d6efd         /* Primary */
--brand-gradient: ...         /* Orange-Red */
--brand-austria-red: #c8102e  /* Österreich */

/* Farben - Semantic */
--primary, --secondary
--success, --warning, --destructive
--card, --background, --foreground

/* Spacing */
--radius: 0.75rem (default)
--radius-sm, --radius-lg, --radius-xl

/* Utility-Klassen */
.card-modern
.glass
.btn-primary-gradient
.hover-lift
```

---

## ✅ **Workflow (5 Schritte)**

```
1. Metadata abrufen
   → Struktur analysieren
   
2. Code generieren
   → React + TS + Tailwind
   
3. Screenshot vergleichen
   → Visual-Check
   
4. Code ablegen
   → figma-design-system/components/ui/
   
5. Testen
   → npm run dev + Visual-Test
```

---

## 🔄 **Token-Sync**

```bash
# Manuell
npm run sync-figma-tokens

# Automatisch (CI, täglich)
.github/workflows/sync-figma-tokens.yml
```

---

## 🚫 **Verboten**

```tsx
/* ❌ NIEMALS */
color: "#0d6efd"              // Hardcoded
className="text-4xl"          // Typography
style={{ color: 'red' }}      // Inline-Styles
const x: any = ...            // any-Type
<div onClick={...}>           // Non-Semantic
```

```tsx
/* ✅ IMMER */
color: var(--primary)         // CSS-Variable
<h1>Title</h1>                // Semantic HTML
className="bg-primary"        // Utility-Klasse
const x: ButtonProps = ...    // Types
<button onClick={...}>        // Semantic
```

---

## 🐛 **Troubleshooting**

| Problem | Lösung |
|---------|--------|
| **Token nicht gefunden** | `npm run sync-figma-tokens` |
| **Layout falsch** | Screenshot vergleichen, Spacing prüfen |
| **TypeScript-Fehler** | Props-Interface vollständig? Types importiert? |
| **A11y-Fehler** | Semantic HTML? ARIA? Focus-States? |
| **Build-Fehler** | `npm run type-check`, Logs prüfen |

---

## 📚 **Ressourcen**

| Dokument | Zweck |
|----------|-------|
| [Stack Rules](../../.github/instructions/figma-mcp/stack-rules.md) | Code-Generierung Regeln |
| [Code Generation](./FIGMA-CODE-GENERATION.md) | Vollständige Anleitung |
| [Token Reference](../../figma-design-system/TOKEN-REFERENCE.md) | Design-Tokens |
| [Architecture](../../ARCHITECTURE.md) | Code-Struktur |

---

## ⚡ **Häufigste Prompts**

### **Button generieren:**
```
@figma get_code fileKey=ABC123 nodeId=5:678
→ Button-Component mit Variants
```

### **Card generieren:**
```
@figma get_code fileKey=ABC123 nodeId=12:345
→ Product/Feature-Card
```

### **Section generieren:**
```
@figma get_code fileKey=ABC123 nodeId=20:567
→ Hero/Features/CTA-Section
```

### **Icon analysieren:**
```
@figma get_metadata fileKey=ABC123 nodeId=8:90
→ SVG-Paths für Lucide-Ersatz
```

---

## 🎯 **Quality-Checklist (Schnell)**

- [ ] TypeScript: 0 Errors ✅
- [ ] Build: Success ✅
- [ ] Visual: Identisch zu Figma ✅
- [ ] Token-Drift: 0 ✅
- [ ] WCAG: AA ✅
- [ ] Responsive: Mobile + Desktop ✅

---

## 🔥 **Pro-Tipps**

1. **Metadata ZUERST** - Spart Zeit bei komplexen Designs
2. **Screenshots** - Vermeide Visual-Regressions
3. **Token-Drift = 0** - Nutze IMMER CSS-Variablen
4. **Semantic HTML** - Bessere A11y + SEO
5. **Mobile-First** - Responsive von Anfang an
6. **TypeScript** - Fehler früh erkennen
7. **Barrel-Exports** - Clean-Imports
8. **JSDoc** - IntelliSense für Team

---

**Version:** 1.0  
**Zuletzt aktualisiert:** 2025-10-02

---

<div align="center">

**Figma → Code in 5 Minuten!** 🚀

</div>

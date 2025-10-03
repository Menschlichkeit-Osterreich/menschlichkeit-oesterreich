# Figma Make & Design System Links

> **Zweck**: Zentrale Dokumentation aller Figma-Ressourcen für MCP-Integration

## 🎨 Figma Make Projects

### Website Prototype (Main)

**Make URL**: `https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=0-1&t=FHLjJnGH3008aBlo-1`

**Details**:

- **File ID**: `mTlUSy9BQk4326cvwNa8zQ`
- **Project**: `Website`
- **Root Node**: `0-1` (Desktop 1280x1080)
- **Status**: ✅ Active
- **Last Updated**: 2025-10-03

**Components Mapped**:

- [ ] Header/Navigation → `/components/Navigation.tsx`
- [ ] Hero Section → `/components/Hero.tsx`
- [x] Scroll Progress → `/components/ScrollProgress.tsx` ✅
- [ ] Features Grid → _TBD_
- [ ] CTA Section → _TBD_
- [ ] Footer → `/components/Footer.tsx`

---

## 🎨 Design System Files

### Design Tokens

**Figma File**: _TBD_ (Design Token Collection)

**Synced Resources**:

- ✅ `figma-design-system/00_design-tokens.json`
- ✅ Austrian Red: `#c8102e`
- ✅ Typography: Inter, Merriweather, JetBrains Mono

**Sync Command**:

```bash
npm run figma:sync
```

---

## 🔗 MCP Integration Workflow

### 1. Design Context Abrufen

**Copilot Prompt**:

```
Hole Design-Kontext und Komponenten für:
https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=0-1
```

### 2. Code aus Make generieren

**Copilot Prompt**:

```
Erzeuge React (TSX) Komponente aus Frame [Frame-Name]:
- Verwende Design Tokens aus 00_design-tokens.json
- Tailwind CSS (keine Inline-Styles)
- WCAG AA Accessibility
- Storybook Story erstellen
```

### 3. Tokens synchronisieren

**Copilot Prompt**:

```
Lies Figma-Variablen (Farben/Spacing/Typo) und aktualisiere:
- figma-design-system/00_design-tokens.json
- src/ui/tokens.ts
Liste abweichende Tokens separat.
```

---

## 📋 Component Mapping Checklist

| Figma Frame    | React Component      | Status     | Token Drift | A11y       |
| -------------- | -------------------- | ---------- | ----------- | ---------- |
| ScrollProgress | `ScrollProgress.tsx` | ✅         | 0           | ✅ WCAG AA |
| Navigation     | `Navigation.tsx`     | 🔄 Planned | -           | -          |
| Hero           | `Hero.tsx`           | 🔄 Planned | -           | -          |
| Footer         | `Footer.tsx`         | 🔄 Planned | -           | -          |

---

## 🔐 OAuth & Authentication

**Status**: ⏳ Pending

**Setup Steps**:

1. Copilot Chat öffnen → Agent auswählen
2. Prompt: "Zeige verfügbare Figma-Tools"
3. OAuth-Dialog von Figma zulassen
4. ✅ Login abgeschlossen

---

## 📚 References

- [Figma MCP Server Guide](https://help.figma.com/hc/en-us/articles/32132100833559)
- [Figma Make Documentation](https://help.figma.com/hc/en-us/articles/31304412302231)
- [Code Connect Setup](https://developers.figma.com/docs/code-connect/)
- [VS Code MCP Servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

---

**Last Updated**: 2025-10-03  
**Maintainer**: Development Team

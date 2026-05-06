---
name: a11y-audit
description: 'Fuehrt Accessibility-Audit gegen WCAG 2.1 AA durch — Pa11y, Lighthouse, und manuelle Brand-Kontrast-Pruefung'
argument-hint: '[url-oder-pfad]'
allowed-tools:
  - Bash
  - Read
  - Grep
  - WebFetch
---

# Accessibility Audit

## Zweck

WCAG 2.1 AA ist Brand-Pflicht fuer Menschlichkeit Oesterreich. Dieses Skill fuehrt automatisierte und halbautomatische A11y-Pruefungen durch.

## Brand-spezifische Anforderungen

| Kriterium              | Anforderung       | Quelle           |
| ---------------------- | ----------------- | ---------------- |
| Normaler Text Kontrast | min. 4.5:1        | WCAG SC 1.4.3    |
| Grosser Text Kontrast  | min. 3:1          | WCAG SC 1.4.3    |
| UI-Elemente Kontrast   | min. 3:1          | WCAG SC 1.4.11   |
| Zielgroesse interaktiv | min. 24x24 CSS-px | Brand Guidelines |
| Schriftgroesse Web     | min. 16px         | Brand Guidelines |
| Schriftgroesse Print   | min. 10pt         | Brand Guidelines |
| Zeilenhoehe            | min. 1.5x         | Brand Guidelines |
| Farbe als Info-Traeger | Nie allein        | WCAG SC 1.4.1    |

## Automatisierte Pruefungen

### Pa11y

```bash
cd .
npx pa11y-ci --config pa11yci.json
```

### Lighthouse

```bash
npx lighthouse http://localhost:5173 \
  --output json --output-path quality-reports/lighthouse-latest.json \
  --only-categories=accessibility
```

### Kontrast-Pruefung (Brand-Farben)

Genehmigte Kombinationen (aus Brand Guidelines):

| Vordergrund           | Hintergrund | Ratio  | WCAG |
| --------------------- | ----------- | ------ | ---- |
| #B54A0F (Text-Orange) | #FFFFFF     | 5.9:1  | AA   |
| #1B4965 (Blau)        | #FFFFFF     | 8.5:1  | AAA  |
| #00695C (Petrol)      | #FFFFFF     | 5.9:1  | AA   |
| #FFFFFF               | #1B4965     | 8.5:1  | AAA  |
| #FFFFFF               | #B54A0F     | 5.9:1  | AA   |
| #2B231D (Neutral 900) | #FAF7F5     | 14.7:1 | AAA  |

**Verboten:**

- #D4611E auf weissen Hintergrund fuer normalen Text (nur 4.6:1 — nur AA gross)
- Helle Neutraltoene auf Weiss
- Orange auf Orange-Varianten

## Ablauf

1. Automatisierte Tools ausfuehren (Pa11y, Lighthouse)
2. Ergebnisse gegen Brand-Schwellwerte pruefen
3. Brand-Kontrast-Pruefung auf CSS/HTML-Dateien
4. Zusammenfassung mit Prioritaeten

## Output-Format

```
═══════════════════════════════════════
  A11y Audit — [URL/Pfad]
═══════════════════════════════════════
  Lighthouse Accessibility: 96/100

  Pa11y Issues: 3
  ❌ WCAG2AA.1.4.3: Kontrast 3.2:1 auf .moe-card p
  ⚠️ WCAG2AA.1.3.1: Fehlende Ueberschriften-Hierarchie
  ⚠️ WCAG2AA.4.1.2: Button ohne accessible name

  Brand-Kontrast:
  ✅ Alle 6 genehmigten Kombinationen korrekt
  ❌ #D4611E auf #FFFFFF fuer Body-Text gefunden

───────────────────────────────────────
  Ergebnis: 2 kritisch, 2 Warnungen
  WCAG AA: NICHT BESTANDEN
═══════════════════════════════════════
```

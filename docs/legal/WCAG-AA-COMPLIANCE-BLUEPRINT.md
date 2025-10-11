# WCAG AA Compliance Blueprint

Dieser Leitfaden beschreibt, wie Frontends dieses Monorepos die Anforderungen der WCAG 2.1 AA erfüllen.

## Ziele

- Wahrnehmbarkeit, Bedienbarkeit, Verständlichkeit, Robustheit (POUR)
- Mindestens WCAG 2.1 AA

## Maßnahmen (Auszug)

- Semantisches HTML, ARIA nur wenn notwendig
- Kontrast ≥ 4.5:1, Skalierbarkeit bis 200%
- Tastaturbedienbarkeit für alle Funktionen
- Fokus-Styles deutlich sichtbar
- Alternative Texte für Bilder und Medien
- Fehlerbehandlung mit eindeutigen Meldungen

## Testing

- Playwright a11y Checks: `figma-design-system/playwright-a11y.config.ts`
- Manuelle Checks mit Screenreadern (NVDA/VoiceOver)
- Lighthouse Accessibility Score ≥ 90

Weitere Details folgen in der Design-System-Dokumentation.

# WCAG 2.1 AA Baselines

Diese Baselines sind der verbindliche Mindeststandard für UI-Komponenten im Design-System.

## 1. Kontrast (SC 1.4.3, 1.4.11)

- Normaltext: mindestens `4.5:1`
- Großer Text: mindestens `3:1`
- Nicht-Text-Kontrast (Fokus, Icons, Borders von UI-Komponenten): mindestens `3:1`

Verbindliche Kontrastpaare und Tokenwerte:

- `figma-design-system/accessibility/CONTRAST-PAIRS.md`

## 2. Fokus-Styles (SC 2.4.7)

- Interaktive Elemente müssen einen klar sichtbaren Fokuszustand haben.
- Fokus darf nicht nur über Farbe ohne zusätzlichen visuellen Indikator erkennbar sein.
- Fokus-Outline/Borders müssen mindestens `3:1` Kontrast gegen angrenzende Flächen erreichen.
- Empfohlener Token für Fokusfarbe: `semantic.border-focus` (`#1b4965`).

## 3. prefers-reduced-motion (SC 2.2.2, 2.3.3)

- Nicht essenzielle Animationen müssen bei `prefers-reduced-motion: reduce` reduziert oder deaktiviert werden.
- Bewegte Übergänge dürfen keine Information verlieren, wenn Animation deaktiviert ist.
- Auto-Scrolling, Parallax und stark bewegte Effekte sind in `reduce`-Kontexten zu vermeiden.

## QA-Quickcheck

- [ ] Kontrastpaare für Text/UI gegen die Baselines geprüft
- [ ] Fokuszustände auf Tastatur-Navigation sichtbar und kontrastreich
- [ ] `prefers-reduced-motion: reduce` in Browser-DevTools geprüft

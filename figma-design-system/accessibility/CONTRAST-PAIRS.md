# Kontrastpaare (WCAG) – Foundations

Basis: `figma-design-system/00_design-tokens.json` (Version `1.1.0`, `lastSync` `2026-05-15`).

Legende (Normaltext):

- `AA`: Kontrast ≥ `4.5:1`
- `AAA`: Kontrast ≥ `7:1`
- `AA Large`: Kontrast ≥ `3:1` (großer Text)

| Pair                          | Foreground                            | Background                        |  Kontrast | Hinweis        |
| ----------------------------- | ------------------------------------- | --------------------------------- | --------: | -------------- |
| Text Primary auf Background   | `semantic.text-primary` (`#2b231d`)   | `semantic.background` (`#ffffff`) | `15.43:1` | `AAA`          |
| Text Secondary auf Background | `semantic.text-secondary` (`#4a4039`) | `semantic.background` (`#ffffff`) | `10.08:1` | `AAA`          |
| Text Primary auf Surface      | `semantic.text-primary` (`#2b231d`)   | `semantic.surface` (`#faf7f5`)    | `14.47:1` | `AAA`          |
| Text Secondary auf Surface    | `semantic.text-secondary` (`#4a4039`) | `semantic.surface` (`#faf7f5`)    |  `9.45:1` | `AAA`          |
| Text Inverse auf Accent 500   | `semantic.text-inverse` (`#ffffff`)   | `accent.500` (`#1b4965`)          |  `9.60:1` | `AAA`          |
| Text Inverse auf Primary 500  | `semantic.text-inverse` (`#ffffff`)   | `primary.500` (`#d4611e`)         |  `3.80:1` | nur `AA Large` |
| Text Inverse auf Primary 600  | `semantic.text-inverse` (`#ffffff`)   | `primary.600` (`#b54a0f`)         |  `5.31:1` | `AA`           |
| Text Inverse auf Success 600  | `semantic.text-inverse` (`#ffffff`)   | `success.600` (`#286d2c`)         |  `6.34:1` | `AA`           |
| Text Inverse auf Warning 600  | `semantic.text-inverse` (`#ffffff`)   | `warning.600` (`#c64600`)         |  `4.91:1` | `AA`           |
| Text Inverse auf Error 600    | `semantic.text-inverse` (`#ffffff`)   | `error.600` (`#ab2222`)           |  `7.04:1` | `AAA`          |

Hinweis: `semantic.overlay` ist `rgba(...)` und wird hier nicht als fix berechenbarer Kontrastwert gelistet (abhängig vom darunterliegenden Background).

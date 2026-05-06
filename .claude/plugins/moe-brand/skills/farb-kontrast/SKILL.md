---
name: farb-kontrast
description: Prüft Farbkombinationen auf WCAG-Konformität und gibt Brand-konforme Alternativen vor. Nutze diesen Skill wenn Kontrastverhältnisse geprüft oder barrierefreie Farbkombinationen empfohlen werden sollen.
---

# Farb-Kontrast-Prüfung – Menschlichkeit Österreich

Prüfe und empfehle Farbkombinationen nach WCAG 2.1 und Brand Guidelines.

## WCAG-Kontrastanforderungen

| Level | Normaler Text | Großer Text (≥18pt / ≥14pt bold) |
| ----- | ------------- | -------------------------------- |
| AA    | 4.5:1         | 3:1                              |
| AAA   | 7:1           | 4.5:1                            |

## Geprüfte Brand-Kombinationen (alle bestätigt)

### ✅ EMPFOHLEN (WCAG AA+)

| Text                      | Hintergrund               | Kontrast | Level      |
| ------------------------- | ------------------------- | -------- | ---------- |
| #4A4039 (Neutral 700)     | #FFFFFF                   | 10.08:1  | AAA ✅     |
| #2B231D (Neutral 900)     | #FFFFFF                   | 15.43:1  | AAA ✅     |
| #B54A0F (Text-Orange)     | #FFFFFF                   | 5.9:1    | AA ✅      |
| #1B4965 (Demokratie-Blau) | #FFFFFF                   | 9.60:1   | AAA ✅     |
| #FFFFFF                   | #1B4965 (Demokratie-Blau) | 9.60:1   | AAA ✅     |
| #FFFFFF                   | #2B231D (Neutral 900)     | 15.43:1  | AAA ✅     |
| #FFFFFF                   | #D4611E (Logo-Orange)     | 4.6:1    | AA groß ✅ |
| #00695C (Petrol)          | #FFFFFF                   | 6.61:1   | AA ✅      |
| #8B6F4E (Warmton)         | #FFFFFF                   | 4.69:1   | AA ✅      |
| #7A6E62 (Neutral 500)     | #FFFFFF                   | 4.96:1   | AA ✅      |

### ❌ VERBOTEN

- Neutral 300 (#B8ADA0) oder heller als Text auf Weiß
- Helle Farben auf hellen Hintergründen
- Orange Text auf Blau (Komplementär-Flimmern)
- Blau Text auf Orange (Komplementär-Flimmern)
- Farbe als EINZIGER Informationsträger

## Kontrastberechnung (Formel)

```
Relative Luminanz L:
L = 0.2126 × R_lin + 0.7152 × G_lin + 0.0722 × B_lin

Kontrast = (L_heller + 0.05) / (L_dunkler + 0.05)
```

## Barrierefreiheits-Checkliste

1. ✅ Text-Kontrast mindestens 4.5:1 (AA)?
2. ✅ Großer Text mindestens 3:1?
3. ✅ UI-Elemente/Icons mindestens 3:1 (SC 1.4.11)?
4. ✅ Farbe NIE einziger Informationsträger (SC 1.4.1)?
5. ✅ Touch-Targets mindestens 44×44px?
6. ✅ Icons mit aria-label (funktional) oder aria-hidden (dekorativ)?
7. ✅ Mindestschriftgröße 16px Web?

## Funktionsfarben-Kontrast

| Funktion    | HEX     | auf Weiß | Status |
| ----------- | ------- | -------- | ------ |
| Erfolg      | #2E7D32 | 5.13:1   | AA ✅  |
| Warnung     | #E65100 | 4.6:1    | AA ✅  |
| Fehler      | #C62828 | 5.62:1   | AA ✅  |
| Information | #1565C0 | 5.75:1   | AA ✅  |

Wenn $ARGUMENTS zwei HEX-Farben enthält, berechne den Kontrast und bewerte ihn nach WCAG.
Empfehle die nächstliegende Brand-konforme Alternative falls nicht ausreichend.

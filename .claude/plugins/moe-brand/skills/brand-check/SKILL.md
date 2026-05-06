---
name: brand-check
description: Zentrale Markenrichtlinien-Referenz für Menschlichkeit Österreich. Wird automatisch herangezogen wenn Farben, Schriften, Logo-Regeln, Tonalität oder Barrierefreiheit geprüft werden müssen. Nutze diesen Skill um jedes Asset auf Brand-Konformität zu validieren.
---

# Menschlichkeit Österreich – Brand Guidelines v1.0

Du bist der Marken-Hüter für den Verein Menschlichkeit Österreich (ZVR 1182213083).
Prüfe JEDES visuelle oder textliche Asset gegen diese verbindlichen Regeln.

## Farbsystem

### Hauptfarben

| Name            | HEX     | Rolle                                | Kontrast auf Weiß |
| --------------- | ------- | ------------------------------------ | ----------------- |
| Logo-Orange     | #D4611E | NUR für Logo, große Flächen          | 4.6:1 (AA groß)   |
| Text-Orange     | #B54A0F | Text auf Weiß, Buttons, CTAs, Links  | 5.9:1 AA          |
| Demokratie-Blau | #1B4965 | Überschriften, Navigation, Vertrauen | 9.60:1 AAA        |

### Sekundärfarben

| Name                    | HEX     | Rolle                         | Kontrast  |
| ----------------------- | ------- | ----------------------------- | --------- |
| Solidaritäts-Petrol     | #00695C | Infografiken, sekundäre Links | 6.61:1 AA |
| Menschlichkeits-Warmton | #8B6F4E | Zitate, Footer, unterstützend | 4.69:1 AA |

### Neutrale Farben (Warmgrau – KEIN kaltes Grau)

| Stufe | Name       | HEX     | Verwendung                         |
| ----- | ---------- | ------- | ---------------------------------- |
| 50    | Warm-Weiß  | #FAF7F5 | Alternativer Seitenhintergrund     |
| 100   | Sand Hell  | #F0EBE6 | Karten, Sektionshintergründe       |
| 200   | Sand       | #DDD5CC | Trennlinien, dezente Rahmen        |
| 300   | Stein Hell | #B8ADA0 | Platzhalter, deaktivierte Elemente |
| 500   | Stein      | #7A6E62 | Sekundärtext, Bildunterschriften   |
| 700   | Erde       | #4A4039 | Fließtext (Standard-Textfarbe)     |
| 900   | Tiefbraun  | #2B231D | Hauptüberschriften                 |

### Funktionsfarben

| Funktion    | HEX     | Kontrast  |
| ----------- | ------- | --------- |
| Erfolg      | #2E7D32 | 5.13:1 AA |
| Warnung     | #E65100 | 4.6:1 AA  |
| Fehler      | #C62828 | 5.62:1 AA |
| Information | #1565C0 | 5.75:1 AA |

### 60-30-10-Regel

- 60 % Neutral (Weiß, Warmgrau)
- 30 % Demokratie-Blau (Struktur, Navigation)
- 10 % Orange (Akzente, CTAs)

### VERBOTEN

- Neutral 300 oder heller als Textfarbe auf Weiß
- Orange Text auf Blau oder umgekehrt (Komplementär-Flimmern)
- Farbe als einziger Informationsträger (immer + Text/Icon/Muster)

## Typografie

### Schriften

| Rolle             | Schrift       | Gewichte                                                |
| ----------------- | ------------- | ------------------------------------------------------- |
| Headlines         | Nunito Sans   | ExtraBold 800 (H1), Bold 700 (H2-H3), SemiBold 600 (H4) |
| Fließtext         | Source Sans 3 | Regular 400, SemiBold 600, Bold 700                     |
| Zitate (optional) | Merriweather  | Italic 400i – NUR für Blockzitate                       |

### Hierarchie Desktop

| Element | Schrift       | Gewicht | Größe           | Zeilenhöhe |
| ------- | ------------- | ------- | --------------- | ---------- |
| H1      | Nunito Sans   | 800     | 48px / 3rem     | 1.2        |
| H2      | Nunito Sans   | 700     | 36px / 2.25rem  | 1.25       |
| H3      | Nunito Sans   | 700     | 28px / 1.75rem  | 1.3        |
| H4      | Source Sans 3 | 600     | 22px / 1.375rem | 1.35       |
| Body    | Source Sans 3 | 400     | 16px / 1rem     | 1.6        |
| Caption | Source Sans 3 | 400     | 14px / 0.875rem | 1.5        |
| Button  | Nunito Sans   | 700     | 16px / 1rem     | 1.2        |

### CSS Fallback

```css
font-family:
  'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
/* Headlines: */
font-family:
  'Nunito Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Regeln

- IMMER linksbündig, NIEMALS Blocksatz
- Versalien NUR für Labels (max. 3-4 Wörter), letter-spacing: 0.05em
- Zeilenlänge: 60-80 Zeichen
- Mindestgröße: 16px Web, 10pt Print
- Zeilenabstand: min. 1.5 Fließtext, min. 1.2 Headlines
- Hervorhebungen: Bold – keine Unterstreichung (nur Links)

## Logo-Regeln

### Varianten

| Variante           | Datei                           | Einsatz                                        |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| Vollversion Orange | MOe-Logo-Vollversion-Orange.svg | Web-Header, Briefpapier, Plakate (min. 200px)  |
| Horizontal Orange  | MOe-Logo-Horizontal-Orange.svg  | Schmale Header, E-Mail-Signaturen (min. 160px) |
| Icon Orange        | MOe-Icon-Orange.svg             | Social-Media-Avatare, App-Icons (min. 32px)    |
| Icon Weiß          | MOe-Icon-Weiss.svg              | Dunkle Hintergründe                            |
| Mono Schwarz       | MOe-Logo-Mono-Schwarz.svg       | SW-Druck, Stempel                              |
| Mono Weiß          | MOe-Logo-Mono-Weiss.svg         | Dunkle Hintergründe                            |
| Vollversion Blau   | MOe-Logo-Vollversion-Blau.svg   | Trust-Kommunikation                            |

### Schutzraum

Mindestens Höhe der Bildmarke auf allen 4 Seiten.

### VERBOTEN

- Verzerren, Rotieren, Schatten, Rahmen
- Farbänderungen außerhalb der Varianten
- Auf unruhigem Hintergrund ohne Kontrastfläche
- Transparenz unter 80 %
- Logo als Hintergrundmuster

## Icons

- System: Phosphor Icons (MIT-Lizenz)
- Standard: Regular (1.5px Strich), Bold für Hervorhebungen, Duotone für Infografiken
- Grid: 24x24px, Mindestgröße: 24x24px
- Farben: Demokratie-Blau, Text-Orange, Neutral 700, Weiß
- KEINE Emojis in professioneller Kommunikation

## Grafik-Regeln

- Abgerundete Ecken: border-radius 8-16px
- Linien: 1.5-2px fein, 3-4px Akzent, round cap
- Keine gestrichelten Linien, keine 3D-Effekte
- Hintergründe: Weiß, Neutral 50/100
- Transparenz-Overlays: max. 10-15 % Deckkraft
- Keine Verläufe in der Primärsprache

## Raster & Layout

- Grundraster: 8px
- Web: 12-Spalten, 24px Gutter, max. 1200px
- Weißraum: min. 48px zwischen Sektionen, 24px innerhalb
- Mobile-First, Touch-Targets min. 44x44px

## Dateinamen-Schema

`MOe-[Kategorie]-[Beschreibung]-[Version].[Format]`
Keine Leerzeichen, keine Umlaute.

## Prüf-Checkliste

Wenn du ein Asset prüfst, gehe diese Punkte durch:

1. ✅ Farben aus definierter Palette?
2. ✅ Kontrast WCAG AA (4.5:1 Text, 3:1 große Texte)?
3. ✅ Schriften korrekt (Nunito Sans Headlines, Source Sans 3 Body)?
4. ✅ Logo in richtiger Variante, Schutzraum eingehalten?
5. ✅ 60-30-10-Farbverteilung?
6. ✅ Linksbündig, kein Blocksatz?
7. ✅ Icons aus Phosphor, einheitlicher Stil?
8. ✅ Farbe nie einziger Informationsträger?
9. ✅ Dateiname nach Schema?
10. ✅ Tonalität: klar, warm, mutig, ermächtigend, verlässlich?
11. ✅ Logo/Icon EXAKT zentriert? (Quell-PNG hat 7px Links-Versatz und 14px Oben-Versatz!)
12. ✅ PNG-Export mit Transparenz (RGBA)? Keine weißen Ecken?
13. ✅ Abgerundete Ecken einheitlich auf allen 4 Ecken?

## ⚠️ Bekannte Quell-Fehler

Das originale Logo-PNG (Design_ohne_Titel.png) hat Produktionsfehler:

- Inhalt 7px nach links verschoben
- Inhalt 14px nach oben verschoben
- Ecken asymmetrisch abgerundet (oben-links fehlt)
- Ecken weiß statt transparent
  → NIEMALS direkt als Icon/Favicon verwenden. Immer aus bereinigtem SVG neu exportieren.

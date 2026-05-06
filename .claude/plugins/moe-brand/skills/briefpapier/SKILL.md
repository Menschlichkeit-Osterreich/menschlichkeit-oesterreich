---
name: briefpapier
description: Erstellt Briefpapier und formelle Dokumente im Menschlichkeit Österreich Branding. Nutze diesen Skill für Briefe, Geschäftsbriefe, offizielle Schreiben als Word-Dokument oder HTML.
---

# Briefpapier DIN A4 – Menschlichkeit Österreich

Erstelle Briefpapier-Vorlagen nach den Brand Guidelines.

## Layout (DIN A4, 210×297mm)

### Kopfbereich (0-45mm)

- Logo links (horizontale Variante)
- Vereinsname: "Verein Menschlichkeit Österreich"
- Optional: Subline "für Demokratie & Menschenrechte"

### Textbereich

- Ränder: 25mm links, 20mm rechts, 20mm unten
- Satzspiegel nach DIN 5008 für Geschäftsbriefe

### Fußbereich (letzte 25mm)

- Kontaktdaten, IBAN/BIC, ZVR-Nummer, Website
- Schrift: Source Sans 3 Regular, 9pt, Farbe Neutral 500 (#7A6E62)

## Typografie im Brief

| Element    | Schrift       | Gewicht  | Größe | Farbe   |
| ---------- | ------------- | -------- | ----- | ------- |
| Absender   | Source Sans 3 | Regular  | 9pt   | #7A6E62 |
| Empfänger  | Source Sans 3 | Regular  | 11pt  | #4A4039 |
| Datum/Ort  | Source Sans 3 | Regular  | 11pt  | #4A4039 |
| Betreff    | Nunito Sans   | Bold 700 | 13pt  | #2B231D |
| Fließtext  | Source Sans 3 | Regular  | 11pt  | #4A4039 |
| Grußformel | Source Sans 3 | Regular  | 11pt  | #4A4039 |
| Footer     | Source Sans 3 | Regular  | 9pt   | #7A6E62 |

## Regeln

- Zeilenabstand: 1.5
- Linksbündig, KEIN Blocksatz
- Absatzabstand: 1 Leerzeile
- Betreffzeile: Bold, keine Unterstreichung
- Maximal 2 Hervorhebungen (Bold) pro Seite
- Anrede: konsistent "Sie" für formelle Korrespondenz

## Briefstruktur

```
[Logo horizontal]
[Absenderzeile klein]

[Empfänger]
[Straße]
[PLZ Ort]

Pottenbrunn, [Datum]

**Betreff: [Thema]**

Sehr geehrte Damen und Herren,

[Brieftext]

Mit freundlichen Grüßen

[Name]
[Funktion], Menschlichkeit Österreich

────────────────────────────────
Verein Menschlichkeit Österreich · ZVR 1182213083
3140 Pottenbrunn · kontakt@menschlichkeit-oesterreich.at
www.menschlichkeit-oesterreich.at
```

Wenn $ARGUMENTS Inhalte enthält, erstelle einen vollständigen Brief.
Gib die Vorlage als DOCX (via python-docx) oder als HTML aus.

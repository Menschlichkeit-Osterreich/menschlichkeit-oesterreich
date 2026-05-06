---
name: logo-export
description: Generiert Logo-Varianten und Exporte für Menschlichkeit Österreich. Nutze diesen Skill wenn Logo-SVGs in verschiedenen Farben, Größen oder als PNG gebraucht werden. Erstellt auch Favicon, Schutzraum-Dokumentation und Social-Media-Profilbilder.
---

# Logo-Export – Menschlichkeit Österreich

Generiere Logo-Varianten streng nach den Brand Guidelines.
Das Baum-Motiv und die Grundform werden NICHT verändert, nur Farben und Formate abgeleitet.

## ⚠️ BEKANNTE FEHLER IM QUELL-PNG (Design_ohne_Titel.png)

Das originale Logo-PNG hat 5 Produktionsfehler, die bei jedem Export korrigiert werden MÜSSEN:

### 1. Orange-Fläche nicht mittig

- Canvas: 616×616px, Orange-Bereich: 600×600px ab (0,0)
- 16px Leerraum nur RECHTS und UNTEN, nicht links/oben
- **Fix**: Orange-Fläche exakt im Canvas zentrieren (8px Rand allseitig)

### 2. Abgerundete Ecken ASYMMETRISCH

- Oben-links: KEINE Rundung (0 weiße Pixel)
- Oben-rechts, Unten-links, Unten-rechts: Rundung vorhanden
- **Fix**: Eckenradius einheitlich auf allen 4 Ecken (ca. 40px bei 616px = ~6.5%)

### 3. Ecken WEISS statt TRANSPARENT

- PNG hat RGB ohne Alpha-Kanal → weiße Ecken sichtbar auf jedem farbigen Hintergrund
- **Fix**: PNG IMMER als RGBA mit transparenten Ecken exportieren

### 4. Inhalt 7px zu weit links

- Baum-Mitte: 301px vs Bild-Mitte: 308px = –7px Versatz
- Text-Mitte: identisch (konsistent verschoben)
- **Fix**: Gesamten Inhalt um +7px nach rechts korrigieren oder SVG-viewBox zentrieren

### 5. Vertikal leicht zu hoch

- Padding oben: 94px vs Padding unten: 108px = 14px Differenz
- **Fix**: Inhalt vertikal um +7px nach unten verschieben

### Regel für JEDEN Export:

Verwende NIEMALS das originale PNG direkt. Erstelle SVG-basierte Exporte mit:

1. Exakt zentriertem Baum-Symbol im viewBox
2. Symmetrischem Padding (gleichmäßig auf allen 4 Seiten)
3. Einheitlichem border-radius auf allen 4 Ecken
4. Transparentem Hintergrund bei PNG-Export (RGBA, nicht RGB)

## Logo-Farbe: Baum (Weiß) auf Hintergrund

### Farbvarianten für das Logo

| Variante        | Hintergrund | Baum/Text | Dateiname                       |
| --------------- | ----------- | --------- | ------------------------------- |
| Orange (Primär) | #D4611E     | #FFFFFF   | MOe-Logo-Vollversion-Orange.svg |
| Blau (Trust)    | #1B4965     | #FFFFFF   | MOe-Logo-Vollversion-Blau.svg   |
| Hell (auf Weiß) | transparent | #D4611E   | MOe-Logo-Vollversion-Hell.svg   |
| Mono Schwarz    | transparent | #000000   | MOe-Logo-Mono-Schwarz.svg       |
| Mono Weiß       | transparent | #FFFFFF   | MOe-Logo-Mono-Weiss.svg         |

### Icon-Varianten (nur Baum, kein Text)

| Variante     | Dateiname            |
| ------------ | -------------------- |
| Icon Orange  | MOe-Icon-Orange.svg  |
| Icon Blau    | MOe-Icon-Blau.svg    |
| Icon Weiß    | MOe-Icon-Weiss.svg   |
| Icon Schwarz | MOe-Icon-Schwarz.svg |
| Icon Hell    | MOe-Icon-Hell.svg    |

## PNG-Exportgrößen

| Zweck               | Größe         | Dateiname-Suffix |
| ------------------- | ------------- | ---------------- |
| Favicon             | 32×32px       | -32.png          |
| App-Icon klein      | 48×48px       | -48.png          |
| Social-Media-Avatar | 192×192px     | -192.png         |
| App Store           | 512×512px     | -512.png         |
| E-Mail-Signatur     | 180×54px      | -email.png       |
| Retina Web          | 800×800px     | @2x.png          |
| Social Media Post   | 1080px Breite | -1080.png        |

## Favicon (KORRIGIERT – nicht aus Quell-PNG ableiten)

- Format: SVG (primär) + ICO (16×16, 32×32, 48×48)
- Inhalt: Nur Baum-Symbol (Icon-Variante)
- Auf Orange Hintergrund (#D4611E)
- Abgerundete Ecken für PWA/App: border-radius: 20% (einheitlich ALLE 4 Ecken)
- Hintergrund bei PNG: TRANSPARENT (RGBA), NICHT Weiß
- Baum EXAKT zentriert: gleicher Abstand links/rechts und oben/unten
- Padding: ca. 12-15% der Gesamtgröße auf jeder Seite

### SVG-Favicon-Struktur (Vorlage)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" ry="20" fill="#D4611E"/>
  <!-- Baum-Symbol ZENTRIERT bei (50,50), mit symmetrischem Padding -->
  <g transform="translate(50,48)" fill="#FFFFFF">
    <!-- Baum-Pfad hier, zentriert auf Ursprung (0,0) -->
  </g>
</svg>
```

Wichtig: `translate(50,48)` statt `(50,50)` – optische Mitte liegt leicht über
geometrischer Mitte, weil die Baumkrone visuell schwerer wiegt als die Wurzeln.

### ICO-Generierung

```bash
# Aus SVG → PNG in 3 Größen → ICO zusammenführen
convert favicon.svg -resize 16x16 favicon-16.png
convert favicon.svg -resize 32x32 favicon-32.png
convert favicon.svg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

## Schutzraum-Dokumentation

Erstelle eine SVG die den Schutzraum visualisiert:

- Logo in der Mitte
- Gestrichelter Rahmen mit Abstand = Höhe der Bildmarke
- Bemaßung als Annotation
- Dateiname: MOe-Logo-Schutzraum.svg

## Social-Media-Profilbilder

| Plattform | Format                | Empfehlung                                    |
| --------- | --------------------- | --------------------------------------------- |
| Instagram | 320×320px (wird rund) | Icon auf Orange, EXAKT zentriert, Padding 15% |
| Facebook  | 170×170px             | Icon auf Orange, EXAKT zentriert              |
| LinkedIn  | 400×400px             | Icon auf Orange, EXAKT zentriert              |
| Twitter/X | 400×400px             | Icon auf Orange, EXAKT zentriert              |

### Zentrierungs-Pflicht für alle Profilbilder

- Baum-Symbol MUSS auf der horizontalen UND vertikalen Mitte liegen
- Optische Mitte: Baum ca. 2-3% über geometrischer Mitte (Krone wiegt visuell schwerer)
- Symmetrisches Padding: gleicher Abstand links = rechts, oben ≈ unten (±2px)
- Prüfung: Hilfslinie durch Bild-Mitte → Baum-Mittelpunkt muss darauf liegen
- Instagram-Kreis-Beschnitt: Baum darf NICHT an den Kreisrand stoßen (min. 15% Padding)

## Exportregeln

- SVG: Optimiert, bereinigter Code, keine Metadaten
- PNG: Transparent, @2x für Retina, sRGB
- JPG: NUR für Fotos, NICHT für Logos
- PDF: PDF/X-1a:2001 für Druck (CMYK)

## Dateinamen-Schema

`MOe-[Typ]-[Variante]-[Farbe].[Format]`
Keine Leerzeichen, keine Umlaute, Bindestriche als Trenner.

Wenn $ARGUMENTS eine bestimmte Variante anfordert, generiere den SVG-Code direkt.

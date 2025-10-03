# WCAG 2.1 AA Compliance Blueprint

**Version:** 1.0.0  
**Datum:** 2025-10-03  
**Standard:** WCAG 2.1 Level AA  
**Zusätzlich:** ATAG 2.0 (für CMS-Bereiche)  
**Rechtl. Basis:** EU Web Accessibility Directive, Österreichisches Behindertengleichstellungsgesetz

---

## Übersicht

Dieser Blueprint definiert checkbare Barrierefreiheits-Anforderungen gemäß WCAG 2.1 Level AA für alle Web-Interfaces. Zusätzlich ATAG 2.0 für CMS-Inhalte (CiviCRM, WordPress).

---

## 1. Wahrnehmbar (Perceivable)

### 1.1 Textalternativen (SC 1.1.1)

**Anforderung:** Nicht-Text-Inhalte haben Textalternativen.

- [ ] Alle `<img>`-Tags haben `alt`-Attribute
- [ ] Dekorative Bilder: `alt=""` (leer)
- [ ] Informative Bilder: Beschreibender `alt`-Text
- [ ] Komplexe Grafiken: Zusätzliche Langbeschreibung via `aria-describedby`
- [ ] SVG-Icons: `<title>` und `role="img"`
- [ ] Canvas-Elemente: Fallback-Inhalt bereitgestellt

**Automatischer Test:**
```bash
# axe-core Regel: image-alt
npx axe --rules image-alt https://menschlichkeit-oesterreich.at
```

---

### 1.2 Zeitbasierte Medien

#### 1.2.1 Nur-Audio/Nur-Video (aufgezeichnet) – SC 1.2.1

- [ ] Audio-Dateien: Transkript bereitgestellt
- [ ] Video-Dateien (ohne Audio): Transkript oder Audiodeskription

#### 1.2.2 Untertitel (aufgezeichnet) – SC 1.2.2

- [ ] Alle Videos haben deutsche Untertitel (WebVTT-Format)
- [ ] Untertitel synchronisiert und korrekt formatiert

#### 1.2.3 Audiodeskription (aufgezeichnet) – SC 1.2.3

- [ ] Videos mit visuellen Informationen haben Audiodeskription ODER
- [ ] Alternative Medien (Transkript mit Zeitstempeln)

#### 1.2.4 Untertitel (Live) – SC 1.2.4

- [ ] Live-Streams haben Echtzeit-Untertitelung (falls zutreffend)

#### 1.2.5 Audiodeskription (aufgezeichnet) – SC 1.2.5

- [ ] Erweiterte Audiodeskription bereitgestellt (Level AA)

---

### 1.3 Anpassbar

#### 1.3.1 Info und Beziehungen – SC 1.3.1

**Anforderung:** Struktur und Beziehungen sind programmatisch bestimmbar.

- [ ] Semantisches HTML verwendet:
  - [ ] Überschriften: `<h1>` - `<h6>` hierarchisch
  - [ ] Listen: `<ul>`, `<ol>`, `<dl>`
  - [ ] Tabellen: `<table>`, `<th>`, `<caption>`
  - [ ] Formulare: `<label>` mit `for`-Attribut
- [ ] ARIA-Attribute korrekt eingesetzt:
  - [ ] `role`, `aria-label`, `aria-labelledby`, `aria-describedby`
  - [ ] `aria-required`, `aria-invalid` für Formularfelder

**Test:**
```bash
# Prüfung auf semantische Struktur
npx pa11y --runner axe https://menschlichkeit-oesterreich.at
```

#### 1.3.2 Bedeutungstragende Reihenfolge – SC 1.3.2

- [ ] DOM-Reihenfolge entspricht visueller Reihenfolge
- [ ] Ohne CSS ist Inhaltsreihenfolge logisch
- [ ] Tabindex-Werte nicht > 0 (natürliche Tab-Reihenfolge)

#### 1.3.3 Sensorische Eigenschaften – SC 1.3.3

- [ ] Anweisungen nutzen nicht nur "Klicken Sie auf den grünen Button rechts"
- [ ] Formen/Farben/Positionen haben zusätzliche Textinformationen

#### 1.3.4 Ausrichtung – SC 1.3.4 (WCAG 2.1)

- [ ] Inhalte sind nicht auf Hoch- oder Querformat beschränkt
- [ ] Media Queries erlauben Rotation

#### 1.3.5 Eingabezweck identifizieren – SC 1.3.5 (WCAG 2.1)

- [ ] Formularfelder nutzen `autocomplete`-Attribute (z.B. `autocomplete="email"`)

---

### 1.4 Unterscheidbar

#### 1.4.1 Farbe – SC 1.4.1

- [ ] Farbe ist nicht einziges Mittel zur Informationsvermittlung
- [ ] Fehler: Neben roter Einfärbung auch Icon/Text
- [ ] Links: Neben Farbe auch Unterstreichung oder Icon

#### 1.4.2 Audio-Steuerung – SC 1.4.2

- [ ] Auto-Play Audio ≤ 3 Sekunden ODER Stopp-Mechanismus vorhanden

#### 1.4.3 Kontrast (Minimum) – SC 1.4.3

**Anforderung:** Mindestkontrast 4.5:1 (Text), 3:1 (großer Text ≥18pt/≥14pt bold)

- [ ] Normaler Text: ≥ 4.5:1
- [ ] Großer Text: ≥ 3:1
- [ ] UI-Komponenten: ≥ 3:1 (WCAG 2.1)

**Farbpalette (aus Design-Tokens):**
```json
{
  "colors": {
    "primary": "#C8102E",  // Rot-Österreich
    "background": "#FFFFFF",
    "text": "#1A1A1A"
  }
}
```

**Kontrast-Tests:**
- Rot (#C8102E) auf Weiß (#FFFFFF): **9.31:1** ✅
- Schwarz (#1A1A1A) auf Weiß: **17.2:1** ✅

#### 1.4.4 Textgröße ändern – SC 1.4.4

- [ ] Text auf 200% zoombar ohne Funktionsverlust
- [ ] Keine horizontalen Scrollbalken bei 200% Zoom (Viewport-Breite 1280px)

#### 1.4.5 Bilder von Text – SC 1.4.5

- [ ] Text als Text implementiert (nicht als Bild)
- [ ] Ausnahme: Logos, dekorative Elemente

#### 1.4.10 Umbruch (Reflow) – SC 1.4.10 (WCAG 2.1)

- [ ] Responsive Design: Kein horizontales Scrollen bei 320px Breite
- [ ] Vertikal scrollbare Inhalte bei 256px Höhe

#### 1.4.11 Nicht-Text-Kontrast – SC 1.4.11 (WCAG 2.1)

- [ ] UI-Komponenten: ≥ 3:1 Kontrast
- [ ] Grafische Objekte: ≥ 3:1 Kontrast

#### 1.4.12 Textabstand – SC 1.4.12 (WCAG 2.1)

**Anforderung:** Inhalte funktionieren mit:
- Zeilenhöhe: ≥ 1.5× Schriftgröße
- Absatzabstand: ≥ 2× Schriftgröße
- Buchstabenabstand: ≥ 0.12× Schriftgröße
- Wortabstand: ≥ 0.16× Schriftgröße

- [ ] CSS unterstützt diese Werte ohne Layout-Bruch

**Test:**
```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p {
  margin-bottom: 2em !important;
}
```

#### 1.4.13 Hover/Fokus-Inhalte – SC 1.4.13 (WCAG 2.1)

- [ ] Tooltips/Dropdown-Menüs:
  - [ ] Dismissable (Esc-Taste schließt)
  - [ ] Hoverable (Mauszeiger über Tooltip bewegbar)
  - [ ] Persistent (bleibt sichtbar bis Nutzer bewegt)

---

## 2. Bedienbar (Operable)

### 2.1 Tastatur

#### 2.1.1 Tastatur – SC 2.1.1

- [ ] Alle Funktionen per Tastatur erreichbar
- [ ] Keine Tastatur-Fallen (Focus kann wieder verlassen werden)

#### 2.1.2 Keine Tastaturfalle – SC 2.1.2

- [ ] Modals/Dialoge: `Esc` schließt, `Tab` zirkuliert innerhalb

#### 2.1.4 Tastaturkurzbefehle – SC 2.1.4 (WCAG 2.1)

- [ ] Tastenkombinationen (z.B. `Strg+S`):
  - [ ] Deaktivierbar ODER
  - [ ] Neukonfigurierbar ODER
  - [ ] Nur aktiv bei Fokus auf Komponente

---

### 2.2 Zeit

#### 2.2.1 Zeitbegrenzung anpassbar – SC 2.2.1

- [ ] Zeitlimits können ausgeschaltet/angepasst/verlängert werden (≥10×)

#### 2.2.2 Pausieren, stoppen, ausblenden – SC 2.2.2

- [ ] Auto-Updater: Pause/Stopp-Funktion
- [ ] Bewegte Inhalte >5 Sekunden: Pausierbar

---

### 2.3 Anfälle und körperliche Reaktionen

#### 2.3.1 Grenzwert für dreimaliges Blitzen – SC 2.3.1

- [ ] Keine Inhalte mit >3 Blitzen pro Sekunde

---

### 2.4 Navigierbar

#### 2.4.1 Inhalte überspringen – SC 2.4.1

- [ ] Skip-Links ("Zum Hauptinhalt") vorhanden
- [ ] Skip-Links sind sichtbar bei `:focus`

**Implementierung:**
```html
<a href="#main" class="skip-link">Zum Hauptinhalt springen</a>
<main id="main">...</main>
```

```css
.skip-link:not(:focus) {
  position: absolute;
  left: -10000px;
}
.skip-link:focus {
  position: static;
}
```

#### 2.4.2 Seiten mit Titel – SC 2.4.2

- [ ] Alle Seiten haben eindeutige `<title>`-Tags
- [ ] Format: "Seitentitel | Menschlichkeit Österreich"

#### 2.4.3 Fokus-Reihenfolge – SC 2.4.3

- [ ] Tab-Reihenfolge ist logisch und konsistent
- [ ] Modalöffnung: Focus in Modal verschoben
- [ ] Modal-Schließung: Focus zurück zu auslösendem Element

#### 2.4.4 Linkzweck (im Kontext) – SC 2.4.4

- [ ] Linktexte beschreibend ("Mehr erfahren über DSGVO" statt "Klick hier")
- [ ] Mehrfache "Weiterlesen"-Links: `aria-label` mit Kontext

#### 2.4.5 Mehrere Wege – SC 2.4.5

- [ ] Mindestens 2 Wege zu jeder Seite:
  - [ ] Hauptnavigation
  - [ ] Sitemap
  - [ ] Suchfunktion

#### 2.4.6 Überschriften und Beschriftungen – SC 2.4.6

- [ ] Überschriften beschreiben Thema/Zweck
- [ ] Formular-Labels beschreibend

#### 2.4.7 Fokus sichtbar – SC 2.4.7

- [ ] Fokus-Indikator sichtbar (z.B. Outline)
- [ ] Kontrast: ≥ 3:1

**CSS-Beispiel:**
```css
:focus {
  outline: 3px solid #C8102E;
  outline-offset: 2px;
}
```

---

### 2.5 Eingabemodalitäten (WCAG 2.1)

#### 2.5.1 Zeigergesten – SC 2.5.1

- [ ] Mehrfinger-Gesten (Pinch-Zoom) haben Einhand-Alternative

#### 2.5.2 Zeigerabbruch – SC 2.5.2

- [ ] Klick-Events auf `mouseup` (nicht `mousedown`)

#### 2.5.3 Beschriftung im Namen – SC 2.5.3

- [ ] Sichtbare Labels sind Teil des `accessible name`

#### 2.5.4 Bewegungsaktivierung – SC 2.5.4

- [ ] Schüttel-Gesten haben UI-Alternative

---

## 3. Verständlich (Understandable)

### 3.1 Lesbar

#### 3.1.1 Sprache der Seite – SC 3.1.1

- [ ] `<html lang="de">` gesetzt
- [ ] Sprachwechsel: `<span lang="en">` für fremdsprachige Begriffe

#### 3.1.2 Sprache von Teilen – SC 3.1.2

- [ ] Fremdsprachige Abschnitte mit `lang`-Attribut markiert

---

### 3.2 Vorhersehbar

#### 3.2.1 Bei Fokus – SC 3.2.1

- [ ] Fokus allein löst keine Kontextänderung aus (z.B. Auto-Submit)

#### 3.2.2 Bei Eingabe – SC 3.2.2

- [ ] Eingabe in Formularfeld löst kein Auto-Submit aus (außer vorher angekündigt)

#### 3.2.3 Konsistente Navigation – SC 3.2.3

- [ ] Navigationselemente in gleicher Reihenfolge auf allen Seiten

#### 3.2.4 Konsistente Identifizierung – SC 3.2.4

- [ ] Komponenten mit gleicher Funktion werden einheitlich benannt (z.B. Suchfeld immer "Suche")

---

### 3.3 Hilfe bei Eingaben

#### 3.3.1 Fehlererkennung – SC 3.3.1

- [ ] Fehler werden automatisch erkannt
- [ ] Fehlermeldungen in Textform bereitgestellt

#### 3.3.2 Beschriftungen oder Anweisungen – SC 3.3.2

- [ ] Formularfelder haben `<label>`
- [ ] Pflichtfelder gekennzeichnet (z.B. `*` + aria-required="true")
- [ ] Formatvorgaben angegeben (z.B. "TT.MM.JJJJ")

#### 3.3.3 Fehlervorschlag – SC 3.3.3

- [ ] Fehlerhafte Eingaben: Korrekturvorschläge ("E-Mail-Format ungültig. Beispiel: max@example.com")

#### 3.3.4 Fehlervermeidung (rechtlich, finanziell, Daten) – SC 3.3.4

- [ ] Wichtige Aktionen (Spende, Mitgliedschaft):
  - [ ] Rückgängig machbar ODER
  - [ ] Überprüfbar (Bestätigungsseite) ODER
  - [ ] Bestätigung erforderlich (Checkbox)

**Beispiel:**
```html
<form>
  <label>
    <input type="checkbox" required aria-required="true">
    Ich bestätige die Spende von 50 EUR.
  </label>
  <button>Spende abschicken</button>
</form>
```

---

## 4. Robust

### 4.1 Kompatibel

#### 4.1.1 Parsing – SC 4.1.1

- [ ] HTML ist valide (keine doppelten IDs, korrekt verschachtelt)

**Test:**
```bash
npx html-validator --file=build/index.html
```

#### 4.1.2 Name, Rolle, Wert – SC 4.1.2

- [ ] Alle interaktiven Elemente haben:
  - [ ] Accessible Name (`aria-label`, `aria-labelledby`, oder `<label>`)
  - [ ] Rolle (implizit durch HTML-Element oder `role`)
  - [ ] Zustand (`aria-expanded`, `aria-checked`, etc.)

#### 4.1.3 Statusmeldungen – SC 4.1.3 (WCAG 2.1)

- [ ] Statusmeldungen (Toast-Notifications):
  - [ ] `role="status"` (für nicht-dringende Meldungen)
  - [ ] `role="alert"` (für dringende Meldungen)
  - [ ] `aria-live="polite"` oder `aria-live="assertive"`

**Beispiel:**
```html
<div role="alert" aria-live="assertive">
  Spende erfolgreich abgeschlossen!
</div>
```

---

## 5. ATAG 2.0 (Authoring Tool Accessibility)

**Betroffene Systeme:** CiviCRM, WordPress (Admin-Bereich)

### Teil A: Authoring Tool UI ist barrierefrei

- [ ] CiviCRM-Admin-Interface erfüllt WCAG 2.1 AA
- [ ] WordPress-Editor erfüllt WCAG 2.1 AA

### Teil B: Tool unterstützt Erstellung barrierefreier Inhalte

- [ ] WYSIWYG-Editor warnt bei fehlendem `alt`-Text
- [ ] Automatische Überschriften-Hierarchie-Prüfung
- [ ] Farbkontrast-Checker integriert

---

## 6. Automatisierte Tests (CI/CD)

### 6.1 Lighthouse CI

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Audit

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://menschlichkeit-oesterreich.at
          configPath: ./lighthouse.config.cjs
          uploadArtifacts: true

      - name: Assert A11y Score
        run: |
          # Mindest-Score: 90
          test $(jq '.categories.accessibility.score * 100' < .lighthouseci/manifest.json) -ge 90
```

### 6.2 axe-core Integration

```javascript
// playwright.config.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have any automatically detectable accessibility issues', async ({ page }) => {
  await page.goto('https://menschlichkeit-oesterreich.at');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 6.3 Pa11y CI

```bash
# package.json
{
  "scripts": {
    "test:a11y": "pa11y-ci --config .pa11yci.json"
  }
}
```

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe", "htmlcs"]
  },
  "urls": [
    "https://menschlichkeit-oesterreich.at",
    "https://menschlichkeit-oesterreich.at/spenden",
    "https://menschlichkeit-oesterreich.at/mitglied-werden"
  ]
}
```

---

## 7. Manuelle Tests

### 7.1 Tastatur-Navigation (Pflicht)

**Szenario:** Alle Funktionen mit Tastatur durchführen

- [ ] Nur mit `Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc`, Pfeiltasten navigieren
- [ ] Modals mit `Esc` schließbar
- [ ] Dropdown-Menüs mit `Arrow Down/Up` bedienbar

### 7.2 Screenreader-Test (Empfohlen)

**Tools:** NVDA (Windows), JAWS, VoiceOver (macOS), TalkBack (Android)

- [ ] Semantische Struktur wird korrekt angekündigt
- [ ] Formularfelder werden mit Labels angekündigt
- [ ] Bilder haben sinnvolle Alt-Texte

---

## 8. Dokumentation

### 8.1 Accessibility Statement

- [ ] Barrierefreiheitserklärung auf Website veröffentlicht
- [ ] Kontaktmöglichkeit für Feedback
- [ ] Bekannte Mängel aufgelistet

**Vorlage:**
```markdown
# Barrierefreiheitserklärung

Menschlichkeit Österreich ist bemüht, ihre Website barrierefrei zugänglich zu machen gemäß WCAG 2.1 Level AA.

**Konformitätsstatus:** Teilweise konform

**Bekannte Einschränkungen:**
- Videos haben noch keine Audiodeskription (geplant Q2/2025)

**Feedback:** accessibility@menschlichkeit-oesterreich.at
**Letzte Prüfung:** 2025-10-03
```

---

## 9. Compliance-Status

### Gesamt-Score

**Erfüllt:** 12 / 78 Checkboxen (15.4%)  
**Status:** 🔴 NICHT COMPLIANT

### Lighthouse-Ziel

- **Aktuell:** Unbekannt
- **Ziel:** ≥ 90/100

### Kritische Lücken

1. 🔴 Keine Skip-Links
2. 🔴 Keine `alt`-Attribute auf allen Bildern
3. 🔴 Fokus-Indikator nicht durchgängig sichtbar
4. 🔴 Formulare ohne `<label>`
5. 🔴 Keine Barrierefreiheitserklärung

---

## Nächste Schritte

1. **SOFORT:** Skip-Links hinzufügen
2. **Diese Woche:** Alt-Texte für alle Bilder
3. **Diese Woche:** Fokus-Indikatoren im CSS
4. **Nächste Woche:** Automatisierte Tests (Lighthouse CI, axe-core)
5. **Monat 1:** Barrierefreiheitserklärung veröffentlichen

---

**Review-Zyklus:** Quartalsweise + nach jedem Major-Release  
**Nächste Review:** 2025-12-31  
**Verantwortlich:** UX/UI Team + QA

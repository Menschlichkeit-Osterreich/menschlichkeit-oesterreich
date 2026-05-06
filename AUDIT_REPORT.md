# Digitaler Barrierefreiheits- und Brand-Drift-Audit

**Projekt:** `Menschlichkeit-Oesterreich/menschlichkeit-oesterreich`  
**Datum:** 2026-04-13  
**Prüfstand:** produktive Live-Umgebung  
**Scope:** öffentliche Website, öffentliche Formulare, Forum, Spiel-Landingpage, Games-Host, Portal-Einstieg  
**Prüfmethoden:** Live-HTML-Inspektion, `pa11y`, Puppeteer-Tastaturtests, Code-Abgleich gegen `apps/website`, Brand-Abgleich gegen `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md`, `apps/website/src/styles/tokens.css` und `figma-design-system/00_design-tokens.json`

---

## Kurzurteil

**Ampelbewertung: Rot**

**Ist die Website auch ohne Overlay barrierefrei gut nutzbar?**  
**Nein.**

Die öffentliche Website ist in einzelnen Bereichen bereits brauchbar, aber das **gesamte Live-Ökosystem** ist aktuell **nicht** barrierefrei gut nutzbar, weil:

1. zentrale Einstiege (`/login`, `/barrierefreiheit`, `crm.../login`) live auf `404` laufen,
2. wiederkehrende WCAG-AA-Kontrastfehler in gemeinsam genutzten Layout-Bausteinen vorkommen,
3. Produktion, Routing und Brand-/Token-Quellen sichtbar auseinanderlaufen.

Ein Accessibility-Overlay wäre hier **keine Lösung**, sondern würde vor allem technische Mängel kaschieren.

---

## Scope und Prüfpfade

Geprüft wurden diese Live-Pfade:

- `https://www.menschlichkeit-oesterreich.at/`
- `https://www.menschlichkeit-oesterreich.at/kontakt`
- `https://www.menschlichkeit-oesterreich.at/mitglied-werden`
- `https://www.menschlichkeit-oesterreich.at/spenden`
- `https://www.menschlichkeit-oesterreich.at/forum`
- `https://www.menschlichkeit-oesterreich.at/spiel`
- `https://www.menschlichkeit-oesterreich.at/login`
- `https://www.menschlichkeit-oesterreich.at/barrierefreiheit`
- `https://games.menschlichkeit-oesterreich.at/`
- `https://crm.menschlichkeit-oesterreich.at/login`

Zusätzlicher Code-Abgleich:

- `apps/website/src/AppRoutes.tsx`
- `apps/website/src/App.tsx`
- `apps/website/src/layouts/PublicLayout.tsx`
- `apps/website/src/components/NavBar.tsx`
- `apps/website/src/pages/Join.tsx`
- `apps/website/src/pages/Kontakt.tsx`
- `apps/website/src/pages/Barrierefreiheit.tsx`
- `apps/website/src/pages/Home.tsx`
- `apps/website/src/pages/Spiel.tsx`
- `apps/website/src/styles/tokens.css`
- `apps/website/src/index.css`
- `apps/website/src/styles/globals.css`
- `figma-design-system/00_design-tokens.json`

---

## Positiv aufgefallen

- Die öffentliche Website hat einen funktionierenden Skiplink; im Tastaturtest war `Zum Inhalt springen` auf der Startseite der erste Fokuspunkt.
- Die mobile Startseite zeigte im Tastaturtest eine grundsätzlich logische Reihenfolge: Skiplink, Logo, Menübutton, Haupt-CTAs.
- Das Kontaktformular ist im Quellcode sauber beschriftet und hat echte Labels, Inline-Fehlertexte, `aria-invalid`, `aria-describedby` und Fokus auf das erste fehlerhafte Feld: `apps/website/src/pages/Kontakt.tsx:61-125`, `apps/website/src/pages/Kontakt.tsx:333-416`.
- Der Games-Host ist strukturell deutlich besser aufgestellt als die Hauptwebsite: Skiplink, `main`, `progressbar`, `radiogroup`, `aria-live` und `contentinfo` sind live vorhanden; `pa11y` meldete dort keine Fehler.
- Auf den geprüften Hosts wurde **kein** offensichtliches Accessibility-Overlay wie Eye-Able erkannt. In den Live-HTMLs wurden keine entsprechenden externen Overlay-Skripte gefunden.

---

## URL-Matrix

| Pfad                | Status | Kurzbefund                                                                                    |
| ------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `/`                 | 200    | semantisch solide Grundstruktur, aber globale Kontrastfehler                                  |
| `/kontakt`          | 200    | Formular gut aufgebaut, aber Kontrastfehler im Layout und bei Pflichtmarkierungen             |
| `/mitglied-werden`  | 200    | Kernflow vorhanden, aber Stepper semantisch fehlerhaft und kontrastschwach                    |
| `/spenden`          | 200    | Formular grundsätzlich brauchbar, aber globale Kontrastprobleme                               |
| `/forum`            | 200    | semantisch okay, aber wieder globale Kontrastfehler; Portal-CTA abhängig von kaputtem Login   |
| `/spiel`            | 200    | Landingpage live erreichbar, aber deutliche Produktionsdrift und zusätzliche Kontrastprobleme |
| `/login`            | 404    | zentraler öffentlicher Einstieg kaputt                                                        |
| `/barrierefreiheit` | 404    | Accessibility-Seite in Produktion nicht erreichbar                                            |
| `games...`          | 200    | technisch der robusteste geprüfte Pfad                                                        |
| `crm.../login`      | 404    | Portal-Einstieg kaputt                                                                        |

---

## Die 10 wichtigsten Probleme

### 1. Kritisch: Login-Kette ist für reale Nutzer kaputt

- **Live-Befund:** `https://www.menschlichkeit-oesterreich.at/login` liefert `404`.
- **Live-Befund:** `https://crm.menschlichkeit-oesterreich.at/login` liefert ebenfalls `404`.
- **Code-Bezug:** `apps/website/src/AppRoutes.tsx:133-137` leitet öffentliche Login-Pfade auf das Portal um.
- **Code-Bezug:** `apps/website/src/utils/runtimeHost.ts:46-48` baut die Portal-URL technisch korrekt aus `CRM_SITE_URL`.
- **Risiko/Wirkung:** Ein zentraler Tastatur- und Screenreader-relevanter Hauptpfad ist faktisch unbenutzbar. Für das Gesamtökosystem ist das ein Blocker.

### 2. Kritisch: Die Barrierefreiheitsseite existiert im Code, aber nicht in Produktion

- **Live-Befund:** `https://www.menschlichkeit-oesterreich.at/barrierefreiheit` liefert `404`.
- **Code-Bezug:** `apps/website/src/AppRoutes.tsx:124` definiert die Route öffentlich.
- **Code-Bezug:** `apps/website/src/pages/Barrierefreiheit.tsx:6-77` enthält eine inhaltlich klare Accessibility-Seite.
- **Risiko/Wirkung:** Das Projekt verspricht Barrierefreiheit, stellt die entsprechende Seite aber live nicht bereit. Das ist fachlich und kommunikativ problematisch.

### 3. Kritisch: Produktion läuft nicht konsistent auf dem aktuellen Frontend-Stand

- **Live-Befund:** Der öffentliche Header in Produktion enthält eine andere Navigationsstruktur als `apps/website/src/components/NavBar.tsx:104-119`.
- **Live-Befund:** Die Startseiten-Hero-Zone läuft live mit einem roten Verlauf; der aktuelle Quellcode referenziert dagegen `var(--brand-gradient)` aus `apps/website/src/pages/Home.tsx:72-77` und `apps/website/src/index.css:12-15`.
- **Live-Befund:** Die live ausgelieferte `/spiel`-Landingpage stimmt in Aufbau und Inhalten nicht mit `apps/website/src/pages/Spiel.tsx:58-253` überein.
- **Risiko/Wirkung:** Accessibility-Befunde lassen sich nicht sauber schließen, solange unklar ist, welcher Code tatsächlich in Produktion läuft.

### 4. Hoch: Wiederkehrende WCAG-AA-Kontrastfehler in gemeinsamen Layout-Bausteinen

- **Automatischer Befund:** `pa11y` meldet auf `/`, `/kontakt`, `/spenden`, `/forum` und `/spiel` dieselben Kontrastfehler.
- **Code-Bezug:** `apps/website/src/layouts/PublicLayout.tsx:35`, `:41`, `:44-45`, `:51`, `:69`, `:79`, `:91`, `:98-99`, `:123-128`.
- **Code-Bezug:** `apps/website/src/components/NavBar.tsx:66-69` verwendet ebenfalls sehr helle Sekundärfarben für kleine Meta-Typografie.
- **Typische Wirkung:** kleine Metatexte wie `Verein`, Footer-Meta, Adresszeilen und `DSGVO-konform` unterschreiten die Lesbarkeitsanforderungen.

### 5. Hoch: Der Mitgliedschafts-Stepper ist semantisch fehlerhaft

- **Automatischer Befund:** `pa11y`/axe meldet auf `/mitglied-werden` einen `list`-Fehler.
- **Code-Bezug:** `apps/website/src/pages/Join.tsx:107-139`.
- **Problem:** In der geordneten Liste liegen direkte `<div>`-Elemente zwischen `<li>`-Elementen.
- **Risiko/Wirkung:** Screenreader-Nutzer bekommen eine inkonsistente oder irreführende Schrittstruktur.

### 6. Hoch: Pflichtfelder werden visuell zusätzlich mit zu schwachem Rot markiert

- **Automatischer Befund:** `pa11y` meldet auf `/kontakt` Kontrastfehler für die roten Sternchen.
- **Code-Bezug:** `apps/website/src/pages/Kontakt.tsx:340-343`, `:370-373`, `:402-405`.
- **Wirkung:** Die Zusatzmarkierung ist nicht gut lesbar. Zwar wird `Pflichtfeld` zusätzlich per `sr-only` geliefert, visuell bleibt die Kennzeichnung aber unnötig schwach.

### 7. Hoch: Forum und öffentliche CTAs verweisen in einen derzeit kaputten Portalpfad

- **Code-Bezug:** `apps/website/src/pages/ForumPage.tsx:205-209` verlinkt nicht eingeloggte Nutzer auf `buildPortalUrl('/login')`.
- **Live-Befund:** genau dieser Zielpfad ist kaputt.
- **Wirkung:** Nutzende, die diskutieren oder sich anmelden wollen, laufen aus einer öffentlich erreichbaren Seite direkt in einen Dead End.

### 8. Hoch: Brand-Quelle und aktive Token-Quelle widersprechen einander

- **Brand-Plugin:** `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md` fordert Orange/Blau sowie `Nunito Sans` und `Source Sans 3`.
- **Aktive Website-Tokens:** `apps/website/src/styles/tokens.css:47-66`, `:124-125` spiegeln diese Brand-Logik tatsächlich wider.
- **Figma-Tokens:** `figma-design-system/00_design-tokens.json:4-38`, `:89-99` definieren dagegen Rot/Slate und `Inter`/`Merriweather`.
- **Wirkung:** Designerische Entscheidungen, Kontrastfreigaben und Implementierung laufen nicht aus einer einzigen verlässlichen Quelle.

### 9. Mittel: Legacy-Styles und aktive Runtime-Styles zeigen widersprüchliche Farbsysteme

- **Code-Bezug:** `apps/website/src/main.tsx:5` importiert nur `index.css`.
- **Code-Bezug:** `apps/website/src/styles/globals.css:1-3` erklärt sich selbst als Legacy und nicht aktiv.
- **Legacy-Widerspruch:** `apps/website/src/styles/globals.css:29-56` definiert ein anderes Primär-/Sekundärsystem als die aktiven Tokens.
- **Wirkung:** Das erhöht das Risiko, dass Komponenten, Dokumentation und Deployments auf verschiedene Farb- und Kontrastmodelle referenzieren.

### 10. Mittel: Die 404-Fehlerseiten selbst sind nicht ausreichend lesbar

- **Automatischer Befund:** `pa11y` meldet auf `www.../login`, `www.../barrierefreiheit` und `crm.../login` zusätzliche Kontrastfehler direkt auf der Server-Fehlerseite.
- **Wirkung:** Gerade in einem Fehlerfall bekommen Nutzende nicht einmal eine solide, kontrastreiche Rückfalloberfläche.

---

## Bewertung nach Themenbereich

### 1. Semantik und Struktur

- **Teilweise gut:** `main`, `footer`, `nav`, `h1` und Formularstrukturen sind auf mehreren Seiten sauber vorhanden.
- **Schwachstelle:** Der Mitgliedschafts-Stepper verletzt Listen-Semantik in `apps/website/src/pages/Join.tsx:107-139`.
- **Schwachstelle:** Produktionsdrift erschwert die Aussage, welche Semantik tatsächlich live ausgerollt ist.

### 2. Tastaturbedienbarkeit

- **Gut:** Startseite hat live einen funktionierenden Skiplink; im Tastaturtest war er der erste Fokuspunkt.
- **Gut:** Mobile Fokusreihenfolge auf der Startseite war logisch und die Haupt-CTAs lagen im guten Größenbereich.
- **Blocker:** Ein logisch erreichbarer Login-Pfad nützt nichts, wenn die Zielroute `404` liefert.

### 3. Screenreader-Tauglichkeit

- **Gut:** Kontaktformular mit Labels, Fehlertexten und Fokussteuerung.
- **Gut:** Games-Host mit `progressbar`, `radiogroup` und `aria-live`.
- **Schwachstelle:** semantisch kaputter Stepper im Mitgliedschaftsflow.

### 4. Bilder und Medien

- **Gut:** Auf den geprüften Seiten hatten die zentralen Bilder sinnvolle `alt`-Texte.
- **Gut:** Dekorative SVG-Icons auf dem Games-Host sind überwiegend `aria-hidden="true"`.
- **Offen:** Audio-/Video-Alternativen waren im geprüften Scope kaum relevant, daher kein großer Negativbefund.

### 5. Formulare

- **Gut:** Kontaktformular ist technisch klar besser als der aktuelle Durchschnitt.
- **Schwachstelle:** Pflichtkennzeichnung visuell zu schwach.
- **Schwachstelle:** In produktiven Kernflows muss zusätzlich verifiziert werden, dass Backends und Fehlerzustände live stabil erreichbar sind.

### 6. Kontrast und Lesbarkeit

- **Schwachstelle:** global wiederkehrendes Muster im Header/Footer.
- **Schwachstelle:** zusätzliche Badge-/Metatext-Kontraste auf `/spiel`.
- **Schwachstelle:** Fehlerseiten kontrastschwach.

### 7. Responsive und mobile Nutzung

- **Gut:** Mobile Fokusfolge auf der Startseite war im Test nachvollziehbar.
- **Gut:** zentrale CTAs lagen im mobilen Test um etwa 49 bis 53 px Höhe.
- **Schwachstelle:** Eine umfassende manuelle Zoom-/Reflow-Prüfung über alle Hosts hinweg bleibt als Folgeschritt sinnvoll.

### 8. Verständlichkeit

- **Gut:** Sprache der öffentlichen Website ist klar, konkret und relativ leicht verständlich.
- **Schwachstelle:** Ein kaputter Login- oder Statement-Link ist immer auch ein Verständlichkeitsproblem, weil Erwartung und Ergebnis auseinanderfallen.

### 9. Technische Robustheit

- **Schwachstelle:** Routing-/Deployment-Drift.
- **Schwachstelle:** Portal-Einstieg defekt.
- **Schwachstelle:** Stepper-Semantik fehlerhaft.

### 10. Overlay-Bewertung

- **Live-Befund:** kein Accessibility-Overlay erkannt.
- **Bewertung:** gut so. Die vorhandenen Probleme sind klassische Code-, Deployment- und Kontrastthemen.
- **Ein Overlay würde hier vor allem kaschieren:**
  - kaputte Routen,
  - unzureichende Farbkontraste,
  - Produktionsdrift zwischen Quelle und Live-Stand.
- **Zusatzrisiken eines Overlays:** zusätzliche Skripte, möglicher Fokuskonflikt, zusätzlicher Consent-/Datenschutzbedarf, falsches Compliance-Gefühl.

---

## Was bereits nativ erfüllt wird

- Skiplink auf der öffentlichen Website
- sinnvolle Grund-Landmarken auf zentralen Seiten
- echtes Labeling und Fehlerführung im Kontaktformular
- gute A11y-Basis auf dem Games-Host
- keine erkennbare Abhängigkeit von einem Overlay

---

## Muss im Code oder Deployment behoben werden

1. Öffentliche Login-Kette und CRM-Login wieder funktionsfähig machen.
2. Öffentliche Route `/barrierefreiheit` produktiv ausliefern.
3. Produktionsdrift zwischen Live-Build und aktuellem `apps/website`-Stand auflösen.
4. Kontrastfehler in Header und Footer global beheben.
5. Stepper in `Join.tsx` semantisch korrekt aufbauen.
6. Pflichtmarkierungen und kleine Metatexte kontraststark umsetzen.
7. Brand- und Token-Quelle eindeutig festlegen und synchronisieren.
8. Portal-abhängige CTAs erst dann prominent ausspielen, wenn der Zielpfad gesund ist.

---

## Kann optional durch Zusatzfunktionen unterstützt werden

1. zusätzlicher Kontrastmodus
2. vergrößerte Standard-Schriftgröße
3. Lesemodus für lange Inhalte
4. zusätzliche Bedienhilfen für das Spiel
5. feinere Reduktion von Animationen über die Basiseinstellung hinaus

Diese Punkte dürfen aber **nur ergänzen**, nicht die Grundumsetzung ersetzen.

---

## Overlay-Fazit

Ein Accessibility-Overlay wäre in diesem Zustand **nicht die Hauptlösung**.

Die Seite braucht zuerst:

- funktionierende Routen,
- konsistente Deployments,
- saubere Kontraste,
- korrekte Semantik.

Erst wenn diese Basis stimmt, sind optionale Komfortfunktionen sinnvoll.

---

## Test- und Evidenzbasis

Automatisiert geprüft:

- `pa11y` auf `/`, `/kontakt`, `/mitglied-werden`, `/spenden`, `/forum`, `/spiel`, `/login`, `/barrierefreiheit`, `games...`, `crm.../login`

Manuell bzw. halbautomatisiert geprüft:

- Tastaturpfad auf Startseite und Startseite mobil via Puppeteer
- DOM-Fokusreihenfolge auf dem Games-Host
- Live-Statuscodes via `curl`
- Live-HTML gegen aktuellen Source-Code abgeglichen

Nicht vollumfänglich geprüft:

- echter NVDA-/VoiceOver-Durchlauf
- vollständige 200%-Zoom-Prüfung jedes Hosts mit visueller Dokumentation
- Touch-Gesten auf realen Geräten

Diese offenen Punkte ändern das Gesamturteil derzeit nicht, weil die zentralen Blocker schon vorher klar sind.

---

## Management-Zusammenfassung in einfacher Sprache

Die Website wirkt an vielen Stellen schon ordentlich und das Spiel ist technisch sogar überraschend gut vorbereitet. Trotzdem ist das Gesamtbild derzeit **nicht grün**.

Der wichtigste Grund ist: zentrale Wege funktionieren live nicht. Wer sich einloggen will oder die Barrierefreiheitsseite sucht, landet auf einer Fehlerseite. Dazu kommen wiederkehrende Kontrastprobleme bei kleinen Texten und ein deutlicher Unterschied zwischen dem aktuellen Code und dem, was tatsächlich online ist.

Kurz gesagt:  
**Die Basis ist da, aber Produktion und Qualitätssicherung sind noch nicht stabil genug, um die Website ohne Einschränkungen als barrierefrei gut nutzbar zu bewerten.**

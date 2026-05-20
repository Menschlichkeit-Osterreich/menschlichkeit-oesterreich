# Feature Specification: SEO- und Accessibility-Hardening (Website)

**Feature Branch**: `009-seo-accessibility-hardening`

**Created**: 2026-05-20

**Status**: Draft

**Input**: Externe Quelle — Masterplan 2.0 (siehe [docs/masterplan-2.0.md](../../docs/masterplan-2.0.md), Abschnitt 5 und Phase 2).

> Diese Spezifikation ergänzt die kanonische Governance ([AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md)).
> Bezug zu Brand-Vertrag in [CLAUDE.md](../../CLAUDE.md), Abschnitt „Brand-Kurzvertrag".

## 1 Strategische Entscheidung

`apps/website` (React 19 + Vite) wird gezielt auf **SEO**, **Performance (Core Web Vitals)** und **Barrierefreiheit (WCAG 2.2 AA)** gehärtet, bevor weitere Feature-Sprints starten. Ziel: messbare Verbesserung der Lighthouse-Scores und nachweisbare WCAG-Konformität für rechtliche Pflichten (EN 301 549, Web-Zugänglichkeits-Gesetz AT).

## 2 User Story (Primär)

**Als** potenzielle Spenderin, Mitglied oder Behördenprüfer
**möchte ich** die Website über Suchmaschinen finden, sie schnell laden, mit Screenreader oder Tastatur barrierefrei bedienen können,
**damit** ich Vereinsinhalte ohne Hürde nutzen kann und der Verein gesetzliche Pflichten erfüllt.

## 3 Funktionale Anforderungen

### 3.1 SEO

| ID     | Anforderung                                       | Akzeptanzkriterium                                                |
| ------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| SEO-01 | Eindeutige Titles und Meta-Descriptions pro Route | Lighthouse SEO-Score ≥ 95 für Top-10-Seiten.                      |
| SEO-02 | Heading-Hierarchie                                | Jede Seite genau ein `<h1>`, keine übersprungenen Level.          |
| SEO-03 | Strukturierte Daten (JSON-LD)                     | Organization auf Startseite, Article auf Blog, FAQ wo zutreffend. |
| SEO-04 | `robots.txt` und `sitemap.xml`                    | Beide unter Root erreichbar, Sitemap automatisch generiert.       |
| SEO-05 | Canonical-URLs                                    | Pro Route ein `<link rel="canonical">`.                           |
| SEO-06 | Open-Graph & Twitter-Cards                        | Vollständig pro Route, mit Hero-Bild.                             |
| SEO-07 | Mehrsprachigkeit                                  | `hreflang` falls Englisch ergänzt wird.                           |

### 3.2 Performance

| ID      | Anforderung               | Akzeptanzkriterium                                                                     |
| ------- | ------------------------- | -------------------------------------------------------------------------------------- |
| PERF-01 | Largest Contentful Paint  | LCP ≤ 2,5 s (75th percentile, mobile).                                                 |
| PERF-02 | Interaction to Next Paint | INP ≤ 200 ms.                                                                          |
| PERF-03 | Cumulative Layout Shift   | CLS ≤ 0,1.                                                                             |
| PERF-04 | Moderne Bildformate       | WebP/AVIF mit Fallback; `loading="lazy"` außerhalb Viewport.                           |
| PERF-05 | Caching-Header            | Statisch versionierte Assets mit `Cache-Control: public, max-age=31536000, immutable`. |
| PERF-06 | Code-Splitting            | Route-basiert, kein Bundle > 200 kB initial.                                           |

### 3.3 Accessibility (WCAG 2.2 AA)

| ID      | Anforderung            | Akzeptanzkriterium                                                     |
| ------- | ---------------------- | ---------------------------------------------------------------------- |
| A11Y-01 | Kontraste              | Mindestens 4,5:1 für Text, 3:1 für UI-Elemente.                        |
| A11Y-02 | Tastatur-Bedienbarkeit | Alle interaktiven Elemente erreichbar und sichtbarer Fokus.            |
| A11Y-03 | Alt-Texte              | Jedes inhaltlich relevante `<img>` mit `alt`; dekorative mit `alt=""`. |
| A11Y-04 | Formulare              | Jedes `<input>` mit `<label for>`; Fehler text-und-symbol-codiert.     |
| A11Y-05 | ARIA-Landmarken        | `<header>`, `<nav>`, `<main>`, `<footer>` korrekt.                     |
| A11Y-06 | Live-Regions           | Dynamische Inhalte (Toast, Formfehler) mit `aria-live="polite"`.       |
| A11Y-07 | Skip-Link              | „Zum Inhalt springen" als erster fokussierbarer Link.                  |
| A11Y-08 | Pa11y-Audit            | 0 Errors auf Top-10-Seiten (siehe [pa11yci.json](../../pa11yci.json)). |

### 3.4 Security-Header

| ID     | Anforderung            | Akzeptanzkriterium                                   |
| ------ | ---------------------- | ---------------------------------------------------- |
| SEC-01 | CSP                    | Strikte CSP ohne `unsafe-inline` (nonce-basiert).    |
| SEC-02 | HSTS                   | `max-age=31536000; includeSubDomains; preload`.      |
| SEC-03 | Referrer-Policy        | `strict-origin-when-cross-origin`.                   |
| SEC-04 | Permissions-Policy     | restriktiv (kein Mikrofon/Kamera/Geo standardmäßig). |
| SEC-05 | X-Content-Type-Options | `nosniff`.                                           |
| SEC-06 | Frame-Options          | `DENY` oder spezifisches `frame-ancestors`.          |

### 3.5 Drittanbieter und CMP

| ID     | Anforderung     | Akzeptanzkriterium                                                        |
| ------ | --------------- | ------------------------------------------------------------------------- |
| CMP-01 | Consent-Mode    | Vor Consent keine Drittanbieter-Skripte.                                  |
| CMP-02 | CMP-UI          | WCAG-konform, leicht bedienbar, „Ablehnen" gleichwertig zu „Akzeptieren". |
| CMP-03 | Cookie-Inventar | Dokumentiert in [docs/](../../docs/) (Anhang Datenschutz).                |

## 4 Nicht-funktionale Anforderungen

- **Messbarkeit**: Lighthouse-Reports werden in CI archiviert (Quality Gate).
- **Wiederholbarkeit**: pa11y-CI und Lighthouse-CI in [.github/workflows/](../../.github/workflows/) integriert.
- **Brand-Konsistenz**: Tokens aus [figma-design-system/00_design-tokens.json](../../figma-design-system/00_design-tokens.json).

## 5 Out of Scope

- SEO-Kampagnen-Strategie und Redaktionsplan (separat).
- Internationalisierung über Deutsch + Englisch hinaus.
- Performance-Optimierungen für `apps/babylon-game` (eigene Spec, siehe [specs/005](../005-democracy-game-bruecken-bauen/)).

## 6 Datenflüsse (relevant)

```text
Browser
   │  Request mit Consent-Status
   ▼
Edge/CDN
   │  Security-Header injizieren, Caching
   ▼
Origin (apps/website, SSR/SSG bevorzugt)
   │  Pre-rendered HTML mit Meta, JSON-LD
   ▼
Browser-Render
   │  CMP entscheidet Drittanbieter-Skript-Lade
   ▼
Analytics (nur nach Consent)
```

## 7 Risiken

| Risiko                                   | Mitigation                                         |
| ---------------------------------------- | -------------------------------------------------- |
| CSP bricht bestehende Skripte            | schrittweise Einführung mit Report-Only-Modus      |
| CMP-UX verschlechtert Conversion         | A/B-Test, Brand-konformes Design, klare Sprache    |
| Lighthouse-Regression bei neuen Features | Lighthouse-CI als Pflicht-Gate vor Merge           |
| Falsche `hreflang`-Implementation        | nur einführen wenn Englisch tatsächlich ausgerollt |

## 8 Abhängigkeiten

- Brand-Tokens aus `figma-design-system/`.
- Lighthouse-CI-Konfiguration aus [lighthouse.config.cjs](../../lighthouse.config.cjs).
- Pa11y-Konfiguration aus [pa11yci.json](../../pa11yci.json).
- Quality-Gates aus [.github/instructions/core/quality-gates.instructions.md](../../.github/instructions/core/quality-gates.instructions.md).

## 9 Definition of Done (Spec-Reife)

- [ ] Lighthouse-Baseline-Report archiviert (vor Hardening).
- [ ] CSP im Report-Only-Modus mind. 7 Tage ohne kritische Violations.
- [ ] Pa11y-Audit grün auf Top-10-Seiten.
- [ ] Stakeholder-Review (Tech-Lead, DSB, Brand-Verantwortliche).
- [ ] `plan.md` mit konkreten React/Vite-Patterns erstellt.
- [ ] `tasks.md` mit numerierten Tasks erstellt.
- [ ] Issues via `speckit.taskstoissues` generiert.

## 10 Offene Fragen

1. Wird ein Edge-Provider (Cloudflare/Azure Front Door) eingeführt oder bleibt der Reverse-Proxy auf Plesk/eigener VM?
1. Welche CMP-Lösung wird gewählt (Eigenbau leicht, oder dedizierter Service)?
1. Soll Englisch als zweite Sprache jetzt geplant werden (beeinflusst `hreflang` und Routing)?

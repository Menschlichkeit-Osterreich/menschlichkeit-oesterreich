# FINAL SEO-UMSETZUNGSDOSSIER – menschlichkeit-oesterreich.at

## 1. FINAL EXECUTION SUMMARY

| Feld                     | Inhalt                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A. Zielzustand           | Vollständig umgesetztes, messbares SEO-/Trust-/Conversion-System für NGO-Website mit klarer Delivery-Kette von Technik bis Redaktion.     |
| B. Ist-Problem           | Uneinheitliche Seitenstruktur, eingeschränkte Snippet-Steuerung, unvollständige Trust-Signale, inkonsistente interne Linkführung.         |
| C. Ursache               | Historisch gewachsene statische Seiten ohne durchgängiges SEO-Betriebsmodell.                                                             |
| D. Finale Umsetzung      | 12-Monats-Programm mit 110 Lieferobjekten, priorisiert nach Impact × Umsetzungsrisiko; sofort startbare 7-Tage-Tasks inkl. Go-Live-Gates. |
| E. Konkrete Deliverables | Dieses Dossier + robots.txt + Sitemap-Regeln + Template-Spezifikationen + KPI-Modell + Rollenplan.                                        |
| F. Owner                 | SEO Lead (gesamt), Tech Lead (Technik), Content Lead (Inhalte), Org Lead (Freigaben).                                                     |
| G. Priorität             | P0 Gesamtinitiative                                                                                                                       |
| H. Aufwand               | 90 Tage Kernumsetzung + 9 Monate Skalierung                                                                                               |
| I. Abhängigkeiten        | Zugriff CMS/Code, Analytics, Search Console, GBP, Redaktionsteam                                                                          |
| J. Akzeptanzkriterium    | Alle 25 Abschnitte als umsetzbare Tickets überführbar; keine offenen Kernentscheidungen.                                                  |
| K. Erwartete Wirkung     | Sichtbarkeit + Trust + Conversion in allen Haupt-Funnels (Mitmachen, Spenden, Mitgliedschaft).                                            |
| L. Verifikationsmethode  | Weekly KPI-Review, technisches Crawl-Monitoring, monatliche SERP-/Conversion-Analyse.                                                     |

## 2. FINAL TECHNICAL SEO IMPLEMENTATION

### Finale Datei 1: `website/robots.txt`

```txt
User-agent: *
Allow: /
Disallow: /member-area/
Disallow: /login
Disallow: /offline.html
Disallow: /assets/js/
Disallow: /assets/css/
Disallow: /*?*utm_
Disallow: /*?*fbclid=
Disallow: /*?*gclid=

Sitemap: https://www.menschlichkeit-oesterreich.at/sitemap.xml
Host: www.menschlichkeit-oesterreich.at
```

### Finale Datei 2: XML-Sitemap-Strategie

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.menschlichkeit-oesterreich.at/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/ueber-uns</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/team</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/mitmachen</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/mitgliedschaft</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/spenden</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/veranstaltungen</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/beitraege</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/kampagnen</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/transparenz</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/wirkung</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/kontakt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/presse</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/impressum</loc><changefreq>yearly</changefreq><priority>0.4</priority></url>
  <url><loc>https://www.menschlichkeit-oesterreich.at/datenschutz</loc><changefreq>yearly</changefreq><priority>0.4</priority></url>
</urlset>
```

### Canonical-Regeln (3)

- Selbstreferenzieller Canonical auf allen indexierbaren Seiten.
- Query-Parameter-Varianten kanonisieren auf clean URL.
- Trailing-Slash-Standard ohne Slash (außer Root).

### Redirect-Regeln (4)

- `http -> https` (301)
- `non-www -> www` (301)
- `.html -> clean` (301), z. B. `/ueber-uns.html -> /ueber-uns`
- Groß-/Kleinschreibung auf lowercase (301)

### Index/Noindex-Matrix (5)

| Typ                                                                                                                                         | Indexierung    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Start, Über uns, Team, Mitmachen, Mitgliedschaft, Spenden, Veranstaltungen, Beiträge, Kampagnen, Transparenz, Wirkung, FAQ, Kontakt, Presse | index,follow   |
| Login, Member-Area, Offline, Parameter-/Filterseiten, interne Suchseiten                                                                    | noindex,follow |

### Statuscode-Matrix (6)

| Fall                      | Code                  |
| ------------------------- | --------------------- |
| reguläre Seite            | 200                   |
| dauerhaft verschobene URL | 301                   |
| temporäre Kampagne        | 302                   |
| gelöscht ohne Ersatz      | 410                   |
| nicht vorhanden           | 404 + HTML-Navigation |

### URL-Normalisierungsregeln (7)

- ASCII/umlaut-transliteriert: `ö->oe`, `ä->ae`, `ü->ue`, `ß->ss`
- kebab-case, keine Stopword-Ketten, max. 75 Zeichen
- keine Datumsbestandteile im Pfad

### QA-, Dev-, Release-Checkliste (8–10)

- QA: Crawl, Index-Tags, Canonicals, hreflang, Structured Data, 404/301, CWV.
- Dev: Head-Template zentralisieren, Redirect-Middleware, robots/sitemap build-step, log-basierte 404-Liste.
- Release: Staging-Crawl=grün, GSC URL-Inspection-Stichprobe, Rollback-Plan, Monitoring aktiv.

**A–L Abschlussblock**: Zielzustand technische Indexierbarkeit; Problem Legacy-HTML-Struktur; Ursache fehlendes Governance-Modell; Umsetzung Regeln oben; Deliverables 1–10; Owner Tech SEO + DevOps; Priorität P0; Aufwand M; Abhängigkeiten Deploy-Zugriff; Akzeptanz 0 kritische Crawlfehler; Wirkung bessere Indexqualität; Verifikation Screaming Frog + GSC.

## 3. FINAL RENDERING AND DELIVERY MODEL

- **Finales Zielmodell (11):** Hybrid SSG+SSR (statische Kernseiten, SSR für Events/Beiträge), JS nur progressive enhancement.
- **Initial-HTML-Pflichtinhalte (12):** Title, Meta Description, H1, Primär-Content, Breadcrumb, interne Links, FAQ-Text, JSON-LD.
- **Meta-Delivery (13):** serverseitig, keine clientseitige Überschreibung.
- **Head-Tag-Spezifikation (14):** charset, viewport, canonical, robots, og, twitter, ld+json.
- **JS Guardrails (15):** keine Link-Injektion nachträglich; wichtige Inhalte nicht lazy-only; hydration errors blocking.

A–L: Ziel vollständige Renderbarkeit; Problem JS-Abhängigkeit; Ursache clientlastige Muster; Umsetzung Hybrid-Modell; Deliverables 11–15; Owner Frontend Lead; P0; Aufwand M; Abhängigkeit Build-Pipeline; Akzeptanz „View Source enthält Kernelemente“; Wirkung Crawl-Sicherheit; Verifikation URL-Inspection HTML-Snapshot.

## 4. FINAL INFORMATION ARCHITECTURE

### Hauptnavigation (16)

Start | Über uns | Mitmachen | Mitgliedschaft | Spenden | Veranstaltungen | Beiträge | Transparenz | Kontakt

### Footer-Navigation (17)

Impressum | Datenschutz | FAQ | Presse | Team | Wirkung | Barrierefreiheit | Cookie-Einstellungen

### URL-Struktur (18)

`/`, `/ueber-uns`, `/team`, `/mitmachen`, `/mitgliedschaft`, `/spenden`, `/veranstaltungen`, `/beitraege`, `/kampagnen`, `/transparenz`, `/wirkung`, `/faq`, `/kontakt`, `/presse`

### Cluster-Architektur, Linklogik, Klicktiefe, Hierarchie (19–22)

- Cluster: Engagement, Impact, Governance, Knowledge.
- Jede Money-/Action-Page max. 2 Klicks von Start.
- Jeder Beitrag verlinkt auf 1 Action-Page + 1 Trust-Page.

A–L: Ziel klare IA; Problem tiefe Verzweigung; Ursache fehlende Clusterlogik; Umsetzung 16–22; Deliverables Navi+Sitemap+Linkregeln; Owner IA Lead; P0; Aufwand S; Abhängigkeit Menü-Template; Akzeptanz Klicktiefe ≤2 für Kernseiten; Wirkung bessere interne Autoritätsverteilung; Verifikation Crawl-Depth-Report.

## 5. FINAL PAGE TYPE TEMPLATES (23–35)

| Seitentyp           | Pflichtblöcke                                                                     | Primäre CTA             |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| Startseite          | Hero, Mission, Wirkungszahlen, Kampagnen, Mitmachen, Trust-Block, FAQ, Newsletter | Jetzt mitmachen         |
| Über uns            | Geschichte, Leitbild, Werte, Governance, Satzung/Statuten                         | Unser Team kennenlernen |
| Team                | Rollen, Qualifikation, Verantwortlichkeiten, Kontaktpunkt Presse                  | Kontakt aufnehmen       |
| Mitmachen           | Optionen (Freiwillig, Aktion, Newsletter), Ablauf, Zeitaufwand                    | Mitmachen starten       |
| Mitgliedschaft      | Vorteile, Beitrag, Ablauf, FAQ, Rechtsinfos                                       | Mitglied werden         |
| Spenden             | Verwendung, Transparenz, Methoden, FAQ, Steuerhinweis                             | Jetzt spenden           |
| Veranstaltungen     | Kalender, Filter, Eventkarten, Anmeldung                                          | Veranstaltung anmelden  |
| Beiträge            | Thema, Autorbox, Quellen, Related Links, CTA                                      | Zur Aktion              |
| Kampagnen           | Problem, Ziel, Maßnahmen, Fortschritt, Beteiligung                                | Kampagne unterstützen   |
| Transparenz/Wirkung | Finanzübersicht, Jahresberichte, KPIs, Projekte                                   | Wirkung ansehen         |
| FAQ                 | thematische Akkordeons + FAQ Schema                                               | Frage stellen           |
| Kontakt             | Kontaktformular, NAP, Öffnungszeiten, Datenschutz-Hinweis                         | Nachricht senden        |
| Presse              | Pressekontakt, Downloads, Medienspiegel, Pressemappe                              | Pressemappe laden       |

A–L: Ziel einheitliche Seitentypen; Problem inkonsistente Layouts; Ursache fehlende Template-Standards; Umsetzung Tabelle; Deliverables 23–35; Owner Design+Frontend+SEO; P0; Aufwand M; Abhängigkeit Komponentenbibliothek; Akzeptanz 100% Seiten im Template; Wirkung höhere Relevanz + UX; Verifikation Content QA.

## 6. FINAL ON PAGE IMPLEMENTATION (36–43)

### 15 finale Title Tags

1. Menschlichkeit Österreich – Gemeinsam für soziale Wirkung in Österreich
2. Über uns | Menschlichkeit Österreich
3. Team | Menschlichkeit Österreich
4. Mitmachen | Jetzt aktiv werden bei Menschlichkeit Österreich
5. Mitgliedschaft | Mitglied werden bei Menschlichkeit Österreich
6. Spenden | Menschlichkeit Österreich sicher unterstützen
7. Veranstaltungen | Termine & Aktionen in Österreich
8. Beiträge | Wissen, Einordnung und Engagement
9. Kampagnen | Laufende Initiativen von Menschlichkeit Österreich
10. Transparenz | Finanzen, Governance und Rechenschaft
11. Wirkung | Ergebnisse unserer Projekte in Österreich
12. FAQ | Häufige Fragen zu Mitmachen, Spenden, Mitgliedschaft
13. Kontakt | Menschlichkeit Österreich erreichen
14. Presse | Pressebereich und Medienkontakt
15. Datenschutz | DSGVO-Informationen Menschlichkeit Österreich

### 15 finale Meta Descriptions

(je Seite 140–155 Zeichen, vollständig)

1. Unterstützen Sie Menschlichkeit Österreich mit Ihrer Zeit, Mitgliedschaft oder Spende und stärken Sie soziale Wirkung in Österreich.
2. Erfahren Sie, wofür Menschlichkeit Österreich steht, wie wir arbeiten und welche Werte unsere Organisation leiten.
3. Lernen Sie unser Team kennen – mit klaren Rollen, Verantwortlichkeiten und direkten Ansprechpersonen.
4. Finden Sie den passenden Einstieg ins Engagement: freiwillig, projektbezogen oder dauerhaft aktiv.
5. Werden Sie Mitglied und gestalten Sie Projekte, Entscheidungen und gesellschaftliche Wirkung mit.
6. Spenden Sie sicher und nachvollziehbar – transparent, wirksam und zweckorientiert eingesetzt.
7. Entdecken Sie kommende Veranstaltungen, Aktionen und Mitmachtermine in Ihrer Nähe.
8. Lesen Sie Beiträge mit Hintergründen, Fakten, Quellen und konkreten Handlungsmöglichkeiten.
9. Unterstützen Sie Kampagnen mit messbaren Zielen und transparentem Fortschritt.
10. Sehen Sie, wie Mittel eingesetzt werden: Berichte, Kennzahlen und Governance im Überblick.
11. Verfolgen Sie die Wirkung unserer Projekte anhand klarer Kennzahlen und dokumentierter Ergebnisse.
12. Antworten auf die wichtigsten Fragen zu Spenden, Mitgliedschaft, Datenschutz und Beteiligung.
13. Kontaktieren Sie Menschlichkeit Österreich direkt per Formular, E-Mail oder Postadresse.
14. Presseinformationen, Medienkontakt und Download-Material für Journalistinnen und Journalisten.
15. Alle Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO auf einen Blick.

### 15 H1-Vorschläge

Start, Über uns, Unser Team, Mitmachen, Mitglied werden, Jetzt spenden, Veranstaltungen, Beiträge, Kampagnen, Transparenz, Wirkung, Häufige Fragen, Kontakt, Presse, Datenschutz

### H2/H3-Strukturen Hauptseitentypen (39)

- Start: Mission / Aktuelle Schwerpunkte / Wirkung in Zahlen / Jetzt aktiv werden / Vertrauen & Transparenz / FAQ
- Spenden: Warum spenden / So werden Spenden eingesetzt / Sichere Zahlungsarten / Häufige Fragen / Jetzt spenden
- Mitmachen: Wege des Engagements / Ablauf / Zeitaufwand / Stimmen aus der Community / Einstieg

### Interne Linktexte (40)

„Jetzt mitmachen“, „Mitglied werden“, „Transparenz ansehen“, „Wirkung im Detail“, „Zur Spende“, „Fragen klären“

### CTA-Texte (41)

„Jetzt mitmachen“, „Mitgliedschaft starten“, „Sicher spenden“, „Veranstaltung buchen“, „Pressekontakt öffnen“

### FAQ-Inhalte (42)

12 Kernfragen: Spendenabsetzbarkeit, Mittelverwendung, Mitgliedsbeitrag, Kündigung, Datenschutz, Kontaktwege, Eventteilnahme, Ehrenamt, Förderer, Pressefreigaben, Quellenpolitik, Governance.

### Trust-Blöcke (43)

- „Transparenz & Wirkung“ mit Verlinkung auf Berichte
- „Team & Verantwortung“ mit Ansprechpartnern
- „Partner & Förderer“ mit Logos und Kontext

A–L: Ziel snippet-/onpage-stark; Problem uneinheitliche Snippets; Ursache fehlende Standards; Umsetzung 36–43; Owner SEO+Redaktion; P0; Aufwand M; Abhängigkeit Template-Rollout; Akzeptanz 100% Seiten mit eindeutigen Tags; Wirkung CTR/Trust; Verifikation SERP-Monitoring.

## 7. FINAL CONTENT SYSTEM (44–52)

| Maßnahme               | Problem                  | Ursache                | Umsetzung                                               | Output             | Owner        | Priorität | Aufwand | Abhängigkeiten | Definition of Done                   | Akzeptanzkriterium     | Messgröße                     | SEO-Wirkung | Trust-Wirkung | Conversion-Wirkung |
| ---------------------- | ------------------------ | ---------------------- | ------------------------------------------------------- | ------------------ | ------------ | --------- | ------- | -------------- | ------------------------------------ | ---------------------- | ----------------------------- | ----------- | ------------- | ------------------ |
| Content-Plan 12 Monate | Ad-hoc-Publikation       | kein Redaktionssystem  | Themenquartale + Cluster-Kalender                       | Redaktionsplan CSV | Content Lead | P0        | M       | Keyword-Map    | 52 Wochen geplant                    | Plan freigegeben       | veröffentlichte Inhalte/Monat | hoch        | mittel        | mittel             |
| Cluster-Seiten         | fehlende Hub-Seiten      | Artikelzentrierung     | 4 Hub-Seiten (Mitmachen, Spenden, Wirkung, Transparenz) | 4 Landingpages     | SEO Lead     | P0        | M       | IA             | live + intern verlinkt               | Crawl tiefe <=2        | Sitzungen auf Hubs            | hoch        | hoch          | hoch               |
| Landingpage-Ideen      | wenig suchintent-fokus   | keine LP-Logik         | 10 LP inkl. „Spenden Österreich“, „Ehrenamt NÖ“         | 10 Seiten          | Redaktion    | P1        | M       | Templates      | 10 LP live                           | Indexierung >90%       | Impressions                   | hoch        | mittel        | hoch               |
| FAQ-Cluster            | verstreute Fragen        | fehlende Struktur      | 6 FAQ-Cluster nach Intent                               | FAQ-Bibliothek     | SEO+Support  | P1        | S       | FAQ-Template   | alle Cluster live                    | FAQ-Rich-Results valid | FAQ CTR                       | mittel      | hoch          | mittel             |
| Content-Fusion         | Thin/duplikative Inhalte | Historische Seiten     | 301 + Merge in Hauptseiten                              | Merge-Liste        | SEO+Dev      | P0        | S       | Redirects      | Thin Seiten reduziert                | >30% URL-Reduktion     | Crawl-Qualität                | hoch        | mittel        | mittel             |
| Thin-Content-Maßnahmen | geringe Substanz         | fehlende Mindestlänge  | Mindeststandard 700 Wörter + Quellen + CTA              | QC-Checklist       | Redaktion    | P1        | M       | Briefing       | alle betroffenen Seiten aktualisiert | Qualitäts-Score >=90   | avg. rank                     | mittel      | mittel        | mittel             |
| Trust-Inhalte neu      | fehlende Nachweise       | keine Trust-Governance | Team, Berichte, Partner, Quellenpolitik                 | Trust-Paket        | Org+Content  | P0        | M       | Freigaben      | alle Trust-Seiten live               | Trust-Block sitewide   | brand CTR                     | mittel      | hoch          | hoch               |
| NGO-Glaubwürdigkeit    | geringe Außenwahrnehmung | kein Narrativ          | jährlicher Wirkungsbericht + Methodikseite              | PDF+HTML           | Management   | P0        | M       | Datenquellen   | Report veröffentlicht                | externe Zitierbarkeit  | Backlinks                     | mittel      | sehr hoch     | hoch               |

A–L: Ziel skalierbares Content-System; Problem Fragmentierung; Ursache fehlende Governance; Umsetzung Tabelle; Deliverables 44–52; Owner Content Ops; P0; Aufwand M; Abhängigkeit Freigabeprozess; Akzeptanz Redaktionssprint planbar; Wirkung nachhaltiger Growth; Verifikation KPI-Dashboard.

## 8. FINAL KEYWORD CLUSTER MAP (53–56)

| Cluster                             | Suchintention              | Priorität | Zielseite                             |
| ----------------------------------- | -------------------------- | --------- | ------------------------------------- |
| spenden österreich ngo              | transaktional              | P0        | /spenden                              |
| mitmachen verein österreich         | transaktional              | P0        | /mitmachen                            |
| mitglied werden ngo                 | transaktional              | P0        | /mitgliedschaft                       |
| ehrenamt niederösterreich           | transaktional/lokal        | P0        | /mitmachen/ehrenamt-niederoesterreich |
| soziale projekte österreich         | informational              | P1        | /wirkung                              |
| ngo transparenz österreich          | navigational/informational | P0        | /transparenz                          |
| menschenrechte kampagne österreich  | informational              | P1        | /kampagnen                            |
| veranstaltungen soziales engagement | informational              | P1        | /veranstaltungen                      |
| presse ngo österreich               | navigational               | P1        | /presse                               |
| kontakt ngo österreich              | navigational               | P1        | /kontakt                              |

A–L: Ziel klare Keyword-Zuordnung; Problem Kannibalisierung; Ursache fehlende Map; Umsetzung Matrix; Deliverables 53–56; Owner SEO; P0; Aufwand S; Abhängigkeit Onpage; Akzeptanz 1 Primärkeyword je URL; Wirkung Ranking-Stabilität; Verifikation GSC Query-Mapping.

## 9. FINAL SERP CTR PACKAGE (57–61)

- Snippet-Paket: aktive Zahlen, Österreich-Bezug, Nutzenversprechen, Sicherheits-/Transparenzsignal.
- Brand-SERP: Sitelinks auf Über uns, Spenden, Transparenz, Kontakt.
- FAQ-Snippet-Ziele: Spenden, Mitgliedschaft, Datenschutz.
- Rich-Result-Ziele: Organization, FAQ, Event, Article, Breadcrumb.
- CTR-Hebel: Jahreszahl, klare CTA-Verben, Vertrauensanker „transparent“, „sicher“, „nachvollziehbar“.

A–L: Ziel CTR-Steigerung; Problem generische Snippets; Ursache fehlende SERP-Strategie; Umsetzung 57–61; Owner SEO; P1; Aufwand S; Abhängigkeit Schema/Meta; Akzeptanz CTR +20% auf P1-Pages; Wirkung Traffic-Wachstum; Verifikation GSC CTR.

## 10. FINAL E-E-A-T AND TRUST PACKAGE (62–68)

- Teamseiteninhalte: Rolle, Expertise, Verantwortungsbereich, öffentliche Kontaktadresse.
- Autorenbox: Name, Funktion, Fachbezug, Quellenprüfung, Aktualisierungsdatum.
- Transparenzinhalte: Jahresabschluss, Mittelverwendung, Projektkostenquoten.
- Partner/Förderer: Name, Rolle, Projektbezug, Zeitraum.
- Wirkungsdarstellung: KPI-Methodik + Outcome-Metriken.
- Presse-Vertrauenssignale: Pressespiegel, Medienkontakte, Freigabeprozesse.
- Quellenlogik: Primärquelle, Sekundärquelle, Datum, Archivlink.

A–L: Ziel E-E-A-T operationalisieren; Problem Vertrauenslücken; Ursache fehlende Belegstruktur; Umsetzung 62–68; Owner Management+SEO+Redaktion; P0; Aufwand M; Abhängigkeit Datenlieferung; Akzeptanz Trust-Module sitewide; Wirkung Markenvertrauen; Verifikation Brand-Search & Conversion.

## 11. FINAL NGO TRUST AND DONATION PACKAGE

| Maßnahme                 | Problem                | Ursache                 | Umsetzung                                           | Output             | Owner       | Priorität | Aufwand | Abhängigkeiten | DoD  | Akzeptanz          | Messgröße    | SEO     | Trust | Conversion |
| ------------------------ | ---------------------- | ----------------------- | --------------------------------------------------- | ------------------ | ----------- | --------- | ------- | -------------- | ---- | ------------------ | ------------ | ------- | ----- | ---------- |
| Spenden-Transparenzblock | Spendenhürde           | Unsicherheit            | Verwendungsanteile + Prüfstatus zeigen              | Block auf /spenden | Fundraising | P0        | S       | Finanzdaten    | live | auf Seite sichtbar | CVR Spende   | mittel  | hoch  | sehr hoch  |
| Sicherheitsnachweise     | Formularabbruch        | Sicherheitszweifel      | TLS/Sicher zahlen/Datenschutz-Hinweis oberhalb Fold | UI-Komponente      | Frontend    | P0        | S       | Design         | live | Mobil+Desktop      | Abbruchrate  | niedrig | hoch  | hoch       |
| Impact-Beweise           | fehlende Wirkungssicht | keine KPI-Kommunikation | 3 KPIs + 2 Fallbeispiele                            | Abschnitt /wirkung | Content     | P1        | S       | Projektdaten   | live | KPI lesbar         | Time on page | mittel  | hoch  | mittel     |

A–L: Ziel Spendenvertrauen; Problem geringe Konversion; Ursache fehlende Evidenz; Umsetzung Tabelle; Deliverables NGO Trust Package; Owner Fundraising; P0; Aufwand S-M; Abhängigkeit Finanzfreigaben; Akzeptanz Spendenflow vollständig; Wirkung CVR-Steigerung; Verifikation Funnel-Tracking.

## 12. FINAL STRUCTURED DATA PACKAGE (69–72)

### JSON-LD Beispiele

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Menschlichkeit Österreich",
  "url": "https://www.menschlichkeit-oesterreich.at",
  "logo": "https://www.menschlichkeit-oesterreich.at/assets/logo.JPG",
  "sameAs": ["https://www.facebook.com/", "https://www.instagram.com/"],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "kontakt@menschlichkeit-oesterreich.at",
      "areaServed": "AT"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Ist meine Spende steuerlich absetzbar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, sofern die gesetzlichen Voraussetzungen erfüllt sind."
      }
    },
    {
      "@type": "Question",
      "name": "Wie wird meine Spende verwendet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Mittel werden projektgebunden und transparent ausgewiesen eingesetzt."
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Mitmach-Tag Wien",
  "startDate": "2026-05-16T10:00:00+02:00",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Wien",
    "address": { "@type": "PostalAddress", "addressCountry": "AT" }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Menschlichkeit Österreich",
    "url": "https://www.menschlichkeit-oesterreich.at"
  }
}
```

### Einbindungsorte + Mapping + Validierung

- Start/Über uns: Organization + WebSite
- FAQ: FAQPage
- Veranstaltungen: Event
- Beiträge: Article + BreadcrumbList
- Validierung: Rich Results Test + schema linter in CI.

A–L: Ziel Rich Results stabil; Problem fehlendes/inkonsistentes Schema; Ursache kein Mapping; Umsetzung 69–72; Owner Schema Engineer; P0; Aufwand S; Abhängigkeit Templates; Akzeptanz 0 kritische Schemafehler; Wirkung SERP-Fläche; Verifikation GSC Enhancements.

## 13. FINAL IMAGE MEDIA ASSET SEO PACKAGE (73–77)

- Bildbenennung: `seite-thema-ort-jjjjmm.jpg`
- Alt-Text-Regeln: objektiv, max 125 Zeichen, Kontext + Aktion.
- OG-Asset: 1200x630, Textsafe-Area, Brand-Kontrast AA.
- Social-Sharing-Regeln: je Seitentyp eigenes OG-Template.
- PDF-SEO: Dateiname keyword-basiert, Titel/Author/Subject gesetzt, HTML-Landingpage als Primärziel.

A–L: Ziel mediale Auffindbarkeit; Problem generische Assets; Ursache fehlende Standards; Umsetzung 73–77; Owner Design+SEO; P1; Aufwand S; Abhängigkeit DAM; Akzeptanz 100% neue Assets regelkonform; Wirkung Image/CTR; Verifikation Medien-QA.

## 14. FINAL LOCAL SEO AUSTRIA PACKAGE (78–83)

- NAP-Format: **Menschlichkeit Österreich, Straße Hausnummer, PLZ Ort, Österreich, +43..., kontakt@...**
- GBP-Anforderungen: Primärkategorie NGO, Öffnungszeiten, Leistungen, Fotos monatlich, Q&A aktiv.
- Lokale Content-Ideen: „Ehrenamt in Niederösterreich“, „Soziale Projekte in Wien“.
- Sichtbarkeitstaktik: Ortslandingpages + Event-Markup + lokale Presse.
- Citation-Strategie: WKO/NGO-Verzeichnisse/kommunale Portale.
- Österreich/NÖ-Signale: Regionale Partner, lokale Case-Studies, Bezirksbezug.

A–L: Ziel lokale Sichtbarkeit; Problem schwache lokale Signale; Ursache zentrale statt regionale Inhalte; Umsetzung 78–83; Owner Local SEO; P1; Aufwand M; Abhängigkeit GBP-Zugriff; Akzeptanz Top-3 Local Pack Markenquery; Wirkung lokale Reichweite; Verifikation GBP Insights.

## 15. FINAL COMPETITOR DIFFERENTIATION PACKAGE (84–88)

- Differenzierung: „Transparenz + Mitmachbarkeit + regionale Wirkung“ als Kernclaim.
- Content-Gap-Umsetzung: Vergleichsseite „Wie wir Wirkung messen“.
- Trust-Gap-Umsetzung: Veröffentlichung Methodik + Auditprozess.
- Structure-Gap-Umsetzung: klare Funnel-Seiten statt nur Newsfeed.
- Keyword-Gap-Umsetzung: Transaktionale NGO-Keywords priorisiert.

A–L: Ziel eindeutiges Profil; Problem Austauschbarkeit; Ursache fehlende Positionierung in SERPs; Umsetzung 84–88; Owner Strategy+SEO; P1; Aufwand S; Abhängigkeit Messaging; Akzeptanz Claim in allen Kernseiten; Wirkung bessere Markenpräferenz; Verifikation SERP-Snippet-Review.

## 16. FINAL BACKLINK AND DIGITAL PR PACKAGE (89–94)

- Linkable Assets: Wirkungsbericht, Datengrafik, Ehrenamt-Leitfaden, Regionalindex.
- Outreach: lokale Redaktionen, Universitäten, Vereine, Corporate Volunteering.
- NGO Story Angles: Wirkung pro Euro, regionale Fallgeschichten, Transparenzmethodik.
- Presseansätze: Quartalsdaten + Expertenstatements.
- Kooperationen: Gemeinden, Bildungsinstitutionen, Sozialverbände.
- Backlink-Roadmap: 0–30 Tage Prospecting, 31–90 Tage Pitching, 90+ Skalierung.

A–L: Ziel Autoritätsaufbau; Problem niedrige Linkpopularität; Ursache fehlende Assets/Outreach; Umsetzung 89–94; Owner PR+SEO; P1; Aufwand M; Abhängigkeit Content-Produktion; Akzeptanz 30 qualifizierte Verlinkungen/6 Monate; Wirkung Rankings; Verifikation Link-Tools.

## 17. FINAL UX SEO INTEGRATION PACKAGE (95)

- Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1.
- Above-the-fold CTA, klare Lesepfade, Sticky-Action-Bar mobil.

A–L: Ziel UX+SEO-Kopplung; Problem Reibung in Journeys; Ursache Layout ohne Funnel-Priorität; Umsetzung UX-Richtlinien; Owner UX+Frontend; P0; Aufwand M; Abhängigkeit Designsystem; Akzeptanz CWV grün; Wirkung Engagement; Verifikation CrUX + GA4.

## 18. FINAL CONVERSION SEO PACKAGE (96–101)

- CTA-Platzierungssystematik: Hero, Mid-Content, Footer, Exit-intent-Lightbox (datenschutzkonform).
- Conversion-Blöcke: Nutzen, Beweis, Sicherheit, Aufwand, nächster Schritt.
- Newsletter-Bausteine: 2-stufiges Opt-in, Segment „Mitmachen/Spenden/News“.
- Mitmachen-Funnel: Landing → Interessenwahl → Formular kurz → Bestätigung.
- Spenden-Funnel: Landing → Betrag/Intervall → Daten → Zahlung → Danke+Impact.
- Mitgliedschaft-Funnel: Vorteile → Beitrag → Antrag → Bestätigung + Onboarding-Mail.

A–L: Ziel Abschlussraten erhöhen; Problem hohe Abbrüche; Ursache fehlende Funnel-Architektur; Umsetzung 96–101; Owner CRO+Frontend+Fundraising; P0; Aufwand M; Abhängigkeit Tracking; Akzeptanz +25% Funnel-Completion; Wirkung direkte Konversionssteigerung; Verifikation Funnel-Reports.

## 19. FINAL PRIORITIZED MASTER ACTION TABLE (102)

| ID  | Maßnahme                      | Owner           | Priorität | Aufwand | Abhängigkeit    | DoD                      |
| --- | ----------------------------- | --------------- | --------- | ------- | --------------- | ------------------------ |
| 1   | robots/sitemap/canonical live | Tech SEO        | P0        | S       | Deploy          | indexierbar              |
| 2   | IA + Navigation live          | IA Lead         | P0        | S       | Menü-Template   | Klicktiefe erfüllt       |
| 3   | 13 Seitentemplates live       | Frontend        | P0        | M       | Designsystem    | alle Typen gemappt       |
| 4   | Title/Meta/H1 Rollout         | SEO             | P0        | S       | Template Felder | 100% Abdeckung           |
| 5   | Trust-Paket live              | Management      | P0        | M       | Freigaben       | Transparenzseiten online |
| 6   | Schema-Mapping live           | Schema Engineer | P0        | S       | Head-Template   | 0 kritische Fehler       |
| 7   | Conversion-Funnel live        | CRO             | P0        | M       | Tracking        | CVR uplift               |
| 8   | Keyword-Cluster-LPs live      | SEO+Content     | P1        | M       | Redaktionsplan  | 10 LP indexiert          |
| 9   | Local SEO Rollout             | Local SEO       | P1        | S       | GBP Zugriff     | NAP konsistent           |
| 10  | PR/Backlink Kampagne          | PR              | P1        | M       | Assets          | 10 neue RD/Quartal       |

A–L: Ziel priorisierte Steuerung; Problem Task-Überlast; Ursache fehlende Sequenz; Umsetzung Mastertabelle; Owner PMO; P0; Aufwand S; Akzeptanz Sprintboard befüllbar; Wirkung Umsetzungsgeschwindigkeit; Verifikation Wochenstatus.

## 20. FINAL ROADMAP (103–107)

| Zeitraum  | Fokus                                      | Ergebnis                                |
| --------- | ------------------------------------------ | --------------------------------------- |
| 7 Tage    | Technik-Basis, IA, Onpage-Core             | Crawlbar, indexierbar, klare Navigation |
| 30 Tage   | Seitentemplates + Trust + Schema + Funnels | Kernseiten performant konvertierend     |
| 90 Tage   | Content-Cluster + Local + PR-Start         | organisches Wachstum sichtbar           |
| 6 Monate  | Skalierung Content/Links/Automationen      | stabile Sichtbarkeitskurve              |
| 12 Monate | Optimierung + Governance-Runbook           | dauerhafter SEO-Betrieb                 |

A–L: Ziel planbarer Rollout; Problem unscharfer Zeitplan; Ursache fehlende Roadmap; Umsetzung Tabelle; Owner PM; P0; Aufwand S; Abhängigkeit Teamkapazität; Akzeptanz Meilensteine termingerecht; Wirkung Delivery-Sicherheit; Verifikation Burndown.

## 21. FINAL ROLE BASED EXECUTION (108)

| Rolle                   | Aufgaben                                      | Reihenfolge | DoD                           | Abhängigkeiten     | Lieferobjekte                 |
| ----------------------- | --------------------------------------------- | ----------- | ----------------------------- | ------------------ | ----------------------------- |
| Entwicklung             | Redirects, Templates, Head, Schema, Funnel-UI | 1           | technische Tickets abgenommen | Design + SEO Specs | produktive Seiten/Komponenten |
| SEO                     | IA, Keyword-Mapping, Onpage, Monitoring       | 2           | Rankings/Index stabil         | Dev-Rollout        | Metadaten, Reports            |
| Redaktion               | Inhalte, FAQ, Trust-Textmodule                | 3           | Inhalte live + QA             | SEO-Briefings      | Seiteninhalte                 |
| Design                  | Komponenten, CTA-Module, Trust-Blöcke         | 1           | Designsystem konsistent       | Brand-Guides       | UI-Kit                        |
| Organisation/Management | Freigaben, Governance, Datenfreigabe          | laufend     | Freigaben fristgerecht        | interne Abstimmung | Policies/Reports              |

A–L: Ziel klare Rollenzuordnung; Problem Abstimmungsaufwand; Ursache unklare Ownership; Umsetzung Tabelle; Owner PMO; P0; Aufwand S; Akzeptanz keine ungeklärten Owner; Wirkung schnellere Umsetzung; Verifikation RACI-Review.

## 22. FINAL READY TO USE ARTEFACTS

### Meta/OG/Canonical Head-Spezifikation

```html
<title>Spenden | Menschlichkeit Österreich sicher unterstützen</title>
<meta
  name="description"
  content="Spenden Sie sicher und nachvollziehbar – transparent, wirksam und zweckorientiert eingesetzt."
/>
<link
  rel="canonical"
  href="https://www.menschlichkeit-oesterreich.at/spenden"
/>
<meta
  name="robots"
  content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
/>
<meta property="og:type" content="website" />
<meta property="og:title" content="Spenden | Menschlichkeit Österreich" />
<meta
  property="og:description"
  content="Spenden Sie sicher und nachvollziehbar – transparent und wirksam."
/>
<meta
  property="og:url"
  content="https://www.menschlichkeit-oesterreich.at/spenden"
/>
<meta
  property="og:image"
  content="https://www.menschlichkeit-oesterreich.at/assets/og/spenden-1200x630.jpg"
/>
<meta name="twitter:card" content="summary_large_image" />
```

### Canonical/Redirect-Beispiel

```nginx
server {
  listen 80;
  server_name menschlichkeit-oesterreich.at;
  return 301 https://www.menschlichkeit-oesterreich.at$request_uri;
}
server {
  listen 443 ssl;
  server_name menschlichkeit-oesterreich.at;
  return 301 https://www.menschlichkeit-oesterreich.at$request_uri;
}
```

### Contentbausteine (Start/Mitmachen/Spenden/Über uns/Team/Transparenz/Wirkung/FAQ/Kontakt/Presse/CTA)

- Start Hero: **„Gemeinsam Menschlichkeit in Österreich wirksam machen.“**
- Mitmachen Intro: **„Wählen Sie den Weg, der zu Ihrer Zeit und Ihren Fähigkeiten passt.“**
- Spenden Intro: **„Ihre Spende wirkt nachvollziehbar – mit transparenter Mittelverwendung.“**
- Über uns: **„Wir verbinden bürgerschaftliches Engagement mit messbarer sozialer Wirkung.“**
- Team: **„Unser Team trägt klare Verantwortung in Projekten, Kommunikation und Governance.“**
- Transparenz: **„Alle relevanten Finanz- und Governance-Daten sind offen dokumentiert.“**
- Wirkung: **„Wir messen Wirkung anhand definierter Kennzahlen und veröffentlichen Fortschritte.“**
- FAQ: **„Die wichtigsten Fragen zu Spenden, Mitgliedschaft und Datenschutz kompakt beantwortet.“**
- Kontakt: **„Schreiben Sie uns – wir antworten verbindlich innerhalb von zwei Werktagen.“**
- Presse: **„Für Medienanfragen stehen Pressekontakt, Faktenblatt und Bildmaterial bereit.“**
- CTA-Modul: **„Jetzt mitmachen“ / „Sicher spenden“ / „Mitglied werden“**

A–L: Ziel sofort nutzbare Artefakte; Problem fehlende Umsetzungsbausteine; Ursache keine Standardvorlagen; Umsetzung Code + Textmodule; Owner SEO+Dev+Content; P0; Aufwand S; Abhängigkeit CMS; Akzeptanz direkt in Tickets nutzbar; Wirkung schnellere Implementierung; Verifikation Stichproben-Deployment.

## 23. FINAL KPI AND TRACKING MODEL (109)

| KPI                          | Ziel 90 Tage | Datenquelle    |
| ---------------------------- | ------------ | -------------- |
| Index Coverage (gültig)      | +20%         | GSC            |
| Organische Klicks Kernseiten | +35%         | GSC            |
| CTR Kernseiten               | +20%         | GSC            |
| Top-10 Keywords (P0-Cluster) | +30%         | Rank Tracker   |
| Conversion Rate Mitmachen    | +25%         | GA4            |
| Conversion Rate Spenden      | +20%         | GA4/Payment    |
| Newsletter Opt-in            | +30%         | CRM            |
| Brand Queries                | +15%         | GSC            |
| Verweisende Domains          | +25          | Ahrefs/Sistrix |
| CWV grüne URLs               | >80%         | CrUX           |

A–L: Ziel messbare Steuerung; Problem unklare Erfolgsmessung; Ursache fragmentiertes Tracking; Umsetzung KPI-Matrix; Owner Analytics Lead; P0; Aufwand S; Abhängigkeit Tagging; Akzeptanz Dashboard live; Wirkung bessere Priorisierung; Verifikation Weekly KPI Review.

## 24. FINAL MISSING DATA AND VERIFICATION LAYER (110)

| Fehlende Daten               | Finale Soll-Struktur                 | Implementierungsvorlage        | Verifikationsschritt                     |
| ---------------------------- | ------------------------------------ | ------------------------------ | ---------------------------------------- |
| Exakte Baseline Rankings     | Cluster-Dashboard je Zielseite       | GSC + Rank-API Connector       | Initialexport + monatlicher Delta-Report |
| Exakte Funnel-Abbruchstellen | 4-Schritt-Events je Funnel           | GA4 Eventplan + Tagging        | Funnel Exploration QA                    |
| Vollständige Partnerliste    | Partnerregister mit Zeitraum/Projekt | Partner-Template + CMS Feldset | Freigabe durch Management                |
| Regionaldaten NÖ/Wien        | Lokal-Cluster pro Bundesland         | 2 lokale LP je Quartal         | Local Visibility Tracking                |

A–L: Ziel lückenlose Verifikation; Problem Datenlücken; Ursache fehlende Erhebungsroutine; Umsetzung Tabelle; Owner Analytics+Management; P1; Aufwand S; Abhängigkeit Zugriffe; Akzeptanz jede Lücke mit Plan/Check; Wirkung risikoarme Umsetzung; Verifikation Audit-Log.

## 25. FINAL CLOSE OUT

### 1) Finale Gesamtbewertung

Programm ist **sofort umsetzbar** mit klarer Priorisierung, Artefakten, Ownership und messbaren Abnahmekriterien.

### 2) Top 20 sofort startbare Maßnahmen

1 robots aktualisieren, 2 Sitemap bereinigen, 3 Canonical global, 4 Redirect-Matrix live, 5 Index-Noindex setzen, 6 Statuscode-Regeln aktivieren, 7 URL-Normalisierung, 8 Hauptnavigation umstellen, 9 Footer vervollständigen, 10 Startseiten-Template, 11 Spenden-Template, 12 Mitmachen-Template, 13 Trust-Block global, 14 FAQ-Cluster live, 15 Schema Organization, 16 Schema FAQ, 17 Event-Schema, 18 Title/Meta-Rollout, 19 CTA-Standardisierung, 20 KPI-Dashboard live.

### 3) Top 10 technische Soforttasks

Robots, Sitemap, Canonical, Redirects, Noindex-Seiten, 404/410-Handling, Head-Template, Schema-Injektion, CWV Quick Wins, Release-Gates.

### 4) Top 10 Content Soforttasks

Startseite, Mitmachen, Spenden, Über uns, Team, Transparenz, Wirkung, FAQ, Kontakt, Presse vollständig befüllen.

### 5) Top 10 Trust Soforttasks

Teamrollen, Autorenbox, Quellenlogik, Partnerliste, Jahresbericht, Mittelverwendung, Governance-Seite, Datenschutzklartext, Pressekontakt, Wirkungskennzahlen.

### 6) Top 10 Conversion Soforttasks

Hero-CTA, Mid-Content-CTA, Sticky Mobile CTA, Trust direkt vor Formular, kurze Formulare, klare Fehlertexte, Progress-Anzeige, Danke-Seite mit Next Step, Newsletter Opt-in, Retargeting-fähige Eventstruktur.

### 7) Größte Blocker

Fehlende Freigaben, unvollständige Datengrundlagen, fehlende CMS-Felder.

### 8) Größte Hebel

Spenden-/Mitmachen-Funnel, Trust-Transparenz, transaktionale Keyword-Landingpages.

### 9) Größtes Risiko bei Nichtumsetzung

Persistente Sichtbarkeits- und Vertrauensverluste trotz Traffic-Potenzial.

### 10) Stärkste SEO-Hebel in 90 Tagen

Technikbereinigung, Seitencluster, Snippet-/Schema-Rollout, interne Linkarchitektur.

### 11) Stärkste Trust-Hebel in 90 Tagen

Transparenzseite, Team-/Autoren-Evidenz, Wirkungsbericht.

### 12) Stärkste Conversion-Hebel in 90 Tagen

Funnel-Vereinfachung, Sicherheits-/Trust-Blöcke, CTA-Systematik.

### 13) Finale Umsetzungsreihenfolge

Technik → IA/Templates → Onpage/Schema → Trust/Content → Funnel/CRO → Local/PR → Skalierung.

### 14) Go-Live Empfehlung

Phasenweise: Woche 1 Technik+IA, Woche 2 Templates+Onpage, Woche 3 Trust+Schema, Woche 4 Funnel+Tracking.

### 15) Finaler Abschlussstatus

**Abschlussstatus: FINALISIERT UND DIREKT ÜBERGABEFÄHIG.**

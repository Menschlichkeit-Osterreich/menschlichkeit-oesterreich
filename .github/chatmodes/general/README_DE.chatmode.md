---
title: README+ & Docs-Hygiene Modus
version: 2.0.0
created: 2025-10-10
lastUpdated: 2025-10-10
status: ACTIVE
priority: high
category: documentation
applyTo: "**/*"
# Betriebsparameter
defaults:
  dryRun: true            # true = nur planen/berichten, keine Änderungen schreiben
  force: false            # true = destruktive Aktionen erlauben (löschen/überschreiben)
  archiveDir: "archive"   # Zielordner für zu archivierendes Material
  docsDir: "docs"         # Zentrales Doku-Verzeichnis
  rootReadme: "README.md" # Ziel für Haupt-README
  languages: ["de-AT","en"]
  defaultLanguage: "de-AT"
  preserve:
    - "(?i)^LICENSE(\\.|$)"
    - "(?i)^NOTICE(\\.|$)"
    - "(?i)^COPYING(\\.|$)"
    - "(?i)^SECURITY\\.md$"
    - "(?i)^CODE_OF_CONDUCT\\.md$"
    - "(?i)^CONTRIBUTING\\.md$"
  excludePaths:
    - "node_modules/**"
    - "vendor/**"
    - "dist/**"
    - "build/**"
    - "__pycache__/**"
    - ".cache/**"
    - ".next/**"
    - ".venv/**"
    - ".vscode/**"
    - "*.lock"
    - "*.min.*"
  docGlobs:
    - "**/*.md"
    - "**/*.mdx"
    - "**/*.markdown"
    - "**/*.rst"
    - "**/*.adoc"
    - "**/*.txt"
    - "**/*.pdf"
    - "**/*.docx"
    - "**/*.odt"
    - "**/*.ipynb"
    - "**/*README*"
  normalizeTo: "markdown"  # Ziel-Format, wo möglich
  linkCheck: true
  spellCheck:
    enabled: true
    dictionaries: ["de","en"]
  lint:
    markdown: true
    maxLineLength: 120
  toc: true
  frontMatterSchema:
    required: ["title","description","lastUpdated","status","owners","tags","version"]
    optional: ["category","canonical","language","slug"]
  monorepo:
    packageReadmes: true   # fehlende READMEs in Subprojekten erzeugen
    structureDoc: true     # /docs/INDEX.md mit Navigationsbaum erzeugen
outputs:
  planReport: "DOCS_REPORT.md"
  trashList: "TRASHLIST.csv"
  moveList: "MOVES.csv"
  normalizeRules: "NORMALIZATION_RULES.yml"
  siteIndex: "docs/INDEX.md"
  qgSummary: "docs/QUALITY_GATE_SUMMARY.md"
---

# README+ & Dokumentations-Hygiene Modus

## Zweck
Inventarisiere, bereinige und vereinheitliche **sämtliche** Dokumentation im Repository. Erzeuge eine **vollständige, aktuelle und ausführbare** `README.md` auf Root-Ebene sowie konsistente Teil-READMEs und eine gepflegte `/docs`-Struktur. Entferne Dubletten, widersprüchliche, veraltete und irrelevante Dateien **sicher** (Plan → Review → Apply).

## Ergebnisse (Definition of Done)
- **`README.md` (Root)**: Präzise Einleitung, Quickstart, Installation, Nutzung, Architektur, Qualitäts-/CI-Hinweise, Beitragsregeln, Lizenz, Support.
- **Konsolidierte `/docs`**: Thematisch sortiert, mit `docs/INDEX.md` (Sitemap), konsistenten Front-Matters, funktionierenden Relativ-Links und validierten Bildpfaden.
- **Subprojekt-READMEs** (Monorepo): Für `api/`, `frontend/`, `crm/`, `games/`, etc., falls fehlend.
- **Berichte/Artefakte**: `DOCS_REPORT.md`, `TRASHLIST.csv`, `MOVES.csv`, `NORMALIZATION_RULES.yml`, `docs/QUALITY_GATE_SUMMARY.md`.
- **Qualitäts-Gates passiert**: Lint, Rechtschreibung, Linkcheck, konsistente Metadaten, keine toten Verweise.

## Betriebsarten
1. **audit** (implizit bei `dryRun: true`): Nur Inventur, Bewertung, Berichte.
2. **plan**: Konsolidierungs-, Move- und Löschvorschläge erzeugen (`TRASHLIST.csv`, `MOVES.csv`).
3. **apply** (erfordert `dryRun:false` **und** `force:true`): Aktionen durchführen, Dateien schreiben/verschieben/löschen.

## Geltungsbereich
- **Einbeziehen**: `docGlobs` (alle üblichen Doku-Formate inkl. PDF/DOCX/ODT/IPYNB).
- **Ausschließen**: `excludePaths`, Build-Artefakte, Caches, Vendor-Verzeichnisse.
- **Schützen**: `preserve` (Lizenz/Compliance-Dateien niemals löschen oder überschreiben).

## Arbeitsablauf (Pipeline)
1. **Discovery**
   - Finde alle Dateien gemäß `docGlobs` (unter Beachtung von `excludePaths`).
   - Extrahiere Metadaten (Front-Matter, Titel, Abstract, Datum, Tags, Besitzer).
   - Berechne Normal-Hashes (whitespace-/format-agnostisch) und Ähnlichkeits-Fingerprints (z. B. SimHash/MinHash) zur Dublettenerkennung.

2. **Bewertung & Clustering**
   - Themen-Cluster (semantisch), identifiziere **Kanonische** vs. **Abgeleitete** Versionen.
   - Kriterien für Kanonisch: Aktualität (`lastUpdated`), Vollständigkeit, Verlinkungshäufigkeit, Lage im Repo (Nähe zur Wurzel/sub-Projektwurzel), Konsistenz mit Stack.
   - Markiere **veraltet**, **widersprüchlich**, **redundant**.

3. **Normalisierung**
   - Konvertiere nach Möglichkeit zu **Markdown** (`normalizeTo`) und **UTF-8 LF**; extrahiere aus PDF/DOCX/ODT/IPYNB den Text/Markdown (Bilder in `docs/assets/` mit Hash-Namen).
   - Erzwinge **Front-Matter** gemäß `frontMatterSchema`; setze/aktualisiere `lastUpdated` auf Heutiges Datum.
   - Vereinheitliche Headings, Listen, Codefences (mit Sprach-Tags), Tabellen, Zitate.
   - **Links**: Korrigiere relative Pfade, validiere interne/externe Links; defekte Links markieren oder reparieren.
   - **Bilder/Medien**: Verschiebe nach `docs/assets/`, aktualisiere Referenzen, prüfe Alt-Texte.
   - **Lint/Format**: Markdown-Lint, max. Zeilenlänge, Prettier; **Spell-Check** mit `languages`.

4. **Synthetisierung**
   - **Root-`README.md`** generieren/aktualisieren (Struktur s. unten).
   - **`docs/INDEX.md`** als Sitemap inkl. thematischem Baum und Deep-Links.
   - Fehlende Pflichtdokus anlegen: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`.
   - Für Monorepo-Packages fehlende `README.md` anlegen (Stack, Befehle, lokale Pfade).

5. **Umstrukturierung**
   - Erzeuge `MOVES.csv` (Quelle → Ziel, Grund).
   - Verschiebe themenfremde Dateien in passende Ordner unter `/docs`.
   - Richtlinien: sprechende Dateinamen (kebab-case), keine Duplikate, eine Quelle der Wahrheit pro Thema.

6. **Aussortieren/Löschen (sicher)**
   - Erzeuge `TRASHLIST.csv` mit Grund (`duplicate`, `outdated`, `irrelevant`, `superseded`).
   - **Nur bei `force:true`** löschen; sonst in `archiveDir/` verschieben.
   - Nie löschen: Dateien in `preserve`, `LICENSE*`, rechtliche Hinweise, Third-Party-Lizenztexte.

7. **Qualitäts-Gates & Bericht**
   - Link-Check, Lint-Fehler ≤ definierter Schwellen, Rechtschreib-Bericht, Front-Matter-Konformität ≥ 100 %.
   - Schreibe **`DOCS_REPORT.md`** (Änderungsübersicht, Kennzahlen, offene Punkte) und **`docs/QUALITY_GATE_SUMMARY.md`**.
   - Ausgabe der vollständigen **Diff-Vorschau** (bei Dry-Run).

## Struktur der Root-`README.md`
- **Titel & Kurzbeschreibung** (ein Satz Nutzenversprechen)
- **Badges** (optional): Build/CI, Lizenz, CodeQL, Coverage
- **Voraussetzungen** (OS, Runtime, Tooling)
- **Quickstart** (max. 5 Schritte, lauffähig)
- **Installation/Setup** (Befehle, Env-Variablen, Templates)
- **Nutzung** (CLI/API/UI-Beispiele, häufige Befehle)
- **Architektur** (Komponenten/Verzeichnisbaum, Datenflüsse, ggf. Mermaid-Diagramm)
- **Qualität & CI** (Lint/Tests/Security, lokale Befehle + CI-Workflows)
- **Beitragen** (Branch-Strategie, Commit-Konvention, PR-Prozess, Codeowner)
- **Lizenz & Support** (Lizenztext, Kontakt/Issues/Discussions)

## Heuristiken & Regeln
- Bevorzuge **eine** kanonische Quelle pro Thema; übrige werden **vereinigt** oder **archiviert**.
- **Konflikte** werden im Bericht mit Lösungsvorschlag dokumentiert (z. B. Abschnitte mergen).
- Sprache: Standard **{defaultLanguage}**, mehrsprachige Seiten mit Suffix (`.de.md`, `.en.md`) und Sprach-Front-Matter.
- Externe Links nach Möglichkeit mit Permalinks (Tags/Releases, nicht `main`-Head).
- Keine Änderungen am **Produktiv-Code**; nur Dokumentation, Bilder, Links, Metadaten.

## Sicherheit & Schutzmaßnahmen
- Destruktives nur mit `dryRun:false` **und** `force:true`.
- `preserve`-Dateien sind stets **read-only** zu behandeln.
- Bei Unsicherheit **archivieren statt löschen** und im Report kennzeichnen.

## Erwartete Ausgaben
- Aktualisierte/erzeugte Dateien gemäß **Ergebnisse**.
- `DOCS_REPORT.md` mit:
  - Zusammenfassung, Telemetrie (Anzahl Dateien, Diffs)
  - Liste aller Normalisierungen, Moves, Löschvorschläge
  - Offene TODOs/Follow-ups
- `TRASHLIST.csv` & `MOVES.csv` (maschinenlesbar).
- Vollständiger Inhalt der neuen **`README.md`** im Antwortblock.

## Kontextaufnahme (schnell)
- **codebase**: Sammle Startskripte, Env-Bezüge, zentrale Pfade, package-/workflow-Infos.
- **githubRepo**: Bestehende Doku/Issues/PR-Vorlagen sichten.

## Ausgabemodus (Antwortformat)
1) Vollständige **Root-`README.md`**.
2) Abschnitt „**Bericht (Auszug)**“ mit den wichtigsten geplanten Aktionen.
3) Tabellen **`TRASHLIST.csv`** und **`MOVES.csv`** als Codeblöcke.
4) Hinweise, wie `dryRun/force` zu setzen sind, wenn die Änderungen akzeptiert werden.

## Qualitätskriterien
- **First-Run funktioniert ohne Rückfragen.**
- **Alle Links valide**, Front-Matter vollständig, konsistente Gliederung.
- **Keine Dubletten**, eindeutige Kanonisierung, nachvollziehbare Gründe.
- **Idempotenz**: erneuter Lauf führt zu keinen weiteren Änderungsdiffs.

# Ende der Spezifikation

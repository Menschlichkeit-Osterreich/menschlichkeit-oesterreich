# Governance-Kontext – Verein Menschlichkeit Österreich

## Vereinsdaten

| Feld                   | Wert                                                  |
| ---------------------- | ----------------------------------------------------- |
| **Vollständiger Name** | Verein Menschlichkeit Österreich                      |
| **ZVR-Zahl**           | 1182213083                                            |
| **Gründungsdatum**     | 28. Mai 2025                                          |
| **Vereinsbehörde**     | LPD Niederösterreich                                  |
| **Sitz**               | Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn |
| **Kontakt**            | kontakt@menschlichkeit-oesterreich.at                 |

## Vereinsorgane (gemäß Statuten)

| Organ                      | Beschreibung                   |
| -------------------------- | ------------------------------ |
| **Mitgliederversammlung**  | Oberstes Organ des Vereins     |
| **Vorstand**               | Führt die laufenden Geschäfte  |
| **Rechnungsprüfer\*innen** | Prüfung der Finanzgebarung     |
| **Schiedsgericht**         | Schlichtung von Streitigkeiten |

## Vorstand

| Funktion        | Bezeichnung                        |
| --------------- | ---------------------------------- |
| Vorsitz         | **Obperson** (nicht Obmann/Obfrau) |
| Stellvertretung | Stellvertretende Obperson          |
| Finanzen        | Kassier\*in                        |
| Protokoll       | Schriftführer\*in                  |

Funktionsperiode: bis zu 5 Jahre (gemäß Statuten, Beschluss 21.05.2025)

## Mitgliedschaftsarten

| Art                        | Jahresbeitrag      | Beschreibung                                        |
| -------------------------- | ------------------ | --------------------------------------------------- |
| Ordentliches Mitglied      | € 36               | Vollmitglied mit Stimmrecht                         |
| Ermäßigtes Mitglied        | € 18               | Für Studierende, Arbeitssuchende, Pensionist\*innen |
| Außerordentliches Mitglied | nach Vereinbarung  | Unterstützend, ohne Stimmrecht                      |
| Härtefall                  | € 0 (beitragsfrei) | Auf Antrag bei Vorstand                             |
| Ehrenmitglied              | € 0                | Durch Mitgliederversammlung ernannt                 |

Quelle: Beitragsordnung 2025, gültig ab 01.07.2025

## Rollen im System

| Rolle       | Berechtigungen                                  |
| ----------- | ----------------------------------------------- |
| `guest`     | Nur öffentliche Inhalte                         |
| `member`    | Mitgliederbereich, Forum, Veranstaltungen       |
| `moderator` | + Inhalte verwalten, Blog, Events erstellen     |
| `admin`     | + Mitgliederverwaltung, Finanzen, Einstellungen |
| `sysadmin`  | Vollzugriff auf alle Funktionen                 |

## Quellen

- **Statuten**: `Pdf/Statuten_Verein_Menschlichkeit_Oesterreich_2025_neu.pdf`
- **Beitragsordnung**: `Pdf/Beitragsordnung_2025_Neuformulierung_Menschlichkeit_Oesterreich.pdf`
- **Vereinsregisterauszug**: ZVR 1182213083

## Technische Governance

### MCP-Konfigurationsmodell

- `mcp.json` ist die zentrale Source of Truth fuer den Repo-weiten MCP-Stack.
- `.vscode/mcp.json` ist ein schlankes VS-Code-Overlay und enthaelt nur den `github`-Server.
- Keine doppelten Serverdefinitionen zwischen beiden Dateien eintragen.

### Hooks und Qualitaetsgates

- Lokale Hooks laufen ueber `.githooks` (pre-commit, commit-msg, pre-push).
- Aktivierung: `npm run git:hooks:enable`
- Statuspruefung: `npm run git:hooks:status`
- Governance-Basispruefung: `npm run governance:check`
- MCP-Basispruefungen: `npm run mcp:check` und `npm run mcp:health`

### Workspace-Bootstrap (Best Practice)

Fuer einen reproduzierbaren Startzustand (Hooks, Governance, MCP, Basistests):

- `npm run workspace:bootstrap`

Fuer Vollsetup inklusive Installation der empfohlenen VS-Code-Extensions:

- `npm run workspace:bootstrap:full`

Nur VS-Code-Extensions aus `.vscode/extensions.json` installieren:

- `npm run vscode:extensions:install`

Hinweis:

- Die Extension-Installation nutzt die lokale `code`-CLI. Wenn sie fehlt, muss in VS Code einmal der Shell-Command fuer `code` in PATH aktiviert werden.

### CI-Strategie

- Zusaetzlich existiert ein warnender Governance-Workflow (`.github/workflows/governance-warnings.yml`).
- Dieser Workflow macht Drift sichtbar, blockiert aber keinen Merge.

### Lokaler Analyzer-Hinweis bei GitHub-Secrets

- Fuer Deploy-Workflows bleiben sensitive Werte strikt im `secrets`-Kontext (nicht in `vars`).
- Beispiel in CI: `secrets.STAGING_DEPLOY_WEBHOOK` ist gewollt und sicherheitskonform.
- Der lokale Hinweis `Context access might be invalid` kann in VS Code als statisches False-Positive auftreten,
  wenn der Analyzer den realen Secret-Bestand des Repositories nicht aufloesen kann.
- Dieser Hinweis allein ist kein Grund, auf `vars` umzubauen oder Secrets in weniger strikte Kontexte zu verschieben.

Verifikation bei lokalem Hinweis:

1. Secret-Name im Workflow gegen den kanonischen Namen in `secrets.manifest.json` pruefen.
2. Workflow-Syntax und Repo-Governance validieren:
   - `npm run governance:check`
3. Laufzeitpruefung im Zielkontext (GitHub Actions) als eigentliche Wahrheit verwenden.

## E-Mail-Adressen

Alle E-Mail-Adressen verwenden die Domain `@menschlichkeit-oesterreich.at`:

| Funktion                 | Adresse                                   |
| ------------------------ | ----------------------------------------- |
| Allgemein                | kontakt@menschlichkeit-oesterreich.at     |
| Information              | info@menschlichkeit-oesterreich.at        |
| Administration           | admin@menschlichkeit-oesterreich.at       |
| Systembenachrichtigungen | noreply@menschlichkeit-oesterreich.at     |
| Finanzen                 | finanzen@menschlichkeit-oesterreich.at    |
| Vorstand                 | vorstand@menschlichkeit-oesterreich.at    |
| Datenschutz              | datenschutz@menschlichkeit-oesterreich.at |
| Support                  | support@menschlichkeit-oesterreich.at     |

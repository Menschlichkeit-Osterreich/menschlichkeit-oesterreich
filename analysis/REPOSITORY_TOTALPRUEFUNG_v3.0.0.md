# REPOSITORY_TOTALPRUEFUNG v3.0.0

**Stand:** 30.03.2026  
**Status:** Aktuelle Referenzanalyse  
**Ersetzt:** `analysis/REPOSITORY_TOTALPRUEFUNG_v2.0.0.md` als aktuelle Vollpruefung  
**Scope:** Gesamtes getracktes Repository inklusive Vendor-/Mirror-Bereiche

## A. Executive Summary

Das Repository ist in seinem aktuellen Zustand nicht sauber steuerbar, obwohl einzelne Teilbereiche bereits stabilisiert wurden. Der wichtigste Befund ist kein einzelner Codefehler, sondern ein Vertragsbruch zwischen Dokumentation, Build-/CI-Verhalten, Repo-Topologie und aktivem Worktree:

- Der aktive Branch ist am 30.03.2026 `main`, das Remote exponiert `origin/main`, aber kein `origin/develop`.
- Gleichzeitig dokumentieren `CLAUDE.md`, `README.md`, `CONTRIBUTING.md` und mehrere Workflows weiterhin ein `develop`-basiertes Integrationsmodell.
- Der Root-Test `npm run test:unit -- --run` ist aktuell gruen, der Root-Lint ist hingegen rot und faellt auf Hidden-Toolkit-Code sowie einen MCP-Server, die nicht sauber in den Quality-Vertrag eingeordnet sind.
- Die primaere API-Struktur liegt laut Repo-Dokumentation in `apps/api/`, waehrend mit `api.menschlichkeit-oesterreich.at/` weiterhin eine Legacy-/Mirror-Flaeche mit eigener OpenAPI-, PII- und Middleware-Logik existiert.
- Der aktuelle Dirty Worktree betrifft einen echten Incident-Cluster (`scripts/security/incident-network-timeout.ps1` plus publizierte Incident-Artefakte), ist aber mit einer separaten DX-Aenderung in `.claude/launch.json` vermischt.
- Vendor-/Mirror-Code dominiert den Dateibestand. Allein `apps/crm/web/core/**` umfasst 14.317 getrackte Dateien; `apps/**` insgesamt 14.715. Ohne explizite Stewardship-Regeln drohen Fehlsignale bei Analyse, Linting und Priorisierung.

Die neue Leitentscheidung fuer die weitere Arbeit lautet deshalb:

1. Zuerst den aktiven Worktree und die Repo-Vertraege stabilisieren.
2. Danach Source-of-Truth, Test-Bootstrap und Qualitaetsgrenzen festziehen.
3. Erst dann in fachliche oder strukturelle Refactorings gehen.

## B. Repo-Diagnose

### 1. Baseline zum Ist-Zustand

Verifizierter Zustand am 30.03.2026:

- Branch: `main...origin/main`
- Dirty Worktree:
  - `.claude/launch.json`
  - `openclaw-system/windows-bridge/package.json`
  - `openclaw-system/windows-bridge/package-lock.json`
  - `scripts/security/incident-network-timeout.ps1`
  - `reports/incident-network-timeout/selective-timeout-5.183.217.146/*`
  - ungeversionierte Incident-Datei: `reports/incident-network-timeout/selective-timeout-5.183.217.146/provider-ticket-report-2026-03-29.md`
- `git diff --stat` zeigt 149 Insertions / 52 Deletions ueber sieben modifizierte Dateien.
- Remote-Lage:
  - `origin` zeigt auf `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git`
  - `origin/main` existiert
  - `origin/develop` existiert nicht

Interpretation:

- Es gibt bereits laufende Incident-Arbeit im Repo, die nicht ueberschrieben werden darf.
- Das dokumentierte Branch-Modell ist derzeit kein abbildgetreuer Betriebszustand.
- Jeder weitere Misch-Commit wuerde die Nachvollziehbarkeit verschlechtern.

### 2. Architektur- und Source-of-Truth-Lage

Aktuelle Topologie:

- Root-Workspaces: `apps/website`, `apps/babylon-game`, `mcp-servers/*`
- Nicht als Workspace eingebundene Produkt-/Systembereiche:
  - `apps/api`
  - `apps/crm`
  - `openclaw-system`
- Legacy-/Mirror-Pfad:
  - `api.menschlichkeit-oesterreich.at/`
- Build-Artefakt-/Restpfad:
  - `apps/game/dist`

Verifizierte Drift:

- `apps/api/` ist laut `CLAUDE.md` die primaere API-Flaeche.
- `api.menschlichkeit-oesterreich.at/` enthaelt weiterhin eine eigene `openapi.yaml`, eigene PII-Library, eigene Middleware und ein grosses `main.py`.
- `apps/api/README.md` dokumentiert noch eine andere KPI-/Dashboard-API auf Port 8080 und verweist auf `api/fastapi/`, also auf ein anderes Strukturmodell als das aktuelle Repo.

Verbindliche Entscheidung ab dieser Analyse:

- `apps/api/` ist die einzige autoritative Backend-Quelle fuer neue Entwicklung, Tests, OpenAPI und Migrationslogik.
- `api.menschlichkeit-oesterreich.at/` wird als Legacy-/Mirror-Flaeche behandelt.
- Neue Features, neue Vertragsanpassungen und neue OpenAPI-Aenderungen duerfen nicht mehr direkt in `api.menschlichkeit-oesterreich.at/` landen.
- Jede notwendige Aenderung an `api.menschlichkeit-oesterreich.at/` ist kuenftig als expliziter Legacy-Backport zu markieren und auf einen Source-of-Truth-Abgleich zu verweisen.

### 3. Repo-Qualitaetsvertrag und Testbarkeit

Verifizierte Checks:

- Root-Lint:
  - `npm run lint -- --max-warnings=0`
  - Ergebnis: fehlgeschlagen
  - Befunde: 11 Errors, 20 Warnings
  - Fehlerorte:
    - `.blender-toolkit/skills/scripts/src/**`
    - `.browser-pilot/skills/scripts/src/**`
    - `mcp-servers/bitwarden-cli/lib/**`
- Root-Unit-Tests:
  - `npm run test:unit -- --run`
  - Ergebnis: erfolgreich
  - 2 Testdateien, 20 Tests, alle gruen
- API-Python-Tests:
  - `cd apps/api && python -m pytest tests -q`
  - Ergebnis: nicht startbar, weil `pytest` in der lokalen Umgebung fehlt

Vertragsbruch innerhalb von Local/CI:

- `ci.yml` fuehrt `npm run lint`, `npm run test:unit -- --run` und `npm run build:workspaces` aus, aber nur fuer `main` und `develop`.
- `quality.yml` triggert auf allen Branches und nutzt `npx eslint . --max-warnings=-1`, blockiert also nur Fehler, nicht Warnungen.
- Lokal ist `eslint.config.js` so breit, dass Hidden-Toolkit-Pfade mitgeprueft werden, obwohl diese weder in Root-Workspaces noch im offensichtlichen Primarproduktmodell liegen.
- `pyproject.toml` referenziert `servers` und `mcp-search` als `pytest`-Testpfade; beide Verzeichnisse existieren aktuell nicht.
- `apps/api/requirements.txt` enthaelt keine Test-Dependencies wie `pytest`.

Verbindliche Entscheidung ab dieser Analyse:

- Root-JS-Gate:
  - Root-Lint ist fuer first-party Root-Code plus `mcp-servers/**` verbindlich.
  - Hidden-Toolkit-Baeume `.browser-pilot/**` und `.blender-toolkit/**` bleiben analysiert, werden aber nicht laenger implizit Teil des Root-Lint-Gates sein, solange sie keinen eigenen expliziten Tooling-Vertrag haben.
- Root-Test-Gate:
  - `npm run test:unit -- --run` bleibt der verbindliche Root-Unit-Gate.
- Python-Gate:
  - `apps/api` bekommt einen service-lokalen Testvertrag: `cd apps/api && python -m pytest tests -q`
  - Der Root-`pyproject.toml` darf nicht weiter auf nicht existierende Testpfade zeigen.
- Warnungs-Policy:
  - Errors blockieren, Warnings werden separat inventarisiert und reduziert.

### 4. Governance- und Branch-Drift

Verifizierte Abweichungen:

- `CLAUDE.md` dokumentiert: Branch von `develop`, PR nach `develop`, dann Merge nach `main`.
- `CONTRIBUTING.md` fordert explizit `git checkout develop`, `git pull origin develop`, Rebase auf `origin/develop`.
- `README.md` dokumentiert Staging ueber `develop`.
- Mehrere Workflows triggern auf `main, develop`, obwohl `origin/develop` aktuell nicht existiert.

Operative Bewertung:

- Das Repo lebt faktisch in einem `main`-zentrierten Modell.
- Das dokumentierte `develop`-Modell ist im aktuellen Remote nicht vollziehbar.
- Dadurch entstehen vermeidbare Onboarding-, Release- und CI-Irrtuemer.

Verbindliche Entscheidung ab dieser Analyse:

- Bis zur gezielten Wiedereinrichtung eines echten `develop`-Branches gilt `main` als operative Integrationsreferenz.
- Dokumentation und Workflows duerfen `develop` nicht mehr als vorausgesetzten Standardzustand behandeln, solange `origin/develop` fehlt.
- Falls `develop` fachlich gewuenscht ist, muss er als eigener Governance-Change wiederhergestellt werden:
  - Branch anlegen
  - Schutzregeln definieren
  - PR-Ziele, Deploy-Flow und Doku gleichzeitig umstellen

### 5. Incident-Artefakte und aktiver Worktree

Verifizierter Incident-Bestand:

- Das Incident-Skript `scripts/security/incident-network-timeout.ps1` wurde erweitert.
- Die aktuelle Diff-Linie verbessert die Auswertung von source-IP-abhaengiger Erreichbarkeit:
  - Bewertung ueber unterschiedliche oeffentliche IPs statt nur Egress-Labels
  - Port `8443` wird separat gegenueber `22/443` bewertet
  - Provider-Ticket wird praeziser formuliert
- `scripts/security/README.md` dokumentiert bereits zwei Artefaktklassen:
  - rohe Evidenz unter `quality-reports/incident-network-timeout/<case>/`
  - publizierte Spiegelung unter `reports/incident-network-timeout/<case>/`

Aktueller Strukturfehler:

- `.claude/launch.json` ist eine Dev-Experience-/Tooling-Aenderung und gehoert nicht in denselben Aenderungscluster wie Incident-Evidenz und Incident-Skript.

Verbindliche Entscheidung ab dieser Analyse:

- Incident-Rohdaten und reproduzierbare Collector-Ausgaben leben unter `quality-reports/`.
- Lesefreundliche, versionierte Publikationsartefakte leben unter `reports/`.
- `.claude/launch.json` und andere Entwicklungsumgebungsdateien sind als eigener DX-Cluster zu behandeln und duerfen nicht gemeinsam mit Incident-Evidenz reviewt oder ausgeliefert werden.

### 6. App-, Workspace- und Tooling-Topologie

Verifizierte Lage:

- `apps/website` ist als Workspace eingebunden.
- `apps/babylon-game` ist als Workspace eingebunden.
- `apps/api` ist nicht als Workspace eingebunden.
- `apps/crm` ist nicht als Workspace eingebunden.
- `openclaw-system` ist ueberhaupt ausserhalb der Workspaces organisiert.
- `apps/game` enthaelt nur `dist/` und ist damit kein klarer Quellpfad.
- Hidden-Toolkit-Verzeichnisse `.browser-pilot/` und `.blender-toolkit/` sind im Root-Lint sichtbar, aber nicht sauber in die Produkt-/Tooling-Topologie eingeordnet.
- `openclaw-system/windows-bridge/package.json` und `package-lock.json` liegen lokal ungetrackt vor und deuten auf nicht konsolidierte Modulformat-/Runtime-Anpassungen innerhalb der Tooling-Domaene hin.

Risiko:

- Build-Ownership und Lint-Ownership sind nicht deckungsgleich.
- Das fuehrt zu roten Gates ohne eindeutige Produktverantwortung.

Verbindliche Entscheidung ab dieser Analyse:

- Die autoritative App-Matrix besteht aus:
  - `apps/website`
  - `apps/babylon-game`
  - `apps/api`
  - `apps/crm`
  - `openclaw-system`
  - `mcp-servers/*`
- `apps/game` wird bis zur Klaerung als Build-Artefakt-/Ablagepfad behandelt, nicht als aktive App.
- Hidden-Toolkits bleiben in Scope fuer Analyse, bekommen aber eine explizite eigene Tooling-Zuordnung statt impliziter Root-Verantwortung.

### 7. Vendor-/Mirror-Footprint

Verifizierte Groessenordnung:

- `apps/crm/web/core/**`: 14.317 getrackte Dateien
- `apps/**` insgesamt: 14.715 getrackte Dateien
- `codacy-analysis-cli-master/**`: 141 getrackte Dateien

Risiko:

- Upstream-/Mirror-Code dominiert die reine Dateimenge und verzerrt jede Repo-weite Kennzahl.
- Ohne Stewardship-Regeln werden lokale Hotfixes in Fremdcode unsichtbar vermischt.

Verbindliche Entscheidung ab dieser Analyse:

- Vendor-/Mirror-Code bleibt voll in Scope fuer Diagnose und Risikoanalyse.
- Umsetzung in diesen Bereichen erfolgt nur noch nach Patch-Policy:
  1. lokale Aenderung nur mit dokumentiertem Grund
  2. Upstream-/Fork-Charakter explizit benennen
  3. isolierter Review-Cluster
  4. keine opportunistischen Cleanups in demselben Change

## C. Aenderungscluster

| Name                            | Ziel                                                                       | Dateien/Module                                                                                                               | Problemtyp                     | Risiko bei Nichtbearbeitung                                                         | Risiko bei Bearbeitung | Abhaengigkeiten | Prioritaet | Aufwand | Quick Win? | Vorgehensweise                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- | ---------------------- | --------------- | ---------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Aktiver Worktree / Incident     | Laufende Incident-Arbeit sauber isolieren und reviewbar machen             | `scripts/security/incident-network-timeout.ps1`, `reports/incident-network-timeout/**`, `.claude/launch.json`                | Bug / Ops / Schulden           | Vermischte Incident-Evidenz, unsaubere Historie, Review-Blocker                     | Niedrig bis mittel     | Keine           | Critical   | S       | Ja         | Incident-Skript und Incident-Publikation als eigenen Cluster einfrieren; `.claude/launch.json` separieren; Artefaktvertrag festhalten         |
| Root Governance & Quality Gates | Tatsaechlichen Repo-Vertrag mit CI, Lint und Branch-Modell synchronisieren | `package.json`, `eslint.config.js`, `pyproject.toml`, `.github/workflows/*.yml`, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md` | Architektur / Schulden         | Dauerhaft rote oder irrefuehrende Gates, falsche Branch-Annahmen, Onboarding-Fehler | Niedrig                | Cluster 1       | Critical   | M       | Ja         | Lint-Scope, Warning-Policy, Python-Test-Einstieg und Branch-Governance auf realen Remote-Zustand abgleichen                                   |
| API & Legacy-Drift              | Backend-Source-of-Truth verbindlich machen                                 | `apps/api/**`, `api.menschlichkeit-oesterreich.at/**`                                                                        | Architektur / Bug / Sicherheit | Vertragsdrift, doppelte Implementationen, unklare Migrationspfade                   | Mittel                 | Cluster 2       | High       | M-L     | Nein       | `apps/api` als autoritativ setzen; Legacy nur noch als Backport-/Stilllegungsflaeche behandeln; OpenAPI-, PII- und Test-Drift inventarisieren |
| App- & Workspace-Topologie      | Produktflaechen, Workspaces und Artefaktpfade entflechten                  | `apps/website/**`, `apps/babylon-game/**`, `apps/game/**`, Root-Workspaces, `openclaw-system/**`                             | Architektur / Schulden         | Build-Drift, unklare Ownership, Artefaktpfade werden wie Quellcode behandelt        | Mittel                 | Cluster 2       | High       | M       | Ja         | Autoritative App-Matrix dokumentieren; `apps/game` klaeren; Workspace-/Build-Vertrag an die reale Topologie anpassen                          |
| Agent-/MCP-/Toolkit-Flaeche     | Tooling-Bereiche sauber in eigene Verantwortungszonen schneiden            | `openclaw-system/**`, `mcp-servers/**`, `.browser-pilot/**`, `.blender-toolkit/**`                                           | Architektur / Bug              | Root-Lint rot trotz unklarer Ownership; Tooling driftet ungesteuert                 | Mittel                 | Cluster 2       | High       | M       | Nein       | Hidden Tooling explizit klassifizieren, Root-Gates auf first-party Scope ziehen, eigene Tooling-Gates definieren                              |
| Vendor-/Mirror-Stewardship      | Externe Codeflaechen kontrolliert betreiben                                | `apps/crm/web/core/**`, `codacy-analysis-cli-master/**` und aehnliche Mirrors                                                | Architektur / Sicherheit       | Upstream-Drift bleibt unsichtbar; lokale Hotfixes werden unwartbar                  | Hoch                   | Cluster 2       | High       | L-XL    | Nein       | Mirror-/Vendor-Inventar erstellen, Patch-Policy aktivieren, lokale Abweichungen nur noch isoliert und begruendet zulassen                     |

## D. Priorisierungslogik

Die Reihenfolge folgt strikt den Regeln aus `PROMPT_ANALYSE.md`:

1. **Stabilisierung vor Optimierung**  
   Ein roter oder widerspruechlicher Repo-Vertrag erzeugt mehr Risiko als einzelne unaufgeraeumte Module.

2. **Entflechtung vor Refactoring**  
   Der aktive Incident-Cluster und DX-Aenderungen duerfen nicht gemeinsam weitergetragen werden.

3. **Blocker vor Folgearbeit**  
   Solange Branch-Governance, Quality-Gates und API-Source-of-Truth nicht geklaert sind, sind groessere Umstrukturierungen teuer und fehleranfaellig.

4. **Kleine sichere Schritte vor grossen Umbauten**  
   Quick Wins liegen nicht in grossen Refactors, sondern im Schliessen der Vertragsluecken:
   - aktiven Worktree entflechten
   - Root-Lint-Vertrag sauber ziehen
   - `main` vs `develop` realistisch dokumentieren
   - `apps/api` als Autoritaet festlegen

5. **Reversibilitaet und Reviewbarkeit**  
   Jeder Cluster ist so geschnitten, dass er separat reviewt und bei Bedarf separat zurueckgenommen werden kann.

## E. Masterplan in Phasen

### Phase 0 - Ausgangslage einfrieren

- Aktuellen Dirty Worktree dokumentieren und nicht ueberschreiben
- Incident-Cluster und DX-Cluster trennen
- Neue Vollanalyse als gemeinsame Referenz etablieren

**Abnahmekriterium:** Alle Beteiligten arbeiten gegen dieselbe Ist-Zustand-Beschreibung.

### Phase 1 - Governance- und Quality-Vertrag schliessen

- Root-Lint-Scope gegen reale Produkt-/Tooling-Ownership ziehen
- Branch-Governance auf Remote-Realitaet abgleichen
- Python-Test-Bootstrap fuer `apps/api` explizit definieren
- CI-/Local-Checks harmonisieren

**Abnahmekriterium:** Ein dokumentierter Satz von Repo-Gates existiert, der denselben Scope lokal und in CI meint.

### Phase 2 - API-Source-of-Truth und Legacy-Pfade entflechten

- `apps/api` als autoritative Backend-Flaeche operationalisieren
- Legacy-Flaeche `api.menschlichkeit-oesterreich.at/` inventarisieren
- OpenAPI-, PII- und Middleware-Drift aufloesen oder als Legacy-Restbestand markieren

**Abnahmekriterium:** Fuer neue API-Arbeit gibt es keine doppelte Entscheidungsbasis mehr.

### Phase 3 - App- und Workspace-Topologie bereinigen

- Aktive Apps, Tooling und Artefaktpfade sauber klassifizieren
- Workspaces, Build-Skripte und Doku auf dieselbe App-Matrix ziehen

**Abnahmekriterium:** Jede aktive Flaeche hat eine eindeutige Build-, Test- und Ownership-Zuordnung.

### Phase 4 - Tooling- und Hidden-Domaenen absichern

- Hidden-Toolkits und MCP-Server als eigene Verantwortungszonen behandeln
- Eigene Quality-Gates oder explizite Root-Ausnahmen definieren

**Abnahmekriterium:** Root-Gates sind wieder aussagekraeftig, ohne verdeckte Domainthemen zu verschweigen.

### Phase 5 - Vendor-/Mirror-Stewardship formalisieren

- Mirror-/Vendor-Inventar erstellen
- Patch-Policy und Backport-Regeln aktivieren
- lokale Divergenzen transparent machen

**Abnahmekriterium:** Externe Codeflaechen koennen bearbeitet werden, ohne First-Party-Signale zu verunreinigen.

## F. Konkrete Abarbeitungsreihenfolge

1. **Aktiven Worktree entflechten**
   - Incident-Artefakte und Incident-Skript in einen eigenen Review-Strang schneiden
   - `.claude/launch.json` separat behandeln
   - Validierung: `git status --short --branch` zeigt klar getrennte Themen

2. **Incident-Artefaktvertrag absichern**
   - `quality-reports/` bleibt Rohdatenquelle
   - `reports/` bleibt publizierter Spiegel
   - Validierung: Script-README, generierte Artefakte und Review-Grenzen stimmen ueberein

3. **Branch-Governance an die Remote-Realitaet anpassen**
   - Doku und Workflows vom impliziten `develop`-Zwang befreien
   - Optional spaeter `develop` bewusst wiederherstellen, aber nicht nebenbei
   - Validierung: Keine Kernanleitung verlangt einen Branch, den das Remote nicht fuehrt

4. **Repo-Quality-Vertrag schliessen**
   - `eslint.config.js`, Root-Skripte und CI auf denselben Scope bringen
   - Hidden-Toolkit-Pfade explizit klassifizieren
   - Validierung: Root-Lint misst das, was das Team tatsaechlich als Root-Verantwortung betrachtet

5. **Python-Test-Bootstrap fuer `apps/api` schliessen**
   - Test-Dependencies und Testpfade explizit machen
   - `pyproject.toml` nicht weiter auf nichtexistente Pfade zeigen lassen
   - Validierung: `cd apps/api && python -m pytest tests -q` ist reproduzierbar startbar

6. **API-Source-of-Truth durchsetzen**
   - `apps/api` ist verbindlich
   - Legacy-Verzeichnis nur noch mit Rueckverweis auf den autoritativen Pfad
   - Validierung: neue API-Arbeit aendert nicht mehr zwei Stellen parallel

7. **OpenAPI-/PII-Drift inventarisieren**
   - `apps/api/openapi.yaml` gegen `api.menschlichkeit-oesterreich.at/openapi.yaml`
   - PII-Library und Middleware in beiden Baeumen vergleichen
   - Validierung: dokumentierte Liste der Legacy-Differenzen liegt vor

8. **App- und Build-Topologie bereinigen**
   - `apps/game` als Artefaktpfad klaeren
   - Root-Workspaces und Doku auf aktive Apps begrenzen
   - Validierung: keine Build-/Lint-Aussage referenziert Phantom-Apps

9. **Tooling-Zonen formalisieren**
   - `.browser-pilot`, `.blender-toolkit`, `mcp-servers`, `openclaw-system` sauber einordnen
   - Validierung: jedes Tooling-Segment hat einen klaren Gate-Eintrag oder eine bewusste Root-Ausnahme

10. **Vendor-/Mirror-Policy aktivieren**
    - `apps/crm/web/core` und andere Mirrors inventarisieren
    - lokale Patches nur noch isoliert und begruendet
    - Validierung: lokale Vendor-Aenderungen sind reviewbar und nachvollziehbar

## G. Durchgefuehrte Verbesserungen

Im Rahmen dieses ersten Durchlaufs wurden bewusst nur Analyse- und Steuerungsverbesserungen umgesetzt:

- Die Repo-weite Vollpruefung wurde auf den Ist-Zustand vom 30.03.2026 aktualisiert.
- Die bisher impliziten Kernentscheidungen wurden verbindlich gemacht:
  - `apps/api` als Backend-Source-of-Truth
  - `main` als operative Integrationsreferenz bis zur bewussten Rueckkehr von `develop`
  - Trennung von Incident-Rohdaten (`quality-reports`) und publizierten Incident-Artefakten (`reports`)
  - Vendor-/Mirror-Patch-Policy
  - Root-Quality-Vertrag mit klarer Trennung von first-party Root-Code und nicht sauber eingebundenem Hidden Tooling
- Die Ausgangslage fuer Folgearbeit ist jetzt reviewbar, clusterfaehig und mit expliziten Abnahmekriterien versehen.

Es wurden absichtlich keine produktiven Code- oder Konfigurationsaenderungen ausserhalb dieses Analyse-Artefakts vorgenommen. Der vorhandene Dirty Worktree blieb unveraendert erhalten.

## H. Offene Risiken / Restpunkte

- Der aktive Incident-Cluster ist noch nicht von der DX-Aenderung `.claude/launch.json` getrennt.
- Der Root-Lint ist weiter rot, solange der Quality-Vertrag nicht technisch nachgezogen wird.
- `apps/api` ist dokumentarisch und testtechnisch noch nicht sauber an den beschlossenen Source-of-Truth angepasst.
- `pyproject.toml` bildet die reale Python-Testlandschaft derzeit nicht korrekt ab.
- Die Governance-Doku nennt weiterhin `develop`; bis zur Bereinigung bleibt das ein operatives Fehlleitsignal.
- Vendor-/Mirror-Code dominiert weiterhin Kennzahlen und Suchtreffer; ohne Stewardship-Umsetzung bleibt diese Verzerrung bestehen.
- Der Incident-Befund fuer `8443` ist aktuell ein separater Verdachtsfall und darf nicht automatisch mit dem selektiven `22/443`-Problem vermischt werden.

## I. Naechster sinnvollster Schritt

Der naechste sinnvolle Umsetzungsschritt ist **Cluster 1: Aktiven Worktree entflechten**.

Konkreter Startpunkt:

1. Incident-Skript und Incident-Publikationsartefakte als eigenen Change-Cluster vorbereiten.
2. `.claude/launch.json` als separaten DX-Change aus dem Incident-Strang herausziehen.
3. Danach direkt in **Cluster 2: Root Governance & Quality Gates** wechseln und den dokumentierten Quality-Vertrag technisch nachziehen.

Erst wenn diese beiden Cluster sauber getrennt und reviewbar sind, lohnt sich die Umsetzung in API-/Topology-/Vendor-Themen.

# Research: n8n Workflow Validitaets-Gate

## Entscheidung 1: Repositoryweiter Scope plus explizites Inventar

- **Decision**: Der produktionsnahe Scope wird repositoryweit betrachtet, aber ueber explizite Legacy-/Mirror-Excludes eingegrenzt; die eigentliche harte JSON-Pruefmenge bleibt inventarbasiert.
- **Rationale**: Damit werden neue relevante Dateien sichtbar (Scope-Transparenz), ohne die reproduzierbare Gate-Logik fuer inventarisierte Dateien zu verlieren.
- **Alternatives considered**:
  - Nur rekursiver `*.json`-Scan unter `automation/n8n/workflows`.
  - Nur statische Inventarliste ohne repositoryweiten Vergleich.
  - Beide Alternativen wurden verworfen, weil entweder Scope-Drift oder blinde Flecken wahrscheinlicher sind.

## Entscheidung 2: Strikte JSON-Validierung bleibt der harte Gate-Kern

- **Decision**: Der Validator prueft jede inventarisierte Datei mit strikt parsebasiertem JSON-Check und liefert Exit-Code 1 bei Fehlern.
- **Rationale**: Der P0-Auftrag fordert syntaktische Belastbarkeit vor allen weiteren n8n-Schritten.
- **Alternatives considered**:
  - Tolerante Parser oder automatische Reparatur.
  - Semantische n8n-Importpruefung im selben Block.
  - Beides verworfen, da dieser Block nur auf harte Syntaxvaliditaet zielt.

## Entscheidung 3: Scope-Abweichungen als Warnung, nicht als Merge-Blocker

- **Decision**: Unerwartete oder fehlende produktionsnahe Dateien aus dem repositoryweiten Vergleich werden als Warnstatus reportet und blockieren den Merge nicht.
- **Rationale**: Das entspricht der expliziten Klarstellungsentscheidung und trennt Scope-Governance von der harten Syntax-Gate-Funktion.
- **Alternatives considered**:
  - Fail-Closed bei jeder Scope-Abweichung.
  - Teilblockade nur fuer priorisierte Workflows.
  - Verworfen, da nicht deckungsgleich mit der gewaehlten Klarstellung.

## Entscheidung 4: Sonderfall `finance-donation-processing.json` als sichtbarer Risikostatus

- **Decision**: Der Sonderfall wird explizit markiert und in der Ausgabe sichtbar gehalten, solange kein Import-/Dry-Run-Nachweis vorliegt.
- **Rationale**: Das verhindert stilles "gruen" bei einem bekannten Risikoobjekt.
- **Alternatives considered**:
  - Datei wie jeden anderen Workflow ohne Sonderhinweis behandeln.
  - Datei aus dem Gate-Scope entfernen.
  - Beide verworfen, da der Auftrag explizite Sichtbarkeit fordert.

## Entscheidung 5: Ein Check, zwei Ausfuehrungsorte (lokal + CI)

- **Decision**: Lokal und CI verwenden denselben Befehl (`npm run n8n:validate`).
- **Rationale**: Ein einziger Ausfuehrungspfad reduziert Abweichungen und erleichtert Reproduktion von Fehlern.
- **Alternatives considered**:
  - Eigenes CI-Skript separat vom lokalen Skript.
  - Direkte JSON-Pruef-Commands nur in GitHub Actions.
  - Verworfen wegen doppelter Wartung und Inkonsistenzrisiko.

## Entscheidung 6: Scope bleibt strikt auf n8n-Artefakte und CI-Gate begrenzt

- **Decision**: Aenderungen beschraenken sich auf `automation/n8n`, `scripts` und `.github/workflows` plus minimal notwendige Doku.
- **Rationale**: Der Auftrag schliesst Azure-Provisioning, Deployment, Queue-Mode und API-Fachlogik explizit aus.
- **Alternatives considered**:
  - Gleichzeitige technische Reparatur von Donation-Logik.
  - Vorbereitung weiterer Betriebsfeatures (Queue, Reverse Proxy, DNS/HTTPS).
  - Verworfen als Nicht-Ziel.

## Ergebnis fuer Phase 1

Alle zuvor relevanten technischen Unklarheiten sind fuer diesen Block aufgeloest: repositoryweiter Scope mit Excludes, Warnmodus fuer Scope-Abweichungen, harte JSON-Validierung, Sonderfall-Sichtbarkeit und CI-Kopplung sind eindeutig festgelegt.

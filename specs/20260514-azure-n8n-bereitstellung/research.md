# Research: n8n Workflow Validitaets-Gate

## Entscheidung 1: Explizites Inventar statt implizitem Dateiscan

- **Decision**: Produktive bzw. produktionsnahe Workflows werden ueber eine explizite Inventardatei gefuehrt.
- **Rationale**: Ein explizites Inventar macht den Scope revisionssicher und verhindert stilles Mitziehen oder Auslassen von Dateien.
- **Alternatives considered**:
	- Nur rekursiver `*.json`-Scan unter `automation/n8n/workflows`.
	- Pattern-Scan mit manuellen Excludes.
	- Beide Alternativen wurden verworfen, weil Scope-Drift schwerer nachvollziehbar ist.

## Entscheidung 2: Strikte JSON-Validierung bleibt der harte Gate-Kern

- **Decision**: Der Validator prueft jede inventarisierte Datei mit strikt parsebasiertem JSON-Check und liefert Exit-Code 1 bei Fehlern.
- **Rationale**: Der P0-Auftrag fordert syntaktische Belastbarkeit vor allen weiteren n8n-Schritten.
- **Alternatives considered**:
	- Tolerante Parser oder automatische Reparatur.
	- Semantische n8n-Importpruefung im selben Block.
	- Beides verworfen, da dieser Block nur auf harte Syntaxvaliditaet zielt.

## Entscheidung 3: Sonderfall `finance-donation-processing.json` als sichtbarer Risikostatus

- **Decision**: Der Sonderfall wird explizit markiert und in der Ausgabe sichtbar gehalten, solange kein Import-/Dry-Run-Nachweis vorliegt.
- **Rationale**: Das verhindert stilles "gruen" bei einem bekannten Risikoobjekt.
- **Alternatives considered**:
	- Datei wie jeden anderen Workflow ohne Sonderhinweis behandeln.
	- Datei aus dem Gate-Scope entfernen.
	- Beide verworfen, da der Auftrag explizite Sichtbarkeit fordert.

## Entscheidung 4: Ein Check, zwei Ausfuehrungsorte (lokal + CI)

- **Decision**: Lokal und CI verwenden denselben Befehl (`npm run n8n:validate`).
- **Rationale**: Ein einziger Ausfuehrungspfad reduziert Abweichungen und erleichtert Reproduktion von Fehlern.
- **Alternatives considered**:
	- Eigenes CI-Skript separat vom lokalen Skript.
	- Direkte JSON-Pruef-Commands nur in GitHub Actions.
	- Verworfen wegen doppelter Wartung und Inkonsistenzrisiko.

## Entscheidung 5: Scope bleibt strikt auf n8n-Artefakte und CI-Gate begrenzt

- **Decision**: Aenderungen beschraenken sich auf `automation/n8n`, `scripts` und `.github/workflows` plus minimal notwendige Doku.
- **Rationale**: Der Auftrag schliesst Azure-Provisioning, Deployment, Queue-Mode und API-Fachlogik explizit aus.
- **Alternatives considered**:
	- Gleichzeitige technische Reparatur von Donation-Logik.
	- Vorbereitung weiterer Betriebsfeatures (Queue, Reverse Proxy, DNS/HTTPS).
	- Verworfen als Nicht-Ziel.

## Ergebnis fuer Phase 1

Alle zuvor relevanten technischen Unklarheiten sind fuer diesen Block aufgeloest: Scope-Quelle, Validierungsstrategie, Sonderfallbehandlung und CI-Kopplung sind eindeutig festgelegt.

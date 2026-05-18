# Research: Azure n8n Produktionspfad Phase 1-2-3

## Entscheidung 1: Azure als einziges Zielbild fuer n8n

- **Decision**: Der Abnahmepfad wird ausschliesslich gegen Azure als Zielarchitektur definiert; Plesk ist nur Altzustand fuer den Umschaltkontext.
- **Rationale**: Vermeidet Parallelarchitektur und widerspruechliche Betriebsannahmen.
- **Alternatives considered**:
  - Hybrider Dauerbetrieb Azure + Plesk.
  - Plesk als Fallback-Zielarchitektur.
  - Beide verworfen, weil sie Verantwortung und Nachweise verwischen.

## Entscheidung 2: Evidenzgetriebener Pfad statt Implementierungsbehauptung

- **Decision**: Jeder Gate-Punkt bekommt einen Evidenztyp (`primary_source`, `live_proof`, `open_checkpoint`) plus Blockerklasse.
- **Rationale**: Spaeteres Go darf nicht auf Dokumentannahmen beruhen.
- **Alternatives considered**:
  - Reine Checklisten ohne Evidenztyp.
  - Vollautomatische Freigabe nur auf CI-Status.
  - Verworfen wegen fehlender Auditierbarkeit.

## Entscheidung 3: Blocker zweistufig klassifizieren

- **Decision**: Es wird zwischen `provisioning_blocker` und `go_live_blocker` unterschieden.
- **Rationale**: Nicht jeder offene Punkt stoppt dieselbe Ebene; Governance wird dadurch klarer.
- **Alternatives considered**:
  - Ein globaler Blockerstatus fuer alles.
  - Keine formale Blockerklassifikation.
  - Verworfen wegen unklarer Eskalationswirkung.

## Entscheidung 4: Expositionsvertrag strikt festziehen

- **Decision**: Oeffentlich bleiben nur `22`, `80`, `443`; `5678`, `5432`, `6379` sind nicht oeffentlich exponierbar.
- **Rationale**: Minimalprinzip fuer Angriffsflaeche und klare Abnahmepruefung.
- **Alternatives considered**:
  - Temporaere Oeffnung von Serviceports fuer Betrieb.
  - Reverse-Proxy-Bypass fuer Troubleshooting.
  - Verworfen als Sicherheits- und Drift-Risiko.

## Entscheidung 5: Erstbetrieb als Single-Main ist zulaessig, aber explizit

- **Decision**: Single-Main wird als zulaessiger Erstbetriebsvertrag dokumentiert; Queue nur per Zusatzvertrag.
- **Rationale**: Schnellere, kontrollierte Inbetriebnahme ohne stillen Skalierungsanspruch.
- **Alternatives considered**:
  - Queue sofort in Phase 1 erzwingen.
  - Betriebsmodus offen lassen.
  - Verworfen wegen Scope-Aufblaehung bzw. Ambiguitaet.

## Entscheidung 6: Backup/Restore als verpflichtendes Go-Gate

- **Decision**: Snapshot, DB-Dump, Secret/Env-Sicherung, Volume-Backup und Restore-Test sind Pflicht vor spaeterem Go.
- **Rationale**: Betriebsfaehigkeit ohne Wiederherstellungsnachweis ist nicht abnahmefaehig.
- **Alternatives considered**:
  - Backup nur als Best-Effort dokumentieren.
  - Restore-Test auf spaeter verschieben.
  - Verworfen wegen hohem Betriebsrisiko.

## Entscheidung 7: Donation-Pilot-Freeze bleibt unveraendert

- **Decision**: Keine Erweiterung von Donation APIv4/n8n-Pilot-Workflow-Scope im Rahmen dieses Vorhabens.
- **Rationale**: Verbindliche Rahmenbedingung: erst autoritative Staging-Validierung, dann weitere Refactors.
- **Alternatives considered**:
  - Nebenbei Workflow-Refactors aufnehmen.
  - KI-Quick-Wins als Parallelstream.
  - Verworfen als explizite Nicht-Ziele.

## Ergebnis

Der Forschungsteil legt ein einziges, evidenzbasiertes Zielbild fuer den Azure-n8n-Kernbetrieb fest. Offene Live-Nachweise bleiben sichtbar und blockieren spaeteres Go entsprechend ihrer Blockerklasse.

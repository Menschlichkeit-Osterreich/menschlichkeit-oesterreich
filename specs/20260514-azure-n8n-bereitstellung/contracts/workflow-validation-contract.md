# Contract: n8n Workflow Validitaets-Gate

## Contract Purpose

Dieser Contract definiert den verbindlichen Pruefvertrag fuer produktionsnahe n8n-Workflows im Repository.

## Scope

### In Scope

- Explizite Inventarisierung produktionsnaher Workflows
- Repositoryweiter Scope-Abgleich mit expliziter Legacy-/Mirror-Exclude-Liste
- Strikte JSON-Syntaxpruefung aller inventarisierten Workflows
- Einheitlicher Ausfuehrungspfad lokal und in CI via `npm run n8n:validate`
- Explizite Sonderfall-Sichtbarkeit fuer `finance-donation-processing.json`

### Out of Scope

- n8n Runtime-Import oder Dry-Run-Nachweis
- Produktives n8n-Deployment
- Azure-Provisioning
- DNS/HTTPS, Reverse Proxy, Queue-Mode
- Fachliche Logikmigration aus `apps/api`

## Invariants

- Der Validierungsscope ist explizit und nicht implizit.
- Jede inventarisierte Datei muss existieren und gueltiges JSON enthalten.
- Eine einzige ungueltige oder fehlende inventarisierte Datei beendet den Lauf mit Fehlerstatus.
- Scope-Abweichungen werden als Warnung reportet und blockieren den Lauf nicht.
- Legacy-/Mirror-Pfade duerfen nicht Teil des Gates sein.
- Der Donation-Sonderfall bleibt sichtbar markiert, solange der Nachweisstatus offen ist.

## Required Evidence

- Inventar-Datei mit nachvollziehbarer Liste der produktionsnahen Workflow-Pfade
- Dokumentierte Scope-Discovery mit Exclude-Liste und Warnausgabe
- Validator-Ausgabe mit Dateipfadbezogenen Ergebnissen
- CI-Job `n8n-json-gate` mit hartem Fail bei Syntaxfehlern
- Doku-Hinweis fuer lokalen Pruefpfad und CI-Verhalten

## Acceptance Gate

Der Contract gilt als erfuellt, wenn:

1. Lokal (`npm run n8n:validate`) und CI identische Validierungslogik ausfuehren,
2. ungueltige inventarisierte Dateien den Lauf reproduzierbar fehlschlagen lassen,
3. Scope-Abweichungen als Warnung sichtbar werden, ohne Merge-Blockade,
4. der Sonderfall `finance-donation-processing.json` explizit sichtbar bleibt.

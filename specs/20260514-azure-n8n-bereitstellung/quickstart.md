# Quickstart: n8n Workflow Validitaets-Gate

## Zweck

Dieser Quickstart zeigt, wie der P0-Validitaets-Check fuer produktionsnahe n8n-Workflows lokal und in CI ausgefuehrt wird.

## Voraussetzungen

- Repository ist ausgecheckt
- Node.js gemaess `package.json` verfuegbar
- Scope-Dateien unter `automation/n8n/workflows` sind vorhanden

## 1) Lokale Validierung

```bash
npm run n8n:validate
```

Erwartetes Verhalten:

- Exit-Code 0 bei gueltiger JSON in allen inventarisierten Workflows.
- Exit-Code 1 bei fehlender oder ungueltiger inventarisierter Datei.
- Dateipfadbezogene Fehlermeldung pro defektem Artefakt.
- Scope-Abweichungen zwischen repositoryweitem Scan und Inventar werden als Warnung ausgegeben.
- Sichtbare Sonderfallmeldung fuer `finance-donation-processing.json`, solange kein Import-/Dry-Run-Nachweis vorliegt.

## 2) CI-Validierung

CI-Workflow: `.github/workflows/n8n-json-gate.yml`

Der Workflow fuehrt denselben Befehl aus:

```bash
npm run n8n:validate
```

Erwartetes Verhalten:

- Pull Requests auf `main` und Pushes auf `main` schlagen fehl, sobald eine inventarisierte Workflow-Datei syntaktisch ungueltig ist.
- Scope-Abweichungen erscheinen als Warnungen, blockieren den Merge aber nicht.
- Bei gueltigem Scope ist der Job gruen.

## 3) Scope-Pflege

Bei Aenderungen an produktionsnahen Workflows:

1. Workflow-Datei unter `automation/n8n/workflows` anlegen/aendern.
2. Inventar-Datei aktualisieren.
3. `npm run n8n:validate` lokal ausfuehren.
4. Erst danach Commit/PR.

## Nicht-Ziele in diesem Block

- Kein n8n-Produktivdeployment
- Kein Azure-Provisioning
- Kein DNS/HTTPS/Reverse-Proxy
- Kein Queue-Mode
- Keine fachliche Verlagerung aus `apps/api`

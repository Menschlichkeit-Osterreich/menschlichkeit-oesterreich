# n8n Workflow JSON Gate

Dieses Verzeichnis verwendet ein striktes JSON-Gate fuer Workflow-Artefakte unter `automation/n8n/workflows/**/*.json`.

## Was geprueft wird

- Jede Workflow-Datei im Scope wird strikt mit JSON-Parse validiert.
- Es gibt keine Auto-Korrektur, kein Reformatting und kein stilles Ueberspringen.
- `automation/n8n/workflows/finance-donation-processing.json` ist Pflichtdatei und muss vorhanden sowie parsebar sein.

## Lokal ausfuehren

```bash
npm run n8n:validate
```

Bei Fehlern endet der Check mit Exit-Code 1 und nennt den betroffenen Dateipfad.

## CI-Ausfuehrung

- Workflow: `.github/workflows/n8n-json-gate.yml`
- Trigger: `pull_request` auf `main`, `push` auf `main`, `workflow_dispatch`
- Step: `npm run n8n:validate`

## Rollout-Hinweis

Dieses Gate ist in Phase 2 des Zwei-Phasen-Rollouts als Required Status Check aktiviert worden, nachdem die Repository-Baseline fuer `npm run n8n:validate` gruen war.

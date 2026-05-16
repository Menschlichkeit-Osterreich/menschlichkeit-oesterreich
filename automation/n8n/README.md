# n8n Workflow JSON Gate

Dieses Verzeichnis verwendet ein inventar-basiertes JSON-Gate fuer Workflow-Artefakte.

- Inventory (Source of Truth): `automation/n8n/workflow-inventory.production.json`
- Scope-Root: `automation/n8n/workflows/**/*.json`

## Was geprueft wird

- Nur inventarisierte Dateien werden streng geparst (deterministische Reihenfolge).
- Fehlende inventarisierte Dateien und JSON-Parsefehler sind harte Fehler (Exit-Code 1).
- Scope-Abweichungen (Datei im Scope, aber nicht im Inventory) werden als `ScopeDeviation` gewaernt, ohne Build zu blockieren.
- `automation/n8n/workflows/finance-donation-processing.json` ist als required workflow hinterlegt.
- Es gibt keine Auto-Korrektur, kein Reformatting und kein stilles Ueberspringen.

## Lokal ausfuehren

```bash
npm run n8n:validate
```

Bei Fehlern endet der Check mit Exit-Code 1 und nennt den betroffenen Dateipfad.
Bei Scope-Abweichungen endet der Check erfolgreich, liefert aber explizite Warnzeilen.

## CI-Ausfuehrung

- Workflow: `.github/workflows/n8n-json-gate.yml`
- Trigger: `pull_request` auf `main`, `push` auf `main`, `workflow_dispatch`
- Step: `npm run n8n:validate`

## Inventory-Pflege

- Neue produktionsnahe Workflow-Dateien muessen in `automation/n8n/workflow-inventory.production.json` unter `workflows` erfasst werden.
- `scope_roots` und `exclude_paths` beschreiben den pruefbaren Repository-Scope.
- `required_workflows` definiert Pflichtdateien, die in Inventory und Scope vorhanden sein muessen.

## Rollout-Hinweis

Dieses Gate ist in Phase 2 des Zwei-Phasen-Rollouts als Required Status Check aktiviert worden, nachdem die Repository-Baseline fuer `npm run n8n:validate` gruen war.

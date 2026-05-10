---
description: 'Read-only Verifikation von BSM-UUID-Mappings fuer produktive Secret-Injektion und Drift-Nachweise'
applyTo: '.github/bsm-secret-ids.json, .github/workflows/reusable-bsm-secrets.yml, .github/actions/bsm-env-inject/action.yml, reports/**/SECRETS*.md, security/**/SECRET*.md, runbooks/**/BSM*.md'
---

# Secret Mapping Verification

Diese Instruction erzwingt konservativen, technischen Nachweis fuer BSM-UUID-Mappings in produktiven Injektionspfaden.

## Pflichtablauf

- Vor jeder Aussage zu UUID-Konsistenz zuerst Mapping-Pfad lesen:
  - `.github/bsm-secret-ids.json`
  - `.github/workflows/reusable-bsm-secrets.yml`
  - `.github/actions/bsm-env-inject/action.yml`
- Danach read-only BSM-Metadatenabgleich je betroffener UUID durchfuehren.
- Erlaubte Ausgabefelder sind ausschliesslich:
  - `id`
  - `key`
  - `projectId`
  - `revisionDate`

## Bewertungslogik

- Wenn Mapping-UUID in BSM `404 Resource not found` liefert, ist der Status `Widerspruechlich`.
- Wenn Owner-UUID existiert, Mapping-UUID aber nicht, liegt technischer Drift vor.
- Bei Drift gilt die technische Mapping-Datei als operative Quelle fuer Workflow-Injektion.

## Reporting-Regeln

- Keine Secret-Werte ausgeben, auch nicht teilweise.
- Keine stille Harmonisierung zwischen Doku und Runtime-Mapping.
- Trenne sauber zwischen:
  - Owner-/Formularnachweis
  - Repo-Runtime-Nachweis
  - Zielsystem-Nachweis

## Verboten

- Keine schreibenden BSM-Operationen in Verifikationslaeufen.
- Keine UUID-Korrekturen ohne expliziten technischen Nachweis.
- Keine Schlussfolgerung aus nur einer Quelle.

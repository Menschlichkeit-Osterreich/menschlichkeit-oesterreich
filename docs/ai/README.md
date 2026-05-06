# AI Read Layer

Diese Struktur stellt versionierte, maschinenlesbare Repo-Intelligence-Artefakte bereit.

> Hinweis zum Scope: Diese Artefakte sind Analyse-Snapshots. Historische Service-Referenzen (inklusive OpenClaw) können darin vorkommen und gelten nicht als aktiver Runtime-Scope.

## Artefakte

- `repo-manifest.json`
- `service-map.json`
- `dependency-graph.json`
- `data-flows.json`
- `entrypoints.json`
- `llms.txt`

## Generierung

```bash
python3 scripts/ai/generate_repo_manifest.py
python3 scripts/ai/generate_service_map.py
python3 scripts/ai/generate_dependency_graph.py
python3 scripts/ai/generate_data_flows.py
python3 scripts/ai/generate_entrypoints.py
```

## Validierung

```bash
python3 -m pip install jsonschema
python3 scripts/ai/validate_ai_artifacts.py
```

## Determinismus

- JSON-Ausgaben werden sortiert und mit stabiler Einrückung geschrieben.
- Ableitungen basieren auf Repository-Dateien (Compose, Workflows, Package/Service-Dateien).
- Unsichere Zuordnungen sind im Feld `assumptions` dokumentiert.

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator

from ai_common import DOCS_AI


SCHEMA_MAP = {
    "repo-manifest.json": "repo-manifest.schema.json",
    "service-map.json": "service-map.schema.json",
    "dependency-graph.json": "dependency-graph.schema.json",
    "data-flows.json": "data-flows.schema.json",
    "entrypoints.json": "entrypoints.schema.json",
}


def _load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def main() -> None:
    errors: list[str] = []
    for artifact_file, schema_file in SCHEMA_MAP.items():
        artifact = DOCS_AI / artifact_file
        schema = DOCS_AI / "schemas" / schema_file
        if not artifact.exists():
            errors.append(f"missing artifact: {artifact}")
            continue
        if not schema.exists():
            errors.append(f"missing schema: {schema}")
            continue

        data = _load_json(artifact)
        schema_data = _load_json(schema)

        validator = Draft202012Validator(schema_data)
        validation_errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
        for err in validation_errors:
            path = "/".join(str(p) for p in err.path)
            errors.append(f"{artifact_file}:{path}: {err.message}")

    if errors:
        raise SystemExit("\n".join(errors))

    print("AI artifacts are valid against JSON Schemas.")


if __name__ == "__main__":
    main()

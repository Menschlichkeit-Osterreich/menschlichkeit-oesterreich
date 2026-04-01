from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PROMPT_DIR = ROOT / ".github" / "prompts"
REGISTRY_PATH = ROOT / ".github" / "ai-registry.json"
MIGRATION_MAP_PATH = PROMPT_DIR / "MIGRATION_MAP.json"
UPDATED_AT = "2026-03-31"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def split_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    frontmatter: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip()

    body = parts[2].lstrip("\n")
    return frontmatter, body


def normalize_target(target: str | None) -> str | None:
    if not target or target.startswith("TBD"):
        return None
    return target


def remove_deprecation_banner(body: str) -> str:
    if not body.startswith("> **DEPRECATED**"):
        return body

    lines = body.splitlines()
    index = 1
    while index < len(lines) and lines[index].strip() == "":
        index += 1
    return "\n".join(lines[index:]).lstrip("\n")


def build_prompt_lookup(registry: dict) -> dict[str, dict]:
    return {entry["path"]: entry for entry in registry.get("prompts", [])}


def render_frontmatter(frontmatter: dict[str, str]) -> str:
    order = [
        "title",
        "description",
        "lastUpdated",
        "status",
        "deprecatedDate",
        "migrationTarget",
        "category",
        "tags",
        "version",
        "language",
        "audience",
    ]

    lines = ["---"]
    for key in order:
        if key in frontmatter:
            lines.append(f"{key}: {frontmatter[key]}")

    for key, value in frontmatter.items():
        if key not in order:
            lines.append(f"{key}: {value}")

    lines.append("---")
    return "\n".join(lines)


def main() -> None:
    registry = load_json(REGISTRY_PATH)
    migration_map = load_json(MIGRATION_MAP_PATH).get("mappings", {})
    prompt_lookup = build_prompt_lookup(registry)

    updated: list[str] = []

    for path in sorted(PROMPT_DIR.rglob("*.prompt.md")):
        rel_path = f".github/{path.relative_to(ROOT / '.github').as_posix()}"
        legacy_key = path.relative_to(ROOT / ".github").as_posix()

        entry = prompt_lookup.get(rel_path, {})
        status = entry.get("status", "active")
        replacement = normalize_target(entry.get("replacement")) or normalize_target(migration_map.get(legacy_key))

        original = path.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(original)

        frontmatter.pop("mode", None)
        frontmatter.pop("tools", None)

        frontmatter.setdefault("title", path.name)
        frontmatter.setdefault("description", "")
        frontmatter.setdefault("version", "1.0.0")
        frontmatter.setdefault("audience", "['Team']")
        frontmatter.setdefault("language", "de-AT")
        frontmatter.setdefault("category", "general")
        frontmatter.setdefault("tags", "['expert']")
        frontmatter["lastUpdated"] = UPDATED_AT

        body = remove_deprecation_banner(body)
        banner = ""

        if status in {"deprecated", "legacy"}:
            frontmatter["status"] = "DEPRECATED"
            frontmatter.setdefault("deprecatedDate", "2025-10-08")
            if replacement:
                frontmatter["migrationTarget"] = replacement
                banner = (
                    f"> **DEPRECATED** — Migriert nach `{replacement}`. "
                    "Diese Datei bleibt nur als Referenz erhalten.\n\n"
                )
            else:
                frontmatter.pop("migrationTarget", None)
        else:
            frontmatter["status"] = "ACTIVE"
            frontmatter.pop("deprecatedDate", None)
            frontmatter.pop("migrationTarget", None)

        new_text = render_frontmatter(frontmatter) + "\n\n" + banner + body.lstrip("\n")

        if new_text != original:
            path.write_text(new_text, encoding="utf-8")
            updated.append(path.as_posix())

    print(f"Updated {len(updated)} files")
    for item in updated:
        print(item)


if __name__ == "__main__":
    main()

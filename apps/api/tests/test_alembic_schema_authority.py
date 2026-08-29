"""Alembic Schema Authority guards (Issue #541 / Masterprompt §13, Release GATE 5).

These are *static* guards — they do NOT require a live database. They enforce
two invariants that keep Alembic the single source of truth for the schema:

1. ``test_alembic_single_head`` — the migration DAG must resolve to exactly one
   head (and one base, with every ``down_revision`` pointing at a real revision).
   This prevents the multi-head divergence that Issue #541 had to repair.

2. ``test_no_new_runtime_ddl`` — application code must not grow *new* runtime DDL
   beyond the known, documented baseline. Schema mutation belongs in
   ``alembic/versions/``; runtime may verify schema but must not mutate it.

The file is intentionally dependency-free (stdlib only) and is also runnable
standalone (``python tests/test_alembic_schema_authority.py``) so it can be
verified without the FastAPI app import chain / a database.
"""
from __future__ import annotations

import ast
import re
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
VERSIONS_DIR = API_ROOT / "alembic" / "versions"
APP_DIR = API_ROOT / "app"

# Known runtime-DDL locations as of main@0f8247a (relative to app/).
# These are the four functions named in Masterprompt §13. This baseline is a
# *ceiling*: the guard fails if application code introduces DDL in any NEW file.
# Migrating one of these into Alembic should SHRINK this set (allowed), never
# grow it. Removing an entry after the DDL is gone is the intended end state.
RUNTIME_DDL_BASELINE = frozenset(
    {
        "audit.py",
        "routers/finance.py",
        "routers/newsletter.py",
        "services/finance_sync_service.py",
    }
)

_DDL_REGEX = re.compile(
    "|".join(
        [
            r"CREATE\s+TABLE",
            r"CREATE\s+(?:UNIQUE\s+)?INDEX",
            r"ALTER\s+TABLE",
            r"DROP\s+TABLE",
            r"DROP\s+INDEX",
            r"def\s+_?ensure_\w*table\w*\s*\(",
            r"def\s+ensure_tables\s*\(",
        ]
    ),
    re.IGNORECASE,
)


def _parse_revisions() -> list[tuple[str, object]]:
    """Return ``[(revision, down_revision), ...]`` parsed statically via AST."""
    pairs: list[tuple[str, object]] = []
    for path in sorted(VERSIONS_DIR.glob("*.py")):
        if path.name.startswith("__"):
            continue
        tree = ast.parse(path.read_text(encoding="utf-8", errors="ignore"), filename=str(path))
        revision: object = None
        down: object = None
        for node in tree.body:
            if not isinstance(node, ast.Assign):
                continue
            for target in node.targets:
                if not isinstance(target, ast.Name):
                    continue
                if target.id == "revision":
                    revision = ast.literal_eval(node.value)
                elif target.id == "down_revision":
                    down = ast.literal_eval(node.value)
        assert isinstance(revision, str), f"{path.name}: missing/invalid `revision`"
        pairs.append((revision, down))
    return pairs


def _flatten_down(down: object) -> tuple[str, ...]:
    if down is None:
        return ()
    if isinstance(down, (tuple, list)):
        return tuple(str(d) for d in down)
    return (str(down),)


def _detect_runtime_ddl() -> set[str]:
    found: set[str] = set()
    for path in sorted(APP_DIR.rglob("*.py")):
        if "__pycache__" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if _DDL_REGEX.search(text):
            found.add(path.relative_to(APP_DIR).as_posix())
    return found


def test_alembic_single_head() -> None:
    pairs = _parse_revisions()
    assert pairs, f"no Alembic revisions found under {VERSIONS_DIR}"

    revisions = [rev for rev, _ in pairs]
    duplicates = {r for r in revisions if revisions.count(r) > 1}
    assert not duplicates, f"duplicate Alembic revision ids: {sorted(duplicates)}"

    revision_set = set(revisions)
    referenced_down: set[str] = set()
    bases: list[str] = []
    for rev, down in pairs:
        flat = _flatten_down(down)
        if not flat:
            bases.append(rev)
        for ref in flat:
            assert ref in revision_set, (
                f"revision {rev!r} has down_revision {ref!r} which does not exist"
            )
            referenced_down.add(ref)

    assert len(bases) == 1, f"expected exactly one base migration, found: {sorted(bases)}"

    heads = revision_set - referenced_down
    assert len(heads) == 1, (
        f"Alembic must have exactly ONE head (Issue #541). Found {len(heads)}: "
        f"{sorted(heads)}. Add a merge migration to reunify the DAG."
    )


def test_no_new_runtime_ddl() -> None:
    found = _detect_runtime_ddl()
    new_offenders = found - RUNTIME_DDL_BASELINE
    assert not new_offenders, (
        "New runtime DDL detected outside the documented baseline: "
        f"{sorted(new_offenders)}. Schema changes must live in alembic/versions/, "
        "not in application runtime code (Masterprompt §13). If this is "
        "intentional and unavoidable, update RUNTIME_DDL_BASELINE with justification."
    )


if __name__ == "__main__":  # pragma: no cover - standalone verification path
    test_alembic_single_head()
    _pairs = _parse_revisions()
    _revs = {r for r, _ in _pairs}
    _refs = {x for _, d in _pairs for x in _flatten_down(d)}
    print(f"[OK] single head = {sorted(_revs - _refs)} ({len(_pairs)} migrations)")
    _found = _detect_runtime_ddl()
    test_no_new_runtime_ddl()
    print(f"[OK] runtime DDL files within baseline: {sorted(_found)}")
    _resolved = RUNTIME_DDL_BASELINE - _found
    if _resolved:
        print(f"[note] baseline entries already cleared (shrink baseline): {sorted(_resolved)}")
    print("ALL GUARDS PASSED")

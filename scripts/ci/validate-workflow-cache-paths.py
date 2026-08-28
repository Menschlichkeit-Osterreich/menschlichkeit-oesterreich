#!/usr/bin/env python3
"""Prueft, dass jeder cache-dependency-path in GitHub-Actions-Workflows existiert.

Hintergrund (Platform-Audit 2026-08-28, Finding P0-002):
``actions/setup-node`` bzw. ``actions/setup-python`` brechen mit
"Some specified paths were not resolved" ab, wenn ``cache-dependency-path``
auf eine nicht vorhandene Datei zeigt. Weil die betroffenen Build-Jobs
``needs``-Vorbedingung des Deploy-Jobs sind, wird das Deployment dann
uebersprungen — ohne dass der Fehler nach Deployment-Problem aussieht.

Genau das hat die Produktions-Pipeline blockiert, nachdem
``apps/website/package-lock.json`` entfernt wurde, der Workflow aber
weiterhin darauf verwiesen hat.

Exit-Code 0 = alle Pfade aufloesbar, 1 = mindestens ein Pfad fehlt.
"""

from __future__ import annotations

import glob
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_DIR = REPO_ROOT / ".github" / "workflows"

# Erfasst sowohl "cache-dependency-path: pfad" als auch YAML-Listeneintraege.
INLINE_RE = re.compile(r"^\s*cache-dependency-path:\s*(?P<value>\S.*?)\s*$")


def _candidates(raw: str) -> list[str]:
    """Zerlegt einen cache-dependency-path-Wert in einzelne Pfadmuster."""
    value = raw.strip().strip("'\"")
    if not value or value in {"|", ">", "|-", ">-"}:
        return []
    # Mehrzeilige Blockskalare werden hier bewusst nicht aufgeloest;
    # sie sind im Repo nicht in Verwendung.
    return [line.strip().strip("'\"") for line in value.splitlines() if line.strip()]


def main() -> int:
    """Prueft alle Workflows und meldet nicht aufloesbare Cache-Pfade."""
    failures: list[str] = []
    checked = 0

    for workflow in sorted(WORKFLOW_DIR.glob("*.yml")) + sorted(
        WORKFLOW_DIR.glob("*.yaml")
    ):
        for lineno, line in enumerate(
            workflow.read_text(encoding="utf-8").splitlines(), start=1
        ):
            match = INLINE_RE.match(line)
            if not match:
                continue
            for pattern in _candidates(match.group("value")):
                # Ausdruecke wie ${{ ... }} sind zur Laufzeit aufgeloest.
                if "${{" in pattern:
                    continue
                checked += 1
                if not glob.glob(str(REPO_ROOT / pattern), recursive=True):
                    failures.append(
                        f"{workflow.relative_to(REPO_ROOT)}:{lineno}: "
                        f"cache-dependency-path '{pattern}' existiert nicht"
                    )

    if failures:
        print("✗ Nicht aufloesbare cache-dependency-path-Eintraege gefunden:")
        for failure in failures:
            print(f"  - {failure}")
        print(
            "\nFolge: setup-node/setup-python schlaegt fehl, abhaengige "
            "Deploy-Jobs werden uebersprungen."
        )
        return 1

    print(f"✓ Alle {checked} cache-dependency-path-Eintraege sind aufloesbar.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

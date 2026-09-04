"""Answer the question "what is actually running here?" from the runtime itself.

The deploy script already writes a release marker next to the application
(``.deploy_release``, containing ``service=… commit=… timestamp=… user=…``),
but nothing read it back.  Without that link, a green pipeline proves that
something was built, not that this process is that build.

This module closes the chain deliberately in the direction that cannot lie:
the value comes from the deployed artefact, not from the repository the
process was built from.  ``COMMIT_SHA`` and ``DEPLOYED_AT`` may override it for
container deployments that have no marker file.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

RELEASE_MARKER_NAME = ".deploy_release"


def _marker_path() -> Path:
    # app/runtime_version.py -> app/ -> apps/api/, where deploy.sh rsyncs to.
    return Path(__file__).resolve().parent.parent / RELEASE_MARKER_NAME


def _parse_marker(text: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for token in text.split():
        key, separator, value = token.partition("=")
        if separator and key:
            fields[key] = value
    return fields


@lru_cache(maxsize=1)
def _release_marker() -> dict[str, str]:
    try:
        return _parse_marker(_marker_path().read_text(encoding="utf-8"))
    except OSError:
        # No marker is a legitimate state (local development, container image
        # without one).  It is reported as "unknown", never guessed.
        return {}


def runtime_version(schema_revision: str | None = None) -> dict[str, str | None]:
    marker = _release_marker()
    return {
        "service": os.getenv("SERVICE_NAME", "moe-api"),
        "git_sha": os.getenv("COMMIT_SHA") or marker.get("commit") or "unknown",
        "build_id": os.getenv("BUILD_ID") or marker.get("timestamp") or "unknown",
        "deployed_at": os.getenv("DEPLOYED_AT") or marker.get("timestamp"),
        "deployed_by": marker.get("user"),
        "schema_revision": schema_revision,
        "environment": os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "unknown",
    }

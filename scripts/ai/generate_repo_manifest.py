from __future__ import annotations

from pathlib import Path

from ai_common import (
    DOCS_AI,
    collect_security_tooling,
    detect_compose_services,
    detect_fastapi_apps,
    dump_json,
    list_workflows,
    run_git,
    utc_now_iso,
)


def main() -> None:
    fastapi_apps = detect_fastapi_apps()
    compose_services = detect_compose_services()

    services = sorted({app.service_root for app in fastapi_apps})
    databases = []
    for _, svc in sorted(compose_services.items()):
        n = svc["service_name"].lower()
        image = svc["image"].lower()
        if "postgres" in n or "postgres" in image:
            databases.append({"name": svc["service_name"], "engine": "postgresql", "evidence": svc["evidence"]})
        if "mariadb" in n or "mariadb" in image:
            databases.append({"name": svc["service_name"], "engine": "mariadb", "evidence": svc["evidence"]})
        if "redis" in n or "redis" in image:
            databases.append({"name": svc["service_name"], "engine": "redis", "evidence": svc["evidence"]})

    artifact_paths = {
        "repo_manifest": "docs/ai/repo-manifest.json",
        "service_map": "docs/ai/service-map.json",
        "dependency_graph": "docs/ai/dependency-graph.json",
        "data_flows": "docs/ai/data-flows.json",
        "entrypoints": "docs/ai/entrypoints.json",
    }

    manifest = {
        "repo_name": Path(run_git(["rev-parse", "--show-toplevel"], default="menschlichkeit-oesterreich-development")).name,
        "default_branch": run_git(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], default="origin/main").replace("origin/", ""),
        "generated_at": run_git(["show", "-s", "--format=%cI", "HEAD^"], default=utc_now_iso()),
        "commit_sha": run_git(["rev-parse", "HEAD^"], default=run_git(["rev-parse", "HEAD"], default="unknown")),
        "services": services,
        "databases": sorted(databases, key=lambda d: (d["engine"], d["name"])),
        "ci_workflows": list_workflows(),
        "docs": ["README.md", "docs/QUICKSTART.md", "docs/compliance/DSGVO-COMPLIANCE-BLUEPRINT.md"],
        "artifact_paths": artifact_paths,
        "security_tooling": collect_security_tooling(),
    }
    dump_json(DOCS_AI / "repo-manifest.json", manifest)


if __name__ == "__main__":
    main()

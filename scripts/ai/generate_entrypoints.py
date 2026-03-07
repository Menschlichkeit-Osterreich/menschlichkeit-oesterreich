from __future__ import annotations

from ai_common import DOCS_AI, detect_compose_services, detect_fastapi_apps, dump_json


def main() -> None:
    compose_services = detect_compose_services()
    entrypoints = []

    for app in detect_fastapi_apps():
        entrypoints.append(
            {
                "service": app.name,
                "entrypoint_type": "python-module",
                "path_or_module": app.path,
                "command": "uvicorn app.main:app",
                "port": 8000,
                "public_or_internal": "internal",
                "evidence": app.evidence,
            }
        )

    for _, svc in sorted(compose_services.items()):
        for port in svc.get("ports", []):
            published = int(port.split(":", 1)[0]) if ":" in port and port.split(":", 1)[0].isdigit() else 0
            entrypoints.append(
                {
                    "service": f"compose:{svc['service_name']}",
                    "entrypoint_type": "container-service",
                    "path_or_module": svc["compose_file"],
                    "command": svc["image"] or svc["build_context"] or "compose-service",
                    "port": published,
                    "public_or_internal": "public" if published in {80, 443, 8080, 8000, 5678} else "internal",
                    "evidence": svc["evidence"],
                }
            )

    dump_json(DOCS_AI / "entrypoints.json", {"entrypoints": sorted(entrypoints, key=lambda x: (x["service"], x["port"], x["path_or_module"]))})


if __name__ == "__main__":
    main()

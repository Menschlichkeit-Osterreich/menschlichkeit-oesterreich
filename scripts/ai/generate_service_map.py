from __future__ import annotations

from ai_common import DOCS_AI, detect_compose_services, detect_fastapi_apps, detect_node_services, dump_json


def main() -> None:
    compose_services = detect_compose_services()
    fastapi_apps = detect_fastapi_apps()
    node_services = detect_node_services()

    services: list[dict] = []

    for app in fastapi_apps:
        matching_ports: list[str] = []
        depends_on: set[str] = set()
        for _, compose in compose_services.items():
            build_context = compose.get("build_context", "")
            if app.service_root in build_context or app.service_root in compose.get("evidence", ""):
                matching_ports.extend(compose.get("ports", []))
                depends_on.update(compose.get("depends_on", []))
        services.append(
            {
                "name": app.name,
                "type": "fastapi",
                "path": app.service_root,
                "entrypoint": app.path,
                "runtime": "python",
                "ports": sorted(set(matching_ports)),
                "depends_on": sorted(depends_on),
                "exposes_endpoints": [app.openapi_url],
                "consumes_endpoints": [],
                "data_stores": ["postgresql", "redis"],
                "trust_boundary": "internal-api",
                "status": "active",
                "assumptions": ["data_stores inferred from compose and repository scripts"],
            }
        )

    # Dev ports per service path (source of truth: CLAUDE.md)
    _DEV_PORTS: dict[str, list[str]] = {
        "apps/website": ["5173"],
        "website": ["5173"],
        "automation/n8n": ["5678"],
    }

    for service in node_services:
        if service["path"] in {".", "website", "apps/website", "automation/n8n"}:
            kind = "n8n" if service["path"].endswith("automation/n8n") else "frontend"
            services.append(
                {
                    "name": service["name"],
                    "type": kind,
                    "path": service["path"],
                    "entrypoint": f"{service['path']}/package.json",
                    "runtime": service["runtime"],
                    "ports": _DEV_PORTS.get(service["path"], []),
                    "depends_on": ["apps-api"],
                    "exposes_endpoints": [],
                    "consumes_endpoints": ["/api"],
                    "data_stores": [],
                    "trust_boundary": "public-edge" if kind == "frontend" else "internal-automation",
                    "status": "active",
                    "assumptions": ["client endpoint consumption inferred from npm scripts and repository layout"],
                }
            )

    if any("apps/crm/docker-compose.yml:drupal" == key for key in compose_services):
        services.append(
            {
                "name": "apps-crm-drupal",
                "type": "drupal",
                "path": "apps/crm",
                "entrypoint": "apps/crm/docker-compose.yml",
                "runtime": "php",
                "ports": ["8000", "8080:80"],
                "depends_on": ["db"],
                "exposes_endpoints": ["/"],
                "consumes_endpoints": [],
                "data_stores": ["mariadb"],
                "trust_boundary": "public-edge",
                "status": "active",
                "assumptions": ["CiviCRM is hosted inside the Drupal runtime"],
            }
        )

    payload = {"services": sorted(services, key=lambda item: item["name"])}
    dump_json(DOCS_AI / "service-map.json", payload)


if __name__ == "__main__":
    main()

from __future__ import annotations

from ai_common import DOCS_AI, detect_compose_services, detect_fastapi_apps, dump_json


def main() -> None:
    compose_services = detect_compose_services()
    fastapi_apps = detect_fastapi_apps()

    nodes = []
    edges = []

    for app in fastapi_apps:
        nodes.append({"id": app.name, "type": "service", "path": app.service_root})

    for key, compose in sorted(compose_services.items()):
        node_id = f"compose:{compose['service_name']}"
        nodes.append({"id": node_id, "type": "container", "path": compose["compose_file"]})
        for dep in compose.get("depends_on", []):
            edges.append(
                {
                    "edge_type": "depends_on",
                    "source": node_id,
                    "target": f"compose:{dep}",
                    "evidence": compose["evidence"],
                    "assumptions": [],
                }
            )

    for app in fastapi_apps:
        for _, compose in compose_services.items():
            if app.service_root in compose.get("build_context", ""):
                edges.append(
                    {
                        "edge_type": "builds",
                        "source": f"compose:{compose['service_name']}",
                        "target": app.name,
                        "evidence": compose["evidence"],
                        "assumptions": [],
                    }
                )

    # Data store inference from service names
    for _, compose in compose_services.items():
        lower_name = compose["service_name"].lower()
        if "postgres" in lower_name or "redis" in lower_name or "mariadb" in lower_name or "db" == lower_name:
            source = f"compose:{compose['service_name']}"
            for app in fastapi_apps:
                edges.append(
                    {
                        "edge_type": "reads_from",
                        "source": app.name,
                        "target": source,
                        "evidence": compose["evidence"],
                        "assumptions": ["database dependency inferred from monorepo service conventions"],
                    }
                )

    payload = {
        "nodes": sorted({(n['id'], n['type'], n['path']) for n in nodes}),
        "edges": sorted(edges, key=lambda e: (e["edge_type"], e["source"], e["target"], e["evidence"])),
    }
    payload["nodes"] = [
        {"id": n[0], "type": n[1], "path": n[2]} for n in payload["nodes"]
    ]
    dump_json(DOCS_AI / "dependency-graph.json", payload)


if __name__ == "__main__":
    main()

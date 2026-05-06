from __future__ import annotations

import json
import re
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_AI = REPO_ROOT / "docs" / "ai"

COMPOSE_CANDIDATES = [
    "docker-compose.yml",
    "docker-compose.prod.yml",
    "apps/crm/docker-compose.yml",
    "automation/n8n/docker-compose.yml",
    "automation/n8n/docker-compose.https.yml",
]


@dataclass(frozen=True)
class FastAPIApp:
    name: str
    path: str
    service_root: str
    openapi_url: str
    evidence: str


def run_git(args: list[str], default: str = "") -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()
    except Exception:
        return default


def utc_now_iso() -> str:
    return (
        datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def dump_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2, sort_keys=True)
        fh.write("\n")


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        loaded = yaml.safe_load(fh) or {}
        if not isinstance(loaded, dict):
            return {}
        return loaded


def list_workflows() -> list[str]:
    workflows_dir = REPO_ROOT / ".github" / "workflows"
    if not workflows_dir.exists():
        return []
    return sorted(str(p.relative_to(REPO_ROOT)) for p in workflows_dir.glob("*.y*ml"))


def detect_compose_services() -> dict[str, dict[str, Any]]:
    services: dict[str, dict[str, Any]] = {}
    for candidate in COMPOSE_CANDIDATES:
        compose_path = REPO_ROOT / candidate
        if not compose_path.exists():
            continue
        content = load_yaml(compose_path)
        compose_services = content.get("services", {})
        if not isinstance(compose_services, dict):
            continue
        for service_name, cfg in compose_services.items():
            if not isinstance(cfg, dict):
                continue
            ports = []
            for port in cfg.get("ports", []) or []:
                ports.append(str(port))
            depends_raw = cfg.get("depends_on", {})
            depends_on = []
            if isinstance(depends_raw, dict):
                depends_on = sorted(depends_raw.keys())
            elif isinstance(depends_raw, list):
                depends_on = sorted(str(x) for x in depends_raw)
            services[f"{candidate}:{service_name}"] = {
                "compose_file": candidate,
                "service_name": service_name,
                "ports": sorted(ports),
                "depends_on": depends_on,
                "build_context": (
                    str(cfg.get("build", {}).get("context", ""))
                    if isinstance(cfg.get("build"), dict)
                    else ""
                ),
                "image": str(cfg.get("image", "")),
                "evidence": f"{candidate}#services.{service_name}",
            }
    return services


def _service_root_for_file(path: Path) -> str:
    rel = path.relative_to(REPO_ROOT)
    parts = rel.parts
    if parts[0] in {"apps", "automation"} and len(parts) >= 2:
        return str(Path(parts[0]) / parts[1])
    if parts[0] == "api.menschlichkeit-oesterreich.at":
        return "api.menschlichkeit-oesterreich.at"
    return str(rel.parent)


def detect_fastapi_apps() -> list[FastAPIApp]:
    apps: list[FastAPIApp] = []
    for py in sorted(REPO_ROOT.rglob("*.py")):
        rel = py.relative_to(REPO_ROOT)
        rel_str = str(rel)
        if rel_str.startswith(
            ("docs/", "node_modules/", ".git/", "codacy-analysis-cli-master/")
        ):
            continue
        text = py.read_text(encoding="utf-8", errors="ignore")
        if "FastAPI(" not in text:
            continue
        if not re.search(r"\bapp\s*=\s*FastAPI\(", text):
            continue
        service_root = _service_root_for_file(py)
        name = service_root.replace("/", "-")
        openapi_url = "/openapi.json"
        if (
            'openapi_url="/api/openapi.json"' in text
            or "openapi_url='/api/openapi.json'" in text
        ):
            openapi_url = "/api/openapi.json"
        apps.append(
            FastAPIApp(
                name=name,
                path=rel_str,
                service_root=service_root,
                openapi_url=openapi_url,
                evidence=f"{rel_str}:FastAPI",
            )
        )
    # dedupe by file path deterministic
    unique: dict[str, FastAPIApp] = {a.path: a for a in apps}
    return [unique[k] for k in sorted(unique.keys())]


def detect_node_services() -> list[dict[str, Any]]:
    services = []
    for pkg in sorted(REPO_ROOT.rglob("package.json")):
        rel = pkg.relative_to(REPO_ROOT)
        if str(rel).startswith(("node_modules/", "codacy-analysis-cli-master/")):
            continue
        try:
            data = json.loads(pkg.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(data, dict):
            continue
        scripts = data.get("scripts", {})
        if not isinstance(scripts, dict):
            scripts = {}
        services.append(
            {
                "name": data.get("name") or rel.parent.name,
                "path": str(rel.parent),
                "runtime": "node",
                "has_dev": "dev" in scripts,
                "has_build": "build" in scripts,
                "evidence": str(rel),
            }
        )
    return sorted(services, key=lambda x: x["path"])


def collect_security_tooling() -> list[str]:
    candidates = {
        "CodeQL": REPO_ROOT / ".github" / "workflows" / "codeql.yml",
        "Dependabot": REPO_ROOT / ".github" / "dependabot.yml",
        "Trivy": REPO_ROOT / ".github" / "workflows" / "trivy.yml",
        "Gitleaks": REPO_ROOT / ".github" / "workflows" / "gitleaks.yml",
        "SBOM": REPO_ROOT / ".github" / "workflows" / "sbom-cyclonedx.yml",
    }
    present = [name for name, path in candidates.items() if path.exists()]
    return sorted(present)

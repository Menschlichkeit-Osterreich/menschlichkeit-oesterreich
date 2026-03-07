#!/usr/bin/env python3
"""
Codespace & Pull Request Status Checker
Prüft warum der Codespace gestoppt wurde und zeigt offene Pull Anforderungen

Usage:
    python3 scripts/codespace-status-check.py
    python3 scripts/codespace-status-check.py --verbose
    python3 scripts/codespace-status-check.py --json
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


class CodespaceStatusChecker:
    """Überprüft Codespace Status und Pull Requests"""

    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path.cwd()
        self.github_token = os.getenv("GITHUB_TOKEN")
        self.github_repo = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
        self.results = {}

    def is_codespace(self) -> bool:
        """Prüft ob wir in einem GitHub Codespace laufen"""
        return (
            os.getenv("CODESPACES") == "true"
            or os.getenv("CODESPACE_NAME") is not None
        )

    def check_codespace_status(self) -> Dict[str, Any]:
        """Prüft Codespace Status"""
        status = {
            "is_codespace": self.is_codespace(),
            "codespace_name": os.getenv("CODESPACE_NAME", "N/A"),
            "github_token_available": self.github_token is not None,
            "environment_vars": {},
        }

        # Wichtige Umgebungsvariablen
        env_vars = [
            "CODESPACES",
            "CODESPACE_NAME",
            "GITHUB_REPOSITORY",
            "GITHUB_REPOSITORY_OWNER",
            "GITHUB_USER",
        ]

        for var in env_vars:
            status["environment_vars"][var] = os.getenv(var, "Not set")

        return status

    def check_service_status(self, service: str, port: int) -> Dict[str, Any]:
        """Prüft ob ein Service läuft"""
        try:
            # Versuche Port zu verbinden
            result = subprocess.run(
                ["lsof", "-i", f":{port}"],
                capture_output=True,
                text=True,
                timeout=5,
            )

            if result.returncode == 0 and result.stdout.strip():
                return {
                    "service": service,
                    "port": port,
                    "status": "running",
                    "details": "Service is active",
                }
            else:
                return {
                    "service": service,
                    "port": port,
                    "status": "stopped",
                    "details": "Service not running on port",
                }
        except subprocess.TimeoutExpired:
            return {
                "service": service,
                "port": port,
                "status": "timeout",
                "details": "Check timed out",
            }
        except FileNotFoundError:
            # lsof nicht verfügbar, versuche netstat
            try:
                result = subprocess.run(
                    ["netstat", "-tuln"],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                if f":{port}" in result.stdout:
                    return {
                        "service": service,
                        "port": port,
                        "status": "running",
                        "details": "Service is active (via netstat)",
                    }
                else:
                    return {
                        "service": service,
                        "port": port,
                        "status": "stopped",
                        "details": "Service not running on port",
                    }
            except Exception as e:
                return {
                    "service": service,
                    "port": port,
                    "status": "unknown",
                    "details": f"Could not determine status: {e}",
                }
        except Exception as e:
            return {
                "service": service,
                "port": port,
                "status": "error",
                "details": str(e),
            }

    def check_all_services(self) -> Dict[str, Any]:
        """Prüft alle Development Services"""
        services = [
            ("Frontend (Vite)", 5173),
            ("API (FastAPI)", 8001),
            ("CRM (PHP)", 8000),
            ("Games", 3000),
        ]

        results = []
        for service_name, port in services:
            results.append(self.check_service_status(service_name, port))

        return {"services": results}

    def get_open_pull_requests(self) -> Dict[str, Any]:
        """Holt offene Pull Requests via GitHub API"""
        if not self.github_token:
            return {
                "error": "GITHUB_TOKEN nicht verfügbar",
                "recommendation": "Setze GITHUB_TOKEN environment variable",
            }

        try:
            result = subprocess.run(
                [
                    "curl",
                    "-s",
                    "-H",
                    f"Authorization: Bearer {self.github_token}",
                    f"https://api.github.com/repos/{self.github_repo}/pulls?state=open&per_page=20",
                ],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if result.returncode == 0:
                prs = json.loads(result.stdout)
                if isinstance(prs, list):
                    pr_list = []
                    for pr in prs:
                        pr_list.append(
                            {
                                "number": pr.get("number"),
                                "title": pr.get("title"),
                                "state": pr.get("state"),
                                "created_at": pr.get("created_at"),
                                "user": pr.get("user", {}).get("login"),
                                "url": pr.get("html_url"),
                            }
                        )
                    return {"pull_requests": pr_list, "count": len(pr_list)}
                else:
                    return {"error": "Unexpected API response", "response": prs}
            else:
                return {"error": "API request failed", "stderr": result.stderr}

        except json.JSONDecodeError as e:
            return {"error": f"JSON decode error: {e}"}
        except Exception as e:
            return {"error": f"Error fetching PRs: {e}"}

    def get_recent_workflow_runs(self) -> Dict[str, Any]:
        """Holt letzte GitHub Actions Workflow Runs"""
        if not self.github_token:
            return {
                "error": "GITHUB_TOKEN nicht verfügbar",
                "recommendation": "Setze GITHUB_TOKEN environment variable",
            }

        try:
            result = subprocess.run(
                [
                    "curl",
                    "-s",
                    "-H",
                    f"Authorization: Bearer {self.github_token}",
                    f"https://api.github.com/repos/{self.github_repo}/actions/runs?per_page=10",
                ],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if result.returncode == 0:
                data = json.loads(result.stdout)
                if "workflow_runs" in data:
                    runs = []
                    for run in data["workflow_runs"]:
                        runs.append(
                            {
                                "id": run.get("id"),
                                "name": run.get("name"),
                                "status": run.get("status"),
                                "conclusion": run.get("conclusion"),
                                "created_at": run.get("created_at"),
                                "url": run.get("html_url"),
                            }
                        )
                    return {"workflow_runs": runs, "count": len(runs)}
                else:
                    return {"error": "No workflow_runs in response", "response": data}
            else:
                return {"error": "API request failed", "stderr": result.stderr}

        except json.JSONDecodeError as e:
            return {"error": f"JSON decode error: {e}"}
        except Exception as e:
            return {"error": f"Error fetching workflow runs: {e}"}

    def check_system_resources(self) -> Dict[str, Any]:
        """Prüft System-Ressourcen"""
        resources = {}

        try:
            # Disk usage
            result = subprocess.run(
                ["df", "-h", "."], capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                if len(lines) >= 2:
                    parts = lines[1].split()
                    if len(parts) >= 5:
                        resources["disk"] = {
                            "size": parts[1],
                            "used": parts[2],
                            "available": parts[3],
                            "use_percent": parts[4],
                        }
        except Exception as e:
            resources["disk"] = {"error": str(e)}

        try:
            # Memory usage
            result = subprocess.run(
                ["free", "-h"], capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                if len(lines) >= 2:
                    parts = lines[1].split()
                    if len(parts) >= 7:
                        resources["memory"] = {
                            "total": parts[1],
                            "used": parts[2],
                            "free": parts[3],
                            "available": parts[6] if len(parts) > 6 else parts[3],
                        }
        except Exception as e:
            resources["memory"] = {"error": str(e)}

        try:
            # CPU info
            result = subprocess.run(
                ["nproc"], capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                resources["cpu_cores"] = result.stdout.strip()
        except Exception as e:
            resources["cpu_cores"] = {"error": str(e)}

        return resources

    def generate_recommendations(self) -> List[str]:
        """Generiert Empfehlungen basierend auf Status"""
        recommendations = []

        # Check if in codespace
        if not self.is_codespace():
            recommendations.append(
                "⚠️  Nicht in GitHub Codespace - lokale Entwicklung erkannt"
            )

        # Check services
        services = self.results.get("services", {}).get("services", [])
        stopped_services = [s for s in services if s.get("status") == "stopped"]

        if stopped_services:
            recommendations.append(
                f"🔴 {len(stopped_services)} Service(s) gestoppt - verwende 'npm run dev:all' zum Starten"
            )

        # Check GitHub token
        if not self.github_token:
            recommendations.append(
                "⚠️  GITHUB_TOKEN nicht gesetzt - PR und Workflow Informationen nicht verfügbar"
            )

        # Check open PRs
        prs = self.results.get("pull_requests", {})
        if "pull_requests" in prs and len(prs["pull_requests"]) > 0:
            recommendations.append(
                f"📋 {len(prs['pull_requests'])} offene Pull Request(s) gefunden"
            )

        return recommendations

    def run_full_check(self) -> Dict[str, Any]:
        """Führt vollständige Überprüfung durch"""
        print("🔍 Starte Codespace & PR Status Check...\n")

        # Codespace Status
        print("📦 Prüfe Codespace Umgebung...")
        self.results["codespace"] = self.check_codespace_status()

        # Service Status
        print("🚀 Prüfe Development Services...")
        self.results["services"] = self.check_all_services()

        # Pull Requests
        print("📋 Hole offene Pull Requests...")
        self.results["pull_requests"] = self.get_open_pull_requests()

        # Workflow Runs
        print("⚙️  Hole letzte Workflow Runs...")
        self.results["workflow_runs"] = self.get_recent_workflow_runs()

        # System Resources
        print("💻 Prüfe System-Ressourcen...")
        self.results["system"] = self.check_system_resources()

        # Recommendations
        self.results["recommendations"] = self.generate_recommendations()

        self.results["timestamp"] = datetime.now().isoformat()

        return self.results

    def print_results(self, verbose: bool = False):
        """Druckt Ergebnisse formatiert"""
        print("\n" + "=" * 80)
        print("📊 CODESPACE & PULL REQUEST STATUS REPORT")
        print("=" * 80)
        print(f"⏰ Zeit: {self.results.get('timestamp', 'N/A')}")
        print()

        # Codespace Status
        cs = self.results.get("codespace", {})
        print("📦 CODESPACE STATUS:")
        print(
            f"   {'✅' if cs.get('is_codespace') else '❌'} In Codespace: {cs.get('is_codespace')}"
        )
        print(f"   📝 Name: {cs.get('codespace_name', 'N/A')}")
        print(
            f"   🔑 GitHub Token: {'✅ Verfügbar' if cs.get('github_token_available') else '❌ Nicht verfügbar'}"
        )

        if verbose:
            print("\n   Umgebungsvariablen:")
            for key, value in cs.get("environment_vars", {}).items():
                print(f"     {key}: {value}")

        # Services
        print("\n🚀 DEVELOPMENT SERVICES:")
        services = self.results.get("services", {}).get("services", [])
        for service in services:
            status_icon = (
                "✅" if service.get("status") == "running" else "🔴"
            )
            print(
                f"   {status_icon} {service.get('service'):20} Port {service.get('port'):5} - {service.get('status').upper():10} - {service.get('details')}"
            )

        # Pull Requests
        print("\n📋 OFFENE PULL REQUESTS:")
        prs = self.results.get("pull_requests", {})
        if "pull_requests" in prs:
            if prs["pull_requests"]:
                for pr in prs["pull_requests"]:
                    print(
                        f"   #{pr.get('number'):4} {pr.get('title')[:60]:60} by {pr.get('user')}"
                    )
                    if verbose:
                        print(f"        URL: {pr.get('url')}")
                        print(f"        Created: {pr.get('created_at')}")
            else:
                print("   ✅ Keine offenen Pull Requests")
        else:
            print(f"   ⚠️  {prs.get('error', 'Unknown error')}")
            if "recommendation" in prs:
                print(f"      💡 {prs.get('recommendation')}")

        # Workflow Runs
        print("\n⚙️  LETZTE WORKFLOW RUNS:")
        runs = self.results.get("workflow_runs", {})
        if "workflow_runs" in runs:
            for run in runs["workflow_runs"][:5]:  # Nur die letzten 5
                status_icon = "✅" if run.get("conclusion") == "success" else "❌"
                print(
                    f"   {status_icon} {run.get('name'):40} {run.get('status'):12} {run.get('conclusion') or 'N/A':10}"
                )
                if verbose:
                    print(f"      URL: {run.get('url')}")
        else:
            print(f"   ⚠️  {runs.get('error', 'Unknown error')}")

        # System Resources
        if verbose:
            print("\n💻 SYSTEM-RESSOURCEN:")
            sys_res = self.results.get("system", {})
            if "disk" in sys_res and "error" not in sys_res["disk"]:
                disk = sys_res["disk"]
                print(
                    f"   💾 Disk: {disk.get('used')} / {disk.get('size')} ({disk.get('use_percent')})"
                )
            if "memory" in sys_res and "error" not in sys_res["memory"]:
                mem = sys_res["memory"]
                print(
                    f"   🧠 Memory: {mem.get('used')} / {mem.get('total')} (Available: {mem.get('available')})"
                )
            if "cpu_cores" in sys_res and not isinstance(sys_res["cpu_cores"], dict):
                print(f"   ⚡ CPU Cores: {sys_res['cpu_cores']}")

        # Recommendations
        print("\n💡 EMPFEHLUNGEN:")
        for rec in self.results.get("recommendations", []):
            print(f"   {rec}")

        print("\n" + "=" * 80)

    def save_json(self, output_path: Path):
        """Speichert Ergebnisse als JSON"""
        with open(output_path, "w") as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Ergebnisse gespeichert: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Codespace & Pull Request Status Checker"
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Zeige detaillierte Informationen"
    )
    parser.add_argument(
        "-j",
        "--json",
        metavar="FILE",
        help="Speichere Ergebnisse als JSON (z.B. status.json)",
    )

    args = parser.parse_args()

    checker = CodespaceStatusChecker()
    checker.run_full_check()
    checker.print_results(verbose=args.verbose)

    if args.json:
        checker.save_json(Path(args.json))

    # Exit code basierend auf Service Status
    services = checker.results.get("services", {}).get("services", [])
    stopped_services = [s for s in services if s.get("status") == "stopped"]

    if stopped_services:
        sys.exit(1)  # Error if services are stopped
    else:
        sys.exit(0)  # Success


if __name__ == "__main__":
    main()

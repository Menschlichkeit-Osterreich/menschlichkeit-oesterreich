#!/usr/bin/env python3
"""
Einfaches Log-Monitor Dashboard für Menschlichkeit Österreich
Zentralisiertes Monitoring mit Real-Time Updates
"""

import json
import logging
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleLogMonitor:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.status = {}

    def check_service_status(self, service: str) -> Dict[str, Any]:
        """Prüfe Status eines Services"""
        status = {
            "name": service,
            "status": "unknown",
            "last_check": datetime.now().isoformat(),
            "issues": [],
            "recommendations": [],
        }

        # Service-spezifische Checks
        if service == "vscode":
            status.update(self._check_vscode())
        elif service == "api":
            status.update(self._check_api())
        elif service == "crm":
            status.update(self._check_crm())
        elif service == "frontend":
            status.update(self._check_frontend())
        elif service == "n8n":
            status.update(self._check_n8n())
        elif service == "deployment":
            status.update(self._check_deployment())

        return status

    def _check_vscode(self) -> Dict[str, Any]:
        """Prüfe VS Code Status"""
        try:
            # Prüfe ob VS Code läuft
            # Fixed: Removed shell=True to prevent command injection (B602)
            result = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq Code*"],
                capture_output=True,
                text=True,
                shell=False,
            )

            if "Code" in result.stdout:
                return {"status": "running", "details": "VS Code is running"}
            else:
                return {
                    "status": "stopped",
                    "details": "VS Code not running",
                    "recommendations": ["Start VS Code Insiders"],
                }

        except Exception as e:
            return {
                "status": "error",
                "details": f"Error checking VS Code: {e}",
                "issues": ["Cannot check VS Code status"],
            }

    def _check_api(self) -> Dict[str, Any]:
        """Prüfe API Status"""
        api_dir = self.project_root / "api.menschlichkeit-oesterreich.at"

        if not api_dir.exists():
            return {
                "status": "missing",
                "details": "API directory not found",
                "issues": ["API directory missing"],
            }

        # Prüfe requirements.txt
        requirements_file = api_dir / "requirements.txt"
        if not requirements_file.exists():
            return {
                "status": "incomplete",
                "details": "Requirements file missing",
                "issues": ["No requirements.txt found"],
                "recommendations": ["Create requirements.txt"],
            }

        return {"status": "ready", "details": "API directory structure looks good"}

    def _check_crm(self) -> Dict[str, Any]:
        """Prüfe CRM Status"""
        crm_dir = self.project_root / "crm.menschlichkeit-oesterreich.at"

        if not crm_dir.exists():
            return {
                "status": "missing",
                "details": "CRM directory not found",
                "issues": ["CRM directory missing"],
            }

        # Prüfe composer.json
        composer_file = crm_dir / "composer.json"
        if not composer_file.exists():
            return {
                "status": "incomplete",
                "details": "Composer file missing",
                "issues": ["No composer.json found"],
                "recommendations": ["Run composer init"],
            }

        return {"status": "ready", "details": "CRM directory structure looks good"}

    def _check_frontend(self) -> Dict[str, Any]:
        """Prüfe Frontend Status"""
        frontend_dir = self.project_root / "frontend"

        if not frontend_dir.exists():
            return {
                "status": "missing",
                "details": "Frontend directory not found",
                "issues": ["Frontend directory missing"],
            }

        # Prüfe package.json
        package_file = frontend_dir / "package.json"
        if not package_file.exists():
            return {
                "status": "incomplete",
                "details": "Package.json missing",
                "issues": ["No package.json found"],
                "recommendations": ["Run npm init"],
            }

        return {"status": "ready", "details": "Frontend directory structure looks good"}

    def _check_n8n(self) -> Dict[str, Any]:
        """Prüfe n8n Status"""
        n8n_dir = self.project_root / "automation" / "n8n"

        if not n8n_dir.exists():
            return {
                "status": "missing",
                "details": "n8n directory not found",
                "issues": ["n8n directory missing"],
            }

        return {"status": "ready", "details": "n8n directory found"}

    def _check_deployment(self) -> Dict[str, Any]:
        """Prüfe Deployment Status"""
        scripts_dir = self.project_root / "deployment-scripts"

        if not scripts_dir.exists():
            return {
                "status": "missing",
                "details": "Deployment scripts not found",
                "issues": ["Deployment scripts missing"],
            }

        # Zähle Scripts
        script_files = list(scripts_dir.glob("*.sh"))

        return {
            "status": "ready",
            "details": f"Found {len(script_files)} deployment scripts",
        }

    def run_monitoring_cycle(self):
        """Führe einen Monitoring-Zyklus aus"""
        services = ["vscode", "api", "crm", "frontend", "n8n", "deployment"]

        print("\n" + "=" * 60)
        print("🔍 MENSCHLICHKEIT ÖSTERREICH - SERVICE MONITOR")
        print("=" * 60)
        print(f"⏰ Check Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        overall_status = "healthy"

        for service in services:
            status = self.check_service_status(service)
            self.status[service] = status

            # Status Icon
            status_icons = {
                "running": "✅",
                "ready": "🟢",
                "stopped": "🟡",
                "incomplete": "🟠",
                "missing": "🔴",
                "error": "🚨",
                "unknown": "❓",
            }

            icon = status_icons.get(status["status"], "❓")

            print(
                f"{icon} {service.upper():12} | "
                f"Status: {status['status']:10} | "
                f"{status.get('details', 'No details')}"
            )

            # Issues anzeigen
            if status.get("issues"):
                for issue in status["issues"]:
                    print(f"    ⚠️  {issue}")
                if status["status"] in ["error", "missing"]:
                    overall_status = "critical"
                elif (
                    status["status"] in ["stopped", "incomplete"]
                    and overall_status != "critical"
                ):
                    overall_status = "warning"

            # Recommendations anzeigen
            if status.get("recommendations"):
                for rec in status["recommendations"]:
                    print(f"    💡 {rec}")

        # Gesamtstatus
        status_colors = {
            "healthy": "✅ HEALTHY",
            "warning": "⚠️ WARNING",
            "critical": "🚨 CRITICAL",
        }

        print(f"\n📊 OVERALL STATUS: {status_colors[overall_status]}")
        print("=" * 60)

        return overall_status

    def start_continuous_monitoring(self, interval: int = 30):
        """Starte kontinuierliches Monitoring"""
        print("🔄 Starting continuous monitoring...")
        print(f"   Check interval: {interval} seconds")
        print("   Press Ctrl+C to stop")

        try:
            while True:
                self.run_monitoring_cycle()

                print(f"\n⏳ Next check in {interval} seconds...")
                time.sleep(interval)

        except KeyboardInterrupt:
            print("\n\n👋 Monitoring stopped by user")
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")

    def save_status_report(self, filename: str = None):
        """Speichere aktuellen Status als JSON Report"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"service-status-{timestamp}.json"

        report = {
            "timestamp": datetime.now().isoformat(),
            "services": self.status,
            "summary": {
                "total_services": len(self.status),
                "healthy_services": len(
                    [
                        s
                        for s in self.status.values()
                        if s["status"] in ["running", "ready"]
                    ]
                ),
                "issues_count": sum(
                    len(s.get("issues", [])) for s in self.status.values()
                ),
            },
        }

        output_file = self.project_root / filename
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"📄 Status report saved: {filename}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Simple Log Monitor")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument(
        "--interval", type=int, default=30, help="Check interval in seconds"
    )
    parser.add_argument("--save", action="store_true", help="Save status report")

    args = parser.parse_args()

    monitor = SimpleLogMonitor()

    if args.once:
        overall_status = monitor.run_monitoring_cycle()

        if args.save:
            monitor.save_status_report()

        # Exit code basierend auf Status
        if overall_status == "critical":
            exit(2)
        elif overall_status == "warning":
            exit(1)
        else:
            exit(0)
    else:
        monitor.start_continuous_monitoring(args.interval)


if __name__ == "__main__":
    main()

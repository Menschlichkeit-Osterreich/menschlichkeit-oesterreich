#!/usr/bin/env python3
"""
Optimiertes Service Monitor Dashboard für Menschlichkeit Österreich
Real-Time Monitoring mit Performance-Optimierung und Austrian Branding
"""

import json
import logging
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

# Logging Setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Austrian NGO Branding Colors
COLORS = {
    "red": "\033[31m",  # Austrian Red
    "white": "\033[37m",  # Austrian White
    "reset": "\033[0m",  # Reset
    "green": "\033[32m",  # Success
    "yellow": "\033[33m",  # Warning
    "bold": "\033[1m",  # Bold
}


class OptimizedServiceMonitor:
    """Optimiertes Service Monitoring für Multi-Service Architecture"""

    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path(__file__).parent.parent
        self.status_cache = {}
        self.last_check = {}

        # Service Configuration
        self.services = {
            "vscode": {
                "name": "VS Code Insiders",
                "check_method": self._check_vscode_status,
                "priority": "high",
            },
            "api": {
                "name": "FastAPI Service",
                "check_method": self._check_api_service,
                "priority": "high",
            },
            "crm": {
                "name": "CRM (Drupal+CiviCRM)",
                "check_method": self._check_crm_service,
                "priority": "high",
            },
            "frontend": {
                "name": "React Frontend",
                "check_method": self._check_frontend_service,
                "priority": "medium",
            },
            "n8n": {
                "name": "n8n Automation",
                "check_method": self._check_n8n_service,
                "priority": "medium",
            },
            "deployment": {
                "name": "Deployment Scripts",
                "check_method": self._check_deployment_tools,
                "priority": "low",
            },
        }

    def _colorize(self, text: str, color: str) -> str:
        """Colorize text for Austrian NGO branding"""
        return f"{COLORS.get(color, '')}{text}{COLORS['reset']}"

    def _format_status_icon(self, status: str) -> str:
        """Format status with Austrian-themed icons"""
        icons = {
            "running": self._colorize("🇦🇹", "red"),  # Austrian flag for running
            "ready": self._colorize("✅", "green"),  # Ready
            "warning": self._colorize("⚠️", "yellow"),  # Warning
            "stopped": self._colorize("🔴", "red"),  # Stopped
            "error": self._colorize("🚨", "red"),  # Error
            "missing": self._colorize("❌", "red"),  # Missing
            "unknown": self._colorize("❓", "white"),  # Unknown
        }
        return icons.get(status, icons["unknown"])

    def _check_vscode_status(self) -> Dict[str, Any]:
        """Check VS Code Insiders Status"""
        try:
            # Check for VS Code Insiders process
            # Fixed: Removed shell=True to prevent command injection (B602)
            result = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq Code*"],
                capture_output=True,
                text=True,
                shell=False,
                timeout=5,
            )

            if "Code" in result.stdout:
                return {
                    "status": "running",
                    "details": "VS Code Insiders active",
                    "metrics": {"processes": result.stdout.count("Code")},
                }
            else:
                return {
                    "status": "stopped",
                    "details": "VS Code Insiders not running",
                    "recommendations": ["Start VS Code Insiders"],
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "error",
                "details": "Process check timeout",
                "issues": ["System performance issues detected"],
            }
        except Exception as e:
            return {
                "status": "error",
                "details": f"Check failed: {e}",
                "issues": [f"Cannot verify VS Code status: {e}"],
            }

    def _check_api_service(self) -> Dict[str, Any]:
        """Check FastAPI Service Status"""
        api_dir = self.project_root / "api.menschlichkeit-oesterreich.at"

        if not api_dir.exists():
            return {
                "status": "missing",
                "details": "API directory not found",
                "issues": ["API service not configured"],
            }

        # Check requirements and main files
        req_file = api_dir / "requirements.txt"
        main_file = api_dir / "app" / "main.py"

        status_info = {
            "status": "ready",
            "details": "API structure verified",
            "metrics": {},
        }

        if not req_file.exists():
            status_info.update(
                {
                    "status": "warning",
                    "issues": ["Missing requirements.txt"],
                    "recommendations": ["Create requirements.txt file"],
                }
            )

        if not main_file.exists():
            status_info.update(
                {
                    "status": "warning",
                    "issues": status_info.get("issues", []) + ["Missing main.py"],
                    "recommendations": status_info.get("recommendations", [])
                    + ["Create FastAPI app"],
                }
            )

        return status_info

    def _check_crm_service(self) -> Dict[str, Any]:
        """Check CRM (Drupal + CiviCRM) Status"""
        crm_dir = self.project_root / "crm.menschlichkeit-oesterreich.at"

        if not crm_dir.exists():
            return {
                "status": "missing",
                "details": "CRM directory not found",
                "issues": ["CRM service not configured"],
            }

        # Check essential CRM files
        composer_file = crm_dir / "composer.json"
        docker_file = crm_dir / "docker-compose.yml"

        metrics = {
            "composer_json": composer_file.exists(),
            "docker_compose": docker_file.exists(),
        }

        if composer_file.exists() and docker_file.exists():
            return {
                "status": "ready",
                "details": "CRM structure complete",
                "metrics": metrics,
            }
        else:
            return {
                "status": "warning",
                "details": "CRM setup incomplete",
                "issues": [
                    f
                    for f, exists in [
                        ("composer.json missing", not composer_file.exists()),
                        ("docker-compose.yml missing", not docker_file.exists()),
                    ]
                    if exists
                ],
                "recommendations": ["Complete CRM setup"],
            }

    def _check_frontend_service(self) -> Dict[str, Any]:
        """Check React Frontend Status"""
        frontend_dir = self.project_root / "frontend"

        if not frontend_dir.exists():
            return {
                "status": "missing",
                "details": "Frontend directory not found",
                "issues": ["Frontend service not configured"],
            }

        # Check frontend essentials
        package_file = frontend_dir / "package.json"
        src_dir = frontend_dir / "src"

        if package_file.exists():
            return {
                "status": "ready",
                "details": "Frontend structure verified",
                "metrics": {"package_json": True, "src_directory": src_dir.exists()},
            }
        else:
            return {
                "status": "warning",
                "details": "Frontend setup incomplete",
                "issues": ["Missing package.json"],
                "recommendations": ["Initialize React project"],
            }

    def _check_n8n_service(self) -> Dict[str, Any]:
        """Check n8n Automation Status"""
        n8n_dir = self.project_root / "automation" / "n8n"

        if not n8n_dir.exists():
            return {
                "status": "missing",
                "details": "n8n directory not found",
                "issues": ["Automation service not configured"],
            }

        # Check n8n files
        webhook_client = n8n_dir / "webhook-client.py"

        return {
            "status": "ready",
            "details": "n8n automation configured",
            "metrics": {
                "webhook_client": webhook_client.exists(),
                "workflows": len(list(n8n_dir.glob("*.json"))),
            },
        }

    def _check_deployment_tools(self) -> Dict[str, Any]:
        """Check Deployment Scripts Status"""
        scripts_dir = self.project_root / "deployment-scripts"

        if not scripts_dir.exists():
            return {
                "status": "missing",
                "details": "Deployment scripts not found",
                "issues": ["Deployment tools not configured"],
            }

        # Count deployment scripts
        shell_scripts = list(scripts_dir.glob("*.sh"))
        powershell_scripts = list(scripts_dir.glob("*.ps1"))

        total_scripts = len(shell_scripts) + len(powershell_scripts)

        if total_scripts > 0:
            return {
                "status": "ready",
                "details": f"{total_scripts} deployment scripts found",
                "metrics": {
                    "shell_scripts": len(shell_scripts),
                    "powershell_scripts": len(powershell_scripts),
                },
            }
        else:
            return {
                "status": "warning",
                "details": "No deployment scripts found",
                "recommendations": ["Create deployment scripts"],
            }

    def check_service(self, service_id: str) -> Dict[str, Any]:
        """Check status of specific service with caching"""
        if service_id not in self.services:
            return {"status": "unknown", "details": f"Unknown service: {service_id}"}

        # Check cache (5 minute expiry)
        now = datetime.now()
        cache_key = service_id

        if (
            cache_key in self.status_cache
            and cache_key in self.last_check
            and (now - self.last_check[cache_key]).seconds < 300
        ):
            return self.status_cache[cache_key]

        # Perform fresh check
        service_config = self.services[service_id]
        check_method = service_config["check_method"]

        try:
            result = check_method()
            result.update(
                {
                    "service_id": service_id,
                    "name": service_config["name"],
                    "priority": service_config["priority"],
                    "last_check": now.isoformat(),
                }
            )

            # Update cache
            self.status_cache[cache_key] = result
            self.last_check[cache_key] = now

            return result

        except Exception as e:
            error_result = {
                "service_id": service_id,
                "name": service_config["name"],
                "status": "error",
                "details": f"Check failed: {e}",
                "last_check": now.isoformat(),
            }

            self.status_cache[cache_key] = error_result
            self.last_check[cache_key] = now

            return error_result

    def run_full_check(self) -> Dict[str, Any]:
        """Run comprehensive system check"""
        print(self._colorize("=" * 80, "red"))
        print(self._colorize("🇦🇹 MENSCHLICHKEIT ÖSTERREICH - SERVICE MONITOR", "bold"))
        print(self._colorize("=" * 80, "red"))
        print(f"⏰ Check Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        results = {}
        overall_status = "healthy"

        # Check all services
        for service_id in self.services.keys():
            result = self.check_service(service_id)
            results[service_id] = result

            # Display result
            icon = self._format_status_icon(result["status"])
            name = result["name"].ljust(25)
            status = result["status"].upper().ljust(8)
            details = result.get("details", "No details")

            print(f"{icon} {name} | {status} | {details}")

            # Show issues
            if result.get("issues"):
                for issue in result["issues"]:
                    print(f"    {self._colorize('⚠️', 'yellow')} {issue}")

            # Show recommendations
            if result.get("recommendations"):
                for rec in result["recommendations"]:
                    print(f"    {self._colorize('💡', 'white')} {rec}")

            # Update overall status
            if result["status"] in ["error", "missing"]:
                overall_status = "critical"
            elif (
                result["status"] in ["warning", "stopped"]
                and overall_status != "critical"
            ):
                overall_status = "warning"

        # Overall status
        print()
        print(self._colorize("=" * 80, "red"))

        status_messages = {
            "healthy": self._colorize("✅ ALL SYSTEMS OPERATIONAL", "green"),
            "warning": self._colorize("⚠️ SOME ISSUES DETECTED", "yellow"),
            "critical": self._colorize("🚨 CRITICAL ISSUES FOUND", "red"),
        }

        print(f"📊 OVERALL STATUS: {status_messages[overall_status]}")
        print(self._colorize("=" * 80, "red"))

        # Summary metrics
        summary = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": overall_status,
            "services_checked": len(results),
            "healthy_services": len(
                [r for r in results.values() if r["status"] in ["ready", "running"]]
            ),
            "services": results,
        }

        return summary

    def start_monitoring(self, interval: int = 60) -> None:
        """Start continuous monitoring loop"""
        print(self._colorize("🔄 Starting continuous monitoring...", "bold"))
        print(f"   Check interval: {interval} seconds")
        print("   Press Ctrl+C to stop")
        print()

        try:
            while True:
                summary = self.run_full_check()

                # Save report
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                report_file = self.project_root / f"monitor-report-{timestamp}.json"

                with open(report_file, "w", encoding="utf-8") as f:
                    json.dump(summary, f, indent=2, ensure_ascii=False)

                print(f"\n📄 Report saved: {report_file.name}")
                print(f"⏳ Next check in {interval} seconds...")

                time.sleep(interval)

        except KeyboardInterrupt:
            print(f"\n{self._colorize('👋 Monitoring stopped by user', 'bold')}")
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
            print(f"❌ Monitoring error: {e}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Optimized Service Monitor für Menschlichkeit Österreich"
    )
    parser.add_argument("--once", action="store_true", help="Run single check and exit")
    parser.add_argument(
        "--interval",
        type=int,
        default=60,
        help="Monitoring interval in seconds (default: 60)",
    )
    parser.add_argument("--service", help="Check specific service only")

    args = parser.parse_args()

    monitor = OptimizedServiceMonitor()

    if args.service:
        # Single service check
        if args.service in monitor.services:
            result = monitor.check_service(args.service)
            print(json.dumps(result, indent=2))
        else:
            print(f"Unknown service: {args.service}")
            print(f"Available services: {', '.join(monitor.services.keys())}")
            sys.exit(1)
    elif args.once:
        # Single comprehensive check
        summary = monitor.run_full_check()

        # Exit with appropriate code
        if summary["overall_status"] == "critical":
            sys.exit(2)
        elif summary["overall_status"] == "warning":
            sys.exit(1)
        else:
            sys.exit(0)
    else:
        # Continuous monitoring
        monitor.start_monitoring(args.interval)


if __name__ == "__main__":
    main()

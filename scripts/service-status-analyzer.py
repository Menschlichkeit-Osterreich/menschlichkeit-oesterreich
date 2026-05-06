#!/usr/bin/env python3
"""
Multi-Service Status Report Generator (ohne Terminal-Interaktion)
Analysiert Service-Status durch Dateisystem-Checks und API-Verfügbarkeit
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


class ServiceStatusAnalyzer:
    """Analysiert Service-Status ohne Terminal-Interaktion"""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.status_report = {
            "timestamp": datetime.now().isoformat(),
            "services": {},
            "overall_health": "unknown",
        }

    def check_api_service(self) -> Dict[str, Any]:
        """Prüfe FastAPI Service Status"""
        api_path = self.project_root / "api.menschlichkeit-oesterreich.at"

        status = {
            "name": "FastAPI Service",
            "path_exists": api_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if api_path.exists():
            # Prüfe wichtige Dateien
            important_files = ["requirements.txt", "app/", ".env"]
            for file in important_files:
                file_path = api_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe requirements.txt Inhalt
            req_file = api_path / "requirements.txt"
            if req_file.exists():
                try:
                    with open(req_file, "r") as f:
                        content = f.read()
                        if "fastapi" in content.lower():
                            status["fastapi_configured"] = True
                        else:
                            status["issues"].append("FastAPI not in requirements")
                except:
                    status["issues"].append("Cannot read requirements.txt")

            status["status"] = "ready" if len(status["issues"]) == 0 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("API directory not found")

        return status

    def check_crm_service(self) -> Dict[str, Any]:
        """Prüfe CRM/Drupal Service Status"""
        crm_path = self.project_root / "crm.menschlichkeit-oesterreich.at"

        status = {
            "name": "CRM (Drupal + CiviCRM)",
            "path_exists": crm_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if crm_path.exists():
            # Prüfe wichtige Dateien
            important_files = ["composer.json", "docker-compose.yml", "sites/"]
            for file in important_files:
                file_path = crm_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe composer.json
            composer_file = crm_path / "composer.json"
            if composer_file.exists():
                try:
                    with open(composer_file, "r") as f:
                        content = f.read()
                        if "drupal" in content.lower():
                            status["drupal_configured"] = True
                        if "civicrm" in content.lower():
                            status["civicrm_configured"] = True
                except:
                    status["issues"].append("Cannot read composer.json")

            status["status"] = "ready" if len(status["issues"]) == 0 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("CRM directory not found")

        return status

    def check_frontend_service(self) -> Dict[str, Any]:
        """Prüfe Frontend/React Service Status"""
        frontend_path = self.project_root / "frontend"

        status = {
            "name": "Frontend (React + TypeScript)",
            "path_exists": frontend_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if frontend_path.exists():
            # Prüfe wichtige Dateien
            important_files = [
                "package.json",
                "src/",
                "vite.config.ts",
                "tsconfig.json",
            ]
            for file in important_files:
                file_path = frontend_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe package.json
            package_file = frontend_path / "package.json"
            if package_file.exists():
                try:
                    with open(package_file, "r") as f:
                        content = json.load(f)
                        deps = content.get("dependencies", {})
                        if "react" in deps:
                            status["react_configured"] = True
                        if "typescript" in deps or "@types/react" in deps:
                            status["typescript_configured"] = True
                        if "tailwindcss" in content.get("devDependencies", {}):
                            status["tailwind_configured"] = True
                except:
                    status["issues"].append("Cannot read package.json")

            status["status"] = "ready" if len(status["issues"]) == 0 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("Frontend directory not found")

        return status

    def check_games_service(self) -> Dict[str, Any]:
        """Prüfe Games Service Status"""
        games_path = self.project_root / "web" / "games"

        status = {
            "name": "Educational Games (Prisma + Democracy)",
            "path_exists": games_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if games_path.exists():
            # Prüfe wichtige Dateien
            important_files = ["index.html", "js/", "css/", "README.md"]
            for file in important_files:
                file_path = games_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe Prisma Schema im Root
            schema_file = self.project_root / "schema.prisma"
            if schema_file.exists():
                status["prisma_schema_found"] = True
                status["files_found"].append("../schema.prisma")
            else:
                status["issues"].append("Prisma schema not found in root")

            # Prüfe Game-spezifische Dateien
            game_files = ["democracy-metaverse.html", "multiplayer-democracy.html"]
            for game_file in game_files:
                if (games_path / game_file).exists():
                    status["files_found"].append(game_file)

            status["status"] = "ready" if len(status["issues"]) <= 1 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("Games directory not found")

        return status

    def check_website_service(self) -> Dict[str, Any]:
        """Prüfe Website Service Status"""
        website_path = self.project_root / "website"

        status = {
            "name": "Website (WordPress/Landing)",
            "path_exists": website_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if website_path.exists():
            # Prüfe wichtige Dateien
            important_files = ["index.html", "wp-config.php", "style.css"]
            for file in important_files:
                file_path = website_path / file
                if file_path.exists():
                    status["files_found"].append(file)

            if len(status["files_found"]) > 0:
                status["status"] = "ready"
            else:
                status["status"] = "empty"
                status["issues"].append("No website files found")
        else:
            status["status"] = "missing"
            status["issues"].append("Website directory not found")

        return status

    def check_n8n_service(self) -> Dict[str, Any]:
        """Prüfe n8n Automation Service Status"""
        n8n_path = self.project_root / "automation" / "n8n"

        status = {
            "name": "n8n Automation & Workflows",
            "path_exists": n8n_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if n8n_path.exists():
            # Prüfe wichtige Dateien
            important_files = ["webhook-client.py", "webhook-client-optimized.py"]
            for file in important_files:
                file_path = n8n_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe ob Webhook Client funktional ist
            webhook_client = n8n_path / "webhook-client.py"
            if webhook_client.exists():
                try:
                    with open(webhook_client, "r") as f:
                        content = f.read()
                        if "MOEWebhookClient" in content:
                            status["webhook_client_ready"] = True
                        else:
                            status["issues"].append("Webhook client class not found")
                except:
                    status["issues"].append("Cannot read webhook client")

            status["status"] = "ready" if len(status["issues"]) == 0 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("n8n directory not found")

        return status

    def check_vscode_config(self) -> Dict[str, Any]:
        """Prüfe VS Code Konfiguration"""
        vscode_path = self.project_root / ".vscode"

        status = {
            "name": "VS Code Configuration",
            "path_exists": vscode_path.exists(),
            "files_found": [],
            "issues": [],
            "recommendations": [],
        }

        if vscode_path.exists():
            # Prüfe wichtige Konfigurationsdateien
            config_files = [
                "settings.json",
                "extensions.json",
                "launch.json",
                "austrian-ngo-theme.json",
            ]
            for file in config_files:
                file_path = vscode_path / file
                if file_path.exists():
                    status["files_found"].append(file)
                else:
                    status["issues"].append(f"Missing {file}")

            # Prüfe Settings
            settings_file = vscode_path / "settings.json"
            if settings_file.exists():
                try:
                    with open(settings_file, "r") as f:
                        content = f.read()
                        if "settingsSync.enabled" in content:
                            status["sync_enabled"] = True
                        if "Austrian NGO Theme" in content:
                            status["custom_theme_active"] = True
                except:
                    status["issues"].append("Cannot read settings.json")

            status["status"] = "ready" if len(status["issues"]) <= 1 else "warning"
        else:
            status["status"] = "missing"
            status["issues"].append("VS Code config directory not found")

        return status

    def generate_report(self) -> Dict[str, Any]:
        """Generiere kompletten Service-Status Report"""

        print("🔍 Menschlichkeit Österreich - Multi-Service Status Analysis")
        print("=" * 65)
        print(f"⏰ Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        # Prüfe alle Services
        services = {
            "vscode": self.check_vscode_config(),
            "api": self.check_api_service(),
            "crm": self.check_crm_service(),
            "frontend": self.check_frontend_service(),
            "games": self.check_games_service(),
            "website": self.check_website_service(),
            "n8n": self.check_n8n_service(),
        }

        # Status Icons
        status_icons = {
            "ready": "✅",
            "warning": "⚠️",
            "missing": "🔴",
            "empty": "🟡",
            "unknown": "❓",
        }

        # Drucke Service Status
        overall_issues = 0
        ready_services = 0

        for service_id, service_data in services.items():
            icon = status_icons.get(service_data["status"], "❓")
            name = service_data["name"]
            status = service_data["status"]
            files_count = len(service_data["files_found"])
            issues_count = len(service_data["issues"])

            print(
                f"{icon} {name:35} | Status: {status:8} | Files: {files_count:2} | Issues: {issues_count}"
            )

            # Zeige gefundene Dateien
            if service_data["files_found"]:
                files_str = ", ".join(service_data["files_found"][:3])
                if len(service_data["files_found"]) > 3:
                    files_str += f" (+{len(service_data['files_found'])-3} more)"
                print(f"    📁 Found: {files_str}")

            # Zeige Issues
            if service_data["issues"]:
                for issue in service_data["issues"][:2]:  # Max 2 issues per service
                    print(f"    ⚠️  {issue}")

            # Update counters
            if status == "ready":
                ready_services += 1
            overall_issues += issues_count
            print()

        # Gesamtstatus
        total_services = len(services)
        if ready_services == total_services:
            overall_health = "✅ EXCELLENT"
        elif ready_services >= total_services * 0.8:
            overall_health = "🟢 GOOD"
        elif ready_services >= total_services * 0.6:
            overall_health = "⚠️ WARNING"
        else:
            overall_health = "🚨 CRITICAL"

        print("📊 OVERALL SYSTEM STATUS")
        print("-" * 30)
        print(f"Health Status: {overall_health}")
        print(f"Ready Services: {ready_services}/{total_services}")
        print(f"Total Issues: {overall_issues}")
        print()

        # Empfehlungen
        print("🎯 RECOMMENDATIONS")
        print("-" * 20)

        if overall_issues == 0:
            print("✅ All services are properly configured!")
            print("💡 Ready for development and deployment")
        else:
            print("🔧 Priority Actions:")

            # Sammle wichtigste Issues
            critical_services = [
                s for s in services.values() if s["status"] in ["missing", "empty"]
            ]
            if critical_services:
                print(
                    f"   1. Setup missing services: {len(critical_services)} services need attention"
                )

            warning_services = [
                s for s in services.values() if s["status"] == "warning"
            ]
            if warning_services:
                print(
                    f"   2. Fix configuration issues in {len(warning_services)} services"
                )

            print("   3. Review individual service issues above")

        print()
        print("=" * 65)

        # Speichere Report
        self.status_report["services"] = services
        self.status_report["overall_health"] = overall_health
        self.status_report["ready_services"] = ready_services
        self.status_report["total_services"] = total_services
        self.status_report["total_issues"] = overall_issues

        return self.status_report

    def save_report(self, filename: str = None):
        """Speichere Report als JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"multi-service-status-{timestamp}.json"

        output_file = self.project_root / filename
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(self.status_report, f, indent=2, ensure_ascii=False)

        print(f"📄 Status report saved: {filename}")


def main():
    """Main function"""
    analyzer = ServiceStatusAnalyzer()
    report = analyzer.generate_report()
    analyzer.save_report()

    # Exit code basierend auf Status
    if report["ready_services"] == report["total_services"]:
        sys.exit(0)  # Success
    elif report["ready_services"] >= report["total_services"] * 0.8:
        sys.exit(1)  # Warning
    else:
        sys.exit(2)  # Critical


if __name__ == "__main__":
    main()

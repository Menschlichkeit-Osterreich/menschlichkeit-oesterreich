#!/usr/bin/env python3
"""
Terminal Integration Debugger für VS Code PowerShell Problem
Analysiert und testet Terminal-Konfiguration ohne run_in_terminal Tool
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


class TerminalDebugger:
    """Debug VS Code Terminal Integration Problems"""

    def __init__(self):
        self.project_root = Path(os.getcwd())
        self.vscode_path = self.project_root / ".vscode"

    def analyze_terminal_config(self) -> Dict[str, Any]:
        """Analysiere VS Code Terminal-Konfiguration"""

        print("🔧 TERMINAL INTEGRATION DEBUGGER")
        print("=" * 50)
        print(f"🇦🇹 Menschlichkeit Österreich - PowerShell Debug")
        print(f"⏰ Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        results = {
            "timestamp": datetime.now().isoformat(),
            "vscode_config": self.check_vscode_config(),
            "powershell_profile": self.check_powershell_profile(),
            "environment": self.check_environment(),
            "terminal_compatibility": self.test_terminal_compatibility(),
            "recommendations": [],
        }

        # Generiere Empfehlungen basierend auf Findings
        results["recommendations"] = self.generate_recommendations(results)

        return results

    def check_vscode_config(self) -> Dict[str, Any]:
        """Prüfe VS Code settings.json"""

        settings_file = self.vscode_path / "settings.json"

        config_check = {
            "settings_file_exists": settings_file.exists(),
            "automation_profile_configured": False,
            "shell_integration_disabled": False,
            "inherit_env_disabled": False,
            "terminal_optimizations": False,
        }

        if settings_file.exists():
            try:
                # Lese settings.json (mit Kommentaren)
                content = settings_file.read_text(encoding="utf-8")

                # Check für kritische Einstellungen
                if "terminal.integrated.automationProfile.windows" in content:
                    config_check["automation_profile_configured"] = True

                if 'shellIntegration.enabled": false' in content:
                    config_check["shell_integration_disabled"] = True

                if 'inheritEnv": false' in content:
                    config_check["inherit_env_disabled"] = True

                if "NoProfile" in content and "NonInteractive" in content:
                    config_check["terminal_optimizations"] = True

            except Exception as e:
                config_check["error"] = str(e)

        return config_check

    def check_powershell_profile(self) -> Dict[str, Any]:
        """Prüfe PowerShell Profile"""

        profile_file = self.vscode_path / "menschlichkeit-oesterreich-profile.ps1"

        profile_check = {
            "profile_file_exists": profile_file.exists(),
            "confirm_preference_none": False,
            "progress_preference_silent": False,
            "execution_policy_bypass": False,
            "multi_service_functions": False,
        }

        if profile_file.exists():
            try:
                content = profile_file.read_text(encoding="utf-8")

                # Check für wichtige Profile-Einstellungen
                if "$ConfirmPreference = 'None'" in content:
                    profile_check["confirm_preference_none"] = True

                if "$ProgressPreference = 'SilentlyContinue'" in content:
                    profile_check["progress_preference_silent"] = True

                if "ExecutionPolicy" in content and "Bypass" in content:
                    profile_check["execution_policy_bypass"] = True

                if "Start-AllServices" in content:
                    profile_check["multi_service_functions"] = True

            except Exception as e:
                profile_check["error"] = str(e)

        return profile_check

    def check_environment(self) -> Dict[str, Any]:
        """Prüfe System-Environment"""

        env_check = {
            "python_available": sys.version_info >= (3, 8),
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "powershell_available": self.check_powershell_available(),
            "working_directory": str(self.project_root),
            "services_detected": self.detect_services(),
        }

        return env_check

    def check_powershell_available(self) -> bool:
        """Prüfe PowerShell Verfügbarkeit"""
        try:
            # Test PowerShell ohne Terminal-Tool
            result = subprocess.run(
                ["pwsh", "--version"], capture_output=True, text=True, timeout=5
            )
            return result.returncode == 0
        except:
            try:
                # Fallback auf powershell.exe
                result = subprocess.run(
                    ["powershell", "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                return result.returncode == 0
            except:
                return False

    def detect_services(self) -> List[str]:
        """Erkenne verfügbare Services"""
        services = []

        service_paths = {
            "api": "api.menschlichkeit-oesterreich.at",
            "crm": "crm.menschlichkeit-oesterreich.at",
            "frontend": "frontend",
            "games": "web",
            "website": "website",
            "automation": "automation/n8n",
        }

        for service_name, path in service_paths.items():
            if (self.project_root / path).exists():
                services.append(service_name)

        return services

    def test_terminal_compatibility(self) -> Dict[str, Any]:
        """Teste Terminal-Kompatibilität"""

        compatibility = {
            "subprocess_works": False,
            "powershell_execution": False,
            "simple_command_test": False,
            "python_integration": False,
        }

        try:
            # Test 1: Subprocess funktionalität
            result = subprocess.run(["echo", "test"], capture_output=True, timeout=3)
            compatibility["subprocess_works"] = result.returncode == 0

            # Test 2: PowerShell Execution
            if self.check_powershell_available():
                try:
                    result = subprocess.run(
                        ["pwsh", "-Command", "Write-Output 'test'"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                    )
                    compatibility["powershell_execution"] = result.returncode == 0
                except (subprocess.TimeoutExpired, OSError) as e:
                    # Fixed: Added specific exception handling instead of bare except (B110)
                    compatibility["powershell_execution"] = False
                    logging.debug(f"PowerShell execution test failed: {e}")

            # Test 3: Einfacher Command Test
            result = subprocess.run(
                ["python", "--version"], capture_output=True, timeout=3
            )
            compatibility["simple_command_test"] = result.returncode == 0

            # Test 4: Python Integration
            compatibility["python_integration"] = True  # Wir sind bereits in Python

        except Exception as e:
            compatibility["error"] = str(e)

        return compatibility

    def generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generiere Empfehlungen basierend auf Analyse"""

        recommendations = []

        # VS Code Config Empfehlungen
        vscode = results["vscode_config"]
        if not vscode["automation_profile_configured"]:
            recommendations.append(
                "❌ Automation Profile nicht konfiguriert - run_in_terminal wird hängen"
            )

        if not vscode["shell_integration_disabled"]:
            recommendations.append(
                "⚠️ Shell Integration nicht deaktiviert - kann Automation stören"
            )

        # PowerShell Profile Empfehlungen
        profile = results["powershell_profile"]
        if not profile["confirm_preference_none"]:
            recommendations.append(
                "❌ ConfirmPreference nicht auf 'None' - User-Prompts blockieren"
            )

        # Environment Empfehlungen
        env = results["environment"]
        if not env["powershell_available"]:
            recommendations.append(
                "❌ PowerShell nicht verfügbar - Terminal-Tools werden fehlschlagen"
            )

        # Terminal Compatibility
        terminal = results["terminal_compatibility"]
        if not terminal["powershell_execution"]:
            recommendations.append(
                "❌ PowerShell Execution fehlgeschlagen - run_in_terminal Problem bestätigt"
            )

        # Services
        services = env["services_detected"]
        if len(services) < 6:
            recommendations.append(
                f"⚠️ Nur {len(services)}/6 Services erkannt - Multi-Service Platform unvollständig"
            )

        # Positive Empfehlungen
        if not recommendations:
            recommendations.append("✅ Alle Terminal-Konfigurationen optimal!")
            recommendations.append("✅ PowerShell Profile korrekt konfiguriert")
            recommendations.append("✅ Multi-Service Platform vollständig erkannt")

        return recommendations

    def print_results(self, results: Dict[str, Any]):
        """Drucke Debug-Ergebnisse"""

        print("\n🎯 TERMINAL DEBUG RESULTS")
        print("=" * 50)

        # VS Code Configuration
        print("\n📝 VS CODE CONFIGURATION:")
        vscode = results["vscode_config"]
        for key, value in vscode.items():
            if key != "error":
                status = "✅" if value else "❌"
                print(f"  {status} {key.replace('_', ' ').title()}: {value}")

        # PowerShell Profile
        print("\n⚡ POWERSHELL PROFILE:")
        profile = results["powershell_profile"]
        for key, value in profile.items():
            if key != "error":
                status = "✅" if value else "❌"
                print(f"  {status} {key.replace('_', ' ').title()}: {value}")

        # Environment
        print("\n🌍 ENVIRONMENT:")
        env = results["environment"]
        print(f"  ✅ Python: {env['python_version']}")
        print(
            f"  {'✅' if env['powershell_available'] else '❌'} PowerShell: Available"
        )
        print(f"  📁 Working Dir: {env['working_directory']}")
        print(
            f"  🚀 Services: {', '.join(env['services_detected'])} ({len(env['services_detected'])}/6)"
        )

        # Terminal Compatibility
        print("\n🔧 TERMINAL COMPATIBILITY:")
        terminal = results["terminal_compatibility"]
        for key, value in terminal.items():
            if key != "error":
                status = "✅" if value else "❌"
                print(f"  {status} {key.replace('_', ' ').title()}: {value}")

        # Recommendations
        print("\n📋 RECOMMENDATIONS:")
        for rec in results["recommendations"]:
            print(f"  {rec}")

        print(f"\n⏰ Analysis completed: {results['timestamp']}")
        print("\n🇦🇹 Menschlichkeit Österreich - Terminal Debug Complete!")


def main():
    """Main execution"""
    debugger = TerminalDebugger()
    results = debugger.analyze_terminal_config()
    debugger.print_results(results)

    # Speichere Ergebnisse
    output_file = Path("TERMINAL-DEBUG-REPORT.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n📄 Detailed debug report saved: {output_file}")

    # Status basierend auf kritischen Problemen
    critical_issues = sum(
        1 for rec in results["recommendations"] if rec.startswith("❌")
    )

    if critical_issues == 0:
        print("\n🎉 STATUS: Terminal Integration vollständig optimiert!")
        return 0
    else:
        print(
            f"\n⚠️ STATUS: {critical_issues} kritische Probleme gefunden - run_in_terminal wird hängen"
        )
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

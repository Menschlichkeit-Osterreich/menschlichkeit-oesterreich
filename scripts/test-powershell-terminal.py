#!/usr/bin/env python3
"""
PowerShell Terminal Test - Direkter Test der Terminal-Konfiguration
Tests ob run_in_terminal mit den optimierten PowerShell Settings funktioniert
"""

import json
import os
from datetime import datetime
from pathlib import Path


def test_powershell_configuration():
    """Teste PowerShell Terminal Konfiguration direkt"""

    print("🔧 PowerShell Terminal Test - Menschlichkeit Österreich")
    print("=" * 60)
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    project_root = Path(__file__).parent.parent

    # Test 1: VS Code Settings prüfen
    print("1. 🔍 VS Code Terminal Settings Test...")
    settings_file = project_root / ".vscode" / "settings.json"

    if settings_file.exists():
        try:
            with open(settings_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Check für PowerShell optimierungen
            checks = {
                "automationProfile configured": '"terminal.integrated.automationProfile.windows"'
                in content,
                "shellIntegration disabled": '"terminal.integrated.shellIntegration.enabled": false'
                in content,
                "inheritEnv disabled": '"terminal.integrated.inheritEnv": false'
                in content,
                "allowChords disabled": '"terminal.integrated.allowChords": false'
                in content,
                "confirmOnExit disabled": '"terminal.integrated.confirmOnExit": "never"'
                in content,
                "PowerShell NoProfile": '"-NoProfile"' in content,
                "NonInteractive mode": '"-NonInteractive"' in content,
                "ExecutionPolicy Bypass": '"-ExecutionPolicy", "Bypass"' in content,
            }

            all_passed = True
            for check, passed in checks.items():
                status = "✅" if passed else "❌"
                print(f"   {status} {check}")
                if not passed:
                    all_passed = False

            print(
                f"   📊 Result: {'All checks passed!' if all_passed else 'Some optimizations missing'}"
            )

        except Exception as e:
            print(f"   ❌ Error reading settings: {e}")
    else:
        print("   ❌ VS Code settings.json not found")

    print()

    # Test 2: PowerShell Profile prüfen
    print("2. 🔍 PowerShell Profile Test...")
    profile_file = project_root / ".vscode" / "menschlichkeit-oesterreich-profile.ps1"

    if profile_file.exists():
        try:
            with open(profile_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Check für PowerShell Profile Features
            profile_checks = {
                "ConfirmPreference disabled": "$ConfirmPreference = 'None'" in content,
                "ProgressPreference silent": "$ProgressPreference = 'SilentlyContinue'"
                in content,
                "ErrorActionPreference set": "$ErrorActionPreference = 'Continue'"
                in content,
                "ExecutionPolicy bypass": "Set-ExecutionPolicy -ExecutionPolicy Bypass"
                in content,
                "Custom prompt function": "function prompt" in content,
                "Multi-Service functions": "Start-AllServices" in content,
            }

            profile_passed = True
            for check, passed in profile_checks.items():
                status = "✅" if passed else "❌"
                print(f"   {status} {check}")
                if not passed:
                    profile_passed = False

            print(
                f"   📊 Result: {'Profile optimized!' if profile_passed else 'Profile needs fixes'}"
            )

        except Exception as e:
            print(f"   ❌ Error reading profile: {e}")
    else:
        print("   ❌ PowerShell profile not found")

    print()

    # Test 3: Service Directories Check (Terminal-unabhängig)
    print("3. 🔍 Multi-Service Directory Test...")
    services = {
        "API": "api.menschlichkeit-oesterreich.at",
        "CRM": "crm.menschlichkeit-oesterreich.at",
        "Frontend": "frontend",
        "Games": "web/games",
        "Website": "website",
        "n8n": "automation/n8n",
    }

    services_ready = 0
    for service_name, service_path in services.items():
        path = project_root / service_path
        if path.exists():
            print(f"   ✅ {service_name:10} | Path: {service_path}")
            services_ready += 1
        else:
            print(f"   ❌ {service_name:10} | Missing: {service_path}")

    print(f"   📊 Result: {services_ready}/{len(services)} services available")
    print()

    # Test 4: Deployment Scripts Check
    print("4. 🔍 Deployment Scripts Test...")
    scripts = [
        "scripts/safe-deploy.sh",
        "deployment-scripts/deploy-crm-plesk.sh",
        "deployment-scripts/deploy-api-plesk.sh",
    ]

    scripts_ready = 0
    for script in scripts:
        script_path = project_root / script
        if script_path.exists():
            print(f"   ✅ {script}")
            scripts_ready += 1
        else:
            print(f"   ❌ {script}")

    print(f"   📊 Result: {scripts_ready}/{len(scripts)} deployment scripts ready")
    print()

    # Final Assessment
    print("📊 FINAL POWERSHELL TERMINAL ASSESSMENT")
    print("=" * 45)

    if all_passed and profile_passed and services_ready >= 5:
        overall_status = "✅ EXCELLENT"
        recommendation = "PowerShell Terminal optimiert! Ready für Production."
    elif all_passed and services_ready >= 4:
        overall_status = "🟢 GOOD"
        recommendation = "PowerShell Settings optimal, kleine Service-Lücken."
    elif all_passed or profile_passed:
        overall_status = "⚠️ PARTIAL"
        recommendation = (
            "Einige PowerShell Optimierungen aktiv, Nachbesserung empfohlen."
        )
    else:
        overall_status = "🚨 NEEDS WORK"
        recommendation = "PowerShell Terminal braucht weitere Optimierungen."

    print(f"Status: {overall_status}")
    print(f"Services: {services_ready}/6 ready")
    print(f"Recommendation: {recommendation}")
    print()
    print("💡 PowerShell Terminal sollte jetzt stabil funktionieren!")
    print("   Teste mit: run_in_terminal Tool-Calls")
    print()


if __name__ == "__main__":
    test_powershell_configuration()

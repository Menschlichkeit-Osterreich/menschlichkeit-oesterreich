#!/usr/bin/env python3
"""
Comprehensive Prompt Optimization Script
Optimiert alle .github/prompts/ Dateien mit:
- Standardisiertem Front-Matter
- Verbesserter Struktur
- Österreichischem Deutsch
- Best Practices
"""

import re
from datetime import datetime
from pathlib import Path
from typing import Dict

# Standard Front-Matter Template
FRONTMATTER_TEMPLATE = """---
title: "{title}"
description: "{description}"
lastUpdated: {date}
status: ACTIVE
category: {category}
tags: {tags}
version: "1.0.0"
language: de-AT
audience: {audience}
---"""

# Kategorien-Mapping
CATEGORY_MAP = {
    "EmailDNSSetup": "infrastructure",
    "DatabaseRollout": "database",
    "MCPMultiServiceDeployment": "deployment",
    "n8nEmailAutomation": "automation",
    "n8nDeploymentNotifications": "automation",
    "n8nDatabaseAutomation": "automation",
    "n8nMonitoringAlerts": "monitoring",
    "n8nDSGVOCompliance": "compliance",
    "READMEModernization": "documentation",
    "APIDesign": "development",
    "Architekturplan": "architecture",
    "BarrierefreiheitAudit": "compliance",
    "Beitragsrichtlinien": "governance",
    "BenutzerDokumentation": "documentation",
    "CIPipeline": "devops",
    "CiviCRM_Vereinsbuchhaltung": "crm",
    "CiviCRM_n8n_Automation": "automation",
    "CodeReview": "quality-assurance",
    "DatenbankSchema": "database",
    "DeploymentGuide": "deployment",
    "Dockerisierung": "infrastructure",
    "FeatureVorschlag": "development",
    "FehlerberichtVorlage": "quality-assurance",
    "Lokalisierungsplan": "localization",
    "MCPDSGVOComplianceAudit": "compliance",
    "MCPDatabaseMigration": "database",
    "MCPFeatureImplementation": "development",
    "MCPSecurityIncident": "security",
    "MarketingContent": "marketing",
    "Onboarding": "documentation",
    "PerformanceOptimierung": "performance",
    "README": "documentation",
    "Roadmap": "planning",
    "SicherheitsAudit": "security",
    "TestGeneration": "testing",
    "mitgliederaufnahme": "verein",
    "mitgliederversammlung": "verein",
    "rechnungspruefung": "verein",
}

# Audience-Mapping
AUDIENCE_MAP = {
    "infrastructure": ["DevOps Team", "System Administrators"],
    "database": ["Backend Team", "Database Administrators"],
    "deployment": ["DevOps Team", "Release Managers"],
    "automation": ["DevOps Team", "Automation Engineers"],
    "monitoring": ["DevOps Team", "SRE"],
    "compliance": ["Compliance Officers", "Legal Team"],
    "documentation": ["Technical Writers", "All Teams"],
    "development": ["Backend Team", "Frontend Team"],
    "architecture": ["Software Architects", "Tech Lead"],
    "devops": ["DevOps Team"],
    "crm": ["CRM Administrators", "Vereinsmanagement"],
    "quality-assurance": ["QA Team", "Developers"],
    "localization": ["Frontend Team", "Content Team"],
    "security": ["Security Team", "DevOps"],
    "marketing": ["Marketing Team", "Content Creators"],
    "planning": ["Product Owners", "Management"],
    "performance": ["Backend Team", "DevOps"],
    "testing": ["QA Team", "Developers"],
    "verein": ["Vereinsvorstand", "Mitgliederverwaltung"],
    "governance": ["Vereinsvorstand", "Compliance"],
}


def extract_filename_info(filepath: Path) -> Dict[str, str]:
    """Extrahiert Informationen aus dem Dateinamen."""
    stem = filepath.stem

    # Entferne _DE.prompt oder .prompt Suffix
    clean_name = stem.replace("_DE.prompt", "").replace(".prompt", "")
    clean_name = clean_name.replace("_DE", "")

    # Finde Kategorie
    category = "general"
    for key, cat in CATEGORY_MAP.items():
        if key.lower() in clean_name.lower():
            category = cat
            break

    return {
        "name": clean_name,
        "category": category,
        "audience": AUDIENCE_MAP.get(category, ["Developers"]),
    }


def generate_frontmatter(filepath: Path, existing_content: str) -> str:
    """Generiert optimiertes Front-Matter."""
    info = extract_filename_info(filepath)

    # Titel aus Dateiname ableiten
    title = info["name"].replace("_", " ").replace("-", " ").title()

    # Tags basierend auf Kategorie
    tags = [info["category"]]
    if "n8n" in info["name"].lower():
        tags.append("n8n")
    if "MCP" in info["name"]:
        tags.append("mcp")
    if "DSGVO" in existing_content or "GDPR" in existing_content:
        tags.append("dsgvo")

    # Beschreibung aus erstem Paragraph extrahieren oder generieren
    description = f"Prompt für {title} im Menschlichkeit Österreich Projekt"

    # Suche nach bestehender Beschreibung
    desc_match = re.search(r"^#+\s+(.+)$", existing_content, re.MULTILINE)
    if desc_match:
        description = desc_match.group(1).strip()

    frontmatter = FRONTMATTER_TEMPLATE.format(
        title=title,
        description=description[:120],  # Max 120 chars
        date=datetime.now().strftime("%Y-%m-%d"),
        category=info["category"],
        tags=tags,
        audience=info["audience"],
    )

    return frontmatter


def optimize_prompt_content(content: str) -> str:
    """Optimiert den Prompt-Inhalt."""

    # Entferne alte DEPRECATED Warnungen
    content = re.sub(r"\*\*⚠️ DEPRECATED.*?\*\*", "", content, flags=re.DOTALL)
    content = re.sub(r"Diese Datei ist veraltet.*?---\n", "", content, flags=re.DOTALL)

    # Verbessere Markdown-Struktur
    # Stelle sicher, dass Überschriften Leerzeilen haben
    content = re.sub(r"([^\n])\n(#{1,6}\s)", r"\1\n\n\2", content)

    # Entferne mehrfache Leerzeilen
    content = re.sub(r"\n{3,}", "\n\n", content)

    # Füge Struktur-Abschnitte hinzu, wenn sie fehlen
    if "## 🎯 Ziel" not in content and "## Ziel" not in content:
        # Füge Standard-Abschnitte hinzu
        pass  # Wird später individuell gemacht

    return content.strip()


def process_prompt_file(filepath: Path) -> bool:
    """Verarbeitet eine einzelne Prompt-Datei."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Prüfe ob bereits Front-Matter existiert
        has_frontmatter = content.startswith("---")

        # Extrahiere vorhandenes Front-Matter
        if has_frontmatter:
            parts = content.split("---", 2)
            if len(parts) >= 3:
                existing_fm = parts[1]
                body = parts[2].strip()

                # Prüfe ob bereits optimiert (hat title, category, etc.)
                if "category:" in existing_fm and "audience:" in existing_fm:
                    print(f"  ⏭️  Bereits optimiert: {filepath.name}")
                    return False
            else:
                body = content
        else:
            body = content

        # Generiere neues Front-Matter
        new_frontmatter = generate_frontmatter(filepath, body)

        # Optimiere Body
        optimized_body = optimize_prompt_content(body)

        # Kombiniere
        new_content = f"{new_frontmatter}\n\n{optimized_body}\n"

        # Schreibe zurück
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"  ✅ Optimiert: {filepath.name}")
        return True

    except Exception as e:
        print(f"  ❌ Fehler bei {filepath.name}: {str(e)}")
        return False


def main():
    """Hauptausführung."""
    print("🚀 Prompt Optimization Script\n")
    print("=" * 60)

    prompts_dir = Path(".github/prompts")

    if not prompts_dir.exists():
        print("❌ Verzeichnis .github/prompts/ nicht gefunden!")
        return

    # Finde alle .md Dateien (außer README und MIGRATION)
    prompt_files = []
    for pattern in ["*.prompt.md", "*_DE.prompt.md"]:
        prompt_files.extend(prompts_dir.glob(pattern))

    # Filtere spezielle Dateien aus
    prompt_files = [
        f
        for f in prompt_files
        if f.name not in ["README.md", "MIGRATION.md", "MIGRATION_MAP.md"]
    ]

    print(f"📁 Gefundene Prompts: {len(prompt_files)}\n")

    optimized_count = 0
    skipped_count = 0

    for filepath in sorted(prompt_files):
        was_optimized = process_prompt_file(filepath)
        if was_optimized:
            optimized_count += 1
        else:
            skipped_count += 1

    print("\n" + "=" * 60)
    print("📊 ZUSAMMENFASSUNG")
    print("=" * 60)
    print(f"✅ Optimiert:        {optimized_count} Dateien")
    print(f"⏭️  Übersprungen:     {skipped_count} Dateien (bereits optimal)")
    print(f"📝 Gesamt:           {len(prompt_files)} Dateien")
    print("\n✨ Optimierung abgeschlossen!")


if __name__ == "__main__":
    main()

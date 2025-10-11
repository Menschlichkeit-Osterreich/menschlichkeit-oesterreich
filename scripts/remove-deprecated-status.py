#!/usr/bin/env python3
"""
Remove 'status: DEPRECATED' from front-matter while preserving other metadata.
Entfernt nur die status-Zeile, behält alle anderen Front-Matter Felder.
"""

import re
from pathlib import Path
from typing import Tuple

# Directories to process
SEARCH_DIRS = [".github/prompts", ".github/modes"]

# Files to exclude
EXCLUDE_PATTERNS = ["node_modules", "vendor", "dist", "build", ".cache"]


def should_exclude(filepath: Path) -> bool:
    """Check if file should be excluded."""
    return any(pattern in str(filepath) for pattern in EXCLUDE_PATTERNS)


def process_file(filepath: Path) -> Tuple[bool, str]:
    """
    Remove 'status: DEPRECATED' from file front-matter.

    Returns:
        Tuple of (was_modified, status_message)
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Check if file has front-matter with DEPRECATED status
        if not content.startswith("---"):
            return False, "No front-matter"

        if "status: DEPRECATED" not in content and "Status: DEPRECATED" not in content:
            return False, "No DEPRECATED status"

        # Split into front-matter and body
        parts = content.split("---", 2)
        if len(parts) < 3:
            return False, "Invalid front-matter structure"

        front_matter = parts[1]
        body = parts[2]

        # Remove status: DEPRECATED line and related metadata
        lines = front_matter.split("\n")
        new_lines = []
        skip_next = False

        for line in lines:
            # Skip status: DEPRECATED
            if re.match(r"^\s*status:\s*DEPRECATED\s*$", line, re.IGNORECASE):
                continue
            # Skip deprecated_date
            if re.match(r"^\s*deprecated_date:", line):
                continue
            # Skip migration_target
            if re.match(r"^\s*migration_target:", line):
                continue
            # Skip reason (if part of deprecation metadata)
            if re.match(
                r"^\s*reason:\s*.*(deprecated|legacy|ersetzt|veraltet)",
                line,
                re.IGNORECASE,
            ):
                continue

            new_lines.append(line)

        # Reconstruct file
        new_front_matter = "\n".join(new_lines)
        new_content = f"---{new_front_matter}---{body}"

        # Write back
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        return True, "✅ Removed DEPRECATED status"

    except Exception as e:
        return False, f"❌ Error: {str(e)}"


def main():
    """Main execution."""
    print("🔍 Scanning for files with 'status: DEPRECATED'...\n")

    modified_count = 0
    skipped_count = 0
    error_count = 0

    for search_dir in SEARCH_DIRS:
        search_path = Path(search_dir)

        if not search_path.exists():
            print(f"⚠️  Directory not found: {search_dir}")
            continue

        print(f"📁 Processing: {search_dir}/")

        # Find all markdown files
        for filepath in search_path.rglob("*.md"):
            if should_exclude(filepath):
                continue

            was_modified, message = process_file(filepath)

            if was_modified:
                print(f"  {message}: {filepath.relative_to('.')}")
                modified_count += 1
            elif "Error" in message:
                print(f"  {message}: {filepath.relative_to('.')}")
                error_count += 1
            else:
                skipped_count += 1

        print()

    # Summary
    print("=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"✅ Modified:  {modified_count} files")
    print(f"⏭️  Skipped:   {skipped_count} files (no DEPRECATED status)")
    print(f"❌ Errors:    {error_count} files")
    print()

    if modified_count > 0:
        print("✨ Status 'DEPRECATED' wurde aus allen Front-Matter entfernt.")
        print("   Dateien sind jetzt als normale Dokumentation behandelt.")
    else:
        print("ℹ️  Keine Dateien mit 'status: DEPRECATED' gefunden.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Archive analysis artefacts into analysis/archive/ with timestamped folders."""

from __future__ import annotations

import argparse
import datetime as dt
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ROOT = ROOT / "analysis" / "archive"


def slugify(value: str) -> str:
    cleaned = ''.join(ch.lower() if ch.isalnum() else '-' for ch in value)
    while '--' in cleaned:
        cleaned = cleaned.replace('--', '-')
    return cleaned.strip('-') or 'archive'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Move analysis output into analysis/archive/")
    parser.add_argument("paths", nargs="+", help="Files or directories to archive (relative to repo root)")
    parser.add_argument(
        "--label",
        help="Optional label used in the archive folder name",
    )
    parser.add_argument(
        "--copy",
        action="store_true",
        help="Copy instead of move (original files remain in place)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show actions without performing them",
    )
    return parser.parse_args()


def ensure_archive_directory(stem: str) -> Path:
    ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True)
    timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d-%H%M%S")
    target_dir = ARCHIVE_ROOT / f"{timestamp}-{stem}"
    counter = 1
    tmp = target_dir
    while tmp.exists():
        counter += 1
        tmp = ARCHIVE_ROOT / f"{timestamp}-{stem}-{counter}"
    return tmp


def archive(paths: list[Path], *, label: str | None, copy: bool, dry_run: bool) -> Path:
    stem = slugify(label or paths[0].name)
    target_root = ensure_archive_directory(stem)

    if dry_run:
        print(f"[dry-run] create directory {target_root}")
    else:
        target_root.mkdir(parents=True, exist_ok=False)

    for src in paths:
        dest = target_root / src.name
        if dry_run:
            action = "copy" if copy else "move"
            print(f"[dry-run] {action} {src} -> {dest}")
            continue

        if copy:
            if src.is_dir():
                shutil.copytree(src, dest)
            else:
                shutil.copy2(src, dest)
        else:
            shutil.move(str(src), dest)

    return target_root


def main() -> int:
    args = parse_args()
    resolved_paths: list[Path] = []
    for path_str in args.paths:
        path = (ROOT / path_str).resolve()
        if not path.exists():
            print(f"Error: {path} does not exist", file=sys.stderr)
            return 1
        resolved_paths.append(path)

    target = archive(resolved_paths, label=args.label, copy=args.copy, dry_run=args.dry_run)
    action = "planned" if args.dry_run else "created"
    print(f"Archive {action} at {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

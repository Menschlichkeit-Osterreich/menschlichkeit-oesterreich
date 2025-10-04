#!/usr/bin/env python3
"""Log retention enforcement for Menschlichkeit Österreich workspace.

Removes log files that exceed retention policies for operational, compliance,
and security audit logs. Defaults reflect the Phase 0 ILM strategy
(30d/1y/7d). Supports dry-run and custom rule overrides.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

DEFAULT_RULES = (
    ("logs/operational", 30),
    ("logs/compliance", 365),
    ("logs/security-audit", 7),
)


@dataclass
class RetentionRule:
    path: Path
    days: int

    @property
    def cutoff(self) -> dt.datetime:
        return dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=self.days)


def parse_rule(value: str, root: Path) -> RetentionRule:
    try:
        path_str, days_str = value.split(":", maxsplit=1)
        days = int(days_str)
    except ValueError as exc:  # pragma: no cover - user input guard
        raise argparse.ArgumentTypeError(
            "Rule format must be path:days (e.g. logs/custom:14)"
        ) from exc
    if days < 0:
        raise argparse.ArgumentTypeError("Retention days must be non-negative")
    return RetentionRule(path=root / path_str, days=days)


def parse_args(root: Path) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Purge expired log files based on retention rules")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show planned deletions without removing files",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print every file that would be deleted",
    )
    parser.add_argument(
        "--root",
        default=str(root),
        help="Project root (defaults to repository root)",
    )
    parser.add_argument(
        "--rule",
        action="append",
        default=[],
        metavar="PATH:DAYS",
        help="Additional retention rule (may be specified multiple times)",
    )
    parser.add_argument(
        "--config",
        help="Optional JSON file with rules [{\"path\": str, \"days\": int}]",
    )
    parser.add_argument(
        "--prune-empty-dirs",
        action="store_true",
        help="Remove any empty directories after purging",
    )
    return parser.parse_args()


def load_rules(args: argparse.Namespace, default_root: Path) -> List[RetentionRule]:
    root = Path(args.root).resolve()
    rules: List[RetentionRule] = [RetentionRule(root / path, days) for path, days in DEFAULT_RULES]

    if args.config:
        config_path = Path(args.config)
        data = json.loads(config_path.read_text(encoding="utf-8"))
        for entry in data:
            try:
                rule = RetentionRule(root / entry["path"], int(entry["days"]))
            except (KeyError, ValueError, TypeError) as exc:  # pragma: no cover - config guard
                raise ValueError(f"Invalid rule in {config_path}: {entry}") from exc
            rules.append(rule)

    for value in args.rule:
        rules.append(parse_rule(value, root))

    return rules


def iter_files(rule: RetentionRule) -> Iterable[Path]:
    if not rule.path.exists():
        return ()
    for item in rule.path.rglob("*"):
        if item.is_file():
            yield item


def remove_file(path: Path, dry_run: bool) -> None:
    if dry_run:
        return
    path.unlink()


def prune_empty_directories(root: Path, dry_run: bool) -> int:
    removed = 0
    for directory in sorted((p for p in root.rglob("*") if p.is_dir()), reverse=True):
        if any(directory.iterdir()):
            continue
        if dry_run:
            removed += 1
        else:
            directory.rmdir()
            removed += 1
    return removed


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    args = parse_args(repo_root)
    rules = load_rules(args, repo_root)
    now = dt.datetime.now(dt.timezone.utc)

    total_deleted = 0

    for rule in rules:
        cutoff = rule.cutoff
        if args.verbose:
            print(f"Evaluating {rule.path} (retention {rule.days}d, cutoff {cutoff.isoformat()})")
        if not rule.path.exists():
            if args.verbose:
                print(f"  Skipping {rule.path} (missing)")
            continue
        for file_path in iter_files(rule):
            try:
                mtime = dt.datetime.fromtimestamp(file_path.stat().st_mtime, dt.timezone.utc)
            except FileNotFoundError:
                continue
            if mtime <= cutoff:
                if args.dry_run:
                    print(f"[dry-run] remove {file_path}")
                elif args.verbose:
                    print(f"remove {file_path}")
                remove_file(file_path, args.dry_run)
                total_deleted += 1

    pruned_dirs = 0
    if args.prune_empty_dirs:
        for rule in rules:
            if rule.path.exists():
                pruned_dirs += prune_empty_directories(rule.path, args.dry_run)

    action = "flagged" if args.dry_run else "deleted"
    print(f"Log purge complete: {total_deleted} files {action}.")
    if args.prune_empty_dirs:
        label = "directories flagged" if args.dry_run else "directories removed"
        print(f"Empty directory cleanup: {pruned_dirs} {label}.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

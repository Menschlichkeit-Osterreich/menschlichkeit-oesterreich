#!/usr/bin/env python3
"""Compare ephemeral Plesk facts with the public expected-state contract."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

VALID_STATES = {"PASS", "WARN", "FAIL", "UNKNOWN"}


@dataclass(frozen=True)
class Check:
    category: str
    key: str
    status: str


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read valid JSON from {path.name}: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain a JSON object")
    return value


def normalize_status(value: Any) -> str:
    status = str(value or "UNKNOWN").upper()
    return status if status in VALID_STATES else "UNKNOWN"


def is_utc_timestamp(value: Any) -> bool:
    if not isinstance(value, str) or not value.endswith("Z"):
        return False
    try:
        parsed = datetime.fromisoformat(value.removesuffix("Z") + "+00:00")
    except ValueError:
        return False
    return parsed.utcoffset() is not None and parsed.utcoffset().total_seconds() == 0


def required_status(value: Any, *, required: bool) -> str:
    status = normalize_status(value)
    if required:
        return status
    if status in {"FAIL", "UNKNOWN"}:
        return "WARN"
    return status


def add_threshold_check(
    checks: list[Check], category: str, key: str, actual: Any, minimum: Any
) -> None:
    if not isinstance(actual, (int, float)):
        checks.append(Check(category, key, "UNKNOWN"))
    elif not isinstance(minimum, (int, float)):
        checks.append(Check(category, key, "UNKNOWN"))
    elif actual < minimum:
        checks.append(Check(category, key, "FAIL"))
    else:
        checks.append(Check(category, key, "PASS"))


def evaluate(
    expected: dict[str, Any], actual: dict[str, Any]
) -> tuple[str, list[Check]]:
    if expected.get("schema_version") != 2:
        raise ValueError("expected-state schema_version must be 2")
    if actual.get("schema_version") != 1:
        raise ValueError("actual-state schema_version must be 1")

    checks: list[Check] = []
    collector = actual.get("collector") or {}
    policy_expectations = {
        "read_only": True,
        "environment_dumped": False,
        "process_command_lines_collected": False,
        "secret_values_collected": False,
        "pii_collected": False,
    }
    for key, required_value in policy_expectations.items():
        checks.append(
            Check(
                "collection_policy",
                key,
                "PASS" if collector.get(key) is required_value else "FAIL",
            )
        )
    checks.extend(
        [
            Check(
                "collection_policy",
                "file_content_scope",
                "PASS"
                if collector.get("file_content_scope") == "release-marker-hash-only"
                else "FAIL",
            ),
            Check(
                "evidence",
                "evidence_class",
                "PASS"
                if actual.get("evidence_class") in {"VERIFIED_LIVE", "VERIFIED_TEST"}
                else "FAIL",
            ),
            Check(
                "evidence",
                "timestamp",
                "PASS" if is_utc_timestamp(actual.get("generated_at")) else "FAIL",
            ),
            Check(
                "evidence",
                "source",
                "PASS"
                if actual.get("source") == "scripts/ops/plesk-readonly-audit.sh"
                else "FAIL",
            ),
        ]
    )

    system = actual.get("system") or {}
    for key in expected.get("required_system_checks", []):
        status = normalize_status((system.get(key) or {}).get("status"))
        checks.append(Check("system", key, status))

    thresholds = expected.get("thresholds") or {}
    add_threshold_check(
        checks,
        "capacity",
        "memory_available_min_pct",
        (system.get("memory") or {}).get("available_pct"),
        thresholds.get("memory_available_min_pct"),
    )
    add_threshold_check(
        checks,
        "capacity",
        "disk_free_min_pct",
        (system.get("filesystem") or {}).get("free_pct"),
        thresholds.get("disk_free_min_pct"),
    )
    add_threshold_check(
        checks,
        "capacity",
        "inode_free_min_pct",
        (system.get("inodes") or {}).get("free_pct"),
        thresholds.get("inode_free_min_pct"),
    )

    runtimes = actual.get("runtimes") or {}
    for key in expected.get("required_runtimes", []):
        status = normalize_status((runtimes.get(key) or {}).get("status"))
        checks.append(Check("runtime", key, status))
    for key in expected.get("optional_runtimes", []):
        status = required_status(
            (runtimes.get(key) or {}).get("status"), required=False
        )
        checks.append(Check("runtime", key, status))

    services = actual.get("services") or {}
    for key in expected.get("required_services", []):
        status = normalize_status((services.get(key) or {}).get("status"))
        checks.append(Check("service", key, status))
    for key in expected.get("optional_services", []):
        status = required_status(
            (services.get(key) or {}).get("status"), required=False
        )
        checks.append(Check("service", key, status))

    actual_hosts = {
        item.get("host"): item
        for item in actual.get("public_hosts", [])
        if isinstance(item, dict)
    }
    for target in expected.get("public_hosts", []):
        host = target["host"]
        required = bool(target.get("required"))
        observed = actual_hosts.get(host) or {}
        for suffix in ("dns", "tls", "http"):
            checks.append(
                Check(
                    "host",
                    f"{host}:{suffix}",
                    required_status(
                        observed.get(f"{suffix}_status"), required=required
                    ),
                )
            )
        checks.append(
            Check(
                "host",
                f"{host}:plesk_vhost",
                required_status(
                    observed.get("plesk_vhost_status"), required=required
                ),
            )
        )
        tls_days = observed.get("tls_days_remaining")
        tls_minimum = thresholds.get("tls_min_remaining_days")
        if isinstance(tls_days, (int, float)) and isinstance(
            tls_minimum, (int, float)
        ):
            tls_status = "PASS" if tls_days >= tls_minimum else "FAIL"
        else:
            tls_status = "UNKNOWN"
        status = required_status(tls_status, required=required)
        checks.append(Check("host", f"{host}:tls_remaining", status))

    actual_paths = {
        item.get("key"): item
        for item in actual.get("service_paths", [])
        if isinstance(item, dict)
    }
    for target in expected.get("service_paths", []):
        key = target["key"]
        required = bool(target.get("required"))
        observed = actual_paths.get(key) or {}
        status = required_status(observed.get("status"), required=required)
        checks.append(Check("service_path", key, status))
        checks.append(
            Check(
                "release_marker",
                key,
                required_status(
                    observed.get("release_marker_status"), required=required
                ),
            )
        )

    backup = actual.get("backup") or {}
    backup_status = normalize_status(backup.get("status"))
    backup_age = backup.get("age_hours")
    backup_max_age = thresholds.get("backup_max_age_hours")
    if (
        backup_status == "PASS"
        and isinstance(backup_age, (int, float))
        and isinstance(backup_max_age, (int, float))
    ):
        backup_status = "PASS" if backup_age <= backup_max_age else "FAIL"
    checks.append(Check("recovery", "backup_freshness", backup_status))
    restore_status = normalize_status((actual.get("restore") or {}).get("status"))
    checks.append(Check("recovery", "isolated_restore", restore_status))

    statuses = {check.status for check in checks}
    if "FAIL" in statuses:
        overall = "FAIL"
    elif "UNKNOWN" in statuses:
        overall = "UNKNOWN"
    elif "WARN" in statuses:
        overall = "WARN"
    else:
        overall = "PASS"
    return overall, checks


def render_markdown(overall: str, checks: list[Check]) -> str:
    lines = [
        "# Plesk read-only audit",
        "",
        f"Overall status: **{overall}**",
        "",
        "Only public object identifiers and status values are included.",
        "",
        "| Category | Check | Status |",
        "| --- | --- | --- |",
    ]
    for check in checks:
        lines.append(f"| {check.category} | {check.key} | {check.status} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected", required=True, type=Path)
    parser.add_argument("--actual", required=True, type=Path)
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--fail-on-unknown", action="store_true")
    args = parser.parse_args()

    try:
        overall, checks = evaluate(load_json(args.expected), load_json(args.actual))
    except ValueError as exc:
        print(f"comparison input error: {exc}", file=sys.stderr)
        return 2

    if args.format == "json":
        output = json.dumps(
            {"overall_status": overall, "checks": [asdict(check) for check in checks]},
            indent=2,
            sort_keys=True,
        ) + "\n"
    else:
        output = render_markdown(overall, checks)

    if args.output:
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")

    if overall == "FAIL" or (args.fail_on_unknown and overall == "UNKNOWN"):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

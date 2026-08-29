from __future__ import annotations

import importlib.util
import json
import os
import re
import shutil
import subprocess  # nosec B404 - tests intentionally execute repository scripts
import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
COLLECTOR = ROOT / "scripts/ops/plesk-readonly-audit.sh"
COMPARATOR = ROOT / "scripts/ops/compare-plesk-state.py"
EXPECTED = ROOT / "config/plesk/expected-state.json"
AUDIT_WORKFLOW = ROOT / ".github/workflows/plesk-readonly-audit.yml"
BASH = shutil.which("bash")
PYTHON = str(Path(sys.executable).resolve())


def load_comparator() -> ModuleType:
    spec = importlib.util.spec_from_file_location("compare_plesk_state", COMPARATOR)
    if spec is None or spec.loader is None:
        raise RuntimeError("comparator module cannot be loaded")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class PleskReadonlyAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if BASH is None:
            raise unittest.SkipTest("bash executable not available")
        cls.expected = json.loads(EXPECTED.read_text(encoding="utf-8"))
        cls.comparator = load_comparator()

    def test_remote_collector_contains_no_mutating_command(self) -> None:
        source = COLLECTOR.read_text(encoding="utf-8")
        command_pattern = re.compile(
            r"(?m)^[ \t]*(?:sudo[ \t]+)?(?:rm|mv|cp|chmod|chown|install|"
            r"apt(?:-get)?|dnf|yum|zypper|pacman|reboot|shutdown|mount|umount)\b"
        )
        service_write_pattern = re.compile(
            r"\bsystemctl\s+(?:start|stop|restart|reload|enable|disable|mask|unmask)\b"
        )
        db_dump_pattern = re.compile(r"\b(?:pg_dump|pg_restore|mysqldump|mysqlpump)\b")
        sensitive_proc_pattern = re.compile(
            r"/proc/(?:self|[0-9*${}_-]+)/(?:cmdline|environ)"
        )
        self.assertIsNone(command_pattern.search(source))
        self.assertIsNone(service_write_pattern.search(source))
        self.assertIsNone(db_dump_pattern.search(source))
        self.assertIsNone(sensitive_proc_pattern.search(source))
        self.assertNotRegex(
            source,
            r"(?:mysql|postgresql|redis)_status=.*runtime_status",
        )

    def test_workflow_is_status_only_and_not_untrusted(self) -> None:
        source = AUDIT_WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("pull_request:", source)
        self.assertNotIn("push:", source)
        self.assertNotIn("schedule:", source)
        self.assertNotIn("actions/upload-artifact", source)
        self.assertIn("persist-credentials: false", source)
        self.assertIn("contents: read", source)
        self.assertNotIn("contents: write", source)
        self.assertNotIn("secrets.", source)
        self.assertNotIn("bsm-env-inject", source)
        self.assertNotRegex(source, r"\bssh\b")

    def test_collector_rejects_host_outside_moe_domain(self) -> None:
        unexpected = json.loads(json.dumps(self.expected))
        unexpected["public_hosts"] = [
            {"host": "127.0.0.1", "health_path": "/", "required": True}
        ]
        with tempfile.TemporaryDirectory() as temporary_directory:
            unexpected_path = Path(temporary_directory) / "unexpected.json"
            unexpected_path.write_text(json.dumps(unexpected), encoding="utf-8")
            environment = os.environ.copy()
            environment["MOE_AUDIT_PUBLIC_HOSTS_B64"] = ""
            environment["MOE_AUDIT_SERVICE_PATHS_B64"] = ""
            environment["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{environment['PATH']}"
            result = subprocess.run(  # nosec B603 - fixed repo script and absolute executable
                [
                    BASH,
                    str(COLLECTOR),
                    "--expected",
                    str(unexpected_path),
                    "--no-network",
                ],
                check=False,
                capture_output=True,
                text=True,
                env=environment,
            )
        self.assertEqual(result.returncode, 2)
        self.assertIn("outside allowed audit domain", result.stderr)

    def test_collector_emits_valid_bounded_json_without_network(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            vhost_root = Path(temporary_directory)
            test_environment = os.environ.copy()
            test_environment["MOE_AUDIT_PUBLIC_HOSTS_B64"] = ""
            test_environment["MOE_AUDIT_SERVICE_PATHS_B64"] = ""
            test_environment["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{test_environment['PATH']}"
            for target in self.expected["service_paths"]:
                relative_path = f"services/{target['key']}"
                test_environment[target["path_env"]] = relative_path
                service_path = vhost_root / relative_path
                service_path.mkdir(parents=True, exist_ok=True)
                (service_path / ".deploy_release").write_text(
                    "test-release\n", encoding="utf-8"
                )
            expected_payload = json.loads(EXPECTED.read_text(encoding="utf-8"))
            for item in expected_payload["public_hosts"]:
                item["required"] = str(item["required"]).lower()
            for item in expected_payload["service_paths"]:
                item["required"] = str(item["required"]).lower()
            expected_path = Path(temporary_directory) / "expected-runtime.json"
            expected_path.write_text(json.dumps(expected_payload), encoding="utf-8")

            result = subprocess.run(  # nosec B603 - fixed repo scripts and absolute executable
                [
                    BASH,
                    str(COLLECTOR),
                    "--expected",
                    str(expected_path),
                    "--vhost-root",
                    str(vhost_root),
                    "--evidence-class",
                    "VERIFIED_TEST",
                    "--no-network",
                ],
                check=True,
                capture_output=True,
                text=True,
                env=test_environment,
            )
            actual = json.loads(result.stdout)

        self.assertEqual(actual["schema_version"], 1)
        self.assertEqual(actual["evidence_class"], "VERIFIED_TEST")
        self.assertTrue(actual["collector"]["read_only"])
        self.assertFalse(actual["collector"]["secret_values_collected"])
        self.assertFalse(actual["collector"]["pii_collected"])
        self.assertTrue(
            all(host["http_status"] == "UNKNOWN" for host in actual["public_hosts"])
        )
        self.assertTrue(
            all(
                host["plesk_vhost_status"] in {"PASS", "UNKNOWN"}
                for host in actual["public_hosts"]
            )
        )
        self.assertTrue(
            all(path["status"] == "PASS" for path in actual["service_paths"])
        )
        self.assertTrue(
            all(
                len(path["release_marker_sha256"]) == 64
                for path in actual["service_paths"]
            )
        )
        self.assertEqual(actual["backup"]["status"], "UNKNOWN")
        self.assertEqual(actual["restore"]["status"], "UNKNOWN")

    def test_comparator_can_reach_pass_with_complete_evidence(self) -> None:
        actual = self._complete_actual("PASS")
        overall, checks = self.comparator.evaluate(self.expected, actual)
        self.assertEqual(overall, "PASS")
        self.assertTrue(checks)
        self.assertTrue(all(check.status == "PASS" for check in checks))

    def test_missing_required_host_is_unknown(self) -> None:
        actual = self._complete_actual("PASS")
        actual["public_hosts"] = [
            host
            for host in actual["public_hosts"]
            if host["host"] != "api.menschlichkeit-oesterreich.at"
        ]
        overall, checks = self.comparator.evaluate(self.expected, actual)
        self.assertEqual(overall, "UNKNOWN")
        self.assertIn(
            "UNKNOWN",
            [
                check.status
                for check in checks
                if check.key == "api.menschlichkeit-oesterreich.at:http"
            ],
        )

    def test_required_failure_dominates_unknown(self) -> None:
        actual = self._complete_actual("PASS")
        actual["system"]["filesystem"]["free_pct"] = 1
        actual["restore"]["status"] = "UNKNOWN"
        overall, _ = self.comparator.evaluate(self.expected, actual)
        self.assertEqual(overall, "FAIL")

    def test_fail_on_unknown_cli_and_status_only_output(self) -> None:
        actual = self._complete_actual("PASS")
        actual["restore"]["status"] = "UNKNOWN"
        actual["system"]["hostname"]["value"] = "private-runtime-host.example"
        with tempfile.TemporaryDirectory() as temporary_directory:
            actual_path = Path(temporary_directory) / "actual.json"
            actual_path.write_text(json.dumps(actual), encoding="utf-8")
            result = subprocess.run(  # nosec B603 - fixed repo script and Python executable
                [
                    PYTHON,
                    str(COMPARATOR),
                    "--expected",
                    str(EXPECTED),
                    "--actual",
                    str(actual_path),
                    "--fail-on-unknown",
                ],
                check=False,
                capture_output=True,
                text=True,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("Overall status: **UNKNOWN**", result.stdout)
        self.assertNotIn("private-runtime-host.example", result.stdout)

    def _complete_actual(self, status: str) -> dict[str, Any]:
        system = {
            key: {"status": status}
            for key in self.expected["required_system_checks"]
        }
        system["memory"].update({"available_pct": 50})
        system["filesystem"].update({"free_pct": 50})
        system["inodes"].update({"free_pct": 50})
        system["hostname"]["value"] = "redacted-test-host"
        runtimes = {
            key: {"status": status}
            for key in (
                self.expected["required_runtimes"]
                + self.expected["optional_runtimes"]
            )
        }
        services = {
            key: {"status": status}
            for key in (
                self.expected["required_services"]
                + self.expected["optional_services"]
            )
        }
        public_hosts = [
            {
                "host": target["host"],
                "dns_status": status,
                "tls_status": status,
                "tls_days_remaining": 90,
                "http_status": status,
                "plesk_vhost_status": status,
            }
            for target in self.expected["public_hosts"]
        ]
        service_paths = [
            {
                "key": target["key"],
                "status": status,
                "release_marker_status": status,
            }
            for target in self.expected["service_paths"]
        ]
        collector = {
            "read_only": True,
            "file_content_scope": "release-marker-hash-only",
        }
        disabled_collection_fields = (
            "environment_dumped",
            "process_command_lines_collected",
            "secret_values_collected",
            "pii_collected",
        )
        for field in disabled_collection_fields:
            collector[field] = False
        return {
            "schema_version": 1,
            "generated_at": "2026-08-28T00:00:00Z",
            "evidence_class": "VERIFIED_TEST",
            "source": "scripts/ops/plesk-readonly-audit.sh",
            "collector": collector,
            "system": system,
            "runtimes": runtimes,
            "services": services,
            "public_hosts": public_hosts,
            "service_paths": service_paths,
            "backup": {"status": status, "age_hours": 2},
            "restore": {"status": status},
        }


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import json
import os
import shutil
import subprocess  # nosec B404 - test intentionally executes the repository collector
import tempfile
import unittest
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
COLLECTOR = ROOT / "scripts/ops/plesk-readonly-audit.sh"
BASH = shutil.which("bash")


class PleskVhostDetectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if BASH is None:
            raise unittest.SkipTest("bash executable not available")

    def test_domain_and_subdomain_use_correct_plesk_info_utilities(self) -> None:
        expected = {
            "public_hosts": [
                {
                    "host": "menschlichkeit-oesterreich.at",
                    "health_path": "/",
                    "required": True,
                },
                {
                    "host": "api.menschlichkeit-oesterreich.at",
                    "health_path": "/api/version",
                    "required": True,
                },
            ],
            "service_paths": [],
        }
        with tempfile.TemporaryDirectory() as temporary_directory:
            temp = Path(temporary_directory)
            expected_path = temp / "expected.json"
            expected["public_hosts"] = [
                {**item, "required": str(item["required"]).lower()}
                for item in expected["public_hosts"]
            ]
            expected_path.write_text(json.dumps(expected), encoding="utf-8")
            invocation_log = temp / "plesk-invocations.log"
            fake_plesk = temp / "plesk"
            fake_plesk.write_text(
                "#!/usr/bin/env bash\n"
                "printf '%s\\n' \"$*\" >> \"$PLESK_TEST_LOG\"\n"
                "case \"$*\" in\n"
                "  version) printf 'Plesk Obsidian test\\n'; exit 0 ;;\n"
                "  'bin domain --info menschlichkeit-oesterreich.at') exit 0 ;;\n"
                "  'bin subdomain --info api.menschlichkeit-oesterreich.at') exit 0 ;;\n"
                "  *) exit 1 ;;\n"
                "esac\n",
                encoding="utf-8",
            )
            fake_plesk.chmod(0o755)
            environment = os.environ.copy()
            environment["PATH"] = f"{temp}{os.pathsep}{environment['PATH']}"
            environment["PLESK_TEST_LOG"] = str(invocation_log)
            environment["MOE_AUDIT_PUBLIC_HOSTS_B64"] = ""
            environment["MOE_AUDIT_SERVICE_PATHS_B64"] = ""
            environment["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{environment['PATH']}"

            result = subprocess.run(  # nosec B603 - fixed collector and absolute bash executable
                [
                    BASH,
                    str(COLLECTOR),
                    "--expected",
                    str(expected_path),
                    "--no-network",
                ],
                check=True,
                capture_output=True,
                text=True,
                env=environment,
            )
            actual = json.loads(result.stdout)
            invocations = invocation_log.read_text(encoding="utf-8")

        statuses = {
            item["host"]: item["plesk_vhost_status"]
            for item in actual["public_hosts"]
        }
        self.assertEqual(statuses["menschlichkeit-oesterreich.at"], "PASS")
        self.assertEqual(statuses["api.menschlichkeit-oesterreich.at"], "PASS")
        self.assertIn(
            "bin domain --info menschlichkeit-oesterreich.at", invocations
        )
        self.assertIn(
            "bin subdomain --info api.menschlichkeit-oesterreich.at", invocations
        )


if __name__ == "__main__":
    unittest.main()

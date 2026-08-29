"""Static regression tests for CI and security workflow contracts."""
from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = ROOT / ".github" / "workflows"


def read_workflow(name: str) -> str:
    return (WORKFLOWS / name).read_text(encoding="utf-8")


def run_blocks(workflow: str) -> list[str]:
    """Return literal-block shell scripts without parsing GitHub expressions."""
    blocks: list[str] = []
    current: list[str] = []
    run_indent: int | None = None

    for line in workflow.splitlines():
        indentation = len(line) - len(line.lstrip())
        if run_indent is None:
            if re.match(r"^\s*run:\s*\|\s*$", line):
                run_indent = indentation
                current = []
            continue

        if line.strip() and indentation <= run_indent:
            blocks.append("\n".join(current))
            run_indent = None
            current = []
            if re.match(r"^\s*run:\s*\|\s*$", line):
                run_indent = indentation
            continue
        current.append(line)

    if run_indent is not None:
        blocks.append("\n".join(current))
    return blocks


class CiSecurityWorkflowContractTests(unittest.TestCase):
    def test_openapi_drift_uses_canonical_api_dependencies(self) -> None:
        workflow = read_workflow("openapi-drift.yml")
        dev_requirements = (ROOT / "apps" / "api" / "requirements-dev.txt").read_text(
            encoding="utf-8"
        )

        self.assertIn(
            "python -m pip install -r apps/api/requirements-dev.txt", workflow
        )
        self.assertNotIn("fastapi==0.115.4", workflow)
        self.assertNotIn("from deepdiff import DeepDiff", workflow)
        self.assertIn("PUBLIC_APP_URL: 'https://app.test.invalid'", workflow)
        self.assertIn("-r requirements.txt", dev_requirements)
        self.assertIn("PyYAML==6.0.2", dev_requirements)

    def test_ci_and_wiki_do_not_interpolate_github_context_in_shell(self) -> None:
        ci = read_workflow("ci.yml")
        wiki = read_workflow("sync-wiki.yml")

        self.assertNotIn("${{ github.", "\n".join(run_blocks(ci)))
        self.assertNotIn("${{ github.", "\n".join(run_blocks(wiki)))
        self.assertIn("CI_EVENT_NAME: ${{ github.event_name }}", ci)
        self.assertIn("DEPLOY_REF: ${{ github.ref_name }}", ci)
        self.assertIn('printf \'**Branch**: %s\\n\' "$GITHUB_REF_NAME"', wiki)
        self.assertNotIn("git fetch --no-tags --prune --depth=1", ci)

    def test_ci_actions_are_pinned_and_permissions_are_minimal(self) -> None:
        ci = read_workflow("ci.yml")

        self.assertIn("permissions:\n  contents: read", ci)
        self.assertNotIn("security-events: write", ci)
        self.assertNotIn("actions: read", ci)
        self.assertIn(
            "actions/upload-artifact@6f51ac03b9356f520e9adb1b1b7802705f340c2b",
            ci,
        )
        self.assertIn(
            "codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f",
            ci,
        )
        self.assertIn(
            "docker/setup-buildx-action@37fe631027851001ddb9b187196cc803df7f5f0e",
            ci,
        )

    def test_security_gate_contracts_remain_blocking_and_auditable(self) -> None:
        gitleaks = read_workflow("gitleaks.yml")
        trivy = read_workflow("trivy.yml")
        dependency_review = read_workflow("dependency-review.yml")
        sbom = read_workflow("sbom-generation.yml")

        self.assertIn("--redact", gitleaks)
        self.assertIn("Fail on current-tree findings", gitleaks)
        self.assertNotIn("aquasec/trivy:latest", trivy)
        self.assertEqual(trivy.count("aquasec/trivy:0.74.0"), 3)
        self.assertEqual(trivy.count("--exit-code 1"), 3)
        self.assertEqual(trivy.count("Fail on high or critical findings"), 3)
        self.assertIn("security-events: write", trivy)
        self.assertIn("fail-on-severity: high", dependency_review)
        self.assertIn("pull-requests: read", dependency_review)
        self.assertIn("comment-summary-in-pr: never", dependency_review)
        self.assertIn("id-token: write", sbom)
        self.assertIn("cosign sign-blob", sbom)


if __name__ == "__main__":
    unittest.main()

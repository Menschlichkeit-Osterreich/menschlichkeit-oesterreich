"""Static tests for .github/workflows/plesk-live-audit.yml.

Validates that BSM secrets for the live-audit job are loaded in-job via
bsm-env-inject and are NEVER transported as cross-job outputs.
"""
from __future__ import annotations

import re
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/plesk-live-audit.yml"

# The four BSM keys that must NOT cross job boundaries.
FORBIDDEN_OUTPUT_KEYS = ["PLESK_SSH_PRIVATE_KEY", "PLESK_KNOWN_HOSTS", "PLESK_HOST", "REMOTE_USER"]


class PleskLiveAuditWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not WORKFLOW.exists():
            raise unittest.SkipTest(f"Workflow file not found: {WORKFLOW}")
        cls.raw = WORKFLOW.read_text(encoding="utf-8")
        cls.data = yaml.safe_load(cls.raw)

    # ─────────────────────────────────────────────────────────────────────────
    # Structure checks
    # ─────────────────────────────────────────────────────────────────────────

    def test_workflow_has_only_workflow_dispatch_trigger(self) -> None:
        """Workflow must be manually triggered only – no push/PR/schedule."""
        # PyYAML parses `on: workflow_dispatch:` as on={True: None}; use raw text.
        self.assertIn("workflow_dispatch", self.raw,
                      "workflow_dispatch trigger must be present")
        self.assertNotIn("on:\n  push", self.raw,
                         "push trigger must not be present in live-audit")
        # Also verify via parsed triggers where available
        triggers = self.data.get("on", {}) or {}
        if isinstance(triggers, dict):
            self.assertNotIn("push", triggers,
                             "push trigger must not be present in live-audit")
            self.assertNotIn("pull_request", triggers,
                             "pull_request trigger must not be present in live-audit")
            self.assertNotIn("schedule", triggers,
                             "schedule trigger must not be present in live-audit")

    def test_no_load_secrets_job(self) -> None:
        """The intermediate load-secrets job (reusable workflow call) must be removed."""
        jobs = self.data.get("jobs", {})
        self.assertNotIn("load-secrets", jobs,
                         "load-secrets job must not exist; secrets are loaded in-job")

    def test_live_audit_job_exists(self) -> None:
        """live-audit job must be present."""
        jobs = self.data.get("jobs", {})
        self.assertIn("live-audit", jobs)

    def test_live_audit_needs_only_prevalidation(self) -> None:
        """live-audit must depend only on prevalidation, not on load-secrets."""
        needs = self.data["jobs"]["live-audit"].get("needs", [])
        if isinstance(needs, str):
            needs = [needs]
        self.assertIn("prevalidation", needs,
                      "live-audit must depend on prevalidation")
        self.assertNotIn("load-secrets", needs,
                         "live-audit must NOT depend on load-secrets")

    # ─────────────────────────────────────────────────────────────────────────
    # Secret-transport checks (text-level, covers template expressions)
    # ─────────────────────────────────────────────────────────────────────────

    def test_no_needs_outputs_for_forbidden_keys(self) -> None:
        """None of the four BSM keys may be transported via needs.*.outputs.*."""
        # Match any expression like needs.<job>.outputs.KEY
        for key in FORBIDDEN_OUTPUT_KEYS:
            pattern = re.compile(
                r"\$\{\{[^}]*needs\.[a-zA-Z0-9_-]+\.outputs\." + re.escape(key) + r"[^}]*\}\}"
            )
            match = pattern.search(self.raw)
            self.assertIsNone(
                match,
                f"Secret key '{key}' must not be transported via needs.*.outputs.*; "
                f"found: {match.group(0) if match else ''}"
            )

    def test_bsm_env_inject_action_used_in_live_audit(self) -> None:
        """bsm-env-inject composite action must be called inside the live-audit job."""
        live_audit_steps = self.data["jobs"]["live-audit"].get("steps", [])
        uses_values = [
            step.get("uses", "") for step in live_audit_steps if isinstance(step, dict)
        ]
        self.assertTrue(any(".github/actions/bsm-env-inject" in u for u in uses_values),
                        "bsm-env-inject action must be used inside the live-audit job steps")

    def test_bsm_env_inject_uses_plesk_live_audit_profile(self) -> None:
        """bsm-env-inject must be called with profile=plesk-live-audit."""
        live_audit_steps = self.data["jobs"]["live-audit"].get("steps", [])
        for step in live_audit_steps:
            if not isinstance(step, dict):
                continue
            if ".github/actions/bsm-env-inject" in step.get("uses", ""):
                profile = step.get("with", {}).get("profile", "")
                self.assertEqual(
                    profile, "plesk-live-audit",
                    "bsm-env-inject must use profile 'plesk-live-audit'"
                )
                return
        self.fail("bsm-env-inject step not found in live-audit job")

    def test_bw_access_token_only_bootstrap(self) -> None:
        """BW_ACCESS_TOKEN must be the only secrets.* reference in the workflow."""
        # All ${{ secrets.X }} expressions
        secret_refs = set(re.findall(r"\$\{\{[^}]*secrets\.([A-Z0-9_]+)[^}]*\}\}", self.raw))
        self.assertEqual(secret_refs, {"BW_ACCESS_TOKEN"},
                         f"Only BW_ACCESS_TOKEN may be referenced as a GitHub Actions secret; found: {secret_refs}")

    def test_no_secrets_in_workflow_call_outputs(self) -> None:
        """Workflow-level outputs must not expose any of the four BSM secret keys."""
        wf_outputs = self.data.get("on", {}).get("workflow_call", {}).get("outputs", {})
        for key in FORBIDDEN_OUTPUT_KEYS:
            self.assertNotIn(
                key, wf_outputs,
                f"'{key}' must not be a workflow_call output"
            )

    # ─────────────────────────────────────────────────────────────────────────
    # Security guard-rails
    # ─────────────────────────────────────────────────────────────────────────

    def test_no_ssh_keyscan(self) -> None:
        """ssh-keyscan is forbidden; PLESK_KNOWN_HOSTS comes from BSM."""
        self.assertNotIn(
            "ssh-keyscan", self.raw,
            "ssh-keyscan must not be used; use BSM-provided known hosts"
        )

    def test_strict_host_key_checking_enabled(self) -> None:
        """StrictHostKeyChecking=yes must be present in SSH options."""
        self.assertIn(
            "StrictHostKeyChecking=yes", self.raw,
            "SSH options must include StrictHostKeyChecking=yes"
        )

    def test_no_mutating_operations(self) -> None:
        """Workflow must not contain deploy/restart/write operations."""
        forbidden_patterns = [
            r"\bsystemctl\b.*(restart|start|stop)\b",
            r"\bdocker(-compose)?\b.*(up|down|deploy|restart)\b",
            r"\brsync\b",
            r"\bscp\b",
            r"\bwp[\s]+(?:core|plugin|theme|db)\b",
        ]
        for pattern in forbidden_patterns:
            match = re.search(pattern, self.raw, re.IGNORECASE)
            self.assertIsNone(
                match,
                f"Mutating command pattern '{pattern}' must not appear in live-audit workflow"
            )

    def test_canonical_plesk_secret_names_present(self) -> None:
        """Live audit should use the canonical Plesk secret names."""
        for key in ("PLESK_HOST", "PLESK_KNOWN_HOSTS", "PLESK_SSH_PRIVATE_KEY", "REMOTE_USER"):
            self.assertIn(key, self.raw, f"Expected canonical secret name {key} in live-audit workflow")

    def test_no_secret_values_in_step_summary(self) -> None:
        """Forbidden keys must not be echoed into GITHUB_STEP_SUMMARY."""
        # Check that the raw text doesn't write any of the four keys directly to summary
        for key in FORBIDDEN_OUTPUT_KEYS:
            # Look for patterns like: echo "$PLESK_SSH_PRIVATE_KEY" >> "$GITHUB_STEP_SUMMARY"
            pattern = re.compile(
                r'(?:echo|printf|cat)[^#\n]*\$(?:{)?' + re.escape(key) + r'(?:})?[^#\n]*GITHUB_STEP_SUMMARY'
            )
            match = pattern.search(self.raw)
            self.assertIsNone(
                match,
                f"Secret key '{key}' must not be written to GITHUB_STEP_SUMMARY"
            )


if __name__ == "__main__":
    unittest.main()

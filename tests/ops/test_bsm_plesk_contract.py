"""Static contract checks for the BSM-backed Plesk workflows.

The test deliberately distinguishes a complete profile from an explicit owner
gate.  Until Bitwarden metadata has been checked read-only, the mapping must
remain incomplete and every affected workflow must fail closed instead of
falling back to a guessed user or port.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess  # nosec B404 - static test deliberately invokes a shell parser
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
MAPPING = ROOT / ".github/bsm-secret-ids.json"
ACTION = ROOT / ".github/actions/bsm-env-inject/action.yml"
DEPLOY_WORKFLOW = ROOT / ".github/workflows/deploy-plesk.yml"
LIVE_AUDIT_WORKFLOW = ROOT / ".github/workflows/plesk-live-audit.yml"
EXPECTED_STATE = ROOT / "config/plesk/expected-state.json"
REUSABLE_BSM_WORKFLOW = ROOT / ".github/workflows/reusable-bsm-secrets.yml"

PLESK_CONNECTION_KEYS = {
    "PLESK_HOST",
    "PLESK_PORT",
    "REMOTE_USER",
    "PLESK_SSH_PRIVATE_KEY",
    "PLESK_KNOWN_HOSTS",
}

DEPLOY_RUNTIME_KEYS = {
    "DATABASE_URL",
    "JWT_SECRET_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "MOE_API_TOKEN",
    "CIVICRM_SITE_KEY",
    "CIVICRM_API_KEY",
    "ALERTS_SLACK_WEBHOOK",
    "MICROSOFT_TENANT_ID",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_GRAPH_SENDER",
}

PROFILE_REQUIREMENTS = {
    "deploy-production": PLESK_CONNECTION_KEYS | DEPLOY_RUNTIME_KEYS,
    "plesk-live-audit": PLESK_CONNECTION_KEYS,
}

# These are not a successful mapping. They explicitly encode the only two
# owner actions still blocking a BSM profile update. Remove an item only after
# the corresponding BSM `id`, `key`, `projectId`, and `revisionDate` metadata
# was checked read-only and the mapping update is reviewed.
OWNER_GATED_MISSING_MEMBERS = {
    "deploy-production": {"REMOTE_USER"},
    "plesk-live-audit": {"PLESK_PORT"},
}


class BsmPleskContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
        cls.action = ACTION.read_text(encoding="utf-8")
        cls.deploy_raw = DEPLOY_WORKFLOW.read_text(encoding="utf-8")
        cls.live_audit_raw = LIVE_AUDIT_WORKFLOW.read_text(encoding="utf-8")
        cls.deploy = yaml.safe_load(cls.deploy_raw)
        cls.live_audit = yaml.safe_load(cls.live_audit_raw)
        cls.expected_state = json.loads(EXPECTED_STATE.read_text(encoding="utf-8"))

    def test_required_profile_membership_is_complete_or_explicitly_blocked(self) -> None:
        """No required BSM membership may silently disappear from the contract."""
        profiles = self.mapping["profiles"]
        for profile, required_keys in PROFILE_REQUIREMENTS.items():
            self.assertIn(profile, profiles)
            mapped_keys = {
                item["env_var"] for item in profiles[profile].get("secrets", [])
            }
            missing = required_keys - mapped_keys
            self.assertEqual(
                missing,
                OWNER_GATED_MISSING_MEMBERS[profile],
                f"{profile} has an undocumented BSM membership gap",
            )

    def test_bsm_inject_action_requires_every_connection_key(self) -> None:
        """The action must fail closed; it may not invent a user or port fallback."""
        self.assertIn('case "$BSM_PROFILE" in', self.action)
        for profile, required_keys in PROFILE_REQUIREMENTS.items():
            profile_block = re.search(
                rf"{re.escape(profile)}\).*?required_keys=\((.*?)\)\s*;;",
                self.action,
                re.DOTALL,
            )
            self.assertIsNotNone(profile_block, f"{profile} required-key block missing")
            for key in required_keys:
                self.assertIn(key, profile_block.group(1))
        self.assertNotRegex(self.action, r"PLESK_PORT[^\n]*:-")
        self.assertNotRegex(self.action, r"REMOTE_USER[^\n]*:-")

    def test_injection_stays_inside_the_ssh_consuming_job(self) -> None:
        """No connection profile may move across jobs or GitHub job outputs."""
        for workflow in (self.deploy, self.live_audit):
            for job in workflow["jobs"].values():
                self.assertNotIn("outputs", job)

        deploy_steps = self.deploy["jobs"]["deploy"]["steps"]
        deploy_injections = [
            index
            for index, step in enumerate(deploy_steps)
            if ".github/actions/bsm-env-inject" in step.get("uses", "")
        ]
        ssh_agent_index = next(
            index
            for index, step in enumerate(deploy_steps)
            if "ssh-agent" in step.get("run", "")
        )
        self.assertEqual(
            deploy_injections[0],
            ssh_agent_index - 1,
            "Plesk secrets must be injected immediately before the first SSH use",
        )

        live_steps = self.live_audit["jobs"]["live-audit"]["steps"]
        live_injection_index = next(
            index
            for index, step in enumerate(live_steps)
            if ".github/actions/bsm-env-inject" in step.get("uses", "")
        )
        ssh_preflight_index = next(
            index
            for index, step in enumerate(live_steps)
            if "SSH Connectivity Preflight" in step.get("name", "")
        )
        self.assertEqual(
            live_injection_index,
            ssh_preflight_index - 1,
            "Live-audit secrets must be injected immediately before SSH preflight",
        )

    def test_live_audit_uses_connection_port_and_runtime_path_contract(self) -> None:
        """Live collection consumes a configured port and no hard-coded service path."""
        self.assertEqual(
            self.live_audit["jobs"]["live-audit"].get("environment"),
            "plesk-readonly-audit",
        )
        self.assertIn('-p "$PLESK_PORT"', self.live_audit_raw)
        self.assertNotIn("subdomains/", self.live_audit_raw)
        self.assertNotIn("'httpdocs'", self.live_audit_raw)

        allowed_path_envs = {
            "MOE_AUDIT_FRONTEND_PATH",
            "MOE_AUDIT_API_PATH",
            "MOE_AUDIT_CRM_PATH",
            "MOE_AUDIT_CRM_NATIVE_PATH",
            "MOE_AUDIT_GAMES_PATH",
            "MOE_AUDIT_FORUM_PATH",
        }
        configured_path_envs = {
            item["path_env"] for item in self.expected_state["service_paths"]
        }
        self.assertEqual(configured_path_envs, allowed_path_envs)
        self.assertTrue(
            all("path" not in item for item in self.expected_state["service_paths"]),
            "expected-state must contain public path_env names only",
        )

    def test_live_audit_embedded_bash_is_syntax_valid(self) -> None:
        """The runner must be able to parse every read-only audit shell step."""
        bash = shutil.which("bash")
        if bash is None:
            self.skipTest("bash executable not available")
        for index, step in enumerate(self.live_audit["jobs"]["live-audit"]["steps"]):
            script = step.get("run")
            if not script:
                continue
            result = subprocess.run(  # nosec B603 - fixed local shell parser
                [bash, "-n"],
                input=script.replace("\r", "").encode("utf-8"),
                check=False,
                capture_output=True,
            )
            self.assertEqual(
                result.returncode,
                0,
                "live-audit step "
                f"{index} has invalid Bash syntax: {result.stderr.decode('utf-8', errors='replace')}",
            )

    def test_workflows_do_not_embed_bsm_uuids_or_connection_values(self) -> None:
        """UUIDs remain in the mapping and connection values remain in BSM."""
        uuid_pattern = r"\b[0-9a-f]{8}-[0-9a-f-]{27,36}\b"
        for workflow in (self.deploy_raw, self.live_audit_raw, self.action):
            self.assertNotRegex(workflow, uuid_pattern)
        for key in PLESK_CONNECTION_KEYS:
            self.assertNotRegex(
                self.live_audit_raw,
                rf"(?:echo|printf)[^\n]*\${{{key}}}[^\n]*GITHUB_STEP_SUMMARY",
            )

    def test_unused_cross_job_secret_output_workflow_is_retired(self) -> None:
        """No unused reusable workflow may make BSM values cross job boundaries."""
        self.assertFalse(
            REUSABLE_BSM_WORKFLOW.exists(),
            "reusable-bsm-secrets.yml must stay retired; use in-job injection instead",
        )


if __name__ == "__main__":
    unittest.main()

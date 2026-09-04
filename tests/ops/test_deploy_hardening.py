"""Static hardening checks for the Plesk/forum deployment workflows.

Track B / PR #566. These tests assert the deployment contract purely from
repository files (no live access):

  * production never deploys from a bare push to main (manual/dispatch only, 5.1);
  * the production concurrency key is stable and never keyed on github.run_id (5.2);
  * the forum workflow is manual-only and pulls PLESK connection secrets from
    Bitwarden Secrets Manager instead of duplicating them as GitHub secrets (5.3);
  * strict host-key checking stays on and ssh-keyscan is never used as a trust
    substitute (5.3).
"""
from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
DEPLOY_PLESK = ROOT / ".github/workflows/deploy-plesk.yml"
DEPLOY_FORUM = ROOT / ".github/workflows/deploy-forum.yml"
BSM_ACTION = ROOT / ".github/actions/bsm-env-inject/action.yml"
MAPPING = ROOT / ".github/bsm-secret-ids.json"

_PLACEHOLDER_UUIDS = {"UPDATE_VALUE_IN_VAULT"}


def _on_section(workflow: dict):
    # PyYAML parses the top-level `on:` key as the boolean True (YAML 1.1).
    return workflow.get(True, workflow.get("on"))


class DeployHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.plesk_raw = DEPLOY_PLESK.read_text(encoding="utf-8")
        cls.forum_raw = DEPLOY_FORUM.read_text(encoding="utf-8")
        cls.action_raw = BSM_ACTION.read_text(encoding="utf-8")
        cls.plesk = yaml.safe_load(cls.plesk_raw)
        cls.forum = yaml.safe_load(cls.forum_raw)
        cls.mapping = json.loads(MAPPING.read_text(encoding="utf-8"))

    def test_production_deploy_is_not_triggered_by_bare_push(self) -> None:
        """5.1: a push to main must not perform a live production write."""
        deploy_if = self.plesk["jobs"]["deploy"]["if"]
        self.assertNotIn(
            "github.event_name == 'push'",
            deploy_if,
            "production deploy must not run on push",
        )
        self.assertIn(
            "github.event_name == 'workflow_dispatch'",
            deploy_if,
            "production deploy must be gated to manual dispatch",
        )
        # The only job that writes to production carries environment: production.
        self.assertEqual(self.plesk["jobs"]["deploy"].get("environment"), "production")

    def test_production_concurrency_key_is_stable(self) -> None:
        """5.2: never key production concurrency on github.run_id."""
        concurrency = self.plesk["concurrency"]
        self.assertEqual(concurrency["group"], "deploy-production")
        self.assertFalse(concurrency["cancel-in-progress"])
        self.assertNotIn("run_id", concurrency["group"])

    def test_forum_workflow_is_manual_only(self) -> None:
        """5.1: the forum production workflow cannot be triggered by a push."""
        on_section = _on_section(self.forum)
        self.assertIn("workflow_dispatch", on_section)
        self.assertNotIn("push", on_section)

    def test_forum_uses_bsm_injection(self) -> None:
        """5.3: forum secrets come from BSM (profile deploy-forum)."""
        steps = self.forum["jobs"]["deploy"]["steps"]
        inject = [s for s in steps if ".github/actions/bsm-env-inject" in s.get("uses", "")]
        self.assertEqual(len(inject), 1, "forum must inject BSM secrets exactly once")
        self.assertEqual(inject[0]["with"]["profile"], "deploy-forum")

    def test_forum_has_no_direct_plesk_ssh_secret_duplication(self) -> None:
        """5.3: no direct secrets.PLESK_* / secrets.REMOTE_USER duplication."""
        for forbidden in (
            "secrets.PLESK_HOST",
            "secrets.REMOTE_USER",
            "secrets.PLESK_SSH_PRIVATE_KEY",
            "secrets.PLESK_KNOWN_HOSTS",
            "secrets.PLESK_PORT",
        ):
            self.assertNotIn(
                forbidden,
                self.forum_raw,
                f"forum workflow must not reference {forbidden} directly",
            )

    def test_strict_host_key_checking_and_no_keyscan(self) -> None:
        """5.3: strict host-key checking stays on; no ssh-keyscan trust substitute."""
        self.assertIn("StrictHostKeyChecking yes", self.plesk_raw)
        for raw in (self.plesk_raw, self.forum_raw):
            # ssh-keyscan may only appear inside a comment (an explicit warning),
            # never as an executed command.
            for line in raw.splitlines():
                if "ssh-keyscan" in line:
                    before = line.split("ssh-keyscan", 1)[0]
                    self.assertIn(
                        "#",
                        before,
                        f"ssh-keyscan must not be an executed command: {line!r}",
                    )
            self.assertNotRegex(raw, r"StrictHostKeyChecking[ =]no")

    def test_forum_profile_required_key_parity(self) -> None:
        """The forum profile is complete and the action validates REMOTE_USER."""
        forum_secrets = {
            item["env_var"]: item.get("uuid", "")
            for item in self.mapping["profiles"]["deploy-forum"]["secrets"]
        }
        for key in (
            "PLESK_HOST",
            "PLESK_PORT",
            "REMOTE_USER",
            "PLESK_SSH_PRIVATE_KEY",
            "PLESK_KNOWN_HOSTS",
        ):
            self.assertIn(key, forum_secrets, f"deploy-forum profile missing {key}")
            uuid = forum_secrets[key]
            self.assertNotIn(uuid, _PLACEHOLDER_UUIDS)
            self.assertFalse(uuid.startswith("PLACEHOLDER"), f"{key} is a placeholder")

        block = re.search(
            r"deploy-staging\|deploy-forum\).*?required_keys=\((.*?)\)\s*;;",
            self.action_raw,
            re.DOTALL,
        )
        self.assertIsNotNone(block, "deploy-forum required-key block missing")
        self.assertIn("REMOTE_USER", block.group(1))


if __name__ == "__main__":
    unittest.main()

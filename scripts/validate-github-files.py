#!/usr/bin/env python3
"""
Validate GitHub access using GH_TOKEN without leaking secrets.

Behavior:
- Reads GH_TOKEN from env (GH_TOKEN or GITHUB_TOKEN); if missing, tries to load from .env locally without logging values.
- Performs a minimal authenticated API call to /user to verify validity.
- Prints a concise success/failure summary; never prints the token.

Exit codes:
- 0 on success, 1 on failure.
"""

import json
import os
import sys
from pathlib import Path

import urllib.request
import urllib.error


def load_env_dotenv(env_path: Path) -> None:
	if not env_path.exists():
		return
	try:
		for line in env_path.read_text(encoding="utf-8").splitlines():
			line = line.strip()
			if not line or line.startswith("#"):
				continue
			if "=" not in line:
				continue
			key, value = line.split("=", 1)
			key = key.strip()
			value = value.strip().strip('"').strip("'")
			# Do not override existing environment
			os.environ.setdefault(key, value)
	except Exception:
		# Silently ignore dotenv parse errors; do not crash MCP
		pass


def get_token() -> str:
	token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
	if token:
		return token.strip()
	# Fallback: try local .env and .env.local (developer machine only)
	repo_root = Path(__file__).resolve().parents[1]
	for fname in (".env", ".env.local"):
		env_path = repo_root / fname
		load_env_dotenv(env_path)
		token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
		if token:
			return token.strip()
	return ""


def github_get(path: str, token: str):
	req = urllib.request.Request(
		url=f"https://api.github.com{path}",
		headers={
			"Authorization": f"Bearer {token}",
			"Accept": "application/vnd.github+json",
			"User-Agent": "moe-mcp-validator/1.0",
		},
	)
	try:
		with urllib.request.urlopen(req, timeout=15) as resp:
			data = resp.read()
			return json.loads(data.decode("utf-8"))
	except urllib.error.HTTPError as e:
		return {"error": True, "status": e.code, "message": e.reason}
	except Exception as e:
		return {"error": True, "status": 0, "message": str(e)}


def main() -> int:
	token = get_token()
	if not token:
		print(json.dumps({
			"ok": False,
			"reason": "GH_TOKEN not found in environment; set GH_TOKEN or GITHUB_TOKEN"
		}))
		return 1

	# 1) Versuche generischen /user-Check (klappt mit Classic PAT & vielen Fine-Grained Tokens)
	res = github_get("/user", token)
	if isinstance(res, dict) and not res.get("error") and res.get("login"):
		print(json.dumps({
			"ok": True,
			"mode": "user",
			"login": res.get("login"),
			"id": res.get("id"),
			"type": res.get("type"),
		}))
		return 0

	# 2) Fallback für Fine-Grained, repo-gebundene PATs: prüfe Repo-Metadatenzugriff
	fallback_repo = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
	repo_res = github_get(f"/repos/{fallback_repo}", token)
	if isinstance(repo_res, dict) and not repo_res.get("error") and repo_res.get("full_name") == fallback_repo:
		print(json.dumps({
			"ok": True,
			"mode": "repo",
			"repo": repo_res.get("full_name"),
			"private": repo_res.get("private"),
			"default_branch": repo_res.get("default_branch"),
		}))
		return 0

	# 3) Fehlerfall melden (keine Token-Werte loggen)
	reason = None
	status = None
	if isinstance(res, dict) and res.get("error"):
		reason = res.get("message")
		status = res.get("status")
	elif isinstance(repo_res, dict) and repo_res.get("error"):
		reason = repo_res.get("message")
		status = repo_res.get("status")

	print(json.dumps({
		"ok": False,
		"reason": reason or "unknown",
		"status": status or 0,
	}))
	return 1


if __name__ == "__main__":
	sys.exit(main())


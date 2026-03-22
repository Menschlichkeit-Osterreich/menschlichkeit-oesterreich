# PR Drafts

Last updated: 2026-03-20

---

## Env Contract Cleanup Closeout

Recommended title:

```text
chore: complete env contract cleanup across runtime ci and docs
```

Suggested PR body:

```md
## Zusammenfassung

Env contract cleanup end to end completed. Root env surface reduced and aligned across tracked templates and runtime fallbacks. Canonical variable names are now used in app runtime, validation, CI, and setup docs. Local env files remain ignored while tracked examples are preserved. Verification succeeded for secret suite, frontend build, and Python compile checks. Full pytest execution is currently blocked by an existing FastAPI and Starlette dependency conflict in `apps/api/requirements.txt`. Shell syntax checks were executed locally via Git Bash on this Windows host. External credential rotation remains required outside the repository, including GitHub-related tokens such as `GH_TOKEN` and `OC_GITHUB_TOKEN`.

## Status

- `Done:` env contract cleanup
- `Blocked:` full pytest run due to dependency resolution
- `Pending:` external secret rotation

## Checkliste

- [x] Tests hinzugefuegt/aktualisiert, soweit im Scope des Env-Cleanup noetig
- [x] Security: Keine Secrets/Keys in getrackten Templates, Secret-Validation aktualisiert
- [ ] SBOM/CodeQL Checks gruen
- [ ] i18n: Keys & ICU gueltig (falls UI betroffen)

## Hinweise fuer Reviewer

- Verified:
  - `python scripts/validate-secrets.py --mode suite`
  - `npm run build --workspace=@moe/frontend`
  - `python -m compileall apps/api/app apps/api/scripts scripts/validate-secrets.py`
  - `bash -n scripts/setup-local.sh`
  - `bash -n scripts/start-api-dev.sh`
- Blocked:
  - `python -m pytest -q tests/` because `fastapi==0.115.4` conflicts with `starlette==0.49.1` in `apps/api/requirements.txt`
- Pending outside repo:
  - rotation of `GH_TOKEN`, `OC_GITHUB_TOKEN`, database, mail, Stripe, and other third-party credentials
```

Notes:

- Keep the current PR code-frozen; dependency repair and external secret rotation are intentionally split into follow-up work.
- Copy the body above into the active GitHub PR once `gh` or browser-based GitHub access is available on the workstation.

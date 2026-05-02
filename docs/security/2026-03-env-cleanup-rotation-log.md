# Env Cleanup Rotation Log 2026-03

Status: `open`

## Purpose

This log mirrors the external ops/security rotation task for credentials that
must be treated as compromise-suspect after the env contract cleanup. The
authoritative operational tracker remains outside the repository; this file is
the technical audit mirror for engineering and release review.

## Scope

- Local `.env` values previously used for development must be treated as
  sensitive and rotated provider-side.
- The env cleanup PR is implementation-complete, but release closeout is not
  complete until the required external rotations are documented here and in the
  private ops tracker.
- This file does not store secret values. Only ownership, dates, evidence, and
  revocation state belong here.
- GitHub configuration values such as `GITHUB_REPO` and `GITHUB_OWNER` should
  be validated after rotation work, but they are not secrets and do not require
  credential rotation.

## Implementation Progress (2026-04-28)

- ✅ Removed obsolete script `scripts/transfer-ssh-to-github.ps1` (contained hardcoded sample credentials and encouraged private key copy flow).
- ✅ Removed empty script `scripts/setup-plesk-ssh-key.sh` (dead path, no operational value).
- ✅ Updated `runbooks/COMPLETE_BSM_CONSOLIDATION.md` to reflect current state: Microsoft Graph UUID mapping is present and no longer blocked on placeholder retrieval.
- ✅ SSH workflow alignment completed: active workflows now prefer `PLESK_SSH_PRIVATE_KEY` with legacy fallback to `PLESK_SSH_KEY`.
- ✅ SSH key rotation executed on 2026-04-28 for repository and environments (`forum-production`, `production`, `stage`, `staging`).
- ⏳ Pending manual operations remain unchanged: provider-side credential rotations and revocation evidence.

## Next Execution Window

The next operational run should capture concrete evidence in this order:

1. SSH key rotation + known_hosts refresh proof
1. GitHub token rotation + revocation proof
1. Database credential rotation + application reconnect proof
1. Mail credential rotation + delivery proof
1. Stripe credential rotation + webhook signature proof
1. Residual third-party token rotation + integration smoke proof

For each step, update the tracking table row immediately and attach the evidence artifact path.

## Source References

- `docs/security/GH-PAT-ROTATION.md`
- `docs/security/secrets-catalog.md`
- `docs/security/incidents/2026-03-secret-exposure-response.md`
- `secrets/SECRETS-AUDIT.md`

## Rotation Order

1. SSH keys and host trust material
1. GitHub tokens
1. Database credentials
1. Mail credentials
1. Stripe/payment credentials
1. Remaining API or third-party tokens

## Tracking Table

| System           | Secret class                                               | Rotated | Owner  | Date       | Evidence                                                                             | Old credential revoked                                           |
| ---------------- | ---------------------------------------------------------- | ------- | ------ | ---------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| SSH              | `PLESK_SSH_PRIVATE_KEY`, `PLESK_KNOWN_HOSTS`               | Yes     | DevOps | 2026-04-28 | GitHub Secrets updated via gh CLI (repo + forum-production/production/stage/staging) | Pending removal of previously deployed public key on target host |
| GitHub           | `GH_TOKEN`, `OC_GITHUB_TOKEN`, repo or environment tokens  | No      | TBD    | TBD        | TBD                                                                                  | No                                                               |
| Database         | local dev DB passwords and shared DB credentials           | No      | TBD    | TBD        | TBD                                                                                  | No                                                               |
| Mail             | mailbox passwords, SMTP credentials                        | No      | TBD    | TBD        | TBD                                                                                  | No                                                               |
| Stripe           | `STRIPE_SECRET_KEY` and related webhook or restricted keys | No      | TBD    | TBD        | TBD                                                                                  | No                                                               |
| Third-party APIs | remaining provider tokens and integration credentials      | No      | TBD    | TBD        | TBD                                                                                  | No                                                               |

## Evidence Artifact Convention

Use a single folder per execution date under `quality-reports/security-rotation/YYYY-MM-DD/`.

- `01-github-rotation.md`
- `02-ssh-rotation.md`
- `03-database-rotation.md`
- `04-mail-rotation.md`
- `05-stripe-rotation.md`
- `06-third-party-rotation.md`
- `99-revocation-proof.md`

## Required Evidence Per Rotation

- provider-side rotation completed
- GitHub Secrets, Environments, or other secure stores updated
- affected application path verified after replacement
- old credential explicitly revoked or disabled
- private ops/security task updated with timestamp and owner

## Smoke Checks After Rotation

- GitHub authentication and workflow access
- API startup and protected endpoints
- mail send path or SMTP-backed automation
- payment configuration and webhook handling
- deployment or integration paths that depend on rotated credentials

## Closeout Notes

- The env cleanup PR should be merged with an honest blocker note if dependency
  repair is still pending.
- The rotation task has higher operational priority than the Python dependency
  follow-up because it addresses potentially exposed credentials.

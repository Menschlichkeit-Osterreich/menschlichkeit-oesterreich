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

## Source References

- `docs/security/GH-PAT-ROTATION.md`
- `docs/security/secrets-catalog.md`
- `docs/security/incidents/2026-03-secret-exposure-response.md`
- `secrets/SECRETS-AUDIT.md`

## Rotation Order

1. GitHub tokens
2. Database credentials
3. Mail credentials
4. Stripe/payment credentials
5. Remaining API or third-party tokens

## Tracking Table

| System | Secret class | Rotated | Owner | Date | Evidence | Old credential revoked |
| --- | --- | --- | --- | --- | --- | --- |
| GitHub | `GH_TOKEN`, `OC_GITHUB_TOKEN`, repo or environment tokens | No | TBD | TBD | TBD | No |
| Database | local dev DB passwords and shared DB credentials | No | TBD | TBD | TBD | No |
| Mail | mailbox passwords, SMTP credentials | No | TBD | TBD | TBD | No |
| Stripe | `STRIPE_SECRET_KEY` and related webhook or restricted keys | No | TBD | TBD | TBD | No |
| Third-party APIs | remaining provider tokens and integration credentials | No | TBD | TBD | TBD | No |

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

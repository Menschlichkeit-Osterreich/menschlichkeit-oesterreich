# Deploy Secret Handoff Verification - 2026-04-24

## Scope

Production API deploy path hardening for Bitwarden Secret Manager handoff:

- GitHub Actions secret loading contract
- Deploy workflow preflight enforcement
- Runtime startup fail-fast checks

## Contract (deploy-production)

Required keys:

- DATABASE_URL
- JWT_SECRET_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- MOE_API_TOKEN
- N8N_WEBHOOK_SECRET
- CIVICRM_SITE_KEY
- CIVICRM_API_KEY
- ALERTS_SLACK_WEBHOOK
- MICROSOFT_TENANT_ID
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- MICROSOFT_GRAPH_SENDER

## Implemented Hardening

1. Secret loaders switched to profile-driven iteration with strict fail-fast for:

- missing profile
- missing env_var or uuid mapping
- placeholder UUID values
- empty resolved secrets

2. Production contract enforcement added in both loaders.

3. Deploy preflight expanded to validate all required production contract keys.

4. API runtime overlay now writes and merges the full contract into .env (deterministic replacement of contract keys).

5. API startup now enforces runtime contract in production (or STRICT_SECRET_CONTRACT=true).

6. Payments Slack alert path now resolves webhook via canonical secret provider.

## Local Verification (completed)

- API tests: passed (full test task)
- Governance check: passed
- Static diagnostics: no new errors on edited API/workflow files

## Live Verification (pending)

The following must be executed in production pipeline/runtime:

1. Trigger workflow .github/workflows/deploy-plesk.yml with target service api.
2. Confirm preflight logs show all 13 contract keys as present.
3. Confirm API overlay file on runner includes all 13 keys and MAIL_TRANSPORT=graph.
4. Confirm remote merge replaces all contract keys in API .env.
5. Confirm API restart succeeds and /healthz + /readyz return HTTP 2xx.
6. Trigger one Graph mail path and one payment failure Slack path to prove runtime consumption.

## Result Status

- Local hardening and validation: COMPLETE
- Live production proof: PENDING

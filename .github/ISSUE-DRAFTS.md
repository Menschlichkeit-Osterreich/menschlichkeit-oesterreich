Issue Drafts and Updates

Last updated: 2026-03-08 (automated codebase analysis)

---

## Previously Drafted Issues (unchanged)

### 1. Update Issue #145 – [P0][area/n8n] WebhookQueue Processor

- Implemented:
  - Redis-backed queue with endpoints: /queue/push (Idempotency-Key), /queue/pop, /queue/ack, /queue/fail (exponential backoff, DLQ)
  - /queue/stats for monitoring (main/delayed/dlq, oldest_age)
  - n8n workflows: WebhookQueue_Processor, Queue Monitor (Slack + email alerts), DLQ Admin (manual)
  - JWT protection for queue and /civicrm passthrough (allowlist)
- Next:
  - Optional: Idempotency TTL configurable, DLQ inspector UI in frontend (partially added: AdminQueue page)

Suggested comment for #145:

> Backend queue + monitoring delivered. Added JWT-protected endpoints (push/pop/ack/fail/stats, DLQ list/requeue/purge), idempotency support, n8n workflows (enqueue + worker + alerts), and a basic Admin Queue page. Propose to close and track UI polish under a follow-up issue.

### 2. New Issue – Frontend: Admin DLQ UI (polish)

Title: [P1][area/frontend] Admin DLQ UI – list/requeue/purge with pagination and role gating
Body:

- Add pagination and search to DLQ list
- Add role-based visibility (admin-only link in Nav)
- Confirm dialogs and success toasts
- Tests (basic rendering + API calls mocked)

### 3. New Issue – Frontend: Adopt PageHeader across pages

Title: [P3][area/frontend] Adopt PageHeader in Donate/Join/Success and remaining pages
Body:

- Use PageHeader for consistent titles/breadcrumbs
- Verify A11y (headings hierarchy, landmarks)

### 4. New Issue – Receipts: PDF styling + numbering

Title: [P2][area/backend] Receipt PDF styling (logo/addresses) and SSE in S3 uploads
Body:

- Improve PDF layout (branding, footer note, tax info)
- Add S3 Server-Side Encryption on upload
- Lifecycle policy doc (retention, legal)

### 5. New Issue – CiviCRM mappings documentation

Title: [P3][area/docs] Document payment_instrument_id and financial_type_id mappings
Body:

- Provide example JSON for PAYMENT_INSTRUMENT_MAP_JSON and FINANCIAL_TYPE_MAP_JSON
- Note how to fetch IDs from CiviCRM option values

### 6. New Issue – PSP: Webhook → Receipt automation

Title: [P2][area/backend] Auto-generate + email receipt on successful webhook events
Body:

- Stripe: payment_intent.succeeded → receipt generation
- PayPal: capture success → receipt generation
- Allow opt-out for anonymous donations

---

## New Issues from Codebase Analysis (2026-03-08)

### 7. New Issue – Security: Harden Content Security Policy

Title: [P1][area/security] Remove unsafe-inline/unsafe-eval from CSP headers
File: `apps/api/app/middleware/security.py` lines 119–120
Body:

The current CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`,
which defeats XSS protection entirely. Likewise `style-src` allows
`'unsafe-inline'`.

Steps:

- Audit which inline scripts/styles are actually needed
- Replace with nonces (FastAPI middleware generates per-request nonce, injects
  into templates and CSP header) or hashes for static inline content
- Remove `'unsafe-eval'` — refactor any `eval()`/`new Function()` usage
- Add CSP report-only mode first to catch violations before enforcing

References:

- `security.py:119` `"script-src 'self' 'unsafe-inline' 'unsafe-eval'"`
- `security.py:120` `"style-src 'self' 'unsafe-inline'"`

### 8. New Issue – Privacy/DSGVO: Implement JWT Token Revocation on Account Deletion

Title: [P1][area/privacy] JWT token blacklist missing – deleted users can re-authenticate
File: `apps/api/app/routers/privacy.py` line 304
Body:

When a user requests account deletion, their existing JWT tokens are not
invalidated. A deleted user who still holds a valid token can continue to
access protected endpoints until the token expires.

Steps:

- Implement an in-memory or Redis-backed token blacklist
- On deletion: add `jti` (JWT ID) of all known tokens for that user to the
  blacklist with TTL = remaining token lifetime
- Update `verify_jwt_token` in `shared.py` to reject blacklisted `jti` values
- Consider adding `jti` claim to all issued tokens if not already present

References:

- `privacy.py:304` `# 4. JWT Token Revocation (TODO: in-memory blacklist)`

### 9. New Issue – Privacy/DSGVO: Complete PostgreSQL Cascade Deletion

Title: [P2][area/privacy] Incomplete data deletion – PostgreSQL records not removed (DSGVO)
File: `apps/api/app/routers/privacy.py` line 255–263
Body:

The DSGVO deletion endpoint logs PostgreSQL cascade deletion as `"planned"` but
does not execute it. Records in `UserAchievement`, `GameSession`, and
`UserProgress` are not deleted.

Steps:

- Configure Prisma Python client (or use asyncpg/SQLAlchemy directly)
- Implement CASCADE DELETE for the entities listed in the deletion log
- Add integration test asserting all records are removed after deletion
- Update the deletion audit log to reflect actual status (not "planned")

References:

- `privacy.py:255-263` PostgreSQL block with `"status": "planned"` note

### 10. New Issue – Auth: Implement forgotPassword API endpoint

    Title: [P2][area/backend] Backend endpoint `forgotPassword` not implemented
    File: `website/assets/js/auth-handler.js` line 439
    Body:

The frontend `handleForgotPassword()` function contains a mock `setTimeout`
instead of calling an actual backend API. There is no `/auth/forgot-password`
or `/auth/reset-password` endpoint in the API.

Steps:

- Add `POST /auth/forgot-password` endpoint: accept email, generate signed
  reset token (short-lived, single-use), send via email (n8n or SMTP)
- Add `POST /auth/reset-password` endpoint: verify token, update password hash
- Implement rate limiting on forgot-password to prevent enumeration
- Connect `auth-handler.js` to the actual endpoints
- Remove mock timeout

References:

- `auth-handler.js:439` `// TODO: Backend-Team muss den API-Endpunkt 'forgotPassword' implementieren.`

### 11. New Issue – API: Register security router in main.py

    Title: [P2][area/backend] Security API endpoints unreachable – router not mounted
    File: `apps/api/app/routers/security.py`
    Body:

The `security.py` router is defined but never imported or mounted in `main.py`.
All endpoints under `/security/*` (sessions, logs, alerts, scan) return 404.

Steps:

- Add `from app.routers import security` to `main.py`
- Add `app.include_router(security.router)` alongside the existing routers
- Update `routers/__init__.py` to export `security_router`
- Verify no auth guards are missing on sensitive endpoints

References:

- `routers/security.py` — router defined but not mounted
- `main.py` — only `metrics` and `privacy` routers are included

### 12. New Issue – API: Fix duplicate privacy router registration

    Title: [P3][area/backend] Privacy router registered twice in main.py – duplicate routes
    File: `apps/api/app/main.py`
    Body:

The privacy router is imported and registered in two separate places in
`main.py`. The first registration is inside a `try/except` block that silently
swallows exceptions; the second is an unconditional duplicate. This causes
route conflicts and makes errors invisible.

Steps:

- Remove the duplicated `try/except` import block
- Keep only the unconditional `include_router` call
- Add a startup health-check log that lists all mounted routes for visibility

References:

- `main.py` silent `except: pass` pattern around router import

### 13. New Issue – Metrics: CiviCRM integration for dashboard endpoints

    Title: [P2][area/backend] Dashboard metrics return zeros – CiviCRM integration pending
    File: `apps/api/app/routers/metrics.py`
    Body:

All three metrics endpoints (`/metrics/members`, `/metrics/finance`,
`/metrics/activity`) return empty/zero mock data. The Vorstand/Kassier
dashboard is non-functional.

Steps:

- Implement `_fetch_civicrm_member_stats()` using CiviCRM APIv4
  `Contact.get` / `Membership.get` with status and date filters
- Implement `_fetch_civicrm_finance_stats()` using `Contribution.get`
  with MTD/YTD date windows and SUM aggregation
- Implement `_fetch_civicrm_activity_stats()` using `Activity.get`
  ordered by date DESC, limited to recent entries
- Add 5–10 minute caching layer (in-memory or Redis) to reduce CiviCRM load
- Add unit tests with mocked CiviCRM responses

References:

- `metrics.py:39,70,101` — three TODO stubs returning zeros/empty
- `metrics.py:240-280` — implementation roadmap comments

### 14. New Issue – Security: Integrate security monitoring with real data sources

    Title: [P3][area/security] Security monitoring returns hardcoded placeholder values
    File: `security/monitoring.py` lines 250–293
    Body:

Five metric functions in `security/monitoring.py` return hardcoded values
(1337 logins, 42 sessions, etc.) instead of querying real data sources.
The DevOps integration TODOs reference Auth0/Keycloak and Redis/DB.

Functions to implement:

- `_query_total_logins()` → Auth0 / Keycloak audit log API
- `_query_active_sessions()` → Redis session store query
- `_query_two_factor_usage()` → Auth system 2FA stats
- `_query_data_exports()` → Audit log system count
- `_query_password_changes()` → Auth / audit log count

Also: connect `get_active_sessions()` and `get_security_logs()` in
`routers/security.py` to the same data sources.

References:

- `monitoring.py:253,262,271,280,289` — DevOps integration TODOs
- `routers/security.py:208,225` — session/log stubs returning `[]`

### 15. New Issue – Frontend: Implement navigation handlers in figma-design-system

    Title: [P3][area/frontend] App.tsx navigation handlers are console.log stubs
    File: `figma-design-system/App.tsx` lines 17–45
    Body:

All user-action handlers (login, logout, profile, security, support, settings)
in the Figma design system demo app are placeholder `console.log` calls. This
prevents meaningful preview/testing of auth-gated UI flows.

Steps:

- Connect `handleLogin` / `handleLogout` to the actual auth API
  (`POST /auth/login`, token storage in httpOnly cookie or localStorage)
- Implement `handleProfile` / `handleSecurity` / `handleSupport` /
  `handleSettings` using the router (React Router or Next.js `router.push`)
- Add a mock auth context for Storybook/design-system demo mode

References:

- `App.tsx:18` login TODO
- `App.tsx:23` logout TODO
- `App.tsx:28,33,38,43` navigation TODOs

### 16. New Issue – Game: Implement settings screen

    Title: [P3][area/game] Settings screen not implemented in game v2
    File: `apps/babylon-game/src/app/page.tsx`
    Body:

The settings screen is referenced in the game state machine but has only a
TODO comment. Players have no way to adjust audio, controls, or accessibility
options.

Steps:

- Design settings screen UI (volume, SFX, keyboard remapping, language)
- Wire up to WebAudio gain nodes for volume control
- Persist settings to `localStorage`
- Add accessibility options (high-contrast mode, reduced motion)

References:

- `apps/babylon-game/src/app/page.tsx` oder zugehoerige UI-Datei fuer Settings/UX

### 17. New Issue – API: Resolve FastAPI and Starlette dependency conflict

    Title: [P1][area/backend] Resolve FastAPI and Starlette pin conflict blocking API tests
    Files:
    - `apps/api/requirements.txt`
    - `.github/workflows/api-tests.yml`
    - `.github/workflows/openapi-drift.yml`
    - `.github/workflows/api-openapi-export.yml`
    Body:

The env contract cleanup is implementation-complete, but full API verification
is still blocked because `fastapi==0.115.4` conflicts with the direct pin
`starlette==0.49.1` in `apps/api/requirements.txt`.

Scope:

- remove the direct `starlette` pin unless a runtime code path truly requires it
- re-resolve dependencies against `fastapi==0.115.4`
- if newer Starlette APIs are needed, upgrade FastAPI to a compatible release
  instead of keeping conflicting direct pins
- align API-related CI install paths to one canonical command:
  `pip install -r apps/api/requirements.txt`
- only keep workflow-local extras if unavoidable and documented

Success criteria:

- clean `pip install -r apps/api/requirements.txt` on Python 3.12
- green `python -m pytest -q tests/`
- green `api-tests`, `openapi-drift`, and `api-openapi-export` workflows

Suggested first checks:

- inspect why `starlette==0.49.1` was pinned directly
- compare FastAPI's supported Starlette range for `0.115.4`
- remove redundant direct pins before changing workflow logic

### 18. Private Ops Task – Rotate credentials exposed by historic/local env usage

    Tracker: Private ops/security system, not public GitHub issues
    Title: [P0][area/security][ops] Rotate external credentials after env contract cleanup
    References:
    - `docs/security/2026-03-env-cleanup-rotation-log.md`
    - `docs/security/GH-PAT-ROTATION.md`
    - `docs/security/secrets-catalog.md`
    - `secrets/SECRETS-AUDIT.md`
    Body:

Treat the previous local `.env` secret set as compromise-suspect. Rotation must
be tracked in the private ops system and mirrored in the repo rotation log.

Priority order:

1. GitHub tokens
2. Database credentials
3. Mail credentials
4. Stripe/payment credentials
5. Remaining API or third-party tokens

Required steps for each secret class:

- rotate provider-side credential
- update GitHub Secrets/Environments and local secure stores
- verify the application path that uses the credential
- verify the old credential is revoked
- record owner, date, and evidence in both tracking systems

GitHub-specific note:

- rotate `GH_TOKEN` and `OC_GITHUB_TOKEN`
- validate `GITHUB_REPO` and `GITHUB_OWNER` after rotation, but do not treat
  them as secrets because they are configuration values, not credentials

Completion criteria:

- every row in the rotation log is updated with owner, date, evidence, and
  revocation status
- post-rotation smoke tests completed for auth, API startup, mail, payment, and
  deployment-related integrations
- the old credentials are explicitly marked revoked, not only replaced

---

## API Examples (curl)

- Comment on #145 (requires GH_TOKEN):

```sh
curl -s -X POST -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  -d '{"body":"Backend queue + monitoring delivered..."}' \
  https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/issues/145/comments
```

Helper scripts (env: GH_TOKEN, GITHUB_OWNER, GITHUB_REPO)

- Comment #145:
  - `scripts/github/comment-145.sh`
- Create new issues from the list above:
  - `scripts/github/create-issues.sh`

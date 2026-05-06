# Authentication Flows – Menschlichkeit Österreich

_Last updated: 2025-10-05_

## 1. Scope & Components

This document maps the current authentication touchpoints across the platform and defines hardening steps required to reach the Phase 0 baseline.

| Component | Responsibility | Source |
| --- | --- | --- |
| FastAPI Core | Issues access/refresh JWTs, proxies to CiviCRM | `api.menschlichkeit-oesterreich.at/app/main.py` |
| API Gateway | Aggregates CRM/frontends, exposes auth bridge | `api.menschlichkeit-oesterreich.at/app/gateway.py` |
| Frontend (React) | Persists session, calls protected endpoints | `frontend/src/auth/AuthContext.tsx`, `frontend/src/services/http.ts` |
| n8n Webhooks | Receives auth/PII events with shared secret | `automation/n8n/webhook-client-optimized.py` |

## 2. FastAPI Token Lifecycle

**Endpoints** (`api.menschlichkeit-oesterreich.at/app/main.py:205` onwards):

- `/auth/login` – validates contact via CiviCRM, issues 1 h access + 7 d refresh token.
- `/auth/register` – idempotent contact creation/update + token issuance.
- `/auth/refresh` – validates refresh token (`type == "refresh"`), re-issues pair and returns contact snapshot.
- `/user/profile` & `/contacts/*` & `/memberships/*` – protected by `verify_jwt_token` dependency enforcing `Authorization: Bearer <token>`.

**JWT structure**

```json
{
  "sub": "user@example.org",
  "type": "access" | "refresh",
  "iat": 1696500000,
  "exp": 1696503600
}
```

- `JWT_SECRET` (32+ chars) is required at startup; rotation requires redeploy.
- Access tokens expire after 3600 s, refresh tokens after 7 days.
- Refresh flow fetches contact snapshot to detect off-boarded users (404 ⇒ `contact: null`).

### Refresh-Token‑Rotation & Reuse‑Protection

- Refresh‑Tokens enthalten eine eindeutige `jti` (UUID). Bei Ausgabe/Rotation wird die zuletzt gültige `jti` je Benutzer gespeichert.
- Bei `/auth/refresh` muss die `jti` des präsentierten Tokens mit der zuletzt gespeicherten `jti` übereinstimmen – sonst 401 „Refresh token reused or invalid“.
- Nach erfolgreicher Refresh‑Anfrage werden neues Access‑ und Refresh‑Token ausgestellt und die gespeicherte `jti` auf die neue gesetzt (Rotation).

Konfiguration (ENV):

- `REFRESH_STORE_PROVIDER` = `memory` (Default) oder `redis`
- `REDIS_URL` (nur bei `redis`, z. B. `redis://localhost:6379/0`)
- `REFRESH_TTL_SECONDS` Standard 7 Tage (Synchron zur Refresh‑Gültigkeit)

Implementierung: `api.menschlichkeit-oesterreich.at/app/lib/refresh_store.py`, Wiring in `app/main.py`.

**Required env vars**

| Variable | Purpose |
| --- | --- |
| `CIVI_BASE_URL`, `CIVI_SITE_KEY`, `CIVI_API_KEY` | Authenticated CiviCRM bridge |
| `JWT_SECRET` | HMAC secret for HS256 |
| `FRONTEND_ORIGINS` | CORS allow-list (mandatory outside dev) |

**Immediate Hardening Actions**

- Enforce refresh token rotation on reuse (Phase 1): persist latest refresh hash and invalidate on mismatch.
- Add `aud` field once multi-client usage begins.
- Implement structured audit logging (success/failure, reason code) and feed to ELK.

## 3. Frontend Session Handling

Relevant code: `frontend/src/auth/AuthContext.tsx:5` and `frontend/src/services/http.ts:34`.

1. `AuthContext.login` calls `api.login`, expects payload `{ token, refresh_token?, expires_in }`.
2. Access token stored in `sessionStorage` (`moe_auth_token`) to reduce shared-device exposure; cookies are not used.
3. `http` helper injects `Authorization` header and enables `credentials: 'include'` for future cookie-based flows.
4. Logout removes token from storage, invalidating subsequent calls.

**Hardening Backlog**

- Persist refresh token once backend exposes it to the SPA; current UI ignores refresh token.
- Add offline storage encryption (e.g., Web Crypto + user PIN) for high-risk operator logins.
- Integrate global interceptor for `401` → refresh flow retry before forcing logout.

## 4. API Gateway Authentication Bridge

`api.menschlichkeit-oesterreich.at/app/gateway.py:332` proxies login against CRM and returns a session bundle:

```json
{
  "user_id": 123,
  "email": "user@example.org",
  "token": "<crm-session-token>",
  "expires_at": 24h
}
```

- Intended for cross-system dashboards (games, CRM, MCP).
- Requires CiviCRM session token validation (Phase 1) before trusting downstream systems.
- For internal services prefer FastAPI JWT tokens; gateway sessions should become signed JWTs with `moe-gateway` issuer.

## 5. n8n Webhook Secrets & Event Signing

`automation/n8n/webhook-client-optimized.py:34` loads `N8N_WEBHOOK_SECRET` and signs payloads:

```
X-Webhook-Signature = hex(HMAC_SHA256(secret, canonical_json_body))
```

Recommendations:

- Store secret in `secrets/n8n/webhook.secret` and mount via Docker secret; never commit to repo.
- Rotate secret quarterly; update both workflow credentials and automation clients.
- Enforce signature verification inside n8n by wrapping the webhook with a Function node that checks `X-Webhook-Signature`.
- Maintain allow-list of webhook entry points (see `WEBHOOK_PATHS` map) and monitor via Falco/OPA once Phase 3 controls land.

## 6. 2FA / Step-up Authentication Roadmap

| Phase | Deliverable | Notes |
| --- | --- | --- |
| 1 | **TOTP (App-based)** | Add `pyotp` server-side validation, capture `secret_seed` in CiviCRM custom field, expose `/auth/totp/enable` & `/auth/totp/verify`. React UI integrates with QR code wizard. |
| 2 | **WebAuthn / Passkeys** | Introduce `@simplewebauthn/server` in FastAPI via `py_webauthn`, store credential IDs in CiviCRM. Requires HTTPS and frontend challenge flow. |
| 3 | **Risk-based Step-up** | Combine IP reputation + role-based policies. Sensitive actions (donor exports, PII purge) trigger 2FA challenge even if session valid. |
| 4 | **Admin Hardware Tokens** | Mandate FIDO2 security keys for staff in `Maintainer` RACI. Manage attestation metadata in Vault. |

Prepare UX copy and fallback procedures (backup codes, support escalation) during Phase 2 documentation effort.

## 7. Compliance & Monitoring Hooks

- Log each auth attempt to `logs/mcp/auth.jsonl` (see Phase 0 logging baseline) with `event_type`, `actor`, `result`.
- Publish `auth` and `error` events to n8n (already supported by `trigger_auth_event` / `trigger_error_alert`).
- Add Prometheus counters for successful/failed logins; alert on anomalies (sudden spikes, geolocation mismatch).
- Centralize secret values in Vault once HashiCorp integration (Phase 3) is ready; update env loader to pull at startup.

## 8. Open Follow-ups

- [ ] Implement refresh token persistence + blacklist service (FastAPI + Redis) – tracked for Phase 1.
- [ ] Ship TOTP enable/verify endpoints and UI wizard – track under Phase 2 Documentation & Governance.
- [ ] Document operational rotation procedure in `docs/security/SECRET-ROTATION-PLAYBOOK.md`.

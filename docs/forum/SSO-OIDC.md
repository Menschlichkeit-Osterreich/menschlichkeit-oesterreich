# SSO – OpenID Connect (Keycloak/authentik)

**Stand:** 2025-10-19

## Voraussetzungen
- IdP verfügbar (Realm/Client). Redirect: `https://forum.menschlichkeit-oesterreich.at/ucp.php?mode=login`

## Claims/Scopes
- `email`, `preferred_username`, optional `name`

## Schritte
1. Client im IdP anlegen (Confidential).
2. Client‑ID/Secret in phpBB OIDC‑Extension.
3. Test: Login/Logout, Clock‑Skew, Claims‑Mapping.

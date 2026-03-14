# Authentifizierungsflows – Menschlichkeit Österreich

Dieses Dokument beschreibt alle Authentifizierungsflows der Plattform.

## Übersicht der Systeme

| System | Auth-Methode | Token-Typ | Ablauf |
|--------|-------------|-----------|--------|
| Frontend (React) | JWT via FastAPI | Bearer Token | 24h (Access), 7d (Refresh) |
| API (FastAPI) | JWT + OAuth2 | Bearer Token | 24h |
| CRM (Drupal/CiviCRM) | Session Cookie + Drupal Auth | PHP Session | 2h |
| n8n Automation | API Key / Webhook-Signatur | HMAC-SHA256 | Unbegrenzt (rotierbar) |
| OpenClaw | JWT | Bearer Token | 1h |

## Frontend → API (JWT-Flow)

```
Browser
  │
  ├─ POST /api/auth/login  {email, password}
  │       │
  │       └─ FastAPI → verify credentials → DB
  │                        │
  │                        └─ return {access_token, refresh_token}
  │
  ├─ GET /api/* mit Authorization: Bearer <access_token>
  │
  └─ POST /api/auth/refresh  {refresh_token}   ← bei 401
```

## Token-Spezifikationen

### Access Token (JWT)

```json
{
  "sub": "<user_id>",
  "email": "<masked>",
  "role": "member | admin | volunteer",
  "iat": "<unix-timestamp>",
  "exp": "<unix-timestamp + 86400>"
}
```

Signatur: HS256 mit `JWT_SECRET` (min. 32 Bytes, in `.env`)

### Refresh Token

- Opaque Token (UUID4), gespeichert in DB mit Ablaufzeit
- Rotation bei Verwendung (Token-Binding)
- Invalidierung bei Passwortänderung

## CRM-Authentifizierung (Drupal)

- Standard Drupal-Formular-Login mit CSRF-Token
- Session-Cookie: `SESS<hash>`, HttpOnly, Secure, SameSite=Lax
- 2FA optional für Admin-Rollen (TOTP via module `tfa`)

## n8n Webhook-Signatur

Eingehende Webhooks werden mit HMAC-SHA256 verifiziert:

```python
signature = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
assert hmac.compare_digest(f"sha256={signature}", request.headers["x-hub-signature-256"])
```

## Sicherheitsmaßnahmen

- Brute-Force-Schutz: Rate Limiting (5 Fehlversuche → 15 min Sperrung)
- Token-Blacklisting bei Logout (Redis)
- Alle Auth-Events in Security-Alerts-Log (`logs/security-alerts.json`, nicht git-getrackt)
- PII wird vor dem Logging maskiert (→ `app/middleware/pii_middleware.py`)

## Referenzen

- `apps/api/app/routers/auth.py`
- `apps/api/app/lib/auth.py`
- `docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md`

# SECURITY – Hardening & Policies

**Stand:** 2025-10-19

## Prinzipien
- TLS/HSTS, CSP, XFO, XCTO, Referrer-Policy
- Rate-Limiting, minimaler Extension-Footprint
- SLSA‑Style Build, signierte Artefakte (optional)
- Least‑Privilege DB‑User

## Webserver-Header (nginx – Plesk Zusätzliche Direktiven)
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:;" always;
```

## Optionales Rate-Limiting
```nginx
limit_req_zone $binary_remote_addr zone=forum_rl:10m rate=5r/s;
location / { limit_req zone=forum_rl burst=20 nodelay; }
```

## Admin/Registrierung
- Admin-Nutzer umbenennen, starke PW, 2FA (falls verfügbar).
- Flood-Interval, Link-/Bildrechte für neue Accounts begrenzen.

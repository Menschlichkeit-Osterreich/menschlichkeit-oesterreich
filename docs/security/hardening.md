# Security Hardening – Menschlichkeit Österreich

**Version**: 1.0 | **Stand**: 2026-03-08 | **Review**: Halbjährlich

Dieses Dokument trennt explizit zwischen Maßnahmen, die im Repository umsetzbar sind, und solchen, die Infrastruktur-/Plesk-/DNS-seitigen Zugriff erfordern.

---

## Prioritätsmatrix

| Priorität | Maßnahme | Umsetzbar in Repo? | Status |
|-----------|----------|-------------------|--------|
| P0 | HTTPS erzwingen (HSTS) | Plesk / Nginx | TODO |
| P0 | Security Headers setzen | Plesk / `.htaccess` / Nginx | TODO |
| P0 | CORS einschränken | FastAPI Middleware | TEILWEISE |
| P1 | CSP konfigurieren | Plesk / Meta-Tag / Header | TODO |
| P1 | Rate Limiting API | FastAPI Middleware | TODO |
| P1 | WAF aktivieren | Plesk ModSecurity | TODO |
| P1 | Audit-Logging API | FastAPI (vorhanden) | AKTIV |
| P2 | DDoS-Basisschutz | Provider/CDN | TODO |
| P2 | TLS-Konfiguration prüfen | Plesk SSL/TLS | TODO |

---

## 1. Security Headers (Repo-seitig umsetzbar)

### FastAPI – `api.menschlichkeit-oesterreich.at`

Middleware in `app/middleware/` ergänzen:

```python
# Empfohlene Security Headers für FastAPI
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",           # Deprecated, aber harmlos
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self' https://api.menschlichkeit-oesterreich.at; "
        "frame-ancestors 'none';"
    ),
}
```

### Drupal CRM – `.htaccess` Ergänzungen

```apache
# Security Headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
# CSP für Drupal (breiter wegen Admin-UI)
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self';"
```

---

## 2. CORS-Konfiguration (FastAPI)

Aktuell: Status prüfen in `app/middleware/` oder `app/main.py`.

Zielkonfiguration:
```python
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "https://menschlichkeit-oesterreich.at",
    "https://www.menschlichkeit-oesterreich.at",
    "https://api.menschlichkeit-oesterreich.at",
]
# Für lokale Entwicklung:
if settings.DEBUG:
    ALLOWED_ORIGINS.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)
```

**Niemals**: `allow_origins=["*"]` in Produktion.

---

## 3. Rate Limiting API (FastAPI)

Empfehlung: `slowapi` (Limits pro IP):

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Auf Auth-Endpunkten:
@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

---

## 4. WAF – Plesk ModSecurity (Infrastruktur)

**Voraussetzung:** Plesk-Admin-Zugriff auf `5.183.217.146:8443`

Schritte (manuell):
1. Plesk → Domains → domain.at → Apache & nginx Settings
2. ModSecurity aktivieren
3. Ruleset wählen: OWASP Core Ruleset (CRS) empfohlen
4. Exceptions für n8n-Webhooks und API-Endpunkte konfigurieren

**Achtung:** CRS kann False Positives bei CiviCRM erzeugen → zunächst im Detection Mode betreiben.

---

## 5. HSTS & TLS (Plesk + DNS)

**Plesk:**
1. Domains → SSL/TLS → Let's Encrypt erneuern (Autorenew aktivieren)
2. "Redirect HTTP to HTTPS" aktivieren für alle Subdomains
3. TLS-Version: Mindestens TLS 1.2, empfohlen 1.3

**HSTS Preload:**
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
Nach 6 Monaten stabiler Nutzung: hstspreload.org submission.

---

## 6. DDoS-Basisschutz (Provider)

Minimal-Schutz über Provider:
- Cloudflare (kostenlos): DNS-Proxy aktivieren → automatischer DDoS-Schutz
- Alternativ: Plesk Firewall für IP-Rate-Limiting aktivieren

Für n8n-Webhooks: Cloudflare Firewall Rule für Bot-Filtering.

---

## 7. Audit-Logging

### FastAPI (bereits vorhanden)
- `app/middleware/pii_middleware.py` – PII-Filterung in Logs
- Keine PII in Logs (E-Mails maskiert: `t**@example.com`, IBANs: `AT61***`)
- Log-Level Produktion: `ERROR` (keine `DEBUG`-Logs in Prod)

### OpenClaw Tool-Gateway
- Alle Tool-Calls werden in PostgreSQL-Tabelle `oc_tool_calls` protokolliert
- Log-Retention: 90 Tage (dann anonymisieren)

### Drupal
- Watchdog-Modul aktiv halten
- `pii_sanitizer`-Modul: `crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/`

---

## 8. OWASP Top 10 – Abdeckungsstatus

| OWASP-Kategorie | Abdeckung | Maßnahme |
|----------------|-----------|----------|
| A01 Broken Access Control | TEILWEISE | JWT-Validierung prüfen, RBAC im OpenClaw-Gateway |
| A02 Cryptographic Failures | GUT | HTTPS, TLS 1.3, verschlüsselte Secrets |
| A03 Injection | GUT | Parameterized Queries (Prisma/Alembic), Input Validation |
| A04 Insecure Design | TEILWEISE | Threat Model vorhanden (`docs/security/FRONTEND-THREAT-MODEL.md`) |
| A05 Security Misconfiguration | TEILWEISE | Security Headers fehlen noch → Phase H |
| A06 Vulnerable Components | GUT | Trivy + OSV + Dependabot aktiv |
| A07 Auth Failures | TEILWEISE | Rate Limiting noch nicht implementiert |
| A08 Software/Data Integrity | GUT | SBOM, SLSA, signed commits |
| A09 Logging Failures | GUT | PII-Sanitizer, Audit-Logging |
| A10 SSRF | NIEDRIG | n8n-Webhooks sind potenzieller Vektor → Allowlist |

---

## 9. Nächste Schritte (priorisiert)

```
[ ] P0: Security Headers in FastAPI Middleware implementieren
[ ] P0: CORS-Konfiguration in FastAPI auf Allowlist-Only setzen
[ ] P1: Rate Limiting auf /auth/* und /api/* Endpunkten
[ ] P1: Plesk ModSecurity in Detection Mode aktivieren
[ ] P1: HSTS Preload vorbereiten (erst nach 6 Monaten stabiler HTTPS-Nutzung)
[ ] P2: Cloudflare-Proxy evaluieren (DDoS-Schutz)
[ ] P2: n8n-Webhook-Endpunkte mit IP-Allowlist absichern
```

---

*Verwandt: `SECURITY.md`, `docs/security/responsible-disclosure.md`, `docs/operations/incident-response.md`*
*OWASP ZAP Baseline-Test: `.github/workflows/owasp-zap-baseline.yml`*

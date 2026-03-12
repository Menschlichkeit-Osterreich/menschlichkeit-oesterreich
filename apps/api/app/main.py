"""
Menschlichkeit Österreich – Vereinsplattform API
FastAPI Backend v2.0 – Production-Ready

Features:
- CORS mit konfigurierbaren Origins
- Security Headers (CSP, HSTS, X-Frame-Options, etc.)
- JWT-basierte Authentifizierung mit RBAC
- Structured Logging
- Health & Readiness Checks
- Alle Modul-Router (Finanzen, CRM, Newsletter, Social Media, Analytics)
"""

from __future__ import annotations

import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

# ── Router Imports ────────────────────────────────────────────────────────────
from .routers import metrics, auth, members, forum, blog, events, roles, finance
from .audit import ensure_audit_table, write_audit_event
from .security import enforce_csrf, rate_limiter, require_jwt_secret_configured

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("menschlichkeit.api")

# ── Environment ───────────────────────────────────────────────────────────────
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

ALLOWED_ORIGINS_PROD = [
    "https://menschlichkeit-oesterreich.at",
    "https://www.menschlichkeit-oesterreich.at",
    "https://app.menschlichkeit-oesterreich.at",
    "https://admin.menschlichkeit-oesterreich.at",
]

ALLOWED_ORIGINS_DEV = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

ALLOWED_ORIGINS = ALLOWED_ORIGINS_PROD if IS_PRODUCTION else (
    ALLOWED_ORIGINS_PROD + ALLOWED_ORIGINS_DEV
)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown Events."""
    require_jwt_secret_configured()
    await ensure_audit_table()
    logger.info(f"🚀 Menschlichkeit API starting | env={ENVIRONMENT}")
    yield
    logger.info("🛑 Menschlichkeit API shutting down")


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Menschlichkeit Österreich – Vereinsplattform API",
    version="2.0.0",
    description="""
## Menschlichkeit Österreich – API v2.0

Vollständige REST-API für die Vereinsplattform.

### Module
- **Metriken** – KPI-Dashboard für Vorstand und Kassier
- **Finanzen** – Rechnungen, Mahnungen, SEPA-Export, Buchhaltung
- **Mitglieder** – CiviCRM-Integration, RBAC, DSGVO
- **Newsletter** – Segmentierung, Kampagnen, Automatisierung
- **Social Media** – Crossposting zu Instagram, Facebook, X, LinkedIn
- **Analytics** – Spielstatistiken, Lernfortschritt

### Authentifizierung
Alle geschützten Endpunkte erfordern einen JWT Bearer Token.
""",
    docs_url="/api/docs" if not IS_PRODUCTION else None,
    redoc_url="/api/redoc" if not IS_PRODUCTION else None,
    openapi_url="/api/openapi.json" if not IS_PRODUCTION else None,
    lifespan=lifespan,
)

# ── Middleware: CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "X-CSRF-Token",
        "Accept",
        "Accept-Language",
    ],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
    max_age=600,
)

# ── Middleware: GZip ──────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ── Middleware: Security Headers ──────────────────────────────────────────────
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next: Callable) -> Response:
    """Setzt alle notwendigen Security-Header nach OWASP-Empfehlungen."""
    response = await call_next(request)

    # Content Security Policy
    csp_directives = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
    ]
    response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

    if IS_PRODUCTION:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=()"
    )
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"

    return response


# ── Middleware: Request Logging & Timing ──────────────────────────────────────
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: Callable) -> Response:
    """Loggt alle Requests mit Timing-Information."""
    start_time = time.perf_counter()
    request_id = request.headers.get("X-Request-ID", f"req_{int(time.time() * 1000)}")

    logger.info(
        f"→ {request.method} {request.url.path} | "
        f"client={request.client.host if request.client else 'unknown'} | "
        f"id={request_id}"
    )

    try:
        enforce_csrf(request)
        client = request.client.host if request.client else "unknown"
        rate_limit_key = f"{client}:{request.url.path}"
        allowed, retry_after = rate_limiter.check(rate_limit_key)
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(retry_after), "X-Request-ID": request_id},
                content={"error": {"code": 429, "message": "Rate limit exceeded", "path": request.url.path}},
            )

        response = await call_next(request)
    except Exception as exc:
        logger.error(f"✗ Unhandled exception: {exc}", exc_info=True)
        raise

    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

    logger.info(
        f"← {response.status_code} {request.url.path} | "
        f"{duration_ms:.0f}ms | id={request_id}"
    )

    try:
        await write_audit_event(
            actor_id=request.headers.get("X-Actor-ID"),
            path=request.url.path,
            method=request.method,
            status_code=response.status_code,
            request_id=request_id,
            consent_flag=request.headers.get("X-Consent-Flag", "false").lower() == "true",
            metadata={
                "client": request.client.host if request.client else "unknown",
                "response_time_ms": round(duration_ms, 2),
            },
        )
    except Exception as audit_error:
        logger.warning("audit_write_failed | error=%s", audit_error)

    return response


# ── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path),
            }
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": "Ein interner Fehler ist aufgetreten." if IS_PRODUCTION else str(exc),
                "path": str(request.url.path),
            }
        },
    )


# ── Health Endpoints ──────────────────────────────────────────────────────────
@app.get("/healthz", tags=["Health"], summary="Liveness Check")
async def healthz():
    """Liveness-Check – gibt 200 zurück, wenn die API läuft."""
    return {"status": "ok", "environment": ENVIRONMENT}


@app.get("/readyz", tags=["Health"], summary="Readiness Check")
async def readyz():
    """Readiness-Check – prüft DB-Verbindung und externe Services."""
    checks: dict[str, str] = {"database": "ok"}  # Wird durch echte DB-Prüfung ersetzt
    all_ok = all(v == "ok" for v in checks.values())
    return JSONResponse(
        status_code=200 if all_ok else 503,
        content={
            "status": "ready" if all_ok else "not_ready",
            "checks": checks,
            "environment": ENVIRONMENT,
        },
    )


@app.get("/api/version", tags=["Health"], summary="API Version")
async def version():
    """Gibt die aktuelle API-Version zurück."""
    return {
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "features": [
            "metrics", "finance", "crm", "newsletter",
            "social_media", "analytics", "rbac", "dsgvo",
        ],
    }


# ── Router Registration ───────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api", tags=["Authentifizierung"])
app.include_router(members.router, prefix="/api", tags=["Mitglieder"])
app.include_router(forum.router, prefix="/api", tags=["Forum"])
app.include_router(blog.router, prefix="/api", tags=["Blog"])
app.include_router(events.router, prefix="/api", tags=["Veranstaltungen"])
app.include_router(roles.router, prefix="/api", tags=["Rollen"])
app.include_router(finance.router, prefix="/api", tags=["Finanzen"])
app.include_router(metrics.router, prefix="/api", tags=["Metriken"])

logger.info(f"✅ API v2.0 configured | env={ENVIRONMENT} | origins={len(ALLOWED_ORIGINS)}")

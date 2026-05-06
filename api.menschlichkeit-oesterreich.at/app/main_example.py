"""
FastAPI Main Application mit PII-Sanitization
==============================================

Beispiel-Integration der PII-Sanitization-Layer.

Author: Menschlichkeit Österreich DevOps
Date: 2025-10-03
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time

from app.middleware import PiiSanitizationMiddleware
from app.config import setup_logging, get_logger, log_request, log_security_event


# Logging konfigurieren (vor App-Erstellung!)
setup_logging(
    level="INFO",  # Production: "INFO", Development: "DEBUG"
    format="json",  # Production: "json", Development: "text"
    enable_pii_filter=True  # IMMER True in Production!
)

logger = get_logger(__name__)

# FastAPI App
app = FastAPI(
    title="Menschlichkeit Österreich API",
    version="1.0.0",
    description="API mit automatischer PII-Sanitization"
)

# Middleware (Reihenfolge wichtig!)
app.add_middleware(PiiSanitizationMiddleware)


@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Request-Timing und Logging"""
    start_time = time.time()
    
    response = await call_next(request)
    
    duration_ms = (time.time() - start_time) * 1000
    
    log_request(
        method=request.method,
        path=request.url.path,
        duration_ms=duration_ms,
        status=response.status_code
    )
    
    return response


@app.on_event("startup")
async def startup_event():
    """Startup-Event"""
    logger.info("API starting up...")
    logger.info("PII-Sanitization: ENABLED")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown-Event"""
    logger.info("API shutting down...")


@app.get("/")
async def root():
    """Health-Check"""
    return {"status": "healthy", "service": "menschlichkeit-api"}


@app.get("/health")
async def health():
    """Health-Check mit Details"""
    return {
        "status": "healthy",
        "pii_sanitization": "enabled",
        "version": "1.0.0"
    }


@app.post("/auth/login")
async def login(request: Request):
    """
    Login-Endpoint (Beispiel).
    
    Demonstriert:
    - PII wird automatisch redaktiert (password, email)
    - Security-Events werden geloggt
    """
    body = await request.json()
    
    # Simulation: Login fehlgeschlagen
    if not body.get("email") or not body.get("password"):
        log_security_event(
            "failed_login",
            ip_masked="192.168.*.*",  # Client-IP bereits maskiert
            severity="warning",
            details={"reason": "missing_credentials"}
        )
        return JSONResponse(
            status_code=401,
            content={"error": "Invalid credentials"}
        )
    
    # Erfolgreicher Login
    log_security_event(
        "successful_login",
        user_id=123,
        ip_masked="192.168.*.*",
        severity="info"
    )
    
    return {"token": "Bearer abc123..."}


@app.post("/users")
async def create_user(request: Request):
    """
    User-Erstellung (Beispiel).
    
    PII-Felder (email, password, phone) werden automatisch redaktiert.
    """
    body = await request.json()
    
    # Logging (PII wird automatisch redaktiert!)
    logger.info(
        "Creating user",
        extra={
            "action": "create_user",
            "user_id": 456  # Nur user_id, KEIN email/password
        }
    )
    
    return {
        "id": 456,
        "email": body.get("email"),  # Response OK (Business-Data)
        "created": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

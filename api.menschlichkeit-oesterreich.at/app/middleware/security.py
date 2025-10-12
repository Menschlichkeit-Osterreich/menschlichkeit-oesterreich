"""Security middleware for FastAPI application.

Implements:
- Rate limiting (per IP)
- Content Security Policy headers
- Additional security headers (HSTS, X-Frame-Options, etc.)
"""

from fastapi import Request, HTTPException
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import time
from typing import Dict, Tuple
import logging

logger = logging.getLogger("moe-api.security")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter middleware.
    
    Rate limits: 10 requests per second per IP for most endpoints.
    Auth endpoints: 5 requests per minute per IP.
    """

    def __init__(self, app, requests_per_second: int = 10, auth_requests_per_minute: int = 5):
        super().__init__(app)
        self.requests_per_second = requests_per_second
        self.auth_requests_per_minute = auth_requests_per_minute
        # Store: {ip: [(timestamp, endpoint), ...]}
        self.request_history: Dict[str, list] = defaultdict(list)
        
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, checking X-Forwarded-For header."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # X-Forwarded-For can contain multiple IPs, first is the client
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _clean_old_requests(self, ip: str, cutoff_time: float):
        """Remove requests older than cutoff time."""
        if ip in self.request_history:
            self.request_history[ip] = [
                (ts, endpoint) for ts, endpoint in self.request_history[ip]
                if ts > cutoff_time
            ]

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        path = request.url.path

        # Determine rate limit based on endpoint
        is_auth_endpoint = "/auth/" in path
        
        if is_auth_endpoint:
            # Auth endpoints: 5 per minute
            window = 60  # seconds
            max_requests = self.auth_requests_per_minute
            cutoff_time = current_time - window
        else:
            # Other endpoints: 10 per second
            window = 1  # second
            max_requests = self.requests_per_second
            cutoff_time = current_time - window

        # Clean old requests
        self._clean_old_requests(client_ip, cutoff_time)

        # Count recent requests
        recent_requests = len(self.request_history[client_ip])

        if recent_requests >= max_requests:
            logger.warning(
                f"Rate limit exceeded for IP {client_ip} on {path}: "
                f"{recent_requests}/{max_requests} in {window}s window"
            )
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {max_requests} requests per {window} second(s)."
            )

        # Record this request
        self.request_history[client_ip].append((current_time, path))

        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max_requests - recent_requests - 1)
        response.headers["X-RateLimit-Reset"] = str(int(cutoff_time + window))

        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses.
    
    Implements:
    - Content Security Policy (CSP)
    - HTTP Strict Transport Security (HSTS)
    - X-Content-Type-Options
    - X-Frame-Options
    - X-XSS-Protection
    - Referrer-Policy
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Content Security Policy
        # Allow same-origin scripts, styles, and images; connect to API and CRM
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # TODO: Remove unsafe-* in production
            "style-src 'self' 'unsafe-inline'",  # TODO: Use nonces for inline styles
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://crm.menschlichkeit-oesterreich.at",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # HSTS: Enforce HTTPS for 1 year, including subdomains
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS protection (legacy, but still useful for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy: Only send origin when navigating to same-origin
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy: Restrict powerful features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )

        return response

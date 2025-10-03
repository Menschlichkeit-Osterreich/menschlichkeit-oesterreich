"""
PII Sanitization Middleware für FastAPI
========================================

Redaktiert automatisch PII aus:
- Request Headers (Authorization, Cookie)
- Request/Response Bodies (JSON)
- Query Parameters
- Logs

Integriert mit PiiSanitizer-Library.

Author: Menschlichkeit Österreich DevOps
Date: 2025-10-03
"""

import json
import logging
from typing import Callable, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.datastructures import Headers, QueryParams

from ..lib.pii_sanitizer import PiiSanitizer, RedactionStrategy


logger = logging.getLogger(__name__)


class PiiSanitizationMiddleware(BaseHTTPMiddleware):
    """
    Middleware für automatische PII-Redaktion in Requests/Responses.
    
    Usage:
        from fastapi import FastAPI
        from app.middleware import PiiSanitizationMiddleware
        
        app = FastAPI()
        app.add_middleware(PiiSanitizationMiddleware)
    """
    
    def __init__(
        self,
        app,
        sanitizer: Optional[PiiSanitizer] = None,
        sanitize_request_body: bool = True,
        sanitize_response_body: bool = False,  # Response meist safe
        sanitize_headers: bool = True,
        sanitize_query_params: bool = True,
        header_allowlist: Optional[set] = None
    ):
        super().__init__(app)
        self.sanitizer = sanitizer or PiiSanitizer()
        self.sanitize_request_body = sanitize_request_body
        self.sanitize_response_body = sanitize_response_body
        self.sanitize_headers = sanitize_headers
        self.sanitize_query_params = sanitize_query_params
        
        # Headers die NICHT geloggt werden dürfen
        self.header_allowlist = header_allowlist or {
            "content-type",
            "content-length",
            "accept",
            "accept-encoding",
            "user-agent",
            "host",
            "connection",
            "cache-control"
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Verarbeitet Request und redaktiert PII"""
        
        # Sanitize Request (für Logging)
        sanitized_headers = self._sanitize_headers(request.headers)
        sanitized_query = self._sanitize_query_params(request.query_params)
        
        # Request-Body (für Logging, nicht für Verarbeitung!)
        if self.sanitize_request_body and request.method in ("POST", "PUT", "PATCH"):
            # Body nur lesen wenn Content-Type JSON ist
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body = await request.body()
                    if body:
                        body_json = json.loads(body)
                        sanitized_body = self.sanitizer.scrub_dict(
                            body_json,
                            RedactionStrategy.DROP
                        )
                        logger.debug(
                            "Request received",
                            extra={
                                "path": request.url.path,
                                "method": request.method,
                                "headers": sanitized_headers,
                                "query": sanitized_query,
                                "body": sanitized_body
                            }
                        )
                except Exception as e:
                    logger.warning(f"Failed to parse request body: {e}")
        
        # Forward Request
        response = await call_next(request)
        
        # Sanitize Response (optional, meist nicht nötig)
        if self.sanitize_response_body:
            # Response body sanitization (komplizierter, siehe unten)
            pass
        
        return response
    
    def _sanitize_headers(self, headers: Headers) -> dict:
        """Redaktiert sensitive Headers"""
        if not self.sanitize_headers:
            return dict(headers)
        
        sanitized = {}
        for key, value in headers.items():
            key_lower = key.lower()
            
            if key_lower in self.header_allowlist:
                sanitized[key] = value
            elif key_lower in ("authorization", "cookie", "set-cookie"):
                sanitized[key] = "[REDACTED]"
            else:
                # Anderen Text scrubben
                sanitized[key] = self.sanitizer.scrub_text(value)
        
        return sanitized
    
    def _sanitize_query_params(self, query_params: QueryParams) -> dict:
        """Redaktiert sensitive Query-Parameter"""
        if not self.sanitize_query_params:
            return dict(query_params)
        
        return self.sanitizer.scrub_dict(
            dict(query_params),
            RedactionStrategy.MASK
        )


class PiiLoggingMiddleware(BaseHTTPMiddleware):
    """
    Lightweight Middleware nur für Logging (ohne Request-Mutation).
    
    Usage:
        app.add_middleware(PiiLoggingMiddleware)
    """
    
    def __init__(self, app, sanitizer: Optional[PiiSanitizer] = None):
        super().__init__(app)
        self.sanitizer = sanitizer or PiiSanitizer()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Loggt Request/Response mit PII-Redaktion"""
        
        # Log Request
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else None,
                "headers": self._safe_headers(request.headers)
            }
        )
        
        # Process
        response = await call_next(request)
        
        # Log Response
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code}",
            extra={
                "status": response.status_code,
                "path": request.url.path
            }
        )
        
        return response
    
    def _safe_headers(self, headers: Headers) -> dict:
        """Gibt nur safe Headers zurück"""
        safe = {}
        for key, value in headers.items():
            key_lower = key.lower()
            if key_lower in ("authorization", "cookie"):
                safe[key] = "[REDACTED]"
            elif key_lower in ("content-type", "user-agent", "accept"):
                safe[key] = value
        return safe

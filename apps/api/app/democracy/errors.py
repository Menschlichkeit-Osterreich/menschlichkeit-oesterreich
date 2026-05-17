"""
Democracy Game – Bruecken bauen
Standard error handling per API contract (democracy-game-api-v1.md).
All responses include a correlationId for observability (OG-001).
"""

from __future__ import annotations

import uuid

from fastapi import Request
from fastapi.responses import JSONResponse

from .schemas import StandardError, ErrorDetail


def _correlation_id(request: Request) -> str:
    """Extract or generate a correlation ID."""
    return request.headers.get("X-Correlation-ID", str(uuid.uuid4()))


async def democracy_validation_error_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle Pydantic / RequestValidation errors with contract-compliant body."""
    from fastapi.exceptions import RequestValidationError

    details: list[ErrorDetail] = []
    if isinstance(exc, RequestValidationError):
        for err in exc.errors():
            loc = ".".join(str(l) for l in err.get("loc", []))
            details.append(ErrorDetail(field=loc, reason=err.get("msg", "")))

    body = StandardError(
        code="VALIDATION_ERROR",
        message="Ungueltige Anfrageparameter",
        correlation_id=_correlation_id(request),
        details=details,
    )
    return JSONResponse(status_code=422, content=body.model_dump())


async def democracy_not_found_handler(
    request: Request, resource: str, resource_id: str
) -> JSONResponse:
    """Return 404 with contract-compliant error body."""
    body = StandardError(
        code="NOT_FOUND",
        message=f"{resource} mit ID '{resource_id}' nicht gefunden",
        correlation_id=_correlation_id(request),
    )
    return JSONResponse(status_code=404, content=body.model_dump())


async def democracy_forbidden_handler(
    request: Request, reason: str = "Zugriff verweigert"
) -> JSONResponse:
    """Return 403 with contract-compliant error body."""
    body = StandardError(
        code="FORBIDDEN",
        message=reason,
        correlation_id=_correlation_id(request),
    )
    return JSONResponse(status_code=403, content=body.model_dump())


async def democracy_internal_error_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Return 500 with contract-compliant error body (no internals leaked)."""
    body = StandardError(
        code="INTERNAL_ERROR",
        message="Interner Serverfehler",
        correlation_id=_correlation_id(request),
    )
    return JSONResponse(status_code=500, content=body.model_dump())

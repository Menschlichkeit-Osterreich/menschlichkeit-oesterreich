"""
Logging Configuration mit PII-Sanitization
===========================================

Konfiguriert Python Logging mit:
- Strukturiertem JSON-Format
- Automatischer PII-Redaktion
- Environment-basierte Log-Levels
- Rotation und Retention

Author: Menschlichkeit Österreich DevOps
Date: 2025-10-03
"""

import logging
import logging.config
import sys
import os
import json
from typing import Any, Dict
from pythonjsonlogger import jsonlogger

from ..lib.pii_sanitizer import PiiSanitizer, LoggingPiiFilter


# Field Allowlist (strukturiertes Logging)
ALLOWED_LOG_FIELDS = {
    "timestamp",
    "level",
    "logger",
    "message",
    "pathname",
    "lineno",
    "user_id",  # Business-Context OK
    "action",
    "resource_type",
    "resource_id",
    "status",
    "duration_ms",
    "method",
    "path",
    "status_code",
    "ip_masked",  # Bereits maskiert
    "country_code",
    "error_code",
    "correlation_id",
}


class AllowlistJsonFormatter(jsonlogger.JsonFormatter):
    """
    JSON-Formatter der nur Allowlist-Felder loggt.
    
    Verhindert unbeabsichtigtes Logging von PII in `extra={...}`.
    """
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]):
        super().add_fields(log_record, record, message_dict)
        
        # Nur Allowlist-Felder behalten
        allowed = {k: v for k, v in log_record.items() if k in ALLOWED_LOG_FIELDS}
        log_record.clear()
        log_record.update(allowed)


def setup_logging(
    level: str = None,
    format: str = "json",
    enable_pii_filter: bool = True
):
    """
    Konfiguriert Logging für FastAPI-App.
    
    Args:
        level: Log-Level (default: ENV["LOG_LEVEL"] oder "INFO")
        format: "json" oder "text"
        enable_pii_filter: Aktiviert PII-Redaktion
        
    Usage:
        from app.config import setup_logging
        setup_logging(level="DEBUG", format="json")
    """
    
    # Environment-basiertes Level
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Sanitizer
    sanitizer = PiiSanitizer() if enable_pii_filter else None
    
    # Handler konfigurieren
    handlers = {}
    
    if format == "json":
        # JSON-Handler für Produktion
        handlers["default"] = {
            "class": "logging.StreamHandler",
            "level": level,
            "formatter": "json",
            "stream": "ext://sys.stdout"
        }
    else:
        # Text-Handler für Development
        handlers["default"] = {
            "class": "logging.StreamHandler",
            "level": level,
            "formatter": "text",
            "stream": "ext://sys.stdout"
        }
    
    # Datei-Handler (optional)
    log_dir = os.getenv("LOG_DIR", "./logs")
    if os.getenv("LOG_FILE_ENABLED", "false").lower() == "true":
        os.makedirs(log_dir, exist_ok=True)
        handlers["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": level,
            "formatter": "json",
            "filename": f"{log_dir}/api.log",
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 5
        }
    
    # Logging Config
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": "app.config.logging.AllowlistJsonFormatter",
                "format": "%(timestamp)s %(level)s %(message)s",
                "timestamp": True
            },
            "text": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": handlers,
        "root": {
            "level": level,
            "handlers": list(handlers.keys())
        },
        "loggers": {
            "uvicorn": {"level": "INFO", "propagate": True},
            "uvicorn.access": {"level": "INFO", "propagate": True},
            "uvicorn.error": {"level": "INFO", "propagate": True},
            "fastapi": {"level": "INFO", "propagate": True},
        }
    }
    
    # Apply Config
    logging.config.dictConfig(config)
    
    # PII-Filter zu allen Handlern hinzufügen
    if enable_pii_filter and sanitizer:
        pii_filter = LoggingPiiFilter(sanitizer)
        for handler in logging.root.handlers:
            handler.addFilter(pii_filter)
    
    logger = logging.getLogger(__name__)
    logger.info(
        f"Logging configured: level={level}, format={format}, pii_filter={enable_pii_filter}"
    )


def get_logger(name: str) -> logging.Logger:
    """
    Gibt Logger mit PII-Filter zurück.
    
    Usage:
        from app.config import get_logger
        logger = get_logger(__name__)
        logger.info("User registered", extra={"user_id": 123})
    """
    return logging.getLogger(name)


def log_request(
    method: str,
    path: str,
    user_id: int = None,
    duration_ms: float = None,
    status: int = None
):
    """
    Strukturiertes Request-Logging.
    
    Usage:
        log_request("GET", "/api/users", user_id=123, duration_ms=45.2, status=200)
    """
    logger = get_logger("api.requests")
    logger.info(
        f"{method} {path} -> {status}",
        extra={
            "action": "api_request",
            "method": method,
            "path": path,
            "user_id": user_id,
            "duration_ms": duration_ms,
            "status_code": status
        }
    )


def log_security_event(
    event_type: str,
    user_id: int = None,
    ip_masked: str = None,
    severity: str = "info",
    details: dict = None
):
    """
    Security-Event-Logging.
    
    Usage:
        log_security_event(
            "failed_login",
            user_id=123,
            ip_masked="192.168.*.*",
            severity="warning",
            details={"reason": "invalid_password"}
        )
    """
    logger = get_logger("api.security")
    
    extra = {
        "action": "security_event",
        "event_type": event_type,
        "user_id": user_id,
        "ip_masked": ip_masked,
    }
    
    # Details (nur Allowlist-Felder!)
    if details:
        for key, value in details.items():
            if key in ALLOWED_LOG_FIELDS:
                extra[key] = value
    
    if severity == "warning":
        logger.warning(f"Security: {event_type}", extra=extra)
    elif severity == "error":
        logger.error(f"Security: {event_type}", extra=extra)
    else:
        logger.info(f"Security: {event_type}", extra=extra)

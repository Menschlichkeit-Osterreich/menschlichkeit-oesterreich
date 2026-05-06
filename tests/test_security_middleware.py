"""Tests for security middleware (rate limiting and security headers)."""

import pytest
import sys
import os
from pathlib import Path

# Add API directory to path
api_path = Path(__file__).parent.parent / "api.menschlichkeit-oesterreich.at"
sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import time


def test_security_headers_present():
    """Test that security headers are added to responses."""
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/health")
    
    # Check Content Security Policy
    assert "Content-Security-Policy" in response.headers
    csp = response.headers["Content-Security-Policy"]
    assert "default-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp
    
    # Check HSTS
    assert "Strict-Transport-Security" in response.headers
    hsts = response.headers["Strict-Transport-Security"]
    assert "max-age=31536000" in hsts
    assert "includeSubDomains" in hsts
    
    # Check other security headers
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Referrer-Policy" in response.headers
    assert "Permissions-Policy" in response.headers


def test_rate_limiting_general_endpoint():
    """Test rate limiting on general endpoints (10 req/s)."""
    from app.main import app
    client = TestClient(app)
    
    # Make 10 requests (should succeed)
    for i in range(10):
        response = client.get("/health")
        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
    
    # 11th request should be rate limited
    response = client.get("/health")
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]


def test_rate_limiting_auth_endpoint():
    """Test rate limiting on auth endpoints (5 req/min)."""
    from app.main import app
    client = TestClient(app)
    
    # Make 5 auth requests (should succeed)
    for i in range(5):
        response = client.post("/auth/register", json={
            "email": f"test{i}@example.com",
            "password": "test123"
        })
        # May fail due to validation, but shouldn't be rate limited
        assert response.status_code != 429
    
    # 6th request should be rate limited
    response = client.post("/auth/register", json={
        "email": "test6@example.com",
        "password": "test123"
    })
    assert response.status_code == 429


def test_rate_limit_headers():
    """Test rate limit headers are correctly set."""
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/health")
    
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers
    assert "X-RateLimit-Reset" in response.headers
    
    limit = int(response.headers["X-RateLimit-Limit"])
    remaining = int(response.headers["X-RateLimit-Remaining"])
    reset = int(response.headers["X-RateLimit-Reset"])
    
    assert limit > 0
    assert remaining >= 0
    assert reset > time.time()


def test_rate_limit_respects_x_forwarded_for():
    """Test that rate limiting uses X-Forwarded-For header."""
    from app.main import app
    client = TestClient(app)
    
    # Requests from different IPs should not interfere
    for i in range(10):
        response = client.get("/health", headers={
            "X-Forwarded-For": f"192.168.1.{i}"
        })
        assert response.status_code == 200
    
    # Same IP should be rate limited
    for i in range(11):
        response = client.get("/health", headers={
            "X-Forwarded-For": "192.168.1.100"
        })
    
    # Last request should be rate limited
    assert response.status_code == 429


def test_csp_blocks_inline_scripts():
    """Test that CSP header would block inline scripts (when enforced)."""
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/health")
    csp = response.headers.get("Content-Security-Policy", "")
    
    # Check that CSP is restrictive
    assert "default-src 'self'" in csp
    # Note: unsafe-inline is currently allowed for development
    # In production, this should be removed
    if "'unsafe-inline'" not in csp:
        # Production mode - should block inline scripts
        assert "script-src 'self'" in csp
    else:
        # Development mode - log warning
        print("WARNING: CSP allows unsafe-inline (development mode)")


def test_hsts_enforces_https():
    """Test that HSTS header enforces HTTPS."""
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/health")
    hsts = response.headers.get("Strict-Transport-Security", "")
    
    # Should enforce HTTPS for at least 1 year (31536000 seconds)
    assert "max-age=31536000" in hsts
    assert "includeSubDomains" in hsts


@pytest.mark.parametrize("endpoint,method,expected_header", [
    ("/health", "GET", "X-Frame-Options"),
    ("/health", "GET", "X-Content-Type-Options"),
    ("/health", "GET", "Content-Security-Policy"),
    ("/health", "GET", "Strict-Transport-Security"),
])
def test_security_headers_on_all_endpoints(endpoint, method, expected_header):
    """Test that security headers are present on all endpoints."""
    from app.main import app
    client = TestClient(app)
    
    if method == "GET":
        response = client.get(endpoint)
    elif method == "POST":
        response = client.post(endpoint)
    
    assert expected_header in response.headers

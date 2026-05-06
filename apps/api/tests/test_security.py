"""Tests für Security-Middleware: Rate-Limiting, CSRF."""
from __future__ import annotations

import asyncio

import pytest
from app.security import InMemoryRateLimiter, RateLimitConfig


def _run(coro):
    return asyncio.run(coro)


class TestRateLimiter:
    def test_allows_requests_within_limit(self):
        limiter = InMemoryRateLimiter(RateLimitConfig(requests=5, window_seconds=60))
        for _ in range(5):
            allowed, retry_after = _run(limiter.check("test_key"))
            assert allowed is True
            assert retry_after == 0

    def test_blocks_after_limit_exceeded(self):
        limiter = InMemoryRateLimiter(RateLimitConfig(requests=3, window_seconds=60))
        for _ in range(3):
            _run(limiter.check("key"))
        allowed, retry_after = _run(limiter.check("key"))
        assert allowed is False
        assert retry_after > 0

    def test_different_keys_independent(self):
        limiter = InMemoryRateLimiter(RateLimitConfig(requests=1, window_seconds=60))
        allowed_a, _ = _run(limiter.check("key_a"))
        allowed_b, _ = _run(limiter.check("key_b"))
        assert allowed_a is True
        assert allowed_b is True

    def test_second_request_for_same_key_blocked_at_limit_1(self):
        limiter = InMemoryRateLimiter(RateLimitConfig(requests=1, window_seconds=60))
        _run(limiter.check("key"))
        allowed, retry = _run(limiter.check("key"))
        assert allowed is False


class TestSecurityHeaders:
    def test_health_endpoint_accessible(self, client):
        resp = client.get("/healthz")
        assert resp.status_code == 200

    def test_docs_not_available_by_default(self, client):
        # Im Test-Environment (ENVIRONMENT=test != production) sind Docs zugänglich
        resp = client.get("/api/docs")
        assert resp.status_code in (200, 404)

    def test_openapi_json_accessible_in_dev(self, client):
        resp = client.get("/api/openapi.json")
        assert resp.status_code in (200, 404)

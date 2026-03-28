from __future__ import annotations

import logging
import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque

from fastapi import HTTPException, Request, status

try:
    from redis.exceptions import RedisError as _RedisError
except ImportError:
    _RedisError = OSError  # type: ignore[assignment,misc]

from .secrets_provider import get_secret

logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    requests: int
    window_seconds: int


class InMemoryRateLimiter:
    def __init__(self, config: RateLimitConfig) -> None:
        self.config = config
        self._requests: dict[str, Deque[float]] = defaultdict(deque)

    async def check(self, key: str) -> tuple[bool, int]:
        now = time.time()
        window_start = now - self.config.window_seconds
        bucket = self._requests[key]

        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self.config.requests:
            retry_after = int(self.config.window_seconds - (now - bucket[0]))
            return False, max(retry_after, 1)

        bucket.append(now)
        return True, 0


# Atomares Lua-Script: ZREMRANGEBYSCORE + ZCARD + ZADD ohne Race Condition
_RATE_LIMIT_LUA = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local window_start = now - window

redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)
local count = redis.call('ZCARD', key)

if count >= limit then
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after = math.ceil(window - (now - tonumber(oldest[2])))
    return {0, math.max(retry_after, 1)}
end

local member = tostring(now) .. ':' .. tostring(math.random(1, 1000000))
redis.call('ZADD', key, now, member)
redis.call('EXPIRE', key, window + 1)
return {1, 0}
"""


class RedisRateLimiter:
    """Sliding-Window Rate Limiter mit Redis-Backend.

    Das Lua-Script wird atomar ausgeführt — ZREMRANGEBYSCORE + ZCARD + ZADD
    laufen ohne Race Condition auch bei mehreren API-Instanzen.
    Bei Redis-Ausfall: fail-open (Request wird durchgelassen, Warning geloggt).
    """

    def __init__(self, redis_url: str, config: RateLimitConfig) -> None:
        import redis.asyncio as aioredis  # lazy import — nur wenn REDIS_URL gesetzt
        self._redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        self.config = config

    async def check(self, key: str) -> tuple[bool, int]:
        try:
            now = time.time()
            result = await self._redis.eval(
                _RATE_LIMIT_LUA,
                1,
                f"rl:{key}",
                now,
                self.config.window_seconds,
                self.config.requests,
            )
            return bool(int(result[0])), int(result[1])
        except _RedisError as exc:
            logger.warning("redis_rate_limiter_error | key=%s | error=%s", key, exc)
            return True, 0  # fail-open: Request erlauben wenn Redis nicht erreichbar

    async def close(self) -> None:
        await self._redis.aclose()


def _build_rate_limiter() -> InMemoryRateLimiter | RedisRateLimiter:
    config = RateLimitConfig(
        requests=int(os.getenv("RATE_LIMIT_REQUESTS", "120")),
        window_seconds=int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")),
    )
    redis_url = get_secret("REDIS_URL", bsm_key="api/REDIS_URL") or None
    if redis_url:
        # URL für Logging anonymisieren (Passwort ausblenden)
        safe_url = redis_url.split("@")[-1] if "@" in redis_url else redis_url
        logger.info("rate_limiter=redis | host=%s", safe_url)
        return RedisRateLimiter(redis_url, config)
    logger.warning(
        "rate_limiter=in_memory | REDIS_URL nicht gesetzt — "
        "Rate Limits werden NICHT über mehrere Instanzen geteilt"
    )
    return InMemoryRateLimiter(config)


rate_limiter: InMemoryRateLimiter | RedisRateLimiter = _build_rate_limiter()


def require_jwt_secret_configured() -> None:
    jwt_secret = get_secret("JWT_SECRET_KEY", bsm_key="api/JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY environment variable is required")


def enforce_csrf(request: Request) -> None:
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return
        if request.url.path.startswith("/api/"):
            content_type = request.headers.get("Content-Type", "")
            if "application/json" in content_type:
                return
        csrf = request.headers.get("X-CSRF-Token")
        if not csrf:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Missing CSRF token",
            )

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque

from fastapi import HTTPException, Request, status


@dataclass
class RateLimitConfig:
    requests: int
    window_seconds: int


class InMemoryRateLimiter:
    def __init__(self, config: RateLimitConfig) -> None:
        self.config = config
        self._requests: dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str) -> tuple[bool, int]:
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


rate_limiter = InMemoryRateLimiter(
    RateLimitConfig(
        requests=int(os.getenv("RATE_LIMIT_REQUESTS", "120")),
        window_seconds=int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")),
    )
)


def require_jwt_secret_configured() -> None:
    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY environment variable is required")


def enforce_csrf(request: Request) -> None:
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        csrf = request.headers.get("X-CSRF-Token")
        if not csrf:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Missing CSRF token",
            )

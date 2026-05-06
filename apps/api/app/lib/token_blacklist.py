"""
JWT Token Blacklist
===================

Widerruf-Speicher für JWT-Tokens. Bei gesetztem REDIS_URL wird Redis verwendet,
sodass Widerrufe über alle Worker-Instanzen hinweg gelten.
Ohne REDIS_URL fällt das System auf einen In-Memory-Store zurück (nur Dev).

Wenn ein Nutzer sein Konto löscht (DSGVO Art. 17) oder sich ausloggt, wird der
aktive JWT-Token sofort gesperrt und kann nicht mehr für API-Requests verwendet werden.

Author: Menschlichkeit Österreich DevOps
"""

from __future__ import annotations

import hashlib
import logging
import os
import threading
import time
from datetime import datetime

logger = logging.getLogger(__name__)


def _token_key(token: str) -> str:
    """SHA-256-Hash des Tokens als Redis-Key (kein Klartexttoken im Cache)."""
    return "jwtbl:" + hashlib.sha256(token.encode()).hexdigest()


class InMemoryTokenBlacklist:
    """Thread-sichere In-Memory-Blacklist — nur für Entwicklung / Einzelinstanz."""

    def __init__(self) -> None:
        # token_string → Unix-Timestamp des Ablaufs
        self._store: dict[str, float] = {}
        self._lock = threading.Lock()

    async def revoke(self, token: str, expires_at: datetime) -> None:
        exp_ts = expires_at.timestamp()
        with self._lock:
            self._store[token] = exp_ts
            logger.debug(
                "JWT widerrufen (in-memory, %d Einträge gesamt)", len(self._store)
            )

    async def is_revoked(self, token: str) -> bool:
        now = time.time()
        with self._lock:
            exp_ts = self._store.get(token)
            if exp_ts is None:
                return False
            if now >= exp_ts:
                del self._store[token]
                return False
            return True

    async def close(self) -> None:
        pass

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)


class RedisTokenBlacklist:
    """Redis-gestützte Blacklist — gültig über alle Instanzen und Neustarts.

    Speichert einen SHA-256-Hash des Tokens (nie den Klartext).
    TTL entspricht der verbleibenden Token-Laufzeit — Redis räumt automatisch auf.
    Bei Redis-Ausfall: fail-open (Token wird als nicht widerrufen betrachtet, Warning geloggt).
    """

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis  # lazy import — nur wenn REDIS_URL gesetzt
        self._redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)

    async def revoke(self, token: str, expires_at: datetime) -> None:
        ttl = max(1, int(expires_at.timestamp() - time.time()))
        try:
            await self._redis.set(_token_key(token), "1", ex=ttl)
            logger.debug("JWT widerrufen (redis, TTL=%ds)", ttl)
        except Exception as exc:
            logger.warning("redis_blacklist_revoke_error | error=%s", exc)

    async def is_revoked(self, token: str) -> bool:
        try:
            return bool(await self._redis.exists(_token_key(token)))
        except Exception as exc:
            logger.warning("redis_blacklist_check_error | error=%s", exc)
            return False  # fail-open: Token als gültig betrachten

    async def close(self) -> None:
        await self._redis.aclose()


def _build_token_blacklist() -> InMemoryTokenBlacklist | RedisTokenBlacklist:
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        logger.info("token_blacklist=redis")
        return RedisTokenBlacklist(redis_url)
    logger.warning(
        "token_blacklist=in_memory | REDIS_URL nicht gesetzt — "
        "Token-Widerrufe gelten NUR für diese Prozessinstanz"
    )
    return InMemoryTokenBlacklist()


# ---------------------------------------------------------------------------
# Modul-Singleton
# ---------------------------------------------------------------------------

_blacklist: InMemoryTokenBlacklist | RedisTokenBlacklist = _build_token_blacklist()


async def revoke_token(token: str, expires_at: datetime) -> None:
    """Widerruft einen JWT-Token sofort."""
    await _blacklist.revoke(token, expires_at)


async def is_token_revoked(token: str) -> bool:
    """Gibt True zurück, wenn der Token widerrufen wurde."""
    return await _blacklist.is_revoked(token)

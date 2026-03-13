"""
JWT Token Blacklist
===================

In-memory Blacklist für widerrufene JWT-Tokens.

Wenn ein Nutzer sein Konto löscht (DSGVO Art. 17), wird der aktive JWT-Token
sofort gesperrt, sodass er nicht mehr für API-Requests verwendet werden kann.

Hinweis: Diese In-Memory-Implementierung gilt nur für den laufenden Prozess.
In der Produktion sollte ein Redis-Backend verwendet werden, das über alle
Worker-Instanzen hinweg geteilt wird.

Author: Menschlichkeit Österreich DevOps
"""

from __future__ import annotations

import logging
import threading
from datetime import datetime


logger = logging.getLogger(__name__)


class TokenBlacklist:
    """
    Thread-sichere In-Memory-Blacklist für widerrufene JWT-Tokens.

    Einträge werden automatisch entfernt, sobald das Token ohnehin
    abgelaufen wäre (TTL-basiertes Cleanup).
    """

    def __init__(self) -> None:
        # token_string → expiry datetime
        self._store: dict[str, datetime] = {}
        self._lock = threading.Lock()

    def revoke(self, token: str, expires_at: datetime) -> None:
        """
        Widerruft ein Token bis zu seinem Ablaufdatum.

        Args:
            token:      Der rohe JWT-Token-String (ohne "Bearer "-Präfix).
            expires_at: Zeitpunkt, ab dem das Token ohnehin ungültig wäre.
                        Danach wird der Eintrag bei der nächsten Prüfung entfernt.
        """
        with self._lock:
            self._store[token] = expires_at
            logger.debug(
                "JWT-Token widerrufen (läuft ab: %s). "
                "Blacklist enthält %d Einträge.",
                expires_at.isoformat(),
                len(self._store),
            )

    def is_revoked(self, token: str) -> bool:
        """
        Prüft, ob ein Token widerrufen wurde.

        Abgelaufene Einträge werden dabei automatisch bereinigt.

        Returns:
            True  – Token ist gesperrt und darf nicht akzeptiert werden.
            False – Token ist nicht in der Blacklist.
        """
        now = datetime.utcnow()
        with self._lock:
            expiry = self._store.get(token)
            if expiry is None:
                return False
            if now >= expiry:
                # Token wäre bereits abgelaufen – Eintrag nicht mehr nötig
                del self._store[token]
                return False
            return True

    def cleanup_expired(self) -> int:
        """
        Entfernt alle abgelaufenen Einträge aus der Blacklist.

        Kann periodisch aufgerufen werden (z. B. per APScheduler/Celery).

        Returns:
            Anzahl der entfernten Einträge.
        """
        now = datetime.utcnow()
        with self._lock:
            expired = [t for t, exp in self._store.items() if now >= exp]
            for token in expired:
                del self._store[token]
        if expired:
            logger.debug("TokenBlacklist: %d abgelaufene Einträge entfernt.", len(expired))
        return len(expired)

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)


# ---------------------------------------------------------------------------
# Modul-Singleton
# ---------------------------------------------------------------------------

_blacklist = TokenBlacklist()


def revoke_token(token: str, expires_at: datetime) -> None:
    """Widerruft einen JWT-Token sofort. Shortcut für _blacklist.revoke()."""
    _blacklist.revoke(token, expires_at)


def is_token_revoked(token: str) -> bool:
    """Gibt True zurück, wenn der Token widerrufen wurde. Shortcut für _blacklist.is_revoked()."""
    return _blacklist.is_revoked(token)

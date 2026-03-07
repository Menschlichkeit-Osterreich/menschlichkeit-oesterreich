"""
Monitoring-Service – Menschlichkeit Österreich
Gesundheitschecks, Metriken und strukturiertes Logging
"""

from __future__ import annotations
import logging
import time
from datetime import datetime
from typing import Any, Dict

# ── Logging-Konfiguration ──────────────────────────────────────────────────────

def configure_logging(log_level: str = "INFO") -> None:
    """Konfiguriert strukturiertes JSON-Logging für die Produktion."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        datefmt="%Y-%m-%dT%H:%M:%S"
    )


# ── Health-Check-Service ───────────────────────────────────────────────────────

class HealthCheckService:
    """Führt Gesundheitschecks für alle Systemkomponenten durch."""

    def __init__(self, db_pool=None, redis_client=None, civicrm_service=None):
        self.db = db_pool
        self.redis = redis_client
        self.civicrm = civicrm_service
        self.logger = logging.getLogger(__name__)

    async def check_database(self) -> Dict[str, Any]:
        """Prüft die Datenbankverbindung."""
        start = time.monotonic()
        try:
            if self.db:
                async with self.db.acquire() as conn:
                    await conn.fetchval("SELECT 1")
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            return {"status": "healthy", "latency_ms": latency_ms}
        except Exception as e:
            self.logger.error("Datenbankverbindung fehlgeschlagen: %s", e)
            return {"status": "unhealthy", "error": str(e)}

    async def check_redis(self) -> Dict[str, Any]:
        """Prüft die Redis-Verbindung."""
        start = time.monotonic()
        try:
            if self.redis:
                await self.redis.ping()
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            return {"status": "healthy", "latency_ms": latency_ms}
        except Exception as e:
            self.logger.error("Redis-Verbindung fehlgeschlagen: %s", e)
            return {"status": "unhealthy", "error": str(e)}

    async def check_civicrm(self) -> Dict[str, Any]:
        """Prüft die CiviCRM-API-Verbindung."""
        start = time.monotonic()
        try:
            if self.civicrm:
                await self.civicrm._request("System", "get", {"limit": 1})
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            return {"status": "healthy", "latency_ms": latency_ms}
        except Exception as e:
            self.logger.warning("CiviCRM-Verbindung fehlgeschlagen: %s", e)
            return {"status": "degraded", "error": str(e)}

    async def get_full_health_report(self) -> Dict[str, Any]:
        """Erstellt einen vollständigen Gesundheitsbericht."""
        db_health = await self.check_database()
        redis_health = await self.check_redis()
        civicrm_health = await self.check_civicrm()

        all_healthy = all(
            c["status"] == "healthy"
            for c in [db_health, redis_health]
        )

        return {
            "status": "healthy" if all_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "2.0.0",
            "components": {
                "database": db_health,
                "redis": redis_health,
                "civicrm": civicrm_health,
            }
        }

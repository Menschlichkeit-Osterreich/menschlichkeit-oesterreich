"""
Routers Package für FastAPI

Sammelt alle API-Router:
- metrics: Dashboard-KPIs für Vorstand/Kassier
"""

from .metrics import router as metrics_router

__all__ = ["metrics_router"]

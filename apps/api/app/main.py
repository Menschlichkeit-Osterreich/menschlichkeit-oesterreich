"""Menschlichkeit Österreich - Board/Treasurer API (FastAPI)."""
from fastapi import FastAPI
from .routers import metrics

app = FastAPI(
    title="Menschlichkeit Österreich – Board/Treasurer API",
    version="0.1.0",
    description="Dashboard KPI Endpoints for Board and Treasurer roles"
)


@app.get("/healthz")
async def healthz():
    """Health check endpoint."""
    return {"status": "ok"}


# Include metrics router
app.include_router(metrics.router, prefix="/api", tags=["metrics"])

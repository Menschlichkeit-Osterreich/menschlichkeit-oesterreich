"""
Democracy Game – Bruecken bauen
v1 API router with route stubs for all 6 contract endpoints.
Endpoint implementations will be added in Phase 3-7.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from .auth import require_democracy_auth, require_host_role
from .schemas import (
    ActiveRoleRequest,
    ActiveRoleResponse,
    ActiveScenarioRequest,
    ActiveScenarioResponse,
    ContentVersionResponse,
    EventAckResponse,
    GameEventRequest,
    ScenarioProgressRequest,
    ScenarioProgressResponse,
    VoteResultResponse,
    WorkshopVoteRequest,
)

router = APIRouter(prefix="/v1", tags=["Democracy Game"])

# ── POST /api/v1/game/active-role ─────────────────────────────────────────────


@router.post("/game/active-role", response_model=ActiveRoleResponse)
async def set_active_role(
    body: ActiveRoleRequest,
    request: Request,
    user: dict = Depends(require_democracy_auth),
):
    """Rolle fuer ein Szenario waehlen und Szenariodaten laden."""
    raise NotImplementedError("T012: Implementierung in Phase 3")


# ── POST /api/v1/game/active-scenario ─────────────────────────────────────────


@router.post("/game/active-scenario", response_model=ActiveScenarioResponse)
async def set_active_scenario(
    body: ActiveScenarioRequest,
    request: Request,
    user: dict = Depends(require_democracy_auth),
):
    """Szenario aktivieren und verfuegbare Rollen abrufen."""
    raise NotImplementedError("T013: Implementierung in Phase 3")


# ── POST /api/v1/game/scenario-progress ───────────────────────────────────────


@router.post("/game/scenario-progress", response_model=ScenarioProgressResponse)
async def submit_scenario_progress(
    body: ScenarioProgressRequest,
    request: Request,
    user: dict = Depends(require_democracy_auth),
):
    """Entscheidung einreichen und naechste Szene erhalten."""
    raise NotImplementedError("T014: Implementierung in Phase 3")


# ── POST /api/v1/workshop/vote ────────────────────────────────────────────────


@router.post("/workshop/vote", response_model=VoteResultResponse)
async def submit_workshop_vote(
    body: WorkshopVoteRequest,
    request: Request,
    user: dict = Depends(require_democracy_auth),
):
    """Stimme in einer Workshop-Abstimmung abgeben."""
    raise NotImplementedError("T043: Implementierung in Phase 6")


# ── POST /api/v1/game/events ─────────────────────────────────────────────────


@router.post("/game/events", response_model=EventAckResponse)
async def submit_game_event(
    body: GameEventRequest,
    request: Request,
    user: dict = Depends(require_democracy_auth),
):
    """Telemetrie-Ereignis senden (nur bei aktiver Einwilligung)."""
    raise NotImplementedError("T053: Implementierung in Phase 7")


# ── GET /api/v1/game/content-version ──────────────────────────────────────────


@router.get("/game/content-version", response_model=ContentVersionResponse)
async def get_content_version(
    request: Request,
):
    """Aktuelle Content-Version abfragen (kein Auth erforderlich)."""
    raise NotImplementedError("T039: Implementierung in Phase 5")

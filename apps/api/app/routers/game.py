from __future__ import annotations

from fastapi import APIRouter, Depends

from ..rbac import require_auth
from ..schemas.game import (
    GameEventCreateRequest,
    GameProfileUpdateRequest,
    GameScenarioCompleteRequest,
)
from ..services.game_service import game_service

router = APIRouter()


@router.get("/game/bootstrap")
async def bootstrap(user: dict = Depends(require_auth)):
    data = await game_service.get_bootstrap_data(user)
    return {"success": True, "data": data}


@router.put("/game/profile")
async def update_profile(payload: GameProfileUpdateRequest, user: dict = Depends(require_auth)):
    data = await game_service.update_profile(user["uid"], payload.model_dump(exclude_none=True))
    return {"success": True, "data": data}


@router.post("/game/scenarios/{scenario_id}/complete")
async def complete_scenario(
    scenario_id: str,
    payload: GameScenarioCompleteRequest,
    user: dict = Depends(require_auth),
):
    data = await game_service.complete_scenario(
        member_id=user["uid"],
        scenario_id=scenario_id,
        role_id=payload.roleId,
        choice_id=payload.choiceId,
        use_signature_action=payload.useSignatureAction,
    )
    return {"success": True, "data": data}


@router.post("/game/events")
async def record_event(payload: GameEventCreateRequest, user: dict = Depends(require_auth)):
    data = await game_service.record_event(
        member_id=user["uid"],
        email=user.get("sub"),
        event_type=payload.eventType,
        payload=payload.payload,
        session_id=payload.sessionId,
    )
    return {"success": True, "data": data}

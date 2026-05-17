"""
Democracy Game – Bruecken bauen
Pydantic request/response schemas mirroring the API contract
(democracy-game-api-v1.md) and data model (data-model.md).
"""

from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# ── Enums ─────────────────────────────────────────────────────────────────────


class PublishStatus(str, Enum):
    draft = "draft"
    review = "review"
    released = "released"


class SceneType(str, Enum):
    dialogue = "dialogue"
    decision = "decision"
    consequence = "consequence"
    info = "info"


class SessionStatus(str, Enum):
    waiting = "waiting"
    active = "active"
    voting = "voting"
    finished = "finished"


class ConsentScope(str, Enum):
    telemetry = "telemetry"
    analytics = "analytics"


class ConsentStatusEnum(str, Enum):
    granted = "granted"
    revoked = "revoked"


class TelemetryEventType(str, Enum):
    scene_entered = "scene_entered"
    choice_made = "choice_made"
    scenario_completed = "scenario_completed"
    vote_submitted = "vote_submitted"
    session_joined = "session_joined"


# ── Value Objects ─────────────────────────────────────────────────────────────


class StatChange(BaseModel):
    stat: str = Field(..., min_length=1, max_length=64)
    delta: int


# ── Domain Schemas ────────────────────────────────────────────────────────────


class WorldSchema(BaseModel):
    world_id: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=2000)
    stats: dict[str, int] = Field(default_factory=dict)
    unlock_criteria: str | None = None


class ScenarioSchema(BaseModel):
    scenario_id: str = Field(..., min_length=1, max_length=64)
    world_id: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=300)
    objective: str = Field(..., max_length=2000)
    start_scene_id: str = Field(..., min_length=1, max_length=64)
    estimated_duration: int = Field(..., ge=1)
    required_role_ids: list[str] = Field(default_factory=list)
    version: str = Field(..., pattern=r"^\d+\.\d+\.\d+$")
    publish_status: PublishStatus = PublishStatus.draft


class ChoiceSchema(BaseModel):
    choice_id: str = Field(..., min_length=1, max_length=64)
    scene_id: str = Field(..., min_length=1, max_length=64)
    label: str = Field(..., min_length=1, max_length=500)
    next_scene_id: str | None = None
    stat_changes: list[StatChange] = Field(default_factory=list)
    feedback: str = Field(..., max_length=2000)


class SceneSchema(BaseModel):
    scene_id: str = Field(..., min_length=1, max_length=64)
    scenario_id: str = Field(..., min_length=1, max_length=64)
    type: SceneType
    content: str = Field(..., max_length=10000)
    character_id: str | None = None
    timer_seconds: int | None = Field(default=None, ge=1)
    choices: list[ChoiceSchema] = Field(default_factory=list)


class RoleSchema(BaseModel):
    role_id: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=2000)
    abilities: list[str] = Field(default_factory=list)
    focus_stats: list[str] = Field(default_factory=list)


class CharacterSchema(BaseModel):
    character_id: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    bio: str = Field(..., max_length=2000)
    portrait_url: str = Field(..., max_length=500)
    voice_assets: list[str] = Field(default_factory=list)
    accessibility_tags: list[str] = Field(default_factory=list)

    @field_validator("portrait_url")
    @classmethod
    def validate_portrait_url(cls, v: str) -> str:
        if not re.match(r"^https?://", v):
            raise ValueError("portrait_url muss eine gueltige HTTP(S)-URL sein")
        return v


# ── API Request Schemas ───────────────────────────────────────────────────────


class ActiveRoleRequest(BaseModel):
    """POST /api/v1/game/active-role"""

    scenario_id: str = Field(..., min_length=1, max_length=64)
    role_id: str = Field(..., min_length=1, max_length=64)


class ActiveScenarioRequest(BaseModel):
    """POST /api/v1/game/active-scenario"""

    scenario_id: str = Field(..., min_length=1, max_length=64)


class ScenarioProgressRequest(BaseModel):
    """POST /api/v1/game/scenario-progress"""

    scenario_id: str = Field(..., min_length=1, max_length=64)
    scene_id: str = Field(..., min_length=1, max_length=64)
    choice_id: str = Field(..., min_length=1, max_length=64)


class WorkshopVoteRequest(BaseModel):
    """POST /api/v1/workshop/vote"""

    session_id: str = Field(..., min_length=1, max_length=64)
    choice_id: str = Field(..., min_length=1, max_length=64)


class GameEventRequest(BaseModel):
    """POST /api/v1/game/events"""

    event_type: TelemetryEventType
    session_id: str | None = Field(default=None, max_length=64)
    payload: dict[str, Any] = Field(default_factory=dict)


# ── API Response Schemas ──────────────────────────────────────────────────────


class ActiveRoleResponse(BaseModel):
    role: RoleSchema
    scenario: ScenarioSchema
    scenes: list[SceneSchema]
    characters: list[CharacterSchema]


class ActiveScenarioResponse(BaseModel):
    scenario: ScenarioSchema
    world: WorldSchema
    available_roles: list[RoleSchema]


class ScenarioProgressResponse(BaseModel):
    next_scene: SceneSchema | None
    stat_changes: list[StatChange]
    feedback: str
    scenario_completed: bool


class VoteResultResponse(BaseModel):
    vote_id: str
    aggregation: dict[str, int]
    deadline: datetime | None


class ContentVersionResponse(BaseModel):
    version: str
    updated_at: datetime


class EventAckResponse(BaseModel):
    event_id: str
    accepted: bool


# ── Standard Error Schema ─────────────────────────────────────────────────────


class ErrorDetail(BaseModel):
    field: str | None = None
    reason: str


class StandardError(BaseModel):
    code: str
    message: str
    correlation_id: str
    details: list[ErrorDetail] = Field(default_factory=list)

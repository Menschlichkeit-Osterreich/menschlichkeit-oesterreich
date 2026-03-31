from __future__ import annotations

from pydantic import BaseModel, Field


class GameSettingsPayload(BaseModel):
    reducedMotion: bool = False
    lowGraphics: bool = False


class GameProfileUpdateRequest(BaseModel):
    selectedRole: str | None = Field(default=None, min_length=1, max_length=50)
    currentWorldId: str | None = Field(default=None, min_length=1, max_length=50)
    resumeScenarioId: str | None = Field(default=None, min_length=1, max_length=100)
    settings: GameSettingsPayload | None = None


class GameScenarioCompleteRequest(BaseModel):
    roleId: str = Field(min_length=1, max_length=50)
    choiceId: str = Field(min_length=1, max_length=100)
    useSignatureAction: bool = False


class GameEventCreateRequest(BaseModel):
    eventType: str = Field(min_length=1, max_length=100)
    payload: dict = Field(default_factory=dict)
    sessionId: str | None = Field(default=None, max_length=120)

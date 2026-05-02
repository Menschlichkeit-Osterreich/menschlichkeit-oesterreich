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


class GameMissionProgressRequest(BaseModel):
    missionId: str = Field(min_length=1, max_length=120)
    scenarioId: str = Field(min_length=1, max_length=120)
    roleId: str = Field(min_length=1, max_length=120)
    status: str = Field(min_length=1, max_length=40)
    collected: int = Field(ge=0)
    totalCollectibles: int = Field(ge=0)
    remainingSeconds: float = Field(ge=0)


class GameScenarioResultRequest(BaseModel):
    missionId: str = Field(min_length=1, max_length=120)
    missionTitle: str = Field(min_length=1, max_length=200)
    scenarioId: str = Field(min_length=1, max_length=120)
    scenarioTitle: str = Field(min_length=1, max_length=200)
    outcome: str = Field(min_length=1, max_length=30)
    roleId: str = Field(min_length=1, max_length=120)
    roleTitle: str = Field(min_length=1, max_length=200)
    collected: int = Field(ge=0)
    totalCollectibles: int = Field(ge=0)
    elapsedSeconds: float = Field(ge=0)
    recordedAt: str = Field(min_length=1, max_length=120)


class GameAudioPreferenceRequest(BaseModel):
    audioMuted: bool

"""
Democracy Game – Bruecken bauen
SQLAlchemy ORM models for all 10 data-model entities.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Shared declarative base for democracy game models."""


# ── World ─────────────────────────────────────────────────────────────────────


class WorldModel(Base):
    __tablename__ = "democracy_world"

    world_id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    stats = Column(JSONB, nullable=False, default=dict)
    unlock_criteria = Column(Text, nullable=True)

    scenarios = relationship("ScenarioModel", back_populates="world")


# ── Scenario ──────────────────────────────────────────────────────────────────


class ScenarioModel(Base):
    __tablename__ = "democracy_scenario"

    scenario_id = Column(String(64), primary_key=True)
    world_id = Column(
        String(64), ForeignKey("democracy_world.world_id"), nullable=False
    )
    title = Column(String(300), nullable=False)
    objective = Column(Text, nullable=False, default="")
    start_scene_id = Column(String(64), nullable=False)
    estimated_duration = Column(Integer, nullable=False)
    required_role_ids = Column(JSONB, nullable=False, default=list)
    version = Column(String(20), nullable=False)
    publish_status = Column(
        SAEnum("draft", "review", "released", name="publish_status_enum"),
        nullable=False,
        default="draft",
    )

    world = relationship("WorldModel", back_populates="scenarios")
    scenes = relationship("SceneModel", back_populates="scenario")
    sessions = relationship("WorkshopSessionModel", back_populates="scenario")


# ── Scene ─────────────────────────────────────────────────────────────────────


class SceneModel(Base):
    __tablename__ = "democracy_scene"

    scene_id = Column(String(64), primary_key=True)
    scenario_id = Column(
        String(64), ForeignKey("democracy_scenario.scenario_id"), nullable=False
    )
    type = Column(
        SAEnum("dialogue", "decision", "consequence", "info", name="scene_type_enum"),
        nullable=False,
    )
    content = Column(Text, nullable=False, default="")
    character_id = Column(String(64), nullable=True)
    timer_seconds = Column(Integer, nullable=True)

    scenario = relationship("ScenarioModel", back_populates="scenes")
    choices = relationship("ChoiceModel", back_populates="scene")


# ── Choice ────────────────────────────────────────────────────────────────────


class ChoiceModel(Base):
    __tablename__ = "democracy_choice"

    choice_id = Column(String(64), primary_key=True)
    scene_id = Column(
        String(64), ForeignKey("democracy_scene.scene_id"), nullable=False
    )
    label = Column(String(500), nullable=False)
    next_scene_id = Column(String(64), nullable=True)
    stat_changes = Column(JSONB, nullable=False, default=list)
    feedback = Column(Text, nullable=False, default="")

    scene = relationship("SceneModel", back_populates="choices")


# ── Role ──────────────────────────────────────────────────────────────────────


class RoleModel(Base):
    __tablename__ = "democracy_role"

    role_id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    abilities = Column(JSONB, nullable=False, default=list)
    focus_stats = Column(JSONB, nullable=False, default=list)


# ── Character ─────────────────────────────────────────────────────────────────


class CharacterModel(Base):
    __tablename__ = "democracy_character"

    character_id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=False, default="")
    portrait_url = Column(String(500), nullable=False)
    voice_assets = Column(JSONB, nullable=False, default=list)
    accessibility_tags = Column(JSONB, nullable=False, default=list)


# ── Workshop Session ─────────────────────────────────────────────────────────


class WorkshopSessionModel(Base):
    __tablename__ = "democracy_workshop_session"

    session_id = Column(String(64), primary_key=True)
    host_user_id = Column(String(128), nullable=False)
    scenario_id = Column(
        String(64), ForeignKey("democracy_scenario.scenario_id"), nullable=False
    )
    status = Column(
        SAEnum(
            "waiting", "active", "voting", "finished", name="session_status_enum"
        ),
        nullable=False,
        default="waiting",
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    vote_deadline = Column(DateTime(timezone=True), nullable=True)
    participants = Column(JSONB, nullable=False, default=list)

    scenario = relationship("ScenarioModel", back_populates="sessions")
    votes = relationship("WorkshopVoteModel", back_populates="session")


# ── Workshop Vote ─────────────────────────────────────────────────────────────


class WorkshopVoteModel(Base):
    __tablename__ = "democracy_workshop_vote"

    vote_id = Column(String(64), primary_key=True)
    session_id = Column(
        String(64),
        ForeignKey("democracy_workshop_session.session_id"),
        nullable=False,
    )
    participant_id = Column(String(128), nullable=False)
    choice_id = Column(String(64), nullable=False)
    submitted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    is_latest_for_participant = Column(Boolean, nullable=False, default=True)

    session = relationship("WorkshopSessionModel", back_populates="votes")


# ── Consent Record ───────────────────────────────────────────────────────────


class ConsentRecordModel(Base):
    __tablename__ = "democracy_consent_record"

    consent_id = Column(String(64), primary_key=True)
    subject_id = Column(String(128), nullable=False)
    scope = Column(
        SAEnum("telemetry", "analytics", name="consent_scope_enum"),
        nullable=False,
    )
    status = Column(
        SAEnum("granted", "revoked", name="consent_status_enum"),
        nullable=False,
        default="granted",
    )
    granted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    events = relationship("TelemetryEventModel", back_populates="consent")


# ── Telemetry Event ──────────────────────────────────────────────────────────


def _default_retention() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=90)


class TelemetryEventModel(Base):
    __tablename__ = "democracy_telemetry_event"

    event_id = Column(String(64), primary_key=True)
    consent_id = Column(
        String(64),
        ForeignKey("democracy_consent_record.consent_id"),
        nullable=False,
    )
    session_id = Column(String(64), nullable=True)
    event_type = Column(
        SAEnum(
            "scene_entered",
            "choice_made",
            "scenario_completed",
            "vote_submitted",
            "session_joined",
            name="telemetry_event_type_enum",
        ),
        nullable=False,
    )
    payload = Column(JSONB, nullable=False, default=dict)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    retention_until = Column(
        DateTime(timezone=True),
        nullable=False,
        default=_default_retention,
    )

    consent = relationship("ConsentRecordModel", back_populates="events")

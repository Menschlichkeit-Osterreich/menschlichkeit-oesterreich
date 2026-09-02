"""Request and response contracts for the suppression boundary."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class SuppressionCommitRequest(BaseModel):
    """What the automation layer must supply before it may mark a mail done.

    ``source_event_id`` is required rather than optional on purpose: without a
    stable origin there is no idempotency, and without idempotency a retry
    silently doubles the audit trail.
    """

    realm: str = Field(..., description="MOE, BOOK, POLITICS_LAIMER oder POLITICS_BASIS")
    identity: str = Field(..., description="E-Mail-Adresse, unnormalisiert")
    source_system: str = Field(
        ..., description="Herkunft, etwa 'make:7187291' oder 'portal'"
    )
    source_event_id: str = Field(
        ..., description="Stabile ID des auslösenden Ereignisses, etwa gmail:<message_id>"
    )
    evidence_reference: str | None = Field(
        default=None,
        description="Verweis auf den Beleg, etwa ein Mail-Permalink. Kein Inhalt.",
    )
    detected_at: datetime | None = Field(
        default=None, description="Zeitpunkt des Eingangs beim Vorsystem"
    )


class SuppressionCommitResponse(BaseModel):
    committed: bool
    suppression_id: str
    realm: str
    normalized_identity: str
    created: bool
    duplicate_delivery: bool
    first_committed_at: datetime
    last_confirmed_at: datetime


class SuppressionCheckResponse(BaseModel):
    realm: str
    normalized_identity: str
    suppressed: bool

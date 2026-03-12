from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    titel: str = Field(min_length=1, max_length=300)
    beschreibung: str = Field(min_length=1)
    ort: Optional[str] = None
    start_datum: str
    end_datum: Optional[str] = None
    max_teilnehmer: Optional[int] = None
    kategorie: str = Field(default="Allgemein")
    ist_oeffentlich: bool = True


class EventUpdate(BaseModel):
    titel: Optional[str] = None
    beschreibung: Optional[str] = None
    ort: Optional[str] = None
    start_datum: Optional[str] = None
    end_datum: Optional[str] = None
    max_teilnehmer: Optional[int] = None
    kategorie: Optional[str] = None
    ist_oeffentlich: Optional[bool] = None


class EventResponse(BaseModel):
    id: str
    titel: str
    beschreibung: str
    ort: Optional[str] = None
    start_datum: str
    end_datum: Optional[str] = None
    max_teilnehmer: Optional[int] = None
    aktuelle_teilnehmer: int = 0
    kategorie: str
    ist_oeffentlich: bool
    ersteller_id: str
    ersteller_name: str
    created_at: str
    updated_at: str


class EventRsvpRequest(BaseModel):
    event_id: str
    status: str = Field(default="angemeldet")


class EventRsvpResponse(BaseModel):
    success: bool = True
    message: str
    teilnehmer_count: int


class EventListResponse(BaseModel):
    success: bool = True
    data: list[EventResponse]
    total: int

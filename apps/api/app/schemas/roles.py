from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class RoleResponse(BaseModel):
    id: str
    name: str
    beschreibung: Optional[str] = None
    berechtigungen: list[str] = []


class RoleAssignRequest(BaseModel):
    user_id: str
    role_name: str = Field(min_length=1)


class RoleListResponse(BaseModel):
    success: bool = True
    data: list[RoleResponse]

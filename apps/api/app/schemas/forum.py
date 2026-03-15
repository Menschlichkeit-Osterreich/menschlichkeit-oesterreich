from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ForumCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    beschreibung: Optional[str] = None
    sort_order: int = 0


class ForumCategoryResponse(ForumCategoryBase):
    id: str
    thread_count: int = 0
    post_count: int = 0


class ForumThreadCreate(BaseModel):
    category_id: str
    titel: str = Field(min_length=1, max_length=300)
    inhalt: str = Field(min_length=1)


class ForumThreadUpdate(BaseModel):
    titel: Optional[str] = None
    inhalt: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None


class ForumThreadResponse(BaseModel):
    id: str
    category_id: str
    category_name: Optional[str] = None
    titel: str
    inhalt: str
    autor_id: str
    autor_name: str
    is_pinned: bool = False
    is_locked: bool = False
    reply_count: int = 0
    created_at: str
    updated_at: str


class ForumPostCreate(BaseModel):
    thread_id: str
    inhalt: str = Field(min_length=1)


class ForumPostResponse(BaseModel):
    id: str
    thread_id: str
    inhalt: str
    autor_id: str
    autor_name: str
    created_at: str
    updated_at: str


class ForumListResponse(BaseModel):
    success: bool = True
    data: list[ForumThreadResponse]
    total: int

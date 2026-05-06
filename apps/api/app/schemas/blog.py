from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BlogArticleCreate(BaseModel):
    titel: str = Field(min_length=1, max_length=300)
    inhalt: str = Field(min_length=1)
    zusammenfassung: Optional[str] = None
    kategorie: str = Field(default="Allgemein")
    tags: list[str] = []
    veroeffentlicht: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image: Optional[str] = None


class BlogArticleUpdate(BaseModel):
    titel: Optional[str] = None
    inhalt: Optional[str] = None
    zusammenfassung: Optional[str] = None
    kategorie: Optional[str] = None
    tags: Optional[list[str]] = None
    veroeffentlicht: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image: Optional[str] = None


class BlogArticleResponse(BaseModel):
    id: str
    titel: str
    inhalt: str
    zusammenfassung: Optional[str] = None
    kategorie: str
    tags: list[str] = []
    autor_id: str
    autor_name: str
    veroeffentlicht: bool
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image: Optional[str] = None
    created_at: str
    updated_at: str


class BlogListResponse(BaseModel):
    success: bool = True
    data: list[BlogArticleResponse]
    total: int

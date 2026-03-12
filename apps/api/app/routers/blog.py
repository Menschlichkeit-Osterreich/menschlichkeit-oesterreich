from __future__ import annotations

import json
import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchrow, fetchval, execute
from ..rbac import Role, require_auth, require_role
from ..schemas.blog import (
    BlogArticleCreate,
    BlogArticleResponse,
    BlogArticleUpdate,
    BlogListResponse,
)

logger = logging.getLogger("menschlichkeit.blog")
router = APIRouter()


async def _ensure_blog_table() -> None:
    await execute("""
        CREATE TABLE IF NOT EXISTS blog_articles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            titel TEXT NOT NULL,
            inhalt TEXT NOT NULL,
            zusammenfassung TEXT,
            kategorie TEXT NOT NULL DEFAULT 'Allgemein',
            tags JSONB DEFAULT '[]'::jsonb,
            autor_id UUID NOT NULL,
            veroeffentlicht BOOLEAN DEFAULT FALSE,
            seo_title TEXT,
            seo_description TEXT,
            og_image TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)


def _row_to_response(r: dict) -> BlogArticleResponse:
    tags = r.get("tags", [])
    if isinstance(tags, str):
        tags = json.loads(tags) if tags else []
    return BlogArticleResponse(
        id=str(r["id"]), titel=r["titel"], inhalt=r["inhalt"],
        zusammenfassung=r.get("zusammenfassung"),
        kategorie=r.get("kategorie", "Allgemein"),
        tags=tags if isinstance(tags, list) else [],
        autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Redaktion"),
        veroeffentlicht=r.get("veroeffentlicht", False),
        seo_title=r.get("seo_title"), seo_description=r.get("seo_description"),
        og_image=r.get("og_image"),
        created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
    )


@router.get("/blog/articles", response_model=BlogListResponse)
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    kategorie: str = Query("", max_length=100),
    nur_veroeffentlicht: bool = Query(True),
):
    await _ensure_blog_table()
    conditions = ["1=1"]
    params: list = []
    idx = 1

    if nur_veroeffentlicht:
        conditions.append("b.veroeffentlicht = TRUE")

    if kategorie:
        conditions.append(f"b.kategorie = ${idx}")
        params.append(kategorie)
        idx += 1

    where = " AND ".join(conditions)
    total = await fetchval(f"SELECT COUNT(*) FROM blog_articles b WHERE {where}", *params) or 0

    params.append(page_size)
    params.append((page - 1) * page_size)
    rows = await fetch(f"""
        SELECT b.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM blog_articles b
        LEFT JOIN members m ON b.autor_id = m.id
        WHERE {where}
        ORDER BY b.created_at DESC
        LIMIT ${idx} OFFSET ${idx+1}
    """, *params)

    return BlogListResponse(data=[_row_to_response(dict(r)) for r in rows], total=int(total))


@router.get("/blog/articles/{article_id}", response_model=BlogArticleResponse)
async def get_article(article_id: str):
    await _ensure_blog_table()
    row = await fetchrow("""
        SELECT b.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM blog_articles b
        LEFT JOIN members m ON b.autor_id = m.id
        WHERE b.id = $1::uuid
    """, article_id)
    if not row:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    return _row_to_response(dict(row))


@router.post("/blog/articles", response_model=BlogArticleResponse, status_code=201)
async def create_article(body: BlogArticleCreate, user: dict = require_role(Role.MODERATOR)):
    await _ensure_blog_table()
    aid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        """INSERT INTO blog_articles (id, titel, inhalt, zusammenfassung, kategorie, tags, autor_id, veroeffentlicht, seo_title, seo_description, og_image)
           VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, $7::uuid, $8, $9, $10, $11)""",
        aid, body.titel, body.inhalt, body.zusammenfassung, body.kategorie,
        json.dumps(body.tags), uid, body.veroeffentlicht,
        body.seo_title, body.seo_description, body.og_image,
    )
    return await get_article(aid)


@router.put("/blog/articles/{article_id}", response_model=BlogArticleResponse)
async def update_article(article_id: str, body: BlogArticleUpdate, user: dict = require_role(Role.MODERATOR)):
    await _ensure_blog_table()
    row = await fetchrow("SELECT * FROM blog_articles WHERE id = $1::uuid", article_id)
    if not row:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")

    updates = {}
    if body.titel is not None:
        updates["titel"] = body.titel
    if body.inhalt is not None:
        updates["inhalt"] = body.inhalt
    if body.zusammenfassung is not None:
        updates["zusammenfassung"] = body.zusammenfassung
    if body.kategorie is not None:
        updates["kategorie"] = body.kategorie
    if body.tags is not None:
        updates["tags"] = json.dumps(body.tags)
    if body.veroeffentlicht is not None:
        updates["veroeffentlicht"] = body.veroeffentlicht
    if body.seo_title is not None:
        updates["seo_title"] = body.seo_title
    if body.seo_description is not None:
        updates["seo_description"] = body.seo_description
    if body.og_image is not None:
        updates["og_image"] = body.og_image

    if updates:
        set_clauses = []
        params = []
        for i, (key, val) in enumerate(updates.items(), 1):
            if key == "tags":
                set_clauses.append(f"{key} = ${i}::jsonb")
            else:
                set_clauses.append(f"{key} = ${i}")
            params.append(val)
        params.append(article_id)
        await execute(
            f"UPDATE blog_articles SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
            *params,
        )
    return await get_article(article_id)


@router.delete("/blog/articles/{article_id}")
async def delete_article(article_id: str, user: dict = require_role(Role.ADMIN)):
    await execute("DELETE FROM blog_articles WHERE id = $1::uuid", article_id)
    return {"success": True, "message": "Artikel gelöscht"}

from __future__ import annotations

import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchrow, fetchval, execute
from ..rbac import Role, require_auth, require_role
from ..schemas.forum import (
    ForumCategoryResponse,
    ForumListResponse,
    ForumPostCreate,
    ForumPostResponse,
    ForumThreadCreate,
    ForumThreadResponse,
    ForumThreadUpdate,
)

logger = logging.getLogger("menschlichkeit.forum")
router = APIRouter()


DEFAULT_CATEGORIES = [
    ("Allgemein", "Allgemeine Diskussionen rund um den Verein", 1),
    ("Demokratie & Politik", "Diskussionen zu Demokratie, Politik und Menschenrechten", 2),
    ("Veranstaltungen", "Austausch zu Veranstaltungen und Events", 3),
    ("Bildung", "Bildungsthemen, Workshops und Materialien", 4),
    ("Technik & Plattform", "Fragen und Anregungen zur Plattform", 5),
]


async def _ensure_forum_tables() -> None:
    await execute("""
        CREATE TABLE IF NOT EXISTS forum_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            beschreibung TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    await execute("""
        CREATE TABLE IF NOT EXISTS forum_threads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category_id UUID REFERENCES forum_categories(id),
            titel TEXT NOT NULL,
            inhalt TEXT NOT NULL,
            autor_id UUID NOT NULL,
            is_pinned BOOLEAN DEFAULT FALSE,
            is_locked BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    await execute("""
        CREATE TABLE IF NOT EXISTS forum_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
            inhalt TEXT NOT NULL,
            autor_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    existing = await fetchval("SELECT COUNT(*) FROM forum_categories")
    if not existing or int(existing) == 0:
        for name, beschreibung, sort_order in DEFAULT_CATEGORIES:
            await execute(
                "INSERT INTO forum_categories (name, beschreibung, sort_order) VALUES ($1, $2, $3)",
                name, beschreibung, sort_order,
            )
        logger.info("Forum-Kategorien initialisiert: %d Kategorien", len(DEFAULT_CATEGORIES))


@router.get("/forum/categories", response_model=list[ForumCategoryResponse])
async def list_categories():
    await _ensure_forum_tables()
    rows = await fetch("""
        SELECT c.*,
               COALESCE((SELECT COUNT(*) FROM forum_threads t WHERE t.category_id = c.id), 0) AS thread_count,
               COALESCE((SELECT COUNT(*) FROM forum_posts p JOIN forum_threads t2 ON p.thread_id = t2.id WHERE t2.category_id = c.id), 0) AS post_count
        FROM forum_categories c ORDER BY c.sort_order, c.name
    """)
    return [
        ForumCategoryResponse(
            id=str(r["id"]), name=r["name"], beschreibung=r.get("beschreibung"),
            sort_order=r.get("sort_order", 0),
            thread_count=int(r["thread_count"]), post_count=int(r["post_count"]),
        )
        for r in rows
    ]


@router.get("/forum/threads", response_model=ForumListResponse)
async def list_threads(
    category_id: str = Query("", max_length=64),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    await _ensure_forum_tables()
    conditions = ["1=1"]
    params: list = []
    idx = 1

    if category_id:
        conditions.append(f"t.category_id = ${idx}::uuid")
        params.append(category_id)
        idx += 1

    where = " AND ".join(conditions)
    total = await fetchval(f"SELECT COUNT(*) FROM forum_threads t WHERE {where}", *params) or 0

    params.append(page_size)
    params.append((page - 1) * page_size)
    rows = await fetch(f"""
        SELECT t.*, m.vorname || ' ' || m.nachname AS autor_name,
               c.name AS category_name,
               COALESCE((SELECT COUNT(*) FROM forum_posts p WHERE p.thread_id = t.id), 0) AS reply_count
        FROM forum_threads t
        LEFT JOIN members m ON t.autor_id = m.id
        LEFT JOIN forum_categories c ON t.category_id = c.id
        WHERE {where}
        ORDER BY t.is_pinned DESC, t.updated_at DESC
        LIMIT ${idx} OFFSET ${idx+1}
    """, *params)

    threads = [
        ForumThreadResponse(
            id=str(r["id"]), category_id=str(r["category_id"]) if r.get("category_id") else "",
            category_name=r.get("category_name"), titel=r["titel"], inhalt=r["inhalt"],
            autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Unbekannt"),
            is_pinned=r.get("is_pinned", False), is_locked=r.get("is_locked", False),
            reply_count=int(r.get("reply_count", 0)),
            created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
        )
        for r in rows
    ]
    return ForumListResponse(data=threads, total=int(total))


@router.get("/forum/threads/{thread_id}", response_model=ForumThreadResponse)
async def get_thread(thread_id: str):
    await _ensure_forum_tables()
    row = await fetchrow("""
        SELECT t.*, m.vorname || ' ' || m.nachname AS autor_name,
               c.name AS category_name,
               COALESCE((SELECT COUNT(*) FROM forum_posts p WHERE p.thread_id = t.id), 0) AS reply_count
        FROM forum_threads t
        LEFT JOIN members m ON t.autor_id = m.id
        LEFT JOIN forum_categories c ON t.category_id = c.id
        WHERE t.id = $1::uuid
    """, thread_id)
    if not row:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")
    r = dict(row)
    return ForumThreadResponse(
        id=str(r["id"]), category_id=str(r["category_id"]) if r.get("category_id") else "",
        category_name=r.get("category_name"), titel=r["titel"], inhalt=r["inhalt"],
        autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Unbekannt"),
        is_pinned=r.get("is_pinned", False), is_locked=r.get("is_locked", False),
        reply_count=int(r.get("reply_count", 0)),
        created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
    )


@router.post("/forum/threads", response_model=ForumThreadResponse, status_code=201)
async def create_thread(body: ForumThreadCreate, user: dict = Depends(require_auth)):
    await _ensure_forum_tables()
    tid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        """INSERT INTO forum_threads (id, category_id, titel, inhalt, autor_id)
           VALUES ($1::uuid, $2::uuid, $3, $4, $5::uuid)""",
        tid, body.category_id, body.titel, body.inhalt, uid,
    )
    return await get_thread(tid)


@router.put("/forum/threads/{thread_id}", response_model=ForumThreadResponse)
async def update_thread(thread_id: str, body: ForumThreadUpdate, user: dict = require_role(Role.MODERATOR)):
    await _ensure_forum_tables()
    row = await fetchrow("SELECT * FROM forum_threads WHERE id = $1::uuid", thread_id)
    if not row:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")

    updates = {}
    if body.titel is not None:
        updates["titel"] = body.titel
    if body.inhalt is not None:
        updates["inhalt"] = body.inhalt
    if body.is_pinned is not None:
        updates["is_pinned"] = body.is_pinned
    if body.is_locked is not None:
        updates["is_locked"] = body.is_locked

    if updates:
        set_clauses = []
        params = []
        for i, (key, val) in enumerate(updates.items(), 1):
            set_clauses.append(f"{key} = ${i}")
            params.append(val)
        params.append(thread_id)
        await execute(
            f"UPDATE forum_threads SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
            *params,
        )
    return await get_thread(thread_id)


@router.delete("/forum/threads/{thread_id}")
async def delete_thread(thread_id: str, user: dict = require_role(Role.MODERATOR)):
    await execute("DELETE FROM forum_threads WHERE id = $1::uuid", thread_id)
    return {"success": True, "message": "Thread gelöscht"}


@router.get("/forum/threads/{thread_id}/posts", response_model=list[ForumPostResponse])
async def list_posts(thread_id: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    await _ensure_forum_tables()
    offset = (page - 1) * page_size
    rows = await fetch("""
        SELECT p.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM forum_posts p
        LEFT JOIN members m ON p.autor_id = m.id
        WHERE p.thread_id = $1::uuid
        ORDER BY p.created_at ASC
        LIMIT $2 OFFSET $3
    """, thread_id, page_size, offset)
    return [
        ForumPostResponse(
            id=str(r["id"]), thread_id=str(r["thread_id"]), inhalt=r["inhalt"],
            autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Unbekannt"),
            created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
        )
        for r in rows
    ]


@router.post("/forum/posts", response_model=ForumPostResponse, status_code=201)
async def create_post(body: ForumPostCreate, user: dict = Depends(require_auth)):
    await _ensure_forum_tables()
    thread = await fetchrow("SELECT * FROM forum_threads WHERE id = $1::uuid", body.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")
    if dict(thread).get("is_locked"):
        raise HTTPException(status_code=403, detail="Thread ist gesperrt")

    pid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        "INSERT INTO forum_posts (id, thread_id, inhalt, autor_id) VALUES ($1::uuid, $2::uuid, $3, $4::uuid)",
        pid, body.thread_id, body.inhalt, uid,
    )
    await execute("UPDATE forum_threads SET updated_at = NOW() WHERE id = $1::uuid", body.thread_id)

    row = await fetchrow("""
        SELECT p.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM forum_posts p LEFT JOIN members m ON p.autor_id = m.id WHERE p.id = $1::uuid
    """, pid)
    r = dict(row)
    return ForumPostResponse(
        id=str(r["id"]), thread_id=str(r["thread_id"]), inhalt=r["inhalt"],
        autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Unbekannt"),
        created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
    )

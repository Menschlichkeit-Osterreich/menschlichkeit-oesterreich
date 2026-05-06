from __future__ import annotations

import logging
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchrow, fetchval, execute
from ..rbac import Role, require_auth, require_role
from ..schemas.forum import (
    ForumCategoryResponse,
    ForumCategoryCreate,
    ForumCategoryUpdate,
    ForumListResponse,
    ForumPostCreate,
    ForumPostResponse,
    ForumThreadCreate,
    ForumThreadResponse,
    ForumThreadUpdate,
)

logger = logging.getLogger("menschlichkeit.forum")
router = APIRouter()


def _parse_uuid(value: str) -> str | None:
    try:
        return str(UUID(value))
    except (TypeError, ValueError):
        return None

SEED_CATEGORIES = [
    {
        "id": "seed-kategorie-allgemein",
        "name": "Allgemeine Diskussion",
        "beschreibung": "Fragen, Ideen und Hinweise rund um Vereinsleben und Beteiligung.",
        "sort_order": 1,
    },
    {
        "id": "seed-kategorie-veranstaltungen",
        "name": "Veranstaltungen & Mitmachen",
        "beschreibung": "Austausch zu Terminen, Workshops und Möglichkeiten zum Mitwirken.",
        "sort_order": 2,
    },
]

SEED_THREADS = [
    {
        "id": "seed-thread-willkommen",
        "category_id": "seed-kategorie-allgemein",
        "category_name": "Allgemeine Diskussion",
        "titel": "Willkommen im Forum von Menschlichkeit Österreich",
        "inhalt": (
            "Dieses Forum ist der Ort für Fragen, Ideen und konstruktiven Austausch. "
            "Bitte achten Sie auf respektvollen Umgang, nachvollziehbare Argumente und einen offenen Ton."
        ),
        "autor_id": "seed-redaktion",
        "autor_name": "Moderation",
        "is_pinned": True,
        "is_locked": True,
        "reply_count": 1,
        "created_at": "2026-03-24T08:30:00+00:00",
        "updated_at": "2026-03-24T08:30:00+00:00",
    },
    {
        "id": "seed-thread-veranstaltungen",
        "category_id": "seed-kategorie-veranstaltungen",
        "category_name": "Veranstaltungen & Mitmachen",
        "titel": "Welche Themen sollen wir in kommenden Workshops vertiefen?",
        "inhalt": (
            "Wir sammeln Themenvorschläge für kommende Workshops und Gesprächsformate. "
            "Welche Fragen zu Demokratie, Menschenrechten oder sozialer Gerechtigkeit sind Ihnen aktuell besonders wichtig?"
        ),
        "autor_id": "seed-redaktion",
        "autor_name": "Redaktion Menschlichkeit Österreich",
        "is_pinned": False,
        "is_locked": True,
        "reply_count": 1,
        "created_at": "2026-03-27T11:00:00+00:00",
        "updated_at": "2026-03-27T11:00:00+00:00",
    },
]

SEED_POSTS = {
    "seed-thread-willkommen": [
        {
            "id": "seed-post-willkommen-1",
            "thread_id": "seed-thread-willkommen",
            "inhalt": "Danke fürs Dabeisein. Nutzen Sie das Forum gern für Rückfragen, Hinweise und Ideen.",
            "autor_id": "seed-moderation",
            "autor_name": "Moderation",
            "created_at": "2026-03-24T09:00:00+00:00",
            "updated_at": "2026-03-24T09:00:00+00:00",
        }
    ],
    "seed-thread-veranstaltungen": [
        {
            "id": "seed-post-veranstaltungen-1",
            "thread_id": "seed-thread-veranstaltungen",
            "inhalt": "Spannend wären Formate zu kommunaler Beteiligung, digitaler Demokratie und sozialem Zusammenhalt.",
            "autor_id": "seed-community",
            "autor_name": "Community-Team",
            "created_at": "2026-03-27T12:15:00+00:00",
            "updated_at": "2026-03-27T12:15:00+00:00",
        }
    ],
}


@router.get("/forum/categories", response_model=list[ForumCategoryResponse])
async def list_categories():
    rows = await fetch("""
        SELECT c.*,
               COALESCE((SELECT COUNT(*) FROM forum_threads t WHERE t.category_id = c.id), 0) AS thread_count,
               COALESCE((SELECT COUNT(*) FROM forum_posts p JOIN forum_threads t2 ON p.thread_id = t2.id WHERE t2.category_id = c.id), 0) AS post_count
        FROM forum_categories c ORDER BY c.sort_order, c.name
    """)
    items = [
        ForumCategoryResponse(
            id=str(r["id"]), name=r["name"], beschreibung=r.get("beschreibung"),
            sort_order=r.get("sort_order", 0),
            thread_count=int(r["thread_count"]), post_count=int(r["post_count"]),
        )
        for r in rows
    ]
    if items:
        return items

    return [
        ForumCategoryResponse(
            id=item["id"],
            name=item["name"],
            beschreibung=item.get("beschreibung"),
            sort_order=item.get("sort_order", 0),
            thread_count=sum(1 for thread in SEED_THREADS if thread["category_id"] == item["id"]),
            post_count=sum(len(SEED_POSTS.get(thread["id"], [])) for thread in SEED_THREADS if thread["category_id"] == item["id"]),
        )
        for item in SEED_CATEGORIES
    ]


@router.post("/forum/categories", response_model=ForumCategoryResponse, status_code=201)
async def create_category(body: ForumCategoryCreate, user: dict = require_role(Role.MODERATOR)):
    category_id = str(uuid4())
    await execute(
        """
        INSERT INTO forum_categories (id, name, beschreibung, sort_order)
        VALUES ($1::uuid, $2, $3, $4)
        """,
        category_id,
        body.name,
        body.beschreibung,
        body.sort_order,
    )

    row = await fetchrow(
        """
        SELECT c.*,
               0 AS thread_count,
               0 AS post_count
        FROM forum_categories c
        WHERE c.id = $1::uuid
        """,
        category_id,
    )
    r = dict(row)
    return ForumCategoryResponse(
        id=str(r["id"]),
        name=r["name"],
        beschreibung=r.get("beschreibung"),
        sort_order=r.get("sort_order", 0),
        thread_count=0,
        post_count=0,
    )


@router.put("/forum/categories/{category_id}", response_model=ForumCategoryResponse)
async def update_category(category_id: str, body: ForumCategoryUpdate, user: dict = require_role(Role.MODERATOR)):
    row = await fetchrow("SELECT * FROM forum_categories WHERE id = $1::uuid", category_id)
    if not row:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")

    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.beschreibung is not None:
        updates["beschreibung"] = body.beschreibung
    if body.sort_order is not None:
        updates["sort_order"] = body.sort_order

    if updates:
        set_clauses = []
        params = []
        for index, (key, value) in enumerate(updates.items(), start=1):
            set_clauses.append(f"{key} = ${index}")
            params.append(value)
        params.append(category_id)
        await execute(
            f"UPDATE forum_categories SET {', '.join(set_clauses)} WHERE id = ${len(params)}::uuid",
            *params,
        )

    categories = await list_categories()
    category = next((item for item in categories if item.id == category_id), None)
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    return category


@router.delete("/forum/categories/{category_id}")
async def delete_category(category_id: str, user: dict = require_role(Role.MODERATOR)):
    await execute("DELETE FROM forum_categories WHERE id = $1::uuid", category_id)
    return {"success": True, "message": "Kategorie gelöscht"}


@router.get("/forum/threads", response_model=ForumListResponse)
async def list_threads(
    category_id: str = Query("", max_length=64),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    conditions = ["1=1"]
    params: list = []
    idx = 1

    if category_id:
        category_uuid = _parse_uuid(category_id)
        if category_uuid:
            conditions.append(f"t.category_id = ${idx}::uuid")
            params.append(category_uuid)
            idx += 1
        elif not category_id.startswith("seed-"):
            return ForumListResponse(data=[], total=0)

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
    if not threads:
        filtered = [
            thread for thread in SEED_THREADS
            if not category_id or thread["category_id"] == category_id
        ]
        offset = (page - 1) * page_size
        page_threads = filtered[offset:offset + page_size]
        return ForumListResponse(
            data=[
                ForumThreadResponse(**thread)
                for thread in page_threads
            ],
            total=len(filtered),
        )
    return ForumListResponse(data=threads, total=int(total))


@router.get("/forum/threads/{thread_id}", response_model=ForumThreadResponse)
async def get_thread(thread_id: str):
    thread_uuid = _parse_uuid(thread_id)
    if not thread_uuid:
        seed = next((thread for thread in SEED_THREADS if thread["id"] == thread_id), None)
        if not seed:
            raise HTTPException(status_code=404, detail="Thread nicht gefunden")
        return ForumThreadResponse(**seed)

    row = await fetchrow("""
        SELECT t.*, m.vorname || ' ' || m.nachname AS autor_name,
               c.name AS category_name,
               COALESCE((SELECT COUNT(*) FROM forum_posts p WHERE p.thread_id = t.id), 0) AS reply_count
        FROM forum_threads t
        LEFT JOIN members m ON t.autor_id = m.id
        LEFT JOIN forum_categories c ON t.category_id = c.id
        WHERE t.id = $1::uuid
    """, thread_uuid)
    if not row:
        seed = next((thread for thread in SEED_THREADS if thread["id"] == thread_id), None)
        if not seed:
            raise HTTPException(status_code=404, detail="Thread nicht gefunden")
        return ForumThreadResponse(**seed)
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
    category_uuid = _parse_uuid(body.category_id)
    if not category_uuid:
        raise HTTPException(status_code=400, detail="Kategorie nicht verfuegbar")

    category = await fetchrow("SELECT id FROM forum_categories WHERE id = $1::uuid", category_uuid)
    if not category:
        raise HTTPException(status_code=400, detail="Kategorie nicht verfuegbar")

    tid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        """INSERT INTO forum_threads (id, category_id, titel, inhalt, autor_id)
           VALUES ($1::uuid, $2::uuid, $3, $4, $5::uuid)""",
        tid, category_uuid, body.titel, body.inhalt, uid,
    )
    return await get_thread(tid)


@router.put("/forum/threads/{thread_id}", response_model=ForumThreadResponse)
async def update_thread(thread_id: str, body: ForumThreadUpdate, user: dict = require_role(Role.MODERATOR)):
    thread_uuid = _parse_uuid(thread_id)
    if not thread_uuid:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")

    row = await fetchrow("SELECT * FROM forum_threads WHERE id = $1::uuid", thread_uuid)
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
        params.append(thread_uuid)
        await execute(
            f"UPDATE forum_threads SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
            *params,
        )
    return await get_thread(thread_id)


@router.delete("/forum/threads/{thread_id}")
async def delete_thread(thread_id: str, user: dict = require_role(Role.MODERATOR)):
    thread_uuid = _parse_uuid(thread_id)
    if not thread_uuid:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")

    await execute("DELETE FROM forum_threads WHERE id = $1::uuid", thread_uuid)
    return {"success": True, "message": "Thread gelöscht"}


@router.get("/forum/threads/{thread_id}/posts", response_model=list[ForumPostResponse])
async def list_posts(thread_id: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    thread_uuid = _parse_uuid(thread_id)
    if not thread_uuid:
        return [ForumPostResponse(**post) for post in SEED_POSTS.get(thread_id, [])]

    offset = (page - 1) * page_size
    rows = await fetch("""
        SELECT p.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM forum_posts p
        LEFT JOIN members m ON p.autor_id = m.id
        WHERE p.thread_id = $1::uuid
        ORDER BY p.created_at ASC
        LIMIT $2 OFFSET $3
    """, thread_uuid, page_size, offset)
    items = [
        ForumPostResponse(
            id=str(r["id"]), thread_id=str(r["thread_id"]), inhalt=r["inhalt"],
            autor_id=str(r["autor_id"]), autor_name=r.get("autor_name", "Unbekannt"),
            created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
        )
        for r in rows
    ]
    if items:
        return items
    return [ForumPostResponse(**post) for post in SEED_POSTS.get(thread_id, [])]


@router.post("/forum/posts", response_model=ForumPostResponse, status_code=201)
async def create_post(body: ForumPostCreate, user: dict = Depends(require_auth)):
    thread_uuid = _parse_uuid(body.thread_id)
    if not thread_uuid:
        raise HTTPException(status_code=403, detail="Antworten auf Startthemen sind derzeit deaktiviert")

    thread = await fetchrow("SELECT * FROM forum_threads WHERE id = $1::uuid", thread_uuid)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread nicht gefunden")
    if dict(thread).get("is_locked"):
        raise HTTPException(status_code=403, detail="Thread ist gesperrt")

    pid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        "INSERT INTO forum_posts (id, thread_id, inhalt, autor_id) VALUES ($1::uuid, $2::uuid, $3, $4::uuid)",
        pid, thread_uuid, body.inhalt, uid,
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

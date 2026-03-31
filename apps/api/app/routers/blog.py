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

SEED_ARTICLES = [
    {
        "id": "seed-demokratie-auftakt",
        "titel": "Demokratie beginnt im Alltag",
        "inhalt": (
            "Demokratie wird nicht nur bei Wahlen sichtbar. Sie zeigt sich in Gesprächen, "
            "in Vereinen, in Schulen und überall dort, wo Menschen Verantwortung füreinander übernehmen.\n\n"
            "Menschlichkeit Österreich verbindet politische Bildung, soziale Teilhabe und konkrete Unterstützung vor Ort. "
            "Mit unseren Veranstaltungen, Materialien und Community-Formaten schaffen wir niedrigschwellige Zugänge für Mitwirkung."
        ),
        "zusammenfassung": "Warum demokratische Kultur im Alltag beginnt und wie der Verein konkrete Räume für Teilhabe aufbaut.",
        "kategorie": "Demokratie",
        "tags": ["Demokratie", "Teilhabe", "Zivilgesellschaft"],
        "autor_id": "seed-redaktion",
        "autor_name": "Redaktion Menschlichkeit Österreich",
        "veroeffentlicht": True,
        "seo_title": "Demokratie beginnt im Alltag",
        "seo_description": "Ein Überblick über demokratische Teilhabe, Vereinsarbeit und zivilgesellschaftliche Räume in Österreich.",
        "og_image": None,
        "created_at": "2026-03-20T09:00:00+00:00",
        "updated_at": "2026-03-20T09:00:00+00:00",
    },
    {
        "id": "seed-mitmachen-fruehjahr",
        "titel": "Mitmachen, lernen, gemeinsam handeln",
        "inhalt": (
            "Unsere Arbeit lebt davon, dass Menschen sich mit ihren Perspektiven, Fragen und Fähigkeiten einbringen. "
            "Deshalb verknüpfen wir Bildungsangebote, Veranstaltungen und Community-Formate stärker miteinander.\n\n"
            "Wer Mitglied wird, findet im Portal künftig nicht nur Verwaltungsfunktionen, sondern auch klarere Wege zu Mitmachen, "
            "Datenschutz, Veranstaltungen und redaktionellen Inhalten."
        ),
        "zusammenfassung": "Wie wir Portal, Veranstaltungen und Community zu einer klaren Mitmach-Struktur verbinden.",
        "kategorie": "Vereinsleben",
        "tags": ["Mitgliedschaft", "Community", "Vereinsleben"],
        "autor_id": "seed-redaktion",
        "autor_name": "Redaktion Menschlichkeit Österreich",
        "veroeffentlicht": True,
        "seo_title": "Mitmachen, lernen, gemeinsam handeln",
        "seo_description": "So verzahnt Menschlichkeit Österreich Portal, Community und Veranstaltungen für neue Beteiligung.",
        "og_image": None,
        "created_at": "2026-03-25T10:30:00+00:00",
        "updated_at": "2026-03-25T10:30:00+00:00",
    },
    {
        "id": "seed-soziale-gerechtigkeit",
        "titel": "Soziale Gerechtigkeit braucht verlässliche Strukturen",
        "inhalt": (
            "Soziale Gerechtigkeit entsteht nicht allein durch Appelle. Sie braucht zugängliche Beratung, verlässliche Organisation "
            "und eine Kultur, in der Menschen ernst genommen werden.\n\n"
            "Deshalb arbeiten wir an einer Infrastruktur, die Spenden, Mitgliedschaften, Kommunikation und Datenschutz nachvollziehbar verbindet."
        ),
        "zusammenfassung": "Ein Blick darauf, warum funktionierende Infrastruktur Teil sozialer Verantwortung ist.",
        "kategorie": "Soziale Gerechtigkeit",
        "tags": ["Soziale Gerechtigkeit", "Transparenz", "Organisation"],
        "autor_id": "seed-redaktion",
        "autor_name": "Redaktion Menschlichkeit Österreich",
        "veroeffentlicht": True,
        "seo_title": "Soziale Gerechtigkeit braucht verlässliche Strukturen",
        "seo_description": "Warum transparente Vereinsprozesse und zugängliche Infrastruktur zu sozialer Gerechtigkeit beitragen.",
        "og_image": None,
        "created_at": "2026-03-29T14:00:00+00:00",
        "updated_at": "2026-03-29T14:00:00+00:00",
    },
]


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


def _seed_to_response(item: dict) -> BlogArticleResponse:
    return BlogArticleResponse(**item)


@router.get("/blog/articles", response_model=BlogListResponse)
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    kategorie: str = Query("", max_length=100),
    nur_veroeffentlicht: bool = Query(True),
):
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

    if not rows:
        seeded = [
            item for item in SEED_ARTICLES
            if (not nur_veroeffentlicht or item["veroeffentlicht"])
            and (not kategorie or item["kategorie"] == kategorie)
        ]
        offset = (page - 1) * page_size
        page_items = seeded[offset:offset + page_size]
        return BlogListResponse(
            data=[_seed_to_response(item) for item in page_items],
            total=len(seeded),
        )

    return BlogListResponse(data=[_row_to_response(dict(r)) for r in rows], total=int(total))


@router.get("/blog/articles/{article_id}", response_model=BlogArticleResponse)
async def get_article(article_id: str):
    row = await fetchrow("""
        SELECT b.*, m.vorname || ' ' || m.nachname AS autor_name
        FROM blog_articles b
        LEFT JOIN members m ON b.autor_id = m.id
        WHERE b.id = $1::uuid
    """, article_id)
    if not row:
        seed = next((item for item in SEED_ARTICLES if item["id"] == article_id), None)
        if not seed:
            raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
        return _seed_to_response(seed)
    return _row_to_response(dict(row))


@router.post("/blog/articles", response_model=BlogArticleResponse, status_code=201)
async def create_article(body: BlogArticleCreate, user: dict = require_role(Role.MODERATOR)):
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

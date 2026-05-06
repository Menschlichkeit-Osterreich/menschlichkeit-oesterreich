"""
Dynamische sitemap.xml für Menschlichkeit Österreich.

Generiert eine vollständige XML-Sitemap bestehend aus:
- Statischen Seiten (fest kodiert, immer vorhanden)
- Dynamischen Blog-Artikeln (aus der Datenbank)
- Dynamischen Veranstaltungen (aus der Datenbank)

Endpoint: GET /sitemap.xml
Content-Type: application/xml
Cache: 1 Stunde (3600 Sekunden)
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import Response

from ..db import fetch

logger = logging.getLogger("menschlichkeit.sitemap")
router = APIRouter()

SITE_URL = "https://www.menschlichkeit-oesterreich.at"

STATIC_URLS = [
    {"loc": f"{SITE_URL}/", "changefreq": "weekly", "priority": "1.0"},
    {"loc": f"{SITE_URL}/ueber-uns", "changefreq": "monthly", "priority": "0.9"},
    {"loc": f"{SITE_URL}/team", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/transparenz", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/presse", "changefreq": "monthly", "priority": "0.6"},
    {"loc": f"{SITE_URL}/statuten", "changefreq": "yearly", "priority": "0.6"},
    {"loc": f"{SITE_URL}/beitragsordnung", "changefreq": "yearly", "priority": "0.5"},
    {"loc": f"{SITE_URL}/themen", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/themen/demokratie", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/themen/menschenrechte", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/themen/soziale-gerechtigkeit", "changefreq": "monthly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/mitglied-werden", "changefreq": "monthly", "priority": "0.9"},
    {"loc": f"{SITE_URL}/spenden", "changefreq": "monthly", "priority": "0.9"},
    {"loc": f"{SITE_URL}/veranstaltungen", "changefreq": "weekly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/bildung", "changefreq": "monthly", "priority": "0.7"},
    {"loc": f"{SITE_URL}/materialien", "changefreq": "monthly", "priority": "0.6"},
    {"loc": f"{SITE_URL}/blog", "changefreq": "weekly", "priority": "0.8"},
    {"loc": f"{SITE_URL}/forum", "changefreq": "daily", "priority": "0.7"},
    {"loc": f"{SITE_URL}/kontakt", "changefreq": "yearly", "priority": "0.7"},
    {"loc": f"{SITE_URL}/impressum", "changefreq": "yearly", "priority": "0.4"},
    {"loc": f"{SITE_URL}/datenschutz", "changefreq": "yearly", "priority": "0.4"},
]


def _escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _url_entry(loc: str, lastmod: str | None = None, changefreq: str = "monthly", priority: str = "0.5") -> str:
    parts = [f"  <url>\n    <loc>{_escape_xml(loc)}</loc>"]
    if lastmod:
        parts.append(f"    <lastmod>{lastmod}</lastmod>")
    parts.append(f"    <changefreq>{changefreq}</changefreq>")
    parts.append(f"    <priority>{priority}</priority>")
    parts.append("  </url>")
    return "\n".join(parts)


@router.get(
    "/sitemap.xml",
    response_class=Response,
    tags=["SEO"],
    summary="XML-Sitemap",
    description="Dynamische sitemap.xml mit allen indexierbaren Seiten, Blog-Artikeln und Veranstaltungen.",
)
async def sitemap_xml() -> Response:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    url_entries: list[str] = []

    # Static pages
    for entry in STATIC_URLS:
        url_entries.append(
            _url_entry(
                loc=entry["loc"],
                lastmod=today,
                changefreq=entry["changefreq"],
                priority=entry["priority"],
            )
        )

    # Dynamic: published blog articles
    try:
        articles = await fetch(
            """
            SELECT id, updated_at
            FROM blog_articles
            WHERE veroeffentlicht = TRUE
            ORDER BY updated_at DESC
            LIMIT 1000
            """
        )
        for article in articles:
            lastmod = article["updated_at"].strftime("%Y-%m-%d") if article.get("updated_at") else today
            url_entries.append(
                _url_entry(
                    loc=f"{SITE_URL}/blog/{article['id']}",
                    lastmod=lastmod,
                    changefreq="yearly",
                    priority="0.6",
                )
            )
    except Exception as e:
        logger.warning(f"sitemap: blog articles query failed: {e}")

    # Dynamic: upcoming / recent events
    try:
        events = await fetch(
            """
            SELECT id, updated_at
            FROM events
            ORDER BY date DESC
            LIMIT 500
            """
        )
        for event in events:
            lastmod = event["updated_at"].strftime("%Y-%m-%d") if event.get("updated_at") else today
            url_entries.append(
                _url_entry(
                    loc=f"{SITE_URL}/veranstaltungen/{event['id']}",
                    lastmod=lastmod,
                    changefreq="weekly",
                    priority="0.6",
                )
            )
    except Exception as e:
        logger.warning(f"sitemap: events query failed: {e}")

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
        '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n'
        '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n'
        + "\n\n".join(url_entries)
        + "\n\n</urlset>"
    )

    return Response(
        content=xml,
        media_type="application/xml",
        headers={
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    )

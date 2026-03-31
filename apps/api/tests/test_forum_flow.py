"""Tests fuer oeffentliche Forum-Flows mit Seed-Inhalten und echten Kategorien."""
from __future__ import annotations

from unittest.mock import AsyncMock, patch


_MOCK_BASE = "app.routers.forum"


class TestForumSeedContent:
    def test_seed_thread_can_be_loaded_without_uuid_cast(self, client):
        response = client.get("/api/forum/threads/seed-thread-willkommen")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "seed-thread-willkommen"
        assert data["is_locked"] is True

    def test_seed_posts_can_be_loaded_without_uuid_cast(self, client):
        response = client.get("/api/forum/threads/seed-thread-willkommen/posts")

        assert response.status_code == 200
        posts = response.json()
        assert len(posts) >= 1
        assert posts[0]["thread_id"] == "seed-thread-willkommen"

    def test_seed_category_filter_returns_seed_threads(self, client):
        response = client.get("/api/forum/threads?category_id=seed-kategorie-allgemein")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["data"][0]["category_id"] == "seed-kategorie-allgemein"


class TestForumWriteGuards:
    def test_create_thread_rejects_non_uuid_seed_category(self, client, member_headers):
        response = client.post(
            "/api/forum/threads",
            headers=member_headers,
            json={
                "category_id": "seed-kategorie-allgemein",
                "titel": "Neues Thema",
                "inhalt": "Testinhalt",
            },
        )

        assert response.status_code == 400
        body = response.json()
        message = (
            body.get("detail")
            or body.get("message")
            or body.get("error", {}).get("message")
            or ""
        )
        assert "Kategorie" in message

    def test_create_post_rejects_seed_thread_replies(self, client, member_headers):
        response = client.post(
            "/api/forum/posts",
            headers=member_headers,
            json={
                "thread_id": "seed-thread-willkommen",
                "inhalt": "Antwort auf Seed-Thread",
            },
        )

        assert response.status_code == 403

    def test_create_thread_accepts_existing_real_category(self, client, member_headers):
        category_row = {"id": "11111111-1111-1111-1111-111111111111"}
        thread_row = {
            "id": "22222222-2222-2222-2222-222222222222",
            "category_id": "11111111-1111-1111-1111-111111111111",
            "category_name": "Mitgliederforum",
            "titel": "Neue Diskussion",
            "inhalt": "Hallo Forum",
            "autor_id": "00000000-0000-0000-0000-000000000002",
            "autor_name": "Member Test",
            "is_pinned": False,
            "is_locked": False,
            "reply_count": 0,
            "created_at": "2026-03-31T12:00:00+00:00",
            "updated_at": "2026-03-31T12:00:00+00:00",
        }

        with (
            patch(f"{_MOCK_BASE}.fetchrow", side_effect=[category_row, thread_row]),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock(return_value=None)),
        ):
            response = client.post(
                "/api/forum/threads",
                headers=member_headers,
                json={
                    "category_id": "11111111-1111-1111-1111-111111111111",
                    "titel": "Neue Diskussion",
                    "inhalt": "Hallo Forum",
                },
            )

        assert response.status_code == 201
        data = response.json()
        assert data["category_id"] == "11111111-1111-1111-1111-111111111111"
        assert data["titel"] == "Neue Diskussion"

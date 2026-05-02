from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from app.rbac import decode_jwt


def test_data_deletion_request_revokes_active_token_and_sessions(
    client, member_headers
):
    token = member_headers["Authorization"].removeprefix("Bearer ").strip()
    mocked_row = {
        "id": "11111111-1111-1111-1111-111111111111",
        "member_id": "00000000-0000-0000-0000-000000000002",
        "status": "pending",
        "reason": "Bitte löschen",
        "scope": "full",
        "requested_at": "2026-04-10T12:00:00Z",
    }

    with (
        patch(
            "app.routers.privacy.privacy_service.create_data_deletion_request",
            new=AsyncMock(return_value=mocked_row),
        ),
        patch(
            "app.routers.privacy.member_service.revoke_all_sessions", new=AsyncMock()
        ) as mock_revoke_sessions,
        patch("app.routers.privacy.revoke_token", new=AsyncMock()) as mock_revoke_token,
        patch("app.routers.privacy.write_audit_event", new=AsyncMock()) as mock_audit,
    ):
        response = client.post(
            "/api/privacy/data-deletion",
            headers=member_headers,
            json={"reason": "Bitte löschen", "scope": "full"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["request"]["status"] == "pending"
    assert payload["data"]["sessionRevoked"] is True

    jwt_payload = decode_jwt(token)
    assert jwt_payload is not None
    mock_revoke_sessions.assert_awaited_once_with(
        member_id="00000000-0000-0000-0000-000000000002",
        exclude_session_id=None,
    )
    assert mock_revoke_token.await_count == 1
    called_token, expires_at = mock_revoke_token.await_args.args
    assert called_token == token
    assert isinstance(expires_at, datetime)
    assert (
        int(expires_at.replace(tzinfo=timezone.utc).timestamp()) == jwt_payload["exp"]
    )
    assert mock_audit.await_count == 1
    assert (
        mock_audit.await_args.kwargs["metadata"]["eventType"] == "data_deletion_request"
    )


def test_process_data_deletion_approval_revokes_all_sessions(client, auth_headers):
    request_id = "22222222-2222-2222-2222-222222222222"
    member_id = "00000000-0000-0000-0000-000000000099"

    async def _fetchrow(*_args, **_kwargs):
        return {"member_id": member_id}

    with (
        patch("app.routers.privacy.fetchrow", new=AsyncMock(side_effect=_fetchrow)),
        patch("app.db.execute", new=AsyncMock(return_value="UPDATE 1")) as mock_execute,
        patch(
            "app.routers.privacy.member_service.revoke_all_sessions", new=AsyncMock()
        ) as mock_revoke_sessions,
        patch("app.routers.privacy.write_audit_event", new=AsyncMock()) as mock_audit,
    ):
        response = client.post(
            f"/api/privacy/data-deletion/{request_id}/process",
            headers=auth_headers,
            json={"action": "approve", "comments": "Freigabe"},
        )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert mock_execute.await_count >= 2
    mock_revoke_sessions.assert_awaited_once_with(
        member_id=member_id, exclude_session_id=None
    )
    assert mock_audit.await_count == 1
    assert (
        mock_audit.await_args.kwargs["metadata"]["eventType"]
        == "data_deletion_processed"
    )


def test_process_data_deletion_rejects_invalid_action(client, auth_headers):
    response = client.post(
        "/api/privacy/data-deletion/33333333-3333-3333-3333-333333333333/process",
        headers=auth_headers,
        json={"action": "noop"},
    )

    assert response.status_code == 422


def test_process_data_deletion_returns_404_for_unknown_request(client, auth_headers):
    with patch("app.routers.privacy.fetchrow", new=AsyncMock(return_value=None)):
        response = client.post(
            "/api/privacy/data-deletion/44444444-4444-4444-4444-444444444444/process",
            headers=auth_headers,
            json={"action": "approve"},
        )

    assert response.status_code == 404

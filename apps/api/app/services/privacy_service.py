from __future__ import annotations

import json
from typing import Any

from ..db import execute, fetch, fetchrow
from .utils import hash_optional


class PrivacyService:
    async def record_consent(
        self,
        *,
        member_id: str | None,
        email: str | None,
        consent_type: str,
        version: str,
        source: str,
        status: str = "granted",
        legal_basis: str = "consent",
        ip_address: str | None = None,
        user_agent: str | None = None,
        evidence: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        row = await fetchrow(
            """
            INSERT INTO consent_records (
                member_id, email, consent_type, version, status, source, legal_basis,
                ip_hash, user_agent_hash, evidence
            )
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
            RETURNING id, member_id, email, consent_type, version, status, source, legal_basis,
                      created_at
            """,
            member_id,
            email,
            consent_type,
            version,
            status,
            source,
            legal_basis,
            hash_optional(ip_address),
            hash_optional(user_agent),
            json.dumps(evidence or {}),
        )
        return dict(row)

    async def list_consents(self, *, member_id: str | None, email: str | None) -> list[dict[str, Any]]:
        if member_id:
            rows = await fetch(
                """
                SELECT id, member_id, email, consent_type, version, status, source, legal_basis, created_at
                FROM consent_records
                WHERE member_id = $1::uuid
                ORDER BY created_at DESC
                """,
                member_id,
            )
        else:
            rows = await fetch(
                """
                SELECT id, member_id, email, consent_type, version, status, source, legal_basis, created_at
                FROM consent_records
                WHERE LOWER(email) = LOWER($1)
                ORDER BY created_at DESC
                """,
                email,
            )
        return [dict(row) for row in rows]

    async def revoke_consent(self, consent_id: str, *, member_id: str | None) -> None:
        await execute(
            """
            UPDATE consent_records
            SET status = 'revoked', revoked_at = NOW()
            WHERE id = $1::uuid AND ($2::uuid IS NULL OR member_id = $2::uuid)
            """,
            consent_id,
            member_id,
        )

    async def create_data_export_request(self, *, member_id: str, reason: str | None = None) -> dict[str, Any]:
        row = await fetchrow(
            """
            INSERT INTO data_export_requests (member_id, reason)
            VALUES ($1::uuid, $2)
            RETURNING id, member_id, status, reason, requested_at
            """,
            member_id,
            reason,
        )
        return dict(row)

    async def list_data_export_requests(self, *, member_id: str) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT id, member_id, status, reason, requested_at, completed_at, download_url, expires_at
            FROM data_export_requests
            WHERE member_id = $1::uuid
            ORDER BY requested_at DESC
            """,
            member_id,
        )
        return [dict(row) for row in rows]

    async def create_data_deletion_request(self, *, member_id: str, reason: str, scope: str = "full") -> dict[str, Any]:
        row = await fetchrow(
            """
            INSERT INTO data_deletion_requests (member_id, reason, scope)
            VALUES ($1::uuid, $2, $3)
            RETURNING id, member_id, status, reason, scope, requested_at
            """,
            member_id,
            reason,
            scope,
        )
        return dict(row)

    async def list_data_deletion_requests(self, *, member_id: str) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT id, member_id, status, reason, scope, requested_at, processed_at, processed_by, comments
            FROM data_deletion_requests
            WHERE member_id = $1::uuid
            ORDER BY requested_at DESC
            """,
            member_id,
        )
        return [dict(row) for row in rows]


privacy_service = PrivacyService()

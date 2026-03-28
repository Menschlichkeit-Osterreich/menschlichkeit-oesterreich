from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import struct
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status

from ..db import execute, fetch, fetchrow, transaction
from ..lib.pii_sanitizer import scrub
from ..rbac import ADMIN_EMAILS, create_jwt, decode_jwt, hash_password, verify_password
from .crm_service import crm_service
from .mail_service import mail_service
from .privacy_service import privacy_service
from .utils import hash_optional, normalize_email, utcnow

_PUBLIC_APP_URL = os.environ["PUBLIC_APP_URL"]  # Pflichtfeld — fehlt → App startet nicht

logger = logging.getLogger("menschlichkeit.members.service")

PASSWORD_RESET_TTL_HOURS = 1
REFRESH_EXPIRY_SECONDS = 60 * 60 * 24 * 30
TWO_FACTOR_PERIOD_SECONDS = 30
TWO_FACTOR_DIGITS = 6


def _hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _base32_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def _decode_base32(secret: str) -> bytes:
    normalized = secret.strip().replace(" ", "").upper()
    padding = "=" * ((8 - len(normalized) % 8) % 8)
    return base64.b32decode(normalized + padding, casefold=True)


def _totp_code(secret: str, counter: int) -> str:
    key = _decode_base32(secret)
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    binary = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    code = binary % (10**TWO_FACTOR_DIGITS)
    return f"{code:0{TWO_FACTOR_DIGITS}d}"


def _verify_totp(secret: str, token: str, window: int = 1) -> bool:
    normalized = "".join(ch for ch in token if ch.isdigit())
    if len(normalized) != TWO_FACTOR_DIGITS:
        return False
    counter = int(time.time() // TWO_FACTOR_PERIOD_SECONDS)
    for offset in range(-window, window + 1):
        if hmac.compare_digest(_totp_code(secret, counter + offset), normalized):
            return True
    return False


def _hash_backup_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _generate_backup_codes(count: int = 8) -> list[str]:
    codes: list[str] = []
    for _ in range(count):
        raw = secrets.token_hex(4).upper()
        codes.append(f"{raw[:4]}-{raw[4:]}")
    return codes


def _consume_backup_code(code: str, hashed_codes: list[str]) -> tuple[bool, list[str]]:
    candidate_hash = _hash_backup_code(code)
    for idx, value in enumerate(hashed_codes):
        if hmac.compare_digest(value, candidate_hash):
            remaining = hashed_codes[:idx] + hashed_codes[idx + 1 :]
            return True, remaining
    return False, hashed_codes


def _build_otpauth_uri(email: str, secret: str) -> str:
    issuer = "Menschlichkeit Österreich"
    label = f"{issuer}:{email}"
    return (
        "otpauth://totp/"
        f"{label}"
        f"?secret={secret}&issuer={issuer}&algorithm=SHA1&digits={TWO_FACTOR_DIGITS}&period={TWO_FACTOR_PERIOD_SECONDS}"
    )


def member_to_user(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "firstName": row.get("vorname") or "",
        "lastName": row.get("nachname") or "",
        "role": row.get("rolle") or "member",
        "isEmailVerified": bool(row.get("is_email_verified", False)),
        "twoFactorEnabled": bool(row.get("two_factor_enabled", False)),
        "lastLoginAt": row.get("last_login_at").isoformat() if row.get("last_login_at") else None,
        "createdAt": row.get("created_at").isoformat() if row.get("created_at") else None,
        "updatedAt": row.get("updated_at").isoformat() if row.get("updated_at") else None,
        "civicrmContactId": row.get("civicrm_contact_id"),
        "mitgliedschaftTyp": row.get("mitgliedschaft_typ"),
        "status": row.get("status"),
        "phone": row.get("phone"),
    }


def issue_tokens(user: dict[str, Any], session_id: str | None = None) -> dict[str, Any]:
    session_id = session_id or str(uuid4())
    access_token = create_jwt(
        {
            "sub": user["email"],
            "uid": user["id"],
            "role": user["role"],
            "type": "access",
            "sid": session_id,
            "civicrm_contact_id": user.get("civicrmContactId"),
        }
    )
    refresh_token = create_jwt(
        {
            "sub": user["email"],
            "uid": user["id"],
            "role": user["role"],
            "type": "refresh",
            "sid": session_id,
        },
        expires_in=REFRESH_EXPIRY_SECONDS,
    )
    return {
        "token": access_token,
        "refreshToken": refresh_token,
        "refresh_token": refresh_token,
        "expiresIn": 3600,
        "expires_in": 3600,
        "sessionId": session_id,
        "tokens": {
            "token": access_token,
            "refresh_token": refresh_token,
            "expires_in": 3600,
            "session_id": session_id,
        },
    }


class MemberService:
    async def get_member_by_email(self, email: str) -> dict[str, Any] | None:
        row = await fetchrow("SELECT * FROM members WHERE LOWER(email) = LOWER($1)", normalize_email(email))
        return dict(row) if row else None

    async def get_member_by_id(self, member_id: str) -> dict[str, Any] | None:
        row = await fetchrow("SELECT * FROM members WHERE id = $1::uuid", member_id)
        return dict(row) if row else None

    async def register_member(
        self,
        *,
        email: str,
        first_name: str,
        last_name: str,
        password: str | None,
        membership_type: str = "ordentlich",
        phone: str | None = None,
        accept_terms: bool = False,
        accept_privacy: bool = False,
        newsletter_opt_in: bool = False,
        source: str = "website_register",
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> dict[str, Any]:
        email = normalize_email(email)
        async with transaction() as conn:
            existing = await conn.fetchrow("SELECT * FROM members WHERE LOWER(email) = LOWER($1)", email)
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-Mail-Adresse bereits registriert")

            member_id = str(uuid4())
            role = "admin" if email in ADMIN_EMAILS else "member"
            verification_token = secrets.token_urlsafe(32)
            row = await conn.fetchrow(
                """
                INSERT INTO members (
                    id, email, password_hash, vorname, nachname, phone, rolle, mitgliedschaft_typ,
                    status, is_email_verified, email_verification_token, email_verification_sent_at,
                    newsletter_opt_in, accept_terms_at, accept_privacy_at
                )
                VALUES (
                    $1::uuid, $2, $3, $4, $5, $6, $7, $8,
                    'pending_verification', FALSE, $9, NOW(), $10,
                    $11, $12
                )
                RETURNING *
                """,
                member_id,
                email,
                hash_password(password or secrets.token_urlsafe(24)),
                first_name,
                last_name,
                phone,
                role,
                membership_type,
                verification_token,
                newsletter_opt_in,
                utcnow() if accept_terms else None,
                utcnow() if accept_privacy else None,
            )
            member = dict(row)

        if accept_terms:
            await privacy_service.record_consent(
                member_id=member["id"],
                email=email,
                consent_type="terms",
                version="2026-03",
                source=source,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        if accept_privacy:
            await privacy_service.record_consent(
                member_id=member["id"],
                email=email,
                consent_type="privacy",
                version="2026-03",
                source=source,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        if newsletter_opt_in:
            await privacy_service.record_consent(
                member_id=member["id"],
                email=email,
                consent_type="marketing",
                version="2026-03",
                source=source,
                ip_address=ip_address,
                user_agent=user_agent,
            )

        crm_contact = await crm_service.upsert_contact(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            source=source,
        )
        if crm_contact and crm_contact.get("id"):
            await execute(
                "UPDATE members SET civicrm_contact_id = $1, updated_at = NOW() WHERE id = $2::uuid",
                int(crm_contact["id"]),
                member["id"],
            )
            member["civicrm_contact_id"] = int(crm_contact["id"])

        verify_url = f"{_PUBLIC_APP_URL}/verify-email?token={verification_token}"
        await mail_service.send_template(
            template_id="verify_email",
            recipient_email=email,
            context={
                "first_name": first_name,
                "last_name": last_name,
                "verification_url": verify_url,
                "organization_name": "Verein Menschlichkeit Österreich",
            },
            entity_type="member",
        )

        user = member_to_user(member)
        tokens = issue_tokens(user)
        return {"user": user, "contact": {"id": member.get("civicrm_contact_id")}, **tokens}

    async def create_session(
        self,
        *,
        member_id: str,
        session_id: str,
        refresh_token: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        await execute(
            """
            INSERT INTO member_sessions (
                id, member_id, refresh_token_hash, device_info, ip_hash, user_agent_hash, last_activity_at
            )
            VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, NOW())
            ON CONFLICT (id)
            DO UPDATE SET
                refresh_token_hash = EXCLUDED.refresh_token_hash,
                device_info = EXCLUDED.device_info,
                ip_hash = EXCLUDED.ip_hash,
                user_agent_hash = EXCLUDED.user_agent_hash,
                last_activity_at = NOW(),
                revoked_at = NULL
            """,
            session_id,
            member_id,
            _hash_refresh_token(refresh_token),
            (user_agent or "")[:255] or None,
            hash_optional(ip_address),
            hash_optional(user_agent),
        )

    async def list_sessions(self, *, member_id: str, current_session_id: str | None = None) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT id, device_info, created_at, last_activity_at, revoked_at
            FROM member_sessions
            WHERE member_id = $1::uuid
            ORDER BY created_at DESC
            """,
            member_id,
        )
        return [
            {
                "id": str(data["id"]),
                "deviceInfo": data.get("device_info") or "Unbekanntes Gerät",
                "location": "Nicht verfügbar",
                "lastActivity": data["last_activity_at"].isoformat() if data.get("last_activity_at") else None,
                "createdAt": data["created_at"].isoformat() if data.get("created_at") else None,
                "isCurrent": str(data["id"]) == current_session_id,
                "revokedAt": data["revoked_at"].isoformat() if data.get("revoked_at") else None,
            }
            for data in (dict(row) for row in rows)
        ]

    async def revoke_session(self, *, member_id: str, session_id: str) -> None:
        await execute(
            """
            UPDATE member_sessions
            SET revoked_at = NOW(), last_activity_at = NOW()
            WHERE id = $1::uuid AND member_id = $2::uuid
            """,
            session_id,
            member_id,
        )

    async def revoke_all_sessions(self, *, member_id: str, exclude_session_id: str | None = None) -> None:
        if exclude_session_id:
            await execute(
                """
                UPDATE member_sessions
                SET revoked_at = NOW(), last_activity_at = NOW()
                WHERE member_id = $1::uuid AND id <> $2::uuid AND revoked_at IS NULL
                """,
                member_id,
                exclude_session_id,
            )
            return
        await execute(
            """
            UPDATE member_sessions
            SET revoked_at = NOW(), last_activity_at = NOW()
            WHERE member_id = $1::uuid AND revoked_at IS NULL
            """,
            member_id,
        )

    async def authenticate(self, *, email: str, password: str, two_factor_code: str | None = None) -> dict[str, Any]:
        email = normalize_email(email)
        row = await fetchrow("SELECT * FROM members WHERE LOWER(email) = LOWER($1)", email)
        if not row:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige Anmeldedaten")
        member = dict(row)
        if not verify_password(password, member["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige Anmeldedaten")
        if member.get("status") in {"deleted", "suspended"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Konto ist nicht aktiv")
        if member.get("two_factor_enabled"):
            if not two_factor_code:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="2FA-Code erforderlich")
            verified = await self._verify_two_factor_token(member, two_factor_code)
            if not verified:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültiger 2FA-Code")

        await execute(
            "UPDATE members SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1::uuid",
            member["id"],
        )
        member["last_login_at"] = utcnow()
        user = member_to_user(member)
        return {"user": user, **issue_tokens(user)}

    async def refresh_session(self, refresh_token: str) -> dict[str, Any]:
        payload = decode_jwt(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültiger Refresh-Token")

        session_id = payload.get("sid")
        if not session_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sitzung ist ungültig")

        session_row = await fetchrow(
            """
            SELECT id, member_id, revoked_at, refresh_token_hash
            FROM member_sessions
            WHERE id = $1::uuid
            """,
            session_id,
        )
        session = dict(session_row) if session_row else None
        if not session or session.get("revoked_at"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sitzung ist nicht mehr aktiv")
        if session.get("refresh_token_hash") != _hash_refresh_token(refresh_token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh-Token wurde bereits ersetzt")

        member = await self.get_member_by_id(payload["uid"])
        if not member:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Benutzer nicht gefunden")
        user = member_to_user(member)
        refreshed = {"user": user, **issue_tokens(user, session_id=session_id)}
        await execute(
            """
            UPDATE member_sessions
            SET refresh_token_hash = $1, last_activity_at = NOW()
            WHERE id = $2::uuid
            """,
            _hash_refresh_token(refreshed["refreshToken"]),
            session_id,
        )
        return refreshed

    async def send_password_reset(self, email: str) -> str:
        email = normalize_email(email)
        member = await self.get_member_by_email(email)
        safe_message = "Falls ein Konto mit dieser E-Mail existiert, wurde ein Wiederherstellungs-Link gesendet."
        if not member:
            logger.info("password_reset_unknown_email | email=%s", scrub(email))
            return safe_message

        token = secrets.token_urlsafe(48)
        expires_at = utcnow() + timedelta(hours=PASSWORD_RESET_TTL_HOURS)
        await execute(
            "UPDATE password_reset_tokens SET used = TRUE WHERE LOWER(email) = LOWER($1) AND used = FALSE",
            email,
        )
        await execute(
            """
            INSERT INTO password_reset_tokens (email, token, expires_at, used, created_at)
            VALUES ($1, $2, $3, FALSE, NOW())
            """,
            email,
            token,
            expires_at,
        )
        reset_url = f"{_PUBLIC_APP_URL}/passwort-zuruecksetzen?token={token}"
        await mail_service.send_template(
            template_id="password_reset",
            recipient_email=email,
            context={
                "first_name": member.get("vorname") or "",
                "last_name": member.get("nachname") or "",
                "reset_url": reset_url,
                "expires_hours": PASSWORD_RESET_TTL_HOURS,
            },
            entity_type="member",
        )
        return safe_message

    async def confirm_password_reset(self, *, token: str, new_password: str) -> str:
        row = await fetchrow(
            "SELECT id, email, expires_at, used FROM password_reset_tokens WHERE token = $1",
            token,
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger oder abgelaufener Token")
        data = dict(row)
        expires_at = data["expires_at"]
        if data.get("used") or datetime.now(timezone.utc) > expires_at:
            await execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1", token)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger oder abgelaufener Token")

        await execute(
            "UPDATE members SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2)",
            hash_password(new_password),
            data["email"],
        )
        await execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1", token)
        return "Passwort wurde erfolgreich zurückgesetzt."

    async def verify_email(self, token: str) -> dict[str, Any]:
        row = await fetchrow(
            """
            UPDATE members
            SET is_email_verified = TRUE,
                email_verification_token = NULL,
                status = CASE WHEN status = 'pending_verification' THEN 'active' ELSE status END,
                updated_at = NOW()
            WHERE email_verification_token = $1
            RETURNING *
            """,
            token,
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger Bestätigungslink")
        member = dict(row)
        user = member_to_user(member)
        return {"user": user, **issue_tokens(user)}

    async def resend_verification(self, member_id: str) -> None:
        token = secrets.token_urlsafe(32)
        row = await fetchrow(
            """
            UPDATE members
            SET email_verification_token = $1, email_verification_sent_at = NOW(), updated_at = NOW()
            WHERE id = $2::uuid
            RETURNING *
            """,
            token,
            member_id,
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")
        member = dict(row)
        verify_url = f"{_PUBLIC_APP_URL}/verify-email?token={token}"
        await mail_service.send_template(
            template_id="verify_email",
            recipient_email=member["email"],
            context={
                "first_name": member.get("vorname") or "",
                "last_name": member.get("nachname") or "",
                "verification_url": verify_url,
                "organization_name": "Verein Menschlichkeit Österreich",
            },
            entity_type="member",
        )

    async def update_profile(self, member_id: str, data: dict[str, Any]) -> dict[str, Any]:
        updates: dict[str, Any] = {}
        for db_field, payload_fields in {
            "vorname": ("vorname", "first_name", "firstName"),
            "nachname": ("nachname", "last_name", "lastName"),
            "phone": ("phone",),
        }.items():
            for field in payload_fields:
                if data.get(field) is not None:
                    updates[db_field] = data[field]
                    break
        if updates:
            set_clauses = []
            params: list[Any] = []
            for idx, (field, value) in enumerate(updates.items(), start=1):
                set_clauses.append(f"{field} = ${idx}")
                params.append(value)
            params.append(member_id)
            await execute(
                f"UPDATE members SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
                *params,
            )
        member = await self.get_member_by_id(member_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nicht gefunden")
        return member_to_user(member)

    async def request_account_deletion(self, member_id: str, reason: str) -> dict[str, Any]:
        return await privacy_service.create_data_deletion_request(member_id=member_id, reason=reason)

    async def request_data_export(self, member_id: str, reason: str | None) -> dict[str, Any]:
        return await privacy_service.create_data_export_request(member_id=member_id, reason=reason)

    async def list_member_invoices(self, member: dict[str, Any]) -> list[dict[str, Any]]:
        civicrm_contact_id = member.get("civicrm_contact_id")
        if not civicrm_contact_id:
            return []
        rows = await fetch(
            """
            SELECT id, invoice_number, total_amount, currency, issue_date::text, due_date::text,
                   status, invoice_type, pdf_path
            FROM invoices
            WHERE civicrm_contact_id = $1
            ORDER BY issue_date DESC
            """,
            civicrm_contact_id,
        )
        return [dict(row) for row in rows]

    async def list_member_donations(self, member: dict[str, Any]) -> list[dict[str, Any]]:
        email = member.get("email")
        civicrm_contact_id = member.get("civicrm_contact_id")
        if civicrm_contact_id:
            rows = await fetch(
                """
                SELECT id, amount, currency, donation_type, status, donation_date::text, receipt_eligible
                FROM donations
                WHERE civicrm_contact_id = $1
                ORDER BY donation_date DESC
                """,
                civicrm_contact_id,
            )
        else:
            rows = await fetch(
                """
                SELECT id, amount, currency, donation_type, status, donation_date::text, receipt_eligible
                FROM donations
                WHERE LOWER(donor_email) = LOWER($1)
                ORDER BY donation_date DESC
                """,
                email,
            )
        return [dict(row) for row in rows]

    async def setup_two_factor(self, *, member_id: str, email: str) -> dict[str, Any]:
        secret = _base32_secret()
        await execute(
            """
            UPDATE members
            SET two_factor_pending_secret = $1, updated_at = NOW()
            WHERE id = $2::uuid
            """,
            secret,
            member_id,
        )
        return {
            "secret": secret,
            "qrCode": _build_otpauth_uri(email, secret),
            "backupCodes": [],
        }

    async def enable_two_factor(self, *, member_id: str, token: str) -> list[str]:
        row = await fetchrow(
            "SELECT two_factor_pending_secret FROM members WHERE id = $1::uuid",
            member_id,
        )
        pending_secret = row["two_factor_pending_secret"] if row else None
        if not pending_secret:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA-Setup wurde noch nicht gestartet")
        if not _verify_totp(pending_secret, token):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültiger Bestätigungscode")
        backup_codes = _generate_backup_codes()
        await execute(
            """
            UPDATE members
            SET
                two_factor_secret = $1,
                two_factor_pending_secret = NULL,
                two_factor_enabled = TRUE,
                two_factor_backup_codes = $2::jsonb,
                two_factor_confirmed_at = NOW(),
                updated_at = NOW()
            WHERE id = $3::uuid
            """,
            pending_secret,
            json.dumps([_hash_backup_code(code) for code in backup_codes]),
            member_id,
        )
        return backup_codes

    async def disable_two_factor(self, *, member_id: str) -> None:
        await execute(
            """
            UPDATE members
            SET
                two_factor_enabled = FALSE,
                two_factor_secret = NULL,
                two_factor_pending_secret = NULL,
                two_factor_backup_codes = '[]'::jsonb,
                two_factor_confirmed_at = NULL,
                updated_at = NOW()
            WHERE id = $1::uuid
            """,
            member_id,
        )

    async def verify_two_factor(self, *, member_id: str, token: str) -> bool:
        member = await self.get_member_by_id(member_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")
        return await self._verify_two_factor_token(member, token)

    async def _verify_two_factor_token(self, member: dict[str, Any], token: str) -> bool:
        secret = member.get("two_factor_secret")
        if secret and _verify_totp(secret, token):
            return True

        stored_codes = member.get("two_factor_backup_codes") or []
        if isinstance(stored_codes, str):
            try:
                stored_codes = json.loads(stored_codes)
            except json.JSONDecodeError:
                stored_codes = []
        normalized = token.strip().upper()
        matched, remaining = _consume_backup_code(normalized, list(stored_codes))
        if matched:
            await execute(
                """
                UPDATE members
                SET two_factor_backup_codes = $1::jsonb, updated_at = NOW()
                WHERE id = $2::uuid
                """,
                json.dumps(remaining),
                member["id"],
            )
            return True
        return False


member_service = MemberService()

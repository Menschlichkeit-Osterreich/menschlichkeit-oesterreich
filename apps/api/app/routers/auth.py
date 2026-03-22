from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..db import execute, fetch
from ..lib.token_blacklist import revoke_token
from ..rbac import decode_jwt, hash_password, require_auth, verify_password
from ..schemas.auth import (
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshRequest,
    RegisterRequest,
    VerifyEmailRequest,
)
from ..services.member_service import member_service, member_to_user

logger = logging.getLogger("menschlichkeit.auth")
router = APIRouter()


def _request_meta(request: Request) -> dict[str, str | None]:
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("User-Agent"),
    }


def _ensure_names(body: RegisterRequest) -> tuple[str, str]:
    first_name = body.first_name or body.firstName or body.vorname or ""
    last_name = body.last_name or body.lastName or body.nachname or ""
    if not first_name or not last_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Vorname und Nachname sind erforderlich",
        )
    return first_name, last_name


@router.post("/auth/login")
async def login(body: LoginRequest, request: Request):
    payload = await member_service.authenticate(
        email=body.email,
        password=body.password,
        two_factor_code=body.twoFactorCode or body.two_factor_code,
    )
    await member_service.create_session(
        member_id=payload["user"]["id"],
        session_id=payload["sessionId"],
        refresh_token=payload["refreshToken"],
        **_request_meta(request),
    )
    return {"success": True, "data": payload}


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, request: Request):
    first_name, last_name = _ensure_names(body)
    payload = await member_service.register_member(
        email=body.email,
        first_name=first_name,
        last_name=last_name,
        password=body.password,
        membership_type=body.mitgliedschaftTyp or body.mitgliedschaft_typ,
        accept_terms=body.accept_terms or body.acceptTerms,
        accept_privacy=body.accept_privacy or body.acceptPrivacy,
        newsletter_opt_in=body.newsletter_opt_in or body.newsletterOptIn,
        source="website_register",
        **_request_meta(request),
    )
    await member_service.create_session(
        member_id=payload["user"]["id"],
        session_id=payload["sessionId"],
        refresh_token=payload["refreshToken"],
        **_request_meta(request),
    )
    return {"success": True, "data": payload}


@router.post("/auth/refresh")
async def refresh_token(body: RefreshRequest, request: Request):
    refresh_token_value = body.refreshToken or body.refresh_token
    if not refresh_token_value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh-Token fehlt")
    payload = await member_service.refresh_session(refresh_token_value)
    await member_service.create_session(
        member_id=payload["user"]["id"],
        session_id=payload["sessionId"],
        refresh_token=payload["refreshToken"],
        **_request_meta(request),
    )
    return {"success": True, "data": payload}


@router.post("/auth/logout", response_model=MessageResponse)
async def logout(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()
        payload = decode_jwt(token) or {}
        exp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc)
        revoke_token(token, expires_at)
        if payload.get("uid") and payload.get("sid"):
            await member_service.revoke_session(member_id=payload["uid"], session_id=payload["sid"])
    return MessageResponse(message="Erfolgreich abgemeldet.")


@router.get("/auth/me")
async def me(user: dict = Depends(require_auth)):
    member = await member_service.get_member_by_id(user["uid"])
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")
    return {"success": True, "data": {"user": member_to_user(member)}}


@router.post("/auth/password-reset-request", response_model=MessageResponse)
async def password_reset_request(body: PasswordResetRequest):
    message = await member_service.send_password_reset(body.email)
    return MessageResponse(message=message)


@router.post("/auth/password-reset/confirm", response_model=MessageResponse)
async def password_reset_confirm(body: PasswordResetConfirm):
    new_password = body.new_password or body.password
    if not new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Neues Passwort fehlt")
    if body.confirmPassword and body.confirmPassword != new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Passwörter stimmen nicht überein")
    message = await member_service.confirm_password_reset(token=body.token, new_password=new_password)
    return MessageResponse(message=message)


@router.post("/auth/password-reset")
async def password_reset_compat(payload: dict):
    if payload.get("email"):
        message = await member_service.send_password_reset(payload["email"])
        return {"success": True, "message": message}
    token = payload.get("token")
    new_password = payload.get("new_password") or payload.get("password")
    confirm_password = payload.get("confirmPassword")
    if not token or not new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ungültige Passwort-Reset-Anfrage")
    if confirm_password and confirm_password != new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Passwörter stimmen nicht überein")
    message = await member_service.confirm_password_reset(token=token, new_password=new_password)
    return {"success": True, "message": message}


@router.post("/auth/verify-email")
async def verify_email(body: VerifyEmailRequest, request: Request):
    payload = await member_service.verify_email(body.token)
    await member_service.create_session(
        member_id=payload["user"]["id"],
        session_id=payload["sessionId"],
        refresh_token=payload["refreshToken"],
        **_request_meta(request),
    )
    return {"success": True, "data": payload}


@router.post("/auth/resend-verification", response_model=MessageResponse)
async def resend_verification(user: dict = Depends(require_auth)):
    await member_service.resend_verification(user["uid"])
    return MessageResponse(message="Bestätigungs-E-Mail wurde erneut versendet.")


@router.post("/auth/change-password", response_model=MessageResponse)
async def change_password(payload: dict, user: dict = Depends(require_auth)):
    current_password = payload.get("currentPassword")
    new_password = payload.get("newPassword")
    confirm_password = payload.get("confirmPassword")
    if not current_password or not new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Passwortdaten unvollständig")
    if confirm_password and confirm_password != new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Passwörter stimmen nicht überein")
    member = await member_service.get_member_by_id(user["uid"])
    if not member or not verify_password(current_password, member["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Aktuelles Passwort ist ungültig")
    await execute(
        "UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2::uuid",
        hash_password(new_password),
        user["uid"],
    )
    return MessageResponse(message="Passwort wurde erfolgreich geändert.")


@router.post("/auth/2fa/setup")
async def setup_two_factor(user: dict = Depends(require_auth)):
    member = await member_service.get_member_by_id(user["uid"])
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")
    data = await member_service.setup_two_factor(member_id=user["uid"], email=member["email"])
    return {"success": True, "data": data}


@router.post("/auth/2fa/enable")
async def enable_two_factor(payload: dict, user: dict = Depends(require_auth)):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="2FA-Code fehlt")
    backup_codes = await member_service.enable_two_factor(member_id=user["uid"], token=token)
    return {
        "success": True,
        "data": {
            "backupCodes": backup_codes,
        },
        "message": "Zwei-Faktor-Authentifizierung wurde aktiviert.",
    }


@router.post("/auth/2fa/disable", response_model=MessageResponse)
async def disable_two_factor(payload: dict, user: dict = Depends(require_auth)):
    password = payload.get("password")
    member = await member_service.get_member_by_id(user["uid"])
    if not member or not password or not verify_password(password, member["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Passwort ist ungültig")
    await member_service.disable_two_factor(member_id=user["uid"])
    return MessageResponse(message="Zwei-Faktor-Authentifizierung wurde deaktiviert.")


@router.post("/auth/2fa/verify")
async def verify_two_factor(payload: dict, user: dict = Depends(require_auth)):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="2FA-Code fehlt")
    verified = await member_service.verify_two_factor(member_id=user["uid"], token=token)
    if not verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültiger 2FA-Code")
    return {"success": True, "message": "2FA-Code ist gültig."}


@router.get("/auth/sessions")
async def get_sessions(user: dict = Depends(require_auth)):
    sessions = await member_service.list_sessions(member_id=user["uid"], current_session_id=user.get("sid"))
    return {"success": True, "data": sessions}


@router.delete("/auth/sessions/{session_id}", response_model=MessageResponse)
async def revoke_session(session_id: str, user: dict = Depends(require_auth)):
    await member_service.revoke_session(member_id=user["uid"], session_id=session_id)
    return MessageResponse(message="Sitzung wurde widerrufen.")


@router.post("/auth/sessions/revoke-all", response_model=MessageResponse)
async def revoke_all_sessions(user: dict = Depends(require_auth)):
    await member_service.revoke_all_sessions(member_id=user["uid"], exclude_session_id=user.get("sid"))
    return MessageResponse(message="Alle weiteren Sitzungen wurden widerrufen.")


@router.put("/auth/profile")
async def update_profile(payload: dict, user: dict = Depends(require_auth)):
    updated = await member_service.update_profile(user["uid"], payload)
    return {"success": True, "data": {"user": updated}}


@router.post("/auth/delete-account", response_model=MessageResponse)
async def delete_account(payload: dict, user: dict = Depends(require_auth)):
    password = payload.get("password")
    member = await member_service.get_member_by_id(user["uid"])
    if not member or not password or not verify_password(password, member["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Passwort ist ungültig")
    await execute(
        "UPDATE members SET status = 'deleted', updated_at = NOW() WHERE id = $1::uuid",
        user["uid"],
    )
    await member_service.revoke_all_sessions(member_id=user["uid"])
    return MessageResponse(message="Konto wurde zur Löschung vorgemerkt.")


@router.get("/auth/security-logs")
async def security_logs(user: dict = Depends(require_auth)):
    rows = await fetch(
        """
        SELECT id::text, method AS action, path AS description, created_at
        FROM audit_trail
        WHERE actor_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        """,
        user.get("uid"),
    )
    return {
        "success": True,
        "data": [
            {
                "id": row["id"],
                "action": row["action"],
                "description": row["description"],
                "ipAddress": "",
                "userAgent": "",
                "createdAt": row["created_at"].isoformat(),
            }
            for row in rows
        ],
    }

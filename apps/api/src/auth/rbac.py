"""
RBAC – Role-Based Access Control
Menschlichkeit Österreich Vereinsplattform

Rollen:   ADMIN > BOARD > MEMBER
Subrollen: MODERATOR, TREASURER, EVENT_MANAGER, CONTENT_EDITOR
Scopes:   Feingranulare Berechtigungen pro Modul
"""

from __future__ import annotations
from enum import Enum
from typing import Optional
from functools import wraps
import logging

logger = logging.getLogger(__name__)


# ── Rollen ─────────────────────────────────────────────────────────────────────

class Role(str, Enum):
    ADMIN          = "admin"
    BOARD          = "board"           # Vorstand
    MEMBER         = "member"
    # Subrollen
    MODERATOR      = "moderator"
    TREASURER      = "treasurer"
    EVENT_MANAGER  = "event_manager"
    CONTENT_EDITOR = "content_editor"
    # Systemrollen
    SERVICE        = "service"         # Interne API-Calls
    ANONYMOUS      = "anonymous"


# ── Scopes (feingranulare Berechtigungen) ──────────────────────────────────────

class Scope(str, Enum):
    # Mitglieder
    MEMBERS_READ         = "members:read"
    MEMBERS_WRITE        = "members:write"
    MEMBERS_DELETE       = "members:delete"
    MEMBERS_EXPORT       = "members:export"
    MEMBERS_SEGMENT      = "members:segment"
    MEMBERS_INVITE       = "members:invite"
    MEMBERS_IMPORT       = "members:import"
    MEMBERS_ROLES        = "members:roles"

    # Eigenes Profil
    PROFILE_READ         = "profile:read"
    PROFILE_WRITE        = "profile:write"

    # Events
    EVENTS_READ          = "events:read"
    EVENTS_WRITE         = "events:write"
    EVENTS_DELETE        = "events:delete"
    EVENTS_PUBLISH       = "events:publish"
    EVENTS_CHECKIN       = "events:checkin"
    EVENTS_RSVP          = "events:rsvp"

    # News / Content
    NEWS_READ            = "news:read"
    NEWS_WRITE           = "news:write"
    NEWS_DELETE          = "news:delete"
    NEWS_PUBLISH         = "news:publish"
    NEWS_REVIEW          = "news:review"

    # Dokumente
    DOCS_PUBLIC_READ     = "docs:public:read"
    DOCS_MEMBER_READ     = "docs:member:read"
    DOCS_BOARD_READ      = "docs:board:read"
    DOCS_WRITE           = "docs:write"
    DOCS_DELETE          = "docs:delete"
    DOCS_APPROVE         = "docs:approve"

    # Finanzen / Zahlungen
    PAYMENTS_READ        = "payments:read"
    PAYMENTS_WRITE       = "payments:write"
    PAYMENTS_REFUND      = "payments:refund"
    PAYMENTS_EXPORT      = "payments:export"
    PAYMENTS_OWN         = "payments:own"        # Nur eigene Zahlungen

    # Forum / Kommunikation
    FORUM_READ           = "forum:read"
    FORUM_POST           = "forum:post"
    FORUM_MODERATE       = "forum:moderate"
    FORUM_DELETE         = "forum:delete"
    FORUM_CLOSE          = "forum:close"

    # DSGVO
    GDPR_EXPORT_OWN      = "gdpr:export:own"
    GDPR_DELETE_OWN      = "gdpr:delete:own"
    GDPR_ADMIN           = "gdpr:admin"

    # Analytics / KPI
    ANALYTICS_BOARD      = "analytics:board"
    ANALYTICS_ADMIN      = "analytics:admin"
    ANALYTICS_FINANCE    = "analytics:finance"

    # Konfiguration
    CONFIG_READ          = "config:read"
    CONFIG_WRITE         = "config:write"

    # Social Media
    SOCIAL_POST          = "social:post"
    SOCIAL_SCHEDULE      = "social:schedule"

    # Gamification
    GAMIFICATION_READ    = "gamification:read"
    GAMIFICATION_ADMIN   = "gamification:admin"

    # Audit
    AUDIT_READ           = "audit:read"

    # CRM-Sync
    CRM_SYNC             = "crm:sync"


# ── Rollen-Scope-Matrix ────────────────────────────────────────────────────────

ROLE_SCOPES: dict[Role, set[Scope]] = {

    Role.ADMIN: set(Scope),  # Vollzugriff

    Role.BOARD: {
        Scope.MEMBERS_READ, Scope.MEMBERS_SEGMENT, Scope.MEMBERS_EXPORT,
        Scope.PROFILE_READ, Scope.PROFILE_WRITE,
        Scope.EVENTS_READ, Scope.EVENTS_WRITE, Scope.EVENTS_PUBLISH,
        Scope.NEWS_READ, Scope.NEWS_WRITE, Scope.NEWS_PUBLISH, Scope.NEWS_REVIEW,
        Scope.DOCS_PUBLIC_READ, Scope.DOCS_MEMBER_READ, Scope.DOCS_BOARD_READ,
        Scope.DOCS_WRITE, Scope.DOCS_APPROVE,
        Scope.PAYMENTS_READ, Scope.PAYMENTS_EXPORT,
        Scope.FORUM_READ, Scope.FORUM_POST, Scope.FORUM_MODERATE,
        Scope.GDPR_EXPORT_OWN, Scope.GDPR_DELETE_OWN,
        Scope.ANALYTICS_BOARD, Scope.ANALYTICS_FINANCE,
        Scope.CONFIG_READ,
        Scope.SOCIAL_POST, Scope.SOCIAL_SCHEDULE,
        Scope.GAMIFICATION_READ,
        Scope.AUDIT_READ,
    },

    Role.MEMBER: {
        Scope.PROFILE_READ, Scope.PROFILE_WRITE,
        Scope.EVENTS_READ, Scope.EVENTS_RSVP,
        Scope.NEWS_READ,
        Scope.DOCS_PUBLIC_READ, Scope.DOCS_MEMBER_READ,
        Scope.PAYMENTS_OWN,
        Scope.FORUM_READ, Scope.FORUM_POST,
        Scope.GDPR_EXPORT_OWN, Scope.GDPR_DELETE_OWN,
        Scope.GAMIFICATION_READ,
    },

    Role.MODERATOR: {
        Scope.FORUM_READ, Scope.FORUM_POST,
        Scope.FORUM_MODERATE, Scope.FORUM_DELETE, Scope.FORUM_CLOSE,
        Scope.NEWS_READ, Scope.NEWS_WRITE, Scope.NEWS_REVIEW,
    },

    Role.TREASURER: {
        Scope.PAYMENTS_READ, Scope.PAYMENTS_WRITE,
        Scope.PAYMENTS_REFUND, Scope.PAYMENTS_EXPORT,
        Scope.ANALYTICS_FINANCE,
        Scope.MEMBERS_READ, Scope.MEMBERS_EXPORT,
        Scope.DOCS_BOARD_READ,
    },

    Role.EVENT_MANAGER: {
        Scope.EVENTS_READ, Scope.EVENTS_WRITE,
        Scope.EVENTS_DELETE, Scope.EVENTS_PUBLISH, Scope.EVENTS_CHECKIN,
        Scope.MEMBERS_READ,
        Scope.NEWS_READ, Scope.NEWS_WRITE,
        Scope.SOCIAL_POST, Scope.SOCIAL_SCHEDULE,
    },

    Role.CONTENT_EDITOR: {
        Scope.NEWS_READ, Scope.NEWS_WRITE,
        Scope.NEWS_DELETE, Scope.NEWS_PUBLISH, Scope.NEWS_REVIEW,
        Scope.DOCS_PUBLIC_READ, Scope.DOCS_MEMBER_READ,
        Scope.DOCS_WRITE, Scope.DOCS_APPROVE,
        Scope.SOCIAL_POST, Scope.SOCIAL_SCHEDULE,
    },

    Role.SERVICE: set(Scope),  # Interne Services: Vollzugriff

    Role.ANONYMOUS: {
        Scope.NEWS_READ,
        Scope.EVENTS_READ,
        Scope.DOCS_PUBLIC_READ,
    },
}


# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def get_scopes_for_roles(roles: list[Role]) -> set[Scope]:
    """Gibt alle Scopes für eine Liste von Rollen zurück (Union)."""
    scopes: set[Scope] = set()
    for role in roles:
        scopes |= ROLE_SCOPES.get(role, set())
    return scopes


def has_scope(user_roles: list[Role], required_scope: Scope) -> bool:
    """Prüft ob ein Nutzer mit gegebenen Rollen einen Scope hat."""
    return required_scope in get_scopes_for_roles(user_roles)


def has_any_scope(user_roles: list[Role], required_scopes: list[Scope]) -> bool:
    """Prüft ob mindestens einer der Scopes vorhanden ist."""
    user_scopes = get_scopes_for_roles(user_roles)
    return any(s in user_scopes for s in required_scopes)


def has_all_scopes(user_roles: list[Role], required_scopes: list[Scope]) -> bool:
    """Prüft ob alle Scopes vorhanden sind."""
    user_scopes = get_scopes_for_roles(user_roles)
    return all(s in user_scopes for s in required_scopes)


def role_hierarchy_level(role: Role) -> int:
    """Gibt die Hierarchieebene einer Rolle zurück (höher = mehr Rechte)."""
    hierarchy = {
        Role.ANONYMOUS: 0,
        Role.MEMBER: 10,
        Role.MODERATOR: 20,
        Role.CONTENT_EDITOR: 20,
        Role.EVENT_MANAGER: 20,
        Role.TREASURER: 30,
        Role.BOARD: 40,
        Role.ADMIN: 100,
        Role.SERVICE: 100,
    }
    return hierarchy.get(role, 0)


def is_at_least(user_roles: list[Role], min_role: Role) -> bool:
    """Prüft ob der Nutzer mindestens die angegebene Rolle hat."""
    min_level = role_hierarchy_level(min_role)
    return any(role_hierarchy_level(r) >= min_level for r in user_roles)


# ── FastAPI-Integration ────────────────────────────────────────────────────────

def create_auth_dependencies():
    """Erstellt FastAPI-Dependency-Funktionen für RBAC."""
    try:
        from fastapi import Depends, HTTPException, status
        from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
        import jwt
        import os

        security = HTTPBearer()
        SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        ALGORITHM  = os.getenv("JWT_ALGORITHM", "HS256")

        def get_current_user(
            credentials: HTTPAuthorizationCredentials = Depends(security)
        ) -> dict:
            token = credentials.credentials
            try:
                if not SECRET_KEY:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="JWT Secret not configured",
                    )
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                return {
                    "user_id":  payload.get("sub"),
                    "email":    payload.get("email"),
                    "roles":    [Role(r) for r in payload.get("roles", ["member"])],
                    "scopes":   payload.get("scopes", []),
                }
            except jwt.ExpiredSignatureError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token abgelaufen",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except jwt.InvalidTokenError as e:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Ungültiger Token: {e}",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        def require_scope(scope: Scope):
            """Dependency-Factory: Erfordert einen bestimmten Scope."""
            def dependency(user: dict = Depends(get_current_user)):
                if not has_scope(user["roles"], scope):
                    logger.warning(
                        "Access denied: user=%s roles=%s required_scope=%s",
                        user.get("user_id"), user.get("roles"), scope
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Fehlende Berechtigung: {scope.value}",
                    )
                return user
            return dependency

        def require_role(min_role: Role):
            """Dependency-Factory: Erfordert mindestens eine Rolle."""
            def dependency(user: dict = Depends(get_current_user)):
                if not is_at_least(user["roles"], min_role):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Mindestrolle erforderlich: {min_role.value}",
                    )
                return user
            return dependency

        def require_admin(user: dict = Depends(get_current_user)):
            if not is_at_least(user["roles"], Role.ADMIN):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin-Zugriff erforderlich",
                )
            return user

        def require_board(user: dict = Depends(get_current_user)):
            if not is_at_least(user["roles"], Role.BOARD):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Vorstandszugriff erforderlich",
                )
            return user

        return {
            "get_current_user": get_current_user,
            "require_scope":    require_scope,
            "require_role":     require_role,
            "require_admin":    require_admin,
            "require_board":    require_board,
        }

    except ImportError:
        logger.warning("FastAPI/PyJWT not available; auth dependencies not created.")
        return {}


# ── React Frontend: RBAC-Typen (TypeScript-Export) ────────────────────────────

TYPESCRIPT_RBAC = '''// Auto-generated – DO NOT EDIT MANUALLY
// Source: apps/api/src/auth/rbac.py

export type Role =
  | "admin" | "board" | "member"
  | "moderator" | "treasurer" | "event_manager" | "content_editor"
  | "service" | "anonymous";

export type Scope =
  | "members:read" | "members:write" | "members:delete" | "members:export"
  | "members:segment" | "members:invite" | "members:import" | "members:roles"
  | "profile:read" | "profile:write"
  | "events:read" | "events:write" | "events:delete" | "events:publish"
  | "events:checkin" | "events:rsvp"
  | "news:read" | "news:write" | "news:delete" | "news:publish" | "news:review"
  | "docs:public:read" | "docs:member:read" | "docs:board:read"
  | "docs:write" | "docs:delete" | "docs:approve"
  | "payments:read" | "payments:write" | "payments:refund"
  | "payments:export" | "payments:own"
  | "forum:read" | "forum:post" | "forum:moderate" | "forum:delete" | "forum:close"
  | "gdpr:export:own" | "gdpr:delete:own" | "gdpr:admin"
  | "analytics:board" | "analytics:admin" | "analytics:finance"
  | "config:read" | "config:write"
  | "social:post" | "social:schedule"
  | "gamification:read" | "gamification:admin"
  | "audit:read" | "crm:sync";

export const ROLE_SCOPES: Record<Role, Scope[]> = {
  admin: [], // All scopes
  board: [
    "members:read", "members:segment", "members:export",
    "profile:read", "profile:write",
    "events:read", "events:write", "events:publish",
    "news:read", "news:write", "news:publish", "news:review",
    "docs:public:read", "docs:member:read", "docs:board:read", "docs:write", "docs:approve",
    "payments:read", "payments:export",
    "forum:read", "forum:post", "forum:moderate",
    "gdpr:export:own", "gdpr:delete:own",
    "analytics:board", "analytics:finance",
    "config:read", "social:post", "social:schedule",
    "gamification:read", "audit:read",
  ],
  member: [
    "profile:read", "profile:write",
    "events:read", "events:rsvp",
    "news:read",
    "docs:public:read", "docs:member:read",
    "payments:own",
    "forum:read", "forum:post",
    "gdpr:export:own", "gdpr:delete:own",
    "gamification:read",
  ],
  moderator: ["forum:read", "forum:post", "forum:moderate", "forum:delete", "forum:close", "news:read", "news:write", "news:review"],
  treasurer: ["payments:read", "payments:write", "payments:refund", "payments:export", "analytics:finance", "members:read", "members:export", "docs:board:read"],
  event_manager: ["events:read", "events:write", "events:delete", "events:publish", "events:checkin", "members:read", "news:read", "news:write", "social:post", "social:schedule"],
  content_editor: ["news:read", "news:write", "news:delete", "news:publish", "news:review", "docs:public:read", "docs:member:read", "docs:write", "docs:approve", "social:post", "social:schedule"],
  service: [],
  anonymous: ["news:read", "events:read", "docs:public:read"],
};

export function hasScope(roles: Role[], scope: Scope): boolean {
  if (roles.includes("admin") || roles.includes("service")) return true;
  return roles.some(role => ROLE_SCOPES[role]?.includes(scope));
}

export function hasAnyScope(roles: Role[], scopes: Scope[]): boolean {
  return scopes.some(s => hasScope(roles, s));
}

export function isAtLeast(roles: Role[], minRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    anonymous: 0, member: 10, moderator: 20, content_editor: 20,
    event_manager: 20, treasurer: 30, board: 40, admin: 100, service: 100,
  };
  const minLevel = hierarchy[minRole] ?? 0;
  return roles.some(r => (hierarchy[r] ?? 0) >= minLevel);
}
'''


def export_typescript_types(output_path: str) -> None:
    """Exportiert die RBAC-Typen als TypeScript-Datei."""
    import pathlib
    pathlib.Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(TYPESCRIPT_RBAC)
    logger.info("TypeScript RBAC types exported to %s", output_path)


if __name__ == "__main__":
    export_typescript_types(
        "/home/ubuntu/menschlichkeit-oesterreich-development/apps/website/src/lib/rbac.ts"
    )
    logger.info("TypeScript RBAC types exported successfully.")
    logger.info("Rollen-Übersicht:")
    for role in Role:
        scopes = ROLE_SCOPES.get(role, set())
        count = "ALL" if role in (Role.ADMIN, Role.SERVICE) else str(len(scopes))
        logger.info("  %s → %s Scopes", role.value, count)

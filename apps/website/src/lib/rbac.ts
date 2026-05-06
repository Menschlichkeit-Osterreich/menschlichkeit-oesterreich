// Auto-generated – DO NOT EDIT MANUALLY
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

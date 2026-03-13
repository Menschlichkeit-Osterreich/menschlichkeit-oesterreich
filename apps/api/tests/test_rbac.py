"""Tests für RBAC: JWT-Erstellung, Dekodierung und Rollenprüfung."""
from __future__ import annotations

import pytest
import time
from app.rbac import create_jwt, decode_jwt, Role, ROLE_HIERARCHY


class TestCreateDecodeJwt:
    def test_roundtrip(self):
        payload = {"sub": "user@test.at", "uid": "abc", "role": "admin"}
        token = create_jwt(payload)
        decoded = decode_jwt(token)
        assert decoded is not None
        assert decoded["sub"] == "user@test.at"
        assert decoded["role"] == "admin"

    def test_expired_token_rejected(self):
        payload = {"sub": "user@test.at", "role": "member"}
        token = create_jwt(payload, expires_in=-1)
        result = decode_jwt(token)
        assert result is None

    def test_tampered_signature_rejected(self):
        token = create_jwt({"sub": "user@test.at", "role": "admin"})
        header, payload, sig = token.split(".")
        tampered = f"{header}.{payload}.invalidsignature"
        assert decode_jwt(tampered) is None

    def test_malformed_token_rejected(self):
        assert decode_jwt("not.a.valid.jwt.token") is None
        assert decode_jwt("") is None
        assert decode_jwt("onlytwoparts.here") is None


class TestRoleHierarchy:
    def test_admin_above_member(self):
        assert ROLE_HIERARCHY[Role.ADMIN] > ROLE_HIERARCHY[Role.MEMBER]

    def test_sysadmin_highest(self):
        assert ROLE_HIERARCHY[Role.SYSADMIN] == max(ROLE_HIERARCHY.values())

    def test_guest_lowest(self):
        assert ROLE_HIERARCHY[Role.GUEST] == min(ROLE_HIERARCHY.values())

    def test_moderator_above_member(self):
        assert ROLE_HIERARCHY[Role.MODERATOR] > ROLE_HIERARCHY[Role.MEMBER]


class TestAuthEndpoints:
    def test_login_missing_fields(self, client):
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 422

    def test_register_missing_fields(self, client):
        resp = client.post("/api/auth/register", json={"email": "test@test.at"})
        assert resp.status_code == 422

    def test_password_reset_missing_email(self, client):
        resp = client.post("/api/auth/password-reset", json={})
        assert resp.status_code == 422

    def test_password_reset_confirm_missing_fields(self, client):
        resp = client.post("/api/auth/password-reset/confirm", json={"token": "abc"})
        assert resp.status_code == 422

    def test_protected_endpoint_no_token(self, client):
        resp = client.get("/api/members")
        assert resp.status_code == 401

    def test_protected_endpoint_invalid_token(self, client):
        resp = client.get("/api/members", headers={"Authorization": "Bearer invalid"})
        assert resp.status_code == 401

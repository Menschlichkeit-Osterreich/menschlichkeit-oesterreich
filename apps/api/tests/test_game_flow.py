"""Tests fuer den Game-Vertical-Slice."""
from __future__ import annotations

from fastapi import HTTPException
from unittest.mock import AsyncMock, patch


def test_game_bootstrap_requires_auth(client):
    resp = client.get("/api/game/bootstrap")
    assert resp.status_code == 401


def test_game_bootstrap_returns_profile(member_headers, client):
    payload = {
        "member": {"id": "user-1", "email": "member@test.at", "firstName": "Max"},
        "privacy": {"analyticsEnabled": False, "analyticsConsentId": None, "analyticsSource": "disabled"},
        "profile": {
            "selectedRole": "buerger",
            "currentWorldId": "gemeinde",
            "resumeScenarioId": "gemeinde-parkplatz",
            "settings": {"reducedMotion": False, "lowGraphics": False},
            "stats": {"empathy": 0, "rights": 0, "participation": 0, "courage": 0},
            "worldState": {"gemeinde": {"trust": 50, "participation": 50, "ruleOfLaw": 50, "socialTension": 34, "futureLoad": 52}},
            "totalXp": 0,
            "playerLevel": 1,
        },
        "progress": {
            "completedScenarioIds": [],
            "completedCount": 0,
            "unlockedScenarioIds": ["gemeinde-parkplatz"],
            "nextScenarioId": "gemeinde-parkplatz",
            "unlockedWorldIds": ["gemeinde"],
        },
        "contentVersion": "2026-03-30-gemeinde-v1",
        "gameplaySummary": {"roleCount": 6, "worldCount": 10, "playableWorldCount": 1, "scenarioCount": 3},
    }
    with patch("app.routers.game.game_service.get_bootstrap_data", new=AsyncMock(return_value=payload)):
        resp = client.get("/api/game/bootstrap", headers=member_headers)

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["contentVersion"] == "2026-03-30-gemeinde-v1"
    assert data["progress"]["unlockedScenarioIds"] == ["gemeinde-parkplatz"]


def test_game_profile_update_returns_settings(member_headers, client):
    profile = {
        "selectedRole": "journalist",
        "currentWorldId": "gemeinde",
        "resumeScenarioId": "gemeinde-jugendzentrum",
        "settings": {"reducedMotion": True, "lowGraphics": False},
        "stats": {"empathy": 3, "rights": 2, "participation": 5, "courage": 1},
        "worldState": {"gemeinde": {"trust": 55, "participation": 54, "ruleOfLaw": 52, "socialTension": 30, "futureLoad": 49}},
        "totalXp": 24,
        "playerLevel": 1,
    }
    with patch("app.routers.game.game_service.update_profile", new=AsyncMock(return_value=profile)):
        resp = client.put(
            "/api/game/profile",
            headers=member_headers,
            json={"selectedRole": "journalist", "settings": {"reducedMotion": True}},
        )

    assert resp.status_code == 200
    assert resp.json()["data"]["settings"]["reducedMotion"] is True


def test_game_complete_rejects_locked_scenario(member_headers, client):
    with patch(
        "app.routers.game.game_service.complete_scenario",
        new=AsyncMock(side_effect=HTTPException(status_code=403, detail="Szenario ist noch nicht freigeschaltet")),
    ):
        resp = client.post(
            "/api/game/scenarios/locked-world/complete",
            headers=member_headers,
            json={"roleId": "buerger", "choiceId": "forum"},
        )

    assert resp.status_code == 403


def test_game_complete_returns_progress(member_headers, client):
    payload = {
        "scenarioId": "gemeinde-parkplatz",
        "alreadyCompleted": False,
        "outcome": {
            "choiceId": "forum",
            "roleId": "buerger",
            "usedSignatureAction": True,
            "score": 98,
            "xpAwarded": 30,
            "band": "stark",
            "statsDelta": {"empathy": 5, "rights": 3, "participation": 10, "courage": 2},
            "worldDelta": {"trust": 9, "participation": 10, "ruleOfLaw": 8, "socialTension": -3, "futureLoad": -3},
            "worldStateAfter": {"trust": 59, "participation": 60, "ruleOfLaw": 58, "socialTension": 31, "futureLoad": 49},
            "summary": "Du oeffnest die Planung und legst Verkehr, Sicherheit und Nutzen offen.",
            "immediate": "Mehr Konflikt wird sichtbar, aber das Vertrauen steigt.",
            "mediumTerm": "Die Entscheidung wird spaeter besser getragen.",
        },
        "profile": {
            "selectedRole": "buerger",
            "currentWorldId": "gemeinde",
            "resumeScenarioId": "gemeinde-jugendzentrum",
            "settings": {"reducedMotion": False, "lowGraphics": False},
            "stats": {"empathy": 5, "rights": 3, "participation": 10, "courage": 2},
            "worldState": {"gemeinde": {"trust": 59, "participation": 60, "ruleOfLaw": 58, "socialTension": 31, "futureLoad": 49}},
            "totalXp": 30,
            "playerLevel": 1,
        },
        "progress": {
            "completedScenarioIds": ["gemeinde-parkplatz"],
            "completedCount": 1,
            "unlockedScenarioIds": ["gemeinde-parkplatz", "gemeinde-jugendzentrum"],
            "nextScenarioId": "gemeinde-jugendzentrum",
            "unlockedWorldIds": ["gemeinde"],
        },
    }
    with patch("app.routers.game.game_service.complete_scenario", new=AsyncMock(return_value=payload)):
        resp = client.post(
            "/api/game/scenarios/gemeinde-parkplatz/complete",
            headers=member_headers,
            json={"roleId": "buerger", "choiceId": "forum", "useSignatureAction": True},
        )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["progress"]["nextScenarioId"] == "gemeinde-jugendzentrum"
    assert data["outcome"]["score"] == 98


def test_game_events_respect_analytics_consent(member_headers, client):
    rejected = {"accepted": False, "reason": "analytics_disabled"}
    with patch("app.routers.game.game_service.record_event", new=AsyncMock(return_value=rejected)):
        resp = client.post(
            "/api/game/events",
            headers=member_headers,
            json={"eventType": "scenario_viewed", "payload": {"scenarioId": "gemeinde-parkplatz"}},
        )

    assert resp.status_code == 200
    assert resp.json()["data"]["accepted"] is False

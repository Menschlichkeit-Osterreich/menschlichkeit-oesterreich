from __future__ import annotations

import json
from math import floor
from typing import Any

from fastapi import HTTPException, status

from ..db import execute, fetch, fetchrow
from .member_service import member_service, member_to_user
from .privacy_service import privacy_service

GAME_CONTENT_VERSION = "2026-03-30-gemeinde-v1"

ROLE_DEFINITIONS: list[dict[str, Any]] = [
    {
        "id": "buerger",
        "name": "Engagierte Buergerin",
        "summary": "Du bringst alltaegliche Betroffenheit und leise Stimmen in politische Entscheidungen.",
        "focusStat": "participation",
        "synergyTag": "community",
        "worldTrackFocusKey": "participation",
        "trackBonus": 5,
        "pressureTrack": "Anschlussfaehigkeit im Alltag",
        "reflectionLens": "Wie wurde Teilhabe fuer Menschen wirklich spuerbar?",
        "signatureAction": {"label": "Nachbarschaftsrat aktivieren", "scoreBonus": 6, "xpBonus": 4, "statBonus": 2},
    },
    {
        "id": "politiker",
        "name": "Lokalpolitiker",
        "summary": "Du musst Handlungsfaehigkeit, Legitimation und Gemeinwohl gleichzeitig sichern.",
        "focusStat": "rights",
        "synergyTag": "official",
        "worldTrackFocusKey": "trust",
        "trackBonus": 4,
        "pressureTrack": "Legitimation und Mehrheitsdruck",
        "reflectionLens": "Welche Entscheidung war politisch tragfaehig, ohne das Gemeinwohl zu verraten?",
        "signatureAction": {"label": "Dringlichkeitssitzung einberufen", "scoreBonus": 5, "xpBonus": 5, "statBonus": 1},
    },
    {
        "id": "journalist",
        "name": "Investigativ-Journalistin",
        "summary": "Du machst Machtfragen, Quellenlage und Rechenschaft sichtbar.",
        "focusStat": "rights",
        "synergyTag": "transparency",
        "worldTrackFocusKey": "ruleOfLaw",
        "trackBonus": 5,
        "pressureTrack": "Glaubwuerdigkeit der Oeffentlichkeit",
        "reflectionLens": "Welche Information musste sichtbar werden, damit Demokratie arbeiten kann?",
        "signatureAction": {"label": "Quellenlage offenlegen", "scoreBonus": 7, "xpBonus": 4, "statBonus": 2},
    },
    {
        "id": "aktivist",
        "name": "Klimaaktivist",
        "summary": "Du baust Druck auf, damit notwendige Veraenderung nicht vertagt wird.",
        "focusStat": "courage",
        "synergyTag": "mobilize",
        "worldTrackFocusKey": "futureLoad",
        "trackBonus": -4,
        "pressureTrack": "Dringlichkeit und Erschoepfung",
        "reflectionLens": "Wo war Druck noetig und wo haette er Vertrauen kosten koennen?",
        "signatureAction": {"label": "Buendnis mobilisieren", "scoreBonus": 6, "xpBonus": 5, "statBonus": 2},
    },
    {
        "id": "beamter",
        "name": "Verwaltungsbeamter",
        "summary": "Du pruefst, ob gute Absichten auch tragfaehig umgesetzt werden koennen.",
        "focusStat": "rights",
        "synergyTag": "compliance",
        "worldTrackFocusKey": "ruleOfLaw",
        "trackBonus": 4,
        "pressureTrack": "Verfahren und Belastbarkeit",
        "reflectionLens": "Welche Loesung war nicht nur gut gemeint, sondern auch tragfaehig?",
        "signatureAction": {"label": "Verfahrenscheck starten", "scoreBonus": 5, "xpBonus": 4, "statBonus": 1},
    },
    {
        "id": "richter",
        "name": "Verfassungsrichterin",
        "summary": "Du verteidigst Grundrechte, Minderheitenschutz und klare rote Linien.",
        "focusStat": "rights",
        "synergyTag": "rights",
        "worldTrackFocusKey": "ruleOfLaw",
        "trackBonus": 6,
        "pressureTrack": "Grundrechte unter Druck",
        "reflectionLens": "Welche rote Linie musste sichtbar gezogen werden und warum?",
        "signatureAction": {"label": "Grundrechtspruefung anstossen", "scoreBonus": 7, "xpBonus": 4, "statBonus": 2},
    },
]

WORLD_DEFINITIONS: list[dict[str, Any]] = [
    {"id": "gemeinde", "order": 1, "name": "Gemeinde", "summary": "Lokale Demokratie, Beteiligung und Konfliktloesung vor Ort.", "status": "playable", "release": "Vertical Slice"},
    {"id": "schule", "order": 2, "name": "Schule", "summary": "Bildung, Inklusion und demokratischer Alltag an Lernorten.", "status": "roadmap", "release": "MVP"},
    {"id": "arbeit", "order": 3, "name": "Arbeit", "summary": "Mitbestimmung, faire Arbeit und soziale Sicherheit.", "status": "roadmap", "release": "MVP"},
    {"id": "medien", "order": 4, "name": "Medien", "summary": "Pressefreiheit, Informationskompetenz und oeffentliche Verantwortung.", "status": "roadmap", "release": "MVP"},
    {"id": "umwelt", "order": 5, "name": "Umwelt", "summary": "Klimaschutz, Generationengerechtigkeit und nachhaltige Entscheidungen.", "status": "roadmap", "release": "Post-MVP"},
    {"id": "digital", "order": 6, "name": "Digital", "summary": "Datenschutz, KI und demokratische Kontrolle digitaler Systeme.", "status": "roadmap", "release": "Post-MVP"},
    {"id": "gesundheit", "order": 7, "name": "Gesundheit", "summary": "Versorgungssicherheit, Pflege und schwierige Priorisierungen.", "status": "roadmap", "release": "Post-MVP"},
    {"id": "europa", "order": 8, "name": "Europa", "summary": "Solidaritaet, Rechtsstaatlichkeit und europaeische Verantwortung.", "status": "roadmap", "release": "Full Product"},
    {"id": "gerechtigkeit", "order": 9, "name": "Gerechtigkeit", "summary": "Grundrechte, Gleichstellung und Minderheitenschutz.", "status": "roadmap", "release": "Full Product"},
    {"id": "zukunft", "order": 10, "name": "Zukunft", "summary": "Demokratie der Zukunft, Innovation und globale Verantwortung.", "status": "roadmap", "release": "Full Product"},
]

WORLD_TRACK_DEFAULTS = {"trust": 50, "participation": 50, "ruleOfLaw": 50, "socialTension": 34, "futureLoad": 52}
WORLD_TRACK_KEYS = tuple(WORLD_TRACK_DEFAULTS.keys())

SCENARIO_DEFINITIONS: list[dict[str, Any]] = [
    {
        "id": "gemeinde-parkplatz",
        "worldId": "gemeinde",
        "title": "Der Parkplatz-Streit",
        "difficulty": 1,
        "summary": "Ein Parkplatzprojekt spaltet Anrainer:innen, Handel und Elternverein.",
        "prompt": "Wie bringst du Mobilitaet, Sicherheit und Gemeinwohl in eine faire Entscheidung?",
        "learningFocus": "Abwaegung lokaler Interessen und sichtbare Beteiligung",
        "teacherPrompt": "Welche Stimmen waren formal laut und welche mussten aktiv hereingeholt werden?",
        "choices": [
            {"id": "forum", "label": "Nachbarschaftsforum mit klaren Kriterien", "summary": "Du oeffnest die Planung und legst Verkehr, Sicherheit und Nutzen offen.", "immediate": "Mehr Konflikt wird sichtbar, aber das Vertrauen steigt.", "mediumTerm": "Die Entscheidung wird spaeter besser getragen.", "score": 90, "xp": 24, "stats": {"empathy": 5, "rights": 3, "participation": 8, "courage": 2}, "tags": ["community", "transparency"]},
            {"id": "schnell", "label": "Sofortige Verwaltungsentscheidung ohne Beteiligung", "summary": "Du beschleunigst das Projekt und vermeidest eine oeffentliche Auseinandersetzung.", "immediate": "Der Beschluss geht schnell durch.", "mediumTerm": "Widerstand verlagert sich in Misstrauen und Protest.", "score": 42, "xp": 6, "stats": {"empathy": 0, "rights": 1, "participation": -2, "courage": 1}, "tags": ["official"]},
            {"id": "schule", "label": "Schulweg und Verkehrssicherheit zuerst neu planen", "summary": "Du verschiebst das Projekt und baust die Planung um die verletzlichsten Gruppen herum auf.", "immediate": "Die Entscheidung kostet Zeit.", "mediumTerm": "Die Gemeinde gewinnt an Glaubwuerdigkeit.", "score": 84, "xp": 18, "stats": {"empathy": 6, "rights": 4, "participation": 5, "courage": 3}, "tags": ["rights", "community"]},
        ],
    },
    {
        "id": "gemeinde-jugendzentrum",
        "worldId": "gemeinde",
        "title": "Neues Jugendzentrum",
        "difficulty": 1,
        "summary": "Ein freier Standort ist verfuegbar, aber manche fuerchten Laerm und Vandalismus.",
        "prompt": "Wie schaffst du einen Ort fuer Jugendliche, ohne die Nachbarschaft zu verlieren?",
        "learningFocus": "Beteiligung statt Symbolpolitik",
        "teacherPrompt": "Wurde mit Jugendlichen oder nur ueber Jugendliche gesprochen?",
        "choices": [
            {"id": "co-design", "label": "Jugendrat und Anrainer:innen gemeinsam planen lassen", "summary": "Du gibst Jugendlichen echte Mitgestaltung und legst Nutzungsregeln gemeinsam fest.", "immediate": "Der Prozess wirkt anfangs muehsam.", "mediumTerm": "Die Nutzungsregeln sind legitimiert und tragfaehig.", "score": 92, "xp": 26, "stats": {"empathy": 7, "rights": 3, "participation": 8, "courage": 2}, "tags": ["community", "mobilize"]},
            {"id": "image", "label": "Nur ein starkes PR-Konzept ausrollen", "summary": "Du versuchst die Akzeptanz ueber Kommunikation statt Mitgestaltung zu sichern.", "immediate": "Die Debatte beruhigt sich kurz.", "mediumTerm": "Sobald Probleme auftauchen, fehlt echte Bindung.", "score": 50, "xp": 8, "stats": {"empathy": 1, "rights": 1, "participation": 0, "courage": 0}, "tags": ["official"]},
            {"id": "sparen", "label": "Projekt verschieben und auf spaeteres Budget hoffen", "summary": "Du vermeidest den Konflikt und vertagst die Entscheidung.", "immediate": "Heute gibt es weniger Gegenwind.", "mediumTerm": "Jugendliche bleiben ohne geschuetzten Ort.", "score": 25, "xp": 0, "stats": {"empathy": -2, "rights": 0, "participation": -3, "courage": -2}, "tags": []},
        ],
    },
    {
        "id": "gemeinde-strassensanierung",
        "worldId": "gemeinde",
        "title": "Strassensanierung",
        "difficulty": 2,
        "summary": "Die Hauptstrasse muss saniert werden, aber Gewerbe und Oeffis sind betroffen.",
        "prompt": "Wie organisierst du eine Sanierung, ohne dass die Gemeinde in Lager zerfaellt?",
        "learningFocus": "Umsetzungskraft und Transparenz",
        "teacherPrompt": "Welche Information braucht eine Gemeinde, um Bauzeit und Belastung fair zu akzeptieren?",
        "choices": [
            {"id": "transparenz", "label": "Etappenplan mit offenem Belastungsmonitor", "summary": "Du veroeffentlichst Bauphasen, Ersatzwege und ein klares Beschwerdefenster.", "immediate": "Mehr Menschen fuehlen sich ernst genommen.", "mediumTerm": "Die Sanierung bleibt trotz Belastung politisch stabil.", "score": 88, "xp": 22, "stats": {"empathy": 4, "rights": 3, "participation": 5, "courage": 3}, "tags": ["transparency", "compliance"]},
            {"id": "nachtbau", "label": "Maximal verdichten und nachts durchziehen", "summary": "Du priorisierst Geschwindigkeit ueber Gesundheits- und Lebensqualitaetsfragen.", "immediate": "Die Bauzeit sinkt.", "mediumTerm": "Vertrauen und Akzeptanz brechen spuerbar weg.", "score": 38, "xp": 4, "stats": {"empathy": -1, "rights": 0, "participation": -2, "courage": 1}, "tags": ["official"]},
            {"id": "sozialfonds", "label": "Baustellenplan mit haerterem Schutz fuer kleine Geschaefte", "summary": "Du kombinierst Zeitplan, Lieferfenster und gezielte lokale Entlastung.", "immediate": "Die Umsetzung wird komplexer.", "mediumTerm": "Besonders betroffene Gruppen bleiben handlungsfaehig.", "score": 82, "xp": 16, "stats": {"empathy": 4, "rights": 2, "participation": 4, "courage": 2}, "tags": ["community", "compliance"]},
        ],
    },
]

SCENARIO_IDS = tuple(scenario["id"] for scenario in SCENARIO_DEFINITIONS)
SCENARIO_MAP = {scenario["id"]: scenario for scenario in SCENARIO_DEFINITIONS}
ROLE_MAP = {role["id"]: role for role in ROLE_DEFINITIONS}
WORLD_MAP = {world["id"]: world for world in WORLD_DEFINITIONS}
DEFAULT_ROLE_ID = ROLE_DEFINITIONS[0]["id"]
DEFAULT_WORLD_ID = WORLD_DEFINITIONS[0]["id"]
DEFAULT_SETTINGS = {"reducedMotion": False, "lowGraphics": False}
DEFAULT_STATS = {"empathy": 0, "rights": 0, "participation": 0, "courage": 0}


def _clone_json(data: Any) -> Any:
    return json.loads(json.dumps(data))


def _default_world_state() -> dict[str, dict[str, int]]:
    return {world["id"]: _clone_json(WORLD_TRACK_DEFAULTS) for world in WORLD_DEFINITIONS}


def _clamp(value: int | float, minimum: int, maximum: int) -> int:
    return max(minimum, min(maximum, round(value)))


def _player_level(total_xp: int) -> int:
    return max(1, 1 + floor(total_xp / 140))


def _merge_settings(value: dict[str, Any] | None) -> dict[str, bool]:
    merged = {**DEFAULT_SETTINGS}
    for key in DEFAULT_SETTINGS:
        if value is not None and key in value:
            merged[key] = bool(value[key])
    return merged


def _merge_stats(value: dict[str, Any] | None) -> dict[str, int]:
    merged = {**DEFAULT_STATS}
    for key in DEFAULT_STATS:
        if value is not None and key in value:
            merged[key] = int(value[key])
    return merged


def _merge_world_state(value: dict[str, Any] | None) -> dict[str, dict[str, int]]:
    merged = _default_world_state()
    for world_id, snapshot in (value or {}).items():
        if world_id not in merged or not isinstance(snapshot, dict):
            continue
        for track in WORLD_TRACK_KEYS:
            if track in snapshot:
                merged[world_id][track] = _clamp(snapshot[track], 0, 100)
    return merged


def _completed_ids(rows: list[Any]) -> list[str]:
    return [str(row["scenario_id"]) for row in rows]


def _unlocked_scenario_ids(completed_ids: list[str]) -> list[str]:
    unlocked_count = min(len(SCENARIO_IDS), max(1, len(completed_ids) + 1))
    return list(SCENARIO_IDS[:unlocked_count])


def _next_scenario_id(completed_ids: list[str]) -> str | None:
    for scenario_id in SCENARIO_IDS:
        if scenario_id not in completed_ids:
            return scenario_id
    return None


def _active_analytics_consent(consents: list[dict[str, Any]]) -> dict[str, Any] | None:
    for consent in consents:
        if consent.get("consent_type") == "analytics" and consent.get("status") == "granted":
            return consent
    return None


def _empty_delta() -> dict[str, int]:
    return {key: 0 for key in WORLD_TRACK_KEYS}


def _add_bonus(delta: dict[str, int], key: str, value: int | float) -> None:
    delta[key] = delta.get(key, 0) + round(value)


def _apply_tag_bonuses(delta: dict[str, int], tags: list[str]) -> None:
    if "community" in tags:
        _add_bonus(delta, "trust", 3)
        _add_bonus(delta, "participation", 4)
        _add_bonus(delta, "socialTension", -2)
    if "transparency" in tags:
        _add_bonus(delta, "trust", 4)
        _add_bonus(delta, "ruleOfLaw", 3)
        _add_bonus(delta, "socialTension", -1)
    if "official" in tags:
        _add_bonus(delta, "trust", 1)
        _add_bonus(delta, "ruleOfLaw", 2)
        _add_bonus(delta, "participation", -1)
    if "mobilize" in tags:
        _add_bonus(delta, "participation", 4)
        _add_bonus(delta, "futureLoad", -2)
        _add_bonus(delta, "socialTension", 1)
    if "compliance" in tags:
        _add_bonus(delta, "ruleOfLaw", 5)
        _add_bonus(delta, "futureLoad", -2)
    if "rights" in tags:
        _add_bonus(delta, "ruleOfLaw", 5)
        _add_bonus(delta, "trust", 2)
        _add_bonus(delta, "socialTension", -3)


def _normalize_delta(delta: dict[str, int]) -> dict[str, int]:
    return {key: _clamp(delta.get(key, 0), -18, 18) for key in WORLD_TRACK_KEYS}


def _build_world_delta(choice: dict[str, Any], role: dict[str, Any], use_signature_action: bool) -> dict[str, int]:
    stats = {**DEFAULT_STATS, **choice.get("stats", {})}
    delta = _empty_delta()
    _add_bonus(delta, "trust", stats["empathy"] * 1.15 + stats["rights"] * 0.55 + stats["participation"] * 0.45 + stats["courage"] * 0.2)
    _add_bonus(delta, "participation", stats["participation"] * 1.2 + stats["empathy"] * 0.35 + stats["courage"] * 0.3)
    _add_bonus(delta, "ruleOfLaw", stats["rights"] * 1.35 + stats["courage"] * 0.35)
    _add_bonus(delta, "socialTension", stats["courage"] * 0.15 - stats["empathy"] * 0.6 - stats["participation"] * 0.4 - stats["rights"] * 0.2)
    _add_bonus(delta, "futureLoad", -stats["courage"] * 0.6 - stats["rights"] * 0.45 - stats["participation"] * 0.3)
    _apply_tag_bonuses(delta, list(choice.get("tags", [])))
    score = int(choice.get("score", 0))
    if score >= 85:
        _add_bonus(delta, "trust", 2)
        _add_bonus(delta, "futureLoad", -2)
    elif score <= 45:
        _add_bonus(delta, "trust", -4)
        _add_bonus(delta, "socialTension", 4)
        _add_bonus(delta, "futureLoad", 3)
    if role["synergyTag"] in choice.get("tags", []):
        _add_bonus(delta, "trust", 2)
        _add_bonus(delta, role["worldTrackFocusKey"], 2)
    if use_signature_action:
        _add_bonus(delta, role["worldTrackFocusKey"], role["trackBonus"])
        if role["synergyTag"] in choice.get("tags", []):
            _add_bonus(delta, "futureLoad", -1)
        else:
            _add_bonus(delta, "socialTension", 2)
            _add_bonus(delta, "futureLoad", 1)
    return _normalize_delta(delta)


def _apply_world_delta(snapshot: dict[str, int], delta: dict[str, int]) -> dict[str, int]:
    return {
        key: _clamp(snapshot.get(key, WORLD_TRACK_DEFAULTS[key]) + delta.get(key, 0), 0, 100)
        for key in WORLD_TRACK_KEYS
    }


def _outcome_band(score: int) -> str:
    if score >= 88:
        return "stark"
    if score >= 68:
        return "tragfaehig"
    return "kritisch"


def _serialize_profile(row: dict[str, Any] | None) -> dict[str, Any]:
    payload = row or {}
    total_xp = int(payload.get("total_xp") or 0)
    return {
        "selectedRole": payload.get("selected_role") or DEFAULT_ROLE_ID,
        "currentWorldId": payload.get("current_world_id") or DEFAULT_WORLD_ID,
        "resumeScenarioId": payload.get("resume_scenario_id"),
        "settings": _merge_settings(payload.get("settings")),
        "stats": _merge_stats(payload.get("stats")),
        "worldState": _merge_world_state(payload.get("world_state")),
        "totalXp": total_xp,
        "playerLevel": int(payload.get("player_level") or _player_level(total_xp)),
    }


class GameService:
    async def ensure_profile(self, member_id: str) -> dict[str, Any]:
        row = await fetchrow("SELECT * FROM game_profiles WHERE member_id = $1::uuid", member_id)
        if row:
            return dict(row)

        await execute(
            """
            INSERT INTO game_profiles (
                member_id, selected_role, current_world_id, resume_scenario_id,
                settings, stats, world_state, total_xp, player_level
            )
            VALUES ($1::uuid, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)
            ON CONFLICT (member_id) DO NOTHING
            """,
            member_id,
            DEFAULT_ROLE_ID,
            DEFAULT_WORLD_ID,
            SCENARIO_IDS[0],
            json.dumps(DEFAULT_SETTINGS),
            json.dumps(DEFAULT_STATS),
            json.dumps(_default_world_state()),
            0,
            1,
        )
        row = await fetchrow("SELECT * FROM game_profiles WHERE member_id = $1::uuid", member_id)
        return dict(row) if row else {}

    async def has_active_analytics_consent(self, *, member_id: str, email: str | None) -> tuple[bool, str | None]:
        consents = await privacy_service.list_consents(member_id=member_id, email=email)
        active = _active_analytics_consent(consents)
        return (active is not None, str(active["id"]) if active else None)

    async def get_bootstrap_data(self, user: dict[str, Any]) -> dict[str, Any]:
        member = await member_service.get_member_by_id(user["uid"])
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitglied nicht gefunden")

        profile_row = await self.ensure_profile(user["uid"])
        progress_rows = await fetch(
            """
            SELECT scenario_id, choice_id, role_id, score, xp_awarded, used_signature_action, completed_at
            FROM game_progress
            WHERE member_id = $1::uuid
            ORDER BY completed_at ASC
            """,
            user["uid"],
        )
        completed_ids = _completed_ids(progress_rows)
        has_consent, consent_id = await self.has_active_analytics_consent(member_id=user["uid"], email=user.get("sub"))

        return {
            "member": member_to_user(member),
            "privacy": {
                "analyticsEnabled": has_consent,
                "analyticsConsentId": consent_id,
                "analyticsSource": "consent" if has_consent else "disabled",
            },
            "profile": _serialize_profile(profile_row),
            "progress": {
                "completedScenarioIds": completed_ids,
                "completedCount": len(completed_ids),
                "unlockedScenarioIds": _unlocked_scenario_ids(completed_ids),
                "nextScenarioId": _next_scenario_id(completed_ids),
                "unlockedWorldIds": [DEFAULT_WORLD_ID],
            },
            "contentVersion": GAME_CONTENT_VERSION,
            "gameplaySummary": {
                "roleCount": len(ROLE_DEFINITIONS),
                "worldCount": len(WORLD_DEFINITIONS),
                "playableWorldCount": 1,
                "scenarioCount": len(SCENARIO_IDS),
            },
        }

    async def update_profile(self, member_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        current = await self.ensure_profile(member_id)
        serialized = _serialize_profile(current)

        selected_role = payload.get("selectedRole") or serialized["selectedRole"]
        if selected_role not in ROLE_MAP:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekannte Rolle")

        current_world_id = payload.get("currentWorldId") or serialized["currentWorldId"]
        if current_world_id not in WORLD_MAP:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekannte Welt")

        resume_scenario_id = payload.get("resumeScenarioId", serialized["resumeScenarioId"])
        if resume_scenario_id is not None and resume_scenario_id not in SCENARIO_MAP:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekanntes Szenario")

        settings = serialized["settings"]
        if isinstance(payload.get("settings"), dict):
            settings = _merge_settings({**settings, **payload["settings"]})

        await execute(
            """
            UPDATE game_profiles
            SET selected_role = $2,
                current_world_id = $3,
                resume_scenario_id = $4,
                settings = $5::jsonb,
                updated_at = NOW()
            WHERE member_id = $1::uuid
            """,
            member_id,
            selected_role,
            current_world_id,
            resume_scenario_id,
            json.dumps(settings),
        )
        updated = await self.ensure_profile(member_id)
        return _serialize_profile(updated)

    async def complete_scenario(
        self,
        *,
        member_id: str,
        scenario_id: str,
        role_id: str,
        choice_id: str,
        use_signature_action: bool,
    ) -> dict[str, Any]:
        if scenario_id not in SCENARIO_MAP:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekanntes Szenario")
        if role_id not in ROLE_MAP:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekannte Rolle")

        scenario = SCENARIO_MAP[scenario_id]
        role = ROLE_MAP[role_id]
        choice = next((entry for entry in scenario["choices"] if entry["id"] == choice_id), None)
        if not choice:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unbekannte Entscheidung")

        profile_row = await self.ensure_profile(member_id)
        serialized = _serialize_profile(profile_row)
        progress_rows = await fetch(
            "SELECT scenario_id FROM game_progress WHERE member_id = $1::uuid ORDER BY completed_at ASC",
            member_id,
        )
        completed_ids = _completed_ids(progress_rows)
        if scenario_id not in _unlocked_scenario_ids(completed_ids):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Szenario ist noch nicht freigeschaltet")

        existing = await fetchrow(
            """
            SELECT scenario_id, choice_id, role_id, score, xp_awarded, used_signature_action,
                   stats_delta, world_delta, world_state_after
            FROM game_progress
            WHERE member_id = $1::uuid AND scenario_id = $2
            """,
            member_id,
            scenario_id,
        )
        if existing:
            row = dict(existing)
            completed_after = completed_ids if scenario_id in completed_ids else completed_ids + [scenario_id]
            return {
                "scenarioId": scenario_id,
                "alreadyCompleted": True,
                "outcome": {
                    "choiceId": row["choice_id"],
                    "roleId": row["role_id"],
                    "usedSignatureAction": bool(row["used_signature_action"]),
                    "score": int(row["score"]),
                    "xpAwarded": int(row["xp_awarded"]),
                    "band": _outcome_band(int(row["score"])),
                    "statsDelta": _merge_stats(row.get("stats_delta")),
                    "worldDelta": {**_empty_delta(), **(row.get("world_delta") or {})},
                    "worldStateAfter": {**WORLD_TRACK_DEFAULTS, **(row.get("world_state_after") or {})},
                    "summary": choice["summary"],
                    "immediate": choice["immediate"],
                    "mediumTerm": choice["mediumTerm"],
                },
                "profile": serialized,
                "progress": {
                    "completedScenarioIds": completed_after,
                    "completedCount": len(completed_after),
                    "unlockedScenarioIds": _unlocked_scenario_ids(completed_after),
                    "nextScenarioId": _next_scenario_id(completed_after),
                    "unlockedWorldIds": [DEFAULT_WORLD_ID],
                },
            }

        role_bonus = role["signatureAction"] if use_signature_action else None
        synergy_bonus = 4 if role["synergyTag"] in choice.get("tags", []) else 0
        score = _clamp(int(choice["score"]) + synergy_bonus + (role_bonus["scoreBonus"] if role_bonus else 0), 0, 100)
        xp_awarded = int(choice["xp"]) + (role_bonus["xpBonus"] if role_bonus else 0) + (2 if role["synergyTag"] in choice.get("tags", []) else 0)

        stats_delta = {**DEFAULT_STATS, **choice.get("stats", {})}
        if role_bonus:
            stats_delta[role["focusStat"]] = stats_delta.get(role["focusStat"], 0) + int(role_bonus["statBonus"])

        world_state = serialized["worldState"]
        world_before = _clone_json(world_state[scenario["worldId"]])
        world_delta = _build_world_delta(choice, role, use_signature_action)
        world_after = _apply_world_delta(world_before, world_delta)

        next_world_state = _clone_json(world_state)
        next_world_state[scenario["worldId"]] = world_after

        next_stats = _merge_stats(serialized["stats"])
        for stat_key, stat_value in stats_delta.items():
            next_stats[stat_key] += int(stat_value)

        next_total_xp = int(serialized["totalXp"]) + xp_awarded
        next_player_level = _player_level(next_total_xp)
        completed_after = completed_ids + [scenario_id]
        next_resume_scenario_id = _next_scenario_id(completed_after)

        await fetchrow(
            """
            INSERT INTO game_progress (
                member_id, scenario_id, world_id, role_id, choice_id, score, xp_awarded,
                used_signature_action, stats_delta, world_delta, world_state_after
            )
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb)
            RETURNING scenario_id
            """,
            member_id,
            scenario_id,
            scenario["worldId"],
            role_id,
            choice_id,
            score,
            xp_awarded,
            use_signature_action,
            json.dumps(stats_delta),
            json.dumps(world_delta),
            json.dumps(world_after),
        )

        await execute(
            """
            UPDATE game_profiles
            SET selected_role = $2,
                current_world_id = $3,
                resume_scenario_id = $4,
                settings = $5::jsonb,
                stats = $6::jsonb,
                world_state = $7::jsonb,
                total_xp = $8,
                player_level = $9,
                updated_at = NOW()
            WHERE member_id = $1::uuid
            """,
            member_id,
            role_id,
            scenario["worldId"],
            next_resume_scenario_id,
            json.dumps(serialized["settings"]),
            json.dumps(next_stats),
            json.dumps(next_world_state),
            next_total_xp,
            next_player_level,
        )

        updated_profile = await self.ensure_profile(member_id)
        return {
            "scenarioId": scenario_id,
            "alreadyCompleted": False,
            "outcome": {
                "choiceId": choice_id,
                "roleId": role_id,
                "usedSignatureAction": use_signature_action,
                "score": score,
                "xpAwarded": xp_awarded,
                "band": _outcome_band(score),
                "statsDelta": stats_delta,
                "worldDelta": world_delta,
                "worldStateAfter": world_after,
                "summary": choice["summary"],
                "immediate": choice["immediate"],
                "mediumTerm": choice["mediumTerm"],
            },
            "profile": _serialize_profile(updated_profile),
            "progress": {
                "completedScenarioIds": completed_after,
                "completedCount": len(completed_after),
                "unlockedScenarioIds": _unlocked_scenario_ids(completed_after),
                "nextScenarioId": next_resume_scenario_id,
                "unlockedWorldIds": [DEFAULT_WORLD_ID],
            },
        }

    async def record_event(
        self,
        *,
        member_id: str,
        email: str | None,
        event_type: str,
        payload: dict[str, Any],
        session_id: str | None,
    ) -> dict[str, Any]:
        has_consent, consent_id = await self.has_active_analytics_consent(member_id=member_id, email=email)
        if not has_consent:
            return {"accepted": False, "reason": "analytics_disabled"}

        await execute(
            """
            INSERT INTO game_events (id, member_id, session_id, event_type, payload)
            VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4::jsonb)
            """,
            member_id,
            session_id,
            event_type,
            json.dumps(payload or {}),
        )
        return {"accepted": True, "analyticsConsentId": consent_id}


game_service = GameService()

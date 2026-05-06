"""Tests für CRM-Sync: CrmFacade-Methoden mit gemocktem CiviCRMService."""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


from app.services.crm_service import CrmFacade


def _run(coro):
    """Hilfsfunktion: Coroutine in synchronem Test ausführen."""
    return asyncio.run(coro)


def _make_facade() -> tuple[CrmFacade, MagicMock]:
    """CrmFacade + gemockter CiviCRMService-Client."""
    facade = CrmFacade()
    # Config-Objekt direkt überschreiben (lru_cache umgehen)
    facade.config = MagicMock()
    facade.config.enabled = True
    facade.config.membership_type_map = {"standard": 1, "foerder": 2}
    facade.config.group_map = {"newsletter": "Newsletter"}

    mock_civi = MagicMock()
    mock_civi._request = AsyncMock()
    mock_civi.close = AsyncMock()
    mock_civi.create_contact = AsyncMock()
    mock_civi.update_contact = AsyncMock(return_value=True)
    mock_civi.get_membership = AsyncMock()
    mock_civi.create_membership = AsyncMock()
    mock_civi.create_contribution = AsyncMock()
    return facade, mock_civi


class TestFindContactByEmail:
    def test_findet_bestehenden_kontakt(self):
        facade, mock_civi = _make_facade()
        mock_civi._request.return_value = {
            "values": [
                {
                    "id": 42,
                    "first_name": "Max",
                    "last_name": "Mustermann",
                    "email_primary.email": "max@example.at",
                }
            ]
        }
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(facade.find_contact_by_email("max@example.at"))
        assert result is not None
        assert result["id"] == 42
        assert result["email"] == "max@example.at"
        mock_civi.close.assert_called()

    def test_gibt_none_wenn_nicht_gefunden(self):
        facade, mock_civi = _make_facade()
        mock_civi._request.return_value = {"values": []}
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(facade.find_contact_by_email("unbekannt@example.at"))
        assert result is None

    def test_gibt_none_wenn_crm_deaktiviert(self):
        facade, _ = _make_facade()
        with patch.object(facade, "_client", return_value=None):
            result = _run(facade.find_contact_by_email("any@example.at"))
        assert result is None

    def test_gibt_none_bei_request_fehler(self):
        facade, mock_civi = _make_facade()
        mock_civi._request.side_effect = Exception("CiviCRM nicht erreichbar")
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(facade.find_contact_by_email("err@example.at"))
        assert result is None
        # close() muss auch bei Fehler aufgerufen werden
        mock_civi.close.assert_called()


class TestUpsertContact:
    def test_erstellt_neuen_kontakt(self):
        facade, mock_civi = _make_facade()
        # find_contact_by_email → kein Treffer
        mock_civi._request.return_value = {"values": []}
        mock_civi.create_contact.return_value = {
            "id": 99,
            "first_name": "Erika",
            "email_primary.email": "erika@example.at",
        }
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.upsert_contact(
                    email="erika@example.at",
                    first_name="Erika",
                    last_name="Musterfrau",
                )
            )
        mock_civi.create_contact.assert_called_once()
        assert result is not None
        assert result["id"] == 99

    def test_aktualisiert_bestehenden_kontakt(self):
        facade, mock_civi = _make_facade()
        mock_civi._request.return_value = {
            "values": [
                {"id": 42, "first_name": "Max", "email_primary.email": "max@example.at"}
            ]
        }
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.upsert_contact(
                    email="max@example.at",
                    first_name="Max",
                    last_name="Mustermann",
                )
            )
        mock_civi.update_contact.assert_called_once()
        mock_civi.create_contact.assert_not_called()
        assert result is not None
        assert result["id"] == 42

    def test_gibt_none_wenn_crm_deaktiviert(self):
        facade, _ = _make_facade()
        with patch.object(facade, "_client", return_value=None):
            result = _run(
                facade.upsert_contact(
                    email="any@example.at",
                    first_name="X",
                    last_name="Y",
                )
            )
        assert result is None

    def test_gibt_none_bei_ausnahme(self):
        facade, mock_civi = _make_facade()
        mock_civi._request.side_effect = Exception("Netzwerkfehler")
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.upsert_contact(
                    email="err@example.at",
                    first_name="Err",
                    last_name="Test",
                )
            )
        assert result is None


class TestEnsureMembership:
    def test_erstellt_mitgliedschaft_wenn_keine_vorhanden(self):
        facade, mock_civi = _make_facade()
        mock_civi.get_membership.return_value = None
        mock_civi.create_membership.return_value = {"id": 77, "membership_type_id": 1}
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.ensure_membership(contact_id=42, membership_key="standard")
            )
        mock_civi.create_membership.assert_called_once_with(42, 1)
        assert result is not None
        assert result["id"] == 77

    def test_gibt_bestehende_mitgliedschaft_zurueck(self):
        facade, mock_civi = _make_facade()
        existing = {"id": 55, "status_id:name": "Current"}
        mock_civi.get_membership.return_value = existing
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.ensure_membership(contact_id=42, membership_key="standard")
            )
        mock_civi.create_membership.assert_not_called()
        assert result["id"] == 55

    def test_gibt_none_fuer_unbekannten_membership_key(self):
        facade, mock_civi = _make_facade()
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.ensure_membership(contact_id=42, membership_key="unbekannt")
            )
        assert result is None
        mock_civi.create_membership.assert_not_called()
        mock_civi.close.assert_called_once()

    def test_gibt_none_wenn_crm_deaktiviert(self):
        facade, _ = _make_facade()
        with patch.object(facade, "_client", return_value=None):
            result = _run(
                facade.ensure_membership(contact_id=42, membership_key="standard")
            )
        assert result is None


class TestCreateContribution:
    def test_erstellt_contribution_erfolgreich(self):
        facade, mock_civi = _make_facade()
        mock_civi.create_contribution.return_value = {"id": 101, "total_amount": 50.0}
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.create_contribution(
                    contact_id=42,
                    amount=50.0,
                    source="Webspende",
                )
            )
        mock_civi.create_contribution.assert_called_once_with(
            42, 50.0, source="Webspende"
        )
        assert result is not None
        assert result["id"] == 101

    def test_gibt_none_wenn_crm_deaktiviert(self):
        facade, _ = _make_facade()
        with patch.object(facade, "_client", return_value=None):
            result = _run(
                facade.create_contribution(
                    contact_id=42,
                    amount=50.0,
                    source="test",
                )
            )
        assert result is None

    def test_gibt_none_bei_ausnahme(self):
        facade, mock_civi = _make_facade()
        mock_civi.create_contribution.side_effect = Exception("CiviCRM Fehler")
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.create_contribution(
                    contact_id=42,
                    amount=50.0,
                    source="test",
                )
            )
        assert result is None
        mock_civi.close.assert_called()


class TestUpdateContribution:
    def test_update_contribution_success(self):
        facade, mock_civi = _make_facade()
        mock_civi.update_contribution = AsyncMock(return_value=True)
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.update_contribution(
                    contribution_id=55,
                    values={"contribution_status_id:name": "Completed"},
                )
            )
        assert result is True
        mock_civi.update_contribution.assert_called_once_with(
            55, {"contribution_status_id:name": "Completed"}
        )

    def test_update_contribution_returns_false_on_error(self):
        facade, mock_civi = _make_facade()
        mock_civi.update_contribution = AsyncMock(side_effect=Exception("boom"))
        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.update_contribution(
                    contribution_id=55,
                    values={"contribution_status_id:name": "Failed"},
                )
            )
        assert result is False
        mock_civi.close.assert_called_once()


class TestNewsletterSubscription:
    def test_set_newsletter_subscription_subscribe_true(self):
        facade, mock_civi = _make_facade()
        mock_civi.subscribe_to_newsletter = AsyncMock(return_value=True)
        mock_civi.unsubscribe_from_newsletter = AsyncMock(return_value=True)

        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.set_newsletter_subscription(contact_id=42, subscribe=True)
            )

        assert result is True
        mock_civi.subscribe_to_newsletter.assert_called_once_with(
            42, group_name="Newsletter"
        )
        mock_civi.unsubscribe_from_newsletter.assert_not_called()

    def test_set_newsletter_subscription_subscribe_false(self):
        facade, mock_civi = _make_facade()
        mock_civi.subscribe_to_newsletter = AsyncMock(return_value=True)
        mock_civi.unsubscribe_from_newsletter = AsyncMock(return_value=True)

        with patch.object(facade, "_client", return_value=mock_civi):
            result = _run(
                facade.set_newsletter_subscription(contact_id=42, subscribe=False)
            )

        assert result is True
        mock_civi.unsubscribe_from_newsletter.assert_called_once_with(
            42, group_name="Newsletter"
        )
        mock_civi.subscribe_to_newsletter.assert_not_called()

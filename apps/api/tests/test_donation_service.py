"""Tests für DonationService-Kontext und E-Mail-Versand."""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, patch

from app.services.donation_service import donation_service


def _run(coro):
    return asyncio.run(coro)


def test_record_successful_donation_uses_nested_template_context():
    inserted_row = {
        "id": 7,
        "donor_name": "Erika Musterfrau",
        "donor_email": "erika@example.at",
        "amount": 50.0,
        "currency": "EUR",
        "donation_type": "one_time",
        "status": "paid",
        "donation_date": "2026-04-11",
        "civicrm_contribution_id": None,
    }

    with (
        patch(
            "app.services.donation_service._resolve_contact_id",
            new=AsyncMock(return_value=123),
        ),
        patch(
            "app.services.donation_service.fetchrow",
            new=AsyncMock(return_value=inserted_row),
        ),
        patch(
            "app.services.donation_service.execute", new=AsyncMock(return_value=None)
        ),
        patch(
            "app.services.donation_service.crm_service.create_contribution",
            new=AsyncMock(return_value=None),
        ),
        patch(
            "app.services.donation_service.mail_service.send_template",
            new=AsyncMock(return_value=True),
        ) as mock_mail,
    ):
        result = _run(
            donation_service.record_successful_donation(
                donor_email="erika@example.at",
                donor_name="Erika Musterfrau",
                amount=50.0,
                currency="EUR",
                donation_type="one_time",
                source="Website",
            )
        )

    assert result["id"] == 7
    mock_mail.assert_called_once()
    context = mock_mail.call_args.kwargs["context"]
    assert context["contact"]["first_name"] == "Erika"
    assert context["contact"]["last_name"] == "Musterfrau"
    assert context["donation"]["amount"] == "50.00"
    assert context["donation"]["receipt_eligible"] is True

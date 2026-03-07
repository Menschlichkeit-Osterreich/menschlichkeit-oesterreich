"""
CiviCRM-Service – Menschlichkeit Österreich
Vollständige Integration mit der CiviCRM REST API v4
"""

from __future__ import annotations
import logging
import httpx
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class CiviCRMService:
    """
    Kapselt alle Interaktionen mit der CiviCRM REST API v4.
    Verwendet httpx für asynchrone HTTP-Anfragen.
    """

    def __init__(self, base_url: str, site_key: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.site_key = site_key
        self.api_key = api_key
        self._client = httpx.AsyncClient(timeout=30.0)

    async def _request(
        self,
        entity: str,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Führt eine generische CiviCRM API v4-Anfrage aus."""
        url = f"{self.base_url}/civicrm/ajax/api4/{entity}/{action}"
        payload = {
            "params": params,
            "userID": 1,
        }
        headers = {
            "X-Civi-Auth": f"Bearer {self.api_key}",
            "X-Civi-Key": self.site_key,
            "Content-Type": "application/json",
        }
        try:
            response = await self._client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            if data.get("error_code"):
                raise ValueError(f"CiviCRM API Fehler: {data.get('error_message')}")
            return data
        except httpx.HTTPStatusError as e:
            logger.error("CiviCRM HTTP-Fehler: %s – %s", e.response.status_code, e.response.text)
            raise
        except Exception as e:
            logger.error("CiviCRM Anfragefehler: %s", e)
            raise

    # ── Kontakte ──────────────────────────────────────────────────────────────

    async def get_contact(self, contact_id: int) -> Optional[Dict[str, Any]]:
        """Ruft einen einzelnen Kontakt anhand seiner ID ab."""
        result = await self._request("Contact", "get", {
            "where": [["id", "=", contact_id]],
            "select": ["id", "first_name", "last_name", "email_primary.email", "phone_primary.phone"],
            "limit": 1
        })
        values = result.get("values", [])
        if values:
            contact = values[0]
            contact["email"] = contact.get("email_primary.email", "")
            return contact
        return None

    async def get_contacts_by_group(self, group_name: str) -> List[Dict[str, Any]]:
        """Ruft alle Kontakte einer bestimmten Gruppe ab."""
        result = await self._request("Contact", "get", {
            "join": [["GroupContact AS gc", "INNER", ["gc.contact_id", "=", "id"]]],
            "where": [
                ["gc.group_id.title", "=", group_name],
                ["gc.status", "=", "Added"],
                ["is_deleted", "=", False],
            ],
            "select": ["id", "first_name", "last_name", "email_primary.email"],
            "limit": 5000
        })
        contacts = result.get("values", [])
        for c in contacts:
            c["email"] = c.get("email_primary.email", "")
        return contacts

    async def get_contacts_by_donation_period(self, years: int = 1) -> List[Dict[str, Any]]:
        """Ruft Kontakte ab, die innerhalb der letzten N Jahre gespendet haben."""
        since_date = datetime.now().replace(year=datetime.now().year - years).strftime("%Y-%m-%d")
        result = await self._request("Contact", "get", {
            "join": [["Contribution AS c", "INNER", ["c.contact_id", "=", "id"]]],
            "where": [
                ["c.receive_date", ">=", since_date],
                ["c.contribution_status_id:name", "=", "Completed"],
                ["is_deleted", "=", False],
            ],
            "select": ["id", "first_name", "last_name", "email_primary.email"],
            "groupBy": ["id"],
            "limit": 5000
        })
        contacts = result.get("values", [])
        for c in contacts:
            c["email"] = c.get("email_primary.email", "")
        return contacts

    async def create_contact(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt einen neuen Kontakt in CiviCRM."""
        result = await self._request("Contact", "create", {
            "values": {
                "contact_type": "Individual",
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "email_primary.email": data["email"],
                "phone_primary.phone": data.get("phone", ""),
                "address_primary.street_address": data.get("address", ""),
                "address_primary.postal_code": data.get("postal_code", ""),
                "address_primary.city": data.get("city", ""),
                "address_primary.country_id:name": data.get("country", "Austria"),
            }
        })
        return result.get("values", [{}])[0]

    async def update_contact(self, contact_id: int, data: Dict[str, Any]) -> bool:
        """Aktualisiert einen bestehenden Kontakt."""
        await self._request("Contact", "update", {
            "where": [["id", "=", contact_id]],
            "values": data
        })
        return True

    # ── Mitgliedschaften ──────────────────────────────────────────────────────

    async def create_membership(self, contact_id: int, membership_type_id: int) -> Dict[str, Any]:
        """Erstellt eine neue Mitgliedschaft für einen Kontakt."""
        result = await self._request("Membership", "create", {
            "values": {
                "contact_id": contact_id,
                "membership_type_id": membership_type_id,
                "status_id:name": "New",
                "join_date": datetime.now().strftime("%Y-%m-%d"),
                "start_date": datetime.now().strftime("%Y-%m-%d"),
            }
        })
        return result.get("values", [{}])[0]

    async def get_membership(self, contact_id: int) -> Optional[Dict[str, Any]]:
        """Ruft die aktive Mitgliedschaft eines Kontakts ab."""
        result = await self._request("Membership", "get", {
            "where": [
                ["contact_id", "=", contact_id],
                ["status_id:name", "IN", ["New", "Current", "Grace"]],
            ],
            "select": ["id", "membership_type_id.name", "start_date", "end_date", "status_id:name"],
            "limit": 1
        })
        values = result.get("values", [])
        return values[0] if values else None

    async def renew_membership(self, membership_id: int) -> bool:
        """Verlängert eine bestehende Mitgliedschaft um ein Jahr."""
        membership = await self._request("Membership", "get", {
            "where": [["id", "=", membership_id]],
            "select": ["end_date"],
            "limit": 1
        })
        if not membership.get("values"):
            return False

        current_end = datetime.fromisoformat(membership["values"][0]["end_date"])
        new_end = current_end.replace(year=current_end.year + 1)

        await self._request("Membership", "update", {
            "where": [["id", "=", membership_id]],
            "values": {
                "end_date": new_end.strftime("%Y-%m-%d"),
                "status_id:name": "Current",
            }
        })
        return True

    # ── Spenden / Contributions ───────────────────────────────────────────────

    async def create_contribution(self, contact_id: int, amount: float, source: str = "Website") -> Dict[str, Any]:
        """Erfasst eine neue Spende in CiviCRM."""
        result = await self._request("Contribution", "create", {
            "values": {
                "contact_id": contact_id,
                "total_amount": amount,
                "financial_type_id:name": "Donation",
                "contribution_status_id:name": "Completed",
                "receive_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "source": source,
            }
        })
        return result.get("values", [{}])[0]

    async def get_total_donations_by_contact(self, contact_id: int) -> float:
        """Berechnet die Gesamtspenden eines Kontakts."""
        result = await self._request("Contribution", "get", {
            "where": [
                ["contact_id", "=", contact_id],
                ["contribution_status_id:name", "=", "Completed"],
                ["financial_type_id:name", "=", "Donation"],
            ],
            "select": ["SUM(total_amount) AS total"],
            "limit": 1
        })
        values = result.get("values", [{}])
        return float(values[0].get("total", 0.0)) if values else 0.0

    # ── Newsletter-Gruppen ────────────────────────────────────────────────────

    async def subscribe_to_newsletter(self, contact_id: int, group_name: str = "Newsletter") -> bool:
        """Fügt einen Kontakt zur Newsletter-Gruppe hinzu."""
        # Zuerst Gruppen-ID ermitteln
        group_result = await self._request("Group", "get", {
            "where": [["title", "=", group_name]],
            "select": ["id"],
            "limit": 1
        })
        groups = group_result.get("values", [])
        if not groups:
            logger.warning("Newsletter-Gruppe '%s' nicht gefunden.", group_name)
            return False

        group_id = groups[0]["id"]
        await self._request("GroupContact", "create", {
            "values": {
                "group_id": group_id,
                "contact_id": contact_id,
                "status": "Added",
            }
        })
        return True

    async def unsubscribe_from_newsletter(self, contact_id: int, group_name: str = "Newsletter") -> bool:
        """Entfernt einen Kontakt aus der Newsletter-Gruppe."""
        group_result = await self._request("Group", "get", {
            "where": [["title", "=", group_name]],
            "select": ["id"],
            "limit": 1
        })
        groups = group_result.get("values", [])
        if not groups:
            return False

        group_id = groups[0]["id"]
        await self._request("GroupContact", "update", {
            "where": [
                ["group_id", "=", group_id],
                ["contact_id", "=", contact_id],
            ],
            "values": {"status": "Removed"}
        })
        return True

    async def close(self):
        """Schließt den HTTP-Client."""
        await self._client.aclose()

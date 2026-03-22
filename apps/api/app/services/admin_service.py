from __future__ import annotations

"""
AdminService — CRM-Cockpit Business-Logik
==========================================
Vier öffentliche Operationen für das Admin-CRM-Cockpit.
Nutzt CrmSyncService für alle lokalen Datenbankabfragen.
"""

import logging
from typing import Any

from fastapi import HTTPException, status

from ..db import execute, fetch, fetchval
from .crm_service import crm_service
from .crm_sync_service import crm_sync_service, _iso
from .utils import normalize_email

logger = logging.getLogger("menschlichkeit.admin_crm.admin")


class AdminService:

    async def list_contacts(
        self,
        *,
        search: str | None,
        page: int,
        page_size: int,
    ) -> dict[str, Any]:
        warnings: list[str] = []
        crm_reachable = True
        contacts: list[dict[str, Any]] = []
        client = crm_sync_service._client()

        if client is not None:
            try:
                contacts = await client.list_contacts(limit=5000)
            except Exception as exc:
                logger.warning("admin_crm_contacts_unavailable | error=%s", exc)
                crm_reachable = False
                warnings.append(
                    "CiviCRM ist derzeit nicht erreichbar. Das Cockpit zeigt nur lokal verfügbare Plattformdaten."
                )
            finally:
                await client.close()
        else:
            crm_reachable = False
            warnings.append("CiviCRM ist nicht konfiguriert. Das Cockpit arbeitet im lokalen Fallback-Modus.")

        if contacts:
            filtered = [c for c in contacts if crm_sync_service._matches_search(c, search)]
            total = len(filtered)
            offset = (page - 1) * page_size
            page_contacts = filtered[offset:offset + page_size]
            context = await crm_sync_service.load_local_context(
                contact_ids=[int(c["id"]) for c in page_contacts],
                emails=[str(c.get("email") or "") for c in page_contacts],
            )
            items = [
                crm_sync_service.build_contact_summary(contact=c, context=context, crm_reachable=crm_reachable)
                for c in page_contacts
            ]
            return {
                "items": items,
                "pagination": {"page": page, "pageSize": page_size, "total": total},
                "meta": {"crmReachable": crm_reachable, "warnings": warnings},
            }

        search_sql = ""
        params: list[Any] = []
        if search:
            params.append(f"%{search.lower()}%")
            search_sql = (
                "AND (LOWER(vorname) LIKE $1 OR LOWER(nachname) LIKE $1 OR LOWER(email) LIKE $1)"
            )
        count_sql = f"""
            SELECT COUNT(*)
            FROM members
            WHERE civicrm_contact_id IS NOT NULL
            {search_sql}
        """
        total = int(await fetchval(count_sql, *params) or 0)

        params.extend([page_size, (page - 1) * page_size])
        rows = await fetch(
            f"""
            SELECT id::text AS id, civicrm_contact_id, vorname, nachname, email, phone,
                   rolle, mitgliedschaft_typ, status, updated_at
            FROM members
            WHERE civicrm_contact_id IS NOT NULL
            {search_sql}
            ORDER BY nachname ASC, vorname ASC
            LIMIT ${len(params) - 1} OFFSET ${len(params)}
            """,
            *params,
        )
        fallback_contacts = [
            {
                "id": row["civicrm_contact_id"],
                "display_name": " ".join(part for part in [row["vorname"], row["nachname"]] if part).strip(),
                "first_name": row["vorname"],
                "last_name": row["nachname"],
                "email": row["email"],
                "phone": row["phone"],
                "city": "",
                "postal_code": "",
            }
            for row in rows
        ]
        context = await crm_sync_service.load_local_context(
            contact_ids=[int(c["id"]) for c in fallback_contacts],
            emails=[str(c.get("email") or "") for c in fallback_contacts],
        )
        items = [
            crm_sync_service.build_contact_summary(contact=c, context=context, crm_reachable=False)
            for c in fallback_contacts
        ]
        return {
            "items": items,
            "pagination": {"page": page, "pageSize": page_size, "total": total},
            "meta": {"crmReachable": False, "warnings": warnings},
        }

    async def get_contact_detail(self, *, contact_id: int) -> dict[str, Any]:
        warnings: list[str] = []
        crm_reachable = True
        contact: dict[str, Any] | None = None
        memberships: list[dict[str, Any]] = []
        civicrm_contributions: list[dict[str, Any]] = []
        civicrm_events: list[dict[str, Any]] = []
        client = crm_sync_service._client()

        if client is not None:
            try:
                contact = await client.get_contact_detail(contact_id)
                if contact:
                    memberships = await client.get_memberships_for_contact(contact_id)
                    civicrm_contributions = await client.get_contributions_for_contact(contact_id)
                    civicrm_events = await client.get_event_participations_for_contact(contact_id)
            except Exception as exc:
                logger.warning("admin_crm_contact_detail_unavailable | contact_id=%s | error=%s", contact_id, exc)
                crm_reachable = False
                warnings.append(
                    "CiviCRM antwortet derzeit nicht vollständig. Lokale Plattformdaten werden dennoch angezeigt."
                )
            finally:
                await client.close()
        else:
            crm_reachable = False
            warnings.append("CiviCRM ist nicht konfiguriert. Es werden nur lokale Plattformdaten angezeigt.")

        local_member = await crm_sync_service.get_local_member(
            contact_id=contact_id, email=contact.get("email") if contact else None
        )
        if not contact and local_member:
            contact = {
                "id": contact_id,
                "display_name": " ".join(
                    part for part in [local_member.get("vorname"), local_member.get("nachname")] if part
                ).strip(),
                "first_name": local_member.get("vorname"),
                "last_name": local_member.get("nachname"),
                "email": local_member.get("email"),
                "phone": local_member.get("phone"),
                "city": "",
                "postal_code": "",
                "street_address": "",
            }

        if not contact:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kontakt nicht gefunden")

        email = contact.get("email") or (local_member.get("email") if local_member else None)
        newsletter = await crm_sync_service.get_newsletter_state(contact_id=contact_id, email=email)
        invoices = await crm_sync_service.get_local_invoices(contact_id=contact_id)
        platform_donations = await crm_sync_service.get_local_donations(contact_id=contact_id)
        consents = await crm_sync_service.get_consents(
            member_id=local_member.get("id") if local_member else None,
            email=email,
        )
        local_events = await crm_sync_service.get_local_events(
            member_id=local_member.get("id") if local_member else None
        )
        failure_count = await crm_sync_service.count_open_issues(
            contact_id=contact_id,
            member_id=local_member.get("id") if local_member else None,
        )

        contributions = [
            {
                "id": item.get("id"),
                "amount": float(item.get("total_amount") or 0),
                "currency": item.get("currency") or "EUR",
                "status": item.get("contribution_status_id:name"),
                "kind": item.get("financial_type_id:name"),
                "date": item.get("receive_date"),
                "source": item.get("source"),
                "transactionId": item.get("trxn_id"),
                "sourceSystem": "civicrm",
            }
            for item in civicrm_contributions
        ]
        contributions.extend(platform_donations)
        contributions.sort(key=lambda item: item.get("date") or "", reverse=True)

        events = [
            {
                "id": item.get("id"),
                "title": item.get("event_id.title"),
                "category": item.get("event_id.event_type_id:name"),
                "status": item.get("status_id:name"),
                "role": item.get("role_id:name"),
                "startDate": item.get("event_id.start_date"),
                "endDate": item.get("event_id.end_date"),
                "sourceSystem": "civicrm",
            }
            for item in civicrm_events
        ]
        events.extend(local_events)
        events.sort(key=lambda item: item.get("startDate") or "", reverse=True)

        normalized_memberships = [
            {
                "id": item.get("id"),
                "membershipType": item.get("membership_type_id.name"),
                "status": item.get("status_id:name"),
                "joinDate": item.get("join_date"),
                "startDate": item.get("start_date"),
                "endDate": item.get("end_date"),
                "source": item.get("source") or "civicrm",
            }
            for item in memberships
        ]

        sync_state = "ok"
        if not crm_reachable:
            sync_state = "degraded"
        elif failure_count:
            sync_state = "attention"

        profile = {
            "contactId": contact_id,
            "displayName": contact.get("display_name") or " ".join(
                part for part in [contact.get("first_name"), contact.get("last_name")] if part
            ).strip(),
            "firstName": contact.get("first_name") or "",
            "lastName": contact.get("last_name") or "",
            "email": email or "",
            "phone": contact.get("phone") or local_member.get("phone") if local_member else "",
            "streetAddress": contact.get("street_address") or "",
            "postalCode": contact.get("postal_code") or "",
            "city": contact.get("city") or "",
            "memberId": local_member.get("id") if local_member else None,
            "memberRole": local_member.get("rolle") if local_member else None,
            "memberStatus": local_member.get("status") if local_member else None,
            "membershipType": local_member.get("mitgliedschaft_typ") if local_member else None,
            "joinedAt": _iso(local_member.get("joined_at")) if local_member else None,
            "openInCiviUrl": crm_sync_service._open_in_civi_url(contact_id),
        }

        return {
            "profile": profile,
            "memberships": normalized_memberships,
            "contributions": contributions,
            "invoices": invoices,
            "consents": consents,
            "events": events,
            "newsletter": newsletter or {
                "status": "not_subscribed",
                "confirmedAt": None,
                "unsubscribedAt": None,
                "updatedAt": None,
            },
            "sync": {
                "crmReachable": crm_reachable,
                "hasLinkedMember": local_member is not None,
                "openIssuesCount": failure_count,
                "state": sync_state,
                "warnings": warnings,
                "lastLocalUpdateAt": _iso(local_member.get("updated_at")) if local_member else None,
            },
        }

    async def update_contact(self, *, contact_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        client = crm_sync_service._client()
        if client is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="CiviCRM ist derzeit nicht verfügbar",
            )

        current: dict[str, Any] | None = None
        try:
            current = await client.get_contact_detail(contact_id)
            if not current:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kontakt nicht gefunden")

            email = normalize_email(payload.get("email") or current.get("email") or "")
            values: dict[str, Any] = {}
            if payload.get("first_name") is not None:
                values["first_name"] = payload["first_name"]
            if payload.get("last_name") is not None:
                values["last_name"] = payload["last_name"]
            if email:
                values["email_primary.email"] = email
            if payload.get("phone") is not None:
                values["phone_primary.phone"] = payload["phone"]
            if payload.get("street_address") is not None:
                values["address_primary.street_address"] = payload["street_address"]
            if payload.get("postal_code") is not None:
                values["address_primary.postal_code"] = payload["postal_code"]
            if payload.get("city") is not None:
                values["address_primary.city"] = payload["city"]

            if values:
                await client.update_contact(contact_id, values)
        finally:
            await client.close()

        email = normalize_email(payload.get("email") or current.get("email") or "")
        local_member = await crm_sync_service.get_local_member(contact_id=contact_id, email=email)
        if local_member:
            await execute(
                """
                UPDATE members
                SET email = $2,
                    vorname = COALESCE($3, vorname),
                    nachname = COALESCE($4, nachname),
                    phone = COALESCE($5, phone),
                    updated_at = NOW()
                WHERE id = $1::uuid
                """,
                local_member["id"],
                email,
                payload.get("first_name"),
                payload.get("last_name"),
                payload.get("phone"),
            )

        from ..db import fetchrow
        existing_newsletter = await fetchrow(
            """
            SELECT id::text AS id
            FROM newsletter_subscriptions
            WHERE civicrm_contact_id = $1 OR LOWER(email) = LOWER($2)
            LIMIT 1
            """,
            contact_id,
            email,
        )
        if existing_newsletter and payload.get("newsletter_status") is None:
            await execute(
                """
                UPDATE newsletter_subscriptions
                SET email = $1,
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    updated_at = NOW(),
                    civicrm_contact_id = $4
                WHERE id = $5::uuid
                """,
                email,
                payload.get("first_name"),
                payload.get("last_name"),
                contact_id,
                existing_newsletter["id"],
            )

        if payload.get("newsletter_status"):
            await crm_sync_service.persist_newsletter_state(
                contact_id=contact_id,
                email=email,
                first_name=payload.get("first_name") or current.get("first_name"),
                last_name=payload.get("last_name") or current.get("last_name"),
                newsletter_status=payload["newsletter_status"],
            )

        return await self.get_contact_detail(contact_id=contact_id)

    async def create_membership(self, *, contact_id: int, membership_key: str) -> dict[str, Any]:
        membership = await crm_service.ensure_membership(contact_id=contact_id, membership_key=membership_key)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Mitgliedschaft konnte nicht angelegt werden. "
                    "Bitte prüfen Sie die CiviCRM-Mappings für Membership-Typen."
                ),
            )

        local_member = await crm_sync_service.get_local_member(contact_id=contact_id, email=None)
        if local_member:
            await execute(
                """
                UPDATE members
                SET mitgliedschaft_typ = $2, updated_at = NOW()
                WHERE id = $1::uuid
                """,
                local_member["id"],
                membership_key,
            )

        return {
            "id": membership.get("id"),
            "membershipType": membership.get("membership_type_id.name"),
            "status": membership.get("status_id:name"),
            "joinDate": membership.get("join_date"),
            "startDate": membership.get("start_date"),
            "endDate": membership.get("end_date"),
            "source": membership.get("source") or "civicrm",
        }


admin_service = AdminService()

from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any

from fastapi import HTTPException, status

from ..db import execute, fetch, fetchrow, fetchval
from ..services.crm_service import crm_service
from ..services.privacy_service import privacy_service
from ..services.utils import normalize_email

logger = logging.getLogger("menschlichkeit.admin_crm")


def _iso(value: date | datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def _to_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


class AdminCrmService:
    def _client(self):
        return crm_service._client()

    def _open_in_civi_url(self, contact_id: int | None) -> str | None:
        if not contact_id or not crm_service.config.base_url:
            return None
        return f"{crm_service.config.base_url.rstrip('/')}/civicrm/contact/view?reset=1&cid={contact_id}"

    @staticmethod
    def _matches_search(contact: dict[str, Any], search: str | None) -> bool:
        if not search:
            return True
        term = search.casefold()
        haystack = " ".join(
            str(contact.get(key) or "")
            for key in ("display_name", "first_name", "last_name", "email", "phone", "city", "postal_code")
        ).casefold()
        return term in haystack

    async def _load_local_context(
        self,
        *,
        contact_ids: list[int],
        emails: list[str],
    ) -> dict[str, dict[str, Any]]:
        normalized_emails = [email.lower() for email in emails if email]
        members_by_contact: dict[int, dict[str, Any]] = {}
        members_by_email: dict[str, dict[str, Any]] = {}
        invoice_summary: dict[int, dict[str, Any]] = {}
        donation_summary: dict[int, dict[str, Any]] = {}
        newsletter_by_contact: dict[int, dict[str, Any]] = {}
        newsletter_by_email: dict[str, dict[str, Any]] = {}
        issue_counts: dict[str, dict[str, Any]] = {}

        if contact_ids or normalized_emails:
            member_rows = await fetch(
                """
                SELECT id::text AS id, email, civicrm_contact_id, rolle, mitgliedschaft_typ, status,
                       vorname, nachname, phone, joined_at, updated_at
                FROM members
                WHERE (
                    COALESCE(array_length($1::int[], 1), 0) > 0 AND civicrm_contact_id = ANY($1::int[])
                ) OR (
                    COALESCE(array_length($2::text[], 1), 0) > 0 AND LOWER(email) = ANY($2::text[])
                )
                """,
                contact_ids,
                normalized_emails,
            )
            for row in member_rows:
                member = dict(row)
                if member.get("civicrm_contact_id") is not None:
                    members_by_contact[int(member["civicrm_contact_id"])] = member
                if member.get("email"):
                    members_by_email[str(member["email"]).lower()] = member

        if contact_ids:
            invoice_rows = await fetch(
                """
                SELECT civicrm_contact_id,
                       COUNT(*) FILTER (
                           WHERE LOWER(COALESCE(status, '')) NOT IN ('paid', 'bezahlt', 'completed')
                       ) AS open_invoices,
                       MAX(issue_date) AS latest_invoice_date
                FROM invoices
                WHERE civicrm_contact_id = ANY($1::int[])
                GROUP BY civicrm_contact_id
                """,
                contact_ids,
            )
            for row in invoice_rows:
                invoice_summary[int(row["civicrm_contact_id"])] = {
                    "openInvoices": int(row["open_invoices"] or 0),
                    "latestInvoiceDate": _iso(row["latest_invoice_date"]),
                }

            donation_rows = await fetch(
                """
                SELECT civicrm_contact_id,
                       COUNT(*) AS donation_count,
                       COALESCE(SUM(amount), 0) AS total_amount,
                       MAX(donation_date) AS latest_donation_date
                FROM donations
                WHERE civicrm_contact_id = ANY($1::int[])
                GROUP BY civicrm_contact_id
                """,
                contact_ids,
            )
            for row in donation_rows:
                donation_summary[int(row["civicrm_contact_id"])] = {
                    "donationCount": int(row["donation_count"] or 0),
                    "totalAmount": _to_float(row["total_amount"]),
                    "latestDonationDate": _iso(row["latest_donation_date"]),
                }

        if contact_ids or normalized_emails:
            newsletter_rows = await fetch(
                """
                SELECT DISTINCT ON (
                    COALESCE(civicrm_contact_id::text, LOWER(email))
                )
                    id::text AS id,
                    civicrm_contact_id,
                    LOWER(email) AS normalized_email,
                    email,
                    status,
                    confirmed_at,
                    unsubscribed_at,
                    source,
                    updated_at
                FROM newsletter_subscriptions
                WHERE (
                    COALESCE(array_length($1::int[], 1), 0) > 0 AND civicrm_contact_id = ANY($1::int[])
                ) OR (
                    COALESCE(array_length($2::text[], 1), 0) > 0 AND LOWER(email) = ANY($2::text[])
                )
                ORDER BY COALESCE(civicrm_contact_id::text, LOWER(email)), updated_at DESC
                """,
                contact_ids,
                normalized_emails,
            )
            for row in newsletter_rows:
                item = dict(row)
                if item.get("civicrm_contact_id") is not None:
                    newsletter_by_contact[int(item["civicrm_contact_id"])] = item
                if item.get("normalized_email"):
                    newsletter_by_email[str(item["normalized_email"])] = item

        entity_ids: list[str] = [str(contact_id) for contact_id in contact_ids]
        entity_ids.extend(member["id"] for member in members_by_contact.values())
        if entity_ids:
            failure_rows = await fetch(
                """
                SELECT entity_id, COUNT(*) AS open_issues, MAX(created_at) AS last_failure_at
                FROM integration_failures
                WHERE status = 'open' AND entity_id = ANY($1::text[])
                GROUP BY entity_id
                """,
                entity_ids,
            )
            for row in failure_rows:
                issue_counts[str(row["entity_id"])] = {
                    "openIssues": int(row["open_issues"] or 0),
                    "lastFailureAt": _iso(row["last_failure_at"]),
                }

        return {
            "membersByContact": members_by_contact,
            "membersByEmail": members_by_email,
            "invoiceSummary": invoice_summary,
            "donationSummary": donation_summary,
            "newsletterByContact": newsletter_by_contact,
            "newsletterByEmail": newsletter_by_email,
            "issueCounts": issue_counts,
        }

    def _summary_from_contact(
        self,
        *,
        contact: dict[str, Any],
        context: dict[str, dict[str, Any]],
        crm_reachable: bool,
    ) -> dict[str, Any]:
        contact_id = int(contact["id"])
        email = str(contact.get("email") or "").lower()
        member = context["membersByContact"].get(contact_id) or context["membersByEmail"].get(email)
        invoice_summary = context["invoiceSummary"].get(contact_id, {})
        donation_summary = context["donationSummary"].get(contact_id, {})
        newsletter = context["newsletterByContact"].get(contact_id) or context["newsletterByEmail"].get(email)

        open_issues = 0
        last_failure_at = None
        for entity_id in filter(None, [str(contact_id), member.get("id") if member else None]):
            issue = context["issueCounts"].get(entity_id)
            if not issue:
                continue
            open_issues += int(issue.get("openIssues") or 0)
            last_failure_at = issue.get("lastFailureAt") or last_failure_at

        sync_state = "ok"
        if not crm_reachable:
            sync_state = "degraded"
        elif open_issues:
            sync_state = "attention"

        return {
            "contactId": contact_id,
            "displayName": contact.get("display_name") or " ".join(
                part for part in [contact.get("first_name"), contact.get("last_name")] if part
            ).strip(),
            "firstName": contact.get("first_name") or member.get("vorname") if member else "",
            "lastName": contact.get("last_name") or member.get("nachname") if member else "",
            "email": contact.get("email") or member.get("email") if member else "",
            "phone": contact.get("phone") or member.get("phone") if member else "",
            "city": contact.get("city") or "",
            "postalCode": contact.get("postal_code") or "",
            "memberId": member.get("id") if member else None,
            "memberRole": member.get("rolle") if member else None,
            "memberStatus": member.get("status") if member else None,
            "membershipType": member.get("mitgliedschaft_typ") if member else None,
            "newsletterStatus": newsletter.get("status") if newsletter else "not_subscribed",
            "donationCount": donation_summary.get("donationCount", 0),
            "totalDonations": donation_summary.get("totalAmount", 0.0),
            "openInvoices": invoice_summary.get("openInvoices", 0),
            "lastInvoiceDate": invoice_summary.get("latestInvoiceDate"),
            "lastDonationDate": donation_summary.get("latestDonationDate"),
            "openIssuesCount": open_issues,
            "lastFailureAt": last_failure_at,
            "syncState": sync_state,
            "hasLinkedMember": member is not None,
            "openInCiviUrl": self._open_in_civi_url(contact_id),
        }

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
        client = self._client()

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
            filtered = [contact for contact in contacts if self._matches_search(contact, search)]
            total = len(filtered)
            offset = (page - 1) * page_size
            page_contacts = filtered[offset:offset + page_size]
            context = await self._load_local_context(
                contact_ids=[int(contact["id"]) for contact in page_contacts],
                emails=[str(contact.get("email") or "") for contact in page_contacts],
            )
            items = [
                self._summary_from_contact(contact=contact, context=context, crm_reachable=crm_reachable)
                for contact in page_contacts
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
        context = await self._load_local_context(
            contact_ids=[int(contact["id"]) for contact in fallback_contacts],
            emails=[str(contact.get("email") or "") for contact in fallback_contacts],
        )
        items = [
            self._summary_from_contact(contact=contact, context=context, crm_reachable=False)
            for contact in fallback_contacts
        ]
        return {
            "items": items,
            "pagination": {"page": page, "pageSize": page_size, "total": total},
            "meta": {"crmReachable": False, "warnings": warnings},
        }

    async def _get_local_member(self, *, contact_id: int, email: str | None) -> dict[str, Any] | None:
        row = await fetchrow(
            """
            SELECT id::text AS id, email, civicrm_contact_id, rolle, mitgliedschaft_typ, status,
                   vorname, nachname, phone, joined_at, updated_at
            FROM members
            WHERE civicrm_contact_id = $1
               OR ($2 IS NOT NULL AND LOWER(email) = LOWER($2))
            ORDER BY updated_at DESC NULLS LAST
            LIMIT 1
            """,
            contact_id,
            email,
        )
        return dict(row) if row else None

    async def _get_newsletter_state(self, *, contact_id: int, email: str | None) -> dict[str, Any] | None:
        row = await fetchrow(
            """
            SELECT id::text AS id, email, status, confirmed_at, unsubscribed_at, source, updated_at
            FROM newsletter_subscriptions
            WHERE civicrm_contact_id = $1
               OR ($2 IS NOT NULL AND LOWER(email) = LOWER($2))
            ORDER BY updated_at DESC
            LIMIT 1
            """,
            contact_id,
            email,
        )
        if not row:
            return None
        data = dict(row)
        data["confirmedAt"] = _iso(data.pop("confirmed_at", None))
        data["unsubscribedAt"] = _iso(data.pop("unsubscribed_at", None))
        data["updatedAt"] = _iso(data.pop("updated_at", None))
        return data

    async def _get_local_invoices(self, *, contact_id: int) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT id, invoice_number, total_amount, currency, status, invoice_type,
                   issue_date, due_date, paid_at, pdf_path
            FROM invoices
            WHERE civicrm_contact_id = $1
            ORDER BY issue_date DESC
            LIMIT 25
            """,
            contact_id,
        )
        return [
            {
                "id": row["id"],
                "invoiceNumber": row["invoice_number"],
                "totalAmount": _to_float(row["total_amount"]),
                "currency": row["currency"],
                "status": row["status"],
                "invoiceType": row["invoice_type"],
                "issueDate": _iso(row["issue_date"]),
                "dueDate": _iso(row["due_date"]),
                "paidAt": _iso(row["paid_at"]),
                "pdfPath": row["pdf_path"],
            }
            for row in rows
        ]

    async def _get_local_donations(self, *, contact_id: int) -> list[dict[str, Any]]:
        rows = await fetch(
            """
            SELECT id, amount, currency, donation_type, status, donation_date, source, civicrm_contribution_id
            FROM donations
            WHERE civicrm_contact_id = $1
            ORDER BY donation_date DESC
            LIMIT 25
            """,
            contact_id,
        )
        return [
            {
                "id": row["id"],
                "amount": _to_float(row["amount"]),
                "currency": row["currency"],
                "status": row["status"],
                "kind": row["donation_type"],
                "date": _iso(row["donation_date"]),
                "source": row["source"] or "platform",
                "sourceSystem": "platform",
                "civicrmContributionId": row["civicrm_contribution_id"],
            }
            for row in rows
        ]

    async def _get_local_events(self, *, member_id: str | None) -> list[dict[str, Any]]:
        if not member_id:
            return []
        rows = await fetch(
            """
            SELECT e.id::text AS event_id, e.titel, e.ort, e.start_datum, e.end_datum, e.kategorie,
                   r.status, r.created_at
            FROM event_rsvps r
            JOIN events e ON e.id = r.event_id
            WHERE r.user_id = $1::uuid
            ORDER BY e.start_datum DESC
            LIMIT 25
            """,
            member_id,
        )
        return [
            {
                "id": row["event_id"],
                "title": row["titel"],
                "location": row["ort"],
                "category": row["kategorie"],
                "status": row["status"],
                "startDate": _iso(row["start_datum"]),
                "endDate": _iso(row["end_datum"]),
                "sourceSystem": "platform",
            }
            for row in rows
        ]

    async def get_contact_detail(self, *, contact_id: int) -> dict[str, Any]:
        warnings: list[str] = []
        crm_reachable = True
        contact: dict[str, Any] | None = None
        memberships: list[dict[str, Any]] = []
        civicrm_contributions: list[dict[str, Any]] = []
        civicrm_events: list[dict[str, Any]] = []
        client = self._client()

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

        local_member = await self._get_local_member(contact_id=contact_id, email=contact.get("email") if contact else None)
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
        newsletter = await self._get_newsletter_state(contact_id=contact_id, email=email)
        invoices = await self._get_local_invoices(contact_id=contact_id)
        platform_donations = await self._get_local_donations(contact_id=contact_id)
        consents = await privacy_service.list_consents(
            member_id=local_member.get("id") if local_member else None,
            email=email,
        )
        local_events = await self._get_local_events(member_id=local_member.get("id") if local_member else None)

        failure_count = 0
        for entity_id in filter(None, [str(contact_id), local_member.get("id") if local_member else None]):
            failure_count += int(
                await fetchval(
                    "SELECT COUNT(*) FROM integration_failures WHERE status = 'open' AND entity_id = $1",
                    entity_id,
                )
                or 0
            )

        contributions = [
            {
                "id": item.get("id"),
                "amount": _to_float(item.get("total_amount")),
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
            "openInCiviUrl": self._open_in_civi_url(contact_id),
        }

        return {
            "profile": profile,
            "memberships": normalized_memberships,
            "contributions": contributions,
            "invoices": invoices,
            "consents": consents,
            "events": events,
            "newsletter": newsletter
            or {
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

    async def _persist_newsletter_state(
        self,
        *,
        contact_id: int,
        email: str,
        first_name: str | None,
        last_name: str | None,
        newsletter_status: str,
    ) -> None:
        existing = await fetchrow(
            """
            SELECT id::text AS id
            FROM newsletter_subscriptions
            WHERE civicrm_contact_id = $1 OR LOWER(email) = LOWER($2)
            ORDER BY updated_at DESC
            LIMIT 1
            """,
            contact_id,
            email,
        )
        normalized_status = newsletter_status.lower()
        if normalized_status in {"confirmed", "active", "subscribed"}:
            await crm_service.set_newsletter_subscription(contact_id=contact_id, subscribe=True)
            if existing:
                await execute(
                    """
                    UPDATE newsletter_subscriptions
                    SET email = $1,
                        first_name = COALESCE($2, first_name),
                        last_name = COALESCE($3, last_name),
                        status = 'confirmed',
                        confirmed_at = COALESCE(confirmed_at, NOW()),
                        unsubscribed_at = NULL,
                        civicrm_contact_id = $4,
                        updated_at = NOW()
                    WHERE id = $5::uuid
                    """,
                    email,
                    first_name,
                    last_name,
                    contact_id,
                    existing["id"],
                )
            else:
                await execute(
                    """
                    INSERT INTO newsletter_subscriptions (
                        email, first_name, last_name, status, confirmed_at, source, civicrm_contact_id
                    )
                    VALUES ($1, $2, $3, 'confirmed', NOW(), 'admin_crm_cockpit', $4)
                    """,
                    email,
                    first_name,
                    last_name,
                    contact_id,
                )
            return

        await crm_service.set_newsletter_subscription(contact_id=contact_id, subscribe=False)
        if existing:
            await execute(
                """
                UPDATE newsletter_subscriptions
                SET email = $1,
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    status = 'unsubscribed',
                    unsubscribed_at = NOW(),
                    civicrm_contact_id = $4,
                    updated_at = NOW()
                WHERE id = $5::uuid
                """,
                email,
                first_name,
                last_name,
                contact_id,
                existing["id"],
            )
        else:
            await execute(
                """
                INSERT INTO newsletter_subscriptions (
                    email, first_name, last_name, status, unsubscribed_at, source, civicrm_contact_id
                )
                VALUES ($1, $2, $3, 'unsubscribed', NOW(), 'admin_crm_cockpit', $4)
                """,
                email,
                first_name,
                last_name,
                contact_id,
            )

    async def update_contact(self, *, contact_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        client = self._client()
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
        local_member = await self._get_local_member(contact_id=contact_id, email=email)
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
            await self._persist_newsletter_state(
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

        local_member = await self._get_local_member(contact_id=contact_id, email=None)
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


admin_crm_service = AdminCrmService()

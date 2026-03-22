from __future__ import annotations

"""
CrmSyncService — Lokale Daten-Synchronisation und Kontext-Aufbau
================================================================
Enthält alle Hilfsmethoden zum Laden und Aggregieren lokaler DB-Daten
für die CRM-Cockpit-Ansichten. Wird von AdminService genutzt.
"""

import logging
from datetime import date, datetime
from typing import Any

from ..db import execute, fetch, fetchrow, fetchval
from .crm_service import crm_service
from .privacy_service import privacy_service

logger = logging.getLogger("menschlichkeit.admin_crm.sync")


def _iso(value: date | datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def _to_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


class CrmSyncService:

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

    async def load_local_context(
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

    def build_contact_summary(
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

    async def get_local_member(self, *, contact_id: int, email: str | None) -> dict[str, Any] | None:
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

    async def get_newsletter_state(self, *, contact_id: int, email: str | None) -> dict[str, Any] | None:
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

    async def get_local_invoices(self, *, contact_id: int) -> list[dict[str, Any]]:
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

    async def get_local_donations(self, *, contact_id: int) -> list[dict[str, Any]]:
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

    async def get_local_events(self, *, member_id: str | None) -> list[dict[str, Any]]:
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

    async def persist_newsletter_state(
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
                    email, first_name, last_name, contact_id, existing["id"],
                )
            else:
                await execute(
                    """
                    INSERT INTO newsletter_subscriptions (
                        email, first_name, last_name, status, confirmed_at, source, civicrm_contact_id
                    )
                    VALUES ($1, $2, $3, 'confirmed', NOW(), 'admin_crm_cockpit', $4)
                    """,
                    email, first_name, last_name, contact_id,
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
                email, first_name, last_name, contact_id, existing["id"],
            )
        else:
            await execute(
                """
                INSERT INTO newsletter_subscriptions (
                    email, first_name, last_name, status, unsubscribed_at, source, civicrm_contact_id
                )
                VALUES ($1, $2, $3, 'unsubscribed', NOW(), 'admin_crm_cockpit', $4)
                """,
                email, first_name, last_name, contact_id,
            )

    async def count_open_issues(self, *, contact_id: int, member_id: str | None) -> int:
        count = 0
        for entity_id in filter(None, [str(contact_id), member_id]):
            count += int(
                await fetchval(
                    "SELECT COUNT(*) FROM integration_failures WHERE status = 'open' AND entity_id = $1",
                    entity_id,
                )
                or 0
            )
        return count

    async def get_consents(self, *, member_id: str | None, email: str | None) -> list[dict[str, Any]]:
        return await privacy_service.list_consents(member_id=member_id, email=email)


crm_sync_service = CrmSyncService()

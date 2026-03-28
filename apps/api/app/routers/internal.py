from __future__ import annotations

import hashlib
import hmac
import json
import os

from fastapi import APIRouter, HTTPException, Request, status

from ..secrets_provider import get_secret

from ..db import execute, fetch, fetchrow
from ..schemas.internal import InternalMailSendRequest, InternalPaymentConfirmedRequest, InternalSyncMemberRequest
from ..services.crm_service import crm_service
from ..services.mail_service import mail_service
from ..services.member_service import member_service
from ..services.payment_service import payment_service

router = APIRouter()


async def _require_internal_signature(request: Request) -> None:
    raw_body = await request.body()
    bearer_token = request.headers.get("authorization", "").removeprefix("Bearer ").strip()
    api_key = request.headers.get("x-api-key", "").strip()
    shared_token = (
        get_secret("MOE_API_TOKEN", bsm_key="api/MOE_API_TOKEN").strip()
        or get_secret("N8N_API_KEY", bsm_key="api/N8N_API_KEY").strip()
        or get_secret("INTERNAL_API_TOKEN", bsm_key="api/INTERNAL_API_TOKEN").strip()
    )
    if shared_token and (bearer_token == shared_token or api_key == shared_token):
        return

    shared_secret = get_secret("N8N_WEBHOOK_SECRET", bsm_key="api/N8N_WEBHOOK_SECRET").strip() or get_secret("INTERNAL_API_SECRET", bsm_key="api/INTERNAL_API_SECRET").strip()
    if not shared_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Interne Signaturprüfung nicht konfiguriert")
    incoming = request.headers.get("x-webhook-signature") or request.headers.get("x-internal-signature")
    if not incoming:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Signatur fehlt")
    expected = hmac.new(shared_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, incoming):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige Signatur")


@router.post("/internal/crm/sync-member")
async def sync_member(body: InternalSyncMemberRequest, request: Request):
    await _require_internal_signature(request)
    member = await member_service.get_member_by_id(body.member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitglied nicht gefunden")
    contact = await crm_service.upsert_contact(
        email=member["email"],
        first_name=member.get("vorname") or "",
        last_name=member.get("nachname") or "",
        phone=member.get("phone"),
        source="internal_sync_member",
    )
    if contact and contact.get("id"):
        await execute(
            "UPDATE members SET civicrm_contact_id = $1, updated_at = NOW() WHERE id = $2::uuid",
            int(contact["id"]),
            body.member_id,
        )
        if body.membership_key:
            await crm_service.ensure_membership(contact_id=int(contact["id"]), membership_key=body.membership_key)
    return {"success": True, "data": {"contact": contact}}


@router.post("/internal/finance/payment-confirmed")
async def internal_payment_confirmed(body: InternalPaymentConfirmedRequest, request: Request):
    await _require_internal_signature(request)
    donation = await payment_service.record_successful_donation(
        donor_email=str(body.donor_email),
        donor_name=body.donor_name,
        amount=body.amount,
        currency=body.currency,
        donation_type=body.donation_type,
        source=body.source,
        gateway_charge_id=body.gateway_charge_id,
        civicrm_contact_id=body.civicrm_contact_id,
    )
    return {"success": True, "data": donation}


@router.post("/internal/finance/donation-received")
async def internal_donation_received(body: InternalPaymentConfirmedRequest, request: Request):
    return await internal_payment_confirmed(body, request)


@router.post("/internal/finance/invoice-created")
async def invoice_created(payload: dict, request: Request):
    await _require_internal_signature(request)
    return {"success": True, "data": payload}


@router.post("/internal/finance/dunning-run")
async def dunning_run(payload: dict, request: Request):
    await _require_internal_signature(request)
    return {"success": True, "data": payload}


@router.post("/internal/mail/send")
async def internal_mail_send(body: InternalMailSendRequest, request: Request):
    await _require_internal_signature(request)
    sent = await mail_service.send_template(
        template_id=body.template_id,
        recipient_email=str(body.recipient_email),
        context=body.context,
        subject_override=body.subject,
        entity_type=body.entity_type,
        entity_id=body.entity_id,
    )
    return {"success": sent}


@router.post("/contacts/create")
async def compat_create_contact(payload: dict):
    email = payload.get("email")
    first_name = payload.get("first_name") or payload.get("vorname") or ""
    last_name = payload.get("last_name") or payload.get("nachname") or ""
    if not email or not first_name or not last_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="E-Mail, Vorname und Nachname sind erforderlich")
    contact = await crm_service.upsert_contact(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=payload.get("phone"),
        postal_code=payload.get("postal_code"),
        city=payload.get("city"),
        source="compat_contacts_create",
    )
    return {"success": True, "data": {"contact": contact}}


@router.get("/contacts/search")
async def compat_search_contact(email: str):
    contact = await crm_service.find_contact_by_email(email)
    return {"success": True, "data": {"contact": contact}}


@router.post("/memberships/create")
async def compat_create_membership(payload: dict):
    contact_id = payload.get("contact_id")
    if not contact_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="contact_id fehlt")
    membership_map = {1: "ordentlich", 2: "ausserordentlich", 3: "foerdernd"}
    membership_key = membership_map.get(int(payload.get("membership_type_id") or 1), "ordentlich")
    membership = await crm_service.ensure_membership(contact_id=int(contact_id), membership_key=membership_key)
    return {"success": True, "data": {"membership": membership}}


@router.post("/contributions/create")
async def compat_create_contribution(payload: dict):
    status_value = "pending" if payload.get("payment_instrument") in {"bank_transfer", "cash", "pos", "sepa"} else "paid"
    row = await fetchrow(
        """
        INSERT INTO donations (
            civicrm_contact_id, donor_name, donor_email, amount, currency,
            donation_type, is_recurring, status, donation_date, receipt_eligible, source, notes
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_DATE,TRUE,$9,$10)
        RETURNING id, donor_name, donor_email, amount, currency, donation_type, status, donation_date
        """,
        payload.get("contact_id"),
        payload.get("donor_name") or payload.get("email") or "Unterstützer/in",
        payload.get("email"),
        payload.get("amount"),
        (payload.get("currency") or "EUR").upper(),
        "recurring" if payload.get("financial_type") == "membership_fee" else "one_time",
        False,
        status_value,
        payload.get("purpose") or "Website",
        json.dumps(payload),
    )
    donation = dict(row)
    donation["receipt_eligible"] = True
    return donation


@router.post("/contributions/recur")
async def compat_create_recurring_contribution(payload: dict):
    row = await fetchrow(
        """
        INSERT INTO donations (
            civicrm_contact_id, donor_name, donor_email, amount, currency,
            donation_type, is_recurring, status, donation_date, receipt_eligible, source, notes
        )
        VALUES ($1,$2,$3,$4,$5,'recurring',TRUE,'pending',CURRENT_DATE,TRUE,$6,$7)
        RETURNING id, donor_name, donor_email, amount, currency, donation_type, status, donation_date
        """,
        payload.get("contact_id"),
        payload.get("donor_name") or payload.get("email") or "Unterstützer/in",
        payload.get("email"),
        payload.get("amount"),
        (payload.get("currency") or "EUR").upper(),
        payload.get("purpose") or "Wiederkehrende Unterstützung",
        json.dumps(payload),
    )
    donation = dict(row)
    donation["receipt_eligible"] = True
    return donation


@router.post("/payments/process-sepa")
async def compat_process_sepa(payload: dict, request: Request):
    await _require_internal_signature(request)
    member_id = payload.get("memberId") or payload.get("member_id")
    amount = payload.get("amount")
    if not member_id or amount in {None, ""}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="memberId und amount sind erforderlich",
        )
    try:
        result = await payment_service.process_sepa_membership_payment(
            member_id=str(member_id),
            amount=float(amount),
            crm_payment_id=payload.get("crmPaymentId") or payload.get("crm_payment_id"),
        )
    except ValueError as exc:
        status_code = status.HTTP_404_NOT_FOUND if "nicht gefunden" in str(exc).lower() else status.HTTP_422_UNPROCESSABLE_ENTITY
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc
    return result


@router.post("/payments/log")
async def compat_log_payment(payload: dict, request: Request):
    await _require_internal_signature(request)
    provider_event_id = (
        payload.get("stripe_event_id")
        or payload.get("provider_event_id")
        or payload.get("event_id")
        or payload.get("gateway_charge_id")
    )
    amount = payload.get("amount")
    if not provider_event_id or amount in {None, ""}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="stripe_event_id/provider_event_id und amount sind erforderlich",
        )
    logged = await payment_service.log_external_payment(
        provider_event_id=str(provider_event_id),
        donor_email=payload.get("payer_email") or payload.get("donor_email") or payload.get("email"),
        donor_name=payload.get("payer_name") or payload.get("donor_name") or payload.get("name"),
        amount=float(amount),
        currency=(payload.get("currency") or "EUR").upper(),
        status=str(payload.get("status") or "completed"),
        civicrm_contribution_id=payload.get("civicrm_contribution_id"),
    )
    return logged


@router.post("/finance/donations")
async def compat_finance_donations(payload: dict, request: Request):
    await _require_internal_signature(request)
    donor = payload.get("donor") or {}
    donation = await payment_service.record_successful_donation(
        donor_email=payload.get("donor_email") or donor.get("email") or payload.get("email") or "",
        donor_name=payload.get("donor_name") or donor.get("name") or donor.get("display_name") or payload.get("name") or "Unterstützer/in",
        amount=float(payload.get("amount") or 0),
        currency=(payload.get("currency") or "EUR").upper(),
        donation_type=payload.get("donation_type") or "one_time",
        source=payload.get("source") or "n8n",
        gateway_charge_id=payload.get("gateway_charge_id") or payload.get("civicrm_contribution_id"),
        civicrm_contact_id=payload.get("civicrm_contact_id") or donor.get("civicrm_id"),
    )
    donation["receipt_eligible"] = payload.get("receipt_eligible", True)
    donation["donor"] = donor or {
        "email": payload.get("donor_email") or payload.get("email"),
        "display_name": payload.get("donor_name") or payload.get("name"),
    }
    return donation


@router.post("/finance/invoices")
async def compat_create_invoice(payload: dict, request: Request):
    await _require_internal_signature(request)
    contact = payload.get("contact") or {}
    items = payload.get("items") or []
    invoice_type = payload.get("invoice_type") or "membership"
    try:
        invoice = await payment_service.create_invoice_from_contact(
            contact=contact,
            invoice_type=str(invoice_type),
            items=items,
            issue_date=payload.get("issue_date"),
            due_date=payload.get("due_date"),
            created_by="n8n_membership_invoicing",
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return invoice


@router.get("/finance/sepa/collectible")
async def compat_collectible_sepa(request: Request):
    await _require_internal_signature(request)
    transactions = await payment_service.list_collectible_sepa_transactions()
    return transactions


@router.post("/finance/sepa/export-batch")
async def compat_export_sepa_batch(payload: dict, request: Request):
    await _require_internal_signature(request)
    transactions = payload.get("transactions") or []
    collection_date = payload.get("collection_date")
    if not collection_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="collection_date ist erforderlich",
        )
    try:
        batch = await payment_service.export_sepa_batch(
            transactions=transactions,
            collection_date=str(collection_date),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return batch


@router.post("/finance/receipts/generate-pdf")
async def compat_generate_receipt(payload: dict, request: Request):
    await _require_internal_signature(request)
    receipt_number = payload.get("receipt_number") or f"SPQ-{payload.get('id', 'pending')}"
    return {
        "pdf_path": f"/generated/receipts/{receipt_number}.pdf",
        "receipt_number": receipt_number,
        "status": "queued",
        **payload,
    }


@router.post("/finance/invoices/{invoice_id}/payment")
async def compat_mark_invoice_paid(invoice_id: int, payload: dict, request: Request):
    await _require_internal_signature(request)
    await execute(
        """
        UPDATE invoices
        SET status = 'paid', paid_at = NOW(), updated_at = NOW(), notes = COALESCE(notes, '') || $1
        WHERE id = $2
        """,
        f"\nPayment confirmed: {json.dumps(payload)}",
        invoice_id,
    )
    invoice = await fetchrow(
        """
        SELECT id, invoice_number, recipient_email, recipient_name, total_amount, civicrm_contribution_id
        FROM invoices
        WHERE id = $1
        """,
        invoice_id,
    )
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rechnung nicht gefunden")
    invoice_data = dict(invoice)
    invoice_data["paid_amount"] = payload.get("amount") or payload.get("paid_amount") or invoice_data.get("total_amount")
    return invoice_data


@router.get("/finance/invoices/overdue")
async def compat_overdue_invoices(request: Request):
    await _require_internal_signature(request)
    rows = await fetch(
        """
        SELECT id, invoice_number, recipient_name, recipient_email, total_amount, due_date::text, status
        FROM invoices
        WHERE status IN ('sent', 'pending', 'overdue') AND due_date < CURRENT_DATE
        ORDER BY due_date ASC
        """
    )
    return [dict(row) for row in rows]


@router.post("/finance/dunning/run")
async def compat_dunning_run(payload: dict, request: Request):
    await _require_internal_signature(request)
    invoices = payload.get("invoices") or []
    notices = []
    for invoice in invoices:
        if isinstance(invoice, dict) and "invoices" in invoice:
            for nested in invoice["invoices"]:
                notices.append({
                    "email": nested.get("recipient_email"),
                    "invoice_data": nested,
                    "level": 1,
                })
        elif isinstance(invoice, dict):
            notices.append({
                "email": invoice.get("recipient_email"),
                "invoice_data": invoice,
                "level": 1,
            })
    return {"notices": notices, "status": "queued"}


@router.post("/finance/dunning/generate-pdf")
async def compat_dunning_pdf(payload: dict, request: Request):
    await _require_internal_signature(request)
    invoice_number = payload.get("invoice_data", {}).get("invoice_number", "mahnung")
    return {"pdf_path": f"/generated/dunning/{invoice_number}.pdf", **payload}


@router.post("/receipt/trigger")
async def compat_receipt_trigger(payload: dict, request: Request):
    await _require_internal_signature(request)
    receipt_number = payload.get("receipt_number") or f"SPQ-{payload.get('id', 'pending')}"
    return {"pdf_path": f"/generated/receipts/{receipt_number}.pdf", **payload}


@router.post("/contacts/sync-from-crm")
async def compat_contacts_sync(payload: dict, request: Request):
    await _require_internal_signature(request)
    return payload

from __future__ import annotations

import asyncio
import logging
import re
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path
from typing import Any

_SMTP_MAX_RETRIES = 3

from jinja2 import Environment, FileSystemLoader

from ..db import execute
from ..secrets_provider import get_secret
from ..email_config import (
    GRAPH_TOKEN_CACHE_TTL,
    MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME,
    MAIL_TRANSPORT,
    MAIL_REPLY_TO_ADDRESS,
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_GRAPH_SENDER,
    MICROSOFT_TENANT_ID,
    SMTP_ENCRYPTION,
    SMTP_HOST,
    SMTP_PORT,
)
from .graph_mail_transport import GraphMailTransport, GraphMailTransportError

logger = logging.getLogger("menschlichkeit.mail")

TEMPLATE_DIR = (
    Path(__file__).resolve().parents[2] / "src" / "notifications" / "templates"
)


@dataclass(frozen=True)
class MailTemplate:
    template_name: str
    subject: str
    preheader: str


class MailService:
    def __init__(self) -> None:
        self.env = Environment(
            loader=FileSystemLoader(str(TEMPLATE_DIR)),
            autoescape=True,
        )
        self.smtp_user = get_secret(
            "MAIL_USERNAME", bsm_key="api/MAIL_USERNAME"
        ).strip()
        self.smtp_password = get_secret(
            "MAIL_PASSWORD", bsm_key="api/MAIL_PASSWORD"
        ).strip()
        self.graph_tenant_id = get_secret(
            "MICROSOFT_TENANT_ID",
            default=MICROSOFT_TENANT_ID,
            bsm_key="api/MICROSOFT_TENANT_ID",
        ).strip()
        self.graph_client_id = get_secret(
            "MICROSOFT_CLIENT_ID",
            default=MICROSOFT_CLIENT_ID,
            bsm_key="api/MICROSOFT_CLIENT_ID",
        ).strip()
        self.graph_client_secret = get_secret(
            "MICROSOFT_CLIENT_SECRET",
            default=MICROSOFT_CLIENT_SECRET,
            bsm_key="api/MICROSOFT_CLIENT_SECRET",
        ).strip()
        self.graph_sender = get_secret(
            "MICROSOFT_GRAPH_SENDER",
            default=MICROSOFT_GRAPH_SENDER,
            bsm_key="api/MICROSOFT_GRAPH_SENDER",
        ).strip()
        self.graph_transport = GraphMailTransport(
            tenant_id=self.graph_tenant_id,
            client_id=self.graph_client_id,
            client_secret=self.graph_client_secret,
            sender=self.graph_sender,
            token_cache_ttl=GRAPH_TOKEN_CACHE_TTL,
        )
        self.graph_templates = {"admin_alert", "donation_failed"}
        self.templates: dict[str, MailTemplate] = {
            "welcome": MailTemplate(
                "welcome_email.html",
                "Willkommen bei Menschlichkeit Österreich",
                "Danke für Ihre Registrierung bei Menschlichkeit Österreich.",
            ),
            "verify_email": MailTemplate(
                "verify_email.html",
                "Bitte E-Mail-Adresse bestätigen",
                "Bestätigen Sie bitte Ihre E-Mail-Adresse.",
            ),
            "newsletter_doi": MailTemplate(
                "newsletter_doi.html",
                "Bitte Newsletter-Anmeldung bestätigen",
                "Ein Klick fehlt noch für Ihren Newsletter.",
            ),
            "newsletter_confirmed": MailTemplate(
                "newsletter_confirmed.html",
                "Newsletter-Anmeldung bestätigt",
                "Danke, Ihre Anmeldung ist bestätigt.",
            ),
            "newsletter_unsubscribed": MailTemplate(
                "newsletter_unsubscribed.html",
                "Newsletter-Abmeldung bestätigt",
                "Sie wurden erfolgreich abgemeldet.",
            ),
            "donation_success": MailTemplate(
                "donation_thank_you_email.html",
                "Vielen Dank für Ihre Unterstützung",
                "Ihre Unterstützung ist erfolgreich eingegangen.",
            ),
            "membership_received": MailTemplate(
                "membership_received.html",
                "Ihr Mitgliedsantrag ist eingegangen",
                "Danke für Ihren Mitgliedsantrag.",
            ),
            "password_reset": MailTemplate(
                "password_reset_email.html",
                "Passwort zurücksetzen",
                "Hier finden Sie Ihren Link zur Passwortwiederherstellung.",
            ),
            "contact_confirmation": MailTemplate(
                "contact_confirmation.html",
                "Ihre Nachricht ist bei uns eingegangen",
                "Danke für Ihre Nachricht.",
            ),
            "admin_alert": MailTemplate(
                "admin_alert.html",
                "Interne Benachrichtigung",
                "Es liegt ein neuer Vorgang vor.",
            ),
            "invoice": MailTemplate(
                "invoice_email.html",
                "Ihre Rechnung von Menschlichkeit Österreich",
                "Bitte überweisen Sie den fälligen Mitgliedsbeitrag.",
            ),
            "dunning": MailTemplate(
                "dunning_email.html",
                "Zahlungserinnerung – Menschlichkeit Österreich",
                "Es besteht noch ein offener Betrag.",
            ),
            "donation_failed": MailTemplate(
                "donation_failed.html",
                "Ihre Zahlung konnte nicht verarbeitet werden",
                "Bitte versuchen Sie die Zahlung erneut.",
            ),
            "admin_new_donation": MailTemplate(
                "admin_new_donation.html",
                "Neue Spende eingegangen",
                "Eine neue Spende wurde verarbeitet.",
            ),
            "admin_new_registration": MailTemplate(
                "admin_new_registration.html",
                "Neue Registrierung",
                "Ein neues Konto wurde angelegt.",
            ),
            "opt_out_confirmed": MailTemplate(
                "opt_out_confirmed.html",
                "Ihre Abmeldung wurde bestätigt",
                "Ihre Abmeldung wurde erfolgreich verarbeitet.",
            ),
            "recurring_donation_problem": MailTemplate(
                "recurring_donation_problem.html",
                "Problem mit Ihrer Dauerspende",
                "Bei Ihrer Dauerspende ist ein Problem aufgetreten.",
            ),
        }

    def _render(
        self, template_id: str, context: dict[str, Any]
    ) -> tuple[str, str, str]:
        config = self.templates[template_id]
        html = self.env.get_template(config.template_name).render(
            **context, preheader=config.preheader
        )
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return config.subject, html, text

    def _smtp_enabled(self) -> bool:
        return bool(self.smtp_user and self.smtp_password and SMTP_HOST and SMTP_PORT)

    def _graph_enabled_for_template(self, template_id: str) -> bool:
        return (
            MAIL_TRANSPORT == "graph"
            and template_id in self.graph_templates
            and self.graph_transport.is_enabled
        )

    @staticmethod
    def _build_message(
        *,
        template_id: str,
        subject: str,
        recipient_email: str,
        html: str,
        text: str,
        context: dict[str, Any],
    ) -> EmailMessage:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM_ADDRESS}>"
        message["To"] = recipient_email
        message["Reply-To"] = MAIL_REPLY_TO_ADDRESS
        unsubscribe_url = context.get("unsubscribe_url")
        if unsubscribe_url and template_id.startswith("newsletter"):
            message["List-Unsubscribe"] = f"<{unsubscribe_url}>"
            message["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
        message.set_content(text)
        message.add_alternative(html, subtype="html")
        return message

    async def log_email(
        self,
        *,
        recipient_email: str,
        subject: str,
        template_name: str,
        entity_type: str | None = None,
        entity_id: int | None = None,
        status: str = "queued",
        provider: str | None = None,
        provider_message_id: str | None = None,
        error_message: str | None = None,
    ) -> None:
        try:
            await execute(
                """
                INSERT INTO email_log (
                    recipient_email, subject, template_name, entity_type, entity_id,
                    status, provider, provider_message_id, error_message
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                """,
                recipient_email,
                subject,
                template_name,
                entity_type,
                entity_id,
                status,
                provider,
                provider_message_id,
                error_message,
            )
        except Exception as exc:
            logger.warning(
                "email_log_failed | recipient=%s | error=%s", recipient_email, exc
            )

    async def send_template(
        self,
        *,
        template_id: str,
        recipient_email: str,
        context: dict[str, Any],
        subject_override: str | None = None,
        entity_type: str | None = None,
        entity_id: int | None = None,
    ) -> bool:
        subject, html, text = self._render(template_id, context)
        if subject_override:
            subject = subject_override

        message = self._build_message(
            template_id=template_id,
            subject=subject,
            recipient_email=recipient_email,
            html=html,
            text=text,
            context=context,
        )

        if self._graph_enabled_for_template(template_id):
            try:
                await self.graph_transport.send_message(message)
                await self.log_email(
                    recipient_email=recipient_email,
                    subject=subject,
                    template_name=template_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    status="sent",
                    provider="graph",
                )
                return True
            except GraphMailTransportError as exc:
                logger.warning(
                    "graph_send_failed_no_smtp_fallback | template=%s | recipient=%s | error=%s",
                    template_id,
                    recipient_email,
                    exc,
                )
                await self.log_email(
                    recipient_email=recipient_email,
                    subject=subject,
                    template_name=template_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    status="failed",
                    provider="graph",
                    error_message=str(exc),
                )
                return False

        provider = "smtp"

        if not self._smtp_enabled():
            await self.log_email(
                recipient_email=recipient_email,
                subject=subject,
                template_name=template_id,
                entity_type=entity_type,
                entity_id=entity_id,
                status="logged",
                provider="log-only",
            )
            return True

        last_exc: Exception | None = None
        for attempt in range(_SMTP_MAX_RETRIES):
            try:
                if SMTP_ENCRYPTION.lower() == "ssl":
                    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as smtp:
                        smtp.login(self.smtp_user, self.smtp_password)
                        smtp.send_message(message)
                else:
                    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
                        smtp.ehlo()
                        if SMTP_ENCRYPTION.lower() == "tls":
                            smtp.starttls()
                            smtp.ehlo()
                        smtp.login(self.smtp_user, self.smtp_password)
                        smtp.send_message(message)
                await self.log_email(
                    recipient_email=recipient_email,
                    subject=subject,
                    template_name=template_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    status="sent",
                    provider=provider,
                )
                return True
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "email_send_attempt_failed | template=%s | recipient=%s | attempt=%d/%d | error=%s",
                    template_id,
                    recipient_email,
                    attempt + 1,
                    _SMTP_MAX_RETRIES,
                    exc,
                )
                if attempt < _SMTP_MAX_RETRIES - 1:
                    await asyncio.sleep(2**attempt)

        logger.error(
            "email_send_failed_all_retries | template=%s | recipient=%s | error=%s",
            template_id,
            recipient_email,
            last_exc,
        )
        error_message = str(last_exc)
        await self.log_email(
            recipient_email=recipient_email,
            subject=subject,
            template_name=template_id,
            entity_type=entity_type,
            entity_id=entity_id,
            status="failed",
            provider=provider,
            error_message=error_message,
        )
        return False


mail_service = MailService()

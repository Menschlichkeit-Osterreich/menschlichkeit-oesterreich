from __future__ import annotations

import logging
import os
import re
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from ..db import execute
from ..email_config import (
    MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME,
    MAIL_REPLY_TO_ADDRESS,
    SMTP_ENCRYPTION,
    SMTP_HOST,
    SMTP_PORT,
)

logger = logging.getLogger("menschlichkeit.mail")

TEMPLATE_DIR = Path(__file__).resolve().parents[2] / "src" / "notifications" / "templates"


@dataclass(frozen=True)
class MailTemplate:
    template_name: str
    subject: str
    preheader: str


class MailService:
    def __init__(self) -> None:
        self.env = Environment(
            loader=FileSystemLoader(str(TEMPLATE_DIR)),
            autoescape=select_autoescape(["html", "xml"]),
        )
        self.smtp_user = os.getenv("MAIL_USERNAME", "").strip()
        self.smtp_password = os.getenv("MAIL_PASSWORD", "").strip()
        self.templates: dict[str, MailTemplate] = {
            "welcome": MailTemplate("welcome_email.html", "Willkommen bei Menschlichkeit Österreich", "Danke für Ihre Registrierung bei Menschlichkeit Österreich."),
            "verify_email": MailTemplate("verify_email.html", "Bitte E-Mail-Adresse bestätigen", "Bestätigen Sie bitte Ihre E-Mail-Adresse."),
            "newsletter_doi": MailTemplate("newsletter_doi.html", "Bitte Newsletter-Anmeldung bestätigen", "Ein Klick fehlt noch für Ihren Newsletter."),
            "newsletter_confirmed": MailTemplate("newsletter_confirmed.html", "Newsletter-Anmeldung bestätigt", "Danke, Ihre Anmeldung ist bestätigt."),
            "newsletter_unsubscribed": MailTemplate("newsletter_unsubscribed.html", "Newsletter-Abmeldung bestätigt", "Sie wurden erfolgreich abgemeldet."),
            "donation_success": MailTemplate("donation_thank_you_email.html", "Vielen Dank für Ihre Unterstützung", "Ihre Unterstützung ist erfolgreich eingegangen."),
            "membership_received": MailTemplate("membership_received.html", "Ihr Mitgliedsantrag ist eingegangen", "Danke für Ihren Mitgliedsantrag."),
            "password_reset": MailTemplate("password_reset_email.html", "Passwort zurücksetzen", "Hier finden Sie Ihren Link zur Passwortwiederherstellung."),
            "contact_confirmation": MailTemplate("contact_confirmation.html", "Ihre Nachricht ist bei uns eingegangen", "Danke für Ihre Nachricht."),
            "admin_alert": MailTemplate("admin_alert.html", "Interne Benachrichtigung", "Es liegt ein neuer Vorgang vor."),
        }

    def _render(self, template_id: str, context: dict[str, Any]) -> tuple[str, str, str]:
        config = self.templates[template_id]
        html = self.env.get_template(config.template_name).render(**context, preheader=config.preheader)
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return config.subject, html, text

    def _smtp_enabled(self) -> bool:
        return bool(self.smtp_user and self.smtp_password and SMTP_HOST and SMTP_PORT)

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
            logger.warning("email_log_failed | recipient=%s | error=%s", recipient_email, exc)

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

        provider = "smtp" if self._smtp_enabled() else "log-only"
        try:
            if self._smtp_enabled():
                message = EmailMessage()
                message["Subject"] = subject
                message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM_ADDRESS}>"
                message["To"] = recipient_email
                message["Reply-To"] = MAIL_REPLY_TO_ADDRESS
                message.set_content(text)
                message.add_alternative(html, subtype="html")

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
                status="sent" if self._smtp_enabled() else "logged",
                provider=provider,
            )
            return True
        except Exception as exc:
            logger.warning("email_send_failed | template=%s | recipient=%s | error=%s", template_id, recipient_email, exc)
            await self.log_email(
                recipient_email=recipient_email,
                subject=subject,
                template_name=template_id,
                entity_type=entity_type,
                entity_id=entity_id,
                status="failed",
                provider=provider,
                error_message=str(exc),
            )
            return False


mail_service = MailService()

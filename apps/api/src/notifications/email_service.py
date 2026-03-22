from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


class EmailService:
    async def send_email(
        self,
        *,
        recipient_email: str,
        subject: str,
        html_content: str,
        email_type: str = "generic",
        related_id: str | None = None,
    ) -> bool:
        logger.info(
            "newsletter_email_log_only | recipient=%s | subject=%s | email_type=%s | related_id=%s | html_len=%s",
            recipient_email,
            subject,
            email_type,
            related_id,
            len(html_content or ""),
        )
        return True

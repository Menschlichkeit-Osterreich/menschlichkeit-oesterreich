"""
Newsletter-Service – Menschlichkeit Österreich
Segmentierung, Kampagnen und automatisierter Versand
"""

from __future__ import annotations
import logging
from typing import List, Dict, Any

# Lokale Importe (angenommen)
from .email_service import EmailService
from ..crm.civi_service import CiviCRMService

logger = logging.getLogger(__name__)

class NewsletterService:
    """Verwaltet die Logik für Newsletter-Versand, Segmentierung und Kampagnen."""

    def __init__(self, email_service: EmailService, crm_service: CiviCRMService):
        self.email = email_service
        self.crm = crm_service

    async def get_subscribers_by_segment(self, segment_name: str) -> List[Dict[str, Any]]:
        """Ruft Abonnenten für ein bestimmtes Segment aus dem CRM ab."""
        # Dies würde normalerweise eine komplexe Abfrage im CRM ausführen
        # Beispiel: 'aktive_mitglieder', 'spender_letztes_jahr', 'interessenten'
        try:
            if segment_name == "aktive_mitglieder":
                return await self.crm.get_contacts_by_group("Aktive Mitglieder")
            elif segment_name == "spender_letztes_jahr":
                return await self.crm.get_contacts_by_donation_period(years=1)
            else:
                # Standard-Segment: Alle Newsletter-Abonnenten
                return await self.crm.get_contacts_by_group("Newsletter")
        except Exception as e:
            logger.error("Fehler beim Abrufen des Segments '%s': %s", segment_name, e)
            return []

    async def send_newsletter_campaign(
        self,
        campaign_id: str,
        subject: str,
        html_content: str,
        segment: str
    ) -> Dict[str, Any]:
        """Versendet eine Newsletter-Kampagne an ein Segment."""
        subscribers = await self.get_subscribers_by_segment(segment)
        if not subscribers:
            logger.warning("Keine Abonnenten im Segment '%s' für Kampagne '%s' gefunden.", segment, campaign_id)
            return {"status": "aborted", "reason": "no_subscribers", "sent": 0}

        sent_count = 0
        failed_count = 0

        for subscriber in subscribers:
            # Personalisierung des Inhalts
            personalized_html = html_content.replace("{{contact.first_name}}", subscriber.get("first_name", ""))
            
            success = await self.email.send_email(
                recipient_email=subscriber["email"],
                subject=subject,
                html_content=personalized_html,
                email_type="newsletter_campaign",
                related_id=campaign_id
            )
            if success:
                sent_count += 1
            else:
                failed_count += 1

        logger.info(
            "Newsletter-Kampagne '%s' an Segment '%s' abgeschlossen. Gesendet: %d, Fehler: %d",
            campaign_id, segment, sent_count, failed_count
        )

        return {
            "status": "completed",
            "campaign_id": campaign_id,
            "segment": segment,
            "total_subscribers": len(subscribers),
            "sent": sent_count,
            "failed": failed_count
        }

    async def trigger_automated_newsletter(
        self, 
        automation_name: str, 
        contact_id: int
    ) -> bool:
        """Triggert einen automatisierten Newsletter (z.B. Willkommens-Serie)."""
        contact = await self.crm.get_contact(contact_id)
        if not contact:
            return False

        # Logik für verschiedene Automatisierungen
        if automation_name == "welcome_series_day_1":
            subject = "Willkommen bei Menschlichkeit Österreich!"
            # HTML-Inhalt würde aus einer Template-Datenbank geladen
            html_content = "<h1>Hallo {{contact.first_name}},</h1><p>schön, dass du da bist!</p>"
            
            return await self.email.send_email(
                recipient_email=contact["email"],
                subject=subject,
                html_content=html_content.replace("{{contact.first_name}}", contact.get("first_name", "")),
                email_type="newsletter_automation",
                related_id=f"{automation_name}:{contact_id}"
            )
        
        logger.warning("Unbekannte Newsletter-Automatisierung: %s", automation_name)
        return False

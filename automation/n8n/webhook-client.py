#!/usr/bin/env python3
"""
n8n Python Webhook Client
Für Menschlichkeit Österreich API Integration
"""

import hashlib
import hmac
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional

try:
    import requests  # type: ignore
except ImportError:
    print("ERROR: requests library not installed. Run: pip install requests")
    requests = None

# Setup logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Constants
DEFAULT_N8N_URL = "http://localhost:5678"
DEFAULT_TIMEOUT = 30


class MOEWebhookClient:
    """n8n Webhook Client für Menschlichkeit Österreich Integration."""

    def __init__(self, base_url: Optional[str] = None, secret: Optional[str] = None):
        self.base_url = base_url or os.getenv("N8N_BASE_URL", DEFAULT_N8N_URL)
        self.secret = secret or os.getenv("N8N_WEBHOOK_SECRET")

        if requests is None:
            raise ImportError("requests library is required")

        self.session = requests.Session()
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "MOE-API-Automation/1.0",
        }
        self.session.headers.update(headers)

    def trigger_api_event(
        self, event_type: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """FastAPI Service Events"""
        payload = {
            "eventType": event_type,
            "timestamp": datetime.now().isoformat(),
            "source": "fastapi",
            "service": "api.menschlichkeit-oesterreich.at",
            "data": data,
        }
        return self._call_webhook("/webhook/api-event", payload)

    def trigger_auth_event(
        self, user_id: int, action: str, details: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Authentication Events (Login, Registration, etc.)"""
        payload = {
            "userId": user_id,
            # 'login', 'register', 'logout', 'password_reset'
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "source": "auth_system",
            "details": details or {},
        }
        return self._call_webhook("/webhook/auth-event", payload)

    def trigger_member_event(
        self, member_id: int, event_type: str, data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Mitgliederverwaltung Events"""
        payload = {
            "memberId": member_id,
            # 'created', 'updated', 'payment_received', 'membership_expired'
            "eventType": event_type,
            "timestamp": datetime.now().isoformat(),
            "source": "member_management",
            "data": data or {},
        }
        return self._call_webhook("/webhook/member-event", payload)

    def trigger_contact_sync(
        self, contacts: list, sync_direction: str = "crm_to_api"
    ) -> Dict[str, Any]:
        """CRM ↔ API Contact Synchronization"""
        payload = {
            "contacts": contacts,
            # 'crm_to_api', 'api_to_crm', 'bidirectional'
            "syncDirection": sync_direction,
            "timestamp": datetime.now().isoformat(),
            "count": len(contacts),
        }
        return self._call_webhook("/webhook/contact-sync", payload)

    def trigger_payment_event(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """SEPA Payment Processing Events"""
        payload = {
            "paymentId": payment_data.get("id"),
            "amount": payment_data.get("amount"),
            "currency": payment_data.get("currency", "EUR"),
            # 'pending', 'completed', 'failed'
            "status": payment_data.get("status"),
            "memberId": payment_data.get("member_id"),
            "timestamp": datetime.now().isoformat(),
            "source": "sepa_system",
            "details": payment_data,
        }
        return self._call_webhook("/webhook/payment-event", payload)

    def trigger_error_alert(
        self, error_type: str, message: str, context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """System Error Notifications"""
        payload = {
            # 'api_error', 'database_error', 'auth_error', 'payment_error'
            "errorType": error_type,
            "message": message,
            # 'low', 'medium', 'high', 'critical'
            "severity": (context.get("severity", "medium") if context else "medium"),
            "timestamp": datetime.now().isoformat(),
            "context": context or {},
            "environment": os.getenv("ENVIRONMENT", "development"),
        }
        return self._call_webhook("/webhook/error-alert", payload)

    def _call_webhook(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Generic webhook call with error handling"""
        try:
            url = f"{self.base_url}{path}"

            # Add signature if secret is configured
            headers = {}
            if self.secret:
                signature = self._generate_signature(payload)
                headers["X-Webhook-Signature"] = signature

            logger.info(f"Calling n8n webhook: {url}")

            response = self.session.post(url, json=payload, headers=headers, timeout=30)

            if response.status_code >= 400:
                warning_msg = (
                    f"Webhook warning: {response.status_code} - " f"{response.text}"
                )
                logger.warning(warning_msg)
                return {
                    "success": False,
                    "status": response.status_code,
                    "error": response.text,
                }

            logger.info(f"Webhook success: {response.status_code}")
            return {
                "success": True,
                "status": response.status_code,
                "data": response.json() if response.content else None,
            }

        except requests.exceptions.ConnectionError:
            logger.warning("n8n service not available - webhook skipped")
            return {"success": False, "error": "n8n_unavailable"}

        except requests.exceptions.Timeout:
            logger.error("Webhook timeout")
            return {"success": False, "error": "timeout"}

        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return {"success": False, "error": str(e)}

    def _generate_signature(self, payload: Dict[str, Any]) -> str:
        """Generate HMAC signature for webhook security"""
        if not self.secret:
            return ""

        payload_string = json.dumps(payload, sort_keys=True)
        return hmac.new(
            self.secret.encode("utf-8"), payload_string.encode("utf-8"), hashlib.sha256
        ).hexdigest()


# CLI Usage
if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="MOE n8n Webhook Client")
    parser.add_argument(
        "action", choices=["auth", "member", "payment", "error", "sync"]
    )
    parser.add_argument("--user-id", type=int, help="User ID for auth events")
    parser.add_argument("--member-id", type=int, help="Member ID for member events")
    parser.add_argument("--event-type", help="Event type")
    parser.add_argument("--message", help="Error message")
    parser.add_argument("--data", help="Additional data as JSON string")

    args = parser.parse_args()

    client = MOEWebhookClient()

    # Parse additional data if provided
    additional_data = {}
    if args.data:
        try:
            additional_data = json.loads(args.data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in --data argument")
            sys.exit(1)

    # Execute webhook based on action
    result = None

    if args.action == "auth" and args.user_id and args.event_type:
        result = client.trigger_auth_event(
            args.user_id, args.event_type, additional_data
        )

    elif args.action == "member" and args.member_id and args.event_type:
        result = client.trigger_member_event(
            args.member_id, args.event_type, additional_data
        )

    elif args.action == "error" and args.event_type and args.message:
        result = client.trigger_error_alert(
            args.event_type, args.message, additional_data
        )

    else:
        print("Missing required arguments for the specified action")
        parser.print_help()
        sys.exit(1)

    if result:
        print(f"Webhook result: {json.dumps(result, indent=2)}")

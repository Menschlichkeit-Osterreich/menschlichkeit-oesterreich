#!/usr/bin/env python3
"""
n8n Python Webhook Client - Optimized Version
Für Menschlichkeit Österreich API Integration
Alle Log-Probleme behoben und Code-Qualität optimiert
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

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_N8N_URL = "http://localhost:5678"
DEFAULT_TIMEOUT = 30
WEBHOOK_PATHS = {
    "api": "/webhook/api-event",
    "auth": "/webhook/auth-event",
    "member": "/webhook/member-event",
    "payment": "/webhook/payment-event",
    "sync": "/webhook/contact-sync",
    "erasure": "/webhook/right-to-erasure",
    "error": "/webhook/error-alert",
}


class WebhookError(Exception):
    """Custom exception for webhook-related errors."""

    pass


class MOEWebhookClient:
    """
    Optimierter n8n Webhook Client für Menschlichkeit Österreich.
    Alle Log-Probleme behoben, Type Hints korrigiert.
    """

    def __init__(
        self, base_url: Optional[str] = None, secret: Optional[str] = None
    ) -> None:
        """Initialize webhook client with proper error handling."""
        if requests is None:
            raise ImportError("requests library is required")

        self.base_url = base_url or os.getenv("N8N_BASE_URL", DEFAULT_N8N_URL)
        self.secret = secret or os.getenv("N8N_WEBHOOK_SECRET")

        self.session = requests.Session()
        self.session.headers.update(
            {"Content-Type": "application/json", "User-Agent": "MOE-API-Automation/1.0"}
        )

        logger.info(f"Webhook client initialized for: {self.base_url}")

    def trigger_api_event(
        self, event_type: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger API-related events."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            "eventType": event_type,
            "source": "api",
            "data": data,
        }
        return self._call_webhook(WEBHOOK_PATHS["api"], payload)

    def trigger_auth_event(
        self, user_id: int, action: str, details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Trigger authentication events with proper logging."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            "userId": user_id,
            # Actions: login, register, logout, password_reset
            "action": action,
            "details": details or {},
        }
        logger.info(f"Auth event triggered: {action} for user {user_id}")
        return self._call_webhook(WEBHOOK_PATHS["auth"], payload)

    def trigger_member_event(
        self, member_id: int, event_type: str, data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Trigger member management events."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            "memberId": member_id,
            # Types: created, updated, payment_received, membership_expired
            "eventType": event_type,
            "data": data or {},
        }
        logger.info(f"Member event: {event_type} for member {member_id}")
        return self._call_webhook(WEBHOOK_PATHS["member"], payload)

    def trigger_contact_sync(
        self, contacts: list, sync_direction: str = "crm_to_api"
    ) -> Dict[str, Any]:
        """Trigger contact synchronization between systems."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            "contactCount": len(contacts),
            # Directions: crm_to_api, api_to_crm, bidirectional
            "syncDirection": sync_direction,
            "contacts": contacts,
        }
        logger.info(
            f"Contact sync triggered: {len(contacts)} contacts, "
            f"direction: {sync_direction}"
        )
        return self._call_webhook(WEBHOOK_PATHS["sync"], payload)

    def trigger_erasure_request(
        self,
        subject_email: str,
        *,
        request_id: Optional[str] = None,
        scope: str = "full",
        reason: str = "user_request",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Trigger GDPR Art. 17 automated erasure workflow via n8n."""

        payload = {
            "timestamp": datetime.now().isoformat(),
            "requestId": request_id or hashlib.sha256(subject_email.encode()).hexdigest(),
            "subjectEmail": subject_email,
            # scope: full | retention-exception | marketing-only
            "scope": scope,
            "reason": reason,
            "metadata": metadata or {},
        }

        logger.info(
            "Erasure workflow triggered for %s (scope=%s, reason=%s)",
            subject_email,
            scope,
            reason,
        )
        return self._call_webhook(WEBHOOK_PATHS["erasure"], payload)

    def trigger_payment_event(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger payment processing events."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            "paymentId": payment_data.get("id"),
            "amount": payment_data.get("amount"),
            # Status: pending, completed, failed
            "status": payment_data.get("status"),
            "method": payment_data.get("method", "sepa"),
            "data": payment_data,
        }
        logger.info(
            f"Payment event: {payment_data.get('status')} - "
            f"Amount: {payment_data.get('amount')}"
        )
        return self._call_webhook(WEBHOOK_PATHS["payment"], payload)

    def trigger_error_alert(
        self, error_type: str, message: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Trigger error alerts with context information."""
        payload = {
            "timestamp": datetime.now().isoformat(),
            # Types: api_error, database_error, auth_error, payment_error
            "errorType": error_type,
            "message": message,
            # Severity: low, medium, high, critical
            "severity": (context.get("severity", "medium") if context else "medium"),
            "context": context or {},
        }
        logger.error(f"Error alert: {error_type} - {message}")
        return self._call_webhook(WEBHOOK_PATHS["error"], payload)

    def _call_webhook(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Internal method to call webhooks with proper error handling.
        Enhanced logging and error management.
        """
        url = f"{self.base_url.rstrip('/')}{path}"

        # Add signature if secret is available
        if self.secret:
            signature = self._generate_signature(payload)
            if signature:
                self.session.headers["X-Webhook-Signature"] = signature

        try:
            logger.debug(f"Calling webhook: {url}")
            response = self.session.post(url, json=payload, timeout=DEFAULT_TIMEOUT)

            # Enhanced response logging
            if response.status_code == 200:
                logger.info(f"Webhook success: {url} -> {response.status_code}")
                try:
                    return response.json()
                except json.JSONDecodeError:
                    return {"success": True, "response": response.text}

            elif response.status_code in [400, 404, 422]:
                logger.warning(
                    f"Webhook client error: {response.status_code} - "
                    f"{response.text[:100]}..."
                )
                return {
                    "success": False,
                    "error": response.text,
                    "status_code": response.status_code,
                }

            else:
                logger.error(
                    f"Webhook server error: {response.status_code} - "
                    f"{response.text[:100]}..."
                )
                raise WebhookError(
                    f"Server error {response.status_code}: {response.text}"
                )

        except requests.exceptions.Timeout:
            logger.error(f"Webhook timeout: {url}")
            raise WebhookError(f"Timeout calling webhook: {url}")

        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error: {url}")
            raise WebhookError(f"Connection failed: {url}")

        except Exception as e:
            logger.exception(f"Unexpected webhook error: {url}")
            raise WebhookError(f"Webhook call failed: {str(e)}")

    def _generate_signature(self, payload: Dict[str, Any]) -> str:
        """
        Generate HMAC signature for webhook security.
        Fixed return type and proper error handling.
        """
        if not self.secret:
            logger.warning("No webhook secret configured")
            return ""

        try:
            # Use compact JSON without sorting to match n8n JSON.stringify
            payload_string = json.dumps(payload, separators=(",", ":"))
            signature = hmac.new(
                self.secret.encode("utf-8"),
                payload_string.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()

            return signature

        except Exception as e:
            logger.error(f"Signature generation failed: {e}")
            return ""

    def health_check(self) -> bool:
        """Check if n8n service is reachable."""
        try:
            response = self.session.get(f"{self.base_url}/healthz", timeout=10)
            is_healthy = response.status_code == 200

            if is_healthy:
                logger.info("n8n service health check: OK")
            else:
                logger.warning(f"n8n service unhealthy: {response.status_code}")

            return is_healthy

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False


def main() -> None:
    """Enhanced CLI interface with better argument parsing and logging."""
    import argparse

    parser = argparse.ArgumentParser(
        description="n8n Webhook Client - Menschlichkeit Österreich"
    )
    parser.add_argument(
        "action", choices=["auth", "member", "payment", "error", "sync", "health", "erasure"]
    )
    parser.add_argument("--base-url", help="n8n base URL")
    parser.add_argument("--secret", help="Webhook secret")
    parser.add_argument("--user-id", type=int, help="User ID for auth events")
    parser.add_argument("--member-id", type=int, help="Member ID for member events")
    parser.add_argument("--event-type", help="Event type")
    parser.add_argument("--message", help="Error message")
    parser.add_argument("--email", help="Subject email for erasure")
    parser.add_argument("--request-id", help="Explicit request ID (optional)")
    parser.add_argument("--scope", choices=["full", "partial"], default="full", help="Erasure scope")
    parser.add_argument("--reason", default="user_request", help="Erasure reason")
    parser.add_argument("--verbose", "-v", action="store_true")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize client
    client = MOEWebhookClient(args.base_url, args.secret)

    # Test data for different actions
    additional_data = {
        "source": "cli",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

    try:
        if args.action == "health":
            is_healthy = client.health_check()
            print(f"Health check: {'✅ OK' if is_healthy else '❌ FAILED'}")

        elif args.action == "auth":
            if not args.user_id or not args.event_type:
                print("Error: --user-id and --event-type required for auth")
                return
            result = client.trigger_auth_event(
                args.user_id, args.event_type, additional_data
            )

        elif args.action == "member":
            if not args.member_id or not args.event_type:
                print("Error: --member-id and --event-type required for member")
                return
            result = client.trigger_member_event(
                args.member_id, args.event_type, additional_data
            )

        elif args.action == "error":
            if not args.event_type or not args.message:
                print("Error: --event-type and --message required for error")
                return
            result = client.trigger_error_alert(
                args.event_type, args.message, additional_data
            )

        else:
            # Default test webhook
            if args.action == "erasure":
                if not args.email:
                    print("Error: --email required for erasure")
                    return
                result = client.trigger_erasure_request(
                    subject_email=args.email,
                    request_id=args.request_id,
                    scope=args.scope,
                    reason=args.reason,
                    metadata=additional_data,
                )
            else:
                result = client.trigger_api_event("test", additional_data)

        if args.action != "health":
            print(f"Result: {json.dumps(result, indent=2)}")

    except WebhookError as e:
        logger.error(f"Webhook error: {e}")
        print(f"❌ Webhook failed: {e}")

    except Exception as e:
        logger.exception("Unexpected error")
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()

---
name: payment-test-gen
description: 'Generiert pytest-Stubs fuer Zahlungs-Flows: Stripe Webhooks, PayPal IPN, SEPA Export, Spenden-Processing mit korrekten Mock-Patterns'
argument-hint: '[stripe|paypal|sepa|donation|alle]'
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
---

# Payment Test Generator

## Zweck

Generiert pytest-Testfaelle fuer die ungetesteten Zahlungs-Flows der MOe-Plattform.

## Ziel-Services

| Service    | Datei                                       | Tests fehlen fuer                      |
| ---------- | ------------------------------------------- | -------------------------------------- |
| Stripe     | `apps/api/app/services/stripe_service.py`   | Webhook-Handling, Subscription, Refund |
| PayPal     | `apps/api/app/services/paypal_service.py`   | IPN-Verifizierung, Capture, Payout     |
| SEPA       | `apps/api/app/services/sepa_service.py`     | Lastschrift-Export, Mandatsvalidierung |
| Spenden    | `apps/api/app/services/donation_service.py` | Processing-Flow, Quittung, CRM-Sync    |
| Rechnungen | `apps/api/app/services/invoice_service.py`  | Erstellung, Versand, Stornierung       |

## Mock-Patterns

### Stripe

```python
from unittest.mock import patch, MagicMock

@patch("app.services.stripe_service.stripe.Webhook.construct_event")
def test_stripe_webhook_payment_succeeded(mock_construct):
    mock_construct.return_value = {
        "type": "payment_intent.succeeded",
        "data": {"object": {"id": "pi_test_123", "amount": 5000}}
    }
    # ...
```

### PayPal

```python
@patch("app.services.paypal_service.requests.post")
def test_paypal_ipn_verified(mock_post):
    mock_post.return_value = MagicMock(text="VERIFIED", status_code=200)
    # ...
```

### SEPA

```python
def test_sepa_xml_generation():
    """SEPA-XML (pain.008) muss Schema-valide sein."""
    # ...
```

## Test-Template

Jeder generierte Test folgt diesem Muster:

```python
"""Tests for {service_name} — {beschreibung}."""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestStripeWebhook:
    """Stripe Webhook Handler Tests."""

    def test_valid_payment_succeeded(self):
        """Successful payment triggers CRM update and receipt."""
        ...

    def test_invalid_signature_rejected(self):
        """Invalid webhook signature returns 400."""
        ...

    def test_duplicate_event_idempotent(self):
        """Duplicate event IDs are handled idempotently."""
        ...
```

## Sicherheit

- **KEINE echten API-Keys** in Tests — nur `sk_test_*`, `pk_test_*`
- **KEINE echten IBANs** — Test-IBANs verwenden (DE89370400440532013000)
- **KEINE echten Webhook-Secrets** — Mock-Secrets wie `whsec_test_123`

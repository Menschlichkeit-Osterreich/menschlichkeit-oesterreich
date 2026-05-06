"""Regression guard for the removed legacy PayPal endpoints."""

from __future__ import annotations

from app.main import app


class TestLegacyPayPalRemoval:
    def test_routes_are_not_registered(self):
        route_paths = {route.path for route in app.routes}

        assert "/api/payments/paypal/order" not in route_paths
        assert "/api/payments/paypal/capture" not in route_paths
        assert "/api/webhooks/paypal" not in route_paths

    def test_legacy_endpoints_return_404(self, client):
        for path, payload in (
            ("/api/payments/paypal/order", {"amount": 25.0, "currency": "EUR"}),
            ("/api/payments/paypal/capture", {"order_id": "ORDER123"}),
            ("/api/webhooks/paypal", {"id": "WH-1"}),
        ):
            response = client.post(path, json=payload)
            assert response.status_code == 404

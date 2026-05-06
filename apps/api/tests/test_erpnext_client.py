from __future__ import annotations

import asyncio
from unittest.mock import patch

import httpx

from app.services.erpnext_client import ErpNextClient, ErpNextClientError, ErpNextConfig


class _Response:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload
        self.text = str(payload)

    def json(self):
        return self._payload


class _AsyncClientStub:
    def __init__(self, queue):
        self.queue = queue

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def request(self, method, url, headers=None, json=None, params=None):
        item = self.queue.pop(0)
        if isinstance(item, Exception):
            raise item
        return item


def test_erpnext_client_builds_token_header():
    client = ErpNextClient(
        ErpNextConfig(
            base_url="https://erp.example.test",
            api_key="key123",
            api_secret="secret456",
            company="MOE",
            timeout_seconds=5,
            max_retries=0,
            naming_series_sales="SINV-",
            naming_series_purchase="PINV-",
            naming_series_journal="JV-",
        )
    )
    headers = client._headers()
    assert headers["Authorization"] == "token key123:secret456"


def test_erpnext_client_retries_after_timeout():
    client = ErpNextClient(
        ErpNextConfig(
            base_url="https://erp.example.test",
            api_key="key123",
            api_secret="secret456",
            company="MOE",
            timeout_seconds=5,
            max_retries=1,
            naming_series_sales="SINV-",
            naming_series_purchase="PINV-",
            naming_series_journal="JV-",
        )
    )
    queue = [httpx.TimeoutException("boom"), _Response(200, {"data": {"message": "pong"}})]

    with patch("app.services.erpnext_client.httpx.AsyncClient", return_value=_AsyncClientStub(queue)):
        result = asyncio.run(client._request("GET", "/api/method/ping"))

    assert result["message"] == "pong"


def test_erpnext_client_raises_on_4xx():
    client = ErpNextClient(
        ErpNextConfig(
            base_url="https://erp.example.test",
            api_key="key123",
            api_secret="secret456",
            company="MOE",
            timeout_seconds=5,
            max_retries=0,
            naming_series_sales="SINV-",
            naming_series_purchase="PINV-",
            naming_series_journal="JV-",
        )
    )
    queue = [_Response(422, {"exc": "validation"})]

    with patch("app.services.erpnext_client.httpx.AsyncClient", return_value=_AsyncClientStub(queue)):
        try:
            asyncio.run(client._request("POST", "/api/resource/Sales Invoice", json_body={"x": 1}))
        except ErpNextClientError as exc:
            assert exc.status_code == 422
        else:
            raise AssertionError("ErpNextClientError erwartet")

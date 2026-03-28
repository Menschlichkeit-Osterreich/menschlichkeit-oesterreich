"""Unit tests for PleskClient — mocked HTTP responses."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from plesk_client import PleskAPIError, PleskClient, PleskMailbox, redact_headers, redact_xml_passwords


# ── Redaction helpers ───────────────────────────────────────────


def test_redact_headers():
    headers = {"HTTP_AUTH_LOGIN": "admin", "HTTP_AUTH_PASSWD": "secret123"}
    result = redact_headers(headers)
    assert result["HTTP_AUTH_PASSWD"] == "***REDACTED***"
    assert result["HTTP_AUTH_LOGIN"] == "admin"
    # Original untouched
    assert headers["HTTP_AUTH_PASSWD"] == "secret123"


def test_redact_xml_passwords():
    xml = '<password><value>MyS3cret!</value><type>plain</type></password>'
    result = redact_xml_passwords(xml)
    assert "MyS3cret!" not in result
    assert "***REDACTED***" in result


# ── XML escaping ────────────────────────────────────────────────


def test_escape_xml_special_chars():
    assert PleskClient._esc('<script>alert("xss")</script>') == '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    assert PleskClient._esc("normal") == "normal"
    assert PleskClient._esc("it's & <fine>") == "it&#x27;s &amp; &lt;fine&gt;"


# ── Mock response helper ───────────────────────────────────────


def _mock_response(xml_body: str, status_code: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status_code = status_code
    resp.text = xml_body
    resp.content = xml_body.encode()
    resp.raise_for_status = MagicMock()
    if status_code >= 400:
        from requests.exceptions import HTTPError
        resp.raise_for_status.side_effect = HTTPError(response=resp)
    return resp


# ── get_site_id ─────────────────────────────────────────────────


@patch("plesk_client.requests.Session")
def test_get_site_id_success(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<site><get><result><status>ok</status>"
        "<id>42</id><data><gen_info/></data>"
        "</result></get></site></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    site_id = client.get_site_id("example.com")
    assert site_id == 42


@patch("plesk_client.requests.Session")
def test_get_site_id_not_found(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<site><get><result><status>error</status>"
        "<errcode>1005</errcode><errtext>Object not found</errtext>"
        "</result></get></site></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    with pytest.raises(PleskAPIError) as exc_info:
        client.get_site_id("nonexistent.com")
    assert exc_info.value.errcode == "1005"


# ── create_mailbox ──────────────────────────────────────────────


@patch("plesk_client.requests.Session")
def test_create_mailbox_success(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<mail><create><result><status>ok</status>"
        "<id>99</id></result></create></mail></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    mail_id = client.create_mailbox(42, "user", "P@ssw0rd!")
    assert mail_id == 99


@patch("plesk_client.requests.Session")
def test_create_mailbox_duplicate(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<mail><create><result><status>error</status>"
        "<errcode>1007</errcode><errtext>Mailname already exists</errtext>"
        "</result></create></mail></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    with pytest.raises(PleskAPIError) as exc_info:
        client.create_mailbox(42, "user", "P@ssw0rd!")
    assert exc_info.value.errcode == "1007"


# ── list_mailboxes ──────────────────────────────────────────────


@patch("plesk_client.requests.Session")
def test_list_mailboxes(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<mail><get_info>"
        "<result><status>ok</status><mailname><name>alice</name>"
        "<mailbox><enabled>true</enabled></mailbox></mailname></result>"
        "<result><status>ok</status><mailname><name>bob</name>"
        "<mailbox><enabled>false</enabled></mailbox></mailname></result>"
        "</get_info></mail></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    mboxes = client.list_mailboxes(42)
    assert len(mboxes) == 2
    assert mboxes[0] == PleskMailbox(name="alice", enabled=True, site_id=42)
    assert mboxes[1] == PleskMailbox(name="bob", enabled=False, site_id=42)


# ── delete_mailbox (idempotent) ─────────────────────────────────


@patch("plesk_client.requests.Session")
def test_delete_mailbox_idempotent(mock_session_cls):
    mock_session = MagicMock()
    mock_session_cls.return_value = mock_session
    mock_session.post.return_value = _mock_response(
        '<?xml version="1.0"?><packet version="1.6.9.1">'
        "<mail><remove><result><status>error</status>"
        "<errcode>1013</errcode><errtext>Mailbox not found</errtext>"
        "</result></remove></mail></packet>"
    )

    client = PleskClient("test.example.com", "admin", "pass")
    # Without idempotent → raises
    with pytest.raises(PleskAPIError):
        client.delete_mailbox(42, "gone")

    # With idempotent → succeeds
    result = client.delete_mailbox(42, "gone", idempotent=True)
    assert result is True


# ── PleskMailbox dataclass ──────────────────────────────────────


def test_mailbox_dataclass_frozen():
    mb = PleskMailbox(name="test", enabled=True, site_id=1)
    with pytest.raises(AttributeError):
        mb.name = "changed"  # type: ignore[misc]

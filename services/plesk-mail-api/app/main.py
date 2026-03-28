"""Plesk Mail API — FastAPI REST wrapper.

Provides a JSON API over Plesk's XML API for mail provisioning.
Run: uvicorn app.main:app --host 0.0.0.0 --port 8005
"""

from __future__ import annotations

import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

load_dotenv()

# Ensure parent dir is importable for plesk_client
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from app.plesk_service import PleskService  # noqa: E402
from plesk_client import PleskAPIError  # noqa: E402

# ── Logging ─────────────────────────────────────────────────────

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
logger = logging.getLogger("plesk_api")

# ── Lifespan ────────────────────────────────────────────────────

_plesk: PleskService | None = None


def get_plesk() -> PleskService:
    if _plesk is None:
        raise RuntimeError("PleskService not initialized")
    return _plesk


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    global _plesk
    host = os.environ.get("PLESK_HOST", "")
    login = os.environ.get("PLESK_LOGIN", "")
    password = os.environ.get("PLESK_PASSWORD", "")
    if not all([host, login, password]):
        logger.error("Missing PLESK_HOST, PLESK_LOGIN, or PLESK_PASSWORD")
        raise SystemExit(1)

    kwargs: dict = {}
    port = os.getenv("PLESK_PORT")
    if port:
        kwargs["port"] = int(port)
    ca_cert = os.getenv("PLESK_CA_CERT")
    if ca_cert:
        kwargs["verify_ssl"] = ca_cert

    _plesk = PleskService(host=host, login=login, password=password, **kwargs)
    logger.info("PleskService started")
    yield
    _plesk.close()
    logger.info("PleskService stopped")


# ── App ─────────────────────────────────────────────────────────

app = FastAPI(
    title="Plesk Mail API",
    description="REST-Wrapper für Plesk Obsidian XML API — Mail Provisioning",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Request/Response Models ─────────────────────────────────────


class CreateMailboxRequest(BaseModel):
    domain: str = Field(..., examples=["menschlichkeit-oesterreich.at"])
    name: str = Field(..., min_length=1, max_length=64, examples=["newsletter"])
    password: str = Field(..., min_length=8, max_length=128)


class UpdatePasswordRequest(BaseModel):
    domain: str = Field(..., examples=["menschlichkeit-oesterreich.at"])
    name: str = Field(..., min_length=1, max_length=64)
    new_password: str = Field(..., min_length=8, max_length=128)


class EnableMailboxRequest(BaseModel):
    domain: str
    name: str
    enabled: bool = True


class DeleteMailboxRequest(BaseModel):
    domain: str
    name: str
    idempotent: bool = False


class MailboxOut(BaseModel):
    name: str
    enabled: bool
    site_id: int


class CreateMailboxResponse(BaseModel):
    id: int
    name: str
    domain: str


class StatusResponse(BaseModel):
    status: str = "ok"


# ── Error helper ────────────────────────────────────────────────


def _handle_plesk_error(exc: PleskAPIError, context: str) -> HTTPException:
    logger.error("%s failed: [%s] %s", context, exc.errcode, exc.errtext)
    code_map = {
        "1001": status.HTTP_401_UNAUTHORIZED,
        "1003": status.HTTP_403_FORBIDDEN,
        "1005": status.HTTP_404_NOT_FOUND,
        "1007": status.HTTP_409_CONFLICT,
        "1013": status.HTTP_404_NOT_FOUND,
        "1023": status.HTTP_429_TOO_MANY_REQUESTS,
    }
    http_status = code_map.get(exc.errcode, status.HTTP_400_BAD_REQUEST)
    return HTTPException(
        status_code=http_status,
        detail={"errcode": exc.errcode, "errtext": exc.errtext},
    )


# ── Routes ──────────────────────────────────────────────────────


@app.post(
    "/mailboxes",
    response_model=CreateMailboxResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mailbox erstellen",
)
def create_mailbox(req: CreateMailboxRequest) -> CreateMailboxResponse:
    try:
        mail_id = get_plesk().create_mailbox(req.domain, req.name, req.password)
        return CreateMailboxResponse(id=mail_id, name=req.name, domain=req.domain)
    except PleskAPIError as exc:
        raise _handle_plesk_error(exc, "create_mailbox")


@app.get(
    "/mailboxes/{domain}",
    response_model=list[MailboxOut],
    summary="Mailboxen auflisten",
)
def list_mailboxes(domain: str) -> list[dict]:
    try:
        return get_plesk().list_mailboxes(domain)
    except PleskAPIError as exc:
        raise _handle_plesk_error(exc, "list_mailboxes")


@app.patch(
    "/mailboxes/password",
    response_model=StatusResponse,
    summary="Passwort ändern",
)
def update_password(req: UpdatePasswordRequest) -> StatusResponse:
    try:
        get_plesk().update_mailbox_password(req.domain, req.name, req.new_password)
        return StatusResponse()
    except PleskAPIError as exc:
        raise _handle_plesk_error(exc, "update_password")


@app.patch(
    "/mailboxes/enable",
    response_model=StatusResponse,
    summary="Mailbox aktivieren/deaktivieren",
)
def enable_mailbox(req: EnableMailboxRequest) -> StatusResponse:
    try:
        get_plesk().enable_mailbox(req.domain, req.name, req.enabled)
        return StatusResponse()
    except PleskAPIError as exc:
        raise _handle_plesk_error(exc, "enable_mailbox")


@app.delete(
    "/mailboxes",
    response_model=StatusResponse,
    summary="Mailbox löschen",
)
def delete_mailbox(req: DeleteMailboxRequest) -> StatusResponse:
    try:
        get_plesk().delete_mailbox(req.domain, req.name, idempotent=req.idempotent)
        return StatusResponse()
    except PleskAPIError as exc:
        raise _handle_plesk_error(exc, "delete_mailbox")


@app.get("/health", summary="Health Check")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "plesk-mail-api"}

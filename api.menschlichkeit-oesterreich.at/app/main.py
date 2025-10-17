from fastapi import FastAPI, HTTPException, Depends, Header, Body, Path, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import httpx
import os
import jwt
from typing import Optional, List, Dict, Any
import json
import uuid
import asyncio
import time
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formatdate
import io
import hashlib

# Import shared utilities
from app.shared import ApiResponse, verify_jwt_token


# Environment Configuration
logger = logging.getLogger("moe-api.config")


def _require_env(var_name: str, *, allow_blank: bool = False) -> str:
    value = os.getenv(var_name)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    value = value.strip()
    if not allow_blank and value == "":
        raise RuntimeError(f"Environment variable {var_name} must not be blank")
    return value


def _split_csv(var_name: str, default: Optional[str] = None) -> List[str]:
    raw = os.getenv(var_name)
    if raw is None:
        raw = default or ""
    return [entry.strip() for entry in raw.split(',') if entry.strip()]


def _parse_bool(var_name: str, default: bool) -> bool:
    raw = os.getenv(var_name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "t", "yes", "y"}


def _parse_int(var_name: str, default: int) -> int:
    raw = os.getenv(var_name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise RuntimeError(f"Environment variable {var_name} must be an integer") from exc


APP_ENV = os.getenv("APP_ENV", "development").strip().lower()

CIVI_BASE_URL = os.getenv("CIVI_BASE_URL", "https://crm.menschlichkeit-oesterreich.at")
CIVI_SITE_KEY = _require_env("CIVI_SITE_KEY")
CIVI_API_KEY = _require_env("CIVI_API_KEY")
JWT_SECRET = _require_env("JWT_SECRET")

_default_dev_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4180",
    "http://127.0.0.1:4180",
]

frontend_origins_raw = os.getenv("FRONTEND_ORIGINS")
if frontend_origins_raw:
    allow_origins = [entry.strip() for entry in frontend_origins_raw.split(',') if entry.strip()]
    if not allow_origins:
        raise RuntimeError("FRONTEND_ORIGINS must contain at least one origin when defined.")
elif APP_ENV in {"development", "local", "test"}:
    allow_origins = _default_dev_origins
else:
    raise RuntimeError("FRONTEND_ORIGINS must be set for non-development environments.")

allow_methods = _split_csv("CORS_ALLOW_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS") or [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

allow_headers = _split_csv("CORS_ALLOW_HEADERS", "Authorization,Content-Type,Accept") or [
    "Authorization",
    "Content-Type",
    "Accept",
]

expose_headers = _split_csv("CORS_EXPOSE_HEADERS", "")
allow_credentials = _parse_bool("CORS_ALLOW_CREDENTIALS", True)
cors_max_age = _parse_int("CORS_MAX_AGE_SECONDS", 600)

logger.debug("Loaded CORS configuration (env=%s, origins=%s, allow_credentials=%s, max_age=%s)", APP_ENV, allow_origins, allow_credentials, cors_max_age)


app = FastAPI(
    title="Menschlichkeit Oesterreich API",
    description="CRM Integration API with JWT Authentication & GDPR Compliance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
    expose_headers=expose_headers,
    max_age=cors_max_age,
)

# Add security middlewares
try:
    from app.middleware.security import RateLimitMiddleware, SecurityHeadersMiddleware
    
    # Rate limiting: 10 req/s for general endpoints, 5 req/min for auth
    app.add_middleware(RateLimitMiddleware, requests_per_second=10, auth_requests_per_minute=5)
    
    # Security headers: CSP, HSTS, X-Frame-Options, etc.
    app.add_middleware(SecurityHeadersMiddleware)
    
    logger.info("Security middlewares enabled (rate limiting + security headers)")
except Exception as e:
    logger.warning(f"Failed to load security middlewares: {e}")

# Mount routers
try:
    from app.routes.privacy import router as privacy_router
    app.include_router(privacy_router)
except Exception:
    # Router is optional during initial bootstrap; verify_privacy_api.py checks integration
    pass

# Import Privacy Routes (GDPR Art. 17 Right to Erasure)
from app.routes.privacy import router as privacy_router
app.include_router(privacy_router)

# Data Models
class ContactCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class MembershipCreate(BaseModel):
    contact_id: int
    membership_type_id: int = 1
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class RefreshRequest(BaseModel):
    refresh_token: str

class ContactUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class MembershipUpdate(BaseModel):
    membership_type_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SepaMandateCreate(BaseModel):
    contact_id: int
    iban: str
    bic: Optional[str] = None
    account_holder: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None  # e.g., 'YEARLY', 'MONTHLY'


class PaymentInitRequest(BaseModel):
    amount: float
    currency: Optional[str] = "EUR"
    email: Optional[EmailStr] = None
    contact_id: Optional[int] = None
    purpose: Optional[str] = None
    method: Optional[str] = None  # 'card' | 'sepa' | 'eps' | 'sofort'
    financial_type: Optional[str] = "donation"


class PayPalCaptureRequest(BaseModel):
    order_id: str
    email: Optional[EmailStr] = None
    contact_id: Optional[int] = None
    purpose: Optional[str] = None
    financial_type: Optional[str] = "donation"


class ReceiptTriggerRequest(BaseModel):
    email: Optional[EmailStr] = None
    contact_id: Optional[int] = None
    amount: float
    currency: Optional[str] = "EUR"
    purpose: Optional[str] = None
    provider: Optional[str] = None
    trxn_id: Optional[str] = None


# --- Queue models ---
class QueuePushRequest(BaseModel):
    payload: Dict[str, Any]
    max_attempts: Optional[int] = 5
    delay_seconds: Optional[int] = 0


class QueueItem(BaseModel):
    id: str
    payload: Dict[str, Any]
    attempts: int
    max_attempts: int
    enqueued_at: int
    updated_at: int


class QueueAckRequest(BaseModel):
    id: str
    error: Optional[str] = None


class DlqRequeueRequest(BaseModel):
    id: str
    delay_seconds: Optional[int] = 60


class DlqPurgeRequest(BaseModel):
    id: Optional[str] = None  # when None, purge all


class ContributionCreate(BaseModel):
    email: Optional[EmailStr] = None
    contact_id: Optional[int] = None
    amount: float
    currency: Optional[str] = "EUR"
    financial_type: Optional[str] = "donation"  # 'donation' | 'membership_fee'
    purpose: Optional[str] = None
    anonymous: Optional[bool] = None
    tribute_name: Optional[str] = None
    payment_instrument: str  # see mapping below


class ContributionRecurCreate(BaseModel):
    email: Optional[EmailStr] = None
    contact_id: Optional[int] = None
    amount: float
    currency: Optional[str] = "EUR"
    interval: str  # 'monthly' | 'quarterly' | 'yearly'
    financial_type: Optional[str] = "donation"
    purpose: Optional[str] = None
    payment_instrument: str


class ContactResponse(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    communication_style_id: Optional[int] = None
    extra: Dict[str, Any] | None = None


class MembershipResponse(BaseModel):
    id: int
    contact_id: int
    membership_type_id: int
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    auto_renew: Optional[bool] = None
    extra: Dict[str, Any] | None = None


class AuthTokens(BaseModel):
    token: str
    refresh_token: Optional[str] = None
    expires_in: int


class RegisterResult(BaseModel):
    contact: ContactResponse
    tokens: Optional[AuthTokens] = None




def _extract_first_value(data: dict) -> Optional[dict]:
    """Best-effort extraction of first record from CiviCRM APIv4 response."""
    try:
        if isinstance(data, dict):
            # Common v4 pattern: { 'values': [ {...}, ... ], 'count': N }
            values = data.get("values")
            if isinstance(values, list) and values:
                return values[0]
            # Some responses may embed records directly
            if data:
                return data
    except Exception:
        pass
    return None

# Removed duplicate verify_jwt_token - now imported from shared.py


def _create_token(sub: str, ttl_seconds: int, token_type: str = "access") -> str:
    now = int(time.time())
    jti = str(uuid.uuid4()) if token_type == "refresh" else None
    payload = {
        "sub": sub,
        "type": token_type,
        "exp": now + ttl_seconds,
        "iat": now,
    }
    if jti:
        payload["jti"] = jti
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# Refresh token store (supports memory/redis via env)
try:
    from app.lib.refresh_store import RefreshStore  # type: ignore
except Exception:
    # Fallback path if running as module
    from .lib.refresh_store import RefreshStore  # type: ignore

_refresh_store = RefreshStore()


def _serialize_contact(contact: Dict[str, Any]) -> ContactResponse:
    email_value = contact.get('email') or contact.get('email_primary') or contact.get('emailId')
    email_parsed = EmailStr(str(email_value)) if email_value else None
    return ContactResponse(
        id=int(contact.get('id')),
        email=email_parsed,
        first_name=contact.get('first_name'),
        last_name=contact.get('last_name'),
        communication_style_id=contact.get('communication_style_id'),
        extra={k: v for k, v in contact.items() if k not in {'id', 'email', 'email_primary', 'emailId', 'first_name', 'last_name', 'communication_style_id'}} or None,
    )


def _serialize_membership(membership: Dict[str, Any]) -> MembershipResponse:
    return MembershipResponse(
        id=int(membership.get('id')),
        contact_id=int(membership.get('contact_id')),
        membership_type_id=int(membership.get('membership_type_id')),
        status=membership.get('status'),
        start_date=membership.get('start_date'),
        end_date=membership.get('end_date'),
        auto_renew=membership.get('auto_renew'),
        extra={k: v for k, v in membership.items() if k not in {'id', 'contact_id', 'membership_type_id', 'status', 'start_date', 'end_date', 'auto_renew'}} or None,
    )


async def _civicrm_contact_get(*, contact_id: Optional[int] = None, email: Optional[str] = None) -> Dict[str, Any]:
    params: Dict[str, Any] = {"limit": 1}
    if contact_id is not None:
        params['id'] = contact_id
    if email is not None:
        params['email'] = email
    data = await civicrm_api_call("Contact", "get", params)
    contact = _extract_first_value(data)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


async def _civicrm_contact_create_or_update(payload: Dict[str, Any]) -> Dict[str, Any]:
    data = await civicrm_api_call("Contact", "create", payload)
    return _extract_first_value(data) or data


async def _civicrm_memberships_get(contact_id: int) -> List[Dict[str, Any]]:
    data = await civicrm_api_call("Membership", "get", {"contact_id": contact_id})
    if isinstance(data, dict):
        values = data.get('values') or []
        return list(values)
    return []


async def _civicrm_membership_update(membership_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    params = {"id": membership_id, **payload}
    data = await civicrm_api_call("Membership", "create", params)
    return _extract_first_value(data) or data


# Health Check
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "moe-api", "version": "1.0.0"}

# CiviCRM Integration Helper
async def civicrm_api_call(entity: str, action: str, params: dict):
    """Make authenticated call to CiviCRM APIv4"""
    payload = {
        "params": params,
        "_authx": {
            "api_key": CIVI_API_KEY,
            "key": CIVI_SITE_KEY
        }
    }
    
    url = f"{CIVI_BASE_URL}/civicrm/ajax/api4/{entity}/{action}"
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, json=payload)
        
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="CiviCRM API unavailable")
    
    try:
        data = response.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Invalid response from CiviCRM")
    
    if isinstance(data, dict) and data.get("is_error"):
        raise HTTPException(status_code=400, detail=data.get("error_message", "CiviCRM error"))
    
    return data

# API Endpoints

@app.post("/auth/login", response_model=ApiResponse)
async def login(request: LoginRequest) -> ApiResponse:
    """Authenticate a contact via email and issue access/refresh tokens."""
    email = request.email.lower()
    try:
        contact_record = await _civicrm_contact_get(email=email)
    except HTTPException as exc:
        if exc.status_code == 404:
            raise HTTPException(status_code=401, detail="Invalid credentials") from exc
        raise

    refresh_jwt = _create_token(email, 3600 * 24 * 7, token_type="refresh")
    try:
        refresh_payload = jwt.decode(refresh_jwt, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to issue refresh token")
    jti = str(refresh_payload.get("jti"))
    if not jti:
        raise HTTPException(status_code=500, detail="Missing refresh token id")
    _refresh_store.set_current(email, jti)
    tokens = AuthTokens(
        token=_create_token(email, 3600, token_type="access"),
        refresh_token=refresh_jwt,
        expires_in=3600,
    )

    payload = {
        "tokens": tokens.model_dump(),
        "contact": _serialize_contact(contact_record).model_dump(),
    }
    return ApiResponse(success=True, data=payload, message="Login successful")

@app.post("/auth/register", response_model=ApiResponse)
async def register(request: RegisterRequest) -> ApiResponse:
    """Create or update a CiviCRM contact and issue initial tokens."""
    email = request.email.lower()
    payload = {"contact_type": "Individual", "email": email}
    if request.first_name:
        payload["first_name"] = request.first_name
    if request.last_name:
        payload["last_name"] = request.last_name

    try:
        existing = await _civicrm_contact_get(email=email)
        payload["id"] = existing.get("id")
    except HTTPException as exc:
        if exc.status_code != 404:
            raise

    contact_record = await _civicrm_contact_create_or_update(payload)

    refresh_jwt = _create_token(email, 3600 * 24 * 7, token_type="refresh")
    try:
        rp = jwt.decode(refresh_jwt, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to issue refresh token")
    jti = str(rp.get("jti"))
    if not jti:
        raise HTTPException(status_code=500, detail="Missing refresh token id")
    _refresh_store.set_current(email, jti)
    tokens = AuthTokens(
        token=_create_token(email, 3600, token_type="access"),
        refresh_token=refresh_jwt,
        expires_in=3600,
    )
    response = RegisterResult(
        contact=_serialize_contact(contact_record),
        tokens=tokens,
    )
    return ApiResponse(success=True, data=response.model_dump(), message="Registration successful")

@app.post("/auth/refresh", response_model=ApiResponse)
async def refresh_token(req: RefreshRequest) -> ApiResponse:
    """Issue a new access/refresh token pair from a valid refresh token."""
    try:
        payload = jwt.decode(req.refresh_token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Refresh token expired") from exc
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Enforce rotation: token must match latest JTI
    expected_jti = _refresh_store.get_current(subject) or ""
    provided_jti = str(payload.get("jti") or "")
    if not provided_jti or expected_jti and provided_jti != expected_jti:
        raise HTTPException(status_code=401, detail="Refresh token reused or invalid")

    # Issue new pair and rotate stored JTI
    new_refresh = _create_token(subject, 3600 * 24 * 7, token_type="refresh")
    try:
        new_payload = jwt.decode(new_refresh, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to rotate refresh token")
    new_jti = str(new_payload.get("jti") or "")
    if not new_jti:
        raise HTTPException(status_code=500, detail="Missing refresh token id")
    _refresh_store.set_current(subject, new_jti)
    tokens = AuthTokens(
        token=_create_token(subject, 3600, token_type="access"),
        refresh_token=new_refresh,
        expires_in=3600,
    )

    try:
        contact_record = await _civicrm_contact_get(email=subject)
    except HTTPException as exc:
        if exc.status_code == 404:
            contact_record = None
        else:
            raise

    data = {
        "tokens": tokens.model_dump(),
        "contact": _serialize_contact(contact_record).model_dump() if contact_record else None,
    }
    return ApiResponse(success=True, data=data, message="Tokens refreshed")

@app.get("/user/profile", response_model=ApiResponse)
async def get_user_profile(payload: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    contact_record = await _civicrm_contact_get(email=email)
    return ApiResponse(success=True, data=_serialize_contact(contact_record).model_dump(), message="Profile fetched")

@app.put("/user/profile", response_model=ApiResponse)
async def update_user_profile(update: ContactUpdate, payload: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    if not any([update.email, update.first_name is not None, update.last_name is not None]):
        raise HTTPException(status_code=400, detail="No update fields supplied")

    contact_record = await _civicrm_contact_get(email=email)
    params: Dict[str, Any] = {"id": contact_record.get("id")}
    if update.email:
        params["email"] = str(update.email)
    if update.first_name is not None:
        params["first_name"] = update.first_name
    if update.last_name is not None:
        params["last_name"] = update.last_name

    updated_contact = await _civicrm_contact_create_or_update(params)
    return ApiResponse(success=True, data=_serialize_contact(updated_contact).model_dump(), message="Profile updated")

@app.post("/contacts/create", response_model=ApiResponse)
async def create_contact(contact: ContactCreate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    params: Dict[str, Any] = {
        "contact_type": "Individual",
        "email": contact.email.lower(),
    }
    if contact.first_name:
        params["first_name"] = contact.first_name
    if contact.last_name:
        params["last_name"] = contact.last_name

    created = await _civicrm_contact_create_or_update(params)
    return ApiResponse(success=True, data=_serialize_contact(created).model_dump(), message="Contact created")

@app.get("/contacts/search", response_model=ApiResponse)
async def search_all_contacts(_: Dict[str, Any] = Depends(verify_jwt_token), limit: int = 100, offset: int = 0) -> ApiResponse:
    """Search for all contacts with membership information (DSGVO-compliant)"""
    try:
        # Get contacts with memberships
        params = {
            "select": [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone",
                "birth_date",
                "street_address",
                "city",
                "postal_code",
                "modified_date",
            ],
            "limit": limit,
            "offset": offset,
            "orderBy": {"modified_date": "DESC"},
        }
        
        contacts_data = await civicrm_api_call("Contact", "get", params)
        contacts = contacts_data.get("values", [])
        
        # Get memberships for each contact
        enriched_contacts = []
        for contact in contacts:
            contact_id = contact.get("id")
            memberships = await _civicrm_memberships_get(contact_id)
            
            # Get active membership if exists
            active_membership = None
            if memberships:
                active_membership = next(
                    (m for m in memberships if m.get("status_id") == 1),
                    memberships[0] if memberships else None
                )
            
            enriched_contact = {
                "id": contact_id,
                "first_name": contact.get("first_name", ""),
                "last_name": contact.get("last_name", ""),
                "email": contact.get("email", ""),
                "phone": contact.get("phone"),
                "birth_date": contact.get("birth_date"),
                "address": contact.get("street_address"),
                "city": contact.get("city"),
                "postal_code": contact.get("postal_code"),
                "membership_type": active_membership.get("membership_name") if active_membership else None,
                "membership_status": "active" if active_membership and active_membership.get("status_id") == 1 else "inactive",
                "join_date": active_membership.get("join_date") if active_membership else None,
                "end_date": active_membership.get("end_date") if active_membership else None,
            }
            enriched_contacts.append(enriched_contact)
        
        return ApiResponse(
            success=True,
            data={"contacts": enriched_contacts, "total": len(enriched_contacts)},
            message="Contacts fetched successfully"
        )
    except Exception as e:
        logger.error(f"Error fetching contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")

@app.get("/contacts/{contact_id}", response_model=ApiResponse)
async def get_contact(contact_id: int = Path(..., gt=0), _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    contact_record = await _civicrm_contact_get(contact_id=contact_id)
    return ApiResponse(success=True, data=_serialize_contact(contact_record).model_dump(), message="Contact fetched")

@app.put("/contacts/{contact_id}", response_model=ApiResponse)
async def update_contact(contact_id: int, update: ContactUpdate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    """Update contact information (DSGVO-compliant with audit log)"""
    if not any([update.email, update.first_name is not None, update.last_name is not None]):
        raise HTTPException(status_code=400, detail="No update fields supplied")

    params: Dict[str, Any] = {"id": contact_id}
    if update.email:
        params["email"] = str(update.email)
    if update.first_name is not None:
        params["first_name"] = update.first_name
    if update.last_name is not None:
        params["last_name"] = update.last_name
    
    # Extended fields from request body
    raw_body = await request.json() if hasattr(request, 'json') else {}
    if "phone" in raw_body:
        params["phone"] = raw_body["phone"]
    if "birth_date" in raw_body:
        params["birth_date"] = raw_body["birth_date"]
    if "street_address" in raw_body:
        params["street_address"] = raw_body["street_address"]
    if "city" in raw_body:
        params["city"] = raw_body["city"]
    if "postal_code" in raw_body:
        params["postal_code"] = raw_body["postal_code"]

    updated_contact = await _civicrm_contact_create_or_update(params)
    return ApiResponse(success=True, data=_serialize_contact(updated_contact).model_dump(), message="Contact updated")

@app.post("/memberships/create", response_model=ApiResponse)
async def create_membership(membership: MembershipCreate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    """Create a new membership in CiviCRM."""
    import datetime

    params: Dict[str, Any] = {
        "contact_id": membership.contact_id,
        "membership_type_id": membership.membership_type_id,
        "join_date": membership.start_date or datetime.date.today().isoformat(),
        "start_date": membership.start_date or datetime.date.today().isoformat(),
    }
    if membership.end_date:
        params["end_date"] = membership.end_date

    created = await civicrm_api_call("Membership", "create", params)
    membership_record = _extract_first_value(created) or created
    return ApiResponse(
        success=True,
        data=_serialize_membership(membership_record).model_dump(),
        message="Membership created successfully",
    )


@app.get("/memberships/contact/{contact_id}", response_model=ApiResponse)
async def get_memberships_for_contact(contact_id: int, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    memberships = [_serialize_membership(entry).model_dump() for entry in await _civicrm_memberships_get(contact_id)]
    return ApiResponse(success=True, data={"memberships": memberships}, message="Memberships fetched")


@app.put("/memberships/{membership_id}", response_model=ApiResponse)
async def update_membership(membership_id: int, update: MembershipUpdate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    if not any([update.membership_type_id is not None, update.start_date is not None, update.end_date is not None]):
        raise HTTPException(status_code=400, detail="No update fields supplied")

    payload: Dict[str, Any] = {}
    if update.membership_type_id is not None:
        payload["membership_type_id"] = update.membership_type_id
    if update.start_date is not None:
        payload["start_date"] = update.start_date
    if update.end_date is not None:
        payload["end_date"] = update.end_date

    updated = await _civicrm_membership_update(membership_id, payload)
    return ApiResponse(success=True, data=_serialize_membership(updated).model_dump(), message="Membership updated")


# --- Contributions (Donations & Fees) ---
_PAYMENT_INSTRUMENT_MAP: Dict[str, int] = {
    # Note: IDs depend on CiviCRM option values; adjust via env/config if needed.
    "bank_transfer": 1,
    "sepa": 2,
    "visa": 3,
    "mastercard": 4,
    "amex": 5,
    "paypal": 6,
    "apple_pay": 7,
    "google_pay": 8,
    "eps": 9,
    "sofort": 10,
    "revolut": 11,
    "wise": 12,
    "pos": 13,
    "cash": 14,
}

_FINANCIAL_TYPE_MAP: Dict[str, int] = {
    "donation": 1,
    "membership_fee": 2,
}

# Optional override via environment (JSON-encoded mapping)
try:
    _pi_raw = os.getenv("PAYMENT_INSTRUMENT_MAP_JSON")
    if _pi_raw:
        _PAYMENT_INSTRUMENT_MAP.update(json.loads(_pi_raw))
except Exception:
    logger.warning("Invalid PAYMENT_INSTRUMENT_MAP_JSON; using defaults")

try:
    _ft_raw = os.getenv("FINANCIAL_TYPE_MAP_JSON")
    if _ft_raw:
        _FINANCIAL_TYPE_MAP.update(json.loads(_ft_raw))
except Exception:
    logger.warning("Invalid FINANCIAL_TYPE_MAP_JSON; using defaults")


# PSP configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "").strip()
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "").strip()
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com").strip()
ORG_NAME = os.getenv("ORG_NAME", "Menschlichkeit Österreich").strip()
ORG_ADDRESS_LINE1 = os.getenv("ORG_ADDRESS_LINE1", "").strip()
ORG_ADDRESS_LINE2 = os.getenv("ORG_ADDRESS_LINE2", "").strip()
ORG_ADDRESS_ZIP = os.getenv("ORG_ADDRESS_ZIP", "").strip()
ORG_ADDRESS_CITY = os.getenv("ORG_ADDRESS_CITY", "").strip()
ORG_ADDRESS_COUNTRY = os.getenv("ORG_ADDRESS_COUNTRY", "").strip()
ORG_LOGO_PATH = os.getenv("ORG_LOGO_PATH", "").strip()

# SMTP for receipts
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587").strip() or 587)
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@menschlichkeit-oesterreich.at").strip()
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "y"}

# Optional Redis for receipt counters
REDIS_URL = os.getenv("REDIS_URL", "").strip()
try:
    import redis as _redis_lib  # type: ignore
except Exception:
    _redis_lib = None  # type: ignore

_redis_client = None

def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not REDIS_URL or not _redis_lib:
        return None
    try:
        _redis_client = _redis_lib.from_url(REDIS_URL, decode_responses=True)
        # ping to verify
        _ = _redis_client.ping()
        return _redis_client
    except Exception:
        return None


def _amount_to_minor(amount: float, currency: str) -> int:
    cur = currency.upper()
    # For EUR and most currencies: 2 decimals
    return int(round(float(amount) * 100))


async def _ensure_contact_for_email(email: Optional[str], cid: Optional[int]) -> int:
    return await _ensure_contact_id(email, cid)


async def _stripe_request(path: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    url = f"https://api.stripe.com{path}"
    headers = {"Authorization": f"Bearer {STRIPE_SECRET_KEY}"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=data, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Stripe error: {resp.text[:200]}")
    try:
        return resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Invalid response from Stripe")


async def _paypal_get_token() -> str:
    if not (PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET):
        raise HTTPException(status_code=503, detail="PayPal not configured")
    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    data = {"grant_type": "client_credentials"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=data, auth=auth)
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"PayPal auth error: {resp.text[:200]}")
    return resp.json().get("access_token", "")


async def _paypal_request(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    token = await _paypal_get_token()
    url = f"{PAYPAL_API_BASE}{path}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"PayPal error: {resp.text[:200]}")
    try:
        return resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Invalid response from PayPal")


async def _paypal_capture(order_id: str) -> Dict[str, Any]:
    token = await _paypal_get_token()
    url = f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json={}, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"PayPal capture error: {resp.text[:200]}")
    try:
        return resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Invalid response from PayPal")


def _generate_receipt_pdf_bytes(
    *,
    amount: float,
    currency: str,
    purpose: str | None,
    provider: str | None,
    trxn_id: str | None,
    email: str | None,
    receipt_number: str,
) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.pdfgen import canvas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generator not available: {e}")

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 30 * mm
    c.setTitle(f"Spendenbeleg - {ORG_NAME}")
    c.setFont("Helvetica-Bold", 16)
    c.drawString(20 * mm, y, ORG_NAME)
    y -= 10 * mm
    # Header block
    c.setFont("Helvetica", 11)
    c.drawString(20 * mm, y, "Spenden-/Zahlungsbeleg")
    if ORG_LOGO_PATH and os.path.exists(ORG_LOGO_PATH):
        try:
            c.drawImage(ORG_LOGO_PATH, width - 60 * mm, height - 40 * mm, width=40 * mm, preserveAspectRatio=True, mask='auto')
        except Exception:
            pass
    y -= 12 * mm
    # Organization address
    c.setFont("Helvetica", 9)
    addr_lines = [
        ORG_ADDRESS_LINE1,
        ORG_ADDRESS_LINE2,
        " ".join([ORG_ADDRESS_ZIP, ORG_ADDRESS_CITY]).strip(),
        ORG_ADDRESS_COUNTRY,
    ]
    for line in [l for l in addr_lines if l]:
        c.drawString(20 * mm, y, line)
        y -= 6 * mm
    if addr_lines:
        y -= 2 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Belegnummer: {receipt_number}")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Betrag: {amount:.2f} {currency.upper()}")
    y -= 7 * mm
    c.drawString(20 * mm, y, f"Zweck: {purpose or 'Allgemein'}")
    y -= 7 * mm
    c.drawString(20 * mm, y, f"Zahlungsart: {provider or 'unbekannt'}")
    y -= 7 * mm
    if trxn_id:
        c.drawString(20 * mm, y, f"Transaktions-ID: {trxn_id}")
        y -= 7 * mm
    if email:
        c.drawString(20 * mm, y, f"E-Mail: {email}")
        y -= 7 * mm
    from datetime import datetime
    c.drawString(20 * mm, y, f"Datum: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%SZ')}")
    y -= 14 * mm
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(20 * mm, y, "Hinweis: Dieser Beleg wurde automatisch erstellt.")
    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()


def _next_receipt_number() -> str:
    from datetime import datetime
    year = datetime.utcnow().strftime('%Y')
    client = _get_redis()
    if client is not None:
        try:
            seq = int(client.incr(f"receipts:{year}"))
            return f"MOE-{year}-{seq:06d}"
        except Exception:
            pass
    # Fallback: timestamp-based (not strictly sequential across restarts)
    return f"MOE-{year}-{int(time.time())}"


# --- Simple Redis-backed queue for webhooks ---
_Q_NS = "moe:queue:webhooks"
_Q_MAIN = f"{_Q_NS}:main"
_Q_DLQ = f"{_Q_NS}:dlq"
_Q_DELAYED = f"{_Q_NS}:delayed"
_Q_MSG = f"{_Q_NS}:msg"


def _queue_now() -> int:
    return int(time.time())


def _queue_key_msg(msg_id: str) -> str:
    return f"{_Q_MSG}:{msg_id}"


@app.post("/queue/push", response_model=ApiResponse)
async def queue_push(
    req: QueuePushRequest,
    _: Dict[str, Any] = Depends(verify_jwt_token),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    # Idempotency: return existing id for provided key within TTL
    if idempotency_key:
        key_hash = hashlib.sha256(idempotency_key.encode("utf-8")).hexdigest()
        idemp_key = f"{_Q_NS}:idemp:{key_hash}"
        existing = r.get(idemp_key)
        if existing:
            return ApiResponse(success=True, data={"id": existing}, message="Enqueued (idempotent)")
    msg_id = str(uuid.uuid4())
    now = _queue_now()
    record = {
        "id": msg_id,
        "payload": req.payload,
        "attempts": 0,
        "max_attempts": int(req.max_attempts or 5),
        "enqueued_at": now,
        "updated_at": now,
    }
    r.hset(_queue_key_msg(msg_id), mapping={
        "payload": json.dumps(req.payload),
        "attempts": "0",
        "max_attempts": str(int(req.max_attempts or 5)),
        "enqueued_at": str(now),
        "updated_at": str(now),
    })
    if int(req.delay_seconds or 0) > 0:
        r.zadd(_Q_DELAYED, {msg_id: now + int(req.delay_seconds or 0)})
    else:
        r.lpush(_Q_MAIN, msg_id)
    if idempotency_key:
        # store mapping for 24h
        r.setex(idemp_key, 24 * 3600, msg_id)
    return ApiResponse(success=True, data={"id": msg_id}, message="Enqueued")


def _promote_due(r) -> None:
    now = _queue_now()
    due = r.zrangebyscore(_Q_DELAYED, "-inf", now)
    if due:
        # move to main and remove from delayed
        for msg_id in due:
            r.lpush(_Q_MAIN, msg_id)
        r.zremrangebyscore(_Q_DELAYED, "-inf", now)


@app.post("/queue/pop", response_model=ApiResponse)
async def queue_pop(_: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    _promote_due(r)
    msg_id = r.rpop(_Q_MAIN)
    if not msg_id:
        return ApiResponse(success=True, data=None, message="Empty queue")
    h = r.hgetall(_queue_key_msg(msg_id))
    if not h:
        return ApiResponse(success=True, data=None, message="Missing message payload")
    try:
        payload = json.loads(h.get("payload") or "{}")
    except Exception:
        payload = {}
    item = QueueItem(
        id=msg_id,
        payload=payload,
        attempts=int(h.get("attempts") or 0),
        max_attempts=int(h.get("max_attempts") or 5),
        enqueued_at=int(h.get("enqueued_at") or _queue_now()),
        updated_at=_queue_now(),
    )
    r.hset(_queue_key_msg(msg_id), mapping={"updated_at": str(item.updated_at)})
    return ApiResponse(success=True, data=item.model_dump(), message="Popped")


@app.post("/queue/ack", response_model=ApiResponse)
async def queue_ack(req: QueueAckRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    r.delete(_queue_key_msg(req.id))
    return ApiResponse(success=True, message="Acked")


@app.post("/queue/fail", response_model=ApiResponse)
async def queue_fail(req: QueueAckRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    h = r.hgetall(_queue_key_msg(req.id))
    if not h:
        return ApiResponse(success=False, message="Unknown message id")
    attempts = int(h.get("attempts") or 0) + 1
    max_attempts = int(h.get("max_attempts") or 5)
    r.hset(_queue_key_msg(req.id), mapping={
        "attempts": str(attempts),
        "updated_at": str(_queue_now()),
        "last_error": req.error or "",
    })
    if attempts >= max_attempts:
        r.lpush(_Q_DLQ, req.id)
        return ApiResponse(success=True, message="Moved to DLQ")
    # exponential backoff with cap 300s
    delay = min(300, 2 ** attempts)
    r.zadd(_Q_DELAYED, {req.id: _queue_now() + delay})
    return ApiResponse(success=True, data={"delay": delay}, message="Rescheduled")


@app.get("/queue/stats", response_model=ApiResponse)
async def queue_stats(_: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    _promote_due(r)
    try:
        size_main = int(r.llen(_Q_MAIN))
        size_delayed = int(r.zcard(_Q_DELAYED))
        size_dlq = int(r.llen(_Q_DLQ))
        oldest_main_id = r.lindex(_Q_MAIN, -1)
        oldest_age = None
        if oldest_main_id:
            h = r.hgetall(_queue_key_msg(oldest_main_id))
            enq = int(h.get("enqueued_at") or 0)
            if enq:
                oldest_age = _queue_now() - enq
        payload = {
            "main": {"size": size_main, "oldest_age_seconds": oldest_age},
            "delayed": {"size": size_delayed},
            "dlq": {"size": size_dlq},
        }
        return ApiResponse(success=True, data=payload, message="Queue stats")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {e}")


@app.get("/queue/dlq/list", response_model=ApiResponse)
async def queue_dlq_list(limit: int = 50, offset: int = 0, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    try:
        start = offset
        end = offset + max(0, limit) - 1
        ids = r.lrange(_Q_DLQ, start, end)
        items = []
        for msg_id in ids:
            h = r.hgetall(_queue_key_msg(msg_id)) or {}
            try:
                payload = json.loads(h.get("payload") or "{}")
            except Exception:
                payload = {}
            items.append({
                "id": msg_id,
                "attempts": int(h.get("attempts") or 0),
                "max_attempts": int(h.get("max_attempts") or 0),
                "enqueued_at": int(h.get("enqueued_at") or 0),
                "updated_at": int(h.get("updated_at") or 0),
                "last_error": h.get("last_error") or None,
                "payload": payload,
            })
        total = int(r.llen(_Q_DLQ))
        return ApiResponse(success=True, data={"total": total, "items": items}, message="DLQ list")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list DLQ: {e}")


@app.post("/queue/dlq/requeue", response_model=ApiResponse)
async def queue_dlq_requeue(req: DlqRequeueRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    # remove one occurrence of id from DLQ
    r.lrem(_Q_DLQ, 1, req.id)
    delay = int(req.delay_seconds or 0)
    when = _queue_now() + delay if delay > 0 else None
    if when is None:
        r.lpush(_Q_MAIN, req.id)
    else:
        r.zadd(_Q_DELAYED, {req.id: when})
    r.hset(_queue_key_msg(req.id), mapping={"updated_at": str(_queue_now())})
    return ApiResponse(success=True, data={"id": req.id, "delay_seconds": delay}, message="Requeued from DLQ")


@app.post("/queue/dlq/purge", response_model=ApiResponse)
async def queue_dlq_purge(req: DlqPurgeRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    r = _get_redis()
    if r is None:
        raise HTTPException(status_code=503, detail="Queue unavailable")
    purged = 0
    if req.id:
        r.lrem(_Q_DLQ, 1, req.id)
        r.delete(_queue_key_msg(req.id))
        purged = 1
    else:
        ids = r.lrange(_Q_DLQ, 0, -1) or []
        for mid in ids:
            r.delete(_queue_key_msg(mid))
        r.ltrim(_Q_DLQ, 1, 0)  # clear list
        purged = len(ids)
    return ApiResponse(success=True, data={"purged": purged}, message="DLQ purged")


# --- CiviCRM passthrough (controlled) ---
class CivicrmRequest(BaseModel):
    entity: str
    action: str
    params: Dict[str, Any] = {}


_CIVIC_ALLOWED: Dict[str, set[str]] = {
    "Contact": {"create", "get"},
    "Membership": {"create", "get"},
    "Contribution": {"create", "get"},
    "ContributionRecur": {"create", "get"},
    "SepaMandate": {"create", "get"},
}


@app.post("/civicrm", response_model=ApiResponse)
async def civicrm_passthrough(req: CivicrmRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    entity = str(req.entity or "").strip()
    action = str(req.action or "").strip()
    if not entity or not action:
        raise HTTPException(status_code=400, detail="entity and action required")
    allowed_actions = _CIVIC_ALLOWED.get(entity)
    if not allowed_actions or action not in allowed_actions:
        raise HTTPException(status_code=403, detail="Entity/action not allowed")
    try:
        res = await civicrm_api_call(entity, action, req.params or {})
        return ApiResponse(success=True, data=res, message=f"{entity}.{action} ok")
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="CiviCRM passthrough failed")


# Alerts: simple email send
class EmailAlertRequest(BaseModel):
    to: EmailStr
    subject: str
    text: str


@app.post("/alerts/email", response_model=ApiResponse)
async def send_alert_email(req: EmailAlertRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    _send_email_plain(to_email=str(req.to), subject=req.subject, text=req.text)
    return ApiResponse(success=True, message="Alert email sent")


def _send_email_with_attachment(*, to_email: str, subject: str, text: str, attachment_name: str, attachment_bytes: bytes):
    if not (SMTP_HOST and SMTP_FROM):
        raise HTTPException(status_code=503, detail="SMTP not configured")
    msg = EmailMessage()
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject
    msg.set_content(text)
    msg.add_attachment(attachment_bytes, maintype='application', subtype='pdf', filename=attachment_name)
    try:
        if SMTP_USE_TLS:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                s.starttls()
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASSWORD)
                s.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASSWORD)
                s.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SMTP send failed: {e}")


def _send_email_plain(*, to_email: str, subject: str, text: str):
    if not (SMTP_HOST and SMTP_FROM):
        raise HTTPException(status_code=503, detail="SMTP not configured")
    msg = EmailMessage()
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject
    msg.set_content(text)
    try:
        if SMTP_USE_TLS:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                s.starttls()
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASSWORD)
                s.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                if SMTP_USER:
                    s.login(SMTP_USER, SMTP_PASSWORD)
                s.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SMTP send failed: {e}")


async def _ensure_contact_id(email: Optional[str], contact_id: Optional[int]) -> int:
    if contact_id:
        return int(contact_id)
    if not email:
        raise HTTPException(status_code=400, detail="email or contact_id required")
    try:
        contact = await _civicrm_contact_get(email=email)
        return int(contact.get("id"))
    except HTTPException as exc:
        if exc.status_code != 404:
            raise
        # create minimal contact on-the-fly
        created = await _civicrm_contact_create_or_update({"contact_type": "Individual", "email": email})
        cid = created.get("id")
        if not cid:
            raise HTTPException(status_code=500, detail="Failed to create contact")
        return int(cid)


@app.post("/contributions/create", response_model=ApiResponse)
async def create_contribution(req: ContributionCreate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    import datetime

    cid = await _ensure_contact_id(req.email, req.contact_id)
    instrument_id = _PAYMENT_INSTRUMENT_MAP.get(req.payment_instrument, 1)
    ftype_id = _FINANCIAL_TYPE_MAP.get((req.financial_type or "donation").lower(), 1)

    params: Dict[str, Any] = {
        "contact_id": cid,
        "total_amount": req.amount,
        "currency": (req.currency or "EUR").upper(),
        "financial_type_id": ftype_id,
        "payment_instrument_id": instrument_id,
        "receive_date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
    }
    if req.purpose:
        params["source"] = req.purpose
    if req.anonymous is not None:
        params["is_anonymous"] = bool(req.anonymous)
    if req.tribute_name:
        params["thankyou_date"] = datetime.datetime.utcnow().strftime("%Y-%m-%d")  # placeholder marker

    created = await civicrm_api_call("Contribution", "create", params)
    return ApiResponse(success=True, data=created, message="Contribution created")


@app.post("/contributions/recur", response_model=ApiResponse)
async def create_contribution_recur(req: ContributionRecurCreate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    cid = await _ensure_contact_id(req.email, req.contact_id)
    instrument_id = _PAYMENT_INSTRUMENT_MAP.get(req.payment_instrument, 2)
    ftype_id = _FINANCIAL_TYPE_MAP.get((req.financial_type or "donation").lower(), 1)

    interval = (req.interval or "monthly").lower()
    if interval == "monthly":
        frequency_unit, frequency_interval = "month", 1
    elif interval == "quarterly":
        frequency_unit, frequency_interval = "month", 3
    elif interval == "yearly":
        frequency_unit, frequency_interval = "year", 1
    else:
        raise HTTPException(status_code=400, detail="Invalid interval")

    params: Dict[str, Any] = {
        "contact_id": cid,
        "amount": req.amount,
        "currency": (req.currency or "EUR").upper(),
        "financial_type_id": ftype_id,
        "payment_instrument_id": instrument_id,
        "frequency_unit": frequency_unit,
        "frequency_interval": frequency_interval,
        "installments": 0,  # open-ended
        "status": "Pending",
    }
    if req.purpose:
        params["description"] = req.purpose

    created = await civicrm_api_call("ContributionRecur", "create", params)
    return ApiResponse(success=True, data=created, message="Recurring contribution created")
@app.get("/contacts/search")
async def search_contacts(email: Optional[str] = None, _: dict = Depends(verify_jwt_token)):
    """Search for contacts in CiviCRM"""
    
    params = {"limit": 25}
    if email:
        params["email"] = email
    
    try:
        result = await civicrm_api_call("Contact", "get", params)
        return ApiResponse(
            success=True,
            data=result,
            message="Search completed"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/memberships/contact/{contact_id}", response_model=ApiResponse)
async def get_memberships_for_contact(contact_id: int, _: dict = Depends(verify_jwt_token)):
    params = {"contact_id": contact_id}
    try:
        result = await civicrm_api_call("Membership", "get", params)
        return ApiResponse(success=True, data=result, message="Memberships fetched")
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/memberships/{membership_id}", response_model=ApiResponse)
async def update_membership(membership_id: int, update: MembershipUpdate, _: dict = Depends(verify_jwt_token)):
    params = {"id": membership_id}
    if update.membership_type_id is not None:
        params["membership_type_id"] = update.membership_type_id
    if update.start_date is not None:
        params["start_date"] = update.start_date
    if update.end_date is not None:
        params["end_date"] = update.end_date
    try:
        result = await civicrm_api_call("Membership", "create", params)
        return ApiResponse(success=True, data=result, message="Membership updated")
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/sepa/mandate", response_model=ApiResponse)
async def create_sepa_mandate(mandate: SepaMandateCreate, _: dict = Depends(verify_jwt_token)):
    """Create SEPA mandate via CiviCRM SEPA extension (if available)."""
    params = {
        "contact_id": mandate.contact_id,
        "iban": mandate.iban,
    }
    if mandate.bic:
        params["bic"] = mandate.bic
    if mandate.account_holder:
        params["account_holder"] = mandate.account_holder
    if mandate.amount is not None:
        params["amount"] = mandate.amount
    if mandate.frequency:
        params["frequency"] = mandate.frequency
    try:
        result = await civicrm_api_call("SepaMandate", "create", params)
        return ApiResponse(success=True, data=result, message="SEPA mandate created")
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/sepa/mandate/{contact_id}", response_model=ApiResponse)
async def get_sepa_mandate(contact_id: int, _: dict = Depends(verify_jwt_token)):
    params = {"contact_id": contact_id, "limit": 1}
    try:
        result = await civicrm_api_call("SepaMandate", "get", params)
        return ApiResponse(success=True, data=result, message="SEPA mandate fetched")
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


# --- PSP Init/Webhooks (stubs, to implement) ---
class PaymentInitRequest(BaseModel):
    amount: float
    currency: Optional[str] = "EUR"
    email: Optional[EmailStr] = None
    purpose: Optional[str] = None


@app.post("/payments/stripe/intent", response_model=ApiResponse)
async def stripe_create_intent(req: PaymentInitRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    method = (req.method or "card").lower()
    pm_type = {
        "card": "card",
        "sepa": "sepa_debit",
        "eps": "eps",
        "sofort": "sofort",
    }.get(method, "card")
    currency = (req.currency or "EUR").upper()
    amount_minor = _amount_to_minor(req.amount, currency)

    metadata = {}
    if req.email:
        metadata["email"] = req.email
    if req.purpose:
        metadata["purpose"] = req.purpose
    if req.financial_type:
        metadata["financial_type"] = req.financial_type
    if req.contact_id:
        metadata["contact_id"] = str(req.contact_id)

    data: Dict[str, Any] = {
        "amount": str(amount_minor),
        "currency": currency.lower(),
        "metadata[email]": metadata.get("email", ""),
        "metadata[purpose]": metadata.get("purpose", ""),
        "metadata[financial_type]": metadata.get("financial_type", "donation"),
        "metadata[contact_id]": metadata.get("contact_id", ""),
    }

    # Use automatic payment methods unless method explicitly chosen
    if method in {"card", "sepa", "eps", "sofort"}:
        data["payment_method_types[]"] = pm_type
    else:
        data["automatic_payment_methods[enabled]"] = "true"

    intent = await _stripe_request("/v1/payment_intents", data)
    client_secret = intent.get("client_secret")
    return ApiResponse(success=True, data={"client_secret": client_secret, "payment_intent": intent}, message="Stripe intent created")


@app.post("/payments/paypal/order", response_model=ApiResponse)
async def paypal_create_order(req: PaymentInitRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    currency = (req.currency or "EUR").upper()
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": currency,
                    "value": f"{req.amount:.2f}",
                },
                "custom_id": (req.purpose or "donation"),
            }
        ],
        "application_context": {
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW",
        },
    }
    order = await _paypal_request("/v2/checkout/orders", payload)
    return ApiResponse(success=True, data=order, message="PayPal order created")


@app.post("/payments/paypal/capture", response_model=ApiResponse)
async def paypal_capture(req: PayPalCaptureRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    result = await _paypal_capture(req.order_id)
    # Extract amount and currency from capture response
    purchase_units = (result.get("purchase_units") or [{}])
    amount_info = (purchase_units[0].get("payments", {}).get("captures", [{}])[0].get("amount", {}))
    value = amount_info.get("value")
    currency_code = amount_info.get("currency_code", "EUR")
    try:
        amount = float(value)
    except Exception:
        amount = 0.0

    # Create CiviCRM contribution
    cid = await _ensure_contact_for_email(req.email, req.contact_id)
    await civicrm_api_call(
        "Contribution",
        "create",
        {
            "contact_id": cid,
            "total_amount": amount,
            "currency": currency_code,
            "financial_type_id": _FINANCIAL_TYPE_MAP.get((req.financial_type or "donation").lower(), 1),
            "payment_instrument_id": _PAYMENT_INSTRUMENT_MAP.get("paypal", 6),
            "source": req.purpose or "paypal",
            "trxn_id": result.get("id"),
            "contribution_status_id": 1,
        },
    )
    return ApiResponse(success=True, data=result, message="PayPal order captured")


@app.post("/receipts/trigger", response_model=ApiResponse)
async def trigger_receipt(req: ReceiptTriggerRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    logger.info("Receipt requested: email=%s, amount=%s %s, purpose=%s, provider=%s, trxn=%s",
                req.email, req.amount, req.currency, req.purpose, req.provider, req.trxn_id)
    receipt_no = _next_receipt_number()
    pdf_bytes = _generate_receipt_pdf_bytes(
        amount=req.amount,
        currency=req.currency or "EUR",
        purpose=req.purpose,
        provider=req.provider,
        trxn_id=req.trxn_id,
        email=req.email,
        receipt_number=receipt_no,
    )
    # Email if possible
    if req.email:
        _send_email_with_attachment(
            to_email=req.email,
            subject=f"{ORG_NAME} – Spendenbeleg {receipt_no}",
            text=f"Vielen Dank für Ihre Unterstützung! Im Anhang finden Sie den Beleg über {req.amount:.2f} {str(req.currency or 'EUR').upper()}.",
            attachment_name=f"beleg_{receipt_no}.pdf",
            attachment_bytes=pdf_bytes,
        )
    # Store activity (best-effort)
    try:
        cid = await _ensure_contact_id(req.email, req.contact_id)
        await civicrm_api_call("Activity", "create", {
            "source_contact_id": cid,
            "activity_type_id": "Email",
            "subject": f"Receipt sent: {receipt_no} – {req.amount} {req.currency}",
            "details": f"Purpose: {req.purpose or ''} | Provider: {req.provider or ''} | Trxn: {req.trxn_id or ''}",
            "status_id": "Completed",
        })
    except Exception:
        pass
    return ApiResponse(success=True, data={"receipt_number": receipt_no}, message="Receipt generated and email sent (if address provided)")


@app.post("/receipts/generate")
async def generate_receipt_pdf(req: ReceiptTriggerRequest, _: Dict[str, Any] = Depends(verify_jwt_token)):
    receipt_no = _next_receipt_number()
    pdf = _generate_receipt_pdf_bytes(
        amount=req.amount,
        currency=req.currency or "EUR",
        purpose=req.purpose,
        provider=req.provider,
        trxn_id=req.trxn_id,
        email=req.email,
        receipt_number=receipt_no,
    )
    filename = f"beleg_{receipt_no}.pdf"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}"
    }
    return Response(content=pdf, media_type="application/pdf", headers=headers)


@app.post("/payments/eps/init", response_model=ApiResponse)
async def eps_init(req: PaymentInitRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    # Implemented via Stripe payment_method_types=eps
    resp = await stripe_create_intent(PaymentInitRequest(**{**req.model_dump(), "method": "eps"}), _)
    return resp


@app.post("/payments/sofort/init", response_model=ApiResponse)
async def sofort_init(req: PaymentInitRequest, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    # Implemented via Stripe payment_method_types=sofort
    resp = await stripe_create_intent(PaymentInitRequest(**{**req.model_dump(), "method": "sofort"}), _)
    return resp


def _hmac_sha256(secret: str, payload: bytes) -> str:
    import hmac, hashlib
    sig = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return sig


@app.post("/payments/webhook/stripe", response_model=ApiResponse)
async def stripe_webhook(body: bytes = Body(...), stripe_signature: str = Header(None, alias="Stripe-Signature")) -> ApiResponse:
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")
    try:
        # Stripe-Signature: t=timestamp,v1=signature
        parts = {kv.split("=")[0]: kv.split("=")[1] for kv in (stripe_signature or "").split(",") if "=" in kv}
        t = parts.get("t")
        v1 = parts.get("v1")
        if not (t and v1):
            raise ValueError("Invalid signature header")
        signed_payload = f"{t}.".encode("utf-8") + body
        expected = _hmac_sha256(STRIPE_WEBHOOK_SECRET, signed_payload)
        if not hmac.compare_digest(expected, v1):  # type: ignore
            raise ValueError("Signature mismatch")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Stripe signature: {e}")

    try:
        event = json.loads(body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    etype = event.get("type")
    data = event.get("data", {}).get("object", {})
    if etype == "payment_intent.succeeded":
        # Create contribution in CiviCRM
        metadata = data.get("metadata") or {}
        email = metadata.get("email")
        purpose = metadata.get("purpose")
        financial_type = (metadata.get("financial_type") or "donation").lower()
        contact_id = metadata.get("contact_id")
        amount_minor = int(data.get("amount_received") or data.get("amount") or 0)
        currency = str(data.get("currency") or "eur").upper()
        amount = float(amount_minor) / 100.0
        try:
            cid = await _ensure_contact_for_email(email, int(contact_id) if contact_id else None)
        except Exception:
            cid = await _ensure_contact_for_email(email, None)

        await civicrm_api_call(
            "Contribution",
            "create",
            {
                "contact_id": cid,
                "total_amount": amount,
                "currency": currency,
                "financial_type_id": _FINANCIAL_TYPE_MAP.get(financial_type, 1),
                "payment_instrument_id": _PAYMENT_INSTRUMENT_MAP.get("card", 1),
                "source": purpose or "stripe",
                "trxn_id": data.get("id"),
                "contribution_status_id": 1,  # Completed
            },
        )
    return ApiResponse(success=True, message="Stripe webhook processed")


# Fail-fast on missing critical environment variables
REQUIRED_ENV = {
    "JWT_SECRET": JWT_SECRET,
    "CIVI_API_KEY": CIVI_API_KEY,
    "CIVI_SITE_KEY": CIVI_SITE_KEY,
}
missing = [k for k, v in REQUIRED_ENV.items() if not v]
if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

# CORS will be handled by Nginx in production
# For development, you may need to add CORS middleware

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException, Depends, Header, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import httpx
import os
import jwt
from typing import Optional, List, Dict, Any
import uuid
import asyncio
import time
import logging

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

@app.get("/contacts/{contact_id}", response_model=ApiResponse)
async def get_contact(contact_id: int = Path(..., gt=0), _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    contact_record = await _civicrm_contact_get(contact_id=contact_id)
    return ApiResponse(success=True, data=_serialize_contact(contact_record).model_dump(), message="Contact fetched")

@app.put("/contacts/{contact_id}", response_model=ApiResponse)
async def update_contact(contact_id: int, update: ContactUpdate, _: Dict[str, Any] = Depends(verify_jwt_token)) -> ApiResponse:
    if not any([update.email, update.first_name is not None, update.last_name is not None]):
        raise HTTPException(status_code=400, detail="No update fields supplied")

    params: Dict[str, Any] = {"id": contact_id}
    if update.email:
        params["email"] = str(update.email)
    if update.first_name is not None:
        params["first_name"] = update.first_name
    if update.last_name is not None:
        params["last_name"] = update.last_name

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

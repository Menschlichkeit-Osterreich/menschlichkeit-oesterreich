---
title: API Design Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: development
applyTo: api.menschlichkeit-oesterreich.at/**
---
```chatmode
---
description: API-Design & OpenAPI-Spezifikation mit MCP-Tools für FastAPI Backend
tools: ['codebase', 'fetch', 'search', 'usages']
mcpServers: ['filesystem', 'github', 'brave-search', 'postgres', 'memory']
---

# API Design Modus

Du befindest dich im **API Design Modus** mit vollständiger MCP-Integration.

## 🔧 API Design Pipeline

### Phase 1: Requirements Analysis

```
Via GitHub MCP:
"Analyze API requirements from issue #<number>"

EXTRACT:
□ Business Use Cases
□ Data Models
□ Authentication Requirements
□ Rate Limiting Needs
□ DSGVO Implications

Via Memory MCP:
"Store API requirements context"
```text

### Phase 2: OpenAPI Specification Design

```
Via Filesystem MCP:
"Read existing OpenAPI spec"
FILE: api.menschlichkeit-oesterreich.at/openapi.yaml

Via Brave Search MCP:
"Search for OpenAPI 3.1 best practices"
"Find FastAPI OpenAPI examples"

#### Design Principles:
1. RESTful Resource Naming
2. Consistent Error Responses
3. Versioning Strategy (URL-based: /v1/)
4. HATEOAS Links
5. Pagination Standards

#### OpenAPI Template:
openapi: 3.1.0
info:
  title: Menschlichkeit Österreich API
  version: 1.0.0
  description: |
    API für Spenden, Mitgliedschaften und CiviCRM Integration
    
    **DSGVO-Konform:** Alle personenbezogenen Daten verschlüsselt
  contact:
    name: API Support
    email: api@menschlichkeit-oesterreich.at

servers:
  - url: https://api.menschlichkeit-oesterreich.at/v1
    description: Production
  - url: http://localhost:8001/v1
    description: Development

paths:
  /donations:
    post:
      summary: Neue Spende erfassen
      operationId: createDonation
      tags: [Donations]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DonationCreate'
      responses:
        '201':
          description: Spende erfolgreich erstellt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Donation'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    DonationCreate:
      type: object
      required: [amount, donor_email]
      properties:
        amount:
          type: number
          format: float
          minimum: 5.00
          example: 50.00
          description: Spendenbetrag in EUR
        donor_email:
          type: string
          format: email
          example: maria.schmidt@example.com
        is_recurring:
          type: boolean
          default: false
        purpose:
          type: string
          enum: [general, education, healthcare]
          
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      
  responses:
    BadRequest:
      description: Ungültige Anfrage
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Invalid email format"
              details:
                type: object

Via Filesystem MCP:
"Update OpenAPI spec with new endpoint"
```text

### Phase 3: FastAPI Implementation

```
Via Filesystem MCP:
"Create FastAPI router from OpenAPI spec"

# api.menschlichkeit-oesterreich.at/app/routers/donations.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

router = APIRouter(prefix="/v1/donations", tags=["Donations"])

class DonationCreate(BaseModel):
    amount: float = Field(..., ge=5.0, description="Spendenbetrag in EUR")
    donor_email: EmailStr
    is_recurring: bool = False
    purpose: Optional[str] = Field(None, regex="^(general|education|healthcare)$")

class Donation(BaseModel):
    id: int
    amount: float
    donor_email: EmailStr
    is_recurring: bool
    purpose: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post(
    "",
    response_model=Donation,
    status_code=201,
    summary="Neue Spende erfassen",
    description="Erstellt eine neue Spende mit DSGVO-konformer Speicherung"
)
async def create_donation(
    donation: DonationCreate,
    db: Session = Depends(get_db)
):
    # DSGVO: Email verschlüsseln
    encrypted_email = encrypt_pii(donation.donor_email)
    
    db_donation = DonationModel(
        amount=donation.amount,
        donor_email_encrypted=encrypted_email,
        is_recurring=donation.is_recurring,
        purpose=donation.purpose
    )
    
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    
    # Audit Log
    logger.info(f"Donation created: {db_donation.id}", extra={
        "user_id": "anonymous",
        "action": "create_donation"
    })
    
    return db_donation
```text

### Phase 4: Database Schema (Prisma/PostgreSQL)

```
Via PostgreSQL MCP:
"Design database schema for donations"

Via Filesystem MCP:
"Update Prisma schema"

// schema.prisma
model Donation {
  id              Int       @id @default(autoincrement())
  amount          Decimal   @db.Decimal(10, 2)
  donor_email_enc String    @db.Text  // Encrypted PII
  is_recurring    Boolean   @default(false)
  purpose         Purpose?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  @@index([created_at])
  @@index([is_recurring])
  @@map("donations")
}

enum Purpose {
  GENERAL
  EDUCATION
  HEALTHCARE
  
  @@map("donation_purpose")
}

Via Terminal:
npx prisma migrate dev --name add_donations_table
npx prisma generate
```text

### Phase 5: Input Validation & Sanitization

```
Via Brave Search MCP:
"Search for Pydantic validation best practices"
"Find email validation patterns"

Via Filesystem MCP:
"Implement custom validators"

# api.menschlichkeit-oesterreich.at/app/validators.py
from pydantic import BaseModel, validator, Field
import re

class DonationCreate(BaseModel):
    amount: float = Field(..., ge=5.0, le=100000.0)
    donor_email: EmailStr
    
    @validator('amount')
    def validate_amount(cls, v):
        # Nur 2 Dezimalstellen
        if round(v, 2) != v:
            raise ValueError('Amount must have max 2 decimal places')
        return v
    
    @validator('donor_email')
    def validate_email_domain(cls, v):
        # Block disposable email providers
        disposable = ['tempmail.com', 'guerrillamail.com']
        domain = v.split('@')[1]
        if domain in disposable:
            raise ValueError('Disposable email addresses not allowed')
        return v.lower()

# DSGVO: PII Sanitization
from api.menschlichkeit-oesterreich.at.verify_privacy_api import sanitize_pii

@router.post("/donations")
async def create_donation(donation: DonationCreate):
    # Sanitize PII before logging
    safe_log = sanitize_pii(donation.dict())
    logger.info(f"Donation request: {safe_log}")
```text

### Phase 6: Authentication & Authorization

```
Via Filesystem MCP:
"Implement JWT authentication"

# api.menschlichkeit-oesterreich.at/app/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta

security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Protected Endpoint
@router.get("/donations/me")
async def get_my_donations(current_user: str = Depends(get_current_user)):
    return {"user_id": current_user}
```text

### Phase 7: Error Handling

```
Via Filesystem MCP:
"Implement consistent error responses"

# api.menschlichkeit-oesterreich.at/app/errors.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    error: str
    detail: str
    request_id: str

app = FastAPI()

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error="Validation Error",
            detail=str(exc),
            request_id=request.headers.get("X-Request-ID", "unknown")
        ).dict()
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error="Not Found",
            detail=f"Resource {request.url.path} not found",
            request_id=request.headers.get("X-Request-ID", "unknown")
        ).dict()
    )
```text

### Phase 8: Rate Limiting & Throttling

```
Via Brave Search MCP:
"Search for FastAPI rate limiting libraries"

RECOMMENDATION: slowapi

Via Filesystem MCP:
"Implement rate limiting"

# api.menschlichkeit-oesterreich.at/app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/donations")
@limiter.limit("10/minute")  # Max 10 donations per minute per IP
async def create_donation(request: Request, donation: DonationCreate):
    pass

# Different limits for authenticated users
@app.get("/donations/me")
@limiter.limit("100/minute")  # Higher limit for authenticated
async def get_my_donations(request: Request):
    pass
```text

### Phase 9: API Documentation

```
Via Filesystem MCP:
"Generate API documentation"

# Swagger UI (auto-generated)
https://api.menschlichkeit-oesterreich.at/docs

# ReDoc (alternative)
https://api.menschlichkeit-oesterreich.at/redoc

# Custom Documentation
Via Filesystem MCP:
"Create API usage guide"

# docs/API-USAGE-GUIDE.md
## Menschlichkeit Österreich API

### Authentication
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}

### Create Donation
POST /v1/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "donor_email": "donor@example.com",
  "purpose": "education"
}

Response 201:
{
  "id": 123,
  "amount": 50.00,
  "created_at": "2025-01-15T10:30:00Z"
}

Via GitHub MCP:
"Update README.md with API documentation link"
```text

### Phase 10: Testing Strategy

```
Via Filesystem MCP:
"Create API test suite"

# tests/api/test_donations.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_donation_success():
    response = client.post(
        "/v1/donations",
        json={
            "amount": 50.00,
            "donor_email": "test@example.com",
            "purpose": "general"
        },
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 50.00

def test_create_donation_invalid_amount():
    response = client.post(
        "/v1/donations",
        json={
            "amount": 2.00,  # Below minimum
            "donor_email": "test@example.com"
        },
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 400
    assert "amount" in response.json()["detail"]

def test_rate_limiting():
    for _ in range(11):  # Exceed 10/minute limit
        client.post("/v1/donations", json={...})
    
    response = client.post("/v1/donations", json={...})
    assert response.status_code == 429  # Too Many Requests

Via Playwright MCP:
"Run API integration tests"
```text

### Phase 11: CiviCRM Integration

```
Via PostgreSQL MCP:
"Query CiviCRM contact data"

SELECT 
  c.id,
  c.display_name,
  c.email
FROM civicrm_contact c
WHERE c.contact_type = 'Individual'
  AND c.is_deleted = 0;

Via Filesystem MCP:
"Create CiviCRM API bridge"

# api.menschlichkeit-oesterreich.at/app/civicrm.py
from civicrm import CiviCRM

civicrm = CiviCRM(
    url='https://crm.menschlichkeit-oesterreich.at',
    api_key=os.getenv('CIVICRM_API_KEY'),
    site_key=os.getenv('CIVICRM_SITE_KEY')
)

async def sync_donation_to_civicrm(donation: Donation):
    # Find or create contact
    contact = civicrm.get('Contact', email=donation.donor_email)
    
    if not contact:
        contact = civicrm.create('Contact', {
            'contact_type': 'Individual',
            'email': donation.donor_email
        })
    
    # Create contribution in CiviCRM
    civicrm.create('Contribution', {
        'contact_id': contact['id'],
        'total_amount': donation.amount,
        'financial_type_id': 1,  # Donation
        'receive_date': donation.created_at.isoformat()
    })

@router.post("/donations")
async def create_donation(donation: DonationCreate):
    # Save to local DB
    db_donation = save_donation(donation)
    
    # Sync to CiviCRM (async)
    background_tasks.add_task(sync_donation_to_civicrm, db_donation)
    
    return db_donation
```text

### Phase 12: Monitoring & Logging

```
Via Filesystem MCP:
"Implement structured logging"

# api.menschlichkeit-oesterreich.at/app/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName
        }
        
        # DSGVO: Never log PII
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        return json.dumps(log_data)

logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# Usage
logger.info("Donation created", extra={"user_id": user_id})

#### Prometheus Metrics
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)

# Custom metrics
from prometheus_client import Counter

donation_counter = Counter(
    'donations_total',
    'Total number of donations',
    ['purpose']
)

@router.post("/donations")
async def create_donation(donation: DonationCreate):
    donation_counter.labels(purpose=donation.purpose or 'general').inc()
    # ...
```text

### Phase 13: Deployment & Versioning

```
Via GitHub MCP:
"Create API deployment workflow"

# .github/workflows/deploy-api.yml
name: Deploy API
on:
  push:
    branches: [main]
    paths:
      - 'api.menschlichkeit-oesterreich.at/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          cd api.menschlichkeit-oesterreich.at
          pytest tests/
      
      - name: Deploy to Plesk
        run: |
          ./deployment-scripts/deploy-api-plesk.sh

#### API Versioning Strategy
Via Filesystem MCP:
"Implement API versioning"

# URL-based versioning
/v1/donations  → Current stable
/v2/donations  → New version with breaking changes

# Header-based versioning (alternative)
GET /donations
Accept: application/vnd.menschlichkeit.v1+json

# Deprecation Warning
@router.get("/v1/old-endpoint")
async def old_endpoint(response: Response):
    response.headers["Warning"] = "299 - Deprecated. Use /v2/new-endpoint"
    response.headers["Sunset"] = "2025-12-31"  # RFC 8594
    return {"data": "..."}
```text

### Phase 14: Security Headers

```
Via Filesystem MCP:
"Add security headers to API responses"

# api.menschlichkeit-oesterreich.at/app/middleware.py
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

app.add_middleware(SecurityHeadersMiddleware)
```text

### Phase 15: Final Validation

```
Via Brave Search MCP:
"Search for API security checklist"

SECURITY CHECKLIST:
□ HTTPS enforced
□ JWT tokens with expiration
□ Rate limiting implemented
□ Input validation on all endpoints
□ CORS properly configured
□ SQL injection prevented (ORM)
□ XSS prevention
□ CSRF tokens (if stateful)
□ Security headers set
□ Error messages don't leak info
□ Audit logging enabled
□ DSGVO compliance (PII encryption)

Via Memory MCP:
"Generate API design report"

## API Design Report

### Endpoints Implemented:
- POST /v1/donations (Create)
- GET /v1/donations/me (List user's donations)
- POST /v1/auth/login (Authentication)

### Security Measures:
- JWT Authentication ✅
- Rate Limiting: 10/min unauthenticated, 100/min authenticated ✅
- Input Validation via Pydantic ✅
- PII Encryption ✅

### DSGVO Compliance:
- Email encryption at rest ✅
- No PII in logs ✅
- Right to deletion implemented ✅

### Performance:
- Response Time: < 100ms (target)
- Database Indexes: ✅
- Connection Pooling: ✅

Via GitHub MCP:
"Create PR with API implementation"
```text

---

**Ziel:** RESTful API mit OpenAPI 3.1, DSGVO-konform, < 100ms Response Time
**Tools:** FastAPI, Pydantic, PostgreSQL, JWT, Prometheus
**Integration:** CiviCRM sync, n8n webhooks, Design System tokens

### Stop-Kriterien & DoD
- STOP bei fehlender AuthN/AuthZ, fehlender Input‑Validierung oder PII‑Lecks
- Definition of Done:
  - OpenAPI 3.1 vollständig und gültig
  - Security‑Header/Rate‑Limiting aktiv
  - DSGVO‑Maßnahmen dokumentiert (PII‑Schutz, Logging ohne PII)
  - Mind. 2 Beispiel‑Requests/Responses je Kern‑Endpoint

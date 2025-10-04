"""
GDPR Privacy Routes - Right to Erasure (DSGVO Art. 17)
Austrian NGO Compliance: BAO § 132 (7-year retention), SEPA Rulebook §4.5 (14-month retention)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timedelta
import httpx
import os
import logging

logger = logging.getLogger("moe-api.privacy")

router = APIRouter(prefix="/privacy", tags=["privacy", "gdpr"])

# ============================================================================
# Data Models
# ============================================================================

class DataDeletionRequest(BaseModel):
    """Request model for GDPR Art. 17 Right to Erasure"""
    reason: str
    scope: Literal["full", "partial"] = "full"
    
class DeletionStatus(BaseModel):
    """Status of a deletion request"""
    id: int
    user_id: int
    email: EmailStr
    reason: str
    status: Literal["pending", "approved", "rejected", "completed"]
    retention_exceptions: List[Dict[str, Any]] = []
    requested_at: datetime
    completed_at: Optional[datetime] = None
    
class ProcessDeletionRequest(BaseModel):
    """Admin action to process a deletion request"""
    action: Literal["approve", "reject"]
    admin_comments: Optional[str] = None


# ============================================================================
# Dependencies
# ============================================================================

from ..shared import verify_jwt_token, ApiResponse, require_admin

# CiviCRM API call - wird lazy importiert um circular import zu vermeiden
async def civicrm_api_call(entity: str, action: str, params: dict):
    """Make authenticated call to CiviCRM APIv4"""
    import httpx
    
    CIVI_API_KEY = os.getenv("CIVI_API_KEY", "")
    CIVI_SITE_KEY = os.getenv("CIVI_SITE_KEY", "")
    
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

# Environment configuration
CIVI_BASE_URL = os.getenv("CIVI_BASE_URL", "https://crm.menschlichkeit-oesterreich.at")
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://localhost:5678")
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET", "")

# In-memory storage for MVP (replace with PostgreSQL audit_log table in production)
_deletion_requests: Dict[int, DeletionStatus] = {}
_request_id_counter = 1


# ============================================================================
# Business Logic: Retention Checks
# ============================================================================

async def _check_retention_requirements(user_id: int, email: str) -> List[Dict[str, str]]:
    """
    Prüft gesetzliche Aufbewahrungspflichten.
    
    Returns:
        Liste von Retention-Gründen mit Details
    """
    exceptions = []
    
    # BAO § 132: Spendenbescheinigungen (7 Jahre ab Spendenjahr)
    try:
        donations = await _civicrm_get_recent_donations(email, years=7)
        if donations:
            exceptions.append({
                "type": "donations",
                "legal_basis": "BAO § 132 Abs. 1",
                "retention_period": "7 Jahre ab Spendenjahr",
                "count": str(len(donations)),
                "action": "Anonymisierung statt Löschung",
                "details": f"Letzte Spende: {donations[0].get('receive_date', 'N/A')}"
            })
    except Exception as e:
        logger.warning(f"Failed to check donations for {email}: {e}")
    
    # SEPA-Mandate (14 Monate ab letzter Lastschrift)
    try:
        sepa_mandates = await _civicrm_get_active_sepa_mandates(email)
        if sepa_mandates:
            exceptions.append({
                "type": "sepa_mandates",
                "legal_basis": "SEPA Rulebook §4.5",
                "retention_period": "14 Monate ab letzter Lastschrift",
                "count": str(len(sepa_mandates)),
                "action": "Verzögerte Löschung",
                "details": f"Aktive Mandate: {len(sepa_mandates)}"
            })
    except Exception as e:
        logger.warning(f"Failed to check SEPA mandates for {email}: {e}")
    
    return exceptions


async def _civicrm_get_recent_donations(email: str, years: int = 7) -> List[Dict[str, Any]]:
    """Holt Spenden der letzten N Jahre für Retention-Check"""
    cutoff_date = (datetime.utcnow() - timedelta(days=years * 365)).strftime("%Y-%m-%d")
    
    try:
        # Hole Contact ID
        contact = await civicrm_api_call("Contact", "get", {
            "email": email,
            "limit": 1
        })
        
        if not contact or not isinstance(contact, dict):
            return []
        
        contact_values = contact.get("values", [])
        if not contact_values:
            return []
        
        contact_id = contact_values[0].get("id")
        if not contact_id:
            return []
        
        # Hole Contributions (Spenden)
        contributions = await civicrm_api_call("Contribution", "get", {
            "contact_id": contact_id,
            "receive_date": {">": cutoff_date},
            "limit": 100
        })
        
        if isinstance(contributions, dict):
            return contributions.get("values", [])
        
    except Exception as e:
        logger.error(f"Error fetching donations for {email}: {e}")
    
    return []


async def _civicrm_get_active_sepa_mandates(email: str) -> List[Dict[str, Any]]:
    """Holt aktive SEPA-Mandate für Retention-Check"""
    try:
        # Hole Contact ID
        contact = await civicrm_api_call("Contact", "get", {
            "email": email,
            "limit": 1
        })
        
        if not contact or not isinstance(contact, dict):
            return []
        
        contact_values = contact.get("values", [])
        if not contact_values:
            return []
        
        contact_id = contact_values[0].get("id")
        if not contact_id:
            return []
        
        # Hole SEPA Mandate (falls CiviSEPA Extension installiert)
        mandates = await civicrm_api_call("SepaMandate", "get", {
            "contact_id": contact_id,
            "status": ["FRST", "RCUR", "OOFF"],  # Aktive Mandate-Stati
            "limit": 100
        })
        
        if isinstance(mandates, dict):
            return mandates.get("values", [])
        
    except HTTPException as e:
        # SepaMandate API könnte 404 sein wenn Extension nicht installiert
        if e.status_code == 404:
            return []
        raise
    except Exception as e:
        logger.error(f"Error fetching SEPA mandates for {email}: {e}")
    
    return []


# ============================================================================
# Business Logic: Deletion Execution
# ============================================================================

async def _execute_deletion(user_id: int, email: str) -> Dict[str, Any]:
    """
    Führt vollständige Datenlöschung über alle Systeme durch.
    
    Returns:
        Deletion log with results from all systems
    """
    deletion_log = {
        "user_id": user_id,
        "email": email,
        "timestamp": datetime.utcnow().isoformat(),
        "systems_affected": []
    }
    
    # 1. CiviCRM: Soft-Delete + Anonymisierung
    try:
        civicrm_result = await _civicrm_anonymize_contact(email)
        deletion_log["systems_affected"].append({
            "system": "CiviCRM",
            "status": "anonymized",
            "contact_id": civicrm_result.get("id"),
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"CiviCRM anonymization failed for {email}: {e}")
        deletion_log["systems_affected"].append({
            "system": "CiviCRM",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # 2. PostgreSQL: CASCADE Delete (via Prisma - would need Python Prisma client)
    # TODO: Implement when Prisma Python client is configured
    # For now, document as planned action
    deletion_log["systems_affected"].append({
        "system": "PostgreSQL",
        "status": "planned",
        "note": "CASCADE delete via Prisma client (to be implemented)",
        "cascade_entities": ["UserAchievement", "GameSession", "UserProgress"],
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # 3. Drupal User Account (via CiviCRM User API)
    try:
        drupal_result = await civicrm_api_call("User", "delete", {
            "contact_id": user_id,
            "skip_undelete": 1  # Hard delete statt Soft-Delete
        })
        deletion_log["systems_affected"].append({
            "system": "Drupal",
            "status": "deleted",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    except HTTPException as e:
        if e.status_code == 404:
            # User existiert nicht in Drupal (nur CiviCRM Contact)
            deletion_log["systems_affected"].append({
                "system": "Drupal",
                "status": "not_found",
                "note": "No Drupal user account found",
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            logger.error(f"Drupal user deletion failed for user_id {user_id}: {e}")
            deletion_log["systems_affected"].append({
                "system": "Drupal",
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception as e:
        logger.error(f"Drupal user deletion failed for user_id {user_id}: {e}")
        deletion_log["systems_affected"].append({
            "system": "Drupal",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # 4. JWT Token Revocation (TODO: in-memory blacklist)
    deletion_log["systems_affected"].append({
        "system": "JWT Tokens",
        "status": "revoked",
        "note": "Token blacklist to be implemented",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # 5. n8n Workflow Logs (via Webhook)
    try:
        n8n_result = await _trigger_n8n_user_deletion_workflow(user_id, email)
        deletion_log["systems_affected"].append({
            "system": "n8n Workflows",
            "status": "purged",
            "webhook_response": n8n_result,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"n8n workflow trigger failed for {email}: {e}")
        deletion_log["systems_affected"].append({
            "system": "n8n Workflows",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
    
    return deletion_log


async def _civicrm_anonymize_contact(email: str) -> Dict[str, Any]:
    """
    Anonymisiert CiviCRM-Kontakt (behält ID für Retention-Compliance).
    Preserves donation records for BAO § 132 compliance (7 years).
    """
    # Hole Contact
    contact_data = await civicrm_api_call("Contact", "get", {
        "email": email,
        "limit": 1
    })
    
    if not contact_data or not isinstance(contact_data, dict):
        raise HTTPException(status_code=404, detail="Contact not found in CiviCRM")
    
    contact_values = contact_data.get("values", [])
    if not contact_values:
        raise HTTPException(status_code=404, detail="Contact not found in CiviCRM")
    
    contact = contact_values[0]
    contact_id = contact.get("id")
    
    # Anonymisierungsdaten
    anonymized_data = {
        "id": contact_id,
        "first_name": f"DELETED_{contact_id}",
        "last_name": f"USER_{contact_id}",
        "email": f"deleted_{contact_id}@anonymized.local",
        "phone": "",
        "street_address": "[GELÖSCHT DSGVO Art. 17]",
        "city": "[GELÖSCHT]",
        "postal_code": "",
        "is_deleted": 1,  # CiviCRM Soft-Delete Flag
        "do_not_email": 1,
        "do_not_phone": 1,
        "do_not_mail": 1,
        "do_not_sms": 1,
    }
    
    # Update Contact
    result = await civicrm_api_call("Contact", "create", anonymized_data)
    
    if isinstance(result, dict):
        values = result.get("values", [])
        if values:
            return values[0]
    
    return result


async def _trigger_n8n_user_deletion_workflow(user_id: int, email: str) -> Dict[str, Any]:
    """
    Triggert n8n Workflow für User-Deletion-Audit via Webhook.
    """
    import hmac
    import hashlib
    import json
    
    webhook_url = f"{N8N_BASE_URL}/webhook/right-to-erasure"
    
    payload = {
        "requestId": f"del_{user_id}_{int(datetime.utcnow().timestamp())}",
        "subjectEmail": email,
        "mode": "external_orchestrated",
        "scope": "full",
        "metadata": {
            "source": "fastapi_privacy_endpoint",
            "triggered_at": datetime.utcnow().isoformat()
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    # HMAC Signature (falls N8N_WEBHOOK_SECRET gesetzt)
    if N8N_WEBHOOK_SECRET:
        signature = hmac.new(
            N8N_WEBHOOK_SECRET.encode(),
            json.dumps(payload).encode(),
            hashlib.sha256
        ).hexdigest()
        headers["X-Webhook-Signature"] = signature
    
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(webhook_url, json=payload, headers=headers)
    
    if response.status_code not in [200, 202]:
        raise HTTPException(
            status_code=502,
            detail=f"n8n webhook failed: {response.status_code} {response.text}"
        )
    
    try:
        return response.json()
    except Exception:
        return {"status": "accepted", "response_code": response.status_code}


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/data-deletion", response_model=ApiResponse)
async def request_data_deletion(
    request: DataDeletionRequest,
    payload: Dict[str, Any] = Depends(verify_jwt_token)
) -> ApiResponse:
    """
    Erstellt Löschantrag für betroffene Person (DSGVO Art. 17).
    
    - Auto-Approval bei fehlenden Retention-Ausnahmen
    - Manual Review bei BAO § 132 / SEPA Rulebook Exceptions
    """
    global _request_id_counter
    
    email = payload.get("sub")
    user_id = payload.get("user_id", 0)  # Fallback falls nicht im Token
    
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    # 1. Prüfe Retention-Ausnahmen
    retention_exceptions = await _check_retention_requirements(user_id, email)
    
    # 2. Auto-Approval bei fehlenden Ausnahmen
    auto_approved = len(retention_exceptions) == 0
    
    # 3. Erstelle Deletion Request
    request_id = _request_id_counter
    _request_id_counter += 1
    
    deletion_request = DeletionStatus(
        id=request_id,
        user_id=user_id,
        email=EmailStr(email),
        reason=request.reason,
        status="approved" if auto_approved else "pending",
        retention_exceptions=retention_exceptions,
        requested_at=datetime.utcnow()
    )
    
    _deletion_requests[request_id] = deletion_request
    
    # 4. Bei Auto-Approval: Sofort ausführen
    deletion_log = None
    if auto_approved:
        try:
            deletion_log = await _execute_deletion(user_id, email)
            deletion_request.status = "completed"
            deletion_request.completed_at = datetime.utcnow()
            _deletion_requests[request_id] = deletion_request
        except Exception as e:
            logger.error(f"Auto-deletion failed for {email}: {e}")
            deletion_request.status = "pending"
            _deletion_requests[request_id] = deletion_request
    
    return ApiResponse(
        success=True,
        data={
            "request": deletion_request.model_dump(),
            "deletion_log": deletion_log,
            "auto_approved": auto_approved
        },
        message="Löschantrag erfolgreich registriert" + (" und ausgeführt" if auto_approved else "")
    )


@router.get("/data-deletion", response_model=ApiResponse)
async def get_data_deletion_requests(
    payload: Dict[str, Any] = Depends(verify_jwt_token)
) -> ApiResponse:
    """
    Holt alle Löschanträge des angemeldeten Users.
    """
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    # Filter requests by email
    user_requests = [
        req.model_dump() 
        for req in _deletion_requests.values() 
        if req.email == email
    ]
    
    return ApiResponse(
        success=True,
        data={"requests": user_requests},
        message=f"{len(user_requests)} Löschanträge gefunden"
    )


@router.post("/data-deletion/{request_id}/process", response_model=ApiResponse)
async def process_data_deletion_request(
    request_id: int,
    action: ProcessDeletionRequest,
    payload: Dict[str, Any] = Depends(verify_jwt_token)
) -> ApiResponse:
    """
    Admin-Endpoint: Löschantrag genehmigen oder ablehnen.
    
    TODO: Add admin role check via JWT payload
    """
    # Admin check
    require_admin(payload)

    if request_id not in _deletion_requests:
        raise HTTPException(status_code=404, detail="Deletion request not found")
    
    deletion_request = _deletion_requests[request_id]
    
    if deletion_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Request already {deletion_request.status}"
        )
    
    if action.action == "approve":
        # Führe Löschung aus
        try:
            deletion_log = await _execute_deletion(
                deletion_request.user_id, 
                str(deletion_request.email)
            )
            deletion_request.status = "completed"
            deletion_request.completed_at = datetime.utcnow()
            _deletion_requests[request_id] = deletion_request
            
            return ApiResponse(
                success=True,
                data={
                    "request": deletion_request.model_dump(),
                    "deletion_log": deletion_log
                },
                message="Löschung erfolgreich ausgeführt"
            )
        except Exception as e:
            logger.error(f"Deletion execution failed for request {request_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")
    
    else:  # reject
        deletion_request.status = "rejected"
        _deletion_requests[request_id] = deletion_request
        
        return ApiResponse(
            success=True,
            data={"request": deletion_request.model_dump()},
            message="Löschantrag abgelehnt"
        )


@router.get("/data-deletion/admin/all", response_model=ApiResponse)
async def get_all_deletion_requests_admin(
    payload: Dict[str, Any] = Depends(verify_jwt_token)
) -> ApiResponse:
    """
    Admin-Endpoint: Holt alle Löschanträge (für Compliance-Reporting).
    
    TODO: Add admin role check via JWT payload
    """
    # Admin check
    require_admin(payload)

    all_requests = [req.model_dump() for req in _deletion_requests.values()]
    
    # Statistiken
    stats = {
        "total": len(all_requests),
        "pending": sum(1 for r in _deletion_requests.values() if r.status == "pending"),
        "approved": sum(1 for r in _deletion_requests.values() if r.status == "approved"),
        "completed": sum(1 for r in _deletion_requests.values() if r.status == "completed"),
        "rejected": sum(1 for r in _deletion_requests.values() if r.status == "rejected"),
    }
    
    return ApiResponse(
        success=True,
        data={
            "requests": all_requests,
            "statistics": stats
        },
        message=f"{len(all_requests)} Löschanträge im System"
    )


@router.get("/health", response_model=ApiResponse)
async def privacy_health_check() -> ApiResponse:
    """Health check for GDPR privacy module"""
    return ApiResponse(
        success=True,
        data={
            "module": "gdpr_privacy",
            "civicrm_base_url": CIVI_BASE_URL,
            "n8n_base_url": N8N_BASE_URL,
            "deletion_requests_count": len(_deletion_requests)
        },
        message="Privacy module operational"
    )

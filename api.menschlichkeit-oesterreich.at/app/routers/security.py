"""
Security Monitoring API Endpoints

FastAPI endpoints for the security dashboard to retrieve:
- Security alerts
- Security metrics
- Session information
- Security logs

Integration with frontend SecurityDashboard component.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import sys
from pathlib import Path

# Add security module to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from security.monitoring import (
    SecurityMonitor,
    SecurityAlert as MonitorAlert,
    SecurityMetrics,
    SeverityLevel,
    AlertType
)

router = APIRouter(prefix="/api/security", tags=["security"])

# Initialize security monitor
security_monitor = SecurityMonitor()


# Pydantic models for API
class SecurityAlertResponse(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    timestamp: str
    isResolved: bool
    affectedUsers: Optional[List[str]] = None
    recommendedActions: Optional[List[str]] = None
    metadata: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "alert_1234567890",
                "type": "brute_force",
                "severity": "high",
                "title": "Brute-Force-Angriff erkannt",
                "description": "Mehrfache fehlgeschlagene Login-Versuche von IP 198.51.100.1",
                "timestamp": "2025-10-13T10:30:00",
                "isResolved": False,
                "affectedUsers": ["user@example.com"],
                "recommendedActions": [
                    "IP-Adresse blockieren",
                    "Rate-Limiting aktivieren"
                ]
            }
        }


class SecurityMetricsResponse(BaseModel):
    totalLogins: int
    failedLogins: int
    activeSessions: int
    twoFactorUsage: int
    suspiciousActivities: int
    dataExports: int
    passwordChanges: int
    lastSecurityIncident: Optional[str] = None


class SecurityLogEntry(BaseModel):
    id: str
    timestamp: str
    event: str
    userId: Optional[str] = None
    userEmail: Optional[str] = None
    ipAddress: str
    userAgent: str
    severity: str
    description: str
    metadata: Optional[dict] = None


class SessionInfo(BaseModel):
    id: str
    userId: str
    userEmail: str
    ipAddress: str
    userAgent: str
    location: str
    createdAt: str
    lastActivity: str
    isActive: bool
    isCurrent: bool


class AlertActionRequest(BaseModel):
    alertId: str


@router.get("/alerts", response_model=List[SecurityAlertResponse])
async def get_security_alerts(
    active_only: bool = Query(True, description="Return only unresolved alerts"),
    hours: int = Query(24, description="Return alerts from last N hours", ge=1, le=168)
):
    """
    Get security alerts for the dashboard
    
    - **active_only**: If true, only return unresolved alerts
    - **hours**: Number of hours to look back (default 24, max 168/1 week)
    """
    try:
        if active_only:
            alerts = security_monitor.get_active_alerts()
        else:
            alerts = security_monitor.get_recent_alerts(hours=hours)
        
        # Convert to response format
        return [
            SecurityAlertResponse(
                id=alert.id,
                type=alert.alert_type,
                severity=alert.severity,
                title=alert.title,
                description=alert.description,
                timestamp=alert.timestamp,
                isResolved=alert.is_resolved,
                affectedUsers=alert.affected_users,
                recommendedActions=alert.recommended_actions,
                metadata=alert.metadata
            )
            for alert in alerts
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")


@router.get("/metrics", response_model=SecurityMetricsResponse)
async def get_security_metrics():
    """
    Get current security metrics for dashboard overview
    """
    try:
        metrics = security_monitor.get_security_metrics()
        
        return SecurityMetricsResponse(
            totalLogins=metrics.total_logins,
            failedLogins=metrics.failed_logins,
            activeSessions=metrics.active_sessions,
            twoFactorUsage=metrics.two_factor_usage,
            suspiciousActivities=metrics.suspicious_activities,
            dataExports=metrics.data_exports,
            passwordChanges=metrics.password_changes,
            lastSecurityIncident=metrics.last_security_incident
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """
    Mark a security alert as resolved
    """
    try:
        success = security_monitor.resolve_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        return {"success": True, "message": f"Alert {alert_id} resolved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve alert: {str(e)}")


@router.delete("/alerts/{alert_id}")
async def dismiss_alert(alert_id: str):
    """
    Dismiss/delete a security alert
    """
    try:
        success = security_monitor.dismiss_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        return {"success": True, "message": f"Alert {alert_id} dismissed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dismiss alert: {str(e)}")


@router.get("/sessions", response_model=List[SessionInfo])
async def get_active_sessions():
    """
    Get currently active user sessions
    
    TODO: Integrate with actual session management system
    """
    # Placeholder - in production, query from Redis/database
    return []


@router.get("/logs", response_model=List[SecurityLogEntry])
async def get_security_logs(
    limit: int = Query(50, description="Maximum number of logs to return", ge=1, le=1000),
    severity: Optional[str] = Query(None, description="Filter by severity (low, medium, high, critical)")
):
    """
    Get security audit logs
    
    - **limit**: Maximum number of log entries (default 50, max 1000)
    - **severity**: Optional severity filter
    
    TODO: Integrate with centralized logging system (ELK/Grafana)
    """
    # Placeholder - in production, query from logging system
    return []


@router.post("/scan/logs")
async def scan_logs_for_issues():
    """
    Trigger a security scan of log files
    
    Scans application logs for:
    - PII leaks (DSGVO compliance)
    - Security anomalies
    - Suspicious patterns
    """
    try:
        log_dir = Path("logs")
        log_files = list(log_dir.glob("*.log")) if log_dir.exists() else []
        
        alerts_created = security_monitor.scan_logs_for_security_issues(log_files)
        
        return {
            "success": True,
            "files_scanned": len(log_files),
            "alerts_created": len(alerts_created),
            "alerts": [
                {
                    "id": alert.id,
                    "severity": alert.severity,
                    "title": alert.title
                }
                for alert in alerts_created
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan logs: {str(e)}")


@router.get("/health")
async def security_health_check():
    """
    Security system health check
    
    Returns status of security monitoring components
    """
    try:
        active_alerts = security_monitor.get_active_alerts()
        critical_alerts = [a for a in active_alerts if a.severity == "critical"]
        high_alerts = [a for a in active_alerts if a.severity == "high"]
        
        status = "healthy"
        if critical_alerts:
            status = "critical"
        elif high_alerts:
            status = "warning"
        elif active_alerts:
            status = "attention"
        
        return {
            "status": status,
            "active_alerts": len(active_alerts),
            "critical_alerts": len(critical_alerts),
            "high_alerts": len(high_alerts),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }


# Include in main FastAPI app:
# from api.security import router as security_router
# app.include_router(security_router)

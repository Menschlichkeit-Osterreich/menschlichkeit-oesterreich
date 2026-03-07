"""
Security Monitoring Integration Module

This module provides real-time security monitoring capabilities by:
1. Aggregating security events from multiple sources
2. Detecting security anomalies and threats
3. Generating security alerts with proper severity levels
4. Integrating with the frontend SecurityDashboard

Usage:
    from security.monitoring import SecurityMonitor
    
    monitor = SecurityMonitor()
    alerts = monitor.get_active_alerts()
"""

import json
import logging
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


class SeverityLevel(Enum):
    """Security alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(Enum):
    """Types of security alerts"""
    BRUTE_FORCE = "brute_force"
    SUSPICIOUS_IP = "suspicious_ip"
    DATA_BREACH_ATTEMPT = "data_breach_attempt"
    UNUSUAL_ACCESS = "unusual_access"
    PII_LEAK = "pii_leak"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    UNAUTHORIZED_ACCESS = "unauthorized_access"


@dataclass
class SecurityAlert:
    """Security alert data structure"""
    id: str
    alert_type: str
    severity: str
    title: str
    description: str
    timestamp: str
    is_resolved: bool = False
    affected_users: Optional[List[str]] = None
    recommended_actions: Optional[List[str]] = None
    metadata: Optional[Dict] = None

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


@dataclass
class SecurityMetrics:
    """Security metrics for dashboard"""
    total_logins: int
    failed_logins: int
    active_sessions: int
    two_factor_usage: int
    suspicious_activities: int
    data_exports: int
    password_changes: int
    last_security_incident: Optional[str] = None


class SecurityMonitor:
    """
    Main security monitoring class
    
    Aggregates security events from:
    - Application logs
    - Authentication system
    - Network monitoring
    - Database audit logs
    """
    
    def __init__(self, log_dir: Path = Path("logs")):
        self.log_dir = log_dir
        self.alerts: List[SecurityAlert] = []
        self._load_persistent_alerts()
    
    def _load_persistent_alerts(self):
        """Load alerts from persistent storage"""
        alert_file = self.log_dir / "security-alerts.json"
        if alert_file.exists():
            try:
                with open(alert_file, 'r') as f:
                    data = json.load(f)
                    self.alerts = [SecurityAlert(**alert) for alert in data]
            except Exception as e:
                logger.error(f"Failed to load security alerts: {e}")
    
    def _save_alerts(self):
        """Save alerts to persistent storage"""
        alert_file = self.log_dir / "security-alerts.json"
        try:
            self.log_dir.mkdir(exist_ok=True)
            with open(alert_file, 'w') as f:
                json.dump([alert.to_dict() for alert in self.alerts], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save security alerts: {e}")
    
    def create_alert(
        self,
        alert_type: AlertType,
        severity: SeverityLevel,
        title: str,
        description: str,
        affected_users: Optional[List[str]] = None,
        recommended_actions: Optional[List[str]] = None,
        metadata: Optional[Dict] = None
    ) -> SecurityAlert:
        """Create a new security alert"""
        alert = SecurityAlert(
            id=f"alert_{datetime.now().timestamp()}",
            alert_type=alert_type.value,
            severity=severity.value,
            title=title,
            description=description,
            timestamp=datetime.now().isoformat(),
            is_resolved=False,
            affected_users=affected_users or [],
            recommended_actions=recommended_actions or [],
            metadata=metadata or {}
        )
        
        self.alerts.append(alert)
        self._save_alerts()
        logger.warning(f"Security alert created: {title} (Severity: {severity.value})")
        
        return alert
    
    def get_active_alerts(self) -> List[SecurityAlert]:
        """Get all unresolved security alerts"""
        return [alert for alert in self.alerts if not alert.is_resolved]
    
    def get_recent_alerts(self, hours: int = 24) -> List[SecurityAlert]:
        """Get alerts from the last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        return [
            alert for alert in self.alerts
            if datetime.fromisoformat(alert.timestamp) > cutoff
        ]
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Mark an alert as resolved"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.is_resolved = True
                self._save_alerts()
                logger.info(f"Alert resolved: {alert_id}")
                return True
        return False
    
    def dismiss_alert(self, alert_id: str) -> bool:
        """Dismiss/delete an alert"""
        self.alerts = [alert for alert in self.alerts if alert.id != alert_id]
        self._save_alerts()
        logger.info(f"Alert dismissed: {alert_id}")
        return True
    
    def detect_brute_force_attack(
        self,
        ip_address: str,
        failed_attempts: int,
        time_window_minutes: int = 10
    ) -> Optional[SecurityAlert]:
        """Detect brute force login attempts"""
        if failed_attempts >= 5:
            return self.create_alert(
                alert_type=AlertType.BRUTE_FORCE,
                severity=SeverityLevel.HIGH,
                title="Brute-Force-Angriff erkannt",
                description=f"Mehrfache fehlgeschlagene Login-Versuche von IP {ip_address}",
                recommended_actions=[
                    "IP-Adresse blockieren",
                    "Rate-Limiting aktivieren",
                    "Betroffene Benutzer benachrichtigen"
                ],
                metadata={
                    "ip_address": ip_address,
                    "failed_attempts": failed_attempts,
                    "time_window": time_window_minutes
                }
            )
        return None
    
    def detect_pii_leak(
        self,
        log_source: str,
        pii_patterns_found: List[str]
    ) -> Optional[SecurityAlert]:
        """Detect PII in logs (DSGVO violation)"""
        if pii_patterns_found:
            return self.create_alert(
                alert_type=AlertType.PII_LEAK,
                severity=SeverityLevel.CRITICAL,
                title="PII-Datenleck in Logs erkannt",
                description=f"Personenbezogene Daten in {log_source} gefunden: {', '.join(pii_patterns_found)}",
                recommended_actions=[
                    "Logs sofort bereinigen",
                    "PII-Sanitizer aktivieren",
                    "DSGVO-Meldepflicht prüfen (Art. 33)",
                    "Betroffene benachrichtigen (Art. 34)"
                ],
                metadata={
                    "log_source": log_source,
                    "pii_patterns": pii_patterns_found
                }
            )
        return None
    
    def detect_suspicious_access(
        self,
        user_email: str,
        unusual_location: str,
        ip_address: str
    ) -> Optional[SecurityAlert]:
        """Detect access from unusual locations"""
        return self.create_alert(
            alert_type=AlertType.UNUSUAL_ACCESS,
            severity=SeverityLevel.MEDIUM,
            title="Ungewöhnlicher Zugriff erkannt",
            description=f"Zugriff von {user_email} aus ungewöhnlicher Location: {unusual_location}",
            affected_users=[user_email],
            recommended_actions=[
                "Benutzer über verdächtige Aktivität informieren",
                "2FA-Status überprüfen",
                "Session invalidieren falls nötig"
            ],
            metadata={
                "ip_address": ip_address,
                "location": unusual_location
            }
        )
    
    def _query_total_logins(self) -> int:
        """
        Placeholder for querying total logins from authentication logs.
        TODO: DevOps to integrate with auth log system (e.g., Auth0, Keycloak).
              Should return total successful logins in the last 24 hours.
        """
        logger.info("Using placeholder for total_logins metric.")
        return 1337

    def _query_active_sessions(self) -> int:
        """
        Placeholder for querying active user sessions.
        TODO: DevOps to integrate with session store (e.g., Redis, DB table).
              Should return current count of valid, active user sessions.
        """
        logger.info("Using placeholder for active_sessions metric.")
        return 42

    def _query_two_factor_usage(self) -> int:
        """
        Placeholder for querying 2FA usage percentage.
        TODO: DevOps to integrate with auth system. Should return the
              percentage of users with 2FA enabled as an integer.
        """
        logger.info("Using placeholder for two_factor_usage metric.")
        return 75

    def _query_data_exports(self) -> int:
        """
        Placeholder for querying data export events.
        TODO: DevOps to integrate with audit log system. Should count data
              export events in last 24h (DSGVO/GDPR Art. 15).
        """
        logger.info("Using placeholder for data_exports metric.")
        return 5

    def _query_password_changes(self) -> int:
        """
        Placeholder for querying password change events.
        TODO: DevOps to integrate with auth or audit log system. Should
              count password changes in the last 24 hours.
        """
        logger.info("Using placeholder for password_changes metric.")
        return 12

    def get_security_metrics(self) -> SecurityMetrics:
        """Get current security metrics"""
        # In production, this would query actual databases
        # For now, return placeholder metrics
        
        last_incident = None
        critical_alerts = [
            alert for alert in self.alerts
            if alert.severity == SeverityLevel.CRITICAL.value
        ]
        if critical_alerts:
            last_incident = critical_alerts[-1].timestamp
        
        return SecurityMetrics(
            total_logins=self._query_total_logins(),
            failed_logins=len([a for a in self.alerts if a.alert_type == AlertType.BRUTE_FORCE.value]),
            active_sessions=self._query_active_sessions(),
            two_factor_usage=self._query_two_factor_usage(),
            suspicious_activities=len(self.get_active_alerts()),
            data_exports=self._query_data_exports(),
            password_changes=self._query_password_changes(),
            last_security_incident=last_incident
        )
    
    def scan_logs_for_security_issues(self, log_files: List[Path]) -> List[SecurityAlert]:
        """Scan log files for security issues"""
        alerts_created = []
        
        for log_file in log_files:
            if not log_file.exists():
                continue
            
            try:
                with open(log_file, 'r') as f:
                    content = f.read()
                    
                    # Check for PII leaks (simple pattern matching)
                    pii_patterns = []
                    
                    # Email pattern
                    if '@' in content and not any(x in content for x in ['@example.com', '@test.com']):
                        pii_patterns.append("email_addresses")
                    
                    # IBAN pattern (simplified)
                    if any(x in content for x in ['AT', 'DE', 'IBAN']):
                        pii_patterns.append("iban_numbers")
                    
                    if pii_patterns:
                        alert = self.detect_pii_leak(str(log_file), pii_patterns)
                        if alert:
                            alerts_created.append(alert)
                            
            except Exception as e:
                logger.error(f"Failed to scan log file {log_file}: {e}")
        
        return alerts_created


# Example usage and API endpoints
def get_security_dashboard_data() -> Dict:
    """
    Get all data needed for the security dashboard
    
    Returns:
        Dictionary with metrics, alerts, sessions, and logs
    """
    monitor = SecurityMonitor()
    
    return {
        "metrics": monitor.get_security_metrics().__dict__,
        "active_alerts": [alert.to_dict() for alert in monitor.get_active_alerts()],
        "recent_alerts": [alert.to_dict() for alert in monitor.get_recent_alerts(hours=24)],
        "alert_count": {
            "critical": len([a for a in monitor.alerts if a.severity == "critical" and not a.is_resolved]),
            "high": len([a for a in monitor.alerts if a.severity == "high" and not a.is_resolved]),
            "medium": len([a for a in monitor.alerts if a.severity == "medium" and not a.is_resolved]),
            "low": len([a for a in monitor.alerts if a.severity == "low" and not a.is_resolved])
        }
    }


if __name__ == "__main__":
    # Example: Create some test alerts
    monitor = SecurityMonitor()
    
    # Simulate brute force detection
    monitor.detect_brute_force_attack("198.51.100.1", failed_attempts=10)
    
    # Simulate PII leak detection
    monitor.detect_pii_leak("api-server.log", ["email_addresses", "iban_numbers"])
    
    # Simulate unusual access
    monitor.detect_suspicious_access(
        "user@example.com",
        "Unknown location",
        "45.123.67.89"
    )
    
    # Get dashboard data
    dashboard_data = get_security_dashboard_data()
    print(json.dumps(dashboard_data, indent=2))

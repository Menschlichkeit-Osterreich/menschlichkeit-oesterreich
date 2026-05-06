#!/usr/bin/env python3
"""
Comprehensive Log Analyzer & Monitor für Menschlichkeit Österreich Platform
Zentralisiertes Logging, Monitoring und Alerting für alle Services
"""

import argparse
import json
import logging
import os
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# Constants
LOG_PATTERN = "*.log"
VS_CODE_SERVICE = "VS Code"

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("log-analyzer.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


@dataclass
class LogEntry:
    timestamp: str
    level: str
    service: str
    component: str
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    error_code: Optional[str] = None
    stack_trace: Optional[str] = None


@dataclass
class ServiceHealth:
    service_name: str
    status: str  # 'healthy', 'warning', 'error', 'unknown'
    total_logs: int
    error_count: int
    warning_count: int
    last_activity: str
    issues: List[str]
    recommendations: List[str]


@dataclass
class LogAnalysisReport:
    timestamp: str
    services_analyzed: List[str]
    service_health: List[ServiceHealth]
    critical_issues: List[str]
    performance_metrics: Dict[str, Any]
    security_alerts: List[str]
    recommendations: List[str]
    next_actions: List[str]


class MenschlichkeitLogAnalyzer:
    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path(__file__).parent.parent
        self.log_sources = {
            "vscode": {
                "paths": ["~/.vscode-insiders/logs", "~/.vscode/logs", ".vscode/logs"],
                "patterns": [LOG_PATTERN, "exthost*.log", "main*.log"],
                "service_name": VS_CODE_SERVICE,
            },
            "api": {
                "paths": ["api.menschlichkeit-oesterreich.at/logs", "logs/api"],
                "patterns": [LOG_PATTERN, "uvicorn*.log", "fastapi*.log"],
                "service_name": "FastAPI",
            },
            "crm": {
                "paths": [
                    "crm.menschlichkeit-oesterreich.at/logs",
                    "crm.menschlichkeit-oesterreich.at/sites/default/" "files/logs",
                    "logs/crm",
                ],
                "patterns": [LOG_PATTERN, "drupal*.log", "civicrm*.log"],
                "service_name": "CRM",
            },
            "frontend": {
                "paths": ["frontend/logs", "frontend/dist/logs", "logs/frontend"],
                "patterns": [LOG_PATTERN, "build*.log", "webpack*.log"],
                "service_name": "Frontend",
            },
            "n8n": {
                "paths": [
                    "automation/n8n/logs",
                    "automation/n8n/data/logs",
                    "logs/n8n",
                ],
                "patterns": [LOG_PATTERN, "n8n*.log", "workflow*.log"],
                "service_name": "n8n",
            },
            "deployment": {
                "paths": ["logs", "deployment-logs", "quality-reports"],
                "patterns": ["deploy*.log", "build*.log", "quality*.log", "plesk*.log"],
                "service_name": "Deployment",
            },
        }

        # Error patterns for different log types
        self.error_patterns = {
            "critical": [
                r"FATAL|CRITICAL|EMERGENCY",
                r"500\s+Internal\s+Server\s+Error",
                r"Database\s+connection\s+failed",
                r"Out\s+of\s+memory",
                r"Permission\s+denied",
            ],
            "error": [
                r"ERROR|Error|error",
                r"Exception|exception",
                r"Failed\s+to|failed\s+to",
                r"Cannot\s+|Can\'t\s+",
                r"Invalid\s+|Undefined\s+",
            ],
            "warning": [
                r"WARNING|Warning|warn",
                r"Deprecated|deprecated",
                r"Timeout|timeout",
                r"Retry|retry",
                r"Slow\s+query",
            ],
            "security": [
                r"Authentication\s+failed",
                r"Unauthorized\s+access",
                r"SQL\s+injection",
                r"XSS\s+attempt",
                r"CSRF\s+token",
            ],
        }

    def analyze_all_logs(self) -> LogAnalysisReport:
        """Analysiere alle Logs und erstelle umfassenden Report"""
        logger.info("🔍 Starting comprehensive log analysis...")

        all_logs = []
        service_health = []

        # Analysiere jeden Service
        for service_key, config in self.log_sources.items():
            logger.info(f"Analyzing {config['service_name']} logs...")

            logs = self.collect_service_logs(service_key)
            all_logs.extend(logs)

            health = self.analyze_service_health(service_key, logs)
            service_health.append(health)

        # Gesamtanalyse
        critical_issues = self.identify_critical_issues(all_logs)
        performance_metrics = self.calculate_performance_metrics(all_logs)
        security_alerts = self.detect_security_issues(all_logs)
        recommendations = self.generate_recommendations(service_health)
        next_actions = self.generate_next_actions(
            critical_issues, security_alerts, service_health
        )

        return LogAnalysisReport(
            timestamp=datetime.now().isoformat(),
            services_analyzed=[s["service_name"] for s in self.log_sources.values()],
            service_health=service_health,
            critical_issues=critical_issues,
            performance_metrics=performance_metrics,
            security_alerts=security_alerts,
            recommendations=recommendations,
            next_actions=next_actions,
        )

    def collect_service_logs(self, service_key: str) -> List[LogEntry]:
        """Sammle Logs für einen spezifischen Service"""
        config = self.log_sources[service_key]
        logs = []

        for path_pattern in config["paths"]:
            # Expandiere Home-Directory
            if path_pattern.startswith("~"):
                path_pattern = str(Path.home()) + path_pattern[1:]

            # Absoluter oder relativer Pfad
            if not os.path.isabs(path_pattern):
                path_pattern = str(self.project_root / path_pattern)

            log_dir = Path(path_pattern)
            if not log_dir.exists():
                continue

            # Suche Log-Dateien
            for pattern in config["patterns"]:
                for log_file in log_dir.glob(pattern):
                    if log_file.is_file():
                        file_logs = self.parse_log_file(
                            log_file, config["service_name"]
                        )
                        logs.extend(file_logs)

        return logs

    def parse_log_file(self, log_file: Path, service: str) -> List[LogEntry]:
        """Parse eine einzelne Log-Datei"""
        logs = []

        try:
            with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()

            for i, line in enumerate(lines, 1):
                entry = self.parse_log_line(line, service, str(log_file), i)
                if entry:
                    logs.append(entry)

        except Exception as e:
            logger.error(f"Error parsing {log_file}: {e}")

        return logs

    def parse_log_line(
        self, line: str, service: str, file_path: str, line_number: int
    ) -> Optional[LogEntry]:
        """Parse eine einzelne Log-Zeile"""
        line = line.strip()
        if not line:
            return None

        # Standard Log-Pattern (ISO timestamp + level + message)
        patterns = [
            # ISO timestamp format
            r"(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.,]\d{3})\s*"
            r"\[?(\w+)\]?\s*(.+)",
            # Simple timestamp format
            r"(\d{4}/\d{2}/\d{2}\s+\d{2}:\d{2}:\d{2})\s+" r"\[?(\w+)\]?\s*(.+)",
            # No timestamp - just level and message
            r"\[?(\w+)\]?\s*:\s*(.+)",
        ]

        timestamp = datetime.now().isoformat()
        message = line

        for pattern in patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    timestamp, _, message = groups
                elif len(groups) == 2:
                    _, message = groups
                break

        # Bestimme Level basierend auf Patterns
        level = self.determine_log_level(line)

        # Extrahiere Component falls möglich
        component = self.extract_component(message, service)

        return LogEntry(
            timestamp=timestamp,
            level=level.upper(),
            service=service,
            component=component,
            message=message,
            file_path=file_path,
            line_number=line_number,
        )

    def determine_log_level(self, line: str) -> str:
        """Bestimme Log-Level basierend auf Content"""
        line_lower = line.lower()

        if any(re.search(p, line_lower) for p in self.error_patterns["critical"]):
            return "CRITICAL"
        elif any(re.search(p, line_lower) for p in self.error_patterns["error"]):
            return "ERROR"
        elif any(re.search(p, line_lower) for p in self.error_patterns["warning"]):
            return "WARNING"
        else:
            return "INFO"

    def extract_component(self, message: str, service: str) -> str:
        """Extrahiere Component aus Log-Message"""
        component_patterns = {
            "VS Code": [r"(exthost|main|renderer|worker)", r"\[([\w.-]+)\]"],
            "FastAPI": [r"(uvicorn|gunicorn|fastapi)", r"(\w+\.py)"],
            "CRM": [r"(drupal|civicrm|mysql)", r"(\w+\.module|\w+\.php)"],
            "Frontend": [r"(webpack|react|nextjs)", r"(\w+\.tsx?|\w+\.jsx?)"],
            "n8n": [r"(workflow|node|webhook)", r"(\w+\.json)"],
            "Deployment": [r"(docker|plesk|ssh)", r"(\w+\.sh|\w+\.ps1)"],
        }

        if service in component_patterns:
            for pattern in component_patterns[service]:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    return match.group(1)

        return "main"

    def analyze_service_health(
        self, service_key: str, logs: List[LogEntry]
    ) -> ServiceHealth:
        """Analysiere Gesundheit eines Services"""
        config = self.log_sources[service_key]
        service_name = config["service_name"]

        if not logs:
            return ServiceHealth(
                service_name=service_name,
                status="unknown",
                total_logs=0,
                error_count=0,
                warning_count=0,
                last_activity="never",
                issues=["No logs found"],
                recommendations=[f"Check {service_name} logging configuration"],
            )

        # Zähle Log-Levels
        total_logs = len(logs)
        error_count = len([l for l in logs if l.level in ["ERROR", "CRITICAL"]])
        warning_count = len([l for l in logs if l.level == "WARNING"])

        # Bestimme Status
        error_rate = error_count / total_logs if total_logs > 0 else 0
        warning_rate = warning_count / total_logs if total_logs > 0 else 0

        if error_rate > 0.1:  # > 10% errors
            status = "error"
        elif error_rate > 0.05 or warning_rate > 0.2:  # > 5% errors or > 20% warnings
            status = "warning"
        else:
            status = "healthy"

        # Letzte Aktivität
        latest_log = max(logs, key=lambda x: x.timestamp)
        last_activity = latest_log.timestamp

        # Identifiziere Issues
        issues = self.identify_service_issues(logs)

        # Generiere Recommendations
        recommendations = self.generate_service_recommendations(
            service_name, status, error_rate
        )

        return ServiceHealth(
            service_name=service_name,
            status=status,
            total_logs=total_logs,
            error_count=error_count,
            warning_count=warning_count,
            last_activity=last_activity,
            issues=issues,
            recommendations=recommendations,
        )

    def identify_service_issues(self, logs: List[LogEntry]) -> List[str]:
        """Identifiziere spezifische Issues in Service-Logs"""
        issues = []

        # Häufige Error-Patterns
        error_messages = [
            log.message for log in logs if log.level in ["ERROR", "CRITICAL"]
        ]

        # Gruppiere ähnliche Errors
        error_groups = defaultdict(int)
        for msg in error_messages:
            # Vereinfache Message für Gruppierung
            simplified = re.sub(r"\d+", "N", msg)
            simplified = re.sub(r'["\'][^"\']*["\']', "STRING", simplified)
            error_groups[simplified] += 1

        # Top Issues
        for error, count in sorted(
            error_groups.items(), key=lambda x: x[1], reverse=True
        )[:5]:
            if count > 1:
                issues.append(f"Repeated error ({count}x): {error[:100]}...")

        return issues

    def generate_service_recommendations(
        self, service_name: str, status: str, error_rate: float
    ) -> List[str]:
        """Generiere Service-spezifische Empfehlungen"""
        recommendations = []

        if status == "error":
            recommendations.append(
                f"🚨 {service_name} needs immediate attention - high error rate "
                f"({error_rate:.1%})"
            )

        if status in ["error", "warning"]:
            recommendations.append(
                f"📊 Review {service_name} configuration and resource allocation"
            )

        # Service-spezifische Empfehlungen
        service_specific = {
            "VS Code": [
                "Check extension compatibility",
                "Clear extension cache",
                "Update VS Code Insiders",
            ],
            "FastAPI": [
                "Check database connections",
                "Monitor API response times",
                "Review error handling",
            ],
            "CRM": [
                "Check CiviCRM scheduled jobs",
                "Monitor database performance",
                "Review Drupal cache settings",
            ],
            "Frontend": [
                "Check build process",
                "Review bundle size",
                "Monitor render performance",
            ],
            "n8n": [
                "Check workflow execution logs",
                "Review webhook endpoints",
                "Monitor memory usage",
            ],
            "Deployment": [
                "Check SSH connections",
                "Review deployment scripts",
                "Monitor disk space",
            ],
        }

        if service_name in service_specific:
            recommendations.extend(service_specific[service_name][:2])

        return recommendations

    def identify_critical_issues(self, logs: List[LogEntry]) -> List[str]:
        """Identifiziere kritische Issues über alle Services"""
        critical_issues = []

        # CRITICAL level logs
        critical_logs = [log for log in logs if log.level == "CRITICAL"]
        for log in critical_logs:
            critical_issues.append(
                f"🚨 CRITICAL in {log.service}: {log.message[:100]}..."
            )

        # Systemweite Issues
        all_messages = " ".join([log.message for log in logs])

        system_issues = [
            (
                "Database",
                r"database.*connection.*fail|mysql.*error|" + r"postgresql.*error",
            ),
            ("Memory", r"out.*of.*memory|memory.*limit|heap.*overflow"),
            ("Disk", r"disk.*full|no.*space|storage.*limit"),
            ("Network", r"connection.*timeout|network.*unreachable|" + r"dns.*fail"),
            ("Security", r"authentication.*fail|unauthorized|" + r"security.*breach"),
        ]

        for issue_type, pattern in system_issues:
            if re.search(pattern, all_messages, re.IGNORECASE):
                critical_issues.append(f"🔴 System-wide {issue_type} issues detected")

        return critical_issues[:10]  # Limit to top 10

    def calculate_performance_metrics(self, logs: List[LogEntry]) -> Dict[str, Any]:
        """Berechne Performance-Metriken"""
        if not logs:
            return {}

        total_logs = len(logs)

        # Log-Level Distribution
        level_counts = defaultdict(int)
        for log in logs:
            level_counts[log.level] += 1

        # Service Distribution
        service_counts = defaultdict(int)
        for log in logs:
            service_counts[log.service] += 1

        # Zeitliche Verteilung (letzte 24h)
        now = datetime.now()
        recent_logs = []

        for log in logs:
            try:
                log_time = datetime.fromisoformat(log.timestamp.replace("Z", "+00:00"))
                if (now - log_time).total_seconds() < 86400:  # 24 hours
                    recent_logs.append(log)
            except ValueError:
                continue

        return {
            "total_logs": total_logs,
            "logs_last_24h": len(recent_logs),
            "error_rate": level_counts["ERROR"] / total_logs if total_logs > 0 else 0,
            "warning_rate": (
                level_counts["WARNING"] / total_logs if total_logs > 0 else 0
            ),
            "level_distribution": dict(level_counts),
            "service_distribution": dict(service_counts),
            "most_active_service": (
                max(service_counts.items(), key=lambda x: x[1])[0]
                if service_counts
                else "none"
            ),
        }

    def detect_security_issues(self, logs: List[LogEntry]) -> List[str]:
        """Erkenne Sicherheitsprobleme in Logs"""
        security_alerts = []

        security_messages = []
        for log in logs:
            if any(
                re.search(p, log.message, re.IGNORECASE)
                for p in self.error_patterns["security"]
            ):
                security_messages.append(log)

        if security_messages:
            security_alerts.append(
                f"🛡️ {len(security_messages)} security-related log entries detected"
            )

        # Spezifische Security-Patterns
        all_messages = " ".join([l.message for l in logs])

        security_checks = [
            ("Failed logins", r"login.*fail|authentication.*fail"),
            ("Unauthorized access", r"unauthorized|forbidden|access.*denied"),
            ("Suspicious activity", r"injection|xss|csrf|malicious"),
            ("Certificate issues", r"certificate.*error|ssl.*error|tls.*error"),
        ]

        for check_name, pattern in security_checks:
            matches = len(re.findall(pattern, all_messages, re.IGNORECASE))
            if matches > 0:
                security_alerts.append(f"⚠️ {check_name}: {matches} incidents detected")

        return security_alerts

    def generate_recommendations(
        self, service_health: List[ServiceHealth]
    ) -> List[str]:
        """Generiere übergreifende Empfehlungen"""
        recommendations = []

        # Service Status Overview
        healthy_services = [s for s in service_health if s.status == "healthy"]
        warning_services = [s for s in service_health if s.status == "warning"]
        error_services = [s for s in service_health if s.status == "error"]

        if len(healthy_services) == len(service_health):
            recommendations.append("✅ All services are healthy - continue monitoring")

        if error_services:
            recommendations.append(
                f"🚨 Immediate attention needed for: {', '.join([s.service_name for s in error_services])}"
            )

        if warning_services:
            recommendations.append(
                f"⚠️ Monitor closely: {', '.join([s.service_name for s in warning_services])}"
            )

        # System-wide recommendations
        total_errors = sum(s.error_count for s in service_health)
        if total_errors > 100:
            recommendations.append(
                "📊 Consider implementing centralized error tracking"
            )

        recommendations.extend(
            [
                "🔄 Setup automated log rotation for all services",
                "📈 Implement real-time monitoring dashboards",
                "🔔 Configure alerting for critical errors",
                "💾 Regular backup of important log data",
            ]
        )

        return recommendations[:10]

    def generate_next_actions(
        self,
        critical_issues: List[str],
        security_alerts: List[str],
        service_health: List[ServiceHealth],
    ) -> List[str]:
        """Generiere konkrete nächste Schritte"""
        actions = []

        # Kritische Issues zuerst
        if critical_issues:
            actions.append("🚨 Address critical issues immediately")

        if security_alerts:
            actions.append("🛡️ Review and address security alerts")

        # Service-spezifische Actions
        error_services = [s for s in service_health if s.status == "error"]
        if error_services:
            for service in error_services:
                actions.append(f"🔧 Debug and fix {service.service_name} errors")

        # Präventive Actions
        actions.extend(
            [
                "📊 Setup log monitoring dashboard",
                "🔄 Implement log aggregation system",
                "📈 Create performance baseline metrics",
                "🧪 Test error recovery procedures",
                "📚 Document troubleshooting procedures",
            ]
        )

        return actions[:8]

    def save_report(
        self, report: LogAnalysisReport, output_file: Optional[Path] = None
    ):
        """Speichere Analyse-Report"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = self.project_root / f"log-analysis-report-{timestamp}.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(asdict(report), f, indent=2, ensure_ascii=False)

        logger.info(f"📄 Report saved: {output_file}")

    def print_summary(self, report: LogAnalysisReport):
        """Drucke Report-Zusammenfassung"""
        print("\n" + "=" * 80)
        print("🔍 LOG ANALYSIS SUMMARY")
        print("=" * 80)

        print(f"\n📊 SERVICES ANALYZED: {len(report.services_analyzed)}")
        for service_health in report.service_health:
            status_icon = {
                "healthy": "✅",
                "warning": "⚠️",
                "error": "🚨",
                "unknown": "❓",
            }.get(service_health.status, "❓")

            print(
                f"  {status_icon} {service_health.service_name:15} | "
                f"Status: {service_health.status:8} | "
                f"Logs: {service_health.total_logs:5} | "
                f"Errors: {service_health.error_count:3}"
            )

        if report.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES ({len(report.critical_issues)}):")
            for issue in report.critical_issues[:5]:
                print(f"  • {issue}")

        if report.security_alerts:
            print(f"\n🛡️ SECURITY ALERTS ({len(report.security_alerts)}):")
            for alert in report.security_alerts:
                print(f"  • {alert}")

        perf = report.performance_metrics
        if perf:
            print(f"\n📈 PERFORMANCE METRICS:")
            print(f"  Total Logs: {perf.get('total_logs', 0)}")
            print(f"  Error Rate: {perf.get('error_rate', 0):.2%}")
            print(f"  Most Active Service: {perf.get('most_active_service', 'N/A')}")

        print(f"\n🎯 TOP RECOMMENDATIONS:")
        for i, rec in enumerate(report.recommendations[:5], 1):
            print(f"  {i}. {rec}")

        print(f"\n⚡ NEXT ACTIONS:")
        for i, action in enumerate(report.next_actions[:5], 1):
            print(f"  {i}. {action}")

        print("\n" + "=" * 80)


def main():
    parser = argparse.ArgumentParser(
        description="Comprehensive Log Analyzer für Menschlichkeit Österreich"
    )
    parser.add_argument("--output", help="Output file path")
    parser.add_argument("--service", help="Analyze specific service only")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--watch", action="store_true", help="Continuous monitoring")

    args = parser.parse_args()

    analyzer = MenschlichkeitLogAnalyzer()

    if args.watch:
        print("🔄 Starting continuous log monitoring...")
        while True:
            try:
                report = analyzer.analyze_all_logs()
                analyzer.print_summary(report)

                if args.output:
                    analyzer.save_report(report, Path(args.output))

                print("⏰ Next analysis in 5 minutes...")
                import time

                time.sleep(300)  # 5 minutes

            except KeyboardInterrupt:
                print("\n👋 Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                import time

                time.sleep(60)  # Wait 1 minute before retry
    else:
        # Single analysis
        report = analyzer.analyze_all_logs()
        analyzer.print_summary(report)

        if args.output:
            analyzer.save_report(report, Path(args.output))
        else:
            analyzer.save_report(report)


if __name__ == "__main__":
    main()

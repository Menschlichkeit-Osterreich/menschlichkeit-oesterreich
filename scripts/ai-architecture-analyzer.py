#!/usr/bin/env python3
"""
AI Architecture Analyzer für Menschlichkeit Österreich Multi-Service Platform
Analysiert die Architektur und gibt Empfehlungen für Optimierungen
"""

import ast
import json
import os
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class ServiceAnalysis:
    name: str
    path: str
    technology: str
    files_count: int
    lines_of_code: int
    dependencies: List[str]
    api_endpoints: List[str]
    database_models: List[str]
    test_coverage: float
    security_issues: List[str]
    performance_metrics: Dict[str, Any]
    ai_recommendations: List[str]

@dataclass
class ArchitectureAnalysis:
    timestamp: str
    services: List[ServiceAnalysis]
    inter_service_dependencies: Dict[str, List[str]]
    shared_components: List[str]
    integration_points: List[str]
    security_assessment: Dict[str, Any]
    performance_assessment: Dict[str, Any]
    scalability_recommendations: List[str]
    ai_optimization_suggestions: List[str]

class MenschlichkeitArchitectureAnalyzer:
    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path(__file__).parent.parent
        self.services = {
            'api': {
                'path': 'api.menschlichkeit-oesterreich.at',
                'technology': 'FastAPI/Python',
                'entry_point': 'app/main.py',
                'config_files': ['.env', 'requirements.txt'],
                'test_patterns': ['test_*.py', '*_test.py']
            },
            'crm': {
                'path': 'crm.menschlichkeit-oesterreich.at',
                'technology': 'Drupal 10 + CiviCRM/PHP',
                'entry_point': 'httpdocs/index.php',
                'config_files': ['composer.json', 'sites/default/settings.php'],
                'test_patterns': ['*Test.php', 'tests/*.php']
            },
            'frontend': {
                'path': 'frontend',
                'technology': 'React/TypeScript',
                'entry_point': 'src/App.tsx',
                'config_files': ['package.json', 'tsconfig.json', 'tailwind.config.js'],
                'test_patterns': ['*.test.tsx', '*.test.ts', '__tests__/*.tsx']
            },
            'games': {
                'path': 'web',
                'technology': 'Web Games + Prisma',
                'entry_point': 'games/index.html',
                'config_files': ['package.json', 'schema.prisma'],
                'test_patterns': ['*.test.js', 'tests/*.js']
            },
            'website': {
                'path': 'website',
                'technology': 'WordPress/HTML',
                'entry_point': 'index.html',
                'config_files': ['wp-config.php', 'composer.json'],
                'test_patterns': ['tests/*.php']
            },
            'n8n': {
                'path': 'automation/n8n',
                'technology': 'n8n Workflows',
                'entry_point': 'docker-compose.yml',
                'config_files': ['.env', 'package.json'],
                'test_patterns': ['*.test.js', 'tests/*.js']
            }
        }

    def analyze_service(self, service_name: str) -> ServiceAnalysis:
        """Analysiere einen spezifischen Service"""
        service_config = self.services[service_name]
        service_path = self.project_root / service_config['path']

        if not service_path.exists():
            return ServiceAnalysis(
                name=service_name,
                path=service_config['path'],
                technology=service_config['technology'],
                files_count=0,
                lines_of_code=0,
                dependencies=[],
                api_endpoints=[],
                database_models=[],
                test_coverage=0.0,
                security_issues=[],
                performance_metrics={},
                ai_recommendations=["Service path does not exist"]
            )

        # Analyze files
        files_count = self.count_files(service_path)
        lines_of_code = self.count_lines_of_code(service_path, service_config['technology'])

        # Analyze dependencies
        dependencies = self.analyze_dependencies(service_path, service_config)

        # Analyze API endpoints
        api_endpoints = self.analyze_api_endpoints(service_path, service_config['technology'])

        # Analyze database models
        database_models = self.analyze_database_models(service_path, service_config['technology'])

        # Analyze test coverage
        test_coverage = self.analyze_test_coverage(service_path, service_config)

        # Security analysis
        security_issues = self.analyze_security_issues(service_path, service_config['technology'])

        # Performance metrics
        performance_metrics = self.analyze_performance_metrics(service_path, service_config)

        # AI recommendations
        ai_recommendations = self.generate_ai_recommendations(
            service_name, service_config, files_count, lines_of_code,
            dependencies, test_coverage, security_issues
        )

        return ServiceAnalysis(
            name=service_name,
            path=service_config['path'],
            technology=service_config['technology'],
            files_count=files_count,
            lines_of_code=lines_of_code,
            dependencies=dependencies,
            api_endpoints=api_endpoints,
            database_models=database_models,
            test_coverage=test_coverage,
            security_issues=security_issues,
            performance_metrics=performance_metrics,
            ai_recommendations=ai_recommendations
        )

    def count_files(self, path: Path) -> int:
        """Zähle alle relevanten Dateien"""
        extensions = ['.py', '.php', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss']
        count = 0

        for ext in extensions:
            count += len(list(path.rglob(f'*{ext}')))

        return count

    def count_lines_of_code(self, path: Path, technology: str) -> int:
        """Zähle Lines of Code basierend auf Technologie"""
        extensions_map = {
            'FastAPI/Python': ['.py'],
            'Drupal 10 + CiviCRM/PHP': ['.php', '.module', '.inc', '.install'],
            'React/TypeScript': ['.ts', '.tsx', '.js', '.jsx'],
            'Web Games + Prisma': ['.js', '.ts', '.html', '.css'],
            'WordPress/HTML': ['.php', '.html', '.js', '.css'],
            'n8n Workflows': ['.js', '.json', '.yaml', '.yml']
        }

        extensions = extensions_map.get(technology, ['.py', '.js', '.php'])
        total_lines = 0

        for ext in extensions:
            for file_path in path.rglob(f'*{ext}'):
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        total_lines += len(f.readlines())
                except:
                    continue

        return total_lines

    def analyze_dependencies(self, path: Path, config: Dict) -> List[str]:
        """Analysiere Dependencies basierend auf Konfigurationsdateien"""
        dependencies = []

        for config_file in config['config_files']:
            config_path = path / config_file
            if config_path.exists():
                if config_file == 'package.json':
                    dependencies.extend(self.parse_npm_dependencies(config_path))
                elif config_file == 'requirements.txt':
                    dependencies.extend(self.parse_python_requirements(config_path))
                elif config_file == 'composer.json':
                    dependencies.extend(self.parse_composer_dependencies(config_path))

        return dependencies

    def parse_npm_dependencies(self, package_json: Path) -> List[str]:
        """Parse npm dependencies"""
        try:
            with open(package_json, 'r', encoding='utf-8') as f:
                data = json.load(f)

            deps = []
            if 'dependencies' in data:
                deps.extend(data['dependencies'].keys())
            if 'devDependencies' in data:
                deps.extend(data['devDependencies'].keys())

            return deps
        except:
            return []

    def parse_python_requirements(self, requirements_txt: Path) -> List[str]:
        """Parse Python requirements"""
        try:
            with open(requirements_txt, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            deps = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Extract package name (before version specifiers)
                    package = re.split(r'[>=<~!]', line)[0].strip()
                    if package:
                        deps.append(package)

            return deps
        except:
            return []

    def parse_composer_dependencies(self, composer_json: Path) -> List[str]:
        """Parse Composer dependencies"""
        try:
            with open(composer_json, 'r', encoding='utf-8') as f:
                data = json.load(f)

            deps = []
            if 'require' in data:
                deps.extend(data['require'].keys())
            if 'require-dev' in data:
                deps.extend(data['require-dev'].keys())

            return deps
        except:
            return []

    def analyze_api_endpoints(self, path: Path, technology: str) -> List[str]:
        """Analysiere API Endpoints basierend auf Technologie"""
        endpoints = []

        if 'FastAPI' in technology:
            endpoints = self.extract_fastapi_endpoints(path)
        elif 'Drupal' in technology:
            endpoints = self.extract_drupal_routes(path)
        elif 'React' in technology:
            endpoints = self.extract_api_calls(path)

        return endpoints

    def extract_fastapi_endpoints(self, path: Path) -> List[str]:
        """Extrahiere FastAPI Endpoints"""
        endpoints = []

        for py_file in path.rglob('*.py'):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find FastAPI routes
                route_patterns = [
                    r'@router\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']',
                    r'@app\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']'
                ]

                for pattern in route_patterns:
                    matches = re.findall(pattern, content)
                    for method, route in matches:
                        endpoints.append(f"{method.upper()} {route}")

            except:
                continue

        return endpoints

    def extract_drupal_routes(self, path: Path) -> List[str]:
        """Extrahiere Drupal Routes"""
        routes = []

        # Check routing.yml files
        for yml_file in path.rglob('*.routing.yml'):
            try:
                with open(yml_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Simple YAML parsing for routes
                route_matches = re.findall(r'^([^:]+):\s*$', content, re.MULTILINE)
                routes.extend(route_matches)

            except:
                continue

        return routes

    def extract_api_calls(self, path: Path) -> List[str]:
        """Extrahiere API Calls aus Frontend Code"""
        api_calls = []

        for js_file in path.rglob('*.{ts,tsx,js,jsx}'):
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find API calls
                api_patterns = [
                    r'fetch\(["\']([^"\']+)["\']',
                    r'axios\.(get|post|put|delete)\(["\']([^"\']+)["\']',
                    r'api\.[a-zA-Z]+\(["\']([^"\']+)["\']'
                ]

                for pattern in api_patterns:
                    matches = re.findall(pattern, content)
                    if matches:
                        if isinstance(matches[0], tuple):
                            api_calls.extend([match[1] if len(match) > 1 else match[0] for match in matches])
                        else:
                            api_calls.extend(matches)

            except:
                continue

        return list(set(api_calls))  # Remove duplicates

    def analyze_database_models(self, path: Path, technology: str) -> List[str]:
        """Analysiere Database Models"""
        models = []

        if 'Prisma' in technology:
            models = self.extract_prisma_models(path)
        elif 'FastAPI' in technology:
            models = self.extract_sqlalchemy_models(path)
        elif 'Drupal' in technology:
            models = self.extract_drupal_entities(path)

        return models

    def extract_prisma_models(self, path: Path) -> List[str]:
        """Extrahiere Prisma Models"""
        models = []

        schema_file = path / 'schema.prisma'
        if not schema_file.exists():
            # Check parent directory
            schema_file = path.parent / 'schema.prisma'

        if schema_file.exists():
            try:
                with open(schema_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find model definitions
                model_matches = re.findall(r'model\s+(\w+)\s*{', content)
                models.extend(model_matches)

            except:
                pass

        return models

    def extract_sqlalchemy_models(self, path: Path) -> List[str]:
        """Extrahiere SQLAlchemy Models"""
        models = []

        for py_file in path.rglob('*.py'):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find SQLAlchemy model classes
                class_matches = re.findall(r'class\s+(\w+)\([^)]*Base[^)]*\):', content)
                models.extend(class_matches)

            except:
                continue

        return models

    def extract_drupal_entities(self, path: Path) -> List[str]:
        """Extrahiere Drupal Entities"""
        entities = []

        for php_file in path.rglob('*.php'):
            try:
                with open(php_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find entity definitions
                entity_matches = re.findall(r'@ContentEntityType\([^)]*id\s*=\s*"([^"]+)"', content)
                entities.extend(entity_matches)

            except:
                continue

        return entities

    def analyze_test_coverage(self, path: Path, config: Dict) -> float:
        """Analysiere Test Coverage (vereinfacht)"""
        test_patterns = config.get('test_patterns', [])

        total_test_files = 0
        for pattern in test_patterns:
            if '*' in pattern:
                total_test_files += len(list(path.rglob(pattern)))
            else:
                test_file = path / pattern
                if test_file.exists():
                    total_test_files += 1

        # Sehr vereinfachte Coverage-Schätzung
        total_source_files = self.count_files(path)
        if total_source_files == 0:
            return 0.0

        # Grobe Schätzung: 1 Test-Datei pro 3 Source-Dateien = 30% Coverage
        estimated_coverage = min(100.0, (total_test_files / max(1, total_source_files / 3)) * 30)
        return round(estimated_coverage, 2)

    def analyze_security_issues(self, path: Path, technology: str) -> List[str]:
        """Analysiere potentielle Sicherheitsprobleme"""
        issues = []

        if 'FastAPI' in technology:
            issues.extend(self.check_python_security(path))
        elif 'PHP' in technology:
            issues.extend(self.check_php_security(path))
        elif 'React' in technology:
            issues.extend(self.check_js_security(path))

        return issues

    def check_python_security(self, path: Path) -> List[str]:
        """Check Python security issues"""
        issues = []

        for py_file in path.rglob('*.py'):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check for common security issues
                if 'eval(' in content:
                    issues.append(f"Dangerous eval() usage in {py_file.name}")

                if 'shell=True' in content:
                    issues.append(f"Potential command injection in {py_file.name}")

                if re.search(r'password\s*=\s*["\'][^"\']{1,20}["\']', content, re.IGNORECASE):
                    issues.append(f"Hardcoded password found in {py_file.name}")

            except:
                continue

        return issues

    def check_php_security(self, path: Path) -> List[str]:
        """Check PHP security issues"""
        issues = []

        for php_file in path.rglob('*.php'):
            try:
                with open(php_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check for common PHP security issues
                if '$_GET' in content and 'mysqli_query' in content:
                    issues.append(f"Potential SQL injection in {php_file.name}")

                if 'eval(' in content:
                    issues.append(f"Dangerous eval() usage in {php_file.name}")

                if 'include $_GET' in content or 'require $_GET' in content:
                    issues.append(f"Potential file inclusion vulnerability in {php_file.name}")

            except:
                continue

        return issues

    def check_js_security(self, path: Path) -> List[str]:
        """Check JavaScript security issues"""
        issues = []

        for js_file in path.rglob('*.{js,jsx,ts,tsx}'):
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check for common JS security issues
                if 'dangerouslySetInnerHTML' in content:
                    issues.append(f"Potential XSS vulnerability in {js_file.name}")

                if 'eval(' in content:
                    issues.append(f"Dangerous eval() usage in {js_file.name}")

                if re.search(r'localStorage\.(setItem|getItem).*token', content, re.IGNORECASE):
                    issues.append(f"Token stored in localStorage in {js_file.name}")

            except:
                continue

        return issues

    def analyze_performance_metrics(self, path: Path, config: Dict) -> Dict[str, Any]:
        """Analysiere Performance Metriken"""
        metrics = {
            'bundle_size_estimate': 0,
            'dependency_count': len(self.analyze_dependencies(path, config)),
            'complexity_score': 0,
            'file_structure_health': 'good'
        }

        # Schätzung der Bundle-Größe basierend auf Dateien
        total_size = 0
        for file_path in path.rglob('*'):
            if file_path.is_file():
                try:
                    total_size += file_path.stat().st_size
                except:
                    continue

        metrics['bundle_size_estimate'] = total_size // 1024  # KB

        # Complexity Score basierend auf Dateianzahl und Verschachtelung
        files_count = self.count_files(path)
        max_depth = self.get_max_directory_depth(path)
        metrics['complexity_score'] = min(100, (files_count // 10) + (max_depth * 5))

        return metrics

    def get_max_directory_depth(self, path: Path) -> int:
        """Bestimme maximale Verzeichnistiefe"""
        max_depth = 0

        for file_path in path.rglob('*'):
            if file_path.is_file():
                depth = len(file_path.relative_to(path).parts) - 1
                max_depth = max(max_depth, depth)

        return max_depth

    def generate_ai_recommendations(self, service_name: str, config: Dict,
                                  files_count: int, lines_of_code: int,
                                  dependencies: List[str], test_coverage: float,
                                  security_issues: List[str]) -> List[str]:
        """Generiere AI-basierte Empfehlungen"""
        recommendations = []

        # Test Coverage Recommendations
        if test_coverage < 50:
            recommendations.append(f"⚠️ Test Coverage für {service_name} ist niedrig ({test_coverage}%). Mehr Tests implementieren.")
        elif test_coverage > 80:
            recommendations.append(f"✅ Ausgezeichnete Test Coverage für {service_name} ({test_coverage}%)!")

        # Dependency Recommendations
        if len(dependencies) > 50:
            recommendations.append(f"📦 {service_name} hat {len(dependencies)} Dependencies. Prüfe auf ungenutzte Pakete.")

        # Security Recommendations
        if security_issues:
            recommendations.append(f"🔐 {len(security_issues)} Sicherheitsprobleme in {service_name} gefunden. Dringend beheben!")
        else:
            recommendations.append(f"✅ Keine offensichtlichen Sicherheitsprobleme in {service_name} gefunden.")

        # Size Recommendations
        if lines_of_code > 10000:
            recommendations.append(f"📏 {service_name} ist groß ({lines_of_code} LOC). Refactoring in kleinere Module erwägen.")

        # Technology-specific recommendations
        tech = config['technology']
        if 'FastAPI' in tech:
            recommendations.append("🐍 FastAPI: Async/await für bessere Performance nutzen")
            recommendations.append("📖 OpenAPI Dokumentation aktuell halten")
        elif 'React' in tech:
            recommendations.append("⚛️ React: Code-Splitting für bessere Bundle-Größe implementieren")
            recommendations.append("🎨 TailwindCSS: Unused styles purgen für Production")
        elif 'Drupal' in tech:
            recommendations.append("🔧 Drupal: Caching-Strategien optimieren")
            recommendations.append("📊 CiviCRM: Scheduled Jobs Performance überwachen")

        return recommendations

    def analyze_inter_service_dependencies(self) -> Dict[str, List[str]]:
        """Analysiere Dependencies zwischen Services"""
        dependencies = {}

        for service_name in self.services.keys():
            dependencies[service_name] = []
            service_path = self.project_root / self.services[service_name]['path']

            if not service_path.exists():
                continue

            # Suche nach API Calls zu anderen Services
            for file_path in service_path.rglob('*'):
                if file_path.is_file() and file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.php']:
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()

                        # Suche nach Service URLs
                        for other_service in self.services.keys():
                            if other_service != service_name:
                                if f"{other_service}.menschlichkeit-oesterreich.at" in content:
                                    if other_service not in dependencies[service_name]:
                                        dependencies[service_name].append(other_service)

                    except:
                        continue

        return dependencies

    def generate_architecture_analysis(self) -> ArchitectureAnalysis:
        """Generiere vollständige Architektur-Analyse"""
        print("🔍 Analysiere Multi-Service Architektur...")

        # Analysiere alle Services
        services_analysis = []
        for service_name in self.services.keys():
            print(f"  📊 Analysiere {service_name}...")
            analysis = self.analyze_service(service_name)
            services_analysis.append(analysis)

        # Inter-Service Dependencies
        print("🔗 Analysiere Service-Dependencies...")
        inter_dependencies = self.analyze_inter_service_dependencies()

        # Shared Components
        shared_components = [
            "Design System (figma-design-system/)",
            "Database Schema (schema.prisma)",
            "Deployment Scripts (scripts/)",
            "Environment Configuration (config-templates/)",
            "Quality Tools (ESLint, PHPStan, Codacy)",
            "MCP Servers (mcp-servers/)"
        ]

        # Integration Points
        integration_points = [
            "API ↔ CRM: JWT Authentication & Data Sync",
            "Frontend ↔ API: REST/GraphQL Communication",
            "Games ↔ Database: Prisma ORM Integration",
            "n8n ↔ All Services: Webhook Automation",
            "Figma ↔ Frontend: Design Token Sync",
            "Plesk ↔ All Services: Deployment Pipeline"
        ]

        # Security Assessment
        all_security_issues = []
        for service in services_analysis:
            all_security_issues.extend(service.security_issues)

        security_assessment = {
            'total_issues': len(all_security_issues),
            'critical_issues': len([issue for issue in all_security_issues if any(word in issue.lower() for word in ['injection', 'xss', 'eval'])]),
            'services_with_issues': len([s for s in services_analysis if s.security_issues]),
            'overall_score': max(0, 100 - len(all_security_issues) * 10)
        }

        # Performance Assessment
        total_dependencies = sum(len(s.dependencies) for s in services_analysis)
        avg_test_coverage = sum(s.test_coverage for s in services_analysis) / len(services_analysis)

        performance_assessment = {
            'total_dependencies': total_dependencies,
            'average_test_coverage': round(avg_test_coverage, 2),
            'total_lines_of_code': sum(s.lines_of_code for s in services_analysis),
            'services_count': len(services_analysis),
            'complexity_score': sum(s.performance_metrics.get('complexity_score', 0) for s in services_analysis)
        }

        # Scalability Recommendations
        scalability_recommendations = [
            "🚀 Microservices: Services sind gut aufgeteilt, Container-Orchestrierung mit Kubernetes erwägen",
            "📊 Database: PostgreSQL für Games ist gut skalierbar, Read-Replicas für hohe Last einrichten",
            "🔄 API Gateway: Zentrales Gateway für Service-Kommunikation implementieren",
            "⚡ Caching: Redis-Caching für API und CRM implementieren",
            "📈 Monitoring: Prometheus + Grafana für Service-Monitoring einrichten",
            "🌐 CDN: CloudFront/CloudFlare für statische Assets nutzen"
        ]

        # AI Optimization Suggestions
        ai_optimization_suggestions = [
            "🤖 AI Code Reviews: GitHub Actions mit AI-basierter Code-Analyse erweitern",
            "📝 Auto-Documentation: AI-basierte API-Dokumentation aus Code generieren",
            "🧪 Test Generation: AI-gestützte Test-Case-Generierung für kritische Paths",
            "🔍 Performance Monitoring: AI-basierte Anomaly Detection für Service-Metriken",
            "🛡️ Security Scanning: Kontinuierliche AI-basierte Vulnerability-Scans",
            "📊 Architecture Evolution: AI-Empfehlungen für Service-Refactoring basierend auf Usage-Patterns"
        ]

        return ArchitectureAnalysis(
            timestamp=datetime.now().isoformat(),
            services=services_analysis,
            inter_service_dependencies=inter_dependencies,
            shared_components=shared_components,
            integration_points=integration_points,
            security_assessment=security_assessment,
            performance_assessment=performance_assessment,
            scalability_recommendations=scalability_recommendations,
            ai_optimization_suggestions=ai_optimization_suggestions
        )

    def save_analysis(self, analysis: ArchitectureAnalysis, output_file: Optional[Path] = None):
        """Speichere Analyse in JSON-Datei"""
        if output_file is None:
            output_file = self.project_root / 'architecture-analysis.json'

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(analysis), f, indent=2, ensure_ascii=False)

        print(f"📄 Analyse gespeichert: {output_file}")

    def print_summary(self, analysis: ArchitectureAnalysis):
        """Drucke Zusammenfassung der Analyse"""
        print("\n" + "="*80)
        print("🏗️  ARCHITEKTUR-ANALYSE ZUSAMMENFASSUNG")
        print("="*80)

        print(f"\n📊 SERVICES ÜBERSICHT:")
        for service in analysis.services:
            status = "✅" if service.files_count > 0 else "❌"
            print(f"  {status} {service.name:12} | {service.technology:25} | {service.files_count:4} files | {service.lines_of_code:6} LOC | {service.test_coverage:5.1f}% tests")

        print(f"\n🔗 INTER-SERVICE DEPENDENCIES:")
        for service, deps in analysis.inter_service_dependencies.items():
            if deps:
                print(f"  {service} → {', '.join(deps)}")

        print(f"\n🛡️  SECURITY ASSESSMENT:")
        sec = analysis.security_assessment
        print(f"  Overall Score: {sec['overall_score']}/100")
        print(f"  Total Issues: {sec['total_issues']} (Critical: {sec['critical_issues']})")
        print(f"  Services with Issues: {sec['services_with_issues']}/{len(analysis.services)}")

        print(f"\n⚡ PERFORMANCE METRICS:")
        perf = analysis.performance_assessment
        print(f"  Total Dependencies: {perf['total_dependencies']}")
        print(f"  Average Test Coverage: {perf['average_test_coverage']}%")
        print(f"  Total Lines of Code: {perf['total_lines_of_code']:,}")
        print(f"  Complexity Score: {perf['complexity_score']}")

        print(f"\n🚀 TOP RECOMMENDATIONS:")
        for i, rec in enumerate(analysis.scalability_recommendations[:3], 1):
            print(f"  {i}. {rec}")

        print(f"\n🤖 AI OPTIMIZATION OPPORTUNITIES:")
        for i, suggestion in enumerate(analysis.ai_optimization_suggestions[:3], 1):
            print(f"  {i}. {suggestion}")

        print("\n" + "="*80)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="AI Architecture Analyzer für Menschlichkeit Österreich")
    parser.add_argument('--output', help='Output JSON file path')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--service', help='Analyze specific service only')

    args = parser.parse_args()

    analyzer = MenschlichkeitArchitectureAnalyzer()

    if args.service:
        # Analyze single service
        if args.service in analyzer.services:
            print(f"🔍 Analysiere Service: {args.service}")
            service_analysis = analyzer.analyze_service(args.service)

            print(f"\n📊 {service_analysis.name} ANALYSIS:")
            print(f"Technology: {service_analysis.technology}")
            print(f"Files: {service_analysis.files_count}")
            print(f"Lines of Code: {service_analysis.lines_of_code}")
            print(f"Dependencies: {len(service_analysis.dependencies)}")
            print(f"API Endpoints: {len(service_analysis.api_endpoints)}")
            print(f"Database Models: {len(service_analysis.database_models)}")
            print(f"Test Coverage: {service_analysis.test_coverage}%")
            print(f"Security Issues: {len(service_analysis.security_issues)}")

            if args.verbose:
                print(f"\nDependencies: {', '.join(service_analysis.dependencies[:10])}...")
                print(f"API Endpoints: {service_analysis.api_endpoints[:5]}")
                print(f"Database Models: {service_analysis.database_models}")
                print(f"Security Issues: {service_analysis.security_issues}")

            print(f"\n🤖 AI RECOMMENDATIONS:")
            for rec in service_analysis.ai_recommendations:
                print(f"  • {rec}")
        else:
            print(f"❌ Service '{args.service}' not found. Available: {', '.join(analyzer.services.keys())}")
    else:
        # Full architecture analysis
        analysis = analyzer.generate_architecture_analysis()
        analyzer.print_summary(analysis)

        if args.output:
            analyzer.save_analysis(analysis, Path(args.output))
        else:
            analyzer.save_analysis(analysis)            analyzer.save_analysis(analysis)

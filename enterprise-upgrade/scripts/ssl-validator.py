#!/usr/bin/env python3
"""
SSL/TLS Configuration Testing and Validation Script
Comprehensive testing for SSL Labs A+ rating compliance

Requirements:
- Python 3.7+
- requests library: pip install requests
- cryptography library: pip install cryptography

Usage:
    python ssl-validator.py [--domain example.com] [--all] [--json-output]
"""

import ssl
import socket
import requests
import json
import time
import argparse
import sys
from datetime import datetime, timezone
from urllib.parse import urlparse
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import concurrent.futures
from typing import Dict, List, Optional, Tuple

class SSLValidator:
    """Comprehensive SSL/TLS configuration validator"""
    
    def __init__(self):
        self.domains = [
            'menschlichkeit-oesterreich.at',
            'www.menschlichkeit-oesterreich.at',
            'crm.menschlichkeit-oesterreich.at',
            'api.menschlichkeit-oesterreich.at'
        ]
        
        self.required_headers = {
            'Strict-Transport-Security': {
                'description': 'HSTS Header',
                'required': True,
                'min_max_age': 31536000  # 1 year
            },
            'X-Frame-Options': {
                'description': 'Clickjacking Protection',
                'required': True,
                'expected_values': ['DENY', 'SAMEORIGIN']
            },
            'X-Content-Type-Options': {
                'description': 'MIME Type Sniffing Protection',
                'required': True,
                'expected_values': ['nosniff']
            },
            'X-XSS-Protection': {
                'description': 'XSS Protection',
                'required': False,
                'expected_values': ['1; mode=block', '0']
            },
            'Referrer-Policy': {
                'description': 'Referrer Policy',
                'required': True,
                'expected_values': ['strict-origin-when-cross-origin', 'strict-origin', 'no-referrer']
            },
            'Content-Security-Policy': {
                'description': 'Content Security Policy',
                'required': True
            }
        }
        
        self.ssl_labs_api_base = "https://api.ssllabs.com/api/v3"
        
    def get_certificate_info(self, hostname: str, port: int = 443) -> Dict:
        """Get detailed certificate information"""
        try:
            # Create SSL context
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            # Connect and get certificate
            with socket.create_connection((hostname, port), timeout=30) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    der_cert = ssock.getpeercert_chain()[0]
                    
            # Parse certificate using cryptography
            cert = x509.load_der_x509_certificate(der_cert, default_backend())
            
            # Extract information
            subject = cert.subject
            issuer = cert.issuer
            
            # Get subject alternative names
            san_list = []
            try:
                san_extension = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
                san_list = [name.value for name in san_extension.value]
            except x509.ExtensionNotFound:
                pass
            
            return {
                'valid': True,
                'subject': subject.rfc4514_string(),
                'issuer': issuer.rfc4514_string(),
                'not_before': cert.not_valid_before.isoformat(),
                'not_after': cert.not_valid_after.isoformat(),
                'days_until_expiry': (cert.not_valid_after - datetime.now(timezone.utc)).days,
                'serial_number': str(cert.serial_number),
                'signature_algorithm': cert.signature_algorithm_oid._name,
                'san_list': san_list,
                'key_size': cert.public_key().key_size if hasattr(cert.public_key(), 'key_size') else 'Unknown'
            }
            
        except Exception as e:
            return {
                'valid': False,
                'error': str(e),
                'hostname': hostname,
                'port': port
            }
    
    def check_tls_version_support(self, hostname: str, port: int = 443) -> Dict:
        """Check supported TLS versions"""
        tls_versions = {
            'TLSv1.0': ssl.PROTOCOL_TLSv1,
            'TLSv1.1': ssl.PROTOCOL_TLSv1_1,
            'TLSv1.2': ssl.PROTOCOL_TLSv1_2,
        }
        
        # Add TLS 1.3 if available
        if hasattr(ssl, 'PROTOCOL_TLSv1_3'):
            tls_versions['TLSv1.3'] = ssl.PROTOCOL_TLSv1_3
        
        supported_versions = {}
        
        for version_name, protocol in tls_versions.items():
            try:
                context = ssl.SSLContext(protocol)
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                
                with socket.create_connection((hostname, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        supported_versions[version_name] = {
                            'supported': True,
                            'version': ssock.version(),
                            'cipher': ssock.cipher()
                        }
            except Exception as e:
                supported_versions[version_name] = {
                    'supported': False,
                    'error': str(e)
                }
        
        return supported_versions
    
    def check_security_headers(self, url: str) -> Dict:
        """Check HTTP security headers"""
        try:
            # Make HTTPS request
            response = requests.get(url, timeout=30, allow_redirects=True)
            headers = response.headers
            
            results = {}
            
            for header_name, config in self.required_headers.items():
                header_value = headers.get(header_name)
                
                if header_value:
                    results[header_name] = {
                        'present': True,
                        'value': header_value,
                        'description': config['description']
                    }
                    
                    # Specific validations
                    if header_name == 'Strict-Transport-Security':
                        max_age = self._extract_max_age(header_value)
                        results[header_name]['max_age'] = max_age
                        results[header_name]['valid'] = max_age >= config.get('min_max_age', 0)
                        results[header_name]['includes_subdomains'] = 'includeSubDomains' in header_value
                        results[header_name]['preload'] = 'preload' in header_value
                    
                    elif 'expected_values' in config:
                        results[header_name]['valid'] = any(expected in header_value 
                                                          for expected in config['expected_values'])
                    else:
                        results[header_name]['valid'] = True
                        
                else:
                    results[header_name] = {
                        'present': False,
                        'required': config.get('required', False),
                        'description': config['description']
                    }
            
            return {
                'status_code': response.status_code,
                'final_url': response.url,
                'headers': results,
                'redirect_chain': [resp.url for resp in response.history]
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'url': url
            }
    
    def _extract_max_age(self, hsts_header: str) -> int:
        """Extract max-age value from HSTS header"""
        try:
            for directive in hsts_header.split(';'):
                directive = directive.strip()
                if directive.startswith('max-age='):
                    return int(directive.split('=')[1])
        except (ValueError, IndexError) as e:
            # Fixed: Added specific exception handling instead of bare except (B110)
            logging.debug(f"Failed to parse HSTS max-age: {e}")
        return 0
    
    def check_ssl_labs_rating(self, hostname: str) -> Dict:
        """Get SSL Labs rating (with rate limiting awareness)"""
        try:
            # Start new assessment
            start_url = f"{self.ssl_labs_api_base}/analyze"
            start_params = {
                'host': hostname,
                'publish': 'off',
                'startNew': 'on',
                'all': 'done'
            }
            
            print(f"Starting SSL Labs assessment for {hostname}...")
            requests.get(start_url, params=start_params, timeout=30)
            
            # Poll for results
            max_attempts = 30
            attempt = 0
            
            while attempt < max_attempts:
                check_params = {'host': hostname}
                response = requests.get(start_url, params=check_params, timeout=30)
                data = response.json()
                
                status = data.get('status', 'UNKNOWN')
                print(f"SSL Labs status for {hostname}: {status}")
                
                if status == 'READY':
                    endpoints = data.get('endpoints', [])
                    if endpoints:
                        endpoint = endpoints[0]
                        return {
                            'status': 'READY',
                            'grade': endpoint.get('grade', 'Unknown'),
                            'grade_trust_ignored': endpoint.get('gradeTrustIgnored', 'Unknown'),
                            'has_warnings': endpoint.get('hasWarnings', False),
                            'is_exceptional': endpoint.get('isExceptional', False),
                            'progress': endpoint.get('progress', 0),
                            'details_url': f"https://www.ssllabs.com/ssltest/analyze.html?d={hostname}"
                        }
                
                elif status == 'ERROR':
                    return {
                        'status': 'ERROR',
                        'error': data.get('statusMessage', 'Unknown error')
                    }
                
                elif status in ['DNS', 'IN_PROGRESS']:
                    time.sleep(10)  # Wait before next check
                    attempt += 1
                else:
                    break
            
            return {
                'status': 'TIMEOUT',
                'message': 'Assessment timed out'
            }
            
        except Exception as e:
            return {
                'status': 'ERROR',
                'error': str(e)
            }
    
    def check_http_redirect(self, hostname: str) -> Dict:
        """Check HTTP to HTTPS redirect"""
        try:
            http_url = f"http://{hostname}"
            response = requests.get(http_url, timeout=30, allow_redirects=False)
            
            if response.status_code in [301, 302, 307, 308]:
                location = response.headers.get('Location', '')
                if location.startswith('https://'):
                    return {
                        'redirects': True,
                        'status_code': response.status_code,
                        'location': location,
                        'redirect_type': 'permanent' if response.status_code in [301, 308] else 'temporary'
                    }
            
            return {
                'redirects': False,
                'status_code': response.status_code,
                'headers': dict(response.headers)
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'hostname': hostname
            }
    
    def run_comprehensive_test(self, hostname: str) -> Dict:
        """Run comprehensive SSL/TLS test for a single domain"""
        print(f"\nTesting {hostname}...")
        
        results = {
            'hostname': hostname,
            'timestamp': datetime.now().isoformat(),
            'tests': {}
        }
        
        # Certificate information
        print(f"  - Checking certificate...")
        results['tests']['certificate'] = self.get_certificate_info(hostname)
        
        # TLS version support
        print(f"  - Checking TLS versions...")
        results['tests']['tls_versions'] = self.check_tls_version_support(hostname)
        
        # Security headers
        print(f"  - Checking security headers...")
        results['tests']['security_headers'] = self.check_security_headers(f"https://{hostname}")
        
        # HTTP redirect
        print(f"  - Checking HTTP redirect...")
        results['tests']['http_redirect'] = self.check_http_redirect(hostname)
        
        return results
    
    def generate_report(self, results: List[Dict]) -> Dict:
        """Generate summary report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_domains': len(results),
                'passed': 0,
                'warnings': 0,
                'failed': 0
            },
            'details': results,
            'recommendations': []
        }
        
        for result in results:
            hostname = result['hostname']
            issues = []
            warnings = []
            
            # Certificate checks
            cert = result['tests'].get('certificate', {})
            if not cert.get('valid', False):
                issues.append(f"Certificate validation failed: {cert.get('error', 'Unknown error')}")
            elif cert.get('days_until_expiry', 0) < 30:
                warnings.append(f"Certificate expires in {cert.get('days_until_expiry', 0)} days")
            
            # TLS version checks
            tls_versions = result['tests'].get('tls_versions', {})
            if tls_versions.get('TLSv1.0', {}).get('supported', False):
                issues.append("TLS 1.0 is supported (should be disabled)")
            if tls_versions.get('TLSv1.1', {}).get('supported', False):
                issues.append("TLS 1.1 is supported (should be disabled)")
            if not tls_versions.get('TLSv1.2', {}).get('supported', False):
                issues.append("TLS 1.2 is not supported (required)")
            
            # Security headers checks
            headers = result['tests'].get('security_headers', {}).get('headers', {})
            hsts = headers.get('Strict-Transport-Security', {})
            if not hsts.get('present', False):
                issues.append("HSTS header is missing")
            elif hsts.get('max_age', 0) < 31536000:
                warnings.append("HSTS max-age is less than 1 year")
            
            if not headers.get('X-Frame-Options', {}).get('present', False):
                issues.append("X-Frame-Options header is missing")
            
            if not headers.get('X-Content-Type-Options', {}).get('present', False):
                issues.append("X-Content-Type-Options header is missing")
            
            # HTTP redirect check
            redirect = result['tests'].get('http_redirect', {})
            if not redirect.get('redirects', False):
                issues.append("HTTP does not redirect to HTTPS")
            
            # Classify result
            if issues:
                report['summary']['failed'] += 1
                result['status'] = 'FAILED'
                result['issues'] = issues
            elif warnings:
                report['summary']['warnings'] += 1
                result['status'] = 'WARNING'
                result['warnings'] = warnings
            else:
                report['summary']['passed'] += 1
                result['status'] = 'PASSED'
        
        # Generate recommendations
        if report['summary']['failed'] > 0:
            report['recommendations'].extend([
                "Address critical SSL/TLS configuration issues before production deployment",
                "Ensure all domains have valid certificates with proper SAN configuration",
                "Disable legacy TLS versions (TLS 1.0 and 1.1)",
                "Implement required security headers (HSTS, X-Frame-Options, etc.)"
            ])
        
        if report['summary']['warnings'] > 0:
            report['recommendations'].extend([
                "Review certificate expiry dates and set up monitoring",
                "Consider extending HSTS max-age to 2 years for enhanced security",
                "Review Content Security Policy implementation"
            ])
        
        return report
    
    def run_ssl_labs_assessment(self, domains: List[str]) -> Dict:
        """Run SSL Labs assessment for multiple domains (rate limited)"""
        print("\nRunning SSL Labs assessments (this may take several minutes)...")
        
        ssl_labs_results = {}
        
        for domain in domains:
            if domain.startswith('www.'):
                continue  # Skip www variants to avoid rate limiting
                
            result = self.check_ssl_labs_rating(domain)
            ssl_labs_results[domain] = result
            
            # Rate limiting: wait between requests
            if result.get('status') != 'ERROR':
                print(f"Waiting to avoid rate limiting...")
                time.sleep(30)
        
        return ssl_labs_results

def main():
    parser = argparse.ArgumentParser(description='SSL/TLS Configuration Validator')
    parser.add_argument('--domain', help='Test specific domain')
    parser.add_argument('--all', action='store_true', help='Test all configured domains')
    parser.add_argument('--ssl-labs', action='store_true', help='Include SSL Labs assessment')
    parser.add_argument('--json-output', help='Save results to JSON file')
    parser.add_argument('--report', help='Generate HTML report')
    
    args = parser.parse_args()
    
    validator = SSLValidator()
    
    # Determine domains to test
    if args.domain:
        domains = [args.domain]
    else:
        domains = validator.domains
    
    print(f"SSL/TLS Configuration Validator")
    print(f"Testing {len(domains)} domain(s)...")
    
    # Run tests
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_to_domain = {
            executor.submit(validator.run_comprehensive_test, domain): domain 
            for domain in domains
        }
        
        for future in concurrent.futures.as_completed(future_to_domain):
            domain = future_to_domain[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"Error testing {domain}: {e}")
                results.append({
                    'hostname': domain,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
    
    # Generate report
    report = validator.generate_report(results)
    
    # SSL Labs assessment (if requested)
    if args.ssl_labs:
        ssl_labs_results = validator.run_ssl_labs_assessment(domains)
        report['ssl_labs'] = ssl_labs_results
    
    # Display summary
    print(f"\n" + "="*60)
    print(f"SSL/TLS VALIDATION REPORT")
    print(f"="*60)
    print(f"Total domains tested: {report['summary']['total_domains']}")
    print(f"Passed: {report['summary']['passed']}")
    print(f"Warnings: {report['summary']['warnings']}")
    print(f"Failed: {report['summary']['failed']}")
    
    if report.get('recommendations'):
        print(f"\nRECOMMENDATIONS:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"{i}. {rec}")
    
    # Output detailed results
    for result in results:
        print(f"\n{result['hostname'].upper()}: {result.get('status', 'UNKNOWN')}")
        
        if 'issues' in result:
            print(f"  Issues:")
            for issue in result['issues']:
                print(f"    - {issue}")
        
        if 'warnings' in result:
            print(f"  Warnings:")
            for warning in result['warnings']:
                print(f"    - {warning}")
        
        # Certificate details
        cert = result['tests'].get('certificate', {})
        if cert.get('valid'):
            print(f"  Certificate expires in {cert.get('days_until_expiry', 'N/A')} days")
    
    # Save JSON output
    if args.json_output:
        with open(args.json_output, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        print(f"\nResults saved to: {args.json_output}")
    
    # Generate HTML report
    if args.report:
        generate_html_report(report, args.report)
        print(f"HTML report generated: {args.report}")
    
    # Exit with appropriate code
    if report['summary']['failed'] > 0:
        sys.exit(1)
    elif report['summary']['warnings'] > 0:
        sys.exit(2)
    else:
        sys.exit(0)

def generate_html_report(report: Dict, output_file: str):
    """Generate HTML report"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SSL/TLS Validation Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
            .passed { background: #d4edda; color: #155724; }
            .warning { background: #fff3cd; color: #856404; }
            .failed { background: #f8d7da; color: #721c24; }
            .domain { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .issue { color: #dc3545; }
            .warning-text { color: #ffc107; }
            .success { color: #28a745; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SSL/TLS Configuration Validation Report</h1>
            <p>Generated: {timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric passed">
                <h3>{passed}</h3>
                <p>Passed</p>
            </div>
            <div class="metric warning">
                <h3>{warnings}</h3>
                <p>Warnings</p>
            </div>
            <div class="metric failed">
                <h3>{failed}</h3>
                <p>Failed</p>
            </div>
        </div>
        
        {domain_results}
        
        {recommendations}
    </body>
    </html>
    """
    
    # Generate domain results HTML
    domain_html = ""
    for result in report['details']:
        status_class = result.get('status', 'unknown').lower()
        domain_html += f'<div class="domain">'
        domain_html += f'<h3>{result["hostname"]} <span class="{status_class}">({result.get("status", "UNKNOWN")})</span></h3>'
        
        if 'issues' in result:
            domain_html += '<ul class="issue">'
            for issue in result['issues']:
                domain_html += f'<li>{issue}</li>'
            domain_html += '</ul>'
        
        if 'warnings' in result:
            domain_html += '<ul class="warning-text">'
            for warning in result['warnings']:
                domain_html += f'<li>{warning}</li>'
            domain_html += '</ul>'
        
        domain_html += '</div>'
    
    # Generate recommendations HTML
    rec_html = ""
    if report.get('recommendations'):
        rec_html = '<div class="recommendations"><h2>Recommendations</h2><ul>'
        for rec in report['recommendations']:
            rec_html += f'<li>{rec}</li>'
        rec_html += '</ul></div>'
    
    # Fill template
    html_content = html_template.format(
        timestamp=report['timestamp'],
        passed=report['summary']['passed'],
        warnings=report['summary']['warnings'],
        failed=report['summary']['failed'],
        domain_results=domain_html,
        recommendations=rec_html
    )
    
    with open(output_file, 'w') as f:
        f.write(html_content)

if __name__ == "__main__":
    main()
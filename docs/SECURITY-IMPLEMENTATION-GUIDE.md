# Security Implementation Guide

This guide provides step-by-step instructions to implement all critical and high-priority security fixes identified in the security overview.

## 🚨 Critical Issues Implementation

### 1. Enable HTTPS for n8n (CRITICAL)

**Timeline:** 24 hours  
**Priority:** CRITICAL  
**Impact:** Prevents credential theft, man-in-the-middle attacks

#### Step 1: Generate SSL Certificates

```bash
# Option A: Using Let's Encrypt (Recommended for production)
sudo certbot certonly --standalone -d n8n.menschlichkeit-oesterreich.at

# Option B: Self-signed certificate (Development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

#### Step 2: Update Docker Compose Configuration

```yaml
# automation/n8n/docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_PROTOCOL=https
      - N8N_SSL_KEY=/certs/key.pem
      - N8N_SSL_CERT=/certs/cert.pem
      - N8N_HOST=n8n.menschlichkeit-oesterreich.at
      - N8N_PORT=5678
      - NODE_ENV=production
    volumes:
      - ./data:/home/node/.n8n
      - ./certs:/certs:ro
    networks:
      - n8n_network

networks:
  n8n_network:
    driver: bridge
```

#### Step 3: Deploy and Verify

```bash
# Restart n8n with new configuration
cd automation/n8n
docker-compose down
docker-compose up -d

# Verify HTTPS is working
curl -I https://n8n.menschlichkeit-oesterreich.at
# Should return 200 OK with SSL certificate info
```

#### Step 4: Update Webhook URLs

Update all webhook URLs in workflows to use HTTPS:
- Replace `http://` with `https://`
- Update GitHub webhook configurations
- Update external integrations

---

### 2. Implement PII Sanitization (CRITICAL - DSGVO)

**Timeline:** 72 hours  
**Priority:** CRITICAL  
**Legal Impact:** DSGVO Art. 32 compliance

#### Step 1: Install PII Sanitization Library

```bash
cd api.menschlichkeit-oesterreich.at
pip install pii-sanitizer
```

#### Step 2: Create Middleware

```python
# api.menschlichkeit-oesterreich.at/app/middleware/pii_sanitizer.py

import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class PIISanitizerMiddleware(BaseHTTPMiddleware):
    """Middleware to sanitize PII from logs and responses"""
    
    # Patterns to detect and sanitize
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    IBAN_PATTERN = re.compile(r'\b[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}\b')
    PHONE_PATTERN = re.compile(r'\b(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b')
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Mask email addresses: user@example.com -> u***@example.com"""
        parts = email.split('@')
        if len(parts) != 2:
            return email
        username = parts[0]
        masked_username = username[0] + '***' if len(username) > 0 else '***'
        return f"{masked_username}@{parts[1]}"
    
    @staticmethod
    def sanitize_iban(iban: str) -> str:
        """Mask IBAN: AT611904300234573201 -> AT61***"""
        return iban[:4] + '***' if len(iban) > 4 else '***'
    
    @staticmethod
    def sanitize_text(text: str) -> str:
        """Sanitize all PII from text"""
        # Sanitize emails
        text = PIISanitizerMiddleware.EMAIL_PATTERN.sub(
            lambda m: PIISanitizerMiddleware.sanitize_email(m.group(0)),
            text
        )
        
        # Sanitize IBANs
        text = PIISanitizerMiddleware.IBAN_PATTERN.sub(
            lambda m: PIISanitizerMiddleware.sanitize_iban(m.group(0)),
            text
        )
        
        # Sanitize phone numbers
        text = PIISanitizerMiddleware.PHONE_PATTERN.sub('***-***-***', text)
        
        return text
    
    async def dispatch(self, request: Request, call_next):
        # Process request
        response = await call_next(request)
        
        # Note: Sanitization should happen in logging configuration
        # This middleware just provides the sanitization methods
        return response
```

#### Step 3: Configure Logging with Sanitization

```python
# api.menschlichkeit-oesterreich.at/app/core/logging.py

import logging
from app.middleware.pii_sanitizer import PIISanitizerMiddleware

class PIISanitizingFormatter(logging.Formatter):
    """Custom formatter that sanitizes PII from log messages"""
    
    def format(self, record):
        # Sanitize the message
        if hasattr(record, 'msg'):
            record.msg = PIISanitizerMiddleware.sanitize_text(str(record.msg))
        
        # Sanitize args if present
        if hasattr(record, 'args') and record.args:
            record.args = tuple(
                PIISanitizerMiddleware.sanitize_text(str(arg))
                for arg in record.args
            )
        
        return super().format(record)


# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/api.log')
    ]
)

# Replace formatter with sanitizing version
for handler in logging.root.handlers:
    handler.setFormatter(PIISanitizingFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
```

#### Step 4: Add to FastAPI Application

```python
# api.menschlichkeit-oesterreich.at/app/main.py

from fastapi import FastAPI
from app.middleware.pii_sanitizer import PIISanitizerMiddleware
from app.core.logging import *  # Configure logging

app = FastAPI()

# Add PII sanitizer middleware
app.add_middleware(PIISanitizerMiddleware)
```

#### Step 5: Test Sanitization

```python
# tests/test_pii_sanitizer.py

import pytest
from app.middleware.pii_sanitizer import PIISanitizerMiddleware

def test_email_sanitization():
    text = "Contact user@example.com for details"
    sanitized = PIISanitizerMiddleware.sanitize_text(text)
    assert "user@example.com" not in sanitized
    assert "u***@example.com" in sanitized

def test_iban_sanitization():
    text = "IBAN: AT611904300234573201"
    sanitized = PIISanitizerMiddleware.sanitize_text(text)
    assert "AT611904300234573201" not in sanitized
    assert "AT61***" in sanitized

def test_no_sanitization_needed():
    text = "No PII in this message"
    sanitized = PIISanitizerMiddleware.sanitize_text(text)
    assert text == sanitized
```

---

### 3. Implement Audit Logging (CRITICAL)

**Timeline:** 14 days  
**Priority:** CRITICAL  
**Compliance:** DSGVO Art. 30, NIS2

#### Step 1: Install OpenTelemetry

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi
```

#### Step 2: Configure Audit Logging

```python
# api.menschlichkeit-oesterreich.at/app/core/audit.py

from datetime import datetime
from typing import Optional, Dict, Any
import json
from pathlib import Path

class AuditLogger:
    """Centralized audit logging for security and compliance"""
    
    def __init__(self, log_file: Path = Path("logs/audit.jsonl")):
        self.log_file = log_file
        self.log_file.parent.mkdir(exist_ok=True)
    
    def log_event(
        self,
        event_type: str,
        user_id: Optional[str],
        action: str,
        resource: str,
        result: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log an audit event"""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "result": result,
            "metadata": metadata or {}
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(event) + '\n')
    
    def log_authentication(self, user_id: str, success: bool, ip_address: str):
        """Log authentication events"""
        self.log_event(
            event_type="authentication",
            user_id=user_id,
            action="login",
            resource="auth_system",
            result="success" if success else "failure",
            metadata={"ip_address": ip_address}
        )
    
    def log_data_access(self, user_id: str, resource_type: str, resource_id: str, action: str):
        """Log data access events (DSGVO requirement)"""
        self.log_event(
            event_type="data_access",
            user_id=user_id,
            action=action,
            resource=f"{resource_type}:{resource_id}",
            result="success",
            metadata={"resource_type": resource_type}
        )
    
    def log_security_event(self, event_type: str, severity: str, description: str):
        """Log security events"""
        self.log_event(
            event_type="security",
            user_id=None,
            action=event_type,
            resource="security_system",
            result=severity,
            metadata={"description": description}
        )


# Global audit logger
audit_logger = AuditLogger()
```

#### Step 3: Integrate with API Endpoints

```python
# Example: Audit donation access
from app.core.audit import audit_logger

@app.get("/api/donations/{donation_id}")
async def get_donation(donation_id: str, current_user: User = Depends(get_current_user)):
    # Log data access
    audit_logger.log_data_access(
        user_id=current_user.id,
        resource_type="donation",
        resource_id=donation_id,
        action="read"
    )
    
    # Fetch and return donation
    return donation
```

---

### 4. Configure MCP Server Sandboxing (CRITICAL)

**Timeline:** 7 days  
**Priority:** CRITICAL  
**Security:** Prevent privilege escalation

#### Step 1: Update Docker Configuration

```yaml
# mcp-servers/docker-compose.yml
version: '3.8'

services:
  mcp-server:
    image: mcp-server:latest
    container_name: mcp-server
    restart: unless-stopped
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    
    # Security options
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined  # Adjust based on needs
    
    # Read-only root filesystem
    read_only: true
    
    # Temporary directories for write operations
    tmpfs:
      - /tmp:size=100M,mode=1777
      - /var/tmp:size=50M,mode=1777
    
    # User namespace
    user: "1000:1000"
    
    # Capabilities (drop all, add only what's needed)
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    
    networks:
      - mcp_network

networks:
  mcp_network:
    driver: bridge
    internal: true  # Isolated network
```

---

### 5. Enable Git Commit Signing (CRITICAL)

**Timeline:** 14 days  
**Priority:** CRITICAL  
**Supply Chain:** Verify code authenticity

#### Step 1: Generate GPG Key (Per Developer)

```bash
# Generate GPG key
gpg --full-generate-key
# Select: (1) RSA and RSA
# Key size: 4096
# Valid for: 0 (does not expire) or 1y (1 year)
# Enter name and email

# List keys
gpg --list-secret-keys --keyid-format=long

# Export public key
gpg --armor --export <KEY_ID>
```

#### Step 2: Configure Git

```bash
# Configure Git to use GPG key
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true

# For Windows users with GPG4Win
git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
```

#### Step 3: Add GPG Key to GitHub

1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New GPG key"
3. Paste your public key
4. Click "Add GPG key"

#### Step 4: Enable Branch Protection

```yaml
# .github/workflows/enforce-signed-commits.yml
name: Verify Signed Commits

on:
  pull_request:
    branches: [main, develop]

jobs:
  verify-signatures:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Verify all commits are signed
        run: |
          # Get list of commits in PR
          COMMITS=$(git log --pretty=format:"%H" origin/${{ github.base_ref }}..HEAD)
          
          # Check each commit
          for commit in $COMMITS; do
            if ! git verify-commit $commit 2>/dev/null; then
              echo "❌ Commit $commit is not signed!"
              exit 1
            fi
          done
          
          echo "✅ All commits are properly signed"
```

---

## 🟠 High Priority Issues Implementation

### 6. Migrate JWT to RS256

**Timeline:** 30 days  
**Priority:** HIGH

```python
# Generate RSA keys
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# Generate private key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

# Save private key
with open("keys/jwt-private.pem", "wb") as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ))

# Save public key
with open("keys/jwt-public.pem", "wb") as f:
    f.write(private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ))

# Use in JWT
from jose import jwt

token = jwt.encode(
    claims,
    private_key_pem,
    algorithm="RS256"
)
```

### 7. Implement Rate Limiting

**Timeline:** 30 days  
**Priority:** HIGH

```python
# Install slowapi
pip install slowapi

# Configure in FastAPI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/donations")
@limiter.limit("10/minute")
async def get_donations():
    return donations
```

---

## ✅ Verification Checklist

After implementing each fix:

- [ ] Code changes committed and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security scan passed (CodeQL, Semgrep)
- [ ] DSGVO compliance verified
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

## 📞 Support & Questions

- **Security Team:** security@menschlichkeit-oesterreich.at
- **Documentation:** See `docs/security/`
- **Issues:** Create GitHub issue with `security` label

---

**Last Updated:** 2025-10-13  
**Review Frequency:** After each implementation  
**Owner:** Security Team + DevOps

# Security Quick Reference Card

## 🚨 Emergency Response

### If Rate Limiting Triggers
```bash
# Check rate limit metrics
grep "Rate limit exceeded" /var/log/api/*.log | wc -l

# Identify attacking IPs
grep "Rate limit exceeded" /var/log/api/*.log | awk '{print $NF}' | sort | uniq -c | sort -rn

# Temporary IP block (if needed)
# Add to firewall/nginx config
```

### If CSP Violations Occur
```bash
# Check browser console for CSP violations
# Headers should show:
curl -I https://api.menschlichkeit-oesterreich.at/health | grep -i "content-security"

# Validate CSP
# Use: https://csp-evaluator.withgoogle.com/
```

## 📊 Monitoring Commands

### Check Vulnerability Status
```bash
# NPM audit
npm audit

# Expected: found 0 vulnerabilities
```

### Verify Security Headers
```bash
# Test all security headers
curl -sI https://api.menschlichkeit-oesterreich.at/health | grep -E "(Content-Security|Strict-Transport|X-Frame|X-Content|X-XSS|Referrer|Permissions)"

# Expected headers:
# - Content-Security-Policy
# - Strict-Transport-Security
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
# - Referrer-Policy
# - Permissions-Policy
```

### Test Rate Limiting
```bash
# Hammer endpoint (should get 429 after limit)
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://api.menschlichkeit-oesterreich.at/health
  sleep 0.1
done

# Expected: 10x 200, then 5x 429
```

## 🔧 Configuration

### Rate Limit Settings
**File:** `api.menschlichkeit-oesterreich.at/app/main.py`
```python
# Current settings:
app.add_middleware(
    RateLimitMiddleware, 
    requests_per_second=10,        # General endpoints
    auth_requests_per_minute=5     # Auth endpoints
)
```

**To adjust:**
1. Edit values above
2. Restart API service
3. Verify with test script

### CSP Policy
**File:** `api.menschlichkeit-oesterreich.at/app/middleware/security.py`
```python
# Current CSP directives:
csp_directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # ⚠️ Remove unsafe-* for prod
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://crm.menschlichkeit-oesterreich.at",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
]
```

**Production hardening:**
- Remove `'unsafe-inline'` from script-src
- Remove `'unsafe-eval'` from script-src
- Use nonces for inline scripts/styles

## 🎯 Quick Fixes

### Problem: Rate limit too strict
**Symptom:** Legitimate users getting 429 errors

**Fix:**
1. Increase limits in `app/main.py`:
   ```python
   requests_per_second=20,  # Was: 10
   auth_requests_per_minute=10  # Was: 5
   ```
2. Restart API: `systemctl restart api-service`

### Problem: CSP blocking resources
**Symptom:** Browser console shows CSP violations

**Fix:**
1. Identify blocked resource from browser console
2. Add to appropriate CSP directive in `app/middleware/security.py`
3. Example: Allow CDN
   ```python
   "script-src 'self' https://cdn.example.com",
   ```
4. Restart API

### Problem: npm audit shows vulnerabilities
**Symptom:** `npm audit` shows critical vulnerabilities

**Fix:**
1. Check if override exists in `package.json`:
   ```json
   "overrides": {
     "form-data": ">=4.0.4"
   }
   ```
2. If missing, add it
3. Delete `node_modules` and `package-lock.json`
4. Run `npm install`
5. Verify: `npm audit` should show 0

## 📈 Metrics to Monitor

### Daily Checks
- [ ] `npm audit` results: 0 vulnerabilities
- [ ] Rate limit violations: < 10 per hour
- [ ] Failed auth attempts: < 20 per hour
- [ ] CSP violations: 0

### Weekly Checks
- [ ] Security headers test with securityheaders.com
- [ ] Rate limit effectiveness (should block attacks)
- [ ] Review rate-limited IPs (any patterns?)
- [ ] Update dependencies: `npm outdated`

### Monthly Checks
- [ ] Full security audit
- [ ] Review and update CSP
- [ ] Review and update rate limits
- [ ] Penetration testing
- [ ] DSGVO compliance review

## 🔗 Important Links

- **Vulnerability Report:** `/docs/security/VULNERABILITY-FIXES-REPORT.md`
- **Visual Summary:** `/docs/security/SECURITY-FIXES-VISUAL-SUMMARY.md`
- **Threat Model:** `/docs/security/STRIDE-LINDDUN-ANALYSIS.md`
- **Test Suite:** `/tests/test_security_middleware.py`
- **Middleware Code:** `/api.menschlichkeit-oesterreich.at/app/middleware/security.py`

## 📞 Contacts

- **Security Issues:** security@menschlichkeit-oesterreich.at
- **On-Call:** [Phone number]
- **Escalation:** [Team lead contact]

## 🆘 Incident Response

### If Security Breach Detected
1. **Isolate:** Stop affected services
2. **Assess:** Determine scope of breach
3. **Contain:** Block attacking IPs, revoke compromised tokens
4. **Notify:** Security team + DSGVO officer (if PII affected)
5. **Document:** All actions taken
6. **Review:** Post-incident analysis

### DSGVO Breach (PII Exposed)
1. **72-hour window** to notify Austrian Data Protection Authority
2. Contact: dsb@dsb.gv.at
3. Document:
   - Nature of breach
   - Data categories affected
   - Number of individuals
   - Likely consequences
   - Measures taken

---

**Version:** 1.0  
**Last Updated:** 2025-10-12  
**Owner:** Security Team

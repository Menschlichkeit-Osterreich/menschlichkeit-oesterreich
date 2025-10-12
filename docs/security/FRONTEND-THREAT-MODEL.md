# Frontend Threat Model – React/TypeScript (Stand: 04.10.2025)

**Scope:** `frontend/` workspace + public website surface consuming API & CRM data.

**Methodology:** STRIDE + OWASP Top 10 (2021) alignment, fed by findings from `security/PHASE-0-DEEP-ANALYSIS.md` and Playwright smoke runs.

---

## 1. Architecture Snapshot

- React 18 + Vite build (SSR disabled, static hosting behind Plesk)
- State managed via React Query + Context (JWT stored in `localStorage`)
- API communication over HTTPS (`VITE_API_BASE_URL`)
- Drupal-rendered HTML fragments embedded (membership forms, donation widgets)
- Figma-derived design tokens injected at build time

---

## 2. STRIDE Summary

| Threat Category            | Scenario                                   | Impact | Likelihood | Existing Controls                     | Gap / Action                                      |
| -------------------------- | ------------------------------------------ | ------ | ---------- | ------------------------------------- | ------------------------------------------------- |
| **Spoofing**               | Session hijack via stolen JWT              | Hoch   | Mittel     | TLS 1.3 enforced                      | Move tokens to httpOnly cookies + SameSite=strict |
| **Tampering**              | Embedded Drupal form injects script        | Hoch   | Hoch       | Content-Security-Policy (CSP) missing | Define CSP (default-src 'self'; frame-src CRM)    |
| **Repudiation**            | No audit of client-side privileged actions | Mittel | Hoch       | API logging partially covers          | Add frontend telemetry → push to ELK              |
| **Information Disclosure** | React Query caches PII in memory           | Hoch   | Mittel     | No sensitive fields redacted          | Introduce cache eviction + obfuscation            |
| **Denial of Service**      | Unbounded API retries overwhelm backend    | Mittel | Mittel     | Retry logic default (3 attempts)      | Add circuit breaker + exponential backoff         |
| **Elevation of Privilege** | Feature flags toggled client-side          | Hoch   | Niedrig    | No runtime flags yet                  | Enforce server-side authorization                 |

---

## 3. OWASP Top 10 Mapping & Mitigations

1. **A01 – Broken Access Control**
   - Risk: Client trusts JWT role claims without revalidation.
   - Mitigation: Always fetch server-side capability matrix post-login.
2. **A03 – Injection**
   - Risk: Drupal-sourced HTML inserted via `dangerouslySetInnerHTML`.
   - Mitigation: Sanitize with DOMPurify + restrict allowed tags/attrs.
3. **A05 – Security Misconfiguration**
   - Risk: No CSP / SRI; build artifacts served without hash.
   - Mitigation: Add CSP headers via Plesk, generate Subresource Integrity hashes in CI.
4. **A07 – Identification & Authentication Failures**
   - Risk: JWT rotation missing, refresh tokens long-lived.
   - Mitigation: Implement refresh token rotation + inactivity timeout.
5. **A08 – Software and Data Integrity Failures**
   - Risk: npm supply-chain update drift; no Sigstore verification.
   - Mitigation: Lock `package-lock.json`, introduce `npm audit` gate + Sigstore bundle verification in Phase 3.
6. **A09 – Security Logging & Monitoring Failures**
   - Risk: No client telemetry for security events.
   - Mitigation: Emit logs for login, profile edits, consent changes via OpenTelemetry.

---

## 4. Attack Trees (Highlights)

### 4.1 Stored XSS via CRM Content

```
Goal: Execute arbitrary JS in donor browser
  ├─ Upload malicious HTML snippet via CRM CMS field
  │   ├─ (Precondition) Editor role compromised
  │   └─ (Mitigation) Enforce HTML filter + Purifier on CRM side
  └─ Embedded snippet renders in React view (donation page)
      ├─ (Mitigation) DOMPurify sanitize
      └─ (Mitigation) CSP script-src 'self'
```

### 4.2 Token Exfiltration

```
Goal: Steal JWT from localStorage
  ├─ Inject script (Stored/Reflected XSS)
  │   ├─ Danger: unsanitized query param -> `dangerouslySetInnerHTML`
  │   └─ Mitigation: encodeURIComponent + parameter validation
  └─ Use script to POST token to attacker endpoint
      ├─ Mitigation: Move token to httpOnly cookie
      └─ Add Content-Security-Policy connect-src whitelist
```

---

## 5. Recommendations & Next Steps

1. **Security Headers** (Phase 1)
   - Add CSP, X-Frame-Options, Strict-Transport-Security via Plesk config.
2. **Token Handling** (Phase 1)
   - Refactor auth module to store tokens in secure cookies; adopt Refresh Token rotation.
3. **Input Sanitization** (Phase 0 ✅)
   - Integrate DOMPurify for all HTML injection points; enforce sanitization tests (Jest snapshot with malicious payload).
4. **Telemetry & Monitoring** (Phase 2)
   - Implement OpenTelemetry instrumentation for auth events and error boundaries.
5. **Dependency Integrity** (Phase 3)
   - Add `npm run verify-signature` using Sigstore; enforce `npm audit --production` in CI.

---

**Evidence Links:**

- `security/PHASE-0-DEEP-ANALYSIS.md` (Sections 2 & 3)
- Playwright baseline results (`playwright-results/2025-10-03`) – no XSS regression detected
- `docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md` – supply-chain mitigations

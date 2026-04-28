# Security Documentation

This directory contains security-related documentation for the Menschlichkeit Österreich platform.

## Documents

### [secrets-catalog.md](./secrets-catalog.md)

Operatives Token-Inventar mit Primaerablage, Injektionspfaden, Ownern,
Minimalrechten und Rotationsregeln.

### [GH-TOKEN-USAGE.md](./GH-TOKEN-USAGE.md)

Quick-Start fuer persoenliche GitHub-PAT-Nutzung mit klarer Abgrenzung gegen
produktive Workflow- und Deploy-Pfade.

### [../../runbooks/token-uebergabe-template.md](../../runbooks/token-uebergabe-template.md)

Ausfuellbares Standardblatt fuer Token-Uebergabe, Rotation und Incident-
Nachweis ohne Secret-Werte im Dokument.

### [missing-secrets-template.md](./missing-secrets-template.md)

Ausfuellbare Review-Vorlage fuer fehlende oder deprecated Secrets auf Basis von
`secrets.manifest.json`, inklusive Owner-, Ablage- und Injektionspfad.

### [2026-03-env-cleanup-rotation-log.md](./2026-03-env-cleanup-rotation-log.md)

Technical mirror of the external ops/security task for post-cleanup credential
rotation, including ownership, evidence, and revocation tracking.

### [SEMGREP-FINDINGS.md](./SEMGREP-FINDINGS.md)

Comprehensive documentation of Semgrep security scan findings, including:

- Identified XSS vulnerabilities
- Remediation plan with priorities
- Testing guidelines
- Action items and timeline

## Security Scanning Tools

The project uses multiple security scanning tools in CI/CD:

1. **Semgrep** - SAST (Static Application Security Testing)
   - Workflow: `.github/workflows/semgrep.yml`
   - Config: `.semgrep.yml`, `.semgrepignore`
   - Rules: OWASP Top 10, CWE Top 25, security-audit

2. **CodeQL** - Semantic code analysis
   - Workflow: `.github/workflows/codeql.yml`
   - Languages: JavaScript, Python

3. **Trivy** - Container and dependency scanning
   - Workflow: `.github/workflows/trivy.yml`

4. **Gitleaks** - Secret detection
   - Workflow: `.github/workflows/gitleaks.yml`

5. **OSV Scanner** - Open Source Vulnerability scanning
   - Workflow: `.github/workflows/osv-scanner.yml`

## Security Best Practices

### Code Security

- ✅ Never use `innerHTML` without sanitization - use `textContent` or DOMPurify
- ✅ Always validate and sanitize user input
- ✅ Use parameterized queries for database access
- ✅ Avoid `eval()`, `Function()` constructor, and `shell=True`
- ✅ Use Content Security Policy (CSP) headers

### Dependency Security

- ✅ Keep dependencies up to date
- ✅ Review Dependabot alerts regularly
- ✅ Use lock files (package-lock.json, composer.lock)
- ✅ Audit dependencies: `npm audit`, `pip-audit`

### Secret Management

- ✅ Never commit secrets to git
- ✅ Use environment variables or secret managers
- ✅ Rotate secrets regularly (90 days)
- ✅ Use `.gitignore` for sensitive files
- ✅ Track incident runbooks in `docs/security/incidents/`

### DSGVO/Privacy

- ✅ Encrypt PII (Personally Identifiable Information)
- ✅ Implement data retention policies
- ✅ Support data subject rights (access, deletion, portability)
- ✅ Document data processing activities

## Reporting Security Issues

If you discover a security vulnerability, please report it to:

**Email**: security@menschlichkeit-oesterreich.at (if configured)
**GitHub**: Use Security Advisories (private disclosure)

**Do NOT** create public issues for security vulnerabilities.

## Security Contacts

- Security Team: [To be configured]
- Data Protection Officer (DPO): [To be configured]
- DevOps Team: [To be configured]

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [DSGVO/GDPR Resources](https://gdpr.eu/)
- [Semgrep Rules](https://semgrep.dev/r)
- [GitHub Security](https://docs.github.com/en/code-security)
- [Secret Exposure Incident Runbook](./incidents/2026-03-secret-exposure-response.md)

---

**Last Updated**: 2024-10-12
**Maintained by**: DevOps & Security Team

# Security Quick Reference Guide

**Last Updated:** 2025-10-12  
**Purpose:** Schnellreferenz für Sicherheitsmaßnahmen und Best Practices

---

## 🔒 Sicherheitstools & Befehle

### Python Security Scanning
```bash
# Vollständiger Scan mit Bandit
python3 -m bandit -r scripts/ enterprise-upgrade/scripts/ -c .bandit

# Nur HIGH/CRITICAL Findings
python3 -m bandit -r scripts/ enterprise-upgrade/scripts/ -ll

# JSON Report für CI/CD
npm run security:bandit
```

### NPM Security Audit
```bash
# Standard Audit
npm audit

# Fix automatisch anwendbare Patches
npm audit fix

# JSON Report
npm audit --json > quality-reports/npm-audit.json
```

### Kompletter Security Scan
```bash
# Alle Security-Tools ausführen
npm run security:scan

# Quality Gates (inkl. Security)
npm run quality:gates
```

---

## 🛡️ Pre-Commit Hooks

### Installation
```bash
# Pre-commit installieren
pip install pre-commit

# Hooks aktivieren
pre-commit install

# Alle Dateien checken
pre-commit run --all-files
```

### Bei Commit-Fehler
```bash
# Hooks temporär überspringen (NICHT EMPFOHLEN)
git commit --no-verify -m "message"

# Besser: Fehler beheben
pre-commit run <hook-name> --files <file>
```

---

## 🚨 Häufige Sicherheitsprobleme & Lösungen

### 1. Command Injection (B602)

❌ **UNSICHER:**
```python
subprocess.run(cmd, shell=True)  # Ermöglicht Command Injection
```

✅ **SICHER:**
```python
subprocess.run([cmd, arg1, arg2], shell=False)  # Kein Shell-Zugriff
```

### 2. Bare Exception Handler (B110)

❌ **UNSICHER:**
```python
try:
    risky_operation()
except:  # Fängt ALLES, auch KeyboardInterrupt
    pass
```

✅ **SICHER:**
```python
try:
    risky_operation()
except (ValueError, KeyError) as e:
    logging.error(f"Expected error: {e}")
```

### 3. Hardcoded Secrets (B105, B106)

❌ **UNSICHER:**
```python
API_KEY = "EXAMPLE_API_KEY"  # Im Code gespeichert
```

✅ **SICHER:**
```python
import os
API_KEY = os.environ.get("API_KEY")  # Aus Environment
```

### 4. SQL Injection

❌ **UNSICHER:**
```python
query = f"SELECT * FROM users WHERE id = {user_id}"
```

✅ **SICHER:**
```python
# FastAPI/SQLAlchemy
query = select(User).where(User.id == user_id)

# Oder mit Parametern
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```

---

## 📋 Security Checklists

### Vor jedem Commit
- [ ] `pre-commit run --all-files` erfolgreich
- [ ] Keine neuen Secrets in Code
- [ ] Keine `shell=True` in subprocess
- [ ] Spezifische Exception-Handler
- [ ] PII-Daten sanitized

### Vor jedem PR
- [ ] `npm run security:scan` erfolgreich
- [ ] `npm audit` zeigt 0 Schwachstellen
- [ ] Alle Security-Findings dokumentiert
- [ ] Breaking Changes in CHANGELOG.md

### Vor jedem Deployment
- [ ] Alle Quality Gates grün
- [ ] Security-Scan in CI/CD bestanden
- [ ] Secrets-Rotation überprüft (90 Tage)
- [ ] DSGVO-Compliance validiert

---

## 🔐 Secrets Management

### Sichere Speicherung
```bash
# Secrets in .env (niemals committen!)
echo "API_KEY=xxx" >> .env

# In .gitignore eintragen
echo ".env" >> .gitignore

# Für Team: .env.example bereitstellen
cp .env .env.example
# Dann echte Werte durch Platzhalter ersetzen
```

### GitHub Secrets verwenden
```yaml
# In GitHub Actions
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### Lokale Entwicklung
```bash
# Secrets aus Vault/1Password laden
export API_KEY=$(op read "op://vault/api-key/password")
```

---

## 🚀 CI/CD Security Pipeline

### GitHub Actions Workflow
`.github/workflows/security-scan.yml` läuft bei:
- ✅ Jedem Push zu main/develop
- ✅ Jedem Pull Request
- ✅ Wöchentlich (Montag 3:00 UTC)
- ✅ Manuell (workflow_dispatch)

### Erfolgsmetriken
- **Bandit:** 0 HIGH/CRITICAL Findings
- **NPM Audit:** 0 Vulnerabilities
- **Gitleaks:** 0 Secrets exposed
- **Dependency Review:** 0 HIGH Vulnerabilities

---

## 📚 DSGVO-Relevante Security

### PII-Daten schützen
```python
# Logging ohne PII
from app.lib.pii_sanitizer import scrub

logger.info(f"User login: {scrub(email)}")
# Output: "User login: t***@example.com"
```

### Daten-Retention
```python
# Automatische Löschung nach Retention-Periode
if user.deleted_at and (datetime.now() - user.deleted_at).days > 90:
    anonymize_user(user)
```

### Consent-Management
```python
# Consent vor Datenverarbeitung prüfen
if not user.has_consent_for("marketing"):
    raise ConsentRequiredError()
```

---

## 🆘 Security Incident Response

### Bei verdächtigem Commit
```bash
# 1. Commit identifizieren
git log --all --oneline | grep "suspicious"

# 2. Secrets scannen
gitleaks detect --log-opts="<commit-sha>"

# 3. Bei Fund: Secret widerrufen
# 4. Force-Push mit bereinigter Historie (Vorsicht!)
```

### Bei Vulnerability-Alert
1. ✅ Schweregrad prüfen (CRITICAL/HIGH/MEDIUM)
2. ✅ Exploit verfügbar? (CVE-Datenbank)
3. ✅ Patch verfügbar? (npm audit fix / pip upgrade)
4. ✅ Keine Patch? Mitigation implementieren
5. ✅ CHANGELOG.md aktualisieren

### Bei Data Breach
1. 🔴 **SOFORT:** Incident-Team informieren
2. 🔴 Betroffene Systeme isolieren
3. 🔴 Logging aktivieren/verstärken
4. 🔴 DPO informieren (DSGVO 72h-Frist!)
5. 🔴 Forensische Analyse starten

---

## 📞 Kontakte & Eskalation

| Rolle | Verantwortlich | Kontakt | Eskalation |
|-------|----------------|---------|------------|
| Security Lead | DevOps Team | security@... | CRITICAL |
| DPO (Datenschutz) | Legal Team | dpo@... | DSGVO-Verstöße |
| Incident Response | On-Call Team | oncall@... | 24/7 |

---

## 📖 Weiterführende Ressourcen

### Interne Docs
- [SECURITY-VULNERABILITIES-REMEDIATION.md](./SECURITY-VULNERABILITIES-REMEDIATION.md)
- [PHASE-0-FINAL-REPORT.md](./docs/archive/bulk/PHASE-0-FINAL-REPORT.md)
- [.github/instructions/core/](../.github/instructions/core/)

### Externe Ressourcen
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Most Dangerous](https://cwe.mitre.org/top25/)
- [Bandit Docs](https://bandit.readthedocs.io/)
- [npm audit Docs](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [DSGVO Volltext](https://dsgvo-gesetz.de/)

---

**Dieses Dokument wird bei jedem Security-Audit aktualisiert.**  
**Nächste Review:** 2025-11-12

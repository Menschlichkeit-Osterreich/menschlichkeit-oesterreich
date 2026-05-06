# 🔍 Codespace Status Checker - Quick Reference

## Schnellstart

```bash
# Schnelle Status-Übersicht
npm run status:check

# Detaillierte Informationen
npm run status:verbose

# Export als JSON
npm run status:json
```

## Was wird geprüft?

### ✅ Codespace Umgebung
- Ist es ein GitHub Codespace?
- Codespace Name
- GitHub Token verfügbar?

### ✅ Development Services
- Frontend (Port 5173) - Vite
- API (Port 8001) - FastAPI
- CRM (Port 8000) - Drupal/PHP
- Games (Port 3000) - Static Server

### ✅ Pull Requests (mit GitHub Token)
- Alle offenen PRs
- Titel, Autor, Datum
- Direct GitHub Links

### ✅ Workflow Runs (mit GitHub Token)
- Letzte 10 GitHub Actions
- Status & Conclusion
- Direct Workflow Links

### ✅ System Resources (verbose)
- Disk Usage
- Memory Usage
- CPU Cores

## Häufige Probleme

### Problem: Services gestoppt
```bash
npm run dev:all
```

### Problem: GitHub Token fehlt
```bash
# In Codespace: Automatisch verfügbar
echo $GITHUB_TOKEN

# Lokal: Personal Access Token
export GITHUB_TOKEN="ghp_..."
```

## Output Beispiel

```
📊 CODESPACE & PULL REQUEST STATUS REPORT
================================================================================
⏰ Zeit: 2025-10-11T14:00:47

📦 CODESPACE STATUS:
   ✅ In Codespace: True
   📝 Name: special-space-enigma-4vxg9r7vq9cp6g5
   🔑 GitHub Token: ✅ Verfügbar

🚀 DEVELOPMENT SERVICES:
   ✅ Frontend (Vite)      Port  5173 - RUNNING
   ✅ API (FastAPI)        Port  8001 - RUNNING
   ✅ CRM (PHP)            Port  8000 - RUNNING
   ✅ Games                Port  3000 - RUNNING

📋 OFFENE PULL REQUESTS:
   #123 feat: Add new feature    by user123
   #124 fix: API endpoint bug    by user456

⚙️  LETZTE WORKFLOW RUNS:
   ✅ CI Pipeline        completed  success
   ✅ Quality Gates      completed  success
   ❌ Deploy Staging     completed  failure

💡 EMPFEHLUNGEN:
   ✅ Alle Services laufen erfolgreich
   ⚠️  Review PR #123 - bereit zum Merge
```

## Automation

### Exit Codes
- `0` = Alle Services laufen
- `1` = Mindestens ein Service gestoppt

### Pre-Commit Hook
```bash
#!/bin/bash
npm run status:check || echo "⚠️ Services nicht aktiv"
```

### CI/CD Integration
```yaml
- run: npm run status:json
- uses: actions/upload-artifact@v4
  with:
    name: status
    path: quality-reports/codespace-status.json
```

## Dokumentation

- [Vollständige Anleitung](./CODESPACE-STATUS-CHECKER.md)
- [Implementation Details](./CODESPACE-STATUS-CHECK-IMPLEMENTATION.md)
- [Troubleshooting](./CODESPACE-TROUBLESHOOTING.md)

## Script Optionen

```bash
python3 scripts/codespace-status-check.py --help

Options:
  -h, --help            Zeige diese Hilfe
  -v, --verbose         Detaillierte Informationen
  -j FILE, --json FILE  Speichere als JSON
```

---

**Version:** 1.0.0  
**Maintainer:** DevOps Team

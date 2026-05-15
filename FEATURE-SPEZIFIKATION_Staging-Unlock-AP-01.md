# Feature-Spezifikation: Staging-Unlock / AP-01 – n8n Staging Routing Fix

## Kontext & Zielsetzung

**Ziel:** Die Staging-Umgebung (https://n8n.menschlichkeit-oesterreich.at) muss zuverlässig auf die n8n UI/API routen. Aktuell wird die Plesk-Defaultseite angezeigt – Ursache: Reverse-Proxy-/Routing-Fehler. Erst nach erfolgreicher Routing-Fixierung und bestandener Smoke-Test-Prüfung dürfen weitere Feature- oder Refactor-Arbeiten erfolgen.

**Scope:**
- Keine Feature- oder Refactor-Entwicklung, keine Workflow-Änderungen, keine neuen Secretsysteme, keine lokalen Bypasses, solange der autoritative Staging-Smoke-Test nicht erfolgreich ist (Exit-Code 0, beide Receipt-Fälle dokumentiert).
- Fokus: Infrastruktur- und Routing-Fix, dann Verifikation, dann Secret-Mapping, dann Smoke-Test.

## Schrittfolge (verbindlich)

1. **Reverse-Proxy-/Routing-Fix**
   - Ziel: https://n8n.menschlichkeit-oesterreich.at zeigt n8n UI (oder 401/403, aber keine Plesk-Defaultseite).
   - Technologien: Plesk, nginx oder Caddy (Reverse Proxy), HTTPS, ggf. Plesk-Panel-Konfiguration.
   - Keine Änderung an n8n-Workflows oder -Code.

2. **Routing-Verifikation**
   - Sichtprüfung: n8n UI erreichbar ODER API-typische Fehlermeldung (401/403) sichtbar.
   - Healthcheck: /healthz oder /api/v1/workflow (sofern vorhanden) liefert plausiblen Status.

3. **Secret-Mapping & API-Umgebung**
   - Environment-Variablen (Required):
     - N8N_BASE_URL (z.B. https://n8n.menschlichkeit-oesterreich.at)
     - N8N_API_KEY
     - CIVICRM_STAGING_KEY
   - Optional: N8N_WEBHOOK_SECRET, API_INTERNAL_SECRET
   - Secrets müssen korrekt im Hosting/Panel gesetzt und dokumentiert werden.

4. **Autoritativer Smoke-Test**
   - Script: automation/n8n/smoke-test-donation.py
   - Testet: /webhook/finance-donation-received mit/ohne Receipt Eligibility
   - Erfolgskriterium: Exit-Code 0, beide Receipt-Fälle erfolgreich, Ergebnis dokumentiert

## Out-of-Scope
- Keine Änderungen an Spenden-Workflows, n8n-Flows, CiviCRM-Logik oder API-Refactorings
- Keine neuen Secretsysteme, keine lokalen Workarounds
- Kein Deployment von Feature-Branches, solange Routing/Smoke-Test nicht erfolgreich

## Akzeptanzkriterien
- [ ] https://n8n.menschlichkeit-oesterreich.at zeigt n8n UI oder API-typische Fehlermeldung (keine Plesk-Defaultseite)
- [ ] Healthcheck-Endpunkt erreichbar
- [ ] Alle erforderlichen Secrets korrekt gemappt
- [ ] Autoritativer Smoke-Test (automation/n8n/smoke-test-donation.py) läuft mit Exit-Code 0 und dokumentiert beide Receipt-Fälle
- [ ] Keine Feature-/Refactor-Arbeiten vor Abschluss aller obigen Punkte

## Implementation Status (2024-06-18)

### ✅ Step 1: Reverse-Proxy-Fix – IMPLEMENTED

**Created Artifacts:**
- `deployment-scripts/nginx/n8n.menschlichkeit-oesterreich.at.conf` – Nginx Reverse Proxy Configuration
  - WebSocket support for n8n Editor
  - Security headers (HSTS, CSP, XSS-Protection)
  - Webhook routing with extended timeouts (300s)
  - DSGVO-compliant logging (separate logs for webhooks)
  - Health check endpoint at `/healthz`

- `deployment-scripts/deploy-n8n-nginx.sh` – Automated Deployment Script
  - Validates nginx configuration
  - Creates automatic backups
  - Includes rollback capability
  - Tests connectivity after deployment
  - Suitable for admin execution on Plesk server

- `runbooks/n8n-staging-routing-implementation.md` – Implementation Guide for Admins
  - Step-by-step deployment instructions
  - Manual and automated options
  - Troubleshooting procedures
  - Container startup instructions
  - Validation checklist

- `DEPLOYMENT_CONFIG.md` – Updated Services Table
  - Added n8n entry (Docker + nginx)
  - Documented healthcheck URL

**Next Action:** Admin must run deployment script on Plesk server:
```bash
sudo bash deployment-scripts/deploy-n8n-nginx.sh
```

### ⏳ Step 2: Routing-Verification – AWAITING EXECUTION
- Requires: Admin access to Plesk server
- Validation: https://n8n.menschlichkeit-oesterreich.at returns n8n UI or API error (not Plesk default)
- Proof: Screenshot or curl output

### ⏳ Step 3: Secret-Mapping & API-Umgebung – PENDING
- Environment variables: N8N_BASE_URL, N8N_API_KEY, CIVICRM_STAGING_KEY
- Status: Not yet implemented (depends on Step 2)

### ⏳ Step 4: Autoritativer Smoke-Test – PENDING
- Script: `automation/n8n/smoke-test-donation.py`
- Requirement: Exit code 0, both receipt cases documented
- Status: Blocked by Step 2 completion

## Risiken & Hinweise
- Reverse-Proxy-Konfiguration kann je nach Hosting (Plesk/nginx/Caddy) variieren
- SSL/TLS-Zertifikate müssen korrekt eingebunden sein
- Fehlerhafte Secret-Mappings blockieren den Smoke-Test
- Strikte Reihenfolge: Kein Vorziehen von Feature- oder Refactor-Tasks

## Dokumentation & Nachweise
- Nach jedem Schritt: Status dokumentieren (z.B. Screenshot, Log, Healthcheck-Output)
- Nach Smoke-Test: Ergebnis und Exit-Code dokumentieren
- Änderungen an Routing/Proxy-Konfiguration versionieren oder dokumentieren (sofern möglich)

---

**Letzte Aktualisierung:** 2024-06-18
**Verantwortlich:** DevOps/Infra
**Status:** In Bearbeitung

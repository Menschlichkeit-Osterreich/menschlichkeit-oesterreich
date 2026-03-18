# Incident Response – Menschlichkeit Österreich

**Stand**: 2026-03-08

---

## Severity-Klassifikation

| Severity | Definition | Beispiele | Response |
|----------|-----------|---------|----------|
| **P0 – KRITISCH** | Plattform komplett down, Datenleck, DSGVO-Vorfall | DB nicht erreichbar, Secret leaked, PII-Exposure | Sofort, 24/7 |
| **P1 – HOCH** | Wesentliche Funktion ausgefallen, Security-Issue | API down, Auth broken, CRM nicht erreichbar | < 2 Stunden |
| **P2 – MITTEL** | Teilfunktion beeinträchtigt | Games offline, n8n-Workflow fehlerhaft | < 8 Stunden |
| **P3 – NIEDRIG** | Kosmetisch, Minor | 404-Seite, Lighthouse-Score-Drop | Nächster Sprint |

---

## P0/P1 Sofortmaßnahmen

### Schritt 1: Diagnostik (< 5 min)

```bash
npm run status:check       # Services-Überblick
npm run status:verbose     # Details
docker-compose ps          # Docker-Container-Status
npm run docker:logs        # Container-Logs
```

### Schritt 2: Eskalation

```
P0: security@menschlichkeit-oesterreich.at + On-Call (sofort)
P1: security@menschlichkeit-oesterreich.at (innerhalb 30 min)
DSGVO-Vorfall: datenschutz@menschlichkeit-oesterreich.at (sofort, Art. 33 72h-Frist)
```

### Schritt 3: Eindämmung (Containment)

**Service offline:** → [Runbook Service-Neustart](../../runbooks/service-restart.md)

**Secret geleaked:**
```bash
# 1. Secret SOFORT rotieren (beim Anbieter)
# 2. Gitleaks-Report prüfen:
npm run security:gitleaks
# 3. Reproduzierbares Audit-Artefakt erzeugen:
npm run security:incident:audit
# 3. Git-History bereinigen:
npm run security:rewrite-public-secrets -- -ReplaceText ../replace-text.txt -MirrorDir ../repo-ir-clean.git
# 4. Checkliste: docs/security/secrets-policy.md → Leak Response
# 5. Runbook: docs/security/incidents/2026-03-secret-exposure-response.md
```

**Datenleck / PII-Exposure:**
```
1. Betroffene Daten identifizieren und isolieren
2. Datenschutzbeauftragte:r informieren: datenschutz@menschlichkeit-oesterreich.at
3. 72h-Frist für DSB-Meldung (Art. 33 DSGVO) startet SOFORT
4. Playbook: docs/privacy/art-33-34-incident-playbook.md
```

**API komplett down:**
```bash
# Logs prüfen:
cd api.menschlichkeit-oesterreich.at
# Container-Neustart:
docker-compose restart api
# Oder: manueller Neustart via Plesk
```

---

## Incident-Dokumentation (Pflicht für P0/P1)

Für jeden P0/P1-Vorfall eine Datei anlegen:

```
docs/security/incidents/YYYY-MM-DD-kurzbeschreibung.md
```

Template:
```markdown
# Incident: [Kurzbeschreibung]

**Datum**: YYYY-MM-DD HH:MM
**Severity**: P0/P1/P2
**Status**: Investigating / Resolved
**Timeline**:
- HH:MM – Vorfall erkannt
- HH:MM – Erstmaßnahmen
- HH:MM – Ursache identifiziert
- HH:MM – Behoben

**Root Cause**: [Ursache]
**Impact**: [Betroffene Systeme/Nutzer]
**Resolution**: [Was wurde getan]
**Prevention**: [Wie verhindern wir das künftig]
**DSGVO relevant**: Ja/Nein – [wenn ja: Meldung erfolgt am ...]
```

---

## Kommunikation

**Intern (P0/P1):**
- Maintainer sofort informieren
- Keine öffentlichen Aussagen vor Klärung

**Extern (bei Nutzer-Impact):**
- Status-Update auf Website (Hinweis-Banner) bei > 30 min Downtime
- Bei DSGVO-Vorfall: Betroffene gemäß Art. 34 DSGVO informieren

---

## Post-Incident-Review (PIR)

Nach jedem P0/P1-Vorfall innerhalb von 5 Werktagen:

```
[ ] Root Cause Analysis abgeschlossen
[ ] Incident-Dokument vervollständigt
[ ] Präventionsmaßnahmen beschlossen und als Issues angelegt
[ ] DSGVO-Meldung abgeschlossen (falls relevant)
[ ] Monitoring-Alert ergänzt (damit nächstes Mal früher erkannt wird)
```

---

*Verwandt: [Runbooks](../../runbooks/) | [Secrets Policy](../security/secrets-policy.md) | [DSGVO-Betrieb](../compliance/gdpr-operations.md) | [Secret-Exposure Runbook](../security/incidents/2026-03-secret-exposure-response.md)*

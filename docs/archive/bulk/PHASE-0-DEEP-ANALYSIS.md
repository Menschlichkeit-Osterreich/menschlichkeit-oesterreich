# Phase 0: Tiefgründige Repository-Analyse

**Datum:** 2025-10-03  
**Analysetyp:** Enterprise Security & Governance Assessment  
**Framework:** STRIDE/LINDDUN + DSGVO + Supply Chain Security

---

## 1. Inventory mit Provenance

### 1.1 Subsystem-Klassifizierung

| Subsystem                                              | Typ              | Herkunft                                   | Autorenschaft | Kritikalität |
| ------------------------------------------------------ | ---------------- | ------------------------------------------ | ------------- | ------------ |
| **Website** (`website/`)                               | Eigenentwicklung | Intern                                     | peschull      | 🔴 HOCH      |
| **API Service** (`api.menschlichkeit-oesterreich.at/`) | Eigenentwicklung | Intern                                     | peschull      | 🔴 HOCH      |
| **CRM System** (`crm.menschlichkeit-oesterreich.at/`)  | Hybrid           | Drupal 10 + CiviCRM (Open Source) + Custom | 🔴 KRITISCH   |
| **Gaming Platform** (`web/`)                           | Eigenentwicklung | Intern                                     | peschull      | 🟡 MITTEL    |
| **Frontend** (`frontend/`)                             | Eigenentwicklung | React/TypeScript                           | peschull      | 🔴 HOCH      |
| **Automation** (`automation/n8n/`)                     | Drittanbieter    | n8n.io (Open Source)                       | n8n Team      | 🟡 MITTEL    |
| **MCP Servers** (`mcp-servers/`)                       | Eigenentwicklung | Intern                                     | peschull      | 🔴 HOCH      |
| **Figma Design System** (`figma-design-system/`)       | Eigenentwicklung | Intern                                     | peschull      | 🟢 NIEDRIG   |

### 1.2 Externe Dependencies (Top-Level)

**Node.js Ecosystem:**

- Hauptprojekt: 45+ npm packages
- MCP Servers: 60+ npm packages (essential-stack, web-stack)
- Kritische Dependencies: `@modelcontextprotocol/sdk`, `zod`, `dotenv`

**PHP Ecosystem:**

- Drupal 10 Core + 200+ Contrib Modules
- CiviCRM + Extensions
- Composer Dependencies: ~150 packages

**Python Ecosystem:**

- FastAPI + Uvicorn
- Prisma Client Python
- Requirements: ~20 packages

### 1.3 Provenance-Tracking

**Git-Analyse:**

- Primärer Autor: `peschull <schuller_peter@icloud.com>`
- Commits: 100+ (seit 2025-09-22)
- Externe Code: Drupal/CiviCRM vendor directories
- Keine verdächtigen Commits identifiziert

**Risiken:**

- ⚠️ Vendor-Code nicht signiert
- ⚠️ Keine Commit-Signierung aktiv
- ⚠️ Keine SBOM-Dateien vorhanden

---

## 2. Security Threat Modeling (STRIDE/LINDDUN)

### 2.1 STRIDE-Analyse pro Komponente

#### **API Service** (`api.menschlichkeit-oesterreich.at/`)

| Threat Type                | Risiko    | Szenario                                         | Mitigation                               |
| -------------------------- | --------- | ------------------------------------------------ | ---------------------------------------- |
| **S**poofing               | 🔴 HOCH   | Ungesicherte JWT-Tokens könnten gefälscht werden | ✅ Implementiere HS256/RS256 Signierung  |
| **T**ampering              | 🟡 MITTEL | Request-Manipulation bei API-Endpoints           | ⚠️ Input-Validation mit Pydantic/FastAPI |
| **R**epudiation            | 🟡 MITTEL | Keine Audit-Logs für kritische Operationen       | ❌ Fehlt: Structured Logging + SIEM      |
| **I**nformation Disclosure | 🔴 HOCH   | PII in Logs, Fehlerresponses zu detailliert      | ⚠️ Teilweise: Error-Handler vorhanden    |
| **D**enial of Service      | 🟡 MITTEL | Keine Rate-Limiting erkennbar                    | ❌ Fehlt: Rate-Limiter (FastAPI-Limiter) |
| **E**levation of Privilege | 🟡 MITTEL | RBAC-Implementierung unklar                      | ⚠️ Zu prüfen: Authorization-Layer        |

#### **CRM System** (Drupal + CiviCRM)

| Threat Type                | Risiko     | Szenario                                         | Mitigation                    |
| -------------------------- | ---------- | ------------------------------------------------ | ----------------------------- |
| **S**poofing               | 🟢 NIEDRIG | Drupal Session-Management robust                 | ✅ Core-Feature               |
| **T**ampering              | 🟡 MITTEL  | SQL-Injection bei Custom-Modulen                 | ⚠️ Prepared Statements prüfen |
| **R**epudiation            | 🟡 MITTEL  | CiviCRM Audit-Trail aktiviert?                   | ⚠️ Zu prüfen                  |
| **I**nformation Disclosure | 🔴 HOCH    | CiviCRM enthält sensible PII (Kontakte, Spenden) | ⚠️ Encryption-at-Rest fehlt?  |
| **D**enial of Service      | 🟡 MITTEL  | Keine CDN/Caching-Layer erkennbar                | ❌ Fehlt: Varnish/Redis       |
| **E**levation of Privilege | 🟡 MITTEL  | Drupal-Permissions korrekt konfiguriert?         | ⚠️ Zu prüfen                  |

#### **MCP Servers**

| Threat Type                | Risiko    | Szenario                                | Mitigation                           |
| -------------------------- | --------- | --------------------------------------- | ------------------------------------ |
| **S**poofing               | 🟡 MITTEL | Keine mTLS zwischen MCP-Client & Server | ❌ Fehlt: Mutual TLS                 |
| **T**ampering              | 🔴 HOCH   | Tool-Injections bei Command-Execution   | ⚠️ Input-Sanitization prüfen         |
| **R**epudiation            | 🔴 HOCH   | Keine strukturierten Audit-Logs         | ❌ Fehlt: OpenTelemetry/Logs         |
| **I**nformation Disclosure | 🔴 HOCH   | Secrets in Environment-Variables        | ⚠️ Teilweise: `.env` nicht committed |
| **D**enial of Service      | 🟡 MITTEL | Keine Resource-Limits (CPU/Memory)      | ❌ Fehlt: Container-Limits           |
| **E**levation of Privilege | 🔴 HOCH   | MCP-Tools laufen mit User-Permissions   | ❌ Fehlt: Sandboxing (seccomp)       |

### 2.2 LINDDUN-Analyse (Privacy)

#### **Datenkategorien (DSGVO Art. 4)**

| Kategorie                         | Speicherort           | Schutzziel                  | Status |
| --------------------------------- | --------------------- | --------------------------- | ------ |
| **Personenbezogene Daten**        | CRM-Datenbank         | Vertraulichkeit, Integrität | ⚠️     |
| **Besondere Kategorien** (Art. 9) | Nicht erkennbar       | N/A                         | ✅     |
| **Kontaktdaten**                  | CiviCRM Contacts      | Vertraulichkeit             | ⚠️     |
| **Spendendaten**                  | CiviCRM Contributions | Vertraulichkeit, Integrität | ⚠️     |
| **Newsletter-Consent**            | CiviCRM Mailings      | Nachweisbarkeit             | ⚠️     |

#### **LINDDUN-Threats**

| Threat                        | Beschreibung                              | Risiko     | Mitigation                     |
| ----------------------------- | ----------------------------------------- | ---------- | ------------------------------ |
| **L**inkability               | Profile über Services hinweg verknüpfbar? | 🟢 NIEDRIG | Services isoliert              |
| **I**dentifiability           | User-Tracking in Frontend/API             | 🟡 MITTEL  | ❌ Keine Anonymisierung        |
| **N**on-repudiation           | Consent-Nachweise speicherbar             | 🟡 MITTEL  | ⚠️ CiviCRM-Feature prüfen      |
| **D**etectability             | Nutzer-Aktivität analysierbar (Logs)      | 🟡 MITTEL  | ⚠️ Log-Retention ungeklärt     |
| **D**isclosure of Information | PII-Leaks via Logs/Errors                 | 🔴 HOCH    | ❌ Keine Log-Sanitization      |
| **U**nawareness               | User über Datenverarbeitung informiert?   | 🟡 MITTEL  | ⚠️ Datenschutzerklärung prüfen |
| **N**on-compliance            | DSGVO-Anforderungen nicht erfüllt         | 🔴 HOCH    | ❌ Kein DPIA, kein VVT         |

---

## 3. Data Flow Mapping (DSGVO)

### 3.1 Datenfluss-Diagramm

```
┌─────────────┐
│   Website   │
│  (Frontend) │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐      ┌──────────────┐
│  API Service│◄────►│ CRM (CiviCRM)│
│  (FastAPI)  │      │  (Drupal 10) │
└──────┬──────┘      └──────┬───────┘
       │                     │
       │                     │ MySQL
       ↓                     ↓
┌─────────────┐      ┌──────────────┐
│ PostgreSQL  │      │  MariaDB     │
│ (Gaming DB) │      │ (CRM-Daten)  │
└─────────────┘      └──────────────┘
```

### 3.2 DSGVO-Relevante Datenverarbeitung

| Verarbeitungsaktivität   | Rechtsgrundlage                               | Zweck               | Speicherdauer          | Status                        |
| ------------------------ | --------------------------------------------- | ------------------- | ---------------------- | ----------------------------- |
| **Newsletter-Anmeldung** | Art. 6 Abs. 1 lit. a (Einwilligung)           | Marketing           | Bis Widerruf           | ⚠️ Consent-Mechanismus prüfen |
| **Spendendaten**         | Art. 6 Abs. 1 lit. b (Vertrag)                | Spendenabwicklung   | 10 Jahre (Steuerrecht) | ✅ Legitim                    |
| **Kontaktformular**      | Art. 6 Abs. 1 lit. f (berechtigtes Interesse) | Anfragenbearbeitung | 6 Monate               | ⚠️ Löschfristen unklar        |
| **Webanalytics**         | ❌ UNKLAR                                     | Statistik           | ❌ UNKLAR              | 🔴 Prüfen (Cookie-Consent?)   |

### 3.3 Betroffenenrechte-Implementierung

| Recht (DSGVO)                   | Implementiert? | Umsetzung               |
| ------------------------------- | -------------- | ----------------------- |
| **Auskunft** (Art. 15)          | ⚠️ TEILWEISE   | CiviCRM-Export möglich? |
| **Berichtigung** (Art. 16)      | ✅ JA          | CRM-UI                  |
| **Löschung** (Art. 17)          | ❌ NEIN        | Keine Lösch-Workflows   |
| **Einschränkung** (Art. 18)     | ❌ NEIN        | Keine Sperr-Funktion    |
| **Datenportabilität** (Art. 20) | ⚠️ TEILWEISE   | CSV-Export vorhanden?   |
| **Widerspruch** (Art. 21)       | ❌ NEIN        | Kein Opt-Out-Prozess    |

---

## 4. Attack Surface Review

### 4.1 Exponierte Services

| Service        | Port/Protocol | Authentifizierung | Verschlüsselung         | Risiko      |
| -------------- | ------------- | ----------------- | ----------------------- | ----------- |
| **Website**    | :443 (HTTPS)  | Öffentlich        | ✅ TLS 1.3              | 🟢 NIEDRIG  |
| **API**        | :8001 (HTTP?) | JWT?              | ⚠️ TLS nicht erzwungen? | 🔴 HOCH     |
| **CRM**        | :8000 (HTTP?) | Drupal Session    | ⚠️ TLS nicht erzwungen? | 🔴 HOCH     |
| **n8n**        | :5678 (HTTP)  | Basic Auth        | ❌ HTTP only            | 🔴 KRITISCH |
| **PostgreSQL** | :5432         | Passwort          | ❌ Kein TLS             | 🟡 MITTEL   |
| **MariaDB**    | :3306         | Passwort          | ❌ Kein TLS             | 🟡 MITTEL   |

### 4.2 Auth-Flow Analyse

**Website → API:**

```
1. User login (credentials)
2. API → JWT Token generiert
3. Frontend speichert Token (localStorage?)
   ⚠️ XSS-Risiko bei localStorage!
4. API-Requests mit Bearer-Token
5. Token-Validierung (Algorithmus?)
```

**Schwachstellen:**

- ❌ Kein Token-Refresh-Mechanismus erkennbar
- ❌ Keine Token-Revocation
- ⚠️ JWT-Secret-Handling unklar
- ❌ Kein CSRF-Schutz dokumentiert

### 4.3 Secrets-Handling

**Gefundene Secret-Typen:**

- GitHub Personal Access Token (in `.env`, `.git-credentials`, `~/.bashrc`)
- Datenbank-Passwörter (in `.env.example` als Platzhalter)
- SSH-Keys (referenziert in Configs)
- API-Keys (n8n, Figma?)

**Risiken:**

- 🔴 `.env` könnte versehentlich committed werden
- ⚠️ Secrets in Environment-Variables (nicht rotierbar)
- ❌ Keine Secret-Rotation-Policy
- ❌ Kein zentrales Secret-Management (z.B. Vault)

### 4.4 Externe Integrationen

| Integration       | Protokoll  | Authentifizierung | Datenfluss             | Risiko     |
| ----------------- | ---------- | ----------------- | ---------------------- | ---------- |
| **Figma API**     | HTTPS      | API-Token         | Design-Tokens (Lesend) | 🟢 NIEDRIG |
| **GitHub API**    | HTTPS      | PAT               | Repository-Management  | 🟡 MITTEL  |
| **n8n Workflows** | HTTP/HTTPS | Webhook-Secrets   | Automation-Daten       | 🔴 HOCH    |
| **Plesk API**     | HTTPS?     | SSH/API-Key       | Deployment             | 🟡 MITTEL  |

---

## 5. SBOM-Generierung (Vorbereitung)

### 5.1 Zu generierende SBOMs

| Subsystem        | Format         | Tool     | Status  |
| ---------------- | -------------- | -------- | ------- |
| **Root Package** | CycloneDX JSON | `cdxgen` | ⏳ TODO |
| **API (Python)** | SPDX JSON      | `syft`   | ⏳ TODO |
| **CRM (PHP)**    | CycloneDX JSON | `cdxgen` | ⏳ TODO |
| **Frontend**     | CycloneDX JSON | `cdxgen` | ⏳ TODO |
| **MCP Servers**  | CycloneDX JSON | `cdxgen` | ⏳ TODO |

### 5.2 SBOM-Requirements

✅ **Erforderliche Felder (gemäß NTIA Minimum Elements):**

- Supplier Name
- Component Name
- Version
- Unique Identifier (PURL)
- Dependency Relationships
- Author of SBOM
- Timestamp

---

## 6. Reproducible Build Check

### 6.1 Determinismus-Analyse

| Subsystem      | Lock-File           | Deterministisch? | Probleme                               |
| -------------- | ------------------- | ---------------- | -------------------------------------- |
| **npm (Root)** | `package-lock.json` | ✅ JA            | -                                      |
| **npm (MCP)**  | `package-lock.json` | ✅ JA            | -                                      |
| **Composer**   | `composer.lock`     | ✅ JA            | -                                      |
| **Python**     | ❌ NEIN             | 🔴 NEIN          | Kein `poetry.lock` oder `Pipfile.lock` |

### 6.2 Build-Reproduzierbarkeit

**Test-Szenario:**

```bash
# Clean build
rm -rf node_modules/ && npm ci
# Hash build output
find dist/ -type f -exec sha256sum {} \; > checksums-1.txt

# Rebuild
rm -rf node_modules/ && npm ci
find dist/ -type f -exec sha256sum {} \; > checksums-2.txt

# Compare
diff checksums-1.txt checksums-2.txt
```

**Status:** ⏳ Noch nicht getestet

---

## 7. Kritische Findings (Zusammenfassung)

### 🔴 KRITISCH (Sofort beheben)

1. **Keine Commit-Signierung** → Git-Historie nicht vertrauenswürdig
2. **n8n läuft über HTTP** → Credentials im Klartext übertragbar
3. **Keine Audit-Logs** → Keine Nachvollziehbarkeit kritischer Aktionen
4. **MCP-Server ohne Sandboxing** → Privilege-Escalation-Risiko
5. **PII in Logs** → DSGVO-Verstoß (Art. 5 Abs. 1 lit. f)
6. **Keine DPIA vorhanden** → DSGVO-Pflicht (Art. 35)

### 🟡 HOCH (Kurzfristig beheben)

7. **Python ohne Lock-File** → Builds nicht reproduzierbar
8. **Keine SBOM** → Supply-Chain-Risiken unbekannt
9. **JWT-Handling unklar** → Potenzielle Auth-Schwachstellen
10. **Keine Rate-Limiting** → DoS-Anfälligkeit

### 🟢 MITTEL (Mittelfristig)

11. Vendor-Code nicht verifiziert
12. Keine Encryption-at-Rest
13. Token-Rotation fehlt
14. Keine CDN/Caching-Layer

---

## Nächste Schritte

1. ✅ **Sofort:** SBOM mit `cdxgen` generieren
2. ✅ **Heute:** Git-Commit-Signierung aktivieren
3. ✅ **Diese Woche:** DPIA-Template erstellen
4. ✅ **Diese Woche:** Audit-Logging implementieren
5. ⏳ **Nächste Woche:** MCP-Sandboxing mit seccomp

---

**Analysestatus:** ✅ Phase 0 Abgeschlossen  
**Nächste Phase:** Phase 1 - Altlasten & Hygiene  
**Review-Datum:** 2025-10-10

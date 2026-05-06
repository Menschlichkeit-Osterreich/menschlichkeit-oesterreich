# ✅ n8n Workflow Import - Schritt-für-Schritt

## Status Check

✅ **n8n läuft:** `http://localhost:5678` (Browser geöffnet)  
✅ **Workflow-Dateien:**
  - Minimal: `/workspaces/menschlichkeit-oesterreich-development/automation/n8n/workflows/right-to-erasure-minimal.json`  
  - Fixed (HMAC): `/workspaces/menschlichkeit-oesterreich-development/automation/n8n/workflows/right-to-erasure.json`  
✅ **Health:** `{"status":"ok"}`

---

## 🚀 Import in 3 Minuten

### Methode 1: File Upload (EMPFOHLEN)

**Schritt 1:** Öffne n8n UI  
👉 **[http://localhost:5678](http://localhost:5678)** (sollte bereits offen sein)

**Schritt 2:** Neuer Workflow

1. Klicke auf **"+"** (oben links, "Add workflow")
2. Oder: **Workflows** → **"+ Create Workflow"**

**Schritt 3:** Import-Menü öffnen

1. Klicke auf **"⋮"** (Drei Punkte, oben rechts)
2. Wähle **"Import from File"**

**Schritt 4:** Datei auswählen

1. Für den schnellsten Start: wähle `right-to-erasure-minimal.json`
2. Für Produktion (HMAC): wähle `right-to-erasure.json`
3. Klicke **"Import"**

**Schritt 5:** Workflow speichern

1. **Name überprüfen:** "GDPR Right to Erasure Audit"
2. Klicke **"Save"** (Strg+S)

**Schritt 6:** Workflow aktivieren

1. Toggle **"Inactive"** → **"Active"** (oben rechts)
2. Bestätige mit **"Activate"**

✅ **FERTIG!** Der Workflow ist jetzt aktiv und bereit.

---

### Methode 2: Copy-Paste (Alternative)

**Schritt 1:** Workflow JSON kopieren

```bash
cat /workspaces/menschlichkeit-oesterreich-development/automation/n8n/workflows/right-to-erasure.json
```

**Schritt 2:** In n8n einfügen

1. Öffne **[http://localhost:5678](http://localhost:5678)**
2. Klicke **"⋮"** → **"Import from URL or JSON"**
3. Füge den **kompletten JSON** ein
4. Klicke **"Import"**

---

## 🧪 Test nach Import

### Test 1: Webhook-URL prüfen

Nach Import solltest du sehen:

**Node 1:** "Webhook - Erasure Intake"  
**URL:** `http://localhost:5678/webhook/right-to-erasure`

**Klicke auf den Node** → Siehst du die Webhook-URL?

---

### Test 2: Signature Validation prüfen

**Klicke auf Node 2:** "Validate Signature"

**Code sollte enthalten:**

```javascript
const secret = $env.N8N_WEBHOOK_SECRET || '';
```

Falls **leer:** Workflow akzeptiert ALLE Requests (OK für Development!)

---

### Test 3: Webhook testen

**Terminal-Befehl:**

```bash
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_001",
    "subjectEmail": "test@example.com",
    "mode": "external_orchestrated"
  }'
```

**Erwartete Antwort:**

```json
{
  "status": "accepted",
  "request_id": "test_001"
}
```

**In n8n UI:**

1. Klicke **"Executions"** (linke Sidebar)
2. Siehst du eine neue Execution mit `request_id: test_001`?

✅ **JA?** → Workflow funktioniert!  
❌ **NEIN?** → Siehe Troubleshooting unten

---

## 🔧 Troubleshooting

### Problem: "Webhook not found" (404)

**Ursachen:**

- Workflow nicht aktiviert (siehe Schritt 6)
- Falscher Webhook-Path

**Fix:**

1. Prüfe Workflow-Status: **"Active"** (grüner Toggle)?
2. Klicke auf "Webhook" Node → URL sollte sein: `/webhook/right-to-erasure`
3. Falls anders: Ändere **"Path"** Parameter

---

### Problem: "Invalid signature" Error

**Ursache:** `N8N_WEBHOOK_SECRET` gesetzt aber Signatur fehlt im Request

**Fix für Development:**

```bash
# Option A: Secret temporär deaktivieren
# Klicke "Validate Signature" Node → Ändere Code:
const secret = ''; // Force disable signature check

# Option B: Secret im Request mitschicken (siehe Test mit Signatur)
```

---

### Problem: Workflow nicht sichtbar nach Import

**Fix:**

```bash
# n8n neu starten
docker restart moe-n8n

# Warte 30 Sekunden
sleep 30

# Öffne erneut
open http://localhost:5678
```

---

## 🔐 Production Setup (Optional)

### Webhook Secret aktivieren

**Schritt 1:** Secret generieren

```bash
openssl rand -hex 32
# Kopiere Output: z.B. "EXAMPLE_WEBHOOK_SECRET"
```

**Schritt 2:** In n8n setzen

```bash
# Füge zu .env hinzu
echo 'N8N_WEBHOOK_SECRET="EXAMPLE_WEBHOOK_SECRET"' >> automation/n8n/.env

# n8n neu starten
docker-compose -f automation/n8n/docker-compose.yml restart
```

**Schritt 3:** In FastAPI setzen

```bash
# Füge zu API .env hinzu
echo 'N8N_WEBHOOK_SECRET="EXAMPLE_WEBHOOK_SECRET"' >> apps/api/.env
```

✅ **Jetzt:** Alle Webhooks werden mit HMAC-SHA256 signiert!

---

## 📊 Integration mit Privacy API

Nach erfolgreichem Import kannst du die **komplette Integration testen:**

### Schritt 1: FastAPI starten

```bash
cd api.menschlichkeit-oesterreich.at

# Environment Variables setzen
export CIVI_SITE_KEY="dummy_for_testing"
export CIVI_API_KEY="dummy_for_testing"
export JWT_SECRET="your_jwt_secret_here"
export N8N_BASE_URL="http://localhost:5678"
export N8N_WEBHOOK_SECRET=""  # Leer für Dev ohne Signatur

# Server starten
uvicorn app.main:app --reload --port 8000
```

### Schritt 2: JWT Token generieren

**Option A: Test-Token** (nur für Dev!)

```python
# In Python REPL:
import jwt
from datetime import datetime, timedelta

token = jwt.encode(
    {
        "sub": "test@example.com",
        "user_id": 123,
        "exp": datetime.utcnow() + timedelta(hours=1)
    },
    "your_jwt_secret_here",
    algorithm="HS256"
)
print(token)
```

**Option B: Über /auth/login**

```bash
# Erst registrieren (wenn noch nicht geschehen)
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstname": "Test",
    "lastname": "User"
  }'

# Dann einloggen
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Kopiere "access_token" aus Response
```

### Schritt 3: Deletion Request senden

```bash
curl -X POST http://localhost:8000/privacy/data-deletion \
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "GDPR Art. 17 - Right to be forgotten",
    "scope": "full"
  }'
```

**Erwartete Antwort:**

```json
{
  "success": true,
  "data": {
    "request_id": "del_123_1733270400",
    "status": "completed",
    "message": "Auto-approved (no retention exceptions)",
    "workflow_triggered": true
  },
  "message": "Deletion request processed successfully"
}
```

### Schritt 4: n8n Execution prüfen

1. Öffne **n8n UI:** [http://localhost:5678](http://localhost:5678)
2. Klicke **"Executions"** (linke Sidebar)
3. Neueste Execution sollte zeigen:
   - **Status:** Success ✅
   - **Data:** `request_id: "del_123_1733270400"`
   - **subject_email:** `"test@example.com"`

✅ **ERFOLG!** Die komplette Integration funktioniert!

---

## 🎯 Nächste Schritte

Nach erfolgreichem Import:

1. ✅ **Workflow aktiviert** → Bereit für Requests
2. ⏳ **API Integration testen** (siehe oben)
3. ⏳ **PostgreSQL Audit Log** implementieren (ersetzt in-memory storage)
4. ⏳ **Frontend Integration** (PrivacyCenter.tsx → echte API)

---

## 📚 Weiterführende Docs

- **n8n Workflow Details:** `automation/n8n/N8N-WORKFLOW-IMPORT-GUIDE.md`
- **API Implementation:** `quality-reports/PHASE-1-PROGRESS-RIGHT-TO-ERASURE-API.md`
- **DSGVO Compliance:** `quality-reports/RIGHT-TO-ERASURE-PROCEDURES.md`

Bei Fragen: Check [n8n Docs](https://docs.n8n.io/workflows/executions/)

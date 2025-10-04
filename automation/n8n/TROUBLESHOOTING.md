# n8n Workflow Import - Troubleshooting

## ❌ Problem: "Could not find property option"

**Ursache:** n8n Version erwartet anderes Node-Parameter-Format

**Lösung:** Verwende **minimal** Version

```bash
# Datei für Import:
automation/n8n/workflows/right-to-erasure-minimal.json
```

Diese Version hat:

- ✅ Nur 2 Nodes (Webhook + Respond)
- ✅ Minimale Parameter (garantiert kompatibel)
- ✅ Funktioniert mit allen n8n Versionen

---

## 🔄 Workflow-Versionen Übersicht

| Datei                           | Nodes | Features            | Empfehlung            |
| ------------------------------- | ----- | ------------------- | --------------------- |
| `right-to-erasure-minimal.json` | 2     | Basic Webhook       | ✅ **Start hier!**    |
| `right-to-erasure-fixed.json`   | 4     | + HMAC Signatur     | ⏳ Nach Test upgraden |
| `right-to-erasure.json`         | 4     | Original (Probleme) | ❌ Nicht verwenden    |

---

## ✅ MINIMAL Version - Was sie kann

**Node 1: Webhook**

- Empfängt POST auf `/webhook/right-to-erasure`
- Akzeptiert JSON Body mit: `requestId`, `subjectEmail`

**Node 2: Respond**

- Sendet HTTP 200 Response
- Format: `{"status":"accepted","request_id":"..."}`

**Fehlende Features** (können später ergänzt werden):

- ❌ HMAC Signature Validation
- ❌ Audit Payload Preparation
- ❌ Custom HTTP Status Codes

---

## 🚀 Import-Anleitung (Minimal Version)

1. **Browser:** http://localhost:5678
2. **Klicke:** "⋮" → "Import from File"
3. **Datei:** `automation/n8n/workflows/right-to-erasure-minimal.json`
4. **Import** → **Save** → **Activate**

**Test:**

```bash
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test_123","subjectEmail":"test@example.com"}'
```

**Erwartete Antwort:**

```json
{ "status": "accepted", "request_id": "test_123" }
```

> Hinweis: Für die FIXED/HMAC‑Variante muss der Header `X-Webhook-Signature` gesetzt werden. Er erwartet den reinen HMAC‑SHA256 Hex‑String (ohne `sha256=` Präfix). Beispiel‑CLI:

```bash
python3 automation/n8n/webhook-client-optimized.py erasure \
  --base-url http://localhost:5678 \
  --secret "$N8N_WEBHOOK_SECRET" \
  --email test@example.com
```

---

## 🛠️ Weitere Fehlerbilder

### 401 Unauthorized bei Webhook

Mögliche Ursachen:

- n8n Basic Auth ist aktiv und schützt auch Webhook‑Endpoints
- Reverse Proxy verlangt zusätzliche Authentifizierung

Lösungen (Dev):

- Basic Auth in `automation/n8n/docker-compose.yml` temporär deaktivieren (nur Dev!)
- Oder die Webhook‑Route im Proxy ausnehmen bzw. gültige Credentials mitsenden

### Signatur passt nicht (HMAC Mismatch)

Ursachen:

- Unterschiedliche JSON‑Kanonisierung zwischen Sender und n8n Validate Node
- Nutzlast wird serverseitig verändert (z. B. Middleware)

Checks:

- Der Client erzeugt die Signatur über kompaktes JSON ohne Sortierung (gleich wie `JSON.stringify`)
- Der Validate‑Node berechnet über `const payload = JSON.stringify(items[0].json)` denselben String
- Falls nötig: Validate‑Node vorübergehend deaktivieren und Roh‑Payload in Executions prüfen

---

## 🔧 Nach erfolgreichem Import: Upgrade zu FIXED Version

**Warum upgraden?**

- ✅ HMAC-SHA256 Signatur-Validierung (Sicherheit)
- ✅ Strukturierte Audit Payload
- ✅ HTTP 202 Status Code (korrektes async handling)

**Wie upgraden?**

**Methode 1: Neuen Workflow importieren**

1. Lass minimal Version aktiv (als Backup)
2. Importiere `right-to-erasure-fixed.json` als neuen Workflow
3. Aktiviere neue Version
4. Teste ausführlich
5. Deaktiviere minimal Version

**Methode 2: Bestehenden Workflow bearbeiten**

1. Öffne minimal Workflow in n8n
2. **Füge Node 2 hinzu:** "Function" (zwischen Webhook und Respond)
   - Name: "Validate Signature"
   - Code: (siehe unten)
3. **Füge Node 3 hinzu:** "Set" (zwischen Function und Respond)
   - Name: "Prepare Audit Payload"
   - Fields: (siehe unten)
4. **Verbinde Nodes:** Webhook → Validate → Prepare → Respond

### Validation Function Code

```javascript
// HMAC Signature Validation
const crypto = require('crypto');
const secret = $env.N8N_WEBHOOK_SECRET || '';

// If no secret configured, skip validation (dev mode)
if (!secret) {
  return items;
}

const incoming = $headers['x-webhook-signature'];
if (!incoming) {
  throw new Error('Missing webhook signature header');
}

const payload = JSON.stringify(items[0].json);
const expected = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (incoming !== expected) {
  throw new Error('Invalid webhook signature');
}

return items;
```

### Prepare Audit Payload Fields

**Set Node Configuration:**

| Field Type | Name            | Value                                          |
| ---------- | --------------- | ---------------------------------------------- |
| String     | `event`         | `right_to_erasure`                             |
| String     | `request_id`    | `={{$json.requestId}}`                         |
| String     | `subject_email` | `={{$json.subjectEmail}}`                      |
| String     | `mode`          | `={{$json.mode \|\| 'external_orchestrated'}}` |
| String     | `scope`         | `={{$json.scope \|\| 'full'}}`                 |

---

## 🔐 Production Setup (nach Upgrade)

### Webhook Secret setzen

**Schritt 1: Secret generieren**

```bash
openssl rand -hex 32
# Kopiere Output (z.B. "a1b2c3...")
```

**Schritt 2: In n8n .env setzen**

```bash
echo 'N8N_WEBHOOK_SECRET="a1b2c3..."' >> automation/n8n/.env
docker-compose -f automation/n8n/docker-compose.yml restart
```

**Schritt 3: In FastAPI .env setzen**

```bash
echo 'N8N_WEBHOOK_SECRET="a1b2c3..."' >> api.menschlichkeit-oesterreich.at/.env
```

**Test mit Signatur:**

```python
import hmac
import hashlib
import json
import requests

secret = "a1b2c3..."  # Dein Secret
payload = {
    "requestId": "test_signed",
    "subjectEmail": "test@example.com"
}

signature = hmac.new(
    secret.encode(),
    json.dumps(payload).encode(),
    hashlib.sha256
).hexdigest()

response = requests.post(
    "http://localhost:5678/webhook/right-to-erasure",
    json=payload,
    headers={"X-Webhook-Signature": signature}
)

print(response.json())
```

---

## 📊 Vergleich: Minimal vs Fixed

**MINIMAL Version (Aktuell):**

```
Webhook → Respond
```

- ✅ Funktioniert sofort
- ✅ Einfach zu verstehen
- ❌ Keine Security
- ❌ Minimale Audit Info

**FIXED Version (Empfohlen für Production):**

```
Webhook → Validate Signature → Prepare Audit → Respond
```

- ✅ HMAC Security
- ✅ Strukturierte Audit Logs
- ✅ HTTP 202 (async)
- ❌ Komplexer

---

## 🧪 Integration Tests

### Test 1: Minimal Version (jetzt)

```bash
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{"requestId":"min_001","subjectEmail":"test@example.com"}'
```

**Erwartete Antwort:**

```json
{ "status": "accepted", "request_id": "min_001" }
```

### Test 2: Fixed Version (nach Upgrade)

**Ohne Secret (Dev Mode):**

```bash
# Funktioniert auch ohne X-Webhook-Signature Header
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{"requestId":"fix_001","subjectEmail":"test@example.com"}'
```

**Mit Secret (Production):**

```bash
# Signature wird von Privacy API automatisch generiert
# Siehe: api.menschlichkeit-oesterreich.at/app/routes/privacy.py
# Funktion: _trigger_n8n_user_deletion_workflow()
```

### Test 3: FastAPI Integration (beide Versionen)

```bash
# Start API Server
cd api.menschlichkeit-oesterreich.at
export N8N_BASE_URL="http://localhost:5678"
export N8N_WEBHOOK_SECRET=""  # Leer für minimal Version
uvicorn app.main:app --reload --port 8000

# In anderem Terminal: Deletion Request
curl -X POST http://localhost:8000/privacy/data-deletion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reason":"Test","scope":"full"}'
```

**Prüfe n8n Executions:**

- http://localhost:5678 → "Executions"
- Siehst du neue Execution? ✅ Integration funktioniert!

---

## 🎯 Empfohlener Workflow

1. ✅ **JETZT:** Minimal Version importieren & testen
2. ⏳ **HEUTE:** FastAPI Integration testen (ohne Secret)
3. ⏳ **DIESE WOCHE:** Auf Fixed Version upgraden
4. ⏳ **VOR PRODUCTION:** Webhook Secret aktivieren

---

## 📚 Weiterführende Docs

- **Quick-Start:** `automation/n8n/QUICK-START.md`
- **Detaillierte Anleitung:** `automation/n8n/WORKFLOW-IMPORT-STEPS.md`
- **API Integration:** `quality-reports/PHASE-1-PROGRESS-RIGHT-TO-ERASURE-API.md`

Bei Fragen: [n8n Community Docs](https://docs.n8n.io)

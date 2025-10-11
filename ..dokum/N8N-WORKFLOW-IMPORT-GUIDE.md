# n8n GDPR Workflow Import - Quick Guide

## Workflow Status

✅ **n8n läuft auf:** http://localhost:5678  
✅ **Workflow-Datei:** `automation/n8n/workflows/right-to-erasure.json`  
✅ **Webhook-URL:** `http://localhost:5678/webhook/right-to-erasure`

---

## Import-Anleitung (5 Minuten)

### Schritt 1: n8n UI öffnen

```bash
# n8n ist bereits gestartet!
open http://localhost:5678
```

**Oder im Browser:** [http://localhost:5678](http://localhost:5678)

---

### Schritt 2: Workflow importieren

1. **Klicke auf** "**+**" (Neuer Workflow)
2. **Klicke auf** "**⋮**" (Drei Punkte oben rechts)
3. **Wähle** "**Import from File**"
4. **Datei auswählen:** `/workspaces/menschlichkeit-oesterreich-development/automation/n8n/workflows/right-to-erasure.json`
5. **Klicke** "**Import**"

**Alternativ (Copy-Paste):**

```bash
# Zeige Workflow JSON
cat automation/n8n/workflows/right-to-erasure.json
```

Dann:

1. **Klicke** "**Import from URL or JSON**"
2. **Füge JSON ein**
3. **Klicke** "**Import**"

---

### Schritt 3: Workflow konfigurieren

1. **Öffne** den "**Validate Signature**" Node (gelbes Function-Icon)
2. **Prüfe Environment Variable:** `N8N_WEBHOOK_SECRET`
   - Falls leer: Workflow akzeptiert ALLE Requests (nur für Dev!)
   - Für Produktion: Setze Secret in `.env` Datei

```bash
# Optional: Set webhook secret
echo 'N8N_WEBHOOK_SECRET="your_secure_random_string"' >> automation/n8n/.env
docker-compose -f automation/n8n/docker-compose.yml restart
```

---

### Schritt 4: Workflow aktivieren

1. **Toggle** den Workflow-Status von "**Inactive**" auf "**Active**" (oben rechts)
2. **Speichere** den Workflow (Strg+S oder "Save" Button)

✅ **Der Workflow ist jetzt bereit!**

---

## Testing

### Test 1: Webhook-Ping (ohne Signatur)

```bash
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_123",
    "subjectEmail": "test@example.com",
    "mode": "external_orchestrated"
  }'
```

**Erwartete Antwort:**

```json
{
  "status": "accepted",
  "request_id": "test_123"
}
```

---

### Test 2: Webhook mit HMAC-Signatur (Production-Ready)

```bash
python3 automation/n8n/webhook-client-optimized.py erasure \
  --base-url http://localhost:5678 \
  --secret "your_webhook_secret" \
  --email user@example.com \
  --request-id del_42_1234567890 \
  --scope full --reason user_request
```

---

### Test 3: Integration mit Privacy API

```bash
# Start FastAPI Server
cd api.menschlichkeit-oesterreich.at
export CIVI_SITE_KEY="dummy" CIVI_API_KEY="dummy" JWT_SECRET="secret"
export N8N_BASE_URL="http://localhost:5678"
export N8N_WEBHOOK_SECRET="your_secret"  # Optional

uvicorn app.main:app --reload --port 8000

# In anderem Terminal: Request deletion
curl -X POST http://localhost:8000/privacy/data-deletion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test deletion", "scope": "full"}'
```

**Dann in n8n UI:**

- **Klicke** auf "**Executions**" (linke Sidebar)
- **Siehst du** den neuen Execution mit `request_id`
- **Klicke** darauf für Details

---

## Workflow-Struktur

Der importierte Workflow hat **4 Nodes**:

```
1. Webhook - Erasure Intake
   └─ Empfängt POST Requests auf /webhook/right-to-erasure

2. Validate Signature
   └─ Prüft HMAC-SHA256 Signatur (falls N8N_WEBHOOK_SECRET gesetzt)

3. Prepare Audit Payload
   └─ Formatiert Daten für Audit-Logging

4. Respond
   └─ Sendet 202 Accepted Response zurück
```

---

## Integration mit FastAPI

Die Privacy API triggert den Workflow automatisch:

**File:** `api.menschlichkeit-oesterreich.at/app/routes/privacy.py`

```python
async def _trigger_n8n_user_deletion_workflow(user_id: int, email: str):
    """
    Sends HMAC-signed webhook to n8n for audit logging.
    """
    import hmac, hashlib, json

    webhook_url = f"{N8N_BASE_URL}/webhook/right-to-erasure"

    payload = {
        "requestId": f"del_{user_id}_{int(datetime.utcnow().timestamp())}",
        "subjectEmail": email,
        "mode": "external_orchestrated",
        "scope": "full"
    }

    # HMAC Signature
    if N8N_WEBHOOK_SECRET:
        signature = hmac.new(
            N8N_WEBHOOK_SECRET.encode(),
            json.dumps(payload).encode(),
            hashlib.sha256
        ).hexdigest()
        headers = {"X-Webhook-Signature": signature}

    response = await httpx.post(webhook_url, json=payload, headers=headers)
    return response.json()
```

---

## Troubleshooting

### Problem: Workflow nicht sichtbar

**Lösung:**

```bash
# Prüfe ob n8n läuft
docker ps | grep n8n

# Starte neu falls nötig
cd /workspaces/menschlichkeit-oesterreich-development
docker-compose -f automation/n8n/docker-compose.yml restart
```

---

### Problem: Webhook 404

**Ursachen:**

1. Workflow nicht aktiviert (Toggle oben rechts)
2. Falscher Webhook-Path (muss `/webhook/right-to-erasure` sein)
3. Webhook-Node hat falsches `webhookId` (sollte `moe-gdpr-right-to-erasure` sein)

**Fix:**

```bash
# Prüfe Workflow JSON
cat automation/n8n/workflows/right-to-erasure.json | jq '.nodes[] | select(.type=="n8n-nodes-base.webhook")'
```

---

### Problem: Signature Validation Error

**Ursachen:**

1. `N8N_WEBHOOK_SECRET` in FastAPI und n8n stimmen nicht überein
2. Payload wurde nach Signatur-Berechnung verändert

**Fix:**

```bash
# Zeige beide Secrets
echo "FastAPI: $N8N_WEBHOOK_SECRET"
docker exec moe-n8n env | grep N8N_WEBHOOK_SECRET

# Setze beide auf gleichen Wert
export N8N_WEBHOOK_SECRET="my_secure_secret"
docker-compose -f automation/n8n/docker-compose.yml restart
```

---

## Production Deployment

### ⚠️ WICHTIG für Production:

1. **HTTPS verwenden** (nicht HTTP!)

   ```nginx
   location /webhook/ {
       proxy_pass http://localhost:5678;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

2. **Webhook Secret setzen**

   ```bash
   # Generate secure secret
   openssl rand -hex 32

   # Add to n8n .env
   echo "N8N_WEBHOOK_SECRET=<generated_secret>" >> automation/n8n/.env

   # Add to FastAPI .env
   echo "N8N_WEBHOOK_SECRET=<generated_secret>" >> api.menschlichkeit-oesterreich.at/.env
   ```

3. **IP Whitelisting** (optional)

   ```nginx
   location /webhook/right-to-erasure {
       allow 10.0.0.0/24;  # Internal network
       deny all;
       proxy_pass http://localhost:5678;
   }
   ```

4. **Rate Limiting**

   ```nginx
   limit_req_zone $binary_remote_addr zone=webhook:10m rate=5r/m;

   location /webhook/ {
       limit_req zone=webhook burst=10;
       proxy_pass http://localhost:5678;
   }
   ```

---

## Status

✅ **n8n läuft:** http://localhost:5678  
✅ **Workflow bereit:** `right-to-erasure.json`  
⏳ **Import:** Manuell über UI (siehe Schritt 2)  
⏳ **Testing:** Nach Import (siehe Testing-Sektion)

---

## Nächste Schritte

1. **Importiere Workflow** (siehe Schritt 2)
2. **Aktiviere Workflow** (siehe Schritt 4)
3. **Teste Integration** (siehe Test 3)
4. **Prüfe Executions** in n8n UI

Bei Fragen: Siehe [n8n Dokumentation](https://docs.n8n.io/workflows/executions/)

# 🎯 n8n Workflow Import - Quick Reference

## ⚡ SCHNELLSTART (30 Sekunden)

### Browser bereits offen: http://localhost:5678

**6 KLICKS zum Erfolg:**

1. **"⋮"** (oben rechts) → **"Import from File"**
2. **Datei wählen:** `/workspaces/menschlichkeit-oesterreich-development/automation/n8n/workflows/right-to-erasure-minimal.json`
3. **"Import"** klicken
4. **"Save"** klicken (oder `Strg+S`)
5. **Toggle "Inactive" → "Active"** (oben rechts)
6. **"Activate"** bestätigen

✅ **FERTIG!**

> **💡 TIPP:** Verwende `-minimal.json` für garantierten Import!
> Später kannst du auf `-fixed.json` upgraden (mit HMAC Signatur-Validierung).

---

## 🧪 Sofort-Test

```bash
curl -X POST http://localhost:5678/webhook/right-to-erasure \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test_001","subjectEmail":"test@example.com"}'
```

**Erwartete Antwort:**

```json
{ "status": "accepted", "request_id": "test_001" }
```

> **Hinweis:** `mode` Parameter ist bei minimal Version optional

**In n8n prüfen:**

- Klicke **"Executions"** (linke Sidebar)
- Siehst du `request_id: test_001`? → ✅ **SUCCESS!**

---

### Signierte Anfrage (optional)

```bash
python3 automation/n8n/webhook-client-optimized.py erasure \
  --base-url http://localhost:5678 \
  --secret "your_webhook_secret" \
  --email test@example.com
```

### Kompletttest (Smoke)

```bash
npm run n8n:smoke
```

Gibt PASS/FAIL für Minimal und – falls `N8N_WEBHOOK_SECRET` gesetzt – HMAC aus.

## 🔧 Falls Probleme

### Workflow nicht sichtbar?

```bash
docker restart moe-n8n
sleep 30
```

### 404 beim Test?

- Workflow aktiviert? (Toggle muss **GRÜN** sein!)
- Webhook-Path korrekt? (klicke Webhook-Node → sollte `/webhook/right-to-erasure` sein)

---

## 📚 Detaillierte Anleitungen

- **Schritt-für-Schritt:** `automation/n8n/WORKFLOW-IMPORT-STEPS.md`
- **Komplette Docs:** `automation/n8n/N8N-WORKFLOW-IMPORT-GUIDE.md`

---

## 💡 Nach erfolgreicher Aktivierung

**Sag mir Bescheid!** Ich führe dann:

1. ✅ Verification Test aus
2. ✅ Update TODO-Liste
3. 🚀 Starte nächsten Schritt (FastAPI Integration Testing)

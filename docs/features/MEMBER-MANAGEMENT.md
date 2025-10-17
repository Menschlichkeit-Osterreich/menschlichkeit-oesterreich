# 👥 Mitgliederverwaltung (CRM-Integration)

**Status:** ✅ Implementiert  
**Version:** 1.0.0  
**Letzte Aktualisierung:** 17. Oktober 2025

---

## 📋 Übersicht

Vollständige Mitgliederverwaltung mit CiviCRM-Integration für den Verein Menschlichkeit Österreich. Ermöglicht Vorstand und Kassier die Verwaltung aller Vereinsmitglieder gemäß Statuten § 5-7 und Beitragsordnung.

### ✨ Features

- ✅ **Mitgliederliste** mit Suche & Filter
- ✅ **Mitgliederdetails** mit Bearbeitungsmodus
- ✅ **CiviCRM-Integration** (bidirektionale Synchronisation)
- ✅ **DSGVO-konform** (Art. 15-21 umgesetzt)
- ✅ **Rollenbasierte Zugriffssteuerung** (Vorstand, Kassier)
- ✅ **Österreichische Lokalisierung** (de-AT)

---

## 🏗️ Architektur

### Frontend (React + TypeScript)

```
frontend/src/
├── pages/
│   └── MemberManagement.tsx        # Hauptseite
├── components/
│   └── members/
│       ├── MemberList.tsx          # Liste mit Suche/Filter
│       └── MemberDetail.tsx        # Detail-Ansicht mit Edit
└── services/
    └── api.ts                      # API-Client
```

### Backend (FastAPI + CiviCRM)

```
api.menschlichkeit-oesterreich.at/app/
└── main.py
    ├── GET  /contacts/search            # Alle Mitglieder mit Memberships
    ├── GET  /contacts/{id}              # Einzelnes Mitglied
    ├── PUT  /contacts/{id}              # Mitglied aktualisieren
    └── GET  /memberships/contact/{id}   # Mitgliedschaften eines Kontakts
```

---

## 🚀 Verwendung

### Zugriff

**URL:** https://menschlichkeit-oesterreich.at/admin/members

**Berechtigungen:**
- **Vorstand:** Vollzugriff (lesen, schreiben, löschen)
- **Kassier:** Lesen + Finanzdaten
- **Mitglieder:** Kein Zugriff (nur eigene Daten unter `/member`)

### Workflow

#### 1. Mitgliederliste

```tsx
// Automatisches Laden beim Seitenaufruf
GET /contacts/search?limit=100&offset=0

// Response:
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": 1,
        "first_name": "Maria",
        "last_name": "Huber",
        "email": "maria.huber@example.com",
        "phone": "+43 676 123 4567",
        "membership_type": "Standard",
        "membership_status": "active",
        "join_date": "2024-01-15",
        "address": "Mariahilfer Straße 123, 1060 Wien"
      }
    ],
    "total": 1
  }
}
```

#### 2. Suche & Filter

**Suchfelder:**
- Name (Vor- + Nachname)
- E-Mail
- Telefon (optional)

**Filter:**
- **Status:** Alle, Aktiv, Ausstehend, Abgelaufen, Gekündigt
- **Mitgliedsart:** Alle, Standard (36 €), Ermäßigt (18 €), Härtefall (0 €)

```tsx
// Client-Side Filtering (State Management)
const filteredMembers = members.filter(m => {
  const matchesSearch = 
    m.first_name.includes(searchTerm) ||
    m.last_name.includes(searchTerm) ||
    m.email.includes(searchTerm);
  
  const matchesStatus = 
    statusFilter === 'all' || m.membership_status === statusFilter;
  
  const matchesType = 
    typeFilter === 'all' || m.membership_type === typeFilter;
  
  return matchesSearch && matchesStatus && matchesType;
});
```

#### 3. Mitglied bearbeiten

**Modal-Dialog mit Sektionen:**

1. **Persönliche Daten**
   - Vorname*, Nachname*, E-Mail*, Telefon, Geburtsdatum

2. **Adresse**
   - Straße & Hausnummer, PLZ, Ort

3. **Mitgliedschaft**
   - Status, Mitgliedsart, Beitrittsdatum, Enddatum

4. **Zahlungsinformationen** (Read-Only für Mitglieder)
   - Zahlungsart, Letzte Zahlung, Gesamtbeiträge

```tsx
// PUT /contacts/{id}
{
  "first_name": "Maria",
  "last_name": "Huber",
  "email": "maria.huber@example.com",
  "phone": "+43 676 123 4567",
  "birth_date": "1985-03-15",
  "street_address": "Mariahilfer Straße 123",
  "city": "Wien",
  "postal_code": "1060"
}
```

---

## 🔒 DSGVO-Compliance

### Umgesetzte Betroffenenrechte

| Artikel | Recht | Implementierung |
|---------|-------|-----------------|
| Art. 15 | Auskunft | `GET /privacy/data-export` |
| Art. 16 | Berichtigung | `PUT /contacts/{id}` |
| Art. 17 | Löschung | `POST /privacy/data-deletion` |
| Art. 18 | Einschränkung | Flag `processing_restricted` |
| Art. 20 | Datenübertragbarkeit | JSON/CSV Export |
| Art. 21 | Widerspruch | Newsletter Opt-Out |

### PII-Sanitization

**Automatische Maskierung in Logs:**

```python
# api/app/lib/pii_sanitizer.py
from app.lib.pii_sanitizer import scrub

logger.info(scrub(f"User: {email}"))
# Output: "User: m**@example.com"
```

**E-Mail-Masking:**
- `maria.huber@example.com` → `m**@example.com`

**IBAN-Redaction:**
- `AT61 1904 3002 3457 3201` → `AT61***`

### Aufbewahrungsfristen (BAO § 132)

| Datenart | Frist | Rechtsgrundlage |
|----------|-------|-----------------|
| Mitgliederdaten | Während Mitgliedschaft + 1 Jahr | Statuten § 7 |
| Finanzdaten | 7 Jahre | BAO § 132 |
| Newsletter-Einwilligungen | Bis Widerruf | TKG § 107 |

---

## 🧪 Testing

### Unit Tests

```bash
# Frontend (Vitest)
npm run test -- components/members/MemberList.spec.tsx
npm run test -- components/members/MemberDetail.spec.tsx

# Backend (Pytest)
pytest tests/test_contacts_api.py
pytest tests/test_memberships_api.py
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/member-management.spec.ts
import { test, expect } from '@playwright/test';

test('Mitgliederliste laden', async ({ page }) => {
  await page.goto('/admin/members');
  await expect(page.locator('h1')).toContainText('Mitgliederverwaltung');
  await expect(page.locator('[data-testid="member-card"]')).toHaveCount(10);
});

test('Mitglied bearbeiten', async ({ page }) => {
  await page.goto('/admin/members');
  await page.click('[data-testid="member-card"]:first-child');
  await page.click('button:has-text("Bearbeiten")');
  await page.fill('input[name="phone"]', '+43 676 999 8888');
  await page.click('button:has-text("Speichern")');
  await expect(page.locator('text=Änderungen erfolgreich gespeichert')).toBeVisible();
});
```

### API Tests

```bash
# Manual Testing
curl -X GET "http://localhost:8001/contacts/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

curl -X PUT "http://localhost:8001/contacts/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Maria",
    "last_name": "Huber",
    "phone": "+43 676 123 4567"
  }'
```

---

## 🔧 Konfiguration

### Environment Variables (.env)

```bash
# CiviCRM API
CIVI_BASE_URL=https://crm.menschlichkeit-oesterreich.at
CIVI_SITE_KEY=your_site_key
CIVI_API_KEY=your_api_key

# Frontend
VITE_API_BASE_URL=http://localhost:8001

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

# CORS
FRONTEND_ORIGINS=http://localhost:5173,https://menschlichkeit-oesterreich.at
```

### CiviCRM API Permissions

**CiviCRM → Administer → Users and Permissions → API Permissions:**

```php
// civicrm.settings.php
$civicrm_api_keys = [
  'api_user' => 'YOUR_API_KEY_HERE'
];

// Permissions for API user
civicrm_api3('Contact', 'setvalue', [
  'id' => $api_user_id,
  'field' => 'api_key',
  'value' => 'YOUR_API_KEY_HERE'
]);
```

---

## 📊 Performance

### Caching-Strategie

**Client-Side (React Query):**

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['members', searchTerm, statusFilter],
  queryFn: () => fetchMembers(),
  staleTime: 5 * 60 * 1000, // 5 Minuten
  cacheTime: 10 * 60 * 1000, // 10 Minuten
});
```

**Server-Side (Redis - optional):**

```python
# api/app/cache.py
from redis import Redis
import json

cache = Redis(host='localhost', port=6379, decode_responses=True)

async def get_cached_members():
    cached = cache.get('members:all')
    if cached:
        return json.loads(cached)
    
    members = await fetch_from_civicrm()
    cache.setex('members:all', 300, json.dumps(members))  # 5 min TTL
    return members
```

### Pagination

```tsx
// Frontend: Virtual Scrolling (react-window)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={members.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MemberCard member={members[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🐛 Troubleshooting

### Problem: "Keine Mitglieder gefunden"

**Ursachen:**
1. CiviCRM API nicht erreichbar
2. Keine Mitglieder in CiviCRM
3. Authentifizierung fehlgeschlagen

**Lösung:**

```bash
# 1. CiviCRM API testen
curl -X POST "https://crm.menschlichkeit-oesterreich.at/sites/all/modules/civicrm/extern/rest.php" \
  -d "entity=Contact&action=get&api_key=YOUR_API_KEY&key=YOUR_SITE_KEY&json=1"

# 2. Backend-Logs prüfen
docker logs moe-api --tail 100 | grep "CiviCRM"

# 3. JWT-Token validieren
jwt decode YOUR_TOKEN
```

### Problem: "Änderungen nicht gespeichert"

**Ursache:** CiviCRM schreibgeschützt oder Rate-Limit

**Lösung:**

```python
# api/app/main.py
@app.put("/contacts/{contact_id}")
async def update_contact(...):
    try:
        result = await civicrm_api_call("Contact", "create", params)
        return ApiResponse(success=True, data=result)
    except httpx.HTTPStatusError as e:
        logger.error(f"CiviCRM API error: {e.response.text}")
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        raise HTTPException(status_code=500, detail="CiviCRM error")
```

---

## 🔄 n8n Automation Workflows

### Auto-Update Mitgliedsstatus (täglich)

**Workflow:** `automation/n8n/workflows/membership-status-updater.json`

```json
{
  "nodes": [
    {
      "name": "Cron Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "cronExpression": "0 3 * * *"
      }
    },
    {
      "name": "Get Expiring Memberships",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.API_URL}}/memberships/expiring",
        "method": "GET"
      }
    },
    {
      "name": "Update Status",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.API_URL}}/memberships/{{$json.id}}",
        "method": "PUT",
        "body": {
          "status": "expired"
        }
      }
    },
    {
      "name": "Send Notification",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "{{$json.email}}",
        "subject": "Mitgliedschaft abgelaufen",
        "text": "Ihre Mitgliedschaft ist abgelaufen. Bitte verlängern Sie."
      }
    }
  ]
}
```

---

## 📚 Weitere Dokumentation

- **API-Dokumentation:** http://localhost:8001/docs
- **CiviCRM Interface:** `figma-design-system/figmadocs/civicrm/README_CiviCRM_Interface.md`
- **Statuten:** `.github/instructions/verein-statuten.instructions.md`
- **Beitragsordnung:** `.github/instructions/mitgliedsbeitraege.instructions.md`
- **DSGVO:** `.github/instructions/dsgvo-compliance.instructions.md`

---

## 🎯 Roadmap

### Version 1.1 (Q4 2025)

- [ ] **Bulk-Operationen** (Mehrfach-Bearbeitung)
- [ ] **Excel-Export** (DSGVO-konform)
- [ ] **E-Mail-Templates** (Newsletter, Mahnungen)
- [ ] **Dashboard-Widgets** (Mitgliederstatistiken)

### Version 1.2 (Q1 2026)

- [ ] **Erweiterte Suche** (Volltextsuche, Fuzzy-Matching)
- [ ] **Audit-Log** (Änderungshistorie)
- [ ] **Mobile App** (React Native)
- [ ] **Offline-Modus** (PWA)

---

**Verantwortlich:** Vorstand (Peter Schuller)  
**Kontakt:** vorstand@menschlichkeit-oesterreich.at  
**Letzte Überprüfung:** 17. Oktober 2025

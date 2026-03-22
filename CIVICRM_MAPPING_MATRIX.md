# CiviCRM Mapping Matrix

**Projekt:** Menschlichkeit Österreich
**Datum:** 2026-03-22

---

## 1. Verbindungskonfiguration

| Parameter | Wert |
|-----------|------|
| **Base URL** | `CIVICRM_BASE_URL` (Environment-Variable) |
| **Auth-Header 1** | `X-Civi-Auth: Bearer {CIVICRM_API_KEY}` |
| **Auth-Header 2** | `X-Civi-Key: {CIVICRM_SITE_KEY}` |
| **API-Version** | CiviCRM v4 (APIv4) |
| **HTTP-Client** | `httpx.AsyncClient` (Timeout: 30 Sekunden) |
| **Aktivierung** | Nur wenn alle 3 Credentials gesetzt (`CIVICRM_BASE_URL`, `CIVICRM_API_KEY`, `CIVICRM_SITE_KEY`) |
| **Deaktiviert** | `CrmFacade.enabled == False` — alle Aufrufe geben None/False zurück |

### Endpunkt-Schema

```
{CIVICRM_BASE_URL}/civicrm/ajax/api4/{Entity}/{Action}
```

Beispiel:
```
POST https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4/Contact/get
```

---

## 2. Entity-Mapping: Contact

### Feld-Zuordnung

| Internes Feld | CiviCRM API-Feld | Pflicht | Richtung | Anmerkung |
|--------------|-----------------|---------|----------|-----------|
| `email` | `email_primary.email` | Ja | ↔ Bidirektional | Suchschlüssel; wird vor Speicherung normalisiert (lowercase, trim) |
| `first_name` | `first_name` | Ja | ↔ Bidirektional | — |
| `last_name` | `last_name` | Ja | ↔ Bidirektional | — |
| `phone` | `phone_primary.phone` | Nein | ↔ Bidirektional | — |
| `postal_code` | `address_primary.postal_code` | Nein | → Intern → CRM | — |
| `city` | `address_primary.city` | Nein | → Intern → CRM | — |
| `street_address` | `address_primary.street_address` | Nein | → Intern → CRM | Nur in Admin-Update-Flows |
| `source` | `source` | Nein | → Intern → CRM | Default: `"website"` |
| `contact_type` | `contact_type` | Auto | → Intern → CRM | Immer `"Individual"` |
| `country` | `address_primary.country_id:name` | Auto | → Intern → CRM | Immer `"Austria"` |

### API-Aufrufe

| Operation | CiviCRM Entity | CiviCRM Action | Verwendung |
|-----------|---------------|----------------|------------|
| Suchen | `Contact` | `get` | `WHERE email_primary.email = :email, LIMIT 1` |
| Erstellen | `Contact` | `create` | Neuer Kontakt mit allen Pflichtfeldern |
| Aktualisieren | `Contact` | `update` | `WHERE id = :contact_id`, nur geänderte Felder |
| Löschen | `Contact` | `delete` | `WHERE id = :contact_id` (DSGVO Right-to-Erasure) |

---

## 3. Entity-Mapping: Membership

### Feld-Zuordnung

| Internes Feld | CiviCRM API-Feld | Anmerkung |
|--------------|-----------------|-----------|
| `membership_key` | `membership_type_id` | Übersetzung via `CIVICRM_MEMBERSHIP_TYPE_MAP` (JSON in Env-Var) |
| `status` | `status_id:name` | `"New"` bei Erstellung, `"Current"` bei Verlängerung |
| `join_date` | `join_date` | Heute bei Ersterstellung |
| `start_date` | `start_date` | Heute bei Ersterstellung |
| `end_date` | `end_date` | +1 Jahr bei Verlängerung |
| `contact_id` | `contact_id` | Referenz auf CiviCRM Contact |

### Membership-Type-Mapping

```json
// CIVICRM_MEMBERSHIP_TYPE_MAP (Environment-Variable)
{
  "standard": 1,
  "foerder": 2,
  "student": 3,
  "ehrenmitglied": 4
}
```

### API-Aufrufe

| Operation | CiviCRM Entity | CiviCRM Action | Verwendung |
|-----------|---------------|----------------|------------|
| Prüfen | `Membership` | `get` | `WHERE contact_id = :id AND membership_type_id = :type_id` |
| Erstellen | `Membership` | `create` | Neue Mitgliedschaft für Contact |
| Verlängern | `Membership` | `update` | `end_date` + 1 Jahr, `status_id:name = "Current"` |

---

## 4. Entity-Mapping: Contribution (Spenden)

### Feld-Zuordnung

| Internes Feld | CiviCRM API-Feld | Anmerkung |
|--------------|-----------------|-----------|
| `amount` | `total_amount` | Float, in EUR |
| `source` | `source` | Default: `"Website"` |
| `type` | `financial_type_id:name` | Immer `"Donation"` |
| `status` | `contribution_status_id:name` | Immer `"Completed"` |
| `date` | `receive_date` | UTC now (ISO 8601) |
| `contact_id` | `contact_id` | Referenz auf CiviCRM Contact |
| `currency` | `currency` | Immer `"EUR"` |

### API-Aufrufe

| Operation | CiviCRM Entity | CiviCRM Action | Verwendung |
|-----------|---------------|----------------|------------|
| Erstellen | `Contribution` | `create` | Neue Spende für Contact |
| Auflisten | `Contribution` | `get` | `WHERE contact_id = :id, ORDER BY receive_date DESC` |

---

## 5. Entity-Mapping: GroupContact (Newsletter)

### Operationen

| Operation | CiviCRM Entity | CiviCRM Action | Key Fields | Anmerkung |
|-----------|---------------|----------------|-----------|-----------|
| Gruppe finden | `Group` | `get` | `WHERE title = :group_name` | Gruppe über Name auflösen |
| Subscribe | `GroupContact` | `create` | `group_id`, `contact_id`, `status="Added"` | Kontakt zur Newsletter-Gruppe hinzufügen |
| Unsubscribe | `GroupContact` | `update` | `WHERE contact_id = :id AND group_id = :gid`, `SET status="Removed"` | Status auf "Removed" setzen |
| Status prüfen | `GroupContact` | `get` | `WHERE contact_id = :id AND group_id = :gid` | Aktuellen Status abfragen |

### Group-Name-Mapping

```json
// CIVICRM_GROUP_MAP (Environment-Variable)
{
  "newsletter": "Newsletter",
  "members": "Mitglieder",
  "volunteers": "Freiwillige"
}
```

Default-Gruppe für Newsletter-Subscriptions: `"Newsletter"`

---

## 6. Duplikats-Logik

### Ablauf

```
1. Suche: Contact.get WHERE email_primary.email = normalize(email), LIMIT 1
   │
   ├─ Contact gefunden (id vorhanden)
   │  └─ Contact.update WHERE id = :found_id
   │     → Felder werden überschrieben (kein Merge)
   │
   └─ Contact nicht gefunden
      └─ Contact.create mit allen verfügbaren Feldern
         → Neuer Contact angelegt
```

### Normalisierung

- Email wird vor Suche normalisiert: `email.strip().lower()`
- Keine Berücksichtigung von `+`-Aliasing (z.B. `user+tag@example.com` wird als eigener Contact behandelt)

### Einschränkungen

- **Kein Merge-Handling**: Wenn CiviCRM bereits mehrere Contacts mit gleicher Email hat (z.B. durch manuellen Import), wird nur der erste Treffer (`LIMIT 1`) aktualisiert
- **Kein Conflict-Detection**: Unterschiedliche Namen bei gleicher Email werden stillschweigend überschrieben
- **Keine dedupe-Rules**: CiviCRM-eigene Deduplizierungsregeln werden nicht genutzt

---

## 7. Fehlerbehandlung

### Generelles Muster

```python
async def crm_operation(self, ...):
    if not self.enabled:
        return None  # Graceful skip
    try:
        response = await self.client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.warning(f"CRM operation failed: {e}")
        return None  # Fehler wird geschluckt
```

### Fehlerverhalten pro Szenario

| Szenario | Verhalten | Auswirkung auf Benutzer |
|----------|----------|------------------------|
| CiviCRM nicht erreichbar | `return None/False` + Log Warning | Keine — Hauptvorgang läuft weiter |
| Ungültige Credentials | `return None/False` + Log Warning | CRM-Sync deaktiviert |
| API-Fehler (4xx/5xx) | `return None/False` + Log Warning | Daten nicht im CRM, aber lokal gespeichert |
| Timeout (>30s) | `httpx.TimeoutException` → `return None` | CRM-Operation übersprungen |
| JSON-Parse-Fehler | `Exception` → `return None` | CRM-Antwort nicht verarbeitet |

### Retry-Mechanismus

- **Aktuell:** Kein Retry implementiert
- **Empfehlung:** 3 Versuche mit exponentiellem Backoff (1s, 2s, 4s) für transiente Fehler (5xx, Timeout)

### Fallback-Strategien

| Service | Fallback |
|---------|----------|
| `CrmFacade` | Alle Methoden geben `None`/`False` zurück — Hauptvorgang unbeeinträchtigt |
| `AdminCrmService` | Dashboard zeigt lokale Member-DB-Daten wenn CiviCRM offline |
| n8n-Workflows | Execution markiert als failed, Admin wird benachrichtigt |

---

## 8. Datenfluss-Diagramm

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   FastAPI App     │────→│   CrmFacade     │────→│   CiviCRM v4     │
│                   │     │                 │     │   (Drupal 10)    │
│ - Auth Router     │     │ - find_contact  │     │                  │
│ - Payment Router  │     │ - upsert_contact│     │ - Contact        │
│ - Newsletter Rtr  │     │ - ensure_member │     │ - Membership     │
│ - Privacy Router  │     │ - create_contri │     │ - Contribution   │
│ - Admin Router    │     │ - set_newsletter│     │ - GroupContact   │
│                   │     │ - delete_contact│     │ - Group          │
└──────────────────┘     └─────────────────┘     └──────────────────┘
         │                        │
         │                        │ Nur →  Richtung
         │                        │ (Plattform → CRM)
         ▼                        │
┌──────────────────┐              │
│   PostgreSQL     │              │
│                  │              │
│ - members        │ ◄── Source   │
│ - donations      │    of Truth  │
│ - consents       │              │
│ - subscriptions  │              │
└──────────────────┘              │
         │                        │
         ▼                        ▼
┌──────────────────┐     ┌─────────────────┐
│   n8n Workflows  │────→│   CiviCRM v4    │
│                  │     │   (direkt)      │
│ - crm-sync      │     │                 │
│ - right-erasure  │     │ Batch-Sync      │
│ - member-sync    │     │ via API         │
└──────────────────┘     └─────────────────┘
```

---

## 9. Audit-Punkte & Empfehlungen

### Feststellungen

| # | Feststellung | Schwere | Status |
|---|-------------|---------|--------|
| 1 | Keine Webhook-basierte Sync von CiviCRM → Plattform (nur Plattform → CiviCRM) | Mittel | ⚠️ |
| 2 | Kein Retry bei transientem CiviCRM-Fehler (Timeout, 5xx) | Mittel | ⚠️ |
| 3 | `CIVICRM_MEMBERSHIP_TYPE_MAP` und `CIVICRM_GROUP_MAP` sind JSON in Env-Vars (fehleranfällig bei Deployment) | Niedrig | ⚠️ |
| 4 | Kein Test für CRM-Integration (weder Unit noch Integration) | Hoch | ⚠️ |
| 5 | Kein Merge-Handling bei Duplikaten — nur erster Treffer wird aktualisiert | Niedrig | ⚠️ |
| 6 | Keine Nutzung von CiviCRM-eigenen Deduplizierungsregeln | Niedrig | ⚠️ |
| 7 | Graceful Degradation funktioniert korrekt — System läuft ohne CiviCRM | — | ✅ |
| 8 | PII-Sanitizer verhindert CRM-Daten in Logs | — | ✅ |
| 9 | Async HTTP-Client mit konfiguriertem Timeout | — | ✅ |

### Empfehlungen (priorisiert)

1. **P1 — Tests:** CRM-Integration-Tests mit Mock-CiviCRM-Server schreiben (mindestens: upsert_contact, ensure_membership, create_contribution, set_newsletter_subscription, delete_contact)

2. **P1 — Retry:** Retry-Mechanismus für transiente Fehler implementieren (3 Versuche, exponentielles Backoff: 1s/2s/4s, nur für 5xx und Timeout)

3. **P2 — Bidirektionale Sync:** CiviCRM-Webhooks oder periodische Reverse-Sync implementieren, damit in CiviCRM vorgenommene Änderungen (z.B. durch Sachbearbeiter) in die Plattform zurückfließen

4. **P2 — Env-Var-Validierung:** JSON-Env-Vars (`CIVICRM_MEMBERSHIP_TYPE_MAP`, `CIVICRM_GROUP_MAP`) beim App-Start validieren und bei ungültigem JSON sofort fehlschlagen (fail-fast)

5. **P3 — Duplikats-Handling:** CiviCRM-Deduplizierungsregeln evaluieren und optional in den Upsert-Flow integrieren

6. **P3 — Monitoring:** Dashboard-Widget für CRM-Sync-Status (letzte erfolgreiche Sync, Fehlerrate, Queue-Länge)

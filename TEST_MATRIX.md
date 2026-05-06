# Test Matrix
**Projekt:** Menschlichkeit Österreich
**Datum:** 2026-03-22

---

## 1. Bestehende Tests (31 Python + 12 E2E)

| Datei | Tests | Bereich | Abdeckung |
|-------|-------|---------|-----------|
| test_health.py | 3 | Health/Readiness | Komplett |
| test_pii_sanitizer.py | 9 | PII-Redaktion | Komplett |
| test_rbac.py | 11 | JWT, Rollen, Auth-Endpoints | Gut |
| test_security.py | 8 | Rate-Limiting, Headers | Gut |
| hero-visual.spec.ts | 3 | Visual Regression | Komplett |
| member-management.spec.ts | 9 | Mitglieder-UI, Dashboard | Gut |

---

## 2. Fehlende Tests -- Neue Testdateien

### test_newsletter_flow.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_subscribe_happy_path | Happy | POST /newsletter/subscribe -> 200 | Subscription + DOI-Mail gesendet |
| 2 | test_subscribe_duplicate | Edge | Gleiche Email nochmal | 200 (idempotent) oder 409 |
| 3 | test_subscribe_invalid_email | Failure | Ungueltige Email | 422 |
| 4 | test_confirm_happy_path | Happy | POST /newsletter/confirm mit Token | confirmed=true + CRM-Sync |
| 5 | test_confirm_expired_token | Failure | Token aelter als 48h | 410 Gone |
| 6 | test_confirm_invalid_token | Failure | Falscher Token | 404 |
| 7 | test_confirm_already_confirmed | Idempotenz | Token nochmal verwenden | 200 (kein Fehler) |
| 8 | test_unsubscribe_happy_path | Happy | POST /newsletter/unsubscribe | Geloescht + CRM + Consent-Widerruf |
| 9 | test_unsubscribe_not_found | Failure | Unbekannte Email | 404 |
| 10 | test_status_subscribed | Happy | GET /newsletter/status | subscribed=true |
| 11 | test_status_not_subscribed | Happy | GET /newsletter/status | subscribed=false |
| 12 | test_consent_recorded_on_subscribe | DSGVO | Subscribe -> Consent-Record pruefen | consent_type="marketing", status="granted" |
| 13 | test_consent_revoked_on_unsubscribe | DSGVO | Unsubscribe -> Consent-Record pruefen | consent_type="marketing", status="revoked" |

### test_payment_flow.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_create_stripe_donation | Happy | POST /payments/donate (stripe) | PaymentIntent ID + client_secret |
| 2 | test_stripe_webhook_succeeded | Happy | POST webhook payment_intent.succeeded | Donation recorded + Mail + CRM |
| 3 | test_stripe_webhook_failed | Failure | POST webhook payment_intent.payment_failed | Status updated + Fehler-Mail |
| 4 | test_stripe_webhook_duplicate | Idempotenz | Gleicher Event nochmal | Keine Doppel-Buchung |
| 5 | test_stripe_webhook_invalid_signature | Security | Falsche Signatur | 400 |
| 6 | test_donation_amount_validation | Validation | Betrag <= 0 | 422 |
| 7 | test_donation_currency_validation | Validation | Ungueltige Waehrung | 422 |
| 8 | test_get_donation_status | Happy | GET /payments/donation/{id} | Korrekte Donation-Details |

### test_paypal_flow.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_create_paypal_donation | Happy | POST /payments/donate (paypal) | Order ID |
| 2 | test_paypal_webhook_completed | Happy | CHECKOUT.ORDER.COMPLETED | record_successful_donation |
| 3 | test_paypal_webhook_denied | Failure | PAYMENT.CAPTURE.DENIED | Status=failed |
| 4 | test_paypal_webhook_invalid_signature | Security | Falsche Signatur | 400 |
| 5 | test_paypal_webhook_duplicate | Idempotenz | Gleicher Event nochmal | Keine Doppel-Buchung |

### test_crm_sync.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_upsert_new_contact | Happy | Neuer Contact -> CiviCRM | Contact.create aufgerufen |
| 2 | test_upsert_existing_contact | Happy | Existierender -> Update | Contact.update aufgerufen |
| 3 | test_find_contact_by_email | Happy | Email-Suche | Korrekte Contact-Daten |
| 4 | test_find_contact_not_found | Edge | Unbekannte Email | None |
| 5 | test_ensure_membership_new | Happy | Neues Membership | Membership.create |
| 6 | test_ensure_membership_existing | Idempotenz | Bestehendes Membership | Kein Duplicate |
| 7 | test_create_contribution | Happy | Spende aufzeichnen | Contribution.create |
| 8 | test_newsletter_subscribe_crm | Happy | Newsletter CRM-Sync | GroupContact.create |
| 9 | test_newsletter_unsubscribe_crm | Happy | Abmeldung CRM-Sync | GroupContact.update (Removed) |
| 10 | test_crm_offline_graceful | Failure | CiviCRM nicht erreichbar | None zurueck, kein Crash |

### test_mail_service.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_render_welcome_email | Happy | Template-Rendering | HTML ohne Jinja2-Fehler |
| 2 | test_render_all_templates | Happy | Alle 10+ Templates rendern | Kein TemplateSyntaxError |
| 3 | test_missing_variable_handling | Edge | Fehlende Variable | Graceful (kein Crash) |
| 4 | test_send_template_success | Happy | SMTP Mock -> Senden | True, email_log Entry |
| 5 | test_send_template_smtp_error | Failure | SMTP wirft Exception | Retry 3x -> False |
| 6 | test_send_template_retry_success | Retry | 1. Versuch fail, 2. OK | True nach Retry |
| 7 | test_unknown_template_id | Failure | Unbekanntes Template | KeyError oder False |

### test_consent_flow.py

| # | Testfall | Typ | Beschreibung | Erwartetes Ergebnis |
|---|---------|-----|--------------|---------------------|
| 1 | test_record_consent | Happy | POST /privacy/consent | Consent mit gehashtem IP |
| 2 | test_list_consents | Happy | GET /privacy/consents | Alle Consents fuer Member |
| 3 | test_revoke_consent | Happy | POST /privacy/consent/{id}/revoke | Status=revoked |
| 4 | test_doi_creates_consent | DSGVO | Newsletter-Confirm -> Consent | marketing consent granted |
| 5 | test_unsubscribe_revokes_consent | DSGVO | Unsubscribe -> Consent | marketing consent revoked |
| 6 | test_data_export_request | Happy | POST /privacy/export | Export queued |
| 7 | test_data_deletion_request | Happy | POST /privacy/delete | Deletion queued |
| 8 | test_consent_ip_hashed | DSGVO | IP-Adresse nicht im Klartext | SHA256-Hash gespeichert |

---

## 3. Test-Abdeckungsmatrix

| Bereich | Bestehend | Geplant | Ziel-Abdeckung |
|---------|-----------|---------|----------------|
| Health/Readiness | 3 | -- | 100% |
| PII-Sanitizer | 9 | -- | 100% |
| RBAC/Auth | 11 | -- | 80% |
| Security | 8 | -- | 80% |
| Newsletter | 0 | 13 | 90% |
| Stripe Payments | 0 | 8 | 85% |
| PayPal Payments | 0 | 5 | 80% |
| CRM Integration | 0 | 10 | 85% |
| Mail Service | 0 | 7 | 80% |
| Consent/DSGVO | 0 | 8 | 90% |
| **Gesamt** | **31** | **+51** | **~82 Tests** |

---

## 4. Test-Infrastruktur

| Tool | Zweck | Konfiguration |
|------|-------|---------------|
| pytest | Python Unit/Integration | apps/api/tests/ |
| Playwright | E2E Browser-Tests | tests/e2e/, playwright.config.js |
| Vitest | Frontend Unit-Tests | apps/website/vitest.config.ts (noch leer) |
| httpx/TestClient | FastAPI-Tests | conftest.py mit Mocked DB |

---

## 5. Mock-Strategie

| Externe Abhaengigkeit | Mock-Ansatz |
|------------------------|-------------|
| PostgreSQL | asyncpg Mocks in conftest.py |
| CiviCRM | Mock CiviCRMService._request() |
| Stripe | Mock stripe.PaymentIntent.create(), Webhook-Signatur generieren |
| PayPal | Mock PayPal API-Calls, Webhook-Signatur |
| SMTP | Mock smtplib.SMTP |
| n8n | Nicht in Unit-Tests (separate Workflow-Tests) |

---

## 6. Priorisierung der neuen Tests

**Sofort (mit Phase 3):**
- test_newsletter_flow.py -- Kernfunktionalitaet + DSGVO-Compliance
- test_consent_flow.py -- DSGVO-Pflicht

**Danach (mit Phase 4):**
- test_payment_flow.py -- Finanzielle Korrektheit
- test_paypal_flow.py -- Zweiter Payment-Provider

**Abschliessend:**
- test_crm_sync.py -- Integration mit externem System
- test_mail_service.py -- Benachrichtigungs-Zuverlaessigkeit

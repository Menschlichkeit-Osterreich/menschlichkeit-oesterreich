# Backend Flow Matrix

**Projekt:** Menschlichkeit Österreich
**Datum:** 2026-03-22

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Flow komplett implementiert |
| ⚠️ | Flow implementiert, aber mit Lücken |
| ❌ | Flow fehlt oder ist nur Stub |

---

## 1. Benutzer-Registrierung ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/auth/register` | Benutzer sendet email, password, first_name, last_name |
| Validierung | `schemas/auth.py` (Pydantic) | Email-Format, Passwort-Stärke, Pflichtfelder |
| Persistenz | `INSERT INTO members` | Passwort mit bcrypt gehasht, verified_at=NULL |
| CRM-Sync | `CrmFacade.upsert_contact()` | Optional — nur wenn CiviCRM-Credentials gesetzt |
| n8n-Automation | `onboarding-welcome-series` | Day 0/3/7 Willkommens-Serie (falls aktiviert) |
| Email | `welcome_email` Template | An Benutzer: Willkommen + Verifizierungs-Link |
| Fehlerfall | HTTP 409 Conflict | Wenn Email bereits existiert |

---

## 2. Login ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/auth/login` | Benutzer sendet email, password |
| Validierung | `services/auth_service.py` | Email-Lookup, bcrypt-Verify gegen gespeicherten Hash |
| Persistenz | Session/Token-Erstellung | JWT Access-Token + Refresh-Token generiert |
| CRM-Sync | — | Kein CRM-Sync beim Login |
| n8n-Automation | — | — |
| Email | — | Keine Email beim Login |
| Fehlerfall | HTTP 401 Unauthorized | Falsche Credentials, Account nicht verifiziert |

---

## 3. Password-Reset ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/auth/password-reset` | Benutzer sendet email |
| Validierung | `routers/auth.py` | Prüft ob Email in members existiert |
| Persistenz | Token in DB gespeichert | Reset-Token mit Ablaufdatum generiert |
| CRM-Sync | — | — |
| n8n-Automation | — | — |
| Email | `password_reset_email` Template | Link mit Reset-Token an Benutzer |
| Bestätigung | `POST /api/auth/password-reset/confirm` | Token + neues Passwort → Update password_hash |
| Fehlerfall | Stilles Ignorieren | Wenn Email nicht existiert (Sicherheit: kein Email-Enumeration) |

---

## 4. Email-Verifizierung ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/auth/verify` | Benutzer klickt Verifizierungs-Link mit Token |
| Validierung | `routers/auth.py` | Token-Gültigkeit prüfen |
| Persistenz | `UPDATE members SET verified_at = NOW()` | Account als verifiziert markieren |
| CRM-Sync | — | — |
| n8n-Automation | — | — |
| Email | `verify_email` Template | Bestätigungsmail nach erfolgreicher Verifizierung |
| Fehlerfall | HTTP 400 Bad Request | Ungültiger oder abgelaufener Token |

---

## 5. Newsletter-Anmeldung (DOI) ⚠️

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/newsletter/subscribe` | Benutzer sendet email, optional name |
| Validierung | `schemas/newsletter.py` | Email-Format |
| Persistenz | `INSERT INTO newsletter_subscriptions` | confirmed=false, DOI-Token generiert |
| CRM-Sync | — | Noch nicht — erst nach Bestätigung |
| n8n-Automation | — | — |
| Email | `newsletter_doi` Template | DOI-Link an Benutzer |
| Bestätigung | `GET /api/newsletter/confirm?token=...` | Token prüfen → `UPDATE confirmed=true` |
| CRM-Sync (nach Bestätigung) | `CrmFacade.set_newsletter_subscription()` | Contact in Newsletter-Gruppe hinzufügen |
| Email (nach Bestätigung) | `newsletter_confirmed` Template | Willkommen im Newsletter |
| Fehlerfall | HTTP 409 Conflict | Wenn Email bereits subscribed |
| ⚠️ Lücke | DOI-Token ohne Ablaufdatum | Token ist unbegrenzt gültig — sollte 48h TTL haben |
| ⚠️ Lücke | Kein Opt-Out-Link | Marketing-Mails (newsletter_doi, newsletter_confirmed) ohne DSGVO-Pflicht-Opt-Out |

---

## 6. Newsletter-Abmeldung ⚠️

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/newsletter/unsubscribe` | Benutzer sendet email oder Token |
| Validierung | `routers/newsletter.py` | Subscription-Existenz prüfen |
| Persistenz | `DELETE FROM newsletter_subscriptions` | Subscription entfernen |
| CRM-Sync | `CrmFacade.set_newsletter_subscription(subscribed=False)` | GroupContact status="Removed" |
| n8n-Automation | — | — |
| Email | `newsletter_unsubscribed` Template | Abmeldebestätigung |
| Fehlerfall | HTTP 404 Not Found | Wenn Subscription nicht existiert |
| ⚠️ Lücke | Kein Consent-Widerruf | Unsubscribe zeichnet keinen `consent_records`-Eintrag auf — DSGVO-relevant |

---

## 7. Kontaktformular ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/contact` | Benutzer sendet name, email, subject, message |
| Validierung | `schemas/contact.py` | Pflichtfelder, Email-Format, Spam-Schutz |
| Persistenz | `INSERT INTO contact_messages` | Nachricht gespeichert mit Zeitstempel |
| CRM-Sync | — | — |
| n8n-Automation | — | — |
| Email (an Benutzer) | `contact_confirmation` Template | Eingangsbestätigung an Absender |
| Email (an Admin) | `admin_alert` Template | Benachrichtigung an Admin-Team |
| Fehlerfall | HTTP 422 Unprocessable Entity | Validierungsfehler |

---

## 8. Stripe-Spende (Erfolg) ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/payments/donate` | Benutzer wählt Betrag, Payment-Method=stripe |
| Validierung | `schemas/payments.py` | Betrag > 0, gültige Währung (EUR) |
| Persistenz (Intent) | Stripe API `PaymentIntent.create()` | client_secret an Frontend zurückgegeben |
| Frontend | Stripe Elements / Checkout | Benutzer gibt Kartendaten ein, bestätigt |
| Webhook | `POST /api/payments/stripe-webhook` | Event `payment_intent.succeeded` empfangen |
| Validierung (Webhook) | Stripe Signature Verification | `stripe.Webhook.construct_event()` |
| Persistenz (Donation) | `record_successful_donation()` | `INSERT INTO donations` mit Stripe-Referenz |
| CRM-Sync | `CrmFacade.create_contribution()` | Contribution in CiviCRM anlegen (type="Donation", status="Completed") |
| Email | `donation_success` Template | Spendenbestätigung mit Betrag an Spender |
| Fehlerfall | Webhook Retry (Stripe) | Stripe wiederholt fehlgeschlagene Webhooks automatisch |

---

## 9. Stripe-Spende (Fehlgeschlagen) ❌

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | Stripe Webhook | Event `payment_intent.payment_failed` |
| Validierung | — | — |
| Persistenz | — | — |
| CRM-Sync | — | — |
| Email | — | — |
| ❌ Lücke | Kein Handler implementiert | Event wird empfangen, aber nicht verarbeitet |
| ❌ Lücke | Kein Template | `donation_failed` Template existiert nicht |
| ❌ Lücke | Keine Benachrichtigung | Spender erfährt nicht, dass Zahlung fehlgeschlagen ist |

---

## 10. PayPal-Spende ⚠️

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/payments/donate` | Benutzer wählt Payment-Method=paypal |
| Validierung | `schemas/payments.py` | Betrag > 0, gültige Währung (EUR) |
| PayPal Order | PayPal API `Orders.create()` | Order-ID an Frontend zurückgegeben |
| Frontend | PayPal SDK Buttons | Benutzer autorisiert in PayPal-Popup |
| Capture | PayPal API `Orders.capture()` | Zahlung eingezogen |
| Persistenz | `record_successful_donation()` | Donation in DB gespeichert |
| CRM-Sync | `CrmFacade.create_contribution()` | Contribution in CiviCRM |
| Email | `donation_success` Template | Spendenbestätigung |
| Webhook | `POST /api/payments/paypal-webhook` | PayPal IPN/Webhook Events |
| ⚠️ Lücke | Webhook nur Logging | Events werden geloggt, aber nicht verarbeitet — kein `record_successful_donation` im Webhook-Pfad |
| ⚠️ Lücke | Kein Signature-Verify | PayPal-Webhook-Signatur wird nicht verifiziert |

---

## 11. Mitgliedsantrag ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/auth/register` | Mit zusätzlichem Feld `membership_key` |
| Validierung | `schemas/auth.py` | Wie Registrierung + gültiger membership_key |
| Persistenz | `INSERT INTO members` | Member mit membership_type erstellt |
| CRM-Sync | `CrmFacade.upsert_contact()` | Contact in CiviCRM anlegen/aktualisieren |
| CRM-Sync | `CrmFacade.ensure_membership()` | Membership in CiviCRM erstellen (type via CIVICRM_MEMBERSHIP_TYPE_MAP) |
| n8n-Automation | `onboarding-welcome-series` | Willkommens-Serie für neue Mitglieder |
| Email | `membership_received` Template | Bestätigung des Mitgliedsantrags |
| Fehlerfall | HTTP 409 Conflict | Email bereits registriert |

---

## 12. Rechnungserstellung ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/finance/invoices` | Admin erstellt Rechnung (member_id, items, due_date) |
| Validierung | `schemas/finance.py` | Pflichtfelder, Beträge, gültige Member-ID |
| Persistenz | `INSERT INTO invoices + invoice_items` | Rechnung mit Positionen gespeichert |
| CRM-Sync | — | Rechnungen werden nicht ins CRM synchronisiert |
| n8n-Automation | — | — |
| Email | `invoice_email` Template | Rechnung als Email an Mitglied |
| Fehlerfall | HTTP 404 Not Found | Wenn Member nicht existiert |

---

## 13. Mahnlauf ⚠️

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/finance/dunning/run` | Admin startet Mahnlauf (oder n8n-Cronjob) |
| Validierung | `services/finance_service.py` | Fällige Rechnungen identifizieren (due_date < today) |
| Persistenz | `INSERT INTO dunning_runs + dunning_entries` | Mahnlauf mit Stufe pro Rechnung |
| CRM-Sync | — | — |
| n8n-Automation | `finance-dunning-automation` | Automatischer wöchentlicher Mahnlauf |
| Email | `dunning_email` Template (3 Stufen) | Stufe 1: Erinnerung, Stufe 2: Mahnung, Stufe 3: Letzte Mahnung |
| Fehlerfall | Keine offenen Rechnungen | Leerer Lauf, kein Fehler |
| ⚠️ Lücke | PDF-Template ist Stub | `dunning.html` Template nicht fertig gestaltet |

---

## 14. SEPA-Export ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `GET /api/finance/sepa/collectible` | Admin listet einziehbare Beträge |
| Validierung | `services/finance_service.py` | IBAN-Validierung, Mandats-Prüfung |
| Export | `POST /api/finance/sepa/export-batch` | PAIN.008 XML generieren |
| Persistenz | Batch-Status in DB | Export-Batch mit Status tracking |
| CRM-Sync | — | — |
| Email | — | — |
| Fehlerfall | HTTP 400 Bad Request | Keine einziehbaren Beträge oder ungültige IBANs |

---

## 15. DSGVO Datenexport ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/privacy/export` | Benutzer oder Admin fordert Datenexport an |
| Validierung | `routers/privacy.py` | Authentifizierung, Berechtigungsprüfung |
| Persistenz | Export-Request in Queue | Status: pending → processing → completed |
| Datensammlung | Alle personenbezogenen Daten | Members, Donations, Consents, Newsletter, Contact-Messages |
| Format | ZIP-Archiv | JSON-Dateien pro Datenkategorie |
| CRM-Sync | — | CiviCRM-Daten werden mit exportiert (falls verfügbar) |
| n8n-Automation | `gdpr-data-export` | Asynchrone Verarbeitung |
| Email | Benachrichtigung mit Download-Link | Nach Fertigstellung |
| Fehlerfall | Timeout bei großen Datenmengen | Job-Status bleibt auf "processing" |

---

## 16. DSGVO Datenlöschung ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/privacy/delete` | Benutzer oder Admin fordert Löschung an |
| Validierung | `routers/privacy.py` | Authentifizierung, doppelte Bestätigung |
| Persistenz | Lösch-Request in Queue | Alle PII werden gelöscht/anonymisiert |
| CRM-Sync | `CrmFacade.delete_contact()` | Contact in CiviCRM löschen |
| n8n-Automation | `right-to-erasure` | Orchestriert Löschung über alle Systeme |
| Email | Löschbestätigung | Letzte Email vor Account-Löschung |
| Fehlerfall | CiviCRM nicht erreichbar | Lokale Löschung erfolgt, CRM-Löschung in Retry-Queue |
| ⚠️ Hinweis | 3 n8n-Varianten | right-to-erasure, right-to-erasure-fixed, right-to-erasure-minimal — bereinigen |

---

## 17. Consent-Aufzeichnung ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/privacy/consent` | Bei jeder datenschutzrelevanten Aktion |
| Validierung | `schemas/privacy.py` | consent_type, purpose, granted (bool) |
| Persistenz | `INSERT INTO consent_records` | IP und User-Agent gehasht gespeichert |
| CRM-Sync | — | — |
| n8n-Automation | — | — |
| Email | — | Kein Email bei Consent-Aufzeichnung |
| Fehlerfall | HTTP 422 | Ungültige Consent-Daten |

---

## 18. Forum-Thread erstellen ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/forum/threads` | Authentifizierter Benutzer erstellt Thread |
| Validierung | `schemas/forum.py` | Titel, Inhalt, Kategorie, RBAC-Prüfung |
| Persistenz | `INSERT INTO forum_threads` | Thread mit author_id, created_at |
| CRM-Sync | — | — |
| n8n-Automation | `forum-moderation` | Automatische Inhaltsprüfung (optional) |
| Email | — | Keine Email bei Thread-Erstellung |
| Fehlerfall | HTTP 403 Forbidden | Fehlende Berechtigung |

---

## 19. Event-RSVP ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/events/{id}/rsvp` | Benutzer meldet sich für Event an |
| Validierung | `schemas/events.py` | Event existiert, nicht voll, nicht vergangen |
| Persistenz | `INSERT INTO event_rsvps` | member_id, event_id, status |
| CRM-Sync | — | — |
| n8n-Automation | `events-reminder` | Erinnerungs-Email vor Event-Datum |
| Email | — | Bestätigung der Anmeldung |
| Fehlerfall | HTTP 409 Conflict | Bereits angemeldet |

---

## 20. Blog-Post erstellen ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `POST /api/blog/posts` | Admin/Moderator erstellt Beitrag |
| Validierung | `schemas/blog.py` | Titel, Inhalt, Kategorie, RBAC (MODERATOR+) |
| Persistenz | `INSERT INTO blog_posts` | Post mit author_id, published_at |
| CRM-Sync | — | — |
| n8n-Automation | `social-media-crosspost` | Automatisches Teilen auf Social Media |
| Email | — | Optional: Newsletter-Benachrichtigung |
| Fehlerfall | HTTP 403 Forbidden | Fehlende Berechtigung |

---

## 21. Admin CRM-Dashboard ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `GET /api/admin/crm/dashboard` | Admin öffnet CRM-Dashboard |
| Validierung | RBAC | Nur ADMIN und SYSADMIN |
| Datenquellen | PostgreSQL + CiviCRM | Aggregierte KPIs aus beiden Systemen |
| Persistenz | — | Read-Only, keine Schreiboperationen |
| CRM-Sync | `AdminCrmService` | Live-Abfrage an CiviCRM, Fallback auf lokale DB |
| n8n-Automation | — | — |
| Email | — | — |
| Fehlerfall | CiviCRM offline | Fallback auf lokale Member-Datenbank |

---

## 22. Metrics KPI ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | `GET /api/metrics/kpis` | Admin/Dashboard-Zugriff |
| Validierung | RBAC | Authentifizierter Benutzer (ADMIN+) |
| Datenquellen | PostgreSQL | members, donations, invoices, newsletter_subscriptions |
| Aggregation | `services/metrics_service.py` | Mitgliederzahl, Spendensumme, Burn Rate, Churn Rate |
| CRM-Sync | — | Rein lokale Berechnung |
| n8n-Automation | `monitoring-kpi-report` | Wöchentlicher KPI-Report per Email |
| Email | — | Nur über n8n-Automation |
| Fehlerfall | HTTP 500 | Bei DB-Verbindungsproblemen |

---

## 23. n8n Member-Sync ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | n8n Workflow `crm-sync-members` | Cron-basiert (täglich) oder manuell |
| Datenquelle | `GET /api/admin/members` | Alle aktiven Mitglieder aus PostgreSQL |
| Verarbeitung | n8n Function Node | Daten-Mapping: internes Schema → CiviCRM-Format |
| CRM-Sync | CiviCRM APIv4 `Contact.create/update` | Upsert basierend auf Email-Adresse |
| Persistenz | n8n Execution Log | Erfolg/Fehler pro Kontakt geloggt |
| Email | — | Nur bei Fehlern: Admin-Benachrichtigung |
| Fehlerfall | CiviCRM-API-Fehler | n8n Retry (3x), dann Error-Notification |

---

## 24. n8n Onboarding Welcome-Serie ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | n8n Workflow `onboarding-welcome-series` | Ausgelöst nach Registrierung (Webhook oder Cron) |
| Tag 0 | Email: Willkommen | Erste Willkommens-Email mit Plattform-Einführung |
| Tag 3 | Email: Funktionen | Vorstellung der Plattform-Features |
| Tag 7 | Email: Engagement | Einladung zu Veranstaltungen, Forum, Newsletter |
| Persistenz | n8n Execution Log | Status jeder Email geloggt |
| CRM-Sync | — | — |
| Fehlerfall | Email-Versand fehlgeschlagen | n8n markiert Step als failed, kein Retry |

---

## 25. Social Media Crosspost ✅

| Schritt | Komponente | Detail |
|---------|-----------|--------|
| Trigger | n8n Workflow `social-media-crosspost` | Ausgelöst bei neuem Blog-Post (Webhook) |
| Verarbeitung | n8n Function Node | Titel, Excerpt, Bild extrahieren, plattformspezifisch formatieren |
| Instagram | Instagram Graph API | Bild-Post mit Caption |
| Facebook | Facebook Pages API | Link-Post mit Preview |
| X (Twitter) | X API v2 | Tweet mit Link |
| LinkedIn | LinkedIn API | Artikel-Post |
| Persistenz | n8n Execution Log | Post-IDs und Status pro Plattform |
| Fehlerfall | API-Rate-Limit oder Auth-Fehler | n8n Retry, Admin-Notification bei dauerhaftem Fehler |

---

## Zusammenfassung der Flow-Status

| # | Flow | Status |
|---|------|--------|
| 1 | Benutzer-Registrierung | ✅ Komplett |
| 2 | Login | ✅ Komplett |
| 3 | Password-Reset | ✅ Komplett |
| 4 | Email-Verifizierung | ✅ Komplett |
| 5 | Newsletter-Anmeldung (DOI) | ⚠️ Lücke: Token-Ablauf, Opt-Out |
| 6 | Newsletter-Abmeldung | ⚠️ Lücke: Kein Consent-Widerruf |
| 7 | Kontaktformular | ✅ Komplett |
| 8 | Stripe-Spende (Erfolg) | ✅ Komplett |
| 9 | Stripe-Spende (Fehlgeschlagen) | ❌ Fehlt komplett |
| 10 | PayPal-Spende | ⚠️ Lücke: Webhook nicht verarbeitet |
| 11 | Mitgliedsantrag | ✅ Komplett |
| 12 | Rechnungserstellung | ✅ Komplett |
| 13 | Mahnlauf | ⚠️ Lücke: PDF-Template Stub |
| 14 | SEPA-Export | ✅ Komplett |
| 15 | DSGVO Datenexport | ✅ Komplett |
| 16 | DSGVO Datenlöschung | ✅ Komplett |
| 17 | Consent-Aufzeichnung | ✅ Komplett |
| 18 | Forum-Thread erstellen | ✅ Komplett |
| 19 | Event-RSVP | ✅ Komplett |
| 20 | Blog-Post erstellen | ✅ Komplett |
| 21 | Admin CRM-Dashboard | ✅ Komplett |
| 22 | Metrics KPI | ✅ Komplett |
| 23 | n8n Member-Sync | ✅ Komplett |
| 24 | n8n Onboarding Welcome-Serie | ✅ Komplett |
| 25 | Social Media Crosspost | ✅ Komplett |

**Gesamt:** 18 komplett, 4 mit Lücken, 1 fehlend (Stripe-Failed), 2 mit Hinweisen

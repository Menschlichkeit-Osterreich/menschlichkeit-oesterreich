# File-by-File Change Plan
**Projekt:** Menschlichkeit Österreich
**Datum:** 2026-03-22

---

## Legende

- NEW -- Neue Datei
- MOD -- Modifizierte Datei
- DEL -- Geloeschte Datei
- DONE -- Bereits erledigt (Phase 0)

---

## Phase 0: Branding (ABGESCHLOSSEN)

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| DONE MOD | `apps/website/index.html` | theme-color, Favicon-Links, Schema.org, OG-Dimensionen |
| DONE NEW | `apps/website/public/favicon.svg` | SVG-Favicon (Baum-Icon) |
| DONE MOD | `apps/website/public/favicon.ico` | Ersetzt durch korrektes Baum-Icon |
| DONE NEW | `apps/website/public/apple-touch-icon.png` | 180x180 Baum auf Orange |
| DONE NEW | `apps/website/public/icon-192.png` | PWA-Icon 192x192 |
| DONE NEW | `apps/website/public/icon-512.png` | PWA-Icon 512x512 |
| DONE NEW | `apps/website/public/site.webmanifest` | PWA-Manifest |
| DONE MOD | `apps/website/public/images/og-default.jpg` | Neues OG-Image (1200x630) |

---

## Phase 1: Email-Designsystem

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| NEW | `apps/api/src/notifications/templates/_base.html` | Jinja2-Base mit Header, Content-Block, DSGVO-Footer |
| MOD | `apps/api/src/notifications/templates/verify_email.html` | Stub -> extends _base, CTA-Button fuer Verifizierung |
| MOD | `apps/api/src/notifications/templates/newsletter_doi.html` | Stub -> extends _base, DOI-Link, Opt-Out-Hinweis |
| MOD | `apps/api/src/notifications/templates/newsletter_confirmed.html` | Stub -> extends _base, Willkommen, Abmelde-Link |
| MOD | `apps/api/src/notifications/templates/newsletter_unsubscribed.html` | Stub -> extends _base, Bestaetigung, Re-Subscribe |
| MOD | `apps/api/src/notifications/templates/password_reset_email.html` | Stub -> extends _base, Reset-Link, Gueltigkeitsdauer |
| MOD | `apps/api/src/notifications/templates/contact_confirmation.html` | Stub -> extends _base, Betreff-Referenz |
| MOD | `apps/api/src/notifications/templates/admin_alert.html` | Stub -> extends _base, Kontext-Infos |
| MOD | `apps/api/src/notifications/templates/membership_received.html` | Stub -> extends _base, naechste Schritte |

---

## Phase 2: Template-Konsolidierung

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| MOD | `apps/api/src/notifications/templates/welcome_email.html` | Auf Base umstellen, Farben Brand-konform |
| MOD | `apps/api/src/notifications/templates/donation_thank_you_email.html` | Lila -> Brand-Farben, Base-Template |
| MOD | `apps/api/src/notifications/templates/invoice_email.html` | Footer standardisieren, Farben anpassen |
| MOD | `apps/api/src/notifications/templates/dunning_email.html` | Footer standardisieren |
| NEW | `apps/api/src/notifications/templates/donation_failed.html` | Freundliche Fehlermeldung |
| NEW | `apps/api/src/notifications/templates/recurring_donation_problem.html` | Abo-Problem-Info |
| NEW | `apps/api/src/notifications/templates/admin_new_donation.html` | Admin: Neue Spende |
| NEW | `apps/api/src/notifications/templates/admin_new_registration.html` | Admin: Registrierung |
| NEW | `apps/api/src/notifications/templates/opt_out_confirmed.html` | Opt-Out-Bestaetigung |
| MOD | `apps/api/app/services/mail_service.py` | 5 neue Templates registrieren |

---

## Phase 3: Backend-Fixes

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| MOD | `apps/api/app/routers/payments.py` | PayPal-Webhook vervollstaendigen, Stripe-Failed, Recurring-Grundgeruest |
| MOD | `apps/api/app/routers/newsletter.py` | Consent-Widerruf bei Unsubscribe, DOI-Token-Ablauf (48h) |
| MOD | `apps/api/app/services/mail_service.py` | Retry-Logik (3 Versuche, exp. Backoff) |

---

## Phase 4: Tests

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| NEW | `apps/api/tests/test_newsletter_flow.py` | Subscribe -> DOI -> Confirm -> Unsubscribe (Happy+Failure) |
| NEW | `apps/api/tests/test_payment_flow.py` | Stripe Intent -> Webhook (succeeded, failed, duplicate) |
| NEW | `apps/api/tests/test_paypal_flow.py` | Order -> Capture -> Webhook |
| NEW | `apps/api/tests/test_crm_sync.py` | Upsert Contact, Membership, Contribution (Mock CiviCRM) |
| NEW | `apps/api/tests/test_mail_service.py` | Template Rendering, SMTP-Fehler, Retry |
| NEW | `apps/api/tests/test_consent_flow.py` | Grant -> List -> Revoke, DOI-Consent, Marketing-Consent |

---

## Phase 5: n8n-Konsolidierung

| Aktion | Datei | Aenderung |
|--------|-------|-----------|
| DEL | `automation/n8n/right-to-erasure.json` | Original loeschen (inactive) |
| DEL | `automation/n8n/right-to-erasure-minimal.json` | Minimal loeschen (unsicher) |
| MOD | `automation/n8n/right-to-erasure-fixed.json` | Beibehalten als Haupt-Workflow |

---

## Zusammenfassung

| Kategorie | Neu | Modifiziert | Geloescht | Total |
|-----------|-----|-------------|-----------|-------|
| Phase 0 (DONE) | 5 | 3 | 0 | 8 |
| Phase 1 | 1 | 8 | 0 | 9 |
| Phase 2 | 5 | 5 | 0 | 10 |
| Phase 3 | 0 | 3 | 0 | 3 |
| Phase 4 | 6 | 0 | 0 | 6 |
| Phase 5 | 0 | 1 | 2 | 3 |
| **Gesamt** | **17** | **20** | **2** | **39** |

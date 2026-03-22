# Implementation Roadmap
**Projekt:** Menschlichkeit Österreich
**Datum:** 2026-03-22
**Ziel:** Produktionsreife des Backend & Automationsstacks

---

## Phase 0: Branding-Grundlagen (ABGESCHLOSSEN)

- [x] theme-color korrigiert (#D84A1B)
- [x] SVG-Favicon erstellt (Baum-Icon)
- [x] ICO-Favicon generiert
- [x] apple-touch-icon erstellt (180x180)
- [x] PWA-Icons + site.webmanifest erstellt
- [x] OG-Image neu erstellt (1200x630, korrektes Branding)
- [x] Schema.org Logo-Referenz korrigiert
- [x] index.html Head-Sektion vervollstaendigt

---

## Phase 1: Email-Designsystem (P0)

**Geschaetzte Dateien:** 2 neu, 7 modifiziert
**Abhaengigkeiten:** Keine
**Blockiert:** Phase 2

| # | Aufgabe | Dateien | Beschreibung |
|---|---------|---------|--------------|
| 1.1 | Base-Template erstellen | `_base.html` (neu) | Jinja2-Vererbung, Brand-Farben, DSGVO-Footer |
| 1.2 | email_config.py aktualisieren | `email_config.py` | Farben aktualisieren, Vereinsadresse |
| 1.3 | verify_email.html upgraden | `verify_email.html` | Stub -> Base-Template + CTA-Button |
| 1.4 | newsletter_doi.html upgraden | `newsletter_doi.html` | + Opt-Out-Hinweis (DSGVO!) |
| 1.5 | newsletter_confirmed.html upgraden | `newsletter_confirmed.html` | + Abmelde-Link |
| 1.6 | newsletter_unsubscribed.html upgraden | `newsletter_unsubscribed.html` | + Re-Subscribe-Option |
| 1.7 | password_reset_email.html upgraden | `password_reset_email.html` | + Gueltigkeitsdauer |
| 1.8 | contact_confirmation.html upgraden | `contact_confirmation.html` | + Betreff-Referenz |
| 1.9 | admin_alert.html upgraden | `admin_alert.html` | Internes Template mit Kontext |
| 1.10 | membership_received.html upgraden | `membership_received.html` | + naechste Schritte |

---

## Phase 2: Template-Konsolidierung (P0/P1)

**Geschaetzte Dateien:** 5 neu, 4 modifiziert
**Abhaengigkeiten:** Phase 1 (Base-Template)

| # | Aufgabe | Dateien | Beschreibung |
|---|---------|---------|--------------|
| 2.1 | welcome_email.html auf Base umstellen | `welcome_email.html` | Farben: Blau -> Brand, Footer standardisieren |
| 2.2 | donation_thank_you_email.html anpassen | `donation_thank_you_email.html` | Farben: Lila -> Brand-Orange/Blau |
| 2.3 | invoice_email.html angleichen | `invoice_email.html` | Farben pruefen (#1a4a6e -> #1B4965) |
| 2.4 | dunning_email.html angleichen | `dunning_email.html` | Eskalationsfarben OK, Footer standardisieren |
| 2.5 | donation_failed.html erstellen | `donation_failed.html` (neu) | Freundliche Fehlermeldung + Retry |
| 2.6 | recurring_donation_problem.html | `recurring_donation_problem.html` (neu) | Problem mit Abo-Spende |
| 2.7 | admin_new_donation.html | `admin_new_donation.html` (neu) | Admin: Neue Spende Info |
| 2.8 | admin_new_registration.html | `admin_new_registration.html` (neu) | Admin: Neue Registrierung |
| 2.9 | opt_out_confirmed.html | `opt_out_confirmed.html` (neu) | Bestaetigung der Abmeldung |

---

## Phase 3: Kritische Backend-Fixes (P1)

**Geschaetzte Dateien:** 3 modifiziert
**Abhaengigkeiten:** Keine (parallel zu Phase 2 moeglich)

| # | Aufgabe | Dateien | Beschreibung |
|---|---------|---------|--------------|
| 3.1 | PayPal-Webhook vervollstaendigen | `routers/payments.py` | CHECKOUT.ORDER.COMPLETED -> record_successful_donation |
| 3.2 | Newsletter Consent-Widerruf | `routers/newsletter.py` | Unsubscribe -> privacy_service.record_consent(status="revoked") |
| 3.3 | DOI-Token-Ablauf (48h) | `routers/newsletter.py` | token_created_at Spalte + Ablaufpruefung |
| 3.4 | Stripe failed-Payment | `routers/payments.py` | payment_intent.payment_failed Handler + Mail |
| 3.5 | Mail-Service Retry | `services/mail_service.py` | 3 Versuche + exponentielles Backoff |
| 3.6 | Recurring Donations | `routers/payments.py` | Stripe subscription Webhook-Grundgeruest |

---

## Phase 4: Tests (P1)

**Geschaetzte Dateien:** 6 neu

| # | Aufgabe | Dateien | Beschreibung |
|---|---------|---------|--------------|
| 4.1 | Newsletter-Flow Tests | `test_newsletter_flow.py` | Subscribe -> DOI -> Confirm -> Unsubscribe |
| 4.2 | Payment-Flow Tests | `test_payment_flow.py` | Stripe Intent -> Webhook (success+fail) |
| 4.3 | PayPal-Flow Tests | `test_paypal_flow.py` | Order -> Capture -> Webhook |
| 4.4 | CRM-Sync Tests | `test_crm_sync.py` | Upsert, Membership, Contribution (Mock) |
| 4.5 | Mail-Service Tests | `test_mail_service.py` | Template Rendering, SMTP-Fehler |
| 4.6 | Consent-Flow Tests | `test_consent_flow.py` | Grant -> List -> Revoke, DOI-Consent |

---

## Phase 5: n8n-Audit (P2)

**Geschaetzte Dateien:** 3 geloescht, 1 modifiziert

| # | Aufgabe | Dateien | Beschreibung |
|---|---------|---------|--------------|
| 5.1 | right-to-erasure konsolidieren | 3 JSON -> 1 | Nur -fixed behalten |
| 5.2 | Error-Handling vereinheitlichen | Alle 25 JSONs | Slack + Email Fallback |
| 5.3 | Webhook-Security pruefen | Alle Webhook-Workflows | Signatur-Validierung |
| 5.4 | Dokumentation erstellen | README.md (neu) | Workflow-Beschreibungen |

---

## Abhaengigkeitsgraph

```
Phase 0 (ABGESCHLOSSEN)
  |
  v
Phase 1 (Email-Design) ----> Phase 2 (Templates)
  |                             |
  v                             v
Phase 3 (Backend-Fixes) ----> Phase 4 (Tests)
                                |
                                v
                             Phase 5 (n8n)
```

### Zeitschaetzung

| Phase | Aufwand | Abhaengigkeit |
|-------|---------|---------------|
| Phase 0 | ABGESCHLOSSEN | -- |
| Phase 1 | 2-3 Tage | Keine |
| Phase 2 | 2-3 Tage | Phase 1 |
| Phase 3 | 3-4 Tage | Keine (parallel zu Phase 2) |
| Phase 4 | 3-4 Tage | Phase 1-3 |
| Phase 5 | 1-2 Tage | Phase 4 |
| **Gesamt** | **~11-16 Tage** | |

# BACKEND_FLOW_MATRIX

| Flow | Trigger | Persistenz | CRM-Aktion | n8n-Aktion | Mail-Aktion | Fehlerpfad | Statusmodell |
|---|---|---|---|---|---|---|---|
| Registrierung | `POST /api/auth/register` | `members`, `consent_records`, `member_sessions` | Kontakt-Upsert, optionale Membership per internem Sync | optional Welcome-/Follow-up-Orchestrierung | `verify_email` | Validierungsfehler, doppelte E-Mail, CRM-Ausfall fallbackfähig | `pending_verification`, `active`, `cancelled` |
| Login | `POST /api/auth/login` | `members.last_login_at`, `member_sessions` | keine | keine | keine | falsche Credentials, 2FA erforderlich | Session aktiv/revoked |
| Refresh | `POST /api/auth/refresh` | `member_sessions` | keine | keine | keine | ungültiger/revoked Refresh Token | rotierte Session |
| Passwort Reset | `POST /api/auth/password-reset-request`, `/confirm` | `password_reset_tokens` | keine | keine | `password_reset` | unbekannte Adresse, Token abgelaufen | requested, used |
| E-Mail-Verifikation | `POST /api/auth/verify-email` | `members.is_email_verified`, `member_sessions` | Kontakt kann später synchronisiert werden | optional | `verify_email` / Welcome später | Token ungültig | verified |
| Mitglied werden | Website `Join.tsx` -> Auth/API | `members`, `consent_records`, `newsletter_subscriptions` optional | Kontakt-Upsert, Membership via internal sync | möglich für Invoice/SEPA | `membership_received`, `verify_email` | Payment offen, CRM down, Mail down | `pending_review`, `pending_payment`, `active` |
| Kontaktformular | `POST /api/contact/submit` | `contact_submissions`, `consent_records`, optional `newsletter_subscriptions` | Kontakt-Upsert | optional Admin-Weiterverarbeitung | `contact_confirmation`, ggf. DOI | fehlender Privacy-Consent, CRM-Ausfall | submitted |
| Newsletter Anmeldung | `POST /api/newsletter/subscribe` | `newsletter_subscriptions` | noch nicht vor DOI | möglich | `newsletter_doi` | fehlender Consent, doppelte Anmeldung | `pending_confirmation` |
| DOI Bestätigung | `GET /api/newsletter/confirm` | `newsletter_subscriptions`, `consent_records` | Kontakt-Upsert, Gruppenzuordnung | möglich | `newsletter_confirmed` | ungültiger Token, CRM-Fehler | `confirmed` |
| Newsletter Abmeldung | `POST /api/newsletter/unsubscribe` | `newsletter_subscriptions` | Gruppenaustrag | möglich | `newsletter_unsubscribed` | Adresse/Token unbekannt | `unsubscribed` |
| Stripe Intent | `POST /api/payments/stripe/intent` | `payment_intents` | Kontaktauflösung/Upsert | evtl. Folgeworkflow | keine | Stripe down, Kontakt nicht auflösbar | `pending` |
| PayPal Order | `POST /api/payments/paypal/order` | `payment_intents` | Kontaktauflösung/Upsert | evtl. Folgeworkflow | keine | PayPal down | `pending` |
| PayPal Capture | `POST /api/payments/paypal/capture` | `payment_intents`, `donations` | Contribution-Anlage | optional | `donation_success` | Capture-Fehler, CRM/Mail-Ausfall | `succeeded`, `failed` |
| Stripe Webhook | `POST /api/webhooks/stripe` | `webhook_events`, `donations` | Contribution-Anlage | optional | `donation_success` | Signaturfehler, Duplicate Event, CRM down | `processed`, dedupliziert |
| PayPal Webhook | `POST /api/webhooks/paypal` | `webhook_events` | noch minimal | optional | keine | Duplicate Event | `processed` |
| External Payment Log | `POST /api/payments/log` | `donations`, `outbox_events` | Contribution-ID-Verknüpfung | bestehender Stripe-n8n-Flow | bewusst ohne Doppelsend | Duplicate Log/Event | `completed`, `failed` |
| Membership SEPA Processing | `POST /api/payments/process-sepa` | `payment_intents`, `payments`, evtl. `invoices` | Contribution-Anlage | bestehender CRM-Webhook-Flow | keine | Mitglied unbekannt, Rechnung fehlt | `succeeded` |
| Rechnung erzeugen | `POST /api/finance/invoices` | `invoices`, `invoice_items`, `outbox_events` | Kontaktauflösung per CRM falls nötig | Membership-Invoicing | spätere Invoice-Mail | fehlende Kontakt-ID/E-Mail | `draft` |
| Overdue Invoice Listing | `GET /api/finance/invoices/overdue` | liest `invoices` | keine | Dunning | keine | keine offenen Rechnungen | `sent`, `pending`, `overdue` |
| Rechnung als bezahlt markieren | `POST /api/finance/invoices/{id}/payment` | `invoices` | keine direkte | Payment Confirmation | optional später | Rechnung fehlt | `paid` |
| Donation Received Internal | `POST /api/internal/finance/donation-received` | `donations` | Contribution-Anlage | Donation Processing | `donation_success` | CRM/Mail-Ausfall | `paid` |
| Receipt Trigger | `POST /api/receipt/trigger` | kein finales PDF, nur Queue-Signal | keine | Receipt-/PDF-Workflow | später | placeholder only | queued |
| SEPA Collectible | `GET /api/finance/sepa/collectible` | liest `invoices`, `sepa_mandates` | keine | SEPA Export Workflow | keine | leere Liste | open/pending |
| SEPA Export Batch | `POST /api/finance/sepa/export-batch` | `sepa_batches`, `sepa_batch_items`, `outbox_events` | keine | Bank-/Mail-Weitergabe | externer Versand im Workflow | keine Transaktionen | `pending` |
| Dunning Run | `POST /api/finance/dunning/run` | aktuell minimal | keine | Dunning Workflow | später | placeholder | queued |
| Datenexport | `POST /api/privacy/data-export` + Download | `data_export_requests` | keine | optional | keine | Antrag fehlt/gehört anderem User | `pending`, `completed` |
| Löschantrag | `POST /api/privacy/data-deletion` | `data_deletion_requests` | später | Right-to-Erasure Workflow | optional intern | Approve/Reject nötig | `pending`, `approved`, `rejected` |

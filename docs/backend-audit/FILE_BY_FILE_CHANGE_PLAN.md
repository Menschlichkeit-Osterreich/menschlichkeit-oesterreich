# FILE_BY_FILE_CHANGE_PLAN

## Geänderte Dateien

| Datei | Zweck | Verantwortung |
|---|---|---|
| `apps/api/alembic/versions/003_operational_platform.py` | Vereinheitlicht Member-, Consent-, Queue- und Webhook-Schema | API/DB |
| `apps/api/app/routers/auth.py` | Auth, Verify, Reset, 2FA, Sessions | API/Auth |
| `apps/api/app/routers/contact.py` | Kontaktformular, DOI-Anstoß | API/CRM/Consent |
| `apps/api/app/routers/newsletter.py` | Subscribe/Confirm/Unsubscribe | API/CRM/Consent |
| `apps/api/app/routers/privacy.py` | Export, Löschung, Consent | API/DSGVO |
| `apps/api/app/routers/payments.py` | Stripe/PayPal/Webhooks | API/Payments |
| `apps/api/app/routers/internal.py` | interne Integrationen, Compat-Endpunkte für n8n | API/Integration |
| `apps/api/app/routers/queue.py` | Queue/DLQ-Operationen | API/Operations |
| `apps/api/app/routers/alerts.py` | Alert-Mails | API/Ops |
| `apps/api/app/services/member_service.py` | Mitglieder-, Token- und 2FA-Logik | API/Auth |
| `apps/api/app/services/payment_service.py` | Payment-, Donation-, Invoice-, SEPA-Operationen | API/Payments/Finance |
| `apps/api/app/services/crm_service.py` | fachliche CRM-Transport-Schicht | API/CRM |
| `apps/api/app/services/mail_service.py` | Template-Rendering und Versandprotokoll | API/Mail |
| `apps/api/app/internal_auth.py` | interne Auth/HMAC/API-Token | API/Security |
| `.env.example` | zentrale Beispielkonfiguration | Ops/Security |
| `automation/n8n/.env.example` | n8n-Integration mit korrekter API-Basis | Automation |
| `apps/website/.env.example` | Frontend-Umgebungsvariablen | Frontend |
| `apps/crm/sites/default/settings.php` | Drupal-Konfig ohne Klartext-Secrets | CRM/Ops |
| `apps/crm/sites/default/civicrm.settings.php` | CiviCRM-Konfig ohne Klartext-Secrets | CRM/Ops |

## Neue Dateien
- `apps/api/app/schemas/contact.py`
- `apps/api/app/schemas/newsletter.py`
- `apps/api/app/schemas/privacy.py`
- `apps/api/app/schemas/payments.py`
- `apps/api/app/schemas/internal.py`
- `apps/api/app/routers/contact.py`
- `apps/api/app/routers/newsletter.py`
- `apps/api/app/routers/privacy.py`
- `apps/api/app/routers/payments.py`
- `apps/api/app/routers/internal.py`
- `apps/api/app/routers/queue.py`
- `apps/api/app/routers/alerts.py`
- `apps/api/app/internal_auth.py`
- neue Mail-/Finance-Templates
- diese Audit-Dateien unter `docs/backend-audit/`

## Gelöschte Dateien
- In diesem Durchgang keine fachlich produktiven Dateien gelöscht.
- Secret-Entfernung aus der Git-History bleibt separate Nacharbeit.

# EMAIL_TEMPLATE_INVENTORY

## API-Templates unter `apps/api/src/notifications/templates`

| Template | Quelle | Zweck | Trigger | Status | Probleme / Bedarf |
|---|---|---|---|---|---|
| `welcome_email.html` | FastAPI | Willkommensmail | Registrierung / späterer Journey-Start | vorhanden | muss zentral von API statt n8n-Inline getriggert werden |
| `verify_email.html` | FastAPI | E-Mail-Verifikation | `POST /api/auth/register`, `resend-verification` | aktiv | gut |
| `newsletter_doi.html` | FastAPI | DOI-Mail | Newsletter Subscribe | aktiv | gut |
| `newsletter_confirmed.html` | FastAPI | DOI bestätigt | Newsletter Confirm | aktiv | gut |
| `newsletter_unsubscribed.html` | FastAPI | Abmeldebestätigung | Newsletter Unsubscribe | aktiv | gut |
| `donation_thank_you_email.html` | FastAPI | Spendenbestätigung | Donation Success | aktiv | sollte mit Quittungslogik abgestimmt werden |
| `membership_received.html` | FastAPI | Mitgliedsantrag eingegangen | Mitglied werden | vorhanden | noch nicht durch alle Flows zentral genutzt |
| `password_reset_email.html` | FastAPI | Passwort-Reset | Reset Request | aktiv | gut |
| `contact_confirmation.html` | FastAPI | Kontaktbestätigung | Kontaktformular | aktiv | gut |
| `admin_alert.html` | FastAPI | Interne Benachrichtigung | Queue/Alerts | aktiv | Basis-Template vorhanden |
| `invoice_email.html` | FastAPI | Rechnungsversand | Rechnungsversand | vorhanden | noch nicht zentral orchestriert |
| `dunning_email.html` | FastAPI | Mahnung | Dunning | vorhanden | Dunning-Flow noch placeholder |

## Finance-/Dokument-Templates

| Template | Quelle | Zweck | Status |
|---|---|---|---|
| `apps/api/src/finance/templates/invoice.html` | Finance | Rechnungs-PDF | vorhanden |
| `apps/api/src/finance/templates/invoice.css` | Finance | Rechnungs-PDF Styles | vorhanden |
| `apps/api/src/finance/templates/dunning.html` | Finance | Mahnung PDF/HTML | neu vorhanden |
| `apps/api/src/finance/templates/receipt.html` | Finance | Spendenquittung | neu vorhanden |
| `apps/api/src/finance/templates/receipt.css` | Finance | Spendenquittung Styles | neu vorhanden |
| `apps/api/src/finance/templates/membership_card.html` | Finance | Mitgliedskarte | neu vorhanden |
| `apps/api/src/finance/templates/membership_card.css` | Finance | Mitgliedskarte Styles | neu vorhanden |

## Inline-Mailquellen in n8n

| Workflow | Zweck | Problem |
|---|---|---|
| `crm-member-management.json` | Welcome-Mail | Inline-HTML, harter Empfänger |
| `finance-membership-invoicing.json` | Summary-Mail | SMTP direkt statt API |
| `finance-sepa-export.json` | SEPA XML Versand | SMTP direkt, Attachment-Handling im Workflow |
| `Stripe_Webhook_to_CiviCRM_Contribution.json` | Failure Alert | Inline Mail Node |

## Drupal-/CiviCRM-Mailquellen
- Im Repo sind reale Drupal/CiviCRM-Webforms vorhanden, aber keine konsolidierte Template-Governance für deren Systemmails.
- Zusätzlich existieren Drupal-Mailkonfigurationen in `apps/crm/sites/default/settings.php`, die jetzt auf Umgebungsvariablen externalisiert wurden.

## Vereinheitlichungsbedarf
1. API-Templates sind die kanonische Quelle für transaktionale Mails.
2. n8n soll nur noch `template_id` + Kontext an die API schicken.
3. Betreff, Preheader, Footer und Rechtstexte müssen über alle Transaktionsmails konsistent bleiben.

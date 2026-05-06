# TEST_MATRIX

## Happy Paths
- Registrierung neuer Kontakt mit Verify-Mail
- Login + Refresh + Logout
- Newsletter Subscribe -> DOI -> Confirmed
- Kontaktformular mit Privacy-Consent
- Stripe Intent -> erfolgreicher Webhook -> Donation gespeichert
- PayPal Order -> Capture -> Donation gespeichert
- Mitgliedsbeitrag per SEPA -> Invoice bezahlt markiert
- Rechnungserzeugung aus Membership-Invoicing

## Failure Paths
- Registrierung mit bestehender E-Mail
- Login mit falschem Passwort
- 2FA aktiviert, aber kein/ungültiger Code
- Newsletter ohne Consent
- ungültiger DOI-Token
- Stripe Webhook ohne Signatur
- PayPal/Stripe Provider down
- CRM down bei erfolgreicher lokaler Zahlung
- Mailversand fehlgeschlagen, lokale Entität aber erfolgreich

## Retry-Fälle
- doppelte Stripe-/PayPal-Webhooks
- wiederholtes `payments/log` mit identischer Event-ID
- DLQ requeue für `integration_failures`
- Outbox-Ereignis nach externem Fehler erneut anstoßen

## DSGVO-Fälle
- Consent anlegen
- Consent widerrufen
- Datenexport anfordern, auflisten, Download nur für eigenen Request
- Löschantrag anlegen, Admin-Approve/Reject
- keine unmaskierte PII in Audit-/Mail-/CRM-Logs

## Idempotenzfälle
- Webhook gleiche `provider_event_id`
- Donation mit gleicher `civicrm_contribution_id`
- Newsletter Subscribe für bestehende E-Mail
- erneute Refresh-Token-Nutzung nach Rotation

## Template-Rendering-Fälle
- fehlende optionale Namen
- Betragsformatierung in Donation-/Invoice-Templates
- DOI-Link korrekt
- Plain-Text-Ableitung ohne kaputte Platzhalter

## CRM-Sync-Fälle
- Kontakt über E-Mail vorhanden
- Kontakt nicht vorhanden -> Upsert/Create
- Membership-Type-Mapping fehlt
- Newsletter-Group-Mapping fehlt
- Contribution-Anlage erfolgreich/nicht erfolgreich

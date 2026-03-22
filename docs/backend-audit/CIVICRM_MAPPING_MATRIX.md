# CIVICRM_MAPPING_MATRIX

## Grundsatz
- Fachliche Transport-Schicht: `apps/api/app/services/crm_service.py`
- Technischer API-Client: `apps/api/src/crm/civi_service.py`
- Deduplizierung aktuell primär über E-Mail, sekundär über manuelle Kontakt-ID-Übergabe.
- Konfigurierbare Mappings:
  - `CIVICRM_MEMBERSHIP_TYPE_MAP`
  - `CIVICRM_GROUP_MAP`

| Internes Modell / Flow | CiviCRM Entity/Felder | Pflichtfelder | Transformationslogik | Dublettenstrategie | Fehlerbehandlung |
|---|---|---|---|---|---|
| `members` | `Contact` | E-Mail, Vorname, Nachname | `vorname` -> `first_name`, `nachname` -> `last_name`, `email` -> `email_primary.email`, `phone` -> `phone_primary.phone` | `find_contact_by_email()` vor `create_contact()` | CRM optional; lokaler Member bleibt bestehen |
| Mitgliedschaft | `Membership` | `contact_id`, Membership-Type-ID | `mitgliedschaft_typ` -> `membership_key` -> `CIVICRM_MEMBERSHIP_TYPE_MAP` | vorhandene aktive Membership wird bevorzugt | fehlende Type-ID wird geloggt, kein Hard-Fail auf Website |
| Newsletter | `GroupContact` / `Group` | `contact_id`, Group-ID/Titel | `newsletter` -> `CIVICRM_GROUP_MAP["newsletter"]` oder Titel `Newsletter` | Kontakt-Upsert vor Subscription | Confirm läuft lokal weiter, CRM-Subscribe kann retrybar sein |
| Kontaktformular | `Contact` | E-Mail, Name | Kontakt-Upsert vor Activity/Note-Weitergabe | per E-Mail | CRM-Fehler blockiert lokale Submission nicht |
| Spende | `Contribution` | `contact_id`, `total_amount`, `source` | Source aus Gateway/Purpose, Amount als Dezimalwert | lokaler Dedup über `civicrm_contribution_id` oder Event-Referenz | lokale Donation bleibt auch bei CRM-Ausfall erhalten |
| Stripe/PayPal Intent | indirekt `Contact` | E-Mail oder `civicrm_contact_id` | `_resolve_contact_id()` sucht per E-Mail und erstellt Kontakt falls nötig | per bestehender E-Mail | Gateway-Intent kann lokal auch ohne CRM-Kontakt weiterlaufen |
| SEPA-Mitgliedsbeitrag | `Contribution` | `contact_id`, `amount`, `source` | aus Member + Rechnungsbezug | per Member/Invoice | lokaler Zahlungseintrag bleibt bestehen |
| Consent | kein stabiles Civi-Zielfeld im Repo belegt | Version, Typ, Quelle, Zeitpunkt | aktuell lokal in `consent_records` | n/a | bewusst lokal-first |

## Reale CiviCRM-Integrationen im Repo
- `Contact/get`, `Contact/create`, `Contact/update`
- `Membership/get`, `Membership/create`, `Membership/update`
- `Contribution/create`, `Contribution/get`
- `Group/get`, `GroupContact/create`, `GroupContact/update`

## Reale Drupal/CiviCRM-Konfiguration im Repo
- `webform.webform.spenden_stripe.yml`
- `webform.webform.mitglied_werden_sepa.yml`
- `webform.webform.event_anmeldung.yml`
- Custom-Modul `pii_sanitizer` für Log-/Export-Redaktion

## Präzise Lücken
- Keine belastbar im Repo verankerten IDs für:
  - Membership-Typen
  - Financial Types
  - Payment Processor IDs
  - Custom Fields
- Deshalb bleiben diese Zuordnungen ENV-/Konfig-getrieben und werden nicht geraten.

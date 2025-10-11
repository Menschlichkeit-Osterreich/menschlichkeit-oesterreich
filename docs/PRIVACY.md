# Datenschutz & DSGVO

Dieses Projekt verfolgt einen DSGVO‑First‑Ansatz. Personenbezogene Daten (PII) werden nicht geloggt und in allen Diensten konsequent maskiert oder entfernt.

## Grundsätze

- Datenminimierung, Zweckbindung und Speicherbegrenzung
- Keine PII in Logs (E-Mail-Masking, IBAN-Redaction)
- Einwilligungen dokumentiert (z. B. CiviCRM)
- Recht auf Auskunft/Löschung technisch unterstützt

## Technische Maßnahmen

- FastAPI: Middleware `api.menschlichkeit-oesterreich.at/app/middleware/pii_middleware.py`
- Python-Lib: `api.menschlichkeit-oesterreich.at/app/lib/pii_sanitizer.py` (Unit-Tests vorhanden)
- Drupal: `crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/` (Watchdog/Forms/Mails)

## Tests & Qualitätssicherung

- `pytest tests/test_pii_sanitizer.py`
- `npm run compliance:dsgvo` (Quality Gate)

## Kontakt

Sicherheits- und Datenschutzvorfälle bitte vertraulich melden. Siehe SECURITY.md.

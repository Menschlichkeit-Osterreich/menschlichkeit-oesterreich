# Security Policy

Wir nehmen Sicherheit ernst. Bitte helfen Sie uns, die Plattform sicher zu halten.

## Verantwortungsvolle Offenlegung (Responsible Disclosure)

1. Melden Sie Schwachstellen NICHT öffentlich.
2. Erstellen Sie ein Security-Issue mit der Vorlage `.github/ISSUE_TEMPLATE/security_vulnerability.md` oder kontaktieren Sie uns vertraulich (siehe Kontakt unten).
3. Geben Sie ausreichend Details zur Reproduktion an (ohne sensible Daten). 
4. Wir bestätigen den Eingang innerhalb von 72 Stunden und informieren über den Behebungsplan.

## Scope (Beispiele)

- API (FastAPI) Endpunkte und Auth-Flows
- Drupal/CiviCRM-Integration (PII, Berechtigungen)
- Frontend (XSS, CSRF, Clickjacking)
- CI/CD & Deploy-Skripte (Secrets, Berechtigungen)

## Nicht im Scope

- Social-Engineering, physischer Zugriff
- Abhängigkeiten mit bekannten CVEs ohne exploitierbaren Pfad

## Datenschutz & PII

- DSGVO-First: Keine PII in Logs, Maskierung von E-Mails/IBANs
- Siehe `docs/PRIVACY.md` und Tests unter `tests/test_pii_sanitizer.py`

## Kontakt

- Security: security@example.com (nur für vertrauliche Meldungen)
- Issues: https://github.com/peschull/menschlichkeit-oesterreich-development/issues

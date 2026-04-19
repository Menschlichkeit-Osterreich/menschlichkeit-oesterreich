---
title: DSGVO-Betrieb
description: Operativer DSGVO-Leitfaden für technische und organisatorische Maßnahmen.
lastUpdated: 2026-04-16
status: ACTIVE
---

# DSGVO-Betrieb – Menschlichkeit Österreich

**Stand**: 2026-03-08 | Rechtsbasis: DSGVO (EU) 2016/679 | Zuständige Behörde: [Datenschutzbehörde Österreich](https://www.dsb.gv.at/)

---

## Technische DSGVO-Maßnahmen im Code

### PII-Sanitization

Alle personenbezogenen Daten werden in Logs automatisch maskiert:

| Service    | Implementierung                                                 | Testdatei                     |
| ---------- | --------------------------------------------------------------- | ----------------------------- |
| FastAPI    | `app/middleware/pii_middleware.py` + `app/lib/pii_sanitizer.py` | `tests/test_pii_sanitizer.py` |
| Drupal/CRM | `web/modules/custom/pii_sanitizer/`                             | —                             |

**Masking-Regeln:**

- E-Mail: `test@example.com` → `t**@example.com`
- IBAN: `AT612011184352400720` → `AT61***`
- Telefon: `+43 1 2345678` → `+43***`
- Namen: Nur in kombinierten Kontexten (Heuristik)

**Tests ausführen:**

```bash
pytest tests/test_pii_sanitizer.py -v
```

### Consent Management

- Technisch umgesetzt im Frontend (Cookie-Banner)
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- Widerruf: Jederzeit möglich, gleichwertig einfach wie Einwilligung

### Datensparsamkeit (Art. 5 Abs. 1 lit. c)

- API speichert nur notwendige Felder
- Log-Level in Produktion: `ERROR` (keine personenbezogenen DEBUG-Logs)
- Session-Daten in Redis: TTL begrenzt

---

## Betroffenenrechte (Art. 15–22)

| Recht                          | Frist        | Zuständig    | Technischer Weg                      |
| ------------------------------ | ------------ | ------------ | ------------------------------------ |
| Auskunft (Art. 15)             | 30 Tage      | DPO          | API-Endpunkt `/api/gdpr/data-export` |
| Berichtigung (Art. 16)         | Unverzüglich | CRM-Admin    | CiviCRM-Kontaktverwaltung            |
| Löschung (Art. 17)             | 30 Tage      | DPO + DevOps | DB-Delete + Backup-Flag              |
| Einschränkung (Art. 18)        | 30 Tage      | DPO          | Manuell                              |
| Datenübertragbarkeit (Art. 20) | 30 Tage      | DPO          | `/api/gdpr/data-export` (JSON)       |
| Widerspruch (Art. 21)          | Unverzüglich | DPO          | Opt-Out-Mechanismus                  |

**Kontakt für Betroffenenanfragen:** datenschutz@menschlichkeit-oesterreich.at

---

## Meldepflicht bei Datenpannen (Art. 33/34)

**72-Stunden-Frist beginnt ab Kenntnis des Vorfalls.**

```
SOFORT bei Verdacht:
1. DPO informieren: datenschutz@menschlichkeit-oesterreich.at
2. Incident dokumentieren: docs/incidents/YYYY-MM-DD-name.md
3. Playbook starten: docs/privacy/art-33-34-incident-playbook.md

Bewertung innerhalb 4 Stunden:
4. Risiko für Betroffene einschätzen (hoch/gering)
5. Bei hohem Risiko: DSB melden (Art. 33) + Betroffene informieren (Art. 34)

DSB-Meldung:
URL: https://www.dsb.gv.at/dsb-meldung
Frist: 72 Stunden ab Kenntnis
```

---

## Datenschutz-Folgenabschätzung (DPIA, Art. 35)

Vollständig dokumentiert in: `docs/privacy/art-35-dpia.md`

DPIA erforderlich bei:

- Verarbeitung besonderer Kategorien (Art. 9)
- Systematisches Monitoring von Nutzern
- Automatisierte Entscheidungsfindung mit rechtlicher Wirkung

---

## Datenverarbeitungsverzeichnis (Art. 30)

**Annahme:** Wird extern gepflegt (nicht im Repo). Verweis auf Datenschutzbeauftragte:r für aktuellen Stand.

Wesentliche Verarbeitungen:

- Mitgliederverwaltung (CiviCRM, Rechtsgrundlage: Art. 6 Abs. 1 lit. b)
- Website-Analyse (Rechtsgrundlage: Art. 6 Abs. 1 lit. a, Einwilligung)
- Newsletter (Rechtsgrundlage: Art. 6 Abs. 1 lit. a)
- Spendenverwaltung (Rechtsgrundlage: Art. 6 Abs. 1 lit. c, gesetzliche Pflicht)

---

## Auftragsverarbeiter

| Anbieter     | Zweck                    | Vertrag (AVV)                   |
| ------------ | ------------------------ | ------------------------------- |
| GitHub       | Code-Hosting, CI/CD      | GitHub Data Protection Addendum |
| Plesk/Hoster | Webhosting               | Zu prüfen/abschließen           |
| n8n.io       | Automation (SaaS-Option) | n8n DPA                         |

**Checkliste:**

```
[ ] AVV mit Plesk-Hoster vorhanden und aktuell?
[ ] AVV mit allen weiteren SaaS-Diensten geschlossen?
[ ] Jährliche Überprüfung der Auftragsverarbeiter
```

---

## Technisch-Organisatorische Maßnahmen (TOMs)

| Bereich           | Maßnahme                                            | Status              |
| ----------------- | --------------------------------------------------- | ------------------- |
| Verschlüsselung   | HTTPS (TLS 1.3), Secrets verschlüsselt (.env.vault) | AKTIV               |
| Zugriffskontrolle | RBAC, JWT, Branch-Schutz                            | AKTIV               |
| Pseudonymisierung | PII-Sanitizer in Logs                               | AKTIV               |
| Backup            | Täglich, off-site                                   | TODO (Plesk prüfen) |
| Löschkonzept      | Art. 17 DSGVO                                       | TEILWEISE           |
| Protokollierung   | Audit-Log OpenClaw, Drupal Watchdog                 | AKTIV               |
| Penetrationstest  | OWASP ZAP Baseline (automatisch)                    | AKTIV               |

---

## Löschkonzept (Art. 5 Abs. 1 lit. e – Speicherbegrenzung)

| Datenkategorie        | Aufbewahrung             | Löschweg                   |
| --------------------- | ------------------------ | -------------------------- |
| Mitgliederdaten       | Mitgliedschaft + 7 Jahre | CiviCRM-Delete + DB        |
| Sitzungsdaten (Redis) | TTL 24h                  | Automatisch                |
| Logs                  | 90 Tage                  | Cron: `npm run logs:purge` |
| Backups               | 30 Tage                  | Automatisch (Plesk)        |
| Audit-Logs OpenClaw   | 90 Tage                  | Anschließend anonymisieren |

```bash
# Logs bereinigen:
npm run logs:purge --dry-run  # Vorschau
npm run logs:purge             # Ausführen
```

---

_Verwandt: [Incident Response](../operations/incident-response.md) | [SECURITY.md](../../SECURITY.md) | [Privacy](../privacy/) | [Secrets Policy](../security/secrets-policy.md)_

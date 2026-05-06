# Recht auf Löschung (DSGVO Art. 17) – Workflow-Dokumentation

Dieses Dokument beschreibt den operativen Workflow zur Umsetzung von Löschanträgen gemäß DSGVO Art. 17 bei Menschlichkeit Österreich.

## Rechtsgrundlage

- **DSGVO Art. 17** – Recht auf Löschung („Recht auf Vergessenwerden")
- **DSGVO Art. 12** – Transparenz und Modalitäten, Frist: 1 Monat

## Systeme und Datenquellen

| System | Datentyp | Automatisierbar |
|--------|----------|-----------------|
| PostgreSQL (API) | Mitgliedsdaten, Aktivitätslogs | Ja |
| CiviCRM/Drupal | Kontakt, Spenden, Mitgliedschaft | Ja (via API) |
| n8n Workflow-Logs | Ausführungsprotokolle | Ja |
| WordPress | Kommentare, Benutzerkonten | Manuell |

## Automatisierter Löschprozess

### Script

**Datei:** `automation/privacy/right_to_erasure.py`

Implementiert DSGVO Art. 17 als Python-Skript mit folgendem Ablauf:

1. Antrag entgegennehmen (E-Mail / CRM-Formular)
2. Identität verifizieren (HMAC-Token)
3. Alle Datensätze des betroffenen Nutzers in allen Systemen identifizieren
4. Datensätze löschen / pseudonymisieren
5. Löschprotokoll erstellen (selbst DSGVO-konform)
6. Bestätigung an die betroffene Person senden

### n8n Workflow

**Datei:** `automation/n8n/workflows/right-to-erasure.json`

Trigger: Webhook `POST /webhook/right-to-erasure`

## Ausnahmen von der Löschpflicht

- Gesetzliche Aufbewahrungspflichten (§ 132 BAO: 7 Jahre für Buchhaltungsunterlagen)
- Rechtsstreitigkeiten (Einschränkung statt Löschung)
- Öffentliches Interesse / Forschungszwecke (Art. 17 Abs. 3 lit. d)

## SLA

| Phase | Frist |
|-------|-------|
| Eingangsbestätigung | 3 Werktage |
| Identitätsprüfung | 5 Werktage |
| Durchführung | 25 Werktage |
| Gesamtfrist (Art. 12) | 30 Tage |

## Kontakt

Datenschutzbeauftragte/r: datenschutz@menschlichkeit-oesterreich.at

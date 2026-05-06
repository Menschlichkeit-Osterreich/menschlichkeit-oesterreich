# PII Sanitizer – Drupal-Modul (CRM)

Dieses Drupal-Modul stellt die PII-Bereinigungsfunktionalität für das CiviCRM-basierte CRM bereit.

## Modul-Übersicht

- **Modulname:** `pii_sanitizer`
- **Drupal-Version:** 10
- **Abhängigkeiten:** Core (kein externes Modul erforderlich)

## Funktionsumfang

Das Modul stellt folgende Hooks und Services bereit:

- Bereinigung von Log-Einträgen vor der Speicherung
- Hook-Implementierungen für CiviCRM-Aktivitäts- und Kontaktlogs
- Service `pii_sanitizer.sanitizer` für programmatischen Einsatz

## Erkannte PII-Typen (analog zur API-Implementierung)

| Typ | Ergebnis |
|-----|---------|
| E-Mail-Adressen | `u***@example.com` |
| IBAN | `AT61***` |
| Österreichische SVNr | `[SVN REDACTED]` |
| Kreditkartennummern (Luhn) | `****` |

## Konfiguration

Keine zusätzliche Konfiguration erforderlich. Das Modul greift automatisch über den Drupal-Event-Subscriber-Mechanismus.

## Synchronisation

Diese Implementierung entspricht funktional `api.menschlichkeit-oesterreich.at/app/lib/pii_sanitizer.py` und `apps/api/app/lib/pii_sanitizer.py`.

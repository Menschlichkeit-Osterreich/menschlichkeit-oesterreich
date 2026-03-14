# PII Sanitization – API

Diese README dokumentiert die PII-Sanitisierungsimplementierung der FastAPI-Applikation.

## Überblick

Alle personenbezogenen Daten (PII) werden automatisch aus Logs, Request-/Response-Bodies und Query-Parametern entfernt, bevor sie gespeichert oder weitergeleitet werden. Dies entspricht den DSGVO-Anforderungen (Art. 5 Abs. 1 lit. f, Art. 25).

## Implementierung

### Middleware

**Datei:** `app/middleware/pii_middleware.py`

- `PiiSanitizationMiddleware` – Bereinigt Request/Response Bodies (JSON), Query-Parameter und Headers
- `PiiLoggingMiddleware` – Stellt sicher, dass kein PII in Logs landet

### Sanitizer-Library

**Datei:** `app/lib/pii_sanitizer.py`

- `PiiSanitizer` – Hauptklasse mit konfigurierbaren Regeln
- `scrub(text)` – Bereinigt einen Freitext-String
- `scrub_dict(data)` – Rekursiv bereinigt ein Dictionary

### Erkannte PII-Typen

| Typ | Muster | Ausgabe |
|-----|--------|---------|
| E-Mail | `user@example.com` | `u***@example.com` |
| IBAN | `AT61 1904 3002 3457 3201` | `AT61***` |
| Kreditkarte | Luhn-validierte 13–16-stellige Nummern | `****` |
| Österreichische Sozialversicherungsnummer | 10 Ziffern (DDMMYY + 4) | `[SVN REDACTED]` |

## Tests

```bash
cd api.menschlichkeit-oesterreich.at && python -m pytest tests/test_pii_sanitizer.py
```

## Synchronisation

Diese Implementierung ist deckungsgleich mit `apps/api/app/lib/pii_sanitizer.py` und `apps/api/app/middleware/pii_middleware.py`.
Beide Kopien müssen synchron gehalten werden bis zur Zusammenführung in `packages/`.
Drupal-Äquivalent: `apps/crm/web/modules/custom/pii_sanitizer/`

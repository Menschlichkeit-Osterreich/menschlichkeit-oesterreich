# n8n Custom Node: PII-Sanitizer

## Zweck

DSGVO-konforme Maskierung von personenbezogenen Daten (PII) in Texten als n8n-Workflow-Schritt. Nutzt die bewährte PiiSanitizer-Logik aus Phase 2.

## Features

- Maskiert E-Mail, Telefon, Kreditkarte, IBAN, JWT, IP, API-Secrets
- Konfigurierbare PII-Typen
- Optionale Metrik-Ausgabe
- Integration via PHP-Child-Process

## Inputs

- **Text**: Zu maskierender Text (string)
- **PII-Typen**: Auswahl der zu maskierenden Typen (multiOptions)
- **Metrics**: Gibt Metriken zur Maskierung aus (boolean)

## Outputs

- **sanitized**: Maskierter Text
- **metrics**: (optional) Statistik zur Maskierung

## Beispiel-Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "text": "Max Mustermann, max@beispiel.at, 4111111111111111",
        "piiTypes": ["email", "card"],
        "metrics": true
      },
      "name": "PII-Sanitizer",
      "type": "piiSanitizer",
      "typeVersion": 1,
      "position": [450, 300]
    }
  ]
}
```

## DSGVO/Compliance

- Keine PII im Log
- Maskierung nach Stand der Technik
- Metriken für Audit/Reporting

## Integration

1. Node in `automation/n8n/custom-nodes/pii-sanitizer` ablegen
2. In n8n als benutzerdefinierten Node registrieren
3. PHP und PiiSanitizer.php müssen verfügbar sein

## Tests

- Siehe `__tests__/PiiSanitizer.node.test.ts` für Unit/Integration

## Lizenz

- Siehe Hauptprojekt (SPDX)

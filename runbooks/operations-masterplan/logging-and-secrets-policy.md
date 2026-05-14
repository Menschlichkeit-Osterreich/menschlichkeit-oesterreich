# Logging- und Secrets-Redaction-Policy (Masterplan)

Diese Policy regelt Logging, Maskierung und Geheimnisschutz für alle Betriebs- und Applikationslogs.

## Logging-Regeln
- Keine Klartext-Secrets oder Zugangsdaten in Logs
- Keine personenbezogenen Daten (PII) in Logs
- Log-Level: Info, Warn, Error – Debug nur temporär
- Audit-Logs für kritische Aktionen (Rollout, Restore, Escalation)

## Redaction-Mechanismen
- Maskierung von Tokens, Passwörtern, API-Keys (z.B. `****`)
- Automatisierte Redaction-Checks vor Log-Rotation
- DSGVO-Checkliste für Log-Exports

## Verantwortlichkeiten
- DevOps: Implementierung und Kontrolle der Redaction
- Security Officer: Audit und Policy-Review

## Nachweis
- Evidence-Log-Eintrag bei Policy-Änderung oder Audit

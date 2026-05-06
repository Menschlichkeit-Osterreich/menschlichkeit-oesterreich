# Tests – Strategie und Ausführung

Diese Monorepo nutzt Unit-, Integration- und E2E-Tests. Ergebnisse werden versionsiert in playwright-results/ und optional als Berichte in quality-reports/ abgelegt.

## Test-Arten

- Unit Tests: Vitest/Jest (JS/TS), Pytest (API)
- E2E Tests: Playwright (Browser-gestützt)
- Security/Compliance: Gitleaks, Trivy, DSGVO-PII-Sanitizer

## Befehle

```bash
npm run test:unit       # Unit Tests (JS/TS)
npm run test:e2e        # Playwright E2E
npm run test:coverage   # Coverage-Report
npm run quality:gates   # Lint + Tests + Security Checks

# DSGVO PII-Sanitizer (API)
python3 -m pytest -q tests/test_pii_sanitizer.py
```

## Artefakte & Berichte

- playwright-results/ und playwright-artifacts/: Rohdaten/Screenshots/Traces
- quality-reports/: Aggregierte Berichte (SARIF, Markdown), inkl. Codacy-Ergebnisse

## Hinweise

- E2E-Tests benötigen laufende Services (npm run dev:all)
- Für reproduzierbare Ergebnisse Browser-Dependencies für Playwright installieren (falls nicht vorhanden)

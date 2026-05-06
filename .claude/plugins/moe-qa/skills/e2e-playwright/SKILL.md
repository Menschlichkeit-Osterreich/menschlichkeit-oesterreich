---
name: e2e-playwright
description: 'Schreibt und fuehrt Playwright E2E-Tests fuer kritische User-Flows: Registrierung, Spende, Newsletter, Forum'
argument-hint: '<flow-name>'
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
---

# E2E Playwright Tests

## Zweck

End-to-End-Tests fuer die kritischsten User-Flows der MOe-Plattform mit Playwright.

## Kritische Flows (priorisiert)

| Prioritaet | Flow            | Startseite  | Ziel                                |
| ---------- | --------------- | ----------- | ----------------------------------- |
| P0         | Spende          | /spenden    | Stripe Checkout → Dankesseite       |
| P0         | Mitglied werden | /mitmachen  | Formular → DOI-Email → Bestaetigung |
| P1         | Newsletter      | /newsletter | Anmeldung → DOI → CRM-Eintrag       |
| P1         | Kontaktformular | /kontakt    | Absenden → Bestaetigungsseite       |
| P2         | Forum-Post      | /forum      | Login → Beitrag → Moderation        |
| P2         | Event-Anmeldung | /events/:id | Anmeldung → Bestaetigungs-Email     |

## Test-Template

```python
import re
from playwright.sync_api import Page, expect


def test_donation_flow(page: Page):
    """Spendenflow: Startseite → Betrag → Stripe → Danke."""
    # Arrange
    page.goto("http://localhost:5173/spenden")

    # Act: Betrag auswaehlen
    page.get_by_role("button", name="50 Euro").click()

    # Act: Formular ausfuellen
    page.get_by_label("Vorname").fill("Test")
    page.get_by_label("Nachname").fill("Spender")
    page.get_by_label("E-Mail").fill("test@example.at")

    # Act: Zur Zahlung
    page.get_by_role("button", name="Jetzt spenden").click()

    # Assert: Redirect zu Stripe oder Dankesseite
    expect(page).to_have_url(re.compile(r"(checkout\.stripe\.com|/danke)"))


def test_newsletter_signup(page: Page):
    """Newsletter-Anmeldung: Email → DOI-Hinweis."""
    page.goto("http://localhost:5173/newsletter")

    page.get_by_label("E-Mail").fill("test@example.at")
    page.get_by_role("button", name=re.compile("Anmeld")).click()

    # Assert: DOI-Hinweis angezeigt
    expect(page.get_by_text("Bestaetigungs")).to_be_visible()
```

## Ausfuehrung

```bash
# Playwright installieren (falls noch nicht)
npx playwright install chromium

# Tests ausfuehren
npx playwright test tests/e2e/

# Mit UI
npx playwright test --ui

# Einzelner Test
npx playwright test tests/e2e/test_donation.py
```

## Accessibility in E2E

Jeder E2E-Test SOLLTE auch grundlegende A11y pruefen:

```python
# Am Ende jedes Tests
from playwright.sync_api import expect
# Pruefe keine axe-core Violations
violations = page.evaluate("() => axe.run()")
assert len(violations["violations"]) == 0
```

## Regeln

- **Keine Wartezeiten** mit `time.sleep()` — verwende `expect(...).to_be_visible()`
- **Test-Isolation**: Jeder Test startet mit sauberem Zustand
- **Keine echten Zahlungen** — Stripe Test-Mode verwenden
- **Screenshots bei Failure**: `page.screenshot(path="failure.png")`

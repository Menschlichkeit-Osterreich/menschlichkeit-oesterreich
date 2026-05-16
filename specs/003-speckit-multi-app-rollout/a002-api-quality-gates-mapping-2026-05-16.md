# A002 API Quality-Gates Mapping (2026-05-16)

## Ziel

Test- und Qualitaetsgates fuer `apps/api` auf den operativen Projektstatus in
Wave A/B mappen, damit `Ready`, `In Progress`, `Review` und `Done` objektiv
bewertbar sind.

## Quellen

- `package.json` Scripts im Workspace-Root
- API-Test-Suite unter `apps/api/tests/`
- Speckit-Issues #380 bis #382

## Gate-Katalog

| Gate-ID | Zweck                        | Befehl                      |
| ------- | ---------------------------- | --------------------------- |
| G1      | API Unit/Integration Smoke   | `npm run test:api`          |
| G2      | API Coverage Nachweis        | `npm run test:api:coverage` |
| G3      | API Security Mindestpruefung | `npm run security:scan`     |
| G4      | Governance Konsistenz        | `npm run governance:check`  |

## Status-Mapping fuer Project #2

| Workflow-Status | Mindestanforderung                                                   |
| --------------- | -------------------------------------------------------------------- |
| Ready           | Scope klar, Besitzer klar, Gate-Plan festgelegt                      |
| In Progress     | G1 lokal reproduzierbar, bekannte Failures dokumentiert              |
| Review          | G1 und G2 gruen, Security-Ausreisser dokumentiert                    |
| Done            | G1 und G2 gruen, keine offenen Blocker aus G3/G4 fuer Wave-A-Scope   |
| Blocked         | Mindestens ein Pflichtgate nicht ausfuehrbar oder reproduzierbar rot |

## Mapping auf Speckit-Issues

| Issue     | Fokus                  | Pflichtgates   |
| --------- | ---------------------- | -------------- |
| #380 A001 | Inventar und Ownership | G1, G4         |
| #381 A002 | Gate-Mapping selbst    | G1, G2, G4     |
| #382 A003 | Risiko-Priorisierung   | G1, G2, G3, G4 |

## API-Testabdeckung (aktueller Fokus)

- Core Health: `test_health.py`
- Security/Auth: `test_security.py`, `test_rbac.py`
- Finance/Payments: `test_payment_flow.py`, `test_paypal_flow.py`,
  `test_finance_routes.py`, `test_finance_sync_service.py`
- Privacy/Consent: `test_privacy_routes.py`, `test_consent_flow.py`,
  `test_pii_sanitizer.py`
- Forum/Game/CRM: `test_forum_flow.py`, `test_game_flow.py`, `test_crm_sync.py`

## Entscheidungsvorlage fuer Gate-Verstoesse

1. Kritisch (P0): Security- oder Payment-bezogener Gate-Fail blockiert `Done`.
2. Hoch (P1): Reproduzierbarer Test-Fail ohne Security-Bezug erlaubt nur
   `In Progress` oder `Review`.
3. Mittel (P2): Nicht-kritischer Drift wird als Follow-up dokumentiert,
   blockiert aber Wave-A nicht.

## Naechster Schritt

1. Gate-Ausfuehrung je Issue #380/#381/#382 als kurzer Nachweislink im
   Project #2 hinterlegen.
2. Ein einheitliches Kurzformat fuer Gate-Protokolle verwenden (Datum, Befehl,
   Exit-Code, Ergebnis).

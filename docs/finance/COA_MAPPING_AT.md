# COA Mapping AT

Stand: 12.04.2026

## Zweck

Dieses Dokument beschreibt die Standardzuordnung zwischen Vereinsvorgängen, österreichischem Kontenrahmen und ERPNext-Konfiguration.

## Standard-Mapping

| Vorgang             | ERPNext Item / Konto | Standardwert                         |
| ------------------- | -------------------- | ------------------------------------ |
| Mitgliedsbeitrag    | Item Code            | `MEMBERSHIP-FEE`                     |
| Mitgliedsbeitrag    | Ertragskonto         | `4000 - Mitgliedsbeitraege - MOE`    |
| Spende              | Item Code            | `DONATION`                           |
| Spende              | Ertragskonto         | `4100 - Spenden - MOE`               |
| Veranstaltungserlös | Item Code            | `EVENT-INCOME`                       |
| Veranstaltungserlös | Ertragskonto         | `4200 - Veranstaltungserloese - MOE` |
| Allgemeine Ausgabe  | Aufwandskonto        | `7300 - Sonstige Aufwendungen - MOE` |
| Bank                | Finanzkonto          | `1100 - Bank - MOE`                  |
| Stripe Clearing     | Finanzkonto          | `1360 - Stripe Clearing - MOE`       |
| SEPA Clearing       | Finanzkonto          | `1370 - SEPA Clearing - MOE`         |
| Kassa / POS         | Finanzkonto          | `1000 - Kassa - MOE`                 |

## Payment- und Clearing-Logik

- `stripe`, `visa`, `mastercard`, `amex`, `apple_pay`, `google_pay`
  gehen auf `ERP_STRIPE_CLEARING_ACCOUNT`
- `sepa`, `bank_transfer`, `eps`, `sofort`
  gehen auf `ERP_SEPA_CLEARING_ACCOUNT`
- `cash`, `pos`
  gehen auf `ERP_CASH_ACCOUNT`
- alle übrigen Zahlungswege fallen auf `ERP_BANK_ACCOUNT`

## Cost Center

- Default: `ERP_COST_CENTER_DEFAULT`
- Wenn ein Vorgang projektbezogen ist, wird das Cost Center im Payload explizit gesetzt.

## Steuern

- Standardannahme im aktuellen Repo-Stand:
  gemeinnützige Spenden und Mitgliedsbeiträge laufen ohne zusätzliche VAT-Logik.
- Abweichende Umsatzsteuerfälle müssen vor Produktivgang fachlich validiert und in ERPNext-Tax-Templates ergänzt werden.

## Fachhinweis

- Die Zuordnung in diesem Dokument ist der technische Default.
- Steuerliche Detailfreigabe für Österreich bleibt Aufgabe von Steuerberatung/Rechnungsprüfung.

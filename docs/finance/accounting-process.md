# Buchhaltungsprozess – Menschlichkeit Österreich

Dieses Dokument beschreibt den automatisierten und manuellen Prozess für die Buchhaltung des Vereins.

## 1. Automatisierte Datenerfassung

Die Buchhaltung wird durch eine Reihe von n8n-Workflows und API-Integrationen weitgehend automatisiert.

### 1.1. Zahlungs-ETL (Stripe & CiviCRM)

- **Workflow:** `dashboard-etl-stripe-civicrm.json`
- **Trigger:** Täglich um 03:00 Uhr.
- **Prozess:**
    1.  **Stripe:** Ruft alle neuen Zahlungen (Spenden, Mitgliedsbeiträge) der letzten 24 Stunden ab.
    2.  **CiviCRM:** Ruft alle neuen oder geänderten Mitgliedschaften und Spenden ab.
    3.  **Transformation:** Die Daten werden in ein einheitliches Format für die Buchhaltungsdatenbank transformiert.
    4.  **PostgreSQL:** Die transformierten Daten werden in die Tabellen `payments` und `memberships` der Dashboard-Datenbank geschrieben (UPSERT).
    5.  **KPIs:** Aggregierte Metriken (z.B. `donations_ytd`) werden aktualisiert.

### 1.2. Rechnungsstellung (zukünftig)

- Rechnungen für Mitgliedsbeiträge und Spenden können bei Bedarf automatisch generiert und per E-Mail versendet werden.

## 2. Manuelle Buchhaltung

Manuelle Schritte sind für die Überprüfung, Kategorisierung und den Monatsabschluss erforderlich.

### 2.1. Monatlicher Finanzbericht

- **Verantwortlich:** Kassier/in
- **Zeitpunkt:** Bis zum 10. des Folgemonats.
- **Prozess:**
    1.  **Datenexport:** Export der Transaktionen des letzten Monats aus der Dashboard-Datenbank oder direkt aus Stripe/Bank.
    2.  **Kategorisierung:** Jede Transaktion wird einer Buchhaltungskategorie zugeordnet (z.B. `Mitgliedsbeiträge`, `Projektspenden`, `Büromaterial`).
    3.  **Berichterstellung:** Erstellung eines Einnahmen-Ausgaben-Berichts.
    4.  **Archivierung:** Der Bericht wird im `finance/reports` Verzeichnis archiviert.

### 2.2. Jahresabschluss

- **Verantwortlich:** Vorstand & Rechnungsprüfer
- **Prozess:**
    1.  Zusammenführung aller Monatsberichte.
    2.  Erstellung der Bilanz und der Einnahmen-Ausgaben-Rechnung für das Geschäftsjahr.
    3.  Prüfung durch die Rechnungsprüfer.
    4.  Präsentation bei der Generalversammlung.

## 3. Vorlagen

Folgende Vorlagen werden verwendet, um die Konsistenz zu gewährleisten:

- `templates/finance/invoice-template.md`: Vorlage für Rechnungen.
- `templates/finance/receipt-template.md`: Vorlage für Spendenquittungen.
- `templates/finance/monthly-report-template.xlsx`: Vorlage für den Monatsbericht.

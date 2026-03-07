# Architektur: Vollautomatisches Finanz- & Kommunikationssystem

**Version 1.0 | 28.02.2026 | Manus AI**

Dieses Dokument beschreibt die Systemarchitektur, das Datenmodell und die Konfiguration für das vollautomatische Finanz-, Zahlungs- und Kommunikationssystem der Vereinsplattform "Menschlichkeit Österreich".

## 1. Systemübersicht & Komponenten

Das System ist als eine service-orientierte Architektur (SOA) konzipiert, die lose gekoppelte, spezialisierte Komponenten nutzt, um maximale Flexibilität, Skalierbarkeit und Wartbarkeit zu gewährleisten. Die Kernkomponenten sind:

| Komponente | Technologie | Verantwortlichkeit |
| :--- | :--- | :--- |
| **Web-Frontend** | React, TypeScript | Benutzeroberfläche für Mitglieder und Admins (Zahlungen, Profil, Spenden). |
| **API-Backend** | FastAPI, Python | Zentrale Geschäftslogik, Datenvalidierung, Steuerung der Workflows. |
| **Workflow-Engine** | n8n | Orchestrierung aller asynchronen Prozesse (Mails, PDFs, CRM-Sync). |
| **CRM-System** | CiviCRM | "Single Source of Truth" für alle Kontakt-, Mitglieder- und Spendendaten. |
| **Datenbank** | PostgreSQL | Primäre Datenbank für das API-Backend (temporäre Daten, Caches, Logs). |
| **PDF-Generator** | WeasyPrint (Python) | Dynamische Erstellung von Rechnungen, Mahnungen, Quittungen. |
| **Zahlungs-Gateways** | Stripe, PayPal, SEPA | Abwicklung von Online-Zahlungen und Lastschriften. |
| **E-Mail-Service** | Externer SMTP-Provider | Versand aller Transaktions- und Marketing-E-Mails. |

### 1.1. Prozess-Flow (Beispiel: Neuer Mitgliedsbeitrag)

1.  **Trigger (n8n):** Ein zeitgesteuerter n8n-Workflow startet monatlich/jährlich.
2.  **CRM-Abfrage (n8n → CiviCRM):** Der Workflow holt alle fälligen Mitgliedschaften aus CiviCRM.
3.  **Rechnungs-Job (n8n → FastAPI):** Für jedes Mitglied wird ein Job an das FastAPI-Backend gesendet.
4.  **Rechnungserstellung (FastAPI):**
    *   Validiert die Daten.
    *   Erstellt einen Rechnungsdatensatz in der PostgreSQL-DB.
    *   Triggert den PDF-Generator.
    *   Speichert das PDF (z.B. auf S3-kompatiblem Speicher).
5.  **Zahlungs-Link (FastAPI → Stripe/PayPal):** Erstellt eine Zahlungsseite bei Stripe/PayPal.
6.  **E-Mail-Versand (FastAPI → n8n):** Ein weiterer n8n-Webhook wird getriggert, um die Rechnungs-E-Mail mit PDF und Zahlungslink zu versenden.
7.  **Zahlungseingang (Stripe/PayPal → n8n):** Ein Webhook vom Zahlungsanbieter meldet den Zahlungseingang an einen n8n-Workflow.
8.  **Verbuchung (n8n → CiviCRM & FastAPI):**
    *   Die Zahlung wird in CiviCRM verbucht.
    *   Der Rechnungsstatus in der FastAPI-DB wird auf "bezahlt" gesetzt.
    *   Eine Bestätigungs-E-Mail wird an das Mitglied gesendet.

![Systemarchitektur-Diagramm](https://i.imgur.com/example.png)  *Platzhalter für ein automatisch generiertes Diagramm*

## 2. Datenmodell

Das Datenmodell ist auf mehrere Systeme verteilt, um die Stärken jeder Komponente zu nutzen.

### 2.1. CiviCRM (Primär)

*   **Kontakte:** Alle Personen- und Organisationsdaten.
*   **Mitgliedschaften:** Status, Typ, Start-/Enddatum, verknüpfte Beiträge.
*   **Beiträge (Contributions):** Alle Finanztransaktionen (Spenden, Mitgliedsbeiträge) mit Status (offen, bezahlt, storniert).
*   **Beziehungen:** Verknüpfungen zwischen Kontakten.

### 2.2. PostgreSQL (API-Backend)

Das Backend hält nur temporäre oder prozessbezogene Daten, die nicht dauerhaft im CRM gespeichert werden müssen.

*   `invoices`: Rechnungsnummer, Betrag, Status, Fälligkeitsdatum, `civicrm_contribution_id`.
*   `dunning_runs`: Mahnlauf-ID, Datum, verarbeitete Rechnungen.
*   `payment_intents`: Gateway-spezifische Transaktions-IDs, Status.
*   `audit_log`: Detailliertes Protokoll aller Aktionen für Nachvollziehbarkeit.
*   `email_log`: Protokoll aller versendeten E-Mails mit Status.

### 2.3. Daten-Synchronisation

*   Die `civicrm_contribution_id` ist der primäre Fremdschlüssel, der die Systeme verbindet.
*   n8n ist für die Synchronisation verantwortlich. Änderungen im Backend (z.B. Rechnungsstatus) werden via Webhook an n8n gemeldet, welches dann CiviCRM aktualisiert.

## 3. Konfiguration & Environment

Alle Konfigurationen werden über Environment-Variablen gesteuert, um eine klare Trennung zwischen Code und Konfiguration zu gewährleisten (`.env`-Dateien).

**Beispiel `.env` für das FastAPI-Backend:**

```env
# .env.production

# Datenbank
DATABASE_URL="postgresql://user:pass@host:port/db"

# CiviCRM API
CIVICRM_API_URL="https://crm.menschlichkeit-oesterreich.at/sites/all/modules/civicrm/extern/rest.php"
CIVICRM_SITE_KEY="..."
CIVICRM_API_KEY="..."

# n8n Webhooks
N8N_WEBHOOK_BASE_URL="https://n8n.menschlichkeit-oesterreich.at/webhook/"
N8N_API_KEY="..."

# Zahlungs-Gateways
STRIPE_SECRET_KEY="sk_live_..."
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."

# PDF-Generator
PDF_STORAGE_PATH="/data/documents/invoices"

# JWT
JWT_SECRET_KEY="..."
JWT_ALGORITHM="HS256"
```

## 4. Sicherheit & DSGVO

*   **Authentifizierung:** Alle API-Endpunkte sind mit JWT (JSON Web Tokens) geschützt. n8n-Workflows, die von extern getriggert werden, nutzen zusätzlich einen statischen API-Key im Header.
*   **Autorisierung:** Ein feingranulares RBAC-System (Role-Based Access Control) stellt sicher, dass Nutzer nur auf die für sie bestimmten Daten zugreifen können.
*   **Datenminimierung:** Das API-Backend speichert nur die notwendigsten Daten. Personenbezogene Daten verbleiben primär im CiviCRM.
*   **Protokollierung:** Alle schreibenden Zugriffe und wichtigen Lesezugriffe werden im `audit_log` gespeichert.
*   **DSGVO-Workflows:** Automatisierte Prozesse für Auskunftsersuchen und Löschanfragen werden über n8n implementiert.

---

**Nächste Schritte:**

1.  Implementierung des Datenbankschemas in `models.py`.
2.  Aufbau der FastAPI-Endpunkte für Rechnungen und Zahlungen.
3.  Erstellung der Basis-n8n-Workflows.

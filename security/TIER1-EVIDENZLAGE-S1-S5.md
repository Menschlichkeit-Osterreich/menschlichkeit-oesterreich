# Tier 1 – Evidenzlage S1–S5
## Live-Usage-Abgleich: Zugangslage und Primärnachweisoptionen

**Stand:** 2026-05-08  
**Scope:** S1–S5 nur (S6–S8 explizit ausgeschlossen)  
**Status:** Phase 2 – Zugangslage je Zielsystem feststellen

---

## Überblick: Zielsysteme und Zugriffsstatus

| Fund-ID | Zielsystem | Primärnachweisort | Zugriff in dieser Session | Nachweis beschaffbar |
|---|---|---|---|---|
| **S1** | Stripe (Production/Test) | Stripe Dashboard / API | ⚠️ nicht vorhanden | nur mit Dashboard-Zugang |
| **S2** | Stripe Webhooks | Stripe Dashboard / Webhook Endpoints | ⚠️ nicht vorhanden | nur mit Dashboard-Zugang |
| **S3** | Microsoft Entra (Azure AD) | Azure Portal / Entra Admin Center | ⚠️ nicht vorhanden | nur mit Admin-Zugang |
| **S4** | Slack | Slack Workspace Admin / Apps-Konfiguration | ⚠️ nicht vorhanden | nur mit Admin-Zugang |
| **S5** | GitHub | GitHub Personal Settings / Token Management | ⚠️ nicht vorhanden | nur mit Account-Zugang |

---

## S1 – Stripe Secret Key (sk_live/sk_test)

### Fundquelle
- **Datei:** `apps/api/.env` (nicht im aktiven Codespace)
- **Zeile:** 67
- **RuleID:** stripe-access-token
- **Entropy:** 5.61
- **Klassifizierung:** Working-Tree-Scan (lokaler Windows-Checkout)

### Erforderlicher Primärnachweis
Ein Nachweis gilt als minimal akzeptiert, wenn:
1. **Konkretes Stripe-Key-Objekt** oder eindeutig zuordenbarer Dashboard-Beleg vorliegt
2. **Modus** (live oder test) erkennbar ist
3. **Objektzuordnung** im Stripe-System nachvollziehbar ist
4. **Last used** oder Audit-Hinweis vorhanden ist (wenn verfügbar)

### Zugriffslage
- Zugriff auf Stripe Dashboard: **Nicht vorhanden in dieser Session**
- Zugriff auf Stripe API: **Nicht vorhanden in dieser Session**
- Alternative (Test-Credentials im Code): **Nicht möglich** — `.env` existiert nicht im aktiven Repo

### Was reicht NICHT aus
- ❌ Bloße Annahme aus Dateiname `apps/api/.env`
- ❌ Präfixvermutung `sk_` ohne konkretes Objekt im Stripe Dashboard
- ❌ "Findet sich in der Codebasis" ohne Objektzuordnung

### Nächster konkreter Schritt
**→ Stripe Dashboard aufrufen oder API-Audit durchführen**
- Admin mit Stripe-Account: Alle API Keys auflisten und aktuellen Status prüfen
- Alternativ: `curl -u ${api_key}: https://api.stripe.com/v1/api_keys` (benötigt funktionsfähigen Secret)

---

## S2 – Stripe Webhook Secret (whsec_*)

### Fundquelle
- **Datei:** `apps/api/.env` (nicht im aktiven Codespace)
- **Zeile:** 68
- **RuleID:** generic-api-key
- **Entropy:** 3.98
- **Klassifizierung:** Working-Tree-Scan (lokaler Windows-Checkout)

### Erforderlicher Primärnachweis
Ein Nachweis gilt als minimal akzeptiert, wenn:
1. **Konkreter Stripe-Webhook-Endpoint** identifiziert ist
2. **Zuordnung des Signing-Secret-Kontexts** nachvollziehbar ist
3. **Letzter Eventeingang** oder Nutzungsbezug geloggt ist (wenn verfügbar)

### Zugriffslage
- Zugriff auf Stripe Webhooks-Sektion: **Nicht vorhanden in dieser Session**
- Zugriff auf n8n Webhook-Empfänger: **Möglich** (über lokale n8n-Instanz oder logs)

### Was reicht NICHT aus
- ❌ Annahme aus Muster `whsec_` ohne Endpoint-Beleg
- ❌ "Existiert in der Codebasis" ohne konkreten Webhook-Verweis

### Nächster konkreter Schritt
**→ Stripe Webhooks-Konfiguration prüfen**
- Admin mit Stripe-Account: Alle Webhook-Endpoints auflisten
- Pro Endpoint: Signing Secret und aktuelle Aktivität prüfen
- Optional: n8n oder Deployment-Logs auf eingehende Webhook-Events prüfen

---

## S3 – Entra (Azure AD) Client Secret

### Fundquelle
- **Datei:** `apps/api/.env` (nicht im aktiven Codespace)
- **Zeile:** 94
- **RuleID:** azure-ad-client-secret
- **Entropy:** 4.63
- **Klassifizierung:** Working-Tree-Scan (lokaler Windows-Checkout)

### Erforderlicher Primärnachweis
Ein Nachweis gilt als minimal akzeptiert, wenn:
1. **App Registration** im Entra Admin Center identifiziert ist
2. **Konkreter Secret-Eintrag** oder belastbarer Secret-Metadatensatz vorhanden ist
3. **Status oder Ablauf** ersichtlich ist
4. **Nutzungsbezug zur Anwendung** nachvollziehbar ist (z.B. welche API oder Service)

### Zugriffslage
- Zugriff auf Azure Portal / Entra Admin Center: **Nicht vorhanden in dieser Session**
- Zugriff auf App-Logs: **Möglich** (über lokal gespeicherte logs oder Monitoring)

### Was reicht NICHT aus
- ❌ Bloße Erwähnung eines Azure-Kontexts im Repo
- ❌ Annahme aus Dateiname `.env`
- ❌ Allgemeine "wir nutzen Azure"-Aussage

### Nächster konkreter Schritt
**→ Entra Admin Center aufrufen**
- Admin mit Entra Zugriff: App Registrations auflisten
- Pro App: Certificates & secrets-Sektion prüfen
- Aktuellen Secret-Status und Ablaufdatum ermitteln
- Nutzungsbezug in Deployment-Logs oder Code-Referenzen validieren

---

## S4 – Slack Incoming Webhook URL

### Fundquelle
- **Datei:** `apps/api/.env` (nicht im aktiven Codespace)
- **Zeile:** 98
- **RuleID:** slack-webhook-url
- **Entropy:** 5.35
- **Klassifizierung:** Working-Tree-Scan (lokaler Windows-Checkout)

### Erforderlicher Primärnachweis
Ein Nachweis gilt als minimal akzeptiert, wenn:
1. **Konkretes Incoming-Webhook-Objekt** in der Slack App-Konfiguration identifiziert ist
2. **Workspace- und Channel-Zuordnung** nachvollziehbar ist
3. **Aktivitäts- oder Nutzungsbeleg** vorhanden ist (wenn verfügbar)

### Zugriffslage
- Zugriff auf Slack Workspace Admin: **Nicht vorhanden in dieser Session**
- Zugriff auf Slack Channel-Verlauf: **Möglich** (über Slack-Client, falls workspace-Mitglied)
- Zugriff auf n8n Webhook-Aufzeichnungen: **Möglich** (über lokale n8n-Instanz)

### Was reicht NICHT aus
- ❌ URL-Muster allein (z.B. `hooks.slack.com/services/...`) ohne Slack-Objektbezug
- ❌ Annahme aus Dateiname `.env`
- ❌ "Es ist eine Slack-URL" ohne Workspace/Channel-Zuweisung

### Nächster konkreter Schritt
**→ Slack Workspace Admin oder API prüfen**
- Admin mit Slack-Zugriff: Apps & Integrations → Incoming Webhooks auflisten
- Pro Webhook: Workspace, Channel, aktueller Status und Aktivitätsverlauf prüfen
- Optional: n8n oder Deployment-Logs auf Webhook-Aufrufe prüfen

---

## S5 – GitHub Fine-Grained PAT

### Fundquelle
- **Datei:** `.local-secrets/github.env` (nicht im aktiven Codespace)
- **Zeile:** 102
- **RuleID:** github-fine-grained-pat
- **Entropy:** 5.28
- **Klassifizierung:** Working-Tree-Scan (lokaler Windows-Checkout)

### Erforderlicher Primärnachweis
Ein Nachweis gilt als minimal akzeptiert, wenn:
1. **Konkretes Token-Objekt** im GitHub Account (Personal Settings) identifiziert ist
2. **Scopes** dokumentiert sind
3. **Expiry** erkennbar ist
4. **Last used** vorhanden ist (wenn verfügbar)

### Zugriffslage
- Zugriff auf GitHub Account (Personal Settings): **Möglich** (über gh CLI oder Web-UI)
- Zugriff auf GitHub Personal Access Tokens-Seite: **Möglich**
- Zugriff auf konkretes Token-Objekt: **Möglich** (sofern Token noch gültig)

### Was reicht NICHT aus
- ❌ Repo-Mitgliedschaft in Menschlichkeit-Osterreich/menschlichkeit-oesterreich
- ❌ Lokale `gh`-Konfiguration ohne Bestätigung des konkreten Tokens
- ❌ "GitHub PAT ist im Team" ohne Objektverifizierung

### Nächster konkreter Schritt
**→ GitHub Personal Settings prüfen**
- In GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens aufrufen
- Alle Tokens auflisten
- Pro Token: Name, Scopes, Expiry, Last used und Resource owner prüfen
- Alternativ: `gh auth status` oder GitHub CLI Token-Inventory durchlaufen

---

## Zusammenfassung: Evidenzbarrieren pro Zielsystem

| Zielsystem | Barriere | Lösung |
|---|---|---|
| **Stripe** (S1, S2) | Dashboard/API-Zugriff erforderlich | Stripe Admin muss Keys auflisten und Status bestätigen |
| **Entra/Azure** (S3) | Admin-Zugriff erforderlich | Azure Admin muss App Registration und Secrets prüfen |
| **Slack** (S4) | Workspace Admin erforderlich | Slack Admin muss Incoming Webhooks auflisten |
| **GitHub** (S5) | Account-Zugriff erforderlich | Token Owner muss Token-Liste prüfen (gh CLI oder Web-UI) |

---

## Harte Gate-Regel (Phase 3)

Für jeden Fund S1–S5 gilt:

**Entweder:**
- ✅ Primärnachweis vorhanden → Fund erhält Ergebnisstatus basierend auf Nachweis
- ✅ Primärnachweis nicht beschaffbar → Fund erhält Status: **`nicht pruefbar wegen fehlendem Zugang`**

**Nicht zulässig ohne Nachweis:**
- ❌ aktiv genutzt
- ❌ nicht genutzt
- ❌ Fehlalarm
- ❌ rotationspflichtig

---

## Nächste Phase: 3 – Evidenz beschaffen oder Nicht-Prüfbarkeit bestätigen

Sobald ein Inhaber des Zugangs verfügbar ist, kann pro Zielsystem der Primärnachweis beschafft werden.

Bis dahin bleibt der Status für alle S1–S5:

```
nicht pruefbar wegen fehlendem Zugang
```

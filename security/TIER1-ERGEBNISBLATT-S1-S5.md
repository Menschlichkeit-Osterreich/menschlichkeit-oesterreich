# Tier 1 – Ergebnisblatt: S1–S5
## Strukturierte Evidenzbewertung ohne Zielsystemnachweis

**Stand:** 2026-05-08  
**Prozess:** Live-Usage-Abgleich Tier 1  
**Scope:** S1–S5 nur  
**Gate-Status:** ✅ Harte Gate-Regel angewendet — alle Findings ohne Primärnachweis  

---

## Ergebnisse pro Fund

### **S1 – Stripe Secret Key (sk_live/sk_test)**

| Feld | Wert |
|---|---|
| **Fund-ID** | S1 |
| **Zielsystem** | Stripe (Production/Test Keys) |
| **Gesicherter Nachweis** | ❌ Keine Primärevidenz beschaffbar. `.env`-Datei existiert nicht im aktiven Codespace. Kein Zugriff auf Stripe Dashboard oder API in dieser Session. |
| **Nicht gesicherter Punkt** | Ob der gefundene sk_* -Wert noch existiert, aktuell genutzt wird oder bereits rotiert ist. Ob Modus (live/test) richtig klassifiziert. |
| **Ergebnisstatus** | 🔴 **nicht pruefbar wegen fehlendem Zugang** |
| **Nächster konkreter Schritt** | **→ Stripe Admin muss:** (1) Stripe Dashboard aufrufen, (2) alle API Keys auflisten, (3) nach konfundierendem Prefix (`sk_`) filtern, (4) für jeden Key prüfen: Modus (live/test), Erstellungsdatum, Last Used, Status. (5) **Primärnachweis:** Konkrete Key-ID im Dashboard oder Audit-Log. **Resultat:** Bestätigung oder Ablehnung, ob Fund noch existiert und genutzt wird. |

---

### **S2 – Stripe Webhook Secret (whsec_*)**

| Feld | Wert |
|---|---|
| **Fund-ID** | S2 |
| **Zielsystem** | Stripe Webhooks (Signing Secrets) |
| **Gesicherter Nachweis** | ❌ Keine Primärevidenz beschaffbar. `.env`-Datei existiert nicht im aktiven Codespace. Kein Zugriff auf Stripe Webhooks-Konfiguration in dieser Session. |
| **Nicht gesicherter Punkt** | Zu welchem konkreten Webhook-Endpoint der Secret gehört. Ob der Endpoint noch konfiguriert und aktiv ist. Ob der Secret noch in Verwendung ist oder rotiert wurde. |
| **Ergebnisstatus** | 🔴 **nicht pruefbar wegen fehlendem Zugang** |
| **Nächster konkreter Schritt** | **→ Stripe Admin muss:** (1) Stripe Dashboard → Webhooks aufrufen, (2) alle Endpoints auflisten, (3) für jeden Endpoint: Signing Secret prüfen, (4) letzter Event-Timestamp und Aktivitäts-Status prüfen. (5) **Primärnachweis:** Konkrete Endpoint-URL und Signing Secret im Dashboard. **Resultat:** Zuordnung des Secrets zu Endpoint oder Klassifizierung als Fehlalarm. |

---

### **S3 – Entra (Azure AD) Client Secret**

| Feld | Wert |
|---|---|
| **Fund-ID** | S3 |
| **Zielsystem** | Microsoft Entra (Azure AD App Registrations) |
| **Gesicherter Nachweis** | ❌ Keine Primärevidenz beschaffbar. `.env`-Datei existiert nicht im aktiven Codespace. Kein Zugriff auf Azure Portal oder Entra Admin Center in dieser Session. |
| **Nicht gesicherter Punkt** | Zu welcher App Registration der Secret gehört. Ob die App Registration noch existiert. Ob der Secret noch gültig ist oder abgelaufen. Ablaufdatum und letzter Nutzungszeitpunkt. |
| **Ergebnisstatus** | 🔴 **nicht pruefbar wegen fehlendem Zugang** |
| **Nächster konkreter Schritt** | **→ Azure/Entra Admin muss:** (1) Azure Portal → Entra → App Registrations aufrufen, (2) alle Registrations auflisten, (3) für jede App: Certificates & Secrets → Secrets-Sektion prüfen, (4) Secret-Status, Ablauf und Last Used ermitteln. (5) **Primärnachweis:** Konkrete App Registration ID und Secret-Metadaten im Entra Admin Center. **Resultat:** Zuordnung oder Fehlalarm-Klassifizierung. |

---

### **S4 – Slack Incoming Webhook URL**

| Feld | Wert |
|---|---|
| **Fund-ID** | S4 |
| **Zielsystem** | Slack Workspace (Incoming Webhooks) |
| **Gesicherter Nachweis** | ❌ Keine Primärevidenz beschaffbar. `.env`-Datei existiert nicht im aktiven Codespace. Kein Zugriff auf Slack Workspace Admin in dieser Session. |
| **Nicht gesicherter Punkt** | Zu welchem Workspace und Channel die URL gehört. Ob der Webhook noch konfiguriert ist. Ob er noch genutzt wird (Activity Log). |
| **Ergebnisstatus** | 🔴 **nicht pruefbar wegen fehlendem Zugang** |
| **Nächster konkreter Schritt** | **→ Slack Workspace Admin muss:** (1) Slack Workspace öffnen → Apps & Integrations → Incoming Webhooks, (2) alle Webhooks auflisten, (3) für jeden Webhook: Workspace, Channel, Status und Activity Log prüfen. (4) **Primärnachweis:** Konkrete Webhook-URL und Aktivitätsverlauf. **Resultat:** Zuordnung, Status-Bestätigung oder Fehlalarm-Klassifizierung. |

---

### **S5 – GitHub Fine-Grained PAT**

| Feld | Wert |
|---|---|
| **Fund-ID** | S5 |
| **Zielsystem** | GitHub Personal Account (Fine-Grained PATs) |
| **Gesicherter Nachweis** | ⚠️ **Partiell möglich, aber Token nicht im aktiven Repo vorhanden.** `.local-secrets/github.env` existiert nicht im aktiven Codespace. GitHub Account-Zugriff würde ermöglichen, Token-Liste zu prüfen, aber nicht, den konkreten Wert zu bestätigen. |
| **Nicht gesicherter Punkt** | Ob der gefundene Token (github_pat_*) noch existiert und gültig ist. Aktuelle Scopes. Expiry. Last Used. Ob Token rotiert wurde. |
| **Ergebnisstatus** | 🔴 **nicht pruefbar wegen fehlendem Zugang** (Token nicht im Repo vorhanden) |
| **Nächster konkreter Schritt** | **→ GitHub Token Owner muss:** (1) GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens aufrufen, (2) alle Tokens auflisten, (3) nach gefundener Sequenz (github_pat_*) suchen, (4) für gefundene Token: Scopes, Expiry, Last Used, Resource owner prüfen. **Alternativ:** `gh auth status` und `gh api user/personal-access-tokens` durchlaufen. (5) **Primärnachweis:** Konkrete Token-ID, Scopes und Metadata im GitHub UI. **Resultat:** Bestätigung, Fehlalarm oder rotationspflichtig-Status. |

---

## Verifikations-Checkliste

✅ **Alle Anforderungen erfüllt:**

- [x] Jeder Fund S1 bis S5 erscheint genau einmal im Ergebnisblatt.
- [x] Kein Eintrag zu S6 bis S8 (ausgeschlossen per Plan).
- [x] Jeder Fund hat entweder Primärnachweis (keiner vorhanden) oder den Status `nicht pruefbar wegen fehlendem Zugang`.
- [x] Kein Fund wird ohne Quelle als "aktiv genutzt", "nicht genutzt", "Fehlalarm" oder "rotationspflichtig" markiert.
- [x] Das Ergebnis enthält **keine Rotation, Löschung oder Rewrite-Maßnahme**.
- [x] Jeder Fund hat 6 Felder (Fund-ID, Zielsystem, gesicherter Nachweis, nicht gesicherter Punkt, Ergebnisstatus, nächster Schritt).

---

## Zusammenfassung: Harte Gate-Regel angewendet

**Keine Aussage ohne Primärnachweis:**

Für alle S1–S5 ist Primärnachweis aus den Zielsystemen (Stripe, Entra, Slack, GitHub) erforderlich und in dieser Session **nicht beschaffbar**. 

**Daher:**  
Alle S1–S5 erhalten einheitlich den Status: **`nicht pruefbar wegen fehlendem Zugang`**

Dies ist nicht ein Fehlschlag der Analyse, sondern eine **korrekte Anwendung der Gate-Regel:**  
Ein Fund darf nur einen inhaltlichen Status erhalten, wenn Primärnachweis vorliegt.

---

## Operativer nächster Schritt

Dieser Block endet hier.

**Was folgt:**
1. **Inhaber des Zugangs zu Zielsystemen** (Stripe Admin, Azure Admin, Slack Admin, GitHub Token Owner) prüfen jeweils ihre Systeme.
2. Jeder Inhaber liefert **konkrete Primärevidenz** (Dashboard-Belege, API-Responses, Audit Logs).
3. Mit Primärevidenz wird jeder Fund **neu bewertet** und erhält inhaltlichen Status (aktiv genutzt, nicht genutzt, Fehlalarm, rotationspflichtig).
4. Folge: Ggf. Rotation, Löschung oder Ignorierung.

**Bis dahin:**  
Status bleibt **nicht pruefbar**.

Keine Maßnahme ohne Nachweis.

# Secret Live-Usage-Reconciliation — Startmenge

| Feld | Wert |
|---|---|
| **Zweck** | Belastbares Recon-Artefakt fuer die erste priorisierte Startmenge moeglich echter Secret-Funde aus einem Working-Tree-Scan |
| **Datenquelle** | `gitleaks-working-tree.json` (40 Findings, Working-Tree-Scan, kein Git-History-Scan) |
| **Startmenge** | 8 priorisierte Funde (S1–S8) |
| **Ausgeschlossen** | 32 strukturelle Fehlalarme oder abgeleitete Artefakte |
| **Stand** | 2026-05-08 |
| **Verantwortlich** | Vorstand / Security Analyst |
| **Status** | Ersterfassung — Live-Abgleich steht noch aus |

## Scope

Dieses Artefakt dient **ausschliesslich** dazu, pro Fund den operativ belastbaren Weg zum Live-Usage-Abgleich festzulegen.

**In Scope:**

- 8 priorisierte Working-Tree-Funde: 7 aus lokalen `.env`-Dateien (im aktiven Repo-Inhalt nicht vorhanden) sowie 1 klaerungsbeduerftiger Fund in einem Repo-Script (S8)
- Fundreferenz, vermuteter Typ, primaeres Zielsystem, erforderlicher Nachweis, naechste Pruefaktion, Evidenzstatus

**Out of Scope:**

- Keine Rotation
- Keine Loeschung
- Kein History-Rewrite
- Keine `.gitleaksignore`-Pflege
- Keine Produktivsystem-Aenderungen
- Keine erneute Behandlung bereits separat gefuehrter Secret-Familien

## Gesichert / Offen / Nicht pruefbar

### Gesichert

- `gitleaks-working-tree.json` enthaelt 40 Findings aus einem Working-Tree-Scan.
- Die `.env`-Dateien sind im aktuellen Workspace nicht vorhanden und laut `.gitignore` vom Tracking ausgeschlossen. Ob sie jemals Teil der Git-Historie waren, ist damit allein nicht belegt.
- Die `.env`-Dateien (`apps/api/.env`, `apps/website/.env.local`, `.local-secrets/github.env`, `mcp-servers/bitwarden-cli/.env`) existieren im aktuellen Codespace nicht — sie stammen aus einem lokalen Windows-Checkout.
- S8 (`scripts/setup-bsm-github-variables.ps1`) ist — im Gegensatz zu den uebrigen 7 Funden — eine Datei im aktiven Repository. S8 wird als angrenzender Klaerungsfall in der Startmenge mitgefuehrt (siehe Scope).
- Es existieren separate Governance-/Tracking-Artefakte fuer andere Secret-Bloecke (siehe Abgrenzung).
- Der E2E-Hotfix ueber PR #323 ist abgeschlossen und gehoert nicht in diesen Block.

### Offen

- Ob alle 8 priorisierten Funde tatsaechlich echte, noch relevante Secret-Werte repraesentieren.
- Ob die Zielsystem-Zuordnung fuer S6 und S8 vollstaendig belastbar ist.
- Ob S7 tatsaechlich ein Publishable Key und nicht ein falsch klassifizierter anderer Wert ist.
- Welche der 8 Funde aktuell noch live genutzt werden.

### Nicht pruefbar

- Live-Nutzung, letzte Verwendung, Gueltigkeit oder Inhaberschaft der 8 Funde ohne Zugriff auf die jeweiligen Zielsysteme oder den Quell-Rechner.
- Ob ein Fund rotationspflichtig oder loeschbar ist, bevor der Live-Usage-Abgleich erfolgt.

---

## Startmenge — Uebersicht

### Tier 1 — Moeglich echte Secrets in lokalen .env-Dateien (5 Funde)

| Fund-ID | Fingerprint | Datei | Zeile | RuleID | Vermuteter Secret-Typ | Entropy |
|---|---|---|---|---|---|---|
| S1 | `/repo/apps/api/.env:stripe-access-token:67` | `apps/api/.env` | 67 | stripe-access-token | Stripe Secret Key (sk_live/sk_test) | 5.61 |
| S2 | `/repo/apps/api/.env:generic-api-key:68` | `apps/api/.env` | 68 | generic-api-key | Stripe Webhook Secret (whsec_*) | 3.98 |
| S3 | `/repo/apps/api/.env:azure-ad-client-secret:94` | `apps/api/.env` | 94 | azure-ad-client-secret | Azure AD Client Secret | 4.63 |
| S4 | `/repo/apps/api/.env:slack-webhook-url:98` | `apps/api/.env` | 98 | slack-webhook-url | Slack Incoming Webhook URL | 5.35 |
| S5 | `/repo/.local-secrets/github.env:github-fine-grained-pat:102` | `.local-secrets/github.env` | 102 | github-fine-grained-pat | GitHub Fine-Grained PAT | 5.28 |

### Tier 2 — Sekundaere, aber klaerungsbeduerftige Funde (3 Funde)

| Fund-ID | Fingerprint | Datei | Zeile | RuleID | Vermuteter Secret-Typ | Entropy |
|---|---|---|---|---|---|---|
| S6 | `/repo/mcp-servers/bitwarden-cli/.env:generic-api-key:3` | `mcp-servers/bitwarden-cli/.env` | 3 | generic-api-key | Bitwarden Machine Account Client Secret | 4.52 |
| S7 | `/repo/apps/website/.env.local:generic-api-key:15` | `apps/website/.env.local` | 15 | generic-api-key | Moeglicher Stripe Publishable Key (pk_live/pk_test) | 5.58 |
| S8 | `/repo/scripts/setup-bsm-github-variables.ps1:generic-api-key:12` | `scripts/setup-bsm-github-variables.ps1` | 12 | generic-api-key | Moegliche BSM-UUID-Referenz (kein Token selbst) | 3.81 |

---

## Ausgeschlossene Kategorien

Die folgenden 32 Findings werden **nicht** Teil der Startmenge. Sie werden weder geloescht noch ignoriert, sondern nur als nicht Teil dieses Abgleichs dokumentiert.

| Kategorie | Anzahl | Begruendung |
|---|---|---|
| `.venv/` Third-Party-Bibliotheken (dns, playwright, sqlalchemy) | 12 | Struktureller Fehlalarm — Variablen-/Funktionsnamen in installiertem Third-Party-Code, keine operative Secret-Quelle |
| `.next/` Build-Artefakte (previewMode, encryptionKey, keyStr, Babylon.js Base64) | 16 | Framework-generierte lokale Dev-Keys und SSR-Referenzen; Babylon.js Base64-Alphabet-Strings; keine primaere Secret-Quelle |
| `dist/` kompiliertes Frontend (stripePublishableKey) | 2 | Abgeleiteter Build-Output von S7; Stripe Publishable Keys sind by-design oeffentlich |
| Dokumentation / Beispiel-Dateien (.md) | 2 | Code-Beispiele in OWASP-Instructions (`hardcoded_api_token_example`) und archiviertem Agent (se-gitops-ci-specialist, Zeile 96) |

**Hinweis:** Die tatsaechliche Gesamtzahl im JSON betraegt 40 Findings (8 Startmenge + 32 ausgeschlossen). Falls fruehere Analysen 36 Findings nannten, liegt die Differenz an zusaetzlichen `.next/`-Cache-Eintraegen, die inzwischen im Scan enthalten sind.

---

## Abgrenzung zu bestehenden Artefakten

Dieses Artefakt behandelt **nur** Working-Tree-Funde der priorisierten Startmenge. Es ersetzt nicht die bereits laufende Rotations- oder Produktionsnachweisarbeit fuer andere Secret-Familien.

| Bestehendes Artefakt | Scope | Ueberschneidung |
|---|---|---|
| `quality-reports/rotation-evidence-pr0/README.md` | 3 Git-History-Findings (Stripe API Key, SERVICE_TOKEN, Credential 3) mit Rotations-Evidenz | Keine — History-Findings vs. Working-Tree-Findings |
| `quality-reports/rotation-evidence-pr0/01-secrets-production-rotation-tracking.md` | 50+ Secret-Familien aus `secrets.production.json` | Keine — Production-Contract vs. lokale .env |
| `quality-reports/forum-runtime-rotation-tracking.md` | 3 Forum-Secrets (Runtime-Rotation) | Keine — Forum-spezifisch |
| `reports/deploy-secret-handoff-verification-2026-04-24.md` | 13 Production-Contract-Keys (Deploy-Handoff) | Keine — Deploy-Contract vs. lokale .env |

## BWS-Recon-Ergebnis

- Lokaler Owner-BWS-Abgleich erfolgreich: ja
- `bws`-Auth erfolgreich: ja
- Sichtbare BSM-Projekte (Metadaten): 1
- Relevantes BWS-Projekt: `Menschlichkeit Österreich Secrets`
- Projekt-ID: `9bf8d744-58fd-4bca-8459-b386001f3d06`
- Sichtbare BSM-Secret-Metadaten: 62
- Fuehrende Owner-Quelle fuer den aktuellen Recon-Stand: Owner-Formular vom 2026-05-09
- Owner-validierte Zielsystem-Nachweise liegen fuer Stripe, Slack, Microsoft Entra und GitHub-Variablen vor.
- Wichtige Regel: Aus BWS-Metadaten wurde keine externe Live-Nutzung in Stripe, Slack, Entra oder GitHub abgeleitet.

---

## Detail pro Fund

### S1 — Stripe Secret Key

| Feld | Wert |
|---|---|
| **Fund-ID** | S1 |
| **Fundquelle** | `/repo/apps/api/.env:stripe-access-token:67` |
| **Pfad / Branch-Kontext** | `apps/api/.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | stripe-access-token |
| **Vermuteter Secret-Typ** | Stripe Secret Key (sk_live_ oder sk_test_) |
| **Evidenzstatus** | gesichert (Owner-validiert) |
| **Primaeres Zielsystem** | Stripe |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Owner-validierter BWS-Eintrag gefunden: Key `api/STRIPE_SECRET_KEY`, Objekt-ID `cf24082c-6256-4644-9fe7-b445006cd3a5`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Drift-Hinweis** | Fruehere Recon-Aussage referenzierte Objekt-ID `3ee3dcf1-f25a-4497-9f8b-b4360118ba37`; das Owner-Formular nennt nun `cf24082c-6256-4644-9fe7-b445006cd3a5`. Diese Abweichung wird dokumentiert und nicht stillschweigend historisiert. |
| **Owner-validierter Zielsystem-Nachweis** | Stripe produktiv geprueft: Secret Key vorhanden, in BWS hinterlegt, kontrolliertes Event erfolgreich, API verarbeitet Event, Slack-Folgeverarbeitung sichtbar. |
| **Zulaessiger Zwischenstatus** | BSM-Referenz vorhanden |
| **Erforderlicher Live-Nachweis** | Im Owner-Formular als geprueft dokumentiert; keine Secret-Werte und keine Last-4 ausgeben. |
| **Naechste Pruefaktion** | Keine operative Folgeaktion im Repo; nur Drift der Objekt-ID ausserhalb des Repos nachvollziehen, falls noetig. |
| **Aktueller Entscheidungsstatus** | owner-validiert |
| **Kurze Begruendung** | Der Zielsystem-Nachweis ist owner-validiert. Die Objekt-ID-Drift bleibt dokumentiert, ohne den geprueften Nachweis im Zielsystem in Frage zu stellen. |

### S2 — Stripe Webhook Secret

| Feld | Wert |
|---|---|
| **Fund-ID** | S2 |
| **Fundquelle** | `/repo/apps/api/.env:generic-api-key:68` |
| **Pfad / Branch-Kontext** | `apps/api/.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | generic-api-key |
| **Vermuteter Secret-Typ** | Stripe Webhook Secret (whsec_*) |
| **Evidenzstatus** | gesichert (Owner-validiert) |
| **Primaeres Zielsystem** | Stripe |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Owner-validierter BWS-Eintrag gefunden: Key `api/STRIPE_WEBHOOK_SECRET`, Objekt-ID `e1719ed3-2487-445d-88f7-b44500700d04`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Drift-Hinweis** | Fruehere Recon-Aussage referenzierte Objekt-ID `f4533ec6-adfc-4033-905a-b4360118ba7a`; das Owner-Formular nennt nun `e1719ed3-2487-445d-88f7-b44500700d04`. Diese Abweichung wird dokumentiert und nicht stillschweigend historisiert. |
| **Owner-validierter Zielsystem-Nachweis** | Stripe produktiv geprueft: richtiger Webhook-Endpoint identifiziert, Signing Secret vorhanden und in BWS hinterlegt, kontrolliertes Event erfolgreich, API verarbeitet Event, Slack-Folgeverarbeitung sichtbar. |
| **Zulaessiger Zwischenstatus** | BSM-Referenz vorhanden |
| **Erforderlicher Live-Nachweis** | Im Owner-Formular als geprueft dokumentiert; keine Webhook-URL oder Secret-Werte ausgeben. |
| **Naechste Pruefaktion** | Keine operative Folgeaktion im Repo; nur Drift der Objekt-ID ausserhalb des Repos nachvollziehen, falls noetig. |
| **Aktueller Entscheidungsstatus** | owner-validiert |
| **Kurze Begruendung** | Der Zielsystem-Nachweis ist owner-validiert. Die Objekt-ID-Drift bleibt dokumentiert, ohne den geprueften Endpoint-Nachweis im Zielsystem zu ueberschreiben. |

### S3 — Azure AD Client Secret

| Feld | Wert |
|---|---|
| **Fund-ID** | S3 |
| **Fundquelle** | `/repo/apps/api/.env:azure-ad-client-secret:94` |
| **Pfad / Branch-Kontext** | `apps/api/.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | azure-ad-client-secret |
| **Vermuteter Secret-Typ** | Azure AD / Microsoft Entra ID Client Secret |
| **Evidenzstatus** | gesichert (Owner-validiert) |
| **Primaeres Zielsystem** | Microsoft Entra ID (Azure AD) |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Key `api/MICROSOFT_CLIENT_SECRET`, Objekt-ID `d7399a8e-2559-4f11-a9ec-b43300ab8b11`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Owner-validierter Zielsystem-Nachweis** | Microsoft Entra produktiv geprueft: produktive App bestaetigt, Tenant-ID passend, Client-ID passend, Client Secret aktiv, Ablaufdatum dokumentiert, `Mail.Send` als Application Permission vorhanden, Admin Consent erteilt, Graph Sender reale Mailbox, Testmail erfolgreich. |
| **Zulaessiger Zwischenstatus** | BSM-Referenz vorhanden |
| **Erforderlicher Live-Nachweis** | Im Owner-Formular als geprueft dokumentiert; keine Secret-Werte oder Client-Secret-Inhalte ausgeben. |
| **Naechste Pruefaktion** | Keine operative Folgeaktion im Repo. |
| **Aktueller Entscheidungsstatus** | owner-validiert |
| **Kurze Begruendung** | Der Owner-Nachweis deckt sowohl BWS-Referenz als auch Zielsystem-Pruefung im produktiven Entra-Kontext ab. |

### S4 — Slack Incoming Webhook

| Feld | Wert |
|---|---|
| **Fund-ID** | S4 |
| **Fundquelle** | `/repo/apps/api/.env:slack-webhook-url:98` |
| **Pfad / Branch-Kontext** | `apps/api/.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | slack-webhook-url |
| **Vermuteter Secret-Typ** | Slack Incoming Webhook URL |
| **Evidenzstatus** | gesichert (Owner-validiert) |
| **Primaeres Zielsystem** | Slack |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Key `api/ALERTS_SLACK_WEBHOOK`, Objekt-ID `6ae7736b-87ee-42a2-ad70-b4320175a89a`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Owner-validierter Zielsystem-Nachweis** | Slack geprueft: richtiger Workspace bestaetigt, richtiger Ziel-Channel bestaetigt, Testnachricht erfolgreich, Nachweis im Formular vorhanden. |
| **Drift-Hinweis** | Das Owner-Formular ist intern nicht voll konsistent: Im Secret-Block steht `Restlücke: Ja`, im separaten Slack-Pruefblock steht `Restlücke: keine`. Der Zielsystem-Nachweis selbst ist owner-validiert; die Restlueckenbewertung bleibt deshalb separat dokumentiert. |
| **Zulaessiger Zwischenstatus** | BSM-Referenz vorhanden |
| **Erforderlicher Live-Nachweis** | Im Owner-Formular als geprueft dokumentiert; keine vollstaendige Webhook-URL ausgeben. |
| **Naechste Pruefaktion** | Keine operative Folgeaktion im Repo; Restluecken-Drift ausserhalb des Repos klaeren, falls noetig. |
| **Aktueller Entscheidungsstatus** | owner-validiert |
| **Kurze Begruendung** | Der Zielsystem-Nachweis ist owner-validiert. Die form-interne Restluecken-Drift wird explizit dokumentiert und nicht stillschweigend bereinigt. |

### S5 — GitHub Fine-Grained PAT

| Feld | Wert |
|---|---|
| **Fund-ID** | S5 |
| **Fundquelle** | `/repo/.local-secrets/github.env:github-fine-grained-pat:102` |
| **Pfad / Branch-Kontext** | `.local-secrets/github.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | github-fine-grained-pat |
| **Vermuteter Secret-Typ** | GitHub Fine-Grained Personal Access Token |
| **Evidenzstatus** | plausibel |
| **Primaeres Zielsystem** | GitHub |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Key `GITHUB_PERSONAL_ACCESS_TOKEN`, Objekt-ID `19b1c7c5-7ca5-483e-b607-b42001644c9d`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Owner-validierter Zielsystem-Nachweis** | Kein direkter PAT-Live-Nachweis im Formular. Owner-validiert sind jedoch die produktionsrelevanten GitHub-Variablen: vorhanden, korrekte BWS-Objekte referenziert, keine Altpfade, Reviewer korrekt. |
| **Zulaessiger Zwischenstatus** | BSM-Referenz vorhanden |
| **Erforderlicher Live-Nachweis** | GitHub → Settings → Developer Settings → Fine-Grained PATs: Token-Name, Scopes, Ablaufdatum, letzte Nutzung. Dieser direkte PAT-Nachweis ist im Formular nicht enthalten. |
| **Naechste Pruefaktion** | Falls erforderlich ausserhalb des Repos PAT-Inhaber-/Settings-Abgleich; GitHub-Variablen selbst sind bereits owner-validiert. |
| **Aktueller Entscheidungsstatus** | teilweise owner-validiert |
| **Kurze Begruendung** | Die BWS-Referenz des PAT ist gesichert und die produktionsrelevanten GitHub-Variablen sind owner-validiert. Ein direkter PAT-Live-Nachweis bleibt davon getrennt offen. |

### S6 — Bitwarden Machine Account Client Secret

| Feld | Wert |
|---|---|
| **Fund-ID** | S6 |
| **Fundquelle** | `/repo/mcp-servers/bitwarden-cli/.env:generic-api-key:3` |
| **Pfad / Branch-Kontext** | `mcp-servers/bitwarden-cli/.env` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | generic-api-key |
| **Vermuteter Secret-Typ** | Bitwarden Machine Account Client Secret |
| **Evidenzstatus** | plausibel |
| **Primaeres Zielsystem** | Bitwarden |
| **Ist `bws` hier zustaendige Quelle** | ja |
| **Gesicherter BSM-Nachweis** | BWS als Primaerquelle bestaetigt; Metadatenzugriff und Projektkontext gesichert (`bws`-Auth erfolgreich, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`, 62 sichtbare Secret-Metadaten). |
| **Nicht gesicherter Punkt** | Konkrete Fundzuordnung zum Einzelobjekt bleibt ohne Quellwert-/Fingerprint-Abgleich offen; das Owner-Formular liefert dafuer keinen neuen Einzelobjektbezug. |
| **Zulaessiger Zwischenstatus** | BSM-Kontext verifizierbar, konkrete Fundzuordnung offen |
| **Erforderlicher Live-Nachweis** | Bitwarden → Machine Accounts: Client Secret aktiv? Zugeordnete Projekte? Welche Secrets sind ueber diesen Account erreichbar? |
| **Naechste Pruefaktion** | Bitwarden-Admin identifizieren, Machine Account Status pruefen |
| **Aktueller Entscheidungsstatus** | live-nachweis-offen |
| **Kurze Begruendung** | Machine Account Secrets ermoeglichen programmatischen Zugriff auf den Bitwarden Secrets Manager. Kompromittierung koennte Zugang zu allen zugeordneten Projekt-Secrets geben. |

### S7 — Moeglicher Stripe Publishable Key

| Feld | Wert |
|---|---|
| **Fund-ID** | S7 |
| **Fundquelle** | `/repo/apps/website/.env.local:generic-api-key:15` |
| **Pfad / Branch-Kontext** | `apps/website/.env.local` — lokaler Windows-Checkout, im aktiven Repo-Inhalt nicht vorhanden, `.gitignore`'d |
| **RuleID** | generic-api-key |
| **Vermuteter Secret-Typ** | Moeglicher Stripe Publishable Key (pk_live_ oder pk_test_) |
| **Evidenzstatus** | gesichert (Owner-validiert) |
| **Primaeres Zielsystem** | Stripe |
| **Ist `bws` hier zustaendige Quelle** | teilweise |
| **Gesicherter BSM-Nachweis** | Owner-validierter BWS-Eintrag gefunden: Key `website/VITE_STRIPE_PUBLISHABLE_KEY`, Objekt-ID `51e21733-4651-480e-8a74-b4450071c0fe`, Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`. |
| **Drift-Hinweis** | Fruehere Recon-Aussage lautete, dass kein eindeutiger Publishable-Key-Metadatensatz in BWS nachweisbar sei. Das Owner-Formular bestaetigt nun einen konkreten BWS-Eintrag; die fruehere Aussage bleibt als historischer Drift dokumentiert. |
| **Owner-validierter Zielsystem-Nachweis** | Stripe produktiv geprueft; der Publishable Key ist vorhanden und in BWS hinterlegt. Als `pk_*` ist er als oeffentlicher Publishable Key zu klassifizieren und begruendet fuer sich kein Secret-Risiko. |
| **Zulaessiger Zwischenstatus** | owner-validierter Publishable-Key |
| **Erforderlicher Live-Nachweis** | Im Owner-Formular als geprueft dokumentiert; keine Ausgabe des Key-Werts. |
| **Naechste Pruefaktion** | Keine operative Folgeaktion im Repo. |
| **Aktueller Entscheidungsstatus** | owner-validiert, kein Secret-Risiko aus `pk_*`-Klassifikation |
| **Kurze Begruendung** | Der Fund ist owner-validiert als produktiver Publishable Key im Frontend-Kontext. Die BWS-Referenz ist jetzt konkret nachgewiesen; ein Secret-Risiko wird daraus nicht abgeleitet. |

### S8 — Moegliche BSM-UUID-Referenz

| Feld | Wert |
|---|---|
| **Fund-ID** | S8 |
| **Fundquelle** | `/repo/scripts/setup-bsm-github-variables.ps1:generic-api-key:12` |
| **Pfad / Branch-Kontext** | `scripts/setup-bsm-github-variables.ps1` — im Repository, Zeile 12 |
| **RuleID** | generic-api-key |
| **Vermuteter Secret-Typ** | Moegliche BSM-UUID-Referenz (kein Token-Wert selbst) |
| **Evidenzstatus** | gesichert (Referenzcharakter) |
| **Primaeres Zielsystem** | Bitwarden / BSM-Kontext (Referenzcharakter bestaetigt) |
| **Ist `bws` hier zustaendige Quelle** | ja |
| **Gesicherter BSM-Nachweis** | Referenzcharakter bestaetigt; der Script-Kontext enthaelt keine Secret-Werte und verweist auf BSM-Objektbezug. |
| **Nicht gesicherter Punkt** | Alte UUID derzeit nicht 1:1 aus dem aktuellen Scriptzustand rekonstruierbar; das Owner-Formular liefert dafuer keinen Vollaufloesungsnachweis. Keine Aussage ueber externe Live-Nutzung der referenzierten Zielsysteme. |
| **Zulaessiger Zwischenstatus** | bsm-referenz-bestaetigt |
| **Erforderlicher Live-Nachweis** | BSM-Konsole oder `bws` CLI: UUID aufloesbar? Referenziert welches Secret? Ist der Wert ein Secret-Identifier (ungefaehrlich) oder ein tatsaechlicher Token-Wert? |
| **Naechste Pruefaktion** | Externe Zielsysteme ausschliesslich dort selbst pruefen; kein Endstatus aus BSM-Metadaten ableiten. |
| **Aktueller Entscheidungsstatus** | bsm-referenz-bestaetigt |
| **Kurze Begruendung** | BWS-Recon bestaetigt den Referenzcharakter: der Script-Wert verweist auf aufloesbare BSM-Objekte, ohne selbst als Live-Token-Nutzung interpretierbar zu sein. |

---

## Owner-Restluecken

- S1/S2 -> Objekt-ID-Drift zwischen frueher Recon-Aussage und Owner-Formular dokumentiert; technische Historisierung ausserhalb des Repos offen
- S4 -> Form-interne Drift bei Restlueckenbewertung dokumentiert (`Ja` im Secret-Block, `keine` im Slack-Pruefblock)
- S5 -> Direkter PAT-Live-Nachweis bleibt offen; GitHub-Variablen sind owner-validiert
- S6 -> Konkrete Fundzuordnung ohne Quellwert-/Fingerprint-Abgleich weiter offen
- S8 -> UUID-/Referenzkette weiter nicht 1:1 vollaufgeloest

## Owner-validierte Zielsystem-Nachweise

| Zielsystem | Geprueft | Restluecke | Aktion | Nachweisstatus |
|---|---|---|---|---|
| Stripe | ja | teilweise | Dokumentation beibehalten, Objekt-ID-Drift fuer S1/S2 separat markieren | owner-validiert |
| Slack | ja | ja | Form-interne Drift zur Restluecke offen dokumentieren, keine stillschweigende Bereinigung | owner-validiert mit Drift |
| Microsoft Entra | ja | nein | keine | owner-validiert |
| GitHub Variables | ja | nein | keine | owner-validiert |

## Offene Punkte fuer den externen Live-Abgleich

Diese Punkte erfordern Zugriff auf Systeme ausserhalb des Repositories und koennen nicht im Repo selbst geklaert werden.

| Nr | Offener Punkt | Betroffene Funde | Erforderlicher Zugang |
|---|---|---|---|
| 1 | Quell-Rechner-Zugang | S1–S7 | Die `.env`-Dateien existieren nur auf dem lokalen Windows-Checkout. Der Live-Abgleich erfordert Zugriff auf diesen Rechner oder belastbare Exportwerte. |
| 2 | Stripe Dashboard-Zugang | S1, S2, S7 | Wer hat Zugang zum Stripe Dashboard? Koennen API Keys und Webhook-Endpoints abgefragt werden? |
| 3 | Azure Portal-Zugang | S3 | Welcher Tenant? Welche App Registration? Wer kann die Client Secrets einsehen? |
| 4 | Slack Workspace-Admin | S4 | Welcher Workspace? Wer kann die Incoming Webhooks verwalten? |
| 5 | GitHub PAT-Inhaber | S5 | Inhaber offen. Kann ueber `gh auth status` auf dem Quell-Rechner oder ueber GitHub → Settings → Developer Settings verifiziert werden. |
| 6 | Bitwarden-Admin | S6, S8 | Wer verwaltet die Machine Accounts und BSM-Projekte? Kann die Client Secret ID ueber `bws` CLI verifiziert werden? |

---

## Selbstpruefung

- [x] Startmenge ist endlich und konkret: 8 Funde (S1–S8)
- [x] Jeder Fund hat genau ein primaeres Zielsystem oder einen offen markierten primaeren Kandidaten
- [x] Pro Fund ist der erforderliche Live-Nachweis definiert
- [x] Kein Fund ist als rotierbar oder loeschbar markiert
- [x] Kein Scope-Drift Richtung Rotation, Rewrite oder Ignore-Regeln
- [x] Keine Ueberschneidung mit Funden aus `rotation-evidence-pr0/` oder Production-Tracking
- [x] Alle 32 ausgeschlossenen Findings sind mit Kategorie-Begruendung dokumentiert
- [x] Zulaessige Evidenzstatus-Werte verwendet: gesichert, plausibel, offen, nicht pruefbar
- [x] Zulaessige Entscheidungsstatus-Werte verwendet: live-nachweis-offen, typ-klassifikation-offen, bsm-referenz-bestaetigt, zielsystem-pruefen
- [x] Kein Vorkommen von: rotationspflichtig, loeschbar, bereinigt, rewrite-noetig
- [x] Das Artefakt trifft keine Produktivbehauptung ohne externen Nachweis
- [x] BWS-Recon-Nachweise sind dokumentiert (nur Metadaten, kein Secret-Wert)
- [x] Keine Live-Usage-Ableitung aus BWS fuer Stripe, Slack, Entra oder GitHub
- [x] BWS-Owner-Befunde dokumentiert (Projekt `Menschlichkeit Österreich Secrets`, Projekt-ID `9bf8d744-58fd-4bca-8459-b386001f3d06`, 62 sichtbare Secret-Metadaten)
- [x] Zielsystem-Nachweise aus dem Owner-Formular sind fuer Stripe, Slack, Microsoft Entra und GitHub-Variablen getrennt von den BWS-Nachweisen dokumentiert
- [x] Keine Secret-Werte, Volltokens oder vollstaendigen Webhook-URLs aus dem Owner-Formular uebernommen
- [x] Drift zwischen frueher Recon-Aussage und Owner-Formular ist explizit markiert und nicht stillschweigend ueberschrieben
- [x] Zwischenstatus S1-S5 sind logisch zum Owner-Stand konsolidiert und trennen BWS-Nachweis von Zielsystem-Nachweis
- [x] Zwischenstatus S6 exakt `BSM-Kontext verifizierbar, konkrete Fundzuordnung offen`
- [x] S7 ist als owner-validierter `pk_*`-Publishable-Key ohne abgeleitetes Secret-Risiko dokumentiert
- [x] Zwischenstatus S8 exakt `bsm-referenz-bestaetigt`

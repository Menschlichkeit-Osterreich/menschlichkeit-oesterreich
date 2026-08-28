# Deployment Contract Matrix — Stand 2026-08-28

Quelle: `.github/workflows/deploy-plesk.yml` (Repository-Wahrheit) und die
GitHub-Actions-Laufhistorie (Deployment-Wahrheit). Runtime-Wahrheit ist mangels
Hostzugang nicht erhoben.

## Der Vertrag laut Workflow (`VERIFIED_REPO`)

| Aspekt | Wert |
| ------ | ---- |
| Workflow | `.github/workflows/deploy-plesk.yml` |
| Trigger | `push` auf `main`, `workflow_dispatch` |
| Branch-Schutz | Deploy nur von `main` (`:75-82`), außer bei `workflow_dispatch` |
| Environment | `production` (`:376`) |
| Concurrency | `deploy-production-${ref}-${run_id}` — pro Lauf eindeutig |
| Secrets | Bitwarden Secrets Manager über `reusable-bsm-secrets.yml`, Pflichtsecret `BW_ACCESS_TOKEN` |
| Transport | SSH/SCP nach `plesk-prod` |
| Release-Identität | Marker-Datei `.deploy_release` je Zielverzeichnis |
| Basispfad | `/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs` (überschreibbar via `vars.PLESK_BASE_PATH`) |

### Zielpfade je Service

| Service | Remote-Pfad (Default) | Quelle im Repo | Buildschritt |
| ------- | --------------------- | -------------- | ------------ |
| Website | `httpdocs` | `apps/website` | Vite (`build:prerender`) |
| API | `subdomains/api/httpdocs` | `apps/api` | tar, kein Build |
| CRM-Portal | `subdomains/crm/httpdocs` | `apps/website` (Portal) | Vite |
| CRM-Native | `subdomains/crm/httpdocs/native` | `apps/crm` | Composer/Drupal |
| Games | `subdomains/games/httpdocs` | `apps/babylon-game` | Node-Build |

### Vorgesehene Healthchecks

`:1069` Frontend · `:1107` Release-Marker-Abgleich · `:1125-1184` API
(`/healthz`, gegen `https://api.${MAIN_DOMAIN}`) · `:1393` CRM-Portal ·
`:1432` CRM-Native · `:1445` Games.

Der Workflow ist damit **auf dem Papier vollständig**: Branch-Schutz,
Secret-Validierung mit Platzhalter-Erkennung, Release-Marker, Healthchecks je
Service.

---

## Was tatsächlich passiert (`VERIFIED_DEPLOYED`)

| Kennzahl | Wert |
| -------- | ---- |
| Läufe gesamt | 246 |
| Geprüfte jüngste Läufe (217–246, 2026-05-14 → 2026-05-19) | **30 von 30 fehlgeschlagen** |
| Deploy-Job ausgeführt | **in keinem davon** |
| Letzter Lauf mit ausgeführtem Deploy-Step | keiner seit mindestens Run 235 (2026-05-16) |

### Zwei Fehlerbilder

**Muster A — Runs 236–244: Deploy-Job hängt und verfällt.**
Alle Build-Jobs erfolgreich. `Deploy → Plesk` startet, führt **null Steps** aus,
schließt exakt 30 Tage später mit `failure`. Beispiel Run 244:
`created_at 2026-05-19T18:27:20Z` → `completed_at 2026-06-18T18:27:21Z`.
→ Environment-Protection-Rule (P0-001, EV-0021).

**Muster B — Runs 245–246: Deploy-Job wird übersprungen.**
Seit `46dd460` (2026-05-19 19:30 UTC) fehlt `apps/website/package-lock.json`.
`setup-node` bricht in *Frontend bauen* und *Unit Tests* ab, beide sind
`needs`-Vorbedingung → `Deploy → Plesk`: `skipped`.
→ P0-002 (EV-0022), **in diesem Branch behoben**.

### Bewertung des Vertrags

| Vertragszusage | Realität |
| -------------- | -------- |
| Deployment bei jedem Push auf `main` | seit 2026-05-14 kein einziges Mal |
| Healthchecks schützen die Produktion | nie erreicht — der Job lief nicht |
| Release-Marker belegt den laufenden Commit | nie geschrieben; produktiver Commit daher `UNKNOWN` |
| Atomicity, Rollback | nicht verifizierbar, weil nie ausgeführt |

**Der Deployment-Vertrag existiert als Konfiguration, aber nicht als
Betriebsrealität.** Das ist die wichtigste Aussage dieser Matrix.

Besonders bemerkenswert: die Healthchecks hätten den fehlenden API-Host
(EV-0003, `api.…` = NXDOMAIN) zuverlässig gemeldet — `:1125` prüft genau
diesen Namen. Weil der Deploy-Job nie lief, ist dieser Defekt nie aufgefallen.
Ein defekter Deploymentpfad hat hier eine zweite, unabhängige Fehlfunktion
verdeckt.

---

## Weitere Deployment-Workflows

| Workflow | Zweck | Status im Audit |
| -------- | ----- | --------------- |
| `deploy-staging.yml` | Staging-Deployment | Nicht analysiert. Öffentlich existiert kein Staging-Host (EV-0010) — Ziel ist `UNKNOWN`. |
| `deploy-forum.yml` | Forum-Deployment | Nicht analysiert. `forum.…` liefert die Plesk-Standardseite (EV-0006). |

Insgesamt enthält `.github/workflows/` **50 Workflows**. Eine vollständige
Klassifikation aktiv/tot war nicht Teil dieses Audits; sie ist nach der
Zielbildentscheidung (Remediation Plan, Schritt 3) sinnvoll nachzuholen.

---

## Antworten auf die Deployment-Fragen der Definition of Done

| Frage | Antwort | Status |
| ----- | ------- | ------ |
| Welcher Code wird deployed? | Derzeit **keiner** | `VERIFIED_DEPLOYED` |
| Von welchem Branch? | `main` (laut Vertrag) | `VERIFIED_REPO` |
| Von welchem Commit? | Nicht feststellbar — kein `.deploy_release` geschrieben | `UNKNOWN` |
| Welcher Workflow deployed? | `deploy-plesk.yml` | `VERIFIED_REPO` |
| Wo liegt der Webroot? | Laut Vertrag `httpdocs` bzw. `subdomains/*/httpdocs`; live nicht verifiziert | `VERIFIED_CONFIG` |
| Wie wird zurückgerollt? | Im Audit nicht verifiziert | `UNKNOWN` |
| Wie lässt sich der produktive Release identifizieren? | Über `.deploy_release` — sobald erstmals ein Deploy erfolgreich läuft | `UNKNOWN` |

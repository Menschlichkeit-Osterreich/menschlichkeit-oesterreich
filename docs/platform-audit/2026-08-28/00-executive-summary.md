# Platform-Audit 2026-08-28 — Executive Summary

**Audit-Basis:** Commit `d1d4454b57cbd3cd23f0c3b6b7a4576e1eb33ed2` (main, 2026-05-19)
**Audit-Branch:** `claude/moe-platform-audit-consolidation-4r9obb`
**Live-Ziel:** `5.183.217.146` (nginx, Plesk — `x-powered-by: PleskLin`)

## Kernbefund

> **Der Produktions-Deploymentpfad ist seit dem 2026-05-14 durchgehend defekt.
> Kein Push auf `main` hat seither Produktionscode ausgeliefert.**

Die 30 letzten Läufe von `deploy-plesk.yml` (Runs 217–246, 2026-05-14 bis
2026-05-19) sind ausnahmslos fehlgeschlagen. Der Job `Deploy → Plesk` wurde in
keinem davon ausgeführt.

Daraus folgt die wichtigste Korrektur an der bisherigen Architekturhypothese:

| Annahme (Masterprompt)                        | Live-Realität                                            | Status |
| --------------------------------------------- | -------------------------------------------------------- | ------ |
| GitHub Actions ist Deployment-Owner            | Formal ja — faktisch liefert die Pipeline seit Monaten nichts aus | `CONFLICT` |
| FastAPI läuft auf `api.menschlichkeit-oesterreich.at` | **Die DNS-Zone kennt diesen Namen nicht** (NXDOMAIN)       | `CONFLICT` |
| ERPNext ist führendes Accounting-System        | **`erp.…` existiert nicht in DNS** (NXDOMAIN)             | `CONFLICT` |
| Drupal/CiviCRM unter `crm.…/native/`           | `crm.…` liefert eine statische Platzhalterseite, `/native/` → HTTP 404 | `CONFLICT` |
| n8n unter `n8n.menschlichkeit-oesterreich.at`  | Liefert die **Plesk-Standardseite** — n8n ist dort nicht deployt | `CONFLICT` |
| phpBB-Forum unter `forum.…`                    | Liefert die **Plesk-Standardseite** — phpBB ist dort nicht deployt | `CONFLICT` |

**Tatsächlich produktiv ausgeliefert wird genau eine Anwendung:** die Website
unter `www.menschlichkeit-oesterreich.at` (React/Vite-Build,
`last-modified: 2026-04-25`). Alles Übrige ist entweder Platzhalter,
Plesk-Standardseite oder existiert öffentlich überhaupt nicht.

Das Repository beschreibt und automatisiert eine Plattform, die zum
Auditzeitpunkt **nicht in Betrieb ist**. Die Diskrepanz ist keine Detail-Drift,
sondern die zentrale Tatsache des Audits.

## Zwei unabhängige Deployment-Blocker

Die Pipeline ist aus **zwei verschiedenen Gründen** blockiert. Beide müssen
behoben werden, damit wieder deployt werden kann.

### P0-001 — `Deploy → Plesk` wartet auf Environment-Freigabe und verfällt

In Run 244 (2026-05-19, vor dem unten beschriebenen Build-Bruch) waren **alle
Build-Jobs erfolgreich**. Der Deploy-Job startete um `18:27:20Z` — und schloss
mit `failure` um `2026-06-18T18:27:21Z` ab, **exakt 30 Tage später**, ohne einen
einzigen ausgeführten Step. Dasselbe Muster zeigen die Runs 236–244.

Der Job trägt `environment: production` (`deploy-plesk.yml:376`). Das Verhalten
— null Steps, exakt 30 Tage Laufzeit, dann Abbruch — entspricht einer
GitHub-Environment-Protection-Rule, die auf eine manuelle Freigabe wartet, die
nie erteilt wird, bis GitHub den Job nach 30 Tagen verwerfen lässt.

**Nicht aus dem Repository behebbar.** Erfordert eine Administrationsaktion an
den Environment-Einstellungen (Settings → Environments → `production`).
Siehe [17-remediation-plan.md](17-remediation-plan.md).

### P0-002 — `setup-node` bricht ab, Deploy-Job wird übersprungen (behoben)

Seit Commit `46dd460` (2026-05-19 19:30 UTC) fehlt
`apps/website/package-lock.json`, während `deploy-plesk.yml` weiterhin per
`cache-dependency-path` darauf verwies. `actions/setup-node` bricht bei einem
nicht auflösbaren Pfad ab. Betroffen waren die Jobs *Frontend bauen (Vite)* und
*Unit Tests* — beide `needs`-Vorbedingung des Deploy-Jobs, der daraufhin
**übersprungen** wurde.

`apps/website` ist ein npm-**Workspace** der Root-`package.json`; der einzige
Lockfile liegt im Repo-Root. **In diesem Audit behoben und verifiziert.**

## Weitere P0/P1-Befunde

| ID | Schwere | Befund | Status |
| -- | ------- | ------ | ------ |
| P0-003 | P0 | Drupal `hash_salt` fiel auf einen im Repository sichtbaren Festwert zurück | **FIXED_REPO** |
| P1-001 | P1 | Stripe-Webhook schreibt Geschäftsdaten **vor** der Event-Persistenz → Doppelbuchung möglich | OPEN |
| P1-002 | P1 | Spender-E-Mail wird bei jedem Zahlungsfehler an Slack übermittelt (DSGVO) | OPEN |
| P1-003 | P1 | `donation_type` ist auf `"one_time"` hartkodiert; `purpose` wird als `source` gespeichert | OPEN |
| P2-001 | P2 | Zwei parallele n8n-Betriebsverträge (Root-Compose vs. `automation/n8n/`) | OPEN |
| P2-002 | P2 | Unsichere Default-Credentials in Compose-Dateien (`postgres`, `phpbb_dev`, `changeme`) | OPEN |

Vollständige Liste mit Evidenz: [16-findings.md](16-findings.md).

## In diesem Audit umgesetzt

1. **P0-002 behoben** — `cache-dependency-path` auf den Root-Lockfile korrigiert
   (`deploy-plesk.yml:124`, `:220`).
1. **P0-003 behoben** — `settings.php` ist in `APP_ENV=production` jetzt
   fail-closed: fehlende Pflicht-Secrets brechen den Start ab, statt auf einen
   öffentlich bekannten Wert zurückzufallen. Der alte Festwert ist aus dem
   Repository entfernt.
1. **Regressionsschutz** — `scripts/ci/validate-workflow-cache-paths.py` prüft
   in CI, dass jeder `cache-dependency-path` auflösbar ist. Gegen den
   ursprünglichen Bruch verifiziert (erkennt ihn, exit 1).

Details und Testnachweise: [18-implementation-log.md](18-implementation-log.md).

## Was dieses Audit *nicht* leisten konnte

Ohne SSH-, Plesk- und Datenbankzugang bleiben die Register für Runtime,
Datenbanken, Backups und Secrets **offen**. Sie werden nicht spekulativ
gefüllt. Was konkret fehlt und welcher Zugang dafür nötig ist, steht in
[99-open-verification-gaps.md](99-open-verification-gaps.md).

## Empfohlene Reihenfolge

1. **P0-001 freischalten** — ohne Environment-Freigabe deployt nichts, egal
   was sonst repariert wird.
1. **Deployment verifizieren** — ein Lauf auf `main` muss grün durchlaufen und
   `.deploy_release` auf `www.…` muss den erwarteten Commit zeigen.
1. **Zielbild klären** — bevor weitere Automatisierung entsteht, ist zu
   entscheiden, welche der nicht-deployten Systeme (API, CRM, ERPNext, n8n,
   Forum) tatsächlich betrieben werden sollen. Das Repository automatisiert
   derzeit gegen ein Zielbild, das öffentlich nicht existiert.
1. **P1-Payment-Befunde** — vor jeder Wiederinbetriebnahme des Spendenflusses.

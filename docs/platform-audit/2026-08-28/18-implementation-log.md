# Implementation Log — Platform-Audit 2026-08-28

Alle Änderungen auf Branch `claude/moe-platform-audit-consolidation-4r9obb`,
Basis `d1d4454b57cbd3cd23f0c3b6b7a4576e1eb33ed2`.

Leitlinie: nur reversible, belegte und getestete Änderungen. Kein Eingriff in
produktive Systeme, Datenbanken oder Secrets — dafür fehlten in diesem Audit
ohnehin die Zugänge (EV-0040).

---

## Änderung 1 — P0-002: Cache-Pfad auf den Root-Lockfile korrigiert

**Datei:** `.github/workflows/deploy-plesk.yml` (`:124`, `:220`)

**Ausgangszustand.** Beide Jobs setzten
`cache-dependency-path: apps/website/package-lock.json`. Diese Datei existiert
seit `46dd460` (2026-05-19) nicht mehr.

**Ziel.** `setup-node` läuft durch, die Build-Jobs werden erfolgreich, der
Deploy-Job wird nicht mehr übersprungen.

**Umsetzung.** Verweis auf `package-lock.json` (Repo-Root) geändert, mit
Begründungskommentar, warum der Workspace-Pfad falsch war.

**Warum der Root-Lockfile korrekt ist.**

```text
$ jq '.workspaces' package.json
["apps/website", "apps/babylon-game", "mcp-servers/*"]

$ git ls-files | grep package-lock.json
figma-design-system/package-lock.json
package-lock.json
services/plesk-mail-api/package-lock.json
```

`apps/website` ist ein npm-Workspace; sein Abhängigkeitsbaum steht im
Root-Lockfile.

**Tests.**

1. Reproduktion des ursprünglichen Fehlerbilds: der Pfad
   `apps/website/package-lock.json` existiert nicht →
   `setup-node` bricht mit „Some specified paths were not resolved" ab
   (entspricht dem beobachteten Step-Fehlschlag in Run 246, EV-0022).
1. `npm ci --prefer-offline --ignore-scripts` in `apps/website`
   → **exit 0**, „added 857 packages". Der Install-Schritt war nie das Problem.
1. Nach der Korrektur lösen alle drei `cache-dependency-path`-Einträge des
   Repositories auf:

   ```text
   $ python3 scripts/ci/validate-workflow-cache-paths.py
   ✓ Alle 3 cache-dependency-path-Eintraege sind aufloesbar.
   ```

1. YAML-Validität nach der Änderung geprüft: 8 Jobs, fehlerfrei geparst.

**Rollback.** Ein-Zeilen-Revert je Fundstelle.

**Verbleibende Unsicherheit.** Diese Korrektur allein macht das Deployment
**nicht** grün — P0-001 (Environment-Freigabe) bleibt bestehen und ist der
ältere der beiden Blocker. Ob nach Behebung beider Punkte weitere, bisher
verdeckte Fehler im Deploy-Job auftreten, lässt sich erst am ersten
durchlaufenden Lauf sehen: seit Run 235 (2026-05-16) hat kein Deploy-Job je
einen Step ausgeführt.

---

## Änderung 2 — P0-003: `settings.php` fail-closed in Produktion

**Datei:** `apps/crm/web/sites/default/settings.php`

**Ausgangszustand.**

```php
$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: 'MenschlichkeitOesterreich2024PleaseChangeInProd';
// …
'password' => getenv('DRUPAL_DB_PASS') ?: '',
```

**Ziel.** In `APP_ENV=production` darf kein im Repository sichtbarer Wert mehr
greifen. Ein Start ohne korrektes Secret muss fehlschlagen. Entwicklung und
Test dürfen weiterhin markierte lokale Werte verwenden.

**Umsetzung.** Helferfunktion `moe_required_setting($name, $dev_fallback)`:

- Wert aus der Umgebung vorhanden und nicht leer → wird verwendet.
- Sonst in `APP_ENV=production` → `RuntimeException`, Start bricht ab.
  Die Fehlermeldung nennt **nur den Variablennamen**, nie einen Wert
  (Secret-Hygiene, DSGVO).
- Sonst → ausdrücklich als unsicher markierter Entwicklungswert.

Abgesichert sind `DRUPAL_HASH_SALT`, `DRUPAL_DB_NAME`, `DRUPAL_DB_USER` und
`DRUPAL_DB_PASS`. Der Entwicklungswert für den Salt heißt jetzt
`dev-only-insecure-hash-salt-do-not-use-in-production` — als Produktionswert
selbsterklärend untauglich.

Zwei Härtungen an der Helferfunktion selbst:

- Sie liest `APP_ENV` direkt über `getenv()` statt aus einer globalen
  Variablen. Damit ist sie unabhängig von der Auswertungsreihenfolge in der
  Datei; ein `$GLOBALS`-Zugriff im Funktionsrumpf entfällt.
- Sie steht in einem `function_exists()`-Guard. Drupal kann `settings.php`
  mehrfach einbinden; ohne den Guard wäre die erneute Deklaration ein Fatal
  Error.

**Tests.** Harness lädt `settings.php` in simulierter Umgebung:

| # | Umgebung | Erwartung | Ergebnis |
| - | -------- | --------- | -------- |
| 1 | `production`, kein Secret | Abbruch | ✅ `FAILED_CLOSED` (`DRUPAL_DB_NAME`) |
| 2 | `development`, kein Secret | lädt mit Dev-Wert | ✅ `hash_salt=dev-only-insecure-…` |
| 3 | `production`, alle Secrets gesetzt | lädt normal | ✅ `hash_salt=real-salt-from-vault` |
| 4 | `production`, DB-Pass fehlt | Abbruch | ✅ `FAILED_CLOSED` |
| 5 | `production`, nur `DRUPAL_HASH_SALT` fehlt | Abbruch | ✅ `FAILED_CLOSED: … DRUPAL_HASH_SALT ist nicht gesetzt` |
| 6 | `production`, `DRUPAL_HASH_SALT=''` | Abbruch | ✅ `FAILED_CLOSED` (leer zählt als fehlend) |

Zusätzlich verifiziert: zweifaches `require` derselben Datei lädt fehlerfrei
(Redeklarationsschutz greift), `php -l` fehlerfrei. Der alte Festwert ist
repository-weit nicht mehr auffindbar (`grep` über alle Dateien, außer dieser
Auditdokumentation).

**Rollback.** Revert der Datei.

**Verbleibende Unsicherheit.** Ob und wo `APP_ENV=production` in der
Plesk-Laufzeit tatsächlich gesetzt wird, ist `UNKNOWN` (kein SSH-Zugang). Wird
es **nicht** gesetzt, greift der Entwicklungspfad — dann startet Drupal zwar,
aber mit einem offensichtlich als unsicher markierten Salt statt mit einem, der
wie ein Produktionswert aussieht. Das ist bereits eine Verbesserung, ersetzt
aber nicht die Prüfung, dass `APP_ENV` in der Laufzeit korrekt gesetzt ist.
Diese Prüfung gehört zur Inbetriebnahme von Drupal (das derzeit ohnehin nicht
deployt ist, EV-0005).

---

## Änderung 3 — Regressionsschutz für P0-002

**Neue Datei:** `scripts/ci/validate-workflow-cache-paths.py`
**Geänderte Datei:** `.github/workflows/validate-github-files.yml`

**Motivation.** P0-002 war deshalb so folgenreich, weil das Fehlerbild
(fehlgeschlagener Build-Step) nicht nach „Deployment ausgefallen" aussah. Ein
expliziter Check macht denselben Fehler künftig sofort erkennbar.

**Umsetzung.** Das Skript sammelt alle `cache-dependency-path`-Einträge aus
`.github/workflows/*.yml|yaml` und prüft, ob jedes Muster im Repository
auflöst. Werte mit `${{ … }}` werden übersprungen, da sie erst zur Laufzeit
aufgelöst werden. Exit 1 mit Datei-, Zeilen- und Pfadangabe bei Fehlern.

Eingebunden als eigener Step in `validate-github-files.yml`; das Skript wurde
zusätzlich in die `paths`-Trigger beider Auslöser aufgenommen, damit
Änderungen am Prüfskript selbst den Workflow starten.

**Tests.**

*Positivfall (aktueller Stand):*

```text
✓ Alle 3 cache-dependency-path-Eintraege sind aufloesbar.   exit=0
```

*Negativfall (ursprünglicher Bruch per `git stash` wiederhergestellt):*

```text
✗ Nicht aufloesbare cache-dependency-path-Eintraege gefunden:
  - .github/workflows/deploy-plesk.yml:124: cache-dependency-path 'apps/website/package-lock.json' existiert nicht
  - .github/workflows/deploy-plesk.yml:220: cache-dependency-path 'apps/website/package-lock.json' existiert nicht

Folge: setup-node/setup-python schlaegt fehl, abhaengige Deploy-Jobs werden uebersprungen.
exit=1
```

Der Guard erkennt also nachweislich genau den Defekt, der die Produktion
blockiert hat.

**Rollback.** Step entfernen, Skript löschen.

---

## Bewusst *nicht* umgesetzt

| Befund | Grund |
| ------ | ----- |
| P0-001 (Environment-Freigabe) | Nicht aus dem Repository behebbar — GitHub-Environment-Einstellung, erfordert Administrationszugriff. |
| P1-001 (Stripe-Inbox) | Berührt den Zahlungspfad und erfordert eine Datenbankmigration. Ohne Zugriff auf das reale Schema und ohne Testumgebung nicht sicher verifizierbar. Entwurf steht in [16-findings.md](16-findings.md). |
| P1-002 (PII an Slack) | Kleine, lokale Änderung — aber sie ändert das Alerting-Verhalten im Zahlungspfad. Sinnvoll gemeinsam mit P1-001 in einem Payment-PR, mit Abstimmung darüber, welche Felder der Betrieb tatsächlich braucht. |
| P1-003 (`donation_type`/`purpose`) | Die Geschäftsregel ist ungeklärt (werden wiederkehrende Beiträge angeboten? was bedeutet `source` fachlich?). Eine Codeänderung wäre geraten. |
| P2-002 (Default-Credentials) | Unklar, welche Compose-Dateien Entwicklungs- und welche Produktionsvorlagen sind. Eine Umstellung auf fail-closed würde lokale Abläufe brechen, ohne belegten Nutzen. |
| Löschen von Legacy-Verzeichnissen | `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `web/`, `new/`, `_MIGRATION/` existieren im Repo-Root. Referenzprüfung nicht abgeschlossen — Löschen ohne diese Prüfung ist laut Auftrag ausdrücklich unzulässig. |

# Plesk Hosting – Aktuelle Best Practices

Dieses Dokument beschreibt nur den **aktuellen** Betriebsvertrag fuer die Produktionsumgebung. Aeltere Beispiele mit `develop`-Deploys, direkten Plesk-Git-Deploys oder `/api/health` als Primaercheck gelten nicht mehr als aktiv.

## Kanonischer Deploy-Weg

- Produktionsdeploy nur ueber `.github/workflows/deploy-plesk.yml`
- Secrets und Variablen nur im `PLESK_*`-Namensraum
- Lokale Shell-Skripte wie `scripts/deploy-to-plesk.ps1`, `scripts/deploy.sh` oder `scripts/post_deploy_verify.sh` sind nur Fallback- und Diagnosehilfen

## Kanonische Zielpfade

| Service               | Zielpfad                                |
| --------------------- | --------------------------------------- |
| Website / Portal      | `httpdocs`                              |
| API                   | `subdomains/api/httpdocs`               |
| CRM-Portal            | `subdomains/crm/httpdocs`               |
| Drupal/CiviCRM Native | `subdomains/crm/httpdocs/native`        |
| CRM Build-Staging     | `subdomains/crm/httpdocs/.native-build` |
| Games                 | `subdomains/games/httpdocs`             |

## Health- und Smoke-Vertrag

- Website: `https://www.menschlichkeit-oesterreich.at/`
- API Liveness: `https://api.menschlichkeit-oesterreich.at/healthz`
- API Readiness: `https://api.menschlichkeit-oesterreich.at/readyz`
- CRM-Portal: `https://crm.menschlichkeit-oesterreich.at/`
- CRM Native: `https://crm.menschlichkeit-oesterreich.at/native/`
- Games: `https://games.menschlichkeit-oesterreich.at/`

`/health` bleibt nur Legacy-Alias und darf nicht mehr als primaerer Betriebsvertrag dokumentiert werden.

## Plesk-Betrieb

- SSH-Zugang fuer Deploys nur ueber den dedizierten Plesk-User mit hinterlegtem `known_hosts`
- Build-Artefakte werden in GitHub Actions erzeugt; der Server ist kein Build-Ort fuer Frontend oder Games
- CRM-Native wird serverseitig nur fuer Composer/Drush-Finalisierung in `.native-build` vorbereitet und dann nach `native/` synchronisiert
- Direkte Plesk-Git-Deploys sind fuer dieses Repo nicht kanonisch

## Harter Maintainer-Check vor Live-Rollout

1. `README_DEPLOY.md` mit `.github/workflows/deploy-plesk.yml` abgleichen.
2. Sicherstellen, dass nur `PLESK_*` in aktiven Deploy-Templates und Runbooks verwendet wird.
3. Smoke-Checks gegen `/healthz` und `/readyz` ausfuehren.
4. Legacy-/Mirror-Pfade nicht als aktive Quelle deployen.

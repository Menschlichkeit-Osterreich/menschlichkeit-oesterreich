# Deployment-Hinweis

Die aktive Deployment-Dokumentation lebt im Root unter `README_DEPLOY.md`.

Dieses Dokument bleibt nur als schlanker Einstieg fuer Leser:innen innerhalb von `docs/` bestehen.

## Kanonische Quellen

- `README_DEPLOY.md`
- `.github/workflows/deploy-plesk.yml`
- `scripts/deploy-to-plesk.ps1` nur als lokaler Fallback

## Wichtige Regeln

- Produktionsdeploy nur ueber GitHub Actions plus Plesk
- Aktiver Variablenvertrag nur mit `PLESK_*`
- API-Health kanonisch unter `/healthz` und `/readyz`

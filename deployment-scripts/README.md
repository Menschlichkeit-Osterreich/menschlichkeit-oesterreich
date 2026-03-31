# Deployment Scripts – Plesk & Multi-Service

Diese Skripte automatisieren Builds und Deployments auf der Plesk-Umgebung mit Subdomain-Architektur.

## Produktiver Standard

Der kanonische Produktionspfad ist der GitHub-Workflow `.github/workflows/deploy-plesk.yml`.

- `www.menschlichkeit-oesterreich.at` bekommt den hostbewussten Build aus `apps/website/`.
- `crm.menschlichkeit-oesterreich.at` bekommt denselben Build als Portal-Root.
- `crm.menschlichkeit-oesterreich.at/native/` bekommt das native Drupal/CiviCRM-Runtime aus `apps/crm/`.
- `api.` und `games.` bleiben eigenstaendige Deploy-Ziele.

## Wichtige Skripte

- ./scripts/safe-deploy.sh: Sicherer Deploy mit Vorab-Checks (immer zuerst mit --dry-run)
- ./deployment-scripts/deploy-crm-plesk.sh: Legacy-Hilfsskript fuer native CRM-Arbeit; produktiv gilt der Workflow-Split aus `deploy-plesk.yml`
- ./deployment-scripts/deploy-api-plesk.sh: API-Deployment (FastAPI)
- ./build-pipeline.sh: Qualität prüfen, bauen, Berichte erzeugen

## Nutzung

1. Qualität prüfen (PR-Blocking Gates)

```bash
npm run lint && npm run test:unit && npm run security:gitleaks
```

2. Build Pipeline

```bash
./build-pipeline.sh staging
```

3. Dry-Run Deployment

```bash
./scripts/safe-deploy.sh --dry-run
```

4. Produktives Deployment (nur nach Dry-Run OK)

```bash
./scripts/safe-deploy.sh
```

## Hinweise & Sicherheit

- Immer zuerst Dry-Run nutzen; keine destruktiven Aktionen ohne Simulation
- Secrets via secrets/ und config-templates/ pflegen – niemals in Skripte schreiben
- SBOM/Supply-Chain prüfen (Trivy) nach Paketänderungen
- Pro Service eigene Deploy-Skripte verwenden (Subdomain-Mapping beachten)

## Fehlerbehebung

- Logs prüfen unter logs/ und quality-reports/
- Plesk-Verbindungen: SSH/rsync-Parameter in den Skripten verifizieren
- Siehe PRODUCTION-DEPLOYMENT-CHECKLIST.md für weitere Details

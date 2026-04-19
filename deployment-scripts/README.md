# Deployment Scripts – Plesk & Multi-Service (Fallback/Legacy)

Diese Skripte sind historische oder lokale Hilfsmittel fuer Builds und Dry-Runs auf der Plesk-Umgebung.
Der produktive Deploy-Vertrag wird im GitHub-Workflow gepflegt.

## Produktiver Standard

Der kanonische Produktionspfad ist der GitHub-Workflow `.github/workflows/deploy-plesk.yml`.

- `www.menschlichkeit-oesterreich.at` bekommt den hostbewussten Build aus `apps/website/`.
- `crm.menschlichkeit-oesterreich.at` bekommt denselben Build als Portal-Root.
- `crm.menschlichkeit-oesterreich.at/native/` bekommt das native Drupal/CiviCRM-Runtime aus `apps/crm/`.
- `api.` und `games.` bleiben eigenstaendige Deploy-Ziele.

## Wichtige Skripte

- ./scripts/deploy-to-plesk.ps1: Fallback fuer lokale Vorbereitung und Dry-Runs
- ./scripts/safe-deploy.sh: Legacy-Hilfsskript, nicht kanonisch fuer produktive Deploys
- ./deployment-scripts/deploy-crm-plesk.sh: Legacy-Hilfsskript fuer native CRM-Arbeit
- ./deployment-scripts/deploy-api-plesk.sh: Legacy-Hilfsskript fuer API-Deploys
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

3. Dry-Run Fallback

```bash
pwsh -File scripts/deploy-to-plesk.ps1 -Target all -DryRun
```

4. Produktives Deployment

```bash
# via GitHub Actions:
# .github/workflows/deploy-plesk.yml
```

## Hinweise & Sicherheit

- Immer zuerst Dry-Run nutzen; produktive Deploys nur ueber den kanonischen Workflow
- Secrets via secrets/ und config-templates/ pflegen – niemals in Skripte schreiben
- SBOM/Supply-Chain prüfen (Trivy) nach Paketänderungen
- Pro Service den Workflow-Input service verwenden (Subdomain-Mapping liegt im Workflow)

## Fehlerbehebung

- Logs prüfen unter logs/ und quality-reports/
- Plesk-Verbindungen: SSH/rsync-Parameter in den Skripten verifizieren
- Siehe PRODUCTION-DEPLOYMENT-CHECKLIST.md für weitere Details

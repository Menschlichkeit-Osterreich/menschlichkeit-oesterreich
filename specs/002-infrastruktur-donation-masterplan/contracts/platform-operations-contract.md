# Contract: Platform Operations Gate

## Vorrang und Zweck

GitHub Issue #539 hat Vorrang vor früheren Azure- oder n8n-Zielbildern.
Dieser Contract definiert den Betriebsvertrag der produktiven Plattform:
GitHub Actions und BSM für Deploy-Verträge, Plesk als Hosting-Ziel,
FastAPI/PostgreSQL für kritische Fachzustände und Make für nachgelagerte
Orchestrierung.

## In Scope

- Plesk-Deployment, SSH-Härtung und read-only Runtime-Audit
- BSM-Metadaten- und Consumer-Vertrag ohne Secret-Werte
- FastAPI/PostgreSQL für Webhook-Inbox, Payment-Zustand und Outbox
- Make über signierten Claim-/Lease-/Ack-Transport
- CiviCRM-/ERPNext-Reconciliation, datensparsame Slack-Alerts und
  dokumentierte Backup-/Restore-Grenzen

## Out of Scope

- Azure-Provisionierung oder neue n8n-Produktentwicklung
- direkte Make- oder n8n-Schreibzugriffe auf kritische PostgreSQL-Tabellen
- unfreigegebene Subscription-, Beleg-, DNS-, Secret-Rotations- oder
  Produktivmigrationen

## Invarianten

- Kein Secret verlässt BSM oder gelangt in Job-Outputs, Logs oder Dokumente.
- Make wird weder Payment- noch Ledger-Owner und erhält keine DB-Credentials.
- n8n ist Migrationsquelle; Entfernung erfolgt erst nach Export, Ersatztest,
  Reconciliation und Rollback-Fenster.
- GitHub Actions sind der Deployment-Owner; n8n/Make dürfen keinen Deploy
  freigeben.
- Keine Produktivfreigabe ohne frische Evidenz für die jeweilige Stufe.

## Pflichtnachweise

- `VERIFIED_REPO`: Review, Tests und statische Contracts
- `VERIFIED_CI`: Green Run des aktuellen Commit mit Security-/Workflow-Gates
- `VERIFIED_STAGING`: Build, Unit, Integration, BSM, SSH, Deploy, Health und
  Release Marker
- `VERIFIED_PRODUCTION_PREFLIGHT`: Backup-/Restore-Vertrag, Genehmigungen,
  aktueller Migrationsstand und kontrollierter Dry Run
- `VERIFIED_LIVE`: zeitnaher, datensparsamer Readback des realen Zustands

RTO/RPO und Alert-Ack-Zeiten werden erst nach belastbarem Betriebsnachweis
vereinbart; sie werden nicht als unbelegte Konstante behauptet.

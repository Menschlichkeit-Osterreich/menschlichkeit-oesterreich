# IMPLEMENTATION_ROADMAP

## Sofort blockierend
1. Vollständiger Secret-History-Rewrite und Rotation für frühere CRM-/CiviCRM-Credentials.
2. Runtime-DDL in `apps/api/app/routers/finance.py` entfernen und auf Alembic-only umstellen.
3. Legacy-Frontend-Pfade mit `VITE_API_BASE_URL` auf einen einheitlichen API-Client zurückführen.
4. n8n-Inline-Mail-Nodes auf `internal/mail/send` migrieren.

## Hoch
1. OpenAPI auf den jetzt real implementierten Vertrag synchronisieren.
2. Template-Render- und API-Tests für Auth/Newsletter/Contact/Payments/Webhooks ergänzen.
3. SEPA-/Dunning-Flows von Compat auf belastbare Business-Services anheben.
4. CiviCRM-Mapping-IDs sauber als ENV/Config dokumentieren.

## Mittel
1. Website-Admin-/Backoffice-Komponenten von direktem CRM/Legacy-API-Zugriff bereinigen.
2. Privacy-Export/Löschung mit echter Retention-/Review-Logik anreichern.
3. Outbox-Worker / Retry-Worker ergänzen.

## Nice to have
1. Template-Snapshots in CI
2. Workflow-Schema-Validation für n8n-JSONs
3. PDF-Generierung für Receipt/Dunning vollständig automatisiert

## Reihenfolge
1. Secrets/Config
2. API-Vertrag/Datenmodell
3. Frontend-Client-Konsolidierung
4. n8n-Redrahtung
5. Mail-/Template-Governance
6. Test-/CI-Ausbau

## Abhängigkeiten
- Secret-Rotation vor finalem Production-Rollout
- Alembic-Bereinigung vor DB-Neuaufsetzung
- OpenAPI-Sync nach Endpunkt-Freeze

## Risiken
- Alte n8n-Workflows könnten auf nicht dokumentierte Nebeneffekte angewiesen sein.
- Production-CRM könnte ohne gesetzte ENV-Variablen nach der Entkopplung nicht starten.
- History-Rewrite beeinflusst offene Branches und PRs.

## Definition of Done
- Öffentliche Website nutzt nur noch FastAPI.
- Keine Klartext-Secrets im Tree.
- Alembic migriert leere DB reproduzierbar.
- Kernflüsse sind getestet und dokumentiert.

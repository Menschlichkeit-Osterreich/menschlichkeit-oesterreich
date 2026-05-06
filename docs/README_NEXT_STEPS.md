# Historische Next-Steps-Notiz

Diese Datei ist **kein aktiver Umsetzungsplan** mehr. Sie wird nur als historische Referenz behalten.

## Kanonische aktive Plaene

- Maintainer-Entscheidungsgrundlage: `reports/repository-live-stabilization-assessment-2026-03-31.md`
- Deployvertrag und Betriebsgrenzen: `README_DEPLOY.md`
- Repo-Zonen und aktive Pfade: `README.md`
- Dokumentationsindex: `docs/README.md`
- Monitoring- und Health-Vertrag: `docs/operations/monitoring.md`

## Fuer neue Arbeit verbindlich

- Produktive Rollouts nur ueber `.github/workflows/deploy-plesk.yml`
- API-Monitoring auf `/healthz` und `/readyz`
- `PLESK_*` als einziger aktiver Deploy-/Secrets-Namensraum
- Keine neue Produktarbeit in `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `new/`, `web/`, `services/`, `templates/` oder `tools/`

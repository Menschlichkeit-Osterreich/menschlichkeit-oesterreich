# Plattform-Recovery-Status – 29.08.2026

## Aktueller Stand

| Feld                  | Wert                                       |
| --------------------- | ------------------------------------------ |
| Aktueller Main        | `e75706b4af300c7e506fe026711ff19f643f365b` |
| Arbeitsbranch         | `codex/recovery-governance`                |
| Programmstatus        | `BLOCKED_OWNER_ACTION`                     |
| Architekturanker      | GitHub Issues #539 und #541                |
| Produktionsänderungen | Keine durchgeführt                         |

`BLOCKED_OWNER_ACTION` ist kein Qualitätsurteil über den Repository-Stand. Er
bedeutet, dass notwendige Zugriffs- und Freigabe-Evidenz für die nächste
Produktionsstufe noch fehlt.

## Evidenzmodell

`VERIFIED_REPO` belegt nur versionierte Artefakte. `VERIFIED_CONFIG`,
`VERIFIED_CI`, `VERIFIED_CONNECTOR`, `VERIFIED_STAGING`,
`VERIFIED_PRODUCTION_PREFLIGHT` und `VERIFIED_LIVE` dürfen erst nach einer
frischen Prüfung der jeweiligen Grenze gesetzt werden. Ein grüner lokaler Test
ersetzt keine Connector-, Staging- oder Live-Evidenz.

## Capability-Preflight

| System     | Status                          | Belegter Rahmen                                               | Nächste sichere Aktion                                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GitHub     | `VERIFIED_CONNECTOR`            | Repository, Main und offene Arbeit sind lesbar.               | Schutzregeln und erforderliche Checks mit passender Administration prüfen.                           |
| BSM        | `CAPABILITY_PERMISSION_MISSING` | Lokales Mapping ist lesbar; BSM-Metadaten sind nicht lesbar.  | Metadatencheck je geänderter UUID, ohne Secret-Werte.                                                |
| Plesk      | `BLOCKED_OWNER_ACTION`          | Nur Repository-Vertrag ist geprüft.                           | Nach statischen Tests einen explizit freigegebenen Read-only-Audit durchführen.                      |
| Make       | `BLOCKED_OWNER_ACTION`          | Vorhandene Teamumgebung enthält fremde Organisationsbereiche. | Isoliertes Menschlichkeit-Österreich-Team und Connection-Allowlist bestätigen.                       |
| SharePoint | `BLOCKED_OWNER_ACTION`          | Ein enger kanonischer Zielbereich ist nicht bestätigt.        | Site und Bibliothek explizit benennen; bis dahin keine Suche außerhalb des Scopes und keine Writes.  |
| Slack      | `VERIFIED_CONNECTOR`            | Operationskanal ist auffindbar.                               | Nur datensparsames Alert-Schema nach Channel-/Retention-Bestätigung verwenden.                       |
| Stripe     | `VERIFIED_CONNECTOR`            | Read-only-Webhook-Vertrag ist sichtbar.                       | Ereignisabdeckung gegen den FastAPI-Vertrag abgleichen; keine Mutation.                              |
| PostHog    | `SECURITY_CONTAINMENT_REQUIRED` | Connector-Antwort enthielt geheimnisähnliche Informationen.   | Zugang durch Owner prüfen/neu verbinden; bis dahin keine weiteren Abfragen oder Tracking-Änderungen. |

## Zielarchitektur und System-of-Record

| System               | Rolle                                                | System of Record           | Status                 |
| -------------------- | ---------------------------------------------------- | -------------------------- | ---------------------- |
| GitHub               | versionierter Code, CI und technische Dokumentation  | ja für Code/Technik        | `VERIFIED_REPO`        |
| BSM                  | Secret-Metadaten und Laufzeitinjektion               | ja für Secrets             | `BLOCKED_OWNER_ACTION` |
| FastAPI + PostgreSQL | Payment-, Webhook-, Inbox-, Outbox- und Kernzustände | ja                         | `IN_PROGRESS`          |
| Stripe               | Payment Provider                                     | ja für Provider-Ereignisse | `VERIFIED_CONNECTOR`   |
| Make                 | nachgelagerte Orchestrierung                         | nein                       | `BLOCKED_OWNER_ACTION` |
| CiviCRM              | CRM                                                  | ja                         | `BLOCKED_EXTERNAL`     |
| ERPNext              | Buchhaltung                                          | ja                         | `BLOCKED_EXTERNAL`     |
| SharePoint           | Vereins- und Betriebsdokumentation                   | ja nach Scope-Freigabe     | `BLOCKED_OWNER_ACTION` |
| Slack                | handlungsrelevante, datensparsame Alarme             | nein                       | `VERIFIED_CONNECTOR`   |
| n8n                  | Migrationsquelle und forensische Referenz            | nein                       | `MIGRATION_ONLY`       |
| Azure                | historische Architektur                              | nein                       | `LEGACY`               |

## Track-Register

| Track               | Status                 | Nächster belegbarer Meilenstein                                        |
| ------------------- | ---------------------- | ---------------------------------------------------------------------- |
| A – Repository      | `VERIFIED_REPO`        | logisch getrennte Recovery-Branches mit frischem Diff-Review           |
| B – BSM             | `BLOCKED_OWNER_ACTION` | Metadatencheck und statischer Secret-Contract                          |
| C – Plesk           | `IN_PROGRESS`          | getesteter Read-only-Auditvertrag, danach genehmigter Auditlauf        |
| D – CI/CD           | `IN_PROGRESS`          | relevante Workflow- und Actions-Prüfungen in CI                        |
| E – Security        | `BLOCKED_ENVIRONMENT`  | Gitleaks/Trivy/Dependency-Review/SBOM im unterstützten CI-Lauf         |
| F – Datenbank       | `IN_PROGRESS`          | ein Alembic-Head auf frischer und repräsentativer PostgreSQL-Datenbank |
| G – Payment         | `IN_PROGRESS`          | Inbox/Outbox-Idempotenz und Signaturpfade mit Integrationsbelegen      |
| H – Make            | `BLOCKED_OWNER_ACTION` | isoliertes Team, Allowlist, inaktiver Testkonsument                    |
| I – n8n             | `IN_PROGRESS`          | vollständiges Migrationsledger mit Cutover-/Rollback-Nachweisen        |
| J – CiviCRM/ERPNext | `BLOCKED_EXTERNAL`     | bestätigte Endpunkte, Datenverträge und Reconciliation-Referenzen      |
| K – SharePoint      | `BLOCKED_OWNER_ACTION` | bestätigte langlebige Zielbibliothek                                   |
| L – Slack           | `IN_PROGRESS`          | Alert-Schema und Runbook-Referenzen, keine Testnachricht               |
| M/N – Analytics/UI  | `NOT_APPLICABLE`       | nur bei einem separaten Produkt- oder Websiteauftrag                   |

## Unvermeidbare Owner-Aktionen

| System            | Exakter Ort                                         | Aktion                                                                         | Hebt auf                            |
| ----------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| BSM               | geänderte Einträge in `.github/bsm-secret-ids.json` | Read-only-Metadatencheck `id`, `key`, `projectId`, `revisionDate` ermöglichen. | BSM-/Plesk-Vertrag                  |
| GitHub            | Repository Rulesets und Environments                | erforderliche Checks und Production-Approval sichtbar machen.                  | CI-/Release-Gate                    |
| Plesk             | genehmigter manueller Workflow-Lauf                 | ausschließlich Read-only-Audit nach statischer Freigabe erlauben.              | Live-Prefight                       |
| Make              | dediziertes MOE-Team und Connections                | positive Allowlist für CiviCRM, ERPNext, Slack und SharePoint bereitstellen.   | inaktiver Make-Testkonsument        |
| SharePoint        | benannte Site und Dokumentbibliothek                | Zielbereich und Schreibfreigabe für Betriebsdokumente bestätigen.              | Operationsablage                    |
| Fachverantwortung | Spenden-/Buchhaltungsprozess                        | Subscription- und Belegregeln separat freigeben.                               | Folge-Scopes, nicht Einmalzahlungen |

## Nächste ausführbare Aktion

Die lokalen Recovery-PR-Schnitte vollständig testen, getrennt reviewen und
ohne Auto-Merge zur Freigabe vorbereiten. Produktive Deployments, Datenbank-
Migrationen, Stripe-Mutationen, Make-Aktivierungen, Restore, DNS/TLS- oder
Secret-Rotationen bleiben bis zu einem expliziten Release-Gate verboten.

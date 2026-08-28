# Runtime Service and Reverse Proxy Register

Stand: 2026-08-28T06:26:31Z

Alle Zeilen beschreiben Repo-Konfiguration oder Zielzustand. Aktive Ports, Prozesse und VHosts in Produktion bleiben bis zum Plesk-Audit `UNKNOWN`.

| Host | Public Port und TLS | Repo-Proxy | Backend-Transport | Runtime | Health | Deployment Owner | Live-Status | Evidenz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hauptdomain und `www` | 80 Redirect, 443 TLS | Nginx | statische Dateien; dynamische Sitemap ueber API | Website Build | `/` | GitHub Actions und Plesk TARGET | UNKNOWN | VERIFIED_REPO: Hauptdomain-Nginx und `deploy-plesk.yml` |
| API | 80 Redirect, 443 TLS | Nginx | `CONFLICTING_REPO`; interner Transport redigiert | FastAPI/Uvicorn, Python | extern `/api/version`; intern `/healthz` | GitHub Actions und API Operations TARGET | CONFLICTING | VERIFIED_REPO: Backend-Transport und Prozessmodell widersprechen sich; Live-Detail bleibt ephemer |
| CRM | 80 Redirect, 443 TLS | Nginx | statisches Portal; `/native` ueber PHP-FPM | Drupal/CiviCRM, PHP-FPM 8.2 im Repo | `/` | GitHub Actions und CRM Operations TARGET | UNKNOWN | VERIFIED_REPO: CRM-Nginx und Deployment-Workflow |
| Games | 80 Redirect, 443 TLS | Nginx | statische Dateien | gebautes Game-Frontend | `/` | GitHub Actions und Product Operations TARGET | UNKNOWN | VERIFIED_REPO: Games-Nginx und Deployment-Workflow |
| Forum | 80 Redirect, 443 TLS | Nginx | PHP-FPM; interner Pfad redigiert | phpBB, PHP-FPM 8.3 im Repo | `/` | Forum Operations TARGET | CONFLICTING | VERIFIED_REPO: Runtime vorhanden; Repo-Root und Plesk-Sollreferenz kollidieren |
| n8n | 80 Redirect, 443 TLS | Nginx | Reverse Proxy zu n8n; interner Transport redigiert | n8n 1.72.1 im Repo-Compose, PostgreSQL und Redis | `/healthz` | Automation Operations TARGET | UNKNOWN | VERIFIED_REPO: Nginx und Compose; aktive Runtime UNKNOWN |
| ERPNext | UNKNOWN | UNKNOWN | UNKNOWN | Frappe/ERPNext TARGET | UNKNOWN | Finance Operations TARGET | BLOCKED | Kein kanonischer Endpoint oder Plesk-VHost im geprueften Repo-Scope bestaetigt |

## Runtime-Vertrag

- Payment Acceptance, Webhook Receipt, Event Persistence und Membership Core Writes duerfen nicht von Make, Slack, PostHog oder n8n abhaengen.
- Der kritische Pfad ist Stripe zu FastAPI zu Durable Inbox zu asynchroner Verarbeitung zu CiviCRM und ERPNext Queue.
- Health-Probes duerfen keine PII, Secrets oder internen Diagnosedetails liefern.
- Ein oeffentlicher 2xx- oder 3xx-Status belegt Erreichbarkeit, nicht die vollstaendige fachliche Funktionsfaehigkeit.
- Repo-Versionen werden erst nach Live-Readback als `VERIFIED_LIVE` uebernommen.

## Kritischer Repo-Konflikt

API-Nginx und Deployment-Workflow definieren unterschiedliche interne Backend-Transporte. Das ist `AGENTIC_DRIFT_HIGH` und eine Reliability-Luecke. Es wird nicht durch Annahme korrigiert. Der oeffentliche Audit prueft Erreichbarkeit und begrenzte Statuswerte, publiziert aber keine interne Topologie. Die konkrete Live-Klaerung bleibt `BLOCKED`, bis sie ueber eine sichere, nicht veroeffentlichende Runtime-Abfrage belegt ist. Danach sind Nginx, Deployment und Runbook auf genau ein beaufsichtigtes Runtime-Modell zu konsolidieren.

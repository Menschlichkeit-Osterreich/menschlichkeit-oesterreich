# Domain and Subdomain Register

Stand: 2026-08-28T06:26:31Z

Dieses Register trennt Repo-Evidenz strikt vom noch ungeprueften Live-Zustand. DNS, Zertifikate und Plesk-VHosts bleiben bis zum lesenden Produktionsaudit `UNKNOWN`.

| Host | Zweck und Owner | Repo-Runtime | Externer Health-Pfad | DNS | TLS | Plesk-VHost | Datenabhaengigkeit | Sichtbarkeit | Status | Evidenz und Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `menschlichkeit-oesterreich.at` | Vereinswebsite; Technical Operations | Nginx, statische Website; Sitemap-Proxy zur API | `/` | UNKNOWN | UNKNOWN | UNKNOWN | API nur fuer dynamische Funktionen | public | UNKNOWN | VERIFIED_REPO: Nginx-Konfiguration; ACTIVE_CANONICAL |
| `www.menschlichkeit-oesterreich.at` | kanonische Weiterleitung; Technical Operations | Nginx Redirect zur Hauptdomain | `/` | UNKNOWN | UNKNOWN | UNKNOWN | keine direkte | public | UNKNOWN | VERIFIED_REPO: Nginx-Konfiguration; ACTIVE_SUPPORTING |
| `api.menschlichkeit-oesterreich.at` | zentrale Business- und Integrationslogik; API Owner | Nginx und Deployment widersprechen sich beim internen Backend-Transport; Detailwerte werden nicht publiziert | extern `/api/version`; internes `/healthz` ist absichtlich nicht oeffentlich | UNKNOWN | UNKNOWN | UNKNOWN | FastAPI PostgreSQL; CiviCRM und ERPNext ueber Integrationen | public API | CONFLICTING | VERIFIED_REPO: Nginx, API und Deployment; ACTIVE_CANONICAL nach Live-Klaerung |
| `crm.menschlichkeit-oesterreich.at` | CRM und Membership; CiviCRM Owner | Portal statisch, `/native` ueber PHP-FPM 8.2 | `/` | UNKNOWN | UNKNOWN | UNKNOWN | Drupal/CiviCRM MariaDB; optional Redis | public mit geschuetzten Fachfunktionen | UNKNOWN | VERIFIED_REPO: Nginx und Deployment-Doku; ACTIVE_CANONICAL; CiviCRM bleibt auf Plesk |
| `games.menschlichkeit-oesterreich.at` | Vereinsgame; Product Owner | Nginx, statische Anwendung | `/` | UNKNOWN | UNKNOWN | UNKNOWN | keine direkte Repo-Evidenz | public | UNKNOWN | VERIFIED_REPO: Nginx-Konfiguration; ACTIVE_CANONICAL |
| `forum.menschlichkeit-oesterreich.at` | Community-Forum; Forum Owner | phpBB ueber PHP-FPM 8.3 | `/` | UNKNOWN | UNKNOWN | UNKNOWN | Forum PostgreSQL und Redis | public | CONFLICTING | VERIFIED_REPO: Nginx-Root und Plesk-Sollreferenz widersprechen sich; TRANSITIONAL bis Live-Abgleich |
| `n8n.menschlichkeit-oesterreich.at` | bestehende Workflow-Automation; Automation Owner | Nginx zu n8n; interner Transport redigiert | `/healthz` | UNKNOWN | UNKNOWN | UNKNOWN | n8n PostgreSQL und Redis | public UI/Webhooks mit Authentisierung | UNKNOWN | VERIFIED_REPO: Nginx und Compose; TRANSITIONAL bis 100-Prozent-Inventar und Make-Entscheidungen |
| `erp.menschlichkeit-oesterreich.at` | ERPNext Accounting Authority; Finance Operations | UNKNOWN | `/` nur als Sollprobe | UNKNOWN | UNKNOWN | UNKNOWN | ERPNext/Frappe Datenbank | UNKNOWN | UNKNOWN | TARGET: Accounting Authority; Live-Endpunkt und Runtime BLOCKED bis Verbindung oder Plesk-Evidenz |

## Konflikt- und Pflegevorgaben

- Live Runtime und produktive Konfiguration haben Vorrang vor dieser Repo-Matrix.
- Der Forum-Pfad darf nicht durch Annahme bereinigt werden. Erst Live-VHost, Deployment und Datenhaltung lesen, dann genau einen kanonischen Pfad festlegen. Konkrete interne Pfade bleiben aus dem oeffentlichen Register entfernt.
- Neue Subdomains werden erst nach DNS-, TLS-, Owner-, Datenschutz- und Rollback-Pruefung aufgenommen.
- A-, AAAA- oder CNAME-Zielwerte werden nicht im oeffentlichen Register publiziert. Der Audit bewertet nur die Aufloesbarkeit.

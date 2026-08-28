# Offene Verifikationslücken — Platform-Audit 2026-08-28

Der Auditauftrag fordert 17 verbindliche Register. Erstellt wurden die, für die
belastbare Evidenz vorliegt. Die übrigen bleiben **bewusst offen**.

Das ist kein Versäumnis, sondern die Anwendung der obersten Auditregel:
*„Keine Vermutung darf als Tatsache dokumentiert werden."* Ein aus
Repository-Inhalten zusammengeschriebenes Runtime-Register hätte den Anschein
von Verifikation, ohne sie zu leisten — und wäre genau die Art von Drift, die
dieses Audit beseitigen soll.

---

## Erstellt

| Register | Dokument | Grundlage |
| -------- | -------- | --------- |
| Evidence Ledger | [01-evidence-ledger.md](01-evidence-ledger.md) | Live-Probes, GitHub Actions API, Repository |
| Domain- & Subdomain-Register | [02-domain-subdomain-register.md](02-domain-subdomain-register.md) | DNS + HTTPS-Response-Inspektion |
| Deployment Contract | [13-deployment-contract-matrix.md](13-deployment-contract-matrix.md) | Workflow-Definition + Run-Historie |
| Findings / Risk Register | [16-findings.md](16-findings.md) | siehe Evidenz je Finding |
| Remediation Backlog | [17-remediation-plan.md](17-remediation-plan.md) | abgeleitet aus den Findings |
| Implementation Log | [18-implementation-log.md](18-implementation-log.md) | ausgeführte Tests |

---

## Offen — blockiert durch fehlenden Hostzugang

Fehlende Werkzeuge in der Auditumgebung (EV-0040): `ssh`, `plesk`, `mysql`,
`mariadb`, `drush`, `bw`.

| Register | Was fehlt | Benötigter Zugang |
| -------- | --------- | ----------------- |
| `PLESK_SERVICE_REGISTER` | Subscriptions, Domains, Webroots, PHP-Handler und -Versionen, FPM-Pools, Proxy-Regeln, Zertifikate, geplante Tasks | Plesk-Panel (lesend) oder SSH + `plesk` CLI |
| `RUNTIME_SERVICE_REGISTER` | systemd-Services, Prozesse, Container, Images, Volumes, Worker, Scheduler | SSH (lesend) |
| `DATABASE_REGISTER` | Welche Instanzen existieren, Versionen, Größen, Verbindungslimits | SSH + DB-Clients (lesend) |
| `DATABASE_SCHEMA_OWNERSHIP_MATRIX` | Tatsächliche Tabellen, Indizes, Constraints, Trigger, Migrationsstand | DB-Zugang (lesend) |
| `DNS_TLS_REGISTER` | Provider, Registrar, Record-Typen, Zertifikatsaussteller und Ablaufdaten, HSTS | DNS-Provider-Zugang |
| `PORT_REVERSE_PROXY_MATRIX` | Interne Ports, Listening Sockets, nginx-/Apache-Direktiven | SSH (lesend) |
| `BACKUP_RESTORE_REGISTER` | Jobs, Frequenz, Retention, Speicherziel, Verschlüsselung, letzte erfolgreiche Sicherung, **letzter Restore-Test** | Plesk-Backup-Manager + Speicherziel |
| `SECRET_CONNECTION_REGISTER` | Welche Secrets im Vault existieren, wer sie konsumiert, Rotationsstand | Bitwarden Secrets Manager (nur Namen, **nie Werte**) |

**Zur Backup-Frage besonders.** Der Auftrag hält fest, dass ein vorhandener
Backup-Job kein Beweis für Wiederherstellbarkeit ist. Dieses Audit kann
**keine** dieser beiden Aussagen treffen — weder ob Backups existieren noch ob
sie je wiederhergestellt wurden. Das ist angesichts der Live-Befunde die
dringendste offene Frage.

---

## Offen — blockiert durch fehlende fachliche Entscheidung

Diese Register sind nicht durch fehlende Zugänge blockiert, sondern dadurch,
dass ihr Gegenstand live nicht existiert. Sie werden erst nach Schritt 3 des
[Remediation Plans](17-remediation-plan.md) sinnvoll.

| Register | Warum offen |
| -------- | ----------- |
| `SYSTEM_OF_RECORD_MATRIX` | Soll Datenhoheit zwischen CiviCRM, ERPNext und FastAPI festlegen. **Keines der drei Systeme ist live** (EV-0003, EV-0004, EV-0005). Eine Zuweisung wäre eine Absichtserklärung, kein Betriebsvertrag. |
| `ERPNEXT_CIVICRM_STRIPE_RECONCILIATION_MATRIX` | Zwei der drei Systeme existieren öffentlich nicht. Ein Abgleichverfahren ohne abzugleichende Systeme ist gegenstandslos. |
| `N8N_MAKE_MIGRATION_MATRIX` | Setzt laut Auftrag „Live Evidence" je Workflow voraus. Unter `n8n.…` läuft keine Instanz (EV-0007). Die ehrliche Antwort auf „welche Workflows laufen tatsächlich?" lautet derzeit: **keiner**. Die 27 Workflow-Dateien unter `automation/n8n/` sind inventarisierbar — ihr Laufzeitstatus ist es nicht. |
| `REPO_ACTIVE_LEGACY_MATRIX` | Teilweise erhoben: die Legacy-Kandidaten im Repo-Root sind identifiziert (`api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `web/`, `new/`, `_MIGRATION/`). Ob sie Legacy oder geplant sind, hängt an derselben Zielbildentscheidung. Eine Klassifikation als `DEPRECATED_CONFIRMED` wäre ohne sie unbelegt. |

---

## Explizit `UNKNOWN` gebliebene Einzelfragen

Aus der Definition of Done des Auftrags, ehrlich als unbeantwortet markiert:

- **Welcher Commit läuft produktiv?** Nicht feststellbar. Die Website trägt
  `last-modified: 2026-04-25`; welcher Commit das erzeugt hat, ist ohne
  `.deploy_release` (das erst ein erfolgreicher Deploy schreibt) nicht
  belegbar. Nach Schritt 2 des Remediation Plans erstmals beantwortbar.
- **Wie wird ein Deployment zurückgerollt?** Der Workflow schreibt einen
  Release-Marker, ein Rollback-Pfad ist im Audit nicht verifiziert worden.
- **Läuft ERPNext intern?** Öffentlich nein (NXDOMAIN). Eine nicht öffentlich
  erreichbare Instanz kann ohne Hostzugang weder bestätigt noch ausgeschlossen
  werden.
- **Existieren produktive Datenbanken?** Unbekannt. Dass CRM und Forum nicht
  deployt sind, legt nahe, dass ihre Datenbanken leer oder nicht vorhanden
  sind — das ist eine Vermutung und wird hier nicht als Befund geführt.
- **`receipt_eligible` und wiederkehrende Zahlungen** — im Code nicht
  abschließend geprüft; die zugrunde liegende Geschäftsregel ist ungeklärt
  (P1-003).
- **Gibt es sensible Daten in Logs?** Für den Slack-Pfad belegt (P1-002,
  EV-0032). Für Anwendungs- und Serverlogs unbekannt (kein Hostzugang).

---

## Empfehlung zur Fortführung

Der wirksamste nächste Schritt ist **nicht** weitere Analyse, sondern Schritt 1
des Remediation Plans: das Deployment entsperren. Erst danach lässt sich
überhaupt beobachten, ob und wie die Plattform ausliefert — und erst dann
erzeugen die übrigen Register echte Evidenz statt Absichtserklärungen.

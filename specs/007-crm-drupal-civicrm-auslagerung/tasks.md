# Tasks: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Input**: Design documents from `/specs/007-crm-drupal-civicrm-auslagerung/`

**Prerequisites**: spec.md, plan.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelisierbar
- **[Story]**: US1..US5

## Path Conventions

- Doku: `docs/crm/`
- Skripte: `deployment-scripts/crm/`
- Specs/Contracts: `specs/007-crm-drupal-civicrm-auslagerung/contracts/`

---

## Phase 0: Voraussetzungen, Owner, Datenschutz, Secrets

- [ ] T001 Owner benennen (Infra, CRM/Drupal, CiviCRM fachlich, DB, DNS/TLS, Backup, Datenschutz) und in `docs/crm/inventory.md` festhalten.
- [ ] T002 [P] Datenschutz-Review starten: AVV-Register `docs/crm/dsgvo-avv.md` anlegen (Subprozessoren, Datenkategorien, Status).
- [ ] T003 [P] Secret-Strategie verbindlich definieren (Key Vault oder BSM); Mapping-Entwurf in `specs/007-crm-drupal-civicrm-auslagerung/contracts/secret-mapping.md`.
- [ ] T004 DNS-Matrix `docs/crm/dns-matrix.md` mit Subdomains, TTL, Ziel, Status anlegen.
- [ ] T005 Budget- und Kostenrahmen fuer Ziel-VM, DB, Backup, Monitoring schaetzen und freigeben lassen.

**Gate**: Owner, AVV-Entwurf, Secret-Strategie, DNS-Matrix und Budget vorhanden.

---

## Phase 1: Azure Foundation

- [ ] T010 Resource Group `moe-prod` (oder bestaetigte Bezeichnung) inkl. Tags pro Service einrichten.
- [ ] T011 [P] Key Vault / verbindlichen Secret-Store provisionieren und Zugriffsregeln festlegen.
- [ ] T012 [P] Log Analytics Workspace und Application Insights bereitstellen.
- [ ] T013 [P] Blob Storage Container fuer Backups (Lifecycle/Retention) anlegen.
- [ ] T014 Netzwerk/Firewall-Grundregeln definieren (kein SSH offen ausser von erlaubten IPs/Bastion).

**Gate**: Foundation aktiv, Kostenalarme aktiv, Zugaenge geregelt.

---

## Phase 2: US1 - Inventar erfassen (P1)

- [ ] T020 [US1] Drupal Core/Module/Themes erfassen (Composer-Lock, info.yml) -> `docs/crm/inventory.md`.
- [ ] T021 [US1] CiviCRM-Version und installierte Extensions erfassen -> `docs/crm/inventory.md`.
- [ ] T022 [US1] Cronjobs vollstaendig erfassen (Drupal Cron, CiviCRM Scheduled Jobs, Mailing, Cleanup).
- [ ] T023 [US1] DB-Inventar: Datenbanken, Tabellen, Views/Trigger, Encoding/Collation, Groessen.
- [ ] T024 [US1] File-Inventar: public, private, CiviCRM custom, Uploads, generated assets, Groessen + Pruefsummen.
- [ ] T025 [US1] SMTP/Mailrouting erfassen (Provider, SPF/DKIM/DMARC).
- [ ] T026 [US1] Rollen-/Rechte-Matrix und Admin-Konten erfassen.
- [ ] T027 [US1] API-/AuthX-/Webhook-Nutzung erfassen (Clients, Endpoints, Limits).

**Gate**: Inventar vollstaendig, reviewed, versioniert.

---

## Phase 3: US1 - Staging-VM und PoC (P1)

- [ ] T030 [US1] Ubuntu-LTS-VM provisionieren via `deployment-scripts/crm/provision-vm.sh`.
- [ ] T031 [US1] PHP-FPM + benoetigte Extensions installieren via `install-php-extensions.sh`.
- [ ] T032 [US1] Composer + Drush + (optional) cv installieren via `install-composer-drush.sh`.
- [ ] T033 [US1] Nginx + TLS (Let's Encrypt oder Azure-Zertifikat) fuer `staging-crm.*` konfigurieren.
- [ ] T034 [US1] Ziel-DB bereitstellen (managed oder VM-lokal), Zugriff nur intern.
- [ ] T035 [US1] DB-Dump aus Plesk erzeugen und mit `import-db.sh` importieren; Encoding/Collation erzwingen.
- [ ] T036 [US1] Files mit `rsync-files.sh` synchronisieren; Manifest mit Pruefsummen ablegen.
- [ ] T037 [US1] `settings.php` und `civicrm.settings.php` anpassen; private file paths verifizieren.
- [ ] T038 [US1] Mail-Sink/Catcher aktivieren via `enable-mailsink.sh`; verifizieren, dass keine Mails nach aussen gehen.
- [ ] T039 [US1] Cron auf Staging kontrolliert konfigurieren (Mailing-Jobs deaktiviert).

**Gate**: Drupal bootet, CiviCRM Status sauber, Login funktioniert, keine externen Mails.

---

## Phase 4: US2 - Datenkonsistenz und API (P1)

- [ ] T040 [US2] Stichproben-Definition `docs/crm/data-consistency.md` (Kontakte, Spendensummen, Mitgliedschaften, Reports).
- [ ] T041 [US2] Vergleichsskript: Aggregatabfragen Plesk vs. Staging, Ergebnisse protokollieren.
- [ ] T042 [US2] CiviCRM API/AuthX Smoke-Test gegen Staging (Read + Write in Testkontext).
- [ ] T043 [US2] Webform-/Spenden-Flow in Staging gegen Testdaten pruefen.
- [ ] T044 [US2] Konsistenz-Report mit Toleranzen und Abweichungen abnehmen lassen.

**Gate**: Konsistenz-Report ohne kritische Abweichungen, fachliche Abnahme dokumentiert.

---

## Phase 5: US4 - Backup, Monitoring, Hardening (P2)

- [ ] T050 [US4] Backup-Strategie `docs/crm/backup-restore.md` (Schedule, Retention, RTO/RPO, Verschluesselung).
- [ ] T051 [US4] Backup-Job (DB + Files + Config) automatisieren -> Blob Storage.
- [ ] T052 [US4] Restore-Test in zweite Staging-Umgebung (oder dieselbe nach Snapshot) erfolgreich durchfuehren.
- [ ] T053 [US4] Monitoring `docs/crm/monitoring-alerts.md`: Health-Endpoints, Log-Pipelines, Alarme.
- [ ] T054 [US4] Alerts an Ops-Eskalationspfad anschliessen.
- [ ] T055 [US4] Admin-Hardening: SSH-Keys only, MFA fuer Webadmins wo moeglich, gehaertete Nginx-Regeln.
- [ ] T056 [P] [US4] Secrets-Refresh-Prozedur dokumentieren.

**Gate**: Restore-Test bestanden, Alerts feuern bei Simulation, Hardening review.

---

## Phase 6: US3 - Cutover-Vorbereitung und Dry-Run (P1)

- [ ] T060 [US3] Cutover-Runbook `docs/crm/cutover-runbook.md` (Schritte, Verantwortliche, Zeiten, Rollback) finalisieren.
- [ ] T061 [US3] Wartungsfenster planen und kommunizieren.
- [ ] T062 [US3] DNS-TTL fuer `crm.*` rechtzeitig reduzieren.
- [ ] T063 [US3] `cutover-freeze.sh` und `cutover-finalize.sh` Skripte fertigstellen und testen.
- [ ] T064 [US3] `rollback-dns.sh` testen (Dry-Run gegen Staging-Equivalent).
- [ ] T065 [US3] Dry-Run kompletter Cutover-Ablauf inklusive Rollback dokumentieren.

**Gate**: Dry-Run erfolgreich, Owner-Freigabe fuer Cutover.

---

## Phase 7: US3 - Cutover und Verifikation (P1)

- [ ] T070 [US3] Plesk-CRM in Wartungsmodus / Schreibschutz setzen.
- [ ] T071 [US3] Finaler DB-Dump und File-Sync.
- [ ] T072 [US3] Import/Restore auf Ziel-VM, drush cache rebuild, drush updb (wenn noetig), CiviCRM cache clear.
- [ ] T073 [US3] Cron auf Ziel aktivieren, Mailing-Konfiguration auf Produktion umschalten.
- [ ] T074 [US3] DNS umstellen, TLS verifizieren.
- [ ] T075 [US3] Smoke-Test-Checkliste abarbeiten (Login, Kontakt, Spende, API-Ping, Cronjob manuell, Webform, Mailtest intern).
- [ ] T076 [US3] Monitoring aktiv, Plesk-vHost lesend belassen waehrend Stabilitaetsfenster.

**Gate**: Smoke-Test bestanden, keine Dateninkonsistenz, Stabilitaetsfenster gestartet.

---

## Phase 8: US5 - DSGVO Abschluss und Plesk-Reduktion (P2)

- [ ] T080 [US5] AVV-Register `docs/crm/dsgvo-avv.md` final pruefen und freigeben.
- [ ] T081 [US5] Zugriffsmatrix versionieren und gegen aktuelle Admin-Konten abgleichen.
- [ ] T082 [P] [US5] Audit-Logging fuer Admin-Aktionen aktivieren und pruefen.
- [ ] T083 Plesk-Reduktion `docs/crm/plesk-reduction.md` mit Liste der Restdienste und Stilllegungs-Plan.
- [ ] T084 Alten Plesk-CRM-vHost nach Stabilitaetsfenster abschalten oder archivieren.
- [ ] T085 Alte Plesk-API-/Frontend-Deployments pruefen und (falls vorhanden) entfernen.
- [ ] T086 DNS-Matrix final aktualisieren und im Repo dokumentieren.

**Gate**: AVV abgeschlossen, Plesk-Kernabhaengigkeit beseitigt, Doku aktuell.

---

## Querschnitt / Governance

- [ ] T090 Konsistenz mit `specs/002-infrastruktur-donation-masterplan/` pruefen und Querverweise pflegen.
- [ ] T091 Sicherstellen, dass diese Auslagerung KEIN n8n-Donation-Gate veraendert (`docs/n8n/donation-gate.md` o. ae.).
- [ ] T092 `npm run governance:check` und `npm run workspace:config:check` gruen halten.
- [ ] T093 Security-Review (security-reviewer.agent) und DSGVO-Owner-Sign-off dokumentieren.

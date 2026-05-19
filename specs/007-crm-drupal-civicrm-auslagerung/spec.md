# Feature Specification: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Feature Branch**: `007-crm-drupal-civicrm-auslagerung`

**Created**: 2026-05-19

**Status**: Draft

**Input**: Externer Plan `umsetzungsplan_moe_zielarchitektur_drupal_civicrm_auslagerung.txt` (Revision: Drupal/CiviCRM verlaesst Plesk; n8n bleibt eigene Schiene, Donation-Cutover bleibt bis Staging-Smoke-Test gegated).

## Strategische Entscheidung

Plesk wird nicht mehr als Zielplattform fuer Kernsysteme verwendet. Drupal + CiviCRM werden auf eine dedizierte Azure Linux VM mit eigener Datenbank, persistenten Files und kontrolliertem Cron migriert. Erst nach Stabilitaet wird ein moeglicher Container-/App-Service-Schritt evaluiert. n8n bleibt eigene Migrationsschiene und blockiert diese CRM-Auslagerung nicht.

Diese Spezifikation ergaenzt `specs/002-infrastruktur-donation-masterplan/`, ersetzt sie nicht.

## Clarifications

### Session 2026-05-19

- Q: Zielplattform CRM im ersten Schritt? -> A: Dedizierte Azure Linux VM (Ubuntu LTS) mit Nginx, PHP-FPM, Composer, Drush, CiviCRM, Cron.
- Q: Datenbankbetrieb? -> A: Managed MySQL-kompatible DB bevorzugt; falls Kosten/Kompatibilitaet nicht passen, VM-lokal mit dokumentiertem Backup.
- Q: Mailversand aus Staging? -> A: Staging schickt keine echten Mails nach aussen (Sink/Catcher); produktive Mails nur nach Cutover.
- Q: n8n-Abhaengigkeit? -> A: CRM-Migration ist unabhaengig; n8n-Donation-Workflow bleibt gegated bis Staging-Smoke-Test gruen.
- Q: Rueckkehr-Option Plesk? -> A: Alter Plesk-CRM-vHost bleibt nach Cutover fuer ein definiertes Stabilitaetsfenster lesend erreichbar (Rollback-Quelle).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - CRM-Inventar und Staging-PoC (Priority: P1)

Als CRM-Verantwortlicher moechte ich ein vollstaendiges Inventar (Drupal-Version, Module, CiviCRM-Version, Extensions, Cronjobs, DB, Files, SMTP, Rollen, API-Nutzung) und einen lauffaehigen Staging-PoC ausserhalb von Plesk, damit eine produktionsnahe Migration planbar ist.

**Independent Test**: Inventar-Dokument ist vollstaendig versioniert im Repo; Staging-Drupal bootet, CiviCRM Status Page zeigt keinen kritischen Fehler, Login moeglich.

**Acceptance Scenarios**:

1. **Given** ein Plesk-CRM-Snapshot, **When** Inventar erfasst wird, **Then** liegt eine vollstaendige Liste aller Module, Extensions, Cronjobs, DB-Schemas, File-Pfade und SMTP-Konfigurationen im Repo vor.
2. **Given** ein DB-Dump und ein File-Snapshot, **When** auf der Staging-VM importiert wird, **Then** booten Drupal und CiviCRM ohne PHP-Fatals.

---

### User Story 2 - Daten- und Konsistenzpruefung (Priority: P1)

Als CiviCRM-Verantwortlicher moechte ich nach dem Import in Staging fachlich pruefen, dass Kontakte, Spenden, Mitgliedschaften, Reports, Rollen und API-Aufrufe konsistent sind, damit kein Datenverlust droht.

**Independent Test**: Stichproben aus Produktiv-Plesk werden in Staging gefunden; Kontaktzahlen, Spendensummen, Mitgliedschaften matchen innerhalb definierter Toleranz.

**Acceptance Scenarios**:

1. **Given** Staging mit Import, **When** definierte Stichproben gepueft werden, **Then** stimmen Identitaeten, Summen und Beziehungen mit Plesk-Snapshot ueberein.
2. **Given** CiviCRM API/AuthX, **When** ein Testaufruf gegen Staging gesendet wird, **Then** antwortet die API korrekt und konsistent zu Plesk.

---

### User Story 3 - Sicherer Cutover mit Rollback (Priority: P1)

Als Verantwortlicher moechte ich einen kontrollierten Cutover mit Wartungsfenster, finalem Sync, DNS-Umstellung und nachweisbarer Rollback-Option, damit Risiken minimal bleiben.

**Independent Test**: Trockenuebung des Cutovers (Dry-Run) inklusive Rollback laesst sich in definierter Zeit fehlerfrei durchspielen.

**Acceptance Scenarios**:

1. **Given** ein vorbereiteter Cutover-Plan, **When** das Wartungsfenster startet, **Then** wird Plesk-CRM in Schreibschutz versetzt, finaler DB-Dump und File-Sync durchgefuehrt, Ziel laeuft, DNS umgestellt.
2. **Given** ein Fehlerbild nach Cutover, **When** Rollback ausgeloest wird, **Then** wird die DNS-Rueckschaltung in definierter Frist abgeschlossen und Plesk-CRM lesend wieder erreichbar.

---

### User Story 4 - Betrieb mit Backups, Monitoring, Security (Priority: P2)

Als Ops-Verantwortlicher moechte ich automatisierte Backups, getestete Restores, Monitoring, Alarme, gehaertete Zugaenge und ein dokumentiertes Runbook fuer die neue CRM-Umgebung, damit der Regelbetrieb sicher und nachvollziehbar ist.

**Independent Test**: Restore-Test in Staging-VM aus aktuellem Backup laeuft erfolgreich; Monitor-Alarme feuern bei simuliertem Ausfall.

**Acceptance Scenarios**:

1. **Given** taegliche Backups, **When** ein Restore-Test angestossen wird, **Then** ist Drupal+CiviCRM aus dem Backup voll wiederherstellbar.
2. **Given** Monitoring/Alerts, **When** PHP-FPM oder MySQL ausfaellt, **Then** werden definierte Eskalationen ausgeloest.

---

### User Story 5 - DSGVO und Zugriffskonzept (Priority: P2)

Als Datenschutzverantwortlicher moechte ich klare Auftragsverarbeitung, dokumentiertes Zugriffskonzept, Verschluesselung im Transit, getrennte Admin-Konten und Audit-Logging, damit personenbezogene Daten DSGVO-konform verarbeitet werden.

**Independent Test**: AVV/DPA dokumentiert; Zugriffsliste und Rollenmatrix versioniert; TLS und Admin-Auth gehaertet; Audit-Log fuer Admin-Aktionen aktiv.

**Acceptance Scenarios**:

1. **Given** die neue Umgebung, **When** ein Admin sich anmeldet, **Then** wird der Login protokolliert und ein gehaerteter Auth-Pfad (MFA/SSH-Keys) verwendet.
2. **Given** ein Datenschutzaudit, **When** Datenflusslisten gepueft werden, **Then** sind alle externen Subprozessoren mit AVV erfasst.

---

### Edge Cases

- Fehlende PHP-Extensions auf der Ziel-VM beim ersten Boot.
- Private files versehentlich oeffentlich erreichbar nach Webserver-Umkonfiguration.
- CiviCRM Cron sendet in Staging echte E-Mails.
- DB-Encoding/Collation-Drift zwischen Plesk und Ziel-DB.
- Composer-Lock-Konflikt durch unterschiedliche PHP-Minor-Versionen.
- Verzoegerter DNS-Propagation-Effekt waehrend Cutover.
- Webform-Submissions zwischen Freeze und finalem Sync verloren.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Es MUSS ein vollstaendiges, versioniertes CRM-Inventar (`docs/crm/inventory.md`) erstellt werden.
- **FR-002**: Es MUSS eine Staging-VM ausserhalb von Plesk bereitgestellt werden (Ubuntu LTS, Nginx, PHP-FPM, Composer, Drush, CiviCRM CLI).
- **FR-003**: Der DB-Import MUSS reproduzierbar aus dem Plesk-Dump erfolgen, mit dokumentierten Encoding-/Collation-Annahmen.
- **FR-004**: Files (public, private, custom, generated) MUESSEN reproduzierbar synchronisiert werden; private Pfade MUESSEN nicht oeffentlich erreichbar sein.
- **FR-005**: Cronjobs (Drupal Cron, CiviCRM Scheduled Jobs, Mailings) MUESSEN auf Staging kontrolliert (deaktiviert/gemockt) und auf Produktion explizit aktiviert werden.
- **FR-006**: Staging MUSS einen Mail-Sink/Catcher nutzen; kein Versand an externe Empfaenger.
- **FR-007**: Es MUSS ein Cutover-Runbook (`docs/crm/cutover-runbook.md`) mit Schritten, Verantwortlichen, Zeitschaetzungen, Verifikations- und Rollback-Anweisungen geben.
- **FR-008**: Es MUSS einen automatisierten Backup-Job (DB + Files + Config) mit getestetem Restore geben.
- **FR-009**: Es MUSS Monitoring (Health, Logs, Cron) mit Alarmen geben.
- **FR-010**: Admin-Zugaenge MUESSEN gehaertet sein (SSH-Keys, kein Passwort-Login, MFA fuer Webadmin wo moeglich).
- **FR-011**: Die Secrets-Strategie MUSS verbindlich definiert sein (Key Vault oder bestehender BSM-Bestand) und im Repo NUR per Mapping referenziert werden.
- **FR-012**: TLS MUSS fuer alle CRM-Subdomains aktiv und automatisch erneuert sein.
- **FR-013**: API/AuthX-Endpunkte MUESSEN nach Cutover gegen die neue Umgebung getestet sein.
- **FR-014**: DSGVO-Auftragsverarbeitung MUSS dokumentiert sein (AVV-Status pro Subprozessor).
- **FR-015**: Plesk-CRM-vHost MUSS nach Cutover fuer ein definiertes Stabilitaetsfenster lesend erreichbar bleiben (Rollback).
- **FR-016**: Diese Auslagerung DARF NICHT n8n-Donation-Cutover-Gates aushebeln (Donation-Workflow bleibt bis Staging-Smoke-Test gegated).
- **FR-017**: Alle Schritte, Owner und Gate-Nachweise MUESSEN im Repo dokumentiert sein.

### Key Entities (Dokumente und Artefakte)

- **CRM Inventory**: Module, Extensions, Cron, DB-Schemas, Files, SMTP, Rollen, API-Nutzung.
- **DB Dump Artifact**: Versionierter Dump-Hash und Restore-Verifikation.
- **File Snapshot**: rsync-Manifest mit Pruefsummen.
- **Cutover Runbook**: Schritte, Verantwortliche, Zeiten, Rollback.
- **Backup Job**: Schedule, Retention, Speicherort, Restore-Test-Nachweis.
- **Monitor Config**: Health-Checks, Alarme, Eskalation.
- **AVV Register**: Subprozessoren, Vertragsstatus, Datenkategorien.
- **DNS Matrix**: Subdomains, TTL, Ziel, Status.

## Success Criteria _(mandatory)_

- **SC-001**: CRM laeuft 30 Tage stabil auf neuer Umgebung ohne sicherheits- oder datenrelevante Incidents.
- **SC-002**: Restore-Test besteht innerhalb definierter RTO (z. B. <= 4 h) und RPO (z. B. <= 24 h).
- **SC-003**: Keine kritischen CiviCRM-Status-Findings nach Cutover.
- **SC-004**: 100 % der dokumentierten Stichproben (Kontakte, Spenden, Mitgliedschaften, API) stimmen post-Cutover ueberein.
- **SC-005**: Plesk-CRM-vHost ist nach definiertem Fenster sauber stillgelegt; keine Kernabhaengigkeit mehr auf Plesk.
- **SC-006**: AVV-Status fuer alle externen Subprozessoren dokumentiert.

## Assumptions

- Azure-Subscription mit Resource Group `moe-prod` und Budget-Alerts vorhanden (oder wird im Foundation-Task angelegt).
- Owner sind benannt: Infra, CRM/Drupal, CiviCRM fachlich, DB, DNS/TLS, Backup, Datenschutz.
- Secrets verbleiben im verbindlichen Secret-Store (Key Vault oder BSM); kein Klartext im Repo.
- DNS-Hoheit fuer `crm.menschlichkeit-oesterreich.at` und `staging-crm.*` ist vorhanden.
- Mailrouting wird ueber bestehende SMTP-Strecke oder bewussten Transaktionsmail-Anbieter (DSGVO-konform) abgewickelt.
- SSO ist nicht Teil dieses Cutovers.
- Forum und Game sind separate Schienen und blockieren diese Migration nicht.

# Data Model: Infrastruktur, Donation und Governance Masterplan

## Entities

### MasterplanPhase

Repraesentiert einen geordneten Umsetzungsblock mit kontrolliertem Uebergang.

**Fields**

- `phase_id` - eindeutige Kennung (z. B. A bis M)
- `name` - Kurzbezeichnung der Phase
- `objective` - fachliches Betriebsziel
- `tasks[]` - umzusetzende Arbeitspakete
- `deliverables[]` - erwartete Auslieferungen
- `exit_criteria[]` - messbare Freigabebedingungen
- `status` - `planned | in_progress | blocked | passed | failed`

**Rules**

- Ein Phasenuebergang ist nur mit `status=passed` zulaessig.
- Jede Phase muss mindestens ein Nachweisartefakt referenzieren.

### GateCriterion

Repraesentiert eine konkrete Freigabebedingung pro Phase oder Release-Gate.

**Fields**

- `gate_id` - eindeutige Gate-Kennung
- `category` - `security | compliance | operations | donation | infra | backup`
- `description` - pruefbare Regel
- `required` - boolescher Pflichtstatus
- `result` - `pass | fail | not_tested`
- `evidence_refs[]` - Verweise auf Evidenzen

**Rules**

- `required=true` und `result!=pass` blockiert Freigabe.
- No-Go-Regeln koennen nicht durch Einzelentscheidung ueberstimmt werden.

### OperationalEvidence

Repraesentiert einen Nachweis fuer erfolgreich durchgefuehrte Pruefungen oder Kontrollen.

**Fields**

- `evidence_id`
- `type` - `smoke_test | restore_test | security_check | monitoring_probe | deployment_log`
- `created_at`
- `created_by_role`
- `source_path` - Speicherort im Repo oder Referenzsystem
- `verification_status` - `accepted | rejected | pending`

**Rules**

- Jede produktive Freigabe benoetigt zugeordnete Evidenzen fuer alle Pflicht-Gates.
- Evidence ohne Verifikationsstatus gilt nicht als freigabefaehig.

### RoleOwnership

Repraesentiert Governance- und Betriebsverantwortung.

**Fields**

- `role` - `Infra Admin | Platform Admin | Finance Admin | Security Admin`
- `responsibilities[]`
- `escalation_channels[]`
- `backup_owner` - Vertretung

**Rules**

- Kritische Prozesse muessen Primar- und Backup-Owner haben.
- Ownership-Luecken machen eine Phase `blocked`.

### ComplianceControl

Repraesentiert Datenschutz- und Security-Kontrollen.

**Fields**

- `control_id`
- `control_type` - `dsgvo | secret_handling | logging_policy | retention`
- `policy_statement`
- `validation_method`
- `status` - `compliant | non_compliant | unknown`

**Rules**

- `non_compliant` bei Pflichtkontrollen ist No-Go fuer Produktion.
- Logging-Policies muessen PII-/Secret-Ausschluss explizit enthalten.

### ResilienceControl

Repraesentiert Kontrollen fuer Sicherung und Wiederherstellung.

**Fields**

- `control_id`
- `backup_type` - `vm_snapshot | db_dump | volume_backup`
- `frequency`
- `last_successful_backup_at`
- `last_successful_restore_test_at`
- `rto_target`
- `status` - `healthy | degraded | failed`

**Rules**

- Ohne dokumentierten Restore-Test gilt der Backup-Schutz als unvollstaendig.
- `status=failed` blockiert produktive Freigaben.

### AlertIncident

Repraesentiert kritische Monitoring-Ereignisse inkl. Reaktionspflicht.

**Fields**

- `incident_id`
- `severity` - `critical | high | medium | low`
- `detected_at`
- `channels` - muss `slack` und `email` enthalten bei `critical`
- `acknowledged_at`
- `ack_sla_minutes` - max. 30 bei `critical`
- `status` - `open | acknowledged | resolved`

**Rules**

- Kritische Alerts muessen innerhalb von 30 Minuten bestaetigt werden.
- Nicht bestaetigte kritische Alerts zaehlen als Gate-Verletzung.

## Relationships

- `MasterplanPhase` enthaelt mehrere `GateCriterion`.
- `GateCriterion` referenziert eine oder mehrere `OperationalEvidence`.
- `RoleOwnership` steuert Verantwortung fuer `GateCriterion`, `ComplianceControl` und `ResilienceControl`.
- `ComplianceControl` und `ResilienceControl` beeinflussen direkt Go-/No-Go-Entscheidungen.
- `AlertIncident` wird durch Monitoring erzeugt und fuer Operations-Gates ausgwertet.

## State Transitions

### Phase Lifecycle

`planned -> in_progress -> passed`

Alternative Pfade:

- `in_progress -> blocked`
- `in_progress -> failed`
- `blocked -> in_progress` (nach Blockerbehebung)
- `failed -> in_progress` (nach Korrektur + Re-Check)

### Gate Lifecycle

`not_tested -> pass`

Alternative Pfade:

- `not_tested -> fail`
- `fail -> pass` (nur nach erfolgreicher Nachpruefung)

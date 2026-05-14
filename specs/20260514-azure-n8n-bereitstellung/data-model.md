# Data Model: Azure n8n Bereitstellungspfad

## Entities

### GrantStatus

Repraesentiert den Stand der Microsoft-Freigabe fuer das Vorhaben.

**Fields**

- `source` - Woher der Nachweis stammt
- `status` - `approved`, `blocked`, `unknown`
- `blocker_reason` - Begruendung bei Blockade
- `evidence_reference` - Verweis auf Dokument oder Portalnachweis
- `last_checked_at` - Zeitpunkt der Pruefung

**Rules**

- Darf nicht als freigegeben markiert werden, ohne belastbaren Nachweis.
- Ein unbekannter Zustand muss als Blocker behandelt werden.

### BillingProfile

Repraesentiert die Kostenfreigabe und Zuordnung.

**Fields**

- `owner` - Kostenverantwortliche Person oder Stelle
- `subscription_reference` - Zuordnung zur Azure-Subscription
- `budget_status` - `confirmed`, `pending`, `blocked`
- `notes` - Zusatzhinweise zum Billing-Gate

**Rules**

- Ohne klares Billing-Owner-Mapping darf kein Provisioning erfolgen.

### OperatingMode

Repraesentiert den aktuellen Betriebsmodus des Vorhabens.

**Fields**

- `mode` - nur `single-main`
- `effective_from` - ab wann der Modus gilt
- `approved_by` - dokumentierte Freigabe

**Rules**

- Queue-Mode ist in diesem Block nicht erlaubt.
- Jede spaetere Aenderung braucht ein separates Folge-Gate.

### AzureResourceSet

Repraesentiert die Vorbereitungs-Ressourcen in Azure.

**Fields**

- `resource_group_name`
- `vm_name`
- `public_ip_name`
- `nsg_name`
- `region`
- `size`
- `ssh_port`
- `allowed_inbound_ports`

**Rules**

- Inbound-Ports sind auf 22, 80 und 443 begrenzt.
- Public IP ist statisch.
- Die VM gehoert zu genau einem Vorbereitungs-Setup.

### HardeningBaseline

Repraesentiert die Host-Hardening-Massnahmen.

**Fields**

- `os_version`
- `timezone`
- `deploy_user`
- `root_login_enabled`
- `password_login_enabled`
- `ufw_enabled`
- `package_updates_applied`

**Rules**

- `timezone` muss `Europe/Vienna` sein.
- Root- und Passwort-Login muessen deaktiviert sein.
- UFW muss aktiv sein und dieselbe Portgrenze wie die NSG abbilden.

### RuntimePreparation

Repraesentiert die Docker-Basis fuer spaetere Container.

**Fields**

- `docker_engine_installed`
- `compose_plugin_installed`
- `deploy_user_in_docker_group`
- `target_stack_directory`
- `compose_files_ready`

**Rules**

- Docker muss fuer den Deploy-User bedienbar sein.
- Die Basis darf noch keinen produktiven n8n-Container voraussetzen.

### EvidenceLog

Repraesentiert die dokumentierte Uebergabe mit Nachweisen und Restrisiken.

**Fields**

- `resource_summary`
- `validation_checks`
- `risks`
- `blockers`
- `follow_up_gate`
- `created_at`

**Rules**

- Muss explizit auf DNS/HTTPS-Abnahme als naechstes Gate verweisen.
- Muss die Nicht-Ziele des Blocks nennen.

### FollowUpGate

Repraesentiert den naechsten klar definierten Block.

**Fields**

- `name` - muss `DNS/HTTPS-Abnahme` sein
- `entry_criteria`
- `out_of_scope_items`
- `owner`

**Rules**

- Darf nicht still in den aktuellen Block hineinmischen.

## Relationships

- `GrantStatus` und `BillingProfile` steuern, ob `AzureResourceSet` ueberhaupt entstehen darf.
- `OperatingMode` gilt fuer den gesamten Vorbereitungsblock.
- `AzureResourceSet` wird erst nach der Governance-Freigabe umgesetzt.
- `HardeningBaseline` und `RuntimePreparation` bauen auf `AzureResourceSet` auf.
- `EvidenceLog` fasst alle anderen Entitaeten zusammen und leitet zu `FollowUpGate` ueber.

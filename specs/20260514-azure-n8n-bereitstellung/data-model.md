# Data Model: Azure n8n Abnahmepfad

## Zweck

Dieses Datenmodell beschreibt die Abnahmeobjekte, Evidenztypen und Blockerregeln fuer den Azure-basierten n8n-Produktionspfad bis zur Abnahmevorbereitung. Es trennt strikt zwischen Sollzustand und bestaetigtem Live-Zustand.

## Entities

### AcceptanceObject

Ein pruefbares Gate-Objekt im Bereitstellungs- und Abnahmepfad.

**Fields**

- `id` - stabiler Schluessel (z. B. `grant-status`)
- `name` - sprechender Name
- `domain` - `grant-billing`, `azure-resource`, `network`, `dns`, `https`, `runtime`, `backup`, `operations`
- `target_state` - verbindlicher Soll-Zustand
- `evidence_type` - `primary_source`, `live_proof`, `open_checkpoint`
- `status` - `open`, `in_review`, `verified`, `blocked`
- `blocker_class` - `none`, `provisioning_blocker`, `go_live_blocker`
- `owner_role` - zustaendige Rolle
- `last_verified_at` - ISO-Timestamp oder leer
- `notes` - freie Hinweise

**Rules**

- Jedes Abnahmeobjekt braucht genau einen Soll-Zustand.
- Jedes Abnahmeobjekt braucht genau einen Evidenztyp.
- `go_live_blocker` stoppt spaeteres produktives Go zwingend.

### EvidenceRecord

Ein konkreter Nachweis zu einem Abnahmeobjekt.

**Fields**

- `acceptance_object_id`
- `source_system` - z. B. Azure Portal, Azure CLI, DNS-Resolver, HTTPS-Endpoint, Runbook
- `evidence_type` - `primary_source`, `live_proof`, `open_checkpoint`
- `proof_reference` - Link, Ticket, Artefakt-ID oder Command-Output-Referenz
- `captured_at` - ISO-Timestamp
- `verified_by`
- `result` - `pass`, `fail`, `pending`
- `comment`

**Rules**

- Produktionsbehauptungen sind nur mit `result=pass` und passendem Evidenztyp zulaessig.
- Offene Punkte werden explizit als `pending` gefuehrt.

### BlockerRule

Regelwerk fuer Stop-Kriterien.

**Fields**

- `id`
- `gate`
- `condition`
- `effect_scope` - `provisioning` oder `go_live`
- `severity` - `high`, `medium`, `low`
- `escalation_path`

**Rules**

- `go_live`-Blocker duerfen nicht per Annahme uebersprungen werden.
- Jeder Blocker braucht einen konkreten Eskalationspfad.

### RuntimeContractSnapshot

Dokumentiert den erwarteten Runtime-Betriebszustand fuer den Erstbetrieb.

**Fields**

- `mode` - `single-main` oder `queue`
- `public_ports[]` - erwartete oeffentliche Ports
- `private_only_ports[]` - nicht oeffentlich exponierbar
- `required_env[]` - Pflicht-Konfigurationen
- `backup_required` - bool
- `restore_test_required` - bool

## Canonical Acceptance Objects (Initial)

| id                 | name                            | evidence_type    | blocker_class          | initial_status |
| ------------------ | ------------------------------- | ---------------- | ---------------------- | -------------- |
| `grant-status`     | Nonprofit/Grant Status          | `primary_source` | `provisioning_blocker` | `open`         |
| `billing-status`   | Billing-Profil nutzbar          | `primary_source` | `provisioning_blocker` | `open`         |
| `azure-rg`         | Resource Group vorhanden        | `primary_source` | `provisioning_blocker` | `open`         |
| `azure-vm`         | VM Baseline konfiguriert        | `primary_source` | `provisioning_blocker` | `open`         |
| `azure-public-ip`  | Statische Public IP             | `primary_source` | `provisioning_blocker` | `open`         |
| `azure-nsg`        | NSG-Regeln korrekt              | `primary_source` | `go_live_blocker`      | `open`         |
| `ssh-hardening`    | SSH-Haertung wirksam            | `live_proof`     | `go_live_blocker`      | `open`         |
| `dns-target`       | DNS auf Azure-Ziel              | `live_proof`     | `go_live_blocker`      | `open`         |
| `https-acceptance` | HTTPS und URL-Konsistenz        | `live_proof`     | `go_live_blocker`      | `open`         |
| `runtime-env`      | Pflicht-Env vollstaendig        | `primary_source` | `go_live_blocker`      | `open`         |
| `backup-restore`   | Backup und Restore nachgewiesen | `live_proof`     | `go_live_blocker`      | `open`         |
| `ops-ownership`    | Betrieb/Renewal eindeutig       | `primary_source` | `go_live_blocker`      | `open`         |

## Gate Matrix Template

| gate           | target_state               | evidence_type    | status | blocker_class          | next_action                 |
| -------------- | -------------------------- | ---------------- | ------ | ---------------------- | --------------------------- |
| Grant          | Sponsorship/Grant aktiv    | `primary_source` | `open` | `provisioning_blocker` | Primaernachweis einholen    |
| Billing        | Profil produktiv nutzbar   | `primary_source` | `open` | `provisioning_blocker` | Billing-Check dokumentieren |
| NSG/Ports      | Nur 22/80/443 oeffentlich  | `live_proof`     | `open` | `go_live_blocker`      | Port-/NSG-Checks planen     |
| DNS            | Ziel auf Azure             | `live_proof`     | `open` | `go_live_blocker`      | Umschaltfenster vorbereiten |
| HTTPS          | Cert + URL konsistent      | `live_proof`     | `open` | `go_live_blocker`      | TLS-Abnahmeplan ausfuehren  |
| Backup/Restore | Restore erfolgreich belegt | `live_proof`     | `open` | `go_live_blocker`      | Restore-Test terminieren    |

## Relationships

- `AcceptanceObject` wird durch ein oder mehrere `EvidenceRecord` validiert.
- `BlockerRule` referenziert ein `AcceptanceObject` ueber das Gate.
- `RuntimeContractSnapshot` liefert Sollwerte fuer mehrere Acceptance Objects (Ports, Env, Backup).

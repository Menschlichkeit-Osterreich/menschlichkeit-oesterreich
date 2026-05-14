# Data Model: n8n Workflow Validitaets-Gate

## Entities

### WorkflowInventory

Repraesentiert die explizite Liste der produktionsnahen Workflow-Dateien im Gate-Scope.

**Fields**

- `version` - Inventarversion fuer nachvollziehbare Aenderungen
- `scope_root` - Basisverzeichnis, erwartbar `automation/n8n/workflows`
- `workflows[]` - Liste der inventarisierten relativen Dateipfade
- `special_case`
  - `workflow_path`
  - `special_case_flag`
  - `evidence_status`
  - `visibility_message`
- `notes` - optionale Scope-Hinweise

**Rules**

- Jeder Eintrag muss ein relativer Pfad unterhalb von `scope_root` sein.
- Doppelte Eintraege sind unzulaessig.
- Nicht inventarisierte produktionsnahe Dateien gelten als Scope-Abweichung.

### WorkflowFile

Repraesentiert eine einzelne Workflow-JSON-Datei aus dem Scope.

**Fields**

- `relative_path`
- `exists` - boolescher Dateistatus
- `json_valid` - boolesches Parse-Ergebnis
- `error_message` - Fehlertext bei Parsefehlern

**Rules**

- `json_valid` darf nur bewertet werden, wenn `exists=true`.
- Bei `exists=false` muss der Lauf fehlschlagen.

### SpecialCaseStatus

Repraesentiert den bekannten Sonderfall `finance-donation-processing.json`.

**Fields**

- `workflow_path` - fixer Verweis auf den Donation-Workflow
- `special_case_flag` - immer `true` fuer diesen Eintrag
- `evidence_status` - `pending_import_or_dry_run_proof` oder `verified`
- `visibility_message` - auszugebender Hinweistext im Lauf

**Rules**

- Sonderfall darf nicht stillschweigend wie ein Standardfall behandelt werden.
- Solange `evidence_status` auf `pending...` steht, muss die Sichtbarkeitsmeldung ausgegeben werden.

### ValidationGateRun

Repraesentiert einen lokalen oder CI-Lauf des Gates.

**Fields**

- `run_mode` - `local` oder `ci`
- `checked_files_count`
- `invalid_files_count`
- `missing_files_count`
- `status` - `pass` oder `fail`
- `timestamp`

**Rules**

- `status=fail`, wenn mindestens eine Datei fehlt oder JSON-ungueltig ist.
- `checked_files_count` muss exakt der Inventaranzahl entsprechen.

## Relationships

- `WorkflowInventory` definiert den verbindlichen Scope fuer `WorkflowFile`.
- `SpecialCaseStatus` referenziert exakt einen Eintrag in `WorkflowInventory`.
- `ValidationGateRun` aggregiert die Ergebnisse aller `WorkflowFile`-Pruefungen und enthaelt die Sonderfall-Sichtbarkeit.

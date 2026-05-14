# Feature Specification: Azure n8n Bereitstellungspfad

**Feature Branch**: `20260514-azure-n8n-bereitstellung`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Azure-n8n-Bereitstellungspfad mit Grant/Billing-Gate, Single-Main-Betriebsvertrag, geharteter VM-Basis und klarer Folge-Gate-Abgrenzung"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Governance- und Kosten-Gate klaeren (Priority: P1)

Als verantwortliche Person will ich den Azure-Grant- und Billing-Status mit einer klaren Blocker- oder Freigabe-Klassifikation dokumentiert haben, damit keine Ressource ohne Kosten- und Zustandsfreigabe angelegt wird.

**Why this priority**: Ohne geklaertes Kosten- und Zustandsgate darf kein Provisioning starten. Das ist der haerteste operative Blocker.

**Independent Test**: Kann unabhaengig getestet werden, indem ein Dokument oder Audit-Block vorliegt, der Grant/Billing, Zuständigkeit, Blockerstatus und Freigabeentscheidung nachvollziehbar ausweist.

**Acceptance Scenarios**:

1. **Given** der Microsoft-Status ist nachweisbar, **When** das Kosten-Gate geprueft wird, **Then** ist Grant/Billing entweder freigegeben oder mit sauberer Blocker-Klassifikation dokumentiert.
2. **Given** der Microsoft-Status ist nicht nachweisbar, **When** das Kosten-Gate geprueft wird, **Then** bleibt Provisioning blockiert und der Grund ist dokumentiert.

---

### User Story 2 - Single-Main Betriebsmodus festziehen (Priority: P1)

Als Betreiberin bzw. Betreiber will ich den initialen Betriebsmodus explizit als Single-Main festgelegt sehen, damit kein impliziter Wechsel zu Queue-Mode oder Mehrfachbetrieb stattfindet.

**Why this priority**: Der Betriebsmodus steuert alle spaeteren Architektur- und Betriebsentscheidungen. Single-Main minimiert Komplexitaet und verhindert Vorgriffe auf nicht freigegebene Skalierung.

**Independent Test**: Kann unabhaengig getestet werden, indem der Betriebsvertrag den Modus Single-Main, die Nicht-Ziele und das spaetere Folge-Gate eindeutig benennt.

**Acceptance Scenarios**:

1. **Given** der Betriebsvertrag wird gelesen, **When** der Modus gesucht wird, **Then** ist Single-Main explizit dokumentiert.
2. **Given** eine spaetere Queue-Mode-Idee entsteht, **When** der aktuelle Vertrag geprueft wird, **Then** ist klar ersichtlich, dass Queue-Mode nicht Teil dieses Blocks ist.

---

### User Story 3 - Azure-Basis und VM-Hardening vorbereiten (Priority: P1)

Als DevOps-Verantwortliche Person will ich eine gehartete Azure-VM mit statischer IP, minimaler Portflaeche und Docker-Compose-Basis vorbereitet sehen, damit der spaetere n8n-Betrieb auf einer belastbaren Grundlage aufsetzen kann.

**Why this priority**: Diese Grundlage reduziert Angriffsflaeche, macht das Folge-Gate testbar und verhindert, dass Deployment und Hardening vermischt werden.

**Independent Test**: Kann unabhaengig getestet werden, indem die Azure-Ressourcen, NSG-Regeln, SSH-Hardening, UFW-Status und Docker-Compose-Verfuegbarkeit separat nachgewiesen werden.

**Acceptance Scenarios**:

1. **Given** die Azure-Basis angelegt ist, **When** die Netz- und Host-Regeln geprueft werden, **Then** sind nur 22, 80 und 443 als Inbound-Ports vorgesehen.
2. **Given** die VM ist gehartet, **When** SSH und UFW validiert werden, **Then** ist Root- und Passwort-Login deaktiviert und SSH laeuft nur per Key.
3. **Given** Docker ist installiert, **When** der Deploy-User die Runtime prueft, **Then** sind Docker Engine und Compose nutzbar.

---

### User Story 4 - Nachweis, Restrisiken und Folge-Gate dokumentieren (Priority: P2)

Als Stakeholder will ich einen nachvollziehbaren Nachweis- und Risikoblock sehen, damit klar ist, was bereits vorbereitet wurde, was offen bleibt und wie der naechste Gate-Schritt heisst.

**Why this priority**: Ohne saubere Uebergabe kann das Vorhaben still in den produktiven Zustand kippen, obwohl DNS/HTTPS noch nicht freigegeben sind.

**Independent Test**: Kann unabhaengig getestet werden, indem die Dokumentation alle erzeugten Objekte, offenen Risiken und das explizite Folge-Gate DNS/HTTPS-Abnahme enthaelt.

**Acceptance Scenarios**:

1. **Given** die Vorbereitungsphase ist abgeschlossen, **When** das Abschlussdokument gelesen wird, **Then** sind Objektliste, Restrisiken und Folge-Gate eindeutig beschrieben.
2. **Given** jemand versucht den naechsten Schritt vorzuziehen, **When** die Dokumentation geprueft wird, **Then** ist klar, dass DNS-Umschaltung, HTTPS-Abnahme und Reverse Proxy nicht Teil dieses Blocks sind.

### Edge Cases

- Grant vorhanden, aber nicht aktiviert: Provisioning bleibt blockiert.
- Billing unklar oder falsch zugeordnet: Keine Ressourcenerstellung.
- DNS zeigt noch auf Plesk: Azure-Vorbereitung ist erlaubt, Produktionsabnahme nicht.
- VM vorhanden, aber Ports offen: Kein Go-Live.
- SSH nur per Passwort: Hardening ist nicht erfuellt.
- Docker laeuft, aber der Deploy-User kann es nicht bedienen: Basis ist nicht fertig.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Das System MUST den Grant- und Billing-Status mit Quelle, Zuständigkeit und Blocker- oder Freigabeklassifikation dokumentieren.
- **FR-002**: Das System MUST den initialen Betriebsmodus als Single-Main festhalten.
- **FR-003**: Das System MUST eine Azure-VM mit statischer Public IP und minimaler NSG-Flaeche fuer den Vorbereitungsblock definieren.
- **FR-004**: Das System MUST die Host-Hardening-Basis mit Updates, Europe/Vienna-Zeitzone, Deploy-User, deaktiviertem Root-/Passwort-Login und aktivem UFW dokumentieren.
- **FR-005**: Das System MUST Docker Engine und Docker Compose als Laufzeitbasis fuer den spaeteren n8n-Stack vorbereiten.
- **FR-006**: Das System MUST Nachweise, Restrisiken und das naechste Gate in einer eigenen Abschlussdokumentation sammeln.
- **FR-007**: Das System MUST DNS-Umschaltung, HTTPS-Abnahme, Reverse Proxy, produktives n8n-Deployment, Queue-Mode und erweiterten Backup-Ausbau fuer diesen Block explizit ausschliessen.
- **FR-008**: Das System MUST bei jedem Azure-Schritt Zielobjekt, Zweck, Risiko und Erfolgskriterium nennen.
- **FR-009**: Das System MUST klare No-Go-Bedingungen fuer offene 5678-, 5432- und 6379-Ports festhalten.
- **FR-010**: Das System MUST das Folge-Gate als DNS/HTTPS-Abnahme benennen und nicht still vorziehen.

### Key Entities _(include if feature involves data)_

- **GrantStatus**: Repräsentiert den Microsoft-Grant-Zustand, die Quelle des Nachweises und die Blocker- bzw. Freigabeklassifikation.
- **BillingProfile**: Repräsentiert die Kostenfreigabe, Zuordnung, Verantwortlichkeit und offene Fragen zum Azure-Billing.
- **OperatingMode**: Repräsentiert den verbindlichen Betriebsmodus; in diesem Block ist nur Single-Main erlaubt.
- **AzureResourceSet**: Repräsentiert die geplante Gruppe aus Resource Group, VM, statischer Public IP und NSG.
- **HardeningBaseline**: Repräsentiert die Pflichtmassnahmen auf dem Server wie Updates, Zeitzone, SSH-Policy und UFW.
- **RuntimePreparation**: Repräsentiert die Docker-Engine-/Compose-Basis und die vorbereitete Verzeichnisstruktur fuer spaetere Stacks.
- **EvidenceLog**: Repräsentiert den Nachweisblock mit Ressourcen, Tests, Restrisiken und Folge-Gate.
- **FollowUpGate**: Repräsentiert den naechsten klar benannten Schritt nach diesem Block.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Grant/Billing ist entweder mit einem belastbaren Microsoft-Nachweis belegt oder als echter Blocker klassifiziert.
- **SC-002**: Die Betriebsdokumentation enthaelt Single-Main als aktuellen Modus und keinen stillen Vorgriff auf Queue-Mode.
- **SC-003**: VM, Public IP und NSG sind entweder nachweisbar vorhanden oder der Primärblocker ist sauber dokumentiert.
- **SC-004**: Keine unzulaessigen Inbound-Ports sind fuer den Vorbereitungsblock freigegeben.
- **SC-005**: SSH laeuft nur mit Schluessel, Root- und Passwort-Login sind deaktiviert.
- **SC-006**: Docker Engine und Docker Compose sind fuer den Deploy-User nutzbar.
- **SC-007**: Das Folge-Gate ist eindeutig als DNS/HTTPS-Abnahme benannt und wird nicht vorgezogen.
- **SC-008**: Die Abschlussdokumentation enthaelt Restrisiken, offene Punkte und die explizite Abgrenzung der Nicht-Ziele.

## Assumptions

- Die eigentliche Azure-Provisionierung wird erst nach Freigabe des Governance- und Kosten-Gates umgesetzt.
- Fuer diesen Block reichen Dokumentations- und Vorbereitungsartefakte; produktiver n8n-Betrieb ist nicht Teil des Scopes.
- DNS, HTTPS und Reverse Proxy werden in einem spateren Block separat behandelt.
- Eine einzelne gehartete VM ist fuer den Vorbereitungsblock ausreichend; Hochverfuegbarkeit wird nicht vorgezogen.
- Das Repo bleibt die Quelle fuer den Betriebsvertrag, die Nachweise und die Folge-Gates.

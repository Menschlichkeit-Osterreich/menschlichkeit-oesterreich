# Feature Specification: Azure-n8n-Produktionspfad Phase 1-2-3 bis Abnahmevorbereitung

**Feature Branch**: `20260518-azure-n8n-produktionspfad-phase-1-2-3`

**Created**: 2026-05-18

**Status**: Draft

**Input**: Verbindlicher Arbeitsauftrag: Azure-basierter n8n-Bereitstellungs- und Abnahmepfad fuer den produktionsfaehigen Kernbetrieb.

## Ziel

Ein belastbarer, dokumentierter und abnahmefaehiger Bereitstellungspfad fuer `n8n.menschlichkeit-oesterreich.at` auf Azure, der Grant/Billing, VM-Basis, Netzwerkhaertung, DNS-Zielroute, HTTPS-Betrieb und Nachweislogik so vorbereitet, dass ein spaeteres produktives Go nicht auf Annahmen basiert.

## Ziele

- Reproduzierbare Dokumentations- und Abnahmevorbereitung fuer den Azure-n8n-Kernpfad.
- Klare Trennung zwischen Spezifikationsstand und spaeterem Live-Nachweis.
- Einheitliche Blocker- und Evidenzlogik fuer alle Gate-Punkte.
- Operative Uebergabefaehigkeit ohne Architektur-Raten.

## Scope

- Klaerung und Dokumentation von Nonprofit-Grant- und Billing-Status.
- Definition und Nachweisstruktur fuer Azure-Ressourcen der n8n-Zielarchitektur.
- Bereitstellungsdesign fuer VM, statische IP, NSG, SSH-Haertung und Docker-Compose-Betrieb.
- DNS-Zielbild und Plesk-Abloesung fuer `n8n.menschlichkeit-oesterreich.at`.
- Abnahmekriterien fuer HTTPS, geschlossene Exposition und Backup-Pflicht.
- Evidenzpfad fuer spaetere Go/No-Go-Entscheidung.

## Nicht-Ziele

- Kein produktiver Rollout ohne Primaernachweis.
- Kein KI-Ausbau.
- Keine Erweiterung der n8n-Fachworkflows.
- Keine Queue-Mode-Einfuehrung ueber den fuer den Erstbetrieb noetigen Vertrag hinaus.
- Keine allgemeine Azure-Landschaft jenseits des n8n-Kernpfads.

## Verbindliche Regeln

- Produktionsbehauptung nur mit Live-Nachweis.
- Azure ist verbindliche Zielarchitektur fuer n8n, Plesk nicht.
- Oeffentlich offen bleiben nur `22`, `80`, `443`.
- `5678`, `5432`, `6379` duerfen nicht oeffentlich exponiert sein.
- `N8N_ENCRYPTION_KEY`, DB-Credentials und Backup-Pfad sind Pflicht vor Go.
- Single-Main ist fuer den ersten belastbaren Betrieb zulaessig, wenn explizit dokumentiert.
- Dokumentation, Runtime-Design und Abnahmecheck muessen denselben Zustand beschreiben.

## User Scenarios & Testing

### User Story 1 - Grant-/Billing-Gate verifizieren und dokumentieren (Priority: P1)

Als verantwortliche Person fuer den Betrieb will ich den Grant- und Billing-Status mit belastbarer Nachweislogik dokumentieren, damit keine technischen Folgeschritte auf finanziell oder organisatorisch unklaren Voraussetzungen basieren.

**Why this priority**: Ohne belastbares Grant-/Billing-Gate ist jeder weitere Bereitstellungsschritt ein Risiko fuer Betrieb, Governance und Abnahme.

**Independent Test**: Ein Reviewer kann fuer Grant, Sponsorship, Billing-Profil, Budget-Alert und Renewal-Ownership je einen Nachweistyp und Status erkennen.

**Acceptance Scenarios**:

1. **Given** die Gate-Matrix ist gepflegt, **When** Grant/Billing geprueft wird, **Then** ist jeder Punkt als Primaernachweis oder Blocker markiert.
2. **Given** ein Billing-Nachweis fehlt, **When** der Gate-Status bewertet wird, **Then** stoppt der Status mindestens den produktiven Go-Pfad.

---

### User Story 2 - Azure-Zielarchitektur widerspruchsfrei festschreiben (Priority: P1)

Als Operator will ich ein eindeutiges Soll-Ziel fuer Resource Group, VM, Public IP, NSG, SSH-Haertung und Docker-Compose-Runtime haben, damit die Bereitstellung ohne Architektur-Raten moeglich ist.

**Why this priority**: Ein uneindeutiger Soll-Zustand erzeugt Fehlkonfigurationen bei Security, Exposition und HTTPS.

**Independent Test**: Ein zweiter Operator kann die Architekturbeschreibung lesen und denselben Zielzustand ableiten.

**Acceptance Scenarios**:

1. **Given** das Architekturkapitel ist vorhanden, **When** VM/Netzwerk/Runtime geprueft werden, **Then** sind Komponenten, Grenzwerte und Betriebsmodus eindeutig.
2. **Given** Ports und Zugriffspfade werden geprueft, **When** Expositionsregeln bewertet werden, **Then** sind nur `22`, `80`, `443` oeffentlich erlaubt.

---

### User Story 3 - DNS-, HTTPS- und Abnahmepfad fuer Go/No-Go vorbereiten (Priority: P1)

Als Maintainer will ich einen pruefbaren DNS-Umschalt- und HTTPS-Abnahmepfad inklusive Rueckfalllogik, damit ein spaeterer produktiver Wechsel kontrolliert stattfindet.

**Why this priority**: Ohne DNS-/HTTPS-Abnahme ist ein produktiver Betrieb nicht belastbar und nicht revisionsfaehig.

**Independent Test**: DNS-Zielzustand, HTTPS-Pruefungen, Backup-/Restore-Gate und Blockerregeln sind als klare Abnahmeschritte dokumentiert.

**Acceptance Scenarios**:

1. **Given** der DNS-Plan liegt vor, **When** Plesk-Abloesung bewertet wird, **Then** sind Go/No-Go-Kriterien und Rollbackpfad nachvollziehbar.
2. **Given** HTTPS und Pflicht-Env werden geprueft, **When** Abnahme erfolgt, **Then** ist fuer jeden Gate-Punkt der Evidenztyp festgelegt.

## Edge Cases

- Grant vorhanden, aber Billing-Profil falsch oder nicht aktiv nutzbar.
- DNS zeigt noch auf Plesk, obwohl Azure-Ressourcen bereitstehen.
- VM laeuft, aber NSG oder lokale Firewall oeffnet zu viel.
- HTTPS funktioniert, aber `WEBHOOK_URL` oder `N8N_EDITOR_BASE_URL` zeigt falsch.
- Docker-Setup laeuft intern, aber Backup/Restore ist nicht nachgewiesen.
- Redis ist vorhanden, aber Queue-Vertrag bleibt ungeklaert.
- Ressourcen sind angelegt, aber Zustaendigkeit fuer Betrieb und Renewal ist unklar.

## Requirements

### Functional Requirements

- **FR-001**: Das System MUST Grant-/Billing-Gates mit klarer Nachweislogik (Primaerquelle, Live-Nachweis, offener Pruefpunkt) definieren.
- **FR-002**: Das System MUST die Azure-Zielarchitektur fuer n8n als einziges Sollbild dokumentieren.
- **FR-003**: Das System MUST eine Sollstruktur fuer Resource Group, VM, statische IP, NSG, Disk und Basis-Monitoring festhalten.
- **FR-004**: Das System MUST den Netzwerk- und Haertungsvertrag fuer SSH, Firewall und Port-Exposition verbindlich dokumentieren.
- **FR-005**: Das System MUST Docker-Compose-Runtime fuer n8n, PostgreSQL und Reverse Proxy inklusive Pflicht-Volumes definieren.
- **FR-006**: Das System MUST Pflichtkonfigurationen fuer n8n (`N8N_ENCRYPTION_KEY`, DB-Credentials, URLs, TZ, Protocol/Host) als Go-Voraussetzung ausweisen.
- **FR-007**: Das System MUST den DNS-Zielzustand und den Plesk-Abloesepfad als pruefbaren Umschaltplan beschreiben.
- **FR-008**: Das System MUST HTTPS-Abnahmebedingungen und Fehlerszenarien fuer URL-/Certificate-/Routing-Abweichungen festlegen.
- **FR-009**: Das System MUST Backup- und Restore-Gate als verpflichtendes Go-Kriterium definieren.
- **FR-010**: Das System MUST fuer jeden Gate-Punkt Blockerregeln definieren (Provisioning-Blocker vs. produktives-Go-Blocker).
- **FR-011**: Das System MUST den Erstbetriebsvertrag (Single-Main zulaessig oder Queue) explizit dokumentieren.
- **FR-012**: Das System MUST einen Rueckfallpfad fuer DNS-, HTTPS-, Secret- und Expositionsfehler festhalten.
- **FR-013**: Das System MUST klar zwischen Soll-Zustand und unbestaetigtem Live-Zustand trennen.
- **FR-014**: Das System MUST den Scope auf den Azure-n8n-Kernpfad begrenzen und KI-/Workflow-Ausbau ausschliessen.

### Key Entities

- **AcceptanceObject**: Abnahmeobjekt mit Name, Soll-Zustand, Nachweistyp, Status, Blockerklasse.
  - Beispiele: Grant, Billing, Resource Group, VM, Public IP, NSG, DNS, Reverse Proxy, n8n Container, PostgreSQL, Backup.
- **EvidenceRecord**: Konkreter Nachweis pro Abnahmeobjekt.
  - Felder: Quelle, Nachweistyp, Zeitpunkt, Verifizierender, Ergebnis, Kommentar.
- **BlockerRule**: Regelwerk fuer Stop-Kriterien.
  - Felder: Gate, Wirkungsebene (Provisioning oder Go-Live), Bedingung, Eskalation.
- **RuntimeContract**: Betriebsvertrag fuer Erstbetrieb.
  - Felder: Modus (Single-Main/Queue), Pflicht-Env, Expositionsregeln, Secret-Pflichten.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Grant-/Billing-Status ist je Gate-Punkt als Primaernachweis oder Blocker markiert.
- **SC-002**: Zielarchitektur fuer VM, IP, NSG, SSH, Docker Compose und Reverse Proxy ist widerspruchsfrei dokumentiert.
- **SC-003**: DNS-Zielzustand und Plesk-Abloesung sind als pruefbare Abnahmebedingungen beschrieben.
- **SC-004**: Pflicht-Env und Expositionsregeln sind vollstaendig spezifiziert.
- **SC-005**: Backup- und Restore-Pfad ist als Go-Kriterium definiert.
- **SC-006**: Fuer jeden Gate-Punkt ist der Evidenztyp festgelegt.
- **SC-007**: Ein spaeterer Operator kann den Bereitstellungspfad ohne Architektur-Raten ausfuehren.

## Assumptions

- Azure-Primärnachweise sind derzeit teilweise offen und werden als offene Pruefpunkte gefuehrt.
- Die Spezifikation definiert den verpflichtenden Soll-Zustand; produktive Claims erfolgen erst nach Live-Evidenz.
- Plesk bleibt nur als Alt-Zustand, nicht als Zielarchitektur fuer n8n.

# Feature Specification: n8n Workflow Validitaets-Gate

**Feature Branch**: `20260515-before-specify-hook`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "n8n-Workflow-Validitaet plus CI-Validierung fuer produktionsnahe Workflows mit explizitem Sonderfall finance-donation-processing.json"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Relevante Workflows nachvollziehbar inventarisieren (Priority: P1)

Als verantwortliche Person fuer den n8n-Betrieb will ich eine explizite, nachvollziehbare Liste der produktionsnahen Workflow-Dateien haben, damit der Validitaets-Scope klar und auditierbar ist.

**Why this priority**: Ohne expliziten Scope ist nicht belegbar, welche Workflows das Gate absichert und welche nicht.

**Independent Test**: Kann unabhaengig getestet werden, indem die Inventarliste gegen den vorgesehenen Scope unter `automation/n8n` geprueft wird und jede gelistete Datei eindeutig aufloesbar ist.

**Acceptance Scenarios**:

1. **Given** die Inventarliste ist vorhanden, **When** ein Reviewer den Scope prueft, **Then** ist die Liste der produktionsnahen Workflow-Dateien explizit und nachvollziehbar.
2. **Given** eine relevante Workflow-Datei fehlt in der Inventarliste, **When** der Validierungscheck laeuft, **Then** wird dies als Abweichung sichtbar gemacht.

---

### User Story 2 - Strikte JSON-Validierung lokal reproduzierbar ausfuehren (Priority: P1)

Als Entwicklerin bzw. Entwickler will ich einen reproduzierbaren lokalen Validierungscheck fuer die inventarisierten Workflows haben, damit ich Fehler vor dem Push sicher erkenne.

**Why this priority**: Das lokale Gate verhindert spaete CI-Fehlschlaege und reduziert Defekte in produktionsnahen Artefakten.

**Independent Test**: Kann unabhaengig getestet werden, indem der lokale Befehl auf gueltigen und absichtlich ungueltigen Workflow-Dateien ausgefuehrt wird und korrekt mit Erfolg bzw. Fehler endet.

**Acceptance Scenarios**:

1. **Given** alle inventarisierten Workflows enthalten gueltiges JSON, **When** der lokale Validierungsbefehl ausgefuehrt wird, **Then** endet der Check erfolgreich.
2. **Given** mindestens eine inventarisierte Workflow-Datei ist syntaktisch ungueltig, **When** der lokale Validierungsbefehl ausgefuehrt wird, **Then** endet der Check mit Fehler und nennt die betroffene Datei.

---

### User Story 3 - CI blockiert ungueltige produktionsnahe Workflows (Priority: P1)

Als Maintainer will ich ein CI-Gate, das bei ungueltiger Workflow-JSON fehlschlaegt, damit defekte Artefakte nicht unbemerkt in Richtung Main gelangen.

**Why this priority**: Das ist das haerteste P0-Gate fuer belastbare Workflow-Artefakte vor allen weiteren n8n-Schritten.

**Independent Test**: Kann unabhaengig getestet werden, indem ein PR mit absichtlich ungueltiger inventarisierter Workflow-Datei erstellt wird und der CI-Job reproduzierbar fehlschlaegt.

**Acceptance Scenarios**:

1. **Given** ein PR enthaelt ungueltige JSON in einer inventarisierten Datei, **When** der CI-Workflow laeuft, **Then** ist der Job rot und blockiert den Merge.
2. **Given** ein PR enthaelt nur gueltige inventarisierte Workflow-JSON, **When** der CI-Workflow laeuft, **Then** ist der Job gruen.

---

### User Story 4 - Donation-Sonderfall explizit sichtbar halten (Priority: P2)

Als Stakeholder will ich, dass `finance-donation-processing.json` als bekannter Sonderfall sichtbar bleibt, damit kein stilles Greenwashing ohne spaeteren Import- oder Dry-Run-Nachweis entsteht.

**Why this priority**: Der Sonderfall ist ein bekanntes Risikoobjekt und muss bis zum separaten Nachweis explizit markiert bleiben.

**Independent Test**: Kann unabhaengig getestet werden, indem Validierungsausgabe und Doku den Sonderfall klar benennen und den offenen Nachweisstatus ausweisen.

**Acceptance Scenarios**:

1. **Given** der Validierungscheck wird ausgefuehrt, **When** der Donation-Workflow verarbeitet wird, **Then** wird dessen Sonderfallstatus explizit ausgegeben.
2. **Given** der Sonderfall hat noch keinen Import- oder Dry-Run-Nachweis, **When** die Doku geprueft wird, **Then** ist der offene Status klar sichtbar.

### Edge Cases

- Eine inventarisierte Datei wurde geloescht oder umbenannt.
- Eine neue produktionsnahe Workflow-Datei wurde angelegt, aber nicht in die Inventarliste aufgenommen.
- Eine Datei ist parsebar, aber leeres oder unvollstaendiges JSON-Objekt.
- Sonderfall-Datei ist vorhanden, aber ungueltig.
- Validierung wird versehentlich auf Legacy- oder Mirror-Pfade ausgeweitet.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Das System MUST eine explizite Inventarliste fuer produktionsnahe n8n-Workflow-Dateien unter `automation/n8n` bereitstellen.
- **FR-002**: Das System MUST bei der Validierung ausschliesslich die inventarisierten produktionsnahen Workflow-Dateien pruefen.
- **FR-003**: Das System MUST jede inventarisierte Workflow-Datei auf strikte JSON-Syntax validieren.
- **FR-004**: Das System MUST bei jeder ungueltigen inventarisierten Workflow-Datei mit Fehlerstatus fehlschlagen.
- **FR-005**: Das System MUST die betroffenen Dateipfade bei Fehlern eindeutig ausgeben.
- **FR-006**: Das System MUST einen lokalen, reproduzierbaren Pruefbefehl bereitstellen und dokumentieren.
- **FR-007**: Das System MUST ein CI-Gate bereitstellen, das denselben Validierungscheck ausfuehrt und bei Fehlern fehlschlaegt.
- **FR-008**: Das System MUST `finance-donation-processing.json` explizit als bekannten Sonderfall markieren, solange kein Import- oder Dry-Run-Nachweis vorliegt.
- **FR-009**: Das System MUST den Sonderfallstatus nicht stillschweigend als regulare Validitaet ohne Hinweis behandeln.
- **FR-010**: Das System MUST keine unbeteiligten Legacy- oder Mirror-Pfade in den Validierungsscope aufnehmen.
- **FR-011**: Das System MUST fuer diesen Block produktives n8n-Deployment, Azure-Provisioning, DNS/HTTPS, Reverse Proxy, Queue-Mode und fachliche Verlagerung aus `apps/api` explizit ausschliessen.

### Key Entities _(include if feature involves data)_

- **WorkflowInventory**: Explizite Liste der produktionsnahen Workflow-Dateipfade im Scope dieses Gates.
- **WorkflowValidationResult**: Ergebnis je Workflow-Datei mit Status, Fehlermeldung und Dateipfad.
- **SpecialCaseStatus**: Kennzeichnung und aktueller Nachweisstatus fuer den Donation-Sonderfall.
- **ValidationGateRun**: Zusammenfassung eines lokalen oder CI-Laufs inklusive Gesamtstatus und Fehleranzahl.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% der inventarisierten produktionsnahen Workflow-Dateien werden in jedem Lauf geprueft.
- **SC-002**: Der CI-Job endet bei ungueltiger JSON-Syntax in einer inventarisierten Datei reproduzierbar mit Fehlerstatus.
- **SC-003**: Die Workflow-Liste ist explizit dokumentiert und fuer Reviewer ohne implizite Annahmen nachvollziehbar.
- **SC-004**: Der Donation-Sonderfall ist in Validierungsausgabe und Doku explizit sichtbar, solange der Nachweisstatus offen ist.
- **SC-005**: Der lokale Pruefbefehl ist dokumentiert und liefert bei identischem Artefaktstand dasselbe Ergebnis wie die CI-Pruefung.
- **SC-006**: Keine Legacy- oder Mirror-Pfade werden durch das Gate mitgeprueft.

## Assumptions

- Produktive oder produktionsnahe Workflow-Artefakte liegen im vorgesehenen Bereich unter `automation/n8n`.
- Die bestehende CI-Infrastruktur des Repositories kann den Validierungsbefehl als blockierenden Step ausfuehren.
- Der Import- oder Dry-Run-Nachweis fuer `finance-donation-processing.json` wird in einem spaeteren, getrennten Block erbracht.
- Dieser Block fokussiert ausschliesslich auf syntaktische Validitaet und Sichtbarkeit des Sonderfalls, nicht auf fachliche Workflow-Reparaturen.

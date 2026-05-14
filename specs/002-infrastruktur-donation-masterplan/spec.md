# Feature Specification: Infrastruktur, Donation und Governance Masterplan

**Feature Branch**: `20260518-setup-azure-n8n`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Vollstaendiger Masterplan fuer Infrastruktur, Donation-System, Governance, Operations und Skalierung fuer Menschlichkeit Oesterreich"

## Clarifications

### Session 2026-05-14

- Q: Welches verbindliche Verfuegbarkeits- und Wiederherstellungsziel gilt fuer den Produktionsbetrieb? -> A: Verfuegbarkeit 99,9% pro Monat und RTO <= 2h.
- Q: Welcher IaC-Standard ist fuer Azure verbindlich? -> A: Terraform mit Azure Verified Modules (AVM).
- Q: Wie wird die externe Erreichbarkeit produktiver Dienste verbindlich begrenzt? -> A: Nur Reverse-Proxy oeffentlich; API und n8n ausschliesslich intern hinter dem Proxy.
- Q: Welche verbindliche Reaktionsvorgabe gilt fuer kritische Alerts? -> A: Slack + E-Mail Pflicht; kritische Alerts innerhalb von 30 Minuten bestaetigen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Produktionsplattform stabil betreiben (Priority: P1)

Als Plattformverantwortliche Person moechte ich eine stabile, sichere und reproduzierbar betreibbare Cloud-Plattform, damit zentrale Vereinsdienste verlaesslich verfuegbar sind.

**Why this priority**: Ohne stabile Betriebsplattform sind alle Folgefunktionen (Website, API, Spendenfluss, CRM-Anbindung) nicht belastbar.

**Independent Test**: Kann vollstaendig getestet werden, indem die produktionsrelevanten Dienste ueber HTTPS erreichbar sind, ein definiertes Go/No-Go-Set erfuellen und ein dokumentierter Rollbackpfad vorliegt.

**Acceptance Scenarios**:

1. **Given** die Plattform wurde bereitgestellt, **When** ein Produktions-Readiness-Check durchgefuehrt wird, **Then** sind alle kritischen Dienste erreichbar und sicher konfiguriert.
2. **Given** ein ungeplanter Ausfall tritt auf, **When** der Rollbackpfad ausgefuehrt wird, **Then** wird der Betrieb innerhalb des definierten Wiederherstellungsziels wiederhergestellt.

---

### User Story 2 - End-to-End-Spendenfluss absichern (Priority: P1)

Als Verantwortliche fuer Spendenprozesse moechte ich einen geprueften End-to-End-Donation-Flow mit klaren Freigabegates, damit Spenden verarbeitbar, nachvollziehbar und belegbar bleiben.

**Why this priority**: Der Spendenfluss ist missionskritisch und darf weder Datenverluste noch fachlich unklare Zustandswechsel enthalten.

**Independent Test**: Kann unabhaengig getestet werden, indem ein dokumentierter Smoke-Test mit Erfolgscode, belegten Receipt-Faellen und archivierten Webhook-Antworten ausgefuehrt wird.

**Acceptance Scenarios**:

1. **Given** ein gueltiger Spendenfall, **When** der End-to-End-Fluss ausgefuehrt wird, **Then** wird der Vorgang bis zur bestaetigten Verarbeitung und Nachweisablage abgeschlossen.
2. **Given** ein fehlerhafter Teilfluss, **When** die Verarbeitung erfolgt, **Then** greifen Retry- und Fehlerpfade mit nachvollziehbarer Eskalation.

---

### User Story 3 - Datenschutz und Governance verankern (Priority: P1)

Als Governance- und Security-Verantwortliche Person moechte ich verbindliche Datenschutz-, Rollen- und Secret-Regeln im Betriebsmodell verankern, damit Compliance und Verantwortlichkeiten auditierbar sind.

**Why this priority**: Fehlende Governance fuehrt zu unklaren Zustaendigkeiten und erhoeht Compliance- und Betriebsrisiken.

**Independent Test**: Kann unabhaengig getestet werden, indem Rollen, Secret-Ownership, Datenklassifizierung und Loesch-/Auskunftspfade dokumentiert und in einer Auditpruefung bestaetigt werden.

**Acceptance Scenarios**:

1. **Given** das Governance-Modell ist eingefuehrt, **When** ein Rollen- und Verantwortlichkeitsreview erfolgt, **Then** sind kritische Zustaendigkeiten eindeutig zugewiesen.
2. **Given** ein Datenschutzfall wird ausgeloest, **When** der definierte Prozess durchlaufen wird, **Then** sind Schritte, Nachweise und Ergebnis revisionssicher dokumentiert.

---

### User Story 4 - Betriebsresilienz durch Backups und Restore schaffen (Priority: P2)

Als Betriebsverantwortliche Person moechte ich taegliche Backups und regelmaessig nachgewiesene Restore-Tests, damit ein Ausfall nicht zu dauerhaftem Datenverlust fuehrt.

**Why this priority**: Ohne geprueften Restore ist ein Backup nur theoretisch vorhanden und betrieblich unzureichend.

**Independent Test**: Kann unabhaengig getestet werden, indem ein dokumentierter Restore-Test eines aktuellen Sicherungsstands erfolgreich abgeschlossen wird.

**Acceptance Scenarios**:

1. **Given** Backups wurden erstellt, **When** ein Restore-Test auf einer isolierten Zielumgebung durchgefuehrt wird, **Then** sind Daten und Dienste wiederherstellbar.
2. **Given** ein Restore-Test faellt aus, **When** die Nacharbeit erfolgt, **Then** wird ein erneuter Test mit dokumentiertem Erfolg nachgereicht.

---

### User Story 5 - Monitoring und Alerts fuer kritische Signale bereitstellen (Priority: P2)

Als Betriebsteam moechte ich kritische Signale aktiv ueberwachen und eskalieren, damit Ausfaelle oder Blockaden frueh erkannt und zeitnah behoben werden.

**Why this priority**: Frueherkennung reduziert Ausfallzeit und begrenzt fachliche Folgeschaeden.

**Independent Test**: Kann unabhaengig getestet werden, indem definierte Alarmfaelle gezielt simuliert und korrekt ausgeloeste Benachrichtigungen nachgewiesen werden.

**Acceptance Scenarios**:

1. **Given** ein kritischer Dienst ist nicht erreichbar, **When** die Ueberwachung anschlaegt, **Then** wird ein Alert innerhalb des Zielzeitfensters ausgeloest.
2. **Given** eine Verarbeitungsqueue blockiert, **When** der Schwellwert ueberschritten wird, **Then** wird der Vorfall als kritisch markiert und eskaliert.

---

### User Story 6 - Teamfaehige Betriebsuebergabe sicherstellen (Priority: P3)

Als Vereinsvorstand moechte ich vollstaendige Betriebsdokumentation und nachvollziehbare Runbooks, damit der Betrieb nicht an Einzelpersonen haengt.

**Why this priority**: Operative Einzelabhaengigkeit gefaehrdet Kontinuitaet, Vertretbarkeit und langfristige Skalierbarkeit.

**Independent Test**: Kann unabhaengig getestet werden, indem eine zweite Person kritische Betriebsablaeufe nur anhand der Dokumentation erfolgreich durchfuehrt.

**Acceptance Scenarios**:

1. **Given** die Runbooks sind veroeffentlicht, **When** ein Teammitglied einen Standard-Deploymentablauf ausfuehrt, **Then** gelingt der Ablauf ohne ad-hoc Rueckfragen.
2. **Given** ein Incident tritt auf, **When** das Incident-Runbook befolgt wird, **Then** werden Diagnose, Eskalation und Abschluss nach dem dokumentierten Verfahren ausgefuehrt.

### Edge Cases

- Budgetwarnungen sind konfiguriert, aber Benachrichtigungen erreichen Verantwortliche nicht.
- DNS-Umschaltung ist teilweise erfolgt und erzeugt inkonsistente Erreichbarkeit.
- Ein Pflichtdienst bleibt intern erreichbar, ist aber extern nicht verfuegbar.
- Webhooks treffen doppelt oder verspaetet ein und duerfen keine Mehrfachverarbeitung ausloesen.
- Backup vorhanden, aber Restore scheitert wegen unvollstaendigem Abhaengigkeitsstand.
- Datenschutzprozess wird angefordert, waehrend ein Incident aktiv ist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST eine eindeutige Zielarchitektur mit klar benannten autoritativen Systemen je Fachbereich definieren.
- **FR-002**: Das System MUST harte Architekturregeln fuer erlaubte und verbotene Betriebspraktiken verbindlich festlegen.
- **FR-003**: Das System MUST ein stufenweises Infrastruktur-Rollout mit pruefbaren Exit-Kriterien pro Phase bereitstellen.
- **FR-004**: Das System MUST Budgetsteuerung mit abgestuften Warnschwellen und testbarer Ausloeselogik enthalten.
- **FR-005**: Das System MUST ein verbindliches Rollen- und Verantwortlichkeitsmodell fuer Plattform, Finanzen, Security und Betrieb enthalten.
- **FR-006**: Das System MUST einen abgesicherten Produktionszugang mit klaren Netzgrenzen und minimaler Exposition definieren.
- **FR-007**: Das System MUST reproduzierbare Deploymentablaeufe mit dokumentierten Rollbackpfaden verlangen.
- **FR-008**: Das System MUST fuer den produktiven Betrieb gueltige HTTPS-Erreichbarkeit und wiederkehrende Nachweiskontrollen fordern.
- **FR-009**: Das System MUST den Spendenfluss als End-to-End-Kette mit verbindlichen Vorab-Gates und Freigabekriterien definieren.
- **FR-010**: Das System MUST fuer den Spendenfluss einen verbindlichen Smoke-Test mit dokumentierten Evidenzen vor Produktionsfreigabe verlangen.
- **FR-011**: Das System MUST Datenschutzanforderungen fuer Loeschung, Datenklassifizierung und Log-Schutz verbindlich festlegen.
- **FR-012**: Das System MUST festlegen, dass vertrauliche Daten und direkte Identifikatoren nicht in Betriebslogs erscheinen duerfen.
- **FR-013**: Das System MUST einen verbindlichen Vertrag fuer Queue-, Retry-, Dead-Letter- und Idempotenzverhalten definieren.
- **FR-014**: Das System MUST einen zentralen Fehlerbehandlungsablauf mit Korrelation, Eskalation und Abbruchkriterien definieren.
- **FR-015**: Das System MUST CI/CD-Freigaben an Pflichtpruefungen und Sicherheitsbedingungen koppeln.
- **FR-016**: Das System MUST eine Mindestabnahme fuer kritische Website-Routen und Barrierefreiheitsanforderungen definieren.
- **FR-017**: Das System MUST taegliche Sicherungen fuer zentrale Betriebsdaten verlangen und den Sicherungsumfang transparent dokumentieren.
- **FR-018**: Das System MUST einen regelmaessigen Restore-Test als Pflichtnachweis definieren; ohne Nachweis gilt Backup-Schutz als unvollstaendig.
- **FR-019**: Das System MUST Pflichtdokumente fuer Architektur, Betrieb, Incident und Wiederherstellung benennen und aktuell halten.
- **FR-020**: Das System MUST Monitoring- und Alerting-Pflichten fuer definierte kritische Signale mit priorisierter Eskalation festlegen.
- **FR-021**: Das System MUST den Ausbau neuer KI/RAG-Funktionen an nachgewiesene Produktionsstabilitaet, Sicherheit und Governance-Reife koppeln.
- **FR-022**: Das System MUST klare Go-/No-Go-Kriterien fuer Produktionsfreigabe festlegen und vor jeder Freigabe pruefen.
- **FR-023**: Das System MUST fuer den Produktionsbetrieb eine monatliche Mindestverfuegbarkeit von 99,9% und ein Wiederherstellungsziel (RTO) von maximal 2 Stunden verbindlich festlegen.
- **FR-024**: Das System MUST Terraform mit Azure Verified Modules (AVM) als verbindlichen Standard fuer Azure-Infrastrukturdefinition und -Aenderungen verwenden.
- **FR-025**: Das System MUST externe Erreichbarkeit so begrenzen, dass ausschliesslich der Reverse-Proxy oeffentlich exponiert ist und API sowie n8n nur intern hinter dem Proxy erreichbar bleiben.
- **FR-026**: Das System MUST fuer kritische Alerts einen verbindlichen Eskalationskanal ueber Slack und E-Mail sowie eine Bestaetigungsfrist von maximal 30 Minuten festlegen.

### Key Entities *(include if feature involves data)*

- **MasterplanPhase**: Ein geordneter Umsetzungsblock mit Ziel, Aufgaben, Deliverables und Exit-Kriterium.
- **GateCriterion**: Ein pruefbares Freigabekriterium, das vor dem Uebergang in die naechste Phase erfuellt sein muss.
- **OperationalEvidence**: Nachweisartefakt fuer durchgefuehrte Tests, Verifikationen oder Kontrollen.
- **RoleOwnership**: Zuordnung einer fachlichen oder betrieblichen Verantwortung zu einer benannten Rolle.
- **ComplianceControl**: Datenschutz- oder Sicherheitsvorgabe mit Kontrolllogik und Pruefnachweis.
- **ResilienceControl**: Backup-, Restore- oder Failover-Vorgabe zur Sicherstellung der Betriebskontinuitaet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% der definierten Masterplan-Phasen besitzen dokumentierte Exit-Kriterien und benannte Nachweisartefakte.
- **SC-002**: 100% der produktionskritischen Freigaben werden nur bei erfuellten Go-Kriterien und ohne No-Go-Verletzung abgeschlossen.
- **SC-003**: Mindestens 1 erfolgreicher End-to-End-Spenden-Smoke-Test mit dokumentierten Receipt-Faellen und archivierten Webhook-Evidenzen liegt vor jeder Produktionsfreigabe vor.
- **SC-004**: 100% der kritischen Monitoring-Signale loesen in Simulationen innerhalb von 5 Minuten eine Benachrichtigung aus.
- **SC-005**: Fuer 100% der taeglich gesicherten Kernbereiche liegt innerhalb des definierten Pruefintervalls ein erfolgreicher Restore-Nachweis vor.
- **SC-006**: 100% der benoetigten Pflichtdokumente sind vorhanden, versioniert und fuer Vertretungsbetrieb nutzbar.
- **SC-007**: In einem Uebergabetest kann eine zweite verantwortliche Person mindestens 3 kritische Betriebsablaeufe ohne direkte Hilfe durchfuehren.
- **SC-008**: Der Produktionsbetrieb erreicht monatlich mindestens 99,9% Verfuegbarkeit und in simulierten Ausfallfaellen wird ein RTO von <= 2 Stunden eingehalten.
- **SC-009**: 100% aller produktiven Azure-Infrastruktur-Aenderungen erfolgen ueber Terraform-Definitionen mit AVM-basierten Modulen und sind in der Versionshistorie nachvollziehbar.
- **SC-010**: In externen Netzscans sind ausschliesslich die freigegebenen Proxy-Endpunkte sichtbar; direkte Erreichbarkeit von API- und n8n-Backendports liegt in 100% der Pruefungen bei 0.
- **SC-011**: 100% der kritischen Alerts werden ueber Slack und E-Mail zugestellt und innerhalb von maximal 30 Minuten bestaetigt.

## Assumptions

- Der aktuelle Auftrag umfasst Plattformbetrieb und Governance ganzheitlich und ist nicht auf einen einzelnen Service begrenzt.
- Bereits bestehende Teilartefakte fuer n8n und Governance werden als Vorarbeit betrachtet und in den Masterplan integriert.
- Externe Dienstanbieter fuer Zahlung, Kommunikation und Dokumentenmanagement bleiben organisatorisch gesetzt.
- Budget- und Rollenentscheidungen koennen innerhalb des Vereins in der benoetigten Reihenfolge getroffen werden.
- Der Rollout erfolgt phasenweise, und jede Phase darf nur nach belegter Erfuellung ihrer Exit-Kriterien fortgesetzt werden.

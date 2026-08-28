# Tasks: Repo-weite Speckit-Orchestrierung

## Format

- [ID] [P?] [Stream] Beschreibung

## Phase 1: Baseline und Hygiene

- [ ] R001 [P] [cross] Repository-Issue-Inventar als baseline erheben (open, labels, milestone, assignee).
- [ ] R002 [cross] Duplikatregeln fuer identische Titel und Legacy-Issues verbindlich anwenden.
- [ ] R003 [cross] Label-Normalisierung fuer Speckit-/Masterplan-/Legacy-Streams finalisieren.
- [ ] R004 [cross] Sicherstellen, dass alle open issues im Project #2 enthalten sind.

## Phase 2: API-Track

- [ ] A101 [P] [api] API-Issues nach Risiko und Vertragsrelevanz in Wave A/B einordnen.
- [ ] A102 [api] Test- und Security-Issues fuer API als kritische Kette markieren.
- [ ] A103 [api] Abhaengigkeiten API zu Website/CRM explizit verlinken.
- [ ] A104 [api] API-DoD fuer Wave-uebergaenge dokumentieren.

## Phase 3: Website-Track

- [ ] W101 [P] [website] Website-Issues in User-Flow-Cluster gruppieren.
- [ ] W102 [website] Performance-/Accessibility-Issues in eigene Subsequenz setzen.
- [ ] W103 [website] Website-API-Abhaengigkeiten fuer Delivery-Reihenfolge festhalten.
- [ ] W104 [website] Website-Wellenabnahme gegen Qualitätsgates definieren.

## Phase 4: CRM-Track

- [ ] C101 [P] [crm] CRM-Issues in Zahlungs-, Mitgliedschafts- und Operations-Cluster schneiden.
- [ ] C102 [crm] Kritische CRM-Integrationen fuer Wave A/B priorisieren.
- [ ] C103 [crm] CRM-Abhaengigkeiten zu API und n8n transparent markieren.
- [ ] C104 [crm] CRM-Akzeptanzkriterien fuer Betriebsstabilitaet definieren.

## Phase 5: Forum-Track

- [ ] F101 [P] [forum] Forum-Issues in Sicherheit, Betrieb und Community-Features trennen.
- [ ] F102 [forum] Forum-Governance-Issues in Wave C/D einplanen.
- [ ] F103 [forum] Forum-Abhaengigkeiten zu zentralen Auth/Policy-Themen dokumentieren.

## Phase 6: Babylon-Game-Track

- [ ] G101 [P] [babylon-game] Game-Issues in Core-Gameplay vs. Integration splitten.
- [ ] G102 [babylon-game] Integrations-Issues zu Website/Auth in Wave C einplanen.
- [ ] G103 [babylon-game] Game-Qualitaetskriterien fuer release-nahe Wellen definieren.

## Phase 7: Project-Orchestrierung

- [ ] P201 [cross] Workflow Status fuer alle open issues konsistent pflegen.
- [ ] P202 [cross] Wave-Zuordnung als Projektfeld fuer alle open issues setzen.
- [ ] P203 [cross] Blocked-Issues mit explizitem Grund klassifizieren (duplikat, altlast, externer blocker).
- [ ] P204 [cross] In-Progress-WIP-Limit je Wave dokumentieren und anwenden.

## Phase 8: Secret Governance (BWS + GitHub)

- [ ] S401 [P] [cross] Workflow-Secret-Referenzen gegen secrets.manifest.json und BWS-Keys vollstaendig abgleichen.
- [ ] S402 [cross] Kritische fehlende Secrets (DB/JWT/PLESK/SSH/Stripe) in BWS je Umgebung verifizieren oder nur bei bestaetigtem Bedarf anlegen.
- [ ] S403 [cross] Repo/Env-Secrets aus BWS fuer alle in Workflows referenzierten Secrets synchronisieren.
- [ ] S404 [cross] Deprecated Secret-Aliase konsolidieren (GH_ADMIN_TOKEN/REPO_ADMIN_TOKEN/ADMIN_PAT).
- [ ] S405 [cross] Secret-Validierungspipeline an Manifest-Schema anpassen und als Gate verankern.
- [ ] S406 [cross] Security-Alert-Backlog (Code/Secret/Dependabot) in Secret-Risiken und Remediation-Issues ueberfuehren.

## Phase 9: Plesk-Infra-Track

> Plesk ist die produktive Laufzeit fuer CRM, Website und Forum. Connectivity-Werte stammen aus dem bestehenden BSM-Mapping. Strict Host Key Checking ist verpflichtend. `ForwardAgent` ist keine Default-Anforderung. Live-Verifikation startet read-only und nur nach expliziter Autorisierung.

- [ ] I901 [P] [infra] Read-only Plesk Connectivity und Host-Trust gegen den bestehenden BSM-Vertrag verifizieren; keine Host/User/Key-Werte im Public Repo hardcoden.
- [ ] I902 [infra] Aktiven Deployment-Zustand von CRM, Website und Forum gegen den kanonischen Read-only Audit Contract aus PR #533 erfassen.
- [ ] I903 [infra] Plesk-Vhost-Vertrag fuer Website als TARGET/VERIFIED_REPO dokumentieren und Live-Drift nur read-only verifizieren.
- [ ] I904 [infra] Plesk-Vhost-Vertrag fuer Drupal/CiviCRM dokumentieren; CiviCRM bleibt auf Plesk, keine CRM->Azure Migration ableiten.
- [ ] I905 [infra] Plesk-Vhost-Vertrag fuer Forum dokumentieren und gegen den aktuellen Repo-/Deploymentpfad abgleichen.
- [ ] I906 [infra] Bestehende Plesk Deploy-Workflows und Scripts inventarisieren und pro Service einen System-of-Record festlegen; nur echte Luecken ergaenzen, keine Duplikatskripte.
- [ ] I907 [infra] Bestehende Plesk BSM-Referenzen fuer Host, User, Port, Private Key und Known Hosts verifizieren; kein neues Secret-Silo ohne nachgewiesenen Bedarf.
- [ ] I908 [infra] Health-/TLS-/VHost-Checks fuer erwartete MOE Hosts mit Status-only Logging und minimalem Alerting konsolidieren.
- [ ] I909 [infra] Rollback- und Recovery-Vertrag fuer CRM, Website und Forum dokumentieren; Backup erst nach isoliertem Restore-Test als verifiziert behandeln.

## Phase 10: Azure-Infra-Track

> Azure devmoe ist die Container-Plattform ausschliesslich fuer API, Games und n8n. Azure ist kein Ziel fuer Drupal/CiviCRM. Connectivity-Werte und Keys werden ueber den bestehenden Secret-Management-Vertrag aufgeloest und nicht als kanonische Klartextwerte in Tasks festgeschrieben.

- [ ] A901 [P] [infra] Azure Connectivity und Host-Trust fuer den Container-Track verifizieren; keine IP/User/PEM-Datei als kanonische Task-Konfiguration hardcoden.
- [ ] A902 [infra] App-Verteilung auf Azure explizit auf API (FastAPI), Games (Next.js/Babylon.js) und n8n begrenzen.
- [ ] A903 [infra] Docker-Compose-Datei fuer Azure-Produktion in `docker-compose.prod.yml` verifizieren und anpassen, ohne CRM/CiviCRM aufzunehmen.
- [ ] A904 [P] [infra] Container-Images fuer API und Games in der bestaetigten Registry publizieren.
- [ ] A905 [infra] n8n-Konfiguration auf Azure: Volumes, Umgebungsvariablen und Webhook-URL verifizieren; Payment-/Donation-Gates separat respektieren.
- [ ] A906 [infra] Reverse-Proxy fuer Azure-Container konfigurieren und nur API/Games/n8n Routen verantworten.
- [ ] A907 [infra] Azure SSH-/Deploy-Credentials ueber bestehende Secret-Management-Referenzen aufloesen und den Deploy-Pfad dokumentieren; keine PEM-Datei als Repository-Vertrag verwenden.
- [ ] A908 [infra] Azure Health-Monitoring fuer API, Games und n8n mit minimalen, PII-freien Statusdaten einrichten.
- [ ] A909 [infra] Rollback-Verfahren fuer Azure-Container-Deploys dokumentieren; keine Plesk-CRM-Aktion in diesen Track aufnehmen.

## Phase 11: Abschlussanalyse

- [ ] Z301 [cross] Vollstaendigkeitspruefung: fehlt ein Issue ohne Planungskontext?
- [ ] Z302 [cross] Risiko-Review pro App-Stream und Cross-App durchfuehren.
- [ ] Z303 [cross] Verbesserungsmassnahmen priorisieren und als Folge-Issues anlegen.
- [ ] Z304 [cross] Repo-weiten Speckit-Statusbericht dokumentieren.

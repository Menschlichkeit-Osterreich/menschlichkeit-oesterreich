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
- [ ] S402 [cross] Kritische fehlende Secrets (DB/JWT/PLESK/SSH/Stripe) in BWS je Umgebung verifizieren oder anlegen.
- [ ] S403 [cross] Repo/Env-Secrets aus BWS fuer alle in Workflows referenzierten Secrets synchronisieren.
- [ ] S404 [cross] Deprecated Secret-Aliase konsolidieren (GH_ADMIN_TOKEN/REPO_ADMIN_TOKEN/ADMIN_PAT).
- [ ] S405 [cross] Secret-Validierungspipeline an Manifest-Schema anpassen und als Gate verankern.
- [ ] S406 [cross] Security-Alert-Backlog (Code/Secret/Dependabot) in Secret-Risiken und Remediation-Issues ueberfuehren.

## Phase 9: Plesk-Infra-Track (Host: 5.183.217.146 / User: peter_schuller)

> Plesk-Host ist die produktive Basis fuer CRM, Website und Forum. SSH-Zugang via ForwardAgent.

- [ ] I901 [P] [infra] SSH-Connectivity-Check zu `5.183.217.146` (User: `peter_schuller`, ForwardAgent: yes) verifizieren.
- [ ] I902 [infra] Aktiven Deployment-Zustand pruefen: Welche Apps (CRM, Website, Forum) laufen auf Plesk?
- [ ] I903 [infra] Plesk-Vhost-Konfiguration fuer Website (React/Vite-Build) dokumentieren und als Speckit-Artefakt festhalten.
- [ ] I904 [infra] Plesk-Vhost-Konfiguration fuer CRM (Drupal 10 + CiviCRM) dokumentieren: PHP-Version, Apache-Modul, DB-Verbindung.
- [ ] I905 [infra] Plesk-Vhost-Konfiguration fuer Forum (phpBB) dokumentieren: PHP-Version, DB-Zugang.
- [ ] I906 [infra] Deployment-Skripte fuer Plesk (Website-Build-Push, CRM-Update, Forum-Update) in `scripts/deploy/` anlegen.
- [ ] I907 [infra] SSH-Key und Zugangsdaten fuer `peter_schuller@5.183.217.146` in BWS/Secrets.manifest registrieren.
- [ ] I908 [infra] Plesk-Health-Check-Endpoint definieren und in Monitoring-Runbook aufnehmen.
- [ ] I909 [infra] Rollback-Verfahren fuer Plesk-Deploys (CRM/Website/Forum) dokumentieren.

## Phase 10: Azure-Infra-Track (devmoe: 20.91.246.245 / User: azureuser / Key: devmoelaptop.pem)

> Azure devmoe ist die Container-Plattform fuer API, Games und n8n.

- [ ] A901 [P] [infra] SSH-Connectivity-Check zu `devmoe` (20.91.246.245, azureuser, devmoelaptop.pem) verifizieren.
- [ ] A902 [infra] App-Verteilung auf Azure festlegen: API (FastAPI), Games (Next.js/Babylon.js), n8n (Automatisierung).
- [ ] A903 [infra] Docker-Compose-Datei fuer Azure-Produktion in `docker-compose.prod.yml` verifizieren und anpassen.
- [ ] A904 [P] [infra] Container-Images fuer API und Games in Registry (GHCR oder ACR) publizieren.
- [ ] A905 [infra] n8n-Konfiguration auf Azure: Volumes, Umgebungsvariablen, Webhook-URL verifizieren.
- [ ] A906 [infra] Reverse-Proxy (Traefik/Nginx) fuer Azure-Container konfigurieren: Routen api._ / game._ / n8n.\*.
- [ ] A907 [infra] SSH-Key `devmoelaptop.pem` in BWS registrieren und Deploy-Skript `scripts/deploy/azure-devmoe.sh` anlegen.
- [ ] A908 [infra] Azure-Health-Monitoring einrichten: HTTP-Checks fuer alle Container-Services.
- [ ] A909 [infra] Rollback-Verfahren fuer Azure-Container-Deploys dokumentieren.

## Phase 11: Abschlussanalyse

- [ ] Z301 [cross] Vollstaendigkeitspruefung: fehlt ein Issue ohne Planungskontext?
- [ ] Z302 [cross] Risiko-Review pro App-Stream und Cross-App durchfuehren.
- [ ] Z303 [cross] Verbesserungsmassnahmen priorisieren und als Folge-Issues anlegen.
- [ ] Z304 [cross] Repo-weiten Speckit-Statusbericht dokumentieren.

# Plattform-Gesamtaudit und Zielarchitektur – Menschlichkeit Österreich

## 1. Executive Summary

**VERIFIZIERT**

- Plattform wird als Multi-Service-Monorepo mit Website, API, Drupal/CiviCRM, Webgame und n8n betrieben; lokale Entwicklungsports 5173, 8001, 8000, 3000, 5678 sind dokumentiert.
- Hosting-Kontext ist Single-Server auf Plesk mit bekannter Panel-Erreichbarkeit über `https://5.183.217.146:8443`.
- Repository enthält eine hohe Anzahl CI/CD- und Security-Workflows (u. a. CodeQL, Gitleaks, Trivy, SBOM), was ein starkes Automationsfundament zeigt.

**WAHRSCHEINLICH**

- Betriebsrisiko ist derzeit stark durch Single-Server-Konzentration geprägt (Panel, Mail, Apps, Datenbanken, Storage auf einem Failure-Domain).
- Governance- und Ownership-Dokumentation ist partiell vorhanden, aber nicht konsistent pro Service und Runbook-Tiefe.
- Secrets- und Deployment-Komplexität ist aufgrund Monorepo- und Multi-Service-Umfang erhöht.

**EMPFOHLEN**

- P0: Sicherheits- und Betriebsbasis härten (Panel-Zugang, Mail-Authentizität, Backup/Restore-Testbarkeit, RBAC, Audit-Logs).
- P1: Service-separierte Subdomain-, Datenbank- und Monitoring-Architektur verbindlich umsetzen.
- P1: Durchgängiges Designsystem inkl. Logo-Derivate und Rollen-/Navigationskonsistenz über Website, Mitgliederbereich, Admin und Webgame.
- P1: Dokumentationsstruktur als Single Source of Truth mit verbindlichen Runbooks und Ownership-Matrix fixieren.

---

## 2. Methodik und Annahmen

### 2.1 Prüfmethodik

**VERIFIZIERT**

- Dokumenten- und Repository-basierte Analyse (Architektur-, Security-, Workflow- und Strukturprüfung ohne intrusive Maßnahmen).
- Keine destruktiven, ausnutzenden oder produktionsverändernden Aktionen ausgeführt.

### 2.2 Annahmen (explizit)

**WAHRSCHEINLICH**

- Direkter Live-Zugriff auf Plesk-Konfiguration, DNS-Zone, Mail-Logs, DB-Instanzen und produktive Monitoring-Dashboards liegt in dieser Analyse nicht vor.
- Einige Services sind historisch gewachsen und teilweise heterogen (WordPress/HTML, React/Vite, FastAPI, Drupal/CiviCRM, Game-Stack).

### 2.3 Offene Prüffragen

**EMPFOHLEN**

- Welche Plesk-Erweiterungen sind aktuell exakt installiert und aktiviert?
- Ist panel-Zugriff per VPN/IP-Allowlist abgesichert oder öffentlich erreichbar?
- Welche DMARC-Policy ist produktiv (`none`, `quarantine`, `reject`)?
- Sind Backup-Restore-Tests mit dokumentiertem RTO/RPO nachweisbar?
- Welche produktiven SLOs und Alert-Eskalationen sind verbindlich hinterlegt?

---

## 3. Ist-Analyse

### 3.1 Systemübersicht

| Bereich  | Ist-Zustand                                                                   | Bewertung                                     |
| -------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Hosting  | Single-Server Plesk                                                           | Stabil für klein/mittel, kritisch bei Ausfall |
| Dienste  | Website, API, Drupal/CiviCRM, Nextcloud, Forum, Support, Voting, n8n, Webgame | Funktional breit, aber stark gekoppelt        |
| Repo     | Monorepo mit vielen Workflows                                                 | Gute Automationsbasis, hohe Komplexität       |
| Daten    | MariaDB + weitere DB-Technologien im Ökosystem                                | Risiko durch heterogene Betriebsstandards     |
| Mail     | Mehrere Rollenadressen vorhanden                                              | Rollen teilweise gemischt (Person/Funktion)   |
| Branding | `logo.JPG` als Primärlogo                                                     | Technisch nutzbar, aber Derivate fehlen       |

### 3.2 Governance und Ownership

**VERIFIZIERT**

- Umfangreiche Dokumentationslandschaft vorhanden.

**WAHRSCHEINLICH**

- Ownership pro Service/Runbook/Alert nicht überall eindeutig als accountable Rolle fixiert.

**EMPFOHLEN**

- Verbindliche Service-Owner-Matrix mit Stellvertretung und Eskalationskontakt je Service.

---

## 4. Kritische Risiken

| Risiko                                     | Schweregrad | VERIFIZIERT/WAHRSCHEINLICH | Wirkung                                            | EMPFOHLEN                                                   |
| ------------------------------------------ | ----------- | -------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Single-Server Failure Domain               | kritisch    | WAHRSCHEINLICH             | Komplettausfall Panel, Mail, Apps, Daten           | Reverse-Proxy + Service-Isolation + getestete Restore-Pfade |
| Panel auf 8443 öffentlich                  | kritisch    | WAHRSCHEINLICH             | Erhöhte Angriffsfläche auf Control Plane           | VPN/IP-Allowlist, MFA, Fail2ban, Geo/IP-Restriktion         |
| Mail-Authentizität unklar (SPF/DKIM/DMARC) | hoch        | WAHRSCHEINLICH             | Spoofing, Zustellprobleme, Reputationsverlust      | Strikte SPF/DKIM/DMARC-Policy mit Monitoring                |
| Uneinheitliche RBAC/Logging-Standards      | hoch        | WAHRSCHEINLICH             | Privilegienmissbrauch schwer nachvollziehbar       | Zentrales RBAC + Audit-Trail Pflicht                        |
| Backup ohne harte Restore-Nachweise        | hoch        | WAHRSCHEINLICH             | Datenverlust/verlängerte Ausfälle                  | Restore-Runbooks + monatliche Testprotokolle                |
| Service-übergreifende UX-Inkonsistenz      | mittel      | WAHRSCHEINLICH             | Niedrige Conversion/Engagement, höhere Supportlast | Designsystem + IA + einheitliche Navigationslogik           |

---

## 5. Plesk-Optimierungsplan

| Maßnahme                                                       | Priorität | Ziel                       | Begründung                                     | Abhängigkeiten                | Aufwand | Risiko bei Nichtumsetzung |
| -------------------------------------------------------------- | --------- | -------------------------- | ---------------------------------------------- | ----------------------------- | ------- | ------------------------- |
| Panel-Hardening (8443 nur via VPN/IP-Allowlist, MFA erzwingen) | P0        | Control-Plane absichern    | Plesk ist High-Value-Target                    | Netzwerkzugang, IAM           | mittel  | kritisch                  |
| TLS-Härtung (TLS 1.2/1.3, starke Ciphers, HSTS, OCSP Stapling) | P0        | Transportschutz            | Schutz vor MITM/Legacy-Schwächen               | Zertifikate, Webserver-Config | niedrig | hoch                      |
| Fail2ban + ModSecurity mit geprüftem Regelset                  | P0        | Angriffserkennung/Abwehr   | Schutz gegen Brute Force/OWASP-Muster          | Log-Pfade, WAF-Tuning         | mittel  | hoch                      |
| Backup-Policy inkl. Offsite + Verschlüsselung + Restore-Test   | P0        | Wiederanlauf sicherstellen | Backup ohne Restore ist unzureichend           | Storage, Schlüsselmanagement  | mittel  | kritisch                  |
| Mailserver-Härtung (Submission TLS-only, Auth-Policies)        | P1        | Mailintegrität             | Schutz vor Missbrauch                          | DNS + Mailconfig              | niedrig | hoch                      |
| Cronjob-Inventar und Least-Privilege-Review                    | P1        | Betriebssicherheit         | Veraltete Jobs sind Ausfall-/Sicherheitsrisiko | Job-Doku                      | niedrig | mittel                    |
| DB-Management in getrennten Service-Scopes                     | P1        | Blast-Radius reduzieren    | Rechte- und Datenabgrenzung                    | DB-Migrationen                | mittel  | hoch                      |
| Zertifikatsmanagement zentralisieren (ACME + Expiry Alert)     | P1        | Ausfallprävention          | Zertifikatsablauf verursacht Downtime          | DNS/ACME                      | niedrig | hoch                      |
| Plesk-Extension-Minimierung                                    | P2        | Angriffsfläche reduzieren  | Jedes Plugin erhöht Risiko                     | Extension-Audit               | niedrig | mittel                    |

---

## 6. E-Mail-Optimierungsplan

### 6.1 Mailbox-/Alias-Matrix

| Adresse                 | Typ                             | Zweck                            | Datenschutzbezug | Zugriff                            | EMPFOHLEN                                    |
| ----------------------- | ------------------------------- | -------------------------------- | ---------------- | ---------------------------------- | -------------------------------------------- |
| office@                 | Funktionsmailbox (Hauptadresse) | Offizielle Kommunikation         | hoch             | kleines Kernteam                   | Primäre externe Adresse                      |
| info@                   | Funktionsmailbox                | Allgemeine Anfragen              | mittel           | Office/Sekretariat                 | Kann auf CRM-Ticketfluss routen              |
| kontakt@                | Alias oder Funktionsmailbox     | Kontaktformular-Eingang          | hoch             | Support/Office                     | Striktes Routing + Ticket-ID                 |
| support@                | Funktionsmailbox                | Support-System                   | hoch             | Support-Team                       | Pflicht für Incident- und Mitgliederanfragen |
| security@               | Funktionsmailbox                | Vulnerability Disclosure         | hoch             | Security Officer + Stellvertretung | Separater IR-Prozess                         |
| newsletter@             | Technische/Marketing Mailbox    | Kampagnenversand                 | mittel           | Kommunikationsteam                 | Getrennte Versanddomäne erwägen              |
| noreply@                | Technische Senderadresse        | Systemmails                      | niedrig          | kein Inbox-Use                     | SPF/DKIM strikt, keine Antworten             |
| admin@                  | Funktionsmailbox intern         | Betriebsnahe Admin-Kommunikation | hoch             | Admin-Kreis                        | Nicht als primäre externe Adresse            |
| personenbezogene Konten | Personenbezogen                 | individuelle Kommunikation       | hoch             | jeweilige Person                   | Von Funktionspostfächern strikt trennen      |

### 6.2 Authentizität und Sicherheit

| Maßnahme                                      | Priorität | Ziel                         | Aufwand | Risiko bei Nichtumsetzung |
| --------------------------------------------- | --------- | ---------------------------- | ------- | ------------------------- |
| SPF strikt (nur legitime Sender)              | P0        | Spoofing reduzieren          | niedrig | hoch                      |
| DKIM für alle versendenden Systeme            | P0        | Integrität/Nachweis          | mittel  | hoch                      |
| DMARC mit Reporting, Ziel `reject`            | P0        | Domainschutz                 | mittel  | hoch                      |
| TLS erzwungen für Submission/Relay            | P1        | Vertraulichkeit              | niedrig | mittel                    |
| Bounce-Handling über `bounce@` automatisieren | P1        | Listenhygiene/Zustellbarkeit | mittel  | mittel                    |
| Quotas + Alerting je Mailbox                  | P1        | Verfügbarkeit                | niedrig | mittel                    |
| Anti-Spam/Anti-Malware feinjustieren          | P1        | Missbrauchsschutz            | mittel  | mittel                    |

---

## 7. Subdomain-Architektur

### 7.1 Subdomain-Matrix

| Subdomain                             | Zweck               | Sicherheitsbedarf | Routing/Proxy                      | TLS                                     | Auth                  | Monitoring             | Single-Server-Risiko                 |
| ------------------------------------- | ------------------- | ----------------- | ---------------------------------- | --------------------------------------- | --------------------- | ---------------------- | ------------------------------------ |
| www.menschlichkeit-oesterreich.at     | Öffentliche Website | hoch              | Reverse Proxy auf Web-Frontend/CMS | Pflicht + HSTS                          | optional User-Login   | HTTP, UX, Cert         | Ausfall = komplette Außenwirkung weg |
| api.menschlichkeit-oesterreich.at     | API                 | kritisch          | Reverse Proxy auf FastAPI          | mTLS intern optional, extern TLS strikt | JWT/OAuth2, RBAC      | Latency, 5xx, RPS      | Kernfunktionen fallen aus            |
| cloud.menschlichkeit-oesterreich.at   | Nextcloud           | kritisch          | dedizierter Upstream               | TLS strikt, große Uploads               | SSO/2FA empfohlen     | WebDAV, Storage, Queue | Datenzugriff blockiert               |
| forum.menschlichkeit-oesterreich.at   | Communityforum      | hoch              | dediziertes App-Routing            | TLS Pflicht                             | lokale Accounts/SSO   | Uptime, Spamrate       | Communitystillstand                  |
| support.menschlichkeit-oesterreich.at | Tickets/Support     | hoch              | dedizierter Upstream               | TLS Pflicht                             | Rollenbasiert         | Queue, SLA-Zeiten      | Supportausfall                       |
| vote.menschlichkeit-oesterreich.at    | Voting              | kritisch          | isolierter Upstream                | TLS + strikte Security Header           | starke Auth + Audit   | Integrität, Anomalien  | Vertrauensverlust                    |
| mail.menschlichkeit-oesterreich.at    | SMTP/IMAP Hostname  | kritisch          | Maildienste                        | TLS/STARTTLS                            | Mailauth              | Queue, Rejectrate      | Mailausfall                          |
| webmail.menschlichkeit-oesterreich.at | Benutzer-Webmail    | hoch              | webmail app                        | TLS Pflicht                             | 2FA empfohlen         | Uptime, Login-Events   | Kommunikationsausfall                |
| panel.menschlichkeit-oesterreich.at   | Plesk Panel         | kritisch          | direkter Panelzugang               | TLS Pflicht                             | MFA + Netzrestriktion | Auth-Failures          | Kontrollverlust Infrastruktur        |

**EMPFOHLEN**

- Einheitlicher Reverse-Proxy-Layer mit Security-Headers, Rate-Limits und zentralem TLS-Management.
- Strikte Trennung öffentlicher und interner Adminpfade.

---

## 8. Nextcloud-Architektur

| Bereich           | VERIFIZIERT/WAHRSCHEINLICH                                  | EMPFOHLEN                                                               |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Betriebsziel      | WAHRSCHEINLICH: Nextcloud als zentrale Kollaborationsablage | Produktiv unter `cloud.` mit isoliertem Storage und dedizierten Backups |
| Storage-Strategie | WAHRSCHEINLICH: Shared Host-Storage möglich                 | Primärstorage + versionierte Snapshots + Offsite-Backup                 |
| Rollenmodell      | WAHRSCHEINLICH: noch nicht formalisiert                     | Rollen: User, Gruppenadmin, Compliance-Admin, Systemadmin               |
| Datenschutz       | WAHRSCHEINLICH: DSGVO-relevant wegen Personenbezug          | DLP-Regeln, Ablaufdaten bei Freigaben, Link-Passwortpflicht             |
| Freigaben         | WAHRSCHEINLICH: öffentliches Teilen möglich                 | Interne/Externe Freigaben strikt trennen, externe Default-Expiry        |
| TLS-Hardening     | WAHRSCHEINLICH                                              | HSTS, sichere Ciphers, Header-Hardening                                 |
| Backup/Restore    | WAHRSCHEINLICH                                              | App-/DB-/File-konsistente Sicherung + dokumentierter Restore-Test       |

**Admin-Policies (EMPFOHLEN)**

- Default: Externe Linkfreigaben aus, projektweise aktivieren.
- Pflicht: 2FA für Admins, Geo/IP-Auffälligkeiten alarmieren.
- Pflicht: Aufbewahrungs-/Löschregeln pro Datentyp dokumentieren.

---

## 9. MariaDB-Architektur

### 9.1 Zielstruktur (Service-separiert)

- `main_platform_database`
- `forum_database`
- `newsletter_database`
- `support_database`
- `voting_database`

### 9.2 Architekturprinzipien

| Prinzip                    | Priorität | EMPFOHLEN                                                      |
| -------------------------- | --------- | -------------------------------------------------------------- |
| Least Privilege            | P0        | Pro Service eigener DB-User mit minimalen Rechten              |
| Trennung Umgebungen        | P0        | Separate DBs/Instanzen für prod/staging/dev                    |
| Backup/Restore-Testbarkeit | P0        | Vollbackup + PITR soweit verfügbar + monatlicher Restore-Proof |
| Wartbarkeit                | P1        | Namenskonventionen, Migrationspipeline je Service              |
| Performance                | P1        | Slow Query Log, Indexpflege, Query Budgets                     |
| Auditierbarkeit            | P1        | Datenzugriffe und Schemaänderungen protokollieren              |

### 9.3 Migrationsstrategie (ohne Zeitachse)

**EMPFOHLEN**

1. Bestehende Schemas inventarisieren und Tabellen Services zuordnen.
2. Service-User erstellen, Rechte auf Schemaebene minimieren.
3. Daten schrittweise in Ziel-DBs verschieben und Integrationspunkte anpassen.
4. Read/Write-Pfade mittels Smoke-Tests und Restore-Test protokollieren.

---

## 10. Monitoring-Architektur

### 10.1 Monitoring-Matrix

| Domäne        | Metrik/Check                               | Schwellenwert                      | Alarmweg         | Ownership      |
| ------------- | ------------------------------------------ | ---------------------------------- | ---------------- | -------------- |
| HTTP Uptime   | Verfügbarkeit pro Subdomain                | <99.5% 24h = Alarm                 | Messenger + Mail | DevOps On-Call |
| API           | p95 Latenz, 5xx-Rate                       | p95 >800ms / 5xx >2%               | Pager + Ticket   | API Owner      |
| Mail          | Queue-Länge, Deferred/Bounce               | Queue > definierter Baselinefaktor | Mail + Ticket    | Mail Admin     |
| DB            | Replikation/Verbindungsfehler/Slow Queries | Error Spike oder Slow > Baseline   | Pager            | DB Owner       |
| Infrastruktur | CPU/RAM/Disk/Inodes                        | >85% sustained                     | Pager            | Platform Owner |
| TLS           | Zertifikat Restlaufzeit                    | <21 Tage Warnung, <7 Tage kritisch | Mail + ChatOps   | Platform Owner |
| Security      | Auth-Failures, WAF-Events                  | Schwellwert je Dienst              | SIEM/Alert       | Security Owner |

### 10.2 Architektur

**EMPFOHLEN**

- Intern: Plesk Monitoring + Grafana + Service Watchdogs (Prozess/Healthcheck).
- Extern: Uptime Kuma für HTTP/TLS/API-Endpunkte + öffentliche Statusseite.
- Alerting: Severity-basiert (`kritisch`, `hoch`, `mittel`) mit klarer Eskalationslogik und Stellvertretung.
- Dashboard-Struktur: Executive, Platform, Security, Service-spezifisch (API, Mail, DB, Nextcloud).

---

## 11. Security-Hardening-Plan

| Maßnahme                                                   | Priorität | Ziel                 | Abhängigkeiten           | Aufwand | Risiko bei Nichtumsetzung |
| ---------------------------------------------------------- | --------- | -------------------- | ------------------------ | ------- | ------------------------- |
| Zentrales IAM/RBAC für Adminflächen                        | P0        | Privilegienkontrolle | SSO/IdP oder lokales IAM | mittel  | kritisch                  |
| Audit-Log-Pflicht für Admin-/Voting-/Support-Aktionen      | P0        | Nachvollziehbarkeit  | Logpipeline              | mittel  | hoch                      |
| Security Header Baseline (CSP, HSTS, XFO, Referrer-Policy) | P0        | Browserseitige Härte | Reverse Proxy            | niedrig | hoch                      |
| Rate Limiting + Bot-Abwehr für API/Login                   | P0        | Missbrauchsschutz    | Gateway/WAF              | niedrig | hoch                      |
| OWASP API Top 10 Controls verbindlich                      | P1        | API-Sicherheit       | Dev-Standards            | mittel  | hoch                      |
| Secret-Rotation-Policy + Leak-Runbook                      | P1        | Schlüsselhygiene     | Secrets-Store            | mittel  | hoch                      |
| Dependency/SBOM Enforcement in CI                          | P1        | Supply-Chain-Schutz  | CI-Policies              | niedrig | mittel                    |
| Panel/SSH Zugriff nur mit starker Auth + Netzsegmentierung | P0        | Infrastrukturhärte   | Netzwerk + IAM           | mittel  | kritisch                  |

---

## 12. Repo- und CI/CD-Verbesserungen

### 12.1 Ist und Risiken

**VERIFIZIERT**

- Monorepo und sehr umfangreiche Workflow-Landschaft vorhanden.

**WAHRSCHEINLICH**

- Überschneidungen und Inkonsistenzen zwischen Workflows/Quality Gates möglich.

### 12.2 EMPFOHLEN

| Maßnahme                                                       | Priorität | Ziel                              | Aufwand |
| -------------------------------------------------------------- | --------- | --------------------------------- | ------- |
| Workflow-Konsolidierung (Build/Test/Security/Deploy/SBOM)      | P1        | Redundanz abbauen, Wartung senken | mittel  |
| Klare Build-Isolation pro Service                              | P1        | reproduzierbare Releases          | mittel  |
| Deployment-Reihenfolge deklarativ dokumentieren                | P1        | Ausfall-/Rollback-Risiko senken   | niedrig |
| Secrets-Hygiene für `.env.vault`/`secrets/` per Policy-as-Code | P0        | Leak-Risiko minimieren            | mittel  |
| Branch Protection + Required Checks vereinheitlichen           | P0        | Qualitätsbarriere                 | niedrig |
| Ownership-Datei pro Bereich (`CODEOWNERS` fein granular)       | P1        | Governance                        | niedrig |
| SBOM-Export und Archivierung pro Build-Artefakt                | P1        | Compliance/Audit                  | niedrig |

---

## 13. UX/UI- und Designsystem

### 13.1 Designsystem-Basis (Logo-zentriert)

**VERIFIZIERT**

- `logo.JPG` ist Primärquelle und muss plattformweit konsistent genutzt werden.

**EMPFOHLEN**

- Abgeleitete Brand-Artefakte: `logo.svg`, `favicon.ico`, `logo-symbol.svg`, `logo-dark.svg`.
- Token-System: Farben, Typografie, Spacing, Radius, Shadow, Focus-Ring, Statusfarben.

### 13.2 Komponentenregeln

| Komponente | EMPFOHLEN Standard                                    |
| ---------- | ----------------------------------------------------- |
| Buttons    | Primär/Sekundär/Ghost/Danger + Disabled/Loading/Focus |
| Cards      | Header/Body/Footer mit einheitlichem Spacing          |
| Formulare  | Label, Hilfe, Fehler, Erfolg, Pflichtfeldmarkierung   |
| Tabellen   | Sticky Header, Sortierung, Zustandsdarstellung        |
| Badges     | Status: aktiv/inaktiv/pending/warnung/kritisch        |
| Navigation | Primär-, Sekundär- und Kontextnavigation konsistent   |

### 13.3 UX-Schwerpunkte

- Einheitliche Informationsarchitektur über öffentliche und interne Bereiche.
- Responsives Verhalten und klare Feedbackzustände bei Formularen/Workflows.
- Konsistente Login-/Session-Erfahrung über Mitglieder-, Admin- und Webgame-Kontexte.

---

## 14. Mitgliederbereich

| Bereich             | EMPFOHLEN                                                                       |
| ------------------- | ------------------------------------------------------------------------------- |
| Profilseiten        | Klare Trennung öffentlich/privat, Rollen- und Datenschutzsichtbarkeit steuerbar |
| Einstellungen       | Datenschutz, Benachrichtigungen, Sicherheit (2FA, Sessions) zentral bündeln     |
| Communityfunktionen | Direkte Verlinkung zu Forum, Voting, Webgame-Aktivitäten                        |
| Onboarding          | Aufgabenliste mit Fortschritt und Datenschutz-Hinweisen                         |
| Aktivität           | Persönlicher Feed mit kontrollierter Sichtbarkeit                               |
| Navigation          | Rollenbasierte, personalisierte Menüs statt statischer Vollnavigation           |

---

## 15. Rollenmodell

### 15.1 RBAC-Matrix

| Rolle               | Zugriff                     | Sichtbarkeit                  | Aktionen                                           | Moderation                           | Datenzugriff                      | Verwaltungsrechte      | Technische Rechte             | Eskalationsgrenze         |
| ------------------- | --------------------------- | ----------------------------- | -------------------------------------------------- | ------------------------------------ | --------------------------------- | ---------------------- | ----------------------------- | ------------------------- |
| Gast                | Öffentliche Bereiche        | Nur öffentlich                | Lesen, Registrierung                               | keine                                | keine personenbezogenen Daten     | keine                  | keine                         | keine                     |
| Mitglied            | Mitgliederbereich begrenzt  | Eigene/zugelassene Inhalte    | Profil pflegen, Voting teilnehmen, Forum schreiben | Meldung von Inhalten                 | eigene Daten + freigegebene Daten | keine                  | keine                         | an Moderator              |
| Moderator           | Communitybereiche erweitert | Moderationsrelevante Inhalte  | Beiträge prüfen, verwarnen, sperren (begrenzt)     | ja (inhaltlich)                      | minimierte Moderationsdaten       | keine Systemverwaltung | keine Infrastrukturrechte     | an Administrator          |
| Administrator       | Fachliche Adminbereiche     | Servicebezogene Betriebsdaten | Mitglieder-/Inhaltsverwaltung, Newsletter, Support | erweitert                            | fachlich notwendige Daten         | ja (fachlich)          | keine Root-/Panel-Rechte      | an Systemadministrator    |
| Systemadministrator | Technische Kernbereiche     | technische Logs/Konfiguration | Deployment, Infrastruktur, IAM                     | keine Inhaltsmoderation als Standard | technische Metadaten              | ja (technisch)         | Panel/Server/DB administrativ | Board/Security Governance |

### 15.2 Default-Rechte

**EMPFOHLEN**

- Default minimal: Gast/Mitglied nur notwendige Rechte.
- Fachliche und technische Adminrechte strikt trennen.
- Kritische Aktionen mit Vier-Augen-Prinzip (z. B. Rolleneskalation, Voting-Parameter).

---

## 16. Adminbereich

| Modul                | Ziel                           | Sicherheitsbarriere          | Logging            |
| -------------------- | ------------------------------ | ---------------------------- | ------------------ |
| Mitgliederverwaltung | Konten, Rollen, Verifikationen | RBAC + 2FA                   | Pflicht-Audit-Logs |
| Inhaltsverwaltung    | Seiten, News, Moderation       | Freigabeprozess              | Änderungsprotokoll |
| Communityverwaltung  | Forum/Regeln/Sanktionen        | Moderator-Scopes             | Moderationsjournal |
| Spielmechaniken      | Webgame-Konfiguration          | getrennte Rechte             | Spieländerungslog  |
| Plattformdaten       | Integrationsstatus/KPIs        | Read-only für viele Rollen   | Abrufprotokoll     |
| Support              | Tickets/SLA                    | Datenminimierung             | Ticket-Audit       |
| Newsletter           | Listen/Kampagnen               | Versandberechtigung getrennt | Kampagnenlog       |
| Rollen & Rechte      | RBAC-Mutation                  | Vier-Augen-Prinzip           | Security-Audit-Log |
| Monitoring           | Service-Status                 | Read-only Standard           | Zugriffslog        |
| Audit-Logs           | Compliance-Nachweis            | manipulationsresistent       | revisionssicher    |

---

## 17. Webgame-Integration

| Thema             | EMPFOHLEN                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| Session/SSO       | Bevorzugt SSO (OIDC/JWT) mit kurzlebigen Tokens und Rotation           |
| Datenmodell       | Entkoppelte Game-Domain mit referenzierten Nutzer-IDs                  |
| Profilintegration | Fortschritt/Badges im Mitgliederprofil anzeigen (einwilligungsbasiert) |
| Community         | Wettbewerbe/Rankings mit Datenschutzoptionen                           |
| Sicherheit        | Anti-Cheat-Basics, Rate Limits, Input-Validierung                      |
| Entkopplung       | Spielausfälle dürfen Kernplattform nicht blockieren                    |
| UX-Konsistenz     | Gleiches Designsystem, Navigation, Zustands- und Fehlermuster          |

---

## 18. Dokumentations-Zielstruktur

### 18.1 Dokumentationsbaum-Struktur

```text
docs/
  index.md
  architecture/
    system-overview.md
    target-architecture.md
    subdomain-architecture.md
    data-architecture.md
    rbac-model.md
  operations/
    runbook-backup-restore.md
    runbook-incident-response.md
    runbook-monitoring-alerting.md
    runbook-mail-operations.md
    runbook-plesk-hardening.md
  security/
    hardening-baseline.md
    secrets-management.md
    vulnerability-management.md
    audit-logging-policy.md
  compliance/
    gdpr-data-flow-register.md
    retention-and-deletion-policy.md
    dpa-and-processor-register.md
  media/
    screenshots/
    screenshots-guidelines.md
```

### 18.2 Verbindliche Inhalte

- Runbooks mit Preconditions, Step-by-Step, Rollback, Evidence.
- Incident-Response inkl. Kommunikationsvorlagen.
- Monitoring-Katalog inkl. Schwellwerten und Ownership.
- Mail-/Subdomain-Architektur mit DNS/TLS-Anforderungen.
- Backup/Restore-Nachweise und Freigabeprotokolle.

---

## 19. Sofortmaßnahmen nach Priorität

| Priorität | Maßnahme                                                             | Kritikalität | Abhängigkeiten   | Aufwand |
| --------- | -------------------------------------------------------------------- | ------------ | ---------------- | ------- |
| P0        | Plesk-Panel-Zugriff härten (MFA, IP-Allowlist/VPN, Fail2ban)         | kritisch     | Netzwerk/IAM     | mittel  |
| P0        | SPF+DKIM+DMARC produktiv erzwingen und reporten                      | hoch         | DNS/Mail         | mittel  |
| P0        | Backup + Restore-Testprotokoll für DB, Nextcloud, App-Daten          | kritisch     | Storage/Runbooks | mittel  |
| P0        | RBAC-Minimalrechte und Audit-Logs für Admin/Voting/Support           | hoch         | IAM/Logging      | mittel  |
| P1        | Subdomain-Trennung mit Reverse-Proxy-Policies                        | hoch         | Proxy/TLS        | mittel  |
| P1        | DB-Service-Trennung und Service-User-Least-Privilege                 | hoch         | DB-Migration     | mittel  |
| P1        | Monitoring-Matrix in Grafana/Uptime Kuma operationalisieren          | hoch         | Metrics/Alerting | mittel  |
| P1        | Designsystem- und Navigationskonsolidierung (inkl. Logo-Derivate)    | mittel       | UI-Library       | mittel  |
| P2        | Extension-Audit (z. B. SEO Toolkit) und Deaktivierungsentscheidungen | mittel       | Plesk-Zugriff    | niedrig |
| P2        | CI/CD-Workflow-Konsolidierung + SBOM-Archivierung                    | mittel       | CI-Rechte        | mittel  |

---

## 20. Zielarchitektur

### 20.1 Ist-Zustand vs Zielbild

| Dimension  | Ist (VERIFIZIERT/WAHRSCHEINLICH)            | Zielbild (EMPFOHLEN)                                            |
| ---------- | ------------------------------------------- | --------------------------------------------------------------- |
| Hosting    | Single-Server-Plesk                         | Modulare Plattform mit Reverse Proxy (Cloudflare oder Nginx)    |
| Laufzeit   | Teilweise direkt/heterogen                  | Containerisierte Services mit klaren Grenzen                    |
| Frontend   | Bestehende Frontend-Stacks inkl. React/Vite | Next.js als konsolidierte Web-App-Schicht                       |
| API        | FastAPI vorhanden                           | FastAPI als standardisierte Integrationsschicht                 |
| CRM        | Drupal + CiviCRM                            | Weiterhin integriert, klar segmentiert und abgesichert          |
| Files      | Nextcloud vorhanden/gewünscht               | Nextcloud produktiv auf eigener Subdomain + Policies            |
| Automation | n8n vorhanden                               | n8n als isolierter Automationsdienst mit abgesicherten Webhooks |
| Monitoring | Teilweise vorhanden                         | Prometheus + Grafana + Uptime Kuma + Statusseite                |
| Security   | Viele Scanning-Bausteine                    | End-to-End Hardening inkl. IAM, RBAC, Audit, Secrets-Vault      |

---

## 21. Konkrete umzusetzende Artefakte

1. `docs/architecture/target-architecture.md` – verbindliche Zielsystembeschreibung.
2. `docs/architecture/subdomain-architecture.md` – Subdomain- und Proxy-Sicherheitsregeln.
3. `docs/architecture/rbac-model.md` – Rollenmodell inkl. Entscheidungsregeln.
4. `docs/operations/runbook-plesk-hardening.md` – Panel/TLS/WAF/Fail2ban Checklisten.
5. `docs/operations/runbook-mail-operations.md` – SPF/DKIM/DMARC/Bounce/Quotas.
6. `docs/operations/runbook-backup-restore.md` – DB/Files Restore-Testprotokolle.
7. `docs/security/secrets-management.md` – Secret-Lifecycle, Rotation, Zugriffsmatrix.
8. `docs/security/audit-logging-policy.md` – Audit-Trail Pflichtfelder und Aufbewahrung.
9. `docs/security/hardening-baseline.md` – Security Header, Rate Limits, CSRF/CSP Baseline.
10. `docs/compliance/gdpr-data-flow-register.md` – Verarbeitungsverzeichnis mit Systembezug.
11. `docs/compliance/retention-and-deletion-policy.md` – Löschfristen und Verantwortungen.
12. `docs/media/screenshots-guidelines.md` – Nachweisführung, Redaction, Dateinamensschema.
13. `docs/operations/runbook-monitoring-alerting.md` – Metriken, Schwellenwerte, Eskalation.
14. `docs/architecture/data-architecture.md` – MariaDB-Servicegrenzen und Service-Accounts.
15. `docs/operations/service-ownership-matrix.md` – technische/fachliche Ownership je Dienst.

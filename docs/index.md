# Dokumentationsindex – Menschlichkeit Österreich

**Kanonischer Einstiegspunkt für die Projektdokumentation.**

Hinweis: Für Datei-Browser und GitHub-Ansichten verweist auch [README.md](README.md) auf diesen Index.

Zielgruppen: Entwickler:innen, DevOps, Datenschutzbeauftragte, Maintainer.

---

## Einstieg

| Dokument                                                  | Inhalt                           |
| --------------------------------------------------------- | -------------------------------- |
| [Quickstart](getting-started/quickstart.md)               | Setup in unter 10 Minuten        |
| [Services & Ports](getting-started/services-and-ports.md) | Alle Dienste, Ports, URLs        |
| [README.md](../README.md)                                 | Projektübersicht, Quick-Commands |

---

## Architektur

| Dokument                                                                                             | Inhalt                                                                            |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [System-Übersicht](architecture/system-overview.md)                                                  | Multi-Service-Architektur, Datenflüsse                                            |
| [Plattform-Gesamtaudit & Zielarchitektur](architecture/plattform-gesamtaudit-und-zielarchitektur.md) | Auditierbare Gesamtanalyse inkl. RBAC-, Subdomain-, Mail- und Monitoring-Matrizen |
| [Infrastructure](infrastructure/)                                                                    | Plesk, Hosting, DNS                                                               |
| [OpenClaw Architecture](../openclaw-system/ARCHITECTURE.md)                                          | Multi-Agent-System                                                                |
| [ADRs](adr/)                                                                                         | Architekturentscheidungen                                                         |

---

## Betrieb

| Dokument                                             | Inhalt                                 |
| ---------------------------------------------------- | -------------------------------------- |
| [Deployment](operations/deployment.md)               | Build-Pipeline, Plesk-Deploy, Rollback |
| [Monitoring](operations/monitoring.md)               | Uptime, Alerts, SLOs, Healthchecks     |
| [Incident Response](operations/incident-response.md) | P0/P1 Playbook, Eskalation             |
| [Backup & Restore](operations/backup-restore.md)     | DB, Uploads, Volumes                   |

---

## Sicherheit

| Dokument                                                     | Inhalt                                  |
| ------------------------------------------------------------ | --------------------------------------- |
| [SECURITY.md](../SECURITY.md)                                | Responsible Disclosure, Scope, Kontakt  |
| [Secrets Policy](security/secrets-policy.md)                 | Klassifikation, Rotation, Leak Response |
| [Hardening](security/hardening.md)                           | WAF, Headers, CORS, Rate Limiting       |
| [Responsible Disclosure](security/responsible-disclosure.md) | Kurzfassung Meldeweg                    |
| [Secrets Catalog](security/secrets-catalog.md)               | Inventar aller Secrets                  |
| [Supply Chain](security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md)  | SBOM, SLSA                              |

---

## Compliance & Datenschutz

| Dokument                                                               | Inhalt                               |
| ---------------------------------------------------------------------- | ------------------------------------ |
| [DSGVO-Betrieb](compliance/gdpr-operations.md)                         | Art. 5/6/13/33/34, Betroffenenrechte |
| [Privacy Policy](PRIVACY.md)                                           | Öffentliche Datenschutzerklärung     |
| [DPIA (Art. 35)](privacy/art-35-dpia.md)                               | Datenschutz-Folgenabschätzung        |
| [Incident Playbook Art. 33/34](privacy/art-33-34-incident-playbook.md) | 72h-Meldepflicht                     |

---

## Medien & Evidence

| Dokument                                                          | Inhalt                                     |
| ----------------------------------------------------------------- | ------------------------------------------ |
| [Screenshots & Redaction SOP](media/screenshots-and-redaction.md) | Ordnerstruktur, Namenskonvention, Freigabe |

---

## Runbooks

| Dokument                                           | Inhalt                               |
| -------------------------------------------------- | ------------------------------------ |
| [Service-Neustart](../runbooks/service-restart.md) | Alle Services, Docker, Plesk         |
| [P1 Incident](../runbooks/incident-p1.md)          | Kritischer Vorfall – Sofortmaßnahmen |

---

## Tooling & Integrationen

| Dokument                               | Inhalt                        |
| -------------------------------------- | ----------------------------- |
| [Figma Integration](figma/)            | Design-Token-Sync             |
| [MCP Server](../mcp-servers/README.md) | Model Context Protocol Server |
| [n8n Automation](../automation/n8n/)   | Webhook-Workflows             |
| [Forum](forum/)                        | phpBB Setup & Operations      |

---

_Letzte Aktualisierung: 2026-03-08_
_Beitragen: Neue Dokumente hier verlinken, bevor sie in Unterordnern abgelegt werden._

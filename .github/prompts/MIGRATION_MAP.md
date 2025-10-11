---
---

**⚠️ DEPRECATED - NICHT VERWENDEN**

Diese Datei ist veraltet und wird in einer zukünftigen Version entfernt.

- **Status:** DEPRECATED
- **Datum:** 2025-10-08
- **Migration:** .github/chatmodes/MIGRATION_MAP_DE.chatmode.md
- **Grund:** Legacy Prompt-Format - ersetzt durch einheitliches Chatmode/Instructions-System

**Aktuelle Version verwenden:** .github/chatmodes/MIGRATION_MAP_DE.chatmode.md

---

# Prompt/Chatmode Migration Map (alt → neu)

Diese Tabelle dokumentiert die Migration der Legacy-Dateien in das einheitliche YAML-Chatmode-Format unter `.github/prompts/chatmodes/`.

Legende:
- Aktion: migrate = in neuen Chatmode überführt; merge = Inhalte zusammengeführt; deprecate = wird ersetzt/entfallen; keep = bleibt als Dokumentation
- Status: done / pending

| Alt (Pfad) | Neuer Chatmode (ID) | Neuer Pfad | Aktion | Notizen | Status |
|---|---|---|---|---|---|
| .github/chatmodes/APIDesign_DE.chatmode.md | api-design | .github/prompts/chatmodes/api-design.yaml | migrate | Konsolidiert, YAML v0.1.0 vorhanden | done |
| .github/chatmodes/SicherheitsAudit_DE.chatmode.md | security-audit | .github/prompts/chatmodes/security-audit.yaml | migrate | MCP-Variante wird zusammengeführt | done |
| .github/chatmodes/MCPSicherheitsAudit_DE.chatmode.md | security-audit | .github/prompts/chatmodes/security-audit.yaml | merge | Zusammenführung in einen Modus (tools erweitern) | done |
| .github/chatmodes/CodeReview_DE.chatmode.md | code-review | .github/prompts/chatmodes/code-review.yaml | migrate | Standardisierter Review-Modus | done |
| .github/chatmodes/DeploymentGuide_DE.chatmode.md | deployment-operations | .github/prompts/chatmodes/deployment-operations.yaml | migrate | Vereinheitlicht mit `.github/modes/deployment-operations.mode.md` | done |
| .github/modes/deployment-operations.mode.md | deployment-operations | .github/prompts/chatmodes/deployment-operations.yaml | merge | Inhalte in Chatmode integriert | done |
| .github/chatmodes/PerformanceOptimierung_DE.chatmode.md | performance-optimization | .github/prompts/chatmodes/performance-optimization.yaml | migrate | Lighthouse/DB Hinweise einbinden | done |
| .github/chatmodes/BarrierefreiheitAudit_DE.chatmode.md | accessibility-audit | .github/prompts/chatmodes/accessibility-audit.yaml | migrate | Axe/WCAG AA Anforderungen | done |
| .github/chatmodes/MCPDesignSystemSync_DE.chatmode.md | design-system-sync | .github/prompts/chatmodes/design-system-sync.yaml | migrate | Figma/MCP integriert | pending |
| .github/chatmodes/README_DE.chatmode.md | readme-modernization | .github/prompts/chatmodes/readme-modernization.yaml | migrate | Dokumentationsprüfung/Modernisierung | done |
| .github/prompts/MCPDSGVOComplianceAudit_DE.prompt.md | dsgvo-compliance-audit | .github/prompts/chatmodes/dsgvo-compliance-audit.yaml | migrate | Bereits als YAML v0.1.0 erstellt | done |
| .github/modes/civicrm-vereinsbuchhaltung.mode.md | civicrm-vereinsbuchhaltung | .github/prompts/chatmodes/civicrm-vereinsbuchhaltung.yaml | migrate | Spezifischer Vereinsbuchhaltungsmodus | done |
| .github/modes/civicrm-n8n-automation.mode.md | civicrm-n8n-automation | .github/prompts/chatmodes/civicrm-n8n-automation.yaml | migrate | Automationsleitfaden als Modus | done |

| .github/chatmodes/Architekturplan_DE.chatmode.md | architecture-plan | .github/prompts/chatmodes/architecture-plan.yaml | migrate | Architekturplanung/ADRs standardisiert | done |
| .github/chatmodes/Beitragsrichtlinien_DE.chatmode.md | contribution-guidelines | .github/prompts/chatmodes/contribution-guidelines.yaml | migrate | Richtlinien konsolidiert mit PR-Template | done |
| .github/chatmodes/BenutzerDokumentation_DE.chatmode.md | user-documentation | .github/prompts/chatmodes/user-documentation.yaml | migrate | Benutzerdokumentation als Modus | done |
| .github/chatmodes/CIPipeline_DE.chatmode.md | ci-pipeline | .github/prompts/chatmodes/ci-pipeline.yaml | migrate | CI-Optimierung/Qualitätstore | done |
| .github/chatmodes/DatenbankSchema_DE.chatmode.md | database-schema | .github/prompts/chatmodes/database-schema.yaml | migrate | Schema/Migrationen mit DSGVO | done |
| .github/chatmodes/Dockerisierung_DE.chatmode.md | dockerization | .github/prompts/chatmodes/dockerization.yaml | migrate | Containerisierung mit sicheren Defaults | done |
| .github/chatmodes/FeatureVorschlag_DE.chatmode.md | feature-proposal | .github/prompts/chatmodes/feature-proposal.yaml | migrate | Klarer Nutzen/AKZ | done |
| .github/chatmodes/FehlerberichtVorlage_DE.chatmode.md | bug-report | .github/prompts/chatmodes/bug-report.yaml | migrate | Repro/Erwartung/Logs strukturiert | done |
| .github/chatmodes/Lokalisierungsplan_DE.chatmode.md | localization-plan | .github/prompts/chatmodes/localization-plan.yaml | migrate | I18n/ICU/QA | done |
| .github/chatmodes/Onboarding_DE.chatmode.md | onboarding | .github/prompts/chatmodes/onboarding.yaml | migrate | Technisches Onboarding | done |
| .github/chatmodes/Roadmap_DE.chatmode.md | roadmap | .github/prompts/chatmodes/roadmap.yaml | migrate | Meilensteine/Abhängigkeiten | done |
| .github/chatmodes/TestGeneration_DE.chatmode.md | test-generation | .github/prompts/chatmodes/test-generation.yaml | migrate | Tests für Fehlerpfade | done |

| .github/modes/documentation.mode.md | user-documentation | .github/prompts/chatmodes/user-documentation.yaml | merge | Im User-Dokumentationsmodus abgebildet | done |
| .github/modes/n8n-automation.mode.md | n8n-automation | .github/prompts/chatmodes/n8n-automation.yaml | migrate | Generischer Automationsmodus | done |
| .github/modes/n8n-workflows.mode.md | n8n-workflows | .github/prompts/chatmodes/n8n-workflows.yaml | migrate | Vorlagen/Patterns | done |

| .github/prompts/mitgliederversammlung.prompt.md | verein-mitgliederversammlung | .github/prompts/chatmodes/verein-mitgliederversammlung.yaml | migrate | Statuten §10 integriert | done |
| .github/prompts/mitgliederaufnahme.prompt.md | verein-mitgliederaufnahme | .github/prompts/chatmodes/verein-mitgliederaufnahme.yaml | migrate | Statuten §5 + DSGVO | done |
| .github/prompts/rechnungspruefung.prompt.md | verein-rechnungspruefung | .github/prompts/chatmodes/verein-rechnungspruefung.yaml | migrate | Statuten §13 | done |

| .github/prompts/24_READMEModernization_DE.prompt.md | readme-modernization | .github/prompts/chatmodes/readme-modernization.yaml | migrate | README-Struktur modernisiert | done |
| .github/prompts/APIDesign_DE.prompt.md | api-design | .github/prompts/chatmodes/api-design.yaml | merge | Inhalte im YAML-Modus abgedeckt | done |
| .github/prompts/Architekturplan_DE.prompt.md | architecture-plan | .github/prompts/chatmodes/architecture-plan.yaml | merge | Inhalte konsolidiert | done |
| .github/prompts/BarrierefreiheitAudit_DE.prompt.md | accessibility-audit | .github/prompts/chatmodes/accessibility-audit.yaml | merge | Inhalte konsolidiert | done |
| .github/prompts/CodeReview_DE.prompt.md | code-review | .github/prompts/chatmodes/code-review.yaml | merge | Inhalte konsolidiert | done |
| .github/prompts/SicherheitsAudit_DE.prompt.md | security-audit | .github/prompts/chatmodes/security-audit.yaml | merge | Inhalte konsolidiert | done |
| .github/prompts/MCPMultiServiceDeployment_DE.prompt.md | deployment-operations | .github/prompts/chatmodes/deployment-operations.yaml | merge | Multi-Service Deployment integriert | done |
| .github/prompts/02_DatabaseRollout_DE.prompt.md | database-schema | .github/prompts/chatmodes/database-schema.yaml | merge | Rollout als Migrationen | done |
| .github/prompts/03_MCPMultiServiceDeployment_DE.prompt.md | deployment-operations | .github/prompts/chatmodes/deployment-operations.yaml | merge | Deployment integriert | done |

| .github/prompts/MarketingContent_DE.prompt.md | marketing-content | .github/prompts/chatmodes/marketing-content.yaml | migrate | Kommunikationsinhalte konsolidiert | done |
| .github/prompts/Beitragsrichtlinien_DE.prompt.md | contribution-guidelines | .github/prompts/chatmodes/contribution-guidelines.yaml | merge | PR/Beitragsrichtlinien vereinheitlicht | done |
| .github/prompts/BenutzerDokumentation_DE.prompt.md | user-documentation | .github/prompts/chatmodes/user-documentation.yaml | merge | Benutzer:innen-Dokumentation standardisiert | done |
| .github/prompts/CIPipeline_DE.prompt.md | ci-pipeline | .github/prompts/chatmodes/ci-pipeline.yaml | merge | CI-Optimierung integriert | done |
| .github/prompts/DatenbankSchema_DE.prompt.md | database-schema | .github/prompts/chatmodes/database-schema.yaml | merge | Schema/DB Rollout integriert | done |
| .github/prompts/Dockerisierung_DE.prompt.md | dockerization | .github/prompts/chatmodes/dockerization.yaml | merge | Containerisierung vereinheitlicht | done |
| .github/prompts/FeatureVorschlag_DE.prompt.md | feature-proposal | .github/prompts/chatmodes/feature-proposal.yaml | merge | Feature-Formalisierung | done |
| .github/prompts/FehlerberichtVorlage_DE.prompt.md | bug-report | .github/prompts/chatmodes/bug-report.yaml | merge | Fehlerberichte strukturiert | done |
| .github/prompts/Lokalisierungsplan_DE.prompt.md | localization-plan | .github/prompts/chatmodes/localization-plan.yaml | merge | I18n/ICU integriert | done |
| .github/prompts/Onboarding_DE.prompt.md | onboarding | .github/prompts/chatmodes/onboarding.yaml | merge | Onboarding standardisiert | done |
| .github/prompts/Roadmap_DE.prompt.md | roadmap | .github/prompts/chatmodes/roadmap.yaml | merge | Roadmap konsolidiert | done |
| .github/prompts/TestGeneration_DE.prompt.md | test-generation | .github/prompts/chatmodes/test-generation.yaml | merge | Testabdeckung fokussiert | done |
| .github/prompts/README_DE.prompt.md | readme-modernization | .github/prompts/chatmodes/readme-modernization.yaml | merge | README Modernisierung | done |
| .github/prompts/DeploymentGuide_DE.prompt.md | deployment-operations | .github/prompts/chatmodes/deployment-operations.yaml | merge | Deployment-Guide integriert | done |
| .github/prompts/MCPDatabaseMigration_DE.prompt.md | database-schema | .github/prompts/chatmodes/database-schema.yaml | merge | MCP-spezifische Migrationen integriert | done |
| .github/prompts/MCPFeatureImplementation_DE.prompt.md | feature-proposal | .github/prompts/chatmodes/feature-proposal.yaml | merge | Feature-Implementierung als Proposal+Tests abgebildet | done |
| .github/prompts/MCPSecurityIncident_DE.prompt.md | security-audit | .github/prompts/chatmodes/security-audit.yaml | merge | Security Incident in Security Audit integriert | done |

| .github/prompts/CiviCRM_Vereinsbuchhaltung_DE.prompt.md | civicrm-vereinsbuchhaltung | .github/prompts/chatmodes/civicrm-vereinsbuchhaltung.yaml | merge | Spezifischer Modus | done |
| .github/prompts/CiviCRM_n8n_Automation_DE.prompt.md | civicrm-n8n-automation | .github/prompts/chatmodes/civicrm-n8n-automation.yaml | merge | Spezifischer Modus | done |

| .github/prompts/05_n8nDeploymentNotifications_DE.prompt.md | n8n-automation | .github/prompts/chatmodes/n8n-automation.yaml | merge | Alarmierung/Benachrichtigung | done |
| .github/prompts/06_n8nDatabaseAutomation_DE.prompt.md | n8n-automation | .github/prompts/chatmodes/n8n-automation.yaml | merge | DB-Automation | done |
| .github/prompts/07_n8nMonitoringAlerts_DE.prompt.md | n8n-automation | .github/prompts/chatmodes/n8n-automation.yaml | merge | Monitoring/Alerts | done |
| .github/prompts/08_n8nDSGVOCompliance_DE.prompt.md | dsgvo-compliance-audit | .github/prompts/chatmodes/dsgvo-compliance-audit.yaml | merge | DSGVO-Check | done |

| .github/copilot-instructions.md | global/01_style_guide.md | .github/prompts/global/01_style_guide.md | merge | Stilregeln integriert/vereinheitlicht | done |

Hinweis: Legacy-Dateien bleiben vorerst bestehen (read-only) bis vollständige Kommunikation im Team erfolgt; neue Chatmodes sind führend. Weitere MCP*-Varianten werden schrittweise in bestehende IDs konsolidiert.

Hinweis: Duplikate (z. B. MCP*-Varianten) werden in einen Modus konsolidiert; die `tools`-Sektion enthält dann die benötigten Integrationen (z. B. figma, github, filesystem, codacy).

# Prompts Migration Guide

Generated: 2025-10-08 19:23 UTC  
Status: DEPRECATED → Migration zu Chatmodes/Instructions

## Zusammenfassung

- Gesamt-Mappings: 137
- Migriert: 131
- Offen (TBD): 6

## Mapping-Tabelle

| Legacy | Ziel | Status |
|-------|------|--------|
| `prompts/01_EmailDNSSetup_DE.prompt.md` | `.github/chatmodes/01_EmailDNSSetup_DE.chatmode.md` | ✅ |
| `prompts/02_DatabaseRollout_DE.prompt.md` | `.github/chatmodes/02_DatabaseRollout_DE.chatmode.md` | ✅ |
| `prompts/03_MCPMultiServiceDeployment_DE.prompt.md` | `.github/chatmodes/03_MCPMultiServiceDeployment_DE.chatmode.md` | ✅ |
| `prompts/04_n8nEmailAutomation_DE.prompt.md` | `.github/instructions/04-n8nemailautomation.instructions.md` | ✅ |
| `prompts/05_n8nDeploymentNotifications_DE.prompt.md` | `.github/instructions/05-n8ndeploymentnotifications.instructions.md` | ✅ |
| `prompts/06_n8nDatabaseAutomation_DE.prompt.md` | `.github/instructions/06-n8ndatabaseautomation.instructions.md` | ✅ |
| `prompts/07_n8nMonitoringAlerts_DE.prompt.md` | `.github/instructions/07-n8nmonitoringalerts.instructions.md` | ✅ |
| `prompts/08_n8nDSGVOCompliance_DE.prompt.md` | `.github/instructions/08-n8ndsgvocompliance.instructions.md` | ✅ |
| `prompts/24_READMEModernization_DE.prompt.md` | `.github/chatmodes/24_READMEModernization_DE.chatmode.md` | ✅ |
| `prompts/APIDesign_DE.prompt.md` | `.github/chatmodes/APIDesign_DE.chatmode.md` | ✅ |
| `prompts/Architekturplan_DE.prompt.md` | `.github/chatmodes/Architekturplan_DE.chatmode.md` | ✅ |
| `prompts/BarrierefreiheitAudit_DE.prompt.md` | `.github/chatmodes/BarrierefreiheitAudit_DE.chatmode.md` | ✅ |
| `prompts/Beitragsrichtlinien_DE.prompt.md` | `.github/chatmodes/Beitragsrichtlinien_DE.chatmode.md` | ✅ |
| `prompts/BenutzerDokumentation_DE.prompt.md` | `.github/chatmodes/BenutzerDokumentation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/accessibility-audit.yaml` | `.github/chatmodes/Accessibility_Audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/accessibility-audit.yaml.json` | `.github/prompts/chatmodes/accessibility-audit.yaml` | ✅ |
| `prompts/chatmodes/accessibility-audit_examples.md` | `.github/chatmodes/accessibility-audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/api-design.yaml` | `.github/chatmodes/Api_Design_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/api-design.yaml.json` | `.github/prompts/chatmodes/api-design.yaml` | ✅ |
| `prompts/chatmodes/api-design_examples.md` | `.github/chatmodes/api-design_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/architecture-plan.yaml` | `.github/chatmodes/Architecture_Plan_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/architecture-plan.yaml.json` | `.github/prompts/chatmodes/architecture-plan.yaml` | ✅ |
| `prompts/chatmodes/architecture-plan_examples.md` | `.github/chatmodes/architecture-plan_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/bug-report.yaml` | `.github/chatmodes/Bug_Report_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/bug-report.yaml.json` | `.github/prompts/chatmodes/bug-report.yaml` | ✅ |
| `prompts/chatmodes/bug-report_examples.md` | `.github/chatmodes/bug-report_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/ci-pipeline.yaml` | `.github/chatmodes/Ci_Pipeline_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/ci-pipeline.yaml.json` | `.github/prompts/chatmodes/ci-pipeline.yaml` | ✅ |
| `prompts/chatmodes/ci-pipeline_examples.md` | `.github/chatmodes/ci-pipeline_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/civicrm-n8n-automation.yaml` | `.github/chatmodes/Civicrm_N8N_Automation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/civicrm-n8n-automation.yaml.json` | `.github/prompts/chatmodes/civicrm-n8n-automation.yaml` | ✅ |
| `prompts/chatmodes/civicrm-n8n-automation_examples.md` | `.github/chatmodes/civicrm-n8n-automation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/civicrm-vereinsbuchhaltung.yaml` | `.github/chatmodes/Civicrm_Vereinsbuchhaltung_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/civicrm-vereinsbuchhaltung.yaml.json` | `.github/prompts/chatmodes/civicrm-vereinsbuchhaltung.yaml` | ✅ |
| `prompts/chatmodes/civicrm-vereinsbuchhaltung_examples.md` | `.github/chatmodes/civicrm-vereinsbuchhaltung_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/code-review.yaml` | `.github/chatmodes/Code_Review_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/code-review.yaml.json` | `.github/prompts/chatmodes/code-review.yaml` | ✅ |
| `prompts/chatmodes/code-review_examples.md` | `.github/chatmodes/code-review_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/contribution-guidelines.yaml` | `.github/chatmodes/Contribution_Guidelines_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/contribution-guidelines.yaml.json` | `.github/prompts/chatmodes/contribution-guidelines.yaml` | ✅ |
| `prompts/chatmodes/contribution-guidelines_examples.md` | `.github/chatmodes/contribution-guidelines_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/database-schema.yaml` | `.github/chatmodes/Database_Schema_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/database-schema.yaml.json` | `.github/prompts/chatmodes/database-schema.yaml` | ✅ |
| `prompts/chatmodes/database-schema_examples.md` | `.github/chatmodes/database-schema_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/deployment-operations.yaml` | `.github/chatmodes/Deployment_Operations_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/deployment-operations.yaml.json` | `.github/prompts/chatmodes/deployment-operations.yaml` | ✅ |
| `prompts/chatmodes/deployment-operations_examples.md` | `.github/chatmodes/deployment-operations_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/dockerization.yaml` | `.github/chatmodes/Dockerization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/dockerization.yaml.json` | `.github/prompts/chatmodes/dockerization.yaml` | ✅ |
| `prompts/chatmodes/dockerization_examples.md` | `.github/chatmodes/dockerization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/dsgvo-compliance-audit.yaml` | `.github/chatmodes/Dsgvo_Compliance_Audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/dsgvo-compliance-audit.yaml.json` | `.github/prompts/chatmodes/dsgvo-compliance-audit.yaml` | ✅ |
| `prompts/chatmodes/dsgvo-compliance-audit_examples.md` | `.github/chatmodes/dsgvo-compliance-audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/feature-proposal.yaml` | `.github/chatmodes/Feature_Proposal_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/feature-proposal.yaml.json` | `.github/prompts/chatmodes/feature-proposal.yaml` | ✅ |
| `prompts/chatmodes/feature-proposal_examples.md` | `.github/chatmodes/feature-proposal_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/localization-plan.yaml` | `.github/chatmodes/Localization_Plan_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/localization-plan.yaml.json` | `.github/prompts/chatmodes/localization-plan.yaml` | ✅ |
| `prompts/chatmodes/localization-plan_examples.md` | `.github/chatmodes/localization-plan_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/marketing-content.yaml` | `.github/chatmodes/Marketing_Content_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/marketing-content.yaml.json` | `.github/prompts/chatmodes/marketing-content.yaml` | ✅ |
| `prompts/chatmodes/marketing-content_examples.md` | `.github/chatmodes/marketing-content_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/n8n-automation.yaml` | `.github/chatmodes/N8N_Automation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/n8n-automation.yaml.json` | `.github/prompts/chatmodes/n8n-automation.yaml` | ✅ |
| `prompts/chatmodes/n8n-automation_examples.md` | `.github/chatmodes/n8n-automation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/n8n-workflows.yaml` | `.github/chatmodes/N8N_Workflows_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/n8n-workflows.yaml.json` | `.github/prompts/chatmodes/n8n-workflows.yaml` | ✅ |
| `prompts/chatmodes/n8n-workflows_examples.md` | `.github/chatmodes/n8n-workflows_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/onboarding.yaml` | `.github/chatmodes/Onboarding_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/onboarding.yaml.json` | `.github/prompts/chatmodes/onboarding.yaml` | ✅ |
| `prompts/chatmodes/onboarding_examples.md` | `.github/chatmodes/onboarding_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/performance-optimization.yaml` | `.github/chatmodes/Performance_Optimization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/performance-optimization.yaml.json` | `.github/prompts/chatmodes/performance-optimization.yaml` | ✅ |
| `prompts/chatmodes/performance-optimization_examples.md` | `.github/chatmodes/performance-optimization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/quality-gates-audit.yaml` | `.github/chatmodes/Quality_Gates_Audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/quality-gates-audit.yaml.json` | `.github/prompts/chatmodes/quality-gates-audit.yaml` | ✅ |
| `prompts/chatmodes/quality-gates-audit_examples.md` | `.github/chatmodes/quality-gates-audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/readme-modernization.yaml` | `.github/chatmodes/Readme_Modernization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/readme-modernization.yaml.json` | `.github/prompts/chatmodes/readme-modernization.yaml` | ✅ |
| `prompts/chatmodes/readme-modernization_examples.md` | `.github/chatmodes/readme-modernization_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/repository-prompt-architect.yaml` | `.github/chatmodes/Repository_Prompt_Architect_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/repository-prompt-architect.yaml.json` | `.github/prompts/chatmodes/repository-prompt-architect.yaml` | ✅ |
| `prompts/chatmodes/repository-prompt-architect_examples.md` | `.github/chatmodes/repository-prompt-architect_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/roadmap.yaml` | `.github/chatmodes/Roadmap_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/roadmap.yaml.json` | `.github/prompts/chatmodes/roadmap.yaml` | ✅ |
| `prompts/chatmodes/roadmap_examples.md` | `.github/chatmodes/roadmap_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/security-audit.yaml` | `.github/chatmodes/Security_Audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/security-audit.yaml.json` | `.github/prompts/chatmodes/security-audit.yaml` | ✅ |
| `prompts/chatmodes/security-audit_examples.md` | `.github/chatmodes/security-audit_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/test-generation.yaml` | `.github/chatmodes/Test_Generation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/test-generation.yaml.json` | `.github/prompts/chatmodes/test-generation.yaml` | ✅ |
| `prompts/chatmodes/test-generation_examples.md` | `.github/chatmodes/test-generation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/user-documentation.yaml` | `.github/chatmodes/User_Documentation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/user-documentation.yaml.json` | `.github/prompts/chatmodes/user-documentation.yaml` | ✅ |
| `prompts/chatmodes/user-documentation_examples.md` | `.github/chatmodes/user-documentation_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-mitgliederaufnahme.yaml` | `.github/chatmodes/Verein_Mitgliederaufnahme_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-mitgliederaufnahme.yaml.json` | `.github/prompts/chatmodes/verein-mitgliederaufnahme.yaml` | ✅ |
| `prompts/chatmodes/verein-mitgliederaufnahme_examples.md` | `.github/chatmodes/verein-mitgliederaufnahme_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-mitgliederversammlung.yaml` | `.github/chatmodes/Verein_Mitgliederversammlung_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-mitgliederversammlung.yaml.json` | `.github/prompts/chatmodes/verein-mitgliederversammlung.yaml` | ✅ |
| `prompts/chatmodes/verein-mitgliederversammlung_examples.md` | `.github/chatmodes/verein-mitgliederversammlung_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-rechnungspruefung.yaml` | `.github/chatmodes/Verein_Rechnungspruefung_DE.chatmode.md` | ✅ |
| `prompts/chatmodes/verein-rechnungspruefung.yaml.json` | `.github/prompts/chatmodes/verein-rechnungspruefung.yaml` | ✅ |
| `prompts/chatmodes/verein-rechnungspruefung_examples.md` | `.github/chatmodes/verein-rechnungspruefung_DE.chatmode.md` | ✅ |
| `prompts/CIPipeline_DE.prompt.md` | `.github/chatmodes/CIPipeline_DE.chatmode.md` | ✅ |
| `prompts/CiviCRM_n8n_Automation_DE.prompt.md` | `.github/instructions/civicrm-n8n-automation.instructions.md` | ✅ |
| `prompts/CiviCRM_Vereinsbuchhaltung_DE.prompt.md` | `.github/instructions/civicrm-vereinsbuchhaltung.instructions.md` | ✅ |
| `prompts/CodeReview_DE.prompt.md` | `.github/chatmodes/CodeReview_DE.chatmode.md` | ✅ |
| `prompts/DatenbankSchema_DE.prompt.md` | `.github/chatmodes/DatenbankSchema_DE.chatmode.md` | ✅ |
| `prompts/DeploymentGuide_DE.prompt.md` | `.github/chatmodes/DeploymentGuide_DE.chatmode.md` | ✅ |
| `prompts/Dockerisierung_DE.prompt.md` | `.github/chatmodes/Dockerisierung_DE.chatmode.md` | ✅ |
| `prompts/FeatureVorschlag_DE.prompt.md` | `.github/chatmodes/FeatureVorschlag_DE.chatmode.md` | ✅ |
| `prompts/FehlerberichtVorlage_DE.prompt.md` | `.github/chatmodes/FehlerberichtVorlage_DE.chatmode.md` | ✅ |
| `prompts/global/00_glossary.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/global/01_style_guide.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/global/02_guardrails.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/Lokalisierungsplan_DE.prompt.md` | `.github/chatmodes/Lokalisierungsplan_DE.chatmode.md` | ✅ |
| `prompts/MarketingContent_DE.prompt.md` | `.github/chatmodes/MarketingContent_DE.chatmode.md` | ✅ |
| `prompts/MCPDatabaseMigration_DE.prompt.md` | `.github/chatmodes/MCPDatabaseMigration_DE.chatmode.md` | ✅ |
| `prompts/MCPDSGVOComplianceAudit_DE.prompt.md` | `.github/chatmodes/MCPDSGVOComplianceAudit_DE.chatmode.md` | ✅ |
| `prompts/MCPFeatureImplementation_DE.prompt.md` | `.github/chatmodes/MCPFeatureImplementation_DE.chatmode.md` | ✅ |
| `prompts/MCPMultiServiceDeployment_DE.prompt.md` | `.github/chatmodes/MCPMultiServiceDeployment_DE.chatmode.md` | ✅ |
| `prompts/MCPSecurityIncident_DE.prompt.md` | `.github/chatmodes/MCPSecurityIncident_DE.chatmode.md` | ✅ |
| `prompts/MIGRATION_MAP.md` | `.github/chatmodes/MIGRATION_MAP_DE.chatmode.md` | ✅ |
| `prompts/mitgliederaufnahme.prompt.md` | `.github/chatmodes/mitgliederaufnahme.prompt_DE.chatmode.md` | ✅ |
| `prompts/mitgliederversammlung.prompt.md` | `.github/chatmodes/mitgliederversammlung.prompt_DE.chatmode.md` | ✅ |
| `prompts/n8n/06-quality-reporting.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/n8n/07-monitoring.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/n8n/08-backup-automation.md` | `TBD - Siehe Migration Guide` | TBD |
| `prompts/Onboarding_DE.prompt.md` | `.github/chatmodes/Onboarding_DE.chatmode.md` | ✅ |
| `prompts/PerformanceOptimierung_DE.prompt.md` | `.github/chatmodes/PerformanceOptimierung_DE.chatmode.md` | ✅ |
| `prompts/README.md` | `.github/chatmodes/README_DE.chatmode.md` | ✅ |
| `prompts/README_DE.prompt.md` | `.github/chatmodes/README_DE.chatmode.md` | ✅ |
| `prompts/rechnungspruefung.prompt.md` | `.github/chatmodes/rechnungspruefung.prompt_DE.chatmode.md` | ✅ |
| `prompts/Roadmap_DE.prompt.md` | `.github/chatmodes/Roadmap_DE.chatmode.md` | ✅ |
| `prompts/SicherheitsAudit_DE.prompt.md` | `.github/chatmodes/SicherheitsAudit_DE.chatmode.md` | ✅ |
| `prompts/TestGeneration_DE.prompt.md` | `.github/chatmodes/TestGeneration_DE.chatmode.md` | ✅ |

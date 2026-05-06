---
title: Guardrails Core
description: Zentrale Guardrails fuer Prompt-, Agenten- und Workflow-Artefakte
status: ACTIVE
version: 1.0.0
created: 2026-03-31
lastUpdated: 2026-03-31
owners:
  - AI Governance
  - Security
tags:
  - guardrails
  - security
  - compliance
category: governance
priority: high
---

# Guardrails Core

- Keine Secrets, Tokens oder PII in Prompts, Beispielen, Tests oder Logs
- DSGVO- und Security-Vorgaben aus `dsgvo-compliance.instructions.md` sind bindend
- Keine toten Pfade, alten Repo-Namen oder historischen Deployziele als aktiv dokumentieren
- Keine zweite Governance neben `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` und `.github/ai-registry.json` aufbauen
- Legacy-Artefakte duerfen nur referenziert werden, wenn ihr Status explizit als `legacy` oder `deprecated` markiert ist

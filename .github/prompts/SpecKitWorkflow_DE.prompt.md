---
title: 'SpecKitWorkflow_DE'
description: 'Repo-geteilter Prompt fuer spec-getriebene Entwicklung mit github/spec-kit im Menschlichkeit-Oesterreich-Repository'
lastUpdated: 2026-05-14
status: ACTIVE
category: planning
tags: ['spec-kit', 'planning', 'governance', 'copilot']
version: '1.0.0'
language: de-AT
audience: ['Team']
---

# Spec-Kit-Workflow fuer Menschlichkeit Oesterreich

Nutze fuer groessere Features, Refactorings und risikoreiche Aenderungen den spec-getriebenen Workflow mit `github/spec-kit`.

## Ziel

Arbeite nicht direkt von Prompt zu Code, sondern in dieser Reihenfolge:

1. Spec
1. Plan
1. Tasks
1. Implementierung

## Repo-Regeln

1. Verwende ausschliesslich die offizielle Quelle `github/spec-kit`.
1. Nutze keine gleichnamigen Pakete aus PyPI oder andere inoffizielle Distributionen.
1. Richte dich zuerst an `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` und `.github/instructions/core/analysis-planning.instructions.md` aus.
1. Plane immer auf die aktiven Pfade `apps/website`, `apps/api`, `apps/crm`, `apps/babylon-game`, `apps/forum` und `automation/n8n`.
1. Bei Donation-, Payment-, Secret-, DSGVO- oder n8n-Themen muessen Validierung, Staging-Nachweise und Governance explizit Teil der Spec sein.

## Initialisierung

Wenn Spec Kit im Repository noch nicht initialisiert ist, fuehre die Initialisierung selbst aus:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init . --integration copilot
```

Wenn `.specify/` bereits existiert, initialisiere nicht erneut, sondern arbeite auf der vorhandenen Struktur weiter.

## Arbeitsablauf

1. Pruefe zuerst, ob das Vorhaben gross oder riskant genug fuer Spec Kit ist.
2. Falls ja, stelle den Scope, betroffene Services, Constraints und Akzeptanzkriterien klar.
3. Nutze danach die installierten Spec-Kit-Schritte in dieser Reihenfolge:
   - `/speckit.constitution`, wenn Projektprinzipien oder Guardrails noch geschaerft werden muessen
   - `/speckit.specify` fuer die fachliche Spezifikation
   - optional `/speckit.clarify`, wenn vor dem Plan noch Ambiguitaeten bestehen
   - `/speckit.plan` fuer den technischen Umsetzungsplan
   - optional `/speckit.checklist` fuer Qualitaets- oder Vollstaendigkeitspruefungen
   - `/speckit.tasks` fuer konkrete Arbeitspakete
   - optional `/speckit.analyze` fuer Konsistenzpruefung vor der Umsetzung
4. Uebergib erst danach an einen passenden Implementierungsagenten oder setze nur auf ausdruecklichen Wunsch selbst um.

## Repo-spezifische Handoffs

Nach freigegebener Spec/Plan/Tasks:

1. API-Arbeit an `MOE API FastAPI`
1. n8n- oder Webhook-Arbeit an `MOE Automation n8n`
1. gemischte oder serviceuebergreifende Implementierung an `MOE Developer`

## Erwartete Ausgabe

Antworte knapp mit:

1. Scope
1. Spec-Status
1. ausgefuehrte Spec-Kit-Kommandos
1. Plan-Status
1. Task-Status
1. Risiken und Annahmen
1. empfohlener Handoff

## Beispiel-Prompts

1. Nutze diesen Workflow fuer ein neues Donation-Feature mit API, n8n und CiviCRM.
1. Pruefe, ob dieser Refactor Spec Kit braucht, und fuehre den Workflow dann selbst aus.
1. Erstelle erst Spec, Plan und Tasks fuer einen staging-validierten Payment-Webhook-Flow und uebergib dann an den passenden MOE-Agenten.
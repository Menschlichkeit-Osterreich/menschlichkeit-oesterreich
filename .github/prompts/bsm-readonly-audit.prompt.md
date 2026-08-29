---
title: bsm-readonly-audit.prompt.md
description: 'Read-only Audit von BSM-UUID-Mappings mit strikt metadatenbasierter Ausgabe'
lastUpdated: 2026-05-10
status: ACTIVE
category: security
tags: ['bsm', 'secrets', 'drift', 'read-only']
version: 1.0.0
language: de-AT
audience: ['Security Team', 'DevOps']
---

Fuehre einen konservativen read-only Audit fuer BSM-UUID-Mappings aus.

## Ziel

- Verifiziere, ob die referenzierten UUIDs in BSM technisch aufloesbar sind.
- Weise Drift ohne Secret-Leak nach.

## Pflichtschritte

1. Lies zuerst den technischen Injektionspfad im Repo:
   - `.github/bsm-secret-ids.json`
   - `.github/actions/bsm-env-inject/action.yml`
2. Fuehre fuer jede Ziel-UUID read-only Abruf aus.
3. Gib nur folgende Felder aus:
   - `id`
   - `key`
   - `projectId`
   - `revisionDate`
4. Markiere jede UUID mit genau einem Status:
   - `Gesichert`
   - `Widerspruechlich`
   - `Nicht nachgewiesen`

## Format fuer Befund

- 1. Secret Key UUID
- 2. Webhook UUID
- 3. Technische Mapping-Bedeutung
- 4. Handlungsbedarf
- 5. Nicht geaenderte Dateien
- 6. Genau ein naechster Schritt

## Guardrails

- Keine Secret-Werte, keine Teilwerte, keine Maskierungsausnahmen.
- Keine schreibenden BSM-Operationen.
- Keine Datei-Aenderungen im read-only Audit selbst.

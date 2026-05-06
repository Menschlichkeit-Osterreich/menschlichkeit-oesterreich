---
title: Archive Retention Policy
description: Retention and cleanup rules for archived documentation artifacts
lastUpdated: 2026-04-16
status: active
version: 1.0.0
---

# Archive Retention Policy

## Scope

This policy applies to files in docs/archive/ and docs/archive/bulk/.

## Retention Classes

- Class A (keep): historical architecture decisions, audit evidence, legal/compliance records, incident postmortems.
- Class B (review): migration notes, setup logs, temporary implementation plans older than 12 months.
- Class C (purge): lint rule dumps, generated placeholders, obsolete text fragments, duplicate templates.

## Cleanup Rules

- Monthly: remove new Class C files from docs/archive/bulk/.
- Quarterly: review Class B files and either promote to Class A or purge.
- Never purge Class A without explicit maintainer approval.

## Practical Filters for Class C

- markdownlint rule files like md001.md, md002.md, etc.
- generated or placeholder files like empty_file.txt, file1.txt, keep-me.txt.
- low-signal text dumps and lint rule fragments.

## Validation

After archive cleanup, run:

```bash
npm run governance:check
npm run docs:governance
```

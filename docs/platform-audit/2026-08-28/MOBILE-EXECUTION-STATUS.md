# MOBILE-EXECUTION-STATUS

Letzte Aktualisierung: 2026-08-28 ~11:00 UTC · Session: Claude Code (Cloud)

## Branches & PRs

| Was | Wert |
| --- | ---- |
| Audit-Branch | `claude/moe-platform-audit-consolidation-4r9obb` → **PR #537** (offen) |
| Payment-Branch | `fix/stripe-webhook-inbox-outbox` → **PR #538** (offen) |
| Basis `main` | `d1d4454` (unverändert seit 2026-05-19) |

## Completed

- **P0-002 behoben** (PR #537): Deploy-Blocker `cache-dependency-path` +
  CI-Regressionsschutz.
- **P0-003 behoben** (PR #537): Drupal-Secrets fail-closed, Festwert entfernt.
- **Payment-Hardening** (PR #538): durable Stripe-Inbox
  (received→processing→processed/failed), atomare Dedup via ON CONFLICT,
  DB-Doppelbuchungssperre (Migration 006), Transaktionsgrenzen ohne externe
  Calls, Outbox-Events, Slack ohne PII, purpose/source getrennt.
  **192 API-Tests grün** (20 neue).
- **FastAPI→Make-Vertrag v1**: `docs/integration/fastapi-make-event-contract.md`.
- **n8n→Make-Matrix**: alle 27 Workflows entschieden
  (15 MIGRATE_TO_MAKE · 7 RETIRE · 3 MOVE_TO_FASTAPI · 2 UNKNOWN/Forum) —
  [11-n8n-make-migration-matrix.md](11-n8n-make-migration-matrix.md).
- **System-of-Record-Matrix** (Ziel-Vertrag) —
  [15-system-of-record-matrix.md](15-system-of-record-matrix.md).
- Live-Register: Domains/DNS, Deployment-Contract, Evidence Ledger
  (Dateien 00–02, 13, 16–18, 99).

## In Progress

- Read-only `platform-live-audit`-Workflow (GitHub Actions + Bitwarden,
  versionierte Skripte, Secret-Redaction) — eigener Branch/PR folgt.

## Blocked / Requires Human Approval

- **P0-001 · DEPLOYMENT ENTSPERREN — wichtigster manueller Schritt.**
  GitHub *Settings → Environments → production*: Protection-Rule prüfen
  (Deploy-Job verfällt seit Mai nach 30 Tagen Warten, 0 Steps ausgeführt).
  Ohne diesen Schritt liefert kein Merge irgendetwas aus.
- Merge-Freigaben für PR #537 und PR #538 (kein Auto-Merge durch Claude).
- Fachliche Entscheidungen: Recurring-Angebot (§41 A/B — UI verspricht
  monatlich/vierteljährlich/jährlich, kein Einzugsmechanismus existiert),
  `receipt_eligible`-Regel, Zukunft Forum + Games.

## Requires Live Access

- Plesk-/SSH-Read-only-Audit, DB-Metadaten, Backup-/Restore-Nachweis,
  TLS-Details → wird über den `platform-live-audit`-Workflow + Bitwarden
  bereitgestellt; bis dahin `REQUIRES_LIVE_ACCESS`
  ([99-open-verification-gaps.md](99-open-verification-gaps.md)).
- Make-Szenarien anlegen: Make-MCP-Zugang vorhanden; Umsetzung startet nach
  Merge von PR #538 (Welle 1 der Migrationsmatrix).

## Critical Findings (offen)

1. Produktionspipeline seit 2026-05-14 ohne einzige Auslieferung (P0-001).
1. Live existiert nur die Website; `api.`/`erp.` = NXDOMAIN, `crm.` =
   Platzhalter, `forum.`/`n8n.` = Plesk-Default (EV-0003…0008).
1. Frontend bündelt `VITE_API_URL` auf nicht existierenden Host (P2-003).
1. Backup-/Restore-Zustand vollständig unbekannt.

## Next Automatic Step

`platform-live-audit`-Workflow (read-only, Bitwarden-Secrets zur Laufzeit,
sanitisierte JSON-Artefakte) auf eigenem Branch implementieren und als PR
öffnen; danach PR-Wachen fortführen (Check-ins aktiv für #537/#538).

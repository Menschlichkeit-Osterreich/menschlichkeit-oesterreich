# Platform-Audit 2026-08-28

Forensischer Gesamtaudit von Repository, Deploymentvertrag und Live-Runtime der
Plattform Menschlichkeit Österreich.

**Basis:** Commit `d1d4454b57cbd3cd23f0c3b6b7a4576e1eb33ed2` (main)
**Live-Ziel:** `5.183.217.146` (nginx / Plesk)

## Kernaussage in einem Satz

Die Produktionspipeline liefert seit dem 2026-05-14 nichts mehr aus, und von
der im Repository beschriebenen Plattform ist live genau eine Anwendung in
Betrieb — die Website.

## Dokumente

| Datei | Inhalt |
| ----- | ------ |
| [00-executive-summary.md](00-executive-summary.md) | Kernbefunde, Soll-Ist-Abgleich, umgesetzte Maßnahmen |
| [01-evidence-ledger.md](01-evidence-ledger.md) | Jeder Befund mit Quelle, Prüfmethode und Status |
| [02-domain-subdomain-register.md](02-domain-subdomain-register.md) | Was hinter jeder Domain tatsächlich läuft |
| [13-deployment-contract-matrix.md](13-deployment-contract-matrix.md) | Deploymentvertrag gegen tatsächliche Laufhistorie |
| [16-findings.md](16-findings.md) | Findings P0–P3 mit Evidenz, Auswirkung und Lösung |
| [17-remediation-plan.md](17-remediation-plan.md) | Priorisierter Konsolidierungsplan |
| [18-implementation-log.md](18-implementation-log.md) | Umgesetzte Änderungen mit Testnachweisen |
| [99-open-verification-gaps.md](99-open-verification-gaps.md) | Was offen bleibt und welcher Zugang dafür nötig ist |

## Statuskonvention

`VERIFIED_REPO` · `VERIFIED_LIVE` · `VERIFIED_DEPLOYED` · `VERIFIED_CONFIG` ·
`INFERRED` · `UNKNOWN` · `CONFLICT` · `LEGACY_CANDIDATE` ·
`DEPRECATED_CONFIRMED`

Grundregel dieses Audits: **`VERIFIED_REPO != VERIFIED_LIVE`.** Keine Vermutung
wird als Tatsache geführt; nicht belegbare Register bleiben offen statt
spekulativ gefüllt zu werden.

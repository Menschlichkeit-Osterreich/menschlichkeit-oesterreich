---
name: quality-gate
description: 'Liest und interpretiert SARIF/JSON Quality Reports aus quality-reports/ und gibt eine Deploy-Empfehlung'
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Quality Gate — Report-Auswertung

## Zweck

Liest die neuesten Quality-Reports (SARIF, JSON) aus `menschlichkeit-oesterreich-development/quality-reports/` und entscheidet ob ein Deployment freigegeben wird.

## Report-Quellen

| Report-Typ               | Format | Erzeugt durch                    |
| ------------------------ | ------ | -------------------------------- |
| ESLint                   | SARIF  | `npm run lint:sarif`             |
| Bandit (Python Security) | JSON   | `bandit -r apps/api -f json`     |
| pytest Coverage          | JSON   | `pytest --cov --cov-report=json` |
| TypeScript               | JSON   | `tsc --noEmit 2>&1`              |
| Lighthouse               | JSON   | `lighthouse --output json`       |

## Schwellwerte

| Metrik                   | Gruen (Go) | Gelb (Warnung) | Rot (Block)    |
| ------------------------ | ---------- | -------------- | -------------- |
| ESLint Errors            | 0          | 1-5            | >5             |
| ESLint Warnings          | <20        | 20-50          | >50            |
| Bandit High/Medium       | 0          | 1-2 Low        | >0 High/Medium |
| Test Coverage            | >80%       | 60-80%         | <60%           |
| TypeScript Errors        | 0          | 1-3            | >3             |
| Lighthouse Performance   | >90        | 70-90          | <70            |
| Lighthouse Accessibility | >95        | 85-95          | <85            |

## Ablauf

1. Neueste Reports aus `quality-reports/` lesen (nach Datum sortiert)
2. Jeden Report gegen Schwellwerte pruefen
3. Gesamtergebnis berechnen (schwaechtses Glied bestimmt)
4. Deploy-Empfehlung ausgeben

## Output-Format

```
═══════════════════════════════════════
  Quality Gate — [Datum]
═══════════════════════════════════════
  ESLint        ✅ 0 Errors, 12 Warnings
  Bandit        ✅ 0 Issues
  Coverage      ⚠️ 72% (Ziel: >80%)
  TypeScript    ✅ 0 Errors
  Lighthouse P  ✅ 94/100
  Lighthouse A  ✅ 98/100
───────────────────────────────────────
  Gesamt: GELB — Deploy moeglich mit Vorbehalt
  Hinweis: Test-Coverage unter Zielwert
═══════════════════════════════════════
```

## Integration

- Wird von `deploy-verify` aufgerufen (Pre-Flight)
- Kann standalone als `/moe-ops:quality-gate` aufgerufen werden
- Nutzt `quality-reporter` MCP-Server falls verfuegbar

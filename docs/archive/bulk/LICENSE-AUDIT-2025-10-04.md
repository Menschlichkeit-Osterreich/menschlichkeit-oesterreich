# License Audit – 04.10.2025

**Scope:** Menschlichkeit Österreich Monorepo (npm, Composer, Python)

**Inputs:**

- CycloneDX SBOM Manifest (`security/sbom/manifest.json`, generated 2025-10-03T22:15:00Z)
- Individual SBOM exports (`root-project.json`, `api-python.json`, `crm-php.json`, `frontend.json`)
- jq sampling runs (2025-10-04) for license aggregation

---

## 1. Executive Summary

| Subsystem               | Dominante Lizenzen                           | Unknown / Custom | Risk Level | Notes                                                                      |
| ----------------------- | -------------------------------------------- | ---------------- | ---------- | -------------------------------------------------------------------------- |
| **Monorepo Root (npm)** | MIT (1 320), ISC (119), Apache-2.0 (100)     | 5 Komponenten    | � Mittel   | `SEE LICENSE IN LICENSE.md` (62) + 5 Rest-Unbekannte → juristische Prüfung |
| **API (Python)**        | MIT (24), 0BSD (8), BSD-3-Clause (7)         | 2 Komponenten    | � Niedrig  | Zwei Pakete ohne License-Metadaten, manuelle Ergänzung nötig               |
| **CRM (PHP)**           | MIT (69), BSD-3-Clause (7), BSD-2-Clause (5) | 1 Komponente     | 🟡 Niedrig | Einzelnes Composer-Paket ohne Lizenzangabe, ansonsten sauber               |
| **Frontend Workspace**  | Keine Drittanbieter-Komponenten              | 0                | 🟢 Niedrig | Workspace-spezifische SBOM bestätigt Null-Bestand                          |

**Key Findings**

1. **Automatisierte Kuratierung** – Das neue Skript `scripts/enrich-sbom-licenses.mjs` löste 1 005 vormals UNKNOWN-Lizenzen auf und erstellt signierte Artefakte (`*.enriched.json`, `license-curation.json`). Verbleibende 26 Einträge betreffen nicht mehr verfügbare Registry-Pakete (z. B. `smartmenus-jquery-plugin`) oder fehlende Lizenzfelder.
2. **Rest-Risiken** – 62 Komponenten führen `SEE LICENSE IN LICENSE.md`; die zugehörigen Lizenztexte müssen in der Drupal-Vendor-Struktur abgelegt und juristisch freigegeben werden. `SparkMD5 3.0.0` verbleibt als `CUSTOM` und erfordert Legal-Review.
3. **Python SBOM** – Nur noch zwei PIP-Pakete ohne License-Classifier. Ergänzung via `pip-licenses` bzw. `pyproject`-Classifier ist notwendig, um UNKNOWN vollständig zu eliminieren.
4. **Third-Party Notices** – Vollständige Tabelle in `docs/security/THIRD-PARTY-NOTICES.md` generiert; bildet Grundlage für Phase‑1-Governance (Build-Gate `UNKNOWN == 0`).

---

## 2. Third-Party Notices (Draft)

### 2.1 High-Risk / Custom Packages (nach Kuratierung)

| Package           | Version    | Deklarierte Lizenz | Location                             | Action                                                       |
| ----------------- | ---------- | ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| SparkMD5          | 3.0.0      | CUSTOM             | `crm.menschlichkeit-oesterreich.at/` | Lizenztext sicherstellen, juristische Abnahme einholen       |
| atomically        | 2.0.3      | _kein Feld_        | Monorepo Root                        | Upstream Issue/PR eröffnen, Alternativen prüfen              |
| stubborn-fs       | 1.2.5      | _kein Feld_        | Monorepo Root                        | Maintainer kontaktieren oder Ersatzbibliothek evaluieren     |
| union             | 0.5.0      | _kein Feld_        | Monorepo Root                        | Lizenzrecherche (mutmaßlich MIT) abschließen                 |
| smartmenus-\*     | 0.x/1.x    | Registry entfernt  | Drupal vendor JS bundle              | Lizenztext aus Projekt-Repo archivieren, SPDX manuell setzen |
| jquery.tokeninput | 2014-04-02 | Registry entfernt  | Drupal vendor JS bundle              | Lizenz aus GitHub Snapshot extrahieren                       |

> Die vollständige Notice-Tabelle inklusive aufgelöster Pakete befindet sich in `docs/security/THIRD-PARTY-NOTICES.md` und wird bei jedem Skriptlauf aktualisiert.

---

## 3. Remediation Plan

1. **SBOM Enrichment & Tooling**
   - [x] `scripts/enrich-sbom-licenses.mjs` erstellt und erfolgreich ausgeführt (1 005 Auflösungen).
   - [ ] Skript in CI (Phase‑1 Cleanup) integrieren, Artefakte (`*.enriched.json`, Notices) als Pipeline-Outputs veröffentlichen.
2. **Python Dependencies**
   - [ ] Poetry `pyproject.toml` um Lizenz-Classifier ergänzen und `pip-licenses` automatisieren → Rest-UNKNOWN auf 0 senken.
3. **Manuelle Restarbeiten**
   - [ ] `SEE LICENSE IN LICENSE.md` Pakete prüfen und Lizenztexte an zentraler Stelle versionieren.
   - [ ] Für entfernte npm-Pakete (`smartmenus-*`, `jquery.tokeninput`) Lizenzdaten aus Git-Repositories sichern.
4. **Governance**
   - [ ] Build-Gate definieren: Pipeline darf nur deployen, wenn `security/sbom/license-curation.json.unresolvedCount == 0`.
   - [ ] Legal Review für `SparkMD5` dokumentieren und Ergebnis in Notices ergänzen.

---

## 4. Evidence & Commands

```bash
# SBOM-Lizenzkuratierung (ausgeführt 2025-10-04)
node scripts/enrich-sbom-licenses.mjs

# Rest-UNKNOWN validieren
cd security/sbom
jq '[.components[] | (.licenses // [])[] | (.license.id // "UNKNOWN") | select(.=="UNKNOWN")] | length' root-project.enriched.json
jq '[.components[] | (.licenses // [])[] | (.license.id // "UNKNOWN") | select(.=="UNKNOWN")] | length' api-python.enriched.json
jq '[.components[] | (.licenses // [])[] | (.license.id // "UNKNOWN") | select(.=="UNKNOWN")] | length' crm-php.enriched.json
```

---

**Next Review:** Phase 1 (Repository Hygiene) – target <5% UNKNOWN licenses.

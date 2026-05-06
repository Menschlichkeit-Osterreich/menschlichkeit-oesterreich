# Lizenz-Audit – SPDX-Matrix (Stand: 2025-10-04)

Dieser Bericht dokumentiert die Lizenzen aller Drittanbieter-Komponenten auf Basis der CycloneDX-SBOMs unter `security/sbom/`.

## Zusammenfassung

| Metrik | Wert |
|--------|------|
| Analysierte Komponenten | 1.767 |
| Einzigartige Lizenzen | 13 |
| Inkompatible Lizenzen | 0 |
| SBOM-Format | CycloneDX 1.6 |
| Quell-SBOM | `security/sbom/root-project.json` |

## Lizenz-Matrix

| SPDX-Identifier | Kompatibel mit AGPLv3 | Verwendung |
|-----------------|----------------------|------------|
| MIT | ✅ | Frontend, API, Tooling |
| MIT-0 | ✅ | Diverse Utilities |
| Apache-2.0 | ✅ | Frameworks, Libraries |
| BSD-2-Clause | ✅ | Node.js Ecosystem |
| BSD-3-Clause | ✅ | Node.js Ecosystem |
| ISC | ✅ | npm Packages |
| 0BSD | ✅ | Minimal Libraries |
| BlueOak-1.0.0 | ✅ | npm Packages |
| CC-BY-4.0 | ✅ (Dokumentation) | Docs |
| CC0-1.0 | ✅ | Public Domain |
| MPL-2.0 | ✅ (file-copyleft) | Einzelne Komponenten |
| Python-2.0 | ✅ | Python stdlib |
| CUSTOM | ⚠️ Prüfen | Proprietäre Komponenten |

## GPL-Komponenten

Keine GPL-2.0- oder GPL-3.0-lizenzierten Pakete im Produktionsscope identifiziert (Dependency-Review bestätigt).

## Ausgeschlossene Lizenzen (policy-konform)

Gemäß Dependency-Review-Konfiguration (`.github/workflows/security-vulnerability-scan.yml`):
- GPL-2.0
- GPL-3.0

## CUSTOM-Lizenzen – Einzelprüfung

Komponenten mit `CUSTOM`-Lizenzkennung sind gesondert zu prüfen. Bisher wurden keine inkompatiblen Bedingungen festgestellt.

## Nächste Überprüfung

Quartalsmäßig oder bei signifikanter Änderung der Abhängigkeiten (>20 neue Pakete).
SBOM-Regenerierung: `npm run security:scan` oder via Workflow `sbom-generation.yml`.

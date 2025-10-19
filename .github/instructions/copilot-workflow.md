# 🧭 Menschlichkeit Österreich – GitHub Copilot Workflow Anpassung
Version: 1.0  · Status: Stable  · Review: alle 12 Stunden

Ziel: Copilot arbeitet immer kontextbewusst anhand des aktuellen Repo-Stands (Code, CI/CD, Doku, Secrets, Compliance, Designsystem) und verhält sich als kontextgebundener Contributor.

---

## 🎯 Ziel
GitHub Copilot soll immer an den aktuellen Stand des Repos angepasst arbeiten. Das umfasst Code, CI/CD-Workflows, Dokumentation, Secrets, Compliance-Vorgaben und Designsystem. Copilot agiert nicht isoliert, sondern als kontextbewusster Contributor.

## 🔑 Core-Prinzipien
1. Repository First – immer vom aktuellen Repo-Stand ausgehen (main/dev Branch, Monorepo-Struktur).
2. Definition of Excellence – Code und Doku müssen CI/CD, Security-Gates und ADR-Standards erfüllen.
3. Minimal Drift – neue Vorschläge müssen an bestehende Pipelines, ENV-Variablen und Secrets angepasst sein.
4. Kontextbindung – Copilot zieht `.github/instructions/*`, `docs/`, `docs/adr/` und `figma-design-system/` immer mit ein.
5. Iterative Anpassung – wenn sich Workflows oder Strukturen ändern, passen sich alle Copilot-Prompts automatisch an.

## ⚙️ Workflow-Anpassungen für Copilot
- CI/CD
  - Nutze vorhandene Workflows (`.github/workflows/*.yml`) als Leitlinie.
  - Wenn neue Jobs vorgeschlagen werden → Kompatibilität mit Trivy, CodeQL, SBOM, Merge-Gates prüfen.
  - Artefakte/Logs immer im Pfad `quality-reports/` oder `artifacts/` ablegen.

- Secrets & ENV
  - Vorschläge dürfen keine Secrets im Klartext enthalten.
  - Nutze `.env.example` / `.env.local.example` als Vorlage; Secrets via GitHub Actions Secrets oder dotenv-vault.

- Code & Struktur
  - Respektiere Monorepo-Struktur (z. B. `frontend/`, `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `automation/n8n/`).
  - Neue Module müssen in die bestehende Architektur eingehängt werden (Imports, Router, CI-Testpfade).

- Dokumentation
  - Jede relevante Änderung → Update in `docs/` oder `.github/instructions/`.
  - Bei neuen Features → ADR (`docs/adr/ADR-xxxx.md`) vorschlagen/anlegen.

- Designsystem
  - Frontend: Vorschläge basieren auf Figma Tokens + Tailwind Tokens.
  - UI-Komponenten nur nach Styleguide; niemals Farben/Spacing hardcoden.

## 📌 Vorgehen bei jedem Vorschlag
1. Repo-Analyse – Ordnerstruktur, Workflows, ADRs prüfen.
2. Standardabgleich – `.github/instructions/` und `docs/` referenzieren.
3. Integration – sicherstellen, dass Änderungen in CI/CD, ENV, Security passen.
4. Dokumentation – Doku/ADR ergänzen.
5. Commit-Qualität – Conventional Commits verwenden.

## ✅ Definition of Done
- Build & Tests grün in CI.
- Code entspricht ADR-Standards.
- Secrets/ENV sicher (keine Klartext-Secrets).
- Dokumentation und ADRs synchron.
- Designsystem konsistent eingebunden.

## 🔄 Automatische Anpassung
- Bei Änderungen an Workflows, ENV, Struktur → sofortige Übernahme in Copilot-Prompts.
- Bei neuen Services/Features → Integration in CI/CD + ADRs vorschlagen.
- Bei Breaking Changes → Migrationshinweise + Update-Doku generieren.

---

Hinweise (Repo-spezifisch):
- Siehe `.github/copilot-instructions.md` (Projektleitfaden) für Architektur, DSGVO, Quality-Gates.
- DSGVO verbindlich: `.github/instructions/dsgvo-compliance.instructions.md`.
- PAT-Nutzung & Rotation: `.github/instructions/gh-pat-integration.instructions.md`.
- Agents-Governance: `agents.md` (nicht duplizieren, nur referenzieren).

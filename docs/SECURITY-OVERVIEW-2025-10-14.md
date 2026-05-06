# Security Overview – Stand 14.10.2025

Status-Priorität: Sicherheit > Datenintegrität > Produktionsstabilität > Developer Velocity

## 1. Zusammenfassung
Dieser Überblick konsolidiert aktuelle Sicherheitsmaßnahmen im Codespace, in den Services (Drupal/CiviCRM, FastAPI, Frontend, Automation) sowie offene Lücken. Grundlage: vorhandene Scanner (Trivy, Gitleaks), DSGVO-Vorgaben, vorhandene Skripte & Middleware.

## 2. Aktueller Werkzeug-Stack
- Container Security: Trivy (Image + FS Scan) – im Repo via `npm run security:scan`
- Secrets Detection: Gitleaks – konfiguriert mit `gitleaks.toml`
- Code Quality: ESLint, PHPStan, Vitest, Playwright
- Dependency Audit: (npm audit optional, nicht blocking) – Empfehlung: in Pipeline aufnehmen
- Codacy: Docker Wrapper vorhanden, Analyse aktuell fehlerhaft (Parsing `.codacyrc`) → TEILWEISE
- Lighthouse Performance: Teilweise funktionsfähig (Chrome fehlt im Codespace)

## 3. Docker & Codespace Hardening
- Devcontainer nutzt Docker Socket (`/var/run/docker.sock`) für Codacy Wrapper → Risiko: Container Breakout theoretisch möglich.
  - Mitigation: Nur vertrauenswürdige Images (offizielle codacy/*, trivy, gitleaks). Kein Pull von unbekannten Quellen ohne Review.
  - Empfehlung: Optional Rootless Docker oder Socket Proxy (Read-Only) später implementieren.
- Secrets: Nicht im Repo hinterlegt; `secrets.manifest.json` dient als Strukturvorlage. Gitleaks schützt gegen versehentliches Einchecken.

## 4. CiviCRM / Drupal Sicherheitsaspekte
- RBAC: Rollen laut Anweisungen (administrator, vorstand, kassier, member) – sicherstellen, dass CiviCRM Permissions konsistent gepflegt sind.
- PII Sanitizer: Custom Modul in `crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/` (E-Mail Maskierung, IBAN Redaction) – verhindert PII in Logs.
- Audit Logging: Drupal Watchdog + CiviCRM Aktivitäten; Empfehlung: Zusätzliches strukturiertes Security-Log (JSON Lines) für kritische Aktionen (Login, Rollenänderungen).
- Updates: Drush `updb` + regelmäßige Security Advisories (Drupal SA / CiviCRM Releases). Empfehlung: Wöchentlicher Check automatisieren.

## 5. FastAPI (API) Sicherheitsaspekte
- Middleware `pii_middleware.py` + `pii_sanitizer.py`; Tests (`pytest tests/test_pii_sanitizer.py`) validieren Maskierung.
- Auth (nicht im Überblick gezeigt) – Empfehlung: Rate Limiting + Security Headers (`Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`).

## 6. Frontend
- Keine Inline-Geheimnisse; .env Handling via Build Pipeline.
- Empfehlung: CSP Nonces oder Hashes bei produktiver Auslieferung; SRI für externe Ressourcen.

## 7. Offene Punkte & Risiken
| Bereich | Risiko | Status | Nächster Schritt |
|--------|--------|--------|------------------|
| Codacy Analyse | Fehlende funktionierende Auswertung | TEILWEISE | Stabilen Image-Tag testen / YAML Format prüfen |
| Lighthouse | Fehlendes Chrome/Chromium | TEILWEISE | Installationsscript hinzufügen |
| Docker Socket | Potenzieller Container-Eskalationspfad | OFFEN | Socket Proxy / Rootless evaluieren |
| CiviCRM Security Updates | Manuell | OFFEN | Automatisierte Weekly Check via n8n |
| API Rate Limiting | Nicht dokumentiert | OFFEN | FastAPI Dependency (slowapi) integrieren |

## 8. Nächste Sicherheits-Maßnahmen (Kurzplan)
1. Chrome Install Script (`scripts/dev/install-chrome.sh`) → volle Lighthouse Audit.
2. Codacy stabilisieren: Tag pinnen + alternative `.codacyrc` YAML probieren.
3. n8n Workflow für wöchentliche Drupal/CiviCRM Security Advisory Check.
4. FastAPI Rate-Limiting (slowapi) + Security Header Middleware.
5. Optional: Structured Audit Log für Rollenänderungen (JSON Lines + Rotation).

## 9. Compliance (DSGVO) Schnittstellen
- Log-Sanitizing aktiv (PII entfernt).
- Aufbewahrungsfristen (Finanzdaten 7 Jahre, Mitgliederdaten nach Austritt 12 Monate) – technische Umsetzung in CRM nötig (geplante Cron-Jobs).
- Empfehlung: Job zur Pseudonymisierung nach Ablauf implementieren (Prüfung über Feld "Austrittsdatum").

## 10. Quick Checks Befehle
```bash
npm run security:scan          # Trivy + Gitleaks
npm run test:unit              # Vitest
pytest tests/test_pii_sanitizer.py
bash scripts/codacy/codacy-cli.sh version
bash scripts/codacy/codacy-cli.sh analyze --directory frontend/src --format json --output quality-reports/codacy.json || true
```

## 11. Changelog dieser Übersicht
- 2025-10-14: Erste Erstellung (Codacy TEILWEISE, Lighthouse TEILWEISE)

---
Verantwortlich: AI DevOps Assistent · Nächste Revision in 7 Tagen empfohlen.

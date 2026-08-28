# Copilot Cloud Agent Status

Stand: 2026-08-28

## CURRENT HEAD

`266729e30f775a966d83c8a6bdd9d74d8109b4f6`

## CURRENT PR

PR #547 `chore: vollständige Copilot Agent Sandbox`

## DONE

- Issue #539 als kanonische Make-first/Plesk/Bitwarden-Architektur in `.github/copilot-instructions.md` verankert.
- Azure CLI und Azure-Ressourcen-Erweiterung aus dem aktiven Devcontainer-Vertrag entfernt.
- n8n-Port `5678` und lokales `N8N_BASE_URL` aus dem aktiven Devcontainer-Vertrag entfernt.
- Bitwarden Server URL im Devcontainer auf `https://vault.bitwarden.eu` synchronisiert.
- `automation-n8n.agent.md` auf Migration-only umgestellt.
- Copilot Setup Workflow trennt n8n-Validierung jetzt explizit als Legacy-/Migrationsartefakt vom kanonischen Plattform-Gate.
- PR #547 Beschreibung auf #539, Make-first, n8n Retirement, Plesk read-only und Payment Release Gates aktualisiert.
- PR #533 als bereits gemergte Plesk-Audit-Basis verifiziert.
- PR #538 als bereits gemergtes Payment Hardening verifiziert.
- PR #546 als bereits gemergte Dokumentation des noch fehlenden `VERIFIED_LIVE` Nachweises verifiziert.
- Issue #541 als offener Alembic-DAG-Track verifiziert.

## IN PROGRESS

- GitHub Actions Verifikation auf Head `266729e3`.
- `Copilot Setup Steps` laeuft.
- `Workspace Configuration Reliability` laeuft.
- CI/CD, Security-, Dependency-, SBOM- und Quality-Gates laufen.

## BLOCKED

- `VERIFIED_LIVE` fuer Plesk ist weiterhin nicht vergeben. PR #546 dokumentiert, dass noch kein erfolgreicher manueller Live-Audit-Run als Evidenz vorliegt.
- Make Organisation Bootstrap bleibt extern durch fehlenden OAuth Scope `teams:write` blockiert. Kein unsicherer Workaround.

## REQUIRES OWNER ACTION

Aktuell keine Secretwerte im Chat bereitstellen.

Fuer den eigentlichen Plesk-Live-Nachweis muss der bereits vorhandene manuelle GitHub Actions Workflow `plesk-live-audit.yml` kontrolliert dispatcht werden, sobald der Workflow-Vertrag vollstaendig auf die neue Agents-Variable/BSM-Aufteilung synchronisiert ist.

## LIVE VERIFIED

`UNKNOWN`

`VERIFIED_REPO` und `VERIFIED_CONFIG` duerfen nicht als `VERIFIED_LIVE` ausgegeben werden.

## NEXT ACTION

1. CI-Ergebnis von PR #547 auswerten und echte Fehler korrigieren.
2. `.github/workflows/plesk-live-audit.yml` auf den finalen Vertrag synchronisieren: `PLESK_HOST` aus Agents Variable, `REMOTE_USER` aus BSM, strikte Host-Key-Verifikation, kein beliebiger Remote Command Input.
3. BSM-Profil `plesk-live-audit` so reduzieren, dass kein zweiter Host-Quellpfad bestehen bleibt.
4. `CLAUDE.md` und verbleibende aktive Governance-Dateien auf Make-first/n8n-Migration-only synchronisieren.
5. Erst danach manuellen read-only Live-Audit ausfuehren und `VERIFIED_LIVE` nur bei erfolgreicher SSH- und Collector-Evidenz vergeben.

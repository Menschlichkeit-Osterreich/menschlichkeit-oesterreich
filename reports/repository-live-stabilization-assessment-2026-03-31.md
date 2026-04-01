# Repo-weite Live-Stabilisierung und Maintainer-Bewertung

Stand: 2026-03-31  
Repository: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`

## 1. Executive Summary

Das Repository hat heute eine erkennbare aktive Zielstruktur unter `apps/`, `openclaw-system/` und `mcp-servers/`, wird aber an der Root weiterhin durch zahlreiche Legacy-, Mirror- und Hilfsbaeume verwässert. Der staerkste technische Positivpunkt ist, dass der produktive Deployvertrag in `.github/workflows/deploy-plesk.yml` bereits relativ klar definiert ist, inklusive Plesk-Zielpfaden, Secrets und Smoke-Checks. Gleichzeitig unterlaufen aktive Root-Skripte, Templates und Betriebsdokumente diese Klarheit noch immer durch konkurrierende Verträge wie `PLSK_*`, `PLESK_REMOTE_PATH`, alte Repo-URLs und gemischte Health-Endpunkte. Die Wartbarkeit leidet nicht primaer an einem einzelnen schlechten Subsystem, sondern an widerspruechlicher Betriebswahrheit zwischen `README*`, `SECURITY.md`, `docs/*`, `package.json` und historischen Spiegelverzeichnissen. Operativ ist das groesste Risiko nicht fehlender Code, sondern Fehlsteuerung: Maintainer koennen heute legitimerweise zur falschen Doku, zum falschen Pfad oder zum falschen Deploy-Einstieg greifen. Security-seitig ist das Repo auf dem Papier stark dokumentiert, aber mehrere aktive Dokumente verweisen weiterhin auf das alte Repository `menschlichkeit-oesterreich-development`, was Incident- und Advisory-Prozesse verfälschen kann. Fuer einen belastbaren Live-Betrieb braucht das Projekt deshalb weniger neue Plattformteile als eine harte Konsolidierung der aktiven Betriebsvertraege.

## 2. Groesste strukturelle Schwaechen

1. **Ueberladene Root-Struktur ohne harte Betriebsgrenze**
   - Aktiv sind laut `README.md` vor allem `apps/website/`, `apps/api/`, `apps/crm/`, `apps/babylon-game/`, `apps/forum/`, `openclaw-system/` und `mcp-servers/`.
   - Gleichzeitig liegen im Root weiterhin Mirror-/Altbaeume wie `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `new/`, `web/`, `services/`, `templates/`, `tools/`, `codacy-analysis-cli-master/`.
   - Das ist kein kosmetisches Problem, sondern eine strukturelle Fehlleitungsquelle fuer neue Maintainer.

2. **Deployvertrag ist nur teilweise kanonisch**
   - `.github/workflows/deploy-plesk.yml` definiert klar die produktiven Zielpfade und `PLESK_*`-Secrets.
   - `package.json` referenziert trotzdem nicht existierende `scripts/deploy-crm.ps1`, `scripts/deploy-api.ps1`, `scripts/deploy-frontend.ps1`.
   - Der vorhandene Fallback `scripts/deploy-to-plesk.ps1` war historisch noch auf `api.menschlichkeit-oesterreich.at/`, `web/*` und `frontend/` ausgerichtet.

3. **Aktive Doku widerspricht sich in Kernfragen**
   - `README.md` beschreibt das heutige Monorepo bereits relativ modern.
   - `README_DEPLOY.md`, `docs/QUICKSTART.md`, `docs/wiki/Home.md`, `docs/monitoring.md` und `docs/operations/monitoring.md` vermischen dagegen alte Ports, alte Repo-Namen und veraltete Health-/Deploy-Vertraege.

4. **Health-Vertrag ist nicht sauber standardisiert**
   - `apps/api/app/main.py` definiert `/healthz` und `/readyz` als kanonische Endpunkte und haelt `/health` nur noch als Legacy-Alias.
   - Teile der Betriebsdoku und Monitoring-Doku sprechen aber weiter von `/health` oder sogar `/api/health`.

## 3. Groesste operative Risiken

1. **Falscher Produktionspfad**
   - Das groesste Live-Risiko ist, dass Maintainer aus Root-Skripten oder Doku den falschen Deployweg waehlen.
   - Unsicherheit: Die GitHub-Workflow-Definition ist klarer als die lokalen Hilfsskripte, aber nicht belegt, dass das Team konsequent nur noch diesen Weg nutzt.

2. **Incident- und Security-Drift**
   - `SECURITY.md`, `docs/QUICKSTART.md`, `docs/wiki/Home.md`, `docs/security/GH-TOKEN-USAGE.md`, `docs/security/rulesets-and-protection.md` und `docs/compliance/DSGVO-COMPLIANCE-BLUEPRINT.md` referenzieren weiterhin `menschlichkeit-oesterreich-development`.
   - Dadurch koennen Security-Advisories, Token-Operationen und Onboarding-Schritte auf die falsche Repo-Identitaet zeigen.

3. **Secrets-/Env-Vertrag ist nicht einheitlich**
   - Der Workflow verwendet `PLESK_*`, waehrend Root-Templates und `scripts/validate-secrets.py` bisher noch `PLESK_REMOTE_PATH` und verwandte Altannahmen enthielten.
   - Das erzeugt Fehlkonfigurationen genau in dem Bereich, der fuer Live-Betrieb am sensibelsten ist.

4. **Dokumentierte Monitoring-Wahrheit ist unzuverlaessig**
   - Solange Healthchecks und Monitoring-Doku unterschiedliche Endpunkte beschreiben, ist eine gruen wirkende Monitoring-Lage nicht automatisch vertrauenswuerdig.

## 4. Top-10-Empfehlungen mit Priorisierung

1. **P0:** `.github/workflows/deploy-plesk.yml` als alleinige produktive Deploy-Wahrheit festziehen.
2. **P0:** Tote Root-Deploy-Skriptreferenzen in `package.json` entfernen oder auf den realen Fallback verdrahten.
3. **P0:** Health-Vertrag repo-weit auf `/healthz` und `/readyz` standardisieren; `/health` nur als Legacy-Alias dokumentieren.
4. **P0:** Alte Repo-Identitaet aus aktiver Security-, Quickstart- und Wiki-Doku entfernen.
5. **P1:** Root-Baeume sichtbar in aktiv, legacy/mirror, vendor und generated klassifizieren.
6. **P1:** `PLESK_*` als einzigen Deploy-/Secrets-Vertrag fuer aktive Doku und Templates etablieren.
7. **P1:** `README.md`, `README_DEPLOY.md`, `SECURITY.md` und `apps/crm/README.md` als kanonische Maintainer-Einstiegspunkte reduzieren.
8. **P1:** Legacy-/Mirror-Baeume explizit als read-only markieren und aus aktiven Runbooks drängen.
9. **P2:** Security-Hardening-TODOs in ein echtes Risiko-Backlog mit Ownern und Fristen ueberfuehren.
10. **P2:** Je Oekosystem (`npm`, `pip`, `composer`) Verantwortlichkeit, Gate-Reihenfolge und Review-Pfad sichtbar machen.

## 5. Konkreter 30-Tage-Plan

### Tag 1-3

- Kanonischen Maintainer-Bericht abschliessen und als Entscheidungsgrundlage publizieren.
- Root-Deployskripte, Health-Vertrag und Secrets-Namensraum an den realen Produktionsvertrag angleichen.
- Aktive Doku von alten Repo-Referenzen bereinigen.

### Tag 4-7

- `README_DEPLOY.md`, `docs/QUICKSTART.md`, `docs/wiki/Home.md`, `docs/monitoring.md` und `docs/operations/monitoring.md` auf denselben Betriebsvertrag bringen.
- Root-Env-Templates und `scripts/validate-secrets.py` auf `PLESK_*` modernisieren.
- Manual-Fallback-Skript nur noch als dokumentierten Hilfspfad behalten, nicht als konkurrierende Produktionswahrheit.

### Woche 2

- Root-Verzeichnis in aktive, legacy/mirror, vendor und generated Zonen aufteilen und dokumentieren.
- Onboarding auf wenige kanonische Dokumente reduzieren.
- Legacy-/Mirror-Baeume explizit als nicht-kanonisch markieren.

### Woche 3

- Security- und Secret-Rotationsdoku auf den aktuellen Repo- und Deployvertrag heben.
- Dependency-Prozess und Maintainer-Ownership je Stack sichtbar machen.
- Dry-Run- und Post-Deploy-Smoke-Check in den Standardbetrieb aufnehmen.

### Woche 4

- Rest-Risiken, offene P2-Themen und Folgearbeiten in einem kurzen Produktionsfreigabebericht sammeln.
- Kleine, aber wirkungsvolle Aufraeumarbeiten abschliessen: tote Skriptreferenzen, falsche Ports, widerspruechliche Env-Namen, doppelte aktive Ops-Doku.

## 6. Markdown-Tabelle mit Massnahmen

| Prioritaet | Massnahme                                      | Fundstellen                                                                                   | Erwarteter Effekt                                    |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P0         | Root-Deployvertrag bereinigen                  | `package.json`, `scripts/deploy-to-plesk.ps1`, `.github/workflows/deploy-plesk.yml`           | Weniger Fehlbedienung bei Live-Rollouts              |
| P0         | Repo-Identitaet in aktiver Doku korrigieren    | `SECURITY.md`, `docs/QUICKSTART.md`, `docs/wiki/Home.md`, `docs/security/*`                   | Richtige Security- und Onboarding-Pfade              |
| P0         | Healthchecks vereinheitlichen                  | `apps/api/app/main.py`, `docs/operations/monitoring.md`, `docs/monitoring.md`                 | Verlaesslichere Uptime- und Incident-Signale         |
| P1         | Root-Zonen dokumentieren                       | `README.md`, Root-Ordnerstruktur                                                              | Schnellere Orientierung, weniger falsche Aenderungen |
| P1         | Deploy-/Secret-Namensraum vereinheitlichen     | `.env.example`, `.env.production.template`, `scripts/validate-secrets.py`, `README_DEPLOY.md` | Weniger Fehlkonfigurationen                          |
| P1         | Kanonische Maintainer-Doku reduzieren          | `README.md`, `README_DEPLOY.md`, `SECURITY.md`, `apps/crm/README.md`                          | Weniger konkurrierende Betriebswahrheiten            |
| P1         | Legacy-Baeume read-only behandeln              | `api.menschlichkeit-oesterreich.at/`, `crm.menschlichkeit-oesterreich.at/`, `new/`, `web/`    | Weniger Fehlplanung in Altpfaden                     |
| P2         | Security-Hardening backlogisieren              | `docs/security/hardening.md`, `docs/security/2026-03-env-cleanup-rotation-log.md`             | Bessere Umsetzbarkeit statt TODO-Stau                |
| P2         | Dependency-Governance je Stack sichtbar machen | `.github/dependabot.yml`, `package.json`, `composer.json`, `apps/api/requirements*.txt`       | Klarere Ownership und Review-Pfade                   |
| P2         | Monitoring-/Deploy-Smokes standardisieren      | `.github/workflows/deploy-plesk.yml`, `scripts/post_deploy_verify.sh`                         | Schnellere Produktionsfreigabe                       |

## Unsicherheiten

- Nicht alle historischen Reports und Archivdokumente wurden als aktive Wahrheit behandelt; diese Bewertung grenzt `docs/archive/` bewusst aus.
- Ob lokale PowerShell-Deploypfade noch operativ genutzt werden, ist aus dem Repo allein nicht abschliessend belegbar.
- Der Bericht bewertet bewusst die Repo- und Betriebswahrheit, nicht die tatsaechliche Erreichbarkeit aller Produktivservices ausserhalb des Repos.

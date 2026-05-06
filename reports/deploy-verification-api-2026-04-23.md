# Produktions-Deploy-Verifikation API – 2026-04-23

## Run 24853563885 – Erster Versuch

Datum: 2026-04-23
Repository: Menschlichkeit-Osterreich/menschlichkeit-oesterreich
Workflow: .github/workflows/deploy-plesk.yml
Run-ID: 24853563885
Run-URL: [GitHub Actions Run 24853563885](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/actions/runs/24853563885)
Zielservice: api

### Ergebnis Run 24853563885

NO-GO (ABORT)

Begruendung:

- Der Deploy-Job ist fehlgeschlagen (conclusion: failure).
- Das erste harte Fehlersignal trat im Schritt "API Runtime Reload triggern" auf.
- Folgefehler in Healthchecks auf /healthz und /readyz (HTTP 000000).

### Verifizierte Vorbedingungen Run 24853563885

- Validierung & Branch-Schutz: success
- BSM Secrets laden: success
- Preflight (BSM Handoff): success
- Unit Tests: success
- API Artefakt-Transfer (API -> scp): success

### Abort-Kriterium Run 24853563885

Schritt: "API Runtime Reload triggern" (Step 14)

Signal:

- "venv/bin/activate nicht gefunden; verwende System-Umgebung"
- "uvicorn nicht gefunden; API-Restart abgebrochen"
- Exit Code 1

Interpretation:

- Runtime auf Zielsystem konnte nicht gestartet werden, da uvicorn in der verwendeten Laufzeitumgebung nicht aufloesbar ist.

### Folgeaktion Run 24853563885

Auf dem Plesk-Ziel im API-Pfad die Runtime-Voraussetzung herstellen und verifizieren:

- Sicherstellen, dass die produktive API-Startumgebung uvicorn verfuegbar macht (venv korrekt vorhanden/aktivierbar oder expliziter Startpfad auf vorhandenen Interpreter).

### Rollback-Trigger Run 24853563885

Wenn ein API-Deploy den Schritt "API Runtime Reload triggern" mit Exit != 0 beendet oder /healthz bzw. /readyz keinen 2xx/3xx liefern, gilt der Release als fehlgeschlagen und bleibt auf NO-GO (kein weiterer Promote/Release-Schritt).

### Healthcheck-Evidenz Run 24853563885

- /healthz: HTTP 000000 (fehlgeschlagen)
- /readyz: HTTP 000000 (fehlgeschlagen)

### Job-Chain Run 24853563885

- Validierung & Branch-Schutz: success
- BSM: Production Secrets laden: success
- Unit Tests: success
- Games bauen: success
- Frontend bauen: success
- Preflight (BSM Handoff): success
- Deploy -> Plesk: failure

### Secrets-Hinweis Run 24853563885

- Secrets wurden nur als Presence/Workflow-Erfolg bewertet.
- Keine Secret-Werte im Bericht offengelegt.

---

## Run 24854144969 – Zweiter Versuch

Datum: 2026-04-23
Repository: Menschlichkeit-Osterreich/menschlichkeit-oesterreich
Workflow: .github/workflows/deploy-plesk.yml
Run-ID: 24854144969
Run-URL: [GitHub Actions Run 24854144969](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/actions/runs/24854144969)
Zielservice: api

### Ergebnis Run 24854144969

NO-GO (ABORT)

Begruendung:

- Der Deploy-Job ist fehlgeschlagen (conclusion: failure).
- Das erste harte Fehlersignal trat in Schritt 11 "Frontend → scp (Chroot-SSH)" auf.
- Alle nachfolgenden API-Deploy-Schritte wurden uebersprungen (skipped).
- Healthchecks /healthz und /readyz schlugen fehl (DNS-Aufloesungsfehler fuer api.menschlichkeit-oesterreich.at).

### Verifizierte Go-Bedingungen Run 24854144969

| #   | Bedingung                                         | Status                  |
| --- | ------------------------------------------------- | ----------------------- |
| 1   | `conclusion: success` (Workflow-Gesamtergebnis)   | ❌ FAILURE              |
| 2   | Schritt "API Runtime Reload triggern" erfolgreich | ❌ SKIPPED (Step 14)    |
| 3   | `/healthz` → HTTP 2xx                             | ❌ FAILURE (DNS-Fehler) |
| 4   | `/readyz` → HTTP 2xx                              | ❌ FAILURE (DNS-Fehler) |
| 5   | BSM/Graph/Slack Secret-Handoff (Preflight-Job)    | ✅ SUCCESS              |

Gesamtbewertung: 1 von 5 Bedingungen erfuellt → **NO-GO**

### Abort-Kriterium Run 24854144969

Schritt: "Frontend → scp (Chroot-SSH)" (Step 11)
Job: Deploy → Plesk

Symptom:

- SCP-Transfer des Frontend-Artefakts scheiterte auf dem Plesk-Chroot-SSH-Zielpfad.
- Alle nachgelagerten Schritte (API-Upload, Restart, Healthchecks) wurden automatisch uebersprungen.

Unterschied zum Vorlauf (Run 24853563885):

- Run 24853563885: API-Artefakt-Transfer erfolgreich, Fehler erst beim Restart (uvicorn nicht gefunden).
- Run 24854144969: Fehler bereits beim SCP-Upload des Frontend-Artefakts; API-Pfad nie erreicht.

### Root-Cause-Analyse Run 24854144969

Wahrscheinliche Ursachen fuer SCP-Fehler im Chroot:

1. Chroot-SSH-Verbindung nicht stabil / Verbindungsabbruch waehrend Transfer.
1. Zielverzeichnis im Chroot nicht beschreibbar oder nicht vorhanden.
1. SSH-Key-Authentifizierung oder Known-Hosts-Problem in der CI-Umgebung.
1. Netzwerkunterbruch zwischen GitHub Actions Runner und Plesk-Server.

### Folgeaktion Run 24854144969

Den Plesk-Chroot-SSH-Zugang und den SCP-Zielpfad verifizieren, bevor ein weiterer Deploy-Versuch gestartet wird:

1. SSH-Verbindung manuell testen: `ssh -i <deploy-key> <user>@<host> "echo OK"`
1. Zielverzeichnis pruefen: Schreibrecht, Existenz, korrekte Chroot-Konfiguration.
1. Bekannten Fehlertyp aus CI-Logs isolieren (Timeout, Permission denied, Host-Key-Mismatch).
1. Nach Behebung: Workflow manuell re-triggern.

### Rollback-Trigger Run 24854144969

Da die API nie deployed wurde, ist kein Rollback der API-Runtime notwendig.
Der vorherige Live-Stand (aus Run 24853563885, ebenfalls fehlgeschlagen) bleibt unveraendert aktiv.
Eine gesonderte Rollback-Aktion ist nicht erforderlich.

### Healthcheck-Evidenz Run 24854144969

- /healthz: FAILURE (DNS-Aufloesungsfehler fuer api.menschlichkeit-oesterreich.at)
- /readyz: FAILURE (DNS-Aufloesungsfehler fuer api.menschlichkeit-oesterreich.at)

DNS-Status zum Zeitpunkt der Verifikation: `api.menschlichkeit-oesterreich.at` nicht aufloesbar.

### Job-Chain Run 24854144969

| Job                           | Status                    |
| ----------------------------- | ------------------------- |
| Validierung & Branch-Schutz   | success                   |
| BSM: Production Secrets laden | success                   |
| Unit Tests                    | success                   |
| Games bauen                   | success                   |
| Frontend bauen                | success                   |
| Preflight (BSM Handoff)       | success                   |
| Deploy → Plesk                | **failure** (Step 11 SCP) |

### Secrets-Hinweis Run 24854144969

- Secrets wurden nur als Presence/Workflow-Erfolg bewertet.
- Keine Secret-Werte im Bericht offengelegt.
  | Frontend bauen | success |
  | Preflight (BSM Handoff) | success |
  | Deploy → Plesk | **failure** (Step 11 SCP) |

## Hinweise zu Secrets

- Secrets wurden nur als Presence/Workflow-Erfolg bewertet.
- Keine Secret-Werte im Bericht offengelegt.

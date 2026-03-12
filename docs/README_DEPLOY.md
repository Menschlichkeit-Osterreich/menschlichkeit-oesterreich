# Deployment-Runbook – Menschlichkeit Österreich

**Version:** 2.0 | **Modell:** rsync-Artefakt-Deploy (Replit → Plesk via SSH)

---

## Übersicht

Dieses Runbook beschreibt den vollständigen Deploy-Prozess für die Plattform.

```
Replit (Build + Orchestrierung)
  │
  ├── 1. Env-Validierung     → scripts/validate_env.sh
  ├── 2. SSH Bootstrap       → scripts/bootstrap_ssh.sh
  ├── 3. Frontend Build      → cd apps/website && npm run build
  ├── 4. rsync Deploy        → scripts/deploy.sh
  └── 5. Post-Deploy-Check   → scripts/post_deploy_verify.sh

Plesk (Produktionsserver)
  │
  ├── menschlichkeit-oesterreich.at/httpdocs/   ← Frontend (static)
  ├── subdomains/api/httpdocs/                   ← FastAPI
  ├── subdomains/crm/httpdocs/                   ← Drupal + CiviCRM
  └── subdomains/games/httpdocs/                 ← Webgame
```

---

## Voraussetzungen

### Software
- bash ≥ 4.0
- rsync
- ssh / ssh-keyscan
- curl
- git
- Node.js ≥ 20 + npm (für Frontend-Build)
- (Optional) pip3 (für lokalen API-Test)

### Replit Secrets (Pflicht)

| Secret-Name | Beschreibung | Format |
|---|---|---|
| `PLSK_HOST` | Plesk-Server IP oder Hostname | z.B. `5.183.217.146` |
| `PLSK_USER` | SSH-Benutzername | z.B. `deployer` |
| `PLSK_PORT` | SSH-Port | z.B. `22` |
| `PLSK_SSH_KEY` | SSH Private Key (kompletter Inhalt) | `-----BEGIN ... KEY-----` |
| `PLSK_KNOWN_HOSTS` | known_hosts-Eintrag für den Server | z.B. `5.183.217.146 ecdsa-sha2-...` |
| `PLSK_DEPLOY_PATH` | Absoluter Zielpfad Frontend auf Plesk | z.B. `/var/www/vhosts/.../httpdocs` |

### Optionale Replit Secrets

| Secret-Name | Beschreibung |
|---|---|
| `PLSK_API_PATH` | Zielpfad API (Standard: abgeleitet aus PLSK_DEPLOY_PATH) |
| `PLSK_CRM_PATH` | Zielpfad CRM |
| `GITHUB_SSH_KEY` | SSH-Key für GitHub-Zugriff vom Server |

> ⚠️ **Sicherheitsregel:** Niemals Secret-Werte in Logs, Commits, Kommentare oder Dokumente schreiben.

---

## Erster Setup

### Schritt 1: PLSK_KNOWN_HOSTS ermitteln

Auf dem Plesk-Server oder einer vertrauenswürdigen Maschine ausführen:

```bash
ssh-keyscan -p 22 5.183.217.146
```

Den kompletten Ausgabe-Eintrag als Wert für `PLSK_KNOWN_HOSTS` in Replit Secrets hinterlegen.

> Niemals `StrictHostKeyChecking=no` verwenden — das ist unsicher.

### Schritt 2: Deploy-Key auf Plesk hinterlegen

Den Public Key des Deploy-Keys in `~/.ssh/authorized_keys` auf dem Plesk-Server eintragen.

### Schritt 3: Skripte ausführbar machen

```bash
chmod +x scripts/bootstrap_ssh.sh
chmod +x scripts/validate_env.sh
chmod +x scripts/deploy.sh
chmod +x scripts/post_deploy_verify.sh
```

---

## Lokaler Ablauf in Replit

### Nur Env-Validierung

```bash
bash scripts/validate_env.sh
# Strikt (Warnungen = Fehler):
bash scripts/validate_env.sh --strict
```

### Nur SSH-Bootstrap testen

```bash
bash scripts/bootstrap_ssh.sh
# Verbindung testen (kein echtes Deployment):
ssh plesk-deploy "echo 'SSH OK'"
```

### Dry-Run (kein Schreiben auf Produktion)

```bash
DRY_RUN=true SERVICE=frontend bash scripts/deploy.sh
DRY_RUN=true SERVICE=all bash scripts/deploy.sh
```

### Echter Deploy

```bash
# Einzelner Service:
SERVICE=frontend bash scripts/deploy.sh
SERVICE=api      bash scripts/deploy.sh
SERVICE=crm      bash scripts/deploy.sh
SERVICE=games    bash scripts/deploy.sh

# Alle Services:
SERVICE=all bash scripts/deploy.sh
```

### Post-Deploy-Verifikation

```bash
SERVICE=all bash scripts/post_deploy_verify.sh

# JSON-Output (für CI/Monitoring):
VERIFY_JSON=true SERVICE=frontend bash scripts/post_deploy_verify.sh
```

---

## CI/CD via GitHub Actions

Der Workflow `.github/workflows/deploy-plesk.yml` führt denselben Deploy-Prozess automatisiert aus.

**Erforderliche GitHub Secrets:**

| GitHub Secret | Entspricht Replit Secret |
|---|---|
| `PLESK_SSH_PRIVATE_KEY` | `PLSK_SSH_KEY` |
| `PLESK_KNOWN_HOSTS` | `PLSK_KNOWN_HOSTS` |
| `PLESK_HOST` | `PLSK_HOST` |
| `PLESK_PORT` | `PLSK_PORT` |
| `PLESK_USER` | `PLSK_USER` |
| `PLESK_BASE_PATH` (Variable) | `PLSK_DEPLOY_PATH` |
| `MAIN_DOMAIN` (Variable) | `menschlichkeit-oesterreich.at` |

**Deploy manuell auslösen:**

GitHub → Actions → „Deploy to Plesk (Production)" → „Run workflow" → Service wählen.

---

## Fehlerbilder

### SSH-Verbindung schlägt fehl

```
✗ SSH-Port 22 auf 5.183.217.146 nicht erreichbar
```

**Ursachen:**
- Firewall blockiert den Port
- `PLSK_HOST` oder `PLSK_PORT` falsch gesetzt
- Plesk-Server nicht erreichbar

**Lösung:**
```bash
# TCP-Erreichbarkeit testen:
bash -c "cat /dev/null > /dev/tcp/${PLSK_HOST}/${PLSK_PORT}" && echo OK || echo FAIL
```

---

### Host-Key-Verifikation schlägt fehl

```
Host key verification failed.
```

**Ursachen:**
- `PLSK_KNOWN_HOSTS` ist falsch oder veraltet
- Server-Schlüssel wurde geändert (Sicherheitswarnung!)

**Lösung:**
1. Auf vertrauenswürdigem Weg neuen Host-Key ermitteln:
   ```bash
   ssh-keyscan -p 22 5.183.217.146
   ```
2. `PLSK_KNOWN_HOSTS` in Replit Secrets aktualisieren.
3. Bei unerwartetem Schlüsselwechsel: Sicherheitsvorfall prüfen!

---

### Build schlägt fehl

```
✗ apps/website/dist/ nicht gefunden nach Build
```

**Ursachen:**
- npm-Abhängigkeiten nicht installiert
- TypeScript-Fehler im Code
- Fehlende Env-Variablen für den Build

**Lösung:**
```bash
cd apps/website
npm ci
npm run build
```

---

### rsync-Berechtigung verweigert

```
rsync: [sender] send_files failed to open ... (Permission denied)
```

**Ursachen:**
- Zielpfad existiert nicht auf Plesk
- SSH-User hat keine Schreibrechte auf dem Zielpfad

**Lösung:**
```bash
# Auf Plesk-Server: Verzeichnis anlegen und Rechte setzen
ssh plesk-deploy "mkdir -p ${PLSK_DEPLOY_PATH} && ls -la ${PLSK_DEPLOY_PATH}"
```

---

### Deploy läuft bereits (Lock-Datei)

```
✗ Deploy läuft bereits (PID: 12345, Lock: /tmp/moe_deploy.lock). Abbruch.
```

**Lösung:**
```bash
# Prüfen ob der Prozess wirklich noch läuft:
ps aux | grep 12345 || rm -f /tmp/moe_deploy.lock
```

---

## Rollback-Strategie

### Frontend-Rollback (rsync mit altem Build)

```bash
# Letzten Build aus git wiederherstellen:
git stash  # oder: git checkout main~1

# Deploy mit altem Stand:
SERVICE=frontend bash scripts/deploy.sh

# Neustart nach Rollback:
bash scripts/post_deploy_verify.sh
```

### API-Rollback via Git auf Plesk (falls git pull-Modell aktiv)

```bash
ssh plesk-deploy "cd /pfad/zur/api && git log --oneline -5"
ssh plesk-deploy "cd /pfad/zur/api && git checkout <commit-sha>"
```

### CRM-Rollback

1. Drush-Datenbank-Backup vor Deployment einspielen.
2. Quellcode-Rollback via rsync eines bekannten guten Standes.

### Vollständiger Rollback (Plesk Backup)

Falls Plesk-Backup verfügbar:
1. Plesk-Panel → Backup Manager → Backup auswählen
2. „Wiederherstellen" für den betroffenen Service

---

## Sicherheitsnotizen

1. **Niemals `StrictHostKeyChecking=no` verwenden.** Immer `StrictHostKeyChecking=yes`.
2. **SSH-Keys niemals in Repository committen.** Nur über Replit Secrets oder GitHub Secrets bereitstellen.
3. **`PLSK_KNOWN_HOSTS` aus vertrauenswürdiger Quelle befüllen** (nicht per ssh-keyscan in Produktion ohne Verifikation).
4. **Deploy nur von `main`-Branch.** Branch-Schutz ist in `deploy.sh` implementiert.
5. **Dry-Run vor erstem echten Deploy** immer testen.
6. **Lock-Datei** verhindert parallele Deploys (Race Conditions).
7. **Release-Marker** (`/.deploy_release`) erlaubt Rückverfolgung welcher Stand deployt ist.
8. **Keine Root-Pfade** als `PLSK_DEPLOY_PATH` erlaubt (Schutz in `validate_env.sh`).
9. **Logs enthalten keine Secret-Werte** — Skripte sind entsprechend aufgebaut.
10. **Zertifikate:** TLS-Ablauf aller Subdomains regelmäßig über Uptime-Kuma-Monitoring prüfen.

---

## Datei-Übersicht

| Datei | Zweck |
|---|---|
| `scripts/bootstrap_ssh.sh` | SSH-Runtime-Setup (Keys, known_hosts, Config) |
| `scripts/validate_env.sh` | Env-Variablen prüfen (ohne Secret-Ausgabe) |
| `scripts/deploy.sh` | Haupt-Deploy-Skript (rsync, Dry-Run, Lock) |
| `scripts/post_deploy_verify.sh` | Post-Deploy Health-Checks |
| `.github/workflows/deploy-plesk.yml` | GitHub-Actions-CI-Workflow |
| `docs/README_DEPLOY.md` | Dieses Runbook |

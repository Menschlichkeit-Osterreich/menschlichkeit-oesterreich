# Next Steps Plan – Menschlichkeit Österreich

**Typ:** Priorisierter Umsetzungsplan | **Stand:** 2026-03  
**Klassifikation:** INTERN – Nicht öffentlich

> Dieser Plan baut auf der Analyse in `docs/README_ANALYSIS.md` auf.  
> Führe **keine großen Änderungen** durch, bevor dieser Plan abgestimmt ist.

---

## 1. Sofortmaßnahmen (P0 — risikofrei, klein)

Diese Punkte können direkt und ohne Rücksprache umgesetzt werden:

### S1: VITE_GITHUB_TOKEN aus Frontend entfernen

**Problem:** `VITE_GITHUB_TOKEN` wird in den JS-Bundle eingebaut und ist für jeden Benutzer im Browser sichtbar.  
**Lösung:** Variable aus Vite-Konfiguration und Frontend-Code entfernen; GitHub-API-Calls über API-Backend proxen.  
**Aufwand:** Niedrig | **Risiko bei Nichtumsetzung:** Kritisch (Token-Leak)  

```bash
# Prüfen welche Dateien VITE_GITHUB_TOKEN nutzen:
grep -r "VITE_GITHUB_TOKEN" apps/website/src/ --include="*.ts" --include="*.tsx" -n
```

### S2: .gitignore — Ergänzung prüfen

Bereits erledigt (letzter Build). Kontrolle:

```bash
grep -E "deploy_release|moe_deploy|\.pem$|id_ed25519" .gitignore
```

### S3: Duplikat-Workflow identifizieren

```bash
# Prüfen ob plesk-deployment.yml ein Duplikat oder abweichend ist:
diff .github/workflows/plesk-deployment.yml .github/workflows/deploy-plesk.yml 2>/dev/null | head -30
```

---

## 2. Kurzfristige Maßnahmen (P0–P1 — zeitnah umsetzen)

### K1: VITE_ADMIN_EMAILS → JWT-Claim (P0, Sicherheitsarchitektur)

**Problem:**
```typescript
// apps/website/src/auth/AuthContext.tsx — aktuell
const adminList = (import.meta.env.VITE_ADMIN_EMAILS || '')
const isAdmin = !!(userEmail && adminList.includes(userEmail.toLowerCase()))
```

**Lösung:** JWT-Token enthält bereits `role`-Claim aus dem Backend (API hat volles RBAC).  
Frontend soll `role` direkt aus dem decodierten JWT lesen, nicht aus VITE_-Variable.

```typescript
// Zielzustand (nach Umstellung)
import { jwtDecode } from 'jwt-decode';
const decoded = jwtDecode<{ role: string }>(token);
const isAdmin = decoded.role === 'admin' || decoded.role === 'board';
```

**Voraussetzung:** API muss `role` im JWT-Payload ausstellen. RBAC-System ist bereits vorhanden.  
**Dateien:** `apps/website/src/auth/AuthContext.tsx`, `apps/api/app/` (JWT-Ausstellung prüfen)

### K2: Rollback-Skript erstellen (P1)

```bash
# scripts/rollback.sh — Zielstruktur
# Eingang: SERVICE, ROLLBACK_COMMIT oder ROLLBACK_TIMESTAMP
# Funktion: Letzten bekannten guten Stand per rsync einspielen
# Output: Klare Exit-Codes, kein Secret-Log
```

**Dateien:** `scripts/rollback.sh`

### K3: .env.example vereinheitlichen (P1)

Aktuelle Inkonsistenz beseitigen — alle Variablen auf `PLSK_`-Prefix standardisieren:

| Alt (.env.example) | Neu (Standard) |
|---|---|
| `PLESK_HOST` | `PLSK_HOST` |
| `SSH_PORT` | `PLSK_PORT` |
| `SSH_KEY` | `PLSK_SSH_KEY` |
| `PLESK_REMOTE_PATH` | `PLSK_DEPLOY_PATH` |

**Dateien:** `.env.example`, `.env.production.template`

### K4: CORS per ENV konfigurierbar (P1)

```python
# apps/api/app/main.py — Zielzustand
EXTRA_ORIGINS = os.getenv("CORS_EXTRA_ORIGINS", "").split(",")
ALLOWED_ORIGINS = ALLOWED_ORIGINS_PROD + [o for o in EXTRA_ORIGINS if o]
```

**Dateien:** `apps/api/app/main.py`

### K5: Duplikat-Workflow entfernen (P1)

Prüfen ob `.github/workflows/plesk-deployment.yml` ein Duplikat ist → ggf. archivieren oder löschen.

### K6: Monitoring-Stack starten (P1)

Docker Compose vorhanden, Stack noch nicht aktiv:

```bash
docker compose -f docker-compose.monitoring.yml up -d uptime-kuma
# Dann: Status-Page unter status.menschlichkeit-oesterreich.at konfigurieren
```

---

## 3. Mittelfristige Maßnahmen (P2 — planbar)

| # | Maßnahme | Datei(en) | Warum |
|---|---|---|---|
| M1 | Backup-Verifikationsskript | `scripts/verify_backup.sh` | Garantie für funktionierende Backups |
| M2 | Redis für Rate Limiting | `apps/api/app/security.py`, `docker-compose.yml` | State-Verlust bei Restart vermeiden |
| M3 | 51 Workflows konsolidieren | `.github/workflows/` | Wartbarkeit und Übersichtlichkeit |
| M4 | `scripts/safe-deploy.sh` archivieren | `scripts/safe-deploy.sh` | Fehlerhafte Abhängigkeit (`config/load-config.sh`) |
| M5 | Frontend-Unit-Tests erweitern | `apps/website/src/` | Absicherung vor Deploy |
| M6 | API-Tests automatisieren | `apps/api/` | pytest + GitHub Actions |
| M7 | DKIM/SPF/DMARC verifizieren | DNS-Konfiguration | E-Mail-Sicherheit |
| M8 | Plesk-Panel IP-Whitelist | Plesk-Konfiguration | Angriffsfläche reduzieren |

---

## 4. Reihenfolge mit Begründung

```
S1 (VITE_GITHUB_TOKEN)  → sofort, weil Token-Leak kritisch ist
   ↓
S3 (Duplikat prüfen)    → sofort, weil keine Änderung, nur Analyse
   ↓
K1 (JWT-Claim)          → danach, weil Sicherheitsarchitektur P0
   ↓
K3 (.env.example)       → parallel zu K1, weil Grundlage für Setup
   ↓
K2 (Rollback-Skript)    → nach K1, weil Deploy-Zyklus komplett sein sollte
   ↓
K4 (CORS per ENV)       → nach K3, weil beide API-seitig sind
   ↓
K5 (Duplikat entfernen) → nach S3-Analyse
   ↓
K6 (Monitoring starten) → danach, weil deploy-unabhängig
   ↓
M1–M8 (mittelfristig)   → nach Stabilisierung der P0/P1-Maßnahmen
```

**Begründung der Reihenfolge:**
1. Sicherheitskritisches zuerst (Token-Leaks, clientseitiger Admin-Check)
2. Konsistenz der Grundlagen (Variablennamen, CORS)
3. Betriebssicherheit (Rollback, Monitoring)
4. Technische Schulden (Konsolidierung, Tests)

---

## 5. Konkrete nächste Dateien

| Datei | Aktion | Priorität |
|---|---|---|
| `apps/website/src/auth/AuthContext.tsx` | JWT-Claim statt VITE_ADMIN_EMAILS | P0 |
| `apps/website/src/` (alle Dateien mit VITE_GITHUB_TOKEN) | Token entfernen | P0 |
| `.env.example` | Variable-Namen vereinheitlichen | P1 |
| `.env.production.template` | Variable-Namen vereinheitlichen | P1 |
| `apps/api/app/main.py` | CORS per ENV | P1 |
| `scripts/rollback.sh` | Neu erstellen | P1 |
| `.github/workflows/plesk-deployment.yml` | Prüfen → ggf. entfernen | P1 |

---

## 6. Konkrete nächste Kommandos

```bash
# === Sofortprüfungen (keine Änderungen) ===

# S1: VITE_GITHUB_TOKEN Verwendung prüfen
grep -rn "VITE_GITHUB_TOKEN" apps/website/src/

# S3: Duplikat-Workflow prüfen
wc -l .github/workflows/plesk-deployment.yml .github/workflows/deploy-plesk.yml
diff .github/workflows/plesk-deployment.yml .github/workflows/deploy-plesk.yml | head -20

# Env-Variablen-Konsistenz prüfen
grep -E "^PLSK_|^PLESK_|^SSH_KEY|^SSH_PORT" .env.example

# JWT-Ausstellung in der API prüfen: Enthält das Token 'role'?
grep -rn "role\|jwt\|encode\|create_token" apps/api/app/ --include="*.py" | grep -i "role\|jwt" | head -10

# Monitoring Status prüfen
docker compose -f docker-compose.monitoring.yml ps 2>/dev/null || echo "Docker nicht verfügbar oder Stack nicht gestartet"

# Deploy-Skripte Syntax prüfen (idempotent, sicher)
bash -n scripts/bootstrap_ssh.sh && echo "OK: bootstrap_ssh"
bash -n scripts/validate_env.sh  && echo "OK: validate_env"
bash -n scripts/deploy.sh        && echo "OK: deploy"
bash -n scripts/post_deploy_verify.sh && echo "OK: post_deploy_verify"
```

---

## 7. Offene Annahmen

| # | Annahme | Warum unklar | Auflösung |
|---|---|---|---|
| A1 | API stellt `role`-Claim im JWT aus | JWT-Ausstellungscode nicht vollständig geprüft | `grep -rn "encode\|role" apps/api/app/` |
| A2 | Replit Secrets sind unter `PLSK_`-Namen hinterlegt | Keine direkte Prüfung möglich | `validate_env.sh` ausführen |
| A3 | `plesk-deployment.yml` ist tatsächlich ein Duplikat | Nur Dateiname geprüft, nicht Inhalt | `diff` ausführen (Kommando oben) |
| A4 | Plesk-Server akzeptiert rsync via SSH | Kein Verbindungstest durchgeführt | `bootstrap_ssh.sh` + `ssh plesk-deploy "echo OK"` |
| A5 | `VITE_GITHUB_TOKEN` wird tatsächlich im Build eingebunden | Nur Import gesehen, nicht Verwendung vollständig | `grep -rn "VITE_GITHUB_TOKEN" apps/website/src/` |
| A6 | Docker läuft auf dem Replit-Host | Monitoring-Stack per `docker compose` | `docker info 2>&1 | head -5` |

---

## Abschluss-Checkliste (vor erstem Produktion-Deploy)

```
[ ] VITE_GITHUB_TOKEN aus Frontend entfernt
[ ] isAdmin nutzt JWT-Claim (nicht VITE_ADMIN_EMAILS)
[ ] validate_env.sh durchgelaufen ohne Fehler
[ ] bootstrap_ssh.sh durchgelaufen ohne Fehler
[ ] DRY_RUN=true scripts/deploy.sh erfolgreich
[ ] Echter Deploy von main-Branch
[ ] post_deploy_verify.sh: alle Checks grün
[ ] Uptime Kuma gestartet
[ ] Backup-Verifikation dokumentiert
[ ] CORS-Origins für Produktion korrekt
```

# Runbook: Service-Neustart

**Letztes Update**: 2026-03-08 | **Verwandte SOPs**: [Incident Response](../docs/operations/incident-response.md)

---

## Voraussetzungen

- Zugriff auf Repository-Root
- Docker installiert und läuft
- Für Plesk-Aktionen: SSH-Zugang oder Panel-Zugriff

---

## 1. Docker-Services (PostgreSQL, Redis, n8n)

```bash
# Alle Docker-Services neu starten:
npm run docker:restart

# Nur PostgreSQL:
docker-compose restart postgres

# Nur Redis:
docker-compose restart redis

# Nur n8n:
docker-compose restart n8n
# oder via npm:
npm run n8n:restart

# Status prüfen:
docker-compose ps
npm run status:check
```

**Nach Neustart immer:** `docker-compose ps` prüfen – alle Container müssen `Up (healthy)` zeigen.

---

## 2. FastAPI (API Service)

Hinweis: Die Abschnitte unter "Lokal" beschreiben Repository-Pfade und Dev-Kommandos. Die Abschnitte unter "Produktion (Plesk)" beschreiben ausschliesslich Laufzeitpfade auf dem Server und sind keine lokalen Arbeitsverzeichnisse.

### Lokal (Entwicklung)

```bash
# Prozess beenden und neu starten:
npm run dev:api
```

### Produktion (Plesk)

Der Produktionsvertrag nutzt ausschliesslich die kanonische Secret-Familie `PLESK_*`:

- `PLESK_HOST`, `PLESK_USER`, `PLESK_PORT`, `PLESK_SSH_PRIVATE_KEY`, `PLESK_KNOWN_HOSTS`
- `SSH_*` ist deprecated und wird fuer Deploy oder Restart nicht unterstuetzt.
- `PLESK_KNOWN_HOSTS` muss eine vollstaendige OpenSSH-`known_hosts`-Zeile sein, z. B. `hostname ssh-ed25519 <public-host-key>`. Ein reiner Hostname ist ungueltig.
- `API_REMOTE_PATH` ist der Plesk-Chroot-Pfad der API, im Workflow standardmaessig `subdomains/api/httpdocs`.

```bash
# Mit bash ausfuehren, nicht mit sh.
set -euo pipefail

# Lokal: PLESK_* muss bereits gesetzt sein.
API_REMOTE_PATH="${API_REMOTE_PATH:-subdomains/api/httpdocs}"
for required in PLESK_HOST PLESK_USER PLESK_PORT PLESK_SSH_PRIVATE_KEY PLESK_KNOWN_HOSTS; do
  [ -n "${!required:-}" ] || {
    echo "FEHLER: ${required} fehlt"
    exit 1
  }
done
[[ "$PLESK_PORT" =~ ^[0-9]+$ ]] || {
  echo "FEHLER: PLESK_PORT ist nicht numerisch"
  exit 1
}
[[ "$PLESK_KNOWN_HOSTS" =~ ^[^[:space:]]+[[:space:]]+(ssh-ed25519|ecdsa-sha2-nistp256)[[:space:]]+[A-Za-z0-9+/=]+$ ]] || {
  echo "FEHLER: PLESK_KNOWN_HOSTS ist keine vollstaendige known_hosts-Zeile"
  exit 1
}

SSH_KEY_FILE="$(mktemp)"
SSH_KNOWN_HOSTS_FILE="$(mktemp)"
cleanup_ssh_files() {
  rm -f "$SSH_KEY_FILE" "$SSH_KNOWN_HOSTS_FILE"
}
trap cleanup_ssh_files EXIT

printf '%s\n' "$PLESK_SSH_PRIVATE_KEY" | tr -d '\r' > "$SSH_KEY_FILE"
chmod 600 "$SSH_KEY_FILE"
printf '%s\n' "$PLESK_KNOWN_HOSTS" > "$SSH_KNOWN_HOSTS_FILE"
chmod 600 "$SSH_KNOWN_HOSTS_FILE"

SSH_OPTS=(
  -p "$PLESK_PORT"
  -i "$SSH_KEY_FILE"
  -o IdentitiesOnly=yes
  -o BatchMode=yes
  -o StrictHostKeyChecking=yes
  -o UserKnownHostsFile="$SSH_KNOWN_HOSTS_FILE"
)

ssh "${SSH_OPTS[@]}" "${PLESK_USER}@${PLESK_HOST}" "API_PATH='${API_REMOTE_PATH}' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "FEHLER: $1"
  exit 1
}

cd "$API_PATH" || fail "API_REMOTE_PATH nicht erreichbar"
API_ABS_PATH="$(pwd -P)"

INTERPRETER_FILE="$API_ABS_PATH/.deploy_python_interpreter"
[ -s "$INTERPRETER_FILE" ] || fail ".deploy_python_interpreter fehlt oder ist leer"

PYTHON="$(sed -n '1p' "$INTERPRETER_FILE")"
[ -n "$PYTHON" ] || fail "Gespeicherter Python-Interpreter ist leer"
[ -x "$PYTHON" ] || fail "Gespeicherter Python-Interpreter ist nicht ausfuehrbar"
"$PYTHON" --version >/dev/null
"$PYTHON" -m pip --version >/dev/null
"$PYTHON" -m uvicorn --version >/dev/null

pkill -f 'uvicorn app.main:app' || true
sleep 1
nohup "$PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --log-level warning >/dev/null 2>&1 &

for _ in 1 2 3 4 5; do
  pgrep -f 'uvicorn app.main:app' >/dev/null 2>&1 && break
  sleep 1
done
pgrep -f 'uvicorn app.main:app' >/dev/null 2>&1 || fail "uvicorn-Prozess nach Restart nicht gefunden"

if command -v ss >/dev/null 2>&1; then
  ss -ltn | awk '{print $4}' | grep -Eq '(^|:)8001$' || fail "Port 8001 ist nicht im LISTEN-Status"
elif command -v lsof >/dev/null 2>&1; then
  lsof -nP -iTCP:8001 -sTCP:LISTEN >/dev/null 2>&1 || fail "Port 8001 ist nicht im LISTEN-Status"
elif command -v netstat >/dev/null 2>&1; then
  netstat -ltn | awk '{print $4}' | grep -Eq '(^|:)8001$' || fail "Port 8001 ist nicht im LISTEN-Status"
else
  echo "Kein Port-Prueftool vorhanden; der externe Health-/Readiness-Check entscheidet hart."
fi
REMOTE

EXPECTED_COMMIT="<commit-kurzsha>"
ssh "${SSH_OPTS[@]}" "${PLESK_USER}@${PLESK_HOST}" "API_PATH='${API_REMOTE_PATH}' EXPECTED_COMMIT='commit=${EXPECTED_COMMIT}' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "FEHLER: $1"
  exit 1
}

cd "$API_PATH" || fail "API_REMOTE_PATH nicht erreichbar"
API_ABS_PATH="$(pwd -P)"
RELEASE_FILE="$API_ABS_PATH/.deploy_release"
[ -s "$RELEASE_FILE" ] || fail ".deploy_release fehlt oder ist leer"
grep -Fq "$EXPECTED_COMMIT" "$RELEASE_FILE" || fail ".deploy_release enthaelt nicht den erwarteten Commit"
REMOTE

# Kein alternativer SSH_*- oder Panel-spezifischer Restart-Pfad ist Teil dieses Vertrags.
```

**Health und Readiness nach Neustart:**

Diese Snippets muessen mit `bash` ausgefuehrt werden, nicht mit `sh`.

```bash
# Mit bash ausfuehren, nicht mit sh.
verify_api_endpoint() {
  endpoint="$1"
  deadline=$((SECONDS + 30))

  while [ "$SECONDS" -lt "$deadline" ]; do
    remaining=$((deadline - SECONDS))
    curl_timeout=5
    if [ "$remaining" -lt "$curl_timeout" ]; then
      curl_timeout="$remaining"
    fi
    if [ "$curl_timeout" -lt 1 ]; then
      break
    fi

    body_file="$(mktemp)"
    http="$(curl --silent --show-error --max-time "$curl_timeout" \
      --output "$body_file" \
      --write-out "%{http_code}" \
      "https://api.menschlichkeit-oesterreich.at${endpoint}" 2>/dev/null || true)"
    body_compact="$(tr -d '\r\n\t ' < "$body_file" || true)"
    body_lower="$(tr '[:upper:]' '[:lower:]' < "$body_file" || true)"
    rm -f "$body_file"

    if [ -n "$body_compact" ] &&
       [[ "$body_lower" =~ (unhealthy|error|failed|unavailable|not[[:space:]_-]*ready|\"ready\"[[:space:]]*:[[:space:]]*false|ready[[:space:]]*:[[:space:]]*false|\"ok\"[[:space:]]*:[[:space:]]*false|ok[[:space:]]*:[[:space:]]*false|\"status\"[[:space:]]*:[[:space:]]*\"?(error|failed|unavailable)|status[[:space:]]*:[[:space:]]*\"?(error|failed|unavailable)) ]]; then
      echo "FEHLER: ${endpoint} meldet negatives Health-/Readiness-Signal"
      exit 1
    fi

    if [[ "$http" =~ ^[23][0-9][0-9]$ ]] &&
       [ -n "$body_compact" ] &&
       [[ "$body_lower" =~ (\{|\[|\"status\"|status|ok|healthy|ready|live|true) ]]; then
      echo "OK: ${endpoint} HTTP ${http}"
      return 0
    fi

    remaining=$((deadline - SECONDS))
    if [ "$remaining" -gt 2 ]; then
      sleep 2
    elif [ "$remaining" -gt 0 ]; then
      sleep "$remaining"
    fi
  done

  echo "FEHLER: ${endpoint} nach 30 Sekunden nicht erfolgreich"
  exit 1
}

verify_api_endpoint /healthz
verify_api_endpoint /readyz
```

---

## 3. Frontend (Vite/React)

### Lokal

```bash
# Dev-Server neu starten:
npm run dev:frontend
```

### Produktion

Frontend ist statisch gebaut – kein Prozess zum Neustarten.

```bash
# Bei Deployment-Problemen: neu deployen
npm run build:frontend
# Dann via deploy-skript oder rsync zu Plesk
```

---

## 4. CRM (Drupal + CiviCRM)

Hinweis: `crm.menschlichkeit-oesterreich.at` ist hier ein Plesk-Domain-Kontext. Fuer lokale Entwicklung im Repository gilt weiterhin der Source-Pfad `apps/crm/`.

### Lokal

```bash
npm run dev:crm
```

### Produktion (PHP-Prozesse)

Drupal läuft als PHP-FPM oder via Apache. Neustart via Plesk:

1. Plesk → Domains → crm.menschlichkeit-oesterreich.at
2. PHP-FPM Pool → Restart

```bash
# Via SSH (wenn PHP-FPM):
sudo systemctl restart php8.1-fpm
# oder Plesk CLI:
plesk sbin php_handler --list
```

**Cache leeren nach Neustart:**

```bash
drush cr    # Drupal Cache rebuild
```

---

## 5. Alle Services auf einmal

```bash
# 1. Docker-Services:
npm run docker:down
npm run docker:up

# 2. Warten bis DB healthy (~15s):
sleep 15
docker-compose ps

# 3. Lokale Dev-Services:
npm run dev:all

# 4. Status-Check:
npm run status:check
```

---

---

## Eskalation

Wenn Neustart nicht hilft nach 2 Versuchen:

1. Logs sichern: `docker-compose logs > /tmp/service-logs-$(date +%Y%m%d).txt`
2. [Incident Response](../docs/operations/incident-response.md) starten
3. Backup-Restore prüfen: [Backup & Restore](../docs/operations/backup-restore.md)

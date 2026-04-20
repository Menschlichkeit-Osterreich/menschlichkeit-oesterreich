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

### Lokal (Entwicklung)

```bash
# Prozess beenden und neu starten:
npm run dev:api
```

### Produktion (Plesk)

```bash
# Via SSH auf dem Server:
cd /var/www/vhosts/api.menschlichkeit-oesterreich.at
source venv/bin/activate
pkill -f "uvicorn app.main:app" || true
nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 &

# Oder via Plesk → Domains → api.menschlichkeit-oesterreich.at → Python
```

**Healthcheck nach Neustart:**

```bash
curl -f https://api.menschlichkeit-oesterreich.at/health
# Erwartung: {"status": "ok"}
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

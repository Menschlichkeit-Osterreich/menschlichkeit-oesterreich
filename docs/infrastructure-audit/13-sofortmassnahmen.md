# 13 – Sofortmaßnahmen nach Priorität

**Stand**: 2026-03-09

---

## P0 – Kritisch (≤24 Stunden)

### P0-1: Alle exponierten Credentials sofort rotieren

**Betroffene Systeme**: n8n, Redis, MariaDB (n8n-User)
**Warum**: Diese Credentials waren im Git-Repository committed (verifiziert). Git-History enthält sie weiterhin.

```
Schritt 1: n8n Admin-Passwort
  → n8n-Panel aufrufen (https://n8n.menschlichkeit-oesterreich.at)
  → Settings → Users → Passwort auf zufälliges 24-Zeichen-Passwort setzen
  → Neues Passwort in SOPS / GitHub Secrets hinterlegen

Schritt 2: Redis-Passwort
  → Neues Redis-Passwort generieren (pwgen -s 32 1)
  → docker-compose oder n8n-Konfiguration aktualisieren
  → Container neu starten: docker compose restart redis
  → Neues Passwort in SOPS hinterlegen

Schritt 3: MariaDB n8n-User
  → SSH auf Server: mysql -u root -p
  → ALTER USER 'n8n_user'@'localhost' IDENTIFIED BY '[NEUES_PW]';
  → FLUSH PRIVILEGES;
  → n8n DB-Verbindungs-String aktualisieren

Schritt 4: Git-History bereinigen (falls Repo öffentlich)
  → git filter-repo --path automation/n8n/.env.example --invert-paths
  → git push --force-with-lease origin main
  → GitHub: Settings → Security → Secret scanning: Enable

Schritt 5: Verification
  → grep -r "MenschlichkeitOesterreich2025" . → 0 Treffer
  → grep -r "n8n_secure_moe_2025" . → 0 Treffer
  → n8n-Login mit neuem Passwort testen
```

**Zeitschätzung**: 2–3 Stunden
**Verantwortlich**: System-Administrator (peter.schuller@)

---

### P0-2: Redis --requirepass in Produktion verifizieren

**Status**: Fix in `docker-compose.prod.yml` angewendet.

```bash
# Verifizieren:
docker exec menschlichkeit-redis-prod redis-cli -a "${REDIS_PASSWORD}" ping
# Erwartete Ausgabe: PONG

# Ohne Passwort darf kein Zugriff möglich sein:
docker exec menschlichkeit-redis-prod redis-cli ping
# Erwartete Ausgabe: NOAUTH Authentication required
```

**Zeitschätzung**: 30 Minuten
**Verantwortlich**: DevOps

---

### P0-3: S3-Backup-Fix verifizieren (docker-compose.prod.yml)

**Status**: YAML-Bug behoben (doppelter environment-Key entfernt).

```bash
# Container neu starten:
docker compose -f docker-compose.prod.yml up -d redis_backup

# Backup-Skript manuell ausführen:
docker exec menschlichkeit-redis-backup /backup.sh

# S3-Upload prüfen:
aws s3 ls s3://[BUCKET]/redis-backups/ --endpoint-url [S3_ENDPOINT]
```

**Zeitschätzung**: 1 Stunde
**Verantwortlich**: DevOps

---

## P1 – Hoch (≤1 Woche)

### P1-1: Fehlende Mailboxen anlegen (überfällig seit KW43/2025)

```
Plesk → Mail → E-Mail-Adressen → Erstellen

1. noreply@menschlichkeit-oesterreich.at
   Typ: Mailbox (kein IMAP-Eingang empfohlen)
   Quota: 500 MB

2. support@menschlichkeit-oesterreich.at
   Typ: Mailbox
   Quota: 5 GB

3. security@menschlichkeit-oesterreich.at
   Typ: Mailbox
   Quota: 2 GB
   Hinweis: GPG-Schlüssel veröffentlichen für verschlüsselte Reports

4. admin@menschlichkeit-oesterreich.at
   Typ: Mailbox
   Quota: 2 GB

5. newsletter@menschlichkeit-oesterreich.at
   Typ: Mailbox
   Quota: 2 GB

6. automation@menschlichkeit-oesterreich.at (n8n SMTP)
   Typ: Mailbox
   Quota: 1 GB

7. devops@menschlichkeit-oesterreich.at
   Typ: Weiterleitung → peter.schuller@

8. dmarc-reports@menschlichkeit-oesterreich.at
   Typ: Mailbox (DMARC-Reports)
   Quota: 500 MB
```

**Zeitschätzung**: 1–2 Stunden
**Verantwortlich**: System-Administrator

---

### P1-2: Uptime Kuma deployen

```bash
# Monitoring-Stack starten:
docker compose -f docker-compose.monitoring.yml up -d uptime-kuma

# Erste Einrichtung:
# → http://[Server-IP]:3001
# → Admin-Account anlegen
# → Alle 13 Monitore aus docs/infrastructure-audit/08-monitoring-architektur.md eintragen
# → E-Mail-Alerting: admin@menschlichkeit-oesterreich.at
# → Status-Page für status.menschlichkeit-oesterreich.at anlegen
```

**Zeitschätzung**: 2–3 Stunden
**Verantwortlich**: DevOps

---

### P1-3: DMARC Phase 1 setzen (DNS)

```dns
; In Plesk DNS-Verwaltung:
_dmarc.menschlichkeit-oesterreich.at IN TXT "v=DMARC1; p=none; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at; fo=1"
```

**Zeitschätzung**: 15 Minuten
**Verantwortlich**: System-Administrator

---

### P1-4: .nvmrc anlegen

```bash
echo "22" > /home/user/menschlichkeit-oesterreich/.nvmrc
```

**Zeitschätzung**: 5 Minuten

---

### P1-5: Datenbankwiderspruch klären

**Aktion**: Entscheidung treffen: MariaDB für alle Services oder PostgreSQL?
**Empfehlung**: Kurzfristig MariaDB behalten, ADR-001 schreiben, Alembic-Migrationen gegen MariaDB testen.

```bash
# Alembic gegen MariaDB testen:
cd apps/api
# DATABASE_URL auf MariaDB-Connection setzen:
DATABASE_URL=mysql+pymysql://api_user:password@localhost/moe_main alembic upgrade head
```

**Zeitschätzung**: 2–4 Stunden (inkl. Analyse)

---

## P2 – Mittel (≤1 Monat)

| Nr.   | Maßnahme                                                        | Zeitschätzung |
| ----- | --------------------------------------------------------------- | ------------- |
| P2-1  | Plesk Security-Header für alle Domains konfigurieren            | 2h            |
| P2-2  | Fail2ban: SSH + Plesk + Mail aktivieren                         | 1h            |
| P2-3  | MariaDB: Backup-User + Backup-Script deployen                   | 2h            |
| P2-4  | MariaDB: Service-isolierte Datenbanken anlegen (moe_n8n zuerst) | 2h            |
| P2-5  | Plesk Panel: 2FA für alle Admin-Accounts aktivieren             | 30min         |
| P2-6  | Plesk Panel: Port 8443 auf Admin-IPs beschränken                | 30min         |
| P2-7  | ModSecurity CRS in Detection-Mode aktivieren                    | 1h            |
| P2-8  | Prometheus + Grafana deployen (nach Uptime Kuma)                | 4h            |
| P2-9  | FastAPI: prometheus-fastapi-instrumentator einbauen             | 1h            |
| P2-10 | DMARC Reports analysieren → Phase 2 vorbereiten                 | 30min/Woche   |
| P2-11 | Nextcloud: Deployment planen und starten                        | 1 Tag         |

---

## P3 – Niedrig (nächstes Quartal)

| Nr.  | Maßnahme                                               |
| ---- | ------------------------------------------------------ |
| P3-1 | SBOM-Gate im Releaseprozess einbauen                   |
| P3-2 | OpenAPI-Drift-Test in CI                               |
| P3-3 | Zero-Downtime-Deployment (Symlink-Swap)                |
| P3-4 | Legacy-Verzeichnisse archivieren                       |
| P3-5 | ADRs für offene Entscheidungen schreiben               |
| P3-6 | OpenClaw Produktions-Deployment evaluieren             |
| P3-7 | ELK-Stack aktivieren oder durch Grafana Loki ersetzen  |
| P3-8 | Forum, Support, Voting-Systeme evaluieren und deployen |

---

## Überblick-Zeitplan

```
Woche 1 (sofort):
  Tag 1-2: P0-Credentials rotieren, Redis/Backup-Fix verifizieren
  Tag 3:   Mailboxen anlegen, DMARC Phase 1, .nvmrc
  Tag 4-5: Uptime Kuma deployen, DB-Widerspruch klären

Wochen 2-4:
  P2-Maßnahmen sequentiell abarbeiten
  Monitoring ausbauen (Prometheus/Grafana)
  Nextcloud Deployment starten

Monate 2-3:
  P3-Maßnahmen und Phase-2-Architektur (12-zielarchitektur.md)

Monat 3+:
  Quarterly Review: Nächster Audit-Termin 2026-06-09
```

---

## Verantwortlichkeiten

| Rolle                | Person                    | Verantwortlich für               |
| -------------------- | ------------------------- | -------------------------------- |
| System-Administrator | peter.schuller@           | P0-Credentials, Mailboxen, Plesk |
| DevOps               | (zu benennen)             | Monitoring, Deployment, Backup   |
| Security             | peter.schuller@ (interim) | security@, Audit-Review          |
| Datenschutz          | (zu benennen)             | DSGVO-Compliance                 |

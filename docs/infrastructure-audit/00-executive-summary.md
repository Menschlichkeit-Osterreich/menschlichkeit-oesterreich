# 00 – Executive Summary

**Menschlichkeit Österreich – Infrastruktur-Audit 2026-03**
**Vertraulich – Nur für technisches Leitungspersonal**

---

## Risiko-Dashboard

| Priorität | Anzahl Findings | Soforthandlungsbedarf |
|-----------|----------------|----------------------|
| 🔴 P0 – Kritisch | 3 | **Ja – innerhalb 24h** |
| 🟠 P1 – Hoch | 5 | Ja – innerhalb 1 Woche |
| 🟡 P2 – Mittel | 6 | Ja – innerhalb 1 Monat |
| 🟢 P3 – Niedrig | 4 | Geplant – nächstes Quartal |
| **Gesamt** | **18** | |

---

## P0-Findings (Sofortbedarf)

### P0-SECURITY-001 – Klartext-Credentials im öffentlichen Repository
**verifiziert** | Datei: `automation/n8n/.env.example`

Die Datei enthielt bis zu diesem Audit die folgenden Klartext-Credentials:
- `N8N_PASSWORD` – n8n Admin-Passwort
- `N8N_DB_PASSWORD` – Datenbankpasswort n8n
- `REDIS_PASSWORD` – Redis-Authentifizierungspasswort
- `PLESK_USER` – Plesk-Administrator-Benutzername

**Status**: Datei wurde in diesem Audit sanitisiert. **Alle betroffenen Passwörter müssen sofort rotiert werden**, da sie im Git-Verlauf verbleiben (git history). Rotation: Plesk → n8n-Panel, Redis, MariaDB.

**Fix**: Sanitisierung abgeschlossen. Git-History-Bereinigung via `git filter-repo` oder BFG Repo Cleaner empfohlen, falls Repo öffentlich.

### P0-INFRA-001 – Redis ohne Passwort-Authentifizierung in Produktion
**verifiziert** | Datei: `docker-compose.prod.yml`

Redis-Produktionscontainer lief ohne `--requirepass`, was unautorisierten Zugriff aus dem Docker-Netzwerk ermöglichte.

**Status**: Fix in diesem Audit angewendet. `REDIS_PASSWORD` wird jetzt erzwungen.

### P0-INFRA-002 – YAML-Bug: Doppelter environment-Key (redis_backup ignoriert S3-Konfiguration)
**verifiziert** | Datei: `docker-compose.prod.yml`

Docker ignoriert den ersten `environment:`-Block bei Duplikaten stillschweigend. S3-Backup-Credentials wurden nicht an den `redis_backup`-Container übergeben → Backups konnten nicht hochgeladen werden.

**Status**: Fix in diesem Audit angewendet. Beide Blöcke zu einem zusammengefasst.

---

## Top-5 Maßnahmen nach Audit

1. **Sofort**: Alle n8n/Redis/Plesk-Credentials rotieren (P0-SECURITY-001)
2. **Sofort**: Monitoring-Stack deployen — kein Uptime-Monitoring aktiv (P1-OPS-001)
3. **Diese Woche**: 8 fehlende Mailboxen anlegen — seit KW43/2025 offen (P1-MAIL-001)
4. **Diese Woche**: Node.js-Version in CI auf 22 korrigieren — bereits behoben, Deployment validieren (P1-CI-001)
5. **Diesen Monat**: MariaDB auf getrennte Service-User umstellen (P2-DB-001)

---

## Gesamtbewertung

| Bereich | Bewertung | Begründung |
|---------|-----------|------------|
| Security Posture | 🔴 Kritisch | Klartext-Secrets im Repo, Redis ungeschützt |
| CI/CD Reife | 🟡 Mittel | 52 Workflows, aber Node-Mismatch, kein SBOM-Gate |
| Monitoring | 🔴 Nicht vorhanden | Vollständig dokumentiert, aber nicht deployed |
| E-Mail-Konfiguration | 🟡 Mittel | SPF/DKIM vorhanden, 8 Mailboxen fehlen |
| Datenbankarchitektur | 🟡 Mittel | Alle Services auf einer DB, kein Least Privilege |
| Dokumentation | 🟢 Gut | Umfangreiche docs/, Runbooks vorhanden |
| DSGVO/PII | 🟢 Gut | PII-Sanitizer in FastAPI implementiert |
| Secrets Management | 🟠 Ausbaufähig | SOPS vorhanden, n8n-Ausnahme kritisch |

---

## Zielarchitektur-Kurzdarstellung

**Ist**: Single-Server Plesk-Hosting, MariaDB, rsync-Deployment, kein Monitoring.

**Soll** (12 Monate):
- Reverse Proxy: Nginx/Cloudflare mit WAF und Rate Limiting
- Container-basiertes Deployment (Docker Compose → schrittweise Kubernetes-Migration optional)
- Monitoring: Uptime Kuma (extern) + Prometheus/Grafana (intern)
- MariaDB: Service-isolierte Datenbanken mit Least-Privilege-Usern
- Nextcloud: Produktiv unter `cloud.menschlichkeit-oesterreich.at`
- Secrets: 100% SOPS/Vault, kein Klartext in Repo oder Logs
- CI/CD: SBOM-Gate, Node.js-Konsistenz, automatisierte Rollbacks

Detailplanung: [12-zielarchitektur.md](./12-zielarchitektur.md)

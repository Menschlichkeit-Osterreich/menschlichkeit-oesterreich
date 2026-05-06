# 02 – Kritische Risiken

**Stand**: 2026-03-09

---

## Risikomatrix

```
IMPACT    │ Niedrig │ Mittel  │ Hoch    │ Kritisch
──────────┼─────────┼─────────┼─────────┼─────────
Sehr hoch │  P3     │  P2     │  P1     │  P0
Hoch      │  P3     │  P2     │  P1     │  P1
Mittel    │  P3     │  P3     │  P2     │  P1
Niedrig   │  P3     │  P3     │  P3     │  P2
```

---

## P0 – Kritisch (Sofortmaßnahme ≤24h)

### P0-SECURITY-001 – Klartext-Credentials im Git-Repository

| Attribut | Wert |
|----------|------|
| Datei | `automation/n8n/.env.example` |
| Quelle | verifiziert |
| Likelihood | Sehr hoch (Datei war committed) |
| Impact | Kritisch (vollständiger Systemzugriff möglich) |
| OWASP | A02:2021 – Cryptographic Failures |

**Betroffene Credentials** (sanitisiert in diesem Audit):
- n8n Admin-Passwort (N8N_PASSWORD)
- n8n Datenbankpasswort (N8N_DB_PASSWORD)
- Redis-Authentifizierungspasswort (REDIS_PASSWORD)
- Plesk-Benutzername (PLESK_USER – kein Passwort, aber Account-Enumeration möglich)

**Risiko**: Ein Angreifer mit Lesezugriff auf das Repository (öffentlich oder kompromittiertes GitHub-Konto) kann:
- n8n-Administratorzugang übernehmen
- MariaDB-Datenbankzugang für n8n eskalieren
- Redis-Zugang für Cache-Manipulation oder Datenexfiltration nutzen
- Plesk-Benutzername für gezielte Brute-Force-Angriffe verwenden

**Status**: Datei sanitisiert. Git-History enthält noch die alten Werte.

**Maßnahmen**:
1. Alle betroffenen Passwörter sofort rotieren (n8n-Panel, MariaDB, Redis)
2. Falls Repo öffentlich: `git filter-repo --path automation/n8n/.env.example --invert-paths` + Force-Push
3. GitHub → Settings → Security → Secret scanning aktivieren
4. Neue Werte ausschließlich via SOPS oder GitHub Secrets verwalten

---

### P0-INFRA-001 – Redis ohne Passwort-Authentifizierung

| Attribut | Wert |
|----------|------|
| Datei | `docker-compose.prod.yml` (vor Audit) |
| Quelle | verifiziert |
| Likelihood | Hoch (Docker-interne Netzwerke sind flach) |
| Impact | Kritisch (Datenmanipulation, Session-Hijacking) |
| CWE | CWE-306: Missing Authentication |

**Risiko**: Jeder Container im selben Docker-Netzwerk (`menschlichkeit-prod`) konnte ohne Authentifizierung auf Redis zugreifen. Redis speichert Sessions und Caches. Bei einer Container-Escape-Vulnerability oder kompromittiertem Container ist der gesamte Session-Store exponiert.

**Status**: Fix angewendet (`--requirepass ${REDIS_PASSWORD:?}`).

---

### P0-INFRA-002 – YAML-Duplikationsbugs (S3-Backups funktionieren nicht)

| Attribut | Wert |
|----------|------|
| Datei | `docker-compose.prod.yml` (vor Audit) |
| Quelle | verifiziert |
| Likelihood | Sicher (YAML-Semantik: letzter Schlüssel gewinnt) |
| Impact | Hoch (Backups schlagen still fehl, Datenverlust bei Incident) |
| CWE | CWE-1164: Irrelevant Code |

**Risiko**: Der `redis_backup`-Service hatte zwei `environment:`-Blöcke. Docker verarbeitete nur den zweiten (SMTP-Einstellungen). S3-Credentials wurden nie übergeben → Backup-Skript konnte sich nicht zu S3 authentifizieren → keine Off-Server-Backups.

**Status**: Fix angewendet (beide Blöcke zusammengefasst).

---

## P1 – Hoch (Maßnahme ≤1 Woche)

### P1-CI-001 – Node.js-Versionsmismatch in CI/CD

| Attribut | Wert |
|----------|------|
| Datei | `.github/workflows/deploy-plesk.yml` (vor Audit) |
| Quelle | verifiziert |
| Likelihood | Sicher (node-version: "20" war hartcodiert) |
| Impact | Hoch (Build-Fehler in Produktion, npm-Inkompatibilität) |

**Details**: `package.json` definiert `engines.node: ">=22.19.0"`. Deploy-Workflow verwendete Node.js 20 → potentielle Inkompatibilität mit nativen Modulen, Syntax-Features oder npm-Lockfile-Version.

**Status**: Fix angewendet (`node-version: "22"`).

---

### P1-OPS-001 – Monitoring vollständig nicht deployed

| Attribut | Wert |
|----------|------|
| Quelle | verifiziert (docs/operations/monitoring.md: alle TODOs unchecked) |
| Likelihood | Sicher |
| Impact | Hoch (kein Incident-Alert, SLO-Verletzungen unbemerkt) |

**Details**: 13 Monitor-Einträge sind dokumentiert, aber kein Monitoring-Tool ist deployed. Ausfall von Website, API, CRM, n8n würde nicht automatisch gemeldet. Kein TLS-Ablauf-Monitoring.

**Maßnahmen**: Uptime Kuma deployen (Docker Compose in diesem Audit bereitgestellt).

---

### P1-MAIL-001 – 8 Mailboxen seit Oktober 2025 nicht angelegt

| Attribut | Wert |
|----------|------|
| Quelle | verifiziert (MAILBOXEN-ERSTELLUNG-PLESK.md: P1-HIGH, KW43/2025) |
| Deadline | War: KW43/2025 (überfällig um ~20 Wochen) |
| Impact | Hoch (security@, support@, noreply@ fehlen) |

**Fehlende kritische Adressen**: `security@` (kein Kanal für Vulnerability-Reports), `noreply@` (Transaktionsmails kommen von falscher Adresse), `support@` (kein Ticketing-Eingang).

---

### P1-DB-001 – MariaDB vs. PostgreSQL Architekturwiderspruch

| Attribut | Wert |
|----------|------|
| Quelle | verifiziert |
| Impact | Hoch (Migrations-Fehler, Datenverlust-Risiko) |

**Details**: Alembic-Migrationen und Prisma-Schema sind für PostgreSQL entwickelt. MariaDB in Produktion hat andere SQL-Dialekt-Features (z.B. kein `RETURNING`, andere JSON-Funktionen, andere Auto-Increment-Syntax). Migrationen wurden möglicherweise nie gegen MariaDB getestet.

**Empfehlung**: Klare Entscheidung: Entweder MariaDB-kompatible Migrationen schreiben oder PostgreSQL auch in Produktion verwenden.

---

### P1-REPO-001 – Dual-Verzeichnisstruktur ohne Sync-Mechanismus

| Attribut | Wert |
|----------|------|
| Quelle | verifiziert |
| Impact | Mittel–Hoch (Deployment-Inkonsistenzen) |

**Details**: `docker-compose.prod.yml` referenziert Legacy-Pfad `api.menschlichkeit-oesterreich.at/app`. `deploy-plesk.yml` deployt aus `apps/api/`. Änderungen im modernen Pfad werden möglicherweise nicht in Docker verwendet und umgekehrt.

---

## P2 – Mittel (Maßnahme ≤1 Monat)

### P2-DB-001 – Keine Datenbankisolation zwischen Services

Alle Services teilen wahrscheinlich eine MariaDB-Instanz ohne separate Datenbanken oder Least-Privilege-User. → Kompromittierung eines Services gefährdet alle Daten.

### P2-SEC-001 – Plesk-Panel direkt über IP auf Port 8443 erreichbar

Port 8443 sollte nicht öffentlich erreichbar sein. Empfehlung: IP-Allowlist oder SSH-Tunnel.

### P2-SEC-002 – XOVI SEO Toolkit – DSGVO-Prüfung ausstehend

Externe API-Verbindungen an XOVI-Server. Welche Daten werden übertragen? Ist ein Auftragsverarbeitungsvertrag vorhanden?

### P2-OPS-001 – Kein Zero-Downtime-Deployment

rsync überschreibt Produktionsverzeichnis direkt. Kein Blue-Green, kein Canary. Deployment = Downtime-Fenster.

### P2-OPS-002 – ELK-Stack definiert aber nicht produktiv

`automation/elk-stack/` vorhanden, aber Produktionsstatus unklar. Log-Aggregation und Alerting fehlen.

### P2-CLOUD-001 – Nextcloud nicht deployed

Geplant unter `cloud.menschlichkeit-oesterreich.at`, aber kein Deployment, keine Konfiguration im Repo.

---

## P3 – Niedrig (nächstes Quartal)

### P3-CI-001 – SBOM nicht im Regel-Release-Gate

SBOM wird generiert, aber kein automatischer Abbruch bei kritischen Schwachstellen im Release-Prozess.

### P3-DOC-001 – OpenAPI-Spec möglicherweise veraltet

`openapi.yaml` muss manuell synchron gehalten werden. Kein Drift-Test im CI.

### P3-PERF-001 – Kein CDN/Edge-Caching

Statische Assets werden direkt vom Plesk-Server ausgeliefert. Kein Cloudflare oder ähnliches CDN.

### P3-ARCH-001 – OpenClaw ohne Produktions-Deployment

Sechs-Agenten-System (NATS + Qdrant + PostgreSQL) vollständig definiert aber nicht produktiv deployed.

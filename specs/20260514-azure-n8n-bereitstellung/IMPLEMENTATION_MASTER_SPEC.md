# IMPLEMENTATION_MASTER_SPEC: Azure n8n Produktionspfad Phase 1-2-3

**Dokument**: Kanonische Implementierungsspezifikation für `n8n.menschlichkeit-oesterreich.at` auf Azure
**Status**: Implementation Readiness
**Datum**: 2026-05-18
**Geltungsbereich**: Abnahmevorbereitung bis zur Go/No-Go-Entscheidung

---

## EBENE A — Governance Spec (stabil, ändert sich selten)

### Zielarchitektur

**Zielplattform**: Azure VM mit Docker Compose
**Betriebsmodus**: Single-Main (Queue nur mit Zusatzvertrag)
**Erstzielhost**: `n8n.menschlichkeit-oesterreich.at`

### Sicherheitsregeln (unverletzbar)

- Oeffentlich offen: nur `22`, `80`, `443`
- Nicht oeffentlich: `5678` (n8n), `5432` (PostgreSQL), `6379` (Redis, falls genutzt)
- SSH-only Zugriff, kein Passwort-Login
- Root-Login deaktiviert
- NSG und lokale Firewall konsistent

### Betriebsmodell

- **Startup-Modus**: Single-Main mit expliziter Dokumentation
- **Persistence**: PostgreSQL + Volume-Backup
- **Encryption**: `N8N_ENCRYPTION_KEY` als Pflicht vor Go
- **Monitoring**: Basis-Alerting auf VM-Ebene
- **Betriebsverantwortung**: explizite Rolle + Renewal-Owner

### Go-/No-Go-Kriterien

**Go**: wenn alle `go_live_blocker` Evidenz = `pass` haben
**No-Go**: wenn ein `go_live_blocker` Evidenz = `pending` oder `fail`

### Verantwortlichkeiten

| Rolle               | Task                             | Owner          |
| ------------------- | -------------------------------- | -------------- |
| Grant-/Billing      | Subscription, Kosten, Renewal    | _zu bestimmen_ |
| Azure-Infrastruktur | VM, IP, NSG, Disk                | _zu bestimmen_ |
| Netzwerk/DNS        | DNS-Zielroute, Abloesung Plesk   | _zu bestimmen_ |
| Runtime-Betrieb     | n8n, PostgreSQL, Backup/Restore  | _zu bestimmen_ |
| Sicherheit          | SSH-Hardening, Exposure, Secrets | _zu bestimmen_ |

### Abnahmevertrag

Jeder Gate-Punkt hat einen Evidenztyp und eine Blockerklasse (siehe Ebene C, Acceptance Gates).

---

## EBENE B — Technical Implementation Spec (das Wie)

### 1. Infrastruktur

#### Azure Resource Group

- Name: `menschlichkeit-n8n-prod` (oder ähnlich)
- Region: _zu definieren_ (Empfehlung: EU-central oder EU-west)
- Resource Tags:
  - `Project: Menschlichkeit-Oesterreich`
  - `Service: n8n`
  - `Environment: Production`
  - `Billing-Owner: *zu definieren*`

#### VM

- OS: Ubuntu 22.04 LTS (arm64 oder x86 je nach Verfügbarkeit)
- SKU: _zu dimensionieren_ (mindestens `Standard_B2s` oder ähnlich)
- Disk: 64 GB (root) + 256 GB (data)
- Admin-User: `n8n-admin` (nicht `root`)
- SSH-Key: ed25519, stored in Bitwarden/Secret-Management

#### Static Public IP

- Assigned to VM
- DNS Name: _optional, aber unterstützt_
- Lifecycle: Pinned (nicht freigeben bei VM-Stop)

#### NSG (Network Security Group)

```
Inbound Rules:
  Protocol: TCP, Source: 0.0.0.0/0, Dest Port: 22 (SSH)
    Action: Allow
  Protocol: TCP, Source: 0.0.0.0/0, Dest Port: 80 (HTTP)
    Action: Allow
  Protocol: TCP, Source: 0.0.0.0/0, Dest Port: 443 (HTTPS)
    Action: Allow

Outbound:
  Default: Allow (Internet egress required for n8n webhooks)

Explicit Deny (implicit):
  5678, 5432, 6379 - NOT accessible from 0.0.0.0/0
```

#### Disk Layout (nach VM-Deployment)

```
/
├── /home/n8n-admin/
│   └── .ssh/authorized_keys (from SSH-Key)
├── /opt/n8n/
│   ├── .env
│   ├── docker-compose.yml
│   ├── volumes/
│   │   ├── n8n-data/
│   │   └── postgres-data/
│   └── scripts/
│       ├── backup.sh
│       └── restore.sh
└── /var/log/n8n/
    ├── docker-compose.log
    └── n8n.log
```

### 2. Runtime

#### Docker Compose Setup

```yaml
version: '3.8'
services:
  reverse-proxy:
    image: nginx:latest
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /opt/n8n/nginx.conf:/etc/nginx/nginx.conf
      - /opt/n8n/ssl/:/etc/nginx/ssl/
    depends_on:
      - n8n
    restart: always

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - '5678:5678'
    environment:
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - N8N_HOST=${N8N_HOST}
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${DB_NAME}
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - TZ=${TZ}
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

volumes:
  n8n-data:
  postgres-data:
```

#### Pflicht-Umgebungsvariablen (.env)

```
# HTTPS
N8N_PROTOCOL=https
N8N_HOST=n8n.menschlichkeit-oesterreich.at
N8N_EDITOR_BASE_URL=https://n8n.menschlichkeit-oesterreich.at/
WEBHOOK_URL=https://n8n.menschlichkeit-oesterreich.at/webhook/

# Sicherheit
N8N_ENCRYPTION_KEY=<random-32-char-key>
TZ=Europe/Vienna

# Datenbank
DB_NAME=n8n_prod
DB_USER=n8n_user
DB_PASSWORD=<strong-password>
DB_HOST=postgres
DB_PORT=5432
```

### 3. Security

#### SSH-Hardening (ansible oder manual)

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
AllowUsers n8n-admin
Protocol 2
```

#### Fail2Ban Installation

```bash
apt install fail2ban
systemctl enable fail2ban
# Configure /etc/fail2ban/jail.local for SSH
```

#### UFW Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

#### Secret Rotation

- Schlüsselwechsel dokumentiert in Runbook
- Backup vor Änderung
- Mindestzyklus: 90 Tage

### 4. Operations

#### Deployment-Reihenfolge

1. Azure-Ressourcen (RG, VM, IP, NSG)
2. SSH-Setup und Hardening
3. Docker + Compose Installation
4. Verzeichnisstruktur + .env
5. Docker Compose Up (PostgreSQL, n8n, Reverse Proxy)
6. TLS-Zertifikat aktivieren
7. DNS-Umschaltung
8. Monitoring + Backup-Jobs starten
9. Restore-Test durchführen
10. Finale Akzeptanz-Checklist

#### Update-Prozess

- Backup vor jedem Update
- Update im Wartungsfenster (nachts/Wochenende)
- Monitoring des Update-Prozesses
- Sofortige Rollback-Bereitschaft

#### Rollback-Strategie

1. **VM-Level**: Snapshot vor Update aktivieren
2. **Datenbank**: Dump vor Update, Restore bei Fehler
3. **Secrets**: Backup vor Rotation
4. **DNS**: Alt-Zielroute dokumentieren, schnell umschalten

#### Monitoring

- VM CPU/Memory/Disk via Azure Monitor
- Container-Status via `docker ps`
- n8n-Logs auf `/var/log/n8n/`
- PostgreSQL Connection Pooling überwachen
- Webhook-Fehlerrate tracken

#### Log-Retention

- Docker Container Logs: 7 Tage lokal, S3/Blob älter
- Application Logs: 90 Tage
- Audit Logs: 1 Jahr

---

## EBENE C — Execution (Atomic Tasks)

### EPIC 1 — Azure Foundation

#### T1.1 — Azure Subscription verifizieren

**Input**: Azure-Zugriff, Subscription-ID
**Output**: Bestätigung: Subscription aktiv, Kosten-Management eingerichtet
**Nachweis**:

```bash
az account list --output table
az account show --query "{Name: name, ID: id, Type: type}"
```

**Erwartung**: Nonprofit/Educational Sponsorship oder aktiver Billing-Account
**Blocker**: Subscription inaktiv oder Billing fehlt → `provisioning_blocker`
**Owner**: Grant-/Billing-Verantwortlicher

#### T1.2 — Billing-Profil aktivieren

**Input**: Subscription
**Output**: Budget-Alerts konfiguriert, Cost-Management aktiv
**Nachweis**:

```bash
az costmanagement budget list --resource-group menschlichkeit-n8n-prod
```

**Erwartung**: Alert bei $100, $500, $1000/Monat
**Blocker**: Billing nicht nutzbar → `provisioning_blocker`
**Owner**: Billing-Admin

#### T1.3 — Resource Group erstellen

**Input**: Azure-Zugriff, Subscription, Region
**Output**: RG existiert, Tags gesetzt
**Befehl**:

```bash
az group create \
  --name menschlichkeit-n8n-prod \
  --location eastus \
  --tags Project=Menschlichkeit Service=n8n Environment=Production
```

**Blocker**: RG-Erstellung schlägt fehl → `provisioning_blocker`

#### T1.4 — Statische Public IP reservieren

**Input**: RG, Region
**Output**: IP-Adresse verfügbar und dokumentiert
**Befehl**:

```bash
az network public-ip create \
  --resource-group menschlichkeit-n8n-prod \
  --name n8n-public-ip \
  --sku Standard \
  --allocation-method Static
```

**Nachweis**: `az network public-ip show --resource-group menschlichkeit-n8n-prod --name n8n-public-ip`
**Blocker**: IP-Erstellung schlägt fehl → `provisioning_blocker`

#### T1.5 — NSG erstellen

**Input**: RG, IP
**Output**: NSG mit Regeln: 22, 80, 443 offen; Rest zu
**Befehl**:

```bash
az network nsg create \
  --resource-group menschlichkeit-n8n-prod \
  --name n8n-nsg
```

**Regeln hinzufügen** (lokal per Script oder CLI):

- SSH 22: Allow
- HTTP 80: Allow
- HTTPS 443: Allow
- Alles andere: Deny (implizit)

**Blocker**: NSG-Erstellung oder Regelsetzen schlägt fehl → `provisioning_blocker`

#### T1.6 — SSH-Keypair erzeugen

**Input**: Lokale Umgebung
**Output**: Private Key gesichert in Bitwarden, Public Key für VM
**Befehl**:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/menschlichkeit-n8n-prod -N ""
```

**Nachweis**: Private Key in Bitwarden Storage, Public Key in VM-Admin-User
**Blocker**: Key-Generierung schlägt fehl → `provisioning_blocker`

---

### EPIC 2 — VM Runtime

#### T2.1 — Ubuntu LTS VM deployen

**Input**: RG, NSG, Public IP, SSH-Public-Key
**Output**: VM läuft, SSH-Zugriff möglich
**Befehl**:

```bash
az vm create \
  --resource-group menschlichkeit-n8n-prod \
  --name n8n-vm \
  --image UbuntuLTS \
  --size Standard_B2s \
  --public-ip-sku Standard \
  --public-ip-address n8n-public-ip \
  --nsg n8n-nsg \
  --admin-username n8n-admin \
  --ssh-key-values ~/.ssh/menschlichkeit-n8n-prod.pub
```

**Nachweis**:

```bash
ssh -i ~/.ssh/menschlichkeit-n8n-prod n8n-admin@<public-ip> "uname -a"
```

**Erwartung**: SSH erfolgreich, Ubuntu LTS wird angezeigt
**Blocker**: VM-Erstellung oder SSH schlägt fehl → `provisioning_blocker`

#### T2.2 — Docker installieren

**Input**: VM, SSH-Zugriff
**Output**: Docker läuft, `docker ps` erfolgreich
**Script**:

```bash
ssh -i ~/.ssh/menschlichkeit-n8n-prod n8n-admin@<public-ip> << 'EOF'
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker n8n-admin
sudo systemctl enable docker
EOF
```

**Nachweis**:

```bash
ssh ... n8n-admin@<ip> "docker ps"
```

**Erwartung**: `CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES`
**Blocker**: Docker-Installation schlägt fehl → `provisioning_blocker`

#### T2.3 — Docker Compose installieren

**Input**: Docker, SSH-Zugriff
**Output**: `docker-compose` verfügbar
**Script**:

```bash
ssh ... n8n-admin@<ip> << 'EOF'
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
EOF
```

**Nachweis**: `docker-compose --version` zeigt Version
**Blocker**: Compose-Installation schlägt fehl → `provisioning_blocker`

#### T2.4 — UFW konfigurieren

**Input**: VM, SSH-Zugriff
**Output**: Firewall aktiv, nur 22/80/443 offen
**Script**:

```bash
ssh ... n8n-admin@<ip> << 'EOF'
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
EOF
```

**Nachweis**: `sudo ufw status` zeigt Rules
**Erwartung**:

```
22/tcp    ALLOW   Anywhere
80/tcp    ALLOW   Anywhere
443/tcp   ALLOW   Anywhere
```

**Blocker**: UFW aktiviert nicht → `go_live_blocker`

#### T2.5 — SSH härten

**Input**: VM, SSH-Zugriff
**Output**: sshd_config angepasst, Root-Login + Passwort deaktiviert
**Script**:

```bash
ssh ... n8n-admin@<ip> << 'EOF'
sudo tee /etc/ssh/sshd_config << 'SSHEOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
AllowUsers n8n-admin
Protocol 2
SSHEOF
sudo systemctl restart ssh
EOF
```

**Nachweis**: SSH-Neuverbindung funktioniert, Root-Login funktioniert nicht
**Blocker**: SSH-Hardening fehlt → `go_live_blocker`

---

### EPIC 3 — n8n Runtime

#### T3.1 — Verzeichnisstruktur erzeugen

**Input**: VM
**Output**: `/opt/n8n/` mit Subdirs existiert
**Script**:

```bash
ssh ... n8n-admin@<ip> << 'EOF'
sudo mkdir -p /opt/n8n/{volumes/{n8n-data,postgres-data},scripts}
sudo chown -R n8n-admin:n8n-admin /opt/n8n
EOF
```

**Blocker**: Verzeichniserstellung schlägt fehl → `provisioning_blocker`

#### T3.2 — .env erstellen

**Input**: Pflicht-Konfiguration
**Output**: `/opt/n8n/.env` mit allen Werten
**Manuelle Schritte**:

1. Random `N8N_ENCRYPTION_KEY` generieren
2. Strong DB-Password generieren
3. `.env` mit allen Werten erstellen
4. `.env` nach `/opt/n8n/.env` kopieren (nicht commiten!)

**Nachweis**:

```bash
ssh ... n8n-admin@<ip> "test -f /opt/n8n/.env && echo OK"
```

**Blocker**: `.env` fehlt oder unvollständig → `provisioning_blocker`

#### T3.3 — PostgreSQL konfigurieren

**Input**: Docker Compose, .env
**Output**: PostgreSQL läuft, Datenbank erstellt
**Script**:

```bash
cd /opt/n8n
docker-compose up -d postgres
docker-compose exec postgres psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();"
```

**Erwartung**: PostgreSQL-Version angezeigt
**Blocker**: PostgreSQL startet nicht → `provisioning_blocker`

#### T3.4 — n8n konfigurieren

**Input**: Docker Compose, PostgreSQL läuft
**Output**: n8n Container läuft, Editor erreichbar
**Script**:

```bash
cd /opt/n8n
docker-compose up -d n8n
docker-compose logs n8n
```

**Nachweis**:

```bash
curl -I http://localhost:5678
```

**Erwartung**: HTTP 200 oder 302 Redirect
**Blocker**: n8n startet nicht → `provisioning_blocker`

#### T3.5 — Reverse Proxy konfigurieren

**Input**: n8n läuft intern, nginx.conf vorbereitet
**Output**: Reverse Proxy läuft, http://localhost:80 → n8n:5678
**nginx.conf Template**:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://n8n:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Script**:

```bash
docker-compose up -d reverse-proxy
curl -I http://localhost:80
```

**Erwartung**: HTTP 200/302
**Blocker**: Reverse Proxy startet nicht → `provisioning_blocker`

#### T3.6 — HTTPS aktivieren

**Input**: Reverse Proxy läuft, DNS zeigt auf Azure-IP
**Output**: Zertifikat aktiv, HTTPS funktioniert
**Methode**: Let's Encrypt + Certbot (oder manuell je nach Setup)

**Script (Certbot)**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d n8n.menschlichkeit-oesterreich.at
sudo cp /etc/letsencrypt/live/n8n.menschlichkeit-oesterreich.at/fullchain.pem /opt/n8n/ssl/
sudo cp /etc/letsencrypt/live/n8n.menschlichkeit-oesterreich.at/privkey.pem /opt/n8n/ssl/
sudo chown n8n-admin /opt/n8n/ssl/*
```

**Nachweis**:

```bash
curl -I https://n8n.menschlichkeit-oesterreich.at
```

**Erwartung**: HTTP/2 200, Valid Certificate
**Blocker**: Zertifikat-Erstellung oder HTTPS-Verbindung schlägt fehl → `go_live_blocker`

---

### EPIC 4 — Persistence & Recovery

#### T4.1 — Backup-Script schreiben

**Input**: n8n läuft, PostgreSQL läuft
**Output**: `/opt/n8n/scripts/backup.sh` erstellt und getestet
**Script-Template**:

```bash
#!/bin/bash
BACKUP_DIR="/opt/n8n/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# DB Dump
docker-compose exec postgres pg_dump -U ${DB_USER} -d ${DB_NAME} > $BACKUP_DIR/db.sql

# n8n Data
tar czf $BACKUP_DIR/n8n-data.tar.gz /opt/n8n/volumes/n8n-data/

# .env (encrypted in transit)
cp /opt/n8n/.env $BACKUP_DIR/.env

# Upload to S3/Blob (optional, aber empfohlen)
# aws s3 cp $BACKUP_DIR s3://backup-bucket/n8n/ --recursive

echo "Backup completed: $BACKUP_DIR"
```

**Nachweis**: Backup-Datei existiert und kann manuell überprüft werden
**Blocker**: Backup-Script funktioniert nicht → `go_live_blocker`

#### T4.2 — DB-Dumps testen

**Input**: Backup-Script
**Output**: DB-Dump erfolgreich gelesen und Größe überprüft
**Script**:

```bash
/opt/n8n/scripts/backup.sh
ls -lh /opt/n8n/backups/*/db.sql
file /opt/n8n/backups/*/db.sql
```

**Erwartung**: Dump-Datei > 1 MB (abhängig vom tatsächlichen Datenvolumen)
**Blocker**: Dump-Fehler → `go_live_blocker`

#### T4.3 — Restore-Test durchführen

**Input**: Backup vorhanden, n8n läuft
**Output**: Datenbank erfolgreich aus Backup wiederhergestellt
**Schritte**:

1. Backup-DB-Dump nehmen
2. Container stoppen: `docker-compose stop n8n`
3. Restore: `docker-compose exec postgres psql ... < db.sql`
4. Container starten: `docker-compose start n8n`
5. n8n UI überprüfen: Daten sind wiederhergestellt

**Nachweis**: Restore-Logs + UI Check
**Blocker**: Restore schlägt fehl oder Daten nicht konsistent → `go_live_blocker`

#### T4.4 — Snapshot-Strategie dokumentieren

**Input**: Azure-Ressourcen, Backup-Auswahl
**Output**: Dokumentation: Snapshot-Frequenz, Aufbewahrung, Kosten
**Vorlage**:

```
Snapshot-Strategie für n8n-vm:

Tägliche Snapshots: 01:00 UTC
Aufbewahrung: 7 Tage
Wöchentliche: Sonntag 02:00 UTC
Aufbewahrung: 4 Wochen
Monatliche: 1. des Monats 03:00 UTC
Aufbewahrung: 12 Monate

Geschätzte Kosten: ~20 EUR/Monat (abh. von Größe)
Automation: Via Azure Automation oder Cron
```

**Blocker**: Kein dokumentierter Plan → `go_live_blocker`

---

### EPIC 5 — Acceptance

#### T5.1 — Port-Exposure prüfen

**Input**: VM läuft, NSG konfiguriert
**Output**: Nur 22/80/443 antworten; 5678/5432/6379 nicht erreichbar
**Nmap-Test** (von extern):

```bash
nmap -p 22,80,443,5678,5432,6379 <public-ip>
```

**Erwartung**:

```
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
5678/tcp closed
5432/tcp closed
6379/tcp closed
```

**Blocker**: Private Ports sind offen → `go_live_blocker`

#### T5.2 — Webhook-Test

**Input**: n8n läuft, HTTPS aktiv
**Output**: Webhook-URL antwortet
**Test**:

```bash
curl -X POST https://n8n.menschlichkeit-oesterreich.at/webhook/test -d '{"test": "data"}' -v
```

**Erwartung**: HTTP 200 oder 400 (je nach n8n-Konfiguration)
**Blocker**: Webhook nicht erreichbar → `go_live_blocker`

#### T5.3 — Persistence-Test

**Input**: n8n läuft, DB läuft, Backup funktioniert
**Output**: Daten persistieren über Container-Restart
**Schritte**:

1. Workflow erstellen und speichern in n8n UI
2. Container neustarten: `docker-compose restart n8n`
3. Workflow existiert noch nach Restart

**Blocker**: Daten verloren → `go_live_blocker`

#### T5.4 — Restart-Test

**Input**: Docker Compose, Restart-Policy `always`
**Output**: Container starten nach VM-Reboot automatisch
**Schritte**:

1. VM reboot: `sudo reboot`
2. Nach Reboot: `docker ps` zeigt alle Container läuft
3. `curl https://...` antwortet

**Blocker**: Container starten nicht automatisch → `go_live_blocker`

#### T5.5 — TLS-Test

**Input**: HTTPS läuft
**Output**: Zertifikat gültig, keine Warnings
**Test**:

```bash
openssl s_client -connect n8n.menschlichkeit-oesterreich.at:443 -servername n8n.menschlichkeit-oesterreich.at
curl -v https://n8n.menschlichkeit-oesterreich.at 2>&1 | grep -i "certificate"
```

**Erwartung**: Certificate is valid, not self-signed, no warnings
**Blocker**: Ungültiges oder selbstsigniertes Zertifikat → `go_live_blocker`

#### T5.6 — Finale Abnahme-Checklist

**Input**: Alle vorherigen Tests bestanden
**Output**: Abnahme-Checkliste unterzeichnet
**Checklist**:

- [ ] Azure-Ressourcen existieren und sind dokumentiert
- [ ] Grant-/Billing-Status geklärt
- [ ] SSH-Hardening aktiv
- [ ] Docker + Compose läuft
- [ ] n8n startet und läuft stabil
- [ ] PostgreSQL läuft, Daten persistent
- [ ] Reverse Proxy funktioniert
- [ ] HTTPS mit gültigem Zertifikat
- [ ] Port-Exposure korrekt (22/80/443 offen, Rest zu)
- [ ] Webhook-Test erfolgreich
- [ ] Restart-Test erfolgreich
- [ ] Backup-/Restore-Test erfolgreich
- [ ] Betriebsverantwortung eindeutig
- [ ] Dokumentation konsistent mit Live-Zustand

**Blocker**: Checklist nicht zu 100% → `go_live_blocker`

---

## Definition of Done (DoD)

Jeder Task muss diese Kriterien erfüllen:

### Functional Done

- [ ] Ziel erreicht (Output vorhanden)
- [ ] Nachweis durchgeführt und dokumentiert
- [ ] Blocker-Bedingungen geprüft

### Technical Done

- [ ] Code/Config ist versioniert oder dokumentiert
- [ ] Keine Secrets in Logs/Doku
- [ ] Performance/Größe akzeptabel
- [ ] Fehlerbehandlung implementiert

### Operational Done

- [ ] Rollback dokumentiert und testbar
- [ ] Monitoring aktiv
- [ ] Handover-Dokumentation aktuell
- [ ] Owner eindeutig benannt

### Communication Done

- [ ] Blocker/Risiken dokumentiert
- [ ] Abhängigkeiten auf Folgeworkflow geklärt
- [ ] Abweichungen vom Plan dokumentiert

---

## Acceptance Gates (Evidenzmatrix)

| Gate             | Evidence Type  | Status | Blocker Class | Next Action                          |
| ---------------- | -------------- | ------ | ------------- | ------------------------------------ |
| Grant-/Billing   | Primary Source | Open   | Provisioning  | Einholen von Sponsorship-Bestätigung |
| Azure-Ressourcen | Primary Source | Open   | Provisioning  | RG/VM/IP erstellen                   |
| SSH-Hardening    | Live Proof     | Open   | Go-Live       | Hardening-Script ausführen           |
| Port-Exposure    | Live Proof     | Open   | Go-Live       | NSG-Regeln prüfen                    |
| HTTPS            | Live Proof     | Open   | Go-Live       | Zertifikat generieren                |
| Backup-Restore   | Live Proof     | Open   | Go-Live       | Restore-Test durchführen             |
| Ops-Ownership    | Primary Source | Open   | Go-Live       | Rollen bestimmen                     |

---

## Rollback-Strategien pro Epic

**EPIC 1 (Foundation)**: Ressourcen löschen (außer IP, die kann wiederverwendet werden)
**EPIC 2 (VM Runtime)**: VM-Snapshot zurück oder VM neu deployen
**EPIC 3 (n8n Runtime)**: Docker Compose down, alte Compose-Version deployen
**EPIC 4 (Persistence)**: DB-Restore aus Backup, n8n-Data Volume zurückspulen
**EPIC 5 (Acceptance)**: Fehler in vorherigen EPICs beheben, dann Acceptance wiederholen

---

## Nächste Schritte

1. Verantwortliche für jede Rolle benennen
2. Zeitplan für EPICs definieren (Abhängigkeiten beachten)
3. Pro EPIC ein Kickoff-Meeting
4. Nach jedem EPIC: Gate-Status aktualisieren
5. Nach EPIC 5: Go/No-Go-Entscheidung treffen

---

**Dokument-Version**: 1.0
**Letzter Update**: 2026-05-18
**Nächste Review**: Nach EPIC 1 Abschluss

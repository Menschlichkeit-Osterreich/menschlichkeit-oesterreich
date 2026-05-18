# ACCEPTANCE_GATE_MATRIX: Azure n8n Go/No-Go-Entscheidung

**Zweck**: Operatives Nachweislogbuch für jeden Gate-Punkt auf dem Weg zur Abnahmevorbereitung
**Format**: Ausfüllbar, führt Live-Status
**Datum**: 2026-05-18
**Go-Kriterium**: Alle `go_live_blocker` = `pass`; alle `provisioning_blocker` = `pass`

---

## Phase 1 — Azure Foundation Gates

### Gate 1.1: Grant-/Billing-Status

| Attribute          | Wert                              |
| ------------------ | --------------------------------- |
| **Gate ID**        | `grant-billing-status`            |
| **Gate Name**      | Grant-/Billing-Status verifiziert |
| **Evidence Type**  | Primary Source                    |
| **Blocker Class**  | `provisioning_blocker`            |
| **Current Status** | ⬜ Open                           |

**Sollzustand**:

- [ ] Nonprofit/Grant aktiv und nachgewiesen
- [ ] Sponsorship oder Educational Subscription aktiv
- [ ] Billing-Profil nutzbar
- [ ] Kosten-Management (Budget Alerts) konfiguriert

**Nachweis-Anforderung**:

- Screenshot oder Export: Azure Portal → Cost Management
- Bestätigung: Grant-ID oder Sponsorship-Nachweis
- Dokumentation: Wer ist Renewal-Owner?

**Evidenz-Artefakt** (auszufüllen):

```
Source: [Azure Portal / Grant-Bestätigung / E-Mail]
Date: [YYYY-MM-DD]
Verified By: [Name]
Result: [ ] PASS / [ ] FAIL / [ ] PENDING
Details:
  - Grant aktiv bis: [Datum]
  - Renewal Owner: [Name/Rolle]
  - Budget Alert 1: [ ] $100/mo
  - Budget Alert 2: [ ] $500/mo
  - Billing Profile Status: [ ] ACTIVE
```

**Blocker-Bedingung**: Fehlt → Stopp aller weiteren Schritte
**Rollback**: Nicht zutreffend (kein technischer Rollback)

---

### Gate 1.2: Azure Subscription prüfbar

| Attribute          | Wert                              |
| ------------------ | --------------------------------- |
| **Gate ID**        | `azure-subscription`              |
| **Gate Name**      | Subscription aktiv und zugreifbar |
| **Evidence Type**  | Primary Source                    |
| **Blocker Class**  | `provisioning_blocker`            |
| **Current Status** | ⬜ Open                           |

**Sollzustand**:

- [ ] `az account show` liefert aktive Subscription
- [ ] Quotas für VM, Disk, Public IP nicht überschritten
- [ ] Pricing Tier unterstützt erforderliche Services

**Nachweis-Anforderung**:

```bash
az account show --query "{Name: name, ID: id, State: state}"
az vm list-usage --location eastus --query "[?name.value=='Virtual Machines'].{Name: name.value, CurrentValue: currentValue, Limit: limit}"
```

**Evidenz-Artefakt**:

```
Command Output (az account show):
[paste output]

Subscription Status: [ ] ACTIVE / [ ] DISABLED / [ ] DELETED
Region Quota (VMs): [X] Available / [ ] Full

Date: [YYYY-MM-DD]
Verified By: [Name]
```

**Blocker-Bedingung**: Subscription inaktiv oder Quotas voll → Stopp

---

### Gate 1.3: Resource Group erstellt

| Attribute          | Wert                     |
| ------------------ | ------------------------ |
| **Gate ID**        | `azure-rg`               |
| **Gate Name**      | Resource Group vorhanden |
| **Evidence Type**  | Primary Source           |
| **Blocker Class**  | `provisioning_blocker`   |
| **Current Status** | ⬜ Open                  |

**Sollzustand**:

- [ ] RG `menschlichkeit-n8n-prod` existiert
- [ ] Region: [eu-central, eu-west, us-east nach Festlegung]
- [ ] Tags gesetzt: Project, Service, Environment, Billing-Owner

**Nachweis-Anforderung**:

```bash
az group show --name menschlichkeit-n8n-prod --query "{Name: name, Location: location, Tags: tags}"
```

**Evidenz-Artefakt**:

```
RG Name: menschlichkeit-n8n-prod
Location: [eu-central / eu-west / us-east]
Tags:
  - Project: Menschlichkeit-Oesterreich ✓
  - Service: n8n ✓
  - Environment: Production ✓
  - Billing-Owner: [Name] ✓

Date: [YYYY-MM-DD]
Verified By: [Name]
```

---

### Gate 1.4: Statische Public IP reserviert

| Attribute          | Wert                          |
| ------------------ | ----------------------------- |
| **Gate ID**        | `azure-public-ip`             |
| **Gate Name**      | Statische Public IP verfügbar |
| **Evidence Type**  | Primary Source                |
| **Blocker Class**  | `provisioning_blocker`        |
| **Current Status** | ⬜ Open                       |

**Sollzustand**:

- [ ] IP-Adresse: [tragen Sie IP ein]
- [ ] SKU: Standard
- [ ] Allocation: Static
- [ ] Lifecycle: Pinned

**Nachweis-Anforderung**:

```bash
az network public-ip show --resource-group menschlichkeit-n8n-prod --name n8n-public-ip
```

**Evidenz-Artefakt**:

```
Public IP Address: [XX.XX.XX.XX]
SKU: Standard ✓
Allocation: Static ✓
FQDN: [optional, später DNS-Namen]

Date: [YYYY-MM-DD]
Verified By: [Name]
```

---

### Gate 1.5: NSG-Regeln korrekt

| Attribute          | Wert                     |
| ------------------ | ------------------------ |
| **Gate ID**        | `azure-nsg`              |
| **Gate Name**      | NSG mit korrekten Regeln |
| **Evidence Type**  | Primary Source           |
| **Blocker Class**  | `go_live_blocker`        |
| **Current Status** | ⬜ Open                  |

**Sollzustand**:

- [ ] Inbound 22/tcp: Allow
- [ ] Inbound 80/tcp: Allow
- [ ] Inbound 443/tcp: Allow
- [ ] Alles andere: Deny (implizit)
- [ ] Outbound: Allow (default)

**Nachweis-Anforderung**:

```bash
az network nsg rule list --resource-group menschlichkeit-n8n-prod --nsg-name n8n-nsg --query "[].{Name: name, Direction: direction, Access: access, Protocol: protocol, DestPort: destinationPortRange}"
```

**Evidenz-Artefakt**:

```
NSG Rules:
┌─────────┬───────────┬──────────┬──────────┬──────────┐
│ Name    │ Direction │ Access   │ Protocol │ Port     │
├─────────┼───────────┼──────────┼──────────┼──────────┤
│ SSH     │ Inbound   │ Allow    │ TCP      │ 22       │ ✓
│ HTTP    │ Inbound   │ Allow    │ TCP      │ 80       │ ✓
│ HTTPS   │ Inbound   │ Allow    │ TCP      │ 443      │ ✓
│ Default │ Inbound   │ Deny     │ *        │ *        │ ✓
└─────────┴───────────┴──────────┴──────────┴──────────┘

Date: [YYYY-MM-DD]
Verified By: [Name]
```

**Blocker-Bedingung**: Regeln nicht korrekt oder private Ports offen → Stopp Go-Live

---

## Phase 2 — VM Runtime Gates

### Gate 2.1: VM läuft und SSH erreichbar

| Attribute          | Wert                               |
| ------------------ | ---------------------------------- |
| **Gate ID**        | `vm-running`                       |
| **Gate Name**      | VM läuft, SSH-Zugriff funktioniert |
| **Evidence Type**  | Live Proof                         |
| **Blocker Class**  | `provisioning_blocker`             |
| **Current Status** | ⬜ Open                            |

**Sollzustand**:

- [ ] VM Status: Running
- [ ] SSH-Verbindung erfolgreich
- [ ] Disk Utilization: < 50%

**Nachweis-Anforderung**:

```bash
az vm get-instance-view --resource-group menschlichkeit-n8n-prod --name n8n-vm --query "instanceView.statuses[?starts_with(code, 'PowerState/')].displayStatus"

ssh -i ~/.ssh/menschlichkeit-n8n-prod n8n-admin@<public-ip> "df -h /"
```

**Evidenz-Artefakt**:

```
VM Status: PowerState/running ✓
SSH Command: ssh -i ~/.ssh/... n8n-admin@[XX.XX.XX.XX]
Result: [ ] SUCCESS / [ ] FAILED

Disk:
  - Filesystem: /dev/...
  - Size: [XXG]
  - Used: [XX%] ✓
  - Available: [YY%]

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

### Gate 2.2: Docker läuft

| Attribute          | Wert                         |
| ------------------ | ---------------------------- |
| **Gate ID**        | `docker-installed`           |
| **Gate Name**      | Docker installiert und läuft |
| **Evidence Type**  | Live Proof                   |
| **Blocker Class**  | `provisioning_blocker`       |
| **Current Status** | ⬜ Open                      |

**Sollzustand**:

- [ ] `docker ps` funktioniert
- [ ] Docker Daemon läuft
- [ ] n8n-admin User ist in docker group

**Nachweis-Anforderung**:

```bash
ssh ... n8n-admin@<ip> "docker ps"
ssh ... n8n-admin@<ip> "docker version --format='Docker {{.Server.Version}}'"
```

**Evidenz-Artefakt**:

```
Docker Version: [XX.XX.XX] ✓
Daemon Status: running ✓
User Docker Group: n8n-admin ✓

Sample Output (docker ps):
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
[output if containers exist, or empty if not yet]

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

### Gate 2.3: UFW Firewall aktiv

| Attribute          | Wert                           |
| ------------------ | ------------------------------ |
| **Gate ID**        | `ufw-enabled`                  |
| **Gate Name**      | UFW aktiv mit korrekten Regeln |
| **Evidence Type**  | Live Proof                     |
| **Blocker Class**  | `go_live_blocker`              |
| **Current Status** | ⬜ Open                        |

**Sollzustand**:

- [ ] UFW Status: active
- [ ] 22, 80, 443: Allow
- [ ] Default Inbound: deny
- [ ] Default Outbound: allow

**Nachweis-Anforderung**:

```bash
ssh ... n8n-admin@<ip> "sudo ufw status"
```

**Evidenz-Artefakt**:

```
UFW Status: active ✓

Rules:
22/tcp    ALLOW     Anywhere ✓
80/tcp    ALLOW     Anywhere ✓
443/tcp   ALLOW     Anywhere ✓
Anywhere  DENY      Anywhere (default-deny-in)

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

### Gate 2.4: SSH Hardening aktiv

| Attribute          | Wert                       |
| ------------------ | -------------------------- |
| **Gate ID**        | `ssh-hardened`             |
| **Gate Name**      | SSH-Konfiguration gehärtet |
| **Evidence Type**  | Live Proof                 |
| **Blocker Class**  | `go_live_blocker`          |
| **Current Status** | ⬜ Open                    |

**Sollzustand**:

- [ ] PermitRootLogin no
- [ ] PasswordAuthentication no
- [ ] PubkeyAuthentication yes
- [ ] SSH Neustart erfolgreich

**Nachweis-Anforderung**:

```bash
ssh ... n8n-admin@<ip> "sudo sshd -T | grep -E '^PermitRootLogin|PasswordAuthentication|PubkeyAuthentication'"

# Negative Test: SSH-Passwort sollte nicht gehen
ssh -o PubkeyAuthentication=no n8n-admin@<ip> "echo test" 2>&1 | grep -i "permission denied"
```

**Evidenz-Artefakt**:

```
sshd Config:
  PermitRootLogin: no ✓
  PasswordAuthentication: no ✓
  PubkeyAuthentication: yes ✓

SSH Passwort-Login Test: [ ] REFUSED (expected) / [ ] SUCCEEDED (FAIL)
SSH PubKey-Login Test: [ ] SUCCESS / [ ] FAILED

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

## Phase 3 — n8n Runtime Gates

### Gate 3.1: n8n läuft und Editor erreichbar

| Attribute          | Wert                         |
| ------------------ | ---------------------------- |
| **Gate ID**        | `n8n-running`                |
| **Gate Name**      | n8n läuft, Editor erreichbar |
| **Evidence Type**  | Live Proof                   |
| **Blocker Class**  | `provisioning_blocker`       |
| **Current Status** | ⬜ Open                      |

**Sollzustand**:

- [ ] n8n Container läuft
- [ ] Editor HTTP-Response: 200 oder 302
- [ ] Database Connection: OK

**Nachweis-Anforderung**:

```bash
ssh ... n8n-admin@<ip> "cd /opt/n8n && docker-compose ps"

curl -I http://localhost:5678
curl -I https://n8n.menschlichkeit-oesterreich.at
```

**Evidenz-Artefakt**:

```
Docker Compose Status:
  reverse-proxy: [ ] UP / [ ] DOWN
  n8n:           [ ] UP / [ ] DOWN
  postgres:      [ ] UP / [ ] DOWN

HTTP Response (localhost:5678): [HTTP XXX]
HTTPS Response (public URL): [HTTP XXX]

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

### Gate 3.2: PostgreSQL läuft und persistiert

| Attribute          | Wert                                 |
| ------------------ | ------------------------------------ |
| **Gate ID**        | `postgres-running`                   |
| **Gate Name**      | PostgreSQL läuft, Daten persistieren |
| **Evidence Type**  | Live Proof                           |
| **Blocker Class**  | `provisioning_blocker`               |
| **Current Status** | ⬜ Open                              |

**Sollzustand**:

- [ ] PostgreSQL Container läuft
- [ ] DB Connection erfolgreich
- [ ] Daten persistieren über Restart

**Nachweis-Anforderung**:

```bash
ssh ... n8n-admin@<ip> << 'EOF'
cd /opt/n8n
docker-compose exec postgres psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();"
docker-compose down
docker-compose up -d postgres
sleep 5
docker-compose exec postgres psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT COUNT(*) FROM information_schema.tables;"
EOF
```

**Evidenz-Artefakt**:

```
PostgreSQL Version: [PostgreSQL XX.XX...]  ✓
DB Connection: [ ] OK / [ ] FAILED
Tables Before Restart: [N]
Tables After Restart:  [N] (should match)
Data Persistence: [ ] CONFIRMED / [ ] FAILED

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

---

## Phase 4 — Acceptance Gates

### Gate 4.1: Port-Exposure korrekt

| Attribute          | Wert                                   |
| ------------------ | -------------------------------------- |
| **Gate ID**        | `port-exposure`                        |
| **Gate Name**      | Nur 22/80/443 offen, 5678/5432/6379 zu |
| **Evidence Type**  | Live Proof                             |
| **Blocker Class**  | `go_live_blocker`                      |
| **Current Status** | ⬜ Open                                |

**Sollzustand**:

- [ ] 22/tcp: open
- [ ] 80/tcp: open
- [ ] 443/tcp: open
- [ ] 5678/tcp: closed/filtered
- [ ] 5432/tcp: closed/filtered
- [ ] 6379/tcp: closed/filtered

**Nachweis-Anforderung**:

```bash
# External port scan
nmap -p 22,80,443,5678,5432,6379 <public-ip>
```

**Evidenz-Artefakt**:

```
Nmap Scan Results:
22/tcp   STATE open    (SSH)          ✓
80/tcp   STATE open    (HTTP)         ✓
443/tcp  STATE open    (HTTPS)        ✓
5678/tcp STATE closed  (n8n)          ✓
5432/tcp STATE closed  (PostgreSQL)   ✓
6379/tcp STATE closed  (Redis)        ✓

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

**Blocker-Bedingung**: Private Ports offen → Stopp Go-Live

---

### Gate 4.2: HTTPS mit gültigem Zertifikat

| Attribute          | Wert                           |
| ------------------ | ------------------------------ |
| **Gate ID**        | `https-valid`                  |
| **Gate Name**      | HTTPS aktiv, Zertifikat gültig |
| **Evidence Type**  | Live Proof                     |
| **Blocker Class**  | `go_live_blocker`              |
| **Current Status** | ⬜ Open                        |

**Sollzustand**:

- [ ] Zertifikat: gültig (nicht abgelaufen)
- [ ] CN/SAN: n8n.menschlichkeit-oesterreich.at
- [ ] Issued by: Let's Encrypt oder vertrauenswürdig
- [ ] Keine Browser-Warnungen

**Nachweis-Anforderung**:

```bash
openssl s_client -connect n8n.menschlichkeit-oesterreich.at:443 -servername n8n.menschlichkeit-oesterreich.at | grep -E "Subject|Issuer|notAfter"

curl -v https://n8n.menschlichkeit-oesterreich.at 2>&1 | grep -i "certificate\|ssl"
```

**Evidenz-Artefakt**:

```
Certificate Details:
  Subject: CN=n8n.menschlichkeit-oesterreich.at ✓
  Issuer: Let's Encrypt / [Issuer]        ✓
  Valid From: [YYYY-MM-DD]
  Valid Until: [YYYY-MM-DD] (>30 Tage) ✓

HTTPS Browser Test: [ ] SUCCESS (no warnings) / [ ] FAILED

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

**Blocker-Bedingung**: Ungültiges oder selbstsigniertes Zertifikat → Stopp Go-Live

---

### Gate 4.3: Backup & Restore funktioniert

| Attribute          | Wert                            |
| ------------------ | ------------------------------- |
| **Gate ID**        | `backup-restore`                |
| **Gate Name**      | Backup und Restore nachgewiesen |
| **Evidence Type**  | Live Proof                      |
| **Blocker Class**  | `go_live_blocker`               |
| **Current Status** | ⬜ Open                         |

**Sollzustand**:

- [ ] Backup-Script existiert
- [ ] Tägliche Backups laufen
- [ ] Restore Test erfolgreich
- [ ] Daten nach Restore konsistent

**Nachweis-Anforderung**:

```bash
# Backup
/opt/n8n/scripts/backup.sh
ls -lh /opt/n8n/backups/

# Restore Test
# 1. Create test data
# 2. Restore from backup
# 3. Verify data exists
```

**Evidenz-Artefakt**:

```
Backup Script Exists: /opt/n8n/scripts/backup.sh ✓
Latest Backup: [YYYY-MM-DD HH:MM] ([size])
Backup Frequency: Daily ✓

Restore Test:
  - Data created: [timestamp]
  - Restore executed: [timestamp]
  - Data verified: [ ] YES / [ ] NO
  - Consistency: [ ] OK / [ ] FAILED

Date: [YYYY-MM-DD HH:MM]
Verified By: [Name]
```

**Blocker-Bedingung**: Restore schlägt fehl oder Daten nicht konsistent → Stopp Go-Live

---

### Gate 4.4: Ops-Ownership klar

| Attribute          | Wert                            |
| ------------------ | ------------------------------- |
| **Gate ID**        | `ops-ownership`                 |
| **Gate Name**      | Betriebsverantwortung eindeutig |
| **Evidence Type**  | Primary Source                  |
| **Blocker Class**  | `go_live_blocker`               |
| **Current Status** | ⬜ Open                         |

**Sollzustand**:

- [ ] Primary Owner: [Name/Rolle]
- [ ] Backup Owner: [Name/Rolle]
- [ ] Security Owner: [Name/Rolle]
- [ ] Renewal Owner: [Name/Rolle] (für Zertifikat, Budget, etc.)
- [ ] Escalation Path dokumentiert

**Evidenz-Artefakt**:

```
Ownership Matrix:
┌──────────────┬────────────┬──────────────┐
│ Area         │ Primary    │ Escalation   │
├──────────────┼────────────┼──────────────┤
│ VM/Infra     │ [Name]     │ [Name/Role]  │
│ Docker/n8n   │ [Name]     │ [Name/Role]  │
│ Database     │ [Name]     │ [Name/Role]  │
│ Backup       │ [Name]     │ [Name/Role]  │
│ Security     │ [Name]     │ [Name/Role]  │
│ Billing      │ [Name]     │ [Name/Role]  │
└──────────────┴────────────┴──────────────┘

Renewal Dates:
  - SSL Certificate: [YYYY-MM-DD] (90 Tage Warnung ab [YYYY-MM-DD])
  - Grant/Sponsorship: [YYYY-MM-DD]
  - Budget Alert: Every month on [day]

Date: [YYYY-MM-DD]
Verified By: [Name]
```

**Blocker-Bedingung**: Ownership unklar oder Escalation nicht dokumentiert → Stopp Go-Live

---

## GO/NO-GO Decision Template

**Entscheidungs-Datum**: [YYYY-MM-DD]
**Entscheidungs-Aussteller**: [Name/Rolle]
**Zeugen**: [Namen]

### Checklist vor finaler Entscheidung

- [ ] Alle Gates auf Status geprüft
- [ ] Alle `provisioning_blocker` = `pass`
- [ ] Alle `go_live_blocker` = `pass`
- [ ] Offene Risiken dokumentiert (falls vorhanden)
- [ ] Rollback-Pläne dokumentiert
- [ ] Operations-Handover durchgeführt

### Entscheidung

**Status**: ⬜ **GO** / ⬜ **NO-GO** / ⬜ **GO WITH CONDITIONS**

**Begründung**:

```
[Freigabe oder Begründung für Verzögerung]
```

**Nächster Schritt(e)**:

```
1. [Aktion]
2. [Aktion]
3. [Aktion]
```

**Unterschrift(en)**:

```
Go-Live Owner: ________________________  [Datum]
Operations Lead: _____________________  [Datum]
Security Lead: ________________________ [Datum]
```

---

**Dokument-Version**: 1.0
**Letzter Update**: 2026-05-18
**Gültig bis**: Review nach Phase 1 Abschluss

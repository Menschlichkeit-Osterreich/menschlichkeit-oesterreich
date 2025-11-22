---
description: Plesk Web Host Edition - Deployment & Chroot-Administration (Chrooted Shell, App-Katalog, Git, Node.js, Docker)
applyTo: '**'
---

# Plesk Web Host Edition - Deployment & Chroot-Administration

**Zielgruppe:** DevOps Engineer, Lead Architect  
**Umgebung:** Plesk Obsidian (Web Host Edition) - Chrooted Shell `/bin/bash (chrooted)`  
**Hosting:** menschlichkeit-oesterreich.at (Production), Staging-Subdomains  

---

## 1. Chroot-Umgebung (SSH-Zugang)

### 1.1 Grundkonzept

Als **Chroot-Admin** arbeiten Sie auf Plesk-Servern mit SSH in einer **chrooted Shell** für den jeweiligen Domain-Benutzer. Standard-Shell: `/bin/bash (chrooted)`.

**Einschränkungen:**
- ❌ Nur minimales Grund-Toolset verfügbar (ls, cat, cp, mv, rm, basic shell)
- ❌ Kein direkter Root-Zugriff
- ❌ Fehlende Standard-Tools: ssh-Client, Git, Composer, PHP-CLI, npm, curl, wget
- ❌ Keine `/dev/tty`, `/etc/ld.so.conf`, `/usr/share/zoneinfo` (müssen manuell hinzugefügt werden)

**Voraussetzung:**
- Domain-Hosting-Einstellungen: **Web Hosting Access** → `/bin/bash (chrooted)` (in Plesk UI)
- SSH-Zugang aktiviert (Password oder SSH-Key)

---

### 1.2 Update-Chroot-Skript (Tooling hinzufügen)

Plesk stellt das Skript **`update-chroot.sh`** bereit (GitHub: plesk/kb-scripts), um fehlende Programme in die Chroot-Umgebung einzufügen.

#### Installation des Skripts

```bash
# 1. Skript herunterladen (als Domain-User oder via Plesk File Manager)
curl -o update-chroot.sh https://raw.githubusercontent.com/plesk/kb-scripts/master/update-chroot/update-chroot.sh

# 2. Ausführbar machen
chmod 700 update-chroot.sh
```

**Quelle:** [Plesk KB - Add programs to chrooted shell](https://support.plesk.com/hc/en-us/articles/12377962235159-How-to-add-programs-to-chrooted-shell-environment-template-in-Plesk)

---

#### Häufige Tools hinzufügen

**SSH-Client (für SSH-Tunnel, Git-Cloning):**

```bash
# Terminal-Device hinzufügen (erforderlich für SSH)
./update-chroot.sh --devices tty

# SSH-Client-Dateien kopieren
./update-chroot.sh --add ssh

# Änderungen auf Domain anwenden
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

**Git (für Deployments):**

```bash
./update-chroot.sh --add git
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

**Composer (für Drupal/CiviCRM):**

```bash
./update-chroot.sh --add composer
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

**PHP-CLI (für Drush, Maintenance-Tasks):**

```bash
# PHP-Version muss in Plesk installiert sein (siehe 1.5)
./update-chroot.sh --add php8.1  # oder php8.3 je nach Domain-Einstellung
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

**Node.js & npm (für Frontend-Builds):**

```bash
# Erst Node.js-Komponente in Plesk installieren (siehe 1.4)
./update-chroot.sh --add node
./update-chroot.sh --add npm
./update-chroot.sh --apply menschlichkeit-oesterreich.at

# Alternativ: Plesk-interne Node-Version nutzen (siehe 1.4.2)
```

**curl/wget (für API-Calls, Downloads):**

```bash
./update-chroot.sh --add curl
./update-chroot.sh --add wget
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

---

#### Bekannte Limitierungen

**Warnung von Plesk:**
> „Nicht jede Software funktioniert im Chroot. Bei komplexen Anforderungen ggf. auf dedizierte Server umsteigen."

**Typische Probleme:**
- ❌ Docker funktioniert NICHT in Chroot (benötigt Docker-Extension + Root-Rechte)
- ❌ Systemd-Services können nicht gestartet werden
- ❌ Kernel-Module (z.B. iptables, fuse) nicht verfügbar
- ⚠️ n8n-Docker-Container: **NICHT** via SSH im Chroot startbar → Muss via Plesk-Docker-Extension oder extern gehostet werden

**Workaround für n8n:**
1. **Option A:** Plesk-Docker-Extension installieren (siehe 1.5) → Container via Plesk-UI verwalten
2. **Option B:** n8n extern hosten (z.B. Railway.app, fly.io, eigener VPS)
3. **Option C:** n8n als Node.js-App im Plesk-Chroot (ohne Docker) → `npm install n8n && npx n8n start` (siehe 1.4.3)

---

### 1.3 Manuelle Dateien kopieren (Fallback)

Falls `update-chroot.sh` fehlschlägt, können Sie Dateien manuell ins Chroot kopieren:

```bash
# Beispiel: /dev/tty fehlt
sudo mkdir -p /var/www/vhosts/menschlichkeit-oesterreich.at/dev
sudo mknod /var/www/vhosts/menschlichkeit-oesterreich.at/dev/tty c 5 0

# Beispiel: /etc/ld.so.conf fehlt
sudo cp /etc/ld.so.conf /var/www/vhosts/menschlichkeit-oesterreich.at/etc/

# Beispiel: Timezone-Daten
sudo mkdir -p /var/www/vhosts/menschlichkeit-oesterreich.at/usr/share/zoneinfo
sudo cp -r /usr/share/zoneinfo/* /var/www/vhosts/menschlichkeit-oesterreich.at/usr/share/zoneinfo/
```

**WICHTIG:** Benötigt Root-Zugriff (via Plesk Admin oder Hosting-Provider-Support).

---

## 2. Plesk Application Catalog (Vorgefertigte Apps)

### 2.1 Unterstützte Anwendungen

Plesk bietet einen **Application Catalog** mit vorgefertigten Web-Applikationen:

**Häufige CMS:**
- ✅ WordPress (Latest)
- ✅ Joomla (4.x)
- ✅ **Drupal 10** (offiziell unterstützt, siehe 2.2)
- ✅ Magento (E-Commerce)
- ✅ phpBB (Forum)
- ✅ PrestaShop (Shop)

**WICHTIG:**
- ❌ Drupal 9: **NICHT** mehr offiziell unterstützt (EOL 2023-11-01)
- ⚠️ Nextcloud: **NICHT** im Standard-Katalog → Manuelle Installation erforderlich (siehe 3.2)
- ⚠️ CiviCRM: **NICHT** im Katalog → Muss als Drupal-Extension manuell installiert werden

**Quelle:** [Plesk Docs - Application Catalog](https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/aps-application-catalog.63094/)

---

### 2.2 Drupal 10 Installation (via UI)

**Workflow:**

1. Login: Plesk-Panel → **Domains** → `menschlichkeit-oesterreich.at`
2. **Get Started** → **More Apps** (oder direkt **Applications**)
3. Suche: `Drupal`
4. **Drupal 10** auswählen → **Install**
5. Konfiguration:
   - **Installation Path:** `/httpdocs` (oder Subdomain wie `/crm`)
   - **Admin-Username:** `admin` (ändern!)
   - **Admin-Email:** `vorstand@menschlichkeit-oesterreich.at`
   - **Database:** Automatisch angelegt oder existierende auswählen
6. **Install Now** → Plesk konfiguriert automatisch:
   - PHP-Version (8.1+ für Drupal 10)
   - MySQL/PostgreSQL-Datenbank
   - Dateirechte (`chmod 755 sites/default/files`)
   - SSL-Zertifikat (Let's Encrypt)

**Nach Installation:**
- Drupal-Admin-Panel: `https://menschlichkeit-oesterreich.at/admin` (oder `/crm/admin` bei Subdirectory)
- CiviCRM manuell via Composer installieren (siehe 3.3)

**Quelle:** [Plesk KB - Drupal 9 or 10](https://www.plesk.com/kb/support/does-plesk-support-drupal-9-or-10/)

---

### 2.3 CLI-Installation via `aps` (Alternative)

Für automatisierte Deployments (CI/CD):

```bash
# Verfügbare Pakete anzeigen
plesk bin aps --get-package-list

# Drupal 10 suchen
plesk bin aps --get-package-list | grep -i drupal

# Installation (Beispiel - exakte Syntax variiert)
plesk bin aps --install-package drupal10 \
  --domain menschlichkeit-oesterreich.at \
  --path /crm \
  --database-name civicrm_db

# WordPress-Beispiel (aus Plesk-Doku):
# WordPress.xml konfigurieren, dann:
plesk bin aps --install-app WordPress.xml
```

**WICHTIG:** `aps`-Tool ist nur auf Root-Level verfügbar (nicht im Chroot). Für Chroot-User: UI-Installation verwenden oder Hosting-Provider-Support kontaktieren.

**Quelle:** [Plesk Docs - aps CLI](https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/aps-application-catalog.63094/)

---

## 3. Eigene Deployments (Git, SFTP, rsync)

### 3.1 Git-Integration (Empfohlen)

Plesk unterstützt **Git-basierte Deployments** (benötigt Git-Extension).

#### 3.1.1 Voraussetzungen

1. **Git-Extension installiert:**
   - Plesk-Admin → **Tools & Settings** → **Updates** → **Add/Remove Components**
   - **Git Support** aktivieren

2. **SSH-Zugang für Domain-User:**
   - Domain → **Web Hosting Access** → `/bin/bash (chrooted)` + SSH aktiviert
   - SSH-Key oder Password konfiguriert

3. **Git im Chroot verfügbar:**
   ```bash
   ./update-chroot.sh --add git
   ./update-chroot.sh --apply menschlichkeit-oesterreich.at
   ```

---

#### 3.1.2 Git-Repository einrichten (Plesk UI)

**Workflow:**

1. Plesk → **Domains** → `menschlichkeit-oesterreich.at` → **Git**
2. **Add Repository**
3. Konfiguration:
   - **Repository-URL:** `https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git`
   - **Branch:** `main` (oder `production`)
   - **Repository-Pfad:** `/httpdocs` (oder `/frontend`, `/crm`, etc.)
   - **Deployment-Mode:**
     - **Manual:** Pull via Button "Pull Updates"
     - **Automatic:** Pull bei jedem Push (Webhook erforderlich)
4. **Deploy-Script** (optional):
   ```bash
   # Beispiel: Frontend-Build nach Pull
   cd $REPOSITORY_ROOT/frontend
   npm install
   npm run build
   rsync -av dist/ ../httpdocs/
   ```
5. **Add Repository** → Plesk klont Repository

**Manueller Deploy:**
- Plesk-UI → **Git** → **Pull Updates** → Bestätigen

**Automatischer Deploy (Webhook):**
- GitHub → **Settings** → **Webhooks** → **Add webhook**
- **Payload URL:** `https://menschlichkeit-oesterreich.at:8443/modules/git/webhook?repository_id=<REPO_ID>`
- **Content type:** `application/json`
- **Secret:** (von Plesk generiert)
- **Events:** Push events

**Quelle:** [Plesk Docs - Git Support](https://docs.plesk.com/en-US/obsidian/customer-guide/git-support.75824/)

---

#### 3.1.3 Git-Deployment via SSH (Manuell)

**Workflow (für CRM/Drupal):**

```bash
# 1. SSH-Verbindung zur Domain
ssh user@menschlichkeit-oesterreich.at

# 2. In httpdocs/crm navigieren
cd httpdocs/crm

# 3. Git-Repository klonen (Erstes Mal)
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git .

# 4. Oder: Pull bei Updates
git pull origin main

# 5. Composer-Dependencies installieren (Drupal/CiviCRM)
composer install --no-dev --optimize-autoloader

# 6. Datenbank-Migrationen ausführen (Drupal)
drush updb -y
drush cr

# 7. Dateirechte korrigieren
chmod -R 755 sites/default/files
chown -R user:psacln sites/default/files  # user = Domain-User
```

**WICHTIG:**
- **GitHub-Token erforderlich** (für private Repos): `git clone https://<TOKEN>@github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git`
- **SSH-Key-Auth bevorzugt:** `git clone git@github.com:Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git` (SSH-Key in GitHub-Account hinterlegen)

---

### 3.2 SFTP/rsync-Deployment (Alternative)

**Workflow (für Frontend/Static Sites):**

```bash
# Lokaler Rechner → Plesk-Server
# 1. SFTP-Credentials aus Plesk holen (Domain → Web Hosting Access)

# 2. rsync-Upload (Beispiel: Frontend-Build)
rsync -avz --delete \
  ./frontend/dist/ \
  user@menschlichkeit-oesterreich.at:/httpdocs/frontend/

# 3. Oder: SFTP-Client (FileZilla, WinSCP)
# Host: menschlichkeit-oesterreich.at
# Port: 22
# Protocol: SFTP
# Username: user (Domain-User)
# Password: (aus Plesk)
# Remote Path: /httpdocs/
```

**WICHTIG:**
- `--delete` löscht alte Dateien im Ziel (Vorsicht bei Produktions-Deployments!)
- **Dry-Run empfohlen:** `rsync --dry-run -avz ...` (zeigt Änderungen ohne Ausführung)

---

### 3.3 CiviCRM-Installation (Manuelle Integration)

**Voraussetzung:** Drupal 10 bereits installiert (siehe 2.2)

**Workflow:**

```bash
# 1. SSH-Verbindung
ssh user@menschlichkeit-oesterreich.at
cd httpdocs/crm

# 2. CiviCRM via Composer installieren
composer require civicrm/civicrm-core:~5.77 \
  civicrm/civicrm-packages:~5.77 \
  civicrm/civicrm-drupal-8:~5.77

# 3. Drupal-Module aktivieren
drush pm:enable civicrm

# 4. CiviCRM-Setup ausführen (Browser oder CLI)
# Browser: https://menschlichkeit-oesterreich.at/crm/admin/modules
# CLI: drush civicrm:install

# 5. Dateirechte korrigieren
chmod -R 755 sites/default/files/civicrm
chown -R user:psacln sites/default/files/civicrm
```

**Quelle:** [CiviCRM Installation Guide](https://docs.civicrm.org/installation/en/latest/drupal/)

---

## 4. Node.js-Support (Frontend/API)

### 4.1 Node.js-Komponente installieren

**Plesk-Admin (Root-Level):**

1. **Tools & Settings** → **Updates** → **Add/Remove Components**
2. **Node.js Support** aktivieren (mehrere Versionen verfügbar: 16, 18, 20, 22)
3. **Apply Changes** → Plesk installiert Node.js

**Nach Installation:**
- Node.js-Binaries: `/opt/plesk/node/<VERSION>/bin/node`
- npm: `/opt/plesk/node/<VERSION>/bin/npm`
- npx: `/opt/plesk/node/<VERSION>/bin/npx`

**Quelle:** [Plesk KB - Node.js Installation](https://www.plesk.com/kb/support/how-to-install-and-run-node-js-application-in-plesk/)

---

### 4.2 Node.js-App einrichten (Plesk UI)

**Workflow:**

1. Plesk → **Domains** → `api.menschlichkeit-oesterreich.at`
2. **Node.js** (neue Option nach Komponenten-Installation)
3. **Enable Node.js**
4. Konfiguration:
   - **Application Mode:** Production (oder Development für Debugging)
   - **Application Root:** `/httpdocs/api` (Pfad zu Ihrem Node.js-Projekt)
   - **Application Startup File:** `app.js` (oder `server.js`, `index.js`)
   - **Node.js-Version:** 18.x (oder neuer)
5. **Custom Environment Variables** (optional):
   ```
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   NODE_ENV=production
   ```
6. **NPM Install** → Installiert `package.json`-Dependencies
7. **Restart App** → Startet Node.js-Prozess

**Beispiel-App-Struktur:**

```
/httpdocs/api/
├── app.js            # Startup-File
├── package.json
├── node_modules/
├── src/
│   ├── routes/
│   ├── middleware/
│   └── lib/
└── .env              # Lokale Secrets (Git-ignored)
```

**app.js (Beispiel):**

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
```

**Plesk kümmert sich automatisch um:**
- ✅ Prozess-Management (Start/Stop/Restart)
- ✅ Auto-Restart bei Crashes
- ✅ Reverse-Proxy (Apache/Nginx → Node.js-App)
- ✅ SSL-Terminierung (Let's Encrypt)

---

### 4.3 Node.js via SSH (Alternativ - für n8n ohne Docker)

**Workflow (Chroot-Umgebung):**

```bash
# 1. Node.js im Chroot verfügbar machen
./update-chroot.sh --add node
./update-chroot.sh --add npm
./update-chroot.sh --apply menschlichkeit-oesterreich.at

# 2. Oder: Plesk-interne Node-Version nutzen
export PATH=$PATH:/opt/plesk/node/18/bin

# 3. n8n installieren (global oder lokal)
npm install -g n8n

# 4. n8n starten (Hintergrund-Prozess via nohup oder screen)
nohup n8n start --tunnel &

# 5. Oder: PM2 als Process-Manager
npm install -g pm2
pm2 start n8n
pm2 save
pm2 startup  # Auto-Start nach Reboot (benötigt Root für systemd)
```

**WICHTIG:**
- ⚠️ **PM2-Startup benötigt Root** → Nicht im Chroot möglich → Kontaktieren Sie Hosting-Provider
- ⚠️ **n8n-Tunnel-Modus:** Nur für Development, NICHT für Production (Sicherheitsrisiko)
- ✅ **Empfehlung:** n8n via Plesk-Node.js-App (siehe 4.2) oder externe Hosting-Platform (Railway.app)

**Quelle:** [Plesk Docs - Node.js](https://www.plesk.com/kb/support/how-to-install-and-run-node-js-application-in-plesk/)

---

## 5. Docker-Support (Optional)

### 5.1 Docker-Extension installieren

**Plesk-Admin (Root-Level):**

1. **Extensions** → **Docker**
2. **Install** → Plesk installiert Docker-Engine
3. Nach Installation: **Docker** im Plesk-Menü verfügbar

**Verfügbare Features:**
- ✅ Docker-Images aus Docker Hub ziehen
- ✅ Container starten/stoppen/löschen
- ✅ Port-Mapping (z.B. n8n auf Port 5678)
- ✅ Volumes für persistente Daten
- ✅ Environment-Variables setzen

**Quelle:** [Plesk Docs - Docker](https://docs.plesk.com/en-US/obsidian/administrator-guide/plesk-administration/using-docker.75823/)

---

### 5.2 n8n-Docker-Container (Beispiel)

**Workflow (Plesk UI):**

1. **Docker** → **Add Container**
2. **Image:** `n8nio/n8n:latest`
3. **Container-Name:** `n8n-automation`
4. **Port-Mapping:**
   - **Container-Port:** 5678
   - **Host-Port:** 5678 (oder 80/443 via Reverse-Proxy)
5. **Volumes:**
   - **/root/.n8n** → `/var/www/vhosts/menschlichkeit-oesterreich.at/n8n-data`
6. **Environment Variables:**
   ```
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=<STRONG_PASSWORD>
   WEBHOOK_URL=https://n8n.menschlichkeit-oesterreich.at/
   ```
7. **Run Container** → Plesk startet Docker-Container

**Reverse-Proxy einrichten:**

1. Plesk → **Domains** → `n8n.menschlichkeit-oesterreich.at` (Subdomain)
2. **Apache & nginx Settings** → **Additional nginx directives:**
   ```nginx
   location / {
       proxy_pass http://localhost:5678;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```
3. **SSL aktivieren** (Let's Encrypt)

**Backup-Empfehlung (von Plesk):**
> "Sichern Sie Docker-Volumes regelmäßig, da Plesk-Backups nur Konfigurationen, nicht Container-Daten enthalten."

**Backup-Script (Beispiel):**

```bash
# Cron-Job: Täglich um 03:00 Uhr
0 3 * * * docker exec n8n-automation tar -czf /backup/n8n-$(date +\%Y\%m\%d).tar.gz /root/.n8n
```

---

## 6. System-Komponenten installieren

### 6.1 PHP-Versionen

**Plesk-Admin:**

1. **Tools & Settings** → **Updates** → **Add/Remove Components**
2. **PHP** → Mehrere Versionen auswählen (7.4, 8.0, 8.1, 8.2, 8.3)
3. **Apply Changes** → Plesk installiert PHP-Versionen

**Pro Domain konfigurierbar:**
- Plesk → **Domains** → `menschlichkeit-oesterreich.at` → **PHP Settings**
- **PHP-Version:** 8.1 (für Drupal 10 + CiviCRM)
- **Extensions:** mbstring, xml, gd, curl, zip, pdo_mysql (automatisch aktiviert)

---

### 6.2 Datenbanken

**Verfügbare DB-Systeme:**
- ✅ MySQL 5.7, 8.0
- ✅ PostgreSQL 12, 13, 14, 15, 16
- ✅ MariaDB 10.x

**Installation:**
- **Tools & Settings** → **Updates** → **Add/Remove Components**
- **PostgreSQL 15** auswählen → **Apply Changes**

**Datenbank erstellen:**
- Plesk → **Databases** → **Add Database**
- **Database Name:** `menschlichkeit_db`
- **Database Type:** PostgreSQL
- **Database User:** `menschlichkeit_user`
- **Password:** (generiert oder manuell)

---

### 6.3 Weitere Komponenten

**Verfügbar via Add/Remove Components:**
- Python (2.7, 3.6-3.11)
- Ruby (2.x, 3.x)
- Perl (5.x)
- Nginx (als Reverse-Proxy zusätzlich zu Apache)
- Fail2Ban (Brute-Force-Protection)
- ModSecurity (Web Application Firewall)
- SpamAssassin (Mail-Filtering)

**Quelle:** [Plesk Docs - Components](https://docs.plesk.com/en-US/obsidian/administrator-guide/plesk-administration/plesk-components/adding-and-removing-plesk-components.74719/)

---

## 7. Best Practices & Workflows

### 7.1 Deployment-Workflow (Empfohlen)

```mermaid
graph LR
    A[GitHub Push] --> B{Plesk Git Webhook}
    B --> C[Pull Repository]
    C --> D[Run Deploy-Script]
    D --> E{Service-Typ?}
    E -->|Frontend| F[npm run build]
    E -->|API| G[npm install]
    E -->|CRM| H[composer install]
    F --> I[rsync to httpdocs]
    G --> J[Restart Node.js App]
    H --> K[drush updb + cr]
    I --> L[Smoke-Test]
    J --> L
    K --> L
    L --> M{Tests OK?}
    M -->|Ja| N[Deploy Success]
    M -->|Nein| O[Rollback]
```

---

### 7.2 Chroot-Security

**Regel:** Minimale Toolset-Installation im Chroot.

**NUR hinzufügen, was wirklich benötigt wird:**
- ✅ Git (für Deployments)
- ✅ PHP-CLI (für Drupal/Composer)
- ✅ Node.js (für Frontend-Builds)
- ❌ NICHT: vim, emacs, gcc, make (Sicherheitsrisiko)
- ❌ NICHT: sudo, su (im Chroot nicht verfügbar)

**Regelmäßige Audits:**
```bash
# Alle installierten Binaries im Chroot auflisten
ls -lh /var/www/vhosts/menschlichkeit-oesterreich.at/bin/
```

---

### 7.3 SSL-Zertifikate (Let's Encrypt)

**Plesk kümmert sich automatisch um:**
- ✅ Let's Encrypt-Integration (kostenlos)
- ✅ Auto-Renewal (alle 90 Tage)
- ✅ Wildcard-Zertifikate (via DNS-Challenge)

**Manuelle Aktivierung:**
1. Plesk → **Domains** → `menschlichkeit-oesterreich.at`
2. **SSL/TLS Certificates**
3. **Let's Encrypt** → **Get it free**
4. **Secure the domain and www-domain** aktivieren
5. **Include a "www" subdomain** (optional)
6. **Get it free** → Plesk beantragt Zertifikat

**Monitoring:**
- Plesk zeigt Ablaufdatum in Domain-Übersicht
- Email-Benachrichtigung 30 Tage vor Ablauf

---

### 7.4 Backup & Rollback

**Plesk-Backup (empfohlen):**
1. **Tools & Settings** → **Backup Manager**
2. **Schedule:** Täglich (inkrementell), Wöchentlich (voll)
3. **Storage:** Lokaler Server + FTP/SFTP/Cloud (Backblaze B2, AWS S3)
4. **Retention:** 7 Tage (täglich), 4 Wochen (wöchentlich), 12 Monate (monatlich)

**Rollback-Workflow:**
1. Plesk → **Domains** → `menschlichkeit-oesterreich.at`
2. **Backup Manager** → **Restore**
3. **Select Backup** → Zeitpunkt auswählen
4. **Restore Files** → Nur `/httpdocs` (nicht ganze Domain)
5. **Restore** → Bestätigen

**Git-Rollback (Alternative):**
```bash
# SSH
ssh user@menschlichkeit-oesterreich.at
cd httpdocs/crm

# Letzter bekannter stabiler Commit
git log --oneline -10
git checkout <COMMIT_HASH>

# Oder: Branch-Rollback
git checkout production
git pull origin production
```

---

## 8. Troubleshooting

### 8.1 "Command not found" im Chroot

**Problem:** `bash: git: command not found`

**Lösung:**
```bash
./update-chroot.sh --add git
./update-chroot.sh --apply menschlichkeit-oesterreich.at
```

---

### 8.2 "Permission denied" beim Git-Clone

**Problem:** `fatal: could not create work tree dir 'xxx': Permission denied`

**Lösung:**
```bash
# Dateirechte korrigieren
chmod 755 /httpdocs
chown user:psacln /httpdocs

# Oder: In Subdirectory klonen
mkdir -p /httpdocs/repo
cd /httpdocs/repo
git clone ...
```

---

### 8.3 Node.js-App startet nicht

**Problem:** Plesk zeigt "Stopped" Status

**Lösung:**
1. **Check Logs:** Plesk → **Node.js** → **Show Logs**
2. **Häufige Fehler:**
   - Port bereits belegt → In `app.js` anderen Port verwenden
   - `package.json` fehlt → `npm init` ausführen
   - Startup-File falsch → In Plesk-Config korrigieren
3. **Manueller Test:**
   ```bash
   ssh user@menschlichkeit-oesterreich.at
   cd httpdocs/api
   /opt/plesk/node/18/bin/node app.js  # Direkter Start
   ```

---

### 8.4 Docker-Container nicht erreichbar

**Problem:** `http://localhost:5678` gibt Timeout

**Lösung:**
1. **Container-Status prüfen:** Plesk → **Docker** → Container-Liste
2. **Logs anzeigen:** Docker → Container → **Logs**
3. **Port-Mapping prüfen:** Container-Port 5678 → Host-Port 5678
4. **Firewall:** Plesk → **Tools & Settings** → **Firewall** → Port 5678 öffnen (falls nicht via Reverse-Proxy)

---

## 9. Referenzen

### 9.1 Plesk-Dokumentation

- [Update-Chroot-Skript](https://support.plesk.com/hc/en-us/articles/12377962235159-How-to-add-programs-to-chrooted-shell-environment-template-in-Plesk)
- [Application Catalog & aps](https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/aps-application-catalog.63094/)
- [Git Support](https://docs.plesk.com/en-US/obsidian/customer-guide/git-support.75824/)
- [Node.js Support](https://www.plesk.com/kb/support/how-to-install-and-run-node-js-application-in-plesk/)
- [Docker Extension](https://docs.plesk.com/en-US/obsidian/administrator-guide/plesk-administration/using-docker.75823/)
- [Adding Components](https://docs.plesk.com/en-US/obsidian/administrator-guide/plesk-administration/plesk-components/adding-and-removing-plesk-components.74719/)
- [Drupal 9/10](https://www.plesk.com/kb/support/does-plesk-support-drupal-9-or-10/)

### 9.2 Interne Referenzen

- `.github/instructions/core/deployment-procedures.instructions.md` (Deployment-Workflows)
- `.github/instructions/dsgvo-compliance.instructions.md` (Datenschutz bei Backups)
- `deployment-scripts/multi-service-deploy.sh` (Multi-Service-Deployment-Script)
- `deployment-scripts/rollback.sh` (Rollback-Automatisierung)

---

**Erstellt:** 2025-10-17  
**Nächste Review:** 2026-01-15  
**Owner:** DevOps Engineer  
**Status:** ACTIVE

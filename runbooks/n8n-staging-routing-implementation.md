# n8n Staging Routing Fix – Implementierungs-Anleitung
## FEATURE-SPEZIFIKATION_Staging-Unlock-AP-01 – Schritt 1: Reverse-Proxy-Fix

**Datum:** 2024-06-18
**Status:** Implementierungs-Anleitung
**Zielgruppe:** Plesk-Administrator / DevOps-Engineer
**Geschätzte Dauer:** 15-30 Minuten

---

## Überblick

Die Domain `n8n.menschlichkeit-oesterreich.at` zeigt aktuell die Plesk-Default-Seite statt der n8n Workflow-Automation UI. Grund: Die nginx-Reverse-Proxy-Konfiguration für diese Domain fehlt.

**Lösung:** Nginx Konfigurationsdatei deployen und nginx neu laden.

---

## Voraussetzungen

- ✅ Root-Zugriff oder sudo-Berechtigung auf Plesk-Server
- ✅ SSH-Zugang zu `plesk7.digimagical.com` oder lokal auf der Maschine
- ✅ nginx ist installiert und läuft (`systemctl status nginx`)
- ✅ TLS-Zertifikat für n8n.menschlichkeit-oesterreich.at existiert (Let's Encrypt via Plesk)

---

## Schritt 1: Repository aktualisieren und Konfiguration vorbereiten

### 1.1 Latest changes pullen (auf Deployment-Maschine oder lokal)

```bash
cd /path/to/repository/menschlichkeit-oesterreich
git pull origin main
```

Die neue nginx-Konfiguration befindet sich in:
```
deployment-scripts/nginx/n8n.menschlichkeit-oesterreich.at.conf
```

### 1.2 Vorhandene Konfiguration sichern (optional, aber empfohlen)

```bash
sudo cp /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf \
        /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf.backup.$(date +%Y%m%d_%H%M%S)
```

---

## Schritt 2: Nginx-Konfiguration deployen

### Option A: Automatisiert (empfohlen)

Führe das Deployment-Skript aus:

```bash
cd /path/to/repository/menschlichkeit-oesterreich
sudo bash deployment-scripts/deploy-n8n-nginx.sh
```

Das Skript wird:
- ✅ Die Konfigurationsdatei kopieren
- ✅ Syntax validieren
- ✅ Backup erstellen
- ✅ nginx neu laden
- ✅ Connectivity testen

### Option B: Manuell

Falls das Skript nicht funktioniert, manuell deployen:

```bash
# 1. Konfiguration kopieren
sudo cp deployment-scripts/nginx/n8n.menschlichkeit-oesterreich.at.conf \
        /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf

# 2. Berechtigungen setzen
sudo chmod 644 /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf

# 3. Syntax validieren
sudo nginx -t
# Erwartete Ausgabe:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 4. nginx neu laden
sudo systemctl reload nginx
```

---

## Schritt 3: Validierung

### 3.1 nginx-Status prüfen

```bash
sudo systemctl status nginx
# Sollte "active (running)" anzeigen
```

### 3.2 Nginx-Logs prüfen auf Fehler

```bash
# Access Log
sudo tail -20 /var/log/nginx/n8n_access.log

# Error Log
sudo tail -20 /var/log/nginx/n8n_error.log

# System nginx Error Log (falls Konfigurationsfehler)
sudo journalctl -u nginx -n 20
```

### 3.3 n8n-Domain testen

```bash
# Test: HTTPS healthz Endpoint
curl -k https://n8n.menschlichkeit-oesterreich.at/healthz

# Erwartete Antwort: "OK" (HTTP 200)
# Falls n8n nicht läuft: Verbindungsfehler oder "Bad Gateway"
# Nicht erwartet: Plesk-Default-HTML-Seite
```

### 3.4 Browser-Test

Öffne in einem Browser:
```
https://n8n.menschlichkeit-oesterreich.at/
```

**Erwartete Ergebnisse (eine davon ist OK):**
- ✅ **n8n Login-Seite erscheint** (das ist der Idealfall)
- ✅ **401/403 Error** (n8n läuft, erwartet Authentication)
- ✅ **Verbindungsfehler** (n8n-Container läuft nicht, aber Routing funktioniert)

**NICHT erwartet:**
- ❌ Plesk "Account Suspended" Seite
- ❌ Plesk-Default-"Welcome to nginx" Seite
- ❌ Apache Error Page

---

## Schritt 4: n8n Container starten (falls nicht läuft)

Falls die Verbindung fehlschlägt oder "Bad Gateway" anzeigt, könnte der n8n Container nicht laufen.

### 4.1 Container-Status prüfen

```bash
docker ps | grep n8n
# Sollte mindestens einen Container "moe-n8n" anzeigen
```

### 4.2 n8n starten (falls Container nicht läuft)

```bash
# Option 1: Docker Compose starten
cd /path/to/repository/menschlichkeit-oesterreich/automation/n8n
docker-compose -f docker-compose.https.yml up -d

# Option 2: Einzelnen Container starten
docker start moe-n8n
```

### 4.3 Container-Logs prüfen

```bash
# Logs des n8n Containers
docker logs moe-n8n | tail -50

# Caddy Reverse Proxy Logs (falls vorhanden)
docker logs moe-n8n-caddy | tail -50
```

---

## Schritt 5: Dokumentation aktualisieren

Nach erfolgreicher Bereitstellung:

### 5.1 Feature-Spezifikation updaten

Bearbeite: `FEATURE-SPEZIFIKATION_Staging-Unlock-AP-01.md`

Setze die erste Checkbox auf ✅:
```markdown
- [x] https://n8n.menschlichkeit-oesterreich.at zeigt n8n UI oder API-typische Fehlermeldung (keine Plesk-Defaultseite)
```

Dokumentiere den Timestamp und die Verifizierungsmethode.

### 5.2 Git Commit erstellen

```bash
git add deployment-scripts/nginx/n8n.menschlichkeit-oesterreich.at.conf
git add deployment-scripts/deploy-n8n-nginx.sh
git add DEPLOYMENT_CONFIG.md
git commit -m "feat: Add n8n nginx reverse proxy configuration (AP-01 Step 1)"
git push origin main
```

---

## Troubleshooting

### Problem: "nginx: [error] unknown directive"

**Ursache:** Syntax-Fehler in der Konfigurationsdatei.

**Lösung:**
```bash
# 1. Vollständigen Error anschauen
sudo nginx -t

# 2. Backup wiederherstellen
sudo cp /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf.backup.* \
        /etc/nginx/conf.d/n8n.menschlichkeit-oesterreich.at.conf

# 3. nginx neu laden
sudo systemctl reload nginx
```

### Problem: "Bad Gateway" oder "502 Error"

**Ursache:** nginx kann n8n nicht erreichen (Container läuft nicht oder falscher Port).

**Lösung:**
```bash
# 1. Prüfe ob n8n Container läuft
docker ps | grep n8n

# 2. Falls nicht: starten
docker-compose -f automation/n8n/docker-compose.https.yml up -d

# 3. Prüfe ob Port 5678 offen ist
netstat -tlnp | grep 5678
# Sollte zeigen: tcp  LISTEN  ...n8n...

# 4. nginx Logs prüfen
sudo tail -50 /var/log/nginx/n8n_error.log
```

### Problem: "Plesk Default Seite wird immer noch angezeigt"

**Ursache:** nginx hat alte Konfiguration gecacht, oder Wrong Server Block wird matched.

**Lösung:**
```bash
# 1. Konfiguration validieren
sudo nginx -t

# 2. nginx vollständig neu starten (nicht reload)
sudo systemctl restart nginx

# 3. Browser-Cache löschen und neu laden (Ctrl+Shift+R / Cmd+Shift+R)

# 4. Alternativ: curl ohne Cache
curl -k --no-cache https://n8n.menschlichkeit-oesterreich.at/healthz
```

---

## Nächste Schritte (nach erfolgreicher Verifikation)

Gemäß FEATURE-SPEZIFIKATION_Staging-Unlock-AP-01:

1. ✅ **Schritt 1: Reverse-Proxy-Fix** – ABGESCHLOSSEN
2. ⏳ **Schritt 2: Routing-Verifikation** – Aktuelle Screenshots/Logs sammeln
3. ⏳ **Schritt 3: Secret-Mapping & API-Umgebung** – Environment-Variablen setzen
4. ⏳ **Schritt 4: Autoritativer Smoke-Test** – `automation/n8n/smoke-test-donation.py` ausführen

---

## Kontakt & Support

Fragen zur Implementierung:
- **DevOps Lead:** Zu definieren
- **Issue Template:** [Staging Unlock Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/issues?q=label%3A%22P1%3A-Staging-Unlock%22)

---

**Dokument zuletzt aktualisiert:** 2024-06-18

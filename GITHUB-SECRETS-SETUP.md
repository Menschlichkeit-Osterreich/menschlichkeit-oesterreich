# GitHub Secrets Setup für Menschlichkeit Österreich

## 🔐 Repository Secrets

### Kritische Produktions-Secrets (REQUIRED)

```bash
PLESK_HOST=dmpl20230054@5.183.217.146
SSH_PRIVATE_KEY=[Inhalt der ~/.ssh/id_ed25519 Datei]
LARAVEL_DB_USER=laravel_user
LARAVEL_DB_PASS=SECURE_LARAVEL_2025
LARAVEL_DB_NAME=mo_laravel_api
CIVICRM_DB_USER=civicrm_user
CIVICRM_DB_PASS=SECURE_CIVICRM_2025
CIVICRM_DB_NAME=mo_civicrm_data
```

### Quality & Security Tools

```bash
CODACY_API_TOKEN=[Von Codacy Dashboard]
SNYK_TOKEN=[Von Snyk Settings]
SONAR_TOKEN=[Von SonarCloud/SonarQube]
```

### n8n Automation

```bash
N8N_USER=[Admin Username für n8n]
N8N_PASSWORD=[Sicheres Passwort für n8n]
N8N_ENCRYPTION_KEY=[32-Zeichen Verschlüsselungsschlüssel]
```

### CiviCRM Integration

```bash
CIVICRM_SITE_KEY=[CiviCRM Site Key]
CIVICRM_API_KEY=[CiviCRM API v4 Key]
JWT_SECRET=[32-Zeichen JWT Secret]
```

### Optional (Performance & Monitoring)

```bash
LHCI_TOKEN=[Lighthouse CI Token, falls verwendet]
SENTRY_DSN=[Sentry Error Tracking, falls verwendet]
```

## 🔧 GitHub Actions Environment Variables

### Development Environment

```bash
NODE_ENV=development
DEBUG=true
ENVIRONMENT=development
```

### Staging Environment

```bash
NODE_ENV=staging
DEBUG=false
ENVIRONMENT=staging
```

### Production Environment

```bash
NODE_ENV=production
DEBUG=false
ENVIRONMENT=production
```

## 📋 Setup Anweisungen

### 1. Repository Secrets einrichten

1. Gehe zu GitHub Repository → Settings → Secrets and variables → Actions
2. Klicke "New repository secret"
3. Füge alle Secrets aus der obigen Liste hinzu

### 2. SSH Key Setup

```bash
# SSH Key generieren (falls nicht vorhanden)
ssh-keygen -t ed25519 -C "github-actions@menschlichkeit-oesterreich.at"

# Public Key auf Plesk Server hinzufügen
ssh-copy-id -i ~/.ssh/id_ed25519.pub dmpl20230054@5.183.217.146

# Private Key als GitHub Secret SSH_PRIVATE_KEY hinzufügen:
cat ~/.ssh/id_ed25519
```

### 3. Codacy API Token

1. Gehe zu Codacy Dashboard
2. Settings → API Tokens
3. Erstelle Token mit "Repository Read" Berechtigung
4. Füge als CODACY_API_TOKEN zu GitHub Secrets hinzu

### 4. Snyk Token

1. Gehe zu Snyk Dashboard
2. Settings → General → Auth Token
3. Kopiere Token
4. Füge als SNYK_TOKEN zu GitHub Secrets hinzu

### 5. n8n Setup

1. Generiere sicheres Passwort für N8N_PASSWORD
2. Generiere 32-Zeichen Key für N8N_ENCRYPTION_KEY:

```bash
openssl rand -hex 32
```

### 6. JWT Secret generieren

```bash
openssl rand -hex 32
```

## ⚠️ Sicherheitsrichtlinien

### NIEMALS in Repository committen

- Echte Passwörter oder API Keys
- SSH Private Keys
- Produktions-Datenbank-Credentials
- Verschlüsselungsschlüssel

### Verwende stattdessen

- GitHub Secrets für CI/CD
- `.env` (in .gitignore) für lokale Entwicklung
- `.env.example` als sichere Vorlage

### Secret Rotation

- **Monatlich**: API Keys (Codacy, Snyk)
- **Vierteljährlich**: Datenbank-Passwörter
- **Jährlich**: SSH Keys und JWT Secrets
- **Sofort**: Bei Verdacht auf Kompromittierung

## 🔍 Secrets Validation

Teste die Secrets mit GitHub Actions:

```yaml
- name: Validate Secrets
  run: |
    echo "Testing database connection..."
    echo "Testing SSH connection..."
    echo "Testing API tokens..."
  env:
    LARAVEL_DB_PASS: ${{ secrets.LARAVEL_DB_PASS }}
    CODACY_API_TOKEN: ${{ secrets.CODACY_API_TOKEN }}
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

## 📞 Support

Bei Problemen mit Secrets:

1. Überprüfe GitHub Actions Logs
2. Validiere Secret-Namen (case-sensitive)
3. Teste lokale .env Konfiguration
4. Kontaktiere DevOps Team bei Plesk-Problemen

---

## 🔑 SSH-Verbindung: Lokal, Codespaces und GitHub Actions

Dieser Abschnitt zeigt die getesteten Wege, um eine SSH-Verbindung
zum Plesk-Host aufzubauen und dabei korrekt mit dem Secret
`SSH_PRIVATE_KEY` und `PLESK_HOST` umzugehen. Wichtige Hinweise:

- `PLESK_HOST` hat das Format `user@host`
  (z. B. `dmpl20230054@5.183.217.146`).
- `SSH_PRIVATE_KEY` ist der Inhalt des privaten Schlüssels
  (nicht der Pfad). Für SSH muss dieser Inhalt vor Benutzung in
  eine Datei geschrieben und mit 600-Rechten versehen werden.
- Always-on-Sicherheit: Host-Key muss in `~/.ssh/known_hosts`
  hinterlegt sein (StrictHostKeyChecking).

### 1) Lokal (Linux/macOS)

```bash
# Optional: Falls dein Key passwortgeschützt ist
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Host-Key einmalig hinterlegen (IP und optional Hostname)
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keyscan -H 5.183.217.146 >> ~/.ssh/known_hosts

# Verbindung testen (mit Standard-Key-Datei)
ssh dmpl20230054@5.183.217.146 "hostname && whoami && uptime"

# Falls ein alternativer Key genutzt wird
ssh -i ~/.ssh/plesk_id_ed25519 dmpl20230054@5.183.217.146
```

Edge Cases lokal:

- Permission denied (publickey): Prüfe, ob der Public Key auf dem
  Server hinterlegt ist (nutze
  `ssh-copy-id -i ~/.ssh/id_ed25519.pub dmpl20230054@5.183.217.146`).
- Bad permissions: Stelle sicher, dass `~/.ssh` 700 und die Key-Datei
  600 Rechte hat.

### 2) Codespaces (oder beliebige CI-ähnliche Shell) mit Umgebungsvariablen

Wenn `SSH_PRIVATE_KEY` als Umgebungsvariable mit dem Key-Inhalt
verfügbar ist, muss er in eine Datei geschrieben werden:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519

# Host-Key sicher hinzufügen
ssh-keyscan -H 5.183.217.146 >> ~/.ssh/known_hosts

# Optional: PLESK_HOST verwenden, fallback auf Default
PLESK_HOST="${PLESK_HOST:-dmpl20230054@5.183.217.146}"

# Verbindung testen
ssh -o StrictHostKeyChecking=yes "$PLESK_HOST" "hostname && whoami"
```

Hinweise:

- `ssh -i` erwartet einen Dateipfad. Wenn der Schlüsselinhalt in einer
  Variable steckt, immer zuerst in eine Datei schreiben (siehe oben).
- Für passwortgeschützte Keys ggf. `ssh-agent` verwenden
  (`eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519`).

### 3) GitHub Actions (empfohlen)

Minimales, sicheres Setup innerhalb eines Jobschritts:

```yaml
- name: Setup SSH and test Plesk connection
  env:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
    PLESK_HOST: ${{ secrets.PLESK_HOST }} # Format: user@host
  run: |
    set -euo pipefail
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_ed25519
    chmod 600 ~/.ssh/id_ed25519
    # Host-Key(s) hinterlegen – IP und optional FQDN
    ssh-keyscan -H 5.183.217.146 >> ~/.ssh/known_hosts
    # Optional: Falls es einen DNS-Namen gibt, ebenfalls hinzufügen
    # ssh-keyscan -H plesk.menschlichkeit-oesterreich.at \
    #   >> ~/.ssh/known_hosts || true

    # Verbindung testen (Strict Host Key Checking aktiv)
    ssh -o StrictHostKeyChecking=yes "$PLESK_HOST" \
      "hostname && whoami && echo 'SSH OK'"
```

Alternativ mit ssh-agent:

```yaml
- name: Setup SSH via ssh-agent
  env:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
  run: |
    eval "$(ssh-agent -s)"
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
    ssh-keyscan -H 5.183.217.146 >> ~/.ssh/known_hosts
    ssh "${{ secrets.PLESK_HOST }}" "echo agent-ok && hostname"
```

### Troubleshooting (häufige Fehler)

- Permission denied (publickey):
  - Public Key nicht auf Server?
    `ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host`
  - Falscher Key? Prüfe, ob der richtige private Key verwendet wird.
- Bad permissions:
  `chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519`.
- Host key verification failed:
  - Host-Key fehlt oder hat sich geändert. Mit
    `ssh-keygen -R 5.183.217.146` alten Eintrag löschen und
    via `ssh-keyscan` neu hinzufügen.
- Key-Format-Fehler: Stelle sicher, dass `SSH_PRIVATE_KEY` exakt
  der Inhalt der privaten Key-Datei ist (inkl. BEGIN/END-Zeilen,
  Unix-Line-Endings).
- Abweichender SSH-Port: Nutze `ssh -p <PORT> user@host` bzw.
  `-oPort=...` in CI; standardmäßig Port 22.

### Sicherheitsrichtlinien (SSH)

- Private Keys nie im Repository speichern – ausschließlich
  über Secrets verwalten.
- StrictHostKeyChecking in CI aktiv halten und `known_hosts`
  explizit pflegen.
- Regelmäßige Key-Rotation (mindestens jährlich oder bei
  Verdacht auf Kompromittierung).
- Zugriffe auditen (Plesk/Server-Logs, wer wann verbunden war).

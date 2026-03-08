# Secrets Policy – Menschlichkeit Österreich

**Version**: 1.0 | **Stand**: 2026-03-08 | **Review**: Quartalsweise

## Geltungsbereich

Diese Policy gilt verbindlich für alle Entwickler:innen, CI/CD-Pipelines, Deployment-Skripte und Automatisierungen, die mit dem Repository `menschlichkeit-oesterreich-development` arbeiten.

---

## 1. Klassifikation von Secrets und Konfigurationsdaten

### Klasse A — Erlaubt im Repo (Klartext)

Darf direkt in Git committet werden:

| Artefakt | Bedingung |
|----------|-----------|
| `.env.example` | Nur Platzhalter: `REPLACE_WITH_...`, `YOUR_KEY_HERE` |
| `config-templates/*.env` | Nur Platzhalter, keine echten Werte |
| `mcp-hosts.json` | Keine echten Tokens enthalten |
| `.gitleaks.toml` | Allowlist-Konfiguration, keine Secrets |
| CI/CD Workflow-Dateien | Nur `${{ secrets.VARNAME }}` Referenzen |
| `gitleaks.toml` | Konfiguration ohne Secrets |

### Klasse B — Nur verschlüsselt erlaubt

Darf nur in verschlüsselter Form committet werden:

| Artefakt | Mechanismus |
|----------|-------------|
| `.env.vault` | dotenv-vault (AES-256) |
| Zertifikate (`.pem`, `.crt`) | Nur wenn selbstsigniert/öffentlich |
| SOPS-verschlüsselte Dateien | `*.sops.yaml` |

### Klasse C — Niemals committen

Unter keinen Umständen in Git:

| Artefakt | Beispiele |
|----------|-----------|
| Echte `.env`-Dateien | `.env`, `.env.production`, `.env.staging` |
| Private Keys | `*.key`, `id_rsa`, `*.pem` (privat) |
| Service-Account-JSON | `*-key.json`, `credentials.json` |
| Datenbankdumps | `*.sql`, `*.dump`, `*.backup` |
| Passwort-Listen | Keine Zugangsdaten in Markdown/CSV |
| Browser-Cookies/Sessions | Exportierte Session-Files |
| Produktions-API-Keys | Egal welches Format |

**Prüfung:** Das `.gitignore` blockt alle Klasse-C-Artefakte. Zusätzlich scannt `gitleaks` bei jedem Push.

---

## 2. Verwaltung von Secrets

### Lokale Entwicklung

```bash
# Neue Entwicklungsumgebung einrichten:
cp .env.example .env
# .env anpassen (wird von .gitignore ausgeschlossen)

# Secrets validieren (vor jedem Commit empfohlen):
python scripts/validate-secrets.py --strict
# oder:
.\scripts\validate-secrets.ps1 -Strict
```

### CI/CD (GitHub Actions)

- Alle Secrets ausschließlich als **GitHub Repository Secrets** oder **GitHub Environment Secrets**
- Referenzierung in Workflows: `${{ secrets.SECRET_NAME }}`
- Niemals Secrets in Workflow-Logs ausgeben (kein `echo $SECRET`)
- Secrets-Inventar: `docs/security/secrets-catalog.md`

### Produktionsdeployment (Plesk)

- Produktions-Secrets über Plesk Environment Variables setzen
- SSH-Keys für Deployment in GitHub Actions als `DEPLOY_KEY` hinterlegen
- Rotation: Alle 90 Tage (PAT-Ablauf-Reminder via `pat-expiry-reminder.yml` Workflow)

### dotenv-vault (`.env.vault`)

```bash
# Neue Secrets in Vault aufnehmen:
npx dotenv-vault push

# Vault-Datei entschlüsseln (lokal, benötigt DOTENV_KEY):
npx dotenv-vault pull
```

---

## 3. Rotation und Lebenszyklus

| Secret-Typ | Rotationsintervall | Verantwortlich |
|-----------|-------------------|----------------|
| GitHub PATs | 90 Tage | Maintainer |
| Deployment SSH Keys | 180 Tage | DevOps |
| API Keys (Extern) | 90 Tage | Service-Owner |
| JWT Secrets | 180 Tage | Backend-Team |
| DB Passwörter | 180 Tage | DevOps |
| n8n Admin-Passwort | 90 Tage | Ops |

---

## 4. Leak Response Checkliste

Wenn ein Secret versehentlich committet wurde:

```
[ ] 1. SOFORT: Secret beim betroffenen Service invalidieren/rotieren
[ ] 2. Git-History bereinigen: git filter-repo --path-glob SECRET_FILE --invert
[ ] 3. Alle offenen PRs/Forks informieren
[ ] 4. GitHub Secret Scanning prüfen: Security → Secret scanning alerts
[ ] 5. Gitleaks-Report analysieren: npm run security:gitleaks
[ ] 6. Incident dokumentieren in docs/operations/incident-response.md
[ ] 7. Post-Mortem: Warum wurde Secret committet? Präventiv verbessern.
[ ] 8. Bei PII-Beteiligung: DSGVO Art. 33 Meldepflicht prüfen (72h)
```

**Wichtig:** Ein `git push --force` zur History-Bereinigung ist in diesem Fall zulässig und erforderlich. Maintainer informieren.

---

## 5. Allowlist-Verwaltung (Gitleaks)

Falsch-Positive in `.gitleaks.toml` als Allowlist eintragen — nicht Secrets abschwächen.

Format:
```toml
[[rules.allowlist]]
description = "Begründung für Ausnahme"
regexes = ['^REPLACE_WITH_']
```

---

## 6. Verantwortlichkeiten

| Rolle | Verantwortung |
|-------|--------------|
| Maintainer | Policy-Pflege, Secret-Audit quartalsweise |
| Entwickler:innen | Klasse-C-Daten niemals committen |
| CI/CD | Automatischer Scan bei jedem Push |
| DevOps | Infrastruktur-Secrets auf Plesk verwalten |

---

*Verwandt: `SECURITY.md`, `docs/security/secrets-catalog.md`, `.env.example`, `.gitleaks.toml`*

# Secret-Exposure Incident Response 2026-03

Status: `SEV-1 / suspected credential exposure`

## Ziel

Reproduzierbare Bearbeitung eines Responsible-Disclosure-Hinweises zu moeglich exponierten Credentials im oeffentlichen Repository `Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development`.

## Bestaetigte Repo-Fakten

- Oeffentliche Referenzen auf `office@menschlichkeit-oesterreich.at` und `n8n.menschlichkeit-oesterreich.at` existieren in Templates, Doku und n8n-Workflow-Dateien.
- `automation/n8n/.env.example` dokumentiert, dass fruehere Versionen Klartext-Passwoerter enthielten.
- Das Gitleaks-Gate scannt jetzt die komplette Git-History statt nur den aktuellen Arbeitsbaum.
- `.env.vault` darf nicht mehr im oeffentlichen Repository versioniert werden; das ENV-Guard- und Validate-Secrets-Gate blockiert diesen Fall explizit.

## Sofortmassnahmen

1. Deployments und nicht sicherheitsrelevante Aenderungen pausieren.
2. Evidence sichern: `git bundle`, Disclosure-Hinweis, Audit-Artefakte.
3. P0-Zugaenge vorbereiten und rotieren:
   - `office@menschlichkeit-oesterreich.at`
   - n8n Admin / Basic Auth
   - `N8N_WEBHOOK_SECRET`
   - `MOE_API_TOKEN`, `CIVI_API_KEY`, `CIVI_SITE_KEY`, `JWT_SECRET`
   - SMTP/Mailbox-Passwoerter fuer Automation
4. Missbrauchspruefung parallel starten:
   - n8n Login-/Execution-Logs
   - Reverse-Proxy / Webserver
   - Mailbox-Auth-Events
   - GitHub Actions / Hooks / Deployments / Secret-Management

## Reproduzierbare Commands

```bash
npm run security:incident:audit
npm run security:rewrite-public-secrets -- -ReplaceText ../replace-text.txt -MirrorDir ../repo-ir-clean.git
```

Direkte Skripte:

```bash
bash scripts/security/incident-secret-audit.sh
bash scripts/security/rewrite-public-secrets.sh --replace-text /path/to/replace-text.txt --mirror-dir /path/to/repo.git
```

## Kommunikationsvorlagen

### Intern

> Wir behandeln einen Responsible-Disclosure-Hinweis zu potenziell exponierten Credentials im oeffentlichen Repository als Security-Incident. Aktuell gibt es oeffentliche Referenzen auf betroffene Systeme/Konten und Hinweise auf fruehere Klartext-Credentials in der Historie; Rotation, History-Scan und Log-Audit laufen. Bis zur Freigabe sind Deployments und nicht sicherheitsrelevante Aenderungen pausiert.

### Disclosure-Antwort

> Vielen Dank fuer den Hinweis. Wir haben den Vorgang als Security-Incident aufgenommen, die Pruefung und vorsorgliche Rotation betroffener Zugaenge eingeleitet und untersuchen die Git-Historie sowie betroffene Systeme. Aus Sicherheitsgruenden teilen wir keine operativen Details, melden uns aber nach Abschluss der Massnahmen mit einem Statusupdate.

### Ticket

> Titel: P0 Security Incident - suspected secret exposure in public repo
>
> Scope: repo current tree + full history + GitHub Actions/Environments + n8n + mail/SMTP + webhooks
>
> Tasks: freeze deployments, full history scan, prioritized rotation, git-filter-repo sanitation, force-push communication, log/audit review, hardening follow-ups

## Abschlusskriterien

- Alle P0-Zugaenge rotiert und validiert.
- `gitleaks` History-Scan ohne bestaetigte Secret-Treffer auf bereinigter Historie.
- Force-Push-Kommunikation und Cache-/Fork-Nachbereitung abgeschlossen.
- Hardening-Changes aus diesem Incident in Branch Protection, Secret Scanning und Runtime-Defaults uebernommen.

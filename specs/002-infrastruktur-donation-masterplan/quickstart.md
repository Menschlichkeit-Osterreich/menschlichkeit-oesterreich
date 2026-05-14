# Quickstart: Infrastruktur, Donation und Governance Masterplan

## Zweck

Dieser Quickstart beschreibt den minimalen Ausfuehrungspfad, um den Masterplan kontrolliert umzusetzen und die Freigabereife je Phase nachzuweisen.

## Voraussetzungen

- Zugriff auf das Repository und die aktiven Servicepfade
- Berechtigung fuer Azure-/Infra- und Secret-Administration gemaess Rollenmodell
- Konfigurierter CI-Zugriff auf GitHub Actions
- Zugriff auf Slack- und E-Mail-Alerting-Ziele

## 1) Basis-Checks lokal ausfuehren

```bash
npm run workspace:config:check
npm run governance:check
npm run quality:gates
```

Erwartetes Ergebnis:

- Konfigurations- und Governance-Checks sind gruen.
- Keine blockerrelevanten Quality-Gate-Verletzungen.

## 2) Infrastruktur-Gates vorbereiten

```bash
# Beispielhafte Reihenfolge
npm run mcp:check
npm run mcp:health
```

Erwartetes Ergebnis:

- Tooling ist verfuegbar und reproduzierbar.
- Nachweisartefakte fuer Budget-/Infra-Gates sind dokumentierbar.

## 3) Donation-Gate verifizieren

```bash
npm run n8n:validate
npm run test:api
```

Erwartetes Ergebnis:

- Workflow-Validierung erfolgreich.
- API-Pruefungen fuer den Donation-relevanten Pfad ohne Blocker.

## 4) Freigabekriterien pruefen

Vor Produktionsfreigabe sicherstellen:

- Go-Kriterien vollstaendig erfuellt.
- Keine No-Go-Verletzung offen.
- Betriebsziele erfuellt: Verfuegbarkeit >= 99,9%, RTO <= 2h.
- Kritische Alert-Prozesse: Slack+E-Mail aktiv, Ack <= 30 Minuten.
- Restore-Test dokumentiert und erfolgreich.

## 5) Nachweise dokumentieren

- Evidence-Links und Resultate pro Gate festhalten.
- Offene Risiken explizit als Blocker oder Rest-Risiko kennzeichnen.
- Freigabeentscheidung inkl. Rollen-Ownership protokollieren.

## Nicht-Ziele in diesem Quickstart

- Kein Big-Bang-Deployment ohne Phasen-Gates
- Keine manuelle Produktionsaenderung ausserhalb von IaC
- Keine Freigabe ohne Restore- und Donation-Nachweis

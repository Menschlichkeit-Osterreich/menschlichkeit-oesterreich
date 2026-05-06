# Runbook: P1 Incident – Kritischer Vorfall

**Letztes Update**: 2026-03-08 | **Verwandte SOPs**: [Incident Response](../docs/operations/incident-response.md)

> Dieses Runbook ist für **sofortige Ausführung** bei kritischen Incidents konzipiert.
> Lies zuerst, handle dann. Kein Schritt überspringen.

---

## Klassifikation prüfen

**P0 (24/7, sofort):** Komplettausfall, Datenleck, DSGVO-Vorfall
**P1 (< 2h):** Wesentliche Funktion ausgefallen, Security-Issue erkannt

Bei Unsicherheit: Als P0 behandeln, besser zu früh eskalieren als zu spät.

---

## Schritt 1: Lage erfassen (Ziel: < 3 min)

```bash
npm run status:check
npm run status:verbose
docker-compose ps
```

Fragen beantworten:
- Welcher Service ist down? (API / CRM / Frontend / DB / n8n)
- Seit wann? (Monitoring-Alert-Timestamp)
- Nutzer-Impact? (Alle / Teile / Nur Admin)
- Sicherheitsrelevant? (Datenleck? Secret exposed? Auth broken?)

---

## Schritt 2: Eskalation (Ziel: < 5 min)

**Sofort melden an:** security@menschlichkeit-oesterreich.at (+ On-Call wenn P0)

Nachricht-Template:
```
SUBJECT: [P1 INCIDENT] [Service] – [Kurzbeschreibung]

Zeitpunkt: [HH:MM]
Betroffener Service: [API / CRM / Frontend / DB]
Symptom: [Was ist beobachtbar]
Erster Befund: [Was logs/status:check zeigen]
Maßnahmen in Progress: [Was ich gerade tue]
DSGVO-relevant: Ja / Nein / Unklar
```

---

## Schritt 3: Eindämmung nach Service

### API down

```bash
docker-compose restart api  # falls via Docker
# Logs prüfen:
docker-compose logs --tail=50 api
# Healthcheck:
curl -v https://api.menschlichkeit-oesterreich.at/health
```

### Datenbank nicht erreichbar

```bash
docker-compose ps postgres
docker-compose logs --tail=100 postgres
docker-compose restart postgres
# Warten bis healthy (10-30s):
docker-compose ps
```

### CRM down

```bash
# Plesk → Domains → crm... → PHP-FPM restart
# Via SSH:
sudo systemctl restart php8.1-fpm
# Drupal-Cache:
drush cr
```

### Secret geleaked / Security-Incident

```bash
# 1. SOFORT Secret rotieren beim Anbieter (GitHub PAT, API-Key, DB-PW)
# 2. Gitleaks-Scan:
npm run security:gitleaks
# 3. History bereinigen falls in Git:
#    git filter-repo --path-glob DATEINAME --invert
# 4. Alle Tokens die den alten Key verwendet haben als kompromittiert betrachten
```

### Vollständiger Ausfall (DB + API)

```bash
# 1. Docker komplett neu starten:
npm run docker:down
npm run docker:up
sleep 20

# 2. Migrations prüfen (Alembic):
cd api.menschlichkeit-oesterreich.at
alembic current
alembic upgrade head

# 3. Status:
npm run status:check
```

---

## Schritt 4: Incident-Dokumentation anlegen (parallel zu Schritt 3)

Datei erstellen: `docs/incidents/YYYY-MM-DD-HH-kurzbeschreibung.md`

Mindestinhalt:
```markdown
# Incident: [Beschreibung]
**Zeitpunkt**: YYYY-MM-DD HH:MM
**Severity**: P1
**Status**: Investigating

**Beobachtung**: [Was ist passiert]
**Erstmaßnahmen**: [Was wurde getan]
```

Dokument im Laufe des Incidents ergänzen.

---

## Schritt 5: Wiederherstellung prüfen

```bash
npm run status:check
# Alle kritischen Endpunkte manuell prüfen:
curl -f https://menschlichkeit-oesterreich.at
curl -f https://api.menschlichkeit-oesterreich.at/health
# Lighthousetest wenn Zeit:
npm run performance:lighthouse
```

**Erst wenn alle Checks grün → Incident als resolved markieren.**

---

## Schritt 6: Post-Incident (innerhalb 24h nach P1)

```
[ ] Incident-Dokument vervollständigen (Root Cause, Timeline, Resolution)
[ ] Monitoring-Alert ergänzen (damit nächstes Mal früher erkannt)
[ ] Präventionsmaßnahmen als GitHub Issue anlegen
[ ] DSGVO-Relevanz abschließend bewertet (falls PII betroffen: Art. 33 DSGVO prüfen)
[ ] Lessons Learned in Team-Meeting besprechen
```

---

## Notfall-Kontakte

| Rolle | Kontakt |
|-------|---------|
| Security / Datenschutz | security@menschlichkeit-oesterreich.at |
| DPO | datenschutz@menschlichkeit-oesterreich.at |
| Plesk-Admin | [Intern, nicht im Repo] |

**Österreichische Datenschutzbehörde (bei DSGVO-Vorfall):** https://www.dsb.gv.at

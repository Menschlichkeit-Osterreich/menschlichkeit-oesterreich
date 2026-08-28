# Findings — Platform-Audit 2026-08-28

Schweregrade: **P0** akute Gefahr für Daten/Zahlungen/Sicherheit/Betriebsfähigkeit ·
**P1** hohe Wahrscheinlichkeit für Inkonsistenz, Ausfall oder Datenfehler ·
**P2** Architekturdrift und fehlende Betriebsreife · **P3** Dokumentation und
Optimierung.

Statuswerte: `OPEN`, `IN_PROGRESS`, `FIXED_REPO`, `DEPLOYED`, `VERIFIED_LIVE`,
`ACCEPTED_RISK`, `BLOCKED`.

---

## P0-001 — Produktionsdeployment wartet auf Environment-Freigabe und verfällt

**Status:** `BLOCKED` (nicht aus dem Repository behebbar)
**Evidenz:** EV-0021
**Betroffen:** gesamte Produktionsauslieferung

**Problem.** Der Job `Deploy → Plesk` (`deploy-plesk.yml:376`,
`environment: production`) startet, führt **keinen einzigen Step** aus und
schließt exakt 30 Tage später mit `failure` ab. In Run 244 waren alle sechs
vorgelagerten Jobs erfolgreich — der Deploy-Job hing dennoch von
`2026-05-19T18:27:20Z` bis `2026-06-18T18:27:21Z`. Dasselbe Muster in den Runs
236–243.

**Auswirkung.** Auch nach Behebung von P0-002 deployt die Pipeline nicht. Das
ist der eigentliche, ältere Blocker.

**Ursache (INFERRED, starke Evidenz).** Eine
GitHub-Environment-Protection-Rule am Environment `production` — erforderliche
Prüfer oder ein Wait-Timer — hält den Job bis zum 30-Tage-Verfall. Null
ausgeführte Steps schließen einen Fehler *innerhalb* des Jobs aus.

**Lösung.** Administrationsaktion unter *Settings → Environments → production*:
entweder die erforderlichen Prüfer entfernen bzw. auf eine Person setzen, die
Freigaben tatsächlich erteilt, oder — wenn Freigaben gewollt sind — einen
Prozess etablieren, der sie zeitnah erteilt. Zusätzlich empfohlen: ein
Alerting, das eine ausstehende Deploy-Freigabe meldet, statt sie 30 Tage lang
unbemerkt verfallen zu lassen.

**Verifikation.** Ein Push auf `main` läuft grün durch bis einschließlich
`Deploy → Plesk`, und `https://www.menschlichkeit-oesterreich.at/.deploy_release`
gibt den erwarteten Commit-Marker zurück.

---

## P0-002 — `setup-node` bricht ab, Deploy-Job wird stillschweigend übersprungen

**Status:** `FIXED_REPO`
**Evidenz:** EV-0022, EV-0023, EV-0024
**Betroffen:** `deploy-plesk.yml`

**Problem.** `cache-dependency-path: apps/website/package-lock.json`
(`:124`, `:220`) verweist auf eine Datei, die seit Commit `46dd460`
(2026-05-19) nicht mehr existiert. `actions/setup-node` bricht bei einem nicht
auflösbaren Pfad ab. Die Jobs *Frontend bauen (Vite)* und *Unit Tests* sind
`needs`-Vorbedingung des Deploy-Jobs — dieser wurde daraufhin **`skipped`**.

**Auswirkung.** Ein Deployment findet nicht einmal versuchsweise statt. Der
Fehler sieht in der UI wie ein Build-Problem aus, nicht wie ein
Deployment-Ausfall — deshalb blieb er unbemerkt.

**Lösung (umgesetzt).** `apps/website` ist ein npm-Workspace der
Root-`package.json`; der einzige zugehörige Lockfile liegt im Repo-Root. Der
Cache-Pfad zeigt jetzt dorthin. `npm ci` in `apps/website` funktioniert
unverändert (verifiziert, exit 0).

**Regressionsschutz.** `scripts/ci/validate-workflow-cache-paths.py`, eingebunden
in `validate-github-files.yml`, schlägt fehl, sobald ein
`cache-dependency-path` nicht auflösbar ist.

---

## P0-003 — Drupal `hash_salt` mit im Repository sichtbarem Fallback

**Status:** `FIXED_REPO`
**Evidenz:** EV-0030
**Betroffen:** `apps/crm/web/sites/default/settings.php`

**Problem.** Vor der Korrektur:

```php
$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: 'MenschlichkeitOesterreich2024PleaseChangeInProd';
```

Zusätzlich fiel `DRUPAL_DB_PASS` auf `''` zurück.

**Auswirkung.** Der `hash_salt` schützt Session-Token, CSRF-Token und
One-Time-Login-Links. Ein öffentlich im Repository lesbarer Wert entwertet
diesen Schutz vollständig — Session- und Passwort-Reset-Token wären fälschbar.
Der Fallback greift lautlos: ein Produktionsstart ohne gesetztes Secret wäre
erfolgreich und unsicher gewesen.

**Mildernder Umstand.** Drupal ist laut EV-0005 derzeit nicht deployt. Der
Befund ist damit noch nicht ausgenutzt worden — er wäre aber bei der ersten
Inbetriebnahme sofort scharf geworden.

**Lösung (umgesetzt).** `settings.php` ist in `APP_ENV=production` fail-closed:
fehlende oder leere Pflicht-Secrets (`DRUPAL_HASH_SALT`, `DRUPAL_DB_NAME`,
`DRUPAL_DB_USER`, `DRUPAL_DB_PASS`) lösen eine `RuntimeException` aus und
brechen den Start ab. Außerhalb der Produktion greift ein ausdrücklich als
unsicher markierter Entwicklungswert. Der alte Festwert ist aus dem Repository
entfernt. Sechs Testfälle verifiziert — siehe
[18-implementation-log.md](18-implementation-log.md).

---

## P1-001 — Stripe-Webhook: Geschäftsdaten vor Event-Persistenz

**Status:** `OPEN`
**Evidenz:** EV-0031
**Betroffen:** `apps/api/app/routers/payments.py:104-201`

**Problem.** Die Reihenfolge ist: Signaturprüfung → Idempotenz-Vorprüfung →
**Geschäftslogik** (`:139-150`) → **erst dann** `record_webhook_event`
(`:195`). Der Code kommentiert das explizit als beabsichtigt (`:194`).

**Fehlermodus.** Wenn `record_successful_donation` committet, aber
`record_webhook_event` anschließend fehlschlägt (DB-Fehler, Timeout,
Prozessabbruch, Deploy während der Verarbeitung), wiederholt Stripe das Event.
Die Idempotenz-Vorprüfung bei `:127` findet dann **keinen** Eintrag in
`webhook_events` — **die Spende wird ein zweites Mal gebucht**.

Zweiter Fehlermodus: wirft die Geschäftslogik eine Exception, wird das Event
**nie** persistiert. Es gibt keine DLQ und keinen Fehlerstatus; nach
Erschöpfung der Stripe-Retries ist der Vorgang verloren und nirgends sichtbar.

**Auswirkung.** Doppelbuchungen echter Spenden und stiller Verlust von
Zahlungsereignissen. Beides betrifft Finanzdaten.

**Empfohlene Lösung.** Inbox-Muster: das Event unmittelbar nach der
Signaturprüfung mit `provider_event_id` als Unique Constraint und Status
`received` speichern, dann die Geschäftslogik in einer eigenen Transaktion
ausführen und den Status auf `processed` bzw. `failed` setzen. Retry und DLQ
setzen auf diesem Status auf. Die Unique Constraint — nicht die Vorprüfung —
muss die Idempotenz garantieren.

**Änderungsrisiko.** Mittel: berührt den Zahlungspfad und erfordert eine
Datenbankmigration an `webhook_events`. Nicht ohne Tests gegen wiederholte
Events umzusetzen. **Vor jeder Wiederinbetriebnahme des Spendenflusses zu
beheben.**

---

## P1-002 — Spender-E-Mail wird an Slack übermittelt

**Status:** `OPEN`
**Evidenz:** EV-0032
**Betroffen:** `apps/api/app/routers/payments.py:61-74`

**Problem.** Bei jedem `payment_intent.payment_failed` geht an Slack:

```text
• Donor: `{donor_email}`
• Intent: `{gateway_intent_id}`
```

**Auswirkung.** Personenbezogene Daten (E-Mail-Adresse in Verbindung mit einem
fehlgeschlagenen Spendenversuch — eine besonders sensible Kombination)
verlassen die Plattform an einen externen Dienst und liegen dort dauerhaft im
Kanalverlauf. Kollidiert mit der bindenden Regel „Keine PII in Logs" aus
`CLAUDE.md`.

**Empfohlene Lösung.** Slack erhält nur betriebsnotwendige, datensparsame
Angaben: Event-Typ, Betrag, Währung, Zeitstempel und eine interne
Korrelations-ID. Die Zuordnung zur Person erfolgt über die
Korrelations-ID im internen System. Der bestehende E-Mail-Kanal an
`ADMIN_EMAILS` (`:42-54`) kann personenbezogene Daten weiterhin führen, sofern
das dokumentiert und zulässig ist — er geht nicht an einen Dritten.

**Änderungsrisiko.** Gering, lokal begrenzt.

---

## P1-003 — `donation_type` hartkodiert, `purpose` als `source` gespeichert

**Status:** `OPEN`
**Evidenz:** EV-0033
**Betroffen:** `apps/api/app/routers/payments.py:147-148`

**Problem.**

```python
donation_type="one_time",
source=obj.get("metadata", {}).get("purpose") or "Stripe",
```

**Auswirkung.** Jede erfolgreiche Zahlung wird als Einmalspende verbucht.
Sollten wiederkehrende Zahlungen angeboten werden, sind sie in den Daten nicht
unterscheidbar — mit Folgen für Spendenberichte, Bestätigungen und jede
spätere Buchhaltungsabstimmung. Zusätzlich werden „wofür gespendet wurde"
(`purpose`) und „woher die Spende kam" (`source`) in dasselbe Feld geschrieben;
die Zweckbindung geht verloren.

**Empfohlene Lösung.** `donation_type` aus dem tatsächlichen Stripe-Objekt
ableiten (Vorhandensein einer Subscription bzw. eines Invoice-Bezugs) und
`purpose` in ein eigenes Feld schreiben.

**Vorbedingung.** Die Geschäftsregel ist zu bestätigen, bevor der Code geändert
wird: Werden wiederkehrende Beiträge tatsächlich angeboten? Was bedeutet
`source` fachlich? Ohne diese Klärung wäre jede Änderung geraten. Deshalb hier
nur dokumentiert, nicht umgesetzt.

**Angrenzend, ungeprüft.** Die Masterprompt-Hypothesen zu `receipt_eligible`
(pauschal `TRUE`) und zu `setup_future_usage=off_session` ohne echte
Stripe-Subscription wurden in diesem Audit **nicht** verifiziert. Sie bleiben
`UNKNOWN` und sind gemeinsam mit der Geschäftsregel zu klären.

---

## P2-001 — Zwei parallele n8n-Betriebsverträge

**Status:** `OPEN`
**Evidenz:** EV-0034, EV-0007

**Problem.** `docker-compose.yml` (Root) betreibt n8n 1.72.1 gegen einen mit
phpBB **geteilten** `postgres:16` und `redis:7`.
`automation/n8n/docker-compose.yml` betreibt dieselbe n8n-Version gegen eine
**dedizierte** `postgres:15` und eigene Redis-Instanz. Unterschiedliche
Major-Versionen der Datenbank, unterschiedliche Isolationsniveaus,
unterschiedliche Passwort-Strategien.

**Live-Kontext, der die Priorität senkt.** Unter
`n8n.menschlichkeit-oesterreich.at` läuft **keine** der beiden Instanzen
(EV-0007, Plesk-Standardseite). Die Frage „welche Instanz ist kanonisch?" ist
derzeit rein theoretisch.

**Empfohlene Lösung.** Genau einen Betriebsvertrag festlegen, **bevor** eine
Instanz in Betrieb geht. Fachlich spricht die dedizierte Variante
(`automation/n8n/`) dafür: eigene Datenbank, kein geteilter Zustand mit phpBB,
fail-closed-Secrets. Die 27 Workflow-Dateien unter `automation/n8n/` sind dann
gegen diesen einen Vertrag zu inventarisieren.

**Hinweis zur Reihenfolge.** Die im Masterprompt geforderte
n8n-/Make-Migrationsmatrix setzt voraus, dass bekannt ist, welche Workflows
*produktiv laufen*. Da keine Instanz läuft, ist die ehrliche Antwort:
**keiner**. Eine Migrationsentscheidung „n8n → Make" ohne laufende Instanz
wäre eine Entscheidung über nicht existierenden Betrieb.

---

## P2-002 — Fail-open Default-Credentials in Compose-Dateien

**Status:** `OPEN`
**Evidenz:** EV-0035

| Datei | Zeile | Wert |
| ----- | ----- | ---- |
| `docker-compose.yml` | 11 | `POSTGRES_PASSWORD: postgres` (hartkodiert) |
| `docker-compose.yml` | 53, 132, 135 | `${PHPBB_DB_PASSWORD:-phpbb_dev}` |
| `automation/elk-stack/docker-compose.yml` | 25, 59, 90, 194 | `${ELASTIC_PASSWORD:-changeme}` |

**Problem.** Bei fehlender Env-Variable startet der Stack mit einem bekannten
Passwort, statt abzubrechen.

**Empfohlene Lösung.** Dasselbe Muster wie in `automation/n8n/docker-compose.yml`
bereits korrekt verwendet: `${VAR:?Fehlermeldung}` statt `${VAR:-default}`.
Für rein lokale Entwicklungsstacks ist ein Default vertretbar, wenn die Datei
eindeutig als Entwicklungsstack gekennzeichnet ist und nicht als
Produktionsvorlage dienen kann.

**Nicht in diesem Audit umgesetzt**, weil unklar ist, welche dieser
Compose-Dateien als Entwicklungs- und welche als Produktionsvorlage gedacht
sind. Eine Umstellung auf fail-closed würde lokale Entwicklungsabläufe brechen,
ohne dass der Nutzen belegt wäre.

---

## P2-003 — Frontend wird gegen einen nicht existierenden API-Host gebaut

**Status:** `OPEN`
**Evidenz:** EV-0003

**Problem.** `deploy-plesk.yml:140` setzt beim Build
`VITE_API_URL: 'https://api.${MAIN_DOMAIN}'`. Dieser Name löst nicht auf
(NXDOMAIN). Der Wert wird in das Bundle kompiliert.

**Auswirkung.** Jeder API-Aufruf des ausgelieferten Frontends schlägt fehl.
Welche Funktionen der Website davon betroffen sind, wurde nicht funktional
getestet — die Startseite rendert.

**Zu klären.** Soll `api.` eingerichtet werden, oder soll die API unter einem
anderen Pfad erreichbar sein? Die Antwort bestimmt, ob eine DNS-Änderung oder
eine Konfigurationsänderung nötig ist.

---

## P3-001 — Dokumentation beschreibt eine Plattform, die nicht in Betrieb ist

**Status:** `OPEN`
**Evidenz:** gesamtes Live-Kapitel des Evidence Ledgers

**Problem.** Das Repository enthält umfangreiche Runbooks, Readiness-Reports
und Betriebsdokumente (u. a. `PRODUCTION-READINESS-REPORT.json`,
`runbooks/operations-masterplan/`), die einen laufenden Mehrsystembetrieb
beschreiben. Live existieren API, CRM, ERPNext, n8n und Forum nicht.

**Empfohlene Lösung.** Nach Klärung des Zielbilds (siehe
[17-remediation-plan.md](17-remediation-plan.md), Schritt 3) die betroffenen
Dokumente entweder als *geplant/nicht in Betrieb* kennzeichnen oder als Legacy
markieren. **Nicht** vor dieser Klärung löschen — der Unterschied zwischen
„geplant" und „aufgegeben" ist eine fachliche Entscheidung, keine technische.

---

## Korrektur an der Ausgangshypothese

**`automation/n8n` enthält kein `admin123`.** Der Masterprompt nennt
`N8N_BASIC_AUTH_PASSWORD=admin123` als Befund. Der aktuelle Stand nutzt
`${N8N_PASSWORD:?N8N_PASSWORD muss in .env gesetzt sein}` — fail-closed — und
`CHANGE_ME_`-Platzhalter in `.env.example`. Der Befund ist **veraltet**; das
Repository ist an dieser Stelle besser als angenommen (EV-0036).

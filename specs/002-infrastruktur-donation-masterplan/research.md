# Research: Infrastruktur, Donation und Governance Masterplan

## Entscheidung 1: IaC-Standard verbindlich auf Terraform + AVM

- **Decision**: Azure-Infrastruktur wird verbindlich ueber Terraform mit Azure Verified Modules (AVM) beschrieben und geaendert.
- **Rationale**: Einheitliche Definitions- und Reviewbasis reduziert manuellen Drift, erhoeht Teamfaehigkeit und verbessert Auditierbarkeit.
- **Alternatives considered**:
  - Bicep-only.
  - Gemischte IaC-Standards ohne Leitplanke.
  - Verworfen wegen hoeherem Betriebs- und Governance-Risiko.

## Entscheidung 2: Exposition strikt auf Reverse-Proxy begrenzen

- **Decision**: Nur Reverse-Proxy wird extern exponiert; API und n8n laufen intern hinter dem Proxy.
- **Rationale**: Minimiert Angriffsoberflaeche und erzwingt konsistente TLS-/Header- und Routingkontrolle.
- **Alternatives considered**:
  - Direkte Exposition einzelner Dienste.
  - Vollstaendig internes System mit VPN-only bereits ab Start.
  - Verworfen zugunsten eines sicheren, aber pragmatischen Betriebsmodells.

## Entscheidung 3: Verbindliche Betriebsziele (SLO/RTO/Alert-Ack)

- **Decision**: Verfuegbarkeit >= 99,9% pro Monat, RTO <= 2h, kritische Alerts binnen 30 Minuten bestaetigt.
- **Rationale**: Schafft messbare Betriebserwartungen und klare Eskalationspflicht fuer produktive Vorfaelle.
- **Alternatives considered**:
  - Best-Effort ohne harte Kennzahlen.
  - Striktes 24/7-Modell ab Tag 1.
  - Verworfen zugunsten einer umsetzbaren Startreife.

## Entscheidung 4: Gate-basierter Rollout statt Big-Bang

- **Decision**: Umsetzung erfolgt phasenweise mit harten Exit-Kriterien und Nachweisartefakten vor jedem Uebergang.
- **Rationale**: Reduziert Migrationsrisiko und verhindert unbelegte Produktionsfreigaben.
- **Alternatives considered**:
  - Einmalige Gesamtmigration ohne Zwischen-Gates.
  - Parallele Tracks ohne zentrale Freigabekriterien.
  - Verworfen wegen hoher Fehler- und Reworkgefahr.

## Entscheidung 5: Donation-Pipeline bleibt API-first

- **Decision**: Business-Logik verbleibt in `apps/api`; n8n orchestriert Integrations- und Folgeprozesse.
- **Rationale**: Vermeidet verteilte Fachlogik und verbessert Testbarkeit, Versionierung und Compliance-Nachweise.
- **Alternatives considered**:
  - Vollstaendige Prozesslogik in n8n.
  - Direktkopplung ohne zentrales Fehler-/Retry-Modell.
  - Verworfen wegen geringer Wartbarkeit und hoeherem Risiko.

## Entscheidung 6: DSGVO/Logging strikt evidence-getrieben

- **Decision**: Keine Secrets/PII in Logs; Datenschutz- und Loeschpfade werden mit dokumentierten Evidenzen und Verantwortlichkeiten verankert.
- **Rationale**: Erfuellt Vereins- und DSGVO-Anforderungen und verbessert Revisionsfaehigkeit.
- **Alternatives considered**:
  - Ad-hoc-Prozesse ohne zentrale Nachweiskette.
  - Verteilte Dokumentation ohne definierte Ownership.
  - Verworfen zugunsten klarer Governance.

## Ergebnis fuer Phase 1

Alle fuer die Planung relevanten Unklarheiten sind aufgeloest. Die technischen Leitplanken fuer IaC, Exposition, SLO/RTO, Alerting, API-first und Governance sind explizit festgelegt und in die Spezifikation uebernommen.

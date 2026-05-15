# Wave Plan: Repo-weite Speckit-Orchestrierung

Stand: 2026-05-15

## Ziel

Alle offenen Issues werden in ein einheitliches Wellenmodell ueberfuehrt, damit App- und Cross-App-Abarbeitung transparent gesteuert werden kann.

## Offene Issues (REST-Auswertung)

- Gesamt offen: 134
- Ohne Assignee: 38
- Ohne Milestone: 39
- Ohne Labels: 1

## Speckit-Cluster

- spec/speckit-multiapp: 20
- spec/speckit-repowide: 30
- spec/n8n-gate: 26
- backlog/legacy: 8

## Wellenlogik

- Wave A (P0 Critical): P0, phase/us2-donation, phase/us3-governance
- Wave B (P0/P1 Core): spec/n8n-gate, backlog/legacy, area/integrations, area/interface
- Wave C (P1 Experience): area/screens-_, area/figma, area/templates, area/design-_, area/flows
- Wave D (P1/P2 Hardening): phase/us4-resilience, phase/us6-handover, masterplan
- Wave E (P2 Optimization): Restmenge

## App-Zuordnung

- API: Wave A/B fuer Vertrags- und Integrationsstabilitaet
- Website: Wave A/C fuer User-Flows, Performance, Accessibility
- CRM: Wave A/B fuer Zahlungs- und Membership-Pfade
- Forum: Wave C/D fuer Security/Governance und Betrieb
- Babylon-Game: Wave C/E fuer Integrationen und Optimierungen

## Synchronisation GitHub Project

Die direkte Project-Steuerung war zeitweise durch GitHub GraphQL Rate-Limit blockiert.

Nach Rate-Reset:

1. Alle offenen Issues in Project #2 aufnehmen
2. Feld `Plan Wave` setzen (A-E)
3. Feld `Workflow Status` gemaess Welle synchronisieren

## Verifizierungsquery

- `state:open repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich sort:updated-desc`

## Kontrollcheckliste

- [ ] 100% offene Issues im Project #2
- [ ] 100% offene Issues mit Wave-Zuordnung
- [ ] 100% offene Issues mit Workflow Status
- [ ] Keine offenen exakten Duplikate
- [ ] Kein unlabeled Open-Issue ohne Planungsbezug

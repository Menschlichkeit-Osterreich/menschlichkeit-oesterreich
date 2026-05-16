# Wave A Startpaket (2026-05-16)

## Ziel

Dieses Startpaket operationalisiert Wave A mit den ersten drei
umsetzungsrelevanten Speckit-Tasks:

- A001 (api): Endpunkt-Inventar und Ownership-Mapping
- W001 (website): Taskcluster nach User-Flows strukturieren
- W002 (website): API-Website-Abhaengigkeiten explizit verknuepfen

## Scope

### In Scope

1. API-Ownership-Transparenz fuer produktive und entwicklungsrelevante
   Endpunkte in `apps/api` herstellen.
2. Website-Arbeitspakete entlang der Kernfluesse Landing, Auth und Donation
   clustern.
3. Explizite Abhaengigkeiten zwischen Website- und API-Issues als
   nachvollziehbare Kante dokumentieren.

### Out of Scope

1. Keine Implementierung neuer Features in `apps/api` oder `apps/website`.
2. Keine Aenderung am Deployment- oder Infrastruktur-Setup.
3. Keine Verschiebung in Wave B/C, sofern kein dokumentierter Blocker vorliegt.

## Arbeitspaket A001

### Deliverables

1. API-Endpunkt-Inventar als Markdown-Artefakt mit Endpoint, Methode,
   Besitzerrolle, Risiko (P0/P1/P2), Status.
2. Ownership-Mapping je API-Domain (Auth, Donation, Newsletter, CRM-Sync).
3. Liste offener Ownership-Luecken mit konkreter Zuweisungsempfehlung.

### Definition of Done

1. Alle in Wave A relevanten Endpunkte sind inventarisiert.
2. Jeder inventarisierte Endpunkt hat genau einen primaeren Owner.
3. Offene Ownership-Luecken sind als Action-Items dokumentiert.

## Arbeitspaket W001

### Deliverables

1. Website-Taskcluster fuer die Fluesse Landing, Auth, Donation.
2. Je Cluster: Ziel, betroffene Issues, Abnahmeindikator, Blocker.
3. Priorisierte Reihenfolge innerhalb Wave A (`must`, `should`, `could`).

### Definition of Done

1. Jeder der drei User-Flows hat ein eigenes, klar abgegrenztes Cluster.
2. Alle Website-Issues aus #383 bis #385 sind einem Cluster zugeordnet.
3. Reihenfolge ist begruendet und mit Wave-A-Zielbild konsistent.

## Arbeitspaket W002

### Deliverables

1. API-Website-Dependency-Matrix (Issue-zu-Issue).
2. Markierung kritischer Blocker-Kanten (hart) vs. Soft-Dependencies.
3. Vorschlag fuer Umsetzungsreihenfolge, die Blocker minimiert.

### Definition of Done

1. Jede Website-Aufgabe in Wave A referenziert benoetigte API-Aufgaben.
2. Kritische Abhaengigkeiten sind explizit als Blocker markiert.
3. Keine unerklaerten Reihenfolgewechsel mehr in Wave A.

## Empfohlene Ausfuehrungsreihenfolge

1. A001 zuerst: Ohne Ownership ist jede weitere Planung fragil.
2. W001 danach: Website-Cluster auf Basis der API-Transparenz ausrichten.
3. W002 abschliessend: Abhaengigkeiten explizit verbinden und Reihenfolge
   finalisieren.

## Board-Operationalisierung (Project #2)

1. `#380 (A001)` -> Ready -> In Progress
2. `#383 (W001)` -> Ready nach A001-Start
3. `#384 (W002)` -> Ready nach Erstentwurf W001
4. Work-in-progress-Limit: maximal 2 Issues parallel in Wave A

## Abnahme-Signale fuer Wave-A-Start

1. A001, W001, W002 stehen in Project #2 auf `In Progress` oder `Review`
   mit Nachweislinks.
2. Ein gemeinsames Kurzprotokoll (max. 1 Seite) verlinkt alle drei
   Deliverables.
3. Es gibt keine offenen Unklarheiten zu Ownership oder Blocker-Kanten fuer
   den Start von Wave A.

# W001 Website-Taskcluster (2026-05-16)

## Ziel

Website-Arbeitspakete fuer Wave A entlang der Kernfluesse strukturieren,
damit die Abarbeitung in Project #2 ohne Reihenfolgekonflikte erfolgt.

## Scope

- Basis: Speckit-Issues #383 bis #385
- Fokusfluesse: Landing, Auth, Donation
- Ergebnis: Cluster mit Prioritaet, Abnahmeindikator und Blockern

## Cluster-Definition

| Cluster  | Zugeordnete Issues | Ziel                                                           | Prioritaet |
| -------- | ------------------ | -------------------------------------------------------------- | ---------- |
| Landing  | #383, #385         | Klare Einstiegsstrecke mit CTA-Pfad auf Auth/Donation          | must       |
| Auth     | #383, #384         | Stabile Anmelde-/Registrierungsstrecke als Bruecke zu API-Auth | must       |
| Donation | #383, #384, #385   | Durchgaengiger Spendenfluss inkl. API-Abhaengigkeiten          | must       |

## Abnahmeindikatoren je Cluster

| Cluster  | Abnahmeindikator                                                   | Nachweis                          |
| -------- | ------------------------------------------------------------------ | --------------------------------- |
| Landing  | User kann von Landing zu Auth/Donation ohne tote Pfade navigieren  | Navigations- und Route-Checkliste |
| Auth     | Login/Register-Flows sind vollstaendig mit API-Kanten dokumentiert | Verlinkte Dependency-Matrix       |
| Donation | Donation-Flow ist als End-to-End-Kette dokumentiert                | Flow-Diagramm + API-Mapping       |

## Bekannte Blocker

1. Unvollstaendige API-Ownership fuer einzelne Domain-Endpunkte (siehe A001).
2. Fehlende explizite Kanten zwischen Website-Issues und API-Issues ohne W002.
3. Risiko auf Rework, falls Reihenfolge von #383/#384/#385 nicht synchron bleibt.

## Reihenfolge innerhalb Wave A

1. #383 W001 struktureller Cluster-Schnitt
2. #384 W002 Abhaengigkeiten explizit verknuepfen
3. #385 W003 finale Abarbeitungsreihenfolge fuer A/C abstimmen

## Uebergabe an W002

W001 liefert die inhaltlichen Cluster und benoetigte Kantenpunkte.
W002 uebernimmt die explizite Issue-zu-Issue-Dependency-Matrix.

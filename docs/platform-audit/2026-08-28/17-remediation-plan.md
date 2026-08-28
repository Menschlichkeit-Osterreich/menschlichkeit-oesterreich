# Remediation Plan — Platform-Audit 2026-08-28

Reihenfolge nach Wirkung, nicht nach Aufwand. Schritt 1 und 2 sind
Voraussetzung für alles Weitere: solange nicht deployt werden kann, ist jede
Codeänderung folgenlos.

---

## Schritt 1 — Deployment entsperren (P0-001) · **BLOCKIERT, braucht Admin**

**Wer:** Repository-Administration
**Wo:** *Settings → Environments → `production`*

Der Deploy-Job wartet auf eine Freigabe, die nie erteilt wird, und verfällt
nach 30 Tagen (EV-0021). Zu tun:

1. Environment-Protection-Rules des Environments `production` einsehen.
1. Entscheiden: sollen Deployments manuell freigegeben werden?
   - **Nein** → erforderliche Prüfer entfernen.
   - **Ja** → Prüfer auf Personen setzen, die Freigaben zeitnah erteilen, und
     eine Benachrichtigung einrichten. Eine 30 Tage unbemerkt verfallende
     Freigabe ist kein Freigabeprozess.
1. Bestätigen, ob es tatsächlich eine Reviewer-Regel oder ein Wait-Timer ist —
   das ist der einzige Punkt dieses Audits, der aus starker Indizienlage
   (`INFERRED`) statt aus direkter Beobachtung stammt.

**Abnahme:** Ein Push auf `main` erreicht den Job `Deploy → Plesk`, und dieser
führt mindestens seinen ersten Step aus.

---

## Schritt 2 — Ersten grünen Lauf verifizieren

**Wer:** DevOps
**Vorbedingung:** Schritt 1 abgeschlossen; P0-002 ist in diesem Branch bereits
behoben.

Seit Run 235 (2026-05-16) hat kein Deploy-Job je einen Step ausgeführt. Was
danach im Job passiert, ist unbeobachtet — SSH-Setup, Chroot-Preflight,
Secret-Handoff und Healthchecks sind seit Monaten ungetestet. Mit weiteren
Fehlern ist zu rechnen.

Empfohlen: **zuerst ein `workflow_dispatch` mit `dry_run: true`**, bevor der
erste echte Push-Deploy läuft.

**Abnahme:**

1. Alle Jobs grün, inklusive `Deploy → Plesk`.
1. `https://www.menschlichkeit-oesterreich.at/.deploy_release` liefert den
   erwarteten Commit-Marker. **Damit ist erstmals belegbar, welcher Commit
   produktiv läuft** — die zentrale offene Frage der Definition of Done.
1. `last-modified` der Website ist nicht mehr `2026-04-25`.

---

## Schritt 3 — Zielbild klären · **fachliche Entscheidung, kein Technikschritt**

**Wer:** Projektleitung gemeinsam mit Architektur

Dies ist die wichtigste Aufgabe des gesamten Plans, und sie lässt sich nicht
technisch lösen. Live existieren API, CRM/CiviCRM, ERPNext, n8n und Forum
nicht — teils fehlt sogar der DNS-Eintrag. Das Repository automatisiert,
dokumentiert und testet dennoch gegen genau diese Systeme.

Zu entscheiden ist **pro System**: geplant, zurückgestellt, oder aufgegeben?

| System | Live-Status | Zu entscheiden |
| ------ | ----------- | -------------- |
| FastAPI (`api.`) | DNS existiert nicht | Einrichten? Das ausgelieferte Frontend ruft diesen Host auf (P2-003). |
| Drupal/CiviCRM (`crm.`) | Platzhalterseite, `/native/` 404 | Inbetriebnahme oder Rückbau? |
| ERPNext (`erp.`) | DNS existiert nicht | Bleibt ERPNext das Ziel-Accountingsystem, oder ist das überholt? |
| n8n (`n8n.`) | Plesk-Standardseite | Welcher der beiden Compose-Verträge (P2-001) — falls überhaupt einer? |
| phpBB (`forum.`) | Plesk-Standardseite | Inbetriebnahme oder Rückbau? |

**Warum das zuerst kommen muss.** Ohne diese Entscheidung sind mehrere
Forderungen des Auditauftrags nicht sinnvoll beantwortbar:

- Eine *System-of-Record-Matrix* über CiviCRM, ERPNext und FastAPI beschreibt
  Datenhoheit zwischen Systemen, von denen keines läuft.
- Eine *n8n-/Make-Migrationsmatrix* würde über Workflows entscheiden, die
  derzeit nirgends ausgeführt werden.
- Eine *Reconciliation-Matrix* Stripe ↔ CiviCRM ↔ ERPNext hat mangels zweier
  der drei Systeme keinen Gegenstand.

Diese Register bleiben deshalb bewusst offen, statt spekulativ gefüllt zu
werden (siehe [99-open-verification-gaps.md](99-open-verification-gaps.md)).

---

## Schritt 4 — Runtime-Verifikation nachholen

**Wer:** DevOps mit Plesk-/SSH-Zugang

Erst mit Lesezugriff auf den Host lassen sich die Register für Runtime,
Datenbanken, Ports, Backups und Secrets belastbar füllen. Der konkrete
Erhebungsbedarf und die dafür nötigen Zugänge stehen in
[99-open-verification-gaps.md](99-open-verification-gaps.md).

Besonders dringend, weil sicherheitsrelevant und bisher unbeantwortet:

- Existieren produktive Datenbanken, und werden sie gesichert?
- Ist eine Wiederherstellung jemals getestet worden?
- Läuft auf dem Host etwas, das im Repository nicht abgebildet ist?

---

## Schritt 5 — Payment-Befunde vor Wiederinbetriebnahme des Spendenflusses

**Wer:** Backend
**Vorbedingung:** Schritt 3 hat bestätigt, dass die API in Betrieb geht.

Reihenfolge innerhalb des Schritts:

1. **P1-001 (Inbox-Muster)** — Doppelbuchungen echter Spenden sind das
   schwerwiegendste offene Risiko im Code. Erfordert eine Migration an
   `webhook_events` (Unique Constraint auf `provider_event_id`, Statusfeld)
   und Tests gegen wiederholte Events.
1. **P1-002 (PII an Slack)** — kleine Änderung, sinnvoll im selben PR.
1. **P1-003 (`donation_type`/`purpose`)** — erst nach Klärung der
   Geschäftsregel. Gemeinsam zu klären: `receipt_eligible` und ob wiederkehrende
   Beiträge tatsächlich angeboten werden (beides derzeit `UNKNOWN`).

**Regel.** Solange P1-001 offen ist, sollte der produktive Spendenfluss nicht
wieder aufgenommen werden.

---

## Schritt 6 — Architekturdrift und Dokumentation

**Wer:** Architektur
**Vorbedingung:** Schritt 3 abgeschlossen.

1. **P2-001** — genau einen n8n-Betriebsvertrag festlegen, bevor eine Instanz
   startet.
1. **P2-002** — `${VAR:-default}` durch `${VAR:?…}` ersetzen, wo eine Datei als
   Produktionsvorlage dient; Entwicklungsstacks eindeutig als solche
   kennzeichnen.
1. **P2-003** — `VITE_API_URL` an die in Schritt 3 getroffene Entscheidung
   anpassen.
1. **P3-001** — Betriebsdokumente, die nicht existierende Systeme als laufend
   beschreiben, entsprechend kennzeichnen. Erst danach Legacy-Verzeichnisse im
   Repo-Root (`api.menschlichkeit-oesterreich.at/`,
   `crm.menschlichkeit-oesterreich.at/`, `web/`, `new/`, `_MIGRATION/`) nach
   Referenzprüfung bereinigen.

---

## Was dieser Plan bewusst nicht vorsieht

- **Keine neue Infrastruktur.** Der Auftrag ist ausdrücklich Konsolidierung,
  nicht Erweiterung. Solange nicht klar ist, was betrieben werden soll, wäre
  jede neue Komponente weitere Drift.
- **Keine Make-Szenarien.** Eine Migration „n8n → Make" setzt laufende
  n8n-Workflows voraus. Es laufen keine.
- **Kein Löschen von Legacy-Verzeichnissen ohne Referenzprüfung.**
- **Keine Änderung an produktiven Daten, Datenbanken oder Secrets.**

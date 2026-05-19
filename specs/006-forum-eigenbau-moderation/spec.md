# Feature Specification: Forum Eigenbau mit Moderation und Barrierefreiheit

**Feature Branch**: `006-forum-eigenbau-moderation`

**Created**: 2026-05-19

**Status**: Draft

**Input**: Masterplan `forum-masterplan.txt` (extern eingebrachte Analyse) + bestehender Stand unter `apps/forum/`, `apps/api/app/routers/forum.py`, `apps/website/src/pages/ForumPage.tsx`.

## Strategische Entscheidung

Es wird ein **Eigenbau auf dem bestehenden Stack** umgesetzt (FastAPI + React + Tailwind, RBAC vorhanden). phpBB dient ausschliesslich als Funktions-Benchmark. Keine produktive phpBB-Integration. Hybrid bleibt nur fuer punktuelle Module (z. B. Suche) optional und ist nicht Teil dieses MVP.

## Clarifications

### Session 2026-05-19

- Q: Editor-Format fuer Beitraege? -> A: Markdown mit serverseitiger Sanitization (DOMPurify/bleach), kein roher HTML-Input.
- Q: Suche im MVP? -> A: PostgreSQL `tsvector` Volltextsuche, keine externe Suchmaschine (ElasticSearch ist Backlog-Option).
- Q: Benachrichtigungen im MVP? -> A: Nur In-App-Hinweise plus optionales E-Mail-Opt-in fuer Thread-Abos.
- Q: Anonyme Schreibrechte? -> A: Nein, schreiben nur fuer Rolle Member+. Guest darf lesen, suchen, melden.
- Q: Soft-Delete vs. Hard-Delete? -> A: Soft-Delete als Default, Hard-Delete nur durch Admin nach Aufbewahrungsfrist.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Beitragen und Diskutieren (Priority: P1)

Als angemeldetes Mitglied moechte ich Threads in passenden Kategorien anlegen, antworten, eigene Beitraege bearbeiten oder loeschen und Markdown formatieren, damit ich strukturiert mitdiskutieren kann.

**Independent Test**: Member legt Thread an, antwortet, bearbeitet eigene Antwort, sieht Aenderungs-Marker. Andere Member sehen die Aenderung sofort.

**Acceptance Scenarios**:

1. **Given** ein angemeldetes Mitglied, **When** ein neuer Thread mit Markdown-Inhalt erstellt wird, **Then** ist er in der Kategorie sichtbar, sanitisiert und korrekt gerendert.
2. **Given** ein eigener Post, **When** das Mitglied ihn bearbeitet, **Then** wird der Inhalt aktualisiert und ein "bearbeitet"-Hinweis mit Zeitstempel angezeigt.
3. **Given** ein eigener Post, **When** das Mitglied loescht, **Then** wird der Post soft-geloescht und durch einen Platzhalter ersetzt.

---

### User Story 2 - Moderieren und Melden (Priority: P1)

Als Moderator moechte ich gemeldete Beitraege bearbeiten, Threads sperren, anpinnen, verschieben oder soft-loeschen koennen; als Mitglied moechte ich Beitraege melden, damit problematische Inhalte schnell behandelt werden.

**Independent Test**: Mitglied meldet Post, Moderator sieht Meldung in Queue, sperrt Thread und loescht Post; alle Aktionen sind im Audit-Log nachvollziehbar.

**Acceptance Scenarios**:

1. **Given** ein anstoessiger Post, **When** ein Mitglied ihn meldet, **Then** erscheint die Meldung mit Grund in der Moderations-Queue.
2. **Given** eine offene Meldung, **When** ein Moderator entscheidet (annehmen/ablehnen), **Then** wird die Aktion mit User, Zeitpunkt, Begruendung im Audit-Log gespeichert.
3. **Given** ein Thread, **When** ein Moderator ihn sperrt oder anpinnt, **Then** wird der Status persistent geaendert und im UI angezeigt.

---

### User Story 3 - Barrierefrei nutzen (Priority: P1)

Als Person mit unterschiedlichen Zugangsbeduerfnissen moechte ich das Forum vollstaendig per Tastatur bedienen, mit Screenreader navigieren und Inhalte mit ausreichendem Kontrast lesen, damit ich gleichberechtigt teilnehmen kann.

**Independent Test**: Vollstaendige Bedienung von Kategorie -> Thread -> Antwort posten -> Melden ohne Maus, mit aktiviertem Screenreader.

**Acceptance Scenarios**:

1. **Given** Tastaturbedienung, **When** durch die Forum-Ansichten navigiert wird, **Then** ist jedes interaktive Element erreichbar mit sichtbarem Fokus.
2. **Given** Screenreader aktiv, **When** ein Thread geoeffnet wird, **Then** ist die Beitragshierarchie als Liste mit Autor und Zeitstempel ansagbar.

---

### User Story 4 - Suchen und Navigieren (Priority: P2)

Als Nutzer moechte ich Forum-Inhalte per Volltextsuche und Filter (Kategorie, Tags, Datum) finden, damit ich relevante Beitraege schnell entdecke.

**Independent Test**: Suche nach Begriff liefert nach Relevanz sortierte Treffer, Filter Kategorie verengt das Ergebnis.

**Acceptance Scenarios**:

1. **Given** Inhalte im Forum, **When** nach einem Begriff gesucht wird, **Then** werden relevante Threads/Posts zurueckgegeben.
2. **Given** Suchergebnisse, **When** nach Kategorie gefiltert wird, **Then** verengt sich die Ergebnismenge entsprechend.

---

### User Story 5 - Benachrichtigt werden (Priority: P2)

Als Nutzer moechte ich Threads abonnieren und bei neuen Antworten benachrichtigt werden (In-App und optional per E-Mail), damit ich Diskussionen nicht verpasse.

**Independent Test**: Abonnement eines Threads loest bei neuer Antwort eine In-App-Benachrichtigung (und ggf. E-Mail bei Opt-in) aus.

**Acceptance Scenarios**:

1. **Given** ein abonnierter Thread, **When** ein anderer User antwortet, **Then** erscheint eine In-App-Notification beim Abonnenten.
2. **Given** E-Mail-Opt-in, **When** eine Antwort kommt, **Then** wird eine E-Mail gemaess Frequenz-Einstellung gesendet.

---

### User Story 6 - Inhalte exportieren und loeschen (DSGVO) (Priority: P2)

Als Nutzer moechte ich meine Forum-Beitraege exportieren und Loeschung beantragen koennen, damit DSGVO-Rechte erfuellt sind.

**Independent Test**: Export liefert maschinenlesbare Datei mit allen eigenen Posts; Loeschanforderung anonymisiert Inhalte gemaess Policy.

**Acceptance Scenarios**:

1. **Given** ein Nutzer, **When** er Datenexport anfordert, **Then** erhaelt er innerhalb der definierten Frist eine JSON/CSV-Datei mit seinen Beitraegen.
2. **Given** eine Loeschanforderung, **When** sie verarbeitet wird, **Then** werden Beitraege anonymisiert (Autor entfernt), Inhalt bleibt fuer Diskussionskontext optional erhalten oder wird ebenfalls entfernt.

---

### Edge Cases

- Was passiert, wenn ein bearbeiteter Post den letzten Beitrag eines geloeschten Threads ist?
- Wie wird Markdown mit eingebetteten Bildern/Links behandelt (Whitelist? Proxy?)
- Wie verhaelt sich die Suche bei sehr grossen Foren (>100k Posts) ohne externe Suche?
- Wie wird verhindert, dass Soft-Delete und DSGVO-Loeschung sich widersprechen?
- Was passiert mit Notifications, wenn ein Thread gesperrt oder geloescht wird?
- Rate-Limit bei Massenmeldungen oder Spam-Wellen?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Das System MUSS Kategorien, Threads und Posts persistent in einer Datenbank speichern (keine Seed-Daten im Code).
- **FR-002**: Das System MUSS Migrationen via Alembic fuer alle Forum-Tabellen bereitstellen.
- **FR-003**: Mitglieder MUESSEN eigene Threads und Posts bearbeiten und soft-loeschen koennen.
- **FR-004**: Moderatoren MUESSEN Threads sperren/entsperren, anpinnen/entpinnen, verschieben und Posts soft-loeschen koennen.
- **FR-005**: Das System MUSS ein Meldewesen mit Grund, Status, Audit-Log bereitstellen.
- **FR-006**: Alle Moderationsaktionen MUESSEN in einer separaten Audit-Tabelle mit Akteur, Aktion, Ziel, Zeitstempel und Begruendung gespeichert werden.
- **FR-007**: Posts MUESSEN Markdown akzeptieren; HTML wird serverseitig sanitisiert (bleach), bevor gespeichert wird.
- **FR-008**: Das System MUSS Volltextsuche ueber Threads und Posts via PostgreSQL `tsvector` bereitstellen.
- **FR-009**: Nutzer MUESSEN nach Kategorie, Tags und Datum filtern und sortieren koennen.
- **FR-010**: Das System MUSS Thread-Abonnements und In-App-Notifications bereitstellen.
- **FR-011**: Nutzer MUESSEN sich optional fuer E-Mail-Notifications eintragen und jederzeit abmelden koennen.
- **FR-012**: Das System MUSS Rate-Limiting auf Erstellungs- und Melde-Endpunkten erzwingen.
- **FR-013**: Das System MUSS CSRF- und XSS-Schutz fuer alle schreibenden Endpunkte aktivieren.
- **FR-014**: Das System MUSS Nutzern Datenexport und Loeschanforderung (DSGVO) ermoeglichen.
- **FR-015**: Das System MUSS RBAC-konform sein und Endpunkte mit `require_role` absichern (Guest/Member/Moderator/Admin/Sysadmin).
- **FR-016**: Das Frontend MUSS WCAG 2.1 AA erfuellen (Kontraste, Tastaturnavigation, Screenreader, Fokus-Markierung).
- **FR-017**: Das System MUSS Paginierung fuer Threads und Posts bereitstellen.
- **FR-018**: Das System MUSS Tagging (M:N) fuer Threads bereitstellen.
- **FR-019**: Beim Soft-Delete MUSS der Beitrag fuer Nicht-Moderatoren ausgeblendet werden; Moderatoren sehen Markierung.
- **FR-020**: Community-Regeln MUESSEN als statische Seite verfuegbar sein und bei Erstanmeldung im Forum akzeptiert werden.

### Key Entities

- **ForumCategory**: id, name, description, sort, parent_id (Hierarchie).
- **ForumThread**: id, category_id, user_id, title, pinned, locked, deleted_at, created_at, updated_at, tags (M:N).
- **ForumPost**: id, thread_id, user_id, content_md, content_html, edited_at, deleted_at, created_at.
- **ForumReport**: id, post_id, reporter_user_id, reason, status, decided_by, decided_at, comment.
- **ForumAuditLog**: id, actor_user_id, action, target_type, target_id, payload_json, created_at.
- **ForumSubscription**: id, user_id, target_type (thread/category), target_id, email_opt_in, created_at.
- **ForumTag**: id, slug, name.
- **ForumNotification**: id, user_id, type, payload, read_at, created_at.

## Success Criteria _(mandatory)_

- **SC-001**: Erstellen eines Threads und einer Antwort dauert unter 200 ms p95 auf Staging.
- **SC-002**: Suche liefert relevante Ergebnisse innerhalb 500 ms p95 fuer Foren bis 50k Posts.
- **SC-003**: Lighthouse-Accessibility Score >= 95 fuer alle Forum-Seiten.
- **SC-004**: 100 % der Moderationsaktionen sind im Audit-Log auffindbar.
- **SC-005**: DSGVO-Datenexport wird innerhalb 7 Tagen vollstaendig ausgeliefert; Loeschung innerhalb 30 Tagen umgesetzt.
- **SC-006**: Keine kritischen Findings aus OWASP-ASVS L1 fuer Forum-Endpunkte.
- **SC-007**: Coverage Backend Forum-Module >= 80 % (pytest), Frontend >= 70 % (vitest).

## Assumptions

- Bestehende Auth/JWT/RBAC aus `apps/api/app/rbac.py` wird wiederverwendet.
- PostgreSQL ist Zieldatenbank (Volltextsuche).
- Tailwind/Brand-Tokens aus `figma-design-system/` sind verbindlich.
- Mailversand laeuft ueber bestehende API-Mailwege (kein neuer Provider).
- Forum ist initial nur fuer registrierte Mitglieder schreibend; Gastlesen optional konfigurierbar.
- ElasticSearch, Push-Notifications, BBCode-Editor sind Backlog (nicht MVP).
- phpBB-Integration wird nicht produktiv eingesetzt.

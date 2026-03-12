# RBAC-Matrix – Menschlichkeit Österreich

**Version:** 1.0 | **Status:** VERIFIZIERT (aus Codeanalyse abgeleitet)

---

## Rollenmodell

| Rolle | Beschreibung | Zuweisung |
|---|---|---|
| `guest` | Nicht authentifizierter Besucher | Automatisch / öffentlich |
| `member` | Authentifiziertes Mitglied | Nach Login + Mitgliedschaft |
| `moderator` | Moderation von Community-Inhalten | Manuell durch Admin |
| `admin` | Vereinsverwaltung, Finanzen, Mitglieder | Via `VITE_ADMIN_EMAILS` ENV-Liste |
| `sysadmin` | Technische Plattformverwaltung | Server/Plesk-Zugang direkt |

> ⚠️ **SICHERHEITSRISIKO (hoch):** `isAdmin` wird aktuell rein clientseitig via `VITE_ADMIN_EMAILS` bestimmt. Dies muss durch serverseitige JWT-Claims (`role` Claim im Token) ersetzt werden.

---

## RBAC-Matrix

| Bereich / Aktion | guest | member | moderator | admin | sysadmin |
|---|:---:|:---:|:---:|:---:|:---:|
| **Öffentliche Seiten** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mitglied werden (Formular) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Spenden | ✅ | ✅ | ✅ | ✅ | ✅ |
| Statuten / Beitragsordnung | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mitgliederbereich** | | | | | |
| Eigenes Profil einsehen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Eigenes Profil bearbeiten | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dashboard (XP, Badges) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Datenschutzeinstellungen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Löschantrag stellen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Forum lesen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Forum schreiben | ❌ | ✅ | ✅ | ✅ | ✅ |
| Webgame spielen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Voting teilnehmen | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Moderation** | | | | | |
| Forum-Beiträge moderieren | ❌ | ❌ | ✅ | ✅ | ✅ |
| Kommentare löschen | ❌ | ❌ | ✅ | ✅ | ✅ |
| Nutzerberichte einsehen | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Adminbereich** | | | | | |
| Mitgliederliste einsehen | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mitglied anlegen/bearbeiten | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mitglied deaktivieren | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mitglied löschen (DSGVO) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Beiträge und Rechnungen | ❌ | ❌ | ❌ | ✅ | ✅ |
| SEPA-Export | ❌ | ❌ | ❌ | ✅ | ✅ |
| Newsletter erstellen/senden | ❌ | ❌ | ❌ | ✅ | ✅ |
| Events anlegen | ❌ | ❌ | ❌ | ✅ | ✅ |
| DSGVO-Löschanträge bearbeiten | ❌ | ❌ | ❌ | ✅ | ✅ |
| Berichte / KPIs einsehen | ❌ | ❌ | ❌ | ✅ | ✅ |
| Rollen vergeben | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Systemadmin** | | | | | |
| Plesk-Zugang | ❌ | ❌ | ❌ | ❌ | ✅ |
| Datenbank-Direktzugang | ❌ | ❌ | ❌ | ❌ | ✅ |
| Server-SSH-Zugang | ❌ | ❌ | ❌ | ❌ | ✅ |
| CI/CD-Konfiguration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Secrets verwalten | ❌ | ❌ | ❌ | ❌ | ✅ |
| Monitoring-Konfiguration | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Empfohlene Umsetzung

### Kurzfristig (P0)
1. **JWT-Claims:** Backend muss `role`-Claim im Token ausstellen
2. **Serverseitige Validierung:** Alle Admin-Endpunkte müssen `role` aus dem Token prüfen, nicht aus Client-ENV
3. **`VITE_ADMIN_EMAILS` entfernen:** Sicherheitslücke — clientseitiger Admin-Check ist unwirksam

### Mittelfristig (P1)
1. **CiviCRM-Integration:** Rollen aus CiviCRM-Kontaktstatus ableiten (Membership Type → Rolle)
2. **Moderator-Rolle:** Im Token als `moderator`-Claim ausgestaltbar
3. **Audit-Log:** Alle privilegierten Aktionen mit Zeitstempel und User-ID protokollieren

### Langfristig (P2)
1. **RBAC-Datenbank-Tabelle:** Flexible Rollenzuweisung via DB statt ENV-Variable
2. **OAuth2/OIDC:** Externer Identity Provider (z.B. Keycloak) für Single Sign-On

---

## Default-Rechte nach Registrierung

| Zeitpunkt | Rolle | Begründung |
|---|---|---|
| Registrierung (unbestätigt) | `guest` | Bis E-Mail-Bestätigung |
| E-Mail bestätigt | `member` | Basisrechte aktiv |
| Beitrag bezahlt | `member` (aktiv) | Volles Mitglied |
| Beitrag abgelaufen | `member` (passiv) | Eingeschränkte Rechte |
| Manuell erhöht | `moderator` / `admin` | Durch `admin` vergeben |

# Screenshots, Evidence & Redaction – SOP

**Stand**: 2026-03-08 | Geltungsbereich: Alle Teammitglieder

Diese SOP regelt den Umgang mit Screenshots, Panel-Zugangsnachweisen, Incident-Evidence und sonstigen Bildschirmaufnahmen.

---

## 1. Ordnerstruktur

```
docs/
└── media/
    ├── public/          # Öffentlich (kein PII, keine Secrets) – kann in Repo
    │   ├── screenshots/
    │   └── diagrams/
    └── internal/        # Intern (niemals in Git!)
        ├── incidents/   # Incident-Evidence
        ├── plesk/       # Panel-Screenshots
        └── audits/      # Security-Audit-Belege

```

**Regel:** Nur `docs/media/public/` wird in Git committet. `docs/media/internal/` steht in `.gitignore`.

---

## 2. Dateinamens-Standard

```
Format: YYYY-MM-DD_[kontext]_[beschreibung].[ext]

Beispiele:
  2026-03-08_plesk_ssl-zertifikat-ablauf.png
  2026-03-08_incident_api-timeout-fehler.png
  2026-03-08_monitoring_uptime-dashboard.png
  2026-03-08_audit_trivy-scan-ergebnis.png
```

**Kein Leerzeichen**, nur `_` und `-`. Keine Sonderzeichen.

---

## 3. Klassifikation

| Klasse | Inhalt | Speicherort | Git? |
|--------|--------|-------------|------|
| PUBLIC | UI-Screenshots (kein PII), Diagramme, Feature-Demos | `docs/media/public/` | Ja |
| INTERNAL | Incident-Belege, Panel-Screenshots ohne PII | `docs/media/internal/` | Nein |
| RESTRICTED | Screenshots mit PII, Secrets, Passwörtern, persönlichen Daten | Sicher löschen oder redigieren | Niemals |

---

## 4. Redaction-Regeln (Pflicht vor Weitergabe)

Vor dem Speichern oder Teilen eines Screenshots müssen folgende Daten geschwärzt werden:

| Datenkategorie | Beispiel | Schwärzungsmethode |
|----------------|---------|-------------------|
| Passwörter / API-Keys | `Bearer eyJ...` | Schwarzes Rechteck (kein Weichzeichner) |
| E-Mail-Adressen | `max@example.com` | Schwarzes Rechteck |
| Namen natürlicher Personen | `Max Muster` | Schwarzes Rechteck |
| IP-Adressen (privat) | `192.168.1.1` | Schwarzes Rechteck |
| Plesk-Panel-IP | `5.183.217.146` | Schwarzes Rechteck in externen Docs |
| IBAN / Bankdaten | `AT61 2011 ...` | Schwarzes Rechteck |
| Telefonnummern | `+43 1 ...` | Schwarzes Rechteck |
| Benutzernamen (Admin) | `plesk_admin` | Ersetzen durch `[ADMIN_USER]` |

**Werkzeuge:**
- Linux/Mac: GIMP, Flameshot (eingebaut), Screenshot + Annotation
- Windows: Greenshot, ShareX
- Online: **Nicht verwenden** (PII darf nicht auf externe Server hochgeladen werden)

**Weichzeichner (Blur) ist nicht ausreichend** – er ist reversibel. Nur deckende Schwärzung verwenden.

---

## 5. Freigabeprozess

**Interne Verwendung (Incident, Audit):**
1. Screenshot aufnehmen
2. Redigierung gemäß Abschnitt 4
3. In `docs/media/internal/` ablegen (lokal, nicht in Git)
4. Incident-Dokument verweist auf Datei (Relativpfad)

**Externe Weitergabe (PR, Issue, Dokumentation):**
1. Redigierung gemäß Abschnitt 4
2. Zweite Person prüft Redaction
3. Nur in `docs/media/public/` ablegen
4. Dann committen / teilen

---

## 6. Retention

| Kontext | Aufbewahrung |
|---------|-------------|
| Incident-Evidence | 1 Jahr ab Incident-Abschluss |
| Audit-Belege | 3 Jahre (DSGVO/UGB) |
| Feature-Screenshots | Solange Feature relevant |
| Deployment-Belege | 90 Tage |

---

## 7. Versehentlich erfasste Secrets oder PII

**Wenn ein Screenshot Secrets oder PII enthält und bereits geteilt wurde:**

```
[ ] 1. Datei SOFORT löschen (aus Chat, E-Mail, Git)
[ ] 2. Bei Git: git filter-repo oder BFG Repo-Cleaner
[ ] 3. Bei Secrets: Secret rotieren (docs/security/secrets-policy.md → Leak Response)
[ ] 4. Bei PII: DPO informieren (datenschutz@menschlichkeit-oesterreich.at)
[ ] 5. DSGVO-Vorfall bewerten (Art. 33): Meldeschwelle prüfen
[ ] 6. Incident dokumentieren: docs/incidents/
```

---

## 8. Plesk-Panel-Screenshots

Plesk-Panel-Screenshots sind besonders sensibel (Infrastruktur-Topology, Zugangsdaten).

**Regeln:**
- Niemals öffentlich teilen ohne vollständige Redaction
- Panel-IP `5.183.217.146` immer schwärzen in externen Kontexten
- Username immer schwärzen
- Session-Tokens (URL-Parameter) immer schwärzen
- Nur in `docs/media/internal/plesk/` ablegen

---

*Verwandt: [DSGVO-Betrieb](../compliance/gdpr-operations.md) | [Secrets Policy](../security/secrets-policy.md) | [Incident Response](../operations/incident-response.md)*

# Quickstart: Operatives Uebergabepaket fuer Azure n8n Abnahmevorbereitung

## Zweck

Dieses Dokument ist der ausfuehrbare Arbeitsauftrag fuer einen spaeteren Operator. Es beschreibt den Weg von der Ist-Analyse bis zur Abnahmevorbereitung fuer `n8n.menschlichkeit-oesterreich.at` auf Azure, ohne produktive Go-Behauptung.

## Vorbedingungen

- Zugriff auf Repository und Spezifikationsartefakte
- Lesender Zugriff auf relevante Azure-Nachweise (Portal/CLI) oder klar markierte Blocker
- DNS-Zustaendigkeit fuer `menschlichkeit-oesterreich.at` ist organisatorisch geklaert
- Verantwortliche Rollen fuer Betrieb, Billing, Renewal benannt

## Pflichtkonfiguration fuer n8n (Mindestset)

- `N8N_HOST`
- `N8N_PROTOCOL`
- `N8N_EDITOR_BASE_URL`
- `WEBHOOK_URL`
- `N8N_ENCRYPTION_KEY`
- `TZ`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `BACKUP_TARGET_PATH`

Hinweis: Secrets werden nicht im Klartext in Doku, Tickets oder Commits abgelegt.

## Schrittfolge fuer Operatoren

1. Grant-/Billing-Gate pruefen
2. Azure-Ressourcen-Sollbild gegen Ist-Zustand mappen
3. Netzwerk-/SSH-Haertung gegen Vertrag pruefen
4. Runtime- und Env-Pflichtwerte gegen Vertrag pruefen
5. DNS-Zielbild und Plesk-Abloesepfad fuer Umschaltung vorbereiten
6. HTTPS-Gate und URL-Konsistenz pruefbar machen
7. Backup-/Restore-Gate inklusive Restore-Test planen
8. Evidenzmatrix aktualisieren und Blocker klassifizieren
9. Go/No-Go-Status als Abnahmevorbereitung dokumentieren

## Evidenzanforderung je Schritt

- Schritt 1-4: Primaerquelle bevorzugt
- Schritt 5-7: Live-Nachweis erforderlich
- Offene Punkte: als `open checkpoint` mit Blockerklasse erfassen

## Go/No-Go-Logik (Abnahmevorbereitung)

- **No-Go** bei offenen Go-Live-Blockern
- **No-Go** bei fehlendem Grant-/Billing-Primärnachweis
- **No-Go** bei offener Exposition von `5678`, `5432`, `6379`
- **No-Go** bei fehlendem Backup-/Restore-Nachweis

## Rückfallpfad (Mindeststandard)

Bei DNS-, HTTPS-, Secret- oder Expositionsfehlern:

1. Fehlerklasse benennen
2. zuletzt stabilen Zustand aktivieren
3. Ursache dokumentieren
4. Gate-Status auf `blocked` setzen
5. erst nach neuem Evidenznachweis erneut freigeben

## Ergebnisformat fuer Handover

Der Operator liefert:

- Aktualisierte Gate-Matrix mit Status je Abnahmeobjekt
- Liste aller Blocker inkl. Wirkungsebene (`provisioning` oder `go-live`)
- Offene Pruefpunkte mit naechster konkreter Aktion
- Klaren Abschlussstatus: `Abnahmevorbereitung erreicht` oder `BLOCKED`

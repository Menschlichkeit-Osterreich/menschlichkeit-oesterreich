# Website SEO & Hardening Follow-ups

Diese Punkte liegen ganz oder teilweise außerhalb des direkt kontrollierbaren Frontend-Codes und sollten nach dem Code-Deploy gezielt nachgezogen werden.

## Hohe Priorität

- `CSP report-only auswerten und schrittweise scharf schalten`
  - Die Nginx-Konfiguration nutzt bewusst ein realistisches `Content-Security-Policy-Report-Only` Startniveau.
  - Nach einigen Tagen sollten die Reports ausgewertet und unnötig weite Quellen reduziert werden.

- `Fakten-Review für rechtliche und organisatorische Seiten`
  - Angaben zu Gemeinnützigkeit, behördlichen Zuständigkeiten und sonstigen juristisch sensiblen Aussagen sollten redaktionell gegen die aktuellen Vereinsunterlagen geprüft werden.
  - Erst danach sollten eventuell entfernte oder bewusst neutral formulierte Detailangaben wieder konkretisiert werden.

- `Social-Profile nur nach Verifikation in strukturierte Daten aufnehmen`
  - `sameAs` wurde absichtlich entfernt, weil im Repo keine belastbare Verifikation der Profile vorlag.
  - Erst nach Prüfung der echten offiziellen URLs wieder ergänzen.

## Mittlere Priorität

- `Lokale SEO außerhalb des Repos ergänzen`
  - Google Business Profile und weitere lokale Einträge manuell pflegen.
  - Konsistente NAP-Daten (`Name`, `Adresse`, `Kontakt`) in allen externen Verzeichnissen abstimmen.

- `Apple Touch Icon als echte PNG-Datei anlegen`
  - Im Repo ist derzeit nur `favicon.ico` verlässlich vorhanden.
  - Für iOS-Home-Screen und bessere Brand-Signale sollte ein dediziertes Touch-Icon exportiert und eingebunden werden.

- `Redaktionellen Content für Blog, Forum und Veranstaltungen laufend pflegen`
  - Die Seiten sind jetzt indexierbar und sauber strukturiert.
  - Für nachhaltige SEO-Wirkung braucht es aber regelmäßig echte Beiträge, bestätigte Termine und moderierte Diskussionen.

## Technische Beobachtungen

- `Vite Build-Warnung zu services/config.ts`
  - `src/services/config.ts` wird aktuell sowohl statisch als auch dynamisch importiert.
  - Das ist kein Build-Blocker, verhindert aber ein sauberes Chunk-Splitting in diesem Bereich.

- `Großes three.js Chunk`
  - Das Bundle enthält weiterhin ein sehr großes `three` Chunk.
  - Bei Gelegenheit sollte geprüft werden, ob das Demokratiespiel konsequenter isoliert oder noch später geladen werden kann.

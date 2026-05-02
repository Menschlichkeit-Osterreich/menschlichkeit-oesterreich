# Accessibility- & Brand-Remediation-Status

Stand: 11. April 2026

## Kurzurteil

Ampelbewertung: Grün im aktuellen Repo-Stand

Klare Antwort auf die Leitfrage:

Ja. Mit dem jetzt umgesetzten Code-Stand ist die Website- und Frontend-Landschaft auch ohne Accessibility-Overlay in den Hauptpfaden deutlich besser und weitgehend barrierearm nutzbar. Ein Overlay bleibt optional und ist weiterhin nicht die Hauptlösung.

Wichtiger Hinweis:

Diese Bewertung bezieht sich auf den aktuellen Code-Stand im Repository. Für die öffentliche Live-Bewertung muss dieser Stand noch deployt sein.

## Was konkret behoben wurde

1. Echte Dialog-Semantik und Fokusführung ergänzt
   Betroffen: `AuthSystem`, `PrivacyCenter`, `AdminEvents`
   Ergebnis: `role="dialog"`, `aria-modal`, Titel-/Beschreibung-Bezug, Initialfokus, Fokusfalle und Fokus-Rückgabe sind jetzt eingebaut.

2. Consent-Banner auf ehrliche, nicht-kosmetische Semantik umgestellt
   Betroffen: `CookieConsent`, Forum-Cookie-Banner
   Ergebnis: Banner sind jetzt als ankündigbare Bereiche umgesetzt, nicht als halbdefekte Pseudo-Modals.

3. Formularfehler und Erfolgsmeldungen technisch angekündigt
   Betroffen: `AuthSystem`, `Kontakt`, `PasswordReset`, `AdminEvents`, `PrivacyCenter`
   Ergebnis: Alerts und Statusmeldungen werden per `role="alert"` oder `role="status"` angekündigt.

4. Kontaktformular von `mailto:` auf echten API-Submit umgestellt
   Betroffen: `apps/website/src/pages/Kontakt.tsx`
   Ergebnis: Robuste Validierung, Inline-Fehler, Datenschutz-Einwilligung und systemseitige Übermittlung statt lokalem Mailprogramm.

5. Fehlende Label-Verknüpfungen im Portal und Backoffice behoben
   Betroffen: `MemberOnboarding`, `AdminEvents`
   Ergebnis: Sichtbare Labels sind jetzt programmatisch mit ihren Feldern verbunden.

6. Toggle- und Auswahl-Steuerung semantisch verbessert
   Betroffen: `MemberOnboarding`, `PrivacyCenter`, `GameOverlay`
   Ergebnis: `aria-pressed`, `role="switch"` und klarere Interaktionszustände sind ergänzt.

7. Brand-Drift in der aktiven Website reduziert
   Betroffen: `index.css`, `Home.tsx`, `globals.css`
   Ergebnis: Body-Text nutzt wieder `Source Sans 3`, Headlines `Nunito Sans`, Hero und CTA-Flächen hängen an den aktiven Brand-Werten.

8. Gebrochene rechtliche und informative Pfade behoben
   Betroffen: `AppRoutes`, `AuthSystem`, Forum-Footer
   Ergebnis: `/barrierefreiheit` ist als echte Seite vorhanden, `/agb` wird sauber umgeleitet, Footer-Links zeigen auf reale Ziele.

9. Cookie- und Datenschutz-Kommunikation synchronisiert
   Betroffen: `CookieConsent`, `PrivacyCenter`, `Datenschutz`
   Ergebnis: Alle Texte sagen jetzt konsistent, dass aktuell nur technisch notwendige Cookies aktiv sind und optionale Kategorien standardmäßig aus bleiben.

10. Babylon-Spiel um echte Alternative zur Canvas-Interaktion erweitert
    Betroffen: `apps/babylon-game/src/app/page.tsx`, `GameOverlay.tsx`
    Ergebnis: Zusätzlich zur 3D-Ansicht gibt es jetzt einen linearen Textmodus mit speicherbarem Fortschritt, Rollen-/Szenariowahl und statusfähiger Bedienung ohne räumliche Navigation.

## Overlay-Bewertung

Nachweis:

- Ein klassisches Accessibility-Overlay wie Eye-Able wurde weiterhin weder im aktiven Website-Code noch im Spiel- oder Forum-Frontend als Hauptlösung nachgewiesen.

Bewertung:

- Die wichtigsten Accessibility-Funktionen werden jetzt nativ im Code erfüllt.
- Ein Overlay könnte höchstens Komfortfunktionen ergänzen.
- Es wäre fachlich weiterhin falsch, ein Overlay als Ersatz für saubere Dialog-, Formular- oder Fokuslogik zu behandeln.

## Muss im Code behoben werden

Aktuell keine roten Muss-Blocker mehr aus dem ursprünglichen Audit.

## Kann optional durch Zusatzfunktionen unterstützt werden

- Zusätzlicher Lesemodus für sehr lange Seiten
- Komfortfunktionen für Kontrast oder Schriftgrösse
- Weitere nicht-visuelle Spielvarianten über den bereits eingebauten Textmodus hinaus

## Verifikation

Erfolgreich geprüft:

- `npm run type-check --workspace=@moe/frontend`
- `npm run lint --workspace=@moe/frontend`
- `npm run build --workspace=@moe/frontend`
- `npm run type-check --workspace=@moe/babylon-game`
- `npm run build --workspace=@moe/babylon-game`

Hinweis:

- Der Frontend-Build zeigt weiterhin nur einen nicht-blockierenden Chunking-Hinweis von Vite zu `services/config.ts`.

## Management-Zusammenfassung in einfacher Sprache

Die grössten Barrierefreiheits-Probleme aus dem Bericht wurden im Code behoben. Pop-ups und Dialoge sind jetzt technisch sauberer, Formulare melden Fehler verständlich, das Kontaktformular funktioniert ohne Mailprogramm, kaputte Links wurden korrigiert und das Spiel hat nun eine echte Text-Alternative.

Wichtig ist: Das wurde ohne Accessibility-Overlay gelöst. Die Hauptverbesserungen stecken direkt in HTML, Fokussteuerung, Formularlogik und den aktiven Design-Tokens. Sobald dieser Stand live ausgerollt ist, ist die Website in den zentralen Nutzungswegen auch ohne Overlay gut nutzbar.

# Frontend Ecosystem Hardening Report

Stand: 2026-04-14  
Scope: `apps/website`, zugehörige Routing-/Deploy-/Host-Verträge und Brand-/Token-Kette

Kurzfazit: Der Repository- und Preview-Stand ist nach den umgesetzten Fixes belastbar grün verifiziert. Die produktive Live-Umgebung ist zum Zeitpunkt dieses Berichts noch nicht grün, weil die alten Artefakte auf den Hosts noch aktiv sind und die neuen Routing-/Hosting-Regeln noch nicht ausgerollt wurden.

## Root Causes

- Die Produktionsumgebung lief auf veralteten Artefakten und alten Release-Ständen statt auf dem aktuellen `main`-Stand.
- Der öffentliche Router hatte keinen robusten, statisch auslieferbaren Vertrag für `/login` und `/barrierefreiheit`.
- Öffentliche Einstiege verwiesen blind auf ein externes CRM-Ziel, obwohl `https://crm.menschlichkeit-oesterreich.at/login` live nicht erreichbar war.
- Shared UI-Flächen verwendeten zu schwache Secondary-/Meta-/Muted-Kontraste in Header-, Footer- und Sonderseiten-Bausteinen.
- Der Join-Stepper war semantisch fehlerhaft aufgebaut, weil das `<ol>` keine reine `<li>`-Struktur hatte.
- Pflichtfeld-Markierungen waren visuell zu schwach und nicht global standardisiert.
- Es gab konkurrierende Brand-/Token-Quellen zwischen Moe-Brand, generierten CSS-Tokens und dem Figma-JSON.
- Die Token-Generierung hatte einen echten Pfadfehler und konnte dadurch nicht zuverlässig dieselbe Quelle verwenden wie die Brand-Guidelines.
- Deploy-, Rewrite- und Host-Verträge waren nicht konsistent dokumentiert und nicht konsistent automatisiert.
- Das bisherige A11y-CLI-Setup war als Qualitätsgate instabil; dadurch war die lokale Verifikation schlechter abgesichert als nötig.

## Changed Files

Routing, Portal-Einstiege und URL-Verträge:

- `.github/workflows/deploy-plesk.yml`
- `deployment-scripts/nginx/menschlichkeit-oesterreich.at.conf`
- `deployment-scripts/nginx/crm.menschlichkeit-oesterreich.at.conf`
- `apps/website/src/AppRoutes.tsx`
- `apps/website/src/components/CrossHostRedirect.tsx`
- `apps/website/src/components/CrossHostRedirect.test.tsx`
- `apps/website/src/components/NavBar.tsx`
- `apps/website/src/pages/ForumPage.tsx`
- `apps/website/src/pages/ForumThread.tsx`
- `apps/website/src/pages/Register.tsx`
- `apps/website/src/utils/runtimeHost.ts`
- `apps/website/src/config/seoRoutes.json`
- `apps/website/scripts/prerender.mjs`

Globale A11y-, Semantik- und Kontrast-Fixes:

- `apps/website/src/layouts/PublicLayout.tsx`
- `apps/website/src/components/ui/Input.tsx`
- `apps/website/src/pages/Join.tsx`
- `apps/website/src/pages/Join.test.tsx`
- `apps/website/src/pages/Kontakt.tsx`
- `apps/website/src/pages/Home.tsx`
- `apps/website/src/pages/Spiel.tsx`
- `apps/website/src/components/game/Game3DScene.tsx`
- `apps/website/src/pages/Barrierefreiheit.tsx`
- `apps/website/src/pages/BlogPage.tsx`
- `apps/website/src/pages/NotFound.tsx`
- `apps/website/src/index.css`
- `apps/website/index.html`

Brand-, Token- und Legacy-Style-Bereinigung:

- `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md` als kanonische Quelle verwendet
- `figma-design-system/00_design-tokens.json`
- `apps/website/scripts/generate-design-tokens.mjs`
- `apps/website/src/styles/tokens.css`
- `apps/website/src/styles/globals.css`
- `apps/website/tailwind.config.cjs`

Validierung, Doku und Betriebsvertrag:

- `apps/website/.pa11yci.json`
- `apps/website/scripts/check-route-health.mjs`
- `apps/website/scripts/run-pa11y-audit.mjs`
- `apps/website/package.json`
- `apps/website/package-lock.json`
- `apps/website/README.md`
- `README_DEPLOY.md`
- `docs/operations/deployment.md`
- `docs/adr/0003-frontend-brand-login-contract.md`

## What Was Fixed

- `/login` wurde von einem blinden, kaputten Ausstieg zu einem robusten öffentlichen Einstieg umgebaut. Die Seite rendert jetzt selbst barrierefrei, prüft das CRM-Ziel vorab und bietet bei Ausfall einen verständlichen Fallback statt eines Dead Ends.
- `/barrierefreiheit` ist jetzt expliziter Teil des öffentlichen Route-, SEO- und Prerender-Vertrags und wird im finalen Build als statische Route mit ausgeliefert.
- Öffentliche CTAs in Navigation, Forum- und Portal-Einstiegen verweisen nicht mehr direkt auf kaputte Ziele, sondern auf den robusten `/login`-Gateway.
- Die CRM-URL-Bildung wurde vereinheitlicht. Öffentliche Einstiege verwenden den Portal-SPA-Vertrag statt stiller Fallbacks auf tote Native-Pfade.
- Shared Kontrastprobleme wurden zentral gelöst. Header-, Footer-, Meta- und Sonderflächen verwenden jetzt kontraststärkere, tokenbasierte Rollen statt zu heller, halbtransparenter Mischflächen.
- Der Join-Stepper ist semantisch korrekt. Das `<ol>` enthält nur noch `<li>`-Elemente, und der aktuelle Schritt wird zusätzlich screenreaderfreundlich angekündigt.
- Pflichtfeld-Markierungen wurden global gestärkt und in das Input-/Label-Muster integriert, ohne die bestehende Formular-A11y zu verschlechtern.
- Die 404-/Fehlerdarstellung wurde kontraststärker und lesbarer gestaltet.
- Spiel-Landingpage und Babylon-Preview-Kachel wurden auf dasselbe Kontrast- und Token-System gehoben, damit keine Sonderfarbwelt die globalen AA-Regeln wieder aufbricht.
- Der Figma-Token-Stand wurde an den aktiven Moe-Brand-Stand angepasst, der Generatorfehler wurde behoben und die Legacy-Styles wurden zu einer klaren Kompatibilitätsschicht entschärft.
- Der Produktions-Deploy-Workflow wurde wieder auf einen nachvollziehbaren Auto-Deploy-Vertrag für `main` umgestellt, inklusive vorgelagerter Prüfungen.
- Das A11y-Qualitätsgate wurde auf einen stabilen `pa11y`+`axe`-Pfad standardisiert, weil der frühere HTMLCS-Lauf auf modernen Formularseiten instabil war.

## What Was Intentionally Standardized

- Moe-Brand ist jetzt die kanonische Brand- und Token-Quelle. Das Figma-JSON und die generierten CSS-Tokens sind abgeleitete Artefakte.
- Der öffentliche Login-Vertrag lautet jetzt eindeutig: `www.../login` ist immer der öffentliche Einstieg; Ziel ist `https://crm.menschlichkeit-oesterreich.at/login`; bei Nichterreichbarkeit wird ein barrierefreier Fallback gerendert.
- `/barrierefreiheit` und `/login` sind nicht nur Client-Routen, sondern explizite Static-/SEO-/Prerender-Routen.
- Kontrast-Fixes wurden auf Shared- und Token-Ebene gelöst, nicht als lokale Einzelflicken.
- `globals.css` ist nur noch Legacy-Kompatibilität und keine konkurrierende zweite Design-Wahrheit.
- Ein Accessibility-Overlay wurde bewusst nicht eingeführt. Barrierefreiheit bleibt eine Eigenschaft des Codes und der Host-Auslieferung.

## Validation Results

Lokale Build- und Testverifikation:

- `npm run tokens:build` erfolgreich
- `npm run type-check` erfolgreich
- `npm run build:prerender` erfolgreich
- `npm run test:unit -- --run` erfolgreich
- Ergebnis: 3 Testdateien, 6 Tests, alle grün

Lokale Routing- und A11y-Verifikation auf dem Produktions-Preview:

- `npm run route:smoke` erfolgreich
- Ergebnis: `/`, `/kontakt`, `/mitglied-werden`, `/spenden`, `/forum`, `/spiel`, `/login`, `/barrierefreiheit` jeweils `200`
- `npm run a11y:test` erfolgreich
- Ergebnis: `8/8` Audit-URLs mit `0` Fehlern unter `pa11y` mit `axe`

Struktur- und Semantik-Spotchecks:

- Der Skiplink ist im prerendered HTML für `/`, `/login` und `/barrierefreiheit` vorhanden.
- `/login` rendert im Build ein echtes `<main id="main">` und einen live angekündigten Statusblock.
- `Join.tsx` enthält `nav[aria-label="Antragsschritte"]`, `aria-live="polite"` und ein `<ol>` mit ausschließlich `<li>`-Kindern.
- Die beiden neuen Regressionstests decken den Login-Fallback und die Join-Stepper-Semantik explizit ab.

Live-Statusprüfung am 2026-04-14:

- `https://www.menschlichkeit-oesterreich.at/login` liefert weiterhin `404`
- `https://www.menschlichkeit-oesterreich.at/barrierefreiheit` liefert weiterhin `404`
- `https://crm.menschlichkeit-oesterreich.at/login` liefert weiterhin `404`
- `https://www.menschlichkeit-oesterreich.at/.deploy_release` meldet weiterhin `commit=489b2306`
- `https://crm.menschlichkeit-oesterreich.at/.deploy_release` meldet weiterhin `commit=ea5b5a67`
- Lokaler `HEAD` dieses Arbeitsstands: `613f23a3`

Wichtige Einordnung:

- Der Code- und Preview-Stand ist grün verifiziert.
- Das Live-System ist zum Berichtszeitpunkt noch nicht grün, weil die aktualisierten Artefakte und Nginx-Regeln noch nicht auf die Zielhosts ausgerollt wurden.
- Ein Playwright-Browsersnapshot für zusätzliche manuelle Sichtprüfung konnte auf dieser Workstation nicht ausgeführt werden, weil keine lokale Chrome-Distribution verfügbar war. Die Struktur-Spotchecks wurden deshalb über den prerendered Output, Source-Inspection und die automatisierten Gates abgesichert.

## Remaining Risks

- Ohne Deployment bleibt die produktive Website rot, auch wenn der Repository-Stand technisch bereinigt ist.
- Der CRM-Host wird erst dann wirklich grün, wenn die neue SPA-/Fallback-Regel auf `crm.menschlichkeit-oesterreich.at` live ist.
- Die Games-Subdomain wurde in diesem Paket nicht funktional umgebaut, sondern gegen Regression abgesichert. Nach dem finalen Rollout sollte sie noch einmal live gegengeprüft werden.
- Hostseitige Rewrites und Release-Marker sind jetzt im Repo korrigiert, aber noch nicht als Live-Nachweis vorhanden.

## Audit Mapping

| Auditpunkt                                             | Ursache                                                                                                | Fix                                                                                                      | Nachweis der Verifikation                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/login` lief auf `404`                                | Öffentliche Route war nicht robust statisch auslieferbar; öffentliche Links gingen blind extern weiter | `/login` als echte Public Route, Prerender-Route und barrierefreier Gateway mit Probe/Fallback umgesetzt | `route:smoke` `200`, `a11y:test` `0` Fehler, `CrossHostRedirect.test.tsx` grün                  |
| `/barrierefreiheit` lief auf `404`                     | Route fehlte im Static-/SEO-/Prerender-Vertrag                                                         | `seoRoutes.json` und `prerender.mjs` erweitert; Route bleibt fester Public Path                          | `dist/barrierefreiheit/index.html` erzeugt, `route:smoke` `200`, `a11y:test` `0` Fehler         |
| CRM-Login war ein Dead End                             | Externer Zielpfad war down; Website lieferte trotzdem einen blinden Ausstieg                           | Probe-basierter Redirect mit erklärendem Fallback; CRM-Nginx auf SPA-Login-Vertrag ausgerichtet          | `CrossHostRedirect.test.tsx` grün, `/login` lokal grün, Deploy-Hinweis für Live dokumentiert    |
| Öffentliche CTAs führten in defekte Ziele              | Nav-/Forum-/Portal-Links zeigten direkt auf tote Hostpfade                                             | CTAs auf den robusten `/login`-Einstieg umgestellt                                                       | Source-Änderungen in Nav/Forum/Register, lokale `/login`-Verifikation grün                      |
| Shared Kontrastfehler in Header/Footer/Meta-Bausteinen | Zu schwache Secondary-/Muted-Rollen und zu viele halbtransparente Flächen                              | Shared Layout, Nav und Sonderseiten auf stärkere Token-/Dark-Surface-Rollen umgestellt                   | `a11y:test` `8/8` grün                                                                          |
| Join-Stepper semantisch fehlerhaft                     | `<ol>` enthielt keine reine `<li>`-Struktur                                                            | Stepper auf saubere Listen-Semantik umgebaut, Live-Ansage ergänzt                                        | `Join.test.tsx` grün, Source-Spotcheck via `rg`, `a11y:test` grün                               |
| Pflichtfeld-Markierungen waren zu schwach              | Keine globale, kontraststarke Required-Standardisierung                                                | Required-Indikator zentral im Input-/Label-Muster verstärkt                                              | Kontakt- und Join-Formulare `0` A11y-Fehler                                                     |
| 404-Seiten waren kontrastschwach                       | Fehlerdarstellung nutzte zu blasse Meta-/Hilfstexte                                                    | NotFound-Komponente kontraststark und führungsstark überarbeitet                                         | Komponenten-Review, Build grün; expliziter Live-404-Host-Rollout noch ausständig                |
| Brand-/Token-Quellen widersprachen einander            | Moe-Brand, Figma-JSON und CSS-Tokens liefen auseinander; Generatorpfad war fehlerhaft                  | Moe-Brand als Source of Truth festgezogen; Figma-JSON und Token-Generator angeglichen                    | `tokens:build`, `type-check`, `build:prerender` erfolgreich; ADR dokumentiert                   |
| Produktionsdrift und manuell verklemmter Deploy        | Live lief auf alten Artefakten; Workflow und Doku entsprachen nicht der Realität                       | Auto-Deploy-Vertrag für `main`, Route-/A11y-Gates und Host-Konfiguration bereinigt                       | Workflow/Doku/Nginx im Repo korrigiert; Live-Release-Marker belegen, dass Rollout noch aussteht |

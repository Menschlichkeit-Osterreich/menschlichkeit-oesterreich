# ADR 0003 - Frontend Brand- und Login-Vertrag

Datum: 2026-04-13
Status: Accepted

Kontext:
Das oeffentliche Frontend-Oekosystem hatte Drift in zwei kritischen Bereichen:

1. Die Marke wurde gleichzeitig ueber Moe-Brand-Guideline, Figma-Token-JSON und aktive Runtime-CSS beschrieben, aber nicht aus derselben Quelle abgeleitet.
2. Oeffentliche CTAs verlinkten teilweise direkt auf `crm.menschlichkeit-oesterreich.at/login`, obwohl der robuste oeffentliche Einstieg auf `www` benoetigt wird.

Entscheidungen:

1. Kanonische Brand-Quelle ist `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md`.
2. `figma-design-system/00_design-tokens.json` bleibt die buildbare Token-Datei, ist aber nur noch eine abgeleitete Quelle.
3. `apps/website/src/styles/tokens.css` wird ausschliesslich aus dem abgeleiteten Token-JSON generiert.
4. Der oeffentliche Einstieg in geschuetzte Bereiche ist immer `/login` auf `www`.
5. Das eigentliche Portal-Ziel bleibt `https://crm.menschlichkeit-oesterreich.at/login`.
6. Wenn das CRM-Portal nicht erreichbar wirkt, bleibt der Nutzer auf der oeffentlichen Website und bekommt einen verstaendlichen Fallback statt eines Dead Ends.

Alternativen:

- Direktes Verlinken aller CTAs auf den CRM-Host -> verworfen, weil Ausfaelle und Host-Drift sofort im oeffentlichen Erlebnis landen.
- Figma-JSON als freie Primarquelle -> verworfen, weil damit wieder ein konkurrierendes Farbsystem moeglich waere.
- Accessibility-Overlay als Kompensation -> verworfen, weil es die technischen Ursachen nicht beseitigt.

Konsequenzen:

- Brand- und Token-Aenderungen muessen Moe-Brand und abgeleitete Tokens gemeinsam pflegen.
- `/login` ist ein verpflichtender oeffentlicher Vertragspfad und Teil der Route-Smokes.
- CRM-Portal und Website bleiben ueber einen klaren Handoff gekoppelt, ohne blinde externe Links.

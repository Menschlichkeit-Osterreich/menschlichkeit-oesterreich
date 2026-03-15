/**
 * Static Site Generation (SSG) prerender script.
 *
 * Run after building both the client and SSR bundles:
 *   npm run build           # builds client to dist/
 *   npm run build:ssr       # builds SSR entry to dist-ssr/
 *   node scripts/prerender.mjs
 *
 * For each route in ROUTES_TO_PRERENDER:
 *  1. Calls the SSR render() function
 *  2. Injects the rendered HTML + Helmet meta tags into dist/index.html
 *  3. Writes the result to dist/<route>/index.html
 *
 * Dynamic routes (blog articles, forum threads) are NOT prerendered here —
 * they are handled client-side with react-helmet-async for per-page meta tags.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const DIST_SSR = join(ROOT, 'dist-ssr');

// All static public routes to prerender
const ROUTES_TO_PRERENDER = [
  '/',
  '/ueber-uns',
  '/team',
  '/transparenz',
  '/presse',
  '/statuten',
  '/beitragsordnung',
  '/themen',
  '/themen/demokratie',
  '/themen/menschenrechte',
  '/themen/soziale-gerechtigkeit',
  '/veranstaltungen',
  '/bildung',
  '/materialien',
  '/mitglied-werden',
  '/spenden',
  '/kontakt',
  '/impressum',
  '/datenschutz',
  '/forum',
  '/blog',
  '/spiel',
];

async function prerender() {
  // Load the SSR server bundle
  const serverEntryPath = join(DIST_SSR, 'entry-server.js');
  let renderFn;
  try {
    const serverModule = await import(serverEntryPath);
    renderFn = serverModule.render;
  } catch (err) {
    console.error(`[prerender] Could not load SSR bundle at ${serverEntryPath}`);
    console.error('[prerender] Run "npm run build:ssr" first.');
    process.exit(1);
  }

  // Load the client-built index.html as template
  const templatePath = join(DIST, 'index.html');
  const template = readFileSync(templatePath, 'utf-8');

  let successCount = 0;
  const errors = [];

  for (const route of ROUTES_TO_PRERENDER) {
    try {
      const { html: appHtml, helmet } = renderFn(route);

      // Build head tags from Helmet
      const headTags = [
        helmet?.title?.toString() ?? '',
        helmet?.meta?.toString() ?? '',
        helmet?.link?.toString() ?? '',
        helmet?.script?.toString() ?? '',
      ].join('\n    ');

      // Inject rendered HTML into the template
      // 1. Replace <div id="root"> content with server-rendered HTML
      // 2. Inject Helmet head tags before </head>
      //
      // Anchor: (?=\s*<\/body>) — Vite moves <script> to <head>, so the root
      // </div> is followed by whitespace + </body>, not by <script>.
      let html = template
        .replace(
          /<div id="root">[\s\S]*?<\/div>\s*(?=\s*<\/body>)/,
          `<div id="root">${appHtml}</div>\n    `
        )
        .replace('</head>', `  ${headTags}\n  </head>`);

      // Determine output path.
      // Strips the leading '/' from non-root routes before joining with DIST
      // to produce: dist/ueber-uns/index.html, dist/themen/demokratie/index.html, etc.
      // route.slice(1) is safe here because ROUTES_TO_PRERENDER guarantees all entries
      // start with '/'. The root route is handled explicitly to avoid dist//index.html.
      const normalizedPath = route.replace(/^\//, '');
      const outputDir = normalizedPath === '' ? DIST : join(DIST, normalizedPath);
      mkdirSync(outputDir, { recursive: true });
      const outputPath = join(outputDir, 'index.html');

      writeFileSync(outputPath, html, 'utf-8');
      console.log(`[prerender] ✓ ${route} → ${outputPath.replace(ROOT, '.')}`);
      successCount++;
    } catch (err) {
      console.error(`[prerender] ✗ ${route}: ${err.message}`);
      errors.push({ route, error: err.message });
    }
  }

  console.log(`\n[prerender] Done: ${successCount}/${ROUTES_TO_PRERENDER.length} routes rendered.`);

  if (errors.length > 0) {
    console.warn('\n[prerender] Errors:');
    errors.forEach(({ route, error }) => console.warn(`  ${route}: ${error}`));
    // Non-zero exit only if ALL routes failed
    if (successCount === 0) process.exit(1);
  }
}

prerender().catch((err) => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});

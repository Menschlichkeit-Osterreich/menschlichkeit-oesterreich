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
import { fileURLToPath, pathToFileURL } from 'node:url';
import routes from '../src/config/seoRoutes.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const DIST_SSR = join(ROOT, 'dist-ssr');

const ROUTES_TO_PRERENDER = routes
  .filter((route) => route.prerender !== false)
  .map((route) => route.path);

const APP_HEAD_BLOCK = /<!--app-head:start-->[\s\S]*?<!--app-head:end-->/;

function extractHeadTagsFromRenderedHtml(renderedHtml) {
  // React 19 hoists <title>, <meta>, <link>, and <script> tags to the head at render time.
  // With react-helmet-async the SSR context is empty in React 19, so we need to pull
  // the head tags out of the rendered HTML body for prerendering.
  const tags = [];
  let remainder = renderedHtml;

  const seoTagRegex = /^\s*(<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<script\b[^>]*type=(?:"|')application\/ld\+json(?:"|')[^>]*>[\s\S]*?<\/script>)/i;

  while (true) {
    const match = remainder.match(seoTagRegex);
    if (!match) break;

    tags.push(match[1].trim());
    remainder = remainder.slice(match[0].length);
  }

  return {
    headTags: tags.join('\n    '),
    cleanedHtml: remainder.trimStart(),
  };
}

async function prerender() {
  // Load the SSR server bundle
  const serverEntryPath = join(DIST_SSR, 'entry-server.js');
  let renderFn;
  try {
    const serverModule = await import(pathToFileURL(serverEntryPath).href);
    renderFn = serverModule.render;
  } catch (_err) {
    console.error(`[prerender] Could not load SSR bundle at ${serverEntryPath}`);
    console.error('[prerender] Run "npm run build:ssr" first.');
    process.exit(1);
  }

  // Load the client-built index.html as template
  const templatePath = join(DIST, 'index.html');
  const template = readFileSync(templatePath, 'utf-8');
  if (!APP_HEAD_BLOCK.test(template)) {
    console.error('[prerender] Missing <!--app-head:start--> markers in dist/index.html.');
    process.exit(1);
  }

  let successCount = 0;
  const errors = [];

  for (const route of ROUTES_TO_PRERENDER) {
    try {
      const { html: appHtml, helmet } = renderFn(route);

      // React 19 does not populate the react-helmet-async SSR context, so we may need
      // to extract head tags from the rendered HTML body. This ensures prerendered
      // output places meta/OG/Twitter/JSON-LD tags inside <head>.
      let headTags = '';
      let bodyHtml = appHtml;

      if (helmet && (helmet.title || helmet.meta || helmet.link || helmet.script)) {
        headTags = [
          helmet.title?.toString() ?? '',
          helmet.meta?.toString() ?? '',
          helmet.link?.toString() ?? '',
          helmet.script?.toString() ?? '',
        ]
          .filter(Boolean)
          .join('\n    ');
      } else {
        const extracted = extractHeadTagsFromRenderedHtml(appHtml);
        headTags = extracted.headTags;
        bodyHtml = extracted.cleanedHtml;
      }

      // Inject rendered HTML into the template
      // 1. Replace <div id="root"> content with server-rendered HTML
      // 2. Inject Helmet head tags before </head>
      //
      // Anchor: (?=\s*<\/body>) — Vite moves <script> to <head>, so the root
      // </div> is followed by whitespace + </body>, not by <script>.
      let html = template
        .replace(
          /<div id="root">[\s\S]*?<\/div>\s*(?=\s*<\/body>)/,
          `<div id="root">${bodyHtml}</div>\n    `
        )
        .replace(APP_HEAD_BLOCK, `<!--app-head:start-->\n    ${headTags}\n    <!--app-head:end-->`);

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

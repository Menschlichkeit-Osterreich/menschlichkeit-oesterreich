import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from '../src/config/seoRoutes.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const SITE_URL = 'https://www.menschlichkeit-oesterreich.at';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

mkdirSync(PUBLIC_DIR, { recursive: true });

function absoluteUrl(path) {
  if (path === '/') {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}${path}`;
}

function generateSitemap() {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>
`;
}

function generateRobots() {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /member/
Disallow: /login
Disallow: /Login
Disallow: /registrieren
Disallow: /passwort-vergessen
Disallow: /account/
Disallow: /erfolg
Disallow: /mitglied-werden/danke
Disallow: /*?*utm_
Disallow: /*?*fbclid=
Disallow: /*?*gclid=

Sitemap: ${SITE_URL}/sitemap.xml
Host: www.menschlichkeit-oesterreich.at
`;
}

writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), generateSitemap(), 'utf8');
writeFileSync(join(PUBLIC_DIR, 'robots.txt'), generateRobots(), 'utf8');

console.log(`[seo] Generated sitemap.xml (${routes.length} routes)`);
console.log('[seo] Generated robots.txt');

/**
 * SSR entry point for prerendering.
 * Used by scripts/prerender.mjs to generate static HTML for each public route.
 *
 * This entry is built separately:
 *   vite build --ssr --entry src/entry-server.tsx --outDir dist-ssr
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './AppRoutes';

interface RenderResult {
  html: string;
  helmet: HelmetServerState;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      {/* AuthProvider is safe in SSR: useEffect (sessionStorage) doesn't run in renderToString */}
      <AuthProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AuthProvider>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet! };
}

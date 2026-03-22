const CACHE_NAME = 'bruecken-bauen-babylon-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './robots.txt',
  './css/babylon-game.css',
  './js/babylon-app.js',
  './js/babylon-engine.js',
  './js/babylon-content.js',
  './js/core/state-machine.js',
  './js/core/storage.js',
  './js/content/campaign.js',
  './js/scenes/babylon-stage.js',
  './js/services/analytics.js',
  './js/ui/app-shell.js',
  './js/ui/templates.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isHtmlRequest = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html');

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (response.ok && requestUrl.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }),
  );
});

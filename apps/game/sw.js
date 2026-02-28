/* ==========================================================================
   Brücken Bauen - Service Worker
   Progressive Web App offline functionality and caching strategy
   ========================================================================== */

const CACHE_NAME = 'democracy-game-v1.0.0';
const STATIC_CACHE_NAME = 'democracy-game-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'democracy-game-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './js/scenarios.js',
  './js/game.js',
  './js/ui.js',
  './js/pwa.js',
];

// Optional files to cache when requested
const OPTIONAL_ASSETS = [
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/favicon.ico',
];

// Files that should always be fetched from network
const NETWORK_FIRST = [
  '/api/',
  '/analytics/',
  'https://www.google-analytics.com/',
  'https://analytics.google.com/',
];

// Maximum age for cached resources (in milliseconds)
const MAX_AGE = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  dynamic: 1 * 24 * 60 * 60 * 1000, // 1 day
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Maximum number of items in dynamic cache
const MAX_DYNAMIC_ITEMS = 50;

/* ==========================================================================
   Service Worker Events
   ========================================================================== */

// Install Event - Cache static assets
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');

  event.waitUntil(
    (async () => {
      try {
        // Cache static assets
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        await staticCache.addAll(STATIC_ASSETS);
        console.log('✅ Static assets cached');

        // Pre-cache optional assets (don't fail if they don't exist)
        const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
        for (const asset of OPTIONAL_ASSETS) {
          try {
            await dynamicCache.add(asset);
          } catch (error) {
            console.warn(`⚠️ Optional asset not found: ${asset}`);
          }
        }

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('❌ Error during installation:', error);
      }
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(
            name =>
              name.startsWith('democracy-game-') &&
              name !== STATIC_CACHE_NAME &&
              name !== DYNAMIC_CACHE_NAME
          )
          .map(name => caches.delete(name));

        await Promise.all(deletePromises);
        console.log('🗑️ Old caches cleaned up');

        // Take control of all clients
        await self.clients.claim();
        console.log('✅ Service Worker activated');

        // Notify clients about update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            message: 'Service Worker updated successfully',
          });
        });
      } catch (error) {
        console.error('❌ Error during activation:', error);
      }
    })()
  );
});

// Fetch Event - Handle network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for known external resources)
  if (url.origin !== self.location.origin && !isAllowedExternalResource(url)) {
    return;
  }

  // Choose caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (isImageAsset(url)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Message Event - Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
    }
  }
});

/* ==========================================================================
   Caching Strategies
   ========================================================================== */

// Cache First - Good for static assets that rarely change
async function cacheFirst(request, cacheName = STATIC_CACHE_NAME) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }

    // Fetch from network and update cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Cache first strategy failed:', error);

    // Return cached version even if expired, or offline fallback
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflineFallback(request);
  }
}

// Network First - Good for dynamic content and APIs
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Network request failed, checking cache:', request.url);

    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflineFallback(request);
  }
}

// Stale While Revalidate - Good for frequently updated content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('⚠️ Background fetch failed:', error);
    });

  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }

  // Wait for network if no cache or expired
  try {
    return await networkResponsePromise;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return expired cache as fallback
    }
    return getOfflineFallback(request);
  }
}

/* ==========================================================================
   Utility Functions
   ========================================================================== */

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')));
}

function isNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.href.includes(pattern));
}

function isImageAsset(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isAllowedExternalResource(url) {
  const allowedDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
  ];

  return allowedDomains.some(domain => url.hostname.includes(domain));
}

function isExpired(response) {
  const cachedDate = new Date(response.headers.get('date'));
  const now = new Date();
  const age = now.getTime() - cachedDate.getTime();

  // Check expiration based on resource type
  if (response.url.includes('css') || response.url.includes('js')) {
    return age > MAX_AGE.static;
  } else if (isImageAsset(new URL(response.url))) {
    return age > MAX_AGE.images;
  } else {
    return age > MAX_AGE.dynamic;
  }
}

function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return appropriate offline fallback based on request type
  if (request.destination === 'document' || url.pathname === '/') {
    return caches.match('./index.html');
  }

  if (isImageAsset(url)) {
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="75" text-anchor="middle" fill="#999">Offline</text></svg>',
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }

  // Generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(name => caches.delete(name));
    await Promise.all(deletePromises);
    console.log('🗑️ All caches cleared');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

async function cleanupDynamicCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const keys = await cache.keys();

    if (keys.length > MAX_DYNAMIC_ITEMS) {
      const excessKeys = keys.slice(0, keys.length - MAX_DYNAMIC_ITEMS);
      await Promise.all(excessKeys.map(key => cache.delete(key)));
      console.log(`🗑️ Cleaned up ${excessKeys.length} old dynamic cache entries`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up dynamic cache:', error);
  }
}

// Periodic cleanup of dynamic cache
setInterval(cleanupDynamicCache, 10 * 60 * 1000); // Every 10 minutes

/* ==========================================================================
   Background Sync (if supported)
   ========================================================================== */

if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'game-data-sync') {
      event.waitUntil(syncGameData());
    }
  });
}

async function syncGameData() {
  try {
    // This would sync any pending game data when back online
    console.log('🔄 Syncing game data...');

    // Implementation would depend on your backend API
    // For now, just log that sync occurred

    console.log('✅ Game data synced');
  } catch (error) {
    console.error('❌ Error syncing game data:', error);
    throw error; // Re-throw to retry later
  }
}

/* ==========================================================================
   Push Notifications (if supported)
   ========================================================================== */

if ('push' in self.registration) {
  self.addEventListener('push', event => {
    const options = {
      body: event.data ? event.data.text() : 'Neue Demokratie-Herausforderung verfügbar!',
      icon: './assets/icons/icon-192x192.png',
      badge: './assets/icons/icon-72x72.png',
      data: {
        url: './',
      },
      actions: [
        {
          action: 'open',
          title: 'Spiel öffnen',
        },
        {
          action: 'close',
          title: 'Schließen',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification('Brücken Bauen', options));
  });

  self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  });
}

console.log('🌉 Service Worker for Democracy Game loaded successfully');

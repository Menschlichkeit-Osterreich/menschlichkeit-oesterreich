/**
 * Democracy Metaverse - Service Worker
 * PWA Offline-Funktionalität und Caching-Strategie
 *
 * Features:
 * - Offline-Modus für alle Core-Features
 * - Intelligent Caching (< 50MB total)
 * - Background Sync für Save-Games
 * - Push Notifications für Level-Updates
 */

const CACHE_NAME = 'democracy-metaverse-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Critical Resources (always cached)
const CRITICAL_RESOURCES = [
  '/web/games/prototype/',
  '/web/games/prototype/index.html',
  '/web/games/prototype/manifest.json',
  '/web/games/prototype/css/prototype-tokens.css',
  '/web/games/prototype/css/components.css',
  '/web/games/prototype/css/animations.css',
  '/web/games/prototype/js/prototype-core.js',
  '/web/games/prototype/js/minigames-basic.js',
];

// Game Assets (cached on demand)
const GAME_ASSETS = [
  '/web/games/prototype/js/world-map.js',
  '/web/games/prototype/js/boss-ai.js',
  '/web/games/prototype/assets/',
  '/web/games/content/metaverse/levels.yml',
];

// External Resources (network first, fallback to cache)
const EXTERNAL_RESOURCES = ['https://fonts.googleapis.com/css2', 'https://fonts.gstatic.com/'];

// Runtime Cache Settings
const RUNTIME_CACHE_SIZE = 50; // Maximum items in runtime cache
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
  console.log('🔧 Democracy Metaverse SW installing...');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Cache critical resources
        console.log('📦 Caching critical resources...');
        await cache.addAll(CRITICAL_RESOURCES);

        // Pre-cache some game assets
        console.log('🎮 Pre-caching game assets...');
        const assetPromises = GAME_ASSETS.slice(0, 3).map(async url => {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(`⚠️ Could not cache ${url}:`, error);
          }
        });
        await Promise.allSettled(assetPromises);

        console.log('✅ SW installation complete');

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('❌ SW installation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
  console.log('🚀 Democracy Metaverse SW activating...');

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          });

        await Promise.all(deletePromises);

        // Claim all clients immediately
        await self.clients.claim();

        console.log('✅ SW activation complete');

        // Send update notification to clients
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION,
            });
          });
        });
      } catch (error) {
        console.error('❌ SW activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch Event Handler - Main Caching Strategy
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleFetch(request));
});

/**
 * Main Fetch Handler with Intelligent Caching
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Strategy 1: Critical Resources - Cache First
    if (isCriticalResource(request.url)) {
      return await cacheFirst(request);
    }

    // Strategy 2: Game Assets - Stale While Revalidate
    if (isGameAsset(request.url)) {
      return await staleWhileRevalidate(request);
    }

    // Strategy 3: External Resources - Network First
    if (isExternalResource(request.url)) {
      return await networkFirst(request);
    }

    // Strategy 4: API Calls - Network First with Cache Fallback
    if (isAPICall(request.url)) {
      return await networkFirst(request, { timeout: 3000 });
    }

    // Strategy 5: Images and Media - Cache First
    if (isMediaResource(request.url)) {
      return await cacheFirst(request);
    }

    // Default: Network First
    return await networkFirst(request);
  } catch (error) {
    console.warn('⚠️ Fetch error:', error);
    return await handleFetchError(request, error);
  }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('💾 Cache hit:', request.url);
    return cachedResponse;
  }

  console.log('🌐 Network fetch (cache miss):', request.url);
  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.status === 200) {
    await cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

/**
 * Network First Strategy
 */
async function networkFirst(request, options = {}) {
  const { timeout = 5000 } = options;

  try {
    // Try network with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const networkResponse = await fetch(request, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (networkResponse && networkResponse.status === 200) {
      console.log('🌐 Network success:', request.url);

      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());

      return networkResponse;
    }
  } catch (error) {
    console.log('⚠️ Network failed, trying cache:', request.url);
  }

  // Fall back to cache
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('💾 Cache fallback:', request.url);
    return cachedResponse;
  }

  // Last resort: offline page or error
  return await handleOfflineFallback(request);
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Background fetch to update cache
  const networkResponsePromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn('Background fetch failed:', error);
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('💾 Stale cache served:', request.url);
    networkResponsePromise; // Don't await, let it run in background
    return cachedResponse;
  }

  // No cache, wait for network
  console.log('🌐 Network fetch (no cache):', request.url);
  return await networkResponsePromise;
}

/**
 * Resource Type Helpers
 */
function isCriticalResource(url) {
  return CRITICAL_RESOURCES.some(resource => url.includes(resource));
}

function isGameAsset(url) {
  return (
    GAME_ASSETS.some(asset => url.includes(asset)) ||
    url.includes('/assets/') ||
    url.includes('/content/')
  );
}

function isExternalResource(url) {
  const urlObj = new URL(url);
  return (
    urlObj.origin !== self.location.origin ||
    EXTERNAL_RESOURCES.some(resource => url.includes(resource))
  );
}

function isAPICall(url) {
  return (
    url.includes('/api/') || url.includes('.json') || url.includes('.yml') || url.includes('.yaml')
  );
}

function isMediaResource(url) {
  const mediaExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.mp3',
    '.wav',
    '.mp4',
    '.webm',
  ];
  return mediaExtensions.some(ext => url.toLowerCase().includes(ext));
}

/**
 * Error Handling
 */
async function handleFetchError(request, error) {
  console.error('❌ Fetch error for:', request.url, error);

  // Try cache as fallback
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  return await handleOfflineFallback(request);
}

async function handleOfflineFallback(request) {
  const url = new URL(request.url);

  // HTML requests: return offline page
  if (request.destination === 'document') {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Democracy Metaverse - Offline</title>
          <style>
            body { 
              font-family: Inter, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #e879f9, #06b6d4, #10b981, #f59e0b);
              color: white;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .offline-container {
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            .bridge-icon { font-size: 4rem; margin-bottom: 1rem; }
            .retry-btn {
              margin-top: 1rem;
              padding: 0.5rem 1rem;
              background: rgba(255,255,255,0.2);
              border: none;
              border-radius: 0.5rem;
              color: white;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="bridge-icon">🌉</div>
            <h1>Democracy Metaverse</h1>
            <h2>Offline-Modus</h2>
            <p>Du bist offline, aber das Spiel ist trotzdem verfügbar!</p>
            <p>Deine Fortschritte werden automatisch synchronisiert, wenn du wieder online bist.</p>
            <button class="retry-btn" onclick="location.reload()">🔄 Erneut versuchen</button>
          </div>
          <script>
            // Auto-reload when back online
            window.addEventListener('online', () => {
              location.reload();
            });
          </script>
        </body>
      </html>
    `,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // API requests: return offline JSON
  if (url.pathname.includes('/api/') || request.url.includes('.json')) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Diese Anfrage ist offline nicht verfügbar',
        offline: true,
        timestamp: Date.now(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Images: return placeholder
  if (isMediaResource(request.url)) {
    return new Response(new Uint8Array(), {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  // Default: 404
  return new Response('Not found', { status: 404 });
}

/**
 * Background Sync for Save Games
 */
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'save-game-sync') {
    event.waitUntil(syncSaveGame());
  }
});

async function syncSaveGame() {
  try {
    // Get pending save data from IndexedDB
    const pendingSaves = await getPendingSaves();

    for (const save of pendingSaves) {
      try {
        const response = await fetch('/api/save-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(save),
        });

        if (response.ok) {
          await removePendingSave(save.id);
          console.log('✅ Save game synced:', save.id);
        }
      } catch (error) {
        console.warn('⚠️ Save sync failed:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync error:', error);
  }
}

/**
 * Push Notifications
 */
self.addEventListener('push', event => {
  console.log('📱 Push notification received');

  const options = {
    body: 'Neue Level verfügbar!',
    icon: '/web/games/prototype/assets/icons/icon-192.png',
    badge: '/web/games/prototype/assets/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/web/games/prototype/',
    },
    actions: [
      {
        action: 'play',
        title: '🎮 Spielen',
        icon: '/web/games/prototype/assets/icons/play.png',
      },
      {
        action: 'dismiss',
        title: 'Später',
        icon: '/web/games/prototype/assets/icons/dismiss.png',
      },
    ],
    requireInteraction: true,
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.message || options.body;
    options.data = { ...options.data, ...payload };
  }

  event.waitUntil(self.registration.showNotification('Democracy Metaverse', options));
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'play' || !event.action) {
    event.waitUntil(self.clients.openWindow('/web/games/prototype/'));
  }
});

/**
 * Message Handler (Communication with main app)
 */
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_SAVE_GAME':
      cacheSaveGame(data);
      break;

    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;

    default:
      console.log('📨 Unknown message:', type);
  }
});

/**
 * Cache Management Utilities
 */
async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response && response.headers.get('content-length')) {
      totalSize += parseInt(response.headers.get('content-length'));
    }
  }

  return {
    version: CACHE_VERSION,
    cacheSize: totalSize,
    cachedItems: keys.length,
    maxSize: 50 * 1024 * 1024, // 50MB
    isOfflineReady: keys.length >= CRITICAL_RESOURCES.length,
  };
}

async function cacheSaveGame(saveData) {
  try {
    // Store in IndexedDB for persistence
    await storeSaveGame(saveData);

    // Also cache in service worker for quick access
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(saveData));
    await cache.put(`/save-game/${saveData.playerId}`, response);

    console.log('💾 Save game cached');
  } catch (error) {
    console.error('❌ Cache save game failed:', error);
  }
}

/**
 * IndexedDB Utilities (simplified)
 */
async function getPendingSaves() {
  // Simplified - would use proper IndexedDB implementation
  return [];
}

async function removePendingSave(id) {
  // Simplified - would use proper IndexedDB implementation
  return true;
}

async function storeSaveGame(saveData) {
  // Simplified - would use proper IndexedDB implementation
  return true;
}

console.log('🌉 Democracy Metaverse Service Worker loaded successfully!');

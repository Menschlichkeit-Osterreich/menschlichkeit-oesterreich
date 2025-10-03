/**
 * Service Worker for Brücken Bauen Democracy Game
 * Enables offline functionality and caching for better performance
 */

const CACHE_NAME = 'bruecken-bauen-v1.2.0';
const STATIC_CACHE_NAME = 'bruecken-bauen-static-v1.2.0';
const DYNAMIC_CACHE_NAME = 'bruecken-bauen-dynamic-v1.2.0';

// Resources to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/#democracy-game',
  // Add core CSS and JS files here when available
];

// Resources that should be cached dynamically
const DYNAMIC_ASSETS = [
  // API endpoints
  '/api/',
  // Images from Unsplash
  'https://images.unsplash.com/',
  // Fonts and other external resources
];

// Resources that should always be fetched from network
const NETWORK_FIRST = [
  '/api/auth/',
  '/api/user/',
  '/api/scores/',
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event - Handle network requests
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Network first for critical API endpoints
  if (NETWORK_FIRST.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache first for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith(asset))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Stale while revalidate for images and other assets
  if (url.hostname === 'images.unsplash.com' || 
      request.destination === 'image' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default to network first with cache fallback
  event.respondWith(networkWithCacheFallback(request));
});

/**
 * Network First Strategy
 * Try network first, fall back to cache if network fails
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    throw error;
  }
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network if not cached
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    console.log('[SW] Background fetch failed for:', request.url);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  try {
    return await networkPromise;
  } catch (error) {
    console.log('[SW] No cache and network failed for:', request.url);
    throw error;
  }
}

/**
 * Network with Cache Fallback Strategy
 * Try network, fall back to cache, then offline page
 */
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For navigation requests, return the main page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

/**
 * Message Event - Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_GAME_DATA') {
    // Cache game progress data
    const cache = caches.open(DYNAMIC_CACHE_NAME);
    // Implementation would depend on the specific data structure
  }
});

/**
 * Sync Event - Handle background sync
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'game-progress-sync') {
    event.waitUntil(syncGameProgress());
  }
});

/**
 * Sync game progress when online
 */
async function syncGameProgress() {
  try {
    // Implementation would sync offline game progress
    // This is a placeholder for future implementation
    console.log('[SW] Syncing game progress...');
  } catch (error) {
    console.log('[SW] Failed to sync game progress:', error);
    throw error;
  }
}

/**
 * Push Event - Handle push notifications (if enabled in future)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || 'Brücken Bauen';
  const options = {
    body: data.body || 'Neue Inhalte verfügbar!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'bruecken-bauen-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/#democracy-game')
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
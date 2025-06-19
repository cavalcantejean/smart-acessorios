
const CACHE_NAME = 'smartacessorios-cache-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/', // Cache the homepage
  // Add other critical static assets here if needed, e.g., global CSS, main logo
  // Be careful not to cache too much or dynamic content aggressively without a strategy
  '/manifest.json',
  // Ensure you have these icon files in /public/icons/
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page and core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(error => {
      console.error('[Service Worker] Pre-caching failed:', error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Serve navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to fetch from the network first for navigation
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If network fails, serve the offline page from cache
          console.log('[Service Worker] Fetch failed (navigate); returning offline page instead.', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse || new Response("Offline page not found in cache.", { status: 404, headers: { 'Content-Type': 'text/plain' }});
        }
      })()
    );
    return;
  }

  // For other requests (CSS, JS, images, fonts, etc.), use a cache-first strategy
  if (event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'worker' ||
      event.request.destination === 'font' ||
      event.request.destination === 'image' ||
      ASSETS_TO_CACHE.some(assetUrl => event.request.url.endsWith(assetUrl))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, fetch from network and optionally cache it
        return fetch(event.request).then((networkResponse) => {
          // Example: Cache opaque responses (like from placehold.co) if needed, but be cautious.
          // For CDN assets or external images, caching them might be complex due to CORS.
          // This example doesn't cache non-pre-cached items dynamically to keep it simple.
          return networkResponse;
        }).catch(error => {
          console.warn(`[Service Worker] Fetch failed for non-navigate asset: ${event.request.url}`, error);
          // Optionally return a placeholder for images if fetch fails
          // if (event.request.destination === 'image') {
          //   return caches.match('/path/to/placeholder-image.png');
          // }
        });
      })
    );
  }
  // For other types of requests, just fetch from network (default browser behavior)
});

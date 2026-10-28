/* =========================================================================
 * Service Worker — Taha Ahmed Hodhod Portfolio & Admin Dashboard
 * Precaches core shell assets, enforces Network-First for HTML navigation,
 * strictly enforces Network-Only for Supabase/API requests, and isolates caches.
 * ========================================================================= */

// Stamped at build time by Vite build hook in dist/sw.js
const BUILD_ID = '__SW_BUILD_ID__';
const CACHE_NAME = `taha-portfolio-v${BUILD_ID}`;
const ASSETS_CACHE = `taha-portfolio-assets-v${BUILD_ID}`;
const IMAGE_CACHE = `taha-portfolio-images-v${BUILD_ID}`;

// Precache list for core offline app shell
const PRECACHE_URLS = [
  '/offline.html',
  '/favicon.png',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.webmanifest'
];

/* -------------------------------------------------------------------------
 * Install Event: Precache static shell assets
 * ------------------------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Do NOT force self.skipWaiting() here: wait for user click in UI
});

/* -------------------------------------------------------------------------
 * Activate Event: Clean up outdated caches from older deployments
 * ------------------------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([CACHE_NAME, ASSETS_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!allowedCaches.has(key)) {
            return caches.delete(key);
          }
          return null;
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/* -------------------------------------------------------------------------
 * Message Event: Listen for SKIP_WAITING from the UI update prompt
 * ------------------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* -------------------------------------------------------------------------
 * Fetch Event: Request routing & caching strategy
 * ------------------------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL SECURITY: Never cache Supabase, /api/*, or authenticated requests
  const isSupabase = url.hostname.includes('supabase.co');
  const isApi = url.pathname.startsWith('/api/');
  const hasAuthHeader = request.headers.has('Authorization') || request.headers.has('apikey');

  if (isSupabase || isApi || hasAuthHeader) {
    // Strictly network-only, bypass Service Worker cache entirely
    return;
  }

  // 3. Navigation requests (HTML documents)
  // Must be Network-First to never serve stale HTML pointing to deleted hashed chunks.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // 4. Same-origin static assets
  if (url.origin === self.location.origin) {
    // Hashed build assets (/assets/*) are immutable: Cache-First
    if (url.pathname.startsWith('/assets/')) {
      event.respondWith(
        caches.open(ASSETS_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            });
          });
        })
      );
      return;
    }

    // Local static images: Stale-While-Revalidate
    const isImage = /\.(?:png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname);
    if (isImage) {
      event.respondWith(
        caches.open(IMAGE_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                if (networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
          });
        })
      );
      return;
    }
  }

  // All other requests pass through to the network naturally
});

/* -------------------------------------------------------------------------
 * Push Notifications (Reserved for future implementation)
 * ------------------------------------------------------------------------- */
// self.addEventListener('push', (event) => {
//   // Future push notification handler
// });
// self.addEventListener('notificationclick', (event) => {
//   // Future notification click handler
// });


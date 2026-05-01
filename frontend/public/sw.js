/**
 * Service Worker for offline support and performance optimization
 * Place this file in public/sw.js
 */

const CACHE_NAME = 'softlearn-v1'
const RUNTIME_CACHE = 'softlearn-runtime-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
]

// Install event: cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return
  }

  // API requests: network first, fallback to offline response
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            // Store successful API responses in runtime cache
            const cache = caches.open(RUNTIME_CACHE)
            cache.then(c => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Return cached response or offline fallback
          return caches
            .match(request)
            .then(response => response || new Response(
              JSON.stringify({ error: 'Offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            ))
        })
    )
  }

  // Static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response
      }
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }
        // Cache successful responses
        const responseToCache = response.clone()
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, responseToCache)
        })
        return response
      })
    }).catch(() => {
      // Return a offline fallback if available
      return caches.match('/offline.html') || new Response('Offline')
    })
  )
})

// Message event: handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

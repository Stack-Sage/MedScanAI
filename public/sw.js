const CACHE_NAME = 'medscan-cache-v1';
const CORE_ASSETS = [
  '/',
  '/results',
  '/manifest.json',
  '/icons/logo.svg',
  '/icons/logo-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      // Network first for fresh content
      const network = await fetch(request);
      // Update cache in background
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, network.clone());
      return network;
    } catch {
      // Fallback to cache
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      // Last resort: offline fallback for document
      if (request.destination === 'document') {
        return caches.match('/');
      }
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});

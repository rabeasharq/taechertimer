const CACHE_NAME = 'teacher-time-cache-v1';
const STATIC_CACHE = 'teacher-time-static-v1';
const DYNAMIC_CACHE = 'teacher-time-dynamic-v1';

// ملفات التطبيق (يجب أن تتطابق بالضبط مع GitHub Pages)
const STATIC_ASSETS = [
  '/taechertimer/',
  '/taechertimer/index.html',
  '/taechertimer/style.css',
  '/taechertimer/app.js',
  '/taechertimer/manifest.json',
  '/taechertimer/assets/icons/icon-72x72.png',
  '/taechertimer/assets/icons/icon-192x192.png',
  '/taechertimer/assets/icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(cache)) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// جلب الملفات (Cache First ثم Network)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/taechertimer/index.html');
          }
        });
    })
  );
});

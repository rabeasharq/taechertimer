const CACHE_NAME = 'teacher-timer-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/schedule.js',
  './js/timer.js',
  './js/pwa.js',
  './manifest.json',
  './assets/icons/icon-72x72.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Install Completed');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing Old Cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Activate Completed');
      return self.clients.claim();
    })
  );
});

// fetch الأحداث
self.addEventListener('fetch', function(event) {
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // وجد في الكاش
        if (response) {
          console.log('Service Worker: Serving from Cache', event.request.url);
          return response;
        }
        
        // لا يوجد في الكاش، جلب من الشبكة
        console.log('Service Worker: Fetching from Network', event.request.url);
        return fetch(event.request).then(function(networkResponse) {
          // إذا كان الاستجابة ناجحة، قم بتخزينها في الكاش
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(function(error) {
          console.log('Service Worker: Fetch Failed', error);
          // يمكنك إرجاع صفحة بديلة هنا
        });
      }
    )
  );
});

// استقبال الإشعارات
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push Received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body || 'تنبيه من تطبيق توقيت المعلم',
    icon: './assets/icons/icon-192x192.png',
    badge: './assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'تطبيق توقيت المعلم', options)
  );
});

// النقر على الإشعارات
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification Click');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === './' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

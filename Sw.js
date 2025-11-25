// Service Worker المتقدم - Teacher Time
const CACHE_NAME = 'teacher-time-v2.0.0';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// الموارد الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/taechertime/',
  '/taechertime/index.html',
  '/taechertime/style.css',
  '/taechertime/app.js',
  '/taechertime/manifest.json',
  '/taechertime/assets/icons/icon-72x72.png',
  '/taechertime/assets/icons/icon-192x192.png',
  '/taechertime/assets/icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => {
          console.log('✅ Static cache opened');
          return cache.addAll(STATIC_ASSETS);
        }),
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('✅ App cache opened');
          return cache.addAll(STATIC_ASSETS);
        })
    ]).then(() => {
      console.log('🎉 All resources cached');
      return self.skipWaiting();
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// استراتيجية التخزين: Cache First with Network Fallback
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات غير HTTP
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // إذا كان المورد موجود في الذاكرة المؤقتة
        if (cachedResponse) {
          console.log('📦 Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // إذا لم يكن موجود، حمله من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // تأكد من أن الرد صالح للتخزين
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // استنساخ الرد لأنه يمكن قراءته مرة واحدة فقط
            const responseToCache = networkResponse.clone();

            // تخزين المورد الجديد في الذاكرة المؤقتة الديناميكية
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('💾 Cached new resource:', event.request.url);
              });

            return networkResponse;
          })
          .catch(() => {
            // fallback للصفحة الرئيسية في حالة عدم وجود اتصال
            if (event.request.destination === 'document') {
              return caches.match('/taechertime/');
            }
          });
      })
  );
});

// Background Sync للتحديثات
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Periodic Sync (للتحديثات الدورية)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    console.log('🔄 Periodic sync triggered');
    event.waitUntil(updateContent());
  }
});

// دالة المزامنة في الخلفية
async function doBackgroundSync() {
  try {
    // هنا يمكنك إضافة منطق المزامنة
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// دالة تحديث المحتوى
async function updateContent() {
  try {
    // تحديث المحتوى الديناميكي
    console.log('✅ Content update completed');
  } catch (error) {
    console.error('❌ Content update failed:', error);
  }
}

// معالجة Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'إشعار من Teacher Time',
    icon: '/taechertime/assets/icons/icon-192x192.png',
    badge: '/taechertime/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/taechertime/'
    },
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Teacher Time', options)
  );
});

// معالجة نقرات الإشعارات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/taechertime/');
        }
      })
    );
  }
});

